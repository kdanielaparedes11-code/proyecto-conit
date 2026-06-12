import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';


import { Matricula } from './entities/matricula.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { MailService } from '../mail/mail.service';

type EstadoPreviewMatricula =
  | 'VALIDO'
  | 'EXISTE'
  | 'YA_MATRICULADO'
  | 'ERROR';

type FilaPreviewMatricula = {
  fila: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  metodo_pago: string;
  numero_operacion: string;
  monto: number;
  estado: EstadoPreviewMatricula;
  observacion: string;
};

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(Matricula)
    private matriculaRepo: Repository<Matricula>,

    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,

    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,

    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,

    private readonly mailService: MailService,
  ) {}

  async crear(alumnoId: number, grupoId: number, nombreCurso: string) {
    // 🔍 Validar duplicado
    const existe = await this.matriculaRepo.findOne({
      where: {
        alumno: { id: alumnoId },
        grupo: { id: grupoId },
      },
    });

    if (existe) {
      throw new BadRequestException('Ya estás matriculado en este grupo');
    }

    // 🔢 Generar serie
    const prefijo = nombreCurso.slice(0, 3).toUpperCase();
    const correlativo = Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, '0');
    const serieGenerada = prefijo + correlativo;

    // 💾 Guardar matrícula
    const matricula = await this.matriculaRepo.save({
      alumno: { id: alumnoId },
      grupo: { id: grupoId },
      estado: 'pendiente',
      observacion: `Matrícula de ${nombreCurso}`,
      serie: serieGenerada,
      beneficio: 'NINGUNO',
      pacademico: '',
      idadministrador: 1,
      idcertificado: 1,
      idcontrolacademico: 1,
    });

    // 📧 Enviar correo de bienvenida
    try {
      const alumno = await this.alumnoRepo.findOne({
        where: { id: alumnoId },
      });

      if (alumno?.idusuario) {
        const usuario = await this.usuarioRepo.findOne({
          where: { id: alumno.idusuario },
        });

        if (usuario?.emailVerificado) {
          await this.mailService.sendBienvenidaAlumno(
            alumno.nombre || 'Alumno',
            usuario.correo,
            nombreCurso,
          );
        }
      }
    } catch (error) {
      console.error(
        'No se pudo enviar el correo de bienvenida de matrícula',
        error,
      );
    }

    return matricula;
  }

  async findByAlumno(idalumno: number) {
    return await this.matriculaRepo.find({
      where: {
        alumno: { id: idalumno },
      },
      relations: ['grupo'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  // Función para listar alumnos por curso
  async obtenerAlumnosPorCurso(idcurso: number) {
    const matriculas = await this.matriculaRepo.find({
      where: {
        grupo: {
          curso: { id: idcurso },
        },
      },
      relations: ['alumno', 'grupo'],
    });

    return matriculas
      .filter((m) => m.alumno != null)
      .map((m) => ({
        ...m.alumno,
        idmatricula: m.id,
        grupo_asignado: m.grupo ? m.grupo.nombregrupo : 'Sin grupo',
      }));
  }

  async actualizarPermisosCertificado(
    idMatricula: number,
    puedeVer: boolean,
    puedeDescargar: boolean,
  ) {
    const matricula = await this.matriculaRepo.findOne({
      where: { id: idMatricula },
    });

    if (!matricula) throw new BadRequestException('Matrícula no encontrada');

    matricula.puede_ver_certificado = puedeVer;
    matricula.puede_descargar_certificado = puedeDescargar;

    // Validar lógicamente: si no puede ver, no puede descargar
    if (!puedeVer) {
      matricula.puede_descargar_certificado = false;
    }

    await this.matriculaRepo.save(matricula);

    return { message: 'Permisos de certificado actualizados correctamente' };
  }

    private limpiarTexto(valor: any): string {
      return String(valor ?? '').trim();
    }

    private normalizarCorreo(valor: any): string {
      return this.limpiarTexto(valor).toLowerCase();
    }

    private normalizarDni(valor: any): string {
      return this.limpiarTexto(valor).replace(/\s+/g, '');
    }

    private correoValido(correo: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    }

    private generarPasswordTemporal(dni: string): string {
      const random = randomBytes(3).toString('hex');
      return `Conit${dni.slice(-4) || '2026'}${random}`;
    }

    private generarSerie(nombreCurso: string): string {
      const base = this.limpiarTexto(nombreCurso || 'CUR')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 3)
        .toUpperCase()
        .padEnd(3, 'X');

      const correlativo = Math.floor(Math.random() * 999999)
        .toString()
        .padStart(6, '0');

      return `${base}${correlativo}`;
    }

    private async buscarUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
      if (!correo) return null;

      return this.usuarioRepo
        .createQueryBuilder('usuario')
        .where('LOWER(usuario.correo) = :correo', {
          correo: correo.toLowerCase(),
        })
        .orderBy('usuario.id', 'ASC')
        .getOne();
    }

    private async buscarAlumnoPorDniOCorreo(
      dni: string,
      correo: string,
    ): Promise<Alumno | null> {
      const qb = this.alumnoRepo
        .createQueryBuilder('alumno')
        .leftJoinAndSelect('alumno.usuario', 'usuario');

      let tieneWhere = false;

      if (dni) {
        qb.where('alumno.numdocumento = :dni', { dni });
        tieneWhere = true;
      }

      if (correo) {
        if (tieneWhere) {
          qb.orWhere('LOWER(alumno.correo) = :correo', {
            correo: correo.toLowerCase(),
          });
        } else {
          qb.where('LOWER(alumno.correo) = :correo', {
            correo: correo.toLowerCase(),
          });
        }
      }

      return qb.orderBy('alumno.id', 'ASC').getOne();
    }

    private async buscarMatriculaExistente(
      alumnoId: number,
      grupoId: number,
    ): Promise<Matricula | null> {
      return this.matriculaRepo.findOne({
        where: {
          alumno: { id: alumnoId },
          grupo: { id: grupoId },
        },
      });
    }

    async previsualizarMatriculaMasiva(idgrupo: number, alumnos: any[]) {
      const grupo = await this.grupoRepo.findOne({
        where: { id: idgrupo },
        relations: ['curso'],
      });

      if (!grupo) {
        throw new NotFoundException('Grupo no encontrado');
      }

      if (!Array.isArray(alumnos) || alumnos.length === 0) {
        throw new BadRequestException('Debes enviar al menos un alumno');
      }

      const vistosDni = new Set<string>();
      const vistosCorreo = new Set<string>();
      const filas: FilaPreviewMatricula[] = [];

      for (let i = 0; i < alumnos.length; i++) {
        const item = alumnos[i];

        const dni = this.normalizarDni(
          item.dni ?? item.DNI ?? item.documento ?? item.numdocumento,
        );

        const nombres = this.limpiarTexto(
          item.nombres ?? item.nombre ?? item.Nombres ?? item.Nombre,
        );

        const apellidos = this.limpiarTexto(
          item.apellidos ?? item.apellido ?? item.Apellidos ?? item.Apellido,
        );

        const correo = this.normalizarCorreo(
          item.correo ?? item.email ?? item.Correo ?? item.Email,
        );

        const metodo_pago = this.limpiarTexto(
          item.metodo_pago ?? item.metodo ?? item.tipopago,
        );

        const numero_operacion = this.limpiarTexto(
          item.numero_operacion ??
            item.operacion ??
            item.codigo_operacion,
        );

        const monto = Number(
          item.monto_pagado ??
          item.monto ??
          item.precio ??
          0,
        );

        const errores: string[] = [];

        if (!dni) errores.push('Falta DNI');
        if (!nombres) errores.push('Faltan nombres');
        if (!apellidos) errores.push('Faltan apellidos');
        if (!correo) errores.push('Falta correo');
        if (!metodo_pago) errores.push('Falta método de pago');
        if (!numero_operacion)
          errores.push('Falta número de operación');
        if (!monto || monto <= 0)
          errores.push('Monto inválido');
        if (correo && !this.correoValido(correo)) errores.push('Correo inválido');

        if (dni && vistosDni.has(dni)) errores.push('DNI repetido en el Excel');
        if (correo && vistosCorreo.has(correo)) {
          errores.push('Correo repetido en el Excel');
        }

        if (dni) vistosDni.add(dni);
        if (correo) vistosCorreo.add(correo);

        let estado: EstadoPreviewMatricula = 'VALIDO';
        let observacion = 'Listo para matricular';

        if (errores.length > 0) {
          estado = 'ERROR';
          observacion = errores.join(', ');
        } else {
          const alumnoExistente = await this.buscarAlumnoPorDniOCorreo(
            dni,
            correo,
          );

          const usuarioExistente = await this.buscarUsuarioPorCorreo(correo);

          if (
            usuarioExistente &&
            usuarioExistente.rol !== 'ALUMNO' &&
            !alumnoExistente
          ) {
            estado = 'ERROR';
            observacion = `El correo ya pertenece a un usuario con rol ${usuarioExistente.rol}`;
          } else if (alumnoExistente) {
            const matriculaExistente = await this.buscarMatriculaExistente(
              alumnoExistente.id,
              idgrupo,
            );

            if (matriculaExistente) {
              estado = 'YA_MATRICULADO';
              observacion = 'El alumno ya está matriculado en este grupo';
            } else {
              estado = 'EXISTE';
              observacion = 'Alumno existente, se agregará al grupo';
            }
          }
        }

        filas.push({
          fila: i + 2,
          dni,
          nombres,
          apellidos,
          correo,
          metodo_pago,
          numero_operacion,
          monto,
          estado,
          observacion,
        });
      }

      return {
        grupo: {
          id: grupo.id,
          nombregrupo: grupo.nombregrupo,
          curso: grupo.curso?.nombrecurso || 'Curso',
        },
        total: filas.length,
        validos: filas.filter((f) => f.estado === 'VALIDO').length,
        existentes: filas.filter((f) => f.estado === 'EXISTE').length,
        yaMatriculados: filas.filter((f) => f.estado === 'YA_MATRICULADO').length,
        errores: filas.filter((f) => f.estado === 'ERROR').length,
        matriculables: filas.filter(
          (f) => f.estado === 'VALIDO' || f.estado === 'EXISTE',
        ).length,
        filas,
      };
    }

    async confirmarMatriculaMasiva(idgrupo: number, alumnos: any[]) {
      const preview = await this.previsualizarMatriculaMasiva(idgrupo, alumnos);

      const filasConError = preview.filas.filter((f) => f.estado === 'ERROR');

      if (filasConError.length > 0) {
        throw new BadRequestException({
          message: 'Corrige los errores antes de confirmar la matrícula masiva',
          errores: filasConError,
        });
      }

      const grupo = await this.grupoRepo.findOne({
        where: { id: idgrupo },
        relations: ['curso'],
      });

      if (!grupo) {
        throw new NotFoundException('Grupo no encontrado');
      }

      const cursoNombre = grupo.curso?.nombrecurso || 'Curso';

      let creados = 0;
      let matriculados = 0;
      let omitidos = 0;

      const correosVerificacion: Array<{
        nombre: string;
        correo: string;
        token: string;
        usuario: string;
        contrasenia: string;
      }> = [];

      const filasProcesar = preview.filas.filter(
        (f) => f.estado === 'VALIDO' || f.estado === 'EXISTE',
      );

      for (const fila of filasProcesar) {
        let alumno = await this.buscarAlumnoPorDniOCorreo(fila.dni, fila.correo);
        let usuario = await this.buscarUsuarioPorCorreo(fila.correo);

        if (!usuario) {
          const passwordTemporal = this.generarPasswordTemporal(fila.dni);
          const hashedPassword = await bcrypt.hash(passwordTemporal, 10);
          const token = randomBytes(32).toString('hex');
          const expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);

          const nuevoUsuario = this.usuarioRepo.create({
            correo: fila.correo,
            contrasenia: hashedPassword,
            rol: 'ALUMNO',
            idempresa: 1,
            historialcontrasenias: [],
            estado: true,
            emailVerificado: false,
            tokenVerificacion: token,
            tokenVerificacionExpira: expiracion,
          });

          usuario = await this.usuarioRepo.save(nuevoUsuario);

          correosVerificacion.push({
            nombre: fila.nombres,
            correo: fila.correo,
            token,
            usuario: fila.correo,
            contrasenia: passwordTemporal,
          });
        }

        if (!usuario) {
          throw new BadRequestException(
            `No se pudo obtener o crear el usuario de la fila ${fila.fila}`,
          );
        }

        const usuarioSeguro = usuario;
        let alumnoSeguro: Alumno;

        if (!alumno) {
          const nuevoAlumno = this.alumnoRepo.create({
            nombre: fila.nombres,
            apellido: fila.apellidos,
            tipodocumento: 'DNI',
            telefono: '',
            direccion: '',
            correo: fila.correo,
            numdocumento: fila.dni,
            idusuario: usuarioSeguro.id,
            usuario: usuarioSeguro,
            nombre_editado: true,
            estado: true,
            lugar_residencia: '',
            departamento: '',
            provincia: '',
            distrito: '',
            estado_civil: '',
          });

          alumnoSeguro = await this.alumnoRepo.save(nuevoAlumno);
          creados++;
        } else {
          let debeGuardarAlumno = false;

          if (!alumno.idusuario) {
            alumno.idusuario = usuarioSeguro.id;
            alumno.usuario = usuarioSeguro;
            debeGuardarAlumno = true;
          }

          if (!alumno.nombre) {
            alumno.nombre = fila.nombres;
            debeGuardarAlumno = true;
          }

          if (!alumno.apellido) {
            alumno.apellido = fila.apellidos;
            debeGuardarAlumno = true;
          }

          if (!alumno.correo) {
            alumno.correo = fila.correo;
            debeGuardarAlumno = true;
          }

          if (!alumno.numdocumento) {
            alumno.numdocumento = fila.dni;
            debeGuardarAlumno = true;
          }

          alumnoSeguro = debeGuardarAlumno
            ? await this.alumnoRepo.save(alumno)
            : alumno;
        }

        const matriculaExistente = await this.buscarMatriculaExistente(
          alumnoSeguro.id,
          idgrupo,
        );

        if (matriculaExistente) {
          omitidos++;
          continue;
        }

        const matricula = this.matriculaRepo.create({
          alumno: { id: alumnoSeguro.id } as Alumno,
          grupo: { id: idgrupo } as Grupo,
          estado: 'ACTIVO',
          observacion: `Matrícula masiva - ${cursoNombre}`,
          serie: this.generarSerie(cursoNombre),
          beneficio: 'NINGUNO',
          pacademico: '',
          created_at: new Date(),
          puede_ver_certificado: false,
          puede_descargar_certificado: false,
        });

        await this.matriculaRepo.save(matricula);
        matriculados++;
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
            'Pago registrado desde matrícula masiva',
            'PAGADO',
            $3,
            $4
          )
          `,
          [
            fila.monto,
            fila.metodo_pago,
            matricula.id,
            fila.numero_operacion,
          ],
        );
      }

      for (const correo of correosVerificacion) {
        try {
          await this.mailService.sendEmailVerificacion(
            correo.nombre,
            correo.correo,
            correo.token,
            correo.usuario,
            correo.contrasenia,
          );
        } catch (error) {
          console.error('No se pudo enviar correo de verificación', error);
        }
      }

      return {
        message: 'Matrícula masiva procesada correctamente',
        total: preview.total,
        matriculables: preview.matriculables,
        creados,
        matriculados,
        omitidos,
        yaMatriculados: preview.yaMatriculados,
        errores: 0,
      };
    }
}
