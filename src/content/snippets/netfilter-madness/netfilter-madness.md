---
title: "Netfilter Madness"
summary: "Netfilter API changes driving me made for my GSoC Project."
date: "Jul 25 2024"
draft: false
tags:
- Networking
- Linux Kernel
---

### API changes

1. `nf_register_hook()` till **4.12**, from **4.13.0** we have `nf_register_net_hook()`
2. `nf_hookfn` signature changed (with addition of `struct nf_hook_state`) in version **4.1.0**.
Before : 
```c
static inline void nf_hook_state_init(struct nf_hook_state *p,
				      unsigned int hook,
				      int thresh, u_int8_t pf,
				      struct net_device *indev,
				      struct net_device *outdev,
				      struct sock *sk,
				      int (*okfn)(struct sock *, struct sk_buff *))
```
 Then :
```c
typedef unsigned int nf_hookfn(const struct nf_hook_ops *ops,
			       struct sk_buff *skb,
			       const struct nf_hook_state *state);
```
Then it was further changed in version **4.4** to have a `void *private` (current form as of 6.10) :
```c
typedef unsigned int nf_hookfn(void *priv,
			       struct sk_buff *skb,
			       const struct nf_hook_state *state);
```

3. `hook_ops_type` field in `struct nf_hook_ops` was added in version : **5.14.0**
4. For `xt_action_param` in x_tables match and target. kernel versions **>= 4.10.0**, we have parameter helpers like `xt_hooknum(par)`, before that we use `par->hooknum`

### Random Notes
- On netfilter-based NAT systems there is theoretically a possibility to retrieve the original address *after* NAT'ing a connection.
  - This can be done using the socket option `SO_ORIGINAL_DST`. 
  - This is implemented in `conntrack` using `nf_register_sockopt()` which is used to create custom socket options (limited to some tables, like ipt and ip6t).

### xt_action_param usage across extensions

| param                                                                                                  | used by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `thoff` - used to get the offset of the transport header **if** `.proto` is filled during registration | `xt_TPROXY.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_TPROXY.c#L413<br><br>`xt_dccp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_dccp.c#L108<br><br>`xt_hashlimit.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_hashlimit.c#L616<br><br>`xt_ipcomp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_ipcomp.c#L52<br><br>`xt_l2tp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_l2tp.c#L82<br><br>`xt_multiport.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_multiport.c#L84<br><br>Total usage : 12 files |
| `fragoff` - Indicates if there is a **fragment offset**. Used for detecting fragments in IP packet     | `xt_l2tp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_l2tp.c#L92<br><br>`xt_dccp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_dccp.c#L105<br><br>`xt_tcpudp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_tcpudp.c#L71<br> <br>Total usage : 10 files                                                                                                                                                                                                                                                                                                                                |
| `hooknum` - Netfilter hook number. Used for logging/redirecting/NATing the packet                      | `xt_LOG.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_LOG.c#L42<br><br>`xt_NETMAP.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_NETMAP.c#L36<br><br>`xt_REDIRECT.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_REDIRECT.c#L34<br><br>Total usage : 8 files                                                                                                                                                                                                                                                                                                                             |
| `hotdrop` - Used to indicate if the packet should be dropped immediately.                              | `xt_tcpudp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_tcpudp.c#L36<br><br>`xt_hashlimit.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_hashlimit.c#L617<br><br>`xt_dccp.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_dccp.c#L41<br><br>`xt_connlimit.c` : https://elixir.bootlin.com/linux/v4.4.292/source/net/netfilter/xt_connlimit.c#L336<br><br>Total usage : 10 files                                                                                                                                                                                                          |