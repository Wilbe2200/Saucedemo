import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Grey jacket",
    slug: "grey-jacket",
    priceGbp: 55,
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    description: "A versatile grey jacket with a clean, modern fit. An easy layer for everyday wear.",
  },
  {
    name: "Noir jacket",
    slug: "noir-jacket",
    priceGbp: 60,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    description: "A timeless black jacket crafted for effortless style from day to night.",
  },
  {
    name: "Striped top",
    slug: "striped-top",
    priceGbp: 50,
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85",
    description: "A comfortable striped top that brings a classic pattern to your daily wardrobe.",
  },
];

async function main(): Promise<void> {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error: unknown) => {
    console.error("Could not seed the database:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
