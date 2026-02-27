import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequisitoPrevio } from './entities/requisito-previo.entity';
import { RequisitoPrevioService } from './requisito-previo.service';
import { RequisitoPrevioController } from './requisito-previo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RequisitoPrevio])],
  controllers: [RequisitoPrevioController],
  providers: [RequisitoPrevioService],
})
export class RequisitoPrevioModule {}
