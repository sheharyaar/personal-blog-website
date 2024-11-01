---
title: Implementing a low-level container runtime
---

## Prerequisites

- To get started we need to be through the basics of [Linux Kernel Namespaces](../namespaces) and [Linux cgroups](../cgroups).
- Follow the blog series by Hechao Li : [Mini Container Series Part 0](https://hechao.li/posts/Mini-Container-Series-Part-0-Not-a-Real-Container/)
- Reference Code : [container-runtime](https://github.com/sheharyaar/container-runtime)

## Phases in starting a container

### Network setup

**TODO**: This section will be done after familiarity with Kernel Networking, Netlink and Virtual Networks, checkout [Network Isolation (TODO later)](../network-isolation)  for more information.

### Setting up the file-system

There are multiple steps involved in setting the file-system of a container. It is suggested to use `pivot_root` as a stronger mechanism to prevent `chroot` jail escape. The steps involved in the process are : 

- Open `/` and the `new_root` as passed by the user and get their file-descriptors.
- Change the directory to the new root **fd** using `fchdir`.
- To perform pivot_root, the following should be ensured :
    - The new root mount point is `PRIVATE`
    - The new root mount point is a mount point (by performing bind mount)
- Then we perform the pivot_root using a special case (which allows us to do this without creating a directory in the new_root).
- Then we go back to the old root (fchdir), and then unmount the old root. Here is the code without error-handling. You can also mount the **proc** file-system if you need.

```c
// get handles for oldroot and newroot
int oldroot = open("/", O_DIRECTORY | O_RDONLY, 0);
int newroot = open(ctx->rootfs, O_DIRECTORY | O_RDONLY, 0);

// change directory to the new root to perform pivot
fchdir(newroot);

// ensure that the new root mount point is PRIVATE
mount(NULL, "/", NULL, MS_REC | MS_PRIVATE, NULL);

// ensure the new root mount point is a mount point
mount(ctx->rootfs, ctx->rootfs, NULL, MS_BIND, NULL);

// perform pivot root
syscall(SYS_pivot_root, ".", ".");

/**
 * go back to oldroot. Why ?? : we need to unmount the oldroot,
 * acccording to pivot_root, oldroot is underneath the newroot,
 * so we need to be out of oldroot to unmount it.
 **/
(fchdir(oldroot);

// make the oldroot private to prevent the container unmount the oldroot in
// host
mount("", ".", "", MS_PRIVATE | MS_REC, NULL);

// unmount the old one
umount2(".", MNT_DETACH) == -1);

// go to the new root
chdir("/");

mount("proc", "/proc", "proc", MS_NOSUID | MS_NOEXEC | MS_NODEV, NULL);
```

### Namespace and cgroup setup

- To setup the namespace, you can either use `unshare` in the child process, or `clone` in the parent process. I avoided `unshare` to avoid closing the inherited file descriptors and other cleanups. I expected `clone` to be clean.
- For clone you can just call it using the flags. I used the raw syscall, since the `glibc` wrapper requires a starting function for the child.

```c
int flags = CLONE_NEWNS | CLONE_NEWPID | CLONE_NEWUTS | CLONE_NEWIPC
        | CLONE_NEWNET;
        
pid = syscall(SYS_clone, SIGCHLD | ctx->flags, 0, NULL, NULL, 0);
if (pid == -1) {
	/* error */
} else if (pid == 0) {
	/* child */
	setup_rootfs();
	exec();
} else {
	/* parent */
}
```

**TODO: Complete cgroup part**

### Console and Environment setup

### Extras

There are many more features that can be implemented in a container runtime such as — 

- Console or TTY setup
- SELinux policies
- AppArmor profiles
- Checkpoint and Restore
- Core scheduling dommain ([https://lwn.net/Articles/876707/](https://lwn.net/Articles/876707/))
- I/O Priority

For implementation and reference of these features, you can refer to [LXC](https://github.com/lxc/lxc) or [runC](https://github.com/opencontainers/runc/) implementations.