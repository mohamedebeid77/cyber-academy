import type { Module } from '../../../../types';

// LEVEL 5 — DYNAMIC ANALYSIS · Module i11: Frida & Runtime Instrumentation
// Original content synthesized from Frida official documentation and OWASP
// MASTG instrumentation chapters. All scripts are original teaching examples.

export const i11: Module = {
  id: 'i11',
  title: 'Frida & Runtime Instrumentation',
  level: 5,
  description:
    'The strongest module in the academy: Frida from first attach to advanced scripting. Architecture, ObjC method hooking with arguments and return values, runtime enumeration and tracing, practical auth/crypto instrumentation against safe local targets, and native-level techniques. Every hook explained — no copy-paste-only scripting.',
  outcomes: [
    'Explain Frida\u2019s architecture and choose between server, gadget and spawn modes',
    'Hook Objective-C methods, read/modify arguments and forge return values — understanding each line',
    'Enumerate classes/methods and trace execution to map features at runtime',
    'Instrument authentication and crypto logic on safe lab targets',
    'Apply native-level hooks and handle Swift-only code'
  ],
  lessons: [
    {
      id: 'i11-l01',
      moduleId: 'i11',
      title: 'Frida Fundamentals: Architecture and First Attach',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i07-l02', 'i10-l01'],
      objectives: [
        'Explain Frida\u2019s client/server design and its two iOS deployment paths',
        'Choose between attach and spawn modes for a given question',
        'Complete a first attach and a first spawn on a safe target'
      ],
      diagram: 'ios-frida-arch',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Frida injects a JavaScript engine into a running process, letting you read and modify what the app does — live. It is the single most consequential tool in iOS dynamic analysis, and the one gated hardest by the platform: getting it onto the device is the engineering problem (module i07\u2019s environment decision consumed here), after which scripting is the easy part.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-frida-arch',
            caption: 'Two paths onto the device: root daemon (jailbroken) or embedded gadget (re-signed IPA).'
          },
          { type: 'h', text: 'The architecture' },
          {
            type: 'list',
            items: [
              'Your machine runs the client (frida CLI, Python bindings, or raw JS agents)',
              'The target process hosts the agent: a JS engine (V8/QuickJS) plus Frida\u2019s runtime, injected into the app\u2019s own process space',
              'iOS deployment path A — frida-server: a daemon running as root on a jailbroken device; injects into any process on demand (store builds included)',
              'iOS deployment path B — Frida Gadget: a dylib you embed into the app bundle and re-sign (module i22 mechanics); loads at launch, no jailbreak needed — requires a build you may modify (dev builds, training apps)',
              'Transport: USB or network between client and device; the same agent scripts run against both paths'
            ]
          },
          { type: 'h', text: 'Attach vs spawn' },
          {
            type: 'terminal',
            title: 'First commands (server path shown; gadget path: same client, app launches with the gadget loaded)',
            lines: [
              '# list processes/devices',
              '$ frida-ls-devices',
              '$ frida-ps -U',
              '# attach to a running app',
              '$ frida -U -n TargetApp',
              '# spawn suspended, instrument early, then resume — the launch-race killer',
              '$ frida -U -f com.target.app',
              '[USB::iPhone::pid 812]-> %resume',
              '# inside the REPL — your first script:',
              'Java is for Android; here:',
              'ObjC.available            // true on iOS',
              'ObjC.classes.UIApplication'
            ]
          },
          {
            type: 'p',
            text:
              'Spawn mode deserves emphasis: the process starts suspended, your hooks install before any app code runs, then %resume launches it. Anything timing-sensitive — early initialization, first network calls, certificate setup — requires spawn; attach-after-launch misses races by construction. The lifecycle knowledge from module i02-l04 (early launch logic) is what told you this matters.'
          },
          { type: 'h', text: 'Choosing your path' },
          {
            type: 'list',
            items: [
              'Jailbroken lab device + frida-server: full power, any target, weakest platform-guarantee context (i07-l02\u2019s documentation duties)',
              'Dev build + Gadget (re-signed): no jailbreak, works on stock devices — requires IPA modification rights (legitimate for training apps and client-provided dev builds)',
              'Store build on stock device: neither path applies — network/file channels only (module i10); say so in the report rather than improvising'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The environment decision (i07-l02) becomes concrete here: your queue\u2019s hook needs + available artifact determine server-vs-gadget',
              'Spawn-vs-attach maps to observation design (i10-l01): early-logic claims need spawn; mid-session behavior attaches fine',
              'Gadget re-signing ties to module i22 — if your target is a training app, you will do both in this module and understand i22 before its lesson',
              'Every hook session inherits i10\u2019s discipline: one question per session, artifact expected, verdict rule written'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Apps that crash on attach/gadget load — the anti-analysis tier (module i21) may already be watching; note the failure mode, do not fight it blindly yet',
              'frida-server version mismatches with the client (protocol errors) — pin versions in your lab notes',
              'Gadget configs: script directory, listening modes — the gadget\u2019s plist config controls whether it waits for a client or autoruns a script',
              'Multiple devices attached — frida -U picks USB; ambiguity errors are environment hygiene, not bugs'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Stand up one path fully: jailbroken lab device (install frida-server from your package manager) OR training-app gadget (embed, re-sign — i22 preview), per your environment',
              'Verify the loop: frida-ps -U lists the device; attach to the training app; ObjC.available returns true',
              'Run a spawn session with %resume and observe early logs (your module i10 log channel still running in parallel)',
              'Write the two-mode note: which path you stood up, versions, and what the other path would change for your current queue'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Targets, one more time',
            text:
              'Instrumentation runs only against apps you legitimately hold for authorized purposes: training apps, your builds, engagement targets. Hooking arbitrary production apps you do not have permission to assess is out of scope for this curriculum — the techniques are identical on sanctioned targets, so practice there.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'First attach as evidence, not show. Question from the queue: "does the app fetch remote configuration at launch?" Spawn the training app with a one-line script logging NSURLSession data task creation (next lesson\u2019s hook, previewed), %resume, and watch: three early requests to a config host — answered in ninety seconds without touching a proxy or a binary. Frida\u2019s first value is exactly this: the observation tier (i10) extended to arguments and call timing that logs and captures only infer.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'frida CLI + frida-tools (pip install frida-tools), frida-server (package manager on jailbroken labs), Frida Gadget (embedded dylib + config plist). Keep client/server versions pinned and recorded — Frida moves fast and version drift is the top lab-breaker.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Attach-mode sessions that miss early logic and conclude "it never happens" — timing-sensitive questions need spawn',
              'Fighting crashes on attach without noting them — the failure mode is data for module i21, not noise to push through',
              'Mixing Frida versions across client/server/gadget — pin and record them like every other tool',
              'Hooking without an observation design (i10-l01) — "see what happens" sessions produce screenshots, not findings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete one full path (server or gadget) and the three verification steps. Then take one queue entry and write which mode (attach/spawn) its observation needs and why — that single sentence is the module\u2019s bridge from environment to technique.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Frida = JS engine injected into the target; iOS offers server (jailbroken) and gadget (re-signed) paths',
            'Spawn mode instruments before app code runs — timing-sensitive questions require it',
            'The path decision follows artifact rights: store builds on stock devices have no hook path — say so, don\u2019t improvise',
            'Every hook session keeps i10\u2019s discipline: one question, expected artifact, verdict rule'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i11-l01-q1',
          type: 'mcq',
          prompt: 'Which deployment path allows Frida instrumentation of a store build on a stock (non-jailbroken) device?',
          options: [
            'frida-server via USB',
            'Frida Gadget embedded in the re-signed IPA',
            'None — store builds on stock devices have no hook path',
            'Simulator attachment'
          ],
          answerIndex: 2,
          hint: 'What do both paths require — root on device, or modification rights on the artifact?',
          explanation:
            'Neither path applies: frida-server needs the jailbreak (not stock), and the gadget requires modifying the IPA (not possible with an Apple-signed store artifact you do not control). Network/file channels remain — and the report states the boundary.'
        },
        {
          id: 'i11-l01-q2',
          type: 'truefalse',
          prompt: 'To catch logic that runs during app initialization (first network calls, early config), you should attach to the already-running app.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What has already happened by the time attach completes?',
          explanation:
            'False — initialization has run by attach time. Spawn mode starts the process suspended, installs hooks, then resumes: the standard answer for early-logic questions (module i02-l04\u2019s lifecycle model applied).'
        },
        {
          id: 'i11-l01-q3',
          type: 'scenario',
          prompt:
            'Your client provides a dev-signed build and prohibits jailbroken devices. Design your Frida path for this engagement.',
          hint: 'Which path needs no jailbreak, and what does it need instead?',
          explanation:
            'Gadget path: embed Frida Gadget into the dev build\u2019s IPA, re-sign with your dev identity (module i22 mechanics), install on the stock device, and drive it with the same client tooling. The client\u2019s build + your signing rights make this legitimate; document the modified-artifact caveat in the report (findings from gadget builds note the re-sign).'
        },
        {
          id: 'i11-l01-q4',
          type: 'mcq',
          prompt: 'Why pin and record Frida client/server/gadget versions in lab notes?',
          options: [
            'Licensing requirements',
            'Version drift breaks the protocol and changes behavior — reproducible evidence needs pinned tooling',
            'Apple signs the versions',
            'Older versions are more stealthy'
          ],
          answerIndex: 1,
          hint: 'What does any evidence chain need about its tools — same rule as i08-l01\u2019s artifacts?',
          explanation:
            'Frida\u2019s protocol and runtime change between versions; mismatches fail confusingly. Evidence that cannot state its tooling is not reproducible — the same provenance discipline as artifacts, applied to tools.'
        }
      ],
      references: [
        {
          title: 'Frida — documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'The official architecture and CLI references'
        },
        {
          title: 'Frida — Gadget documentation',
          url: 'https://frida.re/docs/gadget/',
          note: 'The embedded-path mechanics (config, modes)'
        },
        {
          title: 'OWASP MASTG — iOS instrumentation with Frida',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s Frida chapters — same techniques, sanctioned framing'
        }
      ]
    },
    {
      id: 'i11-l02',
      moduleId: 'i11',
      title: 'Hooking Objective-C: Arguments, Returns, Control',
      difficulty: 'Advanced',
      minutes: 28,
      prerequisites: ['i11-l01', 'i03-l02'],
      objectives: [
        'Write ObjC hooks that log arguments, stack traces and return values',
        'Modify return values and arguments deliberately — with stated reasons',
        'Understand what each line of a hook does, not just that it runs'
      ],
      diagram: 'ios-frida-hook-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An ObjC hook replaces a method\u2019s implementation: calls arrive, your JS runs, and you decide whether to observe (log and pass through) or modify (change arguments or forge a return). Observation is the default; modification is a deliberate act with a stated reason. This lesson builds both, line by line, because hooks you do not understand are liabilities — they mislead sessions and corrupt evidence.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-frida-hook-flow',
            caption: 'The hook path: dispatch meets replacement. Your JS stands between caller and implementation.'
          },
          { type: 'h', text: 'The observation hook, explained' },
          {
            type: 'code',
            lang: 'js',
            title: 'Observing LoginManager.validateUser:password: (training-app class)',
            code:
              'if (ObjC.available) {\n  var LoginManager = ObjC.classes.LoginManager;\n  if (!LoginManager) { console.log("class not found"); }\n  else {\n    var sel = "- validateUser:password:";            // - instance method, two args\n    Interceptor.attach(LoginManager[sel].implementation, {\n      onEnter: function (args) {\n        // args[0] = self, args[1] = selector (ObjC convention)\n        var user = new ObjC.Object(args[2]).toString();   // first real argument\n        var pwd  = new ObjC.Object(args[3]).toString();\n        console.log("[validate] user=" + user + " pwdLen=" + pwd.length);\n        console.log(Thread.backtrace(this.context, Backtracer.ACCURATE)\n          .map(DebugSymbol.fromAddress).join("\\n"));       // who called us?\n      },\n      onLeave: function (retval) {\n        console.log("[validate] returned " + retval);      // BOOL as 0/1\n      }\n    });\n  }\n}'
          },
          {
            type: 'list',
            items: [
              'ObjC.classes.X[selector].implementation — the IMP address (module i09-l02\u2019s join key, fetched live)',
              'args[0]/args[1] are self/_cmd; real arguments start at args[2] — the convention every ObjC hook memorizes once',
              'new ObjC.Object(ptr) wraps a native object reference into a readable proxy; toString() renders descriptions — passwords print as length, not content, in evidence hygiene',
              'Backtrace answers "who calls this" — reachability evidence the decompiler only estimated (i09-l03\u2019s xref question, settled live)',
              'onLeave sees the return value — retval.replace() is where modification would go; we do not, because this hook observes'
            ]
          },
          { type: 'h', text: 'The modification hook, deliberate' },
          {
            type: 'code',
            lang: 'js',
            title: 'Forging a return on a lab target — with the reason stated',
            code:
              '// GOAL: prove the client gates "premium" UI solely on this method\u0027s return\n// (authorized training target). Observation first showed true/false steering UI.\nvar FeatureGate = ObjC.classes.FeatureGate;\nInterceptor.attach(FeatureGate["- isPremiumUser"].implementation, {\n  onLeave: function (retval) {\n    console.log("[gate] original=" + retval + " -> forcing TRUE");\n    retval.replace(ptr(1));        // forge: UI unlocks if (and only if) client-side\n  }\n});'
          },
          {
            type: 'p',
            text:
              'The modification\u2019s value is what it PROVES, not what it unlocks: if premium UI unlocks on a forged return but the premium API rejects the forged session (module i14/i15 captures), the client-side gate is cosmetic — a finding with exact scope. If everything unlocks end-to-end, the finding is server-side authorization. The hook is the instrument; the verdict lives in the system\u2019s response.'
          },
          { type: 'h', text: 'Hook hygiene' },
          {
            type: 'list',
            items: [
              'Guard every hook: class/method may not exist (ObjC.available, null checks) — crashes are noise, guards are hygiene',
              'One question per session — multi-hook spaghetti produces interleaved logs nobody can cite',
              'Log to evidence, not to vibes: stable prefixes ([validate], [gate]) so transcripts parse',
              'Passwords/PII in logs: log shapes and lengths, not values, unless the value IS the question'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Observation hooks answer the queue\u2019s "what flows through here" questions with exact values and call paths — the strongest dynamic evidence tier',
              'Modification hooks test client-trust questions (i15): which decisions does the server actually enforce?',
              'Backtraces from hooks settle reachability claims (i09-l03) with runtime proof',
              'Hook hygiene (prefixes, guards, one-question sessions) is what makes transcripts citable in reports'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Methods whose return steers UI but whose data still requires valid API calls — the cosmetic-gate pattern',
              'Arguments carrying secrets in plaintext into logging/analytics methods — hook the logger, catch the leak at the source',
              'Validation methods that return BOOL early on cached flags — the flag provenance question (i09-l03\u2019s mockAuth shape) settles here',
              'Hooks that never fire — wrong selector signature (colons count!) or class not loaded at attach time; enumerate before hooking (next lesson)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'On your training app: write and run the observation hook for its login path; capture user/args/return/backtrace into a transcript',
              'Read the backtrace: name the caller chain in one sentence — does it match the decompiler\u2019s xref story (i09-l03)?',
              'Run one deliberate modification (gate/flag return) with the reason in a comment; capture the system\u2019s response (UI + wire via i10-l02\u2019s capture)',
              'Write the verdict paragraph: what the observation proved, what the modification proved, what remains',
              'File the transcript + verdict into the evidence bundle — this is finding-grade material now'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The cosmetic-gate finding, end to end. Training bank app: static (i09) showed PremiumRouter checks FeatureGate.isPremiumUser. Hook: forge TRUE → premium UI unlocks (screenshot). Capture (i10-l02): premium API calls fail 403 — the server enforces. Verdict: "Client-side premium gating is cosmetic; UI restriction only. Server authorization correct; user-facing consistency issue, hardening note — no security bypass." A hook produced a finding whose headline is that nothing bad happened — the discipline working exactly right: the verdict follows the system\u2019s response, not the dramatic hook.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida REPL and script files; objection (module i11-adjacent convenience layer) after the fundamentals; your i10 capture channel running alongside for the system-response half of every verdict. objection\u2019s one-liners are useful — but this module insists you can write the hook it hides.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Selector signature errors (missing colons, wrong minus/plus) — the hook silently never fires; enumerate and match exactly',
              'Logging raw secrets into transcripts — log shapes/lengths unless the value is the question',
              'Modification without a stated reason or a system-response capture — a forged return proves nothing by itself',
              'Reading retval.replace(ptr(1)) as a universal unlock — types matter (BOOL vs object pointers); blind replaces crash or lie'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write both hooks (observation on login, deliberate modification on a gate) against your training app, with the hygiene rules enforced. Then write the two-sentence evidence note for each: what fired, what it proved. If a hook never fired, debug via enumeration (next lesson) — and note that debugging session too; it is the same skill.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Hooks replace IMPs: observe by default, modify deliberately, and state the reason for every modification',
            'args[2]+ are the real arguments; ObjC.Object wraps pointers; backtraces settle reachability live',
            'A forged return\u2019s value is the system\u2019s response to it — pair every modification with wire/UI capture',
            'Hygiene (guards, prefixes, one-question sessions, shape-not-value logging) makes transcripts citable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i11-l02-q1',
          type: 'mcq',
          prompt: 'In an ObjC hook\u2019s onEnter, where do the method\u2019s actual arguments start?',
          options: ['args[0]', 'args[1]', 'args[2]', 'args[3]'],
          answerIndex: 2,
          hint: 'The ObjC convention puts two implicit parameters before the declared ones. Which?',
          explanation:
            'args[0] is self, args[1] is the selector (_cmd); declared arguments begin at args[2]. Every ObjC hook gets this right or silently reads the wrong data.'
        },
        {
          id: 'i11-l02-q2',
          type: 'truefalse',
          prompt: 'Forging isPremiumUser to return TRUE proves the app\u2019s premium features are insecurely gated.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the forged return prove — and what does the server\u2019s response to it prove?',
          explanation:
            'False by itself. The forge proves what the CLIENT does with the return; security depends on whether premium functionality follows without server enforcement. Capture the system\u2019s response (403s = cosmetic gate = hardening note; success = server-side authorization finding). The verdict follows the response.'
        },
        {
          id: 'i11-l02-q3',
          type: 'scenario',
          prompt:
            'Your hook on "- validateUser:password:" never fires. Give the three most likely causes in order of checking.',
          hint: 'Selector exactness, class presence at attach time, and which path you are on.',
          explanation:
            '(1) Selector string exactness (spelling/colons/plus-minus); (2) class not yet loaded at attach — enumerate live or use spawn; (3) wrong target path (class lives in a framework/extension you did not hook, or the gadget script didn\u2019t load). Enumeration (next lesson) resolves all three in one pass.'
        },
        {
          id: 'i11-l02-q4',
          type: 'mcq',
          prompt: 'Why log password length instead of the password itself in hook transcripts?',
          options: [
            'Passwords are too long for the console',
            'Evidence hygiene: transcripts circulate; the shape answers the question without harvesting credentials',
            'Frida truncates strings automatically',
            'It makes hooks run faster'
          ],
          answerIndex: 1,
          hint: 'Who reads transcripts later, and what do you actually need from the value?',
          explanation:
            'Transcripts become evidence files; collecting live credentials converts your lab artifact into a liability and adds nothing to the finding (the shape/flow is the evidence). Log values only when the value itself is the question — and then handle with care.'
        }
      ],
      references: [
        {
          title: 'Frida — JavaScript API (ObjC bridge, Interceptor)',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The API surface behind every hook in this lesson'
        },
        {
          title: 'OWASP MASTG — hooking Objective-C methods',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s hooking technique chapters'
        },
        {
          title: 'objection (runtime exploration toolkit)',
          url: 'https://github.com/sensepost/objection',
          note: 'The convenience layer — use after you can write the hooks yourself'
        }
      ]
    },
    {
      id: 'i11-l03',
      moduleId: 'i11',
      title: 'Enumeration and Tracing: Mapping the Runtime',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i11-l02'],
      objectives: [
        'Enumerate classes, methods and loaded frameworks at runtime',
        'Trace execution across a feature flow to map its real call surface',
        'Reconcile runtime maps with static target lists — and resolve the deltas'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Before hooking a specific method, the runtime hands you the map for free: every class the process loaded, every method each class owns, every framework linked in memory. Enumeration answers "what exists", tracing answers "what actually runs" — and the difference between the two maps is where the interesting findings hide (dead code, lazily loaded SDKs, dynamically constructed behavior).'
          }
        ],
        technical: [
          { type: 'h', text: 'Enumeration' },
          {
            type: 'code',
            lang: 'js',
            title: 'The runtime inventory, three layers',
            code:
              '// 1) classes — filter to the app\u0027s own vocabulary\nvar own = Object.keys(ObjC.classes).filter(function (c) {\n  return /Target|Bank|Auth|Session|Crypto|Pin|Gate|Router/i.test(c);\n});\nconsole.log(own.join("\\n"));\n\n// 2) methods of one class — the hookable surface\nconsole.log(ObjC.classes.LoginManager.$ownMethods.join("\\n"));\n\n// 3) loaded frameworks — the live SDK inventory\nObjC.enumerateLoadedClassesSync().forEach(function (m) {\n  console.log(m.module + ": " + m.classes.length + " classes");\n});'
          },
          { type: 'h', text: 'Tracing a feature flow' },
          {
            type: 'code',
            lang: 'js',
            title: 'Trace every method of the login flow\u0027s classes',
            code:
              'var targets = ["LoginManager", "SessionManager", "CryptoHelper"];\ntargets.forEach(function (name) {\n  var cls = ObjC.classes[name];\n  if (!cls) { return; }\n  cls.$ownMethods.forEach(function (m) {\n    try {\n      Interceptor.attach(cls[m].implementation, {\n        onEnter: function (args) {\n          console.log("[" + name + "] " + m);\n        }\n      });\n    } catch (e) { /* variadic/vararg methods resist attach — note and skip */ }\n  });\n});\n// now exercise the login UI — the transcript is the flow\u0027s real call map'
          },
          {
            type: 'list',
            items: [
              '$ownMethods is the hookable surface (selectors exactly as the runtime knows them — copy-paste them into hooks verbatim)',
              'enumerateLoadedClassesSync exposes lazily loaded SDKs — frameworks the static sweep missed because they load late',
              'The trace transcript is the feature\u2019s call map: order, repetition, and surprises (methods firing you did not predict)',
              'Variadic methods (format-string style) resist Interceptor.attach — note them; native-level techniques (i11-l05) handle some'
            ]
          },
          { type: 'h', text: 'Reconciling the maps' },
          {
            type: 'list',
            items: [
              'Static target (i09-l02) never traced → dead code, wrong trigger, or wrong class name — each resolution is a finding about your model or the app',
              'Traced method absent from static targets → dynamically loaded code, category methods, or SDK behavior — enrich the static map',
              'Methods that fire in unexpected order → the feature\u2019s real control flow — often better than the decompiler\u2019s guess',
              'Enumeration as debugging: every silent hook from i11-l02 resolves here in one pass'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The runtime class list is reconnaissance gold: the app names its own security vocabulary (validators, gates, managers) — static dumps (i09-l02) plus live confirmation',
              'Trace transcripts attribute behavior: "this UI action calls CryptoHelper.decrypt with the stored token" — evidence-grade flow description',
              'Lazily loaded frameworks widen the SDK inventory (i08-l02) — analytics/anti-fraud SDKs that appear only in specific flows',
              'Reconciliation is quality control for the whole static workflow — deltas become findings either way'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Security-vocabulary classes that never trace during normal use — dormant logic (debug paths, unreleased features) worth a targeted trigger hunt',
              'Frameworks loading late in specific flows (payment SDKs at checkout) — scope and privacy implications',
              'Crypto/storage methods tracing on innocent UI actions (background sync encrypting caches) — the storage/network story enriched',
              'Method names that contradict UI labels ("logout" flow not calling session invalidation — i10-l02\u2019s finding, confirmed at call level)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the three-layer enumeration on your training app; save the inventory as an artifact',
              'Trace two feature flows (login, one core feature); save both transcripts',
              'Reconcile: for each i09-l02 target, mark traced / not-traced / missing-from-runtime — write one line per delta',
              'Pick the most interesting delta (dormant class, late SDK, misordered flow) and design the follow-up observation (i10-l01 pattern)',
              'Update the target list and queue — enumeration output feeds hooks (i11-l02) and RE questions (i09-l04) in both directions'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A delta that became a finding. Static list had LicenseValidator (i09-l02, from strings "LicenseValidator activateLicense:"). Trace across all core flows: never fires. Enumeration\u2019s framework pass explains why — the SDK hosting it loads only when a hardware accessory connects (external-accessory entitlement, i06-l03). The delta produced two artifacts: a scope note (license logic is accessory-gated — test matrix needs the accessory path) and a hygiene finding (license activation logic shipping dormant in a consumer app). Neither was visible to sweep or decompilation alone — the reconciliation layer earned its keep.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida REPL with the enumeration snippets above (keep them in a personal script library — they are permanent tooling), plus objection\u2019s inventory commands as cross-checks. The transcripts are evidence artifacts: label, hash, file.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Tracing everything at once — filter to the flow\u2019s classes; full-process traces are unreadable and unparsable',
              'Treating not-traced as not-present — lazily loaded code and wrong triggers explain most deltas; resolve, do not assume',
              'Skipping the try/catch on attach — variadic methods throw, and a crashed script mid-trace loses the transcript',
              'Forgetting that enumeration output is also evidence — inventories and transcripts get labeled and hashed like captures'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the three-layer inventory and two flow traces for your training app, then the reconciliation table (target × traced/not/missing × one-line resolution). Ship the follow-up observation design for the best delta. Three artifacts, one habit — runtime mapping is now permanent tooling in your kit.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Enumeration (classes/methods/frameworks) maps what exists; tracing maps what runs — the delta is the finding surface',
            '$ownMethods gives hook-ready selector strings; loaded-classes passes expose late-loading SDKs',
            'Reconcile runtime maps against static targets in both directions — every delta resolves into model improvement or finding',
            'Variadic methods resist attach; note them and move on — native techniques come later'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i11-l03-q1',
          type: 'mcq',
          prompt: 'What does ObjC.classes.X.$ownMethods return?',
          options: [
            'All methods including inherited ones',
            'The methods declared by X itself — the hookable surface with exact selectors',
            'The class\u2019s properties only',
            'The class\u2019s metatype'
          ],
          answerIndex: 1,
          hint: '"Own" is the operative word — what does it exclude?',
          explanation:
            '$ownMethods lists the class\u2019s own method selectors (not inherited ones) — copy-paste-ready hook handles. Inherited methods live on their declaring classes.'
        },
        {
          id: 'i11-l03-q2',
          type: 'truefalse',
          prompt: 'A statically identified class that never appears in trace transcripts is necessarily dead code.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What are the three explanations for a never-traced target?',
          explanation:
            'False — dead code is one of three: dead code, wrong/unachieved trigger, or code that loads lazily (framework or class resolution) and was absent when you traced. Resolution means determining which — each answer has different report value.'
        },
        {
          id: 'i11-l03-q3',
          type: 'scenario',
          prompt:
            'During checkout tracing, a payment SDK\u2019s classes appear that the static sweep never listed. What happened, and what does it change?',
          hint: 'When did those classes load — and what does the SDK inventory (i08-l02) need?',
          explanation:
            'The SDK loads lazily at checkout (dynamically linked/late-bound). The static inventory gets a runtime-discovered addition; scope and privacy observations extend (a payment SDK\u2019s data flows now belong to the capture analysis), and the engagement\u2019s SDK table cites both static and runtime evidence.'
        },
        {
          id: 'i11-l03-q4',
          type: 'mcq',
          prompt: 'Why do some methods fail Interceptor.attach with exceptions?',
          options: [
            'Frida\u2019s license expires on them',
            'Variadic (format-string style) methods have no fixed argument signature for attach — note and skip (or use native techniques)',
            'They are Swift methods exclusively',
            'The class is not ObjC'
          ],
          answerIndex: 1,
          hint: 'What does attach need about a method\u2019s arguments that variadic signatures lack?',
          explanation:
            'Interceptor attaches at fixed call sites with known signatures; variadic methods (NSString-style format calls) vary their argument count at runtime. The try/catch-and-note pattern keeps traces alive; native-level work (i11-l05) covers selected cases.'
        }
      ],
      references: [
        {
          title: 'Frida — ObjC bridge and runtime enumeration APIs',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The enumeration/tracing API surface'
        },
        {
          title: 'OWASP MASTG — runtime exploration techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s runtime mapping chapters'
        },
        {
          title: 'objection — runtime exploration commands',
          url: 'https://github.com/sensepost/objection',
          note: 'Cross-checks for the manual enumeration snippets'
        }
      ]
    },
    {
      id: 'i11-l04',
      moduleId: 'i11',
      title: 'Instrumenting Auth and Crypto Logic',
      difficulty: 'Advanced',
      minutes: 28,
      prerequisites: ['i11-l03', 'i10-l02'],
      objectives: [
        'Instrument authentication flows to observe token handling and client trust decisions',
        'Hook crypto APIs (Security framework, CommonCrypto, CryptoKit) to observe key and data handling',
        'Pair every instrumentation session with a capture so system responses complete the verdict'
      ],
      diagram: 'ios-auth-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Two logic families produce most iOS findings that survive review: authentication decisions (what the client trusts) and cryptography handling (what is actually encrypted with what). This lesson instruments both on safe targets — observing token flows through the system\u2019s own APIs and reading crypto operations\u2019 real inputs, with the proxy capture always running so the app\u2019s claims meet the system\u2019s answers.'
          }
        ],
        technical: [
          { type: 'h', text: 'Auth-flow instrumentation' },
          {
            type: 'code',
            lang: 'js',
            title: 'Observing token storage decisions at the system boundary',
            code:
              '// Hook SecItemAdd — every keychain write in the app passes here\nvar SecItemAdd = Module.findExportByName("Security", "SecItemAdd");\nInterceptor.attach(SecItemAdd, {\n  onEnter: function (args) {\n    var query = new ObjC.Object(args[0]);   // CFDictionaryRef\n    console.log("[SecItemAdd] " + query.toString().slice(0, 400));\n  }\n});\n// Watch for: kSecAttrAccessible values (module i05\u0027s classes),\n// kSecAttrAccessGroup (sharing scope), and what data lands (value shapes, not secrets).\n// Pair with the UserDefaults-side observation (i10-l02\u0027s file channel) for the full story.'
          },
          {
            type: 'list',
            items: [
              'System-boundary hooks (SecItem*, NSUserDefaults methods) see every storage decision regardless of app-side wrapper classes — one hook, whole feature class',
              'Token-handling questions resolve: which class stores the token, with which accessibility, and does it match the static audit\u2019s claim (i13\u2019s rubric applied live)',
              'Auth decision points (login managers, validators from the target list) get i11-l02\u2019s observation treatment: arguments\u2019 shapes, returns, backtraces'
            ]
          },
          { type: 'h', text: 'Crypto observation' },
          {
            type: 'code',
            lang: 'js',
            title: 'Observing CommonCrypto operations (training target)',
            code:
              '// CCCrypt — the classic C API: observe algorithm, key, IV shapes\nvar CCCrypt = Module.findExportByName("libcommonCrypto.dylib", "CCCrypt");\nInterceptor.attach(CCCrypt, {\n  onEnter: function (args) {\n    var op      = args[0].toInt32();        // 0 = encrypt, 1 = decrypt\n    var alg     = args[1].toInt32();        // 0 = AES\n    var options = args[2].toInt32();        // bit1 = ECB — the flag to watch\n    var keyLen  = args[3].toInt32();\n    console.log("[CCCrypt] op=" + op + " alg=" + alg + " opts=" + options + " keyLen=" + keyLen);\n    // log key material ONLY in shape (length) — values go nowhere\n  }\n});\n// CryptoKit: hook the ObjC-facing wrappers (\u0027AES.GCM.seal\u0027 family appears as\n// Swift/ObjC bridge classes — enumerate first (i11-l03), then hook what exists.'
          },
          {
            type: 'list',
            items: [
              'Options/parameter reading is the finding surface: ECB flags (module i18\u2019s red letter), key lengths, static-vs-derived keys (length alone is a clue)',
              'The verdict pairs with the artifact: observe a decryption, then check the plaintext\u2019s destination (file? log? UI?) — crypto findings are about data flows, not algorithms alone',
              'Module i18 goes deep on the crypto judgment; this lesson delivers the observation machinery'
            ]
          },
          { type: 'h', text: 'The pairing rule' },
          {
            type: 'p',
            text:
              'Every auth/crypto instrumentation session runs with the capture channel live (i10-l02). The hook shows the app\u2019s side (what it stored, what it encrypted, what it sent); the capture shows the system\u2019s side (what the API accepted, what the server enforced). Findings from this module are two-sided by construction — that is what makes them survive review.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Storage findings upgrade to system-boundary evidence: "SecItemAdd observed with kSecAttrAccessibleAlways for the session token" beats "we think it uses weak classes"',
              'Crypto findings gain parameter truth: ECB flags and key lengths observed live, paired with the decrypted artifact\u2019s destination',
              'Client-trust questions (i15) resolve with the pairing rule: forged gates (i11-l02) + captures = which decisions the server actually enforces',
              'All of it runs on training targets first — the techniques are identical on engagements, and the discipline (shape-not-value logging, pairing) is what transfers'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SecItemAdd calls with weak accessibility classes on high-value items (module i05-l02\u2019s rubric, live)',
              'UserDefaults writes of token-shaped values observed in the same session as keychain writes — the dual-storage pattern',
              'CCCrypt options bit for ECB, key lengths of 16 with hardcoded-looking sources (cross-ref i08-l03\u2019s sweep)',
              'Login flows that skip the API entirely on certain paths (mock/offline branches) — the flag-gated auth shapes from the sweep',
              'Crypto outputs flowing to logs or analytics endpoints — the leak\u2019s full path in one session'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Stand up the paired session: Frida (spawn, per i11-l01) + proxy capture + container diff channel armed',
              'Run the storage-observation script through login/logout; transcribe SecItem*/UserDefaults decisions into the storage table (i13\u2019s rubric columns)',
              'Run the crypto-observation script through a feature that encrypts (or the training app\u2019s designated one); record parameters and follow the plaintext\u2019s destination',
              'Write the two verdict paragraphs (storage, crypto) with both sides\u2019 artifacts cited',
              'Queue update: which module i13/i14/i15/i18 entries did these sessions close, and which reopened?'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The dual-storage finding, instrumented. Training app, paired session: hook observes SecItemAdd (refresh token, WhenUnlockedThisDeviceOnly — correct) AND a UserDefaults set for the same token family seconds later (access token, plaintext). Capture shows both values in API calls identically. Container diff shows the plist. Verdict: "Session access token stored redundantly in plaintext preferences while its refresh counterpart uses correct keychain classes; both observed live at the system boundary, artifact-confirmed in container, wire-confirmed in use." One session, three channels, finding-grade specificity — the pairing rule\u2019s payoff.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida with your growing personal script library (SecItem hooks, CCCrypt hooks, storage setters), the i10 capture/file channels, and the module i09 imp-address list for app-level targets. The scripts are permanent tooling — build them once, label them, reuse everywhere.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Hooking app-level wrappers instead of system boundaries — wrappers vary per app; SecItem/CCCrypt/NSUserDefaults are universal',
              'Logging key material or token values — shapes and lengths answer the questions; values create liabilities',
              'Running crypto observation without the destination check — "it encrypts" is meaningless without knowing where the plaintext/result goes',
              'Forgetting the pairing rule — hook-only sessions produce app-side claims; findings need the system side too'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full paired session on your training app (storage + crypto observation, capture live, diff armed). Produce the two verdict paragraphs and the queue update. If your target uses CryptoKit rather than CommonCrypto, write the alternative observation plan instead — enumerating the bridge classes and hooking what exists is the same skill pointed differently.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'System-boundary hooks (SecItem*, CCCrypt, NSUserDefaults) observe whole feature classes regardless of app wrappers',
            'Crypto findings live in parameters and destinations: modes, key lengths, and where plaintext flows',
            'The pairing rule: every instrumentation session runs with capture/diff channels — two-sided evidence or it is not a finding',
            'Shape-not-value logging keeps transcripts evidence-grade instead of credential harvests'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i11-l04-q1',
          type: 'mcq',
          prompt: 'Why hook SecItemAdd rather than the app\u2019s KeychainWrapper class?',
          options: [
            'The wrapper is too hard to find',
            'Every keychain write in the app passes through the system API — one hook observes the whole class of behavior regardless of wrappers',
            'The wrapper class cannot be hooked',
            'SecItemAdd returns more data'
          ],
          answerIndex: 1,
          hint: 'Which boundary does ALL keychain traffic cross, by design?',
          explanation:
            'The system API is the chokepoint: app wrappers, SDKs and Swift/ObjC variants all terminate at SecItem*. Chokepoint hooks observe universally — the same reasoning that makes class singletons good targets (i03-l01), applied at the platform layer.'
        },
        {
          id: 'i11-l04-q2',
          type: 'truefalse',
          prompt: 'When observing CCCrypt, logging the actual key bytes is acceptable as long as the transcript stays in your lab.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the shape-not-value rule exist to prevent — and does "my lab" change it?',
          explanation:
            'False. Transcripts become evidence artifacts with uncertain circulation; the shape (length, source shape) answers the analysis question. The rule is discipline, not paranoia — and it applies in labs precisely because labs produce reports.'
        },
        {
          id: 'i11-l04-q3',
          type: 'scenario',
          prompt:
            'Your CCCrypt hook shows op=1 (decrypt), alg=0 (AES), opts=1 (ECB), keyLen=16, and the plaintext lands in a log line. Compose the finding skeleton.',
          hint: 'Algorithm problem + destination problem — what are the two claims, and what artifacts back each?',
          explanation:
            'Claim 1: ECB-mode AES with a 16-byte key used for feature data (observed: [CCCrypt] opts=1) — weak mode per module i18\u2019s rubric; artifact: hook transcript. Claim 2: decrypted plaintext emitted to logs — exposure finding; artifacts: log line + (if paired) capture/diff. Two findings or one compound finding, both artifact-backed — the skeleton is the claim/artifact pairs.'
        },
        {
          id: 'i11-l04-q4',
          type: 'mcq',
          prompt: 'What does the pairing rule (hooks + capture) add to an auth finding?',
          options: [
            'More log volume',
            'The system\u2019s side of the verdict: what the server/API actually enforced against the observed client behavior',
            'Screenshot evidence',
            'Nothing — hooks alone suffice'
          ],
          answerIndex: 1,
          hint: 'The app\u2019s side says what it did. What completes the security verdict?',
          explanation:
            'Auth findings are claims about trust placement — "the client trusts X, the server does/does not enforce." The hook observes the client; the capture shows enforcement. Without the pairing, the finding is half a sentence.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — SecItemAdd (Keychain Services)',
          url: 'https://developer.apple.com/documentation/security/1401659-secitemadd',
          note: 'The API boundary whose hooks observe all keychain behavior'
        },
        {
          title: 'Apple Developer — CCCrypt (CommonCrypto)',
          url: 'https://developer.apple.com/documentation/security/1401672-cccrypt',
          note: 'Parameter semantics for the crypto observation hook'
        },
        {
          title: 'OWASP MASTG — iOS instrumentation for storage and crypto tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s corresponding test techniques'
        }
      ]
    },
    {
      id: 'i11-l05',
      moduleId: 'i11',
      title: 'Advanced: Native Hooks, Swift-Only Code and Memory',
      difficulty: 'Advanced',
      minutes: 28,
      prerequisites: ['i11-l04', 'i09-l01'],
      objectives: [
        'Attach native-level hooks to C functions and Swift-only code by address',
        'Read and modify raw memory safely (NativePointer discipline)',
        'Know the honest limits: what native instrumentation can and cannot claim'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The ObjC bridge covers most app code, but two families resist it: C-level functions (crypto, network plumbing, third-party SDKs) and Swift-only code (no selectors to hook). Native instrumentation addresses both — by symbol or by raw address — and with it comes the discipline that separates advanced practitioners from script-kiddies: pointer hygiene, address math from module i09-l01, and honesty about what an address-level hook can claim.'
          }
        ],
        technical: [
          { type: 'h', text: 'Native hooks by symbol' },
          {
            type: 'code',
            lang: 'js',
            title: 'Hooking a C function across module boundaries',
            code:
              '// by export name + module — the reliable form\nvar addr = Module.findExportByName(null, "CC_SHA256");\nInterceptor.attach(addr, {\n  onEnter: function (args) {\n    this.len = args[1].toInt32();\n    console.log("[CC_SHA256] dataLen=" + this.len);\n  },\n  onLeave: function (retval) {\n    // digest written to args[2]\u0027s buffer — read it if the question needs the shape\n  }\n});\n// Module.findExportByName(null, name) searches all loaded modules —\n// scope it to a module when names collide (SDK-statically-linked cases).'
          },
          { type: 'h', text: 'Swift-only code by address' },
          {
            type: 'code',
            lang: 'js',
            title: 'Attaching where selectors do not exist',
            code:
              '// From module i09-l02\u0027s target list: SessionLoader.load, imp 0x1042b4f30 (static)\n// Runtime address = static address + slide (i09-l01\u0027s vm math)\nvar mod = Process.enumerateModulesSync().filter(function (m) {\n  return m.name === "TargetApp";\n})[0];\nvar slide = mod.base.sub(ptr("0x100000000"));   // subtract the preferred base\nvar target = ptr("0x1042b4f30").add(slide);\nInterceptor.attach(target, {\n  onEnter: function (args) {\n    console.log("[SessionLoader.load] entered");\n    // arm64 convention (module i19 preview): x0 = self, x1.. = args\n  }\n});\n// Address math discipline: compute the slide ONCE per session, log it,\n// and never hardcode runtime addresses across runs (ASLR).'
          },
          { type: 'h', text: 'Memory reading, with hygiene' },
          {
            type: 'list',
            items: [
              'NativePointer is the currency: .readPointer/.readUtf8String/.readByteArray with length discipline — read sizes you can justify',
              'Wrap risky reads in try/catch: invalid addresses crash the target, and a crashed target loses the session\u2019s evidence',
              'Hexdumps answer shape questions (does this buffer hold a token? is it base64-ish?) — read shapes, not harvests',
              'Writes are a different tier: patching memory is a modification (i11-l02\u2019s deliberate-act rule) with the same reason-and-capture requirements'
            ]
          },
          { type: 'h', text: 'The honest limits' },
          {
            type: 'list',
            items: [
              'Address-based hooks are build-specific: a new binary invalidates every hardcoded address — recompute from fresh dumps (the i09-l02 list regenerated per artifact)',
              'Swift calling conventions differ from ObjC message sends (register-based, no _cmd) — argument reading follows the arm64 convention (module i19 formalizes), and misread registers produce confident nonsense',
              'Anti-analysis targets may checksum hooked code (module i21) — hooks themselves alter bytes; that is a detection surface, and knowing it is the point',
              'Native work multiplies misreading risk — every native conclusion gets the same pairing treatment (i11-l04) before it becomes a finding'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'SDK internals (crypto, anti-fraud, license checks) are C/C++ and Swift — native hooks are the only path in, and the i09 imp list is your map',
              'Swift-only auth/storage code (increasingly common) hooks by address — the target list\u2019s Swift rows become native work',
              'Memory shape-reading resolves "what does this buffer hold" questions that neither files nor captures answer',
              'Address hygiene (slide computation, per-artifact dumps) is what keeps native evidence reproducible at all'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'C-level crypto in SDKs (statically linked CommonCrypto patterns) — symbol-collision risks when several SDKs bundle their own',
              'Swift-only singletons handling sessions/tokens — the modern default, invisible to ObjC enumeration',
              'Buffers read from Keychain/system APIs then processed natively — the shape questions (encrypted? base64? plist?) live here',
              'Code that checksums itself (integrity checks) — note the pattern for module i21\u2019s evaluation rather than fighting it here'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Take one Swift-only target from your i09-l02 list; compute the slide, attach by address, and capture entry/argument-shape output',
              'Hook one C function (CC_SHA256 or the training app\u2019s equivalent) by symbol with module scoping; log shapes through a feature flow',
              'Perform one justified memory read (hexdump a buffer whose shape is a queue question) with try/catch protection',
              'Write the honesty note for each: what the native hook claimed, what artifact backs it, what remains paired/pending',
              'Update the evidence bundle; regenerate the imp list note (address-based hooks are per-artifact — record the artifact hash beside the addresses)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A native session that closed a static question. Static (i09-l03) could not confirm whether Swift-only TokenStore.persist wrote to Keychain or UserDefaults. Native hook by address: onEnter logs entry; paired memory read of the argument object\u2019s buffer shows the plist-key string; capture/diff (i10-l02) confirms the plist write. Verdict: "TokenStore.persist (Swift, imp-verified for artifact hash X) writes to UserDefaults; native hook + buffer shape + file diff agree." The address-level work turned a static guess into a three-channel verdict — and the artifact-hash note keeps it reproducible.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida\u2019s native APIs (Module, NativePointer, Process.enumerateModules), your i09 dump outputs (addresses + preferred bases), and the discipline habits: slide computed once, try/catch everywhere, shapes not harvests. Ghidra cross-references (i09-l03) remain the way to choose WHICH addresses deserve hooks.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Hardcoding runtime addresses across sessions/relaunches — ASLR invalidates them; compute slides per session',
              'Unwrapped memory reads that crash the target mid-flow — losing sessions and their evidence to save a try/catch',
              'Reading arm64 arguments by ObjC convention on Swift code — x0/x1 semantics differ (module i19); misreads look plausible',
              'Native-hook conclusions without pairing — address-level evidence is the MOST contestable tier; it needs the system-response side most of all'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete the three native exercises (address hook, symbol hook, justified read) on your training target. Then write the honesty note for the address hook in particular — including the artifact-hash dependency. Native tier unlocked means responsibility unlocked: the note is you demonstrating that you know it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Native hooks reach C functions (by symbol, module-scoped) and Swift-only code (by address + slide)',
            'Address math comes from module i09\u2019s dumps and is per-artifact — record hashes beside addresses',
            'Pointer hygiene: sized reads, try/catch, shape questions — crashed targets lose evidence',
            'Native tier is the most contestable evidence class — pairing with system-side artifacts is not optional'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i11-l05-q1',
          type: 'mcq',
          prompt: 'Why must runtime addresses be recomputed per session rather than hardcoded from a previous run?',
          options: [
            'Frida changes addresses randomly by design',
            'ASLR: each launch slides the image; runtime address = static address + slide (computed from module base)',
            'The app re-signs itself',
            'Hardcoding is fine for dev builds'
          ],
          answerIndex: 1,
          hint: 'What did module i09-l01 say about vm addresses and module i03-l04 about load addresses?',
          explanation:
            'ASLR slides every load; the static imp address from the dump needs the per-session slide (module base minus preferred base). Hardcoded runtime addresses either miss or attach to random memory — both produce silent nonsense.'
        },
        {
          id: 'i11-l05-q2',
          type: 'truefalse',
          prompt: 'Swift-only methods can be hooked through ObjC.classes as long as you mangle the name correctly.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which runtime owns the method — and does the ObjC bridge see it at all?',
          explanation:
            'False. Swift-only methods are not ObjC objects; ObjC.classes never lists them. The path is native: imp address from dumps, slide, Interceptor.attach — with arm64 register conventions for arguments (module i19).'
        },
        {
          id: 'i11-l05-q3',
          type: 'scenario',
          prompt:
            'Your native hook on a Swift function reads x1 as the "username string" and gets garbage. Most likely cause and fix?',
          hint: 'Which calling convention did you assume — and what does Swift actually use?',
          explanation:
            'You assumed ObjC convention (x0=self, x1=_cmd, x2+=args). Swift uses plain arm64 register passing without _cmd — and without metadata, argument positions must be confirmed from the disassembly/decompilation (i09-l03) before reading. Fix: verify the convention from the function\u2019s listing, then re-read.'
        },
        {
          id: 'i11-l05-q4',
          type: 'mcq',
          prompt: 'Why is native-tier evidence the most contestable, and what answers that?',
          options: [
            'It is not contestable — addresses are exact',
            'Address hooks are build-specific and register readings are convention-dependent — pairing with system-side artifacts (captures, files) and recording artifact hashes answers it',
            'Because Frida is undocumented',
            'Contestability depends on the IDE'
          ],
          answerIndex: 1,
          hint: 'What are the two named failure modes of native work — and which discipline neutralizes each?',
          explanation:
            'Build-specific addresses fail silently across artifacts (hash-pinned notes fix that); convention misreads look plausible (pairing with independent channels catches them). The advanced tier\u2019s power is real — so is its discipline debt.'
        }
      ],
      references: [
        {
          title: 'Frida — Native APIs (Module, NativePointer, Interceptor)',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The native surface used throughout this lesson'
        },
        {
          title: 'OWASP MASTG — iOS native instrumentation techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s advanced instrumentation chapters'
        },
        {
          title: 'Apple Developer — ARM64 calling conventions (via ABI documentation)',
          url: 'https://developer.apple.com/documentation/xcode/writing-arm64-code-for-apple-platforms',
          note: 'The register convention behind Swift/native argument reading'
        }
      ]
    }
  ]
};
