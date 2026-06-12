import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { ComprobantePagoService } from './comprobante-pago.service';
import { ComprobantePagoController } from './comprobante-pago.controller';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Matricula } from '../matricula/entities/matricula.entity';
import { ConfiguracionPago } from '../pago/entities/configuracion-pago.entity';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComprobantePago,
      Alumno,
      Grupo,
      Matricula,
      ConfiguracionPago,
    ]),
  ],
  controllers: [ComprobantePagoController],
  providers: [ComprobantePagoService, S3Service],
})
export class ComprobantePagoModule {}