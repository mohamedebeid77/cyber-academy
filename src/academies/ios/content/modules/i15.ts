import type { Module } from '../../../../types';

// LEVEL 7 — AUTH & ATTACK SURFACE · Module i15: Authentication & Authorization
// Original content synthesized from Apple LocalAuthentication documentation,
// OWASP MASTG auth chapters and OAuth 2.0 / JWT RFCs.

export const i15: Module = {
  id: 'i15',
  title: 'Authentication & Authorization',
  level: 7,
  description:
    'Login flows, token storage and refresh, biometric gates and their real security meaning, and the mobile-API authorization family: client-side trust, BOLA and business logic. The mobile client is never a boundary — this module teaches how to prove it, honestly and within scope.',
  outcomes: [
    'Evaluate local authentication (biometrics, passcode gates) for what it actually protects',
    'Test session management end to end: login, refresh, logout, revocation',
    'Execute authorized BOLA/business-logic probes against mobile APIs and attribute findings to the correct layer'
  ],
  lessons: [
    {
      id: 'i15-l01',
      moduleId: 'i15',
      title: 'Authentication Flows and Biometric Gates',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i14-l04', 'i05-l02'],
      objectives: [
        'Analyze login flows on the wire: credentials, token issuance, error handling',
        'Evaluate biometric gates (LAContext) for what they protect — and what they merely decorate',
        'Distinguish device-unlock from user-authentication semantics in biometric APIs'
      ],
      diagram: 'ios-auth-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Mobile authentication has two halves that teams routinely conflate: the remote flow (credentials → tokens → sessions, module i14\u2019s territory) and the local gate (biometrics/passcode deciding what the app shows). The recurring iOS finding is the second half wearing the first half\u2019s costume: a Face ID gate protecting UI while the API behind it honors any stolen token. This lesson evaluates both halves for what they actually protect.'
          }
        ],
        technical: [
          { type: 'h', text: 'The login flow, audited' },
          {
            type: 'list',
            items: [
              'Credential handling: are passwords sent over the pinned channel only? is the credential cached anywhere (i13\u2019s storage audit cross-check)?',
              'Error behavior: distinct vs generic errors (user enumeration via "no such user" responses), lockout behavior (brute-force posture — backend, observed from the seat)',
              'Token issuance: what the response grants (module i14-l04\u2019s anatomy) and where it lands (i13\u2019s storage verdict)',
              'MFA flows: where the second factor lives (TOTP app? push? SMS?) and what bypasses look like on the wire (MFA-remember flags, recovery paths — authorized probes only)'
            ]
          },
          { type: 'h', text: 'Biometrics: the API and its honest semantics' },
          {
            type: 'code',
            lang: 'swift',
            title: 'The LocalAuthentication shape every iOS pentester must read correctly',
            code:
              'let context = LAContext()\ncontext.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,\n                       localizedReason: "Unlock your vault") { success, error in\n    if success { self.showVault() }        // gates the UI...\n    // ...but the vault DATA came from the keychain/server long ago.\n}\n// Semantics that matter:\n// .deviceOwnerAuthenticationWithBiometrics  -> biometrics only\n// .deviceOwnerAuthentication               -> biometrics OR device passcode (fallback!)\n// The gate proves a person unlocked the DEVICE — it does not re-authenticate\n// to the SERVER, and it does not protect data already in memory.'
          },
          {
            type: 'list',
            items: [
              'Device-unlock vs user-authentication: LAContext proves the device owner (or passcode knower) is present — it is not a server re-auth and cannot be, alone',
              'The correct pattern: biometrics unlock a keychain item (WhenPasscodeSetThisDeviceOnly) whose CONTENT is the real credential — gate and secret bound together (module i05-l02\u2019s classes, applied)',
              'The decorative pattern (the finding): biometrics gate UI; the API token sits independently in storage and works without any gate — captured by pairing a forced UI path (or stolen-token use) with wire success',
              'Fallback semantics: WithBiometrics has NO passcode fallback (fails on biometric-less devices — availability bug); full Authentication falls back to passcode — know which the app chose and whether the choice matches its claims'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The biometric-gate finding family is the module\u2019s signature: gate-vs-data decoupling, proven with a forced-path observation + wire evidence',
              'Login-flow findings (enumeration errors, credential caching, MFA bypass shapes) are wire-observable and backend-fixable — report them as such',
              'Fallback-choice bugs (WithBiometrics on mandatory-passcode claims) are availability/correctness findings with clean one-line proofs',
              'Every local-gate finding states its layer: "client-side UI gate" — the server half (does the API honor ungated tokens?) is the severity argument'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'LAContext calls whose success handlers unhide data already loaded (the decorative shape) — static lead, confirmed with a forced path',
              'Biometric gates on features whose API calls fire regardless (background sync ignoring the gate)',
              'Login responses with distinguishable errors per failure cause (enumeration surface)',
              'MFA remember-this-device flags with token lifetimes longer than policy claims (wire evidence)',
              'Vault-style apps storing vault keys outside WhenPasscodeSetThisDeviceOnly items — the pattern-application failure'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Wire-audit the login flow (module i14-l02\u2019s channel): credential transport, error shape matrix, token issuance',
              'Static-locate the biometric decision (LAContext usage from i09\u2019s metadata) and classify the pattern (bound vs decorative)',
              'Dynamic-prove the gate: with an authenticated session, force the protected path (spawn/instrumented launch straight to the vault screen, or background/foreground bypass attempts) and observe what data appears without the gate',
              'Pair with wire evidence: do the protected feature\u2019s API calls succeed without the gate having run?',
              'Write the gate verdict: pattern, proof, and the server-side severity argument (what a stolen token reaches regardless of the gate)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The decorative gate, fully proven. Training bank app: Face ID gate on the accounts screen. Static: LAContext present, success handler unhides preloaded account data. Dynamic: instrumented launch routes directly to the accounts screen (gate never evaluates) — data renders fully. Wire: the screen\u2019s API calls succeed with the stored token. Verdict: "Biometric gate is decorative — UI-only; account data loads and renders without any local authentication, and the API honors the independently-stored token. Remediation: bind the gate to credential release (keychain WhenPasscodeSet + biometric-gated copy), not to UI visibility; server-side step-up for sensitive reads is the structural fix." Three artifacts, one pattern name, one structural remediation — the family\u2019s full shape.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The capture channel (login flows), Frida (forced paths, LAContext observation hooks), and the i09 metadata map (LAContext/LocalAuthentication vocabularies). The tests are pairing exercises — no new tooling.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting biometric gates as useless by default — the BOUND pattern (gate unlocks the actual credential) is legitimate and strong; the finding is the decoupled pattern',
              'Missing the fallback semantics — WithBiometrics vs full Authentication is a real behavioral difference with availability and security consequences',
              'Forcing paths destructively (crashing the app to skip gates) — forced-path observation should be clean and artifacted, not destructive',
              'Attributing backend flaws (enumeration errors, lockout absence) to the mobile client — the layer attribution keeps remediation routing correct'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the four-step test on your training app\u2019s biometric gate (if it has none, audit its login flow fully instead). Produce the gate verdict or the login-flow findings with paired artifacts. Then write the one-sentence layer attribution for each — the habit that routes remediation correctly.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Authentication is two halves: the remote flow (tokens/sessions) and the local gate (LAContext) — evaluate each for what it protects',
            'The signature finding is the decorative gate: UI-only biometrics with independently-usable credentials — proven by forced path + wire pairing',
            'The bound pattern (biometrics unlock the actual keychain credential) is the correct design — recognize it before reporting',
            'Layer attribution in every finding routes fixes to the right team'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i15-l01-q1',
          type: 'mcq',
          prompt: 'What does LAContext.evaluatePolicy actually prove when it succeeds?',
          options: [
            'The user re-authenticated to the backend',
            'A person authenticated to the DEVICE (biometrics or passcode per policy) at that moment',
            'The token is fresh',
            'The keychain item is unsealed'
          ],
          answerIndex: 1,
          hint: 'Whose database does the evaluation check against — the server\u2019s or the device\u2019s?',
          explanation:
            'It proves device-local authentication: the device owner (biometric or passcode, per policy) was present. It says nothing about server sessions or token validity — the reason gates must bind to credential release, not just UI.'
        },
        {
          id: 'i15-l01-q2',
          type: 'truefalse',
          prompt: '.deviceOwnerAuthenticationWithBiometrics falls back to the device passcode when biometrics fail repeatedly.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which policy name includes the fallback — and which does not?',
          explanation:
            'False — the biometrics-only policy has NO passcode fallback (it fails outright on biometric-less or injured-biometric devices); the full .deviceOwnerAuthentication includes the passcode fallback. Availability/security claims must match the policy the app chose.'
        },
        {
          id: 'i15-l01-q3',
          type: 'scenario',
          prompt:
            'A vault app uses Face ID and stores vault credentials in a WhenPasscodeSetThisDeviceOnly keychain item, unlocked only on gate success. Evaluate.',
          hint: 'Is the gate bound to the credential release, or decorating UI?',
          explanation:
            'This is the BOUND pattern — correct: the gate\u2019s success is required to read the credential itself (keychain class + gated read), so no UI bypass yields the secret. Verdict: verified-strong. The lesson\u2019s discipline cuts both ways — recognizing correct patterns prevents false findings.'
        },
        {
          id: 'i15-l01-q4',
          type: 'mcq',
          prompt: 'Login responses differ: "user not found" vs "wrong password". What is the finding and the layer?',
          options: [
            'A UI bug in the client',
            'User enumeration via distinguishable errors — a backend finding observed from the mobile seat',
            'A keychain problem',
            'An ATS exception'
          ],
          answerIndex: 1,
          hint: 'Who produces the error strings — and who must fix them?',
          explanation:
            'The backend produces the distinguishable responses; the finding (user enumeration) belongs to the server team. The mobile seat observes and reports it — layer attribution is the discipline that makes the report actionable.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — LocalAuthentication (LAContext)',
          url: 'https://developer.apple.com/documentation/localauthentication',
          note: 'The gate API\u2019s official semantics (policies, fallbacks)'
        },
        {
          title: 'Apple Developer — Keychain services with biometrics',
          url: 'https://developer.apple.com/documentation/security/keychain_services/keychain_items/using_keychain_to_manage_user_credentials',
          note: 'The bound pattern: gates that release credentials'
        },
        {
          title: 'OWASP MASTG — iOS local and remote authentication tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test families behind both halves'
        }
      ]
    },
    {
      id: 'i15-l02',
      moduleId: 'i15',
      title: 'The Client Is Not a Boundary: Client-Side Trust',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i15-l01', 'i11-l02'],
      objectives: [
        'Internalize the client-trust model: which decisions can live in the client, which cannot',
        'Execute the instrumentation + wire pairing that proves client-only enforcement',
        'Classify findings by the correct fix layer (client consistency vs server enforcement)'
      ],
      diagram: 'ios-auth-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The mobile app ships to attackers: its code can be read (modules i08/i09), its decisions observed (i11), its gates forged (i11-l02). Anything security-critical enforced ONLY client-side is therefore advisory. This lesson operationalizes that axiom: identify client-trusted decisions, prove their enforceability gap with the forge-and-capture pairing, and classify what the fix must be — server enforcement, or client-only UX truth.'
          }
        ],
        technical: [
          { type: 'h', text: 'The taxonomy of client-trusted decisions' },
          {
            type: 'table',
            headers: ['Decision', 'Client-only enforcement means', 'Correct enforcement layer'],
            rows: [
              ['Roles/admin UI', 'Cosmetic gate; API decides real access', 'Server authorization per request'],
              ['Feature entitlements', 'UI unlocks; backend must also gate', 'Server entitlement checks'],
              ['Price/amount fields', 'Client-computed totals are suggestions', 'Server recomputation'],
              ['Trial/subscription state', 'Flags flip; receipts are server-verified', 'Server receipt validation'],
              ['Content visibility', 'Client filtering only', 'Server-side filtering'],
              ['Step-up auth triggers', 'Client may prompt; server must require', 'Server policy on sensitive operations']
            ]
          },
          { type: 'h', text: 'The proving pattern: forge, then listen' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Locate the client decision (i09/i11-l03: gate methods, flags, role checks)',
              'Forge it (i11-l02\u2019s modification hook — stated reason, lab target)',
              'Listen (i14-l02\u2019s capture): what does the system do with the forged client state? API accepts? rejects? never consulted?',
              'Verdict: server-enforced (client bug is cosmetic — consistency note) vs client-only (real finding — the server trusted the client)',
              'Severity from impact: what the forged state actually reached (data? actions? money?) — with the wire artifacts as proof'
            ]
          },
          { type: 'h', text: 'Business logic, the honest scope' },
          {
            type: 'p',
            text:
              'Business-logic testing (rate limits, transfer flows, coupon semantics, sequence abuse) lives here too — and its discipline is scope-awareness: logic probes manipulate state and money-adjacent flows on real backends, so rules of engagement govern everything. The craft: model the intended flow (from static reading and observed behavior), enumerate its assumptions (order, uniqueness, idempotency, timing), and test assumptions gently and artifacted — module i24\u2019s methodology embeds this as its own phase.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The forge-and-listen pairing is the module\u2019s core instrument — every client-trust claim becomes a system-response artifact',
              'Findings classify into two fixes: server enforcement gaps (backend team, critical-eligible) and client consistency issues (cosmetic — hardening notes)',
              'The taxonomy table pre-empts overclaiming: not every forged flag is a vulnerability; the server\u2019s response decides',
              'Business-logic findings are the highest-value class in mature apps — and the most scope-sensitive; methodology discipline (i24) is part of the technique'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'isAdmin/isStaff/premium flags consumed by networking code (not just UI) — the dangerous consumption shape',
              'Prices, amounts, or discounts computed client-side and sent for acceptance — server-trust transfer shapes',
              'Entitlement checks reading local flags only (receipts never server-validated — wire shows no validation call)',
              'Client-side rate limiting or attempt counters as the only throttle (wire shows unlimited attempts)',
              'Flows assuming ordering/idempotency the server never enforced (double-submit shapes, from the business-logic model)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory client-trusted decisions from the static audit (i08/i09) into the taxonomy table with predicted enforcement layers',
              'For each prediction, run forge-and-listen: hook, forge, capture, verdict (server-enforced / client-only)',
              'For business-logic targets: model the intended flow, list assumptions, design gentle assumption tests within scope',
              'Write findings with the two-layer classification and impact-from-wire arguments',
              'Queue the remaining logic tests for the engagement\u2019s authorized phase (i24\u2019s methodology integrates them)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two forges, two verdicts. Training shop app: forge isPremium=true → UI unlocks; premium API returns 403 (server-enforced — cosmetic, consistency note). Forge cartTotal=1.00 → checkout request carries 1.00; server accepts and creates the order (client-only — critical: server trusts client-computed prices). Same instrument, same session pattern, opposite severities — the listen step is everything. The report\u2019s two entries route to two teams with two urgency levels, both artifact-backed.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida (forge hooks), the capture channel (the listen half), and the taxonomy table (your document). Business-logic modeling uses the static-audit artifacts (i09) — no new tools, sharper discipline.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating every client-only gate as a critical finding — the server\u2019s response decides severity; cosmetic gates are notes',
              'Reporting client-side computations as vulnerabilities without the wire proof of server acceptance',
              'Business-logic probes without scope discipline — state-touching tests beyond ROE are attacks, not tests',
              'Forgetting the forged-state cleanup — sessions/accounts left in forged states pollute subsequent evidence'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the taxonomy inventory for your training app (minimum four decisions) and run forge-and-listen on two. Write both verdicts with the layer classification. If one forge surprises you (prediction wrong), that surprise is the lesson — write down which column you misread and why.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Client-only enforcement is advisory; the taxonomy table predicts, the forge-and-listen pairing proves',
            'The server\u2019s response to forged state is the verdict — severity lives in what the forged state reached',
            'Two-layer classification (server gap vs cosmetic) routes fixes correctly and pre-empts overclaim',
            'Business-logic testing is model-assumptions-probe within ROE — methodology discipline is part of the technique'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i15-l02-q1',
          type: 'mcq',
          prompt: 'Forging a client-side admin flag unlocks admin UI, and admin API calls succeed with the forged session. Classification?',
          options: [
            'Cosmetic client issue',
            'Server-side authorization gap — the server trusts client-asserted role; critical finding with wire artifacts',
            'A UI bug',
            'Needs more client hooks to confirm'
          ],
          answerIndex: 1,
          hint: 'What did the wire show about who enforces admin access?',
          explanation:
            'The API accepted admin calls under the forged state — the server delegated authorization to the client. Critical (impact-gated), backend fix. The UI unlock is the visible symptom; the wire acceptance is the finding.'
        },
        {
          id: 'i15-l02-q2',
          type: 'truefalse',
          prompt: 'A client-side rate limiter that blocks the fifth login attempt is a valid security control against brute force.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who can bypass a client-side counter — and what does the wire show when they do?',
          explanation:
            'False — the attacker controls the client; the counter (and any client throttle) is bypassable at will. Wire evidence: unlimited attempts reach the API. Brute-force defense is server-side lockout/throttling; the client limiter is UX at best.'
        },
        {
          id: 'i15-l02-q3',
          type: 'scenario',
          prompt:
            'Design a gentle business-logic probe for a suspected double-submit flaw in a coupon flow (model: apply → checkout).',
          hint: 'What assumption does the flow make about the coupon\u2019s state after first use?',
          explanation:
            'Assumption: the coupon invalidates on first application. Gentle probe: apply the coupon once (baseline), then replay the apply/checkout sequence exactly once more within scope — observe whether the discount applies twice or the server rejects. Artifacts both ways; verdict from the server\u2019s behavior. One replay, not enumeration — the gentleness rule in action.'
        },
        {
          id: 'i15-l02-q4',
          type: 'mcq',
          prompt: 'Why does the taxonomy table include the "correct enforcement layer" column?',
          options: [
            'To make the table longer',
            'Findings route to fixes: the column names which team/layer must change — pre-emoting misrouted remediation',
            'Clients cannot fix anything',
            'It is required by MASVS'
          ],
          answerIndex: 1,
          hint: 'What happens to reports whose findings lack a fix owner?',
          explanation:
            'Reports without fix routing become arguments. The column forces the attribution at finding-writing time — server enforcement, client consistency, or both — which is what makes the report actionable.'
        }
      ],
      references: [
        {
          title: 'OWASP API Security Top 10 (BOLA, broken auth context)',
          url: 'https://owasp.org/API-Security/',
          note: 'The server-side vulnerability families client-trust findings map onto'
        },
        {
          title: 'OWASP MASTG — iOS resilience and tampering assessment framing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'Why client-only controls are advisory (the tampering assumption)'
        },
        {
          title: 'Frida — return value modification API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The forge instrument\u2019s API surface'
        }
      ]
    },
    {
      id: 'i15-l03',
      moduleId: 'i15',
      title: 'BOLA and Authorization Testing in Mobile APIs',
      difficulty: 'Advanced',
      minutes: 26,
      prerequisites: ['i15-l02', 'i14-l02'],
      objectives: [
        'Identify BOLA/BFLA surface from the endpoint/behavior table\u2019s identity columns',
        'Execute authorized, systematic object-access probes with two-account methodology',
        'Write authorization findings with impact, evidence and fix routing'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'BOLA (Broken Object-Level Authorization — OWASP API #1) is mobile testing\u2019s highest-yield family: endpoints addressing objects by id, servers trusting the client to send only its own ids. The technique is precise and scope-heavy: two accounts, systematic id swaps, careful evidence. This lesson turns the i14-l02 table\u2019s identity columns into an authorized probe plan and the probes into verdict-ready findings.'
          }
        ],
        technical: [
          { type: 'h', text: 'Surface identification' },
          {
            type: 'list',
            items: [
              'From the table: every endpoint with object ids in path/body (accounts, orders, documents, messages, profiles)',
              'Id shapes: sequential (10001, 10002 — enumerable), UUID (unguessable — but is the AUTHZ still tested?), compound (userId:objectId)',
              'Ownership markers: does the request carry an explicit owner claim (userId param — dangerous) or rely on session identity (correct)?',
              'Ranking: sensitivity × guessability × observed enforcement signals (the i14-l02 error-consistency notes)'
            ]
          },
          { type: 'h', text: 'The two-account methodology' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Provision two test accounts (A and B) per ROE; both exercise the target feature to create owned objects (A\u2019s order #X, B\u2019s order #Y)',
              'Probe: A\u2019s session requests B\u2019s object (id swap) — the single, controlled cross-access test per endpoint',
              'Observe: 403/404 (enforced — record the exact shape) vs 200 with B\u2019s data (BOLA confirmed — capture is the finding)',
              'BFLA variant (function-level): A\u2019s session invokes B/admin-scoped ACTIONS (cancel B\u2019s order, trigger B\u2019s export) — same methodology on function endpoints',
              'Document per endpoint: id shape, probe, response, verdict — the systematic table is what separates testing from poking'
            ]
          },
          { type: 'h', text: 'UUIDs and the honest limit' },
          {
            type: 'p',
            text:
              'Unguessable ids are NOT authorization: if the server never checks ownership, any leaked/shared/logged UUID yields the object. The test adapts: use legitimately-obtained cross-account references (shared documents, support flows, ids visible in responses) rather than enumeration — and the finding text says exactly that: "authorization not enforced; exploitability via any legitimate cross-account reference." Guessability affects reachability, enforcement decides the vulnerability.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'BOLA findings are usually critical (cross-user data access) with the cleanest possible evidence: one request, one response, one capture',
              'The systematic table (endpoint × probe × verdict) is the deliverable — reviewers verify method, not luck',
              'Fix routing is server-side (object-level authz checks); the mobile app is the observation seat — the layer rule again',
              'Scope discipline is absolute here: probes touch other accounts\u2019 data (your own test accounts) and backend state — ROE and gentleness govern'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Explicit userId/owner parameters in requests (client-asserted ownership — the reddest flag in the table)',
              'Endpoints returning 200-with-empty vs 404 inconsistently (enforcement drift between endpoints)',
              'Admin/function endpoints distinguishable only by parameter (action names in bodies — BFLA surface)',
              'Cross-account references leaking ids (share features, support replies, export files — the UUID-era reachability)',
              'Bulk endpoints (lists) that embed other users\u2019 objects in pagination edges — the subtle variant'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Build the probe plan from the table: ranked endpoints, id shapes, predicted verdicts',
              'Set up the two accounts per ROE; create owned objects on both; record the ids legitimately',
              'Run the probes: one cross-access per endpoint; capture everything; stop and escalate on unexpected sensitivity (real-user data — immediate scope conversation)',
              'Fill the systematic table; write findings (enforced / BOLA / BFLA) with impact sentences from the accessed data class',
              'Retest note: BOLA fixes are verifiable exactly — the same probe rerun post-fix is the retest (module i24\u2019s cycle)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One systematic row. Endpoint: GET /api/v2/orders/{id} (sequential ids). Probe: account A (order 10001) requests order 10002 (account B\u2019s). Response: 200 with B\u2019s full order (items, address, total). Verdict: BOLA confirmed — capture file, request/response pair. Finding: "Order-level authorization not enforced: any authenticated user can read any order by sequential id (probe: A\u2019s token reading B\u2019s order 10002). Impact: full cross-user order disclosure (PII + purchase data). Fix: server-side ownership check per object request; sequential ids are reachability amplifier, not root cause." One row, one finding, fix routed — the methodology\u2019s unit of work.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The proxy (request editing/replay), two provisioned test accounts, and the systematic table (document). No exotic tooling — BOLA testing is method and discipline; the tools you have had since module i07.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Enumerating broadly before establishing single-probe enforcement gaps — one cross-access per endpoint proves the flaw; mass enumeration is scope risk without added evidence',
              'Concluding "secure" from UUID ids — unguessability is not enforcement; the adapted test (legitimate cross-references) exists for exactly this',
              'Probing with real users\u2019 data accidentally (wrong test environment) — environment verification is step zero, always',
              'Reporting BOLA without the fix routing — the finding\u2019s value is the server-side ownership check it mandates'
            ]
          }
        ],
        tryIt:
          [
            {
              type: 'p',
              text:
                'On your training app\u2019s API (or a licensed training API), run the two-account methodology on two endpoints: one sequential-id, one UUID-shaped. Fill both systematic rows and write the verdict sentences. If both enforce correctly, the verified-clean rows are your deliverable — with the exact response shapes that prove enforcement.'
            }
          ],
        takeaways: [
          {
            type: 'list',
            items: [
            'BOLA/BFLA surface comes from the table\u2019s identity columns; ranking is sensitivity × guessability × enforcement signals',
            'Two-account methodology: one controlled cross-access per endpoint, captured — the systematic table is the deliverable',
            'Unguessable ids are not enforcement — adapted tests use legitimate cross-references; enforcement decides the verdict',
            'Scope and gentleness are absolute: test accounts, one probe per endpoint, ROE-governed'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i15-l03-q1',
          type: 'mcq',
          prompt: 'An endpoint uses unguessable UUIDs and A\u2019s token can read B\u2019s object via a legitimately-shared UUID. Verdict?',
          options: [
            'Secure — UUIDs prevent access',
            'BOLA: authorization is not enforced; UUIDs only affect guessability (reachability), and a legitimate reference exists',
            'Informational only — shared UUIDs are user error',
            'A client-side bug'
          ],
          answerIndex: 1,
          hint: 'What decides the verdict — id guessability or the server\u2019s ownership check?',
          explanation:
            'Enforcement decides: the server returned another user\u2019s object without an ownership check. UUIDs shape reachability; the missing check is the vulnerability. The finding text states the legitimate-reference path used.'
        },
        {
          id: 'i15-l03-q2',
          type: 'truefalse',
          prompt: 'BOLA findings are fixed by making ids random and unguessable.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the root cause column of the finding say the fix is?',
          explanation:
            'False — UUIDs are a reachability mitigations layer at best. The fix is the server-side object-level authorization check (verify the session\u2019s user owns/can-access the object per request). Random ids without checks fail the first leaked reference.'
        },
        {
          id: 'i15-l03-q3',
          type: 'scenario',
          prompt:
            'During a probe you unexpectedly receive another (non-test) user\u2019s data. What happens next, immediately?',
          hint: 'Scope conversation territory — what is the stop rule and the first action?',
          explanation:
            'Stop probing that path; do not enumerate further; document exactly what was received (minimal necessary evidence); notify the client contact immediately per ROE — accidental real-data access changes the engagement\u2019s posture and may trigger incident processes. The stop rule exists before the technique; memorize it here, not mid-engagement.'
        },
        {
          id: 'i15-l03-q4',
          type: 'mcq',
          prompt: 'Why is one cross-access probe per endpoint the standard, rather than broad enumeration?',
          options: [
            'Enumeration is technically hard',
            'One probe proves the enforcement gap; enumeration adds scope risk (and real-data exposure risk) without adding verdict quality',
            'Proxies cannot enumerate quickly',
            'Clients detect enumeration'
          ],
          answerIndex: 1,
          hint: 'What does the systematic table need from each endpoint — proof or volume?',
          explanation:
            'The verdict needs proof of the missing check — one request/response pair delivers it. Enumeration multiplies evidence volume and risk (real ids, backend load) without improving the verdict; the systematic table, not breadth, is the rigor.'
        }
      ],
      references: [
        {
          title: 'OWASP API Security Top 10 — API1: BOLA',
          url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/',
          note: 'The canonical definition and test framing'
        },
        {
          title: 'OWASP API Security Top 10 — API5: BFLA',
          url: 'https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/',
          note: 'The function-level variant\u2019s definition'
        },
        {
          title: 'OWASP MASTG — iOS API authorization testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The mobile-seat view of the same tests'
        }
      ]
    }
  ]
};
