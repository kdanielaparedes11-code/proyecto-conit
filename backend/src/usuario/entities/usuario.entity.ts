import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Usuario' })
export class Usuario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;

  @Column({ type: 'varchar' })
  tipoDocumento: string;

  @Column({ type: 'integer' })
  telefono: number;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'integer' })
  idEmpresa: number;

  @Column({ type: 'varchar' })
  numDocumento: string;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;
}

