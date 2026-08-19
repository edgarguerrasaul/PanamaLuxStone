# Roadmap — Ecommerce Panamá LuxeStone

Este documento es el mapa completo del proyecto: qué ya está hecho, qué
sigue, qué necesita una decisión o una cuenta tuya, y qué permisos
necesita Claude para seguir ayudando. Esta base (el proyecto en
`ecommerce/`) es el punto de partida — todo lo que se agregue después se
construye encima de esto, no se rehace.

## Actualización — especificación funcional implementada (2026-08-18)

Se construyó todo lo pedido en `Especificacion_Web_GuerraSupply.md`
sobre la base de Fase 0: rebrand a Panamá LuxeStone, tabs de modalidad de
compra, flip 3D + selector de medida/espesor en el catálogo, WhatsApp
flotante, página de Contáctanos, comprobante de pago + estados de pedido,
cotizador con acarreo real de las 4 zonas del Excel, página pública de
Instaladores (sin datos inventados), y panel de administración con login
en `/admin`. Esto resuelve la Fase 2, la Fase 7, y las secciones 5, 6, 9
y 10 de la especificación. Detalle de lo que falta con datos/cuentas
reales sigue más abajo (números de contacto, banco, Yappy, redes,
instaladores reales, y las Fases 3/4/8 que no cambiaron).

**Importante sobre esta sesión de Claude:** a diferencia de la sesión que
construyó la Fase 0, esta sí tuvo una terminal con Node/npm, pero la
red de este contenedor específico bloqueó el registro de npm (mismo
tipo de restricción mencionada abajo, en otro entorno), así que tampoco
se pudo correr `npm install` / `npm run build` para compilar y probar el
código antes de entregarlo. El código se escribió con cuidado y se
revisó a mano, pero **corre `npm run build` y avísame si sale algún
error de TypeScript** para poder corregirlo con precisión.

## Fase 0 — Base técnica (HECHO, 2026-08-18)

- Proyecto Next.js 15 + TypeScript + Tailwind, con ESLint/TypeScript en
  modo permisivo (avisan, no bloquean).
- Catálogo real cargado: 20 modelos confirmados, con fotos, descripciones,
  acabado, tono, veta y uso — tomados de tu catálogo web original.
- **Precios actualizados** con tu hoja de costos real
  (`Piedra_sinterizada_AUTOMATIZADO.xlsx`), que reemplaza los precios
  genéricos por categoría del catálogo viejo.
- **3 modelos nuevos agregados como borrador** (Burberry, Panda White,
  Travertine Beige) — estaban en la hoja de costos pero no en el
  catálogo original. Ver Fase 5.
- Cotizador de cocina en 3 pasos (medidas → foto → piedra → estimado).
- Carrito y checkout con 3 métodos de pago (estructura lista, sin
  credenciales reales todavía): Yappy, tarjeta (PagueloFácil/Stripe),
  transferencia.
- Middleware de pagos (`src/lib/payments`) para poder cambiar de
  pasarela sin tocar el resto del sitio.
- API de subida de imágenes con compresión automática (`/api/upload`).
- Cron de correos cada hora (`/api/cron/emails`) con plantillas de
  confirmación de pedido y seguimiento de cotización.
- Modelo de datos completo en Prisma (productos, pedidos, clientes,
  cotizaciones, cola de correos).
- Datos de logística cargados (`src/data/logistics.ts`) desde la hoja
  "Supuestos": costo por m², acarreo a Ciudad de Panamá / Penonomé /
  Santiago / Chiriquí — **cargados pero aún no usados** en el sitio (ver
  Fase 2).

## Fase 1 — Puesta en marcha local (SIGUE, requiere que tú ejecutes algo)

Claude no tiene forma de correr comandos en tu computadora en esta
sesión (ver sección de permisos abajo), así que este paso lo corres tú:

1. Correr `organizar_carpeta.ps1` (una sola vez) para ordenar la carpeta
   `PanamaLuxStone` — ver más abajo.
