---
title: "Nginx as a Reverse Proxy: The Complete Practical Guide"
date: "2026-06-08"
description: "Everything you need to know about using Nginx as a reverse proxy, from basic proxying to load balancing and TLS termination."
tags: ["nginx", "infrastructure", "backend"]
---
# Nginx as a Reverse Proxy: The Complete Practical Guide

Let me guess—you need to put Nginx in front of your application, but you’re not sure where to start. Maybe you’re setting up a basic reverse proxy, or maybe you’re trying to load balance across multiple backend instances. Oh, and don’t forget TLS termination, because running insecure traffic in production is a no-go.

Sound familiar? Don’t worry—I’ve been there too. In this guide, I’ll walk you through everything you need to know about using Nginx as a reverse proxy. By the end, you’ll have a clear understanding of how to configure Nginx to handle requests like a pro.

---

## What Is a Reverse Proxy?

A reverse proxy is a server that sits in front of your backend applications and handles incoming client requests. Instead of clients communicating directly with your backend, they talk to Nginx, which then forwards the requests to the appropriate backend (and sends the responses back to the clients).

Why bother? Here are some common reasons:

- **Hide your backend servers**: Nginx acts as a "bouncer" for your backend, keeping them hidden from the outside world.
- **Load balancing**: Distribute traffic across multiple backend instances for better performance and reliability.
- **TLS termination**: Offload HTTPS encryption/decryption to Nginx so your backend doesn’t have to handle it.
- **Caching**: Speed up responses for static assets or repeated requests.

Let’s dive into how to set this up.

---

## Setting Up a Basic Reverse Proxy

First, let’s start with a simple use case: you have a backend running on `http://localhost:8080`, and you want Nginx to proxy all traffic to it.

Here’s what the Nginx configuration looks like:

```nginx
server {
    listen 80;

    server_name example.com;

    location / {
        proxy_pass http://localhost:8080; # Forward requests to the backend
        proxy_set_header Host $host;      # Preserve the Host header
        proxy_set_header X-Real-IP $remote_addr; # Pass client IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # Track proxy hops
    }
}
```

### Breaking Down the Config

- `listen 80`: Nginx listens on port 80 (HTTP).
- `server_name example.com`: The domain name you’re using. Replace this with your actual domain or IP.
- `proxy_pass http://localhost:8080`: Forwards all incoming traffic to your backend server running on port 8080.
- `proxy_set_header`: Ensures the correct headers are forwarded to your backend:
  - `Host`: The original hostname from the client request.
  - `X-Real-IP`: The client’s IP address.
  - `X-Forwarded-For`: A list of IPs the request passed through (important for debugging).

Save this configuration file (e.g., `reverse-proxy.conf`) in Nginx’s configuration directory (usually `/etc/nginx/conf.d/`), then test and reload Nginx:

```bash
sudo nginx -t   # Test the config for syntax errors
sudo systemctl reload nginx  # Reload Nginx with the new config
```

### Test It Out

Assuming your backend is running on `http://localhost:8080`, and you’ve pointed your DNS to the Nginx server’s IP, you should now be able to visit `http://example.com` in your browser and see your application.

---

## Adding TLS Termination

Nobody likes a "Not Secure" warning in their browser. Let’s set up HTTPS using a free SSL certificate from Let’s Encrypt.

### Step 1: Install Certbot

First, install Certbot and the Nginx plugin:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Step 2: Get a Certificate

Run Certbot to automatically generate and configure an SSL certificate:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

This command:

- Requests an SSL certificate for `example.com` and `www.example.com`.
- Updates your Nginx config to use the certificate.

### Step 3: Verify the Config

Certbot should have added a new `server` block to your Nginx config for HTTPS. It’ll look something like this:

```nginx
server {
    listen 443 ssl;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

You should also see a separate `server` block for HTTP that redirects traffic to HTTPS:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}
```

### Step 4: Reload Nginx

As always, test and reload your configuration:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Visit `https://example.com`—you should see your app with a secure green lock in the browser!

---

## Load Balancing with Nginx

What if you have multiple backend servers, and you want to distribute traffic between them? Nginx makes this easy with its built-in load balancing features.

Here’s a simple example:

```nginx
upstream backend {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
    server 192.168.1.12:8080;
}

server {
    listen 80;

    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### How It Works

- The `upstream` block defines a group of backend servers (`192.168.1.10`, `.11`, `.12` in this case).
- Nginx will distribute incoming requests across these servers using a **round-robin** algorithm by default. You don’t have to configure anything special for this.

### Customizing the Load Balancing Algorithm

Nginx supports several algorithms for load balancing:

- **Round Robin (default)**: Distributes requests evenly across all backends.
- **Least Connections**: Sends requests to the server with the fewest active connections:
  ```nginx
  upstream backend {
      least_conn;
      server 192.168.1.10:8080;
      server 192.168.1.11:8080;
  }
  ```
- **IP Hash**: Routes requests from the same client IP to the same backend:
  ```nginx
  upstream backend {
      ip_hash;
      server 192.168.1.10:8080;
      server 192.168.1.11:8080;
  }
  ```

---

## Practical Tips and Gotchas

1. **Don’t Forget Health Checks**  
   If one of your backend servers goes down, Nginx won’t know unless you configure health checks. Use the `max_fails` and `fail_timeout` parameters in the `upstream` block:
   ```nginx
   upstream backend {
       server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
       server 192.168.1.11:8080;
   }
   ```

2. **Use Caching for Static Content**  
   If your app serves static files (like images or CSS), let Nginx cache them instead of hitting your backend every time. Add a `location` block like this:
   ```nginx
   location /static/ {
       root /var/www/html;
       expires 30d;  # Cache for 30 days
   }
   ```

3. **Rate Limiting**  
   Protect your backend from brute force attacks or abusive clients by enabling rate limiting:
   ```nginx
   http {
       limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

       server {
           location / {
               limit_req zone=one burst=20 nodelay;
               proxy_pass http://localhost:8080;
           }
       }
   }
   ```

---

## Actionable Takeaways

1. Start with a basic reverse proxy (`proxy_pass`) to forward traffic to your backend.
2. Add TLS termination with Let’s Encrypt for HTTPS.
3. Use the `upstream` directive to load balance across multiple backends.
4. Optimize performance with caching, rate limiting, and health checks.

Nginx is like the Swiss Army knife of web servers. Mastering it takes time, but once you get the hang of these basics, you’ll be ready to tackle more advanced setups. Have questions or tips of your own? Drop them in the comments—let’s keep the conversation going!
