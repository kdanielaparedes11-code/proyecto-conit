import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Empresa' }) // Respeta el nombre exacto en BD
export class Empresa {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreEmpresa: string;

  @Column({ type: 'varchar' })
  rubro: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  distrito: string;

  @Column({ type: 'varchar' })
  provincia: string;

  @Column({ type: 'varchar' })
  departamento: string;

  @Column({ type: 'char' })
  ruc: string;
}
