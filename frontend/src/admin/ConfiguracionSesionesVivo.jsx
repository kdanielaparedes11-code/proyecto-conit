import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  Video,
  X,
  XCircle,
} from "lucide-react";

import {
  getMeetingProviderConfigsByEmpresa,
  crearMeetingProviderConfig,
  actualizarMeetingProviderConfig,
  marcarMeetingProviderPredeterminado,
  eliminarMeetingProviderConfig,
  getConfiguracionSesionesVivo,
  actualizarConfiguracionSesionesVivo,
} from "../services/docenteService";

const EMPRESA_ID_DEFAULT = 1;

const PROVIDERS = [
  {
    value: "google",
    label: "Google Meet",
    description: "Crea reuniones usando Google Calendar y Google Meet.",
  },
  {
    value: "zoom",
    label: "Zoom",
    description: "Crea reuniones usando Zoom Server-to-Server OAuth.",
  },
  {
    value: "teams",
    label: "Microsoft Teams",
    description: "Configuración preparada para Microsoft Teams.",
  },
];

const MODOS_SELECCION_PROVEEDOR = [
  {
    value: "SOLO_PREDETERMINADO",
    label: "Usar siempre el proveedor predeterminado",
    description:
      "Los docentes no podrán elegir proveedor. Toda sesión usará el proveedor marcado como predeterminado.",
  },
  {
    value: "DOCENTE_PUEDE_ELEGIR",
    label: "Permitir que el docente elija",
    description:
      "El docente podrá elegir entre los proveedores activos al crear una sesión.",
  },
  {
    value: "ADMIN_PUEDE_ELEGIR",
    label: "Solo el administrador puede elegir",
    description:
      "El docente usará el predeterminado, pero el administrador podrá elegir proveedor.",
  },
  {
    value: "TODOS_PUEDEN_ELEGIR",
    label: "Administrador y docente pueden elegir",
    description:
      "Tanto administradores como docentes podrán elegir entre proveedores activos.",
  },
];

const initialForm = {
  id: null,
  idempresa: EMPRESA_ID_DEFAULT,
  provider: "google",
  nombre: "",
  activo: true,
  predeterminado: false,
  authType: "oauth",
  credentials: {
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    redirectUri: "",
    accountId: "",
    userIdOrEmail: "",
    tenantId: "",
    organizerUserId: "",
  },
  settings: {
    calendarId: "primary",
    waitingRoom: true,
  },
};

function getProviderLabel(provider) {
  return PROVIDERS.find((item) => item.value === provider)?.label || provider;
}

function cloneInitialForm() {
  return JSON.parse(JSON.stringify(initialForm));
}

function buildEmptyForm(provider = "google") {
  const base = cloneInitialForm();
  base.provider = provider;

  if (provider === "google") {
    base.authType = "oauth";
    base.settings.calendarId = "primary";
  }

  if (provider === "zoom") {
    base.authType = "server_to_server";
    base.settings.waitingRoom = true;
  }

  if (provider === "teams") {
    base.authType = "client_credentials";
  }

  return base;
}

