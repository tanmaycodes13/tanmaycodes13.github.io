---
title: "API Rate Limiting Patterns: Token Buckets, Sliding Windows, and Beyond"
date: "2026-04-21"
description: "How to implement effective rate limiting for your APIs using different algorithms and when to use each."
tags: ["backend", "api-design", "performance"]
---
# API Rate Limiting Patterns: Token Buckets, Sliding Windows, and Beyond

Let’s face it: if you're building an API for public or internal use, someone, somewhere, is going to abuse it. Whether it's a script making too many requests, a poorly implemented client app, or an outright malicious actor, rate limiting is your first line of defense to protect your API and, by extension, your infrastructure.

But not all rate limiting algorithms are created equal. Should you use a simple fixed window? Or maybe a token bucket? What about a sliding window? Each pattern has its strengths, weaknesses, and ideal use cases.

In this post, we’ll dive into the most common rate limiting patterns, show you how to implement them, and give you tips to choose the right approach for your API.

---

## Why Do You Need Rate Limiting?

Imagine you have an API that serves weather data. A single client accidentally (or intentionally) sends 10,000 requests per second. Without rate limiting, your backend will likely grind to a halt, impacting other users and possibly taking down critical infrastructure.

Rate limiting prevents this by restricting how many requests a client can make within a given timeframe. It’s an essential tool for:

- **Preventing abuse**: Stop malicious actors and runaway scripts.
- **Maintaining fairness**: Ensure all users get a fair share of resources.
- **Protecting your servers**: Avoid overload during spikes.

Now that we know why rate limiting matters, let’s explore some common approaches to implementing it.

---

## Fixed Window Counters: The Simplest Approach

The fixed window algorithm is the easiest to understand: you define a time window (e.g., 1 minute) and a request limit (e.g., 100 requests). If a client exceeds the limit within the window, their requests are rejected. After the window resets, they can start fresh.

Here’s how you could implement a fixed window counter using Redis:

```python
import time
import redis

r = redis.StrictRedis(host='localhost', port=6379, db=0)

def is_rate_limited(client_id, max_requests, window_size):
    # Key for rate limiting
    key = f"rate_limit:{client_id}"
    
    # Start a pipeline for atomic operations
    with r.pipeline() as pipe:
        # Increment the counter
        pipe.incr(key, 1)
        pipe.expire(key, window_size)  # Set a TTL equal to the window size
        current_count, _ = pipe.execute()
    
    # Check if the limit is exceeded
    return current_count > max_requests

# Example usage
client_id = "user_123"
max_requests = 100
window_size = 60  # in seconds

if is_rate_limited(client_id, max_requests, window_size):
    print("Rate limit exceeded!")
else:
    print("Request allowed.")
```

### Pros and Cons

**Pros**:
- Simple to implement and easy to reason about.
- Works fine for low-traffic APIs or when exact fairness isn’t critical.

**Cons**:
- The "burstiness" problem: If a user sends 100 requests at the end of a time window and 100 more at the start of the next, they effectively send 200 requests in a short amount of time.

Use this if you need something quick and simple, but be aware of its limitations.

---

## Token Bucket: The Smooth Operator

The token bucket algorithm introduces the concept of tokens being added to a "bucket" at a fixed rate. Each request consumes a token. If the bucket is empty, the client must wait for tokens to be replenished.

This smooths out traffic because tokens are added gradually, preventing sudden bursts — even if the client has a high request rate.

Here’s how you could implement a token bucket in Python:

```python
import time
from collections import defaultdict

class TokenBucket:
    def __init__(self, rate, capacity):
        self.rate = rate  # Tokens added per second
        self.capacity = capacity  # Maximum tokens in the bucket
        self.tokens = capacity
        self.last_refill = time.time()

    def allow_request(self):
        now = time.time()
        elapsed = now - self.last_refill

        # Refill tokens based on elapsed time
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_refill = now

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        else:
            return False

# Example usage
bucket = TokenBucket(rate=5, capacity=10)  # 5 tokens/second, max 10 tokens

if bucket.allow_request():
    print("Request allowed.")
else:
    print("Rate limit exceeded!")
```

### Pros and Cons

