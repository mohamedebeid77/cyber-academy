import type { Module } from '../../../../types';

// LEVEL 4 — STATIC ANALYSIS & RE · Module i08: Static Analysis
// Original content synthesized from OWASP MASTG iOS testing techniques and
// tool documentation (strings, otool, nm, codesign, r2).

export const i08: Module = {
  id: 'i08',
  title: 'Static Analysis',
  level: 4,
  description:
    'The full static workflow: acquiring the app, sweeping binaries and resources for secrets and endpoints, auditing configuration (ATS, schemes, flags), and producing the static findings file that dynamic modules confirm. Tools stay boring on purpose — method does the work.',
  outcomes: [
    'Acquire IPAs legitimately from each distribution channel',
    'Run the binary and resource sweep: strings, symbols, embedded frameworks, config files',
    'Hunt secrets, internal endpoints and feature flags with judgment about what is actually sensitive',
    'Produce the static findings document with evidence and dynamic-confirmation hooks'
  ],
  lessons: [
    {
      id: 'i08-l01',
      moduleId: 'i08',
      title: 'Acquiring the App',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i01-l03', 'i07-l01'],
      objectives: [
        'Obtain IPAs from legitimate sources: clients, TestFlight, dev builds, store-build extraction from your own device',
        'Understand what extraction means technically and where its limits are',
        'Record acquisition provenance as evidence'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Static analysis needs the artifact, and acquisition is where engagement legitimacy lives. The channels were mapped in module i01; this lesson is the practical how: which channel gives you which artifact, how store-build extraction works from your own device, and why provenance records (hash, channel, date) are report content rather than bookkeeping.'
          }
        ],
        technical: [
          { type: 'h', text: 'The acquisition paths' },
          {
            type: 'list',
            items: [
              'Client-provided: ad-hoc/enterprise IPAs or TestFlight access — the cleanest path; request in writing which channel the engagement covers',
              'Dev builds you build: from source (if provided) with your own signing — full control, obvious provenance',
              'Store-build extraction: from your own device, post-purchase/download — the standard route when only the shipped app is in scope',
              'Training apps: OWASP MASTestApp-iOS and licensed crackmes for skill work — no provenance burden, full freedom'
            ]
          },
          { type: 'h', text: 'Store extraction, technically' },
          {
            type: 'p',
            text:
              'iOS installs store apps encrypted (FairPlay) on device; the container files you can pull are the app\u2019s data, not the binary. Extraction workflows decrypt the binary at runtime on the device you own (dumping the decrypted image from memory) and repackage it as an IPA. The technique is well documented in the community and MASTG describes the principles; the practical notes: it requires the target device setup from module i07 (often the jailbroken environment for current iOS), and the extracted IPA is YOUR device\u2019s decrypted copy — legitimate to hold for an authorized assessment, never to redistribute. FairPlay\u2019s wrapper means you cannot simply unzip the on-disk store binary and run it elsewhere: the decryption step is the whole game.'
          },
          { type: 'h', text: 'Provenance as evidence' },
          {
            type: 'terminal',
            title: 'The acquisition record (keep for every artifact)',
            lines: [
              '# acquisition-record.txt',
              'artifact:    TargetApp.ipa',
              'sha256:      9f3a…e7  (shasum -a 256 TargetApp.ipa)',
              'channel:     client-provided ad-hoc (email 2025-03-02) / store extraction',
              'device:      iPhone 13, iOS 17.4 (if extracted)',
              'tool:        frida-ios-dump 3.x / client email attachment',
              'notes:       build 418 matches TestFlight RC 1.4.2 per client confirmation'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Every finding cites the artifact hash — the acquisition record is what makes that citation mean something',
              'Channel determines posture before testing: store build (no profile, no debug entitlement) vs dev build (both present) — module i01-l03\u2019s matrix applied',
              'Extraction constraints shape scope conversations: if the client wants store-build static analysis and you have no extraction environment, that is a scope boundary to negotiate early, not discover late',
              'Training-app fluency: run every new technique on MASTestApp-class targets first so engagement hours buy findings, not tooling debugging'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Mismatch between claimed channel and artifact reality (profile present on a "store" build — module i06\u2019s contradiction detector)',
              'Extracted artifacts missing FairPlay metadata but also missing simulator slices — verify you hold what you think',
              'Version drift between what the client says ships and what the artifact shows — resolve before testing',
              'Training apps that are too clean (no intentional weaknesses) — confirm you are using the vulnerable variant, not the demo build'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'For your current target (training app), write the acquisition record: source, hash, channel, date',
              'If you have access to a jailbroken lab device, practice the extraction workflow on a store app you own until the routine is smooth; otherwise note the constraint in your decision table (module i07-l02)',
              'Verify the artifact: file on the main binary (arm64?), plutil on Info.plist (bundle id/version), codesign authority — three commands that confirm you hold a coherent IPA',
              'Archive the record with the artifact; every later module reads from this pair'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Extraction ethics, once more',
            text:
              'Extracting apps you have legitimately obtained, for an authorized assessment, on devices you control, is standard practice. Redistribution of decrypted IPAs, extraction of apps outside an authorized scope, and circumventing store terms for curiosity are not. The line is authorization; keep every artifact inside it.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Provenance saving a finding. Mid-engagement, a client disputes a storage finding: "our shipped app does not behave that way." The acquisition record shows the tested artifact was the ad-hoc build 417; the shipped store build is 418. Re-validation on the extracted store build 418 shows the same plist token — finding stands — but the record is what made the re-validation a five-minute check instead of an argument. Acquisition provenance is cheap insurance on every report line that follows.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'shasum/file (verification), the module i07 device toolchain (extraction prerequisites), and the community extraction tooling MASTG references (frida-based dumpers) — used on lab devices you own. No new heavyweight installs in this lesson; acquisition is process, not tooling.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing an artifact without recording where it came from — every later dispute becomes he-said-she-said',
              'Assuming store binaries unzip cleanly off the device (FairPlay encryption — the decryption step is mandatory)',
              'Redistributing extracted IPAs — the artifact is for the engagement only; sharing it is the fastest way to convert legal work into the other thing',
              'Skipping the three-command verification (file/plutil/codesign) and discovering coherence problems mid-analysis'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the acquisition record for your training IPA and run the three verification commands. Then write the one-sentence provenance statement you would put in a report: "All findings validated against TargetApp 3.2.1 (build 418), SHA-256 9f3a…, obtained as client-provided ad-hoc build." That sentence is the whole lesson compressed.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Acquisition paths: client artifacts, own builds, store extraction from your device, training apps',
            'Store binaries are FairPlay-encrypted at rest — extraction means runtime decryption on your device',
            'The acquisition record (hash, channel, device, tool, date) is report content, not bookkeeping',
            'Verify artifacts before analysis: file, plutil, codesign — three commands, full coherence check'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i08-l01-q1',
          type: 'mcq',
          prompt: 'Why can\u2019t you simply copy a store app\u2019s on-disk binary off a device and analyze it like a normal Mach-O?',
          options: [
            'The file system blocks reads of the .app directory',
            'Store binaries are FairPlay-encrypted at rest; runtime decryption (extraction) is required',
            'The binary is in a proprietary Apple format',
            'Copying is fine — the archive is immediately usable'
          ],
          answerIndex: 1,
          hint: 'What does the App Store distribution layer wrap the binary in?',
          explanation:
            'FairPlay wraps store binaries in per-device encryption; the on-disk object is ciphertext. Extraction tooling dumps the decrypted image from process memory on the device — that decrypted copy is the analyzable binary.'
        },
        {
          id: 'i08-l01-q2',
          type: 'truefalse',
          prompt: 'An extracted store IPA may be shared with colleagues outside the engagement for convenience.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the artifact legally represent, and what scope does your authorization cover?',
          explanation:
            'False. The decrypted artifact exists under your assessment\u2019s authorization; redistribution leaves that scope (and the store\u2019s terms). Evidence chains also break when artifacts circulate uncontrolled.'
        },
        {
          id: 'i08-l01-q3',
          type: 'scenario',
          prompt:
            'The client sends an IPA as "the build our users have." Verification: profile present, dev authority chain. What conversation do you open?',
          hint: 'Module i06\u2019s contradiction detector fired — what is the fastest resolution?',
          explanation:
            'Point out the artifact is dev/ad-hoc-signed (profile + authority chain), not an Apple-distribution build, and ask for either the correct artifact or written confirmation that this build represents the engagement scope. Record the resolution in the acquisition record; findings will cite whichever channel is agreed.'
        },
        {
          id: 'i08-l01-q4',
          type: 'mcq',
          prompt: 'What does the three-command artifact verification establish?',
          options: [
            'That the app has no vulnerabilities',
            'Binary type/slice, identity/version from Info.plist, and signature authority — i.e., you hold a coherent IPA',
            'That FairPlay decryption succeeded',
            'The app\u2019s App Store rating'
          ],
          answerIndex: 1,
          hint: 'file, plutil, codesign — what does each one tell you?',
          explanation:
            'Architecture/slice (file), identity and version (plutil), authority and entitlement posture (codesign). Together: the artifact is coherent enough to analyze — catching channel or packaging surprises in minute one.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS basic security testing (acquisition and extraction principles)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s treatment of IPA acquisition and decryption concepts'
        },
        {
          title: 'OWASP MASTestApp-iOS (training target)',
          url: 'https://github.com/OWASP/MASTestApp-iOS',
          note: 'The sanctioned practice artifact for this module\u2019s workflows'
        },
        {
          title: 'Apple Developer — App distribution overview',
          url: 'https://developer.apple.com/documentation/xcode/distributing-your-app',
          note: 'Channel mechanics from the developer side (what each channel produces)'
        }
      ]
    },
    {
      id: 'i08-l02',
      moduleId: 'i08',
      title: 'The Binary Sweep: Strings, Symbols and Embedded SDKs',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['i08-l01', 'i04-l03'],
      objectives: [
        'Run a structured strings/symbols sweep over main binary, frameworks and extensions',
        'Interpret Objective-C and Swift symbol surfaces as an audit map',
        'Inventory embedded SDKs and predict their security-relevant behaviors'
      ],
      diagram: 'ios-re-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Before any decompiler runs, the cheap tools answer most questions: strings dumps reveal literals (URLs, keys, feature names), symbol tables reveal the app\u2019s and SDKs\u2019 vocabularies, and the embedded-framework inventory reveals third-party code whose behavior you inherit. The sweep is deliberately boring and fast — its output organizes everything after it.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-re-workflow',
            caption: 'Where the sweep sits: extraction → identification → structure → metadata → then deep RE.'
          },
          { type: 'h', text: 'The commands' },
          {
            type: 'terminal',
            title: 'The sweep, structured',
            lines: [
              '$ APP=Payload/TargetApp.app',
              '# literals from the main binary and every framework',
              '$ strings -a -arch all $APP/TargetApp | sort -u > strings-main.txt',
              '$ for f in $APP/Frameworks/*/*; do strings -a "$f" | sort -u; done > strings-sdks.txt',
              '# symbol surface (local + external)',
              '$ nm -m $APP/TargetApp | head -50',
              '$ nm -gU $APP/TargetApp | wc -l     # exported symbols count',
              '# ObjC class/method inventory from the binary itself',
              '$ otool -oV $APP/TargetApp | grep -E "class|name" | head -40',
              '# which frameworks does the binary link?',
              '$ otool -L $APP/TargetApp | head -30'
            ]
          },
          { type: 'h', text: 'Reading the output' },
          {
            type: 'list',
            items: [
              'URL-shaped strings (https?://, api., /v1/, .json) → endpoint inventory (next lesson)',
              'Key-shaped strings (key, secret, token, eyJ JWT prefixes, AKIA) → secrets candidates (next lesson)',
              'Feature vocabularies (isPremium, adminMode, debugFlag) → logic leads for decompilation (module i09)',
              'otool -L: linked frameworks — Security, CryptoKit, WebKit usage predictions; third-party SDK names you should recognize',
              'Symbols surviving stripping → function-level map; stripped binaries push you to strings + ObjC metadata (which survive — module i03-l02\u2019s structural point)'
            ]
          },
          { type: 'h', text: 'SDK inventory' },
          {
            type: 'p',
            text:
              'Frameworks/ names (AnalyticsKit, PinningLib, FraudShield) cross-checked against otool -L tell you whose code ships in the target. Each SDK inherits into your scope: analytics SDKs = data egress paths (privacy), pinning SDKs = network controls to evaluate (i14), security SDKs = anti-analysis implementations to map (i21). The sweep\u2019s SDK table — name, version string if present, apparent role — is a scope document reviewers actually read.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The sweep produces the audit map: which literals, which classes, which SDKs — decompilation (i09) then targets specific symbols instead of wandering',
              'Stripping judgment: binaries with local symbols stripped still expose ObjC metadata and strings — the sweep is your surface either way',
              'SDK versioning: version strings in binaries correlate with public advisories — known-vulnerable SDK versions are findings with citations',
              'Every sweep artifact is evidence: keep the .txt outputs next to the acquisition record'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Strings that name environments (stage, dev, internal, vpn.corp) — endpoint sprawl',
              'Suspicious literals: base64-ish blobs, PEM headers, JWT fragments in code',
              'Feature-flag vocabularies that gate security behavior (disablePinning, debugTLS, mockAuth)',
              'SDKs whose names you do not recognize — research before dynamic testing; unknown SDKs are the wild cards',
              'otool -L showing crypto libraries loaded but no obvious usage — follow the lead in decompilation'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the command block above on your training app; keep every output file',
              'Grep the outputs by category (URLs, keys, flags, SDK names) and build the four inventory tables',
              'Cross-check: does the SDK table explain the otool -L list? does the strings inventory corroborate Info.plist claims (schemes, ATS)?',
              'Mark each table row with its consuming module (endpoints → i14; keys → i13/i18; flags → i21) — the sweep is the handoff document'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A sweep that scoped an engagement. strings over a 40 MB banking binary produced: 6 environment URLs (prod + staging + 2 third-party processors), the string "PinValidationDisabled" (a flag name), and an SDK table of 9 frameworks including one unrecognized ("ObfuscateKit"). Follow-ups: the flag string led decompilation to a settings reader that honored a plist key — a real finding when the plist could be influenced (module i16 context); the unknown SDK turned out to be a repackaged open-source obfuscator (its version string matched a public repo), which the client confirmed — SDK inventory turning mystery into context. Total sweep time: twenty minutes.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'strings, nm, otool (macOS built-ins; rizin/radare2 alternatives cross-platform), plus the class-dump-family tools for richer ObjC headers (module i09). Keep the tooling boring: the sweep\u2019s value is coverage and organization, not cleverness.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Sweeping only the main binary — SDKs and extensions carry their own literals and symbols',
              'Reporting every string literal as a finding — the sweep produces candidates; judgment (and module i03-l03\u2019s legitimate-use corners) decides',
              'Skipping otool -L and missing the linked-framework picture — you inherit every SDK\u2019s behavior',
              'Discarding sweep outputs — they are evidence and the audit map for later modules'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full sweep on your training app and produce the four tables (URLs, keys, flags/vocab, SDKs). Annotate each table with the module that consumes it. Then answer: which single row would you decompile first, and why? That answer is your module i09 opening move.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'strings + nm + otool = the cheap, structured sweep that maps binaries before decompilation',
            'ObjC metadata and strings survive stripping — the sweep works on release binaries',
            'The SDK inventory inherits third-party behavior into your scope: analytics egress, pinning controls, anti-analysis',
            'Sweep outputs are evidence artifacts and the handoff map for decompilation and dynamic modules'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i08-l02-q1',
          type: 'mcq',
          prompt: 'A binary has local symbols stripped. Which audit surface remains?',
          options: [
            'Nothing — stripped binaries are opaque',
            'String literals and Objective-C runtime metadata (selectors, class names)',
            'Only the Info.plist',
            'Full Swift source recovery'
          ],
          answerIndex: 1,
          hint: 'What does the ObjC runtime structurally require to be present in the binary?',
          explanation:
            'Stripping removes local symbol names but cannot remove literals or the ObjC metadata dispatch requires (module i03-l02). Swift-only metadata is thinner — but strings remain, and the sweep adapts.'
        },
        {
          id: 'i08-l02-q2',
          type: 'truefalse',
          prompt: 'Finding the string "PinValidationDisabled" in a binary is, by itself, a reportable finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What separates a candidate from a finding in the sweep workflow?',
          explanation:
            'False — it is a lead. The finding requires understanding: who reads that flag, from where (plist? server response? debug build only?), and whether an attacker can influence it. Decompilation (i09) and dynamic confirmation convert the lead; the sweep only produced it.'
        },
        {
          id: 'i08-l02-q3',
          type: 'scenario',
          prompt:
            'otool -L shows a pinning SDK, and the SDK table shows version 2.3.1. What two follow-ups does the inventory demand?',
          hint: 'Known-vulnerable versions are citable findings. What do you check about the version, and what about usage?',
          explanation:
            '(1) Correlate the version with public advisories/changelogs — known weaknesses are findings with citations; (2) confirm actual usage in the app (which delegates/wrappers route through it) — a shipped-but-unused SDK is context, not attack surface. Both follow-ups come straight from the inventory row.'
        },
        {
          id: 'i08-l02-q4',
          type: 'mcq',
          prompt: 'What does otool -L contribute that strings cannot?',
          options: [
            'String literal sorting',
            'The list of libraries the binary links — the framework dependency picture',
            'Entitlement dumping',
            'Profile decoding'
          ],
          answerIndex: 1,
          hint: 'One command dumps load commands; the other dumps literals. Which is which?',
          explanation:
            'otool -L reads LC_LOAD_DYLIB load commands: every framework the binary binds. It is the dependency X-ray; strings is the literal X-ray. The sweep uses both because they answer different questions.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — otool manual (Mach-O inspection)',
          url: 'https://www.unix.com/man-page/osx/1/otool/',
          note: 'The inspection workhorse\u2019s option surface'
        },
        {
          title: 'OWASP MASTG — iOS static analysis techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s static technique chapters mirror this sweep'
        },
        {
          title: 'radare2/rizin (cross-platform binary tooling)',
          url: 'https://github.com/rizinorg/rizin',
          note: 'Non-macOS alternative for binary inspection workflows'
        }
      ]
    },
    {
      id: 'i08-l03',
      moduleId: 'i08',
      title: 'Secrets, Endpoints and Feature Flags',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['i08-l02'],
      objectives: [
        'Run the secrets sweep with judgment: what is actually sensitive, what is by-design public',
        'Build the endpoint inventory and its environment map (prod/staging/third-party)',
        'Identify feature flags and configuration that gate security behavior'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Two sweeps produce most static findings: secrets (what sensitive material ships in the artifact) and endpoints (where the app talks). Both are grep-class techniques — the skill is classification. A hardcoded API key that authorizes nothing is noise; the same string next to a payment endpoint is a headline. This lesson installs the classification rubric and the inventory formats.'
          }
        ],
        technical: [
          { type: 'h', text: 'The secrets sweep' },
          {
            type: 'terminal',
            title: 'Secret-shaped greps (run over sweep outputs + resources)',
            lines: [
              '$ grep -rE "(api[_-]?key|secret|token|password|passwd|pwd)" strings-*.txt | head -20',
              '$ grep -E "eyJ[A-Za-z0-9_-]{10,}" strings-main.txt      # JWT-shaped literals',
              '$ grep -rE "BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY" Payload/TargetApp.app/ 2>/dev/null',
              '$ grep -rE "(sk|pk)_(live|test)_" strings-*.txt          # payment-style keys',
              '$ grep -rE "[A-Za-z0-9+/]{40,}={0,2}" strings-main.txt | head   # base64-ish blobs',
              '# also sweep resource/config files (i04\u2019s inventory)',
              '$ grep -rE "(key|secret|token)" Payload/TargetApp.app/*.json Payload/TargetApp.app/*.plist 2>/dev/null'
            ]
          },
          { type: 'h', text: 'The classification rubric' },
          {
            type: 'table',
            headers: ['Candidate', 'Question to answer', 'Typical outcome'],
            rows: [
              ['API keys (sk_live_, AKIA…)', 'What does the key authorize? Is it public-by-design (client keys often are)?', 'Public-by-design → hardening note; privileged → finding'],
              ['JWT literals in code', 'Static token baked at build? Whose session does it represent?', 'Almost always a finding (debug leftover or broken design)'],
              ['Private keys / PEM', 'Why does a client binary hold a private key at all?', 'Critical finding; trace usage'],
              ['Base64 blobs', 'Decode: key material? config? assets?', 'Decode and classify before judging'],
              ['Passwords/credentials', 'Context: test accounts in code? default creds?', 'Finding if they ship to users; debug-only context matters'],
              ['OAuth secrets', 'Client secret in a public app?', 'Standard mobile OAuth caveat — report as design note unless abuse follows']
            ]
          },
          { type: 'h', text: 'The endpoint inventory' },
          {
            type: 'p',
            text:
              'From the URL-shaped strings plus config files (module i04), build: host, path prefix, environment (prod/stage/dev), and first-evidence source (binary string, plist, JSON). The environment map matters as much as the list: apps that ship staging endpoints ship attack surface (is staging publicly resolvable? does it share production credentials? — answerable only via authorized testing). Third-party processors (payments, analytics) get their own rows — their traffic will appear in module i14\u2019s captures and the inventory predicts it.'
          },
          { type: 'h', text: 'Feature flags and configuration' },
          {
            type: 'p',
            text:
              'Flags gating security behavior (pinning toggles, TLS validation switches, auth bypasses) are the sweep\u2019s highest-value class. Inventory: flag name, where defined (code literal, plist, remote config), and what the strings around it suggest it controls. Remote-config flags become dynamic tests (can you influence the response? module i14/i15); local flags become static/decompilation leads (i09) and possibly storage-influenceable (i13).'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The secrets table is report-ready: candidate, classification, evidence location (file/line in sweep output), and the dynamic confirmation it needs',
              'Endpoint inventory pre-loads network testing (i14) and answers "what did we NOT see?" (gaps between static and dynamic inventories are findings-shaped questions)',
              'Environment sprawl (staging endpoints) is a report line in its own right: scope, hygiene, and potential credential reuse',
              'Flag inventory feeds module i21\u2019s resilience evaluation — security controls that are toggleable invite the toggle question'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Key-shaped strings adjacent to payment/analytics SDK names (cross-reference the SDK table)',
              'Endpoints whose hostnames differ only by environment prefix (api. vs api-stage.) — credential-reuse questions',
              'Flags with "disable", "bypass", "debug", "mock" vocabularies',
              'Certificates/keys shipped in resources (.cer/.pem/.p12) — inventory and trace usage',
              'Remote-config URLs (config endpoints fetched at launch) — dynamic influence tests later'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the secret-shaped greps over all sweep outputs and resources; decode base64 candidates before judging',
              'Apply the rubric: classify each candidate (finding / note / noise) with a one-line justification',
              'Build the endpoint table with environment labels and evidence sources',
              'Build the flag table with definition location and control guess',
              'Write the three dynamic-confirmation priorities the tables produce (which secret to watch on the wire, which endpoint to exercise, which flag to try influencing) — these are i13/i14/i15 entries'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Classification in action. Sweep finds: "AIza…" (a Google API key), "eyJhbGciOi…" (JWT literal), "staging-api.targetapp.com", and flag "mockAuthEnabled". Rubric verdicts: the Google key — public-by-design client key, hardening note (restrictions documented in the finding); the JWT — decoded shows a long-expiry token for a service account → critical finding (ships to every user); staging endpoint — inventory row + environment-sprawl note (authorized reachability check planned); mockAuthEnabled — decompilation lead (i09) and flag-influence test (i15). Four candidates, four different outcomes — the rubric doing its job.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'grep/strings (the engines), a base64 decoder, JWT decoders (jwt.io or CLI), and key-detection utilities (trufflehog-style scanners accelerate but do not replace classification). Keep outputs as evidence; scanners\u2019 output needs the same rubric applied.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Filing every key as critical — public-by-design client keys are the classic overclaim that erodes report credibility',
              'Skipping resource/config files in the secrets sweep — plists and JSONs ship secrets as often as binaries',
              'Reporting staging endpoints as vulnerabilities without the authorized reachability check — scope the claim to what you verified',
              'Ignoring false-negative traps: obfuscated/encoded secrets need the decode-and-classify step, not just the literal greps'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run both sweeps on your training app and produce the three tables (secrets, endpoints, flags) with rubric verdicts. Then write the three dynamic-confirmation priorities. If the training app is well-built, some tables stay short — write the "checked and clean" lines anyway; diligence notes are report content too.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Secrets and endpoints are grep-class sweeps with judgment-class outputs — the rubric is the skill',
            'Public-by-design keys, JWT literals, private keys and credentials classify differently — learn the corners',
            'The endpoint inventory\u2019s environment map (prod/stage/third-party) pre-loads network testing',
            'Security-gating flags are the highest-value static leads — they become dynamic tests in i14/i15/i21'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i08-l03-q1',
          type: 'mcq',
          prompt: 'A client-side Google Maps API key ships in the binary with no restrictions. Correct finding posture?',
          options: [
            'Critical — hardcoded secrets are always critical',
            'Hardening note: public-by-design client key; report recommends key restrictions (referrer/bundle constraints)',
            'No report mention at all',
            'Critical — Google keys must never ship'
          ],
          answerIndex: 1,
          hint: 'What did the rubric say about public-by-design keys — and what hardening still applies?',
          explanation:
            'Client-side map keys are designed to ship; unrestricted ones are a hardening note (usage restrictions, quota alarms). Severity inflation here is the classic overclaim — but "no restrictions" is still worth a line because abuse costs the client money.'
        },
        {
          id: 'i08-l03-q2',
          type: 'truefalse',
          prompt: 'A base64-looking string found in strings output should be classified immediately as a secret.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What must happen to a blob before it can be classified at all?',
          explanation:
            'False — decode first. Blobs turn out to be keys (finding), configuration (context), or asset data (noise). The decode-and-classify step exists precisely because shape is not meaning.'
        },
        {
          id: 'i08-l03-q3',
          type: 'scenario',
          prompt:
            'The sweep finds flag "disableCertificatePinning" defined in code and readable from a settings plist. Name the two test paths this creates.',
          hint: 'Where can the flag be set, and what does each path require?',
          explanation:
            '(1) Static/decompilation: find the reader, confirm the flag gates the pinning wrapper, and map the plist path it reads (i09); (2) dynamic/storage-influence: if the plist lives somewhere the app or environment can write (module i13/i16 channels), attempt the toggle and observe the network behavior (i14) — a security control influenced by local configuration is a solid resilience finding (i21).'
        },
        {
          id: 'i08-l03-q4',
          type: 'mcq',
          prompt: 'Why does the endpoint inventory include third-party processor domains?',
          options: [
            'To report them as vulnerabilities',
            'To predict and recognize their traffic during dynamic testing, and to scope data-sharing observations',
            'Because third-party domains are always malicious',
            'To replace the proxy configuration'
          ],
          answerIndex: 1,
          hint: 'What will module i14\u2019s captures show, and what makes that interpretable?',
          explanation:
            'The inventory makes captures legible: known processor traffic is expected, unexpected domains are the interesting delta. It also supports privacy observations (what data goes where) without confusing third-party usage with vulnerability.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS — STORAGE/NETWORK/RESILIENCE categories',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard\u2019s categories behind secrets, endpoints and flags'
        },
        {
          title: 'Google API key best practices (public-by-design context)',
          url: 'https://developers.google.com/maps/api-security-best-practices',
          note: 'Vendor guidance that grounds the public-key classification'
        },
        {
          title: 'OWASP MASTG — iOS secrets detection tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test family this sweep implements'
        }
      ]
    },
    {
      id: 'i08-l04',
      moduleId: 'i08',
      title: 'Configuration Audit: ATS, Schemes, Entitlements, Flags',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i08-l02', 'i06-l03'],
      objectives: [
        'Consolidate the configuration findings from plists, entitlements and binaries into one audit',
        'Evaluate ATS exceptions, URL surface and build flags as a coherent set',
        'Produce the static findings document that dynamic modules confirm'
      ],
      diagram: 'ios-ats-decision',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'By now you hold a dozen configuration observations scattered across lessons: ATS keys from Info.plist, schemes from URL types, entitlements from signatures, flags from strings. The configuration audit consolidates them into one coherent document with verdicts — because configuration findings argue best together: an ATS exception next to a cleartext endpoint next to a pinning toggle is a posture story, not three footnotes.'
          }
        ],
        technical: [
          { type: 'h', text: 'The four configuration domains' },
          {
            type: 'list',
            items: [
              'Transport: ATS exceptions (i04-l02), cleartext usage (i08-l03 endpoints), certificate/pinning assets (pinset files)',
              'Invocation: URL schemes (declared), universal link domains (entitlements), document types, extension surfaces',
              'Capabilities: entitlements (i06-l03\u2019s table with coherence deltas)',
              'Build posture: flags, debug vocabularies, get-task-allow per binary, architecture slices present'
            ]
          },
          { type: 'h', text: 'Cross-domain verdicts' },
          {
            type: 'p',
            text:
              'The audit\u2019s value is interaction effects. Examples: ATS allows local networking + an internal endpoint in the inventory → does the app actually talk local protocols (proxy gap risk, i14)? Pinning assets present + a pinning-disable flag in strings → control coherence question. get-task-allow=false everywhere → instrumentation strategy decided; document it. Universal link domains + WebView code → the web-content ingestion path to test (i17). Each interaction is a report paragraph or a test entry — configuration read in isolation misses all of them.'
          },
          {
            type: 'diagram',
            id: 'ios-ats-decision',
            caption: 'One of the four domains, verdict-ready: every ATS key gets a justification verdict.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The static findings document structure: per-domain tables + interaction-verdict paragraphs + dynamic-confirmation queue — this is the artifact i24\u2019s report grows from',
              'Configuration findings have the best cost-to-fix ratio in mobile reports — present them prominently, not as appendices',
              'The queue (what dynamic evidence each static finding awaits) is the handoff to i10–i17 — static analysis that does not produce a queue has not finished',
              'Verdict discipline: every configuration observation ends as finding / hardening note / verified-clean — three-way classification keeps the report honest'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'ATS exceptions whose domains match nothing in the endpoint inventory (stale exceptions — cleanup findings)',
              'Schemes declared but unused in binaries (dead surface) and binaries opening undeclared schemes (dynamic claims)',
              'Entitlement coherence deltas (i06) that survived unexplained',
              'Debug/posture flags in release slices (get-task-allow=false but debug vocabularies present — pipeline hygiene notes)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Assemble the four domain tables from all prior modules\u2019 outputs (one page each maximum)',
              'Write the interaction-verdict paragraphs (aim for 3–5; each cites the rows it connects)',
              'Build the dynamic-confirmation queue: finding → confirming module → expected evidence',
              'Classify every observation three-way (finding / note / clean) — no "maybe" rows ship',
              'Version the document (date, artifact hash) — it joins the acquisition record in the evidence bundle'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One interaction paragraph, written out. "Transport posture is inconsistent: ATS carries NSAllowsArbitraryLoadsInWebContent (Info.plist, verified) while the endpoint inventory shows first-party API traffic only (no WebView-configured hosts identified statically — see i17 for runtime confirmation). The pinning assets (pinset.json) cover the first-party API. Net: web-content scope of the ATS exception appears wider than current usage requires; recommend narrowing to actual WebView domains. Dynamic queue: confirm WebView hosts at runtime (i17); confirm pinning enforcement on first-party traffic (i14)." Read alone, no single row says much; together they produce a finding and two test entries — the audit\u2019s compounding effect.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Nothing new — a document. The discipline is the tool: three-way verdicts, interaction paragraphs, versioned evidence. Editors and template habits matter more than scanners at this stage.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting configuration observations as a list without verdicts — clients cannot act on "here are some keys"',
              'Missing interaction effects by auditing domains in isolation — the compounding paragraphs are the value',
              'Shipping "maybe" rows — three-way classification (finding/note/clean) forces decisions',
              'Forgetting to queue dynamic confirmations — static findings without confirmation paths become disputes (i08-l01\u2019s provenance story in reverse)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write the full static findings document for your training app: four domain tables, three interaction paragraphs, the dynamic queue with module assignments. Then score yourself: how many queue entries reference specific expected evidence (a capture, a file, a hook observation)? Entries without expected evidence are unfinished thoughts — finish them now while the static context is fresh.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Four configuration domains — transport, invocation, capabilities, build posture — audited together, not in isolation',
            'Interaction verdicts (ATS × endpoints × flags × entitlements) produce the findings single rows cannot',
            'Three-way classification (finding / hardening note / verified-clean) keeps reports honest',
            'The dynamic-confirmation queue with expected evidence is static analysis\u2019s real deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i08-l04-q1',
          type: 'mcq',
          prompt: 'Which pairing is an interaction verdict rather than a single-domain observation?',
          options: [
            "ATS contains NSAllowsArbitraryLoads",
            "The endpoint inventory has five hosts",
            "Pinning assets exist AND a pinning-disable flag exists in strings — control coherence needs runtime evaluation",
            "The bundle id is com.target.app"
          ],
          answerIndex: 2,
          hint: 'Which option connects two domains and produces a question neither row asks alone?',
          explanation:
            'Interaction verdicts connect domains: pinning assets (transport assets) × disable flag (build posture) = coherence question with a dynamic test. Single rows are inputs; the verdicts are the audit\u2019s output.'
        },
        {
          id: 'i08-l04-q2',
          type: 'truefalse',
          prompt: 'A declared URL scheme with no references in any binary is best deleted from the audit as noise.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Dead surface still registers with the system. What does that mean for the device?',
          explanation:
            'False — it is a verdict (likely "hardening note: dead surface") but not deletion: the OS still registers the scheme, first-come rules apply (module i16), and other apps may probe it. Configuration audits classify, they do not silently drop.'
        },
        {
          id: 'i08-l04-q3',
          type: 'scenario',
          prompt:
            'Write one dynamic-confirmation queue entry for the static finding "ATS NSAllowsArbitraryLoadsInWebContent present".',
          hint: 'Which module observes WebView behavior, and what evidence closes the loop?',
          explanation:
            'Entry: "Confirm actual WebView hosts and navigation policies at runtime (i17): exercise web features, capture loads; expected evidence — capture or hook output listing WebView-loaded hosts; verdict condition — if hosts are first-party-only, downgrade exception to hardening note; if arbitrary content loads, escalate to finding." Queue entries name module, evidence and decision rule — that structure is what makes them executable.'
        },
        {
          id: 'i08-l04-q4',
          type: 'mcq',
          prompt: 'Why do configuration findings deserve prominent placement in reports?',
          options: [
            'They are always critical',
            'They have the best cost-to-fix ratio — often one-line changes with platform-verified remediation',
            'Clients prefer short reports',
            'They require no evidence'
          ],
          answerIndex: 1,
          hint: 'What does fixing an ATS exception or a stale entitlement cost versus fixing a design flaw?',
          explanation:
            'Configuration fixes are cheap, concrete and verifiable (rebuild with the key changed). That makes them high-value report content — developers act on them immediately, which is what reports are for.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS v2 — all categories (audit structure reference)',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard\u2019s category structure maps to the four audit domains'
        },
        {
          title: 'Apple Developer — ATS keys reference',
          url: 'https://developer.apple.com/documentation/security/preventing-insecure-network-connections',
          note: 'The transport domain\u2019s authoritative key catalog'
        },
        {
          title: 'OWASP MASTG — iOS configuration tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test families behind each configuration domain'
        }
      ]
    }
  ]
};
