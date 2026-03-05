function Sidebar() {
  return (
    <div style={{
      width: "220px",
      background: "#1e3a8a",
      color: "white",
      padding: "20px"
    }}>
      <h2>Mi Universidad</h2>
      <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

      <p style={{ marginTop: "20px" }}>📚 Dashboard</p>
      <p>📝 Cursos</p>
      <p>📊 Notas</p>
      <p>⚙️ Configuración</p>
    </div>
  )
}

export default Sidebar
