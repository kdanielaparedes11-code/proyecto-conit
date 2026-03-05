import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CursoDetalle() {
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const navigate = useNavigate();
  const [unidadActiva, setUnidadActiva] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:3000/curso/${id}`)
      .then(res => setCurso(res.data))
      .catch(err => console.error(err));
  }, [id]);

  useEffect(() => {
  if (curso?.temario?.unidades?.length > 0) {
    setUnidadActiva(curso.temario.unidades[0]);
  }
}, [curso]);

  if (!curso) return <p>Cargando...</p>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      {/* Card principal */}
      <div style={cardStyle}>
        
        {/* Título */}
        <div style={titleStyle}>
           {curso.descripcion?.toUpperCase()}
        </div>

        {/* Docente */}
        <div style={teacherBox}>
          <strong>
            {curso.grupos?.[0]?.docente?.nombre}{" "}
            {curso.grupos?.[0]?.docente?.apellido}
          </strong>
          <br />
          <strong>
            {curso.grupos?.[0]?.docente?.correo}
          </strong>
        </div>

        {/* Tabs */}
        <div style={tabsContainer}>
          <button style={!unidadActiva ? tabActive : tab}
            onClick={() => setUnidadActiva(null)}>
            Contenidos
          </button>

          {curso.temario?.unidades?.map((unidad) => (
            <button
              key={unidad.id}
              style={unidadActiva?.id === unidad.id ? tabActive : tab}
              onClick={() => setUnidadActiva(unidad)}
            >
              Unidad {unidad.id}
            </button>
          ))}
        </div>

        {/* Unidad */}
        <div style={unidadBox}>
          {/* === VISTA CONTENIDOS (TODO EL CURSO) === */}
          {!unidadActiva && (
            <>
              <h2>
                {curso.temario?.titulomodulo} : {curso.temario?.detallelecciones}
              </h2>
              {curso.temario?.unidades?.map((unidad) => (
                <div key={unidad.id} style={{ marginBottom: "20px" }}>
                  <h3>
                    {unidad.descripcion} : {unidad.nombreunidad}
                  </h3>
                  <ul style={{ lineHeight: "1.8" }}>
                    {unidad.sesion && (
                      <li>{unidad.sesion.nombresesion}</li>
                    )}
                  </ul>
                </div>
              ))}
            </>
          )}

          {/* === VISTA UNIDAD ESPECÍFICA === */}
          {unidadActiva && (
            <>
              <h3>
                {unidadActiva.descripcion} : {unidadActiva.nombreunidad}
              </h3>
              <ul style={{ lineHeight: "1.8" }}>
                {unidadActiva.sesion && (
                  <li>{unidadActiva.sesion.nombresesion}</li>
                )}
              </ul>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

const containerStyle = {
  padding: "30px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const backButton = {
  alignSelf: "flex-start",
  marginBottom: "20px",
  backgroundColor: "#1e73be",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "500",
};

const cardStyle = {
  width: "100%",
  maxWidth: "950px",
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const titleStyle = {
  backgroundColor: "#e10600",
  color: "white",
  padding: "15px 20px",
  fontSize: "20px",
  fontWeight: "bold",
  display: "inline-block",
  borderRadius: "4px",
  marginBottom: "20px",
};

const teacherBox = {
  backgroundColor: "#f1f1f1",
  padding: "12px 15px",
  borderRadius: "6px",
  marginBottom: "25px",
  width: "300px",
};

const tabsContainer = {
  display: "flex",
  gap: "10px",
  marginBottom: "25px",
};

const tab = {
  padding: "8px 16px",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  cursor: "pointer",
};

const tabActive = {
  ...tab,
  backgroundColor: "#e10600",
  color: "white",
  border: "none",
};

const unidadBox = {
  backgroundColor: "#fafafa",
  padding: "20px",
  borderLeft: "5px solid #e10600",
  borderRadius: "6px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

