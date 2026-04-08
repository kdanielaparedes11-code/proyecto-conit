import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ExamenService } from './examen.service';

@Controller('examen')
export class ExamenController {
  constructor(private readonly examenService: ExamenService) {}

  @Post(':id/iniciar')
  iniciar(@Param('id') id: number, @Body() body) {
    return this.examenService.iniciarIntento(id, body.idAlumno);
  }

  @Post(':id/responder')
  responder(@Param('id') id: number, @Body() body) {
    return this.examenService.responder(
      id,
      body.respuestas,
      body.idAlumno
    );
  }
}
