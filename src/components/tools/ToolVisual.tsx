import React from 'react';
import type { Tool } from '../../types';

// Original SVG mock-UIs for tool pages — stylized drawings of each tool's
// interface (window chrome, panes, realistic sample content). All drawings are
// original; no screenshots or copyrighted assets are used. The accent color
// follows the active academy theme via --acc-rgb.

const MONO = 'JetBrains Mono, Cascadia Code, Consolas, monospace';

const ACC = 'rgb(var(--acc-rgb))';
const INK = '#e6edf3';
const MUT = '#8b98a9';
const DIM = '#5b6b7f';
const GRN = '#22e58c';
const SKY = '#38bdf8';
const VIO = '#a78bfa';
const YEL = '#fbbf24';
const RED = '#f87171';

/** Registry of realistic terminal content per tool id (falls back to the tool's own commands). */
const TERM: Record<string, { title: string; lines: [string, string][] }> = {
  frida: {
    title: 'frida — com.target.app (spawn)',
    lines: [
      ['$ frida -U -f com.target.app -l agent.js', 'cmd'],
      ['[USB::iPhone::pid 812]::com.target.app ->', 'out'],
      ['%resume', 'cmd'],
      ['[SecItemAdd] class=AfterFirstUnlock group=TEAM.com.app', 'out'],
      ['[validateUser] user=tester pwdLen=12 -> true', 'out'],
      ['[gate] isPremiumUser original=0 (observing)', 'out']
    ]
  },
  objection: {
    title: 'objection — com.target.app',
    lines: [
      ['$ objection -g com.target.app explore', 'cmd'],
      ['com.target.app: (iOS) [usb]>', 'out'],
      ['ios keychain dump --json', 'cmd'],
      ['3 items: auth_token · refresh_token · device_id', 'out']
    ]
  },
  apktool: {
    title: 'apktool — d TargetApp.apk',
    lines: [
      ['$ apktool d TargetApp.apk -o out/', 'cmd'],
      ['I: Using Apktool 2.9.2', 'out'],
      ['I: Baksmaling classes.dex…', 'out'],
      ['I: Copying assets and libs…', 'out'],
      ['I: Copying unknown files…', 'out']
    ]
  },
  drozer: {
    title: 'drozer console',
    lines: [
      ['$ dz> run app.package.list', 'cmd'],
      ['com.target.app', 'out'],
      ['$ dz> run app.activity.info -a com.target.app', 'cmd'],
      ['com.target.app.MainActivity  exported=true', 'out']
    ]
  },
  apksigner: {
    title: 'apksigner — verify',
    lines: [
      ['$ apksigner verify --print-certs TargetApp.apk', 'cmd'],
      ['Signer #1 certificate DN: CN=Lab Test', 'out'],
      ['Verified using v2 scheme (APK Signature Scheme v2): true', 'out']
    ]
  },
  tcpdump: {
    title: 'tcpdump — eth0',
    lines: [
      ['$ sudo tcpdump -i eth0 -w capture.pcap', 'cmd'],
      ['tcpdump: listening on eth0, link-type EN10MB', 'out'],
      ['^C 1482 packets captured · 1482 received by filter', 'out']
    ]
  },
  netcat: {
    title: 'nc — listener',
    lines: [
      ['$ nc -lvnp 4444', 'cmd'],
      ['listening on [any] 4444 …', 'out'],
      ['connect to (10.0.2.15) from 10.0.2.10 51344', 'out']
    ]
  },
  socat: {
    title: 'socat — relay',
    lines: [
      ['$ socat TCP-LISTEN:8080,fork TCP:10.0.2.5:80', 'cmd'],
      [' socat[1234] N listening on AF INET 0.0.0.0:8080', 'out'],
      [' socat[1234] N connect to 10.0.2.5:80', 'out']
    ]
  },
  dig: {
    title: 'dig — target.example',
    lines: [
      ['$ dig +short target.example', 'cmd'],
      ['203.0.113.10', 'out'],
      ['$ dig AXFR example @ns1.example', 'cmd'],
      [';; XFR size: 42 records', 'out']
    ]
  },
  nslookup: {
    title: 'nslookup',
    lines: [
      ['> server 10.0.0.1', 'cmd'],
      ['> target.example', 'cmd'],
      ['Address: 203.0.113.10', 'out']
    ]
  },
  traceroute: {
    title: 'traceroute — target.example',
    lines: [
      ['$ traceroute target.example', 'cmd'],
      [' 1  gateway (10.0.2.2)  1.234 ms', 'out'],
      [' 2  10.0.0.1 (10.0.0.1)  8.912 ms', 'out'],
      [' 3  203.0.113.10 (target.example)  12.441 ms', 'out']
    ]
  },
  ping: {
    title: 'ping — target.example',
    lines: [
      ['$ ping -c 3 target.example', 'cmd'],
      ['64 bytes from 203.0.113.10: icmp_seq=1 ttl=57 time=12.3 ms', 'out'],
      ['--- 3 packets transmitted, 3 received, 0% loss ---', 'out']
    ]
  },
  curl: {
    title: 'curl — api',
    lines: [
      ['$ curl -s https://api.target.example/v1', 'cmd'],
      ['{"status":"ok","data":[1,2,3]}', 'out'],
      ['$ curl -H "Authorization: Bearer $T" /v2/me', 'cmd'],
      ['{"id":10001,"role":"user"}', 'out']
    ]
  },
  wget: {
    title: 'wget',
    lines: [
      ['$ wget -q https://target.example/lab.iso', 'cmd'],
      ['lab.iso  100%[===================>] 812M  9.8MB/s  in 83s', 'out']
    ]
  },
  enum4linux: {
    title: 'enum4linux — 10.0.2.5',
    lines: [
      ['$ enum4linux -a 10.0.2.5', 'cmd'],
      ['Share Enumeration:', 'out'],
      [' \\\\10.0.2.5\\public   READ', 'out'],
      ['password. policy: lockout=5', 'out']
    ]
  },
  smbclient: {
    title: 'smbclient',
    lines: [
      ['$ smbclient //10.0.2.5/public -N', 'cmd'],
      ['smb: \\> ls', 'cmd'],
      ['  notes.txt   D  1024  Sat Oct 24 10:14:20 2026', 'out']
    ]
  },
  ldapsearch: {
    title: 'ldapsearch',
    lines: [
      ['$ ldapsearch -x -H ldap://10.0.2.5 -b dc=lab,dc=local', 'cmd'],
      ['# Lab Users, lab.local', 'out'],
      ['# search result: 42 entries', 'out']
    ]
  },
  responder: {
    title: 'Responder — eth0',
    lines: [
      ['$ sudo responder -I eth0', 'cmd'],
      ['[SMB] NTLMv2-SSP Client   : 10.0.2.10', 'out'],
      ['[SMB] NTLMv2-SSP Username : LAB\\jdoe', 'out'],
      ['[+] Captured hash → hashes/jdoe.txt', 'out']
    ]
  },
  searchsploit: {
    title: 'searchsploit',
    lines: [
      ['$ searchsploit "apache 2.4.49"', 'cmd'],
      ['Apache 2.4.49 - Path Traversal | multiple/webapps/50383.py', 'out'],
      ['$ searchsploit -x 50383', 'cmd']
    ]
  },
  codesign: {
    title: 'codesign — TargetApp',
    lines: [
      ['$ codesign -dv --verbose=4 TargetApp', 'cmd'],
      ['Identifier=com.target.app', 'out'],
      ['TeamIdentifier=ABCDEFGHIJ', 'out'],
      ['Authority=Apple Development: Lab (ABCDE12345)', 'out']
    ]
  },
  ldid: {
    title: 'ldid',
    lines: [
      ['$ ldid -Sents.plist Payload/TargetApp.app/TargetApp', 'cmd'],
      ['$ ldid -e TargetApp > entitlements.plist', 'cmd'],
      ['Signature: adhoc · entitlements embedded', 'out']
    ]
  },
  'otool-nm-strings': {
    title: 'otool / nm / strings',
    lines: [
      ['$ otool -L TargetApp | head -3', 'cmd'],
      ['/System/Library/Frameworks/Security.framework/Security', 'out'],
      ['$ otool -oV TargetApp | grep -A2 LoginManager', 'cmd'],
      ['- (BOOL)validateUser:(NSString*)user password:(NSString*)pwd', 'out']
    ]
  },
  plutil: {
    title: 'plutil — Info.plist',
    lines: [
      ['$ plutil -p Payload/TargetApp.app/Info.plist', 'cmd'],
      ['CFBundleIdentifier => "com.target.app"', 'out'],
      ['NSAllowsArbitraryLoads => 1', 'out'],
      ['CFBundleURLSchemes => ["targetapp"]', 'out']
    ]
  },
  'class-dump-tools': {
    title: 'dsdump — ObjC dump',
    lines: [
      ['$ dsdump --objc TargetApp', 'cmd'],
      ['--- LoginManager : NSObject', 'out'],
      ['    - (BOOL)validateUser:(NSString *)user password:(NSString *)pwd', 'out'],
      ['    @property (copy) NSString *token;', 'out']
    ]
  }
};

