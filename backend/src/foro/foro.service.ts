import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ForoPublicacion } from './entities/foro-publicacion.entity';
import { ForoRespuesta } from './entities/foro-respuesta.entity';
import { ForoAdjunto } from './entities/foro-adjunto.entity';
import { ForoReaccion } from './entities/foro-reaccion.entity';

import { Grupo } from '../grupo/entities/grupo.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Alumno } from '../alumno/entities/alumno.entity';

import { CrearPublicacionForoDto } from './dto/crear-publicacion-foro.dto';
import { ActualizarPublicacionForoDto } from './dto/actualizar-publicacion-foro.dto';
import { CrearRespuestaForoDto } from './dto/crear-respuesta-foro.dto';
import { CrearAdjuntoForoDto } from './dto/crear-adjunto-foro.dto';

type UsuarioJwt = {
  userId: number;
  correo: string;
  rol: string;
};

@Injectable()
export class ForoService {
  constructor(
    @InjectRepository(ForoPublicacion)
    private readonly publicacionesRepo: Repository<ForoPublicacion>,

    @InjectRepository(ForoRespuesta)
    private readonly respuestasRepo: Repository<ForoRespuesta>,

    @InjectRepository(ForoAdjunto)
    private readonly adjuntosRepo: Repository<ForoAdjunto>,

    @InjectRepository(ForoReaccion)
    private readonly reaccionesRepo: Repository<ForoReaccion>,

    @InjectRepository(Grupo)
    private readonly gruposRepo: Repository<Grupo>,

    @InjectRepository(Docente)
    private readonly docentesRepo: Repository<Docente>,

    @InjectRepository(Alumno)
    private readonly alumnosRepo: Repository<Alumno>,
  ) {}

  private normalizarRol(rol?: string) {
    return String(rol || '').toUpperCase();
  }

  private async validarAccesoGrupo(idgrupo: number, usuario: UsuarioJwt) {
    const rol = this.normalizarRol(usuario?.rol);

    // Administradores tienen acceso a todos los grupos
    if (rol.includes('ADMIN')) return;

    // Docentes y Alumnos deben ser verificados
    if (rol.includes('ALUMNO') || rol === 'USUARIO') {
      // Lógica para verificar si el alumno está matriculado en el grupo
      const matriculas = await this.publicacionesRepo.manager.query(
        `SELECT id FROM matricula WHERE idalumno = $1 AND idgrupo = $2 AND estado = 'pagado'`,
        [usuario.userId, idgrupo],
      );

      if (matriculas.length === 0) {
        throw new ForbiddenException('No tienes acceso al foro de este grupo.');
      }
    } else if (rol.includes('DOCENTE')) {
      // Opcional: Podrías verificar si el docente está asignado al grupo o curso
      // Por ahora, asumiremos que los docentes tienen acceso a los foros
    } else {
      throw new ForbiddenException('Rol no autorizado para acceder al foro.');
    }
  }

  private validarId(id: string | number, mensaje = 'ID inválido.') {
    const numero = Number(id);

    if (!numero || Number.isNaN(numero)) {
      throw new BadRequestException(mensaje);
    }

    return numero;
  }

  private async validarGrupoExiste(idgrupo: number) {
    const grupo = await this.gruposRepo.findOne({
      where: { id: idgrupo },
    });

    if (!grupo) {
      throw new NotFoundException('No se encontró el grupo.');
    }

    return grupo;
  }

