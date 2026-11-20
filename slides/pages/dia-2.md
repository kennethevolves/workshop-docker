---
layout: center
class: section
---

<div class="kicker">Día 2 · 5 horas</div>

# Dockerfile y Docker Hub

<p class="lead">De usar imágenes de otros a entender cómo se construyen las nuestras.</p>

---

# Agenda de hoy

| Bloque | Tema | Práctica |
| --- | --- | --- |
| **1** | El proyecto Nexo Gamer | 🛠 **Guía 1**: levantarlo con pnpm y PostgreSQL en Docker |
| **2** | El `.dockerignore` | Qué no debe entrar a una imagen |
| **3** | El `Dockerfile` multi-stage del API | Cómo se lee, etapa por etapa |

---
layout: center
class: section
---

<div class="kicker">Bloque 1</div>

# El proyecto Nexo Gamer

---

<div class="badge badge-practice">🛠 Guía 1</div>

# El repositorio del taller

<div class="cols">
<div>

Si no lo clonamos ayer:

```powershell
git clone https://github.com/kennethevolves/workshop-docker.git
cd workshop-docker
```

</div>
<div>

Si ya lo tenemos:

```powershell
cd workshop-docker
git switch main
git pull
```

</div>
</div>

<p class="lead">Lo abrimos en VS Code: <code>code .</code></p>

---

# La estructura del proyecto

````md magic-move {lines: false}
```text
workshop-docker/
├── api/
├── shop/
├── admin/
├── docs/
├── slides/
└── README.md
```
```text
workshop-docker/
├── api/                  NestJS + Prisma
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── pnpm-lock.yaml
├── shop/
├── admin/
└── README.md
```
```text
workshop-docker/
├── api/                  NestJS + Prisma
├── shop/                 Next.js · tienda pública
│   ├── src/
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   └── pnpm-lock.yaml
├── admin/                Next.js · panel privado
│   ├── src/
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   └── pnpm-lock.yaml
└── README.md
```
````

---

# Tres proyectos, tres imágenes

<div class="flow">
<div class="box">El navegador</div>
<div class="arrow">→</div>
<div class="stack">
<div class="box box-blue">shop<small>Next.js · :3001</small></div>
<div class="box box-blue">admin<small>Next.js · :3002</small></div>
</div>
<div class="arrow">→</div>
<div class="box box-blue">api<small>NestJS + Prisma · :3000</small></div>
<div class="arrow">→</div>
<div class="box box-ok">db<small>postgres:18-alpine</small></div>
</div>

<div v-click style="margin-top: 1.5rem">

| Carpeta | Imagen que vamos a construir | Puerto |
| --- | --- | --- |
| `api/` | `nexo-api` | 3000 |
| `shop/` | `nexo-shop` | 3001 |
| `admin/` | `nexo-admin` | 3002 |

</div>

---

# pnpm y el `pnpm-lock.yaml`

<div class="cols">
<div>

`package.json` dice **qué rango** aceptamos:

```json
"@nestjs/core": "^12.0.1"
```

<p class="muted small-note">El <code>^</code> acepta cualquier 12.x.x.</p>

</div>
<div>

`pnpm-lock.yaml` guarda **la versión exacta**:

```yaml
'@nestjs/core':
  specifier: ^12.0.1
  version: 12.5.0
```

</div>
</div>

<p v-click class="lead">El lockfile garantiza que nuestra máquina, la del compañero y la imagen de Docker instalen <strong>exactamente</strong> lo mismo. Por eso se sube a GitHub.</p>

---

# Antes de empaquetar: ¿qué necesita cada app?

<div class="flow">
<div class="box box-blue">shop · admin · api<small>con <span class="mono">pnpm dev</span>, en nuestra máquina</small></div>
<div class="arrow">→</div>
<div class="box box-ok">db<small>en un contenedor</small></div>
</div>

<p class="lead" style="margin-top: 1.5rem; text-align: center">Primero levantamos el proyecto <strong>casi sin Docker</strong>.<br>Así vemos qué necesita cada app para correr.<br>Eso mismo es lo que después va dentro del <code>Dockerfile</code>.</p>

