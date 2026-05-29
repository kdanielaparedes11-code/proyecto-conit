import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // 👈 Se añadió 'In'
import { SesionVivo } from './entities/sesion-vivo.entity';
import { Curso } from '../curso/entities/curso.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { EmpresaService } from '../empresa/empresa.service';
import { MeetingProviderFactory } from '../meeting/meeting-provider.factory';
import {
  CreateMeetingInput,
  MeetingAccessType,
  MeetingProvider,
} from '../meeting/meeting-provider.interface';
import { SesionVivoResponseDto } from './dto/sesion-vivo-response.dto';
import { MeetingProviderConfigService } from '../meeting-provider-config/meeting-provider-config.service';
import { ConfiguracionSesionesVivoService, } from '../configuracion-sesiones-vivo/configuracion-sesiones-vivo.service';

@Injectable()
export class SesionVivoService {
  constructor(
    @InjectRepository(SesionVivo)
    private readonly sesionVivoRepository: Repository<SesionVivo>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,

    private readonly empresaService: EmpresaService,
    private readonly meetingProviderFactory: MeetingProviderFactory,
    private readonly meetingProviderConfigService: MeetingProviderConfigService,
    private readonly configuracionSesionesVivoService: ConfiguracionSesionesVivoService,
  ) {}

  private toResponseDto(sesion: SesionVivo): SesionVivoResponseDto {
    return {
      id: sesion.id,
      curso: sesion.curso
        ? {
            id: (sesion.curso as any).id,
            // Soporta si la columna se llama nombrecurso o simplemente nombre
            nombrecurso:
              (sesion.curso as any).nombrecurso || (sesion.curso as any).nombre,
          }
        : null,
      docente: (sesion as any).docente
        ? {
            nombre: (sesion as any).docente.nombre,
            apellido: (sesion as any).docente.apellido,
          }
        : null,
      titulo: sesion.titulo,
      descripcion: sesion.descripcion,
      fecha: sesion.fecha,
      duracion: sesion.duracion,
      link_reunion: sesion.link_reunion,
      provider: sesion.provider,
      external_meeting_id: sesion.external_meeting_id,
      estado: sesion.estado,
      idgrupo: sesion.idgrupo ?? null,
      provider_config_id: sesion.providerConfigId ?? null,
      access_type: sesion.access_type ?? 'RESTRICTED',
    };
  }

  private providerToLabel(provider?: string): string {
    const value = String(provider || 'google')
      .toLowerCase()
      .trim();

    if (value === 'google') return 'Google Meet';
    if (value === 'zoom') return 'Zoom';
    if (value === 'teams') return 'Microsoft Teams';

    return 'Google Meet';
  }

  private normalizarProvider(provider?: string): MeetingProvider {
    const valor = String(provider || 'google')
      .toLowerCase()
      .trim();

    if (valor === 'google' || valor === 'zoom' || valor === 'teams') {
      return valor;
    }

    throw new BadRequestException(
      `Proveedor de reuniones no válido: ${provider}`,
    );
  }

  private normalizarAccessType(accessType?: string): MeetingAccessType {
    const valor = String(accessType || 'RESTRICTED')
      .toUpperCase()
      .trim();

    if (valor === 'OPEN' || valor === 'TRUSTED' || valor === 'RESTRICTED') {
      return valor;
    }

    throw new BadRequestException(
      `Tipo de acceso de reunión no válido: ${accessType}`,
    );
  }

  private puedeElegirProveedor(
    modoSeleccionProveedor: string,
    rolUsuario?: string | null,
  ): boolean {
    const rol = String(rolUsuario || '').toUpperCase().trim();

    const esAdmin =
      rol === 'ADMIN' ||
      rol === 'ADMINISTRADOR' ||
      rol === 'SUPERADMIN';

    const esDocente = rol === 'DOCENTE';

    if (modoSeleccionProveedor === 'SOLO_PREDETERMINADO') {
      return false;
    }

    if (modoSeleccionProveedor === 'DOCENTE_PUEDE_ELEGIR') {
      return esDocente || esAdmin;
    }

    if (modoSeleccionProveedor === 'ADMIN_PUEDE_ELEGIR') {
      return esAdmin;
    }

    if (modoSeleccionProveedor === 'TODOS_PUEDEN_ELEGIR') {
      return esDocente || esAdmin;
    }

    return false;
  }

