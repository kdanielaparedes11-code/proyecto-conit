import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

export type ModoSeleccionProveedor =
  | 'SOLO_PREDETERMINADO'
  | 'DOCENTE_PUEDE_ELEGIR'
  | 'ADMIN_PUEDE_ELEGIR'
  | 'TODOS_PUEDEN_ELEGIR';

@Entity({ name: 'sesion_vivo_configuracion' })
export class ConfiguracionSesionesVivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idempresa', type: 'int', unique: true })
  idempresa: number;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idempresa' })
  empresa: Empresa;

  @Column({
    name: 'modo_seleccion_proveedor',
    type: 'varchar',
    length: 40,
    default: 'SOLO_PREDETERMINADO',
  })
  modoSeleccionProveedor: ModoSeleccionProveedor;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}