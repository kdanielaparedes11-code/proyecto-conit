import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  idEmpresa: number;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;
  
  @Column({ type: 'varchar', unique: true })
  correo: string;

}
