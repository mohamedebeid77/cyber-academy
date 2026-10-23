import type { Module } from '../../../../types';

// LEVEL 2 — THE SECURITY MODEL · Module i06: Code Signing & Entitlements
// Original content synthesized from Apple Platform Security, Apple Developer
// documentation (code signing guides) and OWASP MASTG.

export const i06: Module = {
  id: 'i06',
  title: 'Code Signing & Entitlements',
  level: 2,
  description:
    'A serious treatment of the system\u2019s defining control: why every byte is signed, how certificates, profiles and teams interlock, what each entitlement means as a security boundary, and how a pentester inspects signatures like reading an X-ray.',
  outcomes: [
    'Explain the full signing model: identities, team ids, profiles, CMS blobs, page hashes',
    'Interpret entitlements and infer security boundaries from each key',
    'Inspect any binary\u2019s signature with codesign and produce a structured signing report',
    'Predict what happens when artifacts are modified — and what re-signing must reproduce'
  ],
  lessons: [
    {
      id: 'i06-l01',
      moduleId: 'i06',
      title: 'Why Every Byte Is Signed: The Enforcement Model',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i01-l01', 'i02-l01'],
      objectives: [
        'Describe what a code signature actually contains (page hashes, entitlements blob, CMS)',
        'Explain continuous enforcement: install, launch, and page-in verification',
        'Reason correctly about modification, validation failure and re-signing'
      ],
      diagram: 'ios-codesign-chain',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'On most platforms, code signing is a distribution formality. On iOS it is the security model: the kernel refuses to execute pages of code that do not match a validated signature. Understanding what the signature contains — and when it is checked — turns "my patched app gets killed" from mystery into mechanics, and re-signing from folklore into a repeatable procedure.'
          }
        ],
        technical: [
          { type: 'h', text: 'What lives in a signature' },
          {
            type: 'list',
            items: [
              'CodeDirectory: a list of SHA-256 hashes, one per page (typically 4 KiB) of the binary, plus special hashes for info.plist, requirements, and the entitlements blob',
              'Entitlements: an XML/DER blob embedded in the signature — the executable capability list (module i05-l01)',
              'CMS (PKCS#7) signature: the CodeDirectory signed by the developer\u2019s certificate — the trust anchor chain (Apple root → WWDR → identity)',
              'CodeResources: the bundle\u2019s resource manifest (hashes of every non-binary file) — how resource tampering is detected'
            ]
          },
          {
            type: 'diagram',
            id: 'ios-codesign-chain',
            caption: 'Trust flows from Apple\u2019s root through your identity into the binary; validation reads it back at runtime.'
          },
          { type: 'h', text: 'When validation happens' },
          {
            type: 'list',
            items: [
              'Install: the system verifies the full signature and profile coherence (bundle id, team, entitlements match)',
              'Launch: kernel/AMFI verify the signature before the process runs',
              'Page-in: as code pages are demanded from disk, each page\u2019s hash is checked — enforcement is continuous, not launch-only',
              'Resource access: bundle resources are validated against CodeResources where enforced'
            ]
          },
          { type: 'h', text: 'The modification consequence chain' },
          {
            type: 'p',
            text:
              'Modify one byte of code → its page hash no longer matches the CodeDirectory → page-in validation fails → process killed (often mid-run, on demand for that page). Modify a resource → CodeResources mismatch → validation failure at install/verification. The fix is always the same shape: recalculate what changed and re-sign the whole thing with a valid identity — which is module i22\u2019s subject. The tester\u2019s planning insight: instrumentation paths that avoid modification (Frida via debug entitlement or jailbreak) exist precisely because modification is expensive on iOS.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Signature inspection is recon: identity/team tells you who signed (developer vs Apple re-sign), entitlements tell you capabilities, flags tell you hardening (CS_RESTRICT, CS_KILL, runtime hardening bits)',
              'get-task-allow (get-task-allow = CS_GET_TASK_ALLOW) in the flags decides whether you can attach debuggers/instrumentation without jailbreak',
              'Integrity claims in the app ("we detect tampering") are evaluated against this exact machinery — module i21',
              'Evidence hygiene: record the signature hash of every binary you test — it identifies the artifact uniquely alongside the IPA hash'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Ad-hoc signatures (linker-signed, no identity) on binaries that claim enterprise provenance — inconsistent provenance is a question for the client',
              'Authority chain oddities: expired certificates, revoked identities (codesign reports them)',
              'Flag sets that weaken enforcement on dev builds — expected — vs store builds where they should be absent',
              'Differences between embedded entitlements and the provisioning profile\u2019s entitlements — mismatches cause install failures and reveal manual re-signing'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Reading a signature (macOS; detailed workflow next lesson)',
            lines: [
              '$ codesign -dv --verbose=4 Payload/TargetApp.app/TargetApp 2>&1 | head -20',
              'Identifier=com.target.app',
              'TeamIdentifier=Group: A1B2C3D4E5',
              'Format=Mach-O thin (arm64)',
              'CodeDirectory v=20500 size=123456 flags=0x20002(LinkerSigned) hashes=385+5 version=202400',
              'SignatureSize=8456',
              'Authority=Apple iPhone OS Application Signing',
              '$ codesign -d --entitlements :- Payload/TargetApp.app/TargetApp',
              '<?xml version="1.0" encoding="UTF-8"?>',
              '<!DOCTYPE plist ...>',
              '<plist version="1.0"><dict>',
              '  <key>application-identifier</key><string>A1B2C3D4E5.com.target.app</string>',
              '  <key>get-task-allow</key><true/>',
              '  <key>keychain-access-groups</key>',
              '  <array><string>A1B2C3D4E5.*</string></array>',
              '</dict></plist>'
            ]
          },
          {
            type: 'p',
            text:
              'Reading the output above like a tester: Apple-signed (store distribution), get-task-allow true — wait, that contradicts store posture. Either the sample is a dev-provided store-adjacent build or something was re-signed; that single inconsistency is a client question worth asking. This is the lesson\u2019s real skill: signature output is a contradiction detector, not a formality.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The contradiction at work. Client sends an IPA claiming it is "the exact store build". codesign shows Authority=Developer ID-style identity (not Apple iPhone OS Application Signing) and an embedded.mobileprovision present. Conclusion before any testing: this is NOT the store artifact — it is a re-signed or ad-hoc build. Options: request the true store artifact, or proceed with the channel difference documented. Findings later cite "ad-hoc-signed build provided by client" — the signature inspection converted a silent channel mismatch into an explicit, reportable fact. That is why signature reading is an hour-one task on every engagement.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'codesign (macOS built-in) is the primary reader: -dv for details, -d --entitlements for capabilities, --verify for validation, -r for requirements. ldid (the community signer) reads and writes signatures on any OS and appears properly in module i22. OpenSSL can unpack the CMS blob when you need the certificate chain manually.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming the signature is checked "once at install" — the continuous model is what kills patched apps mid-run',
              'Confusing the entitlements blob with the Info.plist — one is executable capability, the other app configuration',
              'Reading only the main binary — every embedded framework and extension has its own signature to inspect',
              'Treating "LinkerSigned"/ad-hoc signatures as broken — they are normal for development objects; the context tells you whether they are findings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On any signed binary you legitimately hold (training app), run the two codesign commands above and write a five-line signature report: authority chain, team, flags (decode get-task-allow first), entitlement list, and one anomaly-or-none statement. You will rerun this exact routine in the capstone — rehearsing it now on a small target is the point.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Signature = page hashes (CodeDirectory) + entitlements blob + CMS over a certificate chain + resource manifest',
            'Enforcement is continuous: install, launch, and every page-in — modification fails on demand, not just at launch',
            'Signature output is a contradiction detector: authority, flags and entitlements must match the claimed channel',
            'Re-signing is the universal fix for modification — and module i22\u2019s whole subject'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i06-l01-q1',
          type: 'mcq',
          prompt: 'A patched app launches fine, runs for ten seconds, then dies. Most likely mechanism?',
          options: [
            'The app\u2019s anti-tamper detected the patch (only explanation)',
            'Page-in validation: the modified page\u2019s hash failed when that code page was first executed',
            'The App Store revoked the certificate remotely',
            'Memory pressure killed it'
          ],
          answerIndex: 1,
          hint: 'When exactly does the kernel check each code page\u2019s hash?',
          explanation:
            'Page-in validation: hashes are checked as pages are demanded, so death follows the first execution of the modified region — timing that anti-tamper coincidence often gets credited for. (Anti-tamper is real too — but the mechanics come first; module i21 separates them.)'
        },
        {
          id: 'i06-l01-q2',
          type: 'truefalse',
          prompt: 'The entitlements blob lives inside the code signature, not in the Info.plist.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Which structure does the CodeDirectory hash specially and embed?',
          explanation:
            'True — entitlements are a distinct blob covered by special hashes in the CodeDirectory and signed by the CMS. Info.plist is app configuration; conflating the two is the most common signing-vocabulary error.'
        },
        {
          id: 'i06-l01-q3',
          type: 'scenario',
          prompt:
            'Signature inspection shows Authority=Apple iPhone OS Application Signing but get-task-allow=true. What do you conclude and do next?',
          hint: 'That flag is normal for which channel — and abnormal for which?',
          explanation:
            'Contradiction: Apple\u2019s distribution signing does not carry debugging entitlements. Likely explanations: a dev build mislabeled, or a re-signed artifact. Next: compare with the profile (present?), ask the client for the true artifact or explicit confirmation of what this build is, and document the channel in evidence. Do not test silently against a mislabeled build.'
        },
        {
          id: 'i06-l01-q4',
          type: 'mcq',
          prompt: 'What does CodeResources protect?',
          options: [
            'The entitlements blob',
            'Every bundled non-binary resource via hashes in a manifest',
            'The certificate chain',
            'The Info.plist only'
          ],
          answerIndex: 1,
          hint: 'Resource tampering needs its own guard — which file holds it?',
          explanation:
            '_CodeSignature/CodeResources hashes every bundled resource (nibs, assets, plists, HTML). Resource edits break verification exactly like code edits — both matter for repackaging workflows (i22).'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — Code signing',
          url: 'https://support.apple.com/guide/security/code-signing-secf4c8f3416/web',
          note: 'Apple\u2019s canonical description of the signing and enforcement model'
        },
        {
          title: 'Apple Developer — Code signing guide (TN3125-style internals)',
          url: 'https://developer.apple.com/documentation/xcode/starting-and-terminating-your-app-during-development',
          note: 'Developer-side signing behavior during development'
        },
        {
          title: 'Apple Developer — codesign manual',
          url: 'https://www.unix.com/man-page/osx/1/codesign/',
          note: 'The reader tool\u2019s full option surface'
        }
      ]
    },
    {
      id: 'i06-l02',
      moduleId: 'i06',
      title: 'Certificates, Profiles, Teams: The Provisioning Machinery',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i06-l01', 'i01-l03'],
      objectives: [
        'Explain how certificates, bundle ids, team ids and provisioning profiles interlock',
        'Read an embedded.mobileprovision fluently',
        'Diagnose the common signing failures a tester encounters (and what they imply about provenance)'
      ],
      diagram: 'ios-entitlement-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The signature proves code integrity; the provisioning machinery proves permission to run that specific app on that specific device with those specific capabilities. Certificates (who), bundle ids (what), team ids (whose), profiles (the signed contract binding all three). Reading this machinery fluently is what lets you diagnose "why won\u2019t this install" in seconds and, more importantly, spot when an artifact\u2019s provenance story does not hold together.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-entitlement-flow',
            caption: 'Capabilities → profile → embedded entitlements → AMFI validation: the permission supply chain.'
          },
          { type: 'h', text: 'The four interlocking parts' },
          {
            type: 'list',
            items: [
              'Signing certificate: issued (via Apple) to a team identity; private key signs code, public key rides the CMS',
              'Team identifier: the 10-character id prefixing application-identifiers and keychain groups (A1B2C3D4E5.com.target.app)',
              'App id: bundle id, possibly with a wildcard (com.target.*) — the "what"',
              'Provisioning profile: Apple-signed contract naming the app id, the allowed certificates, entitlements, and (for dev/ad-hoc) device UDIDs; embedded as embedded.mobileprovision and matched against the signature at install'
            ]
          },
          { type: 'h', text: 'Reading the profile' },
          {
            type: 'terminal',
            title: 'Decoding embedded.mobileprovision',
            lines: [
              '$ security cms -D -i Payload/TargetApp.app/embedded.mobileprovision > profile.plist',
              '$ plutil -p profile.plist',
              '{',
              '  Name => "TargetApp Dev 2025"',
              '  TeamIdentifier => [ "A1B2C3D4E5" ]',
              '  ApplicationIdentifierPrefix => [ "A1B2C3D4E5" ]',
              '  CreationDate => 2025-02-10 …  ExpirationDate => 2026-02-10',
              '  ProvisionedDevices => [ "00008101-…" … ]',
              '  Entitlements => {',
              '    application-identifier => "A1B2C3D4E5.com.target.app"',
              '    get-task-allow => true',
              '    aps-environment => "development"',
              '    com.apple.security.application-groups => [ "group.com.target.app" ]',
              '  }',
              '}'
            ]
          },
          { type: 'h', text: 'The failure modes a tester sees' },
          {
            type: 'list',
            items: [
              'Expired profile/certificate: install or launch fails with a provisioning error — check ExpirationDate first (free-account 7-day profiles are the classic lab surprise)',
              'Device not in ProvisionedDevices: ad-hoc install refuses — the profile names its devices',
              'Entitlements mismatch: binary\u2019s embedded entitlements not covered by the profile — install-time rejection; often means someone re-signed without recreating entitlements',
              'Team mismatch across embedded frameworks: each framework must be signed coherently with the app — mixed teams fail validation'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Profile reading is provenance forensics: name, dates, device list and entitlements together tell you exactly what artifact you are holding',
              'get-task-allow + aps-environment + app groups in one glance answer your instrumentation, push-behavior and shared-storage test planning',
              'On engagements where the client supplies builds, profile metadata anchors the artifact inventory (paired with hashes from module i04)',
              'Re-signing later (i22) must reproduce: entitlements covered by a profile valid for YOUR device — that is why free-team profiles and ldid workflows exist'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Profiles whose ExpirationDate falls inside your engagement window — schedule around the cliff',
              'Entitlements in the profile absent from the binary (or vice versa) — drift that explains install failures and hints at manual build fiddling',
              'Wildcard app ids (com.target.*) in enterprise profiles — looser binding than the feature set needs',
              'Development aps-environment on builds used in production demonstrations — environment confusion worth a client note'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Extract and decode every embedded.mobileprovision (main app, each extension) — extensions can carry different profiles',
              'Build the profile report: name, team, app id, dates, device count, entitlement list — attach to the artifact inventory',
              'Cross-check entitlement coherence: profile entitlements vs codesign-dumped binary entitlements — note every delta',
              'Note the get-task-allow value per binary — your instrumentation decision tree for module i11 starts here',
              'If install fails during lab setup, diagnose with the four failure modes above before touching anything else'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Two commands, whole story',
            text:
              'security cms -D (decode profile) + codesign -d --entitlements (binary view). Running both on every binary and diffing the entitlements is the fastest provenance-and-capability audit in the discipline.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Provenance puzzle solved by profile reading. A client swears an IPA is "their internal enterprise build". The profile: Name "TargetApp AdHoc QA 2024", ProvisionedDevices lists four UDIDs, ExpirationDate eight months past, team matches. Conclusion: a QA ad-hoc build from last year, expired, not the enterprise distribution they intended. The engagement avoids testing a stale artifact entirely — every finding would have been dismissed with "that build is ancient". Two minutes of profile reading protected a week of work. This is the machinery lesson\u2019s actual payoff: not install trivia, artifact truth.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'security cms -D + plutil (profile decode), codesign (entitlement coherence), and Xcode\u2019s Devices window for the same data with a GUI. Cross-platform: openssl smime/.cms can decode the profile\u2019s CMS envelope; Python scripts around plistlib automate the diff across many binaries.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing an expired-profile build and misreading its misbehavior as findings (aps-environment, push and provisioning-dependent behaviors break first)',
              'Forgetting extensions carry their own profiles — coherence must be checked per binary, not per IPA',
              'Assuming profile entitlements are identical to binary entitlements — they must be compatible, not byte-identical; learn which is which',
              'Ignoring the device list on ad-hoc builds — your lab device may not be provisioned, and install failure is the symptom'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Decode your training app\u2019s profile and produce the five-field report (name, team, app id, dates, entitlements). Then diff profile entitlements against codesign\u2019s binary dump and write one coherence sentence per delta (or "fully coherent" if none). If your training app is store-signed and has no profile, write the provenance sentence for THAT instead — absence of profile + Apple authority is the store signature\u2019s fingerprint.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Certificate (who signs) + team id (whose) + app id (what) + profile (the signed contract) = provisioning machinery',
            'embedded.mobileprovision decodes with security cms -D; its fields are provenance forensics',
            'Common failures (expiry, device list, entitlement mismatch, team mix) all read straight out of the profile',
            'Entitlement coherence between profile and binaries is a two-command audit that catches re-signed and mislabeled artifacts'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i06-l02-q1',
          type: 'mcq',
          prompt: 'What does the ApplicationIdentifierPrefix (team id) in a profile primarily enable?',
          options: [
            'App Store ranking',
            'Namespacing: it prefixes application-identifiers and keychain access groups, binding capabilities to the owning team',
            'Encryption of the profile itself',
            'Device UDID generation'
          ],
          answerIndex: 1,
          hint: 'Keychain groups and app ids both start with the same ten characters — why?',
          explanation:
            'The team id namespaces everything: A1B2C3D4E5.com.target.app as app id, A1B2C3D4E5.group… as keychain groups. It is how the system proves a capability belongs to one team\u2019s apps — the foundation of keychain sharing and app group trust.'
        },
        {
          id: 'i06-l02-q2',
          type: 'truefalse',
          prompt: 'An ad-hoc profile without your lab device\u2019s UDID in ProvisionedDevices will still install if the binary is correctly signed.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the ad-hoc contract say about which devices may run the app?',
          explanation:
            'False — ad-hoc (and development) profiles enumerate allowed devices; installation rejects unlisted ones. Enterprise and store profiles have no device list — a quick way to tell profile types apart.'
        },
        {
          id: 'i06-l02-q3',
          type: 'scenario',
          prompt:
            'Install fails with a provisioning error. Binary entitlements include app groups; the decoded profile does not mention them. Diagnose.',
          hint: 'Whose entitlements must cover whose — and what does the mismatch imply about how this build was made?',
          explanation:
            'Entitlement mismatch: the binary claims capabilities the profile does not grant, so validation rejects it. Implication: someone re-signed the binary (or edited entitlements) without regenerating a matching profile — provenance question for the client, and a note for your evidence chain.'
        },
        {
          id: 'i06-l02-q4',
          type: 'mcq',
          prompt: 'Which profile field most directly answers "can I attach a debugger to this build without jailbreak?"',
          options: ['Name', 'ExpirationDate', 'Entitlements.get-task-allow', 'ProvisionedDevices count'],
          answerIndex: 2,
          hint: 'Which entitlement does task-port acquisition require?',
          explanation:
            'get-task-allow (in the profile\u2019s Entitlements and mirrored in the binary\u2019s signature) authorizes debugging/task-port access — the hinge for LLDB and non-jailbreak Frida, formalized in modules i11–i12.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Maintaining identifiers, devices, and profiles',
          url: 'https://developer.apple.com/help/account/certificates/overview',
          note: 'The official provisioning model overview'
        },
        {
          title: 'Apple Developer — Distributing your app to registered devices (ad hoc)',
          url: 'https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices',
          note: 'Ad-hoc semantics: profiles, devices, entitlements'
        },
        {
          title: 'Apple Developer — Entitlements key reference',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements',
          note: 'Every entitlement key named in profiles, documented'
        }
      ]
    },
    {
      id: 'i06-l03',
      moduleId: 'i06',
      title: 'Reading Entitlements Like a Pentester',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i06-l02', 'i05-l01'],
      objectives: [
        'Interpret the entitlements a tester actually encounters, key by key',
        'Infer the security boundary each entitlement affects and the tests it implies',
        'Produce an entitlement report that feeds modules i11, i13, i14 and i16'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An entitlement dump is a capability X-ray: every key names a boundary the app reaches across, and every key is a test you have not run yet. This lesson is the field glossary — the twenty keys that matter, what each means, and what each obligates you to test. Module i05-l01 gave the model; this is the working reference you will keep open.'
          }
        ],
        technical: [
          { type: 'h', text: 'The keys, by boundary' },
          {
            type: 'table',
            headers: ['Entitlement', 'Boundary / capability', 'Tester question it creates'],
            rows: [
              ['application-identifier', 'Team-prefixed app identity', 'Does it match the bundle id and profile?'],
              ['get-task-allow', 'Debug/task-port access', 'Can I instrument without jailbreak? (i11/i12)'],
              ['aps-environment', 'Push (development/production)', 'Which push backend does this build use?'],
              ['com.apple.security.application-groups', 'Shared group containers', 'What flows through the shared container? (i13/i16)'],
              ['keychain-access-groups', 'Shared keychain items', 'Who reads the shared tokens? (i13)'],
              ['com.apple.developer.associated-domains', 'Universal links domains', 'Which web domains drive app behavior? (i16)'],
              ['com.apple.developer.web-browser', 'Full browser API surface', 'Is this app a browser-class app? WebView scope grows'],
              ['com.apple.security.network.client/server', 'Network client/server (macOS-style)', 'Rare on iOS; note if present'],
              ['com.apple.developer.healthkit*', 'Health data access', 'Privacy scope audit (i05-l03)'],
              ['com.apple.developer.homekit', 'Home accessories', 'Privacy + device-control scope'],
              ['com.apple.external-accessory.wireless-configuration', 'Accessory setup', 'Hardware-adjacent surface'],
              ['com.apple.developer.siri', 'Siri/Intents surface', 'Voice-invocation surface (i16 adjacent)'],
              ['com.apple.developer.payment-pass-*, passkit', 'Wallet/payment passes', 'Payment scope — treat carefully'],
              ['com.apple.developer.device-information.user-assigned-device-name', 'Device name access', 'Privacy: why the device name?'],
              ['com.apple.private.*', 'Private/platform internals', 'Non-store builds only — provenance signal, huge context clue'],
              ['com.apple.developer.kernel.*', 'Extended kernel features', 'Rare; note and research'],
              ['com.apple.developer.networking.wifi-info', 'WiFi metadata', 'Privacy: network fingerprinting uses'],
              ['com.apple.developer.usernotifications.*', 'Notification provisioning', 'Push plumbing'],
              ['com.apple.security.files.*', 'File access grants (macOS heritage)', 'Rare on iOS; note'],
              ['com.apple.developer.extended-token-signing / cloudkit / icloud-*', 'Cloud services', 'Data egress paths to iCloud']
            ]
          },
          { type: 'h', text: 'Reading discipline' },
          {
            type: 'p',
            text:
              'Three passes over every dump. Pass 1 — anomaly scan: com.apple.private.* on a non-Apple build, missing application-identifier, wildcard keychain groups wider than the feature set. Pass 2 — capability inventory: each key → one line in the entitlement report (key, meaning, tests implied). Pass 3 — cross-artifact: repeat for every framework and extension, since embedded binaries can carry different (sometimes stale or over-broad) entitlements. The report is done when every key has a line and every line has a module assignment.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Private entitlements are loud',
            text:
              'com.apple.private.* keys do not appear in App Store builds — Apple reserves them for platform binaries. Finding them in a client-supplied "store" IPA means the artifact is something else entirely (an internal research build, a leaked internal variant). Stop and resolve provenance before testing; this is one of the strongest artifact-red flags the dump can raise.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The entitlement report is the connective tissue of the engagement: it feeds instrumentation strategy (get-task-allow), storage testing (groups), network scope (associated domains, push), and attack surface mapping (extensions, Siri, Wallet)',
              'Over-broad entitlements are findings in their own right when the feature set does not justify them (keychain groups wider than needed, app groups unused by any extension)',
              'Missing entitlements are crashes waiting: features calling gated APIs without the capability fail at runtime — correlate with crash logs'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Keychain groups ending in .* or listing unrelated app ids',
              'App groups on apps with no extensions (why does a single-process app share containers?)',
              'Associated domains including wildcard subdomains (*.target.com) — universal link scope wider than the site map',
              'Entitlements present in frameworks but absent from the main binary (or vice versa) — incoherent builds',
              'Any com.apple.private.* — provenance stop-and-resolve'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Dump entitlements for every binary in the bundle (codesign -d --entitlements :- main + Frameworks/* + PlugIns/*)',
              'Produce the report table: binary, key, meaning, implied test, module assignment',
              'Anomaly-flag anything from the Look For list with explicit "resolve before testing" notes',
              'Carry the report into i11 (instrumentation), i13 (storage), i14 (network), i16 (surface) — each module consumes specific rows'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A complete mini-report for a two-binary app. Main binary: application-identifier (coherent), get-task-allow=false (store build — instrumentation must use jailbreak device or accept network-only testing), aps-environment=production, keychain-access-groups=[TEAM.com.app, TEAM.com.app.widget]. Widget binary: same keychain groups, app groups=[group.com.app.widget]. Findings from the dump alone: (1) widget shares the full keychain group though it only needs a session flag — over-broad sharing, hardening note; (2) instrumentation plan requires jailbroken lab device — decided in minute one; (3) push-environment production confirms live push testing is in scope for the client\u2019s backend team. Three engagement-shaping conclusions from two dumps — the entitlement X-ray at work.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'codesign (dump), plutil (normalize the XML), and a diff routine of your choice (even diff and grep) for cross-binary coherence. Nothing more exotic is needed — the value is in the reading discipline, not the tooling.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading only the main binary\u2019s entitlements — frameworks and extensions carry their own',
              'Treating every entitlement as equivalent — they gate wildly different boundaries (debugging vs storage vs web)',
              'Reporting entitlements as "vulnerabilities" — they are capabilities; findings arise from over-breadth or misuse, not presence',
              'Skipping the profile cross-check — entitlements without profile coverage are install failures, and silent mismatches hint at manual rebuilds'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the full entitlement report for your training app (all binaries). Assign each key to its consuming module. Then write the two highest-value conclusions the report produced (e.g. instrumentation decision, over-broad sharing) — if the report produced none, re-check the cross-binary pass; coherence deltas hide there.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Every entitlement names a boundary; the dump is an X-ray of what the app may cross',
            'Three passes: anomaly scan, capability inventory, cross-artifact coherence',
            'get-task-allow decides instrumentation strategy in minute one of any engagement',
            'com.apple.private.* on a "store" build is a provenance red flag — resolve before testing'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i06-l03-q1',
          type: 'mcq',
          prompt: 'An entitlement dump of a client-supplied "App Store build" contains com.apple.developer.kernel.increased-memory-limit and com.apple.private.* keys. Best next action?',
          options: [
            'Proceed — extra entitlements are harmless',
            'Stop and resolve provenance: private entitlements do not ship in store builds; the artifact is not what it claims to be',
            'Report both keys as critical vulnerabilities',
            'Re-sign the binary to remove them'
          ],
          answerIndex: 1,
          hint: 'Which entitlement family is reserved for Apple\u2019s own platform binaries?',
          explanation:
            'com.apple.private.* marks platform-internal capabilities that cannot appear in legitimate store submissions. The artifact\u2019s identity is wrong (internal/research/leaked build) — resolve with the client before any testing, and document the discrepancy.'
        },
        {
          id: 'i06-l03-q2',
          type: 'truefalse',
          prompt: 'The presence of keychain-access-groups in a binary is itself a finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Capability vs misuse — which of the two is the finding?',
          explanation:
            'False. The capability is standard. Findings arise from over-breadth (groups wider than the feature set needs) or misuse (items with weak accessibility placed in shared groups) — the entitlement report frames those questions; the storage module (i13) answers them.'
        },
        {
          id: 'i06-l03-q3',
          type: 'scenario',
          prompt:
            'Associated domains include applinks:*.target.com. What attack-surface scope does the wildcard create, and which module owns the tests?',
          hint: 'Which web pages can now route into the app\u2019s handlers?',
          explanation:
            'Every subdomain of target.com that serves a valid AASA can route its URLs into the app\u2019s universal link handlers — including subdomains the team does not control tightly (staging, forgotten hosts, compromised S3 buckets). Module i16 owns the handler tests: crafted paths, unauthorized access via IDs, and WebView-confusion behaviors.'
        },
        {
          id: 'i06-l03-q4',
          type: 'mcq',
          prompt: 'Why dump entitlements for embedded frameworks, not just the main binary?',
          options: [
            'Frameworks cannot carry entitlements',
            'Each embedded binary is signed separately and can carry different or over-broad capabilities',
            'Only frameworks have get-task-allow',
            'To extract icons for the report'
          ],
          answerIndex: 1,
          hint: 'What is the unit of signing on iOS?',
          explanation:
            'Every Mach-O is signed individually. SDK frameworks sometimes ship entitlements from their build contexts — stale, broad, or contradictory — and only the cross-binary pass reveals incoherence.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Entitlements key reference',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements',
          note: 'The catalog behind the table in this lesson'
        },
        {
          title: 'Apple Developer — Associated domains entitlement',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated_domains',
          note: 'Universal link capability semantics'
        },
        {
          title: 'OWASP MASTG — iOS platform interactions (entitlement-driven surfaces)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'How the guide ties capabilities to testable surfaces'
        }
      ]
    }
  ]
};
