import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MatriculaService } from './matricula.service';
import { Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('matricula')
export class MatriculaController {

  constructor(private readonly matriculaService: MatriculaService) {}

  @Post()
crear(@Body() body){

  return this.matriculaService.crear(
    body.alumnoId,
    body.grupoId,
    body.nombreCurso
  );

}

@Get('alumno/:idalumno')
  findByAlumno(@Param('idalumno', ParseIntPipe) idalumno: number) {
    return this.matriculaService.findByAlumno(idalumno);
  }

}