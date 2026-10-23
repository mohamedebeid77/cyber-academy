import type { Module } from '../../../../types';

// LEVEL 7 — INTERNAL NETWORK TESTING · Module 13: Pivoting, Tunneling and Segmentation
// Original curriculum content synthesized from public official documentation:
// OpenSSH manuals (man.openbsd.org), the Chisel and Ligolo-ng project
// documentation on GitHub, the proxychains/proxychains-ng projects and MITRE
// ATT&CK. All prose is original; reference links point to the official
// sources used for study.
// All examples run against the fictional LABCORP lab network and are taught
// for AUTHORIZED testing only. Pivoting drills belong in labs you own or in
// engagements whose written scope covers every hop you relay through.

export const n13: Module = {
  id: 'n13',
  title: 'Pivoting, Tunneling and Segmentation',
  level: 7,
  description:
    'Once a foothold reaches networks your testing machine cannot, the work becomes pivoting: turning an authorized relay into your new vantage point. This module teaches the whole craft — recognizing multi-homed systems, building SSH local, remote and SOCKS tunnels with correct flag semantics, standing up proxychains, Chisel and Ligolo-ng access, chaining double pivots, and troubleshooting every hop — with the inventory and tear-down discipline professional engagements demand.',
  outcomes: [
    'Explain what pivoting is, why segmentation makes it necessary, and when a tunnel is the right tool',
    'Recognize multi-homed systems from interface, route and neighbor information',
    'Build SSH local, remote and dynamic (SOCKS) tunnels with correct flag semantics and bindings',
    'Describe how Chisel and Ligolo-ng establish access and choose between them with named tradeoffs',
    'Chain double pivots, manage routes, troubleshoot failed tunnels and tear down cleanly'
  ],
  lessons: [
    {
      id: 'n13-l01',
      moduleId: 'n13',
      title: 'Pivoting Fundamentals: Multi-homed Hosts and Reachability',
      difficulty: 'Intermediate',
      minutes: 16,
      prerequisites: ['n12-l02'],
      objectives: [
        'Define pivoting and explain why segmented networks require it',
        'Identify multi-homed hosts from a foothold using interface, route and neighbor data',
        'Probe reachability through a foothold and record a reachability matrix'
      ],
      diagram: 'net-pivot-topology',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Pivoting means using a system you are authorized to control as a relay, so your traffic emerges from a new vantage point. Your testing machine has not moved — but the packets now leave the network from the foothold\u2019s position, obeying its routes and inheriting its source address. The set of systems you can touch is defined by that vantage, not by what you own, which is why the first question after any foothold is never "what can I exploit here" but "what can I reach from here".'
          },
          {
            type: 'p',
            text:
              'Segmentation is why pivoting exists as a skill at all. Well-built networks deliberately divide workstation, server, database and management zones so that a compromise in one does not automatically reach the others. For the defender that division is a control; for the authorized tester it is a claim that deserves testing. Pivoting is how you validate the claim — with permission, from inside — and how you demonstrate in the report exactly where segmentation holds and where it leaks.'
          },
          {
            type: 'p',
            text:
              'The craft has a natural order. First you read the foothold like a map: its interfaces, routes and neighbor cache tell you which networks it straddles. The bridges are multi-homed systems — servers with two network cards, VPN endpoints, management jump hosts, container hosts — and finding them costs a handful of read-only commands. Only then comes tunneling, the next lessons\u2019 topic. Reachability first, plumbing second.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'What pivoting actually is'
          },
          {
            type: 'p',
            text:
              'Two things are often conflated. Relayed connectivity means your tools still run on your machine, but their traffic is carried through the foothold — a tunnel or proxy borrows its vantage. Repositioning means moving your working context onto the host itself, which is heavier, noisier and usually unnecessary. This module is about relaying: the pivot stays mostly untouched while your reach extends through it.'
          },
          {
            type: 'diagram',
            id: 'net-pivot-topology',
            caption: 'A classic pivot: the tester reaches only the workstation VLAN; the dual-homed SVR-VPN01 bridges into the server VLAN.'
          },
          {
            type: 'h',
            text: 'Multi-homed hosts: finding the bridges'
          },
          {
            type: 'p',
            text:
              'A multi-homed host has presence on more than one network — a second interface, a VLAN alias, a VPN or container adapter, or a static route pointing deeper. These systems are the natural relay points of any segmented network, and the kernel of the foothold will tell you about them if you ask:'
          },
          {
            type: 'table',
            headers: ['Signal', 'What it suggests'],
            rows: [
              ['A second interface on an RFC 1918 network you did not expect', 'Dual-homed host — the classic bridge between segments'],
              ['A route entry pointing at a subnet beyond the connected one', 'Another internal segment exists; the host forwards toward it'],
              ['A tun0, tap0, docker0 or cni0 adapter', 'VPN overlays and container bridges — networks inside networks'],
              ['Neighbor (ARP) cache entries on a subnet other than yours', 'The host recently spoke to devices you cannot see directly'],
              ['Resolv.conf pointing at an internal DNS server', 'A name resolution path that may serve other segments']
            ]
          },
          {
            type: 'h',
            text: 'Probing reachability'
          },
          {
            type: 'p',
            text:
              'With candidate networks identified, probe cheaply before scanning broadly: single connection checks to known service ports, short ping runs where ICMP is allowed, and small, targeted sweeps only when the segment tolerates them. Read latency and TTL as distance hints. And always remember asymmetry: the foothold reaching a database does not imply the database can reach back — stateful firewalls make direction a property of the path, not of the pair.'
          },
          {
            type: 'p',
            text:
              'Record everything in a reachability matrix: rows are your vantage points (testing machine, each foothold), columns are the subnets in play, cells say reachable, filtered or dead. The matrix becomes both your working map and, later, the evidence backbone of the report\u2019s segmentation section.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Clients buy internal tests largely to learn whether their segmentation works, and pivoting is the instrument that answers them. Every tunnel you build in this module exists to extend validated reach — and every unreachable zone you honestly mark is a control working as designed, which is also reportable. MITRE ATT&CK tracks the adversary equivalent as T1090 (Proxy), which is useful language when discussing detection with the blue team.'
          },
          {
            type: 'list',
            items: [
              'Validate segmentation claims with evidence per direction, not with diagram folklore',
              'Turn a low-value workstation foothold into coverage of the zones behind it',
              'Reach loopback-bound services on the pivot itself once tunnels exist (next lessons)',
              'The matrix, not the exploit count, is what the segmentation findings stand on'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Interfaces on networks other than the foothold\u2019s own segment — the definition of dual-homed',
              'Static routes pointing at deeper subnets; management VLANs are the classic prize',
              'VPN and container adapters (tun0, tap0, docker0, cni0) that never appear on official diagrams',
              'Neighbor cache entries on subnets the foothold should not normally touch',
              'Management protocols (SSH, RDP, WinRM) listening on the pivot — your future tunnel endpoints',
              'Asymmetric reachability: the foothold can connect out, but nothing can connect back'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Relay through authorized systems only',
            text:
              'Pivoting practice belongs in labs you own, or in engagements whose written scope covers every network you relay through. Carrying your traffic through a system you are not authorized to use is unlawful access regardless of intent, and relays planted on client systems must be named in the rules of engagement and removed at the end.'
          },
          {
            type: 'p',
            text:
              'Build a two-VM lab: PIVOT has two NICs (192.168.56.10 on your lab side, 10.0.20.10 on a hidden side) and TGT sits at 10.0.20.20 running a web app. Your attacker VM can reach only 192.168.56.0/24. From the foothold, ask the kernel what else exists:'
          },
          {
            type: 'terminal',
            title: 'From the foothold: what does it touch?',
            lines: [
              '$ ip -br addr',
              'lo        UNKNOWN  127.0.0.1/8',
              'ens3      UP       192.168.56.10/24',
              'ens4      UP       10.0.20.10/24',
              '$ ip route',
              'default via 192.168.56.1 dev ens3',
              '10.0.20.0/24 dev ens4 proto kernel scope link src 10.0.20.10',
              '$ ip neigh',
              '10.0.20.20   dev ens4 lladdr 08:00:27:aa:12:9f REACHABLE',
              '192.168.56.1 dev ens3 lladdr 0a:00:27:00:00:01 STALE',
              '$ nc -zv 10.0.20.20 80',
              'Connection to 10.0.20.20 80 port [tcp/*] succeeded!'
            ]
          },
          {
            type: 'p',
            text:
              'Read the output like a cartographer: two interfaces, a directly connected route to 10.0.20.0/24, a live neighbor at .20 answering on port 80. You have proven a second network exists and that this host bridges to it — all before any tunnel was built. That proof is what the next lessons will turn into reachability from your own machine.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'In the LABCORP lab, the foothold FIN-WKS02 sits in the workstation VLAN (10.0.10.0/24). Its routes mention 10.0.20.0/24, and SVR-VPN01 — dual-homed between the server VLAN and the DB VLAN (10.0.30.0/24) — answers SSH on the server side. The matrix so far: the tester reaches 10.0.10 only; FIN-WKS02 reaches 10.0.10 and 10.0.20; SVR-VPN01 reaches 10.0.20 and 10.0.30. Three rows already describe the whole engagement: each future tunnel (module lessons ahead) corresponds to moving one row down.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'The matrix is a deliverable',
            text:
              'Professional reports include the reachability matrix with the vantage and timestamp of every cell. It backs the segmentation findings, lets the client retest each cell, and shows exactly why your conclusions are trustworthy.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ip (iproute2)', 'Interfaces, routes and neighbor cache on the foothold — the bridge detector'],
              ['ss', 'Listening services on the pivot worth tunneling toward'],
              ['nc / ncat', 'Cheap, precise reachability probes to named host:port pairs'],
              ['ping', 'Fast liveness checks where ICMP is permitted'],
              ['nmap', 'Structured sweeps from the foothold once quiet enumeration is justified']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting the client\u2019s diagram instead of the foothold\u2019s kernel: interfaces and routes are ground truth',
              'Firing a 65k-port scan through a fresh foothold before learning what the segment tolerates — go targeted first',
              'Treating "filtered" as "nothing there": firewalled and absent are different findings',
              'Ignoring reachability asymmetry — outbound-only paths change which tunnel direction you will choose',
              'Not recording which vantage produced which result; findings without vantage context are unreproducible'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the two-VM lab (PIVOT with two NICs, TGT on the hidden side), make sure nothing routes between the subnets except through PIVOT, and produce the reachability matrix from both vantage points. Bonus: detach PIVOT\u2019s second interface, re-derive the matrix from memory, then verify — the mismatch between what you assumed and what the kernel says is exactly the lesson.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Pivoting shifts your vantage point through an authorized relay; the foothold defines what is reachable',
              'Multi-homed hosts are the bridges: find them with interface, route and neighbor data',
              'Probe cheaply first (nc, ping); scan widely only when the segment tolerates it',
              'Reachability is asymmetric and stateful — record direction, not just connectivity',
              'The reachability matrix is both your working map and a report deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n13-l01-q1',
          type: 'mcq',
          prompt: 'A foothold has one interface in your segment, but its routing table contains a route to a second subnet it is not attached to. Which statement is correct?',
          options: [
            'The second subnet is unreachable — pivoting requires a second physical NIC',
            'The foothold may still reach the second subnet via routing, making it a pivot candidate',
            'Routing tables only matter on firewalls and routers',
            'A multi-homed host is defined by having multiple MAC addresses only'
          ],
          answerIndex: 1,
          hint: 'What does the OS do with a packet for 10.0.20.5 when a route says "via 10.0.10.1"?',
          explanation:
            'Routing is the mechanism: the kernel forwards toward the next hop, so a routed (not just attached) subnet can still be reachable from the foothold. Interfaces are the strongest signal, but routes and neighbor caches reveal bridges too — which is why all three are checked.'
        },
        {
          id: 'n13-l01-q2',
          type: 'truefalse',
          prompt: 'If the foothold can connect to DB01 on port 1433, DB01 can necessarily connect back to the foothold.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Think about stateful firewalls and which direction initiated the session.',
          explanation:
            'Stateful devices track who initiated: a rule may allow workstation-to-database while dropping database-to-workstation. Reachability is directional, which is why the matrix records direction per cell and why tunnel direction must be chosen from observed paths.'
        },
        {
          id: 'n13-l01-q3',
          type: 'short',
          prompt: 'Name four data sources on a Linux foothold that reveal which networks it touches.',
          modelAnswer:
            'Interface listing (ip -br addr), routing table (ip route), neighbor/ARP cache (ip neigh), and listening sockets (ss) are the core four; VPN and container adapters show up in the first, and /etc/resolv.conf plus /etc/hosts add the name-resolution picture.',
          hint: 'Start with what the kernel already knows about interfaces, neighbors and listeners.',
          explanation:
            'These are all read-only, quiet commands — the ideal first move on any authorized foothold. Together they sketch the bridge map that decides whether and where pivoting is worth doing.'
        },
        {
          id: 'n13-l01-q4',
          type: 'scenario',
          prompt:
            'Authorized test. Your scanning machine cannot reach APP01 at all, the foothold WKS can reach APP01 on 443, and APP01 cannot initiate connections to WKS. What does this tell you, and what is your next step?',
          modelAnswer:
            'It tells you three things: APP01 is reachable only in the workstation-to-server direction (a stateful rule, not an absence of host), your vantage is outside that allowed direction, and a relay through WKS will inherit a source address the rule accepts. Next step: use WKS as the authorized pivot — build a tunnel (local forward or SOCKS, next lessons) so probes exit from WKS, and record the asymmetry as a segmentation observation in the matrix.',
          hint: 'Which direction is allowed, and whose source address does a tunnel inherit?',
          explanation:
            'Asymmetric, stateful reachability is the normal case in segmented networks. Pivoting exists precisely to work with it: the relay borrows the allowed direction, and the asymmetry itself becomes documented evidence about the client\u2019s controls.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1090 — Proxy',
          url: 'https://attack.mitre.org/techniques/T1090/',
          note: 'The adversary-side frame for relaying traffic; useful vocabulary for detection discussions.'
        },
        {
          title: 'ip(8) — Linux manual page',
          url: 'https://man7.org/linux/man-pages/man8/ip.8.html',
          note: 'The iproute2 tool behind addr, route and neigh inspection on the foothold.'
        },
        {
          title: 'ss(8) — Linux manual page',
          url: 'https://man7.org/linux/man-pages/man8/ss.8.html',
          note: 'Socket statistics: what is listening and from where, on any modern Linux.'
        },
        {
          title: 'Nmap Network Scanning book',
          url: 'https://nmap.org/book/',
          note: 'Structured scanning technique for the targeted sweeps you run from footholds.'
        }
      ]
    },
    {
      id: 'n13-l02',
      moduleId: 'n13',
      title: 'SSH Tunneling: Local and Remote Port Forwarding',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n13-l01'],
      objectives: [
        'Read the -L forwarding specification correctly and predict where each name resolves',
        'Build remote forwards with -R and explain the GatewayPorts condition',
        'Use -D, -N and -f to create background SOCKS tunnels safely',
        'Diagnose common failures: address in use, refused targets, bindings that never appear'
      ],
      diagram: 'net-ssh-tunneling',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A tunnel relocates your vantage without relocating you. An SSH local forward makes a distant service appear on your own loopback; you point your tools at localhost and SSH carries each connection to the far side. Because SSH is already installed on nearly everything, already trusted, and often already permitted, it is the default tunneling tool on authorized engagements — the pivot usually has an SSH client or server within reach.'
          },
          {
            type: 'p',
            text:
              'There are two directions and one generalization. -L brings a remote service to you: you bind a port, connections you make locally emerge from the pivot. -R brings you to them: the far side binds a port that leads back to your machine, which matters when the target can only dial out. -D is the generalized form — instead of one fixed destination, it opens a SOCKS proxy so each connection can choose its own target (the next lesson\u2019s main character).'
          },
          {
            type: 'p',
            text:
              'Precision is the whole skill. Every forwarding specification has two endpoints and a resolution point, and the most common mistake in tunneling is misreading where the target hostname gets resolved. Tunnels are also live state on someone else\u2019s machine: they need a syntax you can trust, flags that make them survive, and an inventory so they get closed.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-ssh-tunneling',
            caption: 'Local (-L), remote (-R) and dynamic (-D) forwarding through one SSH connection to the pivot.'
          },
          {
            type: 'h',
            text: 'Local forwarding: -L in one sentence'
          },
          {
            type: 'p',
            text:
              'Read "ssh -L 8443:10.0.20.15:443 ops@10.0.10.8" as: listen on port 8443 on the machine where this ssh command runs (your box, loopback by default), and every connection to it is carried through the SSH session to 10.0.10.8, which then opens 10.0.20.15:443 from its own position. The crucial consequence: the target hostname is resolved by the pivot, not by you. Internal DNS names work precisely because the pivot knows them — and names that only your resolver knows will fail.'
          },
          {
            type: 'list',
            items: [
              'Bind address is optional and defaults to 127.0.0.1 — write it explicitly anyway (127.0.0.1:8443)',
              'The bind port lives on YOUR machine; two tunnels cannot share it',
              'The target host is interpreted FROM the pivot\u2019s vantage: its DNS, its routes',
              'The target name "localhost" means the pivot itself — a way to reach the pivot\u2019s own loopback-only services',
              'The target port is the service on that target, not the pivot\u2019s port'
            ]
          },
          {
            type: 'p',
            text:
              'Verification is a two-step loop: confirm the listener exists (ss -tlnp and grep for your port) and then exercise the whole path end to end (curl against the local port). A listener without a successful fetch proves nothing about the far side.'
          },
          {
            type: 'h',
            text: 'Remote forwarding: -R'
          },
          {
            type: 'p',
            text:
              '"ssh -R 9443:127.0.0.1:9443 you@relay" makes the REMOTE machine (relay) listen on 9443 and send connections back through the tunnel to port 9443 on your box. On engagements this solves egress-only footholds: the pivot may not accept your inbound connections, but it may be allowed to dial out to one host you control — so the door is built from the inside out. Note the server-side condition: sshd binds remote forwards to loopback only unless GatewayPorts is enabled in sshd_config, a deliberate decision on the relay, not a client flag.'
          },
          {
            type: 'h',
            text: 'Dynamic: -D, plus the flags that make tunnels operational'
          },
          {
            type: 'p',
            text:
              '-D 1080 opens a SOCKS proxy on your loopback whose egress is the pivot; destinations are chosen per connection. -N requests no remote command (pure forwarding), -f sends ssh into the background after authentication, -o ExitOnForwardFailure=yes makes ssh exit if the forward could not be established instead of idling as a useless zombie, and -o ServerAliveInterval=30 keeps idle NAT sessions from quietly dropping the carrier.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'A tunnel you can leave running',
            code:
              'ssh -N -f \\\n  -o ExitOnForwardFailure=yes \\\n  -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \\\n  -L 127.0.0.1:8443:wiki.internal.lab:443 \\\n  ops@10.0.10.8'
          },
          {
            type: 'h',
            text: 'Failure modes worth memorizing'
          },
          {
            type: 'table',
            headers: ['Symptom', 'Cause', 'Fix'],
            rows: [
              ['bind [127.0.0.1] port 8443: Address already in use', 'A listener already holds the port — usually your own earlier tunnel', 'Find it with ss -tlnp, close it or pick another port'],
              ['channel N: open failed: connect failed: Connection refused', 'The pivot could not reach the TARGET — not a local problem', 'Test target reachability from the pivot\u2019s vantage; pick another target or pivot'],
              ['channel N: open failed: connect failed: Name or service not known', 'The pivot cannot resolve the target hostname', 'Use an IP, or a name the pivot\u2019s DNS actually knows'],
              ['administratively prohibited: open failed', 'sshd policy forbids the forward (PermitOpen / AllowTcpForwarding)', 'Needs a server-side change with the owner\u2019s approval'],
              ['bind: Permission denied on -R', 'sshd GatewayPorts restricted, or privileged port', 'Bind a high port, or adjust sshd_config on the relay'],
              ['Everything worked, then died silently', 'Idle NAT/timeout dropped the carrier', 'ServerAliveInterval plus ExitOnForwardFailure; reconnect']
            ]
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Tunnels are state on other people\u2019s machines',
            text:
              'Every tunnel is a live session plus a listener on your box and a session on the pivot. Keep a written inventory (port, target, purpose, opened-at), close everything deliberately, and treat a tunnel you cannot explain in ss output as an incident you caused.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'SSH forwarding is ATT&CK T1572 (Protocol Tunneling) riding on T1021.004 (SSH). The same primitive you use is what defenders must detect: long-lived SSH sessions that suddenly open new connections to internal hosts are a classic alert, and a good report says so — testing traffic visible to the SOC is a feature unless stealth is explicitly in scope.'
          },
          {
            type: 'list',
            items: [
              'Reach loopback-only admin panels and caches on pivots without installing anything on them',
              'Carry your probing traffic encrypted through monitored segments, inside the ROE',
              'Solve egress-only footholds with -R through a host you are authorized to use',
              'ExitOnForwardFailure plus an inventory is what separates an operator from a mess'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SSH clients and keys already on the foothold — ready-made tunnel infrastructure',
              'sshd_config knobs that shape tunneling: AllowTcpForwarding, PermitOpen, GatewayPorts, PermitTunnel',
              'Loopback-only services on pivots (ss output) — -L with a localhost target reaches them',
              'Egress rules: what the target network may connect OUT to (this decides -R designs)',
              'Long-lived established SSH sessions in ss output that nobody can explain — possibly someone else\u2019s tunnel, and a finding'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Reuse the n13-l01 lab: ATK (your machine), PIVOT (SSH server, two NICs) and TGT (web app on 10.0.20.20:80, plus a second app bound to TGT\u2019s loopback for later). Bring the tunnel up, verify, and use it:'
          },
          {
            type: 'terminal',
            title: 'Bring up, verify, use',
            lines: [
              '$ ssh -N -f -L 127.0.0.1:8080:10.0.20.20:80 lab@192.168.56.10',
              '$ ss -tlnp | grep 8080',
              'LISTEN 0 128 127.0.0.1:8080 0.0.0.0:* users:(("ssh",pid=4312,fd=4))',
              '$ curl -s http://127.0.0.1:8080/ | head -3',
              '<!doctype html>',
              '<html>',
              '<head><title>TGT internal app</title>'
            ]
          },
          {
            type: 'terminal',
            title: 'Break it on purpose: the two failure classes',
            lines: [
              '$ ssh -N -f -L 127.0.0.1:8080:10.0.20.20:80 lab@192.168.56.10',
              'bind [127.0.0.1] port 8080: Address already in use',
              '$ ss -tlnp | grep 8080        # who holds it? your previous tunnel',
              '$ ssh -N -f -L 127.0.0.1:8081:admin.internal.lab:8080 lab@192.168.56.10',
              '$ curl -s -m 3 http://127.0.0.1:8081/ ; ssh logs say:',
              'channel 2: open failed: connect failed: Name or service not known'
            ]
          },
          {
            type: 'p',
            text:
              'The two failures are different animals. "Address already in use" is your side: something local holds the bind port, and no traffic ever left. The channel error is the pivot\u2019s side: the session is alive, the listener works, but the pivot could not resolve admin.internal.lab — its DNS, not yours. Diagnose bind errors locally and channel errors from the pivot\u2019s vantage, and you will never again debug the wrong end.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP: SVR-VPN01 runs a package cache bound to its own loopback (127.0.0.1:3128). From FIN-WKS02 you have SSH to VPN01 but nothing else. One forward — "ssh -N -f -L 127.0.0.1:3129:localhost:3128 ops@10.0.20.10" — exposes the cache on your workstation, and the target "localhost" is the teaching point: it names the pivot\u2019s own loopback, which no amount of external port scanning would ever have listed.'
          },
          {
            type: 'p',
            text:
              'The reverse case: FIN-WKS02 may only egress to the proxy server on 443, and you need it to reach a service on your test laptop for an approved transfer. From the workstation: "ssh -R 9443:127.0.0.1:9443 tester@relay-lab" — the relay binds 9443, sessions flow back to your laptop, and the only packets crossing the client boundary are outbound SSH from the workstation. Direction chosen by the firewall, not by preference.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'localhost in -L means the pivot',
            text:
              'This one sentence prevents half of all tunneling confusion: the target field of a local forward is interpreted on the machine you SSH to. "localhost:3128" there is the pivot\u2019s loopback, not yours.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ssh (OpenSSH)', 'The tunnel engine: -L, -R, -D, -N, -f and the -o hardening flags'],
              ['ss', 'Ground truth for listeners: did the bind actually happen, and on which address'],
              ['curl', 'End-to-end proof that the full path works, not just the local end'],
              ['nc', 'Raw probes through the tunnel to specific host:port pairs'],
              ['A tunnel inventory file', 'Local port, target, purpose, opened-at — closed only when written down']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Resolving the -L target in your head against your own DNS — it resolves at the pivot',
              'Binding 0.0.0.0 out of laziness and exposing your tunnel to the whole office or lab network',
              'Leaving background tunnels running after the session: -f without an inventory is how stale sessions pile up',
              'Treating "connection refused" inside a tunnel as a local problem — it is usually the pivot failing to reach the target',
              'Swapping -L and -R under time pressure; write the direction sentence before typing',
              'Skipping ExitOnForwardFailure: a tunnel that failed to bind still sits there looking alive'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your three-VM lab: (1) build a -L forward to the hidden web app and prove it with curl; (2) start a throwaway service on PIVOT bound to 127.0.0.1 (python3 -m http.server 8000 --bind 127.0.0.1) and reach it with a localhost-target forward; (3) trigger each failure mode once — port conflict, unresolvable name — and note which side produced which error. Finish by closing every tunnel and proving with ss and ps that nothing remains.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              '-L binds locally and fetches remotely; the target hostname resolves at the pivot',
              'localhost as the -L target means the pivot\u2019s own loopback',
              '-R reverses the direction; non-loopback remote binds require GatewayPorts on the server',
              '-D builds a SOCKS proxy; -N -f plus ExitOnForwardFailure and ServerAliveInterval make it operational',
              'Bind errors are your side; channel errors are the pivot\u2019s side — and every tunnel belongs in the inventory'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n13-l02-q1',
          type: 'mcq',
          prompt: 'With "ssh -L 8080:intranet.lab:80 ops@pivot", when and where is intranet.lab resolved?',
          options: [
            'By your machine, when the ssh command starts',
            'By the pivot, when a connection arrives through the tunnel',
            'By the SSH server configuration at boot',
            'By your resolver, tunneled through the SSH session'
          ],
          answerIndex: 1,
          hint: 'Whose /etc/hosts and DNS does the target name get looked up in?',
          explanation:
            'The target of a local forward is interpreted at the far end: when your connection reaches the pivot, the pivot resolves intranet.lab with its own resolver and routes. That is why internal names work and why names only your resolver knows fail.'
        },
        {
          id: 'n13-l02-q2',
          type: 'truefalse',
          prompt: 'By default, "ssh -R 8080:127.0.0.1:80 root@relay" makes the relay listen on all of its interfaces.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does sshd do with remote forwards unless told otherwise?',
          explanation:
            'sshd binds remote forwards to loopback only unless GatewayPorts (yes or clientspecified) is set in sshd_config. Opening a remote bind beyond loopback is a deliberate server-side decision — one reason relays are chosen and configured in advance.'
        },
        {
          id: 'n13-l02-q3',
          type: 'short',
          prompt: 'Why pair -N with -f for background tunnels, and why add -o ExitOnForwardFailure=yes?',
          modelAnswer:
            '-N requests no remote command, making the session a pure forwarding channel; -f backgrounds ssh after authentication so the tunnel persists without holding a shell. ExitOnForwardFailure makes ssh exit if the forward could not be established (port conflict, denied policy) instead of idling as a session that looks alive but carries nothing — preventing zombie tunnels and false assumptions.',
          hint: 'What does a tunnel that "exists but carries nothing" cost you an hour later?',
          explanation:
            'Together the three flags turn tunneling from an interactive trick into an operational primitive: no stray shell, no foreground terminal, and no silent failure. The inventory entry (port, target, purpose, time) completes the picture.'
        },
        {
          id: 'n13-l02-q4',
          type: 'scenario',
          prompt:
            'Your tunnel "ssh -N -f -L 8080:app.lab:80 ..." is up: ss shows the listener. But curl to 127.0.0.1:8080 hangs and the SSH stderr shows "channel 2: open failed: connect failed: Connection refused". Where is the problem, and what two checks do you run?',
          modelAnswer:
            'The failure is at the pivot: the SSH path works (the listener accepted, the channel opened), but the pivot cannot open app.lab:80 — either the name does not resolve from the pivot or the port is closed or filtered from the pivot\u2019s vantage. Checks: from the pivot (with authorization) verify resolution (getent hosts app.lab) and reachability (nc -zv app.lab 80); then fix the target name/port or choose another pivot — not the local tunnel.',
          hint: 'The channel opened. Whose connection attempt actually failed?',
          explanation:
            'Channel errors localize the failure to the pivot\u2019s attempt to reach the target. Local bind problems never produce channel messages because no traffic ever gets that far — the taxonomy from this lesson is exactly this fork.'
        }
      ],
      references: [
        {
          title: 'ssh(1) — OpenSSH manual',
          url: 'https://man.openbsd.org/ssh',
          note: 'The authoritative semantics of -L, -R, -D, -N, -f, -J and the -o options used here.'
        },
        {
          title: 'sshd_config(5) — OpenSSH manual',
          url: 'https://man.openbsd.org/sshd_config',
          note: 'AllowTcpForwarding, PermitOpen, GatewayPorts and PermitTunnel — the server-side rules that shape tunneling.'
        },
        {
          title: 'MITRE ATT&CK T1572 — Protocol Tunneling',
          url: 'https://attack.mitre.org/techniques/T1572/',
          note: 'How defenders classify tunneling behavior — the same primitive, seen from the blue team.'
        },
        {
          title: 'MITRE ATT&CK T1021.004 — Remote Services: SSH',
          url: 'https://attack.mitre.org/techniques/T1021/004/',
          note: 'SSH as the lateral-movement and relay carrier this lesson rides on.'
        }
      ]
    },
    {
      id: 'n13-l03',
      moduleId: 'n13',
      title: 'SOCKS Proxies, Proxychains, Chisel and Ligolo-ng',
      difficulty: 'Advanced',
      minutes: 18,
      prerequisites: ['n13-l02'],
      objectives: [
        'Explain SOCKS4 versus SOCKS5 and why remote DNS resolution matters',
        'Configure proxychains (dynamic_chain, strict_chain, proxy_dns) and drive tools through it',
        'Describe how Chisel and Ligolo-ng establish access and when each beats SSH -D',
        'Choose a tunneling approach using explicit tradeoffs'
      ],
      diagram: 'net-socks-proxy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'One -L forward per port does not scale: an internal network offers hundreds of services across dozens of hosts, and building a tunnel for each is untenable. SOCKS is the generic doorway — a proxy protocol in which the client states each destination at connect time, so any SOCKS-aware tool can reach anything the proxy can. One door, every destination the pivot allows.'
          },
          {
            type: 'p',
            text:
              'The practical art is plumbing: getting a SOCKS endpoint to where your tools can use it. SSH -D builds one out of an existing SSH session. Chisel carries one over an HTTP-shaped channel and can plant it in either direction. Ligolo-ng skips SOCKS entirely, giving your machine a routed TUN interface so even tools that ignore proxies behave as if they were inside the network. Each approach trades dependencies, performance and operational shape.'
          },
          {
            type: 'p',
            text:
              'DNS is the silent trap of this whole lesson. If your tools resolve names locally, internal hostnames either leak to an external resolver or fail outright. SOCKS5 can carry names to the proxy for remote resolution, proxychains can be told to do the same, and TUN approaches route the questions to the internal resolver — but only if you configure and verify it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-socks-proxy',
            caption: 'Three ways to move your vantage: SSH -D SOCKS, Chisel over HTTP, and Ligolo-ng TUN routing.'
          },
          {
            type: 'h',
            text: 'SOCKS in ninety seconds'
          },
          {
            type: 'p',
            text:
              'SOCKS4 is minimal: a TCP CONNECT request carrying an IP, no meaningful authentication, and the client is expected to resolve names itself. SOCKS5 adds authentication methods, a UDP associate mode, and — the property that matters most for internal testing — the ability to send a domain name instead of an IP, so resolution happens at the proxy, on the far side. Everything modern targets SOCKS5, and no, SOCKS itself does not encrypt anything: confidentiality comes from the carrier underneath (SSH, TLS).'
          },
          {
            type: 'h',
            text: 'proxychains: forcing tools through the door'
          },
          {
            type: 'p',
            text:
              'proxychains (the original at haad/proxychains, maintained today as proxychains-ng) is an LD_PRELOAD wrapper: it intercepts the socket calls of dynamically linked programs and redirects them through a configured proxy chain. Its configuration file (/etc/proxychains4.conf) has three parts that matter: the chain policy, DNS handling, and the proxy list.'
          },
          {
            type: 'code',
            lang: 'ini',
            title: 'proxychains4.conf — the three things that matter',
            code:
              '# chain policy: choose exactly one\n# dynamic_chain : skip dead proxies, keep the order\n# strict_chain  : every proxy must be alive, in order\ndynamic_chain\n\n# resolve names THROUGH the chain, not locally\nproxy_dns\n\n[ProxyList]\nsocks5 127.0.0.1 1080'
          },
          {
            type: 'p',
            text:
              'Usage is "proxychains <command>": proxychains -q nmap -sT -Pn -n -p 445,3389 10.0.20.0/24. Two hard rules follow from the mechanism. First, TCP connect scans only: -sS crafts raw packets outside the libc calls proxychains hooks, so SYN scans never enter the tunnel. Second, keep -n (no DNS) and proxy_dns together: the chain resolves, your resolver stays out of it. proxychains -q silences the banner, and -f lets you point at a specific config — essential the moment you own two doors.'
          },
          {
            type: 'list',
            items: [
              'Tools that are statically linked or use raw sockets bypass the LD_PRELOAD wrapper entirely',
              'UDP-heavy applications do not pass through a plain SOCKS CONNECT chain in practice',
              'Some programs resolve DNS internally despite wrapper settings — verify with a capture',
              'Per-tool quirks (and the constant risk of forgetting the wrapper) are why alternatives exist'
            ]
          },
          {
            type: 'h',
            text: 'Chisel: SOCKS over HTTP'
          },
          {
            type: 'p',
            text:
              'Chisel is a single Go binary: run "chisel server" on the pivot (authorized) and "chisel client" elsewhere, and the client gains a SOCKS endpoint while the traffic between them is shaped like HTTP/WebSocket — which passes HTTP-aware proxies and blends with web flows. The reverse mode flips the design: run the server on YOUR box, and from the pivot run "chisel client http://you:8080 R:socks" — the pivot dials out (useful when it can only egress), and a SOCKS door materializes on your side. Everything is initiated outbound from the target, which is exactly what egress-only rules permit.'
          },
          {
            type: 'h',
            text: 'Ligolo-ng: TUN instead of SOCKS'
          },
          {
            type: 'p',
            text:
              'Ligolo-ng takes the other branch: instead of teaching every tool about proxies, it gives your machine a routed interface. The proxy runs on your machine (./proxy -selfcert), the agent runs on the pivot (./agent -connect <you>:11601 -ignore-cert), the agent dials out to you, and your box gains a TUN device. Add a route for the internal segment and ordinary tools — nmap -sS included, because your kernel now forwards those packets through the tunnel — behave as if they were on the internal network. The agent NATs your traffic; internal name resolution can be pointed at the segment\u2019s resolvers from the proxy UI.'
          },
          {
            type: 'table',
            headers: ['Approach', 'Best when', 'Watch out for'],
            rows: [
              ['ssh -D + proxychains', 'SSH already exists on the pivot; small, careful TCP work', 'Raw-socket tools bypass the wrapper; DNS leaks without proxy_dns and -n'],
              ['Chisel', 'No SSH on the pivot, or it may only egress to you; HTTP-shaped channel wanted', 'Server/agent processes must be inventoried and cleaned up; still TCP/SOCKS semantics'],
              ['Ligolo-ng', 'Deep enumeration, tools that ignore proxies, -sS scans and routed behavior needed', 'Route hygiene (remove routes afterwards); an agent binary lives on the client asset'],
              ['Plain -L / -R', 'One or two known services, minimal footprint', 'Does not scale past a handful of ports; one tunnel per service']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This craft is ATT&CK T1090.003 (Multi-hop Proxy) in the wild and T1090 (Proxy) in general — and it is double-edged by design: the patterns you build (new SOCKS listeners, agent binaries dialing out, TUN devices appearing) are exactly what a competent SOC should alert on. Teaching both sides lets your report\u2019s detection section name specific, observable indicators rather than vague advice.'
          },
          {
            type: 'list',
            items: [
              'Full-protocol coverage: SMB clients, RDP viewers and database shells all work through one SOCKS door',
              'Egress-only pivots are solved by the reverse variants (Chisel R:socks, SSH -R), not by fighting firewalls',
              'DNS correctness decides whether internal hostnames work at all — verify resolution remotely',
              'TUN approaches carry broad, noisy enumeration far better than per-connection proxies'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Whether the pivot can accept inbound from you at all — this chooses forward versus reverse designs',
              'Egress filtering on the target: which destinations and ports may the pivot dial out to',
              'Internal DNS availability: does the pivot resolve internal names (decides proxy_dns and -n habits)',
              'Existing listeners on your own box before you bind anything (ss -tlnp first, always)',
              'Tools in your kit that are statically linked or raw-socket based — they will bypass LD_PRELOAD wrappers'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Every relay, agent and server binary you plant lives on someone\u2019s machine. In a client engagement that is agreed in the rules of engagement — named binaries, ports, lifetime and cleanup duties. In practice, it is your lab.'
          },
          {
            type: 'p',
            text:
              'Reuse the n13-l02 lab. First the SSH door, then drive two different tools through it with proxychains:'
          },
          {
            type: 'terminal',
            title: 'SSH -D + proxychains against the hidden segment',
            lines: [
              '$ ssh -N -f -D 127.0.0.1:1080 lab@192.168.56.10',
              '$ ss -tlnp | grep 1080',
              'LISTEN 0 128 127.0.0.1:1080 0.0.0.0:* users:(("ssh",pid=4511,fd=5))',
              '$ proxychains -q curl -s http://10.0.20.20/',
              'TGT internal app - served from the hidden segment',
              '$ proxychains -q nmap -sT -Pn -n -p 80,8443 10.0.20.20',
              'PORT     STATE    SERVICE',
              '80/tcp   open     http',
              '8443/tcp filtered https-alt',
              '# through SOCKS, a refused port reads as filtered: the proxy cannot tell you why'
            ]
          },
          {
            type: 'terminal',
            title: 'Reverse Chisel when the pivot can only dial out',
            lines: [
              '# on YOUR box: chisel server with reverse support',
              '$ ./chisel server --reverse --port 8080',
              'server: Reverse tunnelling enabled',
              'server: listening on :8080',
              '# on the PIVOT (authorized): the agent dials out to you',
              '$ ./chisel client http://192.168.56.1:8080 R:socks',
              'client: Connecting to ws://192.168.56.1:8080',
              'client: Connected (Latency 3.2ms)',
              '# a SOCKS door now opens on the server side (default port 1080)',
              '$ proxychains -q curl -s http://10.0.20.20/',
              'TGT internal app - served from the hidden segment'
            ]
          },
          {
            type: 'terminal',
            title: 'Ligolo-ng: routed access, conceptually',
            lines: [
              '# on YOUR box: the proxy, with a self-signed cert for the agent channel',
              '$ ./proxy -selfcert',
              'INFO[0000] Listening on 0.0.0.0:11601',
              '# on the PIVOT (authorized): the agent dials back',
              '$ ./agent -connect 192.168.56.1:11601 -ignore-cert',
              'INFO[0001] Connection established',
              '# in the proxy UI: create the TUN and route the internal segment',
              'ligolo-ng » ifconfig',
              'ligolo-ng » start',
              'ligolo-ng » route_add --name ligolo 10.0.20.0/24',
              '$ ip route | grep ligolo',
              '10.0.20.0/24 dev ligolo scope link',
              '$ nmap -sS -p 80,445 10.0.20.20      # raw SYN scan now traverses',
              'PORT    STATE SERVICE',
              '80/tcp  open  http',
              '445/tcp open  microsoft-ds'
            ]
          },
          {
            type: 'p',
            text:
              'Close with the DNS check: run one lookup of an internal-only name through each design and confirm it resolves remotely (proxy_dns or the TUN resolver), not locally. Then time a modest sweep through each approach once — feeling the performance gap in your own lab is worth more than any table.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP: from FIN-WKS02 you hold SSH to SVR-VPN01, so "ssh -D 1080" plus proxychains drives smbclient and careful NetExec checks against FILE01 and DB01 (TCP only, -sT, -n). When the engagement window allows broader sweeps, a ligolo agent on VPN01 — named in the ROE — routes the DB VLAN, and one -sS pass maps it properly. Both channels live in the tunnel inventory with open and close timestamps; both are named in the report as the access method used.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'One tunnel log per engagement',
            text:
              'Vantage, type, local port, remote target, purpose, opened-at, closed-at — one line per door. During testing it is your navigation system; at the end it is the cleanup checklist and a report appendix in one.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ssh -D', 'Instant SOCKS5 on any host with SSH access — zero extra binaries'],
              ['proxychains-ng', 'LD_PRELOAD wrapper steering TCP tools through the chain (github.com/rofl0r/proxychains-ng)'],
              ['Chisel', 'Single-binary HTTP-tunneled SOCKS with forward and reverse modes (github.com/jpillora/chisel)'],
              ['Ligolo-ng', 'TUN-based relaying that makes raw-socket tools work unmodified (github.com/nicocha30/ligolo-ng)'],
              ['curl --socks5-hostname', 'Quick SOCKS correctness checks with remote name resolution']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running nmap -sS through proxychains and trusting the filtered wall it produces — raw packets never entered the tunnel',
              'Forgetting proxy_dns (or the -n flag) and leaking internal hostnames to an external resolver',
              'Leaving chisel servers or ligolo agents running on client systems after the test — a cleanup failure and, from their side, an incident',
              'Binding SOCKS on 0.0.0.0 and sharing your doorway with the room',
              'Assuming SOCKS grants anonymity — every action still exits from a named pivot, under your authorization',
              'Choosing the tool before the reachability facts: direction (forward vs reverse) is decided by the network, not by preference'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab: (1) bring up SSH -D plus proxychains against the hidden segment, including one curl --socks5-hostname check proving an internal name resolves remotely; (2) switch to a reverse Chisel and repeat one probe; (3) add a Ligolo route and run one -sS scan. Then tear all three down — kill processes, remove the route, stop the servers — and verify with ss and ps that nothing remains on either side.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SOCKS5 is the generic doorway: per-connection destinations, optional auth, UDP support and remote DNS',
              'proxychains wraps TCP tools (connect scans only); raw sockets and static binaries bypass it',
              'Chisel moves SOCKS over HTTP in both directions; Ligolo-ng replaces SOCKS with routed TUN',
              'Direction is chosen by the network: inbound reach means forward, egress-only means reverse',
              'Every planted relay is an inventory item with an owner, a purpose and a close time'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n13-l03-q1',
          type: 'mcq',
          prompt: 'Which SOCKS5 capability over SOCKS4 matters most for internal testing?',
          options: [
            'Faster throughput on long transfers',
            'Remote name resolution: the client may send a domain name instead of an IP',
            'Automatic end-to-end encryption of the tunneled traffic',
            'Built-in port scanning of the far network'
          ],
          answerIndex: 1,
          hint: 'What happens to an internal hostname when only the proxy can resolve it?',
          explanation:
            'SOCKS4 expects the client to resolve names, so internal hostnames fail or leak to the wrong resolver. SOCKS5 can carry the name to the proxy for remote resolution (and adds auth and UDP associate). Note SOCKS itself never encrypts — confidentiality comes from SSH or TLS underneath.'
        },
        {
          id: 'n13-l03-q2',
          type: 'truefalse',
          prompt: 'Running "proxychains nmap -sS ..." reliably routes the SYN scan through a SOCKS tunnel.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who builds the raw packets, and through which API?',
          explanation:
            '-sS crafts raw packets outside the libc socket calls that proxychains hooks, so they leave the real interface, not the tunnel. Through SOCKS use -sT (connect scans); raw SYN scans need a routed approach such as Ligolo-ng\u2019s TUN.'
        },
        {
          id: 'n13-l03-q3',
          type: 'short',
          prompt: 'Give two concrete reasons to switch from SSH -D plus proxychains to a TUN approach like Ligolo-ng.',
          modelAnswer:
            'First, tool coverage: statically linked tools and raw-socket scanners (nmap -sS) bypass the LD_PRELOAD wrapper entirely, while a routed TUN carries their packets like any other traffic. Second, scale and behavior: broad sweeps and picky applications (unusual DNS, some UDP patterns) behave far better through a routed interface than through per-connection SOCKS, with no per-tool proxy configuration.',
          hint: 'Which tools never notice proxychains at all?',
          explanation:
            'The wrapper approach is brilliant for cooperative, dynamically linked TCP tools and clumsy for everything else. TUN approaches trade a route entry and an agent binary for near-native behavior across the whole toolkit.'
        },
        {
          id: 'n13-l03-q4',
          type: 'scenario',
          prompt:
            'Authorized engagement. The pivot can initiate outbound connections to your testing box on port 443 but drops all inbound connections. Name the fitting tunneling design for giving your tools SOCKS access, and describe how you set it up and clean it up.',
          modelAnswer:
            'A reverse design: run a listener on your box (a Chisel server with reverse support, or an SSH server you are authorized to use), and from the pivot run the client/agent that dials out to you — for example "chisel client http://you:443 R:socks". All connections are outbound from the target, matching its egress rule, and the SOCKS door appears on your side for proxychains to use. Setup: record the binary, port and purpose in the ROE-approved inventory; cleanup: stop the agent on the pivot, stop the server on your side, confirm with ss/ps that both ends are gone, and log the close time.',
          hint: 'Who dials whom when inbound is blocked?',
          explanation:
            'Egress-only footholds are the classic case for reverse tunnels: the direction of the initial connection is dictated by the firewall, but the resulting door serves your whole toolkit. The inventory entry and the two-sided teardown are what make this professional rather than improvised.'
        }
      ],
      references: [
        {
          title: 'Chisel — HTTP tunnel over WebSocket',
          url: 'https://github.com/jpillora/chisel',
          note: 'The README documents the forward/reverse client-server model and the R:socks remote used here.'
        },
        {
          title: 'Ligolo-ng — TUN-based pivoting',
          url: 'https://github.com/nicocha30/ligolo-ng',
          note: 'Proxy/agent model, route handling and the resolver options for internal DNS.'
        },
        {
          title: 'proxychains — original project',
          url: 'https://github.com/haad/proxychains',
          note: 'The original proxychains; concept and config structure shown in this lesson.'
        },
        {
          title: 'proxychains-ng — maintained fork',
          url: 'https://github.com/rofl0r/proxychains-ng',
          note: 'What most distributions ship as proxychains4, including -f and -q used here.'
        },
        {
          title: 'ssh(1) — OpenSSH manual',
          url: 'https://man.openbsd.org/ssh',
          note: '-D dynamic forwarding: the SOCKS server built into every SSH client.'
        }
      ]
    },
    {
      id: 'n13-l04',
      moduleId: 'n13',
      title: 'Double Pivots, Routes and Troubleshooting Tunnels',
      difficulty: 'Advanced',
      minutes: 17,
      prerequisites: ['n13-l03'],
      objectives: [
        'Chain two pivots deliberately and verify every hop independently',
        'Manage routes so deep segments are reachable without breaking your own networking',
        'Classify tunnel failures into your side, the pivot\u2019s side and the deep side',
        'Keep tunnel inventories and tear down in a disciplined order'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Real networks are layered: workstation VLAN, server VLAN, database VLAN, management. One tunnel buys one hop, and a serious engagement usually needs more than one. A double pivot means stacking vantage points deliberately — relay one, verify it, then relay through it — so that each layer of the network is reached through a door you can name, test and close.'
          },
          {
            type: 'p',
            text:
              'Two mental tools carry the work. Routes decide which of YOUR packets travel through which tunnel (only relevant for TUN-style access; SOCKS states destinations per connection). And the reachability matrix from n13-l01 decides what is worth tunneling at all. Together they turn "the deep VLAN is slow today" from a mystery into a diagnosed layer.'
          },
          {
            type: 'p',
            text:
              'The professional difference is discipline: canary checks after every hop, a failure taxonomy instead of trial and error, an inventory written as doors open, and teardown in reverse order that leaves the client\u2019s network exactly as you found it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-pivot-topology',
            caption: 'A double pivot: the tester reaches SVR-VPN01 through the foothold; SVR-VPN01 bridges onward to the DB VLAN.'
          },
          {
            type: 'h',
            text: 'Chaining two hops'
          },
          {
            type: 'p',
            text:
              'Model the chain as A (you) to B (pivot one) to C (pivot two). SSH makes the first pattern almost trivial: -J (ProxyJump) tunnels the second SSH session through the first, so "ssh -J lab@pivot1 lab@pivot2" puts you on pivot two with one command — and combining it with -D gives a SOCKS door at pivot two\u2019s vantage. The explicit spelling of the same idea is a ProxyCommand with an inner ssh; beyond SSH, tool chains stack naturally: a Chisel relay from pivot one to pivot two, or chained Ligolo agents, each documented as its own inventory line.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'One command, two hops',
            code:
              '# SOCKS5 at PIVOT2\u2019s vantage via PIVOT1 — authorized lab\nssh -N -f -D 127.0.0.1:1081 -J lab@192.168.56.10 lab@10.0.20.10'
          },
          {
            type: 'h',
            text: 'Routes: telling your kernel where deep networks live'
          },
          {
            type: 'p',
            text:
              'With SOCKS doors, no routes exist — each tool states its destination per connection and the chain resolves it. With TUN-style access (Ligolo-ng), reachability follows your routing table: add a route for the deep segment through the TUN device (ip route add 10.0.30.0/24 dev ligolo, or the proxy\u2019s route_add in practice), and every tool\u2019s packets follow it. Keep route changes minimal, reversible and recorded: every entry you add goes in the inventory with its removal command, and nothing ever points your default route through a lab tunnel.'
          },
          {
            type: 'h',
            text: 'Verify each hop with canaries'
          },
          {
            type: 'p',
            text:
              'After each hop, exercise it against a known-live target before building on it: curl a service you have already confirmed, nc a banner you can predict. Two chained but unverified hops produce failures that look like neither — the canary ladder from hop one upward localizes a break in seconds.'
          },
          {
            type: 'code',
            lang: 'ini',
            title: 'chain2.conf — a second door, kept separate',
            code:
              'strict_chain\nproxy_dns\n[ProxyList]\nsocks5 127.0.0.1 1081'
          },
          {
            type: 'terminal',
            title: 'The verification loop after each hop',
            lines: [
              '$ ss -tlnp | grep -E \':108[01]\'',
              'LISTEN 0 128 127.0.0.1:1080 0.0.0.0:* users:(("ssh",pid=4312,fd=4))',
              'LISTEN 0 128 127.0.0.1:1081 0.0.0.0:* users:(("ssh",pid=4390,fd=4))',
              '$ proxychains -q nc -zv 10.0.20.25 22          # hop 1 canary',
              'Connection to 10.0.20.25 22 port [tcp/*] succeeded!',
              '$ proxychains4 -f chain2.conf -q nc -zv 10.0.30.15 1433   # hop 2 canary',
              'Connection to 10.0.30.15 1433 port [tcp/*] succeeded!'
            ]
          },
          {
            type: 'h',
            text: 'The failure taxonomy'
          },
          {
            type: 'table',
            headers: ['Layer', 'Typical symptom', 'First checks'],
            rows: [
              ['Your side', 'bind: Address already in use; the listener never appears', 'ss -tlnp for the port; stale tunnel from earlier; wrong bind address (0.0.0.0 vs 127.0.0.1)'],
              ['Carrier (SSH session)', 'Tunnel was fine, then everything died together', 'Idle NAT timeouts; ServerAliveInterval; reconnect with ExitOnForwardFailure and ssh -v'],
              ['Pivot side', 'channel open failed: connect failed / Name or service not known', 'The pivot cannot reach the target: resolution (getent hosts), port (nc), pivot firewall (nft/ufw, with authorization)'],
              ['Deep side', 'Some ports work, others time out; only the far segment is affected', 'Segment ACLs and asymmetric return paths; re-check the reachability matrix rather than the tunnel'],
              ['DNS', 'Names fail but IPs work; internal names resolve to public addresses', 'Leaked resolution: proxy_dns / -n or the TUN resolver; verify a lookup through the chain']
            ]
          },
          {
            type: 'h',
            text: 'Documentation and tear-down'
          },
          {
            type: 'p',
            text:
              'The inventory is the teardown script: vantage chain, type (-L, -D, Chisel, Ligolo), local bind, remote target, purpose, opened-at, closed-at. Tear down newest first — the deepest relays sit on the most sensitive machines — and after each removal re-run ss and ps to confirm. Finish by re-verifying the client\u2019s state: one canary from your original vantage, and the routes and resolv.conf of your own machine back to baseline.'
          },
          {
            type: 'list',
            items: [
              'Stop deep-hop relays first (agents, second-hop servers)',
              'Kill background SSH tunnels on your side, matching pids from ss -tlnp, not from memory',
              'Remove every route and TUN interface you created',
              'Re-verify: no listeners, no new processes, routes and resolver restored'
            ],
            ordered: true
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Depth is the story the client bought: a double pivot demonstrates that segment controls fail in series, which is the concrete version of the risk their board approved the test for (ATT&CK T1090.003, Multi-hop Proxy). Troubleshooting speed is also client value — every silent hour inside a fixed window is scope you did not cover — and the canary discipline keeps your conclusions attached to evidence instead of to hope.'
          },
          {
            type: 'list',
            items: [
              'Prove layered-control failure with per-hop evidence: each edge documented like any other finding',
              'Blue-team coordination: the chaining pattern is exactly what their detections should recognize',
              'Fast, systematic triage keeps engagement windows short and clients calm'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Second-tier multi-homed hosts: pivots that straddle another boundary (management VLANs, replication networks)',
              'SSH keys or cached credentials on pivot one that open pivot two — the cheapest hop is often identity, not networking',
              'Segment ACLs filtering by source: your tunnel inherits the pivot\u2019s source address, not yours',
              'DNS servers per segment: deep segments often resolve only from their own resolvers',
              'Routing tables that imply reachability the firewall does not actually permit — always verify'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Extend the lab to four machines: ATK, PIVOT1 (two NICs), PIVOT2 (two NICs, reachable only from PIVOT1\u2019s second network) and DB (behind PIVOT2). Build the chain, then prove each layer:'
          },
          {
            type: 'terminal',
            title: 'Build and prove the double hop',
            lines: [
              '$ ssh -N -f -D 127.0.0.1:1080 lab@192.168.56.10                # hop 1: SOCKS @ PIVOT1',
              '$ ssh -N -f -D 127.0.0.1:1081 -J lab@192.168.56.10 lab@10.0.20.10   # hop 2 via hop 1',
              '$ ss -tlnp | grep -E \':108[01]\'',
              'LISTEN 0 128 127.0.0.1:1080 0.0.0.0:* users:(("ssh",pid=4312,fd=4))',
              'LISTEN 0 128 127.0.0.1:1081 0.0.0.0:* users:(("ssh",pid=4390,fd=4))',
              '$ proxychains -q nc -zv 10.0.20.25 22              # hop 1 canary',
              'Connection to 10.0.20.25 22 port [tcp/*] succeeded!',
              '$ proxychains4 -f chain2.conf -q nc -zv 10.0.30.15 1433   # hop 2 canary',
              'Connection to 10.0.30.15 1433 port [tcp/*] succeeded!'
            ]
          },
          {
            type: 'terminal',
            title: 'The troubleshooting drill: break one thing on purpose',
            lines: [
              '# on PIVOT2 (authorized lab): block forwarding to the DB VLAN',
              '$ sudo iptables -A FORWARD -d 10.0.30.0/24 -j REJECT',
              '$ proxychains4 -f chain2.conf -q nc -zv 10.0.30.15 1433',
              '# hop 2 canary now fails while the hop 1 canary still passes',
              '# -> the failure sits between PIVOT2 and the DB VLAN, not in your tunnels',
              '$ sudo iptables -D FORWARD -d 10.0.30.0/24 -j REJECT   # restore',
              '$ proxychains4 -f chain2.conf -q nc -zv 10.0.30.15 1433',
              'Connection to 10.0.30.15 1433 port [tcp/*] succeeded!'
            ]
          },
          {
            type: 'p',
            text:
              'Then practice the DNS failure: use an internal-only hostname through a chain without proxy_dns and watch it fail or resolve wrongly; fix the config, verify the lookup travels the chain. Close the session with the full teardown drill — newest first, ss and ps after each step, routes removed, one canary from the original vantage.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP: FIN-WKS02 (foothold) to SVR-VPN01 (server VLAN) to OPS-JMP01 (management/DB VLAN). Door one: "ssh -D 1080 lab@FIN-WKS02-style vantage"; door two: -J through VPN01 to JMP01 binding 1081; chain2.conf points at 1081. Canaries: FILE01:445 for hop one, DB01:1433 for hop two. The inventory reads like this: "2024-05-11 14:22 open ssh -D 1080 (FIN-WKS02 to SVR-VPN01) for SMB enum; 14:31 open ssh -D 1081 -J (via VPN01 to OPS-JMP01) for DB enum". At 17:05 the doors close in reverse order and the log gains two more lines — evidence, cleanup record and retest checklist in one file.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Write the inventory as you open, not after',
            text:
              'Post-hoc inventories forget the third tunnel and every route entry. One line per door at open time costs ten seconds; reconstruction at report week costs hours and credibility.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ssh -J', 'ProxyJump: stacked SSH hops in one command, documented in ssh(1)'],
              ['proxychains4 -f', 'Per-chain config files keep hop 1 and hop 2 traffic separate'],
              ['ip route', 'Add and remove TUN routes for TUN-style access; every change recorded'],
              ['nc / curl', 'Canary checks per hop before anything builds on it'],
              ['ss + ps', 'Ground truth for what you are running, locally and (authorized) on pivots']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Blaming the newest tunnel first: run the canary ladder from hop one upward — the break is usually one specific hop',
              'Adding routes or hosts-file entries without recording them; leftovers leak internal addresses into your machine for weeks',
              'Pointing /etc/resolv.conf at a deep-segment resolver and wrecking your own name resolution — prefer chain-side DNS',
              'Assuming the pivot\u2019s firewall allows what its routing table implies — routing and filtering are different controls',
              'Skipping canaries: two unverified hops produce errors that look like neither',
              'Tearing down in the wrong order and orphaning an agent on the deepest host'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Extend your n13-l03 lab to four machines and reproduce the whole lesson: two chained SOCKS doors via -J, a canary per hop, one deliberate break-and-fix on PIVOT2 (iptables REJECT, diagnose, restore), separate chain configs, and a complete inventory with reverse-order teardown. Finish by confirming — with ss, ps and ip route — that your testing machine has entirely forgotten the lab.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Chain hops deliberately: one vantage per layer, verified with canaries before the next hop',
              '-J (ProxyJump) stacks SSH hops in a single command; per-chain proxychains configs keep doors separate',
              'Routes are only needed for TUN-style access; record and reverse every change',
              'Classify failures by layer: your bind, the carrier, the pivot\u2019s reach, the deep ACLs, or DNS',
              'Inventories open with you, teardown runs newest-first, and the network must look untouched when you leave'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n13-l04-q1',
          type: 'mcq',
          prompt: 'What does "ssh -J lab@pivot1 lab@pivot2 -D 1081" accomplish?',
          options: [
            'It forwards port 1081 from pivot2 back to pivot1',
            'It reaches pivot2 through pivot1 and opens a SOCKS proxy with pivot2\u2019s vantage',
            'It copies SSH keys from pivot1 to pivot2 for later use',
            'It creates two independent tunnels that cannot fail together'
          ],
          answerIndex: 1,
          hint: 'Where does the -D listener\u2019s traffic actually exit?',
          explanation:
            'ProxyJump chains the transport through pivot1 (the SSH session to pivot2 is carried inside the session to pivot1); the -D door then egresses from pivot2. One command, two hops, stacked vantage — and one carrier whose failure takes both layers down together.'
        },
        {
          id: 'n13-l04-q2',
          type: 'truefalse',
          prompt: 'A routing table entry on the pivot proves that traffic can actually pass to the deeper segment.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Routing decides where packets are sent — does it decide whether they arrive?',
          explanation:
            'Routing and filtering are separate controls: an ACL can silently drop what the routing table promises. That is exactly why the canary check exists — verified reachability, not implied reachability, goes into the matrix and the report.'
        },
        {
          id: 'n13-l04-q3',
          type: 'short',
          prompt: 'Name the five layers of the failure taxonomy and one first check for each.',
          modelAnswer:
            'Your side (ss -tlnp for the bind port; stale tunnels; wrong bind address), carrier (idle drops — ServerAliveInterval, ssh -v, reconnect), pivot side (resolve and port-test the target from the pivot; pivot firewall rules), deep side (segment ACLs and asymmetric paths — re-check the matrix), DNS (resolution path — proxy_dns/-n or TUN resolvers; verify a lookup through the chain).',
          hint: 'Where can a tunnel chain break, from your keyboard to the far subnet?',
          explanation:
            'The taxonomy turns "the tunnel is broken" into a five-minute triage: run the canary ladder, localize the layer, apply that layer\u2019s check. Most multi-hop problems are one specific hop, not the concept.'
        },
        {
          id: 'n13-l04-q4',
          type: 'scenario',
          prompt:
            'Your double pivot worked all morning; after lunch, hop 2 canaries time out while hop 1 still passes. The client mentioned network maintenance today. What do you check, in order, and what do you document either way?',
          modelAnswer:
            'Re-run the hop 1 canary to confirm nothing else moved; then, with authorization, test the deep path from the pivot\u2019s vantage: resolve the DB VLAN names, port-test DB01, and inspect PIVOT2\u2019s forwarding/firewall state for a new rule (maintenance is the prime suspect). Do not rebuild your tunnels first. Document times, exact commands and outputs; notify the engagement contact that the deep segment appears changed; resume only after the canary passes, and note the incident window in the phase log — it is also useful detection information for their SOC.',
          hint: 'Which hop failed, and what changed at lunch?',
          explanation:
            'The canary ladder localizes the break to the deep path; the maintenance context points at the client\u2019s own change rather than your tooling. Professional practice is evidence-first triage plus communication — and the same discipline that diagnoses your lab here keeps real engagements calm.'
        }
      ],
      references: [
        {
          title: 'ssh(1) — OpenSSH manual',
          url: 'https://man.openbsd.org/ssh',
          note: '-J/ProxyJump and forwarding semantics for stacked hops.'
        },
        {
          title: 'proxychains-ng — maintained fork',
          url: 'https://github.com/rofl0r/proxychains-ng',
          note: 'Per-chain configuration with -f, the mechanism behind the second door.'
        },
        {
          title: 'MITRE ATT&CK T1090.003 — Multi-hop Proxy',
          url: 'https://attack.mitre.org/techniques/T1090/003/',
          note: 'The adversary-side name for exactly the double-pivot pattern this lesson teaches.'
        },
        {
          title: 'Nmap reference guide',
          url: 'https://nmap.org/book/man.html',
          note: 'Target specification and timing options for sweeps run through tunnels.'
        }
      ]
    }
  ]
};
