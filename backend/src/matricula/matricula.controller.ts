import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MatriculaService } from './matricula.service';

@Controller('matricula')
export class MatriculaController {
  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
  crear(@Body() body) {
    return this.matriculaService.crear(
      body.alumnoId,
      body.grupoId,
      body.nombreCurso,
    );
  }

  @Get('alumno/:id')
  obtenerPorAlumno(@Param('id') id: number) {
    return this.matriculaService.obtenerPorAlumno(id);
  }
}