  private async obtenerAutor(usuario: UsuarioJwt) {
    const rol = this.normalizarRol(usuario?.rol);

    let autorNombre = usuario?.correo || 'Usuario';
    let autorRol = 'USUARIO';

    if (rol.includes('DOCENTE')) {
      const docente = await this.docentesRepo
        .createQueryBuilder('docente')
        .leftJoin('docente.usuario', 'usuario')
        .where('usuario.id = :userId', { userId: Number(usuario.userId) })
        .getOne();

      if (docente) {
        autorNombre =
          `${docente.nombre || ''} ${docente.apellido || ''}`.trim() ||
          docente.correo ||
          autorNombre;
      }
      autorRol = 'DOCENTE';
    } else if (rol.includes('ADMIN')) {
      autorNombre = usuario?.correo
        ? `Administrador (${usuario.correo})`
        : 'Administrador';
      autorRol = 'ADMIN';
    } else {
      // Lógica para el Alumno
      const alumno = await this.alumnosRepo
        .createQueryBuilder('alumno')
        .leftJoin('alumno.usuario', 'usuario')
        .where('usuario.id = :userId', { userId: Number(usuario.userId) })
        .getOne();

      if (alumno) {
        autorNombre =
          `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() ||
          autorNombre;
      }
      autorRol = 'ALUMNO';
    }

    return {
      idusuario: Number(usuario.userId),
      autor_nombre: autorNombre,
      autor_rol: autorRol,
    };
  }

  async getPublicacionesByGrupo(
    idgrupoParam: string | number,
    usuario: UsuarioJwt,
  ) {
    const idgrupo = this.validarId(idgrupoParam, 'Grupo inválido.');
    await this.validarGrupoExiste(idgrupo);

    await this.validarAccesoGrupo(idgrupo, usuario);

    const publicaciones = await this.publicacionesRepo.find({
      where: {
        idgrupo,
        estado: 'ACTIVO',
      },
      order: {
        fijado: 'DESC',
        updated_at: 'DESC',
      },
    });

    if (publicaciones.length === 0) return [];

    const ids = publicaciones.map((p) => Number(p.id));

    const respuestas = await this.respuestasRepo.find({
      where: {
        idpublicacion: In(ids),
        estado: 'ACTIVO',
      },
      select: {
        id: true,
        idpublicacion: true,
        created_at: true,
      },
    });

    const contador = new Map<number, number>();
    const ultimaRespuesta = new Map<number, Date>();

    respuestas.forEach((r) => {
      const key = Number(r.idpublicacion);

      contador.set(key, (contador.get(key) || 0) + 1);

      const actual = ultimaRespuesta.get(key);
      if (!actual || new Date(r.created_at) > new Date(actual)) {
        ultimaRespuesta.set(key, r.created_at);
      }
    });

    return publicaciones.map((p) => ({
      ...p,
      total_respuestas: contador.get(Number(p.id)) || 0,
      ultima_respuesta_at: ultimaRespuesta.get(Number(p.id)) || null,
    }));
  }

  async crearPublicacion(
    idgrupoParam: string | number,
    dto: CrearPublicacionForoDto,
    usuario: UsuarioJwt,
  ) {
    const idgrupo = this.validarId(idgrupoParam, 'Grupo inválido.');
    await this.validarGrupoExiste(idgrupo);

    await this.validarAccesoGrupo(idgrupo, usuario);

    if (!dto.titulo?.trim()) {
      throw new BadRequestException(
        'El título de la publicación es obligatorio.',
      );
    }

    if (!dto.contenido?.trim()) {
      throw new BadRequestException(
        'El contenido de la publicación es obligatorio.',
      );
    }

    const autor = await this.obtenerAutor(usuario);

    const publicacion = this.publicacionesRepo.create({
      idgrupo,
      idusuario: autor.idusuario,
      autor_nombre: autor.autor_nombre,
      autor_rol: autor.autor_rol,
      titulo: dto.titulo.trim(),
      contenido: dto.contenido.trim(),
      estado: 'ACTIVO',
      fijado: false,
      cerrado: false,
    });

    return await this.publicacionesRepo.save(publicacion);
  }

  // Para actualizar, eliminar, fijar y cerrar, lo ideal es restringir a Admin/Docente o al propio autor
  private validarPropietarioOAdmin(
    publicacion: ForoPublicacion | ForoRespuesta,
    usuario: UsuarioJwt,
  ) {
    const rol = this.normalizarRol(usuario?.rol);
    if (rol.includes('ADMIN') || rol.includes('DOCENTE')) return;
    if (publicacion.idusuario !== Number(usuario.userId)) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este contenido.',
      );
    }
  }

  async actualizarPublicacion(
    idParam: string | number,
    dto: ActualizarPublicacionForoDto,
    usuario: UsuarioJwt,
  ) {
    const id = this.validarId(idParam, 'Publicación inválida.');

    const publicacion = await this.publicacionesRepo.findOne({
      where: { id, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    this.validarPropietarioOAdmin(publicacion, usuario);

    if (dto.titulo !== undefined) {
      if (!dto.titulo.trim())
        throw new BadRequestException('El título no puede estar vacío.');
      publicacion.titulo = dto.titulo.trim();
    }

    if (dto.contenido !== undefined) {
      if (!dto.contenido.trim())
        throw new BadRequestException('El contenido no puede estar vacío.');
      publicacion.contenido = dto.contenido.trim();
    }

    return await this.publicacionesRepo.save(publicacion);
  }

  async eliminarPublicacion(idParam: string | number, usuario: UsuarioJwt) {
    const id = this.validarId(idParam, 'Publicación inválida.');

    const publicacion = await this.publicacionesRepo.findOne({
      where: { id },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    this.validarPropietarioOAdmin(publicacion, usuario);

    publicacion.estado = 'ELIMINADO';
    await this.publicacionesRepo.save(publicacion);

    return { ok: true };
  }

  async fijarPublicacion(
    idParam: string | number,
    fijado: boolean,
    usuario: UsuarioJwt,
  ) {
    // Solo admins o docentes deberían fijar
    const rol = this.normalizarRol(usuario?.rol);
    if (!rol.includes('ADMIN') && !rol.includes('DOCENTE')) {
      throw new ForbiddenException(
        'No tienes permisos para fijar publicaciones.',
      );
    }

    const id = this.validarId(idParam, 'Publicación inválida.');
    const publicacion = await this.publicacionesRepo.findOne({
      where: { id, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    publicacion.fijado = Boolean(fijado);
    return await this.publicacionesRepo.save(publicacion);
  }

  async cerrarPublicacion(
    idParam: string | number,
    cerrado: boolean,
    usuario: UsuarioJwt,
  ) {
    // Solo admins o docentes deberían cerrar
    const rol = this.normalizarRol(usuario?.rol);
    if (!rol.includes('ADMIN') && !rol.includes('DOCENTE')) {
      throw new ForbiddenException(
        'No tienes permisos para cerrar publicaciones.',
      );
    }

    const id = this.validarId(idParam, 'Publicación inválida.');
    const publicacion = await this.publicacionesRepo.findOne({
      where: { id, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    publicacion.cerrado = Boolean(cerrado);
    return await this.publicacionesRepo.save(publicacion);
  }

  async getRespuestasByPublicacion(
    idpublicacionParam: string | number,
    usuario: UsuarioJwt,
  ) {
    const idpublicacion = this.validarId(
      idpublicacionParam,
      'Publicación inválida.',
    );

    const publicacion = await this.publicacionesRepo.findOne({
      where: { id: idpublicacion, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    // Validamos acceso al grupo de la publicación
    await this.validarAccesoGrupo(publicacion.idgrupo, usuario);

    return await this.respuestasRepo.find({
      where: {
        idpublicacion,
        estado: 'ACTIVO',
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  async crearRespuesta(
    idpublicacionParam: string | number,
    dto: CrearRespuestaForoDto,
    usuario: UsuarioJwt,
  ) {
    const idpublicacion = this.validarId(
      idpublicacionParam,
      'Publicación inválida.',
    );

    if (!dto.contenido?.trim()) {
      throw new BadRequestException('La respuesta no puede estar vacía.');
    }

    const publicacion = await this.publicacionesRepo.findOne({
      where: { id: idpublicacion, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    // Validamos acceso al grupo de la publicación
    await this.validarAccesoGrupo(publicacion.idgrupo, usuario);

    if (publicacion.cerrado) {
      throw new BadRequestException(
        'Esta publicación está cerrada y ya no acepta respuestas.',
      );
    }

    const autor = await this.obtenerAutor(usuario);

    const respuesta = this.respuestasRepo.create({
      idpublicacion,
      idusuario: autor.idusuario,
      autor_nombre: autor.autor_nombre,
      autor_rol: autor.autor_rol,
      contenido: dto.contenido.trim(),
      estado: 'ACTIVO',
    });

    const guardada = await this.respuestasRepo.save(respuesta);

    publicacion.updated_at = new Date();
    await this.publicacionesRepo.save(publicacion);

    return guardada;
  }

  async eliminarRespuesta(idParam: string | number, usuario: UsuarioJwt) {
    const id = this.validarId(idParam, 'Respuesta inválida.');

    const respuesta = await this.respuestasRepo.findOne({
      where: { id },
    });

    if (!respuesta) throw new NotFoundException('No se encontró la respuesta.');

    this.validarPropietarioOAdmin(respuesta, usuario);

    respuesta.estado = 'ELIMINADO';
    await this.respuestasRepo.save(respuesta);

    return { ok: true };
  }

  async crearAdjunto(dto: CrearAdjuntoForoDto, usuario: UsuarioJwt) {
    // Si necesitas validar, debes obtener el grupo asociado a la publicacion o respuesta
    // Por simplicidad, se permite si el usuario está autenticado, pero deberías restringirlo.
    const idpublicacion = dto.idpublicacion ? Number(dto.idpublicacion) : null;
    const idrespuesta = dto.idrespuesta ? Number(dto.idrespuesta) : null;

    if (!idpublicacion && !idrespuesta) {
      throw new BadRequestException(
        'El adjunto debe pertenecer a una publicación o respuesta.',
      );
    }

    if (!dto.tipo?.trim()) {
      throw new BadRequestException('El tipo de adjunto es obligatorio.');
    }

    if (idpublicacion) {
      const publicacion = await this.publicacionesRepo.findOne({
        where: { id: idpublicacion, estado: 'ACTIVO' },
      });

      if (!publicacion)
        throw new NotFoundException('No se encontró la publicación.');
      await this.validarAccesoGrupo(publicacion.idgrupo, usuario);
    }

    if (idrespuesta) {
      const respuesta = await this.respuestasRepo.findOne({
        where: { id: idrespuesta, estado: 'ACTIVO' },
        relations: ['publicacion'],
      });

      if (!respuesta)
        throw new NotFoundException('No se encontró la respuesta.');
      await this.validarAccesoGrupo(respuesta.publicacion.idgrupo, usuario);
    }

    const storageProvider =
      dto.storage_provider ||
      (dto.object_key ? 's3' : dto.tipo === 'video_vimeo' ? 'vimeo' : null);

    const adjunto = this.adjuntosRepo.create({
      idpublicacion,
      idrespuesta,
      tipo: dto.tipo,
      nombre_archivo: dto.nombre_archivo || null,
      mime_type: dto.mime_type || null,
      tamano_bytes:
        dto.tamano_bytes !== undefined && dto.tamano_bytes !== null
          ? String(dto.tamano_bytes)
          : null,
      storage_provider: storageProvider,
      bucket: dto.bucket || null,
      object_key: dto.object_key || null,
      url_externa: dto.url_externa || null,
      video_url: dto.video_url || null,
      embed_url: dto.embed_url || null,
      vimeo_video_id: dto.vimeo_video_id || null,
      vimeo_uri: dto.vimeo_uri || null,
      estado_video: dto.estado_video || null,
      estado: 'ACTIVO',
    });

    return await this.adjuntosRepo.save(adjunto);
  }

  async getAdjuntosByPublicacion(
    idpublicacionParam: string | number,
    usuario: UsuarioJwt,
  ) {
    const idpublicacion = this.validarId(
      idpublicacionParam,
      'Publicación inválida.',
    );

    return await this.adjuntosRepo.find({
      where: {
        idpublicacion,
        estado: 'ACTIVO',
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  async getAdjuntosByRespuesta(
    idrespuestaParam: string | number,
    usuario: UsuarioJwt,
  ) {
    const idrespuesta = this.validarId(idrespuestaParam, 'Respuesta inválida.');

    return await this.adjuntosRepo.find({
      where: {
        idrespuesta,
        estado: 'ACTIVO',
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  async getAdjuntosByRespuestas(idsTexto: string, usuario: UsuarioJwt) {
    const ids = String(idsTexto || '')
      .split(',')
      .map((id) => Number(id))
      .filter(Boolean);

    if (ids.length === 0) return [];

    return await this.adjuntosRepo.find({
      where: {
        idrespuesta: In(ids),
        estado: 'ACTIVO',
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  async eliminarAdjunto(idParam: string | number, usuario: UsuarioJwt) {
    const id = this.validarId(idParam, 'Adjunto inválido.');

    const adjunto = await this.adjuntosRepo.findOne({
      where: { id },
    });

    if (!adjunto) throw new NotFoundException('No se encontró el adjunto.');

    // Aquí idealmente validarías si el usuario es el dueño de la publicación/respuesta

    adjunto.estado = 'ELIMINADO';
    await this.adjuntosRepo.save(adjunto);

    return { ok: true };
  }

  async getReaccionesByPublicaciones(idsTexto: string, usuario: UsuarioJwt) {
    const ids = String(idsTexto || '')
      .split(',')
      .map((id) => Number(id))
      .filter(Boolean);

    if (ids.length === 0) return [];

    return await this.reaccionesRepo.find({
      where: {
        idpublicacion: In(ids),
      },
    });
  }

  async getReaccionesByRespuestas(idsTexto: string, usuario: UsuarioJwt) {
    const ids = String(idsTexto || '')
      .split(',')
      .map((id) => Number(id))
      .filter(Boolean);

    if (ids.length === 0) return [];

    return await this.reaccionesRepo.find({
      where: {
        idrespuesta: In(ids),
      },
    });
  }

  async guardarReaccionPublicacion(
    idpublicacionParam: string | number,
    tipo: string,
    usuario: UsuarioJwt,
  ) {
    const idpublicacion = this.validarId(
      idpublicacionParam,
      'Publicación inválida.',
    );

    if (!tipo?.trim())
      throw new BadRequestException('Selecciona una reacción.');

    const publicacion = await this.publicacionesRepo.findOne({
      where: { id: idpublicacion, estado: 'ACTIVO' },
    });

    if (!publicacion)
      throw new NotFoundException('No se encontró la publicación.');

    await this.validarAccesoGrupo(publicacion.idgrupo, usuario);

    const existente = await this.reaccionesRepo.findOne({
      where: {
        idpublicacion,
        idusuario: Number(usuario.userId),
      },
    });

    if (existente && existente.tipo === tipo) {
      await this.reaccionesRepo.remove(existente);
      return null;
    }

    if (existente) {
      existente.tipo = tipo;
      return await this.reaccionesRepo.save(existente);
    }

    const reaccion = this.reaccionesRepo.create({
      idpublicacion,
      idrespuesta: null,
      idusuario: Number(usuario.userId),
      tipo,
    });

    return await this.reaccionesRepo.save(reaccion);
  }

  async guardarReaccionRespuesta(
    idrespuestaParam: string | number,
    tipo: string,
    usuario: UsuarioJwt,
  ) {
    const idrespuesta = this.validarId(idrespuestaParam, 'Respuesta inválida.');

    if (!tipo?.trim())
      throw new BadRequestException('Selecciona una reacción.');

    const respuesta = await this.respuestasRepo.findOne({
      where: { id: idrespuesta, estado: 'ACTIVO' },
      relations: ['publicacion'],
    });

    if (!respuesta) throw new NotFoundException('No se encontró la respuesta.');

    await this.validarAccesoGrupo(respuesta.publicacion.idgrupo, usuario);

    const existente = await this.reaccionesRepo.findOne({
      where: {
        idrespuesta,
        idusuario: Number(usuario.userId),
      },
    });

    if (existente && existente.tipo === tipo) {
      await this.reaccionesRepo.remove(existente);
      return null;
    }

    if (existente) {
      existente.tipo = tipo;
      return await this.reaccionesRepo.save(existente);
    }

    const reaccion = this.reaccionesRepo.create({
      idpublicacion: null,
      idrespuesta,
      idusuario: Number(usuario.userId),
      tipo,
    });

    return await this.reaccionesRepo.save(reaccion);
  }
}
