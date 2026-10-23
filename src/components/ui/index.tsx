import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, ChevronDown, X } from 'lucide-react';
import type { Difficulty } from '../../types';
import { classNames } from '../../utils/format';

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames('card p-5', className)}>{children}</div>;
}

export function DifficultyPill({ level }: { level: Difficulty }) {
  const map: Record<Difficulty, string> = {
    Beginner: 'border-acid/40 text-acid bg-acid/10',
    Intermediate: 'border-warn/40 text-warn bg-warn/10',
    Advanced: 'border-danger/40 text-danger bg-danger/10'
  };
  return (
    <span className={classNames('rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider', map[level])}>
      {level}
    </span>
  );
}

export function ProgressBar({
  value,
  className,
  color = 'acid'
}: {
  value: number;
  className?: string;
  color?: 'acid' | 'cyan' | 'blue' | 'warn';
}) {
  const colors: Record<string, string> = {
    acid: 'from-acid/80 to-acid',
    cyan: 'from-cyan/70 to-cyan',
    blue: 'from-blue/70 to-blue',
    warn: 'from-warn/70 to-warn'
  };
  return (
    <div className={classNames('h-1.5 w-full rounded-full bg-line/60 overflow-hidden', className)}>
      <div
        className={classNames('h-full rounded-full bg-gradient-to-r transition-all duration-500', colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 44, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#1b2740" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22e58c" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4 flex items-center gap-4">
      {icon && <div className="rounded-lg border border-line bg-panel2/80 p-2.5 text-cyan shrink-0">{icon}</div>}
      <div className="min-w-0">
        <div className="section-title">{label}</div>
        <div className="text-xl font-bold font-mono mt-0.5 truncate">{value}</div>
        {sub && <div className="text-xs text-dim mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 pt-[8vh]" onClick={onClose}>
      <div
        className={classNames('card w-full animate-fade-up !bg-base2', wide ? 'max-w-3xl' : 'max-w-lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="font-mono text-sm uppercase tracking-wider text-cyan">{title}</h3>
          <button className="text-dim hover:text-ink" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = 'Click again to confirm',
  className
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return (
    <button
      className={classNames('btn-danger', armed && '!bg-danger/25 !border-danger', className)}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
          timer.current = setTimeout(() => setArmed(false), 3000);
        }
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="rounded-xl border border-line bg-panel2 p-4 text-dim">{icon}</div>
      <div className="font-semibold">{title}</div>
      {body && <div className="max-w-md text-sm text-muted">{body}</div>}
      {action}
    </div>
  );
}

export function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={classNames(
        'rounded-md border border-line bg-base2/80 text-dim hover:text-acid hover:border-acid/40 transition-colors',
        small ? 'p-1' : 'p-1.5'
      )}
      title="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={small ? 12 : 14} className="text-acid" /> : <Copy size={small ? 12 : 14} />}
    </button>
  );
}

export function Reveal({
  label,
  children,
  tone = 'cyan'
}: {
  label: string;
  children: React.ReactNode;
  tone?: 'cyan' | 'warn' | 'danger';
}) {
  const [open, setOpen] = useState(false);
  const toneMap = {
    cyan: 'border-cyan/40 text-cyan',
    warn: 'border-warn/40 text-warn',
    danger: 'border-danger/40 text-danger'
  };
  return (
    <div className="my-2">
      <button className={classNames('btn btn-ghost btn-sm', toneMap[tone])} onClick={() => setOpen(!open)}>
        {label}
        <ChevronDown size={14} className={classNames('transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3 animate-fade-in rounded-lg border border-line bg-base2/60 p-4">{children}</div>}
    </div>
  );
}

export function Tag({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="chip">
      {children}
      {onRemove && (
        <button onClick={onRemove} className="text-dim hover:text-danger" aria-label="Remove tag">
          <X size={10} />
        </button>
      )}
    </span>
  );
}

export function PageHeader({
  kicker,
  title,
  sub,
  actions
}: {
  kicker?: string;
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <div className="section-title mb-1.5">{kicker}</div>}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1.5 font-mono text-xs text-dim">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-line">/</span>}
          {it.to ? (
            <Link to={it.to} className="hover:text-cyan">
              {it.label}
            </Link>
          ) : (
            <span className="text-muted">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
