import React, { useState } from 'react';
import type { DiagramId } from '../../types';
import { classNames } from '../../utils/format';
import { NETWORK_DIAGRAMS_CORE } from './network';
import { NETWORK_DIAGRAMS_A } from './networkDiagrams1';
import { NETWORK_DIAGRAMS_B } from './networkDiagrams2';
import { IOS_DIAGRAMS_CORE } from './ios';
import { IOS_DIAGRAMS_A } from './ios2';
import { IOS_DIAGRAMS_B } from './ios3';

// Original SVG diagrams for the academy. All visuals are drawn from scratch.

const MONO = 'JetBrains Mono, Cascadia Code, Consolas, monospace';

interface DProps {
  interactive?: boolean;
}

function Frame({ children, vb = '0 0 920 400', h }: { children: React.ReactNode; vb?: string; h?: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-line bg-[#050b14] p-3">
      <svg viewBox={vb} className="mx-auto block w-full min-w-[640px]" style={{ maxHeight: h }}>
        {children}
      </svg>
    </div>
  );
}

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  stroke = '#22e58c',
  fill = 'rgba(34,229,140,0.06)',
  onClick,
  active,
  small
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  stroke?: string;
  fill?: string;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
}) {
  const clickable = !!onClick;
  return (
    <g
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      opacity={active === false ? 0.45 : 1}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fill}
        stroke={active ? stroke : stroke}
        strokeWidth={active ? 2.5 : clickable ? 1.5 : 1}
        opacity={0.9}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle"
        fill="#e6edf3"
        fontSize={small ? 11 : 13}
        fontFamily={MONO}
        fontWeight={600}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, color = '#38bdf8', dashed }: { x1: number; y1: number; x2: number; y2: number; label?: string; color?: string; dashed?: boolean }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1.5} markerEnd="url(#arrowHead)" strokeDasharray={dashed ? '5 4' : undefined} />
      {label && (
        <text x={mx} y={my - 6} textAnchor="middle" fill={color} fontSize={10} fontFamily={MONO}>
          {label}
        </text>
      )}
    </g>
  );
}

const Defs = () => (
  <defs>
    <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#38bdf8" />
    </marker>
  </defs>
);

// ---------------------------------------------------------------------------
// 1. Android architecture (interactive)
// ---------------------------------------------------------------------------

const ARCH_LAYERS = [
  {
    id: 'apps',
    name: 'System Apps & Your Apps',
    items: 'Dialer · Settings · Browser · third-party APKs',
    detail: 'The top layer where all app code lives. Each app runs as its own Linux user (UID) in its own process forked from Zygote. This is what you test: its code, its data, its components.'
  },
  {
    id: 'framework',
    name: 'Java API Framework',
    items: 'ActivityManager · PackageManager · WindowManager · Content Providers · View System',
    detail: 'System services that manage app lifecycle, permissions, windows and IPC. Component abuse vulnerabilities (exported activities, providers, PendingIntents) live at this boundary.'
  },
  {
    id: 'runtime',
    name: 'Android Runtime (ART) & Native Libraries',
    items: 'DEX bytecode · AOT/JIT · libc · OpenGL · SQLite · SSL',
    detail: 'Executes your DEX bytecode (and native code). Runtime knowledge powers decompilation (JADX/Smali) and instrumentation (Frida hooks execute here).'
  },
  {
    id: 'hal',
    name: 'Hardware Abstraction Layer (HAL)',
    items: 'Camera · Audio · Sensors · Bluetooth modules',
    detail: 'Standard interfaces into device hardware. Rarely your attack surface, but defines what device capabilities an app can reach through permissions.'
  },
  {
    id: 'kernel',
    name: 'Linux Kernel',
    items: 'Process isolation · UID/GID · Binder IPC · SELinux · drivers',
    detail: 'The security foundation: every app is a UID, file permissions follow UIDs, Binder carries all IPC, and SELinux enforces mandatory access control on top.'
  }
];

