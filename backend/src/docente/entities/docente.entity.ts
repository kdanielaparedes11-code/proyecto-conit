import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity()
export class Docente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  tipoDocumento: string;

  @Column()
  numDocumento: string;

  @Column()
  telefono: number;

  @Column()
  direccion: string;

  @Column()
  correo: string;

  // FK hacia Usuario
  @OneToOne(() => Usuario, { nullable: true })
  @JoinColumn()
  usuario?: Usuario;
}