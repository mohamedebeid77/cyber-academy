import type { Module } from '../../types';

// LEVEL 3 — STATIC ANALYSIS · Module 04: Static Analysis
// Original curriculum content synthesized from public official documentation:
// developer.android.com, mas.owasp.org, and the official repositories of
// JADX and Apktool. All prose is original; reference links point to the
// official sources used for study.

export const m04: Module = {
  id: 'm04',
  title: 'Static Analysis',
  level: 3,
  description:
    'Read the app without running it: pull APKs from devices you are authorized to test, decompile them with JADX, decode and rebuild them with apktool, hunt hardcoded secrets with systematic grep patterns, audit exported components, flag unsafe WebViews and deep links, and spot crypto and storage mistakes in code. Every static claim you form here becomes a dynamic test in module 05.',
  outcomes: [
    'Acquire an APK from an authorized device or from your own build outputs and triage it into a test plan',
    'Drive the JADX GUI and CLI fluently, including search, deobfuscation awareness, and Gradle export',
    'Complete a full apktool decode, edit, rebuild, and re-sign round trip on a training app',
    'Hunt hardcoded secrets with reproducible grep/ripgrep patterns and judge true positives',
    'Audit exported components, WebViews, and deep links statically before touching the device',
    'Recognize crypto and storage anti-patterns in decompiled code and plan runtime verification'
  ],
  checklist: [
    {
      item: 'JADX (GUI + CLI)',
      why: 'The decompiler for every code-reading exercise in this module; installed in module 02.'
    },
    {
      item: 'apktool',
      why: 'Decodes resources and Smali, rebuilds modified packages for tamper testing.'
    },
    {
      item: 'build-tools (apksigner, zipalign, keytool)',
      why: 'Re-signing rebuilt APKs is mandatory before any modified package installs.'
    },
    {
      item: 'MobSF',
      why: 'Automated first-pass static analysis to seed your manual hypothesis list.'
    },
    {
      item: 'ripgrep (rg)',
      why: 'Fast, regex-capable searching across large decompiled source trees.'
    },
    {
      item: 'Training APK pulled and inventoried',
      why: 'Module 03 left you with an inventoried APK of a MASTG crackme or DIVA — that is the target here.'
    }
  ],
  lessons: [
    {
      id: 'm04-l01',
      moduleId: 'm04',
      title: 'Getting the APK and First Triage',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m01-l08', 'm03-l01'],
      objectives: [
        'Extract an APK from a device you are authorized to test and from your own build outputs',
        'Run a structured triage: manifest flags, string sweep, and one automated MobSF pass',
        'Turn triage output into a ranked hypothesis list that drives the rest of the module'
      ],
      diagram: 'static-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'You cannot analyze what you do not hold. The first concrete deliverable of any Android assessment is the package itself plus a written triage of it. This lesson closes the loop from device to desk: pull the APK off a device you are authorized to test (or collect it from your own build outputs), run a fast structured triage, and convert what you see into hypotheses worth chasing with JADX and apktool.'
          },
          {
            type: 'p',
            text:
              'Triage is deliberately shallow. You are not auditing code yet — you are deciding where the next hours should go. Shallow and complete beats deep and narrow.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'static-workflow',
            caption: 'The static-analysis loop this module teaches: acquire, triage, decompile, audit, verify.'
          },
          {
            type: 'h',
            text: 'Where APKs come from'
          },
          {
            type: 'list',
            items: [
              'The device (authorized targets): adb shell pm path prints the on-device location(s); adb pull copies them. App bundles install as several split APKs — pull all of them',
              'Your own builds: app/build/outputs/apk/debug (or release) in any Android Studio project — useful because you control the manifest flags and can compare debug versus release behavior',
              'Provided by the client: request the exact build under test plus the complete split set, and hash everything you receive'
            ]
          },
          {
            type: 'h',
            text: 'The triage sequence'
          },
          {
            type: 'list',
            items: [
              'Identity: aapt2 dump badging — package, versionName, minSdk/targetSdk, ABI list (m03-l01 groundwork)',
              'Manifest flags: debuggable, allowBackup, networkSecurityConfig, usesCleartextTraffic (m03-l02)',
              'Layout sweep: unzip -l — DEX count, assets, lib ABIs, signature files',
              'String sweep: case-insensitive grep over res/values, assets, and decompiled sources for key/secret/token/http',
              'One automated pass: upload the APK to MobSF and read its report as a checklist, not as truth',
              'Write the hypothesis list: five to ten specific, testable claims'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Triage is where methodology pays: the flags and strings you note here become the exported-component audit (m04-l05), the WebView and deep-link review (m04-l06), and the dynamic verifications of module 05. MobSF produces a baseline quickly and catches what you skimmed — but every automated finding is a lead until you confirm it in code or at runtime. The hypothesis list is the artifact that keeps a multi-day assessment honest: it records what you believed when, so later evidence can confirm or kill each claim.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:debuggable or android:allowBackup true — confirm the build type before calling it a release finding',
              'minSdkVersion low enough that legacy behaviors (implicit exported components, cleartext defaults) still apply',
              'ABI set versus your test devices — an arm64-v8a-only app will not run on an x86_64 emulator (m03-l04)',
              'Assets and res/values that grep flags: endpoints, key-shaped strings, embedded databases',
              'VersionName/versionCode mismatches between what you were given and what the device reports as installed'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Extraction is scoped too',
            text:
              'Pulling an APK off a device is read-only, but it only ever happens against devices and apps you are authorized to test: your own lab devices, your own builds, or engagement targets in written scope. Never extract packages from a device you do not control.'
          },
          {
            type: 'terminal',
            title: 'Acquiring an APK from an authorized device',
            lines: [
              '$ adb shell pm path com.example.training',
              'package:/data/app/~~x1/base.apk',
              'package:/data/app/~~x1/split_config.arm64_v8a.apk',
              '$ adb pull /data/app/~~x1/base.apk target-base.apk',
              '$ adb pull /data/app/~~x1/split_config.arm64_v8a.apk target-abi.apk',
              '$ aapt2 dump badging target-base.apk | head -5',
              '$ unzip -l target-base.apk | wc -l'
            ]
          },
          {
            type: 'p',
            text:
              'For your own builds, skip the device: the APK is already at app/build/outputs/apk/<variant>/app-<variant>.apk. Compare its manifest (aapt2 dump xmltree) against the release triage to see exactly which flags debug builds add — that diff trains your eye for what a release build should never contain.'
          },
          {
            type: 'p',
            text:
              'Then run one MobSF pass (docker or your local install), export its PDF or JSON report, and reconcile: mark each automated finding as confirmed (you saw it in code), plausible (worth a manual look), or false positive (explain why). The reconcile step is the skill — scanners find strings, analysts find meaning.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Pull the OWASP MASTG UnCrackable-Level1 crackme from your emulator and triage it. A typical hypothesis list after ten minutes: (1) the secret is checked inside DEX code reachable from one activity; (2) the app detects root or debugging and reacts to it; (3) no assets or native libraries are in play, so the check is pure bytecode. Each hypothesis maps to a tool in the coming lessons — decompile to confirm (m04-l02), trace the check (m04-l02), and verify at runtime (module 05).'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in triage'],
            rows: [
              ['adb pull', 'Copy installed APKs (all splits) off authorized devices'],
              ['aapt2', 'badging and xmltree dumps without decompiling anything'],
              ['MobSF', 'Automated static baseline: manifest flags, hardcoded strings, surface inventory'],
              ['unzip / ripgrep', 'Layout inventory and first string sweeps across res, assets, and sources']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Pulling only base.apk from a split install and analyzing a fraction of the app',
              'Flagging debuggable/allowBackup on what turns out to be a debug build — confirm the variant first',
              'Reading MobSF output as a findings list instead of a lead list; scanners misjudge context constantly',
              'Diving into decompilation with no plan — no hypothesis list means unfocused reading and missed findings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full loop once: acquire a crackme from your emulator, run badging and the manifest dump, do the string sweep, complete one MobSF pass, and write a hypothesis list of at least five items ranked by expected effort and payoff. Keep this file — module 05 will ask you to prove or disprove each item dynamically.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Acquisition first, always: device (pm path + pull, all splits), your own outputs, or the client package',
              'Triage is shallow-and-complete: identity, flags, layout, strings, one automated pass',
              'MobSF output is a lead list; your code reading decides what it means',
              'The hypothesis list is the deliverable that turns triage into a plan'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l01-q1',
          type: 'mcq',
          prompt: 'An app was installed as a split bundle. Which acquisition step is correct?',
          options: [
            'Pull base.apk only; splits only contain translations',
            'Pull every split (base plus config splits) and analyze them as one logical app',
            'Rebuild the app from source instead',
            'Analyze whichever split is largest'
          ],
          answerIndex: 1,
          hint: 'Module 03 covered what config.<abi> splits contain.',
          explanation:
            'App bundles install as base plus configuration splits (ABI, density, language). Static analysis must collect and inventory all of them — analyzing base.apk alone misses native libraries and resources.'
        },
        {
          id: 'm04-l01-q2',
          type: 'truefalse',
          prompt: 'A MobSF report flagging a hardcoded string is sufficient evidence for a report finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does a scanner know about context?',
          explanation:
            'Automated findings are leads. Strings must be confirmed in code or at runtime with context (is the value actually used? is it a real secret or a sample?) before they become report-grade findings.'
        },
        {
          id: 'm04-l01-q3',
          type: 'short',
          prompt: 'Name the two adb commands that extract an installed APK from an authorized device.',
          modelAnswer:
            'adb shell pm path <package> prints the on-device APK location(s), then adb pull <path> copies the file(s) to the workstation.',
          hint: 'One locates, one copies.',
          explanation:
            'pm path resolves where PackageManager stored the base and split APKs; adb pull transfers them. This is the standard acquisition pair for authorized devices.'
        },
        {
          id: 'm04-l01-q4',
          type: 'scenario',
          prompt:
            'Your triage of a release APK shows android:allowBackup="true" and an assets/tokens.json file. Write two entries for your hypothesis list.',
          modelAnswer:
            'H1: the app private data (including any tokens in prefs or databases) is extractable via backup mechanisms — verify dynamically against the flag and the storage locations (module 05). H2: assets/tokens.json contains usable secrets — confirm in code whether the file is read and what the values unlock, and judge whether they are real or sample data (m04-l04).',
          hint: 'One hypothesis per artifact, each with a test that would prove it.',
          explanation:
            'Good hypotheses pair an artifact with a concrete verification step and the lesson/tool that performs it. That structure is what keeps the list useful across the whole assessment.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Android Debug Bridge (adb)',
          url: 'https://developer.android.com/studio/command-line/adb',
          note: 'Official adb reference for pm path and pull acquisition.'
        },
        {
          title: 'OWASP MASTG — Android Security Testing',
          url: 'https://mas.owasp.org/MASTG/Android/0x05b-Android-Security-Testing/',
          note: 'The getting-started chapter of the mobile testing methodology.'
        }
      ]
    },
    {
      id: 'm04-l02',
      moduleId: 'm04',
      title: 'JADX Workflow',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m04-l01', 'm03-l03'],
      objectives: [
        'Use jadx (CLI) for batch decompilation and jadx-gui for interactive navigation',
        'Search effectively across class names, code text, and resources',
        'Recognize what obfuscation changes and what the decompiler cannot restore',
        'Export a decompiled project to Gradle for grep-friendly analysis'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'JADX turns DEX bytecode back into readable Java — imperfect, but readable enough that you can usually follow logic, find patterns, and trace data flow. The skill is not opening the tool; it is navigating fast: knowing which searches to run, when to trust the reconstruction, and when to drop down to Smali (m03-l03) because the decompiler is guessing.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'CLI and GUI'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'jadx CLI essentials',
            code:
              'jadx -d jadx-out target.apk                 # decompile everything to jadx-out/\njadx --show-bad-code -d out target.apk      # keep methods that failed to decompile\njadx --deobf -d out target.apk              # generate names for obfuscated identifiers\njadx --export-gradle -d out target.apk      # export as a Gradle project (grep-friendly tree)\njadx-gui target.apk                         # the interactive way to work'
          },
          {
            type: 'p',
            text:
              'In jadx-gui, the left tree mirrors package structure; the Resource panel exposes the manifest, strings, and assets; clicking a class cross-links usages. Search (Navigation menu) covers class names, code text, and resources as separate scopes — run all three before concluding something is absent. Save your session so annotated work survives tool restarts.'
          },
          {
            type: 'h',
            text: 'Deobfuscation limits'
          },
          {
            type: 'list',
            items: [
              'R8/ProGuard renames classes, methods, and fields (a.b.c, a()) — logic survives, meaning does not; jadx --deobf assigns stable placeholder names to help you read',
              'Obfuscators do not remove strings, resource references, or API calls — those remain your anchors for navigation',
              'Decompiled Java is a reconstruction: control flow may be reorganized and some constructs fail entirely — verify security-critical logic in Smali (m03-l03)',
              'Reflection, dynamic loading (DexClassLoader), and native calls are blind spots of any static decompiler'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The workflow that pays: start from a triage hypothesis (m04-l01), search for the anchor strings or APIs it implies, read the surrounding code, and either confirm the hypothesis or record what you learned. Exporting to a Gradle-shaped tree lets you run ripgrep patterns (m04-l04) across all sources at once — the GUI is for reading, the exported tree is for searching.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes with suspicious names (RootCheck, LicenseValidator) — and their obfuscated twins that only string searches reveal',
              'Endpoints, keys, and config values referenced near network or crypto APIs',
              'Component classes declared in the manifest (activities, services, receivers) and how they handle getIntent() input (m04-l05)',
              'Methods that fail to decompile — treat them as high-interest, not low-interest (m03-l03)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'A repeatable JADX session',
            lines: [
              '$ jadx --deobf --export-gradle -d jadx-out target.apk',
              '$ rg -n -i "license|root|debug" jadx-out/sources | head -20',
              '$ jadx-gui target.apk',
              '# GUI: Class search for "License"; text search for triage strings',
              '# File > Save project to keep your annotations'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Two views, one habit',
            text:
              'Read in the GUI, search in the exported tree. When a method looks security-critical but odd, open its Smali view in the GUI before drawing conclusions.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Open the UnCrackable-Level1 crackme. The UI string about entering a secret is your anchor: text search finds the resource, the resource id maps to the activity class, and the class reveals the comparison logic and any integrity checks around it. Ten minutes of guided navigation — and you have confirmed (or corrected) the first two hypotheses from m04-l01 without running the app once.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['jadx-gui', 'Interactive reading: navigation, cross-links, Smali view, resource panel'],
              ['jadx CLI', 'Batch decompilation, deobfuscated naming, Gradle export for grepping'],
              ['ripgrep', 'Pattern hunting across the exported source tree (m04-l04)'],
              ['MobSF', 'Its code-browser view is JADX-backed — same engine, automated context']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting decompiled Java for security-critical conclusions — decompilers approximate; verify in Smali',
              'Searching only for plaintext identifiers: obfuscated code still contains strings, API names, and resource ids worth searching',
              'Analyzing classes.dex only — multidex apps hide code in classes2.dex and beyond (JADX merges them, but know it did)',
              'Editing code in jadx-gui and expecting the APK to change — the GUI never patches; patching is apktool territory (m04-l03)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Decompile your training app both with and without --deobf and diff the class trees to see what renaming does. Then take one triage hypothesis, find the code that confirms or kills it, and record the class/method name and your conclusion in the hypothesis list. That record-keeping habit is what separates analysis from browsing.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'jadx-gui for reading and cross-linking; jadx CLI for batch output and Gradle export',
              'Run all three searches (class, text, resource) before claiming absence',
              'Obfuscation renames identifiers, not behavior — strings and API calls stay searchable',
              'Decompiled Java is a reconstruction; security-critical logic gets verified in Smali or at runtime'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l02-q1',
          type: 'mcq',
          prompt: 'A class is named a.b.c with methods a() and b(). What does that tell you?',
          options: [
            'The DEX file is corrupted',
            'R8/ProGuard obfuscation was applied; logic is intact but identifiers lost meaning',
            'The app is broken and will not run',
            'JADX failed and you must use Smali everywhere'
          ],
          answerIndex: 1,
          hint: 'Renaming is the point of obfuscation.',
          explanation:
            'Short renamed identifiers are the signature of R8/ProGuard (m03-l01, m03-l03). The bytecode still behaves the same; jadx --deobf assigns readable placeholder names, and strings/API calls remain your navigation anchors.'
        },
        {
          id: 'm04-l02-q2',
          type: 'truefalse',
          prompt: 'If a method shows garbled pseudo-code in jadx-gui, the Smali view is a reliable fallback for exact behavior.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Which representation is a faithful 1:1 view of DEX?',
          explanation:
            'Smali is baksmali\u2019s faithful assembly of the DEX (m03-l03). When decompilation approximates or fails, Smali gives exact registers, invokes, and branches — that is the verification path.'
        },
        {
          id: 'm04-l02-q3',
          type: 'short',
          prompt: 'Why export the decompiled sources as a Gradle project when jadx-gui already shows everything?',
          modelAnswer:
            'The exported tree is plain files on disk, so ripgrep/grep and other CLI tooling can run reproducible pattern sweeps across all sources at once (secrets, APIs, endpoints) — the GUI is for interactive reading, the tree is for systematic searching and evidence collection.',
          hint: 'Think about the m04-l04 workflow.',
          explanation:
            'Batch searching with the exact same patterns on every target is what makes secret hunting and API mapping repeatable and evidence-friendly. The Gradle export exists precisely for that.'
        },
        {
          id: 'm04-l02-q4',
          type: 'scenario',
          prompt:
            'Your hypothesis says the app validates a license against a server. Text search finds no "license" string in code. Give two next steps before declaring the hypothesis dead.',
          modelAnswer:
            'Run the resource and class searches (not just code text) and search for related anchors: URL fragments (api, verify, activate), classes near network APIs, and preferences keys like "activated". If code is obfuscated, the concept may live in renamed classes reachable only via strings or manifest-declared components; if it still cannot be found, note that the check may sit in native code (m03-l04) — downgrade the hypothesis with a note, do not silently drop it.',
          hint: 'Absence in one search index is not absence in the app.',
          explanation:
            'JADX has separate search scopes, obfuscation hides names, and some logic lives outside DEX entirely. Hypotheses are killed with evidence, not with one empty result page.'
        }
      ],
      references: [
        {
          title: 'JADX — official repository',
          url: 'https://github.com/skylot/jadx',
          note: 'Releases, CLI options, and GUI features.'
        },
        {
          title: 'OWASP MASTG — Reverse Engineering with JADX',
          url: 'https://mas.owasp.org/MASTG/Android/0x05c-Reverse-Engineering-with-Jadx/',
          note: 'The decompilation workflow this lesson operationalizes.'
        },
        {
          title: 'Android Developers — Shrink, obfuscate, and optimize your app (R8)',
          url: 'https://developer.android.com/build/shrink-code',
          note: 'What R8 changes in the bytecode you are reading.'
        }
      ]
    },
    {
      id: 'm04-l03',
      moduleId: 'm04',
      title: 'apktool Workflow',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l02', 'm03-l05'],
      objectives: [
        'Decode an APK to editable resources and Smali and rebuild it correctly',
        'Apply a minimal, targeted patch to a training app and prove the behavior change',
        'Diagnose the common rebuild and install failures by their exact error messages'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'JADX answers questions; apktool changes answers. Decode, edit Smali or resources, rebuild, re-sign, install — that loop turns a static observation into a controlled experiment on authorized targets: flip a constant, neutralize a check in your lab, and watch how the app and its defenses react.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The round trip'
          },
          {
            type: 'terminal',
            title: 'decode, edit, build, align, sign, install',
            lines: [
              '$ apktool d target.apk -o target-src',
              '$ edit target-src/smali/com/example/app/Config.smali   # one targeted edit',
              '$ apktool b target-src -o target-patched.apk',
              '$ zipalign -p 4 target-patched.apk target-aligned.apk',
              '$ apksigner sign --ks test.keystore --out target-signed.apk target-aligned.apk',
              '$ apksigner verify --verbose target-signed.apk | head -5',
              '$ adb install -t target-signed.apk'
            ]
          },
          {
            type: 'p',
            text:
              'apktool d decodes resources.arsc and binary XML into text and disassembles DEX into Smali trees (m03-l03). apktool b reassembles and repackages. Because any modification invalidates the signature, the chain ends with your test keystore (m03-l05) and adb install -t. Keep edits minimal: one change per build, so every observed behavior change has exactly one cause.'
          },
          {
            type: 'compare',
            title: 'Minimal Smali patch on a training app (illustrative)',
            beforeTitle: 'Original: mode constant',
            beforeCode:
              'const-string v0, "TRIAL_MODE"\n\ninvoke-static {v0}, Lcom/example/app/Config;->setMode(Ljava/lang/String;)V',
            afterTitle: 'Patched: same registers, new constant',
            afterCode:
              'const-string v0, "FULL_MODE"\n\ninvoke-static {v0}, Lcom/example/app/Config;->setMode(Ljava/lang/String;)V'
          },
          {
            type: 'h',
            text: 'Common failures and what they mean'
          },
          {
            type: 'table',
            headers: ['Symptom', 'Cause', 'Fix'],
            rows: [
              ['apktool b errors on one Smali file', 'Your edit broke register counts or labels (.locals violated, bad branch target)', 'Re-read the m03-l03 rules; keep edits within existing registers'],
              ['Rebuilt APK fails v2 verification', 'zipalign run after signing (or re-aligned after signing)', 'Align first, sign second, never re-align'],
              ['INSTALL_FAILED_UPDATE_INCOMPATIBLE', 'Signature mismatch with the installed original', 'Uninstall the original first (that certificate change is itself a test signal)'],
              ['INSTALL_FAILED_TEST_ONLY', 'Test-package flag missing', 'Install with adb install -t'],
              ['App crashes on resources after rebuild', 'Resource obfuscation / id remapping tripped', 'Patch values, not structure; prefer string-level edits']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The decode-rebuild loop is the backbone of tamper and resilience testing: patch in an instrumentation gadget (module 05), neutralize a client-side check to measure what actually enforces security server-side, or ship a modified build to prove nothing detects the change. Each is a reportable behavior difference — and each is only legitimate on targets you are authorized to modify.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Repackaging is tampering',
            text:
              'Modified, re-signed APKs are a different package than the developer shipped. Repack only training apps or explicitly authorized targets, never redistribute modified packages, and keep the original APK untouched as evidence.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Single const-string or const/4 decisions that gate behavior — the cheapest safe patches',
              'Compare-and-branch pairs over values you control — see the m03-l03 Smali walkthrough',
              'Resource strings referenced by id (R.string.x) — patch the value, not the id',
              'Signature/integrity checks that will fire on your re-signed build — expected behavior to document, not a mistake'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Run the full loop on a training app with a client-side mode or unlock check: decode, make exactly one minimal edit, rebuild, sign, install, and record the before/after behavior. Then compare a build with the app\u2019s integrity check intact versus removed to observe which changes the app notices — that comparison is the raw material of an anti-tamper finding.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Keep a patch log',
            text:
              'For every build record: input APK hash, exact edit (file, line, before/after), output hash, install result, observed behavior. Tamper work without a patch log is not reproducible — and reproducibility is what makes it evidence.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A DIVA-style or crackme app unlocks a feature when a preferences flag holds the right value. Decode, locate the branch (string search on the flag name), flip the constant that seeds the flag, rebuild, sign, install — the feature opens with no valid license key. The finding is not "we patched it"; the finding is that a security decision was fully client-side, which module 05 will verify from the runtime side too.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['apktool d / b', 'Decode resources + Smali, rebuild into a new APK'],
              ['zipalign + apksigner', 'Align, then sign with your test keystore (order matters)'],
              ['keytool', 'Create the test keystore used for all lab re-signing'],
              ['jadx', 'Read decompiled Java to choose the patch point, Smali to apply it']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Making several edits per build — untestable changes; one edit, one build, one observation',
              'Ignoring .locals/registers when patching Smali and corrupting the method (m03-l03 explains why)',
              'Forgetting that a re-signed install is a new identity: uninstall first, and expect signature checks to fire',
              'Patching structurally obfuscated resources and blaming apktool when ids no longer resolve'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete one minimal patch cycle end to end on your training app and produce the three artifacts of the loop: the patch log entry, the apksigner verify output of the rebuilt package, and a before/after behavior screenshot. If anything fails, diagnose it with the failure table above instead of restarting from scratch.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'apktool turns reading into experimentation: decode, edit, build, align, sign, install',
              'One edit per build — behavior changes need a single cause',
              'Signature invalidation is the system working; re-signing is mandatory and detectable',
              'Diagnose failures from their exact messages: register errors, align/sign order, install flags'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l03-q1',
          type: 'mcq',
          prompt: 'What is the correct order for producing an installable modified APK?',
          options: [
            'sign, align, build',
            'build, sign, align',
            'build, align, sign',
            'align, build, sign'
          ],
          answerIndex: 2,
          hint: 'apksigner preserves alignment; re-aligning after signing breaks v2.',
          explanation:
            'apktool b rebuilds, zipalign aligns, apksigner signs last. Aligning after signing can invalidate the v2 signing block — m03-l05 documented the same chain.'
        },
        {
          id: 'm04-l03-q2',
          type: 'truefalse',
          prompt: 'INSTALL_FAILED_UPDATE_INCOMPATIBLE after re-signing means your patch corrupted the manifest.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the platform compare on update?',
          explanation:
            'It means the signature differs from the installed original — the expected result of re-signing with your test keystore. Uninstall the original (or note the certificate-change detection) and install the modified package fresh.'
        },
        {
          id: 'm04-l03-q3',
          type: 'short',
          prompt: 'Why keep exactly one edit per rebuilt APK during tamper testing?',
          modelAnswer:
            'So every observed behavior change has a single identifiable cause. With multiple edits you cannot attribute effects, cannot reproduce the experiment, and cannot defend the evidence in a report.',
          hint: 'Attribution and reproducibility.',
          explanation:
            'Tamper tests are controlled experiments. The patch log (input hash, one edit, output hash, observed behavior) is what turns a modified APK into evidence rather than a curiosity.'
        },
        {
          id: 'm04-l03-q4',
          type: 'scenario',
          prompt:
            'Your patched, re-signed training app installs but exits at launch; the original runs fine. Static review shows a self-signature comparison. What happened and how do you record it?',
          modelAnswer:
            'The app implements an anti-tamper check: it reads its own signing certificate at runtime and refuses to run when it differs from the expected value — your re-sign is the difference. Record it as a positive resilience control (the tamper detection works), capture the logcat evidence, and only treat neutralizing it as a next step if resilience testing is explicitly in scope.',
          hint: 'The app did not crash — it decided not to run.',
          explanation:
            'Refusing a changed certificate is a defense, not a defect. The professional response is documentation of the control working, with the bypass as separately-scoped work.'
        }
      ],
      references: [
        {
          title: 'Apktool — official repository',
          url: 'https://github.com/iBotPeaches/Apktool',
          note: 'Decode/build documentation and known failure modes.'
        },
        {
          title: 'Android Developers — apksigner',
          url: 'https://developer.android.com/studio/command-line/apksigner',
          note: 'Official signing reference for the re-sign step.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Tamper and repackaging techniques — check your MASTG version for the current method.'
        }
      ]
    },
    {
      id: 'm04-l04',
      moduleId: 'm04',
      title: 'Hunting Hardcoded Secrets',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l02', 'm03-l04'],
      objectives: [
        'Describe the categories of secrets that end up inside APKs and where each hides',
        'Run a reproducible ripgrep sweep across decompiled sources, resources, assets, and native libs',
        'Classify matches into true positives, sample/test values, and non-secrets'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Anything shipped in an APK is in the hands of every user. Yet hardcoding remains endemic: API keys, client secrets, tokens, signing material, and infrastructure endpoints go straight into code, resources, assets, and native libraries. Hunting them is pattern work — and judging them is analyst work.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Where secrets live and what they look like'
          },
          {
            type: 'table',
            headers: ['Category', 'Typical shape', 'Favorite hiding spot'],
            rows: [
              ['Cloud API keys', 'AIza… (Google), AKIA… (AWS), provider-prefixed payment keys', 'Constants, BuildConfig fields, strings.xml'],
              ['Tokens / JWTs', 'eyJ… header.payload.signature, Bearer strings', 'Code constants, assets/config files'],
              ['Private keys', '-----BEGIN … PRIVATE KEY-----', 'assets/, res/raw, native strings'],
              ['Endpoints / infrastructure', 'https://internal-…, admin panels, staging hosts', 'Configs, code, comments'],
              ['Encryption material', 'passwords, salts, IVs, key-like 16/32-byte strings', 'Code constants (m04-l07)'],
              ['Encoded payloads', 'base64/hex blobs next to decrypt calls', 'Assets, resources']
            ]
          },
          {
            type: 'h',
            text: 'A repeatable sweep'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'ripgrep patterns for a decompiled + exported tree (jadx-out)',
            code:
              'rg -n -i "(api[_-]?key|apikey|secret|client[_-]?secret|access[_-]?token)" jadx-out/\nrg -n "AIza[0-9A-Za-z_-]{35}" jadx-out/                                # Google API key shape\nrg -n "AKIA[0-9A-Z]{16}" jadx-out/                                     # AWS access key id\nrg -n "eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+" jadx-out/    # JWTs\nrg -n -i "(bearer|authorization)" jadx-out/sources | head -30\nrg -n "https?://[a-zA-Z0-9.-]+" jadx-out/ | sort -u | head -40          # endpoint inventory\nrg -n -i "(password|passwd|pwd)\\s*=\\s*\\\"" jadx-out/\nrg -n -a "BEGIN (RSA |EC )?PRIVATE KEY" target/                         # also inside assets and libs\nrg -n -i "(api|key|token|secret)" target/res/values/strings.xml'
          },
          {
            type: 'p',
            text:
              'Run the same script on every target and archive its output — consistency is what makes results comparable across apps and engagements. Native libraries belong in the sweep too (m03-l04): strings plus these patterns surface material that DEX-only searches never see.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Hardcoded secrets are high-impact findings because they need no exploit path: every user holds the file. But impact depends on judgment — a Google Maps key embedded by design is different from a cloud storage key. Classification is the skill: (1) confirm the value is really used (trace the constant to a call site); (2) decide whether it is a genuine secret or a public identifier/sample; (3) state impact in access terms, not in "secret found" terms.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Do not validate against third parties',
            text:
              'Testing whether a found key works against a live cloud service is active testing of that service — usually out of scope and often illegal. Judge secrets by static context (usage, privileges implied by naming, what they decrypt locally) or inside your own lab, and report suspected-live credentials to the client for rotation.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Constants whose names contradict their content: "debug_key", "test_only", "todo" next to production-looking values',
              'Base64 or hex blobs decoded near Cipher/loadLibrary calls — encoded is not protected',
              'Secrets split across build variants: debug builds frequently carry more than release',
              'Embedded configuration files (JSON/YAML/properties) with credential-shaped fields',
              'The same string appearing in both code and native libraries — cross-layer duplication is a strong signal'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Sweep a training app end to end',
            lines: [
              '$ unzip -q target.apk -d target/',
              '$ jadx --export-gradle -d jadx-out target.apk',
              '$ ./secret-sweep.sh > sweep-results.txt          # the pattern block from this lesson',
              '# classify each unique match: TRUE_POS / SAMPLE / NONSECRET + one-line why',
              '$ strings -a target/lib/arm64-v8a/libnative.so | rg -i "key|secret" | head'
            ]
          },
          {
            type: 'p',
            text:
              'For each candidate, open its code context in jadx-gui: who reads the constant, what API consumes it, what happens when it is wrong. That single read turns a grep hit into either a finding or a note — and produces the evidence snippet for the report either way.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Training apps are built for exactly this: a MASTG crackme may ship an AES key used to decrypt an embedded asset, and DIVA (github.com/payatu/diva) ships credentials in predictable places. The honest version of the exercise: find the key with the sweep, decrypt the asset locally with it, and write the finding as "local data confidentiality depends on a key recoverable by any user of the package" — proven without touching any external service.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['ripgrep (rg)', 'Fast regex sweeps with the exact patterns above, archived per target'],
              ['jadx export', 'The searchable source tree the patterns run against'],
              ['strings / rg -a', 'Binary-safe searching for assets and native libraries'],
              ['git-secrets / gitleaks (concept)', 'The same regex idea applied to repositories — useful when reviewing your own builds']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting every regex hit — sample keys, SDK placeholders, and documentation strings dominate raw matches',
              'Searching only DEX sources and missing res/, assets/, and lib/ (m03-l04 exists for a reason)',
              'Treating encoded (base64/hex) values as either hidden or protected — decoding takes seconds',
              'Validating candidate keys against live third-party services instead of judging statically or in your lab'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Turn this lesson\u2019s pattern block into a committed secret-sweep.sh script, run it on your training app, and produce a classification table: value (masked), location, category, verdict, one-line justification. Keep the script and table as reusable engagement tooling — you will run both again in the reporting workflow of module 08.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Secrets live in code, res, assets, and native libs — sweep all four, identically, every time',
              'Pattern sets are cheap; judgment is the finding: used? real? what does it unlock?',
              'Encoded values are neither hidden nor protected',
              'Never verify candidate secrets against live third-party services — judge statically or in your lab'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l04-q1',
          type: 'mcq',
          prompt: 'Which location is most easily missed by a DEX-only secret sweep?',
          options: [
            'String constants inside classes.dex',
            'Raw credential files under assets/ and strings inside lib/*.so',
            'The AndroidManifest.xml package attribute',
            'Method names in decompiled Java'
          ],
          answerIndex: 1,
          hint: 'Which members never enter the decompiler?',
          explanation:
            'assets/ files and native libraries are not DEX — the decompiler never sees them. The m03-l04 tools (unzip inventory, strings, rg -a) are what cover that layer.'
        },
        {
          id: 'm04-l04-q2',
          type: 'truefalse',
          prompt: 'A base64-encoded string in an asset should be reported as an obfuscated, well-protected secret.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does base64 actually provide?',
          explanation:
            'Base64 is encoding, not encryption — decoding is trivial and requires nothing from the app. Encoded secrets are exactly as exposed as plaintext ones; the report wording changes, the finding does not.'
        },
        {
          id: 'm04-l04-q3',
          type: 'short',
          prompt: 'Give three checks that turn a regex hit into a confident true-positive classification.',
          modelAnswer:
            'Any three of: trace the constant to an actual call site (it is used, not dead code); check the value shape against the claimed provider (AIza…, AKIA…, eyJ…); inspect surrounding naming and context (debug/test markers vs production naming); see whether the value decrypts or unlocks local data in your lab; check whether the same value also appears in native libraries or assets (duplication signal).',
          hint: 'Used, shaped, named, proven locally.',
          explanation:
            'Classification is evidence-based: usage, shape, context, and local proof separate real secrets from sample values and SDK placeholders — without any out-of-scope live testing.'
        },
        {
          id: 'm04-l04-q4',
          type: 'scenario',
          prompt:
            'Your sweep finds what looks like a live payment-provider key in an authorized target. The client is unreachable. What do you do — and not do?',
          modelAnswer:
            'Do: preserve the evidence (match, location, context screenshot), classify it as suspected-live based on static context, write the finding with recommended rotation, and store the value only in the engagement\u2019s secure evidence store. Do not: test the key against the provider\u2019s live API, share it in chat or tickets, or delay reporting until the client confirms.',
          hint: 'Suspected-live is enough for the finding; live-proving is out of scope.',
          explanation:
            'Reporting suspected-live credentials with rotation guidance is the professional action; exercising them against third-party infrastructure is unauthorized testing that creates liability without adding report value.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Hardcoded-secret testing — see the data-storage and code-quality tests for your MASTG version.'
        },
        {
          title: 'JADX — official repository',
          url: 'https://github.com/skylot/jadx',
          note: 'The export step that produces the searchable tree.'
        }
      ]
    },
    {
      id: 'm04-l05',
      moduleId: 'm04',
      title: 'Auditing Exported Components Statically',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l02', 'm03-l02', 'm01-l04'],
      objectives: [
        'Enumerate every component of a target and decide its exported state correctly',
        'Assess permission guards, intent-filter exposure, and provider protections',
        'Trace what each exported component does with attacker-supplied input before any dynamic test'
      ],
      diagram: 'component-interaction',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The manifest is the app\u2019s front-door directory, and exported components are doors other apps can open without asking. Module 01 taught what components are; m03-l02 taught how to read the manifest. This lesson combines them into a systematic audit: enumerate, classify, guard-check, and then read the code that handles each door\u2019s input — all before a single dynamic test.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'component-interaction',
            caption: 'External callers reach exported components through the framework — the audit maps each path.'
          },
          {
            type: 'h',
            text: 'The audit procedure'
          },
          {
            type: 'list',
            items: [
              'Enumerate: decode the manifest (apktool or aapt2 dump xmltree) and list every activity, service, receiver, and provider',
              'Classify exported state: explicit android:exported, or implicit via intent-filter rules (targetSdk 31+ requires explicit declarations for filter-bearing components; older targets default them to exported)',
              'Guard-check: android:permission on the component, readPermission/writePermission for providers, grantUriPermissions, and the protectionLevel of any custom permission guarding them (m01-l06, m03-l02)',
              'Trace input handling: open each exported component in JADX and follow getIntent()/getExtras(), onReceive(), onStartCommand(), and query/insert/update/delete — what does it do with values it did not create?',
              'Record: component, trigger (explicit intent / filter / URI), inputs, code path, and the attack question it raises'
            ]
          },
          {
            type: 'table',
            headers: ['Component type', 'Entry point to read', 'Question to answer'],
            rows: [
              ['Activity', 'onCreate: getIntent(), get*Extra', 'Can crafted extras bypass local auth or feed a WebView/loader?'],
              ['Service', 'onStartCommand intent handling', 'Can a caller trigger privileged actions with an action string + extras?'],
              ['Receiver', 'onReceive: action, extras, sender checks', 'Does it trust broadcasts any app can send (m01-l05)?'],
              ['Provider', 'query/insert/update/delete, URI matching', 'Do URI paths leak or mutate data without caller validation?']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Component findings scale well: an exported activity that trusts an "unlock" extra, a receiver that accepts a forged action, a provider that serves any caller — each is reachable by every app on the device, no UI required. Static tracing tells you what to test dynamically (module 07 drives these surfaces with am/content commands); skipping the static pass means dynamic testing with no idea which inputs matter.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Exported components with no android:permission and input-handling code that branches on extras',
              'Components reachable via BROWSABLE filters (deep links — full treatment in m04-l06)',
              'Providers with grantUriPermissions="true" or missing read/write permissions and no caller-identity checks (getCallingPackage/getCallingUid)',
              'Custom permissions guarding components whose protectionLevel is normal or dangerous (any app can hold them)',
              'Library-added components in the merged manifest that the source repo never shows (m03-l02)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'This lesson only reads',
            text:
              'Static auditing means reading the manifest and code — nothing is invoked yet. Starting exported components with am/broadcast/content commands is active testing: in-scope targets and test devices only, when the dynamic modules teach it.'
          },
          {
            type: 'terminal',
            title: 'Building the component inventory',
            lines: [
              '$ apktool d target.apk -o target-src',
              '$ rg -n "android:exported|<activity|<service|<receiver|<provider" target-src/AndroidManifest.xml',
              '$ aapt2 dump xmltree target.apk --file AndroidManifest.xml | rg "E: (activity|service|receiver|provider)|exported|permission"',
              '# for each exported entry: open the class in jadx-gui and trace its intent input path'
            ]
          },
          {
            type: 'p',
            text:
              'Deliverable: a one-row-per-component table (component, exported, guard, inputs read, code path summary, test question). It takes twenty minutes and converts the component-testing module from poking around into executing a planned test matrix.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A typical training-app pattern: an exported activity whose onCreate reads getStringExtra("pin") and unlocks premium content when it matches a constant. The static audit produces the full row — exported=true, no permission, input "pin", path onCreate > compare > grantUnlock() — and the test question "does an externally-supplied pin reach privileged functionality?". Module 07 answers it with one am start command; the static work is what made that answer meaningful.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['apktool / aapt2', 'Manifest enumeration and attribute extraction'],
              ['jadx-gui', 'Tracing intent input handling inside each component class'],
              ['MobSF', 'Automatically lists exported components — your enumeration cross-check'],
              ['drozer (later modules)', 'The dynamic counterpart that invokes what you audited here']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Auditing only activities — receivers and providers are quieter and often leak more',
              'Assuming exported=false is unreachable: same-UID apps, debuggable-build adb, and platform flows can still reach components (m01-l04)',
              'Treating a guarding custom permission as safe without checking its protectionLevel',
              'Trusting intent-filter absence as absence of exposure — filter rules depend on targetSdk (m03-l02, m01-l04)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the full component table for your training app: every component, exported state, guard, inputs, and one test question each. Star the two components you would test first and justify the ranking by impact and reachability. Keep the table — it is the first artifact of the component-testing module.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Audit is a fixed loop: enumerate, classify exported, guard-check, trace input, record',
              'Exported state is decided by explicit attribute or filter rules — and targetSdk changes the defaults',
              'A guarding permission only guards if apps cannot hold it — check protectionLevel',
              'The deliverable is a test-question table, not a list of class names'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l05-q1',
          type: 'mcq',
          prompt: 'An app targets API 30 and declares an activity with an intent-filter but no android:exported attribute. Is it exported?',
          options: [
            'No — exported must be explicit on all versions',
            'Yes — for that targetSdk, intent-filters default the component to exported',
            'Only if the filter includes BROWSABLE',
            'It depends on the device manufacturer'
          ],
          answerIndex: 1,
          hint: 'The explicit-declaration requirement arrived with Android 12 / targetSdk 31.',
          explanation:
            'Before targetSdk 31, components with intent-filters were implicitly exported. Android 12 began requiring explicit declarations — both rules matter during audits, and targetSdk tells you which applies.'
        },
        {
          id: 'm04-l05-q2',
          type: 'truefalse',
          prompt: 'A custom permission with protectionLevel="normal" reliably protects an exported component from other apps.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who can be granted a normal-level permission?',
          explanation:
            'Normal permissions are granted at install to any requesting app, so the gate passes everyone. A meaningful guard needs signature-level protection or runtime caller validation inside the component (m01-l06).'
        },
        {
          id: 'm04-l05-q3',
          type: 'short',
          prompt: 'For each component type, name the method where attacker-supplied input enters the code.',
          modelAnswer:
            'Activities: onCreate via getIntent() extras; Services: onStartCommand\u2019s Intent; Receivers: onReceive\u2019s Intent (action + extras); Providers: query/insert/update/delete with the caller-supplied URI and values.',
          hint: 'One lifecycle callback or CRUD operation per type.',
          explanation:
            'Those entry methods are where the trace starts: read what each does with values it did not create, then decide which inputs would be hostile in a dynamic test.'
        },
        {
          id: 'm04-l05-q4',
          type: 'scenario',
          prompt:
            'Your audit finds an exported provider with no readPermission, no writePermission, and grantUriPermissions unset — but query() calls a caller-UID check before returning data. How do you classify it?',
          modelAnswer:
            'Guarded at the code level: manifest attributes are absent, but runtime caller validation implements the check. Classify as likely secure with a verification note — confirm the check covers all four operations (query/insert/update/delete), every path-specific URI branch, and cannot be bypassed via grant-delegation flows. Do not report "no permission attributes" without reading the code.',
          hint: 'Manifest guards are one implementation of the check.',
          explanation:
            'Protection lives in the code path, not just the attribute. Manifest-only auditing produces false positives and false negatives — the trace step exists to catch exactly this case.'
        }
      ],
      references: [
        {
          title: 'Android Developers — <activity> element (exported)',
          url: 'https://developer.android.com/guide/topics/manifest/activity-element',
          note: 'Official exported semantics and the Android 12 requirement.'
        },
        {
          title: 'Android Developers — Intents and intent filters',
          url: 'https://developer.android.com/guide/components/intents-filters',
          note: 'How filters expose components to external callers.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'The component-audit tests this lesson prepares you for.'
        }
      ]
    },
    {
      id: 'm04-l06',
      moduleId: 'm04',
      title: 'Insecure WebViews and Deep Links',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l05', 'm01-l05'],
      objectives: [
        'Identify risky WebView configuration and what attack each setting enables',
        'Audit deep-link intent filters and trace what link parameters drive',
        'Recognize the hybrid attack chain: remote link, local component, privileged effect'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Hybrid apps live in two worlds at once: WebView screens run attacker-adjacent web content with native privileges, and deep links give browsers, QR codes, and other apps a URL-shaped way to start local components with parameters. Audited statically, both reduce to the same question: which external input reaches which privileged sink?'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'WebView settings that matter'
          },
          {
            type: 'table',
            headers: ['Setting / API', 'What it does', 'Risk when misused'],
            rows: [
              ['setJavaScriptEnabled(true)', 'Runs JS in the page', 'Required by many apps; risk depends on what the page can reach'],
              ['addJavascriptInterface(obj, name)', 'Exposes a Java object to page JS', 'Page JS can call native methods — severe with untrusted content (the pre-API17 RCE class)'],
              ['setAllowFileAccess / setAllowFileAccessFromFileURLs / setAllowUniversalAccessFromFileURLs', 'Controls file:// URL reach', 'File-URL content reading app-private files'],
              ['setMixedContentMode(ALWAYS_ALLOW)', 'HTTP subresources on HTTPS pages', 'MITM injection into "secure" pages'],
              ['loadUrl(attacker-influenced string)', 'Navigation sink', 'Open redirect, phished UI, or loading file:// content paths']
            ]
          },
          {
            type: 'h',
            text: 'Deep links'
          },
          {
            type: 'p',
            text:
              'A deep link is an intent-filter: action VIEW, category BROWSABLE (reachable from a browser), and data scheme/host/pathPrefix. The activity reads getIntent().getData() and calls getQueryParameter(...) — link parameters become function inputs. The audit question chain: which URLs start this activity, which parameters are read, and what does each parameter drive (navigation? WebView target? state change?). Unverified custom schemes can be claimed by any installed app and triggered by any web page; verified App Links are stronger, but only when the site-association verification is actually configured.'
          },
          {
            type: 'compare',
            title: 'WebView configuration: permissive vs hardened (training-app style)',
            beforeTitle: 'Everything open',
            beforeCode:
              'webView.getSettings().setJavaScriptEnabled(true);\nwebView.getSettings().setAllowFileAccessFromFileURLs(true);\nwebView.getSettings().setAllowUniversalAccessFromFileURLs(true);\nwebView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);\nwebView.addJavascriptInterface(new Bridge(), "Android");\nwebView.loadUrl(getIntent().getData().toString());   // deep-link input, unvalidated',
            afterTitle: 'Scoped and validated',
            afterCode:
              'webView.getSettings().setJavaScriptEnabled(true);    // only if JS is required\nwebView.getSettings().setAllowFileAccess(false);\nwebView.getSettings().setAllowFileAccessFromFileURLs(false);\nwebView.getSettings().setAllowUniversalAccessFromFileURLs(false);\nwebView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);\n\nUri link = getIntent().getData();                    // deep-link input\nString url = link.getQueryParameter("url");\nif (url != null && "app.example.com".equals(Uri.parse(url).getHost())) {\n    webView.loadUrl(url);                            // allow-listed host only\n} else {\n    finish();                                        // refuse everything else\n}'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'The chain is what makes these findings strong: a web page (or QR code) triggers myapp://pay?to=attacker&amount=999 or myapp://web?url=https://evil.example — the browser supplies the remote reach, the deep-link component supplies the local privilege, and unvalidated parameters connect them. Static analysis (this lesson) establishes that the chain exists; module 07 fires it with adb am start. addJavascriptInterface over untrusted content is the extreme case: page JS calling native code.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'addJavascriptInterface with content loaded from non-first-party origins',
              'File-access settings enabled together with file:// or content:// loading paths',
              'loadUrl, loadDataWithBaseURL, or shouldOverrideUrlLoading fed from getIntent().getData() or getQueryParameter without allow-listing',
              'Broad filters: scheme-only matches (no host/pathPrefix) and BROWSABLE on sensitive activities',
              'Deep-linked activities combining m04-l05\u2019s trusted-extras patterns with web sinks'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Statically: decode the manifest, list every filter (scheme/host/pathPrefix/category), open each target activity, and trace getData()/getQueryParameter to their sinks (loadUrl, state changes, payments). Build the same test-question table as m04-l05, one row per link: URL shape, parameters, sink, impact hypothesis. Then check for JS bridges: every addJavascriptInterface call, the object\u2019s @JavascriptInterface-annotated methods, and which origins can reach them.'
          },
          {
            type: 'terminal',
            title: 'From manifest to sink (static trace)',
            lines: [
              '$ rg -n -A6 "<intent-filter" target-src/AndroidManifest.xml',
              '$ rg -n "getQueryParameter|getData\\(\\)|loadUrl|addJavascriptInterface|setAllow" jadx-out/sources',
              '# open each hit in jadx-gui; note: caller (deep link / web page) -> parameter -> sink',
              '# dynamic firing comes later, in scope: am start -a android.intent.action.VIEW -d "myapp://..."'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Firing links is active testing',
            text:
              'Triggering deep links against the real app (or from a browser on the test device) is active component invocation — training apps and in-scope targets only, on your own test devices.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Training apps in the MASTG/DIVA tradition ship both patterns deliberately: a WebView screen whose url parameter comes straight from the launching intent, and a deep-link activity that performs a sensitive action from a parameter. Static work on such a target: write out the full chain (filter > parameter > sink > impact) for each, then predict exactly the am start command that would demonstrate it — the prediction is your check for understanding before module 07 runs it.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['apktool / aapt2', 'Enumerate intent-filters and their scheme/host/pathPrefix data'],
              ['jadx-gui + ripgrep', 'Trace getData/getQueryParameter to loadUrl and bridge calls'],
              ['adb am start', 'The dynamic trigger (module 07) for the chains you built here'],
              ['adb shell dumpsys', 'Confirm resolved link handling when a filter is ambiguous']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Flagging setJavaScriptEnabled alone as a vulnerability — the risk comes from what the enabled page can reach',
              'Ignoring mixed content and file-access settings because the bridge is the flashy finding',
              'Auditing filters without the sinks: a link that only opens a help page is noise, not a finding',
              'Assuming App Links verification exists because the filter uses https — the site-association configuration is what proves it'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your training app, find every intent-filter and every WebView. For one deep link and one WebView screen each, write the chain on paper: trigger URL, parameters read, sinks reached, worst-case impact, and the exact am start command that would test it. Review the notes a day later — missed sinks are the lesson here.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'WebView risk = external content x reachable privilege (JS, bridges, file URLs, mixed content)',
              'Deep links are exported components with URL syntax — same audit, extra BROWSABLE reach',
              'The finding is the chain: remote trigger to privileged sink via unvalidated parameters',
              'Static analysis builds and predicts the chain; module 07 fires it in scope'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l06-q1',
          type: 'mcq',
          prompt: 'Which combination makes a WebView screen most dangerous when it can load untrusted content?',
          options: [
            'JavaScript enabled with a Java bridge exposed via addJavascriptInterface',
            'JavaScript enabled with no bridge and file access disabled',
            'Caching enabled with HTTPS-only content',
            'Zoom controls enabled'
          ],
          answerIndex: 0,
          hint: 'What can page JavaScript call when a bridge is registered?',
          explanation:
            'addJavascriptInterface exposes annotated native methods to page JavaScript. Untrusted content plus a bridge means the page can invoke native code — the severe end of the WebView risk spectrum.'
        },
        {
          id: 'm04-l06-q2',
          type: 'truefalse',
          prompt: 'An intent-filter with only a custom scheme (no host or pathPrefix) makes that activity reachable from any web page via that scheme.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does BROWSABLE + scheme matching require of the caller?',
          explanation:
            'BROWSABLE makes the filter browser-reachable; scheme-only matching accepts any host/path under that scheme. Any web page (or QR code) can fire it, and other apps can claim the same scheme — hence allow-listed hosts in code.'
        },
        {
          id: 'm04-l06-q3',
          type: 'short',
          prompt: 'Name three WebView settings an auditor checks besides setJavaScriptEnabled.',
          modelAnswer:
            'Any three of: addJavascriptInterface (native bridge exposure), setAllowFileAccess / setAllowFileAccessFromFileURLs / setAllowUniversalAccessFromFileURLs (file URL reach), setMixedContentMode (cleartext subresources on secure pages) — plus loadUrl input validation as the navigation sink.',
          hint: 'Bridges, file URLs, cleartext subresources.',
          explanation:
            'JavaScript alone is configuration; the security-relevant questions are what the page can call (bridge), which files it can read (file access), and what content can be injected (mixed content / unvalidated navigation).'
        },
        {
          id: 'm04-l06-q4',
          type: 'scenario',
          prompt:
            'A deep link myapp://web?url=<anything> reaches an activity that loads the url parameter into a bridge-equipped WebView. Describe the finding as you would write it.',
          modelAnswer:
            'Finding: remote content can drive privileged WebView loading. Chain: any web page triggers myapp://web?url=https://evil.example (BROWSABLE filter); the activity reads the url query parameter without host allow-listing and loads it into a WebView that exposes a native JavaScript bridge. Impact: attacker-controlled content rendered in a trusted app context with bridge access to native methods and app state. Remediation: validate/allow-list the target host before loadUrl, scope the bridge to first-party origins, and consider App Links verification.',
          hint: 'Trigger, parameter, sink, impact, fix.',
          explanation:
            'The five-part structure is the report-grade form of the chain built in this lesson — and the exact pattern module 07 proves dynamically with one am start command.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Build web apps in WebView',
          url: 'https://developer.android.com/guide/webapps/webview',
          note: 'Official WebView configuration and security guidance.'
        },
        {
          title: 'Android Developers — Create deep links to app content',
          url: 'https://developer.android.com/training/app-links/deep-linking',
          note: 'Official deep link and App Links documentation.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'WebView and deep-link test procedures.'
        }
      ]
    },
    {
      id: 'm04-l07',
      moduleId: 'm04',
      title: 'Crypto and Storage Mistakes in Code',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m04-l02', 'm01-l07'],
      objectives: [
        'Recognize weak algorithm choices, hardcoded key material, and broken randomness in decompiled code',
        'Identify plaintext token storage and string-built SQL in the code you already review',
        'Formulate the runtime test that would prove each static observation'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Most real-world Android crypto flaws are not clever breaks — they are ordinary code using the wrong algorithm, a key that ships in the APK, or randomness that is not random. Likewise most storage flaws are ordinary code writing tokens to plaintext prefs and SQL built by concatenation. This lesson teaches the recognizable signatures, so that your regular code review (m04-l02) starts flagging them.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The signature table'
          },
          {
            type: 'table',
            headers: ['Signature in code', 'What is wrong', 'Search anchor'],
            rows: [
              ['Cipher.getInstance("AES")', 'Defaults to ECB mode — identical blocks, no IV', 'getInstance('],
              ['"DES", "DESede", "RC4", "MD5", "SHA-1"', 'Broken or obsolete primitives', 'getInstance('],
              ['new SecretKeySpec("literal".getBytes(), "AES")', 'Key shipped inside the APK', 'SecretKeySpec'],
              ['new IvParameterSpec(fixed bytes)', 'IV reused or known — defeats CBC/GCM semantics', 'IvParameterSpec'],
              ['new SecureRandom(seed.getBytes())', 'Seeded SecureRandom becomes predictable', 'SecureRandom'],
              ['java.util.Random for tokens/codes', 'Guessable sequence, not cryptographic', 'new Random('],
              ['prefs.putString("token", …)', 'Plaintext credentials in XML prefs (m01-l07)', 'putString, shared_prefs'],
              ['db.execSQL("SELECT … " + input)', 'SQL injection by concatenation', 'execSQL, rawQuery']
            ]
          },
          {
            type: 'p',
            text:
              'Context matters: SHA-256 for a cache key is fine; MD5 for a password is not. ECB on one block of already-random data differs from ECB on structured data. The auditor\u2019s job is to name the mechanism, not just the API — and the fix direction is usually the same: platform Keystore-generated keys (hardware-backed, non-extractable), authenticated modes (GCM) with fresh IVs, and parameterized queries.'
          },
          {
            type: 'compare',
            title: 'The classic pair, side by side',
            beforeTitle: 'Flawed (found constantly)',
            beforeCode:
              'Cipher c = Cipher.getInstance("AES");            // -> AES/ECB/PKCS5Padding\nSecretKeySpec k = new SecretKeySpec(\n        "SuperSecretKey123".getBytes(), "AES");  // key ships in the APK\nc.init(Cipher.ENCRYPT_MODE, k);                  // no IV needed - the ECB tell\ndb.execSQL("SELECT * FROM users WHERE name = \u0027"\n        + userInput + "\u0027");                       // SQL injection',
            afterTitle: 'Sound direction',
            afterCode:
              '// Key from the platform Keystore (non-extractable)\nKeyStore ks = KeyStore.getInstance("AndroidKeyStore");\nKey key = ks.getKey("db-protect", null);\n\nCipher c = Cipher.getInstance("AES/GCM/NoPadding");\nc.init(Cipher.ENCRYPT_MODE, key);                // fresh IV generated per message\nbyte[] iv = c.getIV();                           // store alongside ciphertext\n\nSQLiteStatement p = db.compileStatement(\n        "SELECT * FROM users WHERE name = ?");   // parameterized\np.bindString(1, userInput);'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These signatures feed two reportable claims. Confidentiality claims: data "protected" with a shipped key is plaintext-equivalent — provable in your lab by decrypting it (module 05 hooks or a quick offline script). Integrity/authorization claims: client-side checks resting on predictable tokens or forgeable state are not boundaries — module 05\u2019s authorization testing shows what actually enforces access. Storage findings pair with m01-l07\u2019s locations: the code tells you what gets written where, the device tells you what is actually there.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'getInstance( calls with mode-less or legacy algorithm strings (m04-l04\u2019s sweep finds the constants too)',
              'Key-shaped literals: exactly 16/24/32-character strings named key/secret/iv/salt, or byte[] literals beside Cipher init',
              'SecureRandom constructed with a seed, and java.util.Random anywhere near tokens, codes, or session ids',
              'putString( near token/session/auth names, and getDefaultSharedPreferences wrapping secrets',
              'execSQL/rawQuery with + or String.format, and query builders fed unvalidated input'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Signature sweep on the exported tree',
            lines: [
              '$ rg -n "Cipher.getInstance|SecretKeySpec|IvParameterSpec|SecureRandom|MessageDigest" jadx-out/sources',
              '$ rg -n -i "(putString|edit\\(\\)).*(token|session|auth|pass)" jadx-out/sources',
              '$ rg -n "execSQL|rawQuery" jadx-out/sources',
              '# for each hit: open in jadx-gui, trace the key material and the data protected',
              '# plan the runtime proof: which value would you decrypt / which query would you manipulate?'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Prove it in your lab',
            text:
              'A crypto finding becomes strong evidence when you demonstrate it locally: decrypt a value the app shipped or stored using the key you found in the same APK. That requires no external service and stays entirely inside your authorized environment.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A MASTG crackme in the spirit of UnCrackable ships a secret encrypted with a key embedded in the same APK. The static pass finds the SecretKeySpec literal and the ECB transformation; a fifteen-line offline script with the same key and mode decrypts the embedded blob. The finding writes itself: confidentiality of the stored data depends entirely on material recoverable from the package — and the fix is Keystore-backed keys, not longer literals.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['jadx-gui + ripgrep', 'Signature hunting and tracing key material to protected data'],
              ['MobSF', 'Flags common crypto/storage anti-patterns automatically — cross-check your manual sweep'],
              ['openssl / python (lab)', 'Reproduce decryption locally to prove the shipped-key claim'],
              ['sqlite3', 'Inspect the databases whose queries you are auditing (module 05 makes this dynamic)']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Flagging every ECB or hash mention without checking what data it protects',
              'Reading the presence of AndroidKeyStore as proof of correct usage — keys can still be misused after retrieval',
              'Reporting SQL injection from execSQL alone — parameterized queries and selection args are the benign twins',
              'Stopping at the static claim: every finding here gets stronger (or dies) with the runtime proof you plan now'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the signature sweep on your training app and produce three classified findings: one crypto, one storage, one randomness — each with the code snippet, the data it endangers, and one sentence on the runtime test that would prove it. File them in your hypothesis list from m04-l01; module 05 will check them off.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Crypto flaws have recognizable signatures: legacy modes, shipped keys, seeded randomness',
              'Storage flaws are location-plus-content: plaintext tokens in prefs, concatenation-built SQL',
              'Mechanism over API name: say what breaks (predictability, recoverability, injection), not just what is old',
              'Every static observation here gets a planned runtime proof in module 05'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm04-l07-q1',
          type: 'mcq',
          prompt: 'What does Cipher.getInstance("AES") actually give you?',
          options: [
            'AES/GCM with a random IV',
            'AES/ECB with PKCS5 padding — the mode default',
            'AES/CBC with a zero IV',
            'A compile error — a mode is required'
          ],
          answerIndex: 1,
          hint: 'The transformation string is only half specified.',
          explanation:
            'A bare "AES" maps to the provider default AES/ECB/PKCS5Padding. Identical plaintext blocks encrypt identically and no IV exists — the classic static signature of broken symmetric encryption.'
        },
        {
          id: 'm04-l07-q2',
          type: 'truefalse',
          prompt: 'new SecureRandom(mySeed.getBytes()) is acceptable as long as the seed is long and random-looking.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does seeding do to the output stream?',
          explanation:
            'A seeded SecureRandom reproduces its entire output stream from the seed. If the seed is derivable (a constant, a timestamp), every "random" value is predictable — the correct pattern is the unseeded platform implementation.'
        },
        {
          id: 'm04-l07-q3',
          type: 'short',
          prompt: 'Name two reasons tokens in SharedPreferences are a finding even though the directory is app-private.',
          modelAnswer:
            'Any two of: the threat model includes rooted devices, backups (allowBackup), and lost devices, where sandbox boundaries do not help; prefs are plaintext XML readable by anyone with the sandbox access a tester already has (run-as/root/debuggable builds); storing there forfeits the hardware-backed protection the platform Keystore would provide for real secrets.',
          hint: 'Who can read inside the sandbox, and what was the secret worth?',
          explanation:
            'The sandbox protects against other apps, not against the device owner, thieves, backups, or testers. Storage guidance treats sensitive data in plaintext prefs as a defect precisely because stronger platform options exist.'
        },
        {
          id: 'm04-l07-q4',
          type: 'scenario',
          prompt:
            'Static review shows: SharedPreferences stores a session token, and the token is a java.util.Random-generated value seeded at first launch. State the combined impact in one report sentence.',
          modelAnswer:
            'Session tokens are predictable: they are generated with a non-cryptographic java.util.Random sequence seeded at first launch and stored as plaintext XML in SharedPreferences — an attacker who can read the stored token (backup, rooted device, debuggable build) can replay it, and one who can model the sequence can predict other values from it. Remediation: generate tokens server-side with a CSPRNG and store client state in Keystore-encrypted storage.',
          hint: 'Two flaws, one sentence: generation and storage.',
          explanation:
            'Flaws compound: predictable generation removes the secrecy of new tokens, plaintext storage removes the secrecy of issued ones. Findings that combine generation and storage weaknesses justify higher impact ratings.'
        }
      ],
      references: [
        {
          title: 'Android Developers — javax.crypto.Cipher reference',
          url: 'https://developer.android.com/reference/javax/crypto/Cipher',
          note: 'Official transformation-string semantics (why bare "AES" means ECB).'
        },
        {
          title: 'Android Developers — SecureRandom reference',
          url: 'https://developer.android.com/reference/java/security/SecureRandom',
          note: 'Official guidance on seeding and secure usage.'
        },
        {
          title: 'Android Developers — Android Keystore system',
          url: 'https://developer.android.com/training/articles/keystore',
          note: 'The platform answer to shipped keys: non-extractable, hardware-backed keys.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Cryptography and storage test cases — see the tests for your MASTG version.'
        }
      ]
    }
  ]
};
