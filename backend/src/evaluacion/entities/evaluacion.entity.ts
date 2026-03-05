import { Entity, Column, PrimaryGeneratedColumn, NumericType } from 'typeorm';

@Entity({ name: 'Evaluacion' }) // Respeta el nombre exacto en BD
export class Evaluacion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'integer' })
  idExamen: number;

  @Column({ type: 'numeric' })
  modoCalificacion: number;
}
