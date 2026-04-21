#!/usr/bin/env node

/**
 * generate-blog-post.mjs
 *
 * Picks a topic from scripts/topics.json (or uses TOPIC_OVERRIDE),
 * calls GitHub Models API (using GITHUB_TOKEN) to generate a blog post,
 * and writes it to content/blog/{slug}.md.
 *
 * No external API keys needed — uses the built-in GITHUB_TOKEN.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const TOPICS_FILE = path.join(ROOT, "scripts", "topics.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error("Error: GITHUB_TOKEN environment variable is required.");
    process.exit(1);
}

const MODEL = "gpt-4o";
const API_URL = "https://models.inference.ai.azure.com/chat/completions";

// ---------------------------------------------------------------------------
// Topic selection
// ---------------------------------------------------------------------------

function loadTopics() {
    const raw = fs.readFileSync(TOPICS_FILE, "utf8");
    return JSON.parse(raw);
}

function getExistingSlugs() {
    if (!fs.existsSync(BLOG_DIR)) return new Set();
    return new Set(
        fs
            .readdirSync(BLOG_DIR)
            .filter((f) => f.endsWith(".md"))
            .map((f) => f.replace(/\.md$/, ""))
    );
}

function pickTopic(topics, existingSlugs) {
    const override = process.env.TOPIC_OVERRIDE;
    if (override) {
        const found = topics.find((t) => t.slug === override);
        if (found) return found;
        return {
            slug: override,
            title: override.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            description: `A deep dive into ${override.replace(/-/g, " ")}.`,
            tags: ["devops"],
        };
    }

    const available = topics.filter((t) => !existingSlugs.has(t.slug));

    if (available.length === 0) {
        console.error("All topics have been written! Add more to scripts/topics.json.");
        process.exit(1);
    }

    return available[Math.floor(Math.random() * available.length)];
}

// ---------------------------------------------------------------------------
// GitHub Models API call (OpenAI-compatible)
// ---------------------------------------------------------------------------

async function generatePost(topic) {
    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are a technical writer for a DevOps / Platform Engineering blog. 
Write in a conversational, practical, first-person tone. Be opinionated but fair.
Use real-world examples, code snippets, and concrete advice.

Style guidelines:
- Start with a hook that frames the problem, not a generic intro
- Use short paragraphs and lots of whitespace
- Include working code examples with comments
- Add practical tips and gotchas
- End with actionable takeaways
- Avoid marketing language, buzzwords, and fluff
- Write like you're explaining to a smart colleague over coffee
- Target 800-1500 words`;

    const userPrompt = `Write a blog post with the following details:

Title: ${topic.title}
Description: ${topic.description}
Tags: ${topic.tags.join(", ")}

Output the COMPLETE blog post as Markdown. Do NOT include YAML frontmatter — I will add that separately.
Start directly with the content (first heading, intro paragraph, etc.).
Use ## for major sections and ### for subsections.
Include at least 2 code blocks with real, working examples.`;

    const body = {
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
    };

    console.log(`Calling GitHub Models API (${MODEL})...`);

    const res = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error(`GitHub Models API error (${res.status}): ${errText}`);
        process.exit(1);
    }

    const data = await res.json();

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        console.error("No text in response:", JSON.stringify(data, null, 2));
        process.exit(1);
    }

    // Build the full markdown with frontmatter
    const frontmatter = [
        "---",
        `title: "${topic.title}"`,
        `date: "${today}"`,
        `description: "${topic.description}"`,
        `tags: [${topic.tags.map((t) => `"${t}"`).join(", ")}]`,
        "---",
        "",
    ].join("\n");

    // Strip any accidental frontmatter the model might have included
    let content = text.trim();
    if (content.startsWith("---")) {
        const endIdx = content.indexOf("---", 3);
        if (endIdx !== -1) {
            content = content.slice(endIdx + 3).trim();
        }
    }

    return frontmatter + content + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const topics = loadTopics();
    const existingSlugs = getExistingSlugs();
    const topic = pickTopic(topics, existingSlugs);

    console.log(`Selected topic: "${topic.title}" (${topic.slug})`);

    const markdown = await generatePost(topic);

    fs.mkdirSync(BLOG_DIR, { recursive: true });

    const outPath = path.join(BLOG_DIR, `${topic.slug}.md`);
    fs.writeFileSync(outPath, markdown, "utf8");

    console.log(`Blog post written to: ${outPath}`);
    console.log(`Word count: ~${markdown.split(/\s+/).length}`);

    // Write outputs for GitHub Actions
    const ghOutput = process.env.GITHUB_OUTPUT;
    if (ghOutput) {
        fs.appendFileSync(ghOutput, `slug=${topic.slug}\n`);
        fs.appendFileSync(ghOutput, `title=${topic.title}\n`);
    }
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
