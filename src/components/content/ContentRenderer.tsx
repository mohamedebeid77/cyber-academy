import React from 'react';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  StickyNote,
  Scale
} from 'lucide-react';
import type { CalloutVariant, ContentBlock, SectionKey } from '../../types';
import { SECTION_META } from '../../types';
import { Diagram } from '../diagrams';
import { CopyButton } from '../ui';
import { classNames } from '../../utils/format';

// ---------------------------------------------------------------------------
// Code block & terminal
// ---------------------------------------------------------------------------

export function CodeBlock({ lang, code, title }: { lang: string; code: string; title?: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-line bg-[#050a12]">
      <div className="flex items-center justify-between border-b border-line bg-panel2/60 px-3 py-1.5">
        <div className="flex items-center gap-2 font-mono text-[11px] text-dim">
          <span className="text-acid">›</span>
          {title ?? lang}
        </div>
        <CopyButton text={code} small />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#c9d6e4]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function TerminalBlock({ lines, title }: { lines: string[]; title?: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-line bg-[#03060c] shadow-panel">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel2/60 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-acid/70" />
        <span className="ml-2 font-mono text-[11px] text-dim">{title ?? 'terminal'}</span>
      </div>
      <div className="p-4 font-mono text-[12.5px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap break-all">
            {l.startsWith('$ ') ? (
              <span>
                <span className="text-acid">$</span>
                <span className="text-[#c9d6e4]">{l.slice(1)}</span>
              </span>
            ) : l.startsWith('#') ? (
              <span className="text-dim">{l}</span>
            ) : (
              <span className="text-[#8fb3c9]">{l}</span>
            )}
          </div>
        ))}
        <span className="text-acid">$ <span className="inline-block h-3.5 w-2 translate-y-0.5 bg-acid/80 animate-blink" /></span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Callouts
// ---------------------------------------------------------------------------

const CALLOUT_STYLES: Record<CalloutVariant, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
  info: { icon: <Info size={16} />, border: 'border-cyan/40', bg: 'bg-cyan/5', text: 'text-cyan' },
  tip: { icon: <Lightbulb size={16} />, border: 'border-acid/40', bg: 'bg-acid/5', text: 'text-acid' },
  warn: { icon: <AlertTriangle size={16} />, border: 'border-warn/45', bg: 'bg-warn/5', text: 'text-warn' },
  danger: { icon: <ShieldAlert size={16} />, border: 'border-danger/45', bg: 'bg-danger/5', text: 'text-danger' },
  note: { icon: <StickyNote size={16} />, border: 'border-blue/40', bg: 'bg-blue/5', text: 'text-blue' },
  legal: { icon: <Scale size={16} />, border: 'border-violet/45', bg: 'bg-violet/5', text: 'text-violet' }
};

function Callout({ variant, title, text }: { variant: CalloutVariant; title?: string; text: string }) {
  const s = CALLOUT_STYLES[variant];
  return (
    <div className={classNames('my-4 flex gap-3 rounded-lg border px-4 py-3', s.border, s.bg)}>
      <div className={classNames('mt-0.5 shrink-0', s.text)}>{s.icon}</div>
      <div className="text-sm leading-relaxed">
        {(title ?? variant === 'legal') && (
          <div className={classNames('mb-0.5 font-mono text-xs font-semibold uppercase tracking-wider', s.text)}>
            {title ?? (variant === 'legal' ? 'Legal & Authorization' : variant)}
          </div>
        )}
        <span className="text-muted">{text}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

export function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="my-3 text-[15px] leading-relaxed text-[#c3cdd9]">{block.text}</p>;
    case 'h':
      return <h4 className="mb-2 mt-6 font-mono text-sm font-semibold uppercase tracking-wider text-ink">{block.text}</h4>;
    case 'list': {
      const items = block.items.map((it, i) => (
        <li key={i} className="my-1 text-[14.5px] leading-relaxed text-[#c3cdd9]">
          {it}
        </li>
      ));
      return block.ordered ? (
        <ol className="my-3 list-decimal space-y-0.5 pl-6 marker:font-mono marker:text-acid/70">{items}</ol>
      ) : (
        <ul className="my-3 list-disc space-y-0.5 pl-6 marker:text-acid/70">{items}</ul>
      );
    }
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} title={block.title} />;
    case 'terminal':
      return <TerminalBlock lines={block.lines} title={block.title} />;
    case 'callout':
      return <Callout variant={block.variant} title={block.title} text={block.text} />;
    case 'table':
      return (
        <div className="my-4 overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-panel2/70">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-cyan">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-line/50 last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-2.5 align-top text-[#c3cdd9]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'diagram':
      return (
        <figure className="my-5">
          <Diagram id={block.id} />
          {block.caption && <figcaption className="mt-2 text-center font-mono text-[11px] text-dim">{block.caption}</figcaption>}
        </figure>
      );
    case 'compare':
      return (
        <div className="my-5">
          {block.title && <div className="mb-2 text-center font-mono text-xs uppercase tracking-wider text-dim">{block.title}</div>}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="overflow-hidden rounded-lg border border-danger/40">
              <div className="border-b border-danger/30 bg-danger/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-danger">
                {block.beforeTitle}
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[#d9b8b8]">
                <code>{block.beforeCode}</code>
              </pre>
            </div>
            <div className="overflow-hidden rounded-lg border border-acid/40">
              <div className="border-b border-acid/30 bg-acid/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-acid">
                {block.afterTitle}
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-[#b8d9c2]">
                <code>{block.afterCode}</code>
              </pre>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function SectionBody({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

export const SECTION_ORDER: SectionKey[] = [
  'idea',
  'technical',
  'pentestRelevance',
  'lookFor',
  'howToTest',
  'example',
  'tools',
  'mistakes',
  'tryIt',
  'takeaways'
];
