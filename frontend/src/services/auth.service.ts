//Definimos que le enviamos al backend para iniciar sesión, que es el correo y la contraseña del usuario.
export interface LoginCredentials {
  correo: string;
  contrasenia: string;
}

//Definimos que nos responde el backend al hacer login, que es un token de acceso y la información del usuario.
export interface LoginResponse {
  accessToken: string;
  usuario: {
    correo: string;
    nombre: string;
    rol: string;
    idEmpresa: number;
  };
}

//URL base de la API (idealmente esto luego lo pasaríamos a un archivo .env propio de Vite)
const API_URL = "http://localhost:3000";

//Función para iniciar sesión
export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Correo o contraseña incorrectos");
  }

  const data: LoginResponse = await response.json();

  // Guardar token y usuario en el almacenamiento del navegador
  localStorage.setItem("token", data.accessToken);
  localStorage.setItem("usuario", JSON.stringify(data.usuario));

  return data;
};

//Cerrar sesión eliminando el token y la información del usuario del almacenamiento del navegador.
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};