---

<div class="badge badge-practice">🛠 Paso 1</div>

# PostgreSQL en un contenedor

<div class="cols">
<div>

```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -p 5432:5432 `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```

</div>
<div>

- Reutilizamos el volumen `shop-db` de ayer. Si no existe, Docker lo crea.
- **Ahora sí lleva `-p 5432:5432`:** el API va a correr en nuestra máquina y llega a la base por `localhost:5432`.

```powershell
docker logs db
```

</div>
</div>

---

<div class="badge badge-practice">🛠 Paso 2</div>

# El `.env` del API

<div class="cols">
<div>

```powershell
cd api
cp .env.example .env
```

```dotenv
PORT=3000
DATABASE_URL=postgresql://shop:secreto@localhost:5432/shop
JWT_SECRET=cambia-este-secreto
ADMIN_EMAIL=admin@nexogamer.mx
ADMIN_PASSWORD=...
UPLOADS_DIR=uploads
```

</div>
<div>

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Cómo llega a PostgreSQL |
| `JWT_SECRET` | Firmar las sesiones |
| `ADMIN_*` | El administrador que crea el seed |
| `UPLOADS_DIR` | Dónde guarda las fotos |

<p class="muted small-note">Editamos siempre el <code>.env</code>, nunca el <code>.env.example</code>: el ejemplo se sube a GitHub.</p>

</div>
</div>

---

# Leer la `DATABASE_URL`

<p class="mono" style="text-align: center; font-size: 1.3rem; margin-top: 1.5rem">
postgresql://<span style="color: var(--docker)">shop</span>:<span style="color: var(--docker)">secreto</span>@<span style="color: var(--ok)">localhost</span>:<span style="color: var(--warn)">5432</span>/<span style="color: var(--docker)">shop</span>
</p>

<div class="cols-3" style="margin-top: 1.5rem">
<div class="box box-blue" v-click><strong>Usuario, clave y base</strong><small>Los mismos del <span class="mono">-e POSTGRES_*</span><br>del paso 1</small></div>
<div class="box box-ok" v-click><strong>localhost</strong><small>El API corre en nuestra máquina<br>y llega por el puerto publicado</small></div>
<div class="box box-warn" v-click><strong>5432</strong><small>El puerto de nuestra máquina<br>del <span class="mono">-p 5432:5432</span></small></div>
</div>

<p v-click class="lead" style="margin-top: 1.5rem; text-align: center">Generamos un <code>JWT_SECRET</code> propio:</p>

<div v-after>

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

</div>

---

<div class="badge badge-practice">🛠 Paso 3</div>

# Levantamos el API, en orden

<div class="steps">
<div class="box" v-click><span class="step-num">1</span><span class="mono">pnpm install</span><small>dependencias</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-blue" v-click><span class="step-num">2</span><span class="mono">pnpm db:generate</span><small>código de Prisma</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-blue" v-click><span class="step-num">3</span><span class="mono">pnpm db:deploy</span><small>crea las tablas</small></div>
</div>
<div class="steps">
<div class="box" v-click><span class="step-num">4</span><span class="mono">pnpm build</span><small>compila a dist/</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-ok" v-click><span class="step-num">5</span><span class="mono">pnpm db:seed</span><small>admin + 14 productos</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-ok" v-click><span class="step-num">6</span><span class="mono">pnpm dev</span><small>arranca</small></div>
</div>

<p v-click class="lead" style="margin-top: 1.5rem; text-align: center">Si nos saltamos uno, el siguiente falla. El seed corre desde <code>dist/</code>, por eso va después de <code>build</code>.</p>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# El API respondiendo

```powershell
curl.exe http://localhost:3000/health
```

```json
{ "status": "ok", "database": "up", "container": "NOMBRE-DE-NUESTRA-PC" }
```

<v-clicks>

- `database: up`: el API llegó al contenedor de PostgreSQL.
- `container` dice el nombre de **nuestra computadora**: el API todavía no corre en Docker.
- Al final del día, aquí va a aparecer el ID de un contenedor.

</v-clicks>

---

<div class="badge badge-practice">🛠 Paso 4</div>

# La tienda y el panel

<div class="cols">
<div>

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

</div>
<div>

| Variable | Quién la usa |
| --- | --- |
| `API_URL` | El **servidor** de Next.js, para pedir los datos |
| `NEXT_PUBLIC_API_URL` | El **navegador**, para cargar las fotos |

<p class="muted small-note">Hoy las dos valen <code>http://localhost:3000</code>. Dentro de Docker van a ser distintas.</p>

</div>
</div>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# El proyecto funcionando

<div class="cols">
<div>

1. `localhost:3001`: el catálogo con 14 productos.
2. `localhost:3002`: entramos con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` de `api/.env`.
3. Subimos una foto a un producto y aparece en la tienda.

