import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
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
  async obtenerCurso(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.obtenerUnoCursoAlumno(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.remove(id);
  }

  @Patch(':id/habilitar')
  habilitar(@Param('id', ParseIntPipe) id: number) {
    return this.cursoService.habilitar(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.cursoService.create(data);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.cursoService.update(id, data);
  }
}
