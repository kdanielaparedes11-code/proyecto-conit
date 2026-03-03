import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Length,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'El token es obligatorio' })
  token: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @MaxLength(15, {
    message: 'La contraseña no puede tener más de 15 caracteres',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
    message:
      'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial',
  })
  contrasenia: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código de seguridad debe tener 6 digitos' })
  codigoSeguridad: string;
}
