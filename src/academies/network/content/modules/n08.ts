import type { Module } from '../../../../types';

// LEVEL 5 — VULNERABILITY ASSESSMENT · Module n08: Network Vulnerability Assessment
// Original curriculum content for the Network Security & Pentesting Academy.
// All prose is original; concepts follow the official sources cited per lesson
// (cve.org, nvd.nist.gov, first.org/cvss, nmap.org/book, docs.greenbone.net,
// docs.tenable.com, OWASP). Vulnerability scanning and exploit code are
// practiced exclusively against lab systems you own or are authorized to test.

export const n08: Module = {
  id: 'n08',
  title: 'Network Vulnerability Assessment',
  level: 5,
  description:
    'Turning an enumerated service inventory into verified, reportable findings: the vocabulary of vulnerabilities, exposures, CVE records and CVSS scores; how vulnerability scanners work — NSE scripts, OpenVAS/Greenbone and Nessus concepts, authenticated versus unauthenticated scanning; the misconfiguration and weak-authentication findings that dominate real reports; and the discipline of manual validation before anything reaches a report.',
  outcomes: [
    'Distinguish vulnerabilities, exposures, exploits and risk, and read CVE records and CVSS scores fluently',
    'Explain how vulnerability scanners work internally and choose scan policies deliberately',
    'Run scanner tooling against lab targets and critically interpret both its hits and its silence',
    'Identify the misconfiguration and weak-authentication findings that make up most real assessments',
    'Validate findings manually and write them up with severity, evidence, impact and remediation'
  ],
  lessons: [
    {
      id: 'n08-l01',
      moduleId: 'n08',
      title: 'Vulnerabilities, Exposures, CVEs and CVSS',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n07-l01'],
      objectives: [
        'Define vulnerability, exposure, exploit and risk and use the words precisely',
        'Read a CVE record and explain what the Common Vulnerabilities and Exposures program is',
        'Decode a CVSS v3.1 base score from its metric string and severity band',
        'Explain why a scanner severity rating is a starting point for judgment, not the judgment itself'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A vulnerability is a weakness in software or configuration that an attacker could abuse; an exposure is a state that invites abuse (a service reachable where it should not be, a credential left on a wiki); an exploit is code or a technique that exercises the weakness; and risk is what happens when you combine all of that with context — which asset, how reachable, how valuable, to whom. Assessors who use these words interchangeably produce reports nobody can act on, so the vocabulary comes first.'
          },
          {
            type: 'p',
            text:
              'The security industry solved the naming problem with the CVE program: every publicly known software weakness gets an identifier of the form CVE-YYYY-NNNNN — a year plus a serial — maintained by MITRE and populated by authorized numbering authorities called CNAs. CVE identifiers are the join key of the entire industry: vendor advisories, scanner plugins and exploit databases all reference the same string, so a finding that names its CVE is instantly shareable and verifiable. The NVD (National Vulnerability Database) enriches CVE records with structured analysis, including severity scores.'
          },
          {
            type: 'p',
            text:
              'Severity itself is scored with CVSS, the Common Vulnerability Scoring System — currently version 3.1 in widespread use, with version 4.0 published by FIRST. CVSS compresses the technical essence of a vulnerability into eight letters and a number. Learning to read that string is the single highest-leverage skill in this module, because it lets you sanity-check any scanner, advisory or report you will ever read.'
          }
        ],
        technical: [
          { type: 'h', text: 'The anatomy of a CVE record' },
          {
            type: 'p',
            text:
              'A CVE identifier encodes year of assignment (not necessarily of discovery or disclosure) and a serial number: CVE-2011-2523 is the famous vsftpd 2.3.4 backdoor, assigned in 2011; CVE-2021-41773 is the Apache path traversal flaw. A CVE record on cve.org carries the description, affected products, references and the assigning CNA; the NVD entry adds CPE (Common Platform Enumeration) product bindings and a CVSS analysis. For an assessor, the record answers three questions: what exactly is wrong, which versions are affected, and where does the authoritative description live.'
          },
          { type: 'h', text: 'CVSS v3.1 in eight letters' },
          {
            type: 'p',
            text:
              'A CVSS v3.1 base score is computed from the metric string. The official specification defines each metric and the formula; the calculator at first.org does the math for you. The base metrics:'
          },
          {
            type: 'table',
            headers: ['Metric', 'Meaning', 'Values'],
            rows: [
              ['AV — Attack Vector', 'How far away the attacker must be', 'N network, A adjacent, L local, P physical'],
              ['AC — Attack Complexity', 'Conditions beyond the attacker\u2019s control', 'L low, H high'],
              ['PR — Privileges Required', 'Access needed before attacking', 'N none, L low, H high'],
              ['UI — User Interaction', 'Must a victim act?', 'N none, R required'],
              ['S — Scope', 'Does the impact cross a trust boundary?', 'U unchanged, C changed'],
              ['C / I / A', 'Impact on Confidentiality, Integrity, Availability', 'H high, L low, N none']
            ]
          },
          {
            type: 'p',
            text:
              'The canonical critical example reads AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H — a network-reachable, low-complexity, unauthenticated, no-user-interaction flaw with total confidentiality, integrity and availability impact — which scores 9.8, Critical. The severity bands: 0.0 None, 0.1-3.9 Low, 4.0-6.9 Medium, 7.0-8.9 High, 9.0-10.0 Critical. Beyond the base metrics, Temporal metrics (exploit maturity, fixes available) and Environmental metrics (importance of the specific asset) exist, but scanners almost always report only the base score — which is the first hint that the number is a starting point.'
          },
          { type: 'h', text: 'Why scanner severity is a starting point' },
          {
            type: 'p',
            text:
              'CVSS measures the intrinsic severity of a weakness in isolation: a perfect, unauthenticated, network-wide catastrophe. It knows nothing about your world — whether the vulnerable service is internet-facing or on a management VLAN, whether the asset is a cash-register database or a kiosk, whether a working exploit is circulating, or whether compensating controls exist. Risk assessment layers that context on top. A 9.8 on an isolated test VM and a 5.3 on the payment database can invert when context arrives; the assessment module\u2019s final lesson builds exactly that judgment, and reports that copy scanner severities without it are the ones clients rightly argue with.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every tool in the next lessons speaks this language: nmap scripts cite CVE identifiers, Nessus and OpenVAS plugins carry CVSS vectors, and clients grade your report by the same bands. Reading fluency is a professional requirement — you will spend real engagements translating between a scanner\u2019s 7.5 and what the finding actually means on this network.'
          },
          {
            type: 'list',
            items: [
              'CVE identifiers are the currency of evidence: a finding without one (where one exists) invites disputes',
              'CVSS vectors let you verify a scanner\u2019s number instead of trusting it — mis-scores are common',
              'The S (scope) metric captures cross-boundary impact such as sandbox escapes, which scanners routinely flatten',
              'Context transforms severity: exposure, asset value, exploit availability and compensating controls all move the number'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'CVE identifiers in scan output and vendor advisories — always open the record before believing the summary',
              'CVSS metric strings in plugin output; decode them rather than reading only the number',
              'Severity claims that ignore exposure context (internet-facing versus internal-only)',
              'Version claims in findings that need the backporting check from the enumeration module',
              'Temporal signals in advisories: is a working exploit public? is a patch available?'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Reading is free; testing is scoped',
            text:
              'Reading CVE records, NVD entries and CVSS calculators touches only public reference databases and is always safe. Running the checks that surface those CVEs against systems is where authorization begins — the lab habits of this module apply.'
          },
          {
            type: 'p',
            text:
              'A practice loop on public data, then on your own lab host. First the public loop: pick a famous CVE, read its record, score it yourself before looking. Then the lab loop, where enumeration output feeds the lookup:'
          },
          {
            type: 'terminal',
            title: 'From lab enumeration to CVE lookup',
            lines: [
              '$ nmap -sV -p 21 --script ftp-vsftpd-backdoor 10.0.0.20',
              'Starting Nmap 7.94 ( https://nmap.org )',
              'Nmap scan report for 10.0.0.20',
              'PORT   STATE SERVICE',
              '21/tcp open  ftp',
              '| ftp-vsftpd-backdoor:',
              '|   VULNERABLE:',
              '|   vsFTPd version 2.3.4 backdoor',
              '|     State: VULNERABLE (Exploitable)',
              '|     IDs:  CVE:CVE-2011-2523  BID:48539',
              '# The script cites the CVE: now do the reading loop.',
              '# 1. Open the CVE record and the NVD entry.',
              '# 2. Decode the CVSS vector yourself.',
              '# 3. Decide what the finding means on THIS network.'
            ]
          },
          {
            type: 'p',
            text:
              'The deliberate habit: the tool hands you an identifier, and you do the verification — record, vector, context — before the word vulnerable appears in anything a client will read.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two findings, one score, opposite advice. A lab scan reports CVE-2011-2523 (vsftpd 2.3.4 backdoor) on the deliberately vulnerable lab server — base severity Critical, and in the lab the advice is simple: understand it, then rebuild the VM. The same CVE string found during an authorized engagement on a production jump host would trigger an immediate escalation call rather than a report line, because a backdoored daemon is a compromise indicator, not just a vulnerability. Same identifier, same CVSS score, entirely different action — which is the whole argument for reading records instead of trusting numbers.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Score it yourself first',
            text:
              'Take any CVSS vector and predict the band before using the calculator. In a week you will read AV:N/AC:L/PR:N/UI:N strings the way you read speed limits — instantly, and with feeling for what they imply.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in this lesson'],
            rows: [
              ['CVE Program site (cve.org)', 'The authoritative record: description, affected products, CNA, references'],
              ['NVD (nvd.nist.gov)', 'Structured enrichment: CPE version bindings, CVSS analysis, change history'],
              ['FIRST CVSS v3.1 calculator', 'Turns a metric string into a score; the reference implementation'],
              ['nmap NSE scripts', 'Produce the CVE-tagged findings that start the lookup loop'],
              ['Vendor advisories', 'The ground truth on fixed versions — the backport check lives here']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating the CVSS base score as risk — it measures intrinsic severity with no context',
              'Quoting a CVE without reading the record: affected-version ranges matter more than the headline',
              'Ignoring the S (Scope) metric in vectors, which hides cross-trust-boundary impact',
              'Assuming a banner version matching an affected range proves exploitability — backports and mitigations exist',
              'Reporting scanner numbers verbatim; clients pay you for the judgment layer, not for the CSV export'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pick three CVE identifiers from advisories or scan output you have seen in this course. For each: read the official record, write the CVSS vector if the record includes one, decode it metric by metric, and write one sentence on what the finding would mean on (a) an internet-facing server and (b) an internal management host. You have just practiced the core judgment this module exists to teach.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Vulnerability, exposure, exploit and risk are different words with different jobs — use them precisely',
              'CVE-YYYY-NNNNN identifiers are the industry join key; cve.org is the record, NVD the enrichment',
              'CVSS v3.1 base scores come from eight metrics: AV, AC, PR, UI, S, C, I, A — bands: Low, Medium, High, Critical',
              'Base scores ignore exposure, asset value, exploit maturity and compensating controls — context is your job',
              'A finding is an identifier plus evidence plus judgment; scanners provide at most the first two'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n08-l01-q1',
          type: 'mcq',
          prompt: 'Which CVSS v3.1 metric string describes a network-reachable, low-complexity, unauthenticated attack with high impact on confidentiality, integrity and availability (scope unchanged)?',
          options: [
            'AV:L/AC:H/PR:H/UI:R/S:U/C:L/I:L/A:N',
            'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
            'AV:N/AC:H/PR:L/UI:R/S:C/C:H/I:H/A:H',
            'AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N'
          ],
          answerIndex: 1,
          hint: 'Network, low complexity, no privileges, no interaction, unchanged scope, triple high.',
          explanation:
            'That string is the canonical 9.8 Critical: remote, easy, unauthenticated, total impact. Option A is a local, high-complexity, privileged flaw with minor impact (Low); reading vectors metric by metric is exactly the fluency this lesson builds.'
        },
        {
          id: 'n08-l01-q2',
          type: 'truefalse',
          prompt: 'A CVSS base score of 9.8 means the vulnerability is currently being exploited in the wild.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which CVSS metric group talks about exploit maturity?',
          explanation:
            'Base scores describe intrinsic technical severity only. Exploit maturity is a Temporal metric, and real-world exploitation is threat intelligence, not part of the base calculation. A 9.8 with no public exploit and a 9.8 with a worm in circulation are the same number and very different risks.'
        },
        {
          id: 'n08-l01-q3',
          type: 'short',
          prompt: 'In one or two sentences each, distinguish vulnerability, exposure and risk.',
          modelAnswer:
            'A vulnerability is a weakness in software or configuration that could be abused (for example, a buffer overflow in a service). An exposure is a state that invites abuse without a code flaw — a service reachable from networks that should not reach it, a default credential left in place. Risk is the combination of all of it with context: what asset is affected, how reachable the weakness is, how valuable it is, and whether anyone is actually exploiting it. Vulnerability and exposure are properties of the system; risk is a judgment about impact in this environment.',
          hint: 'Two of them are properties of the system; one of them requires context.',
          explanation:
            'Reports that conflate the three confuse clients: a Medium vulnerability on the crown-jewel database can be higher risk than a Critical one on an isolated kiosk. Precise vocabulary is what makes severity judgment discussable.'
        },
        {
          id: 'n08-l01-q4',
          type: 'scenario',
          prompt:
            'A scanner reports a Critical (9.8) vulnerability on an internal build server that is reachable only from the engineering VLAN and has no working public exploit. The client pushes back: "Critical? Nobody can even reach it." Draft your two-paragraph answer defending the report while taking the context seriously.',
          modelAnswer:
            'Paragraph 1 — agree on the distinction: the 9.8 is the CVSS base score, which measures intrinsic severity (network-reachable from wherever the build server sits, unauthenticated, full impact) and deliberately excludes asset context and exploit maturity. On this network the practical risk is lower than the band suggests: reachability is limited to one VLAN, no working exploit is public, and compensating controls may exist. Paragraph 2 — explain why it still appears as a finding rather than being deleted: VLAN segmentation is a control that changes (misconfigured firewall rules, new engineering hosts, VPN scope creep), threat intelligence shows unexploited 9.8s do get exploited once a proof of concept lands, and the honest remedy is cheap — patch or restrict. Propose adjusting the report\u2019s priority (not the CVSS number): schedule it behind internet-facing Criticals, verify the VLAN restriction as part of remediation. This keeps the score honest, the context visible and the conversation professional.',
          hint: 'Do not defend the number — explain what it measures, then layer the context that was missing.',
          explanation:
            'The strongest assessors never treat CVSS as the final word nor ignore it. Separating intrinsic severity (the number) from risk (the judgment) resolves almost every client dispute, and documenting the exposure reasoning is what turns a scanner export into an assessment.'
        }
      ],
      references: [
        {
          title: 'CVE Program — Official Website',
          url: 'https://www.cve.org/',
          note: 'The authoritative CVE record search and program documentation.'
        },
        {
          title: 'NVD — National Vulnerability Database',
          url: 'https://nvd.nist.gov/',
          note: 'CVE enrichment with CPE bindings and CVSS analysis from NIST.'
        },
        {
          title: 'FIRST — CVSS v3.1 Specification Document',
          url: 'https://www.first.org/cvss/v3.1/specification-document',
          note: 'The official definition of every metric and the scoring formula.'
        },
        {
          title: 'FIRST — CVSS v3.1 Calculator',
          url: 'https://www.first.org/cvss/calculator/3.1',
          note: 'The reference calculator; score vectors yourself to build fluency.'
        },
        {
          title: 'NVD — CVSS Metrics Overview',
          url: 'https://nvd.nist.gov/vuln-metrics/cvss',
          note: 'How NVD applies CVSS to CVE records, including v3.1 vectors.'
        }
      ]
    },
    {
      id: 'n08-l02',
      moduleId: 'n08',
      title: 'Vulnerability Scanning: NSE, OpenVAS/Greenbone and Nessus Concepts',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n08-l01'],
      objectives: [
        'Describe the common pipeline every vulnerability scanner follows',
        'Use nmap NSE script categories deliberately, including the vuln category and its risks',
        'Explain how OpenVAS/Greenbone and Nessus are built: feeds, plugins, policies and credentialed scans',
        'Diagnose the causes of false positives and false negatives and mitigate each'
      ],
      diagram: 'net-vuln-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A vulnerability scanner is automation of a loop you already know: find live hosts, find open ports, identify services, then ask each service a library of versioned questions — do you leak this CVE? do you allow that default login? is this TLS version deprecated? Every scanner on the market is a variation on that pipeline with a different question library, which is why understanding the pipeline matters more than memorizing any product.'
          },
          {
            type: 'p',
            text:
              'This lesson covers the three tool families you will actually meet: nmap\u2019s Scripting Engine (NSE), which turns thousands of small scripts loose on enumerated services; OpenVAS and its commercial sibling Greenbone, the open-source scanner built around a daily feed of network vulnerability tests; and Nessus, Tenable\u2019s commercial scanner whose plugin architecture dominates the enterprise market. All three reward the same skill: choosing a scan policy deliberately — what to check, how loudly, with or without credentials — and then reading the output with professional skepticism.'
          },
          {
            type: 'p',
            text:
              'The professional stance in one sentence: scanners generate leads, assessors generate findings. The rest of this lesson gives you the internals to know why that sentence is true and the vocabulary to prove it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-vuln-workflow',
            caption: 'The vulnerability scanning workflow: scoping, discovery, service detection, checks, then validation and reporting.'
          },
          { type: 'h', text: 'The scanner pipeline' },
          {
            type: 'p',
            text:
              'Regardless of product, the stages are: (1) host discovery — which targets answer at all; (2) port scanning — which doors are open; (3) service detection — fingerprints, banners, versions (module n07, again); (4) vulnerability checks — plugin or script logic keyed on the detected service, sometimes behavioral (attempt the login, send the malformed request) and sometimes purely version-matched; (5) correlation and reporting — findings with severity, evidence and remediation guidance. Weakness in any early stage poisons the rest: skip service detection and the checks fire blind, which is how scanners end up flagging a modern patched server because its banner resembles an old one.'
          },
          { type: 'h', text: 'NSE: a scanner inside nmap' },
          {
            type: 'p',
            text:
              'The Nmap Scripting Engine runs Lua scripts organized into categories: default (run with -sC), safe (read-only, non-disruptive), intrusive (can crash services or be noisy), vuln (vulnerability checks), auth, discovery and more. The --script vuln selector runs the whole vuln category; individual scripts target one check. Scripts combine version detection with their own probing — ftp-vsftpd-backdoor performs an actual behavioral test for the 2.3.4 backdoor rather than trusting the banner, which is why its output says VULNERABLE rather than probably. The cost of breadth is risk: vuln-category scripts include intrusive checks that can disrupt fragile services, so policy choice (--script vuln versus --script safe versus named scripts) is a professional decision, documented in the official NSE book chapter and per-script docs.'
          },
          { type: 'h', text: 'OpenVAS/Greenbone and Nessus: the big scanners' },
          {
            type: 'p',
            text:
              'OpenVAS (open source, the engine inside the Greenbone stack) maintains thousands of Network Vulnerability Tests (NVTs) delivered as a continuously updated feed; a management daemon (gvmd) schedules scans, and the scanner executes NVTs against targets. Nessus is organized around plugins (the same concept, commercial feed) grouped into families, assembled into policies — the named configuration that decides which checks run and how aggressively. Both products support credentialed scans: you provide SSH, SMB or other credentials, and the scanner logs into each host to inspect installed packages and patch levels directly — turning version guessing into ground truth. Both document this architecture in their official documentation portals.'
          },
          {
            type: 'table',
            headers: ['Dimension', 'Unauthenticated scan', 'Authenticated (credentialed) scan'],
            rows: [
              ['What it sees', 'Network-reachable services, banners, protocol behavior', 'Everything above plus installed software, patch levels, local configuration'],
              ['Version knowledge', 'Inferred from banners and probes — backport-sensitive', 'Read from the package database — ground truth'],
              ['Typical findings', 'Exposed services, protocol weaknesses, known remote CVEs', 'Missing patches, insecure local settings, weak policies'],
              ['Risk and cost', 'Lower; no credentials handled', 'Higher; credential handling and elevated accounts required'],
              ['False direction', 'Tends toward false positives (banner matches)', 'Tends toward false negatives if credentials are wrong or partial']
            ]
          },
          { type: 'h', text: 'False positives and false negatives' },
          {
            type: 'p',
            text:
              'False positives arise when checks are version-only (banner says 2.4.41, but the distribution backported the fix), when a proxy or WAF sits in front and answers probes itself, or when plugin logic misfires on unusual configurations. False negatives arise when the scanner could not reach the service (firewalling, IPv6 gaps, UDP blindness), when credentials failed silently so the local checks never ran, or when the check throttles itself to avoid disruption and times out. The mitigations are procedural: validate every high-severity hit by hand (next lesson), record scan scope and credentials used, and never report scanner absence of findings as proof of security — a clean report can mean a clean network or a blind scanner.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Scanners are leverage: they cover thousands of hosts while you think. But clients pay for the assessor, not the tool — and the visible difference is exactly here, in policy choice and output interpretation. Knowing that a plugin is version-only, that a credentialed scan silently skipped half the estate because the SSH key expired, or that the vuln category includes disruptive checks is what separates a report from a CSV file.'
          },
          {
            type: 'list',
            items: [
              'Run safe-category and version-detection scans first; escalate to vuln/intrusive checks deliberately and with agreement',
              'Credentialed scans find the missing-patch findings that unauthenticated scans structurally cannot',
              'Treat scanner severities as leads (previous lesson) and validate before reporting',
              'Document scan conditions — scope, policy, credentials, date — because a finding without conditions cannot be reproduced or disputed fairly'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Plugin output that names its detection method: behavioral proof versus version match — trust them very differently',
              'Credentialed scans whose per-host results are suspiciously empty: expired credentials produce confident-looking silence',
              'Scan coverage gaps: hosts or ports the policy excluded, IPv6 ranges, UDP services',
              'Severity inflation from banner-only checks on distribution-backported software',
              'Disruptive-check side effects: crashed legacy services during intrusive scans are a real and reportable operational risk'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scanners attack — keep them home',
            text:
              'A vulnerability scanner is an attack tool with a schedule. Point it only at lab VMs you own or targets in a signed scope. Intrusive checks have crashed production services; unauthorized scanning is a crime even with friendly intent. In this course, everything runs against your own deliberately vulnerable lab.'
          },
          {
            type: 'p',
            text:
              'A staged NSE session against your lab target — deliberate policy, not a fire hose:'
          },
          {
            type: 'terminal',
            title: 'Staged scanning of a lab VM',
            lines: [
              '# Stage 1: service detection feeds the checks (module n07)',
              '$ nmap -sV 10.0.0.20',
              '# Stage 2: targeted behavioral check for a specific CVE',
              '$ nmap -p 21 --script ftp-vsftpd-backdoor 10.0.0.20',
              'PORT   STATE SERVICE',
              '21/tcp open  ftp',
              '| ftp-vsftpd-backdoor:',
              '|   VULNERABLE:',
              '|   vsFTPd version 2.3.4 backdoor',
              '|     State: VULNERABLE (Exploitable)',
              '|     IDs:  CVE:CVE-2011-2523',
              '# Stage 3 (aggressive, lab-only): the full vuln category',
              '$ nmap --script vuln 10.0.0.20',
              '# On shared or fragile networks, stage 3 is a scheduled decision,',
              '# not a reflex — say so in your notes.'
            ]
          },
          {
            type: 'p',
            text:
              'In a full lab setup, install OpenVAS/Greenbone from your distribution and run one unauthenticated and one credentialed scan of the same VM; the missing-patch findings that appear only in the credentialed report are the table above made real.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The same lab VM, two scans. The unauthenticated Nessus policy reports a handful of banner-based findings — an old-looking Apache header, TLS facts, the vsftpd 2.3.4 behavioral hit. The credentialed scan adds what the network never shows: thirty unpatched packages, password policy settings, and a stale service account. Combined, the reports tell one coherent story — this VM is maintained the way its exposed services suggest — and each finding carries its plugin ID, its evidence and the conditions of the scan. That combined document is what the validation lesson turns into a client-ready report.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Read the plugin, not just the name',
            text:
              'Every Nessus and OpenVAS finding links its plugin or NVT description. Thirty seconds reading the detection method tells you whether you are holding proof or a guess — the highest-value habit in scanner work.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'What it is'],
            rows: [
              ['nmap NSE', 'Lua script engine with categories (safe, vuln, intrusive); the lab-friendly way to learn scanner logic'],
              ['OpenVAS / Greenbone', 'Open-source scanner: daily NVT feed, management daemon, credentialed scans; official docs at docs.greenbone.net'],
              ['Nessus (Tenable)', 'Commercial scanner: plugin families, policies, credentialed scans; official docs at docs.tenable.com'],
              ['Scan policy documentation', 'Your own notes: scope, policy, credentials, timing — the metadata that makes findings reproducible']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Pointing scanners at anything you can reach — unauthorized scanning is illegal regardless of intent, and intrusive checks cause outages',
              'Reporting scanner output verbatim with severities attached and no validation',
              'Running the vuln category against fragile production services without scheduling and client agreement',
              'Assuming a credentialed scan succeeded; expired or partial credentials produce silent false negatives',
              'Treating a clean scan as proof of security — blind scanners also produce clean reports'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab, run three scans of the same VM: an unauthenticated nmap -sV plus safe scripts, an nmap --script vuln pass (lab only), and — if you have installed it — an OpenVAS credentialed scan. Build a three-column table: finding, scan that produced it, and whether the check was behavioral or version-based. Which findings would you report, and what validation would each need?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Every scanner follows the same pipeline: discovery, ports, services, checks, reporting — weak stages poison the rest',
              'NSE categories encode risk: safe is read-only, vuln checks CVEs, intrusive can break things — choose policies deliberately',
              'OpenVAS/Greenbone and Nessus are feed-driven check libraries with credentialed modes that see what the network cannot',
              'Authenticated scans convert version inference into package ground truth and find the missing-patch class of findings',
              'False positives come from version-only logic and proxies; false negatives from reachability, failed credentials and throttling — procedural discipline catches both'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n08-l02-q1',
          type: 'mcq',
          prompt: 'What is the practical difference between the ftp-vsftpd-backdoor NSE script and a plugin that only flags vsftpd 2.3.4 banners?',
          options: [
            'None — both are version checks with different names',
            'The NSE script performs a behavioral test against the live service; the plugin matches the version string only',
            'The plugin is more accurate because vendors write it',
            'The NSE script only works with credentialed scans'
          ],
          answerIndex: 1,
          hint: 'One of them actually talks to the service and observes behavior.',
          explanation:
            'Behavioral checks (the script sends the trigger and observes the response) produce stronger evidence than version matching, which is vulnerable to backports and banner fictions. Reading whether a check is behavioral or version-based is the first thing to do with any scanner finding.'
        },
        {
          id: 'n08-l02-q2',
          type: 'truefalse',
          prompt: 'A credentialed scan of 200 hosts returned detailed results for 40 and nothing at all for the rest. The cleanest explanation is that the other 160 hosts are fully patched.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What happens to local checks when the login fails?',
          explanation:
            'All-or-nothing results are the signature of failed credentials or unreachable hosts, not of universal patching. The scanner often logs a credential error once and stays quiet per-host. Professional practice: verify a sample of the empty hosts by hand before believing the silence.'
        },
        {
          id: 'n08-l02-q3',
          type: 'short',
          prompt: 'Name three distinct causes of false positives in vulnerability scanning and one procedural defense against each.',
          modelAnswer:
            'Cause 1: version-only detection that cannot see distribution backports — defense: validate the version claim against the package database or vendor advisory before reporting. Cause 2: an intermediary (proxy, WAF, load balancer) answering probes on behalf of the real service — defense: confirm the finding end-to-end from the client path and check which host actually responded. Cause 3: plugin logic misfiring on unusual configurations or custom banners — defense: reproduce the check manually and read the plugin\u2019s documented detection method. In all three, the defense is the same discipline: treat scanner output as a lead and validate before it becomes a finding.',
          hint: 'Think banners, middleboxes and plugin logic — each needs a different confirmation.',
          explanation:
            'False positives are not a tool failure to complain about; they are predictable consequences of detection methods. Knowing the cause tells you the validation step, which is why the next lesson makes validation a mandatory stage of the workflow.'
        },
        {
          id: 'n08-l02-q4',
          type: 'mcq',
          prompt: 'Which check class is structurally impossible in an unauthenticated scan?',
          options: [
            'Detecting a deprecated TLS protocol version on an HTTPS service',
            'Reporting that a host is missing a specific OS security patch',
            'Identifying an exposed management console on port 8443',
            'Confirming anonymous FTP login works'
          ],
          answerIndex: 1,
          hint: 'Which question requires looking inside the operating system?',
          explanation:
            'Missing-patch findings require reading the package database or update history on the host, which requires credentials. The other three are all observable from the network — banner and protocol behavior — and are exactly what unauthenticated scans do find.'
        },
        {
          id: 'n08-l02-q5',
          type: 'scenario',
          prompt:
            'You are scheduled to run a vulnerability scan on a client\u2019s legacy manufacturing network. The machines are old, some services are fragile, and the operations team is nervous. Describe the scan policy you would propose and justify each choice.',
          modelAnswer:
            'Proposal: (1) Start read-only — host discovery, port scan and service detection with -sV and safe-category scripts only, to build the service inventory without touching fragile services. (2) Behavioral or intrusive checks (the full vuln category, exploit verification) only as a targeted, named-script pass on specific services the client agrees to, scheduled inside the agreed maintenance window with operations watching. (3) No credential-less aggressive scanning of unknown devices: legacy controllers have historically crashed under scanner probes, and an outage costs more than the finding is worth. (4) Request credentialed scans where credentials can be provided safely, since patch-level truth matters more than another remote probe on a fragile estate. (5) Document everything: scope, policy, timing, credentials, and a rollback/escalation contact. Justification: the policy trades a little coverage for operational safety, matches the risk profile of the estate, and makes every step reproducible and agreed — which is what scanning an operational environment responsibly looks like.',
          hint: 'The categories are safe, vuln and intrusive — and there is a human team on the other end.',
          explanation:
            'Scan policy is a risk decision, not a technical default. The safe-first, targeted-later pattern, credentialed checks where possible, and documented agreement with operations are the professional standard — and exactly the reasoning a report appendix should contain.'
        }
      ],
      references: [
        {
          title: 'Nmap Network Scanning — Chapter 9: Nmap Scripting Engine',
          url: 'https://nmap.org/book/nse.html',
          note: 'The official NSE chapter: categories, --script selection and script execution model.'
        },
        {
          title: 'Nmap — NSE script documentation portal',
          url: 'https://nmap.org/nsedoc/',
          note: 'Per-script official documentation, including category and risk classifications.'
        },
        {
          title: 'Greenbone — Official Documentation Portal',
          url: 'https://docs.greenbone.net/',
          note: 'OpenVAS/Greenbone architecture, feeds, scan configs and credentialed scanning.'
        },
        {
          title: 'Tenable — Official Documentation',
          url: 'https://docs.tenable.com/',
          note: 'Nessus policies, plugin families and credentialed scan configuration.'
        }
      ]
    },
    {
      id: 'n08-l03',
      moduleId: 'n08',
      title: 'Misconfigurations, Weak Authentication and Insecure Protocols',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n08-l01'],
      objectives: [
        'Recognize the misconfiguration classes that dominate real assessment findings',
        'Assess weak TLS configurations: legacy versions, weak ciphers, self-signed and mismatched certificates',
        'Explain why cleartext protocols remain findings even on internal networks',
        'Write findings that distinguish default credentials, anonymous access and missing patches as separate problems'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Breaches rarely begin with exotic zero-days. They begin with the password admin/admin on a console that should not be reachable, the FTP server that still allows anonymous login, the TLS stack that still negotiates a protocol version the industry retired years ago, and the patch that has been waiting for six months. Vulnerability assessment is mostly the craft of finding these — unglamorous, extremely common, and exactly what your enumeration inventory feeds.'
          },
          {
            type: 'p',
            text:
              'This lesson organizes the chaos into six classes: default credentials, anonymous access, cleartext protocols, weak TLS, exposed administration interfaces, and missing patches. Each class has a characteristic way of being discovered, a characteristic severity logic, and a characteristic fix — learning the classes turns a pile of scan output into a coherent narrative for a client.'
          },
          {
            type: 'p',
            text:
              'The theme underneath all six: security defaults erode silently. Nothing in a network announces that a console still has its factory password; the finding exists only because an assessor asked. That is the job.'
          }
        ],
        technical: [
          { type: 'h', text: 'Default credentials and anonymous access' },
          {
            type: 'p',
            text:
              'Appliances, printers, management cards and countless lab-era services ship with documented default accounts (admin/admin, the vendor-printed password on the label) or with anonymous modes on by design — FTP anonymous login, SNMP public, LDAP anonymous binds, database accounts with empty passwords. Discovery follows the enumeration module: fingerprints first, then a deliberate check. Severity logic: default credentials on anything administrative are critical because exploitation requires zero skill; anonymous read access on data services is typically high, and anonymous write access higher still. Testing credentials requires explicit client permission and coordination (lockouts!), which is why it is a scheduled step, never a reflex.'
          },
          { type: 'h', text: 'Cleartext protocols' },
          {
            type: 'p',
            text:
              'FTP, Telnet, plain HTTP, POP3 and IMAP without TLS, and SMTP without STARTTLS all carry credentials and content unencrypted. The classic counterargument is placement — "it is internal only" — and the classic answer is the sniffing lesson later in this course: one compromised host on the segment converts every cleartext login into a credential harvest. Findings here are about the protocol choice itself; the remediation is replacement (SFTP, SSH, HTTPS, TLS-wrapped mail) plus protocol suppression, not just awareness.'
          },
          { type: 'h', text: 'Weak TLS' },
          {
            type: 'p',
            text:
              'TLS weaknesses come in flavors: legacy protocol versions (SSLv3, TLS 1.0 and 1.1 — formally deprecated by RFC 8996), weak or legacy cipher suites (export-era and 3DES-class ciphers), broken trust (self-signed certificates, missing chains, expired certificates), and name mismatches that train users to click through warnings. nmap\u2019s ssl-enum-ciphers enumerates what the server actually offers per protocol version and rates each suite — configuration truth, not vendor claims. Each flavor gets its own finding, because the fixes differ (disable a version, reconfigure a cipher policy, fix certificate operations).'
          },
          {
            type: 'terminal',
            title: 'Enumerating a lab server\u2019s TLS configuration',
            lines: [
              '$ nmap --script ssl-enum-ciphers -p 443 10.0.0.20',
              'PORT    STATE SERVICE',
              '443/tcp open  https',
              '| ssl-enum-ciphers:',
              '|   TLSv1.0:',
              '|     ciphers:',
              '|       TLS_RSA_WITH_3DES_EDE_CBC_SHA (swe) - 112 bits',
              '|       TLS_RSA_WITH_AES_128_CBC_SHA (rsa) - 128 bits',
              '|   TLSv1.2:',
              '|     ciphers:',
              '|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A',
              '|       TLS_RSA_WITH_AES_256_CBC_SHA (rsa) - A',
              '|_  least strength: swe',
              '# Two findings in one output: TLS 1.0 still offered,',
              '# and a legacy 3DES suite on it.'
            ]
          },
          { type: 'h', text: 'Exposed administration interfaces and missing patches' },
          {
            type: 'p',
            text:
              'Admin consoles, database listeners and management cards belong on dedicated management networks; finding them on user VLANs (or worse, internet-facing) is a segmentation finding whose severity rides on what the interface controls. Missing patches close the set: the credentialed scan findings of the previous lesson — package versions lagging behind advisories, sometimes by years. Severity logic patches are contextual: a missing patch for an internet-facing service with a public exploit is critical, the same patch on an isolated host is routine maintenance. The classes interlock: an exposed console with default credentials and missing patches is one story told three ways, and reports should tell it once, well.'
          },
          {
            type: 'table',
            headers: ['Finding class', 'How it is discovered', 'Severity driver', 'Typical remediation'],
            rows: [
              ['Default credentials', 'Fingerprint, then a permitted credential test', 'What the account controls', 'Change defaults, inventory every device'],
              ['Anonymous access', 'Protocol-level checks (ftp-anon, anonymous LDAP bind)', 'Read/write and data sensitivity', 'Disable anonymous modes, require auth'],
              ['Cleartext protocols', 'Service inventory from enumeration', 'Credential and data exposure', 'Replace with encrypted equivalents, suppress old ones'],
              ['Weak TLS', 'ssl-enum-ciphers and certificate reads', 'Interception feasibility, trust erosion', 'Disable legacy versions/ciphers, fix certificates'],
              ['Exposed admin interfaces', 'Reachability analysis of console ports', 'What the plane controls, who can reach it', 'Management VLAN, ACLs, MFA'],
              ['Missing patches', 'Credentialed scans, package versions', 'Exposure of the affected service, exploit availability', 'Patch cycle plus exposure reduction']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These six classes will fill most of your first reports, and clients will fix most of them quickly — which is exactly why they matter: they are the findings that prove the program works. They are also the stepping stones for everything later in the course: default credentials and cleartext protocols feed the credential-attack module, exposed consoles feed the attack-path thinking, and every one of them is invisible without the enumeration habits of module n07.'
          },
          {
            type: 'list',
            items: [
              'Check for all six classes on every host in scope; they hide on the hosts nobody looks at',
              'Internal placement weakens, but does not erase, cleartext and default-credential findings — say why in the report',
              'TLS findings should be written per-flavor with the ssl-enum-ciphers output as evidence',
              'Correlate classes: one exposed, unpatched console with default credentials is a headline finding, not three footnotes'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Console and appliance banners suggesting factory configuration (vendor names in prompts, setup wizards never completed)',
              'ftp-anon success, SNMP public answers, LDAP anonymous binds, databases reachable without network restrictions',
              'TLS 1.0/1.1 offered, 3DES or export ciphers present, self-signed or expired certificates on production services',
              'Admin, database and management ports reachable from user segments — draw the reachability, do not assume it',
              'Package versions months or years behind vendor advisories on exposed services'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized, coordinated, lab-first',
            text:
              'Every check in this lesson touches someone\u2019s systems: TLS handshakes, anonymous logins, credential tests. Practice in your own lab until the commands are boring; on engagements, run only what the written scope covers, and coordinate credential testing and anything disruptive with the client in advance.'
          },
          {
            type: 'p',
            text:
              'A lab pass that touches four of the six classes against your own VMs:'
          },
          {
            type: 'terminal',
            title: 'Six classes in one lab session (four shown)',
            lines: [
              '# Anonymous access: FTP',
              '$ nmap -p 21 --script ftp-anon 10.0.0.20',
              '# Weak TLS: versions and ciphers',
              '$ nmap --script ssl-enum-ciphers -p 443 10.0.0.20',
              '# Cleartext protocols: who answers on the usual suspects',
              '$ nmap -sV -p 23,80,21,110 10.0.0.0/24',
              '# Exposed admin interface: the console ports',
              '$ nmap -sV -p 8080,8443,9090 10.0.0.0/24',
              '# Default credentials and missing patches follow from here,',
              '# with explicit permission and credentials respectively.'
            ]
          },
          {
            type: 'p',
            text:
              'Note what is absent: no login attempts, no exploit code. Four of the six classes are diagnosed by reading configuration the services volunteer — assessment before any active testing begins.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab appliance illustrates the interlock. Enumeration shows a web console on 8443 (self-signed certificate), ssl-enum-ciphers shows TLS 1.0 with 3DES still enabled, the console answers its default admin password (tested with the client\u2019s explicit written permission in the exercise), and the credentialed scan shows the OS is two years behind on patches. Written as four footnotes, the finding drowns; written once — "the appliance\u2019s entire control plane is administrable by anyone on the network, over weak cryptography, with factory credentials, running unpatched software" — it becomes the report\u2019s headline with a single, prioritized remediation plan. Same facts, different craft.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Severity in a sentence',
            text:
              'For misconfiguration findings, severity follows the answer to one question: what could an unskilled attacker do from where, with what is already true? If the answer starts with "log in", you are describing High or Critical.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Class it diagnoses'],
            rows: [
              ['nmap --script ftp-anon', 'Anonymous access on FTP'],
              ['nmap --script ssl-enum-ciphers', 'Weak TLS: versions, ciphers, strength ratings'],
              ['nmap -sV service inventory', 'Cleartext protocols and exposed admin ports'],
              ['OpenVAS / Nessus credentialed scans', 'Missing patches and local configuration'],
              ['Snmpwalk / ldapsearch', 'Anonymous access on SNMP and LDAP']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing default credentials without explicit permission — it is an authentication attempt, not enumeration, and it causes lockouts',
              'Dismissing cleartext protocols because they are internal; segment compromise inverts that argument instantly',
              'Writing one vague "weak TLS" finding instead of per-flavor findings with their own fixes',
              'Flagging every self-signed certificate as critical without checking where the service sits and what trusts it',
              'Reporting patch levels from banner versions instead of credentialed package checks'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the lab worst-case deliberately: one VM with anonymous FTP, TLS 1.0 with a weak suite, an admin console on 8443 with a default password you set yourself, and an old kernel. Run the four-check session, then write the single correlated finding with one remediation plan. Compare it with the four-separate-findings version — which would a busy administrator actually fix?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Six classes cover most real findings: default credentials, anonymous access, cleartext protocols, weak TLS, exposed admin planes, missing patches',
              'Cleartext and default-credential findings survive the "internal only" argument — one compromised segment host flips it',
              'Weak TLS decomposes into versions, ciphers and certificate trust — each with its own evidence and fix',
              'Reachability is part of severity: an exposed console is a segmentation finding before it is a password finding',
              'Correlate interlocking misconfigurations into one prioritized story instead of footnotes'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n08-l03-q1',
          type: 'mcq',
          prompt: 'ssl-enum-ciphers reports that a server offers TLSv1.0 with TLS_RSA_WITH_3DES_EDE_CBC_SHA and TLSv1.2 with modern AEAD suites. What is the correct set of findings?',
          options: [
            'One finding: weak TLS overall',
            'Two findings: legacy TLS 1.0 still enabled, and a legacy 3DES cipher suite offered on it',
            'No findings: TLS 1.2 with strong suites is available',
            'One finding: the server must support only TLS 1.3'
          ],
          answerIndex: 1,
          hint: 'The version and the cipher are separately configured things with separately configured fixes.',
          explanation:
            'Protocol version policy and cipher-suite policy are distinct configurations, so each produces its own finding with its own remediation (disable TLS 1.0; remove 3DES from the suite list). The strong TLS 1.2 suites are the good news that makes the legacy leftovers clearly fixable, not a defense of them.'
        },
        {
          id: 'n08-l03-q2',
          type: 'truefalse',
          prompt: 'A cleartext Telnet service on a segregated internal VLAN is acceptable if the VLAN contains only trusted workstations.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What has to be true for this argument to survive the first compromised host?',
          explanation:
            'The argument requires the VLAN to stay uncompromised forever — but a single compromised workstation on that VLAN captures every subsequent Telnet credential. Defense in depth says protocols themselves should protect credentials, so the finding stands with reduced (not zero) severity, and the fix is replacement with SSH.'
        },
        {
          id: 'n08-l03-q3',
          type: 'short',
          prompt: 'Why are default credentials on an administrative interface usually rated Critical, while a missing patch with a public exploit on the same interface might rate lower?',
          modelAnswer:
            'Severity follows exploitation cost and certainty. A default credential is a certainty: exploitation requires no skill, no tooling beyond a login form, and no dependence on versions or mitigations — the attacker simply logs in with what the vendor printed. A missing patch describes a weakness that still has to be exploited successfully, which depends on the specific version matching, exposure, and mitigations; with a public exploit the gap narrows, but it remains conditional. That is also why patch findings are graded by exposure and exploit availability, while credential findings start at the top.',
          hint: 'One is conditional exploitation; the other is logging in.',
          explanation:
            'The comparison trains the severity instinct: certainty of exploitation and skill required move ratings as much as raw impact does. It also shows why the same interface can carry findings of different classes at different severities — the correlated writeup is the professional response.'
        },
        {
          id: 'n08-l03-q4',
          type: 'scenario',
          prompt:
            'During an authorized assessment you find a management console on 8443, reachable from the user VLAN, using a self-signed certificate, running a version two years behind current. The client says: "It is internal and nobody knows the URL." Write the finding as you would in the report.',
          modelAnswer:
            'Finding: Management console exposed to user networks with weak transport and outdated software. Evidence: service fingerprint on 8443 (name and version), certificate details showing a self-signed issuer, and the reachability test from a standard user VLAN host. Impact: every host on the user VLAN can reach an interface that controls [the underlying system]; the self-signed certificate prevents clients from authenticating the server, so interception is undetectable and users are trained to accept warnings; the outdated version means published vulnerabilities in the console software remain unpatched. "Nobody knows the URL" is not a control — the port is discoverable by any scan, and the console is reachable without any authentication gate at the network layer. Remediation: move the console to the dedicated management network (or add strict ACLs), enroll it in the internal PKI to replace the self-signed certificate, and update it to a supported version. Priority: High — the network exposure and the administrative power of the interface outweigh the individual weaknesses.',
          hint: 'Evidence, impact (answer the client\u2019s claim directly), remediation, priority.',
          explanation:
            'The model answer answers the client\u2019s objection with a control argument (obscurity is not a control), separates the three weaknesses, and still writes one prioritized finding. That structure — claim, evidence, impact, remediation — is the reporting craft the next lesson formalizes.'
        }
      ],
      references: [
        {
          title: 'RFC 8996 — Deprecating TLS 1.0 and TLS 1.1',
          url: 'https://www.rfc-editor.org/rfc/rfc8996.html',
          note: 'The formal standard that makes legacy TLS versions a finding by definition.'
        },
        {
          title: 'RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3',
          url: 'https://www.rfc-editor.org/rfc/rfc8446.html',
          note: 'The modern TLS target configuration — what remediated servers should offer.'
        },
        {
          title: 'OWASP — Transport Layer Security Cheat Sheet',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html',
          note: 'Practical cipher and version guidance used by defenders and assessors alike.'
        },
        {
          title: 'Nmap NSE — ssl-enum-ciphers script',
          url: 'https://nmap.org/nsedoc/scripts/ssl-enum-ciphers.html',
          note: 'Official documentation for the TLS version and cipher enumeration script.'
        }
      ]
    },
    {
      id: 'n08-l04',
      moduleId: 'n08',
      title: 'Manual Validation, Searchsploit and Reporting Findings',
      difficulty: 'Intermediate',
      minutes: 16,
      prerequisites: ['n08-l02'],
      objectives: [
        'Validate scanner claims by hand without running destructive exploit code',
        'Use searchsploit to map confirmed versions to published public exploits',
        'Write a finding with severity, evidence, impact, reproduction and remediation',
        'Decide when a finding is ready for a report — and when it must stay a lead'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Scanner output is a hypothesis generator. The assessor\u2019s job is to convert hypotheses into findings — statements a client can verify, reproduce and act on — and to quietly discard the rest. Between those two states lies validation: independent confirmation that the weakness is real, reachable and exploitable in principle, obtained with the least invasive method that proves the point.'
          },
          {
            type: 'p',
            text:
              'Validation has a public-research counterpart: after confirming what software and version a service runs, the SearchSploit tool queries the Exploit-DB archive — decades of public exploits and papers — from your own terminal. The workflow is deliberately restrained: search, read the entry, understand what it targets, and only then decide whether a lab reproduction is warranted. Running exploit code against a client system because a database says it might work is how outages and legal trouble happen; running it in your own lab first is how competence happens.'
          },
          {
            type: 'p',
            text:
              'The final conversion is writing. A finding is not done when you believe it; it is done when a busy administrator can read it, agree with it, reproduce it if they doubt you, and fix it. That structure — severity, evidence, impact, reproduction, remediation — is the deliverable of the entire vulnerability assessment module.'
          }
        ],
        technical: [
          { type: 'h', text: 'Why you never trust scanner output blindly' },
          {
            type: 'p',
            text:
              'Three failure directions, all seen in the previous lessons: version-only checks that cannot see backports (false positive), intermediaries answering probes (false positive), and silent coverage gaps from failed credentials or firewalling (false negative). Validation answers with independent evidence: re-derive the version claim from the service itself (banner, protocol behavior, or — with permission — the package database), confirm the exposure yourself (from where, on which port), and check the specific claim of the plugin. The key discipline: choose the least invasive proof. A banner is weaker evidence than a package listing but far safer than exploit code; if the banner and the plugin agree and the exposure is confirmed, that is usually enough to report a vulnerability as present-but-unverified-in-depth, with the caveat stated.'
          },
          { type: 'h', text: 'The searchsploit workflow' },
          {
            type: 'p',
            text:
              'SearchSploit ships with Kali and queries the local copy of the Exploit-DB archive. The workflow: search by product and version terms, narrow with excludes, inspect titles and paths, copy an entry locally with -m if (and only if) you intend to study it in a lab, and read the code before ever running it. Reading matters twice over: it tells you whether the exploit matches the actual configuration (many public exploits assume unpatched defaults), and it tells you what the exploit does — some public code is destructive or worse than described.'
          },
          {
            type: 'terminal',
            title: 'A searchsploit session on a lab finding',
            lines: [
              '$ searchsploit vsftpd 2.3.4',
              '----------------------------------------------- -------------------------',
              ' Exploit Title                                 |  Path',
              '----------------------------------------------- -------------------------',
              'vsFTPd 2.3.4 - Backdoor Command Execution      | unix/remote/17491.rb',
              'vsftpd 2.3.4 - Backdoor Command Execution (Me) | unix/remote/49719.py',
              '----------------------------------------------- -------------------------',
              'Shellcodes: No Results',
              '$ searchsploit -j vsftpd 2.3.4 | head -4',
              '# -j outputs JSON — handy for scripted workflows.',
              '$ searchsploit apache 2.4 | grep -i traversal | head -3',
              'Apache HTTP Server 2.4.49 - Path Traversal & RCE | multiple/remote/50383.py',
              'Apache HTTP Server 2.4.50 - Path Traversal & RCE | multiple/remote/50406.sh'
            ]
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Exploit code runs in labs, not on clients',
            text:
              'Copying and studying public exploits is fine; executing them against systems you are not authorized to test is a crime, and executing them against authorized systems without agreed safeguards still causes outages. The professional pattern is: validate with passive evidence, reproduce in your own deliberately vulnerable lab, report. On engagements, exploitation belongs to later phases with explicit written scope.'
          },
          { type: 'h', text: 'From raw output to a written finding' },
          {
            type: 'table',
            headers: ['Section', 'Question it answers', 'Example line'],
            rows: [
              ['Finding title', 'What is wrong, where, in one line', 'vsFTPd 2.3.4 with backdoor vulnerability on 10.0.0.20 (TCP 21)'],
              ['Severity', 'How bad, with the reasoning visible', 'Critical (CVSS 10.0 for CVE-2011-2523); internet-reachable FTP service'],
              ['Evidence', 'What did you actually observe?', 'Banner: 220 (vsFTPd 2.3.4); NSE behavioral check returned VULNERABLE'],
              ['Impact', 'What could happen, business-first', 'Unauthenticated remote code execution as root on the FTP host'],
              ['Reproduction', 'Can the reader verify it?', 'Conditions of scan; the check commands; lab reference'],
              ['Remediation', 'What to do, in priority order', 'Immediately take the service offline; rebuild; deploy supported vsftpd']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This lesson is the difference between running tools and being an assessor. Clients dispute findings that lack evidence; managers ignore findings that lack impact statements; administrators skip findings whose remediation is a shrug. Validation, the searchsploit workflow and structured writing are the three habits that make your work land — and they are also the habits that keep you inside legal boundaries, because each one slows down the moment where enthusiasm outruns authorization.'
          },
          {
            type: 'list',
            items: [
              'Validate with the least invasive sufficient proof; state clearly what was and was not verified',
              'Search public archives after validation, not instead of it — the sequence matters',
              'Every finding names its conditions: date, scope, policy, credentials — no conditions, no reproduction, no credibility',
              'Discard gracefully: a false positive documented as such is a sign of quality, not an admission of failure'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Version claims that need the backport check (distribution-patched software keeping old banners)',
              'Behavioral plugin results that can be re-confirmed with a single safe command',
              'Exposure questions the scanner cannot answer: which networks reach the service, from the client\u2019s own architecture',
              'Public exploit entries whose descriptions do not match the observed configuration — a common false-negative source',
              'Findings in your own draft report lacking one of the six sections — they are not done'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'The lab is the proving ground',
            text:
              'Reproduce every interesting weakness on deliberately vulnerable lab VMs you own (classics like vsftpd 2.3.4 exist precisely for this). On authorized engagements, follow the written scope: validation commands only, unless the contract explicitly includes exploitation with agreed safeguards. When in doubt, ask — authorization you cannot point to in writing is not authorization.'
          },
          {
            type: 'p',
            text:
              'The full conversion pipeline on a lab target, from scanner claim to report-ready finding:'
          },
          {
            type: 'terminal',
            title: 'Validate, research, write',
            lines: [
              '# 1. The scanner claim (from the previous lesson):',
              '#    ftp-vsftpd-backdoor -> VULNERABLE, CVE-2011-2523',
              '# 2. Independent confirmation of the version claim:',
              '$ nc -v 10.0.0.20 21',
              'Connection to 10.0.0.20 21 port [tcp/ftp] succeeded!',
              '220 (vsFTPd 2.3.4)',
              '# 3. Public archive lookup:',
              '$ searchsploit vsftpd 2.3.4',
              '# 4. Lab reproduction on the deliberately vulnerable VM (owned).',
              '# 5. Write the finding with all six sections. Done means done.'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two assessors, one scanner report. The first pastes the plugin output into the report with the scanner\u2019s severity; the client\u2019s engineer checks the FTP server, finds the distribution package is a backported build with the version string unchanged, and the finding collapses — along with the assessor\u2019s credibility. The second runs the pipeline: banner capture, package verification with the client\u2019s permission, the searchsploit pass, a lab reproduction against an owned vulnerable VM, and a six-section finding whose severity is argued from evidence. When the client pushes back, the second assessor produces the banner, the check output and the reproduction conditions; the conversation ends in a patch. Same scanner, same target — the craft is the difference.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'False positives are part of the job',
            text:
              'Documenting a disproven lead ("scanner flagged X; banner and package check show distribution backport; not a finding") builds trust. Clients learn that what survives your validation is real.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in validation and reporting'],
            rows: [
              ['searchsploit', 'Local search over the Exploit-DB archive; -j for JSON, -m to copy entries for lab study'],
              ['nc / nmap', 'Independent re-derivation of version and behavior claims'],
              ['Package queries (with permission)', 'The ground truth that settles backport questions'],
              ['Your lab VMs', 'Where reproduction happens — deliberately vulnerable images you own'],
              ['Report template', 'The six-section structure: title, severity, evidence, impact, reproduction, remediation']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running public exploit code against client systems to "verify" a finding — that is exploitation, and it needs explicit scope',
              'Reporting scanner severities verbatim with no validation and no context',
              'Quoting version banners as proof while ignoring distribution backporting',
              'Omitting scan conditions, which makes findings unreproducible and undisputable',
              'Leaving false positives undocumented — silent dropped leads look identical to missed ones'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take one finding from your lab scanner output. Run the full pipeline: independent validation with a safe command, a searchsploit pass, and (if the weakness is a classic) a reproduction on a deliberately vulnerable VM you own. Write the six-section finding, then exchange reports with a peer and attack each other\u2019s evidence — the weakest section is the one that needs work.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Scanner output is a lead; validation with the least invasive sufficient proof turns it into a finding',
              'Backports and proxies create false positives; blind spots create false negatives — each has a checking habit',
              'searchsploit comes after validation: search, read the entry, understand the code, reproduce in your lab only',
              'A finding is complete with title, severity, evidence, impact, reproduction and remediation — all six, every time',
              'Authorization discipline is structural: validate passively, reproduce on owned systems, exploit only with written scope'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n08-l04-q1',
          type: 'mcq',
          prompt: 'A scanner claims a service runs vsftpd 2.3.4. Which action is the correct first step of validation?',
          options: [
            'Run the public 2.3.4 backdoor exploit against the service to confirm',
            'Independently re-derive the version claim with a safe command such as a banner grab, then check whether the package could be a backported build',
            'Accept the claim and write the finding with the scanner\u2019s severity',
            'Mark the finding Critical and move to the next host'
          ],
          answerIndex: 1,
          hint: 'What is the least invasive action that independently confirms or challenges the claim?',
          explanation:
            'Validation starts with independent, non-destructive evidence: reproduce the version claim yourself and consider the backport possibility before anything else. Exploitation is a later, separately authorized activity, and unexamined scanner severities are exactly what this lesson trains you to avoid.'
        },
        {
          id: 'n08-l04-q2',
          type: 'truefalse',
          prompt: 'If SearchSploit returns an entry for the exact software version you enumerated, the vulnerability is confirmed on the target.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Does a public exploit existing mean it applies to this deployment?',
          explanation:
            'A database entry proves the weakness existed in some configuration of that version — not that this deployment is affected or reachable. Many public exploits assume unpatched defaults; backports, hardening and network exposure can each break the chain. The entry informs the validation; it does not replace it.'
        },
        {
          id: 'n08-l04-q3',
          type: 'short',
          prompt: 'List the six sections of a complete finding and say in one sentence what each is for.',
          modelAnswer:
            'Title — one line naming what is wrong and where. Severity — how bad, with the reasoning (CVSS where applicable, exposure context always). Evidence — the verbatim observations: banners, check output, timestamps. Impact — what could happen to the business if exploited, written for non-specialists. Reproduction — the conditions and commands that let a skeptical reader verify the finding. Remediation — the concrete, prioritized fix. Together they make a finding verifiable, actionable and defensible.',
          hint: 'Think about what a skeptical administrator needs to believe you and then fix it.',
          explanation:
            'The six sections are a checklist against the two classic failure modes: findings nobody believes (missing evidence and reproduction) and findings nobody acts on (missing impact and remediation). Reports built this way survive client review.'
        },
        {
          id: 'n08-l04-q4',
          type: 'scenario',
          prompt:
            'Banner grabbing shows vsftpd 2.3.4 on an authorized lab target, and your NSE behavioral check returned VULNERABLE for CVE-2011-2523. Describe your next steps in order, and for each state why it comes at that point in the workflow.',
          modelAnswer:
            'Step 1 — record the evidence verbatim (banner line, check output, target, timestamp): findings are built from captured facts, and later steps need them. Step 2 — confirm exposure in context (which networks can reach TCP 21, per the lab\u2019s architecture): severity is a function of reachability, so this belongs before any severity argument. Step 3 — searchsploit for the version to understand what is publicly known about 2.3.4: research informs impact language and the remediation urgency, but comes after validation so it cannot substitute for it. Step 4 — reproduce on the deliberately vulnerable lab VM I own: hands-on understanding of the impact, kept off shared and third-party systems. Step 5 — write the six-section finding with Critical severity argued from the behavioral check, exposure and public documentation. Order rationale: evidence first, context second, research third, hands-on fourth, writing last — each step narrows uncertainty and none of them requires attacking anything outside the lab.',
          hint: 'Evidence, exposure, research, lab reproduction, writing. Justify the sequence, not just the steps.',
          explanation:
            'The sequence embodies the module\u2019s thesis: tools generate leads in any order, but professionals process them in an order that keeps every claim verified, contextual and legally clean. The scenario is the capstone because it exercises the whole chain, not any single tool.'
        }
      ],
      references: [
        {
          title: 'Exploit-DB — SearchSploit documentation',
          url: 'https://www.exploit-db.com/searchsploit',
          note: 'Official usage reference for flags, filters and JSON output.'
        },
        {
          title: 'Nmap Reference Guide — Service and Version Detection',
          url: 'https://nmap.org/book/man-version-detection.html',
          note: 'The version-detection mechanics behind the claims you are validating.'
        },
        {
          title: 'OWASP — Web Security Testing Guide',
          url: 'https://owasp.org/www-project-web-security-testing-guide/',
          note: 'Methodology chapters on reporting and on validating findings during testing.'
        },
        {
          title: 'FIRST — CVSS v3.1 Specification Document',
          url: 'https://www.first.org/cvss/v3.1/specification-document',
          note: 'The scoring reference for the severity section of your findings.'
        }
      ]
    }
  ]
};
