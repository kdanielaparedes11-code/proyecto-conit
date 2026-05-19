import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ForoService } from './foro.service';
import { CrearPublicacionForoDto } from './dto/crear-publicacion-foro.dto';
import { ActualizarPublicacionForoDto } from './dto/actualizar-publicacion-foro.dto';
import { CrearRespuestaForoDto } from './dto/crear-respuesta-foro.dto';
import { CrearAdjuntoForoDto } from './dto/crear-adjunto-foro.dto';
import { GuardarReaccionForoDto } from './dto/guardar-reaccion-foro.dto';

@UseGuards(JwtAuthGuard)
@Controller('foro')
export class ForoController {
  constructor(private readonly foroService: ForoService) {}

  @Get('grupo/:idgrupo/publicaciones')
  getPublicacionesByGrupo(@Param('idgrupo') idgrupo: string, @Req() req: any) {
    return this.foroService.getPublicacionesByGrupo(idgrupo, req.user);
  }

  @Post('grupo/:idgrupo/publicaciones')
  crearPublicacion(
    @Param('idgrupo') idgrupo: string,
    @Body() dto: CrearPublicacionForoDto,
    @Req() req: any,
  ) {
    return this.foroService.crearPublicacion(idgrupo, dto, req.user);
  }

  @Patch('publicaciones/:id')
  actualizarPublicacion(
    @Param('id') id: string,
    @Body() dto: ActualizarPublicacionForoDto,
    @Req() req: any,
  ) {
    return this.foroService.actualizarPublicacion(id, dto, req.user);
  }

  @Delete('publicaciones/:id')
  eliminarPublicacion(@Param('id') id: string, @Req() req: any) {
    return this.foroService.eliminarPublicacion(id, req.user);
  }

  @Patch('publicaciones/:id/fijar')
  fijarPublicacion(
    @Param('id') id: string,
    @Body('fijado') fijado: boolean,
    @Req() req: any,
  ) {
    return this.foroService.fijarPublicacion(id, fijado, req.user);
  }

  @Patch('publicaciones/:id/cerrar')
  cerrarPublicacion(
    @Param('id') id: string,
    @Body('cerrado') cerrado: boolean,
    @Req() req: any,
  ) {
    return this.foroService.cerrarPublicacion(id, cerrado, req.user);
  }

  @Get('publicaciones/:id/respuestas')
  getRespuestasByPublicacion(@Param('id') id: string, @Req() req: any) {
    return this.foroService.getRespuestasByPublicacion(id, req.user);
  }

  @Post('publicaciones/:id/respuestas')
  crearRespuesta(
    @Param('id') id: string,
    @Body() dto: CrearRespuestaForoDto,
    @Req() req: any,
  ) {
    return this.foroService.crearRespuesta(id, dto, req.user);
  }

  @Delete('respuestas/:id')
  eliminarRespuesta(@Param('id') id: string, @Req() req: any) {
    return this.foroService.eliminarRespuesta(id, req.user);
  }

  @Post('adjuntos')
  crearAdjunto(@Body() dto: CrearAdjuntoForoDto, @Req() req: any) {
    return this.foroService.crearAdjunto(dto, req.user);
  }

  @Get('publicaciones/:id/adjuntos')
  getAdjuntosByPublicacion(@Param('id') id: string, @Req() req: any) {
    return this.foroService.getAdjuntosByPublicacion(id, req.user);
  }

  @Get('respuestas/adjuntos')
  getAdjuntosByRespuestas(@Query('ids') ids: string, @Req() req: any) {
    return this.foroService.getAdjuntosByRespuestas(ids, req.user);
  }

  @Get('respuestas/:id/adjuntos')
  getAdjuntosByRespuesta(@Param('id') id: string, @Req() req: any) {
    return this.foroService.getAdjuntosByRespuesta(id, req.user);
  }

  @Delete('adjuntos/:id')
  eliminarAdjunto(@Param('id') id: string, @Req() req: any) {
    return this.foroService.eliminarAdjunto(id, req.user);
  }

  @Get('reacciones/publicaciones')
  getReaccionesByPublicaciones(@Query('ids') ids: string, @Req() req: any) {
    return this.foroService.getReaccionesByPublicaciones(ids, req.user);
  }

  @Get('reacciones/respuestas')
  getReaccionesByRespuestas(@Query('ids') ids: string, @Req() req: any) {
    return this.foroService.getReaccionesByRespuestas(ids, req.user);
  }

  @Post('publicaciones/:id/reacciones')
  guardarReaccionPublicacion(
    @Param('id') id: string,
    @Body() dto: GuardarReaccionForoDto,
    @Req() req: any,
  ) {
    return this.foroService.guardarReaccionPublicacion(
      id,
      dto.tipo,
      req.user,
    );
  }

  @Post('respuestas/:id/reacciones')
  guardarReaccionRespuesta(
    @Param('id') id: string,
    @Body() dto: GuardarReaccionForoDto,
    @Req() req: any,
  ) {
    return this.foroService.guardarReaccionRespuesta(id, dto.tipo, req.user);
  }
}