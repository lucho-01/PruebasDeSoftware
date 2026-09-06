# PruebasDeSoftware
Repositorio destinado al desarrollo del proyecto de pruebas de software

## Integrantes
- Luis José Ricardo
- Samuel Velasquez
- Maria Alejandra Hernandez
- Valentina Duque

## Tecnologías
- React
- Node.js
- Express
- PostgreSQL

---

## Requisitos previos
- Node.js v18 o superior
- npm v9 o superior

## Instalación y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/lucho-01/PruebasDeSoftware.git
cd PruebasDeSoftware
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `Backend/` con el siguiente contenido:
```env
DATABASE_URL=tu_url_de_postgresql
JWT_SECRET=tu_secreto_para_jwt
```

### 4. Ejecutar migraciones (crea las tablas en la BD)
```bash
npx sequelize-cli db:migrate
```

### 5. Ejecutar semillas (datos iniciales: roles y admin)
```bash
npx sequelize-cli db:seed:all
```

### 6. Iniciar el servidor
```bash
npm run dev
```

El servidor arrancará en `http://localhost:3000`.

## Ejecutar tests
```bash
npx jest
```

## Estructura del proyecto
```
Backend/
├── config/         # Configuración de Sequelize
├── migrations/     # Migraciones de la BD
├── models/         # Modelos (Usuario, Rol)
├── seeders/        # Datos iniciales
└── src/
    ├── modules/
    │   └── auth/   # Servicio de autenticación (login)
    └── tests/      # Tests unitarios
```
