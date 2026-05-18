import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'foro_adjunto' })
export class ForoAdjunto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idpublicacion', type: 'integer', nullable: true })
  idpublicacion: number | null;

  @Column({ name: 'idrespuesta', type: 'integer', nullable: true })
  idrespuesta: number | null;

  @Column({ type: 'varchar', length: 30 })
  tipo: string;

  @Column({ name: 'nombre_archivo', type: 'varchar', length: 255, nullable: true })
  nombre_archivo: string | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 120, nullable: true })
  mime_type: string | null;

  @Column({ name: 'tamano_bytes', type: 'bigint', nullable: true })
  tamano_bytes: string | null;

  @Column({ name: 'storage_provider', type: 'varchar', length: 30, nullable: true })
  storage_provider: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  bucket: string | null;

  @Column({ name: 'object_key', type: 'text', nullable: true })
  object_key: string | null;

  @Column({ name: 'url_externa', type: 'text', nullable: true })
  url_externa: string | null;

  @Column({ name: 'video_url', type: 'text', nullable: true })
  video_url: string | null;

  @Column({ name: 'embed_url', type: 'text', nullable: true })
  embed_url: string | null;

  @Column({ name: 'vimeo_video_id', type: 'varchar', length: 80, nullable: true })
  vimeo_video_id: string | null;

  @Column({ name: 'vimeo_uri', type: 'text', nullable: true })
  vimeo_uri: string | null;

  @Column({ name: 'estado_video', type: 'varchar', length: 40, nullable: true })
  estado_video: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;
}