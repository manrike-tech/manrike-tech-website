---
title: DNS lookup commands
description: dig and resolvectl commands for checking records, resolvers and propagation.
published: 2026-10-08
category: networking
tags: [dns, networking, cli]
kind: cheatsheet
---

| Task                                   | Command                                   |
| -------------------------------------- | ----------------------------------------- |
| A record, short output                 | `dig +short example.com A`                |
| Query a specific resolver              | `dig @9.9.9.9 example.com AAAA`           |
| Mail servers                           | `dig +short example.com MX`               |
| Reverse lookup                         | `dig -x 192.0.2.10 +short`                |
| Trace delegation from the root         | `dig +trace example.com`                  |
| Show DNSSEC records                    | `dig +dnssec example.com`                 |
| Authoritative name servers             | `dig +short example.com NS`               |
| Resolve via systemd-resolved           | `resolvectl query example.com`            |
| Resolver configured per interface      | `resolvectl status`                       |
| Flush systemd-resolved cache           | `sudo resolvectl flush-caches`            |

`dig` is in the `dnsutils` (Debian/Ubuntu) or `bind-utils` (Fedora/RHEL)
package.
