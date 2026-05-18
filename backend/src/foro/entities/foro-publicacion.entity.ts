import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'foro_publicacion' })
export class ForoPublicacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idgrupo', type: 'integer' })
  idgrupo: number;

  @Column({ name: 'idusuario', type: 'integer', nullable: true })
  idusuario: number | null;

  @Column({ name: 'autor_nombre', type: 'varchar', length: 180, nullable: true })
  autor_nombre: string | null;

  @Column({ name: 'autor_rol', type: 'varchar', length: 40, nullable: true })
  autor_rol: string | null;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;

  @Column({ type: 'boolean', default: false })
  fijado: boolean;

  @Column({ type: 'boolean', default: false })
  cerrado: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}