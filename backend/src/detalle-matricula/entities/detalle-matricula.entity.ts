import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'DetalleMatricula' }) // Respeta el nombre exacto en BD
export class DetalleMatricula {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'date' })
  fechaInscripcion: Date;

  @Column({ type: 'integer' })
  idMatricula: number;

  @Column({ type: 'integer' })
  idPago: number;
}