2. Instalar [Node.js](https://nodejs.org) si no lo tienes.
3. Dentro de `PanamaLuxStone/ecommerce`:
   ```
   npm install
   cp .env.example .env
   npm run db:push
   npm run db:seed
   npm run dev
   ```
4. Abrir `http://localhost:3000` y confirmar que el catálogo, el
   cotizador y el carrito se ven bien con datos reales.
5. Avisar si `npm install` o `npm run build` tiran algún error — el
   código se revisó a mano y con un chequeo de sintaxis, pero nunca se
   pudo instalar/compilar de verdad (ver limitación en "Permisos").

## Fase 2 — Motor de precios y acarreo regional (PENDIENTE, propuesta)

Tu hoja de costos automatizada es mucho más rica de lo que el sitio usa
hoy: ya calcula el costo real por modelo y el acarreo a 4 zonas de
Panamá (coinciden con las provincias de tu hoja de prospectos). Próximo
paso natural:
- Agregar selector de zona de entrega en el checkout, que sume el
  acarreo correspondiente (ya está el dato en `src/data/logistics.ts`,
  falta la interfaz).
- Decidir si el margen (~80% en casi todos los modelos) se muestra
  internamente (panel admin) o se queda solo en el Excel.

## Fase 3 — Pasarelas de pago reales (REQUIERE TU VERIFICACIÓN)

El código de las 3 pasarelas ya está escrito (`src/lib/payments/providers`),
pero funciona con datos de prueba hasta que tú:
1. Abras cuenta de comercio **Yappy** con Banco General.
2. Abras cuenta de comercio **PagueloFácil** (o definamos si prefieres
   Tilopay) para tarjetas locales.
3. Me compartas (o pongas tú directamente en `.env`) las llaves.
4. Probemos un pago de prueba en modo sandbox antes de activar en real.

**Importante:** puede que el nombre exacto de algún campo de la API
cambie según la documentación que te den al abrir cuenta — dejé
comentarios `TODO` en el código justo donde eso se ajusta.

## Fase 4 — Base de datos y correos en producción (REQUIERE TU VERIFICACIÓN)

1. Crear cuenta en **Neon** o **Supabase** (base de datos Postgres) y
   pasarme el `DATABASE_URL`.
2. Crear cuenta en **Resend** y verificar el dominio de correo
   (para que los correos no caigan en spam).
3. Decidir el dominio final del sitio (panamaluxstone.com, o el que
   prefieras) para configurarlo en Vercel.

## Fase 5 — Catálogo completo (REQUIERE TU VERIFICACIÓN)

Los 3 modelos que aparecían en la hoja de costos pero no en el catálogo
original **ya se agregaron al sitio como borrador** (2026-08-18), con
una etiqueta "Borrador" visible en la tarjeta y un aviso amarillo en la
ficha de producto. Faltan por confirmar:
- **Burberry** — sí tiene foto real. La descripción se escribió
  mirando la foto (fondo blanco con vetas gruesas color cobre/óxido,
  tipo breccia). Confirmar nombre comercial y texto final. $121/m².
- **Panda White** — todavía usa una foto de relleno (dice "FOTO
  PENDIENTE"). Descripción genérica basada en cómo se conoce este
  patrón en la industria (blanco/gris con manchas negras). $90/m².
- **Travertine Beige** — misma situación de foto pendiente. **Ojo:
  podría ser el mismo modelo que "Saturnia"** (ya está en el catálogo
  como "Travertino Moderno") con otro nombre — confirmar para no
  duplicar. $90/m².

Cuando tengas las fotos reales, se reemplazan las imágenes de relleno
en `public/images/products/panda-white.webp` y `travertine-beige.webp`
(y su versión `-thumb`), y se corrige el texto en
`src/data/catalog.ts` (los 3 tienen `descriptionConfirmed: false` para
que sean fáciles de encontrar).

También confirmar el margen de **Starry Blue** ($86/m², el único que
vende más barato que el resto por su costo de importación más alto).

## Fase 6 — Lado B2B / constructoras (IDEA, sin construir todavía)

Tu hoja `Guerra_Prospectos_Panama_2026.xlsx` tiene 86 proyectos de
construcción activos en Panamá (~$6.36M en oportunidad estimada). Eso
es un canal de ventas totalmente distinto al ecommerce de consumidor
final (cotizaciones grandes, contacto directo, pago por transferencia).
Cuando quieras, se puede evaluar un panel simple de seguimiento de esos
prospectos (no es parte de esta base todavía — es una idea para cuando
definas si lo quieres dentro del mismo sitio o aparte).

## Fase 7 — Panel de administración (IDEA, sin construir todavía)

Hoy, para cambiar un precio o agregar una piedra hay que editar código
(`src/data/catalog.ts`) y volver a desplegar. Una pantalla de admin
(login simple + editar productos/precios/pedidos) es un paso natural
una vez el catálogo esté estable.

## Fase 8 — Publicación

1. Conectar el proyecto a Vercel (o el hosting que prefieras).
2. Configurar ahí las mismas variables de entorno que en `.env`.
3. Apuntar el dominio.
4. Probar checkout completo de punta a punta antes de anunciar el sitio.

---

## Pendientes que requieren tu verificación (resumen)

- [ ] Correr `npm install` y `npm run build` por primera vez (Fase 1).
- [ ] Cuenta de comercio Yappy.
- [ ] Cuenta de comercio PagueloFácil (o decidir Tilopay).
- [ ] Base de datos de producción (Neon/Supabase).
- [ ] Cuenta y dominio verificado en Resend.
- [ ] Confirmar/completar Panda White, Travertine Beige y Burberry.
- [ ] Confirmar margen de Starry Blue.
- [ ] Datos de contacto reales (WhatsApp, dirección) — hoy están de
      relleno en el pie de página (`src/components/Footer.tsx`).
- [ ] Dominio final del sitio.

## Qué permisos necesita Claude

- **Carpeta de tu computadora**: ya tengo acceso de lectura y escritura
  a `PanamaLuxStone` — con eso puedo seguir escribiendo y actualizando
  archivos del proyecto directamente ahí.
- **Lo que NO puedo hacer desde aquí, aunque quisiera**: no tengo forma
  de ejecutar comandos en tu computadora (no puedo correr `npm install`,
  `git`, etc. en tu máquina) ni de borrar o mover archivos existentes ahí
  — solo puedo crear o sobrescribir archivos. Por eso el ordenamiento de
  la carpeta se hace con un script (`organizar_carpeta.ps1`) que tú
  ejecutas una vez, no algo que yo haga solo.
- **Tampoco tengo internet para instalar paquetes** en el entorno donde
  yo trabajo (política de red de la organización bloquea el registro de
  npm) — ni en tu compu ni aquí puedo instalar dependencias por ti. El
  primer `npm install` y la primera compilación real los tienes que
  correr tú (o alguien técnico), avisando si algo falla para corregirlo.
- **Cuentas externas** (Yappy, PagueloFácil, Neon/Supabase, Resend,
  Vercel): esas no son "permisos" que tú me des a mí — son cuentas que
  solo tú (como dueño del negocio) puedes abrir, generalmente con
  documentos de la empresa. Yo dejo el código listo para conectarlas en
  cuanto tengas las llaves.
- **Repositorio de GitHub (elegiste esta opción, falta que lo crees)**:
  no encontré un conector de GitHub disponible en esta cuenta de
  Cowork, así que no puedo autenticarme "con permiso" al estilo OAuth —
  la forma de darme acceso es con un token. Pasos:
  1. Crea un repositorio **privado** y vacío en GitHub (sin README),
     por ejemplo `panamaluxstone-ecommerce`.
  2. Genera un **Personal Access Token de tipo "fine-grained"**
     (Settings → Developer settings → Fine-grained tokens), limitado
     **solo a ese repositorio**, con permiso "Contents: Read and
     write" nada más, y con fecha de expiración corta (30-90 días).
  3. Comparte aquí el link del repo y el token. Lo uso únicamente para
     subir el código (`git push`) en esta sesión; no queda guardado en
     ningún lado fuera de esta conversación. Cuando quieras, revócalo
     desde GitHub y listo.
  Mientras no lo hayas creado, sigo entregando los archivos como hasta
  ahora (directo a tu carpeta, en lotes).
