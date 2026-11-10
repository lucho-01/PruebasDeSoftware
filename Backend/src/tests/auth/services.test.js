process.env.JWT_SECRET = "test_secret_for_tests_only";

const bcrypt = require("bcrypt");

jest.mock("../../../models", () => ({
  Usuario: {
    findOne: jest.fn(),
    sequelize: { query: jest.fn() },
  },
  Rol: {},
}));
const { Usuario } = require("../../../models");
const authService = require("../../modules/auth/authService");

describe("authService.login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rechaza si el usuario no existe", async () => {
    Usuario.findOne.mockResolvedValue(null);
    await expect(
      authService.login("no-existe@crm.local", "cualquiera"),
    ).rejects.toMatchObject({ code: "CREDENCIALES_INVALIDAS" });
  });

  it("rechaza si la contraseña no coincide", async () => {
    const usuarioFalso = {
      id: 1,
      nombre: "Admin",
      activo: true,
      Rol: { nombre: "administrador" },
      passwordHash: await bcrypt.hash("claveCorrecta", 10),
      intentosFallidos: 0,
      bloqueadoHasta: null,
      update: jest.fn(),
    };
    Usuario.findOne.mockResolvedValue(usuarioFalso);
    Usuario.sequelize.query.mockResolvedValue([[{ intentos_fallidos: 1 }]]);

    await expect(
      authService.login("admin@crm.local", "claveIncorrecta"),
    ).rejects.toMatchObject({ code: "CREDENCIALES_INVALIDAS" });
    expect(Usuario.sequelize.query).toHaveBeenCalledTimes(1);
  });

  it("rechaza con 423 si una petición concurrente supera el máximo de intentos", async () => {
    const usuarioFalso = {
      id: 1,
      nombre: "Admin",
      activo: true,
      Rol: { nombre: "administrador" },
      passwordHash: await bcrypt.hash("claveCorrecta", 10),
      intentosFallidos: 0,
      bloqueadoHasta: null,
      update: jest.fn(),
    };
    Usuario.findOne.mockResolvedValue(usuarioFalso);
    Usuario.sequelize.query.mockResolvedValue([[{ intentos_fallidos: 6 }]]);

    await expect(
      authService.login("admin@crm.local", "claveIncorrecta"),
    ).rejects.toMatchObject({ status: 423, code: "CUENTA_BLOQUEADA" });
  });

  it("genera un token cuando la contraseña es correcta", async () => {
    const hash = await bcrypt.hash("Admin123", 10);
    const usuarioMock = {
      id: 1,
      nombre: "Administrador Inicial",
      activo: true,
      passwordHash: hash,
      intentosFallidos: 0,
      bloqueadoHasta: null,
      Rol: { nombre: "administrador" },
      update: jest.fn(),
    };
    Usuario.findOne.mockResolvedValue(usuarioMock);
    const resultado = await authService.login("a@a.com", "Admin123");
    expect(resultado.token).toBeDefined();
    expect(resultado.usuario).toEqual({
      id: 1,
      nombre: "Administrador Inicial",
      rol: "administrador",
    });
  });
});
