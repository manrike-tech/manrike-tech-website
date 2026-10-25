---
title: 'Troubleshooting: Pod in CrashLoopBackOff'
description: A step-by-step checklist for diagnosing containers that keep restarting.
published: 2026-10-14
category: kubernetes
tags: [kubernetes, troubleshooting]
kind: troubleshooting
relatedNotes: [talos/talosctl-basics]
---

`CrashLoopBackOff` means the container starts, exits, and the kubelet waits
progressively longer before restarting it. The cause is inside the container
or its configuration, not the scheduler.

## 1. Read the events and last state

```bash
kubectl -n <namespace> describe pod <pod>
```

Check `Last State` (exit code and reason) and the `Events` section at the
bottom.

| Exit code | Usual meaning                                       |
| --------- | --------------------------------------------------- |
| `1`       | Application error; read the logs.                   |
| `126/127` | Command not executable / not found in the image.    |
| `137`     | Killed by SIGKILL, often `OOMKilled` (memory limit). |
| `143`     | SIGTERM, e.g. failed liveness probe.                |

## 2. Read the logs of the crashed container

```bash
kubectl -n <namespace> logs <pod> --previous
kubectl -n <namespace> logs <pod> -c <container> --previous   # multi-container pods
```

## 3. Common causes

- **Missing configuration:** referenced `ConfigMap` or `Secret` key does not
  exist, or an environment variable is empty.
- **Liveness probe too aggressive:** the app is killed before it finishes
  starting. Add a `startupProbe` or increase `initialDelaySeconds`.
- **Memory limit too low:** `Reason: OOMKilled`. Raise the limit or fix the leak.
- **Wrong command or arguments:** compare `command`/`args` with the image's
  entrypoint.

## 4. Inspect interactively

Run a debug container next to the failing one (requires ephemeral containers,
stable since Kubernetes 1.25):

```bash
kubectl -n <namespace> debug -it <pod> --image=busybox:1.36 --target=<container>
```

Reference: [Debug running pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
