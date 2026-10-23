import type { Module } from '../../../../types';

// LEVEL 6 — DATA & NETWORK · Module i14: Network Security
// Original content synthesized from Apple ATS/URLSession documentation,
// OWASP MASTG network chapters and tool documentation (Burp, mitmproxy).

export const i14: Module = {
  id: 'i14',
  title: 'iOS Network Security',
  level: 6,
  description:
    'iOS-specific network testing: the URLSession/ATS trust model, interception mechanics and capture analysis, certificate pinning evaluated honestly, and tokens/sessions/API-authorization observed on the wire. The proxy is configured since module i07 — this module makes it earn its keep.',
  outcomes: [
    'Explain ATS defaults, exceptions and server-trust evaluation as one coherent model',
    'Run capture-driven endpoint analysis against the static inventory',
    'Evaluate certificate pinning implementations with evidence, and state honestly what bypass means',
    'Analyze tokens, session handling and authorization behavior on the wire'
  ],
  lessons: [
    {
      id: 'i14-l01',
      moduleId: 'i14',
      title: 'The iOS Network Trust Model: URLSession and ATS',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i04-l02', 'i07-l03'],
      objectives: [
        'Explain ATS defaults and the exact semantics of each exception key',
        'Describe default server-trust evaluation and where apps legitimately (and illegitimately) intervene',
        'Map the trust model onto the audit questions the proxy tests will answer'
      ],
      diagram: 'ios-network-intercept',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS network security has two layers: App Transport Security (the configuration layer — what connections are even allowed) and server-trust evaluation (the runtime layer — what certificates are accepted). Both are strong by default and weakened by developer choice. The audit reads both: Info.plist for the configuration posture, code for trust interventions, and the wire for what actually happens.'
          }
        ],
        technical: [
          { type: 'h', text: 'ATS: the configuration layer' },
          {
            type: 'list',
            items: [
              'Defaults: TLS 1.2+, forward secrecy, SHA-2 signatures — cleartext HTTP refused for app connections',
              'NSAllowsArbitraryLoads: global opt-out — weakens everything; rare justification in modern apps',
              'NSAllowsArbitraryLoadsInWebContent: WebKit content only — scoped but still a real exception',
              'NSExceptionDomains: per-domain relaxations (TLS version floors, no forward secrecy, cleartext) — each entry is an audited claim',
              'NSAllowsLocalNetworking: local/LAN cleartext — legitimate for device-to-device features; audit what talks locally'
            ]
          },
          { type: 'h', text: 'Server trust: the runtime layer' },
          {
            type: 'p',
            text:
              'URLSession evaluates server certificates by default: chain to a trusted root, validity, hostname match. Apps may intervene via the authentication-challenge delegate — legitimate uses include pinning (comparing the presented chain against known material) and client-certificate flows; illegitimate uses accept whatever arrives (module i03-l03\u2019s trust-all shape). The audit question per intervention: does it strengthen (pinning) or weaken (skip evaluation) the default? — and the code answer pairs with wire behavior (next lesson).'
          },
          {
            type: 'diagram',
            id: 'ios-ats-decision',
            caption: 'Every ATS key is a scoped decision — the audit asks what each exception still covers.'
          },
          { type: 'h', text: 'The model → audit mapping' },
          {
            type: 'table',
            headers: ['Model element', 'Static evidence', 'Wire evidence (next lesson)'],
            rows: [
              ['ATS defaults intact', 'No NSAppTransportSecurity keys', 'No cleartext anywhere; modern TLS negotiated'],
              ['Scoped exceptions', 'NSExceptionDomains entries', 'Weaker TLS to exactly those domains — matches?'],
              ['Global opt-out', 'NSAllowsArbitraryLoads', 'Cleartext observed? If not: posture finding regardless'],
              ['Pinning', 'Pinning code/assets (i08)', 'Proxy refused despite trusted CA'],
              ['Trust-all override', 'Challenge handler shape (i03-l03)', 'Proxy accepted without device CA trust']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The two layers decouple findings: ATS posture (configuration) and trust behavior (runtime) fail independently — audit both',
              'User-installed CA trust is a platform feature (module i07-l03) — your proxy working is NOT a trust-evaluation finding; the finding shapes are refusal (pinning) and acceptance-without-cause (broken validation)',
              'ATS findings are cheap-to-fix report lines with the strongest remediation clarity (delete or scope the key)',
              'The static/wire mapping table is this lesson\u2019s deliverable — it pre-loads the next two lessons\u2019 test designs'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'ATS exceptions for domains absent from the endpoint inventory (stale configuration — cleanup finding)',
              'Exception keys weaker than needed (TLSMinimumVersion drops, no forward secrecy where the endpoint supports modern TLS)',
              'Challenge handlers present on sessions that need no customization (why does a plain API session override trust?)',
              'Multiple URLSession configurations with different trust behavior — the SDK-vs-first-party split that explains mysterious wire behavior'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Transcribe the ATS dictionary (module i04) into the posture table with per-key justifications demanded',
              'Inventory the trust interventions: challenge handlers, pinning libraries (i08\u2019s SDK table), security-framework usage — one row each with strengthen/weaken verdicts',
              'Write the audit questions the wire must answer (from the mapping table): which domains talk weak TLS? does the proxy get refused or accepted?',
              'Carry the questions to lesson 2 — this lesson\u2019s static model exists to make those captures interpretable'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Two-layer audit on one app. Configuration: NSExceptionDomains relaxes TLS for "cdn.partner.com" (no forward secrecy). Runtime: first-party sessions pin via a pinning library; analytics SDK runs its own unmodified URLSession. Wire predictions: partner CDN negotiates weak TLS (configuration working as configured — is the relaxation still needed?); proxy refused on first-party API (pinning — lesson 3 evaluates); proxy accepted on analytics (default trust — SDK posture note). Three predictions, all testable, all from the model — the audit is now a checklist rather than an exploration.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'plutil (ATS transcription), your i08 sweep outputs (trust-intervention inventory), and the proxy standing by. No new tools — this lesson organizes what you hold.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Conflating the layers: reporting ATS keys as "broken TLS validation" (they are configuration posture) or pinning as "ATS" (it is runtime trust)',
              'Treating user-CA proxy success as a validation finding (module i07-l03\u2019s rule — the platform feature vs the app\u2019s choice)',
              'Reading NSAllowsArbitraryLoadsInWebContent as global weakening — scope matters and the finding text must respect it',
              'Ignoring multiple URLSession configurations — SDK sessions behave differently than the app\u2019s own; the wire proves it per session'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the two-layer audit table for your training app (posture rows + trust rows + the wire questions each produces). Then write the three wire predictions. The table and predictions are the lesson\u2019s deliverable — captures in the next lesson grade them.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'ATS = configuration layer (what is allowed); server trust = runtime layer (what certificates are accepted) — audit both, conflate neither',
            'Every ATS key is a scoped developer decision with a demanded justification; every trust intervention is strengthen-or-weaken',
            'Proxy success via user CA is platform capability, not a finding — refusal and uncaused acceptance are the finding shapes',
            'The static/wire mapping table turns network testing from exploration into checklist execution'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i14-l01-q1',
          type: 'mcq',
          prompt: 'What is the scope of NSAllowsArbitraryLoadsInWebContent?',
          options: [
            'All app connections',
            'Content loaded by WebKit views only',
            'Only localhost connections',
            'Background downloads'
          ],
          answerIndex: 1,
          hint: 'The key\u2019s name names its scope — which component?',
          explanation:
            'WebKit content only (WKWebView/SFSafariViewController-class loading). First-party networking stays under ATS defaults — the finding text must reflect that scope, not borrow ArbitraryLoads\u2019 severity.'
        },
        {
          id: 'i14-l01-q2',
          type: 'truefalse',
          prompt: 'If your proxy intercepts an app\u2019s HTTPS after you enabled full trust for your CA, the app has broken certificate validation.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did the CA-trust step legitimately change about the device\u2019s trust store?',
          explanation:
            'False — full-trusted user CAs are legitimate chain anchors by platform design; default validation accepts them. Broken validation shows as acceptance WITHOUT the trust change (uncaused acceptance) or other bypass shapes — module i07-l03\u2019s claim discipline applies.'
        },
        {
          id: 'i14-l01-q3',
          type: 'scenario',
          prompt:
            'ATS relaxes TLS for cdn.partner.com, but the endpoint inventory shows no partner CDN usage in any code path. What verdict and why?',
          hint: 'Stale configuration is its own finding class — what is the remediation, and what wire question remains?',
          explanation:
            'Verdict: stale exception (hardening/finding line) — configuration permitting weakened TLS to an unused domain is unjustifiable surface; remediation: delete the exception. Wire question: confirm no partner-CDN traffic at runtime (captures) so the "unused" claim rests on two channels, not the static inventory alone.'
        },
        {
          id: 'i14-l01-q4',
          type: 'mcq',
          prompt: 'An analytics SDK\u2019s sessions get proxied while the app\u2019s own API sessions get refused. What does this tell you?',
          options: [
            'The SDK is insecure and the app is secure',
            'The two session stacks differ: the app pins (refusal), the SDK uses default trust (acceptance) — per-session trust behavior is real and must be audited separately',
            'The proxy is misconfigured per domain',
            'Nothing — proxies behave randomly'
          ],
          answerIndex: 1,
          hint: 'What did the model say about multiple URLSession configurations?',
          explanation:
            'Different stacks, different trust behavior — refusal on pinned sessions, acceptance on default-trust sessions. The audit covers every session stack (app + each SDK), which is why the trust-intervention inventory was per-component.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Preventing insecure network connections (ATS)',
          url: 'https://developer.apple.com/documentation/security/preventing-insecure-network-connections',
          note: 'The ATS key catalog and default semantics'
        },
        {
          title: 'Apple Developer — NSURLSession authentication challenges',
          url: 'https://developer.apple.com/documentation/foundation/urlsession',
          note: 'Server-trust evaluation and the legitimate intervention points'
        },
        {
          title: 'OWASP MASTG — iOS network communication testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The network test families this model feeds'
        }
      ]
    },
    {
      id: 'i14-l02',
      moduleId: 'i14',
      title: 'Interception in Practice: Captures and Endpoint Analysis',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['i14-l01', 'i10-l02'],
      objectives: [
        'Run the capture test matrix: baseline, feature flows, manipulation probes',
        'Analyze captures against the endpoint inventory — deltas, parameter shapes, auth flows',
        'Produce the endpoint/behavior table that feeds authorization testing'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Captures earn their keep when they answer the questions lesson 1 generated: which sessions get refused, which accepted, what parameters carry authorization, where cleartext hides. This lesson runs the capture matrix and reads it against the static inventory — turning the proxy from a traffic viewer into the wire-side half of every network finding.'
          }
        ],
        technical: [
          { type: 'h', text: 'The capture matrix' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Baseline (already standing from i07-l03): idle + launch + login + core flows',
              'Per-feature captures: one flow at a time, named files — traceability per endpoint',
              'Manipulation probes: repeat a request with edited parameters (ids, amounts, roles) — the authorization pre-tests (formalized in module i15)',
              'Refusal probes: which sessions reject your CA (the pinning map — lesson 3)',
              'Replay timing: does the same request succeed twice (replay/nonce behavior)?'
            ]
          },
          { type: 'h', text: 'Reading captures against the inventory' },
          {
            type: 'list',
            items: [
              'Inventory matches: known hosts/paths behaving as predicted — confirmations (clean lines)',
              'Deltas: unknown hosts (i10-l02\u2019s runtime-discovery), unexpected paths, absent predicted endpoints (why does the static inventory lie?)',
              'Parameter shapes: which parameters carry identity (user ids), authorization (tokens/roles), and state (amounts, actions) — the authorization attack surface map',
              'Auth flow anatomy: login request/response shapes, token refresh behavior, logout on the wire (does the session invalidate?)',
              'Error handling: how do endpoints respond to malformed probes — verbose errors leak internals (stack traces, SQL fragments, internal ids)'
            ]
          },
          { type: 'h', text: 'The endpoint/behavior table' },
          {
            type: 'table',
            headers: ['Column', 'Content', 'Feeds'],
            rows: [
              ['Endpoint', 'Method + path + host', 'The inventory\u2019s live edition'],
              ['Auth', 'Token type/location observed', 'i15 authorization tests'],
              ['Identity params', 'IDs in path/body', 'BOLA/IDOR probes (i15)'],
              ['Trust behavior', 'Refused/accepted by proxy', 'Lesson 3 pinning evaluation'],
              ['Sensitivity', 'What data the response carries', 'Privacy/egress section (i13-l04)'],
              ['Notes', 'Anomalies, verbose errors, replay behavior', 'Finding drafts']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The table IS the API-side test plan: module i15\u2019s authorization work consumes its identity/auth columns directly',
              'Manipulation probes in this lesson are gentle (parameter edits, replays) — their purpose is surface mapping; systematic authorization testing follows in i15 with client authorization',
              'Refusal maps pre-load pinning evaluation: per-session-stack refusal is the evidence lesson 3 needs',
              'Verbose-error captures are findings in their own right (information disclosure) with trivial-to-write sentences'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Sequential/guessable ids in identity parameters — the BOLA surface (i15 will probe systematically; note the shape now)',
              'Tokens in URLs (query strings) rather than headers — logging-leak-prone placement, finding-shaped',
              'Cleartext to any host (the ATS audit\u2019s wire confirmation)',
              'Endpoints responding 200 with embedded error payloads (silent failures that complicate authorization logic)',
              'Refresh-token requests triggered unexpectedly often — session-lifetime observations for i15\u2019s session analysis'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Execute the matrix on your training app: per-feature captures + two manipulation probes + refusal probes per session stack',
              'Fill the endpoint/behavior table from the captures (every column; one row per endpoint)',
              'Cross-check inventory deltas: unknown hosts classified (i10-l02\u2019s two moves), absent endpoints explained or reopened',
              'Draft findings from anomalies (verbose errors, tokens-in-URLs, cleartext) with capture artifacts cited',
              'Hand the table\u2019s identity/auth columns to module i15\u2019s queue — the wire half of authorization testing is now mapped'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One table row\u2019s full anatomy. Endpoint: GET /api/v2/accounts/{id}/balance. Auth: Authorization Bearer (JWT — decode: 15-min access token). Identity params: {id} in path (numeric, sequential — 10001, 10002…). Trust: refused by proxy (pinned session). Sensitivity: balance amounts + account names. Notes: probing {id}+1 returned account 10002\u2019s balance with OUR token (a manipulation probe that just found BOLA — module i15 will formalize, but the finding is already real and artifact-backed). One capture file, one row, one finding draft — the table\u2019s columns did the analysis.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Burp/mitmproxy (capture + the gentle manipulation: Repeater-class edits), JWT decoders for token anatomy, and the table template (your document). The heavy authorization tooling arrives with i15 — this lesson\u2019s power is disciplined capture reading.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Capture dumps without the table — traffic becomes wallpaper; the columns force the reading',
              'Aggressive manipulation during surface mapping (mass enumeration) — engagement scope and i15\u2019s systematic phase exist for that; map now, test then (and within authorization)',
              'Missing per-session-stack refusal probes — pinning evidence from mixed stacks is ambiguity, not evidence',
              'Ignoring responses\u2019 error verbosity — the cheapest finding class on the wire'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the matrix on your training app and produce the endpoint/behavior table (minimum five rows, all columns). Draft any anomaly findings and note which table columns i15 will consume. The table is the lesson\u2019s deliverable — and the bridge into authorization testing.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The capture matrix (baseline, per-feature, gentle manipulation, refusal, replay) converts the proxy into a test instrument',
            'Captures read against the inventory: confirmations, deltas, parameter shapes, auth anatomy, error verbosity',
            'The endpoint/behavior table is the API-side test plan — i15 consumes its identity/auth columns',
            'Refusal probes per session stack produce the pinning evidence lesson 3 requires'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i14-l02-q1',
          type: 'mcq',
          prompt: 'Why are manipulation probes during surface mapping kept gentle (single parameter edits, replays)?',
          options: [
            'Proxies cannot send aggressive traffic',
            'Surface mapping answers "what exists and what carries authorization"; systematic enumeration belongs to the authorized i15 phase with its own scope checks',
            'Aggressive probes crash apps',
            'Aggressive probes are detectable and all detection is bad'
          ],
          answerIndex: 1,
          hint: 'What phase boundary does the discipline respect — and why does scope care?',
          explanation:
            'Mapping and testing are different phases with different authorization intensities. Gentle probes establish shapes; systematic testing (enumeration especially) happens in i15 within explicitly authorized bounds. The discipline protects clients\u2019 systems and the engagement\u2019s legality.'
        },
        {
          id: 'i14-l02-q2',
          type: 'truefalse',
          prompt: 'A sequential account id in a path parameter is itself a vulnerability finding.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is the id shape (surface) vs the actual flaw (authorization enforcement)?',
          explanation:
            'False — guessable ids are surface description, not a flaw. The vulnerability exists only if the server fails to authorize access to others\u2019 ids (BOLA). The table records the shape; i15\u2019s authorized probes establish the enforcement truth.'
        },
        {
          id: 'i14-l02-q3',
          type: 'scenario',
          prompt:
            'Captures show the app sending tokens as URL query parameters on one endpoint. Write the finding and the remediation.',
          hint: 'Where do URL parameters end up (logs, proxies, caches) — and what is the standard placement?',
          explanation:
            'Finding: "Authentication tokens transmitted as URL query parameters on GET /api/…/history; URLs are logged across intermediaries (servers, proxies, analytics) extending exposure beyond the TLS channel. Artifact: capture file X." Remediation: move credentials to the Authorization header (standard placement); rotate any tokens observed. Placement is the flaw; the wire artifact is the proof.'
        },
        {
          id: 'i14-l02-q4',
          type: 'mcq',
          prompt: 'What do refusal probes (which sessions reject your CA) contribute to the engagement?',
          options: [
            'They prove the proxy works',
            'They map trust behavior per session stack — the per-stack evidence pinning evaluation (lesson 3) requires',
            'They confirm ATS is enabled',
            'They bypass pinning'
          ],
          answerIndex: 1,
          hint: 'Lesson 3 needs per-session evidence — which probes produce it?',
          explanation:
            'Refusal/acceptance per stack is the wire-side trust map: refused stacks carry pinning candidates for evaluation; accepted stacks carry default-trust posture notes. Without per-stack mapping, pinning claims drown in mixed-stack ambiguity.'
        }
      ],
      references: [
        {
          title: 'PortSwigger — Burp Suite documentation (Repeater, capture workflows)',
          url: 'https://portswigger.net/burp/documentation',
          note: 'The manipulation tooling used in the matrix'
        },
        {
          title: 'mitmproxy documentation',
          url: 'https://docs.mitmproxy.org/',
          note: 'The alternative capture platform'
        },
        {
          title: 'OWASP MASTG — iOS network capture analysis',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The capture-analysis test framing'
        }
      ]
    },
    {
      id: 'i14-l03',
      moduleId: 'i14',
      title: 'Certificate Pinning: Evaluation and Honest Bypass',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i14-l02', 'i11-l02'],
      objectives: [
        'Explain how pinning is implemented on iOS (delegate logic, libraries, assets)',
        'Evaluate pinning strength from its static and wire evidence',
        'Apply instrumentation-based bypass on authorized lab targets — understanding why it works and when it fails'
      ],
      diagram: 'ios-frida-hook-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Pinning is the app refusing your proxy on purpose: the server-trust decision compares presented material against app-known pins. Testing pinning is two questions: is it implemented correctly (evaluation), and — within an authorized engagement — can it be bypassed to continue testing (instrumentation)? This lesson covers both, with the honesty rule stated once: bypass techniques exist for authorized testing against controlled targets; they are not magic, and explaining why each works is the competence.'
          }
        ],
        technical: [
          { type: 'h', text: 'How pinning is implemented' },
          {
            type: 'list',
            items: [
              'Delegate-based: the authentication-challenge handler evaluates the trust object and compares against embedded pins (certificates or SPKI hashes — the pinset.json of module i04)',
              'Library-based: SDKs wrapping the same logic (i08\u2019s SDK table named them) with their own configuration',
              'Where the decision lives: SecTrust evaluation calls plus comparison logic — the hookable surface (below)'
            ]
          },
          { type: 'h', text: 'Evaluation: is the pinning any good?' },
          {
            type: 'list',
            items: [
              'Pin coverage: all session stacks pinned, or only first-party (SDK gaps from lesson 2\u2019s refusal map)?',
              'Pin freshness/redundancy: single pin (expires → bricking risk — availability concern) vs backup pins; pinset file readable in the bundle (i04) means pin rotation is code-adjacent',
              'Failure mode: fail-closed (connection refused) vs fail-open (accept on mismatch — a broken control worth a headline finding)',
              'The wire evidence: refusal shapes from lesson 2 + the static pinset + (on dev builds) hook observation of the comparison logic'
            ]
          },
          { type: 'h', text: 'Honest bypass, on authorized targets' },
          {
            type: 'code',
            lang: 'js',
            title: 'The instrumentation shape (lab target), and why it works',
            code:
              '// The decision funnels through SecTrust evaluation + the delegate\u0027s verdict.\n// Shape: hook the evaluation result so the delegate\u0027s comparison sees "trusted".\nvar SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");\nInterceptor.attach(SecTrustEvaluateWithError, {\n  onLeave: function (retval) {\n    retval.replace(ptr(1));        // force "evaluation succeeded"\n  }\n});\n// WHY it works: the delegate\u0027s comparison consumes the evaluation result;\n// forcing it true makes the app\u0027s own pin logic accept the proxy chain.\n// WHY it may fail: custom comparison implementations that ignore the result\n// and hash the chain themselves — then you hook the comparison (i11-l02 style)\n// or the delegate\u0027s completion. There is no universal script; there is reading\n// the actual implementation (i09) and hooking ITS decision.'
          },
          {
            type: 'list',
            items: [
              'The general method: find the app\u2019s actual decision point (delegate method, library wrapper, comparison function) via i09/i11-l03, hook THAT — the export-level hook above is the common fast path, not the universal one',
              'Why bypasses fail: custom hash comparisons, integrity checks around the trust code (module i21\u2019s anti-tamper watching the watchdog), native-only decision logic',
              'The honesty frame: bypass is an authorized-testing capability evaluated against lab/engagement targets; the report describes the control\u2019s strength (evaluation) — bypass capability is context, not the headline',
              'MASVS framing: pinning is a RESILIENCE/NETWORK control; the finding is its measured strength, not its existence'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Evaluation findings: fail-open pinning, single-pin availability risk, uncovered SDK stacks — each is a report line with static + wire evidence',
              'Bypass success/failure is engagement-mechanics: it unblocks (or fails to unblock) deeper testing; its reporting is measured as control strength',
              'The reading-the-implementation discipline keeps bypass honest: hooks that fire without understanding produce false confidence (and false bypass claims)',
              'Module i21 extends this: anti-tamper controls that watch pinning code — the resilience layer around the network layer'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Pinsets with a single pin and no backup (expiry-bricking risk — availability finding, often more impactful than security gaps)',
              'Pinning libraries at known-vulnerable versions (i08\u2019s version correlation)',
              'Fail-open shapes: mismatch handlers that log-and-continue (the headline bug)',
              'Bypass hooks that fire but traffic still refuses — another decision point exists (library layers); enumerate and read before claiming'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Evaluation: build the pinning picture (assets, libraries, delegate code from i09) + refusal map (lesson 2) → write the strength verdict per session stack',
              'Lab bypass: on your training app, run the export-level hook; observe refusal/acceptance; if it fails, find the actual decision point (trace + decompile) and hook that',
              'Record both the working shape AND the failed attempts — the failure path is the evidence you understand the control',
              'Write the honest report paragraph: control strength, bypass capability (authorized context), and what the user-facing security actually gained',
              'Queue update: what deeper testing did the bypass unblock (or what remains unreachable — scope honesty)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Evaluation that mattered more than the bypass. Training bank app: pinning library present, pins for first-party API, refusal confirmed on the wire. Bypass (export-level hook) failed; trace showed a second decision inside the library hashing the chain directly; hooking the library\u2019s comparison succeeded. Report: "Pinning implemented correctly (fail-closed, backup pins present) on first-party stacks; analytics SDK unpinned (gap). Bypass required hooking the library\u2019s internal comparison — feasible on instrumented builds, out of reach on stock store builds (no hook path), which is the control\u2019s practical strength." The evaluation produced two findings and one honest capability statement — bypass was the tool, not the story.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida (the hook shapes above), your i09/i11-l03 maps (finding the real decision points), objection\u2019s pinning-bypass commands (convenience cross-check after manual work), and the wire channel for refusal/acceptance truth. The manual-first order is deliberate: tools hide the reading that evaluation findings require.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Claiming "pinning bypassed" from a script that fired — verification is the wire accepting traffic, not the hook logging',
              'Reporting bypass capability as the headline — control strength is the finding; capability is authorized-context context',
              'Assuming one universal bypass script exists — implementations differ; the reading discipline is the method',
              'Missing fail-open shapes: a pinning control that accepts on mismatch is worse than none — headline it when seen'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full lesson on your training app: evaluation verdict per stack, one working bypass with the failed attempts recorded, and the honest report paragraph. If your app does not pin, write the "no pinning observed" verdict with the refusal-map evidence that proves it — a verified-clean line with artifacts.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Pinning lives in delegate/library decision logic; the audit reads assets, code, and per-stack wire refusal',
            'Evaluation findings: coverage gaps, single-pin risks, fail-open shapes — control strength is the headline',
            'Bypass = hook the app\u2019s actual decision point (reading first, hooking second); verification is wire acceptance',
            'Authorized-context honesty: bypass unblocks testing; reports describe control strength and practical reachability'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i14-l03-q1',
          type: 'mcq',
          prompt: 'Which pinning observation is the most severe finding?',
          options: [
            'Single pin with no backup',
            'SDK session stack unpinned',
            'Mismatch handler that logs and continues (fail-open)',
            'Pinset file readable in the bundle'
          ],
          answerIndex: 2,
          hint: 'Which shape means the control provides no protection at all against active interception?',
          explanation:
            'Fail-open: the control exists but accepts on mismatch — actively-wrong rather than absent. Single pins are availability risks, SDK gaps are coverage findings, readable pinsets are context; fail-open is the headline.'
        },
        {
          id: 'i14-l03-q2',
          type: 'truefalse',
          prompt: 'If your SecTrustEvaluateWithError hook fires and logs success, pinning is bypassed.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is the verification standard for a bypass claim?',
          explanation:
            'False — the wire verifies: your proxy must actually receive the app\u2019s TLS traffic. Custom comparisons can ignore the forced result (the exact failure mode in the lesson\u2019s script comments); hook logs are intent, wire acceptance is proof.'
        },
        {
          id: 'i14-l03-q3',
          type: 'scenario',
          prompt:
            'The export-level hook forces evaluation true, but the app still refuses the proxy. Design the next two moves.',
          hint: 'The decision lives elsewhere — which tools find it, and what do you hook then?',
          explanation:
            '(1) Find the real decision point: Frida trace over the pinning library\u2019s classes/methods (i11-l03) + decompile the delegate/comparison (i09-l03) — look for direct chain hashing or the completion-call logic. (2) Hook THAT point (i11-l02 style — argument/return manipulation at the comparison) and verify on the wire. Failed attempts get recorded — they are the evaluation evidence.'
        },
        {
          id: 'i14-l03-q4',
          type: 'mcq',
          prompt: 'Why does the report lead with control strength rather than bypass capability?',
          options: [
            'Bypass capability is uninteresting',
            'Clients act on control quality (coverage, failure modes, key management); bypass capability is tester-side context valid only in authorized, instrumented contexts',
            'Bypass cannot be verified',
            'Pinning findings are never actionable'
          ],
          answerIndex: 1,
          hint: 'What can the client actually fix — and in what context does bypass capability exist?',
          explanation:
            'Remediation targets control strength (add backup pins, close SDK gaps, fail-closed). Bypass capability describes your instrumented-lab reach, which production attackers on stock devices largely lack — honest context, not the verdict.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Server trust evaluation (sec_protocol / URLSession)',
          url: 'https://developer.apple.com/documentation/security/certificate_key_and_trust_services',
          note: 'The evaluation APIs the pinning logic consumes'
        },
        {
          title: 'OWASP MASTG — iOS anti-pinning and pinning tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s pinning evaluation and bypass technique framing'
        },
        {
          title: 'OWASP MASVS — NETWORK/RESILIENCE requirements for pinning',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The control-strength requirements the findings grade against'
        }
      ]
    },
    {
      id: 'i14-l04',
      moduleId: 'i14',
      title: 'Tokens, Sessions and API Authorization on the Wire',
      difficulty: 'Intermediate',
      minutes: 24,
      prerequisites: ['i14-l02'],
      objectives: [
        'Analyze token anatomy (JWT structure, claims, lifetimes) and storage-vs-wire consistency',
        'Evaluate session lifecycle behavior: refresh, logout, concurrent sessions, replay',
        'Map authorization enforcement on the wire — the client-trust question\u2019s server half'
      ],
      diagram: 'ios-auth-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Everything the app does locally (module i13\u2019s storage) meets its consequences here: tokens on the wire, sessions that live and die, and the authorization decisions the server actually enforces. This lesson reads the auth anatomy from captures — token structure, lifecycle behavior, enforcement patterns — and produces the server-side half of the module i15 findings.'
          }
        ],
        technical: [
          { type: 'h', text: 'Token anatomy' },
          {
            type: 'list',
            items: [
              'JWT shape: header.payload.signature — decode payload claims: sub (identity), exp/iat (lifetime), scope/role claims, aud (audience)',
              'Lifetime analysis: access vs refresh separation, expiry windows (module i13-l02\u2019s severity inputs, confirmed), clock behavior',
              'Algorithm notes: alg claim observations (none/HS/RS families — module i18 audits the crypto; the wire records what is used)',
              'Consistency: the wire\u2019s token (decoded) must match the storage claim (i13) — same token? same lifetime? drift is a finding lead'
            ]
          },
          { type: 'h', text: 'Session lifecycle on the wire' },
          {
            type: 'list',
            items: [
              'Refresh: when does refresh fire (expiry-proximity? every launch??), what rotates, what persists — the refresh-token value question from i13 resolves here',
              'Logout: does the server revoke (subsequent use fails) or the client merely discard (module i10-l02\u2019s pattern, completed)?',
              'Concurrent sessions: two devices — do both stay valid? revocation semantics matter for the threat model',
              'Replay: identical requests re-sent — accepted (no nonce/anti-replay) or rejected? per-endpoint truth',
              'Inactivity: does the session die server-side after idle, or live forever until logout?'
            ]
          },
          { type: 'h', text: 'Authorization enforcement, the server half' },
          {
            type: 'list',
            items: [
              'The client-trust question (module i15 formalizes): does the server enforce roles/scopes, or trust the client\u2019s claims?',
              'Wire evidence: role-tagged requests honored/rejected, admin endpoints behind client-only flags (i11-l02\u2019s forged gates, system response captured)',
              'Scope enforcement: tokens carrying scope claims — are they checked per endpoint, or decoration?',
              'Error consistency: 401 vs 403 vs 200-with-error-payload — enforcement quality signals the table (i14-l02) started'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Token findings close the storage loop: the 30-day refresh token (i13) now has its server-behavior half (revocation? rotation on refresh?) — severity completes with both halves',
              'Session lifecycle findings (no server-side logout revocation, infinite inactivity) are backend findings discovered from the mobile seat — reportable and fixable server-side',
              'Enforcement evidence (or its absence) is what makes i15\u2019s client-trust findings verdict-ready rather than hypothetical',
              'JWT claim analysis occasionally finds real bugs directly: excessive expiries, sensitive data in payloads (PII in JWTs — a classic), missing aud checks noted for backend teams'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Long-lived access tokens (not refresh-separated) — the lifetime finding at the wire',
              'Refresh flows that reissue identical or non-rotating refresh tokens — rotation absence',
              'Logout requests followed by successful authenticated calls (revocation absent — the i10-l02 pattern\u2019s server half)',
              'Sensitive claims inside JWT payloads (emails, PII) — decode and check; base64 is not encryption (module i18\u2019s rule, token edition)',
              'Role/scope claims present but never enforced (probe: does a scoped-down token still reach full endpoints? — within i15\u2019s authorized tests)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Decode every captured token: build the token table (type, claims, lifetime, storage counterpart)',
              'Run the lifecycle probes: refresh timing, logout + reuse, concurrent sessions (two devices/emulator contexts), replay, inactivity — within scope, artifacted',
              'Pair with i11-l02/i15\u2019s client-side manipulations: forged gates + wire responses = enforcement truth per decision',
              'Write the token/session findings with both halves (storage + wire) cited',
              'Hand the enforcement map to module i15 — the authorization test plan is now server-informed'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One token\u2019s full story. Decoded: refresh token, 30-day exp, offline_access, PII email claim inside the payload. Storage (i13): plaintext plist. Wire: refresh rotates (new token per refresh — good), BUT logout does not revoke (old token authenticates after logout — captured), and the email claim means every stolen token leaks PII. Findings: (1) revocation absent at logout (server-side, critical-leaning), (2) PII in token payload (privacy/backend), (3) refresh-token storage (client, i13\u2019s finding — severity now includes the no-revocation amplification). Three findings, one token, two modules — the anatomy work made each precise.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'JWT decoders (CLI or web for lab tokens), your capture channel, and the endpoint/behavior table (i14-l02) as the working map. Token forensics is decoding discipline — no exotic tooling.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting token claims (alg, scope) as findings without enforcement evidence — the wire probes establish whether claims are checked',
              'Testing revocation/concurrency without scope awareness — these probes touch account state; authorization and gentleness rules apply',
              'Decoding tokens with production credentials in shared tools — lab discipline: paste production tokens only into trusted local tooling',
              'Separating token findings from storage findings — the halves complete each other; cite both artifacts in one sentence'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Decode your training app\u2019s captured tokens into the token table; run the logout-reuse and refresh-rotation probes (gentle, authorized); write the one-token full story if the app cooperates. The pairing of i13\u2019s storage half with this wire half is the exercise — one finding sentence per token, both artifacts cited.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Token anatomy (claims, lifetimes, algorithms) is decodable truth that grounds every session finding',
            'Lifecycle probes (refresh rotation, logout revocation, replay, inactivity) are the server-behavior tests — gentle and authorized',
            'Authorization enforcement on the wire completes the client-trust question — module i15\u2019s verdicts stand on this evidence',
            'One token tells findings across modules when storage and wire halves pair in one sentence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i14-l04-q1',
          type: 'mcq',
          prompt: 'Logout succeeds, yet the captured old token authenticates afterward. What is the finding and where is the fix?',
          options: [
            'Client bug — the app must delete the token (client fix only)',
            'Server-side revocation absent: the token remains valid post-logout — backend fix (token revocation/denylist); client storage hygiene (i13) is secondary but real',
            'JWTs cannot be revoked, so no finding',
            'The capture is stale — retry'
          ],
          answerIndex: 1,
          hint: 'Whose responsibility is invalidation — and which artifact proves the server accepted reuse?',
          explanation:
            'The wire artifact (old token + 200 response) proves the server honors it post-logout: revocation is server-side. The client\u2019s leftover storage (i13) compounds exposure but is not the root. Both halves, one finding sentence.'
        },
        {
          id: 'i14-l04-q2',
          type: 'truefalse',
          prompt: 'A JWT containing the user\u2019s email address is a privacy finding because base64 encoding protects it.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is base64 — and who can read the payload of any token they capture?',
          explanation:
            'False — base64 is encoding, not encryption (module i18\u2019s standing rule). Anyone capturing or storing the token reads the payload. PII in JWTs is a real finding: minimization and/or encrypted claim handling are the fixes.'
        },
        {
          id: 'i14-l04-q3',
          type: 'scenario',
          prompt:
            'Refresh tokens rotate on use (good), but logout revokes nothing (bad). How does the no-revocation finding change the severity of the i13 storage finding?',
          hint: 'What does a stolen, non-revocable, 30-day refresh token mean versus a revocable one?',
          explanation:
            'Severity amplifies: theft of a non-revocable 30-day token cannot be remediated by user action (logout does nothing) — the exposure window is the token\u2019s full life. The storage finding\u2019s sentence gains that amplification; the root fix is server revocation, the client fix remains keychain hygiene.'
        },
        {
          id: 'i14-l04-q4',
          type: 'mcq',
          prompt: 'Why must authorization probes (role/scope checks on the wire) stay within the engagement\u2019s authorized tests?',
          options: [
            'They are technically difficult',
            'They touch real account state and backend behavior — scope and rules-of-engagement govern how far authorization testing goes',
            'Servers log everything and it is rude',
            'Client-side findings do not need them'
          ],
          answerIndex: 1,
          hint: 'What does ROE govern on engagements — especially for state-touching backend probes?',
          explanation:
            'Authorization testing manipulates identity/role parameters against live backends — exactly the activity ROE scopes. Gentle, documented, authorized probes are the discipline; mass or destructive testing without scope is not testing, it is attacking.'
        }
      ],
      references: [
        {
          title: 'RFC 7519 — JSON Web Token (JWT)',
          url: 'https://datatracker.ietf.org/doc/html/rfc7519',
          note: 'The token anatomy\u2019s authoritative reference'
        },
        {
          title: 'RFC 6749 — OAuth 2.0 (token/refresh semantics)',
          url: 'https://datatracker.ietf.org/doc/html/rfc6749',
          note: 'Refresh/revocation semantics behind the lifecycle probes'
        },
        {
          title: 'OWASP MASTG — iOS authentication and session testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test families this lesson executes'
        }
      ]
    }
  ]
};
