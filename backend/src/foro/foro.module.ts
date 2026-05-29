import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ForoController } from './foro.controller';
import { ForoService } from './foro.service';

import { ForoPublicacion } from './entities/foro-publicacion.entity';
import { ForoRespuesta } from './entities/foro-respuesta.entity';
import { ForoAdjunto } from './entities/foro-adjunto.entity';
import { ForoReaccion } from './entities/foro-reaccion.entity';

import { Grupo } from '../grupo/entities/grupo.entity';
import { Docente } from '../docente/entities/docente.entity';
// 👇 1. Importamos la entidad Alumno
import { Alumno } from '../alumno/entities/alumno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ForoPublicacion,
      ForoRespuesta,
      ForoAdjunto,
      ForoReaccion,
      Grupo,
      Docente,
      Alumno,
    ]),
  ],
  controllers: [ForoController],
  providers: [ForoService],
  exports: [ForoService],
})
export class ForoModule {}
