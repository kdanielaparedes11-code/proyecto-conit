import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
  UseInterceptors, // 👈 Importación nueva
  UploadedFile, // 👈 Importación nueva
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // 👈 Importación obligatoria para FormData
import { TareaService } from './tarea.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes, // 👈 Para Swagger
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Tareas Académicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tarea')
export class TareaController {
  constructor(private readonly tareaService: TareaService) {}

  @Get(':idcurso')
  @ApiOperation({
    summary: 'Obtener tareas por curso',
    description: 'Retorna todas las tareas asociadas a un curso específico.',
  })
  @ApiParam({ name: 'idcurso', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de tareas obtenida.' })
  async obtenerTarea(@Param('idcurso', ParseIntPipe) idcurso: number) {
    return this.tareaService.obtenerPorCurso(idcurso);
  }

  @Post('entrega')
  @ApiOperation({
    summary: 'Registrar la entrega de una tarea',
    description:
      'Guarda la respuesta o el archivo adjunto enviado por el alumno.',
  })
  @ApiConsumes('multipart/form-data') // 👈 Le decimos a Swagger que aceptamos FormData
  @UseInterceptors(FileInterceptor('file')) // 👈 ESTO ES LA MAGIA: Desencripta el FormData
  async entregarTarea(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File, // 👈 Aquí llega el archivo físico si lo envían
  ) {
    // 1. Transformamos los strings que llegan del FormData a su formato original
    const entregaData = {
      idtarea: Number(body.idtarea),
      idalumno: Number(body.idalumno),
      idmatricula: Number(body.idmatricula),
      comentario: body.comentario || null,
      archivo_url: body.archivo_url || null,
    };

    /* ⚠️ NOTA SOBRE EL ARCHIVO (S3):
      Si el alumno adjunta un archivo, este viaja en la variable "file".
      Aquí deberías llamar a tu servicio de S3 para subirlo y guardar la URL final.
      
      Ejemplo si ya tuvieras el método:
      if (file) {
         const s3Url = await this.tuServicioS3.subir(file);
         entregaData.archivo_url = s3Url;
      }
    */

    // 2. Mandamos la data limpia al servicio
    return this.tareaService.crearEntrega(entregaData);
  }
}
