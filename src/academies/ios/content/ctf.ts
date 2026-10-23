import type { CTFChallenge } from '../../../types';

// iOS Application Pentesting Academy — CTF challenges.
// All flags are computed against the LOCAL training app artifacts in your lab
// (fictional TargetLab app / MASTestApp-class targets). Flags are lab-local by
// design: they verify YOUR analysis of YOUR copy, never a remote system.

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'c1',
    code: 'IOS-001',
    title: 'Payload Inspection',
    category: 'IPA Recon',
    difficulty: 'Beginner',
    points: 50,
    objective:
      'Extract the training IPA and locate the main executable. The flag is the executable\u2019s file(1) type string, wrapped in the lab flag format: FLAG{<the exact file-output description>}.',
    target: 'TargetLab.ipa (training IPA in your lab folder)',
    hints: [
      'unzip first; Payload/ holds exactly one .app directory.',
      'file(1) on the Mach-O prints the full description — spaces included.',
      'The flag wrapper is FLAG{...} — everything inside the braces is the file output.'
    ],
    flag: 'FLAG{Mach-O 64-bit executable arm64}',
    writeup: [
      'unzip -q TargetLab.ipa -d work/ extracts the archive.',
      'file work/Payload/TargetLab.app/TargetLab prints the Mach-O description.',
      'The full description (Mach-O 64-bit executable arm64) is the flag content — module i09-l01\u2019s first command, as a flag.'
    ],
    relatedLessons: ['i04-l01', 'i09-l01']
  },
  {
    id: 'c2',
    code: 'IOS-002',
    title: 'Plist Whispers',
    category: 'Info.plist',
    difficulty: 'Beginner',
    points: 50,
    objective:
      'Decode the training app\u2019s Info.plist. Somewhere among the metadata the developers left a key named SecretSauce. The flag is its value, wrapped: FLAG{<value>}.',
    target: 'TargetLab.app/Info.plist',
    hints: [
      'plutil -p decodes binary plists on macOS; Python plistlib works anywhere.',
      'Grep the decoded output for the key name.',
      'The value is a string — the whole string, inside the wrapper.'
    ],
    flag: 'FLAG{grandmas-recipe-2024}',
    writeup: [
      'plutil -p Payload/TargetLab.app/Info.plist | grep -i secret',
      'The key SecretSauce carries the training value grandmas-recipe-2024.',
      'Lesson: debug/leftover keys in plists are classic static findings (module i04-l02\u2019s sweep) — this flag is that lesson, gamified.'
    ],
    relatedLessons: ['i04-l02', 'i08-l03']
  },
  {
    id: 'c3',
    code: 'IOS-003',
    title: 'Entitlement X-Ray',
    category: 'Entitlements',
    difficulty: 'Beginner',
    points: 75,
    objective:
      'Dump the training app\u2019s entitlements and find the custom entitlement the developers (fictionally) abused for a private API. The flag is the entitlement key after the com.apple. prefix, wrapped: FLAG{<key>}.',
    target: 'TargetLab.app main binary',
    hints: [
      'codesign -d --entitlements :- <binary> dumps the plist.',
      'Look for an entitlement that should never appear in a store build — the com.apple.private. family.',
      'The flag is the key\u2019s tail after com.apple. (e.g. com.apple.private.foo → foo).'
    ],
    flag: 'FLAG{private.platform.limited-ui}',
    writeup: [
      'codesign -d --entitlements :- Payload/TargetLab.app/TargetLab reveals com.apple.private.platform.limited-ui.',
      'Private entitlements on non-Apple binaries are the provenance red flag from module i06-l03 — resolve provenance before testing; here, the training app plants it for the flag.',
      'The flag: everything after com.apple. — private.platform.limited-ui.'
    ],
    relatedLessons: ['i06-l01', 'i06-l03']
  },
  {
    id: 'c4',
    code: 'IOS-004',
    title: 'Strings Attached',
    category: 'Secrets',
    difficulty: 'Intermediate',
    points: 100,
    objective:
      'Run the strings sweep over the training binary. One base64-shaped string decodes to the flag (already in FLAG{...} form).',
    target: 'TargetLab main binary',
    hints: [
      'strings -a -arch all <binary> | grep -E "[A-Za-z0-9+/]{20,}={0,2}" finds candidates.',
      'Decode each candidate (base64 -d). One of them is readable text.',
      'The readable one IS the flag — no wrapping needed.'
    ],
    flag: 'FLAG{strings_sweep_never_disappoints}',
    writeup: [
      'The strings sweep (module i08-l02) surfaces a base64 blob; base64 -d yields the flag directly.',
      'Method note: decode before classifying (module i08-l03\u2019s rule) — the decode step is the whole challenge.'
    ],
    relatedLessons: ['i08-l02', 'i08-l03']
  },
  {
    id: 'c5',
    code: 'IOS-005',
    title: 'Keychain Ghosts',
    category: 'Keychain',
    difficulty: 'Intermediate',
    points: 100,
    objective:
      'Run the SecItem observation session (module i11-l04 scripts) against the training app\u2019s login flow. The app writes a decoy keychain item whose service name encodes the flag: FLAG{<service-name>}.',
    target: 'Training app on a hookable build (dev/gadget); Frida with the SecItem hooks',
    hints: [
      'Hook SecItemAdd and log the query dictionary — the service name is in kSecAttrService.',
      'Trigger the login flow (the decoy writes on the second login attempt).',
      'The service name is readable text in FLAG{...} form — no decoding.'
    ],
    flag: 'FLAG{secitem_decoy_2024}',
    writeup: [
      'The SecItemAdd hook logs the query; on the second login the decoy item writes with kSecAttrService = FLAG{secitem_decoy_2024}.',
      'Method: system-boundary hooks observe every keychain write regardless of app wrappers (module i13-l03) — the decoy is that lesson\u2019s flag.'
    ],
    relatedLessons: ['i11-l04', 'i13-l03', 'i05-l02']
  },
  {
    id: 'c6',
    code: 'IOS-006',
    title: 'Token Teardown',
    category: 'Network',
    difficulty: 'Intermediate',
    points: 125,
    objective:
      'Capture the training app\u2019s login traffic through your proxy. The login response carries a JWT whose payload contains a custom claim, labsalt. The flag is the claim\u2019s value, wrapped: FLAG{<value>}.',
    target: 'Training app + its training backend through the module i07 proxy setup',
    hints: [
      'Capture the login response; the token is in the JSON.',
      'JWTs decode in three parts: header.payload.signature — the payload is middle, base64url.',
      'Find the labsalt claim in the decoded payload.'
    ],
    flag: 'FLAG{capture_then_decode}',
    writeup: [
      'The proxy captures the login response; the JWT\u2019s payload (base64url-decoded) carries labsalt: capture_then_decode.',
      'Method: token anatomy is decoding discipline (module i14-l04) — the challenge is the decode habit, gamified.'
    ],
    relatedLessons: ['i14-l02', 'i14-l04', 'i07-l03']
  },
  {
    id: 'c7',
    code: 'IOS-007',
    title: 'Router Runner',
    category: 'Deep Links',
    difficulty: 'Intermediate',
    points: 125,
    objective:
      'The training app\u2019s deep link router supports an undocumented action. Extract the router\u2019s action vocabulary (decompilation), invoke the action that returns a confirmation code, and wrap it: FLAG{<code>}. The confirmation appears in the app\u2019s logs.',
    target: 'Training app on simulator/device; simctl openurl; log channel',
    hints: [
      'Decompile DeepLinkRouter.route (module i09-l03); the action switch lists every accepted name.',
      'One action name is undocumented in UI (debug/admin-shaped). Craft targetlab://action?name=<it>.',
      'The confirmation code prints to the app\u2019s log channel — watch it while invoking.'
    ],
    flag: 'FLAG{route_7f3a_confirm}',
    writeup: [
      'The decompiled switch reveals the hidden action name (devtestConfirm); invoking it logs the confirmation code.',
      'Method: the parameter vocabulary comes from the binary, not guesses (module i16-l01\u2019s extract-then-craft) — the flag rewards the extraction.'
    ],
    relatedLessons: ['i16-l01', 'i09-l03', 'i03-l04']
  },
  {
    id: 'c8',
    code: 'IOS-008',
    title: 'Bridge over Troubled Water',
    category: 'WebViews',
    difficulty: 'Advanced',
    points: 150,
    objective:
      'Chain it all: deep link → WebView navigation bypass → the authBridge handler\u2019s echo action. The echo action reflects a challenge token to your test page; the flag is that challenge value, wrapped: FLAG{<challenge>}. Serve your page locally, load it via the bypass, and read the reflected value from your page\u2019s console.',
    target: 'Training app + local HTTP server for your test page; full lab L6 chain',
    hints: [
      'The navigation allowlist is substring-based (module i17-l01\u2019s bypass) — your host embeds the target string.',
      'The bridge echo action is window.webkit.messageHandlers.authBridge.postMessage({action:"echo"}) — the response lands in your page via the callback.',
      'Your page\u2019s console (Safari Web Inspector against the simulator, or remote debugging) shows the reflected value.'
    ],
    flag: 'FLAG{bridge_echo_9d2c}',
    writeup: [
      'The full chain: targetlab://web?url=https://<your-host>/targetlab.com/page.html (substring bypass) → page loads in the app WebView → authBridge.echo reflects challenge bridge_echo_9d2c into your page.',
      'Method: the five-link chain (module i17-l02\u2019s narrative) — each link artifacted in lab L6; the flag is the chain\u2019s final link, gamified.'
    ],
    relatedLessons: ['i17-l01', 'i17-l02', 'i16-l01']
  }
];
