import { createContext, useContext, useState } from 'react';
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
 
  const iniciarSesion = (token, usuarioLogueado) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuarioLogueado));
    setUsuario(usuarioLogueado);
  };
 
  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  return useContext(AuthContext);
}