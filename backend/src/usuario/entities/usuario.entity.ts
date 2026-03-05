import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

<<<<<<< HEAD
@Entity({ name: 'usuario' })
=======
@Entity({ name: 'Usuario' })
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'integer' })
<<<<<<< HEAD
  idempresa: number;
=======
  idEmpresa: number;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'varchar' })
  rol: string;

  @Column('text', { array: true, default: [] })
<<<<<<< HEAD
  historialcontrasenias: string[];
=======
  historialContrasenias: string[];
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
}
