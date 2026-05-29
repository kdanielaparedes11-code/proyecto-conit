import { Injectable } from '@nestjs/common';
import { CreateTareaEntregaDto } from './dto/create-tarea-entrega.dto';
import { UpdateTareaEntregaDto } from './dto/update-tarea-entrega.dto';

@Injectable()
export class TareaEntregaService {
  create(createTareaEntregaDto: CreateTareaEntregaDto) {
    return 'This action adds a new tareaEntrega';
  }

  findAll() {
    return `This action returns all tareaEntrega`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tareaEntrega`;
  }

  update(id: number, updateTareaEntregaDto: UpdateTareaEntregaDto) {
    return `This action updates a #${id} tareaEntrega`;
  }

  remove(id: number) {
    return `This action removes a #${id} tareaEntrega`;
  }
}
