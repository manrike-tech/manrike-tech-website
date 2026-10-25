---
title: Hardening OpenSSH on Linux servers
description: 'A practical baseline for sshd: key-only authentication, no root logins, drop-in configuration and safe validation before reloading.'
published: 2026-10-20
category: hardening
tags: [ssh, linux, hardening]
kind: tutorial
featured: true
relatedNotes: [linux/journalctl-cheatsheet]
---

## Context

SSH is usually the first service exposed on a new server and the main path for
administrative access. The OpenSSH defaults are reasonable, but most
distributions still allow password authentication, which makes the service a
target for credential-stuffing and brute-force attempts.

## Objectives

- Allow public-key authentication only.
- Disable direct root logins.
- Keep local changes in a drop-in file so package upgrades do not overwrite them.
- Validate the configuration before applying it, without locking yourself out.

## Prerequisites

- A Linux host running OpenSSH 8.2 or later (drop-in support via `Include`).
- A non-root user with `sudo` rights.
- A working SSH key pair. Generate one on your workstation if needed:

```bash
ssh-keygen -t ed25519 -C "admin@workstation"
ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@server.example.com
```

## Implementation

Check that the main configuration includes drop-in files. Debian, Ubuntu and
recent Fedora/RHEL releases ship this line by default:

```bash
grep -n '^Include' /etc/ssh/sshd_config
# Include /etc/ssh/sshd_config.d/*.conf
```

Create a drop-in file. For most keywords, the **first** value sshd reads wins,
and included files are read at the position of the `Include` line, so a
drop-in near the top of `sshd_config` takes precedence.

```text
# /etc/ssh/sshd_config.d/10-hardening.conf
# Authentication
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey

# Session limits
MaxAuthTries 3
LoginGraceTime 30

# Reduce attack surface
X11Forwarding no
AllowAgentForwarding no
```

Optionally restrict which accounts may log in at all:

```text
AllowGroups ssh-users
```

## Validation

Test the syntax first. `sshd -t` exits non-zero and prints the problem if the
configuration is invalid:

```bash
sudo sshd -t && echo "configuration OK"
```

Print the effective configuration to confirm your values are the ones in use:

```bash
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|kbdinteractive|authenticationmethods'
```

Reload the service **while keeping your current session open**, then open a
second session to verify you can still log in:

```bash
sudo systemctl reload ssh    # Debian/Ubuntu
sudo systemctl reload sshd   # Fedora/RHEL/Arch
```

From your workstation, confirm that password authentication is refused:

```bash
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password admin@server.example.com
# Expected: Permission denied (publickey).
```

## Troubleshooting

| Symptom                                     | Likely cause                                                 |
| ------------------------------------------- | ------------------------------------------------------------ |
| `sshd -T` still shows `passwordauthentication yes` | Another file sets it earlier; check other drop-ins and cloud-init files. |
| Login fails after reload                    | Key not in `~/.ssh/authorized_keys` or wrong permissions on `~/.ssh`. |
| `Include` line missing                      | Older distribution; add the drop-in values directly to `sshd_config`. |

Read the authentication log to see why a login was rejected:

```bash
sudo journalctl -u ssh -u sshd --since "10 min ago"
```

## Security considerations

- Keep an out-of-band console (hypervisor console, IPMI, cloud serial console)
  available before changing remote access settings.
- Hardening sshd does not replace network controls: restrict port 22 to
  management networks or a VPN where possible.
- Rotate keys when people leave, and prefer per-person keys over shared ones.

## References

- [sshd_config(5) manual page](https://man.openbsd.org/sshd_config)
- [OpenSSH project](https://www.openssh.com/)
