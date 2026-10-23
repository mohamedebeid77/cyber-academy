import type { Module } from '../../../../types';

// LEVEL 3 — TEST ENVIRONMENT · Module i07: The iOS Testing Environment
// Original content synthesized from Apple Developer documentation, tool
// documentation (Xcode, pymobiledevice3, Burp, mitmproxy) and OWASP MASTG.

export const i07: Module = {
  id: 'i07',
  title: 'The iOS Testing Environment',
  level: 3,
  description:
    'Build the workbench: why macOS anchors iOS testing, what Xcode and its command-line tools give you, the honest differences between simulator, physical device and jailbroken device, and the proxy/certificate setup that makes network testing possible.',
  outcomes: [
    'Set up a macOS workbench with Xcode, command-line tools and device communication tooling',
    'Choose the right environment per task, with accurate statements of what each can and cannot do',
    'Install and verify HTTPS interception on device and simulator, with honest notes on pinning behavior'
  ],
  lessons: [
    {
      id: 'i07-l01',
      moduleId: 'i07',
      title: 'The macOS Workbench: Xcode and the CLI Toolchain',
      difficulty: 'Beginner',
      minutes: 22,
      prerequisites: ['i06-l02'],
      objectives: [
        'Explain why macOS is the practical anchor for iOS testing',
        'Install and use the core toolchain: Xcode, CLT, xcrun/devicectl, simctl',
        'Communicate with and install apps on device and simulator from the command line'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS testing is macOS-anchored not by marketing but by mechanics: the signing tools, the device protocols, the simulator and the debugger are Apple-built and ship with Xcode. A Mac (or a well-prepared VM you are licensed to run) plus free tooling covers the majority of this curriculum; this lesson builds that base and names the few corners where non-macOS workflows substitute.'
          }
        ],
        technical: [
          { type: 'h', text: 'The stack, bottom up' },
          {
            type: 'list',
            items: [
              'Xcode: IDE, SDKs, simulator runtime, device debugger plumbing. The one heavyweight install you cannot skip (App Store or developer download)',
              'Command Line Tools (xcode-select --install): git, clang and friends when you do not need full Xcode — but the simulator and device tooling live in Xcode itself',
              'xcrun: the umbrella over developer tools — xcrun simctl (simulator control), xcrun devicectl (Xcode 15+: install/launch/manage apps on device)',
              'libimobiledevice / pymobiledevice3: open-source device protocols (idevice* tools, scriptable Python) — cross-platform and automatable, complements Xcode rather than replacing it',
              'Frida tooling, Burp/mitmproxy, Ghidra: platform-independent, install on the same workbench (their own modules cover them)'
            ]
          },
          { type: 'h', text: 'Device communication, three ways' },
          {
            type: 'terminal',
            title: 'The commands you will type weekly',
            lines: [
              '# Xcode 15+ device tooling',
              '$ xcrun devicectl list devices',
              '$ xcrun devicectl device install apps --device <UDID> TargetApp.ipa',
              '$ xcrun devicectl device process launch --device <UDID> com.target.app',
              '# Simulator control',
              '$ xcrun simctl list devices available',
              '$ xcrun simctl install booted TargetApp.ipa',
              '$ xcrun simctl launch booted com.target.app',
              '# Open-source alternative (any OS, scriptable)',
              '$ pymobiledevice3 apps list',
              '$ pymobiledevice3 apps install TargetApp.ipa',
              '$ pymobiledevice3 syslog live --process com.target.app'
            ]
          },
          { type: 'h', text: 'What the toolchain buys you per environment' },
          {
            type: 'p',
            text:
              'Simulator: install any build you can compile/obtain for simulator slices, instant snapshots, full file access — but it is a macOS process running iOS APIs, not iOS itself (next lesson formalizes the differences). Physical device: install dev-signed builds via devicectl/Xcode (profile must include your device), browse dev-build containers, view logs. Jailbroken device: everything plus root SSH and system-level tools (module i20). Note the division of labor: devicectl/simctl install and launch; your proxy sees traffic; Frida/LLDB (later modules) look inside.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'CLI-first muscle: every lab in this academy scripts its setup — devicectl/simctl/pymobiledevice3 make environments reproducible and evidence machine-collectible',
              'Free Apple accounts can sign to real devices (7-day profiles) — enough for the whole curriculum\u2019s labs without a paid developer account',
              'pymobiledevice3 gives cross-platform (Windows/Linux) device workflows: syslog, backup, process lists — useful when the workbench is a VM',
              'Tool failures (device not listed, profile rejection) diagnose in minutes once you know which layer owns what — this lesson is that map'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Which slice your IPA carries before installing to simulator (arm64-sim/x86_64) vs device (arm64) — module i09 reads this from the Mach-O',
              'Developer Mode state on iOS 16+ devices — devicectl installs fail without it (Settings → Privacy & Security → Developer Mode)',
              'Xcode version vs iOS version pairings — very new iOS devices may require updated Xcode for debugger plumbing',
              'Trust prompt state: an untrusted device connects for charging but refuses tooling until trusted'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Install Xcode (and accept license: xcodebuild -license); verify xcrun --version',
              'Boot a simulator, install your training IPA, launch it — the full simctl loop above',
              'Connect a physical device, enable Developer Mode, trust the host, verify xcrun devicectl list devices shows it',
              'Install the training app on device (free-account signing if needed — Xcode handles it when you open a trivial project for the device, or use an existing dev-signed build from the app\u2019s authors)',
              'Stream device logs for the app (Console.app or pymobiledevice3 syslog) while exercising it — your first dynamic evidence'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'One command to memorize',
            text:
              'xcrun devicectl device process launch --device <UDID> <bundle-id> — launching under CLI control (rather than tapping icons) is the backbone of scripted dynamic testing and Frida spawn workflows later.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A reproducible lab bootstrap. One shell script: simctl boot a named simulator; simctl install the training app; simctl launch; open Burp; start a log capture file. Every lab in modules i10–i17 starts from an environment one script rebuilds in sixty seconds. When an experiment corrupts state, you do not debug the mess — you re-run the script. Testers who keep environment-as-code finish labs in half the time and produce cleaner evidence; this lesson\u2019s commands are the vocabulary that script is written in.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Xcode (the anchor), xcrun simctl/devicectl (built-in), libimobiledevice/pymobiledevice3 (cross-platform device protocols), plus the workbench apps (Burp/mitmproxy/Ghidra/Frida) installed now so later modules only configure, not install. Hardware note: any recent Mac suffices; VMs work with USB-passthrough caveats for physical devices.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping Xcode entirely on Linux/Windows-only benches and expecting full parity — device debugging and simulator require macOS; pymobiledevice3 covers device protocols, not everything',
              'Forgetting Developer Mode on iOS 16+ — install failures with clear-but-easy-to-miss messaging',
              'Confusing simulator slices with device slices when installing — file/otool on the binary tells you which you are holding',
              'Not scripting the environment — every lab restarts from clicks instead of commands, and evidence loses reproducibility'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write your bootstrap script (install/launch/log-capture for one simulator and one device target) and run it end to end once. Keep it in your lab folder — you will extend it with the proxy step next lesson and with Frida in module i11. The deliverable is the script, not the app: environments as code is the working habit.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'macOS anchors the toolchain; Xcode provides simulator, device plumbing and signing context',
            'devicectl/simctl install, launch and manage; pymobiledevice3 adds cross-platform scripting',
            'Free-account signing (7-day profiles) is sufficient for the entire lab curriculum',
            'Environment-as-code: script install/launch/log-capture once, reuse everywhere'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i07-l01-q1',
          type: 'mcq',
          prompt: 'Which tool installs and launches an app on a physical device from the command line (Xcode 15+ era)?',
          options: ['adb install', 'xcrun simctl install', 'xcrun devicectl device install apps', 'idevicesyslog'],
          answerIndex: 2,
          hint: 'Which tool family targets physical devices rather than simulators?',
          explanation:
            'xcrun devicectl is Xcode 15+\u2019s device CLI (install apps, launch processes, manage devices). simctl is the simulator twin; libimobiledevice/pymobiledevice3 provide cross-platform equivalents.'
        },
        {
          id: 'i07-l01-q2',
          type: 'truefalse',
          prompt: 'A paid Apple Developer account is required to install and test apps on your own physical iPhone for this curriculum\u2019s labs.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does free-account provisioning allow, and what is its time limit?',
          explanation:
            'False — free accounts can provision devices for personal testing (7-day profile expiry, limited app ids). Paid accounts add longer profiles, push and advanced capabilities — useful, not required here.'
        },
        {
          id: 'i07-l01-q3',
          type: 'scenario',
          prompt:
            'xcrun devicectl installs fail on an iOS 17 device that appears in the list. Name the first three things to check.',
          hint: 'Trust, Developer Mode, profile/device pairing — which order resolves fastest?',
          explanation:
            '(1) Developer Mode enabled on the device (iOS 16+ requirement); (2) device trusted for this host (Trust This Computer prompt); (3) the build\u2019s provisioning includes this device / is signed with a valid identity. Each layer fails distinctly — checking in that order resolves most installs in minutes.'
        },
        {
          id: 'i07-l01-q4',
          type: 'mcq',
          prompt: 'Why script the environment (install/launch/log capture) instead of doing it by hand each lab?',
          options: [
            'Scripted installs bypass signature checks',
            'Reproducibility: identical state rebuilds in seconds and evidence collection is consistent',
            'Scripts are required by devicectl',
            'It is faster to decompile without a device'
          ],
          answerIndex: 1,
          hint: 'What does an experiment-then-reset loop need?',
          explanation:
            'Labs are experiments; experiments need clean resets. Environment-as-code gives deterministic state and consistent evidence (commands and outputs are the log). Nothing about scripting changes platform security — it changes your throughput and rigor.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — devicectl (Xcode 15 device command line)',
          url: 'https://developer.apple.com/documentation/devicectl',
          note: 'Official device CLI reference'
        },
        {
          title: 'Apple Developer — simctl (simulator command line)',
          url: 'https://developer.apple.com/documentation/xcode/interacting-with-simulators',
          note: 'Simulator control surface'
        },
        {
          title: 'pymobiledevice3',
          url: 'https://github.com/doronz88/pymobiledevice3',
          note: 'Cross-platform device protocol implementation used throughout the labs'
        }
      ]
    },
    {
      id: 'i07-l02',
      moduleId: 'i07',
      title: 'Simulator vs Device vs Jailbroken: Choosing Honestly',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i07-l01', 'i02-l01'],
      objectives: [
        'State precisely what each environment is and is not',
        'Choose the correct environment per test type, and justify the choice in reports',
        'Understand the jailbreak decision\u2019s scope, constraints and documentation duties'
      ],
      diagram: 'ios-test-environments',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every iOS methodology failure traces back to one confusion: treating the four environments as interchangeable. The simulator is a macOS app that mimics iOS APIs; a physical device is the real platform; a jailbroken device is the real platform with weakened guarantees; research VMs are licensed specialized platforms. Choosing honestly — and documenting the choice — is what makes findings survive client review.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-test-environments',
            caption: 'The four environments side by side: what each is for, and its honest verdict.'
          },
          { type: 'h', text: 'Simulator: fast triage, never proof' },
          {
            type: 'list',
            items: [
              'A macOS process executing simulator-slice binaries; no Secure Enclave, different file system layout, no code-signing enforcement as devices apply it, host CA trust semantics differ',
              'Excellent for: static triage of sim builds, UI automation, quick network observation, iterating without device friction',
              'Never valid for: platform-behavior claims (keychain, data protection, TCC, snapshot handling), findings about production binaries, any "the device would too" argument',
              'Store IPAs often cannot run unmodified in the simulator (no simulator slice) — extraction-to-simulator is a separate research workflow, not the default path'
            ]
          },
          { type: 'h', text: 'Physical device (non-jailbroken): the standard' },
          {
            type: 'list',
            items: [
              'Real platform, real enforcement; dev-signed builds attach debuggers and Frida (get-task-allow), store builds do not',
              'Excellent for: dynamic testing of dev/TestFlight builds, container pulls via backup/Xcode, network testing with installed CA (unless pinning), TCC/data-protection behavior',
              'Limits: no root file system access, no system-wide runtime inspection of store builds, proxy CA refused by pinning apps'
            ]
          },
          { type: 'h', text: 'Jailbroken device: deep runtime, weaker guarantees' },
          {
            type: 'list',
            items: [
              'Adds: SSH/root file system, frida-server against ANY app (store builds included), system tweak injection, direct keychain/database access',
              'Costs: platform guarantees are void on that device (findings about "the OS would stop this" cannot be argued there), version/app-compatibility constraints, device dedication and hygiene burden',
              'Rule of use: last resort when the test requires store-build internals; document device model, iOS version, jailbreak type and tool versions in evidence'
            ]
          },
          { type: 'h', text: 'Research VMs/platforms' },
          {
            type: 'p',
            text:
              'Virtualized iOS (licensed research platforms) offers kernel-level introspection and scalability for authorized labs. Context matters: specialized commercial products with licensing conditions — not a consumer download. Position in this curriculum: know they exist, note their evidentiary caveats (virtualized platform ≠ consumer hardware), use only per their licenses.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Task→environment mapping is a report line: "static analysis on extracted IPA; dynamic on dev-signed iPhone 13 (iOS 17.4, non-jailbroken); store-build internals on jailbroken lab device (iOS 16.6, checkra1n-class)" — reviewers trust what you name',
              'Simulator "findings" (missing keychain class effects, odd CA behavior) must be re-validated on device before filing',
              'The jailbreak decision is scope, not preference: use the minimum environment that answers the question',
              'Evidence hygiene scales inversely with environment power: the more the platform is weakened, the more context your artifacts need'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Reports (yours or others\u2019) citing simulator-only evidence for device claims — the classic reviewer rejection',
              'Jailbroken-lab findings presented without platform context — ambiguous severity and wrong remediation follow',
              'Client constraints that change the map: MDM-managed test devices, no-jailbreak policies — the methodology adapts, and the report states it',
              'Pinning behavior differences per environment (user-CA trust semantics differ) — network tests must state which environment produced each capture'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The deliverable is a decision table for your current target. Rows: each test in scope (storage sweep, network interception, deep link fuzzing, store-build runtime inspection…). Columns: environment chosen, why, what it cannot show there. Two minutes per row now saves days of re-validation later. Example row: "Keychain accessibility behavior — physical dev-signed device — real enforcement — cannot show store-build keychain behavior; that row needs jailbroken device if in scope." Writing the cannot column is the honesty mechanism this lesson exists to install.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Jailbreak ethics, stated once',
            text:
              'Jailbreaking your own lab device for authorized testing is a legitimate research practice. The constraints this curriculum enforces: never present jailbroken-device behavior as platform behavior; never test third-party apps on it without authorization; keep the device dedicated and updated as your tooling requires. Modules i20–i22 expand the technical landscape with the same posture.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One question, two environments, one honest answer. Question: does the app leak tokens in device backups? Simulator: meaningless (no backups of the relevant kind, different trust stores). Dev-signed device: backup via Finder — plist token found: finding confirmed for dev-build configuration. Store build: same test needs a store build\u2019s container — backup works the same way (container data is signed-build data), so the finding generalizes with a note. Contrast with "does the store build call API X under condition Y?" — needs runtime inspection → jailbroken device (store build) or the client\u2019s dev build for a proxy-able answer. Same discipline: name the environment, state what transfers, mark what does not.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Simulator: Xcode (built-in). Device: devicectl/Xcode/pymobiledevice3, Finder backups. Jailbroken: package managers (Sileo/Zebra era), SSH, frida-server — module i20 covers selection and setup honestly. Research platforms: licensed vendors — named here for completeness, not instructions.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating simulator results as device results (keychain, TCC, snapshots, CA trust all differ materially)',
              'Defaulting to jailbreak when a dev-signed build + Frida gadget would answer the question with fewer caveats',
              'Filing store-build claims from dev-build evidence without a transferability note',
              'Not recording environment details (model, iOS version, jailbreak type, tool versions) — evidence that cannot be reproduced is decoration'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write the decision table for your training app with at least six test rows including one that needs the jailbroken column and one that must NOT use the simulator. Swap tables with a peer (or self-review tomorrow) and challenge each row\u2019s cannot column — the exercise is arguing environment honesty, not filling cells.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Simulator = fast triage, never platform proof; device = the standard; jailbreak = deep runtime with voided guarantees; research VMs = licensed specialization',
            'Every test row gets environment, why, and what it cannot show — the cannot column is the honesty mechanism',
            'Jailbreak is a scope decision with documentation duties, not a preference',
            'Environment details belong in evidence: model, iOS version, channel, tool versions'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i07-l02-q1',
          type: 'mcq',
          prompt: 'Which claim about the iOS Simulator is accurate?',
          options: [
            'It runs the same secure boot chain as a device',
            'It is a macOS process mimicking iOS APIs — keychain, TCC and hardware security differ from devices',
            'It executes store IPAs unmodified',
            'Its findings transfer to devices if the build version matches'
          ],
          answerIndex: 1,
          hint: 'What did the lesson say the simulator fundamentally is?',
          explanation:
            'The simulator executes simulator-slice binaries as macOS processes against simulated services — no Secure Enclave, different enforcement and trust semantics. Useful for triage; never a platform-behavior oracle.'
        },
        {
          id: 'i07-l02-q2',
          type: 'truefalse',
          prompt: 'On a non-jailbroken physical device, you can attach LLDB to any installed app, including store builds.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does task-port acquisition require, and which builds carry it?',
          explanation:
            'False. Attaching requires the get-task-allow entitlement (or a jailbroken environment). Dev-signed builds carry it; store builds do not — that is the whole instrumentation decision tree of module i11.'
        },
        {
          id: 'i07-l02-q3',
          type: 'scenario',
          prompt:
            'Scope requires inspecting a store build\u2019s runtime behavior (a suspected hardcoded-token refresh loop). You have a jailbroken lab device (iOS 16.6, checkra1n-class). What must the evidence record include?',
          hint: 'The environment is weakened — what context makes the artifacts trustworthy and reproducible?',
          explanation:
            'Record: device model, iOS version, jailbreak type/version, frida-server/tool versions, the app\u2019s store version/build, and the observation commands. Also note the caveat that platform guarantees are void on this device (context for interpretation, not for the app finding itself). Without this context the artifacts are unverifiable.'
        },
        {
          id: 'i07-l02-q4',
          type: 'mcq',
          prompt: 'Your client prohibits jailbroken devices but wants store-build internals assessed. Which adaptation is most honest?',
          options: [
            'Use the simulator and present findings as device behavior',
            'Test what non-jailbroken environments allow (static analysis, network behavior, dev-build proxy via client builds) and state explicitly what could not be covered',
            'Jailbreak secretly and omit it from the report',
            'Refuse the engagement entirely'
          ],
          answerIndex: 1,
          hint: 'Methodology honesty: what does the constraint actually limit?',
          explanation:
            'State the coverage boundary. Static analysis, traffic observation (modulo pinning) and dev/TestFlight-build dynamics still carry most of the assessment; the store-build runtime slice is documented as out of reach under the constraint. Clients accept honest boundaries and reject discovered dishonesty.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Running your app in Simulator or on a device',
          url: 'https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device',
          note: 'Apple\u2019s own statement of the simulator/device distinction'
        },
        {
          title: 'OWASP MASTG — iOS testing environment chapters',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s environment setup framing (jailbroken and non-jailbroken paths)'
        },
        {
          title: 'Apple Platform Security — Secure Enclave',
          url: 'https://support.apple.com/guide/security/secure-enclave-sec59b0b36f4/web',
          note: 'Why simulator-vs-device hardware claims matter for security findings'
        }
      ]
    },
    {
      id: 'i07-l03',
      moduleId: 'i07',
      title: 'Proxies, Certificates and Device Prep',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i07-l02'],
      objectives: [
        'Configure Burp/mitmproxy interception for iOS device and simulator',
        'Install and trust the proxy CA correctly per environment, with honest expectations about pinning',
        'Prepare the full device prep checklist (accounts, region, data hygiene) labs and engagements share'
      ],
      diagram: 'ios-network-intercept',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Network testing is where most mobile findings hide, and its gate is mundane: getting HTTPS traffic through your proxy without the app noticing — or noticing, correctly, because it pins. This lesson makes the gate routine: proxy config, CA installation per environment, and the device prep checklist. Pinning is not defeated here; it is documented here, and evaluated properly in module i14.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-network-intercept',
            caption: 'The interception path: app → ATS → TLS-to-proxy → API. Pinning refuses at the TLS step, by design.'
          },
          { type: 'h', text: 'Proxy configuration' },
          {
            type: 'list',
            items: [
              'Burp Suite or mitmproxy on the Mac; listener on all interfaces (0.0.0.0:8080)',
              'Device: Settings → Wi-Fi → network → Configure Proxy → Manual → Mac\u2019s IP:8080 (same LAN), or USB-mediated via pymobiledevice3/iproxy port forwarding for stability',
              'Simulator: inherits macOS system proxy settings — set the Mac\u2019s proxy while testing sims, then unset it',
              'Verify by visiting a plain HTTP and an HTTPS URL in Safari: proxy shows both; HTTPS shows the CA warning until the CA is trusted'
            ]
          },
          { type: 'h', text: 'CA installation, per environment' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Download the proxy\u2019s CA (burp: http://burp with proxy configured; mitmproxy: mitm.it)',
              'Install the profile (Settings downloads it), then Settings → General → VPN & Device Management → install the CA certificate',
              'CRITICAL extra step on iOS: Settings → General → About → Certificate Trust Settings → enable full trust for the CA — without it, user CAs exist but are not trusted for TLS',
              'Simulator: the CA install flows differently (drag profile into simulator or trust at macOS level for sim traffic) — verify empirically per setup',
              'Re-test the HTTPS URL in Safari: clean pass means interception is live'
            ]
          },
          { type: 'h', text: 'Device prep checklist (labs and engagements)' },
          {
            type: 'list',
            items: [
              'Dedicated lab Apple ID (never your personal one), region/time consistent with the target\u2019s market',
              'Developer Mode on, device trusted, dev build installed (module i07-l01 loop)',
              'Proxy CA installed AND full-trusted; screen-recording or screenshot tooling for evidence',
              'Data hygiene: factory-reset or dedicated device for engagements; no personal accounts; document iOS version',
              'Baseline capture BEFORE the target runs: confirms your proxy sees "everything else" and gives you the app\u2019s traffic delta'
            ]
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'What interception proves (and does not)',
            text:
              'A working proxy proves you can observe and manipulate traffic — the base capability for API testing (i14/i15). It does NOT mean TLS validation is broken: user-installed CAs are a legitimate device-owner capability. Pinning or validation failures are separate findings with their own evidence (i14). Keep the two claims apart in writing.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The baseline capture habit: record N minutes of idle + launch + core flows before any manipulation — the cleanest reference every later capture compares against',
              'USB-mediated proxying (iproxy/pymobiledevice3 port forwarding) survives Wi-Fi changes — engagements live on it',
              'App-by-app CA trust is not a thing (the trust toggle is global) — your evidence notes capture state per test, not per app',
              'Simulator traffic testing is fine for API-shape recon, but trust semantics differ — captures for findings come from device'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Apps that fail closed on your CA (refuse to run / API errors) — note as "TLS validation functioning"; do not assume pinning yet (i14 distinguishes)',
              'Traffic that bypasses the proxy (mDNS, QUIC/HTTP3, non-HTTP protocols) — note the transports your methodology must handle',
              'Cleartext HTTP to third-party endpoints — visible immediately in the baseline and usually a finding',
              'Proxy-visible staging/dev endpoints (from module i04\u2019s inventory) — environment sprawl is an inventory cross-check'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Stand up the proxy (Burp or mitmproxy), configure device manual proxy, install + FULL-TRUST the CA (both steps)',
              'Validate with Safari, then launch the training app and exercise login/browse — watch requests land in the proxy',
              'Produce the baseline capture file (export from the proxy) labeled with device, iOS, app version, date',
              'Break it on purpose: disable full trust for the CA and observe the app\u2019s failure mode — you are now watching TLS validation behavior, the i14 prelude',
              'Write the environment note: proxy tool/version, CA state, capture file names — the reproducibility triad'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The baseline capture\u2019s first dividend. A fintech training app\u2019s baseline (launch, idle 2 minutes, login, browse accounts) shows: 14 HTTPS requests to the production API — and one cleartext HTTP POST to a metrics endpoint containing device model, OS version and app version. No manipulation was performed; the finding fell out of the baseline\u2019s discipline (MASVS-NETWORK: cleartext transmission of non-sensitive-but-identifying telemetry — a real report line with a trivial fix). Baselines find things before you try; that is why they exist.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Burp Suite Community/Professional or mitmproxy (functionally equivalent for this curriculum; pick one and stay consistent for evidence clarity). iOS Settings for profile/trust steps. iproxy (libimobiledevice) or pymobiledevice3 for USB-mediated forwarding. Optional: a second proxy instance pinned to a port for simulator traffic to keep captures separable.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Installing the CA but skipping Certificate Trust Settings — the #1 "proxy shows nothing" cause',
              'Proxying over flaky Wi-Fi instead of USB for long sessions — capture gaps masquerade as app behavior',
              'Filing "no pinning" as a finding from a working proxy — user-CA trust is not a bypass; pinning evaluation is i14\u2019s job with its own evidence',
              'Testing on the personal Apple ID/personal device — hygiene failures are engagement-ending events; the checklist exists for that reason'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete the five-step proxy validation on your lab setup and produce the baseline capture for the training app. Then run the deliberate break (untrust the CA) and record the app\u2019s failure mode in one sentence — you have just collected your first TLS-validation-behavior evidence for module i14. Extend your bootstrap script with the proxy step so the whole loop stays reproducible.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Proxy + CA install + FULL TRUST (two steps) = interception on device; simulator inherits macOS proxy state',
            'Baseline captures before manipulation find issues by themselves and anchor all later evidence',
            'A working proxy proves observation capability, not broken validation — keep the claims separate',
            'USB-mediated proxying and labeled capture files are the engagement-stability and reproducibility habits'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i07-l03-q1',
          type: 'mcq',
          prompt: 'Your device-side CA is installed but HTTPS fails everywhere. The most likely missing step?',
          options: [
            'The proxy needs a restart',
            'Certificate Trust Settings: the CA is not enabled for full trust',
            'The app is pinning',
            'The device needs a reboot'
          ],
          answerIndex: 1,
          hint: 'iOS has a second, separate toggle beyond profile installation. Where?',
          explanation:
            'Installed user CAs are inert until enabled under General → About → Certificate Trust Settings. This two-step design is why "installed but failing" is the canonical proxy setup bug — Safari\u2019s warning vs clean pass is the tell.'
        },
        {
          id: 'i07-l03-q2',
          type: 'truefalse',
          prompt: 'If your proxy successfully shows an app\u2019s HTTPS traffic, the app\u2019s TLS validation is broken and that is a finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is the legitimate platform mechanism that lets your CA sit in the middle?',
          explanation:
            'False. Device owners may install and trust CAs — that is the platform\u2019s design for enterprises and testing. Broken validation or missing pinning are separate claims requiring their own evidence (i14); conflating capability with vulnerability is a review-killing error.'
        },
        {
          id: 'i07-l03-q3',
          type: 'scenario',
          prompt:
            'Design the baseline capture protocol for a new engagement target: what actions, what duration, what labels?',
          hint: 'Idle, launch, core flows — plus the metadata that makes it evidence.',
          explanation:
            'Protocol: configure proxy → verify with Safari → capture 2–3 min idle → launch → core flows (login, primary feature, logout) → export capture. Labels: device model/iOS, app version/build, proxy tool+version, date/time, capture file hash. The protocol is boring on purpose — its value is that every later capture has a clean reference.'
        },
        {
          id: 'i07-l03-q4',
          type: 'mcq',
          prompt: 'Why prefer USB-mediated proxying (iproxy/port forwarding) for long engagement sessions?',
          options: [
            'It bypasses pinning',
            'Stability: it survives Wi-Fi changes and drops, keeping captures continuous',
            'It is required by Burp',
            'It encrypts traffic the app cannot see'
          ],
          answerIndex: 1,
          hint: 'What breaks a multi-hour capture on a conference-room network?',
          explanation:
            'Network churn (roaming, captive portals, IP changes) silently gaps captures. USB forwarding keeps the transport stable for hours; the app-side behavior is unchanged — this is an evidence-continuity tool, not a bypass.'
        }
      ],
      references: [
        {
          title: 'PortSwigger — Installing Burp\u2019s CA certificate on iOS devices',
          url: 'https://portswigger.net/support/installing-burp-suites-ca-certificate-in-an-ios-device',
          note: 'The official two-step CA procedure for Burp'
        },
        {
          title: 'mitmproxy — iOS device setup',
          url: 'https://docs.mitmproxy.org/stable/overview-install/',
          note: 'mitm.it CA flows and platform notes'
        },
        {
          title: 'OWASP MASTG — iOS network interception setup',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s proxy configuration chapters for iOS'
        }
      ]
    }
  ]
};
