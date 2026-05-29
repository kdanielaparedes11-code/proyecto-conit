// src/services/tarea.service.js
import api from "../api";

export const getTareasByCurso = async (idcurso: number) => {
  const response = await api.get(`/tarea/${idcurso}`);
  return response.data;
};

// Función para enviar la tarea
export const entregarTareaEstudiante = async (formData: FormData) => {
  // Usamos api.post. Si envías FormData (archivos), Axios ajusta automáticamente los headers a multipart/form-data
  const response = await api.post("/tarea/entrega", formData);
  return response.data;
};
