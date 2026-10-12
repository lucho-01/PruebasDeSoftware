import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';
 
const RUTA_POR_ROL = {
  administrador: '/dashboard/administrador',
  gerente: '/dashboard/gerente',
  vendedor: '/dashboard/vendedor',
};
 
function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
 
  const manejarEnvio = async (e) => {
e.preventDefault();
    try {
      const { token, usuario } = await login(correo, password);
      iniciarSesion(token, usuario);
      navigate(RUTA_POR_ROL[usuario.rol] || '/');
    } catch (error) {
      setMensaje(error.response?.data?.error?.message || 'Error al iniciar sesión');
    }
  };
 
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">Pyme<span>Flow</span></div>
        <p className="login-subtitle">Inicia sesión para continuar</p>
        <form onSubmit={manejarEnvio} className="login-form">
          <div>
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              className="login-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
        {mensaje && <p className="login-message">{mensaje}</p>}
      </div>
    </div>
  );
}
 
export default LoginPage;