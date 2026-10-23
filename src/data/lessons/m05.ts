import type { Module } from '../../types';

// LEVEL 4 — DYNAMIC ANALYSIS · Module 05: Dynamic Analysis
// Original curriculum content synthesized from public official documentation:
// developer.android.com, mas.owasp.org, frida.re, and the official repository
// of Objection. All prose is original; reference links point to the official
// sources used for study.

export const m05: Module = {
  id: 'm05',
  title: 'Dynamic Analysis',
  level: 4,
  description:
    'Run the app and watch what it really does: scoped logcat observation and debugger attachment, direct inspection of app data and the filesystem, the concepts behind runtime instrumentation, your first Frida hook, structured exploration with Objection, and testing authentication and authorization at runtime — all on authorized targets and training apps.',
  outcomes: [
    'Observe runtime behavior with scoped logcat and attach the Android Studio debugger to debuggable builds',
    'Extract and interpret app-private data with run-as and root on test devices',
    'Explain how runtime instrumentation works and when to reach for Frida or Objection',
    'Attach to and spawn apps with Frida and write a first Java hook that logs method calls',
    'Explore a running app with Objection: enumerate classes, watch methods, list storage, launch intents',
    'Test local authentication checks and runtime authorization boundaries on training apps'
  ],
  checklist: [
    {
      item: 'Rooted Google APIs emulator',
      why: 'adb root plus frida-server is the baseline dynamic-analysis workhorse (module 02).'
    },
    {
      item: 'frida-tools (pip install frida-tools)',
      why: 'The Frida CLI, REPL, and ps utilities your workstation drives devices with.'
    },
    {
      item: 'frida-server matching client version and device ABI',
      why: 'Version or ABI mismatch is the number-one cause of broken first sessions.'
    },
    {
      item: 'objection (pip install objection)',
      why: 'Prebuilt runtime-exploration commands on top of Frida, no scripting required.'
    },
    {
      item: 'Debuggable training app (MASTG UnCrackable / DIVA)',
      why: 'A legally testable target whose checks you can observe, hook, and verify.'
    }
  ],
  lessons: [
    {
      id: 'm05-l01',
      moduleId: 'm05',
      title: 'Runtime Observation: Logcat and Debugging',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m02-l03', 'm03-l02'],
      objectives: [
        'Use scoped logcat as a deliberate test technique, not a firehose',
        'Explain what android:debuggable enables and attach the Android Studio debugger over JDWP',
        'Watch an app\u2019s lifecycle and behavior change in real time'
      ],
      diagram: 'activity-lifecycle',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Static analysis reads what the developer wrote; dynamic analysis watches what the app actually does. The two lightest-weight dynamic instruments are already in your toolkit: logcat, the app\u2019s own narration, and the debugger, which stops the app mid-sentence and lets you read its state. Both only need a debuggable build or a cooperative app — no root, no frameworks.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'activity-lifecycle',
            caption: 'Lifecycle transitions are observable events — each one is a log line and a breakpoint opportunity.'
          },
          {
            type: 'h',
            text: 'Logcat as a technique'
          },
          {
            type: 'list',
            items: [
              'Clear before each action (adb logcat -c), trigger one behavior, capture the delta — attribution comes from the sequence, not from reading everything',
              'Scope by process: --pid=$(adb shell pidof <pkg>), or by tag once you know the app\u2019s tags',
              'Priorities V/D/I/W/E filter noise; -d dumps and exits, -T shows recent lines only',
              'System lines count too: ActivityTaskManager prints activity starts, PackageManager prints installs — free evidence about what the app is doing'
            ]
          },
          {
            type: 'h',
            text: 'Debugging over JDWP'
          },
          {
            type: 'p',
            text:
              'android:debuggable (or ro.debuggable=1 on userdebug images, which makes every app debuggable — m03-l02) exposes the app through JDWP, the Java Debug Wire Protocol. Android Studio\u2019s debugger attaches to a running process: run > Attach to Process (or adb jdwp to list attachable pids). Breakpoints pause the app at a line; watches and the variable pane show locals, fields, and the intent that started the component. This is the state-reading instrument hooks will later complement: the debugger reads, Frida modifies.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Scoped log review is a repeatable finding source: sensitive values printed by the app itself, verbose errors, and behavior fingerprints (which endpoints fire when, in which order). The debugger answers questions static reading cannot: what does this variable actually contain at the comparison point, and which branch really executes? Both instruments also teach detection awareness — debuggable builds are a configuration finding, and observing that an app logs secrets is exactly the insecure-logging test.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Credentials, tokens, PINs, or personal data printed in log lines (case-insensitive sweeps: token, session, pass, pin, http)',
              'Crash traces and stack dumps revealing internal paths, SQL, or endpoints',
              'Lifecycle-proportional logging: debug output in release builds (Log.d/Log.v left enabled)',
              'Whether the app behaves differently while a debugger is attached (an anti-debug signal worth noting)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Attach only in scope',
            text:
              'Debugger attachment and log collection are quiet but real access to an app\u2019s runtime state. Restrict both to training apps, your own builds, and devices you are authorized to test.'
          },
          {
            type: 'terminal',
            title: 'A scoped observation loop',
            lines: [
              '$ adb logcat -c',
              '$ adb logcat --pid=$(adb shell pidof com.example.training) -v time > run-01.log',
              '# ...drive one app flow (login, unlock, sync)...',
              '# Ctrl-C to stop, then:',
              '$ rg -i "token|session|pass|http" run-01.log | head -20',
              '$ adb shell dumpsys package com.example.training | grep -E "flags|DEBUGGABLE"'
            ]
          },
          {
            type: 'p',
            text:
              'Then attach a debugger: open the app\u2019s project (or any project) in Android Studio, Run > Attach to Process, pick the training app. Set a breakpoint inside the method your static review flagged (m04-l02 gave you the class names), trigger the flow, and read the live values in the debugger pane. Static hypothesis, dynamic value.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'DIVA (github.com/payatu/diva) has an insecure-logging challenge that prints exactly this way: log in through the app, then adb logcat -d | rg -i "cred|pass" shows the credentials the app itself wrote to the system log. The finding is one screenshot long — the app leaks authentication material to a log any debugger-capable context can read.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['adb logcat', 'Scoped capture: pid/tag filters, clear, dump-to-file for evidence'],
              ['Android Studio debugger', 'JDWP attach: breakpoints, watches, live variable state'],
              ['adb shell dumpsys', 'Confirm debuggable/flags that decide what attaches to what'],
              ['ripgrep', 'Post-capture sweeps over saved log files']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reading full logcat unfiltered for long sessions — noise buries the evidence and breaks attribution',
              'Clearing logs after the action instead of before; capture windows must bracket the behavior',
              'Assuming release builds log nothing — they do, just less; sweep those too',
              'Stopping at the log line: trace where the value came from (code + debugger) to make the finding actionable'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run three scoped observation windows on your training app (login, a data screen, a failure path), save each as its own log file, and grep them for sensitive patterns. Then attach the debugger at the comparison point of the m04 hypothesis you star-rated, and record the live value you saw. You have now done the two foundational moves of every dynamic test.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Scoped logcat is a technique: clear, trigger, capture, sweep, attribute',
              'android:debuggable exposes JDWP — the Android Studio debugger reads live state',
              'Logs leak values the app itself prints; the debugger reveals values code only implies',
              'Both instruments are read-only first steps before the modifying tools (hooks) arrive'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l01-q1',
          type: 'mcq',
          prompt: 'What makes every app on an emulator debuggable without touching its manifest?',
          options: [
            'The emulator injects debuggable at install time',
            'ro.debuggable=1 on userdebug/eng images applies build-wide',
            'JDWP is always enabled on all devices',
            'Frida must be running first'
          ],
          answerIndex: 1,
          hint: 'Module 02 covered build properties of Google APIs images.',
          explanation:
            'userdebug/eng system images set ro.debuggable=1, which makes all packages debuggable: JDWP attach and run-as work app-wide. Per-app android:debuggable in the manifest is the other path (m03-l02).'
        },
        {
          id: 'm05-l01-q2',
          type: 'truefalse',
          prompt: 'For evidence quality, clear logcat before each test action and capture a scoped window around the behavior.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Attribution needs a bracketed time window.',
          explanation:
            'logcat -c plus a scoped capture (pid or tag) brackets the action so every line in the file is attributable to one test step — the same evidence-hygiene pattern as scoped network capture.'
        },
        {
          id: 'm05-l01-q3',
          type: 'short',
          prompt: 'What does the Android Studio debugger give you that static analysis cannot?',
          modelAnswer:
            'Live runtime state: actual variable values, which branch executes, the contents of the starting intent — read at a breakpoint inside the running process, not inferred from reconstructed code.',
          hint: 'Think hypothesis versus measurement.',
          explanation:
            'Decompiled code implies behavior; the debugger measures it. The pair is the core dynamic-analysis loop: form a static hypothesis (m04), verify the live value (m05).'
        },
        {
          id: 'm05-l01-q4',
          type: 'scenario',
          prompt:
            'Your scoped log of a login flow contains the entered password in a debug line. Write the finding in two sentences: observation and impact.',
          modelAnswer:
            'Observation: the application writes the entered password to the system log (logcat) in plaintext during authentication, captured with a process-scoped logcat window. Impact: on a device where the user or an attacker can read logs (debuggable contexts, attached tooling, bug-report bundles), authentication material is recoverable without knowledge of the device unlock — credentials should never be logged.',
          hint: 'What was captured, and who can read a log?',
          explanation:
            'This is the insecure-logging test (DIVA teaches it deliberately): logs are readable system-wide contexts beyond the app, so sensitive values in log lines are a storage-exposure finding.'
        }
      ],
      references: [
        {
          title: 'Android Developers — logcat command-line tool',
          url: 'https://developer.android.com/studio/command-line/logcat',
          note: 'Official logcat reference: filters, buffers, dumping.'
        },
        {
          title: 'Android Developers — Debug your app',
          url: 'https://developer.android.com/studio/debug',
          note: 'Official debugger usage, including attach to process.'
        },
        {
          title: 'DIVA — Damn Insecure and Vulnerable App',
          url: 'https://github.com/payatu/diva',
          note: 'The training app whose insecure-logging challenge this lesson references.'
        }
      ]
    },
    {
      id: 'm05-l02',
      moduleId: 'm05',
      title: 'Inspecting App Data and the Filesystem',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m05-l01', 'm01-l07', 'm02-l02'],
      objectives: [
        'Use run-as to read a debuggable app\u2019s private data and know when root is needed instead',
        'Pull and examine preferences, databases, and cache contents',
        'Assess external-storage app directories and explain the backup exposure at concept level'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module 01 mapped where app data lives; m04-l07 read the code that writes it. This lesson opens the files. What an app stores is the ground truth of the storage tests: tokens in plaintext XML, unencrypted SQLite, caches nobody cleared, files on shared storage — all directly readable on a debuggable or rooted test device.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Three access paths'
          },
          {
            type: 'list',
            items: [
              'run-as <package> — shell inside the app\u2019s UID; works when the app is debuggable (manifest flag or ro.debuggable build). No root needed',
              'adb root + plain ls/cat — works on rooted emulator images for any app, debuggable or not (m02-l02)',
              'adb pull on external storage — /sdcard/Android/data/<pkg>/ is app-specific but not sandbox-protected; no special access required'
            ]
          },
          {
            type: 'terminal',
            title: 'A run-as inspection session',
            lines: [
              '$ adb shell run-as com.example.training ls',
              'cache  databases  files  shared_prefs',
              '$ adb shell run-as com.example.training cat shared_prefs/user.xml',
              '<?xml ... <string name="auth_token">eyJhbGciOi...</string>',
              '$ adb shell run-as com.example.training ls databases/',
              '$ adb shell "run-as com.example.training cat databases/app.db" > app.db',
              '$ sqlite3 app.db ".tables"',
              '$ sqlite3 app.db "SELECT username, token FROM sessions;"'
            ]
          },
          {
            type: 'h',
            text: 'What to look at, in order'
          },
          {
            type: 'list',
            items: [
              'shared_prefs/*.xml — every value, since it is plaintext XML (m01-l07): tokens, flags, "is_admin" booleans',
              'databases/*.db — .tables then targeted SELECTs; note schema and whether sensitive columns exist at all',
              'files/ and cache/ — dumps, exports, temp files, and things apps forgot to delete',
              '/sdcard/Android/data/<pkg>/ — exports, logs, media that other storage contexts can reach',
              'Backup exposure (concept): android:allowBackup plus auto-backup rules decide whether this same data leaves the device through platform backup flows — the m03-l02 flag and this data are two halves of one finding'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This lesson is the proof engine for MASVS-STORAGE style findings: the code claim from m04-l07 ("token written to prefs") becomes a screenshot of the XML on a real device. It also feeds later tests — session tokens you extract here become the material authorization testing manipulates in m05-l06. External-storage findings write themselves: data readable over USB or by storage-permission apps is data outside the sandbox\u2019s protection.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Data access is the sensitive kind',
            text:
              'Reading app-private data means reading whatever accounts logged into it. Use dedicated test accounts on training apps and authorized targets only, keep extracted data inside the engagement workspace, and never inspect apps or accounts outside your scope.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Auth tokens, session ids, refresh tokens, or passwords in shared_prefs XML',
              'PII in databases without encryption; and PINs/codes stored for offline comparison',
              'Sensitive data in cache/ that survives app closure and clearing screens',
              'Files with world-readable-ish placement under /sdcard/Android/data/<pkg>/ (exports, logs, media)',
              'The mismatch trio: allowBackup flag (m03-l02) + what m04-l07 said the app writes + what is actually on disk here'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Drive the app through its flows first (login, sync, export) so the interesting data exists. Then run the run-as inspection session above, saving each artifact with a name that includes package, date, and step. For every sensitive value found, record three things: the exact path, the value class (token? PII? flag?), and whether m04\u2019s static review predicted it — confirming or correcting static claims is the loop that builds both skills.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Snapshot before you touch data',
            text:
              'Take an emulator snapshot before modifying or deleting anything during inspection. Restoring the pristine state keeps later tests independent of earlier ones.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'DIVA\u2019s insecure data storage challenges are this lesson as a game: one challenge stores credentials in an SQLite database inside the app directory (find it with run-as, open with sqlite3), another writes them to a file on the SD card (plain adb pull, no run-as needed). Working both shows the full spectrum — sandbox-internal plaintext versus data placed where the sandbox never protected it.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['adb run-as', 'UID-scoped shell into debuggable apps — the no-root workhorse'],
              ['adb root shell', 'Full filesystem access on rooted test images (m02-l02)'],
              ['sqlite3', 'Local or on-device database inspection'],
              ['adb pull', 'Copying evidence files to the workstation for analysis']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Inspecting before exercising the flows — empty prefs and databases look like non-findings',
              'Checking only files/ and forgetting shared_prefs, databases, and cache are separate directories',
              'Assuming prefs or databases are encrypted by default — they are plaintext unless the app explicitly encrypts (m04-l07)',
              'Reporting storage findings without the dynamic proof: the file on disk is the evidence, not the code line'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your training app: log in with a test account, sync, then run the full run-as session and save every artifact. Build the three-column table (path, value class, static prediction) and mark where m04-l07\u2019s code reading was right or wrong. Then check /sdcard/Android/data/<pkg>/ for the same app and note anything the sandbox never protected.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'run-as works on debuggable apps; root covers everything else on test images',
              'shared_prefs is plaintext XML, databases are plaintext SQLite unless the app says otherwise',
              'External app directories live outside the sandbox\u2019s real protection',
              'Dynamic artifacts confirm or correct static storage claims — keep the pairing table'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l02-q1',
          type: 'mcq',
          prompt: 'When does run-as work without root?',
          options: [
            'On any app, as long as adb is connected',
            'When the app is debuggable (manifest flag or ro.debuggable build)',
            'Only on physical devices with Magisk',
            'Only after frida-server is running'
          ],
          answerIndex: 1,
          hint: 'run-as means "run as this package\u2019s UID".',
          explanation:
            'run-as executes a command inside the target package\u2019s UID — permitted exactly when the package is debuggable. For release builds on non-rooted devices it is refused; root (m02-l02) is the alternative.'
        },
        {
          id: 'm05-l02-q2',
          type: 'truefalse',
          prompt: 'Files under /sdcard/Android/data/<package>/ enjoy the same protection as the app\u2019s internal storage.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What did m01-l07 say about external storage boundaries?',
          explanation:
            'App-specific external directories are reachable over USB/MTP and by storage-capable contexts, depending on Android version. Sensitive data there is outside the internal-sandbox protection — a storage finding on its own.'
        },
        {
          id: 'm05-l02-q3',
          type: 'short',
          prompt: 'List, in order, the app-private directories you inspect in a storage review and what each typically holds.',
          modelAnswer:
            'shared_prefs/ (plaintext XML key-value: tokens, flags), databases/ (SQLite: structured data, sessions), files/ (app-created persistent files), cache/ (temporary data that may still hold sensitive content) — plus the external counterpart /sdcard/Android/data/<pkg>/ for exports, logs, and media.',
          hint: 'Four internal directories, one external.',
          explanation:
            'A fixed inspection order prevents misses: prefs and databases are the usual secret holders, files and cache catch what apps forgot, and the external directory catches what the sandbox never protected.'
        },
        {
          id: 'm05-l02-q4',
          type: 'scenario',
          prompt:
            'm04-l07 flagged "token written to prefs". You now have the device. Describe the complete proof cycle for that finding.',
          modelAnswer:
            'Exercise the login flow with a test account (so the token exists), then adb shell run-as <pkg> cat shared_prefs/*.xml to display the token in its file context; save the output as an artifact with package/date naming. Cross-check the flag (allowBackup) and state impact in access terms (rooted/backup/debuggable contexts recover a replayable session token). The static claim is now a dynamic, evidenced finding — or, if the file shows encryption, the static hypothesis is corrected and recorded as such.',
          hint: 'Trigger, extract, save, cross-check, impact.',
          explanation:
            'Storage findings close the static-to-dynamic loop: the code said what should happen, the device shows what did. Either outcome — confirmed or corrected — is a methodological win worth recording.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Data and file storage overview',
          url: 'https://developer.android.com/topic/data-storage',
          note: 'Official storage locations this lesson inspects.'
        },
        {
          title: 'OWASP MASTG — Testing Data Storage',
          url: 'https://mas.owasp.org/MASTG/Android/0x05d-Testing-Data-Storage/',
          note: 'The canonical storage testing playbook this lesson executes.'
        },
        {
          title: 'Android Developers — <application> element',
          url: 'https://developer.android.com/guide/topics/manifest/application-element',
          note: 'Official reference for allowBackup and its backup semantics.'
        },
        {
          title: 'DIVA — Damn Insecure and Vulnerable App',
          url: 'https://github.com/payatu/diva',
          note: 'Training app with dedicated insecure-data-storage challenges.'
        }
      ]
    },
    {
      id: 'm05-l03',
      moduleId: 'm05',
      title: 'Runtime Instrumentation Concepts',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m05-l01', 'm03-l03'],
      objectives: [
        'Explain what runtime hooking is: intercepting functions inside a live process',
        'Describe why static findings need runtime verification and what instrumentation adds beyond a debugger',
        'State the roles of Frida (scriptable engine) and Objection (prebuilt commands) before touching either'
      ],
      diagram: 'frida-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'You have read the code (m04) and watched the app from outside (m05-l01/l02). Runtime instrumentation goes one level deeper: instead of observing the process, you step inside it and intercept its functions — reading arguments and return values live, and when a test plan calls for it, changing them. This lesson is the concept map; the next two lessons are the hands-on.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'frida-flow',
            caption: 'The instrumentation path: a server on the device injects an agent into the target process; your scripts talk to the agent.'
          },
          {
            type: 'h',
            text: 'What hooking actually is'
          },
          {
            type: 'list',
            items: [
              'A running app is a process: its code is loaded in memory as executable routines, its data lives on the heap',
              'Hooking redirects a function call: when the app calls checkPin(), your code runs first — it can read the arguments, call the original, and read or alter the result',
              'On Android, the same technique works at two layers: Java/Kotlin methods (via the runtime\u2019s introspection) and native functions (in .so libraries, m03-l04)',
              'An agent (script) is injected into the target process and communicates with your workstation — the same shape as a debugger, but with arbitrary programmability'
            ]
          },
          {
            type: 'h',
            text: 'Why static findings need runtime verification'
          },
          {
            type: 'p',
            text:
              'Static reading is hypothesis formation: "this method looks like the license check." Decompilers approximate (m04-l02), obfuscation hides meaning, and some values only exist at runtime (server responses, device state, user input). A hook is the measurement: log what checkPin() actually receives and returns, and the hypothesis becomes evidence. The loop this module teaches: static hypothesis > hook to observe > dynamic conclusion — with modification only ever as a scoped, deliberate next step.'
          },
          {
            type: 'table',
            headers: ['Instrument', 'What it does', 'Best at'],
            rows: [
              ['Logcat (m05-l01)', 'Reads the app\u2019s own output', 'Passive observation, zero setup'],
              ['Debugger (m05-l01)', 'Stops execution, reads state', 'Understanding one moment in detail'],
              ['Frida', 'Scriptable hooks: observe and modify functions, Java and native', 'Automation, repeatable experiments, deep questions'],
              ['Objection', 'Frida with prebuilt commands', 'Fast exploration without writing scripts']
            ]
          },
          {
            type: 'p',
            text:
              'Frida is the engine: a JS-driven agent framework you script when you need a specific experiment. Objection sits on top: the same engine driven by ready-made commands (list classes, watch a method, list storage) — the 80% of daily needs with zero scripting. In this curriculum you learn concepts here, first Frida scripts in m05-l04, Objection workflows in m05-l05.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Instrumentation is how testers answer the questions static analysis leaves open: which branch executed, what the obfuscated method returned, whether the "rooted device" check actually fired. It is equally the tool resilience testing measures with — and the reason apps ship root/instrumentation detection. Your discipline: observation is normal testing; modification (bypassing checks, forging state) is resilience work that belongs only where the engagement explicitly allows it.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Instrumentation is indistinguishable from attack tooling',
            text:
              'To the app, a hook looks exactly like a hostile debugger. That is the point on training apps — and the reason you attach only to apps you are authorized to test.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'From your m04 hypothesis list: any claim of the form "this method decides X" — each is a hook candidate',
              'Obfuscated or native methods static reading could not settle (m04-l02, m03-l04)',
              'Checks that depend on runtime-only values: device state, stored flags, server input',
              'Anti-debug/anti-frida code in the target — signals that instrumentation is itself being tested'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'No tools needed yet — this lesson\u2019s exercise is planning. Take one hypothesis from m04 (the crackme\u2019s checkPin is ideal) and write the exact question a hook should answer: what method to intercept, which argument to log, which return value to observe. Then predict: what would the log line look like on success? That prediction discipline is what makes your first real hook (m05-l04) a one-shot success instead of trial and error.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized processes only',
            text:
              'Injecting code into processes is the most invasive technique in this curriculum. It belongs on your own emulator, training apps, and written-scope targets — nothing else.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Recall the m03-l03 Smali walkthrough: checkPin compares user input against a constant. A static reader must trust that reading. An instrumented reader logs the call: argument received ("1234"), original return (false) — and now knows the exact runtime behavior without modifying anything. If the test plan later calls for modification, the same hook becomes the controlled experiment, with the observation logged first.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Frida', 'The scriptable instrumentation engine (agent injection, JS hooks)'],
              ['Objection', 'Prebuilt Frida commands for exploration without scripts'],
              ['adb forward', 'The tunnel that connects workstation tooling to on-device servers'],
              ['Your m04 hypothesis list', 'The queue of questions instrumentation will answer']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Treating hooks as a bypass tool by default — observation first, modification only when scoped',
              'Assuming instrumentation is invisible: modern apps detect it, and that detection is a finding about the app, not about you',
              'Confusing hooking with debugging: the debugger reads state at a pause; hooks run programmable code at every call',
              'Skipping the concept and pasting scripts blindly — unmaintained hook collections are how sessions break silently'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Write three hook specifications from your hypothesis list in the format: method (class + signature), observation goal (log args? return value?), and expected output if the static claim is true. Bring them to m05-l04 — they are exactly what your first scripts will implement.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Hooking = intercepting functions inside a live process, at Java or native level',
              'Static claims become evidence when a hook logs real arguments and returns',
              'Frida is the scriptable engine; Objection is its prebuilt-command wrapper',
              'Observe first; modify only as explicitly scoped resilience work'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l03-q1',
          type: 'mcq',
          prompt: 'What does hooking a method do at runtime?',
          options: [
            'Recompiles the method in the APK',
            'Redirects calls to the method so your code runs first, then (optionally) the original',
            'Attaches a read-only debugger session',
            'Replaces the app\u2019s DEX file on disk'
          ],
          answerIndex: 1,
          hint: 'It happens in memory, per call.',
          explanation:
            'A hook intercepts calls to a function inside the running process: your code observes (and, if scoped, modifies) arguments and results. Nothing on disk changes — that is what makes it dynamic analysis.'
        },
        {
          id: 'm05-l03-q2',
          type: 'truefalse',
          prompt: 'If decompiled code looks clear, runtime verification of security-critical logic is still worthwhile.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What can differ between written logic and executed logic?',
          explanation:
            'Clear decompilation is still a reconstruction, and runtime-only inputs (device state, server data) do not appear in code. Logging the live call confirms the hypothesis — the static-then-dynamic loop of this module.'
        },
        {
          id: 'm05-l03-q3',
          type: 'short',
          prompt: 'State the division of labor between Frida and Objection.',
          modelAnswer:
            'Frida is the scriptable instrumentation engine — you write JS hooks for specific, custom experiments (and it covers native as well as Java). Objection drives the same engine through prebuilt commands (list activities, watch class, list storage) for fast standard exploration without scripting.',
          hint: 'Engine versus ready-made commands.',
          explanation:
            'The pairing matters practically: reach for Objection first for common questions, drop to raw Frida scripts when the question is specific (m05-l04) or Objection\u2019s vocabulary runs out (m05-l05).'
        },
        {
          id: 'm05-l03-q4',
          type: 'scenario',
          prompt:
            'A teammate proposes hooking an in-scope app\u2019s license check to return true so "the feature can be tested". What is the right sequence?',
          modelAnswer:
            'First hook to observe: log the arguments, return value, and calling context — understand exactly what the check does and what state it reads (understand-then-verify). Record the observation. Only if the test plan explicitly covers demonstrating a bypass of client-side checks should a modification be attempted, on the training/scope-approved build, logged as a separate patch-style experiment with its own evidence — and the report must still state whether the server enforces the same rule.',
          hint: 'The mindset this module keeps repeating.',
          explanation:
            'Understand-then-verify: observation is standard testing; modification is resilience work that requires explicit scope and produces different findings. Skipping the observation step loses the finding either way.'
        }
      ],
      references: [
        {
          title: 'Frida',
          url: 'https://frida.re/',
          note: 'The instrumentation toolkit — homepage and documentation portal.'
        },
        {
          title: 'Frida — documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'Architecture and concepts behind the flow diagram in this lesson.'
        },
        {
          title: 'Objection — runtime exploration toolkit',
          url: 'https://github.com/sensepost/objection',
          note: 'The prebuilt-command layer introduced conceptually here, hands-on in m05-l05.'
        }
      ]
    },
    {
      id: 'm05-l04',
      moduleId: 'm05',
      title: 'First Steps with Frida',
      difficulty: 'Beginner',
      minutes: 30,
      prerequisites: ['m05-l03', 'm02-l03'],
      objectives: [
        'Install the frida-tools client and run a version-matched frida-server on your emulator',
        'Distinguish attach from spawn and choose correctly per scenario',
        'Write a first Java hook that logs a method\u2019s arguments and return value'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Time to touch the tool. Frida has two halves: a client on your workstation (pip install frida-tools) and a server on the device (frida-server). When versions match and the tunnel is up, you can list processes, attach to the training app, and run your first hook — logging exactly what the m05-l03 planning exercise predicted.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Setup: client, server, tunnel'
          },
          {
            type: 'terminal',
            title: 'Client install and frida-server on the emulator',
            lines: [
              '$ pip install frida-tools',
              '$ frida --version',
              '17.2.14',
              '# download frida-server for the emulator ABI (x86_64) at the SAME version from the Frida releases',
              '$ adb root && adb push frida-server-17.2.14-android-x86_64 /data/local/tmp/frida-server',
              '$ adb shell "chmod 755 /data/local/tmp/frida-server"',
              '$ adb shell "/data/local/tmp/frida-server &"',
              '$ frida-ps -U | head',
              ' PID  Name',
              ' ----  ------------------------------',
              ' 3245  com.example.training'
            ]
          },
          {
            type: 'p',
            text:
              'frida-ps -U lists processes over USB/emulator transport. The two failure modes to know cold: version mismatch (client and server must be the same release — the error is a version greeting failure) and ABI mismatch (an arm64 binary on an x86_64 image never starts). Root is needed to run frida-server on the device — which the m02-l02 emulator provides.'
          },
          {
            type: 'h',
            text: 'Attach versus spawn'
          },
          {
            type: 'table',
            headers: ['Mode', 'Command', 'When'],
            rows: [
              ['Attach', 'frida -U -n com.example.training', 'App already running; you want to observe a live flow'],
              ['Spawn', 'frida -U -f com.example.training --no-pause', 'You need hooks active before app code runs (startup checks, early initialization)'],
              ['REPL', 'frida -U -n <name> (interactive console)', 'Exploring interactively before writing a script']
            ]
          },
          {
            type: 'p',
            text:
              'Spawn matters whenever an app makes decisions during startup (root/debug detection, license state loading): attach-after-launch arrives too late to observe those calls. For a first session, attach is friendlier; the moment a check seems to fire early, switch to spawn.'
          },
          {
            type: 'h',
            text: 'Your first hook'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'log-checkPin.js — observe only',
            code:
              'Java.perform(function () {\n    var Login = Java.use("com.example.training.LoginActivity");\n\n    Login.checkPin.overload("java.lang.String").implementation = function (pin) {\n        console.log("[+] checkPin called with: " + pin);\n        var result = this.checkPin(pin);   // call the original\n        console.log("[+] original returned: " + result);\n        return result;                     // behavior unchanged\n    };\n});'
          },
          {
            type: 'p',
            text:
              'Read it against the m05-l03 spec: Java.perform enters the Java runtime context; Java.use resolves the class your static review named; overload selects the exact signature; the replacement implementation logs the argument, calls the original with this, and returns its result untouched. Observation-only by construction — the habit the concepts lesson installed.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This exact loop — class name from m04-l02, hook from m05-l03\u2019s spec, runtime truth in the console — is the daily work of dynamic analysis: confirming what a check really receives and returns, watching obfuscated methods you could not read, and observing values that never appear in code. Every later dynamic module (network, resilience, authorization) reuses these mechanics with different targets.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Hooks on authorized targets only',
            text:
              'frida-server grants code-level access to any process on the device it runs on. Run it solely on your own test devices and emulators, and hook only apps you are authorized to assess.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes and methods the app exercises immediately at startup — prime hook candidates (frida-server attach, version check, license logic)',
              'Runtime-only behavior: values that differ from the decompiled constants, dynamic class loading, user-agent or header strings assembled in code',
              'Your own hook output quality: are you logging arguments and return values, or only guessing from method names?'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Run the first session',
            lines: [
              '$ frida -U -n com.example.training -l log-checkPin.js',
              '[+] checkPin called with: 1111',
              '[+] original returned: false',
              '[+] checkPin called with: 4871',
              '[+] original returned: true',
              '# Ctrl-C / q to leave; the app continues unmodified'
            ]
          },
          {
            type: 'p',
            text:
              'Drive the app\u2019s PIN screen twice — once with a wrong value, once with the right one from your m04 static analysis — and compare the log lines with your prediction. Then re-run with frida -U -f to see spawn delay the app until hooks are armed. Record which mode fit which question; that decision is now yours to make on every future target.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'One class at a time',
            text:
              'Keep first scripts single-purpose: one class, one method, two log lines. Small hooks are debuggable hooks — and their output maps one-to-one to your hypothesis list.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Against UnCrackable-Level1-style crackmes, the same script shape (pointed at the class your m04-l02 navigation identified) turns the secret check into a printed transcript: the method receives the input, and the original comparison result appears before the app reacts. Nothing was bypassed — yet the static claim "this method decides the unlock" is now measured runtime fact, ready for the authorization workflow of m05-l06.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['pip + frida-tools', 'Workstation client: frida, frida-ps, frida-trace'],
              ['frida-server', 'Root-run daemon on the emulator, version- and ABI-matched'],
              ['adb', 'Push, chmod, launch the server; -U transport handles the tunnel'],
              ['jadx-gui (still)', 'The source of exact class and method names your hooks reference']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Client and frida-server version mismatch — the most common first-session failure; check frida --version against the binary you pushed',
              'Wrong ABI server binary (arm64 on x86_64) — the server never starts; match the emulator image',
              'Attaching when you needed spawn: startup checks finish before your late hooks exist',
              'Using Java.use on the wrong overload or class name (m04-l02 names must be exact — copy them from the decompiler)'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Complete the full first-session arc on your training app: install the client, run the matching server, frida-ps to confirm visibility, attach with the log-checkPin.js script (or your m05-l03 spec equivalent), and capture the four-line transcript for a wrong and a right input. Then answer in one sentence: what did runtime show that static could not?'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Client (pip) + server (root, version- and ABI-matched) + frida-ps = a working session',
              'Attach for live flows; spawn when startup decisions matter',
              'A first hook is Java.use + overload + log-args + call-original + return — observation by default',
              'Runtime output is the measurement that turns m04 hypotheses into evidence'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l04-q1',
          type: 'mcq',
          prompt: 'Frida prints a version negotiation error on connect. What is the first thing to check?',
          options: [
            'That the emulator has Play Store enabled',
            'That client (frida --version) and frida-server binary versions match exactly',
            'That the app is debuggable',
            'That USB debugging is authorized'
          ],
          answerIndex: 1,
          hint: 'The two halves must speak the same release.',
          explanation:
            'frida client and frida-server must be the same version — a mismatched greeting is the classic first-session failure. ABI mismatch is the sibling failure (wrong architecture binary pushed).'
        },
        {
          id: 'm05-l04-q2',
          type: 'truefalse',
          prompt: 'To observe checks that run before the app\u2019s UI appears, you should use spawn (-f) rather than attach (-n).',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'When does app code first execute?',
          explanation:
            'Spawn starts the process paused, lets your hooks arm, then resumes — so early initialization and startup checks happen under observation. Attach only sees calls after you connect.'
        },
        {
          id: 'm05-l04-q3',
          type: 'short',
          prompt: 'Name the three Java.* calls (or steps) in the first hook script and what each does.',
          modelAnswer:
            'Java.perform(fn) — enters the Java runtime context on the app thread; Java.use("fully.qualified.Class") — resolves the target class wrapper; method.overload("signature").implementation = fn — selects the exact overload and installs the intercepting implementation (which logs, calls the original via this.method(args), and returns its result).',
          hint: 'Context, class, method signature.',
          explanation:
            'Every Java hook follows this skeleton. Exact names come from the decompiler (m04-l02); the implementation body defines observe-only versus modify behavior.'
        },
        {
          id: 'm05-l04-q4',
          type: 'scenario',
          prompt:
            'Your hook loads, but no log lines appear when you use the app. Give a three-step diagnosis.',
          modelAnswer:
            '1) Confirm the session actually attached (REPL prompt alive, frida-ps shows the pid) — or switch to spawn in case the method ran before attach. 2) Verify the class/method name and overload signature against jadx-gui (exact package, correct parameter types) — silent no-op hooks are usually name mismatches. 3) Confirm the code path really executes (trigger the exact UI flow, check the method is not dead code) and that console.log output is being shown in the current session.',
          hint: 'Session, names, execution.',
          explanation:
            'Silent hooks almost always trace to one of: wrong mode (attach vs spawn), wrong name/overload, or a method that never runs on the path you exercised. The diagnosis order mirrors those odds.'
        }
      ],
      references: [
        {
          title: 'Frida — Installation',
          url: 'https://frida.re/docs/installation/',
          note: 'Official client and server installation, including version matching.'
        },
        {
          title: 'Frida — Frida CLI',
          url: 'https://frida.re/docs/frida-cli/',
          note: 'Official CLI reference: attach, spawn, -l script loading.'
        },
        {
          title: 'Frida — JavaScript API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'The Java.* API your first hook uses.'
        }
      ]
    },
    {
      id: 'm05-l05',
      moduleId: 'm05',
      title: 'Objection: Runtime Exploration Without Scripts',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m05-l04', 'm02-l02'],
      objectives: [
        'Start an Objection session on a running app (explore) and understand what patchapk changes',
        'Use the core exploration commands: enumerate classes/activities, watch a class, list storage, launch intents',
        'Decide when Objection is the right tool versus a custom Frida script'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'm05-l04 taught you to write hooks; most sessions, most of the time, need answers that already have commands. Objection bundles the standard moves — enumerate the app\u2019s classes and activities, watch everything a class does, list its storage, launch its components — into a REPL driven by short commands. Think of it as Frida with a toolbox attached.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Two ways in'
          },
          {
            type: 'list',
            items: [
              'objection explore — connects through the running frida-server (m05-l04) to an already-installed app: the fast path on your own emulator',
              'objection patchapk — injects the Objection gadget into an APK (decode, add the gadget, rebuild, sign): the path when you cannot or do not want to run frida-server, e.g. handing an instrumented build to a device. The output is a modified, re-signed package — all the m04-l03 rules and legality apply',
              'Both end in the same interactive prompt with the same command vocabulary'
            ]
          },
          {
            type: 'terminal',
            title: 'An exploration session',
            lines: [
              '$ objection explore',
              'com.example.training on (android: 14) [usb]',
              'android hooking list activities',
              'com.example.training.MainActivity',
              'com.example.training.AdminActivity',
              'android hooking watch class com.example.training.AdminActivity',
              '# (each method invocation in that class now prints as it happens)',
              'android hooking watch class_method com.example.training.AdminActivity.grantAccess --dump-args --dump-return',
              'storage list',
              'Plugin: /data/data/com.example.training/shared_prefs (6 files)',
              'intent launch_activity com.example.training.AdminActivity'
            ]
          },
          {
            type: 'table',
            headers: ['Command family', 'What it answers'],
            rows: [
              ['android hooking list activities/services', 'The live component inventory (cross-check the m04-l05 manifest audit)'],
              ['android hooking watch class / watch class_method', 'What a class does at runtime: calls, arguments, return values'],
              ['storage list / storage details', 'Where the app keeps data — a guided version of m05-l02'],
              ['android intent launch_activity / launch_service', 'Drives components directly (the dynamic twin of m04-l05\u2019s audit)'],
              ['memory list modules', 'Loaded native libraries — orients m03-l04 findings at runtime']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Objection compresses the first hour on any new target: enumerate what exists, watch the interesting class, list the storage, fire the component — all without writing a line of JS. It is also the bridge between static artifacts and runtime truth: the manifest table from m04-l05 becomes list activities, and the classes you flagged in m04-l02 become watch class targets whose live behavior you can read.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Toggle commands are resilience work',
            text:
              'Objection also ships commands that disable SSL pinning or root detection. On training apps they are fair game for learning; on engagements they are resilience-testing actions that belong only where the test plan explicitly includes them — document intent in your test log before running such commands.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes from your m04 audit that you have not yet seen execute — watch them live',
              'Storage locations storage list reveals beyond what run-as showed (m05-l02)',
              'Methods whose runtime arguments differ from the static expectation',
              'Components launchable via intent commands that the UI never exposes'
            ]
          }
        ],
        howToTest: [
          {
            type: 'p',
            text:
              'Run the exploration session above against your training app, then go one step further on each family: list the components and reconcile against your m04-l05 table (anything added by libraries? anything missing?), watch the class your m04-l02 flagged and trigger its flow, list storage and compare with the m05-l02 run-as session, and launch the exported component you starred. Every command output gets filed against the static artifact it verifies.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Instrumented builds are modified apps',
            text:
              'A patchapk gadget build is a re-signed, modified package (m04-l03 rules). Create it only for training apps or authorized targets, on your own devices — and expect signature-checking apps to notice, which is itself a documented resilience signal.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On a crackme: list activities reveals a hidden admin screen the UI never links; watch class_method on its grant method shows the exact arguments it expects; intent launch_activity opens it directly. Three commands, one complete component finding — and the static audit from m04-l05 predicted every step of it.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['objection explore', 'REPL over the running frida-server — the daily driver'],
              ['objection patchapk', 'Gadget injection for instrumented builds (decode/rebuild/sign under the hood)'],
              ['Frida (underneath)', 'Objection runs on it — version compatibility with frida-server still applies'],
              ['adb', 'Installs the patched build when you use the gadget path']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Forgetting that patchapk output is re-signed — signature checks fire, and the original app must be uninstalled first',
              'Watching huge classes and drowning in output — watch the specific class_method with --dump-args --dump-return instead',
              'Reaching for exotic toggles (pinning/root bypass) before the boring enumeration commands produced findings',
              'Mixing gadget mode and frida-server mode in one session and misreading which agent is actually attached'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run one full Objection session where every command answers an item from your m04 hypothesis list: enumerate, watch, storage, launch. Write down which three commands produced the most report-relevant evidence fastest — that personal ranking becomes your default opening sequence on every future target.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'explore rides frida-server; patchapk builds an instrumented (re-signed) package — same REPL either way',
              'The core families: enumerate, watch, storage, launch — each cross-checks a static artifact',
              'watch class_method --dump-args --dump-return is the precision instrument; class-wide watch is for discovery',
              'Objection first, custom Frida scripts when the question outgrows the vocabulary'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l05-q1',
          type: 'mcq',
          prompt: 'What does objection patchapk actually produce?',
          options: [
            'A config file for the running app',
            'A modified APK with the Objection gadget injected, rebuilt and re-signed',
            'A frida-server binary for the device',
            'A decompiled source tree'
          ],
          answerIndex: 1,
          hint: 'It is the m04-l03 pipeline with an extra step.',
          explanation:
            'patchapk decodes the APK, injects the gadget library, rebuilds and re-signs it. The result is an instrumented package — a modified app in every legal and technical sense (m04-l03).'
        },
        {
          id: 'm05-l05-q2',
          type: 'truefalse',
          prompt: 'android hooking watch class_method prints the method\u2019s arguments and return value at runtime.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Add --dump-args --dump-return.',
          explanation:
            'Watching a specific method with those flags logs live invocations: arguments in, result out — the prebuilt version of the m05-l04 first hook.'
        },
        {
          id: 'm05-l05-q3',
          type: 'short',
          prompt: 'Give two situations where patchapk (gadget) is preferable to objection explore via frida-server.',
          modelAnswer:
            'Any two of: no root access on the test device (gadget ships inside the app, no frida-server needed); handing an instrumented build to a colleague or lab device that should not run a root daemon; persistent instrumentation across reinstalls for a specific assessment build; when you want the app to carry its own agent without workstation-side setup at run time.',
          hint: 'When can you not run frida-server?',
          explanation:
            'The gadget path trades a re-signed package for independence from root/frida-server. On your own rooted emulator, explore is faster; on locked devices or shared lab builds, the gadget wins.'
        },
        {
          id: 'm05-l05-q4',
          type: 'scenario',
          prompt:
            'Your m04-l05 audit lists an exported AdminActivity. Give the three Objection commands that turn that static row into runtime evidence.',
          modelAnswer:
            'android hooking list activities (confirm the component is live and list its siblings); android hooking watch class_method com.example.training.AdminActivity.<entry-method> --dump-args --dump-return (capture what it receives and returns when invoked); android intent launch_activity com.example.training.AdminActivity (invoke it directly and observe the behavior). Together they show: exists, expects, and what happens — the runtime completion of the static audit.',
          hint: 'Enumerate, watch, launch.',
          explanation:
            'The three-command arc maps one-to-one onto the static audit table: existence, input expectations, and reachable behavior. Findings from it cite both artifacts.'
        }
      ],
      references: [
        {
          title: 'Objection — runtime exploration toolkit',
          url: 'https://github.com/sensepost/objection',
          note: 'Official repository: patchapk usage and the command vocabulary.'
        },
        {
          title: 'Frida — documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'The engine Objection drives; version compatibility lives here.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Instrumentation-based test procedures — see the runtime tests for your MASTG version.'
        }
      ]
    },
    {
      id: 'm05-l06',
      moduleId: 'm05',
      title: 'Testing Authentication and Authorization at Runtime',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m05-l04', 'm05-l05', 'm04-l05'],
      objectives: [
        'Observe what an app actually checks locally for auth and integrity state on training apps',
        'Apply the understand-then-verify mindset to client-side checks',
        'Test whether privileged functionality is reachable without valid state, and classify what enforces it'
      ],
      diagram: 'dynamic-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Everything so far was instruments; this lesson is the first full test. Authentication and authorization on mobile have two layers: what the app checks on the device (session flags, unlock booleans, root/debug state) and what the backend actually enforces. Client-side checks are hypotheses about security — this lesson teaches you to observe them honestly, verify reachability, and report exactly which layer does the protecting.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'dynamic-workflow',
            caption: 'The dynamic loop: static hypothesis, runtime observation, controlled verification, classified conclusion.'
          },
          {
            type: 'h',
            text: 'The understand-then-verify mindset'
          },
          {
            type: 'list',
            items: [
              'Understand: hook the check to observe it (m05-l04 skills) — what does it read (prefs flag? token? signature?), what does it return, who calls it?',
              'Verify: reproduce the check\u2019s decision path with real inputs — right token, wrong token, missing token, expired token',
              'Only then, and only if the test plan covers it: demonstrate what happens without valid state (the controlled bypass experiment)',
              'Classify: is the decision purely client-side (UI gating) or is there server-side enforcement behind it?'
            ]
          },
          {
            type: 'h',
            text: 'The test matrix'
          },
          {
            type: 'table',
            headers: ['Probe', 'Method (this module\u2019s tools)', 'What it shows'],
            rows: [
              ['What does the local check read?', 'Frida hook on the check method: log args + return (m05-l04)', 'The exact state the decision depends on'],
              ['When does the check run?', 'Spawn-mode hooking; watch class (m05-l05)', 'Startup vs per-screen enforcement'],
              ['Can privileged UI be reached directly?', 'Exported-component launch (m05-l05, from the m04-l05 audit)', 'Whether navigation gates anything at all'],
              ['What does the app do with invalid state?', 'Replay/modify requests in the proxy (m02-l04) and watch behavior', 'Whether the server enforces the same rule'],
              ['Does anything detect the experiment?', 'Observe logs and app behavior during all of the above', 'Resilience posture (a finding in the app\u2019s favor)']
            ]
          },
          {
            type: 'p',
            text:
              'The matrix is deliberately symmetrical: the same instruments that observe can modify, but the test\u2019s value comes from knowing which layer enforces what. A client-side "is_admin" flag that unlocks an admin screen means nothing if every API call behind it fails server-side — that is a low-severity UI finding. The reverse — sensitive data reachable with missing or invalid tokens — is a high-severity authorization finding backed by server evidence.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'This is where m04 and m05 converge into report-grade findings: m04-l05\u2019s exported-component audit supplies the entry points, m04-l07\u2019s storage review supplies the state that gates them, and this lesson\u2019s hooks and launches demonstrate reachability. The report writes itself in three parts — observation (what the check does), verification (what is reachable without valid state), enforcement classification (client-only vs server-backed) — and the impact rating follows the classification, not the flashy bypass.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'The bright line',
            text:
              'Hooking and state manipulation on training apps and authorized targets is testing; doing it to anything else is unauthorized access. Bypass demonstrations only where the engagement explicitly includes resilience/bypass testing; observing and classifying is always in bounds, forging credentials or accessing other users\u2019 data never is.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Local auth state: boolean prefs flags, token-presence checks, license/root/debug booleans (m04-l07 told you where these live)',
              'Checks that only gate navigation: screens reachable by exported components (m04-l05) or direct launch (m05-l05)',
              'Asymmetries between client gating and API behavior: screens that open but load nothing (server enforced) vs screens that serve data (not enforced)',
              'Detection signals: the app noticing hooks, re-signs, or missing state — resilience findings to document positively'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'The observation-then-verification arc on a training app',
            lines: [
              '$ frida -U -f com.example.training -l observe-auth.js   # spawn: hook the check early',
              '[+] AuthCheck.isUnlocked() -> reads pref "premium" = false, returned false',
              '$ objection explore',
              'android intent launch_activity com.example.training.PremiumActivity',
              '# screen opens but every data call 401s -> navigation gate only; server enforces',
              'android hooking watch class_method com.example.training.AuthCheck.isUnlocked --dump-args --dump-return',
              '# drive the real flows; record when/what the check reads during normal use'
            ]
          },
          {
            type: 'p',
            text:
              'Then write the finding in the three-part structure: observation (what the check reads and when), verification (what was reachable without valid state, with the exact commands), classification (client-only vs server-backed, with the proxy evidence from m02-l04). If the app detected the instrumentation or refused manipulated state, that is a resilience paragraph in the app\u2019s favor — document it as such.'
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Never touch other users\u2019 state',
            text:
              'Authorization testing uses only your own accounts and test data. Probing whether the system separates users is in scope; accessing or modifying data that belongs to anyone else is not — regardless of what the app allows.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A MASTG-style crackme gates its secret behind a local boolean. The arc: spawn-hook AuthCheck.isUnlocked() to see it read the pref; observe that the premium screen\u2019s API calls carry no valid session (server rejects them); launch the screen directly to demonstrate the UI gate is navigation-only; report: client-side gating only, no sensitive data exposed, server correctly enforces — severity low, with a note that the check is bypassable but protects nothing by itself. The honest classification is the skill; on training apps where the server is absent by design, the report says exactly that.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Frida (spawn mode)', 'Observe the auth checks from process start'],
              ['Objection', 'Launch components, watch methods, list the state the checks read'],
              ['Burp (m02-l04)', 'The server-side half: do APIs honor the client\u2019s decision?'],
              ['Your m04-l05/l07 artifacts', 'The entry points and state locations this test consumes']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Reporting "bypassed the check" without classifying enforcement — a UI gate and a data breach are different findings',
              'Modifying state before observing it: the bypass proves less than the observation, and breaks attribution',
              'Testing authorization against real accounts or other users\u2019 data',
              'Ignoring detection behavior — an app that notices your experiment is documenting its own resilience, in your report\u2019s favor'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full arc on your training app: understand one local check (hook, observe), verify its reachability (launch, watch, and if present check API behavior through the proxy), and write the three-part finding. Then repeat on a second check of a different kind (root detection is a good contrast) and note how the classification changes when nothing server-side exists at all.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Understand-then-verify: observe what the check reads before ever considering modification',
              'The finding is the classification: client-only gating vs server-backed enforcement',
              'Reachability comes from m04-l05\u2019s audit plus m05-l05\u2019s launch commands; state comes from m04-l07/m05-l02',
              'Detection and refusal are resilience findings in the app\u2019s favor — document them as such'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm05-l06-q1',
          type: 'mcq',
          prompt: 'A premium screen opens when launched directly, but every data request behind it returns 401. How is this classified?',
          options: [
            'Critical authorization bypass — privileged data is exposed',
            'Client-side navigation gate only; the server enforces authorization correctly',
            'A proxy misconfiguration',
            'Proof the app has no authentication at all'
          ],
          answerIndex: 1,
          hint: 'What actually protected the data?',
          explanation:
            'The client-side check gates UI, not access; the API rejects unauthorized calls, so the server enforces the real boundary. Severity is low — the finding documents where the check lives, not a data exposure.'
        },
        {
          id: 'm05-l06-q2',
          type: 'truefalse',
          prompt: 'The proper order is: observe what a check reads, verify reachability, and only then consider a bypass demonstration if it is in scope.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'The mindset m05-l03 installed.',
          explanation:
            'Observation builds understanding and evidence; verification shows what state actually gates; bypass demonstrations are scoped resilience work that comes last, if at all.'
        },
        {
          id: 'm05-l06-q3',
          type: 'short',
          prompt: 'Name the three parts of a report-grade runtime authorization finding.',
          modelAnswer:
            '1) Observation: what the local check reads (pref/flag/token), when it runs, what it returns. 2) Verification: what was reachable without valid state, with the exact commands/requests as evidence. 3) Enforcement classification: purely client-side vs server-backed, with proxy evidence showing which layer rejected or accepted the invalid state.',
          hint: 'What it does, what it protects, who enforces.',
          explanation:
            'The three-part structure forces the classification that severity depends on — and produces the same shape of evidence for any app you test afterward.'
        },
        {
          id: 'm05-l06-q4',
          type: 'scenario',
          prompt:
            'During the arc, the training app crashes whenever your hook is attached and logs "instrumentation detected". How do you handle and report this?',
          modelAnswer:
            'Treat it as a resilience finding: the app detects instrumentation and refuses to run — a positive control, evidenced by the log lines and the crash-on-attach repro. Document the detection mechanism statically if identifiable (m04-l02), record the conditions (attach vs spawn behavior), and stop the dynamic arc there unless resilience/bypass work is explicitly in scope. The finding is in the app\u2019s favor and belongs in the report as such.',
          hint: 'The app defended itself — whose finding is that?',
          explanation:
            'Detection behavior is the resilience layer working. Honest reporting records it as a positive control with evidence; bypassing it is separate, explicitly scoped work — never an assumed next step.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — Testing Platform Interaction',
          url: 'https://mas.owasp.org/MASTG/Android/0x05h-Testing-Platform-Interaction/',
          note: 'The component and authorization test procedures this lesson chains together.'
        },
        {
          title: 'Frida — documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'The hooking API used in the observation step.'
        },
        {
          title: 'PortSwigger — Burp Proxy documentation',
          url: 'https://portswigger.net/burp/documentation/desktop/tools/proxy',
          note: 'The server-side enforcement half of the test matrix (m02-l04 revisited).'
        }
      ]
    }
  ]
};
