import { createContext, useContext, useState } from "react";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });
  const iniciarSesion = (token, usuarioLogueado) => {
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuarioLogueado));
    setUsuario(usuarioLogueado);
  };
  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components -- context y hook van juntos a propósito
export function useAuth() {
  return useContext(AuthContext);
}
