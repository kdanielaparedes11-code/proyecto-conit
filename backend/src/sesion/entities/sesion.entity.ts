import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Sesion' }) // Respeta el nombre exacto en BD
export class Sesion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreSesion: string;

  @Column({ type: 'integer' })
  idEvaluacion: number;
}
