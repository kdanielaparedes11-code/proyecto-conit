import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CategorizacionModule } from './categorizacion/categorizacion.module';
import { CertificadoModule } from './certificado/certificado.module';
import { ComprobantePagoModule } from './comprobante-pago/comprobante-pago.module';
import { ContenidoModule } from './contenido/contenido.module';
import { ControlAcademicoModule } from './control-academico/control-academico.module';
import { CursoModule } from './curso/curso.module';
import { DetalleMatriculaModule } from './detalle-matricula/detalle-matricula.module';
import { DocenteModule } from './docente/docente.module';
import { EmpresaModule } from './empresa/empresa.module';
import { EvaluacionModule } from './evaluacion/evaluacion.module';
import { ExamenModule } from './examen/examen.module';
import { GrupoModule } from './grupo/grupo.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: '1104',
      database: 'postgres',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsuarioModule,
    CategorizacionModule,
    CertificadoModule,
    ComprobantePagoModule,
    ContenidoModule,
    ControlAcademicoModule,
    CursoModule,
    DetalleMatriculaModule,
    DocenteModule,
    EmpresaModule,
    EvaluacionModule,
    ExamenModule,
    GrupoModule,
  ],
})
export class AppModule {}

