import { IsIn, IsNotEmpty } from 'class-validator';

export const MODOS_SELECCION_PROVEEDOR = [
  'SOLO_PREDETERMINADO',
  'DOCENTE_PUEDE_ELEGIR',
  'ADMIN_PUEDE_ELEGIR',
  'TODOS_PUEDEN_ELEGIR',
] as const;

export type ModoSeleccionProveedor =
  (typeof MODOS_SELECCION_PROVEEDOR)[number];

export class UpdateConfiguracionSesionesVivoDto {
  @IsNotEmpty()
  @IsIn(MODOS_SELECCION_PROVEEDOR)
  modoSeleccionProveedor: ModoSeleccionProveedor;
}