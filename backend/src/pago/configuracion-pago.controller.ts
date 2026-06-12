import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracionPagoService } from './configuracion-pago.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Configuración de Pasarelas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('config-pago')
export class ConfiguracionPagoController {
  constructor(private readonly configService: ConfiguracionPagoService) {}

  // ============================
  // LISTADO GENERAL DE PASARELAS
  // ============================
  @Get('pasarelas')
  listarPasarelas() {
    return this.configService.listarPasarelas();
  }

  // ============================
  // CUENTAS BANCARIAS
  // ============================
  @Get('cuentas/bancarias')
  listarCuentas() {
    return this.configService.listarCuentasBancarias();
  }

  @Post('cuentas/bancarias')
  agregarCuenta(@Body() body: any) {
    return this.configService.agregarCuentaBancaria(body);
  }

  @Patch('cuentas/bancarias/:id')
  actualizarCuenta(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.configService.actualizarCuentaBancaria(id, body);
  }

  @Delete('cuentas/bancarias/:id')
  eliminarCuenta(@Param('id', ParseIntPipe) id: number) {
    return this.configService.eliminarCuentaBancaria(id);
  }

  // ============================
  // PASARELAS ÚNICAS
  // YAPE, MERCADOPAGO, PAYPAL, IZIPAY
  // ============================
  @Get(':pasarela')
  obtenerConfig(@Param('pasarela') pasarela: string) {
    return this.configService.obtenerConfiguracion(pasarela);
  }

  @Post(':pasarela')
  guardarConfig(
    @Param('pasarela') pasarela: string,
    @Body() body: any,
  ) {
    return this.configService.guardarPasarela(pasarela, body);
  }
}