import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { MeetingProviderConfigService } from './meeting-provider-config.service';
import { CreateMeetingProviderConfigDto } from './dto/create-meeting-provider-config.dto';
import { UpdateMeetingProviderConfigDto } from './dto/update-meeting-provider-config.dto';

@UseGuards(JwtAuthGuard)
@Controller('meeting-provider-config')
export class MeetingProviderConfigController {
  constructor(private readonly service: MeetingProviderConfigService) {}

  @Get('empresa/:idempresa')
  listarPorEmpresa(@Param('idempresa', ParseIntPipe) idempresa: number) {
    return this.service.listarPorEmpresa(idempresa);
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CreateMeetingProviderConfigDto) {
    return this.service.crear(dto);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeetingProviderConfigDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Patch(':id/predeterminado')
  marcarPredeterminado(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarPredeterminado(id);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}