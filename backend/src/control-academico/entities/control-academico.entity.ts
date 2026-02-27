import { Entity, Column, PrimaryGeneratedColumn, IntegerType } from 'typeorm';

@Entity({ name: 'ControlAcademico' }) // Respeta el nombre exacto en BD
export class ControlAcademico {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  cantAsistencia: number;

  @Column({ type: 'integer' })
  cantFaltas: number;

    @Column({ type: 'varchar' })
  observacion: string;

    @Column({ type: 'date' })
    fechaAsistencia: Date;

    @Column({ type: 'date' })
    fechaFalta: Date;
}
