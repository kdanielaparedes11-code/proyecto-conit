import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingProviderConfig } from './entities/meeting-provider-config.entity';
import { EncryptionService } from '../common/encryption.service';
import { CreateMeetingProviderConfigDto } from './dto/create-meeting-provider-config.dto';
import { UpdateMeetingProviderConfigDto } from './dto/update-meeting-provider-config.dto';

type MeetingProvider = 'google' | 'zoom' | 'teams';

@Injectable()
export class MeetingProviderConfigService {
  constructor(
    @InjectRepository(MeetingProviderConfig)
    private readonly repo: Repository<MeetingProviderConfig>,

    private readonly encryptionService: EncryptionService,
  ) {}

  private normalizarProvider(provider?: string): MeetingProvider {
    const value = String(provider || '').trim().toLowerCase();

    if (value === 'google' || value === 'zoom' || value === 'teams') {
      return value;
    }

    throw new BadRequestException('Proveedor de sesiones en vivo no válido.');
  }

  private toSafeResponse(config: MeetingProviderConfig) {
    return {
      id: config.id,
      idempresa: config.idempresa,
      provider: config.provider,
      nombre: config.nombre,
      activo: config.activo,
      predeterminado: config.predeterminado,
      authType: config.authType,
      settings: config.settings || {},
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
      tieneCredenciales: !!config.credentialsEncrypted,
    };
  }

  async listarPorEmpresa(idempresa: number) {
    const configs = await this.repo.find({
      where: { idempresa: Number(idempresa) },
      order: {
        predeterminado: 'DESC',
        activo: 'DESC',
        id: 'ASC',
      },
    });

    return configs.map((config) => this.toSafeResponse(config));
  }

  async obtenerRawPorId(id: number) {
    const config = await this.repo.findOne({
      where: { id: Number(id) },
    });

    if (!config) {
      throw new NotFoundException('No se encontró la configuración.');
    }

    return config;
  }

  async obtenerPorId(id: number) {
    const config = await this.obtenerRawPorId(id);
    return this.toSafeResponse(config);
  }

  async crear(dto: CreateMeetingProviderConfigDto) {
    if (!dto.idempresa) {
      throw new BadRequestException('La empresa es obligatoria.');
    }

    if (!dto.nombre?.trim()) {
      throw new BadRequestException('El nombre de la configuración es obligatorio.');
    }

    const provider = this.normalizarProvider(dto.provider);

    if (dto.predeterminado) {
      await this.repo.update(
        { idempresa: Number(dto.idempresa), predeterminado: true },
        { predeterminado: false, updatedAt: new Date() },
      );
    }

    const config = this.repo.create({
      idempresa: Number(dto.idempresa),
      provider,
      nombre: dto.nombre.trim(),
      activo: dto.activo ?? true,
      predeterminado: dto.predeterminado ?? false,
      authType: dto.authType || null,
      credentialsEncrypted: dto.credentials
        ? this.encryptionService.encryptJson(dto.credentials)
        : null,
      settings: dto.settings || {},
      updatedAt: new Date(),
    });

    const saved = await this.repo.save(config);
    return this.toSafeResponse(saved);
  }

  async actualizar(id: number, dto: UpdateMeetingProviderConfigDto) {
    const config = await this.obtenerRawPorId(id);

    if (dto.provider !== undefined) {
      config.provider = this.normalizarProvider(dto.provider);
    }

    if (dto.nombre !== undefined) {
      if (!dto.nombre?.trim()) {
        throw new BadRequestException('El nombre no puede estar vacío.');
      }

      config.nombre = dto.nombre.trim();
    }

    if (dto.activo !== undefined) {
      config.activo = Boolean(dto.activo);
    }

    if (dto.predeterminado !== undefined) {
      config.predeterminado = Boolean(dto.predeterminado);

      if (config.predeterminado) {
        await this.repo.update(
          { idempresa: config.idempresa, predeterminado: true },
          { predeterminado: false, updatedAt: new Date() },
        );
      }
    }

    if (dto.authType !== undefined) {
      config.authType = dto.authType || null;
    }

    if (dto.credentials !== undefined) {
      config.credentialsEncrypted = this.encryptionService.encryptJson(
        dto.credentials || {},
      );
    }

    if (dto.settings !== undefined) {
      config.settings = dto.settings || {};
    }

    config.updatedAt = new Date();

    const saved = await this.repo.save(config);
    return this.toSafeResponse(saved);
  }

  async eliminar(id: number) {
    const config = await this.obtenerRawPorId(id);
    await this.repo.delete(config.id);

    return {
      ok: true,
      message: 'Configuración eliminada correctamente.',
    };
  }

  async marcarPredeterminado(id: number) {
    const config = await this.obtenerRawPorId(id);

    await this.repo.update(
      { idempresa: config.idempresa, predeterminado: true },
      { predeterminado: false, updatedAt: new Date() },
    );

    config.predeterminado = true;
    config.activo = true;
    config.updatedAt = new Date();

    const saved = await this.repo.save(config);
    return this.toSafeResponse(saved);
  }

  async obtenerPredeterminadoPorEmpresa(idempresa: number) {
    const config = await this.repo.findOne({
      where: {
        idempresa: Number(idempresa),
        activo: true,
        predeterminado: true,
      },
    });

    if (!config) return null;

    return config;
  }

  async obtenerConfigParaCrearSesion(params: {
    idempresa: number;
    providerConfigId?: number | null;
  }) {
    let config: MeetingProviderConfig | null = null;

    if (params.providerConfigId) {
      config = await this.repo.findOne({
        where: {
          id: Number(params.providerConfigId),
          idempresa: Number(params.idempresa),
          activo: true,
        },
      });

      if (!config) {
        throw new NotFoundException(
          'La configuración seleccionada no existe o no está activa.',
        );
      }
    } else {
      config = await this.obtenerPredeterminadoPorEmpresa(params.idempresa);
    }

    if (!config) {
      return null;
    }

    const credentials = this.encryptionService.decryptJson(
      config.credentialsEncrypted,
    );

    return {
      config,
      credentials,
      safe: this.toSafeResponse(config),
    };
  }
}