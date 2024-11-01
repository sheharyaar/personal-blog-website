---
title: Linux cgroups
---

### What are cgroups ?

- Kernel feature that allows processes to be organised into hierarchical groups whose usage of various resources can be limited or monitored.
- A ***cgroup*** is a collection of processes that are bound to a set of limits or parameters defined via the cgroup file-system.
- A ***subsystem*** is a kernel component that modifies the behaviour of the processes in a cgroup.  Subsystems are sometimes also known as **resource controllers** (or simply, **controllers**).
- The cgroups for a controller are arranged in a **hierarchy**.  This hierarchy is defined by creating, removing, and renaming sub-directories within the cgroup file-system.
- Limits can be defined at each level. The limit at a level cannot be exceeded by a descendant sub-hierarchy.
- cgroups v1 is provided by **tmpfs** and cgroups v2 is provided through a pseudo-file-system called **cgroupfs**. For the purpose of the document, we will be dealing with cgroup v2 unless stated otherwise.
- **cgroup *v2*** is the new revamped system, but it does not contain all the controllers as in *v1*. Hence, it is designed in such a way that both v1 and v2 can exist at the same time. The only restriction here is that a controller can't be simultaneously employed in both a cgroups v1 hierarchy and in the cgroups v2 hierarchy.

### How are cgroups created or modified ?

- cgroups are initialised at boot time.
- To enable cgroup (v2), it should be mounted : `mount -t cgroup2 none $MOUNT_POINT`. On systemd enabled systems, systemd mounts the cgroupfs on boot.
- Only the root cgroup exists initially to which all processes belong. A child cgroup can be created using `mkdir` call to `sys/fs/cgroup` .

### cgroup v2

- Single unified hierarchy design in API and safer sub-tree delegation to containers.
- cgroups are of two parts — **core** and **controllers**. **Core** is responsible for hierarchically organising the processes and **controller** is responsible for distributing the specific type of resource. Core files have `cgroup.` as the file prefix.
- cgroups with no live processes or children (even if zombie processes still exist in that cgroup) can be removed by removing the directory using `rm`.

### Processes and controllers

