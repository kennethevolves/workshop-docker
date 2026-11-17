---
theme: default
title: Taller de Docker
info: |
  Empaquetamiento y ejecución de apps en un entorno aislado con Docker.
  Taller de 15 horas, 17 al 19 de noviembre.
colorSchema: light
transition: slide-left
mdc: true
fonts:
  sans: Geist
  mono: Geist Mono
layout: center
class: text-center
---

<div class="kicker">Taller · 17 al 19 de noviembre</div>

# 🐋 Docker

<p class="lead">Empaquetamiento y ejecución de apps en un entorno aislado</p>

<p class="muted mono" style="margin-top: 3rem; font-size: 0.8rem">Ing. Kenneth Gael Iuit Rios</p>

<!--
Bienvenida. Antes de empezar: confirmar que todos tienen Docker Desktop abierto y la ballena en verde.
-->

---

# El plan de los 3 días

| Día   | Tema                           | Al terminar tendremos                                         |
| ----- | ------------------------------ | ----------------------------------------------------------- |
| **1** | Fundamentos, volúmenes y redes | PostgreSQL persistente conectado por red a un gestor visual |
| **2** | `Dockerfile` y Docker Hub      | Imágenes de NestJS y Next.js publicadas en la nube          |
| **3** | Docker Compose y Prisma        | El sistema completo levantado con un solo comando           |

<p v-click class="lead" style="margin-top: 2rem">Cada bloque: un poco de teoría → <strong>práctica</strong> → revisamos qué debemos ver.</p>

---

# El proyecto: Nexo Gamer

<p class="lead">Una tienda en línea de laptops y componentes, con su panel de administración.</p>

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
<div class="stack">
<div class="box box-ok">db<small>postgres:18-alpine</small></div>
<div class="box box-ok">adminer<small>gestor visual</small></div>
</div>
</div>

<div v-click style="margin-top: 1.5rem">

| Día | Qué hacemos con el proyecto |
| --- | --- |
| **1** | Levantamos `db` y `adminer` a mano, con comandos |
| **2** | Construimos y publicamos las imágenes de `api`, `shop` y `admin` |
| **3** | Levantamos los 5 servicios juntos con un solo archivo |

</div>

---
src: ./pages/dia-1.md
---
