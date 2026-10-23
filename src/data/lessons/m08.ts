import type { Module } from '../../types';

// LEVEL 6 — DATA & AUTH · Module 08: Data, Crypto & Authentication Vulnerabilities
// Original curriculum content synthesized from public official documentation:
// developer.android.com, OWASP MASTG, and OWASP Cheat Sheet Series. All prose
// is original; reference links point to the official sources used for study.
// All hands-on examples target intentionally vulnerable local training apps
// (MASTG crackmes, DIVA) and local training backends.

export const m08: Module = {
  id: 'm08',
  title: 'Data, Crypto & Authentication Vulnerabilities',
  level: 6,
  description:
    'What apps do with secrets: where data rests, how it is encrypted (and how that fails), how local authentication and biometrics can be bypassed or done properly, how authorization decisions go wrong when the client is trusted, and how session tokens leak or outlive their users. The audit-checklist module: every lesson ends with concrete on-device verification steps.',
  outcomes: [
    'Run a complete data-at-rest audit across every storage location, including logs, backups, and caches',
    'Identify and confirm weak cryptography from decompiled code and dynamic evidence',
    'Test local authentication gates and evaluate BiometricPrompt + CryptoObject implementations',
    'Assess authorization boundaries and session/token lifecycle handling end to end'
  ],
  lessons: [
    {
      id: 'm08-l01',
      moduleId: 'm08',
      title: 'Insecure Data Storage',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m05-l02', 'm01-l07'],
      objectives: [
        'Audit every storage location an app can write, with a fixed sweep order',
        'Verify findings on-device with run-as, sqlite3, logcat, and screencap',
        'Cover the peripheral channels: logs, backups, keyboard/autofill, screenshots, clipboard, crash reports',
        'Recommend layered remediation: minimization, Keystore-backed encryption, UI hardening'
      ],
      diagram: 'masvs-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Data storage findings are the bread and butter of mobile assessments because the failure pattern is uniform: a secret ends up somewhere with a wider audience than intended — plaintext prefs on a rooted device, a token in the system log, a database on external storage, a backup sweeping files to the cloud. Module 01 mapped the storage areas and module 05 gave you the runtime-inspection tools; this lesson is the audit checklist that combines them into a repeatable sweep.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The full checklist'
          },
          {
            type: 'table',
            headers: ['Location', 'Typical leak', 'How to verify on device'],
            rows: [
              ['SharedPreferences', 'Tokens, PINs, flags in plaintext XML', 'run-as cat shared_prefs/*.xml'],
              ['SQLite / Room', 'Unencrypted records; secrets in columns', 'run-as sqlite3 databases/*.db, then .tables and SELECT'],
              ['Internal / external files', 'Exports, debug dumps, cached documents', 'run-as find; check getExternalStorage directories'],
              ['System log (logcat)', 'Credentials, tokens, SQL in debug prints', 'adb logcat during login/logout flows'],
              ['Backups (cloud / transfer)', 'Everything allowBackup includes', 'Backup-rules review plus bmgr/transfer test (m07-l06)'],
              ['Keyboard / autofill', 'Remembered sensitive input', 'Type secrets into default-inputType fields; inspect suggestions'],
              ['Screenshots / recents', 'Sensitive screens captured in the overview', 'Open the sensitive screen, check recents, screencap'],
              ['Clipboard', 'Copied tokens and OTPs', 'Copy within the app; read from a focused test app'],
              ['Crash reports / analytics', 'Stack traces and breadcrumbs containing data', 'Trigger a crash on a training app; inspect the report'],
              ['WebView cache / cookies', 'Session cookies, rendered HTML on disk', 'run-as inspect app_webview/ and cache/ directories']
            ]
          },
          {
            type: 'h',
            text: 'The remediation landscape'
          },
          {
            type: 'p',
            text:
              'Correct fixes are layered. First, minimize: keep secrets out of storage entirely (in-memory, or not on the device at all). Second, encrypt what must be stored, with keys generated inside the Android Keystore — non-exportable, optionally user-authentication-bound — rather than keys co-located with the data. Third, harden the UI surfaces: FLAG_SECURE on sensitive screens, appropriate inputType and autofill flags, and no sensitive values in release logging. Encrypted preferences/files libraries can help, but check their current maintenance status and prefer direct Keystore integration for key management.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This checklist maps directly to the MASVS storage domain (see the diagram) and to the MASTG data-storage chapter. It is also the highest-yield manual test in most engagements: no special tooling, pure method. Pair each on-device observation with a remediation and a threat-model sentence (rooted device? lost device? other apps?) so severity is defensible rather than vibes-based.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'putString("token", ...) and friends in prefs code without any encryption layer',
              'MODE_WORLD_READABLE / MODE_WORLD_WRITEABLE (legacy, throws on modern APIs) and files written to external storage',
              'Databases opened without an encryption layer; sensitive tables in plain SQLite',
              'Log.d/Log.i calls with credentials, tokens, or request bodies; crash reporters configured with sensitive breadcrumbs',
              'FLAG_SECURE missing on sensitive screens; secrets copied to the clipboard; PIN fields without restricted inputType'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Root/debug access is still scope-bound',
            text:
              'The sweep reads another app\u2019s private data. It is legitimate only on training apps and in-scope targets on devices you own or are authorized to test.'
          },
          {
            type: 'terminal',
            title: 'The 10-minute storage sweep (debuggable or rooted training target)',
            lines: [
              '$ adb shell run-as com.example.trainingapp find files shared_prefs databases cache -type f',
              '$ adb shell run-as com.example.trainingapp cat shared_prefs/user.xml',
              '$ adb shell run-as com.example.trainingapp sqlite3 databases/app.db ".tables"',
              '$ adb shell run-as com.example.trainingapp sqlite3 databases/app.db "SELECT * FROM tokens;"',
              '$ adb logcat -d | grep -iE "token|password|session|bearer"',
              '$ adb shell screencap -p /sdcard/shot.png   # captured while the sensitive screen is open'
            ]
          },
          {
            type: 'p',
            text:
              'Run the sweep twice: once after login and once after logout. The logout pass is where sessions prove incomplete (m08-l05) and where cached files refuse to die. Pull anything suspicious for the evidence appendix, and time-stamp artifacts so findings stay reproducible.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On a DIVA-style training app the notes feature writes plaintext to SQLite and the insecure-logging screen prints credentials to logcat; on MASTG crackmes prefs often hold the challenge secret. One sweep typically produces several distinct findings (plaintext database, sensitive logging, screenshot retention) — report them separately with separate remediations, not as one blob.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Sweep discipline',
            text:
              'Same order every time: prefs, databases, files, external storage, logs, backups, then UI surfaces (screenshot, clipboard, keyboard). A fixed order makes findings comparable across apps and engagements.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['adb run-as / root shell', 'Read the app\u2019s private directories'],
              ['sqlite3', 'Query databases on device or after pulling'],
              ['objection storage commands', 'Quick structured dump of prefs, files, and databases'],
              ['MobSF', 'Static pre-flagging of risky storage APIs'],
              ['JADX', 'Locate the code that wrote each file']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Checking only the obvious directories and skipping logs, backups, and crash reports — the widest-audience leaks',
              'Downgrading plaintext-in-sandbox findings to "low" without a threat model; on rooted/lost-device scenarios they are not low',
              'Assuring yourself a database is "encrypted" without opening it — verify by actually querying',
              'Forgetting logout: storage that persists after logout is a separate finding from storage at rest'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Full run on one training app: perform the complete checklist top to bottom, capture evidence, and write a one-row-per-location summary table (location, what was stored, who can read it, severity rationale). Compare your table with the MASTG storage tests to see which ones you just executed manually.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Audit every storage location with a fixed sweep order — method beats memory',
              'The sandbox protects against other apps, not against rooted devices, backups, logs, or the user\u2019s own screenshots',
              'Remediation is layered: minimize storage, encrypt with Keystore-backed keys, harden UI surfaces',
              'Each location gets its own finding with its own audience and severity argument'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm08-l01-q1',
          type: 'mcq',
          prompt: 'Which storage area most often leaks data to the widest audience?',
          options: [
            'Internal SharedPreferences',
            'External storage, system logs, and backups',
            'The Android Keystore',
            'In-memory variables'
          ],
          answerIndex: 1,
          hint: 'Think beyond the app sandbox.',
          explanation:
            'External storage, logs (bug reports, support flows), and backups move data outside the app\u2019s sandbox — and sometimes off the device entirely. They typically dominate severity in storage findings.'
        },
        {
          id: 'm08-l01-q2',
          type: 'truefalse',
          prompt: 'Data stored in the app\u2019s internal sandbox is safe from disclosure by definition.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What threat models defeat the sandbox?',
          explanation:
            'Rooted devices, debuggable builds (run-as), backup channels, and the user\u2019s own capture (screenshots) all expose internal storage. Plaintext secrets inside the sandbox are findings under those threat models.'
        },
        {
          id: 'm08-l01-q3',
          type: 'short',
          prompt: 'Give three remediations for a token currently stored in plaintext SharedPreferences.',
          modelAnswer:
            'Keep it out of prefs (in-memory with secure refresh), encrypt it at rest with a key generated inside the Android Keystore (non-exportable, optionally user-authentication-bound), or move to a properly configured encrypted data store — and additionally exclude it from backups and never log it.',
          hint: 'Minimize, encrypt (with which keys?), and check the side channels.',
          explanation:
            'Effective remediation addresses the storage location, the key management, and the peripheral channels (backup, logging) — fixing only one layer leaves the token exposed through the others.'
        },
        {
          id: 'm08-l01-q4',
          type: 'scenario',
          prompt:
            'You find the session token in SharedPreferences AND in logcat. Why report them as two findings?',
          modelAnswer:
            'Different audiences and different fixes: the prefs entry is addressed by at-rest encryption and Keystore-backed keys under the rooted/backup threat model; the logcat entry is fixed by removing the debug statement and affects bug reports and support collection on every device. Separate findings keep remediation and severity honest.',
          hint: 'Who reads each one, and who fixes each one?',
          explanation:
            'Findings are actionable when scoped. Merging them hides that one is a design decision (storage) and the other a code hygiene issue (logging), with different owners and different verifications.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — Testing Data Storage',
          url: 'https://mas.owasp.org/MASTG/Android/0x05d-Testing-Data-Storage/',
          note: 'The canonical storage testing playbook this lesson operationalizes.'
        },
        {
          title: 'Android Developers — Data and file storage overview',
          url: 'https://developer.android.com/topic/data-storage',
          note: 'Official storage options and their trade-offs.'
        },
        {
          title: 'Android Developers — Save key-value data (SharedPreferences)',
          url: 'https://developer.android.com/topic/data-storage/shared-preferences',
          note: 'Official SharedPreferences documentation.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official guidance including data storage and logging.'
        }
      ]
    },
    {
      id: 'm08-l02',
      moduleId: 'm08',
      title: 'Insecure Cryptography',
      difficulty: 'Advanced',
      minutes: 30,
      prerequisites: ['m08-l01'],
      objectives: [
        'Spot weak primitives and weak parameters in decompiled code',
        'Find hardcoded keys, IVs, and salts — and "custom" crypto',
        'Confirm crypto findings dynamically by decrypting recovered data',
        'Evaluate password-hashing parameters against current guidance'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Apps rarely skip cryptography — they misuse it. The result is crypto theater: AES that leaks patterns, hashes that fall to one GPU, keys living next to the data they protect. This lesson trains the two skill-eyes a tester needs: spotting weak usage in decompiled code, and confirming dynamically that the recovered material really decrypts the data.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Weak primitives and weak parameters'
          },
          {
            type: 'table',
            headers: ['Anti-pattern', 'Why it fails', 'Spot it as'],
            rows: [
              ['ECB mode', 'Identical plaintext blocks produce identical ciphertext blocks; structure survives', 'Cipher.getInstance("AES") — defaults to ECB/PKCS5 — or "AES/ECB/..."'],
              ['DES / 3DES / RC4', 'Broken or deprecated ciphers', 'String literals "DES", "DESede", "RC4"'],
              ['MD5 / SHA-1 for passwords', 'Fast general-purpose hashes; GPU-crackable; collision-prone', 'MessageDigest.getInstance("MD5" or "SHA-1")'],
              ['Low PBE iteration counts', 'Key derivation brute-forceable from the password', 'PBEKeySpec with tiny iteration counts'],
              ['Predictable randomness', 'Keys/IVs/tokens become guessable', 'java.util.Random feeding key material instead of SecureRandom']
            ]
          },
          {
            type: 'h',
            text: 'Hardcoded material and custom crypto'
          },
          {
            type: 'p',
            text:
              'The second family is key management: keys, IVs, and salts as string literals or Base64 constants; IVs reused across encryptions; the "encryption key" stored in the same SharedPreferences file as the ciphertext. The third family is home-rolled transformations — XOR loops, alphabet substitutions — that fall to known-plaintext attacks. All three share a tell: the algorithm looks correct, but the secret material or the construction is recoverable from the artifact itself. The durable fix is a Keystore-generated non-exportable key with an authenticated mode (GCM) and a fresh IV per message.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Crypto findings have a beautiful property: they are provable. Recover the key and IV, decrypt the database you pulled during the m08-l01 sweep, and your evidence is a plaintext record that previously looked protected. The same material often unlocks PIN-verification or license paths. The MASVS crypto requirements and the MASTG cryptography chapter define the baseline you test against.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Cipher.getInstance with ECB, DES, RC4 — or a bare "AES" string',
              'MessageDigest used for password storage; salts hardcoded or absent; no real KDF',
              'Base64.decode feeding a SecretKeySpec; IVs as byte-array literals',
              'Custom XOR/substitution loops presented as encryption',
              'Keys in code, prefs, or native-library strings next to the data; java.util.Random generating key material'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Decrypt and crack only your targets',
            text:
              'Recovering keys and cracking hashes are legal only against training apps and in-scope materials you produced on your own lab devices. Never process real user data or third-party artifacts.'
          },
          {
            type: 'terminal',
            title: 'Hunting crypto in the artifact',
            lines: [
              '$ jadx -d out target.apk',
              '$ grep -rnE "Cipher\\.getInstance|SecretKeySpec|MessageDigest|PBEKeySpec" out/sources | head -20',
              'out/sources/com/example/trainingapp/Crypto.java: Cipher.getInstance("AES")   # ECB default!',
              '$ strings lib/arm64-v8a/libnative.so | grep -iE "key|secret|aes" | head',
              '# then prove it: decrypt a pulled DB/blob with the recovered key offline'
            ]
          },
          {
            type: 'p',
            text:
              'Confirm dynamically on the training app: use the recovered key/IV to decrypt a pulled database or captured ciphertext blob (CyberChef or a small script) and show the plaintext. For password hashes, run the extracted hashes through hashcat with a small wordlist — a cracked credential is decisive evidence. On debuggable builds, hook the Cipher calls with Frida (module 05 tooling) to log keys and IVs in actual use.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app stores a "secret note" column encrypted with a static key in AES/ECB. Pull the database during the storage sweep, decrypt it offline with openssl or CyberChef, and the note is plaintext — the entire protection was one string constant in the APK. The remediation paragraph writes itself: Keystore-generated non-exportable key, GCM mode with a random IV per message, and an encryption-key rotation story.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'JADX + grep — primitive and parameter spotting',
              'CyberChef / openssl — offline decryption of recovered blobs',
              'hashcat — weak password-hash cracking on lab-extracted hashes',
              'Frida — capture keys/IVs at runtime on debuggable targets',
              'MobSF — flags hardcoded keys and weak algorithms automatically'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Calling storage "encrypted" because Cipher appears in code — mode, key source, and IV handling decide',
              'Ignoring parameter-level weakness (iteration counts, IV reuse) when the algorithm name looks modern',
              'Reporting without decryption proof when the proof is one command away',
              'Searching only DEX — keys and checks also hide in resources and native libraries'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take a training APK, run the grep battery above, and list every crypto call with its parameters. Pick one finding and produce the full evidence chain: code excerpt, recovered material, decrypted plaintext or cracked hash. Then re-implement it correctly in your own demo app (Keystore + GCM) and show the difference.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Crypto theater is the norm: AES can still mean ECB, static keys, and recoverable data',
              'Prove crypto findings dynamically — decrypted plaintext beats code-review opinion',
              'Keystore-backed non-exportable keys and authenticated modes (GCM) are the remediation baseline',
              'Search the whole artifact: DEX, resources, and native libraries'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm08-l02-q1',
          type: 'mcq',
          prompt: 'What does Cipher.getInstance("AES") return on Android?',
          options: ['AES/GCM/NoPadding', 'AES/ECB/PKCS5Padding', 'AES/CBC/PKCS5Padding', 'It throws — a mode is required'],
          answerIndex: 1,
          hint: 'The default is the weakest mode.',
          explanation:
            'With only "AES", the JCA default is AES/ECB/PKCS5Padding. ECB leaks plaintext structure and is a reportable anti-pattern even though the algorithm name is modern.'
        },
        {
          id: 'm08-l02-q2',
          type: 'truefalse',
          prompt: 'Storing the encryption key in SharedPreferences next to the encrypted database is acceptable if the database uses AES-256.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where does the attacker get the key?',
          explanation:
            'Co-located key and data means one compromise yields both; the crypto adds no real protection. Keys belong in the Android Keystore (non-exportable) or derived from user secrets with a strong KDF.'
        },
        {
          id: 'm08-l02-q3',
          type: 'short',
          prompt: 'Why is MD5 with a salt unsuitable for password storage?',
          modelAnswer:
            'MD5 is a fast general-purpose hash; even salted, it allows billions of guesses per second on commodity GPUs. Password storage needs a slow, memory-hard KDF (bcrypt, scrypt, Argon2, or PBKDF2 with high iteration counts) tuned to current guidance.',
          hint: 'Speed is the enemy for password hashing.',
          explanation:
            'Password hashing inverts the usual performance goal: the function must be expensive so offline guessing is impractical. Fast digests like MD5/SHA-1 fail that requirement regardless of salting.'
        },
        {
          id: 'm08-l02-q4',
          type: 'scenario',
          prompt:
            'A training app encrypts notes with a hardcoded AES key and ECB mode. Walk through the evidence chain for the report.',
          modelAnswer:
            '1) Static: code excerpt showing Cipher.getInstance("AES") and the key constant. 2) Recovery: pull the encrypted artifact during the storage sweep. 3) Proof: decrypt it offline with the recovered key and capture the plaintext. 4) Remediation: Keystore-generated non-exportable key, GCM with a random per-message IV, backup exclusion. 5) Severity rationale under the rooted/lost-device threat model.',
          hint: 'Static, then recovery, then proof, then fix.',
          explanation:
            'The decrypted plaintext is what elevates the finding from "suspicious pattern" to confirmed protection failure — always close the loop with the dynamic proof before writing the report.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — Testing Cryptography',
          url: 'https://mas.owasp.org/MASTG/Android/0x05e-Testing-Cryptography/',
          note: 'The canonical mobile cryptography testing chapter.'
        },
        {
          title: 'Android Developers — Cryptography (deprecated algorithms)',
          url: 'https://developer.android.com/privacy-and-security/cryptography',
          note: 'Official list of algorithms to avoid on Android.'
        },
        {
          title: 'OWASP Cheat Sheet — Cryptographic Storage',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
          note: 'Baseline guidance for algorithms, modes, and key handling.'
        },
        {
          title: 'OWASP Cheat Sheet — Password Storage',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
          note: 'Current KDF and parameter guidance for password hashing.'
        }
      ]
    },
    {
      id: 'm08-l03',
      moduleId: 'm08',
      title: 'Local Authentication and Biometrics',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['m05-l06', 'm08-l02'],
      objectives: [
        'Bypass client-side authentication gates on training apps',
        'Distinguish UI-only biometric prompts from CryptoObject-bound implementations',
        'Verify keystore key properties: setUserAuthenticationRequired and enrollment invalidation',
        'Identify fallback code smells that undo the trust anchor'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A lock screen inside the app is not the OS lock screen. Everything the app checks locally — a flag, a PIN comparison, even a biometric prompt — runs on hardware the attacker owns. Done wrong, local auth is a speed bump; done right, BiometricPrompt plus a Keystore CryptoObject moves the trust anchor into hardware so the key physically cannot be used unless authentication succeeded. This lesson covers both halves: the bypass toolkit and the properties that make bypass infeasible.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Client-side gates and their bypasses'
          },
          {
            type: 'p',
            text:
              'Typical training-app gates: an is_logged_in boolean in SharedPreferences, a PIN compared to a constant in DEX, a "remember me" token in a database. Bypasses follow directly: run-as to edit the flag or database, Frida to hook the check and return true, or decompile-and-repatch to flip the comparison. The lesson is not that these bypasses exist — it is that any decision made purely from client-side data is advisory, and anything protected only by it (UI, features, cached data) must be treated as accessible in your threat model.'
          },
          {
            type: 'h',
            text: 'Biometrics with a real trust anchor'
          },
          {
            type: 'p',
            text:
              'BiometricPrompt alone is UI: it proves a finger was presented to a dialog, nothing about what that unlocks. The strong pattern is BiometricPrompt with a CryptoObject wrapping a Keystore key created with setUserAuthenticationRequired(true) (with a recency policy via setUserAuthenticationParameters) plus setInvalidatedByBiometricEnrollment(true), so a new enrollment — possibly an attacker\u2019s finger — invalidates the key. The key then cannot be used unless the biometric gate succeeded, because enforcement lives inside the TEE/keymaster, not in app code that can be patched around.'
          },
          {
            type: 'list',
            items: [
              'setUserAuthenticationRequired(true) — key unusable without a recent authentication event',
              'setInvalidatedByBiometricEnrollment(true) — new biometric enrollments invalidate the key',
              'setUserAuthenticationParameters(timeout, factors) — how recent and which factors count',
              'Explicit handling of KeyPermanentlyInvalidatedException — no silent key regeneration',
              'No fallback branch that reaches the same key material by another path'
            ]
          },
          {
            type: 'p',
            text:
              'Code smells that undo all of the above: onAuthenticationError followed by a "skip and continue" path; a fallback PIN compared to a constant; a biometric prompt whose callback result is never actually enforced; a CryptoObject that decrypts key material immediately stored in plaintext prefs.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'You will be asked "can you get in?" on training apps first. The professional answer has two halves: demonstrate the bypass where the gate is client-side only, and, where BiometricPrompt plus CryptoObject is used, verify the binding actually holds — key properties inspected, invalidation tested by re-enrolling biometrics on your test device, fallback paths reviewed. The MASVS auth requirements and the MASTG authentication chapter frame these tests.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Auth decisions driven by prefs/database flags or string comparisons in DEX',
              'BiometricPrompt shown without a CryptoObject (UI-only gate)',
              'KeyGenParameterSpec without setUserAuthenticationRequired, or with invalidation disabled',
              'Fallback code: constant PINs, master-password bypasses, error-path continuation',
              'A cached session that survives logout or app restart and re-satisfies the local gate'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Bypass on lab targets only',
            text:
              'Auth-bypass techniques are for training apps on your own devices. On engagements, only test authentication flows explicitly in scope, using designated test accounts.'
          },
          {
            type: 'terminal',
            title: 'Local-auth probing on a training app',
            lines: [
              '$ adb shell run-as com.example.trainingapp cat shared_prefs/settings.xml',
              '  <boolean name="is_unlocked" value="false" />',
              '# with root on your test device, flip the flag, relaunch, observe the gate open',
              '$ adb shell dumpsys biometric | head   # enrolled biometrics on the device',
              '# for CryptoObject apps: re-enroll biometrics and verify the key invalidates'
            ]
          },
          {
            type: 'p',
            text:
              'For the crypto-bound case, run the negative tests: attempt the protected operation without authenticating (it must fail at the crypto level, not merely the UI), re-enroll biometrics and verify the key invalidates, and review the error/fallback branches in decompiled code for silent continuation. In every write-up, state which layer enforced the decision — UI, app logic, or TEE.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On an UnCrackable-style crackme the local check lives in code and falls to Frida hooking. The biometric exercise is subtler and more instructive: verify that after wiping and re-enrolling your fingerprint on the emulator, the old key refuses to decrypt (invalidation works), and verify the reviewed build kept its CryptoObject (a common "simplification" removes it, silently downgrading to a UI-only gate). Both observations are reportable material.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'run-as / root — flag and database manipulation',
              'Frida (module 05) — hooking auth checks',
              'JADX — reading KeyGenParameterSpec usage and fallback paths',
              'objection — quick runtime tweaks on debuggable builds',
              'Emulator/device settings — biometric enrollment control for invalidation tests'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating the presence of BiometricPrompt as proof of security — the CryptoObject binding is the actual control',
              'Testing only the happy path; fallback and error branches are where apps quietly continue',
              'Never exercising enrollment invalidation — the property is meaningless if unverified',
              'Overclaiming: a bypassed local gate is not a server-side compromise; state the boundary precisely'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On one training app: (1) find and flip the client-side gate; (2) determine whether biometric auth is UI-only or CryptoObject-bound by reading the KeyGenParameterSpec construction; (3) if bound, run the invalidation test by re-enrolling biometrics. Write up both results with the trust-anchor distinction spelled out.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Purely client-side authentication is advisory: flags, PINs, and prompts are bypassable on attacker-owned hardware',
              'BiometricPrompt + CryptoObject + setUserAuthenticationRequired(true) + enrollment invalidation is the strong pattern',
              'Test the negative space: fallbacks, error paths, logout persistence, and re-enrollment behavior',
              'Always state which layer enforced authentication — UI, app logic, or TEE'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm08-l03-q1',
          type: 'mcq',
          prompt: 'What does BiometricPrompt WITHOUT a CryptoObject actually prove?',
          options: [
            'The user is authenticated for key use',
            'Only that a biometric was presented to a dialog — the app decides what that means',
            'The device is not rooted',
            'The device has StrongBox hardware'
          ],
          answerIndex: 1,
          hint: 'It is just a dialog and callbacks.',
          explanation:
            'Without a CryptoObject the result is consumed by app code that can ignore it; hardware enforces nothing. The CryptoObject binds authentication to a Keystore key operation enforced in the TEE.'
        },
        {
          id: 'm08-l03-q2',
          type: 'truefalse',
          prompt: 'Disabling biometric-enrollment invalidation makes a keystore key more secure.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What event should invalidate the key?',
          explanation:
            'With invalidation disabled, new biometric enrollments — potentially an attacker\u2019s — keep the key usable. Invalidation on enrollment changes is a property testers actively verify by re-enrolling.'
        },
        {
          id: 'm08-l03-q3',
          type: 'short',
          prompt: 'Name three ways to bypass a client-side authentication gate on a training app.',
          modelAnswer:
            'run-as/root modification of the flag or database holding the gate; Frida hooking of the check function to return success; and decompile-repatch (apktool/smali edit) to invert the comparison — or simply reading the hardcoded PIN from decompiled code.',
          hint: 'One needs no tools, one needs a hook, one needs a rebuild.',
          explanation:
            'The variety of bypasses is the point: any decision that lives entirely on the client can be reached by at least one of these paths, which is why server-side or hardware-backed enforcement matters.'
        },
        {
          id: 'm08-l03-q4',
          type: 'scenario',
          prompt:
            'An app shows BiometricPrompt with a CryptoObject, but on onAuthenticationError it falls back to a PIN check against a constant. Assess it.',
          modelAnswer:
            'The strong biometric binding is undone by the fallback: the constant PIN is recoverable from static analysis (m08-l02), so an attacker takes that path and obtains the same key material without any biometric. Finding: the fallback path bypasses the trust anchor; the fix is removing the constant-PIN fallback or binding it properly to device credential via the authentication parameters instead.',
          hint: 'A chain is as strong as its weakest gate.',
          explanation:
            'Crypto-bound biometrics only protect flows that cannot reach the key another way. Fallback branches that converge on the same secret convert a strong design back into a static-analysis exercise.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Biometric authentication',
          url: 'https://developer.android.com/topic/security/biometrics',
          note: 'Official biometric security guidance.'
        },
        {
          title: 'Android Developers — Show a biometric authentication dialog',
          url: 'https://developer.android.com/training/sign-in/biometric-auth',
          note: 'Official BiometricPrompt and CryptoObject usage guide.'
        },
        {
          title: 'OWASP MASTG — Testing Authentication',
          url: 'https://mas.owasp.org/MASTG/Android/0x05f-Testing-Authentication/',
          note: 'Local and biometric authentication testing methodology.'
        },
        {
          title: 'Android Developers — Keystore system',
          url: 'https://developer.android.com/training/articles/keystore',
          note: 'Official Keystore documentation: key properties and hardware backing.'
        }
      ]
    },
    {
      id: 'm08-l04',
      moduleId: 'm08',
      title: 'Authorization Flaws in Mobile Apps',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['m08-l03'],
      objectives: [
        'Explain why client-side checks are presentation, not authorization',
        'Test role and entitlement boundaries with a two-account method',
        'Find and confirm IDOR when the app is paired with its API',
        'Build a boundary matrix as systematic, defensible evidence'
      ],
      diagram: 'app-api-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Authentication asks "who are you"; authorization asks "may you do this". Mobile apps blur the line because half the checks happen in the UI: a hidden button, a disabled field, a premium flag. UI checks are not authorization — they are decoration. The real boundaries live on the server, and the mobile tester\u2019s job is to walk every boundary and see which ones hold when the client is fully hostile.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Trusting the client'
          },
          {
            type: 'p',
            text:
              'The pattern: the server accepts whatever the app claims. Role or entitlement flags sent by the client and honored server-side; prices, quantities, or receipt data computed on the device and posted to the API; admin features hidden from non-admin users but fully functional when called. Each is exploitable without platform-level skill: flip the flag in prefs (m08-l03), tamper the request in the proxy, or call the hidden endpoint directly.'
          },
          {
            type: 'h',
            text: 'IDOR from the phone'
          },
          {
            type: 'p',
            text:
              'Insecure Direct Object Reference is the canonical mobile-server finding: /api/orders/1043, where 1043 is another customer\u2019s order and the server never checks ownership. The mobile client makes it easy — object ids sit in intents, deep links, and API responses — and the phone is a friendly API client for replaying modified requests. The systematic method: enumerate the object-addressing scheme, obtain a second account on the training backend, and replay every read and write with the other account\u2019s ids, in both directions.'
          },
          {
            type: 'table',
            headers: ['Observed in the app', 'Why it is not authorization'],
            rows: [
              ['Button hidden for non-premium users', 'The API still serves the premium endpoint when called directly'],
              ['Field disabled in the UI', 'The server accepts any posted value'],
              ['Price total computed on the client', 'The server trusts a client-computed number'],
              ['Role flag in SharedPreferences', 'Attacker-editable locally; and the server honors it'],
              ['Object ids in deep links and exports', 'Ownership is never verified server-side']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Authorization testing is where mobile and web methodology merge: capture traffic, enumerate roles and objects, and diff responses. What the phone adds is surface — exported components, deep links, and cached data often leak the very ids and endpoints you need. Report both halves: the client-side weakness that exposed the handles, and the server-side flaw that accepted them.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Requests carrying roles, entitlements, prices, or receipt blobs generated on the client',
              'Sequential or guessable object ids in API paths, intents, and deep-link parameters',
              'Hidden-but-present admin/premium activities and API calls in decompiled code',
              'Server responses that differ only cosmetically when roles change — same data, no enforcement',
              'Client-side validation as the only guard on payments, redemptions, or data exports'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Backends are in scope only when scoped',
            text:
              'Authorization testing touches a server by design. Do it exclusively against training backends (a deliberately vulnerable app plus its companion API) or engagements where the scope explicitly includes server-side testing with test accounts.'
          },
          {
            type: 'terminal',
            title: 'Two-account boundary walk (local training backend)',
            lines: [
              '# with the proxy capturing app traffic (module 06 setup)',
              '$ curl -H "Authorization: Bearer <userA-token>" https://training.local/api/orders/1042',
              '$ curl -H "Authorization: Bearer <userA-token>" https://training.local/api/orders/1043',
              '{"id":1043,"owner":"userB","total":99.90}',
              '# role boundary: replay an admin-only endpoint with userA\u2019s token',
              '$ curl -X POST -H "Authorization: Bearer <userA-token>" -H "Content-Type: application/json" -d "{\\"order\\":1043}" https://training.local/api/admin/refund'
            ]
          },
          {
            type: 'p',
            text:
              'Keep a boundary matrix: rows are objects and actions, columns are roles, cells are allowed/denied/leaked. Fill it by replaying requests with each role\u2019s token against the training backend. Any cell that violates the app\u2019s documented intent is a finding candidate; verify it twice (clean session, fresh token) before writing it up.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training combo (deliberately vulnerable app plus local API) stores the premium flag in prefs and serves /api/orders/<id> without ownership checks. The full chain: flip the flag locally to reveal premium UI, harvest order ids from the app\u2019s requests, then replay them as user A to read user B\u2019s orders. Two findings, one demo — client-side trust and server-side IDOR.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'Burp / mitmproxy (module 06) — capture, replay, and fuzz requests',
              'curl — scripted boundary walks',
              'JADX — find hidden endpoints and client-computed values',
              'Two test accounts on the training backend — the minimum viable fixture'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting "client-side only checks" as a server compromise — name the layer precisely',
              'Testing IDOR with one account only; you need two to prove cross-object access',
              'Assuming non-sequential ids are safe — enumerate from exports, referrals, or timestamps',
              'Stopping at read access; write paths (update, delete, refund) usually carry higher impact'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Use (or stand up) a training app with a companion API. Create two accounts, capture every request from one flow, and build the boundary matrix for orders and profile objects. Replay across accounts and roles. Then patch the training backend yourself (an ownership-check middleware) and show the matrix turn green.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'UI checks are presentation, not authorization — the server must own every decision',
              'IDOR testing needs two accounts and a systematic object-id walk, in both directions',
              'Mobile surface (deep links, exports, cached ids) is a rich source of the handles that make IDOR practical',
              'A boundary matrix turns ad-hoc poking into complete, defensible evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm08-l04-q1',
          type: 'mcq',
          prompt: 'A premium feature is hidden for free users in the UI. What is the correct next test?',
          options: [
            'Declare it secure — hidden means safe',
            'Call the premium endpoint directly with a free account\u2019s token',
            'Root the device',
            'Reinstall the app'
          ],
          answerIndex: 1,
          hint: 'Does the server enforce, or only the view?',
          explanation:
            'UI hiding is presentation. The test is whether the API enforces the entitlement; if it serves the request, the finding is a server-side authorization failure with the UI check as cosmetics.'
        },
        {
          id: 'm08-l04-q2',
          type: 'truefalse',
          prompt: 'Properly testing IDOR requires at least two accounts on the target system.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'You must prove access to someone else\u2019s object.',
          explanation:
            'Cross-object access is the definition of the flaw; with one account you can only show enumeration, not unauthorized access to another principal\u2019s data.'
        },
        {
          id: 'm08-l04-q3',
          type: 'short',
          prompt: 'Why is a client-computed price or total a security smell?',
          modelAnswer:
            'The client is attacker-controlled: the value can be tampered in the proxy or modified in app data before it is posted. Pricing, entitlement, and receipt decisions must be recomputed server-side from authoritative data.',
          hint: 'Who computes values that must be trusted?',
          explanation:
            'Any value that influences money or access must be derived server-side. Client-computed values are inputs, and inputs from the client are attacker inputs.'
        },
        {
          id: 'm08-l04-q4',
          type: 'scenario',
          prompt:
            'You can read another user\u2019s order via /api/orders/1043, but writes fail with 403. How do you maximize the report\u2019s value without overclaiming?',
          modelAnswer:
            'Document precisely: confirmed read-only cross-object access (with evidence), writes correctly denied — then systematically test other objects and actions (profile, exports, refund endpoints) before finalizing severity. Note that the ownership-check gap affects reads systemically, and avoid claiming write compromise you did not demonstrate.',
          hint: 'Report what you proved; enumerate what remains.',
          explanation:
            'Precision increases credibility and usefulness: the development team learns exactly which enforcement layer is missing, and the report avoids inflated claims that would be challenged in triage.'
        }
      ],
      references: [
        {
          title: 'OWASP Cheat Sheet — Authorization',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          note: 'Server-side authorization testing and design guidance.'
        },
        {
          title: 'OWASP MASTG — Testing Authentication',
          url: 'https://mas.owasp.org/MASTG/Android/0x05f-Testing-Authentication/',
          note: 'Mobile authentication and authorization testing methodology.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official guidance on input validation and trusting IPC inputs.'
        }
      ]
    },
    {
      id: 'm08-l05',
      moduleId: 'm08',
      title: 'Session and Token Handling',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m08-l01', 'm08-l04'],
      objectives: [
        'Map where tokens are stored and what audience each location implies',
        'Test expiry and refresh handling for correctness',
        'Verify logout completeness: local data, WebView state, and server-side revocation',
        'Sweep the leakage channels: logs, backups, crash reports, screenshots'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Tokens are temporary keys with a lifecycle: issued, stored, used, refreshed, and — the part apps get wrong — revoked. A mobile app must hold that lifecycle across offline states, process death, and logouts. Test the whole lifecycle: where tokens rest, how expiry is handled, whether logout is complete, and where tokens leak on their way through the system.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Storage and channels'
          },
          {
            type: 'p',
            text:
              'Tokens live in SharedPreferences (the m08-l01 classic), SQLite, in-memory singletons, or WebView cookie jars when the app embeds web login. Each location implies an audience: in-memory dies with the process; prefs ride backups and rooted-device reads; WebView cookies persist in app_webview until explicitly cleared. Transport security is module 06 territory — here the concern is at rest, and at rest after logout.'
          },
          {
            type: 'h',
            text: 'Expiry, refresh, logout'
          },
          {
            type: 'p',
            text:
              'Well-behaved clients treat access tokens as short-lived, store refresh tokens more carefully and use them sparingly, and handle a 401 by refreshing once — not by silently retrying with a stale token. Logout is the high-value test: a complete logout (1) clears tokens and cached responses from storage, (2) clears WebView cookies and caches, (3) revokes or invalidates the session server-side, and (4) leaves nothing that a relaunch can resurrect into a usable session. Partial logout — a UI reset only — means a captured refresh token outlives the user\u2019s goodbye.'
          },
          {
            type: 'list',
            items: [
              'logcat during login, refresh, and logout (tokens in debug prints and error bodies)',
              'Backups including token-bearing prefs and databases (m07-l06 rules review)',
              'Crash reports and analytics breadcrumbs carrying Authorization headers',
              'Screenshots and recents thumbnails of WebView sessions; "copy token" features filling the clipboard',
              'Notification or widget content that displays session state'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Session findings chain beautifully: a leaked refresh token (logs or backups) plus incomplete revocation (the logout test) equals account-takeover potential far beyond the app itself. On the training backend you can prove it end to end — capture a token, log out, reuse it; if the API still accepts it, the finding is demonstrated, not speculated. The remediation taxonomy (short-lived access, rotating refresh, server-side revocation, storage hygiene) is standard and satisfying.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Long-lived tokens or refresh tokens in prefs/databases without encryption or backup exclusion',
              'Logout handlers that clear UI state but not storage, cookies, or server-side sessions',
              '401 handling that retries forever or silently falls back to cached data',
              'Tokens printed to logcat, embedded in crash reports, or included in backups',
              'WebView sessions whose cookies survive logout (CookieManager never cleared)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Tokens from training apps only',
            text:
              'Capture, replay, and reuse tokens exclusively against your lab training app and its local backend. Never capture or replay credentials from production services or real accounts.'
          },
          {
            type: 'terminal',
            title: 'Token lifecycle walk (training app + local API)',
            lines: [
              '$ adb logcat -c',
              '# log in; capture the token from logcat or the proxy: eyJhbGciOi...',
              '$ adb shell run-as com.example.trainingapp cat shared_prefs/session.xml',
              '# log out via the app, then:',
              '$ adb shell run-as com.example.trainingapp cat shared_prefs/session.xml   # still there?',
              '$ curl -H "Authorization: Bearer eyJhbGciOi..." https://training.local/api/me',
              '{"user":"tester","role":"user"}   # <- accepted after logout = revocation finding',
              '$ adb shell run-as com.example.trainingapp ls app_webview/   # cookie leftovers?'
            ]
          },
          {
            type: 'p',
            text:
              'Repeat the walk for expiry: issue short-lived tokens on the training backend, let them lapse, and confirm the client refreshes exactly once and never retries stale tokens unboundedly. Pull the backup (m07-l06) and grep it for token strings. Every observation gets a location, channel, and audience note — mirroring the m08-l01 sweep discipline.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app keeps the refresh token in SharedPreferences, prints access tokens in logcat debug lines, and implements logout as "clear the in-memory user object". The full demo: capture the token from logcat, log out, relaunch (the session resurrects from prefs), and call the local API with the old token — still accepted. Three findings, one coherent story, all reproducible on the training stack.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb logcat + run-as — capture tokens and verify storage states',
              'curl — token-reuse and revocation tests against the local backend',
              'Burp / mitmproxy — observe refresh flows',
              'Android Backup Extractor — inspect backup contents for token strings',
              'JADX — read the logout and refresh implementations'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing only login; the interesting failures live at refresh and logout',
              'Calling logout secure after seeing the UI reset — verify storage, cookies, and server-side state',
              'Forgetting the WebView cookie jar in hybrid login flows',
              'Reporting token-in-prefs without checking backup rules — the backup channel often multiplies severity'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the complete lifecycle walk on a training app: capture tokens at every stage, verify storage before and after logout, test reuse against the local API, and inspect backups. Write the findings as a lifecycle diagram (issue, store, use, refresh, logout, revoke) annotated with where each control failed.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Test the whole token lifecycle — storage, expiry, refresh, logout, revocation — not just login',
              'Complete logout means client cleanup (tokens, caches, cookies) AND server-side revocation',
              'Logcat, backups, crash reports, and WebView cookies are the recurring leakage channels',
              'Token-reuse-after-logout against the training API is the decisive evidence for revocation findings'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm08-l05-q1',
          type: 'mcq',
          prompt: 'Which logout behavior is the strongest indicator of incomplete session teardown?',
          options: [
            'The login screen shows after logout',
            'The captured refresh token still authorizes API calls',
            'The app icon remains on the launcher',
            'A toast confirms logout'
          ],
          answerIndex: 1,
          hint: 'Revocation happens where the token is accepted.',
          explanation:
            'The server accepting the token after logout means no revocation occurred; UI reset is cosmetic. Complete logout invalidates the session server-side and clears client residues.'
        },
        {
          id: 'm08-l05-q2',
          type: 'truefalse',
          prompt: 'Access tokens should generally outlive refresh tokens for usability.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which one grants new access tokens?',
          explanation:
            'The standard pattern is the opposite: short-lived access tokens limit exposure, while refresh tokens (more protected, rotating, revocable) extend the session. Long-lived access tokens widen the window for leaked-token abuse.'
        },
        {
          id: 'm08-l05-q3',
          type: 'short',
          prompt: 'List three client-side locations that must be cleared at logout.',
          modelAnswer:
            'Token-bearing storage (SharedPreferences/databases), WebView cookies and cache (CookieManager plus cache clearing), and in-memory session state and cached API responses — alongside verifying the server-side session and refresh token are revoked.',
          hint: 'Storage, web, memory — and what else?',
          explanation:
            'Client cleanup covers every place the session materialized; the server-side revocation is the fourth and most important element, since captured tokens must stop working.'
        },
        {
          id: 'm08-l05-q4',
          type: 'scenario',
          prompt:
            'You capture an access token from logcat on a training app. Describe how to build the revocation finding without touching any real service.',
          modelAnswer:
            'Use the token only against the local training backend: call a benign authenticated endpoint before logout (expect 200), log out via the app, then replay the exact same request. If it still returns 200, revocation is missing — capture both responses and the logout action as evidence, and note that only training tokens were ever handled.',
          hint: 'Before/after, same endpoint, local backend only.',
          explanation:
            'The before/after replay isolates the revocation control as the only variable. Keeping all traffic on the training stack makes the finding ethically clean and fully reproducible.'
        }
      ],
      references: [
        {
          title: 'OWASP Cheat Sheet — Session Management',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          note: 'Baseline session lifecycle and revocation guidance.'
        },
        {
          title: 'OWASP MASTG — Testing Data Storage',
          url: 'https://mas.owasp.org/MASTG/Android/0x05d-Testing-Data-Storage/',
          note: 'Storage-side verification of token handling.'
        },
        {
          title: 'Android Developers — CookieManager reference',
          url: 'https://developer.android.com/reference/android/webkit/CookieManager',
          note: 'Official API for WebView cookie inspection and clearing.'
        }
      ]
    }
  ]
};
