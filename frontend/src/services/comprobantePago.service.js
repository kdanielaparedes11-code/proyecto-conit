const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const manejarRespuesta = async (res, mensajeError) => {
  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || mensajeError);
  }

  return res.json();
};

export const listarComprobantesPago = async (estado = "TODOS") => {
  const query = estado && estado !== "TODOS" ? `?estado=${estado}` : "";

  const res = await fetch(`${API_URL}/comprobante-pago/admin${query}`, {
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al listar comprobantes de pago");
};

export const obtenerDetalleComprobantePago = async (id) => {
  const res = await fetch(`${API_URL}/comprobante-pago/admin/${id}`, {
    headers: getHeaders(),
  });

  return manejarRespuesta(res, "Error al obtener detalle del comprobante");
};

export const obtenerVoucherUrl = async (id) => {
  const res = await fetch(
    `${API_URL}/comprobante-pago/admin/${id}/voucher-url`,
    {
      headers: getHeaders(),
    }
  );

  return manejarRespuesta(res, "Error al obtener voucher");
};

export const aprobarComprobantePago = async (id, data = {}) => {
  const res = await fetch(`${API_URL}/comprobante-pago/admin/${id}/aprobar`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al aprobar comprobante");
};

export const rechazarComprobantePago = async (id, data = {}) => {
  const res = await fetch(`${API_URL}/comprobante-pago/admin/${id}/rechazar`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al rechazar comprobante");
};

export const observarComprobantePago = async (id, data = {}) => {
  const res = await fetch(`${API_URL}/comprobante-pago/admin/${id}/observar`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return manejarRespuesta(res, "Error al observar comprobante");
};