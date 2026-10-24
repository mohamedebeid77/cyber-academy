import type { Tool } from '../types';

// Toolkit reference — original descriptions synthesized from official tool
// documentation. Maintenance status is stated honestly; verify before relying.

export const tools: Tool[] = [
  {
    id: 'adb',
    image: 'adb.png',
    imageCredit: 'Screenshot: PhotographyEdits via Wikimedia Commons (CC BY-SA 4.0)',
    visual: 'device',
    name: 'ADB (Android Debug Bridge)',
    category: 'CLI',
    status: 'current',
    purpose:
      'The universal command-line bridge to any connected Android device or emulator: install and drive apps, read the system log, run shell commands, copy files and tunnel ports. Every dynamic technique in this academy assumes adb works.',
    install:
      'Comes with Android SDK Platform-Tools. Install via Android Studio (SDK Manager) or download platform-tools directly from developer.android.com and add the folder to PATH. Verify with: adb version',
    usage:
      'adb runs a client on your workstation that talks to a server, which talks to adbd on each device. Prefix commands with -s <serial> when several devices are attached. Shell commands run through: adb shell <command>. Enable USB debugging (Developer options) on real devices; emulators are ready out of the box.',
    commands: [
      { cmd: 'adb devices -l', desc: 'List connected devices/emulators with details' },
      { cmd: 'adb install -t app.apk', desc: 'Install APK allowing test packages' },
      { cmd: 'adb shell pm path com.example.app', desc: 'Show installed APK location' },
      { cmd: 'adb pull /data/app/.../base.apk .', desc: 'Pull the APK for static analysis' },
      { cmd: 'adb shell pm list packages -3', desc: 'List third-party packages' },
      { cmd: 'adb logcat --pid=$(adb shell pidof com.example.app)', desc: 'Scoped log stream for one process' },
      { cmd: 'adb shell am start -n pkg/.MainActivity', desc: 'Start a component explicitly' },
      { cmd: 'adb shell am broadcast -a com.example.ACTION', desc: 'Send a broadcast' },
      { cmd: 'adb shell screencap /sdcard/s.png', desc: 'Capture device screen' },
      { cmd: 'adb forward tcp:27042 tcp:27042', desc: 'Tunnel a device port (e.g. Frida) to the host' },
      { cmd: 'adb shell run-as com.example.app ls', desc: 'Execute as an app on debuggable builds' },
      { cmd: 'adb shell dumpsys package com.example.app', desc: 'Package metadata, permissions, components' }
    ],
    whenToUse: [
      'Installing/launching training apps and driving components during dynamic analysis',
      'Reading logs and dumping app data on debuggable or rooted targets',
      'Setting up tunnels for Frida and other instrumentation tooling'
    ],
    docsUrl: 'https://developer.android.com/studio/command-line/adb',
    relatedLessons: ['m01-l08', 'm02-l03', 'm05-l02']
  },
  {
    id: 'android-studio',
    image: 'android-studio.png',
    imageCredit: 'Screenshot: Wikimedia Commons (Apache 2.0) — Android Studio by Google and JetBrains',
    visual: 'ide',
    name: 'Android Studio',
    category: 'IDE',
    status: 'current',
    purpose:
      'The official IDE. For pentesters it is the fastest way to create emulators (AVD Manager), manage SDK packages, attach a debugger to debuggable apps, and inspect APKs with the built-in APK Analyzer.',
    install:
      'Download from developer.android.com/studio. The installer bundles the SDK, platform-tools and an initial emulator image. Keep it updated via the IDE updater.',
    usage:
      'Use Device Manager to create AVDs with the system image that matches your need (Google APIs images are rootable-friendly for testing; Play images are locked down). Use Logcat panel for filtered logs, the Profiler for runtime observation, and Build → Analyze APK for a quick static look at any APK file.',
    commands: [
      { cmd: 'Device Manager → Create Virtual Device', desc: 'Create an AVD with a chosen system image' },
      { cmd: 'SDK Manager → SDK Tools', desc: 'Install/upgrade platform-tools, emulator, NDK' },
      { cmd: 'Run → Attach Debugger to Android Process', desc: 'Debug a debuggable app (JDWP)' },
      { cmd: 'Build → Analyze APK…', desc: 'Open any APK: manifest, DEX, resources' },
      { cmd: 'Logcat panel: package:com.example.app', desc: 'Filter device logs to one package' },
      { cmd: 'File → Settings → HTTP Proxy', desc: 'Route Studio traffic if your lab needs it' }
    ],
    whenToUse: [
      'Creating clean, reproducible test devices (AVDs, snapshots)',
      'Attaching the Java debugger to debuggable training apps',
      'Quick manifest/DEX inspection via the APK Analyzer'
    ],
    docsUrl: 'https://developer.android.com/studio',
    relatedLessons: ['m02-l01', 'm05-l01']
  },
  {
    id: 'jadx',
    image: 'jadx.png',
    imageCredit: 'jadx project — github.com/skylot/jadx',
    visual: 'disassembler',
    name: 'JADX',
    category: 'CLI / GUI',
    status: 'current',
    purpose:
      'The standard DEX-to-Java decompiler. Turns app bytecode into readable Java with cross-references, full-text search and resource viewing — the backbone of Android static analysis.',
    install:
      'Download a release from github.com/skylot/jadx (Windows: jadx-gui.bat) or install via a package manager (e.g. scoop/winget/choco or brew). Requires Java. CLI tools jadx and jadx-gui ship in the same archive.',
    usage:
      'Open an APK directly in jadx-gui — it decompiles on load. Use Navigation → text search (Ctrl+Shift+F) across code/resources, jump with Ctrl+click, and save the whole project (File → Save all) to grep it with external tools. For automation use the CLI: jadx -d out app.apk.',
    commands: [
      { cmd: 'jadx-gui app.apk', desc: 'Open APK in the GUI decompiler' },
      { cmd: 'jadx -d out/ app.apk', desc: 'Decompile to Java sources on disk' },
      { cmd: 'jadx --show-bad-code app.apk', desc: 'Keep code jadx could not fully decompile' },
      { cmd: 'jadx --deobf -d out/ app.apk', desc: 'Generate readable names for obfuscated code' },
      { cmd: 'jadx-gui: Ctrl+Shift+F', desc: 'Full-text search across sources and resources' },
      { cmd: 'jadx-gui: File → Save as Gradle project', desc: 'Export browsable project structure' }
    ],
    whenToUse: [
      'First full read of an app: entry points, crypto, storage, network calls',
      'Hunting hardcoded secrets and endpoints with text search',
      'Tracing how an exported component consumes its intent extras'
    ],
    docsUrl: 'https://github.com/skylot/jadx',
    relatedLessons: ['m04-l02', 'm04-l04', 'm04-l06']
  },
  {
    id: 'apktool',
    visual: 'terminal',
    name: 'apktool',
    category: 'CLI',
    status: 'current',
    purpose:
      'Decodes APKs into readable resources (XML, arsc) and Smali, and rebuilds them after edits. It is the tool for resource inspection and for patching bytecode when decompiling to Java is not needed.',
    install:
      'Download the latest jar from github.com/iBotPeaches/Apktool/releases (plus the wrapper script), or install via a package manager. Requires Java. Invoke as: java -jar apktool.jar <command> or via the wrapper.',
    usage:
      'apktool d app.apk decodes resources and Smali into a folder; edit what you need; apktool b folder -o patched.apk rebuilds. Rebuilt APKs are unsigned — sign with apksigner before installing. Decoding is lossless for resources; Smali edits require valid register usage.',
    commands: [
      { cmd: 'apktool d app.apk', desc: 'Decode resources + Smali into ./app' },
      { cmd: 'apktool d -s app.apk', desc: 'Decode resources only, keep classes.dex raw' },
      { cmd: 'apktool b app -o patched.apk', desc: 'Rebuild a decoded folder into an APK' },
      { cmd: 'apktool d --only-main-classes app.apk', desc: 'Faster decode of large multidex apps' },
      { cmd: 'edit app/AndroidManifest.xml', desc: 'Manifest is decoded to readable XML' },
      { cmd: 'apksigner sign --ks test.keystore patched.apk', desc: 'Re-sign after rebuild (required to install)' }
    ],
    whenToUse: [
      'Reading and editing manifest/resources with full fidelity',
      'Small Smali patches ( flipping a boolean, changing a constant) on training apps',
      'Resolving resources.arsc content that decompilers hide'
    ],
    docsUrl: 'https://github.com/iBotPeaches/Apktool',
    relatedLessons: ['m03-l03', 'm04-l03']
  },
  {
    id: 'mobsf',
    visual: 'report',
    name: 'MobSF',
    category: 'Static/dynamic scanner',
    status: 'current',
    purpose:
      'Automated mobile security framework: static analysis of APK/IPA/source (manifest issues, insecure APIs, secrets, trackers) plus limited dynamic analysis on emulators. Great first-pass triage engine.',
    install:
      'Docker is the cleanest route: docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf — or pip install mobsfscan for CLI static scanning. The web UI runs at http://localhost:8000.',
    usage:
      'Upload an APK in the web UI and read the report: manifest red flags, component exposure, insecure function calls, hard-coded secrets, malware signals. Treat MobSF findings as leads to verify manually, not as a final verdict — it cannot understand business logic.',
    commands: [
      { cmd: 'docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf', desc: 'Run MobSF web UI' },
      { cmd: 'pip install mobsfscan && mobsfscan ./src', desc: 'Scan decompiled/Java/Kotlin sources via CLI' },
      { cmd: 'Upload APK → Static Analysis', desc: 'Full automated report in the browser' },
      { cmd: 'Report → MANIFEST Analysis', desc: 'Exported components, backup/debuggable flags' },
      { cmd: 'Report → Code Analysis', desc: 'Insecure API usage matched to rules' }
    ],
    whenToUse: [
      'Fast first-pass triage of an unfamiliar APK',
      'Checklist coverage: it flags dozens of known-bad patterns at once',
      'Generating screenshots/evidence for report appendices'
    ],
    docsUrl: 'https://github.com/MobSF/Mobile-Security-Framework-MobSF',
    relatedLessons: ['m04-l01', 'm08-l01']
  },
  {
    id: 'frida',
    visual: 'terminal',
    name: 'Frida',
    category: 'Instrumentation framework',
    status: 'current',
    purpose:
      'The standard cross-platform instrumentation toolkit. Injects a JavaScript agent into a running process to trace calls, inspect and modify arguments/return values, and alter behavior in real time — with no rebuilds.',
    install:
      'Host tools: pip install frida-tools. Device side: download the frida-server binary matching your platform AND version from github.com/frida/frida/releases, push it to the emulator (e.g. /data/local/tmp) and run it as root. Versions of client and server must match.',
    usage:
      'frida-ps -U lists processes; frida -U -f <package> spawns with your script attached (-l script.js), or attach by name. Scripts use Java.perform for Java hooks and Interceptor for native functions. The REPL is ideal for exploration; files for repeatable scripts. Module 12 teaches this progressively.',
    commands: [
      { cmd: 'pip install frida-tools', desc: 'Install CLI + Python bindings on the host' },
      { cmd: 'adb push frida-server-android-arm64 /data/local/tmp/', desc: 'Deploy server to device' },
      { cmd: 'adb shell /data/local/tmp/frida-server &', desc: 'Start frida-server (root/userdebug needed)' },
      { cmd: 'frida-ps -U', desc: 'List processes via USB/emulator' },
      { cmd: 'frida -U -f com.example.app -l hook.js', desc: 'Spawn app with script attached' },
      { cmd: 'frida-trace -U -i "open*" -f com.example.app', desc: 'Auto-trace native functions' },
      { cmd: 'adb forward tcp:27042 tcp:27042', desc: 'Fallback: reach frida-server over TCP' }
    ],
    whenToUse: [
      'Understanding what an app actually checks at runtime (auth, root, crypto inputs)',
      'Verifying static-analysis hypotheses with live data',
      'Evaluating anti-analysis defenses on authorized targets'
    ],
    docsUrl: 'https://frida.re/docs/home/',
    relatedLessons: ['m05-l04', 'm12-l01', 'm12-l02']
  },
  {
    id: 'objection',
    image: 'objection.png',
    imageCredit: 'objection project — github.com/sensepost/objection',
    visual: 'terminal',
    name: 'Objection',
    category: 'Runtime toolkit',
    status: 'current',
    purpose:
      'A Frida-powered runtime exploration toolkit with ready-made commands: enumerate classes, hook everything, dump storage, bypass common checks and patch APKs — no script writing required.',
    install:
      'pip install objection. For the patching mode, also have apktool and a keystore available (objection patchapk wraps them). Uses your existing Frida setup on the device.',
    usage:
      'objection patchapk -s app.apk injects a gadget into an APK for non-rooted devices, or explore an app directly on a rooted emulator: objection explore. Inside the REPL, the android namespace covers hooking, storage, intents and more. Excellent for mapping an app fast before writing custom Frida scripts.',
    commands: [
      { cmd: 'pip install objection', desc: 'Install on the host' },
      { cmd: 'objection patchapk -s app.apk', desc: 'Embed the Frida gadget into an APK' },
      { cmd: 'objection explore', desc: 'Start a runtime REPL on the attached app' },
      { cmd: 'android hooking list activities', desc: 'Enumerate activities of the current app' },
      { cmd: 'android hooking watch class com.example.Foo', desc: 'Trace all method calls of a class' },
      { cmd: 'android storage list', desc: 'Show app-accessible storage locations' },
      { cmd: 'android intent launch_activity com.example.Secret', desc: 'Start an activity from the REPL' }
    ],
    whenToUse: [
      'Quick exploration without writing Frida scripts',
      'Testing apps on non-rooted devices via the patched gadget',
      'Teaching demos: every action is one readable command'
    ],
    docsUrl: 'https://github.com/sensepost/objection',
    relatedLessons: ['m05-l05', 'm12-l02']
  },
  {
    id: 'burp',
    image: 'burp.png',
    imageCredit: 'Screenshot: Mvb71 via Wikimedia Commons (CC BY-SA 4.0)',
    visual: 'proxy',
    name: 'Burp Suite',
    category: 'Proxy / GUI',
    status: 'current',
    purpose:
      'The industry-standard HTTP interception proxy. Sits between an Android app and its backend to capture, inspect, modify and replay API traffic — the bridge between mobile and web testing.',
    install:
      'Download from portswigger.net (Community edition is free, Professional adds scanner/save state). Java bundled. Configure the proxy listener on all interfaces (Proxy → Options → Add, bind 8080, All interfaces) so the emulator/device can reach it.',
    usage:
      'Set the device Wi-Fi proxy to your host IP:8080, install Burp\'s CA certificate on the device (and into the system store on rooted emulators for Android 7+), then read traffic in Proxy → HTTP history. Use Repeater to replay modified requests and Intruder for controlled fuzzing. Module 06 walks the full setup.',
    commands: [
      { cmd: 'Proxy → Options → Add listener :8080 (All interfaces)', desc: 'Accept traffic from the device' },
      { cmd: 'Device Wi-Fi → proxy = <host-ip>:8080', desc: 'Point Android at Burp' },
      { cmd: 'http://burp → download CA', desc: 'Fetch the CA cert from the proxy' },
      { cmd: 'Proxy → HTTP history', desc: 'Every request the app made, stored' },
      { cmd: 'Send to Repeater', desc: 'Replay and modify individual requests' },
      { cmd: 'Target → Site map', desc: 'Endpoint tree discovered via traffic' }
    ],
    whenToUse: [
      'Mapping an app\u2019s API surface by watching real traffic',
      'Authorization testing (BOLA/IDOR) with two test accounts',
      'Token/session analysis and request tampering'
    ],
    docsUrl: 'https://portswigger.net/burp/documentation',
    relatedLessons: ['m02-l04', 'm06-l03', 'm10-l02']
  },
  {
    id: 'ghidra',
    image: 'ghidra.png',
    imageCredit: 'Screenshot: Philipnelson99 via Wikimedia Commons (CC BY-SA 4.0)',
    visual: 'disassembler',
    name: 'Ghidra',
    category: 'RE suite',
    status: 'current',
    purpose:
      'NSA\u2019s open-source reverse engineering suite. Disassembles and decompiles the native libraries (.so) that ship inside APKs — where crypto, licensing and anti-tamper logic often hides.',
    install:
      'Download a release from ghidra-sre.org, extract, and run ghidraRun (requires JDK 17+). No special Android components needed: native .so files are ordinary ELF binaries.',
    usage:
      'Create a project → import lib/arm64-v8a/libtarget.so → analyze. Use the Function List and Exports view to find JNI entry points (Java_com_example_…), the decompiler panel for readable C-like output, and cross-references to follow data (strings, constants). Pairs with Frida for verifying native findings dynamically.',
    commands: [
      { cmd: 'ghidraRun', desc: 'Launch the CodeBrowser UI' },
      { cmd: 'File → Import File → libtarget.so', desc: 'Load an Android native library' },
      { cmd: 'Double-click import → Analyze now', desc: 'Run auto-analysis' },
      { cmd: 'Filter: Java_', desc: 'Find JNI-exported functions' },
      { cmd: 'Window → Decompiler', desc: 'Readable pseudo-C for any function' },
      { cmd: 'Search → For Strings', desc: 'Locate strings referenced by code' }
    ],
    whenToUse: [
      'Analyzing native code that static DEX tools cannot see',
      'Understanding checks implemented in C/C++ (root, integrity, crypto)',
      'Cross-checking JNI boundaries: which values cross Java↔native'
    ],
    docsUrl: 'https://ghidra-sre.org/',
    relatedLessons: ['m11-l02', 'm11-l03']
  },
  {
    id: 'mitmproxy',
    image: 'mitmproxy.png',
    imageCredit: 'Diagram: mitmproxy documentation — mitmproxy.org',
    visual: 'proxy',
    name: 'mitmproxy',
    category: 'CLI proxy',
    status: 'current',
    purpose:
      'A free, scriptable HTTPS proxy with a terminal and web UI. A lightweight alternative to Burp for capturing and rewriting Android traffic, especially for automated or long-running capture scenarios.',
    install:
      'pip install mitmproxy (or installers from mitmproxy.org). First run generates a CA certificate in ~/.mitmproxy — install it on the device (and to the system store on rooted emulators for full coverage).',
    usage:
      'Run mitmproxy (TUI), mitmweb (browser UI) or mitmdump (headless) listening on 8080, point the device proxy at your host, and install the mitmproxy CA. Python add-on scripts can rewrite requests/responses on the fly — handy for simulating server behavior.',
    commands: [
      { cmd: 'mitmweb --listen-port 8080', desc: 'Web-UI proxy on port 8080' },
      { cmd: 'mitmdump -w capture.flow', desc: 'Headless capture to a file' },
      { cmd: 'mitmproxy --set confdir=~/.mitmproxy', desc: 'Where the CA cert lives' },
      { cmd: 'mitmdump -s addon.py', desc: 'Rewrite traffic with a Python script' },
      { cmd: '~u api.example.com', desc: 'Filter view to one API host' }
    ],
    whenToUse: [
      'Capturing traffic without a GUI license or heavyweight tooling',
      'Scripted traffic rewriting and replay in pipelines',
      'Quick one-off captures on your own test devices'
    ],
    docsUrl: 'https://mitmproxy.org/',
    relatedLessons: ['m06-l03', 'm10-l02']
  },
  {
    id: 'drozer',
    visual: 'terminal',
    name: 'Drozer',
    category: 'IPC testing framework',
    status: 'niche',
    purpose:
      'A classic Android IPC testing console: enumerates and interacts with activities, services, receivers and especially content providers from an agent on the device. Still referenced for provider/receiver deep-dives.',
    install:
      'pip install drozer (host console) plus the drozer agent APK on the device. Maintenance activity has moved across owners over the years (now under WithSecure Labs on GitHub) — check the repository for current status before investing time; many of its checks can also be done with plain adb/JADX.',
    usage:
      'Start the agent on the device, forward a port (adb forward tcp:31415 tcp:31415), connect with drozer console connect, then use modules like app.activity.info, app.provider.query and app.package.attacksurface to enumerate and attack IPC surface of authorized targets.',
    commands: [
      { cmd: 'adb forward tcp:31415 tcp:31415', desc: 'Tunnel to the on-device agent' },
      { cmd: 'drozer console connect', desc: 'Open the console' },
      { cmd: 'run app.package.attacksurface com.example.app', desc: 'Summarize exposed components' },
      { cmd: 'run app.activity.info -a com.example.app', desc: 'List activities and permissions' },
      { cmd: 'run app.provider.query content://com.example.provider/keys', desc: 'Query a provider directly' },
      { cmd: 'run app.provider.read content://.../file', desc: 'Test provider file access' }
    ],
    whenToUse: [
      'Systematic content provider testing on authorized targets',
      'Teaching/learning IPC attack surface in a structured way',
      'Historical context: many guides still reference it'
    ],
    docsUrl: 'https://github.com/WithSecureLabs/drozer',
    relatedLessons: ['m01-l04', 'm07-l03']
  },
  {
    id: 'radare2',
    image: 'radare2.png',
    imageCredit: 'Screenshot: pancake via Wikimedia Commons (LGPL)',
    visual: 'disassembler',
    name: 'radare2 / r2',
    category: 'CLI RE',
    status: 'niche',
    purpose:
      'A scriptable command-line reverse engineering framework. A terminal-first alternative to Ghidra for quick native-library inspections and scripted analysis; rizin/Cutter are active forks/successors worth knowing about.',
    install:
      'Install via package manager or from github.com/radareorg/radare2 (git clone + sys/install.sh). Cutter (github.com/rizinorg/cutter) offers a GUI over the same ideas if you prefer windows over sockets.',
    usage:
      'r2 -A libtarget.so opens and analyzes a library; pdf @ sym.function disassembles; izz lists strings; aaa is auto-analysis. Script everything with r2 commands in files or drive it from Python (r2pipe). The learning curve is steeper than Ghidra\u2019s — use it when you need repeatability or raw speed.',
    commands: [
      { cmd: 'r2 -A libtarget.so', desc: 'Open + analyze a native library' },
      { cmd: 'aaa', desc: 'Full auto-analysis' },
      { cmd: 'pdf @ sym.Java_com_example_Native_check', desc: 'Disassemble a function' },
      { cmd: 'izz~flag', desc: 'Search strings for a keyword' },
      { cmd: 'afl', desc: 'List functions' },
      { cmd: 'q!', desc: 'Quit without saving' }
    ],
    whenToUse: [
      'Quick scripted lookups in .so files without a GUI',
      'Automated analysis pipelines (CI-style experiments)',
      'When you want one tool for many architectures and formats'
    ],
    docsUrl: 'https://github.com/radareorg/radare2',
    relatedLessons: ['m11-l02']
  },
  {
    id: 'apksigner',
    visual: 'terminal',
    name: 'apksigner (build-tools)',
    category: 'CLI',
    status: 'current',
    purpose:
      'Signs and verifies APKs with the modern v1–v3 signature schemes. Required whenever you rebuild or patch an APK (apktool edits, objection gadgeting) and useful for checking an app\u2019s signature posture.',
    install:
      'Ships with Android SDK Build-Tools (SDK Manager). Located in <sdk>/build-tools/<version>/apksigner. Requires Java. The sibling zipalign should be run before signing for v1 alignment.',
    usage:
      'Create a test keystore once with keytool, then sign rebuilt APKs: apksigner sign --ks test.keystore patched.apk. Verify any APK\u2019s schemes with apksigner verify --print-certs. Installer errors like INSTALL_PARSE_FAILED_NO_CERTIFICATES usually mean a missing re-sign.',
    commands: [
      { cmd: 'keytool -genkey -v -keystore test.keystore -alias test -keyalg RSA -keysize 2048 -validity 10000', desc: 'Create a throwaway test keystore' },
      { cmd: 'apksigner sign --ks test.keystore patched.apk', desc: 'Sign a rebuilt APK' },
      { cmd: 'apksigner verify --print-certs app.apk', desc: 'Show signature schemes + cert details' },
      { cmd: 'apksigner verify --verbose app.apk', desc: 'Per-scheme verification detail' },
      { cmd: 'zipalign -p 4 in.apk aligned.apk', desc: 'Align before signing (v1 workflows)' }
    ],
    whenToUse: [
      'Re-signing APKs you patched on training targets',
      'Checking which signature schemes an app uses',
      'Producing installable artifacts after apktool/objection workflows'
    ],
    docsUrl: 'https://developer.android.com/studio/command-line/apksigner',
    relatedLessons: ['m03-l05', 'm04-l03']
  }
];
