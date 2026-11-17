---
layout: center
class: section
---

<div class="kicker">Día 1 · 5 horas</div>

# Fundamentos, volúmenes y redes

<p class="lead">Dominar el ciclo de vida de los contenedores desde la terminal:<br>que los datos no se pierdan y que los contenedores se hablen entre sí.</p>

---

# Agenda de hoy

| Bloque | Tema | Duración | Práctica |
| --- | --- | --- | --- |
| **1** | Introducción a la contenedorización | 1 h | Nuestro primer contenedor |
| **2** | Ejecución interactiva y variables de entorno | 1 h | PostgreSQL desde la terminal |
| **3** | Persistencia de datos con volúmenes | 1.5 h | Destruir el contenedor sin perder datos |
| **4** | Redes en Docker | 1.5 h | PostgreSQL + Adminer por nombre, sin IP |

<!--
Descansos sugeridos: 10 min después del bloque 2 y 10 min después del bloque 3.
-->

---
layout: center
class: section
---

<div class="kicker">Bloque 1</div>

# Introducción a la contenedorización

---

# "En mi máquina sí funciona"

<v-clicks>

- Una laptop tiene Node 24. Otra, Node 18.
- Desarrollamos en Windows. El servidor usa Linux.
- La base de datos está instalada en una laptop, pero no en la del laboratorio.

</v-clicks>

<p v-click class="lead" style="margin-top: 2rem">Un <strong>contenedor</strong> empaqueta la aplicación junto con todo lo que necesita para correr.<br>Si corre en nuestra máquina, corre igual en cualquier otra.</p>

---

# Máquina virtual vs. contenedor

<div class="cols">
<div class="stack">
<div class="title-sm">Máquinas virtuales</div>
<div class="row"><div class="box box-blue">App A</div><div class="box box-blue">App B</div></div>
<div class="row"><div class="box">Librerías</div><div class="box">Librerías</div></div>
<div class="row"><div class="box box-warn">Sistema operativo<small>invitado completo</small></div><div class="box box-warn">Sistema operativo<small>invitado completo</small></div></div>
<div class="box">Hipervisor</div>
<div class="box">Sistema operativo anfitrión</div>
<div class="box box-ghost">Hardware</div>
</div>
<div class="stack" v-click>
<div class="title-sm">Contenedores</div>
<div class="row"><div class="box box-blue">App A</div><div class="box box-blue">App B</div></div>
<div class="row"><div class="box">Librerías</div><div class="box">Librerías</div></div>
<div class="box box-ok">Docker Engine<small>los contenedores comparten el kernel del anfitrión</small></div>
<div class="box">Sistema operativo anfitrión</div>
<div class="box box-ghost">Hardware</div>
</div>
</div>

<!--
La diferencia clave: la VM virtualiza el hardware y carga un sistema operativo completo por cada app. El contenedor solo aísla procesos y comparte el kernel.
-->

---

# ¿Qué cambia en la práctica?

| | Máquina virtual | Contenedor |
| --- | --- | --- |
| **Qué incluye** | Un sistema operativo completo | Solo la app y sus dependencias |
| **Arranque** | Minutos | Segundos |
| **Tamaño** | Gigabytes | Megabytes |
| **Cuántos caben en una laptop** | Unos pocos | Decenas |
| **Aislamiento** | Total (otro kernel) | Por procesos (mismo kernel) |

---

# Arquitectura de Docker

<div class="flow">
<div class="box box-blue" v-click>Cliente<small>el comando <span class="mono">docker</span> en nuestra terminal</small></div>
<div class="arrow" v-click>→</div>
<div class="box box-ok" v-after>Demonio<small><span class="mono">dockerd</span>: el que hace el trabajo</small></div>
<div class="arrow" v-click>→</div>
<div class="stack" v-after>
<div class="box">Imágenes<small>plantillas</small></div>
<div class="box">Contenedores<small>apps corriendo</small></div>
</div>
</div>

<p v-click class="lead" style="margin-top: 2rem; text-align: center">Nosotros hablamos con el <strong>cliente</strong>. El cliente le pide las cosas al <strong>demonio</strong>.<br>En Windows y Mac, Docker Desktop trae los dos.</p>

---

# Imagen vs. contenedor

