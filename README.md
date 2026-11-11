# Un rincón para Megan

Portada romántica para Megan, desarrollada con Next.js App Router, React, TypeScript, Tailwind CSS, Lucide y Canvas 2D. Incluye cartas interactivas, una calculadora de capibaras, mensajes de ánimo y notas persistidas en PostgreSQL.

La tienda original sigue disponible en `/catalog` y utiliza Prisma con PostgreSQL. Las cartas y notas nuevas de la portada se guardan mediante Prisma y aparecen inmediatamente; la página carga las notas de la base de datos y conserva el formulario si Neon no está disponible. Los envíos usan identificadores idempotentes para evitar duplicados al reintentar. El indicador de Neon refleja el estado de la conexión real. Esta aplicación usa Prisma, no Drizzle.

La primera interacción de Megan con la portada inicia el reproductor oficial incrustado de YouTube de “MILO J - RARA VEZ”; el botón de música permite silenciarlo o reanudarlo. La pista está configurada en bucle y continúa al cerrar el panel del reproductor. Los navegadores pueden exigir que se pulse reproducir dentro del reproductor, y el volumen depende de YouTube y del dispositivo. El audio no se descarga ni se aloja en esta aplicación.

## Requisitos

- Node.js 20.9 o posterior y npm
- PostgreSQL (local o un proveedor compatible, como Neon)
- Chromium para Playwright (se instala con el comando indicado abajo)

## Configurar la base local

1. Copia `.env.example` a `.env.local` y configura `DATABASE_URL` con la URL de tu base PostgreSQL.
2. Configura `AUTH_SECRET` con un valor aleatorio privado de al menos 32 caracteres para firmar cookies en producción.

```powershell
Copy-Item .env.example .env.local
```

Genera el secreto con:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

No compartas ni subas `.env.local`.

## Migrar y cargar el catálogo

```powershell
npm install
npm run db:migrate
npm run db:seed
```

Las migraciones crean los productos, usuarios, carritos, wish lists y cartas de Megan. El seed idempotente carga seis productos de Sauce Demo, con slugs únicos, descripciones, imágenes y precios. Para desplegar una base nueva, ejecuta `npx prisma migrate deploy`. Si ya existe el esquema PostgreSQL de la tienda pero aún no tiene registro de migraciones, marca la línea base una sola vez antes de desplegar:

```powershell
npx prisma migrate resolve --applied 20261019180000_initial
npx prisma migrate deploy
```

La línea base no recrea ni borra las tablas existentes; registra el esquema y aplica la migración aditiva de cartas.

## Ejecutar

```powershell
npm run dev
```

Abre <http://localhost:3000>. Las wish lists y carritos de invitados se asocian a una cookie HttpOnly; al iniciar sesión se fusionan con los datos de la cuenta. Refer-a-friend genera un código estable por cuenta/sesión y enlaces de compartir para WhatsApp, Facebook, X y Telegram. Blog usa publicaciones locales y rutas para leer artículos. “Buy now” agrega el artículo y abre el resumen de checkout; el procesamiento de pagos no está habilitado en esta demo.

Las secciones de cartas y notas necesitan que `DATABASE_URL` apunte a PostgreSQL y que se apliquen las migraciones `20261109062000_create_love_letters`, `20261109183000_add_love_letter_request_id` y `20261109190000_create_persistent_love_notes`. Si la conexión no está disponible, la portada informa que no puede cargar ni guardar datos; las cuatro cartas incluidas siguen siendo visibles y el texto escrito en los formularios se conserva para poder reintentar.

Para Neon, configura `DATABASE_URL` con TLS obligatorio (`sslmode=require`), por ejemplo:
`postgresql://usuario:contraseña@host/neondb?sslmode=require&channel_binding=require`.
La API reintenta hasta cuatro veces los errores transitorios de conexión con pausas exponenciales. Los guardados usan un identificador idempotente para evitar duplicados cuando una reconexión repite una solicitud. Si la base tarda demasiado, la página conserva las cartas iniciales y mantiene el contenido del formulario para volver a intentar.

## Verificación

```powershell
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas usan Page Object Model y cubren el catálogo, carrito, wish list, checkout, blog y enlaces de referidos. Ejecuta las pruebas después de preparar la base local y cargar el seed. `PLAYWRIGHT_BASE_URL` puede usarse para probar un servidor ya iniciado.
