<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Docente } from '../../docente/entities/docente.entity';
import { Curso } from '../../curso/entities/curso.entity';

@Entity({ name: 'grupo' }) // Respeta el nombre exacto en BD
=======
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Grupo' }) // Respeta el nombre exacto en BD
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Grupo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
<<<<<<< HEAD
  nombregrupo: string;
=======
  nombreGrupo: string;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5

  @Column({ type: 'varchar' })
  horario: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  modalidad: string;

  @Column({ type: 'integer' })
<<<<<<< HEAD
  cantidadpersonas: number;

  @ManyToOne(
    () => Curso,
    (curso) => curso.grupos,
    { nullable: true }
  )
  @JoinColumn({ name: 'idcurso' })
  curso?: Curso;

  @ManyToOne(() => Docente, { nullable: true })
    @JoinColumn({ name: 'iddocente' })
    docente?: Docente;
=======
  cantidadPersonas: number;

  @Column({ type: 'integer' })
  idCurso: number;

  @Column({ type: 'integer' })
  idDocente: number;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
}
