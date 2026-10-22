export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  paragraphs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "building-a-considered-wardrobe",
    title: "Building a more considered wardrobe",
    summary: "A few simple ways to make everyday dressing feel more intentional.",
    publishedAt: "2026-10-01",
    paragraphs: [
      "A useful wardrobe starts with the pieces you reach for most. Notice the shapes, colours and fabrics that make getting dressed feel easy, then use them as a guide for what comes next.",
      "Choose versatile layers, look after the clothes you already own and leave room for a piece that genuinely earns its place. A little thought goes further than a closet full of maybes.",
    ],
  },
  {
    slug: "the-everyday-layer",
    title: "The everyday layer",
    summary: "How one well-chosen layer can carry an outfit through the week.",
    publishedAt: "2026-09-18",
    paragraphs: [
      "The best extra layer is one that works with the rest of your week. A clean shape and a comfortable fabric make it just as useful over a simple tee as it is with a smarter look.",
      "Keep the palette close to the pieces you already own. That small decision makes the layer easier to wear, and gives familiar outfits a fresh point of focus.",
    ],
  },
  {
    slug: "small-details-good-style",
    title: "Small details, good style",
    summary: "A closer look at the finishing touches that make a favourite feel personal.",
    publishedAt: "2026-09-04",
    paragraphs: [
      "Personal style rarely depends on one dramatic change. The way a sleeve is rolled, a favourite bag is carried or a colour is repeated can make a simple outfit feel entirely your own.",
      "Start with one detail you enjoy and let it sit naturally alongside the rest. The result feels considered without feeling overworked.",
    ],
  },
];
