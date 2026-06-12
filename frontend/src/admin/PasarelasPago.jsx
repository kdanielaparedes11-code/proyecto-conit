import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Plus,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

import {
  listarPasarelasPago,
  obtenerConfiguracionPasarela,
  guardarConfiguracionPasarela,
  listarCuentasBancarias,
  agregarCuentaBancaria,
  actualizarCuentaBancaria,
  eliminarCuentaBancaria,
} from "../services/configuracionPago.service";

const iconosPasarela = {
  transferencia: Building2,
  yape: Smartphone,
  mercadopago: Wallet,
  paypal: CreditCard,
  izipay: CreditCard,
};

const camposPorPasarela = {
  yape: [
    { name: "numero", label: "Número de celular", type: "text" },
    { name: "titular", label: "Titular", type: "text" },
    { name: "qr_url", label: "URL del QR", type: "text" },
    {
      name: "instrucciones",
      label: "Instrucciones para el alumno",
      type: "textarea",
    },
  ],
  mercadopago: [
    { name: "public_key", label: "Public Key", type: "text" },
    { name: "access_token", label: "Access Token", type: "password" },
    { name: "webhook_secret", label: "Webhook Secret", type: "password" },
  ],
  paypal: [
    { name: "client_id", label: "Client ID", type: "text" },
    { name: "client_secret", label: "Client Secret", type: "password" },
    { name: "webhook_id", label: "Webhook ID", type: "text" },
  ],
  izipay: [
    { name: "merchant_id", label: "Merchant ID", type: "text" },
    { name: "username", label: "Usuario", type: "text" },
    { name: "password", label: "Contraseña", type: "password" },
    { name: "hmac_sha256", label: "Clave HMAC SHA256", type: "password" },
  ],
};

const cuentaVacia = {
  banco: "",
  tipo_cuenta: "Cuenta Corriente",
  moneda: "PEN",
  titular: "",
  numero_cuenta: "",
  cci: "",
  instrucciones: "",
};

