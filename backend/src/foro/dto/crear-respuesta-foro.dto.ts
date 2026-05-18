import { IsNotEmpty, IsString } from 'class-validator';

export class CrearRespuestaForoDto {
  @IsString()
  @IsNotEmpty()
  contenido: string;
}