<div class="cols">
<div class="stack">
<div class="box box-blue" style="padding: 1.5rem">📦 <strong>Imagen</strong><small>Plantilla de solo lectura.<br>Como la receta de un platillo.</small></div>
</div>
<div class="stack" v-click>
<div class="box box-ok">🟢 Contenedor 1<small>el platillo servido</small></div>
<div class="box box-ok">🟢 Contenedor 2</div>
<div class="box box-ok">🟢 Contenedor 3</div>
</div>
</div>

<p v-click class="lead" style="margin-top: 2rem; text-align: center">De <strong>una</strong> imagen podemos crear <strong>muchos</strong> contenedores.</p>

---

# ¿Qué pasa cuando escribimos `docker run`?

```powershell
docker run hello-world
```

<v-clicks>

1. El **cliente** le envía la orden al **demonio**.
2. El demonio busca la imagen `hello-world` en nuestra máquina.
3. Si no la tiene, la **descarga** de Docker Hub.
4. Crea un **contenedor** a partir de la imagen y lo arranca.

</v-clicks>

---

# El ciclo de vida de un contenedor

<div class="flow">
<div class="box box-blue mono" v-click>docker run</div>
<div class="arrow" v-after>→</div>
<div class="box box-ok" v-after>En ejecución</div>
<div class="arrow" v-click>→</div>
<div class="box box-blue mono" v-after>docker stop</div>
<div class="arrow" v-after>→</div>
<div class="box box-warn" v-after>Detenido</div>
<div class="arrow" v-click>→</div>
<div class="box box-blue mono" v-after>docker rm</div>
<div class="arrow" v-after>→</div>
<div class="box box-ghost" v-after>Eliminado</div>
</div>

<p v-click class="lead" style="margin-top: 2rem; text-align: center">Un contenedor detenido <strong>sigue existiendo</strong> hasta que lo eliminas.</p>

---

# Nuestros primeros 6 comandos

| Comando | Qué hace |
| --- | --- |
| `docker run [imagen]` | Crea y arranca un contenedor |
| `docker ps` | Lista los contenedores en ejecución (`-a` para ver todos) |
| `docker stop [contenedor]` | Detiene un contenedor |
| `docker rm [contenedor]` | Elimina un contenedor detenido |
| `docker images` | Lista las imágenes descargadas |
| `docker rmi [imagen]` | Elimina una imagen |

---

<div class="badge badge-practice">🛠 Práctica 1</div>

# Nuestro primer contenedor

```powershell
docker run hello-world
```

```powershell
docker ps
docker ps -a
docker images
```

<p v-click class="lead">¿Por qué <code>docker ps</code> sale vacío y <code>docker ps -a</code> no?</p>

<!--
Respuesta: hello-world imprime su mensaje y termina. El contenedor quedó detenido, no eliminado.
-->

---

<div class="badge badge-practice">🛠 Práctica 1</div>

# Ahora limpiamos lo que creamos

Copia el nombre o el ID que te mostró `docker ps -a`:

```powershell
docker rm [nombre-o-id]
docker rmi hello-world
```

Comprueba que ya no queda nada:

```powershell
docker ps -a
docker images
```

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# Nuestro primer contenedor

Al correr `docker run hello-world`:

```text
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
...
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

<v-clicks>

- **"Unable to find image... locally"**: no la tenías, así que la descargó.
- **"Hello from Docker!"**: el contenedor arrancó, hizo su trabajo y terminó.

</v-clicks>

---
layout: center
class: section
---

<div class="kicker">Bloque 2</div>

# Ejecución interactiva y variables de entorno

---

# Un comando que va creciendo

````md magic-move
```powershell
docker run nginx:alpine
```
```powershell
docker run -d nginx:alpine
```
```powershell
docker run -d -p 8080:80 nginx:alpine
```
```powershell
docker run -d -p 8080:80 --name web nginx:alpine
```
```powershell
docker run -d `
  -p 8080:80 `
  --name web `
  nginx:alpine
```
````

<!--
Paso 1: se queda pegado a la terminal. Paso 2: -d lo manda al fondo. Paso 3: -p abre el puerto. Paso 4: --name le pone nombre. Paso 5: el mismo comando en varias líneas.
-->

---

# Las 4 banderas esenciales

| Bandera | Qué hace | Ejemplo |
| --- | --- | --- |
| `-d` | Corre en segundo plano (*detached*) y nos devuelve la terminal | `docker run -d nginx:alpine` |
| `-p` | Conecta un puerto de nuestra máquina con uno del contenedor | `-p 8080:80` |
| `--name` | Le pone un nombre al contenedor | `--name web` |
| `-e` | Define una variable de entorno dentro del contenedor | `-e POSTGRES_PASSWORD=secreto` |

