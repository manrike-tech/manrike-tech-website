---
title: Designing a backup strategy for Proxmox VE
description: Work in progress. Draft used to verify that drafts are excluded from production builds.
published: 2026-10-24
category: proxmox
tags: [proxmox, backup]
kind: architecture
draft: true
---

## Context

_Draft: outline only._ This post will cover vzdump modes, Proxmox Backup Server,
retention policies and restore testing.

## Objectives

- Define recovery point and recovery time objectives per workload.
- Choose between local, NFS and Proxmox Backup Server targets.

## References

- [Proxmox VE backup and restore documentation](https://pve.proxmox.com/wiki/Backup_and_Restore)
