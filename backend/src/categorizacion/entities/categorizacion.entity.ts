import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Categorizacion' }) // Respeta el nombre exacto en BD
export class Categorizacion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  descripcion: string;
}