<div v-click style="margin-top: 1.5rem">
<div class="badge badge-warn">Ojo en Windows</div>

Para partir un comando en varias líneas: en **PowerShell** se usa el acento grave `` ` ``. En Linux y Mac se usa `\`.

</div>

---

# `-p`: el orden importa

<div class="flow">
<div class="box">El navegador<small class="mono">localhost:8080</small></div>
<div class="arrow">→</div>
<div class="box box-blue">Puerto 8080<small>de nuestra máquina</small></div>
<div class="arrow">→</div>
<div class="box box-ok">Puerto 80<small>del contenedor</small></div>
</div>

<p class="lead mono" style="margin-top: 2.5rem; text-align: center; font-size: 1.6rem">-p <span style="color: var(--docker-soft)">8080</span>:<span style="color: var(--ok)">80</span></p>

<p class="lead" style="text-align: center">Primero <strong style="color: var(--docker-soft)">nuestra máquina</strong>, después <strong style="color: var(--ok)">el contenedor</strong>.</p>

---

# `-e`: configurar sin tocar la imagen

<v-clicks>

- La imagen de PostgreSQL es **la misma** para todo el mundo.
- Lo que cambia es la **configuración**: contraseña, usuario, nombre de la base.
- Esa configuración se pasa con **variables de entorno**.

</v-clicks>

<div v-click>

```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  postgres:18-alpine
```

</div>

---

# Inspección y depuración

| Comando | Para qué sirve |
| --- | --- |
| `docker logs [contenedor]` | Ver lo que imprimió el contenedor |
| `docker exec -it [contenedor] sh` | Entrar al contenedor con una terminal |
| `docker inspect [contenedor]` | Ver toda su configuración (red, puertos, volúmenes) |

<p v-click class="lead" style="margin-top: 1.5rem">Si algo falla, el primer paso <strong>siempre</strong> es <code>docker logs</code>.</p>

---

<div class="badge badge-practice">🛠 Práctica 2</div>

# PostgreSQL desde la terminal

<div class="cols">
<div>

Levanta la base de datos:

```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -p 5432:5432 `
  postgres:18-alpine
```

</div>
<div>

Revisa que esté viva:

```powershell
docker ps
docker logs db
```

</div>
</div>

<p class="muted small-note">Si el puerto 5432 ya está ocupado en tu máquina, usa <code>-p 5433:5432</code>.</p>

---

<div class="badge badge-practice">🛠 Práctica 2</div>

# Entra al contenedor

<div class="cols">
<div>

Abre el cliente de PostgreSQL **dentro** del contenedor:

```powershell
docker exec -it db psql -U shop
```

</div>
<div>

Ya adentro, escribe:

```sql
SELECT version();
\q
```

</div>
</div>

---

<div class="badge badge-practice">🛠 Práctica 2</div>

# Explora por dentro

<div class="cols">
<div>

Entra con una terminal y mira qué hay:

```powershell
docker exec -it db sh
```

```sh
ls /
env
exit
```

</div>
<div>

Ahora mira toda su configuración desde afuera:

```powershell
docker inspect db
```

</div>
</div>

<p v-click class="lead">Busca en la salida de <code>env</code> la variable <code>POSTGRES_PASSWORD</code>. Es la que pasaste con <code>-e</code>.</p>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# PostgreSQL desde la terminal

En `docker logs db`, casi al final:

```text
database system is ready to accept connections
```

En `SELECT version();`:

```text
PostgreSQL 18.x on x86_64-pc-linux-musl ...
```

<p v-click class="lead">Tenemos PostgreSQL corriendo y <strong>no instalamos nada</strong> en nuestra máquina.</p>

---
layout: center
class: section
---

<div class="kicker">Bloque 3</div>

# Persistencia de datos con volúmenes

---

# El problema: los contenedores son efímeros

<div class="flow">
<div class="stack" v-click>
<div class="box box-ok">Contenedor <span class="mono">db</span><small>las tablas y los datos viven aquí adentro</small></div>
</div>
<div class="arrow" v-click>→</div>
<div class="box box-blue mono" v-after>docker rm db</div>
<div class="arrow" v-click>→</div>
<div class="box box-warn" v-after>💥 Datos perdidos</div>
</div>

