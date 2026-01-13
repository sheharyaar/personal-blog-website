---
title: "Writing a Debugger from Scratch"
summary: "A debugger for x86_64 Linux from sratch using C, Linux Syscalls and ELF library"
date: "Jan 13 2026"
draft: false
tags:
- C
- Linux
- ELF
repoUrl: https://github.com/sheharyaar/sherlock
blogUrl: ../blog/writing-a-debugger-00
---

![sherlock debugger](image.png)

In this project I dive into ELF, System V ABI, Linux ptrace system call, GDB source code and much more to develop a collection of tools - a syscall tracer (watson), a library tracer (irene) and a debugger (sherlock).