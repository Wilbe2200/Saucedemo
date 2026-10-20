# Sauce Demo

Tienda demo desarrollada con Next.js App Router, React, TypeScript estricto, Prisma y PostgreSQL serverless (Neon). Prisma se eligió por su esquema declarativo tipado, migraciones y generación de cliente.

## Requisitos

- Node.js 20.9 o posterior y npm
- Una base PostgreSQL de Neon
- Chromium para Playwright (se instala con el comando indicado abajo)

## Crear y configurar Neon

1. Crea un proyecto en [Neon](https://neon.tech/) y una base de datos PostgreSQL.
2. Copia la cadena de conexión del panel de Neon. Usa la URL pooled para la aplicación y agrega `?sslmode=require` (si ya hay parámetros, agrega `&sslmode=require`).
3. En la raíz del proyecto, copia `.env.example` a `.env.local` y reemplaza `DATABASE_URL` por la cadena real. No compartas ni subas `.env.local`.

```powershell
Copy-Item .env.example .env.local
```

Ejemplo de formato (no es una credencial real):

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
PLAYWRIGHT_BASE_URL="http://127.0.0.1:3000"
```

## Instalar, migrar y cargar el catálogo

```powershell
npm install
npm run db:migrate
npm run db:seed
```

La migración crea productos, usuarios, carritos, artículos de carrito y artículos de wish list. El seed es repetible y crea Grey jacket (£55.00), Noir jacket (£60.00) y Striped top (£50.00).

## Ejecutar

```powershell
npm run dev
```

Abre <http://localhost:3000>. Las páginas de catálogo consultan Neon; configura la base y ejecuta el seed antes de navegar por ellas.

## Verificación

```powershell
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Las pruebas usan Page Object Model y cubren el catálogo inicial, agregar al carrito, el estado vacío y guardar un producto en la wish list. Ejecuta las pruebas con Neon accesible y con el seed cargado; `PLAYWRIGHT_BASE_URL` puede usarse para probar un servidor ya iniciado.