<p v-click class="lead" style="margin-top: 2rem; text-align: center">Todo lo que un contenedor escribe se guarda <strong>dentro de él</strong>.<br>Si borramos el contenedor, se va con todo.</p>

---

<div class="badge badge-practice">🛠 Práctica 3 · Parte A</div>

# Pierde datos a propósito

<div class="cols">
<div>

Entra a PostgreSQL:

```powershell
docker exec -it db psql -U shop
```

Crea la tabla y guarda los primeros productos de la tienda.

</div>
<div>

```sql
CREATE TABLE productos (
  id serial PRIMARY KEY,
  nombre text NOT NULL,
  categoria text NOT NULL,
  precio integer NOT NULL
);
INSERT INTO productos (nombre, categoria, precio) VALUES
  ('ASUS ROG Strix G16 Gaming Laptop', 'Laptops', 34999),
  ('NVIDIA GeForce RTX 5070 Graphics Card', 'Components', 13499),
  ('Samsung Odyssey G5 27 Gaming Monitor', 'Monitors', 5499);
SELECT * FROM productos;
\q
```

</div>
</div>

---

<div class="badge badge-practice">🛠 Práctica 3 · Parte A</div>

# Destruye y vuelve a crear

<div class="cols">
<div>

Elimina el contenedor y levanta uno nuevo, igual que antes:

```powershell
docker stop db
docker rm db
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  postgres:18-alpine
```

</div>
<div>

Busca tu tabla:

```powershell
docker exec -it db psql -U shop `
  -c "SELECT nombre, precio FROM productos;"
```

</div>
</div>

<p v-click class="lead">¿Qué respondió? ¿Por qué?</p>

<!--
Respuesta esperada: ERROR: relation "productos" does not exist. El contenedor nuevo empezó con una base de datos vacía.
-->

---

# 3 tipos de almacenamiento

<div class="cols-3">
<div class="box box-blue" v-click style="padding: 1rem">
<strong>Volume</strong>
<small>Docker lo administra.<br>No nos importa dónde está en el disco.</small>
<small class="mono" style="margin-top: 0.5rem">-v shop-db:/ruta</small>
</div>
<div class="box box-ok" v-click style="padding: 1rem">
<strong>Bind mount</strong>
<small>Una carpeta de <em>nuestra</em> máquina<br>conectada al contenedor.</small>
<small class="mono" style="margin-top: 0.5rem">-v C:\mi\carpeta:/ruta</small>
</div>
<div class="box box-warn" v-click style="padding: 1rem">
<strong>tmpfs</strong>
<small>Vive en la memoria RAM.<br>Se borra al detener el contenedor.</small>
<small class="mono" style="margin-top: 0.5rem">--tmpfs /ruta</small>
</div>
</div>

---

# ¿Cuál uso?

| Tipo | Úsalo para | Ejemplo |
| --- | --- | --- |
| **Volume** | Datos que deben sobrevivir | Los datos de PostgreSQL |
| **Bind mount** | Editar código y verlo reflejado en el contenedor | La carpeta del código (lo veremos el Día 3) |
| **tmpfs** | Datos temporales que no deben tocar el disco | Archivos de caché o secretos temporales |

---

# Comandos de `docker volume`

| Comando | Qué hace |
| --- | --- |
| `docker volume create [nombre]` | Crea un volumen |
| `docker volume ls` | Lista los volúmenes |
| `docker volume inspect [nombre]` | Muestra sus detalles |
| `docker volume rm [nombre]` | Elimina un volumen |
| `docker volume prune` | Elimina **todos** los volúmenes que nadie usa |

<div v-click style="margin-top: 1rem">
<div class="badge badge-warn">Cuidado</div>

`prune` no pregunta volumen por volumen. Si lo corres con una base de datos detenida, la pierdes.

</div>

---

# Conectar un volumen al contenedor

````md magic-move
```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  postgres:18-alpine
```
```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```
````

<p v-click class="lead mono" style="margin-top: 1.5rem; text-align: center; font-size: 1.3rem">-v <span style="color: var(--docker-soft)">shop-db</span>:<span style="color: var(--ok)">/var/lib/postgresql</span></p>

<p v-after class="lead" style="text-align: center"><strong style="color: var(--docker-soft)">Nombre del volumen</strong> : <strong style="color: var(--ok)">carpeta dentro del contenedor</strong></p>

---

<div class="badge badge-warn">⚠️ Trampa de PostgreSQL 18</div>

# La ruta del volumen cambió

| Versión | Ruta donde se monta el volumen |
| --- | --- |
| PostgreSQL 17 y anteriores | `/var/lib/postgresql/data` |
| **PostgreSQL 18 en adelante** | `/var/lib/postgresql` |

<p v-click class="lead" style="margin-top: 1.5rem">Casi todos los tutoriales en internet usan la ruta vieja.<br>Si la copiamos con la versión 18, <strong>los datos no se guardan en el volumen</strong>.</p>

---

<div class="badge badge-practice">🛠 Práctica 3 · Parte B</div>

# Ahora sí: datos que sobreviven

<div class="cols">
<div>

Borra el contenedor anterior y crea el volumen:

```powershell
docker stop db
docker rm db
docker volume create shop-db
```

</div>
<div>

Levanta PostgreSQL con el volumen:

```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```

</div>
</div>

<p class="lead">Vuelve a crear la tabla <code>productos</code> con sus 3 productos (los mismos pasos de la Parte A).</p>

---

<div class="badge badge-practice">🛠 Práctica 3 · Parte B</div>

# La prueba de fuego

<div class="cols">
<div>

Destruye el contenedor y créalo otra vez **con el mismo volumen**:

```powershell
docker stop db
docker rm db
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```

</div>
<div>

Busca tus datos:

```powershell
docker exec -it db psql -U shop `
  -c "SELECT nombre, precio FROM productos;"
```

