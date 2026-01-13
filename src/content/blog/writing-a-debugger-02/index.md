---
title: "Writing a Debugger 02 - Inspecting Registers and Memory"
summary: "Blog on how to inspect and change values at a memory address and registers."
date: "Jan 14 2026 01:00"
draft: false
tags:
    - C
    - Linux
    - Ptrace
---

> This blog is a part of a series, you can find links to all the blogs on this page:
> [Writing a Debugger from Scratch](https://www.sheharyaar.in/blog/writing-a-debugger-00)

Ok, so we managed to understand how to stop a process in the previous blog. Next we would like to know:

- Address we are currently at (RIP register) and what are the values of other registers.
- Value present at a particular virtual memory address of the tracee’s address space.
- Set values at a memory address (if allowed), change register values, perform non-local jumps by changing the
  RIP register and other fun things.

So I will be explaining how to read/write registers and values at addresses. I will also discuss how debuggers
like GDB perform this operation in a better way.

## Reading and Writing Values at Addresses

`ptrace` provides options to enable reading/writing values to addresses in the tracee’s virtual address space.
These options are:

- `PTRACE_PEEKTEXT` / `PTRACE_PEEKDATA` : For reading data of size `long` (32 bits on 32-bit systems and
  64-bits / 8 bytes on 64-bit systems). For address regions it cannot read data from, it returns appropriate
  errors as mentioned in the manpage.
- `PTRACE_POKETEXT` / `PTRACE_POKEDATA` : For writing data of size `long` to an address similar to `PEEK*` functions.

> The `TEXT` and `DATA` suffixes are for text section and data section, but since Linux does not use separate
> sections for text and data, these perform the same operation.

```c
ptrace(PTRACE_PEEKTEXT/PEEKDATA, pid, addr, 0);
ptrace(PTRACE_POKETEXT/POKEDATA, pid, addr, long_val);
```

- `PTRACE_POKEUSER` and `PTRACE_PEEKUSER` : These options helps to read from / write to memory in the USER’s
  area. So, the
  [USER](https://github.com/bminor/glibc/blob/master/sysdeps/unix/sysv/linux/x86/sys/user.h#L73-L98) area
  (`struct user`) contains various fields like `start_code` , `start_stack` . These are undocumented and used
  mostly my debuggers. The interesting field for use in this struct is `int u_debugreg[8]`. These contain the
  Debug registers we discussed in the last post
  ([Debug Registers](http://sheharyaar.in/blog/writing-a-debugger-01#debug-registers)).

> This will be discussed further in my blog:
> [Writing a Debugger 04 - Hardware Breakpoints and Watchpoints](#).
> We will discuss the register individually.

So as discussed in the last blog, the following code snippet would help set a breakpoint at an address (the BP
would actually work if the address belongs to a region that is `executable` like an instruction in the `.text`
section). The code omits error handling for simplicity sake.

```c
long breakpoint_add(pid, addr) {
	// let addr = 0x07fff712; just an example
	// fetch the instruction at that address
	long old_val = ptrace(PTRACE_PEEKTEXT, pid, addr, NULL);
	// since x86 is little endian, we take last byte and OR INT3 instruction.
	long new_val = (old_val & 0xff) | 0xcc
	// set the breakpoint
	ptrace(PTRACE_POKETEXT, pid, addr, new_val);
	return old_val;
}
```

### GDB and other Tricks

- To read/write large size of data, you would need to successively call the `ptrace` function, that adds
  syscall overhead. One alternative to `PEEK/POKEDATA` or `TEXT` is the syscall `process_vm_readv/writev`.
  This allows you to use `iovec` arrays and perform multiple transfers in one single call. Source: [`process_vm_readv(2)`](https://man7.org/linux/man-pages/man2/process_vm_readv.2.html)
- GDB uses `/proc/$(PID)/mem` to read/write instead of `process_vm_readv/writev` and `POKETEXT/POKEDATA` and
  cites several advantages of it: [`gdb/linux-nat.c`](https://github.com/bminor/binutils-gdb/blob/487f43f887bf0a9ca8059a20a647b2bdb1cfe088/gdb/linux-nat.c#L178-L232).
  These advantages are **worth** looking at and these are usually undocumented and not present in books.

## Reading and Writing to Registers

Ptrace declares two important structs in `<sys/user.h>`. These store the tracee’s register values when the
tracer requests them -
[`struct user_regs_struct`](https://github.com/bminor/glibc/blob/master/sysdeps/unix/sysv/linux/x86/sys/user.h#L42-L71)
and
[`struct user_fpregs_struct`](https://github.com/bminor/glibc/blob/master/sysdeps/unix/sysv/linux/x86/sys/user.h#L73-L98).
I will just attach a small part of the general register struct:

```c
struct user_regs_struct
{
  __extension__ unsigned long long int r15;
  __extension__ unsigned long long int r14;
  ...
  __extension__ unsigned long long int rax;
  __extension__ unsigned long long int rcx;
	...
  __extension__ unsigned long long int orig_rax; // details below
  __extension__ unsigned long long int rip;
  __extension__ unsigned long long int cs;
	...
};
```

> According to the System V ABI ([System Calls in Sys V ABI](https://www.sheharyaar.in/notes/assembly/02-instructions/#system-calls)), when
> a syscall returns the `rax` contains the return value. So for the tracer to know which syscall was made, the
> syscall number is stored in `orig_rax` by the ptrace kernel subsystem.

Ptrace provides `PTRACE_GETREGS` / `PTRACE_GETFPREGS` and corresponding `SET` functions to fetch and set the
registers. Example to read and write RIP register is:

```c
struct user_regs_struct regs;
ptrace(PTRACE_GETREGS, pid, NULL, &regs);
// decrement RIP
regs.rip -= 1;
ptrace(PTRACE_SETREGS, pid, NULL, &regs);
```

## Kernel Dive

For `PTRACE_(PEEK/POKE)USER` ,`PTRACE_(GET/SET)REGS` , etc. the kernel does some sanity checks and then calls
the `getter/setter` functions of current `user_regset_view` (`x86_64` ) for 64-bit.

```c
/**
* struct user_regset_view - available regsets
* @name:       Identifier, e.g. UTS_MACHINE string.
* @regsets:    Array of @n regsets available in this view.
* @n:          Number of elements in @regsets.
* @e_machine:  ELF header @e_machine %EM_* value written in core dumps.
* @e_flags:    ELF header @e_flags value written in core dumps.
* @ei_osabi:   ELF header @e_ident[%EI_OSABI] value written in core dumps.
*
* A regset view is a collection of regsets (&struct user_regset,
* above).  This describes all the state of a thread that can be seen
* from a given architecture/ABI environment.
*/
struct user_regset_view {
  const char *name;
  const struct user_regset *regsets;
  unsigned int n;
  u32 e_flags;
  u16 e_machine;
  u8 ei_osabi;
};

struct user_regset {
	// getter - used to fetch the registers
  user_regset_get2_fn             *regset_get;
  // setter - used to set the registers
  user_regset_set_fn              *set;
  user_regset_active_fn           *active;
  user_regset_writeback_fn        *writeback;
  unsigned int                    n;
  unsigned int                    size;
  unsigned int                    align;
	...
}
```
