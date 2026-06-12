import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionPago } from './entities/configuracion-pago.entity';

const PASARELAS_DISPONIBLES = [
  {
    codigo: 'transferencia',
    nombre: 'Transferencia bancaria',
    descripcion: 'Cobra mediante depósito o transferencia a tus cuentas.',
    tipo: 'manual',
  },
  {
    codigo: 'yape',
    nombre: 'Yape',
    descripcion: 'Pagos rápidos por celular con código QR.',
    tipo: 'manual',
  },
  {
    codigo: 'mercadopago',
    nombre: 'MercadoPago',
    descripcion: 'Cobra con tarjetas, transferencias y dinero en cuenta MercadoPago.',
    tipo: 'online',
  },
  {
    codigo: 'paypal',
    nombre: 'PayPal',
    descripcion: 'Pagos internacionales con cuentas PayPal y tarjetas.',
    tipo: 'online',
  },
  {
    codigo: 'izipay',
    nombre: 'Izipay',
    descripcion: 'Pasarela líder en Perú. Acepta tarjetas, Yape y Plin.',
    tipo: 'online',
  },
];

const PASARELAS_UNICAS = ['yape', 'mercadopago', 'paypal', 'izipay'];

@Injectable()
export class ConfiguracionPagoService {
  constructor(
    @InjectRepository(ConfiguracionPago)
    private readonly configRepo: Repository<ConfiguracionPago>,
  ) {}

  private normalizarPasarela(pasarela: string) {
    return pasarela.trim().toLowerCase();
  }

  async listarPasarelas() {
    const configuraciones = await this.configRepo.find({
      order: { id: 'ASC' },
    });

    return PASARELAS_DISPONIBLES.map((pasarela) => {
      if (pasarela.codigo === 'transferencia') {
        const cuentas = configuraciones.filter(
          (config) => config.pasarela === 'transferencia',
        );

        return {
          ...pasarela,
          activa: cuentas.some((cuenta) => cuenta.activa),
          configurada: cuentas.length > 0,
          cantidadCuentas: cuentas.length,
        };
      }

      const config = configuraciones.find(
        (item) => item.pasarela === pasarela.codigo,
      );

      return {
        ...pasarela,
        activa: config?.activa ?? false,
        configurada: !!config,
        entorno: config?.entorno ?? 'produccion',
      };
    });
  }

  async obtenerConfiguracion(pasarela: string) {
    const codigo = this.normalizarPasarela(pasarela);

    if (codigo === 'transferencia') {
      const cuentas = await this.listarCuentasBancarias();

      return {
        pasarela: 'transferencia',
        activa: cuentas.some((cuenta) => cuenta.activa),
        configurada: cuentas.length > 0,
        cuentas,
      };
    }

    if (!PASARELAS_UNICAS.includes(codigo)) {
      throw new BadRequestException('Pasarela no válida');
    }

    const config = await this.configRepo.findOne({
      where: { pasarela: codigo },
    });

    if (!config) {
      return {
        pasarela: codigo,
        activa: false,
        entorno: 'produccion',
        configurada: false,
        credenciales: {},
      };
    }

    return {
      ...config,
      configurada: true,
    };
  }

  async guardarPasarela(pasarela: string, data: any) {
    const codigo = this.normalizarPasarela(pasarela);

    if (codigo === 'transferencia') {
      throw new BadRequestException(
        'Para transferencia bancaria usa los endpoints de cuentas bancarias',
      );
    }

    if (!PASARELAS_UNICAS.includes(codigo)) {
      throw new BadRequestException('Pasarela no válida');
    }

    let config = await this.configRepo.findOne({
      where: { pasarela: codigo },
    });

    if (!config) {
      config = this.configRepo.create({
        pasarela: codigo,
        credenciales: {},
        activa: false,
        entorno: 'produccion',
      });
    }

    config.credenciales = data.credenciales ?? {};
    config.activa = data.activa ?? config.activa ?? false;
    config.entorno = data.entorno || config.entorno || 'produccion';

    return await this.configRepo.save(config);
  }

  async listarCuentasBancarias() {
    return await this.configRepo.find({
      where: { pasarela: 'transferencia' },
      order: { id: 'ASC' },
    });
  }

  async agregarCuentaBancaria(data: any) {
    const credenciales = data.credenciales ?? {
      banco: data.banco,
      tipo_cuenta: data.tipo_cuenta,
      moneda: data.moneda,
      titular: data.titular,
      numero_cuenta: data.numero_cuenta,
      cci: data.cci,
      instrucciones: data.instrucciones,
    };

    if (!credenciales.banco) {
      throw new BadRequestException('El banco es obligatorio');
    }

    if (!credenciales.titular) {
      throw new BadRequestException('El titular es obligatorio');
    }

    if (!credenciales.numero_cuenta && !credenciales.cci) {
      throw new BadRequestException(
        'Debe ingresar número de cuenta o CCI',
      );
    }

    const nuevaCuenta = this.configRepo.create({
      pasarela: 'transferencia',
      credenciales,
      activa: data.activa ?? true,
      entorno: data.entorno || 'produccion',
    });

    return await this.configRepo.save(nuevaCuenta);
  }

  async actualizarCuentaBancaria(id: number, data: any) {
    const cuenta = await this.configRepo.findOne({
      where: { id, pasarela: 'transferencia' },
    });

    if (!cuenta) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }

    const { activa, entorno, credenciales, ...camposDirectos } = data;

    const nuevasCredenciales = credenciales ?? camposDirectos;

    cuenta.credenciales = {
      ...(cuenta.credenciales ?? {}),
      ...nuevasCredenciales,
    };

    if (activa !== undefined) {
      cuenta.activa = activa;
    }

    if (entorno) {
      cuenta.entorno = entorno;
    }

    return await this.configRepo.save(cuenta);
  }

  async eliminarCuentaBancaria(id: number) {
    const cuenta = await this.configRepo.findOne({
      where: { id, pasarela: 'transferencia' },
    });

    if (!cuenta) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }

    await this.configRepo.remove(cuenta);

    return {
      ok: true,
      message: 'Cuenta bancaria eliminada correctamente',
    };
  }
}