import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sesion } from './entities/sesion.entity';
import { SesionService } from './sesion.service';
import { SesionController } from './sesion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sesion])],
  controllers: [SesionController],
  providers: [SesionService],
})
export class SesionModule {}

