import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-posts";

export function generateStaticParams(): { slug: string }[] {
  return blogPosts.map(({ slug }) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="text-page blog-article">
      <Link className="text-link" href="/blog">← Back to the journal</Link>
      <p className="eyebrow">{new Date(`${post.publishedAt}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })}</p>
      <h1>{post.title}</h1>
      <p className="blog-summary">{post.summary}</p>
      {post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </article>
  );
}