  private async obtenerGrupoConCurso(idgrupo: number): Promise<Grupo> {
    const grupo = await this.grupoRepository.findOne({
      where: { id: Number(idgrupo) },
      relations: ['curso', 'curso.empresa'],
    });

    if (!grupo) {
      throw new NotFoundException('Grupo no encontrado');
    }

    return grupo;
  }

  private async obtenerProviderDesdeGrupo(
    idgrupo: number,
  ): Promise<MeetingProvider> {
    const grupo = await this.obtenerGrupoConCurso(Number(idgrupo));
    const curso = (grupo as any).curso;

    if (!curso) {
      throw new NotFoundException('El grupo no tiene curso asociado');
    }

    if (curso.empresa?.meetingProvider) {
      return this.normalizarProvider(curso.empresa.meetingProvider);
    }

    if (curso.idempresa) {
      const provider = await this.empresaService.getMeetingProvider(
        Number(curso.idempresa),
      );
      return this.normalizarProvider(provider);
    }

    return 'google';
  }

  async obtenerSesiones(): Promise<SesionVivoResponseDto[]> {
    const sesiones = await this.sesionVivoRepository.find({
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });

    return sesiones.map((sesion) => this.toResponseDto(sesion));
  }

  async obtenerSesionesPorGrupo(
    idgrupo: number,
  ): Promise<SesionVivoResponseDto[]> {
    const sesiones = await this.sesionVivoRepository.find({
      where: {
        idgrupo: Number(idgrupo),
      } as any,
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });

    return sesiones.map((sesion) => this.toResponseDto(sesion));
  }

  async obtenerSesionesPorAlumno(
    idalumno: number,
  ): Promise<SesionVivoResponseDto[]> {
    const matriculas = await this.sesionVivoRepository.manager.query(
      `SELECT idgrupo FROM matricula WHERE idalumno = $1 AND estado = 'pagado'`,
      [idalumno],
    );

    const gruposIds = matriculas.map((m: any) => m.idgrupo).filter(Boolean);

    if (gruposIds.length === 0) {
      return [];
    }

    const sesiones = await this.sesionVivoRepository.find({
      where: { idgrupo: In(gruposIds) } as any,
      relations: ['curso'],
      order: { fecha: 'ASC' },
    });

    const gruposConRelaciones = await this.grupoRepository.find({
      where: { id: In(gruposIds) },
      relations: ['curso', 'docente'],
    });

    const mapaGrupos = new Map();
    gruposConRelaciones.forEach((g) => {
      mapaGrupos.set(g.id, g);
    });

    return sesiones.map((sesion) => {
      const grupoRel = mapaGrupos.get(sesion.idgrupo);
      if (grupoRel) {
        if (!sesion.curso && grupoRel.curso) {
          sesion.curso = grupoRel.curso as any;
        }

        if (grupoRel.docente) {
          (sesion as any).docente = grupoRel.docente;
        }
      }
      return this.toResponseDto(sesion);
    });
  }
  async obtenerProviderInfoPorGrupo(idgrupo: number) {
    const provider = await this.obtenerProviderDesdeGrupo(Number(idgrupo));

    return {
      provider,
      label: this.providerToLabel(provider),
    };
  }

  private async obtenerCorreosInvitadosGrupo(idgrupo: number): Promise<string[]> {
    const rows = await this.sesionVivoRepository.manager.query(
      `
      SELECT DISTINCT LOWER(TRIM(a.correo)) AS correo
      FROM matricula m
      INNER JOIN alumno a ON a.id = m.idalumno
      WHERE m.idgrupo = $1
        AND a.correo IS NOT NULL
        AND TRIM(a.correo) <> ''
        AND LOWER(COALESCE(m.estado, '')) IN ('pagado', 'activo', 'matriculado')
      `,
      [Number(idgrupo)],
    );

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return Array.from(
      new Set(
        (rows || [])
          .map((row: any) => String(row.correo || '').trim().toLowerCase())
          .filter((correo: string) => correoRegex.test(correo)),
      ),
    );
  }

