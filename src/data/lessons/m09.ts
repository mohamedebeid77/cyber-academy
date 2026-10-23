import type { Module } from '../../types';

// LEVEL 7 — STANDARDS & REPORTING · Module 09: OWASP Mobile Application Security
// Original curriculum content synthesized from the public OWASP MAS documentation
// (mas.owasp.org: MASVS, MASTG, MASWE) and developer.android.com. All prose is
// original; reference links point to the official sources used for study.

export const m09: Module = {
  id: 'm09',
  title: 'OWASP Mobile Application Security',
  level: 7,
  description:
    'The OWASP Mobile Application Security family: MASVS as the standard, MASTG as the how-to guide, MASWE as the weakness catalog — and how to turn all three into the scoping, testing, and reporting backbone of your assessments.',
  outcomes: [
    'Explain the roles of MASVS, MASTG and MASWE and how the three interlock as one system',
    'Map observations on a device to MASVS control groups and MASWE weakness topics',
    'Distinguish the verification levels (L1, L2, R) and scope an engagement against them',
    'Write findings mapped to OWASP MAS that a client can verify against the standard'
  ],
  lessons: [
    {
      id: 'm09-l01',
      moduleId: 'm09',
      title: 'The OWASP MAS Family: MASVS, MASTG, MASWE',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l01'],
      objectives: [
        'Name the three OWASP MAS artifacts and what each one is for',
        'Explain how the standard, the testing guide and the weakness catalog fit together',
        'Use the family as a backbone for scoping, testing and reporting'
      ],
      diagram: 'masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The OWASP Mobile Application Security (MAS) project is a family of three documents that together answer the three questions of mobile testing: what "secure" means (MASVS), how to verify it (MASTG), and what can go wrong (MASWE). Treating them as one system — instead of three unrelated documents — gives you a scoping language, a test playbook, and a findings taxonomy in a single move.'
          },
          {
            type: 'p',
            text:
              'This lesson is the map. The next three lessons walk the MASVS control groups in depth, so this is the orientation you will keep coming back to.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'masvs-map',
            caption:
              'How MASVS, MASTG and MASWE interlock: the standard defines requirements, the guide verifies them, the catalog names the weaknesses.'
          },
          {
            type: 'p',
            text:
              'The Mobile Application Security Verification Standard (MASVS) is the standard itself: versioned, testable requirements grouped into control groups — MASVS-STORAGE, MASVS-CRYPTO, MASVS-AUTH, MASVS-NETWORK, MASVS-PLATFORM, MASVS-CODE, MASVS-RESILIENCE and MASVS-PRIVACY. Requirements are statements of what must be true ("the app securely stores sensitive data" style), not instructions for how to get there.'
          },
          {
            type: 'p',
            text:
              'The Mobile Application Security Testing Guide (MASTG) is the how-to: platform-specific test cases, techniques and tooling that verify each MASVS requirement, plus legally usable crackmes for practice. Whenever you ask "how do I actually test this?", the MASTG chapter is the answer.'
          },
          {
            type: 'p',
            text:
              'The Mobile Application Security Weaknesses catalog (MASWE) describes concrete weaknesses observed in real apps, each tied to the MASVS control it violates, with risk context and mitigation guidance. It is the bridge between requirement and finding: you describe what you saw, and MASWE names the weakness class.'
          },
          {
            type: 'table',
            headers: ['Artifact', 'Answers the question', 'You reach for it when'],
            rows: [
              ['MASVS', 'What must be true for the app to be considered secure?', 'Scoping, writing requirements, structuring a checklist'],
              ['MASTG', 'How do I verify that on Android or iOS?', 'Executing tests, choosing tools, building a lab'],
              ['MASWE', 'What is this class of weakness called, and why does it matter?', 'Writing findings, justifying severity, citing risk']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Using MAS as a backbone changes your work from ad-hoc poking to a defensible process: scope against MASVS levels, run MASTG-derived tests, and report findings mapped to MAS weaknesses. Clients and auditors increasingly speak this language, and internally it keeps your coverage provable — you can show which controls you tested and which you did not.'
          },
          {
            type: 'list',
            items: [
              'Scoping: agree whether the engagement targets MASVS L1, L2, and/or resilience (R)',
              'Execution: turn the relevant MASTG Android chapters into your test plan',
              'Reporting: map each finding to a MASVS control and a MASWE weakness topic for credibility'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Engagement documents that mention MASVS — and whether they specify which verification level and which control groups are in scope',
              'Client claims like "we follow OWASP MAS" — ask for the level; the standard only means something with one',
              'Mapping opportunities: every observation you make should eventually attach to a control group'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'This lesson is reading-heavy, but make it operational in ten minutes: pull the MASVS control list, create your own checklist file, and keep it next to your notes. You will fill it during the next three lessons.'
          },
          {
            type: 'terminal',
            title: 'Making the family operational',
            lines: [
              '$ git clone https://github.com/OWASP/MASTG.git mastg   # offline copy of the guide',
              '$ mkdir -p engagement && touch engagement/masvs-checklist.md',
              '$ # The 8 control groups go in: STORAGE CRYPTO AUTH NETWORK PLATFORM CODE RESILIENCE PRIVACY'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'One bookmark, one clone',
            text:
              'mas.owasp.org hosts MASVS, MASTG and MASWE in one place with search. An offline clone plus the live site covers you both at the desk and on-site.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'You are asked to assess a training app "to MASVS L1". You list the eight control groups, take the L1 requirements for each, and write eight checklist rows. As you test — storage dump, TLS proxy, component enumeration, the skills from earlier modules — each observation ticks or fails a row. The final report has a coverage table nobody can argue with.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['mas.owasp.org', 'The official home of MASVS, MASTG and MASWE'],
              ['MASTG crackmes', 'Legal practice targets referenced throughout this academy'],
              ['Your checklist file', 'The artifact that turns the standard into process']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Quoting MASVS v1 / MSTG-era numbering in modern reports — the current standard reorganized the controls; cite what you actually read',
              'Treating MASWE entries as CVE-style vulnerability IDs — they are weakness classes, not bugs in a specific app',
              'Assuming "L1 plus R" means the app is un-crackable — R is about resilience against reverse engineering, a separate axis from the L1/L2 security requirements',
              'Reading only MASTG (the how-to) and skipping MASVS (the what) — without the standard you cannot define done'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'From memory, write the eight MASVS control group names, then check yourself against mas.owasp.org. Missed groups show you which curriculum modules to revisit — and after lessons l02 to l04 of this module, all eight will be familiar.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'MASVS = standard (requirements), MASTG = guide (how to verify), MASWE = weakness catalog (naming what you find)',
              'Eight control groups cover the whole app: STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY',
              'Verification levels L1/L2 plus the R resilience flag define the target you scope to',
              'The MAS family turns testing into a repeatable, auditable process'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm09-l01-q1',
          type: 'mcq',
          prompt: 'Which artifact tells you HOW to technically verify a MASVS requirement on Android?',
          options: ['MASVS', 'MASTG', 'MASWE', 'The Android developer documentation'],
          answerIndex: 1,
          hint: 'One document is literally a testing guide.',
          explanation:
            'MASTG, the Mobile Application Security Testing Guide, provides platform-specific tests, techniques and tooling for verifying MASVS requirements.'
        },
        {
          id: 'm09-l01-q2',
          type: 'truefalse',
          prompt: 'MASWE entries are numeric CVE identifiers for vulnerabilities in specific apps.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Weaknesses versus vulnerabilities — a distinction web application security also makes.',
          explanation:
            'MASWE catalogs weakness classes tied to MASVS controls. A specific bug in a specific app is your finding; MASWE gives it a name, context and mitigation guidance.'
        },
        {
          id: 'm09-l01-q3',
          type: 'short',
          prompt: 'Name the eight MASVS control groups.',
          modelAnswer:
            'MASVS-STORAGE, MASVS-CRYPTO, MASVS-AUTH, MASVS-NETWORK, MASVS-PLATFORM, MASVS-CODE, MASVS-RESILIENCE, MASVS-PRIVACY.',
          hint: 'Where data rests, how it is protected, who gets in, what crosses the wire, what the platform exposes, how code is built, how it resists reverse engineering, and what it learns about users.',
          explanation:
            'Memorizing the groups pays off immediately: every observation in an assessment should attach to one of them.'
        },
        {
          id: 'm09-l01-q4',
          type: 'scenario',
          prompt: 'A client says: "We need the app tested against OWASP MAS." What is your first scoping question and why?',
          modelAnswer:
            'Which verification level(s): L1, L2, and/or resilience (R)? The standard is only meaningful with a level — L1 is baseline security, L2 adds defense-in-depth controls for high-risk apps, and R targets reverse-engineering resistance. The choice drives test depth, effort and expectations for both sides.',
          hint: 'The standard has a knob that changes what you must test.',
          explanation:
            'Scoping to a level makes the engagement verifiable and protects both sides from vague expectations. That is the professional use of MASVS.'
        }
      ],
      references: [
        {
          title: 'OWASP MAS — project home',
          url: 'https://mas.owasp.org/',
          note: 'Portal for MASVS, MASTG and MASWE.'
        },
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The verification standard: control groups and verification levels.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The testing guide this academy\u2019s methodology aligns with.'
        },
        {
          title: 'OWASP MASWE',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'The weakness catalog used for finding classification.'
        }
      ]
    },
    {
      id: 'm09-l02',
      moduleId: 'm09',
      title: 'MASVS Deep Dive: Storage, Crypto, Auth',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m09-l01'],
      objectives: [
        'State what MASVS-STORAGE, MASVS-CRYPTO and MASVS-AUTH each require',
        'List the concrete checks a pentester runs for these three groups',
        'Connect each group to its MASTG test topics and representative MASWE weakness topics'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Three control groups cover how an app treats secrets: MASVS-STORAGE (where data rests), MASVS-CRYPTO (how it is protected) and MASVS-AUTH (who gets in, and for how long). They are the most productive place to start any assessment because they produce concrete, provable findings — a session token in a plaintext file is not an opinion.'
          },
          {
            type: 'p',
            text:
              'For each group this lesson gives you: what the controls demand, what you actually check on a device, the MASTG test topics that cover the area, and the kind of MASWE weaknesses you will encounter.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'MASVS-STORAGE'
          },
          {
            type: 'p',
            text:
              'The controls demand that sensitive data — credentials, tokens, PII, app secrets — is stored only where the threat model protects it, encrypted or in platform-protected storage, and that logs, caches, backups and clipboard usage do not leak it. The MASVS threat model explicitly includes rooted and lost devices, so "it is in internal storage" alone is not compliance.'
          },
          {
            type: 'list',
            items: [
              'Dump shared_prefs, databases and files on a rooted or debuggable target and grep for tokens and PII',
              'Watch logcat during login and sync; check screenshot and clipboard behavior on sensitive screens',
              'Verify backup rules (android:allowBackup, dataExtractionRules) exclude secrets'
            ]
          },
          {
            type: 'h',
            text: 'MASVS-CRYPTO'
          },
          {
            type: 'p',
            text:
              'Controls require modern algorithms, keys kept in the Android Keystore (hardware-backed where available), correct modes and parameters (no deterministic ECB, randomized IVs, authenticated modes where supported), and absolutely no hardcoded keys or passwords.'
          },
          {
            type: 'list',
            items: [
              'Locate crypto usage in decompiled code (javax.crypto, Conscrypt, third-party libraries) and note algorithms and key handling',
              'Look for hardcoded keys, static IVs, ECB usage, and MD5/SHA-1 used for security purposes',
              'Check whether keys are exportable or bound to the Keystore, and whether sensitive data survives key invalidation'
            ]
          },
          {
            type: 'h',
            text: 'MASVS-AUTH'
          },
          {
            type: 'p',
            text:
              'Controls cover both halves of authentication: local authentication (biometrics or PIN gating app features) and remote authentication and session management (token issuance, storage, expiry, invalidation on logout, secure credential handling).'
          },
          {
            type: 'list',
            items: [
              'Test biometric flows with enrolled, no-enrollment, and fallback states — the fallback path is where apps usually fail',
              'Observe where tokens are issued, where they are stored (which loops back to STORAGE), and whether logout actually invalidates',
              'Exercise authentication-sensitive actions with expired or invalid tokens against your authorized backend'
            ]
          },
          {
            type: 'table',
            headers: ['Group', 'Representative MASTG test topics (by name)', 'Typical MASWE weakness topics'],
            rows: [
              ['STORAGE', 'Testing Data Storage; Testing Backups; Testing Logs for Sensitive Data', 'Sensitive data in unencrypted local storage; secrets written to logs; sensitive data exposed via backups'],
              ['CRYPTO', 'Testing Cryptography; Testing Key Management', 'Hardcoded cryptographic keys; deprecated or weak algorithms; weak encryption configurations'],
              ['AUTH', 'Testing Local Authentication; Testing Biometric Authentication; Testing Session Management', 'Biometric fallback weaknesses; missing session invalidation; weak authentication and credential flows']
            ]
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Weakness topics, not IDs from memory',
            text:
              'The MASWE catalog grows over time. This academy describes weaknesses by topic; when writing a real report, cite the current entry from mas.owasp.org rather than an identifier recited from memory.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These three groups generate the bulk of reportable issues on most apps because they fail in visible, physical ways: you can read the file, replay the token, or watch the log. They also interlock — a session token in plaintext SharedPreferences is simultaneously a STORAGE and a CRYPTO failure, and its acceptance after logout is an AUTH failure. Classify the root cause once and cross-reference the rest.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Tokens, PII or keys in shared_prefs XML, SQLite files, or logcat output',
              'Cipher.getInstance calls with just "AES" (defaults to deterministic ECB), static IVs, hardcoded base64 blobs',
              'Biometric prompts with a silent fallback the attacker controls',
              'Long-lived tokens, no visible invalidation, and "remember me" flows that never expire'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The dynamic core is a rooted emulator plus your own throwaway accounts — the toolchain from earlier modules. The loop per group: change state in the app (log in, save a note, enroll biometrics), then observe storage, crypto artifacts, and session behavior.'
          },
          {
            type: 'terminal',
            title: 'One probe per group — the flavor of each',
            lines: [
              '$ adb shell run-as com.example.app cat shared_prefs/user.xml   # STORAGE',
              '$ grep -rn "Cipher.getInstance" jadx_out/sources/ | head       # CRYPTO',
              '$ adb shell am start -n com.example.app/.SecureActivity         # AUTH: does it re-check?'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Live sessions, real backends',
            text:
              'Session and authentication testing touches a live backend. Run these flows only against training apps, your own accounts, or authorized engagements — and use throwaway test accounts.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app stores its session token in shared_prefs as plaintext and encrypts a local cache with a key hardcoded in a Kotlin object. Findings: (1) sensitive token in unencrypted local storage (MASVS-STORAGE), (2) hardcoded encryption key that defeats the encryption entirely (MASVS-CRYPTO, key management). The mapped MASTG topics are data storage testing and key management. Two crisp findings, each with a file path and a code line as evidence.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Group it serves'],
            rows: [
              ['adb run-as / root shell', 'STORAGE — read the app\u2019s private data areas'],
              ['JADX', 'CRYPTO — locate crypto APIs and hardcoded keys'],
              ['objection', 'STORAGE/CRYPTO — quick storage and keystore dumps from a runtime session'],
              ['openssl', 'CRYPTO — confirm algorithm properties on extracted ciphertext']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Stopping at "it is in internal storage, therefore safe" — the MASVS threat model includes rooted and lost devices, so secrets are still expected to be protected',
              'Calling any use of SHA-1 weak without context — HMAC-SHA1 is not broken the way unsalted SHA-1 password hashing is',
              'Testing biometrics only with a fingerprint enrolled; the no-enrollment and fallback paths are where apps fail',
              'Concluding "no session expiration" from client behavior alone — invalidation is a backend property; verify it against the authorized backend'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a training app: log in, dump every storage area under run-as, and note each secret found; then grep the decompiled code for Cipher, SecretKeySpec and hardcoded base64 strings. Classify each observation into STORAGE, CRYPTO or AUTH, and write one report-style sentence per finding.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'STORAGE = where secrets rest; CRYPTO = how they are protected; AUTH = who gets in and for how long',
              'The three interlock: one plaintext token can produce findings in several groups — classify the root cause once',
              'MASTG supplies the tests (data storage, cryptography, local authentication); MASWE names the weaknesses',
              'Evidence is physical: file paths, code lines, replay results — not impressions'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm09-l02-q1',
          type: 'mcq',
          prompt: 'A session token stored as plaintext in SharedPreferences primarily violates which group?',
          options: ['MASVS-NETWORK', 'MASVS-STORAGE', 'MASVS-RESILIENCE', 'MASVS-CODE'],
          answerIndex: 1,
          hint: 'The question is where the secret rests.',
          explanation:
            'Plaintext secrets in local storage are a MASVS-STORAGE failure. CRYPTO would be the lens if the app attempted encryption but did it wrong, for example with a hardcoded key.'
        },
        {
          id: 'm09-l02-q2',
          type: 'truefalse',
          prompt: 'Cipher.getInstance("AES") is a secure way to encrypt, because AES is a strong algorithm.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What mode and padding does the JCA default to?',
          explanation:
            'The JCA default for "AES" is AES/ECB/PKCS5Padding — deterministic and structure-leaking. The controls expect randomized, preferably authenticated modes (such as GCM) with per-encryption IVs.'
        },
        {
          id: 'm09-l02-q3',
          type: 'short',
          prompt: 'Give two checks that belong to MASVS-AUTH testing on a device you are authorized to test.',
          modelAnswer:
            'Examples: exercising biometric login including the no-enrollment and fallback paths, and verifying token handling across logout or expiry (is the old token still accepted?). Checking that sensitive screens re-verify locally before showing secrets is another valid one.',
          hint: 'A local gate plus a remote session — two halves.',
          explanation:
            'AUTH spans local authentication (biometrics/PIN) and remote session management (issuance, storage, expiry, invalidation). Both halves need tests.'
        },
        {
          id: 'm09-l02-q4',
          type: 'scenario',
          prompt:
            'You find a database encrypted with AES-GCM, but the key is a string constant in the code. How do you report this, and which group(s) apply?',
          modelAnswer:
            'One root cause, reported as one finding with two control mappings: the encryption is defeated by a hardcoded key (MASVS-CRYPTO, key management) and the stored data is therefore effectively unprotected sensitive data (MASVS-STORAGE context). Lead with the hardcoded key as root cause and describe the recoverable plaintext as impact.',
          hint: 'Root cause versus impact — classify once, reference both.',
          explanation:
            'Good reports separate root cause (hardcoded key, CRYPTO) from impact (recoverable plaintext data, STORAGE context). Duplicating it as two independent findings obscures the fix.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'Control requirements for storage, cryptography and authentication.'
        },
        {
          title: 'OWASP MASTG — Android Data Storage testing',
          url: 'https://mas.owasp.org/MASTG/Android/0x05d-Testing-Data-Storage/',
          note: 'The canonical storage test playbook used in this lesson.'
        },
        {
          title: 'OWASP MASWE',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'Weakness catalog — browse the current entries for storage, crypto and auth.'
        },
        {
          title: 'Android Developers — Android Keystore system',
          url: 'https://developer.android.com/training/articles/keystore',
          note: 'Official key management documentation — what "protected" should look like.'
        }
      ]
    },
    {
      id: 'm09-l03',
      moduleId: 'm09',
      title: 'MASVS Deep Dive: Network, Platform, Code',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m09-l01', 'm06-l01'],
      objectives: [
        'State what MASVS-NETWORK, MASVS-PLATFORM and MASVS-CODE each require',
        'List the concrete checks a pentester runs for these three groups',
        'Connect each group to its MASTG test topics and representative MASWE weakness topics'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The second trio of control groups watches different boundaries: MASVS-NETWORK (data in transit), MASVS-PLATFORM (how the app meets the Android platform and other apps) and MASVS-CODE (how the app is built and shipped). Module 06 taught you the network skills hands-on; here you frame them — plus two new areas — in the MAS structure.'
          },
          {
            type: 'p',
            text:
              'The pattern is the same as the last lesson: what the controls demand, what you check, and which MASTG topics and MASWE weakness classes cover the ground.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'MASVS-NETWORK'
          },
          {
            type: 'p',
            text:
              'Controls demand TLS everywhere, modern validation behavior (no blanket acceptance of bad certificates), and — where the threat model justifies it — protection against CA compromise through pinning or an equivalent mechanism. You already test all of this: proxy setup, cleartext checks, NSC reading, pinning recognition from module 06.'
          },
          {
            type: 'list',
            items: [
              'Intercept: which endpoints are TLS, which allow cleartext, which reject your proxy CA',
              'Read the NSC for permissive trust anchors and cleartext flags (module 06, l02)',
              'Note pinning scope and quality where present (module 06, l04)'
            ]
          },
          {
            type: 'h',
            text: 'MASVS-PLATFORM'
          },
          {
            type: 'p',
            text:
              'Controls cover the IPC surface: exported components, permissions on content providers, WebView hardening, deep-link handling, and safe use of platform mechanisms. This is where component enumeration from module 01 becomes a formal requirement rather than a habit.'
          },
          {
            type: 'list',
            items: [
              'Enumerate exported components and attempt to reach them without authentication',
              'Review WebView settings (JavaScript, file access) and the content they are fed',
              'Test deep links and intent handling with attacker-shaped inputs'
            ]
          },
          {
            type: 'h',
            text: 'MASVS-CODE'
          },
          {
            type: 'p',
            text:
              'Controls address code quality and build hygiene: no secrets or sensitive logic exposed in code or resources, dependencies without known critical issues, release builds without debug artifacts, and safe API usage throughout.'
          },
          {
            type: 'list',
            items: [
              'Hunt decompiled code and resources for keys, endpoints and backdoors (module 04 skills)',
              'Check build flags: debuggable, backup, exported defaults; look for leftover test code and components',
              'Inventory embedded third-party SDKs and the permissions, endpoints and data flows they add'
            ]
          },
          {
            type: 'table',
            headers: ['Group', 'Representative MASTG test topics (by name)', 'Typical MASWE weakness topics'],
            rows: [
              ['NETWORK', 'Testing Network Communication; Testing TLS Settings', 'Cleartext transmission of sensitive data; weak TLS validation; missing pinning where the threat model requires it'],
              ['PLATFORM', 'Testing Platform Interaction; Testing App Components; Testing Deep Links', 'Exported components without authorization; insecure IPC; dangerous WebView configuration'],
              ['CODE', 'Testing Code Quality and Build Settings; Testing for Sensitive Data in Code', 'Hardcoded secrets in code or resources; insecure build settings; sensitive functionality exposed in shipped code']
            ]
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Topic names are pointers, not links',
            text:
              'The MASTG reorganizes occasionally. Use the topic names above to find the current chapters on mas.owasp.org, and check the MASWE entries mapped to each control before citing them.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These groups reward the static-dynamic pairing you have practiced: the manifest and decompiled code tell you what the platform surface is, and adb and the proxy tell you what it actually does. NETWORK findings come with perfect evidence (captured requests), PLATFORM findings with reproducible commands (am start, content query), and CODE findings with file paths and line numbers — the most defensible report material there is.'
          },
          {
            type: 'list',
            items: [
              'NETWORK ties directly to module 06: your proxy session is the test execution',
              'PLATFORM findings often need no special tooling — adb is enough',
              'CODE findings are the cheapest to verify and the hardest for a vendor to argue with'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Endpoints without TLS, permissive NSC entries, absent pinning on high-value hosts',
              'Exported activities, receivers and providers; WebViews with JavaScript and file access fed untrusted content; deep links trusting extras',
              'API keys, tokens or admin endpoints in strings.xml, assets, or decompiled constants',
              'android:debuggable or test-only flags in release builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text: 'Three probes you already know, now labeled with their control group:'
          },
          {
            type: 'terminal',
            title: 'Mapping probes to control groups',
            lines: [
              '$ adb shell dumpsys package com.example.app | grep -B1 -A3 exported    # PLATFORM',
              '$ grep -rn "http://" jadx_out/resources/res/values/strings.xml         # NETWORK / CODE',
              '$ adb shell am start -a android.intent.action.VIEW -d "app://pay?id=2" # PLATFORM'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Active surface, active rules',
            text:
              'Invoking exported components and deep links is active testing. Keep it on training apps, your own builds, or authorized scopes — and stay inside the engagement\u2019s rules for what may be executed.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app uses HTTPS for its API (good) but ships a WebView screen with JavaScript and file access enabled, fed by an intent extra from an exported activity (PLATFORM). Separately, strings.xml contains a third-party analytics API key (CODE). Three groups covered, two findings, one afternoon — and every input came from tools you already run.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Group it serves'],
            rows: [
              ['Burp Suite', 'NETWORK — capture traffic and validate TLS behavior'],
              ['adb am / content', 'PLATFORM — invoke components and providers directly'],
              ['JADX / apktool', 'CODE — read code, resources and build settings'],
              ['MobSF', 'All three — automated first pass across the static surface']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Grepping code for "https" and declaring NETWORK done — validation behavior (trust anchors, pinning) matters more than the scheme',
              'Reporting every exported component as critical without demonstrating impact — exported does not automatically mean exploitable',
              'Ignoring third-party SDKs in the CODE group; embedded SDKs ship their own secrets, endpoints and permissions',
              'Treating obfuscation as a CODE control — renaming identifiers is RESILIENCE territory, not correctness'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take one training app and produce a three-column table: observation, control group, evidence command or file. Aim for at least one row per group. This table is literally the skeleton of a MAS-mapped report — you will formalize it in l04.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'NETWORK = transit protection; PLATFORM = the IPC surface; CODE = build and code hygiene',
              'The module 06 proxy session and module 01 component enumeration are the MASTG tests for the first two',
              'CODE findings (secrets, debug flags) are cheap to find and strong to report',
              'Evidence style: captured request, adb command, or file path — every finding needs one'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm09-l03-q1',
          type: 'mcq',
          prompt:
            'An app loads remote content into a WebView with JavaScript and file access enabled, reachable via an exported activity. Which group owns this finding?',
          options: ['MASVS-STORAGE', 'MASVS-PLATFORM', 'MASVS-NETWORK', 'MASVS-RESILIENCE'],
          answerIndex: 1,
          hint: 'IPC surface and platform APIs.',
          explanation:
            'WebView hardening and component exposure are platform-interaction concerns — MASVS-PLATFORM. The fact that the content arrives over the network does not move the root cause to NETWORK.'
        },
        {
          id: 'm09-l03-q2',
          type: 'truefalse',
          prompt: 'Finding "https://" throughout a codebase proves the app satisfies MASVS-NETWORK.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Scheme versus enforcement.',
          explanation:
            'TLS must be enforced and validated: permissive trust anchors, cleartext allowances, or missing pinning where required can fail the controls regardless of the scheme in use.'
        },
        {
          id: 'm09-l03-q3',
          type: 'short',
          prompt: 'Give two MASVS-CODE checks that need only the APK and a decompiler.',
          modelAnswer:
            'Searching code and resources for hardcoded secrets (API keys, credentials, endpoints), and inspecting build settings in the manifest (debuggable, backup flags, leftover test components).',
          hint: 'What should never ship, and how it was built.',
          explanation:
            'CODE covers hygiene: secrets in shipped artifacts and insecure build configuration. Both are verifiable statically — no device needed.'
        },
        {
          id: 'm09-l03-q4',
          type: 'scenario',
          prompt:
            'You observe an unpinned TLS endpoint that also accepts cleartext for a marketing subdomain carrying session tokens in query strings. Which group(s) apply and what evidence do you attach?',
          modelAnswer:
            'MASVS-NETWORK. Evidence: the captured request with the token in the query string (from your proxy history) and the NSC excerpt permitting cleartext for that domain. If the same token is also exposed in storage, cross-reference STORAGE but keep the root cause in transit protection.',
          hint: 'Where did the data leak, and what configuration allowed it?',
          explanation:
            'The violated control is transit protection; the captured request plus the configuration line is exactly the evidence pair a reviewer can reproduce.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'Requirements for the network, platform and code groups.'
        },
        {
          title: 'OWASP MASTG — Android Platform Interaction testing',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'The canonical platform and IPC test chapter.'
        },
        {
          title: 'Android Developers — Network Security Configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'The mechanism behind most MASVS-NETWORK findings.'
        },
        {
          title: 'OWASP MASWE',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'Weakness entries for cleartext, IPC and secret-leakage classes.'
        }
      ]
    },
    {
      id: 'm09-l04',
      moduleId: 'm09',
      title: 'MASVS Deep Dive: Resilience & Privacy + Mapping Findings',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m09-l01', 'm09-l02'],
      objectives: [
        'State what MASVS-RESILIENCE and MASVS-PRIVACY require and how they are scoped',
        'Explain the verification levels L1, L2 and R and why they are chosen per engagement',
        'Write findings mapped to MAS weaknesses using a repeatable structure'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The last two groups look outward and inward at once: MASVS-RESILIENCE asks how the app resists reverse engineering and tampering, and MASVS-PRIVACY asks what it does with the user\u2019s data. We then close the module with the professional skill that binds all eight groups together: writing findings mapped to MAS weaknesses and levels.'
          },
          {
            type: 'p',
            text:
              'Resilience is also where the MAS verification levels get their own axis: L1 and L2 grade security requirements, while R marks resilience expectations — a flag you scope separately.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'MASVS-RESILIENCE'
          },
          {
            type: 'p',
            text:
              'Controls cover integrity checks, anti-tampering, anti-debugging, obfuscation and runtime defenses — designed to raise the cost of reverse engineering and modification. They are graded under the R flag rather than demanded of every app: a puzzle game and a banking app have different resilience budgets, and the standard acknowledges that.'
          },
          {
            type: 'list',
            items: [
              'Check for obvious absence: no obfuscation, trivially patchable license or integrity checks',
              'Note the mechanisms present (integrity checks, root detection, attestation) and where they live in code',
              'Assess whether defenses degrade gracefully or break the app for legitimate users',
              'Leave dynamic evaluation of these defenses to module m12 — here, stay static'
            ]
          },
          {
            type: 'h',
            text: 'MASVS-PRIVACY'
          },
          {
            type: 'p',
            text:
              'Controls address data minimization, permissions justified by features, user consent, and safe data sharing with third parties such as analytics and advertising SDKs. Privacy failures are increasingly legal risks, not just technical ones — which makes your technical evidence unusually persuasive.'
          },
          {
            type: 'list',
            items: [
              'Map requested permissions to visible features; flag anything unexplained',
              'Inventory third-party SDKs and what data leaves the device — your proxy log is the evidence',
              'Check whether tracking identifiers are sent before any consent interaction'
            ]
          },
          {
            type: 'table',
            headers: ['Group', 'Core question', 'Representative MASTG topics'],
            rows: [
              ['MASVS-RESILIENCE', 'How hard is it to reverse, modify or misuse the app?', 'Testing Resiliency Against Reverse Engineering; anti-tampering and anti-debugging topics'],
              ['MASVS-PRIVACY', 'Does the app collect and share only what it must, with consent?', 'Privacy-focused topics: permission usage, third-party data flows, tracking identifiers']
            ]
          },
          {
            type: 'h',
            text: 'Verification levels and mapping findings'
          },
          {
            type: 'p',
            text:
              'MASVS grades requirements in levels: L1 is the baseline every app should meet; L2 adds defense-in-depth controls appropriate for apps handling high-value data; R marks resilience against reverse engineering as an additional, separately scoped expectation. You report against the level the engagement scoped — not against the highest level imaginable.'
          },
          {
            type: 'code',
            lang: 'markdown',
            title: 'A MAS-mapped finding (structure, not boilerplate)',
            code:
              '## Sensitive token stored unencrypted\n\n**MASVS:** STORAGE (L1)  \n**MASWE:** sensitive data in unencrypted local storage  \n**Evidence:** shared_prefs/user.xml contains "auth_token" (path + screenshot)  \n**Impact:** token recoverable on rooted or lost devices; account takeover  \n**Remediation:** Keystore-bound encryption; exclude secrets from backups  \n**Re-test:** dump storage after the fix; token unreadable'
          },
          {
            type: 'p',
            text:
              'Mapping discipline: one finding, one root cause, one primary control group, the MASWE weakness topic, evidence attached. When an observation spans groups — a plaintext token is storage, its transmission in cleartext is network — write the root-cause finding and cross-reference, rather than duplicating.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Mapping is what makes a report professional: it lets the client verify coverage, prioritize by control, and compare vendors. Resilience and privacy observations specifically change the conversation — resilience findings quantify how cheaply the app can be cracked, and privacy findings connect technical facts to compliance obligations, which is often what finally gets them fixed.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Absence of basic resilience: unobfuscated release builds, no integrity checks on high-value apps',
              'Resilience theater: root detection that only checks a build tag and nothing else',
              'Permissions with no visible feature; advertising identifiers sent to third parties before consent',
              'An engagement scope naming a MASVS level — your findings must be graded against it'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'For privacy, the proxy history from module 06 is your evidence machine: run the app through the proxy, list every outbound data flow, and annotate who receives what. For resilience, stay static: characterize which defenses exist and how they are implemented; dynamic evaluation is m12\u2019s territory.'
          },
          {
            type: 'terminal',
            title: 'Privacy evidence from permissions and traffic',
            lines: [
              '$ adb shell dumpsys package com.example.app | grep -A20 "requested permissions"',
              '$ # Then correlate each permission with a feature and a captured network flow',
              '$ # In the proxy history: filter POST bodies, note destinations and identifiers'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Synthetic data only',
            text:
              'Privacy testing processes personal data. Use synthetic accounts and invented identifiers, evaluate resilience defenses only on training apps, your own builds, or explicitly authorized engagements, and follow the engagement\u2019s data-handling rules.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app claims to be "obfuscated and hardened". Your static pass shows identifier renaming only, no integrity checks, and a license check that a single Smali return-true patch would defeat (you note the patchability — the actual patch belongs to m12). Your privacy pass shows the advertising identifier transmitted to an analytics SDK on first run, before any consent screen. Two mapped findings: RESILIENCE (weak defenses for the claimed threat model) and PRIVACY (identifier shared without consent), each with concrete evidence.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Group it serves'],
            rows: [
              ['Burp history export', 'PRIVACY — inventory of outbound data flows'],
              ['dumpsys package', 'PRIVACY — permission-to-feature mapping'],
              ['JADX / apktool', 'RESILIENCE — characterize obfuscation and integrity checks'],
              ['MobSF', 'Cross-cutting first pass, including resilience signals']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Demanding R-level defenses from every app — resilience is scoped to the threat model and priced separately',
              'Reporting "no obfuscation" as a critical vulnerability — it is a resilience posture observation, graded against the agreed level',
              'Treating privacy findings as soft: a consent-less identifier flow is concrete, reproducible and increasingly regulated',
              'Duplicating one root cause across several control groups instead of mapping once and cross-referencing',
              'Grading findings against a level the engagement never agreed to — check the scope document first'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take your three-column table from l03 and extend it: add RESILIENCE and PRIVACY rows using static inspection and your proxy history. Then rewrite your strongest observation in the finding template above — control, weakness topic, evidence, impact, remediation. That template is the deliverable this whole academy has been building toward.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'RESILIENCE = cost to reverse or tamper (graded with R, scoped separately); PRIVACY = what leaves the device and why',
              'Levels: L1 baseline, L2 defense-in-depth, R resilience — agree the target before testing',
              'Findings: one root cause, primary control group, MASWE weakness topic, concrete evidence, re-test step',
              'Mapping converts hacking into a professional, verifiable deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm09-l04-q1',
          type: 'mcq',
          prompt: 'What does the R designation in MASVS verification refer to?',
          options: [
            'Runtime permissions',
            'Resilience against reverse engineering, scoped separately from L1/L2',
            'Release builds only',
            'The risk rating of a finding'
          ],
          answerIndex: 1,
          hint: 'It is a third axis next to L1 and L2.',
          explanation:
            'R marks resilience expectations — anti-tampering, anti-debugging, obfuscation — scoped to apps whose threat model justifies them, independently of the L1/L2 security requirement levels.'
        },
        {
          id: 'm09-l04-q2',
          type: 'truefalse',
          prompt: 'MASVS-PRIVACY findings are subjective and cannot be evidenced technically.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does your proxy history show?',
          explanation:
            'Privacy controls are testable: permission-to-feature mapping, outbound data flows captured in the proxy, identifiers transmitted before consent — all concrete, reproducible evidence.'
        },
        {
          id: 'm09-l04-q3',
          type: 'short',
          prompt: 'List the five parts of a well-formed MAS-mapped finding.',
          modelAnswer:
            'Root-cause description with the primary MASVS control (and level), the MASWE weakness topic, concrete evidence (file path, command output, captured request), impact for this app\u2019s threat model, and remediation with a re-test step.',
          hint: 'What is broken, what it is called, proof, so what, fix.',
          explanation:
            'This structure lets the client verify each finding independently and lets reviewers audit your coverage — the point of mapping in the first place.'
        },
        {
          id: 'm09-l04-q4',
          type: 'scenario',
          prompt:
            'An engagement scoped to MASVS L1 finds: plaintext token storage, no pinning on the API host, and no obfuscation. Which are in-scope findings at L1, and how do you report the other two?',
          modelAnswer:
            'Plaintext token storage is an L1 STORAGE finding. Missing pinning: baseline L1 requires secure TLS, not necessarily pinning — report it as an observation or an L2 gap rather than an L1 violation. No obfuscation is a RESILIENCE posture note, not an L1 finding at all — document it against the R axis if the client wants resilience.',
          hint: 'Which requirements belong to which level?',
          explanation:
            'Level discipline keeps reports honest: L1 violations are findings, L2/R gaps are recommendations unless they were scoped in. Check the engagement scope before grading.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'Verification levels L1/L2 and the R resilience flag.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Resilience and privacy testing methodology.'
        },
        {
          title: 'OWASP MASWE',
          url: 'https://mas.owasp.org/MASWE/',
          note: 'Weakness catalog for mapping findings.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official developer guidance aligned with several MASVS-PRIVACY and CODE expectations.'
        }
      ]
    }
  ]
};
