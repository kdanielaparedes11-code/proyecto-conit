import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth.service";
import {
  getCursosDocente,
  getHorarioDocente,
  getPerfilDocente,
  updatePerfilDocente,
  getHistorialDocente,
  getGradosInstruccion,
  getDocumentosDocente,
  getCursosAdicionalesDocente,
  deleteCursoAdicionalDocente,
  createCursoAdicionalDocente,
} from "../services/docenteService";

const parseRangeToMinutes = (range) => {
  if (!range) return { startMinutes: 0, endMinutes: 0 };
  const [ini, fin] = range.split("-").map((s) => s.trim());
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return { startMinutes: toMin(ini), endMinutes: toMin(fin) };
};

const minutesNow = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

const dayLabelToday = () => {
  const map = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return map[new Date().getDay()];
};

const splitNombreCompleto = (full) => {
  const clean = String(full ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return { nombre: "", apellido: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { nombre: parts[0], apellido: "" };
  return { nombre: parts[0], apellido: parts.slice(1).join(" ") };
};

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return "";
  const hoy = new Date();
  const fn = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fn.getFullYear();
  const m = hoy.getMonth() - fn.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fn.getDate())) edad--;
  return edad >= 0 ? edad : "";
};

const pct = (value) => `${Math.max(0, Math.min(100, value))}%`;

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}

function ChevronIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function PerfilDocente() {
  const navigate = useNavigate();

  const [estado, setEstado] = useState("Activo");
  const [estadoMotivo, setEstadoMotivo] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [bio, setBio] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [gradoInstruccionId, setGradoInstruccionId] = useState("");
  const [gradosInstruccion, setGradosInstruccion] = useState([]);
  const [aniosExperiencia, setAniosExperiencia] = useState("");
  const [sectorExperiencia, setSectorExperiencia] = useState("");
  const [tiempoEstudiosInicio, setTiempoEstudiosInicio] = useState("");
  const [tiempoEstudiosFin, setTiempoEstudiosFin] = useState("");
  const [institucionEgreso, setInstitucionEgreso] = useState("");
  const [contactoEmergenciaNombre, setContactoEmergenciaNombre] = useState("");
  const [contactoEmergenciaTelefono, setContactoEmergenciaTelefono] = useState("");
  const [perfilProfesional, setPerfilProfesional] = useState("");

  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");

  const NAME_LOCK_KEY = "docente_nombre_completo_locked_v1";
  const [nombreBloqueado, setNombreBloqueado] = useState(() => localStorage.getItem(NAME_LOCK_KEY) === "true");

  const [fotoUrl, setFotoUrl] = useState("");
  const inputFotoRef = useRef(null);

  const [documentos, setDocumentos] = useState([]);
  const [cursosExtra, setCursosExtra] = useState([]);
  const [mostrarFormCursoExtra, setMostrarFormCursoExtra] = useState(false);
  const [nuevoCursoNombre, setNuevoCursoNombre] = useState("");
  const [nuevoCursoInstitucion, setNuevoCursoInstitucion] = useState("");
  const [nuevoCursoFechaInicio, setNuevoCursoFechaInicio] = useState("");
  const [nuevoCursoFechaFin, setNuevoCursoFechaFin] = useState("");
  const [nuevoCursoArchivo, setNuevoCursoArchivo] = useState(null);
  const [guardandoCursoExtra, setGuardandoCursoExtra] = useState(false);

  const [cursos, setCursos] = useState([]);
  const [horario, setHorario] = useState([]);
  const [alumnosTotal, setAlumnosTotal] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    progreso: false,
    personales: true,
    profesional: false,
    documentos: false,
    cursos: false,
    seguridad: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const confirmarNombre = () => {
    if (!nombreCompleto.trim()) return alert("Ingresa tu nombre completo antes de confirmar.");
    localStorage.setItem(NAME_LOCK_KEY, "true");
    setNombreBloqueado(true);
    alert("Nombre confirmado. Ya no podrás editarlo nuevamente.");
  };

  const onElegirFoto = () => inputFotoRef.current?.click();

  const onFotoSeleccionada = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFotoUrl(url);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const perfil = await getPerfilDocente();
        if (!perfil) {
          alert("No hay sesión. Inicia sesión nuevamente.");
          return;
        }

        setEstado(perfil.estado ?? "Activo");
        setEstadoMotivo((perfil.estado_motivo ?? "").trim());
        setNombreCompleto(`${perfil.nombre ?? ""} ${perfil.apellido ?? ""}`.trim());
        setCorreo(perfil.correo ?? "");
        setTelefono(perfil.telefono !== null && perfil.telefono !== undefined ? String(perfil.telefono) : "");
        setDireccion(perfil.direccion ?? "");
        setTitulo(perfil.titulo ?? "");
        setExperiencia(perfil.experiencia ?? "");
        setBio(perfil.bio ?? "");
        setFechaNacimiento(perfil.fecha_nacimiento ?? "");
        setGradoInstruccionId(perfil.grado_instruccion_id !== null && perfil.grado_instruccion_id !== undefined ? String(perfil.grado_instruccion_id) : "");
        setAniosExperiencia(perfil.anios_experiencia !== null && perfil.anios_experiencia !== undefined ? String(perfil.anios_experiencia) : "");
        setSectorExperiencia(perfil.sector_experiencia ?? "");
        setTiempoEstudiosInicio(perfil.tiempo_estudios_inicio ?? "");
        setTiempoEstudiosFin(perfil.tiempo_estudios_fin ?? "");
        setInstitucionEgreso(perfil.institucion_egreso ?? "");
        setContactoEmergenciaNombre(perfil.contacto_emergencia_nombre ?? "");
        setContactoEmergenciaTelefono(perfil.contacto_emergencia_telefono ?? "");
        setPerfilProfesional(perfil.perfil_profesional ?? perfil.bio ?? "");
        setFotoUrl(perfil.foto_url ?? "");

        const [c, h, grados, docs, cursosExtraData] = await Promise.all([
          getCursosDocente(),
          getHorarioDocente(),
          getGradosInstruccion(),
          getDocumentosDocente(),
          getCursosAdicionalesDocente(),
        ]);

        setCursos(c || []);
        setHorario(h || []);
        setGradosInstruccion(grados || []);
        setDocumentos(docs || []);
        setCursosExtra(cursosExtraData || []);
        setAlumnosTotal(0);

        const hist = await getHistorialDocente(perfil.id);
        setHistorial((hist || []).map((row) => ({
          id: row.id,
          tipo: row.tipo,
          desde: row.fecha_inicio,
          hasta: row.fecha_fin,
          detalle: row.detalle || row.descripcion,
          institucion: row.institucion,
          cargo: row.cargo,
          area: row.area,
          sector: row.sector,
        })));
      } catch (e) {
        console.error(e);
        alert(e?.message || "Error cargando perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cursosActivos = cursos.length;

  const proximaClase = useMemo(() => {
    if (!horario?.length) return null;
    const hoy = dayLabelToday();
    const now = minutesNow();

    const clasesHoy = horario
      .filter((h) => h.dia === hoy)
      .slice()
      .sort((a, b) => parseRangeToMinutes(a.hora).startMinutes - parseRangeToMinutes(b.hora).startMinutes);

    const futuras = clasesHoy.filter((c) => parseRangeToMinutes(c.hora).endMinutes > now);
    return futuras.length ? futuras[0] : null;
  }, [horario]);

  const perfilCompletado = useMemo(() => {
    const checks = [
      nombreCompleto,
      correo,
      telefono,
      direccion,
      titulo,
      fechaNacimiento,
      gradoInstruccionId,
      aniosExperiencia,
      sectorExperiencia,
      institucionEgreso,
      contactoEmergenciaNombre,
      contactoEmergenciaTelefono,
      perfilProfesional,
      fotoUrl,
    ];
    const llenos = checks.filter((v) => String(v ?? "").trim()).length;
    return Math.round((llenos / checks.length) * 100);
  }, [
    nombreCompleto,
    correo,
    telefono,
    direccion,
    titulo,
    fechaNacimiento,
    gradoInstruccionId,
    aniosExperiencia,
    sectorExperiencia,
    institucionEgreso,
    contactoEmergenciaNombre,
    contactoEmergenciaTelefono,
    perfilProfesional,
    fotoUrl,
  ]);

  const guardarCambios = async () => {
    try {
      if (passNueva || passConfirm || passActual) {
        if (!passActual) return alert("Ingresa tu contraseña actual.");
        if (passNueva.length < 6) return alert("La nueva contraseña debe tener al menos 6 caracteres.");
        if (passNueva !== passConfirm) return alert("La confirmación no coincide.");
        alert("La contraseña aún no está conectada. Por ahora solo se guarda el perfil.");
      }

      if (aniosExperiencia && !/^\d+$/.test(aniosExperiencia)) {
        return alert("Los años de experiencia solo deben contener números.");
      }
      if (contactoEmergenciaTelefono && !/^\d+$/.test(contactoEmergenciaTelefono)) {
        return alert("El teléfono de contacto de emergencia solo debe contener números.");
      }

      const { nombre, apellido } = splitNombreCompleto(nombreCompleto);

      await updatePerfilDocente({
        estado,
        nombre,
        apellido,
        correo,
        telefono: telefono ? Number(telefono) : null,
        direccion,
        titulo: titulo ?? null,
        experiencia: experiencia ?? null,
        bio: bio ?? null,
        foto_url: fotoUrl || null,
        fecha_nacimiento: fechaNacimiento || null,
        grado_instruccion_id: gradoInstruccionId ? Number(gradoInstruccionId) : null,
        anios_experiencia: aniosExperiencia ? Number(aniosExperiencia) : null,
        sector_experiencia: sectorExperiencia || null,
        tiempo_estudios_inicio: tiempoEstudiosInicio || null,
        tiempo_estudios_fin: tiempoEstudiosFin || null,
        institucion_egreso: institucionEgreso || null,
        contacto_emergencia_nombre: contactoEmergenciaNombre || null,
        contacto_emergencia_telefono: contactoEmergenciaTelefono || null,
        perfil_profesional: perfilProfesional || null,
      });

      alert("Cambios guardados ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error guardando cambios");
    }
  };

  const eliminarCursoExtra = async (id) => {
    try {
      await deleteCursoAdicionalDocente(id);
      setCursosExtra((prev) => prev.filter((c) => c.id !== id));
      alert("Curso eliminado correctamente ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo eliminar el curso");
    }
  };

  const agregarCursoExtraLocal = async () => {
    try {
      if (!nuevoCursoNombre.trim()) return alert("Ingresa el nombre del curso o capacitación.");
      setGuardandoCursoExtra(true);

      const nuevoCurso = await createCursoAdicionalDocente({
        nombre: nuevoCursoNombre.trim(),
        institucion: nuevoCursoInstitucion.trim(),
        fecha_inicio: nuevoCursoFechaInicio || null,
        fecha_fin: nuevoCursoFechaFin || null,
        archivo: nuevoCursoArchivo || null,
      });

      setCursosExtra((prev) => [nuevoCurso, ...prev]);
      setNuevoCursoNombre("");
      setNuevoCursoInstitucion("");
      setNuevoCursoFechaInicio("");
      setNuevoCursoFechaFin("");
      setNuevoCursoArchivo(null);
      setMostrarFormCursoExtra(false);
      alert("Curso guardado en Supabase ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "No se pudo guardar el curso");
    } finally {
      setGuardandoCursoExtra(false);
    }
  };

  const badgeClass =
    estado === "Activo"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : "bg-rose-100 text-rose-700 border border-rose-200";

  const documentosCombinados = [
    ...documentos,
    ...cursosExtra
      .filter((c) => c.archivo_url)
      .map((c) => ({
        id: `curso-${c.id}`,
        nombre: c.nombre,
        tipo: "Curso / capacitación",
        archivo_url: c.archivo_url,
      })),
  ];

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-xl">
        <div className="absolute right-5 top-5 z-20">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
          >
            <ExitIcon />
            Cerrar sesión
          </button>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_32%)]" />

        <div className="relative z-10 flex flex-col gap-6 px-6 py-8 md:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative h-28 w-28 shrink-0 rounded-full border-4 border-white/70 bg-white/10 shadow-lg overflow-hidden">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold">
                  {nombreCompleto?.charAt(0)?.toUpperCase() || "D"}
                </div>
              )}

              <button
                type="button"
                onClick={onElegirFoto}
                className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-slate-700 shadow-md transition hover:scale-105 hover:bg-slate-50"
                title="Cambiar foto"
              >
                <PencilIcon />
              </button>

              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFotoSeleccionada}
              />
            </div>

            <div>
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                {estado}
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">{nombreCompleto || "Docente"}</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-200">
                {titulo || "Completa tu información profesional para que el perfil docente se vea más sólido y confiable."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200/90">
                {correo && <span className="rounded-full bg-white/10 px-3 py-1">{correo}</span>}
                {telefono && <span className="rounded-full bg-white/10 px-3 py-1">{telefono}</span>}
                {calcularEdad(fechaNacimiento) && (
                  <span className="rounded-full bg-white/10 px-3 py-1">{calcularEdad(fechaNacimiento)} años</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[360px]">
            <MiniStat label="Cursos activos" value={cursosActivos} />
            <MiniStat label="Alumnos" value={alumnosTotal} />
            <MiniStat label="Próxima clase" value={proximaClase ? proximaClase.hora : "--"} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Navegación</p>
            <div className="mt-4 space-y-2">
              <NavBtn text="Nivel de perfil" onClick={() => toggleSection("progreso")} />
              <NavBtn text="Datos personales" onClick={() => toggleSection("personales")} />
              <NavBtn text="Información profesional" onClick={() => toggleSection("profesional")} />
              <NavBtn text="Documentos e historial" onClick={() => toggleSection("documentos")} />
              <NavBtn text="Cursos y capacitaciones" onClick={() => toggleSection("cursos")} />
              <NavBtn text="Seguridad" onClick={() => toggleSection("seguridad")} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Próxima clase</p>
            {proximaClase ? (
              <div className="mt-3 space-y-2">
                <div className="text-base font-semibold text-slate-800">{proximaClase.curso}</div>
                <div className="text-sm text-slate-600">{proximaClase.dia} · {proximaClase.hora}</div>
                <div className="text-sm text-slate-500">Grupo {proximaClase.grupo} · {proximaClase.modalidad}</div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No hay clases programadas para hoy.</p>
            )}
          </div>
        </aside>

        <div className="space-y-4">
          <AccordionCard
            title={perfilCompletado === 100 ? "Perfil completo" : "Nivel de perfil completado"}
            subtitle={perfilCompletado === 100 ? "Tu perfil ya está completo. Puedes desplegar para ver el progreso." : "Completa los campos principales para mejorar tu presentación docente."}
            open={openSections.progreso}
            onToggle={() => toggleSection("progreso")}
            rightNode={
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${perfilCompletado === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {perfilCompletado === 100 ? "Completo" : `${perfilCompletado}%`}
              </span>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Avance del perfil</span>
                <span className="font-semibold text-slate-800">{perfilCompletado}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: pct(perfilCompletado) }} />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Datos personales"
            subtitle="Información básica y de contacto"
            open={openSections.personales}
            onToggle={() => toggleSection("personales")}
          >
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Nombre completo</label>
                <input
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  disabled={nombreBloqueado}
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${nombreBloqueado ? "bg-slate-100 text-slate-500" : "bg-white"}`}
                />
                {!nombreBloqueado && (
                  <button
                    type="button"
                    onClick={confirmarNombre}
                    className="mt-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Confirmar nombre (solo una vez)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Correo" value={correo} onChange={setCorreo} />
                <Field label="Teléfono" value={telefono} onChange={(v) => setTelefono(v.replace(/\D/g, ""))} />
                <Field label="Fecha de nacimiento" type="date" value={fechaNacimiento} onChange={setFechaNacimiento} />
                <Field label="Edad" value={calcularEdad(fechaNacimiento)} disabled />
              </div>

              <Field label="Dirección" value={direccion} onChange={setDireccion} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Contacto de emergencia" value={contactoEmergenciaNombre} onChange={setContactoEmergenciaNombre} placeholder="Nombre del contacto" />
                <Field label="Teléfono de emergencia" value={contactoEmergenciaTelefono} onChange={(v) => setContactoEmergenciaTelefono(v.replace(/\D/g, ""))} placeholder="Solo números" />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Información profesional"
            subtitle="Formación, experiencia y presentación del docente"
            open={openSections.profesional}
            onToggle={() => toggleSection("profesional")}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Título" value={titulo} onChange={setTitulo} />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Grado de instrucción</label>
                  <select
                    value={gradoInstruccionId}
                    onChange={(e) => setGradoInstruccionId(e.target.value)}
                    className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                  >
                    <option value="">Seleccione</option>
                    {gradosInstruccion.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </div>

                <Field label="Años de experiencia" value={aniosExperiencia} onChange={(v) => setAniosExperiencia(v.replace(/\D/g, ""))} placeholder="Solo números" />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Sector de experiencia</label>
                  <select
                    value={sectorExperiencia}
                    onChange={(e) => setSectorExperiencia(e.target.value)}
                    className="w-full rounded-xl border bg-white px-4 py-3 outline-none transition focus:border-indigo-400"
                  >
                    <option value="">Seleccione</option>
                    <option value="Educación">Educación</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Salud">Salud</option>
                    <option value="Administración">Administración</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                <Field label="Inicio de estudios" type="date" value={tiempoEstudiosInicio} onChange={setTiempoEstudiosInicio} />
                <Field label="Fin de estudios" type="date" value={tiempoEstudiosFin} onChange={setTiempoEstudiosFin} />
              </div>

              <Field label="Institución de egreso" value={institucionEgreso} onChange={setInstitucionEgreso} />
              <Field label="Experiencia resumida" value={experiencia} onChange={setExperiencia} />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Perfil profesional</label>
                <textarea
                  value={perfilProfesional}
                  onChange={(e) => setPerfilProfesional(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400"
                />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Documentos e historial"
            subtitle="Archivos y experiencia registrada"
            open={openSections.documentos}
            onToggle={() => toggleSection("documentos")}
          >
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Documentos de experiencia laboral</h4>
                {documentosCombinados.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay documentos registrados.</p>
                ) : (
                  <div className="space-y-3">
                    {documentosCombinados.map((doc) => (
                      <div key={doc.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-medium text-slate-800">{doc.nombre}</div>
                          <div className="text-sm text-slate-500">{doc.tipo || "Documento PDF"}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a href={doc.archivo_url} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">Ver PDF</a>
                          <a href={doc.archivo_url} download className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Descargar</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 text-sm font-semibold text-slate-700">Historial</h4>
                {historial.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay historial registrado.</p>
                ) : (
                  <div className="space-y-4">
                    {historial.map((h) => (
                      <div key={h.id} className="relative rounded-2xl border border-slate-200 p-4 pl-6">
                        <span className="absolute left-3 top-6 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                        <div className="font-semibold text-slate-800">{h.tipo || "Registro"}</div>
                        {(h.institucion || h.cargo) && (
                          <div className="mt-1 text-sm text-slate-700">{[h.cargo, h.institucion].filter(Boolean).join(" - ")}</div>
                        )}
                        <div className="mt-1 text-xs text-slate-500">{h.desde || "--"} {h.hasta ? `a ${h.hasta}` : ""}</div>
                        {(h.area || h.sector) && <div className="mt-1 text-xs text-slate-500">{[h.area, h.sector].filter(Boolean).join(" • ")}</div>}
                        {h.detalle && <div className="mt-2 text-sm text-slate-600">{h.detalle}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Cursos y capacitaciones"
            subtitle="Agrega certificados y cursos complementarios"
            open={openSections.cursos}
            onToggle={() => toggleSection("cursos")}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-500">Permite eliminar si se añadió por error.</p>
                <button
                  type="button"
                  onClick={() => setMostrarFormCursoExtra((prev) => !prev)}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  {mostrarFormCursoExtra ? "Cerrar formulario" : "+ Agregar curso"}
                </button>
              </div>

              {mostrarFormCursoExtra && (
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nombre del curso o capacitación" value={nuevoCursoNombre} onChange={setNuevoCursoNombre} placeholder="Ej. Diplomado en IA" />
                    <Field label="Institución" value={nuevoCursoInstitucion} onChange={setNuevoCursoInstitucion} placeholder="Ej. Universidad / Instituto" />
                    <Field label="Fecha inicio" type="date" value={nuevoCursoFechaInicio} onChange={setNuevoCursoFechaInicio} />
                    <Field label="Fecha fin" type="date" value={nuevoCursoFechaFin} onChange={setNuevoCursoFechaFin} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Certificado o constancia (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setNuevoCursoArchivo(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border bg-white px-4 py-3"
                    />
                    {nuevoCursoArchivo && <p className="mt-2 text-xs text-slate-500">Archivo seleccionado: {nuevoCursoArchivo.name}</p>}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormCursoExtra(false);
                        setNuevoCursoNombre("");
                        setNuevoCursoInstitucion("");
                        setNuevoCursoFechaInicio("");
                        setNuevoCursoFechaFin("");
                        setNuevoCursoArchivo(null);
                      }}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={agregarCursoExtraLocal}
                      disabled={guardandoCursoExtra}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {guardandoCursoExtra ? "Guardando..." : "Guardar curso"}
                    </button>
                  </div>
                </div>
              )}

              {cursosExtra.length === 0 ? (
                <p className="text-sm text-slate-500">No hay cursos adicionales registrados.</p>
              ) : (
                <div className="space-y-3">
                  {cursosExtra.map((curso) => (
                    <div key={curso.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{curso.nombre}</div>
                        <div className="text-sm text-slate-500">{curso.institucion || "Sin institución"}</div>
                        {(curso.fecha_inicio || curso.fecha_fin) && (
                          <div className="mt-1 text-xs text-slate-500">{curso.fecha_inicio || "--"} {curso.fecha_fin ? `a ${curso.fecha_fin}` : ""}</div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {curso.archivo_url && (
                          <a href={curso.archivo_url} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
                            Ver PDF
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarCursoExtra(curso.id)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionCard>

          <AccordionCard
            title="Seguridad"
            subtitle="Actualiza tu contraseña"
            open={openSections.seguridad}
            onToggle={() => toggleSection("seguridad")}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Contraseña actual" type="password" value={passActual} onChange={setPassActual} />
              <Field label="Nueva contraseña" type="password" value={passNueva} onChange={setPassNueva} />
              <Field label="Confirmar contraseña" type="password" value={passConfirm} onChange={setPassConfirm} />
            </div>
          </AccordionCard>

          <div className="sticky bottom-4 flex justify-end">
            <button
              onClick={guardarCambios}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-200/80">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function NavBtn({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {text}
    </button>
  );
}

function AccordionCard({ title, subtitle, open, onToggle, children, rightNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          {rightNode}
          <ChevronIcon open={open} />
        </div>
      </button>
      {open && <div className="border-t border-slate-100 px-5 py-5">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:border-indigo-400 ${disabled ? "bg-slate-100 text-slate-500" : "bg-white"}`}
      />
    </div>
  );
}

export default PerfilDocente;
