import type { Module } from '../../../../types';

// LEVEL 0 — FOUNDATION · Module N01: Networking Fundamentals
// Original curriculum content synthesized from public official documentation:
// RFCs on rfc-editor.org and IANA registries. All prose is original; reference
// links point to the official sources used for study.

export const n01: Module = {
  id: 'n01',
  title: 'Networking Fundamentals',
  level: 0,
  description:
    'How networks actually work: hosts and interfaces, IPv4 and IPv6 addressing, subnetting and CIDR, ARP and MAC addresses, ports and sockets, and the difference between TCP and UDP. This is the foundation every later module builds on.',
  outcomes: [
    'Explain the structure of LANs, WANs and the Internet, and the role of hosts, clients and servers',
    'Reason about IPv4 and IPv6 addressing, including private, loopback and link-local ranges',
    'Subnet a network by hand using CIDR notation and calculate network, broadcast and usable host ranges',
    'Explain how ARP resolves IP addresses to MAC addresses and why both address types exist',
    'Describe ports and sockets and choose between TCP and UDP for a given task'
  ],
  lessons: [
    {
      id: 'n01-l01',
      moduleId: 'n01',
      title: 'What Is a Computer Network?',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: [],
      objectives: [
        'Define a network and distinguish LAN, WAN and the Internet',
        'Identify hosts, clients, servers and network interfaces on a real system',
        'Explain why a pentester always starts by mapping the network'
      ],
      diagram: 'net-lan-topology',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A computer network is simply two or more machines that can exchange data according to shared rules. A LAN (local area network) is one you can walk around in: an office floor, a home, a lab. A WAN (wide area network) connects LANs across distances you cannot walk — usually through an ISP. The Internet is not a single network at all: it is a network of networks, tens of thousands of independently operated networks that agree to exchange traffic. As a pentester, the network is your terrain, and this module teaches you to read it.'
          },
          {
            type: 'p',
            text:
              'The basic unit is the host: any device with a network address that can send and receive traffic — a laptop, a phone, a printer, a virtual machine, a container. Hosts attach through a network interface (a physical Ethernet or Wi-Fi card, or a virtual one like a loopback or a VM adapter). Client and server are roles, not kinds of hardware: the server is the side that listens, the client is the side that initiates. The same laptop is a client the moment it opens a website and a server the moment it shares a file.'
          },
          {
            type: 'p',
            text:
              'Everything you will ever do in network security — scanning, sniffing, pivoting, hardening — is the movement of data between hosts. Before touching a single tool you need the mental map: where the hosts are, what connects them, and which machine plays which role. That map is what this module builds.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-lan-topology',
            caption: 'A typical LAN: hosts, a switch, a wireless access point, and a router toward the WAN.'
          },
          {
            type: 'h',
            text: 'LAN, WAN, Internet'
          },
          {
            type: 'p',
            text:
              'Inside a LAN, hosts connect to a switch (which forwards frames based on hardware addresses) or to a wireless access point. A router connects the LAN to everything else — usually an ISP, then the wider Internet. The LAN is the zone where hosts share the same local delivery domain; crossing the router means crossing into routed territory, with different rules, different addressing, and different attack surface.'
          },
          {
            type: 'p',
            text:
              'The Internet is a mesh of networks run by ISPs, cloud providers, universities and companies, glued together by routing protocols. No single entity owns it, which is why authorization boundaries matter so much: every network on the path between you and a target belongs to someone, and only the target network\u2019s owner can authorize you to test it.'
          },
          {
            type: 'h',
            text: 'Hosts, interfaces, clients and servers'
          },
          {
            type: 'list',
            items: [
              'Host — any addressable device: server, workstation, phone, VM, container, IoT gadget',
              'Interface (NIC) — the attachment point of a host to a network; a host can have many (eth0, wlan0, lo, VPN tunnels)',
              'Switch — L2 device that moves frames between hosts on the same LAN',
              'Router — L3 device that moves packets between different networks',
              'Access point — bridges wireless clients onto the wired LAN',
              'Firewall — enforces which traffic may pass between zones'
            ]
          },
          {
            type: 'p',
            text:
              'Client and server remain the two roles every conversation has. The server binds and listens on a known port; the client picks a random high port and connects. Nearly every tool you will use is either emulating a client (nmap, curl, dig) or a server (a listener) — or both at once.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every engagement starts with a map: which networks are in scope, what can talk to what, and where the tester is physically and logically positioned. That position defines what is even possible. Sitting on the local segment gives you visibility of broadcast traffic and enables layer-2 techniques; testing remotely limits you to services that are routed to you. Knowing the difference between a LAN problem and a WAN problem is knowing which class of finding you are chasing.'
          },
          {
            type: 'list',
            items: [
              'Scoping is a topology question: which CIDR ranges, which segments, which vantage points',
              'Role inference: a domain controller and a workstation expose completely different services',
              'Position matters: local presence enables L2 techniques that remote testers cannot touch (covered in later modules)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'The default gateway address — it names the router and hints at the addressing plan',
              'Wireless and wired hosts sharing a segment (guest networks bridged into corporate LANs are a classic weakness)',
              'Dual-homed machines (two interfaces, two networks) — natural pivot points',
              'Admin interfaces of switches, printers and IoT devices reachable from user segments'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Your own lab first',
            text:
              'Practice network mapping only on networks you own or are explicitly authorized to assess. Connecting to and probing third-party networks without permission is illegal in most jurisdictions, regardless of intent.'
          },
          {
            type: 'p',
            text:
              'On any Linux machine (a lab VM is perfect) three read-only commands produce the first draft of your map:'
          },
          {
            type: 'terminal',
            title: 'Where am I, and who is my router?',
            lines: [
              '$ ip -br addr',
              'lo        UNKNOWN    127.0.0.1/8 ::1/128',
              'enp3s0    UP         192.168.1.50/24 fe80::42a1:1ff:fe9c:ab12/64',
              '$ ip route',
              'default via 192.168.1.1 dev enp3s0 proto dhcp metric 100',
              '192.168.1.0/24 dev enp3s0 proto kernel scope link src 192.168.1.50',
              '$ ping -c 2 192.168.1.1',
              'PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.',
              '64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.32 ms',
              '64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.21 ms',
              '--- 192.168.1.1 ping statistics ---',
              '2 packets transmitted, 2 received, 0% packet loss, time 1002ms'
            ]
          },
          {
            type: 'p',
            text:
              'You just learned: your own address (192.168.1.50), your subnet size (/24), your router (192.168.1.1), and that the router answers. That is a network map in three commands — and the exact routine you will repeat on day one of every authorized internal test.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Picture a home lab: an ISP router at 192.168.1.1 doing NAT and DHCP, a laptop at 192.168.1.50, a lab server at 192.168.1.100, and two virtual machines on an internal-only bridge at 10.0.0.0/24 hosted on the laptop. The laptop is dual-homed — it touches both the home LAN and the VM bridge, making it a router between them. Recognizing that structure, and being able to draw it, is precisely the first-hour skill of an authorized internal assessment.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'The map is a deliverable',
            text:
              'Professional reports always include a network diagram. A hand-drawn topology you verified with your own commands beats an out-of-date Visio file every time.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['ip (iproute2)', 'Shows interfaces, addresses and routes on any modern Linux'],
              ['ping', 'Confirms reachability and gives you a first latency signal'],
              ['Wireshark', 'Shows the actual conversations behind the map'],
              ['Draw.io or pen and paper', 'The diagram is a real deliverable, not decoration']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting the documentation: network diagrams in onboarding folders are often months out of date — verify with your own commands',
              'Forgetting virtual interfaces: VMs, containers and VPNs create networks inside networks that never appear on official diagrams',
              'Treating client and server as fixed hardware roles instead of per-conversation roles',
              'Ignoring the ISP edge device during scoping — the modem/router is part of the attack surface'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Draw your own home or lab network from memory: every host, the router, the switch or AP, and each subnet. Then verify it with ip -br addr, ip route, and your router\u2019s DHCP client list. Note every difference you find — reality always wins over memory, and that habit of verifying is the point.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'A network is hosts exchanging data; LAN, WAN and Internet differ in scale and ownership',
              'Hosts attach via interfaces; client and server are roles, not hardware classes',
              'Switches move frames inside a LAN; routers move packets between networks',
              'Mapping your position and the topology is step one of every engagement'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n01-l01-q1',
          type: 'mcq',
          prompt: 'Which statement about clients and servers is correct?',
          options: [
            'They are fixed hardware roles — a server can never act as a client',
            'They are roles a host plays per conversation or service',
            'Only machines on the Internet can be servers',
            'Clients must always have static IP addresses'
          ],
          answerIndex: 1,
          hint: 'Think about your laptop sharing a file while also browsing the web.',
          explanation:
            'Server and client describe behavior in a single conversation: one side listens, one initiates. The same host plays both roles constantly, which is why host-role inference during recon looks at services, not device types.'
        },
        {
          id: 'n01-l01-q2',
          type: 'truefalse',
          prompt: 'A virtual machine running on your laptop is a host on your network.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Does it have an address and send traffic?',
          explanation:
            'A VM has its own interfaces and addresses and exchanges traffic like any other host — through a virtual switch or bridge. Virtual hosts are a first-class part of every modern network map.'
        },
        {
          id: 'n01-l01-q3',
          type: 'short',
          prompt: 'What is a network interface, and name three examples you would find on a typical Linux laptop?',
          modelAnswer:
            'A network interface is any attachment point of a host to a network — physical or virtual. Examples: a wired NIC (eth0/enp3s0), a wireless NIC (wlan0/wlp2s0), the loopback interface (lo), or a virtual one such as a VPN tunnel (tun0) or a container bridge (docker0).',
          hint: 'Think about what ip link lists.',
          explanation:
            'Interfaces are where addresses live and where packets enter and leave a host. Enumerating them is the first step of mapping any machine, yours or an authorized target.'
        },
        {
          id: 'n01-l01-q4',
          type: 'scenario',
          prompt:
            'You are authorized to test a company LAN and your test machine is plugged into a floor switch. What can your physical position potentially observe that a remote tester cannot, and why?',
          modelAnswer:
            'From the local segment you share the broadcast domain: ARP requests and replies, DHCP traffic, and other broadcast/multicast chatter reach you regardless of switches (which flood broadcast frames). Local presence also enables layer-2 techniques later in the curriculum (ARP spoofing, rogue DHCP) that require the same segment. A remote tester only sees services that are routed out to them.',
          hint: 'Think about broadcast delivery versus routed unicast.',
          explanation:
            'Switches forward broadcast frames everywhere on the segment and forward unicast only to learned ports, so local vantage equals L2 visibility. Vantage point determines the attack techniques available — which is why scoping always records where the tester sits.'
        }
      ],
      references: [
        {
          title: 'RFC 1180 — A TCP/IP Tutorial',
          url: 'https://www.rfc-editor.org/rfc/rfc1180.html',
          note: 'Classic short tutorial walking the whole stack with pictures.'
        },
        {
          title: 'RFC 1122 — Requirements for Internet Hosts, Communication Layers',
          url: 'https://www.rfc-editor.org/rfc/rfc1122.html',
          note: 'The normative definition of how hosts behave at the link and internet layers.'
        }
      ]
    },
    {
      id: 'n01-l02',
      moduleId: 'n01',
      title: 'IP Addressing: IPv4, IPv6 and Special Addresses',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['n01-l01'],
      objectives: [
        'Read IPv4 dotted-decimal and IPv6 colon-hex notation fluently',
        'Classify addresses as public, private (RFC 1918), loopback, link-local or multicast',
        'Explain why special ranges exist and what each signals in scan output'
      ],
      diagram: 'net-ip-addressing',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An IP address does two jobs at once: it identifies a host and it locates that host inside the topology, because part of the address names the network and part names the machine within it. Addresses are the raw material of everything you will do — scoping documents are lists of addresses, scan results are lists of addresses, firewall rules match addresses. Reading an address and instantly knowing its category is a reflex you build here.'
          },
          {
            type: 'p',
            text:
              'Not all addresses are equal. Whole ranges are reserved for jobs that public addresses must never do: private LANs behind NAT, loopback testing, self-configured link-local addresses, multicast groups. These ranges are defined in public RFCs, so the categories leak information: seeing 10.x.x.x in scan output tells you the target is inside a corporate network; seeing 169.254.x.x tells you a host failed to get a DHCP lease.'
          },
          {
            type: 'p',
            text:
              'IPv6 is not optional knowledge anymore: it runs on most modern networks, often alongside IPv4 on the same hosts, and it is the layer defenses most frequently forget to monitor. The notation looks alien for a week and then reads like prose.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-ip-addressing',
            caption: 'IPv4 structure and the special-purpose ranges every tester must recognize on sight.'
          },
          {
            type: 'h',
            text: 'IPv4: 32 bits, four octets'
          },
          {
            type: 'p',
            text:
              'An IPv4 address is a 32-bit number written as four decimal octets (0-255 each), for example 192.168.10.130. The split between network portion and host portion is not fixed — a mask decides it, which is the topic of the next lesson. 32 bits give roughly 4.3 billion addresses, which is why the world needed IPv6 and NAT.'
          },
          {
            type: 'table',
            headers: ['Range', 'Name', 'What it means when you see it'],
            rows: [
              ['10.0.0.0/8', 'Private (RFC 1918)', 'Enterprise internal space — very common in corporate networks'],
              ['172.16.0.0/12', 'Private (RFC 1918)', 'Internal; also the default in many cloud VPCs'],
              ['192.168.0.0/16', 'Private (RFC 1918)', 'Homes, labs, small offices'],
              ['127.0.0.0/8', 'Loopback', 'The host itself; 127.0.0.1 is just one of ~16 million'],
              ['169.254.0.0/16', 'Link-local (APIPA)', 'Host could not reach a DHCP server — a signal in itself'],
              ['224.0.0.0/4', 'Multicast', 'One-to-many delivery groups'],
              ['255.255.255.255', 'Broadcast', 'Every host on the local segment'],
              ['0.0.0.0', 'Unspecified / any', 'Means "this host" or "any address" depending on context'],
              ['100.64.0.0/10', 'CGNAT', 'Carrier-grade NAT between ISP and customer — common on mobile networks']
            ]
          },
          {
            type: 'h',
            text: 'IPv6 in one pass'
          },
          {
            type: 'p',
            text:
              'IPv6 addresses are 128 bits, written as eight groups of four hex digits separated by colons, for example 2001:0db8:0000:0000:0000:ff00:0042:8329. Two compression rules (RFC 5952): leading zeros in a group may be dropped, and one — only one — run of all-zero groups may be replaced by a double colon: 2001:db8::ff00:42:8329. Address types you will meet: global unicast (2000::/3, the public space), unique local fc00::/7 (the IPv6 cousin of RFC 1918), link-local fe80::/10 (every interface gets one automatically), multicast ff00::/8, and loopback ::1. Hosts typically hold several IPv6 addresses at once, which is worth remembering when you read interface listings.'
          },
          {
            type: 'p',
            text:
              'How hosts get addresses: statically by configuration, dynamically via DHCP (IPv4) or DHCPv6/SLAAC (IPv6). The link-local 169.254.0.0/16 story matters operationally: when a DHCP client gives up, it self-assigns a random 169.254.x.x address so the host can at least talk to its own segment. Windows pioneered this as APIPA.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Scope documents are lists of CIDR ranges, and knowing address categories on sight tells you what you are looking at before any scan: 10/8 means corporate internal, 172.16/12 often means a cloud VPC, 192.168/16 means home or lab gear, 100.64/10 means you are behind carrier NAT. During internal tests, 169.254 addresses on a host are a finding lead — a DHCP infrastructure problem — and also a hint that the host is still L2-reachable even though its addressing is broken.'
          },
          {
            type: 'list',
            items: [
              'Private ranges sit behind NAT, so external and internal attack surfaces differ — never assume your external view equals the internal one',
              'Loopback services are local-only until you tunnel (later module), but ss output full of 127.0.0.1 listeners is free recon',
              'Dual-stack hosts have an IPv6 surface that firewalls and scanners routinely forget — a classic gap',
              'CGNAT ranges (100.64/10) change scope math on mobile and ISP engagements'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Addresses outside the documented plan (shadow IT, forgotten gear, misconfigured gear)',
              '169.254.x.x on any host — DHCP delivery is broken somewhere',
              'Dual-stack hosts where IPv6 has weaker firewalling than IPv4',
              '127.0.0.1-bound admin panels in listener output (local-only today, tunnel-reachable later)',
              'Scope sheets that say "internal = 10.x" while cloud segments actually use 172.16/12'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Address inspection is read-only and always safe on your own systems. The following session classifies every address on one interface:'
          },
          {
            type: 'terminal',
            title: 'Classifying your own addresses',
            lines: [
              '$ ip -4 addr show dev eth0',
              '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP',
              '    inet 192.168.1.50/24 brd 192.168.1.255 scope global dynamic eth0',
              '       valid_lft 85299sec preferred_lft 85299sec',
              '$ ip -6 addr show dev eth0 | grep inet6',
              '    inet6 fe80::42a1:1ff:fe9c:ab12/64 scope link',
              '    inet6 2001:db8:abcd:0:42a1:1ff:fe9c:ab12/64 scope global dynamic mngtmpaddr',
              '$ ping -6 -c 1 ::1',
              'PING(::1) 56 data bytes',
              '64 bytes from ::1: icmp_seq=1 ttl=64 time=0.035 ms'
            ]
          },
          {
            type: 'p',
            text:
              'Read the IPv4 line like a pentester: global scope means routable, dynamic plus valid_lft means DHCP is managing it with a ~24-hour lease. The IPv6 output shows the automatic link-local address and a global one — the dual-stack reality of modern hosts.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A scan returns four addresses: 10.20.30.44, 172.31.5.9, 169.254.9.9 and fe80::1. Your classifications: 10.20.30.44 is corporate internal (RFC 1918 10/8); 172.31.5.9 is also private — and note it sits inside 172.16.0.0/12, which runs to 172.31.255.255, so it is in range while 172.32.x.x would not be; 169.254.9.9 means that host never got a DHCP lease; fe80::1 is an IPv6 link-local address, valid only on the local segment. Four addresses, four different conclusions about the environment.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'ip (iproute2) — the ground truth of what addresses a host holds',
              'ipcalc / sipcalc — quick range and mask math while you are still building manual speed',
              'IANA special-purpose address registries — the authoritative list of reserved ranges',
              'nmap (later module) — turns address ranges into live-host inventories'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading 172.16.0.0/12 as if it were 172.16.0.0/16 — the private block spans 172.16.0.0 through 172.31.255.255',
              'Assuming all 192.168.x.x addresses belong to one network — two 192.168.1.0/24s can exist in different buildings',
              'Forgetting IPv6 on dual-stack hosts and reporting an "empty" attack surface that is actually IPv6-shaped',
              'Treating private addressing as a security control — RFC 1918 is public knowledge and provides no protection by itself',
              'Confusing 0.0.0.0 (unspecified/any) with a real destination address'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run ip -br addr on your machine and on two other devices in your lab. For every address, write its category: loopback, private, link-local, multicast, global. Then explain to yourself why each device holds exactly the addresses it does — a phone on Wi-Fi will look very different from a wired VM.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'IPv4 is four octets; IPv6 is eight hex groups with a single :: compression',
              'RFC 1918 ranges (10/8, 172.16/12, 192.168/16) are private — everything else is roughly public',
              'Loopback is the whole 127/8 plus ::1; link-local 169.254/16 and fe80::/10 mean "local segment only"',
              'Address categories are recon signals: DHCP failure, internal space, carrier NAT, forgotten IPv6'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n01-l02-q1',
          type: 'mcq',
          prompt: 'Which address falls inside RFC 1918 private space?',
          options: ['172.32.1.5', '172.20.1.5', '169.254.10.5', '100.64.1.5'],
          answerIndex: 1,
          hint: 'The 172 private block is /12 — it spans 172.16 through 172.31.',
          explanation:
            '172.16.0.0/12 covers 172.16.0.0 through 172.31.255.255, so 172.20.1.5 is private. 172.32.x.x is public, 169.254 is link-local, and 100.64/10 is carrier-grade NAT space.'
        },
        {
          id: 'n01-l02-q2',
          type: 'truefalse',
          prompt: '127.200.33.7 is a valid loopback address.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Loopback is an entire /8, not a single address.',
          explanation:
            'The whole 127.0.0.0/8 routes back to the local host, so any 127.x.y.z is loopback. Scanners and parsers must therefore treat the entire range as local, not just 127.0.0.1.'
        },
        {
          id: 'n01-l02-q3',
          type: 'short',
          prompt: 'A workstation shows only 169.254.17.203/16 on its only interface. What most likely happened, and what would you check next?',
          modelAnswer:
            'The DHCP client timed out and self-assigned an APIPA/link-local address — it could not reach a DHCP server. Next: check the link itself (cable, switch port, VLAN), whether the DHCP server is up and reachable, and whether DHCP relays are involved. The host may still be reachable on the local segment.',
          hint: 'Think about what had to fail for this address to appear.',
          explanation:
            'Link-local self-assignment is a fallback, not a configuration. It is both a symptom (DHCP delivery failed) and a recon fact (the host is on your segment and L2-reachable even though addressing is broken).'
        },
        {
          id: 'n01-l02-q4',
          type: 'scenario',
          prompt:
            'A scope document authorizes 172.16.0.0/12. During recon you find live hosts at 172.20.9.9 and 172.33.1.1. Which are in scope, and why?',
          modelAnswer:
            '172.20.9.9 is in scope: the second octet 20 falls between 16 and 31, which is what /12 means here. 172.33.1.1 is out of scope — 33 is beyond 172.31.255.255 — and testing it would be unauthorized. Confirm scope boundaries with the client in writing before proceeding.',
          hint: 'Convert /12 into the range of second octets it allows.',
          explanation:
            '/12 fixes the first 12 bits, so the first two octets are 172.16-172.31. Scope math errors are how testers accidentally attack machines they were never allowed to touch; always compute, never eyeball.'
        }
      ],
      references: [
        {
          title: 'RFC 1918 — Address Allocation for Private Internets',
          url: 'https://www.rfc-editor.org/rfc/rfc1918.html',
          note: 'The document that defined 10/8, 172.16/12 and 192.168/16.'
        },
        {
          title: 'RFC 4291 — IP Version 6 Addressing Architecture',
          url: 'https://www.rfc-editor.org/rfc/rfc4291.html',
          note: 'The normative IPv6 addressing reference, including scope and notation.'
        },
        {
          title: 'IANA — IPv4 Special-Purpose Address Registry',
          url: 'https://www.iana.org/assignments/iana-ipv4-special-registry',
          note: 'Authoritative list of every reserved IPv4 range and why it is reserved.'
        }
      ]
    },
    {
      id: 'n01-l03',
      moduleId: 'n01',
      title: 'Subnetting, CIDR and Routing Basics',
      difficulty: 'Beginner',
      minutes: 22,
      prerequisites: ['n01-l02'],
      objectives: [
        'Explain what a subnet mask does and read CIDR notation fluently',
        'Compute network, broadcast and usable host ranges by hand for any prefix',
        'Describe how a host decides between local delivery and the default gateway'
      ],
      diagram: 'net-subnetting',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Networks are chopped into subnets, and the subnet mask decides who counts as your neighbor. Two hosts are on the same subnet only if their network portions match — otherwise traffic must go through a router. Subnetting is the single most-used piece of math in networking: scoping documents, scan targets, firewall rules and pivot routes are all written in CIDR, and being able to do the arithmetic in your head separates people who use tools from people who understand them.'
          },
          {
            type: 'p',
            text:
              'Routing is the other half: how a packet leaves your local subnet. Every host keeps a routing table — a tiny map of the world — and picks the most specific matching route. Master these two ideas and concepts like firewalls, VLANs and pivoting become variations on a theme you already know.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-subnetting',
            caption: 'One /24 sliced into four /26 subnets: each block gets its own network and broadcast address.'
          },
          {
            type: 'h',
            text: 'Masks and CIDR notation'
          },
          {
            type: 'p',
            text:
              'A mask is a string of contiguous 1 bits followed by 0 bits. Bits under the 1s are the network portion; bits under the 0s are the host portion. CIDR notation writes the number of 1 bits after a slash: /24 means 24 network bits and 8 host bits, written 255.255.255.0 as a mask. To find the network address of an IP, AND the address with the mask — equivalently, keep the network bits and zero the host bits.'
          },
          {
            type: 'table',
            headers: ['Prefix', 'Total addresses', 'Usable hosts', 'Typical use'],
            rows: [
              ['/24', '256', '254', 'Standard LAN segment'],
              ['/25', '128', '126', 'Half a /24'],
              ['/26', '64', '62', 'Small segment'],
              ['/27', '32', '30', 'DMZ, small group'],
              ['/28', '16', '14', 'Infrastructure pairs'],
              ['/30', '4', '2', 'Point-to-point links'],
              ['/32', '1', '1', 'Single host route']
            ]
          },
          {
            type: 'p',
            text:
              'Worked example: 192.168.10.130/26. A /26 has 64 addresses in the fourth octet, and blocks start at multiples of 64: 0, 64, 128, 192. The address falls in the 128 block, so the network address is 192.168.10.128, the broadcast is 192.168.10.191, and usable hosts run 192.168.10.129 through 192.168.10.190 — 62 hosts. The first address of a block names the network and the last is the broadcast, which is why a /24 offers 254 usable hosts, not 256.'
          },
          {
            type: 'h',
            text: 'Routing decisions'
          },
          {
            type: 'p',
            text:
              'A routing table entry says: for this destination prefix, send via this next hop on this interface. Entries come from three sources: connected routes (the kernel creates one for every configured subnet), static routes (an administrator or DHCP adds them), and the default route (0.0.0.0/0 — use this for everything else). When a host sends a packet it picks the most specific matching prefix (longest prefix match). If the best match is a connected route, the destination is local and ARP resolves it directly. Otherwise the packet is addressed to the gateway — the destination IP stays the target, but the frame is delivered to the gateway\u2019s MAC, and the router takes it from there.'
          },
          {
            type: 'p',
            text:
              'Consequences worth internalizing: the default gateway must itself be reachable on a connected network, routers decrement TTL, and if no route matches at all the sender fails immediately with "network unreachable".'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Scope lists, scan targets and firewall rules are all CIDR expressions, so manual subnet math is a daily skill. Knowing your local subnet tells you exactly which hosts ARP can see (your broadcast domain); unreachable subnets mark routing or ACL boundaries — expect firewalls there and expect later modules to turn that into pivot planning.'
          },
          {
            type: 'list',
            items: [
              'Mis-sized firewall scopes are real findings: a rule written /23 where /24 was intended exposes twice the hosts',
              'Broadcast addresses are part of every block — scans and tools must never include them accidentally',
              'From any foothold, reading ip route maps the networks beyond your segment without a single scan',
              'Summary routes can hide detail from you — and from defenders, which cuts both ways'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Hosts with a /16 mask where the world is a /24 (mask typos cause weird reachability)',
              'Overlapping subnets after company merges — ambiguous routing is a defect',
              'Secondary addresses on an interface (an interface serving two subnets at once)',
              'Missing default route on segmented hosts — deliberate isolation or misconfiguration',
              'Static routes pointing at "boring" subnets — those are rarely boring'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Reading routes and interfaces is read-only and safe on systems you control or are authorized to assess:'
          },
          {
            type: 'terminal',
            title: 'Reading the host map',
            lines: [
              '$ ip route show',
              'default via 192.168.1.1 dev enp3s0 proto dhcp metric 100',
              '10.0.0.0/24 dev virbr1 proto kernel scope link src 10.0.0.1',
              '192.168.1.0/24 dev enp3s0 proto kernel scope link src 192.168.1.50 metric 100',
              '$ ip -4 addr show dev virbr1 | grep inet',
              '    inet 10.0.0.1/24 brd 10.0.0.255 scope global virbr1',
              '$ sysctl net.ipv4.ip_forward',
              'net.ipv4.ip_forward = 0'
            ]
          },
          {
            type: 'p',
            text:
              'Interpretation: this machine is connected to two networks (192.168.1.0/24 on hardware, 10.0.0.0/24 on a virtual bridge) and has one default route. With ip_forward at 0 it will not forward between them; with it at 1 this host is effectively a router — and a pivot point. A dual-homed host is always worth a second look in both directions: attacker vantage and defender exposure.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'An engagement scoping sheet says the client internal network is 10.20.0.0/16. You plan floor-by-floor /24s: 10.20.0.0/24 through 10.20.255.0/24, each holding 254 usable hosts — 256 subnets in total. For the host 10.20.3.77 you compute by hand: network 10.20.3.0, broadcast 10.20.3.255, usable 10.20.3.1-254. That calculation, done without a tool, is what lets you sanity-check scan output and scope documents all week.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'ip route / ip addr — the kernel\u2019s own answer to "what can you reach"',
              'ipcalc / sipcalc — verify your hand calculations (use them to check, never to think)',
              'Sysctl (net.ipv4.ip_forward) — tells you whether a dual-homed host actually forwards'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Counting 256 usable hosts in a /24 — the network and broadcast addresses are not usable',
              'Assuming two hosts share a subnet because their masks match — compare the network addresses, not the masks',
              'Adding a static route through a gateway that is not on a connected network (it silently fails)',
              'Writing firewall scopes as /24 out of habit — wrong-sized scopes are a classic access-control defect',
              'Forgetting that the broadcast address is often reachable and noisy — exclude it from scans deliberately'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'By hand — paper, no calculator — find network, broadcast and usable range for 10.10.77.200/26 and for 172.16.9.37/28. Then check with ipcalc and reconcile any difference. Finally, explain out loud why the usable count is two less than the block size; if you can teach it, you own it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'CIDR /n = n network bits; the mask decides who is a neighbor',
              'Network address = first address of the block; broadcast = last; everything between is usable',
              'Longest prefix match picks the route; connected routes beat static routes beat the default',
              'Non-local traffic goes to the gateway: same destination IP, gateway MAC',
              'Dual-homed hosts with forwarding enabled are routers — and pivot points'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n01-l03-q1',
          type: 'mcq',
          prompt: 'How many usable host addresses are in 192.168.1.64/26?',
          options: ['64', '62', '126', '30'],
          answerIndex: 1,
          hint: 'A /26 block holds 64 addresses; subtract the network and broadcast.',
          explanation:
            '/26 gives 64 addresses; the first names the network (192.168.1.64) and the last is the broadcast (192.168.1.127), leaving 62 usable hosts.'
        },
        {
          id: 'n01-l03-q2',
          type: 'truefalse',
          prompt: 'A /31 prefix can legitimately be used on a point-to-point link.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'RFC 3021 carved out an exception for two-address links.',
          explanation:
            'RFC 3021 defines /31s for point-to-point links where no network/broadcast overhead is needed — both addresses are usable. Elsewhere, network and broadcast addresses are reserved.'
        },
        {
          id: 'n01-l03-q3',
          type: 'short',
          prompt: 'Your host is 10.10.10.5/24 and the target is 10.10.20.5. Is the target on your local subnet, and how does your host send the packet?',
          modelAnswer:
            'No. With /24 the local network is 10.10.10.0, and the target sits in 10.10.20.0. The host uses the longest-prefix match — presumably the default route — and hands the packet to the default gateway: the destination IP stays 10.10.20.5 but the Ethernet frame is addressed to the gateway\u2019s MAC address.',
          hint: 'Compute both network addresses, then ask who delivers the frame.',
          explanation:
            'Local-versus-remote is decided by comparing network addresses. Remote delivery delegates layer-2 forwarding to the gateway, which is why ARP on your segment resolves the router, never the final destination.'
        },
        {
          id: 'n01-l03-q4',
          type: 'scenario',
          prompt:
            'On an authorized test your foothold has one default route via 10.0.0.1. Pings to 10.0.0.1 succeed; pings to 172.16.8.5 time out. What are the plausible explanations, and what would you test next?',
          modelAnswer:
            'Possible causes: no route exists beyond the gateway toward 172.16.8.0/24, an ACL drops the traffic in between, or the target subnet is down. Next: traceroute toward the target to see how far packets travel, test other known subnets to see whether the gateway routes anywhere, and compare against the client\u2019s network documentation. Treat the boundary itself as information — it is probably a deliberate control, and that is reportable context, not noise.',
          hint: 'Timeout means silence — ask who should have spoken.',
          explanation:
            'A working gateway plus a dead remote path is the classic routing/ACL puzzle. Localization (how far the trace gets) distinguishes missing routes from filtering, and both findings are valuable to the client.'
        }
      ],
      references: [
        {
          title: 'RFC 950 — Internet Standard Subnetting Procedure',
          url: 'https://www.rfc-editor.org/rfc/rfc950.html',
          note: 'The original subnetting specification — the math has not changed.'
        },
        {
          title: 'RFC 4632 — Classless Inter-Domain Routing (CIDR)',
          url: 'https://www.rfc-editor.org/rfc/rfc4632.html',
          note: 'The architecture behind slash notation and prefix-based routing.'
        }
      ]
    },
    {
      id: 'n01-l04',
      moduleId: 'n01',
      title: 'MAC Addresses and ARP',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n01-l01'],
      objectives: [
        'Describe the structure of a MAC address and what the OUI reveals',
        'Walk through the ARP request/reply flow and explain the ARP cache',
        'Distinguish unicast, broadcast and multicast at layer 2, and know why ARP is a trusting protocol'
      ],
      diagram: 'net-arp-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Two addressing systems exist because there are two jobs. MAC addresses deliver data between neighbors on the same physical segment — hop by hop, rewritten at every router. IP addresses identify hosts end-to-end across many networks. ARP is the glue: the protocol that asks "who has this IP?" on the local segment and learns the answer\u2019s MAC.'
          },
          {
            type: 'p',
            text:
              'ARP was designed in 1982 for a trusting world: any host may answer any question, and answers are cached without verification. That trust is the root of the classic man-in-the-middle attacks you will study later under strict lab conditions. Understanding the normal flow now is what will let you recognize both attacks and their defenses when you get there.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-arp-flow',
            caption: 'ARP resolution: a broadcast question, a unicast answer, and a cached result.'
          },
          {
            type: 'h',
            text: 'MAC addresses'
          },
          {
            type: 'p',
            text:
              'A MAC address is 48 bits written as six hex pairs, for example 84:16:f9:24:3a:01. The first three pairs are the OUI — the vendor prefix assigned by IEEE — and the last three are the device-specific part. OUIs are a free recon trick: 84:16:f9 names a vendor without any active probing. Modern operating systems randomize Wi-Fi MACs per network for privacy, so treat MACs as hints, never as identity. Software can also set MACs arbitrarily, which is why "burned-in" is a historical term.'
          },
          {
            type: 'h',
            text: 'The ARP flow'
          },
          {
            type: 'p',
            text:
              'Host A wants to talk to IP B on the same subnet. It checks its ARP cache; on a miss it broadcasts an ARP request to ff:ff:ff:ff:ff:ff asking "who has 192.168.1.20?". Every host on the segment receives it; only B replies — unicast — with its MAC. A caches the mapping as a dynamic entry, which ages out after a period of disuse (Linux uses a reachability-based lifetime around 30 seconds as a base). Hosts also send gratuitous ARP announcements after address changes so neighbors can update their caches.'
          },
          {
            type: 'list',
            items: [
              'Unicast — one sender, one receiver; normal traffic',
              'Broadcast — ff:ff:ff:ff:ff:ff (layer 2), 255.255.255.255 (layer 3); every host on the segment processes it; ARP requests and DHCP discovery ride on it',
              'Multicast — 01:00:5e:xx for IPv4 groups, 33:33:xx for IPv6; delivered to subscribed group members only',
              'IPv6 does not use ARP at all — its Neighbor Discovery protocol (ICMPv6, RFC 4861) fills the same role and adds duplicate-address detection'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The ARP cache of a host is a who-has-it-talked-to-lately list — free recon on any machine you can inspect, and a validation tool on your own box during lab exercises. OUI census of a segment tells you how many printers, phones and IoT gadgets share it with workstations. Duplicate answers to one ARP request are the signature of IP conflicts or of active ARP spoofing, which later modules cover in full — including why defenders deploy Dynamic ARP Inspection and static entries.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'ARP spoofing is active interference',
            text:
              'Sending crafted ARP packets on a network you do not own or are not authorized to test is illegal and can break connectivity for others. This curriculum covers the detection and defense side here and the attack mechanics only inside its authorized-lab modules.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Two different MACs answering for one IP — conflict or spoofing (compare: router redundancy like VRRP legitimately shares a virtual MAC)',
              'A gateway MAC that changes mid-session — classic on-path indicator',
              'Cache entries for hosts you never contacted (someone probed or poisoned)',
              'Static ARP entries or Dynamic ARP Inspection on switches — signs of a hardened environment',
              'Randomized MACs rotating on wireless clients (privacy feature; note it in reports)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'On your own lab machine, watch the cache populate and age — no spoofing, just normal traffic:'
          },
          {
            type: 'terminal',
            title: 'Watching the ARP cache',
            lines: [
              '$ ip neigh show',
              '192.168.1.1 dev enp3s0 lladdr 84:16:f9:24:3a:01 REACHABLE',
              'fe80::1 dev enp3s0 lladdr 84:16:f9:24:3a:01 router STALE',
              '$ arp -n',
              'Address          HWtype  HWaddress           Flags Mask  Iface',
              '192.168.1.1      ether   84:16:f9:24:3a:01   C           enp3s0',
              '$ ping -c 1 192.168.1.50 > /dev/null; ip neigh show dev enp3s0 | grep "192.168.1.50"',
              '192.168.1.50 lladdr d8:3a:dd:01:9c:44 REACHABLE'
            ]
          },
          {
            type: 'p',
            text:
              'The ping forced a fresh ARP exchange, and the new entry shows REACHABLE before decaying to STALE over time. Look up the OUI prefixes (84:16:f9, d8:3a:dd) in Wireshark\u2019s vendor resolution or the IEEE registry to name the hardware makers — the same lookup you will do instinctively during internal tests.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Lab exercise: boot a fresh VM with an empty cache. Ping the gateway and a second lab VM, then dump ip neigh and record IP, MAC and vendor for each. Finally disconnect the second VM\u2019s interface and ping it again — the entry moves toward STALE and then INCOMPLETE/FAILED. You have now observed the entire cache lifecycle without touching anyone else\u2019s network, which is exactly the baseline you need to recognize abnormal behavior later.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ip neigh', 'Modern ARP/NDP cache inspection (iproute2)'],
              ['arp -n', 'Legacy cache view, still present on many systems'],
              ['Wireshark (filter: arp)', 'Watch request/reply exchanges live; resolves OUI vendors'],
              ['nmap (later module)', 'Uses ARP for host discovery on local segments']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Thinking MAC addresses travel end-to-end — they are rewritten at every router hop',
              'Treating a MAC as identity: spoofing is trivial and modern OSes randomize wireless MACs',
              'Confusing ARP (IPv4) with NDP (IPv6) — different protocol, same job',
              'Assuming cache entries are permanent — they age, which is why spoofing must be repeated',
              'Running "just to see" ARP tools on shared or corporate networks — authorization and blast radius matter'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build a segment inventory in your lab: contact three or four known hosts (ping is enough), then record IP, MAC and OUI vendor for each in a table. Add one device you did not know existed — there is always one — and identify what it is from the vendor prefix alone.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'MAC = local delivery, rewritten hop by hop; IP = end-to-end identity',
              'ARP broadcasts the question, unicasts the answer, caches the result with a lifetime',
              'Broadcast frames reach everyone on the segment — that is why ARP and DHCP use them',
              'OUI prefixes are free vendor recon; MACs are hints, not identity',
              'Duplicate ARP answers are the classic on-path attack signature — and have innocent twins (VRRP/HSRP)'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n01-l04-q1',
          type: 'mcq',
          prompt: 'Your host sends a packet to a web server on the Internet. Which MAC address is on the frame leaving your NIC?',
          options: [
            'The web server\u2019s MAC address',
            'The default gateway\u2019s MAC address',
            'ff:ff:ff:ff:ff:ff',
            'None — Internet frames carry no MAC'
          ],
          answerIndex: 1,
          hint: 'Which single device will physically receive this frame first?',
          explanation:
            'MAC addresses only carry frames to the next hop. For a remote destination that is the default gateway; its MAC comes from your ARP cache. The server\u2019s MAC gets substituted many hops later.'
        },
        {
          id: 'n01-l04-q2',
          type: 'truefalse',
          prompt: 'An ARP request is sent as a broadcast, while the ARP reply is unicast.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'The requester does not know the target\u2019s MAC yet — but the target knows the requester\u2019s.',
          explanation:
            'The question must reach everyone (broadcast), because the asker does not know who holds the IP. The reply can go straight back (unicast), since the request itself revealed the asker\u2019s MAC.'
        },
        {
          id: 'n01-l04-q3',
          type: 'short',
          prompt: 'What does the destination MAC ff:ff:ff:ff:ff:ff mean, and who processes frames sent to it?',
          modelAnswer:
            'It is the broadcast MAC: every host on the local segment processes the frame (and passes it up the stack). ARP requests and DHCP discovery use it because the sender does not yet know any specific neighbor\u2019s MAC.',
          hint: 'One address, every listener.',
          explanation:
            'Broadcasts are delivered to all stations on the segment — switches flood them. That property is exactly what makes local-segment visibility possible for defenders and testers alike.'
        },
        {
          id: 'n01-l04-q4',
          type: 'scenario',
          prompt:
            'On an authorized internal test you observe two different MACs replying to the same ARP request for the gateway IP within seconds of each other. List plausible explanations and your safe next step.',
          modelAnswer:
            'Plausible causes: an IP conflict or misconfigured device; a legitimate router redundancy pair (VRRP/HSRP — though these normally share one virtual MAC); or active ARP spoofing by another machine on the segment. Safe next step: passively capture ARP traffic for a few minutes, record the MACs, timestamps and OUI vendors, and report the observation to the client contact rather than attempting to "counter-attack". Distinguishing the causes is a documentation task, not a confrontation.',
          hint: 'Think benign duplicates first, then hostile ones.',
          explanation:
            'Duplicate ARP answers have both innocent and malicious explanations. A professional distinguishes them with passive evidence and reports; hostile responses on a client network are out of bounds and destroy trust.'
        }
      ],
      references: [
        {
          title: 'RFC 826 — An Ethernet Address Resolution Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc826.html',
          note: 'The 1982 ARP specification — short, readable, and still in force.'
        },
        {
          title: 'RFC 4861 — Neighbor Discovery for IP version 6 (IPv6)',
          url: 'https://www.rfc-editor.org/rfc/rfc4861.html',
          note: 'ARP\u2019s IPv6 successor: neighbor solicitation, advertisement and DAD.'
        }
      ]
    },
    {
      id: 'n01-l05',
      moduleId: 'n01',
      title: 'Ports, Sockets, TCP vs UDP',
      difficulty: 'Beginner',
      minutes: 16,
      prerequisites: ['n01-l04'],
      objectives: [
        'Explain port ranges (well-known, registered, dynamic) and what a socket actually is',
        'Contrast connection-oriented TCP with connectionless UDP',
        'Predict how the transport choice changes scanning and enumeration behavior'
      ],
      diagram: 'net-tcp-vs-udp',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'One IP address, hundreds of simultaneous conversations — ports make that possible by multiplexing: the destination port tells the OS which service gets the data, the source port tells the service which client to answer. A socket is the full identity of one end of a conversation: protocol plus IP plus port. Ports are to IP addresses what apartment numbers are to a street address.'
          },
          {
            type: 'p',
            text:
              'Above ports sit the two transports. TCP is a reliable, ordered stream — a phone call where every word arrives in sequence or the call quality machinery fixes it. UDP is a fire-and-forget datagram service — postcards: fast, stateless, and quite willing to lose one. Neither is better; they optimize for different jobs, and the choice shapes how you scan and enumerate the service behind the port.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-tcp-vs-udp',
            caption: 'TCP conversation versus UDP datagrams: state and guarantees versus speed and simplicity.'
          },
          {
            type: 'h',
            text: 'The port space'
          },
          {
            type: 'table',
            headers: ['Range', 'Name', 'Notes'],
            rows: [
              ['0-1023', 'Well-known', 'Historically reserved for privileged services: 22 SSH, 80 HTTP, 443 HTTPS, 53 DNS'],
              ['1024-49151', 'Registered', 'IANA-registered services: 3306 MySQL, 5432 PostgreSQL, 8080 alt-HTTP'],
              ['49152-65535', 'Dynamic / ephemeral', 'Client-side source ports, picked automatically per connection']
            ]
          },
          {
            type: 'p',
            text:
              'The IANA registry is the authoritative mapping of ports to service names — but nothing enforces it. Any process that can bind the port may serve anything on it, which is exactly why banner grabbing (later lessons) beats port-number guessing. DNS famously uses both transports (53/udp for queries, 53/tcp for larger answers), and RDP uses TCP 3389 with UDP 3389 as a modern companion.'
          },
          {
            type: 'h',
            text: 'Sockets'
          },
          {
            type: 'p',
            text:
              'A TCP socket is identified by the 4-tuple (protocol, local IP, local port, remote IP, remote port). That is why one web server on port 443 serves thousands of clients at once: each client has a different source IP or source port, so every tuple is unique. A listener on 0.0.0.0:443 accepts on all interfaces; a listener on 127.0.0.1:443 accepts from the machine itself only — a distinction that decides exposure.'
          },
          {
            type: 'h',
            text: 'TCP versus UDP'
          },
          {
            type: 'compare',
            title: 'Same job, different transport',
            beforeTitle: 'TCP — a file download',
            beforeCode:
              'Three-way handshake before any data\nEvery byte sequenced and acknowledged\nLost segments retransmitted\nReceiver window controls pacing\nConnection closed with FIN, or aborted with RST',
            afterTitle: 'UDP — a voice call',
            afterCode:
              'No handshake — first packet is the data\nDatagrams travel independently\nA lost packet is simply skipped\nThe application paces itself\nNo connection state at either end'
          },
          {
            type: 'p',
            text:
              'TCP costs latency and state but delivers guarantees, which is why anything that must be complete (web, mail, file transfer) uses it. UDP is cheap and fast and leaves reliability to the application: voice and video prefer losing an old packet over delaying a new one; DNS prefers one clean round trip; QUIC even rebuilds reliability on top of UDP. Port scanning inherits the difference: a closed TCP port usually answers with a RST (clear signal), while a closed UDP port often answers with nothing at all (ambiguous silence) — remember that asymmetry, it drives everything in the scanning module.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Ports are the primary recon target: every scan is a question about ports. The transport determines how confidently you can interpret the answer — TCP gives crisp open/closed/filtered distinctions, UDP muddies them. On a foothold, listing listening sockets (ss, covered hands-on in module 03) maps the machine\u2019s services; on the network, ephemeral source ports in captures reveal which hosts are acting as clients to whom.'
          },
          {
            type: 'list',
            items: [
              'Services on nonstandard ports (SSH on 2222, web on 8443) are common — never map ports to services without checking',
              'UDP services are frequently missed by TCP-only scans — a whole blind spot',
              'Listener bindings (0.0.0.0 versus 127.0.0.1) decide whether a service is network-reachable',
              'Both-transports services (DNS, RDP) can behave differently per transport — test each'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Listeners bound to 0.0.0.0 or :: on machines that should serve only localhost',
              'UDP ports that TCP scans never touched (161 SNMP, 69 TFTP, 514 syslog)',
              'Dynamic-port listeners (RPC-style services) that make port-based firewalls unreliable',
              'Source-port patterns in captures that reveal client behavior and dependencies',
              'Port numbers in reports treated as proof of service — verify with banners instead'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'On your own machine, enumerate listeners and probe a local service — completely safe, and the exact muscle you will use on authorized hosts later:'
          },
          {
            type: 'terminal',
            title: 'Listeners and honest probes',
            lines: [
              '$ ss -tulpn | head -8',
              'Netid State  Recv-Q Send-Q Local Address:Port   Peer Address:Port Process',
              'udp   UNCONN 0      0      127.0.0.53%lo:53     0.0.0.0:*      users:(("systemd-resolve",pid=812,fd=14))',
              'tcp   LISTEN 0      4096   127.0.0.54:53        0.0.0.0:*      users:(("systemd-resolve",pid=812,fd=16))',
              'tcp   LISTEN 0      511    0.0.0.0:8000         0.0.0.0:*      users:(("python3",pid=2201,fd=3))',
              '$ nc -zv 127.0.0.1 8000',
              'Connection to 127.0.0.1 8000 port [tcp/*] succeeded!',
              '$ nc -zvu 127.0.0.1 53',
              'Connection to 127.0.0.1 53 port [udp/*] succeeded!'
            ]
          },
          {
            type: 'p',
            text:
              'Read the exposure column: 0.0.0.0:8000 is reachable from other hosts; 127.0.0.53:53 is local-only (the systemd stub resolver). Note the honesty gap: the TCP check succeeded because the handshake worked, while the UDP "succeeded" only means no ICMP error came back — nc cannot confirm a UDP service is actually listening. That ambiguity is a feature of UDP, not a bug in nc.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two lab services: a web app on TCP 8000 and a syslog on UDP 514. Stop the web app and nc -zv fails instantly — the OS sent a RST. Stop the syslog and nc -zvu still reports success — silence on UDP means nothing. The lesson: UDP findings require application-level probes (send a real syslog line, a real DNS query), and that requirement shapes every UDP scanning technique you will meet later.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ss', 'Modern socket listing (tcp/udp, listening, processes)'],
              ['netstat', 'Legacy equivalent still found on many systems'],
              ['nc / ncat', 'Arbitrary TCP/UDP connections, listeners, port checks'],
              ['IANA registry', 'Authoritative port-to-name mapping'],
              ['nmap (later module)', 'Turns this theory into systematic scanning']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating a silent UDP port as closed — silence is open-or-filtered, never a clean answer',
              'Mapping port numbers to services without verification (any process may bind any port)',
              'Forgetting that the transport is part of the socket — TCP 53 and UDP 53 are different listeners',
              'Scanning only TCP and reporting "no services" while UDP services run happily',
              'Confusing the port (a number) with the socket (protocol + IPs + ports on one end)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Enumerate your own listeners with ss -tulpn. Pick one TCP and one UDP listener, write down why the developer probably chose that transport, then probe both with nc and compare how honest the two answers are. Summarize in one sentence what a TCP-only recon of your own machine would have missed.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Ports multiplex conversations; the socket is protocol + local IP:port + remote IP:port',
              'Well-known (0-1023), registered (1024-49151), dynamic (49152-65535) — the registry is advisory, not enforced',
              'TCP: connection, ordering, retransmission — the reliable stream',
              'UDP: stateless datagrams — fast, cheap, ambiguous when silent',
              'Transport choice drives scan behavior: TCP gives crisp answers, UDP needs application-level probes'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n01-l05-q1',
          type: 'mcq',
          prompt: 'Which of these fully identifies one end of a TCP conversation?',
          options: [
            'The IP address and port',
            'The protocol, local IP, local port, remote IP and remote port',
            'The MAC address and IP address',
            'The process name and port number'
          ],
          answerIndex: 1,
          hint: 'Why can thousands of clients share one server port at the same time?',
          explanation:
            'The 4-tuple plus protocol makes every conversation unique even when thousands share destination port 443 — each client contributes a distinct source IP or source port.'
        },
        {
          id: 'n01-l05-q2',
          type: 'truefalse',
          prompt: 'TCP port 443 and UDP port 443 are the same service.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Is the transport part of the listener?',
          explanation:
            'Transport is part of the socket identity: TCP 443 and UDP 443 are independent listeners, and QUIC-based HTTP/3 on UDP 443 alongside TCP 443 is a real-world example of both existing with different behavior.'
        },
        {
          id: 'n01-l05-q3',
          type: 'short',
          prompt: 'Why does DNS use both TCP 53 and UDP 53?',
          modelAnswer:
            'UDP 53 handles normal queries and responses — one fast round trip with no connection setup. TCP 53 handles what does not fit or needs reliability: zone transfers (AXFR), responses that overflow the UDP size limit (truncation with retry over TCP), and modern encrypted transports. A complete DNS test covers both.',
          hint: 'Think about response size and zone transfers.',
          explanation:
            'The split is load-driven, not stylistic. Testers who only probe UDP 53 miss zone-transfer checks; testers who only probe TCP miss the primary query path.'
        },
        {
          id: 'n01-l05-q4',
          type: 'scenario',
          prompt:
            'A scan of an authorized host reports 53/tcp open and 53/udp open|filtered. Explain the difference in certainty between the two results and what you would do next.',
          modelAnswer:
            'TCP open is confirmed: the three-way handshake completed, so a listener answered. UDP open|filtered means the scanner either got an answer or got nothing — it cannot distinguish an open port from a firewall dropping packets. Next step: send a real DNS query at that host (for example dig @host some-known-record) and see whether an application-level answer returns; an actual DNS response upgrades the finding to open, continued silence keeps it ambiguous.',
          hint: 'One transport answered clearly; the other went quiet. What does each mean?',
          explanation:
            'The certainty gap between TCP and UDP results is fundamental. Application-level probes are the honest way to disambiguate UDP, which is why professional UDP enumeration always pairs port scans with service-specific questions.'
        }
      ],
      references: [
        {
          title: 'RFC 768 — User Datagram Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc768.html',
          note: 'The complete UDP specification — one page, worth reading once.'
        },
        {
          title: 'RFC 9293 — Transmission Control Protocol (TCP)',
          url: 'https://www.rfc-editor.org/rfc/rfc9293.html',
          note: 'The modern consolidated TCP specification (obsoletes RFC 793).'
        },
        {
          title: 'IANA — Service Name and Transport Protocol Port Number Registry',
          url: 'https://www.iana.org/assignments/service-names-port-numbers',
          note: 'The authoritative port registry — the source of truth behind /etc/services.'
        }
      ]
    }
  ]
};
