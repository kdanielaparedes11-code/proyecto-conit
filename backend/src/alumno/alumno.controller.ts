import { Controller, Put, Get, Param, Body } from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { Alumno } from './entities/alumno.entity';

@Controller('alumno')
export class AlumnoController {

  constructor(private readonly alumnoService: AlumnoService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alumnoService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Alumno>,
  ) {
    return this.alumnoService.update(+id, body);
  }
}