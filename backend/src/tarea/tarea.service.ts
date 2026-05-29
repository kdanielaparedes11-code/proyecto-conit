import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarea } from './entities/tarea.entity';
import { TareaEntrega } from 'src/tarea-entrega/entities/tarea-entrega.entity';

@Injectable()
export class TareaService {
  constructor(
    @InjectRepository(Tarea) private tareaRepository: Repository<Tarea>,
    @InjectRepository(TareaEntrega)
    private entregaRepository: Repository<TareaEntrega>,
  ) {}

  async obtenerPorCurso(idcurso: number) {
    return this.tareaRepository
      .createQueryBuilder('p')
      .where('p.idcurso = :idcurso', { idcurso })
      .orderBy('p.fecha_limite', 'ASC')
      .getMany();
  }

  async crearEntrega(data: any) {
    // 1. Validamos que la tarea exista
    const tarea = await this.tareaRepository.findOne({
      where: { id: data.idtarea },
    });

    if (!tarea) {
      throw new BadRequestException('La tarea especificada no existe.');
    }

    // 2. Validamos la fecha
    const ahora = new Date();
    const fechaLimite = new Date(tarea.fecha_limite);
    fechaLimite.setHours(23, 59, 59, 999);

    if (ahora > fechaLimite) {
      throw new BadRequestException(
        'El plazo para entregar esta tarea ha vencido.',
      );
    }

    // 3. Verificamos duplicados (ahora podemos usar los IDs directamente)
    const entregaExistente = await this.entregaRepository.findOne({
      where: {
        idtarea: data.idtarea,
        idmatricula: data.idmatricula,
      },
    });

    if (entregaExistente) {
      throw new BadRequestException(
        'Ya has realizado una entrega para esta tarea.',
      );
    }

    // 4. CREACIÓN DIRECTA: Pasamos todos los datos planos (sin objetos anidados)
    const entrega = this.entregaRepository.create({
      idtarea: data.idtarea,
      idalumno: data.idalumno,
      idmatricula: data.idmatricula,
      comentario: data.comentario,
      archivo_url: data.archivo_url,
    });

    return await this.entregaRepository.save(entrega);
  }
}
