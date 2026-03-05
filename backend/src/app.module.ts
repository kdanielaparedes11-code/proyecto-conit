import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
<<<<<<< HEAD
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocenteModule } from './docente/docente.module';
import { AlumnoModule } from './alumno/alumno.module';
import { CursoModule } from './curso/curso.module';
import { TemarioModule } from './temario/temario.module';
import { UnidadModule } from './unidad/unidad.module';
import { SesionModule } from './sesion/sesion.module';
import { GrupoModule } from './grupo/grupo.module';
=======
import { DocenteModule } from './docente/docente.module';
import { AlumnoModule } from './alumno/alumno.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5

import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
<<<<<<< HEAD
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: 'postgresql://postgres:jcmkd2118110497@db.bwnuvmawjpettbqogmgk.supabase.co:5432/postgres',
        ssl: {
          rejectUnauthorized: false, // Esto funcionará perfecto con Supabase
        },
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
=======
  isGlobal: true,
  envFilePath: join(__dirname, '..', '.env'),
}),

    TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get<string>('DATABASE_URL'),
    ssl: {
      rejectUnauthorized: false,
    },
    autoLoadEntities: true,
    synchronize: false,
  }),
}),
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'aileen.stracke@ethereal.email',
          pass: 'YmeNPD6mkBxUMNvjPx',
        },
      },
      defaults: {
        from: '"Soporte" <antonio@conit.lat>',
      },
    }),

    UsuarioModule,
    AuthModule,
    DocenteModule,
    AlumnoModule,
<<<<<<< HEAD
    CursoModule,
    TemarioModule,
    UnidadModule,
    SesionModule,
    GrupoModule,
=======
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
  ],
  controllers: [AppController],
  providers: [AppService],
})
<<<<<<< HEAD
export class AppModule {}
=======
export class AppModule {}
>>>>>>> 05542c37d34b8b0e415c3ea79bf733b199403bb5
