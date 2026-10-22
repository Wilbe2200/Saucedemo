import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export default function BlogPage() {
  return (
    <section className="section-block blog-index">
      <p className="eyebrow">THE SAUCE JOURNAL</p>
      <h1>Stories and style notes</h1>
      <div className="blog-grid">
        {blogPosts.map((post) => (
          <article className="blog-card" key={post.slug}>
            <p className="eyebrow">{new Date(`${post.publishedAt}T00:00:00`).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}</p>
            <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.summary}</p>
            <Link className="text-link" href={`/blog/${post.slug}`}>Read article →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
