import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Pago' }) // Respeta el nombre exacto en BD
export class Pago {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fechaPago: Date;

  @Column({ type: 'numeric' })
  igv: number;

  @Column({ type: 'numeric' })
  precioInicial: number;

  @Column({ type: 'numeric' })
  precioFinal: number;

  @Column({ type: 'numeric' })
  precioDescuento: number;

  @Column({ type: 'varchar' })
  tipoPago: string;

  @Column({ type: 'numeric' })
  idPagoDoc: number;

  @Column({ type: 'numeric' })
  idTipoComprobante: number;

  @Column({ type: 'varchar' })
  descripcion: string;
}
