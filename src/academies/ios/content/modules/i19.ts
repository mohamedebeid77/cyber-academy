import type { Module } from '../../../../types';

// LEVEL 8 — CRYPTO & RESILIENCE · Module i19: Reverse Engineering Advanced
// Original content synthesized from ARM64 architecture documentation (ARM),
// Apple ABI notes and OWASP MASTG advanced RE chapters.

export const i19: Module = {
  id: 'i19',
  title: 'Reverse Engineering Advanced',
  level: 8,
  description:
    'The advanced path: ARM64 reading fluency, native libraries and the dyld landscape, and Ghidra workflows that scale beyond single functions. The bridge from high-level app behavior down through the runtime to assembly — for the findings that live below the ObjC surface.',
  outcomes: [
    'Read ARM64 assembly: registers, calling convention, control flow, common idioms',
    'Navigate native libraries, the dyld shared cache and load-command forensics',
    'Run advanced Ghidra workflows: cross-referencing at scale, scripting, type recovery'
  ],
  lessons: [
    {
      id: 'i19-l01',
      moduleId: 'i19',
      title: 'ARM64 for Reverse Engineers',
      difficulty: 'Advanced',
      minutes: 26,
      prerequisites: ['i09-l03', 'i11-l05'],
      objectives: [
        'Read ARM64 fundamentals: registers, calling convention, stack frames',
        'Recognize common idioms (calls, branches, ObjC dispatch, PAC) in listings',
        'Verify decompiler conclusions at the instruction level with confidence'
      ],
      diagram: 'ios-arm64-pipeline',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS binaries are ARM64. You do not need to write assembly — you need to read it well enough to verify decompiler claims (module i09-l03\u2019s rule), read native hooks\u2019 arguments (module i11-l05\u2019s conventions), and navigate listings where decompilers drown. A working subset of the ISA covers ninety percent of that: the calling convention, the control-flow shapes, and the ObjC dispatch idiom.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-arm64-pipeline',
            caption: 'The register file and call mechanics — the reading subset that matters most.'
          },
          { type: 'h', text: 'Registers and the calling convention' },
          {
            type: 'list',
            items: [
              'x0–x7: arguments and return (x0 returns); x8: indirect result; x29/x30: frame pointer/link register; SP: stack pointer — the reading set (x9–x28 are callee-saved/scratch)',
              'The convention: caller fills x0–x7, bl (branch-link) calls, callee returns in x0 — the shape every hook and listing read uses (module i11-l05\u2019s Swift argument reading stands on this)',
              'W-register views (w0) manipulate the lower 32 bits — the width distinction that explains half of suspicious-looking constants',
              'PAC (arm64e): pointer authentication signatures on return addresses (paciasp/autiasp prologues) — modern iOS\u2019s control-flow hardening, visible in listings as extra prologue instructions'
            ]
          },
          { type: 'h', text: 'The idioms' },
          {
            type: 'code',
            lang: 'asm',
            title: 'A listing excerpt with the four idioms annotated',
            code:
              'LoginManager___validateUser_password_:\n' +
              '  paciasp                        ; PAC prologue (arm64e)\n' +
              '  stp    x29, x30, [sp, #-0x20]! ; frame setup\n' +
              '  str    x0, [sp, #0x10]         ; save self\n' +
              '  adrp   x1, selRef_validateUser ; ObjC dispatch idiom:\n' +
              '  ldr    x1, [x1]                ;   selector into x1,\n' +
              '  bl     _objc_msgSend           ;   message send (args x0=self, x2+=params)\n' +
              '  cbz    w0, L_fail              ; test-and-branch idiom (returned BOOL)\n' +
              '  mov    w0, #1                  ; immediate load\n' +
              '  b      L_ret\n' +
              'L_fail:\n' +
              '  mov    w0, #0\n' +
              'L_ret:\n' +
              '  ldp    x29, x30, [sp], #0x20   ; frame teardown\n' +
              '  ret                            ; return (via authenticated x30)'
          },
          {
            type: 'list',
            items: [
              'ObjC dispatch: selector reference into x1, objc_msgSend, args shifted — recognizing it lets you skip the plumbing and read the selector flow',
              'Test-and-branch: cbz/cbnz/tbz on return values — the decision points decompilers render as if/else',
              'adrp/ldr pairs: PC-relative data references (strings, selectors, globals) — follow them for the data a decision uses',
              'bl targets: cross-references in instruction form — the call graph, read directly'
            ]
          },
          { type: 'h', text: 'Verification reading' },
          {
            type: 'p',
            text:
              'The workflow: decompiler claims X (i09-l03) → find the claim\u2019s shape in the listing (the branch, the comparison, the call) → confirm the operands (constants, selector names, call targets) → verdict. Two minutes per claim once the idioms are fluent — and the difference between "Ghidra showed me" and "verified at instruction level" (module i09-l04\u2019s evidence classes, now real).'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Listing verification upgrades finding evidence classes — the pseudo-C-only claims from earlier modules become listing-verified here',
              'Native hook argument reading (i11-l05) is convention application: x0/x1 confusion resolved by reading the callee\u2019s own prologue',
              'PAC awareness explains modern kill behaviors (signed pointers failing on tampered flows) — module i22\u2019s re-signing context',
              'Constant recognition (crypto tables, magic bytes, size checks) in listings grounds i18\u2019s dimension checks at instruction level'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Comparisons against fixed constants in security functions (the memcmp shapes — i09-l03\u2019s look-for, instruction edition)',
              'objc_msgSend chains whose selectors name security actions (dispatch-level recon)',
              'Missing prologue hardening (no PAC in a modern binary — provenance/posture signal)',
              'String references feeding comparisons (adrp/ldr into cstrings — the config/flag readers)',
              'Indirect call tables (dispatch arrays — feature-flag implementations)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Take one verified finding from module i09 and re-verify it purely in the listing (idioms → operands → verdict)',
              'Take one pseudo-C-only claim and verify or refute it in the listing — the upgrade/refutation is the exercise\u2019s point',
              'Read one native function\u2019s prologue to establish its argument convention; confirm against your i11-l05 hook observations',
              'Note one PAC prologue and one function missing it — context for i22\u2019s patching mechanics'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Refutation at instruction level. Pseudo-C claimed: pinning comparison uses constant-time comparison (memcmp). Listing read: the "comparison" is a ldrb loop with early cbz exit — byte-by-byte with early exit, NOT constant-time. Evidence upgraded from pseudo-C-guess to listing-refuted: the timing side channel question is real (theoretical for this data, but the claim was wrong and the report said so). Refutations are as valuable as confirmations — the module\u2019s reading skill exists for both.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Ghidra\u2019s listing view (the reading surface), ARM/Apple ABI documentation for the register semantics, and Frida\u2019s register views (live corroboration). No new tools — this lesson is literacy.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading x/w widths carelessly — half of suspicious constants are 32-bit views of ordinary values',
              'Trusting decompiler register assignments over the callee\u2019s prologue — the prologue is the convention\u2019s ground truth',
              'Ignoring PAC prologues (and misreading them as anti-analysis) — they are platform hardening, i22\u2019s context',
              'Trying to learn the full ISA — the reading subset (convention, idioms, verification) is the curriculum\u2019s need'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete the four-step verification exercise (one confirmation, one refutation, one convention read, one PAC note). The refutation, if you find one, goes into your evidence bundle with the listing excerpt — instruction-level evidence class, achieved.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The reading subset: x0–x7 convention, control-flow idioms, ObjC dispatch, PAC prologues',
            'Verification reading upgrades evidence classes — pseudo-C claims become listing-verified or refuted',
            'The prologue is the argument convention\u2019s ground truth for native hooks',
            'You are not becoming an assembly programmer — you are becoming a verifier'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i19-l01-q1',
          type: 'mcq',
          prompt: 'In the ARM64 calling convention, where does the return value land?',
          options: ['x7', 'x0', 'x30', 'The stack top'],
          answerIndex: 1,
          hint: 'Which register started as the first argument — and doubles for returns?',
          explanation:
            'x0: first argument in, return value out. The symmetry is why hooks read retval in x0 (onLeave\u2019s view) and why Swift argument reading starts at x0 (module i11-l05).'
        },
        {
          id: 'i19-l01-q2',
          type: 'truefalse',
          prompt: 'paciasp instructions in a function prologue indicate anti-debugging code.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does Pointer Authentication actually protect — and where does it appear?',
          explanation:
            'False — PAC signs return addresses/pointers (control-flow integrity hardening) and appears in standard prologues on arm64e. Anti-analysis lives elsewhere (module i21); conflating them misreads both.'
        },
        {
          id: 'i19-l01-q3',
          type: 'scenario',
          prompt:
            'A listing shows: adrp x1, selRef_isAdmin; ldr x1, [x1]; bl _objc_msgSend; cbz w0, L_skip. Read it in one sentence.',
          hint: 'Dispatch idiom + test-and-branch: what decision is this?',
          explanation:
            'The code loads the isAdmin selector, dispatches it against self (x0), and branches over the following block when it returns zero (false) — i.e., "if not admin, skip". The reading combines the two idioms; decompilers render it as if(self.isAdmin){…} — now you verify their rendering in seconds.'
        },
        {
          id: 'i19-l01-q4',
          type: 'mcq',
          prompt: 'Why does w-register width matter when reading listings?',
          options: [
            'w registers are write-protected',
            'Operations on w views affect only 32 bits — constants that look wrong in 64-bit context are ordinary 32-bit values (and vice versa)',
            'It only matters for floating point',
            'It does not — x and w are interchangeable names'
          ],
          answerIndex: 1,
          hint: 'What does the w prefix change about the operation\u2019s width?',
          explanation:
            'w0 is x0\u2019s lower 32 bits; ops on it zero-extend or truncate accordingly. Misreading widths produces false constant-size conclusions (the classic "this key is 4 bytes" error from a w-register compare).'
        }
      ],
      references: [
        {
          title: 'ARM Architecture Reference Manual (ARM64/A64)',
          url: 'https://developer.arm.com/documentation/dui0801/latest',
          note: 'The instruction set\u2019s authoritative reference (reading subset focus)'
        },
        {
          title: 'Apple Developer — Writing ARM64 code for Apple platforms (ABI)',
          url: 'https://developer.apple.com/documentation/xcode/writing-arm64-code-for-apple-platforms',
          note: 'Apple\u2019s calling convention and PAC notes'
        },
        {
          title: 'Ghidra documentation (listing view, ARM64 analysis)',
          url: 'https://ghidra-sre.org/',
          note: 'The reading surface used throughout'
        }
      ]
    },
    {
      id: 'i19-l02',
      moduleId: 'i19',
      title: 'Native Libraries and the Dyld Landscape',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i09-l01'],
      objectives: [
        'Navigate embedded frameworks/dylibs as first-class RE targets',
        'Understand the dyld shared cache and what it means for system-code analysis',
        'Read load-command forensics: rpaths, re-exported libraries, weak links'
      ],
      diagram: 'ios-macho-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Below the app\u2019s ObjC/Swift surface lives its native code: embedded frameworks (SDKs), linked system libraries, and the loader machinery (dyld) that binds them. Most of this terrain you have already touched (i09-l01\u2019s format work, i08\u2019s SDK inventory); this lesson goes deeper — treating embedded binaries as first-class RE targets and reading the loader\u2019s forensic traces.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-macho-anatomy',
            caption: 'Each embedded binary is a full Mach-O — the anatomy applies per framework.'
          },
          { type: 'h', text: 'Embedded frameworks as targets' },
          {
            type: 'list',
            items: [
              'Each Frameworks/*.framework is an independent Mach-O: own metadata dump (i09-l02), own decompilation session, own strings sweep',
              'SDK prioritization: security-relevant SDKs (pinning, anti-fraud, crypto wrappers) get the target-list treatment (i09-l02) — the app\u2019s own code is often the smaller risk',
              'Strip posture varies per SDK: some ship symbols (easier RE), some obfuscate (i18-l03\u2019s recognition, i21\u2019s evaluation)',
              'Version forensics: SDK version strings (i08-l02) correlate with public research — known-weak SDK implementations are citable findings'
            ]
          },
          { type: 'h', text: 'The dyld shared cache' },
          {
            type: 'list',
            items: [
              'System libraries are pre-linked into one cache on device — Foundation, Security etc. do not exist as pullable files',
              'Consequence for testing: app assessments analyze app + embedded code; system-library internals require cache extraction (research workflows, licensed tools) — almost never in app-engagement scope',
              'What you DO read from load commands: which system frameworks are linked (LC_LOAD_DYLIB, i09-l01), which symbols are imported (nm\u2019s undefined list) — the app\u2019s system-API surface without the system code',
              'Weak links and re-exports: LC_LOAD_WEAK_DYLIB (optional dependencies — feature-conditional behavior) and LC_REEXPORT_DYLIB (umbrella frameworks) — the forensic traces of architecture decisions'
            ]
          },
          { type: 'h', text: 'Load-command forensics' },
          {
            type: 'list',
            items: [
              'rpaths (LC_RPATH): the search paths resolving @rpath references — how the app finds its own embedded libraries (unusual rpaths are architecture smells)',
              'Import surface: undefined symbols (nm -u) enumerate every system function the binary calls — the API-surface inventory that predicts hook targets (i11-l04\u2019s chokepoints, format-level)',
              'Initialization: LC_MAIN plus module initializers (mod_init_func section, +load) — the full "what runs before/around main" picture (i03-l02\u2019s +load note, format-level)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'SDK-as-target reframing: the riskiest code in modern apps is often embedded, not first-party — allocate RE time accordingly',
              'Import-surface reading (nm -u) predicts the whole hooking landscape before any Frida work — chokepoints visible at format level',
              'Weak-link forensics explains feature-conditional behavior (code paths that exist only when optional libraries load — the i11-l03 delta explanations)',
              'Version-correlated SDK findings (known-vulnerable pinning/crypto SDK versions) are the fastest high-severity wins in native analysis'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Security-critical logic in SDKs rather than the app (pinning wrappers, license checks — the i09-l02 ranking made concrete)',
              'Unusual rpath entries or embedded libraries outside Frameworks/ (architecture smells)',
              'Weak-linked crypto/security libraries (optional security — why?)',
              'SDK version strings matching known-vulnerable releases (the citation-ready finding)',
              'Initializer sections (+load/mod_init_func) touching security state (early configuration — the i03-l02 note at format level)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory embedded binaries with per-binary Mach-O profiles (i09-l01\u2019s page, per framework)',
              'Read the main binary\u2019s import surface (nm -u); map system-API usage onto the hook-target list (i11 chokepoints, format-level corroboration)',
              'Read load-command forensics: rpaths, weak links, re-exports, initializers — note every anomaly with its architectural question',
              'Prioritize one SDK for a full i09-l02/l03 treatment (target list + verified session) — the SDK-as-target workflow rehearsed',
              'Correlate SDK versions with public advisories; draft any citation-ready findings'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'SDK-as-target finding. Embedded PinningLib.framework (version 2.3.1 — i08\u2019s table): full i09-l02 dump shows its pin comparison function; listing verification (i19-l01) shows early-exit comparison (not constant-time — the i09 refutation pattern) AND a debug branch honoring a plist flag (the i14-l03 fail-open cousin). Public advisory search: version 2.3.1 matches a published bypass advisory. Finding: "Embedded pinning SDK 2.3.1 (known-bypassed version, advisory X) with non-constant-time comparison and a debug bypass branch (listing-verified). Update SDK; the flag branch must not ship." Three evidence classes, one SDK — the reframing\u2019s yield.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The i09 toolkit applied per binary (otool/nm/strings/dumps), the decompiler per SDK, and public advisory databases for version correlation. The shared cache stays research-side — its existence explains absences, not findings.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Analyzing only the main binary — the SDK reframe exists because risk concentrates in embedded code',
              'Hunting system-library internals on engagements — cache extraction is research scope, not app-assessment scope',
              'Ignoring weak links\u2019 behavioral meaning (optional security is a question, not a format detail)',
              'Skipping version correlation — the fastest citable findings live in SDK version history'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce per-binary profiles for every embedded framework in your training app, read the main binary\u2019s import surface, and prioritize one SDK for a full treatment. Write the SDK-as-target finding if one emerges (or the verified-clean note). The reframe is the lesson — one completed SDK treatment proves you own it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Embedded frameworks are first-class RE targets — risk concentrates in SDK code more than first-party code',
            'The shared cache explains system-code absences; import surfaces (nm -u) deliver the system-API picture without it',
            'Load-command forensics (rpaths, weak links, initializers) reveal architecture decisions and behavior conditionals',
            'SDK version correlation yields the fastest citation-ready findings in native analysis'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i19-l02-q1',
          type: 'mcq',
          prompt: 'Why does nm -u (undefined symbols) matter more for app assessments than extracting the dyld shared cache?',
          options: [
            'It lists the SDK versions',
            'It enumerates every system function the binary imports — the API surface and hook-target landscape, without needing system code',
            'It decrypts the cache',
            'It replaces decompilation'
          ],
          answerIndex: 1,
          hint: 'What does an app assessment need from system libraries — their code, or the app\u2019s usage of them?',
          explanation:
            'Assessments analyze the app\u2019s behavior: which system APIs it calls (imports), not how the libraries are implemented (cache internals). nm -u delivers the former in seconds — the right granularity for the scope.'
        },
        {
          id: 'i19-l02-q2',
          type: 'truefalse',
          prompt: 'A weak-linked security library means the security feature is optional at runtime.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does weak linking say about the library\u2019s presence — and what must the code do when it is absent?',
          explanation:
            'True — weak-linked libraries may be absent; the binary runs without them and code must handle absence. "Optional security" is the architectural question: why is a security capability conditional, and what happens to the feature when the library is missing?'
        },
        {
          id: 'i19-l02-q3',
          type: 'scenario',
          prompt:
            'An embedded SDK matches a public "bypassed" advisory at its exact version. Assemble the finding.',
          hint: 'Version correlation + your own verification. What evidence layers stack?',
          explanation:
            'Layers: version string (static), your own listing/decompilation verification of the relevant weakness (instruction-level), and wire/runtime corroboration where feasible (i14-l03 refusal behavior). Finding: "SDK X.Y.Z (advisory Z: bypassed pinning) embedded and actively used (call-graph evidence); independently verified [specific weakness at listing level]. Update SDK; validate replacement behavior on the wire." Correlation opens the finding; your verification closes it.'
        },
        {
          id: 'i19-l02-q4',
          type: 'mcq',
          prompt: 'What do module initializer sections (mod_init_func, +load) tell a tester?',
          options: [
            'Nothing — they are compiler artifacts',
            'What code runs before/around main — early configuration and security-state setup (and where i03-l02\u2019s hidden checks live)',
            'The app\u2019s UI entry points',
            'The App Store review status'
          ],
          answerIndex: 1,
          hint: 'Which code executes without any call site reaching it?',
          explanation:
            'Initializers run at load — before main, before your hooks if attached late (spawn mode exists for this). They are where early environment checks and configuration live; the format-level view (these sections) completes the i03-l02 behavioral note.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — dyld and dynamic loading documentation',
          url: 'https://developer.apple.com/documentation/xcode/building-your-app-to-let-dyld-optimize-app-launches',
          note: 'The loader\u2019s behavior and launch-time optimization context'
        },
        {
          title: 'Apple Developer — Mach-O load commands reference',
          url: 'https://github.com/apple-oss-distributions/xnu/blob/main/EXTERNAL_HEADERS/mach-o/loader.h',
          note: 'Weak links, re-exports, rpaths — the forensic command set'
        },
        {
          title: 'OWASP MASTG — iOS reverse engineering (native code chapters)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The native-RE framing for embedded targets'
        }
      ]
    },
    {
      id: 'i19-l03',
      moduleId: 'i19',
      title: 'Ghidra at Scale: Cross-References, Scripting, Type Recovery',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i19-l02'],
      objectives: [
        'Scale Ghidra work beyond single functions: cross-reference sweeps and data-flow tracing',
        'Use scripting to automate recurring analysis (call graphs, string flows, constant hunts)',
        'Recover types/structures that make native findings legible'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module i09-l03 taught the single-function session. Advanced work needs scale: tracing a value from user input to sink across functions, hunting constants across a binary, and recovering the types that make native code readable. Ghidra\u2019s cross-referencing, scripting and type systems are the machinery — this lesson is their engagement-grade application.'
          }
        ],
        technical: [
          { type: 'h', text: 'Cross-reference sweeps and data-flow tracing' },
          {
            type: 'list',
            items: [
              'Xref sweeps: for security-relevant functions (SecItemAdd, CCCrypt, WKWebView loads), enumerate ALL callers — the complete call-map for a chokepoint (i11\u2019s hook list, RE-side)',
              'Data-flow tracing: from source (user input function, deep link parser) to sink (load, exec, crypto) via xref chains and register tracking — the manual art decompilers assist but do not replace',
              'Constant hunting: search for immediate values (keys, magic numbers, sizes) across the binary — the i18 dimension checks at scale',
              'String-flow maps: from string reference to consuming function (the i08 sweep\u2019s findings, attributed precisely)'
            ]
          },
          { type: 'h', text: 'Scripting the recurring work' },
          {
            type: 'code',
            lang: 'java',
            title: 'A Ghidra script shape (Python/Jython in Ghidra\u2019s script manager)',
            code:
              '# Enumerate callers of every security-relevant import\nfrom ghidra.app.decompiler import DecompInterface\n\nfor func in currentProgram.getFunctionManager().getFunctions(True):\n    for called in func.getCalledFunctions(monitor):\n        name = called.getName()\n        if name in ("SecItemAdd", "CCCrypt", "SecTrustEvaluateWithError"):\n            print("%s -> %s" % (func.getName(), name))\n# Output: the chokepoint call-map (i11 hook targets), regenerated per binary\n# in minutes — the recurring analysis the engagement runs on every artifact.'
          },
          {
            type: 'list',
            items: [
              'Script the trio: chokepoint call-maps, constant hunts, string-flow attributions — the recurring analyses that scale across binaries and engagements',
              'Version your scripts (they are professional tooling — same hygiene as Frida\u2019s library)',
              'Decompiler-API scripting (the shape above) reaches what the GUI\u2019s xref windows summarize'
            ]
          },
          { type: 'h', text: 'Type and structure recovery' },
          {
            type: 'list',
            items: [
              'Apply Apple framework type libraries (Ghidra\u2019s FID/type data) — SecTrustRef and friends stop rendering as undefined*',
              'Define custom structures for app-specific data (the config structs, record formats the decompiler guesses at)',
              'Retype aggressively as understanding grows — the legibility compounding from i09-l03, systematized',
              'ObjC metadata integration: Ghidra\u2019s loader plus community dump scripts merge class/method names into the analysis — the i09-l02 surface, native-integrated'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The scripted chokepoint call-map is the bridge artifact between RE and Frida (i11\u2019s hook list, generated and verified) — the workflow\u2019s connective tissue',
              'Data-flow traces produce the reachability narratives (input → sink) that make deep-link/WebView findings airtight (i16/i17 chains)',
              'Type recovery is what makes SDK analysis feasible at engagement speed — undefined* soup becomes readable code',
              'Scripted analysis across multiple binaries (app + SDKs + extensions) is how the static tier scales to real apps'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Chokepoints with surprising caller sets (crypto called from UI code — the architectural smell)',
              'Constants appearing in multiple security functions (shared keys/tables — i18-l02\u2019s blast radius, RE-visible)',
              'Data-flow paths from parsing functions to dangerous sinks without validation hops',
              'Structure shapes recurring across functions (app data models — type-recovery targets)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Write (or adapt) the chokepoint call-map script; run it on your training app and one SDK — save both maps',
              'Trace one data flow end to end (deep link parameter → sink) with xref chains; document the path as a finding narrative',
              'Hunt one constant (a key/table from i18\u2019s inventory) across the binary — attribution via xrefs',
              'Recover one structure (retype a recurring data shape) and show the decompiled output improving',
              'Version and file the scripts in your tooling library — they are now permanent engagement infrastructure'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The scripted map that reorganized an engagement. Chokepoint script output on a target: CCCrypt called from 7 functions — 5 expected (vault features), 2 surprising (analytics SDK, network retry layer). The surprise callers redirected RE time: the SDK was encrypting telemetry with the app\u2019s master key (i18-l02\u2019s blast-radius finding, discovered by xref sweep) and the retry layer was encrypting cached responses (the i13 cache finding\u2019s crypto half). One script, two findings re-prioritized, engagement reorganized — scale tooling paying for itself in the first hour.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Ghidra (script manager, decompiler API, type libraries, version tracking for binary diffs across app versions — the bonus capability worth learning), your growing script library, and the artifact formats from earlier modules (the maps and traces file alongside captures and transcripts).'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Manual xref sweeps that scripts would do — engagement hours are the budget; automate the recurring',
              'Trusting data-flow traces without listing verification at the sink — the i19-l01 rule applies to traced paths too',
              'Skipping type recovery as "cosmetic" — legibility is analysis speed; undefined* soup is where hours die',
              'Hoarding scripts without versioning/documentation — tooling that only one machine can run is a liability at handoff'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete the five-step exercise, with the chokepoint map as the centerpiece. Then write the one-paragraph workflow note: how RE, Frida and the wire now connect through generated artifacts (maps → hooks → captures). That note is module i24\u2019s methodology preview — you have effectively been building the capstone\u2019s engine all along.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Scale Ghidra via xref sweeps, data-flow tracing, constant hunts — and scripts for the recurring three',
            'The scripted chokepoint call-map is the RE↔Frida bridge artifact — generate it per binary, verify it dynamically',
            'Type/structure recovery converts SDK analysis from soup to readable code — legibility is speed',
            'Version your scripts: engagement infrastructure, not session scraps'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i19-l03-q1',
          type: 'mcq',
          prompt: 'Why script the chokepoint call-map instead of using the GUI\u2019s xref windows per function?',
          options: [
            'GUI xrefs are broken',
            'The script covers all chokepoints across ALL binaries in minutes, regenerates per artifact, and feeds the Frida hook list — scale and reproducibility',
            'Scripts are more accurate',
            'The GUI cannot show callers'
          ],
          answerIndex: 1,
          hint: 'What does the workflow need per artifact — and how many chokepoints/binaries does a real app have?',
          explanation:
            'Real apps: many chokepoints × several binaries × regeneration per version. Scripting turns that from days into minutes with reproducible output — the artifact that then seeds module i11\u2019s hook list.'
        },
        {
          id: 'i19-l03-q2',
          type: 'truefalse',
          prompt: 'A scripted data-flow trace from user input to a dangerous sink is finding-ready evidence by itself.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the i19-l01 verification rule say about traced paths?',
          explanation:
            'False — traces locate and narrate; the sink (and key path steps) get listing verification and dynamic confirmation per the standing rules. Traces are the map; evidence classes still apply at every claim.'
        },
        {
          id: 'i19-l03-q3',
          type: 'scenario',
          prompt:
            'Constant hunting finds the same 16-byte value referenced from three crypto functions and one network function. What does the xref pattern suggest?',
          hint: 'Shared material across domains — which i18 finding does this preview?',
          explanation:
            'Blast-radius shape (i18-l02): one key material serving multiple domains (crypto + network). The finding: shared key material across purposes (leak in one domain compromises all); verify the value\u2019s use per site, then write the lifecycle finding with the xref evidence attached.'
        },
        {
          id: 'i19-l03-q4',
          type: 'mcq',
          prompt: 'What does type recovery actually buy during engagement analysis?',
          options: [
            'Prettier screenshots',
            'Legibility: typed parameters/structures make decompiled SDK code readable — analysis speed at engagement scale',
            'Automatic vulnerability detection',
            'Nothing — decompilers type perfectly already'
          ],
          answerIndex: 1,
          hint: 'What does undefined* soup cost per session — and what does retyping compound into?',
          explanation:
            'Every undefined parameter is a guess the reviewer re-makes; typed code reads once. Recovery compounds across functions sharing structures — the difference between hours and minutes on SDK-heavy targets.'
        }
      ],
      references: [
        {
          title: 'Ghidra — Scripting documentation (GhidraScript API)',
          url: 'https://ghidra-sre.org/',
          note: 'The scripting surface used throughout the lesson'
        },
        {
          title: 'Ghidra — Version tracking (binary diffs across versions)',
          url: 'https://ghidra-sre.org/',
          note: 'The bonus capability for app-version diffing'
        },
        {
          title: 'OWASP MASTG — iOS advanced RE techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The scale-analysis framing in the guide\u2019s terms'
        }
      ]
    }
  ]
};
