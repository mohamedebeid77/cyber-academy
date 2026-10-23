import type { Module } from '../../../../types';

// LEVEL 1 — APP INTERNALS · Module i03: iOS Development Concepts for Pentesters
// Not a development course: only the code-reading literacy a tester needs.
// All snippets are illustrative originals in the style of common app code.

export const i03: Module = {
  id: 'i03',
  title: 'iOS Development Concepts for Pentesters',
  level: 1,
  description:
    'Read, don\u2019t write. Swift and Objective-C literacy for testers: the syntax shapes you will see in decompiled and dumped code, the runtime mechanics that make hooking possible, and the audit patterns (secrets, storage, crypto, network) that turn reading into findings.',
  outcomes: [
    'Read Swift constructs (classes, optionals, closures, protocols) as they appear in real app code',
    'Read Objective-C method signatures, selectors and property declarations, and explain dynamic dispatch',
    'Recognize the recurring insecure patterns in app code during static analysis',
    'Interpret stack traces, symbol names and log output to locate code of interest'
  ],
  lessons: [
    {
      id: 'i03-l01',
      moduleId: 'i03',
      title: 'Reading Swift: The Shapes You Will See',
      difficulty: 'Beginner',
      minutes: 22,
      prerequisites: [],
      objectives: [
        'Recognize classes, structs, properties, optionals and closures in Swift code',
        'Explain value vs reference semantics and why they matter for reasoning about state',
        'Identify security-relevant Swift patterns (UserDefaults writes, naive auth checks, force-unwraps)'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Most modern iOS apps are Swift. You will not compile any of it in this academy — but you will read it in three contexts: code that appears (mangled) in symbol names, code you reconstruct from decompilers, and code the client shares during remediation conversations. Swift reading literacy is therefore a force multiplier for every static module ahead. The good news: for testing purposes, Swift is a small language. A dozen shapes cover ninety percent of what you will see.'
          }
        ],
        technical: [
          { type: 'h', text: 'The core shapes' },
          {
            type: 'code',
            lang: 'swift',
            title: 'A representative Swift fragment — every construct annotated below',
            code:
              'class SessionManager {\n    static let shared = SessionManager()          // singleton — common hook target\n    private(set) var token: String?               // optional: may be nil\n\n    func store(token: String) {\n        self.token = token\n        UserDefaults.standard.set(token, forKey: "auth_token")  // red flag\n    }\n\n    func isValid(user: User) -> Bool {            // function returning Bool\n        return user.isAdmin && user.status == "active"\n    }\n}\n\nstruct User {                                     // struct = value type\n    let id: Int\n    var isAdmin: Bool\n    var status: String\n}'
          },
          {
            type: 'list',
            items: [
              'class vs struct: classes are reference types (shared, mutable identity — runtime objects you can hook); structs are value types (copied — invisible to the ObjC runtime)',
              'Optionals (String?): may hold nothing; force-unwrap (!) crashes on nil — crashes you trigger are clues, not just noise',
              'Closures: { args in body } — blocks of behavior passed around; in decompiled code they surface as distinct functions',
              'Protocols: interfaces; conformances appear in Swift metadata and matter when you enumerate classes at runtime',
              'Extensions: adding methods to existing types — a favorite place to hide logic you should not skip when reading'
            ]
          },
          { type: 'h', text: 'What the compiler does to it' },
          {
            type: 'p',
            text:
              'Swift compiles to native ARM64 with mangled symbol names: a method isValid(user:) becomes something like $s4MyApp14SessionManagerC7isValid4useryAA0C0V_tF. Demanglers (swift demangle, or Ghidra\u2019s Swift analyzer) restore readable names — this is why symbols matter and why stripping them is a defense you will evaluate in module i21. Pure Swift classes skip the Objective-C runtime unless annotated (@objc / NSObject subclasses) — a fact that shapes your Frida strategy: objc hooks reach ObjC-visible code; Swift-only internals may need native-level hooks.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Singletons (static let shared) are stable, globally reachable objects — ideal first hook targets',
              'Authorization checks (func isValid…) in client code are observations, not boundaries — the backend decides; client checks tell you the intended rules (module i15)',
              'UserDefaults / plist writes visible in code are storage findings waiting for confirmation in the container (module i13)',
              'Force-unwraps and try! mark crash-prone paths — deliberately feeding those paths malformed input is a dynamic technique'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Hardcoded strings that look like credentials, keys or internal URLs in literals',
              'Persistence calls: UserDefaults.standard, FileManager writes, CoreData saves — with what data?',
              'Crypto invocations with suspicious constants (ECB modes, fixed IVs, hardcoded salt)',
              'Client-side gating: isAdmin, isPremium, role checks that only steer UI',
              'try! and ! unwraps on network or parse paths'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Reading drill with the snippet above. Questions to answer before looking at the annotations\u2019 answers: (1) Where will auth_token end up on disk, and in what format? (2) Which object would you hook to observe every token write? (3) If the server returns status "inactive", what does the app show — and can you reach admin UI another way? (4) Which of these constructs exists in the ObjC runtime (so objc hooks see it) and which does not? Write answers, then check: (1) Library/Preferences plist, XML; (2) SessionManager.shared.store(token:) — a single chokepoint; (3) unknown — client code only steers UI, so you would test the API\u2019s own authorization; (4) the class is not an ObjC object as written — Swift-only until bridged.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Read for chokepoints',
            text:
              'The best reading goal is not full comprehension — it is finding chokepoints: single functions through which sensitive data must pass (token stores, request builders, crypto wrappers). Hook a chokepoint and you observe a whole feature class.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'From reading to finding. A decompiled snippet shows: URL(string: "https://api.stage.targetapp.com" + path). The literal names a staging environment compiled into the release binary. Two actions follow: (1) static — grep the binary for more *.stage.* / internal hostnames (module i08\u2019s strings workflow); (2) dynamic — resolve whether staging is publicly reachable (only via authorized testing), because apps that ship internal endpoints ship attack surface. The finding started as one line of Swift-shaped code in a decompiler; reading skill made it visible.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Tool support for Swift reading: swift demangle (CLI, from the Swift toolchain), Ghidra with the Swift demangler analyzer, and symbol-aware string tools. In Frida, Swift-only code needs native hooks (Interceptor.attach on addresses) rather than ObjC bridge hooks — module i11 covers when each applies.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Expecting objc-style hooks on pure Swift types — without @objc/NSObject they are invisible to the ObjC runtime',
              'Reading client authorization checks as proof of server behavior — they are intentions, not enforcement',
              'Assuming decompiled Swift reads like Swift — it reads like decompiled anything: names if symbols survive, noise if stripped',
              'Skipping extensions and protocols in audit — real logic hides in conformance methods'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Rewrite, from memory, a five-line Swift snippet that stores a value in UserDefaults with a suspicious key name. Then write the three questions you would ask about it in a test (where on disk? which chokepoint? does the backend enforce what this implies?). You are practicing the audit reflex: syntax recognition → storage prediction → boundary question.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'A dozen Swift shapes (classes, structs, optionals, closures, protocols, extensions) cover most code you will see',
            'Swift-only types are invisible to the ObjC runtime — hooking strategy depends on bridging',
            'Mangled symbols demangle to readable names when symbols survive stripping',
            'Read for chokepoints, not comprehension: token stores, request builders, crypto wrappers'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i03-l01-q1',
          type: 'mcq',
          prompt: 'Which Swift declaration creates an object you can reliably enumerate and hook via the Objective-C runtime?',
          options: [
            'struct Config { var key: String }',
            'class TokenStore: NSObject { @objc func save(_ t: String) }',
            'enum State { case active, locked }',
            'let closure = { print("hi") }'
          ],
          answerIndex: 1,
          hint: 'ObjC runtime visibility requires ObjC object semantics. Which line opts in explicitly?',
          explanation:
            'NSObject subclass + @objc exposes the class and method to the ObjC runtime (class lists, selectors, objc_msgSend). Pure Swift structs/enums/closures are not runtime objects; hooking them requires native techniques.'
        },
        {
          id: 'i03-l01-q2',
          type: 'truefalse',
          prompt: 'A client-side role check like if user.isAdmin { showAdmin() } proves the backend enforces admin-only access to admin APIs.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where must authorization actually be enforced for it to exist at all?',
          explanation:
            'False. Client checks steer UI; the backend must enforce authorization independently. The check tells you the intended rule — a lead for testing the API (module i15), never evidence of enforcement.'
        },
        {
          id: 'i03-l01-q3',
          type: 'scenario',
          prompt:
            'You see UserDefaults.standard.set(token, forKey: "auth_token") in decompiled code. Give the verification path for the storage finding.',
          hint: 'Static claim → dynamic proof. What file proves it, and how do you read it?',
          explanation:
            'Pull the app container (dev build: Xcode; store build: backup extraction) and read Library/Preferences/<bundle-id>.plist — confirm the key auth_token and its value type. Correlate with a feature (login) to describe reachability. That is the finding: source (code) + artifact (file) + attacker position (backup/local).'
        },
        {
          id: 'i03-l01-q4',
          type: 'mcq',
          prompt: 'Why are singletons attractive first hook targets?',
          options: [
            'They are always public in source',
            'They are stable, app-wide instances whose methods funnel feature behavior',
            'They cannot be stripped from binaries',
            'They bypass code signing'
          ],
          answerIndex: 1,
          hint: 'Think about what "shared" means for where data flows.',
          explanation:
            'Singletons are constructed once and referenced app-wide — token stores, session managers, API clients. Hooking their methods observes (or modifies) behavior across every feature that uses them.'
        }
      ],
      references: [
        {
          title: 'The Swift Programming Language (official)',
          url: 'https://docs.swift.org/swift-book/',
          note: 'Reference for every construct named here — skim, do not study as a developer'
        },
        {
          title: 'Swift.org — Type mangling and demangling',
          url: 'https://github.com/swiftlang/swift/blob/main/docs/ABI/Mangling.rst',
          note: 'Why symbol names look like $s… and how they demangle'
        },
        {
          title: 'OWASP MASTG — iOS code review techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'Where reading skills plug into the testing guide\u2019s workflows'
        }
      ]
    },
    {
      id: 'i03-l02',
      moduleId: 'i03',
      title: 'Reading Objective-C: Messages, Selectors and the Runtime',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i03-l01'],
      objectives: [
        'Read Objective-C method signatures, properties and class declarations',
        'Explain message sending, dynamic dispatch and method swizzling in tester terms',
        'Recognize ObjC-specific security patterns in code and at runtime'
      ],
      diagram: 'ios-frida-hook-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Objective-C is the reason iOS reverse engineering is unusually rewarding. The language is dynamically dispatched: every method call is a message resolved at runtime against class metadata that ships in the binary. For the tester that means class names, method names and property names are often readable straight out of the app — a map no compiled Java or stripped C program offers. Even Swift apps keep large ObjC-facing surfaces (they subclass NSObject for Apple frameworks). Learning to read ObjC is learning where the map is drawn.'
          }
        ],
        technical: [
          { type: 'h', text: 'The shapes' },
          {
            type: 'code',
            lang: 'objc',
            title: 'Representative Objective-C — the shapes you will meet',
            code:
              '@interface LoginManager : NSObject\n@property (nonatomic, copy) NSString *token;      // declared property\n- (BOOL)validateUser:(NSString *)user\n           password:(NSString *)pwd;               // method with two args\n@end\n\n@implementation LoginManager\n- (BOOL)validateUser:(NSString *)user password:(NSString *)pwd {\n    if ([pwd isEqualToString:@"letmein123"]) {     // hardcoded secret\n        return YES;\n    }\n    return [self callApiWithUser:user pwd:pwd];\n}\n@end'
          },
          {
            type: 'list',
            items: [
              'Message syntax: [receiver selector arg1: v1 arg2: v2] — brackets are calls; the colon-labeled parts are arguments',
              'Selectors: the method name itself (validateUser:password:) — what Frida hooks by name',
              'Properties: @property generates getters/setters — visible in class dumps as methods',
              'Categories: extensions on existing classes (+ (void)load is called at startup — a classic anti-analysis hiding spot)',
              'Protocols: @protocol declarations; conformances appear in metadata and often name delegate patterns'
            ]
          },
          { type: 'h', text: 'Dynamic dispatch, in tester terms' },
          {
            type: 'p',
            text:
              'A call is not a jump: the runtime looks up the selector in the receiver\u2019s class method list, finds the implementation pointer (IMP), and calls it. Two consequences. Hooking: replace the IMP (Frida\u2019s ObjC.bridge) and every call to that selector — from anywhere — goes through you. Metadata: the method list, selectors and property names are data in the binary (__objc_methname, __objc_classlist), which is why class-dump-style tooling reconstructs near-headers from a stripped binary. This is also why ObjC code survives stripping far better than Swift: the runtime needs those names to function.'
          },
          {
            type: 'diagram',
            id: 'ios-frida-hook-flow',
            caption: 'Message dispatch and the hook path: replacing the implementation intercepts every caller.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Class/method enumeration is reconnaissance: Frida\u2019s ObjC.classes reveals the app\u2019s own naming vocabulary — LoginManager, CryptoUtil, LicenseValidator — pointing at audit targets',
              'Selectors in strings are often features: "bypassPin:", "logDebugToken:" — grep gold',
              'Swizzling is both a hooking technique and an app-side defense pattern (apps swizzle to detect instrumentation) — module i21',
              '+load categories run before main: anti-analysis and environment checks hide there — check them first when behavior seems inexplicable'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              ' isEqualToString: comparisons against literals (hardcoded credentials/pins)',
              'Keychain and plist writes from Model/Manager classes — storage decisions live there',
              'WebView delegate methods (decidePolicyForNavigationAction) and JS bridge handlers (userContentController:didReceiveScriptMessage:)',
              'Methods containing "Debug", "Test", "Bypass", "Mock" — debug leftovers that survived release',
              'Category names on framework classes (NSString+Crypto) — custom crypto wrappers live there'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'The runtime drill (works once a device/toolchain exists, but the reading half starts now). From the snippet above: (1) name the selector you would hook to observe every login attempt; (2) name the class whose instances you would enumerate at runtime to find all token storage; (3) state what [pwd isEqualToString:@"letmein123"] proves about release hygiene and what you would report. Answers: (1) validateUser:password: on LoginManager; (2) LoginManager (its token property) — plus anything else touching Keychain; (3) a hardcoded credential in shipped code — static finding, confirmed by strings in the binary, reportable as secret-in-code regardless of whether it "works".'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Why ObjC survives stripping',
            text:
              'The runtime needs selector and class names to dispatch messages — they cannot simply be removed the way local symbol names can. That is a structural property of the language, and the reason class-dump tooling works at all.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Runtime enumeration as recon (preview of module i11). One line of Frida: Object.keys(ObjC.classes).filter(c => /Login|Auth|Session|Crypto/i.test(c)) — returns the app\u2019s own security-relevant vocabulary in seconds. Suppose it prints ["AuthManager", "SessionCache", "OldLoginVC"]. Next step: dump their methods (ObjC.classes.AuthManager.$ownMethods) — and you have an audit checklist the binary itself wrote for you. No decompiler required for this stage; the runtime is the documentation.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'The ObjC-reading toolkit: class-dump / dsdump-style tools (headers from binaries), otool -oV (runtime structures), Frida ObjC bridge (live enumeration), and later Ghidra where names end. In this module: none installed yet — the reading skill is the tool.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading [Class method] as "calling a function named method" — it is a message to an instance/class, resolved at runtime',
              'Assuming Swift apps have no ObjC surface — framework integration makes NSObject subclasses the norm',
              'Hooking selectors that are implemented in categories of system classes and expecting app behavior to change — check implementers first',
              'Trusting decompiled ObjC as "the source" — it is a reconstruction; control flow can mislead (and that is module i09\u2019s problem)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write, from memory, the ObjC method signature for a method that takes a username and password and returns a boolean. Then write the exact selector string, and one Frida-style sentence describing what hooking that selector observes. If the selector string is right (colon placement matters: validateUser:password:), your runtime literacy is on track.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'ObjC dispatches messages at runtime using metadata shipped in the binary — names are structural, not optional',
            'Selectors are hook handles; the method list is an audit checklist you can dump',
            '+load categories run before main — first place to look for hidden checks',
            'Even Swift apps expose ObjC-facing surfaces; runtime enumeration works on most real apps'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i03-l02-q1',
          type: 'mcq',
          prompt: 'What is a selector in Objective-C?',
          options: [
            'A compiled machine-code address',
            'The runtime name of a method (e.g. validateUser:password:) used for dispatch',
            'A C function pointer stored in the binary',
            'A category of a class'
          ],
          answerIndex: 1,
          hint: 'What does the runtime actually look up when [obj method] runs?',
          explanation:
            'A selector (SEL) is the method\u2019s name key; the runtime maps it to an implementation (IMP) via the class\u2019s method list. Hooking works by replacing that mapping.'
        },
        {
          id: 'i03-l02-q2',
          type: 'truefalse',
          prompt: 'Method swizzling is exclusively an attacker/hooking technique that legitimate apps never use.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who else swaps implementations at runtime — for detection or patching of their own code?',
          explanation:
            'False. Apps themselves swizzle (analytics SDKs, and notably anti-tamper/anti-hook defenses that re-implement or guard sensitive methods). It is a dual-use runtime mechanism you must recognize from both sides (module i21).'
        },
        {
          id: 'i03-l02-q3',
          type: 'scenario',
          prompt:
            'Runtime enumeration reveals a class ReachabilityChecker with method isNetworkSafe containing logic you cannot trigger via UI. Name two static next steps before touching Frida.',
          hint: 'The binary contains the implementation and its references. What would you inspect?',
          explanation:
            '(1) Locate the method\u2019s code and cross-references in a disassembler (who calls it, under what conditions); (2) dump surrounding strings/symbols for related config (URLs, thresholds). Only then design the dynamic experiment — static context tells you which hook would answer the actual question.'
        },
        {
          id: 'i03-l02-q4',
          type: 'mcq',
          prompt: 'Why do ObjC class and method names usually survive symbol stripping?',
          options: [
            'Stripping tools intentionally preserve them for debugging',
            'The Objective-C runtime requires them in metadata to dispatch messages',
            'App Store review forbids stripping them',
            'They are stored encrypted'
          ],
          answerIndex: 1,
          hint: 'What would break at runtime if selector names vanished from the binary?',
          explanation:
            'Dispatch is by name: the method list and selector strings must be present for the runtime to resolve messages. Structural need, not policy — which is why class-dump tooling keeps working.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Programming with Objective-C',
          url: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/',
          note: 'Official primer for syntax and idioms'
        },
        {
          title: 'Apple Developer — Objective-C Runtime',
          url: 'https://developer.apple.com/documentation/objectivec',
          note: 'Runtime API surface: classes, selectors, method lists'
        },
        {
          title: 'Apple Developer — Methods and messaging (encapsulated in the language guide)',
          url: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/',
          note: 'Messaging mechanics behind dispatch and swizzling'
        }
      ]
    },
    {
      id: 'i03-l03',
      moduleId: 'i03',
      title: 'Code-Audit Patterns: Secrets, Storage, Crypto, Network',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['i03-l01', 'i03-l02'],
      objectives: [
        'Recognize the recurring insecure patterns in iOS app code across four domains',
        'For each pattern, state the static evidence, the dynamic confirmation and the finding phrasing',
        'Build a personal audit checklist usable during module i08 static analysis'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Static analysis is pattern matching with judgment. Across hundreds of assessments, the same dozen code shapes produce most iOS findings. This lesson walks the four domains — secrets, storage, crypto, network — showing the shape, why teams write it, and how you convert it into a defensible finding. Later modules go deep per domain; this is the cross-domain field guide you will carry.'
          }
        ],
        technical: [
          { type: 'h', text: 'Domain 1: Secrets' },
          {
            type: 'code',
            lang: 'swift',
            title: 'The classic hardcoded secret',
            code:
              'enum API {\n    static let key = "sk_live_9f3ab77c01d4"        // looks harmless, ships to everyone\n    static let baseUrl = "https://api.targetapp.com/v2"\n}'
          },
          {
            type: 'p',
            text:
              'Why it happens: client-side SDKs demand keys; developers paste them in. Why it matters varies — API keys are often designed to be public (report with nuance: what the key actually authorizes), but signing secrets, private tokens and credentials are straightforward findings. Static evidence: strings in the binary, resources, config plists. Dynamic confirmation: observe the request using it. Severity: argue from the key\u2019s real privileges.'
          },
          { type: 'h', text: 'Domain 2: Storage' },
          {
            type: 'code',
            lang: 'objc',
            title: 'Token in UserDefaults instead of the Keychain',
            code:
              'NSUserDefaults *d = [NSUserDefaults standardUserDefaults];\n[d setObject:accessToken forKey:@"access_token"];   // plaintext plist on disk'
          },
          {
            type: 'p',
            text:
              'The fix is always the Keychain with a sane accessibility class (module i13). Static evidence: the call itself. Dynamic: pull the container, show the plist. Severity: reachable readers (backups, local attackers), token lifetime.'
          },
          { type: 'h', text: 'Domain 3: Crypto' },
          {
            type: 'code',
            lang: 'swift',
            title: 'AES-ECB with a compiled-in key',
            code:
              'let keyData = Data("0123456789abcdef".utf8)          // static key in code\nlet opts: [String: Int] = [kCCOptionECBMode as String: kCCOptionECBMode]\n// CCCrypt(..., kCCAlgorithmAES, opts, keyData, ...)'
          },
          {
            type: 'p',
            text:
              'ECB leaks structure; a compiled-in key defeats the point of encrypting at rest (anyone with the binary has the key). Static evidence: algorithm constants and key literals. Dynamic: decrypt a captured artifact with the extracted key — the most satisfying proof in this discipline. Severity: what the ciphertext protects, and whether the key rotation exists.'
          },
          { type: 'h', text: 'Domain 4: Network' },
          {
            type: 'code',
            lang: 'swift',
            title: 'Trust-all server trust evaluation',
            code:
              'func urlSession(_ s: URLSession,\n                didReceive challenge: URLAuthenticationChallenge,\n                completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {\n    completionHandler(.useCredential, URLCredential(trust: challenge.protectionSpace.serverTrust!))\n}'
          },
          {
            type: 'p',
            text:
              'This delegate "handles" TLS challenges by accepting whatever the server presents — the iOS shape of disabling certificate validation. Static evidence: the completion handler shape. Dynamic: proxy with your CA; if interception works without device CA trust for this app, validation is broken. Severity: network attacker position; pair with ATS findings from Info.plist.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Nuance is the skill',
            text:
              'Every domain above has a legitimate-use corner: some keys are public by design; UserDefaults can hold non-sensitive data; ECB survives in rare compatibility cases; challenge handlers exist for client-cert auth. The auditor\u2019s judgment is exactly this: know the legitimate shape well enough to not file noise.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Audit order that pays: secrets sweep → storage sweep → crypto inventory → network config → auth logic — cheap, high-yield checks first',
              'Each pattern maps to a MASVS category and a MASTG test family — your checklist is the standard\u2019s index in disguise',
              'Cross-confirmation rule: a static pattern becomes a finding when one dynamic artifact (file, capture, runtime observation) supports it'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'String literals resembling keys/tokens (prefixes: sk_, api_, AKIA, eyJ for JWT), internal hostnames (stage, dev, vpn, internal)',
              'Persistence calls adjacent to sensitive identifiers',
              'Crypto constants: kCCOptionECBMode, kCCAlgorithmDES/3DES, fixed IV arrays, MD5/SHA1 usage',
              'Trust-evaluation overrides and pinning implementations to inspect later',
              'Debug/testing branches: #if DEBUG residue in release, mock flags, feature gates'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Drill: take the four snippets above and produce, for each, a three-line finding skeleton: (1) claim ("X stores Y in Z"), (2) evidence (what file/string/capture), (3) impact ("reachable by W attacker because…"). Doing this for four patterns in ten minutes is the actual skill; decompilers and Frida are force multipliers on top of it. Keep the skeletons — they are the templates your module i24 report will expand.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'One pattern through the full pipeline. Shape: token in UserDefaults. Static: binary strings show "auth_token"; Info.plist confirms bundle id; decompiled write site confirms the call. Dynamic: container pull shows Library/Preferences/com.target.app.plist containing a live JWT; decode it (module i14 covers JWT structure) — expiry in 30 days. Finding: "Long-lived bearer token stored in unencrypted preferences; recoverable from unencrypted backups; 30-day window." Three sentences, fully evidenced, severity argued — from one recognized shape.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Pattern-hunting tools: strings/grep over the binary and resources (module i08), plutil for plists, a JWT decoder for tokens, and Frida for runtime confirmation. Static analyzers (e.g. MobSF-style tooling) accelerate the sweep but never replace the dynamic confirmation — your reports cite artifacts, not scanner output.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Filing every hardcoded string as a secret — test what the value actually authorizes',
              'Reporting scanner findings without dynamic confirmation — one false positive poisons report credibility',
              'Missing the legitimate-use corners and overclaiming severity',
              'Auditing only Swift code — ObjC, C, and resource/config files carry the same patterns'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Extend the field guide: add a fifth domain (Platform: deep links and WebViews) and write two pattern shapes for it from what module i01\u2019s comparison taught you (e.g. URL handler that loads arbitrary URLs into an in-app WebView). You will fill its evidence columns during modules i16–i17 — pre-seeding the checklist is deliberate.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Four recurring domains — secrets, storage, crypto, network — produce most iOS findings; the shapes are learnable',
            'Every finding needs static evidence plus one dynamic artifact; scanners are shortcuts, not citations',
            'Legitimate-use corners exist in every domain — nuance is what separates auditors from scanners',
            'Your audit checklist is the MASVS/MASTG index in disguise — keep them aligned'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i03-l03-q1',
          type: 'mcq',
          prompt: 'A hardcoded API key is found in a release binary. What determines whether it is a finding?',
          options: [
            'Its length — longer keys are worse',
            'What the key actually authorizes and the attacker position that reaches it',
            'The programming language it appears in',
            'Whether the app also uses the Keychain'
          ],
          answerIndex: 1,
          hint: 'A "finding" needs impact. What does this specific key unlock, and for whom?',
          explanation:
            'Public-by-design client keys may be non-issues (or low findings with hardening notes); a key that authorizes data access or billing actions is a real finding. Impact comes from privileges and reachability, not from the string\u2019s presence alone.'
        },
        {
          id: 'i03-l03-q2',
          type: 'truefalse',
          prompt: 'If a URLSession challenge handler always completes with .useCredential and the server\u2019s trust object, HTTPS interception by any network attacker becomes straightforward.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does that completion handler skip — whose certificate gets checked?',
          explanation:
            'True. Accepting the challenge\u2019s serverTrust without evaluation accepts whatever certificate the connection presents — including an attacker\u2019s. That is broken server trust evaluation, one of the most severe network findings on mobile.'
        },
        {
          id: 'i03-l03-q3',
          type: 'scenario',
          prompt:
            'Static sweep finds AES-ECB code with a compiled-in key, but the encrypted data appears to be only UI theme settings. What is the right finding posture?',
          hint: 'Impact follows what the ciphertext protects. Is there a finding at all?',
          explanation:
            'Report proportionately — or as a hardening note, not a vulnerability: weak crypto exists, but the protected data is non-sensitive. Overclaiming here is exactly how reports lose credibility; the same pattern on user PII would be a different (real) finding.'
        },
        {
          id: 'i03-l03-q4',
          type: 'mcq',
          prompt: 'Which sequence best reflects the cross-confirmation rule?',
          options: [
            'Run a static scanner → file everything it reports',
            'Observe pattern statically → confirm with one dynamic artifact → write finding with both evidences',
            'Hook everything with Frida first → read code later',
            'Report static patterns as "potential" and let the client decide'
          ],
          answerIndex: 1,
          hint: 'Findings cite artifacts. What is the minimal evidence pair?',
          explanation:
            'Static pattern plus one dynamic artifact (file, capture, runtime observation) is the minimum defensible evidence pair; scanners and hooks accelerate each step but never replace it.'
        }
      ],
      references: [
        {
          title: 'OWASP MASVS v2 — STORAGE/CRYPTO/NETWORK categories',
          url: 'https://mas.owasp.org/MASVS/',
          note: 'The standard your checklist shadows'
        },
        {
          title: 'OWASP MASTG — iOS tests index',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'Per-domain test families matching each pattern shape'
        },
        {
          title: 'Apple Developer — NSURLSession server trust (documented correct handling)',
          url: 'https://developer.apple.com/documentation/foundation/urlsession/1409000-urlsession',
          note: 'What correct challenge handling looks like — the contrast makes the insecure shape obvious'
        }
      ]
    },
    {
      id: 'i03-l04',
      moduleId: 'i03',
      title: 'Reading Crashes, Logs and Symbols',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['i03-l01', 'i03-l02'],
      objectives: [
        'Read an iOS crash report: faulting thread, exception type, frames, symbols',
        'Interpret console logs filtered for a target app',
        'Use symbolication concepts to move from crash addresses to named functions'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Crashes are conversations with the app. Force-unwrap a nil token, and iOS tells you exactly where. Feed a deep link the handler cannot parse, and the exception names the selector. A tester who reads crash reports navigates apps faster than one who only reads screens — and the same skill reads your own tooling\u2019s failures (a broken Frida script, a miswired proxy) instead of staring at them.'
          }
        ],
        technical: [
          { type: 'h', text: 'Anatomy of a crash report' },
          {
            type: 'code',
            lang: 'text',
            title: 'A trimmed crash report — the fields that matter',
            code:
              'Exception Type:  EXC_BAD_ACCESS (SIGSEGV)\nException Note:  SIMULATED (this is NOT a crash on the main thread)\nTermination Reason: Namespace SIGNAL, Code 11 Segmentation fault\nTriggered by Thread:  5\n\nThread 5 Crashed:\n0   TargetApp        0x1042c81ac $s9TargetApp12CryptoHelperC6decodeyySSF + 88\n1   TargetApp        0x1042b4f30 $s9TargetApp13SessionLoaderC4loadyyF + 152\n2   UIKitCore        0x18a4f2210 -[UIViewController _loadViewIfRequired] + 420\n...'
          },
          {
            type: 'list',
            items: [
              'Exception Type: SIGSEGV/SIGABRT/EXC_CRASH — bad memory vs assertion/abort; EXC_BAD_INSTRUCTION often traps (like force-unwrap or fatalError)',
              'Faulting thread: the numbered thread whose frames matter (main-thread annotations matter for UI logic)',
              'Frames: address + symbol. Demangled Swift names ($s…) or ObjC selectors ([Class method]) name the code directly',
              'Termination Reason on Jetsam kills: memory profile — distinguishes "your hook leaked" from "the app leaked"'
            ]
          },
          { type: 'h', text: 'Symbolication in one paragraph' },
          {
            type: 'p',
            text:
              'Addresses are meaningful only relative to the binary that owns them. Frames already carry symbols when the binary ships them (or when the system caches them); when you see bare addresses in your own tooling output, symbolication maps address → function via the binary\u2019s symbol table minus load address (ASLR slide). You will do this by hand once in module i09 (otool/nm) and let LLDB do it forever after (module i12). The skill worth keeping: knowing that a frame\u2019s first hex number minus the binary\u2019s load address is an offset you could look up — that is all "symbolication" ever was.'
          },
          { type: 'h', text: 'Console logs as the fast path' },
          {
            type: 'p',
            text:
              'Before crashes: logs. Console.app or log stream filtered by your target\u2019s process narrates launches, network failures, sandbox denials, keychain errors (errSecItemNotFound and friends) and custom NSLog/os_log output. Custom logs are dev-written breadcrumbs — the fastest route to understanding feature flow without touching a decompiler. Never underestimate "read what the app says about itself".'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Crash-to-lead: a crash in CryptoHelper.decode while fuzzing a deep link param names the code path worth decompiling next',
              'Log leakage is itself a finding: tokens/PII in os_log output are readable via device logs (module i13 covers the storage angle)',
              'Your tooling\u2019s crashes read the same way — diagnosing a bad hook address vs a bad argument type saves hours',
              'Jetsam vs watchdog terminations: misattributing kills to "anti-tamper" when the app simply ran out of memory is a classic analysis error'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Custom log prefixes in strings ("[SEC]", "AUTH", "DBG") that reveal internal log points',
              'Assertions (NSAssert/fatalError/precondition) near security checks — fail-closed vs fail-open matters',
              'Exception handlers that swallow errors silently (catch-all logging "error") — hidden failure paths',
              'Repeated crash clusters on specific screens in client crash dashboards (if shared) — fragile paths worth probing'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Crash-reading drill. Using the report above, answer: (1) which app function actually faulted, in which app class, called from which loader, on which thread? (2) is this a security-relevant path or UI plumbing? (3) what single input would you fuzz to re-trigger it deliberately? Answers: (1) CryptoHelper.decode called from SessionLoader.load on thread 5; (2) session/crypto path — highly relevant; (3) whatever feeds decode (a stored/captured blob or a deep-link param reaching the loader — trace upward). This Q/A habit converts any crash into a test plan in three lines.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'From crash to finding. Fuzzing a deep link with long id parameters crashes the app in DeepLinkRouter.parse with EXC_BAD_INSTRUCTION (Swift force-unwrap). Re-trigger: deterministic, same input every time. Impact argument: untrusted URL input crashes the app — a stability/DoS-shaped client finding (severity honest: low-to-medium, no data compromise), but the same parse path shows the router builds WebViews from params (module i17 territory). The crash was the door; the finding ended up being the router\u2019s unvalidated WebView navigation. Crashes locate code; judgment decides what the code means.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Console.app (device logs), log CLI on macOS, Xcode\u2019s organizer for device crash logs, symbolication via LLDB/atos when needed, and later Frida\u2019s exception reporting. Device crash reports also survive on-device (Settings → Privacy → Analytics) when a Mac is not attached.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading the crashing frame only — the caller frames usually explain why the input was wrong',
              'Misreading system frames as app logic (UIKit frames are plumbing; app frames are the story)',
              'Chasing crashes that are jetsam memory kills as if they were input-driven',
              'Ignoring logs because "logs are noise" — custom logs are often the fastest comprehension tool in the kit'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write, from memory, a five-frame fake crash for a hypothetical PaymentValidator.verify crashing on malformed JSON: include Exception Type, thread annotation and two app frames with plausible demangled names. Then write the three-line Q/A drill for it. Constructing one by hand is the fastest way to own the format.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Crash reports name the faulting thread and frames; symbols/demangling turn addresses into functions',
            'Symbolication is offset math you will do once by hand and let LLDB do forever',
            'Console logs are the app\u2019s self-narration — filter by process and read early',
            'Distinguish memory kills (jetsam) from input-driven crashes before writing any conclusion'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i03-l04-q1',
          type: 'mcq',
          prompt: 'EXC_BAD_INSTRUCTION on iOS most commonly indicates…',
          options: [
            'The kernel refused a syscall',
            'A trap such as a force-unwrap of nil or a failed precondition',
            'A network timeout',
            'Code signature invalidation'
          ],
          answerIndex: 1,
          hint: 'Swift\u2019s ! and preconditionFailure compile to what?',
          explanation:
            'Traps: deliberate fatal instructions from force-unwraps, precondition/fatalError, or similar assertions. Great leads — they mark code the developer considered impossible, now made possible by your input.'
        },
        {
          id: 'i03-l04-q2',
          type: 'truefalse',
          prompt: 'A crash report\u2019s top frame in UIKitCore means the app\u2019s own code contains the bug.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who called into UIKit, and where does the interesting logic usually live?',
          explanation:
            'False — usually. System frames are plumbing; walk down to the nearest app frame (your target\u2019s module) which is where the faulty logic and inputs live. (System-framework bugs exist, but app frames come first in triage.)'
        },
        {
          id: 'i03-l04-q3',
          type: 'scenario',
          prompt:
            'Your instrumented app dies while idle overnight. Log shows Jetsam event with high memory footprint. Was it anti-tamper?',
          hint: 'What does the termination namespace tell you about the cause?',
          explanation:
            'No — Jetsam is the system reclaiming memory; the report\u2019s termination reason states it. Check whether your own agent/hooking leaked (agents hold references) before blaming the app. Correct attribution keeps the analysis honest.'
        },
        {
          id: 'i03-l04-q4',
          type: 'mcq',
          prompt: 'What is symbolication, concretely?',
          options: [
            'Encrypting symbol names at build time',
            'Mapping runtime addresses to functions using the binary\u2019s symbol table and the process load address',
            'Downloading symbols from Apple\u2019s servers for app code',
            'Renaming variables in decompiled code'
          ],
          answerIndex: 1,
          hint: 'Frames carry addresses. What two things turn an address into a name?',
          explanation:
            'Address minus load slide gives a file offset; the symbol table maps offsets to function names. That is the whole mechanism — everything else is tooling convenience.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Analyzing crash reports',
          url: 'https://developer.apple.com/documentation/xcode/analyzing-a-crash-report',
          note: 'Official field-by-field crash anatomy'
        },
        {
          title: 'Apple Developer — Diagnosing issues using crash reports and device logs',
          url: 'https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs',
          note: 'Jetsam/watchdog termination reasons and log collection'
        },
        {
          title: 'Apple Developer — Reducing your app\u2019s memory use (jetsam context)',
          url: 'https://developer.apple.com/documentation/xcode/reducing-your-app-s-memory-use',
          note: 'Why memory kills happen and how they are reported'
        }
      ]
    }
  ]
};
