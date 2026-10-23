import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookMarked, Search } from 'lucide-react';
import { Card, EmptyState, PageHeader } from '../components/ui';
import { useAcademy } from '../context/AcademyContext';
import { classNames } from '../utils/format';
import type { GlossaryTerm } from '../types';

function TermCard({ term, highlight }: { term: GlossaryTerm; highlight?: boolean }) {
  const [open, setOpen] = useState(!!highlight);
  return (
    <div
      className={classNames(
        'card !p-0 overflow-hidden transition-colors',
        open ? '!border-cyan/40' : '',
        highlight && '!border-acid/50'
      )}
    >
      <button className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left" onClick={() => setOpen(!open)}>
        <div>
          <span className="font-mono font-bold text-ink">{term.term}</span>
          <span className="ml-3 chip !text-[10px]">{term.category}</span>
        </div>
        <span className="font-mono text-xs text-dim">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="animate-fade-in space-y-3 border-t border-line px-5 py-4">
          <div>
            <div className="section-title mb-1">Simple</div>
            <p className="text-sm text-muted">{term.simple}</p>
          </div>
          <div>
            <div className="section-title mb-1">Technical</div>
            <p className="text-sm text-muted">{term.technical}</p>
          </div>
          {term.related.length > 0 && (
            <div>
              <div className="section-title mb-1.5">Related</div>
              <div className="flex flex-wrap gap-1.5">
                {term.related.map((r) => (
                  <span key={r} className="chip !text-[10px]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GlossaryPage() {
  const { glossary, academy } = useAcademy();
  const all = useMemo(() => glossary, [glossary]);
  const [params] = useSearchParams();
  const highlight = params.get('term') ?? undefined;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(all.map((t) => t.category))], [all]);
  const shown = all
    .filter((t) => cat === 'All' || t.category === cat)
    .filter((t) => {
      if (!q.trim()) return true;
      const query = q.toLowerCase();
      return t.term.toLowerCase().includes(query) || t.simple.toLowerCase().includes(query) || t.technical.toLowerCase().includes(query);
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="reference"
        title={academy.strings.glossaryTitle}
        sub={`${all.length} terms — each with a plain-language and a technical explanation.`}
      />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex max-w-sm flex-1 items-center gap-2 rounded-lg border border-line bg-base2/70 px-3 py-2">
          <Search size={14} className="text-dim" />
          <input className="w-full bg-transparent text-sm outline-none placeholder:text-dim" placeholder="Search terms…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button key={c} className={classNames('chip cursor-pointer', cat === c ? '!border-acid/60 !text-acid' : '')} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <EmptyState icon={<BookMarked size={26} />} title="No terms found" body="Try a different search or category." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((t) => (
            <TermCard key={t.term} term={t} highlight={highlight === t.term} />
          ))}
        </div>
      )}
      <Card className="mt-6 !p-4">
        <p className="text-xs text-muted">
          Terms are original explanations synthesized for this academy. For authoritative definitions, consult the
          official documentation linked on the Sources page (OWASP MASTG, Android Developers, AOSP).
        </p>
      </Card>
    </div>
  );
}
