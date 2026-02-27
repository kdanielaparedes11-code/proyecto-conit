function Dashboard() {
  return (
    <div style={{ flex: 1, padding: "40px", background: "#f9fafb" }}>
      <h1>Bienvenido, Estudiante 👋</h1>

      <div style={{
        display: "flex",
        gap: "20px",
        marginTop: "30px"
      }}>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "200px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
        }}>
          <h3>Cursos Activos</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>5</p>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "200px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
        }}>
          <h3>Evaluaciones</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>2</p>
        </div>

        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "200px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)"
        }}>
          <h3>Promedio</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>18.4</p>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
