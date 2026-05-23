import api from "../api";

export const obtenerPublicacionesPorGrupo = async (idgrupo: string | number) => {
  const response = await api.get(`/foro/grupo/${idgrupo}/publicaciones`);
  return response.data;
};

export const crearPublicacion = async (idgrupo: string | number, data: any) => {
  const response = await api.post(`/foro/grupo/${idgrupo}/publicaciones`, data);
  return response.data;
};

export const obtenerRespuestas = async (idpublicacion: string | number) => {
  const response = await api.get(
    `/foro/publicaciones/${idpublicacion}/respuestas`,
  );
  return response.data;
};

export const crearRespuesta = async (idpublicacion: string | number, data: any) => {
  const response = await api.post(
    `/foro/publicaciones/${idpublicacion}/respuestas`,
    data,
  );
  return response.data;
};