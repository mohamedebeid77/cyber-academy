import { Link } from 'react-router-dom';
import { Award, BarChart3, Flame, Lock, Zap } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, PageHeader, ProgressBar, ProgressRing, StatCard } from '../components/ui';
import { XP_PER_LEVEL } from '../data/meta';
import type { SkillNode } from '../data/meta';
import { classNames, formatDuration, localDate, pct } from '../utils/format';

function ActivityChart() {
  const { data } = useAcademy();
  const days: { date: string; label: string; seconds: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({ date: localDate(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), seconds: data.progress.studyByDay[localDate(d)] ?? 0 });
  }
  const max = Math.max(60, ...days.map((d) => d.seconds));
  return (
    <div className="flex h-32 items-end gap-1.5">
      {days.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${formatDuration(d.seconds)}`}>
          <div className="flex w-full flex-1 items-end">
            <div
              className={classNames('w-full rounded-t transition-all', d.seconds > 0 ? 'bg-gradient-to-t from-acid/40 to-acid' : 'bg-line/40')}
              style={{ height: `${Math.max(3, (d.seconds / max) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[9px] text-dim">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function SkillTree() {
  const { modules, isLessonComplete, moduleCompletion, skillTree } = useAcademy();
  const unlockedSet = new Set<string>();
  let progressMade = true;
  while (progressMade) {
    progressMade = false;
    for (const node of skillTree) {
      if (unlockedSet.has(node.id)) continue;
      const reqsOk = node.requires.every((r) => unlockedSet.has(r));
      const modulesOk = node.moduleIds.every((mid) => {
        const m = modules.find((x) => x.id === mid);
        return m && m.lessons.length > 0 && m.lessons.every((l) => isLessonComplete(l.id));
      });
      if (reqsOk && modulesOk) {
        unlockedSet.add(node.id);
        progressMade = true;
      }
    }
  }
  const depthCache = new Map<string, number>();
  const depth = (id: string): number => {
    if (depthCache.has(id)) return depthCache.get(id)!;
    const node = skillTree.find((n) => n.id === id)!;
    const d = node.requires.length === 0 ? 0 : 1 + Math.max(...node.requires.map(depth));
    depthCache.set(id, d);
    return d;
  };
  const maxDepth = Math.max(...skillTree.map((n) => depth(n.id)));
  const tiers: { node: SkillNode; depth: number }[][] = [];
  for (let d = 0; d <= maxDepth; d++) {
    tiers.push(skillTree.filter((n) => depth(n.id) === d).map((node) => ({ node, depth: d })));
  }

  return (
    <div className="space-y-6">
      {tiers.map((tier, ti) => (
        <div key={ti} className="relative">
          {ti > 0 && <div className="absolute -top-3 left-1/2 h-3 w-px bg-line" />}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tier.map(({ node }) => {
              const unlocked = unlockedSet.has(node.id);
              const progress = Math.round(
                node.moduleIds.reduce((a, mid) => a + moduleCompletion(mid), 0) / Math.max(1, node.moduleIds.length)
              );
              const reqsMet = node.requires.every((r) => unlockedSet.has(r));
              return (
                <div
                  key={node.id}
                  className={classNames(
                    'card !p-4 transition-all',
                    unlocked ? '!border-acid/50 shadow-glow' : reqsMet ? '' : 'opacity-55'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={classNames('text-sm font-bold', unlocked && 'text-acid')}>{node.name}</h4>
                    {unlocked ? <span className="text-acid">✓</span> : <Lock size={13} className="text-dim" />}
                  </div>
                  <p className="mt-1 text-xs text-muted">{node.description}</p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <ProgressBar value={progress} color={unlocked ? 'acid' : progress > 0 ? 'cyan' : 'blue'} />
                    <span className="font-mono text-[10px] text-dim">{progress}%</span>
                  </div>
                  {!unlocked && !reqsMet && (
                    <div className="mt-2 font-mono text-[10px] text-warn">
                      requires: {node.requires.map((r) => skillTree.find((s) => s.id === r)?.name).filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const { stats, data, modules, moduleCompletion, lessonMap, badges, base } = useAcademy();
  const quizRows = modules.flatMap((m) =>
    m.lessons
      .filter((l) => data.progress.lessons[l.id]?.quiz)
      .map((l) => ({ lesson: l, module: m, quiz: data.progress.lessons[l.id].quiz! }))
  );

  return (
    <div className="animate-fade-up">
      <PageHeader kicker="analytics" title="Progress & Statistics" sub="Your learning analytics, badges and skill tree. All computed locally." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons completed" value={`${stats.completedLessons}/${stats.totalLessons}`} sub={`${pct(stats.completedLessons, stats.totalLessons)}% of curriculum`} icon={<BarChart3 size={18} />} />
        <StatCard label="Modules complete" value={`${stats.completedModules}/${stats.totalModules}`} icon={<Award size={18} />} />
        <StatCard label="Streak" value={`${stats.streak} days`} sub={`${data.progress.activityDays.length} active days total`} icon={<Flame size={18} />} />
        <StatCard label="Study time" value={formatDuration(stats.studyTotal)} sub={`${formatDuration(stats.studyToday)} today`} icon={<Zap size={18} />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-5">
          <ProgressRing value={(stats.xpIntoLevel / XP_PER_LEVEL) * 100} size={84} stroke={6} />
          <div>
            <div className="section-title">Level {stats.level}</div>
            <div className="text-lg font-bold">{stats.levelName}</div>
            <div className="mt-1 font-mono text-xs text-dim">
              {stats.xp} XP total · {stats.xpToNext} XP to next level
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="section-title mb-3">Study activity — last 14 days</div>
          <ActivityChart />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="section-title mb-3">Knowledge-check scores</div>
          {quizRows.length === 0 ? (
            <p className="text-sm text-muted">No quizzes taken yet. Scores appear here after you complete knowledge checks.</p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {quizRows.map(({ lesson, module, quiz }) => (
                <div key={lesson.id} className="flex items-center gap-3">
                  <Link to={`${base}/lesson/${lesson.id}`} className="min-w-0 flex-1 truncate text-sm hover:text-cyan">
                    {lesson.title}
                  </Link>
                  <span className="font-mono text-[10px] text-dim">{module.id.toUpperCase()}</span>
                  <span className={classNames('font-mono text-sm font-bold', quiz.score / quiz.total >= 0.7 ? 'text-acid' : 'text-warn')}>
                    {quiz.score}/{quiz.total}
                  </span>
                </div>
              ))}
            </div>
          )}
          {stats.quizAvg !== null && (
            <div className="mt-3 border-t border-line pt-3 font-mono text-xs text-dim">
              Average score: <span className="text-acid">{stats.quizAvg}%</span>
            </div>
          )}
        </Card>

        <Card>
          <div className="section-title mb-3">Module progress</div>
          <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
            {modules.map((m) => (
              <Link key={m.id} to={`${base}/path/module/${m.id}`} className="block">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="truncate text-muted hover:text-ink">{m.title}</span>
                  <span className="font-mono text-dim">{moduleCompletion(m.id)}%</span>
                </div>
                <ProgressBar value={moduleCompletion(m.id)} />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="section-title mb-3">Badges ({data.progress.badges.length}/{badges.length})</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => {
            const earned = data.progress.badges.includes(b.id);
            return (
              <div key={b.id} className={classNames('flex items-start gap-3 rounded-lg border p-3', earned ? 'border-acid/40 bg-acid/5' : 'border-line opacity-45')}>
                <span className={classNames('text-xl', earned ? 'text-acid' : 'text-dim grayscale')}>{earned ? '★' : '☆'}</span>
                <div>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div className="text-xs text-muted">{b.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-8">
        <div className="section-title mb-1">Skill tree</div>
        <p className="mb-4 text-sm text-muted">
          Skills unlock when their modules are complete and their prerequisites are met — a visual map of how far you
          have come.
        </p>
        <SkillTree />
      </div>
    </div>
  );
}
