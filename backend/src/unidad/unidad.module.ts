import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unidad } from './entities/unidad.entity';
=======
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
import { UnidadService } from './unidad.service';
import { UnidadController } from './unidad.controller';

@Module({
<<<<<<< HEAD
  imports: [TypeOrmModule.forFeature([Unidad])],
  controllers: [UnidadController],
  providers: [UnidadService],
  exports: [TypeOrmModule]
=======
  providers: [UnidadService],
  controllers: [UnidadController]
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
})
export class UnidadModule {}
