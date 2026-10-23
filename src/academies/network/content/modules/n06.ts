import type { Module } from '../../../../types';

// LEVEL 4 — DISCOVERY & TRAFFIC ANALYSIS · Module n06: Packet Analysis with Wireshark
// Original curriculum content for the Network Security & Pentesting Academy.
// All prose is original; filter syntax follows the official Wireshark User's
// Guide (wireshark.org/docs) and libpcap/tcpdump documentation
// (tcpdump.org/manpages). Capturing traffic on networks you do not own or are
// not explicitly authorized to monitor is illegal — all exercises here run on
// lab networks and lab-generated captures.

export const n06: Module = {
  id: 'n06',
  title: 'Packet Analysis with Wireshark',
  level: 4,
  description:
    'Hands-on traffic analysis: capturing packets and reading their layered anatomy, the TCP session lifecycle as it appears on the wire, the two Wireshark filter languages and its statistics views, protocol-by-protocol analysis of DNS, HTTP, TLS, ARP and DHCP, and finally stream following, expert info and a systematic method for spotting suspicious traffic.',
  outcomes: [
    'Capture traffic correctly and open, inspect and preserve PCAP files',
    'Read packet anatomy across Ethernet, IP and TCP layers',
    'Explain the TCP lifecycle — handshake, data, teardown, RST, retransmissions — from packets',
    'Master display filters, capture filters and Wireshark statistics',
    'Analyze DNS, HTTP, TLS, ARP and DHCP traffic and distinguish normal from suspicious'
  ],
  lessons: [
    {
      id: 'n06-l01',
      moduleId: 'n06',
      title: 'Capture Fundamentals and Packet Anatomy',
      difficulty: 'Beginner',
      minutes: 16,
      prerequisites: ['n03-l04'],
      objectives: [
        'Set up capture on the right interface and understand what a switch shows you',
        'Distinguish PCAP from PCAPNG and handle capture files as evidence',
        'Read a packet across Ethernet, IP and TCP layers in the Wireshark three-pane view'
      ],
      diagram: 'net-packet-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Packet analysis is the ground truth of networking. Tool output, dashboards and scanner reports are all interpretations; a capture file is the actual bytes that crossed the wire. When a scanner claims a port is open, a capture settles it. When two teams argue about whether a connection was reset by the server or dropped by a firewall, the packets answer. This module makes you fluent in that ground truth, starting with how captures are actually obtained.'
          },
          {
            type: 'p',
            text:
              'The first surprise for most learners is that capturing is a placement problem. On a modern switched network, your interface receives only traffic addressed to you plus broadcast and multicast — not your neighbors\u2019 conversations. Seeing more requires the network to cooperate: a switch SPAN/mirror port, a physical TAP, or (in a lab you own) traffic you generate yourself. Promiscuous mode tells your adapter to accept every frame the driver hands it; it does not conjure frames the switch never delivered.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Wireshark ships dumpcap as its capture engine (tshark and tcpdump share the same libpcap layer). Interface selection matters: tcpdump -D or the Wireshark welcome screen lists what your OS offers, including the any pseudo-device on Linux and loopback for local traffic. On Wi-Fi there is a second dimension entirely: monitor mode captures raw 802.11 frames rather than only frames for your association. For evidence work, capture with full packet bytes (-s 0 snap length) and record the interface, host and time window.'
          },
          {
            type: 'p',
            text:
              'File formats: the classic PCAP stores a single interface and a stream of timestamped packets. PCAPNG (the modern default for Wireshark\u2019s own saves) supports multiple interfaces in one file, per-packet comments, capture metadata and higher-precision timestamps — real advantages when merging captures from several points. Keep originals read-only and analyze copies; editcap, mergecap and capinfos are the housekeeping tools for slicing, joining and describing capture files.'
          },
          {
            type: 'diagram',
            id: 'net-packet-anatomy',
            caption: 'One HTTP packet, unwrapped layer by layer: Ethernet, IPv4, TCP, payload.'
          },
          {
            type: 'p',
            text:
              'Every packet is a stack of headers inside headers (encapsulation). An Ethernet II frame starts with destination and source MAC addresses (6 bytes each) and an EtherType (0x0800 for IPv4, 0x0806 for ARP, 0x86DD for IPv6); the frame check sequence is usually stripped by the adapter. The IPv4 header carries TTL, protocol (6 = TCP, 17 = UDP) and the two IP addresses. The TCP header carries ports, sequence and acknowledgment numbers, flags and the window. Inside the TCP payload lives the application data — the HTTP request, DNS query, or TLS record. Wireshark\u2019s middle pane shows each layer decoded and expandable; the bottom pane shows the raw bytes; the top pane lists every packet in order.'
          },
          {
            type: 'table',
            headers: ['Wireshark pane', 'Shows', 'What you use it for'],
            rows: [
              ['Packet list (top)', 'One row per packet: number, time, endpoints, protocol, info', 'Scanning and selecting the traffic you care about'],
              ['Packet detail (middle)', 'Protocol tree for the selected packet, layer by layer', 'Reading exact field values and flags'],
              ['Packet bytes (bottom)', 'Hex and ASCII of the selected packet', 'Verifying payload content and spotting oddities']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Captures serve two roles in a pentest. First, verification: scanner findings, proxy logs and application errors become much stronger findings when you can show the packets behind them — a cleartext credential in an HTTP POST, a TLS handshake to an unexpected host, an RST that proves who closed the connection. Second, discovery: reading traffic on a segment you are authorized to monitor reveals protocols, endpoints and behavior no port scan will show you. Both roles require the discipline taught here: correct placement, full bytes, untouched originals.'
          },
          {
            type: 'list',
            items: [
              'Sniffing a network without authorization is illegal in most jurisdictions — capture only your lab or in-scope points',
              'Timestamps in captures are UTC-based in Wireshark\u2019s display options; mixing time zones wrecks correlation',
              'Work on copies: the original capture is evidence, and hash it if the finding matters'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Cleartext protocols carrying credentials or tokens (HTTP, FTP, Telnet) on lab targets',
              'Packets with zero payload where you expected data — a clue toward handshake or filter problems',
              'Checksum errors on locally captured traffic: frequently just checksum offloading, not real damage',
              'Traffic your interface sees that matches no host you know (rogue devices, misconfigured gear)',
              'Malformed-frame flags in the packet list, which can indicate capture problems rather than attacks'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Capture only what is yours',
            text:
              'Intercepting network traffic you are not authorized to monitor is a crime in most jurisdictions regardless of intent. In this academy you capture on your own lab networks and on captures you generate yourself.'
          },
          {
            type: 'p',
            text:
              'Make your first capture deliberately: generate known traffic from a lab client to a lab server, capture it, then open the file and walk one packet down through all its layers. The commands below are the standard workflow on a Linux lab host.'
          },
          {
            type: 'terminal',
            title: 'First capture, end to end',
            lines: [
              '$ tcpdump -D',
              '1.eth0 [Up, Running, Connected]',
              '2.any (Pseudo-device that captures on all interfaces) [Up, Running]',
              '3.lo [Up, Running, Loopback]',
              '$ sudo tcpdump -i eth0 -nn -s 0 -w /tmp/lab.pcap host 192.168.56.20 and port 80',
              'listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes',
              '^C',
              '12 packets captured',
              '12 packets received by filter',
              '0 packets dropped by kernel',
              '$ capinfos /tmp/lab.pcap | head -6',
              'File name: /tmp/lab.pcap',
              'File type: Wireshark/tcpdump/... - pcap',
              'Number of packets: 12',
              'File size: 1652 bytes',
              'First packet time: 2026-09-28 12:00:00.123456'
            ]
          },
          {
            type: 'p',
            text:
              'Open /tmp/lab.pcap in Wireshark (or read it with tshark -r /tmp/lab.pcap). Select the first packet and expand the tree: Ethernet II, Internet Protocol Version 4, Transmission Control Protocol, then the HTTP payload. Name every field you recognize before moving on — this walkthrough is the foundation for everything else in the module.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A concrete lab exercise: from a client VM, log into a deliberately vulnerable training web app over HTTP. Capture the session on the server host. In the capture, find the POST request, expand the TCP layer, and read the credentials sitting in the form data. That single exercise — placement, capture, filter, layer walk — is the template for every packet-analysis task you will ever do, and it doubles as your first reportable finding (cleartext transmission of credentials).'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Wireshark', 'Interactive capture and deep packet dissection'],
              ['tshark', 'The same engine headless: read, filter and extract from the command line'],
              ['tcpdump / dumpcap', 'Lightweight capture to files on servers and lab boxes'],
              ['capinfos / editcap / mergecap', 'Describe, slice and join capture files while preserving originals'],
              ['VirtualBox / GNS3 lab', 'A place where you may capture everything, freely']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Capturing on the wrong interface (the docker0 bridge, a VPN interface, loopback vs eth0) and concluding nothing is happening',
              'Expecting promiscuous mode to reveal switched traffic — only SPAN, TAP or lab topologies do that',
              'Capturing with a truncated snap length and then wondering why payloads are missing',
              'Treating checksum errors on local captures as attacks before checking for checksum offloading',
              'Editing or re-saving the only copy of a capture and destroying its value as evidence',
              'Ignoring time zones when correlating captures with logs'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Capture one full HTTP session in your lab (tcpdump or Wireshark), save it as lab-first.pcap, and answer from the file alone: what were the client and server MACs, IPs and ports; what TTL did each side use; what TCP options appeared in the handshake; what did the payload contain? Then compute how many bytes the session moved, using the protocol hierarchy statistics view.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Captures are ground truth; everything else is interpretation',
              'Switches deliver only your traffic — seeing more needs SPAN, TAP, or your own lab',
              'PCAPNG adds interfaces, comments and metadata over classic PCAP; keep originals read-only',
              'Every packet reads as Ethernet → IP → TCP → payload; the three-pane view walks that stack'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n06-l01-q1',
          type: 'mcq',
          prompt: 'Which Wireshark pane shows the selected packet decoded layer by layer?',
          options: ['Packet list (top)', 'Packet detail (middle)', 'Packet bytes (bottom)', 'The IO Graph view'],
          answerIndex: 1,
          hint: 'One pane lists, one decodes, one shows raw bytes.',
          explanation:
            'The middle pane renders the protocol tree — Ethernet, IP, TCP, application — with expandable fields. The top pane lists packets, the bottom pane shows hex and ASCII bytes.'
        },
        {
          id: 'n06-l01-q2',
          type: 'truefalse',
          prompt: 'Enabling promiscuous mode on your laptop lets Wireshark see all traffic between other hosts on a switched office network.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the switch deliver to your port by design?',
          explanation:
            'Switches forward unicast frames only to the destination port. Promiscuous mode makes your adapter accept whatever the driver receives, but the switch still delivers only your traffic, broadcast and multicast. Seeing others requires a SPAN port, TAP or an authorized capture point.'
        },
        {
          id: 'n06-l01-q3',
          type: 'short',
          prompt: 'Name two advantages PCAPNG has over classic PCAP for evidence work.',
          modelAnswer:
            'Any two of: multiple interfaces (or capture points) stored in one file, per-packet and per-file comments, richer capture metadata (hardware, OS, application), and higher-precision timestamps. These matter when merging captures from several points or annotating evidence in place.',
          hint: 'Think about what a modern capture file records besides packets.',
          explanation:
            'PCAPNG is the modern default because it carries context with the packets. For evidence, annotations and multi-point merges are the features that matter most.'
        },
        {
          id: 'n06-l01-q4',
          type: 'scenario',
          prompt:
            'You capture for ten minutes on the office network segment you are authorized to test and see only your own traffic plus broadcast chatter, but the client insists the segment carries heavy inter-server traffic. What is happening and what are your options?',
          modelAnswer:
            'This is normal switched behavior: the access switch forwards only frames addressed to your MAC, plus broadcast/multicast, so inter-server unicast never reaches you. Options: request a SPAN/mirror port or test access port (TAP) on the relevant switch (or switches) from the network team, capture on a transparent inline point if one exists, or capture directly on the servers themselves (authorized) where local stacks see their own traffic. Document the capture point either way — conclusions are only valid for traffic the capture point actually sees.',
          hint: 'The capture worked; the placement is the constraint.',
          explanation:
            'Capture placement defines what a capture can prove. Professional engagements agree capture points with the network team in advance and record them as part of the methodology.'
        }
      ],
      references: [
        {
          title: 'Wireshark User\u2019s Guide',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
          note: 'Official manual: capturing, interfaces, file formats and the three-pane interface.'
        },
        {
          title: 'Wireshark Documentation',
          url: 'https://www.wireshark.org/docs/',
          note: 'Index of official docs: user guide, filter reference and man pages.'
        },
        {
          title: 'tcpdump & libpcap — official man page',
          url: 'https://www.tcpdump.org/manpages/tcpdump.1.html',
          note: 'The command-line capture tool used throughout this module.'
        }
      ]
    },
    {
      id: 'n06-l02',
      moduleId: 'n06',
      title: 'The TCP Session Lifecycle in Packets',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n06-l01'],
      objectives: [
        'Recognize handshake, data transfer and teardown sequences in a capture',
        'Interpret RST packets and distinguish refusal, teardown and reset injection',
        'Diagnose retransmissions, duplicate ACKs and zero-window events'
      ],
      diagram: 'net-tcp-handshake',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'TCP is a conversation with strict manners, and every stage of it is visible in a capture. Once you can read the lifecycle, a capture stops being a wall of packets and becomes a diagnosis: this connection opened cleanly, transferred steadily, then the server stopped ACKing; or this host sent a SYN and never got an answer; or this reset arrived far too early to be natural. Network performance problems, port-scan evidence, and even attack signatures all live in this lifecycle.'
          },
          {
            type: 'p',
            text:
              'The core mental model: sequence numbers count bytes in each direction, and acknowledgment numbers state the next byte expected. Everything TCP does — handshakes, flow control, loss recovery — is expressed as careful bookkeeping on those two counters plus a handful of flags. Wireshark shows relative sequence numbers by default, which turns the bookkeeping into small, readable integers.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-tcp-handshake',
            caption: 'Three-way handshake, data exchange, and the four-way teardown.'
          },
          {
            type: 'h',
            text: 'Opening: the three-way handshake'
          },
          {
            type: 'p',
            text:
              'The client sends SYN (with its initial sequence number and options: MSS, window scale, SACK-permitted, timestamps). The server answers SYN/ACK with its own ISN. The client completes with ACK. Two packets later, both sides have agreed on starting sequence numbers and capabilities. In a capture, a handshake that never completes is diagnostic gold: SYN with no SYN/ACK means the port is filtered or the service is dead; SYN answered by RST/ACK means nothing listens on that port; repeated SYNs from one host with no completion is the classic port-scan signature.'
          },
          {
            type: 'h',
            text: 'Transferring data'
          },
          {
            type: 'p',
            text:
              'During transfer, each side ACKs received bytes; the PSH flag marks pushes of buffered data to the application. Loss triggers recovery you can see: a receiver sends duplicate ACKs for the last in-order byte, and three duplicates make the sender fast-retransmit the missing segment without waiting for its timer. Wireshark tags these events as tcp.analysis.retransmission, tcp.analysis.duplicate_ack and friends. Receive-side slowness shows as a shrinking advertised window — and when the receiver advertises zero, the sender must stop and poll with window probes until a window update arrives.'
          },
          {
            type: 'h',
            text: 'Closing and resetting'
          },
          {
            type: 'p',
            text:
              'A graceful close is FIN, ACK, FIN, ACK — four packets, possibly with a half-close between. A reset (RST) aborts immediately. RSTs have three common origins, and telling them apart is a core skill: a RST/ACK in reply to a SYN is a closed port refusing; a RST after an idle period can be a stateful firewall or NAT device expiring its state table entry; a RST that appears mid-conversation from neither endpoint\u2019s normal behavior can be injected — a firewall or an attacker severing the session. Context (who sent it, when, what preceded it) is what turns an RST packet into a finding.'
          },
          {
            type: 'table',
            headers: ['Symptom in capture', 'Meaning', 'Typical cause'],
            rows: [
              ['SYN, no reply', 'Probe lost or silently dropped', 'Firewall filtering, service down, routing black hole'],
              ['SYN, RST/ACK reply', 'Port closed', 'No listener on that port'],
              ['Multiple dup ACKs, then retransmission', 'Packet loss mid-stream', 'Congestion, bad link, buffer pressure'],
              ['Advertised window drops to 0', 'Receiver cannot accept more data', 'Slow application reading from its socket'],
              ['RST after long idle', 'State table expired somewhere', 'Firewall/NAT idle timeout'],
              ['RST from a third host mid-session', 'Reset injection', 'Security device or attacker severing the flow']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Reading the lifecycle is how you verify scan results and troubleshoot findings. A port reported open but no completed handshake in the capture means the scanner measured a filtered path. Service availability complaints become precise when you can show zero-window stalls or retransmission storms. And in lab red-vs-blue exercises, SYN flood and reset-injection patterns are exactly what you will teach defenders to spot — because you can build both with tc/netem and raw sockets in your own environment.'
          },
          {
            type: 'list',
            items: [
              'Scan signatures: many SYNs to sequential ports with no completions',
              'Reset injection evidence: RST packets whose TTL or IP characteristics differ from the real endpoints',
              'Performance findings: retransmission ratios and zero-window events from real captures, not speculation'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Handshakes that never complete, and which side went silent',
              'Retransmission bursts and where they cluster (one flow, one direction, or everything)',
              'Zero-window events followed by long stalls — slow application code, visible on the wire',
              'RSTs arriving before any data flows (refusal) versus mid-stream resets of healthy flows',
              'Keepalive patterns and their intervals, which distinguish idle-but-alive from abandoned connections'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'tip',
            title: 'Analysis is passive',
            text:
              'Reading captures you already have touches nothing. Generating the traffic still belongs on lab targets — do not probe third-party systems to provoke interesting packets.'
          },
          {
            type: 'p',
            text:
              'Capture a lab session that deliberately includes problems: a connection to a closed port, a slow server, and a normal transfer. Then interrogate the file with tshark display filters — the same ones you will use in Wireshark\u2019s filter bar.'
          },
          {
            type: 'terminal',
            title: 'Reading the lifecycle out of a capture',
            lines: [
              '$ tshark -r /tmp/lab.pcap -Y "tcp.flags.syn==1 && tcp.flags.ack==0"',
              '    1 0.000000  192.168.56.10 → 192.168.56.20  TCP 66  49152 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
              '   15 0.812000  192.168.56.10 → 192.168.56.20  TCP 66  49154 → 3389 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
              '$ tshark -r /tmp/lab.pcap -Y "tcp.flags.reset==1"',
              '   17 0.813100  192.168.56.20 → 192.168.56.10  TCP 66  3389 → 49154 [RST, ACK] Seq=1 Ack=1 Win=0 Len=0',
              '$ tshark -r /tmp/lab.pcap -Y "tcp.analysis.zero_window"',
              '   34 2.412000  192.168.56.20 → 192.168.56.10  TCP 66  80 → 49152 [TCP ZeroWindow] Seq=1201 Ack=346 Win=0 Len=0',
              '$ tshark -r /tmp/lab.pcap -Y "tcp.analysis.retransmission" | head -3',
              '   41 3.105000  192.168.56.20 → 192.168.56.10  TCP 1514  80 → 49152 [TCP Retransmission] Seq=1001 Ack=346 Len=1460'
            ]
          },
          {
            type: 'p',
            text:
              'Read that output as a story: a clean handshake to port 80, a SYN to 3389 answered by an immediate RST/ACK (closed port refusing), a zero-window stall on the web session, and a retransmission recovering lost data. Four filters, four diagnoses.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Lab exercise: start a web server, open a download, then pause the server process with a debugger or send SIGSTOP. The capture shows the receiver\u2019s window draining to zero, the sender polling with window probes, and recovery when you resume. That one experiment makes flow control — the most abstract part of TCP — permanently concrete, and it is exactly the pattern that real slow-application findings look like on the wire.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Wireshark', 'Colorized lifecycle: Follow Stream, Flow Graph, sequence-number analysis'],
              ['tshark', 'The tcp.analysis and tcp.filters.* field set, scriptable over many files'],
              ['tcpdump', 'Quick on-box capture with flag-level filters'],
              ['tc (netem)', 'Lab-only loss and delay injection to manufacture retransmissions']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading retransmissions as duplicates: a retransmission re-sends data, a duplicate ACK is the receiver asking again',
              'Assuming every RST is malicious — most are closed ports and idle-timeout expiries',
              'Ignoring window scaling when analyzing throughput: the 16-bit header window is scaled silently',
              'Comparing absolute vs relative sequence numbers across tools and concluding the numbers are wrong',
              'Blaming the network for stalls that are zero-window application behavior'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab, produce one capture containing: a successful handshake and transfer, a SYN to a closed port, and a session killed with firewall rejects. Annotate the capture (PCAPNG comments are perfect) marking each lifecycle stage and each anomaly, then write three sentences a defender could act on.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SYN → SYN/ACK → ACK opens; FIN exchanges close gracefully; RST aborts',
              'RST meaning comes from context: refusal, state expiry, or injected reset',
              'Retransmissions, duplicate ACKs and zero windows are loss and flow-control signatures, all filterable',
              'Wireshark\u2019s relative sequence numbers make TCP bookkeeping readable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n06-l02-q1',
          type: 'mcq',
          prompt: 'What is the correct packet order for a completed TCP three-way handshake?',
          options: [
            'SYN → SYN/ACK → ACK',
            'SYN → ACK → SYN/ACK',
            'SYN → FIN → ACK',
            'ACK → SYN → SYN/ACK'
          ],
          answerIndex: 0,
          hint: 'The server answers with both its own open and the acknowledgment in one packet.',
          explanation:
            'Client SYN, server SYN/ACK (carrying its initial sequence number), client ACK. The two SYN packets also negotiate options such as MSS, window scaling and SACK support.'
        },
        {
          id: 'n06-l02-q2',
          type: 'mcq',
          prompt: 'A capture shows a receiver advertising window 0 and the sender pausing. What does this indicate?',
          options: [
            'The sender is under a denial-of-service attack',
            'The receiver\u2019s application is not reading from its socket fast enough',
            'The handshake failed',
            'A firewall is dropping packets'
          ],
          answerIndex: 1,
          hint: 'The window advertises how much data the receiver can still accept.',
          explanation:
            'A zero window is receive-side backpressure: the application on that host has not drained its receive buffer, so TCP tells the sender to stop and polls with window probes until a window update frees space. It is a classic slow-application signature.'
        },
        {
          id: 'n06-l02-q3',
          type: 'truefalse',
          prompt: 'An RST packet always indicates an attack or malicious activity.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does a closed port send in reply to a SYN?',
          explanation:
            'RSTs are normal TCP machinery: closed ports refuse SYNs with RST/ACK, applications abort connections, and stateful devices expire idle sessions with resets. Malice shows in context — resets mid-conversation from unexpected sources, or TTL/fingerprint mismatches suggesting injection.'
        },
        {
          id: 'n06-l02-q4',
          type: 'short',
          prompt: 'Explain the difference between a TCP retransmission and a duplicate ACK, and what each one signals.',
          modelAnswer:
            'A retransmission is the sender re-sending a segment it believes was lost (its retransmission timer expired, or fast recovery triggered). A duplicate ACK is the receiver re-ACKing the same next-expected byte because later, out-of-order data arrived — the receiver asking for the gap to be filled. Retransmissions show data loss on the wire; duplicate ACKs are the receiver-side symptom of the same loss or of reordering.',
          hint: 'One is the sender acting, one is the receiver asking.',
          explanation:
            'They are two halves of loss recovery: dup ACKs (typically three) trigger fast retransmit so the sender need not wait for its timer. Both being frequent in one flow is a lossy or congested path.'
        },
        {
          id: 'n06-l02-q5',
          type: 'scenario',
          prompt:
            'A capture during an authorized lab exercise shows hundreds of SYNs from one host to sequential ports on a server, none completing. Give three plausible explanations and the evidence that would distinguish them.',
          modelAnswer:
            '1) A port scan (nmap-style): SYNs to many sequential ports, occasional SYN/ACK on open ports immediately followed by RST — check for SYN/ACKs and the scanner\u2019s RST aborts. 2) A SYN flood / DoS: same packet shape but sustained, usually with spoofed sources, and the server stops answering everyone — check whether legitimate clients also stall and whether source addresses repeat. 3) A misconfigured application or health-checker retrying: SYNs cluster to a few ports at regular intervals rather than sweeping — check timing regularity and port spread. Distinguishing evidence: port sequence, source diversity, response pattern, and time distribution of the SYNs.',
          hint: 'The packet shape is the same; the pattern across ports, sources and time differs.',
          explanation:
            'This is exactly how analysts triage scan-vs-flood-vs-bug in practice: the lifecycle tells you what happened to each probe, and the pattern tells you who was probing and why.'
        }
      ],
      references: [
        {
          title: 'RFC 9293 — Transmission Control Protocol (TCP) Specification',
          url: 'https://datatracker.ietf.org/doc/html/rfc9293',
          note: 'The normative handshake, teardown, RST, flow-control and loss-recovery behavior.'
        },
        {
          title: 'Wireshark User\u2019s Guide',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
          note: 'Official documentation for sequence analysis and the tcp.analysis fields.'
        },
        {
          title: 'tshark — official man page',
          url: 'https://www.wireshark.org/docs/man-pages/tshark.html',
          note: 'Command-line capture reading and display filtering used in this lesson.'
        }
      ]
    },
    {
      id: 'n06-l03',
      moduleId: 'n06',
      title: 'Display Filters, Capture Filters and Statistics',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n06-l02'],
      objectives: [
        'Distinguish BPF capture filters from Wireshark display filters and use both correctly',
        'Write the everyday display filters for TCP state, protocols and fields',
        'Use protocol hierarchy, conversations, endpoints and IO graphs to profile a capture'
      ],
      diagram: 'net-capture-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Wireshark has two filter languages, and confusing them is the single most common beginner error. Capture filters use the libpcap/BPF syntax: they run in the kernel while packets arrive and permanently discard everything that does not match. Display filters use Wireshark\u2019s protocol-aware language: they run on the already-captured file, can reference any decoded field (http.request, tcp.flags.syn, dns.qry.name), and can be changed endlessly. One decides what gets recorded; the other decides what you look at.'
          },
          {
            type: 'p',
            text:
              'The complementary skill is seeing the whole file before diving into packets. Wireshark\u2019s statistics — protocol hierarchy, conversations, endpoints, IO graphs — turn a hundred-megabyte capture into a profile in seconds: which protocols dominate, who talked to whom, and whether traffic arrives in a smooth stream or suspicious periodic spikes. Professionals profile first, then filter, then read packets.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-capture-pipeline',
            caption: 'Kernel BPF filter decides what is recorded; display filters decide what is shown.'
          },
          {
            type: 'p',
            text:
              'Capture filters (BPF) use primitives like host, net, port, portrange, ip proto, and length tests, combined with and/or/not and parenthesized groups; tcpdump.org documents the full grammar in pcap-filter. Bit tests reach TCP flags directly: tcp[tcpflags] & tcp-syn != 0 matches SYN packets even in ancient tcpdump versions. The tradeoff is decisive: a capture filter shrinks files and CPU use, but what it discards is gone forever — never capture-filter during evidence collection unless you are certain of what you will never need.'
          },
          {
            type: 'compare',
            title: 'One intent, two languages',
            beforeTitle: 'Capture filter (BPF, kernel)',
            beforeCode:
              'tcpdump -i eth0 -w web.pcap \\\n  "net 192.168.56.0/24 and port 80"\n\n# runs during capture, kernel-level\n# smaller files — but unmatched packets\n# are discarded forever',
            afterTitle: 'Display filter (protocol-aware)',
            afterCode:
              'http.request.method == "POST" &&\n  http.request.uri contains "login"\n\n# runs on the captured file, any depth\n# refine and re-filter as often\n# as you like — nothing is lost'
          },
          {
            type: 'p',
            text:
              'Display filters reference any field in the dissection tree with the form protocol.field, compared with ==, !=, <, >, contains, in-set and string matches. The everyday set: tcp.flags.syn==1 && tcp.flags.ack==0 (SYNs), tcp.flags.reset==1 (resets), tcp.analysis.retransmission, tcp.stream eq 5 (one whole session), ip.addr==10.0.0.5 (either side), http.request, dns.qry.name contains "lab", tls.handshake.type==1 (ClientHellos), !(arp or dhcp) to drop background noise. Wireshark validates as you type: a red background means the filter is invalid, green means it parses. In tshark the same language appears after -Y (display) and -f (capture).'
          },
          {
            type: 'p',
            text:
              'The statistics views: Protocol Hierarchy (Statistics → Protocol Hierarchy) shows every protocol present with frames and bytes — rare protocols, huge DNS shares, or nonstandard traffic jump out. Conversations lists talkers per L2/L3/L4 with bytes and duration — the fastest way to find who dominates a capture. Endpoints is the same per single address. The IO Graph plots traffic rate over time with any display filter as a series — periodic spikes at fixed intervals are how beaconing announces itself before you read a single packet.'
          },
          {
            type: 'terminal',
            title: 'Profiling and filtering a capture from the CLI',
            lines: [
              '$ sudo tcpdump -i eth0 -nn -s 0 -w dns.pcap "udp port 53"',
              '^C',
              '214 packets captured',
              '$ tshark -r dns.pcap -z io,phs -q',
              'Frames   Bytes      Protocol',
              '214      21876      eth',
              '214      21014      ip',
              '214      19946      udp',
              '210      19644      dns',
              '4        302        mdns',
              '$ tshark -r /tmp/lab.pcap -Y "http.request.method == GET" -T fields -e frame.number -e ip.src -e http.request.uri',
              '9    192.168.56.10   /index.html',
              '14   192.168.56.10   /login.php'
            ]
          },
          {
            type: 'p',
            text:
              'The -z io,phs run profiles the DNS capture in one line: 210 of 214 frames are DNS, plus a little mDNS background. The -T fields run shows the pattern for scripted extraction: display filter, then the exact fields you want per matching packet.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'On an engagement you rarely read captures linearly — you profile and filter your way to the interesting two hundred packets inside a hundred thousand. Statistics answer "what is in here" before you commit to a hypothesis, and well-chosen filters answer "is my finding really in here" when you verify scanner output. Capture-filter discipline matters too: an over-eager BPF on an evidence capture is how attackers\u2019 channels (or your own exfil evidence) get silently excluded.'
          },
          {
            type: 'list',
            items: [
              'Profile first: protocol hierarchy and conversations locate the interesting slice in seconds',
              'Verify findings with narrow field filters (tcp.stream, tcp.flags, specific fields) rather than eyeballing',
              'Keep the full unfiltered capture; do your filtering on copies'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Protocol hierarchy surprises: rare protocols, one protocol dominating bytes, tunneled traffic',
              'Conversation imbalance: one pair of endpoints moving far more data than the business justifies',
              'IO graph periodicity: spikes at fixed intervals from the same conversation (beaconing shape)',
              'Traffic to addresses absent from your asset list',
              'Filters you keep retyping — save them as filter buttons or capture them in notes'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'tip',
            title: 'Same rules, two syntaxes',
            text:
              'When a filter does nothing, first check which language you are speaking: BPF keywords (host, port, net) in the display bar fail, and display syntax (protocol.field) in -f fails. Wireshark\u2019s red/green background is your friend.'
          },
          {
            type: 'p',
            text:
              'Take the lab capture from the previous lessons and run the full triage: protocol hierarchy, top conversations, an IO graph, then the standard filter set. Do each in the GUI once and in tshark once — the GUI builds intuition, the CLI builds automation.'
          },
          {
            type: 'terminal',
            title: 'The standard triage sequence',
            lines: [
              '$ tshark -r /tmp/lab.pcap -q -z conv,tcp',
              '================================================================================',
              'TCP Conversations',
              'Filter:<None>',
              '  192.168.56.10:49152  <->  192.168.56.20:80     449 frames   43912 bytes',
              '  192.168.56.10:49154  <->  192.168.56.20:3389    2 frames      132 bytes',
              '================================================================================',
              '$ tshark -r /tmp/lab.pcap -Y "tcp.stream eq 0" | head -4',
              '    1 0.000000  192.168.56.10 → 192.168.56.20  TCP 66  49152 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
              '    2 0.000150  192.168.56.20 → 192.168.56.10  TCP 66  80 → 49152 [SYN, ACK] Seq=0 Ack=1 Win=64240 Len=0 MSS=1460',
              '    3 0.000210  192.168.56.10 → 192.168.56.20  TCP 60  49152 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
              '    4 0.000380  192.168.56.10 → 192.168.56.20  HTTP 407  GET /index.html HTTP/1.1'
            ]
          },
          {
            type: 'p',
            text:
              'The conversation list shows the web session dwarfing everything else, and tcp.stream eq 0 isolates that single session end to end. Statistics found the conversation; the stream filter pinned it; a right-click → Follow TCP Stream in the GUI finishes the job (next lesson).'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A realistic triage story: you receive a 100 MB capture from an authorized internal test. Protocol hierarchy says 90 percent TCP, 8 percent DNS, and a suspicious sliver of SMB on a subnet that should have none. Conversations shows the DNS going to one external resolver at steady size. The IO graph shows the DNS spiking every 60 seconds. You have not read a packet yet, and you already have a finding-shaped question: why does one host query one resolver on the minute, every minute? The next lesson\u2019s stream tools turn the question into evidence.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Wireshark filter bar + profile', 'Interactive display filtering with live validation'],
              ['tshark -Y / -f / -T fields', 'Scriptable filtering and field extraction over many files'],
              ['tcpdump + BPF (pcap-filter)', 'Kernel-level capture filtering when files must stay small'],
              ['Statistics views (phs, conv, endpoints, IO graph)', 'Profiling captures before reading packets'],
              ['Wireshark display filter reference', 'The authoritative field list per protocol']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Typing BPF syntax (host, port) into the display filter bar — different language, red background',
              'Capture-filtering an evidence collection and permanently discarding the packets that mattered',
              'Forgetting == in display filters, or mixing and/or precedence without parentheses',
              'Profiling after filtering instead of before; hierarchy on a filtered file tells you only about the filter',
              'Trusting one statistic alone; conversations plus IO graph plus hierarchy corroborate each other'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take any lab capture and produce a one-page profile: protocol hierarchy table, top five conversations, one IO graph, and three display filters that isolate what you consider the most interesting traffic. Deliberately type one BPF filter into the display bar and one display filter into tcpdump -f, read both error behaviors, and write down the difference.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'BPF capture filters run in the kernel and discard; display filters run on the file and are reversible',
              'Display filters address any decoded field: tcp.flags, tcp.stream, http.request, dns.qry.name',
              'Statistics (hierarchy, conversations, endpoints, IO graph) profile a capture in seconds',
              'Profile first, filter second, read packets last — and keep the unfiltered original'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n06-l03-q1',
          type: 'mcq',
          prompt: 'Which filter language runs in the kernel during capture and permanently discards non-matching packets?',
          options: [
            'Wireshark display filters',
            'BPF capture filters (libpcap syntax)',
            'Both discard permanently',
            'Neither discards anything'
          ],
          answerIndex: 1,
          hint: 'One decides what gets recorded, the other what gets shown.',
          explanation:
            'BPF capture filters are evaluated as packets arrive; unmatched packets never reach the file. Display filters only change what is shown from what is already captured and can be changed at will.'
        },
        {
          id: 'n06-l03-q2',
          type: 'mcq',
          prompt: 'Which display filter matches only the initial SYN packets of TCP connections?',
          options: [
            'tcp.flags.syn == 1',
            'tcp.flags.syn == 1 && tcp.flags.ack == 0',
            'tcp.flags.reset == 1',
            'tcp.analysis.retransmission'
          ],
          answerIndex: 1,
          hint: 'SYN/ACK packets also have the SYN flag set — what excludes them?',
          explanation:
            'The SYN/ACK has both flags set, so syn==1 alone matches handshake replies too. Requiring ack==0 leaves only client SYNs. The reset filter matches RSTs, and the analysis field matches retransmissions.'
        },
        {
          id: 'n06-l03-q3',
          type: 'truefalse',
          prompt: 'A capture filter such as udp port 53 can be written to also filter on HTTP request methods like POST.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'BPF sees packets, not decoded application semantics.',
          explanation:
            'BPF matches on header primitives (addresses, ports, protocols, flag bits) without decoding application protocols. Filtering on http.request.method requires Wireshark\u2019s protocol-aware display filters after capture.'
        },
        {
          id: 'n06-l03-q4',
          type: 'short',
          prompt: 'You must share a capture with a partner but your working filter excludes most traffic. What do you send, and why?',
          modelAnswer:
            'Send the original unfiltered capture (or a faithful copy), not the filtered view. The filter is analysis, not data — a filtered file destroys context and can silently hide exactly what the partner needs. If size is a constraint, keep a hash of the original, document the filter, and only then share an editcap-derived slice.',
          hint: 'Which one is evidence, and which one is a lens?',
          explanation:
            'Evidence hygiene: filters shape your view, the capture itself is the artifact. Anything derived (filtered, merged, sliced) should be documented and traceable to the original.'
        },
        {
          id: 'n06-l03-q5',
          type: 'scenario',
          prompt:
            'You receive a 100 MB authorized capture and must find possible command-and-control beaconing before reading packets in detail. Describe your workflow using Wireshark statistics, including what pattern you expect to see.',
          modelAnswer:
            '1) Protocol hierarchy: note the protocol mix and anything unexpected or disproportionately small-but-regular (e.g. steady DNS or rare protocols). 2) Conversations: rank by frames/duration and look for one pair of endpoints with many frames but tiny bytes spread over the whole capture. 3) IO graph: plot traffic rate over time, optionally with a filter isolating the suspect pair; beaconing shows as regular spikes at a fixed interval with similar magnitudes. 4) Only then open the specific conversation (tcp.stream eq N) and read its contents. Expected beacon pattern: periodic, similar-sized exchanges between one internal host and one external endpoint at a consistent interval.',
          hint: 'Profile, rank, graph — and only then read.',
          explanation:
            'Statistics localize the suspicion so packet reading becomes confirmation instead of fishing. The periodic-spikes pattern in an IO graph is the classic beaconing signature precisely because human and bulk traffic is irregular.'
        }
      ],
      references: [
        {
          title: 'Wireshark User\u2019s Guide — Capture Filters',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/ChCaptFiltersSection.html',
          note: 'Official capture-filter chapter and BPF examples.'
        },
        {
          title: 'Wireshark User\u2019s Guide — Display Filters',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/ChWorkDisplayFilterSection.html',
          note: 'Official display-filter language reference.'
        },
        {
          title: 'pcap-filter — libpcap filter syntax man page',
          url: 'https://www.tcpdump.org/manpages/pcap-filter.7.html',
          note: 'The authoritative BPF grammar used by tcpdump and dumpcap.'
        },
        {
          title: 'Wireshark Display Filter Reference',
          url: 'https://www.wireshark.org/docs/dfref/',
          note: 'Every filterable field, per protocol.'
        }
      ]
    },
    {
      id: 'n06-l04',
      moduleId: 'n06',
      title: 'Analyzing DNS, HTTP, TLS, ARP and DHCP Traffic',
      difficulty: 'Intermediate',
      minutes: 19,
      prerequisites: ['n06-l03'],
      objectives: [
        'Describe what normal traffic looks like for DNS, HTTP, TLS, ARP and DHCP',
        'Recognize the classic anomalies per protocol in a capture',
        'Use per-protocol display filters to isolate and verify each finding'
      ],
      diagram: 'net-protocol-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Spotting odd traffic requires a mental baseline of normal. This lesson walks five protocols every network pentester reads constantly — DNS, HTTP, TLS, ARP and DHCP — with the same structure each time: what the protocol does, what a healthy exchange looks like in Wireshark, and what odd looks like. Most real findings are not exotic: they are a normal protocol used in an abnormal way, visible only to someone who knows the baseline.'
          },
          {
            type: 'p',
            text:
              'A framing that carries through the whole lesson: for each protocol ask three questions. Who initiates (client or server)? What identifies abuse of direction or volume? And what should never travel in the clear — because that is where credentials, tokens and topology leak.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'DNS (UDP/53 mostly): clients query resolvers; the response carries answers and a response code. Normal: short, varied queries, mostly A/AAAA, low NXDOMAIN rate, internal resolvers doing recursion. Odd: storms of NXDOMAIN (malware iterating random domains — DGA behavior), very long random-looking subdomains (DNS tunneling/exfiltration), heavy TXT or NULL-record use, queries to external resolvers bypassing internal ones, zone transfer (AXFR) attempts, and DNS riding nonstandard ports. Filters: dns.flags.response == 0 (queries), dns.flags.rcode == 3 (NXDOMAIN), dns.qry.name contains "lab".'
          },
          {
            type: 'p',
            text:
              'HTTP (TCP/80 and friends): request method, URI and headers in cleartext. Normal: GET/POST with sensible headers, standard status codes, one Host header. Odd: Basic authorization headers in the clear (instant credential finding), unusual methods (TRACE, TRACK), URIs full of shell metacharacters (exploitation attempts), server headers leaking exact versions, and credentials or tokens in query strings. Filters: http.request, http.request.method == "POST", http.authorization.'
          },
          {
            type: 'p',
            text:
              'TLS: the handshake is visible even though payloads are not. The ClientHello reveals SNI (the hostname the client wants), TLS version and cipher suites; the server certificate chain follows. Normal: TLS 1.2/1.3, modern suites, certificates from expected issuers for expected names. Odd: legacy versions (SSLv3, TLS 1.0/1.1), weak or export-grade ciphers, self-signed or unexpected certificate issuers, SNI that does not match the destination\u2019s reputation, handshakes that never carry data (scanner probes), and TLS on ports where nothing TLS-like should live. Filters: tls.handshake.type == 1 (ClientHello), tls.handshake.extensions_server_name (SNI).'
          },
          {
            type: 'p',
            text:
              'ARP (L2, no ports): requests are broadcast, replies unicast. Normal: a few requests per host per minute, occasional gratuitous ARP on boot or NIC change. Odd: two different MAC addresses answering for one IP (duplicate-address detection fires — classic spoofing/conflict signature), gratuitous ARP floods (announcing, poisoning, or a broken NIC), and high-rate broadcast storms. Wireshark marks duplicates in the frame: filter arp.duplicate-address-detected == 1.'
          },
          {
            type: 'p',
            text:
              'DHCP (UDP 67/68): the DISCOVER → OFFER → REQUEST → ACK dance, with NAK when a request is refused. Normal: one or two servers offering, leases renewing at half-life. Odd: OFFERs from unexpected MACs (rogue DHCP server — a classic attack where the attacker becomes the victim\u2019s gateway and DNS), NAK storms (competing servers or misconfiguration), clients DECLINE-ing in bulk, and requests arriving on segments with no authorized DHCP role. Filters: dhcp.option.dhcp == 2 (OFFER), == 5 (ACK), == 6 (NAK); message types 1-8 per RFC 2131.'
          },
          {
            type: 'table',
            headers: ['Protocol', 'Normal looks like', 'Odd looks like'],
            rows: [
              ['DNS', 'Varied queries, low NXDOMAIN, internal resolvers', 'NXDOMAIN storms, long random labels, TXT floods, open recursion'],
              ['HTTP', 'Standard methods/headers, sane URIs', 'Cleartext Basic auth, exploit-shaped URIs, tokens in URLs'],
              ['TLS', 'Modern versions, expected SNI and issuers', 'Legacy versions, weak ciphers, SNI mismatches, dataless handshakes'],
              ['ARP', 'Sparse request/reply, rare gratuitous', 'Duplicate IP answers from two MACs, gratuitous floods'],
              ['DHCP', 'Known server, orderly DORA, renewals', 'Offers from strangers, NAK storms, bulk declines']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These five protocols produce a large share of real network findings. Cleartext HTTP credentials on lab and legacy targets are the eternal first report item. Open recursive resolvers and AXFR-capable servers are configuration findings with direct attack value. Rogue DHCP is both a finding and a demonstrated attack path in internal tests. ARP duplicate detection verifies L2 attack feasibility before you claim it. And TLS anomalies feed the crypto/reporting side: legacy protocol support is a finding even when payloads stay encrypted.'
          },
          {
            type: 'list',
            items: [
              'Verify, do not assume: an ARP duplicate could be a spoof or a genuine misconfiguration — the capture starts the conversation',
              'Credential findings need the capture as evidence: exact request, headers redacted as required by the engagement rules',
              'Protocol baselines are client-specific: ask what their DNS volume normally looks like before calling a storm'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'http.authorization headers and form POSTs carrying passwords over HTTP',
              'DNS responses with rcode 3 in bursts; queries for domains of implausible length',
              'TLS ClientHellos advertising SSLv3/TLS 1.0 or cipher suites nobody should offer in this decade',
              'arp.duplicate-address-detected frames, and which MAC won',
              'DHCP OFFERs whose MAC does not match the authorized server list, and NAKs right after OFFERs'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'tip',
            title: 'Build the baseline yourself',
            text:
              'Generate clean traffic in your lab first (normal browsing, normal DHCP lease, normal ARP), capture it, and study it. You cannot recognize odd until you have internalized normal.'
          },
          {
            type: 'p',
            text:
              'Then produce anomalies on purpose in the lab: a rogue DHCP container, a second ARP speaker for one IP, a legacy-TLS service, a Basic-auth-over-HTTP login. Capture each and find it with the filters below.'
          },
          {
            type: 'terminal',
            title: 'Per-protocol filters against the anomaly captures',
            lines: [
              '$ tshark -r arp-anomaly.pcap -Y "arp.duplicate-address-detected == 1"',
              '   42 8.811  Dell_9f:3c:01 → Broadcast  ARP 60 Duplicate IP address detected for 192.168.56.1 (00:1a:2b:3c:4d:5e) - also in use by 00:1a:2b:3c:4d:99',
              '$ tshark -r dhcp-anomaly.pcap -Y "dhcp.option.dhcp == 2" -T fields -e eth.src -e ip.src',
              'de:ad:be:ef:00:07   192.168.56.66',
              '# an OFFER from a MAC that is not the authorized DHCP server: rogue server',
              '$ tshark -r http-lab.pcap -Y "http.authorization" -T fields -e ip.dst -e http.authorization',
              '192.168.56.20   Basic dGVzdDp0ZXN0MTIz',
              '$ tshark -r tls-lab.pcap -Y "tls.handshake.type == 1" -T fields -e ip.dst -e tls.handshake.extensions_server_name',
              '192.168.56.20   legacy.lab.example',
              '$ tshark -r dns-lab.pcap -Y "dns.flags.rcode == 3" | wc -l',
              '187'
            ]
          },
          {
            type: 'p',
            text:
              'Five filters, five findings, each with the packet numbers as evidence. The Basic line even decodes (base64) to test:test123 — on a real engagement that is a credential exposure finding, reported with the request redacted per scope rules.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The rogue-DHCP lab, end to end: start a second DHCP server on your lab bridge (dnsmasq on another VM will do), re-lease a client, and capture the whole dance. The capture shows OFFERs from two MACs, the client accepting yours, and — if you configure it — a gateway and DNS pointing at the rogue box. That single capture demonstrates the attack, the detection filter (dhcp.option.dhcp == 2 and look at eth.src), and the defensive fix (DHCP snooping on switches) in one exercise.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Wireshark / tshark', 'Per-protocol dissection, filters and field extraction'],
              ['dnsmasq / dhcpd (lab)', 'Build the rogue-DHCP and normal-DHCP baselines'],
              ['openssl s_client (lab)', 'Generate TLS handshakes with chosen versions for baseline captures'],
              ['tcpdump', 'On-box captures where Wireshark cannot run']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Flagging all cleartext HTTP as an attack — legacy-but-authorized HTTP is a hygiene finding, not an incident',
              'Assuming DNS only lives on port 53; tunnels and exfil ride any UDP port',
              'Expecting to read TLS payloads; everything after the handshake is encrypted by design',
              'Calling every ARP duplicate a spoofing attack before checking for genuine IP conflicts',
              'Blaming the first DHCP server seen in a NAK storm; read the full exchange sequence first',
              'Reading anomalies without a baseline — you need to know what normal is on that network'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce two anomaly captures in your lab and write them up like report findings with packet evidence: (1) an ARP conflict between two of your own VMs, (2) a rogue DHCP offer. For each: the display filter, the packet numbers, what an attacker gains, and the defensive control that would have stopped it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Every protocol has a normal shape; findings are deviations from the shape',
              'DNS: NXDOMAIN storms, long labels and open recursion; HTTP: cleartext credentials and leaky headers',
              'TLS shows version, ciphers and SNI even when payloads stay encrypted',
              'ARP duplicates and rogue DHCP offers are classic L2/L3 attacks with one-filter detections'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n06-l04-q1',
          type: 'mcq',
          prompt: 'A capture shows DHCP OFFERs arriving from two different MAC addresses on one segment. What is the most significant concern?',
          options: [
            'A rogue DHCP server could hand out a malicious gateway and DNS, enabling man-in-the-middle positioning',
            'The clients will simply fail to get addresses',
            'DHCP requires all servers to share one MAC address',
            'This is normal load balancing and never a concern'
          ],
          answerIndex: 0,
          hint: 'Whoever answers the lease controls where the client sends its traffic.',
          explanation:
            'A rogue DHCP server can set option 3 (router) and option 6 (DNS) to attacker-controlled values, making it a classic MITM enabler. Multiple legit servers can be redundant, but an unknown MAC offering leases deserves immediate investigation.'
        },
        {
          id: 'n06-l04-q2',
          type: 'mcq',
          prompt: 'What does the SNI field in a TLS ClientHello reveal to a passive observer?',
          options: [
            'The client\u2019s IP address',
            'The hostname the client intends to reach, in cleartext',
            'The session keys',
            'The server\u2019s certificate issuer'
          ],
          answerIndex: 1,
          hint: 'It exists so servers hosting many names can pick the right certificate before encryption starts.',
          explanation:
            'Server Name Indication travels inside the cleartext ClientHello so the server can select the right certificate; the rest of the handshake parameters (versions, suites) are also visible. Only after the key exchange does the payload become opaque.'
        },
        {
          id: 'n06-l04-q3',
          type: 'truefalse',
          prompt: 'With Wireshark and a network capture but no keys, you can read the contents of an established TLS session\u2019s application data.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the TLS handshake establish, precisely?',
          explanation:
            'Without session keys (from a keylog file, authorized), TLS application data is ciphertext. You can still read the handshake: versions, cipher suites, SNI, certificates — which is exactly what the baseline checks in this lesson use.'
        },
        {
          id: 'n06-l04-q4',
          type: 'short',
          prompt: 'A DNS capture shows hundreds of NXDOMAIN responses to long, random-looking subdomains of one domain. What does this pattern suggest, and what would you check next?',
          modelAnswer:
            'It suggests DNS tunneling or DGA-style malware: either data being exfiltrated in DNS labels (tunneling encodes data into queried names) or malware cycling through algorithmically generated domains for C2. Next checks: isolate the querying host and its full query set, measure entropy/length of labels, look for TXT or NULL record types, check whether the queried domain is newly registered, and correlate with EDR/logs for the source host — all within scope and with the client informed.',
          hint: 'Nobody resolves long random names by accident — what are they carrying?',
          explanation:
            'Long random labels are the signature of DNS as a covert channel, and NXDOMAIN storms fit both tunneling probing and DGA iteration. The capture identifies the behavior; host-level telemetry attributes it.'
        },
        {
          id: 'n06-l04-q5',
          type: 'scenario',
          prompt:
            'In an authorized internal test you capture arp.duplicate-address-detected frames for the gateway IP 10.10.10.1, and shortly afterwards a test workstation\u2019s traffic to the internet starts flowing through an unknown MAC. What is happening, what do you verify before claiming an attack, and what does the report recommend?',
          modelAnswer:
            'Happening: an ARP spoofing/poisoning attack (or a genuine IP conflict) — two MACs claim 10.10.10.1, and the workstation cached the attacker\u2019s MAC for the gateway, so its traffic transits the unknown host. Verify before claiming: confirm the second MAC is not a legitimate standby/redundancy gateway (VRRP/HSRP uses shared virtual MACs by design), check switch port tables (port security, DHCP snooping, dynamic ARP inspection logs) to locate the physical port of the rogue MAC, and rule out misconfiguration. Report: demonstrated L2 MITM feasibility, evidence (frame numbers, MACs), impact (traffic interception/modification), and recommendations: dynamic ARP inspection, DHCP snooping, port security, and alerting on gateway MAC changes.',
          hint: 'First rule out the legitimate reasons two MACs can answer for one IP.',
          explanation:
            'This is the canonical internal-test finding: the capture shows the behavior, but professional attribution requires ruling out redundancy protocols and checking switch-side evidence before writing "attack".'
        }
      ],
      references: [
        {
          title: 'RFC 1035 — Domain Names: Implementation and Specification',
          url: 'https://datatracker.ietf.org/doc/html/rfc1035',
          note: 'DNS message format, record types and response codes used in the filters.'
        },
        {
          title: 'RFC 9110 — HTTP Semantics',
          url: 'https://datatracker.ietf.org/doc/html/rfc9110',
          note: 'Methods, headers and status codes you read in HTTP captures.'
        },
        {
          title: 'RFC 8446 — TLS 1.3 (with 1.2 in RFC 5246)',
          url: 'https://datatracker.ietf.org/doc/html/rfc8446',
          note: 'Handshake structure: ClientHello, SNI, versions and suites.'
        },
        {
          title: 'RFC 2131 — Dynamic Host Configuration Protocol',
          url: 'https://datatracker.ietf.org/doc/html/rfc2131',
          note: 'The DORA message sequence and message types 1-8 used in DHCP filters.'
        }
      ]
    },
    {
      id: 'n06-l05',
      moduleId: 'n06',
      title: 'Streams, Expert Info and Finding Suspicious Traffic',
      difficulty: 'Advanced',
      minutes: 18,
      prerequisites: ['n06-l04'],
      objectives: [
        'Follow TCP and UDP streams to reconstruct complete conversations',
        'Use expert info categories as a triage layer and know their false positives',
        'Detect port-versus-protocol mismatches, beaconing patterns and scan signatures',
        'Apply packet analysis as evidence and verification during a pentest'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The last skill layer turns packet reading into investigation. Following a stream reassembles a conversation into something a human can read — every HTTP request and response in order, a Telnet session typed out, a binary protocol as hex. Expert info layers Wireshark\u2019s own opinion on top: it groups the anomalies it noticed (malformed frames, retransmissions, zero windows) by severity, giving you a triage list for free. And the hunt for suspicious traffic — beacons, scans, mismatched ports — is where everything in this module becomes detection engineering.'
          },
          {
            type: 'p',
            text:
              'During a pentest, these skills have a specific job: evidence and verification. Scanner output says a port was open and a service answered; the capture proves it. A finding claims cleartext credentials; the followed stream is the screenshot. Suspicion says a host beacons somewhere; the IO graph and conversation list are the argument. The pentester who can produce wire-level evidence writes reports that survive review.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Follow Stream (right-click a packet → Follow → TCP/UDP Stream) reassembles one direction pair in order, color-codes client and server, and can show the conversation as ASCII, raw, hex or even a printable C array; saving the output extracts transferred files and payloads. Following a stream also applies a tcp.stream eq N filter, pinning the whole session. For HTTP, File → Export Objects → HTTP (or tshark --export-objects) extracts every transferred file with one click — a fast way to harvest payloads an attacker (or a lab web app) moved.'
          },
          {
            type: 'p',
            text:
              'Expert info (Analyze → Expert Information) aggregates Wireshark\u2019s protocol-level complaints by severity: errors (malformed frames, checksum problems), warnings (loss and flow symptoms such as retransmissions and zero windows), notes and chats (routine protocol events like connection setup and window updates). It is a triage accelerator, not a verdict: the classic false positive is checksum errors caused by interface checksum offloading, where the sending NIC computes checksums after capture — disabled in capture options or simply known and ignored.'
          },
          {
            type: 'p',
            text:
              'Three hunt patterns cover most suspicious-traffic detection at packet level. Port-vs-protocol mismatch: services on ports that disagree with their content (HTTP dissected on 443, TLS on 8080, SSH-like banners elsewhere) — Wireshark\u2019s heuristic dissector notes help, and Decode As… forces a protocol onto a port for testing. Beaconing: periodic, similar-sized exchanges between one internal host and one external endpoint — visible in the IO graph as evenly spaced spikes and confirmed by extracting timestamps and sizes with tshark. Scan signatures: one host emitting many SYNs across sequential ports (or one port across many hosts) with few completions — the n06-l02 lifecycle plus a conversations sort makes these obvious.'
          },
          {
            type: 'terminal',
            title: 'From pattern to evidence',
            lines: [
              '$ tshark -r beacon.pcap -Y "ip.dst == 203.0.113.99 && tcp.len > 0" -T fields -e frame.time_relative -e ip.src -e frame.len',
              '30.112   10.10.10.50   96',
              '60.118   10.10.10.50   96',
              '90.121   10.10.10.50   96',
              '120.126  10.10.10.50   96',
              '# fixed interval, fixed size, one source: classic beaconing shape',
              '$ tshark -r /tmp/lab.pcap --export-objects http,./evidence -q',
              '$ ls ./evidence',
              'index.html   login.php    upload.php   shell.php',
              '$ tshark -r /tmp/lab.pcap -Y "http.request.method == POST && http.request.uri contains upload" -T fields -e frame.number -e ip.src -e ip.dst',
              '87   192.168.56.10   192.168.56.20'
            ]
          },
          {
            type: 'p',
            text:
              'That short session is the whole craft: the field extraction proves periodicity and size regularity (the beacon argument), export-objects turns the web session into files you can inspect (and the shell.php name alone reshapes the engagement), and the POST filter gives the exact packets to cite as evidence.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'MITRE ATT&CK describes C2 channels as Application Layer Protocol abuse (T1071) — and beaconing is its visible heartbeat. On engagements, your packet-level work appears in three places: verification (proving or disproving scanner and tool claims), evidence (streams, exported objects and annotated captures attached to findings), and detection advice (telling the client exactly what their own monitoring would have seen — and then writing that gap up as a finding when the answer is nothing).'
          },
          {
            type: 'list',
            items: [
              'Verification beats assumption: before a finding ships, reproduce the exact packets that justify it',
              'Evidence hygiene: annotate captures, hash originals, and quote packet numbers in the report',
              'Detection advice is high-value: "your IDS saw this and alerted; nothing reacted" is actionable for the client'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Regular-interval, similar-size conversations to a single external endpoint (beacon shape)',
              'Long-lived, low-volume TCP sessions that never carry obvious application traffic',
              'Services whose content contradicts their port (banners, TLS records, or HTTP on the wrong ports)',
              'Sequential-port SYN bursts from one source, or the same port probed across many hosts',
              'Exported objects that should not exist: web shells, unexpected executables, archive files',
              'Expert info clusters concentrated on one conversation — that flow deserves a manual read'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'tip',
            title: 'Read streams, not just packets',
            text:
              'The Follow Stream view is where packet analysis becomes human: always check both directions, switch to hex when ASCII looks wrong, and remember the reassembly is per-conversation evidence you can paste into reports.'
          },
          {
            type: 'p',
            text:
              'Build the lab hunt: generate a beacon with a scripted curl loop (every 30 seconds, fixed payload) to a lab listener, run a port scan against a lab host while capturing, and upload a file through a lab web app. Then find all three in one capture using the sequence below.'
          },
          {
            type: 'terminal',
            title: 'The lab hunt sequence',
            lines: [
              '$ tshark -r lab.pcap -q -z conv,tcp',
              '================================================================================',
              'TCP Conversations',
              '  192.168.56.10:49312  <->  192.168.56.20:8080   240 frames   11520 bytes  600.1s',
              '  192.168.56.10:49500  <->  192.168.56.20:80       12 frames    2401 bytes    2.0s',
              '  192.168.56.30:44210  <->  192.168.56.20:8022      4 frames     356 bytes    0.4s',
              '# many frames, few bytes, very long duration: the beacon conversation',
              '$ tshark -r lab.pcap -Y "tcp.flags.syn==1 && tcp.flags.ack==0 && ip.src==192.168.56.30" | wc -l',
              '98',
              '# one host, 98 SYNs: a scan signature',
              '$ tshark -r lab.pcap -Y "tcp.port==8022 && tls" | head -2',
              '# TLS records on a port named like SSH: port-vs-protocol mismatch'
            ]
          },
          {
            type: 'p',
            text:
              'Each line is one verdict: conversation statistics flagged the beacon candidate, the SYN count confirmed the scan, and the protocol-on-wrong-port check found the mismatch. In the GUI, the same three steps are conversations view, a filtered packet list, and Decode As.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The capstone lab: one capture containing a beacon (scripted curl every 30s), an nmap scan, and an HTTP file upload with a suspicious filename. Produce a two-page investigation: IO graph excerpt for the beacon with the interval math, conversation table for both suspects, the followed stream of the upload with packet numbers, exported objects list, and one paragraph of detection advice for each pattern (what threshold, what filter, what tool). That document is simultaneously a lab deliverable and a portfolio piece.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Wireshark Follow Stream', 'Human-readable reassembly of conversations, both directions'],
              ['Export Objects / tshark --export-objects', 'Harvest transferred files from HTTP and other protocols'],
              ['Expert Information', 'Severity-grouped anomaly triage (mind the offload false positives)'],
              ['tshark -T fields + statistics', 'Scriptable pattern extraction: intervals, sizes, counts'],
              ['editcap / mergecap', 'Prepare and slice captures for evidence packages']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting expert info blindly: checksum offloading, capture-point duplication and mid-stream captures create false errors',
              'Claiming compromise from periodicity alone; scheduled tasks, NTP and monitoring agents also tick regularly — corroborate with destination reputation and host telemetry',
              'Forgetting both directions when following a stream (the interesting half is often the server\u2019s response)',
              'Analyzing a truncated or mid-session capture and calling missing data an attack',
              'Editing the original capture to annotate it instead of using PCAPNG comments on a copy',
              'Presenting screenshots without packet numbers, timestamps or hashes — evidence needs anchors'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the capstone lab yourself: scripted beacon, one scan, one upload, one capture. Write the investigation with a strict rule — every claim must cite a packet number, a filter, or a statistic from the file. Then swap captures with a peer and verify each other\u2019s claims using only the cited evidence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Follow Stream reassembles conversations into readable, citable evidence',
              'Expert info triages anomalies by severity; checksum offload is the classic false positive',
              'Beaconing = periodic similar-size flows; scans = SYN bursts with patterned ports; mismatches = protocol vs port disagreement',
              'Pentest packet work is verification and evidence: reproduce the packets, cite the numbers, hash the original'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n06-l05-q1',
          type: 'mcq',
          prompt: 'What does Wireshark\u2019s Follow TCP Stream feature produce?',
          options: [
            'A reassembled view of the whole conversation in order, with client and server content separated',
            'A list of all TCP streams with byte counts',
            'The routing path between the two hosts',
            'A decrypted view of any TLS conversation'
          ],
          answerIndex: 0,
          hint: 'It turns packets back into a conversation a human can read.',
          explanation:
            'Follow Stream reassembles one session\u2019s data in order, color-coding each direction, with ASCII/raw/hex views and the ability to save payloads. It also applies a tcp.stream eq N filter pinning the session. It does not decrypt TLS without keys.'
        },
        {
          id: 'n06-l05-q2',
          type: 'mcq',
          prompt: 'A capture shows a TCP checksum error on many packets from one host. The packets look otherwise healthy. What is the most likely explanation?',
          options: [
            'The host is under attack',
            'Interface checksum offloading — the NIC computes checksums after the capture point',
            'The capture file is corrupted',
            'TCP checksums are optional and usually wrong'
          ],
          answerIndex: 1,
          hint: 'Where in the sending stack is the checksum actually computed?',
          explanation:
            'Many NICs calculate checksums in hardware after the kernel hands frames over, so a capture on the sending host sees deliberately-invalid checksums. It is the classic expert-info false positive — disable offload in capture options or ignore the errors.'
        },
        {
          id: 'n06-l05-q3',
          type: 'truefalse',
          prompt: 'A perfectly periodic, similar-sized flow to an external host is by itself conclusive proof of malware beaconing.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What legitimate software also phones home on a schedule?',
          explanation:
            'Monitoring agents, update checkers, NTP, mail clients and scheduled jobs all produce regular traffic. Periodicity is a strong lead, not a verdict: corroborate with destination, payload, host telemetry and business context before claiming compromise.'
        },
        {
          id: 'n06-l05-q4',
          type: 'short',
          prompt: 'Why is exporting objects (for example HTTP objects) valuable during a pentest, and what should accompany the export as evidence?',
          modelAnswer:
            'Exported objects turn a stream of packets into the actual files that crossed the wire — web shells, uploaded documents, downloaded payloads — which can be inspected, fingerprinted and attached to findings. The export should be accompanied by: the source capture file name and its hash, the display filter or stream that produced it, timestamps, and a note of where each object appeared (frame numbers). That chain makes the objects admissible as evidence rather than loose files.',
          hint: 'Files are findings — but only if you can say exactly where they came from.',
          explanation:
            'Export objects is one of the fastest evidence generators in Wireshark, and evidence hygiene (hashes, filters, frame references) is what separates a demo from a report artifact.'
        },
        {
          id: 'n06-l05-q5',
          type: 'scenario',
          prompt:
            'During an authorized internal test you suspect one workstation beacons to an external IP. Before you write the finding, list the wire-level evidence you must produce and the corroboration you should seek.',
          modelAnswer:
            'Wire-level evidence: the conversation table entry (endpoints, frame/byte counts, duration), the IO graph or tshark field extraction showing the interval and size regularity, the followed stream content (what is actually exchanged, hex if binary), and the destination endpoint details (IP, SNI/domain if TLS, port). Corroboration: whether the destination is known to the client\u2019s asset register or threat intelligence, host-side telemetry for the workstation (process responsible), the consistency of the interval across the whole capture, and a comparison against a baseline capture of the same segment. Report the finding with packet numbers and the captured artifacts, and state confidence honestly if host-side corroboration is unavailable.',
          hint: 'The capture proves the pattern; attribution needs more than the pattern.',
          explanation:
            'This is the professional standard for a beaconing claim: pattern evidence from the wire plus attribution evidence from context. Reporting the confidence level honestly is part of the finding, not a weakness.'
        }
      ],
      references: [
        {
          title: 'Wireshark User\u2019s Guide — Following Streams',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/ChAdvFollowStreamSection.html',
          note: 'Official Follow TCP/UDP Stream documentation.'
        },
        {
          title: 'Wireshark User\u2019s Guide',
          url: 'https://www.wireshark.org/docs/wsug_html_chunked/',
          note: 'Expert information, statistics and export features.'
        },
        {
          title: 'tshark — official man page',
          url: 'https://www.wireshark.org/docs/man-pages/tshark.html',
          note: 'Field extraction and --export-objects used in this lesson.'
        },
        {
          title: 'MITRE ATT&CK — Application Layer Protocol (T1071)',
          url: 'https://attack.mitre.org/techniques/T1071/',
          note: 'The adversary-technique framing of the C2 traffic you hunt for.'
        }
      ]
    }
  ]
};