</div>
</div>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# Los datos siguen ahí

<div class="cols">
<div>

En la consulta:

```text
                 nombre                | precio
---------------------------------------+--------
 ASUS ROG Strix G16 Gaming Laptop      |  34999
 NVIDIA GeForce RTX 5070 Graphics Card |  13499
 Samsung Odyssey G5 27 Gaming Monitor  |   5499
(3 rows)
```

</div>
<div>

En `docker volume ls`:

```text
DRIVER    VOLUME NAME
local     shop-db
```

</div>
</div>

<p v-click class="lead">El contenedor es <strong>desechable</strong>. El volumen es lo que <strong>importa</strong>.</p>

---
layout: center
class: section
---

<div class="kicker">Bloque 4</div>

# Redes en Docker

---

# ¿Cómo se comunican los contenedores?

Docker conecta los contenedores con **drivers de red**:

<div class="cols-3">
<div class="box box-blue" v-click style="padding: 1rem">
<strong class="mono">bridge</strong>
<small>Una red privada dentro de nuestra máquina.<br>Es la que se usa casi siempre.</small>
</div>
<div class="box box-ok" v-click style="padding: 1rem">
<strong class="mono">host</strong>
<small>El contenedor usa directamente<br>la red de nuestra máquina, sin aislamiento.</small>
</div>
<div class="box box-warn" v-click style="padding: 1rem">
<strong class="mono">none</strong>
<small>Sin red.<br>El contenedor queda incomunicado.</small>
</div>
</div>

---

# El problema de las direcciones IP

<v-clicks>

- Cada contenedor recibe una IP interna, por ejemplo `172.17.0.2`.
- Esa IP **cambia** cada vez que recreamos el contenedor.
- Si nuestra app guarda la IP de la base de datos, mañana ya no funciona.

</v-clicks>

<p v-click class="lead" style="margin-top: 2rem">Solución: una <strong>red personalizada</strong>, donde los contenedores se encuentran <strong>por su nombre</strong>.</p>

---

# Redes personalizadas y DNS interno

```powershell
docker network create shop-net
```

<div class="net" style="margin-top: 2rem" v-click>
<div class="net-label">shop-net</div>
<div class="flow" style="margin-top: 0">
<div class="box box-ok">adminer<small>gestor visual</small></div>
<div class="arrow">→</div>
<div class="box mono" style="border: none; background: none; color: var(--docker-soft)">db:5432</div>
<div class="arrow">→</div>
<div class="box box-blue">db<small>PostgreSQL</small></div>
</div>
</div>

<p v-click class="lead" style="margin-top: 1.5rem; text-align: center">Dentro de la red, el <strong>nombre del contenedor</strong> funciona como dirección.<br>Docker trae un <strong>DNS interno</strong> que traduce <code>db</code> a la IP correcta.</p>

---

# Conectar un contenedor a la red

````md magic-move
```powershell
docker run -d `
  --name db `
  -e POSTGRES_USER=shop `
  -e POSTGRES_PASSWORD=secreto `
  -e POSTGRES_DB=shop `
  -v shop-db:/var/lib/postgresql `
  postgres:18-alpine
```
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
````

