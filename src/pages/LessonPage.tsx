import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  Tag as TagIcon,
  Thermometer,
  Timer,
  Plus,
  Trash2,
  Pencil
} from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import {
  Breadcrumb,
  Card,
  CopyButton,
  DifficultyPill,
  ProgressBar,
  Reveal
} from '../components/ui';
import { SectionBody, SECTION_ORDER } from '../components/content/ContentRenderer';
import { Diagram } from '../components/diagrams';
import { SECTION_META } from '../types';
import type { QuizQuestion, Reference } from '../types';
import { classNames, formatDateTime } from '../utils/format';

// ---------------------------------------------------------------------------
// Knowledge check
// ---------------------------------------------------------------------------

interface QState {
  selected?: number;
  revealedHint: boolean;
  answered: boolean;
  selfGrade?: 'correct' | 'incorrect';
  input?: string;
}

function QuizSection({ lessonId, questions }: { lessonId: string; questions: QuizQuestion[] }) {
  const { data, submitQuiz } = useAcademy();
  const best = data.progress.lessons[lessonId]?.quiz;
  const [states, setStates] = useState<QState[]>(() =>
    questions.map(() => ({ revealedHint: false, answered: false }))
  );
  const [finished, setFinished] = useState(false);

  const computeScore = (sts: QState[]) => {
    let score = 0;
    questions.forEach((q, i) => {
      const s = sts[i];
      if (q.type === 'mcq' || q.type === 'truefalse') {
        if (s.answered && s.selected === q.answerIndex) score += 1;
      } else if (s.selfGrade === 'correct') score += 1;
    });
    return score;
  };

  const update = (i: number, patch: Partial<QState>) =>
    setStates((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const score = computeScore(states);

  return (
    <Card className="!border-cyan/30">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold">
          <Lightbulb size={17} className="text-cyan" /> Knowledge check
        </h3>
        {best && (
          <span className="font-mono text-[11px] text-dim">
            best: {best.score}/{best.total}
          </span>
        )}
      </div>
      <p className="mb-5 text-xs text-muted">
        Answer first, then reveal the explanation. Hints are available — no one is watching.
      </p>
      <div className="space-y-6">
        {questions.map((q, i) => {
          const s = states[i];
          const isChoice = q.type === 'mcq' || q.type === 'truefalse';
          return (
            <div key={q.id} className="rounded-lg border border-line bg-base2/50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-xs text-cyan">Q{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="chip !text-[9px]">{q.type.toUpperCase()}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{q.prompt}</p>

                  <div className="mt-3 space-y-2">
                    {isChoice &&
                      q.options?.map((opt, oi) => {
                        const selected = s.selected === oi;
                        const correct = q.answerIndex === oi;
                        return (
                          <button
                            key={oi}
                            disabled={s.answered}
                            onClick={() => update(i, { selected: oi, answered: true })}
                            className={classNames(
                              'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                              !s.answered && selected && 'border-cyan/60 bg-cyan/10',
                              !s.answered && !selected && 'border-line hover:border-cyan/40',
                              s.answered && correct && 'border-acid/60 bg-acid/10',
                              s.answered && !correct && selected && 'border-danger/60 bg-danger/10',
                              s.answered && !correct && !selected && 'border-line opacity-60'
                            )}
                          >
                            <span className="font-mono text-xs text-dim">{String.fromCharCode(65 + oi)}</span>
                            {opt}
                          </button>
                        );
                      })}

                    {!isChoice && (
                      <>
                        <textarea
                          className="input min-h-[70px] font-mono text-[13px]"
                          placeholder="Type your answer, then reveal the model answer and grade yourself honestly."
                          value={s.input ?? ''}
                          onChange={(e) => update(i, { input: e.target.value })}
                        />
                        <Reveal label="Reveal model answer" tone="cyan">
                          <p className="text-sm leading-relaxed text-muted">{q.modelAnswer}</p>
                          <div className="mt-3 flex gap-2">
                            <button
                              className={classNames('btn btn-sm', s.selfGrade === 'correct' ? 'btn-primary' : 'btn-ghost')}
                              onClick={() => update(i, { selfGrade: 'correct' })}
                            >
                              I got it
                            </button>
                            <button
                              className={classNames('btn btn-sm', s.selfGrade === 'incorrect' ? 'btn-danger' : 'btn-ghost')}
                              onClick={() => update(i, { selfGrade: 'incorrect' })}
                            >
                              Not quite
                            </button>
                          </div>
                        </Reveal>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {!s.revealedHint && (
                      <button className="btn-ghost btn-sm" onClick={() => update(i, { revealedHint: true })}>
                        Show hint
                      </button>
                    )}
                    {s.revealedHint && <p className="text-xs italic text-warn">Hint: {q.hint}</p>}
                    {isChoice && !s.answered && (
                      <button
                        className="btn-primary btn-sm ml-auto"
                        disabled={s.selected === undefined}
                        onClick={() => update(i, { answered: true })}
                      >
                        Submit answer
                      </button>
                    )}
                  </div>

                  {((isChoice && s.answered) || (!isChoice && s.selfGrade)) && (
                    <div className="mt-3 rounded-lg border border-line bg-panel/60 p-3 text-sm text-muted animate-fade-in">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-cyan">Explanation</span>
                      <p className="mt-1">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="font-mono text-sm">
          Running score: <span className="text-acid">{score}/{questions.length}</span>
        </div>
        <button
          className="btn-solid btn-sm"
          disabled={finished}
          onClick={() => {
            submitQuiz(lessonId, score, questions.length);
            setFinished(true);
          }}
        >
          {finished ? 'Score saved ✓' : 'Save score'}
        </button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

function NotesSection({ lessonId }: { lessonId: string }) {
  const { data, saveNote, deleteNote } = useAcademy();
  const notes = data.notes.filter((n) => n.lessonId === lessonId);
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <Card>
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Plus size={17} className="text-acid" /> My notes on this lesson
      </h3>
      <textarea
        className="input min-h-[90px]"
        placeholder="Write a personal note — what surprised you, what to re-test, links between lessons…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2">
          <TagIcon size={14} className="text-dim" />
          <input
            className="input !py-1.5"
            placeholder="tags, comma-separated (e.g. adb, storage)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button
          className="btn-primary btn-sm"
          disabled={!text.trim()}
          onClick={() => {
            saveNote(lessonId, text.trim(), tags.split(',').map((t) => t.trim()).filter(Boolean));
            setText('');
            setTags('');
          }}
        >
          Add note
        </button>
      </div>
      {notes.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {notes.map((n) =>
            editing === n.id ? (
              <NoteEditor
                key={n.id}
                initial={n.text}
                initialTags={n.tags}
                onSave={(t, tg) => {
                  saveNote(lessonId, t, tg, n.id);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div key={n.id} className="rounded-lg border border-line bg-base2/50 p-3">
                <p className="whitespace-pre-wrap text-sm text-muted">{n.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {n.tags.map((t) => (
                    <span key={t} className="chip !text-[10px]">
                      #{t}
                    </span>
                  ))}
                  <span className="ml-auto font-mono text-[10px] text-dim">{formatDateTime(n.updatedAt)}</span>
                  <button className="text-dim hover:text-cyan" onClick={() => setEditing(n.id)} title="Edit">
                    <Pencil size={13} />
                  </button>
                  <button className="text-dim hover:text-danger" onClick={() => deleteNote(n.id)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </Card>
  );
}

function NoteEditor({
  initial,
  initialTags,
  onSave,
  onCancel
}: {
  initial: string;
  initialTags: string[];
  onSave: (text: string, tags: string[]) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(initial);
  const [tags, setTags] = useState(initialTags.join(', '));
  return (
    <div className="rounded-lg border border-cyan/40 bg-base2/70 p-3">
      <textarea className="input min-h-[70px]" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-2 flex items-center gap-2">
        <input className="input !py-1.5 flex-1" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags" />
        <button className="btn-primary btn-sm" onClick={() => onSave(text.trim(), tags.split(',').map((t) => t.trim()).filter(Boolean))}>
          Save
        </button>
        <button className="btn-ghost btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson page
// ---------------------------------------------------------------------------

export default function LessonPage() {
  const { lessonId } = useParams();
  const { lessonMap, entries, data, visitLesson, addLessonSeconds, completeLesson, toggleDifficult, isBookmarked, toggleBookmark, base } = useAcademy();
  const entry = lessonId ? lessonMap.get(lessonId) : undefined;
  const accRef = useRef(0);

  useEffect(() => {
    if (!entry) return;
    visitLesson(entry.lesson.id);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  useEffect(() => {
    if (!entry) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        accRef.current += 10;
        if (accRef.current >= 30) {
          addLessonSeconds(entry.lesson.id, accRef.current);
          accRef.current = 0;
        }
      }
    }, 10000);
    return () => {
      if (accRef.current > 0) addLessonSeconds(entry.lesson.id, accRef.current);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const references: Reference[] = entry?.lesson.references ?? [];

  const prev = useMemo(() => entries.find((e) => e.index === (entry?.index ?? 0) - 1), [entries, entry]);
  const next = useMemo(() => entries.find((e) => e.index === (entry?.index ?? 0) + 1), [entries, entry]);

  if (!entry) return <Navigate to={`${base}/path`} replace />;
  const lesson = entry.lesson;
  const lp = data.progress.lessons[lesson.id] ?? {};
  const prereqEntries = lesson.prerequisites.map((p) => lessonMap.get(p)).filter(Boolean) as typeof entries;
  const isDifficult = !!lp.difficult;

  return (
    <div className="animate-fade-up">
      <Breadcrumb
        items={[
          { label: 'Learning Path', to: `${base}/path` },
          { label: entry.module.title, to: `${base}/path/module/${entry.module.id}` },
          { label: lesson.title }
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <DifficultyPill level={lesson.difficulty} />
              <span className="chip">
                <Clock size={11} /> {lesson.minutes} min
              </span>
              {lp.seconds ? (
                <span className="chip">
                  <Timer size={11} /> {Math.round(lp.seconds / 60)}m studied
                </span>
              ) : null}
              {lp.completed && <span className="chip !border-acid/50 !text-acid">✓ completed</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={classNames('btn-ghost btn-sm', isDifficult && '!border-warn/60 !text-warn')}
              onClick={() => toggleDifficult(lesson.id)}
              title="Mark as difficult"
            >
              <Thermometer size={14} /> {isDifficult ? 'Difficult' : 'Mark difficult'}
            </button>
            <button
              className={classNames('btn-ghost btn-sm', isBookmarked('lessons', lesson.id) && '!border-acid/60 !text-acid')}
              onClick={() => toggleBookmark('lessons', lesson.id)}
            >
              <Bookmark size={14} /> {isBookmarked('lessons', lesson.id) ? 'Bookmarked' : 'Bookmark'}
            </button>
            {!lp.completed && (
              <button className="btn-solid btn-sm" onClick={() => completeLesson(lesson.id)}>
                <CheckCircle2 size={14} /> Mark complete
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {lesson.objectives.length > 0 && (
            <Card className="!p-4">
              <div className="section-title mb-2">Learning objectives</div>
              <ul className="list-disc space-y-0.5 pl-5 text-[13px] text-muted marker:text-acid/70">
                {lesson.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </Card>
          )}
          {prereqEntries.length > 0 && (
            <Card className="!p-4">
              <div className="section-title mb-2">Prerequisites</div>
              <div className="space-y-1">
                {prereqEntries.map((pe) => (
                  <Link
                    key={pe.lesson.id}
                    to={`${base}/lesson/${pe.lesson.id}`}
                    className="flex items-center gap-2 text-[13px] text-muted hover:text-cyan"
                  >
                    <BookOpen size={12} className="text-dim" />
                    {pe.lesson.title}
                    <span className="font-mono text-[10px] text-dim">({pe.module.id.toUpperCase()})</span>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="min-w-0 space-y-8">
          {lesson.diagram && (
            <div className="card overflow-hidden !p-3">
              <Diagram id={lesson.diagram} />
            </div>
          )}

          {SECTION_ORDER.map((key) => {
            const blocks = lesson.sections[key];
            if (!blocks || blocks.length === 0) return null;
            const meta = SECTION_META[key];
            return (
              <section key={key} id={meta.anchor} className="scroll-mt-20">
                <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-mono text-sm font-bold uppercase tracking-[0.18em] text-cyan">
                  <span className="text-acid">§</span> {meta.label}
                </h2>
                <SectionBody blocks={blocks} />
              </section>
            );
          })}

          {lesson.quiz.length > 0 && (
            <section id="sec-quiz" className="scroll-mt-20">
              <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-mono text-sm font-bold uppercase tracking-[0.18em] text-cyan">
                <span className="text-acid">§</span> Knowledge check
              </h2>
              <QuizSection lessonId={lesson.id} questions={lesson.quiz} />
            </section>
          )}

          {references.length > 0 && (
            <section id="sec-references" className="scroll-mt-20">
              <h2 className="mb-3 flex items-baseline gap-2 border-b border-line pb-2 font-mono text-sm font-bold uppercase tracking-[0.18em] text-cyan">
                <span className="text-acid">§</span> References
              </h2>
              <ul className="space-y-2">
                {references.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ExternalLink size={13} className="mt-1 shrink-0 text-dim" />
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                      {r.title}
                    </a>
                    {r.note && <span className="text-xs text-dim">— {r.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <NotesSection lessonId={lesson.id} />

          {/* Prev / next */}
          <div className="flex items-stretch justify-between gap-3 border-t border-line pt-6">
            {prev ? (
              <Link to={`${base}/lesson/${prev.lesson.id}`} className="card card-hover flex-1 !p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
                  <ArrowLeft size={12} /> Previous
                </div>
                <div className="mt-1 truncate text-sm font-semibold">{prev.lesson.title}</div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {next ? (
              <Link to={`${base}/lesson/${next.lesson.id}`} className="card card-hover flex-1 !p-4 text-right">
                <div className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
                  Next <ArrowRight size={12} />
                </div>
                <div className="mt-1 truncate text-sm font-semibold">{next.lesson.title}</div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>

        {/* TOC rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <Card className="!p-4">
              <div className="section-title mb-2">On this page</div>
              <nav className="space-y-1">
                {SECTION_ORDER.filter((k) => lesson.sections[k]?.length > 0).map((k) => (
                  <a
                    key={k}
                    href={`#${SECTION_META[k].anchor}`}
                    className="block rounded px-2 py-1 text-[12.5px] text-muted transition-colors hover:bg-panel2/70 hover:text-cyan"
                  >
                    {SECTION_META[k].label}
                  </a>
                ))}
                {lesson.quiz.length > 0 && (
                  <a href="#sec-quiz" className="block rounded px-2 py-1 text-[12.5px] text-muted hover:bg-panel2/70 hover:text-cyan">
                    Knowledge check
                  </a>
                )}
                {references.length > 0 && (
                  <a href="#sec-references" className="block rounded px-2 py-1 text-[12.5px] text-muted hover:bg-panel2/70 hover:text-cyan">
                    References
                  </a>
                )}
              </nav>
            </Card>
            <Card className="!p-4">
              <div className="section-title mb-2">Lesson progress</div>
              <ProgressBar
                value={lp.completed ? 100 : lp.quiz ? 66 : lp.visited ? 33 : 0}
                color={lp.completed ? 'acid' : 'cyan'}
              />
              <div className="mt-2 text-[11px] text-dim">
                {lp.completed ? 'Completed' : lp.quiz ? 'Quiz done — mark complete when ready' : 'In progress'}
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

