import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Paperclip } from "lucide-react";
import {
  getForoPublicacionesByGrupo,
  crearForoPublicacion,
  eliminarForoPublicacion,
  toggleFijarForoPublicacion,
  toggleCerrarForoPublicacion,
  getForoRespuestasByPublicacion,
  crearForoRespuesta,
  eliminarForoRespuesta,
  TIPOS_REACCION_FORO,
  getUsuarioForoActual,
  getReaccionesForoByPublicaciones,
  getReaccionesForoByRespuestas,
  guardarReaccionForoPublicacion,
  guardarReaccionForoRespuesta,
  subirYGuardarAdjuntoForo,
  crearForoAdjuntoEnlaceVideo,
  getForoAdjuntosByPublicacion,
  getForoAdjuntosByRespuestas,
  getForoAdjuntoDownloadUrl,
  eliminarForoAdjunto,
} from "../services/docenteService";

// ==========================================
// FUNCIONES AUXILIARES GLOBALES
// ==========================================
function formatearFecha(fecha) {
  if (!fecha) return "-";
  try {
    return new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return fecha;
  }
}

function esUrlValida(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function esAdjuntoVideo(adjunto) {
  const tipo = String(adjunto?.tipo || "").toLowerCase();
  return tipo === "video" || tipo === "video_vimeo" || tipo === "enlace_video";
}

function tieneVideoEnAdjuntos(adjuntos = []) {
  return adjuntos.some((adjunto) => esAdjuntoVideo(adjunto));
}

function nombreTipoAdjunto(tipo) {
  if (tipo === "imagen") return "Imagen";
  if (tipo === "video") return "Video";
  if (tipo === "video_vimeo") return "Video Vimeo";
  if (tipo === "enlace_video") return "Enlace de video";
  return "Archivo";
}

function construirMapaReacciones(reacciones = [], campoId, usuarioId) {
  const mapa = {};
  reacciones.forEach((reaccion) => {
    const key = Number(reaccion[campoId]);
    if (!key) return;

    if (!mapa[key]) {
      mapa[key] = {
        total: 0,
        conteos: {},
        miReaccion: null,
      };
    }

    const tipo = reaccion.tipo;
    mapa[key].total += 1;
    mapa[key].conteos[tipo] = Number(mapa[key].conteos[tipo] || 0) + 1;

    if (Number(reaccion.idusuario) === Number(usuarioId)) {
      mapa[key].miReaccion = tipo;
    }
  });
  return mapa;
}

// ==========================================
// SUBCOMPONENTES RENDERIZABLES
// ==========================================
function AdjuntosForo({
  adjuntos = [],
  puedeModerar = false,
  onEliminar,
  resumenReacciones = null,
  mostrarReaccionesEnVideo = false,
}) {
  if (!adjuntos || adjuntos.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        Adjuntos del tema
      </p>

      <div className="grid grid-cols-1 gap-3">
        {adjuntos.map((adjunto) => {
          const url = adjunto.download_url || adjunto.url_externa || "#";
          const tipo = adjunto.tipo || "archivo";

          return (
            <div
              key={adjunto.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-slate-600">
                    {nombreTipoAdjunto(tipo)}
                  </span>
                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {adjunto.nombre_archivo || "Archivo Adjunto"}
                  </p>
                  {adjunto.tamano_bytes && (
                    <p className="text-xs text-slate-400">
                      {(Number(adjunto.tamano_bytes) / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </p>
                  )}
                  {tipo === "video_vimeo" && adjunto.estado_video && (
                    <p className="mt-1 text-xs font-semibold text-indigo-500">
                      Estado: {adjunto.estado_video}
                    </p>
                  )}
                </div>

                {puedeModerar && (
                  <button
                    type="button"
                    onClick={() => onEliminar?.(adjunto)}
                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                )}
              </div>

              {tipo === "imagen" && url !== "#" && (
                <a href={url} target="_blank" rel="noreferrer">
                  <img
                    src={url}
                    alt={adjunto.nombre_archivo || "Imagen del foro"}
                    className="max-h-80 w-full rounded-2xl border border-slate-200 bg-white object-contain"
                  />
                </a>
              )}

              {tipo === "video" && url !== "#" && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black">
                  <video controls className="w-full bg-black">
                    <source src={url} type={adjunto.mime_type || "video/mp4"} />
                    Tu navegador no puede reproducir este video.
                  </video>
                  {mostrarReaccionesEnVideo && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-2 text-white shadow-lg backdrop-blur">
                      <ResumenReaccionesForo resumen={resumenReacciones} />
                    </div>
                  )}
                </div>
              )}

              {tipo === "video_vimeo" &&
                (adjunto.embed_url || adjunto.url_externa) && (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black">
                    <iframe
                      src={adjunto.embed_url || adjunto.url_externa}
                      title={adjunto.nombre_archivo || "Video de Vimeo"}
                      className="h-[260px] w-full md:h-[380px]"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                    {mostrarReaccionesEnVideo && (
                      <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-2 text-white shadow-lg backdrop-blur">
                        <ResumenReaccionesForo resumen={resumenReacciones} />
                      </div>
                    )}
                  </div>
                )}

              {tipo === "enlace_video" && adjunto.url_externa && (
                <a
                  href={adjunto.url_externa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  Abrir enlace de video
                </a>
              )}

              {tipo === "archivo" && url !== "#" && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Ver / descargar archivo
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResumenReaccionesForo({ resumen }) {
  const conteos = resumen?.conteos || {};
  const activos = TIPOS_REACCION_FORO.filter(
    (reaccion) => Number(conteos[reaccion.tipo] || 0) > 0,
  );

  if (activos.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {activos.slice(0, 3).map((reaccion) => (
        <span
          key={reaccion.tipo}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
          title={reaccion.label}
        >
          <span>{reaccion.emoji}</span>
          <span>{conteos[reaccion.tipo]}</span>
        </span>
      ))}
    </div>
  );
}

function ReaccionesForo({ resumen, onReaccionar, disabled = false }) {
  const conteos = resumen?.conteos || {};
  const miReaccion = resumen?.miReaccion || null;
  const total = Object.values(conteos).reduce(
    (acc, valor) => acc + Number(valor || 0),
    0,
  );

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {TIPOS_REACCION_FORO.map((reaccion) => {
        const activa = miReaccion === reaccion.tipo;
        const cantidad = Number(conteos[reaccion.tipo] || 0);

        return (
          <button
            key={reaccion.tipo}
            type="button"
            disabled={disabled}
            onClick={() => onReaccionar?.(reaccion.tipo)}
            title={reaccion.label}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold transition ${
              activa
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span className="text-base">{reaccion.emoji}</span>
            <span>{cantidad}</span>
          </button>
        );
      })}

      {total > 0 && (
        <span className="text-xs font-semibold text-slate-400">
          {total} reacción(es)
        </span>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE PRINCIPAL EXPORTADO
// ==========================================
export default function ForoGrupoPanel({ grupoId, modo = "estudiante" }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionActiva, setPublicacionActiva] = useState(null);
  const [respuestas, setRespuestas] = useState([]);

  const [adjuntosPublicacion, setAdjuntosPublicacion] = useState([]);
  const [adjuntosRespuestasMap, setAdjuntosRespuestasMap] = useState({});

  const [cargando, setCargando] = useState(false);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [formPublicacion, setFormPublicacion] = useState({
    titulo: "",
    contenido: "",
  });
  const publicacionActivaTieneVideo = tieneVideoEnAdjuntos(adjuntosPublicacion);
  const [formRespuesta, setFormRespuesta] = useState("");

  const [archivosPublicacion, setArchivosPublicacion] = useState([]);
  const [archivosRespuesta, setArchivosRespuesta] = useState([]);

  const [videoExternoPublicacion, setVideoExternoPublicacion] = useState("");
  const [videoExternoRespuesta, setVideoExternoRespuesta] = useState("");

  const [fileKeyPublicacion, setFileKeyPublicacion] = useState(1);
  const [fileKeyRespuesta, setFileKeyRespuesta] = useState(1);

  const [avisosForo, setAvisosForo] = useState([]);
  const [subidasForo, setSubidasForo] = useState([]);

  const [reaccionesPublicacionesMap, setReaccionesPublicacionesMap] = useState(
    {},
  );
  const [reaccionesRespuestasMap, setReaccionesRespuestasMap] = useState({});
  const [reaccionandoKey, setReaccionandoKey] = useState(null);

  const publicacionActivaRef = useRef(null);
  const puedeModerar = modo === "admin" || modo === "docente";

  const usuarioForoActual = useMemo(() => {
    try {
      return getUsuarioForoActual();
    } catch {
      return null;
    }
  }, []);

  const usuarioForoId = Number(usuarioForoActual?.idusuario || 0);

  useEffect(() => {
    publicacionActivaRef.current = publicacionActiva;
  }, [publicacionActiva]);

  const mostrarAvisoForo = (tipo, mensaje) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAvisosForo((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => {
      setAvisosForo((prev) => prev.filter((aviso) => aviso.id !== id));
    }, 5500);
  };

  const agregarSubidaForo = ({ id, titulo, estado }) => {
    setSubidasForo((prev) => [...prev, { id, titulo, estado }]);
  };

  const actualizarSubidaForo = (id, patch) => {
    setSubidasForo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const removerSubidaForo = (id) => {
    setTimeout(() => {
      setSubidasForo((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const hidratarAdjuntos = async (adjuntos = []) => {
    return await Promise.all(
      adjuntos.map(async (adjunto) => {
        if (!adjunto.object_key) return adjunto;
        try {
          const downloadUrl = await getForoAdjuntoDownloadUrl(
            adjunto.object_key,
          );
          return { ...adjunto, download_url: downloadUrl };
        } catch {
          return { ...adjunto, download_url: null };
        }
      }),
    );
  };

  const cargarPublicaciones = async () => {
    try {
      setCargando(true);
      const data = await getForoPublicacionesByGrupo(grupoId);
      const listaPublicaciones = data || [];
      setPublicaciones(listaPublicaciones);

      const publicacionIds = listaPublicaciones
        .map((p) => Number(p.id))
        .filter(Boolean);

      if (publicacionIds.length > 0) {
        const reaccionesDB =
          await getReaccionesForoByPublicaciones(publicacionIds);
        setReaccionesPublicacionesMap(
          construirMapaReacciones(reaccionesDB, "idpublicacion", usuarioForoId),
        );
      } else {
        setReaccionesPublicacionesMap({});
      }

      const activaActual = publicacionActivaRef.current;
      if (activaActual) {
        const actualizada = listaPublicaciones.find(
          (p) => Number(p.id) === Number(activaActual.id),
        );
        setPublicacionActiva(actualizada || null);
      }
    } catch (error) {
      alert(error?.message || "No se pudo cargar el foro.");
    } finally {
      setCargando(false);
    }
  };

  const cargarRespuestas = async (publicacion) => {
    if (!publicacion?.id) return;

    try {
      setPublicacionActiva(publicacion);
      setCargandoRespuestas(true);

      const [respuestasDB, adjuntosPublicacionDB, reaccionesPublicacionDB] =
        await Promise.all([
          getForoRespuestasByPublicacion(publicacion.id),
          getForoAdjuntosByPublicacion(publicacion.id),
          getReaccionesForoByPublicaciones([publicacion.id]),
        ]);

      const mapaReaccionPublicacion = construirMapaReacciones(
        reaccionesPublicacionDB || [],
        "idpublicacion",
        usuarioForoId,
      );

      setReaccionesPublicacionesMap((prev) => ({
        ...prev,
        [Number(publicacion.id)]: mapaReaccionPublicacion[
          Number(publicacion.id)
        ] || { total: 0, conteos: {}, miReaccion: null },
      }));

      const adjuntosPubHydrated = await hidratarAdjuntos(
        adjuntosPublicacionDB || [],
      );
      setAdjuntosPublicacion(adjuntosPubHydrated);

      const listaRespuestas = respuestasDB || [];
      setRespuestas(listaRespuestas);

      const respuestaIds = listaRespuestas
        .map((r) => Number(r.id))
        .filter(Boolean);

      if (respuestaIds.length > 0) {
        const [adjuntosRespuestasDB, reaccionesRespuestasDB] =
          await Promise.all([
            getForoAdjuntosByRespuestas(respuestaIds),
            getReaccionesForoByRespuestas(respuestaIds),
          ]);

        const adjuntosHydrated = await hidratarAdjuntos(
          adjuntosRespuestasDB || [],
        );
        const mapaAdjuntos = {};

        adjuntosHydrated.forEach((adj) => {
          const key = Number(adj.idrespuesta);
          if (!mapaAdjuntos[key]) mapaAdjuntos[key] = [];
          mapaAdjuntos[key].push(adj);
        });

        setAdjuntosRespuestasMap(mapaAdjuntos);
        setReaccionesRespuestasMap(
          construirMapaReacciones(
            reaccionesRespuestasDB || [],
            "idrespuesta",
            usuarioForoId,
          ),
        );
      } else {
        setAdjuntosRespuestasMap({});
        setReaccionesRespuestasMap({});
      }
    } catch (error) {
      alert(error?.message || "No se pudieron cargar las respuestas.");
    } finally {
      setCargandoRespuestas(false);
    }
  };

  const subirAdjuntosPublicacionEnSegundoPlano = async ({
    publicacion,
    archivos = [],
    videoExterno = "",
  }) => {
    const jobId = `pub-${publicacion.id}-${Date.now()}`;
    const tieneVideoSubido = archivos.some((file) =>
      String(file.type || "").startsWith("video/"),
    );
    const tituloJob = tieneVideoSubido
      ? `Subiendo video: ${publicacion.titulo}`
      : `Subiendo adjuntos: ${publicacion.titulo}`;

    agregarSubidaForo({
      id: jobId,
      titulo: tituloJob,
      estado: "Subiendo en segundo plano...",
    });

    try {
      for (const file of archivos) {
        const esVideo = String(file.type || "").startsWith("video/");
        actualizarSubidaForo(jobId, {
          estado: esVideo
            ? `Subiendo video a Vimeo: ${file.name}`
            : `Subiendo archivo: ${file.name}`,
        });
        await subirYGuardarAdjuntoForo({
          file,
          grupoId,
          idpublicacion: publicacion.id,
        });
      }

      if (videoExterno.trim()) {
        actualizarSubidaForo(jobId, { estado: "Guardando enlace de video..." });
        await crearForoAdjuntoEnlaceVideo({
          idpublicacion: publicacion.id,
          url: videoExterno.trim(),
        });
      }

      actualizarSubidaForo(jobId, { estado: "Completado" });
      mostrarAvisoForo(
        "success",
        tieneVideoSubido
          ? "Video listo, publicación actualizada."
          : "Adjuntos listos, publicación actualizada.",
      );
      await cargarPublicaciones();

      const activaActual = publicacionActivaRef.current;
      if (activaActual && Number(activaActual.id) === Number(publicacion.id)) {
        await cargarRespuestas(publicacion);
      }
      removerSubidaForo(jobId);
    } catch (error) {
      actualizarSubidaForo(jobId, { estado: "Error al subir adjuntos" });
      mostrarAvisoForo(
        "error",
        error?.message || "No se pudieron subir los adjuntos del foro.",
      );
      removerSubidaForo(jobId);
    }
  };

  const subirAdjuntosRespuestaEnSegundoPlano = async ({
    respuesta,
    publicacion,
    archivos = [],
    videoExterno = "",
  }) => {
    const jobId = `resp-${respuesta.id}-${Date.now()}`;
    const tieneVideoSubido = archivos.some((file) =>
      String(file.type || "").startsWith("video/"),
    );

    agregarSubidaForo({
      id: jobId,
      titulo: tieneVideoSubido
        ? "Subiendo video de respuesta"
        : "Subiendo adjunto de respuesta",
      estado: "Subiendo en segundo plano...",
    });

    try {
      for (const file of archivos) {
        const esVideo = String(file.type || "").startsWith("video/");
        actualizarSubidaForo(jobId, {
          estado: esVideo
            ? `Subiendo video a Vimeo: ${file.name}`
            : `Subiendo archivo: ${file.name}`,
        });
        await subirYGuardarAdjuntoForo({
          file,
          grupoId,
          idrespuesta: respuesta.id,
        });
      }

      if (videoExterno.trim()) {
        actualizarSubidaForo(jobId, { estado: "Guardando enlace de video..." });
        await crearForoAdjuntoEnlaceVideo({
          idrespuesta: respuesta.id,
          url: videoExterno.trim(),
        });
      }

      actualizarSubidaForo(jobId, { estado: "Completado" });
      mostrarAvisoForo(
        "success",
        tieneVideoSubido
          ? "Video listo, respuesta actualizada."
          : "Adjunto listo, respuesta actualizada.",
      );

      const activaActual = publicacionActivaRef.current;
      if (activaActual && Number(activaActual.id) === Number(publicacion.id)) {
        await cargarRespuestas(publicacion);
      }
      await cargarPublicaciones();
      removerSubidaForo(jobId);
    } catch (error) {
      actualizarSubidaForo(jobId, { estado: "Error al subir adjuntos" });
      mostrarAvisoForo(
        "error",
        error?.message || "No se pudieron subir los adjuntos de la respuesta.",
      );
      removerSubidaForo(jobId);
    }
  };

  useEffect(() => {
    if (grupoId) cargarPublicaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const publicacionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return publicaciones;

    return publicaciones.filter((p) => {
      return (
        String(p.titulo || "")
          .toLowerCase()
          .includes(q) ||
        String(p.content || p.contenido || "")
          .toLowerCase()
          .includes(q) ||
        String(p.autor_nombre || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [publicaciones, busqueda]);

  const handleSeleccionarArchivosPublicacion = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3)
      alert("Solo puedes adjuntar hasta 3 archivos por publicación.");
    setArchivosPublicacion(files.slice(0, 3));
  };

  const handleSeleccionarArchivosRespuesta = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 1)
      alert("Solo puedes adjuntar 1 archivo por respuesta.");
    setArchivosRespuesta(files.slice(0, 1));
  };

  const handleCrearPublicacion = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      if (
        videoExternoPublicacion.trim() &&
        !esUrlValida(videoExternoPublicacion.trim())
      ) {
        throw new Error("El enlace de video no es válido.");
      }

      const archivosSeleccionados = [...archivosPublicacion];
      const videoExternoSeleccionado = videoExternoPublicacion.trim();
      const tieneAdjuntos =
        archivosSeleccionados.length > 0 || videoExternoSeleccionado;
      const tieneVideoSubido = archivosSeleccionados.some((file) =>
        String(file.type || "").startsWith("video/"),
      );

      const nuevaPublicacion = await crearForoPublicacion({
        grupoId,
        titulo: formPublicacion.titulo,
        contenido: formPublicacion.contenido,
      });

      setFormPublicacion({ titulo: "", contenido: "" });
      setArchivosPublicacion([]);
      setVideoExternoPublicacion("");
      setFileKeyPublicacion((prev) => prev + 1);

      await cargarPublicaciones();
      await cargarRespuestas(nuevaPublicacion);

      if (tieneAdjuntos) {
        mostrarAvisoForo(
          "info",
          tieneVideoSubido
            ? "Publicación creada. El video se sube en segundo plano."
            : "Publicación creada. Adjuntos subiendo.",
        );
        subirAdjuntosPublicacionEnSegundoPlano({
          publicacion: nuevaPublicacion,
          archivos: archivosSeleccionados,
          videoExterno: videoExternoSeleccionado,
        });
      } else {
        mostrarAvisoForo("success", "Publicación creada correctamente.");
      }
    } catch (error) {
      alert(error?.message || "No se pudo crear la publicación.");
    } finally {
      setGuardando(false);
    }
  };

  const handleResponder = async (e) => {
    e.preventDefault();
    if (!publicacionActiva) return;

    try {
      setGuardandoRespuesta(true);
      if (
        videoExternoRespuesta.trim() &&
        !esUrlValida(videoExternoRespuesta.trim())
      ) {
        throw new Error("El enlace de video no es válido.");
      }

      const archivosSeleccionados = [...archivosRespuesta];
      const videoExternoSeleccionado = videoExternoRespuesta.trim();
      const tieneAdjuntos =
        archivosSeleccionados.length > 0 || videoExternoSeleccionado;
      const tieneVideoSubido = archivosSeleccionados.some((file) =>
        String(file.type || "").startsWith("video/"),
      );

      const nuevaRespuesta = await crearForoRespuesta({
        publicacionId: publicacionActiva.id,
        contenido: formRespuesta,
      });

      setFormRespuesta("");
      setArchivosRespuesta([]);
      setVideoExternoRespuesta("");
      setFileKeyRespuesta((prev) => prev + 1);

      await cargarRespuestas(publicacionActiva);
      await cargarPublicaciones();

      if (tieneAdjuntos) {
        mostrarAvisoForo(
          "info",
          tieneVideoSubido
            ? "Respuesta creada. Video subiendo."
            : "Respuesta creada. Adjunto subiendo.",
        );
        subirAdjuntosRespuestaEnSegundoPlano({
          respuesta: nuevaRespuesta,
          publicacion: publicacionActiva,
          archivos: archivosSeleccionados,
          videoExterno: videoExternoSeleccionado,
        });
      } else {
        mostrarAvisoForo("success", "Respuesta enviada correctamente.");
      }
    } catch (error) {
      alert(error?.message || "No se pudo enviar la respuesta.");
    } finally {
      setGuardandoRespuesta(false);
    }
  };

  const handleEliminarPublicacion = async (publicacion) => {
    const ok = window.confirm("¿Eliminar esta publicación del foro?");
    if (!ok) return;
    try {
      await eliminarForoPublicacion(publicacion.id);
      if (publicacionActiva?.id === publicacion.id) {
        setPublicacionActiva(null);
        setRespuestas([]);
        setAdjuntosPublicacion([]);
        setAdjuntosRespuestasMap({});
      }
      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo eliminar la publicación.");
    }
  };

  const handleEliminarRespuesta = async (respuesta) => {
    const ok = window.confirm("¿Eliminar esta respuesta?");
    if (!ok) return;
    try {
      await eliminarForoRespuesta(respuesta.id);
      await cargarRespuestas(publicacionActiva);
      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo eliminar la respuesta.");
    }
  };

  const handleEliminarAdjuntoPublicacion = async (adjunto) => {
    const ok = window.confirm("¿Eliminar este adjunto?");
    if (!ok) return;
    try {
      await eliminarForoAdjunto(adjunto.id);
      await cargarRespuestas(publicacionActiva);
    } catch (error) {
      alert(error?.message || "No se pudo eliminar el adjunto.");
    }
  };

  const handleEliminarAdjuntoRespuesta = async (adjunto) => {
    const ok = window.confirm("¿Eliminar este adjunto?");
    if (!ok) return;
    try {
      await eliminarForoAdjunto(adjunto.id);
      await cargarRespuestas(publicacionActiva);
    } catch (error) {
      alert(error?.message || "No se pudo eliminar el adjunto.");
    }
  };

  const handleToggleFijado = async (publicacion) => {
    try {
      await toggleFijarForoPublicacion(publicacion.id, !publicacion.fijado);
      await cargarPublicaciones();
    } catch (error) {
      alert(error?.message || "No se pudo actualizar la publicación.");
    }
  };

  const handleToggleCerrado = async (publicacion) => {
    try {
      await toggleCerrarForoPublicacion(publicacion.id, !publicacion.cerrado);
      await cargarPublicaciones();
      if (publicacionActiva?.id === publicacion.id) {
        setPublicacionActiva({
          ...publicacionActiva,
          cerrado: !publicacion.cerrado,
        });
      }
    } catch (error) {
      alert(error?.message || "No se pudo actualizar la publicación.");
    }
  };

  const handleReaccionarPublicacion = async (publicacionId, tipo) => {
    try {
      setReaccionandoKey(`pub-${publicacionId}`);
      await guardarReaccionForoPublicacion({ publicacionId, tipo });
      const reaccionesDB = await getReaccionesForoByPublicaciones([
        publicacionId,
      ]);
      const mapa = construirMapaReacciones(
        reaccionesDB || [],
        "idpublicacion",
        usuarioForoId,
      );
      setReaccionesPublicacionesMap((prev) => ({
        ...prev,
        [Number(publicacionId)]: mapa[Number(publicacionId)] || {
          total: 0,
          conteos: {},
          miReaccion: null,
        },
      }));
    } catch (error) {
      alert(error?.message || "No se pudo guardar la reacción.");
    } finally {
      setReaccionandoKey(null);
    }
  };

  const handleReaccionarRespuesta = async (respuestaId, tipo) => {
    try {
      setReaccionandoKey(`resp-${respuestaId}`);
      await guardarReaccionForoRespuesta({ respuestaId, tipo });
      const reaccionesDB = await getReaccionesForoByRespuestas([respuestaId]);
      const mapa = construirMapaReacciones(
        reaccionesDB || [],
        "idrespuesta",
        usuarioForoId,
      );
      setReaccionesRespuestasMap((prev) => ({
        ...prev,
        [Number(respuestaId)]: mapa[Number(respuestaId)] || {
          total: 0,
          conteos: {},
          miReaccion: null,
        },
      }));
    } catch (error) {
      alert(error?.message || "No se pudo guardar la reacción.");
    } finally {
      setReaccionandoKey(null);
    }
  };

  return (
    <>
      <div className="fixed right-5 top-5 z-[9999] space-y-3">
        {avisosForo.map((aviso) => (
          <div
            key={aviso.id}
            className={`w-[340px] rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${aviso.tipo === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : aviso.tipo === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}
          >
            {aviso.mensaje}
          </div>
        ))}
      </div>

      {subidasForo.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[360px] space-y-3">
          {subidasForo.map((subida) => (
            <div
              key={subida.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            >
              <p className="text-sm font-black text-slate-900">
                {subida.titulo}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {subida.estado}
              </p>
              {subida.estado !== "Completado" &&
                subida.estado !== "Error al subir adjuntos" && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-indigo-500" />
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <section className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-950 to-indigo-900 px-6 py-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              Foro del grupo
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">
              Discusiones y comunicados
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-indigo-100">
              Crea publicaciones, responde dudas y comparte archivos de apoyo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[420px_1fr]">
            <div className="space-y-5">
              {puedeModerar && (
                <form
                  onSubmit={handleCrearPublicacion}
                  className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      Nueva publicación
                    </h4>
                    <p className="text-sm text-slate-500">
                      Crea un tema o aviso general.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Título
                    </label>
                    <input
                      value={formPublicacion.titulo}
                      onChange={(e) =>
                        setFormPublicacion((prev) => ({
                          ...prev,
                          titulo: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Ej. Material complementario"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Contenido
                    </label>
                    <textarea
                      value={formPublicacion.contenido}
                      onChange={(e) =>
                        setFormPublicacion((prev) => ({
                          ...prev,
                          contenido: e.target.value,
                        }))
                      }
                      rows={5}
                      className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Escribe el mensaje..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Adjuntar archivos
                    </label>
                    <input
                      key={fileKeyPublicacion}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                      onChange={handleSeleccionarArchivosPublicacion}
                      className="mt-1 w-full rounded-2xl border border-dashed bg-white px-4 py-3 text-sm text-slate-600"
                    />
                    {archivosPublicacion.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {archivosPublicacion.map((f) => (
                          <p
                            key={f.name}
                            className="text-xs font-semibold text-slate-500"
                          >
                            📎 {f.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">
                      Video Externo
                    </label>
                    <input
                      value={videoExternoPublicacion}
                      onChange={(e) =>
                        setVideoExternoPublicacion(e.target.value)
                      }
                      className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Enlace de YouTube o Vimeo"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={guardando}
                    className={`w-full rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${guardando ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
                  >
                    {guardando ? "Publicando..." : "Publicar"}
                  </button>
                </form>
              )}

              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      Temas del Foro
                    </h4>
                    <p className="text-sm text-slate-500">
                      {publicaciones.length} hilo(s) activo(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={cargarPublicaciones}
                    className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Actualizar
                  </button>
                </div>

                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="mt-4 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Buscar en el foro..."
                />

                <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
                  {cargando ? (
                    <div className="text-sm text-slate-500">
                      Cargando publicaciones...
                    </div>
                  ) : publicacionesFiltradas.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No hay publicaciones todavía.
                    </div>
                  ) : (
                    publicacionesFiltradas.map((pub) => {
                      const activa =
                        Number(publicacionActiva?.id) === Number(pub.id);
                      return (
                        <button
                          key={pub.id}
                          type="button"
                          onClick={() => {
                            cargarRespuestas(pub);
                          }}
                          className={`w-full rounded-2xl border p-4 text-left transition ${activa ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {pub.fijado && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                Fijado
                              </span>
                            )}
                            {pub.cerrado && (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                Cerrado
                              </span>
                            )}
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              {pub.autor_rol}
                            </span>
                          </div>
                          <h5 className="mt-2 font-black text-slate-900">
                            {pub.titulo}
                          </h5>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {pub.contenido}
                          </p>
                          <div className="mt-3 flex justify-between text-xs text-slate-400">
                            <span>{pub.autor_nombre}</span>
                            <span>
                              {pub.total_respuestas || 0} respuesta(s)
                            </span>
                          </div>
                          <div className="mt-2">
                            <ResumenReaccionesForo
                              resumen={
                                reaccionesPublicacionesMap[Number(pub.id)]
                              }
                            />
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {!publicacionActiva ? (
                <div className="flex h-full min-h-[520px] items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">
                      📥
                    </div>
                    <h4 className="mt-4 text-xl font-black text-slate-900">
                      Selecciona una discusión
                    </h4>
                    <p className="mt-2 max-w-md text-sm text-slate-500">
                      Elige un tema de la lista de la izquierda para ver el
                      contenido completo, descargar adjuntos y participar.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[520px] flex-col">
                  <div className="border-b border-slate-200 bg-slate-50 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {publicacionActiva.fijado && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                              Fijado
                            </span>
                          )}
                          {publicacionActiva.cerrado && (
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600">
                              Cerrado
                            </span>
                          )}
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-700">
                            {publicacionActiva.autor_rol}
                          </span>
                        </div>
                        <h4 className="mt-3 text-2xl font-black text-slate-900">
                          {publicacionActiva.titulo}
                        </h4>
                        <p className="mt-1 text-xs text-slate-400">
                          Por {publicacionActiva.autor_nombre} ·{" "}
                          {formatearFecha(publicacionActiva.created_at)}
                        </p>
                      </div>

                      {puedeModerar && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleFijado(publicacionActiva)
                            }
                            className="rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            {publicacionActiva.fijado ? "Desfijar" : "Fijar"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleCerrado(publicacionActiva)
                            }
                            className="rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            {publicacionActiva.cerrado
                              ? "Reabrir"
                              : "Cerrar Tema"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleEliminarPublicacion(publicacionActiva)
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mt-5 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                      {publicacionActiva.contenido}
                    </p>

                    {!publicacionActivaTieneVideo && (
                      <ReaccionesForo
                        resumen={
                          reaccionesPublicacionesMap[
                            Number(publicacionActiva.id)
                          ]
                        }
                        disabled={
                          reaccionandoKey === `pub-${publicacionActiva.id}`
                        }
                        onReaccionar={(tipo) =>
                          handleReaccionarPublicacion(
                            publicacionActiva.id,
                            tipo,
                          )
                        }
                      />
                    )}

                    <AdjuntosForo
                      adjuntos={adjuntosPublicacion}
                      puedeModerar={puedeModerar}
                      onEliminar={handleEliminarAdjuntoPublicacion}
                      resumenReacciones={
                        reaccionesPublicacionesMap[Number(publicacionActiva.id)]
                      }
                      mostrarReaccionesEnVideo={publicacionActivaTieneVideo}
                    />
                  </div>

                  <div className="flex-1 space-y-4 p-6 bg-slate-50/50">
                    <h5 className="font-black text-slate-900 text-sm tracking-wide uppercase">
                      Hilo de Respuestas
                    </h5>

                    {cargandoRespuestas ? (
                      <div className="text-sm text-slate-500">
                        Cargando comentarios...
                      </div>
                    ) : respuestas.length === 0 ? (
                      <div className="text-sm text-slate-400 italic">
                        No hay respuestas en este tema todavía.
                      </div>
                    ) : (
                      respuestas.map((answer) => (
                        <div
                          key={answer.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {answer.autor_nombre}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  ({answer.autor_rol})
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {formatearFecha(answer.created_at)}
                              </p>
                            </div>
                            {puedeModerar && (
                              <button
                                type="button"
                                onClick={() => handleEliminarRespuesta(answer)}
                                className="text-xs text-red-500 font-bold hover:underline"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {answer.contenido}
                          </p>
                          <AdjuntosForo
                            adjuntos={
                              adjuntosRespuestasMap[Number(answer.id)] || []
                            }
                            puedeModerar={puedeModerar}
                            onEliminar={handleEliminarAdjuntoRespuesta}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={handleResponder}
                    className="border-t border-slate-200 bg-white p-5"
                  >
                    {publicacionActiva.cerrado ? (
                      <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500 text-center font-medium">
                        🔒 Esta publicación ha sido cerrada y no admite nuevas
                        respuestas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={formRespuesta}
                          onChange={(e) => setFormRespuesta(e.target.value)}
                          rows={2}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="Escribe tu aporte o respuesta al tema..."
                          required
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                              Adjuntar un archivo
                            </label>
                            <input
                              key={fileKeyRespuesta}
                              type="file"
                              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
                              onChange={handleSeleccionarArchivosRespuesta}
                              className="mt-1 w-full rounded-xl border border-dashed bg-slate-50 px-3 py-2 text-xs text-slate-600"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">
                              Video complementario (URL)
                            </label>
                            <input
                              value={videoExternoRespuesta}
                              onChange={(e) =>
                                setVideoExternoRespuesta(e.target.value)
                              }
                              className="mt-1 w-full rounded-xl border bg-slate-50 px-3 py-2 text-xs outline-none"
                              placeholder="Enlace de YouTube o Vimeo"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={guardandoRespuesta}
                            className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition ${guardandoRespuesta ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
                          >
                            {guardandoRespuesta ? "Enviando..." : "Responder"}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