<p v-click class="lead">Ojo: PostgreSQL <strong>no lleva</strong> <code>-p</code>. Solo Adminer necesita hablarle, y están en la misma red.</p>

---

<div class="badge badge-practice">🛠 Práctica 4</div>

# PostgreSQL + Adminer

<div class="cols">
<div>

Crea la red y quita el contenedor anterior:

```powershell
docker network create shop-net
docker stop db
docker rm db
```

</div>
<div>

Levanta PostgreSQL dentro de la red:

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

</div>
</div>

---

<div class="badge badge-practice">🛠 Práctica 4</div>

# Levanta Adminer en la misma red

<div class="cols">
<div>

```powershell
docker run -d `
  --name adminer `
  --network shop-net `
  -p 8080:8080 `
  adminer
```

Abre <span class="mono">localhost:8080</span> en tu navegador.

</div>
<div>

| Campo | Valor |
| --- | --- |
| Sistema | PostgreSQL |
| Servidor | `db` |
| Usuario | `shop` |
| Contraseña | `secreto` |
| Base de datos | `shop` |

</div>
</div>

---

<div class="badge badge-check">✅ ¿Qué debemos ver?</div>

# La tabla, ahora con interfaz

<v-clicks>

- Adminer entra sin errores usando `db` como servidor.
- En la lista de tablas aparece **`productos`**, con los productos que guardamos en el bloque 3.
- En ningún momento escribimos una dirección IP.

</v-clicks>

<div class="flow" v-click>
<div class="box">El navegador<small class="mono">localhost:8080</small></div>
<div class="arrow">→</div>
<div class="net">
<div class="net-label">shop-net</div>
<div class="flow" style="margin-top: 0">
<div class="box box-ok">adminer</div>
<div class="arrow">→</div>
<div class="box box-blue">db</div>
<div class="arrow">→</div>
<div class="box box-ghost">volumen shop-db</div>
</div>
</div>
</div>

---

# Lo que logramos hoy

<v-clicks>

- Entendemos la diferencia entre una **máquina virtual** y un **contenedor**.
- Manejamos el ciclo de vida: `run`, `ps`, `stop`, `rm`, `images`, `rmi`.
- Configuramos contenedores con `-d`, `-p`, `--name` y `-e`.
- Depuramos con `logs`, `exec` e `inspect`.
- Guardamos datos en un **volumen** que sobrevive al contenedor.
- Conectamos contenedores **por nombre** en una red personalizada.

</v-clicks>

---

# Ya tenemos 2 de los 5 servicios

<div class="flow">
<div class="box">El navegador</div>
<div class="arrow">→</div>
<div class="stack">
<div class="box box-ghost">shop<small>Next.js · :3001</small></div>
<div class="box box-ghost">admin<small>Next.js · :3002</small></div>
</div>
<div class="arrow">→</div>
<div class="box box-ghost">api<small>NestJS + Prisma · :3000</small></div>
<div class="arrow">→</div>
<div class="stack">
<div class="box box-ok">db<small>postgres:18-alpine</small></div>
<div class="box box-ok">adminer<small>gestor visual</small></div>
</div>
</div>

<p v-click class="lead" style="margin-top: 2rem; text-align: center">Hoy los levantamos <strong>a mano</strong>, comando por comando.<br>El Día 3 los vamos a reconocer en el <code>docker-compose.yml</code>.</p>

---

# Limpieza del día

```powershell
docker stop adminer db
docker rm adminer db
docker network rm shop-net
```

El volumen `shop-db` se queda: ahí están los datos.

Si quieres borrarlo también:

```powershell
docker volume rm shop-db
```

---

<div class="badge badge-warn">📌 Para mañana</div>

# Lo que necesitamos para mañana

1. Una cuenta de **Docker Hub** creada, con usuario y contraseña a la mano.
2. El repositorio del taller clonado y con dependencias instaladas, para detectar problemas hoy y no mañana:

```powershell
git clone https://github.com/[usuario]/workshop-docker.git
cd workshop-docker/api
pnpm install
cd ../shop
pnpm install
cd ../admin
pnpm install
```

---
layout: center
class: text-center
---

<div class="kicker">Mañana · Día 2</div>

# Del código a una imagen

<p class="lead">Dockerfile, multi-stage builds y Docker Hub</p>
