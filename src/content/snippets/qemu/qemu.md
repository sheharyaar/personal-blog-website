---
title: "QEMU launch options"
summary: "Command to boot custom or installed kernel with virtio based folder sharing between host and guest."
date: "May 25 2024"
draft: false
tags:
- QEMU
---
## Setup QEMU for Kernel GDB Debugging (no display)

You need these to run a compiled kernel and debug it using GDB:
1. The kernel bzImage
2. ramdisk image

### Tips: 

- To debug it with gdb, run QEMU with option `-s` (shorthand for `gdb -tcp::1234`) and `-S` for starting
the CPU in the stopped stated.
- Load the GDB scripts by adding the `add-auto-load-safe-path` script to gdbinit. The position of gdbinit
can be `~/.gdbinit` or `~/.config/gdb/gdbinit`.
```
echo "add-auto-load-safe-path /path/to/linux/scripts/gdb/vmlinux-gdb.py" >> ~/.gdbinit
```

### Steps

1. Run the default config : `make defconfig`
2. Add or set these symbols in `.config` file of the kernel :
```
CONFIG_GDB_SCRIPTS=y
CONFIG_DEBUG_INFO=y
CONFIG_DEBUG_KERNEL=y
CONFIG_KALLSYMS=y
CONFIG_RANDOMIZE_BASE=n
```
3. You can also run these : 
```
$ ./scripts/config -e DEBUG_INFO -e DEBUG_KERNEL -e DEBUG_INFO_DWARF4
$ ./scripts/config -e DEBUG_SECTION_MISMATCH -e DEBUG_OBJECTS -e DEBUG_OBJECTS_WORK -e DEBUG_VM
$ ./scripts/config -e GDB_SCRIPTS -e HEADERS_INSTALL
```
4. Run `make -j$(nproc)` to build the kernel
5. Build gdb scripts: `make scripts_gdb`
6. Run modules_install: `make modules_install`
7. Build the ramdisk image
```
sudo dracut --kernel-image arch/x86/boot/bzImage --confdir /etc/dracut.conf.d/ -v ramdisk.img <version>
```
8. Run QEMU : 
```
qemu-system-x86_64 \
	-kernel $kernel_path/vmlinux \
	-initrd $ramdisk_path/ramdisk.img \
	-append "console=ttyS0 nokaslr" \
	-nographic -enable-kvm -cpu host -m 512 \
	-s -S
```
9. Run `gdb $KERNEL_SRC/vmlinux` in another terminal
10. Enter `target remote localhost:1234` to get started with remote debugging the kernel

> Note: Try to use `hbreak` instead of `b` in gdb to attach breakpoints early in the kernel

If you are getting `memory cannot be accessed` during adding a breakpoint, then you must have missed disabling
`KASLR` or `Kernel Address Space Layour Randomisation`. See `CONFIG_RANDOMIZE_BASE` config flag.

## Setup QEMU for running QEMU with a custom kernel and display

This will help you setup a shared folder between a QEMU guest and the host. This also dosables `KASLR` or `Kernel Address Space Layout Randomisation` (which is a security feature, but can be disabled for easier debugging - [Wikipedia](https://en.wikipedia.org/wiki/Address_space_layout_randomization)).

Make sure to adjust the parameters to your RAM (`-m`), `file` with your_os.qcow2 location and `shared_folder` parameters with your own shared folder values.

Host 
```bash
# boot arch-linux image with installed kernel
# to get the tty or the terminal, run,
# $ telnet localhost 4321
$ sudo qemu-system-x86_64 \
    --enable-kvm \
    -cpu host -smp $(nproc) \
    -m 8192 \
    -nographic \
    -device virtio-net,netdev=vmnic -netdev user,id=vmnic \
    -drive file=archlinux.qcow2,media=disk,if=virtio \
    -virtfs local,path=/path/to/shared/folder,mount_tag=shared_folder,security_model=passthrough,id=shared_folder \
    -serial telnet:localhost:4321,server,nowait

# boot custom kernel using bzImage.
# this will open the display in a window, else you can add `-serial` at the 
# end same as previous command and then runn using telnet
$ sudo qemu-system-x86_64 \
 --enable-kvm \
 -cpu host -smp $(nproc) \
 -m 8192 \
 -kernel linux-next/arch/x86_64/boot/bzImage \
 -append "rw nokaslr root=/dev/vda1" \
 -device virtio-net,netdev=vmnic -netdev user,id=vmnic \
 -device VGA,vgamem_mb=256 \
 -drive file=debian.qcow2,media=disk,if=virtio \
 -virtfs local,path=/path/to/shared/folder,mount_tag=shared_folder,security_model=passthrough,id=shared_folder
```

Guest
```bash
$ sudo apt install -y qemu-guest-agent
$ sudo mkdir /mnt/shared_folder
$ sudo mount -t 9p -o trans=virtio,version=9p2000.L shared_folder /mnt/shared_folder

# tty settings in case of telnet tty
$ stty rows 30 && stty columns 136
```

Reference: https://wiki.gentoo.org/wiki/QEMU/Options


