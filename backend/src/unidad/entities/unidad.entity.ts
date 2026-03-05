<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany  } from 'typeorm';
import { Sesion } from '../../sesion/entities/sesion.entity';
import { Temario } from '../../temario/entities/temario.entity';

@Entity({ name: 'unidad' })
=======
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Unidad' }) // Respeta el nombre exacto en BD
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Unidad {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
<<<<<<< HEAD
  nombreunidad: string;

  @ManyToOne(
    () => Temario,
    (temario) => temario.unidades,
    { nullable: true }
  )
  @JoinColumn({ name: 'idtemario' })
  temario?: Temario;

  @ManyToOne(() => Sesion, { nullable: true })
  @JoinColumn({ name: 'idsesion' })
  sesion?: Sesion;
}
=======
  nombreUnidad: string;

  @Column({ type: 'integer' })
  idTemario: number;

  @Column({ type: 'integer' })
  idSesion: number;
}
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
