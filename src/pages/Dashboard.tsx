import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Clock,
  FlaskConical,
  Trophy,
  BookOpen,
  Zap,
  Play,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, ProgressBar, ProgressRing, StatCard, DifficultyPill } from '../components/ui';
import { formatDuration, pct } from '../utils/format';

export default function Dashboard() {
  const { stats, continueEntry, nextUp, data, modules, moduleCompletion, badges, levelMeta, base, academy } = useAcademy();
  const name = data.settings.userName || 'Tester';
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Burning the midnight oil' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const overall = pct(stats.completedLessons, stats.totalLessons);
  const currentModule = continueEntry?.module ?? modules[0];
  const nextModule = nextUp?.module;

  const recentActivity = data.progress.activityDays.length;

  return (
    <div className="animate-fade-up">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-title mb-1">{greeting}, {name}.</div>
          <h1 className="text-2xl font-bold tracking-tight">
            Current path: <span className="text-gradient">{academy.strings.pathTitle}</span>
          </h1>
        </div>
        <Link to={`${base}/my-path`} className="btn-ghost btn-sm">
          <Compass size={14} /> My learning path
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Continue learning */}
        <div className="lg:col-span-2">
          <div className="card relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-acid/5 blur-3xl" />
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="section-title mb-2">Continue where you left off</div>
                {continueEntry ? (
                  <>
                    <div className="font-mono text-xs text-cyan">
                      Module {continueEntry.module.id.toUpperCase()} · {continueEntry.module.title}
                    </div>
                    <h2 className="mt-1 truncate text-xl font-bold">{continueEntry.lesson.title}</h2>
                    <div className="mt-3 flex items-center gap-3">
                      <DifficultyPill level={continueEntry.lesson.difficulty} />
                      <span className="font-mono text-xs text-dim">{continueEntry.lesson.minutes} min</span>
                      <span className="font-mono text-xs text-acid">
                        {data.progress.lessons[continueEntry.lesson.id]?.visited ? 'In progress' : 'Not started'}
                        {data.progress.lessons[continueEntry.lesson.id]?.visited ? ' · 33%' : ' · 0%'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link to={`${base}/lesson/${continueEntry.lesson.id}`} className="btn-solid">
                        <Play size={15} /> CONTINUE
                      </Link>
                      <Link to={`${base}/path/module/${continueEntry.module.id}`} className="btn-ghost btn-sm">
                        Module overview
                      </Link>
                    </div>
                  </>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold">All lessons completed 🎉</h2>
                    <p className="mt-2 text-sm text-muted">
                      You have completed every lesson in the academy. Revisit labs, chase remaining flags, or add your
                      own content in the Content Studio.
                    </p>
                    <Link to={`${base}/ctf`} className="btn-primary mt-4">
                      Go to CTF <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
              <div className="relative hidden shrink-0 sm:block">
                <ProgressRing value={overall} size={92} stroke={6} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-lg font-bold">{overall}%</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-dim">overall</span>
                </div>
              </div>
            </div>
          </div>

          {/* Path progress */}
          <Card className="mt-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="section-title">Curriculum progress</div>
              <Link to={`${base}/path`} className="btn-ghost btn-sm">
                <MapIcon size={13} /> Full path
              </Link>
            </div>
            <div className="space-y-3.5">
              {modules.slice(0, 6).map((m) => {
                const c = moduleCompletion(m.id);
                return (
                  <Link key={m.id} to={`${base}/path/module/${m.id}`} className="group block">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate text-muted group-hover:text-ink">
                        <span className="font-mono text-xs text-cyan">{m.id.toUpperCase()}</span> · {m.title}
                      </span>
                      <span className="ml-3 shrink-0 font-mono text-xs text-dim">{c}%</span>
                    </div>
                    <ProgressBar value={c} />
                  </Link>
                );
              })}
              {modules.length > 6 && (
                <div className="pt-1 text-center">
                  <Link to={`${base}/path`} className="font-mono text-xs text-cyan hover:underline">
                    +{modules.length - 6} more modules
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Stats column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Streak" value={`${stats.streak}d`} icon={<Flame size={18} />} sub={recentActivity > 0 ? 'keep it alive' : 'start today'} />
            <StatCard label="Study time" value={formatDuration(stats.studyTotal)} icon={<Clock size={18} />} sub={`${formatDuration(stats.studyToday)} today`} />
            <StatCard label="Labs solved" value={`${stats.labsSolved}`} icon={<FlaskConical size={18} />} />
            <StatCard label="Flags" value={`${stats.ctfSolved}`} icon={<Trophy size={18} />} />
            <StatCard label="Lessons" value={`${stats.completedLessons}/${stats.totalLessons}`} icon={<BookOpen size={18} />} />
            <StatCard label="XP" value={stats.xp} icon={<Zap size={18} />} sub={`level ${stats.level} · ${stats.levelName}`} />
          </div>

          <Card>
            <div className="section-title mb-3">XP progress</div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="font-mono text-sm text-acid">LV {stats.level}</span>
              <span className="font-mono text-xs text-dim">
                {stats.xpIntoLevel}/{XP_PER_LEVEL_CONST} XP
              </span>
            </div>
            <ProgressBar value={(stats.xpIntoLevel / XP_PER_LEVEL_CONST) * 100} color="cyan" />
            <div className="mt-2 text-xs text-dim">
              {stats.xpToNext} XP to level {stats.level + 1}
            </div>
          </Card>

          <Card>
            <div className="section-title mb-3">Badges</div>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => {
                const earned = data.progress.badges.includes(b.id);
                return (
                  <span
                    key={b.id}
                    title={`${b.name} — ${b.description}`}
                    className={
                      earned
                        ? 'chip !border-acid/50 !text-acid'
                        : 'chip opacity-35 grayscale'
                    }
                  >
                    {earned ? '★' : '☆'} {b.name}
                  </span>
                );
              })}
            </div>
          </Card>

          {nextModule && (
            <Card>
              <div className="section-title mb-2">Up next</div>
              <div className="font-mono text-xs text-cyan">
                {levelMeta[nextModule.level]?.name ?? 'Custom'}
              </div>
              <div className="mt-1 font-semibold">{nextModule.title}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{nextModule.description}</p>
              <Link to={`${base}/path/module/${nextModule.id}`} className="btn-ghost btn-sm mt-3">
                Open module <ArrowRight size={13} />
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const XP_PER_LEVEL_CONST = 500;
