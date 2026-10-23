import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Flag, Lock, ShieldQuestion } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Breadcrumb, Card, DifficultyPill } from '../components/ui';
import { useMergedCtf } from './CTFPage';
import { classNames } from '../utils/format';

export default function CTFDetailPage() {
  const { challengeId } = useParams();
  const { data, revealCtfHint, submitFlag, pushToast, lessonMap, base } = useAcademy();
  const challenges = useMergedCtf();
  const challenge = challenges.find((c) => c.id === challengeId);
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  if (!challenge) return <Navigate to={`${base}/ctf`} replace />;

  const cp = data.progress.ctf[challenge.id] ?? { hints: 0, attempts: 0 };
  const solved = !!cp.solved;

  const related = challenge.relatedLessons.map((id) => lessonMap.get(id)).filter(Boolean);

  return (
    <div className="animate-fade-up">
      <Breadcrumb items={[{ label: 'CTF', to: `${base}/ctf` }, { label: challenge.code }]} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-xs text-cyan">{challenge.code} · {challenge.category}</div>
          <h1 className="text-2xl font-bold tracking-tight">{challenge.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <DifficultyPill level={challenge.difficulty} />
            <span className="chip">{challenge.points} pts</span>
            {solved && <span className="chip !border-acid/50 !text-acid">✓ SOLVED</span>}
          </div>
        </div>
        <Link to={`${base}/ctf`} className="btn-ghost btn-sm">
          <ArrowLeft size={14} /> All challenges
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="!border-acid/30">
          <div className="section-title mb-2">Objective</div>
          <p className="text-sm leading-relaxed text-muted">{challenge.objective}</p>
          <div className="section-title mb-2 mt-5">Target</div>
          <p className="text-sm leading-relaxed text-muted">{challenge.target}</p>
        </Card>

        <Card>
          <div className="section-title mb-3 flex items-center gap-1.5">
            <ShieldQuestion size={13} /> Flag submission
          </div>
          {solved ? (
            <div className="rounded-lg border border-acid/50 bg-acid/10 p-4 text-center">
              <div className="font-mono text-lg font-bold text-acid">{challenge.flag}</div>
              <div className="mt-1 text-xs text-muted">Captured — +{challenge.points} XP earned</div>
            </div>
          ) : (
            <>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim()) return;
                  const ok = submitFlag(challenge.id, input, challenge.flag, challenge.points);
                  if (ok) {
                    pushToast({ title: `Flag accepted — ${challenge.code}`, body: `+${challenge.points} XP · write-up unlocked`, icon: 'flag' });
                    setWrong(false);
                  } else {
                    setWrong(true);
                  }
                }}
              >
                <input
                  className={classNames('input font-mono', wrong && '!border-danger/60')}
                  placeholder="FLAG{...}"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setWrong(false);
                  }}
                />
                <button className="btn-solid" type="submit">
                  <Flag size={15} /> Submit
                </button>
              </form>
              {wrong && (
                <div className="mt-2 text-xs text-danger animate-fade-in">
                  Incorrect flag — attempts: {cp.attempts}. Re-check the objective and hints.
                </div>
              )}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-dim">
                <Lock size={10} /> flags are case-sensitive · verified locally
              </div>
            </>
          )}

          <div className="section-title mb-3 mt-6">Progressive hints</div>
          <div className="space-y-2">
            {challenge.hints.map((h, i) => {
              const revealed = cp.hints > i;
              return revealed ? (
                <div key={i} className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm text-muted animate-fade-in">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-warn">Hint {i + 1}</span>
                  <p className="mt-1">{h}</p>
                </div>
              ) : (
                <button key={i} className="btn-ghost btn-sm" onClick={() => revealCtfHint(challenge.id)}>
                  <ChevronDown size={13} /> Reveal hint {i + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Write-up */}
      <Card className={classNames('mt-4', !solved && 'opacity-80')}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Write-up</h3>
          {!solved && <span className="font-mono text-[11px] text-dim">unlocks on solve</span>}
        </div>
        {solved ? (
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-muted marker:font-mono marker:text-acid/70">
            {challenge.writeup.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : (
          <div className="mt-3 rounded-lg border border-line bg-base2/50 p-6 text-center">
            <Lock size={20} className="mx-auto mb-2 text-dim" />
            <p className="text-sm text-muted">The full write-up is revealed once you capture the flag.</p>
          </div>
        )}
      </Card>

      {related.length > 0 && (
        <Card className="mt-4">
          <div className="section-title mb-2">Study up</div>
          <div className="flex flex-wrap gap-2">
            {related.map((e) => (
              <Link key={e!.lesson.id} to={`${base}/lesson/${e!.lesson.id}`} className="chip hover:!border-cyan/50 hover:!text-cyan">
                {e!.lesson.title}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
