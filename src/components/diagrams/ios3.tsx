import React, { useState } from 'react';
import type { DProps } from './shared';
import { Frame, Box, Arrow, Defs, Footnote, MONO } from './shared';

// iOS Academy diagrams — network, auth, platform surface, crypto, RE, resilience, methodology.

const VIOLET = '#a78bfa';
const ICE = '#cfe0f5';
const SKY = '#38bdf8';
const ACID = '#22e58c';
const WARN = '#fbbf24';
const RED = '#f87171';

// ---------------------------------------------------------------------------
// 20. Network interception path
// ---------------------------------------------------------------------------

function IOSNetworkIntercept() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Box x={40} y={60} w={180} h={110} label="iOS App" sub="URLSession / async APIs" stroke={ACID} fill={ACID + '08'} />
      <Arrow x1={220} y1={115} x2={320} y2={115} label="HTTPS request" />
      <Box x={320} y={60} w={170} h={110} label="ATS check" sub="NSAppTransportSecurity policy" stroke={WARN} fill={WARN + '08'} />
      <Arrow x1={490} y1={115} x2={560} y2={115} label="TLS handshake" />
      <Box x={560} y={60} w={150} h={110} label="Proxy" sub="Burp / mitmproxy + CA" stroke={VIOLET} fill={VIOLET + '08'} />
      <Arrow x1={710} y1={115} x2={780} y2={115} label="forward" />
      <Box x={780} y={60} w={100} h={110} label="API" sub="the real judge" stroke={SKY} fill={SKY + '08'} />
      <text x={460} y={230} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO}>
        pinning or refusal to trust your CA stops you here on purpose — evaluating that control is the task
      </text>
      <text x={460} y={256} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        user-installed CAs are not trusted by apps by default (iOS 10+ behavior for HTTP apps; iOS 13+ TLS default) — device CA trust is a manual setting
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 21. ATS decision flow
// ---------------------------------------------------------------------------

