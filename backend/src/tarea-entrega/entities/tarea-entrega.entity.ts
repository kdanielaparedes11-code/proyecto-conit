import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tarea } from '../../tarea/entities/tarea.entity';
import { Alumno } from '../../alumno/entities/alumno.entity';

@Entity({ name: 'tarea_entrega' })
export class TareaEntrega {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idtarea: number;

  @ManyToOne(() => Tarea)
  @JoinColumn({ name: 'idtarea' })
  tarea: Tarea;

  @Column({ nullable: true })
  idalumno: number;

  @ManyToOne(() => Alumno)
  @JoinColumn({ name: 'idalumno' })
  alumno: Alumno;

  @Column({ nullable: true })
  idmatricula: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @Column({ type: 'text', nullable: true })
  archivo_url: string;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  nota: number;

  @Column({ type: 'boolean', default: false })
  revisado: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_entrega: Date;
}
