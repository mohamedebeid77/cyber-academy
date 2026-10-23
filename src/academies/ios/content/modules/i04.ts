import type { Module } from '../../../../types';

// LEVEL 1 — APP INTERNALS · Module i04: iOS App Structure & the IPA
// Original content synthesized from Apple Developer documentation and OWASP MASTG.

export const i04: Module = {
  id: 'i04',
  title: 'iOS App Structure & the IPA',
  level: 1,
  description:
    'Inside the package: what an IPA really is, the .app bundle, Info.plist as the app\u2019s identity card, and a hands-on extraction and triage workflow. By the end you can open any IPA and produce a structured first inventory without running anything.',
  outcomes: [
    'Describe the IPA→Payload→.app hierarchy and every entry class inside the bundle',
    'Read an Info.plist like a pentester: identity, permissions, URL schemes, ATS, background modes',
    'Extract an IPA and run a structured triage producing a written bundle inventory'
  ],
  lessons: [
    {
      id: 'i04-l01',
      moduleId: 'i04',
      title: 'Anatomy of an IPA',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['i01-l01'],
      objectives: [
        'Explain the IPA format (ZIP) and its relationship to the installed .app bundle',
        'Identify each entry class in a bundle and its testing significance',
        'Predict where configuration, secrets and security-relevant flags are likely to live'
      ],
      diagram: 'ios-ipa-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An IPA is a ZIP archive whose Payload/ directory holds exactly one .app bundle — the same directory that gets installed on device. That one sentence unlocks the whole domain: you do not need a device to start analyzing an app, only an unzip. Everything else in this module is learning to read what falls out of the archive.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-ipa-anatomy',
            caption: 'Interactive walkthrough: every entry class in a .app bundle and what a tester does with it.'
          },
          { type: 'h', text: 'The entry classes' },
          {
            type: 'list',
            items: [
              'Executable (bundle-named Mach-O): the app\u2019s compiled code — static analysis and RE target number one',
              'Info.plist: compiled binary plist — identity, permissions, URL schemes, ATS policy (next lesson)',
              'embedded.mobileprovision: provisioning profile when present — channel, team, entitlements (module i06)',
              '_CodeSignature/CodeResources: hashes of every bundled resource — tamper detection at install time',
              'Frameworks/: embedded dynamic frameworks — each its own Mach-O; common home of SDKs (analytics, security, pinning)',
              'PlugIns/: app extensions (.appex) — separate binaries with separate Info.plists (module i16)',
              'Watch/, Widgets/: companion apps — same treatment as extensions',
              'Assets.car: compiled asset catalog; *.lproj: localization — strings that reveal features and internal names',
              'Custom resources: *.plist, *.json, *.sqlite, *.cer, *.html — configuration and data shipped with the app; the classic accidental-secret shelf'
            ]
          },
          { type: 'h', text: 'IPA vs installed bundle' },
          {
            type: 'p',
            text:
              'The .app you unzip is byte-identical to what the device installs (store IPAs are Apple-re-signed; dev IPAs carry their profile). On device the bundle lands read-only under a randomized path, and the app gains a separate data container (module i02-l03). Practical difference: files the app creates at runtime (downloads, caches, logs) are NOT in the IPA — if you see a database inside the bundle, it shipped that way, which is itself notable.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Static-first: the entire module i08 workflow runs on this archive — triage now, tools later',
              'Frameworks/ triage matters: third-party SDKs carry their own (often weaker) network and storage behavior',
              'PlugIns/ inventory is required scoping: every extension is additional attack surface with its own plist and permissions',
              'Resource sweep finds the highest-yield low-effort findings: config files with endpoints, keys, test data'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Unusual bundle contents: SQLites with data inside, HTML/JS bundles (WebView apps), PEM/DER certificates, .env-style files',
              'Multiple executables (Frameworks/, PlugIns/) — each needs the same treatment as the main binary',
              'Localization files with suspicious keys (debug, admin, bypass)',
              'Absence of embedded.mobileprovision in a "dev-provided" IPA — you may be holding a store build'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'First contact with any IPA (macOS or Linux)',
            lines: [
              '$ file Application.ipa',
              'Application.ipa: Zip archive data, at least v2.0',
              '$ unzip -l Application.ipa | head -25',
              '  Length      Date    Name',
              '---------  ---------- ----------------',
              '        0  2025-03-02 10:14   Payload/',
              '        0  2025-03-02 10:14   Payload/TargetApp.app/',
              '   524288  2025-03-02 10:14   Payload/TargetApp.app/TargetApp',
              '    12288  2025-03-02 10:14   Payload/TargetApp.app/Info.plist',
              '     8110  2025-03-02 10:14   Payload/TargetApp.app/embedded.mobileprovision',
              '        0  2025-03-02 10:14   Payload/TargetApp.app/Frameworks/AnalyticsSDK.framework/',
              '        0  2025-03-02 10:14   Payload/TargetApp.app/PlugIns/ShareExt.appex/',
              '$ unzip Application.ipa -d extracted/',
              '$ ls extracted/Payload/TargetApp.app/'
            ]
          },
          {
            type: 'p',
            text:
              'The inventory habit: after unzip, write four lists before any tooling — (1) binaries (main + frameworks + extensions), (2) config-looking files, (3) certificates/keys, (4) surprises. Those lists are the input for module i08\u2019s deeper sweep and the checklist your report\u2019s scope section will cite.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A real triage shape. Unzipping a fintech app: Frameworks/ holds eleven SDKs (three analytics, one each for push, payments, anti-fraud, pinning). PlugIns/ holds a share extension and a widget. Resources contain config/environments.json listing dev, staging and production API bases with feature flags. Already, before running anything: the extension and widget are in scope, three analytics SDKs mean three parties receiving data (privacy module), and environments.json answers the "where do I point my proxy" question. Ten minutes of unzipping scoped the whole engagement.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Everything here is standard tooling: file, unzip, ls, and a plist viewer (plutil comes in module i06/i08 on macOS; on other OSes any binary-plist reader). Asset catalog extraction (assetutil, acextract) and class-dump-family tools arrive with module i09.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Renaming an .apk to .ipa or expecting APK structure — the formats and contents differ fundamentally',
              'Ignoring Frameworks/ and PlugIns/ — half the attack surface lives outside the main binary',
              'Treating IPA contents as the app\u2019s runtime data — runtime files live in the container, not the bundle',
              'Overwriting the original IPA with modified contents before finishing static work — keep pristine copies; hashes matter for evidence'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Acquire any training IPA (OWASP\u2019s MASTestApp-iOS or an intentionally vulnerable app you are licensed to use) and run the terminal workflow above. Produce the four lists. If any list is empty, say so explicitly in your notes — negative findings are findings of diligence, and "no certificates shipped" is worth a line in a report.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'IPA = ZIP → Payload/ → one .app bundle, byte-identical to what installs',
            'Entry classes: executable, Info.plist, profile, signature, Frameworks/, PlugIns/, resources',
            'Inventory in four lists before running tools — it scopes everything after',
            'Bundle ≠ container: shipped files and runtime files are different evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i04-l01-q1',
          type: 'mcq',
          prompt: 'What is the mandatory top-level structure of an IPA?',
          options: [
            'META-INF/ and classes.dex',
            'Payload/ containing exactly one .app bundle',
            'A manifest.json plus assets/',
            'An unsigned ZIP of arbitrary layout'
          ],
          answerIndex: 1,
          hint: 'Which single directory does iOS require inside the archive?',
          explanation:
            'Payload/<Name>.app is the contract; iOS rejects otherwise-valid ZIPs without it. Optional additions (SwiftSupport/, symbols) may appear for store submissions, but Payload/ is the app.'
        },
        {
          id: 'i04-l01-q2',
          type: 'truefalse',
          prompt: 'A SQLite database found inside the .app bundle was created by the app during testing on the developer\u2019s machine.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What lands in the bundle vs what the container holds?',
          explanation:
            'Cannot conclude that — and the phrasing matters both ways. Bundle contents are shipped at build time (the developer packaged it deliberately or sloppily); runtime-created databases land in the container, never the read-only bundle. Either way, a data-bearing SQLite inside a bundle is itself a finding worth reporting.'
        },
        {
          id: 'i04-l01-q3',
          type: 'scenario',
          prompt:
            'Your target IPA contains PlugIns/ShareExt.appex with its own Info.plist requesting location usage. What scope and testing implications follow?',
          hint: 'Extensions are separate binaries. Which module\u2019s surface does this extend, and where does its data go?',
          explanation:
            'The share extension is a distinct attack surface: its own plist (permissions, schemes), own binary, own handling of user-shared content. Test its input handling (module i16) and where it writes (app group container, module i13). Also a privacy observation: location in a share extension may exceed the feature\u2019s purpose.'
        },
        {
          id: 'i04-l01-q4',
          type: 'mcq',
          prompt: 'Which bundle entry tells you the app\u2019s distribution channel before you run anything?',
          options: [
            'Info.plist\u2019s CFBundleVersion',
            'The presence/absence of embedded.mobileprovision',
            'Assets.car metadata',
            'The localization folder names'
          ],
          answerIndex: 1,
          hint: 'Recall module i01: which channel\u2019s builds carry no profile at all?',
          explanation:
            'Store builds have no embedded.mobileprovision; dev/ad-hoc/enterprise builds do — and its contents name team, devices and entitlements. One file lookup answers the channel question.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Bundles and bundle identifiers (app bundle structure)',
          url: 'https://developer.apple.com/documentation/bundleresources',
          note: 'Official bundle structure reference'
        },
        {
          title: 'Apple Developer — Configuring your app bundle',
          url: 'https://developer.apple.com/documentation/xcode/configuring-your-app-bundle',
          note: 'What belongs in the bundle and how resources are organized'
        },
        {
          title: 'OWASP MASTG — iOS Basic Security Testing (IPA acquisition and structure)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s IPA handling chapters mirror this workflow'
        }
      ]
    },
    {
      id: 'i04-l02',
      moduleId: 'i04',
      title: 'Info.plist Deep Dive',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i04-l01'],
      objectives: [
        'Decode and read a binary Info.plist fluently',
        'Extract every security-relevant key class: identity, permissions, URL types, ATS, background modes',
        'Turn plist observations into testable claims and report lines'
      ],
      diagram: 'ios-ats-decision',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Info.plist is the app\u2019s identity card and configuration manifest in one file: who the app is, what it declares it may do, which permissions it will request, which URLs it opens, and where it has opted out of platform defaults. It is the highest information-density file in the bundle and the first thing a competent tester reads in full. Most keys are marketing (display names); a disciplined subset is pure test guidance.'
          }
        ],
        technical: [
          { type: 'h', text: 'Reading it' },
          {
            type: 'terminal',
            title: 'Decoding the compiled plist',
            lines: [
              '$ plutil -p Payload/TargetApp.app/Info.plist | head -40',
              '{',
              '  CFBundleIdentifier => "com.target.app"',
              '  CFBundleShortVersionString => "3.2.1"',
              '  CFBundleVersion => "418"',
              '  MinimumOSVersion => "16.0"',
              '  NSCameraUsageDescription => "Scan payment QR codes"',
              '  NSLocationWhenInUseUsageDescription => "Find nearby branches"',
              '  CFBundleURLTypes => [ { CFBundleURLSchemes => [ "targetapp", "fb1234567890" ] } ]',
              '  NSAppTransportSecurity => { NSAllowsArbitraryLoads => 1 }',
              '  UIBackgroundModes => [ "fetch", "remote-notification" ]',
              '  UIApplicationSceneManifest => { ... }',
              '}'
            ]
          },
          { type: 'h', text: 'The key classes that matter to a tester' },
          {
            type: 'list',
            items: [
              'Identity: CFBundleIdentifier (unique app id — everything keys off it), CFBundleShortVersionString/CFBundleVersion (evidence labeling), MinimumOSVersion (support window)',
              'Permissions: NS*UsageDescription strings — the prompts TCC will show; their wording is a privacy-scope observation',
              'URL handling: CFBundleURLTypes (custom schemes) — the deep link surface (module i16)',
              'Associated domains: com.apple.developer.associated-domains entitlement (in the profile) pairs with universal links — but plist hints (UISupportedScenes etc.) frame scene handling',
              'ATS: NSAppTransportSecurity dict — exceptions to TLS defaults; every entry is a claim to evaluate (below)',
              'Background modes: UIBackgroundModes — fetch/audio/location/voip: predicts background behavior to exercise dynamically',
              'Scene/lifecycle: UIApplicationSceneManifest — scene-based delegates (affects module i02/i11 hook targets)',
              'Exported document/intent handlers: CFBundleDocumentTypes, UISupportedExternalDocumentTypes — additional invocation surface'
            ]
          },
          { type: 'h', text: 'ATS, read like an auditor' },
          {
            type: 'diagram',
            id: 'ios-ats-decision',
            caption: 'Every ATS key is a developer decision to weaken a default. Audit each one for justification.'
          },
          {
            type: 'p',
            text:
              'Apple\u2019s App Transport Security defaults are strict: TLS 1.2+, forward secrecy, SHA-256 signatures. Exceptions exist per domain (NSExceptionDomains), for web content, and for local networking — all legitimate in specific cases. The audit question is never "is there an exception?" but "is each exception still justified, and does it cover more than it should?" NSAllowsArbitraryLoads = 1 in a modern app is almost never justifiable and weakens every connection — typically a reportable MASVS-NETWORK finding with a one-line fix.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The plist is your dynamic test planner: URL schemes pre-load deep link tests; background modes pre-load background-behavior tests; permission strings pre-load privacy tests',
              'Permission wording vs actual behavior is a classic privacy finding: "Find nearby branches" prompts that also enable background tracking',
              'Version metadata anchors evidence: every screenshot/capture gets labeled with the plist\u2019s version pair',
              'ATS findings are configuration findings — the cheapest severity-per-paragraph in the report'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'NSAllowsArbitraryLoads or broad NSExceptionDomains (wildcards, http-only exceptions)',
              'Schemes that collide with system or competitor apps (first-come registration matters — module i16)',
              'Missing usage descriptions for APIs the code visibly calls (crash-on-first-use paths)',
              'UIBackgroundModes the feature set does not obviously need',
              'Legacy keys (UIRequiresFullScreen, obsolete iPhone idioms) hinting at old code paths with old assumptions'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'plutil -p the Info.plist (and every .appex inside PlugIns/) — extensions have their own plists with their own claims',
              'Transcribe five lists: schemes, permissions, ATS exceptions, background modes, document types',
              'For each list entry, write one testable claim ("scheme targetapp:// reaches a router; test parameter injection")',
              'Cross-check code reality: does the binary call APIs matching every declared permission? does it call APIs with NO declared permission (crash paths)?',
              'Carry the claims into modules i13–i17 where they become executed tests'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The plist is a contract',
            text:
              'Everything Info.plist declares is a promise to the platform and the user; everything it omits but the code does anyway is a bug. Reading the plist against the code catches both directions.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One plist, three findings. Reading a target\u2019s plist: (1) NSAllowsArbitraryLoads = 1 — MASVS-NETWORK configuration finding; proxy observation shows the app\u2019s first-party API still uses TLS, so impact phrased as "weakened baseline + permissive policy" rather than "plaintext traffic". (2) CFBundleURLSchemes includes "pay" — a generic scheme likely colliding with other apps\u2019 registrations on a fresh install; deep link hijack test planned (module i16). (3) NSLocationAlwaysAndWhenInUseUsageDescription says "find nearby branches", while UIBackgroundModes includes "location" — background location beyond stated purpose; privacy finding pending runtime confirmation (module i13). One file, three report lines, before launch.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'plutil is the workhorse on macOS (plutil -p to print, -convert xml1 to transform). Cross-platform: Python\u2019s plistlib reads binary plists; MobSF-style analyzers automate the sweep. Keep raw outputs — plists are evidence artifacts and should be attached to findings as-is.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading only the main app\u2019s plist and skipping extensions\u2019 — their claims differ and matter',
              'Reporting "ATS exceptions exist" without evaluating each one — per-domain exceptions for legacy endpoints can be legitimate',
              'Assuming declared schemes are reachable from browsers — Safari restricts some schemes; test invocation contexts properly (module i16)',
              'Forgetting that missing usage descriptions crash on first API use — that crash is a finding (fail-closed platform behavior, bad app config)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run plutil -p on your training app\u2019s Info.plist and produce the five lists. Then write the three best testable claims it generated and one thing you expected to find but did not (absence is information: no schemes = no deep link surface; no ATS keys = full ATS defaults apply).'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Info.plist is identity + permissions + URL surface + ATS policy + background promises — read it in full',
            'Extensions carry their own plists — always transcribe those too',
            'ATS exceptions are audited claims, not trivia; NSAllowsArbitraryLoads is a finding in nearly all modern apps',
            'The plist pre-loads your dynamic test plan — every key class maps to a later module\u2019s tests'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i04-l02-q1',
          type: 'mcq',
          prompt: 'Which Info.plist key class declares the custom URL schemes an app can receive?',
          options: ['CFBundleDocumentTypes', 'CFBundleURLTypes', 'UIBackgroundModes', 'NSAppTransportSecurity'],
          answerIndex: 1,
          hint: 'Which key\u2019s name literally says URL types?',
          explanation:
            'CFBundleURLTypes (each entry holding CFBundleURLSchemes) declares schemes; the system routes matching URLs to the first registered handler. Document types cover files, background modes cover background execution.'
        },
        {
          id: 'i04-l02-q2',
          type: 'truefalse',
          prompt: 'NSAllowsArbitraryLoadsInWebContent weakens TLS enforcement for the app\u2019s native networking to the same degree as NSAllowsArbitraryLoads.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is the scope difference between the two keys?',
          explanation:
            'False. InWebContent applies only to WebKit content; ArbitraryLoads lifts the baseline for all connections. Scope determines impact — read the exact key, not just "an ATS exception exists".'
        },
        {
          id: 'i04-l02-q3',
          type: 'scenario',
          prompt:
            'A permission string says "We use your location to show nearby stores," and UIBackgroundModes contains "location". What is the claim, and what dynamic evidence would confirm or refute abuse?',
          hint: 'The prompt is the promise; background mode is the capability. What would you observe at runtime?',
          explanation:
            'Claim: background location may exceed the stated purpose. Evidence: runtime observation (logs/privacy indicators — the status-bar arrow, Console location events, or container artifacts showing periodic location writes while backgrounded). If background use only serves the stated feature, the finding is downgraded to a privacy note; if not, it is a reportable privacy issue.'
        },
        {
          id: 'i04-l02-q4',
          type: 'mcq',
          prompt: 'Why must you also read PlugIns/*.appex Info.plists during triage?',
          options: [
            'To verify the main app\u2019s version matches',
            'Because extensions are separate surfaces with their own schemes, permissions and ATS policy',
            'Because the App Store requires it',
            'To extract icons for the report'
          ],
          answerIndex: 1,
          hint: 'What did module i02 establish about how extensions execute?',
          explanation:
            'Extensions run as their own processes with their own configuration. Their permission strings, URL handling and ATS exceptions are independent claims — and common blind spots because teams forget they exist.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Information property list key reference',
          url: 'https://developer.apple.com/documentation/bundleresources/information_property_list',
          note: 'The canonical key catalog — bookmark it'
        },
        {
          title: 'Apple Developer — Preventing insecure network connections (ATS)',
          url: 'https://developer.apple.com/documentation/security/preventing-insecure-network-connections',
          note: 'ATS semantics and the documented exception keys'
        },
        {
          title: 'Apple Developer — Requesting authorization for location services',
          url: 'https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services',
          note: 'Permission strings and the always/when-in-use model behind the privacy finding pattern'
        }
      ]
    },
    {
      id: 'i04-l03',
      moduleId: 'i04',
      title: 'Hands-On: Extracting and Triaging a Complete Bundle',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['i04-l01', 'i04-l02'],
      objectives: [
        'Execute the full bundle triage workflow end to end',
        'Produce a structured bundle inventory suitable for report scoping',
        'Identify which artifacts deserve deeper static analysis in module i08'
      ],
      diagram: 'ios-static-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Lessons teach; workflows build competence. This lesson is the first full workflow of the academy: from IPA file to written inventory. It deliberately uses only unzipping, plutil, file and grep — the depth tools (strings over binaries, entitlements, Mach-O inspection) arrive in module i08. Do it once slowly and it becomes a five-minute routine forever.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-static-workflow',
            caption: 'The static pipeline — this lesson covers steps 1–3; modules i08–i09 own the rest.'
          },
          { type: 'h', text: 'The workflow' },
          {
            type: 'terminal',
            title: 'Bundle triage, end to end',
            lines: [
              '$ mkdir triage && cd triage && cp ~/Downloads/TargetApp.ipa .',
              '$ shasum -a 256 TargetApp.ipa > evidence-hashes.txt',
              '$ unzip -q TargetApp.ipa -d ipa/',
              '$ APP=ipa/Payload/TargetApp.app',
              '$ file $APP/TargetApp',
              'TargetApp: Mach-O 64-bit executable arm64',
              '$ plutil -p $APP/Info.plist > evidence-info-plist.txt',
              '$ ls $APP/Frameworks $APP/PlugIns 2>/dev/null | tee evidence-embedded.txt',
              '$ find $APP -name "*.plist" -not -name "Info.plist" | tee evidence-config-plists.txt',
              '$ find $APP -name "*.json" -o -name "*.sqlite*" -o -name "*.cer" -o -name "*.pem" | tee evidence-config-other.txt',
              '$ plutil -p $APP/config/environments.json 2>/dev/null || head -50 $APP/config/environments.json'
            ]
          },
          { type: 'h', text: 'What each step produced' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Evidence hashes: the IPA\u2019s identity for your report (reproducibility)',
              'Binary type confirmation: arm64 device slice confirmed — simulator slices would say x86_64 or arm64-sim',
              'Info.plist transcription: your five lists from the previous lesson',
              'Embedded binary inventory: frameworks and extensions to triage independently',
              'Config sweep: plists/JSON/SQLite/certs shipped in the bundle — read each one',
              'First config read: environments-style files usually answer API topology immediately'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Training targets only',
            text:
              'Run this workflow against training apps (OWASP MASTestApp-iOS, crackmes licensed for practice) or engagement IPAs you are authorized to hold. Downloading and unpacking arbitrary third-party store apps may violate store terms and local law even for "just looking" — the technique is identical on legitimate targets, so practice on those.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The inventory document is the engagement\u2019s scope spine: binaries to reverse, configs to read, extensions to test, schemes to poke',
              'Hashes + version strings make every later finding reproducible ("validated against SHA-256 ab12…, build 418")',
              'Time discipline: full triage should take 20–30 minutes; anything slower means you are reading decompiled code too early — module i08 fixes the order'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Config files with credentials, internal hostnames, or feature flags controlling security behavior',
              'Certificates shipped for pinning — note them for module i14 (extracting pins/CA sets is a later workflow)',
              'HTML/JS bundles that will run inside WebViews (module i17 targets)',
              'Multiple architecture slices or fat binaries — note which slices exist (module i09 explains why)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The deliverable of this lesson is the inventory itself. Structure: (1) header — app name, bundle id, versions, IPA hash, date, source/channel of the IPA; (2) binaries table — path, type (file output), notes; (3) config artifacts — path, one-line content summary, sensitivity flag; (4) plist-derived lists — schemes, permissions, ATS, background modes; (5) open questions for later modules. Two pages is plenty; completeness beats length. You will reuse this exact document in module i08\u2019s static sweep and cite it in module i24\u2019s report.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Excerpt of a finished inventory (training app). Binaries: TargetApp (arm64), SDKs: Analytics.framework, PinningLib.framework; PlugIns: ShareExt.appex. Config: config/environments.json (3 API bases incl. staging — sensitive), resources/pinset.json (pinning pins — note for i14), db/seed.sqlite (seed data — low sensitivity). Plists: 2 schemes (targetapp, targetappcard), 4 permissions, ATS: NSAllowsArbitraryLoadsInWebContent. Open questions: does ShareExt write to app group? (i13/i16), does PinningLib wrap SecTrust? (i14), staging reachability? (authorized check only). That document ran the next three modules.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'No new tools — discipline is the tool. (shasum/unzip/file/plutil/find/grep.) On Windows/Linux, equivalent: certutil/Get-FileHash, Expand-Archive/unzip, file from Git Bash, and Python plistlib for binary plists.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping the hash — you cannot later prove which build produced which finding',
              'Triage-decompiling the main binary before reading configs — configs answer topology in minutes; decompilation is module i09\u2019s deep work',
              'Forgetting extensions\u2019 plists and configs — the sweep must cover PlugIns/ too',
              'Treating the inventory as throwaway — it is the scoping artifact your report cites'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the inventory document for your training app, following the structure above. Then answer: which single artifact would you analyze next, and which module teaches that analysis? If your answer names a module from the skill tree (i08 strings, i09 Mach-O, i13 container, i14 network), the curriculum is integrating — that is the point of the exercise.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Hash → unzip → identify → plists → configs → embedded binaries: the fixed triage order',
            'The inventory document is the scoping spine for static, dynamic and network work',
            'Twenty minutes of disciplined triage replaces hours of aimless decompilation',
            'Every artifact you cite in findings should trace back to this inventory'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i04-l03-q1',
          type: 'mcq',
          prompt: 'Why hash the IPA before anything else?',
          options: [
            'Virus scanners require it',
            'It establishes the exact artifact identity for reproducible evidence',
            'It decrypts FairPlay-protected binaries',
            'It reveals the provisioning profile'
          ],
          answerIndex: 1,
          hint: 'Evidence discipline: what must a report be able to prove about its inputs?',
          explanation:
            'Findings must be traceable to one exact artifact. The hash is that identity; versions can collide, filenames lie, hashes do not. (FairPlay decryption is a separate, out-of-scope problem — note it, do not confuse it.)'
        },
        {
          id: 'i04-l03-q2',
          type: 'truefalse',
          prompt: 'During triage, decompiling the main binary should come before reading shipped configuration files.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which activity answers API topology in minutes vs hours?',
          explanation:
            'False. Config files (endpoints, flags, pins) are minutes of reading with outsized scoping value; decompilation is deep work reserved for when static patterns (i08) and RE (i09) demand it. Order is part of the discipline.'
        },
        {
          id: 'i04-l03-q3',
          type: 'scenario',
          prompt:
            'Your triage finds resources/pinset.json with two SHA-256 hashes. What do you record now, and which later workflow consumes it?',
          hint: 'Pinning data is static evidence of a network control. Which module evaluates pinning?',
          explanation:
            'Record: the file, its hashes, and the guess that it feeds certificate pinning (with the SDK that likely loads it). Module i14\u2019s network workflow evaluates pinning strength dynamically (interception behavior) — the pinset is the map of what to expect.'
        },
        {
          id: 'i04-l03-q4',
          type: 'mcq',
          prompt: 'Which item does NOT belong in the triage inventory document?',
          options: [
            'Bundle binaries and their file types',
            'Speculation about exploitable memory corruption',
            'ATS exceptions and URL schemes',
            'The IPA\u2019s SHA-256 and source channel'
          ],
          answerIndex: 1,
          hint: 'The inventory is scope and facts — what belongs to later analysis phases?',
          explanation:
            'Exploitability claims need RE evidence (i09) and validation — inventory records observed facts and open questions. Mixing speculation into scoping artifacts corrupts the report chain.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTestApp-iOS (training app)',
          url: 'https://github.com/OWASP/MASTestApp-iOS',
          note: 'OWASP\u2019s iOS test app — the intended practice target for this workflow'
        },
        {
          title: 'plutil manual page',
          url: 'https://www.unix.com/man-page/osx/1/plutil/',
          note: 'Local reference for the plist workhorse used throughout'
        },
        {
          title: 'OWASP MASTG — iOS Basic Security Testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s acquisition/triage chapters formalize this workflow'
        }
      ]
    }
  ]
};
