---
layout: center
class: section
---

<div class="kicker">Día 3 · 5 horas</div>

# Dockerfile, Docker Compose y Docker Hub

<p class="lead">Escribimos nuestras imágenes, las levantamos con un solo archivo y las publicamos.</p>

---

# Agenda de hoy

| Bloque | Tema | Cómo |
| --- | --- | --- |
| **1** | Las bases del `Dockerfile`: instrucciones, capas y etapas | Diapositivas |
| **2** | El `Dockerfile` de la tienda y del panel: simple y multi-stage | Diapositivas |
| 🛠 | **Guía 2**: construir las imágenes y correr todo con `docker run` | Práctica |
| **3** | Docker Compose, pieza por pieza | Diapositivas |
| 🛠 | **Guía 3**: todo con Docker Compose y Docker Hub | Práctica |

<p v-click class="lead">Las diapositivas son para entender. Las guías son para practicar juntos.</p>

---

<div class="badge badge-practice">🛠 Antes de empezar</div>

# Actualizamos el repositorio

```powershell
cd workshop-docker
git pull
```

<v-clicks>

- `git pull` **borra** `shop/Dockerfile` y `admin/Dockerfile`: hoy los escribimos nosotros.
- `api/Dockerfile` se queda: ya lo vimos el día 2.
- Si `git pull` se queja de cambios locales: `git restore shop/Dockerfile admin/Dockerfile` y otra vez `git pull`.

</v-clicks>

<div v-click>

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

`api/Dockerfile` existe; `shop/Dockerfile` y `admin/Dockerfile`, no.

</div>

---
layout: center
class: section
---

<div class="kicker">Bloque 1</div>

# Las bases del `Dockerfile`

---

# ¿Qué es un `Dockerfile`?

<v-clicks>

- Un archivo de texto, sin extensión, con **instrucciones en orden**: la receta de una imagen.
- `docker build` lo lee **de arriba hacia abajo**.
- Cada instrucción que cambia archivos produce una **capa**.
- Es lo mismo que haríamos a mano en una computadora vacía para dejar la app corriendo.

</v-clicks>

---

# Un `Dockerfile` responde seis preguntas

| Pregunta | Instrucción | En la tienda |
| --- | --- | --- |
| ¿De qué sistema partimos? | `FROM` | `node:24-alpine` |
| ¿En qué carpeta trabajamos? | `WORKDIR` | `/app` |
| ¿Cómo se instalan sus dependencias? | `COPY` + `RUN` | `package.json` → `pnpm install` |
| ¿Qué código lleva y cómo se compila? | `COPY` + `RUN` | `COPY . .` → `pnpm build` |
| ¿Qué configuración trae? | `ENV` / `ARG` | `NEXT_PUBLIC_API_URL` |
| ¿Por dónde y cómo arranca? | `EXPOSE` + `CMD` | `3001` → `pnpm start` |

---

# Las instrucciones

| Instrucción | Qué hace | Actúa al |
| --- | --- | --- |
| `FROM` | Imagen de partida. Con `AS nombre`, empieza una etapa | Construir |
| `WORKDIR` | Crea la carpeta y se para ahí | Construir y correr |
| `COPY` | Copia archivos del proyecto, o de otra etapa con `--from` | Construir |
| `RUN` | Ejecuta un comando y guarda el resultado | Construir |
| `ENV` | Variable que existe al construir y al correr | Los dos |
| `ARG` | Variable que solo existe al construir | Construir |
| `EXPOSE` | Documenta el puerto. **No** lo publica: eso es `-p` | — |
| `USER` | Usuario con el que corre la app | Correr |
| `CMD` | Comando que arranca el contenedor | Correr |

---

# Cada instrucción es una capa

