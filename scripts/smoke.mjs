/* Runtime smoke test: executes the real built bundle in jsdom for every route
   and reports console errors / empty renders. */
import { JSDOM, VirtualConsole } from 'jsdom';

const BASE = 'http://localhost:4173';
const routes = [
  '/',
  '/app/dashboard',
  '/app/path',
  '/app/path/module/m01',
  '/app/lesson/m01-l01',
  '/app/my-path',
  '/app/roadmap',
  '/app/labs',
  '/app/labs/lab-01',
  '/app/ctf',
  '/app/ctf/ctf-01',
  '/app/toolkit',
  '/app/toolkit/adb',
  '/app/cheatsheets',
  '/app/cheatsheets/cs-adb',
  '/app/glossary',
  '/app/notes',
  '/app/bookmarks',
  '/app/progress',
  '/app/sources',
  '/app/admin',
  '/app/settings',
  '/app/search?q=adb',
  '/app/nonexistent',
  // Network Security & Pentesting Academy — separate academy on the same engine
  '/network',
  '/network/dashboard',
  '/network/path',
  '/network/path/module/n01',
  '/network/lesson/n01-l01',
  '/network/my-path',
  '/network/roadmap',
  '/network/labs',
  '/network/labs/net-lab-01',
  '/network/ctf',
  '/network/ctf/net-ctf-01',
  '/network/toolkit',
  '/network/toolkit/nmap',
  '/network/cheatsheets',
  '/network/cheatsheets/net-cs-01',
  '/network/glossary',
  '/network/notes',
  '/network/bookmarks',
  '/network/progress',
  '/network/sources',
  '/network/admin',
  '/network/settings',
  '/network/search?q=nmap',
  '/network/nonexistent',
  // iOS Application Pentesting Academy — separate academy on the same engine
  '/ios',
  '/ios/dashboard',
  '/ios/path',
  '/ios/path/module/i01',
  '/ios/lesson/i01-l01',
  '/ios/my-path',
  '/ios/roadmap',
  '/ios/labs',
  '/ios/labs/l1',
  '/ios/ctf',
  '/ios/ctf/c1',
  '/ios/toolkit',
  '/ios/toolkit/xcode',
  '/ios/cheatsheets',
  '/ios/cheatsheets/cs1',
  '/ios/glossary',
  '/ios/notes',
  '/ios/bookmarks',
  '/ios/progress',
  '/ios/sources',
  '/ios/admin',
  '/ios/settings',
  '/ios/search?q=frida',
  '/ios/nonexistent'
];

function checkRoute(route) {
  return new Promise((resolve) => {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on('error', (...args) => errors.push(args.map(String).join(' ').slice(0, 300)));
    vc.on('jsdomError', (e) => {
      const msg = String(e?.message ?? e);
      if (msg.includes('Not implemented') || msg.includes('not implemented')) return; // jsdom gaps (scrollTo etc.)
      errors.push(msg.slice(0, 300));
    });
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve({ route, htmlLen: dom ? dom.window.document.querySelector('#root')?.innerHTML.length ?? 0 : 0, text: '', errors, timeout: true });
      }
    }, 9000);
    let dom = null;
    JSDOM.fromURL(BASE + route, {
      resources: 'usable',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole: vc
    })
      .then(async (d) => {
        dom = d;
        try {
          // jsdom does not execute <script type="module">; the smoke build is an
          // IIFE bundle, so fetch it and evaluate it in the window ourselves.
          const res = await fetch(BASE + '/assets/bundle.js');
          const code = await res.text();
          dom.window.eval(code);
        } catch (e) {
          errors.push('BUNDLE EXEC FAILED: ' + String(e).slice(0, 200));
        }
        setTimeout(() => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          const root = dom.window.document.querySelector('#root');
          const html = root?.innerHTML ?? '';
          resolve({ route, htmlLen: html.length, text: (root?.textContent ?? '').replace(/\s+/g, ' ').slice(0, 120), errors });
        }, 3500);
      })
      .catch((e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve({ route, htmlLen: 0, text: '', errors: ['LOAD FAILED: ' + String(e).slice(0, 200)] });
      });
  });
}

let fail = 0;
for (const route of routes) {
  const r = await checkRoute(route);
  const ok = !r.timeout && r.htmlLen > 500 && r.errors.length === 0;
  if (!ok) fail += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${route} · html=${r.htmlLen} · errors=${r.errors.length}${r.timeout ? ' · TIMEOUT' : ''}`);
  for (const e of r.errors.slice(0, 3)) console.log(`   └ ${e}`);
  if (!ok && r.text) console.log(`   └ text: ${r.text}`);
}
console.log(fail === 0 ? 'ALL ROUTES PASS' : `${fail} ROUTE(S) FAILED`);
process.exit(fail === 0 ? 0 : 1);
