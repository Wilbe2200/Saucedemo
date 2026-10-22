# Sauce Demo

Tienda demo desarrollada con Next.js App Router, React, TypeScript estricto, Prisma y SQLite para desarrollo local. Prisma proporciona esquema tipado, migraciones y generación del cliente.

## Requisitos

- Node.js 20.9 o posterior y npm
- SQLite (la base local se crea en `prisma/dev.db`)
- Chromium para Playwright (se instala con el comando indicado abajo)

## Configurar la base local

1. Copia `.env.example` a `.env.local`. `DATABASE_URL="file:./dev.db"` crea la base SQLite en `prisma/dev.db`.
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

La migración crea productos, usuarios, carritos, artículos de carrito y artículos de wish list. El seed idempotente carga seis productos de Sauce Demo, con slugs únicos, descripciones, imágenes y precios.

## Ejecutar

```powershell
npm run dev
```

Abre <http://localhost:3000>. Las wish lists y carritos de invitados se asocian a una cookie HttpOnly; al iniciar sesión se fusionan con los datos de la cuenta. Refer-a-friend genera un código estable por cuenta/sesión y enlaces de compartir para WhatsApp, Facebook, X y Telegram. Blog usa publicaciones locales y rutas para leer artículos. “Buy now” agrega el artículo y abre el resumen de checkout; el procesamiento de pagos no está habilitado en esta demo.

## Verificación

```powershell
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas usan Page Object Model y cubren el catálogo, carrito, wish list, checkout, blog y enlaces de referidos. Ejecuta las pruebas después de preparar la base local y cargar el seed. `PLAYWRIGHT_BASE_URL` puede usarse para probar un servidor ya iniciado.
