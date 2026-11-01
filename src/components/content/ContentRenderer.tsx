import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IMAGE_META } from '../../data/imageMeta';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  StickyNote,
  Scale,
  ImageOff,
  Maximize2,
  X
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
// Image figure (real screenshots inside lessons)
// ---------------------------------------------------------------------------

type ImageBlock = Extract<ContentBlock, { type: 'image' }>;

/** Real-image figure with lazy loading, graceful fallback and a lightbox.
 *  src is a file under public/<basePath> (default lesson-images/) or a full https URL. */
export function SmartImage({
  src,
  alt,
  caption,
  note,
  credit,
  sourceUrl,
  basePath = 'lesson-images/'
}: {
  src: string;
  alt: string;
  caption?: string;
  note?: string;
  credit?: string;
  sourceUrl?: string;
  basePath?: string;
}) {
  const [zoom, setZoom] = useState(false);
  const [failed, setFailed] = useState(false);
  const openRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const url = /^https?:\/\//.test(src) ? src : import.meta.env.BASE_URL + basePath + src;
  // intrinsic dimensions from the generated manifest reserve layout space while loading
  const dims = IMAGE_META[src.split('/').pop() ?? ''];

  useEffect(() => {
    if (!zoom) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setZoom(false);
    window.addEventListener('keydown', handler);
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      openRef.current?.focus();
    };
  }, [zoom]);

  return (
    <figure className="my-5">
      <div className="group relative overflow-hidden rounded-lg border border-line bg-[#050a12]">
        {failed ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <ImageOff size={20} className="text-dim" />
            <span className="font-mono text-[11px] text-dim">Image unavailable — {alt}</span>
          </div>
        ) : (
          <button
            ref={openRef}
            type="button"
            className="block w-full cursor-zoom-in"
            onClick={() => setZoom(true)}
            aria-label={'Enlarge image: ' + alt}
          >
            <img
              src={url}
              alt={alt}
              loading="lazy"
              decoding="async"
              {...(dims ? { width: dims[0], height: dims[1] } : {})}
              onError={() => setFailed(true)}
              className="mx-auto block h-auto max-h-[540px] w-auto max-w-full"
            />
            <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-md border border-line bg-base2/85 px-2 py-1 font-mono text-[10px] text-dim opacity-0 transition-opacity group-hover:opacity-100">
              <Maximize2 size={11} /> enlarge
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center font-mono text-[11px] leading-relaxed text-dim">
          {caption}
        </figcaption>
      )}
      {note && <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{note}</p>}
      {(credit || sourceUrl) && (
        <div className="mt-1 text-center font-mono text-[10px] text-dim/70">
          {credit}
          {sourceUrl && (
            <>
              {' · '}
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-muted">
                source
              </a>
            </>
          )}
        </div>
      )}

      {zoom && !failed && createPortal(
        <div
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={caption ?? alt}
          onClick={() => setZoom(false)}
        >
          <button
            ref={closeRef}
            type="button"
            className="absolute right-4 top-4 rounded-md border border-white/15 bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
            onClick={() => setZoom(false)}
            aria-label="Close enlarged image"
          >
            <X size={18} />
          </button>
          <img
            src={url}
            alt={alt}
            className="max-h-[82vh] max-w-[94vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {(caption || credit) && (
            <div className="mt-3 max-w-[80vw] text-center">
              {caption && <div className="font-mono text-xs text-white/80">{caption}</div>}
              {credit && <div className="mt-0.5 font-mono text-[10px] text-white/45">{credit}</div>}
            </div>
          )}
        </div>,
        document.body
      )}
    </figure>
  );
}

function ImageFigure({ block }: { block: ImageBlock }) {
  // "tool:<file>" reuses a tool-image asset; everything else lives under lesson-images/
  const isTool = block.src.startsWith('tool:');
  return (
    <SmartImage
      src={isTool ? block.src.slice(5) : block.src}
      basePath={isTool ? 'tool-images/' : 'lesson-images/'}
      alt={block.alt}
      caption={block.caption}
      note={block.note}
      credit={block.credit}
      sourceUrl={block.sourceUrl}
    />
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
    case 'image':
      return <ImageFigure block={block} />;
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
