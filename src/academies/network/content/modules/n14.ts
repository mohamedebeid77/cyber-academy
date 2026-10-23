import type { Module } from '../../../../types';

// LEVEL 8 — ADVANCED NETWORK PENTESTING · Module 14: Advanced Network Pentesting
// Original curriculum content synthesized from public official documentation:
// the Nmap Network Scanning book (nmap.org/book), NSE documentation,
// MITRE ATT&CK and the Penetration Testing Execution Standard. All prose is
// original; reference links point to the official sources used for study.
// All examples run against the fictional LABCORP lab network and are taught
// for AUTHORIZED testing only — advanced techniques are applied exclusively
// inside written scope and rules of engagement.

export const n14: Module = {
  id: 'n14',
  title: 'Advanced Network Pentesting',
  level: 8,
  description:
    'Methodology over tricks: how advanced testers organize enumeration into repeatable personal checklists, chain services into documented attack paths, reason about credential reuse and trust as graph edges, verify scanner claims at the packet level, and automate the repetitive work with detection-aware judgment — all on authorized targets, with every claim evidenced.',
  outcomes: [
    'Run a personal, hypothesis-driven enumeration methodology and know when to go deep versus broad',
    'Chain individual service findings into complete, evidenced attack paths',
    'Formalize attack paths as node-and-edge graphs and prioritize them by risk',
    'Apply advanced Nmap/NSE techniques and verify scanner claims with packet-level analysis',
    'Automate sweeps, diffs and retests with a noise budget and clean evidence hygiene'
  ],
  lessons: [
    {
      id: 'n14-l01',
      moduleId: 'n14',
      title: 'Advanced Enumeration Methodology and Service Chaining',
      difficulty: 'Advanced',
      minutes: 17,
      prerequisites: ['n13-l04'],
      objectives: [
        'Structure enumeration as fact, lead and hypothesis rather than a pile of scan output',
        'Choose depth-first versus breadth-first passes deliberately and time-box both',
        'Chain findings across services into a complete access narrative',
        'Keep notes that make your work reproducible and reportable'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Advanced testers are not walking exploit databases; they are organized question-askers. The methodology — a personal, written loop of facts, leads and hypotheses — is what separates consistent results from lucky ones. Tools rotate, networks differ, but the loop compounds: every observation is classified, every classification becomes a testable claim, and every claim gets an outcome that is written down.'
          },
          {
            type: 'p',
            text:
              'Breadth buys coverage (every host, every high-value port, every version banner), depth buys outcomes (one service fully understood, one hypothesis settled). The skill is choosing the mode deliberately: breadth first on entering a network, depth where the value concentrates, back to breadth when a lead runs dry — and both modes time-boxed, because rabbit holes are where engagement windows go to die.'
          },
          {
            type: 'p',
            text:
              'Chaining is where the methodology pays its rent. A configuration file readable on a share, a key lying on a workstation, a password reused on a database — each one minor, together a full path from low-value access to crown jewels. You find chains only if every small fact is captured and revisited, because chains close over combinations, and memory does not scale to hundreds of facts.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-enumeration-workflow',
            caption: 'The enumeration loop: enumerate, record, hypothesize, validate, escalate — feeding back until the window closes.'
          },
          {
            type: 'h',
            text: 'The unit of work: fact, lead, hypothesis'
          },
          {
            type: 'list',
            items: [
              'Fact — observed and evidenced: a service version, a share readable by everyone, a login page, a TLS certificate naming an internal host',
              'Lead — a fact that suggests more: an old version implies missing patches; a readable share implies stored files; a service account name implies reuse',
              'Hypothesis — a testable claim: "the svc_deploy password may be reused on the jump host", "the wiki upload folder may be browsable"'
            ]
          },
          {
            type: 'p',
            text:
              'Validate cheaply and safely: read-only first (list, enumerate, inspect), then a single careful authentication when the hypothesis specifically calls for it, then heavier techniques only against a named, justified target. Every validation produces a recorded outcome — either a new fact with evidence, or a dead end. Dead ends are assets: written down, they prevent next week\u2019s re-work.'
          },
          {
            type: 'h',
            text: 'Depth versus breadth, chosen on purpose'
          },
          {
            type: 'table',
            headers: ['Pass', 'When', 'Typical actions', 'Stop when'],
            rows: [
              ['Breadth', 'Engagement start; after any new access', 'All-host discovery, top-port sweeps, banner collection, surface findings into the ledger', 'Diminishing new information per hour'],
              ['Depth', 'A promising lead is isolated', 'Full port range on one host, service-specific enumeration, version-to-impact reasoning, config review', 'Hypothesis tested, or the time-box expires'],
              ['Return to breadth', 'A chain hop succeeded (new vantage)', 'Re-run discovery from the new position, diff against the old map', 'The new map is stable']
            ]
          },
          {
            type: 'h',
            text: 'Chaining services: a worked pattern'
          },
          {
            type: 'p',
            text:
              'The canonical chain, taught hands-on below: an anonymously readable share contains deployment notes; the notes name a credential; the credential is reused on an SSH jump host; the jump host holds a .pgpass file for the database; a read-only query proves data access. No hop is an exploit. Each hop is a fact (evidenced), a hypothesis (why this might work), and a validation (what command, what output). The chain — not any single step — is the finding.'
          },
          {
            type: 'p',
            text:
              'Note structure makes chaining possible: a per-host file for facts, a credential ledger (what, where found, validated where, always masked), and a lead list with statuses. Review the ledger daily — combinations that looked inert on day one become paths on day three.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The methodology is also a deliverable. Clients can see the coverage logic (what was enumerated, from where, when), retest teams can replay it, and the loop maps cleanly onto the Penetration Testing Execution Standard\u2019s phases. Chain narratives communicate risk in a way ten isolated findings never will: "from anonymous share read to database read access in three validated steps" is a sentence an executive can act on.'
          },
          {
            type: 'list',
            items: [
              'Coverage defensibility: the ledger answers "did you even look at X" with a timestamp',
              'Hypothesis logs justify hours spent — including the hours that found nothing',
              'Chains produce the report\u2019s highest-impact sections and the cheapest fixes',
              'ATT&CK T1046 (Network Service Scanning) and T1552 (Unsecured Credentials) describe the loop\u2019s behavior for defenders'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Credentials and configuration inside shares, repositories and deployment folders (T1552 patterns)',
              'Service account names that recur across systems — reuse candidates',
              'Version banners older than the estate\u2019s patch level — missing-patch hypotheses',
              'Documentation artifacts (runbooks, wiki pages, .bak files) that name systems and accounts',
              'Your own dead-end list — leads not yet formally closed, re-tested every ledger review'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Validation touches real authentication systems',
            text:
              'In a client environment validate exactly once, carefully, inside the rules of engagement — no lockout-prone guessing without written approval. In the lab, break freely; the lab is where speed is learned so the engagement can be slow.'
          },
          {
            type: 'p',
            text:
              'Lab drill on three VMs: FS01 (file server with an open deploy share), JMP01 (SSH jump host) and DB01 (PostgreSQL). Reproduce the chain with read-only steps and a single careful login:'
          },
          {
            type: 'terminal',
            title: 'One chain, three hypotheses',
            lines: [
              '# 1) fact: the deploy share is readable anonymously',
              '$ smbclient //10.0.20.10/deploy -N -c "ls"',
              '  .                                   D        0  Thu May  9 09:14:23 2024',
              '  notes.txt                           A      412  Thu May  9 09:14:23 2024',
              '# 2) hypothesis: notes name credentials - read them',
              '$ smbclient //10.0.20.10/deploy -N -c "get notes.txt -" | grep -i pass',
              'svc_deploy initial password: [MASKED-IN-NOTES] (rotate pending)',
              '# 3) hypothesis: the password is reused on the jump host - one careful try',
              '$ ssh svc_deploy@10.0.20.10',
              'svc_deploy@jmp01:~$ cat ~/.pgpass',
              '10.0.30.15:5432:appdb:app_read:[MASKED-IN-NOTES]',
              '# 4) validate read-only, then STOP and record',
              '$ psql -h 10.0.30.15 -U app_read -d appdb -c "select current_user;"'
            ]
          },
          {
            type: 'p',
            text:
              'Four commands, one narrative. Notice the discipline markers: credentials masked in the notes at capture time, one login attempt rather than a spray, a read-only query as the proof, and (the step that matters most) every step about to be written into the ledger with its timestamp and output path.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP: the chain above became the engagement\u2019s centerpiece finding — "from anonymous share read to database read access in three validated steps, no exploit code". Impact: an unauthenticated network position reaches application data. Remediation touches four weak links (share ACL, credential storage, password reuse, .pgpass hygiene), each cheap to fix and each verifiable on retest. One chain, four remediation items, one executive paragraph — that is the ROI of a written methodology.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The ledger is the real tool',
            text:
              'Per-host notes, a masked credential ledger and a hypothesis log with statuses. Everything else in this module is technique; the ledger is the methodology.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['nmap', 'Breadth sweeps and depth scans feeding the fact pool'],
              ['smbclient / NetExec', 'Share and SMB enumeration; single-shot credential validation'],
              ['ssh / psql / curl', 'Per-service validation, chosen by the hypothesis'],
              ['grep / sort / diff', 'Slicing scan output into facts and spotting reuse signals'],
              ['The written ledger', 'Per-host notes, credential ledger, hypothesis log — the actual methodology']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Deep-diving the first interesting host for a full day while the rest of the scope stays unenumerated',
              'Validating credentials aggressively (sprays, lockout-prone guessing) without ROE cover',
              'Recording wins but not dead ends — next week you re-test the same stale lead',
              'Chasing tool output instead of hypotheses: enumeration without a question is just noise with timestamps',
              'Leaving credentials unmasked in notes that will later ship as report appendices',
              'Abandoning breadth entirely after the first foothold — new vantage means a new breadth pass'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write your own one-page enumeration checklist per service met so far (SMB, SSH, HTTP, DNS, database): five questions each, ordered from read-only to intrusive. Run it against your lab and mark every question fact, lead, hypothesis or dead-end. Revise and reuse it next session — a methodology is versioned, not memorized.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Facts, leads and hypotheses are the working units; every one gets a recorded outcome',
              'Choose breadth or depth deliberately and time-box both; return to breadth after every new vantage',
              'Chains beat exploits: small validated steps compose into the findings that matter',
              'A credential ledger and a dead-end log are what make day three smarter than day one',
              'Mask everything at capture time — notes become evidence and report appendices'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n14-l01-q1',
          type: 'mcq',
          prompt: 'Which sequence best describes the methodology loop taught in this lesson?',
          options: [
            'Scan everything, exploit the loudest finding, report',
            'Fact, lead, hypothesis, cheap validation, record the outcome',
            'Search online, run the first exploit found, escalate',
            'Enumerate once, assume coverage, move to reporting'
          ],
          answerIndex: 1,
          hint: 'What did the share note become before it became access?',
          explanation:
            'Every observation is classified (fact), interpreted (lead), turned into a testable claim (hypothesis), validated cheaply, and recorded — wins and dead ends alike. That loop is what compounds across days of an engagement.'
        },
        {
          id: 'n14-l01-q2',
          type: 'truefalse',
          prompt: 'A dead end that is never written down costs nothing.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What happens the next time you or a teammate touches that lead?',
          explanation:
            'Unrecorded dead ends get silently re-tested, wasting engagement hours and creating the impression of progress. Recording them — status, date, why closed — is as important as recording wins.'
        },
        {
          id: 'n14-l01-q3',
          type: 'short',
          prompt: 'Give one example each of a fact, a lead and a hypothesis about an SMB service.',
          modelAnswer:
            'Fact: "the deploy share is readable anonymously" — evidenced by the smbclient listing. Lead: "deployment shares often contain notes or scripts with credentials". Hypothesis: "notes.txt in that share names a password that may be reused on the jump host". Each level is one step more interpretive than the last, and only the hypothesis triggers a validation action.',
          hint: 'Observation, implication, testable claim — in that order.',
          explanation:
            'The distinction matters operationally: facts ship as evidence, leads organize the backlog, and hypotheses authorize (cheap) validation actions. Blurring them is how testers end up validating aggressively without justification.'
        },
        {
          id: 'n14-l01-q4',
          type: 'scenario',
          prompt:
            'Day 2 of 5 on an authorized internal test: you hold a valid svc_deploy password from an approved source and two candidate systems. The ROE forbids anything that could lock accounts. How do you proceed, and what do you record?',
          modelAnswer:
            'Validate exactly once per candidate, sequentially, with the least intrusive method — one interactive SSH login attempt, no automated retries, no parallel sprays. Observe the result; on failure, park the lead rather than retry. Record timestamp, target, method, outcome, and keep the credential masked in the ledger. If both candidates fail, return to breadth and revisit the lead at the next ledger review or with client approval for a different technique.',
          hint: 'The ROE forbids retries, not attempts.',
          explanation:
            'Careful single validation respects the account owner and the ROE, and the ledger entry keeps the lead auditable. The scenario is the discipline test: under time pressure the temptation is a spray, and the methodology is what prevents it.'
        }
      ],
      references: [
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'The standard\u2019s phase structure mirrors the fact/lead/hypothesis loop taught here.'
        },
        {
          title: 'MITRE ATT&CK T1046 — Network Service Scanning',
          url: 'https://attack.mitre.org/techniques/T1046/',
          note: 'How defenders classify the sweep behavior your methodology automates.'
        },
        {
          title: 'MITRE ATT&CK T1552 — Unsecured Credentials',
          url: 'https://attack.mitre.org/techniques/T1552/',
          note: 'The credential-in-files family that feeds most service chains.'
        },
        {
          title: 'Nmap Network Scanning book',
          url: 'https://nmap.org/book/',
          note: 'Sweep and enumeration scanning technique feeding the fact pool.'
        }
      ]
    },
    {
      id: 'n14-l02',
      moduleId: 'n14',
      title: 'Attack Path Analysis, Credential Reuse and Trust Abuse',
      difficulty: 'Advanced',
      minutes: 17,
      prerequisites: ['n14-l01'],
      objectives: [
        'Model an environment as nodes and edges and express findings as paths',
        'Recognize credential reuse and trust relationships that create hidden edges',
        'Map paths to ATT&CK techniques for communication with defenders',
        'Prioritize paths by risk and identify the cheapest edge to break'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Single findings answer "what is weak"; paths answer "what can happen". A path is a directed walk over nodes — hosts, identities, data stores — connected by edges: validated reachability, proven credentials, and trust relationships. Attack path analysis is simply making that graph explicit: for yourself while testing, and for the client in the report, where the path becomes the risk narrative.'
          },
          {
            type: 'p',
            text:
              'Credential reuse and trust relationships are where the hidden edges come from. The same local administrator password on forty machines is one credential and forty edges. A domain trust, a backup job with stored secrets, an application server that SSHes to the database — none of these appear on any network diagram, and all of them are paths an authorized tester can demonstrate.'
          },
          {
            type: 'p',
            text:
              'Prioritization turns the graph into decisions: which paths reach the crown jewels, which single edge removal collapses the most paths, and in which order fixes should land. That last question — the cheapest break — is what separates a report that gets implemented from one that gets filed.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-attack-path',
            caption: 'Nodes and edges: a foothold, two credentials and one trust edge compose a path to the database.'
          },
          {
            type: 'h',
            text: 'The graph'
          },
          {
            type: 'p',
            text:
              'Nodes: hosts, user and service accounts, data stores, and access levels (none, user, administrator, domain-privileged). Edges — always directed, always evidenced: network reachability (a validated TCP path), credential validity (proven by one minimal successful authentication), identity trust (authorized_keys entries, sudo rules, domain trust direction), and delegation trust (a scheduled task or service running as another identity). An edge you did not exercise does not exist.'
          },
          {
            type: 'table',
            headers: ['Edge type', 'Looks like', 'Evidence to record'],
            rows: [
              ['Reachability', 'A TCP path exists between two nodes', 'nc/nmap result, timestamp, vantage point'],
              ['Credential', 'A password, hash or key works on a target', 'One successful login output (masked), target, time'],
              ['Identity trust', 'Auth as X grants access on Y', 'authorized_keys entry, sudo rule, domain trust direction'],
              ['Delegation trust', 'A task runs as another identity', 'Scheduled task or service definition showing the run-as account']
            ]
          },
          {
            type: 'h',
            text: 'Credential reuse patterns'
          },
          {
            type: 'list',
            items: [
              'The same local administrator password across many hosts — one credential, many edges; Windows LAPS exists to break exactly this',
              'Service accounts reused for interactive logins, or shared across tiers',
              'Passwords found in files reappearing on unrelated systems — users recycle',
              'SSH keys without passphrases shared by several operators or scripts',
              'Application credentials duplicated between config files, backups and automation'
            ]
          },
          {
            type: 'h',
            text: 'Trust abuse'
          },
          {
            type: 'p',
            text:
              'Trust edges are legitimate by design; abusing them means using an authorized relationship from an unauthorized position. A domain trust that lets a compromised account reach a neighboring forest, an agent\u2019s host-to-host SSH key that is effectively root, a backup service account with database-wide rights — the finding is the relationship itself, so document the relationship, not just the successful login.'
          },
          {
            type: 'h',
            text: 'ATT&CK mapping'
          },
          {
            type: 'p',
            text:
              'Three tags carry most paths: T1078 (Valid Accounts) for using what you found, T1021 (Remote Services) for the movement edges, and T1550 (Use Alternate Authentication Material) for hash, ticket and key reuse. The lateral movement tactic TA0008 frames the whole phase. Tagging edges gives the client\u2019s SOC a direct bridge from your finding to their detection engineering.'
          },
          {
            type: 'h',
            text: 'Prioritization and the cheapest break'
          },
          {
            type: 'p',
            text:
              'Rank paths by asset value reached, edge count (length), breadth (how many assets share the reused credential) and detectability. Then find the cheapest break: the edge whose removal collapses the most valuable paths. Often it is one password rotation or one ACL — a fix measured in hours, versus the network redesign the raw finding list seems to demand.'
          },
          {
            type: 'code',
            lang: 'text',
            title: 'Attack path ledger — one edge, fully documented',
            code:
              'EDGE-04 | credential\nfrom:   svc_deploy (password; source: deploy share notes.txt, EDGE-03)\nto:     JMP01 (10.0.20.10) as svc_deploy (interactive SSH)\nproof:  ssh session 2024-05-11T14:41Z; whoami output captured; password masked\nattck:  T1078 (Valid Accounts), T1021.004 (SSH)\nnotes:  reuse of share credential on tier-2 host; cheapest-break candidate'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The graph is the executive translation layer: "one shared password plus one open management port equals database access in two steps" lands with leadership in a way CVE lists never will. It also drives remediation sequencing (fix the cheapest break first) and gives the client a measurable retest: the edges are replayed, not the vibes.'
          },
          {
            type: 'list',
            items: [
              'Paths justify severity: depth reached and breadth affected are the honest severity drivers',
              'Edge evidence makes findings reproducible and retestable (the n15 module builds on this)',
              'ATT&CK tags turn findings into detection engineering work the SOC can start this week',
              'Cheapest-break analysis turns remediation from a wish list into an ordered plan'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Reuse signals: identical service account names, shared deploy folders, the same key fingerprints on several hosts',
              'Stored secrets that imply trust: authorized_keys, .pgpass and .my.cnf, web.config, unattend files, scheduled tasks, service run-as accounts',
              'Management and replication paths (SSH between servers, database links, backup and monitoring agents) — legitimate edges that carry paths',
              'Domain and forest trust direction and transitivity',
              'Assets that appear on multiple paths — concentration points worth one strong fix'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Build the graph as you test: after each validation, add the node or edge with evidence, keeping reachability separate from identity. Periodically compute: all paths to each crown-jewel node, edge counts per path, and the cheapest-break candidate. Validate each edge exactly once and minimally — one login, one port check — and re-verify only on retest.'
          },
          {
            type: 'p',
            text:
              'Reuse signals come from your own ledger, not from scanning: grep across your notes for the same account names, the same password fragments (masked), the same key comments and fingerprints. The cheapest reuse hunt is documentation analysis, and it never risks a lockout.'
          },
          {
            type: 'terminal',
            title: 'Finding reuse signals in your own notes',
            lines: [
              '$ grep -ri "svc_deploy" ledger/ | grep -v MASKED | cut -d: -f1 | sort -u',
              'ledger/hosts/jmp01.txt',
              'ledger/hosts/fs01.txt',
              'ledger/leads/2024-05-11.txt',
              '$ grep -ri "authorized_keys" ledger/hosts/ | head -3',
              'ledger/hosts/jmp01.txt: app_read key also trusted on db01 (from authorized_keys)'
            ]
          },
          {
            type: 'p',
            text:
              'The second grep just found an identity trust edge — one key trusted on two hosts — without a single authentication attempt. That is the pattern: read first, authenticate once, document always.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP graph: FIN-WKS02 foothold reaches FILE01\u2019s share (reachability edge), the share yields the svc_deploy password (credential edge into JMP01, T1078), JMP01\u2019s .pgpass grants app_read against DB01 (delegation edge), and DB01:5432 is reachable from JMP01 (reachability, T1021). Two crown-jewel paths share the svc_deploy edge, so the cheapest break is rotating that credential and removing it from the share — collapsing both paths with one action. The report presents the narrative paragraph, the graph, and the fix order; every edge carries an ATT&CK tag and an evidence pointer.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['Graph paper or draw.io', 'The graph itself — simple and shared beats fancy and private'],
              ['NetExec', 'Careful, single-shot credential validation across named, approved targets'],
              ['ssh / psql / smbclient', 'Edge-proof tools per protocol'],
              ['grep across the ledger', 'Finding reuse signals in your own documentation'],
              ['MITRE ATT&CK site', 'Technique tags for every edge'
              ]
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting findings unconnected — the client fixes nothing because nothing connects',
              'Assuming trust direction; one-way trusts exist and the direction is the whole finding — verify from evidence',
              'Claiming edges that were never exercised: the "it would probably work" path is not a path',
              'Spraying credentials to find reuse quickly — lockouts destroy the engagement\u2019s welcome; reuse is proven one target at a time inside the ROE',
              'Prioritizing by CVSS score instead of by path value and cheapest break',
              'Documenting the successful login but not the underlying relationship (the trust edge)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take your lab (or the n14-l01 chain) and draw the full graph on one page. Mark each edge\u2019s type and evidence. Then answer in writing: how many distinct paths lead to the database, which single edge removal collapses the most, and what is your fix order? Finish with the executive one-paragraph version — if you cannot write it, the graph is not finished.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Paths, not findings, are the risk story: nodes, directed edges, evidence per edge',
              'Credential reuse multiplies edges invisibly; trust relationships are edges the diagrams never show',
              'T1078, T1021 and T1550 tag the path\u2019s behaviors for defenders',
              'Prioritize by asset value, path length, breadth and cheapest break — then order fixes accordingly',
              'Every edge is exercised once, minimally and documented — or it does not exist'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n14-l02-q1',
          type: 'mcq',
          prompt: 'In attack path terms, what is an edge?',
          options: [
            'Any open port on any host',
            'A directed, evidenced relationship between two nodes (reachability, credential or trust)',
            'A firewall rule',
            'A vulnerability with a CVE number'
          ],
          answerIndex: 1,
          hint: 'Edges connect things — what must every one of them carry?',
          explanation:
            'Edges are the relationships, and they must be directed and evidenced (command, output, time). Ports, rules and CVEs may explain an edge, but the edge itself is the demonstrated connection between two nodes.'
        },
        {
          id: 'n14-l02-q2',
          type: 'truefalse',
          prompt: 'Finding the same service-account password in a share note and later used successfully on a jump host is already a reuse finding — even before you try it anywhere else.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What did you actually observe, and what does the reuse claim require?',
          explanation:
            'The observed repetition of one secret across two systems is a documented reuse pattern on its own. Whether the credential ALSO works on additional systems is a separate claim requiring separate, careful validation — the report must keep observation and extrapolation distinct.'
        },
        {
          id: 'n14-l02-q3',
          type: 'short',
          prompt: 'Explain "cheapest break" and give one concrete example.',
          modelAnswer:
            'The cheapest break is the single edge whose removal collapses the largest number of valuable paths, minimizing remediation effort per unit of risk destroyed. Example: rotating one reused svc_deploy password and deleting it from the share removes every path that depends on it — one action instead of re-architecting the network or patching forty hosts.',
          hint: 'Which single fix destroys the most paths?',
          explanation:
            'Cheapest-break thinking is why attack path analysis pays for itself: it converts a pile of findings into an ordered, affordable remediation plan, and gives the retest a crisp success criterion.'
        },
        {
          id: 'n14-l02-q4',
          type: 'scenario',
          prompt:
            'You hold a password that works on JMP01. The ROE limits you to one authentication attempt per target per day. Name the ATT&CK techniques the successful login maps to, describe how you document the edge, and state why you do not immediately try the same password on five other servers.',
          modelAnswer:
            'Techniques: T1078 (Valid Accounts) for the credential use and T1021.004 (SSH) for the remote service. Documentation: an EDGE entry with the secret\u2019s source, target, masked proof (whoami output, timestamp), and the technique tags. No mass attempts: the ROE limits attempts, spraying risks lockouts and detection noise, and unvalidated guesses do not belong in the graph. Instead, record the reuse hypothesis in the ledger and validate other targets across days, or in the lab.',
          hint: 'The graph only contains what you proved — the rest is a lead.',
          explanation:
            'The scenario combines all three lesson threads: minimal validation, rigorous edge documentation, and restraint justified by both the ROE and methodology. Graphs built on guesses collapse the moment anyone checks an edge.'
        }
      ],
      references: [
        {
          title: 'MITRE ATT&CK T1550 — Use Alternate Authentication Material',
          url: 'https://attack.mitre.org/techniques/T1550/',
          note: 'Hash, ticket and key reuse — the credential edge family.'
        },
        {
          title: 'MITRE ATT&CK T1021 — Remote Services',
          url: 'https://attack.mitre.org/techniques/T1021/',
          note: 'The movement edges: SSH, SMB, RDP, WinRM and friends.'
        },
        {
          title: 'MITRE ATT&CK T1078 — Valid Accounts',
          url: 'https://attack.mitre.org/techniques/T1078/',
          note: 'Using legitimate credentials from unauthorized positions.'
        },
        {
          title: 'MITRE ATT&CK TA0008 — Lateral Movement (tactic)',
          url: 'https://attack.mitre.org/tactics/TA0008/',
          note: 'The tactic view that frames the whole path.'
        }
      ]
    },
    {
      id: 'n14-l03',
      moduleId: 'n14',
      title: 'Advanced Nmap, NSE and Packet-Level Analysis',
      difficulty: 'Advanced',
      minutes: 18,
      prerequisites: ['n14-l01'],
      objectives: [
        'Drive NSE with --script-args and read a script\u2019s behavior before running it',
        'Explain decoys (-D), timing templates and fragmentation tradeoffs — and when the ROE forbids them',
        'Verify scanner claims by capturing the same traffic with tcpdump or tshark',
        'Craft custom discovery probes when default host discovery lies'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A scanner is a claim generator; packets are the truth. Advanced testing means knowing exactly which packets each scan type emits, reading NSE scripts before running them, and being able to prove or disprove the scanner\u2019s statement by capturing the same wire. "Filtered" versus "closed", an IPS answering on behalf of a host, a stateful device masking a service — these ambiguities resolve only at packet level.'
          },
          {
            type: 'p',
            text:
              'The stealth-flavored options — decoys (-D), fragmentation (-f), glacial timing (-T0) — are best understood as detection-behavior experiments: each changes what defenders see, each has failure modes, and each belongs in an engagement only where the rules of engagement explicitly allow it. Their real teaching value is showing you what a defender\u2019s console looks like from the other side.'
          },
          {
            type: 'p',
            text:
              'NSE turns nmap from a port lister into a protocol question-asker — but scripts are code with side effects, so the discipline is selection plus arguments plus reading the action before running anything against a client system.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-packet-anatomy',
            caption: 'What each flag of a TCP packet means to a scanner — and to the defender watching it.'
          },
          {
            type: 'h',
            text: 'NSE beyond the menu'
          },
          {
            type: 'p',
            text:
              'Scripts are selected by category, name or directory (--script), and categories carry meaning: safe, intrusive, discovery, vuln, exploit. The engagement rule is simple — safe by default against client systems; intrusive and vuln categories only with explicit written approval. Arguments pass through --script-args, and the official NSE documentation (nsedoc) lists every script with its arguments and purpose.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'Script selection with arguments',
            code:
              '# safe, versioned service detection plus targeted HTTP questions\nnmap -sV --version-light -p 80,443,445 \\\n  --script "http-title,http-headers" \\\n  --script-args http.useragent="Mozilla/5.0 (compatible; lab-audit)" \\\n  10.0.20.20'
          },
          {
            type: 'p',
            text:
              'Reading a script: NSE is Lua, and each script defines a portrule (when to run) and an action (what to do). Before running anything against a client, read the action — how many requests it sends, whether it mutates state, what it writes. The nsedoc is the index; the source is the contract.'
          },
          {
            type: 'h',
            text: 'Timing, decoys and fragmentation — the honest tradeoffs'
          },
          {
            type: 'table',
            headers: ['Option', 'What it does', 'Tradeoff / caveat'],
            rows: [
              ['-T0 to -T3', 'Slows probes massively (T0) up to nmap\u2019s default (T3)', 'T0 can stretch a small scan into hours; timing alone is a weak strategy'],
              ['-T4 / -T5', 'Faster, parallel, aggressive', 'Packet loss and false positives; -T5 against production needs explicit justification'],
              ['-D decoy1,ME', 'Adds spoofed sources to the probe stream', 'The IDS still sees YOUR real stream too; replies to decoys go nowhere — mostly a detection-behavior demonstration'],
              ['-f', 'Splits TCP headers into 8-byte fragments', 'Some stacks and IDS mishandle fragments; can crash fragile devices; often forbidden by ROE'],
              ['--data-length', 'Pads probes to change byte-level signatures', 'Trivial for defenders to still fingerprint; useful to test IDS signature rigidity']
            ]
          },
          {
            type: 'p',
            text:
              'These options exist to model what real actors do, which makes them legitimate tools for detection validation — a test objective you agree with the client in writing, with their SOC informed. They are never a personal stealth budget: silently evading a defender who hired you is a trust failure even when it is technically in scope.'
          },
          {
            type: 'h',
            text: 'Packet-level verification'
          },
          {
            type: 'p',
            text:
              'Run the scanner and the capture in parallel. The capture answers the questions the scanner cannot: did the SYN-ACK come from the target or an in-line device? are the RSTs TTL-consistent with the target\u2019s OS and distance? is a port refused (RST) or silently dropped (nothing)?'
          },
          {
            type: 'terminal',
            title: 'The scanner says closed — the capture says who answered',
            lines: [
              '# terminal 1: capture what actually happens',
              '$ sudo tcpdump -ni eth0 "host 10.0.20.30 and port 3389"',
              '12:03:10.110 IP 10.0.20.1.51999 > 10.0.20.30.3389: Flags [S], seq 8821, win 64240',
              '12:03:10.112 IP 10.0.20.30.3389 > 10.0.20.1.51999: Flags [R.], seq 0, win 0, ttl 254',
              '# ttl 254 and 2 ms: nobody on this /24 answers like that -',
              '# an in-line device answered for the host',
              '# terminal 2: the claim',
              '$ nmap -Pn -n -p 3389 10.0.20.30',
              'PORT     STATE   SERVICE',
              '3389/tcp closed ms-wbt-server',
              '# verdict: "closed" is the scanner reading an injected RST - re-verify before reporting'
            ]
          },
          {
            type: 'p',
            text:
              'The tshark equivalent: tshark -i eth0 -Y "tcp.flags.syn==1 and tcp.flags.ack==0" shows your own probe stream; -z io,stat,300 gives rate tables for the noise budget. Silence in the capture where the scanner claimed an answer is the strongest possible contradiction — and the report follows the packets, not the tool.'
          },
          {
            type: 'h',
            text: 'Custom discovery probes'
          },
          {
            type: 'p',
            text:
              'Default host discovery (ICMP echo plus TCP probes to 80 and 443) misses hardened hosts. -PS, -PA and -PU let you probe ports the target\u2019s rules actually care about: a SYN to 445 from an allowed source, an ACK to a filtered port, a UDP packet to a closed port that provokes an ICMP port-unreachable. --data-length varies payloads, and --send-ip versus --send-eth matters on odd links. Whatever you change, capture while probing — discovery conclusions deserve the same packet-level proof as everything else.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The deliverable difference: "port filtered" versus "an in-line device answers for this host" is the difference between a firewall observation and an evasion-relevant finding. Packet-level proof makes both defensible. NSE knowledge turns nmap into a protocol question-asker while the category discipline keeps you inside the ROE by default.'
          },
          {
            type: 'list',
            items: [
              'Validate IDS/IPS behavior on request — "would you see a real scan" is a legitimate, sellable objective',
              'Distinguish open, closed and filtered with capture evidence for the report\u2019s segmentation section',
              'Time-box aggressive timing to agreed windows; the noise budget lives in the -T choice',
              'Script reading is due diligence: mutations and request storms live in the action, not the description'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'RSTs whose TTL or timing does not match the target\u2019s OS and distance — in-line devices answering',
              'Filtered patterns identical across many hosts and ports — a central policy worth describing precisely',
              'NSE scripts in your command history whose categories you cannot justify against the ROE',
              'Hosts alive to -PU but dead to the default probes — discovery gaps in your own method',
              'Scan durations that imply -T5 ran against production — your own discipline check'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Read before you run',
            text:
              'NSE scripts are third-party code. Against client systems run safe-category scripts by default; anything intrusive, vuln or exploit category needs written ROE approval. The same applies to decoys and fragmentation — they are traffic-generation choices the client must have agreed to.'
          },
          {
            type: 'p',
            text:
              'Lab build: one VM with iptables REJECTing port 8443 with a TCP reset and DROPping port 9443. Scan it, capture it, and read the difference between the two states:'
          },
          {
            type: 'terminal',
            title: 'Map the two ports honestly',
            lines: [
              '$ nmap -Pn -n -p 8443,9443 10.0.20.20',
              'PORT     STATE    SERVICE',
              '8443/tcp closed   https-alt     # the firewall answered with RST',
              '9443/tcp filtered https-alt     # silence: dropped, not absent',
              '$ sudo tcpdump -ni eth0 "host 10.0.20.20 and (port 8443 or port 9443)"',
              '12:11:02.901 IP 10.0.20.1.53001 > 10.0.20.20.8443: Flags [S]',
              '12:11:02.902 IP 10.0.20.20.8443 > 10.0.20.1.53001: Flags [R.]',
              '12:11:02.903 IP 10.0.20.1.53002 > 10.0.20.20.9443: Flags [S]',
              '# silence on 9443 - "filtered" is the honest word, proven on the wire'
            ]
          },
          {
            type: 'p',
            text:
              'Note the trap the lab just demonstrated: "closed" can be a firewall answering, not an absent service. Now run one safe NSE script with arguments — but read its nsedoc entry first — and finish by writing (not running) a ten-line portrule/action sketch to internalize the script shape.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP: the client asks whether their SOC would see a real intruder\u2019s sweep. With written ROE approval, a decoy-inclusive -T4 sweep runs against two lab subnets while their SOC watches. The capture shows the real source sending its full stream (decoys appear as injected flows that draw no replies); the finding: alerting fired, blocking did not, for single-source moderate-rate scans. One measured, in-scope detection-gap statement — not a stealth story — and the SOC gained a tuned rule out of it.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['nmap + NSE', 'The claim generator: ports, versions, service questions (nsedoc at nmap.org/nsedoc/)'],
              ['tcpdump', 'The independent witness on the wire (manual at tcpdump.org)'],
              ['tshark', 'Display-filter analysis and IO statistics for scan traffic'],
              ['Wireshark', 'Reading saved captures comfortably after the fact'],
              ['iptables (lab only)', 'Building the filtered, refused and injected behaviors you must learn to read']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running vuln or exploit category scripts against clients because the menu was right there — category discipline is an ROE matter',
              'Treating filtered as closed (or the reverse) in reports without a capture to back the word',
              'Assuming fragmentation or decoys provide stealth — in-line devices and flow analysis see through both, and the ROE may forbid them outright',
              'Cranking -T5 at a production window and calling the packet loss "results"',
              'Reading a script\u2019s description but not its action — mutations live in the code',
              'Capturing on the wrong interface, or forgetting -n, and drawing conclusions from nothing'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab: configure one REJECT-with-reset port and one DROP port, scan, capture, and write three sentences justifying each port-state word (open, closed, filtered) from the packets alone. Then read one NSE script\u2019s source and nsedoc entry and note what it sends, how many packets it costs, and whether it mutates anything.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Scanners claim; captures prove — pair every ambiguous result with tcpdump or tshark',
              'Closed can be a firewall answering; filtered is silence — the words carry precise meanings',
              'NSE is selection plus arguments plus reading the action first; safe category by default, ROE for the rest',
              '-D, -f and timing templates are detection-behavior experiments, used only where the ROE allows',
              'Default discovery misses hardened hosts; custom probes fix it — verified on the wire'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n14-l03-q1',
          type: 'mcq',
          prompt: 'A port shows closed in nmap output, but your capture shows the RST arrived 2 ms after the SYN with TTL 254 on a /24 LAN. Most likely explanation?',
          options: [
            'The host runs an unusually fast kernel',
            'An in-line device (IPS or firewall) injected the RST',
            'The host is actually open and nmap misread',
            'ARP resolution failed'
          ],
          answerIndex: 1,
          hint: 'Who is physically positioned to answer that fast, with that TTL?',
          explanation:
            'LAN hosts reply with LAN-appropriate TTLs and timings; a near-instant RST with a foreign TTL is the signature of an in-line device answering for the target. The scanner\u2019s port-state claim needs re-verification — this is exactly why captures accompany ambiguous results.'
        },
        {
          id: 'n14-l03-q2',
          type: 'truefalse',
          prompt: 'Adding decoys with -D reliably hides your real source from a competent defender.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Whose packets still arrive in full, and from which address?',
          explanation:
            'Decoys add spoofed sources, but the real source still sends its complete probe stream, and reply patterns expose which address is live. The legitimate value of -D is modeling attacker behavior for detection validation — with the client\u2019s consent.'
        },
        {
          id: 'n14-l03-q3',
          type: 'short',
          prompt: 'What are the two functions every NSE script defines, and why read them before running a script against a client?',
          modelAnswer:
            'The portrule decides which targets and ports trigger the script; the action is what it does — the requests it sends, how many, and any state it changes. Reading them first tells you the packet cost and whether the script mutates anything, so you can honor the ROE (safe by default) instead of discovering side effects live on a client system.',
          hint: 'When does it run, and what does it do when it does?',
          explanation:
            'NSE scripts are code with side effects. The description tells you the intent; the portrule and action tell you the behavior. Professional practice reads both before the first packet leaves.'
        },
        {
          id: 'n14-l03-q4',
          type: 'scenario',
          prompt:
            'Authorized sweep of a /24. Ten hosts answer on 80 and 443; three hosts that your notes say run services respond to neither ICMP nor TCP 80. Design better discovery probes and verify the answer.',
          modelAnswer:
            'Go beyond the defaults with -PS to service-specific ports from your notes (445, 3389, 5432 — ports their allow-lists care about), -PU to a likely-closed UDP port to provoke an ICMP port-unreachable (proof of life without an open service), and --data-length to vary signatures. Capture while probing (tcpdump) to confirm packets left and see what answered; distinguish silence (filtered) from ICMP-unreachable (host alive, port closed). Update the reachability matrix with the new evidence rather than trusting the first discovery pass.',
          hint: 'Which ports would the target\u2019s rules actually care about?',
          explanation:
            'Default discovery probes are a lowest-common-denominator choice; hardened or misconfigured hosts need targeted probes. The capture step keeps the conclusion honest — discovery claims get verified like everything else.'
        }
      ],
      references: [
        {
          title: 'Nmap book — NSE (Nmap Scripting Engine)',
          url: 'https://nmap.org/book/nse.html',
          note: 'Categories, --script-args and the engine\u2019s execution model.'
        },
        {
          title: 'NSE script documentation (nsedoc)',
          url: 'https://nmap.org/nsedoc/',
          note: 'Every script with its arguments — the index you read before running anything.'
        },
        {
          title: 'Nmap reference guide',
          url: 'https://nmap.org/book/man.html',
          note: 'The -D, -f, -T and discovery flags in the official reference.'
        },
        {
          title: 'tcpdump(1) — official manual page',
          url: 'https://www.tcpdump.org/manpages/tcpdump.1.html',
          note: 'The capture tool that arbitrates every scanner claim.'
        },
        {
          title: 'tshark — Wireshark CLI manual',
          url: 'https://www.wireshark.org/docs/man-pages/tshark.html',
          note: 'Display filters and IO statistics for scan traffic analysis.'
        }
      ]
    },
    {
      id: 'n14-l04',
      moduleId: 'n14',
      title: 'Automation, Scripting and Detection-Aware Testing',
      difficulty: 'Advanced',
      minutes: 16,
      prerequisites: ['n14-l03'],
      objectives: [
        'Decide what to automate (sweeps, diffs, retests) and what must stay manual',
        'Build small, safe, idempotent sweep and retest scripts with timeouts and excludes',
        'Budget your noise and coordinate testing windows with the client',
        'Keep evidence hygiene: session logs, timestamps, hashes and masked secrets'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Automation is a force multiplier for the parts of testing that are genuinely mechanical: host sweeps, port diffs between runs, service-version snapshots, retests of a known finding list. Judgment — which hypothesis to chase, whether a behavior is a finding, what the risk means to this business — stays human. Blurring that line produces either slow testers or dangerous scripts.'
          },
          {
            type: 'p',
            text:
              'Detection-aware means you know what each automated action looks like from the blue team\u2019s chair, you budget it, and you agree windows in advance. An automated sweep that quietly runs at -T5 across a production VLAN at 10:00 on a Monday is not efficiency; it is an outage risk and a trust failure. The same sweep, scheduled, rate-limited and announced, is a professional service.'
          },
          {
            type: 'p',
            text:
              'Evidence hygiene is automation\u2019s twin: scripts produce logs, not memories. Consistent naming, execution-time timestamps, hashes and capture-time masking turn thousands of commands into a reproducible story — and a retest becomes a diff instead of an investigation.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-recon-workflow',
            caption: 'Automation feeds the loop: sweeps and diffs produce facts; judgment turns them into leads.'
          },
          {
            type: 'h',
            text: 'What to automate — and what never'
          },
          {
            type: 'table',
            headers: ['Automate', 'Why', 'Keep manual'],
            rows: [
              ['Host and port sweeps from a scope file', 'Identical question, many targets, zero fatigue', 'Interpreting odd services — judgment'],
              ['Diffs between runs', 'Change detection; retest evidence', 'Deciding whether a change is a finding'],
              ['Version snapshots and certificate checks', 'Boring, repeatable, perfect for machines', 'Severity and business-context assignment'],
              ['Retests of a known finding list', 'Idempotent, comparable, fast', 'Writing the narrative around the results']
            ]
          },
          {
            type: 'h',
            text: 'A sweep script that will not embarrass you'
          },
          {
            type: 'p',
            text:
              'Properties to insist on: targets read from a file (the script never decides scope), the client\u2019s excludes list honored, a per-target timeout, capped parallelism, one output file per target plus a summary, and every command logged with a timestamp. Never hardcode credentials in scripts; never let automation widen scope by a typo.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'sweep.sh — scoped, timed, logged',
            code:
              '#!/usr/bin/env bash\n# sweep.sh <targets.txt> <outdir> - authorized lab targets only\nset -eu\nTARGETS="$1"; OUT="$2"\nmkdir -p "$OUT"\necho "sweep started $(date -Is) by $(whoami)" >> "$OUT/sweep.log"\nwhile read -r ip; do\n  case "$ip" in ""|\\#*) continue ;; esac\n  echo "[$(date -Is)] probing $ip" | tee -a "$OUT/sweep.log"\n  timeout 30 nmap -Pn -n -T3 --top-ports 100 -oN "$OUT/$ip.nmap" "$ip" \\\n    || echo "[$(date -Is)] $ip probe failed or timed out" | tee -a "$OUT/sweep.log"\ndone < "$TARGETS"'
          },
          {
            type: 'h',
            text: 'Idempotent retests'
          },
          {
            type: 'p',
            text:
              'A retest is the same commands against the same targets with the same flags. Store the baseline per finding (ID, command, the output that proved the issue), re-run it after the remediation window, diff, and mark fixed, partial or not-fixed from the diff alone. If the retest needs the tester to remember something, it is not idempotent — and it will not survive the six weeks between report and retest.'
          },
          {
            type: 'terminal',
            title: 'Retest as a diff',
            lines: [
              '$ bash retest.sh findings-2024-05.csv',
              '[RETEST] F-012 anonymous share read        ... STILL OPEN',
              '[RETEST] F-014 TLS: weak cipher suites     ... FIXED (only TLS 1.2+ offered)',
              '$ diff -u runs/retest-2024-05-11/ runs/retest-2024-05-18/ | head -20',
              '-80/tcp   open   http',
              '+80/tcp   closed http'
            ]
          },
          {
            type: 'h',
            text: 'Noise budgeting and windows'
          },
          {
            type: 'p',
            text:
              'Estimate the packet cost of each automated action — a top-1000-port sweep of 254 hosts is roughly a quarter-million SYNs — and agree with the client: allowed windows, excluded subnets, rate ceilings, and a kill channel with a named contact. Schedule heavy sweeps off-hours, announce rather than surprise, and keep one command that stops everything (a job file plus a kill pattern you chose in advance). nmap\u2019s --max-rate and -T settings are how the budget gets enforced in practice.'
          },
          {
            type: 'h',
            text: 'Evidence hygiene'
          },
          {
            type: 'p',
            text:
              'Run sessions under script(1) or tmux logging; name artifacts date-host-tool-action; hash originals (sha256sum) before analysis; mask credentials at capture time, not at report time. The evidence log maps finding to artifact paths and hashes — n15 will build its whole evidence discipline on this habit.'
          },
          {
            type: 'terminal',
            title: 'Run, log, hash',
            lines: [
              '$ echo 10.0.20.10 > lab-targets.txt',
              '$ echo 10.0.20.20 >> lab-targets.txt',
              '$ bash sweep.sh lab-targets.txt runs/run1',
              '[2024-05-11T14:02:11+02:00] probing 10.0.20.10',
              '[2024-05-11T14:02:41+02:00] probing 10.0.20.20',
              '$ script -a runs/session-2024-05-11.log',
              '# ... the working session, keystrokes and all ...',
              '$ exit',
              '$ sha256sum runs/run1/*.nmap > runs/run1/SHA256SUMS'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Clients buy coverage and reliability; automation delivers both when scoped, and damages trust when not. Detection-awareness converts your noise from an accident into a service: the SOC gets a schedule it can correlate against alerts — or, where stealth is in scope, a later check of whether they saw you. Retests are recurring value and the honesty check on your own work; diffs catch scope drift before the report does.'
          },
          {
            type: 'list',
            items: [
              'Consistency across engagements: the same script, the same evidence shapes, comparable reports',
              'Noise budgets prevent lockouts and outages — the two fastest ways to lose a client',
              'Session logs and hashes survive handoffs: a new tester or a dispute gets the same truth',
              'The retest script the client can adopt is the cheapest goodwill you will ever generate'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Scripts (yours) with hardcoded credentials or client data — they will leak eventually',
              'Automation output without timestamps or command lines — unreproducible, therefore weak evidence',
              'Sweeps without excludes or timeouts — the outage pattern waiting for a bad day',
              'Findings whose retest procedure cannot be written as a command',
              'Two team members scanning the same ranges — coordinate, dedupe, save the window'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Build the pieces in the lab: a scope file, the sweep script, a diff, and a retest list. Run each twice and prove idempotence — identical inputs must produce identical conclusions. Then deliberately break something (remove the timeout, point at a wider range) and observe what unbounded automation looks like before restoring the guardrails.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Scope is a file, not a feeling',
            text:
              'Every automation input that defines where packets go — target lists, excludes, rate caps — lives in a versioned file reviewed against the signed scope. A CIDR typo in a script is indistinguishable from an attack on the wrong company.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP retest week: nine findings; the retest driver replays seven as stored commands (two need manual steps, flagged as such); the diff shows five fixed, two partial. The report addendum lists per-finding command, before and after evidence hashes, and the two manual items. The client\u2019s operations team later adopted the retest script as their own regression check — the highest compliment an automation artifact can receive.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['bash', 'Glue for scoped sweeps and retest drivers'],
              ['python3', 'Structured sweeps (sockets plus concurrent.futures) when bash outgrows itself'],
              ['nmap --max-rate / -T', 'Pacing controls that keep sweeps inside the noise budget'],
              ['diff / git', 'Baseline-versus-now comparisons and versioned methodology'],
              ['script(1) / tmux', 'Full-session logging: the raw evidence layer'],
              ['sha256sum', 'Artifact integrity for the evidence log']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Automating understanding: a script that "classifies" vulnerabilities makes judgment calls nobody audited',
              'Hardcoding credentials or tokens in scripts that later land in a client repo or your public dotfiles',
              'Forgetting excludes, or accepting them verbally: the CIDR typo that scans the wrong company',
              'No timeouts: one hung target stalls the whole pipeline silently',
              'Announcing nothing: the SOC that watches you sweep learns nothing and fears everything',
              'Collecting evidence without hashing or masking — either lost integrity or leaked secrets'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write sweep.sh (or a thirty-line Python equivalent), point it at a two-host scope file, run it twice, and diff the runs. Then write retest lines for two of your lab findings and mark fixed or still-open from output only. Finally, log the whole session with script(1) and hash every artifact. You now own a repeatable core that the next module builds its evidence discipline on.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Automate sweeps, diffs and retests; keep interpretation, severity and narrative human',
              'Scripts read scope from files, honor excludes, carry timeouts and log their commands',
              'A retest is idempotent: same commands, stored baseline, the diff decides',
              'Budget noise, agree windows, keep a kill switch — detection-aware is a courtesy and a test objective',
              'Evidence hygiene: session logs, ISO timestamps, hashes, masked secrets — from day one, not report week'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n14-l04-q1',
          type: 'mcq',
          prompt: 'Which task is the WORST candidate for automation?',
          options: [
            'Sweeping a scope file for open ports',
            'Diffing two scan runs for changed services',
            'Deciding whether a behavior constitutes a business-logic finding',
            'Re-running yesterday\u2019s finding list for the retest'
          ],
          answerIndex: 2,
          hint: 'Which step needs judgment about business meaning?',
          explanation:
            'Sweeps, diffs and retests are mechanical and benefit from machine consistency. Classifying behavior as a business finding requires context and judgment that scripts should not own — automating it hides unreviewed decisions inside your methodology.'
        },
        {
          id: 'n14-l04-q2',
          type: 'truefalse',
          prompt: 'A retest that requires the tester to remember which flags they used six weeks ago is acceptable.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What makes a retest reproducible — and fair to the client\u2019s fixes?',
          explanation:
            'Retests must be idempotent: stored commands, stored baselines, diffed results. Memory-based retests are unverifiable, inconsistent, and unfair — the client cannot tell whether the fix or the tester changed.'
        },
        {
          id: 'n14-l04-q3',
          type: 'short',
          prompt: 'List four properties that make a sweep script safe to run against an authorized scope.',
          modelAnswer:
            'It reads targets from a scope file (never decides scope itself), honors an excludes list, applies per-target timeouts and rate caps, and logs every command with timestamps to structured output. Bonus properties: no hardcoded credentials and a simple kill switch.',
          hint: 'What can go wrong while you sleep — and how would anyone audit it afterwards?',
          explanation:
            'Those properties bound the blast radius of mistakes and make runs auditable. The difference between automation and risk is exactly this list, applied before the first packet leaves.'
        },
        {
          id: 'n14-l04-q4',
          type: 'scenario',
          prompt:
            'Authorized test, five-day window. The client\u2019s SOC lead asks to correlate their alerts with your activity. What do you hand over, and how do you shape your automation this week?',
          modelAnswer:
            'Hand over a schedule (what runs when: discovery day 1, sweeps in agreed off-hours windows, retests day 4), expected noise per action (approximate packet and attempt counts), the exact commands, your testing source IPs, and a contact plus kill phrase. Shape automation accordingly: rate-limited sweeps, excludes honored, no surprise scans, session logging so timings reconcile afterwards. The schedule doubles as the detection-validation data for the report\u2019s blue-team section.',
          hint: 'What would a defender need in order to say "that is the pentest, not an intruder"?',
          explanation:
            'Detection-aware testing turns noise into a measurable service and keeps trust. The same artifacts — schedule, commands, logs — later become the evidence that the client\u2019s monitoring saw (or missed) the agreed activity.'
        }
      ],
      references: [
        {
          title: 'Nmap book — Timing and Performance',
          url: 'https://nmap.org/book/performance.html',
          note: 'The pacing options that implement your noise budget.'
        },
        {
          title: 'Nmap reference guide',
          url: 'https://nmap.org/book/man.html',
          note: 'The full flag reference behind the sweep scripts shown here.'
        },
        {
          title: 'MITRE ATT&CK T1046 — Network Service Scanning',
          url: 'https://attack.mitre.org/techniques/T1046/',
          note: 'How defenders classify and detect the scanning your automation performs.'
        },
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'Where automation fits into the standard\u2019s phases.'
        }
      ]
    }
  ]
};
