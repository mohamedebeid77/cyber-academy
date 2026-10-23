import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown, Target, Wrench } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Breadcrumb, Card, ConfirmButton, DifficultyPill, Reveal } from '../components/ui';
import { useMergedLabs } from './LabsPage';
import { classNames } from '../utils/format';

export default function LabDetailPage() {
  const { labId } = useParams();
  const { data, solveLab, revealLabHint, isBookmarked, toggleBookmark, lessonMap, base } = useAcademy();
  const labs = useMergedLabs();
  const lab = labs.find((l) => l.id === labId);
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  if (!lab) return <Navigate to={`${base}/labs`} replace />;
  const lp = data.progress.labs[lab.id] ?? { hints: 0 };
  const isSolved = !!lp.solved;

  const related = lab.relatedLessons.map((id) => lessonMap.get(id)).filter(Boolean);

  return (
    <div className="animate-fade-up">
      <Breadcrumb items={[{ label: 'Labs', to: `${base}/labs` }, { label: lab.title }]} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{lab.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <DifficultyPill level={lab.difficulty} />
            <span className="chip">{lab.points} pts</span>
            {isSolved && <span className="chip !border-acid/50 !text-acid">✓ SOLVED</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`${base}/labs`} className="btn-ghost btn-sm">
            <ArrowLeft size={14} /> All labs
          </Link>
          {!isSolved && (
            <ConfirmButton onConfirm={() => solveLab(lab.id)} confirmLabel="Confirm solved +150 XP">
              <CheckCircle2 size={14} /> Mark lab as solved
            </ConfirmButton>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="!border-cyan/30">
          <div className="section-title mb-2 flex items-center gap-1.5"><Target size={13} /> Scenario</div>
          <p className="text-sm leading-relaxed text-muted">{lab.scenario}</p>
          <div className="section-title mb-2 mt-5">Target</div>
          <p className="text-sm leading-relaxed text-muted">{lab.target}</p>
        </Card>
        <Card className="!border-acid/30">
          <div className="section-title mb-2">Objective</div>
          <p className="text-sm leading-relaxed text-muted">{lab.objective}</p>
          <div className="section-title mb-2 mt-5">Learning objectives</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted marker:text-acid/70">
            {lab.learningObjectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="section-title mb-2 flex items-center gap-1.5"><Wrench size={13} /> Tools</div>
          <div className="flex flex-wrap gap-1.5">
            {lab.tools.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          {related.length > 0 && (
            <>
              <div className="section-title mb-2 mt-5">Related lessons</div>
              <div className="space-y-1">
                {related.map((e) => (
                  <Link key={e!.lesson.id} to={`${base}/lesson/${e!.lesson.id}`} className="block text-[13px] text-muted hover:text-cyan">
                    ↳ {e!.lesson.title}
                  </Link>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Hints */}
      <Card className="mt-4">
        <div className="section-title mb-3">Progressive hints</div>
        <div className="space-y-2">
          {lab.hints.map((h, i) => {
            const revealed = lp.hints > i;
            return (
              <div key={i}>
                {revealed ? (
                  <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm text-muted animate-fade-in">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-warn">Hint {i + 1}</span>
                    <p className="mt-1">{h}</p>
                  </div>
                ) : (
                  <button className="btn-ghost btn-sm" onClick={() => revealLabHint(lab.id)}>
                    <ChevronDown size={13} /> Reveal hint {i + 1} ({lab.hints.length - lp.hints} left)
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Questions + findings */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="section-title mb-3">Check yourself</div>
          <div className="space-y-4">
            {lab.questions.map((q, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-ink">{i + 1}. {q.q}</p>
                <Reveal label="Reveal expected answer">
                  <p className="text-sm text-muted">{q.a}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="section-title mb-3">Expected findings</div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-acid/70">
            {lab.expectedFindings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <div className="section-title mb-2 mt-5">Remediation (what you would tell the developer)</div>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted marker:text-cyan/70">
            {lab.remediation.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Solution */}
      <Card className="mt-4 !border-danger/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-danger">Full solution walk-through</h3>
            <p className="text-xs text-muted">Spoilers — try the lab yourself first. Solving it unaided is worth more than reading.</p>
          </div>
          <button className={classNames('btn btn-sm', showSolution ? 'btn-danger' : 'btn-ghost !border-danger/40 !text-danger')} onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? 'Hide solution' : 'Reveal solution (spoiler)'}
          </button>
        </div>
        {showSolution && (
          <ol className="mt-4 animate-fade-in list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted marker:font-mono marker:text-danger/70">
            {lab.solution.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
        {showAnswers && <div className="mt-2 text-xs text-dim">All question answers shown above.</div>}
        <div className="mt-4 flex justify-end">
          <button className="btn-ghost btn-sm" onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? 'Hide all answers' : 'Show all question answers'}
          </button>
        </div>
      </Card>
    </div>
  );
}