<div class="cols">
<div>

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
```

</div>
<div class="stack">
<div class="box box-ghost">CMD: solo un dato, no pesa</div>
<div class="box box-blue" v-click>RUN pnpm build</div>
<div class="box box-blue" v-click>COPY . .</div>
<div class="box box-ok" v-click>RUN pnpm install</div>
<div class="box box-ok" v-click>COPY package.json …</div>
<div class="box">WORKDIR /app</div>
<div class="box">node:24-alpine</div>
</div>
</div>

<p v-click class="lead">La imagen es la <strong>pila de capas</strong>. Docker guarda cada una en caché.</p>

---

# La caché: por qué importa el orden

<div class="cols">
<div>

<div class="badge badge-warn">Lento</div>

```dockerfile
COPY . .
RUN pnpm install --frozen-lockfile
```

Cambiamos una línea de `src/` → `COPY . .` cambia → **se reinstala todo**.

</div>
<div v-click>

<div class="badge badge-check">Rápido</div>

```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
```

Cambiamos una línea de `src/` → `package.json` no cambió → **la instalación sale de caché**.

</div>
</div>

<p v-click class="lead">Si una capa cambia, esa y <strong>todas las de abajo</strong> se reconstruyen. Regla: de lo que menos cambia a lo que más cambia.</p>

---

# Etapas: construir en una, correr en otra

<div class="steps">
<div class="box box-blue" v-click><strong>base</strong><small>Node y pnpm</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-blue" v-click><strong>deps</strong><small>Instala<br>dependencias</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-blue" v-click><strong>build</strong><small>Compila<br>el código</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-ok" v-click><strong>runtime</strong><small>Solo lo necesario<br>para correr</small></div>
</div>

<v-clicks>

- Cada `FROM … AS nombre` empieza una **etapa nueva**, desde cero.
- `COPY --from=build` trae archivos **de otra etapa**.
- La imagen final es **solo la última etapa**: compiladores y código fuente se quedan atrás.

</v-clicks>

<p v-click class="lead">Lo vemos en práctica construyendo el <code>Dockerfile</code> de la tienda, paso a paso.</p>

---
layout: center
class: section
---

<div class="kicker">Bloque 2</div>

# El `Dockerfile` de la tienda y del panel

---

# El `.dockerignore` de los fronts

<div class="cols">
<div>

```text [shop/.dockerignore y admin/.dockerignore]
node_modules
.next
.env
.env.*
!.env.example
*.log
Dockerfile
.dockerignore
```

</div>
<div>

<v-clicks>

- `node_modules` y `.next`: se generan **dentro** de la imagen.
- `.env`: tiene secretos; nunca entra.
- `!.env.example`: la excepción, no tiene secretos.
- Ya lo tenemos en `shop/` y `admin/`: lo creamos el día 2.

</v-clicks>

</div>
</div>

<p v-click class="lead">Sin él, <code>COPY . .</code> mandaría cientos de MB y nuestras contraseñas a la imagen.</p>

---

# Antes de escribir: ¿qué necesita la tienda?

<div class="cols">
<div>

```text
shop/
├── src/
│   ├── app/          páginas
│   ├── components/
│   └── lib/          api.ts, images.ts
├── .dockerignore
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

</div>
<div>

<v-clicks>

- Es **Next.js 16**: se compila con `next build`.
- No usa base de datos: le pide todo al API.
- Necesita **dos** direcciones del API: una para el servidor y otra para el navegador.
- Escucha en el puerto **3001**.

</v-clicks>

</div>
</div>

<p v-click class="lead">Primero la versión <strong>simple</strong>, una sola etapa. Creamos el archivo vacío <code>shop/Dockerfile</code>.</p>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Simple · Paso 1</div>

# La base, pnpm y la carpeta

<div class="cols">
<div>

```dockerfile
FROM node:24-alpine
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app
```

</div>
<div>

```json [shop/package.json]
"packageManager": "pnpm@12.3.4",
"engines": { "node": ">=24" }
```

<v-clicks>

