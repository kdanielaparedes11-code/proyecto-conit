// ================================
// Cursos del docente
// ================================

const cursos = [
  { id: 1, nombre: "React Avanzado", grupo: "A", horario: "Lun-Mie 19:00" },
  { id: 2, nombre: "NestJS Backend", grupo: "B", horario: "Mar-Jue 18:00" },
]

// ================================
// Alumnos por curso
// ================================

const alumnosPorCurso = {
  1: [
    {
      id: 101,
      nombre: "Ana Torres",
      nota1: 15,
      nota2: 14,
      nota3: 18,
      notaAdicional: null,
      descAdicional: "",
    },
    {
      id: 102,
      nombre: "Luis Soto",
      nota1: 10,
      nota2: 12,
      nota3: 11,
      notaAdicional: null,
      descAdicional: "",
    },
  ],
  2: [
    {
      id: 201,
      nombre: "Carmen Díaz",
      nota1: 18,
      nota2: 17,
      nota3: 19,
      notaAdicional: null,
      descAdicional: "",
    },
    {
      id: 202,
      nombre: "Pedro Rojas",
      nota1: 9,
      nota2: 8,
      nota3: 10,
      notaAdicional: null,
      descAdicional: "",
    },
  ],
}

// ================================
// Horario del docente
// ================================

const horarioDocente = [
  {
    dia: "Lunes",
    hora: "18:00 - 20:00",
    curso: "React Avanzado",
    grupo: "A",
    modalidad: "PRESENCIAL",
    salon: "Aula 301",
    link: null,
  },
  {
    dia: "Martes",
    hora: "19:00 - 21:00",
    curso: "NestJS Backend",
    grupo: "B",
    modalidad: "VIRTUAL",
    salon: null,
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    dia: "Miércoles",
    hora: "18:00 - 20:00",
    curso: "React Avanzado",
    grupo: "A",
    modalidad: "PRESENCIAL",
    salon: "Aula 301",
    link: null,
  },
  {
    dia: "Jueves",
    hora: "19:00 - 21:00",
    curso: "NestJS Backend",
    grupo: "B",
    modalidad: "VIRTUAL",
    salon: null,
    link: "https://meet.google.com/abc-defg-hij",
  },
  {
    dia: "Viernes",
    hora: "17:00 - 19:00",
    curso: "Base de Datos",
    grupo: "C",
    modalidad: "PRESENCIAL",
    salon: "Laboratorio 2",
    link: null,
  },
]

// ================================
// Servicios exportados
// ================================

export const getCursosDocente = async () =>
  Promise.resolve(cursos)

export const getAlumnosByCurso = async (cursoId) =>
  Promise.resolve(alumnosPorCurso[Number(cursoId)] || [])

export const getHorarioDocente = async () =>
  Promise.resolve(horarioDocente)

export const getCursoById = async (cursoId) => {
  const lista = await getCursosDocente()

  return (
    lista.find((c) => String(c.id) === String(cursoId)) || null
  )
}