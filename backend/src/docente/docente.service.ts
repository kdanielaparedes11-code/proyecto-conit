import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Docente } from '../docente/entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DocenteService {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    return await this.docenteRepository.find({
      relations: ['usuario', 'cursosAdicionales'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const docente = await this.docenteRepository.findOne({
      where: { id },
      relations: ['usuario', 'cursosAdicionales'],
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }
    return docente;
  }

  async create(data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const { contrasenia, crearUsuario, ...datosDocente } = data;

      let usuarioCreado: any = null;

      if (crearUsuario && contrasenia) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: datosDocente.correo,
            contrasenia: hashedPassword,
            rol: 'DOCENTE',
            idempresa: 1,
          }),
        );
      }

      // 2. Crear docente
      const docenteParams: any = { ...datosDocente };
      if (usuarioCreado) {
        docenteParams.usuario = { id: usuarioCreado.id };
      }

      const docente = manager.create(Docente, docenteParams);
      return await manager.save(docente);
    });
  }

  async update(id: number, data: any) {
    return await this.dataSource.transaction(async (manager) => {
      const docente = await manager.findOne(Docente, {
        where: { id },
        relations: ['usuario'],
      });

      if (!docente) throw new NotFoundException('Docente no encontrado');

      const { crearUsuario, contrasenia, ...datosActualizar } = data;

      if (crearUsuario && contrasenia && !docente.usuario) {
        const hashedPassword = await bcrypt.hash(contrasenia, 10);

        const nuevoUsuario = await manager.save(
          manager.create(Usuario, {
            correo: datosActualizar.correo || docente.correo,
            contrasenia: hashedPassword,
            rol: 'DOCENTE',
            idempresa: 1,
          }),
        );
        datosActualizar.usuario = { id: nuevoUsuario.id };
      }

      await manager.update(Docente, id, datosActualizar);

      return await manager.findOne(Docente, {
        where: { id },
        relations: ['usuario', 'cursosAdicionales'],
      });
    });
  }

  async remove(id: number) {
    await this.docenteRepository.update(id, { estado: false });

    // Inhabilitamos también su usuario para que no pueda logearse
    const docente = await this.findOne(id);
    if (docente.usuario && docente.usuario.id) {
      await this.usuarioRepository.update(docente.usuario.id, {
        estado: false,
      });
    }

    return { message: 'Docente inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.docenteRepository.update(id, { estado: true });

    const docente = await this.findOne(id);
    if (docente.usuario && docente.usuario.id) {
      await this.usuarioRepository.update(docente.usuario.id, { estado: true });
    }

    return { message: 'Docente habilitado correctamente' };
  }
}
