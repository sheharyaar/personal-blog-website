---
title: "Google Summer of Code Experience"
summary: "My experience as a student contributor at LabLua Foundation under the Google Summer of Code Program."
date: "Sep 03 2024"
draft: false
tags:
- Linux Kernel
- Experience
- Networking

---

> You can find my detailed report on the GSoC program at [sheharyaar/google-summer-of-code-2024](https://github.com/sheharyaar/google-summer-of-code-2024) repository.

Finally, after three months of digging into the Linux Kernel source code, studying the netfilter subsystem, and scratching my head over the bugs in my code, I passed my Google Summer of Code 2024 final evaluations. I was selected for the program to contribute to Lunatik, an in-kernel Lua VM, under the LabLua Foundation. I was assigned to add netfilter support to Lunatik and enable users to write netfilter kernel and userspace extensions in Lua.

Anyone who has worked with the Linux kernel knows that Kernel modules are developed using C (or Rust, soon). Writing a kernel module in Lua seems like a crazy idea (hence the name [Lunatik](https://github.com/luainkernel/lunatik) 😛). Through the program, I explored the legacy `Xtables` API, `Netfilter` subsystem, `conntrack`, and `NAT` components of the Linux Kernel. I also worked with the Lua C API, integrated the required Xtables & Netfilter APIs, and extended the luadata and lualinux libraries with better features.

### Challenges

There were a lot of challenges and by _***a lot***_, I mean a lot! To begin with, There is very little to no official documentation on Netfilter and Conntrack. The ones available are outdated and targeted to kernel `2.x` (at the time of writing, the current stable version is `6.10.x`). The primary option was browsing the kernel source code and understanding the packet path through netfilter. As my homepage says: "Standing on the shoulders of giants," it was indeed the giants that helped me go through this challenging journey. Excellent blogs by **Andrej Stender**[^1], **Arthur Chiao**[^2], and a few Netdev conference videos and presentations were the only resources that proved to be gems.

The netfilter API changed multiple times in multiple kernel versions, so I had to browse the code for multiple kernel versions to provide support for older kernels. As a new contributor, understanding the lunatik architecture was complicated, especially the interaction of lunatik objects and the Lua registry. It wasn't easy to visualize storing and retrieving Lua tables, userdata, and function pointers on the Lua C stack. However, my mentor, [Lourival](https://github.com/lneto), was there to rescue me. Lengthy discussions and valuable reviews from him helped me in overcoming the issues. By the end of the program, I had a much better understanding of Lunatik, and I got rid of some of my bad coding habits. To get the complete list of my contributions, you can check my detailed report [here](https://github.com/sheharyaar/google-summer-of-code-2024) 

### Gratitude

Overall, the program helped me to improve my understanding of Kernel source code, forced me to build and test modules, and helped me develop a deeper understanding of Linux Kernel Networking. I am confident and motivated to go further into the networking subsystem and explore new topics like Virtualisation. As a result, I will soon be writing a series of blogs on the Path of a Network Packet in the Linux Kernel.

I thank my mentor, the LabLua Foundation, and Google for providing me with this fantastic opportunity.

[^1]: Blogs by Andrej Stender on [Netfilter](https://thermalcircle.de/doku.php?id=blog:linux:nftables_packet_flow_netfilter_hooks_detail), [Conntrack](https://thermalcircle.de/doku.php?id=blog:linux:connection_tracking_1_modules_and_hooks), [Flowtables](https://thermalcircle.de/doku.php?id=blog:linux:flowtables_1_a_netfilter_nftables_fastpath) and [Kernel Routing Decisions](https://thermalcircle.de/doku.php?id=blog:linux:routing_decisions_in_the_linux_kernel_1_lookup_packet_flow)
[^2]: Arthur Chiao's Blog on [Conntrack](https://arthurchiao.art/blog/conntrack-design-and-implementation/)