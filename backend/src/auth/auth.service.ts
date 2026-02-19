import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usuarioService.findOneByCorreo(loginDto.correo);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.contrasenia !== loginDto.contrasenia) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { sub: user.id, correo: user.correo, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }
}
