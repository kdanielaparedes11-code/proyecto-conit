import { useState } from "react";
import { X, UploadCloud, FileText, Link as LinkIcon } from "lucide-react";
import { entregarTareaEstudiante } from "../services/tarea.service";

export default function EntregaTareaModal({
  tarea,
  curso,
  onClose,
  onSuccess,
}) {
  const [comentario, setComentario] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [enlace, setEnlace] = useState("");
  const [cargando, setCargando] = useState(false);

  const tipo = tarea.tipo_entrega || "archivo";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tipo === "archivo" && !archivo)
      return alert("Debes adjuntar un archivo.");
    if (tipo === "texto" && !comentario)
      return alert("Debes escribir tu respuesta.");
    if (tipo === "enlace" && !enlace)
      return alert("Debes proporcionar un enlace.");

    setCargando(true);
    try {
      const idalumno = localStorage.getItem("idalumno");
      const idmatricula =
        curso?.idmatricula || localStorage.getItem("idmatricula") || 1;

      const formData = new FormData();
      formData.append("idtarea", tarea.id);
      formData.append("idalumno", idalumno);
      formData.append("idmatricula", idmatricula);

      if (archivo) formData.append("file", archivo);
      if (comentario) formData.append("comentario", comentario);
      if (enlace) formData.append("archivo_url", enlace);

      await entregarTareaEstudiante(formData);

      alert("¡Tarea entregada con éxito! 🎉");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Ocurrió un error al entregar la tarea.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-bold">Entregar Tarea</h3>
            <p className="text-xs text-indigo-200 mt-1">{tarea.titulo}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {tarea.descripcion}
            </p>
          </div>

          {tipo === "archivo" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <UploadCloud size={16} className="text-indigo-600" /> Sube tu
                archivo
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-dashed border-slate-300 rounded-xl p-2 cursor-pointer"
              />
            </div>
          )}

          {tipo === "texto" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" /> Escribe tu
                respuesta
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Escribe aquí tu trabajo..."
              />
            </div>
          )}

          {tipo === "enlace" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <LinkIcon size={16} className="text-indigo-600" /> Enlace de tu
                trabajo
              </label>
              <input
                type="url"
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://drive.google.com/..."
              />
            </div>
          )}

          {tipo !== "texto" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">
                Comentario opcional
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none"
                placeholder="Añade una nota para el docente..."
              />
            </div>
          )}

          <div className="pt-4 border-t flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className={`px-5 py-2.5 rounded-xl font-bold text-white transition ${cargando ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
            >
              {cargando ? "Enviando..." : "Enviar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
