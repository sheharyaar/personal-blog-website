---
title: Network Isolation
---

- For network isolation, we should use [rtnetlink(7)](https://man7.org/linux/man-pages/man7/rtnetlink.7.html) , for communicating with the Routing subsystem to:
    - create network interfaces
    - move them to namespace
    - establish route, gateway and other properties required
- However, there is a catch here :
    - You need to setup the network interface in the root namespace (i.e, in the parent process).

### Resources

- https://ifeanyi.co/posts/linux-namespaces-part-4/
- https://developers.redhat.com/blog/2018/10/22/introduction-to-linux-interfaces-for-virtual-networking#bridge
- https://hechao.li/posts/vxlan/
- https://hechao.li/posts/linux-bridge-part1/