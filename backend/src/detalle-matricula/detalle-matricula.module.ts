import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleMatricula } from './entities/detalle-matricula.entity';
import { DetalleMatriculaService } from './detalle-matricula.service';
import { DetalleMatriculaController } from './detalle-matricula.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleMatricula])],
  controllers: [DetalleMatriculaController],
  providers: [DetalleMatriculaService],
})
export class DetalleMatriculaModule {}

