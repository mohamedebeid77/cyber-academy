import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TerminalSquare } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { classNames } from '../utils/format';
import { useAcademy } from '../context/AcademyContext';

export function useMergedCheatsheets() {
  const { cheatsheets } = useAcademy();
  return cheatsheets;
}

export default function CheatsheetsPage() {
  const { base } = useAcademy();
  const sheets = useMergedCheatsheets();
  const [q, setQ] = useState('');
  const shown = sheets.filter(
    (s) => !q || s.title.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="reference"
        title="Cheat Sheets"
        sub="Copy-friendly command references. Every entry has a one-click copy button."
      />
      <input className="input mb-5 max-w-md" placeholder="Filter cheat sheets…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((s) => (
          <Link key={s.id} to={`${base}/cheatsheets/${s.id}`} className="card card-hover flex flex-col p-5">
            <div className="mb-2 flex items-center justify-between">
              <TerminalSquare size={16} className="text-cyan" />
              <span className="chip">{s.category}</span>
            </div>
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{s.description}</p>
            <div className={classNames('mt-3 font-mono text-[11px] text-dim')}>{s.entries.length} entries</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
