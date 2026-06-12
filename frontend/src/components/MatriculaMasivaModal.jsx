import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { X, Download, Upload, Loader2, CheckCircle } from "lucide-react";
import {
  previsualizarMatriculaMasiva,
  confirmarMatriculaMasiva,
} from "../services/matricula.service";

export default function MatriculaMasivaModal({ grupo, onClose, onSuccess }) {
  const [archivoNombre, setArchivoNombre] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isConfirmando, setIsConfirmando] = useState(false);

  const hayErrores = preview?.errores > 0;
  const puedeConfirmar = preview?.matriculables > 0 && !hayErrores;

  const resumen = useMemo(() => {
    if (!preview) return [];

    return [
      { label: "Total", value: preview.total },
      { label: "Nuevos", value: preview.validos },
      { label: "Existentes", value: preview.existentes },
      { label: "Ya matriculados", value: preview.yaMatriculados },
      { label: "Errores", value: preview.errores },
    ];
  }, [preview]);

  const descargarPlantilla = () => {
    const data = [
      {
        dni: "12345678",
        nombres: "Juan Carlos",
        apellidos: "Pérez López",
        correo: "juan@gmail.com",
        metodo_pago: "YAPE",
        monto_pagado: 150,
        numero_operacion: "987654",
        fecha_pago: "2026-06-06",
        observacion_pago: "Pago matrícula junio",
        celular: "987654321",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: [
        "dni",
        "nombres",
        "apellidos",
        "correo",
        "metodo_pago",
        "monto_pagado",
        "numero_operacion",
        "fecha_pago",
        "observacion_pago",
        "celular",
      ],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Matriculas");

    XLSX.writeFile(
      workbook,
      `plantilla_matricula_masiva_${grupo?.nombregrupo || "grupo"}.xlsx`
    );
  };

  const normalizarFila = (fila) => ({
    dni:
      fila.dni ||
      fila.DNI ||
      fila["DNI/ID"] ||
      fila.documento ||
      fila.numdocumento ||
      "",

    nombres:
      fila.nombres ||
      fila.Nombres ||
      fila.nombre ||
      fila.Nombre ||
      "",

    apellidos:
      fila.apellidos ||
      fila.Apellidos ||
      fila.apellido ||
      fila.Apellido ||
      "",

    correo:
      fila.correo ||
      fila.Correo ||
      fila.email ||
      fila.Email ||
      "",

    metodo_pago:
      fila.metodo_pago ||
      fila["metodo pago"] ||
      fila["Método de pago"] ||
      fila.tipopago ||
      "",

    monto_pagado:
      fila.monto_pagado ||
      fila["monto pagado"] ||
      fila.monto ||
      "",

    numero_operacion:
      fila.numero_operacion ||
      fila["numero operacion"] ||
      fila["número operación"] ||
      fila.codigo_aprobacion ||
      "",

    fecha_pago:
      fila.fecha_pago ||
      fila["fecha pago"] ||
      "",

    observacion_pago:
      fila.observacion_pago ||
      fila["observacion pago"] ||
      "",

    celular:
      fila.celular ||
      fila.telefono ||
      "",
  });

  const leerExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArchivoNombre(file.name);
    setPreview(null);
    setAlumnos([]);

    try {
      setIsLoadingPreview(true);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      const alumnosExcel = rows
        .map(normalizarFila)
        .filter((item) =>
          Object.values(item).some((value) => String(value || "").trim() !== "")
        );

      if (alumnosExcel.length === 0) {
        toast.error("El Excel no tiene alumnos para validar");
        return;
      }

      setAlumnos(alumnosExcel);

      const data = await previsualizarMatriculaMasiva(grupo.id, alumnosExcel);
      setPreview(data);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "No se pudo leer o validar el Excel"
      );
    } finally {
      setIsLoadingPreview(false);
      event.target.value = "";
    }
  };

  const confirmar = async () => {
    if (!puedeConfirmar) return;

    const ok = window.confirm(
      `Se matricularán ${preview.matriculables} alumno(s) en ${grupo.nombregrupo}. ¿Deseas continuar?`
    );

    if (!ok) return;

    try {
      setIsConfirmando(true);
      const data = await confirmarMatriculaMasiva(grupo.id, alumnos);

      toast.success(data.message || "Matrícula masiva procesada");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "No se pudo confirmar la matrícula masiva"
      );
    } finally {
      setIsConfirmando(false);
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case "ERROR":
        return "bg-red-100 text-red-700 border-red-200";
      case "YA_MATRICULADO":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "EXISTE":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
        <div
          className="px-7 py-5 text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-sidenav), var(--color-primary))",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Matrícula masiva</h2>
              <p className="mt-1 text-sm text-white/75">
                Grupo: <b>{grupo?.nombregrupo}</b>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--color-background)] p-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={descargarPlantilla}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-4 text-sm font-bold text-[var(--color-text)] transition hover:border-[var(--color-primary)]"
            >
              <Download size={18} />
              Descargar plantilla Excel
            </button>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--color-button-primary)] px-5 py-4 text-sm font-bold text-[var(--color-button-primary-text)] transition hover:brightness-95">
              <Upload size={18} />
              Subir Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={leerExcel}
                className="hidden"
              />
            </label>
          </div>

          {archivoNombre && (
            <p className="mt-4 text-sm font-semibold text-[var(--color-muted-text)]">
              Archivo seleccionado: {archivoNombre}
            </p>
          )}

          {isLoadingPreview && (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 text-sm font-semibold text-[var(--color-muted-text)]">
              <Loader2 className="animate-spin text-[var(--color-primary)]" />
              Validando Excel...
            </div>
          )}

          {preview && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                {resumen.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center"
                  >
                    <p className="text-xl font-black text-[var(--color-text)]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[var(--color-muted-text)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]">
                <div className="max-h-[360px] overflow-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="sticky top-0 bg-[var(--color-background)] text-xs uppercase text-[var(--color-muted-text)]">
                      <tr>
                        <th className="px-4 py-3">Fila</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">DNI</th>
                        <th className="px-4 py-3">Nombres</th>
                        <th className="px-4 py-3">Apellidos</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3">Observación</th>
                        <th className="px-4 py-3">Método Pago</th>
                        <th className="px-4 py-3">Monto</th>
                        <th className="px-4 py-3">N° Operación</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border)]">
                      {preview.filas.map((fila) => (
                        <tr key={fila.fila}>
                          <td className="px-4 py-3 font-semibold">
                            {fila.fila}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-black ${getEstadoClass(
                                fila.estado
                              )}`}
                            >
                              {fila.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3">{fila.dni}</td>
                          <td className="px-4 py-3">{fila.nombres}</td>
                          <td className="px-4 py-3">{fila.apellidos}</td>
                          <td className="px-4 py-3">{fila.correo}</td>
                          <td className="px-4 py-3">
                            {fila.metodo_pago || "-"}
                          </td>

                          <td className="px-4 py-3">
                            {fila.monto_pagado || "-"}
                          </td>

                          <td className="px-4 py-3">
                            {fila.numero_operacion || "-"}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-muted-text)]">
                            {fila.observacion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {hayErrores && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  Corrige los errores del Excel y vuelve a subirlo antes de
                  confirmar.
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] bg-[var(--color-card)] px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirmando}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmar}
            disabled={!puedeConfirmar || isConfirmando}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-button-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-button-primary-text)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConfirmando ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirmar matrícula
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}