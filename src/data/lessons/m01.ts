import type { Module } from '../../types';

// LEVEL 0 — FOUNDATION · Module 01: Android Fundamentals
// Original curriculum content synthesized from public official documentation:
// source.android.com, developer.android.com, and OWASP MASTG. All prose is
// original; reference links point to the official sources used for study.

export const m01: Module = {
  id: 'm01',
  title: 'Android Fundamentals',
  level: 0,
  description:
    'How Android actually works under the hood: the OS stack, the runtime, app components, intents, permissions, the sandbox, storage, IPC, and the tools you use to talk to a device. Everything else in this academy builds on these concepts.',
  outcomes: [
    'Explain every layer of the Android software stack and where app code runs',
    'Describe how apps are isolated from each other by UID and sandbox',
    'Reason about the four component types and how intents route work between them',
    'Navigate and control a device or emulator with ADB confidently'
  ],
  lessons: [
    {
      id: 'm01-l01',
      moduleId: 'm01',
      title: 'How Android Works',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: [],
      objectives: [
        'Describe Android as a software stack, not a single program',
        'Explain why every app is a separate Linux user with its own process',
        'Identify where security boundaries exist in the platform'
      ],
      diagram: 'android-architecture',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Android is not one program — it is a stack of cooperating systems. At the bottom sits a Linux kernel. On top of that, Google and device makers add drivers, native libraries, a runtime that executes app code, and a large framework of Java/Kotlin APIs. Your apps live at the very top of that stack.'
          },
          {
            type: 'p',
            text:
              'The single most important idea for a security tester: every app is a separate Linux user. When you install an app, Android assigns it a unique UID and runs it in its own process. The kernel enforces the separation. Almost everything you will do as a pentester — reading another app\u2019s data, calling its components, intercepting its traffic — is an attempt to cross or abuse the boundaries between these sandboxes.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'android-architecture',
            caption: 'The Android software stack. Click a layer to inspect it.'
          },
          {
            type: 'p',
            text:
              'From bottom to top the stack reads: Linux kernel (memory management, process isolation, drivers, Binder IPC); Hardware Abstraction Layer (standard interfaces to camera, sensors, Bluetooth); native libraries and the Android Runtime (ART) which executes bytecode; the Java API Framework (ActivityManager, PackageManager, Windowmanager, Content Providers, View system); and finally the apps themselves, including system apps like Dialer and Settings.'
          },
          {
            type: 'p',
            text:
              'When an app launches, Zygote — a process that already has the core runtime preloaded — forks a new process for it. That process runs under the app\u2019s UID. Two apps with different UIDs cannot read each other\u2019s memory or files unless the platform explicitly mediates the exchange, for example through Binder IPC or shared user IDs.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Nearly every test you will run maps to one of these layers. Static analysis inspects the top layer (app code). Dynamic analysis observes the process and its files (runtime layer). Network testing watches the boundary between the app and the outside world. Platform interaction testing abuses the framework services (ActivityManager, PackageManager) that mediate between apps.'
          },
          {
            type: 'list',
            items: [
              'Kernel/sandbox knowledge tells you where app data physically lives (/data/data/<package>)',
              'Framework knowledge tells you how components can be invoked from outside (adb, other apps)',
              'Runtime knowledge is the basis for Frida-style instrumentation later in the curriculum'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Manifest flags visible in triage: android:debuggable, android:allowBackup, android:usesCleartextTraffic',
              'The targetSdkVersion / minSdkVersion — older minimum SDKs often mean weaker default protections (e.g. no default TLS-only networking)',
              'Shared userId declarations, which intentionally merge two app sandboxes'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Every technique in this academy assumes you are testing apps you own, apps built for practice, or apps you are contractually authorized to assess. Never test apps, devices, or accounts you do not have explicit permission to test.'
          },
          {
            type: 'p',
            text:
              'On an authorized device you can already see the sandbox model in action using ADB, which you will install properly in the next module:'
          },
          {
            type: 'terminal',
            title: 'Inspecting the process model',
            lines: [
              '$ adb shell ps -A | grep com.example.app',
              'u0_a142   12345  512   ...  com.example.app',
              '$ adb shell dumpsys package com.example.app | grep -E "userId|flags"',
              '    userId=10142',
              '    flags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA ]'
            ]
          },
          {
            type: 'p',
            text:
              'The u0_a142 line shows the app running as its own Linux user (UID 10142). The DEBUGGABLE flag is a triage signal you will learn to love: debuggable apps can be inspected far more deeply than release builds.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A good first hands-on target is an intentionally vulnerable training app such as the OWASP MASTG crackmes (UnCrackable Apps for Android) or DIVA. Install one on your emulator and run the ps and dumpsys commands above against it. You are not exploiting anything yet — you are building the mental map of process, UID, and package that every later module depends on.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Training targets',
            text:
              'The MASTG project publishes legally usable crackmes precisely for this purpose. The Sources page of this academy links to them.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['adb', 'Your primary channel into the device: shell, package info, logcat'],
              ['logcat', 'Watch the framework and the app talk in real time'],
              ['Android Studio Device Manager', 'Create clean, reproducible test devices']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Thinking of an APK as "just the Java code" — native libraries and resources carry logic and secrets too',
              'Assuming the emulator behaves exactly like a device; Play Protect, hardware attestation, and some vendor services differ',
              'Ignoring the platform: many real findings are about how an app misuses framework features (exported components, PendingIntents), not about its own code'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your emulator: install any training app, find its UID with dumpsys package, then run adb shell pm list packages -3 to list all third-party packages. Compare UIDs — each app has a distinct one. That distinctness is the sandbox.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Android = Linux kernel + HAL + runtime (ART) + framework + apps',
              'Each app is a distinct Linux user in its own process — the sandbox is the security model',
              'Crossing sandbox boundaries requires the framework to mediate: Binder, intents, providers',
              'ADB is the tester\u2019s window into all of this'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l01-q1',
          type: 'mcq',
          prompt: 'What runs every installed app as a security principal?',
          options: [
            'A unique Linux UID in its own process',
            'A shared Java virtual machine with per-app classloaders',
            'A browser sandbox',
            'A container image managed by the kernel'
          ],
          answerIndex: 0,
          hint: 'Think about what ps -A shows for two different apps.',
          explanation:
            'Android maps each package to a unique Linux UID and usually a dedicated process forked from Zygote. Kernel-level UID separation is the foundation of the app sandbox.'
        },
        {
          id: 'm01-l01-q2',
          type: 'truefalse',
          prompt: 'Zygote is a process that apps fork from so the runtime does not have to be initialized from scratch for each app.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Zygote means "the first cell from which others grow".',
          explanation:
            'Zygote starts at boot with the core runtime and shared resources preloaded; every normal app process is a fork of it, which saves memory and startup time.'
        },
        {
          id: 'm01-l01-q3',
          type: 'short',
          prompt: 'Name the directory where an app\u2019s private internal data lives (full path pattern).',
          modelAnswer:
            '/data/data/<package_name> (equivalently /data/user/0/<package_name>). Access is restricted to the app\u2019s UID and root.',
          hint: 'It starts with /data/data/...',
          explanation:
            'This directory is protected by Linux file permissions bound to the app\u2019s UID. Reading it on a release build without root is a strong indicator of a platform or configuration weakness.'
        },
        {
          id: 'm01-l01-q4',
          type: 'scenario',
          prompt:
            'You dumpsys a training app and see flags=[ DEBUGGABLE ALLOW_BACKUP ]. Why are both flags interesting to a pentester?',
          modelAnswer:
            'DEBUGGABLE means the app can be attached to with a debugger / run-as and its data read freely — a release build should never ship with it. ALLOW_BACKUP permits the app\u2019s private data to be extracted via adb backup-style mechanisms, potentially exposing secrets. Each flag widens the sandbox the developer intended to keep closed.',
          hint: 'Ask: what does each flag let a tester or another process do that a hardened app would prevent?',
          explanation:
            'Both manifest flags intentionally open platform channels into the sandbox: debugging (run-as, JDWP) and backup extraction. They are classic low-hanging findings documented in MASTG tests.'
        }
      ],
      references: [
        {
          title: 'Android Open Source Project — Platform Architecture',
          url: 'https://source.android.com/docs/core/architecture',
          note: 'Official, in-depth description of the stack: HAL, Binder, ART.'
        },
        {
          title: 'Android Developers — App fundamentals',
          url: 'https://developer.android.com/guide/components/fundamentals',
          note: 'Official overview of processes, components, and the manifest.'
        },
        {
          title: 'OWASP MASTG — Android Platform Overview',
          url: 'https://mas.owasp.org/MASTG/Android/0x05a-Platform-Overview/',
          note: 'Security-oriented platform summary that inspired part of this lesson.'
        }
      ]
    },
    {
      id: 'm01-l02',
      moduleId: 'm01',
      title: 'Android OS Architecture in Depth',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l01'],
      objectives: [
        'Name the responsibilities of each layer of the stack',
        'Explain what Binder is and why IPC is central to Android security',
        'Describe what SELinux adds on top of UID-based isolation'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The previous lesson gave you the stack as a picture. This lesson makes each layer concrete, because as a tester you will constantly ask: "which layer is responsible for the behavior I just observed?" A crash in native code, a permission denial, a weird IPC error — each lives in a different layer, and knowing the map turns confusion into hypothesis.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Linux kernel'
          },
          {
            type: 'p',
            text:
              'Android uses a modified Linux LTS kernel. It provides process scheduling, memory management, file permissions, and — critically for Android — the Binder IPC driver (/dev/binder) and wake locks. Every sandbox boundary ultimately relies on kernel mechanisms: UIDs, file modes, and SELinux policy.'
          },
          {
            type: 'h',
            text: 'HAL and native libraries'
          },
          {
            type: 'p',
            text:
              'The Hardware Abstraction Layer exposes standard interfaces to hardware (camera, sensors, audio). Above it live C/C++ libraries apps never call directly but the runtime uses: OpenGL ES, SQLite, SSL/TLS stacks (BoringSSL/conscrypt), zlib.'
          },
          {
            type: 'h',
            text: 'ART and the framework'
          },
          {
            type: 'p',
            text:
              'The Android Runtime executes DEX bytecode (next lesson). The Java API framework sits on top: system services like ActivityManagerService (component lifecycle), PackageManagerService (installs, permissions), WindowManager, NotificationManager. Apps talk to these services almost exclusively through Binder.'
          },
          {
            type: 'h',
            text: 'SELinux'
          },
          {
            type: 'p',
            text:
              'Since Android 5/6, SELinux enforces mandatory access control on top of the classic UID model: even root cannot freely violate policy on user builds. For testers this matters because many "just read the file" techniques require a userdebug/eng emulator image, where SELinux is permissive or weaker.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Understanding the layer map lets you classify findings quickly. A hardcoded AWS key in a decompiled class is a CODE problem. A logcat line leaking a session token is a data-storage/communication problem. An exported content provider leaking another app\u2019s records is a PLATFORM interaction problem. MASTG and MASVS are organized around exactly these distinctions.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SELinux context of app data files (ls -Z) when assessing persistence or privilege boundaries',
              'Services the app binds to (dumpsys activity services) — what platform capabilities does it rely on?',
              'Native libraries shipped in lib/ that may contain their own logic and their own bugs'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Seeing the layers from a shell',
            lines: [
              '$ adb shell getenforce                # SELinux mode',
              'Enforcing',
              '$ adb shell ls -Z /data/data/com.example.app',
              'u:r:priv_app:s0 ... files owned by the app domain',
              '$ adb shell service list | head -5    # Binder services',
              '0  accessibility: [android.view.accessibility.IAccessibilityManager]'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scope reminder',
            text:
              'Use userdebug/eng emulator images or your own rooted test devices for this kind of inspection, and only for apps you are authorized to assess.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Take the m01-l01 dumpsys output a step further: run dumpsys activity services and dumpsys activity providers on your training app. Identify which framework services it consumes and which providers it exposes. You are now reading the platform\u2019s own account of app-to-platform interaction — the surface you will probe in module 07.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb shell + service/dumpsys — the platform\u2019s built-in introspection tools',
              'adb shell getprop / setprop — system properties that influence behavior'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming root == total control on modern devices: SELinux policy and hardware-backed keystores still constrain you',
              'Conflating the app\u2019s process with the system_server process; most "the app did X" behavior is a system service doing it on the app\u2019s behalf',
              'Forgetting that vendor images differ from AOSP; behavior you reproduce on an emulator may be patched differently on a device ROM'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run adb shell getenforce, then adb shell service list | wc -l on your emulator. Note how many Binder services exist. Pick three whose names suggest app-relevant behavior (activity, package, window) and run dumpsys on each. Skim — the goal is familiarity, not mastery.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Kernel = isolation primitives (UID, Binder, SELinux); framework = platform services; apps live on top',
              'Binder is how almost everything talks to everything — many vulnerabilities are IPC mistakes',
              'SELinux adds mandatory access control; your emulator image type determines how much you can observe'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l02-q1',
          type: 'mcq',
          prompt: 'Which kernel facility does Android use as its primary IPC mechanism?',
          options: ['DBus', 'Binder', 'shared memory segments only', 'Sockets'],
          answerIndex: 1,
          hint: 'There is a device node called /dev/binder.',
          explanation:
            'Binder is a kernel driver purpose-built for Android. Framework services and apps communicate through it, and many component-abuse vulnerabilities are essentially Binder-mediated IPC mistakes.'
        },
        {
          id: 'm01-l02-q2',
          type: 'truefalse',
          prompt: 'On a modern, SELinux-enforcing user build, even root can freely read any app\u2019s private data.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Think mandatory access control versus the old "root is god" model.',
          explanation:
            'SELinux policy restricts even root domains on user builds. That is why testers use userdebug/eng emulator images or properly rooted devices with permissive contexts for inspection.'
        },
        {
          id: 'm01-l02-q3',
          type: 'short',
          prompt: 'Which framework service manages the activity lifecycle and intent dispatch?',
          modelAnswer: 'ActivityManagerService (accessed via the ActivityManager / ActivityTaskManager APIs).',
          hint: 'It is literally named after activities.',
          explanation:
            'ActivityManagerService lives in system_server and mediates component starts, intent resolution, and process management — the surface involved in component-hijacking attacks.'
        }
      ],
      references: [
        {
          title: 'AOSP — Binder IPC',
          url: 'https://source.android.com/docs/core/architecture/hidl/binder-ipc',
          note: 'Official Binder documentation.'
        },
        {
          title: 'AOSP — Security Overview',
          url: 'https://source.android.com/docs/security/overview',
          note: 'Official description of the security model, including SELinux and sandboxing.'
        }
      ]
    },
    {
      id: 'm01-l03',
      moduleId: 'm01',
      title: 'Android Runtime: Dalvik, ART and Bytecode',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['m01-l02'],
      objectives: [
        'Explain what DEX bytecode is and how ART executes it',
        'Distinguish AOT, JIT, and interpretation',
        'Understand why decompilation to readable Java is possible'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'You write Java or Kotlin. The build tools compile it to Java bytecode, then to DEX — a compact bytecode format designed for mobile. The runtime (ART today, Dalvik historically) executes DEX. For a pentester this is the key that unlocks static analysis: DEX is structured, well-documented, and tooling can translate it back into surprisingly readable Java or into Smali assembly.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Dalvik was the original interpreter/JIT runtime; ART replaced it (Android 5+ default) and adds ahead-of-time (AOT) compilation: on install or first use, bytecode is compiled to native code and stored in odex/vdex artifacts. ART also runs a precise garbage collector and supports profiling-guided JIT for hot paths.'
          },
          {
            type: 'list',
            items: [
              'classes.dex — the bytecode your app ships in the APK',
              'Smali — a human-readable assembly-style representation of DEX, produced by baksmali/apktool',
              'Java decompilation — tools like JADX reconstruct Java source from DEX; names of identifiers are preserved unless obfuscated (R8/ProGuard renames them)'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Everything in the static-analysis module rides on this lesson: you will feed DEX into JADX to hunt for secrets and vulnerable patterns, and read Smali when decompilation fails or when you need exact behavior (decompilers approximate; Smali does not). Understanding that AOT artifacts (odex) exist also explains why sometimes an emulator\u2019s /data/dalvik-cache reveals more than the APK itself.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Multiple classes.dex files (multidex) — search them all',
              'Obfuscated identifiers (classes named a.b.c) — a signal R8/ProGuard was used, complicating static reading',
              'Reflection and dynamic class loading in decompiled code — static tools miss behavior that is constructed at runtime'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'No device needed yet. Take any APK from your training set and open it with JADX (module 04 teaches the setup). Locate a class you know from the app\u2019s UI and compare what you see with the app\u2019s behavior. This click-through builds intuition for the source-to-DEX-to-source round trip.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'In the OWASP UnCrackable-Level1 crackme, the secret is checked inside code that was compiled to DEX like any other app. Nothing about DEX hides the check — it only obfuscates it slightly. The existence of readable bytecode is precisely why developers add obfuscation, and why module 13 exists.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: ['JADX — DEX to Java decompiler', 'apktool/baksmali — DEX to Smali and back', 'd8/dx — the compilers that produce DEX during a build']
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Believing decompiled Java is the ground truth — it is a reconstruction; verify suspicious findings in Smali',
              'Assuming obfuscated code is secure; renaming identifiers does not change semantics',
              'Ignoring Kotlin: modern apps are Kotlin-first; decompilers handle it but produce Java-shaped output'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In Android Studio, create a tiny app with a method that returns a hardcoded string. Build the APK, open it in JADX, and find your string. You have just done your first static analysis round trip.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Apps ship DEX bytecode; ART executes it with AOT+JIT',
              'DEX is reversible: JADX gives readable Java, Smali gives exact assembly',
              'Obfuscation renames, it does not remove — the analysis surface remains'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l03-q1',
          type: 'mcq',
          prompt: 'What bytecode format does ART execute?',
          options: ['JVM .class files directly', 'DEX', 'WebAssembly', 'LLVM IR'],
          answerIndex: 1,
          hint: 'The APK contains classes.dex.',
          explanation:
            'Java/Kotlin sources are compiled to Java bytecode and then desugared/compiled to DEX (classes.dex) which ART executes, possibly after AOT compilation to native code.'
        },
        {
          id: 'm01-l03-q2',
          type: 'truefalse',
          prompt: 'ProGuard/R8 obfuscation removes the possibility of static analysis.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What do obfuscators actually change?',
          explanation:
            'Obfuscators rename and optimize but the bytecode still exists and is still decompilable. It raises effort, not a hard barrier. Resilience techniques are covered in module 13.'
        },
        {
          id: 'm01-l03-q3',
          type: 'short',
          prompt: 'When would a pentester prefer reading Smali over decompiled Java?',
          modelAnswer:
            'When the decompiler fails or approximates (edge-case bytecode, obfuscation, control flow), or when exact semantics matter (e.g. verifying a crypto comparison or a bounds check).',
          hint: 'Decompilers are lossy translators.',
          explanation:
            'Smali is a faithful 1:1 assembly view of DEX. Decompilation is convenient but approximate; security-critical conclusions should be verified in Smali or with dynamic analysis.'
        }
      ],
      references: [
        {
          title: 'AOSP — ART and Dalvik (Dalvik docs)',
          url: 'https://source.android.com/docs/core/runtime',
          note: 'Official runtime documentation.'
        },
        {
          title: 'Android Developers — Compile your app (R8)',
          url: 'https://developer.android.com/build/shrink-code',
          note: 'Official description of R8 shrinking/obfuscation.'
        }
      ]
    },
    {
      id: 'm01-l04',
      moduleId: 'm01',
      title: 'The Four App Components',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l01'],
      objectives: [
        'Describe Activities, Services, Broadcast Receivers and Content Providers',
        'Explain what "exported" means and why it is the most security-relevant manifest property',
        'Map each component type to its typical vulnerability class'
      ],
      diagram: 'component-interaction',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An Android app is not a main() function — it is a bag of components the system can start, stop, and call into. Four types cover nearly everything: Activities (UI screens), Services (background work), Broadcast Receivers (event listeners), and Content Providers (shared data stores). The system can invoke any of them from outside the app — and that is exactly why components are the richest vulnerability surface in Android.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'component-interaction',
            caption: 'How external callers reach components through the framework.'
          },
          {
            type: 'list',
            items: [
              'Activity — one user-facing screen; lifecycle managed by ActivityManagerService',
              'Service — long-running background work; started or bound (Binder) by other processes',
              'Broadcast Receiver — subscribes to system or app-wide events (Intents); can be declared in the manifest or registered at runtime',
              'Content Provider — a URI-addressable data interface (content://) with query/insert/update/delete'
            ]
          },
          {
            type: 'p',
            text:
              'Every component is declared in AndroidManifest.xml. The android:exported attribute decides whether other apps (or adb) may start it. Exported components are public API surface: anyone can send them intents, often without any UI interaction. Protected components can still be reached via IPC if the platform grants access — exported-ness is a first filter, not the whole story.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Component-level findings are among the most common real-world Android bugs: exported Activities that leak or mutate state, receivers that act on spoofed broadcasts, providers that ignore caller checks, deep-link Activities that parse attacker-controlled URLs. MASVS-PLATFORM and the MASTG platform tests are dedicated to this area.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:exported="true" (or components with intent-filters, which are implicitly exported on older targetSdk)',
              'Content providers without android:readPermission / writePermission or runtime caller validation',
              'Receivers registered for sensitive system broadcasts (BOOT_COMPLETED, SMS_RECEIVED)',
              'Activities with singleTask/launchMode tricks and taskAffinity — task hijacking territory'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Enumerating components of an authorized app',
            lines: [
              '$ adb shell dumpsys package com.example.app | grep -A2 "Activity Resolver"',
              '$ adb shell pm dump com.example.app | grep exported',
              '# Later (module 07) you will drive them:',
              '$ adb shell am start -n com.example.app/.ExportedActivity --es url https://example.org',
              '$ adb shell am broadcast -a com.example.app.UNLOCK --es pin 1234'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Drive your own targets',
            text:
              'am/broadcast/content commands against components are how you verify component exposure. Run them only against training apps or in-scope apps on test devices.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'DIVA and similar training apps ship deliberately exported components — for example an Activity that displays "vendor secrets" when given the right extra, with no caller check. Enumerating it via pm dump and invoking it via am start produces a finding a real report would grade as moderate: sensitive functionality reachable without authentication, purely because the component is exported.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['apkanalyzer / dumpsys package', 'Enumerate components and exported state'],
              ['adb am / broadcast / content', 'Invoke components for testing'],
              ['Drozer', 'Classic IPC testing framework for providers/receivers (still useful; see Toolkit)'],
              ['JADX', 'Read how components handle incoming intents']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating exported=false as unreachable — other apps in the same UID, adb shell on debuggable builds, and some platform flows can still reach components',
              'Testing only Activities; receivers and providers are quieter and often worse',
              'Assuming an intent-filters-free component cannot be exported: on old targetSdk values explicit exported=true still counts'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Dump the manifest of a training app (JADX or aapt2 dump xmltree) and list every exported component with its permission attributes. Annotate each: what does it do, what inputs does it accept, who could call it? This inventory is the first artifact of a component-focused assessment.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Apps are collections of four component types the system (and others) can invoke',
              'exported components are public surface — enumerate them on every engagement',
              'Providers = data, receivers = events, activities = UI entry points, services = work; each has a signature abuse pattern'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l04-q1',
          type: 'mcq',
          prompt: 'Which component exposes a URI-addressable data interface?',
          options: ['Activity', 'Service', 'Broadcast Receiver', 'Content Provider'],
          answerIndex: 3,
          hint: 'Think content:// URIs.',
          explanation:
            'Content Providers serve data via content:// URIs with query/insert/update/delete operations. Weak permission checks on providers are a classic vulnerability class.'
        },
        {
          id: 'm01-l04-q2',
          type: 'truefalse',
          prompt: 'A component with an intent-filter is reachable by other apps even if the developer never wrote android:exported="true".',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What did targetSdkVersion changes in Android 12 do about this?',
          explanation:
            'Historically intent-filters implied exported. Since Android 12, developers must declare exported explicitly for filter-bearing components — but on older targetSdk or explicit true, the component is public. Both cases matter during triage.'
        },
        {
          id: 'm01-l04-q3',
          type: 'scenario',
          prompt:
            'A training app has an exported Activity that calls getIntent().getStringExtra("url") and loads it in a WebView. Why is this a finding even though the screen requires login to reach normally?',
          modelAnswer:
            'Exported means any app (or adb) can start the Activity directly with crafted extras, bypassing whatever navigation flow enforces authentication. The caller supplies attacker-controlled input (the url) to privileged UI. This is an intent redirection / forced browsing class of issue.',
          hint: 'Who can start an exported activity, and with what parameters?',
          explanation:
            'Exported entry points must validate their inputs and enforce authorization internally. Navigation-based access control plus unvalidated extras is a textbook mobile finding (MASTG platform tests).'
        }
      ],
      references: [
        {
          title: 'Android Developers — App components',
          url: 'https://developer.android.com/guide/components/activities/activity-lifecycle',
          note: 'Component and lifecycle documentation.'
        },
        {
          title: 'Android Developers — Manifest: exported',
          url: 'https://developer.android.com/guide/topics/manifest/activity-element',
          note: 'Official reference for the exported attribute and Android 12 changes.'
        },
        {
          title: 'OWASP MASTG — Android Platform APIs',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'Platform interaction testing methodology.'
        }
      ]
    },
    {
      id: 'm01-l05',
      moduleId: 'm01',
      title: 'Intents and Intent Resolution',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['m01-l04'],
      objectives: [
        'Distinguish explicit from implicit intents and explain how resolution works',
        'Recognize intent-based attack patterns: redirection, spoofed broadcasts, extras injection',
        'Read intent-filter declarations with a security eye'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An Intent is a message object: "do this action, on this data, maybe with these extras." Explicit intents name a target component; implicit intents describe a job (VIEW a URL, SEND text) and the system finds a volunteer via intent-filters. Intents are the glue between components — and because they cross trust boundaries, they are also a primary attack vector.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Resolution: for implicit intents, PackageManager compares action, category, data (URI + MIME type) against every filter in installed packages; ActivityManagerService picks the best match (or shows a chooser). Extras are a Bundle of arbitrary typed values. PendingIntents wrap an intent plus permission to execute it as your app — powerful and frequently misused.'
          },
          {
            type: 'table',
            headers: ['Pattern', 'What the attacker does'],
            rows: [
              ['Intent redirection', 'Gets a victim activity to forward or re-dispatch an attacker-supplied Intent with the victim\u2019s privileges'],
              ['Broadcast spoofing', 'Sends a broadcast an exported receiver trusts (e.g. "payment completed")'],
              ['Extras injection', 'Starts an exported activity/service with crafted extras the component trusts blindly'],
              ['Implicit intent interception', 'Registers a matching filter to receive data the sender assumed was private'],
              ['PendingIntent hijack', 'Reuses a mutable PendingIntent filled by the attacker (AOSP historically mutable by default)']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'When you audit decompiled code, trace every getIntent()/getSerializableExtra() call in exported components and ask: who can supply this, and what happens if it is hostile? On the dynamic side you will craft intents with adb am and test exactly those paths. Module 07 turns this into a systematic methodology.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Filters with action.VIEW and browsable category — deep links that browsers can trigger',
              'setResult / startActivity(getIntent()) flows that forward intents (redirection)',
              'PendingIntent.getActivity(..., FLAG_MUTABLE or no flags) in notification or widget code',
              'Receivers trusting well-known actions without checking the sender (getCallingPackage is unreliable for broadcasts)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Crafting intents on an authorized target',
            lines: [
              '$ adb shell am start -a android.intent.action.VIEW -d "myapp://redeem?code=FREE" com.example.app',
              '$ adb shell am broadcast -a com.example.app.PAYMENT_OK --ei amount 999999',
              '$ adb shell am startservice -n com.example.app/.AdminService --es cmd "reset-owner"'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Scope',
            text: 'Intent crafting is active testing — do it against training apps or authorized engagements only.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A common training-app pattern: an internal Activity handles the implicit intent action com.example.ACTION_REDEEM and grants a discount based on the code extra, and the Activity is exported "for the marketing deep link". Sending the implicit intent from adb (as above) redeems without ever touching the UI. The finding: privileged action reachable by implicit intent with no caller validation.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: ['adb am / broadcast — manual intent crafting', 'JADX — trace intent consumption in code', 'Drozer — systematic intent fuzzing against providers/receivers']
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming implicit intents stay inside the app — without package targeting they can resolve to other apps',
              'Trusting extras: any exported entry must validate types, ranges and authorization internally',
              'Ignoring the chooser/resolver path: user-selected components still process attacker data'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pick a training app with a deep link (module 07 adds more). Use aapt2 dump xmltree or JADX to find its filters, then trigger the link via adb am start -a android.intent.action.VIEW -d "<scheme://...>". Watch logcat for how the app reacts.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Explicit intents name targets; implicit intents are resolved by filters',
              'Extras, actions and data URIs are attacker-controllable at every exported boundary',
              'PendingIntents carry identity — mutability mistakes are severe'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l05-q1',
          type: 'mcq',
          prompt: 'An implicit intent with action ACTION_VIEW and a https:// URI is most likely resolved by…',
          options: [
            'The first app alphabetically',
            'Apps whose intent-filters match action, category and data',
            'The system browser only, always',
            'The sender itself'
          ],
          answerIndex: 1,
          hint: 'Resolution is a matching process, not a fixed preference.',
          explanation:
            'PackageManager matches action/category/data against filters and the resolver picks (or asks the user). Any matching app — including a malicious one on the same device — can volunteer.'
        },
        {
          id: 'm01-l05-q2',
          type: 'truefalse',
          prompt: 'Extras attached to an intent can be read by the receiving component even if the sender is a different app.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'That is exactly why exported components must validate them.',
          explanation:
            'The Bundle travels with the intent across processes. Exported components receive attacker-controlled extras and must treat them as untrusted input.'
        },
        {
          id: 'm01-l05-q3',
          type: 'short',
          prompt: 'What makes a PendingIntent different from a normal Intent?',
          modelAnswer:
            'A PendingIntent grants another part of the system (notification manager, alarms, other apps) the right to execute the wrapped intent with the original app\u2019s identity and permissions. If mutable, its inner intent can be modified by the recipient.',
          hint: 'It is an intent plus permission-to-act-as-you.',
          explanation:
            'PendingIntents delegate privileges. Mutable PendingIntents historically allowed intent hijacking — which is why modern AOSP defaults them to immutable and MASTG tests their flags.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Intents and Intent Filters',
          url: 'https://developer.android.com/guide/components/intents-filters',
          note: 'Official intents documentation.'
        },
        {
          title: 'Android Developers — PendingIntent',
          url: 'https://developer.android.com/reference/android/app/PendingIntent',
          note: 'Official reference including immutability guidance.'
        }
      ]
    },
    {
      id: 'm01-l06',
      moduleId: 'm01',
      title: 'Permissions and the App Sandbox',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l01'],
      objectives: [
        'Explain install-time versus runtime permissions and protection levels',
        'Describe how UIDs and SELinux realize the sandbox',
        'Identify permission smells during a review'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Permissions are the framework\u2019s gatekeeping API: before an app can use the camera, contacts, or location, the platform checks its grants. Combined with per-app UIDs, permissions are why one app cannot silently read another\u2019s data. As a pentester you read permission declarations for over-privilege, and you test whether the app actually enforces its own authorization beyond platform grants.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'Modern Android (6.0+) uses runtime permissions: dangerous permissions (location, camera, microphone, storage) are requested at runtime and revocable. Normal permissions (internet, vibration) are granted at install. Signature permissions are only granted to apps signed with the platform or same certificate. Protection levels: normal, dangerous, signature, signature|privileged (system/privileged apps only).'
          },
          {
            type: 'p',
            text:
              'The sandbox itself is kernel-enforced: each package gets a UID (u0_aNNN); file system directories are owned by that UID; SELinux policy confines what each domain (untrusted_app, priv_app, system_server) may touch. Custom permissions can protect a developer\u2019s own exported components, with android:protectionLevel controlling who may hold them.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Two lenses: (1) over-privilege — does the app request permissions it never uses (increases attack surface and user risk)? (2) enforcement gaps — does the app rely solely on platform permissions while its own exported endpoints skip authorization? Both are reportable. MASVS-AUTH/PLATFORM tests cover declaring and enforcing access controls.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Permissions requested in the manifest but unused in code (and vice versa: sensitive APIs used without grants, which crash)',
              'android:permission attributes missing on exported components',
              'Custom permissions with protectionLevel="normal" or "dangerous" protecting sensitive operations',
              'usesCleartextTraffic / requestLegacyExternalStorage era flags that weaken defaults'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Permission triage on an authorized app',
            lines: [
              '$ adb shell dumpsys package com.example.app | grep -A20 "requested permissions"',
              '$ adb shell pm grant com.example.app android.permission.CAMERA   # grant for testing',
              '$ adb shell pm revoke com.example.app android.permission.CAMERA # then test denial paths'
            ]
          },
          {
            type: 'p',
            text:
              'Grant and revoke dangerous permissions while watching app behavior in logcat: well-built apps degrade gracefully and never fall back to weaker storage or logging when permissions are missing.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training app requests READ_CONTACTS but decompiled code shows the permission never referenced; meanwhile an exported provider serves contact-like records with no readPermission. Two findings in one: unnecessary permission request, and a data endpoint that bypasses the permission model entirely.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: ['aapt2 dump permissions / dumpsys package', 'pm grant/revoke for runtime testing', 'MobSF flags unused/over-privileged manifests automatically']
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing "permission granted" with "user authenticated" — platform permissions and app-level authorization are different axes',
              'Testing only the happy path: revoking permissions mid-flow often reveals crashes or insecure fallbacks',
              'Overlooking signature-level custom permissions that other apps in the same developer\u2019s suite rely on'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'For a training app: list requested permissions, revoke one dangerous permission, exercise the affected feature, and record how the app fails. Does it leak anything to logcat in the failure path? Does it fall back to storing data somewhere weaker?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Permissions gate platform APIs; UIDs + SELinux gate the filesystem and IPC',
              'Audit both over-privilege and enforcement gaps',
              'Platform grants ≠ app-level authorization — test both'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l06-q1',
          type: 'mcq',
          prompt: 'Since Android 6.0, dangerous permissions are…',
          options: [
            'Granted automatically at install',
            'Requested at runtime and revocable by the user',
            'Only available to system apps',
            'Replaced by SELinux rules'
          ],
          answerIndex: 1,
          hint: 'The runtime permission dialog.',
          explanation:
            'Android 6.0 introduced runtime permissions for the "dangerous" protection level: requested while the app runs, displayed in Settings, and revocable. Install-time grants remain for normal permissions.'
        },
        {
          id: 'm01-l06-q2',
          type: 'truefalse',
          prompt: 'An app holding the CAMERA permission still needs its own UI flow to decide who may take a photo.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Platform permissions versus app authorization.',
          explanation:
            'Platform permissions authorize API access; business authorization ("is this user allowed to do X?") is the app\u2019s responsibility. Confusing the two is the root of many authorization findings.'
        },
        {
          id: 'm01-l06-q3',
          type: 'short',
          prompt: 'Name one reason requesting permissions the app never uses is still a reportable issue.',
          modelAnswer:
            'Over-privilege increases attack surface (compromised libraries or code paths gain those capabilities), misleads users in review, and violates least-privilege guidance tracked by MASVS-CODE/PRIVACY.',
          hint: 'Think least privilege and what a malicious dependency could do.',
          explanation:
            'Unnecessary grants violate least privilege; automated stores and security reviews treat them as defects even without an immediately exploitable path.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Permissions overview',
          url: 'https://developer.android.com/guide/topics/permissions/overview',
          note: 'Official permission model documentation.'
        },
        {
          title: 'Android Developers — Security tips',
          url: 'https://developer.android.com/training/articles/security-tips',
          note: 'Official guidance on sandboxing, IPC, and permissions.'
        }
      ]
    },
    {
      id: 'm01-l07',
      moduleId: 'm01',
      title: 'App Storage and Binder IPC',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['m01-l04'],
      objectives: [
        'Locate each storage area an app can use and know who can read it',
        'Explain how Binder enables app-to-service communication',
        'Understand why storage decisions are a top vulnerability source'
      ],
      diagram: 'binder-ipc',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Apps persist data in several places: internal storage (private), external storage (shared), preferences (XML key-value), SQLite databases, and the KeyStore (hardware-backed secrets). The system decides who can read each area. Most "insecure data storage" findings are simply secrets written to places the sandbox does not protect — or logs and caches nobody remembered.'
          }
        ],
        technical: [
          {
            type: 'table',
            headers: ['Location', 'Path', 'Protected by'],
            rows: [
              ['Internal files', '/data/data/<pkg>/files', 'App UID + SELinux'],
              ['SharedPreferences', '/data/data/<pkg>/shared_prefs', 'App UID (plaintext XML!)'],
              ['Databases', '/data/data/<pkg>/databases', 'App UID (encryption is the app\u2019s job)'],
              ['Cache', '/data/data/<pkg>/cache', 'App UID, may be cleared'],
              ['External storage', '/sdcard/Android/… or legacy /sdcard', 'Other apps with storage permission (legacy) — effectively world-readable historically'],
              ['Keystore', 'Hardware-backed key store', 'TEE/StrongBox; keys non-extractable']
            ]
          },
          {
            type: 'p',
            text:
              'Binder is the kernel driver that makes cross-process calls look like local method calls: a client marshals arguments, Binder delivers them to a remote object in another process (often system_server), and returns the result. AIDL describes these interfaces. Services, providers and the whole framework ride on Binder — so IPC permission checks (enforceCallingPermission, getCallingUid) are security-critical code.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Data storage is MASVS-STORAGE and one of the most fruitful manual test areas: tokens in SharedPreferences, PII in logs, database files without SQLCipher, screenshots of sensitive screens (FLAG_SECURE unset), and backups sweeping everything into adb-accessible archives (module 07). On the IPC side, services and providers that skip caller validation are how one app reaches into another.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'getSharedPreferences(MODE_WORLD_READABLE) orMODE_WORLD_WRITEABLE — ancient but still seen',
              'Editor.putString("token", …) with no encryption; tokens also in logcat and crash reports',
              'SQLiteOpenHelper with sensitive tables and no encryption; SQL built by string concatenation (injection)',
              'Files written to getExternalStorageDirectory() by default; FLAG_SECURE missing on sensitive screens'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Storage inspection on a debuggable/rooted target',
            lines: [
              '$ adb shell run-as com.example.app ls shared_prefs/',
              '$ adb shell run-as com.example.app cat shared_prefs/user.xml',
              '$ adb shell run-as com.example.app ls databases/',
              '$ adb logcat -d | grep -iE "token|session|password"'
            ]
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Access control',
            text:
              'run-as works on debuggable builds; full filesystem access needs root or an emulator image. Use these powers only on apps and devices you are authorized to test.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The classic first finding on any training app: cat shared_prefs/*.xml reveals an auth token or the challenge answer in plaintext XML. The remediation is Keystore-encrypted storage or moving secrets out of prefs — you will write that exact finding in module 08.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: ['adb run-as / root shell — storage access', 'sqlite3 on device or pulled copies', 'objection storage commands — quick data dump', 'MobSF — flags insecure storage APIs statically']
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Only checking files, forgetting logs, backups, and the clipboard/keyboard cache',
              'Treating "internal storage" as automatically safe — plaintext secrets inside the sandbox are still a finding on rooted/lost-device threat models',
              'Assuming databases are encrypted by default — they are plain SQLite unless the app encrypts (e.g. SQLCipher)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your emulator: install a training app, log in with a fake account, then dump shared_prefs and databases under run-as. Note every sensitive value you find and where. You are assembling the evidence checklist module 08 will formalize.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Each storage area has a distinct protection boundary; prefs and DBs are plaintext inside the sandbox',
              'External storage and logs leak far beyond the app',
              'Binder carries all IPC; caller validation in services/providers is security-critical'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l07-q1',
          type: 'mcq',
          prompt: 'SharedPreferences files are…',
          options: [
            'Encrypted by the platform by default',
            'Plaintext XML inside the app\u2019s private directory',
            'Stored in the Keystore',
            'Only readable with a special permission'
          ],
          answerIndex: 1,
          hint: 'You can cat one and read it.',
          explanation:
            'SharedPreferences are plain XML files under /data/data/<pkg>/shared_prefs. Inside the sandbox, yes — but any secret stored there is readable on rooted devices, debuggable builds, and backups.'
        },
        {
          id: 'm01-l07-q2',
          type: 'truefalse',
          prompt: 'Writing sensitive files to external storage is safe on modern Android because scoped storage protects them.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who can read the app-specific external directory?',
          explanation:
            'App-specific external directories are readable by the app, the user (USB/adb), and other apps with storage access depending on version. Sensitive data belongs in internal storage or encrypted storage, not external.'
        },
        {
          id: 'm01-l07-q3',
          type: 'short',
          prompt: 'What is the role of AIDL in Binder IPC?',
          modelAnswer:
            'AIDL (Android Interface Definition Language) declares the interface of a Binder service — methods and types — so client and server can generate matching proxy/stub code to marshal calls across processes.',
          hint: 'It is a definition language for cross-process interfaces.',
          explanation:
            'AIDL generates the marshalling code both sides use. When you audit a bound service, the AIDL or onTransact implementation shows exactly which operations remote callers can request.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Data and file storage overview',
          url: 'https://developer.android.com/topic/data-storage',
          note: 'Official storage options documentation.'
        },
        {
          title: 'AOSP — Binder IPC',
          url: 'https://source.android.com/docs/core/architecture/hidl/binder-ipc',
          note: 'Official Binder mechanics.'
        },
        {
          title: 'OWASP MASTG — Data Storage testing',
          url: 'https://mas.owasp.org/MASTG/Android/0x05d-Testing-Data-Storage/',
          note: 'The canonical storage testing playbook.'
        }
      ]
    },
    {
      id: 'm01-l08',
      moduleId: 'm01',
      title: 'ADB Essentials',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: [],
      objectives: [
        'Install platform-tools and connect to a device or emulator',
        'Master the daily-driver adb commands for testing',
        'Read logcat like a pentester'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'ADB (Android Debug Bridge) is a client-server tool that gives your workstation a shell into any connected Android device or emulator. It is the steering wheel for almost everything dynamic in this academy: installing targets, reading data, crafting intents, watching logs, tunnelling Frida.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'The adb server runs on your workstation and brokers connections to adbd on devices over USB or TCP/IP. Commands follow the pattern adb [-s serial] <command>. Emulators use serials like emulator-5554. Wireless debugging pairs on modern Android with adb pair, or plain adb connect <ip>:<port> on emulators.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'The commands you will type a thousand times',
            code:
              'adb devices                          # list targets\nadb install -t target.apk            # install (allow test packages)\nadb shell pm list packages -3        # third-party packages\nadb shell pm path com.example.app    # where the APK lives\nadb pull /data/app/.../base.apk .    # grab the APK for static analysis\nadb shell am start -n pkg/.Activity  # start a component\nadb logcat --pid=$(adb shell pidof com.example.app)  # scoped logs\nadb shell screencap /sdcard/s.png && adb pull /sdcard/s.png\nadb forward tcp:27042 tcp:27042      # tunnel Frida later'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every dynamic module assumes these verbs. Logcat is also a finding machine: apps leak tokens, PII, and internal errors to the system log, readable by any app with log access on older versions and by you on every test. Scoped, time-boxed log review is a standard reporting step.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Sensitive values in log lines (search case-insensitively: token, bearer, session, password, pin)',
              'Crash traces that reveal file paths, SQL, or endpoints',
              'Debug logging left enabled in release builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'A 5-minute device health check',
            lines: [
              '$ adb devices',
              'emulator-5554   device',
              '$ adb shell getprop ro.build.version.release ro.build.version.sdk',
              '$ adb shell getprop ro.debuggable',
              '1',
              '$ adb logcat -c && adb logcat -T 1 | head -100'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Filter early, filter often',
            text:
              'Full logcat is noise. Filter by pid, tag, or regex, and clear with logcat -c before each test action so evidence stays attributable.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Run logcat while logging into a training app. Many deliberately vulnerable apps print the entered credentials or the comparison result. The one-liner adb logcat -d | grep -i pass has ended many "insecure logging" findings.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: ['Android SDK Platform-Tools (adb, fastboot)', 'scrcpy (separate open-source tool) for mirroring test devices']
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Forgetting -t when installing debug/training APKs (install_failed for test packages)',
              'Running logcat unfiltered for long sessions and drowning in noise',
              'Assuming adb is a security hole on production devices: it requires USB debugging enabled and user consent — but on debuggable builds it becomes a full data channel'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Install your chosen training APK with adb install -t, launch its main activity via monkey or am, capture a screenshot, and pull it. Then dump the log to a file and grep it for your own username. That is a complete mini dynamic-analysis loop.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'adb is the universal remote: install, inspect, invoke, capture',
              'Log review is a repeatable finding source',
              'adb forward/port tunnels prepare the ground for Frida and proxying'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm01-l08-q1',
          type: 'mcq',
          prompt: 'Which command shows the on-device path of an installed APK?',
          options: ['adb shell pm list packages', 'adb shell pm path <package>', 'adb locate <package>', 'adb shell find apk'],
          answerIndex: 1,
          hint: 'pm = package manager.',
          explanation:
            'pm path prints the base.apk location, which you then adb pull for static analysis — the standard APK acquisition step.'
        },
        {
          id: 'm01-l08-q2',
          type: 'truefalse',
          prompt: 'adb forward tcp:27042 tcp:27042 lets tools on your workstation reach a port on the device.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Forwarding tunnels TCP between host and device.',
          explanation:
            'adb forward maps a host port to a device port — exactly how Frida clients talk to frida-server and how some proxy setups route traffic.'
        },
        {
          id: 'm01-l08-q3',
          type: 'scenario',
          prompt:
            'You need logs only from the process com.example.app. Give one robust way to scope logcat to that process and explain why unfiltered logs are risky as evidence.',
          modelAnswer:
            'Get the PID (adb shell pidof com.example.app) and run adb logcat --pid=<pid>, or filter by the app\u2019s tags. Unfiltered logs mix other apps\u2019 and the system\u2019s entries, making attribution weak and potentially including out-of-scope data — bad evidence hygiene.',
          hint: 'pidof + a logcat flag.',
          explanation:
            'Scoped logging keeps evidence attributable and avoids capturing unrelated (possibly sensitive) data — good practice for the reporting phase too.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Android Debug Bridge (adb)',
          url: 'https://developer.android.com/studio/command-line/adb',
          note: 'Official adb reference.'
        },
        {
          title: 'Android Developers — logcat',
          url: 'https://developer.android.com/studio/command-line/logcat',
          note: 'Official logcat documentation.'
        }
      ]
    }
  ]
};
