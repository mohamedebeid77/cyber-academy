import type { Module } from '../../../../types';

// LEVEL 4 — DISCOVERY & TRAFFIC ANALYSIS · Module n05: Network Discovery and Recon
// Original curriculum content for the Network Security & Pentesting Academy.
// All prose is original; commands follow the official Nmap Reference Guide
// (nmap.org/book). Every scanning technique is taught against lab targets you
// own or systems you are contractually authorized to test — scanning third-
// party networks without written permission is illegal in most jurisdictions.

export const n05: Module = {
  id: 'n05',
  title: 'Network Discovery and Recon',
  level: 4,
  description:
    'The recon and scanning core of network pentesting: a passive-first methodology, discovering live hosts with multiple probe types, every major Nmap TCP scan type and how to interpret the responses, version and OS detection with timing and output discipline, then NSE scripting, UDP scanning, DNS enumeration and turning it all into a network map.',
  outcomes: [
    'Plan reconnaissance as passive-first, then active within a defined scope',
    'Discover live hosts using ICMP, ARP and TCP/UDP probes and explain why some hosts stay silent',
    'Run and correctly interpret SYN, connect, FIN/null/Xmas and ACK scans',
    'Choose version detection, OS detection, timing and output options deliberately',
    'Use NSE and DNS enumeration to extend discovery into a service map'
  ],
  lessons: [
    {
      id: 'n05-l01',
      moduleId: 'n05',
      title: 'Recon Methodology: Passive vs Active',
      difficulty: 'Beginner',
      minutes: 14,
      prerequisites: ['n04-l01'],
      objectives: [
        'Define passive and active reconnaissance and what each reveals',
        'Explain the detection and opsec tradeoffs of each approach',
        'Build a repeatable recon workflow with scope and documentation first'
      ],
      diagram: 'net-recon-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Reconnaissance is the mapping phase before anything touches the target in earnest. The dividing line that organizes all of it is simple: passive recon never sends packets to the target itself — you learn from third parties (DNS records, certificate logs, registries, search engines) — while active recon sends packets the target (or its defenses) will see: ping sweeps, port scans, banner grabs. Passive is quiet and safe; active is accurate and noisy. Professional methodology uses passive first, organizes what it found, and only then spends the target\u2019s attention on active discovery.'
          },
          {
            type: 'p',
            text:
              'The ordering is not just stealth fashion. Passive sources frequently change your active plan: a certificate log reveals a test subdomain, registry data shows the real netblock, a public document leaks internal hostnames. Skipping the passive phase means burning scan traffic on a map you could have half-drawn for free.'
          },
          {
            type: 'p',
            text:
              'One opsec caveat keeps this honest: passive does not mean invisible to everyone. Third parties (DNS resolvers, certificate transparency operators, search engines) see and log your queries; you are simply not touching the target infrastructure. For an authorized engagement that distinction barely matters — what matters is the written scope that tells you where active testing may begin.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-recon-workflow',
            caption: 'Scope first, passive sources, organize, then scoped active discovery.'
          },
          {
            type: 'table',
            headers: ['Phase', 'Sources / actions', 'What it yields', 'Seen by target?'],
            rows: [
              ['Scope definition', 'Rules of engagement, IP ranges, domains, windows', 'The boundary everything else must respect', 'No'],
              ['Passive recon', 'whois/RDAP, DNS records, certificate transparency, search engines, docs metadata', 'Netblocks, subdomains, tech stack, naming conventions', 'No (third parties only)'],
              ['Organize', 'Notes, asset list, target matrix', 'A deduplicated, classified target list', 'No'],
              ['Active recon', 'Host discovery, port scans, service probes', 'Live hosts, open ports, service versions', 'Yes — every packet']
            ]
          },
          {
            type: 'p',
            text:
              'The MITRE ATT&CK framework formalizes this as the Reconnaissance tactic (TA0043), with techniques like Gather Victim Network Information (T1590) for the passive side and Active Scanning (T1595) for the active side. Mapping your recon actions to those techniques is good discipline: it forces you to ask what an adversary activity would look like to the defender, which is also what makes your findings believable in a report.'
          },
          {
            type: 'p',
            text:
              'Documentation is not bureaucracy — it is the product. Every recon note should capture: when, from where (your source address), what was sent, and what came back. That record makes results reproducible, defends against scope disputes, and becomes the evidence chain for the findings you will later claim.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Engagements are won or lost in recon. The classic failure modes are all methodology failures: scanning out of scope (a career-limiting event), scanning in scope but without a plan (noise, half the picture, wasted hours), or finding real assets and then losing them in messy notes. The passive/active split also maps to legal reality — active scanning without authorization is unlawful in most jurisdictions even when passive research is not.'
          },
          {
            type: 'list',
            items: [
              'Passive sources frequently expose assets the client forgot they own — report those, they are real findings',
              'Active recon defines your footprint: the client\u2019s SOC may be watching during your window',
              'A clean recon dataset (asset list with sources and dates) is half of the final deliverable'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Passive: netblocks and ASN ownership, subdomain sprawl, certificate transparency entries, tech stack hints in public docs',
              'Passive: naming conventions (vpn-, dev-, uat-, mail-) that predict where active effort pays off',
              'Active: which hosts answer at all, which ports respond, which services leak version banners',
              'Gaps: ranges the client listed that return nothing, and assets discovered that the client never listed'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'The scope line',
            text:
              'Passive research on public data is generally lawful. Active scanning is only lawful with authorization from the owner of the target. Write the scope down before the first packet leaves your machine — for this academy, that means lab ranges you own (10.x, 192.168.x, 172.16.x ranges in your own virtual networks).'
          },
          {
            type: 'p',
            text:
              'Practice the passive half against a lab or a domain you own: pull DNS records, resolve names, and read the certificate log entries. Then rehearse the handoff: turn what you learned into a target list for the active phase you will run in the next lessons.'
          },
          {
            type: 'terminal',
            title: 'Passive recon against a lab domain you own',
            lines: [
              '$ dig +short lab.example A',
              '192.168.56.20',
              '$ dig +short lab.example MX',
              '10 mail.lab.example.',
              '$ whois -h whois.arin.net 192.168.56.0 | head -4',
              '# Reserved block for private internet use (RFC 1918) — lab use only',
              '$ curl -s "https://crt.sh/?q=lab.example&output=json" | grep -o "common_name[^,]*" | sort -u | head -5',
              '"common_name":"lab.example"',
              '"common_name":"vpn.lab.example"'
            ]
          },
          {
            type: 'p',
            text:
              'The certificate transparency query is the pattern to remember: a third party (the CT log) just handed you a subdomain (vpn.lab.example) you had no other way to know. That single hostname can redirect your entire active phase.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A worked lab scenario: your scope is 192.168.56.0/24 plus lab.example. Passive work yields web, mail, vpn and dev hostnames from DNS and CT logs. Resolving them maps four known addresses — but the subnet has more hosts that never got names. The recon note writes itself: four named services to check first, one unexplained /24 to sweep in the active phase. That is the workflow: sources, resolve, deduplicate, classify, then scan what is authorized.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Phase', 'Role'],
            rows: [
              ['dig / nslookup', 'Passive', 'DNS record gathering and resolution against public or lab resolvers'],
              ['whois / RDAP', 'Passive', 'Registry data: ownership, netblocks, contacts'],
              ['crt.sh (certificate logs)', 'Passive', 'Subdomain discovery from certificate transparency'],
              ['curl', 'Passive', 'Fetch and parse public JSON sources'],
              ['nmap', 'Active', 'Every active discovery step in the following lessons'],
              ['Notes app / Markdown file', 'All', 'The dataset that becomes the report']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Starting with nmap because it is famous — passive sources often redirect the active phase entirely',
              'Assuming scope from a domain name alone; one domain can live on ten netblocks, and one netblock can host ten clients',
              'Treating passive recon as undetectable: third parties log your lookups, and client-side artifacts (your browser) touch targets',
              'Recording raw output without conclusions — notes without interpretation are not evidence',
              'Skipping the write-down of your own source IP; when the SOC asks "who was 203.0.113.7" you need to answer in seconds'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Create a recon notes template with five fields: date, source, query, result, conclusion. Run a passive-only session against your own lab domain, fill the template, and finish with a one-paragraph active-phase plan that names exactly which ranges and hosts you intend to touch and why.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Passive = no packets to the target; active = every packet visible to the target and its defenders',
              'Order matters: scope, then passive, then organize, then active within written authorization',
              'MITRE ATT&CK (TA0043, T1590, T1595) gives you the professional vocabulary for both halves',
              'The deliverable of recon is a documented, deduplicated, sourced target list — not a pile of tool output'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n05-l01-q1',
          type: 'mcq',
          prompt: 'Which of these actions is passive reconnaissance?',
          options: [
            'Querying a public certificate transparency log for subdomains of the target domain',
            'Running a TCP SYN scan against the target web server',
            'Sending UDP probes to the target DNS server',
            'Attempting a zone transfer against the target\u2019s authoritative name server'
          ],
          answerIndex: 0,
          hint: 'Ask where the packets go: to the target, or to a third party?',
          explanation:
            'Certificate transparency lookups query logs held by third parties — the target infrastructure never sees a packet. Scans and zone-transfer attempts send traffic to target systems, making them active.'
        },
        {
          id: 'n05-l01-q2',
          type: 'truefalse',
          prompt: 'Passive reconnaissance leaves no trace of any kind anywhere.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who else besides the target can observe your queries?',
          explanation:
            'Passive means the target infrastructure is not touched, but third parties — DNS resolvers, CT log services, search engines — see and may log your queries. The distinction is about where packets go, not about total invisibility.'
        },
        {
          id: 'n05-l01-q3',
          type: 'short',
          prompt: 'List, in order, the four phases of the recon workflow taught in this lesson and state what each produces.',
          modelAnswer:
            '1) Scope definition — the written boundary of ranges, domains and testing windows. 2) Passive recon — netblocks, subdomains, tech hints from third-party sources. 3) Organize — a deduplicated, classified target list with sources and dates. 4) Active recon — host discovery and service probing, only against what the scope authorizes.',
          hint: 'Everything before the first scan, and then the scan.',
          explanation:
            'The sequence exists to make active work targeted and defensible: scope protects you legally, passive redirects effort, organization preserves evidence, and active spends the target\u2019s attention deliberately.'
        },
        {
          id: 'n05-l01-q4',
          type: 'scenario',
          prompt:
            'Halfway through an authorized test you discover a live web server at an IP just outside the documented scope. A colleague says "it is probably the client\u2019s anyway, scan it". What is the correct action and why?',
          modelAnswer:
            'Stop: do not scan it. Out-of-scope means unauthorized even if ownership seems likely — active testing without permission is unlawful and voids the engagement\u2019s protections. Correct action: record the observation (address, how discovered, timestamp), notify the engagement lead, and ask the client to confirm or expand the scope in writing. If the client confirms, add the range to the scope document and proceed; if not, note it as an observation only.',
          hint: 'What protects you on an engagement — intent or paperwork?',
          explanation:
            'Scope discipline is the professional line between pentesting and unauthorized access. Discovering adjacent assets is valuable intel; acting on them without written confirmation is how testers end up in legal trouble.'
        }
      ],
      references: [
        {
          title: 'NIST SP 800-115 — Technical Guide to Information Security Testing and Assessment',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-115/final',
          note: 'Official methodology: rules of engagement, planning and discovery phases.'
        },
        {
          title: 'MITRE ATT&CK — Active Scanning (T1595)',
          url: 'https://attack.mitre.org/techniques/T1595/',
          note: 'The adversary-technique framing of the active half of recon.'
        },
        {
          title: 'MITRE ATT&CK — Gather Victim Network Information (T1590)',
          url: 'https://attack.mitre.org/techniques/T1590/',
          note: 'The adversary-technique framing of the passive half of recon.'
        }
      ]
    },
    {
      id: 'n05-l02',
      moduleId: 'n05',
      title: 'Host Discovery: Finding Live Systems',
      difficulty: 'Beginner',
      minutes: 17,
      prerequisites: ['n05-l01'],
      objectives: [
        'Explain why ICMP pings alone undercount live hosts',
        'Use nmap -sn with ARP, ICMP, TCP and UDP probes and interpret the output',
        'Describe the situations in which hosts do not respond and what that means for your results'
      ],
      diagram: 'net-arp-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Before you can scan ports, you need to know which machines exist. Host discovery sends a small, cheap probe to every address in a range and records who answers. The trap that bites every beginner: ping is one probe type, and modern networks routinely filter ICMP echo. A range that "pings nothing" can easily contain five servers — they simply do not answer echo requests. Professional host discovery therefore sends several probe types and lets each host answer whichever one it is willing to.'
          },
          {
            type: 'p',
            text:
              'The strongest probe on your own local segment is ARP. A machine cannot use IPv4 on a LAN without answering ARP requests, so an ARP-based sweep finds every live IP on the segment — even hosts that drop every other probe type. Across routers, ARP does not work, and you fall back to ICMP variants, TCP SYN or ACK probes to likely-open ports, and UDP probes that provoke error replies from closed ports.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'In nmap, host discovery is what runs before port scanning unless you disable it. The flag -sn means "ping scan, do not port scan" — enumerate live hosts only. The probe types stack: -PE (ICMP echo), -PP (ICMP timestamp), -PM (ICMP netmask request), -PS portlist (TCP SYN probes to the given ports, default 80), -PA portlist (TCP ACK probes — many stateless rules allow ACK-flagged packets through), -PU portlist (UDP probes to closed high ports, where an ICMP port-unreachable reply proves the host is up), and -PR (ARP scan, used automatically for targets on the local Ethernet segment).'
          },
          {
            type: 'table',
            headers: ['Probe', 'Flag', 'Works because', 'Fails when'],
            rows: [
              ['ICMP echo', '-PE', 'Standard ping reply on most hosts', 'Firewalls drop echo requests (common on servers)'],
              ['ICMP timestamp/netmask', '-PP / -PM', 'Different ICMP types slip past echo-only filters', 'All ICMP is filtered'],
              ['TCP SYN', '-PS80,443', 'Live services answer SYN with SYN/ACK', 'Probe ports are not listening and the host stays silent'],
              ['TCP ACK', '-PA80,443', 'Firewalls pass ACKs and the stack answers with RST', 'Stateful devices drop unsolicited ACKs'],
              ['UDP', '-PU high port', 'Closed UDP port replies ICMP port-unreachable', 'Rate-limited ICMP or all ports filtered'],
              ['ARP', '-PR', 'Mandatory for any IPv4 host on the segment', 'Only works on the local L2 segment (no routing)']
            ]
          },
          {
            type: 'p',
            text:
              'Privilege matters more than people expect. Run as root (or Administrator), nmap sends raw packets and reports precise reasons. Run unprivileged, nmap cannot craft raw packets, so -sn falls back to a full TCP connect scan to ports 80 and 443 for each host — slower, noisier, and blind to ICMP-only hosts. Always run discovery with the privileges you need, and record which probe set you used.'
          },
          {
            type: 'p',
            text:
              'Why hosts stay silent is a finding in itself: host-based firewalls, IDS suppression, filtered probe ports, or simply a machine that is genuinely down. The professional response is not "no answer, no host" — it is "no answer to this probe set; here is what I will try next".'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'MITRE ATT&CK calls this Remote System Discovery (T1018), and the stakes are simple: whatever your discovery misses does not get tested. Undercounting live hosts is one of the most common ways an engagement leaves real findings on the table. Conversely, discovery traffic is the noisiest phase of a scan — a full ARP sweep or SYN sweep lights up monitoring, so in sensitive environments you choose probe sets deliberately and document the tradeoff.'
          },
          {
            type: 'list',
            items: [
              'Local segments: rely on ARP (-PR or arp-scan) — it is as close to ground truth as discovery gets',
              'Routed ranges: combine -PE -PS with ports you know the environment runs (445, 3389 are common)',
              'Always note the probe set and timestamp per range; mixed-method results need explanation later'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Hosts that answer TCP probes but never ICMP — firewalled servers, and a hint the network filters echo',
              'Address ranges the client documented as empty that keep answering ARP',
              'New MAC addresses appearing between sweeps (DHCP churn, rogue devices)',
              'Entries in the local ARP cache (ip neigh) from earlier work that you can validate cheaply',
              'Ranges where discovery succeeds but every port scan comes back filtered — a boundary device to investigate'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Sweep only your lab',
            text:
              'Host discovery sweeps are active scanning. Run them only on lab ranges or hosts in your written scope — sweeping a shared or third-party network can disrupt it and is unlawful.'
          },
          {
            type: 'p',
            text:
              'Run the same range with different probe sets and compare. The differences are the lesson: each tool and probe sees a different slice of the network.'
          },
          {
            type: 'terminal',
            title: 'Comparing discovery probes on a lab segment',
            lines: [
              '$ sudo nmap -sn -PE 192.168.56.0/24',
              'Nmap scan report for 192.168.56.1',
              'Host is up (0.00042s latency).',
              'Nmap scan report for 192.168.56.20',
              'Host is up (0.00038s latency).',
              'Nmap done: 256 IP addresses (2 hosts up) scanned in 2.10 seconds',
              '$ sudo nmap -sn -PR 192.168.56.0/24',
              'Nmap scan report for 192.168.56.1',
              'Host is up (0.00021s latency).',
              'Nmap scan report for 192.168.56.10',
              'Host is up (0.00035s latency).',
              'Nmap scan report for 192.168.56.20',
              'Host is up (0.00030s latency).',
              'Nmap done: 256 IP addresses (3 hosts up) scanned in 1.87 seconds',
              '$ sudo arp-scan --interface eth1 --localnet',
              'Interface: eth1, type: EN10MB, MAC: 08:00:27:aa:bb:cc, IPv4: 192.168.56.10',
              '192.168.56.1   0a:00:27:00:00:01  PCS Systemtechnik GmbH',
              '192.168.56.20  08:00:27:11:22:33  PCS Systemtechnik GmbH',
              '2 packets received by filter, 0 packets dropped by kernel'
            ]
          },
          {
            type: 'p',
            text:
              'In this lab run, ICMP echo found two hosts but the ARP sweep found a third (192.168.56.10) that filters echo requests. That gap — echo-only versus ARP — is exactly the undercount you must avoid in real work.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A realistic scenario: a client says "we have about eight servers on 10.10.10.0/24". A plain ping sweep finds two. Re-running with -PS22,445,3389 finds six, and an ARP scan from a host on the segment finds the full eight plus an unmanaged device nobody documented. The report now contains two findings: discovery controls filter ICMP (good) and an undocumented host is live on a server segment (interesting). Both came from choosing probes deliberately.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Strength'],
            rows: [
              ['nmap -sn', 'Composable probe sets, consistent output, scales from one host to thousands'],
              ['arp-scan', 'Fast, dedicated ARP sweeps of the local segment with vendor MAC lookup'],
              ['netdiscover', 'Passive-plus-active ARP watcher, good for quick lab overviews'],
              ['ip neigh / arp -a', 'Read the kernel\u2019s own ARP cache — free discovery data from prior traffic'],
              ['ping', 'The basic connectivity check; never the whole answer']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Equating "no ping reply" with "no host" — filtered ICMP is the norm on hardened networks',
              'Running nmap unprivileged and silently getting the TCP-connect fallback instead of raw probes',
              'Using -Pn everywhere "because discovery misses things" — it marks every address up and multiplies scan time and noise',
              'Forgetting that ARP discovery does not cross routers; routed ranges need TCP/UDP/ICMP probes',
              'Reporting a host count without naming the probe set and time of day'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your lab segment, run four sweeps and log the host counts: (1) -sn -PE, (2) -sn -PS22,445,3389, (3) -sn -PR, (4) arp-scan. Add one lab host with a firewall that drops ICMP and re-run. Your notes now demonstrate, with your own numbers, why multi-probe discovery is standard practice.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              '-sn means discovery only: no port scan, just alive/not-alive',
              'ARP is ground truth on the local segment; TCP SYN/ACK and UDP probes cover routed ranges',
              'Non-response is data: firewalled hosts, filtered ports, or genuinely down — record which probe failed',
              'Privilege changes nmap behavior: run discovery as root or accept the connect-scan fallback'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n05-l02-q1',
          type: 'mcq',
          prompt: 'Which nmap invocation performs host discovery only, with no port scanning?',
          options: ['nmap -sn 192.168.56.0/24', 'nmap -sS 192.168.56.0/24', 'nmap -Pn 192.168.56.0/24', 'nmap -sU 192.168.56.0/24'],
          answerIndex: 0,
          hint: 'The flag literally means "no port scan", historically called a ping scan.',
          explanation:
            '-sn disables the port-scanning phase and only determines which hosts are up (using the selected host-discovery probes). -sS and -sU are scan types; -Pn skips discovery entirely and treats all hosts as up.'
        },
        {
          id: 'n05-l02-q2',
          type: 'truefalse',
          prompt: 'Every live host on an IPv4 network must answer ICMP echo requests.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What do server host firewalls typically do with ping?',
          explanation:
            'ICMP echo is routinely blocked on hardened hosts and networks. Hosts must answer ARP on their local segment (to use IPv4 at all), but they are free to ignore echo requests — which is why multi-probe discovery exists.'
        },
        {
          id: 'n05-l02-q3',
          type: 'short',
          prompt: 'Explain why an ARP-based scan is the most reliable discovery method on the local segment, and name its limitation.',
          modelAnswer:
            'Any host that wants to use IPv4 on a LAN must answer ARP requests for its own IP so neighbors can build L2-to-IP mappings; it cannot communicate otherwise, so filtering ARP out is not practical. Limitation: ARP is not routed — it only discovers hosts on the same L2 segment, so it cannot cross a router to find hosts on other subnets.',
          hint: 'What protocol must every IPv4 host on the wire participate in?',
          explanation:
            'ARP is mandatory machinery for local IPv4 operation, which makes it close to ground truth locally. Its scope ends at the router — beyond that you need TCP, UDP or ICMP probes.'
        },
        {
          id: 'n05-l02-q4',
          type: 'scenario',
          prompt:
            'Your ICMP sweep of an authorized /24 found 2 hosts, but the client says the range holds about 50. Describe your next two steps and what you will report about the first sweep.',
          modelAnswer:
            'Step 1: re-run discovery with a broader probe set — nmap -sn -PS21,22,80,445,3389 -PA80 -PU53,161 plus an ARP sweep from any host on that segment (arp-scan or nmap -PR). Step 2: compare results, investigate the differences (filtered ICMP vs filtered TCP vs genuinely down), and consider passive evidence like the local ARP cache and DHCP logs. Report: the first ICMP-only sweep was a probe-limited measurement, not a host count; document both sweep configurations, timestamps, and the reconciled host list so the client can see why the numbers differ.',
          hint: 'One probe type, one slice of the answer. What else can you try?',
          explanation:
            'The professional pattern is probe escalation plus documentation: mixed-method discovery reconciles the count, and the report explains methodology so the numbers are defensible.'
        }
      ],
      references: [
        {
          title: 'Nmap Reference Guide — Host Discovery',
          url: 'https://nmap.org/book/man-host-discovery.html',
          note: 'Official semantics of -sn, -PS/-PA/-PU, -PE/-PP/-PM and -PR.'
        },
        {
          title: 'MITRE ATT&CK — Remote System Discovery (T1018)',
          url: 'https://attack.mitre.org/techniques/T1018/',
          note: 'How discovery maps to documented adversary behavior.'
        },
        {
          title: 'arp-scan — official project (Roy Hills)',
          url: 'https://github.com/royhills/arp-scan',
          note: 'The dedicated ARP sweep tool used in this lesson\u2019s examples.'
        }
      ]
    },
    {
      id: 'n05-l03',
      moduleId: 'n05',
      title: 'Nmap TCP Port Scanning Deep Dive',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['n05-l02'],
      objectives: [
        'Explain the packet behavior of SYN and connect scans and when each is appropriate',
        'Use FIN, null, Xmas and ACK scans and state exactly what each can and cannot determine',
        'Interpret open, closed, filtered and unfiltered states correctly',
        'Explain why SYN scanning requires raw-socket privileges'
      ],
      diagram: 'net-tcp-scan-flags',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A TCP port scan is a conversation with the target\u2019s TCP stack, not with its applications. You send handcrafted packets, the stack answers according to the TCP state machine, and the pattern of replies tells you whether a port is open, closed, or hidden behind a firewall. Master this and port scan output stops being a wall of flags and becomes a story about the target\u2019s network defenses.'
          },
          {
            type: 'p',
            text:
              'The default professional choice is the SYN scan (-sS): send SYN, watch for SYN/ACK (open) or RST (closed), and abort with an RST before the handshake ever completes. It is fast, quiet, and accurate. But every scan type exists because some situation defeats the default — a firewall that only passes certain flag combinations, a logging regime you want (or do not want) to appear in, or the need to map firewall rules rather than services. That is what FIN/null/Xmas and ACK scans are for.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'SYN scan (-sS) needs raw sockets: nmap crafts packets with chosen flags and sniffs the replies, which is why it requires root or Administrator privileges. An unprivileged nmap silently falls back to the connect scan (-sT), which uses your OS to perform a full three-way handshake on every probe. Connect scans are accurate and leave complete connections in the target\u2019s application logs — sometimes that is exactly what you want (a test that looks like a normal client), sometimes not.'
          },
          {
            type: 'diagram',
            id: 'net-tcp-scan-flags',
            caption: 'Which flags each scan sets, and how the target stack replies.'
          },
          {
            type: 'compare',
            title: 'The same open port, two scans',
            beforeTitle: 'SYN scan (-sS, raw sockets)',
            beforeCode:
              'nmap -> target : SYN        (seq=x)\ntarget -> nmap : SYN,ACK    (seq=y, ack=x+1)\nnmap -> target : RST        # handshake aborted,\n                            # no connection exists\n# needs root; nothing logs a connection',
            afterTitle: 'Connect scan (-sT, OS sockets)',
            afterCode:
              'nmap -> target : SYN\ntarget -> nmap : SYN,ACK\nnmap -> target : ACK        # full handshake\nnmap -> target : FIN/RST    # then closes\n# no root needed; app + conntrack\n# log a completed connection'
          },
          {
            type: 'p',
            text:
              'The stealth-flavored scans — FIN (-sF), null (-sN, no flags) and Xmas (-sX, FIN+PSH+URG) — exploit an asymmetry in RFC 9293 behavior: a closed port must reply RST to these odd packets, while many stacks simply ignore them when the port is open. The result: closed ports identify themselves, open ones stay silent, and nmap reports open|filtered for the silent ones. Their classic use was slipping past simple stateless filters and loggers that look for SYN; modern stateful firewalls and hosts log them just fine, and Windows (plus some network devices) reply RST to everything, which makes these scans useless there. They are situation tools, not defaults.'
          },
          {
            type: 'p',
            text:
              'The ACK scan (-sA) never determines port state at all. It sends bare ACK packets; open and closed ports both respond with RST (meaning "unfiltered" — reachable), while firewalls that drop the probe leave "filtered". Its real job is mapping firewall rulesets: run it after a SYN scan and the difference between the two results is your picture of what the filtering device passes. Combined with the window scan (-sW, which reads the TCP window value of those RSTs), it can even distinguish open from closed on some stacks.'
          },
          {
            type: 'table',
            headers: ['Scan', 'Flags sent', 'Open port', 'Closed port', 'Filtered', 'Needs root'],
            rows: [
              ['SYN (-sS)', 'SYN', 'SYN/ACK', 'RST', 'No response or ICMP unreachable', 'Yes'],
              ['Connect (-sT)', 'Full handshake', 'Connection completes', 'RST/ACK to SYN', 'No response', 'No'],
              ['FIN (-sF)', 'FIN', 'No response (open|filtered)', 'RST', 'No response (open|filtered)', 'Yes'],
              ['Null (-sN)', 'None', 'No response (open|filtered)', 'RST', 'No response (open|filtered)', 'Yes'],
              ['Xmas (-sX)', 'FIN,PSH,URG', 'No response (open|filtered)', 'RST', 'No response (open|filtered)', 'Yes'],
              ['ACK (-sA)', 'ACK', 'RST (unfiltered)', 'RST (unfiltered)', 'No response (filtered)', 'Yes']
            ]
          },
          {
            type: 'p',
            text:
              'Reading the output honestly is the skill: "open" means the stack answered as an open port; "closed" means something answered "nothing listens here"; "filtered" means a firewall or routing rule blocked the probe and nmap cannot tell what is behind it; "unfiltered" (ACK scan only) means reachable, with no claim about open or closed. Confusing filtered with closed — or reporting open|filtered as open — are the two interpretation errors reviewers catch first.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'MITRE ATT&CK tags this activity as Network Service Scanning (T1046). Scan choice is a professional judgment call: SYN scan for breadth and speed, connect scan when you must run unprivileged or want a normal-client footprint, FIN-family scans to probe how a stateless filter or an odd device treats non-SYN probes, ACK scan to sketch the firewall ruleset before you spend time on services. On engagements you will often run two types over the same range precisely to compare the answers.'
          },
          {
            type: 'list',
            items: [
              'A port that is filtered to SYN but unfiltered to ACK tells you the firewall drops SYNs specifically',
              'Windows targets respond RST to FIN/null/Xmas probes regardless of state — do not burn time there with them',
              'Connect scans appear in service logs: useful for pre-texting, and a consideration when noise matters'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Filtered ports adjacent to open ones — that shape usually maps a real firewall policy',
              'Services on nonstandard ports (open 8081, 10000, 5900) that default scans might deprioritize',
              'Differences between your SYN and ACK results — the fingerprint of the filtering device',
              'Hosts where every port is filtered: a hardened host or a silent segment worth a targeted second look',
              'Scan-consistency clues: same services answering on multiple hosts suggests a golden image'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scan your lab, nothing else',
            text:
              'Port scanning is a legally sensitive activity: unauthorized scanning has been prosecuted as attempted unauthorized access in multiple jurisdictions. All examples here run against lab hosts you own.'
          },
          {
            type: 'p',
            text:
              'Run the four canonical scans against one lab host and read the differences. Then verify on the wire with tcpdump — seeing the actual flags removes all mystery about what each scan does.'
          },
          {
            type: 'terminal',
            title: 'Four scans, one target, read the states',
            lines: [
              '$ sudo nmap -sS 192.168.56.20',
              'Not shown: 996 closed tcp ports (reset)',
              'PORT     STATE    SERVICE',
              '22/tcp   open     ssh',
              '25/tcp   filtered smtp',
              '80/tcp   open     http',
              '8080/tcp open     http-proxy',
              '$ sudo nmap -sA 192.168.56.20',
              'PORT     STATE      SERVICE',
              '22/tcp   unfiltered ssh',
              '25/tcp   filtered   smtp',
              '80/tcp   unfiltered http',
              '8080/tcp unfiltered http-proxy',
              '$ sudo tcpdump -i eth1 -nn "tcp[tcpflags] & tcp-syn != 0 and host 192.168.56.20"',
              '12:04:51.220133 IP 192.168.56.10.43122 > 192.168.56.20.80: Flags [S], seq 1234567890, win 1024, length 0',
              '12:04:51.220311 IP 192.168.56.20.80 > 192.168.56.10.43122: Flags [S.], seq 887766554, ack 1234567891, win 64240, length 0',
              '12:04:51.220402 IP 192.168.56.10.43122 > 192.168.56.20.80: Flags [R], seq 1234567891, length 0'
            ]
          },
          {
            type: 'p',
            text:
              'Read the pair of results like a pentester: 25/tcp is filtered to both scans (a real block), while 22, 80 and 8080 are unfiltered to ACK but open to SYN — normal services. The tcpdump lines show the whole SYN scan story: SYN, SYN/ACK, and the scanner\u2019s RST aborting the handshake.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Lab exercise that cements it: leave MySQL listening on 3306 and add an iptables rule on the target that drops incoming SYNs to that port but passes other packets. A SYN scan reports 3306/tcp filtered (the SYN never arrives). An ACK scan reports it unfiltered (the ACK passes and the stack answers RST). A FIN scan reports open|filtered (the FIN passes the rule and the listening MySQL ignores it, exactly as open stacks treat FIN probes). Three scans, three views of one rule — that comparison, written down, is the deliverable.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Confirm before you claim',
            text:
              'Scan states are evidence, not verdicts. When a finding depends on a port being open (say, a management interface), confirm with a version probe (-sV, next lesson) or a manual connection before it goes in the report.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['nmap', 'Every scan type here; --reason shows which packet produced each conclusion'],
              ['tcpdump', 'Watch the actual flags on the wire while you scan'],
              ['Wireshark', 'Post-hoc analysis of scan captures (module n06 makes you fluent)'],
              ['hping3', 'Handcraft individual probe packets when you need one exact flag combination'],
              ['iptables / nftables', 'Build the lab firewall behaviors the scans are meant to reveal']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting filtered ports as closed (or open|filtered as open) — the states mean different things',
              'Running -sT as root out of habit: it completes handshakes, is slower, and fills application logs',
              'Using FIN/null/Xmas scans against Windows targets and trusting the results (they RST everything)',
              'Assuming an ACK scan found "open" ports — it cannot; unfiltered means reachable only',
              'Treating one scan as ground truth: two scan types that disagree are information, not noise'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a lab target, close every port except 22 and 80, then add a rule dropping SYNs to 8080 (with nothing listening there). Run -sS, -sF and -sA against the host, and write one sentence per port explaining the state each scan reported and why. Verify at least one conclusion with tcpdump.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SYN scan: raw sockets, half-open probes, fast and default; connect scan: full handshake, unprivileged fallback',
              'FIN/null/Xmas exploit open-port silence vs closed-port RST; useless on Windows, flagged by modern logging',
              'ACK scan maps firewall reachability (unfiltered vs filtered), never port state',
              'open / closed / filtered / unfiltered are distinct claims — report them precisely'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n05-l03-q1',
          type: 'mcq',
          prompt: 'During a SYN scan (-sS) of an open port, what does nmap send after receiving the SYN/ACK?',
          options: ['A final ACK completing the handshake', 'An RST aborting the handshake', 'FIN, PSH and URG flags', 'Nothing at all'],
          answerIndex: 1,
          hint: 'The scan is called "half-open" for a reason.',
          explanation:
            'SYN scan classifies the port from the SYN/ACK (or RST) and immediately sends RST to tear the half-open connection down. The three-way handshake never completes, so no application-level connection exists.'
        },
        {
          id: 'n05-l03-q2',
          type: 'mcq',
          prompt: 'What can an ACK scan (-sA) determine about a port?',
          options: [
            'Whether the port is open or closed',
            'Only whether the port is reachable through filtering (unfiltered) or blocked (filtered)',
            'The version of the listening service',
            'Whether the host\u2019s operating system is Windows'
          ],
          answerIndex: 1,
          hint: 'Both open and closed ports answer bare ACK packets the same way.',
          explanation:
            'Open and closed ports both respond to unsolicited ACKs with RST, which nmap labels unfiltered. Only filtering devices produce the filtered result. ACK scan is a firewall-ruleset mapper, not a service scanner.'
        },
        {
          id: 'n05-l03-q3',
          type: 'truefalse',
          prompt: 'A SYN scan requires root or Administrator privileges because nmap must craft raw packets and sniff raw replies.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What can an unprivileged user process NOT do with TCP packets?',
          explanation:
            'Building arbitrary-flag packets and reading responses outside your own connections requires raw socket access. Unprivileged nmap runs fall back to the connect scan (-sT) using the OS network stack.'
        },
        {
          id: 'n05-l03-q4',
          type: 'short',
          prompt: 'A SYN scan reports 3389/tcp filtered. In one or two sentences, state what that means and why it is not the same as closed.',
          modelAnswer:
            'Filtered means nmap received no response (or an ICMP unreachable) for the probe, so a firewall or routing rule is suppressing the traffic — the scan cannot tell whether anything listens behind it. Closed would mean the host itself answered with RST, proving the machine is up but nothing listens on that port.',
          hint: 'Who stayed silent: the host, or something in between?',
          explanation:
            'The distinction drives recommendations: closed ports need no action, filtered ports point at policy (either intended hardening or inconsistent rules worth reviewing with the client).'
        },
        {
          id: 'n05-l03-q5',
          type: 'scenario',
          prompt:
            'Against an authorized host, -sS shows 22 open and 445, 3389, 5985 all filtered, while -sA shows those same three ports unfiltered. What does the combination suggest, and how do you verify it?',
          modelAnswer:
            'The combination suggests a firewall that specifically drops SYN packets to the Windows-remote-management ports while passing other flag combinations — the ports are reachable, but new connections are blocked at the boundary. That is characteristic of a stateful or SYN-filtering rule set. Verification: re-run -sF or -sX against those ports (if the stack ignores FIN-family probes when open, silence means open|filtered rather than RST), check whether a -sT connect scan completes, and inspect the firewall or capture traffic with tcpdump to see which direction is being dropped.',
          hint: 'Compare what the two scans asked and what each was allowed to learn.',
          explanation:
            'Divergent results across scan types are exactly how firewall rules get mapped in practice: the ACK scan probes policy, the SYN scan probes services, and the difference is the rule.'
        }
      ],
      references: [
        {
          title: 'Nmap Reference Guide — Port Scanning Techniques',
          url: 'https://nmap.org/book/man-port-scanning-techniques.html',
          note: 'Official semantics of -sS, -sT, -sA, -sF, -sN, -sX and the state labels.'
        },
        {
          title: 'Nmap Reference Guide — Port Scanning Options',
          url: 'https://nmap.org/book/man-port-scanning-options.html',
          note: 'Port ranges, exclusions, --reason and scan-order options.'
        },
        {
          title: 'RFC 9293 — Transmission Control Protocol (TCP) Specification',
          url: 'https://datatracker.ietf.org/doc/html/rfc9293',
          note: 'The state machine rules (RST behavior, flag handling) that scans exploit.'
        },
        {
          title: 'MITRE ATT&CK — Network Service Scanning (T1046)',
          url: 'https://attack.mitre.org/techniques/T1046/',
          note: 'The adversary-technique framing of port scanning.'
        }
      ]
    },
    {
      id: 'n05-l04',
      moduleId: 'n05',
      title: 'Nmap Service, Version and OS Detection, Timing and Output',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n05-l03'],
      objectives: [
        'Explain how -sV identifies service versions and how to control its depth',
        'Describe OS detection (-O) and the confidence limits of fingerprinting',
        'Choose timing templates (T0-T5) and rate options deliberately',
        'Pick the right output formats (-oN, -oX, -oG, -oA) for evidence and tooling'
      ],
      diagram: 'net-nmap-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An open port tells you a door exists; version detection tells you what is behind it. Nmap -sV talks to each open service long enough to fingerprint the product and version — and version strings are what turn a scan into an assessment, because "OpenSSH 8.9p1" can be checked against known issues while "22/tcp open ssh" cannot. This lesson also covers the two disciplines that make scans professional instead of accidental: timing (speed vs accuracy vs impact) and output (evidence you can hand to parsers and reviewers).'
          },
          {
            type: 'p',
            text:
              'The overarching principle: every scan option is a trade. Aggressive timing saves minutes and costs accuracy and load. Deep version detection buys detail and sends more probes. A rich output format costs nothing and saves you later. Choosing these deliberately — per target, per situation — is the difference between running nmap and doing network recon.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Version detection (-sV) works through nmap-service-probes: a database of probe payloads and match expressions. Nmap first waits for any banner the service sends on connect (many services greet immediately), then sends the probe signatures appropriate for that port, matching responses against regular expressions to extract product, version, CPE, and sometimes hostname or OS details. The --version-intensity 0-9 knob (default 7) controls how many probes get tried; --version-light is intensity 2 (fast, common probes) and --version-all is 9. Heavier intensity finds more, slower, and shakes more logs.'
          },
          {
            type: 'p',
            text:
              'OS detection (-O) is TCP/IP stack fingerprinting: nmap sends a series of crafted probes (unusual TCP option combinations, ECN, null-flag packets, UDP to a closed port, ICMP) and compares the target\u2019s responses against the nmap-os-db signature database. It needs at least one open and one closed TCP port to work well; --osscan-limit skips hosts that cannot produce a real fingerprint and --osscan-guess forces nmap to print its best guess when no signature matches cleanly. Always read OS output as "high/low confidence guess", never fact. The -A flag bundles aggressive mode: version detection, OS detection, default scripts and traceroute in one convenient (and loud) package.'
          },
          {
            type: 'table',
            headers: ['Template', 'Name', 'Behavior', 'Use when'],
            rows: [
              ['-T0', 'paranoid', 'Serial probes, waits 5 minutes between probes', 'Evading alerting — rarely practical, extremely slow'],
              ['-T1', 'sneaky', 'Serial probes, waits 15 seconds between probes', 'Very quiet authorized testing'],
              ['-T2', 'polite', 'Serializes probes and lightens load on the target', 'Fragile legacy systems'],
              ['-T3', 'normal', 'Default parallelism and timeouts', 'Standard lab and most engagement work'],
              ['-T4', 'aggressive', 'Faster timeouts and parallelism for reliable networks', 'Healthy lab networks, large scopes, -A scans'],
              ['-T5', 'insane', 'Maximum speed; short timeouts drop responses', 'Rarely — expect missed ports and wrong conclusions']
            ]
          },
          {
            type: 'p',
            text:
              'Between templates and fine control sit the rate options: --min-rate and --max-rate clamp packets per second, --min-parallelism raises outstanding probes for big ranges, --max-retries caps retransmissions, --host-timeout abandons stubborn hosts, and --scan-delay paces probes to chatty or fragile devices. The pattern: use a template for intent, then one or two rate options for the specific environment. T5 on a production network is not aggressive testing, it is a self-inflicted incident and an unreliable result.'
          },
          {
            type: 'p',
            text:
              'Output discipline: -oN writes human-readable normal output, -oX writes machine-readable XML (run metadata, precise host/port/Version records — what parsers and report tooling ingest), -oG writes the legacy grepable format (convenient for quick grepping, but it omits detail, so never treat it as complete evidence), and -oA basename writes all three at once (basename.nmap, basename.xml, basename.gnmap). Add --reason to have nmap record which packet justified each state conclusion.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Version strings feed everything downstream: vulnerability mapping, default-credential checks, exploit selection. Timing choices are engagement choices — the same scan that is routine in a lab is an availability incident on a fragile production switch. And output formats are your evidence chain: reviewers and tools consume the XML, clients read the normal output, and the grepable file feeds quick triage scripts. Producing all three in one run (-oA) is the habit that separates organized testers from tool operators.'
          },
          {
            type: 'list',
            items: [
              'Version detection failures are informative: a service that refuses probes may be hardened, proxied, or unusual',
              'Low-confidence OS guesses belong in notes, not in report conclusions',
              'Keep scan metadata (time, source, flags, timing) with every output file — it is what makes results reproducible'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Version strings with known-vulnerable releases (old OpenSSH, exposed admin panels, legacy ftp/smtp daemons)',
              'Version probes answered on unexpected ports — a service hiding from port-based assumptions',
              'Inconsistent versions across identical hosts (patch drift, or a rogue machine)',
              'OS fingerprints that contradict the asset register (a "Windows" box fingerprinting as Linux is worth a question)',
              'Services where -sV returns generic results: proxies, TLS-wrapped ports, or custom daemons to investigate manually'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Loud scans on your own lab',
            text:
              'Version and OS detection send many probes per port and -A bundles traceroute and scripts. Reserve aggressive settings for lab hosts and explicitly authorized windows — on anything else, agree timing with the owner first.'
          },
          {
            type: 'p',
            text:
              'Run one deliberate, well-documented scan of a lab host and produce the full output set. The command below is a sensible default shape: version detection with light intensity (fewer probes), OS detection, default timing, all outputs.'
          },
          {
            type: 'terminal',
            title: 'One deliberate scan, three evidence files',
            lines: [
              '$ sudo nmap -sV --version-light -O -T3 -oA labweb 192.168.56.20',
              'Starting Nmap 7.94 ( https://nmap.org )',
              'Nmap scan report for 192.168.56.20',
              'Host is up (0.00035s latency).',
              'PORT   STATE SERVICE VERSION',
              '22/tcp open  ssh     OpenSSH 8.9p1 Debian 3+deb12u1 (protocol 2.0)',
              '80/tcp open  http    nginx 1.22.1',
              'MAC Address: 08:00:27:11:22:33 (Oracle VirtualBox virtual NIC)',
              'Device type: general purpose',
              'Running: Linux 5.X',
              'OS details: Linux 5.0 - 5.14',
              'Network Distance: 1 hop',
              'Nmap done: 1 IP address (1 host up) scanned in 12.44 seconds',
              '$ ls labweb.*',
              'labweb.gnmap  labweb.nmap  labweb.xml'
            ]
          },
          {
            type: 'p',
            text:
              'Open labweb.xml in a text editor and find the service records: each carries port, state, service, product, version and confidence. That structured record is what vulnerability tooling and report generators consume — and why the XML file, not the screen, is the primary evidence artifact.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The lab scenario this lesson sets up: your -sV run reports nginx 1.22.1 on 80 and OpenSSH 8.9p1 on 22, plus an OS guess of Linux 5.x. Those strings are the handoff to the vulnerability-assessment phase (module n07): check versions against advisories, try default credentials only where authorized, and record confidence levels honestly. One deliberate scan just produced a week of assessment work — which is why methodology, timing and output discipline matter more than scan speed.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['nmap -sV / -O / -A', 'Service and OS fingerprinting with tunable depth'],
              ['-oN / -oX / -oG / -oA', 'Evidence formats: readable, machine-readable, grepable, all-at-once'],
              ['XML parsers / report tooling', 'Consume the XML into asset lists and findings'],
              ['Zenmap (mention)', 'Nmap\u2019s official graphical front end for comparing scan profiles']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running -T5 against production gear and trusting the result: short timeouts produce missed and mislabeled ports',
              'Quoting low-confidence OS guesses as facts in reports',
              'Treating grepable output as complete evidence — it omits much of what the scan learned',
              'Running -A everywhere by default: it is loud, slow, and usually more than the question needs',
              'Discarding the XML; screen output is transient, the files are the record',
              'Forgetting --version-light vs --version-all changes how many probes hit each service'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Scan one lab host three ways and compare: (1) -sV --version-light, (2) -sV --version-all, (3) -A. Record elapsed time and any differences in reported versions. Then rerun with -T5 and count how many port states change — your own data on the accuracy tax of insane timing.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              '-sV turns ports into products and versions via probe databases; intensity trades depth for noise and time',
              '-O fingerprints TCP/IP stacks; treat guesses as guesses and demand open+closed ports for a real fingerprint',
              'Timing templates T0-T5 encode intent; default T3 for labs, T4 for big healthy scopes, avoid T5',
              '-oA gives you nmap, gnmap and xml in one run: readable, grepable, and parser-grade evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n05-l04-q1',
          type: 'mcq',
          prompt: 'How does nmap -sV identify a service version?',
          options: [
            'By looking up the port number in a static table',
            'By sending probe payloads and matching service responses against a signature database',
            'By reading the server\u2019s configuration file over the network',
            'By asking the DNS server for the host'
          ],
          answerIndex: 1,
          hint: 'The port table is what nmap uses WITHOUT -sV; what changes with it?',
          explanation:
            'Version detection connects to the open port, waits for banners and sends probes from nmap-service-probes, matching replies against signatures to extract product, version and CPE. Port-number lookup alone would mislabel every nonstandard-port service.'
        },
        {
          id: 'n05-l04-q2',
          type: 'mcq',
          prompt: 'Which timing template is nmap\u2019s default, balancing parallelism and reliability?',
          options: ['-T0 (paranoid)', '-T2 (polite)', '-T3 (normal)', '-T5 (insane)'],
          answerIndex: 2,
          hint: 'If you never type -T, this is what you are using.',
          explanation:
            '-T3 is the default: parallel probes with standard timeouts. T0-T2 trade speed for quietness, T4 speeds up for reliable networks, and T5 pushes speed hard enough to sacrifice accuracy.'
        },
        {
          id: 'n05-l04-q3',
          type: 'truefalse',
          prompt: 'The grepable output file (-oG) contains everything the XML output contains, just in a compact form.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Grepable is for quick grepping — what did it leave out?',
          explanation:
            'The grepable format is a legacy convenience that omits substantial detail (including much of the script and version data). It is fine for triage; the XML and normal files are the evidence record — which is why -oA exists.'
        },
        {
          id: 'n05-l04-q4',
          type: 'short',
          prompt: 'Why should an OS detection result marked with low confidence never appear as a conclusion in a report?',
          modelAnswer:
            'OS fingerprinting compares probe responses against signature databases, and many environments (NAT, proxies, tuned stacks, firewalls) distort those responses. A low-confidence guess can simply be wrong, and stating it as fact undermines every other finding; it belongs in notes as "unconfirmed" or should be corroborated with other evidence (banner strings, MAC vendor, service behavior) before publication.',
          hint: 'What exactly did nmap compare, and what can distort the comparison?',
          explanation:
            'Fingerprinting is inference, not measurement. Professional reports separate verified facts from guesses — and OS guesses are guesses until something else corroborates them.'
        },
        {
          id: 'n05-l04-q5',
          type: 'scenario',
          prompt:
            'During an authorized test on a client\u2019s fragile legacy environment, your -T5 -A scan of one subnet coincides with a network hiccup and a complaint from operations. What went wrong technically, and what is the correct approach for the rest of the engagement?',
          modelAnswer:
            'Technically: -T5 uses very short timeouts and maximum parallelism, so probes arrive in bursts, fragile devices queue or drop traffic, and nmap itself misclassifies slow responders (missed or filtered ports) — the combination of load and unreliability. Correct approach: drop to -T2 or -T3 for the legacy segments, scope scans to explicit windows agreed with the client, use --max-rate or --scan-delay to cap load, split -A into its parts (-sV, -O) so only what is needed runs, and document the incident plus the revised timing in the engagement notes.',
          hint: 'Speed was the requirement you accidentally optimized for. What should it have been?',
          explanation:
            'Timing selection is a professional responsibility: scans must be safe for the environment they run against. The recovery matters too — documenting the incident and the revised plan is how engagements survive mistakes.'
        }
      ],
      references: [
        {
          title: 'Nmap Reference Guide — Service and Version Detection',
          url: 'https://nmap.org/book/man-service-version-detection.html',
          note: 'Official -sV mechanics, intensity levels and related options.'
        },
        {
          title: 'Nmap Reference Guide — OS Detection',
          url: 'https://nmap.org/book/man-os-detection.html',
          note: 'Official -O behavior, --osscan-limit and --osscan-guess.'
        },
        {
          title: 'Nmap Reference Guide — Timing and Performance',
          url: 'https://nmap.org/book/performance.html',
          note: 'The authoritative timing-template and rate-option reference.'
        },
        {
          title: 'Nmap Reference Guide — Output',
          url: 'https://nmap.org/book/man-output.html',
          note: 'Official semantics of -oN, -oX, -oG, -oA and --reason.'
        }
      ]
    },
    {
      id: 'n05-l05',
      moduleId: 'n05',
      title: 'NSE, UDP Scanning, DNS Enumeration and Network Mapping',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n05-l04'],
      objectives: [
        'Use the Nmap Scripting Engine safely: categories, --script forms and script arguments',
        'Run UDP scans (-sU) and interpret open, closed and open|filtered correctly',
        'Enumerate DNS with dig/nslookup-style lookups, reverse sweeps and zone transfer attempts',
        'Tie hosts, services, versions and names into a network map'
      ],
      diagram: 'net-dns-resolution',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'This lesson closes the gaps the first four left. NSE extends nmap from "which ports are open" to "what can these services do" using hundreds of community scripts. UDP scanning covers the half of the port space TCP scans never touch — and where some of the juiciest services (DNS, SNMP, NTP, syslog) live. DNS enumeration turns names into infrastructure: subdomains, mail hosts, and occasionally an entire zone handed over by a misconfigured server. Together they convert a list of ports into an actual map of the network.'
          },
          {
            type: 'p',
            text:
              'Each of the three has a safety dimension. NSE scripts range from harmless (version queries) to intrusive (exploit attempts) to external (they talk to third-party services you did not scope). UDP scans are slow enough to outlast your patience and easy to misread. DNS enumeration includes techniques — like zone transfer attempts — that are normal recon against your lab but unauthorized attacks against anyone else. Professional use is knowing which is which.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The Nmap Scripting Engine'
          },
          {
            type: 'p',
            text:
              'NSE scripts are Lua files shipped with nmap, indexed with categories: auth, broadcast, default, discovery, dos, exploit, external, fuzzer, intrusive, malware, safe, version, vuln. You select them with --script: by category (--script vuln), by name (--script http-title), by directory, by wildcard, or with boolean expressions (--script "default and not broadcast"). --script-args passes parameters (usernames, community strings), --script-trace shows the raw script traffic for debugging, and -sC is shorthand for --script default. The categories encode risk: safe scripts are designed to be non-disruptive, intrusive ones can crash services or be construed as attacking, and external ones contact systems outside your target — always review which you are enabling.'
          },
          {
            type: 'h',
            text: 'UDP scanning'
          },
          {
            type: 'p',
            text:
              'UDP has no handshake, so scanning works differently. Nmap sends a datagram; if the port is closed, the stack should reply with ICMP port unreachable — nmap marks closed. If nothing comes back, nmap cannot distinguish an open port from a silently filtered one and marks open|filtered. Only when the service itself answers (rare for empty datagrams) does nmap report open. This makes UDP scanning slow (retransmissions to overcome unreliable ICMP) and its output cautious by design. The professional pattern: scan a short list of meaningful ports (-p 53,69,123,161,500,514), pair it with -sV so probes carry real payloads, and give the scan time.'
          },
          {
            type: 'h',
            text: 'DNS enumeration'
          },
          {
            type: 'p',
            text:
              'DNS is the network\u2019s own directory, and it leaks gracefully. Forward enumeration guesses or discovers hostnames (A/AAAA records); reverse sweeps map addresses back to names (nmap -sL does reverse-DNS-only listing across a range); record types matter (MX reveals mail, NS reveals authoritative servers, TXT reveals SPF and vendor strings, SRV reveals services); and the zone transfer (AXFR) — asking a name server for a copy of the whole zone — succeeds only on misconfigured servers, but when it does, it is the entire naming scheme in one response. Tools like dig, nslookup, host and dnsrecon automate all of this.'
          },
          {
            type: 'terminal',
            title: 'NSE, UDP and DNS against lab targets',
            lines: [
              '$ sudo nmap -sV --script default -p 80 192.168.56.20',
              'PORT   STATE SERVICE VERSION',
              '80/tcp open  http    nginx 1.22.1',
              '| http-title: Welcome to nginx!',
              '|_http-server-header: nginx/1.22.1',
              '| http-methods:',
              '|_  Supported Methods: GET HEAD POST OPTIONS',
              '$ sudo nmap -sU -sV -p 53,123,161 --version-light 192.168.56.20',
              'PORT    STATE  SERVICE  VERSION',
              '53/udp  open   domain   ISC BIND 9.18.24',
              '123/udp open   ntp      NTP v4',
              '161/udp open|filtered snmp',
              '$ dig @192.168.56.20 lab.example AXFR',
              'lab.example.      3600 IN SOA ns1.lab.example. admin.lab.example. 2024050101 7200 3600 1209600 3600',
              'web.lab.example.  3600 IN A 192.168.56.20',
              'db.lab.example.   3600 IN A 192.168.56.30',
              'vpn.lab.example.  3600 IN A 192.168.56.40'
            ]
          },
          {
            type: 'p',
            text:
              'Three teachable moments in that output: the default script set annotated port 80 with method and title info without any extra work; the UDP scan shows one open, one open|filtered (SNMP answered nothing to empty probes — unresolved, not necessarily closed); and the AXFR returned the whole lab zone, including a db host the TCP scans had not surfaced. In a real engagement each of those is a distinct, reportable observation.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'NSE\u2019s vuln and discovery categories preview the vulnerability-assessment phase; its auth scripts test default credentials where authorized. UDP services are the classic blind spot: environments hardened for TCP routinely expose SNMP with default community strings or a recursive resolver that leaks internal names. DNS enumeration legitimately expands your target list — every subdomain is a new host to ask the client about — and a successful zone transfer is a high-value finding because it hands attackers the internal naming convention. The map you assemble (hosts, ports, versions, names, owners) is the input for every later module.'
          },
          {
            type: 'list',
            items: [
              'Run default scripts for breadth; choose intrusive or vuln scripts deliberately and only where authorized',
              'Treat open|filtered UDP results as a to-do list, not a conclusion',
              'Log every DNS question you asked of client infrastructure — enumeration traffic is visible to their defenders too'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SNMP answering on 161 (open|filtered is the usual first clue) — then check communities in an authorized, careful way',
              'Recursive resolvers exposed to networks that should not have them (test with a query for an external name)',
              'Successful AXFR responses, or deprecated DNS features enabled on modern servers',
              'NSE results that change your port list: discovery scripts often reveal adjacent services and hosts',
              'Names that leak topology: db-, k8s-, vpn-, uat- prefixes in DNS answers'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scripts are code, categories are promises',
            text:
              'Read a script\u2019s description before running it against anything, run intrusive and exploit categories only in your lab or with explicit written authorization, and remember external-category scripts reach third-party systems outside your scope.'
          },
          {
            type: 'p',
            text:
              'In the lab: run a default-script scan against your web VM, a short UDP scan against the DNS/SNMP VM, and a DNS session (reverse sweep plus an AXFR attempt) against the lab resolver. Record what each technique added that plain TCP scanning missed.'
          },
          {
            type: 'terminal',
            title: 'Reverse sweep and zone health in the lab',
            lines: [
              '$ nmap -sL 192.168.56.0/29 | grep "Nmap scan report"',
              'Nmap scan report for ns1.lab.example (192.168.56.1)',
              'Nmap scan report for web.lab.example (192.168.56.20)',
              'Nmap scan report for db.lab.example (192.168.56.30)',
              '$ dig @192.168.56.20 lab.example NS +short',
              'ns1.lab.example.',
              '$ dig @192.168.56.20 example.org +short',
              '93.184.216.34',
              '# resolver answers for names it does not host: recursion is open'
            ]
          },
          {
            type: 'p',
            text:
              'The -sL listing scan costs nothing but DNS queries and returned three named hosts from PTR records. The last lookup is the recursion test: a resolver that answers external names for you is a resolver that will happily answer them for anyone — a standard report finding.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The lab closes with the mapping step. Combine everything: hosts from discovery (n05-l02), ports and states from TCP scans (n05-l03), versions from -sV (n05-l04), UDP services and script output from this lesson, and names from DNS. The result is a network map with edges labeled by evidence: web VM (nginx 1.22.1, port 80), DNS (BIND 9.18.24, open recursion), database (db.lab.example, reached only via DNS so far), and the unknown 161/udp question. That document — not any single scan — is what you carry into the vulnerability-assessment module.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['nmap --script / -sC', 'Script-driven service interrogation with category-based risk control'],
              ['nmap -sU', 'UDP service discovery across a chosen port list'],
              ['dig / nslookup / host', 'Interactive DNS queries: A, MX, NS, TXT, SRV, AXFR'],
              ['nmap -sL', 'Reverse-DNS listing sweeps over authorized ranges'],
              ['dnsrecon / dnsenum (mention)', 'Automated DNS enumeration suites for lab-scale practice']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running --script intrusive or exploit categories against systems you are not explicitly authorized to test',
              'Reading open|filtered as open (or dismissing it as closed) — it means unresolved and deserves a follow-up',
              'Skipping UDP entirely because it is slow; DNS, SNMP and NTP misconfigurations live exactly there',
              'Attempting zone transfers against name servers outside your scope',
              'Leaving external-category scripts on during scoped tests without noticing they call third parties',
              'Building the map in your head instead of in a document — unrecorded context evaporates by the reporting phase'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab: (1) run nmap -sC -sV against one service and find one fact a plain scan would have missed; (2) run a 5-port UDP scan and interpret every state honestly; (3) attempt an AXFR against your lab resolver, then disable zone transfers in its config and watch the attempt fail. Write the three findings as you would in a report.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'NSE categories encode risk: default/safe for breadth, intrusive/external need explicit authorization',
              'UDP: closed = ICMP unreachable, silent = open|filtered; scan short port lists with -sV and patience',
              'DNS enumeration (forward, reverse, records, AXFR) turns names into infrastructure cheaply',
              'The network map — hosts, ports, versions, names — assembled with evidence is the deliverable of discovery'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n05-l05-q1',
          type: 'mcq',
          prompt: 'Which NSE category contains scripts designed to be non-disruptive and suitable for general use?',
          options: ['intrusive', 'safe', 'exploit', 'fuzzer'],
          answerIndex: 1,
          hint: 'The category names encode their risk level.',
          explanation:
            'The safe category marks scripts intended not to crash services or act aggressively. Intrusive scripts can disrupt or be treated as attacks, exploit scripts attempt real exploitation, and fuzzer scripts send malformed data to provoke errors.'
        },
        {
          id: 'n05-l05-q2',
          type: 'mcq',
          prompt: 'During a UDP scan (-sU), a port shows as open|filtered. What does nmap actually know?',
          options: [
            'The service answered, so the port is open',
            'The port is definitively closed because no ICMP came back',
            'Nothing came back — an open silent service and a firewall drop look identical, so the state is unresolved',
            'The service is open but version detection failed'
          ],
          answerIndex: 2,
          hint: 'UDP gives no handshake. What two situations produce silence?',
          explanation:
            'Without a response (and without an ICMP port-unreachable, which would mean closed), nmap cannot distinguish an open-but-quiet service from a firewall dropping the datagram. Open|filtered is honest uncertainty that deserves follow-up, e.g. with -sV or targeted probes.'
        },
        {
          id: 'n05-l05-q3',
          type: 'truefalse',
          prompt: 'A successful DNS zone transfer (AXFR) against an authorized lab server is a routine result on properly configured name servers.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is AXFR supposed to be limited to?',
          explanation:
            'AXFR is meant for designated secondary name servers only. A server that answers AXFR for arbitrary clients is misconfigured — on a real engagement that is a reportable finding because it reveals the entire zone to anyone who asks.'
        },
        {
          id: 'n05-l05-q4',
          type: 'short',
          prompt: 'Give the UDP-scan interpretation for each of these results: (a) service replies with data, (b) ICMP port unreachable received, (c) no response at all.',
          modelAnswer:
            '(a) Open — the service itself answered. (b) Closed — the target stack explicitly reported nothing listening on that port. (c) open|filtered — either an open service that stayed silent or a firewall dropping the probe; unresolved and worth targeted follow-up probes or version detection.',
          hint: 'Match each signal to the claim nmap can honestly make.',
          explanation:
            'These three mappings are the whole mental model of UDP scanning: UDP has no handshake, so nmap reads error messages and silence, and silence is inherently ambiguous.'
        },
        {
          id: 'n05-l05-q5',
          type: 'scenario',
          prompt:
            'You are planning the discovery phase for an authorized lab that runs DNS, SNMP and NTP alongside web and SSH. Sketch the command sequence you would run (TCP breadth, UDP services, NSE, DNS) and the safety checks you apply before each step.',
          modelAnswer:
            '1) Host discovery on the range (nmap -sn with multi-probe set) — confirm the range is in the written scope. 2) TCP breadth with -sS plus -sV on found hosts and -oA output — keep default timing (T3) and save evidence. 3) Short UDP scan -sU -sV -p 53,123,161 — allow time and treat open|filtered as follow-up items, not conclusions. 4) NSE breadth with -sC for service detail; review any additional scripts\u2019 categories before use (no intrusive/external without explicit authorization). 5) DNS: dig for A/MX/NS/TXT, nmap -sL reverse sweep of the range, one AXFR attempt against the lab resolver, and a recursion test. Safety checks per step: scope confirmation, timing appropriate to lab devices, categories reviewed, output saved with timestamps.',
          hint: 'Order: alive, then TCP, then UDP, then scripts, then names — with one safety gate each.',
          explanation:
            'The exercise tests planning more than tool trivia: each phase feeds the next, and the safety gate (scope, timing, script category, authorized servers) is part of the method, not an afterthought.'
        }
      ],
      references: [
        {
          title: 'Nmap Reference Guide — NSE (Nmap Scripting Engine)',
          url: 'https://nmap.org/book/nse.html',
          note: 'Official NSE documentation: categories, usage and script arguments.'
        },
        {
          title: 'Nmap Reference Guide — Script Scan',
          url: 'https://nmap.org/book/man-script-scan.html',
          note: 'Official --script, --script-args and -sC semantics.'
        },
        {
          title: 'Nmap Reference Guide — Port Scanning Techniques (UDP scan)',
          url: 'https://nmap.org/book/man-port-scanning-techniques.html',
          note: 'Official -sU behavior including the open|filtered state.'
        },
        {
          title: 'RFC 1035 — Domain Names: Implementation and Specification',
          url: 'https://datatracker.ietf.org/doc/html/rfc1035',
          note: 'The DNS record types and query mechanics behind enumeration.'
        }
      ]
    }
  ]
};
