import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Flame,
  Clock,
  FlaskConical,
  Trophy,
  BookOpen,
  Zap,
  Map as MapIcon,
  Wrench,
  Award,
  Activity,
  CheckCircle2,
  ChevronRight,
  Apple
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, ProgressBar, ProgressRing, StatCard, DifficultyPill } from '../components/ui';
import { formatDuration, formatMinutes, pct } from '../utils/format';

// Dedicated academy landing/dashboard for the iOS academy — layered-platform
// hero motif (rounded strata), live progress, recommended next lesson,
// roadmap strip, recent activity and achievements.

function IOSHeroArt() {
  // Subtle static layered-strata motif — rounded rectangles suggesting the
  // iOS platform stack (hardware → kernel → frameworks → app). No animation.
  const layers = [
    { y: 250, w: 760, h: 34, o: 0.10 },
    { y: 205, w: 660, h: 34, o: 0.13 },
    { y: 160, w: 560, h: 34, o: 0.16 },
    { y: 115, w: 460, h: 34, o: 0.20 },
    { y: 70, w: 360, h: 34, o: 0.26 }
  ];
  const dots = [
    { x: 130, y: 87 }, { x: 300, y: 132 }, { x: 470, y: 87 }, { x: 640, y: 132 },
    { x: 210, y: 222 }, { x: 400, y: 177 }, { x: 590, y: 222 }, { x: 740, y: 267 },
    { x: 110, y: 267 }, { x: 330, y: 267 }
  ];
  return (
    <svg viewBox="0 0 920 320" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="ioshero-glow" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="rgb(var(--acc-rgb))" stopOpacity="0.10" />
          <stop offset="100%" stopColor="rgb(var(--acc-rgb))" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="920" height="320" fill="url(#ioshero-glow)" />
      {layers.map((l, i) => (
        <rect
          key={i}
          x={(920 - l.w) / 2}
          y={l.y}
          width={l.w}
          height={l.h}
          rx={10}
          fill="rgb(var(--acc-rgb))"
          fillOpacity={l.o}
        />
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r={i % 3 === 0 ? 3.5 : 2} fill="rgb(var(--acc-rgb))" fillOpacity={i % 3 === 0 ? 0.7 : 0.35} />
          {i % 3 === 0 && <circle cx={d.x} cy={d.y} r={8} fill="none" stroke="rgb(var(--acc-rgb))" strokeOpacity={0.2} />}
        </g>
      ))}
    </svg>
  );
}

