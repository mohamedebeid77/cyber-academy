import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Card, PageHeader } from '../components/ui';
import { classNames } from '../utils/format';
import { useAcademy } from '../context/AcademyContext';
import type { Tool } from '../types';

export function StatusPill({ status }: { status: Tool['status'] }) {
  const map = {
    current: { label: 'CURRENT', cls: '!border-acid/50 !text-acid' },
    niche: { label: 'NICHE', cls: '!border-warn/50 !text-warn' },
    legacy: { label: 'LEGACY', cls: '!border-danger/50 !text-danger' }
  } as const;
  return <span className={classNames('chip', map[status].cls)}>{map[status].label}</span>;
}

export function useMergedTools() {
  const { tools } = useAcademy();
  return tools;
}

export default function ToolkitPage() {
  const { base, academy } = useAcademy();
  const all = useMergedTools();
  const categories = ['All', ...new Set(all.map((t) => t.category))];
  const [cat, setCat] = useState('All');
  const shown = cat === 'All' ? all : all.filter((t) => t.category === cat);

  return (
    <div className="animate-fade-up">
      <PageHeader
        kicker="reference"
        title={academy.strings.toolkitTitle}
        sub={academy.strings.toolkitSub}
      />
      <div className="mb-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} className={classNames('btn btn-sm', cat === c ? 'btn-primary' : 'btn-ghost')} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((t) => (
          <Link key={t.id} to={`${base}/toolkit/${t.id}`} className="card card-hover flex flex-col p-5">
            <div className="mb-2 flex items-center justify-between">
              <Wrench size={16} className="text-cyan" />
              <StatusPill status={t.status} />
            </div>
            <h3 className="font-semibold">{t.name}</h3>
            <div className="mt-0.5 font-mono text-[11px] text-dim">{t.category}</div>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{t.purpose}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
