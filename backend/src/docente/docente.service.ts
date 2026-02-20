import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Docente } from '../docente/entities/docente.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateDocenteDto } from '../docente/dto/create-docente.dto';

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
  const db = await this.docenteRepository.query('SELECT current_database()');
  console.log('BASE ACTUAL:', db);

  const tables = await this.docenteRepository.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
  );
  console.log('TABLAS EN ESTA BD:', tables);

  const raw = await this.docenteRepository.query('SELECT * FROM docente');
  console.log('RAW QUERY:', raw);

  return raw;
}

  async create(data: CreateDocenteDto) {
    return await this.dataSource.transaction(async (manager) => {

      let usuarioCreado: Usuario | undefined;

      if (data.crearUsuario) {
        usuarioCreado = await manager.save(
          manager.create(Usuario, {
            correo: data.correo,
            contrasenia: '123456',
            rol: 'DOCENTE',
          }),
        );
      }

      const docente = manager.create(Docente, {
        nombre: data.nombre,
        apellido: data.apellido,
        tipoDocumento: data.tipoDocumento,
        numDocumento: data.numDocumento,
        telefono: data.telefono,
        direccion: data.direccion,
        correo: data.correo,
        ...(usuarioCreado && { usuario: usuarioCreado }),
      });

      return await manager.save(docente);
    });
  }
}