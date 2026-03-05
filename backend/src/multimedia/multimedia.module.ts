import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Multimedia } from './entities/multimedia.entity';
import { MultimediaService } from './multimedia.service';
import { MultimediaController } from './multimedia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Multimedia])],
  controllers: [MultimediaController],
  providers: [MultimediaService],
})
export class MultimediaModule {}

