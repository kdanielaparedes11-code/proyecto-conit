export class SesionVivoResponseDto {
  id: number;
  curso: { id: number; nombrecurso?: string } | null;
  docente?: {
    nombre: string;
    apellido: string;
  } | null;
  titulo: string;
  descripcion: string | null;
  fecha: Date;
  duracion: number;
  link_reunion: string;
  provider: string;
  external_meeting_id: string | null;
  estado: string;
  idgrupo: number | null;
  access_type?: string | null;
}
