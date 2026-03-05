import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

<<<<<<< HEAD
@Entity({ name: 'sesion' }) // Respeta el nombre exacto en BD
=======
@Entity({ name: 'Sesion' }) // Respeta el nombre exacto en BD
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Sesion {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
<<<<<<< HEAD
  nombresesion: string;

  @Column({ type: 'integer' })
  idevaluacion: number;
=======
  nombreSesion: string;

  @Column({ type: 'integer' })
  idEvaluacion: number;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
}
