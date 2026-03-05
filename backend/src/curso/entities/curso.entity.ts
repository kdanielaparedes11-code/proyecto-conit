<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Temario } from '../../temario/entities/temario.entity';

@Entity({ name: 'curso' })
=======
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Curso' })
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Curso {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  descripcion: string;

  @Column({ type: 'text', nullable: true })
<<<<<<< HEAD
  contenidomultimedia: string;

  @Column({ type: 'varchar', nullable: true })
  nombrecurso: string;

  @Column({ type: 'varchar', nullable: true })
  publicoobjetivo: string;
=======
  contenidoMultimedia: string;

  @Column({ type: 'varchar', nullable: true })
  nombreCurso: string;

  @Column({ type: 'varchar', nullable: true })
  publicoObjetivo: string;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5

  @Column({ type: 'int', nullable: true })
  duracion: number;

  @Column({ type: 'int', nullable: true })
  creditos: number;

  @Column({ type: 'varchar', nullable: true })
  nivel: string;

  @Column({ type: 'boolean', nullable: true })
  estado: boolean;

  @Column({ type: 'int', nullable: true })
<<<<<<< HEAD
  idrequisito: number;

  @ManyToOne(() => Temario, { nullable: true })
      @JoinColumn({ name: 'idtemario' })
      temario?: Temario;

  @Column({ type: 'int', nullable: true })
  idcategorizacion: number;

  @Column({ type: 'varchar', nullable: true })
  tiemposemana: string;

  @OneToMany(
      () => Grupo,
      (grupo) => grupo.curso
    )
    grupos: Grupo[];
=======
  idRequisito: number;

  @Column({ type: 'int', nullable: true })
  idTemario: number;

  @Column({ type: 'int', nullable: true })
  idCategorizacion: number;

  @Column({ type: 'varchar', nullable: true })
  tiempoSemanal: string;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
}
