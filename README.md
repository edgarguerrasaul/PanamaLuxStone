# Panamá LuxeStone — Tienda en línea

Este es el proyecto de tu ecommerce de piedra sinterizada, mármol y
granito, cargado con tu catálogo real (23 modelos, precios y fotos).
Está listo para instalar y correr — falta que tú (o quien te ayude
técnicamente) le pongas las llaves/contraseñas de los servicios externos
(pagos, correo, panel de administración), que están documentadas en
`.env.example`.

## Actualización — implementación de la especificación funcional

Sobre la base técnica (Fase 0), esta pasada agregó lo pedido en
`Especificacion_Web_GuerraSupply.md`: tabs "Compra por Pedido" / "Compra
Inmediata", flip 3D de imagen + selector de medida/espesor, botón
flotante de WhatsApp, página de Contáctanos con formulario, comprobante
de pago + estados de pedido en español, cotizador con acarreo real
(zonas del Excel), página pública de Instaladores Recomendados (sin
datos inventados — cárgalos desde el admin), y un panel de
administración con login en `/admin` para editar productos, instaladores,
zonas de acarreo, pedidos, cotizaciones y mensajes de contacto. Ver
`ROADMAP.md` para el detalle de qué falta configurar con datos/cuentas
reales (WhatsApp, banco, Yappy, redes sociales).

## Qué incluye

- **Catálogo público** con 23 modelos (20 confirmados + 3 en borrador,
  ver nota abajo), filtro por colección
  (Tonos Blancos y Claros, Tonos Oscuros, Modelos Exóticos) y ficha de
  producto con precio, acabado, tono, veta y uso.
- **Cotizador** ("Diseña tu cocina en 3 pasos"): el cliente mide sus
  superficies, sube una foto de su cocina y elige la piedra. Recibe un
  estimado al instante y queda guardado como una cotización.
- **Carrito y checkout** con 3 métodos de pago: Yappy, Tarjeta y
  Transferencia bancaria.
- **API de subida de imágenes** (`/api/upload`) que redimensiona y
  comprime automáticamente cualquier foto a WebP antes de guardarla —
  así las páginas cargan rápido aunque el cliente suba una foto pesada
  de su celular.
- **Middleware de pagos**: el checkout no habla directo con Yappy, ni
  con la pasarela de tarjetas, ni con Stripe. Habla con una capa
  intermedia (`src/lib/payments`) que decide a cuál pasarela mandar el
  cobro. Esto permite cambiar de proveedor de pago en el futuro sin
  tocar el resto del sitio.
- **Cron de correos** (`/api/cron/emails`): una tarea programada que
  corre cada hora sola (por Vercel) y manda automáticamente: confirmación
  de pedido, aviso de "recibimos tu cotización", y seguimiento a
  cotizaciones que quedaron abandonadas más de 24 horas.

## Por qué este stack (explicado sin jerga)

- **Next.js**: es el "motor" del sitio. Genera páginas rápidas
  (buenas para SEO y para que Google Ads/Meta Ads funcionen bien),
  y en el mismo proyecto viven tanto las páginas que ve el cliente
  como las funciones del servidor (subir fotos, cobrar, mandar
  correos) — no necesitas un "backend" aparte. Es el estándar más
  usado hoy para tiendas en línea hechas a la medida, con muchísima
  documentación y soporte a largo plazo.
- **Por qué no Astro**: Astro es excelente para sitios que son
  mayormente contenido estático (blogs, landing pages). Tu sitio
  necesita carrito, checkout, subida de fotos y pagos — cosas
  interactivas y con lógica de servidor — y ahí Next.js es más
  directo y tiene menos piezas que armar por separado.
- **Vercel** (recomendado para publicarlo): es la plataforma que hace
  Next.js, así que el despliegue es prácticamente automático, con CDN
  global (carga rápido en todo Panamá y afuera) y el cron de correos
  ya integrado sin pagar un servidor aparte.
- **Prisma + base de datos**: Prisma es la capa que traduce entre el
  código y la base de datos, para que trabajar con productos, pedidos
  y cotizaciones sea simple y con menos errores. En tu computadora usa
  SQLite (un archivo, cero configuración). En producción se cambia una
  sola línea (`DATABASE_URL`) para usar una base real en la nube —
  recomendamos **Neon** o **Supabase** (ambos tienen plan gratis
  generoso para empezar).
- **Tailwind CSS**: es la forma en que se ve bonito el sitio sin tener
  que escribir CSS desde cero ni cargar un montón de archivos de
  estilos — ayuda a que cargue rápido.
- **Sharp**: la librería que comprime las fotos automáticamente. Es la
  razón por la que subir una foto de producto o de una cocina no hace
  el sitio lento.
- **Resend**: para mandar los correos automáticos. Es sencillo de
  configurar (una sola llave) y tiene buena entregabilidad (que los
  correos no caigan en spam).
- **Zustand**: guarda el carrito de compras en el navegador del
  cliente, de forma simple y liviana.

### Sobre las pasarelas de pago en Panamá

- **Yappy** (Banco General): la más usada por consumidores en Panamá,
  pago desde el celular. Recomendado como método principal.
