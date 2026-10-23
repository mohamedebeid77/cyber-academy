import type { Module } from '../../../../types';

// LEVEL 6 — DATA & NETWORK · Module i13: Data Storage & Privacy
// Original content synthesized from Apple file-system/data-protection
// documentation and OWASP MASTG storage chapters.

export const i13: Module = {
  id: 'i13',
  title: 'Data Storage & Privacy',
  level: 6,
  description:
    'The storage deep-dive: pulling and diffing containers, auditing every artifact type (plists, SQLite, Core Data, caches, cookies, logs, pasteboard), keychain verification at the system level, backup and snapshot exposure, and the finding rubric that turns artifacts into report lines.',
  outcomes: [
    'Extract and diff app containers across triggers with full evidence hygiene',
    'Audit every storage artifact type with the correct reading tool and sensitivity rubric',
    'Verify keychain usage at the system boundary and reconcile with the static audit',
    'Assess backup, snapshot and pasteboard exposure as distinct attacker positions'
  ],
  lessons: [
    {
      id: 'i13-l01',
      moduleId: 'i13',
      title: 'Pulling and Diffing the Container',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i02-l03', 'i10-l02'],
      objectives: [
        'Extract app containers via the available channel for your artifact (dev build, backup, jailbreak)',
        'Run baseline-then-trigger diff pairs and attribute changes to features',
        'Produce the storage inventory table that structures the rest of the module'
      ],
      diagram: 'ios-data-container',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Storage findings start with the container — the app\u2019s one writable home (module i02-l03). This lesson makes pulling it routine for your artifact\u2019s channel, and installs the diff-pair discipline (i10-l02) as the storage workflow\u2019s backbone: what changed, after which trigger, with what content.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-data-container',
            caption: 'Interactive container map — now you will walk it for real.'
          },
          { type: 'h', text: 'Extraction per channel' },
          {
            type: 'list',
            items: [
              'Dev builds (non-jailbroken): Xcode → Devices → Download Container — full container, clean channel, the default for labs',
              'Store builds (non-jailbroken): backup the device (Finder/libimobiledevice/pymobiledevice3), parse the backup\u2019s app-domain files — partial but real; encrypted backups need their own handling (and the unencrypted default is itself a finding context)',
              'Jailbroken lab: plain SSH/file access to the container path — everything, including system-side artifacts the other channels miss',
              'Simulator: files sit directly on macOS disk (~/Library/Developer/CoreSimulator) — convenient for triage, never for device claims (i07-l02)'
            ]
          },
          { type: 'h', text: 'The diff-pair protocol' },
          {
            type: 'terminal',
            title: 'Baseline → trigger → diff',
            lines: [
              '# 1. baseline pull (dev build)',
              'xcrun devicectl device copy --device <UDID> \\',
              '  --domain-type appDataContainer --domain-identifier com.target.app ./baseline',
              '# 2. trigger: login + the feature under test',
              '# 3. second pull → ./after',
              '# 4. diff',
              '$ diff -rq baseline after | tee container-diff.txt',
              'Only in after/Library/Preferences: added-session.plist',
              'Files baseline/Library/Cookies/Cookies.binarycookies and after/… differ',
              '# 5. inspect changed contents',
              '$ plutil -p after/Library/Preferences/added-session.plist',
              '$ sqlite3 after/Library/Application%20Support/app.db ".tables"'
            ]
          },
          { type: 'h', text: 'Attribution discipline' },
          {
            type: 'list',
            items: [
              'One trigger per diff pair when hunting a specific finding; broader flows for general inventory',
              'System noise (network caches, thumbnail stores) appears too — classify before attributing',
              'Record trigger, build, timestamp with every pair (i08-l01\u2019s evidence hygiene, storage edition)',
              'The inventory table: path → artifact type → trigger that wrote it → sensitivity guess → reading tool → finding-candidate?'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The inventory table IS the storage test plan — every row is either a finding candidate or a verified-clean line, and the report needs both',
              'Diff pairs attribute writes to features: "token written on login to Preferences" is a finding sentence; "token exists in a plist" is not',
              'Channel honesty: dev-build pulls and backup parses show the same app data but different completeness — name the channel per artifact',
              'The pull channel doubles as the delivery mechanism for module i11/i14 confirmations (files referenced by hooks and captures)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Preferences plists holding token/credential-shaped values (the classic, from i08\u2019s static claims — now confirmed or refuted in bytes)',
              'SQLite/Core Data stores with unencrypted sensitive tables (users, sessions, messages)',
              'Caches holding sensitive response bodies or images (screenshot-class content in Caches/)',
              'Cookies persisting past logout (the i10-l02 pattern at rest)',
              'Files written to Documents/ that belong in caches, or vice versa — hygiene signals that often co-occur with real findings'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Extract the container via your artifact\u2019s channel; record the channel in the evidence bundle',
              'Run three diff pairs: login, core feature, logout — one trigger each',
              'Build the inventory table from all three diffs; classify every changed file',
              'Read every candidate with its proper tool (next lesson formalizes the toolkit)',
              'Write the verified-clean lines too — "logout writes no credential artifacts" is a report sentence when evidenced'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One pair, one finding, one clean line. Login pair: after/Library/Preferences gained a plist with auth_token (finding candidate — read next lesson) and Library/Cookies changed (candidate). Logout pair: Preferences unchanged (token persists — confirms the i10-l02 wire finding), Cookies rewritten without the session cookie (server-side invalidation did half the job). The logout pair produced one finding (token persistence) and one clean line (cookie hygiene) — pairs always do both, and both belong in the report.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Xcode container download (dev builds), Finder/libimobiledevice/pymobiledevice3 backups (store builds), SSH (jailbroken labs), diff and a plist/SQLite viewer for reading. All configured since module i07 — this lesson is their storage-specific choreography.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Single-point pulls without baselines — attribution reopens, rebuttals survive',
              'Reporting backup-parse completeness as if it were a full container — channel differences matter for "what we could not see" statements',
              'Treating simulator file access as device evidence — triage yes, findings no',
              'Skipping the classification step — system noise misattributed to app behavior poisons the inventory'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the three-pair protocol on your training app and produce the inventory table (minimum six rows including at least one verified-clean). Then mark which rows confirm static claims from i08 — the static-to-dynamic closure is this module\u2019s connective tissue.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Extraction channels: Xcode (dev), backup parse (store), SSH (jailbroken), disk (sim-only) — name yours per artifact',
            'Diff pairs attribute writes: one trigger per pair, system noise classified, evidence labeled',
            'The inventory table is the storage test plan — findings candidates AND verified-clean lines',
            'Channel honesty and classification discipline are what make container evidence review-proof'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i13-l01-q1',
          type: 'mcq',
          prompt: 'Which extraction channel yields the COMPLETE container of a store build on a stock device?',
          options: [
            'Xcode Download Container',
            'Unencrypted backup parse',
            'None — store builds on stock devices expose only backup-visible data; full access needs a jailbroken lab',
            'Simulator disk path'
          ],
          answerIndex: 2,
          hint: 'What does Xcode container access require, and what does a backup include?',
          explanation:
            'Xcode\u2019s Download Container requires dev-build/debug context; backups include only backup-flagged data. Store builds on stock devices give partial visibility via backups — the completeness statement in your report must name that limit (or the jailbroken lab that removes it).'
        },
        {
          id: 'i13-l01-q2',
          type: 'truefalse',
          prompt: 'A file appearing in the "after" pull but not the baseline proves the tested feature wrote it.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What else runs during a trigger — and what step classifies those writers?',
          explanation:
            'False by itself — system services, SDKs and background tasks write too. Attribution needs the classification step (path, type, writer plausibility) and ideally a re-run isolating the trigger. Pairs attribute after classification, not before.'
        },
        {
          id: 'i13-l01-q3',
          type: 'scenario',
          prompt:
            'The logout diff shows Library/Preferences/auth_token.plist unchanged. Write the finding sentence this supports.',
          hint: 'What did the wire evidence (i10-l02) already show about this token — and what does persistence at rest add?',
          explanation:
            '"Session credentials persist across logout in plaintext preferences (container diff, unchanged after logout), consistent with wire-observed reuse (i10-l02 capture) — client-side session invalidation is not implemented at the storage layer." Two channels, one sentence — the static claim, wire truth, and rest truth closed the loop.'
        },
        {
          id: 'i13-l01-q4',
          type: 'mcq',
          prompt: 'Why do verified-clean lines belong in the storage report section?',
          options: [
            'To pad the report',
            'They scope the test honestly: features checked and found clean prevent the "you must have missed X" dispute and show diligence',
            'Clients require clean lines by policy',
            'They convert to findings later automatically'
          ],
          answerIndex: 1,
          hint: 'What does a reviewer need to trust the coverage claim?',
          explanation:
            'Negative evidence with artifacts (the diff pairs) is what makes "we tested storage" a claim a reviewer can verify. Clean lines are the coverage proof; findings are the content. Reports need both.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — File system basics (container layout)',
          url: 'https://developer.apple.com/documentation/foundation/file_system',
          note: 'The container map this lesson walks'
        },
        {
          title: 'OWASP MASTG — iOS local storage testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test families behind each artifact type'
        },
        {
          title: 'pymobiledevice3 — backup and container tooling',
          url: 'https://github.com/doronz88/pymobiledevice3',
          note: 'The scriptable extraction channel'
        }
      ]
    },
    {
      id: 'i13-l02',
      moduleId: 'i13',
      title: 'Reading Every Artifact: Plists, SQLite, Core Data, Caches',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['i13-l01'],
      objectives: [
        'Read each storage artifact type with its proper tool and interpret sensitivity',
        'Apply the finding rubric: what data, where, reachable by whom, with what protection',
        'Decode binary formats (cookies, snapshots) that hide sensitive content'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The inventory table\u2019s rows become findings here. Each artifact type has a proper reading tool and a sensitivity rubric: plists are XML with no protection beyond file classes; SQLite needs schema-and-table reading; Core Data hides in its own persistence layer; cookies are a binary format with session truth; caches hold response-shaped data nobody intended as durable. This lesson is the reading toolkit and the rubric applied per type.'
          }
        ],
        technical: [
          { type: 'h', text: 'Per-type reading' },
          {
            type: 'table',
            headers: ['Artifact', 'Tool', 'What to read for'],
            rows: [
              ['Preferences plist', 'plutil -p', 'Token/PII keys, feature flags, last-user state'],
              ['Any plist (info/config)', 'plutil -p', 'Endpoints, flags, embedded credentials'],
              ['SQLite', 'sqlite3 (.schema, SELECT)', 'Table names first; then sensitive columns; check PRAGMA for encryption absence'],
              ['Core Data', 'store in Application Support; open with sqlite3 or a Core Data browser', 'ZENTITY tables; model shapes; sensitive attributes in the clear'],
              ['Cookies.binarycookies', 'binary cookie parser (scripts/tools)', 'Domains, names, expiry, secure flag — session truth at rest'],
              ['Caches (files/db)', 'file + preview + strings', 'Response bodies, images, API payloads cached verbatim'],
              ['Snapshots (SplashBoard)', 'image viewer (dev-build pull)', 'Screen content of sensitive pages (i10-l03\u2019s test, artifact edition)'],
              ['Logs in container', 'text reader', 'Tokens/PII printed by the app (i10-l02\u2019s finding, rest edition)']
            ]
          },
          { type: 'h', text: 'The finding rubric' },
          {
            type: 'list',
            ordered: true,
            items: [
              'What: identify the data precisely (a JWT? a session cookie? raw PII? a refresh token?) — decode tokens to name lifetime and scope (module i14 covers JWT anatomy)',
              'Where: exact path and artifact type — the sentence\u2019s anchor',
              'Reachable by whom: backups (flagged or not), local attackers, sibling processes via sanctioned groups (module i05-l01\u2019s crossings)',
              'Protected how: none / data-protection class / app-level crypto (module i18 evaluates the last honestly)',
              'Verdict: finding / hardening note / verified-clean — three-way, always (i08-l04\u2019s rule)'
            ]
          },
          { type: 'h', text: 'Sensitivity judgment, calibrated' },
          {
            type: 'p',
            text:
              'Not every token is equal: a 15-minute access token in a plist is a hardening note if refresh requires biometrics; a 30-day refresh token in the same plist is a finding. Device names and screen dimensions in analytics payloads are noise; precise location history in a cache is a headline. The rubric forces the reachability question per row — that is what calibrates severity instead of vibes.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Findings from this lesson are the storage section\u2019s body: every row cited with path, tool output and rubric verdict',
              'JWT/cookie decoding connects storage to network testing (module i14): lifetimes and scopes read at rest pre-load the wire analysis',
              'Snapshot and cache reads materialize the privacy findings (i05-l03) with visual artifacts — the most persuasive evidence class in mobile reports',
              'The rubric\u2019s reachability column is what separates iOS storage findings from Android-habit overclaims (module i01-l04\u2019s transfer trap, closed)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Long-lived tokens (decode the JWT: exp claims) in weakest-class artifacts (Preferences, Documents)',
              'Core Data/SQLite with sensitive entities and no encryption attribute — check for NSPersistentStoreFileProtectionKey usage too',
              'Cookies with long expiry on auth domains, or missing secure flags',
              'Cached API responses containing other users\u2019 data (multi-account apps) — cross-account cache leakage',
              'Snapshots of screens the app itself marks sensitive (the overlay fix absent is the finding\u2019s remediation line)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'For each inventory row: read with the proper tool; capture the output as the artifact',
              'Apply the rubric\u2019s five steps per candidate; decode tokens/cookies to ground the "what"',
              'Write the finding sentences: data + path + reachability + protection (or its absence)',
              'Reconcile with static (i08) and runtime (i11-l04) evidence — the three-way agreement is the strongest form',
              'Sort the section: findings, hardening notes, verified-clean — the storage section drafts itself from the sorted table'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Rubric on one row. Row: Library/Preferences/com.app.plist contains "refresh_token". What: decoded JWT — 30-day expiry, offline_access scope. Where: Preferences plist (module i02-l03: plaintext XML, backup-included). Reachable by: unencrypted backup on any syncing computer; local attacker on device (after-first-unlock file class); no sibling-app path (no shared groups). Protected how: none — no file protection override, no app crypto. Verdict: finding. Sentence: "A 30-day offline-access refresh token is stored in unencrypted preferences, included in unencrypted backups; recoverable by any computer used for syncing." Five rubric steps, one defensible paragraph — the reading toolkit\u2019s entire purpose.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'plutil, sqlite3, a Core Data browser, a binary-cookies parser (community tooling — verify current maintenance), image viewers for snapshots, and JWT decoders. All standard; the skill is the rubric, not the tools.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting "token in plist" without decoding lifetime/scope — severity lives in the token\u2019s reality, not its presence',
              'Claiming backup reachability for backup-excluded files — check the flag before the claim (exclusion ≠ protection, but it does change THIS attacker path)',
              'Reading SQLite without schema-first — table guesses waste time and miss renamed entities',
              'Mixing artifact classes in one finding (cache + cookie + plist) — one artifact, one finding sentence; the section aggregates'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Apply the full rubric to your training app\u2019s three most sensitive inventory rows and write the three finding sentences. Then write one hardening note and one verified-clean line — the three verdict classes in one exercise, all artifact-backed.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Each artifact type has a proper tool and reading pattern — schema first for databases, decode for tokens/cookies',
            'The five-step rubric (what/where/reachable/protection/verdict) turns rows into defensible sentences',
            'Severity calibrates on token reality (lifetime, scope) and reachability — never on "secret-looking string"',
            'Three-way reconciliation (static, runtime, at-rest) is the strongest storage evidence form'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i13-l02-q1',
          type: 'mcq',
          prompt: 'Two identical-looking tokens in plists: one is a 15-minute access token, one a 30-day refresh token. Same artifact, same location. Why different severities?',
          options: [
            'Length of the strings differs',
            'Token lifetime and scope: the refresh token extends access long after theft; the access token\u2019s window is short — reachability times impact',
            'JWTs are always more sensitive than cookies',
            'There is no difference — same finding twice'
          ],
          answerIndex: 1,
          hint: 'What does decoding the tokens tell you that presence alone does not?',
          explanation:
            'Reachability (same) × impact (different): a stolen 30-day offline-access refresh token sustains access; a 15-minute access token expires quickly (though chaining via refresh matters — which is exactly why the refresh token\u2019s storage is the headline).'
        },
        {
          id: 'i13-l02-q2',
          type: 'truefalse',
          prompt: 'A file marked isExcludedFromBackup cannot appear in a storage finding about backup reachability.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'The exclusion changes one attacker path. Does it change the finding class — or just that path\u2019s claim?',
          explanation:
            'False as stated — the finding class may stand with the backup path corrected: the file remains plaintext on device (local-attacker reachable), just not backup-reachable. The rubric\u2019s reachability step exists precisely to make this distinction accurately.'
        },
        {
          id: 'i13-l02-q3',
          type: 'scenario',
          prompt:
            'A multi-account app\u2019s cache contains account B\u2019s data while account A is logged in. Compose the finding.',
          hint: 'What is the data, what is the unusual reachability angle, and who is the harmed party?',
          explanation:
            '"Application caches retain account B\u2019s personal data while account A is active (artifact: Caches/…, visual confirmation); switching accounts does not purge per-account caches — a user of a shared device can access the previous account\u2019s cached content." Cross-account cache leakage: the reachability angle is the OTHER user of the device — a real and reportable position.'
        },
        {
          id: 'i13-l02-q4',
          type: 'mcq',
          prompt: 'Why read SQLite schema-first before querying for sensitive data?',
          options: [
            'SQLite refuses queries without it',
            'Renamed/minified entity and column names make table guesses unreliable — schema reveals the real model before you search it',
            'Schema reading decrypts the file',
            'It is required for Core Data only'
          ],
          answerIndex: 1,
          hint: 'What do apps do to table names that defeats naive SELECT guesses?',
          explanation:
            'Obfuscation and framework naming (Core Data\u2019s Z-prefixed generated names, minified schemas) make "SELECT * FROM users" a coin flip. .schema first maps the real model — the search then targets actual sensitive entities.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — SQLite and Core Data persistence',
          url: 'https://developer.apple.com/documentation/coredata',
          note: 'The persistence layer whose on-disk shape you read'
        },
        {
          title: 'OWASP MASTG — iOS data storage tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The per-artifact test families'
        },
        {
          title: 'Apple Developer — NSData file protection options',
          url: 'https://developer.apple.com/documentation/foundation/nsdata',
          note: 'The protection classes referenced by the rubric\u2019s protection step'
        }
      ]
    },
    {
      id: 'i13-l03',
      moduleId: 'i13',
      title: 'Keychain Verification at the System Boundary',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i13-l02', 'i11-l04'],
      objectives: [
        'Verify keychain items\u2019 classes and access groups with system-level tooling',
        'Reconcile runtime keychain observation with static claims and storage artifacts',
        'Evaluate shared keychain groups as a scope/over-breadth question'
      ],
      diagram: 'ios-keychain-dp',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The Keychain is the storage the app cannot read raw — which makes verifying it a system-boundary task: Frida hooks at SecItem* (module i11-l04) observe decisions; lab-device tooling (jailbroken or debug contexts) inspects items at rest; static claims (i08/i06) predict what should be there. The finding form is reconciliation: does actual keychain usage match the audit\u2019s expectations, and where it does not, why?'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-keychain-dp',
            caption: 'The classes decide availability timing — this lesson verifies which were actually chosen.'
          },
          { type: 'h', text: 'The verification channels' },
          {
            type: 'list',
            items: [
              'Runtime (any build with a hook path): SecItemAdd/CopyMatching hooks log item class, accessibility, access group, and value shapes — the decision record as it happens',
              'At rest (jailbroken lab or device-decrypted contexts): keychain inspection tooling lists items with their classes — the stored record',
              'Static (i06/i08): dumped code shows intended classes/constants — the intent record',
              'The reconciliation table: item → intent (static) → decision (runtime) → stored (at-rest) → verdict'
            ]
          },
          { type: 'h', text: 'What reconciles into findings' },
          {
            type: 'list',
            items: [
              'Intent vs decision drift: code asks for WhenUnlockedThisDeviceOnly, runtime shows AfterFirstUnlock (wrapper defaults overriding intent — a real, common defect)',
              'Weak classes on high-value items: Always/AfterFirstUnlock on refresh tokens (module i05-l02\u2019s rubric, now with decision-record evidence)',
              'Access-group breadth: items in shared groups wider than the feature set (i06-l03\u2019s over-breadth question, answered with actual item lists)',
              'Dual-storage: the same secret in keychain AND plist (the i11-l04 pattern, confirmed at both boundaries)'
            ]
          },
          { type: 'h', text: 'Shared groups, as a scope question' },
          {
            type: 'p',
            text:
              'Keychain access groups exist to let the app\u2019s own extensions share secrets. The audit question is proportionality: which items live in shared groups, and does each extension need them? Findings read: "Session token shared to [group] readable by widget and share extension; neither requires it (feature inventory)" — over-breadth is the finding, presence is not (i06-l03\u2019s capability-vs-misuse rule, storage edition).'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Keychain findings are among the most defensible in mobile reports: system-boundary evidence (decision records) is hard to rebut',
              'The reconciliation table often exposes wrapper-default drift — a finding class invisible to pure static or pure dynamic work',
              'Shared-group over-breadth findings pair with module i16\u2019s extension tests (does the extension actually leak what it can read?)',
              'Uninstall persistence questions (do items survive app deletion?) are answerable only in lab contexts — and belong in reports only with the environment named'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'ThisDeviceOnly absent on device-binding claims (the app\u2019s "device-bound session" marketing vs migratable items)',
              'WhenPasscodeSetThisDeviceOnly unused where passcode-binding claims exist',
              'Items written per-login with no deduplication (unbounded growth — hygiene signal, often co-occurs with class drift)',
              'CopyMatching calls with broad queries (kSecMatchLimitAll on credential classes) — app-internal enumeration patterns worth understanding before i15/i21 tests'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the SecItem* hook session (i11-l04 script) across login/logout/feature flows; save the decision record',
              'If your lab permits, capture the at-rest item list; else mark the channel unavailable in the reconciliation table (honesty row)',
              'Extract the intent record from static dumps (class constants in code)',
              'Build the reconciliation table; write verdicts per item (match / drift / finding)',
              'Proportionality pass on shared groups: item list × extension needs — write the over-breadth verdicts'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Drift caught by reconciliation. Static intent (i08): SecurityWrapper calls SecItemAdd with kSecAttrAccessibleWhenUnlockedThisDeviceOnly for the session token. Runtime decision record: SecItemAdd logged with kSecAttrAccessibleAfterFirstUnlock — the wrapper\u2019s default parameter silently won. At-rest (lab): item stored AfterFirstUnlock. Verdict: "Session token stored AfterFirstUnlock despite code-level intent (WhenUnlockedThisDeviceOnly); wrapper default overrides explicit constants (SecurityWrapper.m, function X). Impact: token readable after first unlock rather than requiring unlock at read time." Three channels, one drift, exact remediation — reconciliation is why all three channels exist.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Your Frida SecItem scripts (i11-l04 — now a permanent part of the storage workflow), keychain inspection tooling on lab devices (jailbroken contexts), and the static dumps. The reconciliation table is a document — the tools only fill its columns.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Single-channel keychain claims ("static shows weak class" without the runtime record) — wrapper drift makes static-only wrong in both directions',
              'Reporting accessibility classes without the value\u2019s sensitivity — class findings are severity-ranked by what the item IS',
              'Assuming uninstall clears all items — empirical lab question, environment-named answer only',
              'Treating shared-group presence as over-breadth without the feature-need check — proportionality is the test, not presence'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the full reconciliation table for your training app\u2019s keychain usage (runtime record required; at-rest marked honestly if unavailable). Write one drift or over-breadth verdict if the table produces one — and if it produces none, write the coherent-statement verdict with the evidence rows that prove it.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Keychain verification is three-channel reconciliation: intent (static), decision (runtime hooks), stored (at-rest lab)',
            'Drift findings (wrapper defaults overriding intent) are invisible to single-channel work',
            'Accessibility-class findings rank by item sensitivity; shared-group findings are proportionality questions',
            'The reconciliation table with honest channel-availability rows is the deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i13-l03-q1',
          type: 'mcq',
          prompt: 'Static code shows WhenUnlockedThisDeviceOnly; the runtime record shows AfterFirstUnlock. What happened and what is the finding?',
          options: [
            'The static analysis misread — trust the runtime',
            'Wrapper/default drift: an API default overrode the explicit intent — the token is readable earlier than intended (drift finding with exact remediation)',
            'The runtime hook lied',
            'Both are correct simultaneously'
          ],
          answerIndex: 1,
          hint: 'Which channel shows intent, which shows reality — and what mechanism sits between them?',
          explanation:
            'The wrapper (or a default parameter path) substituted the class at the call site. The finding is the drift plus its impact (readability window) — and the remediation is code-level (fix the call path), which static-only work would have missed entirely.'
        },
        {
          id: 'i13-l03-q2',
          type: 'truefalse',
          prompt: 'A session token in a keychain group shared with two extensions is a finding by default.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Capability vs proportionality — what must you check before the word finding?',
          explanation:
            'False — proportionality decides: if an extension genuinely needs the item, sharing is the intended design. Over-breadth (shared but unneeded) is the finding. Check the feature inventory, then write the verdict.'
        },
        {
          id: 'i13-l03-q3',
          type: 'scenario',
          prompt:
            'No jailbroken lab is available this engagement. How does the reconciliation table handle the at-rest column?',
          options: [
            'Fill it with assumptions',
            'Mark the channel unavailable; the table runs on intent + decision records, and the report states the coverage limit',
            'Skip keychain testing entirely',
            'Use simulator keychain data as a substitute'
          ],
          answerIndex: 1,
          hint: 'What does honest scoping (i07-l02) say about channels you could not exercise?',
          explanation:
            'Mark unavailable and state the limit. Intent + decision records still carry most findings (drift included); the report\u2019s "not covered" line is what keeps the coverage claim review-proof. Simulator keychain is not a device substitute (i07-l02).'
        },
        {
          id: 'i13-l03-q4',
          type: 'mcq',
          prompt: 'Why is the runtime decision record (SecItem hooks) the most defensible keychain evidence?',
          options: [
            'It is the newest tooling',
            'It records what the app actually requested at the system boundary — regardless of wrappers, defaults or documentation claims',
            'It is the easiest to collect',
            'It bypasses access-group checks'
          ],
          answerIndex: 1,
          hint: 'Which channel cannot be wrong about what was asked of the system?',
          explanation:
            'The hook observes the actual API call — the request that securityd evaluates. Static shows intent (drift-able), at-rest shows result (lab-gated); the decision record is the ground truth of the app\u2019s choice, which is what findings need.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Keychain Services API',
          url: 'https://developer.apple.com/documentation/security/keychain_services',
          note: 'The API boundary the hooks observe'
        },
        {
          title: 'Apple Platform Security — Keychain data protection',
          url: 'https://support.apple.com/guide/security/keychain-data-protection-secb0694df1a/web',
          note: 'Class semantics behind the reconciliation verdicts'
        },
        {
          title: 'OWASP MASTG — iOS keychain testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test family this verification implements'
        }
      ]
    },
    {
      id: 'i13-l04',
      moduleId: 'i13',
      title: 'Backups, Pasteboard and Privacy Channels',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i13-l02'],
      objectives: [
        'Assess backup exposure as a distinct attacker position with testable artifacts',
        'Test pasteboard handling for sensitive-data leakage and stale-content risks',
        'Close the privacy channels: snapshots, notifications, and data-egress consistency'
      ],
      diagram: 'ios-privacy-tcc',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Storage findings generalize beyond the container: backups copy flagged data to computers; the pasteboard crosses app boundaries with attacker-writable content; snapshots and notifications leak sensitive UI content outside the app\u2019s walls. Each is a distinct attacker position with its own test — and each closes a finding family the container alone cannot.'
          }
        ],
        technical: [
          { type: 'h', text: 'Backups' },
          {
            type: 'list',
            items: [
              'Mechanics: Finder/iCloud backups include container data by default (minus excluded files and keychain-less secrets); unencrypted backups are readable by anyone with the file',
              'Test: run the backup parse (i13-l01\u2019s store channel) and grep the parsed domain for the sensitivity inventory (tokens, PII, caches)',
              'Finding form: "Artifact X is included in unencrypted backups; any computer used for syncing yields it" — the reachability sentence from the rubric, attacker-position edition',
              'Nuance: encrypted backups change the claim (strong passphrase assumed) — state which backup mode your test used'
            ]
          },
          { type: 'h', text: 'Pasteboard' },
          {
            type: 'list',
            items: [
              'Cross-app by design; iOS notifies when apps read the pasteboard (the paste notification) — but sensitive data placed there persists and other apps (and the user\u2019s next paste) expose it',
              'Test A (leak-out): does the app copy sensitive values (tokens, account numbers) to the pasteboard implicitly? (observe UIPasteboard writes via hooks or feature behavior)',
              'Test B (leak-in): place attacker-chosen content (oversized strings, crafted URLs, format-shape payloads); paste into the app\u2019s import fields — input-handling findings (module i16\u2019s crossing, pasteboard edition)',
              'Stale-content risk: sensitive data left on the pasteboard after the feature completes — retention observation'
            ]
          },
          { type: 'h', text: 'Privacy channels, closing set' },
          {
            type: 'list',
            items: [
              'Snapshots: the switcher-card test (i10-l03) with container artifact confirmation — remediation: privacy overlay on backgrounding',
              'Notifications: do sensitive payloads (message previews, one-time codes) appear on the lock screen? (settings-dependent — test both)',
              'Egress consistency: TCC-gated data (i05-l03) should never appear in backups/caches/logs — cross-check the privacy inventory against every storage channel'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Backup findings have the cleanest attacker model in storage: "any computer the user syncs with" — reviewers grasp it instantly',
              'Pasteboard leak-in tests are module i16\u2019s untrusted-input family in disguise — the crossing is user-mediated but attacker-influenced',
              'Notification/snapshot privacy findings are visual and instant to verify — high report value per minute spent',
              'The egress-consistency cross-check unifies privacy and storage sections — one table, two report sections, one data-flow story'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Copy-to-pasteboard on tokens/codes without user intent (copy buttons are fine; implicit copies are the finding)',
              'Backup parses containing cache/data classes the app claims are ephemeral',
              'Notifications rendering full message bodies or one-time codes with no privacy setting honored',
              'Sensitive screens whose snapshots appear (i10-l03) — cross-referenced with the app\u2019s own "sensitive" labels',
              'Pasteboard reads on app foregrounding that swallow content silently (the "we checked your clipboard" pattern — UX and privacy note)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Backup: parse your store/dev backup; grep the parsed domain for inventory terms; artifact the hit list with paths',
              'Pasteboard A: hook UIPasteboard setters through core flows; log what the app writes implicitly',
              'Pasteboard B: stage crafted content; use the app\u2019s paste/import features; observe handling (and pair with i16\u2019s URL-input tests)',
              'Snapshots/notifications: the two visual tests with settings matrix (lock screen on/off)',
              'Egress consistency: merge the privacy inventory (i05-l03) with every storage channel\u2019s hits — write the cross-section paragraph'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The backup paragraph, written out. Backup parse of the training app\u2019s domain yields: Library/Preferences (with the 30-day refresh token from i13-l02), Caches/ with two API response bodies containing account balances, and Documents/export-report.pdf with full transaction history. Sentence: "The app\u2019s data domain, as delivered in unencrypted device backups, contains long-lived credentials, financial data in caches, and full transaction exports; any computer used for device syncing obtains this data without authentication. Encrypted-backup mode mitigates; data minimization (exclusions for caches, credential storage in keychain) is the structural fix." Three artifacts, one attacker position, one structural remediation — the backup channel\u2019s shape.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Backup parsing (libimobiledevice/pymobiledevice3 or Finder + community parsers), Frida pasteboard hooks (your script library grows again), the device\u2019s own Settings/lock screen for the visual tests. Nothing exotic — these channels are observation-heavy by design.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting backup exposure without stating the backup mode tested (encrypted vs not) — the claim\u2019s validity depends on it',
              'Treating deliberate copy buttons as implicit-copy findings — user intent is the difference; hooks show which is which',
              'Forgetting lock-screen settings in notification tests — the finding is settings-dependent and must say so',
              'Siloing privacy channels from storage findings — the egress-consistency paragraph is where both sections\u2019 value compounds'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run all four channel tests on your training app (backup parse, pasteboard A/B, snapshot+notification). Write the backup paragraph and the egress-consistency paragraph. The consistency paragraph — one story across TCC, storage, backup and pasteboard — is the module\u2019s capstone sentence: if it reads cleanly, your data-flow story is complete.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Backups, pasteboard, snapshots and notifications are distinct attacker positions with their own tests and artifacts',
            'Backup findings state the mode tested; pasteboard tests split leak-out (implicit writes) from leak-in (crafted content)',
            'Visual privacy tests (snapshot, notification) are instant-to-verify and settings-dependent — say which settings',
            'The egress-consistency paragraph unifies privacy and storage into one data-flow story'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i13-l04-q1',
          type: 'mcq',
          prompt: 'Which backup claim is correctly stated?',
          options: [
            "The app\u0027s data is in backups — critical finding",
            "The app\u0027s data domain appears in UNENCRYPTED Finder backups (mode tested: default); encrypted-backup mode was not tested — reachability extends to any syncing computer in that mode",
            "Backups are always encrypted by iOS",
            "Backup findings need no mode statement"
          ],
          answerIndex: 1,
          hint: 'Which detail makes the claim valid — and which limitation makes it honest?',
          explanation:
            'Mode-stated claims with untested-mode disclosure are the standard. Unencrypted backups are the realistic default for many users; the finding\u2019s reachability sentence inherits the mode\u2019s honesty.'
        },
        {
          id: 'i13-l04-q2',
          type: 'truefalse',
          prompt: 'A copy button that puts the account number on the pasteboard is an implicit-copy finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What distinguishes user-intended copies from implicit ones?',
          explanation:
            'False — user-triggered copy actions are intended behavior (stale-content retention afterwards is the residual risk worth a note). Implicit copies (app writes sensitive values without user action) are the finding; the hook session distinguishes them.'
        },
        {
          id: 'i13-l04-q3',
          type: 'scenario',
          prompt:
            'Design the pasteboard leak-in test for an app with an "import from clipboard" feature. What content, what observation, what verdict rule?',
          hint: 'What does the crossing look like (i16\u2019s family), and what would confirm mishandling?',
          explanation:
            'Content: crafted payloads — oversized strings, URL-shaped strings targeting the app\u2019s own schemes, payload shapes the feature parses. Observation: import behavior + downstream handling (WebView loads? token flows? crashes?) with capture/diff channels armed. Verdict rule: crafted content reaching security-relevant sinks (WebView navigation, auth decisions) confirms mishandling; clean parse-and-store is a verified-clean line.'
        },
        {
          id: 'i13-l04-q4',
          type: 'mcq',
          prompt: 'What does the egress-consistency paragraph add that individual findings do not?',
          options: [
            'It duplicates the findings section',
            'It tells the single data-flow story: consented/protected data tracked across every channel (storage, backup, pasteboard, logs, network) — inconsistencies become visible as one narrative',
            'It replaces the privacy section',
            'It satisfies a formatting requirement'
          ],
          answerIndex: 1,
          hint: 'Each finding is a point; what is the paragraph?',
          explanation:
            'The paragraph is the system view: one data class, all channels, where protection held and where it leaked. Clients remediate flows, not points — and reviewers remember narratives, not lists.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — iOS backup encryption',
          url: 'https://support.apple.com/guide/security/encryption-and-data-protection-sec4ce6b6A7b0/web',
          note: 'Backup modes and what each protects — the mode-statement ground truth'
        },
        {
          title: 'Apple Developer — UIPasteboard',
          url: 'https://developer.apple.com/documentation/uikit/uipasteboard',
          note: 'The crossing API behind both pasteboard tests'
        },
        {
          title: 'OWASP MASVS — PRIVACY and STORAGE categories',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The two report sections the consistency paragraph unifies'
        }
      ]
    }
  ]
};
