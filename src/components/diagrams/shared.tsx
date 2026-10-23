import React from 'react';

// Shared building blocks for academy SVG diagrams. Originally written for the
// Android academy's diagrams; extracted here so the network diagram library
// can reuse the exact same visual language.

export const MONO = 'JetBrains Mono, Cascadia Code, Consolas, monospace';

export interface DProps {
  interactive?: boolean;
}

export function Frame({ children, vb = '0 0 920 400', h }: { children: React.ReactNode; vb?: string; h?: string }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-line bg-[#050b14] p-3">
      <svg viewBox={vb} className="mx-auto block w-full min-w-[640px]" style={{ maxHeight: h }}>
        {children}
      </svg>
    </div>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  stroke = '#38bdf8',
  fill = 'rgba(56,189,248,0.06)',
  onClick,
  active,
  small
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  stroke?: string;
  fill?: string;
  onClick?: () => void;
  active?: boolean;
  small?: boolean;
}) {
  const clickable = !!onClick;
  return (
    <g
      onClick={onClick}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      opacity={active === false ? 0.45 : 1}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? 2.5 : clickable ? 1.5 : 1}
        opacity={0.9}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle"
        fill="#e6edf3"
        fontSize={small ? 11 : 13}
        fontFamily={MONO}
        fontWeight={600}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
          {sub}
        </text>
      )}
    </g>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  color = '#38bdf8',
  dashed
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  color?: string;
  dashed?: boolean;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.5}
        markerEnd="url(#arrowHead)"
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {label && (
        <text x={mx} y={my - 6} textAnchor="middle" fill={color} fontSize={10} fontFamily={MONO}>
          {label}
        </text>
      )}
    </g>
  );
}

export const Defs = () => (
  <defs>
    <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#38bdf8" />
    </marker>
  </defs>
);

/** Small centered caption text used at the bottom of diagrams. */
export function Footnote({ x = 460, y, children }: { x?: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill="#5b6b7f" fontSize={10.5} fontFamily={MONO}>
      {children}
    </text>
  );
}

/** Node circle for topology-style diagrams. */
export function Node({
  x,
  y,
  r = 22,
  label,
  sub,
  color = '#38bdf8',
  filled
}: {
  x: number;
  y: number;
  r?: number;
  label: string;
  sub?: string;
  color?: string;
  filled?: boolean;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={filled ? color + '33' : 'rgba(11,18,32,0.9)'}
        stroke={color}
        strokeWidth={1.5}
      />
      <text x={x} y={y + (sub ? -2 : 4)} textAnchor="middle" fill="#e6edf3" fontSize={sub ? 11 : 10} fontFamily={MONO} fontWeight={600}>
        {label}
      </text>
      {sub && (
        <text x={x} y={y + 12} textAnchor="middle" fill="#8b98a9" fontSize={8.5} fontFamily={MONO}>
          {sub}
        </text>
      )}
    </g>
  );
}

/** Link line between two points for topology diagrams. */
export function Link({ x1, y1, x2, y2, color = '#38bdf8', dashed, width = 1.4 }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean; width?: number }) {
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '5 4' : undefined} opacity={0.75} />
  );
}
