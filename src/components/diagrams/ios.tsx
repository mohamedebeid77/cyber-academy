import React, { useState } from 'react';
import type { DProps } from './shared';
import { Frame, Box, Arrow, Defs, Footnote, MONO } from './shared';

// iOS Application Pentesting Academy — core diagrams (platform, package, security model).
// All visuals drawn from scratch. Colors follow the shared academy visual language.

const VIOLET = '#a78bfa';
const ICE = '#cfe0f5';
const SKY = '#38bdf8';
const ACID = '#22e58c';
const WARN = '#fbbf24';
const RED = '#f87171';

// ---------------------------------------------------------------------------
// 1. iOS platform stack (interactive) — hardware → boot → kernel → services → app → sandbox
// ---------------------------------------------------------------------------

const IOS_STACK_LAYERS = [
  {
    id: 'apps',
    name: 'Third-Party Apps',
    items: 'your target · signed with a provisioning profile · sandboxed process',
    detail: 'The layer you are paid to test. Every third-party app is a signed, sandboxed process with its own data container. Nothing here can directly touch another app\u2019s data or the kernel — which is exactly why testers focus on the app\u2019s own code, its data at rest and its network traffic.'
  },
  {
    id: 'frameworks',
    name: 'Cocoa Touch / System Frameworks',
    items: 'UIKit · SwiftUI · Foundation · Security · CryptoKit · WebKit',
    detail: 'The Objective-C/Swift API surface apps call into. Hooks you write with Frida attach here (e.g. on URLSession data tasks or SecItemCopyMatching). Misconfiguration in framework use — ATS exceptions, weak keychain classes — becomes exploitable at this boundary.'
  },
  {
    id: 'services',
    name: 'System Services (daemons)',
    items: 'SpringBoard · AMFI · securityd · TrustCache · XPC services',
    detail: 'Long-running daemons implement the real security decisions: AMFI validates code signatures and entitlements, securityd brokers keychain access, SpringBoard launches apps. These processes live outside your sandbox and are not your test target — but they enforce the walls around it.'
  },
  {
    id: 'kernel',
    name: 'XNU Kernel (Darwin)',
    items: 'Mach IPC · BSD · I/O Kit · mandatory access control (Sandbox/AMFI hooks)',
    detail: 'XNU is the Mach + BSD hybrid kernel. Mach ports carry IPC, BSD provides the POSIX view, and kernel extensions for Sandbox/AMFI enforce mandatory access control over every syscall. Code signing enforcement is a kernel behavior — unsigned code cannot execute, period.'
  },
  {
    id: 'secure',
    name: 'Secure Hardware & Boot',
    items: 'Secure Enclave · Boot ROM (immutable) · hardware keys (UID/GID) · AES engine',
    detail: 'The root of trust. Boot ROM burns the Apple Root CA public key in silicon; the Secure Enclave is a separate processor with its own kernel that handles keys and biometrics. Filesystem encryption keys are wrapped with hardware-derived keys — this is why brute-forcing data off a stolen iPhone is so hard, and why your lab testing runs through Apple-controlled channels.'
  }
];