export default function IOSHome() {
  const { academy, stats, continueEntry, nextUp, modules, moduleCompletion, data, levelMeta, roadmapStages, tools, badges } =
    useAcademy();
  const base = academy.base;

  const overall = pct(stats.completedLessons, stats.totalLessons);
  const currentModule = continueEntry?.module ?? modules[0];
  const nextModule = nextUp?.module;
  const totalMinutes = modules.reduce((a, m) => a + m.lessons.reduce((b, l) => b + l.minutes, 0), 0);
  const labCount = academy.content.labs.length;
  const ctfCount = academy.content.ctf.length;
  const visited = Object.values(data.progress.lessons).filter((l) => l.visited).length;
  const recentLessons = Object.entries(data.progress.lessons)
    .filter(([, lp]) => lp.lastVisit)
    .sort((a, b) => (b[1].lastVisit ?? 0) - (a[1].lastVisit ?? 0))
    .slice(0, 4)
    .map(([id]) => {
      for (const m of modules) {
        const l = m.lessons.find((x) => x.id === id);
        if (l) return { lesson: l, module: m };
      }
      return null;
    })
    .filter(Boolean) as { lesson: { id: string; title: string; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }; module: { id: string; title: string } }[];

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <div className="card relative overflow-hidden !p-0">
        <div className="absolute inset-0 opacity-90">
          <IOSHeroArt />
        </div>
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-acid">CYBER ACADEMY · {academy.brandLines[0]} {academy.brandLines[1]}</div>
            <h1 className="mt-3 font-mono text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              iOS APPLICATION <span className="text-gradient">PENTESTING</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
              {academy.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
              <span className="chip">BEGINNER → ADVANCED</span>
              <span className="chip">{modules.length} MODULES</span>
              <span className="chip">{stats.totalLessons} LESSONS</span>
              <span className="chip">{labCount} LABS</span>
              <span className="chip">{ctfCount} CTF CHALLENGES</span>
              <span className="chip">≈ {formatMinutes(totalMinutes)} OF STUDY</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {continueEntry ? (
                <Link to={`${base}/lesson/${continueEntry.lesson.id}`} className="btn-solid !px-6 !py-3">
                  <Play size={16} /> CONTINUE LEARNING
                </Link>
              ) : (
                <Link to={`${base}/path`} className="btn-solid !px-6 !py-3">
                  <Play size={16} /> START LEARNING
                </Link>
              )}
              <Link to={`${base}/roadmap`} className="btn-ghost !px-5 !py-3">
                <MapIcon size={16} /> SKILL ROADMAP
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden shrink-0 lg:block">
            <ProgressRing value={overall} size={132} stroke={7} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold">{overall}%</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-dim">overall</span>
              <span className="mt-1 font-mono text-[10px] text-dim">
                {stats.completedLessons}/{stats.totalLessons} lessons
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current module + recommended next */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="section-title">Current module</div>
            <span className="font-mono text-xs text-dim">{currentModule ? moduleCompletion(currentModule.id) : 0}% complete</span>
          </div>
          {currentModule ? (
            <>
              <div className="font-mono text-xs text-cyan">{currentModule.id.toUpperCase()} · LEVEL {currentModule.level} · {levelMeta[currentModule.level]?.name}</div>
              <h2 className="mt-1 text-xl font-bold">{currentModule.title}</h2>
              <p className="mt-1.5 text-sm text-muted">{currentModule.description}</p>
              <ProgressBar value={moduleCompletion(currentModule.id)} className="mt-4" />
              <div className="mt-4 flex flex-wrap gap-2">
                {continueEntry && (
                  <Link to={`${base}/lesson/${continueEntry.lesson.id}`} className="btn-primary btn-sm">
                    Resume: {continueEntry.lesson.title.slice(0, 42)}{continueEntry.lesson.title.length > 42 ? '…' : ''} <ArrowRight size={13} />
                  </Link>
                )}
                <Link to={`${base}/path/module/${currentModule.id}`} className="btn-ghost btn-sm">
                  Module overview
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Curriculum is loading…</p>
          )}
        </Card>

        <Card>
          <div className="section-title mb-3">Recommended next lesson</div>
          {nextUp ? (
            <>
              <div className="font-mono text-xs text-cyan">{nextUp.module.id.toUpperCase()}</div>
              <h3 className="mt-1 font-semibold leading-snug">{nextUp.lesson.title}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <DifficultyPill level={nextUp.lesson.difficulty} />
                <span className="font-mono text-xs text-dim">{nextUp.lesson.minutes} min</span>
              </div>
              <Link to={`${base}/lesson/${nextUp.lesson.id}`} className="btn-ghost btn-sm mt-4">
                Open lesson <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted">Nothing left — the whole curriculum is complete. 🎉</p>
          )}
        </Card>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard label="Progress" value={`${overall}%`} icon={<Activity size={18} />} sub={`${visited} visited`} />
        <StatCard label="Streak" value={`${stats.streak}d`} icon={<Flame size={18} />} />
        <StatCard label="Study time" value={formatDuration(stats.studyTotal)} icon={<Clock size={18} />} />
        <StatCard label="Labs" value={`${stats.labsSolved}/${labCount}`} icon={<FlaskConical size={18} />} />
        <StatCard label="Flags" value={`${stats.ctfSolved}/${ctfCount}`} icon={<Trophy size={18} />} />
        <StatCard label="XP" value={stats.xp} icon={<Zap size={18} />} sub={`LV ${stats.level} · ${stats.levelName}`} />
      </div>

      {/* Roadmap strip + activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="section-title">Skill roadmap</div>
            <Link to={`${base}/roadmap`} className="font-mono text-xs text-cyan hover:underline">
              full roadmap →
            </Link>
          </div>
          <div className="space-y-2.5">
            {roadmapStages.slice(0, 6).map((stage, i) => {
              const stageModules = stage.moduleIds
                .map((id) => modules.find((m) => m.id === id))
                .filter(Boolean) as typeof modules;
              const avg = stageModules.length
                ? Math.round(stageModules.reduce((a, m) => a + moduleCompletion(m.id), 0) / stageModules.length)
                : 0;
              return (
                <div key={stage.name} className="flex items-center gap-3">
                  <span
                    className={
                      avg === 100
                        ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-acid/60 bg-acid/10 font-mono text-[10px] font-bold text-acid'
                        : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-panel2 font-mono text-[10px] text-dim'
                    }
                  >
                    {avg === 100 ? <CheckCircle2 size={13} /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium">{stage.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-dim">{avg}%</span>
                    </div>
                    <ProgressBar value={avg} className="mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="section-title mb-3">Recent activity</div>
          {recentLessons.length === 0 ? (
            <p className="text-sm text-muted">No lessons visited yet. Your history will appear here as you study.</p>
          ) : (
            <div className="space-y-2">
              {recentLessons.map((e) => (
                <Link
                  key={e.lesson.id}
                  to={`${base}/lesson/${e.lesson.id}`}
                  className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-sm transition-colors hover:border-cyan/40"
                >
                  <ChevronRight size={13} className="shrink-0 text-dim" />
                  <span className="min-w-0 flex-1 truncate">{e.lesson.title}</span>
                  <span className="shrink-0 font-mono text-[9px] text-dim">{e.module.id.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          )}
          <div className="section-title mb-2 mt-5">Tools learned</div>
          <div className="flex flex-wrap gap-1.5">
            {tools.slice(0, 8).map((t) => (
              <Link key={t.id} to={`${base}/toolkit/${t.id}`} className="chip !text-[10px] hover:!border-acid/40">
                <Wrench size={9} /> {t.name}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="section-title flex items-center gap-2">
            <Award size={14} className="text-acid" /> Achievements ({data.progress.badges.length}/{badges.length})
          </div>
          <Link to={`${base}/progress`} className="font-mono text-xs text-cyan hover:underline">
            all progress →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((b) => {
            const earned = data.progress.badges.includes(b.id);
            return (
              <span
                key={b.id}
                title={`${b.name} — ${b.description}`}
                className={earned ? 'chip !border-acid/50 !text-acid' : 'chip opacity-35 grayscale'}
              >
                {earned ? '★' : '☆'} {b.name}
              </span>
            );
          })}
        </div>
      </Card>

      {/* Completed lessons */}
      <Card className="mt-4">
        <div className="section-title mb-3">Completed lessons ({stats.completedLessons})</div>
        {stats.completedLessons === 0 ? (
          <p className="text-sm text-muted">Nothing completed yet — start with Module {modules[0]?.id.toUpperCase() ?? 'i01'} and mark lessons complete as you go.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {modules
              .flatMap((m) => m.lessons.filter((l) => data.progress.lessons[l.id]?.completed).map((l) => ({ l, m })))
              .slice(-6)
              .reverse()
              .map(({ l, m }) => (
                <Link
                  key={l.id}
                  to={`${base}/lesson/${l.id}`}
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[13px] transition-colors hover:border-acid/40"
                >
                  <CheckCircle2 size={14} className="shrink-0 text-acid" />
                  <span className="min-w-0 flex-1 truncate text-muted">{l.title}</span>
                  <span className="shrink-0 font-mono text-[9px] text-dim">{m.id.toUpperCase()}</span>
                </Link>
              ))}
          </div>
        )}
      </Card>

      {/* Legal footer */}
      <Card className="mt-4 !border-violet/30 bg-violet/5">
        <p className="text-sm leading-relaxed text-muted">
          <span className="font-semibold text-ink">Authorized testing only.</span> Every lab and challenge in this
          academy is designed for local, intentionally vulnerable training applications or fictional scenarios on
          devices you own. Never analyze, instrument or test applications, devices or systems you do not own or do not
          have explicit written permission to assess.
        </p>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-dim">
          <Apple size={11} /> iOS, iPhone, iPad and Xcode are trademarks of Apple Inc. — this independent educational
          curriculum is not affiliated with or endorsed by Apple.
        </p>
      </Card>
    </div>
  );
}
