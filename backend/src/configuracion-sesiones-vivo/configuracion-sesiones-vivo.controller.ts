import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { ConfiguracionSesionesVivoService } from './configuracion-sesiones-vivo.service';
import { UpdateConfiguracionSesionesVivoDto } from './dto/update-configuracion-sesiones-vivo.dto';

@UseGuards(JwtAuthGuard)
@Controller('configuracion-sesiones-vivo')
export class ConfiguracionSesionesVivoController {
  constructor(
    private readonly service: ConfiguracionSesionesVivoService,
  ) {}

  @Get('empresa/:idempresa')
  obtenerPorEmpresa(
    @Param('idempresa', ParseIntPipe) idempresa: number,
  ) {
    return this.service.obtenerPorEmpresa(idempresa);
  }

  @Patch('empresa/:idempresa')
  actualizarPorEmpresa(
    @Param('idempresa', ParseIntPipe) idempresa: number,
    @Body() dto: UpdateConfiguracionSesionesVivoDto,
  ) {
    return this.service.actualizarPorEmpresa(idempresa, dto);
  }
}