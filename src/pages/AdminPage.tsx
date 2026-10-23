import { useMemo, useState } from 'react';
import { FolderGit2, Plus, Trash2, Pencil, Save, X, FilePlus2 } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, PageHeader, Modal, ConfirmButton, DifficultyPill } from '../components/ui';
import { parseLessonSource, serializeBlocks, LESSON_SYNTAX_HELP } from '../utils/lessonParser';
import { classNames, uid } from '../utils/format';
import type {
  ContentBlock,
  CTFChallenge,
  CheatSheet,
  Difficulty,
  GlossaryTerm,
  Lab,
  Lesson,
  Module,
  QuizQuestion,
  SourceRef,
  Tool
} from '../types';

type Tab = 'lessons' | 'modules' | 'labs' | 'ctf' | 'tools' | 'cheatsheets' | 'glossary' | 'sources';

const TABS: { id: Tab; label: string }[] = [
  { id: 'lessons', label: 'Lessons' },
  { id: 'modules', label: 'Modules' },
  { id: 'labs', label: 'Labs' },
  { id: 'ctf', label: 'CTF' },
  { id: 'tools', label: 'Tools' },
  { id: 'cheatsheets', label: 'Cheat sheets' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'sources', label: 'Sources' }
];

const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

// ---------------------------------------------------------------------------
// Lesson editor
// ---------------------------------------------------------------------------

function LessonEditor({ initial, onClose }: { initial?: Lesson; onClose: () => void }) {
  const { data, modules, updateCustom, pushToast } = useAcademy();
  const [moduleId, setModuleId] = useState(initial?.moduleId ?? modules[0]?.id ?? 'm01');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 'Beginner');
  const [minutes, setMinutes] = useState(initial?.minutes ?? 20);
  const [prereqText, setPrereqText] = useState((initial?.prerequisites ?? []).join(', '));
  const [objectivesText, setObjectivesText] = useState((initial?.objectives ?? []).join('\n'));
  const [ideaSrc, setIdeaSrc] = useState(serializeBlocks(initial?.sections?.idea ?? []));
  const [technicalSrc, setTechnicalSrc] = useState(serializeBlocks(initial?.sections?.technical ?? []));
  const [quizJson, setQuizJson] = useState(JSON.stringify(initial?.quiz ?? [], null, 2));
  const [refJson, setRefJson] = useState(
    JSON.stringify(initial?.references ?? [], null, 2)
  );
  const [errors, setErrors] = useState<string[]>([]);

  // split remaining sections into one combined source with section markers
  const [pentestSrc, setPentestSrc] = useState('');
  const [lookForSrc, setLookForSrc] = useState('');
  const [howToTestSrc, setHowToTestSrc] = useState('');
  const [exampleSrc, setExampleSrc] = useState('');
  const [toolsSrc, setToolsSrc] = useState('');
  const [mistakesSrc, setMistakesSrc] = useState('');
  const [tryItSrc, setTryItSrc] = useState('');
  const [takeawaysSrc, setTakeawaysSrc] = useState('');

  const sectionFields: { key: string; label: string; value: string; set: (v: string) => void }[] = [
    { key: 'idea', label: '1 · The idea', value: ideaSrc, set: setIdeaSrc },
    { key: 'technical', label: '2 · How it works technically', value: technicalSrc, set: setTechnicalSrc },
    { key: 'pentestRelevance', label: '3 · Why pentesters care', value: pentestSrc, set: setPentestSrc },
    { key: 'lookFor', label: '4 · What to look for', value: lookForSrc, set: setLookForSrc },
    { key: 'howToTest', label: '5 · How to test', value: howToTestSrc, set: setHowToTestSrc },
    { key: 'example', label: '6 · Example', value: exampleSrc, set: setExampleSrc },
    { key: 'tools', label: '7 · Tools', value: toolsSrc, set: setToolsSrc },
    { key: 'mistakes', label: '8 · Common mistakes', value: mistakesSrc, set: setMistakesSrc },
    { key: 'tryIt', label: '9 · Try it yourself', value: tryItSrc, set: setTryItSrc },
    { key: 'takeaways', label: '11 · Takeaways', value: takeawaysSrc, set: setTakeawaysSrc }
  ];

  const parseAll = (): { sections: Lesson['sections']; errs: string[] } => {
    const errs: string[] = [];
    const parsed = sectionFields.map((f) => {
      const { blocks, errors } = parseLessonSource(f.value);
      errors.forEach((e) => errs.push(`${f.label}: ${e}`));
      return [f.key, blocks] as const;
    });
    const sections = Object.fromEntries(parsed) as unknown as Lesson['sections'];
    return { sections, errs };
  };

  const save = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Title is required.');
    let quiz: QuizQuestion[] = [];
    try {
      quiz = JSON.parse(quizJson);
      if (!Array.isArray(quiz)) throw new Error('not array');
    } catch {
      errs.push('Quiz JSON is invalid (must be an array).');
    }
    let refs = [];
    try {
      refs = JSON.parse(refJson);
      if (!Array.isArray(refs)) throw new Error('not array');
    } catch {
      errs.push('References JSON is invalid (must be an array).');
    }
    const { sections, errs: parseErrs } = parseAll();
    errs.push(...parseErrs);
    setErrors(errs);
    if (errs.length > 0) return;

    const lesson: Lesson = {
      id: initial?.id ?? uid('custom-lesson'),
      moduleId,
      title: title.trim(),
      difficulty,
      minutes,
      prerequisites: prereqText.split(',').map((s) => s.trim()).filter(Boolean),
      objectives: objectivesText.split('\n').map((s) => s.trim()).filter(Boolean),
      sections,
      quiz,
      references: refs
    };
    const existing = initial?.id;
    updateCustom({
      lessons: existing
        ? data.custom.lessons.map((l) => (l.id === existing ? lesson : l))
        : [...data.custom.lessons, lesson]
    });
    pushToast({ title: existing ? 'Lesson updated' : 'Lesson added', body: title, icon: 'info' });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
        </div>
        <div>
          <label className="label">Module</label>
          <select className="input" value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Estimated minutes</label>
          <input className="input" type="number" min={5} max={180} value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 20)} />
        </div>
        <div>
          <label className="label">Prerequisite lesson ids (comma-separated)</label>
          <input className="input font-mono text-xs" value={prereqText} onChange={(e) => setPrereqText(e.target.value)} placeholder="m01-l01, m01-l02" />
        </div>
        <div>
          <label className="label">Learning objectives (one per line)</label>
          <textarea className="input min-h-[42px]" value={objectivesText} onChange={(e) => setObjectivesText(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="label !mb-0">Section content</span>
          <span className="font-mono text-[10px] text-dim">10 sections · knowledge check is the quiz JSON below</span>
        </div>
        <details className="rounded-lg border border-line bg-base2/50 p-3">
          <summary className="cursor-pointer font-mono text-xs text-cyan">Syntax help</summary>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted">{LESSON_SYNTAX_HELP}</pre>
        </details>
        <div className="mt-3 space-y-3">
          {sectionFields.map((f) => (
            <details key={f.key} className="rounded-lg border border-line bg-base2/50 p-3" open={f.key === 'idea'}>
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-dim">{f.label}</summary>
              <textarea
                className="input mt-2 min-h-[110px] font-mono text-[12px] leading-relaxed"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={'# Sub-heading\nParagraph text…'}
              />
            </details>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Knowledge check — quiz JSON (array of questions)</label>
        <textarea className="input min-h-[140px] font-mono text-[11.5px]" value={quizJson} onChange={(e) => setQuizJson(e.target.value)} />
        <p className="mt-1 font-mono text-[10px] text-dim">
          mcq/truefalse: {'{ id, type, prompt, options, answerIndex, hint, explanation }'} · short/scenario: replace
          options/answerIndex with modelAnswer
        </p>
      </div>
      <div>
        <label className="label">References JSON (array of {'{ title, url, note? }'})</label>
        <textarea className="input min-h-[90px] font-mono text-[11.5px]" value={refJson} onChange={(e) => setRefJson(e.target.value)} />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 p-3">
          {errors.map((e, i) => (
            <div key={i} className="text-xs text-danger">
              • {e}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button className="btn-ghost btn-sm" onClick={onClose}>
          <X size={14} /> Cancel
        </button>
        <button className="btn-solid btn-sm" onClick={save}>
          <Save size={14} /> {initial ? 'Update lesson' : 'Add lesson'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic JSON editor
// ---------------------------------------------------------------------------

function JsonEditor<T>({
  label,
  hint,
  validate,
  build,
  onClose,
  initial
}: {
  label: string;
  hint: string;
  validate: (v: unknown) => string | null;
  build: (v: T) => void;
  onClose: () => void;
  initial?: T;
}) {
  const [text, setText] = useState(JSON.stringify(initial ?? null, null, 2));
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    try {
      const parsed = JSON.parse(text);
      const err = validate(parsed);
      if (err) {
        setError(err);
        return;
      }
      build(parsed as T);
      onClose();
    } catch (e) {
      setError(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] leading-relaxed text-dim">{hint}</p>
      <textarea className="input min-h-[240px] font-mono text-[11.5px]" value={text} onChange={(e) => setText(e.target.value)} />
      {error && <div className="rounded-lg border border-danger/40 bg-danger/10 p-2.5 text-xs text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <button className="btn-ghost btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-solid btn-sm" onClick={save}>
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const { data, updateCustom, modules, pushToast, academy } = useAcademy();
  const [tab, setTab] = useState<Tab>('lessons');
  const [lessonModal, setLessonModal] = useState<{ open: boolean; editing?: Lesson }>({ open: false });
  const [jsonModal, setJsonModal] = useState<{ open: boolean; kind: Tab; editing?: unknown }>({ open: false, kind: 'labs' });

  const customCounts = useMemo(
    () => ({
      lessons: data.custom.lessons.length,
      modules: data.custom.modules.length,
      labs: data.custom.labs.length,
      ctf: data.custom.ctf.length,
      tools: data.custom.tools.length,
      cheatsheets: data.custom.cheatsheets.length,
      glossary: data.custom.glossary.length,
      sources: data.custom.sources.length
    }),
    [data.custom]
  );

  const deleteCustom = (kind: keyof typeof customCounts, id: string) => {
    updateCustom({ [kind]: (data.custom[kind] as { id: string }[]).filter((x) => x.id !== id) } as Partial<typeof data.custom>);
    pushToast({ title: 'Deleted', body: id, icon: 'info' });
  };

  const listFor = (kind: Tab): { id: string; title: string; sub?: string }[] => {
    switch (kind) {
      case 'lessons':
        return data.custom.lessons.map((l) => ({ id: l.id, title: l.title, sub: l.moduleId }));
      case 'modules':
        return data.custom.modules.map((m) => ({ id: m.id, title: m.title, sub: `${m.lessons.length} lessons` }));
      case 'labs':
        return data.custom.labs.map((l) => ({ id: l.id, title: l.title, sub: l.difficulty }));
      case 'ctf':
        return data.custom.ctf.map((c) => ({ id: c.id, title: `${c.code} — ${c.title}`, sub: `${c.points} pts` }));
      case 'tools':
        return data.custom.tools.map((t) => ({ id: t.id, title: t.name, sub: t.category }));
      case 'cheatsheets':
        return data.custom.cheatsheets.map((c) => ({ id: c.id, title: c.title, sub: `${c.entries.length} entries` }));
      case 'glossary':
        return data.custom.glossary.map((g) => ({ id: g.term, title: g.term, sub: g.category }));
      case 'sources':
        return data.custom.sources.map((s) => ({ id: s.id, title: s.name, sub: s.category }));
    }
  };

  const jsonHints: Record<Exclude<Tab, 'lessons'>, string> = {
    modules: `Module object: { id, title, level, description, outcomes: string[], lessons: Lesson[] } — attach lessons here or add them later via the Lessons tab.`,
    labs: `Lab object: { id, title, difficulty: "Beginner"|"Intermediate"|"Advanced", points, scenario, target, objective, tools: string[], learningObjectives: string[], hints: string[], questions: [{q, a}], expectedFindings: string[], solution: string[], remediation: string[], relatedLessons: string[] }`,
    ctf: `Challenge object: { id, code, title, category, difficulty, points, objective, target, hints: string[], flag, writeup: string[], relatedLessons: string[] }`,
    tools: `Tool object: { id, name, category, purpose, status: "current"|"niche"|"legacy", install, usage, commands: [{cmd, desc}], whenToUse: string[], docsUrl, relatedLessons: string[] }`,
    cheatsheets: `CheatSheet object: { id, title, description, category, entries: [{cmd, desc}] }`,
    glossary: `GlossaryTerm object: { term, category, simple, technical, related: string[] }`,
    sources: `SourceRef object: { id, name, url, category, whatFor, usedBy: string[] }`
  };

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="local content management"
        title="Content Studio"
        sub="Add and edit your own lessons, modules, labs, challenges and reference entries. Custom content is stored locally, merges with the built-in curriculum, and is included in backups."
        actions={
          <div className="chip !text-xs">
            <FolderGit2 size={12} className="text-acid" /> {Object.values(customCounts).reduce((a, b) => a + b, 0)} custom items
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} className={classNames('btn btn-sm', tab === t.id ? 'btn-primary' : 'btn-ghost')} onClick={() => setTab(t.id)}>
            {t.label}
            {customCounts[t.id] > 0 && <span className="ml-1 font-mono text-[10px] opacity-70">{customCounts[t.id]}</span>}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tab === 'lessons' ? (
          <button className="btn-primary btn-sm" onClick={() => setLessonModal({ open: true })}>
            <FilePlus2 size={14} /> Add lesson
          </button>
        ) : (
          <button
            className="btn-primary btn-sm"
            onClick={() => {
              setJsonModal({ open: true, kind: tab });
            }}
          >
            <Plus size={14} /> Add {tab.slice(0, -1)}
          </button>
        )}
      </div>

      {listFor(tab).length === 0 ? (
        <Card className="text-center text-sm text-muted">
          No custom {tab} yet. Anything you add here appears across the app merged with the built-in content.
        </Card>
      ) : (
        <div className="space-y-2">
          {listFor(tab).map((item) => (
            <div key={item.id} className="card flex items-center gap-3 !p-3.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{item.title}</div>
                {item.sub && <div className="font-mono text-[11px] text-dim">{item.sub}</div>}
              </div>
              {tab === 'lessons' && (
                <button className="btn-ghost btn-sm" onClick={() => setLessonModal({ open: true, editing: data.custom.lessons.find((l) => l.id === item.id) })}>
                  <Pencil size={13} /> Edit
                </button>
              )}
              <ConfirmButton onConfirm={() => deleteCustom(tab, item.id)} confirmLabel="Sure?">
                <Trash2 size={13} />
              </ConfirmButton>
            </div>
          ))}
        </div>
      )}

      <Modal open={lessonModal.open} onClose={() => setLessonModal({ open: false })} title={lessonModal.editing ? 'Edit lesson' : 'Add lesson'} wide>
        <LessonEditor initial={lessonModal.editing} onClose={() => setLessonModal({ open: false })} />
      </Modal>

      <Modal open={jsonModal.open} onClose={() => setJsonModal({ open: false, kind: 'labs' })} title={`Add ${jsonModal.kind}`} wide>
        <JsonEditor
          label={jsonModal.kind}
          hint={jsonHints[jsonModal.kind as Exclude<Tab, 'lessons'>]}
          validate={(v) => {
            if (!v || typeof v !== 'object') return 'Expected an object.';
            if (!('id' in (v as object))) return 'Object needs an "id" field.';
            return null;
          }}
          build={(v: unknown) => {
            const key = jsonModal.kind as keyof typeof customCounts;
            updateCustom({ [key]: [...(data.custom[key] as unknown[]), v] } as Partial<typeof data.custom>);
            pushToast({ title: 'Added', body: String((v as { id?: string }).id ?? ''), icon: 'info' });
          }}
          onClose={() => setJsonModal({ open: false, kind: 'labs' })}
          initial={
            jsonModal.kind === 'labs'
              ? ({
                  id: 'custom-lab',
                  title: 'New lab',
                  difficulty: 'Beginner',
                  points: 100,
                  scenario: '',
                  target: '',
                  objective: '',
                  tools: [],
                  learningObjectives: [],
                  hints: ['', '', ''],
                  questions: [{ q: '', a: '' }],
                  expectedFindings: [],
                  solution: [],
                  remediation: [],
                  relatedLessons: []
                } as unknown as Lab)
              : jsonModal.kind === 'ctf'
                ? ({ id: 'custom-ctf', code: `${academy.strings.ctfCodePrefix}-100`, title: '', category: 'General', difficulty: 'Beginner', points: 50, objective: '', target: '', hints: ['', '', ''], flag: 'FLAG{...}', writeup: [], relatedLessons: [] } as unknown as CTFChallenge)
                : jsonModal.kind === 'tools'
                  ? ({ id: 'custom-tool', name: '', category: 'CLI', purpose: '', status: 'current', install: '', usage: '', commands: [], whenToUse: [], docsUrl: '', relatedLessons: [] } as unknown as Tool)
                  : jsonModal.kind === 'cheatsheets'
                    ? ({ id: 'custom-sheet', title: '', description: '', category: 'Tools', entries: [] } as unknown as CheatSheet)
                    : jsonModal.kind === 'glossary'
                      ? ({ term: '', category: 'Platform', simple: '', technical: '', related: [] } as unknown as GlossaryTerm)
                      : jsonModal.kind === 'sources'
                        ? ({ id: 'custom-source', name: '', url: '', category: 'Official Documentation', whatFor: '', usedBy: [] } as unknown as SourceRef)
                        : ({ id: 'custom-module', title: '', level: 10, description: '', outcomes: [], lessons: [] } as unknown as Module)
          }
        />
      </Modal>

      <Card className="mt-6 !p-4">
        <div className="section-title mb-2">How merging works</div>
        <p className="text-sm leading-relaxed text-muted">
          Custom lessons attach to any module (built-in or custom) by moduleId and appear in the learning path, search
          and recommendations immediately. Custom modules join the path at the end (level 10). Everything custom lives
          in your local database and is included in Settings → Export full backup. Built-in content files live in{' '}
          <code className="font-mono text-xs text-cyan">src/data/lessons/</code> — add lessons there too if you prefer
          shipping them with the app (see README).
        </p>
        {modules.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {modules.map((m) => (
              <span key={m.id} className="chip !text-[10px]">
                {m.id} · {m.title}
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
