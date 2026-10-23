import type { Module } from '../../types';

// LEVEL 1 — LAB SETUP · Module 02: Pentesting Environment Setup
// Original curriculum content synthesized from public official documentation:
// developer.android.com, source.android.com, mas.owasp.org, and PortSwigger
// documentation. All prose is original; reference links point to the official
// sources used for study.

export const m02: Module = {
  id: 'm02',
  title: 'Pentesting Environment Setup',
  level: 1,
  description:
    'Build the workshop every later module assumes: Android Studio and the SDK, snapshot-ready emulators, rooted and instrumented test devices, professional ADB habits, Burp Suite traffic interception, and the certificate-trust knowledge that makes HTTPS testing possible.',
  outcomes: [
    'Create and control Android Virtual Devices tuned for security testing (image variants, snapshots)',
    'Explain what root and instrumentation give an authorized tester, and their trade-offs',
    'Operate adb fluently over USB and wireless, across multiple devices and failure states',
    'Route app traffic through Burp Suite and establish certificate trust for HTTPS interception'
  ],
  checklist: [
    {
      item: 'Android Studio',
      why: 'Bundles the SDK Manager, AVD Manager, and emulator that form the core of your test lab.'
    },
    {
      item: 'Android SDK',
      why: 'Provides the platform packages, build-tools, and system images needed to create and inspect test devices.'
    },
    {
      item: 'Platform Tools (adb)',
      why: 'Installs adb and fastboot, the primary channel for installing, inspecting, and driving any device.'
    },
    {
      item: 'Emulator + AVD',
      why: 'Gives you a resettable virtual test device where dynamic tests run safely and restore via snapshots.'
    },
    {
      item: 'JDK/Java',
      why: 'Runs Android Studio and Java-based tooling such as keytool and various APK utilities.'
    },
    {
      item: 'Burp Suite',
      why: 'Intercepting proxy used to capture, review, and modify app traffic during network testing.'
    },
    {
      item: 'JADX',
      why: 'Decompiles DEX bytecode into readable Java for static code review.'
    },
    {
      item: 'apktool',
      why: 'Decodes APK resources and bytecode into editable form and rebuilds them for repackaging tests.'
    },
    {
      item: 'MobSF',
      why: 'Automated static and dynamic analyzer that produces a fast baseline report of likely findings.'
    },
    {
      item: 'Frida',
      why: 'Dynamic instrumentation toolkit for hooking functions in running apps, run as root on test devices.'
    },
    {
      item: 'Objection',
      why: 'Frida-based runtime exploration toolkit that bundles common testing tasks into quick commands.'
    },
    {
      item: 'Training app (OWASP MASTG crackmes / DIVA)',
      why: 'A deliberately vulnerable, legally testable target to practice every technique in this academy.'
    }
  ],
  lessons: [
    {
      id: 'm02-l01',
      moduleId: 'm02',
      title: 'Android Studio, SDK and the Emulator',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m01-l08'],
      objectives: [
        'Identify the SDK components that matter for testing and what each is for',
        'Choose the right system image variant (Google APIs vs Google Play) for each test need',
        'Create an AVD, verify its build properties, and manage snapshots'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module 01 gave you the mental model; this module gives you the workshop. Before any real testing you need three things: a place to install apps (a device or emulator), the tools to talk to it (SDK platform-tools), and a way to reset the world when a test goes sideways (snapshots). Android Studio bundles all of it.'
          },
          {
            type: 'p',
            text:
              'The Android SDK is not one thing — it is a set of versioned components. Knowing which component does what saves hours of confusion later, when a tool complains it cannot find a platform or a build-tools version.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'SDK components'
          },
          {
            type: 'list',
            items: [
              'platform-tools — adb, fastboot, and friends; the tools that talk to devices (installed once, updated independently)',
              'build-tools — aapt2, apksigner, d8, zipalign: packaging and inspection tools used in builds and by testers',
              'platforms — per-API-level android.jar and system data so tools understand a given Android version',
              'emulator + system images — the virtual devices themselves; images exist per API level and variant',
              'SDK Manager / sdkmanager — the installer UI and CLI; avdmanager creates virtual devices from scripts'
            ]
          },
          {
            type: 'h',
            text: 'AVDs and system images'
          },
          {
            type: 'p',
            text:
              'An AVD (Android Virtual Device) pairs a hardware profile (Pixel, tablet…) with a system image. Image names read like system-images;android-34;google_apis;x86_64 — API level, variant, ABI. The variant is the security-relevant choice:'
          },
          {
            type: 'table',
            headers: ['Image variant', 'Contains', 'Root behavior (adb root)'],
            rows: [
              ['google_apis (Google APIs)', 'GMS services, no Play Store', 'Works — test-style build; you get a root shell'],
              ['google_apis_playstore (Google Play)', 'GMS + Play Store, production-signed', 'Does not work — production user build, closest to a real consumer device'],
              ['default (AOSP)', 'Pure AOSP, no Google services', 'Works — the most permissive lab option']
            ]
          },
          {
            type: 'p',
            text:
              'userdebug and eng build types enable adb root, a weaker (or permissive) SELinux configuration, and writable system partitions. They exist precisely for development and testing. Production user builds lock all of that down — which is why a Google Play image behaves more like a real phone than a test rig.'
          },
          {
            type: 'h',
            text: 'Snapshots'
          },
          {
            type: 'p',
            text:
              'The emulator saves full device state to disk. Quick-boot snapshots restore in seconds, and you can keep multiple named snapshots: one pristine install state, one post-exploitation state. Snapshots are your undo button and the reason emulators beat physical devices for repeatable, evidence-friendly testing.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every dynamic module ahead assumes three capabilities: you can install any APK quickly, you can get root when you need to read private app data or move certificates, and you can reset the device between tests so findings stay attributable. A Google APIs AVD with snapshots gives you all three; a Play image gives you realism (Play Protect, integrity behavior) at the cost of root.'
          },
          {
            type: 'list',
            items: [
              'Keep one Play image AVD for realism checks and one Google APIs AVD as your main workhorse',
              'Snapshot before every destructive test — restores make re-running tests trivial',
              'Never treat the emulator as ground truth for attestation or anti-fraud behavior; verify on real hardware when that matters'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'ro.build.type (user / userdebug / eng) — your root and system-writability expectations follow from it',
              'ro.debuggable=1 — means every app is debuggable with run-as (module 01 previewed this)',
              'ro.build.version.sdk — the API level your image runs; default protections change across levels',
              'Whether adb root succeeds — the fastest single check that your image is testable'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Verifying a fresh AVD',
            lines: [
              '$ sdkmanager --list | head                       # see installed components',
              '$ avdmanager create avd -n pentest34 -k "system-images;android-34;google_apis;x86_64"',
              '$ emulator -avd pentest34 &                      # boot it',
              '$ adb devices                                    # emulator-5554 appears',
              '$ adb root                                       # restart adbd as root',
              'restarting adbd as root',
              '$ adb shell getprop ro.build.type                # userdebug',
              'userdebug',
              '$ adb shell getprop ro.debuggable',
              '1'
            ]
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Name AVDs by purpose',
            text:
              'Name your AVDs by role — pentest34, playstore34 — and record which image each uses. Future-you, six modules from now, will not remember.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A complete first lab: install Android Studio with the default SDK, add the Google APIs system image for API 34, create the AVD with the command above, take a snapshot named clean, and install a training app (module 01 listed the OWASP crackmes). Run adb root and getprop to confirm the image is userdebug. You now have a repeatable test device that restores to clean in seconds.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Android Studio SDK Manager', 'Installs SDK components and system images'],
              ['avdmanager', 'Creates AVDs from the CLI (scriptable lab setup)'],
              ['emulator', 'Boots AVDs; supports snapshots and command-line flags'],
              ['adb', 'The channel to every device you create']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Picking a Google Play image and then wondering why adb root fails — Play images are production user builds by design',
              'Confusing platform-tools (adb) with build-tools (apksigner/aapt2); they version and update separately',
              'Not reserving disk space: images, AVDs, and snapshots grow fast (tens of GB for a multi-version lab)',
              'Testing only on the newest image — many apps still target older API levels with different default protections'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Create one Google APIs AVD, take a snapshot, install your training app, then deliberately break something (uninstall the app, change a setting) and restore the snapshot to verify the reset works end to end. Time the restore — under a minute means your test loop is fast enough for real work.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'The SDK is components: platform-tools to talk, build-tools to inspect, platforms per API level',
              'Image variant decides root: Google APIs/AOSP allow adb root; Google Play images do not',
              'userdebug/eng images are the sanctioned playground for authorized dynamic testing',
              'Snapshots make every test resettable, attributable, and repeatable'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm02-l01-q1',
          type: 'mcq',
          prompt: 'Which image variant supports adb root?',
          options: [
            'Google Play (google_apis_playstore)',
            'Google APIs (google_apis)',
            'None — emulators can never be rooted',
            'Only AOSP tablet profiles'
          ],
          answerIndex: 1,
          hint: 'Which variant is production-signed like a consumer phone?',
          explanation:
            'Google APIs and default AOSP images are userdebug-style builds that allow adb root. Google Play images are production user builds — adb root is refused, by design, to mirror real devices.'
        },
        {
          id: 'm02-l01-q2',
          type: 'truefalse',
          prompt: 'On a userdebug image, ro.debuggable is 1 and every installed app can be inspected with run-as.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Debuggable is a property of the whole build on userdebug/eng.',
          explanation:
            'userdebug/eng builds set ro.debuggable=1, which makes all apps debuggable: run-as works for any package, which massively eases data inspection during authorized tests.'
        },
        {
          id: 'm02-l01-q3',
          type: 'short',
          prompt: 'Name two SDK component groups and what each is for.',
          modelAnswer:
            'Any two of: platform-tools (adb, fastboot) provide device communication; build-tools (aapt2, apksigner, d8, zipalign) package and inspect APKs; platforms provide per-API-level system data that tools compile and analyze against.',
          hint: 'One group talks to devices; one builds and inspects packages.',
          explanation:
            'Keeping component groups straight prevents the classic "adb: command not found" (platform-tools missing) versus "tool cannot find android.jar" (platform missing) confusion.'
        },
        {
          id: 'm02-l01-q4',
          type: 'scenario',
          prompt:
            'A teammate created an AVD with a Google Play image and cannot run adb root; Play Protect also blocks installing the training APK. Diagnose the situation and propose the fix.',
          modelAnswer:
            'The Play image is a production user build: adb root is intentionally unavailable, and Play Protect actively scans and may block sideloaded or re-signed APKs. Create a second AVD on a google_apis (or AOSP) image as the pentest workhorse, and keep the Play AVD only for realism and integrity-behavior checks.',
          hint: 'The variant was chosen for realism; that is exactly what blocks both symptoms.',
          explanation:
            'Production-like images trade testability for realism. A two-AVD split (one test-friendly, one realistic) is the standard structure of an Android security lab.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Run apps on the Android Emulator',
          url: 'https://developer.android.com/studio/run/emulator',
          note: 'Official emulator documentation, including networking and snapshots.'
        },
        {
          title: 'Android Developers — Create and manage virtual devices',
          url: 'https://developer.android.com/studio/run/managing-avds',
          note: 'Official AVD creation and management guide.'
        },
        {
          title: 'Android Developers — Android Studio overview',
          url: 'https://developer.android.com/studio/intro',
          note: 'SDK Manager and tooling overview.'
        }
      ]
    },
    {
      id: 'm02-l02',
      moduleId: 'm02',
      title: 'Rooted and Instrumented Test Devices',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['m02-l01'],
      objectives: [
        'Explain why root and instrumentation help authorized testing',
        'Set up a rooted emulator via the image variant, and describe Magisk at concept level',
        'Articulate the trade-offs: Play Integrity, app refusals, and environment realism'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A stock production device is a locked house. Root is the key that opens app sandboxes and the system partition; instrumentation (Frida-style tooling) lets you watch and redirect what a running app does, function by function. On an authorized engagement this combination is the difference between reading documentation about an app and actually interrogating it.'
          },
          {
            type: 'p',
            text:
              'This lesson stays at concept level for Magisk and focuses on the emulator path, but the mental model — what root enables, what it costs, and what detection looks like — transfers directly to physical devices.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Why root helps an authorized tester'
          },
          {
            type: 'list',
            items: [
              'Read any app\u2019s private data (/data/data/<pkg>) directly — no run-as, no debuggable requirement',
              'Modify the system CA trust store so HTTPS interception works app-wide (next lessons)',
              'Run frida-server as root to attach to any process and hook functions at runtime',
              'Inspect and modify system services, SELinux state, and protected dumpsys data that user builds hide'
            ]
          },
          {
            type: 'h',
            text: 'Rooted emulator images'
          },
          {
            type: 'p',
            text:
              'The cheapest root you will ever own: a google_apis or AOSP system image. adb root restarts adbd as root and the shell UID becomes 0. No unlocking, no flashing, no warranty issues — and a snapshot restores the device when you break it.'
          },
          {
            type: 'h',
            text: 'Magisk, conceptually'
          },
          {
            type: 'p',
            text:
              'On physical devices, root is usually obtained with Magisk: it patches the boot image and provides systemless root — modifications applied as an overlay rather than by editing /system — plus Zygisk for injecting code into app processes and a module system for extra capabilities. Its most tester-relevant feature is the denylist concept (hide root from a chosen app), which is why rooted-device workflows and anti-root detection are two sides of the same coin.'
          },
          {
            type: 'h',
            text: 'The trade-off: integrity checks'
          },
          {
            type: 'p',
            text:
              'Modern Android has Play Integrity: device, app, and account verdicts backed by hardware attestation. Banking and payment apps routinely refuse to run on rooted devices, and some refuse user-installed certificates or debuggable environments. For your testing this means a rooted emulator is a great workhorse, but it is not a faithful replica of how the same app behaves on a locked, attested consumer device.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Modules ahead depend on root for concrete steps: dumping SharedPreferences and databases (storage testing), moving certificates into the system store (next lesson), and running instrumentation for hooking (later modules). At the same time, "does the app detect root or instrumentation?" is itself a resilience test area — so the root you install is also a signal the app may be looking for. Reporting that an app correctly detects and refuses a rooted environment is a finding in the app\u2019s favor.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Rooting is for your own lab',
            text:
              'Root devices you own, for apps you are authorized to test. Using root to extract data from, or bypass protections of, apps outside your written scope is computer misuse — the tools do not care about intent, so your scope discipline has to.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'On the device: whoami returns root after adb root; a su binary indicates Magisk-style root on hardware',
              'The Magisk app and its installed modules on a physical test device',
              'In the app under test (later modules): root-detection code paths, integrity API calls, certificate checks — all are resilience signals worth documenting'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Rooting the emulator',
            lines: [
              '$ adb root',
              'restarting adbd as root',
              '$ adb shell whoami',
              'root',
              '$ adb shell ls /data/data/com.example.app   # works without run-as now'
            ]
          },
          {
            type: 'p',
            text:
              'On a physical device you would instead unlock the bootloader and install Magisk (own hardware only). Keep a pre-root snapshot of your emulator as a baseline for comparing app behavior with and without root — that comparison is the raw material of resilience findings.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Install the training app, log in, and read its shared_prefs directly as root (adb shell cat /data/data/<pkg>/shared_prefs/*.xml). Compare with the run-as approach from module 01: same data, but root does not depend on the app being debuggable — which is exactly why root matters when an engagement hands you a release build.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'Android Emulator with google_apis/AOSP images — a zero-cost rooted device',
              'Magisk (concept level here) — root and module framework for physical test devices',
              'frida-server — instrumentation daemon run as root (detailed in later modules)',
              'Objection — Frida wrapper for quick runtime exploration (detailed in later modules)'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming a rooted emulator reproduces production behavior — integrity verdicts, Play Protect, and hardware attestation all differ',
              'Rooting a personal daily-driver device used for your own banking: keep test devices isolated from your real life',
              'Forgetting that root itself is a detection signal — a clean snapshot lets you separate "the app refuses root" from "the app is broken"',
              'Running destructive system changes without a snapshot and rebuilding the lab from scratch'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Take a snapshot labeled baseline, run adb root, verify whoami returns root, then run adb unroot and verify the shell user returns to the app uid world (whoami shows your shell user again). Root on demand and off on demand — that toggle is the discipline later modules assume.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Root removes sandbox and system restrictions — the baseline capability for dynamic Android testing',
              'google_apis/AOSP emulator images give root with adb root; physical devices typically need Magisk (own hardware, in scope only)',
              'Root and instrumentation are also detection targets: resilience testing compares behavior with and without them',
              'Snapshots make root experiments cheap and reversible'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm02-l02-q1',
          type: 'mcq',
          prompt: 'Which pairing of image variant and adb root behavior is correct?',
          options: [
            'Google APIs: yes; Google Play: no',
            'Google APIs: no; Google Play: yes',
            'Both support it',
            'Neither supports it'
          ],
          answerIndex: 0,
          hint: 'One of them ships the Play Store with production signing.',
          explanation:
            'Google APIs/AOSP images are userdebug-style and support adb root; Google Play images are production user builds that refuse it to mirror real devices.'
        },
        {
          id: 'm02-l02-q2',
          type: 'truefalse',
          prompt: 'Magisk provides root by editing files directly inside /system.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'The word "systemless" is the clue.',
          explanation:
            'Magisk is systemless: it patches the boot image and overlays modifications instead of editing /system, which preserves integrity expectations and enables module-based extensions.'
        },
        {
          id: 'm02-l02-q3',
          type: 'short',
          prompt: 'Name two things root enables that a non-rooted shell cannot do.',
          modelAnswer:
            'Any two of: read other apps\u2019 private data (/data/data/<pkg>), modify the system CA trust store, run frida-server or attach to arbitrary processes, remount and modify /system, inspect protected system state via dumpsys.',
          hint: 'Think back to the sandbox boundaries from module 01.',
          explanation:
            'Root crosses the UID/SELinux boundaries the sandbox relies on, which is precisely why it is the baseline for dynamic analysis — and why apps can detect it.'
        },
        {
          id: 'm02-l02-q4',
          type: 'scenario',
          prompt:
            'A banking app in your scope refuses to start on your rooted emulator. What is the likely mechanism and how should you proceed?',
          modelAnswer:
            'Likely a Play Integrity check or app-level root/integrity detection refusing a non-attested, rooted environment. Document the behavior as a resilience observation, verify the detection logic in static analysis, and only pursue dedicated bypass techniques from later modules if resilience testing is explicitly in scope. Never attack out-of-scope components to get there.',
          hint: 'The app did not crash — it decided.',
          explanation:
            'Refusing rooted or non-attested environments is intended behavior (resilience posture). It is a finding about the app\u2019s defenses, not necessarily a defect — and the authorized response is documentation, not ad-hoc bypassing.'
        }
      ],
      references: [
        {
          title: 'OWASP MASTG — Android Security Testing',
          url: 'https://mas.owasp.org/MASTG/Android/0x05b-Android-Security-Testing/',
          note: 'Official testing setup and methodology chapter.'
        },
        {
          title: 'Android Developers — Play Integrity',
          url: 'https://developer.android.com/google/play/integrity',
          note: 'Official integrity verdict documentation referenced by many apps.'
        },
        {
          title: 'AOSP — Security overview',
          url: 'https://source.android.com/docs/security/overview',
          note: 'Why user builds, SELinux, and attestation exist in the first place.'
        }
      ]
    },
    {
      id: 'm02-l03',
      moduleId: 'm02',
      title: 'Device Connectivity and ADB Deep Dive',
      difficulty: 'Beginner',
      minutes: 20,
      prerequisites: ['m01-l08'],
      objectives: [
        'Explain the adb client/server/daemon architecture',
        'Connect over USB and wireless (pair/connect) and drive multiple devices with -s',
        'Diagnose device states (unauthorized, offline) and use key shell helpers'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module 01 taught you the verbs; this lesson teaches you to drive adb like a professional: over USB and wirelessly, with several devices at once, and with a recovery plan for the states you will inevitably hit — unauthorized, offline, stale servers.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'How adb is wired'
          },
          {
            type: 'p',
            text:
              'adb has three parts: a client (your command), a server (a background process on your workstation that brokers all connections), and adbd (the daemon on the device). The server scans USB ports and listens on TCP for emulators and wireless endpoints. Most adb weirdness — stale device lists, phantom ports — is fixed by restarting the server (adb kill-server).'
          },
          {
            type: 'h',
            text: 'USB and wireless'
          },
          {
            type: 'list',
            items: [
              'USB: enable Developer options, turn on USB debugging, accept the host RSA fingerprint prompt on the device',
              'Wireless (Android 11+): Developer options > Wireless debugging; adb pair <ip>:<pairing-port> with a one-time 6-digit code, then adb connect <ip>:<port>',
              'Wireless (older method): adb tcpip 5555 once over USB, then adb connect <ip>:5555 — acceptable only on trusted lab networks',
              'Emulators: reachable automatically on localhost ports 5554+; adb devices shows them as emulator-5554 and up'
            ]
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'Wireless debugging is a backdoor',
            text:
              'An open adb endpoint is an attack surface for anyone who can reach the port. Use wireless debugging on your lab network only, and disconnect (adb usb / toggle off) when done.'
          },
          {
            type: 'h',
            text: 'Multiple devices and states'
          },
          {
            type: 'p',
            text:
              'With an emulator and a physical device both attached, every command needs -s <serial> (or -e for the only emulator, -d for the only USB device). Device states you will see in adb devices: device (ready), unauthorized (the RSA consent prompt is waiting on the device), offline (stale adbd state, usually after a reboot), plus boot modes like recovery and bootloader that adb itself cannot talk to (fastboot territory).'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Engagements rarely involve one device: you will run an emulator for scripted tests while a physical device sits attached for realism checks, or two emulators to test app-to-app interaction. adb -s discipline plus evidence habits (screencap, logcat -d saved to files named by serial and timestamp) turn that chaos into an auditable trail.'
          },
          {
            type: 'list',
            items: [
              'adb devices -l gives human-readable model/product info — paste it into your test log at session start',
              'Wireless adb lets a device sit on the bench while you drive it from your workstation',
              'kill-server doubles as a hygiene control: it drops all connections when a session ends'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'unauthorized: accept the debugging prompt on the device screen — common after reinstalling the host or revoking authorizations',
              'offline: usually a transient adbd state after reboot; adb kill-server && adb devices re-syncs it',
              '"more than one device" errors: you forgot -s — adb refuses to guess, which is a feature',
              'Pairing port vs connect port: the pairing dialog shows its own one-time port and code, separate from the persistent connect port'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Wireless pairing and multi-device driving',
            lines: [
              '$ adb devices -l',
              'emulator-5554          device product:sdk_gphone64_x86_64',
              '$ adb pair 192.168.1.20:37841',
              'Enter pairing code: 624 519',
              'Successfully paired to 192.168.1.20:37841',
              '$ adb connect 192.168.1.20:40117',
              'connected to 192.168.1.20:40117',
              '$ adb -s 192.168.1.20:40117 shell getprop ro.product.model',
              'Pixel 7',
              '$ adb -s emulator-5554 install -t target.apk'
            ]
          },
          {
            type: 'p',
            text:
              'Shell helpers worth memorizing beyond module 01: getprop/setprop (system properties), settings (the settings database, including global http_proxy for the next lesson), input (tap/text/swipe injection for crude UI automation), df and mount (storage state), and dumpsys (every system service\u2019s state).'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Script the boring parts',
            text:
              'adb shell input tap and input text automate repetitive login flows in training apps — crude, but dependency-free UI scripting that saves minutes on every session.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Script a repeatable evidence snapshot per device: adb -s <serial> shell getprop ro.build.version.release; adb -s <serial> shell screencap -p /sdcard/evidence.png; adb -s <serial> pull /sdcard/evidence.png evidence-<serial>-<date>.png; adb -s <serial> logcat -d > logcat-<serial>.txt. Run it before and after each test action — your future report will cite these artifacts.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'adb — client, server, daemon; -s/-e/-d selectors for multi-device work',
              'fastboot — bootloader-mode flashing (own test devices only)',
              'scrcpy — open-source screen mirroring that rides on adb for comfortable device interaction'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Confusing the pairing port with the connect port in Wireless debugging — pairing uses a one-time port plus code; connecting uses the persistent port on the main toggle',
              'Forgetting -s with multiple devices and misreading the "more than one device" error as a broken setup',
              'Enabling tcpip 5555 mode on networks with untrusted devices and leaving it on — close it (adb usb) when done',
              'Blaming the device for offline state before restarting the adb server — host-side staleness is the usual cause'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Connect one emulator and one physical device (or two emulators). Drive both in one session using only -s selectors: install the training app on each, start it on one, dump package info on the other. Then run adb kill-server, reconnect everything, and confirm you can recover from a dead server without looking anything up.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'adb is client + host server + device daemon; kill-server fixes most host-side weirdness',
              'Wireless debugging pairs (one-time code) then connects; keep it off untrusted networks',
              'Multi-device work means -s discipline, always',
              'Know the states — device, unauthorized, offline — and the one-line recovery for each'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm02-l03-q1',
          type: 'mcq',
          prompt: 'Two devices are attached and you run adb shell whoami. What happens?',
          options: [
            'It runs on the first device adb finds',
            'It errors and asks you to disambiguate with -s',
            'It runs on both devices',
            'The server picks the emulator'
          ],
          answerIndex: 1,
          hint: 'adb refuses to guess.',
          explanation:
            'With multiple devices connected, adb errors ("more than one device/emulator") until you pass -s <serial>, -e (single emulator), or -d (single USB device).'
        },
        {
          id: 'm02-l03-q2',
          type: 'truefalse',
          prompt: 'adb pair and adb connect use the same port from the Wireless debugging screen.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'The pairing dialog shows its own port.',
          explanation:
            'Pairing uses a temporary port plus a one-time 6-digit code (under "Pair device with pairing code"); the persistent port on the main Wireless debugging screen is for adb connect.'
        },
        {
          id: 'm02-l03-q3',
          type: 'short',
          prompt: 'A device is listed as unauthorized. What is happening and what fixes it?',
          modelAnswer:
            'adbd is running and reachable, but the workstation\u2019s RSA key has not been trusted yet: accept the "Allow USB debugging?" prompt on the device screen (or revoke and re-grant debugging authorizations). No shell access is possible until the user consents.',
          hint: 'Look at the device screen, not the terminal.',
          explanation:
            'unauthorized is an authorization state, not a connection failure. The fix is explicit user consent on the device — one of the mechanisms that keeps adb from being a silent backdoor on production phones.'
        },
        {
          id: 'm02-l03-q4',
          type: 'scenario',
          prompt:
            'Your wireless connection to a rooted test phone on the lab bench shows offline after the device rebooted. Walk through the recovery.',
          modelAnswer:
            'offline usually means adbd restarted and the host record is stale: run adb kill-server && adb devices to rescan; if the wireless endpoint is gone, reconnect with adb connect <ip>:<port> (re-pair only if the authorization was lost). Confirm state with adb devices and re-run a getprop sanity check before resuming the session.',
          hint: 'It is usually a stale server record, not broken hardware.',
          explanation:
            'offline is the classic stale-state symptom after device reboots or server hiccups. kill-server plus rescan, then reconnect, resolves it in seconds — no re-flashing, no re-pairing.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Android Debug Bridge (adb)',
          url: 'https://developer.android.com/studio/command-line/adb',
          note: 'Official adb reference, including wireless pairing.'
        },
        {
          title: 'Android Developers — Run apps on a hardware device',
          url: 'https://developer.android.com/studio/run/device',
          note: 'USB debugging setup on physical devices.'
        },
        {
          title: 'Android Developers — Configure developer options',
          url: 'https://developer.android.com/studio/debug/dev-options',
          note: 'Where USB and wireless debugging live.'
        }
      ]
    },
    {
      id: 'm02-l04',
      moduleId: 'm02',
      title: 'Proxying Traffic with Burp Suite',
      difficulty: 'Beginner',
      minutes: 25,
      prerequisites: ['m02-l03'],
      objectives: [
        'Route device traffic through a Burp Proxy listener',
        'Use Intercept, HTTP history, and Match and Replace for mobile testing',
        'Explain why HTTPS apps fail behind a proxy and classify the causes'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Android apps are frontends for backend APIs. Almost every interesting business-logic weakness — broken authorization, trust-the-client checks, sensitive data in transit — shows up as HTTP(S) requests you can read and modify. An intercepting proxy puts you into that conversation. This lesson gets HTTP flowing through Burp; the next lesson solves HTTPS trust.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Plumbing'
          },
          {
            type: 'list',
            items: [
              'Burp listens on a Proxy listener (default 127.0.0.1:8080); rebind it to All interfaces so the device can reach it',
              'Point the device at it: Wi-Fi > modify network > proxy = manual, host = your workstation IP (from an emulator, 10.0.2.2 reaches the host loopback), port 8080',
              'Prefer adb: adb reverse tcp:8080 tcp:8080 lets the device use 127.0.0.1:8080, and adb shell settings put global http_proxy <ip>:8080 sets a global proxy (clear it with :0)',
              'Cleartext HTTP flows immediately; HTTPS needs the device to trust Burp\u2019s CA certificate (next lesson)'
            ]
          },
          {
            type: 'h',
            text: 'Inside Burp Proxy'
          },
          {
            type: 'p',
            text:
              'Intercept shows and holds requests/responses in flight (Forward, Drop, Edit); HTTP history records everything that passed, filterable after the fact; Match and Replace rewrites traffic automatically — useful to add headers or normalize responses while testing. For mobile work, history is the primary evidence surface: every API call the app made, in order, with tokens and parameters.'
          },
          {
            type: 'h',
            text: 'Why apps still break behind a proxy'
          },
          {
            type: 'list',
            items: [
              'Certificate pinning: the app refuses CAs it did not ship (deliberate; detection is a finding, bypass is a later module)',
              'Default trust change: apps targeting Android 7+ ignore user-installed CAs unless configured otherwise (next lesson)',
              'Non-HTTP protocols: raw TCP sockets, some HTTP/2 or mTLS setups need extra proxy configuration or fall outside the simple flow',
              'Client-side certificate validation or encryption above the TLS layer — the proxy sees bytes, not meaning'
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Once traffic flows, the API is naked: hosts, endpoints, headers (Authorization, custom signature headers), parameter names, and error messages. Standard early wins are reviewing history for insecure patterns (tokens in URLs, some endpoints on cleartext, verbose errors) and driving the app through its flows while you catalogue the API. The OWASP MASTG network chapter treats the proxy as the default observation post for mobile apps — and your saved history is the evidence that backs the findings.'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'A proxy is credential capture',
            text:
              'The proxy reads passwords, tokens, and personal data from the accounts you log into. Use dedicated test accounts on authorized targets, and never proxy traffic of apps or users outside your written scope.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Cleartext HTTP requests in history — an instant network-posture finding if they carry anything sensitive',
              'Tokens or passwords in query strings and URLs — they leak into logs and proxies',
              'Verbose error responses revealing backend stacks, frameworks, or SQL fragments',
              'Requests that never appear in the proxy — candidates for pinning or non-HTTP traffic'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'Get HTTP flowing',
            lines: [
              '$ adb reverse tcp:8080 tcp:8080        # device reaches host Burp on 127.0.0.1:8080',
              '$ adb shell settings put global http_proxy 127.0.0.1:8080',
              '$ adb shell settings get global http_proxy',
              '127.0.0.1:8080',
              '# ...drive the app through its flows...',
              '$ adb shell settings put global http_proxy :0    # clear when done'
            ]
          },
          {
            type: 'p',
            text:
              'In Burp: Proxy > Options > add or edit the listener (bind 8080 to All interfaces when not using adb reverse), enable Intercept when you want to edit a request, and watch HTTP history populate as you drive the training app through login and data screens.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Always unset the proxy',
            text:
              'A forgotten global proxy silently breaks the device\u2019s networking hours later — and points test traffic at whatever host happens to be listening then. Clear it at the end of every session.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Drive a training app\u2019s login through Burp and read the POST: note the endpoint, how the password travels, what the response contains (session token? role?), and whether any checksum or signature header exists. That header is your first hint at tamper protections you will meet in the API hardening modules. Then clear the proxy settings — hygiene first.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role'],
            rows: [
              ['Burp Suite (Community/Pro)', 'Interception proxy: Intercept, HTTP history, Match and Replace'],
              ['adb reverse / settings http_proxy', 'Scriptable, reversible ways to route device traffic to the proxy'],
              ['Device Wi-Fi proxy settings', 'Manual per-network proxy — the fallback when adb is not attached']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Expecting HTTPS to just work — without a trusted CA certificate every TLS request fails (next lesson fixes this)',
              'Leaving the listener bound only to 127.0.0.1 and wondering why the device cannot connect (unless you used adb reverse)',
              'Proxying with your personal accounts — the proxy captures credentials you are not authorized to expose',
              'Forgetting to reset http_proxy and later blaming the device for "broken internet"'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Set up the proxy path with adb reverse, drive three screens of the training app, then save your history (right-click in HTTP history > Save items) as the first artifact of your test log. Clear the proxy settings. A total loop under five minutes means you are ready for the HTTPS lesson.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'The proxy exposes the app\u2019s real interface: its backend API',
              'Emulator alias 10.0.2.2 or adb reverse routes device traffic to your host Burp',
              'History beats Intercept for coverage; Intercept is for the moment you want to edit',
              'HTTPS still blocked? That is trust (next lesson) or pinning (later modules) — not a broken setup'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm02-l04-q1',
          type: 'mcq',
          prompt: 'From inside an emulator, which address reaches a Burp listener running on the host machine?',
          options: ['127.0.0.1', '10.0.2.2', '192.168.0.1', 'The device\u2019s own IP'],
          answerIndex: 1,
          hint: 'The emulator aliases the host loopback on a special address.',
          explanation:
            'Android emulator networking maps 10.0.2.2 to the host\u2019s 127.0.0.1 loopback, so device proxy settings can point at 10.0.2.2:8080 for a host-bound Burp listener.'
        },
        {
          id: 'm02-l04-q2',
          type: 'truefalse',
          prompt: 'With no CA certificate installed, cleartext HTTP still flows through the proxy, but most HTTPS requests fail.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Which layer does the failure sit at?',
          explanation:
            'HTTP needs no trust. HTTPS fails because the app cannot validate Burp\u2019s certificate — solved by installing and trusting the CA (next lesson) or, where pinned, by the later bypass modules.'
        },
        {
          id: 'm02-l04-q3',
          type: 'short',
          prompt: 'Name two reasons an app\u2019s HTTPS traffic can fail to appear in your proxy despite a correct listener.',
          modelAnswer:
            'Any two of: certificate pinning (the app rejects the proxy CA), the app targeting Android 7+ not trusting user-installed CAs by default, non-HTTP protocols or mTLS the proxy is not configured for, or payload encryption above the TLS layer that hides meaning from HTTP tooling.',
          hint: 'Not every silence is a broken proxy.',
          explanation:
            'Blind spots in the proxy are themselves diagnostic: trust and pinning issues are security-relevant behaviors to document, and non-HTTP traffic needs different tooling.'
        },
        {
          id: 'm02-l04-q4',
          type: 'scenario',
          prompt:
            'During an authorized test you notice Bearer tokens in Burp history for endpoints you have not touched yet. What is the professional next step?',
          modelAnswer:
            'Save the history as evidence, note the endpoints in your working log, and test them only within the agreed scope (for example replaying your own token against in-scope endpoints to probe authorization). Do not tamper with other users\u2019 data or out-of-scope systems, and follow the engagement rules for handling captured credentials.',
          hint: 'Capturing is observation; acting on it is scope-bound.',
          explanation:
            'Traffic capture routinely reveals more surface than planned. Disciplined testers log it, scope-check it, and expand testing through the agreed process — that distinction separates a pentest from an attack.'
        }
      ],
      references: [
        {
          title: 'PortSwigger — Burp Suite',
          url: 'https://portswigger.net/burp',
          note: 'Official Burp Suite product and documentation portal.'
        },
        {
          title: 'PortSwigger — Proxy tool',
          url: 'https://portswigger.net/burp/documentation/desktop/tools/proxy',
          note: 'Official Proxy tool documentation: intercept, history, options.'
        },
        {
          title: 'Android Developers — Run apps on the Android Emulator',
          url: 'https://developer.android.com/studio/run/emulator',
          note: 'Emulator networking, including the 10.0.2.2 host alias.'
        }
      ]
    },
    {
      id: 'm02-l05',
      moduleId: 'm02',
      title: 'Certificates and Trust on Android',
      difficulty: 'Intermediate',
      minutes: 25,
      prerequisites: ['m02-l04'],
      objectives: [
        'Explain the system CA vs user CA distinction and the Android 7+ default change',
        'Install a CA certificate on an emulator and read a network security config',
        'Promote a CA into the system store on a rooted emulator (high level)'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The previous lesson ended with HTTPS failing. The cause is trust: TLS clients only accept certificates signed by CAs they already trust, and Burp\u2019s CA is not on that list. Android has two trust stores — system and user — and since Android 7, apps decide whether to consult the user store. Understanding that switch is the difference between a working HTTPS lab and days of confusion.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Two stores, one policy'
          },
          {
            type: 'list',
            items: [
              'System CAs: shipped with the OS (under /system/etc/security/cacerts), read-only, updated with the platform — the default trust anchors',
              'User CAs: installed by the device owner via Settings > Security > Install a certificate > CA certificate, stored in the user credential area',
              'Android 7 (API 24) change: apps targeting API 24+ trust only system CAs by default — user CAs are ignored unless the app opts in',
              'Apps opt in (or lock down) via a network security configuration XML referenced by android:networkSecurityConfig in the manifest'
            ]
          },
          {
            type: 'h',
            text: 'Network security config'
          },
          {
            type: 'p',
            text:
              'The network security config lets a developer define trust anchors and cleartext policy per domain. The debug-overrides element additionally trusts user-added CAs — but only when the build is debuggable, which makes it a legitimate hook for instrumenting your own debug builds during authorized tests.'
          },
          {
            type: 'code',
            lang: 'xml',
            title: 'network_security_config.xml (debug-overrides pattern)',
            code:
              '<network-security-config>\n  <base-config>\n    <trust-anchors>\n      <certificates src="system" />\n    </trust-anchors>\n  </base-config>\n  <debug-overrides>\n    <trust-anchors>\n      <certificates src="user" />\n    </trust-anchors>\n  </debug-overrides>\n</network-security-config>'
          },
          {
            type: 'h',
            text: 'Getting Burp\u2019s CA onto the device'
          },
          {
            type: 'p',
            text:
              'Two paths. User store: export Burp\u2019s CA (Proxy > Options > Import/export CA certificate, DER format), push it to the device, and install it via Settings — quick, but ignored by default by apps targeting API 24+. System store (rooted emulator): convert to PEM, name the file by OpenSSL subject hash (<hash>.0), remount /system writable (adb root; adb remount, starting the emulator with -writable-system where needed), copy into /system/etc/security/cacerts, fix permissions, reboot — then the CA is trusted by everything that trusts the system store.'
          },
          {
            type: 'diagram',
            id: 'cert-pinning-flow',
            caption: 'How apps validate TLS peers — and where a proxy CA fails the check.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'With the CA trusted app-wide, every HTTPS conversation becomes visible: full APIs, headers, and errors. When traffic still fails to appear, the likely explanation graduates from "CA not trusted" to "app pins certificates" — deliberate client-side trust enforcement you will learn to detect (a resilience finding in its own right) and, within an authorized scope, to bypass (later modules).'
          },
          {
            type: 'callout',
            variant: 'legal',
            title: 'Interception exposes credentials',
            text:
              'MITM of TLS reveals passwords, tokens, and personal data. Proxy only authorized targets, use dedicated test accounts, and handle captured secrets according to the engagement rules.'
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'android:networkSecurityConfig in the decoded manifest — read the XML: base-config and domain-config reveal per-domain trust and cleartext policy',
              'debug-overrides present in release builds (a smell) or missing in the debug builds you need to intercept',
              'Apps that still fail even with a system-store CA installed — pinning candidates',
              'usesCleartextTraffic and cleartextTrafficPermitted flags — complementary network posture signals'
            ]
          }
        ],
        howToTest: [
          {
            type: 'terminal',
            title: 'User-store CA on an emulator',
            lines: [
              '# Export Burp CA (DER) on the host, then:',
              '$ adb push cacert.der /sdcard/Download/burp-ca.cer',
              '# On the device: Settings > Security > Encryption & credentials >',
              '#   Install a certificate > CA certificate > pick the file (set a screen lock if asked)',
              '# Then re-run the app behind the proxy from lesson 04'
            ]
          },
          {
            type: 'terminal',
            title: 'System-store CA (rooted emulator, high level)',
            lines: [
              '$ openssl x509 -inform DER -in cacert.der -out burp.pem',
              '$ openssl x509 -subject_hash_old -in burp.pem | head -1   # e.g. 9a5ba575',
              '# adb root && adb remount   (start emulator with -writable-system if needed)',
              '$ adb push burp.pem /system/etc/security/cacerts/9a5ba575.0',
              '$ adb shell chmod 644 /system/etc/security/cacerts/9a5ba575.0',
              '# reboot the emulator, verify under Settings > Trusted credentials > System'
            ]
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Newer Android tightened the system store',
            text:
              'Recent releases manage the system CA set as a platform-updatable component, so the copy-into-/system shortcut may need updated techniques on the newest images — check current MASTG guidance for your API level.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Install the user CA first and re-drive the training app: endpoints that now load were either configured to trust user CAs or targeting older API levels. Then move the CA to the system store on your rooted emulator and re-test: whatever still fails is pinning or non-HTTP. You have just triaged the app\u2019s network posture with two certificate moves — no code inspection yet.'
          }
        ],
        tools: [
          {
            type: 'list',
            items: [
              'Burp Suite — export the proxy CA (Proxy > Options > Import/export CA certificate)',
              'openssl — DER/PEM conversion and subject-hash naming for the system store',
              'adb root / remount / push — the system-store installation path on test images',
              'keytool — inspect keystores when analyzing app-bundled certificates'
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Installing a user CA and concluding "the app is pinned" when the app simply follows the Android 7+ default of ignoring user CAs',
              'Wrong format or filename in the system store: PEM content named with the OpenSSL old subject hash (<hash>.0) is required',
              'Forgetting the reboot after editing /system/etc/security/cacerts',
              'Confusing pinning with trust-store issues — verify against static findings (pinning code, network config) before claiming a bypass is needed'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Run the full loop: proxy the training app, install the user CA, note which requests recover; promote the CA into the system store, reboot, note the rest. Record which trust state made each endpoint visible — that table is your triage artifact for the network testing modules, and it took no code inspection.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Android trusts system CAs by default; user CAs are opt-in for apps targeting API 24+',
              'Network security config (including debug-overrides) is the app-side switch for trust policy',
              'On rooted test images, promote your CA to the system store for app-wide interception',
              'Remaining blind spots are usually pinning — a security behavior to document before ever bypassing'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'm02-l05-q1',
          type: 'mcq',
          prompt: 'Since Android 7 (API 24), apps targeting that level and above trust which CAs by default?',
          options: [
            'System and user CAs',
            'System CAs only',
            'User CAs only',
            'App-bundled CAs only'
          ],
          answerIndex: 1,
          hint: 'The change was motivated by user-installed CAs being an abuse vector.',
          explanation:
            'Android 7 stopped trusting user-added CAs by default for apps targeting API 24+. User CAs are honored only via explicit network security configuration or on older targetSdk levels.'
        },
        {
          id: 'm02-l05-q2',
          type: 'truefalse',
          prompt: 'debug-overrides in a network security config trusts user-added CAs on any build of the app.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'The name says debug.',
          explanation:
            'debug-overrides applies only when the app is debuggable (debug builds). It is the sanctioned way to intercept your own debug builds without changing the release trust policy.'
        },
        {
          id: 'm02-l05-q3',
          type: 'short',
          prompt:
            'You install a user CA but an app\u2019s HTTPS still fails, and static review shows no pinning code. What is the most likely explanation and the fix?',
          modelAnswer:
            'The app targets API 24+ and follows the default policy of trusting only system CAs, so the user store is ignored. Fix by promoting your CA into the system store of a rooted test image (or use a debuggable build with debug-overrides) and re-test.',
          hint: 'Re-read the Android 7 default change.',
          explanation:
            'Pinning becomes the suspect only after the trust-store explanation is excluded. The system-store promotion makes your CA a trust anchor for every default-policy app on the image.'
        },
        {
          id: 'm02-l05-q4',
          type: 'scenario',
          prompt:
            'After promoting the CA to the system store, one endpoint still refuses to connect while all others work. Static review reveals code comparing the server certificate against a bundled copy. Classify this behavior and state the correct next step in an authorized engagement.',
          modelAnswer:
            'This is certificate pinning: the app enforces its own trust beyond the system store. Document it as a resilience/network-security observation (a positive control), verify the implementation in static analysis, and only pursue the dedicated pinning-bypass techniques from later modules if resilience testing is explicitly in scope.',
          hint: 'One endpoint, a special check, a bundled certificate — name the control.',
          explanation:
            'Selective TLS failure plus bundled-certificate comparison is the classic pinning signature. Treating it as a finding (and potentially an in-scope bypass target) is the professional workflow — not a proxy configuration bug.'
        }
      ],
      references: [
        {
          title: 'Android Developers — Network security configuration',
          url: 'https://developer.android.com/training/articles/security-config',
          note: 'Official trust anchors and debug-overrides documentation.'
        },
        {
          title: 'Android Developers — Android 7.0 behavior changes',
          url: 'https://developer.android.com/about/versions/nougat/android-7.0-changes',
          note: 'The user CA default-trust change, straight from the release notes.'
        },
        {
          title: 'OWASP MASTG — Testing Network Communication',
          url: 'https://mas.owasp.org/MASTG/Android/0x05f-Testing-Network-Communication/',
          note: 'The canonical mobile network testing playbook.'
        }
      ]
    }
  ]
};
