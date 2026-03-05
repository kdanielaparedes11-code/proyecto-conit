export class CreateDocenteDto {
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  telefono: number;
  direccion: string;
  correo: string;
  numDocumento: string;
  crearUsuario?: boolean; //
}