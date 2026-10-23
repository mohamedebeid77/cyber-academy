import type { Module } from '../../../../types';

// LEVEL 0 — PLATFORM FOUNDATIONS · Module i02: iOS Architecture
// Original content synthesized from Apple Platform Security, Apple Developer
// documentation and public XNU/Darwin documentation.

export const i02: Module = {
  id: 'i02',
  title: 'iOS Architecture',
  level: 0,
  description:
    'Go one level below the app: the XNU kernel, processes and Mach IPC, the file system model and app containers, and the application lifecycle that governs when code and data move. Enough internals to reason like a tester, not a kernel developer.',
  outcomes: [
    'Sketch the XNU kernel composition (Mach, BSD, I/O Kit) and what each contributes to security',
    'Explain processes, threads, memory and Mach port IPC as the substrate hooks and debuggers attach to',
    'Map the iOS file system: system volume, data containers, and where each kind of app data lives',
    'Describe the app/scene lifecycle states and their data-handling consequences'
  ],
  lessons: [
    {
      id: 'i02-l01',
      moduleId: 'i02',
      title: 'Darwin and XNU: The Kernel Beneath Your Target',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i01-l01'],
      objectives: [
        'Name the three XNU components and the security role of each',
        'Explain why user-space frameworks, not the kernel, are your usual observation point',
        'Describe what changes when a device is jailbroken, at the architectural level'
      ],
      diagram: 'ios-ipc-sandbox',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every iOS behavior you will ever test eventually bottoms out in XNU — the kernel at the core of Darwin, Apple\u2019s open-source-derived operating system core. You will not write kernel code in this academy, but you will interpret the system accurately: when a hook works, when an app is killed, when data is encrypted, XNU is the reason. Understanding it at the architecture level is what separates a tester who copies scripts from one who knows why the script worked.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-platform-stack',
            caption: 'Position of the kernel: everything above is user space; every privilege boundary crosses XNU.'
          },
          { type: 'h', text: 'The three parts of XNU' },
          {
            type: 'list',
            items: [
              'Mach: the microkernel-derived core providing processes (tasks), threads, virtual memory and IPC via ports. Security-relevant: task/thread/ports are exactly the handles debuggers and instrumenters acquire',
              'BSD: the POSIX layer on top of Mach — processes become PIDs, sockets, the VFS file system, users and groups, and much of the syscall surface your tools call',
              'I/O Kit: the driver framework (C++ subset) for device hardware; rarely your concern, except that hardware capability begins here'
            ]
          },
          { type: 'h', text: 'What the kernel enforces for you (against you)' },
          {
            type: 'p',
            text:
              'XNU is where code signing becomes real: executable pages must come from signed code (the kernel refuses to map unsigned executable memory), and page-in of code verifies hashes. It is also where the sandbox and AMFI attach their mandatory access control hooks: every file open, socket bind, and IPC send can be evaluated against the caller\u2019s sandbox profile and entitlements. Two practical consequences: your Frida agent runs because the target process was already allowed the memory it lives in (via a debug entitlement or a jailbreak-weakened enforcement), and your app cannot simply "write somewhere" — the sandbox profile answers for it.'
          },
          { type: 'h', text: 'Jailbreak, architecturally' },
          {
            type: 'p',
            text:
              'A jailbreak exploits a vulnerability chain (often browser/kernel) to disable parts of this enforcement: it remounts the system volume writable (historically) or injects tweaks per-app (modern rootless), permits unsigned code pages, and starts daemons like sshd and frida-server. Nothing conceptual changes about the app — but the walls between containers and around the system weaken. That is precisely why jailbroken devices are powerful for testing and strictly out of bounds for production security claims: the platform guarantees you rely on for "the OS would have stopped that" no longer hold on that device.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Instrumentation works on tasks and threads: "attach" means acquiring the Mach task port of the target — what get-task-allow authorizes on dev builds',
              'Sandbox denials show up in logs as kernel/AMFI rejections; reading them tells you what the app tried and failed — both a troubleshooting skill and an intel source',
              'Code signing kills patched binaries mid-execution (not just at launch) — why every patch needs a re-sign (module i22)',
              'Jailbreak detection is the app measuring the platform it runs on: understanding what "normal" XNU looks like is how you evaluate those checks (module i21)'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Apps spawning helper processes or loading suspicious dylibs — what legitimately runs inside the sandbox is worth inventorying',
              'Console logs with sandbox violations during normal use — evidence of features the app expects but the platform denies',
              'Behavior differences on jailbroken test devices: code paths that only run when a detection check fails are themselves analysis targets'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Nothing to exploit here — one observation exercise instead. On any Mac with Xcode: open Console.app, connect an iPhone, and watch the device log for a minute. You are seeing XNU and daemons narrating: app launches, sandbox rejections, keychain accesses. Set a filter for your target\u2019s bundle id (once module i07 has you install one) and correlate lines with what you do on screen. This single habit — logs first, tools second — is worth more than any single script in this academy.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Terminology that pays off',
            text:
              'Task (Mach\u2019s process), port (message channel), entitlement (capability), AMFI (signature/entitlement enforcement), trust cache (pre-approved system code). These five words appear in logs, in Frida errors and in research papers; owning them makes everything after this readable.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A log line you will eventually see, decoded. "Sandbox: MyApp(1234) deny(1) file-write-create /var/mobile/Library/Preferences/com.other.plist" — reads as: process MyApp (pid 1234) attempted a file-write-create syscall; the kernel (Sandbox MAC policy) denied it because the app\u2019s profile only covers its own container. The app was trying to read another app\u2019s UserDefaults file. Not a vulnerability — the wall holding — but the log proves the app tried, which is itself intel about intent. Architecture knowledge turns log noise into narrative.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Kernel-adjacent tools you will meet later: Console.app and the log CLI (streaming system logs), LLDB (attaches to a task — module i12), Frida (injects into a task — module i11). For now: nothing to install; this lesson is vocabulary and mental model.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Thinking of iOS as "Linux with a UI": Darwin is POSIX-flavored but the security architecture (entitlements, MAC policies, code signing) has no Linux equivalent you can map onto it',
              'Blaming the kernel for app kills that are actually jetsam memory policy or watchdog terminations — read the termination reason first',
              'Assuming jailbreak removes "all" enforcement: modern rootless jailbreaks leave much of the platform intact; know which guarantees you actually lose',
              'Trying to learn XNU internals exhaustively — this academy needs architectural fluency, not driver expertise'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Reproduce the decode exercise: write the sandbox log line above on a card from memory, then annotate each field (process, pid, operation, path, policy). Then write, in one sentence each, what get-task-allow authorizes and what a jailbreak disables. If both sentences come out clean, you have the kernel model this curriculum assumes.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'XNU = Mach (tasks/threads/ports/VM) + BSD (POSIX) + I/O Kit (drivers)',
            'Code signing, sandbox and AMFI enforcement are kernel-level facts, not app-level opinions',
            'Instrumentation and debugging are all acquisitions of the Mach task port — entitlements decide if that is legal',
            'Jailbreak weakens specific enforcements; knowing which ones is part of test hygiene'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i02-l01-q1',
          type: 'mcq',
          prompt: 'Which XNU component provides tasks, threads, ports and virtual memory?',
          options: ['BSD', 'Mach', 'I/O Kit', 'launchd'],
          answerIndex: 1,
          hint: 'Which part came from the microkernel world and owns the primitives debuggers attach to?',
          explanation:
            'Mach provides tasks, threads, ports (IPC) and VM management. BSD layers POSIX semantics (PIDs, sockets, VFS) on top; I/O Kit is drivers; launchd is user-space init, not kernel.'
        },
        {
          id: 'i02-l01-q2',
          type: 'truefalse',
          prompt: 'On stock (non-jailbroken) iOS, an app can map fresh unsigned executable memory if it generates code at runtime.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the kernel verify about pages that execute?',
          explanation:
            'False. Executable pages must originate from signed code; JIT is only possible via special frameworks (e.g. JavaScriptCore) whose entitlements and platform plumbing manage signed JIT memory. Apps cannot self-generate unsigned executable code.'
        },
        {
          id: 'i02-l01-q3',
          type: 'scenario',
          prompt:
            'Your instrumented app dies the moment your Frida agent tries to write to its own memory page. Name the most likely mechanism, and the class of fix.',
          hint: 'Which kernel policy talks about executable pages and signatures?',
          explanation:
            'Code signing enforcement: pages are hashed and verified; writing to executable memory invalidates (or reveals) unsigned content, and CS_KILL-style policies terminate the process. Fixes live in the instrumentation domain (gadget loaded at launch, agent design avoiding exec-page writes) or the re-signing domain — not in "trying harder" at runtime.'
        },
        {
          id: 'i02-l01-q4',
          type: 'mcq',
          prompt: 'A sandbox deny log for file-write-create means…',
          options: [
            'The file system is corrupted',
            'The kernel\u2019s MAC policy blocked a syscall from a process whose profile does not cover that path',
            'The app forgot to request a permission prompt',
            'AMFI refused a code signature'
          ],
          answerIndex: 1,
          hint: 'Sandbox = mandatory access control at the syscall level. Who evaluated and rejected the operation?',
          explanation:
            'The kernel evaluated the file-write-create syscall against the process\u2019s sandbox profile and denied it. Permission prompts (TCC) are a different layer; AMFI is about code identity, not file access.'
        }
      ],
      references: [
        {
          title: 'Apple Platform Security — OS architecture',
          url: 'https://support.apple.com/guide/security/system-security-secf5708b5ca/web',
          note: 'Apple\u2019s layered description of the OS and its enforcement points'
        },
        {
          title: 'Apple Platform Security — Code signing enforcement',
          url: 'https://support.apple.com/guide/security/code-signing-secf4c8f3416/web',
          note: 'How runtime code signature enforcement behaves — the fact behind quiz 2'
        },
        {
          title: 'Darwin/XNU open source',
          url: 'https://github.com/apple-oss-distributions/xnu',
          note: 'The actual kernel source Apple publishes — reference, not required reading'
        }
      ]
    },
    {
      id: 'i02-l02',
      moduleId: 'i02',
      title: 'Processes, Threads, Memory and Mach IPC',
      difficulty: 'Intermediate',
      minutes: 22,
      prerequisites: ['i02-l01'],
      objectives: [
        'Describe how iOS processes are created and what identity they carry (PID, UID, sandbox profile)',
        'Explain threads and memory layout at the level LLDB and Frida operate',
        'Explain Mach port IPC and XPC as the inter-process communication model, and why app-to-app messaging is constrained'
      ],
      diagram: 'ios-ipc-sandbox',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An iOS app is one process in one sandbox with one container. There are no "components" that the system instantiates from other apps (no equivalent of Android\u2019s exported activities): if another process wants to talk to your app, it must go through channels the system mediates — URL opening, XPC services the app itself ships, or the pasteboard. Understanding processes and IPC is understanding both why iOS app isolation is strong and where the sanctioned doors are — because those doors are exactly module i16\u2019s attack surface.'
          }
        ],
        technical: [
          { type: 'h', text: 'Processes and identity' },
          {
            type: 'p',
            text:
              'The system launches apps on demand (SpringBoard asks launchd to spawn them); each process gets a PID, runs as the mobile user, and is bound at launch to its sandbox profile and entitlements — parsed from its signature. Your app is effectively a fixed identity: it cannot shed its sandbox, spawn privileged children, or change its entitlements at runtime. Threads share the process\u2019s memory; the main thread runs the run loop (UI events), and worker threads do I/O and computation. Most findings you will file live on one thread or another of this single process — logs, files, network — not in exotic cross-process tricks.'
          },
          { type: 'h', text: 'Memory, the way your tools see it' },
          {
            type: 'p',
            text:
              'The process sees a virtual address space with segments you met in module i09\u2019s preview: __TEXT (code, read-execute), __DATA (writable), stack, heap. LLDB reads and writes this space; Frida\u2019s NativePointer addresses it; Objective-C objects live on the heap where the runtime finds their class metadata. When a lesson says "hook the function", the machinery is: find the function\u2019s address in __TEXT, redirect execution through a replacement — all inside the target task, which is why task-port acquisition was the prerequisite.'
          },
          { type: 'h', text: 'IPC: Mach ports and XPC' },
          {
            type: 'p',
            text:
              'Mach IPC is message passing over ports — kernel-mediated channels with send/receive rights. Almost nothing raw: apps use XPC, Apple\u2019s framework over Mach IPC, to talk to system daemons and to their own embedded services. XPC carries structured objects with type-aware (and historically, deserialization-hardened) handling. The security model: services validate the caller (code signature, entitlements) rather than trusting the connection. For the tester this matters twice: XPC services your target ships are part of its attack surface (input validation lives there too), and inter-app communication is deliberately narrow — deep links, pasteboard, and app extensions are the sanctioned crossings you will test in module i16.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Single-process discipline: your target\u2019s state (tokens, flags, decisions) is in its heap and its files — one process, finite surface, exhaustible',
              'Extension processes (share extension, widget) are separate processes with their own sandbox — test them as distinct targets, not as "part of the app"',
              'XPC services bundled in the app (if any) are classic places where input validation was forgotten — static strings and symbols reveal them',
              'Backtraces you collect in LLDB are thread states: knowing main-queue vs worker changes how you interpret hangs and race windows'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'App extensions in the IPA (PlugIns/ directory): each is a separate signed binary with its own entitlements — triage them individually',
              'Embedded XPC services (XPCServices/): local IPC endpoints with validation you can audit',
              'Signals of custom IPC: Mach service names in strings, bootstrap ports — rare in normal apps, interesting when present',
              'Thread explosions in logs (hundreds of threads) that hint at racy background work worth exercising dynamically'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Two observations you can make the day you have a device and a target (module i07 completes the setup). First, process inventory: from your Mac, run device process listing via Xcode\u2019s Devices window (or pymobiledevice3 ps once installed) while the app runs — note any companion processes (extensions light up too). Second, thread behavior: once LLDB is available (module i12), attach and run "thread list" and "bt" — you will see the main run loop thread, libdispatch workers and whatever the app spawned. Both exercises take minutes; both build the runtime picture that later hooks make actionable.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Why "one process" matters for scoping. A client says: "our app is just the main binary." The IPA contains PlugIns/ShareExtension.appex — a full second binary. Testing reveals the share extension accepts arbitrary shared text, passes it unvalidated to the app group container, and the main app executes configuration embedded in it (a custom "command" format). The finding lives entirely in the IPC crossing: untrusted input (user-shared content from any app) reaching trusted logic without validation. One process discipline would have missed it; process-aware testing caught it. This is the shape of module i16\u2019s work, seen from the architecture side.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Tools anchored to this lesson: Console/log (process and thread narration), Xcode Devices window (process inventory on device), pymobiledevice3 (scriptable device/process listing), and later LLDB/Frida operating directly on the task. Note what is absent: there is no adb-style shell to poke processes — every tool above either runs on your Mac against the device, or lives inside the app\u2019s own entitlements.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating extensions as sub-files of the app instead of separate processes with separate signatures and sandboxes',
              'Hunting "root" or "system" escalation in app assessments — the app cannot cross out of its sandbox, and neither can your findings',
              'Assuming IPC vulnerabilities like Android\u2019s binder exploits apply — the surfaces differ; iOS crossings are URL/XPC/extension-shaped',
              'Confusing threads with processes in backtraces — a 40-line backtrace is one process, one moment, one thread'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On paper: draw your target app as one box. Add: (a) the threads you expect (main run loop, network worker, background task), (b) the files it writes (container paths from module i04), (c) every line that crosses the box boundary — deep links in, XPC calls out, pasteboard in/out, notifications. That diagram is the runbook for modules i10–i16; every hook and proxy rule you write later hangs on one of those boundary lines.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'One app = one process, fixed identity (PID, sandbox, entitlements), spawned by launchd on demand',
            'Memory layout (__TEXT/__DATA/stack/heap) is what LLDB and Frida address; ObjC objects live on the heap',
            'Mach IPC underlies everything; apps use XPC, and inter-app crossings are deliberately narrow and sanctioned',
            'Extensions are separate processes — enumerate and test them as independent targets'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i02-l02-q1',
          type: 'mcq',
          prompt: 'What is the closest iOS analog of Android\u2019s "exported component invoked by another app"?',
          options: [
            'XPC service shipped inside the app',
            'A deep link (URL scheme) or universal link that launches the app into a handler',
            'A background thread doing work',
            'The app\u2019s Documents directory'
          ],
          answerIndex: 1,
          hint: 'Which mechanism lets another app (or Safari) cause your app to launch into specific functionality with attacker-chosen input?',
          explanation:
            'URL schemes and universal links are the sanctioned, system-mediated way for other processes to direct your app — the analog of implicit intents. XPC services are the app\u2019s own local IPC; threads and directories are internal, not invocable by other apps.'
        },
        {
          id: 'i02-l02-q2',
          type: 'truefalse',
          prompt: 'An app extension (e.g. a share extension) runs inside the main app\u2019s process and shares its memory.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'How do extensions actually execute on device?',
          explanation:
            'False. Extensions run as their own processes, with their own sandbox and often their own entitlements subset; they communicate with the main app only through sanctioned channels (app groups, shared containers). They are separate test targets.'
        },
        {
          id: 'i02-l02-q3',
          type: 'scenario',
          prompt:
            'You find a Mach service name string in the target binary that is not part of any framework you recognize. What is worth checking next, statically?',
          hint: 'What implements Mach services inside an app bundle, and what would you read to understand what it does?',
          explanation:
            'Check for an embedded XPC service (XPCServices/) or extension binary that registers the name, then audit its message handling — symbols, strings and later decompilation. Custom IPC endpoints are rare in consumer apps; when present, their input validation is prime audit territory (module i09 gives the RE workflow).'
        },
        {
          id: 'i02-l02-q4',
          type: 'mcq',
          prompt: 'In an LLDB backtrace of a hang, what does the frame list actually represent?',
          options: [
            'All threads of the process stacked in order',
            'The call chain of one thread at one instant',
            'The app\u2019s launch sequence',
            'The heap layout at the hang'
          ],
          answerIndex: 1,
          hint: 'Backtraces are per-thread. What is a thread?',
          explanation:
            'A backtrace is one thread\u2019s call stack at the moment of inspection. Other threads continue (or all stop, depending on the attach mode) — "thread list" then "bt" per thread is how you navigate a hang.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — XPC documentation',
          url: 'https://developer.apple.com/documentation/xpc',
          note: 'The official IPC API apps use — skim the security notes'
        },
        {
          title: 'Apple Developer — App extensions overview',
          url: 'https://developer.apple.com/app-extensions/',
          note: 'Extension types and their process/separation model'
        },
        {
          title: 'Apple Developer — Threading programming guide',
          url: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Multithreading/',
          note: 'Classic reference for the threading model your backtraces will show'
        }
      ]
    },
    {
      id: 'i02-l03',
      moduleId: 'i02',
      title: 'The File System Model and App Containers',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['i02-l01'],
      objectives: [
        'Distinguish the read-only system volume from per-app data containers',
        'Name every standard container directory and what legitimately belongs there',
        'Use the container model to predict where a given app behavior will leave evidence'
      ],
      diagram: 'ios-bundle-container',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'iOS splits the world in two: a signed, read-only system volume, and per-app data containers. The app\u2019s binary lives on the system side (installed read-only, signature-verified); everything the app writes lands in its container — one directory tree the sandbox lets it call home. Storage testing (module i13) is largely the discipline of pulling this tree apart; this lesson gives you the map so that map-reading later feels like navigation, not archaeology.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-bundle-container',
            caption: 'The split: signed read-only bundle vs writable data container. Most findings live on the right.'
          },
          { type: 'h', text: 'The bundle side (read-only)' },
          {
            type: 'list',
            items: [
              'The .app bundle: executable, Info.plist, resources, _CodeSignature — everything module i04 dissects',
              'Installed under /var/containers/Bundle/Application/<UUID>/ on device (path UUIDs are randomized per install)',
              'Modified content = invalid signature = refusal to run — patching implies re-signing (module i22)'
            ]
          },
          { type: 'h', text: 'The container side (writable)' },
          {
            type: 'list',
            items: [
              'Documents/: user-facing documents and exports; backed up by default',
              'Library/Application Support/: the app\u2019s working data (Core Data stores, SQLite, downloads); backed up by default',
              'Library/Preferences/<bundle-id>.plist: the UserDefaults backing store — plain XML, the classic finding location',
              'Library/Caches/: re-creatable caches; excluded from backups but fully on disk in plaintext',
              'Library/Cookies/: binary cookies from HTTP cookie storage',
              'Library/SplashBoard/Snapshots (and system screenshot service storage): screen snapshots — sensitive screens leak through them',
              'tmp/: scratch space; purged by the system; not backed up'
            ]
          },
          { type: 'h', text: 'Groups and shared containers' },
          {
            type: 'p',
            text:
              'Apps that use App Groups get an additional shared container (…/Shared/AppGroup/<UUID>/) reachable by the main app and its extensions that share the group entitlement. This is the sanctioned crossing point between an app and its extensions — which makes it doubly interesting: legitimate data flows through it, and bugs in one extension expose data to the group. Keychain sharing works analogously with access groups (module i13).'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Every storage finding is a path plus a sensitivity plus a reachable reader: container model gives you the path vocabulary',
              'The bundle side answers "what does the app ship?" (secrets in resources, config plists); the container side answers "what did the app leave?" (tokens, PII, caches)',
              'Backup scope: Documents/Application Support/Preferences ride along in Finder/iCloud backups unless flagged (isExcludedFromBackup) — flagging is not encryption',
              'Shared containers and keychain access groups are where multi-process apps concentrate risk'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Sensitive content in Preferences plists (tokens, user data, feature flags)',
              'Full HTTP responses or screen images cached in Caches/',
              'SQLite/Core Data stores without encryption in Application Support',
              'App Group containers carrying auth state used by extensions — check each extension\u2019s handling',
              'isExcludedFromBackup used as a "security" fix — it only trims backup scope; the file remains plaintext on device'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Full container access requires either a jailbroken device or container extraction via a backup (macOS Finder backup + tools) or Xcode\u2019s device file access for development builds. The walkthrough you will run in module i13: (1) exercise the app across its features; (2) pull the container; (3) walk it with find and a plist/SQLite viewer; (4) for every sensitive string, trace it back to the feature that wrote it. This lesson\u2019s exercise is the dry run: take any app you use daily and, from its visible behavior alone, write which directories it must be touching (login → Preferences; image feed → Caches; export → Documents). Those predictions are testable claims — later you will verify them for real.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Container reasoning in practice. Target: a chat app. Predictions before testing: session token → Library/Preferences plist (UserDefaults is the lazy default); message DB → Library/Application Support/chat.sqlite (likely Core Data); received images → Library/Caches or Application Support/Attachments; exports → Documents. Test: pull container, find chat.sqlite with no encryption and a Messages table containing full message bodies — and find in Preferences a plist with a long-lived refresh token. Two findings, both predicted by the map, both confirmed by a file pull. The map is the test plan.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Container tools, in the order you will meet them: Xcode (dev-build container browsing in Devices), Finder/iMazing-style backups plus a backup explorer for store builds (or pymobiledevice3 for scriptable backup pulls), plutil and a plist editor, sqlite3 for databases, and on jailbroken devices plain SSH. Each gets hands-on time in module i13.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Expecting container paths to be stable across installs — the UUID components change; scripts must search, not hardcode',
              'Reading Caches/ exclusion from backup as protection — the file is still readable on device and in any jailbreak/lab context',
              'Forgetting the bundle side: config plists and resource files ship secrets too — module i08\u2019s static sweep covers them',
              'Auditing only the main app in group-container apps; the extensions write there too'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write the prediction sheet for two apps you use: for each, list feature → expected path → expected content type → who can read it (other apps / backup / local attacker). Keep it; module i13 grades it against reality. If you already have a development build installed, Xcode\u2019s device view lets you pull Library/Preferences right now — compare one prediction against one plist and note the delta.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Read-only signed bundle vs writable per-app container — every write lands in the container',
            'Documents / Application Support / Preferences / Caches / Cookies / tmp — each has a legitimate purpose that developers repurpose for storage',
            'App Group containers and keychain access groups are the sanctioned multi-process crossings',
            'Backup inclusion is the default; exclusion is not encryption — treat both as findings material'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i02-l03-q1',
          type: 'mcq',
          prompt: 'Where does UserDefaults data physically live?',
          options: [
            'Encrypted in the Keychain',
            'A plain XML plist at Library/Preferences/<bundle-id>.plist in the app container',
            'In the app binary\u2019s __DATA segment',
            'In the Secure Enclave'
          ],
          answerIndex: 1,
          hint: 'UserDefaults is a convenience API — where does it persist its dictionary?',
          explanation:
            'UserDefaults writes an XML property list into Library/Preferences/ of the container. It is not encrypted (protection is per-file data protection at most) and is a classic leakage location for tokens and user data.'
        },
        {
          id: 'i02-l03-q2',
          type: 'truefalse',
          prompt: 'Marking a file isExcludedFromBackup makes it unreadable to attackers with device access.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Backup exclusion changes which copies exist. Does it change who can read the original?',
          explanation:
            'False. The flag only keeps the file out of Finder/iCloud backups. On device it remains plaintext under the app container — a lab or jailbroken reader gets it unchanged.'
        },
        {
          id: 'i02-l03-q3',
          type: 'scenario',
          prompt:
            'A chat app and its share extension exchange incoming shared images. Where do you expect that exchange to live, and what is the first risk you would test?',
          hint: 'Crossing between app and extension is sanctioned via what mechanism?',
          explanation:
            'App Group container (…/Shared/AppGroup/<UUID>/) plus possibly the group\u2019s UserDefaults. First risk: the extension writes attacker-influenced content (shared from any app) into the shared container; check whether the main app consumes it without validation (paths, formats, embedded config) — untrusted-to-trusted crossing, module i16\u2019s core pattern.'
        },
        {
          id: 'i02-l03-q4',
          type: 'mcq',
          prompt: 'Which statement about container path UUIDs is correct?',
          options: [
            'They are fixed per bundle id and can be hardcoded in scripts',
            'They change across installs — tools must discover paths dynamically',
            'They are the same across all apps of one developer',
            'They are derived from the device serial number'
          ],
          answerIndex: 1,
          hint: 'Ever noticed reinstalling an app gives it "new" storage? What changes?',
          explanation:
            'Install-time randomization: bundle and data containers live under fresh UUID directories each install/reinstall. Any automation must enumerate and match (e.g. by container metadata or bundle id), not hardcode paths.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — File system basics',
          url: 'https://developer.apple.com/documentation/foundation/file_system',
          note: 'Official container layout and purpose of each directory'
        },
        {
          title: 'Apple Developer — Preferences and Settings programming guide',
          url: 'https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/UserDefaults/',
          note: 'UserDefaults mechanics — where the plist lives and why'
        },
        {
          title: 'Apple Developer — App Groups',
          url: 'https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups',
          note: 'Entitlement reference for shared containers'
        }
      ]
    },
    {
      id: 'i02-l04',
      moduleId: 'i02',
      title: 'App Lifecycle and Runtime: What Runs When',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['i02-l02'],
      objectives: [
        'Describe the app and scene lifecycle states and the transitions that matter for data handling',
        'Explain launch sequences (cold start, prewarming) at the level needed to place hooks',
        'Relate lifecycle events to tester-visible evidence (files written, tokens refreshed, state cleared)'
      ],
      diagram: 'ios-app-lifecycle',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Apps are not always running; iOS suspends and kills them aggressively, and the lifecycle callbacks mark the moments when apps save state, refresh tokens, and clean up. For a tester, lifecycle is a schedule of opportunities: state persisted on backgrounding is pullable; tokens refreshed on foregrounding are hookable; cleanup on termination is a claim you can falsify.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'ios-app-lifecycle',
            caption: 'States and transitions. Suspended apps are frozen in memory; termination is where cleanup claims die.'
          },
          { type: 'h', text: 'States and callbacks' },
          {
            type: 'list',
            items: [
              'Not Running → Active (cold start): main() → UIApplicationMain/SwiftUI App init → willFinishLaunching → didFinishLaunching — earliest reliable hook point',
              'Active → Inactive → Background: app is leaving the foreground; appDidEnterBackground is where state saving and token refreshes typically happen',
              'Background → Suspended: process frozen in RAM; no CPU; memory stays — a snapshot of your target\u2019s live state exists here',
              'Suspended → Terminated: jetsam (memory pressure) or user swipe; willTerminate is best-effort and NOT guaranteed',
              'Prewarming: the system may launch apps partially in the background — do not assume the first process start is a user-visible launch'
            ]
          },
          { type: 'h', text: 'Scenes (UISceneDelegate)' },
          {
            type: 'p',
            text:
              'Modern apps manage per-window scenes: foreground/background events arrive at scene delegates, not only the app delegate. When you hook lifecycle behavior, check which delegate the app actually uses — legacy apps on UIApplicationDelegate, SwiftUI apps on App/Scene phases, hybrid mixes of both. Your Frida selectors must match the real classes (module i11 shows how to enumerate them).'
          },
          { type: 'h', text: 'What happens at each transition, data-wise' },
          {
            type: 'p',
            text:
              'Backgrounding: apps may snapshot the screen (the switcher card), persist caches, and flush queues. Foregrounding: re-authentication, silent token refresh, analytics batches. Termination: last-chance saves — and the moment to verify that "we clear sensitive state on exit" is actually implemented, or only a comment.'
          }
        ],
        pentestRelevance: [
          {
            type: 'list',
            items: [
              'Background snapshots: sensitive screens leave images in the snapshot storage — a real storage finding with an easy fix (privacy overlay) that apps skip',
              'Background-save token flows: hook or observe didEnterBackground to see what gets written where',
              'Termination cleanup claims: kill the app from the switcher and re-pull the container — leftover sessions/keys falsify the claim',
              'Launch hooking: Frida spawn mode (-f) starts the process suspended, letting you instrument before didFinishLaunching runs — the standard way to catch early logic'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Apps that re-auth on foreground but cache the previous user\u2019s data across logout/login',
              'Snapshot content: does the switcher card show account numbers, messages, medical data?',
              'State restoration (UI state restoration / scene storage) carrying sensitive identifiers across launches',
              'Background tasks (BGTaskScheduler) syncing data while backgrounded — network and storage behavior without UI'
            ]
          }
        ],
        howToTest: [
          {
            type: 'list',
            ordered: true,
            items: [
              'Exercise the transition matrix: launch → use → background → foreground → kill; after each step, note logs (Console filtered by bundle id) and file changes (container diff, once pullable)',
              'Snapshot check: on a sensitive screen, background the app, then inspect the switcher card visually; on dev builds, pull the snapshot storage and view the image',
              'Cleanup check: with an authenticated session, kill the app from the switcher; re-pull container; search for tokens/session artifacts',
              'Early-logic check (later, with Frida): spawn the app suspended and set hooks before didFinishLaunching to catch the first network and first file writes'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lifecycle finding, end to end. A banking app claims "session data is cleared when the app exits." Test: log in, background the app, kill it from the switcher, pull the container. Library/Preferences contains lastUserId and a device fingerprint; Application Support contains a session cache database whose rows persist. The app\u2019s foreground re-auth gates the UI — but the artifacts are on disk, readable from a backup. Finding: cleanup is implemented only for the UI layer; storage layer retains identifiers beyond session lifetime, contradicting the app\u2019s privacy claims. Lifecycle transitions scheduled the whole test.'
          }
        ],
        tools: [
          {
            type: 'p',
            text:
              'Console.app/log (transition events, jetsam reports), Xcode (dev-build state inspection), and later Frida spawn mode plus ObjC hooks on delegate callbacks. Screen snapshots can be pulled from a dev-build container; on store builds the switcher card itself is the visible evidence.'
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming willTerminate runs — kills are frequently SIGKILL without callbacks; test cleanup by killing, not by tapping "close"',
              'Hooking the wrong delegate (app delegate in a scene-based app) and concluding "no lifecycle logic exists"',
              'Forgetting prewarming: a "launch" you observe may be system-initiated; correlate with user-visible foregrounding',
              'Testing only the happy path of transitions — background on a sensitive screen and on the login screen are different tests'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build the transition matrix for a training app when you have one installed (module i07): rows = states (cold, active, background, suspended, killed), columns = evidence (log lines, container deltas, snapshot content). Fill two rows now from observable behavior (switcher card, app relaunch state). You will complete the matrix in module i13 when container pulls become routine.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
            'Lifecycle callbacks schedule the app\u2019s data behavior — background saves and foreground refreshes are hook and observation points',
            'Suspended processes are frozen snapshots in RAM; terminated ones are where cleanup claims are falsified',
            'Scene-based apps put lifecycle in scene delegates — enumerate real classes before hooking',
            'Screen snapshots and state restoration are lifecycle features with privacy consequences — test them'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'i02-l04-q1',
          type: 'mcq',
          prompt: 'Which lifecycle moment is the earliest reliable point to hook app logic with Frida in spawn mode?',
          options: [
            'Before main() — you can hook anything before the binary runs',
            'After process start but before didFinishLaunching completes',
            'Only after the first view appears',
            'On the first background transition'
          ],
          answerIndex: 1,
          hint: 'Frida -f starts the process suspended. What is the first app code that then runs?',
          explanation:
            'Spawn mode gives you a suspended process; resuming it, your hooks are in place before app-delegate/scene init code executes. You cannot hook "before main()" in the absolute sense (the runtime must exist), but early-launch coverage is the practical equivalent.'
        },
        {
          id: 'i02-l04-q2',
          type: 'truefalse',
          prompt: 'applicationWillTerminate / sceneWillResignActive guarantees give the app time to wipe sensitive state when the user kills it from the app switcher.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What signal does the switcher kill deliver, and what does it allow?',
          explanation:
            'False. Switcher kills are effectively SIGKILL: no callback, no grace period. Any "wipe on exit" behavior must be verified empirically — typically it does not run, which is exactly why the kill-and-pull test exists.'
        },
        {
          id: 'i02-l04-q3',
          type: 'scenario',
          prompt:
            'You must verify a claim: "screen contents of account pages are never captured in app switcher snapshots." Design the two-part test.',
          hint: 'Part 1 observes the visible artifact; part 2 inspects storage on a dev build.',
          explanation:
            'Part 1 (any build): navigate to an account screen, background the app, view the switcher card — sensitive content visible is a finding. Part 2 (dev build): pull the container and inspect the snapshot storage (SplashBoard/snapshots) for the captured image; confirms the mechanism and proves retention beyond the visible card. Report both observations with build channel noted.'
        },
        {
          id: 'i02-l04-q4',
          type: 'mcq',
          prompt: 'In a SwiftUI app, where do foreground/background transitions typically arrive?',
          options: [
            'UIApplication.delegate exclusively',
            'The App/Scene phases and scene-phase observers, often alongside scene delegates',
            'A background thread started in main()',
            'The Keychain service'
          ],
          answerIndex: 1,
          hint: 'Scene-based apps route lifecycle through scenes — SwiftUI models that with phases.',
          explanation:
            'SwiftUI apps observe scenePhase (and/or use scene delegates under the hood). Hook targets must match what the app actually registers — enumeration (module i11) tells you which delegates exist.'
        }
      ],
      references: [
        {
          title: 'Apple Developer — Managing your app\u2019s life cycle',
          url: 'https://developer.apple.com/documentation/uikit/app_and_environment/managing_your_app_s_life_cycle',
          note: 'Official lifecycle states and delegate responsibilities'
        },
        {
          title: 'Apple Developer — UISceneDelegate',
          url: 'https://developer.apple.com/documentation/uikit/uiscenedelegate',
          note: 'Scene-based lifecycle callbacks'
        },
        {
          title: 'Apple Developer — Extending your app\u2019s background execution time',
          url: 'https://developer.apple.com/documentation/uikit/app_and_environment/scenes/preparing_your_ui_to_run_in_the_background',
          note: 'Background behaviors around state saving and snapshots'
        }
      ]
    }
  ]
};
