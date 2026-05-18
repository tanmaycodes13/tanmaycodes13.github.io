---
title: "Docker Multi-Stage Builds: Shrinking Images the Right Way"
date: "2026-05-18"
description: "A practical guide to using multi-stage Docker builds to create minimal, secure production images."
tags: ["docker", "devops", "security"]
---
# Docker Multi-Stage Builds: Shrinking Images the Right Way

Ever shipped a Docker image to production and realized it’s bloated like a Thanksgiving turkey? I’ve been there. The image is full of build tools, leftover dependencies, and random junk that has nothing to do with running your app. Worse, it’s a security risk and a strain on your infrastructure.

If you’ve ever thought, “There has to be a better way,” you’re in luck. Docker multi-stage builds can help you create lean, secure images without sacrificing development convenience. Let’s walk through how they work and how you can start using them today.

---

## The Problem with Traditional Docker Builds

Here’s a common Dockerfile you might see for a Node.js application:

```dockerfile
# Build stage
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

CMD ["node", "dist/server.js"]
```

Looks fine at first glance, right? But there’s a problem.

The production image inherits everything from the base `node:18` image, including stuff you don’t need: package managers, compilers, debugging tools, and more. On top of that, your build artifacts might contain secrets or temporary files accidentally left behind. All of this makes the image bigger and less secure.

---

## Enter Multi-Stage Builds

Multi-stage builds allow you to use multiple `FROM` statements in your Dockerfile. Each stage creates a temporary environment where you can perform specific tasks, like building your app. Only the artifacts you explicitly copy from the intermediate stages end up in the final image.

Here’s a better version of the Node.js Dockerfile using multi-stage builds:

### Example: Lean Node.js Production Image

```dockerfile
# Build stage: Create build artifacts
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage: Minimal runtime image
FROM node:18-slim
WORKDIR /app

# Only copy necessary files from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Set the app to run
CMD ["node", "dist/server.js"]
```

Here’s what’s better about this approach:

1. **Smaller Image**: We’re using `node:18-slim` for the final image, cutting out all the unneeded tools.
2. **Secure and Clean**: Only the `dist` directory and production dependencies are copied over. No build tools, no dev dependencies, no junk.
3. **Separation of Concerns**: The build environment (with compilers and full Node.js) stays isolated from the production runtime.

---

## Practical Tips for Multi-Stage Builds

### 1. Start with Slim Base Images  
"Slender is better" when it comes to production images. Most official Docker images, like `node`, `python`, or `golang`, have “slim” variants. These are stripped-down versions that include only the essentials for running your app.

For example:

```dockerfile
FROM node:18-slim
```

This reduces the attack surface and speeds up image pulls, especially in CI pipelines.

### 2. Don’t Over-Copy Files  
Be deliberate about what you copy between stages. If you `COPY . .`, you might accidentally bring along `.git`, `.env`, or other sensitive files.

Instead, use `.dockerignore`. For example:

**Example `.dockerignore` file:**

```
node_modules
.git
.env
Dockerfile
```

This ensures your build context is clean before the Docker build even starts.

### 3. Minimize Layers  
Every `RUN` command in your Dockerfile creates a new layer. Layers are great for caching, but too many can lead to unnecessarily large images. Combine commands where it makes sense:

**Example:**

```dockerfile
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

This keeps everything in one layer and removes temporary files immediately.

### 4. Test Your Final Image  
Use `docker exec` to poke around inside your production container. Make sure it’s lean and doesn’t include build tools or extra files.

```bash
docker run -it your-image-name bash
ls -al /app
```

---

## Advanced Example: Multi-Language Builds

Let’s say your app uses both Python and Node.js. You can use multi-stage builds to mix languages and tools while keeping the final image clean.

### Example: Python + Node.js Build

```dockerfile
# Stage 1: Build Node.js frontend
FROM node:18 as frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

# Stage 2: Build Python backend
FROM python:3.10 as backend-builder
WORKDIR /backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend .
RUN python manage.py collectstatic --noinput

# Stage 3: Combine everything in a slim runtime image
FROM python:3.10-slim
WORKDIR /app

# Copy backend
COPY --from=backend-builder /backend /app/backend

# Copy frontend
COPY --from=frontend-builder /frontend/build /app/backend/static

CMD ["python", "app/backend/manage.py", "runserver"]
```

This approach is great for microservices where you might have multiple languages in play. Each build stage is responsible for its part, and the final image combines only what’s needed.

---

## Gotchas to Watch Out For

1. **Caching Pitfalls**: Docker caches layers to speed up builds. While this is great most of the time, it can lead to unexpected results if your build dependencies change. Use `--no-cache` during your first build to ensure everything is fresh:
   ```bash
   docker build --no-cache -t your-image-name .
   ```

2. **Layer Bloat**: Avoid creating layers that include temporary files. Always clean up after yourself (e.g., `rm` unused files during the same `RUN` statement).

3. **Sensitive Files in Final Image**: Be careful with `.env` files, SSH keys, or hardcoded secrets—they can sneak into the final image. Triple-check what you’re copying into production.

---

## Actionable Takeaways

1. **Use Multi-Stage Builds**: Separate your build environment and production runtime to create smaller, cleaner images.
2. **Slim Base Images**: Always start with the most lightweight image that meets your needs (e.g., `node:18-slim`).
3. **Be Deliberate**: Use `.dockerignore` and avoid copying unnecessary files between stages.
4. **Test Your Images**: Inspect your final image for leftover junk or sensitive files before shipping to production.

Multi-stage builds aren’t just a cool feature—they’re a game-changer for making Docker images secure and efficient. Give it a try and let me know how it works for your projects!
