import type { Module } from '../../../../types';

// LEVEL 1 — CORE PROTOCOLS · Module N02: OSI, TCP/IP and Network Protocols
// Original curriculum content synthesized from public official documentation:
// RFCs on rfc-editor.org. All prose is original; reference links point to the
// official sources used for study.

export const n02: Module = {
  id: 'n02',
  title: 'OSI, TCP/IP and Network Protocols',
  level: 1,
  description:
    'The layered models that organize networking, how data is encapsulated into frames, packets and segments, and the core protocols a pentester meets on every engagement: Ethernet, ARP, IP, ICMP, TCP, UDP, DNS, DHCP, HTTP(S), TLS, SSH, FTP, SMTP, SMB, LDAP and RDP.',
  outcomes: [
    'Map any protocol, tool or attack to the correct OSI and TCP/IP layers',
    'Explain encapsulation and decapsulation and name the PDU at each layer',
    'Describe Ethernet, ARP, IP and ICMP operation, including TTL behavior, ICMP codes and fragmentation',
    'Trace a TCP handshake, a DNS lookup and a DHCP lease end to end',
    'State the purpose, default ports and pentest relevance of the major application protocols'
  ],
  lessons: [
    {
      id: 'n02-l01',
      moduleId: 'n02',
      title: 'The OSI and TCP/IP Models',
      difficulty: 'Beginner',
      minutes: 16,
      prerequisites: ['n01-l05'],
      objectives: [
        'Name the seven OSI layers and the four TCP/IP layers with their responsibilities',
        'Map between the two models and place real protocols on the map',
        'Use layers as a diagnostic compass and a shared professional vocabulary'
      ],
      diagram: 'net-osi-tcpip',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Layered models exist to organize complexity: each layer provides a service to the layer above it and consumes the layer below it, changing nothing about how the lower layers work inside. The OSI model has seven layers and is a teaching and vocabulary model. The TCP/IP model has four and is what the Internet actually implements. No router on earth runs "OSI" — yet every engineer and every pentester speaks OSI, because sentences like "that is an L2 problem" or "the firewall inspects at L7" compress enormous meaning.'
          },
          {
            type: 'p',
            text:
              'For a tester, layers are a diagnostic compass. Connectivity problems and attacks live at specific layers, and each layer leaves its own evidence. When something breaks, you test bottom-up: link, then IP reachability, then transport, then application. When you attack, you choose your layer and that choice dictates your vantage point and your tools. That discipline — name the layer, then act — is the habit this lesson installs.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-osi-tcpip',
            caption: 'The OSI seven layers mapped onto the four-layer TCP/IP model, with example protocols and PDU names.'
          },
          {
            type: 'table',
            headers: ['OSI layer', 'PDU', 'Examples', 'TCP/IP layer'],
            rows: [
              ['7 Application', 'Data', 'HTTP, DNS, SSH, SMB', 'Application'],
              ['6 Presentation', 'Data', 'TLS, encodings', 'Application'],
              ['5 Session', 'Data', 'Session management, RPC', 'Application'],
              ['4 Transport', 'Segment / datagram', 'TCP, UDP', 'Transport'],
              ['3 Network', 'Packet', 'IP, ICMP', 'Internet'],
              ['2 Data link', 'Frame', 'Ethernet, ARP, Wi-Fi', 'Link'],
              ['1 Physical', 'Bits', 'Cables, radio, connectors', 'Link (hardware)']
            ]
          },
          {
            type: 'p',
            text:
              'The TCP/IP model (formalized for hosts in RFC 1122) collapses the top three OSI layers into one Application layer and merges physical and data link into Link. Note the honest ambiguity: TLS sits between transport and application, and ARP is a link-layer helper that carries IP information — people argue about exact placements; competent testers just say which layers a thing touches.'
          },
          {
            type: 'p',
            text:
              'Why the vocabulary matters operationally: equipment is classified by layer (an L2 switch forwards frames, an L3 router forwards packets, an L7 load balancer understands HTTP), controls are placed at layers (NAC and port security at L2, packet filters at L3/L4, WAFs at L7), and troubleshooting runs bottom-up. When a client says "our WAF blocks that", you know they mean application-layer inspection — and that anything encrypted end-to-end is invisible to it.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Classify every tool and finding by layer and your methodology becomes systematic. nmap spans L3 (host discovery) to L7 (service and script probing); tcpdump sees frames through application data; ping is pure L3. Layer also dictates vantage: ARP spoofing requires the same segment (L2), port scanning requires reachability (L3/L4), exploiting an HTTP flaw requires the service to be reachable and legible (L7). When you write findings, the layer tells the client where the fix belongs.'
          },
          {
            type: 'list',
            items: [
              'L2 attacks need local presence; L7 attacks need only service access — position and scope follow from layer',
              'Layered defenses fail in layer-shaped holes: strong L7 inspection over a flat, unprotected L2 is a classic real-world pattern',
              'Client conversations use layer shorthand — speaking it fluently builds credibility in scoping calls'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Equipment described by layer in client documentation (L2 access switches, L3 core, L7 proxies)',
              'Controls and the layer where they actually sit — a "firewall" that only filters L3/L4 is not a WAF',
              'Logs that capture only one layer, hiding problems above or below it',
              'Vague claims like "the network is fine" — ask which layers were tested and how'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The test is a mapping drill with real observations. Take two views of the same remote host — one at the transport layer, one at the internet layer — and let the disagreement localize the problem:'
          },
          {
            type: 'terminal',
            title: 'Two layers, two answers',
            lines: [
              '$ ss -tan state established | head -3',
              'Recv-Q Send-Q Local Address:Port   Peer Address:Port',
              '0      0      192.168.1.50:45122  142.250.74.36:443',
              '$ ping -c1 -W1 142.250.74.36 | tail -2',
              '--- 142.250.74.36 ping statistics ---',
              '1 packets transmitted, 1 received, 0% packet loss, time 0ms'
            ]
          },
          {
            type: 'p',
            text:
              'The ss line is layer-4 truth: a TCP connection to that peer exists and works. The ping line is layer-3 truth: the path passes ICMP. If tomorrow the ping still works but new connections to 443 hang, the failure is layer 4 or above — a firewall on 443, a TLS problem, or an application fault. You just performed layered troubleshooting in two commands.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The classic "the website is down" triage, layer by layer: L1/L2 — is the interface up and associated (ip link)? L3 — ping the gateway, then ping 8.8.8.8. L4 — nc -zv the-site 443. L7 — curl -I https://the-site and read the status and TLS behavior. Each step rules out exactly one layer, and the first failing step names the layer where the problem lives. Write this sequence on a sticky note; it is the skeleton of every network incident response and every scoping sanity check.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'ip link / ping / nc / curl — the per-layer probe set for L2, L3, L4 and L7',
              'Wireshark — displays all layers of a conversation at once, the best teacher of the map',
              'The models themselves — keep a one-page OSI/TCP-IP cheat sheet until the mapping is automatic'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reciting the layers without being able to place a single real tool on them',
              'Treating OSI as a literal implementation — it is a vocabulary and analysis model',
              'Placing TLS rigidly in one layer; say "between transport and application" and move on',
              'Skipping bottom-up testing because a stakeholder insisted the problem was "in the app"',
              'Assuming one-layer expertise suffices — modern attacks chain L2 position into L7 exploitation'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take twelve things you already use — ping, dig, ssh, curl, Wireshark, your VPN client, a proxy, nmap, a switch, a router, TLS, SMB — and write each on the layer or layers it touches. Star the ambiguous ones and write one sentence defending your placement. Compare notes with the table in this lesson.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'OSI is the shared vocabulary (seven layers); TCP/IP is the implemented reality (four layers)',
              'Each layer serves the one above and is a client of the one below',
              'Name the layer, then diagnose bottom-up: link, IP, transport, application',
              'Layer determines vantage: L2 needs the segment, L7 needs only the service',
              'Controls live at layers — map where the defenses actually are'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n02-l01-q1',
          type: 'mcq',
          prompt: 'In TCP/IP model terms, where do HTTP and SSH live?',
          options: ['Link layer', 'Internet layer', 'Transport layer', 'Application layer'],
          answerIndex: 3,
          hint: 'Both define meaning on top of a byte stream.',
          explanation:
            'HTTP and SSH are application-layer protocols: they define syntax and semantics over TCP. TLS sits between transport and application, which is why "application layer" still needs care in mapping conversations.'
        },
        {
          id: 'n02-l01-q2',
          type: 'truefalse',
          prompt: 'The Internet strictly implements the OSI seven-layer stack.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which suite actually runs the Internet?',
          explanation:
            'The Internet implements the TCP/IP suite. OSI survives as the professional vocabulary and analysis model — useful, real as a reference, but not the deployed architecture.'
        },
        {
          id: 'n02-l01-q3',
          type: 'short',
          prompt: 'Name the OSI layer for each: Ethernet frames, IP routing, TCP ports, HTTP methods.',
          modelAnswer:
            'Ethernet frames — layer 2 (data link); IP routing — layer 3 (network); TCP ports — layer 4 (transport); HTTP methods — layer 7 (application).',
          hint: 'Frame, packet, segment, data.',
          explanation:
            'The PDU names are the quick tell: frame is L2, packet is L3, segment is L4, application data is L7. Mapping artifacts to layers this way becomes automatic with practice.'
        },
        {
          id: 'n02-l01-q4',
          type: 'scenario',
          prompt:
            'A client insists "the network is broken". From an authorized test machine you can ping the target server, another host on the same subnet also responds, but nc -zv target 443 times out. Argue where the failure most likely is, in layer terms, and your next step.',
          modelAnswer:
            'Layer 3 is demonstrably fine: ICMP to the target works and a peer on the same subnet responds, so link and path are healthy. TCP 443 timing out points at layer 4+ — an ACL or host firewall dropping 443, or no listener on the port. Next step: verify the listener exists on the target (if authorized: ss -tlnp there, or a port scan of a few likely ports), and ask the client which firewall governs that segment. The finding to report is a 443 filtering/reachability issue, not "the network".',
          hint: 'Which layers did your two probes already prove healthy?',
          explanation:
            'Layered reasoning converts a vague complaint into a specific, testable claim. ICMP success plus TCP failure isolates the problem to transport filtering or service absence — a much more actionable statement for both sides.'
        }
      ],
      references: [
        {
          title: 'RFC 1122 — Requirements for Internet Hosts, Communication Layers',
          url: 'https://www.rfc-editor.org/rfc/rfc1122.html',
          note: 'Defines the TCP/IP layer model for hosts: link, internet, transport, application.'
        },
        {
          title: 'RFC 1180 — A TCP/IP Tutorial',
          url: 'https://www.rfc-editor.org/rfc/rfc1180.html',
          note: 'Layer-by-layer walkthrough of the suite with worked examples.'
        }
      ]
    },
    {
      id: 'n02-l02',
      moduleId: 'n02',
      title: 'Encapsulation: Frames, Packets and Segments',
      difficulty: 'Beginner',
      minutes: 14,
      prerequisites: ['n02-l01'],
      objectives: [
        'Name the PDU at each layer and describe header wrapping and stripping',
        'Explain MTU, MSS and what happens when a packet exceeds the link limit',
        'Read a Wireshark or tcpdump display as a stack of encapsulation layers'
      ],
      diagram: 'net-encapsulation',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Data travels wrapped like nested envelopes. The application writes bytes; TCP wraps them with a header (ports, sequence numbers) creating a segment; IP wraps the segment with addressing and TTL creating a packet; Ethernet wraps the packet with MAC addresses and a checksum creating a frame; the NIC transmits the frame as bits. On receipt the process reverses — each layer strips its envelope and hands the payload up. Every capture tool you will ever use displays this stack, so learning encapsulation is literally learning to read your tools.'
          },
          {
            type: 'p',
            text:
              'The envelope size is bounded: every link technology has an MTU (maximum transmission unit) — 1500 bytes for classic Ethernet. When a packet exceeds the next link\u2019s MTU it must fragment or be rejected, and a shocking number of mysterious "small requests work, big uploads hang" failures are MTU stories in disguise.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-encapsulation',
            caption: 'Encapsulation on send, decapsulation on receive: each layer adds or removes exactly its own header.'
          },
          {
            type: 'p',
            text:
              'The send path in detail: the application produces a byte stream; TCP segments it, adding a header with source/destination ports, sequence and acknowledgment numbers and flags; IP adds its header — source/destination addresses, TTL, protocol number — making a packet; Ethernet adds destination and source MACs and an EtherType, plus a frame check sequence trailer, making a frame. The receive path reverses everything, each layer consuming only its own header. This is why a router can change MAC addresses and TTL while leaving TCP untouched, and why NAT can rewrite IP addresses without applications caring.'
          },
          {
            type: 'p',
            text:
              'PDU names, precisely: at L4 a TCP unit is a segment and a UDP unit a datagram; at L3 it is a packet; at L2 it is a frame; at L1, bits. Wireshark shows the stack bottom-up — Frame, Ethernet II, IPv4/IPv6, TCP/UDP, then the decoded application protocol — and learning to walk that tree top to bottom is the single most transferable capture-analysis skill.'
          },
          {
            type: 'h',
            text: 'MTU, MSS and fragmentation'
          },
          {
            type: 'p',
            text:
              'Standard Ethernet MTU is 1500 bytes measured at the IP layer. TCP\u2019s maximum segment size (MSS) is the payload it can carry per segment: 1500 minus 20 IP bytes minus 20 TCP bytes = 1460 for IPv4 without options. If a packet must cross a link with a smaller MTU, IP fragments it — setting the "more fragments" flag and offsets, with reassembly only at the final destination. When the DF (do not fragment) bit is set, the router instead returns ICMP type 3 code 4 ("fragmentation needed") telling the sender the next-hop MTU — that feedback loop is Path MTU Discovery, and it breaks silently if a firewall drops that ICMP. Tunnels (VPN, VXLAN, PPPoE) add their own headers, shrinking the effective MTU underneath — which is why VPN users meet this class of failure so often.'
          },
          {
            type: 'p',
            text:
              'Two frame details worth knowing: 802.1Q VLAN tags insert 4 bytes into the Ethernet header (you will see them in captures on trunk links, and segmentation testing in later modules leans on them), and the FCS trailer is checked and discarded by the NIC, which is why Wireshark never shows it.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Encapsulation tells you where inspection and control can happen: switches see frames, routers see packets, stateful firewalls see segments, proxies and WAFs see application data. Encryption removes upper-layer visibility from middleboxes — understanding this explains both why VPNs work and why IDS placement debates never end. It also explains tool behavior: when you later craft packets with Scapy you are writing these headers by hand, and when a scan result confuses you the answer is often an encapsulation surprise (tunnels, VLANs, fragments).'
          },
          {
            type: 'list',
            items: [
              'PMTUD blackholes (dropped ICMP 3/4) are cross-layer findings: network symptom, application pain',
              'Tunnel overhead shrinks effective MTU — MSS clamping exists to fix exactly this',
              'Fragmentation quirks have a long evasion history; modern IDSs reassemble, but mismatched reassembly was a classic bypass',
              'VLAN tags in unexpected captures are segmentation clues worth following'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'ICMP type 3 code 4 in captures — PMTUD is being defeated somewhere',
              'Jumbo-frame (9000 MTU) networks meeting 1500-byte paths — mismatch stories',
              '802.1Q tags appearing where the client swore there were no VLANs',
              'Double encapsulation (VPN inside VPN) in path traces — and its overhead',
              'Applications that break only over tunnels: the signature of an MTU problem'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Capture your own traffic',
            text:
              'Sniffing networks you do not own or are not authorized to monitor is illegal in most jurisdictions. Every capture exercise in this academy happens on your own lab machines and networks.'
          },
          {
            type: 'p',
            text:
              'Watch encapsulation directly with tcpdump — the -e flag reveals the link layer that Wireshark usually hides first:'
          },
          {
            type: 'terminal',
            title: 'One ping, three layers on one line',
            lines: [
              '$ tcpdump -i eth0 -n -e -c 2 icmp',
              'tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes',
              '10:21:33.123456 84:16:f9:24:3a:01 > d8:3a:dd:01:9c:44, ethertype IPv4 (0x0800), length 98: 192.168.1.50 > 192.168.1.1: ICMP echo request, id 7, seq 1, length 64',
              '10:21:33.124012 d8:3a:dd:01:9c:44 > 84:16:f9:24:3a:01, ethertype IPv4 (0x0800), length 98: 192.168.1.1 > 192.168.1.50: ICMP echo reply, id 7, seq 1, length 64',
              '2 packets captured'
            ]
          },
          {
            type: 'p',
            text:
              'Read one line outside-in: MACs (Ethernet, L2), then the IP endpoints (L3), then ICMP (the payload). Length 98 = 14 bytes of Ethernet header plus 84 bytes of IP-plus-ICMP. In Wireshark, capture the same ping and click through Frame, Ethernet II, Internet Protocol, ICMP — you are walking the encapsulation stack with your own eyes.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The classic cross-layer case: a web application works fine for small pages but large uploads hang forever. The capture shows the client sending packets with the DF bit set, then an ICMP type 3 code 4 from a middle router announcing a smaller next-hop MTU — and no subsequent retransmission with smaller segments, because that ICMP is being dropped by a firewall. The fix is MSS clamping or allowing ICMP 3/4. You diagnosed a "slow application" as a broken discovery loop, purely by reading envelopes.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'tcpdump -e -v — shows link-layer and IP headers in the terminal',
              'Wireshark — the definitive visual teacher of encapsulation',
              'ping -M do -s N — sends fixed-size unfragmentable probes to find the path MTU',
              'tracepath — reports the discovered PMTU along the path'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Calling every captured unit a "packet" — frame, packet and segment name different layers, and the distinction matters in findings',
              'Assuming MTU is always 1500 — tunnels, PPPoE and jumbo frames break that assumption',
              'Confusing MTU (link limit, includes IP header) with MSS (TCP payload only)',
              'Forgetting the FCS trailer exists because Wireshark hides it',
              'Setting a smaller MTU on one end only — asymmetric MTUs produce one-way failures that look like flaky hardware'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Probe your own path: ping -M do -s 1472 192.168.1.1 (a 1500-byte IP packet, should succeed on a standard Ethernet LAN), then ping -M do -s 1473 192.168.1.1 and read the "message too long" reply. Then run tracepath 8.8.8.8 and find the reported PMTU. Write down what each command proved about the envelopes on your path.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Segment/datagram (L4), packet (L3), frame (L2), bits (L1) — the PDU names are the map',
              'Each layer adds or removes exactly its own header; capture tools display the whole stack',
              'MTU bounds the frame; MSS is the TCP payload that fits; PMTUD relies on ICMP 3/4',
              'Tunnels shrink effective MTU — many "random" application hangs are MTU stories',
              'Where a device can inspect data depends entirely on which envelope it can open'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n02-l02-q1',
          type: 'mcq',
          prompt: 'What is the PDU at the network layer called?',
          options: ['Frame', 'Packet', 'Segment', 'Datagram'],
          answerIndex: 1,
          hint: 'Frames are L2, segments are L4.',
          explanation:
            'Layer 3 units are packets (IP). Frames live at L2, TCP segments and UDP datagrams at L4. Precise naming is not pedantry — tools and reports use these words, and mismatched vocabulary hides errors.'
        },
        {
          id: 'n02-l02-q2',
          type: 'truefalse',
          prompt: 'An ICMP type 3 code 4 message tells a sender the next-hop MTU so it can shrink its packets.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'This is the message Path MTU Discovery depends on.',
          explanation:
            'Type 3 code 4 is "destination unreachable — fragmentation needed and DF set", and it carries the MTU of the next hop. Dropping it breaks PMTUD and produces the classic big-packet hangs.'
        },
        {
          id: 'n02-l02-q3',
          type: 'short',
          prompt: 'Ethernet MTU is 1500. What is the largest TCP MSS over IPv4 with no IP or TCP options?',
          modelAnswer:
            '1460 bytes: 1500 minus 20 bytes of IPv4 header minus 20 bytes of TCP header. With IPv6 the 40-byte IP header leaves 1440.',
          hint: 'Subtract both headers from the MTU.',
          explanation:
            'MTU counts the IP packet; MSS counts only TCP payload. The arithmetic matters when you read MSS clamping configs or diagnose tunnel overhead.'
        },
        {
          id: 'n02-l02-q4',
          type: 'scenario',
          prompt:
            'In an authorized lab you add a VPN tunnel to an internal server. Small HTTPS requests work; large responses stall. Which concept do you suspect first, and which two commands help you confirm it?',
          modelAnswer:
            'MTU/fragmentation inside the tunnel: the tunnel headers shrink the effective MTU below 1500, and if ICMP "fragmentation needed" messages are not propagating, TCP never learns to shrink its segments. Confirm with tracepath through the tunnel (shows the discovered PMTU) and ping -M do -s probes at decreasing sizes to find the largest packet that survives; tcpdump filtered on icmp reveals whether type 3 code 4 messages are flowing.',
          hint: 'What changes when packets gain an extra envelope?',
          explanation:
            'Tunnel overhead plus broken PMTUD is one of the most common post-VPN failures. The probe pattern (find the working size, check the ICMP feedback) is a repeatable diagnostic you will reuse constantly.'
        }
      ],
      references: [
        {
          title: 'RFC 1122 — Requirements for Internet Hosts, Communication Layers',
          url: 'https://www.rfc-editor.org/rfc/rfc1122.html',
          note: 'Normative description of layering, encapsulation and host requirements.'
        },
        {
          title: 'Wireshark User\u2019s Guide',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
          note: 'Official Wireshark documentation — packet dissection and display fundamentals.'
        }
      ]
    },
    {
      id: 'n02-l03',
      moduleId: 'n02',
      title: 'Core Protocols: Ethernet, ARP, IP and ICMP',
      difficulty: 'Beginner',
      minutes: 17,
      prerequisites: ['n02-l02'],
      objectives: [
        'Identify the fields of an Ethernet II frame and the EtherTypes that matter',
        'Read the IPv4 header fields that carry recon signal: TTL, flags, protocol, addresses',
        'Interpret ICMP types and codes to explain exactly why a delivery failed'
      ],
      diagram: 'net-routing',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Four protocols carry nearly everything on a LAN: Ethernet moves frames on the wire, ARP finds the neighbor behind each IP, IP routes packets end to end, and ICMP reports on the journey. Module 01 taught their behavior; this lesson reads their fields, because fields are where the signal lives. A capture is testimony — TTL, ICMP codes and EtherTypes are the witnesses, and knowing how to question them turns "ping failed" into a precise diagnosis.'
          },
          {
            type: 'p',
            text:
              'Every field is a signal. TTL hints at distance and sometimes OS family. ICMP codes state the reason a delivery failed — filtered, closed, administratively blocked. EtherType says what is riding inside the frame. A pentester who reads fields instead of just outcomes gets meaning from a capture that others miss entirely.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-routing',
            caption: 'End-to-end path: MAC addresses change at every hop while IP addresses stay fixed; TTL counts down.'
          },
          {
            type: 'h',
            text: 'Ethernet II frames'
          },
          {
            type: 'p',
            text:
              'An Ethernet II frame is: destination MAC (6 bytes), source MAC (6), EtherType (2), payload (46-1500 bytes), frame check sequence (4). The EtherType says what the payload is: 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6. Switches learn source MACs and forward frames only toward the right port; broadcast (ff:ff:ff:ff:ff:ff) floods everywhere. ARP itself was covered hands-on in module 01 — in captures it is simply EtherType 0x0806, and it remains the most talkative protocol on any healthy segment.'
          },
          {
            type: 'h',
            text: 'The IPv4 header, the fields that matter'
          },
          {
            type: 'list',
            items: [
              'Version and IHL — header length in 32-bit words (options make it longer than 5)',
              'Total length — the whole packet size; bounded by the link MTU',
              'Identification, Flags (DF, MF), Fragment offset — the fragmentation machinery',
              'TTL — decremented by every router; at zero the packet is dropped and ICMP time exceeded is returned',
              'Protocol — what rides inside: 1 ICMP, 6 TCP, 17 UDP',
              'Source and destination addresses — the end-to-end identifiers that NAT may rewrite',
              'Header checksum — recomputed at every hop because TTL changes'
            ]
          },
          {
            type: 'p',
            text:
              'TTL deserves special attention: operating systems pick different starting values — commonly 64 for Linux, 128 for Windows, 255 for many network devices — and every hop subtracts one. The TTL you observe is a hop-count estimate: ttl=54 from a Linux-flavored destination means roughly 10 hops away. Never treat it as OS proof — it is a hint — but do treat it as free topology data.'
          },
          {
            type: 'h',
            text: 'Fragmentation and ICMP'
          },
          {
            type: 'p',
            text:
              'When a packet exceeds the next hop\u2019s MTU: with DF unset the router fragments it (MF flag plus offsets, reassembly only at the destination); with DF set the router returns ICMP type 3 code 4 (the PMTUD loop from the previous lesson). Fragments also have a security history — reassembly bugs and evasion attempts (teardrop-era attacks, IDS reassembly mismatches) — mostly a detection story today, but the reason capture tools show fragmentation flags so prominently.'
          },
          {
            type: 'table',
            headers: ['ICMP type/code', 'Meaning', 'Why a pentester cares'],
            rows: [
              ['0', 'Echo reply', 'The answer to ping — host reachable'],
              ['8', 'Echo request', 'The ping itself'],
              ['3/0, 3/1', 'Network/host unreachable', 'A router could not deliver — routing problem, not silence'],
              ['3/3', 'Port unreachable', 'The host is up and says the UDP port is closed — crisp signal'],
              ['3/4', 'Fragmentation needed', 'PMTUD feedback; its absence breaks big transfers'],
              ['3/13', 'Administratively prohibited', 'An ACL answered — you found a firewall, map it'],
              ['11/0', 'TTL exceeded in transit', 'The traceroute mechanism'],
              ['5', 'Redirect', 'Rarer today; historically usable for L2 tricks — note, do not trust']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'ICMP diagnostics classify scan results precisely. A timeout is ambiguous (dropped or dead), but an ICMP 3/3 from the target proves the host is up and the port closed, and an ICMP 3/13 proves an ACL is in the path — free firewall mapping. TTL on the first reply estimates hop count and cross-checks the network diagram. EtherType census on a segment reveals how much IPv6 actually flows — often far more than the client believes.'
          },
          {
            type: 'list',
            items: [
              'Read ICMP codes instead of writing "host down" — the code often names the exact control',
              'Inconsistent TTLs from "one server" hint at load balancers or NAT chains in the path',
              'Blocking all ICMP breaks PMTUD — a finding when clients do it wholesale',
              'ICMP redirects on flat networks are a legacy MITM vector; detection beats exploitation here'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Type 3 code 13 responses — explicit filtering; record which source ranges produce them',
              'Type 3 code 4 without follow-up — PMTUD broken on that path',
              'TTL values inconsistent with the documented topology (hidden hops, off-path NAT)',
              'ICMP rate limiting causing partial responses — distinguish from loss',
              'IPv6 traffic flowing healthily where IPv4 is filtered (dual-stack inconsistency)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Probing is active testing',
            text:
              'Pinging and tracing hosts you are not authorized to test is not acceptable practice. Use your lab VMs, and for public sanity checks limit yourself to well-known infrastructure that welcomes ICMP (8.8.8.8, 1.1.1.1) at modest rates.'
          },
          {
            type: 'terminal',
            title: 'TTL arithmetic and traceroute',
            lines: [
              '$ ping -c2 8.8.8.8',
              'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.',
              '64 bytes from 8.8.8.8: icmp_seq=1 ttl=122 time=9.42 ms',
              '64 bytes from 8.8.8.8: icmp_seq=2 ttl=122 time=9.01 ms',
              '--- 8.8.8.8 ping statistics ---',
              '2 packets transmitted, 2 received, 0% packet loss, time 1001ms',
              '$ traceroute -n -m 8 8.8.8.8',
              'traceroute to 8.8.8.8 (8.8.8.8), 8 hops max, 60 byte packets',
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
              'Cross-check: TTL 122 with a likely initial value of 128 means 6 routers on the path — and the trace reaches the destination at hop 6, so the arithmetic agrees. Hop 5 answered with silence: a device that drops traceroute probes but happily forwards traffic. That is normal, worth noting, and exactly the kind of quiet observation that maps where filtering begins.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Three pings, three stories. (1) A reply with ttl=64 from 192.168.1.50: same-subnet host, zero hops, probably Linux — normal. (2) "Destination Host Unreachable" reported by your own gateway: the router is telling you it cannot deliver — target down or route missing; the diagnostic lives in routing, not on the target. (3) Silent timeout: something dropped your packets without comment — filtered or dead, ambiguous until you probe differently (TCP port, another vantage). Same command, three conclusions — the difference is reading who answered and how.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ping', 'Echo probing; TTL and RTT signals'],
              ['traceroute / tracepath', 'Path mapping via TTL exhaustion'],
              ['tcpdump / Wireshark', 'Field-level view: ip.ttl, ip.flags, icmp.type filters'],
              ['nmap (later module)', 'ICMP-based host discovery and beyond']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Using initial TTL as OS proof — it is a hint with well-known exceptions',
              'Blocking all ICMP "for security" and silently breaking PMTUD',
              'Reading a timeout as "host down" — silence is filtered-or-down, and the two need different probes',
              'Treating traceroute hop RTT as that router\u2019s load — RTT is cumulative from the sender',
              'Ignoring the code on type 3 messages — the code is the actual diagnosis'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Ping 8.8.8.8, 1.1.1.1 and your own gateway; compute each hop count from the TTL. Run traceroute -n to one of them and check that the trace length agrees with your TTL arithmetic. Finally run tcpdump -n icmp in another terminal while pinging, and identify the type of every packet you see.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Ethernet frames: MACs, EtherType, payload, FCS — 0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6',
              'TTL counts hops: observed TTL plus hop count equals the initial value (64/128/255 patterns)',
              'ICMP codes diagnose: 3/3 closed, 3/4 PMTUD, 3/13 filtered, 11/0 traceroute',
              'MACs change per hop; IPs stay end-to-end; routers decrement TTL',
              'Silence is ambiguous — ICMP codes are the honest answers on the path'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n02-l03-q1',
          type: 'mcq',
          prompt: 'EtherType 0x0806 in an Ethernet frame means the payload is:',
          options: ['IPv4', 'ARP', 'IPv6', 'ICMP'],
          answerIndex: 1,
          hint: '0x0800 is IPv4; what announces address resolution?',
          explanation:
            '0x0806 identifies ARP payloads. Recognizing EtherTypes at a glance lets you triage captures instantly — IPv4, IPv6 (0x86DD) and ARP are the three you will see constantly.'
        },
        {
          id: 'n02-l03-q2',
          type: 'truefalse',
          prompt: 'TTL is decremented by every router that forwards the packet.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'It exists to kill immortal loops.',
          explanation:
            'Each forwarding router decrements TTL; at zero the packet dies and the router returns ICMP time exceeded. That dual role — loop prevention and hop counting — is what makes traceroute possible.'
        },
        {
          id: 'n02-l03-q3',
          type: 'short',
          prompt: 'What does ICMP type 3 code 13 tell you?',
          modelAnswer:
            'Destination unreachable — communication administratively prohibited. Something on the path (typically a firewall or ACL) actively answered rather than dropping silently. That is valuable reconnaissance: you have mapped a filtering device and its location.',
          hint: '"Administratively" is the operative word.',
          explanation:
            'Code 13 distinguishes deliberate policy from random loss. In scan output it upgrades "filtered" from a guess to an observation, and it tells the client exactly where their control sits.'
        },
        {
          id: 'n02-l03-q4',
          type: 'scenario',
          prompt:
            'During an authorized UDP scan, most ports return silence, but a few return ICMP type 3 code 3 from the target itself. Interpret both behaviors and decide your next step.',
          modelAnswer:
            'ICMP 3/3 (port unreachable) from the target proves the host is alive and that those specific UDP ports are closed — a crisp negative. Silence means the port is either open (the service got the datagram and chose not to reply to garbage) or filtered (something dropped it). Next step: application-level probes against the silent ports — send a protocol-correct payload (a DNS query for 53, an SNMP get for 161) and see whether a real answer returns. The 3/3 replies are already useful: they are proof of life from the host.',
          hint: 'Why does a closed UDP port bother to answer at all?',
          explanation:
            'This is UDP scanning\u2019s core asymmetry: closed ports may volunteer ICMP 3/3 while open and filtered ports both go quiet. Tool design (nmap\u2019s open|filtered label) and methodology (service-specific probes) both exist to work around it.'
        }
      ],
      references: [
        {
          title: 'RFC 791 — Internet Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc791.html',
          note: 'The IPv4 header and its fields, straight from 1981.'
        },
        {
          title: 'RFC 792 — Internet Control Message Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc792.html',
          note: 'The original ICMP types; later RFCs added codes like 3/13.'
        },
        {
          title: 'RFC 894 — Transmission of IP Datagrams over Ethernet Networks',
          url: 'https://www.rfc-editor.org/rfc/rfc894.html',
          note: 'How IP encapsulates into Ethernet frames — the EtherType standard.'
        }
      ]
    },
    {
      id: 'n02-l04',
      moduleId: 'n02',
      title: 'Transport and Name Resolution: TCP, UDP, DNS and DHCP',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['n02-l03'],
      objectives: [
        'Describe TCP flags, the three-way handshake and connection teardown at protocol level',
        'Trace a DNS resolution through the full hierarchy and name the common record types',
        'Explain the DHCP DORA exchange and what the delivered options control'
      ],
      diagram: 'net-dns-resolution',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'This lesson connects the transports to the two support protocols every network depends on. TCP decides how conversations start and end; UDP decides they simply do. DNS turns names into addresses, and DHCP hands out addresses and the configuration that makes a network usable. A pentester meets all four on day one of every engagement: scans ride TCP flags, recon rides DNS, and whoever controls DHCP controls where victims ask their questions.'
          },
          {
            type: 'p',
            text:
              'Learn these four precisely and later material becomes mechanical: SYN scanning is handshake mechanics, DNS recon is record-reading, rogue DHCP is the DORA exchange attacked. There is no magic below application exploitation — just these protocols, understood properly.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'TCP at protocol level'
          },
          {
            type: 'p',
            text:
              'The TCP header carries source and destination ports, a 32-bit sequence number, a 32-bit acknowledgment number, flags (SYN, ACK, FIN, RST, PSH, URG) and a window for flow control. The connection opens with the three-way handshake: the client sends SYN (seq x), the server answers SYN+ACK (seq y, ack x+1), the client confirms ACK (ack y+1) — and data may flow. Teardown is either cooperative (both sides FIN/ACK) or abrupt (either side sends RST). RST semantics matter to testers: an immediate RST in response to SYN is the classic closed-port signal, while silence suggests filtering — the distinction nmap reports as closed versus filtered.'
          },
          {
            type: 'p',
            text:
              'UDP is the same port architecture with none of the machinery: a datagram goes out and the application hopes. Reliability, ordering and pacing are the application\u2019s job — which is why DNS simply retries and QUIC rebuilds reliability on top.'
          },
          {
            type: 'diagram',
            id: 'net-dns-resolution',
            caption: 'DNS resolution: the stub resolver asks the recursive resolver, which walks root, TLD and authoritative servers.'
          },
          {
            type: 'h',
            text: 'DNS'
          },
          {
            type: 'p',
            text:
              'DNS is a hierarchy with caching at every level. Your stub resolver (the OS) asks a recursive resolver (your ISP\u2019s, or 8.8.8.8/1.1.1.1, or a local systemd-resolved stub). On a cache miss the recursive walks the hierarchy: the root servers refer it to the TLD servers (.org), the TLD refers it to the domain\u2019s authoritative servers, and those return the final record. Every answer carries a TTL that bounds how long it may be cached, and negative answers (NXDOMAIN) are cached too. Queries normally ride UDP 53; TCP 53 takes over for truncated responses, zone transfers and larger payloads.'
          },
          {
            type: 'list',
            items: [
              'A / AAAA — host address (IPv4 / IPv6)',
              'CNAME — alias to another name',
              'MX — mail exchangers for the domain, with priority',
              'NS — the authoritative name servers',
              'TXT — free-form text: SPF, DKIM, verification tokens, often juicy recon',
              'PTR — reverse mapping, address to name',
              'SOA — zone parameters: serial, refresh, and the administrator contact',
              'SRV — service locations (protocol-specific discovery)'
            ]
          },
          {
            type: 'h',
            text: 'DHCP'
          },
          {
            type: 'p',
            text:
              'DHCP (UDP server 67, client 68) assigns addresses and configuration through DORA: the client broadcasts a Discover, servers answer with an Offer, the client broadcasts a Request for the offer it accepts, and the chosen server confirms with an Acknowledgment carrying the lease. Leases renew at T1 (typically half the lease) and rebind at T2. The options inside the acknowledgment are the real payload: option 3 is the default router, option 6 the DNS servers, option 15 the domain, option 51 the lease time — and option 252 (WPAD) is a historical proxy-discovery favorite of attackers. Whoever answers DORA defines the victim\u2019s entire network reality.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Handshake mechanics are the foundation of port scanning (a SYN that earns SYN+ACK means open; RST means closed; silence means filtered) and of every later session-level technique. DNS is the recon database: records map infrastructure, mail flow, cloud endpoints and forgotten subdomains, and a misconfigured zone transfer (AXFR) hands you the entire zone in one query. DHCP defines the attack surface of first contact: a rogue DHCP server on the segment can redirect gateways and resolvers for every new lease — a quiet, devastating position that later lab modules demonstrate under authorization.'
          },
          {
            type: 'list',
            items: [
              'Read TTLs in dig output to infer caching behavior, CDNs and failover design',
              'Compare resolvers: split-horizon networks answer differently inside and out',
              'Note every DHCP server seen on a segment — there should be exactly the ones the client owns',
              'DNS as a channel: TXT queries and long subdomains have historically carried exfiltration and C2 traffic'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Resolvers that recurse for anyone (open resolvers) on internal ranges',
              'Zone transfers (AXFR) permitted to non-secondaries — classic quick win on authorized tests',
              'DHCP options pointing at unexpected gateways or DNS servers',
              'Extremely long or zero TTLs — pinning old answers or defeating caching entirely',
              'Services answering on both 53/udp and 53/tcp with different behavior'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'DNS queries against public domains are ordinary Internet usage; anything more active (zone transfer attempts, resolver stress) belongs to authorized targets only. Watch both protocols work:'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Active DNS testing needs authorization',
            text:
              'Querying public records is fine. Attempting AXFR, brute-forcing names or hammering resolvers is active testing — do it against DNS servers in your lab or under written authorization.'
          },
          {
            type: 'terminal',
            title: 'DNS in three queries and DHCP on the wire',
            lines: [
              '$ dig +noall +answer www.example.org A',
              'www.example.org.   300   IN   A   96.7.128.175',
              '$ dig +noall +answer example.org NS',
              'example.org.   86400   IN   NS   a.iana-servers.net.',
              'example.org.   86400   IN   NS   b.iana-servers.net.',
              '$ dig +short -x 8.8.8.8',
              'dns.google.',
              '$ sudo tcpdump -i eth0 -n -c 2 udp port 67 or udp port 68',
              'listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes',
              '10:22:01.101321 IP 0.0.0.0.68 > 255.255.255.255.67: BOOTP/DHCP, Request from d8:3a:dd:01:9c:44, length 300',
              '10:22:01.104988 IP 192.168.1.1.67 > 255.255.255.255.68: BOOTP/DHCP, Reply, length 318',
              '2 packets captured'
            ]
          },
          {
            type: 'p',
            text:
              'The dig outputs show a short TTL on a web record (fast to change, CDN-shaped) and long TTLs on delegation records; the reverse lookup answers with a real name. The tcpdump line catches a DHCP exchange on the wire — client broadcasting from 0.0.0.0:68, the server replying — the DORA dance made visible. Restart a lab VM\u2019s network (or its lease) and watch the full sequence with -v.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The complete boot-to-page narrative, which you should be able to recite: a VM powers on with no address, broadcasts DHCP Discover, receives an Offer with 192.168.1.77 plus options 3 (gateway 192.168.1.1) and 6 (DNS 192.168.1.1), requests and acknowledges the lease. The user opens https://www.example.org; the stub resolver asks 192.168.1.1, which recursively walks root, .org and the authoritative servers, returns the A record with TTL 300, and caches it. The OS opens a TCP connection: SYN to 96.7.128.175:443, SYN+ACK back, ACK out, TLS handshake, HTTP request, page renders. Every step in that story is testable — and every step is a place where a control (or an attack) can live.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'dig — precise DNS queries with full control over resolver and record type',
              'nslookup / host — quick equivalents on systems without dig',
              'ss — watch TCP conversations and states live',
              'tcpdump / Wireshark — see handshakes, DNS and DHCP exchanges on the wire',
              'resolvectl — inspect the systemd-resolved stub and its caches'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming DNS is UDP-only — TCP 53 is real and tested separately',
              'Forgetting caches: stale answers hide changes, and NXDOMAIN is cached too',
              'Trusting one resolver\u2019s answer as truth — compare resolvers before concluding',
              'Ignoring DHCP in threat models: a rogue DHCP server outranks most application attacks',
              'Confusing authoritative and recursive answers when cross-checking dig results'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Query DNS for a few domains: dig +noall +answer for A and AAAA, then MX of a large mail provider (try dig +short gmail.com MX), then NS of example.org. Note the TTLs and what they suggest. Then run the DHCP tcpdump during a lab VM lease renewal and narrate the DORA exchange to yourself, option by option.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Handshake SYN, SYN+ACK, ACK; RST closes abruptly and signals closed ports',
              'Closed answers RST, filtered stays silent — that pair is the basis of scan interpretation',
              'DNS walks stub, recursive, root, TLD, authoritative with caching and TTLs at every step',
              'Records A, AAAA, CNAME, MX, NS, TXT, PTR, SOA, SRV are the recon vocabulary',
              'DHCP DORA delivers addresses and the options that define the victim\u2019s network view'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n02-l04-q1',
          type: 'mcq',
          prompt: 'Which sequence is the correct TCP three-way handshake?',
          options: ['SYN, ACK, SYN-ACK', 'SYN, SYN-ACK, ACK', 'ACK, SYN, SYN-ACK', 'SYN, ACK, FIN'],
          answerIndex: 1,
          hint: 'The server answers the open with its own open plus the confirmation.',
          explanation:
            'Client SYN, server SYN+ACK, client ACK. The sequence/acknowledgment numbers exchanged here are also what make nmap\u2019s SYN scan a half-open technique: it never sends the final ACK, so the application never sees the connection.'
        },
        {
          id: 'n02-l04-q2',
          type: 'truefalse',
          prompt: 'An immediate RST in response to a SYN is a strong closed-port indicator, while silence suggests filtering.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Who refuses loudly, and who says nothing?',
          explanation:
            'A host with no listener on that port rejects with RST (closed). If nothing comes back at all, a firewall is likely dropping packets (filtered) — nmap encodes exactly this pair of conclusions.'
        },
        {
          id: 'n02-l04-q3',
          type: 'short',
          prompt: 'List the four DHCP messages in order, and name the transport and ports involved.',
          modelAnswer:
            'Discover, Offer, Request, Acknowledgment (DORA), carried over UDP with the client on port 68 and the server on port 67. Discover and Request are broadcasts; the Offer and Ack may be broadcast or unicast depending on the implementation and flags.',
          hint: 'The acronym spells the order.',
          explanation:
            'DORA is the whole lease ceremony, and the options inside the Acknowledgment (router, DNS, domain, lease time) are what make it security-critical: whoever answers DORA shapes the client\u2019s network reality.'
        },
        {
          id: 'n02-l04-q4',
          type: 'scenario',
          prompt:
            'On an authorized test, dig @10.0.0.53 internal.lab returns an answer, but dig @10.0.0.54 internal.lab returns NXDOMAIN for the same name. Both are internal resolvers. What differences do you investigate before reporting?',
          modelAnswer:
            'First check whether the difference is by design: split-horizon views or different zones served to different clients are legitimate. Then check caching: one resolver may hold a stale record (compare TTLs and query the authoritative server directly). Only then consider misconfiguration or compromise — a resolver handing out forged answers. Capture the dig answers with their flags (the aa bit shows which server is authoritative), test from a second vantage, and document the inconsistency either way: unexplained resolver disagreement is a finding lead, not noise.',
          hint: 'Two honest explanations exist before the malicious one.',
          explanation:
            'Resolver disagreement has benign causes (views, caches) before hostile ones (spoofing). The professional move is to rule out the boring explanations with evidence, then report the anomaly with reproducible commands attached.'
        }
      ],
      references: [
        {
          title: 'RFC 9293 — Transmission Control Protocol (TCP)',
          url: 'https://www.rfc-editor.org/rfc/rfc9293.html',
          note: 'The consolidated TCP specification: handshake, flags, state machine.'
        },
        {
          title: 'RFC 1034 — Domain Names, Concepts and Facilities',
          url: 'https://www.rfc-editor.org/rfc/rfc1034.html',
          note: 'The DNS architecture: hierarchy, recursion, caching.'
        },
        {
          title: 'RFC 2131 — Dynamic Host Configuration Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc2131.html',
          note: 'The DORA exchange, lease timers and the option list.'
        }
      ]
    },
    {
      id: 'n02-l05',
      moduleId: 'n02',
      title: 'Application Protocols: HTTP(S), TLS, SSH, FTP, SMTP, SMB, LDAP and RDP',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n02-l04'],
      objectives: [
        'State the purpose, default ports and transport of the eight major application protocols',
        'Summarize how each protocol operates in one breath',
        'Explain why each protocol is a standing pentest target and what to fingerprint on it'
      ],
      diagram: 'net-protocol-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Application protocols are the doors into systems. Everything below this layer moves bytes; these protocols define what the bytes mean — and they are where engagements are won: misconfigured mail servers, forgotten file shares, ancient remote-desktop builds, directory services that answer too many questions. Each has a purpose, standard ports, and a trail of historical vulnerabilities that made it famous.'
          },
          {
            type: 'p',
            text:
              'Your immediate goal is the table below plus one sentence of understanding per protocol. Deep exploitation of each belongs to later modules; what you need now is instant recognition — see 445, think SMB; see 3389, think RDP; see 587, think mail submission — and a sense of why each one earns a pentester\u2019s attention.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-protocol-map',
            caption: 'The application protocol map: purpose and default ports at a glance.'
          },
          {
            type: 'table',
            headers: ['Protocol', 'Default ports', 'Transport', 'Purpose', 'Pentest relevance'],
            rows: [
              ['HTTP', '80', 'TCP', 'Web transfer', 'Cleartext; headers and redirects leak; vhost routing'],
              ['HTTPS (HTTP over TLS)', '443', 'TCP', 'Encrypted web', 'Certificates and SNI leak names; TLS config itself is a test'],
              ['TLS', 'Wraps others (443, 636, 465...)', 'TCP', 'Encryption and authentication layer', 'Version and cipher negotiation; certificate trust'],
              ['SSH', '22', 'TCP', 'Encrypted remote shell, file copy, tunnels', 'Banners give exact versions; keys and tunnels are pivot tools'],
              ['FTP', '21 (control), 20 (active data)', 'TCP', 'File transfer', 'Cleartext credentials; anonymous login; bounce attacks'],
              ['SMTP', '25, 587, 465', 'TCP', 'Mail transfer and submission', 'User enumeration verbs; open relay testing'],
              ['SMB', '445 (139 legacy)', 'TCP', 'File shares, printers, RPC transport (Windows)', 'Share and user enumeration; NTLM; worm-era history'],
              ['LDAP', '389 (LDAPS 636)', 'TCP', 'Directory queries (Active Directory)', 'Anonymous binds; broad enumeration; injection'],
              ['RDP', '3389', 'TCP (+UDP companion)', 'Graphical remote desktop', 'Pre-auth surface history; NLA; certificate hostname leaks']
            ]
          },
          {
            type: 'h',
            text: 'One breath each'
          },
          {
            type: 'p',
            text:
              'HTTP/HTTPS: request-response with methods and status codes; TLS wraps HTTP into HTTPS with a handshake that negotiates version and ciphers and presents a certificate — the SNI field carries the hostname in plaintext, which is why name-based hosting and name-harvesting both work. SSH: the encrypted replacement for telnet/rlogin; authenticates with passwords or public keys; banners like SSH-2.0-OpenSSH_8.9p1 announce exact versions; its tunneling and dynamic forwarding features are later pivot tools. FTP: a two-channel design (control on 21, data on 20 or negotiated passive ports) with everything in the clear; anonymous FTP is the classic misconfiguration. SMTP: servers exchange mail with HELO/EHLO, MAIL FROM and RCPT TO; 25 is server-to-server, 587 submission with authentication, 465 implicit TLS; VRFY/EXPN and RCPT probing enable user enumeration, and relay tests check whether the server sends mail for anyone.'
          },
          {
            type: 'p',
            text:
              'SMB: Windows\u2019 file, printer and RPC transport on 445; shares, named pipes and NTLM authentication live here; SMBv1\u2019s pre-auth RCE history (EternalBlue) is why unpatched SMB still stops engagements cold. LDAP: the directory protocol behind Active Directory; clients bind (optionally anonymously) and search a tree of distinguished names; anonymous binds and over-broad searches leak organizational structure. RDP: remote graphical sessions on 3389; Network Level Authentication reduced the pre-auth surface after the BlueKeep era; the self-signed certificate presented at connect often leaks the machine\u2019s hostname and domain.'
          },
          {
            type: 'p',
            text:
              'A note that pays off later: cleartext protocols (HTTP, FTP, SMTP without STARTTLS, LDAP without S) are fully readable to anyone on the path. That fact links this lesson to position — why an on-path foothold matters — and it is why modern designs push TLS everywhere, at which point TLS configuration becomes the testable surface.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The table is the engagement checklist: map exposure of each protocol, fingerprint versions from banners and handshakes, match against known vulnerabilities, then test authentication. Knowing the "normal" protocol set per host role makes anomalies pop instantly — a domain controller should show Kerberos 88, LDAP 389/636, SMB 445; a workstation showing 3389 and 445 outward is a different conversation.'
          },
          {
            type: 'list',
            items: [
              'Version banners feed CVE matching — the seed of most network findings',
              'Cleartext protocol exposure on untrusted segments is a finding by itself',
              'Admin protocols (RDP, SMB, SSH) reachable from the internet deserve scope-clarifying questions',
              'TLS configuration (versions, ciphers, certificate chains) is a testable surface on every TLS service'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SMB, RDP or SSH exposed beyond the segments that need them',
              'FTP, HTTP or plain LDAP carrying credentials in environments where captures are possible',
              'Ancient versions: SMBv1 enabled, TLS 1.0/1.1 negotiated, decade-old OpenSSH banners',
              'Anonymous FTP or anonymous LDAP binds enabled by default and never revisited',
              'Services on nonstandard ports (2222, 8443) — do not let port-based assumptions skip them'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Fingerprinting is active testing',
            text:
              'Connecting to services to read banners and handshakes is active engagement with a system. Do it against your lab VMs and written-authorization targets only.'
          },
          {
            type: 'p',
            text:
              'Three safe lab commands produce three fingerprints — versions, stack, TLS posture:'
          },
          {
            type: 'terminal',
            title: 'Fingerprinting a lab host',
            lines: [
              '$ nc -v 192.168.1.100 22 2>&1 | head -2',
              'Connection to 192.168.1.100 22 port [tcp/ssh] succeeded!',
              'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4',
              '$ curl -sI http://192.168.1.100 | head -4',
              'HTTP/1.1 200 OK',
              'Server: nginx/1.18.0 (Ubuntu)',
              'X-Powered-By: PHP/7.4.3',
              '$ openssl s_client -connect 192.168.1.100:443 -brief < /dev/null 2>&1 | head -3',
              'CONNECTION ESTABLISHED',
              'Protocol version: TLSv1.3',
              'Ciphersuite: TLS_AES_256_GCM_SHA384'
            ]
          },
          {
            type: 'p',
            text:
              'Read what you got: the SSH banner names exact package and OS family (Ubuntu); the HTTP headers name the server and a PHP version; the TLS handshake proves 1.3 support with a modern cipher. Version information is the seed of every vulnerability match you will make — captured here in three commands against an authorized lab host.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Profiling a lab Windows host by its open doors: 445 (SMB), 3389 (RDP) and 5985 (WinRM) open; 22 and 80 closed. Conclusion without touching an exploit: a Windows machine administered remotely with file sharing enabled. Next steps on an authorized engagement: check SMB signing requirements, whether RDP enforces NLA, and whether those services are reachable from segments that have no business reaching them. The same scan against a Linux box showing 22 and 80 tells the opposite story. Protocol fingerprinting is instant situational awareness.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'nc — raw connections and banner grabs for any TCP service',
              'curl -sI — HTTP headers as a fingerprint',
              'openssl s_client — TLS handshake details and certificate inspection',
              'nmap -sV (later module) — systematic version detection across the protocol map',
              'testssl.sh / sslscan — deep TLS configuration checks (mention here, used later)'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting port numbers to name services — probes and banners decide, not the registry',
              'Assuming encryption equals good configuration — old ciphers, self-signed chains and missing mutual auth are all testable',
              'Scanning only 80/443 and ignoring SMB, LDAP and RDP where the richer findings usually live',
              'Forgetting nonstandard ports; services moved to 2222 or 8443 still count',
              'Hammering mail servers with enumeration at rates that trip defenses before the test begins'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab, banner-grab three different services with nc, inspect one TLS service with openssl s_client -brief, and pull one set of HTTP headers with curl -sI. For each, write a one-line profile: service, version, transport, and one question you would test next on an authorized target.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Ports to know cold: 22, 80, 443, 445, 3389 — plus 21, 25/587/465, 389/636',
              'Cleartext protocols leak to on-path observers; TLS moves the test to configuration',
              'Banners and handshakes fingerprint versions — the seed of CVE matching',
              'Host roles predict protocol sets; deviations are signal',
              'Every protocol here is a door: map exposure, then test authentication and configuration'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n02-l05-q1',
          type: 'mcq',
          prompt: 'What is the default RDP port?',
          options: ['22', '445', '3389', '5985'],
          answerIndex: 2,
          hint: 'It is in the high registered range and Windows-specific.',
          explanation:
            'RDP listens on TCP 3389 by default (with a UDP 3389 companion in modern versions). 445 is SMB and 5985 is WinRM — knowing this trio instantly profiles a Windows host.'
        },
        {
          id: 'n02-l05-q2',
          type: 'truefalse',
          prompt: 'FTP encrypts credentials by default.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'When was FTP designed, and what did it assume about the wire?',
          explanation:
            'Classic FTP sends usernames, passwords and data in cleartext; FTPS (TLS-wrapped) exists but is opt-in and separate. Cleartext credentials over FTP remain a legitimate finding on modern networks.'
        },
        {
          id: 'n02-l05-q3',
          type: 'short',
          prompt: 'Name two SMTP-related tests a pentester can run against an authorized mail server, and the verbs or commands involved.',
          modelAnswer:
            'User enumeration: VRFY/EXPN commands, or probing RCPT TO for a list of addresses to see which are accepted. Open relay test: issue EHLO, MAIL FROM an external address, then RCPT TO an external recipient and see whether the server relays. Both require written authorization and modest request rates.',
          hint: 'One asks who exists; the other asks who will carry your mail.',
          explanation:
            'SMTP reconnaissance lives in its command vocabulary. Enumeration and relay checks are the two classic tests, and both must be rate-limited and pre-authorized because mail infrastructure reacts badly to abuse.'
        },
        {
          id: 'n02-l05-q4',
          type: 'scenario',
          prompt:
            'Your authorized scan finds 445/tcp open on an internet-facing host. Why does this deserve immediate attention, and how do you proceed responsibly?',
          modelAnswer:
            'SMB on the internet is unusual and historically dangerous: it was the door for wormable pre-auth RCE (EternalBlue-era) and remains an NTLM relay surface. Responsible next steps within scope: negotiate the dialect safely to learn the SMB version, check whether SMBv1 is enabled and whether signing is required, attempt only the access checks the scope allows (for example listing shares with a null or guest session), and report the exposure itself as a finding regardless of exploitability — an internet-facing SMB listener is a configuration problem even when fully patched.',
          hint: 'Separate the exposure finding from the exploitation finding.',
          explanation:
            'Professional SMB assessment starts with exposure and configuration (dialects, signing, SMBv1) and only then considers authenticated or exploit testing — all scope-limited. The exposure alone is reportable and often the more valuable finding.'
        }
      ],
      references: [
        {
          title: 'RFC 9110 — HTTP Semantics',
          url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          note: 'Methods, status codes and headers — the web\u2019s contract.'
        },
        {
          title: 'RFC 8446 — TLS 1.3',
          url: 'https://www.rfc-editor.org/rfc/rfc8446.html',
          note: 'The modern TLS handshake and why older versions retire.'
        },
        {
          title: 'RFC 959 — File Transfer Protocol (FTP)',
          url: 'https://www.rfc-editor.org/rfc/rfc959.html',
          note: 'The two-channel design and its security-blind assumptions.'
        },
        {
          title: 'RFC 5321 — Simple Mail Transfer Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc5321.html',
          note: 'The SMTP command vocabulary behind enumeration and relay tests.'
        },
        {
          title: 'RFC 4251 — The Secure Shell (SSH) Protocol Architecture',
          url: 'https://www.rfc-editor.org/rfc/rfc4251.html',
          note: 'SSH architecture: transport, authentication and connection layers.'
        },
        {
          title: 'RFC 4511 — Lightweight Directory Access Protocol (LDAP)',
          url: 'https://www.rfc-editor.org/rfc/rfc4511.html',
          note: 'LDAP binds and searches — the directory surface of Active Directory.'
        }
      ]
    }
  ]
};
