import { getAllPosts } from "@/lib/blog";
import { HomeClient } from "./HomeClient";

export default function Home() {
  const blogPosts = getAllPosts().slice(0, 3);
  return <HomeClient blogPosts={blogPosts} />;
}
