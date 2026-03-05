import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo debe ser válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasenia: string;
<<<<<<< HEAD

  @IsString()
  @IsNotEmpty({ message: 'El reCaptcha es obligatorio' })
  recaptchaToken: string;
=======
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
}
