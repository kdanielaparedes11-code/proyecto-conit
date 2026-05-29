import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../../empresa/entities/empresa.entity';

@Entity({ name: 'meeting_provider_config' })
export class MeetingProviderConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'idempresa', type: 'int' })
  idempresa: number;

  @ManyToOne(() => Empresa, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idempresa' })
  empresa: Empresa;

  @Column({ type: 'varchar', length: 30 })
  provider: 'google' | 'zoom' | 'teams';

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'boolean', default: false })
  predeterminado: boolean;

  @Column({ name: 'auth_type', type: 'varchar', length: 50, nullable: true })
  authType: string | null;

  @Column({ name: 'credentials_encrypted', type: 'text', nullable: true })
  credentialsEncrypted: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  settings: any;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}