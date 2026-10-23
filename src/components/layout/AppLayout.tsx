import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  Compass,
  Map as MapIcon,
  FlaskConical,
  Trophy,
  Wrench,
  TerminalSquare,
  BookMarked,
  BookOpen,
  StickyNote,
  Bookmark,
  BarChart3,
  Library,
  Settings as SettingsIcon,
  FolderGit2,
  Search,
  Flame,
  Menu,
  X,
  Zap,
  ChevronDown,
  GraduationCap,
  Network,
  Smartphone,
  Apple,
  CircleDashed
} from 'lucide-react';
import { useAcademy } from '../../context/AcademyContext';
import { ACADEMIES } from '../../academies';
import { Logo } from './Logo';
import { SearchOverlay, buildSearchIndex } from './SearchOverlay';
import { XP_PER_LEVEL } from '../../data/meta';
import { classNames } from '../../utils/format';

function navGroups(base: string) {
  return [
    {
      group: 'Learn',
      items: [
        { to: `${base}/dashboard`, label: 'Dashboard', icon: <LayoutDashboard size={17} />, end: false },
        { to: `${base}/path`, label: 'Learning Path', icon: <Route size={17} />, end: true },
        { to: `${base}/my-path`, label: 'My Learning Path', icon: <Compass size={17} />, end: false },
        { to: `${base}/roadmap`, label: 'Roadmap', icon: <MapIcon size={17} />, end: false }
      ]
    },
    {
      group: 'Practice',
      items: [
        { to: `${base}/labs`, label: 'Labs', icon: <FlaskConical size={17} />, end: false },
        { to: `${base}/ctf`, label: 'CTF', icon: <Trophy size={17} />, end: false }
      ]
    },
    {
      group: 'Reference',
      items: [
        { to: `${base}/toolkit`, label: 'Toolkit', icon: <Wrench size={17} />, end: true },
        { to: `${base}/cheatsheets`, label: 'Cheat Sheets', icon: <TerminalSquare size={17} />, end: false },
        { to: `${base}/glossary`, label: 'Glossary', icon: <BookMarked size={17} />, end: false },
        { to: `${base}/sources`, label: 'Sources', icon: <Library size={17} />, end: false }
      ]
    },
    {
      group: 'Workspace',
      items: [
        { to: `${base}/notes`, label: 'Notes', icon: <StickyNote size={17} />, end: false },
        { to: `${base}/bookmarks`, label: 'Bookmarks', icon: <Bookmark size={17} />, end: false },
        { to: `${base}/progress`, label: 'Progress', icon: <BarChart3 size={17} />, end: false }
      ]
    },
    {
      group: 'System',
      items: [
        { to: `${base}/admin`, label: 'Content Studio', icon: <FolderGit2 size={17} />, end: false },
        { to: `${base}/settings`, label: 'Settings', icon: <SettingsIcon size={17} />, end: false }
      ]
    }
  ];
}

function AcademyIcon({ id, size = 15 }: { id: string; size?: number }) {
  if (id === 'network') return <Network size={size} />;
  if (id === 'android') return <Smartphone size={size} />;
  if (id === 'ios') return <Apple size={size} />;
  return <GraduationCap size={size} />;
}

function AcademySwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const { academy } = useAcademy();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const others = ACADEMIES.filter((a) => a.id !== academy.id);

  return (
    <div className="relative px-3 pt-3">
      <button
        className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-base2/70 px-3 py-2 text-left transition-colors hover:border-cyan/40"
        onClick={() => setOpen(!open)}
      >
        <span className="text-acid">
          <AcademyIcon id={academy.id} size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11px] font-bold text-ink">{academy.brandLines[0]} {academy.brandLines[1]}</span>
          <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-dim">active academy</span>
        </span>
        <ChevronDown size={14} className={classNames('shrink-0 text-dim transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute inset-x-3 z-10 mt-1 animate-fade-in overflow-hidden rounded-lg border border-line bg-base2 shadow-panel">
          {others.map((a) => (
            <button
              key={a.id}
              className={classNames(
                'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors',
                a.status === 'live' ? 'hover:bg-panel2' : 'cursor-default opacity-45'
              )}
              onClick={() => {
                if (a.status !== 'live') return;
                setOpen(false);
                onNavigate?.();
                navigate(a.status === 'live' ? `${a.base}/dashboard` : a.base);
              }}
            >
              <span className="text-cyan">
                <AcademyIcon id={a.id} size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-ink">{a.name}</span>
                <span className="block truncate text-[10px] text-dim">{a.tagline}</span>
              </span>
              {a.status === 'soon' ? (
                <span className="chip !text-[8px]"><CircleDashed size={9} /> SOON</span>
              ) : (
                <span className="font-mono text-[9px] text-dim">switch →</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { academy, base } = useAcademy();
  const groups = useMemo(() => navGroups(base), [base]);
  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" className="flex items-center gap-3 border-b border-line px-5 py-4" onClick={onNavigate}>
        <Logo size={36} />
        <div>
          <div className="font-mono text-[13px] font-bold leading-tight tracking-wide">
            {academy.brandLines[0]} <span className="text-gradient">{academy.brandLines[1]}</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.35em] text-dim">CYBER ACADEMY</div>
        </div>
      </NavLink>
      <AcademySwitcher onNavigate={onNavigate} />
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.group} className="mb-5">
            <div className="section-title mb-2 px-2">{g.group}</div>
            {g.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  classNames(
                    'mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors',
                    isActive
                      ? 'bg-acid/10 font-semibold text-acid'
                      : 'text-muted hover:bg-panel2/70 hover:text-ink'
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-3">
        <div className="font-mono text-[10px] text-dim">v2.0 · local-first · offline</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-dim">
          <span className="glow-dot" />
          authorized testing only
        </div>
      </div>
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useAcademy();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto card animate-fade-up !border-acid/40 p-3.5"
          onClick={() => dismissToast(t.id)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-acid">
              {t.icon === 'badge' ? <Zap size={18} /> : t.icon === 'flag' ? <Flame size={18} /> : <Zap size={18} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.body && <div className="mt-0.5 text-xs text-muted">{t.body}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AppLayout() {
  const { data, stats, lessonMap, modules, labs, ctfChallenges, tools, cheatsheets, glossary, sources, base, academy } =
    useAcademy();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const navigate = useNavigate();

  const searchIndex = useMemo(
    () =>
      buildSearchIndex({
        modules,
        labs,
        ctf: ctfChallenges,
        tools,
        cheatsheets,
        glossary,
        sources,
        notes: data.notes,
        routeBase: base,
        lessonRoute: (id) => `${base}/lesson/${id}`,
        lessonTitle: (id) => lessonMap.get(id)?.lesson.title ?? id
      }),
    [data, lessonMap, modules, labs, ctfChallenges, tools, cheatsheets, glossary, sources, base]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('motion-off', data.settings.reduceMotion);
  }, [data.settings.reduceMotion]);

  const level = stats.level;
  const xpPct = Math.round((stats.xpIntoLevel / XP_PER_LEVEL) * 100);

  return (
    <div className={classNames('flex min-h-screen', academy.themeClass)}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line bg-base2/80 backdrop-blur-md lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileNav(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-base2" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-3 top-3 text-dim hover:text-ink" onClick={() => setMobileNav(false)}>
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileNav(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-base/85 px-4 py-2.5 backdrop-blur-md">
          <button className="btn-ghost btn-sm lg:hidden !border-0" onClick={() => setMobileNav(true)} aria-label="Menu">
            <Menu size={20} />
          </button>
          <button
            className="flex flex-1 items-center gap-2.5 rounded-lg border border-line bg-base2/70 px-3 py-1.5 text-left text-sm text-dim transition-colors hover:border-cyan/40 sm:max-w-md"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={15} />
            <span className="flex-1 truncate">Search {academy.name}…</span>
            <span className="kbd hidden sm:inline">Ctrl K</span>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-1.5 font-mono text-xs text-warn sm:flex" title="Study streak">
              <Flame size={15} />
              {stats.streak}d
            </div>
            <button
              className="hidden flex-col items-end sm:flex"
              onClick={() => navigate(`${base}/progress`)}
              title={`${stats.xp} XP`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-acid">LV {level}</span>
                <span className="font-mono text-[11px] text-dim">{stats.xp} XP</span>
              </div>
              <div className="mt-1 h-1 w-28 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-gradient-to-r from-acid to-cyan" style={{ width: `${xpPct}%` }} />
              </div>
            </button>
            <NavLink
              to={`${base}/settings`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-acid/50 bg-acid/10 font-mono text-sm font-bold text-acid"
              title={data.settings.userName}
            >
              {data.settings.userName.slice(0, 1).toUpperCase() || 'U'}
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} index={searchIndex} />
      <Toasts />
    </div>
  );
}
