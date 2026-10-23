import type { Module } from '../../../../types';

// LEVEL 8 — CRYPTO & RESILIENCE · Module i21: Anti-Debugging & Anti-Instrumentation
// Original content synthesized from Apple Platform Security, OWASP MASTG
// resilience chapters and public research on iOS anti-analysis techniques.
// All bypass discussion is conceptual + lab-framed (authorized targets only).

export const i21: Module = {
  id: 'i21',
  title: 'Anti-Debugging & Anti-Instrumentation',
  level: 8,
  description:
    'Resilience from the tester\u2019s chair: what debugger/jailbreak/hook detection actually detects, how to identify each mechanism statically and at runtime, how each affects testing, and how to evaluate bypasses honestly on authorized lab targets — measuring control quality, never shipping magic scripts.',
  outcomes: [
    'Catalog the anti-analysis mechanism families and what each detects',
    'Identify mechanisms statically (symbols/strings/decompilation) and confirm at runtime',
    'Evaluate bypasses with the why-it-works/why-it-fails discipline on lab targets',
    'Grade resilience controls against MASVS-RESILIENCE as measured effort, not theater'
  ],
  lessons: [
    {
      id: 'i21-l01',
      moduleId: 'i21',
      title: 'The Detection Families: What They Watch For',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i11-l05', 'i20-l01'],
      objectives: [
        'Catalog debugger, jailbreak, hook and integrity detection mechanisms',
        'Explain what signal each mechanism measures and its failure modes',
        'Map the families onto the tester\u2019s own tooling footprint'
      ],
      diagram: 'ios-anti-analysis-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Anti-analysis is the app watching the platform for signs it is being watched. Every mechanism detects a SIGNAL — a debugger\u2019s ptrace state, a jailbreak\u2019s filesystem traces, a hooking engine\u2019s loaded libraries. Understanding the signal is the whole game: it tells you what the check sees, why bypassing works, and when the bypass fails. This lesson catalogs the families through that lens.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-anti-analysis-map',
            caption: 'Interactive: each family\u2019s mechanism, identification path, and evaluation view.'
          },
          { type: 'h', text: 'Family 1: debugger detection' },
          {
            type: 'list',
            items: [
              'ptrace(PT_DENY_ATTACH): the classic — the process asks the kernel to refuse debuggers at startup (visible as an import/call in static analysis; the reason attach fails with an obvious error)',
              'Runtime self-checks: sysctl querying its own process flags (P_TRACED), probing exception ports — detects attach-state at arbitrary moments',
              'Signal shape: LLDB/Frida attach fails or the process exits on attach — the tester\u2019s first encounter with the family'
            ]
          },
          { type: 'h', text: 'Family 2: jailbreak detection' },
          {
            type: 'list',
            items: [
              'Filesystem probes: existence checks for jailbreak artifacts (Cydia paths, /bin/bash, sshd, symlinks, unusual mounts)',
              'Behavioral probes: writing outside the sandbox (should fail, succeeds if enforcement weakened), fork() success, URL scheme opens (cydia://)',
              'Signal quality: each probe is individually spoofable — robust implementations check MANY signals and rate-limit/flag on ANY failure (the robustness spectrum is the evaluation axis)'
            ]
          },
          { type: 'h', text: 'Family 3: hook/instrumentation detection' },
          {
            type: 'list',
            items: [
              'Loaded-image scanning: enumerating loaded dylibs for frida-agent/gadget names',
              'Port scanning: frida-server\u2019s default ports (27042/27043) on localhost',
              'Runtime anomalies: ObjC class inventories containing Frida\u2019s agent classes, function-pointer sanity (code pages modified — checksums), symbol interposition checks',
              'Signal quality: the strongest family (it detects the tool itself) — and the reason gadget-mode/re-named operation exists; also the reason your hooks can BE the detection trigger'
            ]
          },
          { type: 'h', text: 'Family 4: integrity/anti-tamper' },
          {
            type: 'list',
            items: [
              'Self-validation: the app re-checks its own signature (SecCode validity), bundle hashes (CodeResources-class checks), provisioning profile presence',
              'Consequence: bypasses that RE-SIGN (module i22) update the signature — checks validating "original team/hash" fail; checks validating "signature valid" pass — knowing which the app implements decides the bypass design',
              'Environment checks: simulator detection, locale/time/VPN oddities — fraud-signal shaped, business-logic relevant (module i15\u2019s taxonomy)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Detection mechanisms are findings-adjacent: their presence, quality and failure handling are MASVS-RESILIENCE evidence (measured effort, not presence)',
              'The signal lens explains tool behavior: attach failures (family 1), session crashes on hook (family 3) — your module i11/i12 failures were data all along',
              'Robustness spectrum evaluation: one spoofable probe = theatrical; many layered signals + sane failure handling = measured control',
              'Bypass design follows the signal: spoof the signal (family 2\u2019s file probes), hide from it (family 3\u2019s library scan), or satisfy it (family 4\u2019s re-signing)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Imports/strings naming the families: ptrace, sysctl, PT_DENY_ATTACH, Cydia paths, frida strings (double-edged: detection code hunting frida contains the string itself)',
              'Central detection functions (one decision point aggregating signals — the robust implementations) vs scattered probes',
              'Failure handling: exit? degrade? flag-and-report? (the report-shaped behavior — silent degradation is a business-logic finding too)',
              'Integrity checks\u2019 target: signature-validity vs original-team (decides module i22\u2019s bypass shape)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Static sweep: hunt the family vocabularies (strings/imports/metadata) and map suspected detection functions (i09\u2019s session discipline)',
              'Runtime confirmation: exercise the app under each of your instruments (attach, hook, jailbroken) and observe which defenses trip (log/exit/degrade) — your tooling footprint as the test stimulus',
              'Signal attribution: for each tripped defense, attribute the signal (which check fired) via hook observation or decompilation',
              'Map the robustness spectrum: probes per family, layering, failure handling — the evaluation table\u2019s rows',
              'Feed module i22: which defenses affect patching (integrity family), which affect runtime testing (families 1–3)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The robustness spectrum, one app. Training app\u2019s jailbreak detection: 14 filesystem probes (Cydia paths, sshd, symlinks), fork() test, scheme probe — aggregated in one function (i19-l03\u2019s chokepoint map found it), failure = flag-and-degrade (features locked, no exit). Evaluation: broad signal set, layered, sane failure handling — a MEASURED control (MASVS-RESILIENCE pass with notes). Contrast target: one probe (/Applications/Cydia.app) with process exit on failure — theatrical (single spoofable signal, brittle failure). Same family, opposite grades — the spectrum is the finding, and both rows cite their evidence (probe lists from decompilation, behavior from runtime observation).'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The static pipeline (i08/i09) for the vocabulary hunt, Frida (runtime confirmation + signal attribution), and the chokepoint call-map script (i19-l03) — the detection function\u2019s aggregator is a chokepoint like any other. Your instruments\u2019 failure logs (i11/i12 sessions) are the test stimuli\u2019s record.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating detection presence as the finding — quality (signal breadth, layering, failure handling) is the finding; presence is context',
              'Attributing crashes to "anti-tamper" without signal attribution — jetsam, watchdog and your own hook bugs mimic it (module i03-l04\u2019s attribution rule)',
              'Bypassing first, mapping second — the signal map IS the analysis; bypass without it is guessing',
              'Forgetting family 4\u2019s bypass-shape dependency (signature-valid vs original-team) before planning module i22 work'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the family map for your training app: static vocabulary sweep, runtime confirmation per instrument, robustness-spectrum table with evidence. Then write one graded verdict (measured vs theatrical) — the family map is module i21\u2019s spine; bypass work (next lessons) hangs on it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Every anti-analysis mechanism detects a SIGNAL — the signal lens explains behavior, bypass design and failure modes',
            'Four families: debugger (ptrace/self-checks), jailbreak (filesystem/behavioral), hooks (library/port/anomaly), integrity (self-validation)',
            'The robustness spectrum (signal breadth × layering × failure handling) is the evaluation axis',
            'Your instruments\u2019 failure logs are test stimuli records — the detections were mapping you all along'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i21-l01-q1',
          type: 'mcq',
          prompt: 'What signal does ptrace(PT_DENY_ATTACH) detect — or rather, prevent?',
          options: [
            'It detects jailbroken filesystems',
            'It does not detect — it PREVENTS: asks the kernel to refuse debugger attachment to the process',
            'It detects Frida\u2019s loaded libraries',
            'It validates the code signature'
          ],
          answerIndex: 1,
          hint: 'Family 1\u2019s classic is preventive, not detective — what does the call request?',
          explanation:
            'PT_DENY_ATTACH is a prevention request to the kernel: debuggers cannot attach (the mechanism, not a check). Static visibility (the import/call) and the attach-failure shape make it the family\u2019s easiest identification.'
        },
        {
          id: 'i21-l01-q2',
          type: 'truefalse',
          prompt: 'A jailbreak check that probes /Applications/Cydia.app constitutes a robust control.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the robustness spectrum weigh — signal breadth and layering?',
          explanation:
            'False — one spoofable filesystem probe is theatrical: trivially satisfied by creating the path, brittle in failure handling (exit). Robustness = many layered signals + aggregated decision + sane failure handling.'
        },
        {
          id: 'i21-l01-q3',
          type: 'scenario',
          prompt:
            'Your Frida session crashes the app on hook installation. Before blaming anti-hooking, what three attributions do you check?',
          hint: 'Module i03-l04\u2019s attribution rule + the hook\u2019s own hygiene (i11-l05).',
          explanation:
            '(1) Your script\u2019s hygiene (bad addresses, unwrapped reads — i11-l05\u2019s try/catch discipline); (2) termination reason (jetsam/watchdog vs signal — i03-l04); (3) THEN the detection hypothesis (family 3: library scanning, checksums) with signal attribution (which check fired). Attribution order exists because anti-tamper gets blamed for everything.'
        },
        {
          id: 'i21-l01-q4',
          type: 'mcq',
          prompt: 'Why does the integrity family\u2019s implementation detail (signature-valid vs original-team) matter to module i22?',
          options: [
            'It changes the signing tool choice',
            'It decides the bypass shape: re-signing passes "signature-valid" checks (updated signature) but fails "original-team" checks — the patching workflow must know which it faces',
            'It determines the certificate cost',
            'It does not matter — both pass after re-signing'
          ],
          answerIndex: 1,
          hint: 'What does re-signing update — and what does it NOT restore?',
          explanation:
            'Re-signing produces a VALID signature (validity checks pass) under YOUR team (original-team checks fail). The distinction is the i22 bypass-design input — mapped now, applied next module.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS — RESILIENCE requirements',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The measured-effort framing behind the robustness spectrum'
        },
        {
          title: 'Apple Developer — ptrace / PT_DENY_ATTACH semantics',
          url: 'https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/ptrace.2.html',
          note: 'Family 1\u2019s preventive mechanism, from the man page'
        },
        {
          title: 'OWASP MASTG — iOS anti-reversing defenses',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s resilience test families'
        }
      ]
    },
    {
      id: 'i21-l02',
      moduleId: 'i21',
      title: 'Bypasses: Why They Work, Why They Fail',
      difficulty: 'Advanced',
      minutes: 26,
      prerequisites: ['i21-l01', 'i11-l02'],
      objectives: [
        'Apply the signal-spoofing pattern per family on authorized lab targets',
        'Explain each bypass\u2019s mechanism and its failure modes',
        'Reject magic-script thinking: the reading-first discipline, formalized'
      ],
      diagram: 'ios-frida-hook-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every bypass is the inverse of its detection: the check asks a question, the bypass answers it falsely — or hides the signal entirely, or satisfies it legitimately (re-signing). This lesson teaches the three bypass patterns per family, WHY each works (the signal logic), and why each fails (robust designs, self-observation, cross-checks). Lab targets only, stated once more — the craft is understanding, not scripts.'
          }
        ],
        technical: [
          { type: 'h', text: 'The three bypass patterns' },
          {
            type: 'table',
            headers: ['Pattern', 'Mechanism', 'Where it fails'],
            rows: [
              ['Spoof the answer', 'Hook the check\u2019s function; forge its result (i11-l02\u2019s modification, defense edition)', 'Checks that cross-validate (multiple signals disagree), checks computed in native code you have not hooked'],
              ['Hide the signal', 'Remove/hide what the check looks for (renamed frida-server, gadget stealth configs, environment cleanup)', 'Checks detecting the tool\u2019s BEHAVIOR (ports, class inventories, memory shapes) rather than its name'],
              ['Satisfy legitimately', 'Make the check genuinely pass (re-signing for integrity checks; clean stock devices for jailbreak checks)', 'Checks binding to specific identities (original-team) or conditions you cannot legitimately produce']
            ]
          },
          { type: 'h', text: 'Per-family application' },
          {
            type: 'list',
            items: [
              'Debugger family: PT_DENY_ATTACH — spoof by hooking ptrace to no-op the request (signal logic: the kernel never receives the deny); fails when the check verifies the call\u2019s effect (errno probes)',
              'Jailbreak family: spoof file probes (hook the existence checks / return false) OR hide (clean the artifacts on the lab device); fails when many independent signals are aggregated — spoofing each is whack-a-mole, which is the point of robust design',
              'Hook family: hide (renamed tools, gadget configs avoiding default ports/names); fails against behavioral checks (class inventories, memory checksums) — the strongest family because the tool\u2019s PRESENCE is the signal',
              'Integrity family: satisfy (re-signing — module i22\u2019s whole subject); fails when checks bind to original team/entitlements — which re-signing cannot restore'
            ]
          },
          { type: 'h', text: 'The reading-first discipline, formalized' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Map the check (i21-l01: signal, function, aggregation) BEFORE any bypass attempt',
              'Choose the pattern from the signal logic (spoof/hide/satisfy) — the table decides, not habit',
              'Execute minimally (one hook, one config change) and verify (the check\u2019s behavior changes; the app continues)',
              'Document the attempt chain: failed attempts are evaluation evidence (they measure the control\u2019s robustness) — the i14-l03 lesson, resilience edition',
              'Report the control\u2019s strength with the bypass capability as context (authorized, lab-framed) — never as the headline'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'The standing frame',
            text:
              'Bypass work in this curriculum targets authorized lab targets and engagement-scoped builds only. The techniques are taught as measured evaluation of resilience controls (MASVS-RESILIENCE) — the report\u2019s subject is the control\u2019s quality, not your bypass\u2019s cleverness. Magic scripts are rejected on method grounds: without the signal map, a working script teaches nothing and fails unpredictably.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Bypass capability unblocks testing (the engagement value); control evaluation is the finding (the report value) — both, in that order',
              'The attempt-chain documentation converts bypass work into control-quality evidence — failures included',
              'Robust controls (aggregated signals) reveal their design in bypass attempts — the whack-a-mole pattern IS the finding',
              'Family-3 failures (behavioral detection) often end the bypass discussion honestly: "runtime instrumentation detected; store-build resilience confirmed on this axis" — a positive finding for the client'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Checks whose signals are trivially spoofable individually but aggregated robustly — the design quality lives in the aggregation',
              'Native-side detection (checksums, self-inspection) — the JS-hook-only bypass class ends here (i11-l05 territory)',
              'Detection results feeding server calls (device-trust scores — the business-logic coupling: bypasses now have server-side consequences)',
              'Integrity checks binding to entitlements/team (the satisfy-pattern\u2019s limit)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'For each family present in your training app (i21-l01\u2019s map): choose the pattern per its signal logic',
              'Execute minimal bypasses on the lab target; verify each (check\u2019s behavior changes, app continues)',
              'Record the attempt chain: pattern, mechanism, result, failure analysis for the ones that failed',
              'Grade the control with the new evidence (bypass effort per family — the robustness spectrum, now measured)',
              'Write the resilience findings: control quality per family, bypass capability as authorized context, positive findings where controls held'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The whack-a-mole that WAS the finding. Training app\u2019s jailbreak check: 14 aggregated probes. Bypass attempt: hook the aggregate function\u2019s return (spoof) — worked, but the app\u2019s SERVER then rejected the session (detection result fed a device-trust score — the coupling). Second pattern: hide (clean lab artifacts) — passed 12 probes, two behavioral checks (fork success, mount tables) still failed on the jailbroken device. Attempt chain documented: 2 patterns, 3 attempts, server coupling discovered. Finding: "Jailbreak detection: robust local design (aggregated multi-signal) AND server-side coupling (device-trust score) — bypass requires both dimensions; resilience exceeds app-local norms (positive finding), with notes on the two behavioral probes\u2019 spoofability." The whack-a-mole measured the control — the craft\u2019s actual output.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida (the spoof hooks), your i21-l01 family map, gadget configs (hide-pattern), and the module i22 re-signing workflow (satisfy-pattern, next lesson). The reading-first order keeps every tool honest.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Script-first bypassing (community magic scripts without signal maps) — unpredictable, unreportable, and method-rot',
              'Ignoring server-side coupling — bypassed local checks that trip server trust scores create WORSE evidence states than no bypass',
              'Treating failed bypasses as failure — they are the control\u2019s measurement; document them as findings material',
              'Forgetting the report frame: control quality is the headline; bypass capability is authorized context, one sentence'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the five-step protocol on two families present in your training app. Document both attempt chains (successes and failures). Write the two resilience findings — including one positive finding if a control held. The attempt chains are the lesson\u2019s deliverable; the findings are their consequence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Three bypass patterns — spoof, hide, satisfy — chosen by the signal logic, not by habit',
            'Robust designs fail bypasses by aggregation and behavioral detection; that robustness IS the finding',
            'Server-side coupling changes the game: local bypasses can trip server trust scores — test the full loop',
            'Attempt chains (failures included) convert bypass work into control-quality evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i21-l02-q1',
          type: 'mcq',
          prompt: 'Which bypass pattern fits an integrity check that validates "signature is valid"?',
          options: [
            'Spoof — hook the validity check',
            'Satisfy — re-sign the app (the updated signature genuinely passes)',
            'Hide — remove the check',
            'None — integrity checks cannot be bypassed'
          ],
          answerIndex: 1,
          hint: 'What does re-signing produce that the check actually wants?',
          explanation:
            'The check wants a valid signature; re-signing produces exactly that (legitimately, under your identity). The satisfy pattern — no hooks, no hiding. (Original-team checks are different — i21-l01\u2019s distinction.)'
        },
        {
          id: 'i21-l02-q2',
          type: 'truefalse',
          prompt: 'Renaming frida-server and its files defeats all hook-detection mechanisms.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which checks look at names — and which look at behavior?',
          explanation:
            'False — renaming defeats name-based scans only. Behavioral checks (class inventories, open ports if defaults kept, memory checksums, function-pointer sanity) detect the tool\u2019s presence regardless of name. The hide pattern\u2019s limit is the strongest family\u2019s design.'
        },
        {
          id: 'i21-l02-q3',
          type: 'scenario',
          prompt:
            'You bypass the app\u2019s jailbreak detection locally, but the backend starts rejecting your session. What happened and what does it change?',
          hint: 'The coupling — where did the detection result go, and which dimension of the control did you miss?',
          explanation:
            'The detection result feeds a server-side device-trust score (the coupling): local bypass ≠ system bypass. It changes the finding (server-coupled resilience — stronger than app-local) and the bypass design (both dimensions must be addressed, within authorization — usually by testing on compliant environments instead of defeating the server signal).'
        },
        {
          id: 'i21-l02-q4',
          type: 'mcq',
          prompt: 'Why do failed bypass attempts belong in the report evidence?',
          options: [
            'They show effort to the client',
            'They measure the control: attempt chains quantify bypass cost/complexity — the MASVS-RESILIENCE evidence that "the control measurably raises attack effort"',
            'They justify the invoice',
            'They are not included — only successes matter'
          ],
          answerIndex: 1,
          hint: 'What does the resilience requirement actually ask — presence or measured effort?',
          explanation:
            'MASVS-RESILIENCE asks whether defenses measurably raise attack cost. Attempt chains (what was tried, what it cost, what held) are the measurement — the report\u2019s resilience section is built from them, failures included.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS bypassing anti-reversing defenses',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s bypass-technique framing (lab-scoped)'
        },
        {
          title: 'Frida — Interceptor (the spoof instrument)',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The modification API behind the spoof pattern'
        },
        {
          title: 'OWASP MASVS — RESILIENCE v2 requirements',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The measured-effort requirements the findings grade'
        }
      ]
    },
    {
      id: 'i21-l03',
      moduleId: 'i21',
      title: 'Evaluating Resilience: From Theater to Measured Controls',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i21-l02', 'i08-l04'],
      objectives: [
        'Grade resilience controls on the measured-effort scale with evidence',
        'Integrate resilience findings with the whole engagement\u2019s picture',
        'Write the resilience section: controls, grades, positive findings and honest limits'
      ],
      diagram: 'ios-masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Resilience evaluation is where the anti-analysis work becomes a report section: each control graded on measured effort (what an attacker must do, and what it costs), integrated with the code-quality findings (detection code is attack surface too), and presented with honest limits (what bypass capability means in context). This lesson assembles that section — the module\u2019s and the engagement\u2019s.'
          }
        ],
        technical: [
          { type: 'h', text: 'The grading scale' },
          {
            type: 'table',
            headers: ['Grade', 'Signature', 'Evidence shape'],
            rows: [
              ['Theatrical', 'Single spoofable signal; brittle failure (exit); no layering', 'One probe found; bypass trivial (one hook); no server coupling'],
              ['Basic', 'Several signals, local aggregation; app-local failure handling', 'Probe list; multi-hook bypass; failure analysis per signal'],
              ['Measured', 'Layered multi-family signals; server coupling; sane degradation', 'Attempt chains across patterns; coupling evidence; degradation behavior'],
              ['Strong', 'Behavioral/native detection; attestation-class coupling; bypass cost high', 'Failed bypass attempts documented; positive finding language']
            ]
          },
          { type: 'h', text: 'The integration work' },
          {
            type: 'list',
            items: [
              'Detection code is attack surface: the detection function is a parse-and-act consumer of environment state — module i16/i17 questions apply (can environment state be attacker-influenced to trip or evade it?)',
              'Failure handling is business logic: flag-and-degrade vs exit vs report — module i15\u2019s taxonomy classifies the degradation path',
              'Resilience vs usability: controls that break legitimate environments (MDM-managed devices, enterprise networks) are findings in the OTHER direction (false-positive costs)',
              'The whole-engagement picture: resilience findings cross-reference the crypto section (i18\u2019s integrity checks), network section (i14\u2019s pinning as resilience), and storage (i13\u2019s class choices)'
            ]
          },
          { type: 'h', text: 'The section\u2019s shape' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Control inventory: families present, per-control signal lists (static + runtime evidence)',
              'Grades: the measured-effort scale per control, with attempt-chain evidence',
              'Positive findings: controls that held (the client\u2019s investments that worked — report them prominently)',
              'Coupling analysis: server-side integration of detection results (business-logic implications)',
              'Limits: what bypass capability means in context (authorized, instrumented, lab-framed) and what it does NOT mean (stock-device reachability)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Resilience sections balance reports: positive findings alongside weaknesses — the section where client investments get recognized',
              'The measured-effort framing pre-empts the "bypassed it in one hook" misread — the grade is the attacker\u2019s TOTAL cost, not your best attempt',
              'False-positive costs (controls breaking legitimate environments) are real findings — the section\u2019s fairness mechanism',
              'The limits paragraph is the module\u2019s legal-and-honest capstone: capability context, not capability theater'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Controls whose failure modes damage legitimate users (over-aggressive exits — the false-positive cost)',
              'Detection aggregates that double as config readers (the i16/i17 injection surface, resilience edition)',
              'Positive signals worth reporting: attestation-class coupling, behavioral detection, sane degradation',
              'Controls claiming protection they lack (the i18-l02 claim-vs-reality pattern, resilience edition)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Assemble the control inventory from i21-l01/l02\u2019s maps and attempt chains',
              'Grade each control on the scale; attach the evidence (probe lists, attempt chains, coupling artifacts)',
              'Run the integration checks: detection code as attack surface, failure handling as business logic, false-positive costs',
              'Write the section per the five-part shape; cite cross-module findings where the picture completes',
              'Peer-review the limits paragraph: does it state what bypass capability is and is not? (The module\u2019s honesty bar.)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A resilience section, compressed. "Controls: jailbreak detection (graded Measured — 14 aggregated probes, server-coupled trust score, degradation over exit; attempt chain: 2 patterns/3 attempts, 2 behavioral probes held), debugger detection (Basic — PT_DENY_ATTACH + sysctl self-check; single-hook bypass), hook detection (Theatrical — name-based library scan only; renamed tools defeat). Positive finding: server coupling of detection results exceeds app-local norms. Integration: the detection aggregator reads a settings plist (module i16\u2019s injection surface — see finding X). Limits: bypass capability demonstrated on instrumented, authorized builds; stock-device attackers lack hook paths (module i11-l01), so the measured grades reflect the realistic adversary." Three grades, one positive finding, one cross-citation, honest limits — the section\u2019s anatomy in a paragraph.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The attempt-chain evidence from i21-l02, the cross-module findings (i13–i18), and the report template (module i24 formalizes it). The evaluation work is done — this lesson writes it down.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Grading on presence instead of measured effort — the scale\u2019s whole point',
              'Omitting positive findings — resilience sections that only criticize lose credibility and miss client value',
              'Ignoring the false-positive cost direction — controls that break MDM/enterprise environments are findings too',
              'Writing limits that understate OR overstate bypass capability — the instrumented-lab context is precise; use it'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Assemble the full resilience section for your training app per the five-part shape. Grade every control, include one positive finding, run one integration check, and write the limits paragraph. Have the honesty bar question answered by your own text: could a reviewer tell exactly what your bypass capability was and was not? If yes — the module is complete.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The grading scale (theatrical → strong) measures attacker TOTAL cost, with attempt chains as evidence',
            'Detection code is attack surface; failure handling is business logic; false-positive costs are findings',
            'Positive findings belong in resilience sections — controls that held are client value, reported as such',
            'The limits paragraph states bypass capability\u2019s context precisely — the module\u2019s honesty bar'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i21-l03-q1',
          type: 'mcq',
          prompt: 'What does the "Measured" grade require that "Basic" lacks?',
          options: [
            'More code',
            'Layering across families plus server coupling and sane degradation — the attacker faces multiple domains, not just multiple probes',
            'A commercial SDK',
            'Obfuscation'
          ],
          answerIndex: 1,
          hint: 'What did the whack-a-mole example add beyond signal count?',
          explanation:
            'Layering + coupling + degradation: the attacker\u2019s cost spans local spoofing, server trust scores, and no brittle kill. The scale measures domains of resistance, not vocabulary size.'
        },
        {
          id: 'i21-l03-q2',
          type: 'truefalse',
          prompt: 'A jailbreak check that force-exits the app when an MDM-managed device trips a probe is a resilience strength.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the false-positive cost direction say about brittle failure modes in legitimate environments?',
          explanation:
            'False — brittle exits in legitimate environments (MDM profiles trip filesystem/behavioral probes) are a finding in the other direction: the control damages real users. Sane degradation is part of measured quality.'
        },
        {
          id: 'i21-l03-q3',
          type: 'scenario',
          prompt:
            'Your engagement bypassed every local control with modest effort, but detection results fed server trust scores. What goes in the section\u2019s positive-finding slot?',
          hint: 'What held — at which layer, and what does that mean for the realistic adversary?',
          explanation:
            'The server coupling held: local bypasses did not translate to system access (trust scores rejected). Positive finding: "Server-side integration of device-integrity signals exceeds app-local resilience norms; local instrumentation did not yield system access without addressing the server dimension." The honest architecture of what worked.'
        },
        {
          id: 'i21-l03-q4',
          type: 'mcq',
          prompt: 'What is the precise statement of bypass capability\u2019s limits in a report?',
          options: [
            '"We bypassed all controls"',
            '"Bypass capability demonstrated on authorized, instrumented builds in laboratory context; stock-device attackers lack hook paths (no debug entitlement, no jailbreak assumed), so grades reflect the realistic adversary\u2019s cost"',
            '"Bypassing is impossible for real attackers"',
            'No limits statement — it invites attack'
          ],
          answerIndex: 1,
          hint: 'What contexts differ — your lab vs the stock-device adversary — and why must the report say so?',
          explanation:
            'The instrumented-lab context (hook paths via dev builds/jailbreaks) is not the stock-device context. The limits paragraph maps your capability onto the realistic adversary — both directions stated, no theater in either.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS — RESILIENCE v2 (full requirement set)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The grading\u2019s requirement backing'
        },
        {
          title: 'OWASP MASTG — iOS resilience testing methodology',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The evaluation methodology this section implements'
        },
        {
          title: 'Apple Developer — DeviceCheck / App Attest (server-coupled integrity)',
          url: 'https://developer.apple.com/documentation/devicecheck',
          note: 'The platform\u2019s server-coupling mechanism — the positive-finding pattern'
        }
      ]
    }
  ]
};