**Pros**:
- Prevents bursts by spreading requests over time.
- Allows some flexibility with "burst capacity" (you can send multiple requests if tokens are available).

**Cons**:
- Slightly more complex to implement compared to fixed windows.
- May not strictly enforce limits over small time intervals.

Use this if you expect variable traffic patterns and need a smoother distribution of requests over time.

---

## Sliding Window Logs: Precision Overhead

For APIs where fairness really matters, the sliding window log algorithm might be the way to go. Unlike fixed windows, it doesn’t reset counters at the end of a window. Instead, it keeps a timestamped log of requests and calculates the request rate dynamically based on the sliding window.

Here’s how it works:
1. Store timestamps of all requests in a log (e.g., in Redis or a database).
2. Remove timestamps outside the current time window.
3. If the number of timestamps within the window exceeds the limit, reject the request.

Here’s a basic implementation using Python and Redis:

```python
import time
import redis

r = redis.StrictRedis(host='localhost', port=6379, db=0)

def is_rate_limited(client_id, max_requests, window_size):
    key = f"rate_limit:{client_id}"
    current_time = int(time.time() * 1000)  # Current time in milliseconds
    
    with r.pipeline() as pipe:
        # Add the current request timestamp to the log
        pipe.zadd(key, {current_time: current_time})
        # Remove timestamps outside the sliding window
        pipe.zremrangebyscore(key, 0, current_time - window_size * 1000)
        # Get the number of remaining timestamps in the window
        pipe.zcard(key)
        # Expire the key after the sliding window duration
        pipe.expire(key, window_size)
        _, _, request_count, _ = pipe.execute()
    
    # Check if the limit has been exceeded
    return request_count > max_requests

# Example usage
client_id = "user_123"
max_requests = 100
window_size = 60  # in seconds

if is_rate_limited(client_id, max_requests, window_size):
    print("Rate limit exceeded!")
else:
    print("Request allowed.")
```

### Pros and Cons

**Pros**:
- Provides accurate rate limiting across a rolling window.
- No burstiness at window boundaries.

**Cons**:
- High memory usage for storing request logs.
- More computationally expensive (e.g., removing old timestamps).

Use this if your API needs precise rate limiting at all times, but be prepared to handle the increased resource usage.

---

## Choosing the Right Pattern

Here’s a quick cheat sheet to help you decide:

- Use **fixed windows** for simple, low-traffic APIs where bursts aren’t a concern.
- Use **token buckets** for smoothing out traffic and allowing occasional bursts.
- Use **sliding windows** for high-precision rate limiting when fairness is critical.

If you're building a large-scale application, consider leveraging specialized tools like **Redis**, **Nginx**, or **Envoy** to handle rate limiting. For example, Nginx supports token bucket-based rate limiting out of the box with the `limit_req` module.

---

## Common Pitfalls and Gotchas

1. **Stateful vs. Stateless**: 
   - Stateless rate limiting (e.g., using JSON Web Tokens) offloads the work to the client but can be less secure since tokens can be manipulated.
   - Stateful rate limiting (e.g., using Redis) is more reliable but requires shared storage for distributed systems.

2. **Clustered Environments**:
   - In a multi-node API setup, make sure to use a centralized data store like Redis or Memcached to track rate limits. Otherwise, you'll end up with inconsistent results.

3. **Don’t Block Critical Users**:
   - Always whitelist essential users (e.g., internal services or administrators) to avoid accidental service interruptions.

4. **Choose Reasonable Defaults**:
   - If you're unsure, start with a generous limit (e.g., 100 requests/min) and monitor your analytics before tightening the rules.

---

## Final Takeaways

Rate limiting is essential for protecting your APIs, but the algorithm you choose can make or break your user experience. Here's what you should do next:

1. Identify your API’s traffic patterns and determine the level of precision you need.
2. Start with a simple rate limiting pattern (e.g., fixed window or token bucket) and measure your API usage.
3. For large-scale or multi-region applications, integrate with tools like Redis or API gateways that support distributed rate limiting.
4. Monitor and tune as your API grows.

Choosing the right rate limiting strategy isn’t just about protecting your backend — it’s about creating a fair experience for all users without sacrificing performance. So, take the time to understand your options and pick the one that fits your needs. Your users will thank you.
