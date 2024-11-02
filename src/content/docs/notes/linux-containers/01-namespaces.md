---
title: Linux namespaces
---

- A namespace wraps a global system resource in an abstraction that makes it appear to the processes within the namespace that they have their own isolated instance of the global resource.
- Changes to the global resource are visible to other processes that are members of the namespace, but are invisible to other processes. One use of namespaces is to implement containers.

## Types of Namespaces

| Namespace | Flag | Isolates |
| --- | --- | --- |
| Cgroup | CLONE_NEWCGROUP | Cgroup root directory |
| IPC | CLONE_NEWIPC | System V IPC, POSIX message queues |
| Network | CLONE_NEWNET | Network devices, stacks, ports, etc. |
| Mount | CLONE_NEWNS | Mount points |
| PID | CLONE_NEWPID | Process IDs |
| Time | CLONE_NEWTIME | Boot and monotonic clocks |
| User | CLONE_NEWUSER | User and group IDs |
| UTS | CLONE_NEWUTS | Hostname and NIS domain name |

## Linux API

- `clone()` - used to create process copies. Used to fork, vfork, clone processes and to create threads. See the manpage for full flags
- `setns()` - used to move a thread to a namespace
- `unshare()`
	- unshare when the calling process wants to make some changes to the namespace attributes which was done using clone. The flags here are similar to many of `clone` flags.
	- **Kernel Level**: after copying associated structures → kernel calls `switch_task_namespace` (see below in Kernel Dive) which switches the `nxproxy` struct for the task and reduces the refcount of the old nsproxy.

	<table>
	  <thead>
		<tr>
		  <th style="white-space: nowrap;">Flag</th>
		  <th>Affects</th>
		  <th>How (Kernel Level)</th>
		</tr>
	  </thead>
	  <tbody>
		<tr>
		  <td style="white-space: nowrap;">CLONE_FILES</td>
		  <td>• isolates the current process’ file descriptor table, so closing a fd does not affect the other process’ fd</td>
		  <td>
			• fetches the current <code>file_struct</code> (open file table structure)<br>
			• calls <code>dup_fd</code> to copy information from current task’s struct to the new struct
		  </td>
		</tr>
		<tr>
		  <td style="white-space: nowrap;">CLONE_FS</td>
		  <td>• The calling process, if it has been cloned using <code>CLONE_FS</code></td>
		  <td>
			• <code>unshare_fs</code> is called which fetches the original <code>fs_struct</code> from current task and then calls <code>copy_fs_struct</code>.<br>
			• <b>copy_fs_struct:</b> copies to a new fs_struct umask, root directory — also increases the refcount of the root directory using <code>path_get</code>, copies the pwd, and increases the refcount.
		  </td>
		</tr>
		<tr>
		  <td style="white-space: nowrap;">CLONE_NEWPID</td>
		  <td>
			• the children process and <b>not</b> the calling process<br>
			• implies <code>CLONE_THREAD</code><br>
			• requires <code>CAP_SYS_ADMIN</code>
		  </td>
		  <td></td>
		</tr>
		<tr>
		  <td style="white-space: nowrap;">CLONE_NEWNS</td>
		  <td>• the calling process</td>
		  <td>• copies all the namespace-related stuff from <code>nsproxy</code> to a new nsproxy struct.</td>
		</tr>
		<tr>
		  <td style="white-space: nowrap;">CLONE_NEWIPC</td>
		  <td>• the calling process</td>
		  <td></td>
		</tr>
	  </tbody>
	</table>



