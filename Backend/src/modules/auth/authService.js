const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Usuario, Rol } = require("../../../models");

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 5;

// Suma un intento fallido de forma ATÓMICA en la base de datos.
// La base de datos hace "leer + sumar + guardar" en una sola operación, así que
// dos peticiones simultáneas nunca leen el mismo valor (evita la condición de carrera).
async function registrarIntentoFallido(id) {
  const [filas] = await Usuario.sequelize.query(
    `UPDATE usuarios
        SET intentos_fallidos = intentos_fallidos + 1,
            bloqueado_hasta = CASE
              WHEN intentos_fallidos + 1 >= :max THEN NOW() + make_interval(mins => :minutos)
              ELSE bloqueado_hasta
            END,
            updated_at = NOW()
      WHERE id = :id
  RETURNING intentos_fallidos`,
    { replacements: { id, max: MAX_INTENTOS, minutos: MINUTOS_BLOQUEO } },
  );
  return filas[0].intentos_fallidos;
}

async function login(correo, password) {
  const usuario = await Usuario.findOne({ where: { correo }, include: Rol });

  if (!usuario || !usuario.activo) {
    throw {
      status: 401,
      code: "CREDENCIALES_INVALIDAS",
      message: "Correo o contraseña incorrectos",
    };
  }

  if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
    const minutosRestantes = Math.ceil((usuario.bloqueadoHasta - new Date()) / 60000);
    throw {
      status: 423,
      code: "CUENTA_BLOQUEADA",
      message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
    };
  }

  // Si el bloqueo anterior ya venció, el usuario vuelve a tener sus 5 intentos
  if (usuario.bloqueadoHasta) {
    await usuario.update({ intentosFallidos: 0, bloqueadoHasta: null });
  }

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);

  if (!passwordValido) {
    const intentos = await registrarIntentoFallido(usuario.id);
    if (intentos > MAX_INTENTOS) {
      // Petición concurrente que llegó cuando la cuenta ya quedó bloqueada
      throw {
        status: 423,
        code: "CUENTA_BLOQUEADA",
        message: `Cuenta bloqueada. Intenta de nuevo en ${MINUTOS_BLOQUEO} minuto(s).`,
      };
    }
    throw {
      status: 401,
      code: "CREDENCIALES_INVALIDAS",
      message: "Correo o contraseña incorrectos",
    };
  }

  await usuario.update({ intentosFallidos: 0, bloqueadoHasta: null });

  const usuarioPublico = {
    id: usuario.id,
    nombre: usuario.nombre,
    rol: usuario.Rol.nombre,
  };
  const token = jwt.sign(usuarioPublico, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  return { token, usuario: usuarioPublico };
}

module.exports = { login };
