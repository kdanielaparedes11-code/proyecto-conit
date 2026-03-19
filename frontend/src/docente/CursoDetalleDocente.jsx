import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getCursoById,
  getAlumnosByCurso,
  guardarAsistenciaCurso,
  getAsistenciaCursoPorFecha,
  crearTarea,
  getTareasByCurso,
  marcarTareaRevisada,
  deleteTarea,
  getModulosByCurso,
  crearModulo,
  actualizarModulo,
  deleteModulo,
  moverModulo,
  getLeccionesByModulo,
  crearLeccion,
  actualizarLeccion,
  deleteLeccion,
  moverLeccion,
  getMaterialesByLeccion,
  addMaterialLeccion,
  actualizarMaterialLeccion,
  deleteMaterialLeccion,
  moverMaterialLeccion,
} from "../services/docenteService";

function CursoDetalleDocente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==============================
  // Tabs
  // ==============================
  const [tabActiva, setTabActiva] = useState("resumen");

  // ==============================
  // Fecha actual
  // ==============================
  const hoy = new Date().toISOString().slice(0, 10);

  // ==============================
  // Asistencia
  // ==============================
  const [fechaAsistencia, setFechaAsistencia] = useState(hoy);
  const [asistenciaMap, setAsistenciaMap] = useState({});

  // ==============================
  // Tareas
  // ==============================
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [guardandoTarea, setGuardandoTarea] = useState(false);
  const [cargandoTareas, setCargandoTareas] = useState(false);
  const [tareas, setTareas] = useState([]);
  const [tareasAbiertas, setTareasAbiertas] = useState({});

  const [formTarea, setFormTarea] = useState({
    titulo: "",
    descripcion: "",
    fechaInicio: "",
    fechaLimite: "",
    tipoEntrega: "",
    tipoApoyo: "ninguno",
    textoApoyo: "",
    archivoApoyo: null,
    videoApoyo: null,
  });

  // ==============================
  // Módulos / Lecciones / Materiales
  // ==============================
  const [modulos, setModulos] = useState([]);
  const [cargandoModulos, setCargandoModulos] = useState(false);

  const [mostrarFormModulo, setMostrarFormModulo] = useState(false);
  const [guardandoModulo, setGuardandoModulo] = useState(false);
  const [formModulo, setFormModulo] = useState({
    titulo: "",
    descripcion: "",
  });

  const [mostrarLecciones, setMostrarLecciones] = useState({});
  const [mostrarFormLeccion, setMostrarFormLeccion] = useState({});
  const [guardandoLeccion, setGuardandoLeccion] = useState(false);
  const [formLeccion, setFormLeccion] = useState({});

  const [mostrarMateriales, setMostrarMateriales] = useState({});
  const [mostrarFormMaterial, setMostrarFormMaterial] = useState({});
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);
  const [formMaterial, setFormMaterial] = useState({});

  // ==============================
  // Edición
  // ==============================
  const [editandoModuloId, setEditandoModuloId] = useState(null);
  const [formEditarModulo, setFormEditarModulo] = useState({
    titulo: "",
    descripcion: "",
  });

  const [editandoLeccionId, setEditandoLeccionId] = useState(null);
  const [formEditarLeccion, setFormEditarLeccion] = useState({
    titulo: "",
    descripcion: "",
  });

  const [editandoMaterialId, setEditandoMaterialId] = useState(null);
  const [formEditarMaterial, setFormEditarMaterial] = useState({
    titulo: "",
    tipo: "texto",
    contenido_texto: "",
    video_url: "",
    enlace_url: "",
  });

  // ==============================
  // PDF
  // ==============================
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Asistencia", 14, 15);

    doc.setFontSize(11);
    doc.text(`Curso: ${curso?.nombre || ""}`, 14, 22);
    doc.text(`Fecha: ${fechaAsistencia}`, 14, 28);

    const rows = alumnos.map((a) => {
      const key = a.idalumno || a.id;
      const asistencia = asistenciaMap[key] || {};

      return [
        `${a.nombre || ""} ${a.apellido || ""}`.trim(),
        a.numdocumento || "-",
        asistencia.estado || "Sin registro",
        asistencia.tipo_justificacion || "-",
        asistencia.observacion || "-",
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [["Alumno", "DNI", "Estado", "Justificación", "Observación"]],
      body: rows,
    });

    doc.save(`asistencia_${curso?.nombre || "curso"}_${fechaAsistencia}.pdf`);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const [cursoData, alumnosData, asistenciaData] = await Promise.all([
          getCursoById(id),
          getAlumnosByCurso(id),
          getAsistenciaCursoPorFecha(id, hoy),
        ]);

        setCurso(cursoData);
        setAlumnos(alumnosData || []);

        const map = {};
        (asistenciaData || []).forEach((item) => {
          map[item.idalumno] = {
            estado: item.estado || "",
            tipo_justificacion: item.tipo_justificacion || "",
            observacion: item.observacion || "",
          };
        });
        setAsistenciaMap(map);
      } catch (error) {
        console.error(error);
        alert(error?.message || "Error cargando detalle del curso");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, hoy]);

  useEffect(() => {
    if (tabActiva === "tareas") {
      cargarTareasCurso();
    }
  }, [tabActiva, id]);

  useEffect(() => {
    if (tabActiva === "modulos") {
      cargarModulosCurso();
    }
  }, [tabActiva, id]);

  const cargarTareasCurso = async () => {
    try {
      setCargandoTareas(true);
      const data = await getTareasByCurso(id);
      setTareas(data || []);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudieron cargar las tareas");
    } finally {
      setCargandoTareas(false);
    }
  };

  const cargarModulosCurso = async () => {
    try {
      setCargandoModulos(true);

      const modulosData = await getModulosByCurso(id);

      const modulosConDetalle = await Promise.all(
        (modulosData || []).map(async (modulo) => {
          const lecciones = await getLeccionesByModulo(modulo.id);

          const leccionesConMateriales = await Promise.all(
            (lecciones || []).map(async (leccion) => {
              const materiales = await getMaterialesByLeccion(leccion.id);
              return {
                ...leccion,
                materiales: materiales || [],
              };
            })
          );

          return {
            ...modulo,
            lecciones: leccionesConMateriales || [],
          };
        })
      );

      setModulos(modulosConDetalle);
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudieron cargar los módulos");
    } finally {
      setCargandoModulos(false);
    }
  };

  const cargarAsistenciaPorFecha = async (fecha) => {
    try {
      const data = await getAsistenciaCursoPorFecha(id, fecha);

      const map = {};
      (data || []).forEach((item) => {
        map[item.idalumno] = {
          estado: item.estado || "",
          tipo_justificacion: item.tipo_justificacion || "",
          observacion: item.observacion || "",
        };
      });

      setAsistenciaMap(map);
    } catch (error) {
      console.error(error);
      alert(error?.message || "Error cargando asistencia");
    }
  };

  const irAHoy = async () => {
    setFechaAsistencia(hoy);
    await cargarAsistenciaPorFecha(hoy);
  };

  const actualizarEstadoAsistencia = (idalumno, nuevoEstado) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        estado: nuevoEstado,
        tipo_justificacion:
          nuevoEstado === "tardanza" || nuevoEstado === "falta"
            ? prev[idalumno]?.tipo_justificacion || ""
            : "",
        observacion: prev[idalumno]?.observacion || "",
      },
    }));
  };

  const actualizarJustificacion = (idalumno, valor) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        tipo_justificacion: valor,
      },
    }));
  };

  const actualizarObservacion = (idalumno, valor) => {
    setAsistenciaMap((prev) => ({
      ...prev,
      [idalumno]: {
        ...(prev[idalumno] || {}),
        observacion: valor,
      },
    }));
  };

  const guardarAsistencia = async () => {
    try {
      const payload = alumnos.map((a) => ({
        idalumno: a.idalumno || a.id,
        fecha: fechaAsistencia,
        estado: asistenciaMap[a.idalumno || a.id]?.estado || "",
        tipo_justificacion:
          asistenciaMap[a.idalumno || a.id]?.tipo_justificacion || null,
        observacion: asistenciaMap[a.idalumno || a.id]?.observacion || null,
      }));

      const incompletos = payload.filter((p) => !p.estado);
      if (incompletos.length > 0) {
        return alert("Todos los alumnos deben tener estado de asistencia.");
      }

      await guardarAsistenciaCurso(Number(id), payload);
      alert("Asistencia guardada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo guardar la asistencia");
    }
  };

  const handleChangeTarea = (e) => {
    const { name, value } = e.target;

    setFormTarea((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "tipoApoyo") {
        next.textoApoyo = "";
        next.archivoApoyo = null;
        next.videoApoyo = null;
      }

      return next;
    });
  };

  const handleFileChangeTarea = (e) => {
    const { name, files } = e.target;

    setFormTarea((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const limpiarFormTarea = () => {
    setFormTarea({
      titulo: "",
      descripcion: "",
      fechaInicio: "",
      fechaLimite: "",
      tipoEntrega: "",
      tipoApoyo: "ninguno",
      textoApoyo: "",
      archivoApoyo: null,
      videoApoyo: null,
    });
  };

  const guardarTareaCurso = async (e) => {
    e.preventDefault();

    try {
      if (!formTarea.titulo.trim()) {
        return alert("Ingresa el título de la tarea.");
      }

      if (!formTarea.descripcion.trim()) {
        return alert("Ingresa la descripción de la tarea.");
      }

      if (!formTarea.fechaInicio || !formTarea.fechaLimite) {
        return alert("Completa la fecha de inicio y la fecha límite.");
      }

      if (!formTarea.tipoEntrega) {
        return alert("Selecciona el tipo de entrega.");
      }

      setGuardandoTarea(true);

      await crearTarea({
        cursoId: Number(id),
        titulo: formTarea.titulo,
        descripcion: formTarea.descripcion,
        fechaInicio: formTarea.fechaInicio,
        fechaLimite: formTarea.fechaLimite,
        tipoEntrega: formTarea.tipoEntrega,
        tipoApoyo: formTarea.tipoApoyo,
        textoApoyo: formTarea.textoApoyo,
        archivoApoyo: formTarea.archivoApoyo,
        videoApoyo: formTarea.videoApoyo,
      });

      alert("Tarea creada correctamente ✅");
      limpiarFormTarea();
      setMostrarFormTarea(false);
      await cargarTareasCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Error al crear la tarea");
    } finally {
      setGuardandoTarea(false);
    }
  };

  const cambiarEstadoRevision = async (tarea) => {
    try {
      const nuevoEstado = !tarea.revisada;

      await marcarTareaRevisada(tarea.id, nuevoEstado);

      setTareas((prev) =>
        prev.map((item) =>
          item.id === tarea.id ? { ...item, revisada: nuevoEstado } : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el estado de la tarea");
    }
  };

  const eliminarTareaCurso = async (tareaId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar esta tarea?");
    if (!confirmado) return;

    try {
      await deleteTarea(tareaId);
      setTareas((prev) => prev.filter((item) => item.id !== tareaId));

      setTareasAbiertas((prev) => {
        const copia = { ...prev };
        delete copia[tareaId];
        return copia;
      });

      alert("Tarea eliminada correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar la tarea");
    }
  };

  const toggleTarea = (tareaId) => {
    setTareasAbiertas((prev) => ({
      ...prev,
      [tareaId]: !prev[tareaId],
    }));
  };

  // ==============================
  // MÓDULOS
  // ==============================
  const handleChangeModulo = (e) => {
    const { name, value } = e.target;
    setFormModulo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarModuloCurso = async (e) => {
    e.preventDefault();

    try {
      if (!formModulo.titulo.trim()) {
        return alert("Ingresa el título del módulo.");
      }

      setGuardandoModulo(true);

      await crearModulo({
        cursoId: Number(id),
        titulo: formModulo.titulo,
        descripcion: formModulo.descripcion,
      });

      setFormModulo({ titulo: "", descripcion: "" });
      setMostrarFormModulo(false);
      await cargarModulosCurso();
      alert("Módulo creado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear el módulo");
    } finally {
      setGuardandoModulo(false);
    }
  };

  const eliminarModuloCurso = async (moduloId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar este módulo?");
    if (!confirmado) return;

    try {
      await deleteModulo(moduloId);
      await cargarModulosCurso();
      alert("Módulo eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar el módulo");
    }
  };

  const moverModuloCurso = async (moduloId, direccion) => {
    try {
      await moverModulo(moduloId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover el módulo");
    }
  };

  const iniciarEdicionModulo = (modulo) => {
    setEditandoModuloId(modulo.id);
    setFormEditarModulo({
      titulo: modulo.titulo || "",
      descripcion: modulo.descripcion || "",
    });
  };

  const cancelarEdicionModulo = () => {
    setEditandoModuloId(null);
    setFormEditarModulo({
      titulo: "",
      descripcion: "",
    });
  };

  const guardarEdicionModulo = async (moduloId) => {
    try {
      if (!formEditarModulo.titulo.trim()) {
        return alert("Ingresa el título del módulo.");
      }

      await actualizarModulo(moduloId, {
        titulo: formEditarModulo.titulo,
        descripcion: formEditarModulo.descripcion,
      });

      cancelarEdicionModulo();
      await cargarModulosCurso();
      alert("Módulo actualizado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el módulo");
    }
  };

  // ==============================
  // LECCIONES
  // ==============================
  const toggleLeccionesModulo = (moduloId) => {
    setMostrarLecciones((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  const toggleFormLeccion = (moduloId) => {
    setMostrarFormLeccion((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));

    setFormLeccion((prev) => ({
      ...prev,
      [moduloId]: prev[moduloId] || {
        titulo: "",
        descripcion: "",
      },
    }));
  };

  const handleChangeLeccion = (moduloId, e) => {
    const { name, value } = e.target;

    setFormLeccion((prev) => ({
      ...prev,
      [moduloId]: {
        ...(prev[moduloId] || {}),
        [name]: value,
      },
    }));
  };

  const guardarLeccionCurso = async (e, moduloId) => {
    e.preventDefault();

    try {
      const data = formLeccion[moduloId] || {};

      if (!data.titulo?.trim()) {
        return alert("Ingresa el título de la lección.");
      }

      setGuardandoLeccion(true);

      await crearLeccion({
        moduloId,
        titulo: data.titulo,
        descripcion: data.descripcion,
      });

      setFormLeccion((prev) => ({
        ...prev,
        [moduloId]: {
          titulo: "",
          descripcion: "",
        },
      }));

      setMostrarFormLeccion((prev) => ({
        ...prev,
        [moduloId]: false,
      }));

      await cargarModulosCurso();
      alert("Lección creada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo crear la lección");
    } finally {
      setGuardandoLeccion(false);
    }
  };

  const eliminarLeccionCurso = async (leccionId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar esta lección?");
    if (!confirmado) return;

    try {
      await deleteLeccion(leccionId);
      await cargarModulosCurso();
      alert("Lección eliminada correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar la lección");
    }
  };

  const moverLeccionCurso = async (leccionId, direccion) => {
    try {
      await moverLeccion(leccionId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover la lección");
    }
  };

  const iniciarEdicionLeccion = (leccion) => {
    setEditandoLeccionId(leccion.id);
    setFormEditarLeccion({
      titulo: leccion.titulo || "",
      descripcion: leccion.descripcion || "",
    });
  };

  const cancelarEdicionLeccion = () => {
    setEditandoLeccionId(null);
    setFormEditarLeccion({
      titulo: "",
      descripcion: "",
    });
  };

  const guardarEdicionLeccion = async (leccionId) => {
    try {
      if (!formEditarLeccion.titulo.trim()) {
        return alert("Ingresa el título de la lección.");
      }

      await actualizarLeccion(leccionId, {
        titulo: formEditarLeccion.titulo,
        descripcion: formEditarLeccion.descripcion,
      });

      cancelarEdicionLeccion();
      await cargarModulosCurso();
      alert("Lección actualizada correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar la lección");
    }
  };

  // ==============================
  // MATERIALES
  // ==============================
  const toggleMaterialesLeccion = (leccionId) => {
    setMostrarMateriales((prev) => ({
      ...prev,
      [leccionId]: !prev[leccionId],
    }));
  };

  const toggleFormMaterial = (leccionId) => {
    setMostrarFormMaterial((prev) => ({
      ...prev,
      [leccionId]: !prev[leccionId],
    }));

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: prev[leccionId] || {
        titulo: "",
        tipo: "texto",
        contenido_texto: "",
        video_url: "",
        enlace_url: "",
        file: null,
      },
    }));
  };

  const handleChangeMaterial = (leccionId, e) => {
    const { name, value } = e.target;

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: {
        ...(prev[leccionId] || {}),
        [name]: value,
      },
    }));
  };

  const handleFileMaterial = (leccionId, e) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > 20 * 1024 * 1024) {
      alert("El archivo supera el límite permitido de 20 MB.");
      return;
    }

    setFormMaterial((prev) => ({
      ...prev,
      [leccionId]: {
        ...(prev[leccionId] || {}),
        file,
      },
    }));
  };

  const guardarMaterialCurso = async (e, leccionId) => {
    e.preventDefault();

    try {
      const data = formMaterial[leccionId] || {};

      if (!data.titulo?.trim()) {
        return alert("Ingresa el título del material.");
      }

      if (!data.tipo) {
        return alert("Selecciona el tipo de material.");
      }

      if (data.tipo === "texto" && !data.contenido_texto?.trim()) {
        return alert("Ingresa el contenido del material.");
      }

      if (data.tipo === "url_video" && !data.video_url?.trim()) {
        return alert("Ingresa la URL del video.");
      }

      if (data.tipo === "enlace" && !data.enlace_url?.trim()) {
        return alert("Ingresa el enlace.");
      }

      if ((data.tipo === "archivo" || data.tipo === "video") && !data.file) {
        return alert("Selecciona un archivo.");
      }

      setGuardandoMaterial(true);

      await addMaterialLeccion(leccionId, {
        titulo: data.titulo,
        tipo: data.tipo,
        contenido_texto: data.contenido_texto,
        video_url: data.tipo === "url_video" ? data.video_url : null,
        enlace_url: data.tipo === "enlace" ? data.enlace_url : null,
        file: data.tipo === "archivo" || data.tipo === "video" ? data.file : null,
      });

      setFormMaterial((prev) => ({
        ...prev,
        [leccionId]: {
          titulo: "",
          tipo: "texto",
          contenido_texto: "",
          video_url: "",
          enlace_url: "",
          file: null,
        },
      }));

      setMostrarFormMaterial((prev) => ({
        ...prev,
        [leccionId]: false,
      }));

      await cargarModulosCurso();
      alert("Material agregado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo agregar el material");
    } finally {
      setGuardandoMaterial(false);
    }
  };

  const eliminarMaterialCurso = async (materialId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar este material?");
    if (!confirmado) return;

    try {
      await deleteMaterialLeccion(materialId);
      await cargarModulosCurso();
      alert("Material eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo eliminar el material");
    }
  };

  const moverMaterialCurso = async (materialId, direccion) => {
    try {
      await moverMaterialLeccion(materialId, direccion);
      await cargarModulosCurso();
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo mover el material");
    }
  };

  const iniciarEdicionMaterial = (material) => {
    setEditandoMaterialId(material.id);
    setFormEditarMaterial({
      titulo: material.titulo || "",
      tipo: material.tipo || "texto",
      contenido_texto: material.contenido_texto || "",
      video_url: material.video_url || "",
      enlace_url: material.enlace_url || "",
    });
  };

  const cancelarEdicionMaterial = () => {
    setEditandoMaterialId(null);
    setFormEditarMaterial({
      titulo: "",
      tipo: "texto",
      contenido_texto: "",
      video_url: "",
      enlace_url: "",
    });
  };

  const guardarEdicionMaterial = async (materialId) => {
    try {
      if (!formEditarMaterial.titulo.trim()) {
        return alert("Ingresa el título del material.");
      }

      if (
        formEditarMaterial.tipo === "texto" &&
        !formEditarMaterial.contenido_texto.trim()
      ) {
        return alert("Ingresa el contenido del material.");
      }

      if (
        formEditarMaterial.tipo === "url_video" &&
        !formEditarMaterial.video_url.trim()
      ) {
        return alert("Ingresa la URL del video.");
      }

      if (
        formEditarMaterial.tipo === "enlace" &&
        !formEditarMaterial.enlace_url.trim()
      ) {
        return alert("Ingresa el enlace.");
      }

      await actualizarMaterialLeccion(materialId, {
        titulo: formEditarMaterial.titulo,
        tipo: formEditarMaterial.tipo,
        contenido_texto:
          formEditarMaterial.tipo === "texto"
            ? formEditarMaterial.contenido_texto
            : null,
        video_url:
          formEditarMaterial.tipo === "url_video"
            ? formEditarMaterial.video_url
            : null,
        enlace_url:
          formEditarMaterial.tipo === "enlace"
            ? formEditarMaterial.enlace_url
            : null,
      });

      cancelarEdicionMaterial();
      await cargarModulosCurso();
      alert("Material actualizado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert(error?.message || "No se pudo actualizar el material");
    }
  };

  const ausentes = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "falta";
  });

  const tardanzas = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "tardanza";
  });

  const presentes = alumnos.filter((a) => {
    const key = a.idalumno || a.id;
    return asistenciaMap[key]?.estado === "presente";
  });

  const tareasRevisadas = tareas.filter((t) => t.revisada).length;
  const tareasPendientes = tareas.filter((t) => !t.revisada).length;

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(`${fecha}T00:00:00`);
    return d.toLocaleDateString("es-PE");
  };

  const obtenerEstadoVencimiento = (fechaLimite) => {
    if (!fechaLimite) return null;

    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);

    const limite = new Date(`${fechaLimite}T00:00:00`);
    const diff = Math.ceil((limite - hoyDate) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { label: "Vencida", className: "bg-red-100 text-red-700" };
    }

    if (diff <= 2) {
      return { label: "Vence pronto", className: "bg-orange-100 text-orange-700" };
    }

    return { label: "Activa", className: "bg-sky-100 text-sky-700" };
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow text-gray-500">
        Cargando curso...
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow text-red-600">
        Curso no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6 md:p-8 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/docente/cursos")}
              className="text-sm text-slate-200 hover:text-white mb-3"
            >
              ← Volver a Mis Cursos
            </button>

            <p className="text-sm text-blue-200 font-medium mb-2">
              Detalle del curso
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              {curso.nombre || "Curso sin nombre"}
            </h2>
            <p className="text-sm md:text-base text-slate-200 mt-2">
              Grupo {curso.grupo || "Sin grupo"} • {curso.horario || "Sin horario"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTabActiva("modulos")}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition"
            >
              Gestionar módulos
            </button>

            <button
              type="button"
              onClick={() => setTabActiva("asistencia")}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition"
            >
              Tomar asistencia
            </button>

            <button
              type="button"
              onClick={() => setTabActiva("tareas")}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition"
            >
              Crear tarea
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Alumnos</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{alumnos.length}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Módulos</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{modulos.length}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Ausentes</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">{ausentes.length}</h3>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">Tardanzas</p>
          <h3 className="text-3xl font-bold text-amber-600 mt-2">{tardanzas.length}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "resumen", label: "Resumen" },
            { key: "asistencia", label: "Asistencia" },
            { key: "tareas", label: "Tareas" },
            { key: "modulos", label: "Módulos" },
          ].map((tab) => {
            const active = tabActiva === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTabActiva(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {tabActiva === "resumen" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4">Información general</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Curso</p>
                <p className="font-semibold text-gray-900">
                  {curso.nombre || "Sin nombre"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Grupo</p>
                <p className="font-semibold text-gray-900">
                  {curso.grupo || "Sin grupo"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500 mb-1">Horario</p>
                <p className="font-semibold text-gray-900">
                  {curso.horario || "Sin horario"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Presentes</h3>
              {presentes.length === 0 ? (
                <p className="text-gray-500">No hay alumnos marcados como presentes.</p>
              ) : (
                <div className="space-y-3">
                  {presentes.map((a) => {
                    const key = a.idalumno || a.id;
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Ausentes</h3>
              {ausentes.length === 0 ? (
                <p className="text-gray-500">No hay alumnos ausentes.</p>
              ) : (
                <div className="space-y-3">
                  {ausentes.map((a) => {
                    const key = a.idalumno || a.id;
                    const info = asistenciaMap[key] || {};
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.tipo_justificacion || "Sin clasificación"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Tardanzas</h3>
              {tardanzas.length === 0 ? (
                <p className="text-gray-500">No hay tardanzas.</p>
              ) : (
                <div className="space-y-3">
                  {tardanzas.map((a) => {
                    const key = a.idalumno || a.id;
                    const info = asistenciaMap[key] || {};
                    return (
                      <div key={key} className="border rounded-xl p-3">
                        <div className="font-medium">
                          {a.nombre} {a.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          DNI: {a.numdocumento || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.tipo_justificacion || "Sin clasificación"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tabActiva === "asistencia" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Asistencia</h3>
              <p className="text-sm text-gray-500">
                Registrar y consultar asistencia por fecha
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div>
                <label className="block font-semibold mb-2">Consultar fecha</label>
                <input
                  type="date"
                  value={fechaAsistencia}
                  onChange={(e) => setFechaAsistencia(e.target.value)}
                  className="border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => cargarAsistenciaPorFecha(fechaAsistencia)}
                className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-800"
              >
                Buscar
              </button>

              <button
                type="button"
                onClick={irAHoy}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={exportarPDF}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm">
            Mostrando asistencia correspondiente a la fecha:{" "}
            <span className="font-semibold">{fechaAsistencia}</span>
          </div>

          {alumnos.length === 0 ? (
            <p className="text-gray-500">No hay alumnos en este curso.</p>
          ) : (
            <div className="overflow-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left min-w-[1100px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-2">Foto</th>
                    <th className="py-3 px-2">Alumno</th>
                    <th className="py-3 px-2">DNI</th>
                    <th className="py-3 px-2">Presente</th>
                    <th className="py-3 px-2">Tardanza</th>
                    <th className="py-3 px-2">Falta</th>
                    <th className="py-3 px-2">Justificación</th>
                    <th className="py-3 px-2">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((a) => {
                    const key = a.idalumno || a.id;
                    const asistencia = asistenciaMap[key] || {};

                    return (
                      <tr key={key} className="border-b align-top">
                        <td className="py-3 px-2">
                          <div className="w-12 h-12 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                            {a.foto_url ? (
                              <img
                                src={a.foto_url}
                                alt={a.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">Sin foto</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {a.nombre} {a.apellido}
                          </div>
                        </td>

                        <td className="py-3 px-2">{a.numdocumento || "-"}</td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "presente"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "presente")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "tardanza"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "tardanza")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          <input
                            type="radio"
                            name={`asistencia-${key}`}
                            checked={asistencia.estado === "falta"}
                            onChange={() =>
                              actualizarEstadoAsistencia(key, "falta")
                            }
                          />
                        </td>

                        <td className="py-3 px-2">
                          {(asistencia.estado === "tardanza" ||
                            asistencia.estado === "falta") && (
                            <select
                              value={asistencia.tipo_justificacion || ""}
                              onChange={(e) =>
                                actualizarJustificacion(key, e.target.value)
                              }
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="">Seleccione</option>
                              <option value="justificada">Justificada</option>
                              <option value="injustificada">Injustificada</option>
                            </select>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          <input
                            value={asistencia.observacion || ""}
                            onChange={(e) =>
                              actualizarObservacion(key, e.target.value)
                            }
                            className="border rounded px-2 py-1 text-sm w-full"
                            placeholder="Opcional"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={guardarAsistencia}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
            >
              Guardar asistencia
            </button>
          </div>
        </div>
      )}

      {tabActiva === "tareas" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Tareas del curso</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Crea tareas directamente para este curso y administra su seguimiento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarFormTarea((prev) => !prev)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
              >
                {mostrarFormTarea ? "Cancelar" : "Nueva tarea"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <p className="text-sm text-gray-500">Total de tareas</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{tareas.length}</p>
              </div>

              <div className="rounded-2xl border bg-amber-50 p-4">
                <p className="text-sm text-amber-700">Pendientes</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">{tareasPendientes}</p>
              </div>

              <div className="rounded-2xl border bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">Revisadas</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{tareasRevisadas}</p>
              </div>
            </div>

            {mostrarFormTarea && (
              <form
                onSubmit={guardarTareaCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6"
              >
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formTarea.titulo}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full"
                    placeholder="Ej. Tarea semana 1"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formTarea.descripcion}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full min-h-[120px]"
                    placeholder="Describe la actividad a realizar"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Fecha de inicio</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formTarea.fechaInicio}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Fecha límite</label>
                  <input
                    type="date"
                    name="fechaLimite"
                    value={formTarea.fechaLimite}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Tipo de entrega</label>
                  <select
                    name="tipoEntrega"
                    value={formTarea.tipoEntrega}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="archivo">Archivo</option>
                    <option value="texto">Texto</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Material de apoyo</label>
                  <select
                    name="tipoApoyo"
                    value={formTarea.tipoApoyo}
                    onChange={handleChangeTarea}
                    className="border rounded-xl px-3 py-2 w-full"
                  >
                    <option value="ninguno">Ninguno</option>
                    <option value="texto">Texto</option>
                    <option value="archivo">Archivo</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {formTarea.tipoApoyo === "texto" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">Texto de apoyo</label>
                    <textarea
                      name="textoApoyo"
                      value={formTarea.textoApoyo}
                      onChange={handleChangeTarea}
                      className="border rounded-xl px-3 py-2 w-full min-h-[100px]"
                      placeholder="Agrega instrucciones o contenido de apoyo"
                    />
                  </div>
                )}

                {formTarea.tipoApoyo === "archivo" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">Archivo de apoyo</label>
                    <input
                      type="file"
                      name="archivoApoyo"
                      onChange={handleFileChangeTarea}
                      className="border rounded-xl px-3 py-2 w-full"
                    />
                  </div>
                )}

                {formTarea.tipoApoyo === "video" && (
                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2">Video de apoyo</label>
                    <input
                      type="file"
                      name="videoApoyo"
                      accept="video/*"
                      onChange={handleFileChangeTarea}
                      className="border rounded-xl px-3 py-2 w-full"
                    />
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoTarea}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60"
                  >
                    {guardandoTarea ? "Guardando..." : "Guardar tarea"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Listado de tareas</h4>

              <button
                type="button"
                onClick={cargarTareasCurso}
                className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50"
              >
                Recargar
              </button>
            </div>

            {cargandoTareas ? (
              <p className="text-gray-500">Cargando tareas...</p>
            ) : tareas.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <p className="text-gray-700 font-medium">No hay tareas registradas</p>
                <p className="text-sm text-gray-500 mt-2">
                  Crea la primera tarea de este curso desde el botón “Nueva tarea”.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tareas.map((tarea) => {
                  const abierta = !!tareasAbiertas[tarea.id];
                  const estadoFecha = obtenerEstadoVencimiento(tarea.fecha_limite);

                  return (
                    <div
                      key={tarea.id}
                      className={`overflow-hidden rounded-2xl border shadow-sm transition ${
                        tarea.revisada
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTarea(tarea.id)}
                        className="w-full text-left px-4 py-4 hover:bg-black/5 transition"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-lg font-bold text-gray-800">
                                {tarea.titulo}
                              </h5>

                              {tarea.revisada ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
                                  Revisada
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1">
                                  Pendiente
                                </span>
                              )}

                              {estadoFecha && (
                                <span
                                  className={`inline-flex items-center rounded-full text-xs font-semibold px-3 py-1 ${estadoFecha.className}`}
                                >
                                  {estadoFecha.label}
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span>
                                <strong>Inicio:</strong> {formatearFecha(tarea.fecha_inicio)}
                              </span>
                              <span>
                                <strong>Límite:</strong> {formatearFecha(tarea.fecha_limite)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
                              {tarea.tipo_entrega || "Sin tipo"}
                            </span>

                            <span className="text-lg text-gray-500">
                              {abierta ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>
                      </button>

                      {abierta && (
                        <div className="border-t bg-white px-4 py-4 md:px-5 md:py-5 space-y-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              Descripción
                            </p>
                            <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700">
                              {tarea.descripcion || "Sin descripción"}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="rounded-xl border bg-gray-50 p-3">
                              <p className="text-gray-500">Tipo de entrega</p>
                              <p className="font-medium text-gray-800">
                                {tarea.tipo_entrega || "-"}
                              </p>
                            </div>

                            <div className="rounded-xl border bg-gray-50 p-3">
                              <p className="text-gray-500">Tipo de apoyo</p>
                              <p className="font-medium text-gray-800 capitalize">
                                {tarea.tipo_apoyo || "ninguno"}
                              </p>
                            </div>
                          </div>

                          {(tarea.texto_apoyo ||
                            tarea.archivo_apoyo_url ||
                            tarea.video_apoyo_url) && (
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Material de apoyo
                              </p>

                              {tarea.texto_apoyo && (
                                <div className="rounded-xl border bg-gray-50 p-3 text-sm text-gray-700 mb-3 whitespace-pre-line">
                                  {tarea.texto_apoyo}
                                </div>
                              )}

                              <div className="flex flex-wrap gap-2">
                                {tarea.archivo_apoyo_url && (
                                  <a
                                    href={tarea.archivo_apoyo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                  >
                                    Ver archivo de apoyo
                                  </a>
                                )}

                                {tarea.video_apoyo_url && (
                                  <a
                                    href={tarea.video_apoyo_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                  >
                                    Ver video de apoyo
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => cambiarEstadoRevision(tarea)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                tarea.revisada
                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              }`}
                            >
                              {tarea.revisada
                                ? "Marcar como pendiente"
                                : "Marcar como revisada"}
                            </button>

                            <button
                              type="button"
                              onClick={() => eliminarTareaCurso(tarea.id)}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tabActiva === "modulos" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold">Módulos del curso</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Organiza el curso por módulos, lecciones y materiales.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cargarModulosCurso}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                >
                  Recargar
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarFormModulo((prev) => !prev)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                >
                  {mostrarFormModulo ? "Cancelar" : "+ Crear módulo"}
                </button>
              </div>
            </div>

            {mostrarFormModulo && (
              <form
                onSubmit={guardarModuloCurso}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6 mb-6"
              >
                <div>
                  <label className="block font-semibold mb-2">Título del módulo</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formModulo.titulo}
                    onChange={handleChangeModulo}
                    className="border rounded-xl px-3 py-2 w-full"
                    placeholder="Ej. Módulo 1 - Introducción"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formModulo.descripcion}
                    onChange={handleChangeModulo}
                    className="border rounded-xl px-3 py-2 w-full"
                    placeholder="Descripción breve del módulo"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={guardandoModulo}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60"
                  >
                    {guardandoModulo ? "Guardando..." : "Guardar módulo"}
                  </button>
                </div>
              </form>
            )}

            {cargandoModulos ? (
              <p className="text-gray-500">Cargando módulos...</p>
            ) : modulos.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center">
                <p className="text-gray-700 font-medium">No hay módulos registrados</p>
                <p className="text-sm text-gray-500 mt-2">
                  Crea el primer módulo para empezar a organizar el contenido del curso.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {modulos.map((modulo, index) => {
                  const abierto = !!mostrarLecciones[modulo.id];

                  return (
                    <div
                      key={modulo.id}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-slate-50 border-b">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1">
                                Módulo {index + 1}
                              </span>

                              <h4 className="text-lg font-bold text-gray-800">
                                {modulo.titulo}
                              </h4>
                            </div>

                            {modulo.descripcion && (
                              <p className="text-sm text-gray-500 mt-2">
                                {modulo.descripcion}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moverModuloCurso(modulo.id, "arriba")}
                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={() => moverModuloCurso(modulo.id, "abajo")}
                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                            >
                              ↓
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleFormLeccion(modulo.id)}
                              className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm"
                            >
                              + Lección
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleLeccionesModulo(modulo.id)}
                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                            >
                              {abierto ? "Ocultar" : "Ver lecciones"}
                            </button>

                            <button
                              type="button"
                              onClick={() => iniciarEdicionModulo(modulo)}
                              className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => eliminarModuloCurso(modulo.id)}
                              className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        {mostrarFormLeccion[modulo.id] && (
                          <form
                            onSubmit={(e) => guardarLeccionCurso(e, modulo.id)}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5"
                          >
                            <div>
                              <label className="block font-semibold mb-2">
                                Título de la lección
                              </label>
                              <input
                                type="text"
                                name="titulo"
                                value={formLeccion[modulo.id]?.titulo || ""}
                                onChange={(e) => handleChangeLeccion(modulo.id, e)}
                                className="border rounded-xl px-3 py-2 w-full"
                                placeholder="Ej. Lección 1 - Introducción"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold mb-2">
                                Descripción
                              </label>
                              <input
                                type="text"
                                name="descripcion"
                                value={formLeccion[modulo.id]?.descripcion || ""}
                                onChange={(e) => handleChangeLeccion(modulo.id, e)}
                                className="border rounded-xl px-3 py-2 w-full"
                                placeholder="Descripción breve"
                              />
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                              <button
                                type="submit"
                                disabled={guardandoLeccion}
                                className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60"
                              >
                                {guardandoLeccion ? "Guardando..." : "Guardar lección"}
                              </button>
                            </div>
                          </form>
                        )}

                        {editandoModuloId === modulo.id && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5">
                            <div>
                              <label className="block font-semibold mb-2">Editar título</label>
                              <input
                                type="text"
                                value={formEditarModulo.titulo}
                                onChange={(e) =>
                                  setFormEditarModulo((prev) => ({
                                    ...prev,
                                    titulo: e.target.value,
                                  }))
                                }
                                className="border rounded-xl px-3 py-2 w-full"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold mb-2">
                                Editar descripción
                              </label>
                              <input
                                type="text"
                                value={formEditarModulo.descripcion}
                                onChange={(e) =>
                                  setFormEditarModulo((prev) => ({
                                    ...prev,
                                    descripcion: e.target.value,
                                  }))
                                }
                                className="border rounded-xl px-3 py-2 w-full"
                              />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelarEdicionModulo}
                                className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                onClick={() => guardarEdicionModulo(modulo.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                              >
                                Guardar cambios
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {abierto && (
                        <div className="p-5 space-y-4">
                          {modulo.lecciones?.length === 0 ? (
                            <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center">
                              <p className="text-gray-700 font-medium">
                                Este módulo no tiene lecciones
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Agrega la primera lección para empezar a cargar materiales.
                              </p>
                            </div>
                          ) : (
                            modulo.lecciones.map((leccion, idxLeccion) => {
                              const abiertaMateriales = !!mostrarMateriales[leccion.id];
                              const formMat = formMaterial[leccion.id] || {
                                titulo: "",
                                tipo: "texto",
                                contenido_texto: "",
                                video_url: "",
                                enlace_url: "",
                                file: null,
                              };

                              return (
                                <div
                                  key={leccion.id}
                                  className="rounded-2xl border border-gray-200 overflow-hidden"
                                >
                                  <div className="px-4 py-4 bg-white">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                      <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1">
                                            Lección {idxLeccion + 1}
                                          </span>

                                          <h5 className="text-base font-bold text-gray-800">
                                            {leccion.titulo}
                                          </h5>
                                        </div>

                                        {leccion.descripcion && (
                                          <p className="text-sm text-gray-500 mt-2">
                                            {leccion.descripcion}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() => moverLeccionCurso(leccion.id, "arriba")}
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          ↑
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => moverLeccionCurso(leccion.id, "abajo")}
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          ↓
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => toggleFormMaterial(leccion.id)}
                                          className="px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                                        >
                                          + Material
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => toggleMaterialesLeccion(leccion.id)}
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          {abiertaMateriales
                                            ? "Ocultar materiales"
                                            : "Ver materiales"}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => iniciarEdicionLeccion(leccion)}
                                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                        >
                                          Editar
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => eliminarLeccionCurso(leccion.id)}
                                          className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>

                                    {mostrarFormMaterial[leccion.id] && (
                                      <form
                                        onSubmit={(e) => guardarMaterialCurso(e, leccion.id)}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5"
                                      >
                                        <div>
                                          <label className="block font-semibold mb-2">
                                            Título del material
                                          </label>
                                          <input
                                            type="text"
                                            value={formMat.titulo}
                                            name="titulo"
                                            onChange={(e) =>
                                              handleChangeMaterial(leccion.id, e)
                                            }
                                            className="border rounded-xl px-3 py-2 w-full"
                                            placeholder="Ej. PDF de introducción"
                                          />
                                        </div>

                                        <div>
                                          <label className="block font-semibold mb-2">
                                            Tipo
                                          </label>
                                          <select
                                            value={formMat.tipo}
                                            name="tipo"
                                            onChange={(e) =>
                                              handleChangeMaterial(leccion.id, e)
                                            }
                                            className="border rounded-xl px-3 py-2 w-full"
                                          >
                                            <option value="texto">Texto</option>
                                            <option value="archivo">Archivo</option>
                                            <option value="video">Video</option>
                                            <option value="url_video">URL de video</option>
                                            <option value="enlace">Enlace</option>
                                          </select>
                                        </div>

                                        {formMat.tipo === "texto" && (
                                          <div className="md:col-span-2">
                                            <label className="block font-semibold mb-2">
                                              Contenido
                                            </label>
                                            <textarea
                                              name="contenido_texto"
                                              value={formMat.contenido_texto}
                                              onChange={(e) =>
                                                handleChangeMaterial(leccion.id, e)
                                              }
                                              className="border rounded-xl px-3 py-2 w-full min-h-[120px]"
                                              placeholder="Escribe el contenido de la lección"
                                            />
                                          </div>
                                        )}

                                        {formMat.tipo === "url_video" && (
                                          <div className="md:col-span-2">
                                            <label className="block font-semibold mb-2">
                                              URL del video
                                            </label>
                                            <input
                                              type="text"
                                              name="video_url"
                                              value={formMat.video_url}
                                              onChange={(e) =>
                                                handleChangeMaterial(leccion.id, e)
                                              }
                                              className="border rounded-xl px-3 py-2 w-full"
                                              placeholder="https://..."
                                            />
                                          </div>
                                        )}

                                        {formMat.tipo === "enlace" && (
                                          <div className="md:col-span-2">
                                            <label className="block font-semibold mb-2">
                                              Enlace
                                            </label>
                                            <input
                                              type="text"
                                              name="enlace_url"
                                              value={formMat.enlace_url}
                                              onChange={(e) =>
                                                handleChangeMaterial(leccion.id, e)
                                              }
                                              className="border rounded-xl px-3 py-2 w-full"
                                              placeholder="https://..."
                                            />
                                          </div>
                                        )}

                                        {(formMat.tipo === "archivo" ||
                                          formMat.tipo === "video") && (
                                          <div className="md:col-span-2">
                                            <label className="block font-semibold mb-2">
                                              Archivo
                                            </label>
                                            <input
                                              type="file"
                                              onChange={(e) =>
                                                handleFileMaterial(leccion.id, e)
                                              }
                                              accept={
                                                formMat.tipo === "video"
                                                  ? "video/*"
                                                  : ".pdf,.ppt,.pptx,.doc,.docx,.zip,.rar"
                                              }
                                              className="border rounded-xl px-3 py-2 w-full"
                                            />

                                            {formMat.file && (
                                              <p className="text-sm text-gray-500 mt-2">
                                                Archivo seleccionado: {formMat.file.name}
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        <div className="md:col-span-2 flex justify-end">
                                          <button
                                            type="submit"
                                            disabled={guardandoMaterial}
                                            className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 disabled:opacity-60"
                                          >
                                            {guardandoMaterial
                                              ? "Guardando..."
                                              : "Guardar material"}
                                          </button>
                                        </div>
                                      </form>
                                    )}

                                    {editandoLeccionId === leccion.id && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t pt-5">
                                        <div>
                                          <label className="block font-semibold mb-2">
                                            Editar título
                                          </label>
                                          <input
                                            type="text"
                                            value={formEditarLeccion.titulo}
                                            onChange={(e) =>
                                              setFormEditarLeccion((prev) => ({
                                                ...prev,
                                                titulo: e.target.value,
                                              }))
                                            }
                                            className="border rounded-xl px-3 py-2 w-full"
                                          />
                                        </div>

                                        <div>
                                          <label className="block font-semibold mb-2">
                                            Editar descripción
                                          </label>
                                          <input
                                            type="text"
                                            value={formEditarLeccion.descripcion}
                                            onChange={(e) =>
                                              setFormEditarLeccion((prev) => ({
                                                ...prev,
                                                descripcion: e.target.value,
                                              }))
                                            }
                                            className="border rounded-xl px-3 py-2 w-full"
                                          />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={cancelarEdicionLeccion}
                                            className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                          >
                                            Cancelar
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              guardarEdicionLeccion(leccion.id)
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                                          >
                                            Guardar cambios
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {abiertaMateriales && (
                                    <div className="border-t bg-gray-50 p-4">
                                      {leccion.materiales?.length === 0 ? (
                                        <p className="text-sm text-gray-500">
                                          No hay materiales en esta lección.
                                        </p>
                                      ) : (
                                        <div className="space-y-3">
                                          {leccion.materiales.map((material, idxMaterial) => (
                                            <div
                                              key={material.id}
                                              className="rounded-xl border bg-white p-4"
                                            >
                                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                <div>
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1">
                                                      Material {idxMaterial + 1}
                                                    </span>

                                                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 uppercase">
                                                      {material.tipo}
                                                    </span>
                                                  </div>

                                                  <h6 className="font-semibold text-gray-800 mt-2">
                                                    {material.titulo}
                                                  </h6>

                                                  {material.contenido_texto && (
                                                    <p className="text-sm text-gray-500 mt-2 whitespace-pre-line">
                                                      {material.contenido_texto}
                                                    </p>
                                                  )}

                                                  <div className="flex flex-wrap gap-2 mt-3">
                                                    {material.archivo_url && (
                                                      <a
                                                        href={material.archivo_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                      >
                                                        Ver archivo
                                                      </a>
                                                    )}

                                                    {material.video_url && (
                                                      <a
                                                        href={material.video_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                      >
                                                        Ver video
                                                      </a>
                                                    )}

                                                    {material.enlace_url && (
                                                      <a
                                                        href={material.enlace_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                      >
                                                        Abrir enlace
                                                      </a>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      moverMaterialCurso(material.id, "arriba")
                                                    }
                                                    className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                  >
                                                    ↑
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      moverMaterialCurso(material.id, "abajo")
                                                    }
                                                    className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                  >
                                                    ↓
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      iniciarEdicionMaterial(material)
                                                    }
                                                    className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                                                  >
                                                    Editar
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      eliminarMaterialCurso(material.id)
                                                    }
                                                    className="px-3 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                                                  >
                                                    Eliminar
                                                  </button>
                                                </div>
                                              </div>

                                              {editandoMaterialId === material.id && (
                                                <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  <div>
                                                    <label className="block font-semibold mb-2">
                                                      Editar título
                                                    </label>
                                                    <input
                                                      type="text"
                                                      value={formEditarMaterial.titulo}
                                                      onChange={(e) =>
                                                        setFormEditarMaterial((prev) => ({
                                                          ...prev,
                                                          titulo: e.target.value,
                                                        }))
                                                      }
                                                      className="border rounded-xl px-3 py-2 w-full"
                                                    />
                                                  </div>

                                                  <div>
                                                    <label className="block font-semibold mb-2">
                                                      Tipo
                                                    </label>
                                                    <select
                                                      value={formEditarMaterial.tipo}
                                                      onChange={(e) =>
                                                        setFormEditarMaterial((prev) => ({
                                                          ...prev,
                                                          tipo: e.target.value,
                                                        }))
                                                      }
                                                      className="border rounded-xl px-3 py-2 w-full"
                                                    >
                                                      <option value="texto">Texto</option>
                                                      <option value="url_video">
                                                        URL de video
                                                      </option>
                                                      <option value="enlace">Enlace</option>
                                                    </select>
                                                  </div>

                                                  {formEditarMaterial.tipo === "texto" && (
                                                    <div className="md:col-span-2">
                                                      <label className="block font-semibold mb-2">
                                                        Contenido
                                                      </label>
                                                      <textarea
                                                        value={
                                                          formEditarMaterial.contenido_texto
                                                        }
                                                        onChange={(e) =>
                                                          setFormEditarMaterial((prev) => ({
                                                            ...prev,
                                                            contenido_texto:
                                                              e.target.value,
                                                          }))
                                                        }
                                                        className="border rounded-xl px-3 py-2 w-full min-h-[120px]"
                                                      />
                                                    </div>
                                                  )}

                                                  {formEditarMaterial.tipo ===
                                                    "url_video" && (
                                                    <div className="md:col-span-2">
                                                      <label className="block font-semibold mb-2">
                                                        URL del video
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={
                                                          formEditarMaterial.video_url
                                                        }
                                                        onChange={(e) =>
                                                          setFormEditarMaterial((prev) => ({
                                                            ...prev,
                                                            video_url:
                                                              e.target.value,
                                                          }))
                                                        }
                                                        className="border rounded-xl px-3 py-2 w-full"
                                                      />
                                                    </div>
                                                  )}

                                                  {formEditarMaterial.tipo ===
                                                    "enlace" && (
                                                    <div className="md:col-span-2">
                                                      <label className="block font-semibold mb-2">
                                                        Enlace
                                                      </label>
                                                      <input
                                                        type="text"
                                                        value={
                                                          formEditarMaterial.enlace_url
                                                        }
                                                        onChange={(e) =>
                                                          setFormEditarMaterial((prev) => ({
                                                            ...prev,
                                                            enlace_url:
                                                              e.target.value,
                                                          }))
                                                        }
                                                        className="border rounded-xl px-3 py-2 w-full"
                                                      />
                                                    </div>
                                                  )}

                                                  <div className="md:col-span-2 flex justify-end gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={cancelarEdicionMaterial}
                                                      className="px-4 py-2 rounded-xl border hover:bg-gray-50"
                                                    >
                                                      Cancelar
                                                    </button>

                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        guardarEdicionMaterial(material.id)
                                                      }
                                                      className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
                                                    >
                                                      Guardar cambios
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CursoDetalleDocente;