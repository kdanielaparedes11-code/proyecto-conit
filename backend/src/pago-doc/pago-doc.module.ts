import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagoDoc } from './entities/pago-doc.entity';
import { PagoDocService } from './pago-doc.service';
import { PagoDocController } from './pago-doc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PagoDoc])],
  controllers: [PagoDocController],
  providers: [PagoDocService],
})
export class PagoDocModule {}