</div>
<div v-click>

Tenemos **4 terminales** abiertas:

- el API
- la tienda
- el panel
- una para comandos

<p class="muted small-note">Y en Docker, solo un contenedor: <code>db</code>.</p>

</div>
</div>

---

# Lo que necesitó cada app para correr

| Necesitó | API | Tienda y panel |
| --- | --- | --- |
| **Node.js 24 y pnpm** | ✓ | ✓ |
| **Instalar dependencias** | `pnpm install` | `pnpm install` |
| **Generar o compilar** | `db:generate` y `build` | `build` (con `dev`, al vuelo) |
| **Variables de entorno** | `DATABASE_URL`, `JWT_SECRET` | `API_URL`, `NEXT_PUBLIC_API_URL` |
| **Un puerto** | 3000 | 3001 y 3002 |
| **Un comando para arrancar** | `node dist/main` | `next start` |

<p v-click class="lead">Esta tabla es, literalmente, lo que vamos a escribir en cada <code>Dockerfile</code>.</p>

<!--
Antes de seguir: Ctrl+C en las terminales del API, la tienda y el panel. El contenedor db se queda corriendo.
-->


---
layout: center
class: section
---

<div class="kicker">Bloque 2</div>

# El `.dockerignore`

---

# ¿Qué NO debe entrar a una imagen?

| Archivo o carpeta | Por qué no |
| --- | --- |
| `node_modules/` | Se instala **dentro** de la imagen. Los paquetes compilados para Windows no sirven en Linux |
| `.env` | Tiene contraseñas. Quedarían grabadas en la imagen y cualquiera que la descargue las puede leer |
| `dist/` y `.next/` | Se generan **dentro** de la imagen al compilar |
| `uploads/` | Son datos (fotos), no código. Van en un volumen |
| `src/generated/` | El cliente de Prisma se genera dentro de la imagen |

<p v-click class="lead">Para eso existe el <code>.dockerignore</code>: funciona como el <code>.gitignore</code>, pero para Docker.</p>

---

# El `.dockerignore` del API

````md magic-move {lines: false}
```text
api/
├── prisma/
├── src/
├── .env
├── .env.example
├── package.json
└── pnpm-lock.yaml
```
```text
api/
├── prisma/
├── src/
├── .dockerignore      ← nuevo
├── .env
├── .env.example
├── package.json
└── pnpm-lock.yaml
```
````

<div v-click>

```text [api/.dockerignore]
node_modules
dist
uploads
src/generated
.env
.env.*
!.env.example
*.log
Dockerfile
.dockerignore
```

</div>

---

# Los tres `.dockerignore` del proyecto

<div class="cols">
<div>

`api/.dockerignore`

```text
node_modules
dist
uploads
src/generated
.env
.env.*
!.env.example
*.log
Dockerfile
.dockerignore
```

</div>
<div>

`shop/.dockerignore` y `admin/.dockerignore`

```text
node_modules
.next
.env
.env.*
!.env.example
*.log
Dockerfile
.dockerignore
```

<p class="muted small-note"><code>!.env.example</code> significa "excepto este": el ejemplo no tiene secretos.</p>

</div>
</div>

---

# Otros que suelen ir en un `.dockerignore`

