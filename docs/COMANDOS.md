# Manual de comandos · Taller de Docker

Todos los comandos del taller en un solo lugar, ordenados por día. Cópialos tal cual y cambia solo lo que va entre corchetes.

## Cómo usar este manual

- **Corchetes:** `[contenedor]`, `[imagen]` o `[usuario]` son valores que tú cambias. No escribas los corchetes.
- **Comandos largos:** están partidos en varias líneas para que se lean mejor. En **PowerShell** (Windows) cada línea termina con el acento grave `` ` ``. En **Linux, Mac o Git Bash**, cámbialo por `\`.
- **Nombre o ID:** donde dice `[contenedor]` puedes usar su nombre (`db`) o los primeros caracteres de su ID (`a3f9`).
- **Ayuda de cualquier comando:** agrega `--help`, por ejemplo `docker run --help`.

Antes de empezar, revisa que Docker esté funcionando:

```powershell
docker version
docker info
```

Si `docker version` no muestra la sección **Server**, abre Docker Desktop y espera a que la ballena esté en verde.

## Día 1 · Fundamentos, volúmenes y redes

### Ciclo de vida de un contenedor

| Comando | Qué hace |
| --- | --- |
| `docker run [imagen]` | Crea y arranca un contenedor (descarga la imagen si no la tienes) |
| `docker ps` | Lista los contenedores en ejecución |
| `docker ps -a` | Lista todos, también los detenidos |
| `docker stop [contenedor]` | Detiene un contenedor |
| `docker start [contenedor]` | Vuelve a arrancar un contenedor detenido |
| `docker rm [contenedor]` | Elimina un contenedor detenido |
| `docker rm -f [contenedor]` | Lo detiene y lo elimina en un solo paso |
| `docker images` | Lista las imágenes descargadas |
| `docker pull [imagen]` | Descarga una imagen sin crear contenedor |
| `docker rmi [imagen]` | Elimina una imagen |

### Banderas de `docker run`

| Bandera | Qué hace | Ejemplo |
| --- | --- | --- |
| `-d` | Corre en segundo plano y te devuelve la terminal | `docker run -d nginx:alpine` |
| `-p` | Conecta un puerto de tu máquina con uno del contenedor (`máquina:contenedor`) | `-p 8080:80` |
| `--name` | Le pone nombre al contenedor | `--name web` |
| `-e` | Define una variable de entorno | `-e POSTGRES_PASSWORD=secreto` |
| `-v` | Conecta un volumen o una carpeta (`volumen:ruta`) | `-v shop-db:/var/lib/postgresql` |
| `--network` | Conecta el contenedor a una red | `--network shop-net` |
| `--rm` | Borra el contenedor en cuanto termina | `docker run --rm hello-world` |

### Inspección y depuración

| Comando | Para qué sirve |
| --- | --- |
| `docker logs [contenedor]` | Ver lo que imprimió el contenedor |
| `docker logs -f [contenedor]` | Seguir los logs en vivo (sal con Ctrl+C) |
| `docker exec -it [contenedor] sh` | Abrir una terminal dentro del contenedor (sal con `exit`) |
| `docker inspect [contenedor]` | Ver toda su configuración: red, puertos, volúmenes, variables |

### Volúmenes

| Comando | Qué hace |
| --- | --- |
| `docker volume create [nombre]` | Crea un volumen |
| `docker volume ls` | Lista los volúmenes |
| `docker volume inspect [nombre]` | Muestra sus detalles |
| `docker volume rm [nombre]` | Elimina un volumen (sus datos se pierden) |
| `docker volume prune` | Elimina **todos** los volúmenes que ningún contenedor usa |

**Ojo con PostgreSQL 18:** el volumen se monta en `/var/lib/postgresql`. La ruta vieja `/var/lib/postgresql/data` es de la versión 17 y anteriores; con la 18 tus datos no se guardan en el volumen.

### Redes

| Comando | Qué hace |
| --- | --- |
| `docker network create [nombre]` | Crea una red personalizada (driver `bridge`) |
| `docker network ls` | Lista las redes |
| `docker network inspect [nombre]` | Muestra qué contenedores están conectados |
| `docker network connect [red] [contenedor]` | Conecta un contenedor que ya existe a una red |
| `docker network rm [nombre]` | Elimina una red |

Dentro de una red personalizada, cada contenedor encuentra a los demás **por su nombre**. Nunca uses su dirección IP: cambia cada vez que recreas el contenedor.

### Receta completa: PostgreSQL + Adminer

1. Crea la red y el volumen:

```powershell
docker network create shop-net
docker volume create shop-db
```

2. Levanta PostgreSQL dentro de la red, con el volumen:

```powershell
docker run -d `
  --name db `
  --network shop-net `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```

3. Levanta Adminer en la misma red:

```powershell
docker run -d `
  --name adminer `
  --network shop-net `
  -p 8080:8080 `
  adminer
```

4. Abre `http://localhost:8080` y entra con estos datos:

| Campo | Valor |
| --- | --- |
| Sistema | PostgreSQL |
| Servidor | `db` |
| Usuario | `shop` |
| Contraseña | `secreto` |
| Base de datos | `shop` |

Para entrar a PostgreSQL desde la terminal:

```powershell
docker exec -it db psql -U shop
```

Dentro de `psql`: `\dt` lista las tablas y `\q` sale.

## Día 2 · Dockerfile y Docker Hub

### Preparar el proyecto

```powershell
git clone https://github.com/kennethevolves/workshop-docker.git
cd workshop-docker
```

| Comando | Qué hace |
| --- | --- |
| `corepack enable` | Activa pnpm usando la versión que pide cada `package.json` |
| `pnpm install` | Instala las dependencias (crea `node_modules`) |
| `pnpm install --frozen-lockfile` | Instala exactamente lo que dice `pnpm-lock.yaml`; falla si no coincide con `package.json` |
| `git switch solucion/dia-2` | Te pone al corriente con la solución del día (si te atrasaste) |

Corre `pnpm install` por separado dentro de `api/`, `shop/` y `admin/`: son tres proyectos independientes.

### Construir imágenes

| Comando | Qué hace |
| --- | --- |
| `docker build -t [nombre]:[versión] [carpeta]` | Construye una imagen a partir del `Dockerfile` de esa carpeta |
| `docker build --no-cache -t [nombre] [carpeta]` | Construye desde cero, sin reutilizar capas |
| `docker build --build-arg [VARIABLE]=[valor] ...` | Pasa un valor que solo existe mientras se construye |
| `docker history [imagen]` | Muestra las capas de una imagen y cuánto pesa cada una |
| `docker image ls` | Lista las imágenes con su tamaño |
| `docker image prune` | Borra las imágenes sin nombre que quedaron de builds anteriores |

Las tres imágenes del proyecto, desde la raíz de `workshop-docker`:

```powershell
docker build -t nexo-api:1.0 ./api
docker build -t nexo-shop:1.0 ./shop
docker build -t nexo-admin:1.0 ./admin
docker image ls
```

El último argumento (`./api`) es el **contexto de build**: la carpeta que Docker puede ver al construir. Lo que esté en su `.dockerignore` (`node_modules`, `.env`, `dist`, `.next`) no entra.

### Publicar en Docker Hub

1. Inicia sesión (usuario y contraseña o *Access Token* de Docker Hub):

```powershell
docker login
```

2. Ponle a cada imagen el nombre que espera Docker Hub, `[usuario]/[repositorio]:[versión]`:

```powershell
docker tag nexo-api:1.0 [usuario]/nexo-api:1.0
docker tag nexo-shop:1.0 [usuario]/nexo-shop:1.0
docker tag nexo-admin:1.0 [usuario]/nexo-admin:1.0
```

3. Súbelas:

```powershell
docker push [usuario]/nexo-api:1.0
docker push [usuario]/nexo-shop:1.0
docker push [usuario]/nexo-admin:1.0
```

### Prueba cruzada

Descarga y corre la tienda que subió tu compañero, con el nombre que tú quieras:

```powershell
docker run -d `
  --name shop-companero `
  -p 3005:3001 `
  -e API_URL=http://host.docker.internal:3000 `
  -e STORE_NAME="Tienda de [compañero]" `
  [usuario-del-compañero]/nexo-shop:1.0
```

`host.docker.internal` es tu máquina vista desde un contenedor: así la tienda de tu compañero usa **tu** API (publicado en el puerto 3000) y muestra tus productos. `docker run` descarga la imagen si no la tienes.

Abre `http://localhost:3005`. Es la misma imagen que construyó él; solo cambió la variable de entorno.

| Comando | Qué hace |
| --- | --- |
| `docker logout` | Cierra la sesión de Docker Hub en esta computadora |

En las computadoras del laboratorio, corre `docker logout` al terminar el día.

## Día 3 · Docker Compose y Prisma

Todos estos comandos se corren en la raíz de `workshop-docker`, donde está el `docker-compose.yml`. Compose lee el archivo `.env` de esa misma carpeta.

### Los servicios del proyecto

| Servicio | Imagen | Puerto en tu máquina | Volumen |
| --- | --- | --- | --- |
| `db` | `postgres:18-alpine` | — | `db-data` (la base de datos) |
| `adminer` | `adminer` | 8080 | — |
| `api` | `nexo-api` | 3000 | `uploads` (las fotos de los productos) |
| `shop` | `nexo-shop` | 3001 | — |
| `admin` | `nexo-admin` | 3002 | — |

### Comandos maestros

