import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Temario' }) // Respeta el nombre exacto en BD
export class Temario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tituloModulo: string;

  @Column({ type: 'varchar' })
  detalleLecciones: string;

  @Column({ type: 'numeric' })
  evaluacion: number;

  @Column({ type: 'integer' })
  idContenido: number;

  @Column({ type: 'integer' })
  idUnidad: number;
}
