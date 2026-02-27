import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"


export default function UserMenu() {

  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()


  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>

      <button
        onClick={() => setOpenMenu(!openMenu)}
        className="text-sm text-gray-700 hover:text-gray-900 transition font-medium"
      >
        Karem Daniela Paredes Sandoval
      </button>

      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
          >
            <button
              onClick={() => {
                navigate("/mi-perfil")
                setOpenMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition">
              Mi perfil
            </button>

            <button
              onClick={() => {
                navigate("/mis-pagos")
                setOpenMenu(false)
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition">
              Mis pagos
            </button>


            <div className="border-t my-2"></div>

            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
              Cerrar sesión
            </button>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
