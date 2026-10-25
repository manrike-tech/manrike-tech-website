---
title: Replacing cron jobs with systemd timers
description: How to schedule recurring tasks with systemd timers, catch up on missed runs and inspect results with journalctl.
published: 2026-10-12
updated: 2026-10-18
category: systemd
tags: [systemd, linux, automation]
kind: tutorial
featured: true
relatedNotes: [linux/journalctl-cheatsheet]
---

## Context

Cron is simple and everywhere, but its jobs run outside the service manager:
output goes to local mail, failures are easy to miss and there is no built-in
dependency handling. On systemd-based distributions, timers solve those
problems with tools you already use for services.

## Objectives

- Run a script on a schedule using a service unit and a timer unit.
- Run missed executions after downtime.
- Inspect the schedule, last run and output.

## Implementation

A timer always activates a unit, by default the service with the same name.
Start with the service that does the work:

```ini
# /etc/systemd/system/backup-etc.service
[Unit]
Description=Archive /etc to /var/backups

[Service]
Type=oneshot
ExecStart=/usr/bin/tar -czf /var/backups/etc-%H.tar.gz /etc
```

Then the timer that triggers it:

```ini
# /etc/systemd/system/backup-etc.timer
[Unit]
Description=Daily /etc archive

[Timer]
OnCalendar=*-*-* 02:30:00
RandomizedDelaySec=15min
Persistent=true

[Install]
WantedBy=timers.target
```

- `OnCalendar` uses systemd's calendar syntax.
- `RandomizedDelaySec` spreads load when many hosts share the same schedule.
- `Persistent=true` runs the job at the next boot if the machine was off at
  the scheduled time.

Validate the calendar expression before enabling it:

```bash
systemd-analyze calendar '*-*-* 02:30:00'
```

Enable and start the timer, not the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now backup-etc.timer
```

## Validation

```bash
systemctl list-timers backup-etc.timer
sudo systemctl start backup-etc.service   # run once, now
journalctl -u backup-etc.service -n 20
```

## Troubleshooting

- **The timer never fires:** check that the *timer* is enabled
  (`systemctl is-enabled backup-etc.timer`) and that `daemon-reload` was run
  after editing units.
- **The job fails silently:** `systemctl status backup-etc.service` shows the
  last exit code; `journalctl -u backup-etc.service` shows the output.
- **Environment differences:** services do not inherit your shell
  environment. Use absolute paths or `Environment=` lines.

## Security considerations

Services run as root unless told otherwise. For jobs that do not need it, add
`User=` and sandboxing options such as `ProtectSystem=strict`,
`ProtectHome=true` and `PrivateTmp=true`, then review the result with
`systemd-analyze security backup-etc.service`.

## References

- [systemd.timer(5)](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html)
- [systemd.time(7): calendar syntax](https://www.freedesktop.org/software/systemd/man/latest/systemd.time.html)
