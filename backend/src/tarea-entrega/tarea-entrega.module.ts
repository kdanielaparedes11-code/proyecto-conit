import { Module } from '@nestjs/common';
import { TareaEntregaService } from './tarea-entrega.service';
import { TareaEntregaController } from './tarea-entrega.controller';

@Module({
  controllers: [TareaEntregaController],
  providers: [TareaEntregaService],
})
export class TareaEntregaModule {}
