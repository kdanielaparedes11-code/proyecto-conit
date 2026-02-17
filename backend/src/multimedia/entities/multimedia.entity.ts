import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Multimedia' }) // Respeta el nombre exacto en BD
export class Multimedia {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombreArchivo: string;

  @Column({ type: 'varchar' })
  tipo: string;

  @Column({ type: 'text' })
  rutaArchivo: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'date' })
  fechaSubida: Date;

  @Column({ type: 'boolean' })
  estado: boolean;

  @Column({ type: 'integer' })
  idUsuario: number;
}