function AndroidArchitecture({ interactive }: DProps) {
  const [sel, setSel] = useState<string | null>(null);
  const selLayer = ARCH_LAYERS.find((l) => l.id === sel);
  const colors = ['#38bdf8', '#4f7cff', '#22e58c', '#a78bfa', '#fbbf24'];
  return (
    <>
      <Frame vb="0 0 920 330" h="320px">
        <Defs />
        {ARCH_LAYERS.map((l, i) => (
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
          KERNEL
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
// 2. APK anatomy (interactive)
// ---------------------------------------------------------------------------

const APK_PARTS = [
  { path: 'AndroidManifest.xml', detail: 'Binary XML describing every component, permission and app flag. First thing a pentester reads: exported components, debuggable/backup flags, permissions.' },
  { path: 'classes.dex', detail: 'Compiled DEX bytecode of all app code. Feed it to JADX for readable Java or baksmali for exact Smali. Secrets and vulnerable patterns live here.' },
  { path: 'resources.arsc', detail: 'Compiled resource table mapping IDs to strings, layouts and values. Often contains leftover strings, URLs and API endpoints.' },
  { path: 'res/', detail: 'XML layouts, drawables, raw values. Layouts can reveal component names; values/strings.xml often leaks keys and endpoints.' },
  { path: 'assets/', detail: 'Raw files shipped as-is: bundled JSON, certificate files, JS bundles, sometimes entire webviews or databases.' },
  { path: 'lib/<abi>/*.so', detail: 'Native ELF libraries per architecture (arm64-v8a, x86_64…). JNI logic often holds anti-tamper, crypto or license checks — Ghidra territory.' },
  { path: 'META-INF/', detail: 'Signature files (MANIFEST.MF, .SF, .RSA or v2/v3 blocks in the ZIP). Verify with apksigner; patched APKs must be re-signed.' }
];

function ApkAnatomy({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 330" h="320px">
        <Defs />
        <rect x={40} y={20} width={340} height={290} rx={10} fill="rgba(56,189,248,0.05)" stroke="#38bdf8" strokeDasharray="6 4" />
        <text x={210} y={45} textAnchor="middle" fill="#38bdf8" fontSize={13} fontFamily={MONO} fontWeight={700}>
          application.apk  (ZIP)
        </text>
        {APK_PARTS.map((p, i) => (
          <g key={p.path} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={62} y={60 + i * 34} width={296} height={27} rx={5} fill={sel === i ? 'rgba(34,229,140,0.16)' : 'rgba(11,18,32,0.85)'} stroke={sel === i ? '#22e58c' : '#1b2740'} />
            <text x={78} y={78 + i * 34} fill={sel === i ? '#22e58c' : '#c3cdd9'} fontSize={11.5} fontFamily={MONO}>
              {p.path}
            </text>
          </g>
        ))}
        <Arrow x1={390} y1={160} x2={470} y2={160} label="unzip / inspect" />
        <rect x={480} y={20} width={400} height={290} rx={10} fill="rgba(34,229,140,0.04)" stroke="#1b2740" />
        <text x={500} y={48} fill="#22e58c" fontSize={12} fontFamily={MONO} fontWeight={700}>
          {sel !== null ? APK_PARTS[sel].path : 'select an entry →'}
        </text>
        {APK_PARTS[sel ?? -1] && (
          <foreignObject x={500} y={60} width={360} height={240}>
            <div style={{ color: '#8b98a9', fontSize: 13, lineHeight: 1.55, fontFamily: 'Inter, Segoe UI, sans-serif' }}>
              {APK_PARTS[sel as number].detail}
            </div>
          </foreignObject>
        )}
      </Frame>
      {interactive && <div className="mb-2 text-center font-mono text-[11px] text-dim">click any APK entry to inspect it</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// 3. Activity lifecycle
// ---------------------------------------------------------------------------

function ActivityLifecycle() {
  const states = [
    { id: 'onCreate', x: 80, note: 'init, inflate UI' },
    { id: 'onStart', x: 250, note: 'becoming visible' },
    { id: 'onResume', x: 420, note: 'foreground, interactive' },
    { id: 'onPause', x: 590, note: 'partially covered' },
    { id: 'onStop', x: 760, note: 'not visible' }
  ];
  return (
    <Frame vb="0 0 920 260" h="250px">
      <Defs />
      {states.map((s, i) => (
        <g key={s.id}>
          <Box x={s.x} y={60} w={140} h={44} label={s.id} sub={s.note} stroke="#38bdf8" fill="rgba(56,189,248,0.07)" small />
          {i < states.length - 1 && <Arrow x1={s.x + 140} y1={82} x2={states[i + 1].x} y2={82} />}
        </g>
      ))}
      <Box x={420} y={150} w={140} h={44} label="onDestroy" stroke="#f87171" fill="rgba(248,113,113,0.06)" small />
      <Arrow x1={830} y1={104} x2={510} y2={150} label="finish()" color="#f87171" />
      <Arrow x1={660} y1={104} x2={490} y2={60} label="user returns" color="#22e58c" dashed />
      <Box x={80} y={150} w={140} h={44} label="onRestart" stroke="#22e58c" fill="rgba(34,229,140,0.06)" small />
      <Arrow x1={150} y1={104} x2={120} y2={150} dashed color="#22e58c" />
      <text x={460} y={232} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        ActivityManagerService drives every transition — lifecycle events are a good place to observe app behavior in logcat
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 4. App ↔ API flow
// ---------------------------------------------------------------------------

function AppApiFlow() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Box x={40} y={70} w={200} h={120} label="Android App" sub="UI · local storage · logic" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <text x={140} y={215} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        what you test client-side:
      </text>
      <text x={140} y={232} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        APK · data · components
      </text>
      <Arrow x1={250} y1={130} x2={390} y2={130} label="HTTPS (JSON)" />
      <text x={320} y={105} textAnchor="middle" fill="#38bdf8" fontSize={10} fontFamily={MONO}>
        tokens · params
      </text>
      <Box x={400} y={70} w={200} h={120} label="Backend API" sub="auth · business rules" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Arrow x1={610} y1={130} x2={740} y2={130} />
      <Box x={750} y={70} w={130} h={120} label="Database" sub="the real secrets" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <text x={320} y={250} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO}>
        ⚠ the server must enforce everything — the app is in attacker hands
      </text>
      <rect x={330} y={45} width={230} height={26} rx={13} fill="rgba(251,191,36,0.08)" stroke="#fbbf24" />
      <text x={445} y={63} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO}>
        trust boundary
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 5. Frida flow
// ---------------------------------------------------------------------------

function FridaFlow() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={40} y={60} w={230} h={170} label="Your Workstation" sub="frida CLI / Python / JS agent" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <text x={155} y={115} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        agent script (JS)
      </text>
      <text x={155} y={135} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        hooks · traces · RPC
      </text>
      <Arrow x1={280} y1={145} x2={420} y2={145} label="USB / adb forward TCP" />
      <Box x={430} y={60} w={190} h={170} label="frida-server" sub="runs as root on device" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Arrow x1={630} y1={110} x2={740} y2={110} label="inject agent" />
      <Arrow x1={740} y1={180} x2={630} y2={180} label="events / messages" dashed color="#22e58c" />
      <Box x={750} y={60} w={130} h={170} label="Target App" sub="process memory" stroke="#fbbf24" fill="rgba(251,191,36,0.05)" />
      <text x={460} y={280} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        agent executes inside the target process — it can read and modify functions while the app runs
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 6/7. Workflows
// ---------------------------------------------------------------------------

function Pipeline({ steps, colors }: { steps: string[]; colors?: string[] }) {
  const w = 150;
  const gap = 32;
  const totalW = steps.length * w + (steps.length - 1) * gap;
  const x0 = Math.max(10, (920 - totalW) / 2);
  return (
    <Frame vb="0 0 920 190" h="180px">
      <Defs />
      {steps.map((s, i) => {
        const x = x0 + i * (w + gap);
        const stroke = colors?.[i % (colors?.length ?? 1)] ?? '#22e58c';
        return (
          <g key={s}>
            <Box x={x} y={55} w={w} h={56} label={s} stroke={stroke} fill={stroke + '10'} small />
            <text x={x + w / 2} y={135} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
              {i + 1}
            </text>
            {i < steps.length - 1 && <Arrow x1={x + w} y1={83} x2={x + w + gap} y2={83} />}
          </g>
        );
      })}
    </Frame>
  );
}

const StaticWorkflow = () => (
  <Pipeline steps={['Acquire APK', 'Unpack & triage', 'Decompile', 'Audit manifest', 'Hunt patterns', 'Verify & report']} colors={['#38bdf8', '#22e58c', '#4f7cff', '#fbbf24', '#f87171', '#a78bfa']} />
);

const DynamicWorkflow = () => (
  <Pipeline steps={['Install & run', 'Monitor (logs, files)', 'Exercise features', 'Hook & instrument', 'Verify findings', 'Capture evidence']} colors={['#22e58c', '#38bdf8', '#4f7cff', '#fbbf24', '#f87171', '#a78bfa']} />
);

// ---------------------------------------------------------------------------
// 8. Cert pinning flow
// ---------------------------------------------------------------------------

function CertPinningFlow() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={60} y={50} w={220} h={70} label="App (client)" sub="holds pinned cert hash" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Box x={640} y={50} w={220} h={70} label="Server" sub="presents certificate chain" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Arrow x1={290} y1={72} x2={630} y2={72} label="1 · ClientHello" />
      <Arrow x1={630} y1={100} x2={290} y2={100} label="2 · certificate chain" dashed />
      <Box x={330} y={160} w={260} h={64} label="3 · compare pin" sub="chain hash == pinned hash ?" stroke="#fbbf24" fill="rgba(251,191,36,0.07)" />
      <Arrow x1={290} y1={120} x2={330} y2={160} color="#fbbf24" />
      <Arrow x1={590} y1={175} x2={700} y2={230} label="match → handshake OK" color="#22e58c" />
      <Box x={640} y={230} w={220} h={56} label="connection established" stroke="#22e58c" fill="rgba(34,229,140,0.06)" small />
      <Arrow x1={330} y1={210} x2={230} y2={260} label="mismatch → reject" color="#f87171" />
      <Box x={60} y={230} w={220} h={56} label="handshake fails" sub="proxy sees nothing" stroke="#f87171" fill="rgba(248,113,113,0.06)" small />
      <text x={460} y={310} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        pinning blocks your proxy on purpose — evaluating that control is an authorized-test task (module m06 / m12)
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 9. Component interaction
// ---------------------------------------------------------------------------

function ComponentInteraction() {
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      <Box x={40} y={40} w={200} h={120} label="Caller" sub="another app · adb · browser" stroke="#f87171" fill="rgba(248,113,113,0.05)" />
      <Arrow x1={250} y1={100} x2={360} y2={100} label="explicit Intent" />
      <Arrow x1={250} y1={140} x2={360} y2={160} label="implicit Intent" color="#fbbf24" />
      <Box x={370} y={60} w={180} h={120} label="system_server" sub="ActivityManagerService" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <text x={460} y={215} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        resolves · permission-checks · starts
      </text>
      <Arrow x1={560} y1={100} x2={670} y2={80} label="exported ✓" color="#22e58c" />
      <Arrow x1={560} y1={160} x2={670} y2={180} label="not exported ✗" color="#f87171" dashed />
      <rect x={680} y={40} width={200} height={180} rx={10} fill="rgba(34,229,140,0.05)" stroke="#22e58c" strokeDasharray="5 4" />
      <text x={780} y={65} textAnchor="middle" fill="#22e58c" fontSize={12} fontFamily={MONO} fontWeight={700}>
        target app
      </text>
      <Box x={700} y={80} w={160} h={38} label="Activity" stroke="#1b2740" fill="rgba(11,18,32,0.8)" small />
      <Box x={700} y={126} w={160} h={38} label="Service" stroke="#1b2740" fill="rgba(11,18,32,0.8)" small />
      <Box x={700} y={172} w={160} h={38} label="Provider / Receiver" stroke="#1b2740" fill="rgba(11,18,32,0.8)" small />
      <text x={460} y={290} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO}>
        exported components = public API — anyone may call them with any data
      </text>
      <text x={460} y={312} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        the framework checks platform permissions, but app-level authorization is the developer's job
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 10. Binder IPC
// ---------------------------------------------------------------------------

function BinderIpc() {
  return (
    <Frame vb="0 0 920 280" h="270px">
      <Defs />
      <Box x={60} y={50} w={240} h={80} label="Client process" sub="app A (UID u0_a42)" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Box x={620} y={50} w={240} h={80} label="Server process" sub="system service / app B" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Box x={360} y={35} w={200} h={50} label="/dev/binder" sub="kernel driver" stroke="#fbbf24" fill="rgba(251,191,36,0.07)" />
      <Arrow x1={310} y1={80} x2={355} y2={62} label="marshal call" />
      <Arrow x1={565} y1={62} x2={615} y2={80} label="deliver" />
      <Arrow x1={615} y1={105} x2={565} y2={88} label="result" dashed color="#22e58c" />
      <Arrow x1={355} y1={88} x2={310} y2={105} dashed color="#22e58c" />
      <text x={460} y={150} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        Binder passes the caller's UID/PID to the server — permission checks can use it
      </text>
      <rect x={140} y={185} width={640} height={60} rx={10} fill="rgba(248,113,113,0.05)" stroke="#f87171" strokeDasharray="5 4" />
      <text x={460} y={210} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO}>
        vulnerability pattern: server trusts caller input without checking getCallingUid() / permissions
      </text>
      <text x={460} y={230} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        → one app reaches data or functionality of another across the sandbox
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 11. MASVS map (interactive)
// ---------------------------------------------------------------------------

const MASVS_CATS = [
  { id: 'STORAGE', color: '#22e58c', detail: 'Secrets, files, databases, logs, backups. Pentester checks: where data lands, who can read it, is it encrypted with KEK-protected keys.' },
  { id: 'CRYPTO', color: '#38bdf8', detail: 'Correct use of crypto primitives. Pentester checks: algorithms, modes (no ECB), key storage (Keystore), IV handling, randomness.' },
  { id: 'AUTH', color: '#4f7cff', detail: 'Local and remote authentication: biometrics, session handling, token lifecycle. Pentester checks: bypassable local gates, refresh/revocation.' },
  { id: 'NETWORK', color: '#a78bfa', detail: 'TLS configuration, certificate validation, pinning. Pentester checks: user-CA trust, NSC settings, cleartext traffic, pin strength.' },
  { id: 'PLATFORM', color: '#fbbf24', detail: 'Correct use of platform APIs: components, intents, permissions, IPC. Pentester checks: exported surface, intent handling, PendingIntents.' },
  { id: 'CODE', color: '#f87171', detail: 'Code quality: injection, XSS in WebViews, error handling, updates. Pentester checks: input validation, WebView config, hardcoded secrets.' },
  { id: 'RESILIENCE', color: '#2dd4bf', detail: 'Anti-tamper & anti-analysis: root/emulator/hook detection, obfuscation, integrity. Pentester checks: does each defense measurably raise effort?' },
  { id: 'PRIVACY', color: '#fb923c', detail: 'User consent, data minimization, PII handling. Pentester checks: what leaves the device, tracking SDKs, unneeded identifiers.' }
];

function MasvsMap({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 360" h="350px">
        <Defs />
        <text x={460} y={34} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          OWASP MASVS v2 — 8 security requirement categories
        </text>
        {MASVS_CATS.map((c, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = 70 + col * 200;
          const y = 60 + row * 120;
          return (
            <g key={c.id} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={x} y={y} width={170} height={92} rx={10} fill={c.color + '12'} stroke={sel === i ? c.color : c.color + '70'} strokeWidth={sel === i ? 2.5 : 1.2} />
              <text x={x + 85} y={y + 40} textAnchor="middle" fill={c.color} fontSize={14} fontFamily={MONO} fontWeight={700}>
                {c.id}
              </text>
              <text x={x + 85} y={y + 62} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
                MASVS-{c.id.slice(0, 4)}
              </text>
            </g>
          );
        })}
        <text x={460} y={342} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
          {interactive ? 'click a category for what a pentester checks' : 'MASTG tells you HOW to test each category; MASWE catalogs the weaknesses'}
        </text>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border p-3 text-sm text-muted animate-fade-in" style={{ borderColor: MASVS_CATS[sel].color + '55', background: MASVS_CATS[sel].color + '0d' }}>
          <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: MASVS_CATS[sel].color }}>
            MASVS-{MASVS_CATS[sel].id}
          </span>
          <p className="mt-1">{MASVS_CATS[sel].detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 12. Methodology pipeline
// ---------------------------------------------------------------------------

const METHODOLOGY = [
  'Recon', 'Understand app', 'Acquire APK', 'Static analysis', 'Dynamic analysis', 'Network analysis',
  'API testing', 'Auth testing', 'Authz testing', 'Storage testing', 'Platform interaction', 'Reverse engineering',
  'Resilience testing', 'Documentation', 'Reporting', 'Retesting'
];

function MethodologyPipeline() {
  const cols = 4;
  const bw = 170;
  const bh = 46;
  const gapX = 60;
  const gapY = 74;
  return (
    <Frame vb="0 0 920 460" h="440px">
      <Defs />
      {METHODOLOGY.map((s, i) => {
        const row = Math.floor(i / cols);
        const idxInRow = i % cols;
        const reverse = row % 2 === 1;
        const col = reverse ? cols - 1 - idxInRow : idxInRow;
        const x = 55 + col * (bw + gapX);
        const y = 40 + row * gapY;
        const isLastCol = idxInRow === cols - 1;
        const nextRight = reverse ? x - gapX : x + bw + gapX;
        return (
          <g key={s}>
            <Box x={x} y={y} w={bw} h={bh} label={s} sub={`phase ${i + 1}`} stroke={i < 13 ? '#22e58c' : '#a78bfa'} fill={(i < 13 ? '#22e58c' : '#a78bfa') + '0f'} small />
            {!isLastCol && i < METHODOLOGY.length - 1 && (
              <Arrow x1={reverse ? x : x + bw} y1={y + bh / 2} x2={reverse ? nextRight + bw : nextRight} y2={y + bh / 2} />
            )}
            {isLastCol && i < METHODOLOGY.length - 1 && (
              <line x1={reverse ? x : x + bw / 2} y1={y + bh + 4} x2={reverse ? x : x + bw / 2} y2={y + gapY - 12} stroke="#38bdf8" strokeWidth={1.5} markerEnd="url(#arrowHead)" />
            )}
          </g>
        );
      })}
    </Frame>
  );
}

// ---------------------------------------------------------------------------

const ANDROID_REGISTRY: Partial<Record<DiagramId, React.FC<DProps>>> = {
  'android-architecture': AndroidArchitecture,
  'apk-anatomy': ApkAnatomy,
  'activity-lifecycle': ActivityLifecycle,
  'app-api-flow': AppApiFlow,
  'frida-flow': FridaFlow,
  'static-workflow': StaticWorkflow,
  'dynamic-workflow': DynamicWorkflow,
  'cert-pinning-flow': CertPinningFlow,
  'component-interaction': ComponentInteraction,
  'binder-ipc': BinderIpc,
  'masvs-map': MasvsMap,
  'methodology-pipeline': MethodologyPipeline
};

const REGISTRY: Partial<Record<DiagramId, React.FC<DProps>>> = {
  ...ANDROID_REGISTRY,
  ...NETWORK_DIAGRAMS_CORE,
  ...NETWORK_DIAGRAMS_A,
  ...NETWORK_DIAGRAMS_B,
  ...IOS_DIAGRAMS_CORE,
  ...IOS_DIAGRAMS_A,
  ...IOS_DIAGRAMS_B
};

const INTERACTIVE_IDS = new Set<string>([
  'android-architecture',
  'apk-anatomy',
  'masvs-map',
  'net-lan-topology',
  'net-osi-tcpip',
  'net-pivot-topology',
  'ios-platform-stack',
  'ios-ipa-anatomy',
  'ios-macho-anatomy',
  'ios-data-container',
  'ios-security-boundaries',
  'ios-anti-analysis-map',
  'ios-masvs-map'
]);

export function Diagram({ id }: { id: DiagramId }) {
  const Comp = REGISTRY[id];
  if (!Comp) return null;
  const interactive = INTERACTIVE_IDS.has(id);
  return (
    <div className={classNames('rounded-xl')}>
      <Comp interactive={interactive} />
    </div>
  );
}