- `engines` pide Node 24 o mayor → `node:24-alpine`. Alpine: Linux mínimo.
- `corepack enable` lee `packageManager` y prepara **exactamente** pnpm 12.3.4.
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0`: que no pregunte si descarga pnpm.
- `NEXT_TELEMETRY_DISABLED=1`: Next.js no manda datos de uso.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Simple · Paso 2</div>

# Las dependencias

<div class="cols">
<div>

```dockerfile {7-8}
FROM node:24-alpine
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

</div>
<div>

```text
shop/
├── package.json      ← qué paquetes necesita
└── pnpm-lock.yaml    ← la versión exacta de cada uno
```

<v-clicks>

- Copiamos **solo estos dos**: mientras no cambien, la instalación sale de caché.
- `--frozen-lockfile`: instala exactamente lo del lockfile; si no coincide, falla.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Simple · Paso 3</div>

# El código y la dirección del API

<div class="cols">
<div>

```dockerfile {10-12}
FROM node:24-alpine
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

</div>
<div>

```ts [shop/src/lib/images.ts]
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
```

<v-clicks>

- `COPY . .`: todo lo que **no** está en el `.dockerignore`.
- Las fotos las carga el **navegador**, fuera de Docker: llega por `localhost:3000`.
- Next.js **pega** cada `NEXT_PUBLIC_` dentro del JavaScript **al compilar**.
- `ARG` recibe el valor; `ENV` lo vuelve variable para que `next build` la vea.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Simple · Paso 4</div>

# Compilar y arrancar

<div class="cols">
<div>

```dockerfile {13,15-16}
FROM node:24-alpine
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build

EXPOSE 3001
CMD ["pnpm", "start"]
```

</div>
<div>

```json [shop/package.json]
"scripts": {
  "build": "next build",
  "start": "next start --port 3001"
}
```

<v-clicks>

- `pnpm build` corre `next build`.
- `pnpm start` arranca en el puerto 3001.
- `EXPOSE 3001` lo documenta; `-p` lo publica.
- `CMD` en forma de lista, con corchetes y comillas dobles.

</v-clicks>

</div>
</div>

---

# La versión simple funciona, pero…

<v-clicks>

- Lleva **todo** `node_modules`: Next.js, TypeScript, Tailwind… cientos de MB.
- Lleva el código fuente y la caché de compilación.
- El proceso principal es **pnpm**, no Node: tarda en apagarse con `docker stop`.
- Corre como **`root`**.
- Next.js avisa que `next start` no es lo indicado con `output: 'standalone'`.

</v-clicks>

<p v-click class="lead">Ahora la convertimos a <strong>multi-stage</strong>.</p>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Multi-stage · Paso 1</div>

# Partimos la receta en etapas

<div class="cols">
<div>

```dockerfile {1,7,11}
FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build
```

</div>
<div>

<v-clicks>

- Las mismas líneas de la versión simple, con **tres** `FROM … AS`.
- `base`: Node, pnpm y `/app`.
- `deps` parte de `base` e instala.
- `build` parte de `deps` (ya trae `node_modules`) y compila.
- Quitamos `EXPOSE` y `CMD` de aquí: van en la última etapa.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Multi-stage · Paso 2</div>

# El modo `standalone`

<div class="cols">
<div>

```ts [shop/next.config.ts]
const nextConfig: NextConfig = {
  output: 'standalone',
};
```

```text
.next/                (dentro de la etapa build)
├── standalone/
│   ├── server.js
│   ├── package.json
│   ├── node_modules/   solo lo necesario
│   └── .next/server/
└── static/
    ├── chunks/
    └── css/
