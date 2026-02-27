import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Certificado' })
export class Certificado {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  codigoCertificado: string;

  @Column({ type: 'bytea', nullable: true })
  codigoQR: Buffer;

  @Column({ type: 'bytea', nullable: true })
  plantilla: Buffer;

  @Column({ type: 'date', nullable: true })
  fechaEmision: Date;

  @Column({ type: 'varchar', nullable: true })
  origen: string;
}
