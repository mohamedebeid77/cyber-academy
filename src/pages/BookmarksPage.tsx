import { Link } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { Card, DifficultyPill, EmptyState, PageHeader } from '../components/ui';

export default function BookmarksPage() {
  const { data, toggleBookmark, lessonMap, labs, tools, cheatsheets, sources, base } = useAcademy();
  const bm = data.bookmarks;

  const hasAny = bm.lessons.length + bm.labs.length + bm.tools.length + bm.cheatsheets.length + bm.sources.length > 0;

  return (
    <div className="animate-fade-up">
      <PageHeader kicker="workspace" title="My Bookmarks" sub="Saved lessons, labs, tools, cheat sheets and sources — one click from the sidebar." />
      {!hasAny ? (
        <EmptyState
          icon={<Bookmark size={26} />}
          title="Nothing bookmarked yet"
          body="Look for the bookmark button on lessons, labs, tools and cheat sheets. Bookmarked items appear here for quick access."
        />
      ) : (
        <div className="space-y-8">
          {bm.lessons.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Lessons ({bm.lessons.length})</h2>
              <div className="space-y-2">
                {bm.lessons.map((id) => {
                  const entry = lessonMap.get(id);
                  if (!entry) return null;
                  return (
                    <div key={id} className="card flex items-center gap-4 !p-4">
                      <Link to={`${base}/lesson/${id}`} className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{entry.lesson.title}</div>
                        <div className="font-mono text-[11px] text-dim">{entry.module.title}</div>
                      </Link>
                      <DifficultyPill level={entry.lesson.difficulty} />
                      <button className="text-dim hover:text-danger" onClick={() => toggleBookmark('lessons', id)}>
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {bm.labs.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Labs ({bm.labs.length})</h2>
              <div className="space-y-2">
                {bm.labs.map((id) => {
                  const lab = labs.find((l) => l.id === id);
                  if (!lab) return null;
                  return (
                    <div key={id} className="card flex items-center gap-4 !p-4">
                      <Link to={`${base}/labs/${id}`} className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{lab.title}</div>
                        <div className="font-mono text-[11px] text-dim">{lab.points} pts · {lab.difficulty}</div>
                      </Link>
                      <button className="text-dim hover:text-danger" onClick={() => toggleBookmark('labs', id)}>
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {bm.tools.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Tools ({bm.tools.length})</h2>
              <div className="flex flex-wrap gap-2">
                {bm.tools.map((id) => {
                  const t = tools.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <span key={id} className="card flex items-center gap-2 !px-3 !py-2">
                      <Link to={`${base}/toolkit/${id}`} className="text-sm hover:text-acid">
                        {t.name}
                      </Link>
                      <button className="text-dim hover:text-danger" onClick={() => toggleBookmark('tools', id)}>
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {bm.cheatsheets.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Cheat sheets ({bm.cheatsheets.length})</h2>
              <div className="flex flex-wrap gap-2">
                {bm.cheatsheets.map((id) => {
                  const s = cheatsheets.find((x) => x.id === id);
                  if (!s) return null;
                  return (
                    <span key={id} className="card flex items-center gap-2 !px-3 !py-2">
                      <Link to={`${base}/cheatsheets/${id}`} className="text-sm hover:text-acid">
                        {s.title}
                      </Link>
                      <button className="text-dim hover:text-danger" onClick={() => toggleBookmark('cheatsheets', id)}>
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {bm.sources.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Sources ({bm.sources.length})</h2>
              <Card>
                <div className="flex flex-wrap gap-2">
                  {bm.sources.map((id) => {
                    const s = sources.find((x) => x.id === id);
                    if (!s) return null;
                    return (
                      <span key={id} className="chip">
                        <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-cyan">
                          {s.name}
                        </a>
                        <button className="text-dim hover:text-danger" onClick={() => toggleBookmark('sources', id)}>
                          <X size={10} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