- **PagueloFácil** (o Tilopay como alternativa): para cobrar tarjetas
  emitidas en Panamá con liquidación en banco local.
- **Transferencia bancaria**: pensada para tus clientes de proyectos
  grandes (constructoras, desarrolladores) que suelen preferir pagar
  así en vez de con tarjeta.
- **Stripe**: dejado como respaldo, por si en algún momento venden a
  clientes fuera de Panamá.

Ninguna de las tres pasarelas panameñas tiene credenciales todavía —
eso lo defines tú cuando abras cuenta de comercio con cada una. El
código ya está listo, solo hay que poner las llaves en `.env` (ver
`.env.example`) y, muy probablemente, ajustar el nombre exacto de
algún campo según la documentación que te entreguen (dejé comentarios
`TODO` en `src/lib/payments/providers/yappy.ts` y `paguelofacil.ts`
señalando justo eso).

## Cómo correrlo en tu computadora

Vas a necesitar tener instalado [Node.js](https://nodejs.org) (versión
18 o más nueva). Luego, desde la carpeta del proyecto:

```bash
npm install          # instala todo lo que el proyecto necesita
cp .env.example .env # crea tu archivo de configuración local
npm run db:push       # crea la base de datos local (SQLite)
npm run db:seed       # carga el catálogo real (20 piedras)
npm run dev            # levanta el sitio en http://localhost:3000
```

Con eso ya puedes navegar el catálogo, usar el cotizador y probar el
carrito. Para que el checkout llegue a cobrar de verdad, o para que
salgan correos, hay que llenar las llaves correspondientes en `.env`.

## Qué falta configurar (con llaves/cuentas reales)

1. **Base de datos de producción** — crear una cuenta en Neon o
   Supabase y poner el `DATABASE_URL` real.
2. **Yappy Comercial** — abrir cuenta de comercio con Banco General.
3. **PagueloFácil o Tilopay** — abrir cuenta de comercio para tarjetas.
4. **Resend** — crear cuenta (gratis para empezar) y verificar tu
   dominio de correo para que los correos no lleguen a spam.
5. **Cloudinary** (opcional, recomendado en producción) — para que las
   fotos de producto y de clientes se sirvan desde un CDN rápido en
   vez del disco del servidor.
6. **Dominio y despliegue en Vercel** — conectar el repositorio y
   agregar ahí las mismas variables de entorno.

## Estructura del proyecto (para orientarte)

```
src/
  app/                  Páginas y rutas de la API (todo lo que ve o llama el navegador)
    catalogo/            Catálogo y ficha de producto
    cotizador/            Calculadora de cocina
    carrito/, checkout/    Flujo de compra
    api/
      upload/             Sube y comprime imágenes
      checkout/            Crea el pedido y arranca el cobro
      quotes/              Guarda las cotizaciones
      webhooks/payments/    Recibe la confirmación de las pasarelas
      cron/emails/          Envía los correos pendientes (cada hora)
  components/           Piezas reutilizables de interfaz (tarjetas, header, carrito)
  lib/
    payments/            El "middleware" de pagos (Yappy, tarjeta, transferencia)
    email/                Plantillas y envío de correos
    upload/               Compresión y guardado de imágenes
    cart/                 Estado del carrito
  data/catalog.ts        El catálogo real, en un solo archivo fácil de editar
prisma/
  schema.prisma          Estructura de la base de datos
  seed.ts                Carga el catálogo real a la base de datos
public/images/products/  Fotos reales de las 20 piedras, ya optimizadas
```

## Sobre ESLint y TypeScript

Se dejó una configuración permisiva a propósito (`.eslintrc.json` y
`tsconfig.json`): avisa de errores importantes pero no bloquea el
trabajo por detalles menores de estilo. Si más adelante quieres reglas
más estrictas (por ejemplo antes de crecer el equipo), es un cambio
sencillo en esos dos archivos.

## Siguiente paso

Este proyecto es la base técnica. Cuando tengas lista tu hoja de
especificaciones (qué páginas exactas quieres, textos, fotos
adicionales, si necesitas cuentas de cliente, panel de administración,
envíos, etc.), la usamos para construir sobre esta base sin tener que
rehacer nada de lo ya configurado.

### Nota sobre los datos que ya se cargaron

Los nombres, descripciones y fotos de las 20 piedras salieron de tu
catálogo web original. **Los precios se actualizaron** con tu hoja
`Piedra_sinterizada_AUTOMATIZADO.xlsx` (hoja "Costos y Precios"), que es
tu modelo de costos real (China + logística + margen) — reemplaza los
precios genéricos por categoría que traía el catálogo viejo, porque
estos sí están calculados modelo por modelo.

**Actualización 2026-08-18:** se agregaron **Panda White**, **Travertine
Beige** y **Burberry** (los 3 modelos que estaban en la hoja de costos
pero no en el catálogo original) como borrador — Claude escribió una
descripción a partir de la foto (Burberry) o de cómo se conoce el
patrón en la industria (los otros dos, que todavía no tienen foto real
y muestran una imagen de relleno con el texto "FOTO PENDIENTE"). Se
marcan en el sitio con una etiqueta "Borrador" hasta que los confirmes
o corrijas. Ver `ROADMAP.md`.
