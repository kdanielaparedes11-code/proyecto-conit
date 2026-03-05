<<<<<<< HEAD
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Unidad } from '../../unidad/entities/unidad.entity';

@Entity({ name: 'temario' })
=======
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Temario' }) // Respeta el nombre exacto en BD
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
export class Temario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
<<<<<<< HEAD
  titulomodulo: string;

  @Column({ type: 'varchar' })
  detallelecciones: string;
=======
  tituloModulo: string;

  @Column({ type: 'varchar' })
  detalleLecciones: string;
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5

  @Column({ type: 'numeric' })
  evaluacion: number;

  @Column({ type: 'integer' })
<<<<<<< HEAD
  idcontenido: number;

  @OneToMany(
    () => Unidad,
    (unidad) => unidad.temario
  )
  unidades: Unidad[];
}
=======
  idContenido: number;

  @Column({ type: 'integer' })
  idUnidad: number;
}
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
