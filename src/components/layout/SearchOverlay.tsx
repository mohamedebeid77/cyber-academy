import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft } from 'lucide-react';
import type { AppData, Lesson } from '../../types';
import type { Module } from '../../types';
import type { Lab, CTFChallenge, Tool, CheatSheet, GlossaryTerm, SourceRef } from '../../types';
import { searchEntries } from '../../services/search';
import type { SearchEntry } from '../../services/search';
import { classNames } from '../../utils/format';

export function buildSearchIndex(data: {
  modules: Module[];
  labs: Lab[];
  ctf: CTFChallenge[];
  tools: Tool[];
  cheatsheets: CheatSheet[];
  glossary: GlossaryTerm[];
  sources: SourceRef[];
  notes: { id: string; lessonId: string; text: string }[];
  /** Academy route prefix, e.g. '/app' or '/network'. */
  routeBase: string;
  lessonRoute: (lessonId: string) => string;
  lessonTitle: (lessonId: string) => string;
}): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const rb = data.routeBase;
  for (const m of data.modules) {
    entries.push({
      type: 'Module',
      id: m.id,
      title: m.title,
      subtitle: `Module · ${m.lessons.length} lessons`,
      route: `${rb}/path/module/${m.id}`,
      text: m.description
    });
    for (const l of m.lessons) {
      entries.push({
        type: 'Lesson',
        id: l.id,
        title: l.title,
        subtitle: `Lesson · ${m.title}`,
        route: data.lessonRoute(l.id),
        text:
          l.objectives.join(' ') +
          ' ' +
          Object.values(l.sections)
            .flat()
            .map((b) => {
              switch (b.type) {
                case 'p':
                case 'h':
                  return b.text;
                case 'list':
                  return b.items.join(' ');
                case 'code':
                  return b.code;
                case 'terminal':
                  return b.lines.join(' ');
                case 'callout':
                  return b.text;
                default:
                  return '';
              }
            })
            .join(' ')
      });
    }
  }
  for (const l of data.labs) {
    entries.push({ type: 'Lab', id: l.id, title: l.title, subtitle: `Lab · ${l.difficulty} · ${l.points} pts`, route: `${rb}/labs/${l.id}`, text: l.scenario + ' ' + l.objective + ' ' + l.expectedFindings.join(' ') });
  }
  for (const c of data.ctf) {
    entries.push({ type: 'Challenge', id: c.id, title: `${c.code} — ${c.title}`, subtitle: `CTF · ${c.difficulty} · ${c.points} pts`, route: `${rb}/ctf/${c.id}`, text: c.objective + ' ' + c.category });
  }
  for (const t of data.tools) {
    entries.push({ type: 'Tool', id: t.id, title: t.name, subtitle: `Tool · ${t.category}`, route: `${rb}/toolkit/${t.id}`, text: t.purpose + ' ' + t.usage });
  }
  for (const c of data.cheatsheets) {
    entries.push({ type: 'Cheat Sheet', id: c.id, title: c.title, subtitle: `Cheat Sheet · ${c.category}`, route: `${rb}/cheatsheets/${c.id}`, text: c.description + ' ' + c.entries.map((e) => e.cmd).join(' ') });
  }
  for (const g of data.glossary) {
    entries.push({ type: 'Glossary', id: g.term, title: g.term, subtitle: `Glossary · ${g.category}`, route: `${rb}/glossary?term=${encodeURIComponent(g.term)}`, text: g.simple + ' ' + g.technical });
  }
  for (const s of data.sources) {
    entries.push({ type: 'Source', id: s.id, title: s.name, subtitle: `Source · ${s.category}`, route: `${rb}/sources`, text: s.whatFor });
  }
  for (const n of data.notes) {
    entries.push({ type: 'Note', id: n.id, title: `Note on “${data.lessonTitle(n.lessonId)}”`, subtitle: 'Your note', route: `${rb}/notes?highlight=${n.id}`, text: n.text });
  }
  return entries;
}

const TYPE_COLORS: Record<string, string> = {
  Lesson: 'text-acid border-acid/40',
  Module: 'text-cyan border-cyan/40',
  Lab: 'text-warn border-warn/40',
  Challenge: 'text-violet border-violet/40',
  Tool: 'text-blue border-blue/40',
  'Cheat Sheet': 'text-cyan border-cyan/40',
  Glossary: 'text-acid border-acid/40',
  Source: 'text-dim border-line',
  Note: 'text-warn border-warn/40'
};

export function SearchOverlay({
  open,
  onClose,
  index
}: {
  open: boolean;
  onClose: () => void;
  index: SearchEntry[];
}) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchEntries(index, q), [index, q]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  const go = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4 pt-[10vh]" onClick={onClose}>
      <div className="card mx-auto max-w-2xl !bg-base2 animate-fade-up overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="text-dim" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter' && results[sel]) {
                go(results[sel].route);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Search lessons, labs, tools, glossary, notes…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-dim"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="max-h-[52vh] overflow-y-auto">
          {q && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-dim">No results for “{q}”.</div>
          )}
          {!q && (
            <div className="px-4 py-6 text-center text-xs text-dim">
              Search across lessons, modules, labs, CTF, toolkit, cheat sheets, glossary, sources and your notes.
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={r.type + r.id}
              className={classNames(
                'flex w-full items-center gap-3 border-l-2 px-4 py-2.5 text-left transition-colors',
                i === sel ? 'border-acid bg-panel2/80' : 'border-transparent hover:bg-panel2/40'
              )}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(r.route)}
            >
              <span className={classNames('rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase', TYPE_COLORS[r.type])}>
                {r.type}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink">{r.title}</span>
                <span className="block truncate text-xs text-dim">{r.subtitle}</span>
              </span>
              {i === sel && <CornerDownLeft size={14} className="text-dim" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
