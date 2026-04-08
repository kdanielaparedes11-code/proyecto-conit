import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase.client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamenIntento } from '../examen_intento/entities/examen_intento.entity';
import { Examen } from './entities/examen.entity';
import { Matricula } from 'src/matricula/entities/matricula.entity';

@Injectable()
export class ExamenService {
  constructor(
    @InjectRepository(ExamenIntento)
    private intentoRepository: Repository<ExamenIntento>,

    @InjectRepository(Matricula)
    private matriculaRepository: Repository<Matricula>,

    @InjectRepository(Examen)
    private examenRepository: Repository<Examen>,
  ) {}

  /* ========================= */
  /* 🔹 INICIAR INTENTO */
  /* ========================= */
  async iniciarIntento(idExamen: number, idAlumno: number) {

    const examen = await this.examenRepository.findOne({
        where: { id: idExamen },
        relations: ['grupo'],
    });

    if (!examen) {
        throw new Error('Examen no encontrado');
    }

    // 🔥 BUSCAR MATRÍCULA CORRECTA
    const matricula = await this.matriculaRepository.findOne({
        where: {
        alumno: { id: idAlumno },
        grupo: { id: examen.grupo.id },
        },
    });

    if (!matricula) {
        throw new Error('El alumno no está matriculado en este grupo');
    }

    // 🔥 CONTAR INTENTOS
    const intentos = await this.intentoRepository.count({
        where: {
        examen: { id: idExamen },
        alumno: { id: idAlumno },
        },
    });

    console.log('Intentos:', intentos);
    console.log('Permitidos:', examen.intentos_permitidos);

    if (intentos >= examen.intentos_permitidos) {
        throw new Error('Ya no tienes intentos disponibles');
    }

    // 🔥 CREAR INTENTO (SIN NULL)
    const intento = this.intentoRepository.create({
        examen: { id: idExamen } as any,
        alumno: { id: idAlumno } as any,
        matricula: { id: matricula.id } as any,
        intento_numero: intentos + 1,
    });

    return this.intentoRepository.save(intento);
    }
  /* ========================= */
  /* 🔹 RESPONDER EXAMEN */
  /* ========================= */
  async responder(
    examenId: number,
    idAlumno: number,
    respuestas: Record<string, number>
    ) {

    // 1. OBTENER EXAMEN
    const { data: examen } = await supabase
        .from('examen')
        .select('*')
        .eq('id', examenId)
        .single();

    if (!examen) throw new Error('Examen no encontrado');

    // 2. OBTENER MATRÍCULA (CLAVE)
    const { data: matricula } = await supabase
        .from('matricula')
        .select('*')
        .eq('idalumno', idAlumno)
        .eq('idgrupo', examen.idgrupo)
        .single();

    if (!matricula) {
        throw new Error('No tienes matrícula en este grupo');
    }

    // PREGUNTAS
    const { data: preguntas, error: errPreguntas } = await supabase
    .from('examen_pregunta')
    .select('*')
    .eq('idexamen', examenId);

    if (errPreguntas || !preguntas) {
    throw new Error('Error obteniendo preguntas');
    }

    // OPCIONES
    const preguntaIds = preguntas.map((p) => p.id);

    const { data: opciones, error: errOpciones } = await supabase
    .from('examen_opcion')
    .select('*')
    .in('idpregunta', preguntaIds);

    if (errOpciones || !opciones) {
    throw new Error('Error obteniendo opciones');
    }

    // YA NO HAY NULL
    let puntajeTotal = 0;
    let puntajeObtenido = 0;

    preguntas.forEach((p) => {
    const correcta = opciones.find(
        (o) => o.idpregunta === p.id && o.es_correcta === true
    );

    const puntaje = Number(p.puntaje || 1);
    puntajeTotal += puntaje;

    if (Number(respuestas[p.id]) === Number(correcta?.id)) {
        puntajeObtenido += puntaje;
    }

    });

    const nota =
        puntajeTotal > 0
        ? Number(((puntajeObtenido / puntajeTotal) * examen.nota_maxima).toFixed(2))
        : 0;

    // 🔥 5. INSERT CORRECTO (CON MATRÍCULA)
    // 🔥 BUSCAR ÚLTIMO INTENTO ABIERTO
    const intento = await this.intentoRepository.findOne({
    where: {
        examen: { id: examenId },
        alumno: { id: idAlumno },
        finalizado: false,
    },
    order: { id: 'DESC' },
    });

    if (!intento) {
    throw new Error('No hay intento activo');
    }

    // 🔥 ACTUALIZAR INTENTO
    intento.nota = nota;
    intento.respuestas = respuestas;
    intento.finalizado = true;
    intento.fecha_fin = new Date();

    await this.intentoRepository.save(intento);

    return {
        nota,
        puntajeTotal,
        puntajeObtenido,
    };
    }
}
