import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  listarComprobantesPago,
  obtenerDetalleComprobantePago,
  obtenerVoucherUrl,
  aprobarComprobantePago,
  rechazarComprobantePago,
  observarComprobantePago,
} from "../services/comprobantePago.service";

const estados = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "APROBADO", label: "Aprobados" },
  { value: "RECHAZADO", label: "Rechazados" },
  { value: "OBSERVADO", label: "Observados" },
];

const estadoStyles = {
  PENDIENTE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  APROBADO: "bg-green-50 text-green-700 border-green-200",
  RECHAZADO: "bg-red-50 text-red-700 border-red-200",
  OBSERVADO: "bg-blue-50 text-blue-700 border-blue-200",
};

const estadoIconos = {
  PENDIENTE: Clock,
  APROBADO: CheckCircle,
  RECHAZADO: XCircle,
  OBSERVADO: AlertCircle,
};

const formatearMoneda = (monto, moneda = "PEN") => {
  const valor = Number(monto || 0);

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda || "PEN",
  }).format(valor);
};

const formatearFecha = (fecha) => {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ComprobantesPago() {
  const [comprobantes, setComprobantes] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(false);

  const [detalle, setDetalle] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const [modalAccion, setModalAccion] = useState(null);
  const [observacionAdmin, setObservacionAdmin] = useState("");

  const cargarComprobantes = async () => {
    try {
      setCargando(true);
      const data = await listarComprobantesPago(estadoFiltro);
      setComprobantes(data);
    } catch (error) {
      toast.error(error.message || "Error al cargar comprobantes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComprobantes();
  }, [estadoFiltro]);

  const comprobantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return comprobantes;

    return comprobantes.filter((item) => {
      const alumno = `${item.alumno?.nombre || ""} ${
        item.alumno?.apellido || ""
      }`.toLowerCase();

      const curso = `${item.grupo?.curso || ""}`.toLowerCase();
      const grupo = `${item.grupo?.nombregrupo || ""}`.toLowerCase();
      const operacion = `${item.numero_operacion || ""}`.toLowerCase();

      return (
        alumno.includes(texto) ||
        curso.includes(texto) ||
        grupo.includes(texto) ||
        operacion.includes(texto)
      );
    });
  }, [comprobantes, busqueda]);

  const abrirDetalle = async (id) => {
    try {
      setAccionando(true);
      const data = await obtenerDetalleComprobantePago(id);
      setDetalle(data);
      setModalDetalleAbierto(true);
    } catch (error) {
      toast.error(error.message || "Error al obtener detalle");
    } finally {
      setAccionando(false);
    }
  };

  const abrirVoucher = async (id) => {
    try {
      const data = await obtenerVoucherUrl(id);

      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No se encontró el voucher");
      }
    } catch (error) {
      toast.error(error.message || "Error al abrir voucher");
    }
  };

  const abrirModalAccion = (tipo, comprobante) => {
    setModalAccion({
      tipo,
      comprobante,
    });

    if (tipo === "APROBAR") {
      setObservacionAdmin("Voucher validado correctamente.");
    }

    if (tipo === "RECHAZAR") {
      setObservacionAdmin("El comprobante no es válido.");
    }

    if (tipo === "OBSERVAR") {
      setObservacionAdmin("El comprobante requiere revisión o corrección.");
    }
  };

  const cerrarModalAccion = () => {
    setModalAccion(null);
    setObservacionAdmin("");
  };

  const ejecutarAccion = async () => {
    if (!modalAccion?.comprobante?.id) return;

    try {
      setAccionando(true);

      const payload = {
        observacion_admin: observacionAdmin,
      };

      if (modalAccion.tipo === "APROBAR") {
        await aprobarComprobantePago(modalAccion.comprobante.id, payload);
        toast.success("Comprobante aprobado y matrícula creada");
      }

      if (modalAccion.tipo === "RECHAZAR") {
        await rechazarComprobantePago(modalAccion.comprobante.id, payload);
        toast.success("Comprobante rechazado");
      }

      if (modalAccion.tipo === "OBSERVAR") {
        await observarComprobantePago(modalAccion.comprobante.id, payload);
        toast.success("Comprobante marcado como observado");
      }

      cerrarModalAccion();
      setModalDetalleAbierto(false);
      setDetalle(null);
      await cargarComprobantes();
    } catch (error) {
      toast.error(error.message || "No se pudo completar la acción");
    } finally {
      setAccionando(false);
    }
  };

  const renderEstado = (estado) => {
    const Icon = estadoIconos[estado] || AlertCircle;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
          estadoStyles[estado] || "border-slate-200 bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={13} />
        {estado || "SIN ESTADO"}
      </span>
    );
  };

  const renderAcciones = (comprobante) => {
    const bloqueado = comprobante.estado === "APROBADO";

    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => abrirDetalle(comprobante.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-slate-100"
        >
          <Eye size={15} />
          Detalle
        </button>

        <button
          onClick={() => abrirVoucher(comprobante.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold hover:bg-slate-100"
        >
          <FileText size={15} />
          Voucher
        </button>

        {!bloqueado && comprobante.estado !== "RECHAZADO" && (
          <button
            onClick={() => abrirModalAccion("APROBAR", comprobante)}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            <CheckCircle size={15} />
            Aprobar
          </button>
        )}

        {!bloqueado && comprobante.estado !== "RECHAZADO" && (
          <button
            onClick={() => abrirModalAccion("OBSERVAR", comprobante)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <AlertCircle size={15} />
            Observar
          </button>
        )}

        {!bloqueado && comprobante.estado !== "RECHAZADO" && (
          <button
            onClick={() => abrirModalAccion("RECHAZAR", comprobante)}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <XCircle size={15} />
            Rechazar
          </button>
        )}
      </div>
    );
  };

  const tituloAccion = {
    APROBAR: "Aprobar y matricular",
    RECHAZAR: "Rechazar comprobante",
    OBSERVAR: "Observar comprobante",
  };

  const descripcionAccion = {
    APROBAR:
      "Se validará el voucher, se creará la matrícula del alumno y se registrará el pago.",
    RECHAZAR:
      "El comprobante quedará rechazado. Es recomendable indicar el motivo.",
    OBSERVAR:
      "El comprobante quedará observado para que se pueda revisar o corregir.",
  };

  const colorBotonAccion = {
    APROBAR: "bg-green-600 hover:bg-green-700",
    RECHAZAR: "bg-red-600 hover:bg-red-700",
    OBSERVAR: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Comprobantes de pago
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Revisa los vouchers enviados por los alumnos y aprueba la matrícula
            cuando el pago sea válido.
          </p>
        </div>

        <button
          onClick={cargarComprobantes}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-semibold hover:bg-slate-100"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {estados.map((estado) => (
              <button
                key={estado.value}
                onClick={() => setEstadoFiltro(estado.value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  estadoFiltro === estado.value
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "border border-[var(--color-border)] hover:bg-slate-100"
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar alumno, curso u operación..."
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        {cargando ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="mr-2 animate-spin" size={22} />
            Cargando comprobantes...
          </div>
        ) : comprobantesFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="mb-3 text-slate-400" size={42} />
            <h3 className="font-bold text-[var(--color-text)]">
              No hay comprobantes
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              No se encontraron vouchers con el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Curso / Grupo</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Operación</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {comprobantesFiltrados.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-[var(--color-text)]">
                        {item.alumno?.nombre} {item.alumno?.apellido}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {item.alumno?.correo || "-"}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Doc: {item.alumno?.documento || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-semibold text-[var(--color-text)]">
                        {item.grupo?.curso || "-"}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {item.grupo?.nombregrupo || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-[var(--color-text)]">
                        {formatearMoneda(item.monto, item.moneda)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {item.metodo_pago}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="font-mono text-sm">
                        {item.numero_operacion || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      {renderEstado(item.estado)}
                    </td>

                    <td className="px-4 py-4 align-top text-xs text-[var(--color-text-muted)]">
                      {formatearFecha(item.created_at)}
                    </td>

                    <td className="px-4 py-4 align-top">
                      {renderAcciones(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalDetalleAbierto && detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Detalle del comprobante
                </h2>
                <p className="text-sm text-slate-500">
                  Revisa la información enviada por el alumno antes de aprobar.
                </p>
              </div>

              <button
                onClick={() => setModalDetalleAbierto(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-bold text-slate-900">Alumno</h3>
                <p>
                  <span className="font-semibold">Nombre:</span>{" "}
                  {detalle.alumno?.nombre} {detalle.alumno?.apellido}
                </p>
                <p>
                  <span className="font-semibold">Correo:</span>{" "}
                  {detalle.alumno?.correo || "-"}
                </p>
                <p>
                  <span className="font-semibold">Documento:</span>{" "}
                  {detalle.alumno?.numdocumento || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-bold text-slate-900">Curso / Grupo</h3>
                <p>
                  <span className="font-semibold">Curso:</span>{" "}
                  {detalle.grupo?.curso?.nombrecurso || "-"}
                </p>
                <p>
                  <span className="font-semibold">Grupo:</span>{" "}
                  {detalle.grupo?.nombregrupo || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-bold text-slate-900">Pago</h3>
                <p>
                  <span className="font-semibold">Monto:</span>{" "}
                  {formatearMoneda(detalle.monto, detalle.moneda)}
                </p>
                <p>
                  <span className="font-semibold">Operación:</span>{" "}
                  {detalle.numero_operacion || "-"}
                </p>
                <p>
                  <span className="font-semibold">Fecha de pago:</span>{" "}
                  {formatearFecha(detalle.fecha_pago)}
                </p>
                <div className="mt-2">{renderEstado(detalle.estado)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-bold text-slate-900">
                  Cuenta destino
                </h3>
                <p>
                  <span className="font-semibold">Banco:</span>{" "}
                  {detalle.configuracionPago?.credenciales?.banco || "-"}
                </p>
                <p>
                  <span className="font-semibold">Titular:</span>{" "}
                  {detalle.configuracionPago?.credenciales?.titular || "-"}
                </p>
                <p>
                  <span className="font-semibold">Cuenta:</span>{" "}
                  {detalle.configuracionPago?.credenciales?.numero_cuenta ||
                    "-"}
                </p>
                <p>
                  <span className="font-semibold">CCI:</span>{" "}
                  {detalle.configuracionPago?.credenciales?.cci || "-"}
                </p>
              </div>
            </div>

            {detalle.observacion_alumno && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <h3 className="mb-2 font-bold text-slate-900">
                  Observación del alumno
                </h3>
                <p className="text-sm text-slate-600">
                  {detalle.observacion_alumno}
                </p>
              </div>
            )}

            {detalle.observacion_admin && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 font-bold text-blue-900">
                  Observación del administrador
                </h3>
                <p className="text-sm text-blue-800">
                  {detalle.observacion_admin}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => abrirVoucher(detalle.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
              >
                <FileText size={17} />
                Ver voucher
              </button>

              {detalle.estado !== "APROBADO" &&
                detalle.estado !== "RECHAZADO" && (
                  <>
                    <button
                      onClick={() => abrirModalAccion("OBSERVAR", detalle)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <AlertCircle size={17} />
                      Observar
                    </button>

                    <button
                      onClick={() => abrirModalAccion("RECHAZAR", detalle)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <XCircle size={17} />
                      Rechazar
                    </button>

                    <button
                      onClick={() => abrirModalAccion("APROBAR", detalle)}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      <CheckCircle size={17} />
                      Aprobar y matricular
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      )}

      {modalAccion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {tituloAccion[modalAccion.tipo]}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {descripcionAccion[modalAccion.tipo]}
                </p>
              </div>

              <button
                onClick={cerrarModalAccion}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">
                {modalAccion.comprobante?.alumno?.nombre}{" "}
                {modalAccion.comprobante?.alumno?.apellido}
              </p>
              <p className="text-slate-500">
                Operación: {modalAccion.comprobante?.numero_operacion || "-"}
              </p>
              <p className="text-slate-500">
                Monto:{" "}
                {formatearMoneda(
                  modalAccion.comprobante?.monto,
                  modalAccion.comprobante?.moneda
                )}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-900">
                Observación del administrador
              </label>
              <textarea
                value={observacionAdmin}
                onChange={(e) => setObservacionAdmin(e.target.value)}
                rows={4}
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={cerrarModalAccion}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                onClick={ejecutarAccion}
                disabled={accionando}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
                  colorBotonAccion[modalAccion.tipo]
                }`}
              >
                {accionando && <Loader2 className="animate-spin" size={17} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}