export default function MisCursos() {
  return (
    <div className="flex gap-8 h-full">

      {/* GRID */}
      <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-200">

        <div className="grid grid-cols-3 gap-6">

          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full mb-4" />
              <p className="text-sm tracking-widest">
                MATEMÁTICA
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-80 flex flex-col gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="font-semibold text-center mb-4">
            2026 — MARCH
          </p>

          <div className="grid grid-cols-7 gap-2 text-sm text-center">
            {[...Array(31)].map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col justify-center text-center">
          <h2 className="text-xl font-bold">VIERNES</h2>
          <p className="text-lg font-semibold mt-2">13/02/2026</p>
          <p className="text-sm mt-6">TUS CURSOS DE HOY</p>
          <p className="font-medium mt-2">Matemática</p>
        </div>

      </div>
    </div>
  )
}
