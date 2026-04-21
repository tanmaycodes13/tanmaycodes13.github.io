import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { Calendar, ArrowRight, Tag } from "lucide-react";

export const metadata = {
  title: "Blog — Tanmay",
  description: "Thoughts on DevOps, platform engineering, and building scalable systems.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              Blog
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-foreground mb-4">
              Thoughts &amp; Learnings
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Writing about DevOps, platform engineering, backend systems, and everything I learn along the way.
            </p>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            No posts yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article
                  className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Tags */}
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

                  {/* Title */}
                  <h2 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
