import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  TerminalSquare,
  Trophy,
  Wrench,
  ShieldCheck,
  Route as RouteIcon,
  Scale,
  Play
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { ACADEMIES } from '../academies';
import type { AcademyDefinition } from '../academies';
import { Network, Smartphone, Apple, CircleDashed } from 'lucide-react';
import { loadData } from '../services/storage';

function AcademyIcon({ id, size = 22 }: { id: string; size?: number }) {
  if (id === 'network') return <Network size={size} />;
  if (id === 'android') return <Smartphone size={size} />;
  if (id === 'ios') return <Apple size={size} />;
  return <CircleDashed size={size} />;
}

interface AcademyOverview {
  academy: AcademyDefinition;
  totalLessons: number;
  completed: number;
  pct: number;
  hasProgress: boolean;
  continueTo: string | null;
}

/** Read each academy's own persisted progress straight from its storage key —
 *  the landing page is academy-neutral, so it never touches AcademyContext. */
function academyOverview(academy: AcademyDefinition): AcademyOverview {
  const data = loadData(academy.storageKey);
  const totalLessons = academy.content.modules.reduce((n, m) => n + m.lessons.length, 0);
  const completed = academy.content.modules.reduce(
    (n, m) => n + m.lessons.filter((l) => data.progress.lessons[l.id]?.completed).length,
    0
  );
  let continueTo: string | null = null;
  if (data.progress.lastLesson) {
    for (const m of academy.content.modules) {
      const l = m.lessons.find((x) => x.id === data.progress.lastLesson);
      if (l && !data.progress.lessons[l.id]?.completed) {
        continueTo = `${academy.base}/lesson/${l.id}`;
        break;
      }
    }
  }
  return {
    academy,
    totalLessons,
    completed,
    pct: totalLessons ? Math.round((completed / totalLessons) * 100) : 0,
    hasProgress: completed > 0 || data.progress.xp > 0,
    continueTo
  };
}

