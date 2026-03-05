import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Administrador' }) // Respeta el nombre exacto en BD
export class Administrador {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  apellido: string;
  
  @Column({ type: 'varchar' })
  tipoDocumento: string;

  @Column({ type: 'integer' })
  telefono: number;

  @Column({ type: 'varchar' })
  direccion: string;

  @Column({ type: 'varchar' })
  correo: string;

  @Column({ type: 'varchar' })
  numDocumento: string;

  @Column({ type: 'varchar' })
  contrasenia: string;

  @Column({ type: 'integer' })
  idUsuario: number;
}
