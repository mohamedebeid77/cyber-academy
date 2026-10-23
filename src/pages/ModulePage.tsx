import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ListChecks } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAcademy } from '../context/AcademyContext';
import { Breadcrumb, Card, ProgressBar, DifficultyPill, PageHeader } from '../components/ui';
import { classNames, pct } from '../utils/format';

function Checklist({ moduleId }: { moduleId: string }) {
  const { modules, data, setChecklistItem, pushToast, academy } = useAcademy();
  const m = modules.find((x) => x.id === moduleId);
  if (!m?.checklist || m.checklist.length === 0) return null;
  const doneCount = m.checklist.filter((_, i) => data.progress.checklist[`${moduleId}:${i}`]).length;

  return (
    <Card className="mb-6 !border-cyan/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={18} className="text-cyan" />
          <h3 className="font-semibold">{academy.strings.checklistTitle}</h3>
        </div>
        <span className="font-mono text-xs text-dim">
          {doneCount}/{m.checklist.length}
        </span>
      </div>
      <ProgressBar value={pct(doneCount, m.checklist.length)} color="cyan" />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {m.checklist.map((item, i) => {
          const key = `${moduleId}:${i}`;
          const checked = !!data.progress.checklist[key];
          return (
            <button
              key={key}
              className={classNames(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                checked ? 'border-acid/40 bg-acid/5' : 'border-line bg-base2/50 hover:border-cyan/40'
              )}
              onClick={() => {
                setChecklistItem(key, !checked);
                if (!checked) pushToast({ title: `Checklist: ${item.item}`, body: '+5 XP — marked installed', icon: 'xp' });
              }}
            >
              <span
                className={classNames(
                  'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border font-mono text-[10px]',
                  checked ? 'border-acid bg-acid/20 text-acid' : 'border-line text-transparent'
                )}
                style={{ width: 18, height: 18 }}
              >
                ✓
              </span>
              <span>
                <span className={classNames('block font-mono text-[13px] font-semibold', checked ? 'text-acid' : 'text-ink')}>
                  {item.item}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{item.why}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function ModulePage() {
  const { moduleId } = useParams();
  const { modules, isLessonComplete, levelMeta, base } = useAcademy();
  const m = modules.find((x) => x.id === moduleId);
  if (!m) return <Navigate to={`${base}/path`} replace />;
  const completed = m.lessons.filter((l) => isLessonComplete(l.id)).length;
  const completion = pct(completed, m.lessons.length);
  const meta = levelMeta[m.level];

  const flatIndex = modules.flatMap((x) => x.lessons.map((l) => l.id));

  return (
    <div className="animate-fade-up">
      <Breadcrumb items={[{ label: 'Learning Path', to: `${base}/path` }, { label: m.title }]} />
      <PageHeader
        kicker={meta ? `Level ${m.level} · ${meta.name}` : `Module ${m.id}`}
        title={m.title}
        sub={m.description}
        actions={
          <div className="flex items-center gap-3">
            <ProgressRingInline value={completion} />
            <span className="font-mono text-xs text-dim">
              {completed}/{m.lessons.length} lessons
            </span>
          </div>
        }
      />

      {m.checklist && m.checklist.length > 0 && <Checklist moduleId={m.id} />}

      <Card className="mb-6">
        <div className="section-title mb-2">Module outcomes</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted marker:text-acid/70">
          {m.outcomes.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      </Card>

      <div className="space-y-2.5">
        {m.lessons.map((l, i) => {
          const done = isLessonComplete(l.id);
          const globalIdx = flatIndex.indexOf(l.id);
          return (
            <Link
              key={l.id}
              to={`${base}/lesson/${l.id}`}
              className={classNames(
                'card card-hover flex items-center gap-4 p-4',
                done && '!border-acid/30'
              )}
            >
              <span
                className={classNames(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-xs',
                  done ? 'border-acid/60 bg-acid/10 text-acid' : 'border-line bg-panel2 text-dim'
                )}
              >
                {done ? <CheckCircle2 size={17} /> : String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <div className={classNames('truncate font-semibold', done && 'text-muted line-through decoration-acid/40')}>
                  {l.title}
                </div>
                <div className="mt-1 flex items-center gap-2.5">
                  <DifficultyPill level={l.difficulty} />
                  <span className="font-mono text-[11px] text-dim">{l.minutes} min</span>
                  {l.prerequisites.length > 0 && (
                    <span className="hidden font-mono text-[11px] text-dim sm:inline">
                      prereq: {l.prerequisites.length} lesson{l.prerequisites.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <span className="hidden font-mono text-[10px] text-line sm:block">#{globalIdx + 1}</span>
              <ArrowRight size={16} className="shrink-0 text-dim" />
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link to={`${base}/path`} className="btn-ghost btn-sm">
          <ArrowLeft size={14} /> All modules
        </Link>
        {m.lessons.length > 0 && (
          <Link to={`${base}/lesson/${m.lessons[0].id}`} className="btn-primary btn-sm">
            <BookOpen size={14} /> Start first lesson
          </Link>
        )}
      </div>
    </div>
  );
}

function ProgressRingInline({ value }: { value: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-14 w-14">
        <svg viewBox="0 0 44 44" className="h-14 w-14 -rotate-90">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#1b2740" strokeWidth="4" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke="#22e58c"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 18}
            strokeDashoffset={2 * Math.PI * 18 * (1 - value / 100)}
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold">{value}%</span>
      </div>
    </div>
  );
}