- `ioctl()` - [ioctl_nsfs(2) manpage](https://man7.org/linux/man-pages/man2/ioctl_nsfs.2.html)

## Proc Interface

### Process-specific namespace directories

- present at : `/proc/pid/ns/`
- these are links to a handle which will open that particular namespace

```bash
$ ls -l /proc/$$/ns | awk '{print $1, $9, $10, $11}'
total
lrwxrwxrwx cgroup -> cgroup:[4026531835]
lrwxrwxrwx ipc -> ipc:[4026531839]
lrwxrwxrwx mnt -> mnt:[4026531841]
lrwxrwxrwx net -> net:[4026531840]
lrwxrwxrwx pid -> pid:[4026531836]
lrwxrwxrwx pid_for_children -> pid:[4026531836]
lrwxrwxrwx time -> time:[4026531834]
lrwxrwxrwx time_for_children -> time:[4026531834]
lrwxrwxrwx user -> user:[4026531837]
lrwxrwxrwx uts -> uts:[4026531838]
```

- The content of this symbolic link is a string containing the **namespace type** and **inode number**.
	- The inode number is used to - (a) compare if two processes belong to the same namespace and (b) manipulate namespaces programatically.
- **Bind mounting** one of the files in this directory to somewhere else in the filesystem **keeps the corresponding namespace** of the process specified by pid **alive** even if all processes currently in the namespace terminate.
- **Opening one of the files** in this directory (or a file that is bind mounted to one of these files) returns a file handle for the corresponding namespace of the process specified by pid.  As long as this file descriptor remains open, the namespace will **remain alive**, even if all processes in the namespace terminate. The file descriptor can be passed to `setns` .
- If two processes are in the **same namespace**, then the **device IDs** and **inode numbers** of their `/proc/pid/ns/xxx` symbolic links will be the same; an application can check this using the `stat.st_dev` and `stat.st_ino` fields returned by `stat` .
- Permission to de-reference or read (`readlink`) these symbolic links is governed by a ptrace access mode `PTRACE_MODE_READ_FSCREDS` check

### Global limit directory

- present at : `/proc/sys/user`

```bash
$ ls /proc/sys/user/
max_cgroup_namespaces
max_fanotify_groups
max_fanotify_marks
max_inotify_instances
max_inotify_watches
max_ipc_namespaces
max_mnt_namespaces
max_net_namespaces
max_pid_namespaces
max_time_namespaces
max_user_namespaces
max_uts_namespaces
```

- The values in these files are modifiable by privileged processes.
- The limits are per-user.  Each user in the same user namespace can create namespaces up to the defined limit. The limits apply to all users, including UID 0.
- Upon encountering these limits, `clone` and `unshare` fail with the error `ENOSPC`.
- For the **initial** user namespace, the default value in each of these files is **half the limit** on the number of threads that may be created (`/proc/sys/kernel/threads-max`).  In all
descendant user namespaces, the default value in each file is **MAXINT**.
- When a namespace is created, it is accounted against the creator UIDs in each of the ancestor user namespaces, and the kernel ensures that the corresponding namespace limit for the creator UID in the ancestor namespace is not exceeded.

## Namespace Lifetime

Generally, if all the processes in the namespace exit, it is also torn off. Except for the following cases :

- An open file descriptor or a bind mount exists for `proc/pid/ns/*` file.
- The namespace is hierarchical and has a child namespace.
- and more at [namespaces(7) manpage](https://man7.org/linux/man-pages/man7/namespaces.7.html)

## Kernel Dive

### struct nsproxy

- data structure to hold all the namespace pointers for a given task/process (except the PID namespace).
- Instead of PID namespace of the current task, it contains the PID namespace for the children processes. For current task’s PID namespace, you can use : `task_active_pid_ns()` .
- One possible reasons for PID namespace of the current task to not be in the **nsproxy** struct is that, when a process calls `setns()` or `unshare()` to change the PID namespace, that affects the PIDs of the children instead of the caller (since a process’ PID is fixed and cannot be changed through it’s lifetime). These calls make changes to the `nsproxy` structure, hence the structure contains the PID namespace pointer for the children.
- A statically declared nsproxy is used as initial nsproxy

```c
struct nsproxy {
	refcount_t count;
	struct uts_namespace *uts_ns;
	struct ipc_namespace *ipc_ns;
	struct mnt_namespace *mnt_ns;
	struct pid_namespace *pid_ns_for_children;
	struct net       *net_ns;
	struct time_namespace *time_ns;
	struct time_namespace *time_ns_for_children;
	struct cgroup_namespace *cgroup_ns;
};

/* Init proxy */
struct nsproxy init_nsproxy = {
	.count                      = REFCOUNT_INIT(1),
	.uts_ns                     = &init_uts_ns,
#if defined(CONFIG_POSIX_MQUEUE) || defined(CONFIG_SYSVIPC)
	.ipc_ns                     = &init_ipc_ns,
#endif
	.mnt_ns                     = NULL,
	.pid_ns_for_children        = &init_pid_ns,
#ifdef CONFIG_NET
	.net_ns                     = &init_net,
#endif
#ifdef CONFIG_CGROUPS
	.cgroup_ns          = &init_cgroup_ns,
#endif
#ifdef CONFIG_TIME_NS
	.time_ns            = &init_time_ns,
	.time_ns_for_children       = &init_time_ns,
#endif
};
```

### switch_task_namespaces

- This function is used by functions to switch the namespace from old to a new one and bump down the refcount of the old one. If the new is NULL, then the namespace reference is removed from the process (usually when the process exits).
- This is called indirectly by `setns` and by `unshare` if the `CLONE_NEWNS` flag is used.

```c
void switch_task_namespaces(struct task_struct *p, struct nsproxy *new)
{
	struct nsproxy *ns;

	might_sleep();

	task_lock(p);
	ns = p->nsproxy;
	p->nsproxy = new;
	task_unlock(p);

	if (ns)
		put_nsproxy(ns);
}
```

### kernel_clone and copy functions

- `fork()` and `clone()` use a common kernel function `kernel_clone()` to create a new process. This process calls `copy_process()` which does the heavy-lifting of copying the required registers and process environment from the old process to the new process (it does not start the process, which is done in kernel_clone).
- **copy_process** is a very large function, here we will only see the interesting parts (related to namespaces). `__latent_entropy` is a GCC plugin to generate entropy whenever a new process is created to help the cryptographic functions (see: [Stackoverflow -- What does __latent_entropy is used for in C](https://stackoverflow.com/questions/68975713/what-does-latent-entropy-is-used-for-in-c)).
- It uses `copy_*` functions as you can see in the snippet below, these are responsible for copying the various environment data such as FS, Namespace, etc.

```c
__latent_entropy struct task_struct *copy_process(
					struct pid *pid,
					int trace,
					int node,
					struct kernel_clone_args *args)
{
	...
	const u64 clone_flags = args->flags;
	struct nsproxy *nsp = current->nsproxy;

	... // clone flags sanity checks
	if ((clone_flags & (CLONE_NEWNS|CLONE_FS)) == (CLONE_NEWNS|CLONE_FS))
		return ERR_PTR(-EINVAL);

	if ((clone_flags & (CLONE_NEWUSER|CLONE_FS)) == (CLONE_NEWUSER|CLONE_FS))
		return ERR_PTR(-EINVAL);

	...
	/*
	 * Ensure that the cgroup subsystem policies allow the new process to be
	 * forked.*/
	retval = cgroup_can_fork(p, args);
	if (retval)
		goto bad_fork_put_pidfd;

	/* copy all the process information */
	retval = security_task_alloc(p, clone_flags);
	if (retval)
		goto bad_fork_cleanup_audit;
	retval = copy_semundo(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_security;
	retval = copy_files(clone_flags, p, args->no_files);
	if (retval)
		goto bad_fork_cleanup_semundo;
	retval = copy_fs(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_files;
	retval = copy_sighand(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_fs;
	retval = copy_signal(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_sighand;
	retval = copy_mm(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_signal;
	retval = copy_namespaces(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_mm;
	retval = copy_io(clone_flags, p);
	if (retval)
		goto bad_fork_cleanup_namespaces;
	retval = copy_thread(p, args);
	if (retval)
		goto bad_fork_cleanup_io;

	...
}

static int copy_fs(unsigned long clone_flags, struct task_struct *tsk)
{
	struct fs_struct *fs = current->fs;
	if (clone_flags & CLONE_FS) {
		fs->users++;
		return 0;
	}

	tsk->fs = copy_fs_struct(fs);
	if (!tsk->fs)
		return -ENOMEM;
	return 0;
}
```

### Unshare

- Unshare is used to reverse the clone effects on a process. The usual flow of unshare is that, it first copies the namespace related data from the current namespace proxy (using `unsahre_*` handlers), cleans or reduces the refcount of the old pointers and increase the refcount of the new ones. Then it sets the new pointers to the `nsproxy` of the process.
- If `CLONE_NEWNS` is used, then a new `nsproxy` is created and `switch_task_namespaces` is called to switch the nsproxy structure.
- copy_* functions used by kernel_clone() cannot be used here directly because they modify an inactive task_struct that is being constructed. Here we are modifying the current, active, task_struct.

```c
int ksys_unshare(unsigned long unshare_flags)
{
	...
	// flag checks
	...

	/* call unshare_* handlers */
	err = unshare_fs(unshare_flags, &new_fs);
	if (err)
		goto bad_unshare_out;

	err = unshare_fd(unshare_flags, &new_fd);
	if (err)
		goto bad_unshare_cleanup_fs;

	...

	if (new_fs || new_fd || do_sysvsem || new_cred || new_nsproxy) {
		...
		if (new_nsproxy)
			switch_task_namespaces(current, new_nsproxy);    // for CLONE_NEWNS

		/* set pointers of FS and other related namespaces */
		if (new_fs) {
			fs = current->fs;
			spin_lock(&fs->lock);
			current->fs = new_fs;
			if (--fs->users)        // reduce user count of old fs pointer
				new_fs = NULL;
			else
			    new_fs = fs;
			spin_unlock(&fs->lock);
		}

		if (new_fd)
			swap(current->files, new_fd);

		if (new_cred) {
			/* Install the new user namespace */
			commit_creds(new_cred);
			new_cred = NULL;
		}
	}

	...
}

/*
 * Unshare file descriptor table if it is being shared
 */
static int unshare_fd(unsigned long unshare_flags, struct files_struct **new_fdp)
{
	...
	if ((unshare_flags & CLONE_FILES) &&
		(fd && atomic_read(&fd->count) > 1)) {
		fd = dup_fd(fd, NULL);
		...
		*new_fdp = fd;
	}
	return 0;
}
```

> One thing to note is that when fork is called, the process is in inactive state but when unshare is called, the process is active.
>

## References

1. https://hechao.li/posts/Mini-Container-Series-Part-0-Not-a-Real-Container/
2. https://man7.org/linux/man-pages/man7/namespaces.7.html
3. https://www.redhat.com/sysadmin/pid-namespace
4. https://www.schutzwerk.com/en/blog/linux-container-namespaces05-kernel/
