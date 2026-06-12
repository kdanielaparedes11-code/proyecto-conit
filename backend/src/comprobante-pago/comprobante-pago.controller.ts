import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ComprobantePagoService } from './comprobante-pago.service';

@ApiTags('Comprobantes de pago')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comprobante-pago')
export class ComprobantePagoController {
  constructor(
    private readonly comprobantePagoService: ComprobantePagoService,
  ) {}

  @Post('transferencia')
  @UseInterceptors(FileInterceptor('voucher'))
  crearSolicitudTransferencia(
    @Body() body: any,
    @UploadedFile() file: any,
  ) {
    return this.comprobantePagoService.crearSolicitudTransferencia(body, file);
  }

  @Get('admin')
  listarAdmin(@Query('estado') estado?: string) {
    return this.comprobantePagoService.listarAdmin(estado);
  }

  @Get('admin/:id')
  obtenerDetalleAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.comprobantePagoService.obtenerDetalleAdmin(id);
  }

  @Get('admin/:id/voucher-url')
  obtenerVoucherUrl(@Param('id', ParseIntPipe) id: number) {
    return this.comprobantePagoService.obtenerVoucherUrl(id);
  }

  @Post('admin/:id/aprobar')
  aprobarYMatricular(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.comprobantePagoService.aprobarYMatricular(id, body);
  }

  @Post('admin/:id/rechazar')
  rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.comprobantePagoService.rechazar(id, body);
  }

  @Post('admin/:id/observar')
  observar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.comprobantePagoService.observar(id, body);
  }
}