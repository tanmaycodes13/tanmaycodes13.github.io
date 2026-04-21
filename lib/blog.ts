import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface PostMeta {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
}

export interface Post extends PostMeta {
    contentHtml: string;
}

export function getAllPosts(): PostMeta[] {
    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs.readdirSync(postsDirectory);

    const posts = fileNames
        .filter((name) => name.endsWith(".md"))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data } = matter(fileContents);

            return {
                slug,
                title: data.title ?? slug,
                date: data.date ?? "",
                description: data.description ?? "",
                tags: data.tags ?? [],
            };
        });

    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllSlugs(): string[] {
    if (!fs.existsSync(postsDirectory)) return [];

    return fs
        .readdirSync(postsDirectory)
        .filter((name) => name.endsWith(".md"))
        .map((name) => name.replace(/\.md$/, ""));
}

export async function getPostBySlug(slug: string): Promise<Post> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const processed = await remark().use(html).process(content);
    const contentHtml = processed.toString();

    return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
        tags: data.tags ?? [],
        contentHtml,
    };
}
