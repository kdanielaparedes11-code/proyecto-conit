import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'foro_respuesta' })
export class ForoRespuesta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idpublicacion', type: 'integer' })
  idpublicacion: number;

  @Column({ name: 'idusuario', type: 'integer', nullable: true })
  idusuario: number | null;

  @Column({ name: 'autor_nombre', type: 'varchar', length: 180, nullable: true })
  autor_nombre: string | null;

  @Column({ name: 'autor_rol', type: 'varchar', length: 40, nullable: true })
  autor_rol: string | null;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}