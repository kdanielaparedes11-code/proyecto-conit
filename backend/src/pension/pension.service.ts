import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pension } from './entities/pension.entity';

@Injectable()
export class PensionService {
  constructor(
    @InjectRepository(Pension)
    private pensionRepository: Repository<Pension>,
  ) {}

  findAll() {
    return this.pensionRepository.find({
      relations: [
        'matricula',
        'matricula.alumno',
        'matricula.grupo',
        'matricula.grupo.curso',
      ],
    });
  }
}
