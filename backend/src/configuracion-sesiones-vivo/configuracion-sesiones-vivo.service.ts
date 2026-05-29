import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConfiguracionSesionesVivo,
  ModoSeleccionProveedor,
} from './entities/configuracion-sesiones-vivo.entity';
import { UpdateConfiguracionSesionesVivoDto } from './dto/update-configuracion-sesiones-vivo.dto';

@Injectable()
export class ConfiguracionSesionesVivoService {
  constructor(
    @InjectRepository(ConfiguracionSesionesVivo)
    private readonly repo: Repository<ConfiguracionSesionesVivo>,
  ) {}

  private toResponse(config: ConfiguracionSesionesVivo) {
    return {
      id: config.id,
      idempresa: config.idempresa,
      modoSeleccionProveedor: config.modoSeleccionProveedor,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  async obtenerPorEmpresa(idempresa: number) {
    const empresaId = Number(idempresa);

    let config = await this.repo.findOne({
      where: { idempresa: empresaId },
    });

    if (!config) {
      config = this.repo.create({
        idempresa: empresaId,
        modoSeleccionProveedor: 'SOLO_PREDETERMINADO',
      });

      config = await this.repo.save(config);
    }

    return this.toResponse(config);
  }

  async actualizarPorEmpresa(
    idempresa: number,
    dto: UpdateConfiguracionSesionesVivoDto,
  ) {
    const empresaId = Number(idempresa);

    let config = await this.repo.findOne({
      where: { idempresa: empresaId },
    });

    if (!config) {
      config = this.repo.create({
        idempresa: empresaId,
        modoSeleccionProveedor:
          dto.modoSeleccionProveedor as ModoSeleccionProveedor,
      });
    } else {
      config.modoSeleccionProveedor =
        dto.modoSeleccionProveedor as ModoSeleccionProveedor;
    }

    const saved = await this.repo.save(config);
    return this.toResponse(saved);
  }

  async obtenerModoPorEmpresa(
    idempresa: number,
  ): Promise<ModoSeleccionProveedor> {
    const config = await this.repo.findOne({
      where: { idempresa: Number(idempresa) },
    });

    return config?.modoSeleccionProveedor || 'SOLO_PREDETERMINADO';
  }
}