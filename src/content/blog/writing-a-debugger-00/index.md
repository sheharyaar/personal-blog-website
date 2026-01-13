---
title: "Writing a Debugger from Scratch"
summary: "A debugger for x86_64 Linux from sratch using C, Linux Syscalls and ELF library"
date: "Jan 13 2026"
draft: false
tags:
- C
- Linux
- ELF
---

### The Backstory

Some time in August last yer (2025), I was looking for something to work on that would keep me engaged for a few weeks and help me grow my skills. There were a lot of topics to choose from, and either these felt too difficult/overwhelming (kernel space) for me or felt easy to attempt (userspace). Though my assumptions on the easy things were obviously wrong, but this analysis paralysis led me to the following conclusion: select something in between. Well, in beetween the userspace and the kernel-space lies the system calls.

So I took out a list of syscalls and [`ptrace`](https://man7.org/linux/man-pages/man2/ptrace.2.html) caught my attention. I gave a light read of its manpage and after discovering the ability to stop/resume processes, inspect registers and memory, get syscall notifications, etc. I quickly concluded that this could be used to make a few tools like a system call tracer (strace), a library call tracer (ltrace) and possibly a simple debugger (gdb). Thus I decided to give this syscall a chance and started building my own set of tools - `watson` (a syscall tracer), `irene` (a library call tracer) and `sherlock` (a minimal debugger). All these names were inspired from one of my childhood favourite novel series Sherlock Holmes by Arthur Conan Doyle (and later the BBC series Sherlock). The entire collection together is also called as `sherlock` (I am quite bad with names).

Fast forward from September 2025 to January 2026, though I originally believed that it would take a few weeks of my engagement, I am surprised that it took me around 4 months to get through this. Initially my progress was slow, balancing my job, gym, friends, entertainment and my curiosity to learn but then by the end of December I was serious of the project and stole time from everything to work on this.

If you have read this far, I thank you for your time ♥️ and I hope my blogs will be worth reading.

### TLDR;

This post just summarises the events that led me to this project. The actual technical stuff starts from the next blog. It will be a five-part series which discusses the technical requirements, challenges and *some* code that would be suitable even for a newbie like me to get a decent grasp of the concepts. The link to the series:

1. [Writing a Debugger 01 - Stop/Resume a Program](#) 
2. [Writing a Debugger 02 - Inspecting Registers and Memory](#) 
3. [Writing a Debugger 03 - Symbol Resolution and Dynamic Linking](#) 
4. [Writing a Debugger 04 - Hardware Breakpoints and Watchpoints](#) 
5. [Writing a Debugger 05 - Backtrace , Stack Unwinding and Debug Frames](#) 

The project is available under MIT License on Github: https://github.com/sheharyaar/sherlock