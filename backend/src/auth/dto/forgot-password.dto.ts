import { IsEmail, IsNotEmpty } from 'class-validator';

//DTO para solicitar el restablecimiento de contraseña
export class ForgotPasswordDto {
  //Validación del correo electrónico
  @IsEmail({}, { message: 'El correo debe ser válido' })
  //Validación de que el campo no esté vacío
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;
}