- Any process belongs to one and **only one** cgroup. All threads of a process belong to the same cgroup (has this changed ??). All processes are put to the parent process’ cgroup at the time of creation (see [Phase 3 : Adding processes to cgroups](#phase-3--adding-processes-to-cgroups).)
- An exiting process belongs to the cgroups until the time it is **reaped**, but still the zombie processes won’t show up in `cgroup.procs` .
- `cgroup.procs` file stores the **PIDs** of the files that are under the given cgroup. A process can be migrated (see: [Phase 3 : Adding processes to cgroups](#phase-3--adding-processes-to-cgroups)) to another cgroup by writing its PID to the target cgroups’ `cgroup.procs` file.
- `/proc/$PID/cgroup` lists the process’ cgroup memberships.
- The controllers available (`cgroup.controllers`) are the ones which are available to the parent cgroup. Child cgroups cannot give more resources than what is allowed by any cgroup closer to the root. Effective controllers (`crgroup.subtree_control`) are the ones that are currently being used.

## Kernel Dive

In this section, I shall discuss the cgroup **core** instead of the controllers. To understand the kernel data structures, you should be familiar with Linux Kernel style of initialisation of handlers and interface-like structs. For example, `kernfs_syscall_ops` in Snippet 3.2 under Phase 3 of Kernel Dive later in this tutorial.

### Important data structures

#### struct cgroup_subsys

- This structure is used by cgroup to perform actions on the controllers. You can imagine it as an interface which has to be “implemented” by every cgroup controller.
- It contains handlers set by the controller implementation, `root` of the subsystem (by default to `&cgrp_dfl_root`  on initialisation during `cgroup_init_subsys` ), `cfts` that contain a list of all file types that will be used by the subsystem.

```c
struct cgroup_subsys {
    struct cgroup_subsys_state *(*css_alloc)(struct cgroup_subsys_state *parent_css);
    int (*css_online)(struct cgroup_subsys_state *css);
    void (*css_offline)(struct cgroup_subsys_state *css);
    void (*css_released)(struct cgroup_subsys_state *css);
    void (*css_free)(struct cgroup_subsys_state *css);
    ...
    bool early_init:1;
    bool threaded:1;

    /* the following two fields are initialized automatically during boot */
    int id;
    const char *name;

    struct cgroup_root *root;
    struct idr css_idr;
    struct list_head cfts;
    struct cftype *dfl_cftypes;	/* for the default hierarchy */
    struct cftype *legacy_cftypes;	/* for the legacy hierarchies */
    ...
};
```

Example of how PID controller sets its handlers for `cgroup_subsys` .

```c
struct cgroup_subsys pids_cgrp_subsys = {
    .css_alloc	= pids_css_alloc,
    .css_free	= pids_css_free,
    .can_attach 	= pids_can_attach,
    .cancel_attach 	= pids_cancel_attach,
    .can_fork	= pids_can_fork,
    .cancel_fork	= pids_cancel_fork,
    .release	= pids_release,
    .legacy_cftypes = pids_files_legacy,
    .dfl_cftypes	= pids_files,
    .threaded	= true,
};
```

#### struct cgroup_subsys_state

- This structure is embedded in all the controllers structures, for the following reasons :
    - This structure holds pointers to `struct cgroups`  and `struct cgroup_subsys` . Allows traversal the associated cgroup and the subsystem this state belongs to.
    - Children and sibling (anchored at parent’s→children) list, `nr_descendants`.
    - Subsystem id (since this is embedded in a subsystem), flags, serial_nr.
    - Online count of children (used for removal of cgroup).
    - Parent `cgroup_subsys_state` for caching and easy traversal.

```c
struct cgroup_subsys_state {
    struct cgroup *cgroup;
    struct cgroup_subsys *ss;
    ...
    struct list_head sibling;
    struct list_head children;
    int id;
    unsigned int flags;
    u64 serial_nr;
    atomic_t online_cnt;
    struct cgroup_subsys_state *parent;
    int nr_descendants;
};
```

#### struct cftype

This structure defines handlers that the cgroup controllers can use to define their own file-types.

- `file_offset` contains the file handle that is the **offset** of `struct cgroup_file` from the start of a controller struct (e.g: `struct pids_cgroup`). It is set as : 
`file_offset = offsetof(struct pids_cgroup, events_file)` .
- It also contains a pointer to the parent subsys struct.

```c
struct cftype {
    char name[MAX_CFTYPE_NAME];
    unsigned long private;

    /*
    * The maximum length of string, excluding trailing nul, that can
    * be passed to write.  If < PAGE_SIZE-1, PAGE_SIZE-1 is assumed.
    */
    size_t max_write_len;
    unsigned int flags;
  
    // file handle (fd) for cgroup files
    unsigned int file_offset;

    /*
    * Fields used for internal bookkeeping.  Initialized automatically
    * during registration.
    */
    struct cgroup_subsys *ss;	/* NULL for cgroup core files */
    struct list_head node;		/* anchored at ss->cfts */
    struct kernfs_ops *kf_ops;

    int (*open)(struct kernfs_open_file *of);
    void (*release)(struct kernfs_open_file *of);
    u64 (*read_u64)(struct cgroup_subsys_state *css, struct cftype *cft);
    s64 (*read_s64)(struct cgroup_subsys_state *css, struct cftype *cft);
    int (*seq_show)(struct seq_file *sf, void *v);
    ...
};
```

#### struct cgroup

- As we saw in the previous sections, cgroup is registered and implemented through handlers under `cgroup_subsys` (referred to as `ss` in the code) and the state used by the controllers is embedded in the controllers as `cgroup_subsys_state` (or `css` ).
- The cgroup core is also built under the same way. It also has an embedded state in it.
- It is also embedded in `struct cgroup_root`.

```c
struct cgroup {
    /** embedded state **/
    struct cgroup_subsys_state self;

    /** cgroup controller related fields **/
    unsigned long flags;		/* "unsigned long" so bitops work */

    /*
    * The depth this cgroup is at.  The root is at depth zero and each
    * step down the hierarchy increments the level.  This along with
    * ancestors[] can determine whether a given cgroup is a
    * descendant of another without traversing the hierarchy.
    */
    int level;
    int max_depth;

    int nr_descendants;
    int nr_dying_descendants;
    int max_descendants;

    /*
    * Each non-empty css_set associated with this cgroup contributes
    * one to nr_populated_csets. The counter is zero iff this cgroup
    * doesn't have any tasks.
    */
    int nr_populated_csets;
    int nr_populated_domain_children;
    int nr_populated_threaded_children;

    int nr_threaded_children;	/* # of live threaded child cgroups */
    ...

    /* The bitmask of subsystems enabled on the child cgroups.	 */
    u16 subtree_control;
    u16 subtree_ss_mask;
    u16 old_subtree_control;
    u16 old_subtree_ss_mask;

    /* Private pointers for each registered subsystem */
    struct cgroup_subsys_state __rcu *subsys[CGROUP_SUBSYS_COUNT];
    int nr_dying_subsys[CGROUP_SUBSYS_COUNT];
    struct cgroup_root *root;

    /*
    * List of cgrp_cset_links pointing at css_sets with tasks in this
    * cgroup.  Protected by css_set_lock.
    */
    struct list_head cset_links;
    struct cgroup *dom_cgrp;
    struct cgroup *old_dom_cgrp;		/* used while enabling threaded */
    ...
    /* All ancestors including self */
    struct cgroup *ancestors[];
};
```

#### struct cgroup_root

- This structure represents the root of a hierarchy and is used internally by the cgroup core.
- On boot, `cgrp_dfl_root` is set as the default cgroup_root. Usually the default root cgroup is accessed as `cgrp_dfl_root.cgrp` .

```c
struct cgroup_root {
    struct kernfs_root *kf_root;
    /* The bitmask of subsystems attached to this hierarchy */
    unsigned int subsys_mask;

    /* Unique id for this hierarchy. */
    int hierarchy_id;

    /* A list running through the active hierarchies */
    struct list_head root_list;
    struct rcu_head rcu;	/* Must be near the top */

    /* The root cgroup. */
    struct cgroup cgrp;
    ...
    /* Number of cgroups in the hierarchy, used only for /proc/cgroups */
    atomic_t nr_cgrps;

    /* Hierarchy-specific flags */
    unsigned int flags;
    ...
    /* The name for this hierarchy - may be empty */
      char name[MAX_CGROUP_ROOT_NAMELEN];
};
```

#### struct css_set

- This structure holds pointers to a set of `cgroup_subsys_state` . The task’s structure `task_struct` has a pointer to a set of subsys_set to speed up the forking process.

```c
struct task_struct {
    ...
    struct css_set __rcu *cgroups;
    struct list_head cg_list;
    ...
}
```

- On boot, `init_css_set` is the default subsystem state set.

```c
struct css_set {
    /*
    * Set of subsystem states, one for each subsystem. This array is
    * immutable after creation apart from the init_css_set during
    * subsystem registration (at boot time).
    */
    struct cgroup_subsys_state *subsys[CGROUP_SUBSYS_COUNT];

    /* the default cgroup associated with this css_set */
    struct cgroup *dfl_cgrp;

    /* internal task count, protected by css_set_lock */
    int nr_tasks;

    // Lists running through all tasks using this cgroup group.
    struct list_head tasks;
    struct list_head mg_tasks;
    struct list_head dying_tasks;

    /* all css_task_iters currently walking this cset */
    struct list_head task_iters;

    /*
    * On the default hierarchy, ->subsys[ssid] may point to a css
    * attached to an ancestor instead of the cgroup this css_set is
    * associated with.  The following node is anchored at
    * ->subsys[ssid]->cgroup->e_csets[ssid] and provides a way to
    * iterate through all css's attached to a given cgroup.
    */
    struct list_head e_cset_node[CGROUP_SUBSYS_COUNT];

    /* all threaded csets whose ->dom_cset points to this cset */
    struct list_head threaded_csets;
    struct list_head threaded_csets_node;

    /*
    * List running through all cgroup groups in the same hash
    * slot. Protected by css_set_lock
    */
    struct hlist_node hlist;

    /*
    * List of cgrp_cset_links pointing at cgroups referenced from this
    * css_set.  Protected by css_set_lock.
    */
    struct list_head cgrp_links;

    /*
    * If this cset is acting as the source of migration the following
    * two fields are set.  mg_src_cgrp and mg_dst_cgrp are
    * respectively the source and destination cgroups of the on-going
    * migration.  mg_dst_cset is the destination cset the target tasks
    * on this cset should be migrated to.  Protected by cgroup_mutex.
    */
    struct cgroup *mg_src_cgrp;
    struct cgroup *mg_dst_cgrp;
    struct css_set *mg_dst_cset;

    /* dead and being drained, ignore for migration */
    bool dead;
};
```

### Flowchart

**TODO**: Complete this. Flowchart from perspective of a task, cgroup, cgroup root, state, state set

### Navigating the cgroup structures

By this section, you must already be confused by the large number of data structures involved. So let’s study the structures through common questions.

1. How can a process access it’s cgroup

**TODO**: Complete this

## Phase 1 : Boot

On boot, the function `start_kernel` calls two cgroup core functions: **cgroup_init_early** and then **cgroup_init**.

### **cgroup_init_early**

1. `cgroup_init_early` is executed to intialise cgroups and other subsystems that request early initialisation.
2. Sets the cgroup **root** to `cgrp_dfl_root` .
3. Calls `init_cgroup_root` to initialise the default values for the cgroup.
4. Disable refcounting since the deafult cgroup root won’t be deleted.
5. Calls `cgroup_init_subsys` to early initialise the subsystems

```c
int __init cgroup_init_early(void)
{
    ctx.root = &cgrp_dfl_root;
    init_cgroup_root(&ctx);
    cgrp_dfl_root.cgrp.self.flags |= CSS_NO_REF;

    for_each_subsys(ss, i) {
        ...
        if (ss->early_init)
            cgroup_init_subsys(ss, true);
    }
    return 0;
}
```

### cgroup_init_subsys

- sets the root cgroup to default
- calls the subsystems `css_alloc` function to allocate the subsystem state.
- `init_and_link_css`: initialises and links the cgroup subsystem state (sets the cgroup, subsystem, id, serial number, sibling list, children list, etc.)
- Calls `css_online()` handler to get the subsystem online.
- Disables refcount, allocates id to this subsystem state and adds this to the `init_css_set` .

```c
static void __init cgroup_init_subsys(struct cgroup_subsys *ss, bool early)
{
    ...
    idr_init(&ss->css_idr);
    INIT_LIST_HEAD(&ss->cfts);

    /* Create the root cgroup state for this subsystem */
    ss->root = &cgrp_dfl_root;
    css = ss->css_alloc(NULL);

    /* We don't handle early failures gracefully */
    BUG_ON(IS_ERR(css));
    init_and_link_css(css, ss, &cgrp_dfl_root.cgrp);
    css->flags |= CSS_NO_REF;

    if (early) {
        /* allocation can't be done safely during early init */
        css->id = 1;
    } else {
        css->id = cgroup_idr_alloc(&ss->css_idr, css, 1, 2, GFP_KERNEL);
        BUG_ON(css->id < 0);
    }

    init_css_set.subsys[ss->id] = css;
    ...
}
```

### **cgroup_init**

1. Register the cgroup file-system and `/proc` file.
    1. register cgroup file types (**base** and **psi** files)
    2. init per-cpu **recursive statistics**.
2. Initialise subsystems that **did not** request early init. For each subsystem, initialise the subsystem and then **populate** the proc directories (using `css_populate_dir -> group_addrm_files` ).
3. Create **sysfs** cgroup mount point and register cgroup v1/v2 file-systems.

```c
int __init cgroup_init(void)
{
    ...
    BUG_ON(cgroup_init_cftypes(NULL, cgroup_base_files));
    BUG_ON(cgroup_init_cftypes(NULL, cgroup_psi_files));
    BUG_ON(cgroup_init_cftypes(NULL, cgroup1_base_files));

    cgroup_rstat_boot();
    ...
    /*
    * Add init_css_set to the hash table so that dfl_root can link to
    * it during init.
    */
    hash_add(css_set_table, &init_css_set.hlist,
    css_set_hash(init_css_set.subsys));

    BUG_ON(cgroup_setup_root(&cgrp_dfl_root, 0));
    ...
    for_each_subsys(ss, ssid) {
        if (ss->early_init) {
            struct cgroup_subsys_state *css =
            init_css_set.subsys[ss->id];

            css->id = cgroup_idr_alloc(&ss->css_idr, css, 1, 2,
                        GFP_KERNEL);
        } else {
            cgroup_init_subsys(ss, false);
        }
        ...
        css_populate_dir(init_css_set.subsys[ssid]);
        cgroup_unlock();
    }

    /* init_css_set.subsys[] has been updated, re-hash */
    hash_del(&init_css_set.hlist);
    hash_add(css_set_table, &init_css_set.hlist,
    css_set_hash(init_css_set.subsys));

    WARN_ON(sysfs_create_mount_point(fs_kobj, "cgroup"));
    WARN_ON(register_filesystem(&cgroup_fs_type));
    WARN_ON(register_filesystem(&cgroup2_fs_type));
    WARN_ON(!proc_create_single("cgroups", 0, NULL, proc_cgroupstats_show));
    ...
    return 0;
}
```

## Phase 2 : Mounting cgroupfs

Mounting **cgroupfs** works like any other file-system. The kernel `do_mount()` → `path_mount()` → `do_new_mount()`  → `fs_context_for_mount(type, sb_flags)` path is followed.

1. This calls the `init_fs_context` handler for the file-system. For cgroup v2, it is `cgroup_init_fs_context()` that allocates the file-system context, sets the **namespace** and registers `fs_context_operations` like **parse_param** and **get_tree.**
2. After init, the kernel calls `parse_param`  handler to parse the parameters passed to mount.
3. After parsing the parameters, the `get_tree` handler is called.
4. At the end the kernel performs the mount using `vfs_create_mount` and adds to the **namespace’s** mount tree using `do_add_mount`.
    
 ```c
static int cgroup_init_fs_context(struct fs_context *fc)
{
    ... // use the cgroup namespace for the proccess
    ctx->ns = current->nsproxy->cgroup_ns;
    get_cgroup_ns(ctx->ns);
 
    ... // register the fs_context_operations like parse_param and get_tree
    fc->fs_private = &ctx->kfc;
    if (fc->fs_type == &cgroup2_fs_type)
        fc->ops = &cgroup_fs_context_ops;
    else
        fc->ops = &cgroup1_fs_context_ops
    ...
    return 0;
}
```
 
```c
static int cgroup_get_tree(struct fs_context *fc)
{
    struct cgroup_fs_context *ctx = cgroup_fc2context(fc);
    ...
    ctx->root = &cgrp_dfl_root;
    ...
    ret = cgroup_do_get_tree(fc);
    ...
    return ret;
}
 
int cgroup_do_get_tree(struct fs_context *fc)
{
    struct cgroup_fs_context *ctx = cgroup_fc2context(fc);
    int ret;
    
    ctx->kfc.root = ctx->root->kf_root;
    if (fc->fs_type == &cgroup2_fs_type)
        ctx->kfc.magic = CGROUP2_SUPER_MAGIC;
    else
        ctx->kfc.magic = CGROUP_SUPER_MAGIC;
    ret = kernfs_get_tree(fc);
    
    /*
    * In non-init cgroup namespace, instead of root cgroup's dentry,
    * we return the dentry corresponding to the cgroupns->root_cgrp.
    */
    if (!ret && ctx->ns != &init_cgroup_ns) {
        struct dentry *nsdentry;
        struct super_block *sb = fc->root->d_sb;
        struct cgroup *cgrp;
        ...
        cgrp = cset_cgroup_from_root(ctx->ns->root_cset, ctx->root);
        ...
        nsdentry = kernfs_node_dentry(cgrp->kn, sb);
        ...
        fc->root = nsdentry;
    }
    ...
    return ret;
}
 ```
    

## Phase 3 : Adding processes to cgroups

A process can be added to a cgroup using 2 methods : 

1. It can be **inherited** by the child during **fork.**
2. We can write the PID of a process to `cgroup.procs` file in the cgroup hierarchy. This is handled using `kernfs_syscall_ops` handlers registered by cgroup in `cgroup_kf_syscall_ops`.

#### Fork

```c
kernel_clone() -> copy_process()

__latent_entropy struct task_struct *copy_process(
                        struct pid *pid,
                        int trace,
                        int node,
                        struct kernel_clone_args *args)
{
...
    /* cgroup_fork - initialize cgroup related fields during copy_process().
    A task is associated with the init_css_set until cgroup_post_fork()
    attaches it to the target css_set. */
    cgroup_fork(p);
    ...
    /* Ensure that the cgroup subsystem policies allow the new process to be
    * forked. It should be noted that the new process's css_set can be changed
    * between here and cgroup_post_fork() if an organisation operation is in
    * progress. */
    retval = cgroup_can_fork(p, args);
    if (retval)
            goto bad_fork_put_pidfd;
    ...
    retval = sched_cgroup_fork(p, args);
    if (retval)
            goto bad_fork_cancel_cgroup;
    ...
    /*  Attach the child process to its css_set calling the subsystem fork()
    callbacks */
    cgroup_post_fork(p, args);
}
```

#### Writing to sysfs files

```c
static struct kernfs_syscall_ops cgroup_kf_syscall_ops = {
    .show_options		= cgroup_show_options,
    .mkdir			= cgroup_mkdir,
    .rmdir			= cgroup_rmdir,
    .show_path		= cgroup_show_path,
};

int cgroup_mkdir(struct kernfs_node *parent_kn, const char *name, umode_t 
 mode)
{
    struct cgroup *parent, *cgrp;
    int ret;
   
    ...
    if (!cgroup_check_hierarchy_limits(parent)) {
        ret = -EAGAIN;
        goto out_unlock;
    }

    /**
    - creates the kernelfs directory in sysfs
    - intialises the cgroup
    - propogates the changes to live descendants
    **/
    cgrp = cgroup_create(parent, name, mode);
    if (IS_ERR(cgrp)) {
        ret = PTR_ERR(cgrp);
        goto out_unlock;
    }
   ...
    // fills up the kernfs directories with values
    ret = css_populate_dir(&cgrp->self);
    if (ret)
        goto out_destroy;

    // cgroup_apply_control_enable - enable or show csses according to control
    ret = cgroup_apply_control_enable(cgrp);
    if (ret)
        goto out_destroy;

    ...
    /* let's create and online css's */
    kernfs_activate(cgrp->kn);
    ...
}
```

# References

- https://man7.org/linux/man-pages/man7/cgroups.7.html
- https://docs.kernel.org/admin-guide/cgroup-v2.html
- https://www.schutzwerk.com/en/blog/linux-container-cgroups-01-intro/
- https://terenceli.github.io/%E6%8A%80%E6%9C%AF/2020/01/05/cgroup-internlas
- https://developer.aliyun.com/article/786448
- https://linux.laoqinren.net/kernel/cgroup-source-css_set-and-cgroup/