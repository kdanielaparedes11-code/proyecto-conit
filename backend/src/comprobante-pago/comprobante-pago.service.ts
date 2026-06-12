import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { ComprobantePago } from './entities/comprobante-pago.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Matricula } from '../matricula/entities/matricula.entity';
import { ConfiguracionPago } from '../pago/entities/configuracion-pago.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ComprobantePagoService {
  constructor(
    @InjectRepository(ComprobantePago)
    private readonly comprobanteRepo: Repository<ComprobantePago>,

    @InjectRepository(Alumno)
    private readonly alumnoRepo: Repository<Alumno>,

    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,

    @InjectRepository(Matricula)
    private readonly matriculaRepo: Repository<Matricula>,

    @InjectRepository(ConfiguracionPago)
    private readonly configuracionPagoRepo: Repository<ConfiguracionPago>,

    private readonly s3Service: S3Service,
  ) {}

  private generarSerie(nombreCurso: string): string {
    const base = String(nombreCurso || 'CUR')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 3)
      .toUpperCase()
      .padEnd(3, 'X');

    const correlativo = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');

    return `${base}${correlativo}`;
  }

  private validarArchivoVoucher(file: any) {
    if (!file) {
      throw new BadRequestException('Debes subir el voucher de pago');
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      throw new BadRequestException(
        'El voucher debe ser una imagen JPG, PNG, WEBP o PDF',
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException('El voucher no debe superar los 5 MB');
    }
  }

  async crearSolicitudTransferencia(body: any, file: any) {
    this.validarArchivoVoucher(file);

    const idalumno = Number(body.idalumno);
    const idgrupo = Number(body.idgrupo);
    const idConfiguracionPago = body.id_configuracion_pago
      ? Number(body.id_configuracion_pago)
      : null;

    const monto = Number(body.monto);
    const numeroOperacion = String(body.numero_operacion || '').trim();

    if (!idalumno) {
      throw new BadRequestException('El alumno es obligatorio');
    }

    if (!idgrupo) {
      throw new BadRequestException('El grupo es obligatorio');
    }

    if (!monto || monto <= 0) {
      throw new BadRequestException('El monto es inválido');
    }

    if (!numeroOperacion) {
      throw new BadRequestException('El número de operación es obligatorio');
    }

    const alumno = await this.alumnoRepo.findOne({
      where: { id: idalumno },
    });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const grupo = await this.grupoRepo.findOne({
      where: { id: idgrupo },
      relations: ['curso'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    const matriculaExistente = await this.matriculaRepo.findOne({
      where: {
        alumno: { id: idalumno },
        grupo: { id: idgrupo },
      },
    });

    if (matriculaExistente) {
      throw new BadRequestException('El alumno ya está matriculado en este grupo');
    }

    let configuracionPago: ConfiguracionPago | null = null;

    if (idConfiguracionPago) {
      configuracionPago = await this.configuracionPagoRepo.findOne({
        where: { id: idConfiguracionPago, pasarela: 'transferencia' },
      });

      if (!configuracionPago) {
        throw new NotFoundException('Cuenta bancaria no encontrada');
      }
    }

    const extension = file.originalname?.split('.').pop() || 'bin';
    const key = `comprobantes-pago/${idalumno}/${Date.now()}-${randomUUID()}.${extension}`;

    await this.s3Service.uploadBuffer({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const comprobante = this.comprobanteRepo.create({
      alumno,
      grupo,
      configuracionPago: configuracionPago || undefined,
      metodo_pago: 'transferencia',
      monto,
      moneda: body.moneda || 'PEN',
      numero_operacion: numeroOperacion,
      fecha_pago: body.fecha_pago ? new Date(body.fecha_pago) : null,
      voucher_key: key,
      voucher_nombre_archivo: file.originalname,
      voucher_mime_type: file.mimetype,
      voucher_tamano_bytes: file.size,
      estado: 'PENDIENTE',
      observacion_alumno: body.observacion_alumno || null,
      created_at: new Date(),
    });

    return await this.comprobanteRepo.save(comprobante);
  }

  async listarAdmin(estado?: string) {
    const qb = this.comprobanteRepo
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect('comprobante.alumno', 'alumno')
      .leftJoinAndSelect('comprobante.grupo', 'grupo')
      .leftJoinAndSelect('grupo.curso', 'curso')
      .leftJoinAndSelect('comprobante.configuracionPago', 'configuracionPago')
      .leftJoinAndSelect('comprobante.matricula', 'matricula')
      .orderBy('comprobante.created_at', 'DESC');

    if (estado && estado !== 'TODOS') {
      qb.where('comprobante.estado = :estado', {
        estado: estado.toUpperCase(),
      });
    }

    const comprobantes = await qb.getMany();

    return comprobantes.map((item) => ({
      id: item.id,
      alumno: item.alumno
        ? {
            id: item.alumno.id,
            nombre: item.alumno.nombre,
            apellido: item.alumno.apellido,
            correo: item.alumno.correo,
            documento: item.alumno.numdocumento,
          }
        : null,
      grupo: item.grupo
        ? {
            id: item.grupo.id,
            nombregrupo: item.grupo.nombregrupo,
            curso: item.grupo.curso?.nombrecurso || 'Curso',
          }
        : null,
      metodo_pago: item.metodo_pago,
      cuenta_destino: item.configuracionPago?.credenciales || null,
      monto: item.monto,
      moneda: item.moneda,
      numero_operacion: item.numero_operacion,
      fecha_pago: item.fecha_pago,
      estado: item.estado,
      observacion_alumno: item.observacion_alumno,
      observacion_admin: item.observacion_admin,
      idmatricula: item.matricula?.id || null,
      created_at: item.created_at,
    }));
  }

  async obtenerDetalleAdmin(id: number) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { id },
      relations: [
        'alumno',
        'grupo',
        'grupo.curso',
        'configuracionPago',
        'matricula',
      ],
    });

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    const voucherUrl = await this.s3Service.createDownloadUrl(
      comprobante.voucher_key,
    );

    return {
      ...comprobante,
      voucher_url_temporal: voucherUrl,
    };
  }

  async obtenerVoucherUrl(id: number) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { id },
    });

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    const url = await this.s3Service.createDownloadUrl(comprobante.voucher_key);

    return { url };
  }

  async aprobarYMatricular(id: number, body: any) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { id },
      relations: ['alumno', 'grupo', 'grupo.curso', 'matricula'],
    });

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    if (comprobante.estado === 'APROBADO') {
      throw new BadRequestException('Este comprobante ya fue aprobado');
    }

    if (comprobante.estado === 'RECHAZADO') {
      throw new BadRequestException('No puedes aprobar un comprobante rechazado');
    }

    const matriculaExistente = await this.matriculaRepo.findOne({
      where: {
        alumno: { id: comprobante.alumno.id },
        grupo: { id: comprobante.grupo.id },
      },
    });

    if (matriculaExistente) {
      comprobante.estado = 'APROBADO';
      comprobante.matricula = matriculaExistente;
      comprobante.observacion_admin =
        body.observacion_admin || 'Alumno ya contaba con matrícula';
      comprobante.idadministrador_revision =
        body.idadministrador_revision || null;
      comprobante.fecha_revision = new Date();
      comprobante.updated_at = new Date();

      return await this.comprobanteRepo.save(comprobante);
    }

    const nombreCurso = comprobante.grupo.curso?.nombrecurso || 'Curso';

    const matricula = this.matriculaRepo.create({
      alumno: { id: comprobante.alumno.id } as Alumno,
      grupo: { id: comprobante.grupo.id } as Grupo,
      estado: 'ACTIVO',
      observacion: `Matrícula aprobada por comprobante de pago - ${nombreCurso}`,
      serie: this.generarSerie(nombreCurso),
      beneficio: 'NINGUNO',
      pacademico: '',
      precio: comprobante.monto,
      created_at: new Date(),
      puede_ver_certificado: false,
      puede_descargar_certificado: false,
    });

    const matriculaGuardada = await this.matriculaRepo.save(matricula);

    await this.matriculaRepo.query(
      `
      INSERT INTO pago (
        fechapago,
        igv,
        precioinicial,
        preciofinal,
        preciodescuento,
        tipopago,
        descripcion,
        estado,
        matricula_id,
        codigo_aprobacion
      )
      VALUES (
        CURRENT_DATE,
        0,
        $1,
        $1,
        0,
        $2,
        'Pago aprobado desde comprobante/voucher',
        'PAGADO',
        $3,
        $4
      )
      `,
      [
        comprobante.monto,
        comprobante.metodo_pago,
        matriculaGuardada.id,
        comprobante.numero_operacion,
      ],
    );

    comprobante.estado = 'APROBADO';
    comprobante.matricula = matriculaGuardada;
    comprobante.observacion_admin =
      body.observacion_admin || 'Pago aprobado y matrícula activada';
    comprobante.idadministrador_revision =
      body.idadministrador_revision || null;
    comprobante.fecha_revision = new Date();
    comprobante.updated_at = new Date();

    return await this.comprobanteRepo.save(comprobante);
  }

  async rechazar(id: number, body: any) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { id },
    });

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    if (comprobante.estado === 'APROBADO') {
      throw new BadRequestException('No puedes rechazar un comprobante aprobado');
    }

    comprobante.estado = 'RECHAZADO';
    comprobante.observacion_admin =
      body.observacion_admin || 'Comprobante rechazado';
    comprobante.idadministrador_revision =
      body.idadministrador_revision || null;
    comprobante.fecha_revision = new Date();
    comprobante.updated_at = new Date();

    return await this.comprobanteRepo.save(comprobante);
  }

  async observar(id: number, body: any) {
    const comprobante = await this.comprobanteRepo.findOne({
      where: { id },
    });

    if (!comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    if (comprobante.estado === 'APROBADO') {
      throw new BadRequestException('No puedes observar un comprobante aprobado');
    }

    comprobante.estado = 'OBSERVADO';
    comprobante.observacion_admin =
      body.observacion_admin || 'Comprobante observado';
    comprobante.idadministrador_revision =
      body.idadministrador_revision || null;
    comprobante.fecha_revision = new Date();
    comprobante.updated_at = new Date();

    return await this.comprobanteRepo.save(comprobante);
  }
}