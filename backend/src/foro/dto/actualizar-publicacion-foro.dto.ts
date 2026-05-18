import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPublicacionForoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsString()
  contenido?: string;
}