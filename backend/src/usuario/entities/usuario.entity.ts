import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'integer' })
  idEmpresa: number;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;
}
