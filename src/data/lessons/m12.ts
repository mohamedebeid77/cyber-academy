import type { Module } from '../../types';

// LEVEL 8 — DYNAMIC & BINARY · Module 12: Frida & Runtime Instrumentation
// Original curriculum content synthesized from public official documentation:
// frida.re (docs and API reference), the frida GitHub project, and OWASP MASTG.
// All prose is original; reference links point to the official sources used for
// study. All examples target authorized training apps (MASTG crackmes).

export const m12: Module = {
  id: 'm12',
  title: 'Frida & Runtime Instrumentation',
  level: 8,
  description:
    'The complete Frida path: architecture and setup, Java hooking fundamentals, overloads and constructors, tracing to map app behavior, and native hooking with Interceptor — every example against authorized training targets.',
  outcomes: [
    'Explain the Frida client, server, and agent architecture and keep a working connection to a device',
    'Write Java hooks that observe, modify, and fully replace method behavior',
    'Enumerate classes and methods and trace calls to map what an app really does at runtime',
    'Attach to native functions and read or change arguments and return values safely'
  ],
  lessons: [
    {
      id: 'm12-l01',
      moduleId: 'm12',
      title: 'Frida Architecture and Setup',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m05-l04'],
      objectives: [
        'Name the components of Frida and describe how your script reaches the target process',
        'Set up frida-server on an emulator or rooted device and connect from the workstation',
        'Choose between USB and TCP transport and fix the most common connection problems'
      ],
      diagram: 'frida-flow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Static analysis reads a snapshot; instrumentation watches and changes a running process. Frida is the standard toolkit for the second job: it injects a JavaScript engine into a target app so you can inspect and rewrite its behavior live, from a script you control on your workstation.'
          },
          {
            type: 'p',
            text:
              'Before writing a single hook you need the plumbing to work reliably. Most "Frida is broken" hours are actually version mismatches, wrong-architecture servers, or a server that quietly died. This lesson makes the machinery boring — which is exactly what you want.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'frida-flow',
            caption: 'Your script travels: workstation client -> adb -> frida-server -> injected agent -> app process.'
          },
          {
            type: 'h',
            text: 'The four moving parts'
          },
          {
            type: 'list',
            items: [
              'Client tools — frida (CLI/REPL), frida-ps, frida-trace, objection: run on your workstation and speak the Frida protocol',
              'frida-server — a daemon you run on the device (as root) that performs the injection into target processes',
              'The agent — Frida\u2019s Gum JavaScript engine, injected into the app process; your script runs inside the app, not on your workstation',
              'The transport — USB (via adb) by default, or TCP through adb forward / a network listener for remote setups'
            ]
          },
          {
            type: 'p',
            text:
              'Version matching matters: the client (frida-tools installed via pip) and the frida-server binary must be the same major.minor series. A mismatch produces cryptic "unable to communicate" or protocol errors that look like anything but a version problem.'
          },
          {
            type: 'code',
            lang: 'bash',
            title: 'Workstation and server preparation',
            code:
              'pip install frida-tools\nfrida --version                       # note the X.Y.Z you just installed\nadb shell getprop ro.product.cpu.abi  # arm64-v8a -> android-arm64 server\n# download frida-server-X.Y.Z-android-arm64.xz from\n# github.com/frida/frida/releases (match your version AND the device arch)'
          },
          {
            type: 'terminal',
            title: 'frida-server lifecycle on the device',
            lines: [
              '$ adb push frida-server /data/local/tmp/',
              '$ adb shell chmod 755 /data/local/tmp/frida-server',
              '$ adb shell',
              '$ su',
              '# /data/local/tmp/frida-server &',
              '# exit',
              '$ frida-ps -U | head',
              '  PID  Name',
              ' 4321  com.training.crackme1'
            ]
          },
          {
            type: 'h',
            text: 'USB versus TCP'
          },
          {
            type: 'p',
            text:
              'The -U flag talks over USB through adb and is what you will use 95% of the time, on emulators included. Over TCP, forward the Frida port and connect to it: adb forward tcp:27042 tcp:27042 followed by frida -H 127.0.0.1:27042. Remote devices can also run frida-server with a network listener (-l 0.0.0.0), which is convenient for shared lab devices — and means you must treat that port as sensitive access.'
          },
          {
            type: 'p',
            text:
              'Lifecycle reality: frida-server is an ordinary process. It dies when the device reboots, it needs root to inject, and it stays running until you kill it. Restart it after every emulator reset; automate the start if you forget.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'It will get flagged — expect it',
            text:
              'Frida is a dual-use instrumentation tool. Host antivirus may quarantine tools, and hardened apps may detect and refuse to run under instrumentation (that detection is itself a topic in later modules). Use dedicated test devices and emulators, never your daily driver.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every dynamic technique in the rest of this module — observing arguments, forcing verdicts, tracing calls, hooking native checks — rides on this setup. A five-minute version check before an engagement saves an hour of debugging mid-test, and knowing that the agent runs inside the app explains what the app can (and cannot) detect about you.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'frida --version on the workstation versus the frida-server binary version you pushed — they must match',
              'ro.product.cpu.abi before choosing the server artifact (android-arm64 vs android-x86_64)',
              'frida-ps -U as the canonical is-it-alive check before every session',
              'SELinux denials in logcat when the server fails to start on locked-down builds'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Instrumentation is privileged access',
            text:
              'Frida runs your code inside the target process with the app\u2019s own privileges. That is only legitimate on devices you own and apps you are authorized to test — your own builds, training crackmes, or contracted engagements.'
          },
          {
            type: 'p',
            text:
              'A complete health check takes under a minute: confirm the server is alive, list installed apps, then spawn one with an empty script to prove the whole chain works.'
          },
          {
            type: 'terminal',
            title: 'Connection health check',
            lines: [
              '$ frida-ps -Uai',
              '  PID  Name                    Identifier',
              '  4321  UnCrackable (training)  com.training.crackme1',
              '$ frida -U -f com.training.crackme1',
              'Spawned com.training.crackme1. Resuming main thread!',
              '[Local::com.training.crackme1]-> Java.available',
              'true',
              '[Local::com.training.crackme1]-> exit'
            ]
          },
          {
            type: 'p',
            text:
              'If Java.available printed true, the injected agent is alive inside the app and the JS engine is ready. On older frida-tools versions the process stays paused after spawn; type %resume in the REPL to start it.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'End-to-end setup on a training emulator: install frida-tools via pip, check frida --version (say 17.2.x), download frida-server-17.2.x-android-arm64, push and chmod it, start it in a root shell, and run frida-ps -Uai. Spawning the MASTG-style crackme with frida -U -f and seeing the REPL prompt inside the app is your proof that client, transport, server, and agent all agree.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['frida (CLI/REPL)', 'Attach, spawn, and run scripts interactively'],
              ['frida-ps', 'Verify the connection; list processes and installed apps'],
              ['frida-trace', 'Auto-generate tracing hooks (lesson m12-l04)'],
              ['objection', 'Prebuilt mobile instrumentation toolkit built on Frida'],
              ['adb', 'Push and run frida-server; tunnel TCP when needed']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Mixing client and server versions — upgrading pip packages without replacing frida-server produces mysterious protocol errors',
              'Pushing the wrong architecture server (an android-arm server on an x86_64 emulator)',
              'Forgetting chmod 755, or starting the server without root — it exits silently',
              'Assuming the server survives a reboot; it does not — restart it or automate the start',
              'Using -H against a device without adb forward (or a deliberate network listener) in place'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Do the full setup on your emulator: install frida-tools, push the matching frida-server, start it as root, and run the three health checks (frida-ps -U, frida-ps -Uai, spawn with frida -U -f). Then reboot the emulator, predict what breaks, and fix it from memory. Write down the exact commands you needed — that list is your personal runbook.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Frida = workstation client + device frida-server + injected agent (JS engine) + transport',
              'Client and server versions must match; the server binary must match the device ABI',
              '-U covers USB/adb; TCP needs adb forward plus -H',
              'frida-server is a manual, root-run process — health-check with frida-ps -U before every session'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm12-l01-q1',
          type: 'mcq',
          prompt: 'Where does the JavaScript you write actually execute?',
          options: [
            'In the Frida client on your workstation',
            'Inside the target app process, in the injected agent JS engine',
            'In frida-server, outside the app sandbox',
            'In the Android system_server'
          ],
          answerIndex: 1,
          hint: 'What gets injected into the app, and what runs there?',
          explanation:
            'Frida injects its Gum JS engine (the agent) into the target process; your script runs inside the app with the app\u2019s privileges. The client only sends your script over and displays results — which is why the transport matters and why apps can potentially detect the agent.'
        },
        {
          id: 'm12-l01-q2',
          type: 'truefalse',
          prompt: 'A frida-tools 16.x client can talk to a 15.x frida-server without any complaint.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does the docs say the client and server must share?',
          explanation:
            'Client and server must be on matching versions; mismatches surface as communication or protocol errors that look nothing like a version problem. Always check frida --version against the server binary you pushed.'
        },
        {
          id: 'm12-l01-q3',
          type: 'short',
          prompt:
            'Give the commands that put frida-server in place on the device, and the one that proves the connection is alive.',
          modelAnswer:
            'adb push frida-server /data/local/tmp/ then adb shell chmod 755 /data/local/tmp/frida-server, and start it from a root shell (/data/local/tmp/frida-server &). frida-ps -U proves the workstation client can see the device.',
          hint: 'Push, chmod, run as root — then list processes.',
          explanation:
            'These four steps are the entire server lifecycle. frida-ps -U succeeding is the canonical health check; everything else (spawn, attach, scripts) builds on it.'
        },
        {
          id: 'm12-l01-q4',
          type: 'scenario',
          prompt:
            'frida-ps -U worked yesterday; after restarting the emulator it prints "unable to connect to remote frida-server". Why, and what do you do?',
          modelAnswer:
            'frida-server is an ordinary process that died with the emulator and does not auto-start on boot. Root-shell into the device and start /data/local/tmp/frida-server again, then confirm with frida-ps -U. Automate the start step (init script or a saved command) so it stops biting you.',
          hint: 'What happens to any normal process when its host reboots?',
          explanation:
            'Nothing about frida-server is persistent: no auto-start, no daemon supervision. The fix is mechanical — start it again as root — and the prevention is a runbook or automation.'
        }
      ],
      references: [
        {
          title: 'Frida — Documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'Official docs: concepts, tools, and quick-start.'
        },
        {
          title: 'Frida — Installation',
          url: 'https://frida.re/docs/installation/',
          note: 'Official client installation and frida-server setup guidance.'
        },
        {
          title: 'frida/frida (GitHub)',
          url: 'https://github.com/frida/frida',
          note: 'Releases page for frida-server binaries matching your client version and device ABI.'
        },
        {
          title: 'Android Developers — adb',
          url: 'https://developer.android.com/studio/command-line/adb',
          note: 'Official adb reference, including adb forward used for TCP transport.'
        }
      ]
    },
    {
      id: 'm12-l02',
      moduleId: 'm12',
      title: 'Java Hooking Fundamentals',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m12-l01'],
      objectives: [
        'Write a Java.perform hook that installs cleanly before the target method runs',
        'Read method arguments and return values from a hooked method',
        'Modify behavior by changing return values, and use this to reach instance state'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'This is the bread-and-butter skill of Android instrumentation: hook a Java method, see exactly what flows through it, and — when the test calls for it — change what it returns. The overwhelming majority of Frida work on Android is this pattern applied with judgment.'
          },
          {
            type: 'p',
            text:
              'The discipline matters as much as the syntax: observe first, modify second. A hook that logs honestly is evidence; a hook that forces results without you understanding the flow is a guess wearing a lab coat.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'The skeleton every hook shares'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'The canonical observe-only hook',
            code:
              'Java.perform(function () {\n  var Checker = Java.use("com.training.app.FlagChecker");\n\n  Checker.check.implementation = function (input) {\n    console.log("[+] check() input: " + input);\n    var result = this.check(input);   // calls the ORIGINAL implementation\n    console.log("[+] check() returned: " + result);\n    return result;\n  };\n});'
          },
          {
            type: 'list',
            items: [
              'Java.perform(fn) — runs your function on a thread attached to the JVM; every Java hook lives inside it',
              'Java.use("fq.ClassName") — returns a wrapper for the class; the name must be fully qualified',
              '.implementation = fn — replaces the method body with your function; it receives the same arguments as the original',
              'arguments[0] — the first declared parameter (named input here for readability; both work)',
              'this — the object instance the method was called on; calling this.check(input) reaches the original implementation',
              'return — you must return a value of the correct type; forgetting it hands the app undefined'
            ]
          },
          {
            type: 'p',
            text:
              'Running it is one command: frida -U -f com.training.app -l hook.js spawns the app with the hook installed before its own code runs (older clients keep the process paused until you type %resume).'
          },
          {
            type: 'h',
            text: 'Observing versus changing'
          },
          {
            type: 'compare',
            title: 'Same hook, two intents',
            beforeTitle: 'Observe (transparent)',
            beforeCode:
              'Checker.check.implementation = function (input) {\n  var result = this.check(input);\n  console.log("[+] input: " + input);\n  console.log("[+] result: " + result);\n  return result;\n};',
            afterTitle: 'Modify (force a verdict)',
            afterCode:
              'Checker.check.implementation = function (input) {\n  console.log("[+] forcing result to true");\n  return true;\n};'
          },
          {
            type: 'p',
            text:
              'The observe version is behavior-preserving and is what you show in reports. The modify version changes app behavior and is how you prove impact ("an attacker can flip this check"). Do the first until you can articulate the flow; do the second only as a demonstrated, authorized test.'
          },
          {
            type: 'h',
            text: 'Using this'
          },
          {
            type: 'p',
            text:
              'Inside an instance-method hook, this is the live object. You can call its other methods and read its fields — field access goes through a .value wrapper:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Reading instance state from a hook',
            code:
              'Checker.check.implementation = function (input) {\n  console.log("[*] instance: " + this);\n  var stored = this.expectedFlag.value;   // instance field via .value\n  console.log("[*] stored expectation: " + stored);\n  return this.check(input);\n};'
          },
          {
            type: 'p',
            text:
              'For static methods this is the class wrapper instead, and there is no instance state to read. That distinction tells you instantly whether a check you are hooking is per-user or global.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Hooking is the fastest way to answer "what does this method actually receive and decide in a realistic session?" It powers certificate-pinning bypasses, authentication-flow probes, crypto key dumps, and validation tests — and each of those starts as a skeleton hook exactly like the one above.'
          },
          {
            type: 'list',
            items: [
              'Boolean gate methods (isXAllowed, verify, check) are prime observe-then-modify targets',
              'Logging arguments of crypto and network methods reveals what the app really sends and protects',
              'Field reads via this expose secrets the app keeps in memory, not just on disk'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes named Checker, Validator, PinActivity, LicenseManager — and their obfuscated equivalents you found in module m11',
              'Methods that compare user input with equals, startsWith, or equalsIgnoreCase and return boolean',
              'Crypto call sites (Cipher.doFinal, Mac.doFinal) worth logging in a training exercise',
              'Gates that run once at startup versus per-interaction — they fail differently when modified'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Hooks change real behavior',
            text:
              'A modification hook alters a running application on a device you control. Do it only against your own apps, training crackmes, or authorized targets, and keep observe-only hooks in place while collecting evidence.'
          },
          {
            type: 'p',
            text:
              'The workflow that never gets old: find the target class in JADX (module m11), write the observe hook, run it, read the log, and only then decide whether a modification hook proves your hypothesis.'
          },
          {
            type: 'terminal',
            title: 'First hook, end to end',
            lines: [
              '$ frida -U -f com.training.crackme1 -l hook.js',
              'Spawned com.training.crackme1. Resuming main thread!',
              '[+] hooks installed',
              '[*] verify(GUESS-1234) called',
              '[*] original verdict: false',
              '[*] verify(...) called',
              '[*] original verdict: false'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Complete worked script against a training crackme (UnCrackable Level 1 style). The app asks for a secret string and validates it somewhere; you hook the validator before touching the UI:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'hook.js — the complete worked script',
            code:
              '// Training target: MASTG-style crackme rebuilt for practice.\nJava.perform(function () {\n  var Checker = Java.use("com.training.crackme1.FlagChecker");\n\n  Checker.verify.implementation = function (flag) {\n    console.log("[*] verify(" + flag + ") called");\n    var verdict = this.verify(flag);      // original implementation\n    console.log("[*] original verdict: " + verdict);\n    return verdict;\n  };\n\n  console.log("[*] hooks installed");\n});'
          },
          {
            type: 'p',
            text:
              'Every press of the CHECK button now prints the submitted string and the honest verdict. Follow-up experiments write themselves: log this.expectedFlag.value to see the stored expectation, or return true to demonstrate that a forced verdict unlocks the screen — impact proven.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'frida CLI/REPL — run scripts, iterate live, keep sessions open',
              'JADX — locate the exact class and method names to hook (module m11 workflow)',
              'objection — ships prebuilt observe hooks for common classes when you want a fast start'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Hooking outside Java.perform — the replacement never installs or errors with a VM-attachment complaint',
              'Forgetting the return statement, handing the app undefined and crashing mysterious paths',
              'Setting .implementation on a method that has multiple overloads without choosing one (module m12-l03 fixes this properly)',
              'Hooking a class that is not loaded yet — spawn with -f so the hook installs before app code runs',
              'Console-logging Java objects directly instead of calling their methods or toString-ing the wrapper'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Pick any method in a training app that returns boolean. Write the observe hook and record what it receives across five interactions. Then read one instance field via this, and only after you can describe the flow, write the modify hook that forces true. Note what changes in the app and what does not — downstream checks that still fail are your next targets.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Java.perform + Java.use + .implementation is the universal Java-hook skeleton',
              'arguments[0] is the first declared parameter; this.check(args) calls the original implementation',
              'this gives live instance state; fields are read through .value',
              'Observe first, modify second — and only on authorized targets'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm12-l02-q1',
          type: 'mcq',
          prompt: 'Which property replaces a Java method implementation with your function?',
          options: ['.overload', '.implementation', '.replace', '$init'],
          answerIndex: 1,
          hint: 'It is the property you assign a function to.',
          explanation:
            'You assign your function to Method.implementation. .overload selects among same-named methods, and $init is the constructor wrapper — both arrive in the next lesson.'
        },
        {
          id: 'm12-l02-q2',
          type: 'truefalse',
          prompt:
            'Inside an implementation replacement, calling this.check(x) invokes the original implementation rather than recursing into your hook.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'This is exactly how observe-only hooks log honest results.',
          explanation:
            'When your replacement calls this.method(args), Frida routes the call to the original implementation. That is the standard pattern for wrapping: log, call the original, return its result.'
        },
        {
          id: 'm12-l02-q3',
          type: 'short',
          prompt: 'How do you access the first argument of a hooked Java method?',
          modelAnswer:
            'arguments[0] — or the named parameter in your replacement signature, which is clearer. Either way it is the first declared parameter of the Java method.',
          hint: 'The replacement receives the same parameters as the original, positionally.',
          explanation:
            'Frida calls your function with the method\u2019s arguments in order; arguments[0] is the first declared one. Naming them in the signature is equivalent and more readable.'
        },
        {
          id: 'm12-l02-q4',
          type: 'scenario',
          prompt:
            'You set Checker.verify.implementation = function () { return true; } and Frida throws an error mentioning that the method "has more than one overload". What happened and what are your options?',
          modelAnswer:
            'verify is overloaded, so an ambiguous .implementation assignment is rejected. Options: select one explicitly with Checker.verify.overload("java.lang.String").implementation = ..., or enumerate the overloads and hook each relevant signature. Both are covered systematically in module m12-l03.',
          hint: 'Same method name, different parameter lists — what does Frida need you to tell it?',
          explanation:
            'Frida refuses to guess which signature you mean. Explicit .overload(type, ...) selection — or enumerating overloads — resolves it, and is also the moment you learn which signature the app really uses.'
        }
      ],
      references: [
        {
          title: 'Frida — JavaScript API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'Official reference for Java.perform, Java.use, and the method wrapper API.'
        },
        {
          title: 'Frida — Documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'Official docs hub, including the CLI flags used here.'
        },
        {
          title: 'OWASP MASTG',
          url: 'https://mas.owasp.org/MASTG/',
          note: 'Methodology chapters on runtime instrumentation and the crackmes used as targets.'
        }
      ]
    },
    {
      id: 'm12-l03',
      moduleId: 'm12',
      title: 'Overloads, Constructors and Overriding Behavior',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m12-l02'],
      objectives: [
        'Select the correct overload explicitly and enumerate all overloads of a method',
        'Hook constructors with $init and still run the original construction logic',
        'Choose deliberately between wrapping (call the original) and replacing (never call it)'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Real Java is overloaded: the same method name with several signatures. Real classes have constructors that receive secrets. And real tests need you to decide, per hook, whether you are a transparent observer or a replacement behavior. This lesson turns those three realities from error messages into tools.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Overload selection'
          },
          {
            type: 'p',
            text:
              'When a method has multiple signatures, Frida refuses an ambiguous .implementation assignment. The fix is .overload(...), which takes the parameter types as strings:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Hooking two overloads of one method',
            code:
              'Java.perform(function () {\n  var Vault = Java.use("com.training.app.Vault");\n\n  Vault.unlock.overload("java.lang.String")\n    .implementation = function (pin) {\n      console.log("[+] unlock(String): " + pin);\n      return this.unlock(pin);\n    };\n\n  Vault.unlock.overload("[B")            // byte[]\n    .implementation = function (data) {\n      console.log("[+] unlock(byte[]) length: " + data.length);\n      return this.unlock(data);\n    };\n});'
          },
          {
            type: 'p',
            text:
              'Type strings are Java type names: fully qualified classes, primitive names, and JNI-style array descriptors. The common ones:'
          },
          {
            type: 'table',
            headers: ['Java type', 'Frida overload string'],
            rows: [
              ['String', 'java.lang.String'],
              ['int / long / boolean', 'int / long / boolean'],
              ['byte[]', '[B'],
              ['String[]', '[Ljava/lang/String;'],
              ['Custom class', 'com.training.app.Secret']
            ]
          },
          {
            type: 'p',
            text:
              'Never guess — enumerate. The wrapper exposes every overload with its argument and return types:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Listing the signatures actually present',
            code:
              'Vault.unlock.overloads.forEach(function (ov) {\n  console.log(ov.returnType.className + " (" +\n    ov.argumentTypes.map(function (t) { return t.className; }).join(", ") + ")");\n});'
          },
          {
            type: 'h',
            text: 'Constructors with $init'
          },
          {
            type: 'p',
            text:
              'Constructors are methods named $init in the wrapper, and they hook exactly like everything else — including the overload selection you just learned. Calling this.$init(args) runs the original construction logic, which you almost always want, because skipping it leaves a half-built object behind:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Watching what gets built',
            code:
              'var Secret = Java.use("com.training.app.Secret");\n\nSecret.$init.overload("java.lang.String")\n  .implementation = function (value) {\n    console.log("[+] new Secret(" + value + ")");\n    return this.$init(value);\n  };'
          },
          {
            type: 'h',
            text: 'Wrapping versus replacing'
          },
          {
            type: 'compare',
            title: 'Two intents, one syntax',
            beforeTitle: 'Wrap: log, then call the original',
            beforeCode:
              'Vault.unlock.overload("java.lang.String")\n  .implementation = function (pin) {\n    console.log("[+] pin: " + pin);\n    return this.unlock(pin);\n  };',
            afterTitle: 'Replace: never call the original',
            afterCode:
              'Vault.unlock.overload("java.lang.String")\n  .implementation = function (pin) {\n    console.log("[+] forcing unlock");\n    return true;\n  };'
          },
          {
            type: 'p',
            text:
              'A third pattern sits between them: pre-process the arguments, call the original, and post-process or return a different result. That covers "make the app validate a different input" experiments without rewriting its logic.'
          },
          {
            type: 'list',
            items: [
              'Wrap when you are building evidence — the app must keep behaving normally',
              'Replace when you are demonstrating impact — say so, and revert the hook afterwards',
              'Never skip this.$init in a constructor replacement; half-built objects fail in confusing places',
              'Void methods get no return; methods with returns must return the right type'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Overload awareness is the difference between "this method is dead" findings and correct ones: decoy signatures that always return false are a real anti-analysis trick, and hooking only the obvious overload tells you exactly what the developer wanted you to see. Constructor hooks, meanwhile, are where secrets show themselves — keys and tokens pass through $init at creation, often before any encryption exists to hide them.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Same-named methods with several signatures in JADX — note them before writing hooks',
              'Constructors receiving key, password, or token strings',
              'Overloads where one signature does real work and the other looks like a decoy',
              'Boolean gates whose honest behavior you must preserve while observing'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Replacements are invasive tests',
            text:
              'Fully replacing method logic changes an authorized target\u2019s behavior on purpose. Do it in your test window, document it, and revert to observe-only hooks when collecting evidence.'
          },
          {
            type: 'terminal',
            title: 'Enumerate first, then hook deliberately',
            lines: [
              '$ frida -U -f com.training.app -l list-overloads.js',
              '[*] boolean (java.lang.String)',
              '[*] boolean (byte[])',
              '$ frida -U -f com.training.app -l hook-both.js',
              '[+] unlock(String): 0000',
              '[+] unlock(byte[]) length: 16'
            ]
          },
          {
            type: 'p',
            text:
              'Use the app normally and watch which signature fires when. The overload that never runs during real usage is either dead code or a decoy — both are worth a line in your notes.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A training-app pattern worth knowing: Vault.unlock(String) always returns false — a decoy for anyone who hooks the obvious signature — while unlock(byte[]) does the real work on a transformed input. Hooking only the String version produced a wrong conclusion in a practice session; enumerating overloads and watching both fixed it. Meanwhile hooking Secret.$init printed the expected PIN at construction time, in cleartext, before any logic had a chance to hide it.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'frida CLI/REPL — enumerate overloads interactively before committing to a script',
              'JADX — read the declaring class to see every signature and which callers use it',
              'frida-trace (next lesson) — shows which overloads actually execute during use'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Guessing type strings — "byte[]" is wrong, "[B" is right; enumerate instead of guessing',
              'Skipping this.$init in a constructor replacement and chasing half-built-object crashes',
              'Replacing a method that callers rely on for consistency, then misreading the resulting failures as separate bugs',
              'Hooking both overloads and double-logging without distinguishing them in the output',
              'Forgetting that void methods take no return value, and returning one anyway'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a training app: enumerate the overloads of one method, hook every one, and log distinct inputs as you exercise the app. Hook one constructor and log what it receives. Finally, write both a wrap and a replace for the same method and describe, in one sentence each, what difference you observed in app behavior.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              '.overload("type", ...) selects a signature; never assign .implementation ambiguously',
              'overloads.forEach with argumentTypes/returnType enumerates the truth; guessing loses',
              '$init hooks constructors, and this.$init(args) preserves construction',
              'Wrap to observe, replace to demonstrate — choose per hook, on purpose'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm12-l03-q1',
          type: 'mcq',
          prompt: 'Which line correctly selects the String overload of unlock?',
          options: [
            'Vault.unlock.overload("java.lang.String")',
            'Vault.unlock("java.lang.String")',
            'Vault.unlock.type = "String"',
            'overload(Vault.unlock, 0)'
          ],
          answerIndex: 0,
          hint: 'It is a property on the method wrapper, taking type strings.',
          explanation:
            'The method wrapper exposes .overload(...), which takes the parameter types as Java type-name strings and returns an overload you can assign .implementation to.'
        },
        {
          id: 'm12-l03-q2',
          type: 'short',
          prompt: 'How do you hook a constructor, and how do you still run the original construction logic?',
          modelAnswer:
            'Hook Class.$init (with .overload if needed) by assigning an implementation; inside it, call this.$init(originalArgs) to execute the original constructor before or after your own logic.',
          hint: 'Constructors have a special name in the wrapper.',
          explanation:
            '$init is the constructor wrapper. Calling this.$init(args) preserves construction — skipping it is a classic source of half-built objects and downstream crashes.'
        },
        {
          id: 'm12-l03-q3',
          type: 'scenario',
          prompt:
            'A decoy unlock(String) always returns false, while unlock(byte[]) does the real work. You hooked only the String version and concluded unlock is dead. What went wrong, and what is the general fix?',
          modelAnswer:
            'You analyzed one overload of an overloaded method and generalized from the decoy. The fix: enumerate overloads (method.overloads with argumentTypes), hook every relevant signature, and let dynamic tracing (module m12-l04) show which signatures actually execute during real usage before drawing conclusions.',
          hint: 'How many versions of unlock exist, and which did you actually watch?',
          explanation:
            'Conclusions must cover all signatures that execute, not the one that was easiest to hook. Enumeration plus runtime tracing is the systematic answer — and decoy signatures are themselves an anti-analysis signal worth reporting.'
        }
      ],
      references: [
        {
          title: 'Frida — JavaScript API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'Official reference for overloads, $init, and the method wrapper API.'
        },
        {
          title: 'Frida — Examples',
          url: 'https://frida.re/docs/examples/',
          note: 'Official script examples showing hook patterns in context.'
        }
      ]
    },
    {
      id: 'm12-l04',
      moduleId: 'm12',
      title: 'Tracing and Exploration',
      difficulty: 'Intermediate',
      minutes: 30,
      prerequisites: ['m12-l02'],
      objectives: [
        'Use frida-trace to generate and run trace hooks from the command line',
        'Enumerate loaded classes and a class\u2019s methods from a Frida script',
        'Filter tracing noise so results stay readable and reportable'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Hooks answer "what does this method do?" — but first you must know the method exists. Tracing and enumeration answer the earlier question: "which classes and methods are even involved here?" Together they turn a black-box app into a shortlist of hook targets.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'frida-trace: tracing from the command line'
          },
          {
            type: 'p',
            text:
              'frida-trace generates handler scripts automatically for everything matching a pattern, attaches them, and prints each invocation. The -j flag selects Java methods with a class!method pattern that supports wildcards; -i selects native functions by name.'
          },
          {
            type: 'terminal',
            title: 'Tracing a training app while you use it',
            lines: [
              '$ frida-trace -U -f com.training.crackme1 -j "com.training.crackme1.*!*"',
              '1000 ms  com.training.crackme1.MainActivity.onCreate()',
              '1002 ms  |--- com.training.crackme1.Validator.check("abc")',
              '1003 ms  |--- com.training.crackme1.Validator.check("abc")',
              '$ frida-trace -U -p 4321 -i "open*"',
              '  12 ms  open("/data/data/com.training.crackme1/files/db.sqlite")'
            ]
          },
          {
            type: 'p',
            text:
              'The generated handlers land in a __handlers__ directory next to where you ran the command — plain JavaScript files you can edit to log arguments and results, and the next run picks your edits up. That upgrade path (trace broadly, then enrich interesting handlers) is the intended workflow.'
          },
          {
            type: 'h',
            text: 'Enumeration from a script'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Classes and methods, live from the target process',
            code:
              'Java.perform(function () {\n  Java.enumerateLoadedClasses({\n    onMatch: function (name) {\n      if (name.indexOf("com.training") === 0) {\n        console.log("[class] " + name);\n      }\n    },\n    onComplete: function () {\n      console.log("[*] class scan done");\n    }\n  });\n\n  var Vault = Java.use("com.training.app.Vault");\n  Vault.class.getDeclaredMethods().forEach(function (m) {\n    console.log("[method] " + m.toString());\n  });\n});'
          },
          {
            type: 'list',
            items: [
              'Java.enumerateLoadedClasses — walks every class loaded in the target process (not the device); perfect for spotting dynamically loaded code',
              'Java.use(cls).class — reaches the underlying java.lang.Class object',
              'getDeclaredMethods() — the honest list of methods, including ones JADX showed you and ones it did not'
            ]
          },
          {
            type: 'h',
            text: 'Watching usage to map behavior'
          },
          {
            type: 'p',
            text:
              'The mapping loop: enumerate to find candidate classes, trace or hook the candidates, use each screen of the app, and record what fired when. Ten minutes of this produces a table — "login screen calls Validator.check; settings screen touches ConfigStore.load" — that tells you exactly where to spend RE and hooking effort.'
          },
          {
            type: 'h',
            text: 'Filtering noise'
          },
          {
            type: 'list',
            items: [
              'Scope -j patterns to the package you care about instead of tracing everything',
              'Filter class names by prefix inside handlers (skip android.*, androidx.*, kotlin.*)',
              'Trace in short sessions around a single interaction, not one long run',
              'Save output to a file (frida -o trace.log) and grep it afterwards instead of scrolling the REPL',
              'Clear logcat with logcat -c before each run so evidence stays attributable'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'On every black-box engagement there is a phase where you know neither the class names nor the flow — obfuscation often deleted the readable names entirely. Tracing is how you recover the map at runtime: which classes exist, which methods execute per feature, and which obfuscated blob is actually the license check. Everything module m11 taught you to find statically, tracing confirms dynamically.'
          },
          {
            type: 'list',
            items: [
              'Classes that appear only after certain actions reveal dynamic loading worth investigating',
              'Crypto and network classes showing up in a trace mark the exact moment secrets move',
              'Root-detection classes firing at startup show you the checks you must plan around'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Classes loaded late or from unusual paths (DexClassLoader activity)',
              'Cipher, Mac, MessageDigest invocations in the trace of a login or unlock flow',
              'Methods that fire on every interaction — framework glue — versus the ones that fire once',
              'Package prefixes in the trace that do not appear anywhere in the static analysis'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Tracing is observation — of an authorized target',
            text:
              'Tracing reads the internals of a running app on your test device. Keep it on training apps and authorized targets, and scope your patterns so you do not collect data from unrelated apps or users on shared devices.'
          },
          {
            type: 'terminal',
            title: 'A mapped session on a training app',
            lines: [
              '$ adb logcat -c',
              '$ frida-trace -U -f com.training.crackme1 -j "com.training.crackme1.*!*" -o session1.log',
              '# interact: launch, type wrong secret, press CHECK, stop with Ctrl+C',
              '$ grep -c Validator session1.log',
              '14',
              '$ grep -E "check|verify" session1.log | head'
            ]
          },
          {
            type: 'p',
            text:
              'One interaction per session, one log per session, one grep per question. That rhythm keeps every conclusion attributable to something you actually did.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'On a crackme: running frida-trace with -j "com.*!*" while pressing the CHECK button prints exactly which method validates the input — including an obfuscated class name that JADX had rendered meaningless. A targeted observe-hook from module m12-l02 against that class finishes the job in minutes. Trace found it; the hook proved it.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool / API', 'Role'],
            rows: [
              ['frida-trace -j', 'Auto-generated Java method tracing from the CLI'],
              ['frida-trace -i', 'Native function tracing by name (see module m12-l05)'],
              ['Java.enumerateLoadedClasses', 'Live class inventory of the target process'],
              ['Class.getDeclaredMethods', 'Method inventory for a specific class'],
              ['objection', 'Prebuilt observe commands that overlap with quick tracing needs']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Tracing everything — framework floods of android.* and androidx.* lines make real signals invisible',
              'Assuming enumerateLoadedClasses lists device-wide classes; it is scoped to the target process',
              'Calling Java.use on a class that is not loaded yet — enumerate first, or spawn and trace early',
              'Confusing -i (native functions) with -j (Java methods) when a trace comes up empty',
              'Leaving broad traces running while collecting report evidence, then being unable to attribute lines'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run a package-scoped -j trace on a training app while visiting each screen once. From the logs, produce a one-page behavior map: screen → classes and methods involved. Pick one method per screen, write an observe-hook for it (module m12-l02), and note what each hook confirms about the map.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'frida-trace -j generates Java traces; handlers are editable files you can enrich',
              'Java.enumerateLoadedClasses and getDeclaredMethods reveal classes and methods at runtime',
              'Map behavior by tracing one interaction per session and grepping one question per log',
              'Tracing finds the targets; hooks prove the findings'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm12-l04-q1',
          type: 'mcq',
          prompt: 'Which frida-trace flag traces Java methods?',
          options: ['-j', '-i', '-I', '-m'],
          answerIndex: 0,
          hint: 'One letter for "Java", one for native imports.',
          explanation:
            '-j selects Java methods with a class!method wildcard pattern. -i selects native functions by name, which is the native-side tracing you will meet in module m12-l05.'
        },
        {
          id: 'm12-l04-q2',
          type: 'truefalse',
          prompt: 'Java.enumerateLoadedClasses lists every class installed on the device.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Where does the agent running your script live?',
          explanation:
            'Enumeration is scoped to the target process your agent is injected into. That is exactly why it is useful for spotting dynamically loaded classes in that app — and why it will not show you other apps\u2019 classes.'
        },
        {
          id: 'm12-l04-q3',
          type: 'short',
          prompt: 'Write the approach for listing the declared methods of com.training.app.Vault at runtime.',
          modelAnswer:
            'Java.use("com.training.app.Vault").class.getDeclaredMethods() returns the method list; iterate it and print each with toString(). (Inside Java.perform, since it touches the JVM.)',
          hint: 'Java.use gets you the wrapper; .class gets you the reflection object.',
          explanation:
            'The wrapper\u2019s .class property reaches the java.lang.Class object, and standard reflection (getDeclaredMethods) does the rest — an honest inventory including methods the UI never calls.'
        },
        {
          id: 'm12-l04-q4',
          type: 'scenario',
          prompt:
            'Your -j trace prints thousands of androidx.* lines per second and you cannot see your own package. Give two concrete ways to cut the noise.',
          modelAnswer:
            'First, narrow the pattern to your target package, e.g. -j "com.training.crackme1.*!*". Second, filter in the generated handlers or post-process the log (grep for your package) — and trace in short sessions around a single interaction instead of one long run.',
          hint: 'There are two layers you can filter: what gets traced, and what gets shown.',
          explanation:
            'Both layers matter: pattern scoping prevents the flood from being generated, and handler/log filtering keeps the surviving output focused. Short, single-interaction sessions also keep evidence attributable.'
        }
      ],
      references: [
        {
          title: 'Frida — Documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'Official docs hub including the frida-trace tool.'
        },
        {
          title: 'Frida — JavaScript API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'Official reference for Java.enumerateLoadedClasses and the class wrapper API.'
        },
        {
          title: 'frida/frida (GitHub)',
          url: 'https://github.com/frida/frida',
          note: 'Tool source and release notes for frida-trace flag behavior.'
        }
      ]
    },
    {
      id: 'm12-l05',
      moduleId: 'm12',
      title: 'Native Hooking and Advanced Patterns',
      difficulty: 'Advanced',
      minutes: 35,
      prerequisites: ['m11-l02', 'm12-l03'],
      objectives: [
        'Attach Interceptor to exported native functions found by name',
        'Read and modify arguments and return values using NativePointer basics',
        'Organize hooks into layered, reusable scripts that combine Java and native instrumentation'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The hardest logic in a hardened app hides in native code — and lesson m11-l02 gave you the map: export names, ABI, argument registers. Frida\u2019s Interceptor closes the loop: attach to those functions, watch the raw data move, and when the test calls for it, change what goes in and what comes out.'
          },
          {
            type: 'p',
            text:
              'Native hooking is less forgiving than Java hooking: there is no type system to catch you, pointers are just numbers, and a bad read kills the process. This lesson stays at concept level on modification, and heavy on safe observation.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Interceptor basics'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Attaching to an export by name',
            code:
              'var target = Module.findExportByName(\n  "libsecurity.so",\n  "Java_com_training_Security_verify"\n);\n\nInterceptor.attach(target, {\n  onEnter: function (args) {\n    console.log("[*] verify entered");\n  },\n  onLeave: function (retval) {\n    console.log("[*] verify returned: " + retval);\n  }\n});'
          },
          {
            type: 'list',
            items: [
              'Module.findExportByName(so, name) — returns the address or null if absent (use it for symbols that may not exist); Module.getExportByName throws instead',
              'onEnter(args) — runs before the function; args is an array of NativePointer values',
              'onLeave(retval) — runs after; retval can be read or replaced',
              'Remember lesson m11-l02: for a static JNI export, args[0] is JNIEnv*, args[1] the class or object, args[2] your first Java argument'
            ]
          },
          {
            type: 'p',
            text:
              'Version note: recent Frida releases have been reshuffling the Module API surface (for example toward per-module lookups). The concepts here are stable, but check the JavaScript API docs for the exact function names in your installed version — the lesson m12-l01 version discipline applies to APIs too.'
          },
          {
            type: 'h',
            text: 'NativePointer reading'
          },
          {
            type: 'p',
            text:
              'args entries are NativePointer objects. .readCString() and .readUtf8String() turn a char* into readable text — but a jstring is not a char*. It is a VM handle, and dereferencing it directly produces garbage or crashes. The practical trick: hook the JNI helper that performs the conversion and read its result:'
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'Seeing every Java string as it crosses to native',
            code:
              'var getUtf = Module.findExportByName(null, "GetStringUTFChars");\n\nInterceptor.attach(getUtf, {\n  onLeave: function (retval) {\n    if (!retval.isNull()) {\n      console.log("[jstring] " + retval.readCString());\n    }\n  }\n});'
          },
          {
            type: 'p',
            text:
              'Searching across all modules with null as the library name is deliberate here: every JNI-using app resolves GetStringUTFChars, and this one hook shows you each string the native side receives — often including the expected secret itself.'
          },
          {
            type: 'h',
            text: 'Modification, at concept level'
          },
          {
            type: 'list',
            items: [
              'Return-value forcing — in onLeave, retval.replace(1) makes the function report success; the most common native bypass pattern',
              'Argument swapping — in onEnter, assign a new NativePointer to args[i]; build one with Memory.allocUtf8String("...") and keep a reference so the allocation outlives the call',
              'Concept caveat — modifications interact with calling conventions, memory lifetimes, and copies; treat them as experiments to validate, not one-liners to trust'
            ]
          },
          {
            type: 'code',
            lang: 'javascript',
            title: 'The two patterns, sketched',
            code:
              'Interceptor.attach(target, {\n  onEnter: function (args) {\n    var swapped = Memory.allocUtf8String("authorized");\n    this.keep = swapped;      // keep alive for the duration of the call\n    args[2] = swapped;        // replace first Java-level argument\n  },\n  onLeave: function (retval) {\n    console.log("[*] original verdict: " + retval);\n    retval.replace(1);        // force success\n  }\n});'
          },
          {
            type: 'h',
            text: 'Organizing reusable scripts'
          },
          {
            type: 'list',
            items: [
              'One concern per script, one CONFIG block at the top (package name, library name, symbol names)',
              'Shared helpers: a tagged log function, the GetStringUTFChars watcher, a Java.perform wrapper',
              'Layer your work: logging-only hooks first, modifications only after the flow is understood',
              'Version-control your scripts — next engagement you will want last month\u2019s working template',
              'Combine layers in one session: Java hooks (m12-l02) and Interceptor hooks can run side by side'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Native boundaries are where the tough checks live: root and emulator detection, license verification, custom crypto. Being able to attach, read, and — with care — modify at that boundary is the endgame of mobile dynamic analysis, and it works even when the Java layer is packed or obfuscated beyond recognition.'
          },
          {
            type: 'list',
            items: [
              'Export names from your m11 Ghidra session are your attach points — static feeds dynamic, literally',
              'The GetStringUTFChars watcher is the cheapest way to watch secrets cross the bridge',
              'Detection functions are themselves hookable: observe them before you decide to bypass them'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Exports from module m11 recon: Java_* symbols, JNI_OnLoad-resolved functions, comparison helpers',
              'Imports worth watching: strcmp, memcmp, ptrace, dlopen — hook them to see checks as they happen',
              'Which .so is actually loaded (Process.enumerateModules) before assuming your target library is present',
              'Verdict strings in .rodata — their referencing functions are hook candidates'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Native hooks are the sharpest tool you own',
            text:
              'Interceptor changes process control flow inside an authorized target. Training crackmes and contracted engagements only — and always run logging-only hooks before any modification.'
          },
          {
            type: 'terminal',
            title: 'Native observation on a training crackme',
            lines: [
              '$ frida -U -f com.training.crackme1 -l native-observe.js',
              'Spawned com.training.crackme1. Resuming main thread!',
              '[*] verify entered',
              '[jstring] GUESS-1234',
              '[*] verify returned: 0x0',
              '[*] verify entered',
              '[jstring] GUESS-9999',
              '[*] verify returned: 0x0'
            ]
          },
          {
            type: 'p',
            text:
              'Logging only, no changes: you can already see inputs crossing the bridge and the honest verdicts coming back. The modification (retval.replace(1)) becomes a one-line, well-understood experiment on top of that evidence — and you know exactly what it alters.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'End of the arc that started in module m11: Ghidra showed the check function and its export name; m11-l02 explained the register layout; here, Interceptor.attach on that export with the GetStringUTFChars watcher prints the expected comparison data as the app runs. Forcing the return value to 1 then unlocks the training crackme — concept demonstrated, authorized target, full static-to-dynamic chain.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['API / Tool', 'Role'],
            rows: [
              ['Interceptor', 'Attach onEnter/onLeave logic to any native function address'],
              ['Module.findExportByName / getExportByName', 'Resolve symbol names to addresses (null finds vs get-throws)'],
              ['NativePointer methods', 'readCString, readUtf8String, and friends for safe reads'],
              ['Memory', 'allocUtf8String and related helpers for building replacement arguments'],
              ['NativeFunction', 'Call native functions from your script (a step beyond this lesson)'],
              ['frida-trace -i', 'Auto-generate native trace handlers to discover targets']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Off-by-two arguments: forgetting JNIEnv and jobject shift everything, and reading args[2] as if it were args[0]',
              'Calling readCString on a jstring handle — resolve it via GetStringUTFChars or the env wrapper instead',
              'Hooking a library that is not loaded (wrong ABI or lazy loading) — confirm with Process.enumerateModules first',
              'Leaving modification hooks active during evidence collection, so your logs show altered behavior',
              'Ignoring Frida API version drift in Module functions — verify names against the docs for your installed version'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On a training app with a native check: confirm the export name with nm (module m11-l02), attach a logging-only hook, and log jstrings via the GetStringUTFChars watcher. Predict what the verdict will be for two inputs, run, and compare. Only then write the retval.replace experiment, document what changed, and finish by refactoring your script into a reusable template with a CONFIG block at the top.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Interceptor.attach + findExportByName is the native skeleton; find returns null, get throws',
              'args are NativePointers; JNI exports put your data at args[2] — and jstrings must be resolved, not dereferenced',
              'retval.replace and argument swapping are the core modification patterns — validate them, do not trust them blind',
              'Layered, version-controlled scripts turn one-off hooks into a reusable toolkit'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm12-l05-q1',
          type: 'mcq',
          prompt: 'In onEnter for a statically named JNI export, which args index holds the first Java-level argument?',
          options: ['args[0]', 'args[1]', 'args[2]', 'args[3]'],
          answerIndex: 2,
          hint: 'Two implicit JNI parameters come first. What did lesson m11-l02 say about x0, x1, and x2?',
          explanation:
            'args[0] is JNIEnv*, args[1] is the jclass or jobject, and args[2] is the first declared Java argument. Miscounting by two is the single most common native-hooking bug.'
        },
        {
          id: 'm12-l05-q2',
          type: 'truefalse',
          prompt: 'Module.findExportByName throws an exception when the symbol is not found.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'One of the two lookup functions returns null, the other throws.',
          explanation:
            'findExportByName returns null for a missing symbol — ideal for optional targets. getExportByName throws, which suits symbols you require. Choosing deliberately keeps scripts readable about what is expected.'
        },
        {
          id: 'm12-l05-q3',
          type: 'short',
          prompt: 'How do you force an attached native function to return success (1)?',
          modelAnswer:
            'In onLeave, call retval.replace(1). retval represents the function\u2019s return value, and replace() substitutes a new value before it reaches the caller.',
          hint: 'Which callback runs after the function, and what object does it hand you?',
          explanation:
            'onLeave receives retval, a wrapper around the return slot. replace(1) rewrites it — the standard native bypass pattern, best applied only after logging-only observation established the honest behavior.'
        },
        {
          id: 'm12-l05-q4',
          type: 'scenario',
          prompt:
            'You call args[2].readCString() on a jstring argument and the app immediately crashes. Explain why, and give the correct approach.',
          modelAnswer:
            'A jstring is a VM handle, not a C pointer; dereferencing it as one reads arbitrary memory and kills the process. Correct approach: resolve the string through JNI — hook the GetStringUTFChars export and read its return value (retval.readCString()), or use the JNIEnv wrapper APIs to convert the handle first.',
          hint: 'What did lesson m11-l02 say Java strings become at the JNI boundary?',
          explanation:
            'Java strings cross the bridge as opaque handles; only the JNI conversion functions expose actual char data. The GetStringUTFChars watcher is the safe, universal pattern for reading them.'
        }
      ],
      references: [
        {
          title: 'Frida — JavaScript API',
          url: 'https://frida.re/docs/javascript-api/',
          note: 'Official reference for Interceptor, Module, NativePointer, and Memory.'
        },
        {
          title: 'Frida — Documentation home',
          url: 'https://frida.re/docs/home/',
          note: 'Official docs hub and version notes for API changes.'
        },
        {
          title: 'frida/frida (GitHub)',
          url: 'https://github.com/frida/frida',
          note: 'Source and releases; useful for tracking API changes between versions.'
        }
      ]
    }
  ]
};
