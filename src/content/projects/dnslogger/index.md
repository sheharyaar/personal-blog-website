---
title: "DNS Logger"
summary: "Log DNS queries using eBPF filter in Go"
date: "Oct 29 2022"
draft: false
tags:
- Go
- eBPF
- Linux
repoUrl: https://github.com/sheharyaar/dnslogger
---

- Developed a DNS query logger using gopacket library that utilises pcap and eBPF filters, with high performance per-packet filtering. 
- Built robust logic to update whitelist, regex-based matching and a channel based buffered pipeline to export processed packet data.