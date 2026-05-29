import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionSesionesVivo } from './entities/configuracion-sesiones-vivo.entity';
import { ConfiguracionSesionesVivoService } from './configuracion-sesiones-vivo.service';
import { ConfiguracionSesionesVivoController } from './configuracion-sesiones-vivo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionSesionesVivo])],
  controllers: [ConfiguracionSesionesVivoController],
  providers: [ConfiguracionSesionesVivoService],
  exports: [ConfiguracionSesionesVivoService],
})
export class ConfiguracionSesionesVivoModule {}