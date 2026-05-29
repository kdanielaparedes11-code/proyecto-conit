import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareaService } from './tarea.service';
import { TareaController } from './tarea.controller';
import { TareaEntrega } from 'src/tarea-entrega/entities/tarea-entrega.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarea, TareaEntrega])],
  controllers: [TareaController],
  providers: [TareaService],
  exports: [TareaService],
})
export class TareaModule {}
