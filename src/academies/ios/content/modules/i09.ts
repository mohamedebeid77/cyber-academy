import type { Module } from '../../../../types';

// LEVEL 4 — STATIC ANALYSIS & RE · Module i09: Mach-O & iOS Reverse Engineering
// Original content synthesized from public Mach-O file format documentation,
// Apple tool documentation and OWASP MASTG RE chapters.

export const i09: Module = {
  id: 'i09',
  title: 'Mach-O & iOS Reverse Engineering',
  level: 4,
  description:
    'The binary beneath the bundle: Mach-O structure (headers, load commands, segments), metadata recovery for Objective-C and Swift, and the Ghidra-based workflow that turns disassembly into security findings. The deepest static module — take it slowly.',
  outcomes: [
    'Read a Mach-O: magic, header, load commands, segments and sections',
    'Recover ObjC/Swift metadata with otool, nm and dump tooling',
    'Drive a Ghidra analysis of an iOS binary and navigate decompiled functions',
    'Execute the full RE workflow from binary to a documented security finding'
  ],
  lessons: [
    {
      id: 'i09-l01',
      moduleId: 'i09',
      title: 'Mach-O: Headers, Load Commands, Segments',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i08-l02'],
      objectives: [
        'Describe the Mach-O file structure and the role of each region',
        'Read load commands with otool and explain what dyld does with them',
        'Explain fat binaries and architecture slices, and identify which you are holding'
      ],
      diagram: 'ios-macho-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every iOS executable — the app, every framework, every extension — is a Mach-O. It is the format ELF is to Linux and PE to Windows, with one tester-critical difference: it carries the code signature and the ObjC/Swift metadata inline. Reading its anatomy is not academic; every tool you use (otool, nm, Ghidra, Frida) is navigating these structures, and understanding them turns tool output from magic into text.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-macho-anatomy',
            caption: 'Interactive: the regions of a Mach-O and what a tester finds in each.'
          },
          { type: 'h', text: 'The anatomy, in order' },
          {
            type: 'list',
            items: [
              'Header: magic (0xfeedfacf for 64-bit), CPU type (arm64), file type (MH_EXECUTE / MH_DYLIB / MH_BUNDLE), and the count of load commands',
              'Load commands: the directory of everything else — segments, linked libraries (LC_LOAD_DYLIB), entry point (LC_MAIN), code signature (LC_CODE_SIGNATURE), minimum OS, rpath',
              'Segments and sections: __TEXT (executable code + read-only metadata: __text, __cstring, __objc_methname, __swift5_*), __DATA/__DATA_CONST (writable: ObjC class lists, __got), plus linkedit material',
              'Code signature: CodeDirectory page hashes + entitlements + CMS (module i06) — the last region, and the reason modifications break binaries'
            ]
          },
          { type: 'h', text: 'Reading it with tools' },
          {
            type: 'terminal',
            title: 'Mach-O inspection basics',
            lines: [
              '$ file Payload/TargetApp.app/TargetApp',
              'Payload/TargetApp.app/TargetApp: Mach-O 64-bit executable arm64',
              '$ otool -h Payload/TargetApp.app/TargetApp      # header',
              '          magic cputype cpusubtype  caps filetype ncmds sizeofcmds flags',
              '  0xfeedfacf 16777228          0  0x00          2    78     9432 0x00218085',
              '$ otool -l Payload/TargetApp.app/TargetApp | grep -A2 LOAD_DYLIB | head -20',
              '          cmd LC_LOAD_DYLIB',
              '      cmdsize 88',
              '         name /System/Library/Frameworks/Security.framework/Security (…)',
              '$ otool -l Payload/TargetApp.app/TargetApp | grep -A3 __TEXT | head -10',
              'Section',
              '  sectname __text',
              '   segname __TEXT',
              '$ vtool -show Payload/TargetApp.app/TargetApp    # min OS / platform'
            ]
          },
          { type: 'h', text: 'What dyld does with load commands' },
          {
            type: 'p',
            text:
              'At launch, dyld (the dynamic linker) reads the load commands: it maps each segment at its stated virtual addresses, loads each LC_LOAD_DYLIB library (resolving through the dyld shared cache — the pre-linked system library store that makes system frameworks not exist as files you can pull), applies fix-ups, and jumps to LC_MAIN. Security consequences you will meet later: LC_LOAD_DYLIB lists tell you what code runs alongside the app (SDK inventory corroborated); the shared cache means system code is not in the IPA — RE of system frameworks happens against extracted cache slices, which is research territory, not assessment territory.'
          },
          { type: 'h', text: 'Fat binaries and slices' },
          {
            type: 'p',
            text:
              'A fat (universal) binary concatenates one Mach-O per architecture with a fat header indexing offsets. Device builds: arm64 (and arm64e on some platform binaries). Simulator builds: x86_64 (Intel Macs) or arm64 with a simulator platform marker. file(1) names what you hold; for fat files, extract or select slices with lipo -thin. Testing note: a binary holding only device slices will not run in the simulator — module i07\u2019s install failures explained at the format level.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Load-command reading is SDK and capability inventory (i08-l02 corroborated at the format level): linked security/crypto/web libraries predict behavior',
              'Section knowledge powers targeted extraction: __cstring/__objc_methname are the strings sweep\u2019s actual sources; __objc_classlist is class-dump\u2019s input',
              'Signature location explains patching mechanics (i22): modify a page → its hash in the trailing CodeDirectory mismatches → kill',
              'Fat/slice awareness prevents environment mistakes (sim vs device) and wasted RE effort on the wrong slice'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Unexpected LC_LOAD_DYLIB entries (embedding your own dylibs is common; unexpected ones deserve the SDK question)',
              'LC_RPATH and @rpath/@executable_path patterns revealing plugin-style architecture',
              'Missing LC_CODE_SIGNATURE on artifacts that claim to be installable (re-signed-wrong or corrupted — provenance flag)',
              'Min-OS vs feature claims: binaries claiming modern SDK behaviors with old minimums — feature/behavior mismatches worth testing'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Identify your target\u2019s slice (file), header (otool -h), and the full load-command map (otool -l, summarized)',
              'Extract the three inventories: LC_LOAD_DYLIB list (libraries), __cstring/__objc_methname samples (metadata), segment layout (vm addresses — you will reuse them in Frida/LLDB address math)',
              'Corroborate i08\u2019s SDK table against LC_LOAD_DYLIB — discrepancies (SDK present in Frameworks/ but not linked, or vice versa) are analysis notes',
              'Record the __TEXT vm address range — module i11/i12 need it for address math (slide calculations)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Format knowledge catching a mistake early. A trainee spends an afternoon decompiling a binary that "behaves oddly in the simulator." file shows: Mach-O 64-bit executable arm64 — device-only slice. The simulator had been silently refusing/failing to run it and the trainee analyzed a different build entirely. Two minutes of format literacy (file + vtool) prevented a day of wrong-context analysis. The anatomy is not trivia; it is what makes every later tool output trustworthy.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'file, otool, nm, vtool, lipo (macOS built-ins), rizin/radare2 and LLVM tools (llvm-objdump) cross-platform. Ghidra enters next lesson for decompilation. GUI Mach-O viewers exist (e.g. Hopper\u2019s loader view) — same structures, prettier frames.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating the shared cache as missing files: system frameworks are pre-linked into a cache — their absence from the IPA is normal',
              'Analyzing the wrong slice of a fat binary (sim vs device) and drawing environment-wrong conclusions',
              'Confusing segments with sections: segments are memory regions; sections are their contents — tools speak both vocabularies',
              'Assuming all iOS binaries are fat — modern device builds are usually thin arm64; fatness is build-configuration dependent'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce a one-page Mach-O profile of your training binary: slice, header fields, the LC_LOAD_DYLIB list, __TEXT/__DATA vm ranges, min-OS, and signature presence. Then write two sentences on what that profile predicts about the app\u2019s runtime dependencies. You will reuse the vm ranges in module i11\u2019s address math — keep the page.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Mach-O = header + load commands + segments/sections + trailing signature; every tool reads this map',
            'LC_LOAD_DYLIB is the dependency X-ray; __TEXT sections hold the literals and ObjC metadata your sweeps mine',
            'dyld consumes load commands at launch; the shared cache replaces on-disk system frameworks',
            'Slice discipline (arm64 device vs sim slices) prevents environment-wrong analysis'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i09-l01-q1',
          type: 'mcq',
          prompt: 'Which load command tells dyld which external frameworks the binary requires?',
          options: ['LC_MAIN', 'LC_LOAD_DYLIB', 'LC_CODE_SIGNATURE', 'LC_SEGMENT_64'],
          answerIndex: 1,
          hint: 'One command per linked library — which name says "load dylib"?',
          explanation:
            'LC_LOAD_DYLIB names each required library (frameworks, embedded dylibs). LC_MAIN is the entry point; LC_CODE_SIGNATURE locates the signature; LC_SEGMENT_64 maps memory regions.'
        },
        {
          id: 'i09-l01-q2',
          type: 'truefalse',
          prompt: 'System frameworks like Foundation appear as files inside the app bundle because the binary links them.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where does system library code physically live on modern iOS?',
          explanation:
            'False — system libraries are pre-linked into the dyld shared cache on the device; the IPA contains only the app\u2019s own code. RE of system frameworks means extracting cache slices — research workflows outside normal app assessments.'
        },
        {
          id: 'i09-l01-q3',
          type: 'scenario',
          prompt:
            'file reports "Mach-O universal binary with 2 architectures: [arm64] [x86_64]". Which slice runs on a physical iPhone, and which in the simulator on an Intel Mac?',
          hint: 'CPU type per slice — match it to the environment hardware.',
          explanation:
            'arm64 runs on the device (ARM CPUs); x86_64 is the Intel-simulator slice. Use lipo -thin to extract the slice you intend to analyze — analyzing both at once (or the wrong one) is a classic environment-context error.'
        },
        {
          id: 'i09-l01-q4',
          type: 'mcq',
          prompt: 'Why does the code signature sit at the END of the Mach-O (as LC_CODE_SIGNATURE)?',
          options: [
            'Historical accident with no significance',
            'The signature hashes the preceding content — trailing placement lets the CodeDirectory cover the whole binary',
            'Because entitlements must load last',
            'To defeat strings extraction'
          ],
          answerIndex: 1,
          hint: 'What does the CodeDirectory need to exist after — and what does that ordering enable?',
          explanation:
            'The CodeDirectory\u2019s page hashes cover the binary\u2019s content; placement as a trailing load command keeps the covered content stable before the signature. Modification of any covered byte breaks a page hash — the enforcement mechanics from module i06.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Mach-O file format reference (via open source docs)',
          url: 'https://github.com/apple-oss-distributions/xnu/blob/main/EXTERNAL_HEADERS/mach-o/loader.h',
          note: 'The authoritative structures: headers, load commands, segments'
        },
        {
          title: 'Apple Developer — otool manual',
          url: 'https://www.unix.com/man-page/osx/1/otool/',
          note: 'The inspection tool used throughout this lesson'
        },
        {
          title: 'Apple Developer — Running apps on different architectures (slices)',
          url: 'https://developer.apple.com/documentation/xcode/building-a-multiplatform-app',
          note: 'Build-time slice semantics behind fat binaries'
        }
      ]
    },
    {
      id: 'i09-l02',
      moduleId: 'i09',
      title: 'Metadata Recovery: ObjC Classes, Swift Symbols, Strings',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i09-l01', 'i03-l01', 'i03-l02'],
      objectives: [
        'Recover the ObjC class/method surface from the binary with otool and dump tooling',
        'Demangle Swift symbols and interpret the Swift metadata surface honestly',
        'Turn recovered metadata into the decompilation target list'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Decompilation without metadata is archaeology; with metadata, it is guided surgery. iOS binaries hand you more metadata than any other platform: ObjC class/method names are runtime-required (module i03-l02), Swift symbols demangle to readable signatures, and selector strings survive stripping. This lesson extracts that surface into the target list your decompiler session will follow.'
          }
        ],
        technical: [
          { type: 'h', text: 'ObjC metadata recovery' },
          {
            type: 'terminal',
            title: 'ObjC surface from the binary',
            lines: [
              '# class/method inventory via otool',
              '$ otool -oV Payload/TargetApp.app/TargetApp > objc-metadata.txt',
              '$ grep -E "name|imp" objc-metadata.txt | head -40',
              '# modern structured dump (community tools, e.g. dsdump / class-dump successors)',
              '$ dsdump --objc Payload/TargetApp.app/TargetApp > classes.txt',
              '--- LoginManager (0x…) : NSObject',
              '    - (BOOL) validateUser:(NSString*)user password:(NSString*)pwd  (imp 0x1042…)',
              '    @property token (NSString*)',
              '# selector strings (always present)',
              '$ strings -arch arm64 Payload/TargetApp.app/TargetApp | grep -E "^[a-z]+[A-Z]" | head -30'
            ]
          },
          { type: 'h', text: 'Swift surface, honestly' },
          {
            type: 'list',
            items: [
              'Mangled symbols demangle: swift demangle (or Ghidra\u2019s Swift analyzer) turns $s4MyApp12SessionManagerC4loadyyF into MyApp.SessionManager.load() — names, argument types, returns',
              'Swift metadata sections (__swift5_types, field descriptors) let modern tools reconstruct type shapes — but pure-Swift code has NO ObjC runtime presence: method names do not appear as selectors',
              'Practical split: ObjC-visible surface (subclassing NSObject, @objc members) dumps beautifully; Swift-only internals show as demangled symbols + metadata — enough to navigate, less readable than ObjC',
              'The mix is the norm: most real apps are Swift with heavy ObjC-facing framework integration — dump both surfaces and merge'
            ]
          },
          { type: 'h', text: 'From metadata to target list' },
          {
            type: 'p',
            text:
              'The deliverable is a prioritized function list, not a curiosity dump. Rank by the audit map from module i08: token/session/crypto vocabularies first (i13/i18), network construction (URLSession usage, request builders) second (i14), URL/WebView handlers third (i16/i17), detection/anti-analysis vocabularies fourth (i21). For each target: class, method, imp address (from the dump), and the question you hope the decompilation answers. An address plus a question is a decompilation session; a curiosity dump is not.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The class dump doubles as a Frida hooking map (module i11): selectors you see in metadata are hookable by name at runtime',
              'Imp addresses feed both decompilation navigation and native Frida Interceptor.attach targets',
              'Swift/ObjC surface split predicts instrumentation strategy before you fight it at runtime (Swift-only → native hooks; ObjC → bridge hooks)',
              'Metadata that should NOT be there (test classes, mock validators, debug managers) is release-hygiene evidence — the same finding family as strings leaks'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Class vocabularies: Manager/Validator/Checker/Service suffixes cluster security logic',
              'Selectors containing Debug/Test/Mock/Bypass — hygiene findings and instrumentation handles',
              'Categories on framework classes (NSString+Crypto etc.) — the app\u2019s crypto wrappers (i18 targets)',
              'Swift symbols for request builders and token refresh paths — demangle them into the target list',
              'Duplicated/legacy classes (OldAuthManager, LoginVC2) — dead code that still executes paths worth mapping'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Dump the ObjC surface (otool -oV plus a structured dump tool if installed) and the Swift symbol surface (nm + demangle)',
              'Merge into one class inventory with per-method imp addresses where available',
              'Rank into the target list using the audit map; write the one-line question per target',
              'Cross-reference module i08\u2019s flag/secret strings with classes — string-to-class attribution makes findings concrete (which class reads the suspicious key?)',
              'Sanity-check the split: how much of your list is ObjC vs Swift-only? That ratio previews your Frida strategy in module i11'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Metadata answering a static question. The sweep (i08-l03) found flag "mockAuthEnabled" with no owner. The class dump shows MockAuthManager with methods validateMock: and loadOverrides:, imp at 0x1042f1000. Now the decompilation session has a target and a question ("who calls loadOverrides and where does the override data come from?"), the Frida session has a hook handle (validateMock:), and the report has an attribution ("MockAuthManager, imp 0x…"). The flag moved from mystery to triaged finding in one dump — metadata recovery is the connective tissue of the whole static workflow.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'otool (built-in), community dump tools (dsdump and class-dump successors — verify current maintenance, as this tooling churns), swift demangle / Ghidra\u2019s Swift analyzer, and rizin/radare2 for non-macOS metadata reading. Tool churn note: prefer tools that read the binary file; runtime-enumeration tools belong to module i11.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Expecting pure-Swift methods as selectors — they are not ObjC objects until bridged; the surface split is structural, not tool failure',
              'Dumping without ranking — metadata without the audit-map filter produces browsing, not findings',
              'Trusting demangled Swift signatures as complete type information — they are close, not exact; decompilation confirms',
              'Ignoring imp addresses — they are the join key between metadata, decompilers and Frida'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Produce the merged class inventory and the ranked target list (minimum eight targets with one-line questions) for your training app. Mark each target ObjC or Swift-only. Keep the list — module i11 will hook the top three, and i09-l03 will decompile them; the list is the spine of both.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'ObjC metadata (classes, selectors, imps) is runtime-required and dumpable; Swift symbols demangle to readable names',
            'The ObjC/Swift surface split predicts instrumentation strategy — dump both and merge',
            'The deliverable is a ranked target list (address + question), not a curiosity dump',
            'Imp addresses are the join key across decompilers, Frida and reports'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i09-l02-q1',
          type: 'mcq',
          prompt: 'Why do ObjC class and method names survive symbol stripping while many local symbol names do not?',
          options: [
            'Stripping tools have an ObjC exception flag',
            'The ObjC runtime needs them at runtime for dispatch — they are structural data, not debug info',
            'They are stored in a separate unstripped section by policy',
            'They are encrypted'
          ],
          answerIndex: 1,
          hint: 'What would break if a selector name vanished from __objc_methname?',
          explanation:
            'Dispatch resolves messages by name against class metadata — the names are load-bearing runtime data. Stripping removes debug/local symbols; it cannot remove what the runtime requires to function.'
        },
        {
          id: 'i09-l02-q2',
          type: 'truefalse',
          prompt: 'Swift-only methods appear in ObjC class dumps as selectors, just with mangled names.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Which runtime owns selector dispatch — and does pure Swift participate?',
          explanation:
            'False. Pure Swift types are not ObjC objects; their methods dispatch statically or via Swift vtables and never enter ObjC metadata. Only @objc-exposed members appear — the surface split from module i03-l01.'
        },
        {
          id: 'i09-l02-q3',
          type: 'scenario',
          prompt:
            'Your target list contains "SessionLoader.load, Swift-only, imp 0x1042b4f30". What does that row give you in modules i09-l03 and i11 respectively?',
          hint: 'One address, two consumers. What does each tool do with it?',
          explanation:
            'i09-l03: navigate the decompiler to that address for the decompiled function (question: what does load write where?). i11: a native Interceptor.attach target — Swift-only code cannot be hooked via the ObjC bridge, but the address works regardless. Same row, two tools — that is why addresses live in the list.'
        },
        {
          id: 'i09-l02-q4',
          type: 'mcq',
          prompt: 'A class dump reveals "DebugCredentialManager" in a release binary. Best classification?',
          options: [
            'Noise — unused classes are common',
            'Release-hygiene evidence and a static finding lead: debug credential logic shipping to users',
            'Proof of a backdoor by itself',
            'A Swift-only artifact with no report relevance'
          ],
          answerIndex: 1,
          hint: 'What does its presence prove, and what remains to be shown before the word "backdoor" is earned?',
          explanation:
            'Debug code in release builds is a hygiene finding lead; its severity depends on reachability (who calls it, with what inputs) — shown by decompilation and dynamic testing. "Backdoor" requires demonstrating the reachable path, not the class name.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Objective-C runtime metadata (otool -o output)',
          url: 'https://developer.apple.com/documentation/objectivec',
          note: 'The metadata structures otool renders'
        },
        {
          title: 'Swift.org — Demangling (swift demangle)',
          url: 'https://github.com/swiftlang/swift/blob/main/docs/ABI/Mangling.rst',
          note: 'Symbol mangling/demangling reference'
        },
        {
          title: 'OWASP MASTG — iOS static analysis and RE techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s metadata recovery chapters'
        }
      ]
    },
    {
      id: 'i09-l03',
      moduleId: 'i09',
      title: 'Disassembly and Decompilation with Ghidra',
      difficulty: 'Advanced',
      minutes: 28,
      prerequisites: ['i09-l02'],
      objectives: [
        'Set up Ghidra for an iOS binary and drive a targeted analysis session',
        'Navigate between decompiled pseudo-C, disassembly and cross-references',
        'Extract defensible logic conclusions from decompiler output — and know its traps'
      ],
      diagram: undefined,
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The decompiler is where iOS reverse engineering stops feeling like archaeology: ARM64 machine code becomes pseudo-C you can read. Ghidra (free, NSA-built) is this curriculum\u2019s tool: capable enough for professional iOS work, and — more importantly for learning — honest about what decompilation is: a reconstruction with opinions. This lesson teaches the session discipline: targeted functions, cross-references, and the traps that turn decompiler output into false findings.'
          }
        ],
        technical: [
          { type: 'h', text: 'Session setup' },
          {
            type: 'list',
            items: [
              'Import the (extracted, correct-slice) binary into a Ghidra project; let the initial analysis run (auto-analysis covers ARM64 by default)',
              'Enable the Swift demangler analyzer for Swift binaries; apply ObjC metadata (Ghidra\u2019s loader reads much of it; community dump scripts supplement)',
              'Land on a target from your i09-l02 list: Symbol Tree → filter by class/symbol, or navigate to the imp address directly',
              'Side-by-side workflow: decompiled window (read), listing (verify), cross-references (context)'
            ]
          },
          { type: 'h', text: 'Reading decompiled output' },
          {
            type: 'code',
            lang: 'c',
            title: 'What Ghidra shows for a security-relevant function (annotated reading)',
            code:
              '// pseudo-C for a pinning-ish helper — READ for shape, not exactness\nundefined8 TargetApp::evaluateChallenge(SecTrustRef trust) {\n  int ok;\n  ok = _SecTrustEvaluateWithError(trust, 0);          // system call — names are real\n  if (ok == 1) {\n    return 1;                                          // accept\n  }\n  return _isPinnedHost(_currentHost());                // app logic — follow the call\n}\n// READING RULES:\n// - System framework names (SecTrust*, NSURLSession*) are reliable anchors\n// - ObjC method calls appear as objc_msgSend patterns with selectors nearby\n// - Conditionals/returns are trustworthy in shape; exact types often are not\n// - Always confirm a conclusion in the listing (machine code) before reporting'
          },
          { type: 'h', text: 'The navigation moves' },
          {
            type: 'list',
            items: [
              'Cross-references TO a function: who calls it (context: is this reachable from user input?)',
              'Cross-references FROM: what it touches (storage calls? network calls? crypto?)',
              'String references: decompiler-adjacent strings often carry the feature\u2019s vocabulary (keys, endpoints, flags)',
              'Data type declarations: retype obvious things (NSString*, SecTrustRef) as you learn them — the pseudo-C gets cleaner each pass',
              'Function comparison: for flag-gated logic, compare callers/branches to see what toggles what'
            ]
          },
          { type: 'h', text: 'The traps' },
          {
            type: 'list',
            items: [
              ' objc_msgSend noise: ObjC calls route through one dispatcher — decompilers show msgSend calls with selector args; read the selector, not the dispatcher, or you will misread control flow',
              'Compiler optimizations: inlined helpers, reordered branches, merged conditions — the pseudo-C is a reconstruction, not the source',
              'Type confusion: wrong parameter types produce plausible nonsense — verify shape against runtime evidence when it matters',
              'The biggest trap: reporting from pseudo-C alone. The rule this curriculum enforces: decompilation locates and explains; dynamic evidence (i10–i17) proves. A finding\u2019s proof is never "Ghidra showed me".'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Target-list discipline (i09-l02) pays here: each session answers one question with one function and its xrefs — sessions stay under an hour and produce report-grade paragraphs',
              'The decompiler is the crypto-audit microscope (module i18): algorithm constants, key handling and mode selection become visible as calls and literals',
              'Anti-analysis logic (i21) reads clearly in decompilation: detection functions cluster around sysctl/ptrace/path-probing calls',
              'Efficiency habit: annotate as you go (rename functions, comment conclusions) — your Ghidra project becomes the engagement\u2019s RE memory'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Functions taking user-influenced input (deep link params, network data) flowing into WebView loaders, file paths or command-shaped strings — the i16/i17 pipes',
              'Comparison literals that look like secrets (memcmp against fixed data, string equality against constants)',
              'Storage decisions visible as calls (SecItemAdd, NSUserDefaults setters) with the data argument\u2019s provenance',
              'Detection vocabularies clustered in one function (jailbreak checks) — map the whole surface, not one probe (i21\u2019s rule)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Run the Ghidra session on your top three i09-l02 targets (one question each)',
              'For each: read the pseudo-C, check both cross-reference directions, verify the key conclusion in the listing',
              'Write the three report-grade paragraphs (one per target): function, behavior, question answered, dynamic confirmation needed',
              'Annotate your Ghidra project (renames/comments) — it is now part of the evidence bundle',
              'Honestly score each conclusion: which are listing-verified vs pseudo-C-only? The latter are the dynamic queue\u2019s top entries'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A session that produced a finding. Target: "validateChallenge — does the pinning wrapper actually pin?" Decompilation shows evaluateChallenge comparing SecCertificateCopyKey-derived key data against a bundle-loaded certificate for one condition, but an early-return accepting when a plist flag is set. Listing-verified: the early return exists. Report paragraph: "Server trust evaluation includes a configuration-controlled early-accept path (flag X); when set, arbitrary certificates are accepted. Decompile evidence: function Y, early return verified in listing. Dynamic confirmation: exercise flag path (i14/i16 queue)." The decompiler located the logic; the discipline made it a finding rather than a screenshot.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Ghidra (free; install the current release — Swift/ObjC analyzer quality improves release over release). Hopper (macOS-native, excellent loader UI — same discipline transfers). IDA Pro if licensed. The skills are tool-portable: target list, xrefs, listing verification.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Browsing instead of targeting — sessions without the i09-l02 list produce hours of scrolling and no paragraphs',
              'Reporting from pseudo-C without listing verification (the discipline rule above)',
              'Misreading objc_msgSend-centered control flow — follow selectors and their classes, not the dispatcher',
              'Ignoring compiler-generated helpers (chasms, stubs) as if they were app logic — check symbol provenance before interpreting'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete one full Ghidra session on your top-ranked target and write the report-grade paragraph. Then do the honesty score: which single claim in your paragraph is pseudo-C-only? That claim is your best dynamic-queue entry — write it into module i10\u2019s opening list before the feeling fades.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Ghidra turns ARM64 into readable pseudo-C — targeted sessions (one function, one question) make it report-grade',
            'Cross-references both directions + listing verification are the two navigation/verification moves that matter',
            'objc_msgSend noise, optimizations and type confusion are the standing traps — read selectors, verify in listing',
            'Decompilation locates and explains; dynamic evidence proves — the rule that keeps RE findings defensible'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i09-l03-q1',
          type: 'mcq',
          prompt: 'In decompiled ObjC code, why do you see repeated calls to objc_msgSend rather than the method names?',
          options: [
            'The decompiler failed to analyze ObjC',
            'ObjC dispatch routes all calls through objc_msgSend with the selector as an argument — read the selectors, not the dispatcher',
            'The binary was compiled without optimizations',
            'Method names are stripped'
          ],
          answerIndex: 1,
          hint: 'What did module i03-l02 establish about how ObjC calls work?',
          explanation:
            'Every ObjC call is a message send: objc_msgSend(receiver, selector, args…). The decompiler shows the dispatcher; the selector argument (and nearby class refs) carry the meaning. Reading the dispatcher as logic is the classic misreading.'
        },
        {
          id: 'i09-l03-q2',
          type: 'truefalse',
          prompt: 'A finding may be reported when decompiled pseudo-C clearly shows the insecure logic, even before dynamic confirmation.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What is this curriculum\u2019s standing rule about decompilation and proof?',
          explanation:
            'False — decompilation locates and explains; dynamic evidence proves. Pseudo-C-only claims go to the dynamic queue with expected evidence. (Findings sections may describe the code logic — the validated severity and exploitability wait for the artifact.)'
        },
        {
          id: 'i09-l03-q3',
          type: 'scenario',
          prompt:
            'Decompiled output shows a function whose parameters render as undefined8 and whose logic looks implausible. What are your two verification moves?',
          hint: 'Type confusion is the named trap — what fixes types, and what verifies shape?',
          explanation:
            '(1) Retype: correct the parameter/return types from metadata (selector signatures, known framework types) and re-read; (2) verify in the listing: confirm the machine-code shape (calls, branches) supports the logic. If both hold, the logic is real; if not, the reading was reconstruction noise.'
        },
        {
          id: 'i09-l03-q4',
          type: 'mcq',
          prompt: 'What makes cross-references TO a function valuable in security analysis?',
          options: [
            'They show the function\u2019s own imports',
            'They reveal callers — i.e., whether user-influenced input can reach the logic (reachability)',
            'They rename the function automatically',
            'They list entitlements'
          ],
          answerIndex: 1,
          hint: 'A vulnerability needs a path from attacker-controlled data. What do TO-references sketch?',
          explanation:
            'TO-references map reachability: who calls this, under what conditions, and (walking up) whether user input arrives. A dangerous function with no reachable caller is hardening context; a dangerous one reached from URL handling is a finding.'
        }
      ],
      references: [
        {
          title: 'Ghidra documentation',
          url: 'https://ghidra-sre.org/',
          note: 'Install current release; read the ARM64 analyzer notes'
        },
        {
          title: 'OWASP MASTG — iOS reverse engineering chapters',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s RE tooling and workflow chapters'
        },
        {
          title: 'Apple Developer — objc_msgSend documentation',
          url: 'https://developer.apple.com/documentation/objectivec/1456712-objc_msgsend',
          note: 'The dispatcher whose shape dominates decompiled ObjC'
        }
      ]
    },
    {
      id: 'i09-l04',
      moduleId: 'i09',
      title: 'The RE Workflow: From Binary to Security Finding',
      difficulty: 'Advanced',
      minutes: 25,
      prerequisites: ['i09-l03'],
      objectives: [
        'Execute the complete RE workflow end to end on a training target',
        'Integrate RE output with the static findings document and dynamic queue',
        'Know the module\u2019s boundaries: what RE claims, what it defers, what it never does'
      ],
      diagram: 'ios-re-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Modules i08/i09 taught pieces — sweep, metadata, decompilation. This lesson assembles them into the repeatable workflow you will run on every engagement: binary in, ranked questions out, findings drafts queued for dynamic proof. It also states the module\u2019s honest boundaries: RE explains code; it does not, by itself, prove exploitability, and it never substitutes for authorization scope.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-re-workflow',
            caption: 'The pipeline: every stage produces an artifact the next consumes.'
          },
          { type: 'h', text: 'The workflow, staged' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Stage 1 — Identity (i08-l01/i09-l01): acquisition record, hash, slice, Mach-O profile. Artifact: profile page',
              'Stage 2 — Sweep (i08-l02): strings/symbols/SDKs. Artifacts: four tables',
              'Stage 3 — Metadata (i09-l02): class dumps, merged inventory. Artifact: ranked target list with imps and questions',
              'Stage 4 — Decompile (i09-l03): per-target sessions, listing-verified conclusions. Artifacts: report-grade paragraphs, annotated project',
              'Stage 5 — Integrate (this lesson): findings drafts into the static document, dynamic queue updated with expected evidence, evidence bundle versioned'
            ]
          },
          { type: 'h', text: 'The boundaries, stated' },
          {
            type: 'list',
            items: [
              'RE claims: code behavior (what this function does, what reaches it statically)',
              'RE defers: exploitability, severity under real conditions, cross-component interaction — those need dynamic evidence (i10–i17)',
              'RE never does: replaces authorization scope (RE of artifacts outside scope is testing outside scope), substitutes for the confirmation queue, or argues from pseudo-C alone',
              'Time-box reality: on engagements, RE is expensive — the ranked-list discipline exists so its hours land on the questions that matter'
            ]
          },
          { type: 'h', text: 'The integration formats' },
          {
            type: 'list',
            items: [
              'Findings draft format: claim / static evidence (file, function, imp) / question for dynamic proof / expected artifact — same skeleton as module i03-l03\u2019s patterns, now RE-backed',
              'Queue update: every RE paragraph adds or reprioritizes queue entries (i11 hooks, i14 captures, i16 surface tests)',
              'Evidence bundle: acquisition record + sweep outputs + dumps + Ghidra project export + this document — one folder, one hash manifest'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'The workflow is the static half of the capstone (module i24) — running it cleanly on a training target now means the capstone rehearses assembly, not technique',
              'RE paragraphs are report gold when disciplined: exact functions, exact addresses, exact questions — and worthless when they browse',
              'The queue handoff is where static and dynamic analysis stop being silos: hooks chosen in i11 exist because RE named them',
              'Boundary-keeping protects you: every RE-backed claim states its evidence class — reviewers can then weigh it honestly'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Workflow drift: sessions that abandon the target list (browsing) or skip listing verification — the two drift patterns that destroy RE value',
              'Unclaimed metadata: dumps that never became targets (stage 3 output unused) — the most common incompleteness in trainee work',
              'Queue entries without expected artifacts — stage 5\u2019s completeness check',
              'Scope creep in RE: curiosity about unrelated components — note it, park it, keep the engagement\u2019s scope ledger clean'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Run the full workflow on your training app, end to end, with the time-box on your side: 30 minutes staged 1–3, 60 minutes staged 4, 20 minutes staged 5. The deliverable set: Mach-O profile, four sweep tables, target list, three verified RE paragraphs, updated static document, updated dynamic queue, hashed evidence bundle. If any stage ran over, note WHY — the failure modes (browsing, missing metadata, scope creep) are each named above, and self-diagnosis is the lesson\u2019s actual exercise.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'The one-page rule',
            text:
              'If your RE output cannot be summarized in one page (targets, paragraphs, queue), it is not yet analysis — it is exploration. Summarizing forces the classification that makes hours of work legible to clients and to your own next session.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A completed workflow, compressed. Training bank app: profile (arm64, 12 load-commands\u2019 frameworks incl. CryptoKit); sweep (3 endpoints, 1 flag "allowWeakPin", 2 SDKs); target list (8, top: PinValidator.objc, SessionLoader.swift, MockAuthManager.objc); three paragraphs (pin validator carries plist-gated early-accept [listing-verified]; SessionLoader writes token to UserDefaults [xref-verified]; MockAuthManager reachable only via debug flag [xref-verified, severity note]); queue: hook PinValidator (i11), capture login + flag-path (i14), storage pull (i13). One page, five artifacts, two findings drafts, three queue entries — a morning\u2019s static work, honestly bounded.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Everything from i08/i09 plus your document editor and a hash manifest tool. The workflow\u2019s tooling is deliberately stable from here — modules i10–i24 reuse it, which is why this lesson insists on the formats.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping stage 5 (integration) — the most common failure; RE output that never joins the document and queue evaporates',
              'Reporting RE-backed exploitability claims — the boundary violation reviewers catch first',
              'Untime-boxed sessions on engagements — curiosity spending client hours; the ranked list is the budget',
              'Evidence bundles without hash manifests — the reproducibility chain from module i08-l01 ends here if you let it'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the time-boxed workflow above and write the one-page summary. Then grade your own workflow against the five drift patterns listed — which one bit you, and what will you change next session? That self-diagnosis, in writing, is the deliverable that makes this lesson stick.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Five staged artifacts — profile, tables, target list, paragraphs, integrated document — make RE repeatable',
            'RE claims code behavior; dynamic modules prove conditions — the boundary keeps findings defensible',
            'The queue handoff is where static and dynamic analysis integrate; hooks and captures exist because RE named them',
            'One page, hashed evidence, time-boxed sessions — the professional RE habit set'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i09-l04-q1',
          type: 'mcq',
          prompt: 'Which statement is a defensible RE-stage claim?',
          options: [
            'This function is exploitable by a remote attacker',
            'This function, at imp 0x…, compares trust evaluation results and contains a plist-gated early-accept (verified in listing)',
            'The app is vulnerable because Ghidra shows weak logic',
            'This code is definitely reachable from deep links'
          ],
          answerIndex: 1,
          hint: 'What did stage-4 discipline say about claims and their evidence class?',
          explanation:
            'Option 2 states behavior, location, and evidence class (listing-verified) without claiming conditions or exploitability. Exploitability and reachability are dynamic-stage claims (i10–i17) or explicitly labeled static-reachability analyses with their own caveats.'
        },
        {
          id: 'i09-l04-q2',
          type: 'truefalse',
          prompt: 'RE sessions during an engagement may wander into interesting components outside the test scope as long as no findings are filed.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does authorization cover — the activity or the artifact?',
          explanation:
            'False. Scope covers the activity on the artifacts; analyzing out-of-scope components is out-of-scope work regardless of reporting. Park curiosity in the notes for scope conversations — the boundary is professional hygiene, not paperwork.'
        },
        {
          id: 'i09-l04-q3',
          type: 'scenario',
          prompt:
            'Your stage 4 ran 3 hours instead of 1 and produced no paragraphs. Name the drift pattern and the structural fix.',
          hint: 'What was the input to stage 4, and what constrains its sessions?',
          explanation:
            'Browsing drift: sessions without the ranked target list and one-question discipline. Structural fix: enforce stage 3 output (list with imps and questions) before any decompiler opens, and time-box each session to one target. The workflow\u2019s stages exist precisely to prevent this failure.'
        },
        {
          id: 'i09-l04-q4',
          type: 'mcq',
          prompt: 'What does the dynamic-confirmation queue gain from RE paragraphs?',
          options: [
            'Nothing — they are separate documents',
            'Named hook/capture targets with expected evidence — the static work chooses what dynamic tests run',
            'Automatic severity scores',
            'A substitute for dynamic testing'
          ],
          answerIndex: 1,
          hint: 'Why did stage 5 update the queue at all?',
          explanation:
            'RE names the exact functions and paths dynamic modules should observe (hook PinValidator, capture the flag-path request, pull the plist). That handoff is what makes i10–i17 targeted instead of exploratory — the integration is the workflow\u2019s point.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — iOS reverse engineering techniques',
          url: 'https://mas.owasp.org/MASTG/iOS/',
          note: 'The guide\u2019s RE chapters — the workflow\u2019s source discipline'
        },
        {
          title: 'Ghidra documentation',
          url: 'https://ghidra-sre.org/',
          note: 'The decompiler platform used in stages 4–5'
        },
        {
          title: 'Apple Platform Security — Code signing (why RE artifacts must stay in scope)',
          url: 'https://support.apple.com/guide/security/code-signing-secf4c8f3416/web',
          note: 'Context reminder: artifacts you hold are signed, owned works — treat scope accordingly'
        }
      ]
    }
  ]
};
