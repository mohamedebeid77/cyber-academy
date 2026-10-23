import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, DifficultyPill, EmptyState, PageHeader } from '../components/ui';
import { classNames } from '../utils/format';
import type { Difficulty } from '../types';

const DIFFS: (Difficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function useMergedCtf() {
  const { ctfChallenges } = useAcademy();
  return ctfChallenges;
}

export default function CTFPage() {
  const challenges = useMergedCtf();
  const { data, base } = useAcademy();
  const [filter, setFilter] = useState<Difficulty | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');

  const shown = challenges.filter((c) => {
    if (filter !== 'All' && c.difficulty !== filter) return false;
    const solved = !!data.progress.ctf[c.id]?.solved;
    if (statusFilter === 'Solved' && !solved) return false;
    if (statusFilter === 'Unsolved' && solved) return false;
    return true;
  });

  const solvedCount = challenges.filter((c) => data.progress.ctf[c.id]?.solved).length;
  const totalPoints = challenges.filter((c) => data.progress.ctf[c.id]?.solved).reduce((a, c) => a + c.points, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="flag hunting"
        title="CTF Mode"
        sub="Capture-the-flag challenges against local training apps. Flags are verified locally — no network calls."
        actions={
          <div className="flex gap-2">
            <div className="chip !text-xs"><Trophy size={12} className="text-acid" /> {solvedCount}/{challenges.length} solved</div>
            <div className="chip !text-xs">{totalPoints} pts</div>
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {DIFFS.map((d) => (
          <button key={d} className={classNames('btn btn-sm', filter === d ? 'btn-primary' : 'btn-ghost')} onClick={() => setFilter(d)}>
            {d === 'All' ? 'All levels' : d === 'Beginner' ? 'Easy' : d === 'Intermediate' ? 'Medium' : 'Hard'}
          </button>
        ))}
        <span className="mx-1 w-px self-stretch bg-line" />
        {(['All', 'Unsolved', 'Solved'] as const).map((s) => (
          <button key={s} className={classNames('btn btn-sm', statusFilter === s ? 'btn-primary' : 'btn-ghost')} onClick={() => setStatusFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<Trophy size={26} />} title="No challenges match" body="Adjust the filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => {
            const cp = data.progress.ctf[c.id];
            const solved = !!cp?.solved;
            const status = solved ? 'SOLVED' : cp?.attempts || cp?.hints ? 'IN PROGRESS' : 'LOCKED';
            return (
              <Link key={c.id} to={`${base}/ctf/${c.id}`} className="card card-hover flex flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-cyan">{c.code}</span>
                  <span className="font-mono text-xs text-dim">{c.points} pts</span>
                </div>
                <h3 className="flex items-center gap-2 font-semibold">
                  {solved ? <CheckCircle2 size={16} className="text-acid" /> : <Lock size={13} className="text-dim" />}
                  {c.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{c.objective}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <DifficultyPill level={c.difficulty} />
                  <span className={classNames('font-mono text-[10px] uppercase tracking-wider', solved ? 'text-acid' : cp ? 'text-warn' : 'text-dim')}>
                    {status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
