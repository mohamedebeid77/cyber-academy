import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Lock, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, DifficultyPill, EmptyState, PageHeader } from '../components/ui';
import { classNames, pct } from '../utils/format';
import type { Difficulty } from '../types';

const DIFFS: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function useMergedLabs() {
  const { labs } = useAcademy();
  return useMemo(() => labs, [labs]);
}

export default function LabsPage() {
  const labs = useMergedLabs();
  const { data, base } = useAcademy();
  const [filter, setFilter] = useState<Difficulty | 'All'>('All');
  const shown = filter === 'All' ? labs : labs.filter((l) => l.difficulty === filter);
  const solved = labs.filter((l) => data.progress.labs[l.id]?.solved).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="practice"
        title="Labs"
        sub="Guided hands-on scenarios against intentionally vulnerable local training apps. Each lab includes hints, solution steps and remediation guidance."
        actions={
          <div className="chip !text-xs">
            <FlaskConical size={12} className="text-acid" /> {solved}/{labs.length} solved
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {DIFFS.map((d) => (
          <button
            key={d}
            className={classNames('btn btn-sm', filter === d ? 'btn-primary' : 'btn-ghost')}
            onClick={() => setFilter(d)}
          >
            {d === 'All' ? 'All levels' : d === 'Beginner' ? 'Easy' : d === 'Intermediate' ? 'Medium' : 'Hard'}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<FlaskConical size={26} />} title="No labs at this level" body="Try another difficulty filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((lab) => {
            const lp = data.progress.labs[lab.id];
            const isSolved = !!lp?.solved;
            return (
              <Link key={lab.id} to={`${base}/labs/${lab.id}`} className="card card-hover flex flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <DifficultyPill level={lab.difficulty} />
                  <span className="font-mono text-xs text-dim">{lab.points} pts</span>
                </div>
                <h3 className="flex items-center gap-2 font-semibold">
                  {isSolved ? <CheckCircle2 size={16} className="text-acid" /> : <Lock size={14} className="text-dim" />}
                  {lab.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{lab.scenario}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="font-mono text-[11px] text-dim">
                    {lp?.hints ? `${lp.hints} hint${lp.hints > 1 ? 's' : ''} used` : 'untouched'}
                  </span>
                  <span className={classNames('font-mono text-[11px]', isSolved ? 'text-acid' : 'text-cyan')}>
                    {isSolved ? 'SOLVED' : 'OPEN'} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Card className="mt-6 !border-violet/30 bg-violet/5">
        <p className="text-sm text-muted">
          <strong className="text-ink">Target policy:</strong> labs are designed for local, intentionally vulnerable
          applications (OWASP MASTG crackmes, DIVA, or any training APK you install yourself). Completing labs against
          real third-party applications without authorization is illegal — keep every exercise inside your own
          emulator.
        </p>
      </Card>
    </div>
  );
}
