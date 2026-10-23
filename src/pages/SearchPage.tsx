import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useAcademy } from '../context/AcademyContext';
import { PageHeader } from '../components/ui';
import { buildSearchIndex } from '../components/layout/SearchOverlay';
import { searchEntries } from '../services/search';
import { classNames } from '../utils/format';

export default function SearchPage() {
  const { data, lessonMap, modules, labs, ctfChallenges, tools, cheatsheets, glossary, sources, base } = useAcademy();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';

  const index = useMemo(
    () =>
      buildSearchIndex({
        modules,
        labs,
        ctf: ctfChallenges,
        tools,
        cheatsheets,
        glossary,
        sources,
        notes: data.notes,
        routeBase: base,
        lessonRoute: (id) => `${base}/lesson/${id}`,
        lessonTitle: (id) => lessonMap.get(id)?.lesson.title ?? id
      }),
    [data, lessonMap, modules, labs, ctfChallenges, tools, cheatsheets, glossary, sources, base]
  );

  const results = useMemo(() => searchEntries(index, q, 60), [index, q]);
  const grouped = useMemo(() => {
    const map = new Map<string, typeof results>();
    for (const r of results) {
      const list = map.get(r.type) ?? [];
      list.push(r);
      map.set(r.type, list);
    }
    return [...map.entries()];
  }, [results]);

  return (
    <div className="animate-fade-up">
      <PageHeader kicker="global search" title={q ? `Results for “${q}”` : 'Search'} sub={q ? `${results.length} results across the academy.` : 'Use Ctrl+K anywhere, or append ?q=term to this page.'} />
      {q && results.length === 0 && (
        <div className="card p-10 text-center text-sm text-muted">
          <Search size={22} className="mx-auto mb-3 text-dim" />
          Nothing found. Try different keywords — search covers lesson text, code blocks, labs, tools, glossary and your notes.
        </div>
      )}
      <div className="space-y-8">
        {grouped.map(([type, list]) => (
          <section key={type}>
            <div className="section-title mb-3">
              {type} ({list.length})
            </div>
            <div className="space-y-2">
              {list.map((r) => (
                <Link key={r.type + r.id} to={r.route} className={classNames('card card-hover flex items-center gap-4 !p-4')}>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{r.title}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-dim">{r.subtitle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
