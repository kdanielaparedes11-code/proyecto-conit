<<<<<<< HEAD
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CursoService } from './curso.service';
import { Curso } from './entities/curso.entity'; 

@Controller('curso')
export class CursoController {
  constructor(private readonly cursoService: CursoService) {}

  @Get()
  async obtenerCursos(): Promise<Curso[]> {
    return this.cursoService.listarCursosAlumno();
  }

  @Get(':id')
  async obtenerCurso(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cursoService.obtenerUnoCursoAlumno(id);
  }
}
=======
import { Controller } from '@nestjs/common';

@Controller('curso')
export class CursoController {}
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
