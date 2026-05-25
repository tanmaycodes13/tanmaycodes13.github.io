---
title: "Prometheus and Grafana: Building Observability from Scratch"
date: "2026-05-25"
description: "A hands-on guide to setting up Prometheus and Grafana for monitoring your infrastructure and applications."
tags: ["observability", "monitoring", "devops"]
---
# Prometheus and Grafana: Building Observability from Scratch

Let’s face it—flying blind in production is a recipe for disaster. If you’re not monitoring your infrastructure and applications, you’re essentially waiting for your users or customers to tell you that something is broken. And that’s not exactly a great look for your team or your business.

Prometheus and Grafana are a powerful combo for building a basic yet highly effective observability stack. In this post, I’ll walk you through setting them up from scratch. Whether you’re running a Kubernetes cluster or just a few virtual machines, this guide will get you started with monitoring like a pro.

---

## Why Prometheus and Grafana?

Prometheus is a time-series database and monitoring tool designed for reliability and scalability. It pulls metrics from your systems and stores them in a format that’s optimized for queries. Grafana, on the other hand, is a visualization tool that lets you build dashboards to make sense of all that data.

While there are plenty of other monitoring solutions out there, Prometheus and Grafana stand out because they’re open-source, widely adopted, and flexible enough to monitor just about anything.

---

## Prerequisites

Before we dive in, here’s what you’ll need:

- A Linux-based server or virtual machine (ideally with at least 2 CPUs and 4GB of RAM).
- Docker (recommended) or a Kubernetes cluster, if you're deploying to containers.
- Basic familiarity with shell commands.

For this example, I’ll keep it simple and use Docker.

---

## Step 1: Running Prometheus

First, let’s get Prometheus up and running. We’ll use Docker to make this easy.

Create a `prometheus.yml` configuration file:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s # How often to scrape targets by default.

scrape_configs:
  - job_name: 'prometheus' # Name of the job
    static_configs:
      - targets: ['localhost:9090'] # Targets to scrape
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

This configuration defines two scrape jobs:
1. One for Prometheus itself (so you can monitor Prometheus).
2. One for a Node Exporter instance, which we’ll set up next.

Now, start Prometheus with Docker:

```bash
docker run -d \
  --name=prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

Visit `http://localhost:9090` in your browser. You should see the Prometheus UI. You can query metrics (like `up`) to verify it’s working properly.

---

## Step 2: Adding Node Exporter

Prometheus is great for collecting metrics, but we need something to expose system-level metrics like CPU, memory, and disk usage. That’s where [Node Exporter](https://github.com/prometheus/node_exporter) comes in.

Start Node Exporter with Docker:

```bash
docker run -d \
  --name=node-exporter \
  -p 9100:9100 \
  prom/node-exporter
```

Node Exporter exposes system metrics on `http://localhost:9100/metrics`. You can visit that endpoint in your browser to see raw metrics, but the real magic happens when Prometheus scrapes these metrics.

If you followed the earlier steps, Node Exporter is already defined in your `prometheus.yml`. Prometheus will automatically start scraping it.

To verify, go back to the Prometheus UI, query for `node_cpu_seconds_total`, and you should see some results.

---

## Step 3: Setting Up Grafana

Prometheus is great for storing and querying metrics, but let’s be real—nobody wants to stare at raw numbers all day. Grafana turns those numbers into beautiful, actionable dashboards.

Run Grafana with Docker:

```bash
docker run -d \
  --name=grafana \
  -p 3000:3000 \
  grafana/grafana
```

Visit `http://localhost:3000` in your browser. The default login is `admin` for both the username and password. You’ll be prompted to change the password on first login—don’t skip this step!

Once you’re in:

1. Go to **Configuration > Data Sources**.
2. Click **Add data source** and select **Prometheus**.
3. Set the URL to `http://host.docker.internal:9090` (or the hostname/IP of your Prometheus instance).
4. Click **Save & Test** to verify the connection.

---

## Step 4: Building Your First Dashboard

With Grafana connected to Prometheus, let’s build a simple dashboard to visualize CPU usage.

1. Go to **Dashboards > New Dashboard**.
2. Click **Add a New Panel**.
3. In the query editor, select your Prometheus data source.
4. Enter this query:
   ```
   rate(node_cpu_seconds_total{mode="user"}[1m])
   ```
   This shows the rate of CPU usage in "user mode" over the last minute.

5. Play around with the visualization options. For example:
   - Set the visualization type to **Graph**.
   - Adjust the legend to show metric labels.
   - Add thresholds to alert you if CPU usage spikes.

6. Save the dashboard and give it a name like "System Metrics".

Voilà! You now have a basic dashboard tracking CPU usage.

---

## Tips and Gotchas

Here are a few things to keep in mind as you dive into Prometheus and Grafana:

### Tip 1: Use Docker Compose
Running multiple containers can get messy. Use Docker Compose to manage your Prometheus, Grafana, and exporters. Here’s a simple `docker-compose.yml` to get you started:

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
```

Run everything with:

```bash
docker-compose up -d
```

### Tip 2: Secure Your Setup
By default, Prometheus and Grafana are completely open to the world. You’ll want to secure them in production by:
- Enabling authentication for Grafana.
- Using a reverse proxy with HTTPS (e.g., Nginx or Traefik).
- Restricting access to Prometheus and Node Exporter.

### Gotcha: Prometheus is Pull-Based
Prometheus works on a **pull** model, meaning it fetches data from your services. This is great for reliability (if Prometheus is down, your services don’t crash), but it means your services need to expose metrics over HTTP. Most modern apps and frameworks have libraries for this.

---

## Wrapping Up

By now, you should have a basic Prometheus and Grafana setup monitoring your infrastructure. Here’s the quick recap:

1. Set up Prometheus with a simple configuration file.
2. Add Node Exporter to expose system metrics.
3. Install Grafana and connect it to Prometheus.
4. Build your first dashboard to visualize key metrics.

From here, you can scale up by adding more exporters (e.g., for databases) or instrumenting your application code with Prometheus client libraries. You can also explore advanced Grafana features, like alerts and custom plugins.

Observability doesn’t have to be complicated to start with. Get this basic setup running, and you’ll already be ahead of teams that are still guessing what’s happening in production.

Got questions or tips of your own? Let me know in the comments or shoot me a message!

Happy monitoring!
