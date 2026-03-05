import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlAcademico } from './entities/control-academico.entity';
import { ControlAcademicoService } from './control-academico.service';
import { ControlAcademicoController } from './control-academico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ControlAcademico])],
  controllers: [ControlAcademicoController],
  providers: [ControlAcademicoService],
})
export class ControlAcademicoModule {}

