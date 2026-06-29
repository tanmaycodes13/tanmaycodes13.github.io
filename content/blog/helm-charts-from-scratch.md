---
title: "Writing Helm Charts from Scratch: A Practical Walkthrough"
date: "2026-06-22"
description: "How to create, template, and manage Helm charts for Kubernetes deployments with real-world patterns."
tags: ["kubernetes", "helm", "devops"]
---
# Writing Helm Charts from Scratch: A Practical Walkthrough

Let’s face it: managing Kubernetes manifests by hand gets old fast. Manually stitching together YAML files for Deployments, Services, Ingress, and ConfigMaps is tedious, error-prone, and just doesn’t scale. That’s where Helm comes in. It’s the package manager for Kubernetes, and it’s a lifesaver when you need to manage complex applications with dozens of components and configurations.

In this post, I’ll walk you through creating a Helm chart from scratch, templating it, and applying some real-world patterns. By the end, you’ll have a solid foundation to build and manage your own Helm charts like a pro.

---

## Why Helm?

Before we dive into the how, let’s talk about the why. Helm lets you:

1. **Templatize Kubernetes YAML**: No more copy-pasting the same config across multiple environments.
2. **Reuse and share**: Package your application configs into a chart that others (or future you) can use.
3. **Manage upgrades**: Helm keeps track of what’s deployed and helps with upgrades or rollbacks.
4. **Centralize config**: Use `values.yaml` for environment-specific overrides, so you can easily deploy the same chart across staging, production, and more.

If you’ve ever dreaded updating 10 different YAMLs for a small config change, you’ll immediately appreciate Helm.

---

## Step 1: Getting Started with Helm

First, make sure you have Helm installed. If you don’t, you can grab it [here](https://helm.sh/docs/intro/install/).

To start a new Helm chart, run:

```bash
helm create my-chart
cd my-chart
```

This creates a directory structure like this:

```
my-chart/
├── charts/          # Subcharts (if your app depends on other charts)
├── templates/       # Templated YAML files (Deployments, Services, etc.)
├── values.yaml      # Default configuration values
├── Chart.yaml       # Metadata about your chart
└── .helmignore      # Ignore file for packaging
```

The `templates/` directory is where the magic happens. Let’s start by creating a Deployment template.

---

## Step 2: Writing a Deployment Template

In `templates/`, create a new file called `deployment.yaml` and add the following:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web # Use the release name as a prefix
  labels:
    app: {{ .Chart.Name }}
spec:
  replicas: {{ .Values.replicaCount }} # Reference a value from values.yaml
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
    spec:
      containers:
      - name: web
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 80
```

A few things to note here:

- **`.Release.Name`**: This is a built-in Helm variable that holds the name of the release (set when you run `helm install`).
- **`.Chart.Name`**: Refers to the name of your chart, as defined in `Chart.yaml`.
- **`.Values`**: Pulls values from `values.yaml` (or overrides passed via the CLI).

This template is dynamic and reusable. You can now configure the `replicaCount` and image details in `values.yaml`.

---

## Step 3: Configuring `values.yaml`

Open `values.yaml` and define some default values:

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: "1.21"
```

With this setup, the Deployment will spin up two replicas of `nginx:1.21` by default. If you need a different replica count or image in another environment, you can override these values when installing or upgrading your chart.

---

## Step 4: Adding a Service Template

Every Deployment needs a way to expose itself, so let’s create a Service.

In `templates/`, create `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-web
  labels:
    app: {{ .Chart.Name }}
spec:
  type: {{ .Values.service.type }}
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: {{ .Chart.Name }}
```

Next, update `values.yaml` with a default service type:

```yaml
service:
  type: ClusterIP
```

This creates a `ClusterIP` service by default. If you need to expose the app externally (e.g., via a LoadBalancer), just override `service.type`.

---

## Step 5: Installing Your Helm Chart

With your chart ready, it’s time to deploy it. Run this command to install the chart in your Kubernetes cluster:

```bash
helm install my-release ./my-chart
```

- `my-release` is the name of the Helm release.
- `./my-chart` points to your chart directory.

To verify the installation:

```bash
kubectl get all
```

You should see the Deployment and Service created by your chart.

---

## Real-World Patterns and Gotchas

### Pattern: Using Environment-Specific Overrides

Let’s say you need different configs for staging and production. Create separate `values` files:

- `values-staging.yaml`:

  ```yaml
  replicaCount: 2
  image:
    tag: "1.21-staging"
  ```

- `values-prod.yaml`:

  ```yaml
  replicaCount: 5
  image:
    tag: "1.21-prod"
  ```

Install the chart with the appropriate values file:

```bash
helm install my-release ./my-chart -f values-staging.yaml
```

This keeps your staging and production configs clean and isolated.

### Gotcha: Trailing Whitespace in YAML

Helm’s templating is whitespace-sensitive. If you accidentally add trailing spaces or newlines, you might end up with invalid YAML. Use a linter like `yamllint` to catch these issues before deploying.

---

## Step 6: Upgrading and Rollbacks

Helm makes it easy to upgrade your app. For example, to change the replica count:

1. Edit `values.yaml` or provide a flag:
   ```bash
   helm upgrade my-release ./my-chart --set replicaCount=3
   ```

2. Verify the change:
   ```bash
   kubectl get deployment
   ```

If something goes wrong, rolling back is just as simple:

```bash
helm rollback my-release 1 # Rollback to revision 1
```

---

## Actionable Takeaways

1. **Start small**: Focus on one resource (like a Deployment) when learning Helm.
2. **Use `values.yaml`**: Centralize all configs and avoid hardcoding values in templates.
3. **Leverage overrides**: Use environment-specific values files for staging, production, etc.
4. **Validate early**: Run `helm template ./my-chart` to preview rendered YAML before deploying.
5. **Document your chart**: Add comments in `values.yaml` and provide a `README.md` for your chart.

Helm might feel overwhelming at first, but trust me—it’s worth the effort. Once you get the hang of it, you’ll never go back to wrangling raw YAML by hand.

Got questions or favorite Helm tricks? Let me know in the comments!
