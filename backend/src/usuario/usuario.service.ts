import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

  async actualizarContrasenia(id: number, contrasenia: string) {
    //Buscamos al usuario para ver sus contraseñas anteriores
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    //Si el usuario no existe, lanzamos un error
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado en la base de datos');
    }
    //Garantizamos que sea un Array de JavaScript
    let historial: string[] = [];
    if (Array.isArray(usuario.historialContrasenias)) {
      historial = usuario.historialContrasenias;
    } else if (typeof usuario.historialContrasenias === 'string') {
      historial = (usuario.historialContrasenias as string)
        .replace(/^{|}$/g, '')
        .split(',');
    }
    //Limpiamos cualquier dato vacío que se haya podido guardar por error, para evitar falsos positivos al comparar contraseñas
    historial = historial.filter((pass) => pass && pass.trim() !== '');
    //Verificamos que no sea igual a la contraseña actual ni a las anteriores
    if (
      usuario.contrasenia === contrasenia ||
      historial.includes(contrasenia)
    ) {
      throw new BadRequestException(
        'La contraseña ya fue utilizada anteriormente',
      );
    }
    //Metemos la contraseña actual al inicio, y cortamos a 3 elementos
    const nuevoHistorial = [usuario.contrasenia, ...historial].slice(0, 3); //Guardamos solo las últimas 3 contraseñas
    //Guardamos la nueva contraseña y el nuevo historial en la base de datos
    await this.usuarioRepository.update(id, {
      contrasenia: contrasenia,
      historialContrasenias: nuevoHistorial,
    });
  }
}