  async crearSesion(payload: {
    idgrupo: number;
    titulo: string;
    descripcion?: string;
    fecha: string;
    duracion: number;
    accessType?: string;
    providerConfigId?: number | null;
    rolUsuario?: string | null;
  }): Promise<SesionVivoResponseDto> {
    if (!payload.idgrupo) {
      throw new BadRequestException('Falta idgrupo');
    }

    if (!payload.titulo?.trim()) {
      throw new BadRequestException('El título es obligatorio');
    }

    if (!payload.fecha) {
      throw new BadRequestException('La fecha es obligatoria');
    }

    if (!payload.duracion || Number(payload.duracion) <= 0) {
      throw new BadRequestException('La duración debe ser mayor a 0');
    }

    const fechaInicio = new Date(payload.fecha);

    if (Number.isNaN(fechaInicio.getTime())) {
      throw new BadRequestException('La fecha no es válida');
    }

    const fechaFin = new Date(
      fechaInicio.getTime() + Number(payload.duracion) * 60 * 1000,
    );

    const grupo = await this.obtenerGrupoConCurso(Number(payload.idgrupo));
    const curso = (grupo as any).curso;

    if (!curso?.id) {
      throw new NotFoundException('No se pudo resolver el curso del grupo');
    }

    const idempresa = curso?.idempresa ? Number(curso.idempresa) : null;

    let provider: MeetingProvider;
    let providerConfigId: number | null = null;
    let credentials: Record<string, any> = {};
    let settings: Record<string, any> = {};

    const providerConfigIdSolicitado = payload.providerConfigId
      ? Number(payload.providerConfigId)
      : null;

    let providerConfigIdPermitido = providerConfigIdSolicitado;

    if (idempresa) {
      const modoSeleccionProveedor =
        await this.configuracionSesionesVivoService.obtenerModoPorEmpresa(
          idempresa,
        );

      const puedeElegir = this.puedeElegirProveedor(
        modoSeleccionProveedor,
        payload.rolUsuario,
      );

      if (providerConfigIdSolicitado && !puedeElegir) {
        throw new BadRequestException(
          'No tienes permiso para elegir el proveedor de la sesión. Se debe usar el proveedor predeterminado.',
        );
      }

      if (!puedeElegir) {
        providerConfigIdPermitido = null;
      }

      const configResult =
        await this.meetingProviderConfigService.obtenerConfigParaCrearSesion({
          idempresa,
          providerConfigId: providerConfigIdPermitido,
        });

      if (configResult) {
        provider = this.normalizarProvider(configResult.config.provider);
        providerConfigId = configResult.config.id;
        credentials = configResult.credentials || {};
        settings = configResult.config.settings || {};
      } else {
        provider = await this.obtenerProviderDesdeGrupo(Number(payload.idgrupo));
      }
    } else {
      provider = await this.obtenerProviderDesdeGrupo(Number(payload.idgrupo));
    }

    const providerService = this.meetingProviderFactory.getProvider(provider);
    const accessType = this.normalizarAccessType(payload.accessType);

    const invitados =
      provider === 'google' && accessType === 'TRUSTED'
        ? await this.obtenerCorreosInvitadosGrupo(Number(payload.idgrupo))
        : [];

    const meetingInput: CreateMeetingInput = {
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fechaInicioIso: fechaInicio.toISOString(),
      fechaFinIso: fechaFin.toISOString(),
      accessType,
      attendees: invitados,
      credentials,
      settings,
    };

    const meeting = await providerService.createMeeting(meetingInput);

    const sesion: SesionVivo = {
      ...new SesionVivo(),
      curso: { id: Number(curso.id) } as any,
      idgrupo: Number(payload.idgrupo),
      providerConfigId,
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      fecha: fechaInicio,
      duracion: Number(payload.duracion),
      link_reunion: meeting.joinUrl,
      provider: meeting.provider,
      external_meeting_id: meeting.externalMeetingId || null,
      host_url: meeting.hostUrl || null,
      metadata: meeting.metadata || null,
      access_type: accessType,
      estado: 'programada',
    };

    const guardada: SesionVivo = await this.sesionVivoRepository.save(sesion);
    return this.toResponseDto(guardada);
  }
}