function IOSAtsDecision() {
  const rows = [
    ['No ATS keys', 'default secure: TLS 1.2+, forward secrecy, SHA-256'],
    ['NSAllowsArbitraryLoads = YES', 'global opt-out — every connection weakened; justify or report'],
    ['NSAllowsArbitraryLoadsInWebContent', 'WebKit views only — scope of risk limited to web content'],
    ['NSExceptionDomains', 'per-domain exceptions — inspect each: is the exception still needed?'],
    ['NSAllowsLocalNetworking', 'local/LAN traffic opt-out — audit what talks to local hosts']
  ];
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <text x={460} y={36} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
        Info.plist → NSAppTransportSecurity — what did the developer opt out of?
      </text>
      {rows.map(([k, v], i) => (
        <g key={k}>
          <rect x={40} y={52 + i * 48} width={840} height={40} rx={6} fill={i === 1 ? 'rgba(248,113,113,0.07)' : 'rgba(11,18,32,0.6)'} stroke={i === 1 ? RED + '80' : '#1b2740'} />
          <text x={58} y={77 + i * 48} fill={i === 1 ? RED : ICE} fontSize={11} fontFamily={MONO} fontWeight={700}>
            {k}
          </text>
          <text x={400} y={77 + i * 48} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
            {v}
          </text>
        </g>
      ))}
      <Footnote y={310 - 6}>ATS exceptions are documented developer intent — every one you find should be explainable or reportable (MASVS-NETWORK)</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 22. Auth flow (login → token → biometric)
// ---------------------------------------------------------------------------

function IOSAuthFlow() {
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      <Box x={50} y={50} w={200} h={90} label="Login screen" sub="user submits credentials" stroke={ICE} fill={ICE + '08'} small />
      <Arrow x1={250} y1={95} x2={330} y2={95} label="HTTPS POST" />
      <Box x={330} y={50} w={200} h={90} label="Auth API" sub="issues access + refresh token" stroke={SKY} fill={SKY + '08'} small />
      <Arrow x1={530} y1={95} x2={610} y2={95} label="tokens returned" />
      <Box x={610} y={50} w={250} h={90} label="Client storage" sub="keychain (good) · UserDefaults (bad)" stroke={WARN} fill={WARN + '08'} small />
      <Box x={610} y={180} w={250} h={80} label="Biometric gate" sub="LAContext: device-unlock vs user" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={735} y1={140} x2={735} y2={180} label="protects what?" color={VIOLET} />
      <Box x={330} y={180} w={200} h={80} label="Every API call" sub="Authorization: Bearer …" stroke={ACID} fill={ACID + '08'} small />
      <Arrow x1={610} y1={220} x2={530} y2={220} label="token attached" color={ACID} dashed />
      <Box x={50} y={180} w={200} h={80} label="Backend decision" sub="authorization must live here" stroke={RED} fill={RED + '08'} small />
      <Arrow x1={330} y1={220} x2={250} y2={220} />
      <Footnote y={310}>
        the client is never the boundary: biometrics can gate UX, but only the server's session and permission checks decide security
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 23. Deep link flow
// ---------------------------------------------------------------------------

function IOSDeepLinkFlow() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Box x={40} y={50} w={190} h={90} label="Attacker input" sub="Safari · Mail · QR · another app" stroke={RED} fill={RED + '08'} small />
      <Arrow x1={230} y1={95} x2={320} y2={95} label="myapp://profile?id=…" />
      <Box x={320} y={50} w={200} h={90} label="iOS resolver" sub="declared schemes (Info.plist)" stroke={SKY} fill={SKY + '08'} small />
      <Arrow x1={520} y1={95} x2={610} y2={95} label="openURL / onOpenURL" />
      <Box x={610} y={50} w={250} h={130} label="App handler" sub="parse · route · act" stroke={ICE} fill={ICE + '08'} />
      <text x={735} y={110} textAnchor="middle" fill={WARN} fontSize={9.5} fontFamily={MONO}>
        unvalidated params →
      </text>
      <text x={735} y={128} textAnchor="middle" fill={WARN} fontSize={9.5} fontFamily={MONO}>
        forced actions · token in URL ·
      </text>
      <text x={735} y={146} textAnchor="middle" fill={WARN} fontSize={9.5} fontFamily={MONO}>
        WebView load of remote content
      </text>
      <Arrow x1={230} y1={140} x2={320} y2={140} label="competing app same scheme?" color={WARN} dashed />
      <Footnote y={240}>
        scheme registration is first-come on the device: hijacking tests use fresh installs; universal links bind to a web domain instead
      </Footnote>
      <Footnote y={264}>
        test matrix: no-auth reach, parameter injection, state confusion, WebView/JS bridge reachability from URL input
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 24. Universal Links validation
// ---------------------------------------------------------------------------

function IOSUniversalLinks() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={40} y={60} w={200} h={90} label="https://shop.com/orders" sub="tapped in Safari/Mail" stroke={ICE} fill={ICE + '08'} small />
      <Arrow x1={240} y1={90} x2={350} y2={90} label="system fetches" />
      <Box x={350} y={45} w={230} h={70} label="apple-app-site-association" sub="signed-in root or /.well-known/" stroke={SKY} fill={SKY + '08'} small />
      <Arrow x1={465} y1={115} x2={465} y2={150} label="appids + paths match?" color={VIOLET} />
      <Box x={350} y={150} w={230} h={70} label="Associated Domains" sub="entitlement: applinks:shop.com" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={580} y1={95} x2={680} y2={85} label="match → opens app" color={ACID} />
      <Box x={680} y={45} w={190} h={70} label="App (no scheme)" sub="user activity handling" stroke={ACID} fill={ACID + '08'} small />
      <Arrow x1={580} y1={185} x2={680} y2={200} label="no match → Safari" color={WARN} />
      <Box x={680} y={160} w={190} h={70} label="Website in browser" sub="fallback" stroke={WARN} fill={WARN + '08'} small />
      <Footnote y={280}>
        pentest the AASA too: over-broad paths (/*) route sensitive web pages into app handlers; stale JSON breaks links silently
      </Footnote>
      <Footnote y={304}>
        handler test: crafted paths, unauthorized order access via IDs, and web-viewer confusion (app loading the URL in its own WebView)
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 25. WKWebView JavaScript bridge
// ---------------------------------------------------------------------------

function IOSWebviewBridge() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={50} y={50} w={250} h={130} label="WKWebView" sub="remote or local content" stroke={SKY} fill={SKY + '08'} />
      <text x={175} y={100} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        javascript: allowed?
      </text>
      <text x={175} y={120} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        navigation policy enforced?
      </text>
      <Arrow x1={300} y1={90} x2={420} y2={90} label="window.webkit.messageHandlers.X.postMessage()" color={WARN} />
      <Arrow x1={420} y1={130} x2={300} y2={130} label="evaluateJavaScript()" color={ACID} />
      <Box x={420} y={50} w={250} h={130} label="ScriptMessageHandler" sub="native code exposed to JS" stroke={VIOLET} fill={VIOLET + '08'} />
      <text x={545} y={100} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        attacker-controlled content here = code
      </text>
      <text x={545} y={120} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        execution in your app context
      </text>
      <Arrow x1={670} y1={115} x2={740} y2={115} />
      <Box x={740} y={50} w={130} h={130} label="Native powers" sub="tokens · storage · actions" stroke={RED} fill={RED + '08'} />
      <Footnote y={240}>
        the bridge is a trust boundary inversion: whatever the page can run, the handler can execute — validate origins and message contents
      </Footnote>
      <Footnote y={264}>
        classic findings: token-bearing handlers reachable from any page, navigation policy permitting arbitrary schemes, local file loading
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 26. Crypto API landscape
// ---------------------------------------------------------------------------

const CRYPTO_CELLS = [
  { n: 'CryptoKit', s: 'modern Swift: AES-GCM, ChaChaPoly, Curve25519, HKDF', c: ACID },
  { n: 'CommonCrypto', s: 'C API: AES, HMAC, key derivation — easy to misuse', c: SKY },
  { n: 'Security.framework', s: 'SecKey: RSA/EC signing, key generation in Keychain', c: ICE },
  { n: 'Keychain', s: 'key storage + Secure Enclave-backed keys (kSecAttrAccessible)', c: VIOLET },
  { n: 'Secure Enclave', s: 'P-256 keys that never leave the coprocessor', c: RED },
  { n: 'Certificates / ATS', s: 'SecTrust evaluation, pinning implementations', c: WARN }
];

function IOSCryptoMap() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      {CRYPTO_CELLS.map((c, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 60 + col * 280;
        const y = 50 + row * 100;
        return (
          <g key={c.n}>
            <rect x={x} y={y} width={240} height={80} rx={10} fill={c.c + '0d'} stroke={c.c + '90'} />
            <text x={x + 120} y={y + 34} textAnchor="middle" fill={c.c} fontSize={12.5} fontFamily={MONO} fontWeight={700}>
              {c.n}
            </text>
            <text x={x + 120} y={y + 56} textAnchor="middle" fill="#8b98a9" fontSize={8.8} fontFamily={MONO}>
              {c.s}
            </text>
          </g>
        );
      })}
      <Footnote y={282}>
        audit questions: where is the key generated, where does it live, which mode (GCM not ECB), is the IV/nonce unique, is the algorithm deprecated
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 27. ARM64 + calling convention
// ---------------------------------------------------------------------------

function IOSArm64Pipeline() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={40} y={40} w={250} h={120} label="Registers x0–x7" sub="first 8 arguments · x0 = return" stroke={ACID} fill={ACID + '08'} small />
      <Box x={340} y={40} w={250} h={120} label="x29 (FP) / x30 (LR)" sub="frame pointer / link register" stroke={SKY} fill={SKY + '08'} small />
      <Box x={640} y={40} w={230} h={120} label="SP / PC" sub="stack pointer · program counter" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={290} y1={100} x2={340} y2={100} />
      <Arrow x1={590} y1={100} x2={640} y2={100} />
      <Box x={150} y={190} w={280} h={80} label="bl <func>" sub="call: args in x0.. · LR = return addr" stroke={ICE} fill={ICE + '08'} small />
      <Box x={490} y={190} w={280} h={80} label="ret" sub="jumps to x30 — PAC signs it (arm64e)" stroke={WARN} fill={WARN + '08'} small />
      <Arrow x1={430} y1={230} x2={490} y2={230} />
      <Footnote y={300}>
        read a call: inputs in x0–x7, result in x0 — in LLDB: register read x0; in decompilers this becomes pseudo-code arguments
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 28. Jailbreak types and what changes
// ---------------------------------------------------------------------------

function IOSJailbreakTypes() {
  const cols = [
    {
      n: 'Tethered / semi-tethered',
      c: RED,
      rows: ['needs computer each boot (tethered)', 'or re-jailbreak app after reboot (semi)', 'historical: checkra1n era', 'kernel + filesystem unlocked']
    },
    {
      n: 'Semi-untethered',
      c: WARN,
      rows: ['re-activate from device via app', 'Sideloading: signed jailbreak IPAs', 'CVE-based kernel/PAC exploits', 'filesystem largely accessible']
    },
    {
      n: 'Rootless (modern)',
      c: SKY,
      rows: ['no / write to system volume (SSV)', 'tweaks inject into apps only', 'package managers via bootstrap', 'frida-server installs fine']
    }
  ];
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      {cols.map((c, i) => (
        <g key={c.n}>
          <rect x={40 + i * 288} y={40} width={260} height={250} rx={10} fill={c.c + '08'} stroke={c.c + '90'} />
          <text x={170 + i * 288} y={70} textAnchor="middle" fill={c.c} fontSize={11.5} fontFamily={MONO} fontWeight={700}>
            {c.n}
          </text>
          {c.rows.map((r, j) => (
            <text key={j} x={54 + i * 288} y={100 + j * 40} fill="#c3cdd9" fontSize={9} fontFamily={MONO}>
              · {r}
            </text>
          ))}
        </g>
      ))}
      <Footnote y={320}>
        what jailbreak buys the tester: SSH + full filesystem, frida-server, runtime tweaks — and it voids the platform guarantees your report must respect
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 29. Anti-analysis mechanisms (interactive)
// ---------------------------------------------------------------------------

const ANTI_MECHS = [
  {
    n: 'Debugger detection',
    d: 'ptrace(PT_DENY_ATTACH), sysctl KERN_PROC for P_TRACED_FLAG, isDebugged checks via exc breakpoints. Tester path: hook the detection symbol with Frida, or patch the branch and re-sign (lab apps only). Understand why each check fails under which tool.'
  },
  {
    n: 'Jailbreak detection',
    d: 'Probes: /Applications/Cydia.app, /bin/bash, /usr/sbin/sshd, able to write outside sandbox, URL scheme cydia://, fork() success. Tester path: enumerate every probe (strings + symbols), hook each in isolation; robust apps check many signals — a single bypass is not a bypass.'
  },
  {
    n: 'Frida / hook detection',
    d: 'Loaded image scan (frida-agent.dylib), suspicious ports (27042), ObjC class existence (Frida agent classes), function pointer sanity. Tester path: rename/hide via Frida\u2019s stalker-free mode or gadget config — again: lab validation, not magic scripts.'
  },
  {
    n: 'Integrity / anti-tamper',
    d: 'App re-verifies its own signature (SecCodeCopySelf + SecCodeCheckValidity), bundle hash checks, checks embedded.mobileprovision. Tester path: re-signing updates the signature — checks validating "original team" break; that is the mechanism to evaluate.'
  },
  {
    n: 'Environment checks',
    d: 'Simulator detection (arch/symbols), locale/time/VPN checks used as fraud signals. Tester path: these shape automation fidelity — document what the app refuses to do where, and whether that logic leaks business rules.'
  }
];

function IOSAntiAnalysisMap({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 280" h="270px">
        <Defs />
        {ANTI_MECHS.map((m, i) => (
          <g key={m.n} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={40 + (i % 3) * 288} y={40 + Math.floor(i / 3) * 110} width={260} height={90} rx={10} fill={VIOLET + '0a'} stroke={sel === i ? VIOLET : VIOLET + '60'} strokeWidth={sel === i ? 2.5 : 1.2} />
            <text x={170 + (i % 3) * 288} y={80 + Math.floor(i / 3) * 110} textAnchor="middle" fill="#c3cdd9" fontSize={11} fontFamily={MONO} fontWeight={700}>
              {m.n}
            </text>
            <text x={170 + (i % 3) * 288} y={102 + Math.floor(i / 3) * 110} textAnchor="middle" fill="#5b6b7f" fontSize={8.5} fontFamily={MONO}>
              mechanism · identification · evaluation
            </text>
          </g>
        ))}
        <Footnote y={272}>resilience testing = proving each control measurably raises attack cost — MASVS-RESILIENCE, authorized targets only</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-violet/40 bg-violet/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-violet">{ANTI_MECHS[sel].n}</span>
          <p className="mt-1">{ANTI_MECHS[sel].d}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// 30. Patching / re-signing flow
// ---------------------------------------------------------------------------

function IOSResignFlow() {
  const steps = [
    { n: 'Extract IPA', c: SKY },
    { n: 'Patch binary/resources', c: RED },
    { n: 'Update signature blob', c: WARN },
    { n: 'Re-sign (ldid/codesign)', c: VIOLET },
    { n: 'Install signed build', c: ACID },
    { n: 'Verify behavior', c: ICE }
  ];
  return (
    <Frame vb="0 0 920 250" h="240px">
      <Defs />
      {steps.map((s, i) => (
        <g key={s.n}>
          <Box x={30 + i * 145} y={60} w={130} h={64} label={s.n} stroke={s.c} fill={s.c + '0d'} small />
          {i < steps.length - 1 && <Arrow x1={160 + i * 145} y1={92} x2={175 + i * 145} y2={92} />}
        </g>
      ))}
      <Footnote y={180}>modifying anything invalidates page hashes — the kernel refuses to run it; re-signing is not optional, it is the mechanism</Footnote>
      <Footnote y={204}>entitlements must be re-declared at re-sign time (ldid -S or codesign --entitlements) — dropping them breaks keychain/app groups</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 31. MASVS map (interactive)
// ---------------------------------------------------------------------------

const MASVS_CATS = [
  { id: 'STORAGE', color: ACID, detail: 'Secrets, files, databases, keychain, logs, backups. iOS checks: UserDefaults abuse, keychain accessibility classes, data protection on files, backup exposure.' },
  { id: 'CRYPTO', color: SKY, detail: 'Correct crypto use. iOS checks: hardcoded keys, ECB/weak modes, non-random IVs, home-grown ciphers, CryptoKit/CommonCrypto misuse, key provenance.' },
  { id: 'AUTH', color: ICE, detail: 'Local & remote auth. iOS checks: biometric gate bypass (LAContext misuse), session lifecycle, token refresh, weak local-only authorization.' },
  { id: 'NETWORK', color: VIOLET, detail: 'TLS everywhere. iOS checks: ATS exceptions, certificate validation overrides, pinning strength, user-CA handling, cleartext remnants.' },
  { id: 'PLATFORM', color: WARN, detail: 'Platform API misuse. iOS checks: deep link/universal link handling, WebView configuration, extensions, app groups, keychain sharing, pasteboard.' },
  { id: 'CODE', color: RED, detail: 'Code quality. iOS checks: injection into WebViews/handlers, IPC input validation, error handling, hardcoded secrets, update enforcement.' },
  { id: 'RESILIENCE', color: '#2dd4bf', detail: 'Anti-tamper/anti-analysis. iOS checks: jailbreak/debug/hook detection quality, integrity validation, obfuscation — measured, not theatrical.' },
  { id: 'PRIVACY', color: '#fb923c', detail: 'User consent & data flows. iOS checks: TCC usage correctness, data minimization, PII in logs/caches/analytics, tracking identifiers.' }
];

function IOSMasvsMap({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 360" h="350px">
        <Defs />
        <text x={460} y={34} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          OWASP MASVS v2 — 8 security requirement categories (stable control ids: MASVS-CATEGORY-N)
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
          {interactive ? 'click a category for the iOS-specific test view' : 'MASTG iOS tells you HOW to test each; MASWE catalogs the named weaknesses'}
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
// 32. Methodology snake pipeline
// ---------------------------------------------------------------------------

const METHODOLOGY = [
  'Scope & ROE', 'Acquire app', 'Environment', 'IPA & metadata', 'Info.plist', 'Entitlements',
  'Code signing', 'Static analysis', 'Reversing', 'Runtime analysis', 'Network testing', 'Storage testing',
  'Authentication', 'Authorization', 'Deep links', 'WebViews', 'Cryptography', 'Resilience',
  'Evidence', 'Findings', 'Report', 'Retest'
];

function IOSMethodologyPipeline() {
  const cols = 4;
  const bw = 170;
  const bh = 46;
  const gapX = 60;
  const gapY = 74;
  const rows = Math.ceil(METHODOLOGY.length / cols);
  return (
    <Frame vb="0 0 920 640" h="620px">
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
            <Box x={x} y={y} w={bw} h={bh} label={s} sub={`phase ${i + 1}`} stroke={i < 18 ? ACID : VIOLET} fill={(i < 18 ? ACID : VIOLET) + '0f'} small />
            {!isLastCol && i < METHODOLOGY.length - 1 && (
              <Arrow x1={reverse ? x : x + bw} y1={y + bh / 2} x2={reverse ? nextRight + bw : nextRight} y2={y + bh / 2} />
            )}
            {isLastCol && i < METHODOLOGY.length - 1 && (
              <line x1={reverse ? x : x + bw / 2} y1={y + bh + 4} x2={reverse ? x : x + bw / 2} y2={y + gapY - 12} stroke={SKY} strokeWidth={1.5} markerEnd="url(#arrowHead)" />
            )}
          </g>
        );
      })}
      <Footnote y={40 + rows * gapY + 30}>
        one methodology, twenty-two phases — every lesson and lab in this academy maps onto a phase of this path
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const IOS_DIAGRAMS_B: Partial<Record<string, React.FC<DProps>>> = {
  'ios-network-intercept': IOSNetworkIntercept,
  'ios-ats-decision': IOSAtsDecision,
  'ios-auth-flow': IOSAuthFlow,
  'ios-deeplink-flow': IOSDeepLinkFlow,
  'ios-universal-links': IOSUniversalLinks,
  'ios-webview-bridge': IOSWebviewBridge,
  'ios-crypto-map': IOSCryptoMap,
  'ios-arm64-pipeline': IOSArm64Pipeline,
  'ios-jailbreak-types': IOSJailbreakTypes,
  'ios-anti-analysis-map': IOSAntiAnalysisMap,
  'ios-resign-flow': IOSResignFlow,
  'ios-masvs-map': IOSMasvsMap,
  'ios-methodology-pipeline': IOSMethodologyPipeline
};
