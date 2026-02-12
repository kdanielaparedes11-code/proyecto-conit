import { useEffect, useState } from "react";

function App() {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/status")
      .then(res => res.json())
      .then(data => setMensaje(data.mensaje));
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <h1 className="text-3xl text-green-400 font-bold">
        {mensaje}
      </h1>
    </div>
  );
}

export default App;