| Patrón | Qué es | Por qué fuera |
| --- | --- | --- |
| `.git` | El historial de Git | Pesa mucho y puede tener secretos de commits viejos |
| `.vscode`, `.idea` | Configuración del editor | No sirve para correr la app |
| `coverage`, `test-results` | Reportes de pruebas | Se generan, no son código |
| `README.md`, `docs` | Documentación | La app no la necesita |
| `docker-compose*.yml` | Archivos de Compose | Son para orquestar, no para la imagen |
| `.DS_Store`, `Thumbs.db` | Archivos basura del sistema | Ensucian la imagen y rompen la caché |
| `*.pem`, `*.key` | Llaves y certificados | **Secretos**: nunca en una imagen |

---

# Buenas prácticas del `.dockerignore`

<v-clicks>

- **Créalo antes que el `Dockerfile`.** Un `COPY . .` sin `.dockerignore` mete todo, secretos incluidos.
- **Un contexto pequeño construye más rápido.** Docker manda toda la carpeta al demonio antes de empezar: lo vemos en la línea `transferring context`.
- **Los secretos nunca entran.** Ni `.env`, ni llaves, ni tokens. Las variables se pasan al **correr**, no al construir.
- **Ignora lo que se genera.** `node_modules`, `dist`, `.next`: se construyen dentro, con las versiones del lockfile.
- **Un `.dockerignore` por contexto.** Cada carpeta que construimos (`api`, `shop`, `admin`) tiene el suyo.

</v-clicks>


---
layout: center
class: section
---

<div class="kicker">Bloque 3</div>

# El `Dockerfile` multi-stage del API

---

# ¿Qué es un `Dockerfile`?

<v-clicks>

- Un archivo de texto con **instrucciones en orden**: la receta de una imagen.
- `docker build` lo lee de arriba hacia abajo y cada instrucción produce una **capa**.
- La tabla de “lo que necesitó cada app” es justo lo que escribimos: Node, dependencias, compilar, variables, puerto y comando.

</v-clicks>

---

# Multi-stage: construir en una etapa, correr en otra

<div class="steps">
<div class="box box-blue" v-click><strong>deps</strong><small>Instala todas<br>las dependencias</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-blue" v-click><strong>build</strong><small>Genera Prisma<br>y compila a <span class="mono">dist/</span></small></div>
<div class="arrow" v-click>→</div>
<div class="box box-ok" v-click><strong>runtime</strong><small>Solo <span class="mono">dist/</span> y las<br>dependencias de producción</small></div>
</div>

<v-clicks>

- Cada etapa empieza con su `FROM` y se nombra con `AS`.
- `COPY --from=build` copia archivos **de otra etapa**.
- La imagen final es **solo la última etapa**: TypeScript y el código fuente se quedan atrás.

</v-clicks>

---
class: code-sm
---

# El `Dockerfile` del API

<div class="cols">
<div>

<p class="title-sm">Construir</p>

```dockerfile {1-4|6-8|10-14|16-18|all}
FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    pnpm prisma generate
RUN pnpm build

FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
```

</div>
<div>

<p class="title-sm">Correr: la imagen final</p>

```dockerfile {1-3|4-7|8-9|10-11|all}
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
```

</div>
</div>

---

# Qué hace cada etapa

| Etapa | Qué hace | Por qué |
| --- | --- | --- |
| `base` | Node + Corepack | La comparten `deps` y `prod-deps` |
| `deps` | Instala **todas** las dependencias | Las necesitamos para compilar |
| `build` | Genera Prisma y compila | Aquí está TypeScript, pero no llega a la imagen final |
| `prod-deps` | Instala con `--prod` | Sin TypeScript ni CLI de Nest. `prisma` se queda para migrar |
| `runtime` | Copia `node_modules`, `dist/` y `prisma/` | La imagen que se publica |

<p v-click class="lead"><code>USER node</code>: el contenedor no corre como <code>root</code>. Antes le damos al usuario <code>node</code> la carpeta <code>uploads</code> con <code>chown</code>.</p>