```

</div>
<div>

<v-clicks>

- Con `output: 'standalone'`, `next build` crea `.next/standalone/`.
- Trae un `server.js` y **solo** los paquetes que la app usa de verdad.
- Se arranca con `node server.js`: sin pnpm ni `next start`.
- No incluye `static/` (CSS y JS del navegador): esa la copiamos nosotros.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Multi-stage · Paso 3</div>

# La etapa `runtime`

<div class="cols">
<div>

```dockerfile
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
WORKDIR /app
```

```json [shop/package.json]
"start": "next start --port 3001"
```

</div>
<div>

<v-clicks>

- `FROM node:24-alpine`: limpia, sin pnpm ni `node_modules`.
- `NODE_ENV=production`: React y Next.js en modo producción.
- `PORT=3001`: el mismo puerto que `start`. `server.js` lo lee de aquí.
- `HOSTNAME=0.0.0.0`: escucha en todas las interfaces. Con `localhost`, `-p` no podría entrar desde fuera.

</v-clicks>

</div>
</div>

---
class: code-sm
---

<div class="badge badge-practice">🛠 Multi-stage · Paso 4</div>

# Copiamos solo lo necesario y arrancamos

<div class="cols">
<div>

```dockerfile {7-11}
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3001
CMD ["node", "server.js"]
```

</div>
<div>

```ts [shop/src/lib/api.ts]
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
```

<v-clicks>

- `--from=build`: de la etapa `build`, no de nuestra carpeta.
- Sin el segundo `COPY`, la tienda sale **sin estilos**.
- `--chown=node:node` y `USER node`: no corre como `root`.
- `API_URL` **no** va aquí: la lee el servidor al correr, con `-e`.

</v-clicks>

</div>
</div>

---
class: code-sm
---

# `shop/Dockerfile` completo

<div class="cols">
<div>

<p class="title-sm">Construir</p>

```dockerfile
FROM node:24-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm build
```

</div>
<div>

<p class="title-sm">Correr: la imagen final</p>

```dockerfile
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3001
CMD ["node", "server.js"]
```

</div>
</div>

---

# Simple vs. multi-stage

| | Simple | Multi-stage |
| --- | --- | --- |
| **Etapas** | 1 | 4: `base`, `deps`, `build`, `runtime` |
| **Contenido** | Todo `node_modules`, código fuente y `.next` | `server.js`, paquetes mínimos y `static/` |
| **Arranca con** | `pnpm start` | `node server.js` |
| **Usuario** | `root` | `node` |
| **Peso** | Más pesada | Mucho más ligera |

<p v-click class="lead">No hay <code>prod-deps</code> como en el API: <code>standalone</code> ya eligió los paquetes necesarios.</p>

---
class: code-sm
---

<div class="badge badge-practice">🛠 El panel</div>

# `admin/Dockerfile`: la misma receta

<div class="cols">
<div>

```powershell
Copy-Item shop/Dockerfile admin/Dockerfile
```

Cambiamos dos líneas:

```diff
- ENV PORT=3001
+ ENV PORT=3002
- EXPOSE 3001
+ EXPOSE 3002
```

</div>
<div>

```json [admin/package.json]
"start": "next start --port 3002"
```

<v-clicks>

- Mismo framework y mismo `standalone`: solo cambia el puerto.
- `COOKIE_SECURE` y `API_URL` se pasan al correr, como en la tienda.

</v-clicks>

</div>
</div>

---
layout: center
class: section
---

<div class="kicker">🛠 Práctica</div>

# Guía 2

<p class="lead">Limpiamos Docker, construimos las tres imágenes y levantamos todo con <code>docker run</code>.</p>

---

# Lo que vamos a hacer en la Guía 2

<div class="cols">
<div>

<v-clicks>

1. Detener los `pnpm dev` de la Guía 1.
2. Borrar contenedores, volúmenes, la red y nuestras imágenes.
3. Construir `nexo-api`, `nexo-shop` y `nexo-admin`.
4. Crear la red y los volúmenes.

</v-clicks>

</div>
<div>

<v-clicks>

5. PostgreSQL y Adminer.
6. El API, las tablas y los datos.
7. La tienda y el panel.
8. Verificar en el navegador.

</v-clicks>

</div>
</div>

<p v-click class="lead">Los comandos están en nuestro manual: <code>docs/COMANDOS.md</code>.</p>

---

<div class="badge badge-practice">🛠 Guía 2 · Construir</div>

# ¿Cómo construimos las tres imágenes?

<p class="lead">Búscalo en tu manual: <strong>Día 2 → Construir imágenes</strong>.</p>

<div v-click>

```powershell
docker build -t nexo-api:1.0 ./api
docker build -t nexo-shop:1.0 ./shop
docker build -t nexo-admin:1.0 ./admin
docker images
```

</div>

<div v-click>

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

`nexo-api`, `nexo-shop` y `nexo-admin`, con la versión `1.0`.

</div>

---
layout: center
class: section
---

<div class="kicker">Antes de Compose</div>

# El proyecto en cada guía

---

# Cómo corre el proyecto

| | Guía 1 | Guía 2 | Guía 3 |
| --- | --- | --- | --- |
| **API, tienda y panel** | `pnpm dev`, en nuestra máquina | `docker run`, con nuestras imágenes | `docker compose up` |
| **PostgreSQL** | Contenedor con `-p 5432:5432` | Contenedor en la red, sin `-p` | Servicio `db`, sin `ports` |
| **Cuántos comandos** | Una terminal por app | Un `docker run` por contenedor | **Uno** para todo |
| **El orden** | Nosotros | Nosotros | `depends_on` |

---

# Cómo se encuentran entre sí

<div class="cols-3">
<div>

<p class="title-sm">Guía 1</p>

```text
DATABASE_URL
…@localhost:5432/shop

