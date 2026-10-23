/* Structural lint over academy content files (regex-based, no TS compile).
   Validates both the Android academy (src/data) and the Network academy
   (src/academies/network/content). */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SRC = new URL('../src/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SECTION_KEYS = ['idea:', 'technical:', 'pentestRelevance:', 'lookFor:', 'howToTest:', 'example:', 'tools:', 'mistakes:', 'tryIt:', 'takeaways:'];

const ANDROID_DIAGRAMS = new Set([
  'android-architecture', 'apk-anatomy', 'activity-lifecycle', 'app-api-flow', 'frida-flow',
  'static-workflow', 'dynamic-workflow', 'cert-pinning-flow', 'component-interaction',
  'binder-ipc', 'masvs-map', 'methodology-pipeline'
]);
const NETWORK_DIAGRAMS = new Set([
  'net-lan-topology', 'net-ip-addressing', 'net-subnetting', 'net-arp-flow', 'net-tcp-vs-udp',
  'net-osi-tcpip', 'net-encapsulation', 'net-tcp-handshake', 'net-dns-resolution', 'net-dhcp-process',
  'net-protocol-map', 'net-nat', 'net-routing', 'net-segmentation', 'net-dmz',
  'net-firewall-placement', 'net-ids-ips', 'net-zero-trust', 'net-vpn', 'net-recon-workflow',
  'net-nmap-workflow', 'net-tcp-scan-flags', 'net-packet-anatomy', 'net-capture-pipeline',
  'net-enumeration-workflow', 'net-vuln-workflow', 'net-arp-spoofing', 'net-dns-spoofing',
  'net-l2-attacks', 'net-cred-attacks', 'net-ssh-tunneling', 'net-socks-proxy',
  'net-pivot-topology', 'net-internal-topology', 'net-attack-path', 'net-pentest-pipeline'
]);
const IOS_DIAGRAMS = new Set([
  'ios-platform-stack', 'ios-secure-boot', 'ios-vs-android', 'ios-app-lifecycle', 'ios-ipc-sandbox',
  'ios-ipa-anatomy', 'ios-bundle-container', 'ios-security-boundaries', 'ios-codesign-chain',
  'ios-entitlement-flow', 'ios-test-environments', 'ios-static-workflow', 'ios-macho-anatomy',
  'ios-re-workflow', 'ios-dynamic-workflow', 'ios-frida-arch', 'ios-frida-hook-flow',
  'ios-lldb-debugserver', 'ios-data-container', 'ios-keychain-dp', 'ios-privacy-tcc',
  'ios-network-intercept', 'ios-ats-decision', 'ios-auth-flow', 'ios-deeplink-flow',
  'ios-universal-links', 'ios-webview-bridge', 'ios-crypto-map', 'ios-arm64-pipeline',
  'ios-jailbreak-types', 'ios-anti-analysis-map', 'ios-resign-flow', 'ios-masvs-map',
  'ios-methodology-pipeline'
]);

let problems = 0;
const fail = (msg) => { problems += 1; console.log('  ✗ ' + msg); };

function lintAcademy({ label, modulesDir, moduleFileRe, lessonIdRe, validDiagrams, refChecks }) {
  console.log(`\n=== ${label} — modules (${modulesDir}) ===`);
  if (!existsSync(modulesDir)) {
    fail(`modules dir missing: ${modulesDir}`);
    return;
  }
  const files = readdirSync(modulesDir).filter((f) => moduleFileRe.test(f)).sort();
  let totalLessons = 0;

  for (const f of files) {
    const id = f.replace('.ts', '');
    const src = readFileSync(join(modulesDir, f), 'utf8');
    console.log(`\n${f} (${Math.round(src.length / 1024)} KB)`);
    if (!src.includes(`export const ${id}: Module`)) fail(`missing export const ${id}: Module`);
    const lessonIds = [...src.matchAll(new RegExp(`id:\\s*'(${lessonIdRe})'`, 'g'))].map((m) => m[1]);
    const unique = [...new Set(lessonIds.filter((l) => l.startsWith(id + '-l')))];
    totalLessons += unique.length;
    if (unique.length === 0) fail('no lessons found');
    for (const lid of unique) {
      // find the lesson object body: from `id: '<lid>'` up to the next lesson id or end of file
      const start = src.indexOf(`id: '${lid}'`);
      const nextIdMatch = src.slice(start + 1).match(new RegExp(`\n\\s{4,6}id:\\s*'${lessonIdRe}'`));
      const end = nextIdMatch ? start + 1 + nextIdMatch.index : src.length;
      const body = src.slice(start, end);
      for (const key of SECTION_KEYS) if (!body.includes(key)) fail(`${lid}: missing section ${key}`);
      const quizCount = (body.match(/type:\s*'(?:mcq|truefalse|short|scenario)'/g) ?? []).length;
      if (quizCount < 3) fail(`${lid}: only ${quizCount} quiz questions`);
      const hints = (body.match(/hint:/g) ?? []).length;
      const expl = (body.match(/explanation:/g) ?? []).length;
      if (hints < quizCount || expl < quizCount) fail(`${lid}: hints(${hints})/explanations(${expl}) < questions(${quizCount})`);
      const refs = (body.match(/url:\s*'/g) ?? []).length;
      if (refs < 2) fail(`${lid}: only ${refs} references`);
    }
    for (const m of src.matchAll(/\{\s*type:\s*'diagram',\s*id:\s*'([a-z-]+)'/g)) {
      if (!validDiagrams.has(m[1])) fail(`invalid diagram id: ${m[1]}`);
    }
    const opens = (src.match(/\{/g) ?? []).length;
    const closes = (src.match(/\}/g) ?? []).length;
    if (opens !== closes) fail(`brace mismatch: ${opens} opens vs ${closes} closes`);
    if (/\$\{/.test(src)) fail('template literal ${ found (forbidden in content files)');
    if (/`/.test(src)) fail('backtick found (forbidden in content files)');
  }

  console.log('');
  for (const [f, re] of refChecks) {
    const p = join(SRC, f);
    if (!existsSync(p)) { console.log(`${f}: MISSING`); fail(`${f}: missing`); continue; }
    const src = readFileSync(p, 'utf8');
    console.log(`${f} (${Math.round(src.length / 1024)} KB)`);
    if (!re.test(src)) fail(`${f}: expected export pattern missing`);
    if (/`/.test(src)) fail(`${f}: backtick found`);
  }
  console.log(`\n${label} total lessons detected: ${totalLessons}`);
}

// Android academy
lintAcademy({
  label: 'Android academy',
  modulesDir: join(SRC, 'data', 'lessons'),
  moduleFileRe: /^m\d+\.ts$/,
  lessonIdRe: 'm\\d+-l\\d+',
  validDiagrams: ANDROID_DIAGRAMS,
  refChecks: [
    ['data/labs.ts', /export const labsData: Lab\[\]|export const labs: Lab\[\]/],
    ['data/ctf.ts', /export const ctfChallenges: CTFChallenge\[\]/],
    ['data/tools.ts', /export const tools: Tool\[\]/],
    ['data/cheatsheets.ts', /export const cheatsheets: CheatSheet\[\]/],
    ['data/glossary.ts', /export const glossaryTerms: GlossaryTerm\[\]/],
    ['data/sources.ts', /export const sources: SourceRef\[\]/]
  ]
});

// Network academy
lintAcademy({
  label: 'Network academy',
  modulesDir: join(SRC, 'academies', 'network', 'content', 'modules'),
  moduleFileRe: /^n\d+\.ts$/,
  lessonIdRe: 'n\\d+-l\\d+',
  validDiagrams: NETWORK_DIAGRAMS,
  refChecks: [
    ['academies/network/content/labs.ts', /export const labsData: Lab\[\]/],
    ['academies/network/content/ctf.ts', /export const ctfChallenges: CTFChallenge\[\]/],
    ['academies/network/content/tools.ts', /export const tools: Tool\[\]/],
    ['academies/network/content/cheatsheets.ts', /export const cheatsheets: CheatSheet\[\]/],
    ['academies/network/content/glossary.ts', /export const glossaryTerms: GlossaryTerm\[\]/],
    ['academies/network/content/sources.ts', /export const sources: SourceRef\[\]/],
    ['academies/network/content/modules/index.ts', /export const NETWORK_MODULES: Module\[\]/]
  ]
});

// iOS academy
lintAcademy({
  label: 'iOS academy',
  modulesDir: join(SRC, 'academies', 'ios', 'content', 'modules'),
  moduleFileRe: /^i\d+\.ts$/,
  lessonIdRe: 'i\\d+-l\\d+',
  validDiagrams: IOS_DIAGRAMS,
  refChecks: [
    ['academies/ios/content/labs.ts', /export const labsData: Lab\[\]/],
    ['academies/ios/content/ctf.ts', /export const ctfChallenges: CTFChallenge\[\]/],
    ['academies/ios/content/tools.ts', /export const tools: Tool\[\]/],
    ['academies/ios/content/cheatsheets.ts', /export const cheatsheets: CheatSheet\[\]/],
    ['academies/ios/content/glossary.ts', /export const glossaryTerms: GlossaryTerm\[\]/],
    ['academies/ios/content/sources.ts', /export const sources: SourceRef\[\]/],
    ['academies/ios/content/modules/index.ts', /export const IOS_MODULES: Module\[\]/]
  ]
});

console.log(problems === 0 ? '\nLINT: no structural problems' : `\nLINT: ${problems} problem(s)`);
process.exit(problems === 0 ? 0 : 1);
