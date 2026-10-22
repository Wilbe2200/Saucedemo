import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Insertando productos...')

  // Limpiamos o insertamos sin skipDuplicates
  await prisma.product.createMany({
    data: [
      {
        name: 'Sauce Labs Backpack',
        slug: 'sauce-labs-backpack',
        priceGbp: 29.99,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
        description: 'Mochila resistente y de diseño elegante para el día a día.'
      },
      {
        name: 'Sauce Labs Bike Light',
        slug: 'sauce-labs-bike-light',
        priceGbp: 9.99,
        imageUrl: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=500&q=80',
        description: 'Luz LED de alta potencia para bicicleta y seguridad nocturna.'
      },
      {
        name: 'Sauce Labs Bolt T-Shirt',
        slug: 'sauce-labs-bolt-t-shirt',
        priceGbp: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80',
        description: 'Camiseta de algodón suave con el diseño clásico de desarrollo.'
      },
      {
        name: 'Sauce Labs Fleece Jacket',
        slug: 'sauce-labs-fleece-jacket',
        priceGbp: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80',
        description: 'Chaqueta abrigada y cómoda para climas frescos.'
      }
    ]
  })

  console.log('¡Productos insertados con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })