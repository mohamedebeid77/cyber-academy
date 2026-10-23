# CYBER ACADEMY

**One platform. Independent security academies.**

A local-first, offline-capable security education platform. Each academy is a complete, separate
learning product — its own curriculum, labs, CTF challenges, toolkit, glossary and fully isolated
progress — sharing one engine, one design system and one set of shared pages.

| Academy | Route | Status | Content |
| --- | --- | --- | --- |
| **Android Pentesting Academy** | `/app` | Live | 14 modules · 68 lessons · 8 labs · 8 CTF · 12 diagrams |
| **Network Security & Pentesting Academy** | `/network` | Live | 15 modules · 66 lessons · 9 labs · 8 CTF · 36 diagrams |
| **iOS Application Pentesting Academy** | `/ios` | Live | 24 modules · 76 lessons · 8 labs · 8 CTF · 34 diagrams |
| Linux / Windows Security, Active Directory | — | Planned | the platform grows one academy at a time |

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. That's it — one command, no accounts, no cloud.

Other commands:

| Command               | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Start the dev server (http://localhost:5173)                     |
| `npm run build`       | Type-check + production build into `dist/`                       |
| `npm run preview`     | Serve the production build locally                               |
| `npm run lint:content`| Structural lint over all academies' content files               |
| `npm run smoke`       | Build + run every route in jsdom, fail on console errors         |

Requires Node.js 18+.

### GitHub Pages deployment

A workflow (`.github/workflows/deploy.yml`) builds and publishes the platform to GitHub Pages
on every push to `main`. The Pages build sets `PAGES_BASE` so both Vite assets and the router
resolve under the repo subpath, and `index.html` is copied to `404.html` for SPA deep links.

---

## The academies

### Android Pentesting Academy (`/app`)

**Understand Android. Break it. Secure it.**

Android application security from fundamentals to advanced penetration testing: the platform stack,
APK analysis, static & dynamic analysis, network/TLS testing, OWASP MAS, Frida, reverse engineering
and professional reporting.

### Network Security & Pentesting Academy (`/network`)

**Understand networks. Probe them. Own the methodology.**

Networking fundamentals → protocols → security architecture → Nmap recon → Wireshark packet
analysis → service enumeration → vulnerability assessment → attack concepts (lab-only) → remote
services → Windows/Linux services → internal pentesting → pivoting & tunneling → advanced testing →
professional methodology. Aligned with the official Nmap and Wireshark documentation, IETF RFCs and
MITRE ATT&CK.

### iOS Application Pentesting Academy (`/ios`)

**Understand iOS. Open the sealed parts. Own the methodology.**

iOS platform fundamentals → architecture (XNU, containers, lifecycle) → reading Swift/ObjC as a
tester → IPA & bundle analysis → the security model (sandbox, Keychain, Data Protection, TCC) → code
signing & entitlements → the test environment → static analysis → Mach-O & reverse engineering
(Ghidra) → dynamic analysis → Frida instrumentation → LLDB debugging → storage & privacy → network
& ATS/pinning → authentication & authorization (BOLA) → deep links & WebViews → cryptography →
advanced RE (ARM64) → jailbreak boundaries → anti-analysis → patching & re-signing → OWASP
MASVS/MASTG/MASWE mapping → the full 22-phase professional methodology. Synthesized from Apple
Platform Security, Apple Developer documentation and OWASP MAS.

### Academy isolation

- **Separate routes:** `/app/*` and `/network/*` mount the same shared pages under different academies.
- **Separate content:** Android content lives in `src/data/`, network content lives in
  `src/academies/network/content/`. Nothing is shared or cross-linked.
- **Separate progress:** each academy persists to its own localStorage key
  (`android-pentesting-academy.v1` / `network-pentesting-academy.v1`) — XP, levels, badges, streaks,
  notes, bookmarks and custom content never mix. Android at 72% and Network at 0% is a valid state.
- **Separate identity:** each academy has its own accent theme (Android = acid green, Network =
  azure), badge set, skill tree, level ladder and roadmap.
- Switch academies any time from the **active academy** switcher at the top of the sidebar.

---

## Shared engine (what every academy gets)

- **Dashboard / Academy home** — progress ring, continue learning, current module, recommended next
  lesson, stats, skill roadmap strip, recent activity, achievements
- **Learning Path** — level-grouped modules with soft prerequisite locks
- **My Learning Path** — deterministic next-step recommendations (completed lessons + quiz scores +
  prerequisites; no AI)
- **Roadmap** — the academy's full journey, stage by stage
- **Lessons** — consistent 10-section structure (idea → technical → pentest relevance → what to look
  for → how to test → example → tools → mistakes → try it → takeaways) with objectives, original
  diagrams, code/terminal blocks, knowledge checks (hint → answer → explanation), notes, bookmarks
- **Labs** — guided scenarios against local, intentionally vulnerable environments with progressive
  hints, expected findings, solutions and remediation
- **CTF mode** — flag challenges with points, hints, local verification and solve-gated write-ups
- **Toolkit / Cheat Sheets / Glossary / Sources** — searchable, copy-friendly reference layers
- **Progress** — analytics, activity chart, quiz scores, badges, unlockable skill tree
- **Content Studio** — add your own lessons/modules/labs/CTF/tools/sheets/glossary/sources per academy
- **Settings** — profile, reduce-motion, per-academy backup export/import, resets

All content is **original**, synthesized from public official sources (OWASP, Nmap & Wireshark
documentation, RFCs, MITRE ATT&CK, Microsoft Learn, AOSP, Frida, tool manuals) and attributed per
lesson. Nothing is copied verbatim from any commercial course platform.

> **Legal:** everything here is for authorized security testing and education only. Labs and CTF
> challenges are designed around local, intentionally vulnerable environments you build yourself.
> Never scan, probe or attack networks, hosts, apps or systems you do not own or have explicit
> written permission to assess.

---

## Project structure

```
android-pentesting-academy/
├── index.html
├── package.json
├── vite.config.ts / tailwind.config.js / tsconfig.json
└── src/
    ├── main.tsx                        entry point (router)
    ├── App.tsx                         routes: / (hub landing), /app/* (Android), /network/* (Network)
    ├── styles/index.css                design system (dark, glass, glow, per-academy accent variables)
    ├── types/index.ts                  the content + state type contract (+ per-academy diagram ids)
    ├── academies/                      MULTI-ACADEMY PLATFORM LAYER
    │   ├── types.ts                    AcademyDefinition contract
    │   ├── index.ts                    academy registry
    │   ├── android.ts                  Android academy definition (wraps src/data unchanged)
    │   └── network/                    NETWORK ACADEMY — fully isolated content
    │       ├── index.ts                network academy definition
    │       └── content/
    │           ├── meta.ts             network levels, badges, skill tree, roadmap
    │           ├── modules/n01..n15.ts 15 module files (lessons, quizzes, refs)
    │           ├── labs.ts             9 labs
    │           ├── ctf.ts              8 CTF challenges (incl. flags)
    │           ├── tools.ts            21 tools
    │           ├── cheatsheets.ts      12 cheat sheets
    │           ├── glossary.ts         42 glossary terms
    │           └── sources.ts          14 official sources
    ├── data/                           ANDROID ACADEMY CONTENT (unchanged)
    │   ├── curriculum.ts  meta.ts      module registry, levels/badges/skill tree
    │   ├── lessons/m01..m14.ts         one file per module
    │   └── labs / ctf / tools / cheatsheets / glossary / sources.ts
    ├── context/AcademyContext.tsx      state hub — one instance per academy (progress, XP, notes…)
    ├── services/                       storage (per-academy keys), search index
    ├── components/
    │   ├── layout/                     app shell, sidebar + academy switcher, search overlay
    │   ├── ui/                         buttons, cards, modals, progress, toasts…
    │   ├── content/                    lesson block renderer (code, callouts, tables…)
    │   └── diagrams/                   shared helpers + Android (12) and Network (36) SVG diagrams
    ├── pages/                          shared pages used by every academy (+ NetworkHome, Landing)
    └── utils/                          formatting, lesson source parser
```

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + react-router. No backend — persistence is
browser localStorage, one root key per academy, which keeps the app truly local and offline-capable.

---

## Adding an academy (platform extension path)

1. Create `src/academies/<id>/content/` with `modules/`, reference files and a `meta.ts`
   (levels, badges, skill tree, roadmap stages).
2. Add a `DiagramId` union section in `src/types/index.ts` and implement the diagrams in
   `src/components/diagrams/`.
3. Export an `AcademyDefinition` (id, brand, base route, storage key, theme class, content, meta,
   strings) and register it in `src/academies/index.ts`.
4. Mount `<AcademyShell academy={...} />` with the shared route tree in `src/App.tsx` under the new
   base route. Nothing else changes — pages, search, progress and gamification come for free.

## Adding content

### Via the app (Content Studio)

Open **Content Studio** inside any academy. Added lessons, modules, labs, CTF challenges, tools,
cheat sheets, glossary terms and sources merge with that academy's built-in content, appear
everywhere immediately, and are included in its Settings → Export full backup.

### Via source files

1. **Network academy:** edit `src/academies/network/content/modules/nXX.ts` (lesson ids `nXX-lNN`)
   or the reference files next to it.
2. **Android academy:** edit `src/data/lessons/mXX.ts` (lesson ids `mXX-lNN`) or `src/data/*`.
3. Wire new modules into the academy's `modules/index.ts` (network) or `src/data/curriculum.ts`
   (Android), then run `npm run build` — the compiler validates every content file.

### Lesson content syntax (Content Studio)

```
# Sub-heading
A plain line becomes a paragraph.
- Bullet item
1. Ordered item

```bash
nmap -sV target
```

> [!TIP] Optional title
> Callout text — variants: TIP, INFO, WARN, DANGER, NOTE, LEGAL

diagram:net-lan-topology | Optional caption
```

Diagram ids are per academy — see the unions in `src/types/index.ts`
(`AndroidDiagramId` / `NetworkDiagramId`).

---

## Backups

- **Export:** Settings (inside an academy) → *Export full backup* / *Export progress only*. The
  filename prefix identifies the academy (`apa-…` / `npa-…`).
- **Import:** Settings → *Import backup…* — imports into the academy whose Settings page you used.
- **Storage location:** your browser's localStorage for this origin, one key per academy. Resetting
  browser data wipes it — export before clearing.

## Troubleshooting

- **Blank page / weird state:** Settings → *Reset everything* (after exporting!).
- **Port in use:** `npm run dev -- --port 5174`.
- **Type errors after editing content:** run `npm run build` — the compiler points at the exact line.
