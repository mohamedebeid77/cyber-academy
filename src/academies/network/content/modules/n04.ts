import type { Module } from '../../../../types';

// LEVEL 3 — SECURITY ARCHITECTURE · Module n04: Network Security Fundamentals
// Original curriculum content for the Network Security & Pentesting Academy.
// All prose is original and written for authorized, lab-based learning. The
// reference links point to official documentation (NIST SP series, RFCs, and
// MITRE ATT&CK) used while studying each topic. Scanning or sniffing any
// network you do not own or are not contractually authorized to test is
// illegal in most jurisdictions.

export const n04: Module = {
  id: 'n04',
  title: 'Network Security Fundamentals',
  level: 3,
  description:
    'The defensive architecture every pentest must understand: the CIA triad and threat vocabulary, segmentation and DMZ patterns, the devices that inspect traffic (stateful firewalls, IDS/IPS, WAFs, proxies), and the modern shifts — NAT, VPNs, zero trust and network monitoring. You cannot attack or defend a network you cannot reason about.',
  outcomes: [
    'Reason about the CIA triad, threat vocabulary and network attack surface',
    'Describe segmentation, DMZ patterns and defense in depth',
    'Explain how stateful vs stateless firewalls, IDS/IPS, WAFs, proxies, NAT and VPNs work',
    'Explain zero trust principles and the basics of network monitoring and logging'
  ],
  lessons: [
    {
      id: 'n04-l01',
      moduleId: 'n04',
      title: 'Security Models: CIA, Threats and Attack Surface',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n03-l01'],
      objectives: [
        'Define confidentiality, integrity and availability in concrete network terms',
        'Distinguish threat, vulnerability, risk and impact',
        'Map the attack surface of a network from inside and outside'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Security conversations drift into vagueness fast unless everyone shares a vocabulary. This lesson fixes that vocabulary: confidentiality, integrity and availability (the CIA triad), and the trio of threat, vulnerability and risk. On a network these are not abstract policy words — each one maps to concrete traffic you can capture and misconfigurations you can find.'
          },
          {
            type: 'p',
            text:
              'Confidentiality on a network means data crossing the wire can be read only by its intended recipients. Plain HTTP, unencrypted legacy protocols, and open Wi-Fi all fail it. Integrity means packets arrive unmodified — no tampering in transit, no injected content, no attacker rewriting responses between two parties. Availability means the service answers when called; floods, reflection attacks and even an accidental broadcast storm all attack it.'
          },
          {
            type: 'p',
            text:
              'Threat, vulnerability and risk chain together. A threat is an actor or event with the potential to cause harm. A vulnerability is a weakness a threat could exploit. Risk is the combination of the two, weighted by impact. A penetration test exists to find the vulnerabilities a real attacker would find first, then demonstrate impact so the organization can prioritize fixes — which is why every finding in a pentest report is eventually framed in CIA terms.'
          }
        ],
        technical: [
          {
            type: 'table',
            headers: ['CIA element', 'Network question', 'Typical failure you can observe'],
            rows: [
              ['Confidentiality', 'Who can read this traffic or this data?', 'Cleartext protocol carrying credentials; misconfigured storage bucket; open management interface'],
              ['Integrity', 'Can this traffic or data be changed in transit or at rest?', 'No transport verification; unsigned updates; ARP/DNS spoofing inside a LAN'],
              ['Availability', 'Will this service answer under load and attack?', 'No rate limiting; single point of failure; amplification-friendly services exposed']
            ]
          },
          {
            type: 'p',
            text:
              'The threat-vulnerability-risk chain works like this: a threat actor brings capability and intent (a scripted bot, a criminal group, a disgruntled employee, or simply a misconfiguration waiting to happen). A vulnerability is any weakness that capability could act on — an unpatched service, a flat network, a default password. Risk is usually expressed as likelihood times impact: an internet-facing unpatched service is high risk; the same service on an isolated lab VLAN is lower, because the likelihood side shrinks even though the vulnerability is identical.'
          },
          {
            type: 'p',
            text:
              'Attack surface is the full set of points where an unauthorized actor could try to interact with the environment. For networks that means: every public IP and open port, every VPN and remote-access endpoint, every wireless network, every trust boundary between zones, management interfaces, third-party links, and the human surface (phishing, help desk, physical ports in the lobby). Surface is measured from two directions: from outside (what is reachable without credentials) and from inside (what a workstation can reach after a foothold).'
          },
          {
            type: 'diagram',
            id: 'net-lan-topology',
            caption: 'Mapping surface: every host, service and boundary is a potential entry point.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'A pentest is a controlled simulation of a threat acting on an attack surface. That framing does real work: the surface map defines what you test and in what order, the threat definition sets your rules of engagement, and the CIA vocabulary turns technical findings into business impact. A MySQL port reachable from the DMZ is not just an open port — it is a confidentiality risk to every table in that database.'
          },
          {
            type: 'list',
            items: [
              'Scope conversations start from surface: which ranges, which zones, which attack paths are in or out',
              'Prioritization during testing follows risk: reachable plus unpatched plus sensitive beats exotic plus isolated',
              'Reports sell fixes by mapping each finding to the CIA element it damages and the actor who would use it'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Internet-facing services nobody documented — the classic finding is an exposed admin panel on a forgotten host',
              'Management interfaces (SSH, RDP, hypervisor, printer and switch panels) reachable from user networks',
              'Legacy systems running unencrypted protocols that carry real credentials',
              'Trust boundaries drawn only on paper: check whether the DMZ can actually reach the internal LAN',
              'Wireless guest networks and VPN concentrators, which punch holes through every diagram',
              'Listening services on individual hosts that nobody connected to the bigger picture (use ss -tulpn)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Mapping and probing networks you do not own — even just a port scan — is illegal in many jurisdictions and against the terms of every serious engagement. All techniques in this academy are practiced against your own lab, training ranges, or systems covered by written authorization.'
          },
          {
            type: 'p',
            text:
              'In your lab, attack surface mapping has two halves. From inside a host, enumerate what that host offers to the network: every listening socket is surface. Then walk the zones: what is reachable from where? Start with the inside-out view using ss, then confirm from another subnet with a scoped scan.'
          },
          {
            type: 'terminal',
            title: 'Inside-out surface enumeration on a lab host',
            lines: [
              '$ ss -tulpn | head -6',
              'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Process',
              'tcp   LISTEN 0      128    0.0.0.0:22         0.0.0.0:*          users:(("sshd",pid=712,fd=3))',
              'tcp   LISTEN 0      511    0.0.0.0:8080       0.0.0.0:*          users:(("node",pid=934,fd=18))',
              'udp   UNCONN 0      0      0.0.0.0:5353       0.0.0.0:*          users:(("avahi-daemon",pid=498,fd=12))',
              '$ sudo nmap -sT -p- --min-rate 2000 127.0.0.1',
              'Not shown: 65533 closed tcp ports (conn-refused)',
              'PORT     STATE SERVICE',
              '22/tcp   open  ssh',
              '8080/tcp open  http-proxy'
            ]
          },
          {
            type: 'p',
            text:
              'Record every listener into a simple inventory (host, port, service, which zone can reach it). This artifact — not the scan output itself — is what a real engagement hands to the client as the surface map.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Picture a small lab: a web VM (80/443), a database VM (3306), and an admin workstation. Mapping surface from the workstation finds the web VM as expected — but also port 8080 on the web VM running a build dashboard with default credentials, and the database answering from the workstation subnet even though the design says only the web VM should talk to it. Two findings fall straight out of the map: an undocumented management surface (confidentiality) and a trust boundary that exists on the diagram but not on the wire (integrity of the design).'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Surface is a moving target',
            text:
              'Every deploy, every new device, every cloud VM changes the surface. Treat the map as a living document with a date on it, not a one-time deliverable.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in surface mapping'],
            rows: [
              ['ss / netstat', 'Enumerate listening sockets on hosts you control or are authorized to inspect'],
              ['nmap', 'Confirm reachability across zones with scoped, careful scans (module n05 covers it properly)'],
              ['ping / traceroute', 'Quick reachability and path checks between zones'],
              ['Inventory sheet or diagram tool', 'The map itself: hosts, services, zones, reachability arrows']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing threat with vulnerability: the attacker is the threat, the open MySQL port is the vulnerability',
              'Treating attack surface as only internet-facing; insider and post-foothold surface is usually bigger',
              'Forgetting the human and physical surface: lobby switch ports and phishing bypass every network control',
              'Assuming management interfaces are unreachable without testing the actual routing and firewall rules',
              'Recording scan output instead of recording conclusions — the deliverable is the map, not the raw dump'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Draw the surface map of your own home lab. List every host, run ss -tulpn on each, and mark which zones can reach which services. Then classify each service by which CIA element it endangers if abused. Two hosts with identical open ports can carry completely different risk — say why, in one sentence each.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'CIA in network terms: who can read (C), who can modify (I), will it answer (A)',
              'Threat x vulnerability x impact = risk; pentests demonstrate the vulnerability and impact side',
              'Attack surface is everything reachable, from outside and after a foothold — map both directions',
              'The surface map, dated and scoped, is the first artifact of every network engagement'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n04-l01-q1',
          type: 'mcq',
          prompt: 'An attacker captures Wi-Fi traffic and reads passwords sent over plain HTTP. Which CIA element is most directly violated?',
          options: ['Availability', 'Confidentiality', 'Integrity', 'Authentication'],
          answerIndex: 1,
          hint: 'Ask what the attacker did with the data: read it, change it, or stop it?',
          explanation:
            'Reading data that was meant to be private is a confidentiality failure. Integrity would be violated if the attacker modified the traffic, availability if they made the service unusable.'
        },
        {
          id: 'n04-l01-q2',
          type: 'truefalse',
          prompt: 'A threat and a vulnerability are the same thing described from attacker and defender perspectives.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'One is an actor or event; the other is a property of the system.',
          explanation:
            'The threat is the actor or event with potential to cause harm; the vulnerability is the weakness in the system the threat could exploit. Risk links the two with likelihood and impact.'
        },
        {
          id: 'n04-l01-q3',
          type: 'short',
          prompt: 'In one sentence each, name the two directions from which a network attack surface is measured.',
          modelAnswer:
            'Outside-in: what is reachable without credentials (public IPs, open ports, VPN and wireless endpoints). Inside-out (post-foothold): what a compromised workstation or DMZ host can reach across the internal network.',
          hint: 'Think pre-authentication attacker versus post-foothold attacker.',
          explanation:
            'Both directions matter because external hardening often hides a flat interior. Most real-world impact happens in the inside-out direction after an initial foothold.'
        },
        {
          id: 'n04-l01-q4',
          type: 'scenario',
          prompt:
            'During an authorized lab test you find a build dashboard on port 8080 with default admin credentials. Frame this as a report finding: name the vulnerability, the threat that would exploit it, and the CIA impact.',
          modelAnswer:
            'Vulnerability: undocumented management interface (port 8080) reachable from the user network with unchanged default credentials. Threat: any actor with network access — from a curious insider to malware on a workstation — can authenticate immediately. Impact: full control of the CI system means attackers can read stored secrets (confidentiality) and poison or reroute build outputs (integrity), with availability at risk if they disable or break the pipeline.',
          hint: 'Separate the weakness, the actor, and the consequence in CIA terms.',
          explanation:
            'This is exactly how findings are written: the vulnerability is observable and fixable, the threat justifies priority, and the CIA impact explains why executives should care beyond the port number.'
        }
      ],
      references: [
        {
          title: 'RFC 4949 — Internet Security Glossary, Version 2',
          url: 'https://datatracker.ietf.org/doc/html/rfc4949',
          note: 'Authoritative definitions of confidentiality, integrity, availability, threat, vulnerability and risk.'
        },
        {
          title: 'NIST SP 800-115 — Technical Guide to Information Security Testing and Assessment',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-115/final',
          note: 'Official NIST methodology showing how testing maps to security objectives.'
        },
        {
          title: 'MITRE ATT&CK — Enterprise Matrix',
          url: 'https://attack.mitre.org/matrices/enterprise/',
          note: 'Catalog of real adversary behavior; a practical taxonomy of threats.'
        }
      ]
    },
    {
      id: 'n04-l02',
      moduleId: 'n04',
      title: 'Segmentation, DMZ and Defense in Depth',
      difficulty: 'Beginner',
      minutes: 16,
      prerequisites: ['n04-l01'],
      objectives: [
        'Explain why flat networks fail and how segmentation limits blast radius',
        'Describe DMZ patterns and the traffic rules that make them work',
        'Apply defense in depth thinking with concrete layered controls'
      ],
      diagram: 'net-dmz',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A flat network is one big trust domain: any host can talk to any other host, so one compromised laptop equals one compromised company. Segmentation cuts the network into zones with controlled traffic between them, so a compromise in one zone does not automatically spread to the rest. The measure of good segmentation is blast radius: how much damage can an attacker in zone A do before zone B even notices?'
          },
          {
            type: 'p',
            text:
              'The best-known segmentation pattern is the DMZ (demilitarized zone): a special zone for services that must be reachable from the internet. The rule that makes a DMZ work is asymmetry — the internet may initiate connections to the DMZ, the DMZ may answer, but the DMZ may not initiate connections into the internal network. If that rule holds, a compromised web server is a contained problem. If it does not, the DMZ is just a staging area for the real attack.'
          },
          {
            type: 'p',
            text:
              'Defense in depth is the principle behind all of it: never depend on one control. Layer independent controls — segmentation, firewall rules, host firewalls, patching, monitoring, authentication — so that the failure of any single layer leaves the attacker with more work, more noise, and less access.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-dmz',
            caption: 'Classic DMZ pattern: internet-facing services isolated between two filtering points.'
          },
          {
            type: 'p',
            text:
              'Segmentation is built from subnets and VLANs. A VLAN groups switch ports into a broadcast domain; a subnet gives that domain an IP range. Neither provides security by itself — security comes from the policy at the router or firewall that decides what may cross between them. That crossing point is the chokepoint: it is where rules live, where logs can be collected, and where a pentester tests whether the boundary is real.'
          },
          {
            type: 'table',
            headers: ['Zone', 'Typical contents', 'Rule towards it', 'Rule from it'],
            rows: [
              ['Internet', 'Everyone', 'n/a', 'Initiate to DMZ public services only'],
              ['DMZ', 'Reverse proxies, public web, mail relays', 'Public service ports', 'No new connections to internal; patches/DNS only'],
              ['Internal LAN', 'Workstations, file servers', 'Answer replies; specific app ports', 'Segmented further by function'],
              ['Management', 'Hypervisors, switches, backups', 'From admin jump hosts only', 'Minimal; strongly logged']
            ]
          },
          {
            type: 'p',
            text:
              'Defense in depth stacks independent layers around the same asset. For a public web server: firewall rules allow only 80/443 (network layer), the reverse proxy forwards to the app on a private port (architectural layer), the app runs unprivileged in a container with no shell (host layer), a WAF filters known web attacks (application layer), and flow monitoring alerts on odd traffic (detection layer). Each layer has a different failure mode, which is the point — the same bug will not defeat all of them at once.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Lateral movement is where segmentation earns or loses its reputation. After any foothold, the first pentest question is: where can I go from here? A VM-to-VM reachability matrix tells you whether the design is enforced or just drawn. Segmentation findings are among the highest-value report items because they turn a single small compromise into a demonstrated path to the database, the backup server, or the management plane.'
          },
          {
            type: 'list',
            items: [
              'Test the DMZ rule specifically: from a DMZ host, try initiating connections into the internal zones',
              'Test the chokepoints: are inter-zone rules actually in place, and do they log?',
              'Test east-west traffic inside each zone — most environments are far flatter than their diagrams claim'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Servers and workstations sharing one subnet — no boundary between user and data-center space',
              'DMZ hosts that can open sessions into the internal LAN (the single most common broken rule)',
              'Databases, backups and hypervisors reachable from user VLANs',
              'VLANs configured on switches but no ACLs or firewall policy between them',
              'Guest Wi-Fi routed into the corporate LAN rather than an isolated zone',
              'IPv6 or secondary interfaces completely missing from the rule set'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Test the boundary, not the neighbor',
            text:
              'Cross-zone reachability testing is active probing. Do it only in your lab or inside a signed scope, and keep the probe list small and documented.'
          },
          {
            type: 'p',
            text:
              'The core test is a reachability matrix: from each zone, attempt to reach representative hosts and ports in every other zone. In a small lab this is a handful of pings and scoped nmap runs. What matters is recording which attempts succeeded — those are your segmentation findings.'
          },
          {
            type: 'terminal',
            title: 'Cross-zone reachability from a DMZ host',
            lines: [
              '$ ping -c 2 10.10.20.30',
              'PING 10.10.20.30 (10.10.20.30) 56(84) bytes of data.',
              '64 bytes from 10.10.20.30: icmp_seq=1 ttl=63 time=0.41 ms',
              '64 bytes from 10.10.20.30: icmp_seq=2 ttl=63 time=0.38 ms',
              '$ sudo nmap -Pn -p 22,80,3306 10.10.20.30',
              'PORT     STATE  SERVICE',
              '22/tcp   open   ssh',
              '80/tcp   closed http',
              '3306/tcp open   mysql',
              '# A DMZ web VM reaching internal SSH and MySQL: the DMZ rule is broken'
            ]
          },
          {
            type: 'p',
            text:
              'Note the -Pn: the host-discovery phase is skipped so the test measures the actual port policy, and a filtered result (rather than closed) would suggest a firewall rather than a stopped service. You will read these states fluently in module n05.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Build the classic lab in three zones: VLAN 10 (users), VLAN 20 (servers), VLAN 30 (DMZ), routed by a Linux box or a lab firewall VM. Put a web VM in the DMZ and MySQL in VLAN 20. First run the reachability test with no rules — everything answers, proving the router alone segments nothing. Then add just two rules (DMZ may reach VLAN 20 on 3306; nothing else crosses) and rerun. The before/after matrix is a complete, portfolio-grade segmentation experiment.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'One finding per rule',
            text:
              'Each unexpected success in the matrix maps to one report line: source zone, destination, port, and the rule that should have blocked it. That specificity is what makes the finding actionable.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in segmentation testing'],
            rows: [
              ['nmap', 'Scoped cross-zone port checks (host discovery and scan types arrive in module n05)'],
              ['ping / traceroute', 'First-pass reachability and path evidence between zones'],
              ['ip (address, route, link)', 'Verify VLANs, addressing and routing on Linux lab gear'],
              ['iptables / nftables / lab firewall', 'Implement the inter-zone rules you are testing'],
              ['Diagram tool', 'Keep the intended-zone diagram next to the tested matrix']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Believing VLANs are a security control by themselves — only the policy between them is',
              'Testing segmentation from the workstation zone only; the DMZ and management zones are where the gaps hide',
              'Assuming filtered means secured: one forgotten allow rule can rejoin two zones completely',
              'Ignoring IPv6, VPN subnets and cloud VPC peering, which routinely bypass classic zone rules',
              'Drawing defense in depth as one big firewall; layers must be independent to add real work for an attacker'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In VirtualBox, GNS3 or your home router lab, create two subnets connected by a Linux router. Place a web VM in subnet A and another VM in subnet B. Build the reachability matrix both ways with no rules, then write the minimal rule set that allows only HTTP from B to A. Re-run the matrix and diff the results. You have just performed the core segmentation assessment.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Segmentation converts a flat blast radius into contained zones with policy at the chokepoints',
              'A DMZ is defined by asymmetric rules: in to public services, never out into the interior',
              'VLANs and subnets group; firewalls and ACLs protect — never confuse the two',
              'Defense in depth means independent layers, each with a different failure mode'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n04-l02-q1',
          type: 'mcq',
          prompt: 'What is the defining traffic rule of a classic DMZ?',
          options: [
            'The internet may initiate connections to DMZ services, but the DMZ may not initiate new connections into the internal network',
            'No traffic may ever leave the DMZ in any direction',
            'DMZ hosts and internal hosts share one firewall policy',
            'Internal hosts may freely initiate connections to the internet through the DMZ'
          ],
          answerIndex: 0,
          hint: 'Asymmetry is the point: inbound to public services, no outbound reach into the interior.',
          explanation:
            'The DMZ contains internet-facing services. Internet can open sessions to those services; the DMZ answers replies but must not open sessions into internal zones. That asymmetry contains a compromised DMZ host.'
        },
        {
          id: 'n04-l02-q2',
          type: 'truefalse',
          prompt: 'Putting hosts in separate VLANs is sufficient segmentation even if no rules restrict traffic between the VLANs.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What device actually enforces the boundary between broadcast domains?',
          explanation:
            'VLANs separate broadcast domains, but a router routes between them by default. Without ACLs or firewall policy at the crossing point, segmented addressing provides almost no security.'
        },
        {
          id: 'n04-l02-q3',
          type: 'short',
          prompt: 'Name three independent defense-in-depth layers protecting a public web server, and the failure mode each addresses.',
          modelAnswer:
            'Example answer: network firewall (limits reachable ports to 80/443), reverse proxy or WAF (filters application-level requests before they reach the app), hardened host/container running the app unprivileged with no shell (limits post-exploitation), plus monitoring/alerting as a detection layer. Each layer fails differently: rules can be misconfigured, payloads can evade filters, and code can still have bugs — so one bug rarely defeats all layers.',
          hint: 'Think network, application, host, and detection as separate planes.',
          explanation:
            'Independence is the requirement: the layers must fail for different reasons, otherwise a single bug or misconfiguration defeats the whole stack.'
        },
        {
          id: 'n04-l02-q4',
          type: 'scenario',
          prompt:
            'Your reachability matrix shows the DMZ web VM can connect to the internal database on 3306 and to every internal workstation on 445. The client says "but we have firewalls". What do you conclude and recommend?',
          modelAnswer:
            'Conclusion: the firewalls exist but the policy between the DMZ and internal zones is default-allow or missing — segmentation is drawn, not enforced. The DMZ rule (no initiated connections into the interior) is broken, so a compromised public web server can move directly toward databases and workstations (SMB/445 is a classic lateral-movement and ransomware path). Recommendation: default-deny between DMZ and internal zones, explicit allows only for the exact flows the application needs, log and alert on denied cross-zone attempts, then re-run the reachability matrix to verify.',
          hint: 'Separate device existence from policy enforcement, and describe the attack path the gap enables.',
          explanation:
            'This is the canonical segmentation finding: devices without policy. The evidence is the matrix itself, and the fix is measurable — rerun the same matrix after remediation and show the delta.'
        }
      ],
      references: [
        {
          title: 'NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-41/rev-1/final',
          note: 'Official guidance covering DMZ architectures, rule policy and egress filtering.'
        },
        {
          title: 'NIST SP 800-53 Rev. 5 — Security and Privacy Controls (SC-7 Boundary Protection)',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final',
          note: 'The control families behind segmentation and boundary protection.'
        },
        {
          title: 'RFC 1918 — Address Allocation for Private Internets',
          url: 'https://datatracker.ietf.org/doc/html/rfc1918',
          note: 'The private address ranges that internal zones and segmentation are built on.'
        }
      ]
    },
    {
      id: 'n04-l03',
      moduleId: 'n04',
      title: 'Firewalls, IDS/IPS, WAF and Proxies',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n04-l02'],
      objectives: [
        'Explain stateless vs stateful filtering and what each can and cannot decide',
        'Distinguish NIDS, NIPS and HIDS, and signature-based vs anomaly-based detection',
        'Explain what a WAF adds over a network firewall and how forward vs reverse proxies differ'
      ],
      diagram: 'net-firewall-placement',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Segmentation drew the zones; this lesson is about the devices that stand at the boundaries and decide, packet by packet or session by session, what may pass. The decision each device can make depends on what it can see: a stateless filter sees isolated packets, a stateful firewall sees whole connections, an IDS/IPS sees patterns across traffic, a WAF understands web requests, and a proxy terminates and re-originates sessions entirely. As a pentester you need to know which device sits where in your target, because that determines what your traffic looks like to it — and what it looks like in the evidence you collect.'
          },
          {
            type: 'p',
            text:
              'The other axis is placement. Firewalls and IPS sit inline (they can block). IDS and loggers sit beside the path (they can only tell). Forward proxies sit on the client side enforcing egress; reverse proxies sit in front of servers. Misplaced devices protect nothing: the best IPS in the world is decoration if the traffic you care about takes a path that never crosses it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-firewall-placement',
            caption: 'Where each inspection device sits on the path between internet, DMZ and internal zones.'
          },
          {
            type: 'h',
            text: 'Stateless vs stateful firewalls'
          },
          {
            type: 'p',
            text:
              'A stateless packet filter evaluates each packet alone against ACL rules (addresses, ports, flags). It has no memory, so it cannot tell a reply from an initiation — which is why classic stateless rules degenerate into allowing any packet claiming to come from port 80. A stateful firewall tracks connection state: once an inside host opens a session, replies to that session are accepted automatically via a state table, and everything else must match an explicit rule. Nearly every modern firewall is stateful; stateless logic survives in router ACLs and cloud security groups.'
          },
          {
            type: 'compare',
            title: 'Same intent, two mechanisms',
            beforeTitle: 'Stateless rule (fragile)',
            beforeCode:
              '# allow web replies by guessing their shape\niptables -A INPUT -p tcp --sport 80 -j ACCEPT\n\n# any attacker packet with source port 80\n# matches this — no connection memory exists',
            afterTitle: 'Stateful rule (tracked)',
            afterCode:
              '# replies only to sessions we initiated\niptables -A INPUT -m conntrack \\\n  --ctstate ESTABLISHED,RELATED -j ACCEPT\n\n# new inbound sessions only to our web port\niptables -A INPUT -p tcp --dport 80 \\\n  -m conntrack --ctstate NEW -j ACCEPT'
          },
          {
            type: 'h',
            text: 'IDS, IPS and detection models'
          },
          {
            type: 'p',
            text:
              'A NIDS (network IDS) watches a copy of traffic — from a SPAN port, TAP or capture point — and raises alerts; it cannot block. A NIPS sits inline and can drop or reject offending traffic, at the cost of becoming part of the availability story: a tuned-wrong IPS is self-inflicted downtime. An HIDS watches a single host (logs, file integrity, syscalls). Detection models split the same way: signatures match known patterns (precise, but blind to the unknown), anomaly models learn a baseline and flag deviations (catches novelty, but cries wolf without tuning). Tools like Snort and Suricata combine signature engines with protocol analyzers.'
          },
          {
            type: 'h',
            text: 'WAFs and proxies'
          },
          {
            type: 'p',
            text:
              'A WAF (web application firewall) is an L7 device in front of web applications: it parses HTTP, applies rules (the OWASP Core Rule Set is the standard baseline) and blocks request patterns like SQL injection attempts. It complements — never replaces — the network firewall, and it sees only what reaches it in the clear, so TLS must terminate at or before it. A forward proxy sits on the client side: clients send requests to it, it enforces egress policy and can inspect or authenticate. A reverse proxy sits in front of servers: it terminates TLS, load balances, and hides internal topology. The same box can front as a reverse proxy and WAF at once.'
          },
          {
            type: 'table',
            headers: ['Device', 'Sees', 'Can decide', 'Typical placement'],
            rows: [
              ['Stateless filter', 'Single packets', 'Permit/deny per packet', 'Router ACLs, cloud security groups'],
              ['Stateful firewall', 'Packets plus connection state', 'Permit/deny per session', 'Zone boundaries, host firewalls'],
              ['NIDS', 'Copy of traffic', 'Alert only', 'SPAN/TAP beside the path'],
              ['NIPS', 'Live inline traffic', 'Alert, drop, reject', 'Inline at the boundary'],
              ['WAF', 'Decoded HTTP(S) after termination', 'Allow, block, rate-limit per request', 'In front of web applications'],
              ['Forward proxy', 'Client egress requests', 'Allow/deny/log per destination', 'Between clients and internet']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every device in this lesson shapes what your testing traffic looks like and what the defenders see. Knowing the layout tells you which findings are visible to blue teams, which payloads will be rewritten or blocked, and why a scan from the lab behaved differently than from the client network. It also feeds directly into reporting: "the IDS alerted but the IPS did not block" is a very different recommendation than "nothing saw this at all".'
          },
          {
            type: 'list',
            items: [
              'Default-allow policies and any/any rules are among the most common real findings in firewall reviews',
              'A WAF in front of a target changes web testing: expect blocking, watch for bypass classes, and report evasions responsibly',
              'Encrypted traffic is opaque to network devices unless they terminate TLS — many detections live at endpoints instead',
              'Stateful expectations matter: an IDS placed where it never sees both directions of a session produces garbage'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Firewall policies with default-allow bottoms, wide any/any rules, or rules older than the people who wrote them',
              'Management ports (SSH, RDP, hypervisor UIs) permitted from broad source ranges',
              'IDS sensors whose capture points miss whole segments, VLANs or IPv6',
              'TLS termination mismatches: a WAF or IDS inspecting traffic it can never decode',
              'Open or misconfigured forward proxies (an open proxy is a finding on its own)',
              'IPS in inline mode with default rules — check whether it would block your own scanners during a test window'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Inspect your own lab only',
            text:
              'Reading firewall rules and triggering IDS alerts is safe only on systems you own or are authorized to test. Never probe, scan or tune against third-party infrastructure.'
          },
          {
            type: 'p',
            text:
              'Two complementary exercises: review the rules (static) and test the behavior (dynamic). The static half reads the policy the way an auditor would; the dynamic half fires controlled traffic and observes what each device does.'
          },
          {
            type: 'terminal',
            title: 'Reading the rules, then watching the sensors',
            lines: [
              '$ sudo iptables -L INPUT -n -v --line-numbers | head -7',
              'Chain INPUT (policy DROP)',
              'num  pkts bytes target prot opt in out source    destination',
              '1    1204  92K  ACCEPT all  --  *  *  0.0.0.0/0  0.0.0.0/0  ctstate RELATED,ESTABLISHED',
              '2      31 1848 ACCEPT tcp  --  *  *  0.0.0.0/0  0.0.0.0/0  tcp dpt:22',
              '3     588  41K  ACCEPT tcp  --  *  *  0.0.0.0/0  0.0.0.0/0  tcp dpt:80',
              '$ grep -o "signature[^,]*" /var/log/suricata/eve.json | tail -3',
              '"signature":"ET SCAN Potential SYN Scan"',
              '"signature":"SURICATA STREAM excessive retransmissions"',
              '"signature":"ET SCAN Nmap OS Detection Probe"'
            ]
          },
          {
            type: 'p',
            text:
              'The policy above is a healthy default-drop stateful set. The Suricata lines show the same lab from the detection side: a default nmap scan was seen and classified. Rerun the scan with -T2 (slow timing, module n05) and compare how much reaches the log — that contrast is your first detection-vs-timing lesson.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'In the lab: put Suricata on a SPAN-style capture point (or just have it sniff the bridge interface), then scan the target with nmap -sS. The eve.json log fills with scan-related signatures within seconds. Now apply the same scan through a firewall chain that rate-limits new connections — the IDS still sees the probes, the connection attempts slow down, and the scan takes minutes instead of seconds. You have demonstrated, on real packets, why controls must be evaluated as a system rather than one device at a time.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Detection is evidence too',
            text:
              'When an IDS alerts during your authorized test, note it. Correlating your actions with defensive telemetry is exactly how professional teams validate coverage — and it is a skill employers explicitly look for.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['iptables / nftables', 'Stateful filtering on Linux; the lab firewall you can read and rewrite freely'],
              ['Suricata / Snort', 'Open-source NIDS/NIPS engines; eve.json is your detection evidence trail'],
              ['ModSecurity + OWASP CRS', 'The reference WAF stack for lab web testing'],
              ['nmap', 'Controlled traffic generator for observing what each device does'],
              ['Wireshark', 'Verify on the wire what was sent, blocked, or rewritten (module n06)']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing IDS (detects, cannot block) with IPS (inline, can block — and can break things)',
              'Assuming a network firewall understands HTTP; L7 decisions belong to WAFs and proxies',
              'Forgetting that encrypted traffic hides content from network devices unless TLS terminates there',
              'Testing a WAF with a single payload and concluding it is strong (or weak) — rules match families of patterns',
              'Ignoring checksum-offload false positives when reading IDS logs from local captures'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Install Suricata on a lab sensor (a VM sniffing your lab bridge is enough), run a default nmap scan against a lab target, and find the corresponding alerts in /var/log/suricata/eve.json. Then write one iptables rule on the target that rate-limits new SYNs and observe how the scan and the alerts change. Write down: which control did the work, and which one only watched?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'What a device can decide is bounded by what it can see: packets, sessions, HTTP, or decrypted streams',
              'Stateful filtering made stateless port-replies obsolete; read policies with that model in mind',
              'NIDS alerts beside the path, NIPS blocks inline, HIDS watches the host; signatures are precise, anomalies are broad',
              'WAFs and proxies operate on decoded web traffic and complement — never replace — network controls'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n04-l03-q1',
          type: 'mcq',
          prompt: 'What is the core difference between a stateless and a stateful firewall?',
          options: [
            'A stateful firewall tracks connection state, so replies to sessions initiated from inside are accepted without explicit rules',
            'A stateless firewall decrypts traffic while a stateful firewall does not',
            'A stateful firewall only works at the application layer',
            'A stateless firewall is always faster and more secure'
          ],
          answerIndex: 0,
          hint: 'Think about the state table and what "ESTABLISHED" means.',
          explanation:
            'Stateful firewalls keep a table of active connections and automatically permit reply traffic belonging to those connections. Stateless filters judge each packet in isolation, which makes them weak at distinguishing replies from new initiations.'
        },
        {
          id: 'n04-l03-q2',
          type: 'mcq',
          prompt: 'An IDS is positioned on a SPAN port and a WAF sits in front of the web app. A SQL injection attempt is sent over HTTPS to the app. Which statement is correct?',
          options: [
            'The IDS can alert only if it can decode the traffic; the WAF can act if TLS terminates at or before it',
            'Both devices always see the full decrypted content of HTTPS requests',
            'The IDS can block the request inline while the WAF can only alert',
            'The WAF sees nothing because network devices cannot process port 443'
          ],
          answerIndex: 0,
          hint: 'For each device ask first: what can it actually see, given TLS?',
          explanation:
            'Network sensors only analyze what they can decode — encrypted traffic yields metadata, not payloads. WAFs act on decoded HTTP, which requires TLS termination at or upstream of them. The IDS on a SPAN port cannot block anything regardless.'
        },
        {
          id: 'n04-l03-q3',
          type: 'truefalse',
          prompt: 'Deploying a WAF in front of a web application removes the need for patching the application itself.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Defense in depth means layers add work for the attacker, not that one layer is sufficient.',
          explanation:
            'A WAF filters known malicious request patterns but cannot fix logic flaws, and determined attackers bypass filters. It reduces noise and buys time; the underlying application still needs patching and secure code.'
        },
        {
          id: 'n04-l03-q4',
          type: 'short',
          prompt: 'State one practical difference between a NIDS and an HIDS, including where each gets its data.',
          modelAnswer:
            'A NIDS watches network traffic from a capture point (SPAN/TAP/interface) and reports on protocol- and pattern-level events crossing the wire. An HIDS monitors a single host — log files, file integrity, configuration, system calls — and sees local activity that never touches the network. One is blind to host-only events, the other is blind to the network beyond its own box.',
          hint: 'Traffic on the wire versus activity on a box.',
          explanation:
            'The two see different worlds. Real programs deploy both: NIDS catches lateral and network-borne events, HIDS catches what happens on the endpoint where encryption and local abuse hide.'
        },
        {
          id: 'n04-l03-q5',
          type: 'scenario',
          prompt:
            'During an authorized test, your scan triggered IDS alerts but no blocking occurred, and you later find a firewall rule allowing any traffic from your source subnet. Write the two findings these observations produce.',
          modelAnswer:
            'Finding 1 (firewall policy): an any-source allow rule defeats the boundary — any host on that subnet can reach protected zones, so the default-deny posture exists only on paper. Recommendation: remove the broad rule, allow only the specific hosts and ports the test or business flow needs, and log cross-zone denies. Finding 2 (detection/response gap): the IDS produced alerts but no response followed — detection without escalation or a blocking path (inline IPS or firewall integration) gives defenders visibility but no control. Recommendation: wire alerts into the response process and consider inline blocking for high-confidence signatures.',
          hint: 'One observation is about policy, the other about what happens after detection.',
          explanation:
            'This pair is extremely common in real assessments: a policy hole plus a detection-to-action gap. Separating them produces two concrete, testable recommendations instead of one vague "improve security".'
        }
      ],
      references: [
        {
          title: 'NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-41/rev-1/final',
          note: 'Official firewall architecture and policy guidance, including DMZ and rule design.'
        },
        {
          title: 'NIST SP 800-94 — Guide to Intrusion Detection and Prevention Systems',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-94/final',
          note: 'The canonical NIDS/NIPS/HIDS reference: placement, detection models, tuning.'
        },
        {
          title: 'OWASP Web Security Testing Guide',
          url: 'https://owasp.org/www-project-web-security-testing-guide/',
          note: 'Where WAF behavior and web-facing controls meet testing methodology.'
        }
      ]
    },
    {
      id: 'n04-l04',
      moduleId: 'n04',
      title: 'VPNs, NAT, Zero Trust and Network Monitoring',
      difficulty: 'Beginner',
      minutes: 17,
      prerequisites: ['n04-l03'],
      objectives: [
        'Explain NAT flavors (static, dynamic, PAT) and their operational and forensic implications',
        'Describe VPN tunnels conceptually: site-to-site and remote access, IPsec and TLS-based',
        'State the core zero trust principles and what micro-segmentation changes',
        'Outline the sources and purpose of network monitoring, logging and SIEM'
      ],
      diagram: 'net-vpn',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Three shifts define modern network security practice. NAT rewrote addressing so that thousands of hosts share one public identity. VPNs extend private networks across untrusted transport, which quietly changes where your trust boundary actually sits. And zero trust removes the old assumption that being inside the network means being trusted. None of these are tools you exploit directly — they are the context that decides what your scans mean, what the logs will show, and where an attacker can hide.'
          },
          {
            type: 'p',
            text:
              'Monitoring is the fourth shift: a network that is not observed cannot be defended, and almost every pentest deliverable includes recommendations about logging. Understanding what gets recorded — connection logs, flow records, alerts, packet captures — tells you both what defenders will see during your test and what evidence your own findings will rest on.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'NAT'
          },
          {
            type: 'p',
            text:
              'Network Address Translation rewrites IP addresses (and for PAT, ports) as traffic crosses a boundary. Static NAT maps one private address to one public address permanently — used to publish an internal server. Dynamic NAT draws from a public pool on demand. PAT (port address translation, the "many-to-one" NAT every home router does) multiplexes thousands of private hosts behind one public IP by rewriting source ports and keeping a translation table. Consequences that matter to you: inbound connections cannot reach untranslated hosts (a de-facto filter), source addresses in logs are the NAT device, not the originator, and some protocols that embed addresses in payloads misbehave through NAT.'
          },
          {
            type: 'h',
            text: 'VPNs'
          },
          {
            type: 'p',
            text:
              'A VPN builds an encrypted tunnel across untrusted networks so remote sites and users behave as if they were inside. Site-to-site tunnels (typically IPsec between gateways) join whole networks; remote-access VPNs join individual users, either via IPsec/IKEv2 or TLS-based approaches (OpenVPN, WireGuard). The security caveat is the point for this module: a VPN grants network-level presence, and everything after the tunnel inherits the trust of wherever it lands. Classic remote-access design — one big internal network behind the tunnel — is exactly the implicit trust zero trust tries to remove.'
          },
          {
            type: 'diagram',
            id: 'net-vpn',
            caption: 'Site-to-site and remote-access tunnels extend the private network across untrusted transport.'
          },
          {
            type: 'h',
            text: 'Zero trust'
          },
          {
            type: 'p',
            text:
              'Zero trust (formalized in NIST SP 800-207) replaces network location as the basis of trust. Its core ideas: verify explicitly (every request is authenticated and authorized using identity, device posture and context, not just IP), use least-privilege access (just-enough, just-in-time), and assume breach (design, segment and monitor as if the attacker is already inside). Micro-segmentation is the enforcement pattern: policy follows workloads and identities, cutting east-west traffic into small cells, so a foothold on one service does not confer reach to its neighbors.'
          },
          {
            type: 'h',
            text: 'Monitoring and logging'
          },
          {
            type: 'p',
            text:
              'Observability comes from a stack of sources: host and firewall logs, DNS and DHCP logs, NetFlow/IPFIX flow records (who talked to whom, when, how much), IDS alerts, and packet captures for deep dives. A SIEM aggregates and correlates these into alerts and cases. Two properties decide whether any of it is useful: time synchronization (NTP everywhere, or correlation fails) and retention/integrity (logs you cannot trust or no longer have prove nothing).'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'NAT explains why attribution in shared environments is hard: five workstations, one public IP, and the logs only show the gateway. It also explains scope disputes — your scanner may appear as a completely different address than you expect. VPN endpoints are priority targets in real engagements because one misconfigured concentrator hands out internal presence. Zero trust changes the meaning of "inside": lateral movement is no longer about subnets but about identities and policy edges, which is what your internal tests (module level 7) will probe. And monitoring knowledge makes you a better reporting partner: knowing what the blue team saw during your test is how coverage gaps get fixed.'
          },
          {
            type: 'list',
            items: [
              'Log attribution: expect NAT devices to mask origins; document your own source addresses per phase',
              'VPN concentrators, MFA gaps and shared accounts are recurring real-world findings',
              'Zero trust maturity shows up as east-west behavior: probe whether policy follows identity or just subnets',
              'Logging findings (no time sync, no retention, silent segments) are report items in their own right'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Shared public IPs and PAT boundaries where per-host attribution is impossible',
              'VPN concentrators reachable externally, legacy tunnels without MFA, and site-to-site links into flat networks',
              'Implicit trust after tunnel establishment: can a remote user reach management systems directly?',
              'Segments producing no logs or flows at all — the "silent zones" of most networks',
              'Missing time synchronization across devices (check for drifting timestamps in correlated events)',
              'Zero-trust claims to verify: is east-west traffic actually filtered, or only north-south?'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lab boundaries only',
            text:
              'Tunnel setup, translation inspection and log review belong on lab infrastructure or authorized scope. Connecting to, or probing, third-party VPNs and NAT devices without authorization is unlawful.'
          },
          {
            type: 'p',
            text:
              'Build the smallest possible lab for all three ideas: one Linux gateway doing NAT between two subnets, a WireGuard tunnel from your workstation to a second lab host, and a syslog/journald sink collecting firewall logs. Then watch the translation table and the tunnel state while generating traffic.'
          },
          {
            type: 'terminal',
            title: 'Watching NAT, VPN and logs in a lab',
            lines: [
              '$ sudo conntrack -L -p tcp | head -2',
              'tcp 6 431996 ESTABLISHED src=10.0.2.15 dst=93.184.216.34 sport=52000 dport=443 src=93.184.216.34 dst=203.0.113.7 sport=443 dport=52000 [ASSURED] mark=0 use=1',
              '$ sudo iptables -t nat -L POSTROUTING -n -v',
              'Chain POSTROUTING (policy ACCEPT)',
              'target     prot opt source      destination',
              'MASQUERADE all  --  10.0.2.0/24  0.0.0.0/0',
              '$ wg show',
              'interface: wg0',
              '  listening port: 51820',
              'peer: bX7k...',
              '  endpoint: 203.0.113.50:51820',
              '  allowed ips: 10.10.20.0/24',
              '  latest handshake: 1 minute, 12 seconds ago',
              '  transfer: 1.35 MiB received, 872 KiB sent'
            ]
          },
          {
            type: 'p',
            text:
              'The conntrack line is the whole NAT story in one row: the internal host 10.0.2.15 talking to the internet as 203.0.113.7. The wg show output is the tunnel health check you will reuse in real engagements. Finally, generate a denied connection and find it in the firewall log with a correct timestamp — that loop (action, evidence, time) is the monitoring habit this module wants you to build.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A classic lab experiment: three VMs behind a PAT gateway download from the same server. On the server, tcpdump shows one source IP with three different ports; on the gateway, conntrack shows the three translations side by side. Now imagine that server gets attacked — the incident responder sees one IP. That single exercise teaches why attribution, rate limiting and logging recommendations look the way they do in every professional report.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Zero trust in one sentence',
            text:
              'If you can predict which requests will be allowed from a network diagram alone, the environment is not zero trust — policy must depend on identity and context, not just topology.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['conntrack', 'Inspect the live NAT/state table on Linux gateways'],
              ['iptables -t nat / nft list ruleset', 'Read and build the translation and filtering policy'],
              ['WireGuard / OpenVPN', 'Reference tunnel implementations for lab VPNs'],
              ['tcpdump / Wireshark', 'See what the far side actually observes (module n06)'],
              ['Suricata, Zeek, ELK/Wazuh (mention)', 'The alert/flow/log stack that turns traffic into monitoring']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Calling NAT a security control: it blocks unsolicited inbound by accident, and offers nothing against an allowed path',
              'Treating "connected to the VPN" as "authenticated for everything" — tunnel presence is not per-application authorization',
              'Assuming logs show the real client behind NAT; they show the translator unless extra context exists',
              'Correlating events without synchronized clocks — whole incident timelines become fiction',
              'Reading zero trust as a product you can buy; it is an architecture of verification, least privilege and assumed breach'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Set up a Linux VM as a NAT gateway for a second VM, run conntrack -L while the client browses, and pick out one full translation line. Then stand up a two-host WireGuard tunnel, ping across it, and confirm in wg show that traffic flows. Finish by checking the timestamps of both logs against a third clock — how far apart are they?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'NAT flavors differ in mapping: static (1:1), dynamic (pool), PAT (many-to-one with ports)',
              'NAT hides origins and blocks unsolicited inbound as a side effect — never as a designed control',
              'VPNs move trust: everything behind the tunnel inherits the landing network\u2019s assumptions',
              'Zero trust = verify explicitly, least privilege, assume breach, with micro-segmentation as enforcement',
              'Logs, flows, alerts and captures only work with time sync, retention and integrity'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n04-l04-q1',
          type: 'mcq',
          prompt: 'What does PAT (port address translation, many-to-one NAT) actually track to demultiplex return traffic?',
          options: [
            'The destination MAC addresses of each client',
            'A translation table mapping internal host+port to public port per connection',
            'A separate public IP address per internal client',
            'The TTL value of each packet'
          ],
          answerIndex: 1,
          hint: 'Thousands of hosts share one public IP — what has to differ for replies to find their way back?',
          explanation:
            'PAT rewrites each connection\u2019s source port so the gateway can match returning packets to the originating internal host and port. The translation table (visible via conntrack) is the live record of those mappings.'
        },
        {
          id: 'n04-l04-q2',
          type: 'truefalse',
          prompt: 'NAT should be documented as a security control in a network assessment report.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Ask whether it blocks anything an allowed path could not carry.',
          explanation:
            'NAT prevents unsolicited inbound connections as a side effect of translation, but it provides no policy, no inspection and no protection on allowed flows. Treating it as a control creates false confidence.'
        },
        {
          id: 'n04-l04-q3',
          type: 'short',
          prompt: 'Define micro-segmentation in one or two sentences and explain what it changes for lateral movement.',
          modelAnswer:
            'Micro-segmentation enforces policy between individual workloads or identity-based groups rather than only at network zone boundaries, typically cutting east-west traffic to the minimum each workload needs. It changes lateral movement from "any host in the zone can reach any other" to "each hop needs its own authorization", dramatically shrinking blast radius after a foothold.',
          hint: 'It is the enforcement pattern of zero trust inside the data center.',
          explanation:
            'This is the core zero-trust enforcement idea from NIST SP 800-207: policy follows identities and workloads, so network location alone no longer grants reach.'
        },
        {
          id: 'n04-l04-q4',
          type: 'scenario',
          prompt:
            'An analyst investigating an incident finds that all attack traffic in the perimeter firewall log comes from a single public IP, yet three internal workstations were involved. Explain the likely cause and two implications for response and for future testing.',
          modelAnswer:
            'Cause: the outbound path uses PAT, so every internal host shares the gateway\u2019s public IP; the firewall log cannot distinguish which workstation originated which session without additional context (NAT translation logs, switch/DHCP data, endpoint logs). Implication for response: correlate firewall events with NAT translation records, DHCP lease history and host telemetry to recover per-host attribution, and preserve the NAT table or its logs early. Implication for testing: expect the same effect for your own scans — document your source addresses per phase, and recommend logging improvements (per-host flow records, NAT logging) as a report finding because attribution gaps hurt defenders the most.',
          hint: 'One public IP, many hosts — which device did the rewriting?',
          explanation:
            'This is the practical forensic cost of PAT and a direct link between this module and real incident response: whatever hides the originator from the attacker also hides it from the defenders unless extra logging exists.'
        }
      ],
      references: [
        {
          title: 'NIST SP 800-207 — Zero Trust Architecture',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-207/final',
          note: 'The formal definition of zero trust: PDP/PE, micro-segmentation, assume breach.'
        },
        {
          title: 'RFC 3022 — Traditional IP Network Address Translator (Traditional NAT)',
          url: 'https://datatracker.ietf.org/doc/html/rfc3022',
          note: 'The protocol-level definition of basic NAT and NAPT (PAT).'
        },
        {
          title: 'RFC 1918 — Address Allocation for Private Internets',
          url: 'https://datatracker.ietf.org/doc/html/rfc1918',
          note: 'Why private ranges exist and how they interact with translation.'
        },
        {
          title: 'NIST SP 800-92 — Guide to Computer Security Log Management',
          url: 'https://csrc.nist.gov/publications/detail/sp/800-92/final',
          note: 'Official guidance for the logging side of network monitoring.'
        }
      ]
    }
  ]
};
