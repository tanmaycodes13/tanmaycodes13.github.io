---
title: "Linux Cgroups and Namespaces: The Foundation of Containers"
date: "2026-04-21"
description: "Understanding the Linux primitives that make containers possible, with hands-on examples."
tags: ["linux", "containers", "platform-engineering"]
---
# Linux Cgroups and Namespaces: The Foundation of Containers

Let’s face it: containers are everywhere. Whether you're spinning up a quick Docker container or orchestrating thousands of pods with Kubernetes, containers have become the default way of running modern applications. But have you ever stopped to ask yourself *how* containers work under the hood? What makes them so lightweight compared to virtual machines?

The answer lies deep in the Linux kernel, specifically in two key primitives: **cgroups** and **namespaces**. These building blocks give containers their isolation, resource management, and flexibility. Today, we’re going to break this down, step by step, with hands-on examples to help you understand how it all works.

---

## What Are Cgroups and Namespaces?

### Cgroups: Controlling Resources

Cgroups (short for "control groups") are a Linux kernel feature that lets you limit, prioritize, and monitor the resources (CPU, memory, disk I/O, etc.) that processes can use. Think of cgroups as a way to say, "This process gets 1 CPU core and no more than 512 MB of RAM."

This is crucial for containers because it ensures that one process (or container) can’t hog all the resources on the host machine.

---

### Namespaces: Providing Isolation

Namespaces are another kernel feature that isolates different processes from each other. With namespaces, each container gets its own "view" of system resources, like the filesystem, network stack, process IDs (PIDs), and even user IDs (UIDs). As a result, a process running in one namespace can’t see or interact with processes in another namespace.

This isolation is what makes containers feel like mini virtual machines, even though they’re just processes running on the same OS underneath.

---

## Combining Cgroups and Namespaces for Containers

When you run a container with Docker or Kubernetes, it’s essentially just a Linux process that’s been wrapped with a cgroup (to limit its resources) and placed inside its own set of namespaces (to isolate it from the host and other containers).

Let’s dive into some practical examples.

---

## Example 1: Playing with PID Namespaces

To see namespaces in action, let’s manually create a new PID namespace. This will isolate a process so it thinks it’s the only process on the system.

```bash
# Run a new shell in a new PID namespace
unshare --fork --pid --mount-proc /bin/bash

# Inside this new shell, run the following:
ps aux
```

What do you notice? Suddenly, the process list is empty except for the `ps` command itself! That’s because we’re in a new PID namespace. The processes from the host system are hidden from this new namespace.

If you open another terminal and run `ps aux` on the host, you’ll still see all the processes, including the one for the `unshare` command. This demonstrates how namespaces isolate processes while they’re still technically running on the same system.

---

### Practical Tip: Use `unshare` for Debugging

The `unshare` command is an invaluable tool for experimenting with namespaces. You can combine multiple namespace flags (`--pid`, `--net`, `--mount`, etc.) to mimic container-like isolation. It’s a great way to learn by doing.

---

## Example 2: Using Cgroups to Limit CPU Usage

Now, let’s see how cgroups can be used to control CPU usage for a process. First, make sure cgroups are enabled on your system (most modern Linux distributions have it enabled by default).

1. Create a new cgroup for CPU control:

```bash
# Create a new cgroup directory
sudo mkdir /sys/fs/cgroup/cpu/my_cgroup

# Set a CPU limit of 50% (50000 out of 100000 "cpu.shares")
echo 50000 | sudo tee /sys/fs/cgroup/cpu/my_cgroup/cpu.cfs_quota_us
echo 100000 | sudo tee /sys/fs/cgroup/cpu/my_cgroup/cpu.cfs_period_us
```

2. Run a process in the new cgroup:

```bash
# Get the PID of a process (e.g., a stress test)
stress --cpu 1 &
echo $! > /sys/fs/cgroup/cpu/my_cgroup/cgroup.procs
```

Now, the CPU usage of the `stress` process will be limited to 50%. You can verify this by monitoring the process with `htop` or `top`.

3. Clean up:

```bash
# Kill the process and remove the cgroup
kill $(cat /sys/fs/cgroup/cpu/my_cgroup/cgroup.procs)
sudo rmdir /sys/fs/cgroup/cpu/my_cgroup
```

---

### Gotcha: Cgroups and Permissions

If you’re using a system with cgroups v2 (e.g., most modern Linux distributions), you might need to use a slightly different setup. For example, instead of `cpu.cfs_quota_us`, you’d use `cpu.max`. Always check your system’s cgroup version (`mount | grep cgroup`) and consult the documentation for the correct syntax.

---

## How Docker Uses Cgroups and Namespaces

When you run a container with Docker, it automatically configures cgroups and namespaces for you:

- It creates new PID, network, and mount namespaces for the container to isolate it from the host.
- It uses cgroups to limit the container’s CPU, memory, and I/O usage (e.g., `docker run --memory=512m --cpus=1`).

Docker abstracts all of this complexity away, which is great for productivity. But as platform engineers, it’s important to understand the underlying mechanics in case you need to debug or customize container behavior.

---

## Why Does This Matter?

Understanding cgroups and namespaces is critical if you want to go beyond just “using” containers. Here are a few scenarios where this knowledge can save your bacon:

1. **Debugging Resource Issues**: If a container is hogging memory or CPU, knowing how cgroups work can help you identify and mitigate the problem.
2. **Building Custom Container Runtimes**: If you’re working on a platform that needs its own container implementation, you’ll need to directly interact with cgroups and namespaces.
3. **Optimizing Performance**: Fine-tuning cgroup parameters can help you maximize resource utilization in multi-tenant environments.

---

## Wrapping Up

Cgroups and namespaces are the unsung heroes of modern containerization. They give us the ability to isolate processes and control their resource usage, which is the secret sauce behind technologies like Docker and Kubernetes.

Here’s what you can do next:

1. Use the `unshare` command to experiment with different namespaces.
2. Try creating custom cgroups to limit CPU or memory usage for a process.
3. Explore tools like `cgroups-tools` or `systemd` to manage cgroups at scale.

Understanding these Linux primitives might not make you a container expert overnight, but it’ll set the foundation for solving complex platform engineering problems down the line.

Happy hacking! 🚀
