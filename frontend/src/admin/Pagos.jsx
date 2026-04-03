import { useState, useEffect, useMemo } from "react";
import { obtenerPagos, obtenerPensiones } from "../services/pago.service";
import toast from "react-hot-toast";
import {
  Search,
  FileText,
  FileSpreadsheet,
  FileDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

export default function Pagos() {
  const [activeTab, setActiveTab] = useState("pagos");
  const [busqueda, setBusqueda] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [historialPagos, setHistorialPagos] = useState([]);
  const [alumnosDeuda, setAlumnosDeuda] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarDatosFinancieros = async () => {
    try {
      setIsLoading(true);
      const [dataPagos, dataPensiones] = await Promise.all([
        obtenerPagos(),
        obtenerPensiones(),
      ]);

      // Mapear Pagos
      const pagosFormateados = dataPagos.map((p) => ({
        id: p.id,
        fecha: p.fechapago?.split("T")[0] || "Sin fecha",
        alumno:
          p.matricula?.alumno?.nombre ||
          p.matricula?.usuario?.nombre ||
          "Alumno Desconocido",
        curso: p.matricula?.curso?.nombrecurso || "Curso Desconocido",
        comprobante: p.tipopago || "N/A",
        total: parseFloat(p.preciofinal) || 0,
        estado: p.estado || "Pagado",
      }));

      // Mapear Deudas (Pensiones Pendientes)
      const hoy = new Date();
      const deudasFormateadas = dataPensiones
        .filter((p) => p.estado === "PENDIENTE")
        .map((d) => {
          const fechaVencimiento = new Date(d.fecha_vencimiento);
          const diasAtraso = Math.max(
            0,
            Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24)),
          );

          return {
            id: d.id,
            alumno:
              d.matricula?.alumno?.nombre ||
              d.matricula?.usuario?.nombre ||
              "Alumno Desconocido",
            curso: d.matricula?.curso?.nombrecurso || "Curso Desconocido",
            cuota: d.numero_cuota,
            vencimiento: d.fecha_vencimiento?.split("T")[0] || "Sin fecha",
            monto: parseFloat(d.monto) || 0,
            diasAtraso,
          };
        });

      setHistorialPagos(pagosFormateados);
      setAlumnosDeuda(deudasFormateadas);
    } catch (error) {
      toast.error("Error al cargar los datos financieros");
      console.error("Error al cargar finanzas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosFinancieros();
  }, []);

  // Lógica de Filtrado
  const pagosFiltrados = useMemo(() => {
    return historialPagos.filter((pago) => {
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        pago.alumno.toLowerCase().includes(termino) ||
        pago.curso.toLowerCase().includes(termino);

      const coincideInicio = dateRange.start
        ? new Date(pago.fecha) >= new Date(dateRange.start)
        : true;
      const coincideFin = dateRange.end
        ? new Date(pago.fecha) <= new Date(dateRange.end)
        : true;

      return coincideBusqueda && coincideInicio && coincideFin;
    });
  }, [historialPagos, busqueda, dateRange]);

  // Funciones de Exportación
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Ingresos", 14, 20);
    const columnas = ["ID", "Fecha", "Alumno", "Curso", "Tipo", "Total (S/)"];
    const filas = pagosFiltrados.map((p) => [
      p.id,
      p.fecha,
      p.alumno,
      p.curso,
      p.comprobante,
      p.total.toFixed(2),
    ]);
    doc.autoTable({
      startY: 30,
      head: [columnas],
      body: filas,
      headStyles: { fillColor: [52, 76, 146] },
    });
    doc.save("reporte_pagos.pdf");
    toast.success("PDF generado exitosamente");
  };

  const exportarExcel = () => {
    const datos = [
      ["ID", "FECHA", "ALUMNO", "CURSO", "COMPROBANTE", "TOTAL"],
      ...pagosFiltrados.map((p) => [
        p.id,
        p.fecha,
        p.alumno,
        p.curso,
        p.comprobante,
        p.total,
      ]),
    ];
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    const rango = XLSX.utils.decode_range(hoja["!ref"]);
    for (let c = rango.s.c; c <= rango.e.c; ++c) {
      const celda = XLSX.utils.encode_cell({ r: 0, c });
      if (hoja[celda]) {
        hoja[celda].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "344C92" } },
        };
      }
    }
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Pagos");
    XLSX.writeFile(libro, "reporte_pagos.xlsx");
    toast.success("Excel generado exitosamente");
  };

  const exportarCSV = () => {
    const cabeceras = "ID,Fecha,Alumno,Curso,Comprobante,Total\n";
    const filas = pagosFiltrados
      .map(
        (p) =>
          `${p.id},${p.fecha},"${p.alumno}","${p.curso}",${p.comprobante},${p.total}`,
      )
      .join("\n");
    const enlace = document.createElement("a");
    enlace.href = "data:text/csv;charset=utf-8," + encodeURI(cabeceras + filas);
    enlace.download = "reporte_pagos.csv";
    enlace.click();
    toast.success("CSV descargado exitosamente");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* Banner Principal */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 rounded-xl flex items-center justify-between px-8 text-white shadow">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CreditCard size={28} /> Gestión de Pagos
          </h2>
          <p className="text-sm opacity-90 mt-2">
            Administra el historial de ingresos y haz seguimiento a la
            morosidad.
          </p>
        </div>

        {/* Botones de Exportación ubicados en el Banner */}
        {activeTab === "pagos" && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium opacity-90">Exportar:</span>
            <button
              onClick={exportarCSV}
              className="bg-white text-gray-700 hover:bg-gray-100 p-2.5 rounded-lg transition-colors shadow-sm tooltip"
              title="Exportar CSV"
            >
              <FileDown size={20} />
            </button>
            <button
              onClick={exportarExcel}
              className="bg-white text-green-600 hover:bg-gray-100 p-2.5 rounded-lg transition-colors shadow-sm tooltip"
              title="Exportar Excel"
            >
              <FileSpreadsheet size={20} />
            </button>
            <button
              onClick={exportarPDF}
              className="bg-white text-red-600 hover:bg-gray-100 p-2.5 rounded-lg transition-colors shadow-sm tooltip"
              title="Exportar PDF"
            >
              <FileText size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Pestañas Integradas al Estilo del Card */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("pagos")}
            className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-colors ${
              activeTab === "pagos"
                ? "border-b-2 border-indigo-600 text-indigo-700 bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckCircle size={18} />
            Historial de Pagos
          </button>
          <button
            onClick={() => setActiveTab("deudas")}
            className={`flex items-center gap-2 px-8 py-4 text-sm font-semibold transition-colors ${
              activeTab === "deudas"
                ? "border-b-2 border-red-600 text-red-600 bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertCircle size={18} />
            Alumnos Morosos
          </button>
        </div>

        <div className="p-6">
          {/* BUSCADOR Y FILTROS */}
          {activeTab === "pagos" && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="relative w-full md:max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por alumno o curso..."
                  className="pl-10 border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Calendar className="text-gray-400" size={20} />
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                />
                <span className="text-gray-500 font-medium">-</span>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b">
                {activeTab === "pagos" ? (
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Curso</th>
                    <th className="px-6 py-4 text-center">Comprobante</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 text-center">Estado</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">Alumno</th>
                    <th className="px-6 py-4">Curso</th>
                    <th className="px-6 py-4 text-center">N° Cuota</th>
                    <th className="px-6 py-4">Vencimiento</th>
                    <th className="px-6 py-4 text-right">Deuda</th>
                    <th className="px-6 py-4 text-center">Atraso</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      Cargando registros financieros...
                    </td>
                  </tr>
                ) : activeTab === "pagos" ? (
                  pagosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500 font-medium"
                      >
                        No se encontraron pagos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    pagosFiltrados.map((pago) => (
                      <tr
                        key={pago.id}
                        className="hover:shadow-sm transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {pago.fecha}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">
                          {pago.alumno}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {pago.curso}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-center">
                          {pago.comprobante}
                        </td>
                        <td className="px-6 py-4 font-bold text-indigo-600 text-right">
                          S/ {pago.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700">
                            {pago.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )
                ) : alumnosDeuda.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500 font-medium"
                    >
                      ¡Excelente! No hay alumnos con pagos atrasados.
                    </td>
                  </tr>
                ) : (
                  alumnosDeuda.map((deuda) => (
                    <tr
                      key={deuda.id}
                      className="hover:shadow-sm transition-colors bg-red-50/30"
                    >
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {deuda.alumno}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deuda.curso}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                        Cuota {deuda.cuota}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deuda.vencimiento}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600 text-right">
                        S/ {deuda.monto.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700">
                          {deuda.diasAtraso} días
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
