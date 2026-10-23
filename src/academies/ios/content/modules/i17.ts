import type { Module } from '../../../../types';

// LEVEL 7 — AUTH & ATTACK SURFACE · Module i17: WebViews & JavaScript Bridges
// Original content synthesized from Apple WebKit documentation and OWASP
// MASTG WebView chapters.

export const i17: Module = {
  id: 'i17',
  title: 'WebViews & JavaScript Bridges',
  level: 7,
  description:
    'WKWebView as an attack surface: configuration posture, navigation policy, the JavaScript bridge as a trust-boundary inversion, and the finding families — unsafe navigation, insecure bridge design, local file exposure and origin confusion — tested through deep-link chains and crafted content.',
  outcomes: [
    'Audit WKWebView configuration: JavaScript, navigation policies, file access, content sources',
    'Map JavaScript bridges and test message handling as untrusted-input code',
    'Chain WebView findings from deep links and other crossings into full exploit narratives'
  ],
  lessons: [
    {
      id: 'i17-l01',
      moduleId: 'i17',
      title: 'WKWebView Configuration and Navigation Policy',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i16-l01'],
      objectives: [
        'Read WKWebView configuration for security-posture decisions',
        'Audit navigation policy enforcement (decidePolicyForNavigationAction)',
        'Identify unsafe loading shapes: remote content, local files, arbitrary schemes'
      ],
      diagram: 'ios-webview-bridge',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'WKWebView is a browser engine embedded in the app — and every browser-engine question becomes an app-security question when the app decides what loads and what the loaded page may reach. The configuration audit reads the app\u2019s choices (JavaScript on, file access, custom schemes); the navigation audit reads its gatekeeping (what may load, when, from where). Together they map the WebView\u2019s trust posture before any bridge code (next lesson) is considered.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-webview-bridge',
            caption: 'The WebView surface: configuration decisions, the navigation gate, and what the page can reach.'
          },
          { type: 'h', text: 'The configuration audit' },
          {
            type: 'list',
            items: [
              'WKWebViewConfiguration: javaScriptEnabled (default on), allowsFileAccessFromFileURLs / allowsInlineMediaPlayback-class flags, websiteDataStore choice (ephemeral vs persistent — session/cookie sharing posture)',
              'Custom scheme handlers: setURLSchemeHandler registrations — custom protocols the page can invoke (app-defined attack surface)',
              'Preferences that matter: developer-mode flags, inspection entitlements in release builds',
              'Data store sharing: the WebView\u2019s cookies/session store vs the app\u2019s HTTP cookie store — sharing shapes (WKHTTPCookieStore synchronization) that decide session exposure'
            ]
          },
          { type: 'h', text: 'The navigation gate' },
          {
            type: 'code',
            lang: 'swift',
            title: 'The decision point every WebView audit reads first',
            code:
              'func webView(_ webView: WKWebView,\n             decidePolicyFor navigationAction: WKNavigationAction,\n             decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {\n    if let url = navigationAction.request.url {\n        // AUDIT QUESTIONS:\n        // 1. Is ANY host accepted (allow-all)?\n        // 2. Is the allowlist derived from user-controllable input?\n        // 3. Are file://, custom schemes, and javascript: handled explicitly?\n        // 4. Do top-level vs iframe navigations differ (should they)?\n    }\n    decisionHandler(.allow)      // the allow-all shape — the classic finding\n}'
          },
          {
            type: 'list',
            items: [
              'Allow-all navigation: any URL loads (redirects from "trusted" pages go anywhere) — the classic finding with cross-origin consequences',
              'Derivation flaws: allowlists checked with naive string matching (contains(host) — attacker-host.com/target.com passes)',
              'Unprotected schemes: file:// loads (local container reads — the i16-l01 chain), javascript: navigations, custom scheme invocations',
              'The load entry points: who calls load(URLRequest)? — deep link parameters (i16\u2019s chain), server-driven config, user content — the source inventory decides the finding\u2019s reachability'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Configuration + navigation findings are the WebView section\u2019s base layer: allow-all, naive allowlists, file access — cheap to audit statically, fast to prove dynamically',
              'The source inventory (who loads what) turns posture findings into reachable findings: a load-from-deeplink-param with allow-all navigation is the full chain',
              'Cookie/data-store sharing questions decide whether WebView content can touch app sessions (the confusion pattern from i16-l02)',
              'SFSafariViewController vs WKWebView choice matters: SFSafari runs the real Safari sandbox (no bridge!) — apps choosing WKWebView for third-party content widen surface for no reason'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'decisionHandler(.allow) without conditions (allow-all), or allowlist matching by prefix/contains',
              'allowsFileAccessFromFileURLs-style flags enabled "just in case"',
              'load() call sites fed by URL parameters (the i16 chain\u2019s sink inventory)',
              'Persistent data stores shared across unrelated content (session cookie exposure to loaded pages)',
              'Custom URL scheme handlers registered for the WebView (what can pages invoke?)',
              'Debug flags (webview inspection, verbose JS console bridging) in release builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Static: inventory all WKWebView instances, configurations, navigation delegates, load call sites (i09\u2019s WebKit vocabularies)',
              'Classify each WebView: content source (first-party? user content? deep-link fed?), navigation policy shape, data store posture',
              'Dynamic: reach each WebView (deep links, features); feed navigation probes — crafted hosts (allowlist bypass strings), file:// URLs, custom schemes, redirect chains from a allowed page',
              'Capture: what loaded (log/navigation traces), what context the page got (cookies? bridge access — next lesson), where the session store stood',
              'Write findings: policy shape + reachability (source) + consequence (content in app context / local file reads / session exposure)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The naive allowlist. Training app\u2019s help WebView: navigation policy checks url.absoluteString.contains("targetapp.com"). Probe: deep link targetapp://help?page=https://attacker-host.example/targetapp.com/payload.html — contains() passes (the string appears in the URL), attacker page loads inside the app WebView with its session cookies available. Finding: "Navigation allowlist uses substring matching; attacker-controlled URL parameters (deep link page param) load arbitrary hosts. Consequence: third-party content in app context with session cookie exposure." One decompiled string check, one crafted deep link — the base-layer finding family\u2019s whole anatomy.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The i09 metadata/decompiler session (WebKit vocabularies), the deep link invocation kit (i16), a local test page server (attacker-content simulator), and the log channel (navigation traces). The tests are chains — the WebView is where surface modules land.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Auditing configuration without the load-source inventory — unreachable hardening notes instead of reachable findings',
              'Testing only direct loads — redirects FROM allowed pages are navigation too (the gate sees them)',
              'Forgetting iframe/top-level distinctions in policy reading',
              'Treating SFSafariViewController as a WebView finding — it is the SAFER choice; the finding is the app\u2019s WKWebView-for-third-party-content pattern'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the static inventory on your training app\u2019s WebViews, then execute the navigation probes against its weakest one (deep-link fed if available). Produce one navigation finding with the chain evidence (source → gate bypass → consequence). No WebViews? The verified-clean line with the inventory evidence is the deliverable — and module i16\u2019s surfaces remain the finding ground.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'WKWebView audits read configuration choices and the navigation gate — posture plus load-source inventory equals reachability',
            'The classic findings: allow-all policy, naive allowlist matching, file:// access, shared session stores',
            'Deep links and other crossings are the WebView\u2019s loaders — the modules chain into full narratives',
            'SFSafariViewController for third-party content is the safe pattern; WKWebView-for-everything is the posture finding'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i17-l01-q1',
          type: 'mcq',
          prompt: 'A navigation policy checks url.absoluteString.contains("targetapp.com"). Why is this bypassable?',
          options: [
            'contains() is deprecated',
            'Substring matching: any URL embedding the string (path, subdomain, query) passes — attacker-host.example/targetapp.com loads',
            'WKWebView ignores delegates',
            'HTTPS is required for contains()'
          ],
          answerIndex: 1,
          hint: 'What does a substring check actually verify about WHO owns the host?',
          explanation:
            'Substring checks verify nothing about ownership: the marker string can appear anywhere in an attacker-chosen URL. Correct checks parse the URL and compare the HOST component against exact allowlist entries.'
        },
        {
          id: 'i17-l01-q2',
          type: 'truefalse',
          prompt: 'If a WebView only ever loads first-party URLs from code constants, its navigation policy is a hardening note rather than a finding.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What did the lesson say about the load-source inventory — reachability decides the class?',
          explanation:
            'True — with no attacker-reachable load path, the weak policy is latent (hardening note). The finding class activates when a crossing (deep link, redirect from allowed content, user content) feeds the loader. Source inventory first, verdicts second.'
        },
        {
          id: 'i17-l01-q3',
          type: 'scenario',
          prompt:
            'The WebView shares the app\u2019s persistent cookie store. What consequence does that have for any navigation finding?',
          hint: 'What can loaded content touch — and which module\u2019s session analysis does that engage?',
          explanation:
            'Loaded content (attacker-hosted via any navigation bypass) sees the app\u2019s session cookies — session exposure escalates every navigation finding from "content in context" to "credential-bearing context". The finding pairs with i14\u2019s session analysis: what the cookies authenticate defines the impact.'
        },
        {
          id: 'i17-l01-q4',
          type: 'mcq',
          prompt: 'Why is choosing SFSafariViewController for third-party content the safer pattern?',
          options: [
            'It renders faster',
            'It runs the full Safari sandbox with no app JavaScript bridge — third-party pages cannot reach app code or shared app storage',
            'It bypasses ATS',
            'It hides the URL bar'
          ],
          answerIndex: 1,
          hint: 'What isolation does the separate Safari process give that an embedded WebView cannot?',
          explanation:
            'SFSafariViewController is the real browser in a separate sandboxed process: no JS bridge to the app, isolated cookie store. WKWebView embeds the engine in-process — power (bridges) that third-party content must not touch. Choice-of-container is the posture finding.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — WKWebView',
          url: 'https://developer.apple.com/documentation/webkit/wkwebview',
          note: 'Configuration, navigation delegate, and data store semantics'
        },
        {
          title: 'Apple Developer — SFSafariViewController',
          url: 'https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller',
          note: 'The isolated-container pattern for third-party content'
        },
        {
          title: 'OWASP MASTG — iOS WebView testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The WebView test family this lesson implements'
        }
      ]
    },
    {
      id: 'i17-l02',
      moduleId: 'i17',
      title: 'JavaScript Bridges: Message Handlers as Trust Inversions',
      difficulty: 'Advanced',
      minutes: 26,
      prerequisites: ['i17-l01', 'i03-l02'],
      objectives: [
        'Map the app\u2019s JavaScript bridges: registered handlers, exposed powers, calling conventions',
        'Test handler input handling as untrusted code — from any page the WebView can load',
        'Evaluate bridge-origin assumptions and design the secure alternative honestly'
      ],
      diagram: 'ios-webview-bridge',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A JavaScript bridge is a trust inversion: native powers (tokens, storage, actions) exposed to whatever the WebView loaded. The handler is the boundary — and handlers are routinely written as if the calling page were first-party. This lesson maps bridges (from static metadata and runtime enumeration), tests them as untrusted-input code, and frames the finding: whatever a page can send, the handler can execute.'
          }
        ],
        technical: [
          { type: 'h', text: 'The bridge anatomy' },
          {
            type: 'code',
            lang: 'swift',
            title: 'The WKScriptMessageHandler shape — the audit\u2019s target',
            code:
              'config.userContentController.add(self, name: "authBridge")   // JS: window.webkit.messageHandlers.authBridge.postMessage(...)\n\nfunc userContentController(_ ucc: WKUserContentController,\n                           didReceive message: WKScriptMessage) {\n    let body = message.body as? [String: Any] ?? [:]\n    switch body["action"] as? String {\n    case "getToken":\n        // AUDIT: which page can send this? What is sent back?\n        jsEval("window.tokenCb(\\(sessionToken))")     // token to JS — the inversion\n    case "runAction":\n        NativeRunner.run(body["name"] as? String)     // native dispatch from JS\n    default: break\n    }\n}'
          },
          {
            type: 'list',
            items: [
              'Registered handlers: userContentController.add(_ name:) calls — the bridge inventory (static from i09, runtime-confirmed via WKUserContentController inspection)',
              'Exposed powers per handler: what each action does (token reads, storage access, navigation, native dispatch) — the power map',
              'Calling convention: the JS side (window.webkit.messageHandlers.NAME.postMessage) and any JS-injection callbacks (evaluateJavaScript) — the two directions',
              'Origin assumptions: does the handler check WHO is calling (URL/frame provenance)? — usually absent, and that absence is the family\u2019s root'
            ]
          },
          { type: 'h', text: 'Testing the bridge' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Establish the reach: which pages can call the bridge (first-party only? any loaded content? file:// pages?) — the i17-l01 navigation posture decides',
              'Craft the caller: if any-host loads are possible, your test page (local server) calls every handler action with crafted payloads',
              'Observe the powers: token exfiltration (capture/observe the callback), storage reads/writes, navigation triggers, native action dispatch — every power exercised with attacker-chosen arguments',
              'Injections into handlers: format-string shapes in evaluateJavaScript callbacks (JS injection via token interpolation — the code shape above has one), command-shaped action names',
              'Verdict: bridge powers × reachable callers = the exposure matrix — a token-reading bridge reachable from any host is the critical shape'
            ]
          },
          { type: 'h', text: 'Origin assumptions, honestly evaluated' },
          {
            type: 'list',
            items: [
              'The secure shape: bridges restricted to first-party content only (load paths proven, or origin checks in the handler) — recognize before reporting',
              'The fragile shape: origin checks by string (message.webView.URL?.absoluteString.contains — i17-l01\u2019s bypass, again)',
              'The absent shape: no checks (the default in the wild) — the finding',
              'Design guidance for reports: expose minimal powers, bind tokens to gated keychain reads (module i15-l01\u2019s bound pattern), consider per-message origin validation and ephemeral data stores for third-party loads'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Bridge findings chain everything: i16\u2019s deep links load the page, i17-l01\u2019s navigation lets it be yours, the bridge hands it the powers — full narratives, critical severity when tokens move',
              'The exposure matrix (powers × callers) is the section\u2019s deliverable — reviewers see exactly what any page could do',
              'Token-exfiltration proofs pair with i14/i13: the token\u2019s value on the wire and its storage story complete the impact sentence',
              'JS-injection-into-native findings (interpolated evaluateJavaScript) are the subtle variant — the handler\u2019s own callbacks are code execution surfaces'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Handlers named auth/token/session/pay — the power-vocabulary from naming conventions (i09\u2019s metadata habit)',
              'evaluateJavaScript calls interpolating handler arguments or secrets (injection surfaces)',
              'Handler actions dispatching to native managers (runAction shapes) without allowlists',
              'Bridges registered on WebViews that load user/deep-link/server-driven content (reach + power together)',
              'Debug bridges (console/log/dev bridges) surviving release builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Map bridges: static (handler registrations, action switches, power map) + runtime confirmation (which WebViews registered what)',
              'Establish reach per bridge (navigation posture from i17-l01); stand up the caller page (local server) for any-host shapes',
              'Exercise every power with crafted payloads: token reads (observe the callback), native dispatches, navigation triggers, storage operations',
              'Probe the injection corners: interpolated JS callbacks, action-name dispatch, oversized/type-confused payloads',
              'Build the exposure matrix and write findings: per bridge, powers, reachable callers, impact (with wire/storage artifacts for the big ones)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The full chain, one narrative. Training app\u2019s help WebView (allow-list bypassed per i17-l01) registers bridge "authBridge" with action "getToken". Test page (local server, loaded via the navigation bypass) calls postMessage({action:"getToken"}); handler interpolates the session token into an evaluateJavaScript callback — token lands in YOUR page\u2019s JS. Capture confirms the same token authenticates on the API (i14). Narrative finding: "Cross-app URL → navigation bypass → bridge token disclosure: any web page can invoke targetapp://help?page=…, bypass the substring allowlist, and retrieve the session token via the authBridge handler (artifacts: navigation trace, token callback, wire-authenticated use)." Critical, chain-evidenced, fix-routed (allowlist by host, bridge origin checks, token gating) — the module\u2019s purpose in one story.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Frida (runtime bridge inspection, evaluateJavaScript observation), a local HTTP server for caller pages, the deep link kit, and the capture channel for power-consequence artifacts. The decompiler session (i09-l03) names the handlers; everything else is reach-and-exercise.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing bridges only from first-party flows — the finding lives at the reach boundary (which pages can call), established first',
              'Ignoring the JS-injection direction (handler → page callbacks) — interpolated secrets and arguments are code surfaces',
              'Reporting bridge existence as the finding — the exposure matrix (powers × callers) is the finding; a first-party-only bridge is the secure shape',
              'Forgetting ephemeral-store guidance in remediation — data-store isolation is half the structural fix for third-party loads'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Map and test one bridge on your training app end to end: registration, powers, reach, caller page, exposure matrix, finding. If the app has no bridges, the verified-clean line carries the inventory evidence — and your i16/i17 findings remain the WebView section\u2019s content. Either way, write the one-paragraph narrative chaining whatever you found from crossing to consequence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Bridges are trust inversions: native powers exposed to whatever the WebView loaded — the handler is the boundary',
            'Map (registrations, powers, conventions), establish reach (navigation posture), exercise (crafted callers), matrix (powers × callers)',
            'The chain narrative (crossing → navigation → bridge → credential → wire) is this module\u2019s signature output',
            'Secure shape recognition (first-party-only bridges, gated token reads) prevents false findings — evaluate origins honestly'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i17-l02-q1',
          type: 'mcq',
          prompt: 'What makes a WKScriptMessageHandler a "trust inversion"?',
          options: [
            'It uses deprecated APIs',
            'Native capabilities become callable by whatever content the WebView loaded — the caller\u2019s trust level inverts into the handler\u2019s powers',
            'It requires JavaScript to be disabled',
            'It runs on a background thread'
          ],
          answerIndex: 1,
          hint: 'Who can invoke the handler, and what does the handler have access to?',
          explanation:
            'The handler executes native code with native privileges, invoked from JS — a page context the app may not trust. Whoever controls the page context controls the invocation. That inversion is why reach (navigation posture) and handler validation decide security.'
        },
        {
          id: 'i17-l02-q2',
          type: 'truefalse',
          prompt: 'A bridge that reads the session token is safe as long as the WebView loads first-party content today.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did the load-source inventory say about "today" — and which module\u2019s findings change the reach?',
          explanation:
            'False — reach is dynamic: i16\u2019s deep links, i17-l01\u2019s navigation bypasses, or future feature changes can put other content in that WebView. The exposure matrix evaluates current reach AND latent reach; token bridges get the strictest verdicts.'
        },
        {
          id: 'i17-l02-q3',
          type: 'scenario',
          prompt:
            'A handler responds via evaluateJavaScript("cb(\\(token))"). Why is this an additional finding beyond token disclosure?',
          hint: 'What does interpolation into a JS string allow when the token (or an argument) contains quotes?',
          explanation:
            'It is a JS-injection surface: attacker-influenced values (or token-shaped secrets) interpolated into executable JS escape their string context — code execution in the page context. Disclosure (what leaves) plus injection (what executes) — both findings from one code shape.'
        },
        {
          id: 'i17-l02-q4',
          type: 'mcq',
          prompt: 'Which remediation set matches the bridge finding family?',
          options: [
            'Disable JavaScript entirely in all WebViews',
            'Restrict bridge registration to first-party WebViews, validate origins per message, expose minimal powers, gate token reads behind keychain/biometric release, ephemeral stores for third-party loads',
            'Rename the bridges',
            'Ship no findings — bridges are standard'
          ],
          answerIndex: 1,
          hint: 'What did the lesson name as the secure shape — layer by layer?',
          explanation:
            'Layered: first-party-only registration, real origin checks, minimal power surface, gated credentials (i15-l01\u2019s bound pattern), isolated stores. Disabling JS breaks the app; renaming changes nothing. Remediation quality is part of finding quality.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — WKScriptMessageHandler',
          url: 'https://developer.apple.com/documentation/webkit/wkscriptmessagehandler',
          note: 'The bridge API\u2019s official semantics'
        },
        {
          title: 'Apple Developer — WKUserContentController',
          url: 'https://developer.apple.com/documentation/webkit/wkusercontentcontroller',
          note: 'Handler registration and JS injection surfaces'
        },
        {
          title: 'OWASP MASTG — iOS WebView and bridge testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The bridge test family and secure-pattern framing'
        }
      ]
    },
    {
      id: 'i17-l03',
      moduleId: 'i17',
      title: 'Local Content, Origin Confusion and the WebView Section',
      difficulty: 'Advanced',
      minutes: 20,
      prerequisites: ['i17-l02'],
      objectives: [
        'Test local-content loading: file:// access, bundled HTML/JS, and their trust assumptions',
        'Identify origin-confusion patterns (mixed local/remote content, frame provenance)',
        'Assemble the WebView section of the report from the module\u2019s findings'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'WebView findings rarely travel alone: local content loads remote scripts, remote pages read local files, frames mix origins. This lesson closes the module — local-content tests, origin-confusion patterns, and the assembly of the WebView section from configuration, navigation, bridge and local-content findings into one coherent report block.'
          }
        ],
        technical: [
          { type: 'h', text: 'Local content tests' },
          {
            type: 'list',
            items: [
              'Bundled HTML/JS (i04\u2019s resources): what do the bundled pages assume (they often bridge freely, believing themselves first-party)? Can crossings make them receive attacker parameters (query strings into local pages)?',
              'file:// loads: via navigation bypasses (i17-l01) or parameter-driven loads — local file reads inside the WebView, including container artifacts (i13\u2019s files rendered as content)',
              'Mixed-content shapes: local pages loading remote scripts (the bundled-page trust assumption inverted — remote code in a "local" context)',
              'Cache/data-store hygiene for local pages: do local pages share stores with remote sessions (the confusion vector)?'
            ]
          },
          { type: 'h', text: 'Origin confusion patterns' },
          {
            type: 'list',
            items: [
              'The local-page bridge assumption: bundled pages call bridges without origin logic — any injection into their parameters (deep link query params) inherits their bridge powers',
              'Frame provenance: handlers that check the main frame\u2019s URL but act on iframe messages (provenance mismatch)',
              'Session-store mixing: remote and local content sharing one data store — cross-context cookie/token exposure',
              'The file-access inversion: allowsFileAccessFromFileURLs + a remote-loadable frame = local reads from remote content'
            ]
          },
          { type: 'h', text: 'Assembling the section' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Configuration block: per-WebView posture (container choice, JS, file access, data stores) — findings + verified-clean',
              'Navigation block: policy shapes with reachability (source inventory) and the chain findings',
              'Bridge block: the exposure matrices (powers × callers) and their narratives',
              'Local-content block: file access, bundled-page assumptions, origin confusion',
              'Remediation summary: the layered fix set (SFSafariViewController choice, host-allowlists, bridge gating, store isolation) — one paragraph routing all fixes'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The section\u2019s narrative arc (configuration → navigation → bridges → local content) mirrors the exploit chains — reviewers follow the same path attackers would',
              'Local-content findings are the surprise tier: bundled pages with bridges and parameter injection are common and rarely audited by teams',
              'Origin-confusion findings chain storage (i13: file reads) and network (i14: session cookies) — the section\u2019s severity arguments borrow from both',
              'The remediation summary is what clients implement — the layered fix set mapped to their findings makes the section actionable'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Bundled pages accepting query parameters (loadFileURL with allowingReadAccessTo wide scopes)',
              'allowsReadAccessTo set to the whole container (local-read scope over-breadth)',
              'Bundled pages registering/using bridges (the assumption audit)',
              'iframe-heavy third-party content in bridged WebViews (provenance mismatch surface)',
              'Local pages loading CDN scripts (mixed-content inversion)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Local-content inventory: bundled pages, their parameter handling, their bridge usage, their script sources',
              'Probe parameter injection into local pages (deep links/crossings feeding query strings) — bridge inheritance test',
              'Probe file-access scope: crafted file:// navigations and their read reach (container artifacts as targets)',
              'Run the origin-confusion checks: frame provenance in handlers, store sharing between contexts',
              'Assemble the section from all module findings with the remediation summary — the report block drafts from your artifacts'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The bundled-page inheritance finding. Training app bundles offline-help.html (bridge-calling, query-parameter aware: ?topic=X scrolls to section). Deep link: targetapp://help?page=offline-help.html%3Ftopic=%3Cscript%3E… — the local page receives an attacker query; its rendering context injects script; the page\u2019s bridge calls run with first-party assumptions. Finding: "Bundled local page accepts unvalidated query parameters and inherits bridge access; deep-link-delivered parameters execute script in the local origin with bridge powers." Fix: parameter validation in local pages, per-page bridge scoping. The local-content tier caught what neither the navigation nor the bridge audit alone would — the module\u2019s last tier earning its place.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The deep link kit, a local static server, the container tooling (for file-read targets), and the report template. The WebView section assembles from artifacts you already hold — this lesson is assembly and the last probes.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping bundled pages because "local files are static" — their parameters and bridge calls make them dynamic surfaces',
              'Reporting local file reads without scope specifics (which read-access grants) — the remediation is scope narrowing, which needs the exact shape',
              'Letting the section become a finding list — the narrative arc and remediation summary are what make it a section',
              'Missing the data-store mixing check — session exposure across contexts is often the real severity driver'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the local-content probes on your training app\u2019s bundled pages, then assemble the full WebView section (four blocks + remediation summary) from your i17 artifacts. The section\u2019s narrative should read as one coherent story from posture to exploit chains — if it does, modules i16/i17 are integrated and the capstone (i24) is rehearsed.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Local content is a dynamic surface: parameters, bridge inheritance, script sources — audit bundled pages like remote ones',
            'Origin confusion (frame provenance, store mixing, file-access inversion) is the subtle finding tier',
            'The WebView section assembles in four blocks plus a remediation summary — narrative over list',
            'Severity arguments borrow from i13 (file reads) and i14 (session exposure) — the sections chain'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i17-l03-q1',
          type: 'mcq',
          prompt: 'Why do bundled local pages deserve parameter-injection tests?',
          options: [
            'Local files cannot receive parameters',
            'They accept query parameters (deep-link fed), often run first-party assumptions, and may hold bridge access — parameters become script/injection context in a privileged origin',
            'They are always minified',
            'They bypass ATS'
          ],
          answerIndex: 1,
          hint: 'What does a deep link feeding ?topic=… into a bridge-calling local page actually deliver?',
          explanation:
            'Parameter content in a privileged local origin with bridge access: injection there inherits first-party powers. "Static" files with dynamic inputs are exactly the overlooked surface this test exists for.'
        },
        {
          id: 'i17-l03-q2',
          type: 'truefalse',
          prompt: 'allowsReadAccessTo set to the container root is acceptable because the app only loads its own local pages.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Whose loads does the grant govern — and which module\u2019s findings widen the load set?',
          explanation:
            'False — the grant governs ANY file:// load in that WebView (including i17-l01\u2019s bypass loads). Container-root scope turns every navigation bypass into local artifact reads (i13\u2019s files). Scope narrowing is the fix; breadth is the finding.'
        },
        {
          id: 'i17-l03-q3',
          type: 'scenario',
          prompt:
            'A handler checks the main frame URL but processes messages from iframes. Compose the finding.',
          hint: 'What is the provenance mismatch, and who controls iframe content?',
          explanation:
            '"Bridge handler validates main-frame origin only; iframe-sourced messages bypass the check (provenance mismatch). Third-party iframes in any loaded page invoke bridge powers (powers × callers matrix updated)." The fix: per-frame provenance validation — and the iframe content inventory becomes part of the WebView\u2019s reach assessment.'
        },
        {
          id: 'i17-l03-q4',
          type: 'mcq',
          prompt: 'What makes the WebView section\u2019s remediation summary more than a finding list?',
          options: [
            'Longer prose',
            'The layered fix set mapped to findings (container choice, allowlists, bridge gating, store isolation) — one coherent implementation plan the client can execute',
            'References to all modules',
            'Severity recalculation'
          ],
          answerIndex: 1,
          hint: 'What does a client need to actually fix four finding blocks at once?',
          explanation:
            'A mapped plan: which fix addresses which findings, in what order, with what trade-offs. The summary is the section\u2019s actionability layer — the difference between a report and a finding dump.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — loadFileURL (local file loading scopes)',
          url: 'https://developer.apple.com/documentation/webkit/wkwebview/1414818-loadfileurl',
          note: 'The read-access scope semantics behind the local-content findings'
        },
        {
          title: 'Apple Developer — WKWebViewConfiguration (data stores, file access)',
          url: 'https://developer.apple.com/documentation/webkit/wkwebviewconfiguration',
          note: 'Configuration surface for the section\u2019s posture block'
        },
        {
          title: 'OWASP MASTG — iOS WebView testing (complete family)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The section\u2019s test-family backing'
        }
      ]
    }
  ]
};
