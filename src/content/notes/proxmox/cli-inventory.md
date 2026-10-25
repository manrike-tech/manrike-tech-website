---
title: Proxmox VE inventory from the CLI
description: Listing VMs, containers, storage and cluster state on a Proxmox VE node.
published: 2026-10-16
category: proxmox
tags: [proxmox, cli]
kind: quick-note
---

Run on any Proxmox VE node as root:

```bash
qm list                 # QEMU/KVM virtual machines on this node
pct list                # LXC containers on this node
pvesm status            # storage pools and usage
pvecm status            # cluster membership and quorum
pveversion -v           # installed package versions
```

Cluster-wide view through the API, including other nodes:

```bash
pvesh get /cluster/resources --type vm --output-format json-pretty
```

Reference: [Proxmox VE administration guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.html)
