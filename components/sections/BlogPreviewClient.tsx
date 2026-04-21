"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export function BlogPreviewClient({ posts }: { posts: PostMeta[] }) {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" id="blog">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "2.5rem" }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="h-1 bg-primary rounded-full mb-4"
            />
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-foreground mb-2">
              Latest from the Blog
            </h2>
            <p className="text-muted-foreground max-w-md">
              Thoughts on infrastructure, engineering, and building things that
              work.
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm" className="group">
              View all posts
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Posts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full"
              >
                <article className="relative h-full rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/30 hover:-translate-y-1">
                  {/* Gradient top bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-50 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
                      {post.description}
                    </p>

                    {/* Date + Read more */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Read
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
