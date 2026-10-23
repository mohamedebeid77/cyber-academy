import type { CheatSheet } from '../../../types';

// iOS Application Pentesting Academy — cheat sheets.
// Field-usable command references; every sheet pairs with its module lessons.

export const cheatsheets: CheatSheet[] = [
  {
    id: 'cs1',
    title: 'iOS Pentest Checklist',
    description: 'The 22-phase methodology (module i24) compressed into a phase-gated runbook.',
    category: 'Methodology',
    entries: [
      { cmd: '1. Scope & ROE', desc: 'Signed scope; environment decision table; channel plan; artifacts requested' },
      { cmd: '2. Acquire app', desc: 'Acquisition record: sha256, channel, device, tool, date' },
      { cmd: '3. Environment', desc: 'Workbench profile; proxy baseline capture; CA full-trust verified' },
      { cmd: '4-5. IPA + Info.plist', desc: 'Bundle inventory (4 lists); plist five-lists; extension plists included' },
      { cmd: '6-7. Entitlements + signing', desc: 'Entitlement report (all binaries); signature contradictions; profile decode' },
      { cmd: '8-9. Static + RE', desc: 'Sweep tables (URLs/keys/flags/SDKs); target list (imps + questions); listing-verified paragraphs' },
      { cmd: '10. Runtime analysis', desc: 'Observation designs (trigger/channel/artifact/verdict); diff pairs; process inventory' },
      { cmd: '11. Instrumentation', desc: 'Hook transcripts (labeled: Frida/LLDB); one question per session; system-boundary hooks' },
      { cmd: '12-13. Storage + privacy', desc: 'Container diff pairs; keychain reconciliation; backup/pasteboard/snapshot tests' },
      { cmd: '14. Network', desc: 'Endpoint/behavior table; token decoding; lifecycle probes; pinning refusal map' },
      { cmd: '15-16. Auth + authz', desc: 'Gate verdicts (bound vs decorative); forge-and-listen pairs; BOLA two-account table' },
      { cmd: '17. Platform surface', desc: 'Deep link matrix; universal link chain audit; extensions; pasteboard' },
      { cmd: '18. Cryptography', desc: 'Dimension inventories; key lifecycle tables; custom-crypto rubric' },
      { cmd: '19-20. Resilience + tampering', desc: 'Control grades (measured effort); attempt chains; patch ledger' },
      { cmd: '21-22. Evidence + report + retest', desc: 'Hashed bundle; citation chains; coverage statement; verifiable retest criteria' }
    ]
  },
  {
    id: 'cs2',
    title: 'IPA Analysis',
    description: 'Bundle triage and inventory workflow (modules i04, i08).',
    category: 'Static Analysis',
    entries: [
      { cmd: 'shasum -a 256 app.ipa', desc: 'Acquisition hash (evidence identity)' },
      { cmd: 'unzip -q app.ipa -d work/', desc: 'Extract the archive' },
      { cmd: 'file Payload/App.app/App', desc: 'Slice/architecture identification' },
      { cmd: 'ls Payload/App.app/Frameworks Payload/App.app/PlugIns', desc: 'Embedded binaries inventory (triage all of them)' },
      { cmd: 'find Payload/App.app -name "*.plist" -o -name "*.json" -o -name "*.sqlite*"', desc: 'Config artifact sweep' },
      { cmd: 'find Payload/App.app -name "*.cer" -o -name "*.pem" -o -name "*.mobileprovision"', desc: 'Certificate/profile inventory' },
      { cmd: 'lipo -info <binary>', desc: 'Fat binary slice report' },
      { cmd: 'otool -L <binary>', desc: 'Linked libraries (SDK dependency picture)' }
    ]
  },
  {
    id: 'cs3',
    title: 'Info.plist',
    description: 'Reading and auditing the app identity card (module i04-l02).',
    category: 'Static Analysis',
    entries: [
      { cmd: 'plutil -p Payload/App.app/Info.plist', desc: 'Decode and read the full plist' },
      { cmd: 'grep -A5 CFBundleURLTypes', desc: 'Declared URL schemes (deep link surface)' },
      { cmd: 'grep -B2 -A10 NSAppTransportSecurity', desc: 'ATS posture (every key gets a verdict)' },
      { cmd: 'grep NS.*UsageDescription', desc: 'Permission strings (privacy scope audit)' },
      { cmd: 'grep -A5 UIBackgroundModes', desc: 'Background behavior promises' },
      { cmd: 'grep CFBundleDocumentTypes -A10', desc: 'Document types (extra invocation surface)' },
      { cmd: 'plutil -p Payload/App.app/PlugIns/*.appex/Info.plist', desc: 'Extension plists (their own claims!)' }
    ]
  },
  {
    id: 'cs4',
    title: 'Entitlements',
    description: 'Dumping and interpreting entitlements (module i06-l03).',
    category: 'Signing',
    entries: [
      { cmd: 'codesign -d --entitlements :- <binary>', desc: 'Dump the entitlements blob' },
      { cmd: 'ldid -e <binary>', desc: 'Entitlements via ldid (cross-check)' },
      { cmd: 'security cms -D -i embedded.mobileprovision > p.plist', desc: 'Decode the provisioning profile' },
      { cmd: 'plutil -p p.plist | grep -A20 Entitlements', desc: 'Profile-side entitlements (diff vs binary)' },
      { cmd: 'grep get-task-allow', desc: 'The instrumentation hinge (debug builds true)' },
      { cmd: 'grep keychain-access-groups -A5', desc: 'Shared keychain scope (proportionality check)' },
      { cmd: 'grep application-groups -A5', desc: 'App group containers (shared-state crossings)' },
      { cmd: 'grep associated-domains -A5', desc: 'Universal link domains (wildcard audit)' },
      { cmd: 'grep com.apple.private', desc: 'The provenance red flag (never in store builds)' }
    ]
  },
  {
    id: 'cs5',
    title: 'Code Signing',
    description: 'Signature inspection and re-signing workflow (modules i06, i22).',
    category: 'Signing',
    entries: [
      { cmd: 'codesign -dv --verbose=4 <binary>', desc: 'Signature details (authority, team, flags)' },
      { cmd: 'codesign --verify --verbose <bundle>', desc: 'Validate bundle signatures' },
      { cmd: 'codesign -d --entitlements :- <bin> > ents.plist', desc: 'Preserve entitlements before modifying' },
      { cmd: 'codesign --force --sign "identity" --entitlements ents.plist <bundle>', desc: 'Re-sign with preserved entitlements' },
      { cmd: 'ldid -Sents.plist <binary>', desc: 'ldid signing (gadget/patch workflows)' },
      { cmd: 'ldid -S <binary>', desc: 'Ad-hoc sign' },
      { cmd: 'zip -qr resigned.ipa Payload/', desc: 'Repackage after signing' },
      { cmd: 'codesign --verify --verbose Payload/App.app', desc: 'Verify before install' }
    ]
  },
  {
    id: 'cs6',
    title: 'Frida',
    description: 'Core Frida commands and hook shapes (module i11).',
    category: 'Dynamic Analysis',
    entries: [
      { cmd: 'frida-ls-devices', desc: 'List reachable devices' },
      { cmd: 'frida-ps -U', desc: 'List device processes' },
      { cmd: 'frida -U -f com.bundle.id', desc: 'Spawn suspended (early logic), then %resume' },
      { cmd: 'frida -U -n App', desc: 'Attach to running app' },
      { cmd: 'frida -U -f com.bundle.id -l agent.js', desc: 'Run an agent script' },
      { cmd: 'ObjC.available', desc: 'Runtime sanity check' },
      { cmd: 'ObjC.classes.X.$ownMethods', desc: 'Hookable method surface' },
      { cmd: 'Interceptor.attach(X["- sel:"].implementation, {onEnter, onLeave})', desc: 'The ObjC hook (args[2]+ are real args)' },
      { cmd: 'new ObjC.Object(args[2]).toString()', desc: 'Read an object argument' },
      { cmd: 'retval.replace(ptr(1))', desc: 'Forge a return (deliberate, reason stated)' },
      { cmd: 'Module.findExportByName(null, "CCCrypt")', desc: 'Native symbol resolution' },
      { cmd: 'Thread.backtrace(this.context, Backtracer.ACCURATE)', desc: 'Who called this (reachability proof)' }
    ]
  },
  {
    id: 'cs7',
    title: 'LLDB',
    description: 'The precision debugger\u2019s core loop (module i12).',
    category: 'Dynamic Analysis',
    entries: [
      { cmd: 'lldb', desc: 'Start the debugger' },
      { cmd: 'platform select ios; platform connect', desc: 'Device attach path' },
      { cmd: 'process attach --name App', desc: 'Attach to running app (dev builds)' },
      { cmd: 'breakpoint set --name "-[X sel:]"', desc: 'Selector breakpoint' },
      { cmd: 'breakpoint set --address 0x…', desc: 'Address breakpoint (compute slide first)' },
      { cmd: 'watchpoint set variable <expr>', desc: 'Who writes this memory (provenance)' },
      { cmd: 'c', desc: 'Continue' },
      { cmd: 'bt', desc: 'Backtrace of the stopped thread' },
      { cmd: 'register read x0 x1 x2', desc: 'ARM64 arguments/return (i19-l01)' },
      { cmd: 'po self / po <expr>', desc: 'Print object state at the stop' },
      { cmd: 'memory read --size 4 --format x --count 16 $x0', desc: 'Memory inspection' }
    ]
  },
  {
    id: 'cs8',
    title: 'Keychain',
    description: 'Classes, observation and verification (modules i05, i13).',
    category: 'Storage',
    entries: [
      { cmd: 'kSecAttrAccessibleWhenUnlockedThisDeviceOnly', desc: 'Strong default for secrets (unlock-gated, non-migrating)' },
      { cmd: 'kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly', desc: 'Crown-jewel tier (invalidated on passcode removal)' },
      { cmd: 'kSecAttrAccessibleAfterFirstUnlock', desc: 'Common default — audit what lives here (weaker window)' },
      { cmd: 'kSecAttrAccessibleAlways*', desc: 'Legacy/weak — finding territory' },
      { cmd: 'Frida: hook SecItemAdd / SecItemCopyMatching', desc: 'The decision record (module i13-l03)' },
      { cmd: 'Log kSecAttrAccessible + kSecAttrAccessGroup per item', desc: 'Class and sharing scope per write' },
      { cmd: 'objection: ios keychain dump', desc: 'At-rest exploration (lab contexts)' },
      { cmd: 'Reconcile: intent (static) vs decision (runtime) vs stored (at-rest)', desc: 'The three-channel verification table' }
    ]
  },
  {
    id: 'cs9',
    title: 'iOS Storage',
    description: 'Container paths and reading tools (modules i02, i13).',
    category: 'Storage',
    entries: [
      { cmd: 'Documents/', desc: 'User data — backup-included; sensitivity audit' },
      { cmd: 'Library/Preferences/<bundle>.plist', desc: 'UserDefaults — plaintext XML; the classic finding shelf' },
      { cmd: 'Library/Application Support/', desc: 'Core Data/SQLite working data — backup-included' },
      { cmd: 'Library/Caches/', desc: 'Caches — NOT backup-included but fully on disk (exclusion ≠ protection)' },
      { cmd: 'Library/Cookies/', desc: 'Binary cookies — parse for session truth' },
      { cmd: 'tmp/', desc: 'Scratch — purged; debug logs hide here' },
      { cmd: 'plutil -p <plist>', desc: 'Read any plist' },
      { cmd: 'sqlite3 db.sqlite ".schema" then SELECT', desc: 'Schema-first database reading' },
      { cmd: 'diff -rq baseline after', desc: 'The diff-pair protocol (attribution)' },
      { cmd: 'xcrun devicectl device copy --domain-type appDataContainer', desc: 'Dev-build container pull' }
    ]
  },
  {
    id: 'cs10',
    title: 'Network Testing',
    description: 'Proxy setup and capture analysis (modules i07, i14).',
    category: 'Network',
    entries: [
      { cmd: 'Burp: bind 0.0.0.0:8080', desc: 'Listener on all interfaces' },
      { cmd: 'Device Wi-Fi → Configure Proxy → Manual', desc: 'Device proxy config' },
      { cmd: 'http://burp → install CA', desc: 'CA step 1 (profile install)' },
      { cmd: 'Settings → Certificate Trust Settings → enable', desc: 'CA step 2 (full trust — the missed step!)' },
      { cmd: 'iproxy 8080 8080', desc: 'USB-mediated proxy (stability for long captures)' },
      { cmd: 'Baseline: idle 2m → launch → core flows', desc: 'The reference capture (module i07-l03 protocol)' },
      { cmd: 'Per-session-stack refusal probes', desc: 'Pinning evidence map (which stacks refuse your CA)' },
      { cmd: 'Decode JWTs: header.payload.signature', desc: 'Token anatomy (exp, scope, claims)' },
      { cmd: 'Gentle manipulation: single-param edits, one replay', desc: 'Surface mapping discipline (i14-l02)' }
    ]
  },
  {
    id: 'cs11',
    title: 'Deep Links',
    description: 'Scheme and universal link testing (module i16).',
    category: 'Attack Surface',
    entries: [
      { cmd: 'xcrun simctl openurl booted "scheme://path?param=v"', desc: 'Simulator deep link invocation' },
      { cmd: 'pymobiledevice3 open "scheme://path"', desc: 'Device invocation' },
      { cmd: 'grep -A5 CFBundleURLTypes', desc: 'Declared schemes (per extension too!)' },
      { cmd: 'Decompile: application(_:open:) + openURLContexts + onOpenURL', desc: 'ALL handlers (they coexist — test each)' },
      { cmd: 'Extract router vocabulary → craft params', desc: 'Extract-then-craft (never guess param names)' },
      { cmd: 'Matrix: auth-reach, injection, WebView routing, redirect, token-in-URL, collision', desc: 'The six-row test plan' },
      { cmd: 'Fetch /apple-app-site-association (authorized)', desc: 'AASA audit (paths, appids, wildcards)' },
      { cmd: 'Collision test: install claiming stub AFTER target', desc: 'Registration-order hijack (conditional framing)' }
    ]
  },
  {
    id: 'cs12',
    title: 'WebViews',
    description: 'WKWebView audit and bridge testing (module i17).',
    category: 'Attack Surface',
    entries: [
      { cmd: 'Static: WKWebViewConfiguration inventory', desc: 'JS flags, file access, data stores per WebView' },
      { cmd: 'decidePolicyForNavigationAction reading', desc: 'The navigation gate — allow-all? substring allowlist?' },
      { cmd: 'Exact-host parsing check', desc: 'contains()-style allowlists are bypassable (embed the string)' },
      { cmd: 'userContentController.add inventory', desc: 'Bridge registrations (powers × callers matrix)' },
      { cmd: 'Test page: window.webkit.messageHandlers.X.postMessage({...})', desc: 'The caller harness (local server)' },
      { cmd: 'evaluateJavaScript interpolation check', desc: 'JS-injection surfaces in callbacks' },
      { cmd: 'allowsFileAccessFromFileURLs / loadFileURL scopes', desc: 'Local-read scope audit' },
      { cmd: 'SFSafariViewController for third-party content', desc: 'The safe container choice (posture finding when absent)' }
    ]
  },
  {
    id: 'cs13',
    title: 'Mach-O',
    description: 'Binary format inspection quick reference (module i09-l01).',
    category: 'Reverse Engineering',
    entries: [
      { cmd: 'magic 0xfeedfacf', desc: '64-bit Mach-O header magic' },
      { cmd: 'otool -h <bin>', desc: 'Header: cputype, filetype, ncmds' },
      { cmd: 'otool -l <bin> | grep -A3 LC_LOAD_DYLIB', desc: 'Linked libraries per load command' },
      { cmd: 'otool -l <bin> | grep -B2 -A5 __TEXT', desc: 'Segment/section layout (vm addresses for slide math)' },
      { cmd: 'LC_CODE_SIGNATURE', desc: 'Trailing signature (page hashes + entitlements + CMS)' },
      { cmd: 'LC_LOAD_WEAK_DYLIB', desc: 'Optional libraries (feature-conditional behavior)' },
      { cmd: 'LC_RPATH', desc: 'Embedded-library search paths (architecture smells)' },
      { cmd: '__objc_classlist / __objc_methname', desc: 'ObjC metadata sections (dispatch-required, survives stripping)' },
      { cmd: 'lipo -thin <arch>', desc: 'Extract the slice you intend to analyze' }
    ]
  },
  {
    id: 'cs14',
    title: 'iOS Reverse Engineering',
    description: 'The RE workflow and verification discipline (modules i09, i19).',
    category: 'Reverse Engineering',
    entries: [
      { cmd: 'Stage 1-3: profile → sweep → target list (imps + questions)', desc: 'The metadata-first workflow (never browse)' },
      { cmd: 'otool -oV <bin> | grep -E "name|imp"', desc: 'ObjC surface with implementation addresses' },
      { cmd: 'swift demangle <symbol>', desc: 'Swift name recovery ($s... symbols)' },
      { cmd: 'nm -u <bin>', desc: 'Import surface (system API usage → hook targets)' },
      { cmd: 'Ghidra: xrefs to + from, then listing verification', desc: 'Every claim verified at instruction level' },
      { cmd: 'objc_msgSend: read the SELECTOR, not the dispatcher', desc: 'The decompilation reading rule' },
      { cmd: 'arm64: args x0-x7, return x0; w-views are 32-bit', desc: 'The register reading subset' },
      { cmd: 'One question per session; one-page output rule', desc: 'The RE discipline that produces report-grade paragraphs' }
    ]
  },
  {
    id: 'cs15',
    title: 'MASTG iOS Testing Workflow',
    description: 'The MAS framework workflow map (module i23) — current-version discipline.',
    category: 'Standards',
    entries: [
      { cmd: 'mas.owasp.org/MASVS', desc: 'Requirements (stable category ids: MASVS-STORAGE-1 …)' },
      { cmd: 'mas.owasp.org/MASTG/iOS', desc: 'iOS tests/techniques — cite by NAME, link live (ids renumber across versions)' },
      { cmd: 'mas.owasp.org/MASWE', desc: 'Named weaknesses (the finding-citation middle layer)' },
      { cmd: 'Citation chain: finding → MASWE → MASTG family → MASVS category', desc: 'The professional finding\u2019s full form' },
      { cmd: 'Coverage statement: channels used, answers, limits, risk note', desc: 'The report\u2019s credibility foundation (module i20-l02)' },
      { cmd: 'Per-category artifact counts', desc: 'Verifiable coverage (the check that keeps claims honest)' },
      { cmd: 'STORAGE/CRYPTO/AUTH/NETWORK/PLATFORM/CODE/RESILIENCE/PRIVACY', desc: 'The eight categories — the engagement\u2019s section structure' }
    ]
  }
];
