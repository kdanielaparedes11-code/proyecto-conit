import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearAdjuntoForoDto {
  @IsOptional()
  idpublicacion?: number | null;

  @IsOptional()
  idrespuesta?: number | null;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsOptional()
  @IsString()
  nombre_archivo?: string | null;

  @IsOptional()
  @IsString()
  mime_type?: string | null;

  @IsOptional()
  tamano_bytes?: number | string | null;

  @IsOptional()
  @IsString()
  storage_provider?: string | null;

  @IsOptional()
  @IsString()
  bucket?: string | null;

  @IsOptional()
  @IsString()
  object_key?: string | null;

  @IsOptional()
  @IsString()
  url_externa?: string | null;

  @IsOptional()
  @IsString()
  video_url?: string | null;

  @IsOptional()
  @IsString()
  embed_url?: string | null;

  @IsOptional()
  @IsString()
  vimeo_video_id?: string | null;

  @IsOptional()
  @IsString()
  vimeo_uri?: string | null;

  @IsOptional()
  @IsString()
  estado_video?: string | null;
}