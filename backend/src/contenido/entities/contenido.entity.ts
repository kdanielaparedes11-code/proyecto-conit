import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Contenido' }) // Respeta el nombre exacto en BD
export class Contenido {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  contenidoMultimedia: string;
}
