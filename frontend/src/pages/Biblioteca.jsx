import { initialData } from "../data/bibliotecaData"

import { useState, useMemo } from "react"
import { Search, Star, Grid, List, Download, Eye } from "lucide-react"
import { motion } from "framer-motion"

export default function Biblioteca() {

  const [archivos, setArchivos] = useState(initialData)
  const [busqueda, setBusqueda] = useState("")
  const [vista, setVista] = useState("grid")
  const [soloFav, setSoloFav] = useState(false)

  // FILTRADO
  const filtrados = useMemo(() => {
    return archivos.filter(a => {
      const coincideBusqueda = a.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase())

      const coincideFav = soloFav ? a.favorito : true

      return coincideBusqueda && coincideFav
    })
  }, [busqueda, soloFav, archivos])

  const toggleFavorito = (id) => {
    setArchivos(prev =>
      prev.map(a =>
        a.id === id ? { ...a, favorito: !a.favorito } : a
      )
    )
  }

  return (
    <div className="h-full flex flex-col gap-8 bg-gray-50 p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Centro de Recursos
        </h1>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition">
          + Nuevo recurso
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4 items-center">

        <div className="relative">
          <Search size={16} className="absolute top-3 left-3 text-gray-400" />
          <input
            placeholder="Buscar recurso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setSoloFav(!soloFav)}
          className={`px-3 py-2 rounded-xl border text-sm flex items-center gap-2 transition
            ${soloFav ? "bg-yellow-100 border-yellow-300 text-yellow-700" : "bg-white border-gray-200 text-gray-600"}
          `}
        >
          <Star size={16} />
          Favoritos
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setVista("grid")}
            className={`p-2 rounded-lg ${vista === "grid" ? "bg-white shadow" : "text-gray-400"}`}
          >
            <Grid size={18} />
          </button>

          <button
            onClick={() => setVista("list")}
            className={`p-2 rounded-lg ${vista === "list" ? "bg-white shadow" : "text-gray-400"}`}
          >
            <List size={18} />
          </button>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard titulo="Recursos" valor={archivos.length} />
        <StatCard titulo="Descargas" valor={archivos.reduce((acc,a)=>acc+a.descargas,0)} />
        <StatCard titulo="Favoritos" valor={archivos.filter(a=>a.favorito).length} />
        <StatCard titulo="Este mes" valor="12" />
      </div>

      {/* CONTENIDO */}
      {vista === "grid" ? (
        <div className="grid grid-cols-4 gap-6">
          {filtrados.map(a => (
            <ResourceCard key={a.id} data={a} toggleFavorito={toggleFavorito} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {filtrados.map(a => (
            <div key={a.id} className="flex justify-between px-6 py-4 hover:bg-gray-50 transition">
              <div>
                <div className="font-medium">{a.titulo}</div>
                <div className="text-sm text-gray-500">{a.curso}</div>
              </div>
              <div className="flex gap-6 items-center text-gray-500">
                <span>{a.tipo.toUpperCase()}</span>
                <span>{a.descargas} desc</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

function StatCard({ titulo, valor }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500">{titulo}</div>
      <div className="text-2xl font-semibold text-gray-800 mt-2">{valor}</div>
    </div>
  )
}

function ResourceCard({ data, toggleFavorito }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-gray-800">{data.titulo}</div>
          <div className="text-sm text-gray-500 mt-1">{data.curso}</div>
        </div>

        <button onClick={() => toggleFavorito(data.id)}>
          <Star
            size={18}
            className={data.favorito ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
          />
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        {data.tipo.toUpperCase()} • {data.tamaño}
      </div>

      <div className="flex gap-4 mt-6 text-gray-500">
        <Eye size={18} className="cursor-pointer hover:text-blue-600" />
        <Download size={18} className="cursor-pointer hover:text-blue-600" />
      </div>
    </motion.div>
  )
}
