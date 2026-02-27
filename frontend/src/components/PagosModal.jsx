import { X } from "lucide-react";

export default function PagoModal({ pago, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          Confirmar Pago
        </h2>

        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Curso:</strong> {pago.curso}</p>
          <p><strong>Monto:</strong> S/ {pago.monto}</p>
        </div>

        <button
          onClick={onConfirm}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
        >
          Confirmar Pago
        </button>
      </div>
    </div>
  );
}
