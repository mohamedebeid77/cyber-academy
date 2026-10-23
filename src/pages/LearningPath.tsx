import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Lock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, ProgressBar, DifficultyPill, PageHeader } from '../components/ui';
import { classNames } from '../utils/format';
import type { Module } from '../types';

function ModuleCard({ m, unlocked, lockedReason }: { m: Module; unlocked: boolean; lockedReason?: string }) {
  const { moduleCompletion, isLessonComplete, base } = useAcademy();
  const [open, setOpen] = useState(false);
  const completion = moduleCompletion(m.id);
  return (
    <Card className="!p-0 overflow-hidden">
      <button className="flex w-full items-center gap-4 p-4 text-left" onClick={() => setOpen(!open)}>
        <div
          className={classNames(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold',
            completion === 100 ? 'border-acid/60 bg-acid/10 text-acid' : 'border-line bg-panel2 text-cyan'
          )}
        >
          {completion === 100 ? <CheckCircle2 size={18} /> : m.id.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{m.title}</h3>
            {!unlocked && (
              <span title={lockedReason} className="flex items-center gap-1 rounded border border-warn/40 bg-warn/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-warn">
                <Lock size={9} /> prereqs
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{m.description}</p>
          <div className="mt-2 flex items-center gap-3">
            <ProgressBar value={completion} className="max-w-[220px]" />
            <span className="font-mono text-[11px] text-dim">
              {m.lessons.filter((l) => isLessonComplete(l.id)).length}/{m.lessons.length}
            </span>
          </div>
        </div>
        <ChevronDown size={18} className={classNames('shrink-0 text-dim transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="border-t border-line bg-base2/40 px-4 py-3 animate-fade-in">
          {m.outcomes.length > 0 && (
            <div className="mb-3">
              <div className="section-title mb-1.5">You will be able to</div>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted marker:text-acid/60">
                {m.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1">
            {m.lessons.map((l) => {
              const done = isLessonComplete(l.id);
              return (
                <Link
                  key={l.id}
                  to={`${base}/lesson/${l.id}`}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-panel2/70"
                >
                  <span className={done ? 'text-acid' : 'text-dim'}>
                    {done ? <CheckCircle2 size={15} /> : <BookOpen size={15} />}
                  </span>
                  <span className={classNames('flex-1 truncate', done ? 'text-muted line-through decoration-acid/40' : 'text-ink')}>
                    {l.title}
                  </span>
                  <DifficultyPill level={l.difficulty} />
                  <span className="hidden w-16 text-right font-mono text-[11px] text-dim sm:block">{l.minutes} min</span>
                </Link>
              );
            })}
          </div>
          <Link to={`${base}/path/module/${m.id}`} className="btn-ghost btn-sm mt-3">
            Open module page
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function LearningPath() {
  const { modules, isLessonComplete, levelMeta, academy } = useAcademy();
  const base = academy.base;
  const levels = [...new Set(modules.map((m) => m.level))].sort((a, b) => a - b);

  // A module counts as "prereq-satisfied" if the previous module in order is >= 50% done (or it is the first).
  let prevDone = true;
  const unlockStates = modules.map((m, i) => {
    const unlocked = i === 0 || prevDone;
    prevDone = i === 0 ? m.lessons.every((l) => isLessonComplete(l.id)) : prevDone && m.lessons.filter((l) => isLessonComplete(l.id)).length / Math.max(1, m.lessons.length) >= 0.5;
    return unlocked;
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="curriculum"
        title="Learning Path"
        sub={`From absolute fundamentals to advanced testing. Work through modules in order — later modules build on earlier ones. ${academy.tagline}`}
      />
      <div className="space-y-8">
        {levels.map((lvl) => {
          const group = modules.filter((m) => m.level === lvl);
          return (
            <div key={lvl}>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-md border border-acid/40 bg-acid/10 px-2 py-1 font-mono text-[11px] font-bold text-acid">
                  LEVEL {lvl}
                </span>
                <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em]">
                  {levelMeta[lvl]?.name ?? 'Custom Modules'}
                </h2>
                <div className="h-px flex-1 bg-line" />
              </div>
              <div className="space-y-3">
                {group.map((m) => {
                  const idx = modules.findIndex((x) => x.id === m.id);
                  return <ModuleCard key={m.id} m={m} unlocked={unlockStates[idx]} lockedReason="Finish the previous module first (recommended)" />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
