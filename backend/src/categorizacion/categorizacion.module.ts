import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categorizacion } from './entities/categorizacion.entity';
import { CategorizacionService } from './categorizacion.service';
import { CategorizacionController } from './categorizacion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Categorizacion])],
  controllers: [CategorizacionController],
  providers: [CategorizacionService],
})
export class CategorizacionModule {}
