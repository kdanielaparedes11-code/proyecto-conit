import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class AlumnoService {

  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {}

  async findOne(id: number) {
    const alumno = await this.alumnoRepository.findOneBy({ id });

    if (!alumno) {
        throw new NotFoundException('Alumno no encontrado');
    }

  return alumno;
}

  async update(id: number, data: Partial<Alumno>) {
    await this.alumnoRepository.update(id, data);
    return this.findOne(id);
  }
}