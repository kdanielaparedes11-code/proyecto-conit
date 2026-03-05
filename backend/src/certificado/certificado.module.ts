import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificado } from './entities/certificado.entity';
import { CertificadoService } from './certificado.service';
import { CertificadoController } from './certificado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado])],
  controllers: [CertificadoController],
  providers: [CertificadoService],
})
export class CertificadoModule {}
