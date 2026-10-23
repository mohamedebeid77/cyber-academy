import type { Module } from '../../../../types';

// LEVEL 0 — PLATFORM FOUNDATIONS · Module i01: iOS & App Security Fundamentals
// Original curriculum content synthesized from public official sources:
// Apple Platform Security, Apple Developer documentation, OWASP MASTG v2.
// All prose is original; reference links point to the official sources used for study.

export const i01: Module = {
  id: 'i01',
  title: 'iOS & App Security Fundamentals',
  level: 0,
  description:
    'Start from zero: what iOS actually is, why the platform defends itself the way it does, how apps legally reach devices, and what all of this means for a penetration tester. This module builds the vocabulary and mental model every later module depends on.',
  outcomes: [
    'Explain the iOS security philosophy: locked boot, mandatory signing, sandboxing, hardware-backed secrets',
    'Describe the layers of the iOS platform from silicon to app and where a tester interacts with each',
    'Distinguish the distribution channels (App Store, TestFlight, developer-signed builds) and their testing implications',
    'Articulate precisely why iOS testing differs from Android testing, without treating that as a reason to skip one',
    'Set correct expectations for what an authorized iOS assessment can and cannot touch'
  ],
  lessons: [
    {
      id: 'i01-l01',
      moduleId: 'i01',
      title: 'What Is iOS and Why It Defends Itself So Aggressively',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: [],
      objectives: [
        'Describe the iOS platform stack from hardware to third-party apps',
        'Explain the secure boot chain and what "immutable root of trust" means in practice',
        'Reason about why the platform design constrains how you test apps'
      ],
      diagram: 'ios-platform-stack',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS is the operating system Apple ships on iPhone and iPad: a Darwin-based (XNU kernel) platform that runs natively compiled applications in extremely tight confinement. Every third-party app you will ever test is a sandboxed process, signed with Apple-issued credentials, loaded by a kernel that verifies signatures on every execution. That last sentence is the single most important fact of this academy: on iOS, "run something you modified" is not a given — it is something you must actively engineer for.'
          },
          {
            type: 'p',
            text:
              'Compare this with what a desktop or even Android mindset assumes. There is no general-purpose file manager over the system, no sideloading arbitrary apps by default, no root shell that is part of the product. Apple treats the device as a sealed appliance: the platform is the threat model, and third-party apps are treated as untrusted by default. As a penetration tester you inherit this posture. Your target app is sealed, its container is encrypted at rest, its API surface is curated — so your skill set must include opening sealed things on devices you are authorized to control.'
          },
          {
            type: 'p',
            text:
              'This academy exists because that skill set is learnable and structured. You will learn the platform well enough to predict where app developers make mistakes, then learn the tooling — static analysis of IPAs, Mach-O reversing, Frida instrumentation, network interception — that exposes those mistakes on authorized targets.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-platform-stack',
            caption: 'The iOS stack: every layer verifies the one beneath, and apps sit on top of enforced walls.'
          },
          { type: 'h', text: 'The platform stack, from silicon up' },
          {
            type: 'list',
            items: [
              'Secure hardware: the Boot ROM (immutable code burned into silicon), the Secure Enclave coprocessor (keys, biometrics), hardware AES engines and per-device UID keys',
              'XNU kernel: a Mach + BSD hybrid kernel; enforces code signing and hosts the mandatory access control hooks the sandbox and AMFI use',
              'System daemons: securityd (keychain broker), AMFI (code signing and entitlement enforcement), trustd (certificate evaluation), SpringBoard (app launch)',
              'Cocoa Touch frameworks: UIKit, SwiftUI, Foundation, Security, CryptoKit, WebKit — the API surface apps actually call',
              'Third-party app: your test target — one sandboxed process plus one data container'
            ]
          },
          { type: 'h', text: 'Secure boot: the chain of trust' },
          {
            type: 'diagram',
            id: 'ios-secure-boot',
            caption: 'Each boot stage verifies the next. The Apple Root CA public key is fused into silicon.'
          },
          {
            type: 'p',
            text:
              'Power-on executes the Boot ROM, which cannot be changed without replacing the chip. It contains Apple\u2019s root public key and will only boot firmware Apple signed. iBoot (the bootloader) is verified next, then the kernel, then every system component. The result: by the time your target app launches, the entire platform beneath it is in a state Apple cryptographically vouched for. Two consequences for you as a tester. First, the platform itself is effectively out of scope — you cannot, and should not try to, "break iOS" during an app assessment. Second, any modification to your target app breaks its signature, which is why re-signing becomes a core skill later in this curriculum.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Everything in this module is there to calibrate your expectations. On a mobile assessment the client pays you to evaluate the app, not the operating system. The platform\u2019s walls tell you where to look for app mistakes: because the sandbox blocks casual data theft between apps, an app that leaks its own tokens to its logs, its caches or its pasteboard is often the entire finding. Because code signing blocks patching, your dynamic analysis toolkit centers on instrumentation (Frida) rather than repackaging — until you deliberately learn re-signing in module i22.'
          },
          {
            type: 'list',
            items: [
              'Platform wall → consequence: sealed boot → you test apps, not iOS itself',
              'Platform wall → consequence: mandatory signing → modified apps must be re-signed',
              'Platform wall → consequence: sandbox → cross-app leaks need an app bug; look at the app\u2019s own container',
              'Platform wall → consequence: no default sideload → acquiring the IPA is itself a technique (module i08)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Apps that fight the platform: storing secrets outside the Keychain "because keychain is annoying"',
              'Debug leftovers: get-task-allow entitlements, test URLs, mock endpoints compiled into release builds',
              'Version drift: behavior that differs between simulator, device build and App Store build',
              'Assumptions of secrecy that the platform does not actually provide (plists are not encrypted; strings are readable)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scope discipline starts here',
            text:
              'Every technique in this academy presumes you are testing an app you own, a deliberately vulnerable training app, or an engagement with explicit written authorization. Platform-level attacks against iOS, or testing apps you have no permission to assess, are out of scope — permanently.'
          },
          {
            type: 'p',
            text:
              'There is nothing to run in this lesson; instead, build the reflex that replaces it. When you later meet any iOS behavior, ask the calibration questions below. They are the frame every lab in this academy will hang on.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Which layer owns this behavior: Apple hardware, iOS itself, or the app\u2019s code?',
              'If the app is responsible, what did it choose: storage location, crypto, network policy, permission handling?',
              'What evidence would prove the choice is wrong — a file, a log line, a captured request, a decompiled function?',
              'Would this finding survive on the client\u2019s production build, or only in my instrumented lab copy?'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A concrete first glimpse of the model at work. Two apps on the same iPhone — call them A and B. App A saves a session token with UserDefaults (which lands in a plain plist inside its container). App B is sandboxed to its own container and cannot read A\u2019s plist; the platform wall holds. But A\u2019s owner plugs the phone into a computer: Finder backup (unencrypted) copies A\u2019s container to the host, plist included, token in plaintext. The platform wall did not fail — the app made a storage decision that fails a realistic threat. That is exactly the shape of finding you will learn to produce: precise about who failed (the app), respectful of what held (the platform), and honest about the attacker position (local backup access).'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Nothing to install yet — but four names you will meet constantly, so meet them now: Xcode (the Apple IDE, the basis of the toolchain), Frida (runtime instrumentation), Burp Suite / mitmproxy (traffic interception), Ghidra (disassembly and decompilation). Each gets its own module. A usable workstation is a Mac — module i07 explains why and where the workarounds are.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating "iOS is secure" as "iOS apps are secure" — the platform merely concentrates the attack surface in app decisions',
              'Planning Android-style testing (adb everywhere, easy sideload, root by default) and discovering on day one that none of it transfers',
              'Blaming the platform in reports: "iOS allowed it" is almost never accurate; the app opted in, and that phrasing matters for remediation',
              'Ignoring distribution channel: TestFlight and developer-signed builds often carry debug entitlements App Store builds do not — findings must be validated against the shipped variant'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'A no-device exercise to lock in the model. Fetch the OWASP MASTG iOS index (link in references) and skim only the section titles. For each title, write one line: which layer (Apple platform vs app code) the test mostly interrogates. You will notice almost every test interrogates app code operating inside Apple\u2019s walls — that observation is the thesis of this academy, and noticing it yourself makes it stick.'
          },
          {
            type: 'p',
            text:
              'Second exercise: draw the platform stack from memory — five layers, one line each about what verifies what. If you can do this cold, you are ready for the rest of the curriculum.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'iOS is a sealed, signature-enforcing, sandboxed platform — the boot chain verifies every stage from silicon up',
            'The platform is not your test target; the app\u2019s decisions inside the platform\u2019s walls are',
            'Every platform wall reshapes your methodology: acquisition, patching and instrumentation all need deliberate techniques',
            'Findings should read as "the app chose X, which fails threat Y" — never "iOS is broken"'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i01-l01-q1',
          type: 'mcq',
          prompt: 'What makes the Boot ROM the "root of trust" of an iPhone?',
          options: [
            'It is encrypted with the strongest available algorithm',
            'It is immutable silicon code that contains Apple\u2019s root public key and only boots Apple-signed firmware',
            'It downloads fresh certificates from Apple on every boot',
            'It is signed by the Secure Enclave at manufacturing time'
          ],
          answerIndex: 1,
          hint: 'Think about what "burned into silicon" implies about modification, and what must be stored there for verification to start.',
          explanation:
            'The Boot ROM cannot be updated (it is mask ROM), and it contains the Apple Root CA public key. Every subsequent stage is verified against that anchor, so trust starts in hardware, not in any mutable storage an attacker could rewrite.'
        },
        {
          id: 'i01-l01-q2',
          type: 'truefalse',
          prompt: 'On iOS, modifying an app binary and running it again is possible without any extra steps, because iOS re-checks signatures only at install time.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Recall the lesson: signature enforcement is continuous, not a one-time gate.',
          explanation:
            'False. XNU/AMFI verify code signatures whenever pages of code are loaded or executed, not merely at install. Patched binaries are invalid code and will be killed — which is why re-signing is a mandatory skill for patch-based testing.'
        },
        {
          id: 'i01-l01-q3',
          type: 'scenario',
          prompt:
            'During an authorized assessment you find the target app stores a bearer token in a UserDefaults plist. A colleague says "iOS is sandboxed, so this is not exploitable." Evaluate that claim.',
          hint: 'Think about who else can reach the app\u2019s container besides other apps.',
          explanation:
            'The claim confuses two attacker positions. Other apps cannot read the container — the sandbox holds. But backups (unencrypted), malware running with device access on a jailbroken device, physical access scenarios, and cloud backup flows can reach the data. The finding stands as an app-level storage decision failing a realistic threat; severity is argued via those positions, not dismissed by the sandbox.'
        },
        {
          id: 'i01-l01-q4',
          type: 'mcq',
          prompt: 'Which statement best describes the tester\u2019s relationship to iOS platform security on an app assessment?',
          options: [
            'The platform is the primary target, since all data ultimately sits in it',
            'The platform defines constraints you must understand; findings are almost always app decisions that fail a threat',
            'Platform controls can be assumed bypassed, so reports should ignore them',
            'Platform security only matters if the device is jailbroken'
          ],
          answerIndex: 1,
          hint: 'What does the client actually pay you to assess — and what makes a finding actionable for their developers?',
          explanation:
            'The platform is context, not target. Understanding it tells you what should hold, so that when data leaks you can attribute the failure to an app decision — which is the actionable, fixable finding the client needs.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — Secure boot chain',
          url: 'https://support.apple.com/guide/security/secure-boot-chain-sec575b4fdc2/web',
          note: 'Apple\u2019s own description of the boot chain of trust — the canonical source for this lesson'
        },
        {
          title: 'OWASP MASTG — iOS platform overview',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The testing guide this academy synthesizes; skim the index as instructed in Try It'
        },
        {
          title: 'Apple Platform Security guide',
          url: 'https://support.apple.com/guide/security/welcome/web',
          note: 'Master reference for every platform control named in this module'
        }
      ]
    },
    {
      id: 'i01-l02',
      moduleId: 'i01',
      title: 'The iOS Trust Model and Its Security Boundaries',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['i01-l01'],
      objectives: [
        'Separate platform security, app security, developer configuration, user privacy and tester assumptions',
        'Explain the trust relationships: Apple → platform, developer → app, user → device',
        'Use the boundary model to attribute findings correctly'
      ],
      diagram: 'ios-security-boundaries',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Security conversations go wrong when "who is responsible" is muddled. iOS testing stays honest by keeping five zones apart: Apple\u2019s platform security, the app\u2019s own code, the developer\u2019s configuration, the user\u2019s privacy settings, and the tester\u2019s assumptions. A token in a plist is an app-code decision. An ATS exception is configuration. A camera prompt is privacy. A jailbroken test device is a tester assumption. Findings live in zones two and three; the others are context that makes the findings arguable and fixable.'
          },
          {
            type: 'p',
            text:
              'The model also predicts where bugs hide. Apple\u2019s zone is audited by armies; developer configuration is a checkbox in Xcode, and app code is written under deadline. You are hunting where the ritual attention is thinnest — precisely because the platform is so strong that developers quietly assume it does their security for them. It does not: it enforces walls, and every wall has a door the developer chose to leave open, keyed by an API decision.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-security-boundaries',
            caption: 'Five zones of responsibility. Findings live in zones 2 and 3; the rest is calibrated context.'
          },
          { type: 'h', text: 'What each zone owns' },
          {
            type: 'list',
            items: [
              'Platform (Apple): secure boot, code signing enforcement, sandbox, Secure Enclave, TCC plumbing. Practically unbreakable during an assessment; treat as fixed',
              'App code: authentication logic, storage choices, crypto usage, WebView handling, deep link routing. The main hunting ground',
              'Developer configuration: Info.plist keys, ATS exceptions, entitlements, keychain accessibility classes. Cheap to get wrong, easy to spot statically',
              'User privacy (TCC): permission prompts and their revocation. Testing verifies the app handles grants and denials sanely and minimizes data',
              'Tester assumptions: your own device control, legitimate acquisition of the app, written authorization for network interception and target APIs'
            ]
          },
          { type: 'h', text: 'Trust flows' },
          {
            type: 'p',
            text:
              'Apple trusts developers only through credentials: signing certificates tied to a team, provisioning profiles that bind one app identity to a set of granted capabilities. The user trusts the platform to enforce what the App Review process promised. The tester stands outside this chain by design: on an authorized engagement you act as a malicious-but-authorized party for the app, which is why your device and copy of the app must be legitimately yours — the authorization letter replaces the trust you deliberately do not extend.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'In reporting, the boundary model becomes the severity argument. "Token stored in UserDefaults" is a data point; "token recoverable from an unencrypted backup on any computer the user syncs with" is a finding, and it is argued entirely within zones 2–3. The model also keeps you from two classic mistakes: reporting platform behavior as a vulnerability (zones 1 and 4 working as intended) and missing configuration findings because they look too "small" — an NSAllowsArbitraryLoads exception can matter more than a decompiled crypto bug, because it weakens every connection the app makes.'
          },
          {
            type: 'list',
            items: [
              'Attribute before you write: name the zone that failed',
              'Severity flows from reachable attacker positions: local attacker, network attacker, malicious app, malicious web content, physical access',
              'Configuration findings often have the best cost-to-fix ratio in the whole report'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Zone 2 smells: client-side "admin" flags, secrets in logs, custom crypto, weak pinning bypasses',
              'Zone 3 smells: ATS arbitrary-load exceptions, get-task-allow in release builds, over-broad keychain access groups, NSAllowsArbitraryLoadsInWebContent without need',
              'Zone 4 handling: what does the app do when the user denies a permission — crash, degrade, or silently fall back to weaker behavior?',
              'Zone 5 leakage: tester tooling (proxy CA, Frida gadget) accidentally left in the artifact you deliver'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The test in this lesson is documentation discipline. Before any technical work on an engagement (or lab), write five lines — one per zone — stating what you assume and what you will verify in that zone. For a lab it takes two minutes; on an engagement it becomes the scope and ROE skeleton. Every later module will refer back to this structure: static analysis interrogates zones 2–3 in the bundle, dynamic analysis interrogates zone 2 at runtime, network testing interrogates the app-to-API trust transition, and so on.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The five-zone habit',
            text:
              'Write the five zones at the top of your notes for every target. Any observation that does not map to a zone is usually either platform trivia or a bug in your own tooling — not a finding.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One artifact, four zone readings. You find the string "NSAllowsArbitraryLoads = 1" in the target\u2019s Info.plist. Zone 3: the developer globally opted out of Apple\u2019s transport security defaults — a configuration decision. Zone 2: inspecting the code shows the exception exists "for the analytics SDK", while first-party API traffic also flows without the defaults — an app-code failure to scope the exception. Zone 4: none (no user-facing permission involved). Zone 5: none — you read this from the shipped binary, no lab assumptions. The report now has one finding with two fix options (scope the exception per domain; or segment analytics traffic), both actionable. That is the model doing its job.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Zone 3 is the most "toolable" zone: plutil (decode Info.plist), codesign (dump entitlements), and later Frida for runtime confirmation of what configuration actually does. You will meet each in its own module; the habit to build now is that a single plist or entitlements dump can carry a disproportionate share of the report.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting zone 1 behavior as a finding ("iOS allows apps to keep screen on" is not a vulnerability)',
              'Folding zone 4 into zone 2: a permission prompt is the user\u2019s trust decision; the finding is what the app does with the granted data',
              'Silently expanding zone 5 mid-engagement: new techniques need new authorization, not improvisation',
              'Mixing zones in severity: "critical because sandbox" claims collapse under the first competent rebuttal'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take the example finding above (ATS arbitrary loads) and write the finding in four sentences: what failed, in which zone, which attacker position reaches it, and one concrete fix. Then invert it: write a report line that wrongly blames zone 1, and note why it would be rebutted. You are rehearsing the writing skill as much as the testing skill — module i24 will formalize it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Five zones: platform, app code, developer configuration, user privacy, tester assumptions',
            'Findings live in the app-code and configuration zones; the rest calibrates them',
            'Every finding should name its zone, its reachable attacker position and a fix',
            'The strongest iOS findings are usually cheap developer mistakes, not exotic platform defeats'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i01-l02-q1',
          type: 'mcq',
          prompt: 'An app sets NSAllowsArbitraryLoads = YES in its Info.plist. Which zone does this failure belong to?',
          options: ['Platform security (Apple)', 'App code logic', 'Developer configuration', 'User privacy / TCC'],
          answerIndex: 2,
          hint: 'Where is that key set, and who chooses to set it?',
          explanation:
            'Info.plist keys are build configuration: the developer opted out of ATS defaults. The code\u2019s handling of traffic is a separate zone-2 question that may compound it, but the exception itself is configuration.'
        },
        {
          id: 'i01-l02-q2',
          type: 'truefalse',
          prompt: 'A user denying camera permission, after which the app still functions but without the camera feature, indicates a privacy-zone finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Denial handling that degrades gracefully is what TCC is designed to produce.',
          explanation:
            'False. Graceful degradation on denial is correct behavior. A finding would be the opposite: crashes on denial, or the app silently recording through a different channel — that is where privacy-zone issues live.'
        },
        {
          id: 'i01-l02-q3',
          type: 'scenario',
          prompt:
            'You want to run Frida against the target app on your own lab device. Which zone does this requirement belong to, and what must be in place before you start?',
          hint: 'Whose assumptions allow you to instrument the app at all?',
          explanation:
            'Tester assumptions (zone 5). You need: a device you legitimately control, an app copy legitimately obtained (your own build, a training app, or engagement scope), and written authorization if the app talks to a backend you will also touch. The technical setup comes later — the authorization comes first.'
        },
        {
          id: 'i01-l02-q4',
          type: 'mcq',
          prompt: 'Which phrasing is the strongest, most defensible finding statement?',
          options: [
            'iOS failed to protect the token',
            'The app stores its session token in an unencrypted plist, which is included in unencrypted Finder backups; any computer used for syncing exposes it',
            'The sandbox is bypassable, so token storage does not matter',
            'The developer used UserDefaults, which is always a critical vulnerability'
          ],
          answerIndex: 1,
          hint: 'The best finding names the failure, the reachable attacker, and implies the fix — without overclaiming.',
          explanation:
            'Option 2 attributes the failure to the app\u2019s storage decision and articulates the attacker position that makes it matter. Option 1 misattributes to the platform, option 3 dismisses a real exposure, option 4 overclaims severity without an attacker model.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — System security overview',
          url: 'https://support.apple.com/guide/security/system-security-secf5708b5ca/web',
          note: 'How Apple partitions platform responsibility — useful mirror for the zone model'
        },
        {
          title: 'OWASP MASVS v2 (requirements standard)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The requirement categories (STORAGE, CRYPTO, AUTH…) map naturally onto zones 2–3'
        },
        {
          title: 'OWASP MASWE (weakness catalog)',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'Named weaknesses — most are zone 2/3 failures; useful vocabulary for reports'
        }
      ]
    },
    {
      id: 'i01-l03',
      moduleId: 'i01',
      title: 'How Apps Reach Devices: Distribution Channels and What They Mean for Testing',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['i01-l01'],
      objectives: [
        'Describe the App Store review and signing pipeline',
        'Distinguish TestFlight, developer-signed and enterprise distribution',
        'Predict how each channel changes entitlements, debuggability and finding validity'
      ],
      diagram: 'ios-codesign-chain',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'On Android you can install almost any APK from anywhere; the signature is self-asserted. iOS inverts this: every install path funnels through Apple-issued credentials, and the channel determines what the app is allowed to do and what you are allowed to do to it. Understanding channels is therefore not trivia — it decides where your test build comes from, which entitlements you will see, and whether your findings transfer to production.'
          }
        ],
        technical: [
          { type: 'h', text: 'App Store' },
          {
            type: 'p',
            text:
              'The developer uploads a build; Apple re-signs every app with its own signature for distribution, applies automated and human review against published guidelines, and serves it through the App Store. Consequences you can rely on: App Store builds are release builds — no get-task-allow debug entitlement, no readable debug logs, aggressive optimization. When your report says "the shipped app leaks X", it is this variant you validated against.'
          },
          { type: 'h', text: 'TestFlight' },
          {
            type: 'p',
            text:
              'Apple\u2019s beta pipeline: still Apple-signed, still reviewed (lighter process), time-limited (90-day builds), and used for both external and internal testers. TestFlight builds are close to store builds in signing posture, which makes them a legitimate acquisition path during engagements when the client provides access.'
          },
          { type: 'h', text: 'Developer-signed builds (ad hoc / development)' },
          {
            type: 'p',
            text:
              'Built and signed by the developer\u2019s identity with a provisioning profile listing specific device UDIDs (or registered devices in development). These builds frequently carry the get-task-allow entitlement — which is what makes debugger attach (LLDB, Xcode) and non-jailbreak Frida instrumentation possible. For a tester, a development build is the most convenient target, but findings must be re-validated against the store variant exactly because entitlements differ.'
          },
          { type: 'h', text: 'Enterprise (in-house) distribution' },
          {
            type: 'p',
            text:
              'Apple\u2019s Developer Enterprise Program lets organizations distribute internally without the store, using enterprise-signed builds. Testing these is common in corporate engagements. Note the trust shape: the enterprise certificate is the only gate — historically abused, hence Apple\u2019s tight auditing — and profiles can carry entitlements a store build would never receive.'
          },
          {
            type: 'diagram',
            id: 'ios-codesign-chain',
            caption: 'Whichever channel you use, the signature chain ends at Apple\u2019s root — channel differences live in the profile, not the root.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Acquisition: which channel can you legitimately obtain? Store builds need device extraction techniques (module i08); TestFlight and dev builds are handed to you by the client',
              'Entitlements: dev builds often debuggable (get-task-allow); store builds are not — this single difference decides your Frida strategy (module i11)',
              'Parity: any finding found in a dev or TestFlight build must state which build type it was validated on',
              'Re-signing later: understanding channels is understanding what you must reproduce when you re-sign a patched build in module i22'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'embedded.mobileprovision inside the IPA — it names the channel: store builds do not carry one, dev/ad-hoc/enterprise builds do',
              'get-task-allow in an otherwise production-looking build: debug leftovers that also happen to be your testing blessing',
              'Provisioning profile expiry and device lists — useful for inventorying what the client actually ships internally',
              'Enterprise builds behaving differently from store builds (feature flags, endpoints) — differences are findings material'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Ask the client which channels the engagement covers; get TestFlight access or an ad-hoc IPA in writing',
              'If only the store build is in scope, plan acquisition from your own device (module i08 shows how)',
              'Before dynamic work, dump the embedded.mobileprovision and entitlements — that tells you immediately whether non-jailbreak instrumentation is possible',
              'Record build channel, version and profile expiry in your evidence log for every artifact you test'
            ]
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Findings travel badly across channels',
            text:
              'A crash or leak you trigger in a development build may not exist in the store build (stripped symbols, different flags, removed debug code). Always re-validate headline findings against the channel your report claims to cover.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Typical engagement flow. The client grants TestFlight access for release-candidate 1.4.2 and also provides an ad-hoc IPA of the same commit. Triage shows the ad-hoc profile contains get-task-allow — so Frida can attach on a non-jailbroken device for the dynamic phase. Two findings (insecure plist storage, weak pinning bypass logic) are discovered there. Both are then re-validated on the TestFlight build via network observation only (no instrumentation possible) and hold. The report cites: "validated on ad-hoc build 1.4.2 (get-task-allow present) and confirmed on TestFlight RC via traffic analysis." That single sentence is the difference between a report a client trusts and one they dispute.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Tools that make channels concrete: security/cms or openssl (inspect the profile\u2019s CMS envelope), plutil (read the extracted embedded.mobileprovision once decoded), and Xcode\u2019s Devices window (which shows installed profiles per device). Module i06 turns these into a full workflow.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing only a dev build and reporting findings as production issues without re-validation',
              'Assuming TestFlight builds equal store builds — review passes differ and flags can differ',
              'Treating an enterprise profile as "more trusted" — it is only a different gate, and often a looser one',
              'Forgetting profile expiry: a lab install can silently die mid-assessment when the 7-day free profile lapses'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'If you have any signed IPA (even a training app), extract it (module i04 does this properly) and look for Payload/*.app/embedded.mobileprovision. If present, note: team name, profile type, creation and expiry dates, and the entitlements block. Write two sentences on what this build is allowed to do that a store build would not be. If the file is absent, you are holding a store-signed build — note that too; absence is information.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'All distribution flows through Apple-issued credentials; the channel decides entitlements and review depth',
            'Store/TestFlight = Apple-signed release posture; dev/ad-hoc = developer-signed, often debuggable; enterprise = internal gate',
            'get-task-allow is the hinge for non-jailbreak instrumentation — check it before planning Frida work',
            'Record channel + build for every validated finding; re-validate headline findings on the shipped channel'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i01-l03-q1',
          type: 'mcq',
          prompt: 'Which distribution channel typically produces builds with the get-task-allow entitlement?',
          options: ['App Store release builds', 'Development / ad-hoc builds', 'TestFlight builds', 'All channels equally'],
          answerIndex: 1,
          hint: 'Which channel exists specifically so developers can debug on devices?',
          explanation:
            'Development and ad-hoc provisioning enables debugging (that is its purpose). Store and TestFlight builds are stripped of debug entitlements. Enterprise builds depend on the profile but are usually release-style.'
        },
        {
          id: 'i01-l03-q2',
          type: 'truefalse',
          prompt: 'App Store builds are signed by the developer\u2019s certificate, just like ad-hoc builds.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who actually applies the final signature for store distribution?',
          explanation:
            'False. Apple re-signs store distribution builds. The developer\u2019s signature gets the app into Apple\u2019s pipeline; the artifact users download carries Apple\u2019s store signature — one reason embedded.mobileprovision is absent from store IPAs.'
        },
        {
          id: 'i01-l03-q3',
          type: 'scenario',
          prompt:
            'Your client gives you only a development build. You find sensitive data in app logs on that build. What must you do before reporting it?',
          hint: 'What could differ about logging between this build and the store build?',
          explanation:
            'Re-validate on the shipped channel (store or TestFlight). Debug builds often log what release builds strip. If the store build shows the same behavior via observable evidence (file contents in the container, on-device logs), the finding holds; otherwise it is a build-pipeline finding, reported as such.'
        },
        {
          id: 'i01-l03-q4',
          type: 'mcq',
          prompt: 'What is the fastest static signal that an IPA came from enterprise or ad-hoc distribution rather than the App Store?',
          options: [
            'The presence of an embedded.mobileprovision file in the .app bundle',
            'The size of the Mach-O binary',
            'The presence of Assets.car',
            'The bundle identifier prefix'
          ],
          answerIndex: 0,
          hint: 'Which file exists only when a specific profile authorized this exact build?',
          explanation:
            'Store builds carry no provisioning profile — Apple\u2019s signature replaces that trust path. Ad-hoc, development and enterprise builds all embed embedded.mobileprovision naming the team, devices (where applicable) and entitlements.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Distributing your app to registered devices',
          url: 'https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices',
          note: 'Official ad-hoc/development distribution semantics'
        },
        {
          title: 'Apple Developer — App Store distribution',
          url: 'https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-release',
          note: 'Store and TestFlight pipelines from the build-signing perspective'
        },
        {
          title: 'Apple Developer Enterprise Program',
          url: 'https://developer.apple.com/programs/enterprise/',
          note: 'In-house distribution program rules and trust model'
        }
      ]
    },
    {
      id: 'i01-l04',
      moduleId: 'i01',
      title: 'Android vs iOS for the Pentester: A Conceptual Map',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['i01-l01'],
      objectives: [
        'Compare the two platforms at the architecture, package, runtime and tooling level — conceptually, not by importing Android content',
        'Predict which iOS skills are analogous to Android ones and which are genuinely new',
        'Avoid the common transfer mistakes Android-experienced testers make on iOS'
      ],
      diagram: 'ios-vs-android',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'If you come from Android testing (or from this platform\u2019s sibling academy), half of your instincts transfer: methodology, threat modeling, API testing, storage discipline. The other half actively misleads you: everything touching packaging, signing, rooting and runtime instrumentation works differently. This lesson is the map of what transfers, what translates, and what is new — and a promise that this academy stays fully iOS-native from here on; no Android lessons are folded into it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-vs-android',
            caption: 'Ten axes of comparison. Conceptual orientation only — each iOS side gets its own deep module.'
          },
          { type: 'h', text: 'What translates almost 1:1' },
          {
            type: 'list',
            items: [
              'Methodology: scope, threat model, evidence, reporting — platform-agnostic professionalism',
              'API/backend testing: BOLA, token handling, authorization on the server side',
              'Storage reasoning: "where does the secret land, who can read it" — only the file names change',
              'Network testing: TLS, pinning, proxy discipline — the concepts are identical, the enablement differs'
            ]
          },
          { type: 'h', text: 'What translates with translation' },
          {
            type: 'list',
            items: [
              'Package analysis: APK → IPA; AndroidManifest.xml → Info.plist; DEX → Mach-O; smali → ARM64 disassembly',
              'Frida: the tool is the same, but getting it onto the device is a different art (jailbreak server vs gadget re-signing)',
              'Root → Jailbreak: same concept, entirely different engineering, device support and legal-physical constraints'
            ]
          },
          { type: 'h', text: 'What is genuinely new' },
          {
            type: 'list',
            items: [
              'Mandatory code signing with Apple-issued credentials — patching without re-signing is impossible, full stop',
              'The Secure Enclave and hardware key hierarchy as a first-class part of app security',
              'macOS as a de-facto workbench requirement, and the simulator-vs-device distinction being sharper than Android\u2019s emulator',
              'Objective-C\u2019s dynamic runtime, which makes runtime hooking (and class/method enumeration) far richer than the Java-native equivalent'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Use the map to sequence your learning. If you know Android testing, your backend and methodology skills mean modules i14/i15/i24 will feel familiar at the concept level — go deep on i04–i09 (packaging, signing, static, Mach-O) and i11–i12 (iOS-specific instrumentation) instead. If you are new to mobile entirely, this curriculum is self-contained: the comparison exists only to orient you, and every iOS concept is taught from zero in its own module.'
          },
          {
            type: 'list',
            items: [
              'Transfer trap 1: expecting adb-like shell access — iOS offers nothing equivalent without jailbreak',
              'Transfer trap 2: expecting decompilation to readable source — native ARM64 means Ghidra work, not JADX one-clicks',
              'Transfer trap 3: expecting free instrumentation — plan the jailbreak/gadget decision explicitly (module i07)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Client teams that assume "mobile" is one discipline: iOS-specific risks (ATS, keychain accessibility, universal links) are usually absent from Android-derived test plans',
              'Apps sharing a backend with an Android sibling: compare authorization behavior across clients — server-side flaws often surface first on whichever client your tooling reaches deeper',
              'Your own report language: "like on Android" is not an explanation on an iOS engagement'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'A paper exercise, because this lesson is a map, not a technique. Take any Android pentest checklist you know (or the Android academy\u2019s methodology module) and mark every line: T (transfers), R (translates — write the iOS equivalent), N (new — leave blank to fill during this curriculum). Keep the sheet; module i24 revisits it when you assemble the full iOS methodology, and the completed sheet is proof of how much is genuinely iOS-native.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Separate academies, by design',
            text:
              'This academy keeps its curriculum, labs, progress and references fully independent — the same engine, entirely separate content. The comparison here is the only deliberate overlap, because orientation is worth one lesson.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One worked row of the map: certificate pinning. On Android: OkHttp CertificatePinner or NSC-style config, bypass typically via Frida hooking TrustManagerImpl. On iOS: URLSession delegate challenge handling or a third-party pinning library; bypass typically via Frida hooking SecTrustEvaluateWithError or the delegate\u2019s challenge completion. The finding category (weak pinning) transfers; the enforcement API, the hook target and the evidence format are iOS-native. Every skill in this academy gets that treatment: same question, different machinery — and the machinery is what modules i06–i19 teach.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Tooling crossover: Frida, Burp/mitmproxy, Ghidra and Python tooling are shared with Android work — your muscle memory is useful. iOS-native additions you will meet: Xcode/xcrun, ldid, codesign, otool/nm/strings, class-dump-family tools, and pymobiledevice3 for device communication without Xcode.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Porting Android tooling assumptions: adb, apktool, JADX and rooted-by-default emulators have no direct iOS counterpart',
              'Concluding "iOS is harder" rather than "iOS is differently gated" — the gating is learnable, and much of it (re-signing, gadget) is mechanical once understood',
              'Writing iOS findings in Android vocabulary ("content provider exposure" does not exist here; the analogs are deep links and extensions)',
              'Skipping this platform because a client\u2019s user base is "mostly Android" — the remaining devices are where the paid assessments are'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Do the T/R/N marking exercise above with at least fifteen checklist lines. Anything you cannot classify yet gets marked "?" — by module i24 you should have zero "?" left, and that progress is itself a measurable outcome of this academy.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Methodology, API and storage reasoning transfer; packaging, signing, rooting and runtime tooling do not',
            'The genuinely new pillars: mandatory signing, Secure Enclave, macOS-centered tooling, the dynamic ObjC runtime',
            'This academy remains fully iOS-native; the comparison exists to orient, not to mix content',
            'Translate findings into iOS vocabulary — reports that say "like on Android" are not evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i01-l04-q1',
          type: 'mcq',
          prompt: 'Which pairing correctly matches Android and iOS package concepts?',
          options: [
            'AndroidManifest.xml ↔ embedded.mobileprovision',
            'classes.dex ↔ the main Mach-O executable',
            'resources.arsc ↔ _CodeSignature',
            'APK ↔ Payload directory'
          ],
          answerIndex: 1,
          hint: 'Which iOS artifact contains the app\u2019s compiled code the way DEX does?',
          explanation:
            'classes.dex (bytecode) maps to the main Mach-O binary (native ARM64 code). The manifest\u2019s closest analog is Info.plist; resources.arsc maps to asset catalogs/car files; the APK maps to the IPA (whose Payload/ is just a directory inside it).'
        },
        {
          id: 'i01-l04-q2',
          type: 'truefalse',
          prompt: 'On iOS, the closest analog of Android\u2019s exported-component abuse (implicit intents, content providers) is the family of deep links, universal links, extensions and WebView bridges.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What are the mechanisms by which iOS apps expose functionality to other apps and content?',
          explanation:
            'True — with different mechanics. iOS apps expose surface through URL schemes, universal links, App Extensions, pasteboard and JavaScript bridges rather than exported components; the "untrusted caller reaches sensitive functionality" pattern is the shared root, and module i16 covers the iOS-native versions.'
        },
        {
          id: 'i01-l04-q3',
          type: 'scenario',
          prompt:
            'A client asks why the iOS assessment costs more than the Android one "for the same app." Give the two most honest technical reasons.',
          hint: 'Think about tooling enablement and what happens between "have IPA" and "run instrumented build".',
          explanation:
            'First, enablement: macOS/Xcode-centric tooling, device acquisition from store builds, and the jailbreak-vs-gadget decision add engineering steps with no Android analog. Second, analysis: native ARM64 Mach-O means disassembly/decompiler work instead of one-click DEX decompilation, which raises the cost of deep code review. Both are labor realities, not padding — and both are exactly what this academy trains down to routine.'
        },
        {
          id: 'i01-l04-q4',
          type: 'mcq',
          prompt: 'Which skill should an Android-experienced tester deliberately refresh rather than reuse on iOS?',
          options: [
            'Threat modeling the backend API',
            'Writing reproducible finding evidence',
            'Assuming root-equivalent shell access for runtime inspection',
            'Proxying HTTPS traffic with a CA certificate'
          ],
          answerIndex: 2,
          hint: 'Which of these four does iOS simply not offer by default, in any form?',
          explanation:
            'There is no default shell-access channel on iOS: no adb shell equivalent, no rooted emulator. Runtime inspection is gated by signing (debug entitlement) or jailbreak — the decision between those paths is a core iOS-specific skill taught in modules i07 and i11.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS vs Android testing (platform chapters)',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The MASTG keeps platform chapters separate — mirroring this academy\u2019s separation principle'
        },
        {
          title: 'Apple Developer — iOS technology overview',
          url: 'https://developer.apple.com/documentation/technologies',
          note: 'The API landscape you will map Android concepts onto'
        },
        {
          title: 'Frida documentation',
          url: 'https://frida.re/docs/home/',
          note: 'The one major tool both platforms share — worth reading platform-specific pages side by side'
        }
      ]
    }
  ]
};
