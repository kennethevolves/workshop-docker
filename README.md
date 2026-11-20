# Nexo Gamer · Taller de Docker

Tienda en línea de laptops y componentes, con su panel de administración. Es el proyecto que vamos a empaquetar con Docker durante el taller.

| Carpeta  | Qué es                                           | Puerto |
| -------- | ------------------------------------------------ | ------ |
| `api/`   | API en NestJS + Prisma: login, productos y fotos | 3000   |
| `shop/`  | Tienda pública en Next.js                        | 3001   |
| `admin/` | Panel de administración en Next.js               | 3002   |
| `slides/` | Diapositivas del taller en Slidev               | 3030   |

Cada carpeta es un proyecto independiente, con su propio `package.json` y `pnpm-lock.yaml`.

## Requisitos

- Docker Desktop
- Git
- Node.js 24
- pnpm (`corepack enable`)

## 1. Clonar el repositorio

```powershell
git clone https://github.com/kennethevolves/workshop-docker.git
cd workshop-docker
```

## 2. Levantar la base de datos

```powershell
docker run -d --name db -e POSTGRES_USER=shop -e POSTGRES_PASSWORD=secreto -e POSTGRES_DB=shop -p 5432:5432 postgres:18-alpine
```

Si cambias el usuario, la contraseña o el nombre de la base, usa los mismos valores en `DATABASE_URL` (paso 3).

## 3. Configurar el API

Copia el archivo de ejemplo:

```powershell
cd api
cp .env.example .env
```

Abre `api/.env` y cambia lo que necesites. **Edita siempre `.env`, nunca `.env.example`**: el ejemplo se sube a GitHub y el `.env` no.

| Variable         | Qué es                                                                       | ¿Cambiarla?                            |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| `DATABASE_URL`   | Conexión a PostgreSQL: `postgresql://usuario:contraseña@localhost:5432/base` | Solo si cambiaste los datos del paso 2 |
| `JWT_SECRET`     | Clave con la que el API firma las sesiones                                   | **Sí**, genera una propia (abajo)      |
| `ADMIN_NAME`     | Nombre del administrador                                                     | Opcional                               |
| `ADMIN_EMAIL`    | Correo con el que entras al panel                                            | Opcional                               |
| `ADMIN_PASSWORD` | Contraseña con la que entras al panel                                        | **Sí**                                 |
| `UPLOADS_DIR`    | Carpeta donde se guardan las fotos                                           | No                                     |

### Generar tu `JWT_SECRET`

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Copia el resultado y pégalo en `api/.env`:

```dotenv
JWT_SECRET=pega-aqui-el-valor-que-generaste
```

Si cambias el `JWT_SECRET` después, todas las sesiones abiertas dejan de servir y hay que volver a iniciar sesión en el panel.

### Cambiar el correo o la contraseña del administrador

Edita `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `api/.env` y vuelve a correr el seed:

```powershell
pnpm db:seed
```

El seed siempre toma la contraseña del `.env`.

## 4. Correr el API

```powershell
pnpm install
pnpm db:generate
pnpm db:deploy
pnpm build
pnpm db:seed
pnpm dev
```

## 5. Correr la tienda y el panel

Cada uno en su propia terminal:

```powershell
cd shop
cp .env.example .env
pnpm install
pnpm dev
```

```powershell
cd admin
cp .env.example .env
pnpm install
pnpm dev
```

- Tienda: http://localhost:3001
- Panel: http://localhost:3002 (entra con `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `api/.env`)

## Ver las diapositivas del taller

Las diapositivas de los tres días están en la carpeta `slides/`. Se abren en el navegador con Slidev.

### 1. Abre una terminal

En Windows: abre **PowerShell** o la terminal de **VS Code** (menú **Terminal → New Terminal**).

### 2. Entra a la carpeta del proyecto

La terminal siempre está "parada" en una carpeta. Para saber en cuál estás:

```powershell
pwd
```

Ve a la carpeta donde clonaste el repositorio. Por ejemplo, si lo clonaste en Documentos:

```powershell
cd $HOME\Documents\workshop-docker
```

Cambia la ruta por la tuya. Para confirmar que estás en el lugar correcto:

```powershell
ls
```

Debes ver las carpetas `api`, `shop`, `admin`, `docs` y `slides`. Si no las ves, no estás en `workshop-docker`.

Si abriste la carpeta `workshop-docker` en VS Code, su terminal ya empieza ahí y puedes saltarte este paso.

### 3. Trae la versión más reciente

```powershell
git pull
```

### 4. Entra a la carpeta de las diapositivas

```powershell
cd slides
```

`pwd` ahora debe terminar en `workshop-docker\slides`.

### 5. Instala las dependencias (solo la primera vez)

```powershell
pnpm install
```

Si dice que `pnpm` no se reconoce, corre primero `corepack enable` y repite.

### 6. Arranca las diapositivas

```powershell
pnpm dev
```

Se abre el navegador en http://localhost:3030. Si no se abre solo, copia esa dirección en el navegador.

| Tecla | Qué hace |
| --- | --- |
| Flecha derecha o espacio | Siguiente paso o diapositiva |
| Flecha izquierda | Paso o diapositiva anterior |
| `o` | Vista general de todas las diapositivas |
| `f` | Pantalla completa |

### 7. Para cerrarlas

En la terminal donde corre `pnpm dev`, presiona **Ctrl+C**. Para regresar a la carpeta del proyecto:

```powershell
cd ..
```

La próxima vez solo repites los pasos 1, 2, 4 y 6: la instalación ya quedó hecha.

## Manual de comandos

Todos los comandos del taller están en [`docs/COMANDOS.md`](docs/COMANDOS.md).
