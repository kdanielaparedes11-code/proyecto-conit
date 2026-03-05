import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Temario } from './entities/temario.entity';
import { TemarioService } from './temario.service';
import { TemarioController } from './temario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Temario])],
  controllers: [TemarioController],
  providers: [TemarioService],
})
export class TemarioModule {}


