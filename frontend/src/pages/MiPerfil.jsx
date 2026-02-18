import { useState } from "react"

export default function MiPerfil() {

  const [foto, setFoto] = useState(null)

  const cambiarFoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFoto(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HEADER ROJO */}
      <div className="bg-blue-600 text-white px-6 py-3 font-semibold">
        Mis Datos
      </div>

      {/* BANNER */}
      <div className="relative h-64 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL19UTn2zu4iNZDVr7Azm15Xkr1oKGRoV72A&s')"
        }}
      >

        <div className="absolute inset-0 bg-black/40"></div>

        {/* FOTO */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-16">
          <div className="relative">
            <img
              src={foto || "https://via.placeholder.com/120"}
              alt="perfil"
              className="w-28 h-28 rounded-md object-cover border-4 border-white shadow-lg"
            />

            <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer">
              Cambiar
              <input
                type="file"
                accept="image/*"
                onChange={cambiarFoto}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* NOMBRE */}
        <div className="absolute bottom-6 w-full text-center text-white text-lg font-semibold tracking-wide">
          PAREDES SANDOVAL KAREM DANIELA
        </div>

      </div>

      {/* CONTENIDO */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-6">

        {/* DATOS PERSONALES */}
        <div className="md:col-span-2 bg-white rounded shadow">

          <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
            Datos Personales
          </div>

          <div className="p-6 space-y-4 text-sm">

            <div className="grid grid-cols-2 gap-4">
              <Input label="Lugar Residencia" value="Perú" />
              <Input label="Departamento" value="Cajamarca" />
              <Input label="Provincia" value="Cajamarca" />
              <Input label="Distrito" value="Cajamarca" />
              <Input label="Dirección" value="Jr. Alfonso Ugarte 559" />
              <Input label="Estado Civil" value="Soltero" />
              <Input label="Email principal" value="correo@email.com" />
              <Input label="Teléfono" value="999999999" />
            </div>

          </div>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* PROGRESO */}
            <div className="bg-white rounded shadow p-6 text-center">

                <p className="text-sm text-gray-500 mb-4">
                    TU PERFIL ESTÁ AL:
                </p>

                <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-4">

                    <div className="w-full h-full rounded-full border-8 border-blue-600 flex items-center justify-center text-xl md:text-2xl font-bold text-red-600">
                    90%
                    </div>

                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition">
                    Actualizar Perfil
                </button>

            </div>


          {/* INFO ADICIONAL */}
          <div className="bg-white rounded shadow p-6 text-sm space-y-3">

            <p className="font-semibold text-gray-600">
              INF. ALUMNO
            </p>

            <Info label="Doc. Identidad" value="73986719" />
            <Info label="Fecha Nac" value="11/04/1997" />
            <Info label="Sexo" value="Femenino" />
            <Info label="Nacionalidad" value="Perú" />

          </div>

        </div>

      </div>

    </div>
  )
}

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full border border-gray-200 rounded px-3 py-2"
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
