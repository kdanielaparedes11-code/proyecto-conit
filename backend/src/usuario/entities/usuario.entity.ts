import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Alumno } from '../../alumno/entities/alumno.entity';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'integer' })
  idempresa: number;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;

  @Column('text', { array: true, default: [] })
  historialcontrasenias: string[];

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Alumno, (alumno) => alumno.usuario)
  alumnos: Alumno[];
}
