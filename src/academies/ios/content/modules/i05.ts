import type { Module } from '../../../../types';

// LEVEL 2 — THE SECURITY MODEL · Module i05: iOS Security Model
// Original content synthesized from Apple Platform Security and OWASP MASTG.

export const i05: Module = {
  id: 'i05',
  title: 'The iOS Security Model',
  level: 2,
  description:
    'The walls you test against: the app sandbox and its profile semantics, the Keychain and Data Protection as the storage trust model, and TCC privacy enforcement. Master these and every finding you file later is argued from a position of platform literacy.',
  outcomes: [
    'Explain sandbox profiles as deny-by-default policies and entitlements as sanctioned exceptions',
    'Describe the Keychain\u2019s trust model, accessibility classes and access groups',
    'Explain Data Protection classes and when data is actually cryptographically sealed',
    'Describe TCC permission enforcement and audit apps\u2019 behavior around grants and denials'
  ],
  lessons: [
    {
      id: 'i05-l01',
      moduleId: 'i05',
      title: 'The App Sandbox: Deny by Default',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i02-l01', 'i02-l03'],
      objectives: [
        'Describe what a sandbox profile permits by default and denies by default',
        'Explain entitlements as the sanctioned widening mechanism, evaluated by AMFI and the kernel',
        'Predict the practical effect of sandbox rules on your testing techniques'
      ],
      diagram: 'ios-ipc-sandbox',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every iOS app runs under a sandbox profile: a kernel-enforced policy that denies everything not explicitly allowed. Apps do not opt into the sandbox — they are born inside one, and the only way to widen it is an entitlement that the signature carries and AMFI validates. For the tester, the sandbox is the reference frame for every "could an attacker do X?" question: the answer is usually "not from outside the app — unless the app itself opened the door."'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-ipc-sandbox',
            caption: 'Apps sit in profiles; entitlements carve sanctioned exceptions; the kernel evaluates every syscall.'
          },
          { type: 'h', text: 'What the standard profile allows' },
          {
            type: 'list',
            items: [
              'Read/write inside its own data container and (with App Groups) group containers',
              'IPC to system daemons over XPC for platform services',
              'Network access (outbound) — subject to other controls',
              'Its own declared URL schemes as invocation targets, and opening URLs system-wide'
            ]
          },
          { type: 'h', text: 'What it denies' },
          {
            type: 'list',
            items: [
              'Reading or writing any other app\u2019s container',
              'Writing anywhere on the system volume or reading most of it',
              'Loading arbitrary code or injecting into other processes',
              'Direct hardware access, raw device nodes, and privileged syscalls'
            ]
          },
          { type: 'h', text: 'Entitlements: the sanctioned exceptions' },
          {
            type: 'p',
            text:
              'Entitlements are key-value capabilities embedded in the code signature: keychain access groups, app groups, associated domains, the debugging entitlement, iCloud, push. The kernel and AMFI check them at enforcement points — an API gated by an entitlement fails unless the signed binary carries it. Two facts to keep straight: entitlements are not declarations of intent (that is Info.plist) but executable permissions; and they are verified against the provisioning profile at sign time, which is why modified apps need re-signing with matching entitlements (module i22). The full signing mechanics are module i06\u2019s subject — here, keep the model: sandbox = walls, entitlements = doors, signature = the door list the system trusts.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Storage findings are argued within the container: "readable from backups" and "readable by local attacker" are the reachable positions — not "readable by other apps" (the sandbox usually holds)',
              'Entitlement dumps are first-hour recon: get-task-allow decides instrumentation strategy; keychain-access-groups predicts token sharing; aps-environment predicts push flows',
              'Jailbreak detection, anti-tamper and integrity checks are apps observing their own platform conformance — module i21\u2019s entire subject is apps measuring sandbox-consistent reality',
              'Cross-app attacks are mostly out of scope on iOS; the in-scope crossings are the sanctioned ones (URLs, pasteboard, extensions) — module i16'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Entitlements that widen surface: com.apple.security.application-groups (shared containers), keychain-access-groups (shared tokens), associated-domains (web surface)',
              'get-task-allow in production-adjacent builds — debug leftovers with testing implications',
              'Apps assuming sandbox violations will "just work" — crash logs full of sandbox denies reveal misdesigned features',
              'Documentation claims ("data of other apps cannot reach us") that actually rely on the app\u2019s own validation at sanctioned crossings — verify those crossings (module i16)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The sandbox itself is not your target — its interaction with app behavior is. The exercises that matter here are reading exercises on your training app: (1) dump entitlements (codesign -d --entitlements :- on the binary — full workflow in module i06) and classify each entitlement as widening-container, widening-network/web, widening-hardware, or debugging; (2) for each widening entitlement, name the sanctioned crossing it creates and the module that tests it (app groups → i13/i16; associated domains → i16; get-task-allow → i11). You are building the habit: every entitlement is a test plan entry.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Sandbox vs Android SELinux intuition',
            text:
              'Both deny by default, but the vocabulary differs: iOS profiles are compiled into the system with per-app parameters (container path, groups) rather than shipped per-app policy files. The practical consequence: you cannot read an app\u2019s "sandbox manifest" — you infer its walls from behavior, logs and entitlements.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Entitlement-led triage. A health app\u2019s entitlements show: aps-environment (push), com.apple.security.application-groups [group.com.health.app], keychain-access-groups [<team>.com.health.app.share], healthkit. Reading: (1) a shared keychain group means the widget/extension reads the same token store — keychain accessibility choices in the main app now govern two processes (i13); (2) an app group container exists — extension\u2019s writes land there (i13/i16); (3) HealthKit is a TCC-gated sensitive store — privacy scope question (i05-l03). No tools ran; the entitlement dump alone produced three test entries. That is sandbox literacy converting directly into scope.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'codesign (entitlement dump — formal workflow in i06), Console.app (sandbox deny lines at runtime), and later Frida for observing what the app attempts against its walls. No third-party tooling is needed to reason about the sandbox itself — the platform enforces it visibly in logs.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting "other apps could read the token" without a sanctioned crossing — on iOS that claim needs the specific mechanism, or it is wrong',
              'Confusing Info.plist permission strings (user-facing prompts) with entitlements (executable capabilities) — different files, different enforcement, different findings',
              'Assuming jailbroken-device findings transfer to stock devices — every claim must name its platform context',
              'Treating entitlements as static documentation — they bind at signature time and change with re-signing (i22)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write the sandbox sentence bank: five sentences you might use in reports, one per concept — container default, entitlement widening, signature binding, TCC being separate, jailbreak context changing guarantees. If each sentence is technically precise in one try, this lesson landed; if any wobbles, re-read its paragraph — these exact sentences are what your future findings will be made of.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Sandbox profiles deny by default; entitlements are signature-bound, AMFI-validated exceptions',
            'Container access, sanctioned crossings and debugging rights are the three widening classes that matter',
            'Every entitlement in a dump is a future test entry — classify them at triage',
            'Findings must name their platform context: stock device, dev-signed build, or jailbroken lab'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i05-l01-q1',
          type: 'mcq',
          prompt: 'Which claim about iOS app isolation is correct for stock (non-jailbroken) devices?',
          options: [
            'Apps can read other apps\u2019 Documents directories with a special entitlement',
            'App containers are mutually inaccessible except via sanctioned mechanisms (App Groups, pasteboard, URLs)',
            'Any app can read any app\u2019s UserDefaults with root privileges',
            'Keychain items are readable by all apps from the same developer website'
          ],
          answerIndex: 1,
          hint: 'What does the sandbox profile deny by default, and what are the sanctioned exceptions?',
          explanation:
            'Containers are isolated; crossings exist only through sanctioned mechanisms the developer explicitly configures (App Groups, shared keychain access groups) or platform-mediated channels (pasteboard, URLs). Claims of cross-app file reads need such a mechanism — otherwise they are wrong.'
        },
        {
          id: 'i05-l01-q2',
          type: 'truefalse',
          prompt: 'Entitlements are enforced only at install time by the App Store.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'When does the kernel/AMFI consult an entitlement — once, or at every gated operation?',
          explanation:
            'False. Entitlements are checked at enforcement points continuously — keychain access, debug attach, gated APIs. The signature carrying them is verified whenever it matters, not merely at install.'
        },
        {
          id: 'i05-l01-q3',
          type: 'scenario',
          prompt:
            'A target has keychain-access-groups [<TEAM>.com.app.shared]. Which two downstream questions does this entitlement create for your test plan?',
          hint: 'Sharing means two writers/readers. What does each process do with the shared items?',
          explanation:
            '(1) Accessibility hygiene: which accessibility classes do shared items use, and do the extension\u2019s write paths use weaker classes than the main app (i13)? (2) Extension handling: does the extension read secrets it does not need, and is its input handling a path into shared state (i16)? The entitlement created both test entries.'
        },
        {
          id: 'i05-l01-q4',
          type: 'mcq',
          prompt: 'What is the practical difference between an Info.plist NSCameraUsageDescription string and a camera-related entitlement?',
          options: [
            'No difference — both gate camera access',
            'The plist string is the user-facing prompt text (TCC layer); entitlements are executable capabilities validated by the signature (AMFI/kernel layer)',
            'Entitlements are only for Apple apps',
            'The plist string replaces the need for user consent'
          ],
          answerIndex: 1,
          hint: 'Which one does the user see, and which one does the kernel validate?',
          explanation:
            'Two layers: TCC uses the usage description for the consent prompt and revocation; entitlements are signed executable capabilities. Privacy findings live around the first; capability/behavior findings around the second.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — App sandbox',
          url: 'https://support.apple.com/guide/security/app-sandbox-sec98401149b/web',
          note: 'Apple\u2019s description of sandboxing and its enforcement'
        },
        {
          title: 'Apple Developer — Entitlements documentation',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements',
          note: 'The catalog of entitlement keys and their meanings'
        },
        {
          title: 'OWASP MASTG — iOS platform security model chapters',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s framing of sandbox/signing for testers'
        }
      ]
    },
    {
      id: 'i05-l02',
      moduleId: 'i05',
      title: 'Keychain, Data Protection and the Secure Enclave',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i05-l01'],
      objectives: [
        'Explain the Keychain as an OS-brokered encrypted store with accessibility classes and access groups',
        'Describe the four Data Protection classes and their real-world meaning',
        'Position the Secure Enclave correctly: what it protects, what it cannot do for app data'
      ],
      diagram: 'ios-keychain-dp',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS gives apps two platform-backed storage trust mechanisms: the Keychain (items encrypted by keys your app never sees, released to callers only at the right moments) and per-file Data Protection (files sealed under classes that determine when decryption keys are available). Together they define what "secure storage" even means on this platform — and most storage findings in iOS reports are, at root, apps declining to use them correctly.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-keychain-dp',
            caption: 'Keychain flow via securityd, and the four classes that decide WHEN keys are available.'
          },
          { type: 'h', text: 'Keychain mechanics that matter' },
          {
            type: 'list',
            items: [
              'Items live in a system database; the app never handles the encryption key — SecItemAdd/CopyMatching/Update/Delete via securityd',
              'Accessibility classes (kSecAttrAccessible…): WhenUnlocked, AfterFirstUnlock, WhenPasscodeSetThisDeviceOnly, and (legacy) Always — the class decides WHEN the item can be read',
              'ThisDeviceOnly variants are not migrated with backups — a deliberate choice for device-bound secrets',
              'Access groups: which apps/extensions may read an item (team-prefixed groups, App Groups)',
              'Items persist across app updates; uninstall generally removes the app\u2019s items (some special cases exist — verify empirically in labs)'
            ]
          },
          { type: 'h', text: 'Data Protection classes for files' },
          {
            type: 'list',
            items: [
              'Complete: sealed until first unlock after boot — the standard for sensitive files',
              'CompleteUnlessOpen: writable while locked (uploads/Downloads in flight), readable when unlocked',
              'CompleteUntilFirstUserAuthentication: readable after first unlock for the rest of boot — the de-facto default for many APIs; weaker than it looks',
              'None: readable only while unlocked pre-first-auth; effectively the most restrictive for cold-boot scenarios'
            ]
          },
          { type: 'h', text: 'Secure Enclave: correct positioning' },
          {
            type: 'p',
            text:
              'The Secure Enclave is a dedicated coprocessor with its own kernel and keys: it brokers device unlock secrets, biometric template matching, and supports keys marked for enclave use (P-256, non-exportable, operations inside the enclave). For app data it is not a general encrypted database — it is the hardware root that makes key material and biometric matching survivable against a compromised application processor. Tester positioning: enclave-backed keys (kSecAttrTokenIDSecureEnclave) and FaceID/TouchID integration are strong controls; the app-level failures are usually everywhere else (UserDefaults, plaintext files, weak accessibility classes) — enclave presence does not excuse them.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The iOS storage question is always: did the developer use Keychain (which class?) / protected files (which class?) / or neither?',
              'AfterFirstUnlock is the common default — fine for most data, weak for "crown jewels" that should require device unlock (WhenUnlocked) or passcode binding (WhenPasscodeSetThisDeviceOnly)',
              'Legacy kSecAttrAccessibleAlways-style choices in shipped binaries are reportable: they survive the locked-device state entirely',
              'Backup behavior follows class choices: ThisDeviceOnly items vanish in restores — a support consideration the developer chose, not an attack'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Secrets in UserDefaults/plists that belong in the Keychain (tokens, keys, passwords)',
              'Keychain usage with weak accessibility (Always, AfterFirstUnlock for high-value secrets)',
              'Files containing PII/secrets with no explicit protection class (defaults bite here)',
              'Custom "encryption" of files with hardcoded keys instead of Data Protection (module i18 deep-dives)',
              'Keychain sharing groups wider than the feature set requires'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The full dynamic workflow lives in module i13 (container pulls, keychain dumps on lab devices, backup analysis). What you can do now is static classification: search decompiled/strings output for SecItem calls and kSecAttrAccessible values, UserDefaults writes near sensitive identifiers, and file writes without protection attributes. Produce a storage-behavior table: artifact type → API used → class/absence → expected finding severity. That table drives i13\u2019s dynamic confirmation list.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Class = timing, not magic',
            text:
              'Accessibility/data protection classes answer "when is this readable", not "is this readable ever". A locked phone resists class-restricted reads; a phone the attacker holds unlocked (or the class\u2019s availability window) does not. Phrase findings in those terms and they survive review.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Contrast pair from one app. Feature A stores its refresh token via SecItemAdd with kSecAttrAccessibleWhenUnlockedThisDeviceOnly — strong: requires device unlock, never leaves the device in backups. Feature B (the shopping cart) stores the same user\u2019s auth token in UserDefaults "for quick access". Both artifacts leave the same app; one is defensible under a locked-device threat, the other is recoverable from an unencrypted backup. The report files one finding (B), cites A as the in-app exemplar of the correct fix, and remediation becomes "match feature A\u2019s pattern" — a concrete, code-level instruction developers act on immediately.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Static side: strings/grep for SecItem and kSecAttr constants; class-dump-style tools for the security wrappers apps use. Dynamic side (i13): keychain inspection on jailbroken lab devices, backup parsing, and Frida hooks on SecItemAdd/CopyMatching to log classes and items as the app runs. The Secure Enclave itself needs no tools — it is context, not target.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Claiming Keychain items are "always safe" — weak accessibility classes and over-broad access groups are real findings',
              'Reporting AfterFirstUnlock as a vulnerability by default — it is the platform-typical default; severity must argue the data\u2019s value and threat window',
              'Assuming uninstall clears all app state everywhere — test empirically on lab devices; some system-level artifacts persist',
              'Conflating Secure Enclave with the Keychain — the enclave is a coprocessor; the Keychain is a store that can use enclave-backed keys'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the two-column reference card: "Keychain accessibility classes" and "Data Protection classes", each with one line of "use for…" guidance from the developer\u2019s side and one line of "find when misused for…" from yours. Keep it next to module i13\u2019s checklist — it is the evaluation rubric you will apply to every storage artifact you pull.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Keychain: OS-brokered, app-invisible keys, accessibility classes decide availability windows, access groups decide readers',
            'Data Protection classes do the same for files; CompleteUntilFirstUserAuthentication is the weak default to notice',
            'The Secure Enclave anchors keys and biometrics — it is not app storage and does not excuse storage mistakes',
            'Most iOS storage findings are apps choosing defaults or convenience over the correct class'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i05-l02-q1',
          type: 'mcq',
          prompt: 'Which keychain accessibility class binds an item so it can only be read while the device is unlocked, and never leaves the device in backups?',
          options: [
            'kSecAttrAccessibleAlways',
            'kSecAttrAccessibleAfterFirstUnlock',
            'kSecAttrAccessibleWhenUnlockedThisDeviceOnly',
            'kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly (requires passcode presence)'
          ],
          answerIndex: 2,
          hint: 'You need two properties: readable only when unlocked, and non-migrating. Which class gives both?',
          explanation:
            'WhenUnlockedThisDeviceOnly: availability gated on unlock state; ThisDeviceOnly prevents backup migration. (WhenPasscodeSetThisDeviceOnly is stronger still — it also invalidates items if the passcode is removed — but the question\u2019s two stated properties are met by option C.)'
        },
        {
          id: 'i05-l02-q2',
          type: 'truefalse',
          prompt: 'Data Protection class CompleteUntilFirstUserAuthentication keeps a file sealed until the first unlock after every reboot.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Read the class name carefully — until FIRST user authentication, when?',
          explanation:
            'False — the class releases the key after the first unlock of the boot session and keeps it available until the next reboot. That "until first unlock only" property is Complete\u2019s; the UntilFirstUserAuthentication class is the weaker, common default.'
        },
        {
          id: 'i05-l02-q3',
          type: 'scenario',
          prompt:
            'An app stores a password-equivalent API secret in UserDefaults, arguing "the file system is encrypted by iOS anyway." Evaluate and phrase the response.',
          hint: 'What class do UserDefaults files actually get, and when is that key available?',
          explanation:
            'The argument fails on class semantics: container files typically end up under weak/default protection, available after first unlock — and the plist is additionally included in unencrypted backups. Correct response: the platform offers the Keychain with chosen accessibility precisely for secrets; UserDefaults is configuration storage. Finding stands, phrased via class timing and backup reachability.'
        },
        {
          id: 'i05-l02-q4',
          type: 'mcq',
          prompt: 'What does the Secure Enclave contribute to app security architecture?',
          options: [
            'It stores all app files encrypted',
            'It is a coprocessor brokering device secrets, biometric matching and non-exportable key operations',
            'It replaces the Keychain entirely',
            'It performs TLS termination for apps'
          ],
          answerIndex: 1,
          hint: 'Which component\u2019s whole purpose is that keys and biometric data never touch the main CPU?',
          explanation:
            'The enclave is an isolated coprocessor: device unlock secrets, biometric matching and enclave-bound keys live and operate there. The Keychain is a separate mechanism that can leverage enclave-backed keys — they are complementary, not identical.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — Keychain data protection',
          url: 'https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web',
          note: 'The canonical accessibility-class reference'
        },
        {
          title: 'Apple Developer — Item classes and keychain (SecItem)',
          url: 'https://developer.apple.com/documentation/security/keychain_services/keychain_items',
          note: 'API-level semantics of item classes and attributes'
        },
        {
          title: 'Apple Platform Security — Secure Enclave',
          url: 'https://support.apple.com/guide/security/secure-enclave-sec59b0b36f4/web',
          note: 'Enclave role and capabilities, straight from Apple'
        }
      ]
    },
    {
      id: 'i05-l03',
      moduleId: 'i05',
      title: 'Privacy and TCC: Permissions as a Security Layer',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['i04-l02'],
      objectives: [
        'Explain TCC\u2019s role: consent prompts, revocation, and API gating',
        'Audit app behavior around permission grants and denials',
        'Distinguish privacy findings from security findings without mixing severity models'
      ],
      diagram: 'ios-privacy-tcc',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'TCC (Transparency, Consent, and Control) is the layer that makes protected data user-gated: before an app touches camera, location, contacts, microphone, photos and more, the system asks the user, remembers the answer, and gates the API. For the tester, TCC defines a privacy test dimension parallel to security: does the app handle consent honestly — prompting only when needed, degrading sanely on denial, and never routing protected data around the consent layer into unprotected storage or analytics?'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-privacy-tcc',
            caption: 'TCC gates the API on the user\u2019s decision; revocation applies immediately, at any time.'
          },
          { type: 'h', text: 'How TCC works, tester-relevant slice' },
          {
            type: 'list',
            items: [
              'First use of a gated API triggers the prompt built from the app\u2019s usage-description strings (module i04-l02)',
              'Decisions persist per-permission; the user can change them in Settings at any time — apps must handle mid-session revocation',
              'Some permissions are degraded instead of binary: coarse vs fine location, limited photo access — apps must handle each level',
              'TCC is a separate enforcement layer from the sandbox: an app with camera consent is still sandboxed; a sandboxed app with no consent still cannot use the camera'
            ]
          },
          { type: 'h', text: 'The privacy test matrix' },
          {
            type: 'list',
            items: [
              'Prompt honesty: does the prompt appear at meaningful use (not at first launch "just in case"), and does its wording match actual behavior?',
              'Denial handling: crash, degrade, or silent fallback? Silent fallback to weaker behavior (e.g. manual entry that emails data) can be a finding',
              'Revocation handling: deny mid-session — does the app notice, or does it cache capability flags?',
              'Data routing: after consent, does protected data (contacts, photos, location history) get copied into unprotected storage, logs or third-party analytics?'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Privacy findings are report lines too — regulators and clients care; MASVS-PRIVACY and platform privacy guidelines frame them',
              'The prompt-then-route pattern (consent to X, then exfiltrate X\u2019s data to an unprotected sink) is the classic TCC-bypass-shaped app failure — the platform prompt held, the app defeated its purpose',
              'Permission vocabulary leaks product intent: a "flashlight" app requesting always-location is a red flag users should see — document it as such',
              'On authorized engagements you test with grants AND denials — both are security-relevant states'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'All-at-once permission demands at first launch — poor consent hygiene and an app-quality signal',
              'Usage descriptions that under-describe background behavior (i04-l02\u2019s location pattern)',
              'Protected data cached in Caches/ or sent to analytics endpoints — follow the data after the prompt',
              'Capability flags cached in memory/plists that survive Settings-level revocation until relaunch'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory the permission surface from Info.plist and the code\u2019s gated-API calls (static, from module i04\u2019s lists)',
              'Exercise each permission in four states: not-yet-asked, granted, denied-before-use, revoked-mid-session',
              'For each state, record app behavior: prompt timing, UI degradation, network/storage consequences',
              'Follow granted data: where does the first contact/photo/location value appear next — container files? log lines? analytics requests?',
              'Write findings only where the app defeats the consent layer\u2019s purpose (routing, caching capability, revocation blindness) — prompt behavior itself is platform mechanics'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A finding from the matrix. A contacts-importer feature prompts for contacts (honest prompt, sensible timing). Granted: the app imports names/numbers — then the capture shows the entire address book serialized to the analytics endpoint as part of a "feature usage" event, and a copy of the import lands in Library/Caches as JSON. Platform TCC worked exactly as designed; the app defeated it twice (network egress of protected data; unprotected cache). Finding phrased in those two artifacts — one capture, one file pull — severity argued by data sensitivity and destination. This is the TCC-layer test that pays.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'TCC testing is mostly behavior + observation: Settings (state changes), Console logs (permission decisions and denials), your proxy (data egress), and container pulls (data copies) from module i13. No special TCC tooling needed; the discipline is exercising all four states instead of only "allow".'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating prompt wording as the finding — prompts are configured UX; the finding is behavior that defeats consent',
              'Testing only the granted state — denial and revocation are where apps break (and users actually live)',
              'Mixing privacy severity with security severity uncritically — different frameworks apply; present them as separate report sections',
              'Forgetting limited-photo and coarse-location degraded states — apps fail these far more often than the binary cases'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the four-state matrix on one feature of your training app (or any app you own): contacts, camera or location. Record prompt timing, degraded states, and — the key step — where the first granted datum ends up (log, file, network). One completed matrix row is the module\u2019s deliverable; modules i13/i14 give you the pull and capture tooling to complete the rest.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'TCC gates protected APIs on user consent, with revocation and degraded states apps must honor',
            'The privacy test is behavioral honesty: prompts, denials, revocation, and where protected data goes next',
            'The classic finding is defeat-by-routing: consented data copied into unprotected sinks',
            'Privacy findings live in their own report section with their own severity logic'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i05-l03-q1',
          type: 'mcq',
          prompt: 'Which behavior is a genuine TCC-related finding?',
          options: [
            'The app shows the camera prompt when the user taps "Scan code"',
            'The app crashes when location permission is denied',
            'The app uploads the user\u2019s imported contacts to an analytics endpoint after a legitimate contacts prompt',
            'The app does not request any permissions'
          ],
          answerIndex: 2,
          hint: 'Which behavior defeats the purpose the user consented to?',
          explanation:
            'Consent to "import contacts" does not consent to analytics egress of the entire address book. The prompt mechanism worked; the app routed protected data to an unprotected sink — the classic defeat-by-routing finding. (A crash on denial is a quality bug; a stable app that never prompts needs no finding.)'
        },
        {
          id: 'i05-l03-q2',
          type: 'truefalse',
          prompt: 'After a user revokes camera permission in Settings, the app may continue using cached capability flags until it relaunches — and that is acceptable platform behavior with no findings implications.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'The platform revokes immediately. Whose problem is the stale flag?',
          explanation:
            'False — TCC revocation takes effect at once, and API calls fail immediately. An app that caches capability flags and misbehaves until relaunch has a real bug; if it silently switches to a weaker data path, it is also a finding. The platform\u2019s immediacy is what makes the test meaningful.'
        },
        {
          id: 'i05-l03-q3',
          type: 'scenario',
          prompt:
            'Design the two evidence artifacts you would attach to a "location data over-collection" privacy finding.',
          hint: 'One shows the claim\u2019s reach; one shows the sink. What do you capture?',
          explanation:
            'Artifact 1: runtime evidence of collection scope (log/observation of location events, frequency, precision — showing more than the feature needs). Artifact 2: the sink (captured request body to an endpoint, or a container file holding the history). A finding with both artifacts is unarguable; with neither it is an opinion.'
        },
        {
          id: 'i05-l03-q4',
          type: 'mcq',
          prompt: 'How does TCC relate to the app sandbox?',
          options: [
            'TCC replaces the sandbox for Apple\u2019s apps',
            'They are separate layers: sandbox constrains the container/process; TCC gates user-consented protected data',
            'TCC is the user-facing name for entitlements',
            'Both are configured in Info.plist identically'
          ],
          answerIndex: 1,
          hint: 'One layer is about what the process may do at all; the other about what data the user has consented to share with it.',
          explanation:
            'Two enforcement layers, independent: the sandbox walls the process; TCC gates consented data access. Findings should name the correct layer — mixing them muddies both the test and the remediation.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Requesting permission to use APIs that protect user privacy',
          url: 'https://developer.apple.com/documentation/uikit/core-objects/requesting-permission-to-use-apis-that-protect-user-privacy',
          note: 'Official permission surface and usage-description expectations'
        },
        {
          title: 'Apple Developer — Core Location authorization',
          url: 'https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services',
          note: 'The degraded-state model (coarse/when-in-use/always) behind the location test'
        },
        {
          title: 'OWASP MASVS v2 — PRIVACY category',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard\u2019s framing of consent, minimization and data flows'
        }
      ]
    }
  ]
};
