import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // CORRECCIÓN 1: Cambiamos 'any' por 'Partial<Usuario>'
  // Esto permite enviar un objeto con datos del usuario sin obligar a tener ID (que es autogenerado)
  async create(datosUsuario: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = this.usuarioRepository.create(datosUsuario);
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  // CORRECCIÓN 2: Cambiamos 'undefined' por 'null'
  // TypeORM retorna 'null' si no encuentra el registro.
  async findOneByCorreo(correo: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { correo } });
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }
}
