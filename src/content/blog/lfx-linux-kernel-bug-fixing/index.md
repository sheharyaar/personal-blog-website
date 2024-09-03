---
title: "Linux Kernel Bug Fixing Experience"
summary: "My experience with Linux Kernel Bug Fixing Program under Linux Foundation Mentorship"
date: "May 30 2024"
draft: false
tags:
- Linux Kernel
- Experience
---


## Linux Kernel Bug Fixing Program

Hello everyone! I am Mohammad Shehar Yaar Tausif, a final-year student at the Indian Institute of Technology, Kharagpur. I have always been interested in exploring low-level systems and the kernel, so it was in February 2024 that I found the golden opportunity to dip my toes into the Linux kernel. I applied for the Linux Kernel Bug Fixing Spring 2024 program offered by Linux Foundation Mentorship.

## Applying for the Program

To qualify for the program, the applicants had to complete various tasks that involved -

* Build and boot the kernel from the source.

* Add a version field to the kernel, build it, and submit the patch.

* Complete the “Beginner’s Guide to Linux Kernel Development (LFD103)” course on LFX to get acquainted with the kernel release cycles and mailing list procedures.

* Write a simple kernel module with support for command line arguments.

Fortunately, I could complete the tasks, and a few weeks later, I received the acceptance mail.

![](https://cdn-images-1.medium.com/max/2000/1*zSawJNLMWtghCtjV2veiwQ.png)

## The Programme

The mentorship program started in March. Our mentors were **Shuah Khan** and **Javier Carrasco**. Later in the program, **Julia Lawall** guided us for scope-based cleanup tasks in the kernel ([lwn/934679](https://lwn.net/Articles/934679/)). There were a total of 32 mentees for the program, and we were all excited about it. We had a Discord channel, encouraged by our mentor Javier, to interact with each other.

I contributed to the device-tree subsystem of the kernel, to convert legacy device-tree .txt files to the current standard .yaml files. Along the way, I explored vkms DRM drivers and KUnit testing framework.

As part of the program, I got experience with various debugging and tracing tools (dynamic and static) like smatch, KMSAN, KASAN, strace, ftrace, gdb, etc. There is an exhaustive list of resources from LWN articles to kernel documentation. In addition to these resources, I also referred to multiple books -

* Linux Device Drivers (3rd Edition) by Alessandro Rubini, Greg Kroah-Hartman, and Jonathan Corbet

* Linux Kernel Development (3rd Edition) by Robert Love

* Understanding the Linux Kernel, 3rd Edition by Daniel P. Bovet and Marco Cesati

I have my notes available on the topics I learned at my repository: [sheharyaar/linux-kernel-notes](https://github.com/sheharyaar/linux-kernel-notes). Notes on device-tree bindings and QEMU are available as gists on my github : [gist/sheharyaar](https://gist.github.com/sheharyaar)

Here is a list of my patches :

### Stable Tree

* *ASoC: dt-bindings: tegra30-i2s: convert to dt schema* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=4a1baeefd1d5a955b5a55a75539244e03e623b0b)] [[Lore](https://lore.kernel.org/all/20240426170322.36273-1-sheharyaar48@gmail.com/)]

* *ARM: tegra: tegra20-ac97: Replace deprecated “gpio” suffix* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=ff4d7e172100e2c35c92ce96881c3777ac566528)] [[Lore](https://lore.kernel.org/all/20240423120630.16974-1-sheharyaar48@gmail.com/)]

* *ASoC: dt-bindings: tegra20-ac97: convert to dt schema* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=701a22fd9ffaa409bbd45c2936870341b3ad9fdb)] [[Lore](https://lore.kernel.org/r/20240423115749.15786-1-sheharyaar48@gmail.com)]

* *dt-bindings: usb: uhci: convert to dt schema* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=c859d300c5697ac8929a1c860f78e51c7bacf72d)] [[Lore](https://lore.kernel.org/r/20240423150550.91055-1-sheharyaar48@gmail.com)]

* *ASoC: dt-bindings: tegra20-das: Convert to schema* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=ed37d240d03e84d09d4d2a771fda419da4308d17)] [[Lore](https://lore.kernel.org/r/20240418163326.58365-1-sheharyaar48@gmail.com)]

* *bpf: Fix order of args in call to bpf_map_kvcalloc* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=af253aef183a31ce62d2e39fc520b0ebfb562bb9)] [[Lore](https://lore.kernel.org/bpf/20240516072411.42016-1-sheharyaar48@gmail.com)]

* *ARM: dts: vt8500: replace “uhci” nodename with generic name “usb” —* [[Commit](https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git/commit/?id=dd2118bd10c1e74b8f0082750bd39c4bcb5fe5f7)] [[Lore](https://lore.kernel.org/all/20240423150728.91527-1-sheharyaar48@gmail.com/)]

## The Experience

It was a fantastic experience for me. Initially, the resources and the codebase were overwhelming. I clearly remember my experience of submitting my first patch for the dt-schema bindings. I cross-checked everything *at least* five times!

Everything went smoothly, thanks to our mentors. We had regular weekly meetings to discuss issues we faced during the process. Shuah took us through the source code live-in-meet and helped us clarify our doubts. Javier helped us with our *newbie* doubts and guided us in selecting subsystems suitable for us mentees. We were comfortable in asking even stupid questions to get our concepts clear.

This program was also an excellent opportunity to work together and network among the mentees. We posted our issues on our Discord channel and resolved them through informative discussions. I am happy I helped one of my fellow mentees create device-tree binding patches through my experience.

Through this program, I also understood the difficulty of maintaining each subsystem, how much code the maintainers review, and having their jobs and families to care for. I respect them a lot more and aspire to become one of them. I encourage every student interested in Kernel development to apply for this opportunity.
