---
title: "Building a low-level container runtime"
summary: "Diving deep into Linux container primitives and building a simple container runtime"
date: "Nov 03 2024"
draft: false
tags:
- Linux Kernel
- Containers
---

I love understanding the inner workings of systems. I have been working with containers for almost 2 years and I have always
wanted to understand its internals. So I took some time to explore the userspace and the Kernel level implementations of the
technologies that make containers possible.

I have written extensive notes on my finding and my implementations in my [notes collection](../notes/linux-containers). 
The project page is available [here](../projects/container-runtime) and the implementation is 
available at my github : [sheharyaar/container-runtime](https://github.com/sheharyaar/container-runtime).

This blog is about my experience and the things I found interesting. So buckle up!

## Experience

The first step was to figure out the workings of the namespaces userspace APIs 
like `clone()`, `unshare()` and `setns()`. I created byte-size programs and put them under 
`playground/` folder at the repository. Once I was through with the userspace part, I explored the 
Kernel code related to these system calls. I also referred to many great blogs and articles, which
I have mentioned in the docs itself.

After this, I went deeper into namespaces and studied the `nsproxy` structure and it's interaction with
the system calls. My prior experience with Linux Kernel helped me understand the source code with less
frustration. Exploring `cgroups` was the most difficult one and it was very frustrating to understand the
architecture and the multiple lists used by cgroups subsystem to connect the **controllers**, **cgroup** and
**tasks**.

Once this was done, the remaining process was easier. To start working on my implementation, I started with
the good blogs by [Hechao Li](https://hechao.li/posts/Mini-Container-Series-Part-0-Not-a-Real-Container/). For
confusing topics and blockers I had to refer to [lxc](https://github.com/lxc/lxc) and 
[runc](https://github.com/opencontainers/runc/) implementations.

## Interesting stuff

Prior to this undertaking, I was aware of the theory of containers, but implementing taught me a lot of 
new things. I spent much time debugging and understanding the effect of namespace isolation on the child process, parent process
 and synchronization between them. Making `pivot_root` work was another huge task to understand and do it
 correctly.

### Parent and child synchronization

When you clone a process with flags like `CLONE_NEWNS`, `CLONE_NEWIPC`, `CLONE_NEWNET` and separation
of Virtual Memory and Filesystem, you are left with few choices of process synchronizations.

What didn't work : 

- IPC mechanisms like `semaphores`, `message queues` and `shared memory` do not work due to IPC isolation and
no common memory between the child and parent (due to absence of `CLONE_VM` flag).

- UNIX sockets could not be used since the file system was also isolated. To make this work, there needed To
be a common area of FS where the socket would have to be created, leading to complex solutions. Similarly, 
isolation of network namespace using `CLONE_NEWNET` makes it difficult to use TCP or other sockets.

What worked :

- `pipe` (verified it myself) and `eventfd` (not verified) are two ways that would work. I used `pipe`
to synchronize the parent and the child process.

### Why was synchronization needed ?

I was using `CLONE_NEWUSER` flag which creates a user namespace, so the child process has different user
ID in the new namespace. To add on the difficulty, there needs to be a mapping between the host namespace / 
parent namespace and the container namespace for programs to make changes to the system.

If the `UID 0` of the container is mapped as `UID 1000` or any other non-zero value on the host, then it
would not be able to make privileged changes on the host system. But if we map the `UID 0` of the container
to the `UID 0` of the host, the container is allowed to run privileged instructions, except a few. This is how
`--privileged` option works in Docker. 

So this has to be done by the **parent process** `after` the child is cloned. So the child `must wait` for the
parent to setup the mappings in `/proc/child_pid/uid_map` and corresponding `gid_map` files before it can 
exec the command provided by the user.

### Cgroups

To deal with cgroup limits, I had two options: 

- After cloning the child, move the process to the cgroup by writing the child PID to `cgroup.procs` file.
This is not the recommended method if we need to create a new process.

- The other method was to use `CLONE_INTO_CGROUP` flag for `clone3`, which required the support of `clone3`
syscall in the Kernel. This made it easy to set cgroup limits and let the child be created directly into the
cgroup.

### Mount and pivot_root

One of the tough task was to understand and do `pivot_root` correctly. This was made complex by the task
to mount `procfs` in the child namespace. After much experiment, I managed to do it correctly. I have
documented in the [Setting up the file-system](../notes/linux-containers/04-project/#setting-up-the-file-system)
in my notes.

### Network connection with the host

The last part that I wanted to implement was a veth connection between the host network namespace as `veth0`
and the container as `veth1`. I failed here, due to my lack of experience with `netlink` and `rtnetlink` in
particular. I tried using both the raw `netlink socket` and the `libnl` library, but I faced issues that I 
could not debug. I have added it my `TODO` list, which I would pickup once I get enough experience with netlink.

## My notes

My notes are available [here](../notes/linux-containers).

Thank you for reading the blog ❤️. I hope my work helped you!