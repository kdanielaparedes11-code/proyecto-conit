import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';

@Injectable()
export class CursoService {
<<<<<<< HEAD
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
  ) {}
  async findAll() {
    return await this.cursoRepository.find({
      order: { id: 'DESC' }, //Traemos los cursos ordenados por id de forma descendente, es decir, los más recientes primero
    });
  }

  async remove(id: number) {
    await this.cursoRepository.update(id, { estado: false });
    return { message: 'Curso inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.cursoRepository.update(id, { estado: true });
    return { message: 'Curso habilitado correctamente' };
  }
}
=======
    constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
  ) {}

  async listarCursos(): Promise<Curso[]> {
    return await this.cursoRepository.find();
  }

  async obtenerUno(id: number) {
    return this.cursoRepository.findOne({
        where: { id }
    });
    }

  async findAll() {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion'
      ],
    });
  }

  async listarCursosAlumno(): Promise<Curso[]> {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion'
      ]
    });
  }

async obtenerUnoCursoAlumno(id: number): Promise<Curso | null> {
  return this.cursoRepository.findOne({
    where: { id },
    relations: [
      'grupos',
      'grupos.docente',
      'temario',
      'temario.unidades',
      'temario.unidades.sesion'
    ]
  });
}

}
>>>>>>> c0fa001c855a26e4874a87dcfb1053b49cef9b56
