import type { Module } from '../../../../types';

// LEVEL 7 — AUTH & ATTACK SURFACE · Module i16: iOS-Specific Attack Surface
// Original content synthesized from Apple documentation (URL schemes, universal
// links, extensions, pasteboard) and OWASP MASTG platform interaction chapters.

export const i16: Module = {
  id: 'i16',
  title: 'iOS-Specific Attack Surface',
  level: 7,
  description:
    'The sanctioned crossings: URL schemes, universal links, deep link handlers, extensions, app groups and pasteboard. For each surface — what it is, the boundary it crosses, what a tester looks for, the safe methodology, and the common weaknesses. The module i05-l01 walls meet their doors.',
  outcomes: [
    'Test custom URL scheme handlers for input injection and forced-action flows',
    'Evaluate universal link configuration (AASA) and handler logic',
    'Audit extensions and app groups as separate surfaces with shared-state risks',
    'Run the pasteboard and notification crossing tests systematically'
  ],
  lessons: [
    {
      id: 'i16-l01',
      moduleId: 'i16',
      title: 'URL Schemes and Deep Link Handlers',
      difficulty: 'Advanced',
      minutes: 26,
      prerequisites: ['i04-l02', 'i02-l02'],
      objectives: [
        'Map the declared scheme surface and locate every handler in code',
        'Test handler input handling: parameter injection, forced actions, WebView routing',
        'Evaluate scheme-collision (hijack) reachability honestly'
      ],
      diagram: 'ios-deeplink-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'URL schemes are iOS\u2019s inter-app invocation channel: any app, Safari, Mail or a web page can ask the system to open myapp://…, and the first-registered handler receives it. That makes every declared scheme an unauthenticated, attacker-influenced input into your target\u2019s routing code — the closest thing iOS has to Android\u2019s exported activities, with its own mechanics and its own finding families.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-deeplink-flow',
            caption: 'The crossing: attacker-chosen URL → system resolver → your handler\u2019s parsing and actions.'
          },
          { type: 'h', text: 'The surface map' },
          {
            type: 'list',
            items: [
              'Declared: CFBundleURLTypes (module i04-l02) — every scheme, per app AND per extension',
              'Handlers: the code receiving opens — application(_:open:), scene(_:openURLContexts:), SwiftUI onOpenURL — locate all of them (they can coexist!)',
              'Router internals: the parsing/routing layer the handlers feed (the DeepLinkRouter-class classes from i09\u2019s metadata)',
              'Sinks: what URLs can ultimately reach — WebViews (module i17), navigation, token flows, feature flags, share sheets'
            ]
          },
          { type: 'h', text: 'The test matrix' },
          {
            type: 'table',
            headers: ['Test', 'Method', 'Finding shape'],
            rows: [
              ['Reachability without auth', 'Cold-open deep links to protected features', 'Auth-gating absent at the routing layer'],
              ['Parameter injection', 'Crafted ids/paths/commands in URL params', 'Forced actions, unauthorized object access'],
              ['WebView routing', 'URL params feeding WebView loads', 'Arbitrary/remote content in app WebView (i17 bridge exposure)'],
              ['Open redirect (in-app)', 'Handler navigation driven by URL params', 'App navigates to attacker-chosen destinations'],
              ['Token leakage', 'Flows that put tokens in URLs', 'Tokens land in Safari/history/other apps'],
              ['Scheme collision', 'Fresh-install registration order tests', 'Hijack reachability (honest scoping — below)']
            ]
          },
          { type: 'h', text: 'Scheme collision, honestly' },
          {
            type: 'p',
            text:
              'iOS resolves a scheme to the first app installed that registers it. A malicious app installing FIRST could receive the target\u2019s scheme — but the attacker must get their app onto the device first (App Store review, enterprise, or user sideload contexts). Findings therefore read with that reachability framing: "scheme \u0027pay\u0029 is generic; a pre-installed claiming app intercepts its links" — a real but conditional surface, not a remote attack. Test it (fresh simulator profiles, registration-order experiments on lab devices) and scope the claim honestly.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Deep link tests are cheap to run (xcrun simctl openurl / device URL opens) and hit the highest-value routing code — always in the first dynamic tier',
              'The handler inventory (multiple delegates coexisting!) is a classic miss — one tested handler hides another',
              'Parameter injection findings inherit the module i15 taxonomy: forced actions whose server half decides severity',
              'WebView-routing deep links are the module i17 bridge\u2019s front door — the two modules chain by design'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Handlers that parse and act without auth checks (routing-layer authorization absent)',
              'URL parameters reaching navigation/WebView loads verbatim (the i17 chain)',
              'Token/session-bearing URLs (password-reset style flows inside apps — token in URL patterns)',
              'Deprecated handler methods still registered (openURL legacy paths that bypass newer routing checks)',
              'Schemes that trigger state changes (payments, deletions) directly from URL parameters'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Deep link testing loop',
            lines: [
              '# simulator: open any URL through the system resolver',
              '$ xcrun simctl openurl booted "targetapp://profile?id=10002"',
              '# device: open via Safari/Notes, or pymobiledevice3 openurl',
              '$ pymobiledevice3 open "targetapp://profile?id=10002"',
              '# matrix execution: craft the parameter set from the router\u0027s parse logic',
              '# (i09 metadata: DeepLinkRouter.route paths), observe UI + wire + files',
              '# capture everything: which handler fired (logs), what loaded, what API calls followed'
            ]
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Enumerate ALL handlers statically (i09) and confirm live which fire per URL shape (log-filtered deep link probes)',
              'Build the router\u2019s parameter vocabulary (keys, actions, destinations) from decompilation and probe each systematically',
              'Run the six-row matrix; capture UI + wire + container per row',
              'Scheme-collision test on a lab device/simulator with a claiming stub app (yours); record the registration-order result with environment details',
              'Write findings per row with the honest reachability framing (collision conditional; injection per the server half where applicable)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The WebView-routing chain. Training app declares targetapp://web?url=… for marketing links. Probes: targetapp://web?url=https://evil.example loads the external site inside the app\u2019s WKWebView (module i17\u2019s bridge now reachable from a URL any web page can invoke); targetapp://web?url=file:///… reads local container content into the WebView. Findings: "Unvalidated URL parameter routed into in-app WebView (remote content load; local file access) invocable cross-app via scheme." One handler, chained modules, critical-leaning — the surface map did the work.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'simctl openurl / pymobiledevice3 open (invocation), the log channel (which handler fired), the i09 router metadata (parameter vocabulary), and the capture/diff channels for consequences. A claiming stub app for collision tests (your own minimal app — legitimately signed).'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing only one handler when several coexist (legacy + scene + SwiftUI) — enumerate, confirm live, test all',
              'Reporting scheme collision as remote exploitation — the pre-install condition shapes reachability and the finding text must carry it',
              'Ignoring extension-declared schemes (share extensions open URLs too)',
              'Crafting URLs from guesses instead of the router\u2019s parsed vocabulary — decompile-first probing finds the real parameter names'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full loop on your training app: handler inventory, parameter vocabulary, six-row matrix, findings with reachability framing. If the app has no schemes, write the verified-clean line with the declaration evidence — and note which OTHER surface (universal links, pasteboard) inherits the testing energy.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Schemes are unauthenticated inter-app input into routing code — the surface map (declared, handlers, router, sinks) precedes testing',
            'The six-row matrix (auth reach, injection, WebView routing, redirect, token leakage, collision) is the test plan',
            'Multiple handlers coexist — enumerate and confirm live which fire',
            'Collision findings carry the pre-install reachability condition honestly'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i16-l01-q1',
          type: 'mcq',
          prompt: 'Two apps register the same custom scheme. Which receives a matching URL?',
          options: [
            'Both — iOS broadcasts to all registered apps',
            'The first one installed (registration order decides; a later install of the same scheme can take over)',
            'The one whose bundle id sorts first',
            'Neither — duplicate schemes are rejected at install'
          ],
          answerIndex: 1,
          hint: 'What does "first-come registration" mean at install time?',
          explanation:
            'iOS resolves to the most recently installed app claiming the scheme (first-come at any given moment). That is why hijack tests install a claiming stub AFTER the target — and why the finding\u2019s reachability says "any app installed later claiming the scheme intercepts".'
        },
        {
          id: 'i16-l01-q2',
          type: 'truefalse',
          prompt: 'A deep link that opens the app\u2019s settings screen without authentication is a finding only if it also exposes data.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does routing-layer auth-gating absence mean for forced-action flows — beyond data exposure?',
          explanation:
            'False — forced navigation/actions without auth is itself the finding family (state confusion, forced flows, UI redress potential), even before data exposure. The matrix\u2019s first row (reachability without auth) is its own verdict, data or not.'
        },
        {
          id: 'i16-l01-q3',
          type: 'scenario',
          prompt:
            'The router parses targetapp://action?name=… and dispatches named actions. Design the injection probe set.',
          hint: 'From the router\u2019s action vocabulary (decompiled), what would you enumerate — and what sink matters most?',
          explanation:
            'Enumerate the action names from the parse logic (i09), then probe: known actions with unexpected parameters, unknown/crafted action names (error behavior), and privileged-looking actions (pay, delete, admin-shaped) — with the WebView/file sinks (i17) as the highest-priority consequences. Verdicts come from what each probe reaches (UI only? state change? server call?).'
        },
        {
          id: 'i16-l01-q4',
          type: 'mcq',
          prompt: 'Why do token-bearing deep links (password-reset style flows) deserve their own test row?',
          options: [
            'They crash older devices',
            'Tokens in URLs leak beyond the app (browser history, referrer chains, other apps) — the crossing exposes the credential itself',
            'URLs are always encrypted',
            'Apple forbids them'
          ],
          answerIndex: 1,
          hint: 'Who else sees the URL between the web origin and your handler?',
          explanation:
            'The URL passes through browsers/email clients/other apps — history, telemetry and referrer surfaces all observe it. Token-in-URL deep link flows therefore leak credentials cross-app; the test row confirms the flow exists and the finding recommends in-app exchange mechanisms.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Defining a custom URL scheme',
          url: 'https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app',
          note: 'Declaration and resolution mechanics'
        },
        {
          title: 'Apple Developer — Supporting universal links (for contrast with schemes)',
          url: 'https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content',
          note: 'The domain-bound alternative — next lesson\u2019s subject'
        },
        {
          title: 'OWASP MASTG — iOS URL scheme testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The scheme test family this lesson executes'
        }
      ]
    },
    {
      id: 'i16-l02',
      moduleId: 'i16',
      title: 'Universal Links: AASA and Handler Logic',
      difficulty: 'Advanced',
      minutes: 22,
      prerequisites: ['i16-l01', 'i06-l03'],
      objectives: [
        'Explain the AASA validation chain and audit its configuration',
        'Test universal link handlers with the same injection matrix as schemes',
        'Assess over-broad path declarations and web-viewer confusion behaviors'
      ],
      diagram: 'ios-universal-links',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Universal links bind app handling to web domains: iOS fetches apple-app-site-association (AASA) from the domain, matches URLs against its paths, and routes matches into the app — no scheme, no hijack-by-install, but a new configuration surface (the domain\u2019s JSON) and the same handler-logic risks. The audit covers both: the domain\u2019s declaration (over-broad paths route sensitive web pages into app handlers) and the handler\u2019s parsing (the i16-l01 matrix, applied).'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-universal-links',
            caption: 'Domain JSON + entitlement agreement decide routing; the handler decides what happens next.'
          },
          { type: 'h', text: 'The validation chain' },
          {
            type: 'list',
            items: [
              'Entitlement: com.apple.developer.associated-domains (module i06-l03) declares applinks:domains — the app\u2019s side of the agreement',
              'AASA: the domain serves apple-app-site-association (root or /.well-known/) — signed content naming app ids (team.bundle) and path patterns',
              'Match: system fetches/validates AASA, matches URL paths, routes to the app; no match → Safari (web fallback)',
              'Audit the chain: entitlement domains (over-broad wildcards?), AASA path patterns (/* routes everything), app ids correctness, AASA freshness (stale JSON breaks links silently)'
            ]
          },
          { type: 'h', text: 'The handler audit' },
          {
            type: 'list',
            items: [
              'Same handlers as schemes (openURLContexts/onOpenURL) — universal links arrive through them; the i16-l01 handler inventory applies verbatim',
              'The matrix rows re-run: parameter injection via link paths/queries, WebView routing (the /web-style patterns), forced actions, token-bearing paths',
              'Web-viewer confusion: links that the app loads in its own WebView instead of delegating to Safari — in-app content trust questions (i17\u2019s chain)',
              'Exclusive vs cooperative handling: paths the app claims that the WEBSITE also serves — does the app handle them fully (parity findings: features reachable in web but broken in app)?'
            ]
          },
          { type: 'h', text: 'Configuration findings, the cheap tier' },
          {
            type: 'list',
            items: [
              'Wildcard paths (/*) routing the entire domain into the app — over-breadth finding with concrete misroute examples (sensitive web pages opening in app context)',
              'Wildcard subdomains in the entitlement (*.target.com — module i06-l03\u2019s red flag): every subdomain\u2019s AASA can now route into the app',
              'Stale/malformed AASA (fetchable during authorized testing — or evidenced by broken-link reports): availability finding with UX impact',
              'App id mismatches (wrong team prefix — links silently never route): configuration correctness finding'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The AASA audit is often pure configuration review — findings in minutes once the JSON is readable (authorized fetch or client-provided)',
              'Handler findings inherit the scheme module\u2019s matrix wholesale — one test design covers both surfaces',
              'Web-viewer confusion links the surface module to module i17: routing decisions decide which content the bridge trusts',
              'Over-breadth findings have the best cost-to-fix ratio in this family (path narrowing) — present them prominently'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Path patterns wider than the app\u2019s actual feature set (NOT paths — the classic over-declaration)',
              'notePaths/exclude patterns absent entirely (no negative routing at all)',
              'Handlers that treat all universal links as trusted app-origin commands (origin assumption errors — the domain proves the LINK\u2019s source, not the parameters\u2019 safety)',
              'Flows where the app loads link targets in-app rather than Safari (confusion + i17 exposure)',
              'Feature-parity gaps: web paths claimed by the app but handled worse than the website (broken flows findings)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Read the entitlement (i06) and fetch/audit the AASA for each declared domain (authorized fetch; client-provided JSON as fallback) — build the configuration verdict per domain',
              'Craft the link probe set from the AASA paths + handler vocabulary; run the i16-l01 matrix rows through universal links',
              'Test misroutes: sensitive/unsupported web paths matching broad patterns — where do they land (app handler? broken state?)',
              'Test confusion: link targets that the app loads in its own WebView — record the content-trust posture (feeds i17)',
              'Write configuration + handler findings with the chain evidence (entitlement, AASA, probes) attached per finding'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Over-breadth with a concrete misroute. AASA paths: ["/*"] for shop.com. Probe: https://shop.com/admin/users (a WEB admin page) — routes into the app, whose handler does not recognize it and loads it in the in-app WebView (unauthenticated admin page content inside the app\u2019s context, cookies shared). Finding: "Universal link declaration routes the entire domain (AASA paths /*) into app handling; unauthenticated web pages (e.g., /admin/*) open inside the app WebView, sharing the web session context. Fix: narrow AASA paths to actual app-handled routes; exclude admin/auth surfaces." One fetch, one probe, one structural fix — the configuration tier\u2019s value.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'codesign (entitlement), curl/authorized fetch + a JSON reader (AASA), simctl/pymobiledevice3 open (link invocation), and the shared handler-testing kit from i16-l01. The AASA validator utilities exist in community tooling — a JSON read suffices for the audit.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Auditing only the app side (handlers) and skipping the domain JSON — half the surface lives in configuration',
              'Assuming universal links cannot be attacker-influenced because domains are validated — attacker content ON the validated domain (user-generated pages, compromised subdomains) still feeds handler parameters',
              'Reporting AASA staleness as a security bug without the availability framing — it is a UX/availability finding class',
              'Ignoring subdomain wildcards in the entitlement — the domain surface is wider than the main site'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Audit the chain for your training app (or a licensed target with universal links): entitlement → AASA → probes → misroute test. Write one configuration finding (over-breadth or staleness) and one handler finding. If the target has no universal links, the entitlement-absence line with evidence is the verified-clean deliverable.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Universal links = entitlement + domain AASA + handler logic — audit all three layers of the chain',
            'The scheme module\u2019s matrix re-runs here; plus the configuration tier (over-breadth, staleness, wildcards)',
            'Origin validation proves the link\u2019s domain, not parameter safety — handler input handling remains the finding ground',
            'Web-viewer confusion routes into module i17 — the surfaces chain by design'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i16-l02-q1',
          type: 'mcq',
          prompt: 'What does a valid AASA match actually prove about a URL?',
          options: [
            'The URL\u2019s parameters are safe',
            'The URL\u2019s host belongs to a domain that declared this app as a handler — nothing about parameter content',
            'The user intended to open the app',
            'The URL is free of tracking'
          ],
          answerIndex: 1,
          hint: 'Whose declaration is the AASA — and whose content is the URL?',
          explanation:
            'The domain (site owner) declared the app as handler for matching paths. Parameters remain attacker-influenced (user-generated content, query strings, compromised subdomains) — handler input validation is still required. Origin ≠ parameter safety.'
        },
        {
          id: 'i16-l02-q2',
          type: 'truefalse',
          prompt: 'AASA paths of ["/*"] are acceptable if the app handles every path it receives.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the app-claims-vs-domain-serves relationship mean for unhandled or sensitive paths?',
          explanation:
            'False — /* routes the whole domain (including sensitive web-only surfaces like admin pages) into app handling regardless of handler quality: misroutes, confusion loads, broken parity. Declaration breadth is its own finding; "we handle everything" is rarely true and never a control.'
        },
        {
          id: 'i16-l02-q3',
          type: 'scenario',
          prompt:
            'A universal link to https://shop.com/orders/10002 opens account A\u2019s app to ORDER 10002 (account B\u2019s order — from the i15-l03 finding). How do the modules chain?',
          hint: 'Which module\u2019s finding does the deep link invoke, and which surface delivered it?',
          explanation:
            'The surface (universal link) delivered an object reference; the authorization failure (i15-l03\u2019s BOLA — server-side) executed it. Chaining finding: "Sensitive objects reachable cross-user via crafted universal links" — the deep link makes the BOLA one-tap reachable from any web page. Both findings cited; the fix is server-side enforcement (i15) plus handler-level sanity (i16).'
        },
        {
          id: 'i16-l02-q4',
          type: 'mcq',
          prompt: 'What is web-viewer confusion in the universal link context?',
          options: [
            'Users confusing Safari tabs',
            'The app loading link targets in its own WebView instead of handing them to the browser — pulling web sessions/contexts into app-controlled processing',
            'Certificates mismatching domains',
            'AASA caching errors'
          ],
          answerIndex: 1,
          hint: 'Where does the link\u2019s content get processed — and whose cookies/context does that engage?',
          explanation:
            'In-app WebView loads bring web session contexts into the app\u2019s processing (and into i17\u2019s bridge surface). The confusion finding is the routing decision itself; its severity comes from what content/contexts the WebView can consume.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Universal Links (supporting associated domains)',
          url: 'https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content',
          note: 'The AASA format and validation chain\u2019s official reference'
        },
        {
          title: 'Apple Developer — Associated domains entitlement',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated_domains',
          note: 'The entitlement side of the agreement'
        },
        {
          title: 'OWASP MASTG — iOS universal link testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test family behind this lesson'
        }
      ]
    },
    {
      id: 'i16-l03',
      moduleId: 'i16',
      title: 'Extensions, App Groups and the Pasteboard',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i02-l02', 'i13-l04'],
      objectives: [
        'Audit each extension as a separate surface: its plist, binary, and shared-state usage',
        'Test app-group shared containers for unvalidated crossing content',
        'Run the pasteboard and notification crossing tests as first-class surface tests'
      ],
      diagram: 'ios-privacy-tcc',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Extensions are separate processes (module i02-l02) with their own plists, binaries and sandbox slices — connected to the main app only through sanctioned crossings: app-group containers, shared keychain, and the data the system hands them. Each crossing carries untrusted content (user-shared text, images, widget taps) into trusted processing. This lesson audits extensions as first-class targets and closes the crossing family (pasteboard, notifications) as surface tests.'
          }
        ],
        technical: [
          { type: 'h', text: 'The extension audit' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory: PlugIns/*.appex (module i04) — type (share, action, widget, today, intent…), its own Info.plist (permissions, schemes!), its own binary',
              'Input surface: what the system hands it — share extensions receive ANY content the user shares from ANY app (the widest untrusted input on iOS)',
              'Shared state: which app groups it reads/writes (i06\u2019s entitlements), which keychain groups — the crossing inventory',
              'Processing: how shared content is validated/transformed before it reaches the group container or the main app (the static audit from i09, per extension binary)',
              'Main-app consumption: how the app reads what extensions wrote — the unvalidated-crossing question\u2019s second half'
            ]
          },
          { type: 'h', text: 'The crossing tests' },
          {
            type: 'table',
            headers: ['Crossing', 'Test', 'Finding shape'],
            rows: [
              ['Share extension input', 'Share crafted content (oversized, crafted formats, URL payloads) from Safari/Files', 'Unvalidated content reaching group container/app logic'],
              ['App group container', 'Inspect/modify container content; feed crafted values', 'Main app executes config/data from shared state'],
              ['Widget taps', 'Craft widget-intent parameters', 'Forced actions via widget intents'],
              ['Pasteboard', 'i13-l04\u2019s leak-in test as a surface test', 'Import features consuming attacker content'],
              ['Notifications', 'Sensitive payload rendering + tap-action parameters', 'Lock-screen leakage; notification-driven actions']
            ]
          },
          { type: 'h', text: 'The widget/notification corner' },
          {
            type: 'p',
            text:
              'Widgets render data and carry tap intents — crafted intent parameters are deep link inputs with a widget costume (test with the i16-l01 matrix\u2019s spirit). Notifications leak by rendering (lock-screen payload tests from i13-l04) and act by tap (userInfo parameters driving navigation — the same injection questions). Both are small surfaces with outsized real-world exposure (lock screens are public).'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Share extensions are the widest untrusted-input funnel on iOS — always in the first dynamic tier when present',
              'App-group findings chain i13 (storage) with this module: the container is where unvalidated crossing content lands',
              'Extension plist findings (permissions, schemes) follow module i04-l02\u2019s plist discipline — extensions drift from the main app\u2019s posture',
              'Notification/pasteboard tests close the surface map — the report\u2019s platform-interaction section completes here'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Share extensions writing user content verbatim into group containers (no validation/size/format checks)',
              'Main apps executing configuration or commands found in shared containers (the trusted-processing inversion)',
              'Extensions requesting permissions the main app does not (drift: location in a share extension)',
              'Widgets embedding raw user data in rendered output (injection into widget rendering contexts)',
              'Notification tap handlers routing userInfo parameters into navigation/WebView loads (the familiar sink, new door)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory extensions: type, plist claims, entitlements (i06), binaries (i09\u2019s treatment per binary)',
              'Share-extension test: share crafted content from Safari/Files (URLs, oversized text, format payloads) into the target; inspect the group container (diff) and the main app\u2019s consumption',
              'App-group test: with the container pulled (i13), analyze which values the main app treats as configuration; feed crafted values through the legitimate flow; observe execution',
              'Widget/notification tests: crafted intent parameters, lock-screen rendering matrix, tap-action parameter injection',
              'Write findings per crossing with both halves (input reached container; consumption executed it) — the two-sided crossing sentence'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The crossing finding, both halves. Training productivity app: share extension saves shared web pages to the group container as JSON. Test: share a crafted page (title containing JSON-shaped command text: {"action":"import-config","path":"…"}). Container diff: file written verbatim. Main app: on next launch, its group-container reader interprets action-import-config records — executes the import. Verdict: "Share extension persists user-controlled content verbatim to the shared container; the main app interprets container records as commands (config import path). Cross-app untrusted input reaches trusted logic unvalidated." Fix: validate/escape at write, treat container content as data (not commands) at read. Both halves, one finding, structural remediation — the crossing family\u2019s model.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The share sheet (the test harness!), container tooling (i13), the log channel (which process executed what), and the i09 per-binary metadata for extension processing. The system UI is the instrumentation for this lesson — extensions are exercised the way users exercise them.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating extensions as part of the main binary\u2019s audit — separate processes, separate plists, separate findings',
              'Testing only the write half (extension stores content) without the read half (main app consumes) — crossing findings need both sentences',
              'Ignoring widget/notification surfaces as minor — lock screens are public; tap intents are deep links',
              'Forgetting extension plist audits (module i04\u2019s lists included extensions — now they earn their row)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the extension audit on your training app (if it has none, run the pasteboard/notification rows fully instead). Produce one crossing finding (or verified-clean line) with both halves evidenced. Then write the platform-interaction section\u2019s opening paragraph: schemes, universal links, extensions, pasteboard, notifications — your tested map of the sanctioned crossings.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Extensions are separate processes and separate surfaces: inventory, input surface (share = widest untrusted input), shared state, processing',
            'Crossing findings need both halves: unvalidated write + trusted consumption — the two-sided sentence',
            'Widgets and notifications are deep link inputs in disguise (lock screens are public) — test their parameters and rendering',
            'The platform-interaction section completes here: schemes, universal links, extensions, pasteboard, notifications — tested and mapped'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i16-l03-q1',
          type: 'mcq',
          prompt: 'Why is a share extension\u2019s input surface described as the widest untrusted input on iOS?',
          options: [
            'It accepts file uploads over the network',
            'It receives arbitrary content from ANY app the user shares from — every installed app is a potential content source',
            'It runs as root',
            'It bypasses the sandbox'
          ],
          answerIndex: 1,
          hint: 'Who can invoke the share sheet targeting your extension — and with what content?',
          explanation:
            'Any app\u2019s share flow (and Safari/Files) can deliver arbitrary text/URLs/files to your extension. The sandbox holds (the extension stays confined) — but the CONTENT it receives is untrusted by definition, which is why validation at the crossing is the finding ground.'
        },
        {
          id: 'i16-l03-q2',
          type: 'truefalse',
          prompt: 'Validating content in the share extension before writing to the app group container is sufficient to close the crossing risk.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the read half assume — and why must both sides treat the container as untrusted?',
          explanation:
            'False — defense-in-depth at the crossing: the main app must ALSO treat container content as data, not commands. Either half alone leaves the other as the attack path (extensions get updated, bugs happen). Both-sided validation is the remediation; both-sided testing is the finding.'
        },
        {
          id: 'i16-l03-q3',
          type: 'scenario',
          prompt:
            'A widget shows account balances and its tap intent deep-links to targetapp://account?id=…. What are the two tests?',
          hint: 'Rendering exposure and parameter injection — which module\u2019s tools run each?',
          explanation:
            '(1) Rendering exposure: what does the widget show on the lock screen/notification center (sensitive balances public? — i13-l04\u2019s visual privacy method); (2) intent injection: crafted id/action parameters through the intent (i16-l01\u2019s matrix — forced navigation, BOLA chaining per i15). Widget = deep link + public screen; both tests are inherited, not new.'
        },
        {
          id: 'i16-l03-q4',
          type: 'mcq',
          prompt: 'What completes the platform-interaction section of a report?',
          options: [
            'Only the schemes tested',
            'The tested map of ALL sanctioned crossings: schemes, universal links, extensions, app groups, pasteboard, notifications — findings and verified-clean lines per crossing',
            'The entitlement dump alone',
            'The Info.plist transcription'
          ],
          answerIndex: 1,
          hint: 'What did module i05-l01 promise about sanctioned doors — and what does the section owe each one?',
          explanation:
            'Every door gets a verdict: tested findings or evidence-backed clean lines. The section is the map of the walls\u2019 openings — reviewers use it to see coverage of the platform-interaction domain (MASVS-PLATFORM) in full.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — App extensions overview',
          url: 'https://developer.apple.com/app-extensions/',
          note: 'Extension types and their process model'
        },
        {
          title: 'Apple Developer — App Groups entitlement',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups',
          note: 'The shared-container mechanism behind the crossings'
        },
        {
          title: 'OWASP MASTG — iOS platform interaction tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The MASVS-PLATFORM test family this module completes'
        }
      ]
    }
  ]
};
