import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Compass, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, PageHeader, ProgressBar } from '../components/ui';
import { pct } from '../utils/format';
import type { Module } from '../types';

export default function MyLearningPath() {
  const { modules, data, isLessonComplete, lessonMap, base, levelMeta } = useAcademy();

  const moduleDone = (m: Module) => m.lessons.length > 0 && m.lessons.every((l) => isLessonComplete(l.id));
  const moduleCompletionPct = (m: Module) =>
    pct(m.lessons.filter((l) => isLessonComplete(l.id)).length, m.lessons.length);

  // Deterministic recommendation: walk the curriculum in order, find the first
  // incomplete module; check its readiness; factor quiz performance on the last
  // completed module.
  let targetIdx = modules.findIndex((m) => !moduleDone(m));
  if (targetIdx === -1) targetIdx = 0;
  const target = modules[targetIdx];
  const targetLesson = target.lessons.find((l) => !isLessonComplete(l.id)) ?? target.lessons[0];

  const lastCompletedModule = [...modules.slice(0, targetIdx)].reverse().find((m) => m.lessons.some((l) => isLessonComplete(l.id)));
  let quizReview: Module | null = null;
  if (lastCompletedModule) {
    const quizzes = lastCompletedModule.lessons
      .map((l) => data.progress.lessons[l.id]?.quiz)
      .filter(Boolean);
    if (quizzes.length >= 2) {
      const avg = quizzes.reduce((a, q) => a + (q ? q.score / q.total : 0), 0) / quizzes.length;
      if (avg < 0.7) quizReview = lastCompletedModule;
    }
  }

  const prereqLessons = (targetLesson?.prerequisites ?? [])
    .map((p) => lessonMap.get(p))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .filter((e) => !isLessonComplete(e.lesson.id));

  const queue = modules
    .flatMap((m) => m.lessons.filter((l) => !isLessonComplete(l.id)).map((l) => ({ lesson: l, module: m })))
    .slice(0, 5);

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="deterministic recommendations"
        title="My Learning Path"
        sub="Computed from your completed lessons, quiz scores and prerequisites — no magic, just rules you can inspect below."
        actions={
          targetLesson ? (
            <Link to={`${base}/lesson/${targetLesson.id}`} className="btn-solid">
              <Compass size={15} /> Go to recommended lesson
            </Link>
          ) : undefined
        }
      />

      <Card className="!border-acid/40">
        <div className="section-title mb-2">Current status</div>
        {prereqLessons.length === 0 && !quizReview ? (
          <>
            {moduleDone(target) ? (
              <p className="text-lg">
                🎓 <strong>Congratulations — you have completed the entire academy curriculum.</strong>
              </p>
            ) : (
              <>
                <p className="text-lg">
                  You have completed <strong>{targetIdx}</strong> module{targetIdx === 1 ? '' : 's'}
                  {targetIdx > 0 && (
                    <>
                      {' '}— through <strong className="text-acid">{modules[targetIdx - 1].title}</strong>
                    </>
                  )}
                  .
                </p>
                <p className="mt-2 text-muted">
                  Recommended next: <strong className="text-cyan">{target.title}</strong>
                  {targetLesson && (
                    <>
                      {' '}→ lesson <strong>{targetLesson.title}</strong>
                    </>
                  )}
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-lg">
              Before continuing with <strong className="text-cyan">{target.title}</strong>, the rules recommend:
            </p>
            <ul className="mt-3 space-y-2">
              {quizReview && (
                <li className="flex items-start gap-2 text-sm text-muted">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warn" />
                  <span>
                    Review <strong className="text-warn">{quizReview.title}</strong> — your knowledge-check average
                    there is below 70%. Re-read the lessons, then retake their quizzes.
                  </span>
                </li>
              )}
              {prereqLessons.map((e) => (
                <li key={e.lesson.id} className="flex items-start gap-2 text-sm text-muted">
                  <Circle size={14} className="mt-1 shrink-0 text-cyan" />
                  <span>
                    Finish prerequisite lesson{' '}
                    <Link to={`${base}/lesson/${e.lesson.id}`} className="text-cyan hover:underline">
                      {e.lesson.title}
                    </Link>{' '}
                    ({e.module.title})
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="section-title mb-3">Queue — your next 5 lessons</div>
          <div className="space-y-2">
            {queue.map((q, i) => (
              <Link
                key={q.lesson.id}
                to={`${base}/lesson/${q.lesson.id}`}
                className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-cyan/40"
              >
                <span className="font-mono text-xs text-acid">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{q.lesson.title}</span>
                  <span className="block truncate text-[11px] text-dim">{q.module.title}</span>
                </span>
                <ArrowRight size={14} className="shrink-0 text-dim" />
              </Link>
            ))}
            {queue.length === 0 && <p className="text-sm text-muted">Nothing left — curriculum complete.</p>}
          </div>
        </Card>

        <Card>
          <div className="section-title mb-3">Module completion map</div>
          <div className="space-y-2.5">
            {modules.map((m, i) => {
              const done = moduleDone(m);
              const c = moduleCompletionPct(m);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <span className={done ? 'text-acid' : 'text-dim'}>
                    {done ? <CheckCircle2 size={15} /> : <RefreshCw size={13} className={i === targetIdx ? 'text-cyan' : ''} />}
                  </span>
                  <Link to={`${base}/path/module/${m.id}`} className="min-w-0 flex-1 truncate text-sm text-muted hover:text-ink">
                    {m.title}
                  </Link>
                  <div className="w-24">
                    <ProgressBar value={c} color={done ? 'acid' : c > 0 ? 'cyan' : 'blue'} />
                  </div>
                  <span className="w-10 text-right font-mono text-[11px] text-dim">{c}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="section-title mb-2">How this works</div>
        <p className="text-sm leading-relaxed text-muted">
          The recommendation engine walks modules in curriculum order and stops at the first one without all lessons
          completed. It then checks the recommended lesson's prerequisites and your recent knowledge-check scores
          (below 70% average triggers a review recommendation). Modules are grouped by level —{' '}
          {Object.values(levelMeta)
            .slice(0, 3)
            .map((l) => l.name)
            .join(' → ')}
          … — and later levels assume earlier ones.
        </p>
      </Card>
    </div>
  );
}
