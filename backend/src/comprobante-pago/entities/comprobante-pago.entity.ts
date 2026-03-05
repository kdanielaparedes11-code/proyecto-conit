import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ComprobantePago' }) // Respeta el nombre exacto en BD
export class ComprobantePago {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreComprobante: string;
}
