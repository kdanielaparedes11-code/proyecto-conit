import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { Pago } from '../../pago/entities/pago.entity';

@Entity({ name: 'pension' }) //Respeta el nombre exacto en BD
export class Pension {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matricula_id: number;

  @Column()
  numero_cuota: number;

  @Column('numeric', { precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fecha_vencimiento: string;

  @Column({ type: 'date', nullable: true })
  fecha_pago: string;

  @Column({ default: 'PENDIENTE' })
  estado: string;

  @Column()
  tipo_pago: string;

  @Column({ nullable: true })
  pago_id: number;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: 'matricula_id' })
  matricula: Matricula;

  @ManyToOne(() => Pago)
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;
}
