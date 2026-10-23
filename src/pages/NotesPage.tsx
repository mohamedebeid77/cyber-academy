import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StickyNote, Trash2, Pencil } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { EmptyState, PageHeader } from '../components/ui';
import { formatDateTime } from '../utils/format';

export default function NotesPage() {
  const { data, deleteNote, lessonMap, base } = useAcademy();
  const [params] = useSearchParams();
  const highlight = params.get('highlight');
  const [tagFilter, setTagFilter] = useState('');
  const [q, setQ] = useState('');

  const tags = useMemo(() => [...new Set(data.notes.flatMap((n) => n.tags))], [data.notes]);
  const notes = useMemo(() => {
    return [...data.notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((n) => !tagFilter || n.tags.includes(tagFilter))
      .filter((n) => !q.trim() || n.text.toLowerCase().includes(q.toLowerCase()));
  }, [data.notes, tagFilter, q]);

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="workspace"
        title="My Notes"
        sub="Everything you have written, attached to lessons. Notes are stored locally and included in backups."
        actions={<div className="chip !text-xs">{data.notes.length} notes</div>}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1.5">
          <button className={`chip cursor-pointer ${!tagFilter ? '!border-acid/60 !text-acid' : ''}`} onClick={() => setTagFilter('')}>
            all
          </button>
          {tags.map((t) => (
            <button key={t} className={`chip cursor-pointer ${tagFilter === t ? '!border-acid/60 !text-acid' : ''}`} onClick={() => setTagFilter(t)}>
              #{t}
            </button>
          ))}
        </div>
      </div>
      {notes.length === 0 ? (
        <EmptyState
          icon={<StickyNote size={26} />}
          title="No notes yet"
          body="Open any lesson and use the notes section at the bottom to record what you learn. Tag notes to find them later."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => {
            const entry = lessonMap.get(n.lessonId);
            return (
              <div
                key={n.id}
                className={`card p-4 ${highlight === n.id ? '!border-acid/60' : ''}`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {entry ? (
                    <Link to={`${base}/lesson/${n.lessonId}`} className="text-sm font-semibold text-cyan hover:underline">
                      {entry.lesson.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-dim">{n.lessonId}</span>
                  )}
                  {entry && <span className="font-mono text-[10px] text-dim">{entry.module.title}</span>}
                  <span className="ml-auto font-mono text-[10px] text-dim">{formatDateTime(n.updatedAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-muted">{n.text}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {n.tags.map((t) => (
                    <span key={t} className="chip !text-[10px]">
                      #{t}
                    </span>
                  ))}
                  <span className="ml-auto flex gap-2">
                    <Link to={`${base}/lesson/${n.lessonId}`} className="text-dim hover:text-cyan" title="Edit in lesson">
                      <Pencil size={13} />
                    </Link>
                    <button className="text-dim hover:text-danger" onClick={() => deleteNote(n.id)} title="Delete note">
                      <Trash2 size={13} />
                    </button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