export default function PasarelasPago() {
  const [pasarelas, setPasarelas] = useState([]);
  const [pasarelaSeleccionada, setPasarelaSeleccionada] =
    useState("transferencia");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [cuentas, setCuentas] = useState([]);
  const [cuentaForm, setCuentaForm] = useState({ ...cuentaVacia });
  const [cuentaEditandoId, setCuentaEditandoId] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(true);

  const [formPasarela, setFormPasarela] = useState({});
  const [pasarelaActiva, setPasarelaActiva] = useState(false);
  const [entorno, setEntorno] = useState("produccion");

  const formularioCuentaRef = useRef(null);

  const scrollAlFormulario = () => {
    setTimeout(() => {
      formularioCuentaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const cargarPasarelas = async () => {
    try {
      const data = await listarPasarelasPago();
      setPasarelas(data);

      if (!pasarelaSeleccionada && data.length > 0) {
        setPasarelaSeleccionada(data[0].codigo);
      }
    } catch (error) {
      toast.error(error.message || "Error al cargar pasarelas");
    }
  };

  const cargarDetalle = async (codigo) => {
    try {
      setCargando(true);

      if (codigo === "transferencia") {
        const data = await listarCuentasBancarias();
        setCuentas(data);
      } else {
        const data = await obtenerConfiguracionPasarela(codigo);
        setPasarelaActiva(data?.activa ?? false);
        setEntorno(data?.entorno || "produccion");
        setFormPasarela(data?.credenciales || {});
      }
    } catch (error) {
      toast.error(error.message || "Error al cargar configuración");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const iniciar = async () => {
      setCargando(true);
      await cargarPasarelas();
      setCargando(false);
    };

    iniciar();
  }, []);

  useEffect(() => {
    if (pasarelaSeleccionada) {
      cargarDetalle(pasarelaSeleccionada);
    }
  }, [pasarelaSeleccionada]);

  const pasarelaActual = pasarelas.find(
    (item) => item.codigo === pasarelaSeleccionada
  );

  const actualizarCampoCuenta = (campo, valor) => {
    setCuentaForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFormularioCuenta = () => {
    setCuentaForm({ ...cuentaVacia });
    setCuentaEditandoId(null);
    setCuentaActiva(true);
  };

  const prepararNuevaCuenta = () => {
    limpiarFormularioCuenta();
    scrollAlFormulario();
  };

  const guardarCuenta = async () => {
    try {
      setGuardando(true);

      const payload = {
        activa: cuentaActiva,
        credenciales: cuentaForm,
      };

      if (cuentaEditandoId) {
        await actualizarCuentaBancaria(cuentaEditandoId, payload);
        toast.success("Cuenta bancaria actualizada");
      } else {
        await agregarCuentaBancaria(payload);
        toast.success("Cuenta bancaria agregada");
      }

      limpiarFormularioCuenta();
      await cargarDetalle("transferencia");
      await cargarPasarelas();
    } catch (error) {
      toast.error(error.message || "Error al guardar cuenta bancaria");
    } finally {
      setGuardando(false);
    }
  };

  const editarCuenta = (cuenta) => {
    setCuentaEditandoId(cuenta.id);
    setCuentaActiva(cuenta.activa ?? true);

    setCuentaForm({
      banco: cuenta.credenciales?.banco || "",
      tipo_cuenta: cuenta.credenciales?.tipo_cuenta || "Cuenta Corriente",
      moneda: cuenta.credenciales?.moneda || "PEN",
      titular: cuenta.credenciales?.titular || "",
      numero_cuenta: cuenta.credenciales?.numero_cuenta || "",
      cci: cuenta.credenciales?.cci || "",
      instrucciones: cuenta.credenciales?.instrucciones || "",
    });

    scrollAlFormulario();
  };

  const eliminarCuenta = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar esta cuenta bancaria?"
    );

    if (!confirmar) return;

    try {
      await eliminarCuentaBancaria(id);
      toast.success("Cuenta bancaria eliminada");

      if (cuentaEditandoId === id) {
        limpiarFormularioCuenta();
      }

      await cargarDetalle("transferencia");
      await cargarPasarelas();
    } catch (error) {
      toast.error(error.message || "Error al eliminar cuenta bancaria");
    }
  };

  const actualizarCampoPasarela = (campo, valor) => {
    setFormPasarela((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarPasarela = async () => {
    try {
      setGuardando(true);

      await guardarConfiguracionPasarela(pasarelaSeleccionada, {
        activa: pasarelaActiva,
        entorno,
        credenciales: formPasarela,
      });

      toast.success("Configuración guardada correctamente");
      await cargarPasarelas();
      await cargarDetalle(pasarelaSeleccionada);
    } catch (error) {
      toast.error(error.message || "Error al guardar configuración");
    } finally {
      setGuardando(false);
    }
  };

  const renderBadgeEstado = (activa) => {
    return activa ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-600">
        <CheckCircle size={13} />
        Activa
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
        <AlertCircle size={13} />
        Inactiva
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Pasarelas de pago
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Configura los métodos que aceptarán pagos en tu plataforma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pasarelas.map((pasarela) => {
          const Icon = iconosPasarela[pasarela.codigo] || CreditCard;
          const activa = pasarela.activa;
          const seleccionada = pasarela.codigo === pasarelaSeleccionada;

          return (
            <button
              key={pasarela.codigo}
              onClick={() => setPasarelaSeleccionada(pasarela.codigo)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                seleccionada
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                  : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  seleccionada
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-[var(--color-text)]">
                    {pasarela.nombre}
                  </h3>
                  {renderBadgeEstado(activa)}
                </div>

                <p className="mt-1 line-clamp-2 text-xs text-[var(--color-text-muted)]">
                  {pasarela.descripcion}
                </p>

                {pasarela.codigo === "transferencia" && (
                  <p className="mt-1 text-xs font-medium text-[var(--color-primary)]">
                    {pasarela.cantidadCuentas || 0} cuenta(s) registrada(s)
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        {cargando ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-text-muted)]">
            <Loader2 className="mr-2 animate-spin" size={22} />
            Cargando configuración...
          </div>
        ) : pasarelaSeleccionada === "transferencia" ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  Transferencia bancaria
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Añade cuentas bancarias para que los alumnos puedan realizar
                  depósitos o transferencias.
                </p>
              </div>

              <button
                onClick={prepararNuevaCuenta}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                <Plus size={18} />
                Nueva cuenta
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-[var(--color-text)]">
                Cuentas registradas
              </h3>

              {cuentas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                  Todavía no hay cuentas bancarias registradas.
                </div>
              ) : (
                cuentas.map((cuenta) => {
                  const estaEditando = cuentaEditandoId === cuenta.id;

                  return (
                    <div
                      key={cuenta.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        estaEditando
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                          : "border-[var(--color-border)] bg-[var(--color-background)]"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-[var(--color-text)]">
                              {cuenta.credenciales?.banco ||
                                "Banco sin nombre"}
                            </h4>

                            {renderBadgeEstado(cuenta.activa)}

                            {estaEditando && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                                Editando
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                            {cuenta.credenciales?.tipo_cuenta || "-"} ·{" "}
                            {cuenta.credenciales?.moneda || "-"}
                          </p>

                          <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                            <p>
                              <span className="font-semibold">Titular:</span>{" "}
                              {cuenta.credenciales?.titular || "-"}
                            </p>

                            <p>
                              <span className="font-semibold">Cuenta:</span>{" "}
                              {cuenta.credenciales?.numero_cuenta || "-"}
                            </p>

                            <p className="md:col-span-2">
                              <span className="font-semibold">CCI:</span>{" "}
                              {cuenta.credenciales?.cci || "-"}
                            </p>
                          </div>

                          {cuenta.credenciales?.instrucciones && (
                            <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                              <span className="font-semibold text-[var(--color-text)]">
                                Instrucciones:
                              </span>{" "}
                              {cuenta.credenciales.instrucciones}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editarCuenta(cuenta)}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                              estaEditando
                                ? "border border-blue-200 bg-blue-50 text-blue-700"
                                : "border border-[var(--color-border)] hover:bg-slate-100"
                            }`}
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => eliminarCuenta(cuenta.id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div
              ref={formularioCuentaRef}
              className={`rounded-2xl border p-4 transition-all ${
                cuentaEditandoId
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm"
                  : "border-[var(--color-border)]"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--color-text)]">
                    {cuentaEditandoId
                      ? "Editando cuenta bancaria"
                      : "Agregar cuenta bancaria"}
                  </h3>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {cuentaEditandoId
                      ? "Modifica los datos de la cuenta seleccionada y guarda los cambios."
                      : "Completa los datos para registrar una nueva cuenta bancaria."}
                  </p>
                </div>

                {cuentaEditandoId && (
                  <button
                    onClick={limpiarFormularioCuenta}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
                  >
                    <X size={16} />
                    Cancelar
                  </button>
                )}
              </div>

              {cuentaEditandoId && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Estás editando la cuenta de{" "}
                  <span className="font-semibold">
                    {cuentaForm.banco || "esta cuenta"}
                  </span>
                  .
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Banco
                  </label>
                  <input
                    value={cuentaForm.banco}
                    onChange={(e) =>
                      actualizarCampoCuenta("banco", e.target.value)
                    }
                    placeholder="BCP, Interbank, BBVA..."
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Tipo de cuenta
                  </label>
                  <select
                    value={cuentaForm.tipo_cuenta}
                    onChange={(e) =>
                      actualizarCampoCuenta("tipo_cuenta", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  >
                    <option>Cuenta Corriente</option>
                    <option>Cuenta de Ahorros</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Moneda
                  </label>
                  <select
                    value={cuentaForm.moneda}
                    onChange={(e) =>
                      actualizarCampoCuenta("moneda", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="PEN">PEN — Soles</option>
                    <option value="USD">USD — Dólares</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Titular
                  </label>
                  <input
                    value={cuentaForm.titular}
                    onChange={(e) =>
                      actualizarCampoCuenta("titular", e.target.value)
                    }
                    placeholder="CONIT SAC"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Número de cuenta
                  </label>
                  <input
                    value={cuentaForm.numero_cuenta}
                    onChange={(e) =>
                      actualizarCampoCuenta("numero_cuenta", e.target.value)
                    }
                    placeholder="194-1234567-0-89"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    CCI
                  </label>
                  <input
                    value={cuentaForm.cci}
                    onChange={(e) =>
                      actualizarCampoCuenta("cci", e.target.value)
                    }
                    placeholder="002-194-001234567089-12"
                    className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    Instrucciones para el alumno
                  </label>
                  <textarea
                    value={cuentaForm.instrucciones}
                    onChange={(e) =>
                      actualizarCampoCuenta("instrucciones", e.target.value)
                    }
                    rows={4}
                    placeholder="Realiza tu depósito o transferencia y sube el comprobante."
                    className="mt-1 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text)]">
                  <input
                    type="checkbox"
                    checked={cuentaActiva}
                    onChange={(e) => setCuentaActiva(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Cuenta activa
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                {cuentaEditandoId && (
                  <button
                    onClick={limpiarFormularioCuenta}
                    className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold hover:bg-slate-100"
                  >
                    Cancelar edición
                  </button>
                )}

                <button
                  onClick={guardarCuenta}
                  disabled={guardando}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
                >
                  {guardando ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}

                  {cuentaEditandoId ? "Actualizar cuenta" : "Guardar cuenta"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">
                  {pasarelaActual?.nombre}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {pasarelaActual?.descripcion}
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text)]">
                Habilitada
                <input
                  type="checkbox"
                  checked={pasarelaActiva}
                  onChange={(e) => setPasarelaActiva(e.target.checked)}
                  className="h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[var(--color-text)]">
                  Entorno
                </label>
                <select
                  value={entorno}
                  onChange={(e) => setEntorno(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="produccion">Producción</option>
                  <option value="pruebas">Pruebas</option>
                  <option value="sandbox">Sandbox</option>
                </select>
              </div>

              {(camposPorPasarela[pasarelaSeleccionada] || []).map((campo) => (
                <div
                  key={campo.name}
                  className={campo.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <label className="text-sm font-semibold text-[var(--color-text)]">
                    {campo.label}
                  </label>

                  {campo.type === "textarea" ? (
                    <textarea
                      value={formPasarela[campo.name] || ""}
                      onChange={(e) =>
                        actualizarCampoPasarela(campo.name, e.target.value)
                      }
                      rows={4}
                      className="mt-1 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  ) : (
                    <input
                      type={campo.type}
                      value={formPasarela[campo.name] || ""}
                      onChange={(e) =>
                        actualizarCampoPasarela(campo.name, e.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={guardarPasarela}
                disabled={guardando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {guardando ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Guardar configuración
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}