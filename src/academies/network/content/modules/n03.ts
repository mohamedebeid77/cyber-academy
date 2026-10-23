import type { Module } from '../../../../types';

// LEVEL 2 — HANDS-ON · Module N03: Networking in Practice
// Original curriculum content built around the standard Linux toolset
// (iproute2, iputils, bind-utils, curl, netcat, tcpdump). All prose is
// original; reference links point to official man pages and documentation.

export const n03: Module = {
  id: 'n03',
  title: 'Networking in Practice',
  level: 2,
  description:
    'Hands-on Linux networking: inspecting interfaces, addresses and routes with ip; testing connectivity with ping and traceroute; interrogating DNS with dig and fetching data with curl and wget; and watching sockets and traffic with ss, nc and tcpdump. These are the daily-driver commands of network troubleshooting and authorized reconnaissance.',
  outcomes: [
    'Inspect and interpret interfaces, addresses, routes and neighbor caches with ip and related tools',
    'Diagnose connectivity failures layer by layer using ping, traceroute and path analysis',
    'Query DNS precisely with dig, nslookup and host, and retrieve web data with curl and wget',
    'Observe local sockets with ss and netstat, and make raw connections with nc',
    'Capture and read network traffic with tcpdump using host, port and protocol filters'
  ],
  lessons: [
    {
      id: 'n03-l01',
      moduleId: 'n03',
      title: 'Interfaces, Addresses and Routes on Linux',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['n01-l03'],
      objectives: [
        'Use ip link, ip addr, ip route and ip neigh and read their output fluently',
        'Connect the commands to the configuration files that feed them (resolv.conf, hosts, nsswitch)',
        'Map a machine\u2019s network position from the shell in under a minute'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The ip command is the control panel of Linux networking. On your own laptop it tells you where you are; on an authorized host it draws the map of everything around it — interfaces, addresses, routes and neighbors — without a single packet sent to anyone. Reading this output fluently is the difference between operating tools and understanding them.'
          },
          {
            type: 'p',
            text:
              'The commands do not stand alone: addresses are assigned by DHCP clients or config files, name resolution is steered by resolver configuration, and static hosts entries can override both. This lesson teaches the read side of all of it — the half dozen commands and files that answer where am I, what can I reach, and who do I ask for names.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Interface naming and states'
          },
          {
            type: 'p',
            text:
              'Expect a zoo of names: lo (loopback), eth0 (classic), predictable names like ens3 or enp0s3 (PCI addressing) and wlp2s0 (Wi-Fi), plus virtual devices — docker0 and virbr0 (bridges), veth* (container links), tun0 and wg0 (VPN tunnels). Distinguish state from carrier: DOWN is administratively disabled, UP with LOWER_UP means a live link, and UP without carrier usually means nothing is plugged in. MTU and the MAC address also show here.'
          },
          {
            type: 'h',
            text: 'The core four'
          },
          {
            type: 'list',
            items: [
              'ip link — layer 2 view: interfaces, states, MACs, MTU',
              'ip addr — adds the addresses: scopes (global, link, host), the dynamic flag and lease lifetimes for DHCP-managed addresses',
              'ip route — the routing table: destination prefix, via next hop, dev interface, src preferred source, metric tie-breaker, proto origin (kernel means connected, dhcp, static...)',
              'ip neigh — the ARP/NDP cache: which neighbors this host has actually talked to'
            ]
          },
          {
            type: 'h',
            text: 'Name resolution files'
          },
          {
            type: 'p',
            text:
              'Three files steer how names become addresses: /etc/resolv.conf lists nameservers (and search domains) — on systemd-resolved systems it typically points at the local stub 127.0.0.53, with resolvectl showing the real upstreams; /etc/hosts holds static overrides that beat DNS; /etc/nsswitch.conf sets the order (the hosts: line deciding whether files or dns wins). Be careful editing these by hand: on modern systems netplan, NetworkManager or systemd-resolved may rewrite them out from under you — read first, configure through the proper layer.'
          },
          {
            type: 'h',
            text: 'The legacy trio'
          },
          {
            type: 'p',
            text:
              'ifconfig, route and arp (the old net-tools) still appear on older and minimal systems. The mapping is direct: ifconfig is ip addr, route -n is ip route, arp -n is ip neigh. Learn ip first; read the legacy trio when you meet it, and note its output formats differ (netmasks written as 255.255.255.0 instead of /24).'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These commands are the first sixty seconds on any authorized foothold — and the same commands defenders run to audit exposure. The interface list alone is high-value: more than one non-loopback interface means the box straddles segments (pivot potential for you, lateral-movement risk for the client); tunnels and bridges reveal VPN links and container networks that no one documented.'
          },
          {
            type: 'list',
            items: [
              'Routes to "boring" subnets are rarely boring — they name the networks this host was built to reach',
              'resolv.conf pointing at localhost means a local resolver runs here — enumerate it',
              'The src column in routes tells you which address the host uses toward each destination — useful when guessing which segments it can talk to',
              'Missing default route on a segmented host is deliberate isolation — or a misconfiguration worth reporting'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Multiple physical or virtual interfaces on machines that should be single-homed',
              'Static routes added by hand (proto static) pointing into infrastructure ranges',
              'nameserver entries pointing at unusual addresses, or hosts entries hardcoding hostnames',
              'Interfaces with no carrier on supposedly active machines (forgotten management ports)',
              'DHCP-learned addresses on servers (servers usually deserve static config)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Everything here is read-only and safe on any system you control or are authorized to inspect. Run the full sequence on a lab VM:'
          },
          {
            type: 'terminal',
            title: 'The five-command network map',
            lines: [
              '$ ip -br link',
              'lo        UNKNOWN  00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>',
              'ens3      UP       52:54:00:11:22:33',
              '$ ip -br addr',
              'lo        UNKNOWN  127.0.0.1/8 ::1/128',
              'ens3      UP       10.0.2.15/24 fe80::5054:ff:fe11:2233/64',
              '$ ip route show',
              'default via 10.0.2.2 dev ens3 proto dhcp metric 100',
              '10.0.2.0/24 dev ens3 proto kernel scope link src 10.0.2.15 metric 100',
              '$ ip neigh show',
              '10.0.2.2 dev ens3 lladdr 52:54:00:12:35:02 REACHABLE',
              '$ cat /etc/resolv.conf',
              'nameserver 10.0.2.3',
              'search lab.example.internal'
            ]
          },
          {
            type: 'p',
            text:
              'Narrate it: one NIC with a DHCP-learned address (proto dhcp on the default route), a gateway at 10.0.2.2 whose MAC the host has already resolved, and DNS delegated to 10.0.2.3. That is a complete description of the machine\u2019s network position from five commands and zero packets sent to anyone else.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The dual-homed deduction: an authorized shell shows ens3 with 10.10.14.5/24 (the segment you arrived on) and ens4 with 172.16.5.10/24, no default route, plus a static route "172.16.4.0/24 via 172.16.5.1". Conclusion drawn from the shell alone: this box bridges your segment to an internal one and can reach a third subnet through its second gateway — a pivot map drawn before any scanner ran. Defenders run the identical audit in reverse: which of my machines can reach which segments, and is that the design?'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ip (iproute2)', 'The modern suite: link, addr, route, neigh'],
              ['hostname -I', 'One-line answer for "which addresses do I hold"'],
              ['resolvectl', 'Inspect systemd-resolved: upstream DNS, caches, domains'],
              ['nmcli', 'NetworkManager state — common on desktops and Wi-Fi hosts'],
              ['ifconfig / route / arp', 'Legacy net-tools equivalents, still found in the wild']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Hand-editing /etc/resolv.conf on systemd-resolved or netplan systems — it gets overwritten; configure through the managing layer',
              'Reading UP as "ready" — without LOWER_UP there is no carrier and no traffic flows',
              'Assuming docker0, veth or tun devices are physical hardware',
              'Ignoring the src column when predicting which source address a connection will use',
              'Treating ifconfig output as identical to ip — flags and formats differ, and stale habits produce wrong conclusions'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your own Linux VM run the five commands, then draw the network they describe. Next, change one thing — disconnect the virtual cable in your hypervisor — and predict what each command will show before rerunning it. Verify. Being able to predict output is the proof of understanding.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'ip link, ip addr, ip route and ip neigh are the four views: L2, addresses, routes, neighbors',
              'Interface names encode their origin: physical, predictable, virtual, tunnel',
              'State and carrier are different things — read both',
              'resolv.conf, hosts and nsswitch steer name resolution; managers may rewrite them',
              'The five-command routine maps any authorized host in under a minute'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n03-l01-q1',
          type: 'mcq',
          prompt: 'Which command shows the default gateway?',
          options: ['ip addr show', 'ip route show', 'ip link show', 'cat /etc/hosts'],
          answerIndex: 1,
          hint: 'The gateway is a route — the default one.',
          explanation:
            'The default gateway appears in the routing table as the via address of the 0.0.0.0/0 route. Addresses belong to ip addr, links to ip link; /etc/hosts is static name mapping.'
        },
        {
          id: 'n03-l01-q2',
          type: 'truefalse',
          prompt: 'An interface in state UP with NO-CARRIER is ready to pass traffic.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is a carrier, physically?',
          explanation:
            'NO-CARRIER means no link signal — the cable is unplugged or the peer is down. The interface is administratively up but physically dead; only UP with LOWER_UP passes frames.'
        },
        {
          id: 'n03-l01-q3',
          type: 'short',
          prompt: 'What does the route line "default via 10.0.2.2 dev ens3 proto dhcp" mean?',
          modelAnswer:
            'Any destination with no more specific matching route is sent to next hop 10.0.2.2 out of interface ens3; the entry was learned through DHCP. The host delegates all non-local delivery to that gateway.',
          hint: 'Three facts: where, out of what, learned how.',
          explanation:
            'Every routing line answers destination, next hop, interface and origin. Reading all four fields (including proto) is what separates map-reading from map-guessing.'
        },
        {
          id: 'n03-l01-q4',
          type: 'scenario',
          prompt:
            'An authorized foothold shows ens3 10.10.14.5/24, ens4 172.16.5.10/24, and the route "172.16.4.0/24 via 172.16.5.1". What does this tell you about your network position, and what are your next two recon steps within scope?',
          modelAnswer:
            'You are on a machine that straddles two segments and has a configured path into a third (172.16.4.0/24) — classic pivot potential. Next steps, all local and read-only: enumerate neighbors and listening sockets on this box (ip neigh, ss -tulpn) to learn who it talks to, and check forwarding state (sysctl net.ipv4.ip_forward) to understand whether it routes between segments by design. Everything stays within the authorized host; scanning the new subnets is a separate, scope-dependent decision.',
          hint: 'Two interfaces and a static route are a topology claim — verify locally first.',
          explanation:
            'Position analysis starts with what the host itself admits: interfaces, routes and forwarding state. Good pivoting methodology documents position before sending any packets into new networks.'
        }
      ],
      references: [
        {
          title: 'ip(8) — Linux man page (iproute2)',
          url: 'https://man7.org/linux/man-pages/man8/ip.8.html',
          note: 'The official reference for every ip subcommand and output field.'
        },
        {
          title: 'resolver(5) — Linux man page',
          url: 'https://man7.org/linux/man-pages/man5/resolver.5.html',
          note: 'The format and semantics of /etc/resolv.conf.'
        }
      ]
    },
    {
      id: 'n03-l02',
      moduleId: 'n03',
      title: 'Connectivity Testing: ping, traceroute and Path Analysis',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n03-l01'],
      objectives: [
        'Read ping output completely: sequence numbers, TTL, RTT and the failure modes',
        'Explain how traceroute builds a path from TTL exhaustion and interpret stars',
        'Localize a connectivity failure to a layer and a hop using two commands'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'ping answers "is it reachable, how fast, how reliably"; traceroute answers "through where". Together they localize almost any connectivity failure to a layer and a hop — without a scanner, without credentials, without noise. They are also the two commands every network engineer assumes you can read, so their output is worth knowing line by line.'
          },
          {
            type: 'p',
            text:
              'Discipline matters more than volume: a named sequence — resolve the name, test the local link, test the gateway, test the destination — converts a vague "the network is down" into a precise claim in under a minute. This lesson builds exactly that sequence.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'ping, line by line'
          },
          {
            type: 'p',
            text:
              'Each reply line carries icmp_seq (ordering and loss detection), ttl (hops left — subtract from the likely initial 64/128/255 to estimate distance) and time (round-trip time). The summary gives loss percentage and min/avg/max RTT with jitter (mdev). Useful flags: -c count, -i interval, -W timeout, -6 for IPv6, and -M do -s N to send fixed-size unfragmentable packets for MTU probing.'
          },
          {
            type: 'table',
            headers: ['Failure message', 'Meaning', 'Layer of the problem'],
            rows: [
              ['Name or service not known', 'DNS could not resolve the name', 'Name resolution, before any network probing'],
              ['Network is unreachable', 'The local host has no route to the destination', 'Local routing table'],
              ['Destination Host Unreachable (from a router)', 'An upstream router reports it cannot deliver', 'Routing beyond your gateway'],
              ['Timeout, no reply', 'Packets went out, silence came back', 'Ambiguous: filtered or down — probe differently'],
              ['Intermittent losses across sequence numbers', 'Partial connectivity', 'Congestion, RF issues, rate limiting']
            ]
          },
          {
            type: 'h',
            text: 'traceroute mechanics'
          },
          {
            type: 'p',
            text:
              'The trick: send probes with TTL=1, then 2, then 3... Every router that decrements a TTL to zero discards the packet and returns ICMP time exceeded — announcing itself. When a probe finally reaches the destination, its reply (ICMP echo reply, TCP RST or SYN+ACK depending on the probe type) ends the trace. Variants matter in the field: default Linux traceroute sends UDP probes to high ports; -I uses ICMP echo; -T uses TCP SYN to a chosen port (needs root) and often survives firewalls that drop the other two; tracepath uses UDP and reports the path MTU without root. Always run with -n to skip reverse DNS — it is faster and keeps your own DNS traffic out of the picture.'
          },
          {
            type: 'p',
            text:
              'Stars (three asterisks) mean no answer arrived for that TTL. A router may drop probes but happily forward traffic — rate limiting and ACLs are common — so a star hop is "this device does not answer", not "the path is broken". Full star-tails usually mean the destination or its path drops probes entirely; the host may be perfectly alive on TCP.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Path probing validates scope and vantage before any scanning: can you even reach the range, and through how many hops? Where stars begin maps where filtering starts. If ICMP is dead on a target network, every later check must move to TCP probes (nc, TCP-based host discovery) — a conclusion you reach here, cheaply, instead of mid-engagement.'
          },
          {
            type: 'list',
            items: [
              'TTL arithmetic cross-checks client topology claims (hop counts are hard to fake consistently)',
              'tracepath PMTU output exposes tunnel overhead on VPN paths before it breaks an application test',
              'Comparing traces from two vantage points (client side and your side) locates asymmetric filtering',
              'One lost packet is not an outage; 20 pings beat 1 ping every time'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              '100% loss with other traffic working fine — ICMP is filtered, not the host down',
              'Stars starting immediately after your gateway — filtering at the network edge',
              'One hop with wildly higher RTT than its neighbors — rate limiting or a queuing device',
              'PMTU below 1500 on paths that should be clean — tunnels or overhead in the middle',
              'Alternating IPs at a single hop — load balancing (ECMP), not instability'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Courtesy and scope',
            text:
              'Pinging and tracing well-known public resolvers (8.8.8.8, 1.1.1.1) is tolerated ordinary usage, but repeated probing of third-party infrastructure is not testing and not welcome. Keep systematic path work on your lab, your own uplink, and written-authorization targets.'
          },
          {
            type: 'terminal',
            title: 'A complete path session',
            lines: [
              '$ ping -c 4 8.8.8.8',
              'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.',
              '64 bytes from 8.8.8.8: icmp_seq=1 ttl=122 time=9.42 ms',
              '64 bytes from 8.8.8.8: icmp_seq=2 ttl=122 time=9.01 ms',
              '64 bytes from 8.8.8.8: icmp_seq=3 ttl=122 time=8.95 ms',
              '64 bytes from 8.8.8.8: icmp_seq=4 ttl=122 time=9.10 ms',
              '--- 8.8.8.8 ping statistics ---',
              '4 packets transmitted, 4 received, 0% packet loss, time 3005ms',
              'rtt min/avg/max/mdev = 8.950/9.120/9.420/0.180 ms',
              '$ traceroute -n 8.8.8.8',
              'traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets',
              ' 1  192.168.1.1  1.084 ms  1.021 ms  0.996 ms',
              ' 2  10.10.0.1  4.322 ms  4.288 ms  4.301 ms',
              ' 3  81.2.44.1  9.410 ms  9.402 ms  9.388 ms',
              ' 4  74.125.242.161  9.355 ms  9.371 ms  9.360 ms',
              ' 5  * * *',
              ' 6  8.8.8.8  9.004 ms  8.991 ms  8.975 ms'
            ]
          },
          {
            type: 'p',
            text:
              'Cross-check the two outputs: TTL 122 implies 6 hops from an initial 128, and the trace indeed ends at hop 6 — the numbers agree, which is exactly the habit to build. Hop 5 is silent: a device that forwards but refuses to answer probes. RTTs plateau at about 9 ms from hop 3 onward — the path, not the individual routers, owns the latency.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Three failures, three diagnoses, two commands each. (1) dig fails but ping 8.8.8.8 works: name resolution is broken, the network is fine — check resolv.conf. (2) ping gateway works, ping 8.8.8.8 times out, traceroute stops right after the gateway: the problem is upstream of your router — ISP or NAT. (3) Everything fine except one TCP port (nc times out while ping succeeds): host or path firewall on that port, network healthy. In each case the sequence — resolve, local link, gateway, destination — told you which layer owned the failure.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'ping — reachability, loss and latency, plus -M do -s MTU probes',
              'traceroute — path mapping with UDP, -I ICMP and -T TCP probe variants',
              'tracepath — path plus PMTU without root privileges',
              'mtr — combines ping and traceroute continuously; excellent for intermittent loss',
              'nc — TCP-based reachability when ICMP is filtered'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Diagnosing from a single ping — loss statistics need a series',
              'Reading ping failure as host down — filtered ICMP and dead hosts look identical to ping',
              'Treating a hop\u2019s RTT as that router\u2019s own delay — RTT is cumulative from the sender',
              'Using flood ping (-f) against anything you do not own — it is a traffic generator, not a test',
              'Trusting traceroute hop addresses as the routers\u2019 real identities — they are interface addresses, sometimes NATted'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run traceroute -n to three different public sites from your lab. Find where the paths converge (your ISP) and where they diverge. Pick one star hop and write a one-sentence explanation of why it might not answer. If mtr is installed, run mtr -n -c 20 8.8.8.8 and compare its loss statistics with what traceroute suggested.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'ping reports reachability, loss and RTT; read icmp_seq, ttl and the summary together',
              'Failure messages localize the layer: name, route, upstream router, or silence',
              'traceroute works by TTL exhaustion: each returning router announces itself',
              'Stars mean "no answer", not "no path" — routers drop probes and still forward',
              'Probe variants (UDP, ICMP, TCP) matter when filtering meets you at the path'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n03-l02-q1',
          type: 'mcq',
          prompt: 'What makes intermediate routers reveal themselves during a traceroute?',
          options: [
            'They echo each probe back to the sender',
            'The probe\u2019s TTL reaches zero and the router returns ICMP time exceeded',
            'The destination acknowledges each hop individually',
            'Reverse DNS lookups identify each router'
          ],
          answerIndex: 1,
          hint: 'What happens to a packet whose TTL runs out?',
          explanation:
            'Each router that decrements a TTL to zero must discard the packet and send ICMP time exceeded — that notification is the hop announcing itself. The final hop is revealed by the destination\u2019s own reply instead.'
        },
        {
          id: 'n03-l02-q2',
          type: 'truefalse',
          prompt: 'ping uses TCP by default.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which protocol carries echo request and echo reply?',
          explanation:
            'ping sends ICMP echo request (type 8) and listens for echo reply (type 0). A host may be perfectly reachable over TCP while ignoring ICMP — which is why TCP-based probes belong in every toolkit.'
        },
        {
          id: 'n03-l02-q3',
          type: 'short',
          prompt: 'What does * * * on a traceroute line mean, and name two possible causes.',
          modelAnswer:
            'No reply arrived for the probes at that TTL. Causes include a router that filters or rate-limits traceroute probes while still forwarding traffic, and genuine packet loss on that hop. Silence identifies a device that does not answer — it does not prove the path is broken.',
          hint: 'Absence of an answer is not the same as absence of forwarding.',
          explanation:
            'Interpreting stars correctly prevents the most common traceroute misdiagnosis: declaring a working path broken because one device politely declines to identify itself.'
        },
        {
          id: 'n03-l02-q4',
          type: 'scenario',
          prompt:
            'During an authorized internal test, pinging a server in another subnet times out, yet from the same test machine nc -zv that-server 445 succeeds instantly. Explain the apparent contradiction and what it tells you about the environment.',
          modelAnswer:
            'There is no contradiction: TCP to 445 works, so the host is up and the path is fine — the environment simply filters ICMP echo (common on enterprise networks and Windows defaults). The correct conclusions: reachability must be tested with TCP probes here, the host is alive, and the ICMP filtering policy itself is an observation worth including in the report. Adjust the technique — TCP-based discovery — rather than doubting the network.',
          hint: 'Which probe got an answer, and what did it prove?',
          explanation:
            'ICMP-blocked environments are the norm in hardened networks. The lesson generalizes: when one probe type fails, switch protocols before switching conclusions — silence from one transport is not evidence about another.'
        }
      ],
      references: [
        {
          title: 'ping(8) — Linux man page (iputils)',
          url: 'https://man7.org/linux/man-pages/man8/ping.8.html',
          note: 'Official ping reference: flags, output fields and ICMP behavior.'
        },
        {
          title: 'RFC 792 — Internet Control Message Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc792.html',
          note: 'Echo request/reply and time exceeded — the mechanics behind both tools.'
        }
      ]
    },
    {
      id: 'n03-l03',
      moduleId: 'n03',
      title: 'DNS Interrogation and Data Retrieval: dig, nslookup, host, curl and wget',
      difficulty: 'Beginner',
      minutes: 17,
      prerequisites: ['n03-l02'],
      objectives: [
        'Query DNS precisely with dig: record types, alternate resolvers, reverse lookups and the AXFR concept',
        'Use nslookup and host as quick equivalents and know when dig is the better tool',
        'Retrieve and inspect web resources with curl and wget, reading status codes and headers as recon signal'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'DNS is a public database describing an organization\u2019s infrastructure: which servers exist, which handle mail, which name servers are authoritative, and — in TXT records — whole policy documents. dig is how you query that database precisely. curl is how you knock on a web service and read exactly what it says about itself: status, headers, redirects. Together they are the passive-adjacent recon staples of the first day of any engagement.'
          },
          {
            type: 'p',
            text:
              'The skill is fetch-then-think: record sets, status codes and headers are not trivia to collect — each one is a hypothesis about the target\u2019s architecture that the next command can test. This lesson teaches both tools and the reading habit that connects them.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'dig'
          },
          {
            type: 'p',
            text:
              'A dig run prints the question, then answer, authority and additional sections, then statistics. The flags you will use daily: +short for bare answers, +noall +answer for a clean section view, +trace to walk the hierarchy from the root servers yourself, -x for reverse lookups, and @server to query a specific resolver — the key to comparing split-horizon answers. Record types: A, AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV. Every answer carries its TTL, and reading TTLs is reading the domain\u2019s change-management philosophy.'
          },
          {
            type: 'p',
            text:
              'The AXFR concept: a zone transfer replicates an entire zone from a primary to a secondary name server. It must be restricted to authorized secondaries; when a misconfigured server serves it to anyone, dig AXFR domain returns the whole zone — every host name the organization has. Testing for it is a classic authorized-engagement quick win, and belongs exclusively to DNS you are allowed to test.'
          },
          {
            type: 'h',
            text: 'nslookup and host'
          },
          {
            type: 'p',
            text:
              'host domain gives a compact answer; host -t mx domain queries a specific type; nslookup offers an interactive shell and -type= selectors, and both accept a trailing resolver argument. dig remains the tool of choice for real work: its output is unambiguous, scriptable and shows TTLs and flags that the simpler tools hide.'
          },
          {
            type: 'h',
            text: 'curl and wget'
          },
          {
            type: 'p',
            text:
              'curl speaks URLs: -I sends a HEAD request for headers only, -v shows the whole conversation including the TLS handshake, -L follows redirects, -s silences progress output, -o writes to a file, and --resolve host:port:IP pins a hostname to an address for one request — the lab trick for testing virtual-host routing before DNS exists. wget is the downloader: -r for recursive retrieval, -O for the output file, -q for quiet. Reach for curl when you need method control, headers and APIs; reach for wget when you want to mirror or bulk-download.'
          },
          {
            type: 'table',
            headers: ['Status', 'Recon reading'],
            rows: [
              ['200', 'Resource exists and answers — record the stack headers'],
              ['301 / 302', 'Redirects: follow them and re-check; redirect logic is testable surface'],
              ['401 / 403', 'Exists but guarded — often worth a second look with different methods or vhosts'],
              ['404', 'Gone — or a blanket WAF answer; verify with content length and body'],
              ['5xx', 'A fragile backend — note for later careful testing, not for hammering']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'DNS answers build the target inventory: A and AAAA map hosts, MX maps mail flow, NS maps who controls the zone, TXT maps security policy and vendor integrations, and comparing resolvers exposes split-horizon design. curl headers fingerprint stacks (Server, X-Powered-By) and redirect chains reveal authentication-flow assumptions. --resolve is how you test vhost routing against a lab server before any DNS is set up.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Active DNS techniques need authorization',
            text:
              'Querying public records is ordinary usage. Zone transfer attempts, name brute-forcing and resolver stress-testing are active techniques: run them only against DNS you own or are authorized to test, and rate-limit anything touching third-party servers.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Wildcard DNS: if random names resolve, wordlist-based subdomain results lie — verify against a nonsense name first',
              'AXFR allowed from outside the zone — instant reportable finding on authorized tests',
              'Rich TXT records: SPF/DKIM/DMARC map the mail infrastructure, verification tokens name cloud vendors',
              'Verbose Server and X-Powered-By headers — free fingerprinting the client should probably disable',
              'Redirect chains that mix http and https, or loop — misconfigurations and logic flaws live here'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The following session is ordinary, polite querying of public data — the DNS equivalent of reading a phone book:'
          },
          {
            type: 'terminal',
            title: 'DNS profile and web fingerprint',
            lines: [
              '$ dig +short example.org A',
              '96.7.128.175',
              '$ dig +short example.org NS',
              'a.iana-servers.net.',
              'b.iana-servers.net.',
              '$ dig +short gmail.com MX | head -3',
              '5 gmail-smtp-in.l.google.com.',
              '10 alt1.gmail-smtp-in.l.google.com.',
              '20 alt2.gmail-smtp-in.l.google.com.',
              '$ dig +short -x 8.8.8.8',
              'dns.google.',
              '$ curl -sI http://example.org | head -3',
              'HTTP/1.1 301 Moved Permanently',
              'Location: https://example.org/',
              '$ curl -sI https://example.org | head -4',
              'HTTP/2 200',
              'content-type: text/html; charset=UTF-8',
              'strict-transport-security: max-age=31536000; preload'
            ]
          },
          {
            type: 'p',
            text:
              'Read the session: delegation records (NS) with long TTLs, a mail exchanger list with priority ordering, a working reverse zone, and a web server that enforces HTTPS with a 301 plus HSTS — modern baseline confirmed in six commands. Exact values change over time; the format and the reading habit are the lesson.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A first-day external profile of an authorized target: A and AAAA records name the edge servers, MX names the mail vendor, NS names the DNS provider, TXT reveals the SPF include for a SaaS mail gateway — four vendors identified without a single active probe. Then curl -I on the main site returns a 301 chain http, to https, to www — three hops where one would do, each hop a policy decision worth testing (does the redirect preserve paths? can it be forced off-domain?). That is recon: facts collected, hypotheses queued.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['dig', 'Precise, scriptable DNS queries with TTLs and flags'],
              ['nslookup / host', 'Quick queries where dig is unavailable'],
              ['curl', 'HTTP(S) conversations: headers, redirects, methods, --resolve pinning'],
              ['wget', 'Recursive downloads and mirroring'],
              ['resolvectl', 'Inspect the local resolver\u2019s upstreams and cache']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting ANY queries to show all records — most servers refuse or truncate; ask for types explicitly',
              'Forgetting @server when comparing answers — split-horizon differences vanish if you always ask the same resolver',
              'Reporting the 301 as the final answer — follow -L before characterizing a URL',
              'Running name wordlists without a wildcard check — random names resolving makes every result meaningless',
              'Hammering third-party authoritative servers at scanner rates — you will get rate-limited or banned, and deserve it'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Profile a domain you own (or example.org): A, AAAA, MX, NS and TXT via dig +noall +answer. Compare the answers from two public resolvers (dig @1.1.1.1 and dig @8.8.8.8) and note any difference. Then curl -sI with and without -L on an http:// URL and describe the redirect policy in one sentence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'DNS is a public infrastructure database; record types are its tables',
              'dig gives precision: +short, +noall +answer, +trace, -x and @resolver',
              'AXFR must be restricted; success from outside is a finding — on authorized zones only',
              'curl -I/-v/-L/--resolve covers headers, conversations, redirects and vhost pinning',
              'Status codes are hypotheses, not conclusions — 401/403 are invitations to think, not to hammer'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n03-l03-q1',
          type: 'mcq',
          prompt: 'Which dig flag prints only the answer records, bare?',
          options: ['-x', '+short', '+trace', '-e'],
          answerIndex: 1,
          hint: 'You want the answer section and nothing else.',
          explanation:
            '+short prints just the answer data — ideal for scripts and quick checks. -x is reverse lookup, +trace walks from the root, and there is no -e flag for dig.'
        },
        {
          id: 'n03-l03-q2',
          type: 'truefalse',
          prompt: 'A zone transfer (AXFR) should succeed from any resolver that answers normal queries.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who is supposed to receive a whole zone?',
          explanation:
            'AXFR exists for secondary name servers and must be restricted to them. A successful transfer from an outside host is a misconfiguration that dumps the entire zone — a classic authorized-test finding.'
        },
        {
          id: 'n03-l03-q3',
          type: 'short',
          prompt: 'What does curl --resolve app.lab.test:8080:127.0.0.1 do, and why is it useful in a lab?',
          modelAnswer:
            'It pins the hostname app.lab.test (on port 8080) to 127.0.0.1 for this request, bypassing DNS entirely. That lets you test virtual-host routing and name-based behavior against a lab server before any DNS record exists — or to compare what different backends serve for the same name.',
          hint: 'It answers a DNS question locally, for one request.',
          explanation:
            '--resolve decouples the hostname in the request (what the server sees) from actual DNS resolution (where the packets go) — exactly the control needed for vhost and routing tests.'
        },
        {
          id: 'n03-l03-q4',
          type: 'scenario',
          prompt:
            'curl -I http://target.lab returns 301 to https://target.lab, and curl -I https://target.lab returns 200 with an HSTS header. What is confirmed, and why might a pentester still examine the HTTP side carefully?',
          modelAnswer:
            'Confirmed: the server enforces HTTPS via redirect and advertises HSTS — a modern baseline. The HTTP side still matters: the Location construction can hide an open-redirect flaw, clients that ignore redirects may expose mixed content, the redirect may drop paths or query strings (breaking deep links), and HSTS scope/max-age may be misconfigured (not covering subdomains). Each is a small, testable claim rather than a guess.',
          hint: 'The redirect is a policy — every policy has edge cases.',
          explanation:
            'A correct-looking redirect chain is not the end of analysis: open redirects, path mangling and HSTS scoping are the standard follow-ups, and they are exactly what distinguishes fingerprinting from testing.'
        }
      ],
      references: [
        {
          title: 'RFC 1035 — Domain Names, Implementation and Specification',
          url: 'https://www.rfc-editor.org/rfc/rfc1035.html',
          note: 'The wire format and record types every DNS tool exposes.'
        },
        {
          title: 'curl — official command line documentation',
          url: 'https://curl.se/docs/manpage.html',
          note: 'The authoritative flag reference for curl.'
        }
      ]
    },
    {
      id: 'n03-l04',
      moduleId: 'n03',
      title: 'Sockets and Traffic Observation: ss, netstat, nc and tcpdump',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n03-l03'],
      objectives: [
        'Enumerate and interpret sockets with ss (and its legacy twin netstat), including states and bindings',
        'Use nc for listeners, banner grabs and port checks, and know its limitations',
        'Capture traffic with tcpdump using -i, -n, host/port filters and -w, and read the first capture'
      ],
      diagram: 'net-capture-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'ss shows what your machine is talking about: every listening service, every live connection, every state. nc lets you have arbitrary TCP and UDP conversations by hand. tcpdump records what the wire actually carries. Together they close the loop this module has been building: configuration (ip), path (ping/traceroute), name resolution and retrieval (dig/curl), and now the conversations themselves.'
          },
          {
            type: 'p',
            text:
              'These are also the verification tools of the entire academy: when a later lab module demonstrates an attack or a defense, these commands are how you confirm what really happened on the wire rather than trusting a tool\u2019s claim.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-capture-pipeline',
            caption: 'From the wire to your terminal: interface, kernel filter, capture, display or file.'
          },
          {
            type: 'h',
            text: 'ss — socket statistics'
          },
          {
            type: 'p',
            text:
              'The flags stack: -t TCP, -u UDP, -l listening only, -p owning process, -n numeric (no name resolution — faster and honest). States matter: LISTEN is a bound server socket, ESTAB is live conversation, TIME-WAIT is the normal post-close lingering of your side, CLOSE-WAIT means the peer closed and your application never did — an app bug with a signature look, and SYN-SENT is an outbound attempt that has not completed. State filters like ss -tan state established narrow the view. The binding address is the exposure story: 0.0.0.0:22 serves every interface, 127.0.0.1:22 serves only the machine itself.'
          },
          {
            type: 'p',
            text:
              'netstat is the legacy twin: netstat -tulpn mirrors ss -tulpn, and netstat -r shows routes. Prefer ss everywhere — it is faster, maintained and reads from netlink directly — but read netstat fluently because you will meet it on older systems.'
          },
          {
            type: 'h',
            text: 'nc — arbitrary conversations'
          },
          {
            type: 'list',
            items: [
              'Listener: nc -lvnp 4444 — listen, verbose, no DNS, port 4444',
              'Connect: nc host port — a raw conversation; what you type goes on the wire',
              'Banner grab: connect and read the greeting (SSH, SMTP, FTP all speak first)',
              'Port check: nc -zv host port — for TCP a reliable open/closed test; for UDP nearly meaningless (silence is ambiguous)',
              'Timeouts and UDP: -w seconds, -u for datagrams; flag syntax varies between netcat variants — read your man page'
            ]
          },
          {
            type: 'h',
            text: 'tcpdump — the wire, verbatim'
          },
          {
            type: 'p',
            text:
              'The essentials: -i picks the interface (any is often the honest choice on hosts with bridges and tunnels), -n stops name resolution from polluting the capture, -c limits packet count, -A prints payloads as ASCII (plaintext protocols become readable), -e shows the link layer, -v/-vv add protocol detail, -w writes a pcap and -r reads one back. Filters use the BPF syntax: host 10.0.0.5, port 443, net 10.0.0.0/24, icmp / tcp / udp, combined with and, or, not — for example tcp port 8000 and host 10.0.2.15. Capturing needs root or CAP_NET_RAW.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Capture only what is yours',
            text:
              'Recording traffic on networks you do not own or are not authorized to monitor — including shared flats, workplaces and public Wi-Fi — is a crime in most jurisdictions, whatever the intent. Every capture exercise here happens on your own lab machines and virtual networks.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Post-access local recon starts with ss -tulpn: the service inventory with owning processes, plus the ESTAB list that shows which peers this machine trusts. nc banner grabs fingerprint services with a handful of bytes — far quieter than a full scan. tcpdump is the verification instrument: is this protocol actually encrypted on the wire? did the lab attack you just demonstrated (in later modules) produce the expected packets? does the firewall change behave as claimed? Evidence beats assertion, and pcaps are evidence.'
          },
          {
            type: 'list',
            items: [
              'Listeners on 0.0.0.0 that should be 127.0.0.1 — instant exposure finding',
              'CLOSE-WAIT piles and SYN-SENT storms — application and dependency problems worth reporting',
              'Unexpected ESTAB connections to external addresses — beaconing patterns, valuable to defenders too',
              'Plaintext credentials visible in tcpdump -A during lab tests — the evidence chain for cleartext-protocol findings'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Listening services you cannot account for, and processes bound to privileged ports',
              'Bindings on :: (IPv6 any) with no IPv4 twin — reachability differences per stack',
              'UDP services (SNMP, syslog) that serve more than their owner expects',
              'Capture filters too broad for the question — precision keeps evidence readable',
              'Long-running tcpdump writing unencrypted pcaps full of sensitive payloads onto shared storage'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The complete loop, all on your own lab machine — enumerate, converse, capture:'
          },
          {
            type: 'terminal',
            title: 'Sockets first',
            lines: [
              '$ ss -tulpn | head -6',
              'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process',
              'udp   UNCONN 0      0      127.0.0.53%lo:53    0.0.0.0:*   users:(("systemd-resolve",pid=812,fd=14))',
              'tcp   LISTEN 0      4096   0.0.0.0:22          0.0.0.0:*   users:(("sshd",pid=705,fd=3))',
              'tcp   LISTEN 0      511    0.0.0.0:8000        0.0.0.0:*   users:(("python3",pid=2201,fd=3))',
              '$ ss -tan state established',
              'Recv-Q Send-Q Local Address:Port   Peer Address:Port',
              '0      0      10.0.2.15:22         10.0.2.2:51234'
            ]
          },
          {
            type: 'terminal',
            title: 'Conversations with nc',
            lines: [
              '$ nc -lvnp 4444',
              'listening on [any] 4444 ...',
              'connect to [10.0.2.15] from (UNKNOWN) [10.0.2.15] 44812',
              'hello lab',
              '$ nc -v 10.0.2.15 4444',
              'Connection to 10.0.2.15 4444 port [tcp/*] succeeded!',
              'hello lab',
              '$ nc -w2 10.0.2.15 22',
              'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4'
            ]
          },
          {
            type: 'terminal',
            title: 'Capture and read the wire',
            lines: [
              '$ sudo tcpdump -i any -n -c 3 tcp port 8000',
              'tcpdump: listening on any, link-type LINUX_SLL2 (Linux cooked v2), snapshot length 262144 bytes',
              '10:31:02.113456 eth0  In  IP 10.0.2.2.51236 > 10.0.2.15.8000: Flags [S], seq 118344125, win 64240, options [mss 1460,sackOK,TS val 987654 ecr 0], length 0',
              '10:31:02.113489 eth0  In  IP 10.0.2.15.8000 > 10.0.2.2.51236: Flags [S.], seq 223456789, ack 118344126, win 65160, options [mss 1460,sackOK,TS val 900123 ecr 987654], length 0',
              '10:31:02.113502 eth0  Out IP 10.0.2.2.51236 > 10.0.2.15.8000: Flags [.], ack 1, win 64240, length 0',
              '3 packets captured',
              '$ sudo tcpdump -i any -n -A -s0 -c 2 tcp port 8000 &',
              'GET / HTTP/1.1',
              'Host: 10.0.2.15:8000',
              'HTTP/1.0 200 OK',
              'Server: SimpleHTTP/0.6 Python/3.10.12'
            ]
          },
          {
            type: 'p',
            text:
              'Read the capture block as the handshake you memorized in module 02: S, S. (SYN+ACK), then the pure ACK — the three-way handshake live, with MSS 1460 visible in the options exactly as the arithmetic predicted. The -A pass turns payloads into the actual GET and response, proving the transfer is plaintext. Save evidence with -w lab.pcap and read it back with tcpdump -r lab.pcap -n | head, or open it in Wireshark for the full dissection.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The full loop as a lab exercise: start python3 -m http.server 8000 in the background; ss shows LISTEN 0.0.0.0:8000 owned by python3; nc connects and pulls a page; tcpdump -A shows the GET and the 200 response in cleartext; kill the server and nc -zv now fails with connection refused. You exercised every tool in this lesson against a target you own, and produced a tiny piece of evidence (the pcap) — the same cycle, scaled up, is how professionals verify claims on authorized engagements.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ss', 'Modern socket listing with states, processes and filters'],
              ['netstat', 'Legacy equivalent — read it fluently, prefer ss'],
              ['nc / ncat', 'Raw TCP/UDP conversations, listeners, banner grabs'],
              ['telnet', 'Interactive protocol probing where installed (same trick as nc)'],
              ['tcpdump', 'Command-line capture with BPF filters and pcap output'],
              ['Wireshark', 'GUI analysis of saved pcaps — the dissection teacher']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Sniffing networks you are not authorized to capture — a legal line, not a judgment call',
              'Running tcpdump without -n — your capture fills with its own DNS traffic and slows down',
              'Forgetting root or CAP_NET_RAW — empty captures with no error message',
              'Reading TIME-WAIT as a problem — it is the normal post-close state of the side that closed first',
              'Assuming nc flags are identical across variants (openbsd versus traditional differ in subtle ways)',
              'Leaving giant unencrypted pcap files on shared storage — captures are sensitive data'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full loop end to end in your lab: serve, enumerate with ss, converse with nc, capture with tcpdump and read the GET in the -A output. Then repeat with UDP (nc -ul on one terminal, nc -u on the other) and observe how little feedback UDP gives you. Finish by writing one sentence per tool: what did it tell you that the others could not?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'ss -tulpn is the local service inventory; states and bindings carry the meaning',
              'TIME-WAIT is normal; CLOSE-WAIT is an application bug; bindings decide exposure',
              'nc makes any conversation: listeners, banner grabs, port checks — with honest UDP limitations',
              'tcpdump -i -n with BPF filters answers what the wire really carries; -A shows plaintext payloads',
              'Capture is regulated: your lab, your authorization, sanitized evidence in your reports'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n03-l04-q1',
          type: 'mcq',
          prompt: 'Which ss flag shows the process that owns each socket?',
          options: ['-n', '-p', '-l', '-u'],
          answerIndex: 1,
          hint: 'Processes are what -p is for.',
          explanation:
            '-p attaches the owning process (via users:(...)), turning a port list into a service inventory. -n skips name resolution, -l filters listeners, -u selects UDP.'
        },
        {
          id: 'n03-l04-q2',
          type: 'truefalse',
          prompt: 'tcpdump -n disables reverse DNS lookups during the capture.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Why would resolution during a capture be a problem?',
          explanation:
            '-n prints numeric addresses. Without it, tcpdump generates its own DNS traffic while capturing, which pollutes the evidence and slows high-volume captures. Professional captures almost always use -n.'
        },
        {
          id: 'n03-l04-q3',
          type: 'short',
          prompt: 'What is the operational difference between a service listening on 0.0.0.0:22 and one listening on 127.0.0.1:22?',
          modelAnswer:
            '0.0.0.0:22 accepts connections on every interface — reachable from any network the host is attached to, subject to firewalling. 127.0.0.1:22 accepts connections only from the machine itself. The binding decides exposure: the same daemon can be network-facing or purely local depending on its bind address.',
          hint: 'Who can even attempt to connect?',
          explanation:
            'Exposure assessments start with bindings, not firewalls: a localhost-bound admin panel is unreachable from the network no matter what the firewall does — and changing the binding is a common real-world finding fix.'
        },
        {
          id: 'n03-l04-q4',
          type: 'scenario',
          prompt:
            'On an authorized lab engagement you suspect a legacy service transmits credentials in cleartext. Which tcpdump invocation captures readable evidence, and what two checks confirm the suspicion before you write the finding?',
          modelAnswer:
            'Capture with sudo tcpdump -i any -n -A -s0 port <service port> (scoped to the port, ASCII payloads). Confirm first by finding the credential string verbatim in the captured payload, and second by verifying in the same capture that no TLS handshake wraps the session (no ClientHello/ServerHello, or simply the readable plaintext itself). Save a pcap with -w as evidence, sanitize it (credentials, unrelated traffic) before attaching to the report, and reference the exact filter used so the client can reproduce.',
          hint: 'Two independent signals: the payload, and the absence of encryption.',
          explanation:
            'Cleartext findings need evidence, not assertion: the readable payload plus the absence of a TLS layer, captured reproducibly and sanitized before reporting — the full evidence-hygiene cycle in one workflow.'
        }
      ],
      references: [
        {
          title: 'ss(8) — Linux man page (iproute2)',
          url: 'https://man7.org/linux/man-pages/man8/ss.8.html',
          note: 'Official ss reference: flags, states and filter syntax.'
        },
        {
          title: 'tcpdump(1) — official man page',
          url: 'https://www.tcpdump.org/manpages/tcpdump.1-4.99.4.html',
          note: 'The authoritative tcpdump reference, including BPF filter syntax.'
        }
      ]
    }
  ]
};
