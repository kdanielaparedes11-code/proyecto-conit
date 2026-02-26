import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { DocenteModule } from './docente/docente.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // importante
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT')!),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // solo desarrollo
      }),
    }),
    //Configuración del módulo de correo
    MailerModule.forRoot({
      //Toda la conexión con el servicio de correo, en este caso ethereal.email
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'aileen.stracke@ethereal.email',
          pass: 'YmeNPD6mkBxUMNvjPx',
        },
      },
      defaults: {
        from: '"Soporte" <antonio@conit.lat>', //Quien envía el correo
      },
    }),

    UsuarioModule,
    AuthModule,
    DocenteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
