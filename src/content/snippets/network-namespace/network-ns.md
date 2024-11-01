---
title: "Network namespaces and VETH"
summary: "Steps to create network namespaces and attach VETH to connect them."
date: "Aug 10 2024"
draft: false
tags:
- Networking
---

Steps to create a pair of namespace and connect them.

1. Create the namespaces using

```bash
# sudo ip netns add <ns_name>
sudo ip netns add ns1
sudo ip netns add ns2
```

1. Connect these namespaces using a virtual ethernet (created in pairs) using:

```bash
#sudo ip link add <if_name> netns <ns_name> type veth peer name <peer_name> netns <peer_ns>
$ sudo ip link add veth0 netns ns1 type veth peer name veth1 netns ns2
```

This will create veth0 in `ns1` and veth1 in `ns2`.

3. Assign IP addresses to these veth pairs using :

```bash
# sudo ip -n <ns_name> addr add <ip/mask> dev <if_name>
sudo ip -n ns1 addr add 10.1.1.1/24 dev veth0
sudo ip -n ns2 addr add 10.1.1.2/24 dev veth1
```

4. `UP` the interfaces using :

```bash
# sudo ip -n <ns_name> link set <if_name> up
sudo ip -n ns1 set veth0 up
sudo ip -n ns2 set veth1 up
```

5. Exec into the namespaces in different terminals and ping each other :

```bash
sudo ip netns exec ns1 ping 10.1.1.2    # in one terminal
sudo ip netns exec ns2 ping 10.1.1.1    # in another terminal
```

You can also exec `bash` in any namespace and execute commands interactively in that namespace : 

```bash
sudo ip netns exec ns1 /bin/bash
# you will get a terminal now
```