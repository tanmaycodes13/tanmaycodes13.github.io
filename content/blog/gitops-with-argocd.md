---
title: "GitOps with ArgoCD: Declarative Deployments Done Right"
date: "2026-05-11"
description: "How to implement GitOps workflows using ArgoCD for Kubernetes deployments with automatic sync and rollbacks."
tags: ["gitops", "argocd", "kubernetes"]
---
# GitOps with ArgoCD: Declarative Deployments Done Right

Let’s face it—managing Kubernetes deployments can get messy fast if you’re not careful. Mismatched configurations, manual updates, and “works-on-my-machine” scenarios are all-too-common headaches. If you’re tired of playing whack-a-mole with your deployments, it’s time to embrace GitOps.

GitOps brings order to the chaos by treating Git as the single source of truth for your Kubernetes deployments. And when it comes to implementing GitOps workflows, ArgoCD is hands-down one of the best tools out there. In this post, I’ll show you how to set up GitOps with ArgoCD to enable declarative deployments, automatic syncs, and even rollbacks.

## Why ArgoCD for GitOps?

ArgoCD isn’t the only GitOps tool in town, but it’s one of the most popular for good reason. It integrates seamlessly with Kubernetes, provides a web UI for visualizing and managing your applications, and supports advanced features like automated rollbacks. 

The best part? ArgoCD is opinionated, but not rigid. It’s simple enough for GitOps newcomers yet flexible enough for advanced use cases. Whether you’re scaling up a multi-cluster setup or just managing a single app, ArgoCD has you covered.

## Setting Up ArgoCD

Before we dive into GitOps workflows, let’s get ArgoCD up and running. I’m assuming you already have a Kubernetes cluster and `kubectl` configured.

### Step 1: Install ArgoCD

The easiest way to install ArgoCD is via its Helm chart or the official YAML manifests. Here’s the quick and dirty method using `kubectl`:

```bash
# Create the ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD core components
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

Once installed, you can check the status of the pods:

```bash
kubectl get pods -n argocd
```

### Step 2: Expose the ArgoCD API Server

By default, the ArgoCD API server is exposed as a ClusterIP service. To access the web UI, you’ll need to port-forward or expose it via a LoadBalancer or an Ingress. For simplicity, let’s port-forward for now:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then open [https://localhost:8080](https://localhost:8080) in your browser.

### Step 3: Login to ArgoCD

First, retrieve the initial admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Use the username `admin` and the password you just retrieved to log in. You’ll be greeted by the ArgoCD dashboard.

## Configuring Your GitOps Workflow

Now that ArgoCD is set up, let’s define a GitOps workflow. At its core, GitOps centers around the idea that your desired application state is stored in a Git repository. ArgoCD monitors this repository and syncs any changes to your Kubernetes cluster.

### Step 4: Create a Git Repository with Kubernetes Manifests

Start by creating a Git repository that contains your Kubernetes manifests. Here’s a simple example structure for a basic Nginx deployment:

```
├── k8s
│   ├── deployment.yaml
│   ├── service.yaml
└── README.md
```

#### Example: `deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
```

#### Example: `service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

Push this repository to your Git provider (e.g., GitHub, GitLab, or Bitbucket).

### Step 5: Define an Application in ArgoCD

In ArgoCD, applications represent the link between your Git repository and your Kubernetes cluster. You can create applications via the CLI, web UI, or declarative YAML. Let’s stick with YAML:

#### Example: `nginx-application.yaml`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nginx-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/your-repo
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

Apply this file to ArgoCD:

```bash
kubectl apply -f nginx-application.yaml -n argocd
```

This tells ArgoCD to monitor the `k8s` folder in your Git repository. Updates to the manifests will automatically sync to your cluster.

### Step 6: Sync Your Application

After creating the application, you’ll see it appear in the ArgoCD UI. Click “Sync” to deploy the Nginx app for the first time.

From here on out, you can manage your Kubernetes deployments entirely through Git. Commit changes, push them to the repo, and let ArgoCD do the rest.

## Handling Rollbacks

One of the killer features of ArgoCD is automated rollbacks. If a deployment fails or introduces issues, you can easily revert to a previous state stored in Git.

Here’s a practical tip: use Git tags or branches for release versions (e.g., `v1.0`, `v1.1`). Then update the `targetRevision` field in your ArgoCD app spec to roll back:

```yaml
source:
  repoURL: https://github.com/your-org/your-repo
  targetRevision: v1.0
  path: k8s
```

ArgoCD will automatically sync your cluster to the specified version.

## Gotchas to Watch Out For

No tool is perfect, and ArgoCD has its quirks. Here are some common gotchas:

- **Sync Errors**: If your app doesn’t sync, check the logs for issues with your manifests or permissions. ArgoCD is picky about YAML formatting.
- **RBAC Configuration**: ArgoCD needs appropriate permissions to manage resources in your cluster. Make sure its service account has the required roles and bindings.
- **Drift Detection**: ArgoCD can detect and fix drift (i.e., when the live state differs from the desired state in Git), but only if `selfHeal` is enabled in your sync policy.

## Actionable Takeaways

1. **Start simple**: Use ArgoCD for one application first, then scale up as you grow comfortable with GitOps workflows.
2. **Structure your Git repo**: Keep your Kubernetes manifests organized with clear folder structures and naming conventions.
3. **Automate everything**: Enable automated sync and self-healing in your ArgoCD applications.
4. **Test rollbacks**: Simulate failed deployments and practice rolling back to previous states.
5. **Monitor regularly**: Use ArgoCD’s web UI or Prometheus metrics to monitor the health of your apps.

GitOps with ArgoCD isn’t magic—it’s just good engineering practice. By keeping your infrastructure declarative and version-controlled, you’ll save yourself countless hours of debugging and manual fixes. Give it a try, and let Git do the heavy lifting!