function IOSPlatformStack({ interactive }: DProps) {
  const [sel, setSel] = useState<string | null>(null);
  const selLayer = IOS_STACK_LAYERS.find((l) => l.id === sel);
  const colors = [ACID, SKY, VIOLET, WARN, RED];
  return (
    <>
      <Frame vb="0 0 920 330" h="320px">
        <Defs />
        {IOS_STACK_LAYERS.map((l, i) => (
          <g key={l.id}>
            <rect
              x={60 + i * 14}
              y={18 + i * 60}
              width={800 - i * 28}
              height={50}
              rx={8}
              fill={colors[i] + '14'}
              stroke={colors[i]}
              strokeWidth={sel === l.id ? 2.5 : 1}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
              onClick={interactive ? () => setSel(sel === l.id ? null : l.id) : undefined}
            />
            <text x={90 + i * 14} y={40 + i * 60} fill="#e6edf3" fontSize={13} fontFamily={MONO} fontWeight={700}>
              {l.name}
            </text>
            <text x={90 + i * 14} y={57 + i * 60} fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
              {l.items}
            </text>
          </g>
        ))}
        <text x={18} y={175} fill="#5b6b7f" fontSize={10} fontFamily={MONO} transform="rotate(-90 18 175)" textAnchor="middle">
          USER SPACE
        </text>
        <text x={18} y={300} fill="#5b6b7f" fontSize={10} fontFamily={MONO} transform="rotate(-90 18 300)" textAnchor="middle">
          HARDWARE / KERNEL
        </text>
      </Frame>
      {interactive && selLayer && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">{selLayer.name}</span>
          <p className="mt-1">{selLayer.detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 2. Secure boot chain
// ---------------------------------------------------------------------------

function IOSSecureBoot() {
  const steps = [
    { n: 'Boot ROM', s: 'burned in silicon · trusts only Apple', c: RED },
    { n: 'iBoot (bootloader)', s: 'signature-checked by Boot ROM', c: WARN },
    { n: 'XNU kernel', s: 'signature-checked by iBoot', c: VIOLET },
    { n: 'launchd / system', s: 'kernel enforces signatures', c: SKY },
    { n: 'your app', s: 'AMFI validates signature + entitlements', c: ACID }
  ];
  return (
    <Frame vb="0 0 920 240" h="230px">
      <Defs />
      {steps.map((s, i) => (
        <g key={s.n}>
          <Box x={40 + i * 172} y={60} w={150} h={64} label={s.n} sub={s.s} stroke={s.c} fill={s.c + '0d'} small />
          {i < steps.length - 1 && <Arrow x1={190 + i * 172} y1={92} x2={212 + i * 172} y2={92} label="verifies" />}
        </g>
      ))}
      <Footnote y={190}>
        every link verifies the next: Apple Root CA public key is fused into silicon — nothing unsigned ever executes
      </Footnote>
      <Footnote y={212}>
        tester takeaway: modifying any system component or app binary breaks the chain — patching an app means re-signing it
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 3. Android vs iOS conceptual comparison
// ---------------------------------------------------------------------------

const VS_ROWS: [string, string, string][] = [
  ['Kernel', 'Linux (LTS, heavily modified)', 'XNU (Mach + BSD, Apple-built)'],
  ['App format', 'APK (ZIP, AndroidManifest.xml, DEX)', 'IPA (ZIP, Info.plist, Mach-O)'],
  ['Code execution', 'DEX/ART bytecode + native .so (JNI)', 'Native AOT-compiled Mach-O only'],
  ['Install source', 'Sideload any APK, many stores', 'App Store / TestFlight / signed dev builds'],
  ['Signature model', 'Self-signed certs, no chain required', 'Apple-issued certs + provisioning profile'],
  ['Sandbox', 'UID-per-app + SELinux policies', 'Seatbelt profiles + entitlements'],
  ['Crypto keystore', 'Android Keystore (TEE/StrongBox)', 'Keychain + Secure Enclave'],
  ['Dynamic testing', 'frida-server via root/adb — easy', 'Jailbreak device or Frida gadget re-sign'],
  ['Build env', 'Any OS (adb, Gradle)', 'macOS + Xcode for most workflows'],
  ['Source visibility', 'JADX decompiles DEX to readable Java', 'Native ARM64 — disassembly/decompiler work']
];

function IOSvsAndroid() {
  return (
    <Frame vb="0 0 920 560" h="540px">
      <Defs />
      <text x={240} y={40} textAnchor="middle" fill={ACID} fontSize={15} fontFamily={MONO} fontWeight={700}>
        ANDROID
      </text>
      <text x={680} y={40} textAnchor="middle" fill={SKY} fontSize={15} fontFamily={MONO} fontWeight={700}>
        iOS
      </text>
      {VS_ROWS.map(([k, a, b], i) => {
        const y = 60 + i * 48;
        return (
          <g key={k}>
            <rect x={40} y={y} width={840} height={40} rx={6} fill={i % 2 === 0 ? 'rgba(11,18,32,0.6)' : 'rgba(11,18,32,0.25)'} stroke="#1b2740" strokeWidth={0.6} />
            <text x={56} y={y + 25} fill="#5b6b7f" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
              {k}
            </text>
            <text x={170} y={y + 25} fill="#c3cdd9" fontSize={10.5} fontFamily={MONO}>
              {a}
            </text>
            <text x={540} y={y + 25} fill="#c3cdd9" fontSize={10.5} fontFamily={MONO}>
              {b}
            </text>
            <line x1={528} y1={y + 6} x2={528} y2={y + 34} stroke="#1b2740" strokeWidth={0.8} />
          </g>
        );
      })}
      <Footnote y={550}>
        conceptual only — the Android academy and this academy stay fully separate; this table exists to orient testers switching platforms
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 4. App lifecycle (scene states)
// ---------------------------------------------------------------------------

function IOSAppLifecycle() {
  const states = [
    { id: 'Not Running', x: 60, note: 'cold start / killed' },
    { id: 'Foreground\nInactive', x: 270, note: 'transition · incoming call' },
    { id: 'Foreground\nActive', x: 490, note: 'on screen · receiving events' },
    { id: 'Background', x: 710, note: 'brief grace · suspended' }
  ];
  return (
    <Frame vb="0 0 920 280" h="260px">
      <Defs />
      {states.map((s, i) => (
        <g key={s.id}>
          <Box x={s.x} y={50} w={150} h={52} label={s.id.replace('\n', ' ')} sub={s.note} stroke={i === 2 ? ACID : SKY} fill={(i === 2 ? ACID : SKY) + '0a'} small />
          {i < states.length - 1 && <Arrow x1={s.x + 150} y1={76} x2={states[i + 1].x} y2={76} />}
        </g>
      ))}
      <Box x={490} y={160} w={170} h={48} label="Suspended" sub="frozen in RAM · not executing" stroke={WARN} fill={WARN + '0a'} small />
      <Arrow x1={785} y1={102} x2={640} y2={160} label="system suspends" color={WARN} />
      <Arrow x1={490} y1={184} x2={320} y2={102} label="relaunch / resume" color={ACID} dashed />
      <Arrow x1={660} y1={160} x2={770} y2={104} label="resume" color={ACID} dashed />
      <Box x={130} y={160} w={140} h={48} label="Terminated" sub="killed · wipe state risk" stroke={RED} fill={RED + '0a'} small />
      <Arrow x1={575} y1={208} x2={272} y2={196} label="memory pressure / user swipe" color={RED} />
      <Footnote y={258}>
        penetration relevance: state transitions decide when data is written, cached or wiped — test persistence across background/kill cycles
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 5. XNU processes, Mach IPC and the sandbox
// ---------------------------------------------------------------------------

function IOSIpcSandbox() {
  return (
    <Frame vb="0 0 920 330" h="320px">
      <Defs />
      <Box x={50} y={50} w={230} h={110} label="App A" sub="sandbox: no network, no camera" stroke={ACID} fill={ACID + '08'} />
      <Box x={50} y={200} w={230} h={110} label="App B" sub="sandbox: own container only" stroke={ACID} fill={ACID + '08'} />
      <Box x={640} y={50} w={230} h={110} label="System daemon" sub="XPC service · entitlement required" stroke={SKY} fill={SKY + '08'} />
      <Box x={640} y={200} w={230} h={110} label="XNU kernel" sub="Mach ports · MAC enforcement" stroke={WARN} fill={WARN + '08'} />
      <Arrow x1={280} y1={90} x2={640} y2={90} label="XPC / Mach message" />
      <Arrow x1={640} y1={140} x2={280} y2={140} label="reply (if policy allows)" dashed color={ACID} />
      <Arrow x1={280} y1={255} x2={640} y2={255} label="syscall → MAC check" color={WARN} />
      <rect x={330} y={110} width={260} height={120} rx={10} fill="rgba(167,139,250,0.06)" stroke={VIOLET} strokeDasharray="5 4" />
      <text x={460} y={140} textAnchor="middle" fill={VIOLET} fontSize={12} fontFamily={MONO} fontWeight={700}>
        Seatbelt sandbox
      </text>
      <text x={460} y={165} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        profile denies by default;
      </text>
      <text x={460} y={183} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        entitlements widen access
      </text>
      <text x={460} y={205} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        (containers, keychain groups)
      </text>
      <Footnote y={330 - 8}>
        apps never talk directly: every cross-boundary call passes Mach IPC the kernel can filter — app-to-app data leaks need an app bug, not an OS one
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 6. IPA anatomy (interactive)
// ---------------------------------------------------------------------------

const IPA_PARTS = [
  { path: 'Payload/', detail: 'The single mandatory directory. Everything else in an IPA is packaging metadata — some distributions also ship SwiftSupport/ for Swift runtime symbols.' },
  { path: 'Payload/Target.app/', detail: 'The .app bundle: a read-only directory containing the executable, Info.plist, resources and signatures. On the device it is installed read-only inside the app container.' },
  { path: 'Target.app/Target', detail: 'The main Mach-O executable — your reverse engineering target. Fat binaries contain one slice per architecture (arm64, and simulator slices x86_64/arm64-sim).' },
  { path: 'Target.app/Info.plist', detail: 'Compiled binary property list: bundle id, version, permissions strings, URL schemes, ATS exceptions, background modes. Decode with plutil -p.' },
  { path: 'Target.app/_CodeSignature/', detail: 'CodeResources: hashes of every bundled resource. The Mach-O signature itself lives in the binary; resources are covered by this manifest.' },
  { path: 'Target.app/embedded.mobileprovision', detail: 'The provisioning profile: developer team, entitlements granted, device UDIDs (dev builds), expiry. Read it to learn what the app is allowed to do before you even run it.' },
  { path: 'Target.app/Frameworks/', detail: 'Embedded dynamic frameworks and dylibs the app ships. Each is signed; each is a separate reverse engineering target and a common place for security logic (pinning, DRM).' },
  { path: 'Target.app/Assets.car', detail: 'Compiled asset catalog. Images can leak product names, stages and environment hints — extract with acextract or assetutil.' },
  { path: 'Target.app/*.lproj', detail: 'Localization folders. en.lproj/Localizable.strings often reveals feature flags, error paths and internal names.' },
  { path: 'Target.app/*.plist / *.json', detail: 'Configuration files the app ships: endpoints, feature flags, sometimes credentials. Grep them — hardcoded environment URLs and keys are a classic finding.' }
];

function IOSIpaAnatomy({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 430" h="420px">
        <Defs />
        <rect x={40} y={20} width={360} height={390} rx={10} fill="rgba(214,226,240,0.05)" stroke={ICE} strokeDasharray="6 4" />
        <text x={220} y={45} textAnchor="middle" fill={ICE} fontSize={13} fontFamily={MONO} fontWeight={700}>
          Application.ipa  (ZIP archive)
        </text>
        {IPA_PARTS.map((p, i) => (
          <g key={p.path} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={60} y={58 + i * 34} width={320} height={27} rx={5} fill={sel === i ? 'rgba(34,229,140,0.16)' : 'rgba(11,18,32,0.85)'} stroke={sel === i ? ACID : '#1b2740'} />
            <text x={76} y={76 + i * 34} fill={sel === i ? ACID : '#c3cdd9'} fontSize={11} fontFamily={MONO}>
              {p.path}
            </text>
          </g>
        ))}
        <Arrow x1={415} y1={200} x2={470} y2={200} label="unzip / inspect" />
        <rect x={480} y={20} width={400} height={390} rx={10} fill="rgba(34,229,140,0.04)" stroke="#1b2740" />
        <text x={500} y={48} fill={ACID} fontSize={12} fontFamily={MONO} fontWeight={700}>
          {sel !== null ? IPA_PARTS[sel].path : 'select an entry →'}
        </text>
        {IPA_PARTS[sel ?? -1] && (
          <foreignObject x={500} y={60} width={360} height={330}>
            <div style={{ color: '#8b98a9', fontSize: 12.5, lineHeight: 1.55, fontFamily: 'Inter, Segoe UI, sans-serif' }}>
              {IPA_PARTS[sel as number].detail}
            </div>
          </foreignObject>
        )}
      </Frame>
      {interactive && <div className="mb-2 text-center font-mono text-[11px] text-dim">click any IPA entry to inspect it</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// 7. Bundle vs data container
// ---------------------------------------------------------------------------

function IOSBundleContainer() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Box x={40} y={40} w={280} h={200} label="Bundle container (.app)" sub="read-only · signed · shipped" stroke={ICE} fill={ICE + '08'} />
      <text x={180} y={90} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        executable · Info.plist
      </text>
      <text x={180} y={110} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        resources · Frameworks/
      </text>
      <text x={180} y={130} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        _CodeSignature/
      </text>
      <text x={180} y={160} textAnchor="middle" fill={WARN} fontSize={10} fontFamily={MONO}>
        tampering = broken signature
      </text>
      <Box x={600} y={40} w={280} h={200} label="Data container" sub="read-write · per-app · unsigned" stroke={ACID} fill={ACID + '08'} />
      <text x={740} y={90} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        Documents/ · Library/ · tmp/
      </text>
      <text x={740} y={110} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        Library/Preferences/*.plist
      </text>
      <text x={740} y={130} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        Library/Caches/ · Cookies
      </text>
      <text x={740} y={160} textAnchor="middle" fill={WARN} fontSize={10} fontFamily={MONO}>
        where sensitive data hides
      </text>
      <Arrow x1={320} y1={140} x2={600} y2={140} label="reads at runtime" />
      <Footnote y={280}>
        the bundle is what you analyze statically; the data container is what you harvest dynamically — most storage findings live on the right
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 8. Security boundaries (interactive)
// ---------------------------------------------------------------------------

const BOUNDARIES = [
  {
    id: 'platform',
    title: '1 · Platform security (Apple)',
    color: RED,
    body: 'Secure boot, code signing, sandbox, Secure Enclave. Not yours to test — and practically never the finding. Your job is understanding it well enough to know what an attacker (and a tester) cannot do, so you can prove the app\u2019s own mistakes are the problem.'
  },
  {
    id: 'app',
    title: '2 · App security (the code)',
    color: ACID,
    body: 'The app\u2019s logic, storage decisions, crypto, network handling, WebView and deep link code. This is where 90% of mobile findings live: plaintext tokens, weak pinning, insecure bridges. Your primary assessment surface.'
  },
  {
    id: 'config',
    title: '3 · Developer configuration',
    color: WARN,
    body: 'Info.plist flags, ATS exceptions, entitlements, keychain accessibility choices, provisioning. A misconfigured ATS exception or an over-broad keychain sharing group is a real finding — the developer chose it, Apple merely allowed it.'
  },
  {
    id: 'privacy',
    title: '4 · User privacy (TCC)',
    color: SKY,
    body: 'The permission prompt layer: camera, location, contacts. Testing checks that permission-gated data is handled according to policy and minimized — and that the app does not quietly route protected data into unprotected storage.'
  },
  {
    id: 'tester',
    title: '5 · Tester assumptions',
    color: VIOLET,
    body: 'What you may assume on an authorized engagement: control of your own test device, a legitimate IPA copy, authorization for traffic interception and for attacking only the target app and its backend. State these in scope — never assume them for someone else\u2019s device or account.'
  }
];

function IOSSecurityBoundaries({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  const colors = [RED, ACID, WARN, SKY, VIOLET];
  return (
    <>
      <Frame vb="0 0 920 300" h="290px">
        <Defs />
        {BOUNDARIES.map((b, i) => (
          <g key={b.id} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={60 + i * 165} y={50} width={150} height={150} rx={10} fill={b.color + '10'} stroke={sel === i ? b.color : b.color + '70'} strokeWidth={sel === i ? 2.5 : 1.2} />
            <text x={135 + i * 165} y={135} textAnchor="middle" fill={b.color} fontSize={26} fontFamily={MONO} fontWeight={700}>
              {i + 1}
            </text>
            <text x={135 + i * 165} y={165} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
              {b.title.slice(4)}
            </text>
          </g>
        ))}
        <Footnote y={240}>nested zones of responsibility — findings live in zones 2 and 3, not in Apple\u2019s platform</Footnote>
        <Footnote y={262}>separating these keeps reports accurate: "the OS enforced X; the app opted out of it" is the shape of a good finding</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border p-3 text-sm text-muted animate-fade-in" style={{ borderColor: colors[sel] + '55', background: colors[sel] + '0d' }}>
          <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: colors[sel] }}>
            {BOUNDARIES[sel].title}
          </span>
          <p className="mt-1">{BOUNDARIES[sel].body}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 9. Code signing chain
// ---------------------------------------------------------------------------

function IOSCodesignChain() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={40} y={40} w={190} h={80} label="Apple Root CA" sub="public key in Boot ROM" stroke={RED} fill={RED + '0a'} />
      <Arrow x1={230} y1={80} x2={290} y2={80} label="issues" />
      <Box x={290} y={40} w={190} h={80} label="WWDR intermediate" sub="downloaded to device" stroke={WARN} fill={WARN + '0a'} />
      <Arrow x1={480} y1={80} x2={540} y2={80} label="issues" />
      <Box x={540} y={40} w={190} h={80} label="Developer identity" sub=" signing cert in keychain" stroke={SKY} fill={SKY + '0a'} />
      <Arrow x1={635} y1={120} x2={635} y2={160} label="signs (codesign)" />
      <Box x={480} y={160} w={310} h={70} label="App signature" sub="hashes + entitlements blob + CMS" stroke={ACID} fill={ACID + '0a'} />
      <Arrow x1={480} y1={195} x2={420} y2={195} label="validated at install/launch" />
      <Box x={120} y={160} w={300} h={70} label="AMFI + kernel" sub="refuse unsigned/invalid code" stroke={VIOLET} fill={VIOLET + '0a'} />
      <Arrow x1={270} y1={230} x2={270} y2={260} />
      <Box x={120} y={260} w={300} h={44} label="App runs" stroke={ACID} fill={ACID + '08'} small />
      <text x={770} y={280} textAnchor="middle" fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        tester note: patch anything → hashes break →
      </text>
      <text x={770} y={297} textAnchor="middle" fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        re-sign (ldid / codesign) before install
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 10. Entitlement → provisioning flow
// ---------------------------------------------------------------------------

function IOSEntitlementFlow() {
  return (
    <Frame vb="0 0 920 330" h="320px">
      <Defs />
      <Box x={40} y={40} w={250} h={90} label="App capabilities" sub="Xcode: what it asks for" stroke={SKY} fill={SKY + '0a'} small />
      <Box x={340} y={40} w={250} h={90} label="Provisioning profile" sub="Apple: what it is granted" stroke={WARN} fill={WARN + '0a'} small />
      <Box x={640} y={40} w={230} h={90} label="embedded entitlements" sub="inside the signature blob" stroke={ACID} fill={ACID + '0a'} small />
      <Arrow x1={290} y1={85} x2={340} y2={85} label="team + bundle id" />
      <Arrow x1={590} y1={85} x2={640} y2={85} label="baked in at sign time" />
      <Box x={340} y={190} w={250} h={80} label="AMFI at launch" sub="entitlements == profile?" stroke={VIOLET} fill={VIOLET + '0a'} small />
      <Arrow x1={755} y1={130} x2={560} y2={190} label="read" color={VIOLET} />
      <Box x={40} y={190} w={230} h={80} label="Kernel sandbox" sub="entitlement gates APIs" stroke={RED} fill={RED + '0a'} small />
      <Arrow x1={340} y1={230} x2={270} y2={230} label="grants / denies" color={RED} />
      <text x={460} y={310} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        pentester: dump entitlements first — get-task-allow tells you if debugging is possible without jailbreak
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 11. Testing environments comparison
// ---------------------------------------------------------------------------

const ENV_COLS = [
  {
    name: 'Simulator',
    color: SKY,
    rows: ['macOS app, not iOS', 'x86_64 / arm64-sim slices', 'no App Store signing', 'file system wide open', 'no Secure Enclave', 'good: static triage, UI tests'],
    verdict: 'fast triage — never proof'
  },
  {
    name: 'Physical device',
    color: ACID,
    rows: ['real iOS, real sandbox', 'arm64 device slice', 'signed dev/test build', 'container via Xcode/Finder', ' Secure Enclave + TCC real', 'good: realistic dynamic testing'],
    verdict: 'the standard target'
  },
  {
    name: 'Jailbroken device',
    color: WARN,
    rows: ['weakened code signing', 'root SSH + full FS', 'frida-server, tweaks', 'runtime inspection of any app', 'old iOS = stale app targets', 'good: deep runtime analysis'],
    verdict: 'powerful — strictly lab-use'
  },
  {
    name: 'Cloud/research VMs',
    color: VIOLET,
    rows: ['virtualized iOS research', 'corellium-style platforms', 'licensed, authorized use', 'kernel-level introspection', 'not consumer hardware', 'good: scalable automation'],
    verdict: 'licensed labs only'
  }
];

function IOSTestEnvironments() {
  return (
    <Frame vb="0 0 920 430" h="420px">
      <Defs />
      {ENV_COLS.map((c, i) => (
        <g key={c.name}>
          <rect x={40 + i * 218} y={40} width={200} height={330} rx={10} fill={c.color + '08'} stroke={c.color + '90'} />
          <text x={140 + i * 218} y={70} textAnchor="middle" fill={c.color} fontSize={13} fontFamily={MONO} fontWeight={700}>
            {c.name}
          </text>
          {c.rows.map((r, j) => (
            <text key={j} x={52 + i * 218} y={100 + j * 34} fill="#c3cdd9" fontSize={9.5} fontFamily={MONO}>
              · {r}
            </text>
          ))}
          <rect x={52 + i * 218} y={320} width={176} height={36} rx={6} fill={c.color + '15'} />
          <text x={140 + i * 218} y={342} textAnchor="middle" fill={c.color} fontSize={9.5} fontFamily={MONO} fontWeight={700}>
            {c.verdict}
          </text>
        </g>
      ))}
      <Footnote y={405}>an iOS Simulator is NOT an iPhone — behaviors, Keychain, Secure Enclave and TCC differ; report device findings from a device</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const IOS_DIAGRAMS_CORE: Partial<Record<string, React.FC<DProps>>> = {
  'ios-platform-stack': IOSPlatformStack,
  'ios-secure-boot': IOSSecureBoot,
  'ios-vs-android': IOSvsAndroid,
  'ios-app-lifecycle': IOSAppLifecycle,
  'ios-ipc-sandbox': IOSIpcSandbox,
  'ios-ipa-anatomy': IOSIpaAnatomy,
  'ios-bundle-container': IOSBundleContainer,
  'ios-security-boundaries': IOSSecurityBoundaries,
  'ios-codesign-chain': IOSCodesignChain,
  'ios-entitlement-flow': IOSEntitlementFlow,
  'ios-test-environments': IOSTestEnvironments
};