API_URL
http://localhost:3000
```

Todo vive en nuestra máquina: `localhost`.

</div>
<div v-click>

<p class="title-sm">Guía 2</p>

```text
DATABASE_URL
…@db:5432/shop

API_URL
http://api:3000
```

Dentro de `shop-net`, por **nombre** del contenedor.

</div>
<div v-click>

<p class="title-sm">Guía 3</p>

```text
DATABASE_URL
…@db:5432/${DB_NAME}

API_URL
http://api:3000
```

Por **nombre** del servicio, en la red que crea Compose.

</div>
</div>

<p v-click class="lead">Dentro de un contenedor, <code>localhost</code> es <strong>el propio contenedor</strong>. Por eso desde la Guía 2 usamos nombres.</p>

---

# La red y los volúmenes: ¿quién los crea?

| | Guía 1 | Guía 2 | Guía 3 |
| --- | --- | --- | --- |
| **Red** | Ninguna: puertos publicados | `docker network create shop-net` | Compose crea `nexo-gamer_default` |
| **Volumen de la base** | `shop-db`, con `-v` | `docker volume create shop-db` | Se declara en `volumes:` y Compose lo crea **si no existe** |
| **Fotos** | Carpeta `api/uploads/` | `docker volume create uploads` | Se declara en `volumes:` |
| **Nombres** | `shop-db` | `shop-db`, `uploads` | `nexo-gamer_shop-db`, `nexo-gamer_uploads` |

<p v-click class="lead">Compose les pone el prefijo del proyecto: son <strong>otros</strong> volúmenes, empiezan vacíos.</p>

---

# Las variables y el día a día

| | Guía 1 | Guía 2 | Guía 3 |
| --- | --- | --- | --- |
| **Variables** | Un `.env` por app | Banderas `-e` | `environment:` + un `.env` en la raíz |
| **Migrar y seed** | `pnpm db:migrate`, `pnpm db:seed` | `docker exec api npx prisma …` | `docker compose exec api npx prisma …` |
| **Ver logs** | La terminal de cada app | `docker logs api` | `docker compose logs api` |
| **Apagar** | Ctrl+C | `docker stop …` uno por uno | `docker compose down` |

<p v-click class="lead">Lo que escribimos a mano en la Guía 2, en la Guía 3 queda escrito en un archivo.</p>

---
layout: center
class: section
---

<div class="kicker">Bloque 3</div>

# Docker Compose

---

# ¿Qué es Docker Compose?

<v-clicks>

- Un archivo, `docker-compose.yml`, que **describe** todos los contenedores del proyecto.
- Un comando, `docker compose up`, que crea la red, los volúmenes y los contenedores **en orden**.
- El archivo vive en el repositorio: quien clone el proyecto lo levanta igual que nosotros.
- No reemplaza al `Dockerfile`: el `Dockerfile` **construye una imagen**; Compose **corre varias juntas**.

</v-clicks>

---

# De `docker run` a Compose

| `docker run` | `docker-compose.yml` |
| --- | --- |
| `--name api` | La clave del servicio: `api:` |
| `nexo-api:1.0` | `image: nexo-api:1.0` |
| `docker build ./api` | `build: ./api` |
| `-p 3000:3000` | `ports:` |
| `-e JWT_SECRET=…` | `environment:` |
| `-v uploads:/app/uploads` | `volumes:` |
| `--network shop-net` | **Nada**: Compose crea la red |

---

# YAML en un minuto

<div class="cols">
<div>

```yaml
name: nexo-gamer

