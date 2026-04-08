import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.alumnoRepository.find({
      order: { id: 'DESC' },
      relations: ['matriculas', 'matriculas.grupo', 'matriculas.grupo.curso'],
    });
  }

  async findOne(id: number) {
    const alumno = await this.alumnoRepository.findOneBy({ id });

    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }
    return alumno;
  }

  async create(data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const { contrasenia, crearUsuario, ...datosAlumno } = data;

      let usuarioCreadoId: number | null = null;

      // 1. Crear usuario
      if (crearUsuario && contrasenia) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const nuevoUsuario = await manager.save(
          manager.create(Usuario, {
            correo: datosAlumno.correo,
            contrasenia: hashedPassword,
            rol: 'ALUMNO',
            idempresa: 1,
          }),
        );
        usuarioCreadoId = nuevoUsuario.id;
      }

      // 2. Crear alumno
      const alumnoParams: any = {
        ...datosAlumno,
        nombre_editado: true,
      };

      if (usuarioCreadoId) {
        alumnoParams.idusuario = usuarioCreadoId;
      }

      const alumno = manager.create(Alumno, alumnoParams);
      return await manager.save(alumno);
    });
  }

  async update(id: number, data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const alumno = await manager.findOne(Alumno, { where: { id } });
      if (!alumno) throw new NotFoundException('Alumno no encontrado');

      const { crearUsuario, contrasenia, ...datosActualizar } = data;

      if (crearUsuario && contrasenia && !alumno.idusuario) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const nuevoUsuario = await manager.save(
          manager.create(Usuario, {
            correo: datosActualizar.correo || alumno.correo,
            contrasenia: hashedPassword,
            rol: 'ALUMNO',
            idempresa: 1,
          }),
        );
        datosActualizar.idusuario = nuevoUsuario.id;
      }

      await manager.update(Alumno, id, datosActualizar);
      return await manager.findOne(Alumno, { where: { id } });
    });
  }

  async remove(id: number) {
    await this.alumnoRepository.update(id, { estado: false });

    // Inhabilitamos también su usuario
    const alumno = await this.findOne(id);
    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: false });
    }

    return { message: 'Alumno inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.alumnoRepository.update(id, { estado: true });

    const alumno = await this.findOne(id);
    if (alumno.idusuario) {
      await this.usuarioRepository.update(alumno.idusuario, { estado: true });
    }

    return { message: 'Alumno habilitado correctamente' };
  }
}
