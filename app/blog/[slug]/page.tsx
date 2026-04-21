import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, BookOpen, Clock } from "lucide-react";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const readingTime = estimateReadingTime(post.contentHtml);

  return (
    <div className="min-h-screen relative">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-secondary/30 to-transparent pointer-events-none" />

      <article className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-3xl relative z-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-12">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/80 text-secondary-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-foreground mb-5 leading-[1.15]">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {post.description}
            </p>
          )}

          <div className="flex items-center gap-5 text-sm text-muted-foreground pb-6 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary/70" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary/70" />
              {readingTime}
            </div>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Footer navigation */}
        <div className="mt-16 pt-8 border-t border-border/60">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            All Posts
          </Link>
        </div>
      </article>
    </div>
  );
}
