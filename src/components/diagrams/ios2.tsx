import React, { useState } from 'react';
import type { DProps } from './shared';
import { Frame, Box, Arrow, Defs, Footnote, MONO } from './shared';

// iOS Academy diagrams — analysis & runtime (static, Mach-O, Frida, LLDB, storage).

const VIOLET = '#a78bfa';
const ICE = '#cfe0f5';
const SKY = '#38bdf8';
const ACID = '#22e58c';
const WARN = '#fbbf24';
const RED = '#f87171';

// ---------------------------------------------------------------------------
// 12. Static analysis workflow (pipeline)
// ---------------------------------------------------------------------------

function Pipeline({ steps, colors, vbY = 190 }: { steps: string[]; colors: string[]; vbY?: number }) {
  const w = 150;
  const gap = 32;
  const totalW = steps.length * w + (steps.length - 1) * gap;
  const x0 = Math.max(10, (920 - totalW) / 2);
  return (
    <Frame vb={`0 0 920 ${vbY}`} h={`${vbY - 10}px`}>
      <Defs />
      {steps.map((s, i) => {
        const x = x0 + i * (w + gap);
        const stroke = colors[i % colors.length];
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

const IOSStaticWorkflow = () => (
  <Pipeline
    steps={['Acquire IPA', 'Unzip bundle', 'Read Info.plist', 'Dump entitlements', 'Strings & symbols', 'Decompile & audit', 'Validate findings']}
    colors={[ICE, SKY, VIOLET, WARN, ACID, RED, ICE]}
  />
);

const IOSDynamicWorkflow = () => (
  <Pipeline
    steps={['Install & launch', 'Monitor logs/files', 'Exercise features', 'Hook & instrument', 'Intercept traffic', 'Capture evidence']}
    colors={[ACID, SKY, VIOLET, WARN, RED, ICE]}
  />
);

const IOSReWorkflow = () => (
  <Pipeline
    steps={['Extract binary', 'Identify arch', 'Map Mach-O', 'Recover ObjC/Swift', 'Disassemble', 'Understand logic', 'Document finding']}
    colors={[SKY, VIOLET, ICE, ACID, WARN, RED, SKY]}
  />
);

// ---------------------------------------------------------------------------
// 13. Mach-O anatomy (interactive)
// ---------------------------------------------------------------------------

const MACHO_PARTS = [
  { n: 'Mach header', d: 'Magic 0xfeedfacf (64-bit), CPU type (arm64), file type (MH_EXECUTE, MH_DYLIB…). First thing file(1) and otool -h read. Tells you which slice of a fat binary you are looking at.' },
  { n: 'Load commands', d: 'The table that tells dyld how to load the image: LC_SEGMENT_64 (memory layout), LC_LOAD_DYLIB (linked frameworks — grep these for Security.framework, CryptoKit), LC_MAIN (entry point), LC_CODE_SIGNATURE.' },
  { n: '__TEXT segment', d: 'Executable code and read-only metadata. Sections: __text (machine code), __objc_classname / __objc_methname (Objective-C names), __cstring, __swift5_types (Swift metadata). Strings in here feed strings(1).' },
  { n: '__DATA / __DATA_CONST', d: 'Writable data: globals, ObjC class structures (__objc_classlist), method lists, __got entries fixed up at launch. Method swizzling and hooking ultimately touch data here or redirect code here.' },
  { n: 'ObjC metadata', d: 'Class list, categories, protocols, selectors. Tools (dsdump, otool -oV) reconstruct class/method names — in Objective-C apps this is the closest thing to source code you will get.' },
  { n: 'Swift metadata', d: 'Swift uses mangled names and its own metadata format (swift5_protocols, field descriptors). Demangle with swift demangle. Pure Swift apps expose less readable surface than ObjC apps.' },
  { n: 'LC_CODE_SIGNATURE', d: 'The code signature blob: CodeDirectory of page hashes, entitlements, CMS (PKCS#7) signature. Modifying any byte invalidates it — the reason every patch demands re-signing.' }
];

function IOSMachoAnatomy({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 430" h="420px">
        <Defs />
        <rect x={60} y={40} width={340} height={350} rx={10} fill="rgba(56,189,248,0.05)" stroke={SKY} strokeDasharray="6 4" />
        <text x={230} y={66} textAnchor="middle" fill={SKY} fontSize={13} fontFamily={MONO} fontWeight={700}>
          Target.app/Target (Mach-O 64)
        </text>
        {MACHO_PARTS.map((p, i) => (
          <g key={p.n} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={82} y={84 + i * 42} width={296} height={33} rx={5} fill={sel === i ? 'rgba(34,229,140,0.16)' : 'rgba(11,18,32,0.85)'} stroke={sel === i ? ACID : '#1b2740'} />
            <text x={98} y={105 + i * 42} fill={sel === i ? ACID : '#c3cdd9'} fontSize={11.5} fontFamily={MONO}>
              {p.n}
            </text>
          </g>
        ))}
        <Arrow x1={420} y1={200} x2={470} y2={200} label="otool / nm / strings" />
        <rect x={480} y={40} width={400} height={350} rx={10} fill="rgba(34,229,140,0.04)" stroke="#1b2740" />
        <text x={500} y={68} fill={ACID} fontSize={12} fontFamily={MONO} fontWeight={700}>
          {sel !== null ? MACHO_PARTS[sel].n : 'select a region →'}
        </text>
        {MACHO_PARTS[sel ?? -1] && (
          <foreignObject x={500} y={80} width={360} height={290}>
            <div style={{ color: '#8b98a9', fontSize: 12.5, lineHeight: 1.55, fontFamily: 'Inter, Segoe UI, sans-serif' }}>
              {MACHO_PARTS[sel as number].d}
            </div>
          </foreignObject>
        )}
      </Frame>
      {interactive && <div className="mb-2 text-center font-mono text-[11px] text-dim">click a Mach-O region to learn what it holds</div>}
    </>
  );
}

// ---------------------------------------------------------------------------
// 14. Frida architecture on iOS
// ---------------------------------------------------------------------------

function IOSFridaArch() {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={40} y={60} w={230} h={170} label="Your Mac" sub="frida CLI / Python / JS agent" stroke={ACID} fill={ACID + '08'} />
      <text x={155} y={115} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        frida -U -f com.target.app
      </text>
      <text x={155} y={135} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        agent scripts · traces
      </text>
      <Arrow x1={280} y1={145} x2={430} y2={145} label="USB / WiFi (frida protocol)" />
      <Box x={440} y={60} w={190} h={80} label="frida-server" sub="jailbroken: runs as root" stroke={SKY} fill={SKY + '08'} small />
      <Box x={440} y={160} w={190} h={80} label="Frida Gadget" sub="non-JB: embedded + re-signed" stroke={WARN} fill={WARN + '08'} small />
      <Arrow x1={640} y1={100} x2={750} y2={120} label="inject agent" />
      <Arrow x1={640} y1={200} x2={750} y2={170} label="load dylib at launch" color={WARN} />
      <Arrow x1={750} y1={205} x2={640} y2={225} label="events" dashed color={ACID} />
      <Box x={760} y={60} w={120} h={170} label="Target App" sub="process memory" stroke={RED} fill={RED + '08'} />
      <text x={460} y={290} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
        two paths onto the device: root daemon (jailbroken) or a gadget dylib stitched into a re-signed IPA (no jailbreak)
      </text>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 15. Frida hook mechanics (ObjC message flow)
// ---------------------------------------------------------------------------

function IOSFridaHookFlow() {
  return (
    <Frame vb="0 0 920 330" h="320px">
      <Defs />
      <Box x={50} y={60} w={200} h={90} label="App code calls" sub="[LoginManager validate:pwd]" stroke={ICE} fill={ICE + '08'} small />
      <Arrow x1={250} y1={105} x2={330} y2={105} label="objc_msgSend" />
      <Box x={330} y={60} w={200} h={90} label="Runtime resolver" sub="class → method list → IMP" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={530} y1={90} x2={620} y2={90} label="original IMP" />
      <Box x={620} y={45} w={240} h={60} label="Original implementation" sub="runs unless replaced" stroke={ACID} fill={ACID + '08'} small />
      <Box x={620} y={140} w={240} h={60} label="Frida hook (replacement IMP)" sub="reads args · logs · fakes return" stroke={WARN} fill={WARN + '08'} small />
      <Arrow x1={530} y1={125} x2={620} y2={160} label="swizzled path" color={WARN} />
      <Arrow x1={740} y1={105} x2={740} y2={140} label="impl.apply(this, args)" color={WARN} />
      <Arrow x1={620} y1={180} x2={200} y2={200} label="return value back to caller" color={ACID} dashed />
      <Box x={50} y={170} w={200} h={60} label="Your agent" sub="console.log(args) / replace return" stroke={SKY} fill={SKY + '08'} small />
      <Footnote y={300}>
        an ObjC hook swaps the method implementation — that is why Frida can inspect arguments (NSString → readable strings) and forge return values
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 16. LLDB + debugserver
// ---------------------------------------------------------------------------

function IOSLldbDebugserver() {
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Box x={50} y={60} w={230} h={130} label="LLDB on your Mac" sub="breakpoints · expressions · memory" stroke={SKY} fill={SKY + '08'} />
      <text x={165} y={130} textAnchor="middle" fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        lldb → process connect
      </text>
      <Arrow x1={280} y1={125} x2={430} y2={125} label="USB: debugserver protocol" />
      <Box x={440} y={60} w={200} h={130} label="debugserver" sub="on device, started by Xcode" stroke={VIOLET} fill={VIOLET + '08'} />
      <text x={540} y={120} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        requires get-task-allow
      </text>
      <text x={540} y={140} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        (development-signed builds)
      </text>
      <Arrow x1={640} y1={125} x2={740} y2={125} label="ptrace" />
      <Box x={740} y={60} w={140} h={130} label="App process" sub="stopped at breakpoints" stroke={ACID} fill={ACID + '08'} />
      <Footnote y={240}>
        production App Store builds ship without get-task-allow — attaching requires jailbreak tooling; debug builds attach freely
      </Footnote>
      <Footnote y={264}>
        LLDB = precise, stop-the-world inspection · Frida = live scripted manipulation — you will constantly switch between them
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 17. Data container map (interactive)
// ---------------------------------------------------------------------------

const CONTAINER_PATHS = [
  { p: 'Documents/', d: 'User-created or important data. Backed up by default. Apps here dump SQLite DBs, PDFs, exports. Test for: PII, tokens, unencrypted caches of sensitive screens.' },
  { p: 'Library/Preferences/<bundle>.plist', d: 'UserDefaults backing store. Plain XML plists — NOT encrypted. Classic finding: auth tokens, flags, last-user data stored here. Read with plutil or a plist editor after pulling the container.' },
  { p: 'Library/Application Support/', d: 'App working data: Core Data stores, SQLite, model files, downloaded content. Backed up by default. High-value target for storage testing.' },
  { p: 'Library/Caches/', d: 'Re-creatable caches; NOT backed up. Still on disk in plaintext. Sensitive images/responses cached here are a reportable issue (excluded-from-backup flag is not encryption).' },
  { p: 'Library/Cookies/', d: 'NSHTTPCookieStorage binary cookies. Session cookies may outlive app sessions — check domain, expiry and secure flag.' },
  { p: 'tmp/', d: 'Scratch space, not backed up, may be purged. Debug logs with sensitive payloads land here more often than teams admit.' },
  { p: 'Keychain (system)', d: 'Not in the container — lives in the keychain database, encrypted with keys the app cannot read. Items persist across installs until the app is uninstalled. Strongest app-local storage when used with the right accessibility class.' }
];

function IOSDataContainer({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 430" h="420px">
        <Defs />
        <rect x={50} y={30} width={380} height={370} rx={10} fill="rgba(34,229,140,0.05)" stroke={ACID} strokeDasharray="6 4" />
        <text x={240} y={56} textAnchor="middle" fill={ACID} fontSize={13} fontFamily={MONO} fontWeight={700}>
          /var/mobile/Containers/Data/Application/&lt;UUID&gt;/
        </text>
        {CONTAINER_PATHS.slice(0, 6).map((p, i) => (
          <g key={p.p} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <rect x={72} y={76 + i * 52} width={336} height={40} rx={5} fill={sel === i ? 'rgba(56,189,248,0.16)' : 'rgba(11,18,32,0.85)'} stroke={sel === i ? SKY : '#1b2740'} />
            <text x={88} y={100 + i * 52} fill={sel === i ? SKY : '#c3cdd9'} fontSize={11} fontFamily={MONO}>
              {p.p}
            </text>
          </g>
        ))}
        <Arrow x1={440} y1={200} x2={490} y2={200} label="what do you do here?" />
        <rect x={500} y={30} width={380} height={370} rx={10} fill="rgba(56,189,248,0.04)" stroke="#1b2740" />
        <text x={520} y={58} fill={SKY} fontSize={12} fontFamily={MONO} fontWeight={700}>
          {sel !== null ? CONTAINER_PATHS[sel].p : 'select a path →'}
        </text>
        {CONTAINER_PATHS[sel ?? -1] && (
          <foreignObject x={520} y={70} width={340} height={310}>
            <div style={{ color: '#8b98a9', fontSize: 12.5, lineHeight: 1.55, fontFamily: 'Inter, Segoe UI, sans-serif' }}>
              {CONTAINER_PATHS[sel as number].d}
            </div>
          </foreignObject>
        )}
      </Frame>
      {interactive && <div className="mb-2 text-center font-mono text-[11px] text-dim">click a container path — also learn Keychain (7th target, select via list below)</div>}
      <div className="mb-2 flex flex-wrap justify-center gap-2">
        {CONTAINER_PATHS.map((p, i) => (
          <button
            key={p.p}
            onClick={() => setSel(i)}
            className={sel === i ? 'chip !border-acid/50 !text-acid' : 'chip hover:!border-cyan/40'}
          >
            {p.p}
          </button>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// 18. Keychain + data protection classes
// ---------------------------------------------------------------------------

function IOSKeychainDp() {
  const dps = [
    { n: 'Complete', s: 'key available when device unlocked', c: ACID },
    { n: 'CompleteUnlessOpen', s: 'write even locked; read when unlocked', c: SKY },
    { n: 'CompleteUntilFirstUserAuthentication', s: 'after first unlock, always readable (default for many APIs)', c: WARN },
    { n: 'None', s: 'until first unlock after boot — most restrictive', c: RED }
  ];
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      <Box x={40} y={40} w={250} h={110} label="App" sub="SecItemAdd / SecItemCopyMatching" stroke={ICE} fill={ICE + '08'} small />
      <Arrow x1={290} y1={95} x2={380} y2={95} label="query + access group" />
      <Box x={380} y={40} w={250} h={110} label="securityd" sub="checks access groups + class" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={630} y1={95} x2={700} y2={95} label="unwrap key" />
      <Box x={700} y={40} w={170} h={110} label="Keychain DB" sub="AES-wrapped items" stroke={ACID} fill={ACID + '08'} small />
      <text x={460} y={190} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
        Data Protection classes — WHEN is the key available?
      </text>
      {dps.map((d, i) => (
        <g key={d.n}>
          <rect x={40 + i * 218} y={210} width={200} height={80} rx={8} fill={d.c + '0d'} stroke={d.c + '90'} />
          <text x={140 + i * 218} y={238} textAnchor="middle" fill={d.c} fontSize={10.5} fontFamily={MONO} fontWeight={700}>
            {d.n}
          </text>
          <text x={140 + i * 218} y={258} textAnchor="middle" fill="#8b98a9" fontSize={8.5} fontFamily={MONO}>
            {d.s.split(';')[0]}
          </text>
          {d.s.includes(';') && (
            <text x={140 + i * 218} y={272} textAnchor="middle" fill="#8b98a9" fontSize={8.5} fontFamily={MONO}>
              {d.s.split(';')[1]}
            </text>
          )}
        </g>
      ))}
      <Footnote y={322}>
        tester: kSecAttrAccessibleAlways-style leftovers and after-first-unlock defaults decide whether a locked phone leaks its secrets
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 19. TCC / privacy permission flow
// ---------------------------------------------------------------------------

function IOSPrivacyTcc() {
  return (
    <Frame vb="0 0 920 280" h="270px">
      <Defs />
      <Box x={50} y={60} w={200} h={80} label="App requests" sub="AVCaptureDevice / CLLocation" stroke={ICE} fill={ICE + '08'} small />
      <Arrow x1={250} y1={100} x2={340} y2={100} label="call gated API" />
      <Box x={340} y={60} w={220} h={80} label="TCC (tccd)" sub="checks user decision" stroke={VIOLET} fill={VIOLET + '08'} small />
      <Arrow x1={450} y1={140} x2={450} y2={170} label="first time: prompt" />
      <Box x={340} y={170} w={220} h={60} label="User decision" sub="Settings can revoke later" stroke={WARN} fill={WARN + '08'} small />
      <Arrow x1={560} y1={100} x2={660} y2={100} label="granted" color={ACID} />
      <Box x={660} y={60} w={210} h={80} label="API delivers data" sub="camera frames · location" stroke={ACID} fill={ACID + '08'} small />
      <Footnote y={262}>
        privacy test: permission-gated data must not bypass into unprotected storage or analytics — that is a finding even though the OS prompt worked
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const IOS_DIAGRAMS_A: Partial<Record<string, React.FC<DProps>>> = {
  'ios-static-workflow': IOSStaticWorkflow,
  'ios-dynamic-workflow': IOSDynamicWorkflow,
  'ios-re-workflow': IOSReWorkflow,
  'ios-macho-anatomy': IOSMachoAnatomy,
  'ios-frida-arch': IOSFridaArch,
  'ios-frida-hook-flow': IOSFridaHookFlow,
  'ios-lldb-debugserver': IOSLldbDebugserver,
  'ios-data-container': IOSDataContainer,
  'ios-keychain-dp': IOSKeychainDp,
  'ios-privacy-tcc': IOSPrivacyTcc
};
