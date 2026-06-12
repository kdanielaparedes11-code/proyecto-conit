import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Alumno } from '../../alumno/entities/alumno.entity';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Matricula } from '../../matricula/entities/matricula.entity';
import { ConfiguracionPago } from '../../pago/entities/configuracion-pago.entity';

@Entity({ name: 'comprobante_pago' })
export class ComprobantePago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Alumno)
  @JoinColumn({ name: 'idalumno' })
  alumno: Alumno;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'idgrupo' })
  grupo: Grupo;

  @ManyToOne(() => ConfiguracionPago, { nullable: true })
  @JoinColumn({ name: 'id_configuracion_pago' })
  configuracionPago: ConfiguracionPago | null;

  @Column({ type: 'varchar', default: 'transferencia' })
  metodo_pago: string;

  @Column({ type: 'numeric' })
  monto: number;

  @Column({ type: 'varchar', default: 'PEN' })
  moneda: string;

  @Column({ type: 'varchar' })
  numero_operacion: string;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_pago: Date | null;

  @Column({ type: 'text' })
  voucher_key: string;

  @Column({ type: 'varchar', nullable: true })
  voucher_nombre_archivo: string | null;

  @Column({ type: 'varchar', nullable: true })
  voucher_mime_type: string | null;

  @Column({ type: 'bigint', nullable: true })
  voucher_tamano_bytes: number | null;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado: string;

  @Column({ type: 'text', nullable: true })
  observacion_alumno: string | null;

  @Column({ type: 'text', nullable: true })
  observacion_admin: string | null;

  @Column({ type: 'integer', nullable: true })
  idadministrador_revision: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  fecha_revision: Date | null;

  @ManyToOne(() => Matricula, { nullable: true })
  @JoinColumn({ name: 'idmatricula' })
  matricula: Matricula | null;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at: Date | null;
}