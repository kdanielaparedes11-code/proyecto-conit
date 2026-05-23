import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquarePlus,
  ArrowLeft,
  Send,
  MessageCircle,
} from "lucide-react";
import {
  obtenerPublicacionesPorGrupo,
  crearPublicacion,
  crearRespuesta,
  obtenerRespuestas,
} from "../services/foro.service";

export default function ForoGrupo() {
  const { idgrupo } = useParams();
  const navigate = useNavigate();

  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [respuestasInputs, setRespuestasInputs] = useState({});

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esEstudiante = usuario.rol === "ALUMNO";

  useEffect(() => {
    cargarForo();
  }, [idgrupo]);

  async function cargarForo() {
    try {
      setLoading(true);
      const data = await obtenerPublicacionesPorGrupo(idgrupo);

      // 🔥 Ahora cargamos las respuestas para cada publicación de forma paralela
      const publicacionesConRespuestas = await Promise.all(
        data.map(async (pub) => {
          const respuestas = await obtenerRespuestas(pub.id);
          return { ...pub, respuestas: respuestas || [] };
        }),
      );

      setPublicaciones(publicacionesConRespuestas);
    } catch (error) {
      console.error("Error al cargar el foro:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrearPublicacion(e) {
    e.preventDefault();
    try {
      await crearPublicacion(idgrupo, { titulo, contenido });
      setTitulo("");
      setContenido("");
      cargarForo();
    } catch (error) {
      alert("Error al publicar", error);
    }
  }

  async function handleEnviarRespuesta(idPublicacion) {
    const contenidoRespuesta = respuestasInputs[idPublicacion];
    if (!contenidoRespuesta?.trim()) return;

    try {
      await crearRespuesta(idPublicacion, { contenido: contenidoRespuesta });
      setRespuestasInputs({ ...respuestasInputs, [idPublicacion]: "" });
      cargarForo();
    } catch (error) {
      alert("Error al responder", error);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={20} /> Volver al curso
      </button>

      {/* FORMULARIO SOLO ADMIN/DOCENTE */}
      {!esEstudiante && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <MessageSquarePlus size={20} className="text-indigo-600" />
            Nueva Publicación
          </h2>
          <form onSubmit={handleCrearPublicacion} className="space-y-4">
            <input
              type="text"
              placeholder="Título..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-xl border p-3"
              required
            />
            <textarea
              placeholder="Contenido..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={3}
              className="w-full rounded-xl border p-3"
              required
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl"
            >
              Publicar
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE PUBLICACIONES */}
      <div className="space-y-6">
        {loading ? (
          <p className="text-center text-slate-500">Cargando foro...</p>
        ) : (
          publicaciones.map((pub) => (
            <div
              key={pub.id}
              className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
            >
              {/* CABECERA POST */}
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {pub.titulo}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Autor: {pub.autor_nombre} • {pub.autor_rol}
                </p>
                {/* 👇 CONTENIDO COMPLETO (Quitamos line-clamp-3) */}
                <p className="mt-4 text-slate-700 whitespace-pre-wrap">
                  {pub.contenido}
                </p>
              </div>

              {/* RESPUESTAS ANIDADAS */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageCircle size={16} /> Respuestas (
                  {pub.respuestas.length})
                </h4>
                {pub.respuestas.map((resp) => (
                  <div
                    key={resp.id}
                    className="bg-white p-3 rounded-lg border text-sm border-slate-100"
                  >
                    <p className="font-semibold text-indigo-700 text-xs">
                      {resp.autor_nombre}
                    </p>
                    <p className="text-slate-600">{resp.contenido}</p>
                  </div>
                ))}
              </div>

              {/* FORMULARIO RESPUESTA */}
              <div className="flex gap-2">
                <textarea
                  placeholder="Escribe una respuesta..."
                  className="flex-1 rounded-xl border p-2 text-sm"
                  rows={1}
                  value={respuestasInputs[pub.id] || ""}
                  onChange={(e) =>
                    setRespuestasInputs({
                      ...respuestasInputs,
                      [pub.id]: e.target.value,
                    })
                  }
                />
                <button
                  onClick={() => handleEnviarRespuesta(pub.id)}
                  className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
