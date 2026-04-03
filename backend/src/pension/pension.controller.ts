import { Controller, Get } from '@nestjs/common';
import { PensionService } from './pension.service';

@Controller('pension')
export class PensionController {
  constructor(private readonly pensionService: PensionService) {}

  @Get()
  findAll() {
    return this.pensionService.findAll();
  }
}
