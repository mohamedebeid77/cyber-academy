import type { GlossaryTerm } from '../../../types';

// Network Security & Pentesting Academy — glossary (42 terms).
// Category values: Fundamentals | Protocols | Security | Pentesting |
// Architecture | Standards. Related names must match term names in this file.

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: 'ARP',
    category: 'Protocols',
    simple: 'The protocol that finds which hardware card owns an IP address on a local network. It is the layer-2 phone book every host keeps.',
    technical: 'Address Resolution Protocol maps IPv4 addresses to MAC addresses on a broadcast segment. A host broadcasts a who-has request and the owner replies is-at with its MAC; answers populate a cache that attackers can poison to redirect traffic.',
    related: ['MAC', 'IP', 'MITM']
  },
  {
    term: 'ASN',
    category: 'Fundamentals',
    simple: 'A unique number identifying a network operator on the Internet, like a company registration for routing.',
    technical: 'An Autonomous System Number identifies a routing domain under one administrative control that runs its own BGP policy. ASNs matter to pentesters during external recon: ranges registered to an ASN reveal the organization\u2019s public address space.',
    related: ['Routing', 'IP', 'Subnet']
  },
  {
    term: 'CIDR',
    category: 'Fundamentals',
    simple: 'The slash notation for IP ranges, like 192.168.1.0/24. The number says how many fixed bits identify the network.',
    technical: 'Classless Inter-Domain Routing replaced classful addressing with variable-length prefixes: /24 holds 256 addresses (254 usable hosts), /26 holds 64 (62 usable). Usable host count is 2^(32 - prefix) - 2, excluding network and broadcast addresses.',
    related: ['Subnet', 'IP', 'Routing']
  },
  {
    term: 'DNS',
    category: 'Protocols',
    simple: 'The Internet\u2019s name-to-address lookup. It turns names like example.com into IP addresses.',
    technical: 'The Domain Name System is a hierarchical, delegated database over UDP/TCP port 53 with record types (A, AAAA, MX, NS, TXT, PTR). For pentesters it is a rich recon source — zone transfers, TXT metadata and query patterns — and a covert channel when data rides in query labels.',
    related: ['Protocol', 'IP', 'Routing']
  },
  {
    term: 'DHCP',
    category: 'Protocols',
    simple: 'The service that hands devices an IP address and network settings automatically when they join.',
    technical: 'Dynamic Host Configuration Protocol assigns leases via a discover/offer/request/acknowledge broadcast exchange on UDP 67/68. Options carry gateway, DNS and more; rogue DHCP servers are a classic MITM vector because the offered settings define the victim\u2019s traffic path.',
    related: ['IP', 'Gateway', 'MITM']
  },
  {
    term: 'DMZ',
    category: 'Architecture',
    simple: 'A buffer network where public-facing servers live, separated from the internal network so a breach there does not spread easily.',
    technical: 'A demilitarized zone is a segmented network (often a firewall interface or VLAN) hosting externally reachable services, with rules that let outside users reach the DMZ but prevent DMZ hosts from freely reaching the internal network. It is defense in depth for the failure of an internet-facing service.',
    related: ['Network Segmentation', 'Firewall', 'Proxy']
  },
  {
    term: 'Firewall',
    category: 'Security',
    simple: 'A filter that decides which network traffic is allowed through, based on rules about addresses, ports and protocols.',
    technical: 'A firewall enforces an access policy at packet, state or application level, typically at network boundaries and as host-based rules. Pentesters map its rules by probing: filtered ports, asymmetric behavior and protocol quirks reveal the policy behind it.',
    related: ['Port', 'Network Segmentation', 'DMZ']
  },
  {
    term: 'Gateway',
    category: 'Fundamentals',
    simple: 'The router a host sends traffic to when the destination is outside its own subnet.',
    technical: 'The default gateway is the next hop installed in a host\u2019s routing table for destinations without a more specific route. Whoever controls the gateway position (physically, via ARP spoofing or via rogue DHCP) controls where traffic goes — a core MITM principle.',
    related: ['Routing', 'Subnet', 'MITM']
  },
  {
    term: 'ICMP',
    category: 'Protocols',
    simple: 'The protocol IP uses for control and error messages — ping is its most famous use.',
    technical: 'Internet Control Message Protocol reports reachability and errors (echo request/reply, time exceeded, destination unreachable) and is the basis of traceroute. Networks often restrict it, so its absence proves little; its types and codes still drive discovery and path analysis.',
    related: ['IP', 'Protocol', 'Routing']
  },
  {
    term: 'IDS',
    category: 'Security',
    simple: 'A sensor that watches traffic and raises alarms when it sees something suspicious. It observes but does not block.',
    technical: 'An Intrusion Detection System inspects packets or flows against signatures and anomalies, reporting events to analysts (NIDS on the wire, HIDS on hosts). Detection-aware pentesting means knowing what a scan looks like to these sensors and validating findings without turning the engagement into an incident.',
    related: ['IPS', 'Firewall', 'Protocol']
  },
  {
    term: 'IPS',
    category: 'Security',
    simple: 'Like an IDS, but placed in the traffic path so it can block what it does not like.',
    technical: 'An Intrusion Prevention System sits inline and enforces — dropping packets, resetting sessions, blocking sources — when signatures or heuristics trip. Its presence changes scanning behavior: rate limits, dropped probes and resets are evidence worth documenting.',
    related: ['IDS', 'Firewall', 'Proxy']
  },
  {
    term: 'IP',
    category: 'Fundamentals',
    simple: 'The addressing system that gets packets from one network device to another, hop by hop. Every host is identified by an IP address.',
    technical: 'Internet Protocol provides logical, hierarchical addressing (IPv4 32-bit, IPv6 128-bit) and best-effort, connectionless delivery; reliability and order are left to TCP. IP addressing and routing decisions define what is reachable — the first question of any pentest.',
    related: ['TCP', 'Routing', 'Subnet']
  },
  {
    term: 'LAN',
    category: 'Fundamentals',
    simple: 'A local network connecting nearby devices — your home Wi-Fi or an office floor.',
    technical: 'A Local Area Network is a bounded segment (switched Ethernet, Wi-Fi) where hosts reach each other at layer 2, typically one or more subnets. Layer-2 attacks (ARP spoofing, MAC flooding) apply only within the LAN — which is why segmentation matters.',
    related: ['MAC', 'Subnet', 'Network Segmentation']
  },
  {
    term: 'MAC',
    category: 'Fundamentals',
    simple: 'The hardware address burned into a network card, used for delivery inside a local network.',
    technical: 'A Media Access Control address is the 48-bit layer-2 identifier (first half a vendor OUI) used for frame delivery on a segment. It travels only locally, can be spoofed, and is the pivot of ARP behavior — hence MAC-based port security and its bypasses.',
    related: ['ARP', 'LAN', 'Packet']
  },
  {
    term: 'MITM',
    category: 'Pentesting',
    simple: 'An attack where the attacker quietly sits between two parties and reads or changes their traffic.',
    technical: 'Man-in-the-Middle attacks position the attacker on the path between victims — via ARP spoofing, rogue DHCP, name-resolution poisoning or rogue Wi-Fi — enabling capture and manipulation. TLS defeats passive MITM, which is why downgrade and misconfigured-certificate attacks target the exceptions.',
    related: ['ARP', 'DHCP', 'DNS']
  },
  {
    term: 'NAT',
    category: 'Architecture',
    simple: 'A technique where many devices share one public IP by rewriting addresses on the way out.',
    technical: 'Network Address Translation rewrites IP/port tuples at a boundary (most commonly many-to-one PAT), hiding internal addressing and multiplexing connections. NAT breaks symmetric reachability — relevant to both pentest pivots and why reverse tunnels are useful.',
    related: ['IP', 'Gateway', 'Tunnel']
  },
  {
    term: 'Packet',
    category: 'Fundamentals',
    simple: 'A chunk of data sent across a network, with a header saying where it comes from and where it goes.',
    technical: 'A packet is the network-layer protocol data unit (IP header plus payload), carried inside layer-2 frames and assembled from segments. Packet analysis — reading headers, reassembling streams — is the ground truth of what actually happened on a wire.',
    related: ['Protocol', 'Socket', 'PCAP']
  },
  {
    term: 'Port',
    category: 'Fundamentals',
    simple: 'A numbered doorway on a machine that a service listens on — 22 for SSH, 443 for HTTPS.',
    technical: 'Ports are 16-bit transport-layer identifiers (0-65535) that multiplex services over IP; well-known ranges are conventions, not guarantees. Port state — open, closed, filtered — is exactly what scanning establishes, and every finding starts from it.',
    related: ['Socket', 'TCP', 'UDP']
  },
  {
    term: 'Protocol',
    category: 'Fundamentals',
    simple: 'An agreed set of rules for how two programs or devices talk to each other.',
    technical: 'A protocol defines message formats, ordering and state machines at each layer — Ethernet, IP, TCP, HTTP, DNS. Pentesting protocols means knowing their normal exchange well enough to recognize and safely provoke the abnormal.',
    related: ['Packet', 'TCP', 'ICMP']
  },
  {
    term: 'Proxy',
    category: 'Architecture',
    simple: 'A middleman server that forwards requests on behalf of clients, often adding filtering, caching or anonymity.',
    technical: 'A proxy terminates and re-originates connections (forward proxies for clients, reverse proxies for servers) and can inspect or transform traffic at application level. In pentesting, SOCKS proxies and tooling like proxychains turn one foothold into network-wide reach.',
    related: ['Tunnel', 'Pivot', 'Firewall']
  },
  {
    term: 'Routing',
    category: 'Fundamentals',
    simple: 'The process of deciding which way a packet goes next toward its destination.',
    technical: 'Routing forwards packets hop by hop using routing tables (static entries or dynamic protocols like OSPF and BGP between ASNs). Segmentation and routing decide what is reachable from where — misconfigured routes are how internal networks leak into reach.',
    related: ['IP', 'Gateway', 'ASN']
  },
  {
    term: 'Socket',
    category: 'Fundamentals',
    simple: 'One endpoint of a connection — an IP address and port pair on a machine that a program is using.',
    technical: 'A socket is the OS abstraction binding a process to a local address/port and a protocol, identified end to end by the 4-tuple (src IP, src port, dst IP, dst port). Listening sockets are the attack surface; established sockets are the conversations analysis tools reassemble.',
    related: ['Port', 'TCP', 'Packet']
  },
  {
    term: 'Subnet',
    category: 'Fundamentals',
    simple: 'A slice of an IP range treated as one local network, with its own network and broadcast addresses.',
    technical: 'A subnet is defined by an IP prefix (CIDR) where hosts share a link and reach each other without routing; broadcast traffic stays inside. Subnet boundaries are segmentation boundaries — the mental map of what is directly reachable.',
    related: ['CIDR', 'LAN', 'Routing']
  },
  {
    term: 'TCP',
    category: 'Protocols',
    simple: 'The reliable transport protocol — it guarantees your data arrives complete and in order, like registered mail.',
    technical: 'Transmission Control Protocol is connection-oriented with a three-way handshake (SYN, SYN-ACK, ACK), sequence numbers, retransmission and flow control. Scan behavior maps directly onto the handshake: half-open scans stop after the first reply, and flag combinations are the language of packet analysis.',
    related: ['UDP', 'Port', 'Packet']
  },
  {
    term: 'UDP',
    category: 'Protocols',
    simple: 'The lightweight transport protocol — fire and forget, no delivery guarantee.',
    technical: 'User Datagram Protocol is connectionless with no handshake, ordering or retransmission, used by DNS, DHCP, SNMP and others. Scanning UDP is slow and ambiguous (silence is not a no), which is why tools rely on protocol-correct probes and top-port sets.',
    related: ['TCP', 'DNS', 'DHCP']
  },
  {
    term: 'VLAN',
    category: 'Architecture',
    simple: 'A way to split one physical switch into several separate logical networks.',
    technical: 'A Virtual LAN tags frames (802.1Q) so one switching infrastructure carries multiple isolated broadcast domains. VLAN hopping and native-VLAN mistakes are the classic layer-2 pentest angles (module n09), and VLAN design is the backbone of segmentation.',
    related: ['Network Segmentation', 'LAN', 'Routing']
  },
  {
    term: 'VPN',
    category: 'Architecture',
    simple: 'An encrypted tunnel that makes a remote network behave like it is local.',
    technical: 'A Virtual Private Network encapsulates and encrypts traffic between endpoints over an untrusted network (IPsec, WireGuard, OpenVPN, TLS-based). It extends trust across boundaries — which also makes a compromised VPN account a pivot straight into the internal network.',
    related: ['Tunnel', 'NAT', 'Network Segmentation']
  },
  {
    term: 'Pivot',
    category: 'Pentesting',
    simple: 'Using a compromised machine inside a network as your base camp to reach deeper targets.',
    technical: 'Pivoting routes testing traffic through a compromised host (dual-homed by position or by compromise) using SSH forwards, SOCKS relays or TUN-based tools. It converts a foothold into internal reach and is the core skill of internal-network engagements.',
    related: ['Tunnel', 'Lateral Movement', 'Proxy']
  },
  {
    term: 'Tunnel',
    category: 'Pentesting',
    simple: 'An encapsulated channel that carries one kind of traffic inside another — data through a pipe.',
    technical: 'Tunneling wraps packets inside a transport protocol (SSH -L/-R/-D, TLS-based chisel, TUN-based ligolo-ng) to cross boundaries that block native paths. Tunnels are both the pentester\u2019s relay technique and a defender\u2019s detection target: long-lived encrypted sessions with unusual flow patterns.',
    related: ['Pivot', 'VPN', 'Proxy']
  },
  {
    term: 'Lateral Movement',
    category: 'Pentesting',
    simple: 'Stepping from one compromised machine to others inside a network, widening access.',
    technical: 'Lateral movement chains credentials, protocols (SMB, WinRM, RDP, SSH) and trust relationships to expand from an initial foothold toward high-value targets. Defenders detect it through cross-segment anomalies; pentesters map and demonstrate it with least-privilege care.',
    related: ['Pivot', 'SMB', 'WinRM']
  },
  {
    term: 'Service Enumeration',
    category: 'Pentesting',
    simple: 'Working out exactly which software is behind each open port — product, version, configuration.',
    technical: 'Service enumeration combines version detection, banner grabs, protocol-correct probes and scripts to turn "port 445 open" into "Samba 3.0.20, null sessions allowed". It is the bridge between scanning and vulnerability analysis.',
    related: ['Port', 'Protocol', 'SMB']
  },
  {
    term: 'Network Segmentation',
    category: 'Architecture',
    simple: 'Splitting a network into isolated zones so a problem in one does not become a problem everywhere.',
    technical: 'Segmentation partitions networks by function and trust (VLANs, subnets, firewall policy, zero-trust designs), limiting lateral paths. Pentesters measure it: from each foothold, what is actually reachable? Gaps in segmentation are among the highest-impact findings.',
    related: ['VLAN', 'DMZ', 'Firewall']
  },
  {
    term: 'Attack Surface',
    category: 'Security',
    simple: 'Everything an attacker could touch: open ports, exposed services, published records.',
    technical: 'The attack surface is the enumerable set of entry points — listening services, exposed management interfaces, DNS data, trust paths. Discovery exercises exist to measure it against what the owner believes it is; the delta is usually the finding.',
    related: ['Service Enumeration', 'Firewall', 'Port']
  },
  {
    term: 'CVE',
    category: 'Standards',
    simple: 'A public ID number for a known vulnerability, so everyone can talk about the same bug.',
    technical: 'Common Vulnerabilities and Exposures assigns identifiers (CVE-YYYY-NNNN) to publicly disclosed vulnerabilities, referenced by advisories, scanners and exploit archives. Pentesters link observed versions to CVEs and then validate whether the weakness is actually present.',
    related: ['CVSS', 'Service Enumeration', 'Attack Surface']
  },
  {
    term: 'CVSS',
    category: 'Standards',
    simple: 'A standard scoring system that rates how severe a vulnerability is, from 0 to 10.',
    technical: 'Common Vulnerability Scoring System (v3.1/v4.0) derives severity from metric groups — attack vector, complexity, privileges, user interaction, scope, impact. Its value in reports is the explicit, debatable vector: every metric must be justified by evidence, not vibes.',
    related: ['CVE', 'Service Enumeration']
  },
  {
    term: 'PCAP',
    category: 'Standards',
    simple: 'A recorded file of network traffic that tools like Wireshark can open and analyze.',
    technical: 'The pcap (and newer pcapng) capture file format stores packets with timestamps and link-layer metadata, produced by tcpdump, Wireshark and others. PCAPs are the evidence artifact of packet analysis labs — reproducible, shareable and dissectable offline.',
    related: ['Packet', 'Protocol', 'Socket']
  },
  {
    term: 'SMB',
    category: 'Protocols',
    simple: 'The Windows file-sharing protocol — shared folders and printers on a network.',
    technical: 'Server Message Block (TCP 445, legacy 139) provides file/print sharing and RPC transports on Windows and Samba. Enumeration angles include null sessions, share listings and protocol negotiation; SMB is a primary lateral-movement artery in Windows networks.',
    related: ['LDAP', 'WinRM', 'Lateral Movement']
  },
  {
    term: 'LDAP',
    category: 'Protocols',
    simple: 'The directory-lookup protocol — how networks answer "who is this user and what are they allowed to do?"',
    technical: 'Lightweight Directory Access Protocol (389, StartTLS; LDAPS 636) queries and updates hierarchical directories such as Active Directory and OpenLDAP. Anonymous binds, root-DSE disclosure and over-privileged directories are the classic enumeration findings.',
    related: ['SMB', 'RDP', 'WinRM']
  },
  {
    term: 'RDP',
    category: 'Protocols',
    simple: 'Windows remote desktop — seeing and controlling another machine\u2019s screen over the network.',
    technical: 'Remote Desktop Protocol (TCP/UDP 3389) provides graphical remote administration with TLS and NLA. Exposed RDP is a high-value target: credential attacks, protocol weaknesses and its role in lateral movement make exposure mapping a standard finding.',
    related: ['WinRM', 'SMB', 'Lateral Movement']
  },
  {
    term: 'SSH',
    category: 'Protocols',
    simple: 'The secure remote-shell protocol for Unix-like systems — and, conveniently, a first-class tunneling tool.',
    technical: 'Secure Shell (TCP 22) provides encrypted terminal access, key-based authentication and port forwarding (-L local, -R reverse, -D dynamic SOCKS). Its dual identity as admin tool and pivot mechanism makes forwarding policy on bastions a critical hardening decision.',
    related: ['Tunnel', 'Pivot', 'WinRM']
  },
  {
    term: 'WinRM',
    category: 'Protocols',
    simple: 'Windows\u2019 remote management protocol — running commands on Windows machines over the network.',
    technical: 'Windows Remote Management (HTTP/HTTPS, default 5985/5986) executes commands and PowerShell remotely via SOAP/WS-Management. For pentesters it is a lateral-movement channel (authenticated command execution); for defenders, enabling it broadly is a privilege.',
    related: ['SMB', 'RDP', 'Lateral Movement']
  },
  {
    term: 'NFS',
    category: 'Protocols',
    simple: 'The Unix file-sharing protocol — mounted folders from another machine over the network.',
    technical: 'Network File System (typically port 2049, RPC-based in older versions) exports directories that clients mount. Classic findings include world-readable exports, no_root_squash options and exports open to entire subnets.',
    related: ['SMB', 'Service Enumeration', 'LAN']
  }
];
