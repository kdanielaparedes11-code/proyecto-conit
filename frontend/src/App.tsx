function App() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard Estudiante</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ background: "#eee", padding: "20px" }}>
          Cursos Activos: 5
        </div>

        <div style={{ background: "#eee", padding: "20px" }}>
          Evaluaciones: 2
        </div>

        <div style={{ background: "#eee", padding: "20px" }}>
          Promedio: 18.4
        </div>
      </div>
    </div>
  );
}

export default App;
