import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Matricula' }) // Respeta el nombre exacto en BD
export class Matricula {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  observacion: string;

  @Column({ type: 'varchar' })
  serie: string;

  @Column({ type: 'boolean' })
  estado: boolean;

  @Column({ type: 'varchar' })
  beneficio: string;

  @Column({ type: 'integer' })
  idAlumno: number;

  @Column({ type: 'integer' })
  idAdministrador: number;

  @Column({ type: 'integer' })
  idGrupo: number;

  @Column({ type: 'integer' })
  idCertificado: number;

  @Column({ type: 'integer' })
  idControlAcademico: number;
  
  @Column({ type: 'varchar' })
  pAcademico: string;
}