services:
  db:
    image: postgres:18-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: shop
```

</div>
<div>

<v-clicks>

- `clave: valor`.
- La **sangría** dice qué va dentro de qué: 2 espacios, **nunca** tabuladores.
- `-` empieza un elemento de una lista.
- Los puertos, entre comillas.
- Un espacio de más o de menos es el error número uno.

</v-clicks>

</div>
</div>

---
class: code-md
---

# Paso a paso: el proyecto y la base

````md magic-move {lines: true}
```yaml [docker-compose.yml]
name: nexo-gamer

services:
  db:
    image: postgres:18-alpine
```
```yaml [docker-compose.yml]
name: nexo-gamer

services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: secreto
      POSTGRES_DB: shop
```
```yaml [docker-compose.yml]
name: nexo-gamer

services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: secreto
      POSTGRES_DB: shop
    volumes:
      - shop-db:/var/lib/postgresql

volumes:
  shop-db:
```
````

<p class="muted small-note"><code>name</code> es el prefijo de todo lo que crea Compose. Cada clave dentro de <code>services</code> es un contenedor.</p>

---

# Los volúmenes en Compose

<v-clicks>

- Se escriben **dos veces**: en el servicio (dónde se monta) y al final, en `volumes:` (que existe).
- No hay `docker volume create`: si el volumen no existe, **Compose lo crea** al hacer `up`.
- Si ya existe, lo reutiliza con sus datos.
- Se llama `nexo-gamer_shop-db`: el prefijo es el `name` del proyecto.

</v-clicks>

---
class: code-md
---

# El `healthcheck`

```yaml {7-11}
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: secreto
      POSTGRES_DB: shop
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U shop -d shop"]
      interval: 5s
      timeout: 3s
      retries: 10
```

<v-clicks>

- “Arrancado” no es “listo”: PostgreSQL tarda unos segundos en aceptar conexiones.
- `pg_isready` pregunta si ya acepta conexiones, cada 5 s, hasta 10 veces.
- `docker compose ps` muestra `starting` y luego `healthy`.

</v-clicks>

---
class: code-md
---

# Paso a paso: Adminer y el API

````md magic-move {lines: true}
```yaml [docker-compose.yml]
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db
```
```yaml [docker-compose.yml]
  api:
    build: ./api
    image: nexo-api:1.0
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads
```
```yaml [docker-compose.yml]
  api:
    build: ./api
    image: nexo-api:1.0
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads
    environment:
      DATABASE_URL: postgresql://shop:secreto@db:5432/shop
      JWT_SECRET: pega-aqui-la-clave-generada
      ADMIN_EMAIL: admin@nexogamer.mx
      ADMIN_PASSWORD: una-clave-segura
    depends_on:
      db:
        condition: service_healthy
