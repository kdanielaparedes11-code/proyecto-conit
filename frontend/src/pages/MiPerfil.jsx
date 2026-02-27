import { useState, useEffect } from "react"
import axios from "axios"

export default function MiPerfil() {

  const [foto, setFoto] = useState(null)

  const [editando, setEditando] = useState(false)

  const [setNombre] = useState("")

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const [nombreBloqueado, setNombreBloqueado] = useState(false)

  const [datos, setDatos] = useState({
    nombre: "",
    apellido: "",
    lugar: "",
    departamento: "",
    provincia: "",
    distrito: "",
    direccion: "",
    estadoCivil: "",
    correo: "",
    telefono: ""
  })

  const guardarCambios = async () => {
    try {

      const partes = nombre.split(" ")

      const nombreBackend = partes[0]
      const apellidoBackend = partes.slice(1).join(" ")

      await axios.put("http://localhost:3000/alumno/1", {
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        direccion: datos.direccion,
        correo: datos.email,
        tipodocumento: "DNI",
        numdocumento: "12345678"
      })

      alert("Actualizado correctamente")

    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || "Error")
    }
  }

  useEffect(() => {
    const obtenerAlumno = async () => {
      try {
        const res = await axios.get("http://localhost:3000/alumno/1")
        const data = res.data

        //setNombre(`${data.nombre} ${data.apellido}`)

        setDatos({
          nombre: data.nombre,
          apellido: data.apellido,
          lugar: "",
          departamento: "",
          provincia: "",
          distrito: "",
          direccion: data.direccion || "",
          estadoCivil: "",
          correo: data.correo || "",
          telefono: data.telefono || ""
        })

      } catch (error) {
        console.error(error)
      } finally {
        setCargando(false)
      }
    }

    obtenerAlumno()
  }, [])

  const handleChange = async (e) => {
  const file = e.target.files[0];

  const formData = new FormData();
  formData.append('file', file);
  formData.append('usuario_id', usuario.id);

  await fetch('http://localhost:3000/multimedia/upload', {
    method: 'POST',
    body: formData,
  });
};


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

  const toggleEditar = () => {
  if (editando) {
    setEditando(false)

    if (!nombreBloqueado) {
      setNombreBloqueado(true)
    }

    alert("Datos guardados correctamente")
  } else {
    setEditando(true)
  }
}

const toggleEditarGuardar = async () => {

  // Si está cargando, no hacer nada
  if (cargando) return

  // Si NO está editando → activar edición
  if (!editando) {
    setEditando(true)
    return
  }

  // Validación básica
  if (!datos.correo || !datos.telefono) {
    alert("Completa los campos obligatorios")
    return
  }

  try {
    setGuardando(true)

    await axios.put("http://localhost:3000/alumno/1", {
      nombre: datos.nombre,
      apellido: datos.apellido,
      telefono: datos.telefono,
      direccion: datos.direccion,
      correo: datos.correo
    })

    setEditando(false)

    alert("Actualizado correctamente")

  } catch (error) {
    console.error(error)
    alert("Error al actualizar")
  } finally {
    setGuardando(false)
  }
}

if (cargando) {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse text-xl text-gray-500">
        Cargando perfil...
      </div>
    </div>
  )
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
              <input type="file" onChange={handleChange} />
            </label>
          </div>
        </div>

        {/* NOMBRE */}
        <div className="absolute bottom-6 w-full flex justify-center items-center text-white text-lg font-semibold tracking-wide">

          {editando && !nombreBloqueado ? (
            <>
              <input
                value={datos.nombre}
                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                className="text-center bg-white text-black px-2 py-1 rounded mr-2"
              />

              <input
                value={datos.apellido}
                onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                className="text-center bg-white text-black px-2 py-1 rounded"
              />
            </>
          ) : (
            <>
              <span>{datos.nombre}</span>
              <span className="ml-2">{datos.apellido}</span>
            </>
          )}

          {nombreBloqueado && (
            <p className="text-xs text-red-300 absolute top-full mt-1">
              El nombre solo puede modificarse una vez
            </p>
          )}

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
              <Input
                label="Lugar Residencia"
                value={datos.lugar}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, lugar: e.target.value })}
              />
              <Input
                label="Departamento"
                value={datos.departamento}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, departamento: e.target.value })}
              />
              <Input
                label="Provincia"
                value={datos.provincia}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, provincia: e.target.value })}
              />
              <Input
                label="Distrito"
                value={datos.distrito}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, distrito: e.target.value })}
              />
              <Input
                label="Dirección"
                value={datos.direccion}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, direccion: e.target.value })}
              />
              <Input
                label="Estado Civil"
                value={datos.estadoCivil}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, estadoCivil: e.target.value })}
              />
              <Input
                label="Correo"
                value={datos.correo}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
              />
              <Input
                label="Teléfono"
                value={datos.telefono}
                editando={editando}
                onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
              />
            </div>

          </div>
          <button
            onClick={toggleEditarGuardar}
            disabled={cargando || guardando}
            className={`px-4 py-2 rounded text-white transition ${
              cargando || guardando
                ? "bg-gray-400 cursor-not-allowed"
                : editando
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {cargando
              ? "Cargando..."
              : guardando
              ? "Guardando..."
              : editando
              ? "Guardar"
              : "Editar"}
          </button>

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

  function Input({ label, value, editando, onChange }) {
    return (
      <div>
        <label className="block text-gray-500 mb-1">{label}</label>
        <input
          type="text"
          value={value}
          disabled={!editando}
          onChange={onChange}
          className={`w-full border rounded px-3 py-2 ${
            editando ? "border-blue-400" : "border-gray-200 bg-gray-100"
          }`}
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

