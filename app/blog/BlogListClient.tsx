"use client";

import Link from "next/link";
import { Calendar, ArrowRight, Tag, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function BlogListClient({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "3rem" }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-1 bg-primary rounded-full mb-6"
            />
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-7xl text-foreground mb-5 leading-[1.1]">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Deep dives into DevOps, platform engineering, and the art of
              building systems that scale.
            </p>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <motion.div
          animate={{ y: [0, -15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, 10, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-[-5%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none"
        />
      </section>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 md:px-6 pb-24">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            No posts yet. Check back soon!
          </p>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-8 md:grid-cols-2"
          >
            {posts.map((post) => (
              <motion.div key={post.slug} variants={item}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block h-full"
                >
                  <article className="relative h-full rounded-2xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/30 hover:-translate-y-1.5">
                    {/* Gradient accent top */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/60 to-secondary opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="p-7">
                      {/* Tags */}
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

                      {/* Title */}
                      <h2 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                        {post.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-5 border-t border-border/40">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                          Read
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </article>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
