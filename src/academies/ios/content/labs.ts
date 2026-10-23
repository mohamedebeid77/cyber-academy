import type { Lab } from '../../../types';

// iOS Application Pentesting Academy — practical labs.
// Every lab runs against LOCAL, intentionally vulnerable training targets
// (OWASP MASTestApp-iOS or equivalent licensed lab apps) or fully fictional
// scenarios. No lab directs testing at production apps or third-party systems.

export const labsData: Lab[] = [
  {
    id: 'l1',
    title: 'IPA Triage: The First Hour',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'You have been handed TargetLab.ipa (a training app built for this exercise) by a fictional client for an authorized assessment. Your first hour decides the engagement\u2019s shape: what the artifact is, what it ships, and what the plist and signature say about it. No dynamic work yet — pure triage, exactly as module i04/i08 taught.',
    target: 'MASTestApp-iOS build (or equivalent licensed training IPA), provided in your lab folder',
    objective:
      'Produce the complete bundle triage inventory: hashes, Mach-O profile, Info.plist lists, entitlements, embedded-binary table, config sweep — and identify three testable claims the triage generated.',
    tools: ['unzip/file/shasum', 'plutil', 'codesign', 'otool', 'grep'],
    learningObjectives: [
      'Execute the structured triage workflow from a cold start',
      'Read Info.plist and entitlements as test plans, not trivia',
      'Recognize distribution-channel signals in the signature and profile'
    ],
    hints: [
      'Start with the acquisition record (module i08-l01): hash first, always.',
      'The plist\u2019s five lists (schemes, permissions, ATS, background modes, document types) structure everything dynamic later.',
      'Cross-check entitlements across every binary — frameworks and extensions drift.'
    ],
    questions: [
      { q: 'What architecture slice(s) does the main binary carry, and what does that predict about simulator installability?', a: 'file(1) on the main binary shows arm64 (device slice). A device-only slice will not run in the iOS simulator — simulator testing would need an arm64-sim/x86_64 build or a different workflow (module i09-l01).' },
      { q: 'Which ATS exceptions are declared, and what is your verdict posture on each?', a: 'The training app declares NSAllowsArbitraryLoadsInWebContent (scoped to WebKit content — a hardening note unless WebView content is attacker-influenced) and no global exceptions. Each exception gets a justification verdict per module i04-l02\u2019s audit.' },
      { q: 'What does the embedded.mobileprovision (or its absence) tell you about the channel?', a: 'Its presence with a development/ad-hoc profile names the team, device list and entitlements (dev channel, get-task-allow likely present). Absence plus an Apple authority chain would indicate a store-signed build (module i01-l03/i06-l02).' },
      { q: 'Name three testable claims your triage generated and the module that tests each.', a: 'Example answers: (1) declared scheme handlers are injectable — module i16-l01; (2) plist flag vocabularies gate behavior — module i09/i21; (3) config JSON\u2019s staging endpoint is used at runtime — module i14-l02. Any three well-formed claims with module assignments score.' }
    ],
    expectedFindings: [
      'Complete four-list inventory (binaries, config, certs/keys, surprises)',
      'Signature/profile report with channel verdict',
      'Three testable claims with module assignments'
    ],
    solution: [
      'shasum -a 256 TargetLab.ipa > evidence/hashes.txt (acquisition record first)',
      'unzip -q TargetLab.ipa -d work/ && file work/Payload/*.app/* — identify the main Mach-O and slices',
      'plutil -p the Info.plist (and every .appex plist); transcribe the five lists',
      'codesign -dv + -d --entitlements on every binary; security cms -D on the profile if present',
      'Sweep Frameworks/, PlugIns/ and resources: file, strings, grep for endpoints/keys/flags',
      'Write the four lists, the signature report, and three testable claims with module assignments'
    ],
    remediation: [
      'This lab is analysis-only; remediation notes apply to findings the triage surfaces in later labs',
      'For the target app\u2019s developers: ATS exceptions should be scoped and justified; debug vocabularies removed from release builds'
    ],
    relatedLessons: ['i04-l01', 'i04-l02', 'i04-l03', 'i06-l03', 'i08-l01']
  },
  {
    id: 'l2',
    title: 'The Secrets Sweep: Static Hunt',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'The same training IPA, now under the microscope\u2019s high-power lens. The developer\u2019s fictional team has "temporarily" shipped several secrets. Your job: find every credential-shaped artifact, classify each with the module i08-l03 rubric (finding / hardening note / noise), and decode the ones that decode.',
    target: 'Same training IPA; binaries, resources and config files all in scope',
    objective:
      'Run the full secrets sweep (binaries + resources + configs), classify every candidate with justification, and decode the decodable (JWT, base64) to establish real impact.',
    tools: ['strings/grep', 'base64 decoder', 'JWT decoder', 'plutil'],
    learningObjectives: [
      'Run secret-shaped greps across all artifact classes',
      'Apply the classification rubric without overclaiming',
      'Decode tokens to ground severity in lifetime and scope'
    ],
    hints: [
      'Sweep resources and configs, not just binaries — plists and JSON ship secrets as often as code.',
      'The rubric\u2019s first question for any key: what does it actually authorize?',
      'JWT literals: the payload decodes — read exp and scope claims before judging.'
    ],
    questions: [
      { q: 'Which candidate did you classify as noise, and what justified the verdict?', a: 'Example: a public-by-design map API key (Google Maps-style) with documented client-key status — hardening note (restrictions recommended), not a finding. The rubric\u2019s authorized-privileges question decides (module i08-l03).' },
      { q: 'What did the JWT decode reveal, and how did it change severity?', a: 'The training app\u2019s JWT decodes to a service-account token with a 1-year expiry — transforming "string that looks like a token" into a critical static finding (long-lived privileged credential shipped to every user).' },
      { q: 'Where was the private-key material, and why is that class of finding always serious?', a: 'A PEM-shaped block in a bundled config (training-planted). Client-held private keys invert the trust model — anyone with the binary holds the key. Severity argues from the key\u2019s privileges (module i08-l03\u2019s table).' }
    ],
    expectedFindings: [
      'Complete candidate table with classifications and justifications',
      'Decoded JWT/base64 with lifetime/scope analysis',
      'At least one noise verdict with justification (the anti-overclaim demonstration)'
    ],
    solution: [
      'Run the secret-shaped grep block from module i08-l03 over strings outputs and resources',
      'Decode every base64-shaped candidate (base64 -d) before classifying',
      'Decode JWT literals (header.payload.signature) — read exp, sub, scope claims',
      'Apply the rubric table per candidate; write the three-class verdicts with justifications',
      'File the candidate table into the evidence bundle'
    ],
    remediation: [
      'Remove credentials from shipped artifacts; move secrets server-side or into gated keychain storage',
      'For keys that must ship (public-by-design): apply vendor restriction mechanisms and quota alerting'
    ],
    relatedLessons: ['i08-l03', 'i03-l03', 'i18-l02']
  },
  {
    id: 'l3',
    title: 'Container Harvest: Storage Truth',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'The training app is installed and exercised. Fictional users report "logout does not really log you out." Your job: prove or refute the claim at the storage layer — diff pairs across login/logout, every artifact read with its proper tool, and the finding sentences written in module i13\u2019s rubric form.',
    target: 'Training app installed on simulator or device (dev-signed); container access via the available channel',
    objective:
      'Execute the three-pair diff protocol, build the inventory table, verify the keychain decisions via observation, and write at least two finding sentences with both halves (what landed, who reaches it).',
    tools: ['Xcode container access or backup tooling', 'plutil/sqlite3', 'diff', 'Frida (SecItem hooks)'],
    learningObjectives: [
      'Run baseline-then-trigger container diffs with attribution discipline',
      'Read plists, SQLite, cookies and snapshots with their proper tools',
      'Reconcile keychain intent vs decision records'
    ],
    hints: [
      'One trigger per diff pair — login, feature, logout as three separate pairs.',
      'The logout pair answers the user report; the login pair finds the cause.',
      'UserDefaults data lives at Library/Preferences/<bundle>.plist — read it with plutil, not faith.'
    ],
    questions: [
      { q: 'What did the logout diff pair show, and does it confirm the user report?', a: 'Preferences plist unchanged (auth_token persists), Cookies rewritten without the session cookie — the token persists while the cookie cleans up. Confirms "not really logged out" at the storage layer; pair with the wire evidence (lab L4) for the full finding.' },
      { q: 'What did the SQLite contain, and how did schema-first reading help?', a: 'The training app\u2019s cache DB (schema-first: .schema reveals ZPERSISTEDRESPONSE-style tables) holds full API response bodies including user data — cross-account cache leakage shape when accounts switch (module i13-l02\u2019s rubric).' },
      { q: 'What did the SecItem hooks show about keychain accessibility choices?', a: 'Refresh token stored AfterFirstUnlock (not the code\u2019s intended WhenUnlockedThisDeviceOnly — wrapper-default drift, module i13-l03\u2019s reconciliation finding); access token stored correctly. One drift finding, one clean line.' }
    ],
    expectedFindings: [
      'Three diff pairs with classification of every change',
      'Inventory table (path → type → trigger → sensitivity → verdict)',
      'Two finding sentences in rubric form + at least one verified-clean line',
      'Keychain reconciliation table (intent vs decision)'
    ],
    solution: [
      'Baseline pull (container via Xcode/backup); trigger login; pull again; diff -rq',
      'Read every changed artifact: plutil for plists, sqlite3 schema-first for DBs, cookie parser for cookies',
      'Repeat for feature and logout triggers',
      'Run the SecItem* hook session (module i11-l04 scripts) through login/logout; build the reconciliation table',
      'Write the finding sentences (rubric: what/where/reachable/protection/verdict) and the clean lines'
    ],
    remediation: [
      'Store tokens in the Keychain with matched accessibility classes (WhenUnlockedThisDeviceOnly class choices); clear credentials on logout at the storage layer, not just UI',
      'Enable data protection on sensitive files; purge per-account caches on account switch'
    ],
    relatedLessons: ['i13-l01', 'i13-l02', 'i13-l03', 'i02-l03', 'i11-l04']
  },
  {
    id: 'l4',
    title: 'On the Wire: Session Truth',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'The same fictional complaint, now tested where truth lives: the wire. Your proxy is standing (module i07). Capture the app\u2019s traffic across login/logout/reuse, decode the tokens, and determine whether logout revokes anything server-side — then pair the wire verdict with lab L3\u2019s storage verdict into one finding.',
    target: 'Training app against its local/training backend (or a licensed training API); proxy configured per module i07-l03',
    objective:
      'Build the endpoint/behavior table, decode all tokens, run the logout-reuse and refresh-rotation probes, and write the paired storage+wire finding.',
    tools: ['Burp/mitmproxy', 'JWT decoder', 'The endpoint inventory from lab L1'],
    learningObjectives: [
      'Run the capture matrix with per-feature traceability',
      'Analyze token anatomy and lifecycle behavior on the wire',
      'Pair wire evidence with storage evidence into single findings'
    ],
    hints: [
      'Baseline capture first (idle + launch) — the reference every later capture compares against.',
      'The logout probe is gentle: one reuse attempt after logout, captured.',
      'Decode every token — exp and scope claims ground the severity.'
    ],
    questions: [
      { q: 'What did the logout-reuse probe show, and where does the fix live?', a: 'The captured pre-logout token authenticates post-logout (200 responses) — server-side revocation absent; fix is backend (token revocation/denylist), with client storage hygiene secondary (module i14-l04\u2019s layer rule).' },
      { q: 'What did token decoding reveal about lifetime and claims?', a: 'Access token: 15-minute exp (reasonable); refresh token: 30-day exp with offline_access and PII (email) in the payload — the PII-in-JWT finding rides along with the lifetime analysis (module i14-l04).' },
      { q: 'How did the paired sentence read — storage half and wire half?', a: '"Long-lived refresh token stored in plaintext preferences (L3 artifacts) remains valid after logout (L4 capture: old token authenticates post-logout) — exposure window is the token\u2019s full life, unrecoverable by user action." Both artifacts cited; severity amplified by the pairing.' }
    ],
    expectedFindings: [
      'Endpoint/behavior table (5+ rows, all columns)',
      'Token table with decoded claims',
      'The paired storage+wire finding with both artifact sets'
    ],
    solution: [
      'Verify the proxy (Safari check); run the baseline capture (module i07-l03 protocol)',
      'Capture per-feature flows; run the gentle manipulation and logout-reuse probes',
      'Decode tokens; build both tables',
      'Write the paired finding; cite both artifact sets with hashes'
    ],
    remediation: [
      'Implement server-side token revocation at logout; rotate refresh tokens on use; remove PII from JWT payloads (use opaque references)',
      'Client: keychain storage with matched classes (lab L3\u2019s remediation, same finding)'
    ],
    relatedLessons: ['i14-l02', 'i14-l04', 'i07-l03', 'i13-l02']
  },
  {
    id: 'l5',
    title: 'Deep Link Injection: The Crossing',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'The training app declares targetlab:// and routes parameters through its DeepLinkRouter. Fictional marketing "just added" a web-viewer route. Your job: map the handler surface, run the six-row matrix from module i16, and chain whatever you find into the WebView (lab L6\u2019s terrain) or forced actions.',
    target: 'Training app on simulator/device; deep links invoked via simctl/pymobiledevice3',
    objective:
      'Enumerate all handlers, extract the router\u2019s parameter vocabulary, execute the six-row matrix, and produce at least one injection finding with the chain narrative.',
    tools: ['xcrun simctl openurl / pymobiledevice3 open', 'Log channel', 'i09 metadata/decompilation'],
    learningObjectives: [
      'Enumerate deep link handlers (all of them) and extract parameter vocabularies',
      'Execute the injection matrix systematically',
      'Chain deep link findings into downstream sinks'
    ],
    hints: [
      'The router\u2019s parameter names live in its decompiled parse logic — extract, then craft.',
      'Multiple handlers may coexist (legacy openURL + scene + SwiftUI onOpenURL) — confirm live which fire.',
      'The web-viewer route is the chain\u2019s front door — follow it into the WebView.'
    ],
    questions: [
      { q: 'Which handlers fired per URL shape, and did any coexist?', a: 'Both the legacy application(_:open:) path and the scene-based openURLContexts fire for different launch states (cold vs warm) — a coexistence finding: testing only one misses the other\u2019s (weaker) validation (module i16-l01).' },
      { q: 'What did the parameter injection reach?', a: 'targetlab://web?url=<attacker-host> loads remote content in the in-app WKWebView (the chain into lab L6); targetlab://profile?id=<other-user-id> renders another fictional user\u2019s profile (forced-action/access shape — server half per module i15).' },
      { q: 'What was the scheme-collision verdict and its reachability framing?', a: 'A claiming stub app installed after the target intercepted the scheme on the lab simulator — framed as conditional ("any later-installed app claiming the scheme intercepts") rather than remote exploitation (module i16-l01\u2019s honesty rule).' }
    ],
    expectedFindings: [
      'Handler inventory (live-confirmed) and parameter vocabulary table',
      'Six-row matrix results with artifacts per row',
      'At least one injection finding with the chain narrative'
    ],
    solution: [
      'Statically enumerate handlers (i09 metadata: openURLContexts, onOpenURL, openURL); confirm live via log-filtered probes',
      'Decompile the router; extract the parameter vocabulary',
      'Craft the matrix probes (auth-reach, injection, WebView routing, redirect, token-in-URL, collision) and run them with log/capture channels armed',
      'Write findings with chain narratives and reachability framing'
    ],
    remediation: [
      'Validate all deep link parameters at the routing layer; authorize object access server-side; never load URL-provided content into WebViews without host allowlisting (exact-host matching)',
      'Consolidate handlers; remove legacy paths'
    ],
    relatedLessons: ['i16-l01', 'i16-l02', 'i09-l03', 'i15-l03']
  },
  {
    id: 'l6',
    title: 'Bridge Harvest: The Trust Inversion',
    difficulty: 'Advanced',
    points: 200,
    scenario:
      'Lab L5\u2019s web-viewer route loads attacker-controllable content into a WKWebView — and the training app registers an "authBridge" message handler. Your job: map the bridge\u2019s powers, establish reach from your test page, and exercise the full chain: crossing → navigation → bridge → token → wire.',
    target: 'Training app; a local HTTP server hosting your test page; the deep link kit from lab L5',
    objective:
      'Map all registered message handlers and their powers, prove reach from attacker-hosted content, exercise every power with crafted payloads, and write the exposure matrix with the chain narrative finding.',
    tools: ['Local HTTP server (python3 -m http.server)', 'Frida (bridge observation)', 'Log/capture channels'],
    learningObjectives: [
      'Map JavaScript bridges: registrations, powers, calling conventions',
      'Prove reach from attacker-controlled pages',
      'Write the exposure matrix and the full chain narrative'
    ],
    hints: [
      'The handler registrations live in the WKUserContentController setup — static first, runtime confirm.',
      'Your test page calls window.webkit.messageHandlers.<name>.postMessage(...) — craft payloads from the handler\u2019s switch logic.',
      'The token callback is evaluateJavaScript-based — watch for the interpolation injection too.'
    ],
    questions: [
      { q: 'What powers did the bridge expose, and which were reachable from your page?', a: 'getToken (returns the session token via JS callback — reachable), logEvent (telemetry injection — reachable), copyToClipboard (controlled writes — reachable). The exposure matrix rows: powers × callers, with getToken the critical row.' },
      { q: 'How did the chain narrative read, end to end?', a: '"Deep link (targetlab://web?url=) → navigation allowlist bypass (substring match) → attacker page in WebView → authBridge.getToken → token rendered into page JS → token replayed against the API (captured 200)." Five links, each artifacted — the module i17-l02 signature finding.' },
      { q: 'What additional injection did the callback introduce?', a: 'The token/argument interpolation into evaluateJavaScript is a JS-injection surface (quote-escape escapes the string context) — the disclosure finding rides with a code-execution-in-page-context finding (module i17-l02\u2019s subtle variant).' }
    ],
    expectedFindings: [
      'Bridge map (registrations, powers, conventions) static + runtime confirmed',
      'Exposure matrix (powers × callers)',
      'The chain narrative finding with five artifacted links'
    ],
    solution: [
      'Static: find userContentController.add registrations; decompile each handler\u2019s switch',
      'Stand up the test page; load it via lab L5\u2019s navigation bypass',
      'Exercise each handler action with crafted payloads; observe powers via capture/log channels',
      'Build the exposure matrix; write the chain narrative with all five links artifacted'
    ],
    remediation: [
      'Restrict bridge registration to first-party WebViews; validate origins per message; remove token-reading powers from bridges (gated keychain reads instead); fix the navigation allowlist (exact-host parsing)'
    ],
    relatedLessons: ['i17-l01', 'i17-l02', 'i16-l01', 'i11-l04']
  },
  {
    id: 'l7',
    title: 'Genuine Pass: The Patch That Answers',
    difficulty: 'Advanced',
    points: 200,
    scenario:
      'The training app gates its premium feature behind a license check that module i21 mapped (and your hooks can spoof — but the feature cross-validates the check\u2019s result against a signature, so spoofing diverges). Your job: the question filter says patch — execute the full modify → re-sign → install → verify loop (module i22) and answer the genuine-pass question.',
    target: 'Training app IPA (dev-signed); your signing identity and profile (module i06/i22 toolchain)',
    objective:
      'Run the complete patching workflow: minimal patch of the license check, entitlements preserved, every Mach-O re-signed, install verified — and document the patch ledger row completely, including the tamper-resistance observation.',
    tools: ['codesign/ldid', 'unzip/zip', 'devicectl/simctl install', 'The i09 maps (patch target)'],
    learningObjectives: [
      'Execute the re-signing workflow end to end with entitlements preserved',
      'Apply the question filter (patch vs hook) and the minimal-patch discipline',
      'Integrate the tamper-resistance observation into the resilience grades'
    ],
    hints: [
      'The patch target comes from your i09 map: the license check\u2019s comparison branch.',
      'Sign EVERY modified Mach-O — the gadget/embedded binaries too if you touched them.',
      'The integrity check (if it trips) is a positive finding — document the attempt chain.'
    ],
    questions: [
      { q: 'Why did the question filter choose patching over a hook?', a: 'The feature cross-validates the check\u2019s result (signature over the decision) — a spoofed hook diverges from the cross-check while a patched check passes genuinely (module i22-l02\u2019s genuine-pass class).' },
      { q: 'What did the complete ledger row record?', a: 'Question (genuine-pass behavior), target (check function\u2019s branch, from i09 map), change (2-byte branch flip), verification (premium path active, no collateral), provenance (hash pair, profile, device), answer (client handles the passing path correctly; server still enforces entitlement — cosmetic gate confirmed at full depth).' },
      { q: 'What tamper-resistance observation did the patch produce?', a: 'No local integrity check tripped (family-4 absent — resilience note, theatrical grade on this axis); the server\u2019s entitlement validation still held (positive finding — server trust boundary intact). Both integrated into module i21-l03\u2019s section.' }
    ],
    expectedFindings: [
      'Complete patched build (installs, runs, modification verified)',
      'Complete patch ledger row (all six columns)',
      'Tamper-resistance observation integrated into the resilience section'
    ],
    solution: [
      'Locate the patch target from the i09 map; design the minimal change',
      'Extract the IPA; apply the patch; preserve entitlements (ents.plist from the original)',
      'Re-sign every Mach-O; repackage; install via the i07 loop',
      'Verify incrementally; fill the ledger; integrate the tamper observation into i21-l03\u2019s grades'
    ],
    remediation: [
      'For the target app\u2019s developers: implement client integrity validation (SecCode validity checks with server-coupled reporting); treat client entitlement state as advisory (server enforcement — already present, confirmed by this lab)'
    ],
    relatedLessons: ['i22-l01', 'i22-l02', 'i21-l02', 'i06-l02']
  },
  {
    id: 'l8',
    title: 'The Mini-Engagement',
    difficulty: 'Advanced',
    points: 250,
    scenario:
      'Everything at once, time-boxed: a 3-hour mini-assessment of the training app using the 22-phase methodology (module i24), producing the full deliverable set — runbook, evidence bundle, findings register, report skeleton with coverage statement, and the edge list. This is the capstone\u2019s dress rehearsal.',
    target: 'The training app end to end; all channels you have built in labs L1–L7',
    objective:
      'Execute phases 1–22 within the time box with phase-gate discipline, produce the five deliverables, and write the honest edge list with module-cited remedies.',
    tools: ['Everything from labs L1–L7', 'The 22-phase runbook (module i24-l01)', 'The report template'],
    learningObjectives: [
      'Orchestrate the full methodology under time pressure',
      'Maintain evidence hygiene at engagement scale',
      'Produce the professional deliverable set and the honest edge list'
    ],
    hints: [
      'Phase gates are the discipline: each phase\u2019s artifacts exist and are hashed before the next opens.',
      'The coverage statement drafts at phase 3, not phase 22 (the classic edge).',
      'Minimum evidence pairs everywhere — static claim + dynamic artifact or it does not enter the register.'
    ],
    questions: [
      { q: 'Which phases produced the most findings per hour, and what does that mean for planning?', a: 'Typically the static sweep (phase 8) and the network matrix (phase 14) — cheap channels, high yield. Planning implication: front-load them; the specialized tiers (crypto, resilience) consume time for fewer but deeper findings.' },
      { q: 'What did your edge list name, and which modules own the remedies?', a: 'Model answer shape: named drift patterns (browsing in instrumentation, late coverage statement, thin crypto row) each citing its module\u2019s Try-It as the remedy — the i24-l02 three-part shape (pattern, module, remedy).' },
      { q: 'Did every findings-register entry carry the minimum evidence pair?', a: 'The graduation bar requires it — entries without a dynamic artifact move to the limitations section explicitly. The self-audit IS the exercise.' }
    ],
    expectedFindings: [
      'The five deliverables: runbook, evidence bundle, findings register (5+ findings, 4+ categories), report skeleton with coverage statement, edge list'
    ],
    solution: [
      'Run the 22 phases per module i24-l01\u2019s table with strict gates and time boxes',
      'Assemble the bundle per phase; label and hash continuously',
      'Draft the report (coverage statement at phase 3, updated at 22); write retest criteria per finding',
      'Write the edge list in the three-part shape; convert to the practice plan'
    ],
    remediation: [
      'Remediation routing is part of the report exercise — every finding names its fix layer and owner',
      'The practice plan (from the edge list) is the meta-remediation: your workflow\u2019s own fixes'
    ],
    relatedLessons: ['i24-l01', 'i24-l02', 'i23-l02', 'i20-l02']
  }
];
