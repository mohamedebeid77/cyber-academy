import type { Module } from '../../../../types';

// LEVEL 8 — CRYPTO & RESILIENCE · Module i18: Cryptography in iOS Apps
// Original content synthesized from Apple CryptoKit/CommonCrypto documentation
// and OWASP MASTG cryptography chapters.

export const i18: Module = {
  id: 'i18',
  title: 'Cryptography in iOS Apps',
  level: 8,
  description:
    'Enough cryptography to audit implementations: primitives, modes, key management, and the iOS-specific landscape (CryptoKit, CommonCrypto, Security framework, Keychain, Secure Enclave). The module teaches the difference between using cryptography and using it securely — with the observation tooling from module i11 doing the proving.',
  outcomes: [
    'Audit symmetric/asymmetric usage: algorithms, modes, IVs/nonce handling, key derivation',
    'Locate and evaluate key management: generation, storage, rotation, hardcoded material',
    'Recognize custom crypto and apply the reject-by-default rubric with nuance'
  ],
  lessons: [
    {
      id: 'i18-l01',
      moduleId: 'i18',
      title: 'The Primitives: What You Are Auditing',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i11-l04'],
      objectives: [
        'Read hashing, symmetric and asymmetric usage from code and observation',
        'Evaluate modes, IV/nonce discipline and randomness as audit dimensions',
        'Apply the deprecation/weakness rubric per primitive family'
      ],
      diagram: 'ios-crypto-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Crypto audits are dimension checks, not math: which primitive, which mode, where the key came from, how the IV/nonce was chosen, what the randomness source is. Five dimensions cover nearly every finding. This lesson installs the dimensions per primitive family — the vocabulary that makes module i11-l04\u2019s observation hooks and module i08\u2019s sweep outputs legible as crypto verdicts.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-crypto-map',
            caption: 'The iOS crypto landscape — each box carries its own audit dimensions.'
          },
          { type: 'h', text: 'Hashing' },
          {
            type: 'list',
            items: [
              'Dimension 1 — algorithm: MD5/SHA1 (broken for collision-relevant uses), SHA-2 family fine for integrity (password storage needs slow KDFs, not bare hashes)',
              'Dimension 2 — purpose: integrity vs password storage vs signatures — the same algorithm is correct in one and wrong in another',
              'The iOS shapes: CommonCrypto CC_SHA*, CryptoKit SHA256/Insecure.MD5 (the Insecure namespace literally names the finding), and home-rolled hashes (reject by default)'
            ]
          },
          { type: 'h', text: 'Symmetric encryption' },
          {
            type: 'list',
            items: [
              'Dimension 1 — algorithm: AES fine; DES/3DES/RC4 deprecated (observation hook flags kCCAlgorithmDES instantly)',
              'Dimension 2 — mode: ECB (structure leaks — the red letter from i11-l04), CBC (needs authentication — unauthenticated CBC invites padding-oracle classes), GCM/ChaChaPoly (AEAD — the correct default)',
              'Dimension 3 — IV/nonce: fixed IVs (the "same key+IV" catastrophe), counter-reuse in GCM (catastrophic), random-per-message IVs (correct), IVs derived from keys (wrong)',
              'Dimension 4 — key derivation: bare passwords as keys (no KDF), proper PBKDF2/HKDF usage, iteration counts that respect current guidance'
            ]
          },
          { type: 'h', text: 'Asymmetric and randomness' },
          {
            type: 'list',
            items: [
              'Asymmetry: RSA key sizes (1024 broken), EC curves (P-256 fine; custom curves reject), padding modes (PKCS#1 v1.5 vs OAEP — context-dependent), signature verification actually verifying (the i15 client-trust rule, crypto edition)',
              'Randomness: SecRandomCopyBytes (correct) vs rand()/time-based (broken) — nonce/IV generation is where randomness bugs hide',
              'The rubric\u2019s meta-rule: crypto findings cite the dimension violated, the observation that proved it, and the data it protected — severity flows from the last'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The dimensions map onto observation hooks (i11-l04) and static sweep output (i08) — the audit is classification, not invention',
              'Mode/IV findings (ECB, fixed IVs) are the most common iOS crypto defects — and the most provable (decrypt artifacts with extracted keys, the i03-l03 pattern)',
              'Purpose-mismatch findings (bare SHA for passwords, encryption for what needs signatures) require the nuance the dimensions force — the anti-noise mechanism',
              'Deprecation findings cite vendor guidance (Apple\u2019s own documentation marks the paths) — report-ready citations built in'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'kCCOptionECBMode / Insecure.MD5 / SHA1 literals in code (the instant flags)',
              'Fixed IV arrays or IVs derived from keys (dimension 3 kills)',
              'Key material as string literals (module i08\u2019s secrets sweep — crypto edition)',
              'rand()/srand()/time-based nonce generation',
              'RSA-1024 or custom curve names',
              'Unauthenticated CBC without MAC/HMAC composition'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Inventory crypto call sites statically (sweep + metadata: CryptoKit/CommonCrypto/Security vocabularies from i09)',
              'Run the observation hooks (i11-l04) through each crypto-touching feature; record the dimension values (alg, mode, IV source, key source)',
              'Correlate key sources: literals (i08\u2019s sweep), keychain reads (SecItem hooks), KDF outputs (PBKDF2/HKDF observations) — provenance per key',
              'For the worst shapes: extract keys/decrypt artifacts (the proof of impact — i03-l03\u2019s satisfying proof)',
              'Write per-feature crypto verdicts using the rubric: dimension violated, observation, protected data, severity'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Dimensions on one finding. Static: kCCOptionECBMode + a 16-byte string literal key (sweep). Observation: CCCrypt opts=1 (ECB), keyLen=16, invoked on "vault export" data. Impact proof: extracted key decrypts the exported file — user\u2019s vault data, structure visible through ECB. Verdict: "Vault export uses AES-ECB with a compiled-in key (dimensions: mode + key provenance violated); any holder of the binary decrypts exports; ECB leaks record structure. Protected data: full vault contents — critical." Four rubric fields, one paragraph, unarguable — the dimensions turned a code smell into a complete finding.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The i11-l04 hook library (CCCrypt, SecKey, CryptoKit bridge observations), the sweep outputs (literals), decoders for artifact proof (openssl for ECB/CBC checks). No new tooling — the module is classification applied to what you already collect.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting algorithm names without dimensions (mode/IV/key source decide most findings, not "AES present")',
              'Purpose-blind severity: bare SHA-256 for integrity is correct; the same call for passwords is a finding — read the purpose',
              'Decrypting/extracting beyond the artifact needed for proof — evidence minimalism applies to crypto work too',
              'Ignoring key provenance: the same AES-GCM finding is a hardening note with a keychain-derived key and critical with a compiled-in one'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the crypto inventory for your training app: call sites, observed dimensions per feature, key provenance map. Write one full-rubric verdict (and one verified-clean line if the app does something correctly — CryptoKit defaults usually do). The inventory is the module\u2019s working document for lessons 2–3.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Five dimensions (primitive, mode, IV/nonce, key provenance, randomness) structure every crypto audit',
            'Mode/IV and key-provenance findings dominate iOS: ECB, fixed IVs, compiled-in keys — all hook-observable',
            'Purpose-mismatch nuance prevents noise: the same primitive is right and wrong depending on use',
            'Severity flows from the protected data — the rubric\u2019s last field is the verdict\u2019s engine'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i18-l01-q1',
          type: 'mcq',
          prompt: 'AES-256-CBC with a random IV per message but no MAC: which dimension is violated?',
          options: [
            'Algorithm',
            'Integrity: unauthenticated encryption (no AEAD, no MAC composition) — malleability/padding-oracle classes apply',
            'Key length',
            'None — this is the correct configuration'
          ],
          answerIndex: 1,
          hint: 'Confidentiality may hold — what about tampering?',
          explanation:
            'The encryption dimension is fine; the integrity dimension is not: unauthenticated CBC permits manipulation/padding-oracle classes. Verdict: integrity violation — the fix is AEAD (GCM) or MAC composition.'
        },
        {
          id: 'i18-l01-q2',
          type: 'truefalse',
          prompt: 'CryptoKit\u2019s Insecure.MD5 usage is always a critical finding regardless of purpose.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the purpose dimension say about MD5 for non-collision-relevant checksums?',
          explanation:
            'False — MD5 for integrity checksums of non-adversarial data is deprecated-but-contextual (hardening note); for signatures, password storage or collision-relevant trust it is a finding. The namespace name flags it; the purpose decides the severity.'
        },
        {
          id: 'i18-l01-q3',
          type: 'scenario',
          prompt:
            'Observation shows CBC encryption where the IV equals the first 16 bytes of the key. Compose the finding.',
          hint: 'Which dimension is this — and what does IV-from-key mean for repeated messages?',
          explanation:
            'Key-derived IV: same key means same IV across messages — the dimension-3 catastrophe (identical prefixes leak equality; with fixed keys the IV is effectively fixed). Finding: "IVs derived from the encryption key (observed: IV == key prefix); repeated messages produce identical ciphertext prefixes, breaking semantic security. Fix: per-message random IVs (SecRandomCopyBytes), transmitted alongside ciphertext."'
        },
        {
          id: 'i18-l01-q4',
          type: 'mcq',
          prompt: 'Why does key provenance dominate severity more than algorithm choice?',
          options: [
            'Algorithms do not matter',
            'The same cipher with a compiled-in key is theater (attackers hold the binary) while keychain/enclave-derived keys deliver real protection — provenance decides whether the crypto protects anything',
            'Apple audits provenance',
            'Key provenance is faster'
          ],
          answerIndex: 1,
          hint: 'Who holds the binary — and therefore who holds a compiled-in key?',
          explanation:
            'Key provenance decides whether the crypto survives an attacker with the artifact: compiled-in keys fail that attacker by construction; platform-bound keys (keychain classes, enclave) are designed for exactly that adversary. Same algorithm, opposite verdicts.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — CryptoKit',
          url: 'https://developer.apple.com/documentation/cryptokit',
          note: 'The modern API surface (and its Insecure namespace honesty)'
        },
        {
          title: 'Apple Developer — CommonCrypto (CCCrypt semantics)',
          url: 'https://developer.apple.com/documentation/security/commoncryptodigests',
          note: 'The C API whose constants the observation hooks read'
        },
        {
          title: 'OWASP MASTG — iOS cryptography testing',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The test families behind each dimension'
        }
      ]
    },
    {
      id: 'i18-l02',
      moduleId: 'i18',
      title: 'Key Management: Generation, Storage, Rotation',
      difficulty: 'Advanced',
      minutes: 24,
      prerequisites: ['i18-l01', 'i05-l02'],
      objectives: [
        'Trace key lifecycles: generation source, storage class, usage scope, rotation',
        'Evaluate platform-bound keys (Keychain, Secure Enclave) as the correct storage tier',
        'Produce the key-management findings that outlive algorithm findings'
      ],
      diagram: 'ios-keychain-dp',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Key management is where crypto audits earn their keep: algorithms fail loudly and rarely; key management fails quietly and everywhere. The lifecycle audit follows each key from generation (where born, how random) through storage (which tier) to usage (what it protects) to rotation (does it ever change?). Lifecycle findings also have the longest remediation tails — which is exactly why they matter.'
          }
        ],
        technical: [
          { type: 'h', text: 'The lifecycle stages, audited' },
          {
            type: 'table',
            headers: ['Stage', 'Correct shape', 'Finding shapes'],
            rows: [
              ['Generation', 'SecRandomCopyBytes / SecKey generation in Keychain/Enclave', 'Random literals, time/counter-based, generated client-side then SHARED'],
              ['Storage', 'Keychain (class-matched), enclave-bound where secrets are crown-jewel', 'Compiled literals, UserDefaults, plaintext files, "encrypted" with another embedded key'],
              ['Usage scope', 'One key per purpose', 'One key everywhere (tokens+files+local DB) — blast radius maximized'],
              ['Rotation', 'Versioned keys, re-encryption paths', 'Eternal keys (no rotation path at all)'],
              ['Destruction', 'Keychain deletion on logout/wipe', 'Keys persisting past account reset (i13-l03 reconciliation applies)']
            ]
          },
          { type: 'h', text: 'Platform-bound storage tiers' },
          {
            type: 'list',
            items: [
              'Keychain with matched accessibility (module i05-l02\u2019s rubric — storage tier for keys is the SAME rubric with higher stakes)',
              'Secure Enclave keys (kSecAttrTokenIDSecureEnclave): P-256, non-exportable, operations inside the enclave — the crown-jewel tier (signing/device binding); correct positioning: not general storage',
              'Enclave-backed patterns worth recognizing as strong: device-binding keys (attestation-shaped flows), biometric-gated key reads (module i15-l01\u2019s bound pattern)',
              'The anti-pattern: "we use the Secure Enclave" as documentation while keys live in UserDefaults — verify tier claims with the observation hooks, always'
            ]
          },
          { type: 'h', text: 'Rotation and blast radius' },
          {
            type: 'p',
            text:
              'Two questions complete the audit. Blast radius: if this key leaks, what falls? (One key for file encryption + token wrapping + local DB = everything falls; per-purpose keys bound the damage.) Rotation: is there any path to change the key? (No rotation path means a leak is unrecoverable-by-design — a finding even when today\u2019s storage is sound.) Both questions read from code structure (key derivation call graphs) and the observation records — no crypto math required.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Key-management findings are the crypto section\u2019s durable content: algorithms get fixed in a PR; lifecycle flaws need design work — reports that surface them early earn their fee',
              'Blast-radius findings reframe "weak crypto elsewhere" findings: the leaked DB key that also wraps tokens upgrades two findings at once',
              'The lifecycle table (generation → storage → usage → rotation → destruction) per key is the deliverable — auditable line by line',
              'Tier-claim verification (enclave/keychain claims vs observed reality) catches the documentation-vs-reality gap — a trust finding in its own right'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Key constants adjacent to crypto call sites (i08\u2019s sweep — the provenance kill)',
              'Keys in UserDefaults/plists "temporarily" (the permanent temporary)',
              'SecKeyCreateRandomKey usage (good — note where it stores) vs Data-based keys from strings (bad)',
              'One master key referenced by every crypto call site (blast radius)',
              'Version/rotation vocabularies absent (no keyVersion, no re-encrypt paths)',
              'Enclave claims without enclave token attributes (the claim-vs-reality check)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Build the key inventory: every key the app uses, from static sources + observation hooks (generation and read observations per i11-l04)',
              'Fill the lifecycle table per key: generation, storage tier, purposes (blast radius), rotation path, destruction behavior',
              'Verify tier claims: enclave/keychain documentation vs observed attributes (kSecAttrTokenID, accessibility classes)',
              'Impact-model the worst key: what falls if it leaks (per blast radius), and is recovery possible (rotation)?',
              'Write findings per lifecycle violation + the summary key-management paragraph (the durable recommendation)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One key\u2019s lifecycle verdict. Inventory: masterKey (16 bytes, literal in binary — i08 sweep), used by file encryption, local DB, and token wrapping (three call sites — decompiler xrefs). Rotation: none (no version vocabulary). Destruction: never. Verdict: "A single compiled-in master key protects files, local database and token wrapping with no rotation path; binary possession defeats all three domains simultaneously. Severity: critical (blast radius × provenance × no recovery). Fix: per-purpose keys generated via SecRandomCopyBytes, stored class-matched in Keychain, versioned for rotation." Five lifecycle fields, one verdict, remediation that outlives the engagement — the lifecycle table\u2019s whole purpose.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The observation hook library (key generation/reads), decompiler cross-references (usage/blast radius), the sweep outputs (literals), and the lifecycle table (document). The tools were built in modules i08/i11 — this lesson is their crypto-specific application.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Auditing storage without generation (a keychain-stored key born from Math.random inherits the generation finding)',
              'Missing multi-purpose keys — the blast-radius finding needs cross-reference reading, not per-call-site checks',
              'Accepting tier claims from documentation — the observation hooks exist to verify (module i11\u2019s pairing rule, key edition)',
              'Reporting rotation absence as theoretical — leak-recovery impossibility is the concrete impact; state it that way'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the lifecycle table for every key in your training app\u2019s inventory (lesson 1\u2019s document). Write the one-worst-key verdict with the blast-radius argument. If all keys are platform-bound and single-purpose, write the verified-strong line with the observation artifacts — recognizing correct key management is half the skill.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'The lifecycle table (generation, storage, usage, rotation, destruction) structures every key audit',
            'Blast radius and rotation absence are findings that outlive algorithm fixes — surface them prominently',
            'Platform-bound tiers (keychain classes, enclave) are the correct storage — verify claims by observation, not documentation',
            'Key-management findings have the longest remediation tails — and the highest durable value'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i18-l02-q1',
          type: 'mcq',
          prompt: 'A key is stored correctly in the Keychain but generated from Math.random(). Verdict?',
          options: [
            'Verified — storage is what matters',
            'Generation finding: predictable key material defeats the storage tier — random-source violation (SecRandomCopyBytes is the fix)',
            'Keychain bug',
            'No finding — Math.random is seeded well on iOS'
          ],
          answerIndex: 1,
          hint: 'Which lifecycle stage is violated — and does a strong storage tier repair a weak birth?',
          explanation:
            'Generation is its own stage: a predictable key is predictable regardless of where it is stored. The lifecycle table exists precisely to audit stages independently — strong tiers do not launder weak births.'
        },
        {
          id: 'i18-l02-q2',
          type: 'truefalse',
          prompt: 'One master key used for file encryption, database encryption and token wrapping is acceptable if the key is strong.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the blast-radius dimension say about multi-purpose keys?',
          explanation:
            'False — blast radius: the key\u2019s leak (or one domain\u2019s crypto flaw) cascades across all three domains. Per-purpose keys bound damage; the multi-purpose shape is a lifecycle finding even with perfect strength.'
        },
        {
          id: 'i18-l02-q3',
          type: 'scenario',
          prompt:
            'Documentation claims Secure Enclave protection for signing keys. Observation shows kSecAttrTokenID absent on those keys. Finding?',
          hint: 'What does the claim-vs-reality gap mean — for the keys\u2019 actual protection and for the report?',
          explanation:
            'Tier-claim gap: keys are standard keychain keys (exportable-in-principle, class-gated) while documentation claims enclave non-exportability. Finding: documentation-accuracy + protection-tier (users of the app make trust decisions on the claim). Fix: actually generate with kSecAttrTokenIDSecureEnclave, or correct the documentation. The observation hooks exist exactly for this verification.'
        },
        {
          id: 'i18-l02-q4',
          type: 'mcq',
          prompt: 'Why is rotation absence a finding even when today\u2019s storage is sound?',
          options: [
            'Rotation is legally required everywhere',
            'No rotation path means a future leak is unrecoverable by design — recovery capability is part of the control, not an optimization',
            'Keys always leak eventually',
            'It is not — storage is the only finding dimension'
          ],
          answerIndex: 1,
          hint: 'What does the control owe the incident that WILL eventually happen?',
          explanation:
            'Key management is incident preparedness: sound storage today plus zero recovery path means the first leak becomes permanent exposure. Rotation capability is part of the control\u2019s definition — its absence is a lifecycle finding with concrete incident impact.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Storing keys in the Keychain (SecKey generation)',
          url: 'https://developer.apple.com/documentation/security/keychain_services/keychain_items',
          note: 'Generation and storage APIs with class semantics'
        },
        {
          title: 'Apple Developer — Secure Enclave keys (kSecAttrTokenIDSecureEnclave)',
          url: 'https://developer.apple.com/documentation/security/certificate_key_and_trust_services/keys/storing_keys_in_the_secure_enclave',
          note: 'The enclave tier\u2019s exact capabilities and limits'
        },
        {
          title: 'OWASP MASTG — iOS key management tests',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The lifecycle test families'
        }
      ]
    },
    {
      id: 'i18-l03',
      moduleId: 'i18',
      title: 'Custom Crypto and the Reject-By-Default Rubric',
      difficulty: 'Advanced',
      minutes: 20,
      prerequisites: ['i18-l02'],
      objectives: [
        'Recognize custom/home-rolled crypto shapes in code and decompilation',
        'Apply the reject-by-default rubric with its legitimate-niche nuances',
        'Write the crypto section\u2019s summary: the "using vs using securely" verdict per feature'
      ],
      diagram: 'ios-crypto-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Custom crypto — home-rolled ciphers, hand-rolled obfuscation, exotic mode compositions — fails by default not because its authors are foolish but because surviving review is what makes primitives trustworthy, and custom designs have none. The rubric is reject-by-default with narrow exceptions (obfuscation-for-speed, non-security encoding). This lesson trains recognition, applies the rubric, and assembles the crypto section\u2019s verdict per feature: using cryptography, or using it securely.'
          }
        ],
        technical: [
          { type: 'h', text: 'Recognition shapes' },
          {
            type: 'list',
            items: [
              'Hand-rolled ciphers: XOR loops with rotating keys, custom Feistel-ish rounds, byte-shuffling "encryption" — visible in decompilation as arithmetic-heavy custom functions (i09-l03\u2019s sessions named them)',
              'Obfuscation-as-encryption: base64 layers, string reversal, ROT-style transforms guarding "secrets"',
              'Exotic compositions: AES followed by custom whitening, double-encryption for "extra security", mode improvisations',
              'Protocol improvisation: custom handshake steps, signature schemes built from hash concatenation'
            ]
          },
          { type: 'h', text: 'The rubric, applied' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Identify the claimed purpose (encryption? integrity? obfuscation?) — from call sites and data flows',
              'Match purpose to the standard primitive that owns it (AEAD for encryption+integrity, MACs, KDFs)',
              'Reject-by-default: if a custom construction fills a standard primitive\u2019s role, it is a finding (design-level) regardless of apparent cleverness',
              'The narrow exceptions: encoding/obfuscation with NO security claims (base64 transport wrapping — a note, not a finding) and performance-driven obfuscation of non-secrets',
              'Severity from claims and data: custom crypto protecting tokens/vaults is critical-shaped; the same transform on UI strings is a note'
            ]
          },
          { type: 'h', text: 'The section verdict: using vs using securely' },
          {
            type: 'list',
            items: [
              'Per feature (from lesson 1\u2019s inventory): dimensions passed? key lifecycle sound? — the two verdicts compose',
              'The feature sentence: "Vault export: AES-GCM (dimensions pass) with enclave-derived key (lifecycle passes) — using cryptography securely" vs the ECB/literal-key opposite',
              'The section summary: features by verdict class, the systemic issues (key management, custom crypto), and the platform-guidance pointer (CryptoKit defaults as the recommendation anchor)',
              'Cross-module citations: storage findings (i13), wire findings (i14) and client-trust findings (i15) that the crypto verdicts complete'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Custom-crypto findings are design-level: remediation is replacement with standard primitives (CryptoKit/CommonCrypto patterns) — the most valuable recommendation class in crypto sections',
              'The exceptions analysis prevents overclaiming: encoding with no security claims is not crypto theater — rubric discipline again',
              'The section verdict gives clients a feature-level map: which flows they can trust, which need redesign — the report\u2019s crypto conclusion',
              'Recognition skill transfers: the same shapes appear in native libraries (module i19\u2019s RE terrain) — train here, apply there'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Arithmetic-heavy custom functions in crypto-adjacent call graphs (the decompiler\u2019s tell)',
              'XOR-key vocabularies, byte-shuffle tables, custom S-boxes',
              'Base64/reversal chains guarding high-value strings (token-shaped "secrets")',
              'Double-encryption or self-composed modes around standard primitives',
              'Crypto-named functions with no standard-API calls inside (the hollow-crypto tell)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Sweep the call graph for crypto-shaped custom functions (no standard-API calls, heavy arithmetic, secret-adjacent)',
              'For each: establish the claimed purpose (data flows), apply the rubric, classify (finding / note / exception)',
              'Prove the worst shapes: reverse/decrypt the custom construction (custom crypto is usually reversible from the binary — i09\u2019s discipline) and decrypt a real artifact',
              'Compose the per-feature verdicts and the section summary with the remediation anchor (standard primitives)',
              'Cross-cite the completed findings from i13/i14/i15 that the crypto verdicts finalize'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Custom crypto, proven trivially. Decompilation shows CryptoBox.transform(data): rotating-XOR with a 12-byte key derived from the bundle id. Rubric: claimed purpose (file protection) owned by AEAD; custom construction — reject. Proof: reimplemented the transform (10 lines) from the decompiled logic; decrypted the app\u2019s export file. Verdict: "Custom XOR-based file \u0027encryption\u0029 (CryptoBox.transform) protecting user exports; reversed from the binary and decrypted in minutes (artifact attached). Design-level finding: replace with AES-GCM via CryptoKit; rotate any shipped exports." Reversal-from-binary is the custom-crypto finding\u2019s signature proof — the rubric gave the verdict, the RE gave the receipt.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The decompiler (recognition + reversal), Python/openssl for proof implementations, and the module 1/2 documents (inventory + lifecycle table). Custom-crypto proof is small-scope RE — the i09 skills at their sharpest.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Rubric-blind rejection of all custom code — the exceptions (non-security encoding) exist; read the claimed purpose first',
              'Reporting custom crypto without the reversal proof — the design finding strengthens dramatically with the decryption receipt',
              'Missing the hollow-crypto shape (crypto-named functions doing nothing standard) — they hide behind correct-looking call graphs',
              'Forgetting the section summary — feature verdicts without the systemic view lose the design-level recommendations'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Hunt custom crypto in your training app: recognition sweep, rubric classification, one reversal proof if present. Then write the full crypto section summary (feature verdicts + systemic issues + remediation anchor). If the app is clean, the summary documents that with observation artifacts — the verified-secure section is a legitimate, valuable outcome.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Custom crypto fails by default because review-survival is the trust mechanism — recognition and rubric replace math',
            'The exceptions (non-security encoding, perf obfuscation of non-secrets) prevent overclaiming — claimed purpose first',
            'Reversal-from-binary is the signature proof — custom constructions are reversible, and the receipt is decisive',
            'The section verdict (using vs using securely, per feature) plus the systemic summary is the crypto section\u2019s deliverable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i18-l03-q1',
          type: 'mcq',
          prompt: 'Base64-wrapped strings guarding API tokens: rubric verdict?',
          options: [
            'Exception — it is just encoding',
            'Finding: encoding used where protection was needed — the tokens are trivially recoverable (decode), i08\u2019s secrets finding with an obfuscation note',
            'No finding — base64 is standard',
            'Depends on the token length'
          ],
          answerIndex: 1,
          hint: 'What was the claimed purpose — and does encoding fill it?',
          explanation:
            'The claim (token protection) is not met by encoding — the exception class covers encoding with NO security claims. Token-in-base64 is the secrets finding (recoverable material) plus the design note: real protection means keychain/gated storage, not encoding.'
        },
        {
          id: 'i18-l03-q2',
          type: 'truefalse',
          prompt: 'Double-encrypting (AES then AES again with a second key) increases security proportionally.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the composition dimension say about improvised layering — and what does it actually add?',
          explanation:
            'False — improvised composition adds failure surface, not strength; standard constructions (AEAD) own the role. The finding is the design-level rejection with the remediation (single standard AEAD), severity per protected data.'
        },
        {
          id: 'i18-l03-q3',
          type: 'scenario',
          prompt:
            'You recognize a custom Feistel-like cipher protecting session tokens. What is the proof sequence and the finding skeleton?',
          hint: 'Recognize → reverse → decrypt → verdict. What artifacts anchor each step?',
          explanation:
            'Sequence: decompile the construction (i09-l03 session) → reimplement (Python, small) → decrypt a captured/stored token artifact → wire-confirm the decrypted token\u2019s use (i14 pairing). Skeleton: "Custom Feistel construction protecting session tokens (design-level rejection); reversed from binary, tokens decrypted (artifacts), wire-confirmed valid. Replace with platform-bound storage (keychain/enclave) — tokens should not be crypto-protected data at all but gated keychain items." The last sentence is the highest-value remediation: the right primitive is no custom crypto.'
        },
        {
          id: 'i18-l03-q4',
          type: 'mcq',
          prompt: 'Why does the section summary anchor remediation to CryptoKit/platform defaults?',
          options: [
            'Apple requires CryptoKit',
            'Standard, reviewed primitives with safe defaults are the recommendation clients can execute — custom designs lack the review-survival that makes primitives trustworthy',
            'CryptoKit is faster',
            'It avoids naming CommonCrypto'
          ],
          answerIndex: 1,
          hint: 'What is the actual trust mechanism behind primitives — and what do defaults buy?',
          explanation:
            'Primitives earn trust through sustained public review; platform implementations carry that review plus safe defaults. Anchoring remediation there gives clients a concrete, defensible target — the section\u2019s systemic recommendation rather than per-finding patches.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — CryptoKit (recommended constructions)',
          url: 'https://developer.apple.com/documentation/cryptokit',
          note: 'The remediation anchor\u2019s API surface'
        },
        {
          title: 'OWASP MASTG — iOS cryptography testing (custom crypto rubric)',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The reject-by-default framing in the guide\u2019s terms'
        },
        {
          title: 'OWASP Cryptographic Storage Cheat Sheet',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
          note: 'The standard-construction guidance behind the rubric'
        }
      ]
    }
  ]
};