export default function Landing() {
  const overviews = useMemo(() => ACADEMIES.map(academyOverview), []);

  const platform = useMemo(
    () => ({
      academies: ACADEMIES.length,
      modules: ACADEMIES.reduce((n, a) => n + a.content.modules.length, 0),
      lessons: overviews.reduce((n, o) => n + o.totalLessons, 0),
      labs: ACADEMIES.reduce((n, a) => n + a.content.labs.length, 0),
      ctf: ACADEMIES.reduce((n, a) => n + a.content.ctf.length, 0)
    }),
    [overviews]
  );

  const anyProgress = overviews.some((o) => o.hasProgress);

  return (
    <div className="min-h-screen">
      {/* Hero — the platform, not any single academy */}
      <div className="grid-bg relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_50%_0%,rgba(56,189,248,0.12),transparent_70%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-16 pt-20 text-center sm:pt-24">
          <Logo size={72} />
          <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.5em] text-cyan">
            local-first security education
          </div>
          <h1 className="mt-4 font-mono text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            <span className="block">CYBER</span>
            <span className="text-gradient block">ACADEMY</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            One platform, independent academies. Pick your track below — Android, Network Security or iOS
            application pentesting — each with its own curriculum, labs, CTF challenges and completely
            separate progress. Everything runs locally on your machine.
          </p>
          <p className="mt-2 font-mono text-sm text-dim">"Understand it. Break it. Secure it."</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href="#academies" className="btn-solid !px-6 !py-3 text-base">
              {anyProgress ? 'CONTINUE LEARNING' : 'CHOOSE YOUR ACADEMY'} <ArrowRight size={18} />
            </a>
          </div>
          <div className="mt-6 font-mono text-xs text-dim">
            <span className="text-acid">$</span> npm run dev <span className="animate-blink">▊</span>
          </div>
        </div>
      </div>

      {/* Academy selection — front and center, like a platform should be */}
      <section id="academies" className="border-b border-line bg-base2/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-center font-mono text-sm uppercase tracking-[0.3em] text-cyan">Choose your academy</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted">
            Each academy is a complete, self-contained course — separate curricula, separate progress, separate tooling.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {overviews.map((o) => {
              const a = o.academy;
              const active = a.status === 'live';
              return (
                <div
                  key={a.id}
                  className={`card card-hover relative flex flex-col p-6 ${a.themeClass}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex rounded-lg border border-line bg-panel2 p-2.5 text-acid">
                      <AcademyIcon id={a.id} />
                    </div>
                    {a.status === 'live' ? (
                      <span className="chip !text-[10px]">AVAILABLE</span>
                    ) : (
                      <span className="chip !text-[10px]"><CircleDashed size={9} /> SOON</span>
                    )}
                  </div>
                  <div className="font-mono text-[15px] font-extrabold leading-tight tracking-wide">
                    {a.brandLines[0]} <span className="text-gradient">{a.brandLines[1]}</span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-dim">{a.tagline}</div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{a.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="chip">{a.content.modules.length} MODULES</span>
                    <span className="chip">{o.totalLessons} LESSONS</span>
                    <span className="chip">{a.content.labs.length} LABS</span>
                    <span className="chip">{a.content.ctf.length} CTF</span>
                  </div>

                  {/* Per-academy progress, read from its own storage key */}
                  {active && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-dim">
                        <span>{o.hasProgress ? 'YOUR PROGRESS' : 'NOT STARTED'}</span>
                        <span>{o.hasProgress ? `${o.completed}/${o.totalLessons} · ${o.pct}%` : '0%'}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-acid to-cyan transition-all"
                          style={{ width: `${o.pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {active ? (
                      <>
                        <Link
                          to={o.hasProgress && o.continueTo ? o.continueTo : `${a.base}/dashboard`}
                          className="btn-solid btn-sm !px-4 !py-2"
                        >
                          <Play size={13} /> {o.hasProgress ? 'CONTINUE' : 'START LEARNING'}
                        </Link>
                        <Link to={`${a.base}/dashboard`} className="btn-ghost btn-sm">
                          Enter academy <ArrowRight size={13} />
                        </Link>
                      </>
                    ) : (
                      <span className="font-mono text-[11px] text-dim">in development — not yet selectable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform-wide stats strip */}
      <div className="border-b border-line bg-base2/60">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 py-6 sm:grid-cols-5">
          {[
            { k: String(platform.academies), v: 'academies' },
            { k: String(platform.modules), v: 'modules' },
            { k: `${platform.lessons}+`, v: 'lessons' },
            { k: String(platform.labs), v: 'hands-on labs' },
            { k: String(platform.ctf), v: 'CTF challenges' }
          ].map((s) => (
            <div key={s.v} className="text-center">
              <div className="font-mono text-2xl font-bold text-acid">{s.k}</div>
              <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-dim">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-mono text-sm uppercase tracking-[0.3em] text-cyan">The platform</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <BookOpen size={20} />,
              title: 'Structured curriculum',
              body: 'Level 0 to Level 9: Android internals, APK analysis, static & dynamic analysis, network, vulnerabilities, OWASP MAS, Frida, reverse engineering and reporting. Lessons follow a consistent format with knowledge checks.'
            },
            {
              icon: <FlaskConical size={20} />,
              title: 'Hands-on labs',
              body: 'Guided scenarios against intentionally vulnerable local training apps — exposed components, insecure storage, weak crypto, traffic interception — with hints, solutions and remediation guidance.'
            },
            {
              icon: <Trophy size={20} />,
              title: 'CTF mode',
              body: 'Eight flag-hunting challenges with progressive hints, scoring and full write-ups unlocked on solve. Your progress, streaks and XP are tracked locally.'
            },
            {
              icon: <TerminalSquare size={20} />,
              title: 'Cheat sheets & glossary',
              body: 'Copy-friendly command references for adb, JADX, apktool, Frida, Objection, Burp and more, plus a 35-term Android security glossary.'
            },
            {
              icon: <Wrench size={20} />,
              title: 'Toolkit reference',
              body: 'Every tool with purpose, installation, common commands and links back to the lessons that use it — curated for what is current, with honest status notes.'
            },
            {
              icon: <ShieldCheck size={20} />,
              title: 'OWASP MAS foundation',
              body: 'The curriculum is mapped to MASVS, MASTG and MASWE, with a dedicated module on the OWASP Mobile Application Security family.'
            }
          ].map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-3 inline-flex rounded-lg border border-line bg-panel2 p-2.5 text-acid">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Academy journeys — one ten-level ladder per academy */}
      <div className="border-y border-line bg-base2/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center font-mono text-sm uppercase tracking-[0.3em] text-cyan">The journeys</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted">
            Each academy climbs its own ten-level ladder — from first principles to professional practice.
          </p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {ACADEMIES.map((a) => (
              <div key={a.id} className={`card flex flex-col p-5 ${a.themeClass}`}>
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex rounded-lg border border-line bg-panel2 p-2 text-acid">
                    <AcademyIcon id={a.id} size={16} />
                  </div>
                  <div className="font-mono text-[12px] font-bold leading-tight tracking-wide">
                    {a.brandLines[0]} <span className="text-gradient">{a.brandLines[1]}</span>
                  </div>
                </div>
                <div className="mt-4 flex-1 space-y-1.5">
                  {Object.entries(a.meta.levelMeta).map(([lvl, meta]) => (
                    <div key={lvl} className="flex items-center gap-3 rounded-lg border border-line/70 bg-panel/50 px-3 py-2">
                      <span className="font-mono text-[10px] text-acid">L{lvl}</span>
                      <span className="text-[13px] font-medium">{meta.name}</span>
                      <span className="ml-auto hidden text-[10px] text-dim xl:block">{meta.blurb}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link to={`${a.base}/roadmap`} className="btn-ghost btn-sm w-full justify-center">
                    <RouteIcon size={13} /> View full roadmap
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="card border-violet/30 bg-violet/5 p-5">
          <div className="flex items-start gap-3">
            <Scale size={20} className="mt-0.5 shrink-0 text-violet" />
            <div className="text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">Authorized use only.</span> The academies on this platform teach
              security assessment for defensive and authorized testing purposes. All labs are designed around
              intentionally vulnerable local training applications. Never test applications, devices or systems you do
              not own or have explicit written permission to assess.
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <Logo size={28} />
          <div className="font-mono text-[11px] text-dim">
            CYBER ACADEMY · ANDROID · NETWORK · iOS — independent academies, one local-first engine · original
            curricula synthesized from public official sources
          </div>
        </div>
      </div>
    </div>
  );
}
