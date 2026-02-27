import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'RequisitoPrevio' }) // Respeta el nombre exacto en BD
export class RequisitoPrevio {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;
}
