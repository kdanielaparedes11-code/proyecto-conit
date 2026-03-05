import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamp } from 'typeorm/browser';

@Entity({ name: 'multimedia' }) // Respeta el nombre exacto en BD
export class Multimedia {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'timestamp' })
  created_at: Timestamp;

  @Column({ type: 'varchar' })
  tipo: string;

  @Column({ type: 'integer' })
  usuario_id: number;

}

