import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { UsuarioService } from '../usuario/usuario.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioService.findOneByCorreo(loginDto.correo);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (usuario.contrasenia !== loginDto.contrasenia) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
        idEmpresa: usuario.idEmpresa,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const usuario = await this.usuarioService.findOneByCorreo(
      forgotPasswordDto.correo,
    );
    //Para evitar revelar si el correo existe o no, siempre respondemos con el mismo mensaje
    if (!usuario) {
      return {
        message:
          'Si el correo existe, se enviará un enlace de restablecimiento',
      };
    }

    //Creamos un token JWT con la información del usuario que expira en 5 minutos
    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '5m' });

    //Armamos el enlace hacia el frontend con el token
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await this.mailerService.sendMail({
      to: usuario.correo,
      subject: 'Restablecimiento de contraseña',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #141426;">
          <h2 style="color: #344c92;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña en el Aula Virtual</p>
          <p>Haz clic en el siguiente enlace para crear una nueva (este enlace <b>expira en 5 minutos</b>):</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #5573b3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Restablecer mi contraseña</a>
          <p style="margin-top: 20px; font-size: 12px; color: #8a9585;">Si tú no solicitaste esto, simplemente ignora este correo.</p>
        </div>,
      `,
    });
    //Enviamos el correo con el enlace de restablecimiento
    return {
      message: 'Si el correo existe, se enviará un enlace de restablecimiento',
    };
  }

  //Función para restablecer la contraseña usando el token enviado por correo
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      //Verificamos el token. Si expiró o es inválido, lanzamos un error
      const payload = this.jwtService.verify<{ correo: string }>(
        resetPasswordDto.token,
      );

      //Buscamos al usuario en la base de datos
      const usuario = await this.usuarioService.findOneByCorreo(payload.correo);
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      //Actualizamos la contraseña del usuario
      await this.usuarioService.actualizarContrasenia(
        usuario.id,
        resetPasswordDto.contrasenia,
      );

      return { message: 'Contraseña restablecida exitosamente' };
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      //Si el error es nuestro BadRequestException (contraseña repetida), lo lanzamos tal cual para que el cliente lo maneje
      if (error instanceof BadRequestException) {
        throw error;
      }
      //Si el token es inválido o expiró, respondemos con un mensaje genérico para no revelar detalles
      throw new UnauthorizedException(
        'El enlace de restablecimiento no es válido o ha expirado',
      );
    }
  }
}
