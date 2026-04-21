import { getAllPosts } from "@/lib/blog";
import { BlogPreviewClient } from "./BlogPreviewClient";

export function BlogPreview() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;
  return <BlogPreviewClient posts={posts} />;
}
