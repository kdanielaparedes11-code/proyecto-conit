import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TareaEntregaService } from './tarea-entrega.service';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';

@Controller('tarea-entrega')
export class TareaEntregaController {
  constructor(private readonly tareaEntregaService: TareaEntregaService) {}

  @Post()
  create(@Body() createTareaEntregaDto: CreateTareaEntregaDto) {
    return this.tareaEntregaService.create(createTareaEntregaDto);
  }

  @Get()
  findAll() {
    return this.tareaEntregaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tareaEntregaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTareaEntregaDto: UpdateTareaEntregaDto) {
    return this.tareaEntregaService.update(+id, updateTareaEntregaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tareaEntregaService.remove(+id);
  }
}
