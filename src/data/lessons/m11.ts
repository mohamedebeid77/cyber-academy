import type { Module } from '../../types';

// LEVEL 8 — BINARY & DYNAMIC · Module 11: Reverse Engineering
// Original curriculum content synthesized from public official documentation:
// OWASP MASTG, Ghidra (NSA), Android NDK/JNI docs, and binutils/ELF references.
// All prose is original; reference links point to the official sources used for
// study. All examples target authorized training apps (MASTG crackmes).

export const m11: Module = {
  id: 'm11',
  title: 'Reverse Engineering',
  level: 8,
  description:
    'Reading an app when you do not have the source: the reverse-engineering workflow from APK to understanding, native libraries and the JNI bridge, ELF and ARM64 essentials, and your first Ghidra session working a native check in a training crackme.',
  outcomes: [
    'Run the five-stage RE workflow: acquire, unpack, decompile, understand, verify',
    'Explain how JNI bridges Java and native code and locate the bridge points in an APK',
    'Triage an ELF shared object: symbols, strings, sections, and ARM64 calling conventions',
    'Load a native library into Ghidra and follow a check through the decompiler and cross-references'
  ],
  lessons: [
    {
      id: 'm11-l01',
      moduleId: 'm11',
      title: 'Introduction to Reverse Engineering',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m03-l03'],
      objectives: [
        'Define reverse engineering and describe the contexts in which practicing it is legal and authorized',
        'Walk the five-stage RE workflow from APK acquisition to verified understanding',
        'Predict when decompilers fail or mislead, and know the fallback for each failure mode'
      ],
      diagram: 'apk-anatomy',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Reverse engineering (RE) is the craft of recovering understanding from software when the source code is not available. On Android, the input is usually an APK: DEX bytecode, resources, assets, and native libraries. The output is knowledge — a map of what the app does, where its security decisions live, and which parts are worth probing live.'
          },
          {
            type: 'p',
            text:
              'RE sits at the start of nearly every serious mobile assessment. You do not test what you cannot see: before you craft intents, hook methods, or bypass a control, you need to know that the control exists and roughly where it is implemented. This module teaches the workflow; later modules put dynamic tools on top of the map you build here.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'When is RE legal and authorized?',
            text:
              'Reverse engineering is not inherently illegal, but context decides. Safe ground: apps you wrote yourself, training crackmes published for this purpose (such as the OWASP MASTG UnCrackable apps), and targets covered by explicit authorization — an engagement contract or bug-bounty scope you have actually read. License terms and local laws (computer-misuse, copyright) vary by jurisdiction; never assume, and never analyze third-party apps outside a defined scope.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'You should know this first',
            text:
              'This module assumes you can read DEX and Smali (covered in module m03, especially m03-l03), follow Java or Kotlin code at a reading level, and drive adb from module m01. If decompiled classes still look alien, go back and re-run the m03 exercises first — everything here builds on that literacy.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The five-stage workflow'
          },
          {
            type: 'p',
            text:
              'Professional RE on Android is a repeatable loop, not a bolt of inspiration. Learn the stages as a checklist and you will never stare at an APK wondering what to do next.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Acquire — obtain the APK: adb pull from an authorized device, an app-store artifact, or a file you were handed. Confirm you have the exact build you will test dynamically later.',
              'Unpack — an APK is a ZIP archive. Unzip it, run apktool for decoded resources and the manifest, and take inventory: what lives in lib/, assets/, res/, and how many classes.dex files there are.',
              'Decompile — JADX for a readable Java view of DEX, baksmali for exact Smali, Ghidra for native .so files. These are different lenses on different artifacts, not competing tools.',
              'Understand — read with a question in mind ("where is the license check?"). Follow cross-references, take notes, and name what each interesting class or function does in plain words.',
              'Verify — confirm hypotheses against the running app: observe behavior, feed inputs, and from module m12 onward hook the exact method or function you identified.'
            ]
          },
          {
            type: 'diagram',
            id: 'apk-anatomy',
            caption: 'What you unpack, and where each kind of logic hides.'
          },
          {
            type: 'h',
            text: 'Why decompilers sometimes fail'
          },
          {
            type: 'p',
            text:
              'Decompilation is a lossy reconstruction: DEX to Java is an approximation, not a round trip. Some failure modes are inherent to translation, others are deliberate defenses. Knowing which one you are facing saves hours.'
          },
          {
            type: 'list',
            items: [
              'Obfuscation — R8/ProGuard renames classes to a.a.b and may encrypt or inline strings, so recovered names carry no meaning',
              'Reflection and dynamic loading — DexClassLoader pulls code from downloaded or packed DEX that static tools never see',
              'Native code — logic in lib/*.so is completely invisible to DEX tools (the subject of lesson m11-l02)',
              'Packing and anti-tamper — commercial protectors encrypt or virtualize DEX; you may decompile only a stub loader',
              'Lossy translation — even on success, decompiled Java can reorder, merge, or drop details; security-critical conclusions need Smali or runtime confirmation'
            ]
          },
          {
            type: 'p',
            text:
              'The professional response: treat decompiled Java as a map, not as ground truth. When the map is blank, zoom out to exact Smali, or zoom sideways into native code — and always close the loop with dynamic verification.'
          },
          {
            type: 'compare',
            title: 'Two views of the same code',
            beforeTitle: 'JADX output (approximate, obfuscated)',
            beforeCode:
              '// names reconstructed, logic possibly simplified\npublic static boolean a(String str) {\n    return new C0123x().m(str.getBytes(), "AES");\n}',
            afterTitle: 'Smali (exact DEX semantics)',
            afterCode:
              '.method public static a(Ljava/lang/String;)Z\n    invoke-virtual {p0},\n        Ljava/lang/String;->getBytes()[B\n    const-string v2, "AES"\n    invoke-virtual {v0, v1, v2},\n        LC0123x;->m([BLjava/lang/String;)[B\n    ...\n.end method'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'RE is how you aim everything else in this academy. An hour of reading the right class tells you which intent extras matter, which method gates the premium feature, and which check to hook — turning dynamic testing from guessing into hypothesis-driven work.'
          },
          {
            type: 'list',
            items: [
              'Hardcoded secrets: API keys, passwords, and signing material baked into code or resources',
              'Client-side-only controls: license checks, root/emulator detection, local PIN validation',
              'Weak crypto: hardcoded IVs, ECB mode, or home-rolled ciphers readable in the decompiled code',
              'Hidden surface: endpoints, debug switches, and admin flags that no UI path ever reaches'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Class names collapsed to a.a.b — obfuscation is on; lean on structure and references, not names',
              'A lib/ directory with per-ABI subfolders — native logic is present, budget time for it',
              'References to DexClassLoader, System.loadLibrary, or crypto APIs in decompiled code',
              'Strings and resources that look like endpoints, keys, or check-values worth chasing',
              'Multiple classes.dex files (multidex) — search all of them; tools sometimes default to the first'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Everything in this module — pulling APKs, unpacking, decompiling — is performed on apps you own, training crackmes, or explicitly authorized targets. Reverse engineering an app outside your authorization can violate contract terms and local law even when no device is touched.'
          },
          {
            type: 'p',
            text:
              'The first three stages are pure local file work. On an authorized device or emulator, acquire and unpack a training app like this:'
          },
          {
            type: 'terminal',
            title: 'Acquire, unpack, decompile',
            lines: [
              '$ adb shell pm path com.training.crackme1',
              'package:/data/app/~~xYz123==/com.training.crackme1-k8sL2w==/base.apk',
              '$ adb pull /data/app/~~xYz123==/com.training.crackme1-k8sL2w==/base.apk target.apk',
              '$ unzip -l target.apk | grep -E "dex|lib/"',
              '$ apktool d target.apk -o target_out',
              '$ jadx-gui target.apk'
            ]
          },
          {
            type: 'p',
            text:
              'Stages four and five are the loop you live in: pick one question ("what does the CHECK button do?"), find the answer in JADX by following the button\u2019s onClick handler, note it, then verify by running the app and observing the behavior — or, from module m12, by hooking the method you just read.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A good first full pass is the OWASP MASTG UnCrackable-Level-1 crackme. Acquire the APK, open it in JADX, find the main activity, and follow the code behind the secret-input screen: you will find a comparison against an expected value sitting in plain DEX, plus a set of root and debugger checks that run at startup. RE revealed both the goal (the comparison) and the obstacles (the checks) before you touched the app at runtime.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Training targets',
            text:
              'The MASTG project publishes the UnCrackable apps precisely for legal practice. The academy\u2019s Sources page links to them; this module only asks you to map the terrain — solving flows come later.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['adb', 'Acquire the APK from an authorized device or emulator'],
              ['apktool', 'Decode resources and the manifest; rebuild for later patch testing'],
              ['JADX', 'DEX to readable Java — the fastest route into an app'],
              ['baksmali', 'Exact Smali when JADX output is untrustworthy'],
              ['Ghidra', 'Native .so analysis (focus of lesson m11-l03)']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading decompiled Java top-to-bottom like a novel instead of following entry points, onClick handlers, and cross-references',
              'Trusting decompiled Java for security-critical conclusions without checking Smali or runtime behavior',
              'Stopping at the DEX boundary while the interesting logic sits in a native library',
              'Fighting obfuscated names by hand for hours instead of switching to dynamic verification',
              'Reversing apps outside your authorization — the most serious mistake possible in this module'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pull a training crackme APK with the commands above, open it in JADX, and locate the main activity. Find one comparison or validation check and write a five-line note: what the code does, what input it expects, and what happens on failure. Then predict the app\u2019s behavior for a specific input, run it, and check your prediction. That predict-then-verify loop is the whole discipline in miniature.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'RE workflow: acquire, unpack, decompile, understand, verify — run it as a checklist',
              'Decompiled Java is an approximation; Smali is exact; native code needs its own tools',
              'Decompilers fail on obfuscation, dynamic loading, packers, and native logic — each has a known fallback',
              'RE exists to aim dynamic testing; authorization is a precondition, not an afterthought'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm11-l01-q1',
          type: 'mcq',
          prompt: 'Put the reverse-engineering workflow stages in the correct order.',
          options: [
            'Acquire, unpack, decompile, understand, verify',
            'Decompile, acquire, understand, unpack, verify',
            'Unpack, verify, acquire, decompile, understand',
            'Acquire, decompile, unpack, verify, understand'
          ],
          answerIndex: 0,
          hint: 'You cannot decompile what you have not acquired, and you do not trust anything until it is verified.',
          explanation:
            'The workflow is strictly ordered: get the artifact, open it up, translate it, build understanding, then confirm against the running app. Skipping verify is the most common shortcut that turns into a wrong finding.'
        },
        {
          id: 'm11-l01-q2',
          type: 'truefalse',
          prompt:
            'If JADX produces clean-looking Java, that output is semantically identical to the original source code.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does a decompiler reconstruct, and from what input?',
          explanation:
            'Decompilation reconstructs an approximation from DEX bytecode, not from the original source. Structure can be reorganized and details dropped, which is why security-critical conclusions get verified in Smali or at runtime.'
        },
        {
          id: 'm11-l01-q3',
          type: 'short',
          prompt:
            'Name two situations in which DEX decompilation fails or misleads, and state the exact representation you fall back to.',
          modelAnswer:
            'Any two of: obfuscation/renaming, reflection or dynamically loaded DEX, packers/anti-tamper, and lossy translation of edge-case bytecode. The exact fallback is Smali produced by baksmali — a faithful assembly view of DEX — or moving to native analysis for logic in .so files.',
          hint: 'Think about what defends apps, and what the "assembly of DEX" is called.',
          explanation:
            'Each failure mode has a known answer: obfuscated names stop mattering in Smali, dynamically loaded DEX is dumped and analyzed at runtime, packed apps are handled dynamically, and native logic goes to Ghidra. What never works is trusting a blank map.'
        },
        {
          id: 'm11-l01-q4',
          type: 'scenario',
          prompt:
            'A crackme shows a license screen, but searching the decompiled DEX finds no comparison logic at all. Where do you look next, in order, and why?',
          modelAnswer:
            'First lib/<abi>/*.so — the check may be native; list exports with nm and look for Java_* symbols (lesson m11-l02). Second, assets/ and any packed or dynamically loaded DEX (DexClassLoader usage). Third, re-check for reflection-built class names that text search cannot see. The check must exist somewhere; these are exactly the places DEX decompilation does not reach.',
          hint: 'Which artifacts did the unpack stage show you, and which of them does a DEX decompiler not read?',
          explanation:
            'DEX tools only see DEX. Native libraries, packed or dynamic DEX, and reflection-generated classes are the three classic hiding spots, and the RE workflow is designed to surface them in order of likelihood.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'The canonical mobile testing methodology this module follows; also home of the UnCrackable crackmes.'
        },
        {
          title: 'JADX — Dex to Java decompiler',
          url: 'https://github.com/skylot/jadx',
          note: 'Official repository for the primary DEX decompiler used in this lesson.'
        },
        {
          title: 'Apktool',
          url: 'https://apktool.org/',
          note: 'Official site for decoding and rebuilding APK resources and the manifest.'
        },
        {
          title: 'Ghidra',
          url: 'https://ghidra-sre.org/',
          note: 'Official site of the NSA reverse-engineering suite used for native analysis.'
        }
      ]
    },
    {
      id: 'm11-l02',
      moduleId: 'm11',
      title: 'Native Libraries, JNI, ELF and ARM Basics',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m11-l01'],
      objectives: [
        'Explain why Android apps ship native code and what lives in lib/<abi>/*.so',
        'Describe how JNI connects Java methods to native implementations, via static naming and RegisterNatives',
        'Recognize the useful parts of an ELF file and the basics of the ARM64 calling convention'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Open any real APK and you will usually find a lib/ folder containing one or more compiled shared objects (.so files) per CPU architecture. That is C and C++ compiled to machine code — no DEX, no JADX. Developers ship native code for performance, for battle-tested libraries, and, tellingly, to move security-sensitive logic somewhere they believe testers will not look.'
          },
          {
            type: 'p',
            text:
              'This lesson gives you the vocabulary to work at that boundary: why the libraries exist, how Java calls into them (JNI), what is inside the file (ELF), and how the machine code passes arguments (ARM64). It is deliberately gentle — the goal is to read and aim, not to hand-disassemble.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Gentle by design',
            text:
              'You do not need to become an assembly expert this week. You need to recognize the bridge points, run three or four recon commands fluently, and let tools like Ghidra (next lesson) do the heavy translation.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Why apps ship lib/*.so'
          },
          {
            type: 'list',
            items: [
              'Performance: codecs, signal processing, and game engines compile hot paths to native code',
              'Reuse: proven C/C++ libraries (TLS stacks, SQLite, media engines) arrive as .so files',
              'Obscurity: sensitive checks get moved out of DEX so casual JADX users never see them',
              'Cross-platform: shared C++ cores between iOS and Android builds'
            ]
          },
          {
            type: 'p',
            text:
              'The build system produces one .so per Android ABI under lib/: arm64-v8a (modern devices), armeabi-v7a (older 32-bit), and x86_64/x86 (emulators). The Java side must load it explicitly — System.loadLibrary("security") loads libsecurity.so from the directory matching the running device\u2019s ABI.'
          },
          {
            type: 'code',
            lang: 'java',
            title: 'The Java side of the bridge',
            code:
              'public final class Security {\n  static {\n    System.loadLibrary("security");   // loads lib/<abi>/libsecurity.so\n  }\n\n  public static native boolean verify(String input);\n}'
          },
          {
            type: 'h',
            text: 'JNI: the Java-to-native bridge'
          },
          {
            type: 'p',
            text:
              'JNI (Java Native Interface) is the standard contract between managed code and native code. When verify() is invoked, ART must find a native function to run. With static binding, the name is derived by convention: Java_ + the package with dots replaced by underscores + _ + class + _ + method — so com.training.Security.verify becomes Java_com_training_Security_verify. The first two parameters are always JNIEnv* and the class or object; the Java arguments follow.'
          },
          {
            type: 'code',
            lang: 'c',
            title: 'The native side of the bridge',
            code:
              'JNIEXPORT jboolean JNICALL\nJava_com_training_Security_verify(JNIEnv *env, jclass clazz, jstring input) {\n  const char *utf = (*env)->GetStringUTFChars(env, input, 0);\n  jboolean ok = check_against_expected(utf);   // the interesting part\n  (*env)->ReleaseStringUTFChars(env, input, utf);\n  return ok;\n}'
          },
          {
            type: 'p',
            text:
              'Two gotchas bite everyone once: underscores in package names are mangled (an underscore becomes _1), and C++ builds must export the function with C linkage (extern "C") or the compiler\u2019s name mangling hides it from ART.'
          },
          {
            type: 'p',
            text:
              'Dynamic binding hides the mapping entirely: a JNI_OnLoad function (run automatically at loadLibrary time) calls RegisterNatives(env, clazz, methods, count), binding Java methods to arbitrary C functions. No Java_* symbol exists to grep for — the hint becomes the JNI_OnLoad export itself, and the methods table it passes names the real implementations.'
          },
          {
            type: 'h',
            text: 'ELF in one page'
          },
          {
            type: 'p',
            text:
              'A .so file is an ELF (Executable and Linkable Format) shared object. You do not need the full spec — you need five landmarks:'
          },
          {
            type: 'table',
            headers: ['Landmark', 'What it holds'],
            rows: [
              ['ELF header', 'Architecture, bitness, machine type — tells tools which ISA to use'],
              ['.text', 'The compiled machine code itself'],
              ['.rodata', 'Read-only constants: string literals, tables, sometimes keys'],
              ['.dynsym / .symtab', 'Symbol tables: exported and imported function names (read with nm, readelf)'],
              ['.init_array', 'Constructors executed when the library loads — a favorite anti-debug hooking spot']
            ]
          },
          {
            type: 'terminal',
            title: 'Three-command ELF recon',
            lines: [
              '$ readelf -h libsecurity.so | grep -E "Class|Machine"',
              '  Class:                             ELF64',
              '  Machine:                           AArch64',
              '$ nm -D libsecurity.so | grep -E "Java|JNI_OnLoad"',
              '0000000000012a40 T Java_com_training_Security_verify',
              '0000000000011000 T JNI_OnLoad',
              '$ strings libsecurity.so | grep -iE "licen|root|frida"',
              'LICENSE_INVALID',
              'RootBeer detected'
            ]
          },
          {
            type: 'h',
            text: 'ARM/ARM64 in ten minutes'
          },
          {
            type: 'p',
            text:
              'Most device builds are AArch64 (arm64-v8a). AArch64 provides 31 general-purpose registers x0–x30 plus the stack pointer; the w0–w30 names address the lower 32 bits of each. The calling convention (AAPCS64) is simple enough to memorize: the first eight integer or pointer arguments travel in registers, and the return value comes back in x0.'
          },
          {
            type: 'table',
            headers: ['Register', 'Role in the calling convention'],
            rows: [
              ['x0', 'First argument — and the return value on the way out'],
              ['x1–x7', 'Arguments two through eight'],
              ['stack', 'Arguments beyond eight are pushed on the stack'],
              ['x30 (LR)', 'Return address; the bl instruction stores it here'],
              ['x29 (FP)', 'Frame pointer used by stack walks and debuggers']
            ]
          },
          {
            type: 'p',
            text:
              'For a statically named JNI export on ARM64 this means: x0 = JNIEnv*, x1 = jclass or jobject, x2 = the first Java-level argument. When the decompiler shows a function taking three pointers before your string shows up, that is why.'
          },
          {
            type: 'p',
            text:
              'The 32-bit ARM convention (armeabi-v7a) differs — r0–r3 carry the first four arguments — and x86_64 emulator builds use the SysV convention instead. Always analyze the ABI you actually intend to run and hook.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Root/emulator/Frida detection, license and integrity checks, and "the real" crypto frequently live in native code precisely because developers assume testers only read Java. Being fluent at the bridge means those assumptions stop protecting the app.'
          },
          {
            type: 'list',
            items: [
              'Java_* exports name the exact entry points you will hook later with Frida (module m12-l05)',
              'Strings in .rodata leak flags, error paths, and the names of detection libraries before you run anything',
              'A JNI_OnLoad that calls RegisterNatives tells you the app deliberately hides its native entry points — worth noting in itself'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'One lib/ folder per ABI — analyze the one that runs on your target (usually arm64-v8a on devices)',
              'Exports named Java_* (static JNI) or a JNI_OnLoad that will call RegisterNatives (dynamic)',
              'C++ symbols beginning with _Z — mangled names; demangle before searching for Java_',
              '.init_array constructors, and imports like ptrace, dlopen, strncmp, memcmp in the dynamic symbol table'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Passive analysis, active rules',
            text:
              'Extracting and inspecting libraries is offline file analysis, but the artifacts still belong to an authorized target. Do this only on apps you own, training crackmes, or in-scope engagements, and keep in-scope artifacts private.'
          },
          {
            type: 'p',
            text:
              'Pull the APK (lesson m11-l01), extract the libraries, and run the recon trio against the ABI you plan to hook:'
          },
          {
            type: 'terminal',
            title: 'Native recon on an authorized target',
            lines: [
              '$ unzip target.apk "lib/*" -d native_out',
              '$ ls native_out/lib/',
              'arm64-v8a  armeabi-v7a  x86_64',
              '$ nm -D native_out/lib/arm64-v8a/libsecurity.so | grep -c Java_',
              '1',
              '$ strings native_out/lib/arm64-v8a/libsecurity.so | grep -iE "check|valid|secret" | head'
            ]
          },
          {
            type: 'p',
            text:
              'Record the bridge points (export names, JNI_OnLoad presence), the suspicious strings, and your hypotheses. Dynamic confirmation comes later with Frida in module m12-l05 — this lesson only writes the map.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The native-check crackmes (UnCrackable Level 2 style) make the lesson concrete: the Java class declares native boolean check(String) and the DEX side is a dead end — no logic to read. nm -D reveals Java_..._check, strings shows decoy constants and real verdict strings side by side, and the actual comparison waits in the ELF. The DEX tells you a native check exists; the ELF tells you where it lives.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Training targets',
            text:
              'The MASTG crackmes include deliberately native-level exercises, published for exactly this kind of legal practice. Save your recon output — the Ghidra work in the next lesson picks up from these same files.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['readelf / objdump (binutils)', 'ELF headers, sections, and quick disassembly'],
              ['nm', 'Symbol listing; -D reads the dynamic table you actually care about'],
              ['strings', 'Fast sweep of human-readable constants in .rodata'],
              ['Ghidra / IDA / radare2', 'Disassembly and decompilation — Ghidra is the focus of lesson m11-l03'],
              ['lief / pyelftools', 'Scripted ELF parsing when recon needs to scale across many libraries']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Analyzing the x86_64 emulator build while your future hooks will target the arm64 device build',
              'Searching for Java_ symbols in a RegisterNatives-based library and wrongly concluding there is no native bridge',
              'Forgetting C++ name mangling and extern "C" when correlating source-level names with symbols',
              'Reading raw assembly linearly instead of using symbols, strings, and a decompiler',
              'Assuming a stripped binary hides everything — .dynsym survives stripping, and that is usually all you need'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'From a training APK, extract lib/arm64-v8a/*.so and run readelf -h, nm -D, and strings on it. Count the Java_ exports, list three suspicious strings, and write down three hypotheses about what the library checks and how. Keep them — the next lesson turns exactly this list into a Ghidra session plan.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'lib/<abi>/*.so is compiled C/C++ shipped per ABI and loaded via System.loadLibrary',
              'Static JNI exports are named Java_<package>_<Class>_<method>; RegisterNatives hides the mapping inside JNI_OnLoad',
              'ELF recon = header, .rodata strings, .dynsym symbols, and .init_array surprises',
              'ARM64: arguments in x0–x7, return in x0; JNI natives take (env, clazz/jobject, ...) so your data usually starts at x2'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm11-l02-q1',
          type: 'mcq',
          prompt:
            'A Java class in package com.training.app, named NativeGate, declares native void check(String s). What is the exported symbol for static JNI binding?',
          options: [
            'Java_com_training_app_NativeGate_check',
            'Java/com/training/app/NativeGate/check',
            'Java_com.training.app.NativeGate.check',
            '_ZJavaNativeGatecheck'
          ],
          answerIndex: 0,
          hint: 'Dots become underscores; everything else is concatenated with underscores.',
          explanation:
            'The JNI static-binding convention replaces package dots with underscores and joins class and method with underscores, producing Java_com_training_app_NativeGate_check. Slash-separated names are internal DEX descriptors, not export names.'
        },
        {
          id: 'm11-l02-q2',
          type: 'truefalse',
          prompt: 'If a native library contains no Java_* symbols, it cannot implement any Java native methods.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does JNI_OnLoad have the power to do?',
          explanation:
            'RegisterNatives, typically called from JNI_OnLoad, binds Java native methods to arbitrary function addresses at load time. No Java_* export is required — dynamic binding is the standard way to hide the bridge.'
        },
        {
          id: 'm11-l02-q3',
          type: 'short',
          prompt: 'In an ARM64 statically-named JNI export, what do x0, x1, and x2 hold on entry?',
          modelAnswer:
            'x0 = JNIEnv*, x1 = the jclass (for static methods) or jobject (for instance methods), and x2 = the first Java-declared argument of the method.',
          hint: 'The two implicit JNI parameters come first, then yours.',
          explanation:
            'The JNI ABI prepends JNIEnv and the class/object reference before the declared parameters. On ARM64 that puts them in x0 and x1, shifting your first Java argument to x2 — miscounting this is the classic native-hooking bug (module m12-l05).'
        },
        {
          id: 'm11-l02-q4',
          type: 'scenario',
          prompt:
            'strings shows the constant "FRIDA-DETECTED" in .rodata, but no DEX code references it. What does that tell you, and what is your next step?',
          modelAnswer:
            'Detection logic is implemented in native code. Next step: find what references the string — in Ghidra, follow cross-references from the string in .rodata to the function that compares or logs it (also check anti-analysis imports like ptrace). Once the check function is identified, plan a dynamic hook against it (module m12-l05) on an authorized target.',
          hint: 'Which artifact did the string come from, and which tools read that artifact?',
          explanation:
            'A string living in .rodata with no DEX caller is native by definition. Static tools (xrefs in Ghidra) locate the consumer, and runtime instrumentation confirms it — the standard static-then-dynamic pairing this module teaches.'
        }
      ],
      references: [
        {
          title: 'Android Developers — JNI tips',
          url: 'https://developer.android.com/training/articles/perf-jni',
          note: 'Official JNI guidance, including naming conventions and RegisterNatives.'
        },
        {
          title: 'Android Developers — ABI Management',
          url: 'https://developer.android.com/ndk/guides/abis',
          note: 'Official explanation of ABIs and the lib/<abi> layout.'
        },
        {
          title: 'ELF(5) — Linux man page',
          url: 'https://man7.org/linux/man-pages/man5/elf.5.html',
          note: 'Reference for the ELF format: sections, symbols, and headers.'
        },
        {
          title: 'Arm Developer — Documentation',
          url: 'https://developer.arm.com/documentation/',
          note: 'Arm architecture and calling-convention documentation (AAPCS64).'
        }
      ]
    },
    {
      id: 'm11-l03',
      moduleId: 'm11',
      title: 'Ghidra Basics for Android',
      difficulty: 'Advanced',
      minutes: 35,
      prerequisites: ['m11-l02'],
      objectives: [
        'Install Ghidra and load an Android native library into an analyzed project',
        'Navigate CodeBrowser fluently: function list, decompiler window, and cross-references',
        'Work a native check in a training crackme from export discovery to a written summary and a predicted runtime hook'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Ghidra is the U.S. National Security Agency\u2019s open-source reverse-engineering suite: a disassembler, a decompiler that produces C-like pseudocode, and a project workspace for organizing analysis. It is the free counterpart to IDA Pro, and for Android it answers one question repeatedly: "what does this function in the .so actually do?"'
          },
          {
            type: 'p',
            text:
              'This lesson is deliberately workflow-level. The goal is not mastery — mastery comes from hours in the tool — but a repeatable session shape: open the library, find the JNI surface, read the check, and leave with something actionable for dynamic testing.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Install and first run'
          },
          {
            type: 'list',
            items: [
              'Install a supported JDK (JDK 17 or 21, depending on the Ghidra release) — Ghidra is a Java application',
              'Download the release zip from ghidra-sre.org or the GitHub releases page; there is no installer, just unzip',
              'Start it with ghidraRun.bat (Windows) or ghidraRun (Linux/macOS) and accept the end-user agreement on first launch'
            ]
          },
          {
            type: 'h',
            text: 'Project, import, analysis'
          },
          {
            type: 'p',
            text:
              'Create a project with File → New Project (Non-Shared), then File → Import File and select the .so you reconnoitered in the previous lesson — the arm64 build you intend to hook. Ghidra detects the language automatically (AArch64 little-endian for arm64-v8a libraries). Open the import with CodeBrowser, accept the analysis prompt, and let the default analyzers run. Auto-analysis is where undefined bytes become named functions; it is the one step people skip and then wonder why everything looks empty.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Do not skip auto-analysis',
            text:
              'Without analysis you get raw bytes, no function list, no decompiler output, and no cross-references. Let it finish — on small Android libraries it takes seconds to minutes.'
          },
          {
            type: 'h',
            text: 'The CodeBrowser layout'
          },
          {
            type: 'list',
            items: [
              'Listing — the disassembly with navigation; your ground truth',
              'Decompiler — C-like pseudocode for the function under the cursor; your main reading surface',
              'Symbol Tree — functions, imports, exports, classes, and strings, all filterable',
              'Window → Defined Strings — every constant string with its address, ready for cross-reference chasing'
            ]
          },
          {
            type: 'h',
            text: 'Finding the JNI surface'
          },
          {
            type: 'p',
            text:
              'In the Symbol Tree, open Exports and filter for "Java_" to list statically named JNI entry points. If lesson m11-l02 told you the library uses RegisterNatives, the door is JNI_OnLoad instead: open it, find the RegisterNatives call, and read the methods table it passes — it pairs names with the real function addresses, which you can then rename and read like any other function.'
          },
          {
            type: 'h',
            text: 'Reading the decompiler output'
          },
          {
            type: 'p',
            text:
              'JNIEnv is a pointer to a table of function pointers, so decompiler output shows callback-style calls into the VM — read them as "the native code asks the runtime for help". Java strings arrive as jstring handles, and the conversion you care about is GetStringUTFChars: the moment a native function calls it is the moment your input becomes a readable C string. Rename parameters (select and press L) and variables as you work, leave comments with the semicolon key, and use right-click → Create Function on undefined code that behaves like a function.'
          },
          {
            type: 'h',
            text: 'Cross-references find the check'
          },
          {
            type: 'p',
            text:
              'The fastest route from a suspicious string to the code that uses it: open Defined Strings, double-click the string, and in the Listing read the cross-references beneath it, then jump to the referencing functions. Strings rarely lie about intent — verdicts like "LICENSE-OK" and "ROOT DETECTED" point straight at decision points. Imports work the same way: strncmp and memcmp are classic check sites.'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Import and analyze the arm64 .so you actually intend to hook',
              'Filter Exports for Java_*, or open JNI_OnLoad and read the RegisterNatives table',
              'Read the target function in the Decompiler; rename env, obj, and input as you go',
              'Chase cross-references from suspicious strings and comparison imports',
              'Write a one-paragraph summary of the check: inputs, comparison, result',
              'Predict the Frida hook (export name plus which argument) you would use to verify it at runtime'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Native analysis is what lets your report say "the client-side license check compares input to a value derivable from a constant" with evidence, instead of "the check is possibly weak". It also tells you precisely what to fake at runtime: a return value, an argument, or a memory comparison.'
          },
          {
            type: 'list',
            items: [
              'You will attach Frida to exactly the exports and addresses Ghidra showed you (module m12-l05)',
              'Understanding the check shapes the bypass: replacing a return value is trivial; faking an argument requires knowing its format',
              'Finding where detection happens (strings, ptrace imports) lets you plan around it instead of tripping it'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Java_* exports and a JNI_OnLoad that builds a RegisterNatives table',
              'Strings that read like verdicts, flags, or keys ("SUCCESS", "LICENSE-OK")',
              'Comparison imports: strcmp, strncmp, memcmp — the classic check sites',
              'Anti-analysis imports: ptrace, dlopen, reads of /proc/self/status',
              '__android_log_print calls — native code often logs its own decisions'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Analysis is not intrusion — rules still apply',
            text:
              'Ghidra work is offline file analysis with no device interaction, but the artifacts belong to an authorized target. Analyze only training apps or in-scope binaries, and never redistribute third-party binaries or your derived artifacts outside the engagement.'
          },
          {
            type: 'p',
            text:
              'Work through a native-check training crackme (UnCrackable Level 2 style) end to end. No device is needed for this half:'
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Import lib/arm64-v8a/lib*.so from the crackme and run full auto-analysis',
              'Filter Symbol Tree → Exports for "Java_" and open the check function',
              'Rename env, obj, and input; find the GetStringUTFChars call that converts your input',
              'Follow string cross-references to locate the comparison and the expected value or its derivation',
              'Summarize the algorithm in plain English: what is compared, against what, and what is returned',
              'Predict the Frida hook — export name, argument index, and whether you would observe or modify'
            ]
          },
          {
            type: 'p',
            text:
              'Verification happens when you attach Frida in module m12-l05, or simply run the crackme with the input your analysis predicted. If the app accepts it, your static reading was correct — and that closure is the skill.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A representative session: the crackme\u2019s Java side calls native verifyLicense(String); nm showed Java_com_training_LicenseVerifier_verify. In Ghidra, the decompiler reveals the function converts the jstring, derives an expected value by XORing a table from .rodata, and memcmp\u2019s the two before returning 0 or 1. The finding writes itself: license validation is client-side and deterministic; remediation is server-side validation and not storing derivable secrets in .rodata.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Keep artifacts tidy',
            text:
              'Save the Ghidra project with your renames and comments intact. Labeled functions and screenshots are report evidence; an unannotated analysis is repeat work.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Ghidra CodeBrowser', 'Disassembly plus decompiler — the focus of this lesson'],
              ['Ghidra analyzeHeadless', 'Batch analysis of many .so files from the command line'],
              ['IDA Free / Pro', 'The commercial standard many teams also use'],
              ['Cutter / radare2', 'Lighter-weight, scriptable alternative']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Importing the wrong ABI copy and later wondering why addresses never match your Frida session',
              'Squinting at raw assembly instead of switching to the decompiler window',
              'Leaving functions and variables unnamed until, three jumps in, you are hopelessly lost',
              'Treating decompiler output as exact C — it is a best-effort reconstruction; verify critical conclusions dynamically',
              'Forgetting that RegisterNatives libraries must be entered through JNI_OnLoad, not through an exports list that looks empty'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Full exercise: import a training crackme\u2019s arm64 .so, run auto-analysis, and find one Java_ export. Rename at least three functions or variables (L), add a comment at the comparison, follow one string cross-reference, and write a ten-line summary of what the function does. Finish by writing the Frida hook signature you would use to verify it — that sentence is the bridge into module m12.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Ghidra workflow: project → import → auto-analyze → Symbol Tree → decompiler → cross-references',
              'Strings and imports are the fastest entry points into unknown native code',
              'Rename and comment as you read — the written summary is the deliverable, not the browsing',
              'Every Ghidra session should end with a predicted runtime hook; that is how static feeds dynamic'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm11-l03-q1',
          type: 'mcq',
          prompt: 'What must be installed on the workstation before Ghidra will run?',
          options: [
            'A supported JDK (17 or 21)',
            'Android Studio',
            'The Android NDK',
            'An ARM64 machine'
          ],
          answerIndex: 0,
          hint: 'Ghidra itself is written in Java.',
          explanation:
            'Ghidra is a Java application and requires a supported JDK for the release you download. It runs fine on x86 workstations even while analyzing ARM binaries — the CPU architecture of the target is irrelevant to the tool.'
        },
        {
          id: 'm11-l03-q2',
          type: 'truefalse',
          prompt:
            'When Ghidra asks whether to analyze an imported binary, you should decline, to keep the raw disassembly untouched.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does analysis produce that browsing depends on?',
          explanation:
            'Auto-analysis discovers functions, data, strings, and cross-references. Without it you get an undefined byte desert: no function list, no decompiler output, no xrefs. Always accept it for this workflow.'
        },
        {
          id: 'm11-l03-q3',
          type: 'short',
          prompt:
            'You have a suspicious string sitting in .rodata. What is the fastest way in Ghidra to find the code that uses it?',
          modelAnswer:
            'Open Window → Defined Strings, locate the string, and follow its cross-references (xrefs) shown in the Listing to jump to the functions that reference it.',
          hint: 'There is a dedicated window that lists every constant string with an address.',
          explanation:
            'Defined Strings plus cross-references is the standard entry point into unknown native code — strings declare intent, xrefs point at the logic that acts on it.'
        },
        {
          id: 'm11-l03-q4',
          type: 'scenario',
          prompt:
            'Your crackme library exports only JNI_OnLoad and no Java_* symbols. Describe your Ghidra path to the actual check function.',
          modelAnswer:
            'Open JNI_OnLoad and find the RegisterNatives call. Read the JNINativeMethod table it passes — each entry pairs a method name, a signature, and a function pointer. Navigate to the function address bound to the check method, rename it, and read it in the decompiler like any other function.',
          hint: 'RegisterNatives receives a table. Where does that table come from?',
          explanation:
            'Dynamic binding hides names, not functions. JNI_OnLoad is the one guaranteed entry point, and the methods table it builds is the explicit map from Java methods to native addresses.'
        }
      ],
      references: [
        {
          title: 'Ghidra (official site)',
          url: 'https://ghidra-sre.org/',
          note: 'Downloads, release notes, and installation requirements.'
        },
        {
          title: 'NationalSecurityAgency/ghidra (GitHub)',
          url: 'https://github.com/NationalSecurityAgency/ghidra',
          note: 'Source, issues, and release archive.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Methodology chapters on native reverse engineering and the crackmes used for practice.'
        }
      ]
    }
  ]
};
