import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'foro_reaccion' })
export class ForoReaccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idpublicacion', type: 'integer', nullable: true })
  idpublicacion: number | null;

  @Column({ name: 'idrespuesta', type: 'integer', nullable: true })
  idrespuesta: number | null;

  @Column({ name: 'idusuario', type: 'integer' })
  idusuario: number;

  @Column({ type: 'varchar', length: 30 })
  tipo: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}