---
title: talosctl essentials
description: Everyday talosctl commands for inspecting Talos Linux nodes, which have no SSH or shell.
published: 2026-10-18
category: talos
tags: [talos, kubernetes, cli]
kind: cheatsheet
relatedNotes: [kubernetes/crashloopbackoff]
---

Talos Linux is managed only through its API, so `talosctl` replaces SSH.
Pass target nodes with `--nodes` (`-n`) and the API endpoint with
`--endpoints` (`-e`), or set them in your `talosconfig`.

| Task                                | Command                                   |
| ----------------------------------- | ----------------------------------------- |
| Live dashboard of a node            | `talosctl -n <ip> dashboard`              |
| Cluster health check                | `talosctl -n <ip> health`                 |
| Kernel messages                     | `talosctl -n <ip> dmesg`                  |
| Service status                      | `talosctl -n <ip> services`               |
| Logs of a system service            | `talosctl -n <ip> logs kubelet`           |
| Cluster members                     | `talosctl -n <ip> get members`            |
| Fetch admin kubeconfig              | `talosctl -n <ip> kubeconfig`             |
| Running machine configuration       | `talosctl -n <ip> get machineconfig -o yaml` |

Reference: [Talos Linux documentation](https://docs.siderolabs.com/talos/)
