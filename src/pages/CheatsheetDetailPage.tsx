import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Card, CopyButton } from '../components/ui';
import { useAcademy } from '../context/AcademyContext';
import { useMergedCheatsheets } from './CheatsheetsPage';

export default function CheatsheetDetailPage() {
  const { sheetId } = useParams();
  const { base } = useAcademy();
  const sheets = useMergedCheatsheets();
  const sheet = sheets.find((s) => s.id === sheetId);
  const [q, setQ] = useState('');

  const entries = useMemo(() => {
    if (!sheet) return [];
    const query = q.toLowerCase().trim();
    if (!query) return sheet.entries;
    return sheet.entries.filter((e) => e.cmd.toLowerCase().includes(query) || e.desc.toLowerCase().includes(query));
  }, [sheet, q]);

  if (!sheet) return <Navigate to={`${base}/cheatsheets`} replace />;

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-title mb-1">{sheet.category}</div>
          <h1 className="text-2xl font-bold tracking-tight">{sheet.title}</h1>
          <p className="mt-1 text-sm text-muted">{sheet.description}</p>
        </div>
        <Link to={`${base}/cheatsheets`} className="btn-ghost btn-sm">
          <ArrowLeft size={14} /> All cheat sheets
        </Link>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={15} className="text-dim" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-dim"
            placeholder="Filter commands in this sheet…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <span className="font-mono text-[11px] text-dim">
            {entries.length}/{sheet.entries.length}
          </span>
        </div>
        {entries.length === 0 ? (
          <div className="p-8 text-center text-sm text-dim">No commands match “{q}”.</div>
        ) : (
          <div>
            {entries.map((e, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0 odd:bg-panel2/30">
                <code className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-[12.5px] leading-relaxed text-acid">
                  {e.cmd}
                </code>
                <span className="max-w-[40%] shrink-0 text-right text-xs leading-relaxed text-muted">{e.desc}</span>
                <CopyButton text={e.cmd} small />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
