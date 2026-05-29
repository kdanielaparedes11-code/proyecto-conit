import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from './entities/curso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Grupo } from 'src/grupo/entities/grupo.entity';
import { Matricula } from 'src/matricula/entities/matricula.entity';

@Injectable()
export class CursoService {
  constructor(
    @InjectRepository(Curso)
    private cursoRepository: Repository<Curso>,
    @InjectRepository(Grupo)
    private readonly grupoRepository: Repository<Grupo>,
    @InjectRepository(Matricula)
    private readonly matriculaRepository: Repository<Matricula>,
  ) {}

  async listarCursos(): Promise<Curso[]> {
    return await this.cursoRepository.find();
  }

  async obtenerUno(id: number) {
    return this.cursoRepository.findOne({
      where: { id },
      relations: ['grupos', 'grupos.docente'],
    });
  }

  async findAll() {
    return this.cursoRepository.find({
      relations: [
        'grupos',
        'grupos.docente',
        'temario',
        'temario.unidades',
        'temario.unidades.sesion',
      ],
    });
  }

  async listarCursosAlumno(idAlumno: number) {
    console.log('ID ALUMNO BACK:', idAlumno);

    const data = await this.matriculaRepository
      .createQueryBuilder('matricula')

      .innerJoinAndSelect('matricula.grupo', 'grupo')
      .innerJoinAndSelect('grupo.curso', 'curso')
      .leftJoinAndSelect('grupo.docente', 'docente')

      .leftJoinAndSelect('matricula.alumno', 'alumno')

      // 🔥 FILTRO CORRECTO
      .where('alumno.id = :idAlumno', { idAlumno })

      .getMany();

    console.log('MATRICULAS ENCONTRADAS:', data.length);

    return data;
  }
  async obtenerUnoCursoAlumno(idCurso: number, idAlumno: number) {
    if (!idAlumno || isNaN(idAlumno)) {
      throw new Error('idalumno inválido');
    }

    // 1. Obtener el curso con toda su estructura de módulos
    const curso = await this.cursoRepository
      .createQueryBuilder('curso')
      .leftJoin('curso.grupos', 'grupo')
      .innerJoin('grupo.matriculas', 'matricula')
      .innerJoin('matricula.alumno', 'alumno')
      .where('curso.id = :idCurso', { idCurso })
      .andWhere('alumno.id = :idAlumno', { idAlumno })
      .leftJoinAndSelect(
        'curso.modulos',
        'modulo',
        '(modulo.idgrupo = grupo.id)',
      )
      .leftJoinAndSelect('modulo.padre', 'padre')
      .leftJoinAndSelect('modulo.hijos', 'hijos')
      .leftJoinAndSelect('modulo.lecciones', 'leccion')
      .leftJoinAndSelect('leccion.materiales', 'material')
      .leftJoinAndSelect('leccion.examenes', 'examen')
      .leftJoinAndSelect('examen.preguntas', 'pregunta')
      .leftJoinAndSelect('pregunta.opciones', 'opcion')
      .distinct(true)
      .getOne();

    if (curso) {
      // 2. BUSCAR EL ID DEL GRUPO usando la relación (objeto) y no la columna (id)
      const matricula = await this.matriculaRepository.findOne({
        where: {
          alumno: { id: idAlumno }, // Filtramos por el objeto alumno
          grupo: {
            curso: { id: idCurso }, // Filtramos por el objeto grupo y su curso
          },
          estado: 'pagado',
        },
        relations: ['grupo'], // Cargamos el grupo para acceder a su ID
      });

      // 3. Inyectamos el idgrupo accediendo a través de la relación
      (curso as any).idgrupo =
        matricula && matricula.grupo ? matricula.grupo.id : null;
      // Lógica del árbol de módulos (la que ya tenías)
      if (curso.modulos) {
        const mapa: any = {};
        curso.modulos.forEach((m: any) => {
          mapa[m.id] = { ...m, hijos: [] };
        });
        const arbol: any[] = [];
        curso.modulos.forEach((m: any) => {
          if (m.idpadre && mapa[m.idpadre]) {
            mapa[m.idpadre].hijos.push(mapa[m.id]);
          } else {
            arbol.push(mapa[m.id]);
          }
        });
        curso.modulos = arbol;
      }
    }

    return curso;
  }
  async remove(id: number) {
    await this.cursoRepository.update(id, { estado: false });
    return { message: 'Curso inhabilitado correctamente' };
  }

  async habilitar(id: number) {
    await this.cursoRepository.update(id, { estado: true });
    return { message: 'Curso habilitado correctamente' };
  }

  async create(data: Partial<Curso>) {
    const nuevoCurso = this.cursoRepository.create(data);
    return this.cursoRepository.save(nuevoCurso);
  }

  async update(id: number, data: Partial<Curso>) {
    await this.cursoRepository.update(id, data);
    return this.obtenerUno(id);
  }
}
