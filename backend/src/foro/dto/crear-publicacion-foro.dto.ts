import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearPublicacionForoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;
}