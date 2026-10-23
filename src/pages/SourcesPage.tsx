import { useState } from 'react';
import { ExternalLink, Library } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '../components/ui';
import { useAcademy } from '../context/AcademyContext';
import { classNames } from '../utils/format';

export function useMergedSources() {
  const { sources } = useAcademy();
  return sources;
}

export default function SourcesPage() {
  const all = useMergedSources();
  const { isBookmarked, toggleBookmark } = useAcademy();
  const [cat, setCat] = useState('All');
  const categories = ['All', ...new Set(all.map((s) => s.category))];
  const shown = cat === 'All' ? all : all.filter((s) => s.category === cat);

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="source integrity"
        title="Sources & References"
        sub="The public, reputable sources this academy's original content was synthesized from. Every lesson cites what it used — nothing here is fabricated."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<Library size={26} />} title="No sources" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {shown.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <a href={s.url} target="_blank" rel="noreferrer" className="truncate font-semibold text-cyan hover:underline">
                      {s.name}
                    </a>
                    <ExternalLink size={12} className="shrink-0 text-dim" />
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-dim">{s.category}</div>
                </div>
                <button
                  className={classNames('shrink-0 text-lg', isBookmarked('sources', s.id) ? 'text-acid' : 'text-dim hover:text-acid')}
                  onClick={() => toggleBookmark('sources', s.id)}
                  title={isBookmarked('sources', s.id) ? 'Remove bookmark' : 'Bookmark source'}
                >
                  {isBookmarked('sources', s.id) ? '★' : '☆'}
                </button>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{s.whatFor}</p>
              {s.usedBy.length > 0 && (
                <div className="mt-3 border-t border-line pt-2.5">
                  <div className="section-title mb-1.5">Used by modules</div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.usedBy.map((m) => (
                      <span key={m} className="chip !text-[10px]">
                        {m.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <Card className="mt-6 !border-violet/30 bg-violet/5">
        <p className="text-sm leading-relaxed text-muted">
          <strong className="text-ink">Content integrity statement.</strong> All explanations in this academy are
          original syntheses written for this platform, informed by the official sources listed here. No course
          material is copied verbatim from any commercial platform. If a claim is uncertain or version-dependent, the
          lessons say so. Tool maintenance status changes — verify before relying on any tool.
        </p>
      </Card>
    </div>
  );
}
