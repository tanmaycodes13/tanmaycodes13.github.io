import { getAllPosts } from "@/lib/blog";
import { BlogListClient } from "./BlogListClient";

export const metadata = {
  title: "Blog — Tanmay",
  description:
    "Thoughts on DevOps, platform engineering, and building scalable systems.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return <BlogListClient posts={posts} />;
}
