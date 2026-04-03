import api from "../api";

export const obtenerPagos = async () => {
  const response = await api.get("/pago");
  return response.data;
};

export const obtenerPensiones = async () => {
  const response = await api.get("/pension");
  return response.data;
};
