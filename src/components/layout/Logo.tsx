export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Cyber Academy">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22e58c" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M32 3 58 17v30L32 61 6 47V17z" fill="#04070d" stroke="url(#lg1)" strokeWidth="3" />
      <path d="M22 28a10 10 0 0 1 20 0v8H22z" fill="url(#lg1)" />
      <rect x="17" y="18" width="3" height="7" rx="1.5" fill="url(#lg1)" transform="rotate(-25 18.5 21.5)" />
      <rect x="44" y="18" width="3" height="7" rx="1.5" fill="url(#lg1)" transform="rotate(25 45.5 21.5)" />
      <circle cx="26.5" cy="31" r="2" fill="#04070d" />
      <circle cx="37.5" cy="31" r="2" fill="#04070d" />
      <rect x="21" y="39" width="22" height="4" rx="2" fill="#38bdf8" />
    </svg>
  );
}
