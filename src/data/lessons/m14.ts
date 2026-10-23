import type { Module } from '../../types';

// LEVEL 9 — CAPSTONE · Module 14: Methodology & Reporting
// Original curriculum content. The 16-phase pipeline, evidence craft, and
// report writing. References point to OWASP MASTG/MASVS, developer.android.com,
// and the CVSS specification.

export const m14: Module = {
  id: 'm14',
  title: 'Methodology & Reporting',
  level: 9,
  description:
    'The capstone: a repeatable 16-phase methodology from reconnaissance to retesting, plus the professional craft around it — clean evidence, reproducible notes, severity reasoning, and reports that both executives and engineers can act on.',
  outcomes: [
    'Run the 16-phase Android methodology and explain the dependencies between phases',
    'Capture evidence that is contextual, reproducible, and hygienic',
    'Write findings with severity reasoning, specific remediation, and MASVS mapping',
    'Close the loop with structured retesting'
  ],
  lessons: [
    {
      id: 'm14-l01',
      moduleId: 'm14',
      title: 'The Android Pentesting Methodology',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m09-l01'],
      objectives: [
        'Recite and sequence the 16 phases of an Android pentest',
        'Explain why the order matters and which outputs feed which phases',
        'Map each testing phase to the MASVS domains it covers'
      ],
      diagram: 'methodology-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Everything from modules 01 through 13 was technique. Methodology is what turns technique into a professional engagement: a fixed set of phases, run in a deliberate order, so that coverage is provable, results are comparable across testers and time, and nothing silently depends on one person\u2019s memory.'
          },
          {
            type: 'p',
            text:
              'The pipeline below is the 16-phase loop this academy has been building toward. Treat it as a loop, not a line: later phases constantly send you back — an API discovery in phase 7 reopens dynamic analysis in phase 5, and retesting in phase 16 restarts the whole cycle on the fixed build.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'methodology-pipeline',
            caption: 'The 16-phase pipeline. Phases 4-13 are the analytical core; 14-16 wrap findings into delivery and verify fixes.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Recon — scope, targets, the organization\u2019s mobile presence, app inventory',
              'Application Understanding — features, user roles, intended behavior, business value of the data',
              'APK Acquisition — pull builds from devices, stores, or the client\u2019s artifact pipeline',
              'Static Analysis — manifest, decompiled code, secrets, configuration (m04/m05)',
              'Dynamic Analysis — run and observe the process, files, logs (m03/m08)',
              'Network Analysis — intercept and inspect traffic (m06)',
              'API Testing — endpoint inventory, token and authorization abuse (m10)',
              'Authentication Testing — login flows, session handling, lockouts, recovery',
              'Authorization Testing — who may do what, client-side and server-side',
              'Data Storage Testing — preferences, databases, logs, backups, Keystore use (m08)',
              'Platform Interaction Testing — components, IPC, deep links, platform services (m07)',
              'Reverse Engineering — crypto, custom protocols, hidden logic (m04/m05)',
              'Resilience Testing — obfuscation, detection and integrity defenses (m13)',
              'Documentation — evidence and notes captured throughout, curated deliberately (m14-l02)',
              'Reporting — findings, severity, remediation (m14-l03)',
              'Retesting — verify fixes on the new build, close findings, update the report'
            ]
          },
          {
            type: 'p',
            text:
              'The order is a dependency graph, not bureaucracy: static analysis tells you where to look dynamically; network captures feed API testing with real endpoints; you cannot test authorization before you hold identities from authentication testing; and documentation runs concurrently with everything — it appears as its own phase because it must be budgeted, not because it starts late.'
          },
          {
            type: 'table',
            headers: ['Phase(s)', 'Primary MASVS coverage'],
            rows: [
              ['Data Storage Testing', 'MASVS-STORAGE (plus MASVS-CRYPTO where encryption choices matter)'],
              ['Network Analysis, API Testing', 'MASVS-NETWORK'],
              ['Authentication & Authorization Testing', 'MASVS-AUTH'],
              ['Platform Interaction Testing', 'MASVS-PLATFORM'],
              ['Static Analysis, Reverse Engineering', 'MASVS-CODE (plus MASVS-PRIVACY for data handling)'],
              ['Dynamic Analysis', 'Cross-cutting observation across domains'],
              ['Resilience Testing', 'MASVS-RESILIENCE']
            ]
          },
          {
            type: 'p',
            text:
              'Map as you test — not afterwards. Mapping during the engagement keeps coverage honest: an empty MASVS domain at engagement end is either a scope decision or a gap, and you must know which.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Clients buy coverage, and the phase list is your proof of work. It also arbitrates scope arguments (authorization testing is a phase, not an optional extra), structures your report\u2019s methodology section, and lets a second tester reproduce your engagement. The self-audit habit matters most: at any point you can name which phases are done, in progress, and untouched — and why.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Coverage gaps while you work: no denial-path tests, one-account authorization testing, storage tested only on debug builds',
              'Phases silently skipped under time pressure — decide and document, never just drop',
              'Phase outputs you did not carry forward (an API inventory never used by authorization testing)',
              'A MASVS domain with no finding and no test note — suspicious by definition'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Methodology presumes authorization',
            text:
              'The phases are a discipline for authorized engagements and training targets. Running recon against organizations you have no contract with is not methodology — it is unauthorized intelligence gathering.'
          },
          {
            type: 'p',
            text:
              'Run the loop small and whole: pick one training app and produce one artifact per phase, however brief. The artifact is the point — a phase without an artifact did not happen.'
          },
          {
            type: 'code',
            lang: 'markdown',
            title: 'methodology-tracker.md — one entry per phase',
            code:
              '# Engagement: TrainingApp 2.3.1 (emulator, API 34)\n\n## Phase 4 — Static Analysis\n- tools: jadx 1.4.7, MobSF 3.9.9\n- artifacts: manifest notes (2 exported comps), 1 hardcoded secret\n- evidence: evidence/static-*.md\n\n## Phase 7 — API Testing\n- inventory: 14 endpoints (see api-inventory.md)\n- tests: BOLA on /orders (2 pairs), token lifetime\n- status: 2 candidate findings\n\n## Phase 14 — Documentation\n- evidence indexed, notes cross-linked per finding'
          },
          {
            type: 'p',
            text:
              'Scale the depth of each phase to the engagement, never the order — and never the documentation.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A 90-minute walkthrough of a training app: recon and app understanding from the store listing and first launch (phases 1-2); pull the APK with pm path (3); one JADX pass for manifest flags and secrets (4); a dynamic session watching prefs and logs (5); proxy capture of login plus two features (6); inventory and one BOLA pair (7); token decode and a two-account authorization probe (8-9); a storage dump (10); one deep-link test (11); a Smali read of a crypto check (12); a note that the build is unobfuscated (13) — with the evidence folder growing from minute one (14) and findings drafted the same evening (15). One evening, all sixteen phases, at review depth.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in the pipeline'],
            rows: [
              ['OWASP MASTG', 'The reference methodology and per-test detail behind this pipeline'],
              ['MobSF', 'Fast triage report that seeds phases 4 and 5'],
              ['Your tracker + evidence repo', 'The phase artifacts that make coverage provable'],
              ['MASVS', 'The coverage checklist the phases map onto']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping recon and app understanding — you lose the business context that makes logic findings possible',
              'Testing authorization with a single account — the two-account discipline from m10-l04 is part of the phase definition',
              'Leaving documentation for the end; evidence decays and sessions get lost',
              'Calling an automated scanner run a pentest — the scanner covers fragments of phases 4 and 5 only',
              'Treating the pipeline as strictly linear instead of the loop it is'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'This week, execute phases 1 through 4 on a training app: one page each for recon notes, a feature/role map, acquisition commands, and static findings. Then self-audit with the phase list: which phases feel ready to defend, which are empty? That gap list is your personal study plan for the remaining modules.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              '16 phases, run as a loop: understand, analyze, deep-test, document, report, retest',
              'Order follows dependencies; artifacts make coverage provable',
              'MASVS is the coverage checklist the phases map onto — fill it as you test',
              'Documentation is a phase with its own budget, not an afterthought'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm14-l01-q1',
          type: 'mcq',
          prompt: 'Which phase most directly feeds API testing, and why?',
          options: [
            'Retesting, because it closes the loop',
            'Network Analysis, because captured traffic supplies real endpoints, headers, and auth schemes',
            'Resilience Testing, because it hardens the API',
            'APK Acquisition, because APIs live in the manifest'
          ],
          answerIndex: 1,
          hint: 'Where does the API inventory come from?',
          explanation:
            'API testing needs an inventory of real endpoints and their authentication mechanics. The proxy captures from Network Analysis (plus static harvesting) are that inventory — m10 was built exactly on this dependency.'
        },
        {
          id: 'm14-l01-q2',
          type: 'short',
          prompt: 'Which MASVS domain covers how an app stores credentials on the device?',
          modelAnswer:
            'MASVS-STORAGE (with MASVS-CRYPTO engaged when the storage design involves encryption choices, e.g., Keystore-wrapped keys).',
          hint: 'The domain names are literal.',
          explanation:
            'The storage phase maps to MASVS-STORAGE; token-storage findings from m10-l03 would cite it, alongside MASVS-CRYPTO when the fix involves encryption design.'
        },
        {
          id: 'm14-l01-q3',
          type: 'truefalse',
          prompt: 'Retesting is an optional courtesy; a report is complete without it.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What was the point of writing reproducible steps?',
          explanation:
            'Retesting verifies fixes using the same reproducible steps the report provided, assigns a final status per finding, and closes the loop. It is a phase of the methodology, not a favor.'
        },
        {
          id: 'm14-l01-q4',
          type: 'scenario',
          prompt:
            'A stakeholder asks why you "wasted" two hours on Application Understanding before touching the app. Justify the phase.',
          modelAnswer:
            'Application Understanding defines what the app is supposed to do, for whom, and which data matters — the context that makes business-logic and authorization testing meaningful. Without it you cannot recognize a logic flaw as a flaw, cannot weigh severity in business terms, and risk testing the wrong roles or missing the features that actually carry value. Two hours there typically saves days of unfocused probing.',
          hint: 'What makes a behavior a finding rather than a feature?',
          explanation:
            'Findings are deviations from intended, valuable behavior. You need the intended model — roles, flows, data value — before deviations are recognizable and before severity has any meaning.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The reference mobile testing methodology behind the pipeline.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard the phases map their coverage onto.'
        }
      ]
    },
    {
      id: 'm14-l02',
      moduleId: 'm14',
      title: 'Evidence, Notes and Documentation',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m14-l01'],
      objectives: [
        'Produce evidence that carries context, commands, and timestamps',
        'Apply evidence hygiene: scope discipline and secret redaction',
        'Keep reproducible notes structured for the retester who follows you'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A finding without evidence is an opinion, and opinions lose arguments with development teams. Evidence — what you captured, in what state, with which commands — is what survives challenge, what a retester follows months later, and what protects you when a client disputes a claim.'
          },
          {
            type: 'p',
            text:
              'The flip side is hygiene: your captures contain the very data you are hired to protect. Out-of-scope data, live secrets, and personal information sitting in evidence are findings against you.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'What makes evidence good'
          },
          {
            type: 'list',
            items: [
              'Context in frame: app name and version, screen or endpoint, account state, and a visible timestamp — a bare screenshot proves nothing',
              'Raw command and output, not paraphrase: the retester must be able to re-run what you ran',
              'Environment facts: device/emulator and OS level, app build, tool versions',
              'File names and folder structure that outlive your memory (dates, finding numbers)'
            ]
          },
          {
            type: 'h',
            text: 'Evidence hygiene'
          },
          {
            type: 'list',
            items: [
              'Collect only what is in scope; proxies and logcat happily capture other apps and hosts — filter as you go',
              'Redact secrets and PII in traveling artifacts: token bodies become [REDACTED-JWT:last4], passwords never appear in screenshots',
              'Keep the ability to verify: record unredacted values in the engagement\u2019s secret store, never in the report',
              'Handle per contract: where evidence lives, who may see it, when it is destroyed'
            ]
          },
          {
            type: 'h',
            text: 'Reproducible notes'
          },
          {
            type: 'p',
            text:
              'The working pattern: claim, command, observation, interpretation, evidence reference. The claim is the sentence you would defend; the command is what you actually ran; the observation is the raw result; the interpretation is what you think it means. Keeping the four apart keeps later-you honest.'
          },
          {
            type: 'compare',
            title: 'The same test, two qualities of note',
            beforeTitle: 'Weak note',
            beforeCode:
              'Login is insecure.\nFound some token stuff in prefs.\nAlso the API looked weird.',
            afterTitle: 'Strong note',
            afterCode:
              '# 2026-09-27 14:02 — TrainingApp 2.3.1, Pixel emulator (API 34)\nClaim: session JWT stored in plaintext prefs.\n$ adb shell run-as com.example.app cat shared_prefs/auth.xml\n  <string name="jwt">eyJhbGci...[REDACTED-JWT:a1b2]</string>\nObserved: token present, plaintext XML, account tester1.\nInterpretation: readable on rooted/backup paths -> storage finding\n  (MASVS-STORAGE).\nEvidence: evidence/2026-09-27-1402-auth.xml'
          },
          {
            type: 'h',
            text: 'Built for the retest'
          },
          {
            type: 'p',
            text:
              'Structure evidence per finding: the exact build tested, numbered steps, and the artifact each step produces. The retester of phase 16 should be able to re-run your steps verbatim and reach your observation — no memory, no archaeology.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Retests are contractual, clients challenge findings, and auditors read evidence trails. Clean evidence converts disputes into fixes, makes severity defensible (the impact is in the captured data, not in your adjective), and is the difference between a retest that takes an hour and one that takes a week.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'In your own notes: claims without commands, screenshots without app state or timestamps, missing build/version info',
              'In your captures: other hosts and apps in proxy history, token values in screenshots, PII in logs',
              'In your storage: evidence on personal unencrypted disks, no retention rules, unversioned folders'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Evidence is client data',
            text:
              'Captured artifacts contain the client\u2019s data and often live credentials. Store and transmit them per the engagement contract, and purge anything captured outside scope immediately — reporting the over-capture to the client is part of hygiene, not an admission of failure.'
          },
          {
            type: 'terminal',
            title: 'Capturing clean, attributable evidence',
            lines: [
              '$ mkdir -p evidence && adb shell screencap -p /sdcard/1405-order-1042.png',
              '$ adb pull /sdcard/1405-order-1042.png evidence/2026-09-27-1405-order-1042.png',
              '$ adb logcat -d --pid=$(adb shell pidof com.example.app) > evidence/1405-logcat-raw.txt',
              '$ sed -E "s/eyJ[A-Za-z0-9_-]{20,}/[REDACTED-JWT]/g" evidence/1405-logcat-raw.txt > evidence/1405-logcat-clean.txt'
            ]
          },
          {
            type: 'p',
            text:
              'The raw log stays in the engagement secret store; the clean copy travels with the report. Both are timestamped by name and content — that is the pattern: capture raw, redact deliberately, keep both auditable.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A familiar arc: the client disputes a BOLA finding ("that endpoint was decommissioned"). The evidence pair from m10-l04 — timestamped requests with both accounts\u2019 tokens redacted to their last four characters, build number in the note header, and the raw capture in the vault — ends the discussion in one email. The retester then re-runs the numbered steps against the fixed build and closes the finding in twenty minutes. That is the system working.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb screencap / scrcpy — device-state evidence',
              'Terminal session logging (script, asciinema) — raw command history',
              'A versioned evidence repo per engagement — folders per finding, dates in names',
              'Burp / mitmproxy session export — traffic evidence, exported with scope discipline'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Paraphrasing output instead of keeping the raw capture — interpretation belongs in the note, not in place of evidence',
              'Letting proxy history accumulate unrelated hosts; scoping the capture is your job',
              'Over-redacting until the finding cannot be re-verified — redact secrets, keep structure and enough to match records',
              'No timestamps or build info; evidence that cannot be tied to a build is close to useless for retesting',
              'Keeping evidence on personal unencrypted storage outside the engagement\u2019s rules'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Redo one small test from lesson m14-l01 and produce the three artifacts: a contextual screenshot, a raw command log with secrets redacted, and one claim/command/observation/interpretation note. Hand all three to a peer and have them reproduce your observation from the artifacts alone. Whatever they had to ask you is what your note was missing.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Evidence = context + raw command/output + timestamp + environment facts',
              'Hygiene is scope discipline plus deliberate redaction with retained verification ability',
              'Notes split claim, command, observation, and interpretation',
              'Structure evidence for the retester who follows you — because one will'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm14-l02-q1',
          type: 'mcq',
          prompt: 'What turns a screenshot into usable evidence?',
          options: [
            'High resolution and color accuracy',
            'Context: app state, endpoint or screen identity, and a timestamp in frame',
            'A watermark with your name',
            'Cropping out everything but the bug'
          ],
          answerIndex: 1,
          hint: 'What question does a bare screenshot fail to answer?',
          explanation:
            'Evidence must answer "where, when, in what state". App identity, build, screen/endpoint, account state, and timestamp let a stranger — or the retester — place the observation in the engagement.'
        },
        {
          id: 'm14-l02-q2',
          type: 'truefalse',
          prompt: 'Leaving live tokens unredacted in the report appendix is fine because it proves the finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Whose data is in that appendix, and who reads reports?',
          explanation:
            'Redact secrets in traveling artifacts (keep last-4 or a hash for matching) while retaining the unredacted values in the engagement\u2019s secure store for re-verification. Hygiene and verifiability are both achievable.'
        },
        {
          id: 'm14-l02-q3',
          type: 'scenario',
          prompt:
            'While reviewing yesterday\u2019s captures you notice your proxy log includes traffic from an app that was never in scope. What do you do?',
          modelAnswer:
            'Follow the engagement\u2019s rules: report the over-capture to the client contact, securely delete the out-of-scope data from your working copies, tighten your capture filters (host-scoped proxy configuration), and record the incident in your notes. Do not analyze, retain, or forward the out-of-scope content.',
          hint: 'The client\u2019s rules govern capture, retention, and disclosure.',
          explanation:
            'Scope discipline applies to evidence as much as to testing. Over-capture happens; the professional response is prompt disclosure, purge, and prevention.'
        },
        {
          id: 'm14-l02-q4',
          type: 'short',
          prompt: 'List the four parts of the reproducible note pattern and what each contributes.',
          modelAnswer:
            'Claim (the assertion you will defend), command (exactly what was run), observation (the raw result), interpretation (what you believe it means) — plus an evidence reference linking to the artifact. Keeping them separate prevents interpretation from quietly replacing evidence.',
          hint: 'One is what you think; one is what happened.',
          explanation:
            'The pattern keeps facts and opinions auditable: challenges target the interpretation, retests re-run the command, and disputes meet the raw observation.'
        }
      ],
      references: [
        {
          title: 'Android Developers — adb',
          url: 'https://developer.android.com/studio/command-line/adb',
          note: 'The capture commands (screencap, pull) behind most device evidence.'
        },
        {
          title: 'Android Developers — logcat',
          url: 'https://developer.android.com/studio/command-line/logcat',
          note: 'Official log capture documentation used in the evidence workflow.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Each MASTG test page models what a documented test result should contain.'
        }
      ]
    },
    {
      id: 'm14-l03',
      moduleId: 'm14',
      title: 'Reporting and Retesting',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m14-l02'],
      objectives: [
        'Assemble findings with the full professional structure',
        'Apply CVSS-style severity reasoning adapted to mobile realities',
        'Map findings to MASVS/MASWE and run a structured retest cycle'
      ],
      diagram: 'masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The report is the product. Everything you found is worth exactly what your writing communicates: a precise title, honest severity, reproducible steps, business impact, and a remediation a developer can actually implement. Writing is a pentest skill, not an administrative afterthought.'
          },
          {
            type: 'p',
            text:
              'Then the loop closes: the client fixes, you retest with your own steps, findings get final statuses, and trust compounds. A methodology without a retest leaves every claim unverified.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Finding anatomy'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Title — specific and calm: what and where ("Order history exposes other users\u2019 orders via object id")',
              'Severity — with reasoning, not just a number',
              'Description — what is wrong, where, under which build/endpoint',
              'Steps to reproduce — numbered, exact, from accounts you control',
              'Impact — the business consequence, in the client\u2019s vocabulary',
              'Evidence — references to the artifacts from lesson m14-l02',
              'Remediation — specific, testable guidance ("enforce per-request ownership checks on /orders/{id}")',
              'Mapping — the MASVS domain and MASWE weakness family the finding violates, plus a stable finding ID'
            ]
          },
          {
            type: 'h',
            text: 'Severity thinking: CVSS-lite for mobile'
          },
          {
            type: 'p',
            text:
              'Borrow the dimensions that matter: exploit vector (network-adjacent via the API? requires local access? physical device theft?), privileges required (none? any account? specific role?), user interaction, scope (does a client-side bug reach server-side data — the scope-change amplifier), and confidentiality/integrity/availability impact. Mobile adds two realities: device loss is a first-class threat model (storage findings matter even without network exploitation), and client-side checks are weaker guarantees than server-side ones (m13). Warn yourself against drama: severity inflation is how credibility dies.'
          },
          {
            type: 'table',
            headers: ['Finding field', 'Question it answers', 'Failure mode when missing'],
            rows: [
              ['Title', 'What broke, where?', 'Vague tickets nobody triages'],
              ['Severity', 'How bad, by what reasoning?', 'Inflated numbers, lost credibility'],
              ['Steps', 'Can I reproduce it?', 'Dispute instead of fix'],
              ['Impact', 'Why should the business care?', 'Fixes deprioritized forever'],
              ['Remediation', 'What exactly should change?', '"Use encryption" and similar shrugs']
            ]
          },
          {
            type: 'h',
            text: 'Mapping to MASVS and MASWE'
          },
          {
            type: 'p',
            text:
              'Cite the MASVS domain (and control-level guidance) the finding violates and, where applicable, the matching MASWE weakness. Mapping gives the client\u2019s security team a common language, lets findings be tracked across engagements, and — back in lesson m14-l01 — proves which areas of the standard your testing actually covered. Never map by vibe: the domain describes the class of problem, and your test evidence shows the instance.'
          },
          {
            type: 'diagram',
            id: 'masvs-map',
            caption: 'Findings land in MASVS domains; the map doubles as your coverage proof.'
          },
          {
            type: 'h',
            text: 'Two audiences, one report'
          },
          {
            type: 'p',
            text:
              'The executive summary speaks risk and money — the handful of findings that matter, what they expose, what fixing them buys — without jargon. The technical body speaks reproduction: steps, evidence, endpoints, versions, remediation. Both must be accurate; they differ in altitude, never in truth.'
          },
          {
            type: 'h',
            text: 'The retest cycle'
          },
          {
            type: 'p',
            text:
              'On the fixed build, re-run each finding\u2019s steps: status becomes fixed, partially fixed, not fixed, or risk accepted (the client\u2019s signed decision). The retest report lists status per finding with fresh evidence, notes any new findings introduced by the fixes, and states clearly what was retested and what was not. Stable finding IDs from the original report are what make this bookkeeping possible.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Findings mapped to MASVS feed directly into the client\u2019s compliance and security-architecture work; severity reasoned in business terms survives management review; and retest discipline is why the same client hires you again. The best testers are not the loudest — they are the ones whose reports nobody has to decode.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Report smells: scanner output pasted as findings, remediation like "follow best practices", severity with no reasoning, steps that only work on your machine',
              'Findings without MASVS mapping — coverage cannot be audited',
              'Missing finding IDs — the retest will drown',
              'Executive claims the technical body cannot support'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Write one complete finding from any earlier exercise — the two-account BOLA test from m10-l04 or the storage dump from m01-l07. Use the template, argue the severity dimension by dimension, map it, and attach the evidence artifacts.'
          },
          {
            type: 'code',
            lang: 'markdown',
            title: 'Finding template (markdown)',
            code:
              '## F-004 — Order history exposes other users\u2019 orders (BOLA)\n- Severity: High\n- Affected: API /api/v1/orders/{id}, app 2.3.1 (build 231)\n- Description: object ids are accepted without ownership checks\n- Steps: 1) create accounts A and B; 2) place order 1041 as B;\n  3) request /orders/1041 with A\u2019s token -> 200, B\u2019s data\n- Impact: cross-user disclosure of purchase history and addresses\n- Evidence: evidence/1041-pair-A.txt, 1041-pair-B.txt (m14-l02 format)\n- Remediation: server-side ownership check per request, fail closed;\n  add a two-account regression test\n- Mapping: MASVS-AUTH (object-level authorization)'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Impact in their language',
            text:
              '"Cross-tenant data exposure" persuades security teams; "customers can read other customers\u2019 orders and delivery addresses" persuades everyone else. Write the impact line for the second audience and the description for the first.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A complete worked micro-example: finding "Debug logs capture credentials" — severity Medium; reasoning: exploitation requires local access (rooted device or adb) but yields reusable credentials; impact: credential disclosure on lost or compromised devices and via log-sharing bugs; remediation: strip sensitive values from logs and verify in the release build; mapping: MASVS-STORAGE/CODE family; evidence: the scoped logcat capture from m01-l08 with tokens redacted. Every field, one screenful, retest-ready.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'The finding template in this lesson — steal it, make it yours',
              'CVSS specification and calculator (first.org) — the dimensions behind your severity reasoning',
              'MASVS / MASWE documentation — the mapping vocabulary',
              'Your evidence repo — findings reference it, retests depend on it'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Severity inflation — one inflated Critical and every future rating gets discounted',
              'Scanner output as findings — unverified, unreproduced, often out of context',
              'Remediation without specificity ("implement security best practices" fixes nothing)',
              'Burying impact under technical detail — the business reader gives up before the point',
              'No stable finding IDs; the retest becomes archaeology',
              'Declaring a retest "passed" from a code review instead of re-running the steps'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take the BOLA exercise from m10-l04 and write the full report entry using the template and the evidence rules from these three lessons. Swap with a peer: they reproduce your finding from the steps alone, then challenge your severity reasoning. The two failure modes — non-reproducible steps and unearned severity — are exactly the ones clients catch first.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'The report is the product; writing is a pentest skill',
              'Severity = vector, privileges, scope, impact — argued, not felt',
              'MASVS/MASWE mapping makes findings speak the industry\u2019s language',
              'Retest with your own steps; assign final statuses; keep finding IDs stable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm14-l03-q1',
          type: 'mcq',
          prompt: 'A client-side bug lets an attacker reach server-side data of other tenants. Which severity dimension does that hit hardest?',
          options: [
            'User interaction',
            'Scope — the vulnerability crosses a trust boundary',
            'Attack complexity only',
            'It does not affect severity'
          ],
          answerIndex: 1,
          hint: 'Who gets hurt when the client is bypassed?',
          explanation:
            'This is CVSS\u2019s scope-change idea: the impact escapes the vulnerable component into another one (the backend, other tenants). Mobile findings that reach server-side data this way rate substantially higher than client-only ones.'
        },
        {
          id: 'm14-l03-q2',
          type: 'short',
          prompt: 'List four required fields of a professional finding besides the title.',
          modelAnswer:
            'Any four of: severity (with reasoning), description (what/where/build), steps to reproduce, impact (business terms), evidence references, remediation (specific and testable), MASVS/MASWE mapping, stable finding ID.',
          hint: 'Think of what a triager, a developer, and a retester each need.',
          explanation:
            'The structure exists so three different readers — triager, developer, retester — each get exactly what they need without having to talk to you.'
        },
        {
          id: 'm14-l03-q3',
          type: 'truefalse',
          prompt: '"Implement security best practices" is an acceptable remediation line for a High finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Can a developer open a ticket from that sentence?',
          explanation:
            'Remediation must be specific and testable: which check, on which endpoint, verified how (e.g., a two-account regression test). Vague remediation is how High findings stay open for quarters.'
        },
        {
          id: 'm14-l03-q4',
          type: 'scenario',
          prompt:
            'The client disputes your High rating for a BOLA finding, saying exploitation "requires an account". Construct your response.',
          modelAnswer:
            'Concede the true premise and re-derive the rating: any authenticated account is exactly the privilege level BOLA assumes, registration is open, and the impact is cross-user data disclosure — privileges required are low, the vector is network-adjacent, and the impact crosses to other users\u2019 data (scope). Support with the evidence pairs and the business impact line. Offer the path forward: implement the ownership check, schedule the retest, and use the two-account suite as the acceptance test.',
          hint: 'Argue dimensions, not adjectives — and end with the path to closure.',
          explanation:
            'Severity disputes resolve through reasoning plus evidence, never volume. "Requires an account" describes authentication, not authorization — the finding stands, and the retest offer converts the argument into work.'
        }
      ],
      references: [
        {
          title: 'FIRST — Common Vulnerability Scoring System (CVSS)',
          url: 'https://www.first.org/cvss/',
          note: 'The specification behind the severity dimensions used in this lesson.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard findings are mapped against.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Per-test references to cite in finding write-ups.'
        }
      ]
    }
  ]
};
