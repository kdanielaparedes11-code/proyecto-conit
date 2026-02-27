import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Grupo' }) // Respeta el nombre exacto en BD
export class Grupo {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreGrupo: string;

  @Column({ type: 'varchar' })
  horario: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'varchar' })
  modalidad: string;

  @Column({ type: 'integer' })
  cantidadPersonas: number;

  @Column({ type: 'integer' })
  idCurso: number;

  @Column({ type: 'integer' })
  idDocente: number;
}
