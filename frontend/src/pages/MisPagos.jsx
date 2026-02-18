import { useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import PagoModal from "../components/PagosModal";

export default function MisPagos() {

  const [activeTab, setActiveTab] = useState("pendientes");
  const [selectedPago, setSelectedPago] = useState(null);

  const [pagosPendientes, setPagosPendientes] = useState([
    { id: 1, descripcion: "Matrícula 2026-I", curso: "Base de Datos", monto: 350 },
    { id: 2, descripcion: "Curso Extra", curso: "Desarrollo Web", monto: 200 }
  ]);

  const [pagosRealizados, setPagosRealizados] = useState([
    { 
      id: 3, 
      fecha: "10/02/2026", 
      descripcion: "Matrícula 2025-II", 
      curso: "Programación I", 
      monto: 300,
      codigo: "BOL-2025-0001"
    }
  ]);

  const generarCodigoBoleta = () => {
    const random = Math.floor(Math.random() * 10000);
    return `BOL-2026-${random}`;
  };

  const confirmarPago = () => {
    const fechaActual = new Date().toLocaleDateString();
    const codigoBoleta = generarCodigoBoleta();

    const nuevoPago = {
      ...selectedPago,
      fecha: fechaActual,
      codigo: codigoBoleta
    };

    setPagosRealizados([...pagosRealizados, nuevoPago]);
    setPagosPendientes(pagosPendientes.filter(p => p.id !== selectedPago.id));
    setSelectedPago(null);

    generarBoleta(nuevoPago);
  };

  const generarBoleta = async (pago) => {
  const doc = new jsPDF();

  const qrData = `
  SISTEMA UNIVERSITARIO
  Código: ${pago.codigo}
  Fecha: ${pago.fecha}
  Curso: ${pago.curso}
  Monto: S/ ${pago.monto}
  Estado: VERIFICADO
  `;

  const qrImage = await QRCode.toDataURL(qrData);

  // Logo
  const logo = "/logo.png";
  doc.addImage(logo, "PNG", 20, 10, 30, 20);

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BOLETA DE PAGO", 105, 30, null, null, "center");

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Línea decorativa
  doc.line(20, 35, 190, 35);

  // Información
  doc.text(`Código de Boleta: ${pago.codigo}`, 20, 50);
  doc.text(`Fecha de Pago: ${pago.fecha}`, 20, 60);
  doc.text(`Curso: ${pago.curso}`, 20, 70);
  doc.text(`Descripción: ${pago.descripcion}`, 20, 80);
  doc.text(`Monto Pagado: S/ ${pago.monto}`, 20, 90);

  // Estado
  doc.setTextColor(0, 128, 0);
  doc.text("Estado: PAGADO - VERIFICADO", 20, 105);
  doc.setTextColor(0, 0, 0);

  // QR
  doc.addImage(qrImage, "PNG", 140, 50, 40, 40);

  // Pie institucional
  doc.setFontSize(10);
  doc.text(
    "Este comprobante ha sido generado automáticamente por el Sistema Universitario.",
    20,
    130
  );

  doc.text(
    "Para validar la autenticidad escanee el código QR.",
    20,
    138
  );

  doc.line(20, 150, 190, 150);

  doc.setFontSize(9);
  doc.text(
    "© 2026 Universidad Virtual - Todos los derechos reservados.",
    105,
    160,
    null,
    null,
    "center"
  );

  doc.save(`Boleta_${pago.codigo}.pdf`);
};

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">Mis Pagos</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("pendientes")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "pendientes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Pagos Pendientes
        </button>

        <button
          onClick={() => setActiveTab("realizados")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "realizados"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Pagos Realizados
        </button>
      </div>

      {/* PAGOS PENDIENTES */}
      {activeTab === "pendientes" && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pagosPendientes.map((pago) => (
                <tr key={pago.id} className="border-t">
                  <td className="p-3">{pago.descripcion}</td>
                  <td className="p-3">{pago.curso}</td>
                  <td className="p-3">S/ {pago.monto}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedPago(pago)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Realizar Pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGOS REALIZADOS */}
      {activeTab === "realizados" && (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Código</th>
                <th className="p-3 text-left">Curso</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Descargar</th>
              </tr>
            </thead>
            <tbody>
              {pagosRealizados.map((pago) => (
                <tr key={pago.id} className="border-t">
                  <td className="p-3">{pago.fecha}</td>
                  <td className="p-3">{pago.codigo}</td>
                  <td className="p-3">{pago.curso}</td>
                  <td className="p-3">S/ {pago.monto}</td>
                  <td className="p-3">
                    <button
                      onClick={() => generarBoleta(pago)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                      Descargar PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPago && (
        <PagoModal
          pago={selectedPago}
          onClose={() => setSelectedPago(null)}
          onConfirm={confirmarPago}
        />
      )}
    </div>
  );
}