export default function ConfiguracionSesionesVivo() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [form, setForm] = useState(buildEmptyForm("google"));

  const isEditing = !!form.id;

  const providerInfo = useMemo(
    () => PROVIDERS.find((item) => item.value === form.provider),
    [form.provider]
  );

  const [configGeneral, setConfigGeneral] = useState(null);
  const [modoSeleccionProveedor, setModoSeleccionProveedor] = useState(
    "SOLO_PREDETERMINADO"
  );
  const [savingConfigGeneral, setSavingConfigGeneral] = useState(false);

  const cargarConfiguraciones = async () => {
    try {
      setLoading(true);
      const data = await getMeetingProviderConfigsByEmpresa(EMPRESA_ID_DEFAULT);
      setConfigs(data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudieron cargar las configuraciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguraciones();
    cargarConfiguracionGeneral();
  }, []);

  const cargarConfiguracionGeneral = async () => {
    try {
        const data = await getConfiguracionSesionesVivo(EMPRESA_ID_DEFAULT);

        setConfigGeneral(data);
        setModoSeleccionProveedor(
        data?.modoSeleccionProveedor || "SOLO_PREDETERMINADO"
        );
    } catch (error) {
        console.error(error);
        toast.error(
        error.message || "No se pudo cargar la regla de sesiones en vivo."
        );
    }
  };

  const abrirNuevo = () => {
    setForm(buildEmptyForm("google"));
    setFormMode("create");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const abrirEditar = (config) => {
    setForm({
      id: config.id,
      idempresa: config.idempresa || EMPRESA_ID_DEFAULT,
      provider: config.provider || "google",
      nombre: config.nombre || "",
      activo: config.activo ?? true,
      predeterminado: config.predeterminado ?? false,
      authType: config.authType || "oauth",
      credentials: {
        clientId: "",
        clientSecret: "",
        refreshToken: "",
        redirectUri: "",
        accountId: "",
        userIdOrEmail: "",
        tenantId: "",
        organizerUserId: "",
      },
      settings: {
        calendarId: config.settings?.calendarId || "primary",
        waitingRoom: config.settings?.waitingRoom ?? true,
      },
    });

    setFormMode("edit");
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setFormMode("create");
    setForm(buildEmptyForm("google"));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProviderChange = (provider) => {
    setForm((prev) => {
      const nuevo = buildEmptyForm(provider);

      return {
        ...nuevo,
        id: prev.id,
        idempresa: prev.idempresa,
        nombre: prev.nombre,
        activo: prev.activo,
        predeterminado: prev.predeterminado,
      };
    });
  };

  const handleCredentialChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value,
      },
    }));
  };

  const handleSettingChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const limpiarCredencialesVacias = (credentials) => {
    const limpio = {};

    Object.entries(credentials || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        limpio[key] = String(value).trim();
      }
    });

    return limpio;
  };

  const buildPayload = () => {
    const credentials = limpiarCredencialesVacias(form.credentials);

    const payload = {
      provider: form.provider,
      nombre: form.nombre.trim(),
      activo: Boolean(form.activo),
      predeterminado: Boolean(form.predeterminado),
      authType: form.authType || null,
      settings: form.settings || {},
    };

    // Solo al crear se manda idempresa. En edición, el DTO update no lo acepta.
    if (!isEditing) {
      payload.idempresa = Number(form.idempresa || EMPRESA_ID_DEFAULT);
    }

    // En edición, las credenciales solo se reemplazan si el admin escribió nuevas.
    if (!isEditing || Object.keys(credentials).length > 0) {
      payload.credentials = credentials;
    }

    return payload;
  };

  const validarForm = () => {
    if (!form.nombre.trim()) {
      toast.error("Ingresa un nombre para la configuración.");
      return false;
    }

    if (!form.provider) {
      toast.error("Selecciona un proveedor.");
      return false;
    }

    const credentials = limpiarCredencialesVacias(form.credentials);

    if (!isEditing && Object.keys(credentials).length === 0) {
      toast.error("Ingresa las credenciales del proveedor.");
      return false;
    }

    return true;
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!validarForm()) return;

    try {
      setSaving(true);

      const payload = buildPayload();

      if (isEditing) {
        await actualizarMeetingProviderConfig(form.id, payload);
        toast.success("Configuración actualizada.");
      } else {
        await crearMeetingProviderConfig(payload);
        toast.success("Configuración creada.");
      }

      cerrarForm();
      await cargarConfiguraciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const marcarPredeterminado = async (config) => {
    try {
      await marcarMeetingProviderPredeterminado(config.id);
      toast.success("Proveedor marcado como predeterminado.");
      await cargarConfiguraciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo marcar como predeterminado.");
    }
  };

  const toggleActivo = async (config) => {
    try {
      await actualizarMeetingProviderConfig(config.id, {
        activo: !config.activo,
      });

      toast.success(config.activo ? "Proveedor desactivado." : "Proveedor activado.");
      await cargarConfiguraciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo actualizar el estado.");
    }
  };

  const guardarConfiguracionGeneral = async () => {
    try {
        setSavingConfigGeneral(true);

        const data = await actualizarConfiguracionSesionesVivo(
        EMPRESA_ID_DEFAULT,
        {
            modoSeleccionProveedor,
        }
        );

        setConfigGeneral(data);
        toast.success("Reglas de sesiones en vivo actualizadas.");
    } catch (error) {
        console.error(error);
        toast.error(
        error.message || "No se pudo actualizar la regla de sesiones en vivo."
        );
    } finally {
        setSavingConfigGeneral(false);
    }
    };

  const eliminar = async (config) => {
    const ok = window.confirm(
      `¿Eliminar la configuración "${config.nombre}"? Esta acción no eliminará las sesiones ya creadas.`
    );

    if (!ok) return;

    try {
      await eliminarMeetingProviderConfig(config.id);
      toast.success("Configuración eliminada.");
      await cargarConfiguraciones();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "No se pudo eliminar la configuración.");
    }
  };

  const renderCredentialFields = () => {
    if (form.provider === "google") {
      return (
        <>
          <Input
            label="Google Client ID"
            value={form.credentials.clientId}
            onChange={(v) => handleCredentialChange("clientId", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client ID"}
          />

          <Input
            label="Google Client Secret"
            type="password"
            value={form.credentials.clientSecret}
            onChange={(v) => handleCredentialChange("clientSecret", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client Secret"}
          />

          <Input
            label="Refresh Token"
            type="password"
            value={form.credentials.refreshToken}
            onChange={(v) => handleCredentialChange("refreshToken", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Refresh token"}
          />

          <Input
            label="Redirect URI"
            value={form.credentials.redirectUri}
            onChange={(v) => handleCredentialChange("redirectUri", v)}
            placeholder="Opcional, si tu backend lo usa"
          />

          <Input
            label="Calendar ID"
            value={form.settings.calendarId}
            onChange={(v) => handleSettingChange("calendarId", v)}
            placeholder="primary"
          />
        </>
      );
    }

    if (form.provider === "zoom") {
      return (
        <>
          <Input
            label="Zoom Account ID"
            value={form.credentials.accountId}
            onChange={(v) => handleCredentialChange("accountId", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Account ID"}
          />

          <Input
            label="Zoom Client ID"
            value={form.credentials.clientId}
            onChange={(v) => handleCredentialChange("clientId", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client ID"}
          />

          <Input
            label="Zoom Client Secret"
            type="password"
            value={form.credentials.clientSecret}
            onChange={(v) => handleCredentialChange("clientSecret", v)}
            placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client Secret"}
          />

          <Input
            label="Usuario / correo organizador"
            value={form.credentials.userIdOrEmail}
            onChange={(v) => handleCredentialChange("userIdOrEmail", v)}
            placeholder="correo@empresa.com"
          />

          <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(form.settings.waitingRoom)}
              onChange={(e) => handleSettingChange("waitingRoom", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-[var(--color-text)]">
              Activar sala de espera
            </span>
          </label>
        </>
      );
    }

    return (
      <>
        <Input
          label="Tenant ID"
          value={form.credentials.tenantId}
          onChange={(v) => handleCredentialChange("tenantId", v)}
          placeholder={isEditing ? "Dejar vacío para no cambiar" : "Tenant ID"}
        />

        <Input
          label="Client ID"
          value={form.credentials.clientId}
          onChange={(v) => handleCredentialChange("clientId", v)}
          placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client ID"}
        />

        <Input
          label="Client Secret"
          type="password"
          value={form.credentials.clientSecret}
          onChange={(v) => handleCredentialChange("clientSecret", v)}
          placeholder={isEditing ? "Dejar vacío para no cambiar" : "Client Secret"}
        />

        <Input
          label="Organizer User ID / correo"
          value={form.credentials.organizerUserId}
          onChange={(v) => handleCredentialChange("organizerUserId", v)}
          placeholder="usuario organizador"
        />

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Teams queda listo a nivel de configuración. Para crear reuniones de
          Teams todavía debe existir el servicio proveedor en backend.
        </div>
      </>
    );
  };

  const renderFormularioProveedor = (inline = false) => (
    <section
      className={
        inline
          ? "mt-5 rounded-2xl border border-blue-200 bg-blue-50/40 p-5"
          : "rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm"
      }
    >
      <form onSubmit={guardar} className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {isEditing ? "Editar proveedor seleccionado" : "Nuevo proveedor"}
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              {isEditing
                ? "Estás editando este proveedor. Las credenciales reales no se muestran; si dejas los campos vacíos, se conservarán las actuales."
                : "Las credenciales se guardarán cifradas en la base de datos."}
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarForm}
            className="rounded-xl border border-[var(--color-border)] bg-white p-2 text-[var(--color-muted)] hover:bg-[var(--color-background)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Nombre de configuración"
            value={form.nombre}
            onChange={(v) => handleChange("nombre", v)}
            placeholder="Ej: Google Meet institucional"
          />

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
              Proveedor
            </label>
            <select
              value={form.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Tipo de autenticación"
            value={form.authType}
            onChange={(v) => handleChange("authType", v)}
            placeholder="oauth, server_to_server, client_credentials"
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.activo)}
                onChange={(e) => handleChange("activo", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-[var(--color-text)]">
                Activo
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
              <input
                type="checkbox"
                checked={Boolean(form.predeterminado)}
                onChange={(e) => handleChange("predeterminado", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-[var(--color-text)]">
                Predeterminado
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-[var(--color-card)] p-2 text-[var(--color-primary)]">
              <KeyRound size={18} />
            </div>

            <div>
              <h3 className="font-bold text-[var(--color-text)]">
                Credenciales de {providerInfo?.label}
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                {providerInfo?.description}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {renderCredentialFields()}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={cerrarForm}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-background)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isEditing ? "Guardar cambios" : "Guardar configuración"}
          </button>
        </div>
      </form>
    </section>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
                <Video size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Configuración sesiones en vivo
                </h1>
                <p className="text-sm text-[var(--color-muted)]">
                  Configura Google Meet, Zoom o Teams y define el proveedor
                  predeterminado para crear sesiones.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={abrirNuevo}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            <Plus size={18} />
            Agregar proveedor
          </button>
        </div>
      </section>

       <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Reglas de creación de sesiones
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              Define si los docentes podrán elegir proveedor o si siempre se usará el
              proveedor predeterminado.
            </p>
          </div>

          <button
            onClick={guardarConfiguracionGeneral}
            disabled={savingConfigGeneral}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingConfigGeneral ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Guardar reglas
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {MODOS_SELECCION_PROVEEDOR.map((modo) => (
            <label
              key={modo.value}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                modoSeleccionProveedor === modo.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-background)] hover:bg-[var(--color-card)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="modoSeleccionProveedor"
                  value={modo.value}
                  checked={modoSeleccionProveedor === modo.value}
                  onChange={(e) => setModoSeleccionProveedor(e.target.value)}
                  className="mt-1 h-4 w-4"
                />

                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {modo.label}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {modo.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {configGeneral && (
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Configuración actual guardada:{" "}
            <span className="font-semibold">
              {configGeneral.modoSeleccionProveedor}
            </span>
          </p>
        )}
      </section>

      {showForm && formMode === "create" && renderFormularioProveedor()}

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Proveedores configurados
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              El proveedor predeterminado se usará al crear una sesión si no se
              selecciona uno específico.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-[var(--color-muted)]">
            <Loader2 size={26} className="mr-3 animate-spin" />
            Cargando configuraciones...
          </div>
        ) : configs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-background)] p-8 text-center">
            <p className="font-semibold text-[var(--color-text)]">
              Todavía no hay proveedores configurados.
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Agrega Google Meet, Zoom o Teams para comenzar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {configs.map((config) => (
              <article
                key={config.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-card)] text-[var(--color-primary)] shadow-sm">
                      <Video size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[var(--color-text)]">
                          {config.nombre}
                        </h3>

                        {config.predeterminado && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">
                            <Star size={13} />
                            Predeterminado
                          </span>
                        )}

                        {config.activo ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={13} />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                            <XCircle size={13} />
                            Inactivo
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {getProviderLabel(config.provider)} · {config.authType || "Sin authType"}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Credenciales:{" "}
                        {config.tieneCredenciales
                          ? "Guardadas de forma cifrada"
                          : "No registradas"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!config.predeterminado && (
                      <button
                        onClick={() => marcarPredeterminado(config)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-card)]"
                      >
                        <Star size={16} />
                        Predeterminar
                      </button>
                    )}

                    <button
                      onClick={() => toggleActivo(config)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-card)]"
                    >
                      {config.activo ? "Desactivar" : "Activar"}
                    </button>

                    <button
                      onClick={() => abrirEditar(config)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-card)]"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    <button
                      onClick={() => eliminar(config)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>

                {showForm &&
                  formMode === "edit" &&
                  Number(form.id) === Number(config.id) &&
                  renderFormularioProveedor(true)}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[var(--color-text)]">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
      />
    </div>
  );
}
