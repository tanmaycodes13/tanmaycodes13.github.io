import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} — Tanmay`,
      description: post.description,
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <article className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-3xl">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-10">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-foreground mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>
        </div>
      </article>
    </div>
  );
}
