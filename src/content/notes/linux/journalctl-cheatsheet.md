---
title: journalctl command reference
description: Filtering systemd journal logs by unit, time, priority and boot.
published: 2026-10-10
updated: 2026-10-22
category: systemd
tags: [systemd, logging, linux]
kind: cheatsheet
---

| Task                                   | Command                                        |
| -------------------------------------- | ---------------------------------------------- |
| Follow logs for a unit                 | `journalctl -u nginx.service -f`               |
| Last 50 lines, no pager                | `journalctl -u nginx.service -n 50 --no-pager` |
| Since a relative time                  | `journalctl --since "1 hour ago"`              |
| Time window                            | `journalctl --since "2026-10-01 08:00" --until "2026-10-01 09:00"` |
| Errors and worse                       | `journalctl -p err`                            |
| Current boot only                      | `journalctl -b`                                |
| Previous boot                          | `journalctl -b -1`                             |
| List recorded boots                    | `journalctl --list-boots`                      |
| Kernel messages                        | `journalctl -k`                                |
| Logs for a specific executable         | `journalctl /usr/sbin/sshd`                    |
| JSON output for parsing                | `journalctl -u nginx.service -o json-pretty`   |
| Disk usage of the journal              | `journalctl --disk-usage`                      |
| Shrink journal to 500 MB               | `sudo journalctl --vacuum-size=500M`           |

## Persistent logs

If `journalctl --list-boots` only shows the current boot, the journal is
volatile. Make it persistent:

```bash
sudo mkdir -p /var/log/journal
sudo systemctl restart systemd-journald
```

Reference: [journalctl(1)](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)