```
````

---

# `build`, `image` y `depends_on`

<v-clicks>

- `build: ./api`: Compose puede construir la imagen con el `Dockerfile` de esa carpeta.
- `image: nexo-api:1.0`: el nombre de la imagen. **Si ya existe**, la usa sin construir.
- `depends_on` con `service_healthy`: el API espera a que la base esté `healthy`.
- `depends_on` con una lista (`- db`): solo espera a que el contenedor **arranque**.
- `ADMIN_EMAIL` y `ADMIN_PASSWORD` viven en el servicio: el seed ya no necesita `-e`.

</v-clicks>

---
class: code-md
---

# Paso a paso: la tienda y el panel

<div class="cols">
<div>

```yaml
  shop:
    build:
      context: ./shop
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3000
    image: nexo-shop:1.0
    ports:
      - "3001:3001"
    environment:
      API_URL: http://api:3000
    depends_on:
      - api
```

</div>
<div>

```yaml
  admin:
    build:
      context: ./admin
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3000
    image: nexo-admin:1.0
    ports:
      - "3002:3002"
    environment:
      API_URL: http://api:3000
      COOKIE_SECURE: "false"
    depends_on:
      - api
```

</div>
</div>

<p class="muted small-note"><code>args</code> = <code>--build-arg</code>, al construir. <code>environment</code> = <code>-e</code>, al correr.</p>

---
class: code-sm
---

# Los secretos van en un `.env`

```text [.env (en la raíz del proyecto)]
DB_USER=shop
DB_PASSWORD=secreto
DB_NAME=shop
JWT_SECRET=pega-aqui-la-clave
ADMIN_EMAIL=admin@nexogamer.mx
ADMIN_PASSWORD=una-clave-segura
```

```yaml [docker-compose.yml]
POSTGRES_PASSWORD: ${DB_PASSWORD}
DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

<v-clicks>

- Compose lee el `.env` **de la carpeta del `docker-compose.yml`** y reemplaza cada `${VARIABLE}`.
- El `.env` no se sube a GitHub: ya está en el `.gitignore`.
- La contraseña de la base se escribe **una vez**: `db` y `api` ya no pueden quedar distintas.
- En el `healthcheck` usamos `$${POSTGRES_USER}`: `$$` = “no lo reemplaces tú, déjaselo al contenedor”.

</v-clicks>

---
class: code-sm
zoom: 0.9
---

# El archivo completo

<div class="cols">
<div>

```yaml
name: nexo-gamer

services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - shop-db:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 3s
      retries: 10

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db
```

</div>
<div>

```yaml
  api:
    build: ./api
    image: nexo-api:1.0
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    depends_on:
      db:
        condition: service_healthy

volumes:
  shop-db:
  uploads:
```

</div>
</div>

<p class="muted small-note">Entre <code>api</code> y <code>volumes</code> van <code>shop</code> y <code>admin</code>, como en la diapositiva anterior.</p>

---

# Los comandos de Compose

| Comando | Qué hace |
| --- | --- |
| `docker compose up -d` | Crea y arranca todo en segundo plano |
| `docker compose up -d --build` | Igual, pero vuelve a construir las imágenes |
| `docker compose ps` | Estado de los servicios |
| `docker compose logs api` | Lo que imprimió el servicio `api` |
| `docker compose exec api [comando]` | Un comando dentro del servicio |
| `docker compose down` | Borra contenedores y red. **Los volúmenes se quedan** |
| `docker compose down -v` | Borra también los volúmenes: **se pierden los datos** |

<p v-click class="lead">Se corren en la carpeta del <code>docker-compose.yml</code> y usan el nombre del <strong>servicio</strong>.</p>

---
layout: center
class: section
---

<div class="kicker">🛠 Práctica</div>

# Guía 3

<p class="lead">Limpiamos todo menos las imágenes y escribimos juntos el <code>docker-compose.yml</code>.</p>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# Todo con un comando

```powershell
docker compose up -d
docker compose ps
```

<v-clicks>

- `db` en `healthy`; `adminer`, `api`, `shop` y `admin` en `running`.
- Después de migrar y del seed: la tienda en `localhost:3001` y el panel en `localhost:3002`.
- `docker compose down` y otra vez `up -d`: los productos siguen ahí.

