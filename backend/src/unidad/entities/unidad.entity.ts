import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Unidad' }) // Respeta el nombre exacto en BD
export class Unidad {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  nombreUnidad: string;

  @Column({ type: 'integer' })
  idTemario: number;

  @Column({ type: 'integer' })
  idSesion: number;
}
