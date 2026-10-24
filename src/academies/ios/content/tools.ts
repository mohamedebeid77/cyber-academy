import type { Tool } from '../../../types';

// iOS Application Pentesting Academy — toolkit reference.
// Status reflects currency at authoring time; verify before relying on install
// commands (tooling churns — the module lessons note version-sensitive spots).

export const tools: Tool[] = [
  {
    id: 'xcode',
    visual: 'ide',
    name: 'Xcode',
    category: 'Apple toolchain',
    purpose:
      'Apple\u2019s IDE and the anchor of iOS testing: SDKs, the iOS Simulator, device debugging plumbing, container access for dev builds, and the signing context everything else assumes.',
    status: 'current',
    install: 'Mac App Store, or developer.apple.com/download (xip). Accept the license: xcodebuild -license',
    usage:
      'Primarily consumed through its tooling: the simulator (with simctl), Devices window (install, container download, logs), and the debugger. Rarely opened for its editor in testing work — opened for its plumbing.',
    commands: [
      { cmd: 'xcodebuild -license', desc: 'Accept the license after install' },
      { cmd: 'xcode-select --install', desc: 'Install Command Line Tools (lighter subset)' },
      { cmd: 'Devices window → Download Container', desc: 'Pull a dev build\u2019s full data container (module i13\u2019s channel)' }
    ],
    whenToUse: [
      'Simulator work (boot, install, UI inspection)',
      'Dev-build container pulls and on-device logs',
      'The debugger plumbing LLDB and Frida assume'
    ],
    docsUrl: 'https://developer.apple.com/xcode/',
    relatedLessons: ['i07-l01', 'i07-l02', 'i13-l01']
  },
  {
    id: 'xcrun-devicectl',
    visual: 'device',
    name: 'xcrun (simctl / devicectl)',
    category: 'Apple toolchain',
    purpose:
      'The command-line surface over Xcode\u2019s capabilities: simctl drives simulators; devicectl (Xcode 15+) installs/launches/manages apps on physical devices — the scripting backbone of every lab in this academy.',
    status: 'current',
    install: 'Ships with Xcode — nothing extra.',
    usage: 'Scripted install/launch/log loops; the environment-as-code habit (module i07-l01) is written in these commands.',
    commands: [
      { cmd: 'xcrun devicectl list devices', desc: 'List connected physical devices' },
      { cmd: 'xcrun devicectl device install apps --device <UDID> app.ipa', desc: 'Install an IPA on device' },
      { cmd: 'xcrun devicectl device process launch --device <UDID> com.bundle.id', desc: 'Launch an app on device' },
      { cmd: 'xcrun simctl list devices available', desc: 'List simulator devices' },
      { cmd: 'xcrun simctl install booted app.ipa', desc: 'Install into the booted simulator' },
      { cmd: 'xcrun simctl openurl booted "scheme://path"', desc: 'Invoke a deep link in the simulator (module i16)' },
      { cmd: 'xcrun simctl get_app_container booted com.bundle.id data', desc: 'Print the simulator container path (triage-only channel)' }
    ],
    whenToUse: [
      'Every install/launch in labs and engagements',
      'Deep link invocation on simulator',
      'Simulator container triage (never device claims)'
    ],
    docsUrl: 'https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device',
    relatedLessons: ['i07-l01', 'i16-l01', 'i13-l01']
  },
  {
    id: 'pymobiledevice3',
    visual: 'device',
    name: 'pymobiledevice3',
    category: 'Device communication',
    purpose:
      'Cross-platform Python implementation of Apple\u2019s device protocols: syslog streaming, app install/launch, backups, process listing, developer services — the scriptable alternative to Xcode\u2019s device plumbing (and the Windows/Linux bridge).',
    status: 'current',
    install: 'pip install pymobiledevice3 (Python 3.9+; macOS/Linux/Windows)',
    usage: 'Scriptable device interaction: syslog live for log capture, apps install/launch, backup pulls for container analysis (module i13\u2019s store-build channel).',
    commands: [
      { cmd: 'pymobiledevice3 list-devices', desc: 'List connected devices' },
      { cmd: 'pymobiledevice3 syslog live --process com.bundle.id', desc: 'Stream device logs filtered to an app' },
      { cmd: 'pymobiledevice3 apps install TargetApp.ipa', desc: 'Install an IPA' },
      { cmd: 'pymobiledevice3 backup pull', desc: 'Backup workflows for container analysis' },
      { cmd: 'pymobiledevice3 ps', desc: 'List processes on device' },
      { cmd: 'pymobiledevice3 developer dvt launch com.bundle.id', desc: 'Launch via developer services' }
    ],
    whenToUse: [
      'Log capture without a Mac console (module i10\u2019s log channel)',
      'Store-build backup parsing (module i13)',
      'Cross-platform benches (Windows/Linux labs)'
    ],
    docsUrl: 'https://github.com/doronz88/pymobiledevice3',
    relatedLessons: ['i07-l01', 'i10-l02', 'i13-l01']
  },
  {
    id: 'libimobiledevice',
    visual: 'device',
    name: 'libimobiledevice (idevice tools)',
    category: 'Device communication',
    purpose:
      'The classic C cross-platform device protocol library: idevice_id, ideviceinstaller, idevicesyslog, idevicebackup2, iproxy (USB port forwarding — the stable-proxy channel from module i07).',
    status: 'current',
    install: 'brew install libimobiledevice (macOS) / distro packages / source build',
    usage: 'Stable CLI device workflows; iproxy specifically powers USB-mediated proxying for long capture sessions.',
    commands: [
      { cmd: 'idevice_id -l', desc: 'List connected device UDIDs' },
      { cmd: 'ideviceinstaller -i app.ipa', desc: 'Install an IPA' },
      { cmd: 'idevicesyslog', desc: 'Stream the device syslog' },
      { cmd: 'iproxy 8080 8080', desc: 'Forward a TCP port over USB (proxy stability channel)' },
      { cmd: 'idevicebackup2 backup ~/backups', desc: 'Create a device backup (container analysis input)' }
    ],
    whenToUse: [
      'USB-mediated proxying for long captures (module i07-l03)',
      'Scripted device workflows on non-macOS hosts',
      'Backup creation for module i13 channels'
    ],
    docsUrl: 'https://libimobiledevice.org/',
    relatedLessons: ['i07-l03', 'i13-l01', 'i10-l02']
  },
  {
    id: 'frida',
    visual: 'terminal',
    name: 'Frida',
    category: 'Runtime instrumentation',
    purpose:
      'The dynamic instrumentation framework: injects a JavaScript engine into target processes for hooking, tracing and manipulation — the heart of modules i11/i13/i14/i21\u2019s runtime work on iOS.',
    status: 'current',
    install: 'pip install frida-tools (client). Device side: frida-server (jailbroken labs, via package manager) or Frida Gadget embedded + re-signed (module i22). PIN VERSIONS — client/server/gadget must match.',
    usage: 'frida CLI/REPL for interactive sessions; script files for repeatable hooks; spawn mode (-f) for early-logic questions; ObjC bridge for app code, native APIs for C/Swift-only code.',
    commands: [
      { cmd: 'frida-ls-devices', desc: 'List devices Frida can reach' },
      { cmd: 'frida-ps -U', desc: 'List processes on the USB device' },
      { cmd: 'frida -U -f com.bundle.id', desc: 'Spawn suspended, instrument early, %resume' },
      { cmd: 'frida -U -n TargetApp', desc: 'Attach to a running app' },
      { cmd: 'frida -U -f com.bundle.id -l script.js', desc: 'Run an agent script at spawn' },
      { cmd: 'ObjC.classes.X.$ownMethods', desc: 'Enumerate a class\u2019s hookable methods (REPL)' },
      { cmd: 'Interceptor.attach(ObjC.classes.X["- sel:"].implementation, {...})', desc: 'The ObjC hook shape (module i11-l02)' },
      { cmd: 'Module.findExportByName(null, "CCCrypt")', desc: 'Native hook target resolution (module i11-l05)' }
    ],
    whenToUse: [
      'Runtime observation/modification across modules i11–i22',
      'System-boundary hooks (SecItem*, CCCrypt) — the chokepoint strategy',
      'Anti-analysis evaluation (module i21) and spawn-mode early logic'
    ],
    docsUrl: 'https://frida.re/docs/home/',
    relatedLessons: ['i11-l01', 'i11-l02', 'i11-l04', 'i11-l05', 'i21-l02']
  },
  {
    id: 'objection',
    visual: 'terminal',
    name: 'objection',
    category: 'Runtime instrumentation',
    purpose:
      'A Frida-based runtime exploration toolkit: one-liner commands for keychain dumps, class enumeration, pinning bypass attempts, storage exploration — the convenience layer over the hooks module i11 teaches you to write first.',
    status: 'current',
    install: 'pip install objection (pairs with your Frida version)',
    usage: 'Explore patched-up apps quickly: objection explore -s com.bundle.id; use after manual fundamentals so you understand what each command does.',
    commands: [
      { cmd: 'objection explore -s com.bundle.id', desc: 'Start an exploration session' },
      { cmd: 'ios keychain dump', desc: 'Dump accessible keychain items (lab contexts)' },
      { cmd: 'ios nsuserdefaults get', desc: 'Read UserDefaults content' },
      { cmd: 'ios hooking list classes', desc: 'Enumerate loaded classes' },
      { cmd: 'ios hooking watch method "-[X sel:]"', desc: 'Watch a method\u2019s calls' },
      { cmd: 'ios sslkeypinning disable', desc: 'Attempt pinning bypass (module i14-l03 cross-check)' }
    ],
    whenToUse: [
      'Fast runtime recon on lab targets',
      'Cross-checking your manual hook results',
      'Keychain/storage exploration on hookable builds'
    ],
    docsUrl: 'https://github.com/sensepost/objection',
    relatedLessons: ['i11-l03', 'i13-l03', 'i14-l03']
  },
  {
    id: 'burp',
    visual: 'proxy',
    name: 'Burp Suite',
    category: 'Network interception',
    purpose:
      'The interception proxy standard: captures, history, Repeater-class manipulation, and the CA infrastructure for HTTPS interception on device and simulator — the wire channel of modules i07/i14/i15.',
    status: 'current',
    install: 'portswigger.net download (Community is sufficient for this curriculum; Professional adds automation). CA install + FULL TRUST per module i07-l03\u2019s two-step.',
    usage: 'Listener on 0.0.0.0:8080; device manual proxy; capture matrix per module i14-l02; Repeater for gentle manipulation and authorized API probes.',
    commands: [
      { cmd: 'Proxy → Proxy settings → bind 0.0.0.0:8080', desc: 'Listener configuration' },
      { cmd: 'http://burp (on-device Safari)', desc: 'CA download path (proxy configured)' },
      { cmd: 'Settings → Certificate Trust Settings → enable', desc: 'The CRITICAL full-trust step (module i07-l03)' },
      { cmd: 'Repeater → edit params → Send', desc: 'Gentle manipulation and authorized API probes' },
      { cmd: 'Save state / export XML', desc: 'Evidence-grade capture export (hash it)' }
    ],
    whenToUse: [
      'All wire work: capture matrix, token analysis, API testing',
      'Per-session-stack refusal mapping (pinning evidence)',
      'The engagement\u2019s primary traffic evidence store'
    ],
    docsUrl: 'https://portswigger.net/burp/documentation',
    relatedLessons: ['i07-l03', 'i14-l02', 'i15-l03']
  },
  {
    id: 'mitmproxy',
    visual: 'proxy',
    name: 'mitmproxy',
    category: 'Network interception',
    purpose:
      'The open-source interception alternative: interactive/CLI/web UIs, scriptable traffic processing (Python addons), and mitm.it\u2019s CA distribution — functionally equivalent to Burp for this curriculum; pick one and stay consistent.',
    status: 'current',
    install: 'brew install mitmproxy (or pipx install mitmproxy); CA via mitm.it on the proxied device + full-trust step.',
    usage: 'mitmproxy (TUI), mitmweb (browser UI), mitmdump (headless/scripted) — scripted flows for repeatable capture protocols.',
    commands: [
      { cmd: 'mitmproxy --listen-port 8080', desc: 'Start the TUI proxy' },
      { cmd: 'mitmdump -w capture.flow', desc: 'Headless capture to file (evidence artifact)' },
      { cmd: 'mitmweb', desc: 'Browser-based UI' },
      { cmd: 'mitm.it (on-device)', desc: 'CA download path' }
    ],
    whenToUse: [
      'Scripted/repeatable capture protocols (mitmdump)',
      'Linux-only benches (no Burp dependency)',
      'Teams preferring open-source tooling end to end'
    ],
    docsUrl: 'https://docs.mitmproxy.org/',
    relatedLessons: ['i07-l03', 'i14-l02']
  },
  {
    id: 'ghidra',
    visual: 'disassembler',
    name: 'Ghidra',
    category: 'Reverse engineering',
    purpose:
      'The free NSA-built RE suite: disassembly, decompilation to pseudo-C, cross-referencing, scripting — this academy\u2019s RE workhorse for iOS ARM64 binaries (modules i09/i19).',
    status: 'current',
    install: 'ghidra-sre.org (current release; Java JDK required). Enable the Swift demangler analyzer for Swift binaries.',
    usage: 'Import the extracted Mach-O slice, auto-analyze, navigate via Symbol Tree + xrefs; the targeted-session discipline (i09-l03) and scripted chokepoint maps (i19-l03) are the workflows.',
    commands: [
      { cmd: 'File → Import File → (Mach-O slice)', desc: 'Import the binary' },
      { cmd: 'Analysis → Auto Analyze', desc: 'Run full analysis (enable Swift demangler for Swift)' },
      { cmd: 'Symbol Tree → filter class/symbol', desc: 'Navigate to i09-l02 targets' },
      { cmd: 'Window → Function Call Graph / References to', desc: 'Cross-reference navigation' },
      { cmd: 'Script Manager → (your chokepoint script)', desc: 'The scripted call-map (module i19-l03)' }
    ],
    whenToUse: [
      'All decompilation work (modules i09/i19)',
      'Listing verification of decompiler claims',
      'Scripted analysis at scale (chokepoint maps, constant hunts)'
    ],
    docsUrl: 'https://ghidra-sre.org/',
    relatedLessons: ['i09-l03', 'i19-l01', 'i19-l03']
  },
  {
    id: 'hopper',
    visual: 'disassembler',
    name: 'Hopper Disassembler',
    category: 'Reverse engineering',
    purpose:
      'macOS-native commercial disassembler/decompiler with an excellent Mach-O loader and pseudocode view — a strong alternative/complement to Ghidra for iOS binaries; same reading discipline transfers directly.',
    status: 'niche',
    install: 'hopperapp.com (commercial license; free trial for evaluation)',
    usage: 'Import the Mach-O; the loader renders ObjC metadata well; pseudocode view parallels Ghidra\u2019s decompiler. Session discipline identical (target list, xrefs, listing verification).',
    commands: [
      { cmd: 'File → Read Executable to Disassemble', desc: 'Import the Mach-O' },
      { cmd: 'Navigate → (symbol/label search)', desc: 'Land on i09-l02 targets' },
      { cmd: 'Xrefs (right-click → References)', desc: 'Cross-reference navigation' }
    ],
    whenToUse: [
      'macOS-native preference for Mach-O loading quality',
      'Cross-checking Ghidra conclusions with a second decompiler',
      'Teams already licensed for it'
    ],
    docsUrl: 'https://www.hopperapp.com/',
    relatedLessons: ['i09-l03', 'i19-l01']
  },
  {
    id: 'lldb',
    visual: 'debugger',
    name: 'LLDB',
    category: 'Debugging',
    purpose:
      'The LLVM debugger underneath Xcode — the stop-the-world precision instrument: breakpoints, watchpoints, backtraces, register/memory inspection, live expression evaluation (module i12).',
    status: 'current',
    install: 'Ships with Xcode / Command Line Tools.',
    usage: 'Attach to dev-signed builds (platform select ios; platform connect) or via Xcode\u2019s UI; question-driven stops per module i12\u2019s instrument-choice discipline.',
    commands: [
      { cmd: 'platform select ios; platform connect', desc: 'Attach path to a device (Xcode plumbing)' },
      { cmd: 'process attach --name TargetApp', desc: 'Attach to the running app' },
      { cmd: 'breakpoint set --name "-[X sel:]"', desc: 'Selector breakpoint' },
      { cmd: 'breakpoint set --address 0x…', desc: 'Address breakpoint (slide math per i11-l05)' },
      { cmd: 'watchpoint set variable <expr>', desc: 'Provenance questions (who writes this)' },
      { cmd: 'bt / register read x0 x1 / po self', desc: 'The inspection trio at a stop' },
      { cmd: 'memory read --size 4 --format x --count 16 $x0', desc: 'Memory inspection' }
    ],
    whenToUse: [
      'State/provenance questions (module i12-l02\u2019s choice table)',
      'Frozen-instant object inspection (po at decision points)',
      'Watchpoint-driven flag provenance (module i21 leads)'
    ],
    docsUrl: 'https://lldb.llvm.org/',
    relatedLessons: ['i12-l01', 'i12-l02', 'i19-l01']
  },
  {
    id: 'codesign',
    visual: 'terminal',
    name: 'codesign',
    category: 'Signing / inspection',
    purpose:
      'Apple\u2019s code signing tool: reads signatures (details, entitlements, authority chains), verifies validity, and re-signs — the primary instrument of modules i06/i22\u2019s signing work.',
    status: 'current',
    install: 'macOS built-in (part of the system).',
    usage: 'Inspection first (-dv, -d --entitlements, --verify), then the re-signing workflow (--force --sign with entitlements preserved).',
    commands: [
      { cmd: 'codesign -dv --verbose=4 <binary>', desc: 'Signature details (authority, flags, team)' },
      { cmd: 'codesign -d --entitlements :- <binary>', desc: 'Dump the entitlements blob' },
      { cmd: 'codesign --verify --verbose <bundle>', desc: 'Verify the bundle\u2019s signatures' },
      { cmd: 'codesign --force --sign "identity" --entitlements ents.plist <bundle>', desc: 'Re-sign with preserved entitlements (module i22)' }
    ],
    whenToUse: [
      'Signature/provenance inspection (module i06\u2019s contradiction detector)',
      'Entitlement dumps for the i06-l03 report',
      'The re-signing workflow\u2019s signing steps'
    ],
    docsUrl: 'https://www.unix.com/man-page/osx/1/codesign/',
    relatedLessons: ['i06-l01', 'i06-l02', 'i06-l03', 'i22-l01']
  },
  {
    id: 'ldid',
    visual: 'terminal',
    name: 'ldid',
    category: 'Signing / inspection',
    purpose:
      'The community pseudo-signer: signs binaries without Apple identities (ad-hoc signatures), preserves/edits entitlements (-S), and powers gadget/patch workflows where full codesign identities are impractical.',
    status: 'current',
    install: 'brew install ldid (or the ProcursusTeam build for other platforms)',
    usage: 'ldid -S<entitlements.plist> <binary> signs with declared entitlements; the standard companion of Frida Gadget embedding (module i11/i22).',
    commands: [
      { cmd: 'ldid -S <binary>', desc: 'Ad-hoc sign (no entitlements)' },
      { cmd: 'ldid -Sents.plist <binary>', desc: 'Sign with an entitlements plist' },
      { cmd: 'ldid -e <binary>', desc: 'Dump embedded entitlements (inspection)' }
    ],
    whenToUse: [
      'Gadget embedding workflows (module i11-l01/i22-l01)',
      'Non-App-Store lab signing without paid identities',
      'Entitlement preservation in patch workflows'
    ],
    docsUrl: 'https://github.com/ProcursusTeam/ldid',
    relatedLessons: ['i11-l01', 'i22-l01']
  },
  {
    id: 'otool-nm-strings',
    visual: 'terminal',
    name: 'otool / nm / strings',
    category: 'Binary inspection',
    purpose:
      'The Mach-O inspection trio (macOS built-ins): otool reads headers/load commands/ObjC metadata, nm reads symbol tables, strings mines literals — the module i08/i09 sweep engines.',
    status: 'current',
    install: 'macOS built-in (Xcode/CLT). Cross-platform: rizin/llvm-objdump cover the gaps.',
    usage: 'The structured sweep (i08-l02) and Mach-O profiling (i09-l01) run on these; outputs are evidence artifacts.',
    commands: [
      { cmd: 'file <binary>', desc: 'Slice/architecture identification' },
      { cmd: 'otool -h <binary>', desc: 'Mach header (magic, cpu type)' },
      { cmd: 'otool -l <binary>', desc: 'Load commands (segments, dylibs, signature)' },
      { cmd: 'otool -L <binary>', desc: 'Linked libraries (the dependency X-ray)' },
      { cmd: 'otool -oV <binary>', desc: 'ObjC metadata dump (classes, methods, imps)' },
      { cmd: 'nm -gU <binary> / nm -u <binary>', desc: 'Exported / undefined (imported) symbols' },
      { cmd: 'strings -a -arch all <binary>', desc: 'Literals extraction (the sweep\u2019s engine)' },
      { cmd: 'lipo -thin arm64 <binary> -o <out>', desc: 'Extract a slice from fat binaries' }
    ],
    whenToUse: [
      'Every static sweep and Mach-O profile (modules i08/i09)',
      'Import-surface reading (nm -u) for hook-target prediction',
      'ObjC metadata recovery (otool -oV) feeding the target list'
    ],
    docsUrl: 'https://www.unix.com/man-page/osx/1/otool/',
    relatedLessons: ['i08-l02', 'i09-l01', 'i09-l02']
  },
  {
    id: 'plutil',
    visual: 'terminal',
    name: 'plutil',
    category: 'Property lists',
    purpose:
      'The plist workhorse: decode binary plists to readable form (-p), convert formats, lint — Info.plist, extension plists, container preferences, and provisioning profiles (post-CMS-decode) all flow through it.',
    status: 'current',
    install: 'macOS built-in. Cross-platform: Python plistlib.',
    usage: 'plutil -p <file> to print; -convert xml1 to transform; the module i04/i13 reading tool of record.',
    commands: [
      { cmd: 'plutil -p Info.plist', desc: 'Print any plist readably' },
      { cmd: 'plutil -convert xml1 file.plist', desc: 'Convert binary→XML for diffing' },
      { cmd: 'security cms -D -i embedded.mobileprovision | plutil -p', desc: 'The profile decode pipeline (module i06-l02)' }
    ],
    whenToUse: [
      'Info.plist transcription (module i04-l02)',
      'Container plist reading (module i13)',
      'Provisioning profile decoding (module i06)'
    ],
    docsUrl: 'https://www.unix.com/man-page/osx/1/plutil/',
    relatedLessons: ['i04-l02', 'i06-l02', 'i13-l02']
  },
  {
    id: 'class-dump-tools',
    visual: 'terminal',
    name: 'class-dump family (dsdump)',
    category: 'Binary inspection',
    purpose:
      'ObjC metadata recovery tools: reconstruct class headers (classes, methods, properties, imps) from binaries — the structured surface dump behind module i09-l02\u2019s target lists. Tooling churns; verify current maintenance before adopting.',
    status: 'niche',
    install: 'Community releases (dsdump and class-dump successors) — build from source typically; verify against your macOS/toolchain versions.',
    usage: 'Structured class dumps complement otool -oV: readable headers with imp addresses — the join keys for decompilers and Frida.',
    commands: [
      { cmd: 'dsdump --objc <binary>', desc: 'Structured ObjC class dump' },
      { cmd: 'class-dump <binary> > classes.h', desc: 'Header-style dump (classic form)' }
    ],
    whenToUse: [
      'Target-list construction (module i09-l02)',
      'Runtime-side cross-checks against Frida enumeration',
      'Historical/legacy binary analysis where selectors dominate'
    ],
    docsUrl: 'https://github.com/nicklockwood/dsdump',
    relatedLessons: ['i09-l02', 'i11-l03']
  },
  {
    id: 'rizin',
    visual: 'disassembler',
    name: 'rizin / radare2',
    category: 'Reverse engineering',
    purpose:
      'Cross-platform CLI RE frameworks: disassembly, analysis, scripting, and binary inspection on non-macOS benches — the portable complement to Ghidra (and the only option in some lab setups).',
    status: 'current',
    install: 'brew install rizin / distro packages / source (rizinorg/rizin)',
    usage: 'rizin <binary> for interactive analysis; aaa (analyze), pdf (disassemble function), axt (xrefs); scripting for the recurring sweeps on non-macOS hosts.',
    commands: [
      { cmd: 'rizin -A <binary>', desc: 'Open and analyze' },
      { cmd: 'pdf @ <symbol>', desc: 'Disassemble a function' },
      { cmd: 'axt @ <symbol>', desc: 'Cross-references to a symbol' },
      { cmd: 'izz~pattern', desc: 'Strings search (sweep support)' }
    ],
    whenToUse: [
      'Non-macOS benches (Linux/Windows RE workflows)',
      'Quick CLI verification without a GUI session',
      'Scripted binary analysis at scale'
    ],
    docsUrl: 'https://github.com/rizinorg/rizin',
    relatedLessons: ['i08-l02', 'i09-l01', 'i19-l03']
  }
];
