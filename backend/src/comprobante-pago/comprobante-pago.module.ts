import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { ComprobantePagoService } from './comprobante-pago.service';
import { ComprobantePagoController } from './comprobante-pago.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComprobantePago])],
  controllers: [ComprobantePagoController],
  providers: [ComprobantePagoService],
})
export class ComprobantePagoModule {}
