import type { Module } from '../../../../types';

// LEVEL 9 — STANDARDS & PRO PRACTICE · Module i24: Professional iOS Pentest Methodology
// The capstone: the full engagement methodology, the professional checklist,
// and the guided final assessment tying every module into one workflow.

export const i24: Module = {
  id: 'i24',
  title: 'Professional iOS Pentest Methodology',
  level: 9,
  description:
    'The capstone: the complete engagement methodology from scope to retest, the professional checklist, and the guided full assessment that walks every phase with the artifacts, evidence and reporting discipline this academy built. Finish here and the workflow is yours.',
  outcomes: [
    'Run the complete iOS assessment methodology across its 22 phases',
    'Produce the professional deliverables: checklist, evidence bundle, findings, report',
    'Complete the guided capstone assessment integrating all 24 modules'
  ],
  lessons: [
    {
      id: 'i24-l01',
      moduleId: 'i24',
      title: 'The Methodology: Scope to Retest',
      difficulty: 'Advanced',
      minutes: 28,
      prerequisites: ['i23-l02'],
      objectives: [
        'Walk the 22-phase methodology with each phase\u2019s inputs, outputs and artifacts',
        'Assemble the professional checklist as the engagement\u2019s runbook',
        'Understand the reporting and retest cycle as the methodology\u2019s contract'
      ],
      diagram: 'ios-methodology-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Everything before this module was technique; this is the workflow that deploys it. The methodology runs 22 phases — each with defined inputs, outputs and artifacts — so that engagements are repeatable, evidence is complete, and reports argue from coverage rather than heroics. Every module in this academy mapped onto a phase; now the phases assemble.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-methodology-pipeline',
            caption: 'The full pipeline: 22 phases from scope to retest — each module lives here.'
          },
          { type: 'h', text: 'The phases, compressed' },
          {
            type: 'table',
            headers: ['Phase', 'Module', 'Output artifacts'],
            rows: [
              ['1. Scope & ROE', 'i01-l02, i20', 'Signed scope; environment decision table; channel plan'],
              ['2. Acquire app', 'i08-l01', 'Acquisition record; artifact hashes; channel verification'],
              ['3. Environment', 'i07', 'Workbench profile; proxy baseline; lab hygiene record'],
              ['4–5. IPA & metadata / Info.plist', 'i04', 'Mach-O profile; five plist lists; bundle inventory'],
              ['6–7. Entitlements / code signing', 'i06', 'Entitlement report; signature contradictions; coherence notes'],
              ['8–9. Static analysis / reversing', 'i08, i09', 'Sweep tables; target list; RE paragraphs; static findings doc'],
              ['10. Runtime analysis', 'i10', 'Observation designs; diff pairs; runtime-state notes'],
              ['11. Instrumentation', 'i11, i12', 'Hook transcripts; LLDB session notes; instrument labels'],
              ['12–13. Storage / privacy channels', 'i13', 'Container inventory; keychain reconciliation; privacy tests'],
              ['14. Network', 'i14', 'Endpoint/behavior table; pinning evaluations; token analyses'],
              ['15–16. Auth / authorization', 'i15', 'Gate verdicts; forge-and-listen pairs; BOLA systematic table'],
              ['17. Platform surface', 'i16, i17', 'Crossing map; WebView section; chain narratives'],
              ['18. Cryptography', 'i18', 'Dimension inventories; lifecycle tables; section verdicts'],
              ['19–20. Resilience / tampering', 'i21, i22', 'Control grades; attempt chains; patch ledger'],
              ['21–22. Evidence, findings, report, retest', 'i23, this module', 'Evidence bundle; findings with citation chains; report; retest plan']
            ]
          },
          { type: 'h', text: 'The professional checklist' },
          {
            type: 'list',
            items: [
              'Pre-engagement: scope signed, channels confirmed, environment decision table, artifacts requested (module i20-l02\u2019s leverage, used early)',
              'Per-phase gates: each phase\u2019s output artifacts exist and are hashed before the next begins (the discipline that prevents browsing-drift at engagement scale)',
              'Evidence hygiene throughout: every artifact labeled (device, build, channel, tool versions, date) and hashed — the bundle builds itself',
              'Finding discipline: static pattern + dynamic artifact (the minimum pair), citation chain complete (module i23\u2019s form), layer attribution explicit',
              'Reporting: coverage statement (module i20-l02\u2019s form), category-organized sections (module i23\u2019s map), remediation routing per finding, retest plan with verifiable criteria'
            ]
          },
          { type: 'h', text: 'The report and retest cycle' },
          {
            type: 'list',
            items: [
              'Report structure: executive summary (findings by severity, coverage statement), methodology (phases, environment, coverage), findings per MASVS category (citation chains, artifacts), appendices (evidence index)',
              'Severity arguments: reachable attacker positions × impact, argued from artifacts — module i01-l02\u2019s zone discipline at report scale',
              'Remediation routing: each finding names its fix layer and owner (the two-layer rule from i15-l02, everywhere)',
              'Retest: each finding\u2019s retest criterion is the verification that closed it (the BOLA probe re-run, the plist re-pulled, the capture re-taken) — verifiable by construction',
              'The cycle closes: retest artifacts join the evidence bundle; the engagement\u2019s story is complete and reproducible'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The methodology is what clients actually buy: not findings alone — repeatable, evidenced, retestable process. Teams that run it produce reports that survive review, remediation that lands, and retests that close. Teams that improvise produce screenshots. Every habit this academy drilled (diff pairs, instrument labels, citation chains, coverage statements) exists because at methodology scale, discipline is the product.'
          },
          {
            type: 'list',
            items: [
              'Phase gates prevent the drift patterns (browsing, unverified claims, unlabeled evidence) at scale',
              'The checklist is the runbook: print it, work it, annotate it — engagements are executed against it',
              'The retest plan is the report\u2019s contract: verifiable criteria turn retesting from argument into execution',
              'Coverage statements and environment honesty (i20/i07) are methodology sections, not afterthoughts'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Phase-gate skips under time pressure (static findings without dynamic confirmation entering the report) — the gate exists for the deadline',
              'Evidence bundle entropy (unlabeled artifacts, missing hashes) accumulating quietly — audit the bundle per phase',
              'Severity inflation under client pressure (or deflation under relationship pressure) — the zone discipline (i01-l02) is the anchor',
              'Retest criteria that cannot be verified (vague remediations) — rewrite them at report time, not retest time'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Write the 22-phase checklist in your own words with artifact lists per phase (the runbook — yours, not this table\u2019s copy)',
              'Map your existing evidence bundle against the phases: which phases have artifacts, which are gaps?',
              'Draft the report skeleton: executive summary, methodology, category sections, appendices — populated with your real artifact counts',
              'Write retest criteria for your three strongest findings — verifiable by construction',
              'Identify the one phase your workflow skips most often — that is lesson 2\u2019s capstone focus'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One finding\u2019s full methodology lifecycle. Phase 8 (static): sweep finds the mockAuthEnabled flag; target list entry with imp. Phase 11 (instrumentation): hook transcript shows the flag\u2019s reader and its source plist. Phase 12 (storage): diff pair shows the plist\u2019s writer (backup-included). Phase 16 (platform): deep link test shows the plist value\u2019s influence path. Phase 22 (report): finding written with the citation chain (MASWE storage/config reference, MASTG family, MASVS-STORAGE/PLATFORM), artifacts cited (sweep line, transcript, diff pair, deep link probe), severity argued (reachable positions), remediation routed (validation at both write and read), retest criterion ("re-pull plist post-fix; re-run deep link probe; expect rejection at read"). Six phases, five artifacts, one verifiable finding — the methodology\u2019s unit of work at full scale.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Your checklist (document), the evidence bundle\u2019s structure (folders per phase, hash manifest), the report template (yours, informed by module i23\u2019s categories), and the retest log. The tooling is complete — this lesson is its orchestration.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Running phases out of order under pressure (dynamic work before static context — the drift patterns return at scale)',
              'Evidence bundles assembled at the end (retrospective labeling fails; the bundle builds per phase)',
              'Findings entering reports without the minimum evidence pair (static + dynamic) — the gate that protects report credibility',
              'Retest criteria written at retest time (unverifiable by then) — they are report-time work'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce your 22-phase runbook, the bundle-vs-phases gap analysis, and the report skeleton with real artifact counts. Then answer the skip-pattern question honestly — the capstone (next lesson) runs the full workflow, and your answer names where to watch yourself.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            '22 phases, each with defined inputs/outputs/artifacts — repeatable process is the product clients buy',
            'Phase gates and per-phase evidence hygiene keep the bundle clean and the drift patterns out',
            'The report\u2019s shape: coverage statement, methodology, category sections with citation chains, retest plan',
            'Retest criteria are verifiable by construction — the report\u2019s contract with the future'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i24-l01-q1',
          type: 'mcq',
          prompt: 'What makes a finding\u2019s retest criterion "verifiable by construction"?',
          options: [
            'It is short',
            'It re-runs the exact verification that closed the finding (the probe, the pull, the capture) with an expected observable result',
            'The client writes it',
            'It cites the fix ticket'
          ],
          answerIndex: 1,
          hint: 'What did the methodology\u2019s finding already contain that the retest reuses?',
          explanation:
            'The finding\u2019s confirming artifact defines its own retest: the BOLA probe re-run, the plist re-pulled, the capture re-taken — each with the expected clean result. Verifiability is inherited from the evidence pair, not invented at retest time.'
        },
        {
          id: 'i24-l01-q2',
          type: 'truefalse',
          prompt: 'Under deadline pressure, static-only findings may enter the report as long as they are labeled "potential".',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the phase gate require — and what does the "potential" label do to report credibility?',
          explanation:
            'False — the minimum evidence pair (static pattern + dynamic artifact) is the gate; "potential" findings without it degrade the report\u2019s credibility wholesale. Findings that cannot be confirmed in time go to the report\u2019s "limitations/further work" section explicitly — labeled scope, not diluted findings.'
        },
        {
          id: 'i24-l01-q3',
          type: 'scenario',
          prompt:
            'Your evidence bundle has unlabeled captures from three different devices. What does the methodology require, and when?',
          options: [
            'Nothing — captures are self-evident',
            'Per-phase hygiene: relabel with device/build/channel/tool/date context and hash — audit the bundle at each phase gate, not at report time',
            'Delete the unlabeled ones',
            'Label them only if a finding cites them'
          ],
          answerIndex: 1,
          hint: 'When does the bundle build itself — and what does retrospective labeling actually recover?',
          explanation:
            'The bundle builds per phase (the gate discipline); retrospective labeling usually cannot recover context (which device? which build?) — the methodology prevents the loss rather than repairing it. Audit per phase.'
        },
        {
          id: 'i24-l01-q4',
          type: 'mcq',
          prompt: 'Why does the report lead with the coverage statement?',
          options: [
            'Tradition',
            'It frames every finding\u2019s weight: reviewers weigh results against what was and was not tested — honest coverage is the report\u2019s credibility foundation',
            'It hides thin findings',
            'Clients require it in contracts'
          ],
          answerIndex: 1,
          hint: 'What does the reviewer need before evaluating any individual finding?',
          explanation:
            'Coverage context: findings read differently against full-network-access coverage than against backup-parse-only coverage. The statement (module i20-l02\u2019s form) is the frame that makes every finding\u2019s claim interpretable — credibility first, content second.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG (the methodology\u2019s standard backing)',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Cite the current version; the phases map onto its test families'
        },
        {
          title: 'OWASP MASVS v2 (report structure\u2019s categories)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The category sections\u2019 requirement backing'
        },
        {
          title: 'OWASP Mobile Application Security (project home)',
          url: 'https://mas.owasp.org/',
          note: 'The framework\u2019s home — the report\u2019s citation anchor'
        }
      ]
    },
    {
      id: 'i24-l02',
      moduleId: 'i24',
      title: 'The Guided Capstone: A Full iOS Assessment',
      difficulty: 'Advanced',
      minutes: 45,
      prerequisites: ['i24-l01'],
      objectives: [
        'Execute the complete methodology end to end on a training target',
        'Produce the full deliverable set: runbook, evidence bundle, findings, report, retest plan',
        'Graduate: know your workflow\u2019s remaining edges and the practice plan that closes them'
      ],
      diagram: 'ios-methodology-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The capstone runs the whole machine: a full assessment of a training target (OWASP\u2019s MASTestApp-iOS or an equally licensed lab app), executed through all 22 phases, producing the complete deliverable set. It is long, it is the academy\u2019s summit, and it is deliberately achievable — every technique was rehearsed; this is orchestration. The lesson guides the run and defines graduation.'
          }
        ],
        technical: [
          { type: 'h', text: 'The run, staged with time boxes' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Stages 1–3 (60 min): scope note (self-authorized lab), acquisition record, environment profile — the runbook\u2019s opening phases executed for real',
              'Stages 4–9 (90 min): bundle triage, plist lists, entitlement report, static sweeps, target list, RE paragraphs — the static half, phase-gated',
              'Stages 10–14 (90 min): observation designs executed, instrumentation sessions (hook transcripts), container and keychain work, network matrix — the dynamic core',
              'Stages 15–20 (90 min): auth verdicts, BOLA probes (against the training API), platform-surface matrix, crypto audit, resilience grades — the specialized tiers',
              'Stages 21–22 (60 min): evidence bundle finalized (hash manifest), findings with citation chains, report drafted (coverage statement, category sections), retest plan — the delivery'
            ]
          },
          { type: 'h', text: 'The deliverable set (graduation artifacts)' },
          {
            type: 'list',
            items: [
              'The runbook (annotated during the run — your 22-phase checklist, worked)',
              'The evidence bundle (per-phase folders, hash manifest, instrument labels throughout)',
              'The findings register (minimum five findings across at least four MASVS categories, citation chains complete, minimum evidence pairs everywhere)',
              'The report (executive summary, methodology with coverage statement, category sections, retest plan)',
              'The edge list: where your workflow wobbled during the run — the honest output that names your practice plan'
            ]
          },
          { type: 'h', text: 'Graduation and after' },
          {
            type: 'list',
            items: [
              'Graduation bar: the deliverable set exists, the minimum evidence pairs hold everywhere, the coverage statement is honest, at least one finding carries the full citation chain',
              'The edge list converts to a practice plan: each edge names its module\u2019s Try-It exercises (the thin-row discipline from i23-l02, applied to yourself)',
              'Continuing practice: rotate training targets, keep the runbook current (tooling churns — module versions age), contribute findings back to training-app communities',
              'The academy\u2019s promise, kept: from "I know almost nothing about iOS security" to a full, evidenced, professional assessment — the workflow is yours now; the targets must always be authorized ones'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'The last word on authorization',
            text:
              'Every capability this academy taught is bounded by the same rule it started with: own it, license it, or hold written authorization. The skills are platform-portable and durable; the authorization discipline is what makes them a profession. Welcome to iOS application security — work it honestly.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The capstone is the interview-ready portfolio piece: a complete assessment with professional deliverables demonstrates the whole stack — methodology, technique, evidence discipline, reporting. Teams hire the workflow, not the tool list.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Phase-gate discipline holding under time-box pressure (the runbook\u2019s real test)',
              'Evidence hygiene surviving the run\u2019s length (labels and hashes at hour four, not just hour one)',
              'The edge list\u2019s honesty (wobbles named, not hidden — the practice plan\u2019s raw material)',
              'Citation chains on headline findings (the i23 discipline at report scale)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The capstone IS the test — run it. Time-box honestly, gate honestly, produce the five deliverables. Then self-grade against the graduation bar, write the practice plan from the edge list, and file everything. Revisit quarterly: new targets, updated tooling, the runbook as a living document.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A capstone\u2019s edge list, real shape. "Edges: (1) phase 11 ran long — hook sessions drifted (browsing recurred under time pressure; i11-l03\u2019s reconciliation discipline needs drill); (2) coverage statement written last-minute (should draft at phase 3 — i20-l02\u2019s lesson re-learned); (3) crypto section thin — i18-l01\u2019s Try-It skipped earlier, paid for here. Practice plan: re-run module i11-l03\u2019s exercise on a new target this week; draft coverage statements at environment phase henceforth; execute i18\u2019s inventory exercise on the next lab target." Three edges, three named remedies, three modules cited — the honest output that makes the practice plan real. That document, alongside the report, is graduation.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Everything — the full academy\u2019s tooling, your runbook, your scripts and checklists. The training target: OWASP\u2019s MASTestApp-iOS (or an equally licensed lab app). Nothing new; everything integrated.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping the time boxes (the run\u2019s realism dies; the edge list stops being honest)',
              'Self-grading leniently at the graduation bar (the minimum evidence pair is the bar for a reason — the first client report will be reviewed harder than this)',
              'Treating the edge list as failure record (it is the practice plan\u2019s input — the most valuable document of the five)',
              'Archiving without revisiting — the quarterly rotation keeps the workflow alive; archived skills decay'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the capstone. Produce the five deliverables. Self-grade. Write the practice plan. Then — and only then — consider the academy complete: 24 modules, one workflow, yours. The Cyber Academy platform\u2019s next academies will find you ready.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The capstone: full methodology, real target, five deliverables, time-boxed and phase-gated',
            'The graduation bar: minimum evidence pairs everywhere, honest coverage, citation chains on headlines',
            'The edge list is the practice plan\u2019s raw material — the run\u2019s most valuable output',
            'Authorization discipline is the profession\u2019s foundation — the academy\u2019s first rule is its last'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i24-l02-q1',
          type: 'mcq',
          prompt: 'What distinguishes the capstone\u2019s run from the module exercises that preceded it?',
          options: [
            'Harder techniques',
            'Orchestration: all 22 phases in sequence with phase gates, time boxes and the full deliverable set — no new technique, total integration',
            'A different platform',
            'Longer code samples'
          ],
          answerIndex: 1,
          hint: 'What was actually new in this module — technique or workflow?',
          explanation:
            'Nothing technical is new: the capstone is orchestration — the workflow executed end to end under realistic constraints. That is why every prior module\u2019s Try-It exercises were rehearsals, and why the edge list (not new findings) is its most valuable output.'
        },
        {
          id: 'i24-l02-q2',
          type: 'truefalse',
          prompt: 'The edge list documents your workflow\u2019s failures and is therefore internal only — it never joins the deliverables.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did the lesson name as the edge list\u2019s role — and for whom?',
          explanation:
            'False — the edge list IS a deliverable: it converts the run\u2019s wobbles into a concrete practice plan and demonstrates exactly the self-assessment honesty the profession runs on. Internal-only thinking hides the most valuable document.'
        },
        {
          id: 'i24-l02-q3',
          type: 'scenario',
          prompt:
            'During the capstone, phase 11 (instrumentation) consumed double its time box on drifting hook sessions. What does the edge-list entry look like?',
          hint: 'Name the drift pattern, cite its module, prescribe the remedy — the three-part shape.',
          explanation:
            '"Edge: phase 11 overran — hook sessions drifted into browsing (unverified claims, unfocused targets); pattern named in module i09-l04/i11-l03. Remedy: re-run the enumeration/reconciliation exercise on a fresh target within the week; enforce one-question-per-session in the runbook explicitly." Pattern, module, remedy — the shape that makes the practice plan executable.'
        },
        {
          id: 'i24-l02-q4',
          type: 'mcq',
          prompt: 'What is the academy\u2019s final word on where these capabilities apply?',
          options: [
            'Anywhere curiosity leads',
            'Owned systems, licensed training targets, and engagements with explicit written authorization — the discipline from lesson one, unchanged at graduation',
            'Only iOS apps over a size threshold',
            'Wherever clients ask, however they ask'
          ],
          answerIndex: 1,
          hint: 'What bounded every lab, every bypass, every patch in this curriculum — and what bounds your career?',
          explanation:
            'The authorization discipline is the constant: it framed module i01-l01\u2019s first callout and caps module i24-l02\u2019s last. Technical skill without it is liability; with it, it is the profession. Graduation means both.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTestApp-iOS (the capstone\u2019s training target)',
          url: 'https://github.com/OWASP/MASTestApp-iOS',
          note: 'The licensed lab app this curriculum rehearsed against throughout'
        },
        {
          title: 'OWASP MASVS / MASTG / MASWE (the report\u2019s framework)',
          url: 'https://mas.owasp.org/',
          note: 'The citation chains and category sections\u2019 living sources'
        },
        {
          title: 'Apple Platform Security (the platform reference you will keep open)',
          url: 'https://support.apple.com/guide/security/welcome/web',
          note: 'The reference that outlives the course — platform claims argue from it'
        }
      ]
    }
  ]
};