function termLines(tool: Tool): { title: string; lines: [string, string][] } {
  const reg = TERM[tool.id];
  if (reg) return reg;
  const cmds = tool.commands.slice(0, 4).map(
    (c) => ['$ ' + c.cmd.split('\n')[0].slice(0, 64), 'cmd'] as [string, string]
  );
  return { title: tool.name, lines: cmds };
}

// ---------------------------------------------------------------------------
// Shared window chrome
// ---------------------------------------------------------------------------

function Chrome({
  title,
  children,
  h = 252,
  accentTabs
}: {
  title: string;
  children: React.ReactNode;
  h?: number;
  accentTabs?: boolean;
}) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-line bg-[#050b14] p-3">
      <svg viewBox={`0 0 920 ${h + 46}`} className="block w-full">
        <defs>
          <linearGradient id="tv-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--acc-rgb))" stopOpacity="0.07" />
            <stop offset="1" stopColor="rgb(var(--acc-rgb))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="900" height={h + 26} rx="10" fill="#070d18" stroke="#1b2740" />
        {/* title bar */}
        <rect x="10" y="10" width="900" height="30" rx="10" fill="#0b1220" />
        <rect x="10" y="28" width="900" height="12" fill="#0b1220" />
        <circle cx="30" cy="25" r="4.5" fill="#f87171" opacity="0.75" />
        <circle cx="46" cy="25" r="4.5" fill="#fbbf24" opacity="0.75" />
        <circle cx="62" cy="25" r="4.5" fill="#22e58c" opacity="0.75" />
        <text x="460" y="29" textAnchor="middle" fill="#8b98a9" fontSize="11" fontFamily={MONO}>
          {title}
        </text>
        {accentTabs && <rect x="10" y="40" width="900" height="1.5" fill="rgb(var(--acc-rgb))" opacity="0.5" />}
        {children}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Terminal mock
// ---------------------------------------------------------------------------

function TerminalMock({ tool }: { tool: Tool }) {
  const { title, lines } = termLines(tool);
  const rows: [string, string][] = lines.length ? lines : [['$ ' + tool.name.toLowerCase(), 'cmd']];
  return (
    <Chrome title={title}>
      {rows.map(([text, kind], i) => (
        <text
          key={i}
          x="34"
          y={72 + i * 24}
          fontSize="12.5"
          fontFamily={MONO}
          fill={kind === 'cmd' ? INK : MUT}
        >
          {kind === 'cmd' ? (
            <>
              <tspan fill={ACC}>$ </tspan>
              <tspan>{text.slice(2)}</tspan>
            </>
          ) : (
            text
          )}
        </text>
      ))}
      <text x="34" y={72 + rows.length * 24} fontSize="12.5" fontFamily={MONO} fill={ACC}>
        $ <tspan className="animate-blink">▊</tspan>
      </text>
      <rect x="10" y="36" width="900" height="230" fill="url(#tv-fade)" opacity="0.5" />
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 2. Proxy mock (Burp / mitmproxy)
// ---------------------------------------------------------------------------

const PROXY_ROWS: [string, string, string, string][] = [
  ['#', 'Host', 'Path', 'Status'],
  ['12', 'api.targetapp.com', '/v2/accounts/10001', '200'],
  ['13', 'api.targetapp.com', '/v2/accounts/10002', '200'],
  ['14', 'cdn.targetapp.com', '/assets/app.js', '200'],
  ['15', 'api.targetapp.com', '/v2/auth/refresh', '401'],
  ['16', 'analytics.vendor.io', '/collect?v=3', '200']
];

function ProxyMock({ variant }: { variant: 'burp' | 'mitm' }) {
  const burp = variant === 'burp';
  return (
    <Chrome title={burp ? 'Burp Suite — Proxy ▸ HTTP history' : 'mitmweb — Flow view'}>
      {/* sidebar: site map / flow list */}
      <rect x="26" y="52" width="200" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="38" y="72" fontSize="10.5" fontFamily={MONO} fill={DIM} fontWeight={700}>
        {burp ? 'SITE MAP' : 'FLOWS'}
      </text>
      {[
        ['targetapp.com', SKY, 1],
        ['  api.targetapp.com', MUT, 0],
        ['    /v2/accounts', MUT, 0],
        ['    /v2/auth', MUT, 0],
        ['  cdn.targetapp.com', MUT, 0],
        ['analytics.vendor.io', YEL, 1]
      ].map(([t, c, b], i) => (
        <text key={i} x="38" y={92 + i * 20} fontSize="10.5" fontFamily={MONO} fill={c as string} fontWeight={b ? 700 : 400}>
          {t as string}
        </text>
      ))}
      {/* request table */}
      <rect x="236" y="52" width="658" height="106" rx="6" fill="#080e1a" stroke="#1b2740" />
      {PROXY_ROWS.map((r, i) => (
        <g key={i}>
          <rect x="238" y={56 + i * 17} width="654" height="16" fill={i % 2 ? 'transparent' : '#0b1424'} />
          <text x="248" y={68 + i * 17} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : MUT}>
            {r[0]}
          </text>
          <text x="276" y={68 + i * 17} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : SKY}>
            {r[1]}
          </text>
          <text x="430" y={68 + i * 17} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : INK}>
            {r[2]}
          </text>
          <text x="846" y={68 + i * 17} fontSize="10" fontFamily={MONO} fontWeight={700} fill={i === 0 ? DIM : r[3] === '200' ? GRN : RED}>
            {r[3]}
          </text>
        </g>
      ))}
      {/* request / response panes */}
      <rect x="236" y="166" width="322" height="98" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="248" y="184" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>REQUEST</text>
      <text x="248" y="202" fontSize="10" fontFamily={MONO} fill={VIO}>GET</text>
      <text x="278" y="202" fontSize="10" fontFamily={MONO} fill={INK}>/v2/accounts/10002 HTTP/2</text>
      <text x="248" y="218" fontSize="10" fontFamily={MONO} fill={MUT}>Host: api.targetapp.com</text>
      <text x="248" y="234" fontSize="10" fontFamily={MONO} fill={MUT}>Authorization: Bearer eyJhbGciOi…</text>
      <text x="248" y="250" fontSize="10" fontFamily={MONO} fill={DIM}>Accept: application/json</text>
      <rect x="568" y="166" width="326" height="98" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="580" y="184" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>RESPONSE</text>
      <text x="580" y="202" fontSize="10" fontFamily={MONO} fill={GRN}>HTTP/2 200 OK</text>
      <text x="580" y="218" fontSize="10" fontFamily={MONO} fill={MUT}>{'{"id": 10002, "name": "accoun…'}</text>
      <text x="580" y="234" fontSize="10" fontFamily={MONO} fill={MUT}>{' "balance": 4210.75}'}</text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 3. IDE mock (Xcode / Android Studio)
// ---------------------------------------------------------------------------

function IdeMock({ variant }: { variant: 'xcode' | 'studio' }) {
  const xcode = variant === 'xcode';
  const nav = xcode
    ? ['TargetApp', '  AppDelegate.swift', '  SceneDelegate.swift', '  LoginManager.swift', '  CryptoHelper.swift', '  Assets.xcassets', '  TargetApp.entitlements']
    : ['TargetApp', '  MainActivity.java', '  LoginManager.java', '  CryptoUtil.java', '  AndroidManifest.xml', '  res/layout', '  res/values'];
  const code: [string, string, string][] = xcode
    ? [
        [' 1', 'class LoginManager: NSObject {', INK],
        [' 2', '  @objc func validate(_ user: String,', INK],
        [' 3', '                    pwd: String) -> Bool {', INK],
        [' 4', '    if pwd.isEmpty { return false }', MUT],
        [' 5', '    return session.valid(user, pwd)', SKY],
        [' 6', '  }', INK],
        [' 7', '}', INK]
      ]
    : [
        [' 1', 'public class LoginManager {', INK],
        [' 2', '  public boolean validate(String user,', INK],
        [' 3', '                          String pwd) {', INK],
        [' 4', '    if (pwd.isEmpty()) return false;', MUT],
        [' 5', '    return session.valid(user, pwd);', SKY],
        [' 6', '  }', INK],
        [' 7', '}', INK]
      ];
  return (
    <Chrome title={xcode ? 'TargetApp — AppDelegate.swift (Xcode)' : 'TargetApp — LoginManager.java (Android Studio)'} accentTabs>
      {/* toolbar */}
      <rect x="26" y="50" width="868" height="22" rx="5" fill="#0b1220" stroke="#1b2740" />
      <rect x="34" y="55" width="12" height="12" rx="2" fill={GRN} opacity="0.85" />
      <rect x="52" y="55" width="12" height="12" rx="2" fill="#f87171" opacity="0.6" />
      <text x="74" y="65" fontSize="10" fontFamily={MONO} fill={DIM}>
        {xcode ? 'iPhone 15 Pro · iOS 17.5' : 'Pixel 8 · API 34'}
      </text>
      <text x="876" y="65" fontSize="10" fontFamily={MONO} fill={ACC} textAnchor="end">Run ▸</text>
      {/* navigator */}
      <rect x="26" y="80" width="208" height="184" rx="6" fill="#080e1a" stroke="#1b2740" />
      {nav.map((t, i) => (
        <text key={i} x="38" y={100 + i * 19} fontSize="10.5" fontFamily={MONO} fill={i === 0 ? ACC : i === 3 ? INK : MUT} fontWeight={i === 0 ? 700 : 400}>
          {t}
        </text>
      ))}
      {/* editor */}
      <rect x="244" y="80" width="470" height="184" rx="6" fill="#080e1a" stroke="#1b2740" />
      {code.map(([n, t, c], i) => (
        <g key={i}>
          <text x="256" y={100 + i * 19} fontSize="10" fontFamily={MONO} fill={DIM}>{n}</text>
          <text x="286" y={100 + i * 19} fontSize="10.5" fontFamily={MONO} fill={c}>{t}</text>
        </g>
      ))}
      {/* inspector / preview */}
      <rect x="724" y="80" width="170" height="184" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="736" y="100" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>{xcode ? 'DEBUG AREA' : 'LOGCAT'}</text>
      {(xcode
        ? ['[APP] launch', '[AUTH] session ok', '[NET] GET /v2/me 200']
        : ['I/ActivityTask…', 'D/LoginAuth: ok', 'I/OkHttp: 200 GET /v2/me']
      ).map((t, i) => (
        <text key={i} x="736" y={122 + i * 18} fontSize="9.5" fontFamily={MONO} fill={MUT}>{t}</text>
      ))}
      <rect x="736" y="182" width="146" height="66" rx="5" fill="none" stroke={ACC} strokeDasharray="4 3" opacity="0.6" />
      <text x="809" y="218" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fill={DIM}>
        {xcode ? 'device preview' : 'emulator'}
      </text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 4. Disassembler mock (Ghidra / Hopper / JADX / radare2 / rizin)
// ---------------------------------------------------------------------------

function DisassemblerMock({ variant }: { variant: string }) {
  const isDecomp = variant === 'jadx';
  const isTui = variant === 'radare2' || variant === 'rizin';
  const title = isDecomp
    ? 'JADX-GUI — LoginManager.java'
    : isTui
      ? `${variant} — TargetApp (TUI)`
      : variant === 'hopper'
        ? 'Hopper — TargetApp.arm64'
        : 'Ghidra — TargetApp (CodeBrowser)';

  if (isTui) {
    return (
      <Chrome title={title}>
        <rect x="26" y="52" width="436" height="118" rx="6" fill="#080e1a" stroke="#1b2740" />
        {[
          ['0x1042b4f30', 'stp x29, x30, [sp,#-0x20]!', SKY],
          ['0x1042b4f34', 'adrp x1, selRef_validate', MUT],
          ['0x1042b4f38', 'ldr  x1, [x1]', MUT],
          ['0x1042b4f3c', 'bl   _objc_msgSend', GRN],
          ['0x1042b4f40', 'cbz  w0, L_fail', YEL],
          ['0x1042b4f44', 'mov  w0, #1', MUT]
        ].map(([a, m, c], i) => (
          <g key={i}>
            <text x="38" y={72 + i * 16} fontSize="10" fontFamily={MONO} fill={DIM}>{a}</text>
            <text x="150" y={72 + i * 16} fontSize="10" fontFamily={MONO} fill={c as string}>{m}</text>
          </g>
        ))}
        <rect x="472" y="52" width="422" height="118" rx="6" fill="#080e1a" stroke="#1b2740" />
        <text x="484" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>xrefs to validateUser:password:</text>
        <text x="484" y="92" fontSize="10" fontFamily={MONO} fill={MUT}>LoginViewController 0x10429a1c0</text>
        <text x="484" y="110" fontSize="10" fontFamily={MONO} fill={MUT}>SessionLoader      0x1042b4f30</text>
        <text x="484" y="128" fontSize="10" fontFamily={MONO} fill={ACC}>{'[0x1042b4f30]> pdf'}</text>
        <rect x="26" y="180" width="868" height="84" rx="6" fill="#080e1a" stroke="#1b2740" />
        <text x="38" y="200" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>STRINGS</text>
        <text x="38" y="220" fontSize="10" fontFamily={MONO} fill={MUT}>"auth_token"  "validateUser:password:"  "eyJhbGciOi…"</text>
        <text x="38" y="240" fontSize="10" fontFamily={MONO} fill={MUT}>"api.targetapp.com"  "kCCOptionECBMode"</text>
      </Chrome>
    );
  }

  const pseudo: [string, string][] = isDecomp
    ? [
        ['public boolean validate(String user,', INK],
        ['                          String pwd) {', INK],
        ['  if (TextUtils.isEmpty(pwd))', MUT],
        ['    return false;', MUT],
        ['  return this.session.valid(user, pwd);', SKY],
        ['}', INK]
      ]
    : [
        ['undefined8 validate(char *user, char *pwd)', SKY],
       ['{', INK],
        ['  ok = SecTrustEvaluateWithError(trust, 0);', INK],
        ['  if (ok == 1) return 1;', INK],
        ['  return isPinnedHost(_currentHost());', MUT],
        ['}', INK]
      ];

  return (
    <Chrome title={title}>
      {/* symbol tree */}
      <rect x="26" y="52" width="196" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="38" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>SYMBOL TREE</text>
      {[
        ['LoginManager', ACC, 1],
        ['  validateUser:password:', INK, 0],
        ['  storeToken:', MUT, 0],
        ['SessionLoader', ACC, 1],
        ['  load', INK, 0],
        ['CryptoHelper', ACC, 1],
        ['  decrypt:withKey:', MUT, 0]
      ].map(([t, c, b], i) => (
        <text key={i} x="38" y={94 + i * 19} fontSize="10.5" fontFamily={MONO} fill={c as string} fontWeight={b ? 700 : 400}>
          {t as string}
        </text>
      ))}
      {/* listing */}
      <rect x="232" y="52" width="330" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="244" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>LISTING</text>
      {[
        ['1042b4f30', 'fd 7b bf a9', 'stp x29,x30,[sp,-0x20]!', MUT],
        ['1042b4f34', '21 3c 0a 90', 'adrp x1, selRef_valid', SKY],
        ['1042b4f38', '21 00 40 f9', 'ldr x1, [x1]', MUT],
        ['1042b4f3c', 'xx xx xx 94', 'bl _objc_msgSend', GRN],
        ['1042b4f40', '00 34 00 34', 'cbz w0, L_fail', YEL],
        ['1042b4f44', '00 00 80 52', 'mov w0, #1', MUT]
      ].map(([a, b, m, c], i) => (
        <g key={i}>
          <text x="244" y={94 + i * 19} fontSize="10" fontFamily={MONO} fill={DIM}>{a}</text>
          <text x="316" y={94 + i * 19} fontSize="10" fontFamily={MONO} fill={DIM}>{b}</text>
          <text x="390" y={94 + i * 19} fontSize="10" fontFamily={MONO} fill={c as string}>{m}</text>
        </g>
      ))}
      {/* decompiler */}
      <rect x="572" y="52" width="322" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="584" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>
        {isDecomp ? 'JAVA' : 'DECOMPILER'}
      </text>
      {pseudo.map(([t, c], i) => (
        <text key={i} x="584" y={94 + i * 19} fontSize="10.5" fontFamily={MONO} fill={c}>{t}</text>
      ))}
      <rect x="572" y="52" width="322" height="212" rx="6" fill="url(#tv-fade)" opacity="0.35" />
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 5. Debugger mock (LLDB)
// ---------------------------------------------------------------------------

function DebuggerMock() {
  const code: [string, string, string, boolean][] = [
    [' 4', '  if pwd.isEmpty { return false }', MUT, false],
    [' 5', '  let ok = session.valid(user, pwd)', INK, false],
    [' 6', '  if ok {', INK, false],
    [' 7', '    keychain.store(session.token)', SKY, true],
    [' 8', '  }', INK, false],
    [' 9', '  return ok', INK, false]
  ];
  return (
    <Chrome title="lldb — TargetApp (arm64)">
      {/* code pane */}
      <rect x="26" y="52" width="470" height="150" rx="6" fill="#080e1a" stroke="#1b2740" />
      {code.map(([n, t, c, cur], i) => (
        <g key={i}>
          {cur && <rect x="28" y={60 + i * 19} width="466" height="17" fill="rgb(var(--acc-rgb))" opacity="0.12" />}
          {cur && <polygon points={`40,${63 + i * 19} 48,${67.5 + i * 19} 40,${72 + i * 19}`} fill={YEL} />}
          <text x="60" y={73 + i * 19} fontSize="10" fontFamily={MONO} fill={DIM}>{n}</text>
          <text x="86" y={73 + i * 19} fontSize="10.5" fontFamily={MONO} fill={c}>{t}</text>
        </g>
      ))}
      <rect x="44" y="58" width="6" height="6" fill={RED} />
      {/* registers */}
      <rect x="506" y="52" width="388" height="150" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="518" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>REGISTERS</text>
      {[
        ['x0 = 0x0000600002b4c120', 'self (LoginManager)', SKY],
        ['x1 = 0x00000001043a2f10', 'selRef storeToken:', MUT],
        ['x2 = 0x0000600001c8e4a0', 'session.token', GRN],
        ['lr = 0x000000010429a1f4', 'LoginViewController', MUT],
        ['w0 = 1', 'returned YES', GRN]
      ].map(([r, d, c], i) => (
        <g key={i}>
          <text x="518" y={94 + i * 20} fontSize="10" fontFamily={MONO} fill={c as string}>{r}</text>
          <text x="716" y={94 + i * 20} fontSize="9.5" fontFamily={MONO} fill={DIM}>{d}</text>
        </g>
      ))}
      {/* backtrace / console */}
      <rect x="26" y="212" width="868" height="52" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="38" y="230" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>BT</text>
      <text x="66" y="230" fontSize="10" fontFamily={MONO} fill={MUT}>
        frame #0: LoginManager.validate storeToken:  |  #1: SessionLoader.load  |  #2: main
      </text>
      <text x="38" y="252" fontSize="11" fontFamily={MONO} fill={ACC}>(lldb) po self.token</text>
      <text x="200" y="252" fontSize="11" fontFamily={MONO} fill={GRN}>"eyJhbGciOiJIUzI1NiIs…"</text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 6. Packet analyzer mock (Wireshark)
// ---------------------------------------------------------------------------

const PACKETS: [string, string, string, string, string, string][] = [
  ['No.', 'Time', 'Source', 'Destination', 'Protocol', 'Info'],
  ['1481', '4.210', '10.0.2.10', '203.0.113.10', 'TLSv1.3', 'Application Data (392 bytes)'],
  ['1482', '4.211', '203.0.113.10', '10.0.2.10', 'TLSv1.3', 'Application Data (1204 bytes)'],
  ['1483', '4.234', '10.0.2.10', '203.0.113.10', 'HTTP', 'GET /v2/accounts/10002 HTTP/2'],
  ['1484', '4.240', '203.0.113.10', '10.0.2.10', 'HTTP', '200 OK  (application/json)'],
  ['1485', '4.310', '10.0.2.1', '10.0.2.255', 'ARP', 'Who has 10.0.2.10? Tell 10.0.2.1']
];

function PacketMock() {
  return (
    <Chrome title="Wireshark — capture.pcap">
      {/* filter bar */}
      <rect x="26" y="52" width="868" height="24" rx="6" fill="#0b1220" stroke="#1b2740" />
      <text x="40" y="68" fontSize="10.5" fontFamily={MONO} fill={GRN}>tcp.port == 443 || http</text>
      <text x="884" y="68" fontSize="10.5" fontFamily={MONO} fill={DIM} textAnchor="end">1485 packets</text>
      {/* packet list */}
      <rect x="26" y="84" width="868" height="106" rx="6" fill="#080e1a" stroke="#1b2740" />
      {PACKETS.map((r, i) => (
        <g key={i}>
          <rect x="28" y={88 + i * 17} width="864" height="16" fill={i === 3 ? 'rgb(var(--acc-rgb))' : i % 2 ? 'transparent' : '#0b1424'} opacity={i === 3 ? 0.12 : 1} />
          <text x="36" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? DIM : MUT}>{r[0]}</text>
          <text x="70" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? DIM : MUT}>{r[1]}</text>
          <text x="118" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? DIM : SKY}>{r[2]}</text>
          <text x="258" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? DIM : VIO}>{r[3]}</text>
          <text x="398" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fontWeight={700} fill={i === 0 ? DIM : r[4] === 'HTTP' ? YEL : r[4] === 'ARP' ? YEL : GRN}>{r[4]}</text>
          <text x="470" y={100 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? DIM : INK}>{r[5]}</text>
        </g>
      ))}
      {/* detail tree */}
      <rect x="26" y="198" width="470" height="66" rx="6" fill="#080e1a" stroke="#1b2740" />
      {['▾ Hypertext Transfer Protocol 2', '    :method GET   :path /v2/accounts/10002', '    authorization: Bearer eyJhbGciOi…'].map((t, i) => (
        <text key={i} x="38" y={216 + i * 17} fontSize="9.5" fontFamily={MONO} fill={i === 0 ? SKY : MUT}>{t}</text>
      ))}
      {/* hex pane */}
      <rect x="506" y="198" width="388" height="66" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="518" y="216" fontSize="9.5" fontFamily={MONO} fill={MUT}>47 45 54 20 2f 76 32 2f  61 63 63 6f 75 6e 74 73</text>
      <text x="518" y="233" fontSize="9.5" fontFamily={MONO} fill={MUT}>GET /v2/accounts  .targetapp…</text>
      <text x="518" y="250" fontSize="9.5" fontFamily={MONO} fill={DIM}>7b 22 69 64 22 3a 20 31  30 30 30 32 2c 22 6e 61</text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 7. Device panel mock (adb / devicectl / pymobiledevice3 / libimobiledevice)
// ---------------------------------------------------------------------------

function DevicePanelMock() {
  return (
    <Chrome title="Devices — USB">
      {/* device list */}
      <rect x="26" y="52" width="250" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="38" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>DEVICES</text>
      <rect x="36" y="82" width="230" height="52" rx="7" fill="rgb(var(--acc-rgb))" opacity="0.1" stroke={ACC} strokeWidth="1.2" />
      <rect x="46" y="90" width="18" height="34" rx="4" fill="none" stroke={ACC} strokeWidth="1.4" />
      <text x="76" y="102" fontSize="10" fontFamily={MONO} fill={INK} fontWeight={700}>iPhone 15 Pro</text>
      <text x="76" y="116" fontSize="9" fontFamily={MONO} fill={MUT}>iOS 17.5 · 00008101-A1B2…</text>
      <rect x="36" y="142" width="230" height="52" rx="7" fill="#0b1220" stroke="#1b2740" />
      <rect x="46" y="150" width="18" height="34" rx="4" fill="none" stroke={DIM} strokeWidth="1.4" />
      <text x="76" y="162" fontSize="10" fontFamily={MONO} fill={MUT} fontWeight={700}>Pixel 8</text>
      <text x="76" y="176" fontSize="9" fontFamily={MONO} fill={DIM}>Android 14 · emulator-5554</text>
      {/* installed apps */}
      <rect x="286" y="52" width="608" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="298" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>INSTALLED APPS</text>
      {[
        ['com.target.app', '3.2.1 (418)', GRN, '▶ launch'],
        ['com.target.app.widgets', '3.2.1', MUT, ''],
        ['com.lab.mastestapp', '1.4', MUT, ''],
        ['com.bank.trainer', '0.9', MUT, '']
      ].map(([id, v, c, btn], i) => (
        <g key={i}>
          <rect x="298" y={82 + i * 40} width="584" height="32" rx="6" fill="#0b1424" stroke="#1b2740" />
          <text x="310" y={102 + i * 40} fontSize="10.5" fontFamily={MONO} fill={c as string}>{id}</text>
          <text x="560" y={102 + i * 40} fontSize="9.5" fontFamily={MONO} fill={DIM}>{v}</text>
          {btn ? (
            <>
              <rect x="792" y={88 + i * 40} width="78" height="20" rx="5" fill="rgb(var(--acc-rgb))" opacity="0.14" />
              <text x="831" y={102 + i * 40} fontSize="9.5" fontFamily={MONO} fill={ACC} textAnchor="middle">{btn}</text>
            </>
          ) : null}
        </g>
      ))}
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 8. Host scan mock (nmap / netdiscover / arp-scan)
// ---------------------------------------------------------------------------

function ScanMock() {
  return (
    <Chrome title="nmap — 10.0.2.0/24">
      <text x="34" y="74" fontSize="12" fontFamily={MONO} fill={INK}>
        <tspan fill={ACC}>$ </tspan>nmap -sV -T4 10.0.2.0/24
      </text>
      <text x="34" y="96" fontSize="11" fontFamily={MONO} fill={MUT}>Nmap scan report for lab-target (10.0.2.5)</text>
      <text x="34" y="112" fontSize="11" fontFamily={MONO} fill={MUT}>Host is up (0.0011s latency).</text>
      {/* ports table */}
      <rect x="26" y="126" width="560" height="120" rx="6" fill="#080e1a" stroke="#1b2740" />
      {[
        ['PORT', 'STATE', 'SERVICE', 'VERSION'],
        ['22/tcp', 'open', 'ssh', 'OpenSSH 9.6'],
        ['80/tcp', 'open', 'http', 'nginx 1.25'],
        ['443/tcp', 'open', 'ssl/http', 'nginx 1.25'],
        ['445/tcp', 'open', 'netbios-ssn', 'Samba 4.19']
      ].map((r, i) => (
        <g key={i}>
          <text x="40" y={146 + i * 20} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : SKY} fontWeight={i === 0 ? 700 : 400}>{r[0]}</text>
          <text x="150" y={146 + i * 20} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : GRN} fontWeight={i === 0 ? 700 : 400}>{r[1]}</text>
          <text x="230" y={146 + i * 20} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : MUT}>{r[2]}</text>
          <text x="360" y={146 + i * 20} fontSize="10" fontFamily={MONO} fill={i === 0 ? DIM : MUT}>{r[3]}</text>
        </g>
      ))}
      {/* discovered hosts sidebar */}
      <rect x="598" y="126" width="296" height="120" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="610" y="146" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>HOSTS UP</text>
      {[['10.0.2.1', 'gateway'], ['10.0.2.5', 'lab-target'], ['10.0.2.10', 'workstation']].map(([ip, name], i) => (
        <g key={i}>
          <circle cx="616" cy={162 + i * 22} r="3.5" fill={GRN} />
          <text x="628" y={166 + i * 22} fontSize="10" fontFamily={MONO} fill={INK}>{ip}</text>
          <text x="730" y={166 + i * 22} fontSize="9.5" fontFamily={MONO} fill={DIM}>{name}</text>
        </g>
      ))}
      <text x="34" y="262" fontSize="11" fontFamily={MONO} fill={MUT}>
        Nmap done: 256 IP addresses (3 hosts up) scanned in 4.21 seconds
      </text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 9. Tunnel mock (chisel / ligolo-ng / proxychains)
// ---------------------------------------------------------------------------

function TunnelMock({ label }: { label: string }) {
  return (
    <Chrome title={`${label} — tunnel active`}>
      <text x="34" y="74" fontSize="12" fontFamily={MONO} fill={INK}>
        <tspan fill={ACC}>$ </tspan>{label === 'chisel' ? 'chisel client 10.0.2.10:8080 R:socks' : label === 'ligolo-ng' ? 'ligolo-ng connect' : 'proxychains nmap -sV 10.10.20.0/24'}
      </text>
      {/* your machine */}
      <rect x="60" y="110" width="220" height="90" rx="10" fill="rgb(var(--acc-rgb))" opacity="0.08" stroke={ACC} />
      <text x="170" y="148" textAnchor="middle" fontSize="13" fontFamily={MONO} fontWeight={700} fill={INK}>Your machine</text>
      <text x="170" y="168" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={MUT}>kali · 10.0.2.15</text>
      <text x="170" y="186" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fill={ACC}>socks5 :1080</text>
      {/* tunnel */}
      <rect x="290" y="136" width="340" height="34" rx="17" fill="#080e1a" stroke={ACC} strokeDasharray="7 5" />
      <text x="460" y="157" textAnchor="middle" fontSize="11" fontFamily={MONO} fill={ACC} fontWeight={700}>{label}</text>
      <text x="460" y="124" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fill={DIM}>encrypted tunnel · reverse</text>
      {/* pivot host */}
      <rect x="640" y="110" width="220" height="90" rx="10" fill="#080e1a" stroke="#31435f" />
      <text x="750" y="148" textAnchor="middle" fontSize="13" fontFamily={MONO} fontWeight={700} fill={INK}>Pivot host</text>
      <text x="750" y="168" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={MUT}>10.0.2.10 · foothold</text>
      {/* internal network */}
      <rect x="640" y="214" width="220" height="44" rx="8" fill="#080e1a" stroke="#1b2740" />
      <text x="750" y="233" textAnchor="middle" fontSize="10.5" fontFamily={MONO} fill={VIO}>Internal network</text>
      <text x="750" y="248" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fill={DIM}>10.10.20.0/24 — not directly reachable</text>
      <path d="M750 200 L750 214" stroke={ACC} strokeWidth="1.6" markerEnd="url(#tv-arrow)" />
      <defs>
        <marker id="tv-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill={ACC} />
        </marker>
      </defs>
      <path d="M280 153 L290 153" stroke={ACC} strokeWidth="1.6" />
      <path d="M620 153 L640 153" stroke={ACC} strokeWidth="1.6" markerEnd="url(#tv-arrow)" />
      <text x="34" y="264" fontSize="10.5" fontFamily={MONO} fill={MUT}>
        [tunnel] 10.10.20.5:445 → 127.0.0.1:1080 — internal services now reachable
      </text>
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// 10. Report mock (MobSF)
// ---------------------------------------------------------------------------

function ReportMock() {
  return (
    <Chrome title="MobSF — Static Analysis Report">
      {/* score ring */}
      <rect x="26" y="52" width="250" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <circle cx="151" cy="132" r="44" fill="none" stroke="#1b2740" strokeWidth="10" />
      <circle cx="151" cy="132" r="44" fill="none" stroke={RED} strokeWidth="10" strokeDasharray="200 276" strokeLinecap="round" transform="rotate(-90 151 132)" />
      <text x="151" y="128" textAnchor="middle" fontSize="22" fontFamily={MONO} fontWeight={700} fill={INK}>42</text>
      <text x="151" y="146" textAnchor="middle" fontSize="9" fontFamily={MONO} fill={DIM}>/ 100 SECURITY SCORE</text>
      <rect x="52" y="196" width="198" height="24" rx="5" fill={RED} opacity="0.12" />
      <text x="151" y="212" textAnchor="middle" fontSize="10.5" fontFamily={MONO} fontWeight={700} fill={RED}>HIGH RISK</text>
      <text x="151" y="240" textAnchor="middle" fontSize="9.5" fontFamily={MONO} fill={DIM}>TargetApp 3.2.1 · android</text>
      {/* category bars */}
      <rect x="286" y="52" width="330" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="298" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>BY CATEGORY</text>
      {[
        ['Permissions', 78, RED],
        ['Storage', 45, YEL],
        ['Crypto', 38, YEL],
        ['Network', 30, GRN],
        ['Code quality', 22, GRN]
      ].map(([n, v, c], i) => (
        <g key={i}>
          <text x="298" y={98 + i * 32} fontSize="10" fontFamily={MONO} fill={MUT}>{n as string}</text>
          <rect x="298" y={104 + i * 32} width="306" height="7" rx="3.5" fill="#101a2c" />
          <rect x="298" y={104 + i * 32} width={(306 * (v as number)) / 100} height="7" rx="3.5" fill={c as string} opacity="0.8" />
        </g>
      ))}
      {/* findings */}
      <rect x="628" y="52" width="266" height="212" rx="6" fill="#080e1a" stroke="#1b2740" />
      <text x="640" y="72" fontSize="10" fontFamily={MONO} fill={DIM} fontWeight={700}>TOP FINDINGS</text>
      {[
        ['high  ', 'API key hardcoded in code', RED],
        ['warn  ', 'Logging enabled in release', YEL],
        ['warn  ', 'Insecure storage detected', YEL],
        ['info  ', 'Backup enabled', SKY],
        ['info  ', 'Debug symbols present', SKY]
      ].map(([s, t, c], i) => (
        <g key={i}>
          <rect x="640" y={82 + i * 36} width="242" height="28" rx="5" fill="#0b1424" />
          <text x="648" y={100 + i * 36} fontSize="9.5" fontFamily={MONO} fontWeight={700} fill={c as string}>{s}</text>
          <text x="696" y={100 + i * 36} fontSize="9.5" fontFamily={MONO} fill={MUT}>{t}</text>
        </g>
      ))}
    </Chrome>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function ToolVisual({ kind, tool }: { kind: string; tool: Tool }) {
  switch (kind) {
    case 'terminal':
      return <TerminalMock tool={tool} />;
    case 'proxy':
      return <ProxyMock variant={tool.id === 'mitmproxy' ? 'mitm' : 'burp'} />;
    case 'ide':
      return <IdeMock variant={tool.id === 'xcode' ? 'xcode' : 'studio'} />;
    case 'disassembler':
      return <DisassemblerMock variant={tool.id} />;
    case 'debugger':
      return <DebuggerMock />;
    case 'packets':
      return <PacketMock />;
    case 'device':
      return <DevicePanelMock />;
    case 'scan':
      return <ScanMock />;
    case 'tunnel':
      return <TunnelMock label={tool.name.split(' ')[0]} />;
    case 'report':
      return <ReportMock />;
    default:
      return null;
  }
}
