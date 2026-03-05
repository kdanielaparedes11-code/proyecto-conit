import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PagoDoc' }) // Respeta el nombre exacto en BD
export class PagoDoc {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  serie: string;

  @Column({ type: 'varchar' })
  moneda: string;
}
