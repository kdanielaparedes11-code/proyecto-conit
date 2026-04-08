import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Docente } from '../docente/entities/docente.entity';
import { Administrador } from '../administrador/entities/administrador.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async create(datosUsuario: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = this.usuarioRepository.create(datosUsuario);
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findOneByCorreo(correo: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { correo } });
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  async update(id: number, data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.findOne(Usuario, { where: { id } });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      const rolAntiguo = usuario.rol;
      const rolNuevo = data.rol;

      if (data.contrasenia) {
        usuario.contrasenia = await bcrypt.hash(data.contrasenia, 10);
      }

      if (data.correo) {
        usuario.correo = data.correo;
      }

      if (rolNuevo && rolAntiguo !== rolNuevo) {
        let perfilDatos: any = null;

        if (rolAntiguo === 'ALUMNO') {
          const perfil = await manager.findOne(Alumno, {
            where: { idusuario: id },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Alumno, perfil.id);
          }
        } else if (rolAntiguo === 'DOCENTE') {
          const perfil = await manager.findOne(Docente, {
            where: { usuario: { id } },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Docente, perfil.id);
          }
        } else if (rolAntiguo === 'ADMINISTRADOR' || rolAntiguo === 'ADMIN') {
          const perfil = await manager.findOne(Administrador, {
            where: { idusuario: id },
          });
          if (perfil) {
            perfilDatos = { ...perfil };
            await manager.delete(Administrador, perfil.id);
          }
        }

        const datosMigracion = perfilDatos
          ? {
              nombre: perfilDatos.nombre || 'Por editar',
              apellido: perfilDatos.apellido || 'Por editar',
              tipodocumento:
                perfilDatos.tipodocumento || perfilDatos.tipoDocumento || 'DNI',
              numdocumento:
                perfilDatos.numdocumento ||
                perfilDatos.numDocumento ||
                '00000000',
              telefono: perfilDatos.telefono || '',
              direccion: perfilDatos.direccion || '',
              correo: perfilDatos.correo || usuario.correo,
              idusuario: id,
              usuario: { id: id },
            }
          : {
              nombre: 'Usuario',
              apellido: 'Migrado',
              tipodocumento: 'DNI',
              numdocumento: '00000000',
              telefono: '',
              direccion: '',
              correo: usuario.correo,
              idusuario: id,
              usuario: { id: id },
            };

        if (rolNuevo === 'ALUMNO') {
          await manager.save(manager.create(Alumno, datosMigracion));
        } else if (rolNuevo === 'DOCENTE') {
          await manager.save(
            manager.create(Docente, {
              ...datosMigracion,
              tipoDocumento: datosMigracion.tipodocumento,
              numDocumento: datosMigracion.numdocumento,
            }),
          );
        } else if (rolNuevo === 'ADMINISTRADOR' || rolNuevo === 'ADMIN') {
          await manager.save(manager.create(Administrador, datosMigracion));
        }

        usuario.rol = rolNuevo;
      }

      return await manager.save(usuario);
    });
  }

  async remove(id: number) {
    await this.usuarioRepository.update(id, { estado: false });
    return { message: 'Usuario deshabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.usuarioRepository.update(id, { estado: true });
    return { message: 'Usuario habilitado correctamente' };
  }

  async actualizarContrasenia(id: number, contrasenia: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado en la base de datos');
    }

    let historial: string[] = [];
    if (Array.isArray(usuario.historialcontrasenias)) {
      historial = usuario.historialcontrasenias;
    } else if (typeof usuario.historialcontrasenias === 'string') {
      historial = (usuario.historialcontrasenias as string)
        .replace(/^{|}$/g, '')
        .split(',');
    }
    historial = historial.filter((pass) => pass && pass.trim() !== '');

    const esIgualActual = await bcrypt.compare(
      contrasenia,
      usuario.contrasenia,
    );
    if (esIgualActual) {
      throw new BadRequestException(
        'La contraseña es igual a la que usas actualmente',
      );
    }

    for (const hashAntiguo of historial) {
      const esUsada = await bcrypt.compare(contrasenia, hashAntiguo);
      if (esUsada) {
        throw new BadRequestException(
          'La contraseña ya fue utilizada anteriormente',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    const nuevoHistorial = [usuario.contrasenia, ...historial].slice(0, 3);

    await this.usuarioRepository.update(id, {
      contrasenia: hashedPassword,
      historialcontrasenias: nuevoHistorial,
    });
  }
}
