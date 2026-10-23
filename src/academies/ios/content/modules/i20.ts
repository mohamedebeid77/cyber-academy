import type { Module } from '../../../../types';

// LEVEL 8 — CRYPTO & RESILIENCE · Module i20: Jailbreaking & Testing Boundaries
// Original content synthesized from Apple Platform Security and OWASP MASTG
// jailbroken/non-jailbroken testing chapters. Conceptual and lab-focused; no
// jailbreak instructions are provided — the module teaches the landscape and
// the testing-boundary decisions.

export const i20: Module = {
  id: 'i20',
  title: 'Jailbreaking & Testing Boundaries',
  level: 8,
  description:
    'What jailbreaking means architecturally, what it enables for authorized research, and the honest boundary decisions every iOS tester makes: when a jailbroken device is the right tool, what non-jailbroken testing covers, and how findings carry their platform context.',
  outcomes: [
    'Explain jailbreaking at the architecture level (what enforcement is weakened, what remains)',
    'State what each testing boundary enables and costs, per test type',
    'Carry platform context into findings correctly — jailbroken vs stock claims never blur'
  ],
  lessons: [
    {
      id: 'i20-l01',
      moduleId: 'i20',
      title: 'Jailbreaking: Architecture and What It Changes',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i02-l01', 'i07-l02'],
      objectives: [
        'Describe the jailbreak mechanism classes at the architecture level',
        'Enumerate precisely what a jailbroken device enables for testing',
        'State what remains intact — the modern jailbreak is not a free-for-all'
      ],
      diagram: 'ios-jailbreak-types',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A jailbreak exploits a vulnerability chain to weaken the platform\u2019s own enforcement: code signing flexibility, filesystem access, process privilege. For authorized research it is a laboratory instrument — and like any instrument it changes the measurement: findings produced on a jailbroken device carry context that stock-device findings do not. This lesson teaches the landscape at the architecture level (not the how-to — that is community documentation, and version churn makes it unteachable in a curriculum) and the boundary discipline that keeps your evidence honest.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-jailbreak-types',
            caption: 'The jailbreak family: tethered, semi-untethered, rootless — and what each means for testing.'
          },
          { type: 'h', text: 'The mechanism classes' },
          {
            type: 'list',
            items: [
              'Exploit-based chains: browser/kernel/system vulnerabilities chained to gain kernel execution and disable enforcement — device/iOS-version specific, community-maintained',
              'Tethered/semi-tethered/semi-untethered: how the state survives reboots (needs computer / needs app re-run / needs re-run after reboot) — a maintenance property, not a security property',
              'Rootless (modern): the system volume stays sealed (SSV); modifications inject into apps rather than the OS — much of the platform\u2019s integrity survives, and testers must know which parts',
              'What it enables for testing: SSH/root filesystem access, frida-server against any process (store builds included), system-wide tooling, direct keychain/database inspection, tweak-style injection'
            ]
          },
          { type: 'h', text: 'What remains intact — and why it matters' },
          {
            type: 'list',
            items: [
              'Modern rootless jailbreaks leave the sealed system volume, much of AMFI\u2019s per-app enforcement, and the Secure Enclave intact',
              'Consequence: some platform guarantees still HOLD on a jailbroken device — and some findings (class-level crypto claims, enclave behavior) can still be argued there, with care',
              'Consequence 2: do not assume "jailbroken = everything is void" — know your specific jailbreak\u2019s scope; the honest evidence line names it',
              'The tester\u2019s posture: the jailbroken device is for ANSWERING QUESTIONS (store-build internals, system inspection), not for proving platform claims (module i07-l02\u2019s environment honesty, deepened)'
            ]
          },
          { type: 'h', text: 'The boundary decision, formalized' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Can the question be answered non-jailbroken (dev build + Frida gadget, backups, network channels)? → do it there first (weaker context, cleaner claims)',
              'Does the question require store-build internals or system inspection? → jailbroken lab device, documented (model, iOS version, jailbreak type/tool, versions)',
              'Does the question concern platform guarantees (crypto classes, enclave)? → argue from Apple\u2019s documentation + stock-device observation; the jailbroken device answers app questions, not platform questions',
              'Record the boundary decision per test — the report\u2019s methodology section cites it (module i24\u2019s format)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'frida-server against store builds is the jailbreak\u2019s unique testing value — the only path to store-build runtime inspection on real hardware',
              'Filesystem/keychain inspection answers storage questions at their source — i13-l03\u2019s at-rest channel, jailbreak edition',
              'The documentation duties (device, iOS, jailbreak type, tool versions) are what make jailbreak-sourced evidence reviewable',
              'Client constraints (no-jailbreak policies) are scoping realities — module i07-l02\u2019s honest-adaptation pattern governs'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'App behavior that differs on jailbroken devices (detection responses — module i21\u2019s terrain, and a data source: the differences reveal the checks)',
              'Testing questions you are tempted to answer on the jailbroken device that deserve stock-device evidence — the boundary reflex, exercised',
              'Jailbreak-specific artifacts in evidence (tweak directories, injected dylibs) contaminating app-behavior observations — hygiene check per session',
              'Version mismatches between your lab\u2019s iOS and the client\u2019s fleet — transferability notes needed'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Write your lab\u2019s jailbreak profile: device model, iOS version, jailbreak type, installed testing tooling with versions — the standing evidence header',
              'Verify what your jailbreak preserves: test a class-based claim (e.g. data-protection availability windows) and note whether it behaved as documented',
              'Run one store-build runtime question via frida-server (the unique value); record the full context header with the artifact',
              'Run the same question\u2019s non-jailbroken equivalent (if one exists) and compare — the boundary note writes itself from the comparison',
              'Maintain the lab hygiene: dedicated device, updated tooling, no personal accounts (module i07\u2019s checklist, jailbreak edition)'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'The posture, stated plainly',
            text:
              'Jailbreaking your own dedicated lab device for authorized research is legitimate practice. This curriculum does not provide jailbreak instructions (community documentation covers the mechanics, and version churn makes it unteachable here) — it teaches the architectural understanding and the boundary discipline that make jailbreak-sourced findings trustworthy. Never present jailbroken-device behavior as stock-platform behavior; never test apps on a jailbroken device outside authorization.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One question, both boundaries. Question: does the store build\u2019s retry loop reuse expired tokens (module i12-l02\u2019s example, store-build edition)? Non-jailbroken answer: impossible (no hook path on store builds). Jailbroken answer: frida-server attach, trace, capture — confirmed, with the context header (device, iOS 16.6, checkra1n-class, frida versions). Report line: "Confirmed on store build via runtime inspection on a jailbroken laboratory device (context: iPhone X, iOS 16.6, …); platform guarantees on that device are void — the finding is app-level (token reuse logic), unaffected by the jailbreak context." The boundary note pre-empts the reviewer\u2019s first objection and keeps the finding\u2019s claim precise.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The jailbroken lab\u2019s stack: package manager, OpenSSH, frida-server, file/keychain inspection tooling — assembled per community documentation for your device/version. The curriculum\u2019s tools (Frida, proxies, decompilers) all run unchanged; the jailbreak widens which processes they can reach.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming jailbroken devices void ALL platform claims — modern rootless jailbreaks preserve much; know your specific setup',
              'Presenting jailbreak-sourced findings without the context header — evidence without environment is decoration (i07-l02\u2019s rule at full strength)',
              'Answering platform-guarantee questions on the jailbroken device — those argue from Apple documentation and stock observation',
              'Letting lab artifacts contaminate app evidence (tweaks, injected libraries) — hygiene check per session'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write your lab\u2019s jailbreak profile and run the one-question-both-boundaries exercise (or its paper equivalent if no jailbroken device is available: design which questions WOULD need which boundary, for your current target). The profile and the boundary notes are the lesson\u2019s deliverables — the discipline, not the mechanics.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Jailbreak = weakened enforcement (signing flexibility, filesystem, privileges) via exploit chains — device/version specific and community-maintained',
            'Modern rootless jailbreaks preserve much of the platform — know what your setup preserves',
            'The unique testing value: store-build runtime inspection and system-level inspection on real hardware',
            'Context headers and boundary decisions per test — the discipline that makes jailbreak-sourced evidence trustworthy'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i20-l01-q1',
          type: 'mcq',
          prompt: 'What is the unique testing capability a jailbroken device provides that no other environment does?',
          options: [
            'Faster simulators',
            'Runtime inspection of store builds (frida-server against any process) and system-level file/keychain access on real hardware',
            'Access to App Store analytics',
            'Bypassing ATS globally'
          ],
          answerIndex: 1,
          hint: 'Which questions are otherwise unanswerable — store builds on stock devices have no hook path?',
          explanation:
            'Store builds on stock devices have no hook path (module i11-l01) — the jailbreak\u2019s frida-server is the only runtime-inspection route, plus system-level inspection channels (SSH filesystem, keychain tooling).'
        },
        {
          id: 'i20-l01-q2',
          type: 'truefalse',
          prompt: 'On a modern rootless jailbreak, the sealed system volume and much of per-app AMFI enforcement remain intact.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does "rootless" mean about where modifications can go?',
          explanation:
            'True — rootless designs inject into apps rather than modifying the sealed system volume; much enforcement survives. That is why "jailbroken = all guarantees void" is wrong: know your setup\u2019s scope.'
        },
        {
          id: 'i20-l01-q3',
          type: 'scenario',
          prompt:
            'A client prohibits jailbroken devices but asks about store-build runtime behavior. Compose the honest response.',
          hint: 'What CAN be answered (channels from i10/i14), and what gets documented as unreachable?',
          explanation:
            'Answer what non-jailbroken channels cover: static analysis of the extracted binary, network behavior (module pinning caveats), dev/TestFlight-build dynamics as proxies. Document store-build runtime inspection as out of reach under the constraint — with the explicit note that specific runtime questions therefore remain untested. Honest boundaries, stated early (i07-l02\u2019s pattern).'
        },
        {
          id: 'i20-l01-q4',
          type: 'mcq',
          prompt: 'Why must every jailbreak-sourced artifact carry its context header?',
          options: [
            'Formatting requirements',
            'Reviewers must know the environment (device, iOS, jailbreak type, tools) to weigh the evidence — platform claims and app claims separate only with that context',
            'It makes reports longer',
            'Frida requires it'
          ],
          answerIndex: 1,
          hint: 'What is the first rebuttal to any jailbreak-sourced finding — and what pre-empts it?',
          explanation:
            '"You tested on a broken platform" — the context header plus the boundary note (app-level claim unaffected by jailbreak context) is the pre-emption. Without the header, the rebuttal stands; with it, the claim\u2019s scope is explicit.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — System security (what jailbreaks weaken)',
          url: 'https://support.apple.com/guide/security/system-security-secf5708b5ca/web',
          note: 'The enforcement inventory whose weakening defines a jailbreak'
        },
        {
          title: 'OWASP MASTG — iOS testing on jailbroken devices (framing)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s jailbroken/non-jailbroken testing split'
        },
        {
          title: 'Apple Platform Security — Secure volume (SSV) concepts',
          url: 'https://support.apple.com/guide/security/encryption-and-data-protection-sec4ce6b6A7b0/web',
          note: 'The sealed-system-volume property rootless jailbreaks preserve'
        }
      ]
    },
    {
      id: 'i20-l02',
      moduleId: 'i20',
      title: 'Non-Jailbroken Testing: The Full Map',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i20-l01', 'i07-l02'],
      objectives: [
        'Map the complete non-jailbroken testing surface: what each channel answers',
        'Maximize assessment coverage under no-jailbreak constraints',
        'Write coverage statements that survive client review'
      ],
      diagram: 'ios-test-environments',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Most iOS assessments happen without jailbreaks — client policies, device availability, and the genuine sufficiency of non-jailbroken channels for most findings. This lesson assembles the complete non-jailbroken map from the curriculum\u2019s channels: static analysis, dev-build dynamics, network observation, storage via backups, and the gadget path — with the coverage statement that tells clients exactly what was and was not tested.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-test-environments',
            caption: 'The map, re-read as coverage: what each non-jailbroken channel answers.'
          },
          { type: 'h', text: 'The channels, and what each answers' },
          {
            type: 'table',
            headers: ['Channel', 'Answers', 'Cannot answer'],
            rows: [
              ['Static analysis (i08/i09)', 'Code behavior, secrets, config, crypto shapes', 'Runtime conditions, actual enforcement'],
              ['Dev-build dynamics (i10/i11 gadget)', 'Runtime logic, storage decisions, gate behavior', 'Store-build-only behaviors (flags, stripped code)'],
              ['Network observation (i14)', 'Wire truth: tokens, authz, endpoints, pinning posture', 'Traffic your CA cannot see (pinned, non-HTTP)'],
              ['Backup/container analysis (i13)', 'At-rest storage, backup exposure', 'Data excluded from backups, keychain internals'],
              ['Simulator triage (i07)', 'Fast static/API recon', 'Any platform claim (i07-l02\u2019s rule)']
            ]
          },
          { type: 'h', text: 'Coverage maximization, in order' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Request artifacts early: dev/TestFlight builds widen the dynamic tier enormously (module i01-l03\u2019s channel lever — used deliberately)',
              'Gadget-path the dev builds (i11-l01) for full instrumentation without jailbreak',
              'Push network observation to its ceiling: per-session-stack pinning maps, API testing depth (module i15\u2019s systematic work)',
              'Mine backups systematically (i13-l01/l02) — at-rest coverage without device-level access',
              'Then write the coverage statement: channels used, what each answered, what remains untested (and why) — module i24\u2019s methodology section drafts from it'
            ]
          },
          { type: 'h', text: 'The coverage statement' },
          {
            type: 'p',
            text:
              'The formula: "Assessment coverage: [channels used, with artifact counts]. Findings validated on [channel/build matrix]. Not covered under the no-jailbreak constraint: [store-build runtime inspection of X, Y]. Risk note: [what that limitation means for the findings\u2019 completeness]." Clients respect precise limitation statements; they attack vague ones. The statement is one paragraph and earns more trust than any amount of findings padding.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The non-jailbroken map covers the overwhelming majority of finding families — constraint-driven assessments remain valuable assessments',
              'Artifact requests (dev builds) are the highest-leverage scope conversation — ask in week one, not week three',
              'The coverage statement is the no-jailbreak engagement\u2019s centerpiece paragraph — write it first, findings second',
              'Transferability notes (dev-build findings → store builds) close the last credibility gap (module i01-l03\u2019s re-validation rule)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Channel gaps you are leaving open (backup analysis skipped, gadget path unexplored) before declaring limits',
              'Dev-build-only behaviors presented as store behaviors without the transferability note',
              'Coverage statements that hide behind "full assessment" claims — the specific-coverage honesty wins reviews',
              'Test-matrix questions (i07-l02\u2019s decision table) that changed after artifacts arrived — update the table, not just the findings'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory your current target\u2019s channel usage: which of the five channels have you actually exercised?',
              'Close the gaps that are open (backup mining and gadget-pathing are the usual skips)',
              'Write the coverage statement for your target: channels, answers, limits, risk note',
              'Add transferability notes to dev-build-sourced findings (or plan the re-validation)',
              'File the statement in the evidence bundle — it anchors the methodology section (i24)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A coverage statement, written out. "Coverage: static analysis of build 418 (IPA hash ab12…); dynamic testing on dev build 417 via re-signed gadget (7 instrumented sessions); network observation across 4 session stacks (2 pinned, refused; 2 default); container analysis via unencrypted backup parse; 14 API tests across 6 endpoints. Not covered under no-jailbreak constraint: store-build runtime inspection (certificate-refresh logic, suspected retry loop) — static evidence suggests the behavior; dynamic confirmation untestable without jailbreak instrumentation. Risk note: findings stand on the covered channels; the uncovered slice affects confidence in the retry-loop hypothesis only." Precise, review-proof, one paragraph — the map\u2019s deliverable.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Everything the curriculum built: the gadget path (i11/i22), backup tooling (i13), network stack (i14), static pipeline (i08/i09). This lesson adds no tools — it adds the coverage thinking that assembles them into constraint-compliant engagements.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Declaring limits before exhausting channels (the usual skips: backup mining, gadget pathing)',
              'Coverage statements that claim "full assessment" — the specific-honesty form survives review; the vague form invites the jailbreak question',
              'Forgetting transferability notes on dev-build findings',
              'Treating simulator work as coverage — it is triage (i07-l02), and the statement must say so'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the channel inventory for your training target, close one gap, and write the full coverage statement. Then read it as a skeptical client: does every claim cite a channel and artifact count? If yes, the no-jailbroken discipline is yours — the capstone (i24) will reuse this paragraph structure verbatim.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Five non-jailbroken channels answer most finding families — constraint-driven assessments are genuinely sufficient for most targets',
            'Artifact requests and the gadget path are the coverage levers — pull them before declaring limits',
            'The coverage statement (channels, answers, limits, risk note) is the engagement\u2019s trust centerpiece',
            'Transferability notes close the dev-build/store-build credibility gap'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i20-l02-q1',
          type: 'mcq',
          prompt: 'Under a no-jailbreak constraint, which artifact request most increases assessment coverage?',
          options: [
            'The App Store marketing screenshots',
            'A dev-signed or TestFlight build — it opens the gadget-path dynamic tier (instrumentation without jailbreak)',
            'The backend API documentation only',
            'The crash-report dashboard'
          ],
          answerIndex: 1,
          hint: 'Which artifact changes which channel\u2019s ceiling?',
          explanation:
            'Dev/TestFlight builds enable re-signed gadget instrumentation (module i11-l01) — the entire dynamic tier without a jailbreak. It is the highest-leverage request; ask early.'
        },
        {
          id: 'i20-l02-q2',
          type: 'truefalse',
          prompt: 'Under no-jailbreak constraints, keychain internals are fully testable via backup parsing.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the backup include — and what does the keychain channel need?',
          explanation:
            'False — backups exclude keychain items (module i05-l02\u2019s ThisDeviceOnly semantics and platform design). Keychain verification runs via the SecItem observation hooks on hookable builds (i13-l03) or jailbroken labs — the coverage statement names which was used.'
        },
        {
          id: 'i20-l02-q3',
          type: 'scenario',
          prompt:
            'Draft the "not covered" sentence for a no-jailbreak engagement where the client suspects a store-build retry-loop bug.',
          hint: 'What is the static evidence\u2019s status, what is untestable, and what does the risk note say?',
          explanation:
            '"Not covered: store-build runtime confirmation of the suspected retry-loop behavior (static evidence: [symbols/strings]; dynamic confirmation requires hook access unavailable on store builds without jailbreak instrumentation). Risk note: the hypothesis rests on static evidence alone; findings on other channels are unaffected." Precise limit, scoped risk — the template in action.'
        },
        {
          id: 'i20-l02-q4',
          type: 'mcq',
          prompt: 'Why do transferability notes accompany dev-build findings?',
          options: [
            'To make findings seem weaker',
            'Channel differences (entitlements, flags, stripped code) can change behavior — the note states which findings re-validated on the shipped channel and which are dev-build-scoped',
            'Clients request them by law',
            'They replace re-testing'
          ],
          answerIndex: 1,
          hint: 'What did module i01-l03 establish about findings traveling across channels?',
          explanation:
            'The note is the honesty mechanism for channel drift: either the finding re-validated on the shipped channel, or its scope says dev-build explicitly. Reviewers accept both; they reject silent transfer.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS testing without a jailbreak',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The non-jailbroken testing chapters this map formalizes'
        },
        {
          title: 'Apple Developer — TestFlight and beta distribution',
          url: 'https://developer.apple.com/testflight/',
          note: 'The artifact-request lever\u2019s official channel'
        },
        {
          title: 'OWASP MASVS — RESILIENCE (why non-jailbroken coverage remains valid)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard\u2019s framing of assessment coverage'
        }
      ]
    }
  ]
};
