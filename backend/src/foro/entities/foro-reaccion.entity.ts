import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ForoPublicacion } from './foro-publicacion.entity';
import { ForoRespuesta } from './foro-respuesta.entity';

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

  @ManyToOne(() => ForoPublicacion, (publicacion) => publicacion.reacciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idpublicacion' })
  publicacion: ForoPublicacion;

  @ManyToOne(() => ForoRespuesta, (respuesta) => respuesta.reacciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idrespuesta' })
  respuesta: ForoRespuesta;
}
