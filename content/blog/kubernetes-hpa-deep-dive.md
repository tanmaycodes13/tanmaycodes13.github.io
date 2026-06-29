---
title: "Kubernetes HPA Deep Dive: Scaling Beyond CPU"
date: "2026-06-29"
description: "A practical guide to Kubernetes Horizontal Pod Autoscaler, covering CPU, memory, and custom metrics scaling with real examples."
tags: ["kubernetes", "scaling", "platform-engineering"]
---
# Kubernetes HPA Deep Dive: Scaling Beyond CPU

Let’s face it: scaling workloads in Kubernetes can feel like alchemy sometimes. Sure, the Horizontal Pod Autoscaler (HPA) is great for keeping your app responsive when traffic spikes, but most tutorials stop at CPU-based scaling. What if your bottleneck isn’t CPU? What if memory usage, request latency, or even custom application metrics are your limiting factors?

In this post, we’re going to dive deep into Kubernetes HPA. I’ll show you how to scale pods not just on CPU but also on memory and custom metrics—complete with real-world examples. By the end, you’ll know how to make your applications autoscale based on the metrics that actually matter.

---

## The Basics of Kubernetes HPA

Before we get fancy, let’s recap the basics. The Horizontal Pod Autoscaler adjusts the number of pods in a deployment (or replicaset) based on observed metrics. The default and most common setup scales based on CPU utilization.

Here’s a simple example:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: example-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: example-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70 # Target 70% CPU utilization
```

With this configuration, Kubernetes will monitor the CPU usage of the `example-deployment` pods and scale the replicas between 2 and 10 to maintain an average CPU utilization of 70%.

But what if CPU isn’t the problem? Maybe memory pressure is your real enemy, or your app's response time is the metric that truly reflects performance.

---

## Scaling on Memory Usage

Memory-based scaling is just as straightforward as CPU-based scaling. You simply swap out the resource name.

Here’s how you’d scale on memory usage instead of CPU:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memory-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: example-deployment
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80 # Target 80% memory utilization
```

Here’s what happens behind the scenes: 

- Kubernetes uses Metrics Server to fetch memory usage data for your pods.
- If the average memory usage across all pods in the deployment exceeds 80%, Kubernetes will add more replicas. 
- Once memory usage falls back below 80%, Kubernetes will scale down the replicas.

### Gotchas with Memory Scaling

1. **Memory isn’t as elastic as CPU**: Unlike CPU, memory usage doesn’t instantly drop when traffic decreases. Apps tend to hold onto allocated memory until garbage collection kicks in (or not at all), so scaling down based on memory can lag.

2. **Metrics Server Limitations**: If you’re using the default Kubernetes Metrics Server, make sure it’s correctly installed and configured. It needs to be able to scrape these resource metrics from all your nodes.

---

## Scaling with Custom Metrics

Sometimes CPU and memory aren’t enough. Maybe you want to scale based on:

- The number of messages in a message queue (like RabbitMQ).
- HTTP request latency.
- Error rates in your app.

For these cases, Kubernetes offers support for custom metrics via the Custom Metrics API. This requires a bit more setup, but it’s extremely powerful.

### Setting Up Custom Metrics

You’ll need to:

1. Deploy a metrics adapter that supports the Custom Metrics API. Popular options include [Prometheus Adapter](https://github.com/kubernetes-sigs/prometheus-adapter) or [KEDA](https://keda.sh/).
2. Expose your custom metric to the adapter (e.g., via Prometheus).
3. Configure your HPA to use the custom metric.

Let’s walk through an example where we scale based on the number of HTTP requests per second hitting a service.

### Example: Scaling on HTTP Request Rate

#### Step 1: Expose the Metric

Assume you’re using Prometheus and have an application exposing an HTTP request rate metric, like this:

```
http_requests_total{app="example-app"}
```

To calculate the requests per second, you could use a Prometheus query like:

```text
rate(http_requests_total[1m])
```

You’d configure Prometheus Adapter to expose this metric to Kubernetes. Here’s an example configuration snippet for Prometheus Adapter:

```yaml
rules:
  - seriesQuery: 'http_requests_total{app="example-app"}'
    resources:
      overrides:
        namespace:
          resource: "namespace"
        pod:
          resource: "pod"
    name:
      matches: "^http_requests_total"
      as: "http_request_rate"
    metricsQuery: 'sum(rate(http_requests_total{app="example-app"}[1m]))'
```

Now, Kubernetes can query the custom metric `http_request_rate`.

#### Step 2: Configure HPA

With the custom metric exposed, you can reference it in your HPA:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: http-request-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: example-deployment
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Pods
    pods:
      metric:
        name: http_request_rate # Custom metric name
      target:
        type: AverageValue
        averageValue: 100 # Target 100 requests per second per pod
```

With this configuration, Kubernetes will monitor the `http_request_rate` metric and scale the number of pods in `example-deployment` to ensure each pod handles ~100 requests per second.

### Gotchas with Custom Metrics

1. **Metrics Adapters Are a Dependency**: If the metrics adapter crashes or misbehaves, HPA might stop working. Monitor your adapter just like you would any other critical service.

2. **Metric Accuracy**: Be careful when writing your Prometheus queries. Subtle bugs can lead to over- or under-scaling.

3. **API Permissions**: You’ll need to give the metrics adapter proper permissions to query your custom metric. This usually involves creating a `ClusterRole` and `ClusterRoleBinding`.

---

## Debugging HPA

When your HPA isn’t behaving as expected, it’s usually due to one of these culprits:

1. **Missing Metrics**: Run `kubectl get --raw /apis/metrics.k8s.io/v1beta1` to ensure Metrics Server is working. For custom metrics, use `kubectl get --raw /apis/custom.metrics.k8s.io/v1beta1`.

2. **HPA Events**: Check the events for your HPA to see why it’s not scaling:

   ```bash
   kubectl describe hpa http-request-scaler
   ```

3. **Pod Metrics**: Use `kubectl top pods` to manually inspect resource usage and compare it with your HPA thresholds.

---

## Actionable Takeaways

1. **Use Memory Scaling Carefully**: It’s a powerful tool but not always as reactive as CPU-based scaling.

2. **Leverage Custom Metrics for Real-World Use Cases**: Don’t limit yourself to CPU and memory. Whether it’s queue depth, request latency, or error rate, custom metrics let you scale on what matters most.

3. **Test, Debug, Repeat**: HPA configurations can behave unexpectedly. Test your scaling rules in a lower environment before rolling them out to production.

4. **Monitor Your Metrics Pipeline**: Custom metrics rely on a chain of tools (e.g., Prometheus, adapter) to work. If any piece of that chain fails, your scaling strategy could break.

HPA is one of Kubernetes’ most powerful tools for dynamic scaling. But to get the most out of it, you’ve got to move beyond the basics. Start small, experiment, and let the metrics guide you. Before you know it, your cluster will be scaling like a pro.
