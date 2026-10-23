import type { Module } from '../../../../types';

// LEVEL 6 — ATTACK CONCEPTS (LAB-ONLY MODULE) · Module n09: Common Network Attacks
// Original curriculum content for the Network Security & Pentesting Academy.
// This module teaches how common network attacks WORK — at the packet level —
// together with their indicators, detection controls and remediations. Every
// technique is conceptual and is practiced EXCLUSIVELY in controlled lab
// environments you own (your own VMs, deliberately vulnerable distributions).
// Nothing here is a playbook for use against third-party systems; running
// these techniques against networks you are not authorized to test is a crime.

export const n09: Module = {
  id: 'n09',
  title: 'Common Network Attacks',
  level: 6,
  description:
    'How common network attacks actually work, taught as concepts plus controlled lab environments only: ARP spoofing and the man-in-the-middle position, DNS and DHCP abuse, credential attacks through sniffing, brute force and password spraying, and layer 2 techniques such as MAC flooding and VLAN hopping. Every lesson pairs the packet-level mechanics with the indicators defenders see, the detection controls that catch the attack, and the remediations that remove it — and every exercise happens exclusively on lab machines you own.',
  outcomes: [
    'Explain ARP, DNS, DHCP and layer 2 attacks at the packet level, including the trust assumption each one abuses',
    'Recognize the indicators these attacks produce on the wire and in logs',
    'Select and justify layered defenses: dynamic ARP inspection, DHCP snooping, DNSSEC, rate limiting, port security and segmentation',
    'Reproduce each concept only against lab machines you own, with full authorization, and document the defense that stops it'
  ],
  lessons: [
    {
      id: 'n09-l01',
      moduleId: 'n09',
      title: 'ARP Spoofing and Man-in-the-Middle Concepts',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n06-l04'],
      objectives: [
        'Explain why the ARP protocol design allows unsolicited cache updates',
        'Describe the ARP poisoning concept and what a man-in-the-middle position is worth',
        'Recognize the on-the-wire and host-level indicators of ARP spoofing',
        'Justify the layered defenses that defeat it: dynamic ARP inspection, 802.1X and monitoring'
      ],
      diagram: 'net-arp-spoofing',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every useful LAN needs a way to answer one question constantly: which MAC address owns this IP address? ARP is that answer service, and it was designed in an era when the network\u2019s members were assumed to be honest. The protocol has no authentication, no verification, and a host will happily update its ARP cache from an answer it never asked for. ARP spoofing is the abuse of that trust: tell two hosts mutually convincing lies about each other\u2019s addresses and their traffic — the data they meant to send to the router, to a file server, to each other — flows through you instead.'
          },
          {
            type: 'p',
            text:
              'What is that position worth? Everything short of breaking encryption. A man in the middle observes traffic (capturing credentials, tokens, session identifiers, file transfers), can modify unencrypted traffic, can downgrade or block traffic, and can relay traffic so smoothly that neither endpoint notices. It is the classic vantage-point attack: not an exploit of any particular application, but a theft of the network layer everyone implicitly trusts. That is also why defenders treat it as a top-tier threat model for any segment that holds sensitive traffic.'
          },
          {
            type: 'p',
            text:
              'This lesson teaches the concept deeply and the defense practically. The attack mechanics are learned on paper and in a lab you own — two VMs and an attacker VM on a private bridge — never against shared or production networks, where ARP spoofing is both a crime and a service outage waiting to happen.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-arp-spoofing',
            caption: 'ARP poisoning: the attacker answers for both the victim and the gateway, placing itself on the path between them.'
          },
          { type: 'h', text: 'The trust assumption in the protocol' },
          {
            type: 'p',
            text:
              'The original ARP specification (RFC 826) defines a simple exchange: a host broadcasts a request (who has 192.168.1.1?), the owner replies, and the requester caches the answer. Three design decisions make it spoofable. First, statelessness: hosts accept ARP replies without having sent a matching request — an unsolicited reply is processed and cached anyway. Second, cache overwrite: a later reply replaces an earlier mapping, so the most recent liar wins. Third, no authentication: nothing in the packet proves the sender owns the claimed address. Add the gratuitous ARP — an unsolicited announcement hosts send when their address changes — and the protocol offers a complete, quiet overwrite channel: anyone on the segment can claim any IP at any time, for any host.'
          },
          { type: 'h', text: 'The poisoning concept' },
          {
            type: 'p',
            text:
              'Poisoning two hosts in opposite directions creates the man-in-the-middle position: tell the victim that the gateway\u2019s IP maps to your MAC, and tell the gateway that the victim\u2019s IP maps to your MAC. Now the victim\u2019s outbound traffic arrives at the attacker, and the attacker must forward it to the real gateway — relaying is what keeps the session alive and the victim oblivious. The relay requirement is also the attacker\u2019s weakness: forwarding is continuous work, a dropped relay is an instant outage, and the position itself is fragile. The attack operates entirely at layer 2 within one broadcast domain; it does not cross routers, which is why segmentation (the next lessons) is part of every defense.'
          },
          { type: 'h', text: 'Detection: what defenders actually see' },
          {
            type: 'p',
            text:
              'ARP spoofing is loud if you know where to look. On the wire: a burst of unsolicited ARP replies, one MAC address claiming many IPs, duplicate IP warnings in Wireshark\u2019s expert information, and gratuitous ARP storms. On hosts: the neighbor table (ip neigh) showing the gateway\u2019s MAC suddenly matching another host\u2019s — or two IPs sharing one MAC. In the network: the definitive control is Dynamic ARP Inspection (DAI) on switches, which validates every ARP packet against the DHCP snooping binding table and drops invalid claims, logging them as events. Static ARP entries (arp -s on servers) defeat poisoning for that pair but do not scale; the switch-side control does.'
          },
          { type: 'h', text: 'Remediation in layers' },
          {
            type: 'list',
            items: [
              'Switch level: enable DAI on user-facing ports (it depends on DHCP snooping bindings, so both ship together); configure ARP ACLs for hosts with static addresses',
              'Access control: 802.1X so unauthenticated devices never join the segment in the first place',
              'Monitoring: alert on gratuitous ARP anomalies and duplicate-IP events; watch switch DAI drop counters',
              'Encryption: TLS everywhere shrinks what a MITM position is worth — ARP spoofing on a fully encrypted network yields mostly metadata and denial of service',
              'Segmentation: smaller broadcast domains mean a poisoning attacker reaches fewer pairs in the first place'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lab only — this is the rule for the whole module',
            text:
              'ARP spoofing tools and techniques are demonstrated exclusively against networks you own: your own two-VM lab on a private virtual bridge. Running them against any network you are not explicitly authorized to test is a criminal offense in most jurisdictions, disrupts real users, and — unlike most mistakes — is trivially visible to defenders. There is no operational walkthrough in this course on purpose; the concept, the indicators and the defense are the deliverables.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'For attackers, the MITM position is the highest-value vantage point short of a host compromise, which is why authorized internal assessments model it: can a device on the user segment intercept traffic to the gateway or to servers? For defenders, every lesson here doubles as a detection checklist. The technique also maps formally onto MITRE ATT&CK: Adversary-in-the-Middle: ARP Cache Poisoning (T1557.002) sits in the MITM technique family that blue teams explicitly monitor for.'
          },
          {
            type: 'list',
            items: [
              'Assessment angle: verify DAI is actually enabled on access switches, not just documented — it is a common gap between paper and configuration',
              'Detection angle: duplicate-IP alarms and unsolicited ARP bursts are cheap, high-signal detections',
              'Encryption angle: measure what plaintext remains on the segment; every cleartext protocol multiplies the MITM payoff',
              'Reporting angle: findings state the control gap (no DAI, no 802.1X, flat segment), not just the technique'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'One MAC address answering ARP for multiple IP addresses on the segment',
              'Unsolicited ARP replies and gratuitous ARP bursts in captures — volume and timing anomalies matter',
              'Neighbor tables where the gateway IP and another host share a MAC, or where a MAC flips back and forth (flapping)',
              'Wireshark duplicate-use-of-IP expert warnings during lab exercises',
              'Switches without DAI/DHCP snooping on access ports, and segments where 802.1X is absent'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Observation only, on machines you own',
            text:
              'The exercises here observe and defend; they do not execute the attack. Build a private lab (two VMs plus a test VM on a virtual bridge you own) and study ARP behavior there. Never run spoofing tools against shared, corporate, campus or home-of-others networks — the line is ownership and written authorization, nothing else.'
          },
          {
            type: 'p',
            text:
              'Learn the normal first: on your own lab VM, record what healthy ARP looks like, and keep the capture running while you work:'
          },
          {
            type: 'terminal',
            title: 'Baseline and detection drills on your own lab',
            lines: [
              '$ ip neigh show dev eth0',
              '192.168.100.1 dev eth0 lladdr 52:54:00:12:00:01 REACHABLE',
              '192.168.100.50 dev eth0 lladdr 52:54:00:12:00:50 STALE',
              '# Baseline: one MAC per IP. Note the gateway MAC.',
              '$ sudo tshark -i eth0 -Y arp -T fields -e arp.opcode -e arp.src.protoaddr -e arp.src.hwaddr',
              '1  192.168.100.2  52:54:00:12:00:02',
              '2  192.168.100.1  52:54:00:12:00:01',
              '# Normal traffic: requests (opcode 1) and honest replies (opcode 2).',
              '# Detection drill: alert if any src.hwaddr answers for an IP it did not own',
              '# in the baseline, or if opcode-2 replies arrive with no matching request.'
            ]
          },
          {
            type: 'p',
            text:
              'With the baseline captured, the detection logic writes itself: a MAC claiming an IP it did not hold at baseline, reply storms, or the gateway MAC changing mid-session are the alerts. On managed switches you would confirm the same picture from DAI logs instead of the wire.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab narrative, start to finish. On a private bridge sit victim VM (192.168.100.50), gateway VM (192.168.100.1) and a test VM. The test VM is configured (by you, on your own machines) to answer ARP for both IPs; within seconds the victim\u2019s ip neigh shows the gateway at the test VM\u2019s MAC, Wireshark on a monitoring port fills with duplicate-IP warnings, and the victim\u2019s internet-bound traffic routes through the test VM — which relays it, and the session survives. Then the defense: DAI is enabled on the lab switch (or its VM equivalent), the lying replies are dropped and logged, the cache stays honest, and the relay starves. Both halves of that story — the mechanics on paper, the defense in configuration — are the lesson; the middle step exists only inside your own lab boundary.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Why concept-first is the professional way',
            text:
              'Assessors who only know which buttons to click cannot explain impact, prioritize remediations, or design detections. Understanding RFC 826\u2019s trust assumption is what lets you argue for DAI budget in a meeting — and that argument, not the tool invocation, is the billable skill.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in this lesson (defense and observation)'],
            rows: [
              ['Wireshark / tshark', 'Observe ARP behavior, expert-info duplicate-IP warnings, and build detection filters'],
              ['ip neigh', 'Read the host\u2019s neighbor table; the first place cache poisoning shows'],
              ['Switch with DAI + DHCP snooping', 'The definitive control: validate ARP against the snooping binding table, drop and log'],
              ['802.1X (with a RADIUS server)', 'Prevents unauthenticated devices from joining the segment at all'],
              ['Your own virtual bridge', 'The only sanctioned environment for studying attack mechanics']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Practicing spoofing on any network that is not yours — university, corporate, hotel and home networks of others all fail the ownership test',
              'Confusing ARP spoofing (layer 2, same segment) with DNS spoofing (layer 7, resolver abuse) — different protocols, different defenses',
              'Treating static ARP entries as an enterprise fix; they do not scale past a handful of server pairs',
              'Enabling DAI without DHCP snooping (or ARP ACLs for static-address hosts), which drops legitimate static hosts',
              'Assuming full TLS makes ARP attacks harmless — the MITM still gains metadata and a denial-of-service position'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your own lab, build the three-VM bridge, capture ten minutes of honest ARP traffic, and write the detection rules you derived from the baseline (MAC-per-IP map, unsolicited-reply rule, gateway-MAC stability). Then, on paper, trace exactly which switch feature (DAI, DHCP snooping, 802.1X) would have defeated each lying packet you conceptualized — you have just written the detection section of a real report.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'ARP is spoofable by design: stateless acceptance, cache overwrite, no authentication (RFC 826)',
              'Poisoning two hosts in opposite directions creates the MITM position; relaying is what sustains it — and exposes it',
              'Detection lives in three places: the wire (unsolicited replies, duplicate IPs), hosts (neighbor tables) and switches (DAI logs)',
              'The defense stack is DAI plus DHCP snooping bindings, 802.1X, monitoring, encryption and segmentation — layered, not single',
              'Attack practice belongs only on lab machines you own; the concept plus the defense is the professional deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n09-l01-q1',
          type: 'mcq',
          prompt: 'Which property of ARP, documented in RFC 826, is the one that makes poisoning possible?',
          options: [
            'ARP requests are broadcast to every host on the segment',
            'Hosts accept and cache ARP replies without authentication, even unsolicited ones',
            'ARP caches time out after a few minutes',
            'ARP works only for IPv4'
          ],
          answerIndex: 1,
          hint: 'Broadcasting a question is fine — the problem is who is allowed to answer, and how they prove it.',
          explanation:
            'Broadcasting is normal and cache timeouts are a feature. The exploitable design is the trust model: replies are unauthenticated, accepted without a matching request, and overwrite earlier mappings. Every mitigation (DAI, static entries, monitoring) attacks one of those three properties.'
        },
        {
          id: 'n09-l01-q2',
          type: 'truefalse',
          prompt: 'A man in the middle created by ARP spoofing can read TLS-encrypted web traffic\u2019s content without detection.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does a valid certificate chain do to a relay that is not the real server?',
          explanation:
            'TLS authenticates the endpoint: a MITM relaying HTTPS cannot decrypt content without a certificate the client trusts, and attempts to substitute one trigger warnings. The position still yields metadata (DNS, SNI, timing, volumes) and a denial-of-service capability — which is why encryption reduces but does not eliminate the finding.'
        },
        {
          id: 'n09-l01-q3',
          type: 'short',
          prompt: 'Name three indicators of ARP spoofing and the layer at which each is observed (wire, host, or switch).',
          modelAnswer:
            'Wire: a burst of unsolicited ARP replies, or one MAC address claiming multiple IP addresses (visible in captures and in Wireshark duplicate-IP expert info). Host: the neighbor table showing the gateway IP bound to a foreign MAC, or a MAC flapping between two addresses. Switch: Dynamic ARP Inspection drop counters and logged invalid-ARP events on access ports. A complete detection posture watches all three, with the switch-level control being the authoritative one.',
          hint: 'The lesson organized detection into exactly three places.',
          explanation:
            'Multi-layer detection is the defensive lesson of the whole module: any single indicator can be noisy or absent, but correlated wire, host and switch evidence is both reliable and fast — and it maps directly onto how SOC teams actually instrument a network.'
        },
        {
          id: 'n09-l01-q4',
          type: 'scenario',
          prompt:
            'A client\u2019s network has flat user segments, no 802.1X, and DAI configured on the core switches only. An assessor notes that a man-in-the-middle position is achievable on user segments. Write the finding\u2019s remediation section, prioritized, and justify the order.',
          modelAnswer:
            'Priority 1: enable DAI (with DHCP snooping to build binding tables, and ARP ACLs for static-address hosts) on access switches — it is the authoritative control that drops lying ARP packets at the point of origin, and it is configuration on existing hardware. Priority 2: deploy 802.1X on access ports so unauthenticated or rogue devices never join the segment — it removes the attack\u2019s precondition rather than its packets. Priority 3: enable monitoring — alert on DAI drops, duplicate-IP events and gratuitous-ARP anomalies — so attempts become visible. Priority 4: shrink broadcast domains through segmentation and keep TLS coverage high, which reduces both the reachable pairs and the value of any future MITM. Justification: remediation order follows control strength per effort — the switch feature is near-free and stops the attack outright, identity controls raise the bar structurally, monitoring catches what remains, and architectural changes take longest but shrink the blast radius.',
          hint: 'Which control stops the packets, which stops the device, which catches the attempt, and which shrinks the blast radius?',
          explanation:
            'A strong remediation section is ordered by control effectiveness against cost, not by a vendor list. DAI-plus-snooping stops the packets, 802.1X stops the device, monitoring provides visibility, and segmentation plus encryption shrink the payoff — the same layered-defense logic this lesson teaches.'
        }
      ],
      references: [
        {
          title: 'RFC 826 — An Ethernet Address Resolution Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc826.html',
          note: 'The ARP specification — read it to see, in one page, the trust assumption the attack abuses.'
        },
        {
          title: 'MITRE ATT&CK — T1557.002 Adversary-in-the-Middle: ARP Cache Poisoning',
          url: 'https://attack.mitre.org/techniques/T1557/002/',
          note: 'The defender\u2019s formal model of this technique, with detection data sources.'
        },
        {
          title: 'MITRE ATT&CK — T1557 Adversary-in-the-Middle',
          url: 'https://attack.mitre.org/techniques/T1557/',
          note: 'The parent technique family: position-based interception across protocols.'
        }
      ]
    },
    {
      id: 'n09-l02',
      moduleId: 'n09',
      title: 'DNS and DHCP Attack Concepts',
      difficulty: 'Intermediate',
      minutes: 16,
      prerequisites: ['n09-l01'],
      objectives: [
        'Explain how DNS spoofing and cache poisoning abuse the resolver\u2019s trust in unsolicited answers',
        'Describe rogue DHCP and DHCP starvation concepts and what each enables',
        'Recognize the detection controls: DHCP snooping, DNSSEC validation and name-service monitoring',
        'Map each attack to its layered remediation, including where encrypted DNS helps and where it does not'
      ],
      diagram: 'net-dns-spoofing',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Two network services hand out truth: DHCP tells a host where to send its traffic (its address, its router, its resolver), and DNS tells it what name maps to that destination. An attacker who controls either answer controls the path without touching a single host. Answer DNS and bank.example.com resolves to you; answer DHCP and the default gateway — every host\u2019s route to everywhere — is you. Both are the man-in-the-middle idea from the previous lesson, relocated from the link layer to the infrastructure protocols hosts trust implicitly.'
          },
          {
            type: 'p',
            text:
              'The two attacks have different mechanics and a shared shape. DNS spoofing races the real resolver: forge a reply that arrives first and matches well enough to be believed, and the resolver caches your lie — possibly for hours, because you also supplied the TTL. Rogue DHCP simply answers faster than the legitimate server, because the DHCP protocol lets every candidate offer and the host takes one. In both cases the protocol trusted the answerer, and the defenses — DNSSEC, resolver randomization, DHCP snooping — are all ways of restoring verification to a trust relationship that had none.'
          },
          {
            type: 'p',
            text:
              'As everywhere in this module: concepts are studied deeply, practice happens only on lab machines you own, and the professional deliverable is the detection and remediation story.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-dns-spoofing',
            caption: 'The forged-answer race: the attacker\u2019s reply must beat the real resolver\u2019s and match the question\u2019s identifiers.'
          },
          { type: 'h', text: 'DNS spoofing and cache poisoning' },
          {
            type: 'p',
            text:
              'A DNS query carries a 16-bit transaction ID, and (classically) responses were accepted if they matched the ID, arrived on the right port from the right source, and matched the question. Guessing the ID before the real answer arrived was the classic forgery — feasible when resolvers used predictable IDs and fixed source ports. Modern resolvers randomize both the ID and the source port (RFC 5452 documents the resilience measures), raising the guesswork from thousands to billions of tries; the Kaminsky-style refinement kept the race alive by querying many random subdomains of the same target, giving each forged reply a cacheable landing spot even on failure. The endgame of a successful poisoning is durable: a cached lie keeps answering for its TTL, so poisoning one resolver serves every client behind it. The cryptographic fix is DNSSEC (RFC 4033): records carry signatures verifiable up the chain, so forged answers fail validation instead of merely failing to guess well.'
          },
          { type: 'h', text: 'Rogue DHCP and DHCP starvation' },
          {
            type: 'p',
            text:
              'DHCP leases configuration through the DORA exchange (Discover, Offer, Request, Acknowledge — revisited in the packet-analysis module), and nothing in classic DHCP authenticates the offerer. A rogue DHCP server on the segment simply offers first, and its Acknowledge is sovereign: it can set the default gateway and resolver to attacker-controlled addresses, turning every renewing host into a client of the MITM. DHCP starvation is the companion denial-of-service concept: request the entire lease pool with forged MAC addresses until legitimate clients get nothing — disruptive on its own and useful to attackers as a way of forcing hosts onto the rogue server, or simply as an availability attack. MITRE formalizes the configuration-poisoning variant as Adversary-in-the-Middle: DHCP Spoofing (T1557.003).'
          },
          { type: 'h', text: 'Detection and remediation' },
          {
            type: 'list',
            items: [
              'DHCP snooping on switches: classify ports as trusted (real DHCP servers) or untrusted; DROP offers and acknowledgments arriving on untrusted ports, and build the binding table that DAI reuses',
              'Monitor for multiple DHCP servers on one segment (duplicate DORA traffic) and for lease-pool exhaustion rates',
              'Validate DNS: deploy DNSSEC validation on resolvers, and monitor for validation failures and for anomalous answer patterns (mismatched IDs, too-perfect TTLs, answers without questions)',
              'Suppress LAN name-abuse paths: disable LLMNR and NetBIOS name services on Windows networks (the local name-resolution poisoning family is T1557.001)',
              'Encrypted DNS (DoT/DoH) protects queries from on-path observers but does not stop LAN-level poisoning of an unencrypted local resolver — the switch controls and DNSSEC do the work at the layer where the attack happens'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Concepts here, practice on your own machines only',
            text:
              'DNS and DHCP attacks against infrastructure you do not own are crimes with real victims — poisoning resolvers and answering DHCP on shared networks redirects real people\u2019s traffic. Study the mechanics conceptually; reproduce behavior only in a lab you built (your own DHCP server and resolver on a private bridge), and let the operational output of this lesson be detection rules and hardening recommendations.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Assessments ask two questions about these protocols: are the trust answers verifiable (DNSSEC deployed, resolver patched and randomized), and is the broadcast domain protected (snooping, DAI, port security)? The findings write themselves as control gaps. Defenders get the mirror image: T1557.001/002/003 are exactly the family of techniques their detection engineering should cover, and DNS/DHCP telemetry is among the cheapest high-signal monitoring an SOC can add.'
          },
          {
            type: 'list',
            items: [
              'Check resolver configuration for DNSSEC validation and current software — old resolver versions are their own finding',
              'Verify DHCP snooping trust boundaries: one misclassified trunk port silently disarms the control',
              'On Windows estates, LLMNR/NBT-NS left enabled is a standing local name-spoofing surface (T1557.001)',
              'Encrypted DNS deployments need resolver-level controls too, or the protection moves with the clients off your network'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Segments where multiple hosts answer DHCP (duplicate Offer/Acknowledge traffic in captures)',
              'Resolvers without DNSSEC validation, or running software versions years behind current releases',
              'DHCP snooping configured without matching DAI, or trunk ports misclassified as untrusted',
              'Windows networks with LLMNR and NetBIOS name resolution still enabled',
              'Long TTLs on internal records that would amplify any future poisoning, and caches that cannot be flushed quickly'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Your lab\u2019s infrastructure only',
            text:
              'Run your own DHCP server and resolver on machines you own to study the protocol behavior. Querying public resolvers read-only (a dig lookup) is fine; forging answers, running rogue servers or starving lease pools on any shared network is not. The exercises below observe and verify — the attack mechanics stay on paper and in your private lab.'
          },
          {
            type: 'p',
            text:
              'Two observation drills that build the detection muscle without attacking anything:'
          },
          {
            type: 'terminal',
            title: 'Watching the protocols your lab already runs',
            lines: [
              '# Drill 1: capture the DHCP lease cycle on your own lab segment',
              '$ sudo tshark -i eth0 -Y "dhcp || bootp" -T fields -e dhcp.message_type -e dhcp.ip.server',
              '1',
              '2  192.168.100.1',
              '3',
              '5  192.168.100.1',
              '# DORA: Discover(1), Offer(2), Request(3), Ack(5).',
              '# Detection rule: alert when message_type 2 or 5 arrives from an IP',
              '# that is not your documented DHCP server.',
              '# Drill 2: verify your resolver validates DNSSEC',
              '$ dig +dnssec https://www.example.com | grep -E "flags|status"',
              ';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42422',
              ';; flags: qr rd ra ad; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1',
              '# Ask your resolver for a known signed zone and check the AD',
              '# (authentic data) flag: validation is working when AD is set.'
            ]
          },
          {
            type: 'p',
            text:
              'The DHCP capture teaches what honest DORA looks like; the dig check confirms whether your resolver verifies signatures. Both feed directly into monitoring rules a client can implement the day after your report.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab vignette for the rogue-DHCP concept. On a private bridge, a second DHCP server (yours, on your own machines) offers a lease with itself as gateway; the freshly booting test VM accepts it, and its default route now passes through the second server — observable in the routing table and in the capture. Then the control: DHCP snooping is enabled with the legitimate server\u2019s port trusted, the rogue Offer is dropped, the VM leases normally, and the snooping log records the dropped packet. The exercise\u2019s output is not the trick — it is the three artifacts: the capture showing what the attack looks like, the log showing what the control caught, and the rule (alert on Offers from untrusted ports) that operationalizes it.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Two attacks, one defense pattern',
            text:
              'DNS poisoning and rogue DHCP are the same story at different layers: an unauthenticated answerer on the broadcast domain. That is why DHCP snooping and DAI ship together, and why both matter in every report you write about LAN security.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in this lesson (defense and observation)'],
            rows: [
              ['tshark / Wireshark', 'Observe DORA exchanges and DNS transactions; base for detection rules'],
              ['dig', 'Verify DNSSEC validation status (AD flag) and inspect answer behavior'],
              ['Switch with DHCP snooping + DAI', 'The definitive control: drop rogue offers, build the binding table'],
              ['DNSSEC-aware resolver', 'Cryptographic validation of answers (RFC 4033 family)'],
              ['Your own DHCP server and resolver on a private bridge', 'The only sanctioned environment for studying the mechanics']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing rogue DHCP or DNS answers on any network beyond your own lab — shared segments have real users and real consequences',
              'Assuming encrypted DNS (DoT/DoH) fixes LAN poisoning; it encrypts the client-resolver leg, while the LAN trust problem remains',
              'Configuring DHCP snooping without DAI (or vice versa) — the controls are a pair, sharing the binding table',
              'Misclassifying uplink/trunk ports in snooping, which either disarms the control or cuts off the real DHCP server',
              'Confusing cache poisoning (resolver-side, durable via TTL) with simple forged replies (one-off, on-path only)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your lab: capture one full DORA cycle, derive the multi-DHCP-server detection rule from it, and check whether your resolver validates DNSSEC. Then write the one-paragraph finding you would submit for a network with no snooping, no DAI and no DNSSEC — evidence, impact, remediation — citing T1557.003 as the technique mapping.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'DNS poisoning races the resolver with forged answers; randomization (RFC 5452) and DNSSEC (RFC 4033) are the fixes',
              'A successful cache poisoning is durable — TTL means one lie serves every client behind the resolver',
              'Rogue DHCP rewrites the default gateway for every accepting host; starvation is its denial-of-service sibling',
              'DHCP snooping plus DAI is the LAN control pair; multi-server alerts and DNSSEC validation are the monitoring pair',
              'Practice lives on your own bridge; the deliverable is detection rules and hardening findings'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n09-l02-q1',
          type: 'mcq',
          prompt: 'What made classic DNS cache poisoning practical, and what changed?',
          options: [
            'Resolvers accepted any answer; nothing changed, it still works everywhere',
            'Predictable transaction IDs and fixed source ports made forgery guessable; randomization of both plus DNSSEC raised the cost dramatically',
            'DNS used TCP; the move to UDP enabled poisoning',
            'Long TTLs made poisoning practical; TTLs are now always short'
          ],
          answerIndex: 1,
          hint: 'The race needs a guessable identifier — what did RFC 5452 add?',
          explanation:
            'Forging an accepted answer meant beating the real reply while matching the transaction ID (and, historically, a fixed port). Port and ID randomization multiplied the guesses into the billions, and DNSSEC adds cryptographic verification on top. Randomization is probabilistic, not absolute — which is why DNSSEC matters.'
        },
        {
          id: 'n09-l02-q2',
          type: 'truefalse',
          prompt: 'Deploying encrypted DNS (DoT/DoH) on clients protects a network from rogue DHCP attacks on the segment.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does rogue DHCP change besides the resolver?',
          explanation:
            'Rogue DHCP controls the default gateway, not just the resolver — encrypted DNS to a legitimate resolver still routes through the attacker\u2019s gateway, yielding metadata and denial-of-service at minimum, and the rogue server can also hand out its own resolver. Encrypted DNS addresses on-path eavesdropping of DNS; DHCP snooping and DAI address the LAN trust problem.'
        },
        {
          id: 'n09-l02-q3',
          type: 'short',
          prompt: 'Explain why DHCP starvation is more than an availability nuisance to an attacker.',
          modelAnswer:
            'Exhausting the lease pool can push hosts into fallback states (link-local self-addressing, or accepting whatever offer arrives next), increasing pressure to accept a rogue server\u2019s lease — the starvation and the rogue server work as a pair. It also creates churn and noise that mask the rogue server\u2019s Offers among legitimate retransmissions. And on its own it is a denial-of-service lever against any segment whose clients depend on DHCP, which matters wherever availability is part of the security objective.',
          hint: 'Think about what a host does when the legitimate pool is empty.',
          explanation:
            'Pairing starvation with a rogue server converts a nuisance into an attack enabler, which is why monitoring lease-pool exhaustion and alerting on Offers from untrusted ports belong in the same detection plan rather than being treated as separate problems.'
        },
        {
          id: 'n09-l02-q4',
          type: 'scenario',
          prompt:
            'During an authorized assessment of a client LAN you capture normal traffic and observe DHCP Offer messages arriving from two different IP addresses — the documented server 10.0.0.1 and an unrecognized 10.0.0.77. The switches have no DHCP snooping. Write the finding: evidence, impact, remediation, and the ATT&CK mapping.',
          modelAnswer:
            'Evidence: capture showing DORA exchanges with Offers (message type 2) and Acknowledgments (type 5) from both 10.0.0.1 (documented) and 10.0.0.77 (unrecognized, not registered as DHCP infrastructure); switch audit confirms DHCP snooping is not configured. Impact: any host on the segment may accept the unregistered server\u2019s lease, which can set attacker-controlled default gateway and resolver values — a full man-in-the-middle position for every accepting client (Adversary-in-the-Middle: DHCP Spoofing, T1557.003). Because leases renew periodically, exposure is continuous, not a one-off. Remediation: enable DHCP snooping with the documented server\u2019s port as trusted, enable DAI using the resulting binding table, alert on Offers from untrusted ports (the capture rule from this exercise), and identify/remove 10.0.0.77 — it is either an unauthorized device (escalate through 802.1X recommendations) or a misconfigured legitimate one (fix and document). Priority: High — the control is configuration on existing switches and the exposure is segment-wide.',
          hint: 'You hold a capture, a missing control, and a technique family. Build the six-section finding.',
          explanation:
            'This is the module\u2019s intended professional output: an observed protocol fact, a named control gap, a technique mapping defenders recognize, and a remediation ordered by effort-to-effect. Notice that no attack was performed to write it — observation plus protocol knowledge was enough.'
        }
      ],
      references: [
        {
          title: 'RFC 2131 — Dynamic Host Configuration Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc2131.html',
          note: 'The DHCP specification: DORA, leases and why the offerer is unauthenticated.'
        },
        {
          title: 'RFC 4033 — DNS Security Introduction and Requirements (DNSSEC)',
          url: 'https://www.rfc-editor.org/rfc/rfc4033.html',
          note: 'The DNSSEC family\u2019s goals: cryptographic verification of DNS answers.'
        },
        {
          title: 'RFC 5452 — Measures for Making DNS More Resilient against Forged Answers',
          url: 'https://www.rfc-editor.org/rfc/rfc5452.html',
          note: 'The randomization measures (ID, ports) that modernized resolver defenses.'
        },
        {
          title: 'MITRE ATT&CK — T1557.003 Adversary-in-the-Middle: DHCP Spoofing',
          url: 'https://attack.mitre.org/techniques/T1557/003/',
          note: 'The formal technique mapping for rogue-DHCP activity, with detection sources.'
        }
      ]
    },
    {
      id: 'n09-l03',
      moduleId: 'n09',
      title: 'Credential Attacks: Sniffing, Brute Force and Spraying Concepts',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n09-l01'],
      objectives: [
        'Explain how cleartext protocols expose credentials to any observer on the path',
        'Distinguish brute force, password spraying and credential stuffing, including their lockout tradeoffs',
        'Read the failed-authentication telemetry that detects each pattern',
        'Design the rate-limiting, lockout and multi-factor controls that defeat credential attacks'
      ],
      diagram: 'net-cred-attacks',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Credentials are the universal key: every service in the enumeration inventory, from SSH to databases to management consoles, eventually asks for a secret. Attacks on that secret come in three shapes. Sniffing removes the guesswork: on protocols that transmit passwords unencrypted, the password crosses the wire in full view of anyone on the path. Guessing attacks — brute force (many passwords against one account) and password spraying (one common password against many accounts) — work the odds against human password habits. Credential stuffing replays username and password pairs stolen from other breaches, exploiting password reuse instead of weakness.'
          },
          {
            type: 'p',
            text:
              'The defender\u2019s counter to all three is the same pair of ideas: never let the secret travel in the clear, and never let guessing proceed unobserved or unthrottled. That is why this lesson spends as much time on log lines and lockout math as on attack concepts — in the real world, the detection telemetry is where these attacks are actually fought.'
          },
          {
            type: 'p',
            text:
              'And the ground rule of the module applies with special force here: credential attacks are practiced only against services you own in your own lab. Guessing passwords against systems you are not explicitly authorized to test is illegal even when it fails, and even authorized testing needs written agreement on lockouts and thresholds, because a spray can lock out an entire workforce.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-cred-attacks',
            caption: 'Three paths to a credential: observation (sniffing), repetition (brute force), breadth (spraying) — and the telemetry each leaves.'
          },
          { type: 'h', text: 'Sniffing: credentials in the clear' },
          {
            type: 'p',
            text:
              'Protocols that predate encryption — Telnet, FTP, POP3, IMAP, HTTP Basic authentication, SMTP AUTH without TLS — place the password on the network in recoverable form; network sniffing is formalized in MITRE ATT&CK as T1040. On a switched LAN an ordinary host sees only its own unicast traffic, but the previous lessons showed how that isolation is earned (and lost): a man-in-the-middle position, a span port misconfigured, or simply the protocol being spoken across an untrusted path makes the cleartext visible. The lab demonstration is deliberately benign: connect to your own FTP server with a throwaway password while capturing on the same VM, and read the password in the capture. The remediation is protocol replacement — SSH for Telnet, SFTP/FTPS for FTP, TLS-wrapped mail — plus the LAN controls of the earlier lessons.'
          },
          { type: 'h', text: 'Brute force versus spraying: the lockout math' },
          {
            type: 'p',
            text:
              'Brute force aims many passwords at one account: high chance of hitting the target\u2019s password eventually, but a lockout threshold of five failures ends the attempt after five — so brute force is really a race against the lockout, and it is loud: hundreds of failures on one account is an unmistakable telemetry signature. Password spraying inverts the shape: a few likely passwords (SeasonYear!, CompanyName1) tried across hundreds of accounts, one attempt each, below every lockout threshold — quiet on any single account, visible only when someone correlates failures across accounts. Credential stuffing skips guessing: replay known breached pairs and let password reuse do the work. MITRE classifies all of these under Brute Force (T1110), with spraying as sub-technique T1110.003. The design consequence is the central tradeoff: aggressive lockouts stop brute force but turn spraying into a denial-of-service weapon (lock out the whole directory with one pass), which is why mature designs combine throttling, MFA and monitoring rather than lockouts alone.'
          },
          { type: 'h', text: 'Detection: reading the telemetry' },
          {
            type: 'p',
            text:
              'The failed-login is the atom of detection. On Linux, sshd logs each failure with source, username and method; on Windows, event 4625 records the failure and — critically — the substatus code: 0xC000006A (wrong password) versus 0xC0000064 (wrong username) versus 0xC0000234 (locked out). The patterns: many failures, one account, varying passwords = brute force; few failures, many accounts, same password window = spraying; failures for usernames that do not exist at all = user enumeration (the VRFY lesson\u2019s SMTP cousin). Both platforms document the fields precisely — the Windows auditing reference for 4625 and the sshd_config man page for the server-side throttling knobs (MaxAuthTries, LoginGraceTime).'
          },
          {
            type: 'terminal',
            title: 'Generating and reading failed-auth telemetry on your own lab VM',
            lines: [
              '# On your own VM: three deliberate failed SSH logins (wrong password)',
              '$ ssh baduser@localhost',
              'baduser@localhost: Permission denied (publickey,password).',
              '$ ssh labuser@localhost',
              'labuser@localhost: Permission denied (publickey,password).',
              '# Now read what the server recorded:',
              '$ journalctl -u ssh -n 6 --no-pager | grep -i failed',
              'Failed password for invalid user baduser from 127.0.0.1 port 51022 ssh2',
              'Failed password for invalid user baduser from 127.0.0.1 port 51026 ssh2',
              'Failed password for labuser from 127.0.0.1 port 51030 ssh2',
              '# Detection reading: "invalid user" = username does not exist',
              '# (enumeration signal); repeated failures from one source =',
              '# brute-force signal. Correlate across accounts for spraying.'
            ]
          },
          { type: 'h', text: 'Defensive design' },
          {
            type: 'list',
            items: [
              'Kill the cleartext layer: no credentials over Telnet, FTP, HTTP Basic or unencrypted SMTP AUTH — replace with TLS-wrapped equivalents',
              'Throttle and monitor: per-source and per-account rate limits, exponential backoff, and alerts on the patterns above (MaxAuthTries and LoginGraceTime are the SSH knobs)',
              'Choose lockout policy deliberately: threshold and duration tuned so brute force dies but one spray pass cannot lock out the organization; service accounts get deny-lists instead of lockouts',
              'Deploy MFA broadly: it converts stolen and guessed passwords from a breach into a log entry — the single highest-leverage control',
              'Reduce the guessing surface: remove password auth where keys/federated SSO work, restrict management services to management networks, and disable legacy protocols entirely'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Own the service or hold the writing — nothing in between',
            text:
              'Practicing credential attacks is permitted exclusively against services you run yourself in your lab. Against any other system — even one that seems abandoned, even with a wordlist of one — attempting passwords is unauthorized access in progress. On authorized engagements, credential testing happens only where the written scope says so, with agreed thresholds, accounts and lockout coordination; the report documents what was permitted, not just what was found.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Credential attacks are where assessment meets real-world harm most directly, which makes restraint a technical skill: knowing that a spray against a domain without lockout thresholds could lock out thousands of employees is what keeps authorized testers inside their agreements. The assessment value is equally real: enumerating which services accept passwords (the SSH lesson), whether lockout policies exist (the enum4linux password-policy output), and whether telemetry would catch a spray — those are the defensive findings clients remember.'
          },
          {
            type: 'list',
            items: [
              'Map the credential surface first: which services accept passwords, from where — the report\u2019s exposure story',
              'Verify lockout and throttling configuration exists and is logged; a missing 4625 audit policy is its own finding',
              'Correlate cleartext findings with this module: every Telnet or HTTP Basic service is a sniffing finding with a name attached',
              'Test MFA coverage on remote-access paths — the control that converts every other credential finding into a nuisance'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Services still accepting passwords over cleartext transports (Telnet, FTP, HTTP Basic, SMTP AUTH on 25 without TLS)',
              'Lockout thresholds of zero (seen in the enum4linux policy output) — unlimited guessing, the spray\u2019s favorite precondition',
              'Failed-auth logging disabled or unmonitored: no 4625 audit subcategory, no sshd log shipping',
              'Password authentication exposed on internet-facing SSH or RDP without MFA or rate limiting',
              'Telemetry that cannot distinguish wrong-password from wrong-username (the 0xC0000064 enumeration signal)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lab services you own — and that is the whole scope',
            text:
              'Every command in this lesson runs against services on your own machines. The failed logins below are deliberate telemetry generators on your own VM. Translated to a client environment, these become detection-engineering checks (does the log line appear? is it shipped? does anyone alert?) — never live password guessing outside written authorization.'
          },
          {
            type: 'p',
            text:
              'The defensive drill, end to end on your own machine: generate failures, read the telemetry, then configure the throttle that the sshd_config man page documents, and observe it work:'
          },
          {
            type: 'terminal',
            title: 'From telemetry to control on your own lab VM',
            lines: [
              '# 1. Generate failures (your own VM, your own accounts):',
              '$ ssh labuser@localhost',
              'labuser@localhost: Permission denied (publickey,password).',
              '# 2. Read the telemetry:',
              '$ journalctl -u ssh --no-pager | grep -i "failed password" | tail -3',
              'Failed password for labuser from 127.0.0.1 port 51030 ssh2',
              'Failed password for labuser from 127.0.0.1 port 51034 ssh2',
              'Failed password for labuser from 127.0.0.1 port 51038 ssh2',
              '# 3. Apply the documented control (sshd_config):',
              '$ grep -E "MaxAuthTries|LoginGraceTime" /etc/ssh/sshd_config',
              'MaxAuthTries 4',
              'LoginGraceTime 30',
              '# 4. Reload and verify the throttle takes effect on the next attempts.',
              '# The same loop — generate, detect, control — is the lesson.'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two log excerpts, two attacks. Excerpt one: 412 failures for user svc-backup from one external address in nine minutes — classic brute force, and the lockout policy (threshold 5) did exactly its job, with event 4625 substatus 0xC0000234 closing the attempt. Excerpt two: one failure each for 300 different usernames inside a four-minute window, all with substatus 0xC000006A, from one source — a password spray that no per-account lockout would ever trip, caught only because the SOC correlated failures across accounts. The detection rule that separates them (failures per account versus accounts per source per time window) is the lesson\u2019s single most valuable artifact, and it costs one query to implement.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The two ratios that catch everything',
            text:
              'Failures-per-account catches brute force; accounts-per-source catches spraying. Every credential-attack detection you will ever build or recommend is one of these two ratios, plus MFA to make the whole game unwinnable.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in this lesson (defense and observation)'],
            rows: [
              ['journalctl / auth.log', 'Read sshd failed-auth telemetry on your own VMs; the Linux half of detection'],
              ['Windows event 4625 auditing', 'The Windows telemetry: substatus codes separate wrong-password from wrong-username'],
              ['sshd_config (MaxAuthTries, LoginGraceTime)', 'The documented throttling controls you verify and configure'],
              ['Wireshark (on your own FTP/Telnet lab)', 'Demonstrates cleartext credential exposure on protocols you run yourself'],
              ['Your own lab services', 'The only sanctioned targets for generating any of this telemetry']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing spraying with brute force — the shapes, the risks and the detections are different (one account many passwords versus many accounts one password)',
              'Testing credentials against systems outside written authorization, including "just one try" — unauthorized access is illegal per attempt, not per success',
              'Spraying without lockout coordination on authorized engagements; one pass can lock out an entire directory and halt the business',
              'Treating aggressive lockout thresholds as the complete answer — against spraying they become a denial-of-service amplifier',
              'Ignoring cleartext protocols because guessing is throttled elsewhere; sniffing bypasses rate limits entirely'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your own lab VM: deliberately generate both patterns by hand (several failures on one account, then single failures across a handful of your own local usernames), read them back in journalctl, and write the two detection ratios as concrete alert rules with thresholds. Then set MaxAuthTries to 2, reload sshd, and confirm the control limits the per-connection attempts. You have implemented the full detect-and-defend loop on a system you own.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Cleartext protocols hand credentials to any on-path observer — protocol replacement is the only real fix (T1040)',
              'Brute force is many passwords against one account and trips lockouts; spraying is one password against many and trips only cross-account correlation (T1110, T1110.003)',
              'The telemetry is specific: sshd log lines on Linux, event 4625 with substatus codes on Windows',
              'Two detection ratios catch the family: failures-per-account and accounts-per-source',
              'Layered defense: kill cleartext, throttle, choose lockouts deliberately, deploy MFA — and practice only on services you own'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n09-l03-q1',
          type: 'mcq',
          prompt: 'An attacker tries Password2024! once against each of 800 domain accounts in a five-minute window. Which attack is this, and why does a standard five-attempt lockout not stop it?',
          options: [
            'Brute force — but the lockout is broken',
            'Password spraying — each account sees a single failure, far below any per-account lockout threshold',
            'Credential stuffing — the lockout does not apply to breached passwords',
            'Sniffing — no authentication attempts are involved'
          ],
          answerIndex: 1,
          hint: 'Count the failures per account, not the total.',
          explanation:
            'The shape defines the attack: one password, many accounts, one failure each. Per-account lockouts never trigger because no individual account exceeds the threshold — which is exactly why cross-account correlation (accounts-per-source ratio) and MFA are the real controls, and why spraying can weaponize lockouts if thresholds are aggressive.'
        },
        {
          id: 'n09-l03-q2',
          type: 'truefalse',
          prompt: 'On Windows, an event 4625 with substatus 0xC0000064 (user does not exist) appearing in volume is a user-enumeration signal rather than a normal password typo pattern.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does it mean when the failures are about the username, not the password?',
          explanation:
            '0xC0000064 means the account name itself was invalid, so repeated 4625s with that substatus indicate someone probing which usernames exist — the local equivalent of SMTP VRFY enumeration. Distinguishing substatus codes is what makes 4625 telemetry actionable instead of noisy.'
        },
        {
          id: 'n09-l03-q3',
          type: 'short',
          prompt: 'Why does multi-factor authentication change the value of every other credential-attack finding in an assessment?',
          modelAnswer:
            'MFA breaks the chain between "attacker knows the password" and "attacker is in". A sniffed, guessed, sprayed or stuffed password without the second factor becomes a log entry instead of a breach. That re-rates every downstream finding: a cleartext protocol or an unlocked SSH endpoint with MFA is a serious weakness with contained impact, while the same weaknesses without MFA are direct compromise paths. It also changes attacker economics, pushing them toward phishing the second factor or stealing session tokens — which is why MFA is recommended alongside, not instead of, the protocol and rate-limiting fixes.',
          hint: 'What has to be true for a guessed password to become a compromise?',
          explanation:
            'Assessments report impact in context, and MFA is the single context-changer for credential findings. It is also why reports distinguish "password auth exposed" findings on MFA-protected services from identical configurations without it — same weakness, different risk.'
        },
        {
          id: 'n09-l03-q4',
          type: 'scenario',
          prompt:
            'You are authorized to assess a client\u2019s SSH estate. You find: internet-facing SSH with password authentication enabled on 40 servers, lockout thresholds not enforced, and no centralized failed-auth alerting. The client asks you to "just test some passwords" on a production server. Draft your response: what you will and will not do, and the findings you can already report.',
          modelAnswer:
            'Response: I will not run password guessing against production — password attempts are authentication attempts, and against a domain or directory with no enforced lockout they risk locking out real accounts and halting operations; testing credentials happens only where the written scope explicitly permits it, against agreed test accounts, with lockout coordination and inside agreed windows. What I can do instead: verify the control gap safely — the configuration facts alone support the findings. Finding 1 (High): internet-facing SSH with password authentication enabled on 40 servers, no MFA — exposure surface for the entire brute-force/spraying family (T1110); remediation: key or SSO authentication, MFA on any remaining password path, restrict to management networks where possible. Finding 2 (High): no enforced lockout or rate limiting on internet-facing authentication — unlimited guessing is structurally possible (T1110.003 precondition); remediation: MaxAuthTries/LoginGraceTime equivalents, fail2ban-style throttling, directory lockout policy. Finding 3 (Medium): failed-auth telemetry not centralized or alerted — brute force and spraying are invisible in operations; remediation: ship sshd/4625 telemetry, alert on failures-per-account and accounts-per-source ratios. The demonstration of the attack family belongs in my lab, where the same telemetry and controls can be shown working.',
          hint: 'Refuse the unsafe part with a reason, then deliver the value the client actually needs — the control gaps are already reportable.',
          explanation:
            'This scenario tests the professional line: restraint toward production paired with maximum safe value. The configuration facts (password auth exposed, no lockout, no telemetry) are complete findings on their own — no live guessing required — and the lab demonstrates the attack and the defense without touching a single real account.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK — T1110 Brute Force',
          url: 'https://attack.mitre.org/techniques/T1110/',
          note: 'The technique family: password guessing, spraying, stuffing and their detection sources.'
        },
        {
          title: 'MITRE ATT&CK — T1110.003 Brute Force: Password Spraying',
          url: 'https://attack.mitre.org/techniques/T1110/003/',
          note: 'The spraying sub-technique page, including its detectable telemetry patterns.'
        },
        {
          title: 'MITRE ATT&CK — T1040 Network Sniffing',
          url: 'https://attack.mitre.org/techniques/T1040/',
          note: 'How defenders classify cleartext-credential capture activity.'
        },
        {
          title: 'OpenBSD — sshd_config manual page',
          url: 'https://man.openbsd.org/sshd_config',
          note: 'The documented server-side controls: MaxAuthTries, LoginGraceTime and authentication settings.'
        },
        {
          title: 'Microsoft — Event 4625(F): An account failed to log on',
          url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625',
          note: 'Field-by-field reference for Windows failed-logon telemetry, including substatus codes.'
        }
      ]
    },
    {
      id: 'n09-l04',
      moduleId: 'n09',
      title: 'Layer 2 Security: VLAN Hopping and MAC Flooding Concepts',
      difficulty: 'Advanced',
      minutes: 16,
      prerequisites: ['n09-l01'],
      objectives: [
        'Explain how CAM table flooding degrades a switch into a hub and why attackers want that',
        'Describe both VLAN hopping variants — DTP trunk negotiation and double-tagging — and the misconfigurations each requires',
        'Recognize why VLANs are a convenience boundary, not a security control, when layer 2 hygiene fails',
        'Assemble the mitigation set: port security, disabled trunk negotiation, native VLAN hygiene and DAI'
      ],
      diagram: 'net-l2-attacks',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The switch is the quiet hero of LAN security: unlike the hub it replaced, it forwards each frame only to the port that needs it, so hosts do not see each other\u2019s unicast traffic. But that behavior is built on two learned, configurable assumptions — that the switch\u2019s address table (the CAM table) is accurate, and that trunk links between switches are created deliberately. MAC flooding attacks the first assumption by overflowing the table; VLAN hopping attacks the second by talking switches into trusting frames (or whole ports) they should not. Both land in the same place: traffic that was supposed to be private or segregated becomes observable or reachable.'
          },
          {
            type: 'p',
            text:
              'These are the advanced end of this module because they target infrastructure rather than endpoints: they require the attacker to be on the segment, and they are defeated almost entirely in switch configuration. That makes the lesson unusually defensive in flavor — the entire attack surface is a configuration checklist — and unusually consequential, because a VLAN boundary that leaks is a segmentation finding that unravels the client\u2019s whole network design story.'
          },
          {
            type: 'p',
            text:
              'The module ground rule, one last time: the mechanics here are taught as concepts and demonstrated only on lab hardware or virtual switches you own. VLAN hopping against any real infrastructure is unauthorized access to the systems behind that boundary — the crime and the blast radius both scale with how well the network was segmented.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-l2-attacks',
            caption: 'Two layer 2 failure modes: CAM overflow forces flooding; trunk misconfiguration lets frames cross VLAN boundaries.'
          },
          { type: 'h', text: 'CAM table flooding' },
          {
            type: 'p',
            text:
              'A switch learns by reading the source MAC of every arriving frame and storing the port-MAC pair in its content-addressable memory table, aging old entries out after a timeout. The table has a finite size (thousands of entries on access switches). Flood the table with thousands of forged source MACs and legitimate entries age out under pressure; the switch must then treat destination-unknown unicast frames the way a hub does — copy them out every port. In that degraded state the attacker on any port sees unicast traffic that was never addressed to them, which is the sniffing position of the credential lesson without even a MITM configuration. The attack is self-limiting (switches recover once the flood stops, and many rate-limit learning), but the concept it proves matters: the switch\u2019s privacy is a resource-exhaustion question, not a law of physics.'
          },
          { type: 'h', text: 'VLAN hopping, variant one: negotiating a trunk' },
          {
            type: 'p',
            text:
              'Trunk links carry frames from many VLANs, tagged with 802.1Q headers. The Dynamic Trunking Protocol lets a port negotiate whether it becomes a trunk — with modes like dynamic desirable and dynamic auto, ports will happily form a trunk with whatever asks. An attacker\u2019s device speaking DTP to a port left in a dynamic mode can therefore negotiate itself into a trunk and send and receive tagged frames for VLANs it was never meant to see. The fix is one line per port: force access mode and disable negotiation (switchport mode access plus switchport nonegotiate in the standard configuration language). DTP is not a security protocol; it is a convenience feature that must be turned off where security matters.'
          },
          { type: 'h', text: 'VLAN hopping, variant two: double-tagging' },
          {
            type: 'p',
            text:
              'The second variant needs no DTP: it exploits how switches strip exactly one tag. An attacker on the native (untagged) VLAN of a trunk sends a frame carrying two 802.1Q tags — the outer tag matching the trunk\u2019s native VLAN, the inner tag naming the target VLAN. The first switch strips the outer tag (it believes the frame arrived untagged on the native VLAN) and forwards the frame, inner tag intact, across the trunk; the receiving switch sees a frame tagged for the target VLAN and delivers it there. The conditions are strict — the attacker must sit on the native VLAN, and the attack is one-directional (return traffic has no path back) — but those conditions are met with depressing frequency by the single most common switch misconfiguration: native VLAN left at its default (VLAN 1) and shared by user ports. The hygiene is therefore architectural: move the native VLAN to a dedicated unused VLAN, prune it from trunks, and never put user traffic on it.'
          },
          { type: 'h', text: 'Why segmentation controls fail — and the mitigation set' },
          {
            type: 'p',
            text:
              'Both attacks exploit the gap between VLANs as configured convenience and VLANs as security boundary. The mitigation checklist is short, standard and verifiable:'
          },
          {
            type: 'list',
            items: [
              'Port security: limit learned MACs per access port (typically 1-3) with a violation action — this structurally defeats MAC flooding and duplicates IP/MAC spoofing at the port level',
              'Disable trunk negotiation: access ports set explicitly to access mode with DTP negotiation off — no port on a user wall plate should ever be able to become a trunk',
              'Native VLAN hygiene: move the native VLAN to an unused VLAN ID, keep user traffic off it, prune it from trunks — this removes the double-tagging precondition',
              'Prune unused VLANs from trunks so a boundary failure exposes less; avoid VLAN 1 for anything',
              'Dynamic ARP Inspection and DHCP snooping from the earlier lessons — the same layer 2 trust theme, enforced at the same place',
              'Private VLANs (see RFC 5517 for the canonical design) where hosts within one segment must not talk to each other at all'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Infrastructure you own, in a lab, only',
            text:
              'VLAN hopping and MAC flooding against infrastructure you do not own are attacks on every system behind that boundary — unauthorized access at scale. Study the concepts here; demonstrate them only on lab switches or virtual switch environments you built yourself. The professional output of this lesson is a switch-configuration audit, not a demonstration against someone\u2019s production network.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Layer 2 findings are the credibility test of a network assessment: anyone can report an open port, but explaining that the client\u2019s VLAN separation collapses because access ports negotiate trunks and the native VLAN carries user traffic requires the concepts in this lesson. The audit is read-only — configuration review plus, where permitted, observation of control-plane chatter on the segment — and every item on the checklist above has a verifiable configuration line behind it.'
          },
          {
            type: 'list',
            items: [
              'Audit access ports for explicit access mode and disabled negotiation; dynamic modes are the finding',
              'Check native VLAN configuration on every trunk: default VLAN 1 with user traffic is the double-tagging precondition',
              'Verify port security limits on access ports — zero limits means CAM flooding is unmitigated',
              'Confirm DAI/DHCP snooping presence (the earlier lessons) as part of the same layer 2 review',
              'Frame the impact correctly: a leaking VLAN boundary exposes the systems behind it, so severity inherits from what the VLAN isolates'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Access ports in dynamic auto/desirable mode or with trunk negotiation enabled',
              'Native VLAN left at 1, carrying user traffic, or shared between user and management planes',
              'No port security (unlimited MAC learning) on user-facing ports',
              'Trunks that carry unused or management VLANs that could have been pruned',
              'Switches without DAI/DHCP snooping, completing the layer 2 gap pattern'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Audit configurations, do not demonstrate attacks',
            text:
              'On authorized engagements, layer 2 review is a configuration-audit exercise agreed with the network team, plus passive observation of control-plane traffic on segments you are authorized to monitor. Attack demonstrations (flooding, trunk negotiation, double-tagged frames) belong exclusively to lab hardware you own.'
          },
          {
            type: 'p',
            text:
              'The passive half you can practice today, on your own lab segment — watching the control-plane chatter that layer 2 review depends on:'
          },
          {
            type: 'terminal',
            title: 'Observing layer 2 control traffic on your own lab',
            lines: [
              '$ sudo tshark -i eth0 -Y "arp || stp || cdp || lldp" -c 12',
              '  1 0.000000  Switch_12:00:01 -> STP/RSTP     Spanning Tree (Topology Change)',
              '  2 0.512003  192.168.100.2   -> Broadcast    ARP Who has 192.168.100.1?',
              '  3 0.512210  192.168.100.1   -> 192.168.100.2 ARP 192.168.100.1 is at 52:54:00:12:00:01',
              '  4 1.024001  Switch_12:00:01 -> LLDP          Port ID: Gi0/2, VLAN: 100',
              '# Control-plane chatter: STP hellos, LLDP/CDP advertisements',
              '# (port IDs, VLANs, device names). Read-only, and exactly what',
              '# a configuration audit cross-checks: which VLANs exist here,',
              '# which ports advertise what, and whether the design matches.'
            ]
          },
          {
            type: 'p',
            text:
              'The configuration half is checklist-driven: for each access port, is mode access enforced and negotiation disabled; for each trunk, what is the native VLAN and which VLANs are pruned; for the switch overall, are port-security limits and DAI present. Every answer is one configuration line — which is why this audit is the fastest high-value review in networking.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The native VLAN mismatch, told as it usually happens. A growing office adds a voice VLAN and a guest VLAN; the installer leaves trunks at defaults, so native VLAN 1 carries leftover management traffic and user access ports remain in dynamic auto mode. An assessment\u2019s configuration review finds the pair: negotiable access ports (DTP variant) and native VLAN 1 shared by users (double-tagging variant). Neither attack is performed — the configuration facts are the evidence. The report explains both failure concepts in two sentences each, maps the exposure to what VLANs 10 (finance) and 20 (guest) isolate, and delivers the fix list: nonegotiate on every access port, native VLAN moved to an unused ID and pruned, port security limits, DAI. The client fixes it in one maintenance window — the best kind of finding.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'VLANs are walls only when the mortar is right',
            text:
              'Segmentation findings are architecture findings: the same floor plan is safe or porous depending on port modes and native VLAN discipline. That is why layer 2 review belongs in every internal assessment, not just specialist engagements.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in this lesson (defense and audit)'],
            rows: [
              ['Switch configuration review', 'The audit itself: port modes, native VLANs, pruning, port security, DAI'],
              ['tshark / Wireshark', 'Passive observation of STP/CDP/LLDP/ARP control-plane chatter on segments you may monitor'],
              ['Lab switch or virtual switch', 'The only sanctioned place to study the failure modes hands-on'],
              ['RFC 5517 (private VLANs)', 'The canonical design reference when hosts must not communicate within a segment'],
              ['Your configuration checklist', 'The deliverable: verifiable lines, not vibes, for every layer 2 control']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating VLANs as a hard security boundary — they are a segmentation convenience that configuration errors dissolve',
              'Leaving DTP negotiation enabled on user-facing ports; the dynamic modes exist for convenience, not for security',
              'Keeping the native VLAN at 1 with user traffic on it — the exact precondition double-tagging needs',
              'Deploying port security without a defined violation action, or with limits too tight for legitimate port-channel and voice setups',
              'Demonstrating layer 2 attacks against production infrastructure to "prove" the finding — configuration evidence is sufficient and authorized; the attack is not'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab (a managed switch, or a virtual switch environment you control), build two VLANs and then create each misconfiguration in turn: leave one access port in dynamic mode, and put user traffic on the native VLAN. For each, write the two-sentence concept explanation and the exact configuration lines that fix it. Finish with the passive capture from the lesson and note which control-plane facts (VLANs, port IDs) the wire reveals on its own.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Switch privacy rests on the CAM table; flooding it degrades unicast forwarding to hub behavior and enables passive sniffing',
              'Port security (MAC limits with violation actions) defeats flooding structurally, at the port',
              'DTP negotiation on access ports invites the trunk-forming variant of VLAN hopping; the fix is mode access plus nonegotiate',
              'Double-tagging needs the attacker on the native VLAN — native VLAN hygiene (dedicated, unused, pruned) removes the precondition',
              'Layer 2 review is a configuration audit: port modes, native VLANs, pruning, port security and DAI — verifiable line by line'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n09-l04-q1',
          type: 'mcq',
          prompt: 'What does a successful CAM table flooding attack cause a switch to do?',
          options: [
            'Drop all traffic until the attacker stops',
            'Forward unicast frames it cannot resolve out of every port, like a hub, enabling passive sniffing',
            'Reboot and clear its configuration',
            'Re-assign all ports to VLAN 1'
          ],
          answerIndex: 1,
          hint: 'What must a switch do with a frame whose destination it can no longer look up?',
          explanation:
            'When the address table overflows and legitimate entries age out, unknown-destination unicast frames are flooded to all ports — the switch degrades into hub behavior, and the attacker on any port observes traffic addressed elsewhere. Port security limits on MAC learning are the structural fix.'
        },
        {
          id: 'n09-l04-q2',
          type: 'truefalse',
          prompt: 'A double-tagging VLAN hopping attack works only if the attacker\u2019s device sits on the trunk\u2019s native VLAN.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Which tag does the first switch strip, and what does it believe about untagged frames?',
          explanation:
            'The first switch strips the outer tag because it assumes frames arriving untagged belong to its native VLAN — so the attacker must be on that VLAN for the outer tag to be consumed correctly. This is why native VLAN hygiene (dedicated unused ID, pruned, no user traffic) removes the attack\u2019s precondition entirely.'
        },
        {
          id: 'n09-l04-q3',
          type: 'short',
          prompt: 'Explain in two sentences why VLANs are a convenience boundary rather than a security control, and name the two configuration disciplines that make them safe to rely on.',
          modelAnswer:
            'VLAN separation is enforced by learned, configurable switch behavior — trunk negotiation and tag handling — rather than by any authenticated property of the frames themselves, so configuration errors (negotiable ports, shared native VLANs) silently dissolve the boundary while the design document still claims it. The disciplines that make VLANs trustworthy are trunk hygiene (explicit access mode with negotiation disabled on user ports, dedicated and pruned native VLAN) plus port-level enforcement (port security limits, DAI) — each of them a verifiable configuration line rather than a claim.',
          hint: 'What enforces the boundary — and what happens when the enforcement is misconfigured?',
          explanation:
            'This is the architectural lesson of the module\u2019s second half: security claims must trace to enforced configuration. Auditors and assessors who verify port modes and native VLAN discipline turn "we are segmented" from a statement into a checked fact.'
        },
        {
          id: 'n09-l04-q4',
          type: 'scenario',
          prompt:
            'A configuration audit of an authorized client network shows: all access ports in dynamic auto mode, trunks with native VLAN 1 carrying voice traffic, no port security limits, and DAI absent. No attack testing is in scope. Draft the finding: what the configuration enables, the two attack concepts it satisfies, and the prioritized remediation list.',
          modelAnswer:
            'Finding: Layer 2 controls absent — negotiable access ports, native VLAN 1 in use, no port security, no DAI. Evidence: configuration excerpts per switch (port modes, trunk native VLAN, port-security absence, DAI absence). Impact: the VLAN separation between user, voice and other segments is enforced only by default behavior — access ports will negotiate trunks with a device speaking DTP (trunk-forming VLAN hopping), and native VLAN 1 carrying traffic satisfies the precondition for double-tagging, exposing the segments behind those boundaries; without port-security limits, CAM flooding can degrade switch forwarding to hub behavior and enable passive credential capture (feeding T1040-style sniffing). Remediation, prioritized: (1) set every access port to explicit access mode with trunk negotiation disabled (nonegotiate); (2) move the native VLAN to a dedicated unused ID, remove user/voice traffic from it, and prune it from trunks; (3) apply port security with defined violation actions on access ports; (4) enable DAI with DHCP snooping (the binding tables also strengthen earlier layer 2 controls); (5) prune unused VLANs from trunks and keep VLAN 1 unused. All remediations are configuration-only on existing hardware.',
          hint: 'Map each configuration gap to the concept it enables — DTP, double-tagging, CAM flooding — then order the fixes.',
          explanation:
            'The scenario is the assessment capstone for the whole module: configuration evidence, concept-mapped impact, and a remediation list that a network team can execute in one window. No attack was necessary — the concepts turned config lines into risk, which is exactly what the module\u2019s lab-only design promises.'
        }
      ],
      references: [
        {
          title: 'RFC 5517 — Cisco Systems\u2019 Private VLANs: Scalable Security in a Multi-Client Environment',
          url: 'https://www.rfc-editor.org/rfc/rfc5517.html',
          note: 'The canonical design reference for host isolation within a segment.'
        },
        {
          title: 'RFC 826 — An Ethernet Address Resolution Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc826.html',
          note: 'The layer 2 trust foundation shared with the ARP spoofing lesson.'
        },
        {
          title: 'MITRE ATT&CK — T1040 Network Sniffing',
          url: 'https://attack.mitre.org/techniques/T1040/',
          note: 'How defenders classify the sniffing position that both L2 failure modes enable.'
        }
      ]
    }
  ]
};
