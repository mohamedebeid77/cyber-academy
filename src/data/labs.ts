import type { Lab } from '../types';

// Hands-on labs against intentionally vulnerable local training apps only
// (OWASP MASTG crackmes, DIVA, or any equivalent APK you install yourself).

export const labsData: Lab[] = [
  {
    id: 'lab-01',
    title: 'Find the Exposed Activity',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'A contractor says their new build "only shows the welcome screen". Rumor inside the (fictional) company says there is a maintenance screen that is not supposed to be reachable. You have the training APK on your emulator.',
    target:
      'Any intentionally vulnerable training app with an exported, undocumented activity (e.g. DIVA-style inputs or a MASTG crackme build). Verify exported-ness yourself from the manifest.',
    objective:
      'Enumerate the app\u2019s exported activities, identify one that exposes sensitive functionality, and invoke it directly with adb to demonstrate that authentication/navigation can be bypassed.',
    tools: ['adb', 'JADX', 'apkanalyzer (optional)'],
    learningObjectives: [
      'Read the manifest to enumerate components and exported state',
      'Reason about who can start an exported activity and with which extras',
      'Invoke components directly and capture evidence of the bypass'
    ],
    hints: [
      'The manifest declares everything: look for android:exported and intent-filters (JADX or aapt2 dump xmltree).',
      'dumpsys package <pkg> also lists activities — compare with what the UI actually exposes.',
      'adb shell am start -n <pkg>/<fully.qualified.ActivityName> starts any exported activity directly; check the decompiled code for expected extras.'
    ],
    questions: [
      { q: 'Which activity was exported, and what sensitive functionality did it expose?', a: 'The undocumented maintenance/admin activity (name varies per training app). It rendered sensitive data or performed a privileged action with no caller check.' },
      { q: 'Why does the app\u2019s login screen not protect this activity?', a: 'Exported activities are entry points outside the app\u2019s navigation flow. Any access control implemented as "you can only reach this screen after login in the UI" is not enforced inside the component itself.' },
      { q: 'What would the remediation be?', a: 'Set android:exported="false" unless strictly needed; require a signature-level permission; validate the caller and inputs inside the component; move sensitive actions behind server-side checks.' }
    ],
    expectedFindings: [
      'An exported activity reachable via adb am start without authentication',
      'The component performs sensitive display/action with attacker-controlled or absent input validation',
      'No permission guard is declared on the component'
    ],
    solution: [
      'Install the training APK: adb install -t target.apk.',
      'List activities: adb shell dumpsys package <pkg> | grep -i activity (or read AndroidManifest.xml in jadx-gui).',
      'Note every activity with android:exported="true" or an intent-filter.',
      'In JADX, open each candidate activity and read onCreate/onResume: what does it render or do? What extras does it read (getIntent().getStringExtra(...))?',
      'Start the target activity: adb shell am start -n <pkg>/<activity> (add --es key value for any expected extras).',
      'Screenshot the sensitive screen as evidence; capture the command line used.',
      'Confirm there is no permission check: the manifest entry has no android:permission and the code performs no caller validation.',
      'Write the finding: description, impact, reproduction (the am command), remediation.'
    ],
    remediation: [
      'Set android:exported="false" on all components without a legitimate external caller (Android 12+ enforces explicit declarations).',
      'Protect any genuinely external entry point with a signature-level permission and internal caller/input validation.',
      'Never rely on navigation flow as an access control — enforce authorization in the component and, for sensitive data, server-side.'
    ],
    relatedLessons: ['m01-l04', 'm04-l05', 'm07-l01']
  },
  {
    id: 'lab-02',
    title: 'Recover a Secret Stored Insecurely',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'A training app stores "user settings" locally. The team insists nothing sensitive is persisted. You get one task: log in with a test account and find out whether anything in local storage would hurt if the device was lost.',
    target:
      'Any training app that persists a token/secret in SharedPreferences or an unencrypted SQLite database (DIVA and similar training apps work well).',
    objective:
      'Log into the training app, inspect its private storage on a debuggable/rooted target, and locate a secret stored in plaintext; document the storage location and the exact value type (token, pin, answer).',
    tools: ['adb', 'run-as', 'sqlite3 (optional)'],
    learningObjectives: [
      'Locate app-private storage paths on device',
      'Read SharedPreferences XML and query SQLite databases',
      'Distinguish "inside the sandbox" from "protected"'
    ],
    hints: [
      'Shared prefs live in /data/data/<pkg>/shared_prefs — readable via run-as on debuggable builds or a rooted emulator.',
      'After logging in, watch for new files: run-as <pkg> ls -laR /data/data/<pkg> | less',
      'Databases live in databases/; pull and open with sqlite3, or cat the prefs XML and read it directly.'
    ],
    questions: [
      { q: 'Which file contained sensitive data and what was it?', a: 'shared_prefs/*.xml contained the session token / flag / credentials in plaintext XML (names vary per target). Some targets also ship an unencrypted SQLite DB with account data.' },
      { q: 'Why is "it\u2019s inside the app\u2019s private directory" not a sufficient defense?', a: 'On rooted devices, debuggable builds, via backup mechanisms, and on lost devices with unlocked screens, sandbox-internal plaintext is readable. Threat models include device compromise, not just other apps.' },
      { q: 'How should this be stored instead?', a: 'Keystore-backed encryption (AndroidKeyStore keys wrapping data), EncryptedSharedPreferences/EncryptedFile, or not persisting the secret at all; server sessions should be revocable.' }
    ],
    expectedFindings: [
      'Plaintext secret in SharedPreferences XML (or SQLite DB) inside the app\u2019s private storage',
      'The value is a session token, password, or challenge answer usable to impersonate the user',
      'No use of AndroidKeyStore/encryption anywhere in the storage path'
    ],
    solution: [
      'Install and launch the app; log in with any test credentials.',
      'adb shell run-as <pkg> ls shared_prefs/ (rooted emulator: adb root then browse /data/data/<pkg>).',
      'cat the XML files: note keys and values — look for tokens, "password", "pin", session identifiers.',
      'Check databases/: run-as <pkg> ls databases/, pull the .db and inspect tables for sensitive rows.',
      'Optional: clear logcat (adb logcat -c), repeat login, and grep adb logcat -d for the same secret.',
      'Record exact file paths and values (redacted) as evidence.',
      'Grade the finding against MASVS-STORAGE and write remediation.'
    ],
    remediation: [
      'Move secrets to AndroidKeyStore-encrypted storage (EncryptedSharedPreferences/EncryptedFile) or keep them server-side in revocable sessions.',
      'Never log credentials or tokens; scrub crash reports.',
      'Set android:allowBackup="false" (or implement proper backup rules) for apps with local secrets.'
    ],
    relatedLessons: ['m01-l07', 'm05-l02', 'm08-l01']
  },
  {
    id: 'lab-03',
    title: 'Intercept Insecure Traffic',
    difficulty: 'Beginner',
    points: 150,
    scenario:
      'A training app claims "all communication is encrypted". You have an emulator, Burp Suite and ten minutes to test whether that claim survives contact with reality.',
    target:
      'A training app that either uses cleartext HTTP or trusts user-installed CAs (apps without pinning and with permissive NSC). DIVA-style apps or MASTG practice apps fit.',
    objective:
      'Route the app\u2019s traffic through Burp, capture a login (or equivalent) request, and document what an attacker on the same network could observe or modify.',
    tools: ['Burp Suite', 'adb', 'Emulator'],
    learningObjectives: [
      'Configure a device/emulator proxy to an interception proxy',
      'Install a CA certificate and understand Android trust behavior',
      'Capture and interpret app API traffic'
    ],
    hints: [
      'Burp: Proxy → Options → add a listener on All interfaces :8080. Emulator proxy: Wi-Fi settings → modify network.',
      'Download the CA at http://burp from the emulator\u2019s browser and install it; on Android 7+ targets you may need the system-store trick (rooted emulator) or an app that trusts user CAs.',
      'If nothing appears in HTTP history: check the proxy binding, the app\u2019s network security config, and whether it pins certificates.'
    ],
    questions: [
      { q: 'Was the request encrypted? What could an attacker see?', a: 'Either the request was plaintext HTTP, or TLS terminated at your proxy because the app trusts user CAs — either way credentials/tokens were visible in the capture.' },
      { q: 'What Android setting made the interception possible?', a: 'The app trusts user-added CAs (default for apps targeting API < 24, or explicit in its network security config) or simply uses cleartext.' },
      { q: 'What is the correct hardening?', a: 'TLS-only (usesCleartextTraffic=false), restrict NSC trust anchors, keep user CA distrust for production targets, and pin — understanding that pinning shifts the trust decision into the app.' }
    ],
    expectedFindings: [
      'Login/API requests visible in Burp HTTP history',
      'Credentials or session tokens observable in request bodies/headers',
      'The app accepts the interception proxy (no pinning or cleartext usage)'
    ],
    solution: [
      'Start Burp; add a proxy listener on port 8080 bound to all interfaces.',
      'Configure the emulator\u2019s Wi-Fi to use your host IP:8080 as proxy.',
      'Browse to http://burp in the emulator; download and install the CA certificate.',
      'If the target still fails TLS, move Burp\u2019s CA into the system store on a rooted emulator image (module m02-l05) or pick a target that trusts user CAs.',
      'Log into the app; watch HTTP history for the authentication request.',
      'Document the request: endpoint, headers, tokens, body — screenshot as evidence.',
      'Attempt a simple modification in Repeater (e.g. change a user id parameter) to demonstrate manipulation potential; verify the server response.',
      'Write the finding with MASVS-NETWORK mapping and remediation.'
    ],
    remediation: [
      'Enforce TLS-only via network security config; disable cleartext.',
      'Ensure production builds do not trust user CAs; test pinning deployment carefully.',
      'Treat the network as hostile: no credentials in URLs, no unauthenticated sensitive endpoints.'
    ],
    relatedLessons: ['m02-l04', 'm02-l05', 'm06-l03']
  },
  {
    id: 'lab-04',
    title: 'Analyze an Exported Content Provider',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'A training app exposes "notes" through a content provider. The developer says the notes are private. Providers are data APIs — let\u2019s see whether this one got the access-control memo.',
    target:
      'A training app with an exported content provider serving records (DIVA-style SQL injection providers are ideal).',
    objective:
      'Enumerate the app\u2019s providers, query the exported one from adb, and extract records (or demonstrate SQL injection against it).',
    tools: ['adb', 'JADX', 'drozer (optional)'],
    learningObjectives: [
      'Enumerate content providers and their authorities',
      'Query providers with adb content and interpret results',
      'Recognize injection-prone provider code patterns'
    ],
    hints: [
      'dumpsys package <pkg> lists providers with their authorities; the manifest shows exported + permission attributes.',
      'adb shell content query --uri content://<authority>/<path> reads rows directly.',
      'In JADX, check how the provider builds its SQL: string concatenation on selection args is the classic flaw.'
    ],
    questions: [
      { q: 'What data could you extract without any permission?', a: 'The full contents of the exposed table (records/notes/keys depending on target) — proof the provider lacks read protection.' },
      { q: 'How did the provider build its SQL, and why is that dangerous?', a: 'By concatenating caller-supplied selection/projection into the query — classic injection; a crafted selection can dump or modify arbitrary rows.' },
      { q: 'Which three fixes matter most?', a: 'exported=false or signature-level permission; parameterized queries (selection args); validating/whitelisting projection and paths (and path-traversal-safe openFile).' }
    ],
    expectedFindings: [
      'An exported provider reachable via content query with no permission prompt',
      'Sensitive rows returned to an unrelated caller',
      'Injection or path traversal possible depending on target design'
    ],
    solution: [
      'Enumerate: adb shell dumpsys package <pkg> | grep -A5 Providers, and read the manifest in JADX.',
      'Identify the authority and exported state; note any android:readPermission.',
      'Query: adb shell content query --uri content://<authority>/<table> — capture returned rows.',
      'If rows are returned without permission: finding (unauthorized read).',
      'For injection targets: craft a selection like "-- or 1=1" via content query arguments and observe dump behavior; keep payloads gentle.',
      'In JADX, read the provider\u2019s query()/openFile() to explain the root cause.',
      'Document: URI, extracted data type, root cause, remediation.'
    ],
    remediation: [
      'Declare android:exported="false" or guard with a signature-level permission.',
      'Use parameterized queries and validate projection/paths; never build SQL from caller input.',
      'Sanitize file paths in openFile() against traversal.'
    ],
    relatedLessons: ['m01-l04', 'm07-l03']
  },
  {
    id: 'lab-05',
    title: 'Analyze a Vulnerable Deep Link',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'Marketing wants "shareable links" in a training app. Security wants to know what happens when the link parameters are not what the app expects. Your job: craft a link that does something the UI would never allow.',
    target:
      'A training app with browsable intent-filters for a custom scheme or https host (many practice apps include a redeem/reset style link).',
    objective:
      'Discover the app\u2019s deep links from the manifest, identify one that performs a sensitive action from URL parameters, and trigger it externally (adb / browser URL) to demonstrate the flow.',
    tools: ['adb', 'JADX', 'aapt2 (optional)'],
    learningObjectives: [
      'Map deep link routes and their parameter handling',
      'Trace parameter consumption in the decompiled code',
      'Trigger deep links from outside the app and capture evidence'
    ],
    hints: [
      'Search the manifest for <data android:scheme=...> and category BROWSABLE — those routes open from a browser or adb.',
      'In JADX, follow the activity\u2019s handling of getIntent().getData() — query parameters usually map to extras.',
      'Trigger from adb: adb shell am start -a android.intent.action.VIEW -d "myscheme://route?param=value".'
    ],
    questions: [
      { q: 'Which link route was sensitive and what parameter drove it?', a: 'The route performing redemption/reset/profile actions (varies by target); a query parameter selected the action or target object without validation.' },
      { q: 'Why is a browser-triggered link dangerous even if the app requires login?', a: 'The link lands in an authenticated session: any web page can navigate the browser to the URL and drive the logged-in app\u2019s privileged flow (cross-app request forgery).' },
      { q: 'What does good deep link hygiene look like?', a: 'Explicit allow-lists of routes/params, confirmation steps for sensitive actions, App Links verification for https, and never accepting full URLs/intents as link parameters.' }
    ],
    expectedFindings: [
      'A browsable deep link performing a sensitive action from unvalidated parameters',
      'The flow executes without any in-app confirmation (evidence: screen/action triggered externally)',
      'Parameter handling allows unexpected values (IDs, URLs, intents)'
    ],
    solution: [
      'Extract the manifest: aapt2 dump xmltree app.apk or read it in jadx-gui; list every intent-filter with a scheme/host and BROWSABLE category.',
      'For each route, find the handling activity in JADX; note how URI query parameters are parsed and used.',
      'Pick the route that triggers a state-changing or revealing action.',
      'Craft and fire the link: adb shell am start -a android.intent.action.VIEW -d "<uri>".',
      'Screenshot the resulting behavior; repeat with unexpected parameter values to map validation gaps.',
      'If a parameter accepts a URL/intent, test the redirection pattern next (module m07-l02).',
      'Write the finding with reproduction steps and remediation.'
    ],
    remediation: [
      'Validate and allow-list every deep link route and parameter server-side before acting.',
      'Require user confirmation for sensitive actions regardless of entry point.',
      'Use App Links (verified https) instead of custom schemes for anything security-relevant; never pass URLs/intents as parameters.'
    ],
    relatedLessons: ['m04-l06', 'm07-l02']
  },
  {
    id: 'lab-06',
    title: 'Insecure WebView Configuration',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'A training app renders part of its UI in a WebView. The question is not whether WebViews are "bad" — it is whether this one hands script or files more power than the app intends.',
    target:
      'A training app with a WebView-based screen (DIVA/webview-style practice apps).',
    objective:
      'Identify the WebView\u2019s configuration in decompiled code, determine which settings create script/file access risk, and demonstrate the impact using the app\u2019s own inputs (e.g. a URL or HTML it loads).',
    tools: ['JADX', 'adb', 'Emulator'],
    learningObjectives: [
      'Audit WebView settings against a known checklist',
      'Understand addJavascriptInterface exposure',
      'Chain WebView config with input sources into a risk statement'
    ],
    hints: [
      'grep the decompiled sources for setJavaScriptEnabled, addJavascriptInterface, setAllowFileAccess, setAllowFileAccessFromFileURLs, setMixedContentMode.',
      'Find where the WebView loads content: loadUrl(...) — is the URL user-controllable (deep link, extra, server response)?',
      'If the app loads file:// URLs with JavaScript enabled, file access settings become the vulnerability; if it loads remote URLs, the bridge is the risk.'
    ],
    questions: [
      { q: 'Which risky settings were enabled?', a: 'Typically setJavaScriptEnabled(true) plus addJavascriptInterface(...) and/or file access flags — the exact combination depends on the target.' },
      { q: 'What input controls what the WebView loads?', a: 'A URL/HTML string from an intent extra, deep link, or server response — attacker-influenced in at least one scenario.' },
      { q: 'Describe the full risk chain in one sentence.', a: 'An attacker-supplied URL/script runs inside the app\u2019s WebView and, via the JS bridge or file access, reads app data or invokes app methods.' }
    ],
    expectedFindings: [
      'JavaScript enabled with a JS bridge object exposing app/native methods',
      'File access from file URLs permitted (or mixed content allowed)',
      'A reachable input path (link/extra) that controls the loaded content'
    ],
    solution: [
      'Decompile with JADX and grep for WebView settings (see hint 1); screenshot the configuration block.',
      'Locate loadUrl calls and trace the source of the URL argument back to its input (extra, deep link, API).',
      'Classify the risk: remote-content + bridge vs file-content + JS.',
      'Demonstrate: craft the input that loads attacker-chosen content (e.g. a deep link with a URL parameter pointing at your local page) and observe the WebView rendering it.',
      'If a JS bridge exists, list its @JavascriptInterface methods from JADX — those are the callable privileged operations.',
      'Document settings, input path, callable bridge methods, and remediation.'
    ],
    remediation: [
      'Disable JavaScript unless required; never expose privileged objects via addJavascriptInterface without strict validation.',
      'Disable file access from file URLs; load only allow-listed https origins; block mixed content.',
      'Restrict what can be loaded: validate URLs against an allow-list before loadUrl.'
    ],
    relatedLessons: ['m04-l06', 'm04-l02']
  },
  {
    id: 'lab-07',
    title: 'Find an Authorization Flaw',
    difficulty: 'Advanced',
    points: 200,
    scenario:
      'Two test accounts, one training backend. Alice should only see Alice\u2019s data. The app works perfectly for Alice — that was never the question. The question is what the server does when Alice asks for Bob\u2019s data.',
    target:
      'A training app + backend with object references in API requests (practice environments like crAPI-like setups, or any local API mock you control).',
    objective:
      'Intercept an object-bearing API request, replay it as a different user (or with a modified identifier), and demonstrate that object-level authorization is missing — a server-side finding discovered through the mobile client.',
    tools: ['Burp Suite', 'Two test accounts', 'adb (for setup)'],
    learningObjectives: [
      'Set up two-account testing on a mobile target',
      'Identify object identifiers and trust boundaries in API traffic',
      'Document server-side authorization flaws properly (impact beyond the app)'
    ],
    hints: [
      'Capture a request that returns user-specific data; note the identifier in path, body or header.',
      'Log in as the second account, capture its token, then replay the first request with the second account\u2019s token and the first account\u2019s object id.',
      'A 200 response containing the other user\u2019s data is the vulnerability — not a UI bug, a server bug.'
    ],
    questions: [
      { q: 'Which endpoint lacked object-level authorization?', a: 'The endpoint serving user-owned objects (profile/order/document) that returned records purely based on the supplied id.' },
      { q: 'Why is this a server-side finding even though you found it via the app?', a: 'The app is just one client; the API must enforce ownership for any client. Fixing the APK changes nothing — the fix belongs in server authorization middleware.' },
      { q: 'What evidence makes this reportable?', a: 'Two accounts, two tokens, request/response pairs showing account B receiving account A\u2019s object, plus impact statement.' }
    ],
    expectedFindings: [
      'API returns another user\u2019s object when identifiers are swapped',
      'No ownership check distinguishable in responses or error behavior',
      'Sensitive data exposure across accounts (data breach impact)'
    ],
    solution: [
      'Set up interception (lab-03) and log in as user A; capture every request that references an object id.',
      'Log in as user B; capture B\u2019s session token.',
      'In Repeater, replay A\u2019s object request with B\u2019s token (replace the auth header/token, keep A\u2019s object id).',
      'Observe the response: B receives A\u2019s object → broken object-level authorization.',
      'Also test horizontal parameter tampering (increment ids) where object ids are sequential.',
      'Document with request/response evidence, scope statement (server-side), and remediation (object ownership checks, non-guessable ids as defense-in-depth only).'
    ],
    remediation: [
      'Enforce object-level authorization on every request that touches user-owned data (server-side).',
      'Use randomized identifiers as defense-in-depth, never as the access control.',
      'Log and alert on cross-account access patterns.'
    ],
    relatedLessons: ['m10-l04', 'm08-l04', 'm06-l03']
  },
  {
    id: 'lab-08',
    title: 'Trace a Sensitive Function with Frida',
    difficulty: 'Advanced',
    points: 250,
    scenario:
      'An UnCrackable-style training app refuses to run its secret-checking logic because it "detects" something about the environment. Static reading tells you a check exists — runtime tracing tells you exactly what it compares. Understand first, then verify.',
    target:
      'OWASP MASTG UnCrackable-Level1 (or equivalent crackme with a runtime check) on a rooted/rootable emulator with frida-server running.',
    objective:
      'Use Frida to hook the app\u2019s verification method, observe the arguments/return values during execution, and use that understanding to make the check succeed — then explain what static analysis missed.',
    tools: ['Frida', 'frida-server', 'JADX', 'adb'],
    learningObjectives: [
      'Attach Frida to a target and hook a specific Java method',
      'Read method arguments/return values at runtime',
      'Combine static understanding with runtime verification responsibly'
    ],
    hints: [
      'In JADX, find the method that validates input (search for strings the app compares against or the "wrong" toast).',
      'Hook it: Java.use(...).method.implementation = function(a){ console.log(a); return this.method(a); } — observe before you modify.',
      'Once you understand the comparison, decide whether returning a modified value is justified in YOUR test scope — and write down what the app should have done instead.'
    ],
    questions: [
      { q: 'What did the hooked method receive and return at runtime?', a: 'The user\u2019s input (or derived value) and a boolean/result from the comparison logic — exact types depend on the crackme.' },
      { q: 'Why is runtime observation stronger than reading the decompiled code?', a: 'It confirms the actual executed path, values constructed at runtime, obfuscated comparisons resolved, and behavior static analysis can only guess.' },
      { q: 'What is the difference between understanding a check and bypassing it — ethically?', a: 'Understanding documents the control\u2019s strength (a legitimate assessment outcome); bypassing is only performed within authorized scope to demonstrate impact. Both must be reported, never weaponized outside scope.' }
    ],
    expectedFindings: [
      'Frida trace showing the exact method called with runtime arguments',
      'A confirmed understanding of the check\u2019s logic (e.g. string comparison/encryption)',
      'A written assessment of whether the check meaningfully raises attacker cost'
    ],
    solution: [
      'Prepare the environment: emulator with frida-server running (module m12-l01), adb forward if needed.',
      'Decompile the crackme in JADX; locate the validation method (grep the secret-checking class).',
      'Write a hook script: Java.perform → Java.use(<class>) → override <method> to log arguments and return value, then call the original.',
      'frida -U -f <pkg> -l hook.js; enter any input in the app; read the logged values.',
      'Refine: hook the comparison helper if the first hook only shows the entry point.',
      'Document: what the check does, how effective it is (resilience assessment), and the authorized demonstration outcome.',
      'Clean up: kill the spawned process, remove any modified artifacts.'
    ],
    remediation: [
      'Client-side checks cannot stop a determined analyst — treat them as friction, not security.',
      'Move secret validation server-side; never ship the answer in any form.',
      'If resilience matters, layer defenses (integrity, attestation) and validate their cost honestly.'
    ],
    relatedLessons: ['m12-l02', 'm05-l04', 'm13-l02']
  }
];