</v-clicks>

---
layout: center
class: section
---

<div class="kicker">Bloque 4</div>

# Docker Hub

---

# Un registro de imágenes

<v-clicks>

- **Docker Hub** es a las imágenes lo que GitHub es al código.
- `postgres:18-alpine` y `adminer` vienen de ahí: por eso `docker run` las descarga solo.
- Si subimos `nexo-api`, `nexo-shop` y `nexo-admin`, cualquiera puede correr nuestro proyecto **sin el código** y sin construir nada.

</v-clicks>

<div v-click>

```text
tu-usuario / nexo-api : 1.0
    │           │        └── etiqueta (versión)
    │           └── repositorio
    └── tu cuenta de Docker Hub
```

</div>

---

<div class="badge badge-practice">🛠 Guía 3 · Docker Hub</div>

# Iniciar sesión, etiquetar y subir

<div class="cols">
<div>

```powershell
docker login
```

```powershell
docker tag nexo-api:1.0 tu-usuario/nexo-api:1.0
docker tag nexo-shop:1.0 tu-usuario/nexo-shop:1.0
docker tag nexo-admin:1.0 tu-usuario/nexo-admin:1.0
```

```powershell
docker push tu-usuario/nexo-api:1.0
docker push tu-usuario/nexo-shop:1.0
docker push tu-usuario/nexo-admin:1.0
```

</div>
<div>

<v-clicks>

- `docker login`: usuario y un **token de acceso** de Docker Hub.
- `docker tag` no copia nada: le pone **otro nombre** a la misma imagen.
- `docker push` sube las capas. Las que ya están en Docker Hub no se vuelven a subir.
- En `hub.docker.com` aparecen los tres repositorios.

</v-clicks>

</div>
</div>

---
class: code-md
---

# Compose con nuestras imágenes de Docker Hub

<div class="cols">
<div>

<p class="title-sm">Antes: construir aquí</p>

```yaml
  api:
    build: ./api
    image: nexo-api:1.0
```

```yaml
  shop:
    build:
      context: ./shop
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3000
    image: nexo-shop:1.0
```

</div>
<div>

<p class="title-sm">Después: descargar de Docker Hub</p>

```yaml
  api:
    image: tu-usuario/nexo-api:1.0
```

```yaml
  shop:
    image: tu-usuario/nexo-shop:1.0
```

```yaml
  admin:
    image: tu-usuario/nexo-admin:1.0
```

</div>
</div>

<p v-click class="lead">Quitamos <code>build</code>: Compose ya no construye, <strong>descarga</strong>. Todo lo demás se queda igual.</p>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# Funciona igual, con imágenes de la nube

```powershell
docker compose down
docker image rm tu-usuario/nexo-api:1.0 tu-usuario/nexo-shop:1.0 tu-usuario/nexo-admin:1.0
docker compose up -d
```

<v-clicks>

- Compose dice `Pulling`: las descarga de Docker Hub.
- Los datos siguen ahí: `down` no borró los volúmenes.
- La tienda y el panel funcionan igual que antes.
- Con las imágenes de un compañero, nuestro proyecto corre **su** versión.

</v-clicks>

---

# Lo que logramos en tres días

| Día | Aprendimos | Con el proyecto |
| --- | --- | --- |
| **1** | Contenedores, imágenes, volúmenes y redes | PostgreSQL y Adminer a mano |
| **2** | El `.dockerignore` y cómo se lee un `Dockerfile` | Nexo Gamer con pnpm y PostgreSQL en Docker |
| **3** | Escribir `Dockerfile`, Docker Compose y Docker Hub | Los cinco servicios con un comando y las imágenes en la nube |

<p v-click class="lead">Con tus proyectos: un <code>Dockerfile</code> por app, un <code>docker-compose.yml</code> en la raíz y las imágenes en Docker Hub.</p>
