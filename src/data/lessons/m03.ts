import type { Module } from '../../types';

// LEVEL 2 — PACKAGE ANALYSIS · Module 03: APK Fundamentals
// Original curriculum content synthesized from public official documentation:
// developer.android.com, source.android.com, mas.owasp.org, and the official
// repositories of JADX and Apktool. All prose is original; reference links
// point to the official sources used for study.

export const m03: Module = {
  id: 'm03',
  title: 'APK Fundamentals',
  level: 2,
  description:
    'Open the package itself: what is inside an APK, what the manifest really says, how DEX bytecode and Smali map to behavior, where resources and native libraries hide their secrets, and how signing binds it all together. This is the groundwork for every static-analysis technique in the academy.',
  outcomes: [
    'Describe every component of an APK and its role in analysis',
    'Read AndroidManifest.xml with a security eye and identify risky configuration',
    'Read Smali and reason about DEX, multidex, and on-device compilation artifacts',
    'Locate sensitive data in resources, assets, and native libraries',
    'Verify APK signature schemes and re-sign modified APKs for tamper testing'
  ],
  lessons: [
    {
      id: 'm03-l01',
      moduleId: 'm03',
      title: 'Anatomy of an APK',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l03', 'm02-l05'],
      objectives: [
        'Name every major member of an APK and what it contributes',
        'Explain why the same APK looks different through different tools',
        'Perform a layout-based triage of an APK before any decompilation'
      ],
      diagram: 'apk-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An APK is a ZIP archive with a strict layout: manifest, bytecode, resources, native libraries, and signatures. Every entry is analysis surface. Before touching a decompiler, a tester reads the package itself — sizes, file names, embedded assets — because that inventory usually points at where the interesting things live.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'apk-anatomy',
            caption: 'Inside the APK: each member plays a distinct role.'
          },
          {
            type: 'table',
            headers: ['Member', 'What it is', 'Why testers care'],
            rows: [
              ['AndroidManifest.xml', 'Identity, components, permissions — compiled to binary XML', 'First triage target: flags, exported components, permissions'],
              ['classes.dex (classes2.dex…)', 'The app\u2019s bytecode executed by ART', 'The main static-analysis input (JADX / Smali)'],
              ['resources.arsc', 'Value table mapping resource IDs to strings, layouts, values', 'Decoded strings and names leak hints and secrets'],
              ['res/', 'Compiled resources: layouts, drawables, raw XML', 'Strings, icons, and raw files are searchable evidence'],
              ['assets/', 'Raw files shipped as-is, read via AssetManager', 'Favorite hiding spot: configs, databases, keys'],
              ['lib/<abi>/*.so', 'Native code per ABI (arm64-v8a, x86_64…)', 'Logic, secrets, and protections live here too'],
              ['META-INF/', 'v1 (JAR) signature files: MANIFEST.MF, *.SF, *.RSA', 'Tells you the signing scheme and signer'],
              ['APK Signing Block', 'v2/v3 signature data between ZIP entries', 'Whole-file integrity since Android 7']
            ]
          },
          {
            type: 'p',
            text:
              'The same APK looks different depending on the tool: unzip shows raw ZIP entries, apktool decodes resources and disassembles DEX, JADX decompiles code, and aapt2 answers "what is this package" (badging) and renders binary XML as text. None of these modify the APK — modification and repackaging come in later modules.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Triage is an APK-layout skill: check the manifest for flags (next lesson), grep assets and res for secrets, note the ABI list (a single arm64-v8a .so means you must test on matching hardware), and read the signature files to know the signing baseline before any tamper test. App bundles complicate the picture: what you receive may be a split set (base + config.<abi> + language splits) rather than one file — always check whether you are holding a complete app or a fragment.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Large or unusual assets (JSON configs, .db files, PEM-looking blobs) — grep them for keys, endpoints, passwords',
              'classes2.dex and beyond (multidex) — remember to analyze every DEX file, not just the first',
              'lib/ entries for ABIs your test device does not support (a crash is waiting, not a bug)',
              'Extra files inside META-INF that are not signature files — v1-era injection tricks lived there'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'First contact with an APK',
            lines: [
              '$ adb shell pm path com.example.app           # on-device location',
              '$ adb pull /data/app/.../base.apk target.apk',
              '$ unzip -l target.apk | head -20',
              '$ mkdir target && cd target && unzip -q ../target.apk',
              '$ file assets/* lib/arm64-v8a/* | head',
              '$ aapt2 dump badging ../target.apk | head -5'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Name evidence files',
            text:
              'Keep pulled APKs named <package>-<version>-<hash-prefix>.apk. Version confusion is the classic time sink on multi-day engagements.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Pull a training app\u2019s APK and inventory it: unzip -l shows how many DEX files exist and whether assets exist; badging reveals the package name and API levels; a grep -rniE "key|secret|token|http" over assets/ and res/values/ often surfaces the first findings before any decompiler runs. The point is method: layout first, decompiler second.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['unzip / 7-Zip', 'Raw archive inspection — the ground truth'],
              ['aapt2', 'badging and xmltree dumps without decompiling'],
              ['apkanalyzer', 'Android Studio\u2019s APK inspection UI/CLI'],
              ['JADX', 'The decompiled view, once layout triage is done']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Opening AndroidManifest.xml in a text editor and seeing gibberish — inside the APK it is binary XML; use aapt2/apktool/JADX to render it',
              'Analyzing only classes.dex and skipping assets, res, and lib',
              'Treating a config split (config.arm64_v8a.apk) as a complete app — base plus splits together form the install',
              'Assuming resources are innocuous — embedded strings, arrays, and raw assets regularly carry secrets'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pull one training APK and build a written inventory: DEX count, ABI list, asset files with sizes, signature files present, and three suspicious strings found by grep. That one-page inventory is the deliverable-style artifact you will produce on day one of real engagements.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'APK = structured ZIP: manifest, DEX, arsc, res, assets, lib, signatures',
              'Each member is a distinct analysis surface; layout triage precedes decompilation',
              'Tools see different layers: unzip (raw), aapt2 (identity), apktool (decoded), JADX (code)',
              'Split APKs mean one logical app spread over several files — inventory all of them'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm03-l01-q1',
          type: 'mcq',
          prompt: 'Inside an installed APK, AndroidManifest.xml is stored as…',
          options: [
            'Plain UTF-8 XML',
            'Binary XML requiring aapt2/apktool to read',
            'A serialized protobuf',
            'A Java class'
          ],
          answerIndex: 1,
          hint: 'Open it raw and it looks like garbage with readable fragments.',
          explanation:
            'The manifest is compiled to Android\u2019s binary XML format inside the APK. Tools like aapt2 dump xmltree, apktool, or JADX render it back to readable XML.'
        },
        {
          id: 'm03-l01-q2',
          type: 'truefalse',
          prompt: 'A single APK can contain multiple classes.dex files.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Multidex.',
          explanation:
            'Multidex apps ship classes.dex, classes2.dex, and so on. Static analysis must cover every DEX file, not just the first one.'
        },
        {
          id: 'm03-l01-q3',
          type: 'short',
          prompt: 'Where does v2 signature data live, and why is it not in META-INF?',
          modelAnswer:
            'In the APK Signing Block — a region inserted between ZIP entries (before the central directory). It signs the whole archive rather than individual files, so it cannot be represented as META-INF entries the way the v1 JAR signature files are.',
          hint: 'v2 protects the entire file, not per-entry.',
          explanation:
            'v2/v3 signatures live in the APK Signing Block and cover the whole package, which is what makes any byte-level tamper detectable — unlike v1\u2019s per-file entries in META-INF.'
        },
        {
          id: 'm03-l01-q4',
          type: 'scenario',
          prompt:
            'A client sends you an "APK" that fails to install standalone: config.arm64_v8a.apk. Explain what it is and what you request instead.',
          modelAnswer:
            'This is a configuration split from an Android App Bundle — it contains only the native libraries for one ABI. The installable unit is the base APK plus its splits; request the full split set (or a universal APK) and inventory each file, since static analysis must consider them together as one logical app.',
          hint: 'App bundles ship as several files.',
          explanation:
            'App bundles are delivered as splits (base, ABI, language, density). Analyzing only one split gives a false picture — collect the complete set and map members back to the single logical app.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — Reverse Engineering with JADX',
          url: 'https://mas.owasp.org/MASTG/Android/0x05c-Reverse-Engineering-with-Jadx/',
          note: 'The decompilation workflow this triage feeds into.'
        },
        {
          title: 'AOSP — ART and Dalvik (DEX)',
          url: 'https://source.android.com/docs/core/runtime',
          note: 'Official runtime documentation for the bytecode you are inventorying.'
        },
        {
          title: 'JADX — official repository',
          url: 'https://github.com/skylot/jadx',
          note: 'The decompiler used throughout this academy.'
        }
      ]
    },
    {
      id: 'm03-l02',
      moduleId: 'm03',
      title: 'AndroidManifest.xml Deep Dive',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m03-l01'],
      objectives: [
        'Read the manifest structure: identity, permissions, application flags, components',
        'Identify the high-signal risk attributes and what attacks each enables',
        'Explain manifest merging and why the shipped manifest is the one that counts'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The manifest is the app\u2019s contract with the platform: identity (package, versions), security policy (permissions, flags), and the complete directory of components other apps may call. It is also the first thing automated scanners read — and the first thing you should read manually, because the risky flags are one-line decisions with system-wide consequences.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Structure you will actually read'
          },
          {
            type: 'list',
            items: [
              '<manifest> root: package, versionCode/versionName, build versions — identity and build context',
              '<uses-permission> (requests a permission), <permission> (defines a new one) — the permission model surface',
              '<application>: the global flags — android:debuggable, android:allowBackup, android:usesCleartextTraffic, android:networkSecurityConfig, android:name (the Application class)',
              'Components: <activity>, <service>, <receiver>, <provider> — each with android:exported, android:permission, and intent-filters; <provider> adds authorities, grantUriPermissions, read/writePermission'
            ]
          },
          {
            type: 'h',
            text: 'The flags that matter most'
          },
          {
            type: 'table',
            headers: ['Attribute', 'Risk when enabled/set', 'Expected in release builds'],
            rows: [
              ['debuggable="true"', 'run-as works, JDWP debugging, arbitrary data access', 'false / absent'],
              ['allowBackup="true"', 'Private data extractable via backup mechanisms', 'false for sensitive apps'],
              ['usesCleartextTraffic="true"', 'HTTP allowed app-wide (legacy semantics)', 'false / absent'],
              ['networkSecurityConfig', 'Per-domain trust and cleartext policy — read the XML it points to', 'Restrictive (system CAs, no cleartext)']
            ]
          },
          {
            type: 'h',
            text: 'Merged manifests'
          },
          {
            type: 'p',
            text:
              'What ships in the APK is the merger of your manifest with every library\u2019s manifest. Libraries can add permissions (ad SDKs are notorious for it) and components (an exported receiver bundled by a third party). Reviewing the repository\u2019s manifest alone therefore undercounts real exposure: always diff the merged manifest from the built APK against the source.'
          },
          {
            type: 'compare',
            title: 'Manifest fragment: permissive vs hardened',
            beforeTitle: 'Over-permissive',
            beforeCode:
              '<application\n    android:debuggable="true"\n    android:allowBackup="true"\n    android:usesCleartextTraffic="true">\n  <activity android:name=".AdminActivity"\n      android:exported="true" />\n  <provider android:name=".DbProvider"\n      android:authorities="com.example.app.db"\n      android:grantUriPermissions="true" />\n</application>',
            afterTitle: 'Hardened',
            afterCode:
              '<application\n    android:allowBackup="false"\n    android:networkSecurityConfig="@xml/network_security_config">\n  <activity android:name=".AdminActivity"\n      android:exported="false" />\n  <provider android:name=".DbProvider"\n      android:authorities="com.example.app.db"\n      android:exported="false"\n      android:grantUriPermissions="false" />\n</application>'
          },
          {
            type: 'p',
            text:
              'Each removed attribute removes a class of findings: no debugging channel, no backup extraction, no cleartext fallback, no unauthenticated component entry, and no open URI grants.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Manifest findings are cheap to find and expensive for a defender to argue with: a debuggable release build is an instant critical, an exported provider without permission checks is a data-exposure path (module 07 probes it dynamically), and over-requested permissions are least-privilege violations. The MASTG platform tests start exactly here because the manifest defines the attack surface every later dynamic technique will probe.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:debuggable or allowBackup true in a release build (confirm the build type first!)',
              'Exported components (explicit true, or intent-filters on older targetSdk) without android:permission',
              'Providers with grantUriPermissions="true" and no caller validation',
              'Permissions requested that decompiled code never uses — and sensitive APIs used without any grant',
              'A .debug package suffix or versionName pattern that reveals you are looking at a debug build, not release'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Reading the real manifest',
            lines: [
              '$ aapt2 dump xmltree target.apk --file AndroidManifest.xml | head -60',
              '# or, decoded and pretty:',
              '$ apktool d target.apk -o out && head -60 out/AndroidManifest.xml',
              '# quick automated pass:',
              '# open the APK in MobSF and review the manifest findings section'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Manifest tampering is active testing',
            text:
              'Repackaging a manifest (adding debug-overrides, exporting a component) is tamper testing — do it only on apps you are authorized to modify, and keep the original APK untouched as evidence.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Take the training app\u2019s decoded manifest and annotate every line: which permissions are justified by the code? Which components are exported and why? Most training apps deliberately ship an exported activity or provider — your annotations become the checklist that module 07 turns into am and content commands.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'aapt2 dump xmltree / badging — manifest inspection without decompiling',
              'apktool — a decoded, diffable AndroidManifest.xml on disk',
              'JADX — manifest view cross-linked into decompiled components',
              'MobSF — automated manifest risk flags as a first pass'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting the source-repo manifest alone — libraries merge into the final one and can silently add permissions or exported components',
              'Flagging debuggable/allowBackup without confirming the APK is actually a release build (debug builds are supposed to have them)',
              'Confusing <uses-permission> (the app requests an existing permission) with <permission> (the app defines a new one)',
              'Assuming the exported-default rules are identical across targetSdk levels — Android 12 (API 31) requires explicit declarations for filter-bearing components; older targets differ'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Decode a training APK and produce a two-column table: component/flag on the left, the attack it enables on the right. Then prove one flag dynamically (run-as on a debuggable build, for example). Static claim plus dynamic proof is the report-grade pattern.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'The manifest is identity + policy + component directory — read it first, every time',
              'debuggable, allowBackup, cleartext, and networkSecurityConfig are the high-signal flags',
              'What ships is the merged manifest — libraries change your real exposure',
              'Manifest findings are claims until proven dynamically'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm03-l02-q1',
          type: 'mcq',
          prompt: 'Which application attribute makes run-as and JDWP debugging available for the app on any build?',
          options: [
            'android:exported',
            'android:debuggable',
            'android:allowBackup',
            'android:usesCleartextTraffic'
          ],
          answerIndex: 1,
          hint: 'It is named after exactly the capability.',
          explanation:
            'android:debuggable="true" makes the app debuggable: run-as grants shell access to its private data and JDWP enables debugger attachment. Release builds should never ship with it.'
        },
        {
          id: 'm03-l02-q2',
          type: 'truefalse',
          prompt: 'A third-party library can add permissions to your app\u2019s final manifest through manifest merging.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What ships is the merged result.',
          explanation:
            'The APK contains the merged manifest of app plus all libraries. Ad SDKs commonly add permissions and components, so the merged output — not the source file — defines real exposure.'
        },
        {
          id: 'm03-l02-q3',
          type: 'short',
          prompt: 'What is the difference between <uses-permission> and <permission> in a manifest?',
          modelAnswer:
            '<uses-permission> declares that the app requests an existing (platform or custom) permission; <permission> defines a new custom permission that other apps can request, with a protectionLevel controlling who may hold it.',
          hint: 'One consumes, one defines.',
          explanation:
            'The pair matters when auditing custom-permission misuse: an app that defines a signature-level permission to guard its exported components implements internal access control — an app that defines one with protectionLevel normal may have built a gate anyone can pass.'
        },
        {
          id: 'm03-l02-q4',
          type: 'scenario',
          prompt:
            'A release APK declares android:allowBackup="true" and stores an auth token in SharedPreferences. State the finding, the test that proves it, and an impact sentence for the report.',
          modelAnswer:
            'Finding: sensitive data is extractable via backup mechanisms because allowBackup is enabled. Test: on an authorized device, extract the app\u2019s data through the available backup flow (or verify flag plus storage location via run-as/root) and show the token in the output. Impact: a person with brief physical/ADB access to a device can recover a valid session token from the backup, enabling account takeover without knowing the password.',
          hint: 'Flag + data location + extraction = complete finding.',
          explanation:
            'Manifest flags become findings when paired with the data they expose. allowBackup with plaintext tokens in prefs is the textbook insecure-storage combination reported under MASTG storage tests.'
        }
      ],
      references: [
        {
          title: 'Android Developers — App manifest overview',
          url: 'https://developer.android.com/guide/topics/manifest/manifest-intro',
          note: 'Official manifest structure reference.'
        },
        {
          title: 'Android Developers — <application> element',
          url: 'https://developer.android.com/guide/topics/manifest/application-element',
          note: 'Official reference for the flags discussed in this lesson.'
        },
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'Where manifest findings are turned into dynamic tests.'
        }
      ]
    },
    {
      id: 'm03-l03',
      moduleId: 'm03',
      title: 'DEX, Bytecode and Smali',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m01-l03', 'm03-l01'],
      objectives: [
        'Explain multidex and on-device compilation artifacts (odex/vdex)',
        'Read basic Smali: registers, type descriptors, and the invoke forms',
        'Use Smali to verify decompiler output and locate patchable checks'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module 01 introduced DEX as the executable format; this lesson makes it readable. Smali is the assembly language of DEX — verbose, exact, and always available when the decompiler gives up. Reading Smali turns "JADX could not decompile this method" from a dead end into a five-minute read.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'DEX packaging and artifacts'
          },
          {
            type: 'list',
            items: [
              'Multidex: the ~64K method-reference limit per DEX forces large apps to split across classes.dex, classes2.dex, …; the main-dex list decides what must load first',
              'On-device artifacts: ART compiles installed DEX to native code stored as odex/vdex/art in AOT directories — these mirror the DEX and can reveal more than the APK on some setups',
              'Identifiers survive unless R8/ProGuard renamed them; strings and method names are the anchor points for navigation'
            ]
          },
          {
            type: 'h',
            text: 'Smali syntax crash course'
          },
          {
            type: 'p',
            text:
              'Smali is baksmali\u2019s human-readable assembly of DEX. Registers: vN are method-local registers, pN are parameter registers (p0 is this for non-static methods); .locals declares how many locals exist. Types use JVM-style descriptors: Ljava/lang/String; for objects, Z for boolean, I for int, [B for byte arrays. Method calls use five invoke forms: invoke-virtual (normal instance methods), invoke-super, invoke-direct (constructors and private calls), invoke-static, invoke-interface.'
          },
          {
            type: 'code',
            lang: 'smali',
            title: 'A checkPin method, as apktool/baksmali writes it',
            code:
              '.method public checkPin(Ljava/lang/String;)Z\n    .locals 3\n    .param p1, "input"    # Ljava/lang/String;\n\n    const-string v0, "4871"\n\n    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z\n\n    move-result v1\n\n    if-eqz v1, :cond_0\n    const/4 v2, 0x1\n    return v2\n\n    :cond_0\n    const/4 v2, 0x0\n    return v2\n.end method'
          },
          {
            type: 'p',
            text:
              'Walk through it: .locals 3 declares v0–v2; p1 is the input parameter (p0 is this). const-string loads the hardcoded PIN; invoke-virtual calls String.equals with v0 and p1 as arguments; move-result picks up the boolean return; if-eqz branches to cond_0 when the comparison failed, returning 0 (false) — otherwise 1 (true). Every line maps one-to-one to DEX; nothing is hidden here, which is exactly why it is trustworthy.'
          },
          {
            type: 'table',
            headers: ['invoke form', 'Used for'],
            rows: [
              ['invoke-virtual', 'Normal instance method calls (virtual dispatch)'],
              ['invoke-super', 'Calls to the parent class implementation'],
              ['invoke-direct', 'Constructors (<init>) and private methods'],
              ['invoke-static', 'Static methods — no receiver register'],
              ['invoke-interface', 'Calls through an interface reference']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Three workflows need Smali: verifying security-critical decompilations (crypto comparisons, auth checks) because decompilers approximate; locating hardcoded checks (PINs, license checks, root detection) before patching them; and writing targeted patches when a repack-based test is in scope. Smali is also the common language between apktool round-trips and Frida hook targets — you read the Smali to decide what to hook at runtime.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'const-string values near comparison logic (credentials, URLs, salt material)',
              'Runtime.exec, DexClassLoader, loadLibrary — dynamic behavior static reading can miss',
              'Ljavax/crypto/... signatures — crypto code worth verifying byte-exactly',
              'Suspicious class names (RootCheck, IntegrityCheck) — obfuscated variants may break decompilers, but Smali still reads'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'From APK to Smali and back',
            lines: [
              '$ apktool d target.apk -o target-src',
              '$ find target-src -name "*.smali" | head',
              '$ grep -rn "4871" target-src/smali/ | head    # locate the check',
              '# ...edit only if the test plan calls for it...',
              '$ apktool b target-src -o target-patched.apk && apksigner sign --ks test.keystore target-patched.apk'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Patching is tampering',
            text:
              'Modifying and re-signing an APK is active tampering. Only repack apps you are authorized to test, and never redistribute modified packages.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Decompile the training app, locate the string from the Smali walkthrough (or its equivalent), and predict the app\u2019s behavior from the bytecode alone: which register holds user input, what the comparison is, where the success branch goes. Then confirm dynamically by entering the right value. Predict-then-verify builds the reading skill faster than any summary.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'apktool (baksmali/smali) — decode and rebuild DEX as Smali',
              'JADX — shows each decompiled method\u2019s Smali side by side when decompilation is shaky',
              'apksigner — re-sign after any rebuild (module 03-l05 covers signing)'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Miscounting registers: adding a const without enough registers corrupts the method — .locals/.registers must be respected',
              'Confusing p and v registers (p0 is this in instance methods; static methods have no p0)',
              'Editing Smali but shipping without re-signing — the install is rejected until the new signature is applied',
              'Trusting decompiled Java for crypto or auth logic — verify in Smali or dynamically'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In the training app, find a method whose decompilation looks odd in JADX, switch to its Smali view, and narrate it line by line (registers, invokes, branches). Then answer: what exact inputs make it take the success branch? If you can answer confidently, Smali has become a tool instead of a wall.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'DEX may be split (multidex) and compiled on-device (odex/vdex) — know where both copies live',
              'Smali = exact assembly of DEX: v/p registers, type descriptors, five invoke forms',
              'Read Smali to verify decompiler output and to find patchable checks',
              'Any rebuild implies re-signing — tamper tests end at apksigner'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm03-l03-q1',
          type: 'mcq',
          prompt: 'In a non-static Smali method, what is p0?',
          options: [
            'The first explicit parameter',
            'The this reference',
            'The return register',
            'A static field'
          ],
          answerIndex: 1,
          hint: 'Instance methods carry their receiver.',
          explanation:
            'Parameter registers include the receiver: p0 is this for instance methods and explicit parameters start at p1. Static methods have no receiver, so their p0 is the first real parameter.'
        },
        {
          id: 'm03-l03-q2',
          type: 'truefalse',
          prompt: 'invoke-direct is used for constructors and private method calls.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: '<init> is the constructor\u2019s name.',
          explanation:
            'invoke-direct covers non-virtual dispatch: constructors (<init>) and private methods. invoke-virtual handles normal instance calls and invoke-static handles static methods.'
        },
        {
          id: 'm03-l03-q3',
          type: 'short',
          prompt: 'Why can a large app ship more than one classes.dex file?',
          modelAnswer:
            'A single DEX file has a hard limit of about 64K method references (multidex). Build tooling splits the code across classes.dex, classes2.dex, and so on, with a main-dex list ensuring startup-critical classes load first. Static analysis must cover every file.',
          hint: 'There is a famous numeric limit.',
          explanation:
            'Multidex is a packaging consequence of the 64K reference limit, not an optimization. Reviewers who analyze only classes.dex systematically miss code — often exactly where obfuscated or sensitive logic hides.'
        },
        {
          id: 'm03-l03-q4',
          type: 'scenario',
          prompt:
            'JADX decompiles a target\u2019s license-check method as garbled pseudo-code. You need to know exactly what it compares. Give your workflow.',
          modelAnswer:
            'Open the method\u2019s Smali in JADX or decode with apktool; read the registers, const-strings, and invoke forms to reconstruct the exact comparison (what value, which method, which branch); optionally hook the method with Frida to confirm runtime values. Only then decide on any patch — which requires an apktool rebuild and re-sign within the authorized scope.',
          hint: 'The exact ground truth lives one representation below Java.',
          explanation:
            'Decompilers approximate; Smali is a faithful view of the DEX. Security-relevant conclusions (license checks, crypto comparisons) should be verified at the Smali level or dynamically — never on shaky pseudo-code alone.'
        }
      ],
      references: [
        {
          title: 'Apktool — official repository',
          url: 'https://github.com/iBotPeaches/Apktool',
          note: 'The decode/rebuild toolchain used in this lesson.'
        },
        {
          title: 'AOSP — ART and Dalvik (DEX)',
          url: 'https://source.android.com/docs/core/runtime',
          note: 'Official documentation of the bytecode and compilation artifacts.'
        },
        {
          title: 'Android Developers — Configure apps with over 64K methods',
          url: 'https://developer.android.com/studio/build/multidex',
          note: 'Official multidex documentation.'
        }
      ]
    },
    {
      id: 'm03-l04',
      moduleId: 'm03',
      title: 'Resources, Assets and Native Libraries',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m03-l01'],
      objectives: [
        'Distinguish res/ (compiled, indexed) from assets/ (raw)',
        'Explain how lib/<abi>/*.so and JNI connect native code to the app',
        'Run a resource and native-library sweep that produces reportable findings'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Not everything an app does lives in DEX. Strings, layouts, raw files, and compiled C/C++ libraries are all part of the package — and all part of the review. API keys in strings.xml, debug configs in assets, and secrets or protections compiled into .so files are routine findings that decompilers alone will never show you.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'res/, resources.arsc and assets/'
          },
          {
            type: 'p',
            text:
              'The res/ directory holds compiled resources: XML is binary, PNGs may be optimized, and every entry has an integer ID. resources.arsc is the index mapping those IDs to values and names — that is what apktool decodes back into readable files and what the R class constants refer to in code. assets/ is different: files shipped verbatim and read at runtime via AssetManager (getAssets().open("config.json")), with no compilation and no ID mapping. Rule of thumb: res/ is structured and typed; assets/ is a private filesystem.'
          },
          {
            type: 'h',
            text: 'Native libraries and JNI'
          },
          {
            type: 'p',
            text:
              'lib/<abi>/lib<name>.so contains ELF shared libraries per Android ABI: armeabi-v7a, arm64-v8a, x86, x86_64. Java code declares native methods and loads the library with System.loadLibrary("name"); JNI then links symbols named Java_<package>_<Class>_<method> so the Java-side call executes C/C++. Apps go native for performance, crypto, and protection: obfuscation and anti-tamper logic often live only in the .so, invisible to DEX tooling.'
          },
          {
            type: 'p',
            text:
              'For testers this means a second codebase to review — usually smaller, often juicier: embedded strings (via strings or a disassembler), exported JNI symbols, and hardcoded paths or keys are all visible without full reverse engineering.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Resource and asset review is the cheapest source of findings in most assessments: hardcoded API keys and endpoints (res + assets), leftover debug files, embedded databases with real data, and third-party SDK configuration. Native libraries matter twice: as a place where secrets hide, and as the place where anti-root/anti-tamper logic is typically implemented — which is why the resilience modules teach both the DEX and the native perspective.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'strings.xml and other res/values files for keys, tokens, endpoints, and "temporary" debug strings',
              'assets/ contents: JSON/YAML configs, .db/.sqlite files, PEM/DER blobs, scripts',
              'The lib/ ABI set versus your test devices; unexpected or unusually large .so files',
              'System.loadLibrary calls in decompiled code, and native methods handling secrets (getSignature, getServerUrl…)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Sweeping resources and native libs',
            lines: [
              '$ unzip -l target.apk | grep -E "assets/|lib/"',
              '$ apktool d target.apk -o out && grep -rniE "api[_-]?key|secret|token|https?://" out/res out/assets | head',
              '$ file out/lib/arm64-v8a/*',
              '$ strings -a out/lib/arm64-v8a/libnative.so | grep -iE "key|http|root" | head'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Triage .so files cheaply',
            text:
              'For .so analysis beyond strings, any disassembler works; for triage, strings plus the exported symbol list (nm -D or readelf) already reveal a library\u2019s surface.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Run the sweep on a training app. Typical results: an assets/config.json with a hardcoded endpoint, a strings.xml entry named dev_api_key, and a native library whose strings expose the encryption key the crackme uses. Each is a one-line finding with screenshot-grade evidence — no bytecode required.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'apktool — decodes res/ and resources.arsc into readable files',
              'JADX — browses resources alongside decompiled code',
              'aapt2 — quick dumps of specific resources without a full decode',
              'strings / readelf / nm — first-contact tooling for native libraries'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reviewing only strings.xml — secrets also sit in arrays, raw XML, and assets',
              'Treating assets as encrypted-by-default: they are shipped verbatim inside the APK',
              'Skipping native libraries because "binary": strings and symbol tables expose most of what testers need first',
              'Testing an arm64-v8a-only app on an x86_64 emulator image and misreading the crash as an app bug (missing ABI)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take one training app and produce a "beyond DEX" findings list: three resource/asset findings and one native-library string worth reporting. Then check whether the decompiled Java references them (R.string.dev_api_key, loadLibrary) — connecting the file to its code path is what turns an observation into a verified finding.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'res/ is compiled and indexed by resources.arsc; assets/ ships raw and unindexed',
              'lib/<abi>/*.so is a second codebase: performance, crypto, and protections go native',
              'JNI links Java native methods to exported symbols — the names trace the boundary',
              'Resource and native sweeps are the highest-yield, lowest-effort steps in APK triage'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm03-l04-q1',
          type: 'mcq',
          prompt: 'Which directory ships files verbatim, readable at runtime through AssetManager?',
          options: ['res/', 'assets/', 'META-INF/', 'lib/'],
          answerIndex: 1,
          hint: 'Its files get no resource IDs.',
          explanation:
            'assets/ files are shipped as-is and opened with getAssets().open(...) — no compilation, no ID mapping. res/ files are compiled and indexed by resources.arsc.'
        },
        {
          id: 'm03-l04-q2',
          type: 'truefalse',
          prompt: 'A native method declared in Java is linked by JNI to a symbol conventionally named Java_<package>_<Class>_<method>.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'The symbol encodes the Java location.',
          explanation:
            'JNI\u2019s default binding maps a Java native method to the exported symbol Java_package_Class_method (path separators become underscores). Spotting these symbols in a .so quickly maps native surface back to its Java callers.'
        },
        {
          id: 'm03-l04-q3',
          type: 'short',
          prompt: 'Give two reasons a tester inspects lib/<abi>/*.so files even when DEX decompiles cleanly.',
          modelAnswer:
            'Any two of: secrets/keys/URLs embedded as strings in native code; business logic or crypto implemented in C/C++ away from DEX review; anti-root/anti-tamper protections typically implemented natively; and ABI coverage checks (does the app even run on the test device?).',
          hint: 'What would a developer move outside the easily-decompiled layer?',
          explanation:
            'Going native is a deliberate choice to move logic out of bytecode review. Testers follow it there — first with strings and symbols, later with disassembly when the protections matter.'
        },
        {
          id: 'm03-l04-q4',
          type: 'scenario',
          prompt:
            'A training app crashes instantly on your x86_64 emulator. unzip -l shows only lib/arm64-v8a/libtarget.so. What is happening and what are your options?',
          modelAnswer:
            'The APK ships native code only for arm64-v8a, so it cannot load its library on the x86_64 image (an UnsatisfiedLinkError-style crash). Options: run it on an arm64-v8a emulator image or a physical arm64 device, and optionally note the limited ABI coverage as a compatibility observation. Do not misreport the environment mismatch as an app logic bug.',
          hint: 'lib/ told you this before the crash did.',
          explanation:
            'ABI mismatch is an environment problem, not necessarily an app defect. The APK inventory from lesson 01 predicts exactly this outcome before you ever press install.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Providing resources',
          url: 'https://developer.android.com/guide/topics/resources/providing-resources',
          note: 'Official resource system documentation.'
        },
        {
          title: 'Android Developers — ABI management (NDK)',
          url: 'https://developer.android.com/ndk/guides/abis',
          note: 'Official ABI reference for lib/<abi> layouts.'
        },
        {
          title: 'Android Developers — JNI tips',
          url: 'https://developer.android.com/training/articles/perf-jni',
          note: 'Official JNI guidance, including symbol naming.'
        }
      ]
    },
    {
      id: 'm03-l05',
      moduleId: 'm03',
      title: 'Signing and Integrity',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['m03-l01'],
      objectives: [
        'Distinguish the v1/v2/v3/v4 signature schemes and what each protects',
        'Verify a package with apksigner and explain keystore basics',
        'Re-sign a modified APK and explain what re-signing means for tamper tests'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every installable APK is cryptographically signed, and Android refuses unsigned or broken packages. For testers, signing knowledge pays twice: apksigner verify tells you which protections a package benefits from, and re-signing is the unavoidable last step of every tamper test — because the moment you modify an APK, its signature is invalid.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The four schemes'
          },
          {
            type: 'table',
            headers: ['Scheme', 'Since', 'Protects', 'Notes'],
            rows: [
              ['v1 (JAR)', 'API 1', 'Each ZIP entry individually (META-INF manifests)', 'File-level only; extra entries can hide from it; needed by very old devices'],
              ['v2', 'API 24 (Android 7)', 'The whole APK via a signing block between ZIP entries', 'Any byte change breaks verification'],
              ['v3', 'API 28 (Android 9)', 'Whole APK plus key-rotation lineage', 'Proof of rotation links old and new keys'],
              ['v4', 'API 30 (Android 11)', 'Incremental install tree in a separate .idsig file', 'Supports streaming ADB installs; complements v2/v3']
            ]
          },
          {
            type: 'p',
            text:
              'A single APK can carry several schemes at once; the platform uses what it supports. apksigner verify --verbose prints exactly which schemes are present and valid — run it on every package you receive before spending analysis time.'
          },
          {
            type: 'h',
            text: 'Keystores and keys'
          },
          {
            type: 'p',
            text:
              'Signing keys live in keystores (JKS or PKCS12) with aliases and passwords, created with keytool -genkeypair. Development keystores (including the automatic debug keystore) are self-signed — perfectly fine for installs. What matters for testing: a re-signed APK has a different certificate than the original, so it cannot install as an update over the original (signature mismatch) and loses any signature-granted privileges. Apps can also read their own signing certificate at runtime and refuse to run when it changes — an anti-tamper control you will meet again in resilience testing.'
          },
          {
            type: 'h',
            text: 'Why tamper tests must re-sign'
          },
          {
            type: 'p',
            text:
              'The chain is always: decode (apktool d) > patch (Smali/resources) > build (apktool b) > align (zipalign) > sign (apksigner with your test keystore) > install (adb install -t). Skip the sign step and the platform rejects the package. That rejection is not an obstacle — it is the control being studied: signature verification is why naive repackaging fails, and detecting re-signed packages is a legitimate app defense.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Two reportable patterns live here. First, packaging posture: packages signed only with v1 on modern minimum SDKs, or runtime integrity checks that are easy to strip. Second, the tamper workflow itself: proving that a modified, re-signed APK installs and runs is the baseline experiment for anti-tamper testing — if nothing in the app notices the new certificate, that is a resilience finding. Conversely, apps that verify their own signature correctly deserve a positive note in the report.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Re-signing is tampering',
            text:
              'Re-signing and installing modified APKs is tampering. Do it only on training apps or apps you are explicitly authorized to test in writing, on devices you own.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'apksigner verify output: which v1/v2/v3 schemes are present — missing v2 means weaker whole-file integrity on modern devices',
              'META-INF contents in the raw ZIP (v1 files) versus a signing block (v2+)',
              'Runtime code reading PackageManager signatures (GET_SIGNATURES / GET_SIGNING_CERTIFICATES) — self-integrity checks',
              'Apps that crash or refuse to start when re-signed — that behavior is the control working, not a packaging mistake'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Generate a test key and re-sign a patched APK',
            lines: [
              '$ keytool -genkeypair -v -keystore test.keystore -alias testkey \\',
              '    -keyalg RSA -keysize 2048 -validity 10000',
              '$ zipalign -p 4 target-patched.apk target-aligned.apk',
              '$ apksigner sign --ks test.keystore --out target-signed.apk target-aligned.apk',
              '$ apksigner verify --verbose target-signed.apk',
              'Verifying',
              'Signed using v1 scheme: true',
              'Signed using v2 scheme: true',
              '$ adb install -t target-signed.apk'
            ]
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Order matters',
            text:
              'zipalign before apksigner. apksigner preserves alignment; re-aligning after signing can break v2 verification.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Take a training APK, make the smallest possible change (a string in resources), rebuild with apktool b, sign with your test keystore, and install. Then repeat the flow on a version of the app that implements a signature check (several crackmes do): the app now refuses to run or flags the change — your evidence for the anti-tamper finding, in both directions.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'apksigner — sign and verify (the authoritative scheme checker)',
              'keytool — keystore and key creation/inspection',
              'zipalign — pre-signing alignment (ordering matters with apksigner)',
              'jarsigner — legacy JAR-only signer; know it exists, prefer apksigner'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Forgetting adb install -t for re-signed/test packages and misreading INSTALL_FAILED_TEST_ONLY as a signature problem',
              'Signing before zipalign (or re-aligning after signing) and producing packages that fail v2 verification',
              'Expecting a re-signed APK to update over the installed original — the signature mismatch forces an uninstall first, which integrity-checking apps may legitimately detect',
              'Confusing the debug keystore\u2019s convenience with release identity: re-signed packages carry your test certificate, not the developer\u2019s'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete one full tamper cycle on a training app: decode, change one resource, build, align, sign, verify, install, and screenshot the changed behavior. Then run apksigner verify on both the original and your package and diff the output — the certificate change you just made is the exact signal anti-tamper code watches for.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'v1 signs entries, v2/v3 sign the whole file; verify with apksigner before analyzing',
              'Modifying an APK invalidates its signature — re-signing is mandatory for tamper tests',
              'Re-signed packages are a different identity: no update-over, lost signature grants, detectable by the app',
              'Detecting a re-sign is an app defense; failing to detect one is a resilience finding'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm03-l05-q1',
          type: 'mcq',
          prompt: 'Which signature scheme first protected the entire APK file rather than individual ZIP entries?',
          options: [
            'v1 (JAR)',
            'v2 (APK Signature Scheme)',
            'v3 lineage',
            'v4 incremental'
          ],
          answerIndex: 1,
          hint: 'It arrives with Android 7.',
          explanation:
            'v2 (API 24) signs the whole package through the APK Signing Block, making any byte-level modification detectable. v1 only covers individual entries, leaving archive-level gaps.'
        },
        {
          id: 'm03-l05-q2',
          type: 'truefalse',
          prompt: 'After modifying and re-signing an APK with a new key, it can be installed as an update directly over the original app.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the platform compare on update?',
          explanation:
            'Android refuses updates whose signing certificate does not match the installed package. The re-signed APK must be installed after uninstalling the original — and that certificate difference is exactly what integrity-checking apps detect.'
        },
        {
          id: 'm03-l05-q3',
          type: 'short',
          prompt: 'Give the ordered command chain for a tamper-test build, from decoded sources to installed package.',
          modelAnswer:
            'apktool d (decode), edit Smali/resources, apktool b (build), zipalign, apksigner sign (test keystore), apksigner verify, adb install -t. Alignment precedes signing; installation needs -t for test packages.',
          hint: 'Six verbs, one order, and a flag at the end.',
          explanation:
            'The order matters: alignment before signing keeps v2 intact, and apksigner verify confirms the schemes before you waste an install cycle. This chain is the backbone of every repack-based test.'
        },
        {
          id: 'm03-l05-q4',
          type: 'scenario',
          prompt:
            'Your re-signed build of an in-scope app installs but exits immediately on launch. The original works. Static review shows code comparing its own signing certificate to a constant. Classify and report.',
          modelAnswer:
            'This is an anti-tamper / signing-integrity check working as designed: the app detects that its runtime certificate differs from the expected one and refuses to run. Report it as a positive resilience control — or, only if resilience testing is explicitly in scope, use it as the baseline for the dedicated bypass work of later modules. Do not frame the crash as a defect introduced by the modification environment.',
          hint: 'The app noticed your key.',
          explanation:
            'Certificate-comparison checks are the standard runtime defense against repackaging. A tester\u2019s job is to document the control\u2019s effectiveness; defeating it belongs to explicitly scoped resilience work with dedicated techniques.'
        }
      ],
      references: [
        {
          title: 'Android Developers — apksigner',
          url: 'https://developer.android.com/studio/command-line/apksigner',
          note: 'Official signing and verification reference.'
        },
        {
          title: 'AOSP — APK signature schemes',
          url: 'https://source.android.com/docs/security/features/apksigning',
          note: 'Platform documentation of how signatures are verified.'
        },
        {
          title: 'Android Developers — Sign your app',
          url: 'https://developer.android.com/studio/publish/app-signing',
          note: 'Official signing overview, including keystores.'
        }
      ]
    }
  ]
};
