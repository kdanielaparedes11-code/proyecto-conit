const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const manejarRespuesta = async (res, mensajeError) => {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || mensajeError);
  }

  return await res.json();
};

export const listarPasarelasPago = async () => {
  const res = await fetch(`${API_URL}/config-pago/pasarelas`, {
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al listar pasarelas de pago");
};

export const obtenerConfiguracionPasarela = async (pasarela) => {
  const res = await fetch(`${API_URL}/config-pago/${pasarela}`, {
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al obtener configuración de la pasarela");
};

export const guardarConfiguracionPasarela = async (pasarela, data) => {
  const res = await fetch(`${API_URL}/config-pago/${pasarela}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al guardar configuración de la pasarela");
};

export const listarCuentasBancarias = async () => {
  const res = await fetch(`${API_URL}/config-pago/cuentas/bancarias`, {
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al listar cuentas bancarias");
};

export const agregarCuentaBancaria = async (data) => {
  const res = await fetch(`${API_URL}/config-pago/cuentas/bancarias`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al agregar cuenta bancaria");
};

export const actualizarCuentaBancaria = async (id, data) => {
  const res = await fetch(`${API_URL}/config-pago/cuentas/bancarias/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al actualizar cuenta bancaria");
};

export const eliminarCuentaBancaria = async (id) => {
  const res = await fetch(`${API_URL}/config-pago/cuentas/bancarias/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al eliminar cuenta bancaria");
};