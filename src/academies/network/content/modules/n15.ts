import type { Module } from '../../../../types';

// LEVEL 9 — PROFESSIONAL METHODOLOGY · Module 15: Professional Network Pentest Methodology
// Original curriculum content synthesized from public official documentation:
// the Penetration Testing Execution Standard (pentest-standard.org), MITRE
// ATT&CK, the FIRST CVSS specification and OpenSSH manuals. All prose is
// original; reference links point to the official sources used for study.
// CAPSTONE MODULE: every technique in modules 1-14 is practiced here strictly
// inside written authorization. Scope, rules of engagement and signed approval
// precede every example — nothing in this module is legal advice.

export const n15: Module = {
  id: 'n15',
  title: 'Professional Network Pentest Methodology',
  level: 9,
  description:
    'The capstone: running a professional network engagement end to end. Scope documents and rules of engagement, the full sixteen-phase workflow from reconnaissance to retesting, evidence collection discipline, risk analysis tied to business context, report anatomy and remediation writing — the operating system of a professional tester, built on written authorization at every step.',
  outcomes: [
    'Draft scope documents and rules of engagement that make testing defensible',
    'Run the sixteen-phase engagement workflow from recon to retesting with entry and exit criteria',
    'Collect evidence that survives review and reason about likelihood, impact and business context',
    'Write findings and remediation guidance people can actually execute, and close the loop with retests'
  ],
  lessons: [
    {
      id: 'n15-l01',
      moduleId: 'n15',
      title: 'Scope, Rules of Engagement and Authorization',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n08-l04'],
      objectives: [
        'List what a scope document must contain and where ambiguity hides',
        'Draft rules of engagement: allowed techniques, windows, contacts and escalation',
        'Explain the legal instruments around an engagement and who must sign',
        'Handle out-of-scope findings responsibly'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Authorization is the line between a penetration test and a crime, and everything in this curriculum lives on the authorized side of that line. Scope says where you may act; rules of engagement (ROE) say how. Both are written documents, signed before the first packet leaves your machine — not after, and not verbally.'
          },
          {
            type: 'p',
            text:
              'Good scope and ROE are engineering artifacts, not paperwork rituals. They decide which techniques are available (a no-DoS clause means no stress tests, period), which targets exist at all (a CIDR list, not a mood), who answers the phone at 02:00 when a fragile device falls over, and what you must restore before you leave. Every technique in modules 1 through 14 is available to you only inside these documents.'
          },
          {
            type: 'p',
            text:
              'The skill this lesson builds is asking the uncomfortable questions early: what happens if I find what looks like an active intrusion? what if the scope sheet is wrong? what if I see something out of scope that is on fire? The answers go in writing, before testing — because the middle of an engagement is exactly the wrong time to negotiate your own authorization.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The scope document'
          },
          {
            type: 'list',
            items: [
              'Targets: CIDR ranges, host lists, domain names, cloud account identifiers, physical sites — with versions and dates',
              'Vantage points: where the tester works from (an external IP, a VPN slot, an on-site segment)',
              'Explicit exclusions: production-critical systems, third-party SaaS, shared infrastructure, fragile devices (medical, industrial, building management)',
              'Time bounds: start and end dates, allowed hours, blackout periods',
              'Named client contacts with response expectations'
            ]
          },
          {
            type: 'h',
            text: 'Rules of engagement'
          },
          {
            type: 'list',
            items: [
              'Allowed techniques and intensities: for example, scanning yes; exploitation only against named systems; no denial of service, no phishing, no social engineering',
              'Escalation path: what to do when something looks like an active intrusion (stop, preserve, call)',
              'Emergency contacts: who answers at night when a legacy device crashes',
              'Evidence handling: storage location, encryption, retention and destruction dates',
              'Cleanup obligations: tunnels, agents, test accounts — what you must remove and prove you removed'
            ]
          },
          {
            type: 'h',
            text: 'The legal instruments'
          },
          {
            type: 'p',
            text:
              'Around the documents sit the agreements: an engagement agreement or statement of work defining deliverables and liability, a nondisclosure agreement protecting findings, and an authorization letter — sometimes called the get-out-of-jail letter — naming the tester, the targets and the dates, carried during on-site work. Targets hosted by third parties or cloud providers may carry notification duties: the provider, not just the client, may need to know before testing touches their infrastructure.'
          },
          {
            type: 'h',
            text: 'Out-of-scope findings'
          },
          {
            type: 'p',
            text:
              'Sooner or later you will see something outside the scope that is interesting, or worse, actively compromised. The procedure is fixed: stop testing it immediately, record what was passively observed (timestamp, method, why you stopped), and report it through the engagement contact — or the vendor\u2019s security contact for third-party systems. Never probe further to "confirm" it. Curiosity does not write scope, and the discipline of stopping is itself a professional credential.'
          },
          {
            type: 'h',
            text: 'When scope changes'
          },
          {
            type: 'p',
            text:
              'Mid-test discoveries ("that /16 actually belongs to us too") are handled by written amendment, not by enthusiasm: a change request, an approval, an updated target list — the same rigor as the original. A hallway approval is worth exactly nothing the day something breaks.'
          },
          {
            type: 'code',
            lang: 'text',
            title: 'Draft ROE one-pager — LABCORP (fictional exercise)',
            code:
              'ENGAGEMENT: LABCORP internal network assessment (fictional exercise)\nSCOPE:   10.0.10.0/24, 10.0.20.0/24, 10.0.30.0/24 (workstation, app, DB VLANs)\nVANTAGE: workstation VLAN, on-site, test laptop LK-7\nWINDOW:  2024-06-10 to 2024-06-14, 08:00-18:00 local; no weekend work\nALLOWED: discovery, enumeration, vulnerability validation; exploitation\n         against APP01/FILE01/DB01 only; credential attacks require\n         written approval per technique; no DoS, no phishing.\nFORBIDDEN: production database writes; lockout-inducing testing; any\n         activity against 10.0.99.0/24 (building management) whatsoever.\nCONTACTS: primary J. Rivera (SOC lead, on-call), secondary ops desk;\n         emergency line +1-555-0119, 24/7.\nESCALATION: suspected live intrusion - stop testing, preserve evidence,\n         call the primary contact within 15 minutes.\nCLEANUP: remove all tooling, tunnels and test accounts by the final day;\n         provide the change list as a report appendix.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Not legal advice — an operational habit',
            text:
              'Engagement agreements vary by jurisdiction and this lesson teaches the operational habit, not the law: if it is not written and signed, it is not authorized. Real engagements need real legal review on both sides.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Scope and ROE protect both directions: they protect the client (intensity limits, outage procedures, a paper trail when something goes wrong) and they protect you (authorization you can produce, expectations you did not invent). Professionals are recognized by their document discipline as much as their packet skills — and the documents are also where client expectations get aligned before a technique is judged "missing" from the report.'
          },
          {
            type: 'list',
            items: [
              'Every technique choice in modules 1-14 traces back to an ROE clause',
              'The escalation procedure is what keeps a suspected-intrusion discovery from becoming a disaster',
              'Cleanup obligations are written at the start, when everyone is calm',
              'Aligned expectations are cheaper than a disputed report'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Scope ambiguities: shared hosting, CDN-fronted applications, cloud accounts in different tenants, "and related systems" phrasing',
              'Missing signatures or expired dates on the authorization letter',
              'Third-party-hosted targets whose providers were never notified',
              'An ROE that forbids the very techniques the report will be judged on — misaligned expectations',
              'Fragile or safety-relevant devices (printers, HVAC, medical) hiding inside "all of 10/8"'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'This lesson\u2019s exercise is drafting. For the fictional LABCORP network (three VLANs, one fragile building-management subnet, one cloud-hosted app), write the one-page ROE skeleton shown above. Then attack your own draft: which sentence would you argue with if you were the client? Which technique from this curriculum is now unavailable — and is that acceptable for the engagement\u2019s stated goal? Rewriting until the answers are yes is the skill.'
          },
          {
            type: 'p',
            text:
              'Practice the out-of-scope drill verbally too: a colleague names a juicy target, and your only allowed responses are stop, record, report. It sounds trivial; under adrenaline in a real engagement it is not, and the reflex is built in rehearsal.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Mid-test scenario: your discovery pass finds 10.0.40.0/24 — undocumented, unmonitored, running old Windows hosts. The ROE lists three VLANs only. Correct behavior: stop at observation, add a note to the evidence log (timestamp, passive method, why you stopped), inform the primary contact, and request a written scope amendment. Two outcomes are professional: approved (continue into the new CIDR) or declined (document and exclude). Probing first and asking forgiveness is neither — it is unauthorized access with extra steps.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['Document templates', 'Scope and ROE skeletons you revise per engagement'],
              ['Version control', 'Signed PDFs and amendments tracked with dates'],
              ['The engagement notebook', 'Contact list, windows and change log carried during testing'],
              ['The phone', 'The most important tool when something unexpected happens']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Starting on a verbal "you are good to go" while the paper is still in legal review',
              'Testing adjacent targets because they "are obviously the same company"',
              'Assuming cloud console access implies the right to attack the hosts behind it',
              'Silently probing an out-of-scope host "just to check one thing"',
              'Writing the ROE after the techniques are chosen, so the plan drives the rules instead of the reverse',
              'Not carrying the authorization letter during on-site work'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Draft a scope and ROE for your own home lab: targets (your VM range), window (this weekend), allowed techniques (everything except DoS against your router), contacts (yourself), cleanup (the tunnel inventory from module 13). The exercise sounds silly and is not: writing constraints down and then honoring them for one full lab session builds the reflex that keeps you safe on someone else\u2019s network.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Scope defines where, ROE defines how — both written and signed before packet one',
              'Allowed techniques, windows, contacts, escalation and cleanup are the ROE core',
              'Out-of-scope findings: stop, record, report — never probe further',
              'Scope changes are written amendments, not hallway approvals',
              'If it is not written, it is not authorized'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n15-l01-q1',
          type: 'mcq',
          prompt: 'During an authorized test you discover an undocumented, clearly vulnerable subnet. What is the correct first action?',
          options: [
            'Scan it quickly to confirm the severity before reporting',
            'Add it to your notes as observed and notify the engagement contact for a scope decision',
            'Exploit one host so the finding is reportable',
            'Ignore it entirely and never mention it'
          ],
          answerIndex: 1,
          hint: 'What does the ROE say about anything not listed?',
          explanation:
            'Observation may be recorded; action requires written scope. Notification plus a written amendment (or exclusion) is the professional path. Quick probes "to confirm" are how testers end up outside their authorization.'
        },
        {
          id: 'n15-l01-q2',
          type: 'truefalse',
          prompt: 'A client\u2019s senior project manager can verbally expand your scope mid-test.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who signs, and on what instrument?',
          explanation:
            'Scope changes are written amendments signed by whoever holds signing authority in the engagement agreement — not hallway approvals, however senior. Verbal expansions leave both sides unprotected the moment something goes wrong.'
        },
        {
          id: 'n15-l01-q3',
          type: 'short',
          prompt: 'Name five items a rules-of-engagement document should contain.',
          modelAnswer:
            'Allowed and disallowed techniques with intensities; time windows and blackout periods; client contacts with response expectations and an emergency number; the escalation procedure (including suspected-intrusion handling); and evidence handling plus cleanup obligations. A target list reference and the vantage description anchor the first two items.',
          hint: 'Think about everything that went wrong in the scenario examples.',
          explanation:
            'Each item exists because its absence caused a famous problem: intensity limits prevent outages, contacts prevent dead air, escalation prevents intrusions being disturbed, cleanup prevents persistent artifacts. The ROE is institutional memory in one page.'
        },
        {
          id: 'n15-l01-q4',
          type: 'scenario',
          prompt:
            'Your ROE forbids DoS and lockout-inducing testing. Mid-test, the client asks you to "test the VPN gateway hard, like a real attacker, this afternoon". The gateway is in scope. What do you do?',
          modelAnswer:
            'Do not improvise an intensification. Check what "hard" means (password spraying, load-based denial) and recognize that it is almost certainly not covered by the current ROE; explain which requested techniques are unauthorized today; offer a written amendment for the specific techniques with agreed limits, monitoring and a rollback plan — and proceed only when it is signed. Document the request and the outcome either way.',
          hint: 'The request is reasonable — but is it authorized?',
          explanation:
            'Client enthusiasm does not amend the ROE. The professional move translates the request into a signed, bounded change, which protects the client\u2019s systems, your authorization, and the relationship — all three at once.'
        }
      ],
      references: [
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'The standard\u2019s pre-engagement section: scope, ROE and paperwork expectations.'
        },
        {
          title: 'MITRE ATT&CK TA0043 — Reconnaissance (tactic)',
          url: 'https://attack.mitre.org/tactics/TA0043/',
          note: 'Context for scoping discussions about what reconnaissance may include.'
        },
        {
          title: 'Nmap Network Scanning book',
          url: 'https://nmap.org/book/',
          note: 'Scan intensities referenced when writing allowed-technique clauses.'
        }
      ]
    },
    {
      id: 'n15-l02',
      moduleId: 'n15',
      title: 'The Engagement Workflow: Recon to Post-Exploitation',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n15-l01'],
      objectives: [
        'Name the sixteen phases and their entry and exit criteria',
        'Execute the workflow on a lab engagement in order, without skipped validation',
        'Keep phase-appropriate artifacts (notes, evidence, matrices) at each step',
        'Recognize the failure mode of each phase when rushed'
      ],
      diagram: 'net-pentest-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Methodology is what remains when tools change: a sixteen-phase pipeline from scope to retesting that turns improvised hacking into a repeatable professional process. Each phase has a job, entry criteria (what must be true to start) and exit criteria (what must exist to move on). The pipeline is not bureaucracy — it is the checklist that catches the questions you would otherwise answer from memory.'
          },
          {
            type: 'p',
            text:
              'The phases the movies skip are the ones that make the report: validation (is the finding real?), evidence collection (can it be reproduced?), risk analysis (does it matter HERE?) and retesting (did the fix work?). Exploitation is one phase among sixteen, and on a well-run engagement it is rarely the longest.'
          },
          {
            type: 'p',
            text:
              'The workflow is also a communication schedule: phase boundaries are where you update the client, escalate, or amend scope. A tester who cannot say which phase they are in cannot be steered — and a client who never knows what happens next stops trusting the process.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-pentest-pipeline',
            caption: 'The sixteen-phase engagement pipeline — planning, execution, and the reporting loop.'
          },
          {
            type: 'table',
            headers: ['Phase', 'Goal', 'Exit artifact'],
            rows: [
              ['1. Scope', 'Agree targets and vantage points', 'Signed scope document'],
              ['2. Rules of engagement', 'Agree techniques, windows, contacts', 'Signed ROE'],
              ['3. Reconnaissance', 'External footprint: domains, ranges, exposed services', 'Recon notes and asset list'],
              ['4. Discovery', 'Live hosts and open ports inside scope', 'Discovery matrix'],
              ['5. Enumeration', 'Per-service deep questions answered', 'Service inventory'],
              ['6. Vulnerability assessment', 'Map weaknesses to each service', 'Vulnerability list with references'],
              ['7. Validation', 'Prove findings real, non-destructively', 'Validated list with evidence'],
              ['8. Exploitation (in scope)', 'Demonstrate impact where the ROE allows', 'Exploit notes, pre-state backup'],
              ['9. Post-exploitation concepts', 'Document what access would enable', 'Bounded impact narrative'],
              ['10. Internal enumeration', 'From any foothold: repeat phases 4-6 inside', 'Internal matrix and inventory'],
              ['11. Lateral movement concepts', 'Validated paths between systems', 'Attack path graph'],
              ['12. Evidence collection', 'Every claim has artifacts', 'Evidence log with hashes'],
              ['13. Risk analysis', 'Likelihood and impact in business context', 'Rated findings'],
              ['14. Remediation', 'Actionable, ordered fixes per finding', 'Remediation plan'],
              ['15. Reporting', 'Executive summary, findings, appendices', 'Delivered report'],
              ['16. Retesting', 'Verify fixes after the remediation window', 'Retest addendum']
            ]
          },
          {
            type: 'p',
            text:
              'Note the loop shape: internal enumeration (phases 10-11) re-enters the discovery and enumeration logic from a new vantage, and reporting (15) feeds retesting (16), which re-enters validation (7). The pipeline is mostly linear with two loops — and the loops are where testers who skip them lose findings.'
          },
          {
            type: 'h',
            text: 'Entry and exit discipline'
          },
          {
            type: 'p',
            text:
              'Skipping ahead is the classic failure: exploiting during "discovery" because a juicy banner appeared. The discipline is cheap — a phase log, one line per transition (time, phase, justification) — and it doubles as report material. Exit artifacts force the question "is this actually done?" exactly when the calendar argues for shortcuts.'
          },
          {
            type: 'terminal',
            title: 'A phase log that fits in a notes file',
            lines: [
              '# engagement phase log (excerpt)',
              '2024-06-10T08:12Z phase=3  recon      started (external view, passive first)',
              '2024-06-10T09:40Z phase=4  discovery  sweep 10.0.10.0/24 done: 41 alive',
              '2024-06-11T10:05Z phase=7  validation F-003 confirmed non-destructively',
              '2024-06-11T11:22Z phase=8  exploit    APP01 deserialization demo, snapshot taken',
              '2024-06-11T11:31Z phase=9  postex     access documented: DB creds reachable',
              '2024-06-12T08:01Z phase=10 internal   enumeration from APP01 vantage'
            ]
          },
          {
            type: 'h',
            text: 'Exploitation and post-exploitation, bounded'
          },
          {
            type: 'p',
            text:
              'Exploitation happens only after validation, only against in-scope targets, and only with ROE-approved techniques — with a pre-state backup (a snapshot, a config copy) taken before anything changes. Post-exploitation in this methodology means documenting what the access enables: which data is reachable, which trust edges are open, what a real actor would do next. Read a proof, not the whole database; snapshot the access, do not wander. Cleanup obligations run to the very end of the engagement.'
          },
          {
            type: 'h',
            text: 'Running it in practice'
          },
          {
            type: 'p',
            text:
              'Time-box phases to engagement size: on a five-day internal test, roughly day 1 for phases 1-4, days 2-3 for phases 5-8, days 3-4 for phases 9-12, day 4-5 for phases 13-15, and a scheduled retest after the remediation window. Keep the phase log open in tmux, and at each boundary send the client a two-line status. The compressed lab version below exercises the whole spine in one sitting:'
          },
          {
            type: 'terminal',
            title: 'The whole loop, compressed (lab)',
            lines: [
              '$ cat scope.txt roe.txt                    # phases 1-2 (drafts for the lab)',
              '$ nmap -sn -iL scope.txt -oA disc1         # phase 4',
              '$ nmap -sV -iL alive.txt -oA svc1          # phase 5',
              '$ grep -h "open" svc1/*.nmap | sort -u     # feed the phase 6 list',
              '$ nmap -sV --script safe -p 445 10.0.20.10 # phase 7 (safe validation)',
              '$ ssh lab@10.0.20.10                       # phase 8 (authorized demo)',
              '$ script -a phase9-11.log                  # phases 9-11, documented access',
              '$ sha256sum evidence/* > evidence/SHA256SUMS   # phase 12',
              '# phases 13-15 happen in the editor; phase 16 one week later'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Two loops, one habit',
            text:
              'Whenever you gain a new vantage (phase 10) or a fix lands (phase 16), the correct move is always to re-enter the earlier phases — not to continue forward from memory. The loops are where coverage is actually earned.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Clients experience the workflow as predictability: they know when scans will hit, when to expect calls, when the report lands. You experience it as coverage insurance: every phase\u2019s exit artifact is the checklist that answers "did we ever validate F-007?" before the client asks it. The Penetration Testing Execution Standard formalizes the same shape in seven sections; this pipeline expands it into sixteen teaching phases.'
          },
          {
            type: 'list',
            items: [
              'Phase boundaries are client communication points — statuses, escalations, amendments',
              'Validation before exploitation is the report\u2019s credibility guarantee',
              'The phase log becomes a report appendix and a SOC-correlation artifact',
              'Loops (new vantage, retest) are where findings are multiplied or lost'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Findings without a validation entry — phase 7 skipped',
              'Exploitation notes without a pre-state backup — phase 8 hygiene missing',
              'Post-exploitation wandering past documentation into damage',
              'Internal enumeration that never re-ran discovery from the new vantage (loop 10 skipped)',
              'Risk ratings assigned during exploitation instead of in phase 13 with full context'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Run the pipeline on your lab end-to-end at small scale: one weekend, one scope file, all sixteen phases with a one-line log entry each, both loops included (one new vantage, one retest after an intentional "fix"). The point is the habit machine, not the size — a methodology practiced small is available large.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP, five days: day 1 recon and discovery (41 live hosts, 3 VLANs mapped), day 2 enumeration and assessment (service inventory, eleven candidate weaknesses), day 3 validation and one bounded exploitation demo on APP01, day 3-4 internal enumeration and the attack-path graph from the foothold, day 4 evidence consolidation and risk rating, day 5 report. The phase log becomes appendix A; the client\u2019s SOC correlates it against their alerts; the retest two weeks later re-validates five fixed findings and catches one regression — the pipeline earning its keep twice.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['nmap', 'The phases 4-7 workhorse'],
              ['Notes and ledger', 'Phase log, matrices, inventories — the pipeline\u2019s memory'],
              ['script(1) / tmux', 'Session evidence during phases 8-11'],
              ['Report template', 'Phases 13-15 pre-structured so writing starts from content, not layout'],
              ['Calendar', 'Windows, retest date, blackout periods']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Exploiting before validating — the report\u2019s worst embarrassment is a finding the client cannot reproduce',
              'Skipping the phase log, then reconstructing the timeline from memory during report writing',
              'Treating post-exploitation as "see how far I can get" instead of "document what this enables"',
              'Forgetting the loops: a new vantage without re-enumeration, fixes without retest',
              'Letting the calendar push validation out of the window — "we will validate during writing" is how phantom findings are born',
              'Delivering a report without a scheduled retest'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take your lab and the compressed terminal above; run all sixteen phases with a one-line log per phase, both loops included. Then compare the resulting report-readiness against a previous unstructured session — the difference in reproducibility is the argument for methodology, demonstrated on your own work.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Sixteen phases, each with entry criteria, an exit artifact and a one-line log entry',
              'Validation precedes exploitation; documentation precedes escalation; reporting precedes retesting',
              'Two loops: a new vantage re-enters discovery; fixes re-enter validation',
              'Phase boundaries are client communication points — statuses, escalations, amendments',
              'The phase log is both self-discipline and report appendix'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n15-l02-q1',
          type: 'mcq',
          prompt: 'Which ordering is correct within the pipeline?',
          options: [
            'Exploitation, validation, evidence, risk analysis',
            'Validation, exploitation (in scope), evidence, risk analysis',
            'Risk analysis, validation, discovery, reporting',
            'Evidence, enumeration, scope, retest'
          ],
          answerIndex: 1,
          hint: 'What must be true before you demonstrate impact?',
          explanation:
            'Findings are validated non-destructively first; exploitation happens only where the ROE allows; evidence is captured during and after; and risk is rated in phase 13 once full business context exists. Every other ordering breaks the report\u2019s credibility chain.'
        },
        {
          id: 'n15-l02-q2',
          type: 'truefalse',
          prompt: 'After gaining a foothold on APP01, the next phase is reporting the access.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which phase loops back when the vantage changes?',
          explanation:
            'A new vantage re-enters internal enumeration (phases 10-11: discovery, enumeration and path validation from APP01). Reporting comes much later, with full context — reporting one foothold in isolation would understate the finding and miss everything behind it.'
        },
        {
          id: 'n15-l02-q3',
          type: 'short',
          prompt: 'What are entry and exit criteria, and why do they matter more under time pressure?',
          modelAnswer:
            'Entry criteria are what must be true to start a phase (a signed ROE before scanning); exit criteria are the artifact proving the phase completed (a validated finding list with evidence). Under time pressure they matter more because the artifacts force the question "is this actually done?" exactly when the calendar argues for shortcuts — the checklist acts when willpower will not.',
          hint: 'What stops a phase from being quietly skipped when Friday looms?',
          explanation:
            'Criteria externalize discipline. The tester under pressure does not have to remember the process; the missing artifact makes the skip visible immediately, to themselves and to anyone reviewing the phase log.'
        },
        {
          id: 'n15-l02-q4',
          type: 'scenario',
          prompt:
            'Day 3 of 5. You hold four validated findings and one unvalidated scanner claim. The client emails: "management wants the report Friday — can you include everything?" What do you do?',
          modelAnswer:
            'Validate the fifth claim non-destructively today if the ROE and window allow — that is the honest path to including it. If validation cannot complete in the window, report it as "candidate, not validated" or exclude it with a note, never as a confirmed finding. Reply explaining the validation step and the cost of reporting unvalidated claims; log the decision in the phase log. The report\u2019s credibility is worth more than one additional finding.',
          hint: 'What does "everything" cost on Friday?',
          explanation:
            'The workflow exists precisely for this pressure: validation is what makes findings real, and a phantom finding damages client trust more than a shorter report. Communicating the tradeoff is part of the job.'
        }
      ],
      references: [
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'The seven-section standard this pipeline expands into sixteen teaching phases.'
        },
        {
          title: 'MITRE ATT&CK TA0008 — Lateral Movement (tactic)',
          url: 'https://attack.mitre.org/tactics/TA0008/',
          note: 'The lateral movement concepts of phases 10-11.'
        },
        {
          title: 'Nmap reference guide',
          url: 'https://nmap.org/book/man.html',
          note: 'The scan types behind phases 4-7.'
        }
      ]
    },
    {
      id: 'n15-l03',
      moduleId: 'n15',
      title: 'Evidence Collection and Risk Analysis',
      difficulty: 'Intermediate',
      minutes: 16,
      prerequisites: ['n15-l02'],
      objectives: [
        'Capture evidence that survives review: commands, outputs, screenshots, timestamps',
        'Maintain an append-only evidence log with hashes and masking',
        'Rate findings via likelihood and impact in the client\u2019s business context',
        'Avoid the inflation traps that erode report credibility'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A finding is a claim; evidence is what makes the claim someone else\u2019s fact. The difference between "the database is exposed" and "here is the command, the output, the timestamp and the hash of the file" is the difference between an argument and a record — and only records survive the meeting where the DBA says "prove it".'
          },
          {
            type: 'p',
            text:
              'Risk analysis translates technical facts into business decisions: likelihood (how plausible is the path, given real conditions observed) multiplied by impact (what the loss costs THIS business). Both sides are evidence-driven; neither is a mood. The same technical weakness can be Low on a lab printer and High on a payment gateway, and both ratings can be correct.'
          },
          {
            type: 'p',
            text:
              'Inflation is the professional\u2019s silent enemy: every overstated severity gets challenged, and the challenge poisons the findings that were honest. Conservative, context-tied ratings survive review — and reviewers remember who inflated.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-vuln-workflow',
            caption: 'From vulnerability to rated finding: validate, evidence, contextualize, rate.'
          },
          {
            type: 'h',
            text: 'What makes good evidence'
          },
          {
            type: 'list',
            items: [
              'The exact command, copyable — not a description of the command',
              'Full output, or an excerpt with its surrounding context intact',
              'ISO-8601 timestamps captured at execution, never reconstructed afterwards',
              'Screenshots for visual states (interfaces, listings) — annotated, never the only evidence',
              'Configuration excerpts: the exact lines that matter, with file and line references',
              'Masking at capture: credentials and personal data redacted immediately, the mask noted'
            ]
          },
          {
            type: 'h',
            text: 'The evidence log'
          },
          {
            type: 'p',
            text:
              'Append-only, one entry per artifact: identifier, timestamp, finding reference, artifact path, hash, one-line description. Hash at capture (sha256sum) and store originals read-only. The log is your memory in report week, your timeline during disputes, and the baseline the retest replays against.'
          },
          {
            type: 'code',
            lang: 'text',
            title: 'evidence/log.txt — three entries',
            code:
              'EV-031 2024-06-11T11:24Z F-003 evidence/ev-031-app01-rce-proof.txt\n       sha256:9f2c...8b01 command+output: APP01 demo; credentials masked\nEV-032 2024-06-11T11:26Z F-003 evidence/ev-032-session.log\n       sha256:41aa...77cd full session log, phases 8-11 (script(1))\nEV-033 2024-06-11T11:40Z F-007 evidence/ev-033-db01-select.png\n       sha256:c2d9...12aa read-only SELECT proof; screenshot, terminal visible'
          },
          {
            type: 'h',
            text: 'Likelihood'
          },
          {
            type: 'p',
            text:
              'Three drivers, all observable: exposure (internet-facing? which vantage reached it?), exploitability (public tooling? authentication required? how reliable?), and observed conditions (did the lab reproduce it? how common is the weak pattern across the estate?). A CVSS base score is a starting frame — environmental and threat context legitimately move the number, and the rationale sentence records why.'
          },
          {
            type: 'h',
            text: 'Impact'
          },
          {
            type: 'p',
            text:
              'Loss of confidentiality, integrity or availability, mapped to THIS client: revenue systems, regulated data (PII, cardholder, health), safety, reputation, downtime. The context comes from scoping — which is why phase 1 asked about crown jewels. An impact statement that names the client\u2019s own assets and obligations is one a board can act on; one that describes the vulnerability class in general is not.'
          },
          {
            type: 'h',
            text: 'Ratings that survive review'
          },
          {
            type: 'p',
            text:
              'Use the client\u2019s scheme (High/Medium/Low, or CVSS with ranges) consistently; write a one-sentence rationale tied to observed conditions; keep severity and fix effort separate (a trivial-to-fix finding can still be Critical); and sanity-check the whole report for consistency — five "Critical" findings that all require a foothold first is a narrative, not five emergencies.'
          },
          {
            type: 'table',
            headers: ['Inflation trap', 'What it looks like', 'The honest version'],
            rows: [
              ['Worst-case storytelling', '"Attackers could steal everything" from a low-value proof', 'State what was demonstrated; label extrapolation as extrapolation'],
              ['Severity-effort fusion', 'Rated High because the fix is hard', 'Fix difficulty belongs in remediation, not in severity'],
              ['CVE inheritance', 'Rated by the scariest CVE number alone', 'Re-check exploitability against the actual version and context'],
              ['Stacking', 'Several findings each claiming "full compromise"', 'Rate the path once; cross-reference the components']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Evidence and rating discipline is what makes a report defensible in the dispute meeting and usable in the retest. It also protects the tester: with hashes and logs, the question "did you go beyond scope?" has a precise, timestamped answer. And it enables the client\u2019s SOC: timestamped, command-level evidence is what they correlate against their own alerts.'
          },
          {
            type: 'list',
            items: [
              'Reproducible evidence converts skeptics into stakeholders',
              'The evidence log is the retest baseline — n15-l04 replays it',
              'Context-tied ratings survive the review meeting; inflated ones do not',
              'Capture-time masking keeps secrets out of every downstream artifact'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Findings whose only evidence is a scanner screenshot with no command',
              'Ratings whose rationale never mentions the client\u2019s context',
              'Unmasked credentials sitting in evidence folders headed for the report appendix',
              'Missing or obviously post-hoc timestamps',
              'Severity inconsistencies between similar findings in the same report'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Build the habit machine in the lab: run one exploit session entirely under logging, capture per the list, hash everything, then write the finding from artifacts alone — no memory allowed. If the finding cannot be reproduced from your own report text, the evidence is not finished.'
          },
          {
            type: 'terminal',
            title: 'The capture discipline',
            lines: [
              '$ mkdir -p evidence/2024-06-11 && cd evidence/2024-06-11',
              '$ script -a ev-032-session.log',
              '$ date -u +%Y-%m-%dT%H:%M:%SZ             # stamp before the action',
              '2024-06-11T11:40:02Z',
              '$ curl -s http://10.0.20.20/admin -o ev-034-admin-response.txt',
              '$ sha256sum ev-034-admin-response.txt >> ../log.txt',
              '$ exit                                    # close the session log'
            ]
          },
          {
            type: 'p',
            text:
              'Then the rating drill: for the same finding, write two impact sentences — one for a bank, one for a bakery — and watch the rating move while the evidence stays identical. Context changes the number; the evidence does not. That separation is the whole skill.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The same LABCORP finding, two presentations. Version A: "Critical: SQL injection allows total database compromise" — no evidence beyond a scanner screenshot. Version B: "High: injection in /search confirmed read-only via a time-based proof (EV-041); one row read with client approval; impact: application data exposure on the customer database; exploitability: unauthenticated, public tooling". Version B survives the meeting, the retest and the audit. Version A gets one challenged finding and a client who now re-checks everything else.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['script(1) / tmux', 'Full-session logging — the raw evidence layer'],
              ['sha256sum', 'Integrity hashing at capture time'],
              ['date -u', 'Execution-time timestamps, not reconstruction'],
              ['CVSS (first.org)', 'A consistent scoring frame to start from'],
              ['The evidence log', 'Append-only index mapping findings to artifacts']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Screenshotting after the fact from a changed state — the evidence proves nothing anymore',
              'Storing client data unencrypted on personal machines: the tester becomes the finding',
              'Rating from the CVE database instead of from observed conditions',
              'Mixing "hard to fix" into severity',
              'Losing the timeline: no timestamps means no correlation with SOC alerts',
              'Unstructured evidence folders — report week becomes archaeology'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Redo your last lab exploit under full discipline: logged session, stamped commands, hashed artifacts, masked secrets, one-line log entries. Write the finding using artifacts only, then hand it to someone (or to next-week you) to reproduce strictly from the text. If they cannot, the evidence is not done — iterate until they can.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Evidence = exact commands + full output + execution-time timestamps + hashes + masking',
              'The evidence log is append-only, structured, and doubles as the retest baseline',
              'Likelihood comes from exposure and exploitability; impact from THIS client\u2019s business context',
              'Severity and fix effort are separate axes; consistency is a report-level property',
              'Conservative, context-tied ratings survive review; inflated ones poison the honest findings'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n15-l03-q1',
          type: 'mcq',
          prompt: 'Which artifact best supports the claim "unauthenticated SQL injection exists on /search"?',
          options: [
            'A scanner screenshot showing a red flag',
            'The exact request, the application\u2019s response proving execution, captured with timestamp and hash',
            'A blog post describing the vulnerability class',
            'Your written opinion in the executive summary'
          ],
          answerIndex: 1,
          hint: 'What can the client\u2019s engineer replay, step by step?',
          explanation:
            'Evidence is reproducible: request, response, time, integrity hash. Scanner confidence ratings and vulnerability-class essays support the claim, but only the captured request-and-response pair proves this instance.'
        },
        {
          id: 'n15-l03-q2',
          type: 'truefalse',
          prompt: 'Impact should be rated from the worst possible outcome of the vulnerability class, regardless of this client\u2019s context.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Whose business is the rating about?',
          explanation:
            'Impact is the harm weighted by the client\u2019s actual assets and obligations. Worst-case class descriptions belong in the explanation, clearly labeled as extrapolation — not in the rating. Context-tied ratings are the ones that survive review.'
        },
        {
          id: 'n15-l03-q3',
          type: 'short',
          prompt: 'Why mask credentials at capture time rather than during report writing?',
          modelAnswer:
            'Masking at capture means the secret never exists in artifact files, so it cannot leak through session logs, screenshots, hashes or folder syncs before report week. Unmasked originals "to redact later" are the classic leak path. If a masked capture loses needed context, re-capture with an approved redaction — do not carry the secret forward.',
          hint: 'Where does that secret travel between day one and delivery?',
          explanation:
            'Evidence artifacts multiply (logs, hashes, backups, appendices), and every copy is a chance to leak. Capture-time masking removes the secret from the entire downstream pipeline in one move.'
        },
        {
          id: 'n15-l03-q4',
          type: 'scenario',
          prompt:
            'The client disputes your High rating on a weak-TLS finding: "nobody exploits TLS configs in the real world." Your evidence shows TLS 1.0 and 1.1 offered on the payment gateway. Build the two-sentence defense.',
          modelAnswer:
            'Likelihood sentence: exploitation is passive capture or downgrade using public tooling, and the affected system processes payment data — exposure is real even if mass exploitation is rare. Impact sentence: confidentiality and integrity loss on the client\u2019s stated crown-jewel system, with compliance exposure because cardholder-data standards forbid legacy TLS. The rating follows from observed conditions plus business context, not from real-world attack frequency alone.',
          hint: 'Likelihood and impact are two different sentences.',
          explanation:
            'The defense demonstrates the lesson\u2019s core skill: separate the likelihood argument (exposure, tooling) from the impact argument (this client\u2019s assets and obligations), tie both to evidence, and the rating stands without rhetoric.'
        }
      ],
      references: [
        {
          title: 'FIRST — CVSS v3.1 Specification',
          url: 'https://www.first.org/cvss/v3.1/specification-document',
          note: 'The scoring frame many clients adopt; environmental metrics formalize business context.'
        },
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'The vulnerability analysis and reporting sections mirror validate-then-rate.'
        },
        {
          title: 'MITRE ATT&CK',
          url: 'https://attack.mitre.org/',
          note: 'Grounding likelihood claims in documented attacker behavior.'
        }
      ]
    },
    {
      id: 'n15-l04',
      moduleId: 'n15',
      title: 'Reporting, Remediation and Retesting',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n15-l03'],
      objectives: [
        'Structure a report: executive summary, findings, appendices',
        'Write a finding from a template: severity, assets, reproduction, impact, remediation',
        'Write remediation an operations team can execute and verify',
        'Run a retest cycle and close findings with evidence'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The report is the only deliverable most of the client will ever see; testers are remembered by it. Anatomy matters: an executive summary a CFO can read, findings an engineer can replay, appendices an auditor can check. One document, three audiences, each served by a different section — and the worst reports are the ones that serve all three audiences the same prose.'
          },
          {
            type: 'p',
            text:
              'Remediation is a design exercise in empathy: the person reading it is busy, constrained, and not you. "Harden SSH" is not remediation; "set this cipher list in sshd_config, run these two validation commands, expect this result" is. Remediation that names files, values and verification steps gets implemented — and it doubles as the retest script.'
          },
          {
            type: 'p',
            text:
              'The retest closes the loop and is where trust compounds: fixes verified with the same evidence discipline as the original findings, regressions caught (including the ones the "fix" itself caused), and the report updated rather than contradicted by a second document.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-pentest-pipeline',
            caption: 'The reporting loop: findings drive remediation; the retest re-enters validation and updates the report.'
          },
          {
            type: 'h',
            text: 'Report anatomy'
          },
          {
            type: 'list',
            items: [
              'Executive summary: scope recap, methodology in one line, key numbers, top risks in business language — one page, no jargon',
              'Findings: each with identifier, title, severity, affected assets, description, reproduction, evidence references, impact, remediation',
              'Appendices: methodology detail, tool versions, scope and ROE recap, evidence log index, masked raw data, retest plan',
              'Housekeeping: version, date, distribution list, confidentiality marking'
            ]
          },
          {
            type: 'h',
            text: 'The finding template'
          },
          {
            type: 'code',
            lang: 'text',
            title: 'Finding template (plain text), filled with a worked example',
            code:
              'F-007 | HIGH | Weak SSH ciphers on DB01\nASSETS:       db01.internal.lab (10.0.30.15), OpenSSH 8.9p1\nDESCRIPTION:  The SSH service offers CBC-mode and SHA-1 key exchange\n              (diffie-hellman-group14-sha1, aes128-cbc), enabling\n              downgrade opportunities against legacy clients.\nREPRODUCTION: ssh -vv -c aes128-cbc app_read@10.0.30.15\n              -> negotiation succeeds (EV-041, 2024-06-12T09:03Z)\nEVIDENCE:     EV-041 (negotiation log), EV-042 (sshd -T excerpt)\nIMPACT:       Session confidentiality on the database tier depends on\n              legacy cipher resistance; this host holds core business data.\nREMEDIATION:  1) In /etc/ssh/sshd_config set:\n                 Ciphers aes256-gcm@openssh.com,chacha20-poly1305@openssh.com\n                 MACs hmac-sha2-512-etm@openssh.com\n              2) Validate config: sshd -t ; then reload the service\n              3) Verify: ssh -vv shows only the approved algorithms\nEFFORT:       Low (config change + reload, no reboot)\nATT&CK:       T1557 (adversary-in-the-middle exposure class)\nRETEST:       replay REPRODUCTION; expect negotiation failure'
          },
          {
            type: 'h',
            text: 'Remediation people can actually use'
          },
          {
            type: 'list',
            items: [
              'Concrete: exact config lines, exact commands, exact versions',
              'Ordered: immediate mitigations first, strategic changes after (cipher fixes precede segmentation projects)',
              'Owned: note which team typically holds each fix (network, sysadmin, application)',
              'Verifiable: every remediation ships with its own check command — it becomes the retest step',
              'Risk-ranked: fix order follows the cheapest-break analysis from n14-l02'
            ]
          },
          {
            type: 'h',
            text: 'The retest cycle'
          },
          {
            type: 'p',
            text:
              'Schedule the retest in the engagement itself — a date, not a hope. The client fixes during the remediation window; the retest scope is the finding list plus a check for side effects of the fixes (a firewall rule that quietly broke backups is a regression finding in its own right). Replay each finding\u2019s reproduction commands (idempotent, from n14-l04), diff the behavior, mark fixed, partial or not-fixed with fresh evidence, and deliver a dated addendum that updates the main report\u2019s status column rather than issuing a contradictory second report.'
          },
          {
            type: 'terminal',
            title: 'The retest, replayed',
            lines: [
              '$ bash retest.sh findings-addendum.csv',
              '[RETEST] F-007 weak SSH ciphers   ... FIXED (negotiation now fails; EV-101)',
              '[RETEST] F-012 anonymous share    ... PARTIAL (read fixed, write still open; EV-102)',
              '[RETEST] F-014 TLS suites         ... NOT FIXED (baseline unchanged; EV-103)',
              '$ diff -u retest/2024-06-11/ retest/2024-06-26/ | head -20'
            ]
          },
          {
            type: 'h',
            text: 'The pre-delivery checklist'
          },
          {
            type: 'table',
            headers: ['Check', 'Why'],
            rows: [
              ['Every credential masked, checked twice', 'The archive ships; secrets must not'],
              ['Scope recap matches the signed scope', 'Drift check; out-of-scope mentions flagged'],
              ['Severity rationale present per finding', 'Survives the dispute meeting'],
              ['Reproduction steps executed by a second person', 'The report\u2019s core promise'],
              ['Executive summary readable by a non-technical executive', 'The audience that funds the next test'],
              ['Numbers consistent across summary, findings and appendices', 'Small mismatches read as carelessness']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Reporting is where technical excellence becomes client value. Clear remediation gets implemented; implemented fixes reduce real risk; verified retests prove the tester adds durable value and win the next engagement. The checklist habit is the difference between a document and a product.'
          },
          {
            type: 'list',
            items: [
              'The finding template is non-negotiable structure — deviations cost reproducibility',
              'Remediation with built-in verification converts the client\u2019s ops team into allies',
              'Retest addenda keep the report alive instead of contradicting it',
              'The pre-delivery checklist is the final gate before your name ships'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Drafts with "harden the server"-class remediation',
              'Findings whose reproduction steps have rotted (stale IPs or credentials)',
              'Executive summaries and severity tables that disagree',
              'Retests that re-scan everything instead of replaying finding baselines',
              'Masking applied to obvious passwords but not to API tokens, session identifiers and personal data'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Exercise: take one lab finding and produce the full template block above. Then hand the REMEDIATION and RETEST sections to an "ops team" — a classmate, or yourself tomorrow — and allow them nothing but the text. If they must ask you anything, the writing failed; revise until they succeed unaided.'
          },
          {
            type: 'p',
            text:
              'Then write the report arc for your whole lab engagement: one-page executive summary, three findings (one High, one Medium, one Low) from the template, appendices with the evidence log index, and a retest plan with dates. Schedule the retest with yourself a week out and honor it — the loop only builds the habit if it closes.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'LABCORP delivery: eleven findings, an executive summary naming the single chain (n14-l02\u2019s share-to-database path) as the headline risk, a remediation plan ordered by cheapest break, and a retest two weeks later: eight fixed, two partial, one regression — a firewall "fix" that silently broke backups, caught by the retest loop and reported as its own finding. The addendum updates statuses without rewriting history, and the client\u2019s ops team keeps the retest script as a regression check.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['Report template', 'Pre-structured so writing starts from content, not layout'],
              ['Markdown / Word / LaTeX', 'Any format the client can consume — ask, do not assume'],
              ['diff + retest scripts', 'Idempotent verification carried over from n14-l04'],
              ['Version control', 'Drafts, review states, delivered versions with dates'],
              ['The checklist', 'Pre-delivery gate, printed and physically ticked']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Burying the headline: an executive summary that opens with methodology instead of business risk',
              'Severity inflation inherited from the n15-l03 traps',
              'Remediation without verification steps — the ops team cannot even tell whether they succeeded',
              'Retesting from memory instead of from the stored baseline',
              'Delivering raw scanner output as "appendices" without masking or curation',
              'Never scheduling the retest, then acting surprised when fixes did not land'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write the full report arc for your lab engagement — executive summary, three templated findings, appendix index, retest plan — then perform the actual retest a week later and mark each finding fixed, partial or not-fixed with fresh evidence. Close the loop once, and the checklist habit is yours for every engagement after.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Report anatomy: executive summary for decisions, findings for engineers, appendices for auditors',
              'The finding template (assets, description, reproduction, evidence, impact, remediation, retest) is fixed structure',
              'Remediation is concrete, ordered, owned and self-verifying — every fix ships with its check command',
              'Retests replay baselines, mark fixed/partial/not-fixed with fresh evidence, and update rather than replace the report',
              'The pre-delivery checklist is the final gate: masking, consistency, reproducibility'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n15-l04-q1',
          type: 'mcq',
          prompt: 'Which remediation line would actually help the operations team?',
          options: [
            '"Harden the SSH service"',
            '"Upgrade the server to a supported version"',
            '"Set Ciphers to aes256-gcm@openssh.com in sshd_config, validate with sshd -t, reload, then verify with ssh -vv"',
            '"Consider reviewing the cryptographic posture periodically"'
          ],
          answerIndex: 2,
          hint: 'Could a busy admin execute it without asking you anything?',
          explanation:
            'Usable remediation names the file, the exact change, the validation commands and the expected result — and doubles as the retest baseline. The vague alternatives transfer the real work back to the client\u2019s imagination.'
        },
        {
          id: 'n15-l04-q2',
          type: 'truefalse',
          prompt: 'A thorough retest should re-run the entire original test methodology.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What question is the retest actually answering?',
          explanation:
            'The retest answers "did these specific findings get fixed?" — it replays each finding\u2019s stored baseline commands, diffs the results, and adds scope only for side effects of the fixes. A full re-test is a new engagement, not a retest.'
        },
        {
          id: 'n15-l04-q3',
          type: 'short',
          prompt: 'List four sections of a professional finding and say what each gives the reader.',
          modelAnswer:
            'Severity and assets: how much to care and where it applies. Description: what is wrong. Reproduction: exact steps, letting the engineer replay the claim. Evidence references: ties to hashed artifacts. Impact: the business meaning. Remediation: what to do, in order, with verification. Any four with sensible purposes are correct — the point is that each section serves a different reader decision.',
          hint: 'Different sections serve different moments: triage, replay, decision, action.',
          explanation:
            'The template is fixed because each section answers a distinct question from a distinct audience — and removing one section shifts that audience\u2019s work onto someone who lacks the context to do it.'
        },
        {
          id: 'n15-l04-q4',
          type: 'scenario',
          prompt:
            'Two weeks after delivery, the client reports the fixes are done and asks for the retest "quickly, by email is fine". What is your professional response and process?',
          modelAnswer:
            'Agree the retest in writing: scope (the finding list plus checks for fix side effects), window, and deliverable (a dated addendum). Replay each finding\u2019s idempotent baseline commands, capture fresh evidence with hashes, mark each fixed, partial or not-fixed, and deliver the addendum that updates the main report\u2019s statuses — including the regression check that previously caught a "fix" breaking backups. Email-quick is fine for coordination, not for skipping the evidence discipline.',
          hint: 'Fast is fine — what must not get skipped?',
          explanation:
            'The retest\u2019s value is exactly its evidence discipline: baselined commands, hashed artifacts, marked statuses. Compressing coordination is professional; compressing verification is how false "fixed" claims enter the record.'
        }
      ],
      references: [
        {
          title: 'PTES — Penetration Testing Execution Standard',
          url: 'https://www.pentest-standard.org/index.php/Main_Page',
          note: 'The reporting section\u2019s expectations for structure and deliverables.'
        },
        {
          title: 'FIRST — CVSS v3.1 Specification',
          url: 'https://www.first.org/cvss/v3.1/specification-document',
          note: 'Common severity language for finding ratings.'
        },
        {
          title: 'sshd_config(5) — OpenSSH manual',
          url: 'https://man.openbsd.org/sshd_config',
          note: 'The exact cipher and MAC option names used in real remediation steps.'
        }
      ]
    }
  ]
};