| Comando | Qué hace |
| --- | --- |
| `docker compose up -d` | Levanta todos los servicios en segundo plano |
| `docker compose up -d --build` | Reconstruye las imágenes y luego levanta todo |
| `docker compose ps` | Muestra el estado de cada servicio (incluido `healthy`) |
| `docker compose logs -f` | Sigue los logs de todos los servicios (sal con Ctrl+C) |
| `docker compose logs -f [servicio]` | Sigue los logs de un solo servicio, por ejemplo `api` |
| `docker compose stop` | Detiene los servicios sin borrarlos |
| `docker compose down` | Detiene y borra contenedores y red. **Los volúmenes se quedan** |
| `docker compose down -v` | Lo mismo, pero **también borra los volúmenes**: pierdes la base de datos y las fotos |
| `docker compose restart [servicio]` | Reinicia un servicio |
| `docker compose exec [servicio] sh` | Abre una terminal dentro de un servicio |
| `docker compose config` | Muestra el archivo final, con las variables del `.env` ya sustituidas |

`docker compose config` es lo primero que debes correr cuando una variable no llega a su contenedor.

### Prisma dentro de los contenedores

Con los servicios arriba:

```powershell
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

| Comando | Qué hace |
| --- | --- |
| `prisma migrate deploy` | Aplica a la base de datos las migraciones que aún no tiene. No crea migraciones nuevas |
| `prisma db seed` | Crea el usuario administrador y los 14 productos de la tienda |

Si la tienda dice que no hay productos, te faltó el seed.

### Dentro de la red de Compose

| Quién se conecta | A dónde | Dirección |
| --- | --- | --- |
| El API | PostgreSQL | `postgresql://shop:...@db:5432/shop` (nombre del servicio) |
| El servidor de `shop` y de `admin` | El API | `http://api:3000` (variable `API_URL`) |
| Tu navegador | Las fotos de los productos | `http://localhost:3000/uploads/...` (variable `NEXT_PUBLIC_API_URL`) |

El navegador corre en tu máquina, fuera de Docker, así que no conoce los nombres de los servicios.

## Limpieza

| Comando | Qué borra |
| --- | --- |
| `docker container prune` | Todos los contenedores detenidos |
| `docker image prune` | Las imágenes sin nombre (`<none>`) |
| `docker image prune -a` | Todas las imágenes que ningún contenedor usa |
| `docker volume prune` | Los volúmenes que ningún contenedor usa. **Sus datos se pierden** |
| `docker network prune` | Las redes personalizadas sin contenedores |
| `docker system prune` | Contenedores detenidos, redes sin uso, imágenes sin nombre y caché de build |
| `docker system df` | No borra nada: muestra cuánto espacio ocupa Docker |

Todos piden confirmación. Léela antes de escribir `y`.

## Problemas frecuentes

| Mensaje o síntoma | Qué pasa | Qué hacer |
| --- | --- | --- |
| `Cannot connect to the Docker daemon` / `error during connect` | Docker Desktop está cerrado o arrancando | Abre Docker Desktop y espera la ballena en verde |
| `port is already allocated` | Otro programa o contenedor usa ese puerto | Cambia el puerto de tu máquina: `-p 5433:5432` |
| `The container name "/db" is already in use` | Ya existe un contenedor con ese nombre, aunque esté detenido | `docker rm -f db` y vuelve a correr el comando |
| El contenedor aparece en `docker ps -a` con estado `Exited` | Arrancó y se cayó | `docker logs [contenedor]` para ver por qué |
| PostgreSQL se cae al arrancar | Falta `POSTGRES_PASSWORD` | Agrega `-e POSTGRES_PASSWORD=...` |
| Adminer no encuentra el servidor `db` | Los contenedores no están en la misma red | Revisa con `docker network inspect shop-net` |
| Los datos se borran aunque usas volumen | Ruta de PostgreSQL 17 en PostgreSQL 18 | Monta en `/var/lib/postgresql` |
| `password authentication failed for user "shop"` | El volumen de PostgreSQL se creó con otras credenciales: las variables `POSTGRES_*` solo se usan la primera vez | Usa las credenciales originales o borra el contenedor y el volumen y créalos de nuevo |
| El panel responde "Correo o contraseña incorrectos" | No se corrió el seed, o se corrió con otra contraseña | `docker exec -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... api npx prisma db seed` |
| `denied: requested access to the resource is denied` al hacer push | No iniciaste sesión o el nombre no empieza con tu usuario | `docker login` y `docker tag ... [usuario]/[repositorio]:[versión]` |
| `ERR_PNPM_OUTDATED_LOCKFILE` en el build | `pnpm-lock.yaml` no coincide con `package.json` | Corre `pnpm install` en tu máquina y vuelve a construir |
| En Windows: comando partido que falla | Usaste `\` en lugar del acento grave | En PowerShell cada línea termina en `` ` `` |
