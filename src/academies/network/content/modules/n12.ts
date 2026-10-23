import type { Module } from '../../../../types';

// LEVEL 7 — INTERNAL NETWORK TESTING · Module 12: Internal Network Pentesting
// Original curriculum content synthesized from public official documentation:
// MITRE ATT&CK, IETF RFCs, Microsoft Learn and Linux man-pages. All prose is
// original; reference links point to the official sources used for study.
// All examples run against the fictional LABCORP lab network and are taught
// for AUTHORIZED testing only.

export const n12: Module = {
  id: 'n12',
  title: 'Internal Network Pentesting',
  level: 7,
  description:
    'The full internal engagement workflow, taught on a fictional company network (DMZ, workstations, file server, application server, database, domain controller): how internal tests differ from external ones, how to map and enumerate quietly from a foothold, how to handle credentials safely, how to reason about trust and segmentation, and how to chain findings into documented attack paths.',
  outcomes: [
    'Structure an internal test: entry assumptions, scoping and rules of engagement',
    'Map and enumerate an internal network quietly, starting from what a foothold already knows',
    'Work with discovered credentials safely and validate access without causing lockouts',
    'Reason about trust relationships, segmentation and high-value targets',
    'Chain individual findings into attack paths and document each hop with evidence'
  ],
  lessons: [
    {
      id: 'n12-l01',
      moduleId: 'n12',
      title: 'External vs Internal Pentesting and Initial Access Concepts',
      difficulty: 'Intermediate',
      minutes: 16,
      prerequisites: ['n11-l03'],
      objectives: [
        'Contrast the objectives and rules of external and internal network tests',
        'Describe common engagement entry modes: assumed breach, from-VPN, from exposed service',
        'Explain the standard initial-access paths at a conceptual level',
        'Set up the LABCORP scenario used throughout this module'
      ],
      diagram: 'net-internal-topology',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An external pentest answers one question: what can the internet see and break? An internal pentest answers a different question entirely: given that someone is already inside — a phished employee, a stolen VPN credential, a compromised laptop — how far can they go, and how fast? The skills overlap (the same services, the same tools) but the objectives, the constraints and the risks are different enough that a tester must consciously switch modes.'
          },
          {
            type: 'p',
            text:
              'Internal tests are also more constrained. You are operating among real users, real authentication systems and real monitoring. Account lockouts, noisy scans and destructive validation all have business consequences within minutes. That is why this module pairs every technique with a safety habit: enumerate broadly and quietly, authenticate narrowly and deliberately, and document as you go.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Engagements reach the inside of a network in three standard ways. In an assumed-breach test the client hands you a starting point — a workstation VM, a standard domain account, sometimes both — so the test focuses entirely on post-foothold movement and detection. In a from-VPN test you are given (or must legitimately obtain) remote-access credentials and enter as a remote worker would. In the rare exposed-service variant the foothold comes from an internet-facing system the external phase compromised. Each mode changes your first hour: assumed breach starts at mapping, VPN entry starts at posture checks of the remote-access path, and exposed-service entry starts at foothold stabilization.'
          },
          {
            type: 'diagram',
            id: 'net-internal-topology',
            caption: 'The LABCORP network: DMZ, workstation VLAN and server VLAN with the core services.'
          },
          {
            type: 'p',
            text:
              'Initial access itself is a conceptual field you should be able to discuss even when you do not perform it: phishing that delivers a payload to an employee (T1566), abuse of valid but stolen accounts such as VPN credentials (T1078), and exploitation of a public-facing application (T1190). An internal test usually inherits one of these as its premise, and a good report states the premise explicitly — the value you demonstrate is what the premise enables, not the premise itself.'
          },
          {
            type: 'table',
            headers: ['Engagement mode', 'You start with', 'First priorities'],
            rows: [
              ['Assumed breach', 'A foothold host and/or account', 'Mapping, enumeration, quiet validation'],
              ['From VPN', 'Remote-access credentials', 'Posture of VPN segment, then the same workflow'],
              ['From exposed service', 'A shell on a DMZ host', 'Stabilize, egress check, then pivot inward']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Mode and scope shape everything: what you may touch, how loud you may be, which accounts may be locked out, and what "success" means. Before any technique in the rest of this module, the professional step is a written understanding — scope, entry mode, allowed actions, contacts and a kill switch. Internally, the tester is also the person most able to cause accidental damage, which is why the rules matter more here than anywhere else in the curriculum.'
          },
          {
            type: 'list',
            items: [
              'Assumed breach maximizes post-foothold learning and is the default for detection-focused engagements',
              'From-VPN entry tests the remote-access perimeter as a real user path, including MFA and posture',
              'Exposed-service entry tests the whole chain, but its internal phase still needs the same discipline',
              'Every mode requires the same first internal action: figure out where you are before moving'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Scope documents that name networks, hosts, accounts and explicitly out-of-scope systems',
              'The entry mode and the credentials or foothold you are entitled to use',
              'Lockout thresholds, alerting expectations and emergency contacts in the rules of engagement',
              'Egress paths available to a foothold (for staged tests and for later exfiltration testing if in scope)',
              'The network position of your foothold: which VLAN, which firewall zone, which DNS servers'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Internal testing is authorized intrusion',
            text:
              'Everything in this module assumes a signed agreement: defined scope, allowed techniques, time window and contacts. If any of those is missing, the professional answer is to stop and ask. Techniques taught here must only ever be practiced in labs or executed under such an agreement.'
          },
          {
            type: 'p',
            text:
              'There is no exploitation to run in this lesson. The testable skill is preparation: verify your foothold\u2019s position and connectivity quietly, and confirm which documentation you have before touching anything.'
          },
          {
            type: 'terminal',
            title: 'First five minutes on a foothold (LABCORP workstation VM)',
            lines: [
              '$ ip route',
              'default via 10.10.30.1 dev eth0',
              '10.10.30.0/24 dev eth0 proto kernel scope link',
              '$ ip neigh',
              '10.10.30.1 dev eth0 lladdr 00:0c:29:11:22:33 REACHABLE',
              '$ cat /etc/resolv.conf',
              'nameserver 10.10.40.5',
              'search corp.lab',
              '$ ping -c1 -W1 10.10.40.5',
              '1 packets transmitted, 1 received, 0% packet loss'
            ]
          },
          {
            type: 'p',
            text:
              'Read together, this says: you are on the workstation VLAN, the gateway is 10.10.30.1, DNS points at 10.10.40.5 (which is the domain controller, given what module 11 taught you), and the server VLAN is reachable. That is your starting map — obtained with four quiet commands and zero scan traffic.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP is the fictional company used for the rest of this module. An nginx reverse proxy (PROXY01, 10.10.10.5) sits in the DMZ VLAN 10.10.10.0/24. Workstations live in VLAN 10.10.30.0/24. The server VLAN 10.10.40.0/24 holds DC01 (10.10.40.5, domain controller, DNS and Kerberos), FILE01 (10.10.40.10, file server), APP01 (10.10.40.20, the web application server) and DB01 (10.10.40.30, the Microsoft SQL database). The engagement is assumed breach: you start on a standard workstation with the domain account jdoe.'
          },
          {
            type: 'table',
            headers: ['Segment', 'Subnet', 'Key hosts'],
            rows: [
              ['DMZ', '10.10.10.0/24', 'PROXY01 (nginx) 10.10.10.5'],
              ['Workstations', '10.10.30.0/24', 'FIN-WKS01/02/... (your foothold: FIN-WKS02)'],
              ['Servers', '10.10.40.0/24', 'DC01 .5, FILE01 .10, APP01 .20, DB01 .30']
            ]
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'ip route / ip neigh / resolv.conf — the foothold\u2019s own picture of the network',
              'ping with tight timeouts — the gentlest reachability probe',
              'The engagement documents themselves — scope, ROE and contacts are tools like any other'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Starting with a loud full-range scan before reading the foothold\u2019s own routing and DNS information',
              'Assuming the external and internal phases share the same rules of engagement',
              'Treating "we will give you a domain account" as permission to test authentication limits; lockout policy still applies',
              'Forgetting to record the entry premise in the report, leaving readers unable to judge what the paths depend on',
              'Not establishing a kill switch and contact path before the first packet'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your home lab, simulate the LABCORP entry: boot a workstation VM into an internal network with a gateway and a second subnet reachable. Before scanning anything, answer from the VM alone: which subnet am I on, where does DNS point, which hosts does my ARP cache already know, and is the server subnet reachable. Write the four answers as the opening paragraph of a mock engagement log.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'External tests ask what the perimeter exposes; internal tests ask what a foothold enables',
              'Entry modes: assumed breach, from-VPN, exposed service — each changes your first hour',
              'Initial access concepts (T1566, T1078, T1190) are the premises internal tests inherit',
              'Scope, ROE and contacts are the first deliverable, not paperwork afterthoughts',
              'The foothold already knows the network: routes, ARP and DNS come before any scanning'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n12-l01-q1',
          type: 'mcq',
          prompt: 'In an assumed-breach engagement, the client provides you with:',
          options: [
            'A starting foothold such as a workstation or standard account, so testing focuses on post-foothold movement',
            'Domain administrator credentials for convenience',
            'Permission to scan the whole estate as loudly as needed',
            'A list of vulnerabilities to confirm'
          ],
          answerIndex: 0,
          hint: 'The name describes what is assumed, not what is granted.',
          explanation:
            'Assumed breach skips or simulates initial access by handing over a foothold, concentrating the engagement on lateral movement, high-value targets and detection. It grants no special privilege beyond the stated starting point.'
        },
        {
          id: 'n12-l01-q2',
          type: 'truefalse',
          prompt: 'An internal test with a signed scope and rules of engagement still requires the tester to respect account lockout policies.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Authorization removes the legal barrier, not the business impact.',
          explanation:
            'Scope makes the activity lawful and agreed; it does not suspend the environment. Lockouts, monitoring alerts and user disruption are real consequences, which is why ROE documents define how aggressive authentication testing may be.'
        },
        {
          id: 'n12-l01-q3',
          type: 'short',
          prompt: 'Name the three standard initial-access paths discussed in this lesson and their MITRE ATT&CK technique identifiers.',
          modelAnswer:
            'Phishing with payload delivery (T1566), abuse of valid accounts such as stolen VPN credentials (T1078), and exploitation of a public-facing application (T1190). Internal tests usually inherit one of these as the stated premise.',
          hint: 'One arrives by email, one by login, one by bug.',
          explanation:
            'These are the canonical ways testers and attackers get inside. An internal report states which premise it inherited, because every demonstrated path depends on it.'
        },
        {
          id: 'n12-l01-q4',
          type: 'scenario',
          prompt:
            'A client says: "Assume you have the VPN credentials of a finance user. Show us what happens next." List the decisions you must pin down before your first packet, and your first three quiet actions after connecting.',
          modelAnswer:
            'Pin down: written scope (networks/hosts), the exact account and its group memberships, lockout and alerting constraints, time window, contacts and kill switch, and whether egress or data-exfiltration testing is in scope. First quiet actions: confirm my position (IP, gateway, DNS servers, search domain), check the ARP cache and routing table for what the host already knows, and validate reachability of the domain infrastructure with a single DNS query or ping — then begin structured, low-rate enumeration of the segments the account is meant to reach.',
          hint: 'Everything that determines "how loud can I be" lives in a document, not a scanner.',
          explanation:
            'Professional internal testing front-loads constraints and starts from the host\u2019s own knowledge. The first actions produce a map with negligible detection value, which is exactly the posture the rest of the module assumes.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1190 — Exploit Public-Facing Application',
          url: 'https://attack.mitre.org/techniques/T1190/',
          note: 'The exposed-service entry path, formally modeled.'
        },
        {
          title: 'MITRE ATT&CK T1566 — Phishing',
          url: 'https://attack.mitre.org/techniques/T1566/',
          note: 'The most common real-world initial access premise.'
        },
        {
          title: 'MITRE ATT&CK T1078 — Valid Accounts',
          url: 'https://attack.mitre.org/techniques/T1078/',
          note: 'The stolen-credential premise behind most from-VPN engagements.'
        }
      ]
    },
    {
      id: 'n12-l02',
      moduleId: 'n12',
      title: 'Internal Mapping and Enumeration',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n12-l01'],
      objectives: [
        'Derive a network map from a foothold\u2019s local artifacts before scanning',
        'Choose scan strategies that balance coverage against detection risk',
        'Prioritize service discovery by target value: management, file, web, database',
        'Identify domain controllers by port pattern and DNS SRV records'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'You have a shell on FIN-WKS02. The tempting move is a full /16 scan; the professional move is to realize the host has been sitting on this network for months and already knows most of what you need. Its ARP cache lists machines it recently spoke to, its routing table describes adjacent subnets, its DNS configuration names the domain controllers, and its cached group policies hint at server roles. Enumeration from the inside is mostly reading what the network already told the host.'
          },
          {
            type: 'p',
            text:
              'When you do scan, the trade is explicit: coverage versus noise. Internal networks are monitored, and a synthetic full-range sweep looks exactly like what it is. Slow, targeted, prioritized discovery — management ports first, then the services that matter — gets the same map at a fraction of the alarm value.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Local artifacts first'
          },
          {
            type: 'list',
            items: [
              'ARP cache (arp -a or ip neigh / Get-NetNeighbor): recently contacted L2 neighbors — often file servers, printers, the gateway',
              'Routing table (route print / ip route): every subnet the host knows a path to, including static routes between VLANs',
              'DNS configuration (resolv.conf / Get-DnsClientServerAddress): the domain suffix and resolver, usually a DC',
              'Environment: proxy settings, mapped drives (net use), logon scripts — each is a server name delivered by policy',
              'Certificates and cached Kerberos tickets on Windows footholds frequently name service principals and their hosts'
            ]
          },
          {
            type: 'diagram',
            id: 'net-enumeration-workflow',
            caption: 'From foothold facts to a prioritized target list.'
          },
          {
            type: 'h',
            text: 'Quiet sweep strategies'
          },
          {
            type: 'p',
            text:
              'A host discovery sweep (nmap -sn) with lowered timing (-T2), reduced retries and a defined subnet stays under most alerting thresholds while still enumerating live hosts. Service discovery then runs only against the ports that matter. The priorities follow value: remote management (22, 3389, 5985), file and domain services (445, 2049, 88, 389), web (80, 443, 8080), then databases (1433, 3306, 5432, 6379). Ten ports across a /24 is a different signature than 65,535.'
          },
          {
            type: 'h',
            text: 'Finding the domain controller'
          },
          {
            type: 'p',
            text:
              'Two methods, in order of preference. First, ask DNS: SRV records for _ldap._tcp.dc._msdcs and _kerberos._tcp (module 11) name the DCs authoritatively with one query to the resolver. Second, recognize the pattern: a host answering on 88 (Kerberos), 389/636 (LDAP) and 445 (SMB) — often with 53 (DNS) — is a domain controller. In LABCORP both methods converge on DC01, 10.10.40.5.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The map you build here determines everything downstream: which hosts to validate credentials against, where the segmentation boundaries are (module n12-l04), and which findings chain into attack paths (n12-l05). ATT&CK formalizes this activity as Network Service Scanning (T1046) and Remote System Discovery (T1018) — the recon half of every internal intrusion, and therefore the half defenders watch most closely. Quiet technique is not about hiding from the client; it is about testing detection honestly instead of tripping it trivially.'
          },
          {
            type: 'list',
            items: [
              'Local artifacts produce a defensible, evidence-backed map with zero scan traffic',
              'Prioritized port discovery returns the valuable hosts in the first minutes of scanning',
              'DC identification is the single most important enumeration result on a domain network',
              'Sweep rate and port count are the two knobs that keep discovery under alerting thresholds'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Static routes in the foothold\u2019s routing table that reveal management or backup VLANs',
              'ARP cache entries for servers — they tell you which services this workstation actually uses',
              'Mapped drives and logon scripts naming file servers and their share structure',
              'The 88/389/445 port combination that identifies domain controllers',
              'SRV records answering DC discovery without a single probe packet to the server VLAN',
              'Management ports (5985, 3389, 22) open from the workstation VLAN to server VLANs — segmentation observations for later'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Quiet is a scope question, not just a stealth trick',
            text:
              'Discuss scan rates and port sets in the rules of engagement. Some engagements want you to test detection — say so in the report — but every sweep still stays inside the agreed networks, accounts and hours.'
          },
          {
            type: 'terminal',
            title: 'Mapping from FIN-WKS02 (LABCORP foothold)',
            lines: [
              '$ arp -a',
              '  10.10.30.1     00-0c-29-aa-11-01   dynamic',
              '  10.10.30.20    00-0c-29-aa-11-14   dynamic',
              '$ route print -4',
              '  10.10.30.0/24    On-link',
              '  10.10.40.0/24    10.10.30.1     <- reachable via gateway',
              '$ nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.lab 10.10.40.5',
              'svr hostname   = dc01.corp.lab',
              '$ nmap -sn 10.10.40.0/24 -T2 --max-retries 1',
              'Nmap scan report for dc01.corp.lab (10.10.40.5)',
              'Nmap scan report for file01.corp.lab (10.10.40.10)',
              'Nmap scan report for app01.corp.lab (10.10.40.20)',
              'Nmap scan report for db01.corp.lab (10.10.40.30)',
              '$ nmap -sT -Pn -T2 -p 88,389,445,5985,3389 10.10.40.0/24',
              '10.10.40.5:  88,389,445 open      <- DC pattern',
              '10.10.40.10: 445,5985 open',
              '10.10.40.20: 445,5985,3389 open',
              '10.10.40.30: 445,5985 open'
            ]
          },
          {
            type: 'p',
            text:
              'The result is a role map in two commands: DC01 shows the controller pattern, FILE01 and APP01 are management-reachable, DB01 exposes SMB and WinRM but not RDP. Everything was learned with a ping sweep and five ports — a signature most monitoring treats as routine admin traffic.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP mapping output, summarized for the engagement log: foothold on VLAN 30; gateway routes VLAN 40; DNS at DC01. Host inventory from the ping sweep: four servers. Role assignment: DC01 (88/389/445), FILE01 (SMB + WinRM), APP01 (SMB + WinRM + RDP), DB01 (SMB + WinRM). Open questions for the next lesson: which credentials reach which of these hosts, and where is the segmentation weaker than the diagram claims?'
          },
          {
            type: 'table',
            headers: ['Host', 'Address', 'Observed services', 'Probable role'],
            rows: [
              ['DC01', '10.10.40.5', '88, 389, 445', 'Domain controller, DNS'],
              ['FILE01', '10.10.40.10', '445, 5985', 'File server'],
              ['APP01', '10.10.40.20', '445, 5985, 3389', 'Application server (IIS)'],
              ['DB01', '10.10.40.30', '445, 5985', 'Database server (MSSQL 1433 present per config)']
            ]
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['arp -a / route print / Get-NetNeighbor', 'The foothold\u2019s own network knowledge, zero traffic'],
              ['nslookup / dig', 'SRV-based DC discovery and general DNS recon'],
              ['nmap -sn, targeted -p sweeps with -T2', 'Quiet host discovery and prioritized service checks'],
              ['netexec (nxc)', 'Turning service discovery into identity-aware results once credentials exist'],
              ['Wireshark/tcpdump', 'Confirming what your own scan actually put on the wire']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running a full-range, full-port scan as the first action; the local artifacts and SRV records were free',
              'Scanning at default timing on production VLANs and eating an IDS alert in the first ten minutes',
              'Stopping at the first DC found — enterprises often run several, and secondary DCs matter for both mapping and reporting',
              'Recording scan output without interpretation; a map with roles and questions is the deliverable, not raw nmap text',
              'Forgetting to log every command and timestamp; the documentation habit starts with enumeration'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: build three VMs on two subnets (a "workstation" and two "servers", one running Samba AD DC). From the workstation, derive the full map using only arp, route, resolv.conf and one SRV lookup. Then validate with a -sn sweep and a five-port -p scan at -T2. Compare the time and packet counts of your approach against a single default-timing full-port scan of the same subnet — the difference is the lesson.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'The foothold already knows the network: ARP, routes and DNS come before scanners',
              'Prioritize management, file/domain, web and database ports over full-port sweeps',
              'SRV records or the 88/389/445 pattern identify domain controllers',
              'Quiet scanning is about testing honestly within detection constraints, agreed in the ROE',
              'Produce a role map with open questions — not a dump of scan output'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n12-l02-q1',
          type: 'mcq',
          prompt: 'Which port combination most reliably identifies a Windows domain controller in a service scan?',
          options: [
            '88, 389/636, 445 (often with 53)',
            '22, 80, 443',
            '135, 139, 5900',
            '3306, 5432, 6379'
          ],
          answerIndex: 0,
          hint: 'Kerberos plus LDAP plus SMB is a DC-shaped fingerprint.',
          explanation:
            'Kerberos (88), LDAP/LDAPS (389/636) and SMB (445) together — frequently with DNS on 53 — are the domain controller signature. DNS SRV records name the same hosts without touching them.'
        },
        {
          id: 'n12-l02-q2',
          type: 'truefalse',
          prompt: 'The ARP cache of a foothold is worthless for mapping because it only contains the local subnet gateway.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which L2 neighbors does a workstation actually talk to during a normal day?',
          explanation:
            'Workstations regularly exchange traffic with file servers, printers, application servers and the gateway, and all of them appear in the ARP cache. It is a free, evidence-backed list of recently used internal hosts.'
        },
        {
          id: 'n12-l02-q3',
          type: 'short',
          prompt: 'Explain why a targeted five-port sweep at reduced timing (-T2) is usually preferred to a default full-port scan during internal enumeration.',
          modelAnswer:
            'It produces the same high-value map (management, file/domain, database ports) with a far smaller traffic footprint: fewer packets, slower rate, less anomalous port diversity. That keeps the test under alerting thresholds, respects agreed ROE constraints, and avoids consuming detection budget before the engagement truly begins.',
          hint: 'The trade is coverage versus signature; which ports actually matter?',
          explanation:
            'Detection systems key on scan-like behavior — rate, breadth and port spread. Prioritized, slowed sweeps gather the valuable information while looking like ordinary administrative traffic.'
        },
        {
          id: 'n12-l02-q4',
          type: 'scenario',
          prompt:
            'From the LABCORP foothold you must produce a target map without generating obvious scan traffic. Describe your end-to-end approach and the artifacts you record.',
          modelAnswer:
            'First: local facts — ip/route or route print, ARP cache, DNS server and search suffix, mapped drives and logon scripts. Second: DNS SRV lookups for _ldap._tcp.dc._msdcs and _kerberos._tcp to name the DCs. Third: a slow -sn sweep of the server VLAN for liveness, then a -T2 five-port sweep (88, 389, 445, 5985, 3389) to assign roles. Artifacts: the host inventory table with roles, timestamps of every command, and the open questions (which credentials reach which hosts) that the next phase answers.',
          hint: 'Read, ask DNS, sweep slowly, assign roles.',
          explanation:
            'The layered approach converts a foothold into a structured map with minimal footprint, and the recorded artifacts are exactly what later phases and the final report consume.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1046 — Network Service Scanning',
          url: 'https://attack.mitre.org/techniques/T1046/',
          note: 'How scan activity is modeled in the adversary behavior framework.'
        },
        {
          title: 'MITRE ATT&CK T1018 — Remote System Discovery',
          url: 'https://attack.mitre.org/techniques/T1018/',
          note: 'The discovery half of this lesson, from ARP sweeps to DNS.'
        },
        {
          title: 'RFC 2782 — A DNS RR for specifying the location of services (DNS SRV)',
          url: 'https://datatracker.ietf.org/doc/html/rfc2782',
          note: 'The record type that makes DC discovery a DNS query.'
        }
      ]
    },
    {
      id: 'n12-l03',
      moduleId: 'n12',
      title: 'Credentials, Access Validation and Privilege Escalation Overview',
      difficulty: 'Advanced',
      minutes: 17,
      prerequisites: ['n12-l02'],
      objectives: [
        'Locate credential material in files, shares and (conceptually) memory',
        'Explain credential reuse patterns and why they dominate internal tests',
        'Validate discovered access safely without triggering lockouts',
        'Outline the standard local privilege escalation categories at concept level'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Credentials are the currency of an internal network: every technique in the last two lessons becomes powerful the moment it has a valid identity behind it. This lesson covers the full life of a credential during a test — where to find it, how to confirm it works, and what to do once you hold it — with one rule enforced throughout: validation must never turn into disruption. One account, one host, logged and reversible.'
          },
          {
            type: 'p',
            text:
              'The privilege escalation half is deliberately conceptual. Local privesc on Windows and Linux is its own discipline; here you learn the categories well enough to recognize opportunities and to brief specialists or schedule labs: misconfigured services, scheduled tasks, and the patch level that decides how many known bugs apply.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Where credentials live'
          },
          {
            type: 'list',
            items: [
              'Configuration files on shares and application servers: web.config, .env, wp-config.php, docker-compose files — connection strings with passwords are the classic find (T1552 Unsecured Credentials)',
              'SYSVOL and NETLOGON scripts: drive mappings, printer deployments and legacy Group Policy Preferences with encrypted passwords',
              'User artifacts on a foothold: browser-saved passwords, command history, unattended installation files (unattend.xml)',
              'Memory, at concept level: the Windows LSASS process holds the material that enables pass-the-hash and ticket abuse (T1003 OS Credential Dumping). Access requires admin rights on the host and is a specialist, high-impact technique — know it exists, practice it only in labs',
              'Humans: password reuse across personal and work contexts is the reason one validation can open many doors (T1078)'
            ]
          },
          {
            type: 'diagram',
            id: 'net-cred-attacks',
            caption: 'Credential sources feed validation, which feeds reuse-based movement.'
          },
          {
            type: 'h',
            text: 'Safe validation'
          },
          {
            type: 'p',
            text:
              'Validation answers one question — does this identity work on this host? — with minimal side effects. The professional pattern: validate against one host at a time, start with the least disruptive service (SMB session setup rather than interactive logon), never spray a password across many accounts at once, and record every attempt. Lockout thresholds are a design fact you discovered in the ROE phase; live within them. A validation that locks the account you just found is a finding against the tester, not the client.'
          },
          {
            type: 'h',
            text: 'Local privilege escalation categories'
          },
          {
            type: 'list',
            items: [
              'Service misconfiguration: services running as SYSTEM whose binary path is unquoted, or whose executable location is writable by standard users',
              'Scheduled tasks: jobs running as SYSTEM or an administrator that execute scripts standard users can modify (T1053 Scheduled Task/Job)',
              'Patch level: missing updates turn dozens of documented local bugs into opportunities; version inventory is half of privesc work',
              'Credential-bearing artifacts readable at the current privilege level: files, registry autologon entries, saved passwords',
              'On Linux: SUID binaries, sudo rules, writable cron scripts and PATH abuse — the same shape, different platform'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Almost every high-severity internal finding is a credential story: a password in a config file that also works on the database, a local admin reused fleet-wide (module 11), a service account with domain rights. Validation technique is what separates a careful tester from a lockout incident, and the escalation overview is what converts "I am a standard user on FIN-WKS02" into "and here is how that becomes local admin, then something more".'
          },
          {
            type: 'list',
            items: [
              'Config-file credentials are the most common first escalation from a foothold — grep before you scan',
              'Reuse chains: one validated pair usually validates elsewhere; test deliberately, one target at a time',
              'Validation via service authentication (SMB) is quieter and less disruptive than interactive desktop logons',
              'Escalation opportunities found but not exploited are still reportable — evidence over spectacle'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Connection strings or secrets in deployment shares, web roots and repository configs',
              'Scripts under SYSVOL/NETLOGON containing account names, paths or legacy-encrypted passwords',
              'Password patterns: seasons, company name, keyboard walks — enabling controlled, targeted guesses only where ROE allows',
              'Services and scheduled tasks whose binaries or scripts sit in user-writable paths',
              'Missing patches and EOL operating systems that enlarge the known-bug surface',
              'Autologon registry entries and unattended install files on workstation images'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Credentials carry responsibility',
            text:
              'Discovered credentials are client property. Use them only for validation and the paths the ROE authorizes, store them encrypted, and never test them against systems outside scope — including personal accounts. Memory-credential techniques belong in dedicated lab environments, not production validation.'
          },
          {
            type: 'terminal',
            title: 'Finding and validating a credential (LABCORP lab)',
            lines: [
              '$ smbclient //10.10.40.20/deploy -U "CORP\\jdoe%Winter2024!" -c "ls"',
              '  .                                   D        0  Mon Mar  4 10:12:00 2024',
              '  web.config                          A     4821  Mon Mar  4 10:12:00 2024',
              '$ smbclient //10.10.40.20/deploy -U "CORP\\jdoe%Winter2024!" -c "get web.config"',
              '$ grep -iE "password|user|secret" web.config',
              '  <add key="DbUser" value="svc_app" />',
              '  <add key="DbPassword" value="AutumnRain2024!" />',
              '$ nxc smb 10.10.40.30 -u svc_app -p "AutumnRain2024!"',
              'SMB  10.10.40.30  445  DB01  [+] CORP\\svc_app:AutumnRain2024!'
            ]
          },
          {
            type: 'terminal',
            title: 'Escalation opportunity inventory on an authorized host',
            lines: [
              '$ whoami /priv',
              'PRIVILEGES INFORMATION ---------------------- (standard user set)',
              '$ schtasks /query /fo LIST /v | findstr /i "Task To Run Run As User"',
              '  Task To Run:       C:\\Scripts\\nightly_backup.bat',
              '  Run As User:       SYSTEM',
              '$ icacls C:\\Scripts\\nightly_backup.bat',
              '  CORP\\Domain Users:(M)   <- writable by standard users: finding'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The LABCORP chain so far: the deploy share on APP01 held web.config with the svc_app credential; validation confirms it authenticates to DB01\u2019s SMB service; and on the foothold, a SYSTEM scheduled task runs a script writable by Domain Users — a local escalation path that is reportable whether or not it is exercised. Three findings, each with evidence, none louder than a file read and one authentication.'
          },
          {
            type: 'compare',
            title: 'Validation style: disruptive vs professional',
            beforeTitle: 'Spray and pray',
            beforeCode:
              'Password guessed against 500 accounts at once\nInteractive RDP logons for every check\nNo logging of attempts\nLockout storm at 10:04, test paused',
            afterTitle: 'Controlled validation',
            afterCode:
              'One account, one host per check\nSMB session validation before interactive logon\nEvery attempt logged with timestamp\nThresholds checked against ROE first'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['grep / findstr', 'Hunting secrets in configs, scripts and history files'],
              ['smbclient', 'Share reads and credential-safe file retrieval'],
              ['netexec (nxc smb/winrm/mssql)', 'Single-target credential validation with clear results'],
              ['schtasks / Get-ScheduledTask, icacls / accesschk', 'Service and task misconfiguration inventory'],
              ['whoami /priv, patched-up knowledge of versions', 'Privilege and patch-level triage']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Spraying discovered passwords across many accounts; one lockout cascade ends the engagement\u2019s credibility',
              'Extracting LSASS or running memory-credential tooling on production systems because a lab write-up made it look routine',
              'Validating credentials against out-of-scope systems that share the password (the client\u2019s SaaS, other sites)',
              'Treating a writable SYSTEM task as proven escalation without checking who can actually write it',
              'Forgetting to record where each credential was found — provenance matters for remediation and for the report'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: place a fake web.config with a service credential on a Samba share, discover it as a standard user, and validate it with nxc against exactly one host. Then build the privesc find: a scheduled task running a script in a folder writable by your test user (verify with icacls), and document both findings with command evidence — without executing the escalation.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Credentials live in configs, scripts, user artifacts and (conceptually) memory — files first',
              'Validation is one account, one host, logged, within lockout limits',
              'Reuse is the multiplier: a validated pair usually opens more than one door',
              'Escalation categories: service misconfig, scheduled tasks, patch level — inventory even when you do not exploit',
              'Provenance and evidence make a credential finding actionable for the client'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n12-l03-q1',
          type: 'mcq',
          prompt: 'Which validation approach best balances certainty against operational risk?',
          options: [
            'Authenticate the credential against one host via SMB session setup, logged',
            'Spray the password across all discovered accounts to save time',
            'Attempt an interactive RDP logon on ten hosts in parallel',
            'Wait for a scheduled password change and test then'
          ],
          answerIndex: 0,
          hint: 'Least disruptive service, smallest blast radius, full logging.',
          explanation:
            'Single-host SMB validation proves the credential while minimizing lockout risk and alert value. Spraying and parallel interactive logons are how testers cause lockout cascades and detection noise.'
        },
        {
          id: 'n12-l03-q2',
          type: 'truefalse',
          prompt: 'On Windows, the credential material that enables pass-the-hash and ticket abuse resides in the LSASS process, and accessing it requires administrator-level rights on the host.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'The process is LSASS; the access bar is high by design.',
          explanation:
            'LSASS holds password derivations and ticket material (the basis of ATT&CK T1003). Reading it requires elevated access and, on modern systems, additional protections — which is why it is taught as a concept here and practiced only in labs.'
        },
        {
          id: 'n12-l03-q3',
          type: 'short',
          prompt: 'List three standard local privilege escalation categories on Windows and one example of each.',
          modelAnswer:
            'Service misconfiguration (unquoted service path, or a service binary in a user-writable directory); scheduled tasks (a SYSTEM task executing a script that standard users can modify); patch level (missing updates leaving documented local privilege escalation bugs applicable). Credential-bearing artifacts readable at the current level (autologon registry, saved passwords) are a common fourth.',
          hint: 'Services, tasks, patches — plus what you can read.',
          explanation:
            'These categories cover the majority of routine local escalations. Inventorying them is valuable even without exploitation: each is a finding with a concrete fix.'
        },
        {
          id: 'n12-l03-q4',
          type: 'scenario',
          prompt:
            'On APP01\u2019s deploy share you find web.config containing svc_app with a password. Describe your next steps, the safety constraints you observe, and how you document the finding.',
          modelAnswer:
            'Steps: capture the file hash and content as evidence; validate the pair against exactly one in-scope target (DB01 via SMB with nxc) to prove reuse; check whether svc_app has a defined role (service account) in LDAP before drawing conclusions about its reach. Constraints: no spraying, no out-of-scope targets, every attempt logged, interactive logons avoided. Documentation: provenance (file path on the deploy share), the credential pair (masked in the report), validation evidence with timestamp, impact (cross-tier access with a service credential), and the fix (secret management, no credentials in deployment files, rotation).',
          hint: 'Prove the reuse, not the damage; record where it came from.',
          explanation:
            'A credential finding is complete only with provenance, validation evidence and remediation. The safety constraints keep the validation from becoming the incident the client reads about.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1552 — Unsecured Credentials',
          url: 'https://attack.mitre.org/techniques/T1552/',
          note: 'The technique family for credentials found in files and configurations.'
        },
        {
          title: 'MITRE ATT&CK T1003 — OS Credential Dumping',
          url: 'https://attack.mitre.org/techniques/T1003/',
          note: 'Conceptual reference for the memory-based credential topic.'
        },
        {
          title: 'MITRE ATT&CK T1053 — Scheduled Task/Job',
          url: 'https://attack.mitre.org/techniques/T1053/',
          note: 'The persistence and escalation category covered in the overview.'
        }
      ]
    },
    {
      id: 'n12-l04',
      moduleId: 'n12',
      title: 'Trust Relationships, Segmentation and High-Value Targets',
      difficulty: 'Advanced',
      minutes: 15,
      prerequisites: ['n12-l03'],
      objectives: [
        'Describe domain and forest trust types and what a trust does and does not grant',
        'Run segmentation tests that compare expected flows against observed reachability',
        'Identify high-value targets by business role, not just by port',
        'Reason about data flow to predict where access must exist'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Two questions elevate an internal test from host-hunting to assessment. First: what should be reachable? Segmentation is a design claim — workstations never talk to the database, the DMZ only talks to the proxy — and testing compares the claim against the wire. Second: where does damage concentrate? High-value targets are the systems whose compromise matters most, and they are defined by business role, not by open ports. A pentest that answers both questions produces findings with organizational meaning.'
          },
          {
            type: 'p',
            text:
              'Trust relationships connect the two questions: they are the documented ways one domain or forest extends access to another, and like segmentation claims, they often grant more than their owners remember.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Trust relationships in one pass'
          },
          {
            type: 'p',
            text:
              'Within a forest, parent-and-child domains trust each other transitively: an account in child.corp.lab can, in principle, authenticate to resources in corp.lab subject to the permissions placed on them. Forest trusts connect separate forests and can be configured to filter which identities cross. External trusts link individual domains, often legacy ones. Two ideas matter for a tester: transitivity (trust flows across the chain unless filtered) and the distinction between authentication paths and authorization — a trust lets identities knock on doors; permissions decide which doors open. Defenses like SID filtering exist precisely because trusts historically leaked more than intended.'
          },
          {
            type: 'h',
            text: 'Segmentation testing as a matrix'
          },
          {
            type: 'p',
            text:
              'Build the expected-flow matrix from the design documents and common sense, then measure reality from each segment. Workstations must reach DC01 for authentication (445, 88, 389) — that flow failing is an outage, not a finding. Workstations reaching DB01:1433 directly is almost always a finding. The DMZ reaching only the specific internal services it proxies is the claim; any extra path is a finding. The deliverable is the matrix with expected, observed and verdict columns.'
          },
          {
            type: 'table',
            headers: ['From → To', 'Expected', 'Why'],
            rows: [
              ['Workstation → DC01', 'Allowed (88, 389, 445, 53)', 'Authentication and DNS are core'],
              ['Workstation → DB01', 'Blocked', 'Databases serve the app tier, not users'],
              ['DMZ → APP01 only', 'Allowed, narrow', 'The proxy fronts exactly one application'],
              ['Server → Server (SMB)', 'Documented pairs only', 'Unrestricted server-to-server SMB is lateral-movement fuel'],
              ['Everything → management ports', 'Restricted to admin subnets', '5985/3389/22 are the high-value channels']
            ]
          },
          {
            type: 'h',
            text: 'High-value targets'
          },
          {
            type: 'p',
            text:
              'The DC authenticates everyone — compromise of a DC is compromise of the domain\u2019s identity layer. Backup servers hold every file the company owns and usually a credential with rights to read all of it. Finance and HR systems hold regulated data. Hypervisors hold every other server. Management workstations hold the credentials that reach all of the above. Ranking targets by these roles focuses limited test time where impact lives, and the attack-path work in the next lesson uses exactly this ranking.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Segmentation findings are among the most persuasive in a report because they are design-level: one measurement (a workstation reaching the database) implies policy, firewall and monitoring gaps at once. Trust findings play the same role for multi-domain organizations. And the HVT list is what turns a pile of medium findings into a prioritized story — the reason your three-hop path matters is that it ends at a high-value target.'
          },
          {
            type: 'list',
            items: [
              'Measure, do not assume: one Test-NetConnection result replaces a paragraph of speculation',
              'Record both directions: a flow that should fail and does is evidence of good design; note it too',
              'Trust inventory on multi-domain clients: which domains exist, how they connect, who can cross',
              'HVT shortlist for LABCORP: DC01, DB01, FILE01 (all company files), and the hypervisor host if one exists'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Direct workstation-to-database reachability on SQL, MySQL or Redis ports',
              'DMZ hosts able to open SMB, WinRM or RDP into the server VLAN',
              'Management ports (5985, 3389, 22) reachable from user segments',
              'Trusts that cross business boundaries with no SID filtering or with broad group memberships',
              'Backup and management systems placed in the same segments as ordinary servers',
              'Flat networks where "server VLAN" is a diagram label but not a firewall fact'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Reachability checks are quiet — until they succeed',
            text:
              'Port reachability tests are single SYN packets, about as quiet as testing gets. If a check succeeds into a sensitive system, stop at the connection proof: a successful TCP handshake is your evidence. Do not authenticate or query the service without a plan and scope.'
          },
          {
            type: 'terminal',
            title: 'Segmentation matrix from FIN-WKS02 (LABCORP)',
            lines: [
              '$ Test-NetConnection 10.10.40.30 -Port 1433',
              'TcpTestSucceeded : True      <- workstation reaches the database directly',
              '$ Test-NetConnection 10.10.40.5 -Port 445',
              'TcpTestSucceeded : True      <- expected: authentication SMB',
              '$ Test-NetConnection 10.10.40.5 -Port 3389',
              'TcpTestSucceeded : False     <- expected: RDP to DC restricted',
              '$ Test-NetConnection 10.10.40.20 -Port 5985',
              'TcpTestSucceeded : True      <- finding: WinRM reachable from user VLAN'
            ]
          },
          {
            type: 'p',
            text:
              'Four probes, three verdicts: one expected allow (DC SMB), one expected deny confirmed (RDP to DC), and two findings (database reachability, WinRM reachability). The matrix grows one row at a time, and every row cites a command and timestamp.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP\u2019s design document claims: DMZ to APP01 HTTP only; workstations to DC01 and FILE01; database reachable only from APP01. Your matrix shows workstations reaching DB01:1433 and DB01:445 — two violations of the same claim. In the report, the finding is not "the database is open"; it is "the segmentation model in the design document does not match observed reachability", with the two rows as evidence and firewall policy as the fix owner.'
          },
          {
            type: 'table',
            headers: ['Row', 'Expected', 'Observed', 'Verdict'],
            rows: [
              ['WKS → DC01 445', 'Allow', 'Open', 'As designed'],
              ['WKS → DB01 1433', 'Deny', 'Open', 'Finding: segmentation gap'],
              ['WKS → APP01 5985', 'Deny', 'Open', 'Finding: management exposure'],
              ['WKS → DC01 3389', 'Deny', 'Closed', 'As designed']
            ]
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['Test-NetConnection (PowerShell)', 'Single-flow reachability from Windows footholds'],
              ['nmap -p <port> --open', 'The same probe, scriptable across a row of the matrix'],
              ['curl / nc', 'HTTP and raw TCP checks from DMZ and Linux footholds'],
              ['The design documentation', 'The "expected" column — always ask for it before testing']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing segmentation without the expected-flow matrix; you cannot report a deviation from a model you never wrote down',
              'Calling a closed port "segmentation working" across the whole estate from one sample',
              'Authenticating into a sensitive system just because a reachability probe succeeded',
              'Ignoring the direction of trust: trusting them does not mean they trust you, and both directions matter',
              'Treating the DC as just another server; its compromise changes the meaning of every other finding'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: segment two subnets with a firewall VM that allows only specific flows (write the rules from a mini design doc). From a workstation VM, run your matrix against all four server roles and compare results with the design. Deliberately add one wrong firewall rule, re-test, and write the finding paragraph that documents the deviation with evidence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Trusts extend authentication across domains; permissions still gate each door',
              'Segmentation testing is a matrix: expected versus observed, one measured flow per row',
              'Core flows (workstation to DC) must work; their failure is an outage, not a finding',
              'High-value targets are defined by business role: DC, backups, databases, hypervisors, management',
              'A successful TCP handshake is enough evidence for a reachability finding — stop there'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n12-l04-q1',
          type: 'mcq',
          prompt: 'A workstation VLAN can reach DB01 on TCP 1433 directly. Measured against a design that reserves database access for the application tier, this is:',
          options: [
            'A segmentation finding, because the observed flow contradicts the design model',
            'Normal, because firewalls always allow inter-VLAN traffic',
            'A database misconfiguration only',
            'Not testable without domain admin rights'
          ],
          answerIndex: 0,
          hint: 'The finding is about the model, not just the port.',
          explanation:
            'The reachability probe is the evidence; the design document supplies the expectation. Direct user-tier to database reachability violates the tiered model and implies firewall policy, monitoring and even credential hygiene gaps at once.'
        },
        {
          id: 'n12-l04-q2',
          type: 'truefalse',
          prompt: 'If workstations cannot reach a domain controller on port 445, that is evidence of good segmentation hardening.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which flows are required for a domain to function at all?',
          explanation:
            'Domain authentication depends on workstation-to-DC SMB, Kerberos (88) and LDAP (389). Those flows failing is an operational problem, not a security win — which is why the expected-flow matrix distinguishes core flows from everything else.'
        },
        {
          id: 'n12-l04-q3',
          type: 'short',
          prompt: 'Explain the difference between a trust relationship and authorization, and why both matter to a tester.',
          modelAnswer:
            'A trust lets identities from one domain or forest authenticate toward another (it opens the possibility of access); authorization (permissions on resources) decides what those identities may actually do once authenticated. A tester maps trusts to know where identities can travel, then tests permissions to see which doors really open — and both layers can contain findings: over-broad trusts, or permissions granted to crossed-over identities.',
          hint: 'One lets you knock on the door, the other decides if it opens.',
          explanation:
            'Trusts are plumbing between identity namespaces; ACLs are the actual gates. Confusing the two leads testers to overstate (or understate) what a trust grants, and defenders to forget that trust plus broad permissions equals cross-domain access.'
        },
        {
          id: 'n12-l04-q4',
          type: 'scenario',
          prompt:
            'You have three days of internal test time on LABCORP. Using HVT reasoning, order your effort across DC01, FILE01, DB01, APP01 and the workstation fleet, and justify the order.',
          modelAnswer:
            'First, DC01 (identity layer: compromise of the DC compromises the domain\u2019s authentication — but test around it carefully, read-only). Second, FILE01 and its backup relationships (all company data in one place, and backup credentials often have wide reach). Third, DB01 (regulated business data, plus the segmentation findings already observed). Fourth, APP01 (internet-facing code path and a stepping stone to DB01). Fifth, workstations (breadth matters mainly for the reuse and management-port findings). Justification: rank by business impact of compromise and by how much each target multiplies further access, then spend scarce time where impact concentrates.',
          hint: 'Which systems multiply access or concentrate data?',
          explanation:
            'HVT ranking turns a target list into a time budget. Identity first, data concentration second, application paths third, breadth last — and every step documented so the report can show why effort landed where it did.'
        }
      ],
      references: [
        {
          title: 'Microsoft Learn — Active Directory Domain Services Overview',
          url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview',
          note: 'Official grounding for domains, forests and DC roles.'
        },
        {
          title: 'Microsoft Learn — Kerberos Authentication Overview',
          url: 'https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview',
          note: 'How cross-domain authentication is meant to work.'
        },
        {
          title: 'MITRE ATT&CK T1550 — Use Alternate Authentication Material',
          url: 'https://attack.mitre.org/techniques/T1550/',
          note: 'The family of techniques that trust-extended identities enable.'
        }
      ]
    },
    {
      id: 'n12-l05',
      moduleId: 'n12',
      title: 'Attack Paths, Lateral Movement Concepts and Documentation',
      difficulty: 'Advanced',
      minutes: 17,
      prerequisites: ['n12-l04'],
      objectives: [
        'Compose individual findings into end-to-end attack paths',
        'Describe the standard lateral movement techniques at concept level',
        'Graph a path as nodes and edges with evidence attached to each hop',
        'Document a path so the client can reproduce, prioritize and fix it'
      ],
      diagram: 'net-attack-path',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'One finding is trivia; a path is a story with consequences. "A workstation can reach the database" is a medium. "The workstation VLAN reaches DB01, a service credential found on a share authenticates there, and that account can read the finance schema" is a business problem with a name, an owner and a fix. The craft of the final phase is composition: chaining the validated facts you gathered in the previous four lessons into paths that end at high-value targets, and documenting each hop so the client can verify and break the chain.'
          },
          {
            type: 'p',
            text:
              'This lesson keeps lateral movement at concept level: you should recognize the techniques (the remote services of module 10 are precisely the lateral movement toolbox) and the authentication-material patterns, while every execution in the curriculum stays inside the lab.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Anatomy of an attack path'
          },
          {
            type: 'p',
            text:
              'A path is a graph: nodes are principals (hosts, accounts, shares) and edges are validated access relationships. Each edge carries three facts: the access that exists (workstation can reach DB01:1433), the identity that works there (svc_app validates on DB01), and the evidence (command and timestamp). The path is only as strong as its weakest documented edge — an edge claimed but not evidenced is a hypothesis, and hypotheses belong in a separate section of the report, clearly labeled.'
          },
          {
            type: 'diagram',
            id: 'net-attack-path',
            caption: 'The LABCORP path: foothold to high-value target, one edge per validated fact.'
          },
          {
            type: 'h',
            text: 'Lateral movement: the concept map'
          },
          {
            type: 'p',
            text:
              'ATT&CK groups the techniques under T1021 (Remote Services): RDP for interactive desktops, SMB/admin shares for file-and-service execution, WinRM for management channels, SSH in mixed estates. Alongside them, alternate authentication material (T1550) — pass-the-hash and pass-the-ticket at concept level — explains how an identity can move without its password ever appearing. The common shape: every technique needs (a) network reachability to a remote service, (b) an identity it accepts, and (c) local privilege on the source if credentials or tickets must be borrowed. Your earlier findings map onto those three requirements almost one to one.'
          },
          {
            type: 'h',
            text: 'Documentation per hop'
          },
          {
            type: 'table',
            headers: ['Hop', 'What to record'],
            rows: [
              ['Edge exists', 'Reachability evidence: command, target, port, result, timestamp'],
              ['Identity works', 'Validation evidence on that hop only, account named, mask passwords'],
              ['Access gained', 'What the identity can do there (read share, execute, query)'],
              ['Impact', 'What business capability or data this edge exposes'],
              ['Break the chain', 'The specific fix that severs this edge, owned by a named team']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The attack path is the centerpiece of an internal test report: it converts scattered findings into a prioritized narrative and gives remediation a sequence (break the cheapest edge first). It is also the artifact executives understand — "from a standard user to domain data in three steps, each with evidence" — and the artifact retesters use to verify the fixes closed the chain, not just one link.'
          },
          {
            type: 'list',
            items: [
              'Every edge validated, every command logged; the path is reproducible by the client',
              'Mask credentials in the report, list them in a separate secure annex',
              'Mark unexercised hypotheses clearly — a graph of evidence and a graph of theory are different documents',
              'Map each edge to ATT&CK techniques so defenders can connect your test to their detections (T1021, T1550, TA0008)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Edges you already measured: segmentation gaps (n12-l04) are candidate path edges',
              'Identities that validate across tiers: service credentials on shares (n12-l03) connect otherwise separate hosts',
              'Remote services open along the measured routes: 5985, 445, 3389, 22 — the T1021 toolbox',
              'Local privilege opportunities on intermediate hosts that would unlock the next hop',
              'High-value targets reachable within two or three validated edges — the paths worth documenting first'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Paths are validated, not performed',
            text:
              'A path demonstration should use the minimum actions that prove each edge. In LABCORP every command below is a validation (authentication checks and one file read) inside an authorized lab. On real engagements, agree each step in the ROE — especially any step that executes commands on a server.'
          },
          {
            type: 'terminal',
            title: 'Validating the LABCORP path, hop by hop',
            lines: [
              '$ nxc smb 10.10.40.0/24 -u local_admin -p "Chang3Me!" --local-auth',
              'SMB  10.10.40.10  445  FILE01  [+] FILE01\\local_admin:Chang3Me! (Pwn3d!)   <- hop 1',
              '$ nxc winrm 10.10.40.20 -u local_admin -p "Chang3Me!"',
              'WINRM  10.10.40.20  5985  APP01  [+] CORP\\local_admin:Chang3Me! (Pwn3d!)   <- hop 2',
              '$ nxc winrm 10.10.40.20 -u local_admin -p "Chang3Me!" -x "type C:\\inetpub\\wwwroot\\web.config"',
              '  <add key="DbUser" value="svc_app" />',
              '  <add key="DbPassword" value="AutumnRain2024!" />',
              '$ nxc mssql 10.10.40.30 -u svc_app -p "AutumnRain2024!"',
              'MSSQL  10.10.40.30  1433  DB01  [+] CORP\\svc_app:AutumnRain2024! (Pwn3d!)  <- hop 3'
            ]
          },
          {
            type: 'p',
            text:
              'Read as a graph: reuse of one local admin password carries the tester from the workstation VLAN to FILE01 and APP01 (hop 1-2, T1021.002/.006); a credential embedded in the application\u2019s config carries it to the database (hop 3, T1552 feeding T1078). Three edges, each with a one-command proof, ending at a high-value target.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The LABCORP path documented for the report: Node A — standard foothold on FIN-WKS02 (premise). Edge 1 — workstation VLAN to server VLAN management ports open (Test-NetConnection evidence). Edge 2 — reused local_admin credential validates on FILE01 and APP01 (nxc --local-auth and winrm evidence). Edge 3 — web.config read from the deploy share yields svc_app (file read evidence). Edge 4 — svc_app authenticates to DB01 (mssql validation evidence). Impact: unauthenticated-start to business database in three validated steps; cheapest break: unique local admin passwords (Windows LAPS) plus secret management for application credentials.'
          },
          {
            type: 'table',
            headers: ['Edge', 'Evidence', 'ATT&CK', 'Break'],
            rows: [
              ['WKS → server mgmt ports', 'Test-NetConnection 5985/445 results', 'T1046', 'Segment management ports'],
              ['local_admin reuse → FILE01/APP01', 'nxc --local-auth Pwn3d! outputs', 'T1021.002/.006', 'Windows LAPS unique passwords'],
              ['web.config → svc_app', 'smbclient file read, grep output', 'T1552', 'Secret management, no creds in configs'],
              ['svc_app → DB01', 'nxc mssql validation output', 'T1078', 'Rotate, scope the service account']
            ]
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['netexec (nxc)', 'Edge validation across smb/winrm/rdp/mssql with uniform output'],
              ['Graph of nodes and edges (even a spreadsheet)', 'The path document itself'],
              ['ATT&CK navigator or technique list', 'Tagging each edge for defender mapping'],
              ['Your engagement log', 'Timestamped commands — the raw material for every edge']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Presenting unexercised theory as a validated path; hypotheses must be labeled as such',
              'Demonstrating impact with destructive or noisy actions when a handshake or validation would prove the edge',
              'Shipping plaintext passwords in the report body instead of a masked narrative plus a secure annex',
              'Reporting the path without the breaks — every edge needs a named remediation',
              'Forgetting that the path is a snapshot; retest after fixes to confirm the chain is actually broken'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Capstone lab: build the four-node LABCORP miniature (workstation, file/app server, database) with the two planted weaknesses (reused local admin, credential in a served config file). Derive the path from a standard foothold exactly as in this lesson, then draw the node-edge graph on paper with evidence per edge. Finally fix one edge (change the local admin password) and re-run the chain to see precisely where it breaks. Write the one-page path summary a client would receive.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Findings compose into paths: nodes, edges, evidence — an evidenced graph, not an anecdote',
              'Lateral movement runs on the remote services you already know (T1021) plus alternate authentication material (T1550)',
              'Every edge needs: reachability, identity, and a recorded proof',
              'The report presents the path, the impact and the break per edge — hypotheses kept separate',
              'Retesting after remediation is part of the path, not an afterthought'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n12-l05-q1',
          type: 'mcq',
          prompt: 'Which ATT&CK technique family groups RDP, SMB/admin shares, WinRM and SSH as lateral movement tools?',
          options: ['T1021 Remote Services', 'T1110 Brute Force', 'T1552 Unsecured Credentials', 'T1046 Network Service Scanning'],
          answerIndex: 0,
          hint: 'It is the same family module 10 introduced service by service.',
          explanation:
            'T1021 (Remote Services) contains the sub-techniques for RDP (.001), SMB/admin shares (.002), SSH (.004), VNC (.005) and WinRM (.006) — the standard lateral movement toolbox on Windows estates.'
        },
        {
          id: 'n12-l05-q2',
          type: 'truefalse',
          prompt: 'Each edge of a documented attack path should carry its own evidence: reachability proof, identity validation and a timestamp.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What lets the client reproduce — and later retest — the chain?',
          explanation:
            'A path is only as strong as its weakest documented edge. Per-edge evidence (command, result, timestamp) makes the path reproducible, keeps hypotheses separate, and gives retesters an exact checklist.'
        },
        {
          id: 'n12-l05-q3',
          type: 'short',
          prompt: 'Explain at concept level why "pass-the-hash" works against NTLM authentication, and name its ATT&CK technique.',
          modelAnswer:
            'NTLM proves knowledge of a password by responding to a server challenge using a derivation of the password hash — the plaintext password itself never travels. Because the hash alone can produce that proof, an attacker holding the hash can authenticate without the password. ATT&CK tracks this as T1550.002 (Use Alternate Authentication Material: Pass the Hash).',
          hint: 'What does the server actually verify — the password, or a proof derived from it?',
          explanation:
            'The protocol design accepts a hash-derived response, so possession of the hash substitutes for possession of the password. This is why credential protection on Windows focuses on where hashes rest (memory, dumps, shares) rather than only on password strength.'
        },
        {
          id: 'n12-l05-q4',
          type: 'scenario',
          prompt:
            'Compose the LABCORP attack path from foothold to DB01 as you would present it to the client: nodes, edges, evidence types, impact statement and the fix sequence.',
          modelAnswer:
            'Nodes: FIN-WKS02 foothold → server VLAN management → FILE01/APP01 (local admin) → svc_app identity (from web.config) → DB01. Edges with evidence: (1) management reachability — Test-NetConnection results; (2) local_admin reuse — nxc --local-auth and nxc winrm Pwn3d! outputs; (3) credential discovery — smbclient read of the deploy share plus grep of web.config; (4) DB01 access — nxc mssql validation. Impact: from a standard user premise to the business database in three validated steps, crossing workstation, application and data tiers. Fix sequence: unique local admin passwords via Windows LAPS (breaks edges 1-2), secret management removing credentials from deployment files (breaks edge 3), rotate and scope svc_app (breaks edge 4). Tag edges with T1021.002/.006, T1552 and T1078, mask all passwords, and retest after each fix.',
          hint: 'Graph first, evidence per edge, then the cheapest breaks.',
          explanation:
            'The exemplary path narrative names the graph, proves every edge, states business impact, orders remediation by cost-effectiveness, and maps to ATT&CK so defenders can build detections — the full arc this module trained.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1021 — Remote Services',
          url: 'https://attack.mitre.org/techniques/T1021/',
          note: 'The lateral movement technique family this lesson maps onto.'
        },
        {
          title: 'MITRE ATT&CK T1550 — Use Alternate Authentication Material',
          url: 'https://attack.mitre.org/techniques/T1550/',
          note: 'Pass-the-hash and pass-the-ticket at the conceptual level covered here.'
        },
        {
          title: 'MITRE ATT&CK TA0008 — Lateral Movement (tactic)',
          url: 'https://attack.mitre.org/tactics/TA0008/',
          note: 'The tactic view that groups all movement techniques.'
        }
      ]
    }
  ]
};
