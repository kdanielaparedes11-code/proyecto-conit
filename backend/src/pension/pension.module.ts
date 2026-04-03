import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pension } from './entities/pension.entity'; 
import { PensionService } from './pension.service';
import { PensionController } from './pension.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pension])],
  controllers: [PensionController],
  providers: [PensionService],
})
export class PensionModule {}
