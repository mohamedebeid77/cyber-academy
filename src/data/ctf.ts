import type { CTFChallenge } from '../types';

// CTF challenges verified locally. Flags are literal strings — the platform
// compares them locally, no network involved. Targets are local training apps.

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'ctf-01',
    code: 'ANDROID-001',
    title: 'Leaky Storage',
    category: 'Storage',
    difficulty: 'Beginner',
    points: 50,
    objective: 'Find the secret the app "conveniently" saved on your behalf — in the place it should never have used.',
    target:
      'Any local training app that persists data in SharedPreferences (DIVA-style apps or your own practice build). Log in or trigger the feature that saves the secret.',
    hints: [
      'The app keeps user data somewhere under /data/data/<package>/.',
      'On a debuggable build you do not even need root: adb shell run-as <package> ls shared_prefs/',
      'cat the XML file you find there. Flags like XML make poor vaults.'
    ],
    flag: 'FLAG{prefs_are_not_vaults}',
    writeup: [
      'Install and run the training app; trigger whatever feature stores data (login, save settings).',
      'Locate the app\u2019s private dir: adb shell run-as <pkg> ls -la shared_prefs/ (or adb root on an emulator).',
      'Read the file: adb shell run-as <pkg> cat shared_prefs/user.xml',
      'Observe the flag stored as a plaintext <string> entry — SharedPreferences is unencrypted XML.',
      'Understanding: the app sandbox protects the file from other apps, but not from the device owner, backups, or debuggable access. Secrets belong in Keystore-encrypted storage or server-side sessions.',
      'Remediation: AndroidKeyStore-backed encryption (EncryptedSharedPreferences), allowBackup=false, no secrets in prefs.'
    ],
    relatedLessons: ['m01-l07', 'm08-l01', 'm05-l02']
  },
  {
    id: 'ctf-02',
    code: 'ANDROID-002',
    title: 'The Door That Never Closed',
    category: 'Platform',
    difficulty: 'Beginner',
    points: 50,
    objective: 'The flag screen has no button anywhere in the UI. Reach it anyway — you know the component model now.',
    target:
      'A training app with an exported activity that reveals a secret (DIVA-style "hidden" screens). Check the manifest.',
    hints: [
      'List the app\u2019s activities: adb shell dumpsys package <pkg> — exported ones are public API.',
      'Read the exported activity\u2019s code in JADX: what extra does it expect (getIntent().getStringExtra(...))?',
      'adb shell am start -n <pkg>/<activity> --es key "value" — you are the caller now.'
    ],
    flag: 'FLAG{exported_and_pwned}',
    writeup: [
      'Enumerate activities via dumpsys package or the manifest in jadx-gui; identify the exported one with a juicy name.',
      'Read its onCreate in JADX to learn the expected extras.',
      'Start it directly: adb shell am start -n <pkg>/<activity> --es <key> <value>.',
      'The flag renders with no authentication — the component trusted whoever called it.',
      'Understanding: exported components are entry points outside the app\u2019s navigation; access control must live inside the component (and server-side), not in the UI flow.',
      'Remediation: exported=false, signature-level permissions, internal validation of callers and extras.'
    ],
    relatedLessons: ['m01-l04', 'm07-l01', 'm04-l05']
  },
  {
    id: 'ctf-03',
    code: 'ANDROID-003',
    title: 'Logcat Confessions',
    category: 'Storage',
    difficulty: 'Beginner',
    points: 75,
    objective: 'The app wrote down its secret where everyone can read. Listen.',
    target:
      'A training app that logs sensitive data (many practice apps log the flag on an event). Any emulator works — logcat is a system service.',
    hints: [
      'Clear the buffer first so your evidence is clean: adb logcat -c',
      'Exercise the app (login, buttons, settings) while the log runs in a terminal.',
      'adb logcat -d | grep -iE "flag|secret|token" — apps confess constantly.'
    ],
    flag: 'FLAG{l0gc4t_l3aks_s3cr3ts}',
    writeup: [
      'Start a log capture: adb logcat -v time > log.txt (or scope by --pid).',
      'Exercise every feature of the training app.',
      'Search the capture for the flag: grep -i flag log.txt.',
      'The app logged the secret with Log.d/Log.i — visible to adb and, on older Android versions, to other apps.',
      'Understanding: logging is a data store. Anything logged must be treated as public.',
      'Remediation: never log credentials/PII/tokens; strip logs in release builds (R8 removes Log calls with proper rules); scrub crash reporting.'
    ],
    relatedLessons: ['m01-l08', 'm08-l01', 'm05-l01']
  },
  {
    id: 'ctf-04',
    code: 'ANDROID-004',
    title: 'The Talkative Provider',
    category: 'Platform',
    difficulty: 'Intermediate',
    points: 100,
    objective: 'There is a database behind a URI, and the door has no lock. Ask it politely.',
    target:
      'A training app with an exported content provider (DIVA-style SQLi providers are perfect).',
    hints: [
      'Find the authorities: adb shell dumpsys package <pkg> | grep -A5 "ContentProvider".',
      'Query directly: adb shell content query --uri content://<authority>/<path>',
      'If the provider builds SQL from your input, a carefully crafted selection returns rows it should not.'
    ],
    flag: 'FLAG{c0nt3nt_pr0v1d3r_l34k}',
    writeup: [
      'Enumerate providers and their exported state from the manifest/dumpsys.',
      'adb shell content query --uri content://<authority>/keys — the table returns its contents with no permission.',
      'Locate the flag row (or use a mild injection in the selection to dump it).',
      'Read the provider\u2019s query() in JADX: string-built SQL, no permission check.',
      'Understanding: providers are data APIs; exported ones without permission/parameterization are remote data leaks.',
      'Remediation: exported=false or signature permission, selection args, projection whitelists, path traversal protection in openFile().'
    ],
    relatedLessons: ['m07-l03', 'm01-l04']
  },
  {
    id: 'ctf-05',
    code: 'ANDROID-005',
    title: 'Link In Bio',
    category: 'Platform',
    difficulty: 'Intermediate',
    points: 100,
    objective: 'The app responds to URLs. Send it one it cannot refuse.',
    target:
      'A training app with a browsable deep link that reveals or grants something when the right parameter is supplied.',
    hints: [
      'The manifest\u2019s <data> tags under intent-filters are the route table: schemes and hosts.',
      'Read the handling activity in JADX: which query parameter does it act on?',
      'adb shell am start -a android.intent.action.VIEW -d "scheme://host/path?param=value" fires the link from outside.'
    ],
    flag: 'FLAG{d33p_l1nk_h1j4ck}',
    writeup: [
      'Map deep link routes from the manifest (aapt2 dump xmltree or JADX).',
      'Trace parameter handling in the target activity — one parameter drives the sensitive behavior.',
      'Fire the crafted URL via adb (or a local HTML page linking to it).',
      'The app reveals the flag / performs the privileged action — no in-app navigation required.',
      'Understanding: deep links are untrusted input from the browser. Any authenticated flow they can trigger is cross-app request forgery.',
      'Remediation: validate/allow-list routes and parameters, confirm sensitive actions in-app, prefer verified App Links.'
    ],
    relatedLessons: ['m07-l02', 'm04-l06']
  },
  {
    id: 'ctf-06',
    code: 'ANDROID-006',
    title: 'Cipher Classics',
    category: 'Crypto',
    difficulty: 'Intermediate',
    points: 125,
    objective: 'The app encrypts its secret. Unfortunately it also ships the key, the mode and the answer-checking logic — in the same APK.',
    target:
      'A training app that encrypts a secret with a weak/statically-keyed cipher (ECB/DES/hardcoded key practice apps).',
    hints: [
      'In JADX, hunt for javax.crypto usage: Cipher.getInstance("...") tells you the transformation — ECB jumps out.',
      'Static keys usually sit one line away: SecretKeySpec("some string".getBytes(), "AES").',
      'Decrypt offline with the same transformation in a small script — or read what the comparison logic expects.'
    ],
    flag: 'FLAG{ecb_is_not_encryption}',
    writeup: [
      'Locate the crypto code in JADX: Cipher.getInstance exposes the transformation (AES/ECB/PKCS5Padding here).',
      'Extract the hardcoded key/IV from the constants or resources.',
      'Reproduce the decryption offline (Python/Java) using the same parameters.',
      'The decrypted value is the flag — the "encryption" protected nothing once the key shipped in the APK.',
      'Understanding: client-side crypto with static keys is obfuscation. ECB leaks structure; DES/MD5 are broken primitives.',
      'Remediation: server-side secrets, Keystore-held keys, authenticated encryption (AES-GCM), proper password hashing (Argon2/bcrypt) where applicable.'
    ],
    relatedLessons: ['m08-l02', 'm04-l07']
  },
  {
    id: 'ctf-07',
    code: 'ANDROID-007',
    title: "Trust Me, I'm Local",
    category: 'RE / Instrumentation',
    difficulty: 'Advanced',
    points: 150,
    objective:
      'The app gates its content behind a local check. Watch the check run, understand what it compares, and demonstrate that the gate is local — on your authorized training target.',
    target:
      'OWASP MASTG UnCrackable-style crackme (local auth/root check) on a rooted emulator with frida-server.',
    hints: [
      'JADX first: find the method that decides success/failure (the "wrong" path tells you where the decision lives).',
      'Hook it with Frida: log arguments and return value while the app runs — understand before changing.',
      'Once understood, a return-value modification demonstrates the gate is client-side. Document what that means about the control, not just the win.'
    ],
    flag: 'FLAG{n0_c0de_1s_s4f3}',
    writeup: [
      'Spawn the app under Frida: frida -U -f <pkg> -l hook.js.',
      'Hook the verification method: log the runtime arguments (the comparison inputs) and the original return value.',
      'Understanding step: reconstruct the check\u2019s logic from the observed values.',
      'Verification step: override the return value in your script and observe the app accept it.',
      'The flag screen releases its secret — proof the gate lived entirely on the device.',
      'Understanding: local checks are friction, not security. Real authorization must be server-side; client resilience raises cost but never removes trust from the server\u2019s hands.',
      'Remediation: server-side validation of anything valuable; resilience controls (if used) measured honestly against attacker effort.'
    ],
    relatedLessons: ['m12-l02', 'm05-l06', 'm08-l03']
  },
  {
    id: 'ctf-08',
    code: 'ANDROID-008',
    title: 'The Pinned Butterfly',
    category: 'Network',
    difficulty: 'Advanced',
    points: 200,
    objective:
      'The training app pins its server certificate — by design your proxy is blind. On your authorized target, evaluate the pinning control: recognize it, understand where it lives, and observe what it actually protects.',
    target:
      'A training app with certificate pinning (MASTG practice apps with pinning examples) plus Burp and a rooted emulator.',
    hints: [
      'Set up interception (m06-l03). If TLS fails with a "handshake" error while the browser works, you have found pinning.',
      'Find it statically: grep for CertificatePinner, pin-set in the NSC XML, or custom TrustManager code in JADX.',
      'With your instructor hat on: enumerate what pinning protects (which hosts/paths) and what it does not (other hosts, cleartext, non-TLS traffic).'
    ],
    flag: 'FLAG{pins_are_suggestions}',
    writeup: [
      'Confirm the control: proxy the app; note the TLS failure signature that differs from plain misconfiguration.',
      'Locate the pin statically (OkHttp CertificatePinner / NSC pin-set / TrustManager) and read exactly which hosts and keys are pinned.',
      'Assess coverage: pinned host(s) vs everything else the app talks to.',
      'On your authorized target, observe (via your instrumentation of the app itself) that the decision to reject is client-side — the same class of trust decision explored in module m12.',
      'Understanding: pinning raises interception cost meaningfully, but it is a client-side trust decision; its value depends on coverage, rotation strategy and fallback behavior.',
      'Remediation: pin conservatively (backup keys!), never pin in ways that break rotation, and combine with server-side anomaly detection.'
    ],
    relatedLessons: ['m06-l04', 'm06-l03', 'm12-l02']
  }
];
