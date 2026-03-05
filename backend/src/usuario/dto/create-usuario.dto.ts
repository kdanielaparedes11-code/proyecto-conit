import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsNumber()
  @IsNotEmpty()
  idEmpresa: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  contrasenia: string;

  @IsString()
  @IsNotEmpty()
  rol: string;
}
