import { Module } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { UnidadController } from './unidad.controller';

@Module({
  providers: [UnidadService],
  controllers: [UnidadController]
})
export class UnidadModule {}
