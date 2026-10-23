import type { Module } from '../../types';

// LEVEL 8 — RESILIENCE · Module 13: Anti-Analysis & Resilience
// Original curriculum content. Framed dual-purpose: how developers build
// defenses AND how authorized testers evaluate them. Bypass specifics stay at
// concept level; hands-on instrumentation technique is module 12's territory.

export const m13: Module = {
  id: 'm13',
  title: 'Anti-Analysis & Resilience',
  level: 8,
  description:
    'How developers raise the cost of reverse engineering and tampering — obfuscation, environment detection, integrity checks — and how authorized testers evaluate whether those defenses buy real security. Concept-level throughout; hands-on instrumentation technique is module 12\u2019s business.',
  outcomes: [
    'Describe what R8/ProGuard, string encryption, and packers change — and what they do not',
    'Explain how root, emulator, debugger, and Frida detection is typically implemented',
    'Evaluate detection defenses for coverage, false positives, and server-side pairing',
    'Reason about signature checks, re-pack detection, and attestation trade-offs'
  ],
  lessons: [
    {
      id: 'm13-l01',
      moduleId: 'm13',
      title: 'Obfuscation and Hardening',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l02'],
      objectives: [
        'Explain the three jobs of R8/ProGuard: shrinking, optimization, obfuscation',
        'Describe string encryption, resource obfuscation, and packers/protectors',
        'Predict what survives obfuscation and adjust your static-analysis workflow accordingly'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'From the developer side, module 04 was bad news: DEX decompiles into readable Java, so anyone with JADX reads their code. Hardening is the answer to that problem — a set of build-time and packaging techniques whose shared goal is raising the cost of understanding and modifying the app.'
          },
          {
            type: 'p',
            text:
              'The honest frame, as throughout this module: hardening is a speed bump, not a wall. The evaluator\u2019s question is never "is it bypassable?" (everything client-side is, in principle) but "how much cost did it add — to the attacker, to the tester, and to the legitimate user?"'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'R8 and ProGuard'
          },
          {
            type: 'p',
            text:
              'R8 is the default Android compiler pipeline for release builds and performs the three jobs ProGuard was known for: shrinking (removes provably unreachable code — "tree shaking"), optimization (inlining, dead-code elimination), and obfuscation (renames classes, methods, and fields to short names like a.b.c). Keep rules preserve whatever the platform must find by name: manifest-declared components, JNI callbacks, serialized models. The rename map (mapping.txt) lives on the developer side to de-obfuscate crash stacks — if it ever ships inside the APK, it is a gift to the analyst.'
          },
          {
            type: 'h',
            text: 'Beyond renaming'
          },
          {
            type: 'p',
            text:
              'Stronger tooling goes further: string encryption (literals decrypted at runtime), resource obfuscation (res file names and paths shuffled), control-flow obfuscation, and packing — the original DEX is encrypted and a small loader unpacks it at runtime, so static tools see only the loader. Commercial protectors bundle several of these with anti-tamper and anti-debug hooks.'
          },
          {
            type: 'table',
            headers: ['Defense', 'What changes for the analyst', 'What still works'],
            rows: [
              ['R8 renaming', 'Identifiers gone; data flow harder to follow', 'Manifest, entry-point names, framework API calls, resources, all dynamic analysis'],
              ['String encryption', 'grep-for-secrets stops working', 'Decrypted strings appear in memory and on the wire at runtime'],
              ['Resource obfuscation', 'Resource names become meaningless', 'Resource contents and app behavior unchanged'],
              ['Packing', 'jadx shows only a loader stub', 'Runtime dumping, behavioral and traffic analysis (technique in m12)']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Hardening reshapes your workflow rather than ending it. Triage is unaffected: the manifest, components, permissions, and network config are not obfuscated. Static reading gets slower — budget for it and lean on dynamic analysis as the primary lens. And obfuscation itself is a reportable observation: its absence in a high-value app is a code-quality gap (MASVS-CODE/RESILIENCE territory), while its presence tells you the developers thought about this attack surface.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes named a.a.a and methods like b() — R8 ran here',
              'Heavy reflection and dynamic Class.forName loading (an obfuscation side effect and an analysis obstacle)',
              'A tiny classes.dex plus large encrypted assets or an unusual loader library — packer fingerprints',
              'mapping.txt accidentally shipped inside the APK — the rename map handed to you'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Evaluation, not defeat',
            text:
              'Assessing resilience features is legitimate work on authorized engagements and training apps. Circumventing protections on software you have no permission to test is a legal risk regardless of intent.'
          },
          {
            type: 'p',
            text:
              'The cleanest evaluation needs no bypass at all: build the same app twice. Ship a debug build and a minified release of your own project and compare what static analysis can see.'
          },
          {
            type: 'terminal',
            title: 'Comparing readable and hardened builds',
            lines: [
              '$ jadx -d out-debug app-debug.apk',
              '$ jadx -d out-release app-release.apk',
              '$ ls out-release/sources',
              'a   b   c   android   androidx   com   kotlin',
              '$ grep -R "getSharedPreferences" out-debug/sources | wc -l',
              '14',
              '$ grep -R "getSharedPreferences" out-release/sources | wc -l',
              '9'
            ]
          },
          {
            type: 'p',
            text:
              'The release build still shows the framework API calls — behavior leaks through renaming. That is the evaluation point: static reading got slower, nothing got impossible, and dynamic analysis (m12) does not care about names at all.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The OWASP UnCrackable crackmes escalate deliberately: the first level decompiles comfortably, later levels add obfuscation and native checks. The evaluation method stays constant across levels: enumerate what the app checks, where it checks it, and whether any of it changes the actual risk — an exercise in reading defenses, not merely defeating them.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['JADX', 'See how far decompilation gets you on a hardened build'],
              ['apktool', 'Resources and Smali when Java output degrades'],
              ['R8 (build side)', 'Produce hardened builds of your own apps for comparison'],
              ['Ghidra / radare2', 'Native libraries — where logic can hide from DEX tooling']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Equating obfuscation with security — renamed code has identical behavior and identical bugs',
              'Giving up when decompiled output looks hostile; dynamic analysis and framework calls still tell the story',
              'Reading packers as malware — legitimate apps and malware both use them; context and behavior decide',
              'Trusting degraded decompilation — verify findings against Smali or runtime behavior'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In a sample Android Studio project, enable minifyEnabled and shrinkResources, build a release APK, and open both builds in JADX. Count how many of your own class names survive and find the keep-rule reason for each survivor. You have just evaluated an obfuscation defense from first principles.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'R8 = shrink + optimize + rename; keep rules preserve platform-visible entry points',
              'String encryption and packing move secrets and code out of static view, not out of reach',
              'Manifest, entry points, framework calls, and behavior survive every renaming scheme',
              'Hardening is a cost-raiser; your job is measuring the cost, on authorized targets'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm13-l01-q1',
          type: 'mcq',
          prompt: 'Which R8 job renames classes and methods to a.b.c-style names?',
          options: ['Shrinking', 'Optimization', 'Obfuscation', 'Desugaring'],
          answerIndex: 2,
          hint: 'The one that changes names, not behavior.',
          explanation:
            'Obfuscation is the renaming pass. Shrinking removes unreachable code and optimization rewrites for size and speed; none of them change what the app does.'
        },
        {
          id: 'm13-l01-q2',
          type: 'truefalse',
          prompt: 'Obfuscation is an effective defense against dynamic analysis.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Does instrumentation care what a method is called?',
          explanation:
            'Dynamic analysis observes runtime behavior — API calls, traffic, files, memory — none of which depend on identifier names. Renaming raises the cost of static reading only, which is why hardening stacks multiple techniques.'
        },
        {
          id: 'm13-l01-q3',
          type: 'short',
          prompt: 'Name two things in an APK that R8 renaming does not hide.',
          modelAnswer:
            'The manifest structure and the names of manifest-declared components (entry points), resource contents, references to framework APIs, and native libraries. All remain readable and meaningful.',
          hint: 'What does the platform itself need to look up by name?',
          explanation:
            'Keep rules preserve every name the platform resolves (components, JNI), and native code lives outside DEX entirely. Analysts anchor on these survivors.'
        },
        {
          id: 'm13-l01-q4',
          type: 'mcq',
          prompt: 'A mapping.txt file is found inside a shipped APK. What is it?',
          options: [
            'A network security config',
            'The R8 rename map, restoring original names to obfuscated symbols',
            'An encryption key for assets',
            'A ProGuard keep-rules file'
          ],
          answerIndex: 1,
          hint: 'Developers use it to read their own crash stacks.',
          explanation:
            'mapping.txt maps obfuscated names back to originals for stack-trace de-obfuscation. Shipping it undoes most of the renaming work — a low-effort, high-value static-analysis find.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Shrink, obfuscate, and optimize your app (R8)',
          url: 'https://developer.android.com/build/shrink-code',
          note: 'Official R8 documentation: shrinking, optimization, obfuscation, keep rules.'
        },
        {
          title: 'OWASP MASTG — Testing Resiliency Against Reverse Engineering',
          url: 'https://mas.owasp.org/MASTG/Android/0x05j-Testing-Resiliency-Against-Reverse-Engineering/',
          note: 'The reference methodology for evaluating anti-analysis defenses.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The MASVS-RESILIENCE and MASVS-CODE domains this lesson maps to.'
        }
      ]
    },
    {
      id: 'm13-l02',
      moduleId: 'm13',
      title: 'Detection Defenses: Root, Emulator, Debugger, Frida',
      difficulty: 'Advanced',
      minutes: 30,
      prerequisites: ['m13-l01'],
      objectives: [
        'Describe how each detection category is typically implemented',
        'Evaluate detection defenses: coverage, false positives, and server-side pairing',
        'Explain why client-side detection alone is not a security boundary'
      ],
      diagram: 'frida-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The next hardening layer tries to refuse hostile contexts entirely: a rooted device, an emulator, an attached debugger, an instrumented process. Apps check for telltale signs and then degrade, warn, or refuse to run.'
          },
          {
            type: 'p',
            text:
              'Dual frame, as throughout this module. Developers build these checks to protect users on compromised devices and to slow analysis. Authorized testers evaluate them: what exactly is checked, how well, what it costs in false positives, and whether anything server-side stands behind it. Bypass technique — how such checks are evaluated hands-on — is deliberately out of scope here and lives in module 12.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'frida-flow',
            caption: 'Instrumentation creates observable artifacts — ports, threads, mapped libraries — which is precisely what detection tries to spot.'
          },
          {
            type: 'p',
            text: 'Detection categories and their typical implementations:'
          },
          {
            type: 'table',
            headers: ['Category', 'Typical signals checked'],
            rows: [
              ['Root', 'su binaries and su-like paths under /system, Magisk artifacts and mounts, ro.build.tags=test-keys, writable /system, busybox presence'],
              ['Emulator', 'ro.kernel.qemu and qemu/goldfish/ranchu properties, generic fingerprints (sdk_gphone), static sensors, emulator-default IMEI and phone numbers, absent telephony'],
              ['Debugger', 'Debug.isDebuggerConnected(), ro.debuggable, JDWP threads, TracerPid != 0 in /proc/self/status (anti-ptrace loops)'],
              ['Frida / instrumentation', 'Listening ports 27042/27043, frida-server process names, frida-agent and gum libraries in /proc/self/maps, gmain/gdbus thread names, named pipes used by host tooling']
            ]
          },
          {
            type: 'p',
            text:
              'Implementation quality varies enormously: from a single naive File("/su").exists() check in Java to layered native loops with obfuscated indicators. And every check trades false positives against coverage — some OEM devices ship odd properties; virtualized test farms look like emulators by design. A defense that blocks legitimate users is a business bug as real as a missing check.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Your evaluation deliverable answers four questions. (1) Coverage — which signals and categories does the app check, and which current tooling does it miss? (2) Quality — where do checks run (Java vs native), how obfuscated are the indicators, how easily do they break? (3) Cost — what does the defense actually raise: minutes or days? (4) Server pairing — does the backend refuse sensitive operations when the client reports a hostile environment, or is detection purely local theater? The fourth question usually decides whether the defense means anything at all.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Strings and resources like "Root detected", "su", "emulator", "frida" in code and assets',
              'Native .so libraries containing check routines (the serious implementations live there)',
              'Behavior differences across your environments: stock device, rooted device, emulator, instrumented run',
              'Server responses that change when the client reports integrity state'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized evaluation only',
            text:
              'Probing or bypassing tamper protections outside a written authorization can violate computer-misuse and copyright law regardless of motive. Everything below inventories behavior on your own devices and licensed training apps.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Enumerate what your environments expose: adb shell getprop for emulator and build tags, which su for root artifacts, /proc/self/status for TracerPid',
              'Statically map which of those signals the target references (decompiled strings, native strings)',
              'Run the app in each environment and record exactly what it refuses — dialogs, disabled features, server rejections',
              'Score the defense: coverage, implementation depth, false-positive exposure, and whether the server pairs with the client at all'
            ]
          },
          {
            type: 'terminal',
            title: 'Inventorying your own test environments',
            lines: [
              '$ adb shell getprop ro.kernel.qemu; adb shell getprop ro.build.tags',
              '1',
              'release-keys',
              '$ adb shell which su || echo "no su binary"',
              'no su binary',
              '$ adb shell cat /proc/self/status | grep TracerPid',
              'TracerPid:\t0'
            ]
          },
          {
            type: 'p',
            text:
              'The same commands run on your rooted device or instrumented training app produce the nonzero signals detection code looks for — the matching exercise between environment facts and app checks is the evaluation. When you are ready to see how checks behave under instrumentation, that technique is module 12\u2019s territory; the concept here stays fixed: hiding an indicator is an arms race the defender only wins on the server side.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'OWASP UnCrackable-Level1 is a miniature of this whole lesson: launch it on a rooted emulator and a "Root detected!" dialog closes the app. The evaluation questions are already complete: which signals trigger it, would a modern Magisk Denylist setup evade it, does anything server-side depend on it, and what cost does it add — for a training app, minutes; for a hardened banking app, hopefully days.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb (getprop, which, /proc reads) — enumerate environment facts',
              'JADX and Ghidra — find which facts the app checks, in DEX and native code',
              'Magisk — create a modern rooted environment for behavior testing',
              'Frida — the instrumentation whose artifacts and handling are covered in module 12'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating client-side detection as a security boundary — the attacker controls the client; only server-side pairing decides outcomes',
              'Equating "a bypass exists" with "the defense is worthless" — defenses are cost-raisers; measure the cost',
              'Testing only your clean emulator and declaring false positives unlikely — try real OEM devices',
              'Reporting a bypass as critical severity without tying it to a business impact'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your emulator: run the getprop/which/TracerPid inventory, then search the decompiled sources of a training app for those same signals. Write a one-page evaluation: what it checks, what it misses, and whether you would recommend server-side pairing. You have produced the core deliverable of a resilience review.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Detection categories: root, emulator, debugger, instrumentation — each with well-known signals',
              'Quality ranges from naive Java checks to layered native routines',
              'False positives are the hidden cost of detection defenses',
              'Client-side detection without server-side enforcement is theater'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm13-l02-q1',
          type: 'mcq',
          prompt: 'Which artifact reveals that a debugger is attached via ptrace?',
          options: [
            'ro.debuggable=0',
            'TracerPid in /proc/self/status',
            'The JDWP port number in build.prop',
            'getprop ro.kernel.qemu'
          ],
          answerIndex: 1,
          hint: 'One line of /proc/self/status names the tracer.',
          explanation:
            'TracerPid is nonzero while a process is traced — the classic anti-debug loop reads it periodically and reacts. ro.debuggable is a build property: it describes the image, not the current attachment state.'
        },
        {
          id: 'm13-l02-q2',
          type: 'mcq',
          prompt: 'Which of these is a typical emulator indicator?',
          options: [
            'ro.build.tags=release-keys',
            'TracerPid: 0',
            'ro.kernel.qemu=1',
            'A valid IMEI from the modem'
          ],
          answerIndex: 2,
          hint: 'Emulators are QEMU underneath.',
          explanation:
            'ro.kernel.qemu=1 and the goldfish/ranchu/generic fingerprints betray the emulator. release-keys and TracerPid 0 are the "clean" values, and real modems supply real IMEIs.'
        },
        {
          id: 'm13-l02-q3',
          type: 'truefalse',
          prompt: 'A root-detection check that closes the app constitutes a complete defense against tampering on rooted devices.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where does the check run, and who controls that environment?',
          explanation:
            'The check runs on the attacker\u2019s device, inside a process they can observe and modify (m12 covers the how). Its realistic value is raising effort and signaling risk posture — the decisive enforcement must be server-side.'
        },
        {
          id: 'm13-l02-q4',
          type: 'scenario',
          prompt: 'A client asks: "Is our root detection good enough?" Sketch the structure of a professional answer.',
          modelAnswer:
            'Cover four axes with evidence: coverage (which signals/categories it checks and which current tooling slips past), implementation depth (Java vs native, obfuscation of indicators), false-positive exposure (OEM quirks, enterprise device management that looks rooted), and server pairing (does the backend restrict sensitive operations when the client reports a rooted environment). Close with cost reasoning: what the defense raises against a realistic attacker, and where the residual risk sits.',
          hint: 'Good enough for whom, against what, and enforced where?',
          explanation:
            'Resilience evaluation is risk assessment, not a binary verdict. The server-pairing question typically dominates: detection without server-side consequence only inconveniences the honest.'
        }
      ],
      references: [
        {
          title: 'Frida — Dynamic instrumentation toolkit',
          url: 'https://frida.re/',
          note: 'The instrumentation whose artifacts detection routines look for; technique in m12.'
        },
        {
          title: 'OWASP MASTG — Testing Resiliency Against Reverse Engineering',
          url: 'https://mas.owasp.org/MASTG/Android/0x05j-Testing-Resiliency-Against-Reverse-Engineering/',
          note: 'Reference tests for root, emulator, debugger, and hooking detection.'
        },
        {
          title: 'Magisk',
          url: 'https://github.com/topjohnwu/Magisk',
          note: 'The modern rooting toolkit — the environment many checks try to spot.'
        }
      ]
    },
    {
      id: 'm13-l03',
      moduleId: 'm13',
      title: 'Tampering and Integrity Defenses',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['m13-l02'],
      objectives: [
        'Describe signature checks, re-pack detection, and Play Integrity at a design level',
        'Explain the attestation pattern and why decisions must move server-side',
        'Evaluate integrity trade-offs, including devices without Play services'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Environment detection asks "where is my code running?". Integrity defenses ask "has my code been changed?" — re-signed builds, patched classes, unofficial distributions. The toolbox: local signature comparisons, re-pack detection against checksums, and platform attestation anchored outside the device.'
          },
          {
            type: 'p',
            text:
              'One principle repeats through all of it: anything decided purely on-device is decided in the attacker\u2019s territory. The designs that hold are the ones that move the decision somewhere the attacker does not control.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Local signature checks'
          },
          {
            type: 'p',
            text:
              'The app reads its own signing certificate at runtime (PackageManager, GET_SIGNATURES / GET_SIGNING_CERTIFICATES) and compares the hash against an embedded expected value. A re-signed or forked build mismatches and can refuse to start. Design limitation: the expected hash and the comparison live in the same binary the attacker can patch — instrumentation (m12) can neutralize the check without ever touching the signature.'
          },
          {
            type: 'h',
            text: 'Re-pack detection'
          },
          {
            type: 'p',
            text:
              'Variants on the same theme: checksum the dex files and APK entries at runtime against constants, verify the zip structure, spot added or missing classes. This raises the effort of casual rebuilding — and the same local-trust limitation applies, because the expected values ship inside the package being checked.'
          },
          {
            type: 'h',
            text: 'Play Integrity API'
          },
          {
            type: 'p',
            text:
              'The platform-anchored option: the app requests an integrity verdict from Google Play, which attests — in a signed response the app cannot forge — that the binary is the genuine Play-distributed package with the expected signing key, running on a device passing integrity checks, plus licensing state. The verdict is only useful if the app\u2019s server receives and validates it before serving sensitive operations.'
          },
          {
            type: 'h',
            text: 'Server-side attestation'
          },
          {
            type: 'p',
            text:
              'The durable pattern: sensitive requests require proof (an integrity verdict, hardware key attestation) that the server independently validates; failures get risk-based treatment. Hardware-backed key attestation extends the same idea to cryptographic keys: Keystore keys that certify their own environment.'
          },
          {
            type: 'table',
            headers: ['Defense', 'Decision anchored where', 'Realistic strength'],
            rows: [
              ['Local signature check', 'On-device', 'Low — neutralized by instrumentation without touching the signature'],
              ['Re-pack / dex checksums', 'On-device', 'Low-medium — raises casual-rebuild cost, same trust problem'],
              ['Play Integrity verdict, validated by the server', 'Google Play infrastructure', 'High, where Play services exist and the server actually enforces'],
              ['Key attestation + server validation', 'Device secure hardware + server', 'High for key and device binding']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Evaluation questions mirror the design: where is the decision made (client or server), what does the server do when integrity fails (reject, log, ignore), what happens on devices without Play services (GMS-free hardware, some regions and emulators — Play Integrity is simply unavailable), and is the verdict checked before or after the sensitive operation? Client-only checks get a "raises casual cost" rating with an explicit recommendation to anchor decisions server-side; the severity of the gap follows the value of what the check protects.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'getPackageInfo calls with GET_SIGNATURES / GET_SIGNING_CERTIFICATES and hash comparisons',
              'Constants that look like dex CRCs or SHA-256 hashes compared at startup',
              'Play Integrity (or SafetyNet-era) client calls and where verdicts are sent',
              'Server endpoints that behave differently for modified or unsigned clients'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Re-signing is a licensed activity',
            text:
              'Re-signing or redistributing software you are not licensed to modify is illegal independent of security intent. Practice the evaluation flow on apps you built, or on training apps published for modification.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Read the implementation: which checks exist, where their constants live, which run in native code',
              'Identify the server contract: what integrity evidence accompanies sensitive requests, and who validates it',
              'On authorized builds, observe behavior differences (normal vs modified build if licensing permits) and server responses',
              'Report decision location and enforcement gaps, each tied to the business value it protects'
            ]
          },
          {
            type: 'terminal',
            title: 'Reading the signing identity of a training build',
            lines: [
              '$ apksigner verify --print-certs training-release.apk',
              'Signer #1 certificate DN: CN=Training,O=Academy',
              'Signer #1 certificate SHA-256 digest: 8f3a...c1',
              'Verified using v2 scheme: true'
            ]
          },
          {
            type: 'p',
            text:
              'The SHA-256 the app embeds and compares is exactly this digest. The evaluation question is not whether the comparison exists — it is what happens when it fails, and who besides the app ever knows.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app refuses to start when re-signed: the local check works exactly as designed. The finding writes itself in this lesson\u2019s vocabulary: "Client-side signature verification only; no integrity evidence reaches the server, so patched builds (instrumentation per m12) bypass the check without re-signing. Recommendation: require server-validated Play Integrity verdicts for the flows this check protects." Cost raised: minutes for a skilled attacker. The honest framing: the check deters casual copying, not tampering.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'apksigner / keytool — inspect signing identities',
              'Play Integrity API documentation — the attestation contract to evaluate against',
              'JADX — locate checks and their embedded constants',
              'AOSP signing documentation — anchor your review in the official model'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Calling a client-only integrity check unbreakable — instrumentation exists (m12), and the constants live in the binary',
              'Assuming the Play Integrity SDK being called means verdicts are validated — only the server\u2019s validation enforces anything',
              'Ignoring GMS-less devices where Play Integrity cannot answer at all',
              'Rating a missing check critical when the protected feature has no server-side value to steal'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On paper, sketch the Play Integrity flow: app requests verdict, Play returns a signed response, app forwards it, server validates and enforces. Mark the two points where an attacker without Google\u2019s keys is stuck, and the one point where a purely client-side shortcut could still exist. That diagram is the whole design review in one picture.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Signature checks and re-pack detection are local decisions — they raise cost, they decide nothing',
              'Play Integrity anchors the decision outside the device, but only server validation enforces it',
              'Plan for devices without Play services; attestation needs a fallback story',
              'Evaluate integrity like every resilience defense: decision location, enforcement, false negatives, business value'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm13-l03-q1',
          type: 'mcq',
          prompt: 'Where must a Play Integrity verdict be validated for it to mean anything?',
          options: [
            'In the app, before launch',
            'On the app\u2019s server, before serving the sensitive operation',
            'On the device\u2019s TEE',
            'Nowhere — Play validates it automatically'
          ],
          answerIndex: 1,
          hint: 'The verdict is a signed statement — someone must check the signature and act.',
          explanation:
            'Play issues the signed verdict; the app relays it; only the server\u2019s validation and enforcement create a consequence an attacker cannot remove locally. A verdict nobody validates is decoration.'
        },
        {
          id: 'm13-l03-q2',
          type: 'truefalse',
          prompt: 'A signature check executed only on the client reliably stops a skilled tamperer.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where do the expected hash and the comparison code live?',
          explanation:
            'Both live in the binary being protected. Instrumentation (m12 technique) neutralizes the comparison without re-signing anything. Client-only checks raise casual cost — the decision must also exist server-side.'
        },
        {
          id: 'm13-l03-q3',
          type: 'short',
          prompt: 'Name two things a re-pack detection routine might checksum at runtime.',
          modelAnswer:
            'The bytes (or CRCs) of classes.dex and other APK entries, the signing certificate hash, the zip entry list/structure, or counts of expected classes. Any runtime-visible property of the original package can anchor a comparison.',
          hint: 'What did rebuilding the APK change?',
          explanation:
            'Repacking alters dex bytes, entry CRCs, and the signing key — all runtime-observable. The catch is that the expected values ship inside the same package, which is why these checks pair best with server-anchored attestation.'
        },
        {
          id: 'm13-l03-q4',
          type: 'scenario',
          prompt:
            'A banking app protects its transfer screen with a client-side signature check only. Draft the core of the finding: what it is, why it is weak, and the remediation.',
          modelAnswer:
            'Finding: integrity of the transfer flow is enforced only by an on-device signature comparison. Weakness: the expected certificate hash and comparison live in the same binary an attacker can patch or instrument (m12 technique), bypassing the check without re-signing; no integrity evidence reaches the server. Remediation: require a server-validated Play Integrity verdict (with a defined fallback for devices without Play services) before accepting transfer requests, keeping the local check only as a UX-level deterrent. Severity follows the value of transfers and the existence of any server-side controls.',
          hint: 'Ask where the decision happens today, and where it should happen.',
          explanation:
            'The pattern "local check + no server enforcement" is the classic integrity gap. The remediation always moves the decision to infrastructure the attacker cannot patch.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Play Integrity API',
          url: 'https://developer.android.com/google/play/integrity',
          note: 'Official documentation of the attestation flow and verdicts.'
        },
        {
          title: 'Android Developers — apksigner',
          url: 'https://developer.android.com/studio/command-line/apksigner',
          note: 'Official tool for inspecting APK signing identities.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'MASVS-RESILIENCE covers anti-tamper requirements this lesson evaluates.'
        }
      ]
    }
  ]
};
