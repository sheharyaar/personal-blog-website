---
title: Capabilities
---

- Traditionally, Linux supported two types of processes: **privileged** and **unprivileged**. This had various security concerns like — a program that needs only the privilege to create a raw socket can also be used to mount a file since it is executing as root. This made the attack surface very large.
- The developers decided to break the privileges into multiple **capabilities**, to reduce the attack surface. For a complete list of privileges, see [capabilities(7)](https://man7.org/linux/man-pages/man7/capabilities.7.html).

### Process capabilities

A process can obtain capabilities in 2 ways:

- **Inherited Capabilities**: A process can inherit a **subset** of parent’s capabilities set. This can be checked using `/proc/PID/status`.
```bash
$ cat /proc/$$/status
...
CapInh:	0000000000000000
CapPrm:	0000000000000000
CapEff:	0000000000000000
CapBnd:	000001ffffffffff
CapAmb:	0000000000000000
...
```
	
- **File Capabilities**: *If* the process is *capability-aware*, then the process binary can be granted capabilities using `setcap`.

### Types of Capabilities

As you can see in the previous code snippet, there are five different sets of capabilities:

- **Effective** (**CapEff**) — *effective* capabilities are the one that are **currently in use** by the process.
- **Permitted** (**CapPrm**) — these are the capabilities that the process is *allowed* to use.
- **Inherited** (**CapInh**) — capabilities that are allowed to be inherited from the parent during `exec` family of system calls.
- **Bounded** (**CapBnd**) — can be used to restrict capabilities that a process will ***ever* be able to use**. Only these capabilities will be allowed in **inherited** and **permitted** sets.
- **Ambient** (**CapAmb**) — applies to all **non-SUID** binaries **without** file capabilities. It preserves capabilities during `exec` family calls. Some capabilities can be dropped if they are nnot present in **inherited** or **permitted** sets.

### References

- [Linux Container Basics: Capabilities](https://www.schutzwerk.com/en/blog/linux-container-capabilities/)