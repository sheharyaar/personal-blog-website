---
title: "QEMU launch options"
summary: "Command to boot custom or installed kernel with virtio based folder sharing between host and guest."
date: "May 25 2024"
draft: false
tags:
- QEMU
---

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


