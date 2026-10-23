import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type {
  AppData,
  CustomContent,
  Lesson,
  Module,
  Settings,
  Note,
  Tool,
  CheatSheet,
  GlossaryTerm,
  SourceRef,
  Lab,
  CTFChallenge
} from '../types';
import type { AcademyDefinition, AcademyLevelMeta, RoadmapStage } from '../academies/types';
import type { BadgeDef, SkillNode } from '../data/meta';
import { mergeModules } from '../data/curriculum';
import { LEVEL_NAMES, XP_PER_LEVEL, XP_RULES } from '../data/meta';
import { defaultData, loadData, saveData } from '../services/storage';
import { localDate, uid } from '../utils/format';

export interface CurriculumEntry {
  lesson: Lesson;
  module: Module;
  index: number;
}

export interface AcademyStats {
  totalLessons: number;
  completedLessons: number;
  totalModules: number;
  completedModules: number;
  xp: number;
  level: number;
  levelName: string;
  xpIntoLevel: number;
  xpToNext: number;
  streak: number;
  labsSolved: number;
  totalLabs: number;
  ctfSolved: number;
  ctfPoints: number;
  studyToday: number;
  studyTotal: number;
  quizAvg: number | null;
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
  icon?: 'badge' | 'xp' | 'info' | 'flag';
}

type BookmarkKind = 'lessons' | 'labs' | 'tools' | 'cheatsheets' | 'sources';

interface AcademyContextValue {
  /** The academy this provider instance serves — content, meta, routes, theme. */
  academy: AcademyDefinition;
  /** Route prefix shortcut (= academy.base). */
  base: string;
  data: AppData;
  modules: Module[];
  entries: CurriculumEntry[];
  lessonMap: Map<string, CurriculumEntry>;
  stats: AcademyStats;
  nextUp: CurriculumEntry | null;
  continueEntry: CurriculumEntry | null;
  recentBadges: string[];
  // Academy content (built-in merged with custom)
  labs: Lab[];
  ctfChallenges: CTFChallenge[];
  tools: Tool[];
  cheatsheets: CheatSheet[];
  glossary: GlossaryTerm[];
  sources: SourceRef[];
  // Academy meta
  badges: BadgeDef[];
  skillTree: SkillNode[];
  levelMeta: Record<number, AcademyLevelMeta>;
  roadmapStages: RoadmapStage[];
  // helpers
  moduleCompletion: (moduleId: string) => number;
  isLessonComplete: (lessonId: string) => boolean;
  isBookmarked: (kind: BookmarkKind, id: string) => boolean;
  // actions
  visitLesson: (lessonId: string) => void;
  addLessonSeconds: (lessonId: string, seconds: number) => void;
  completeLesson: (lessonId: string) => void;
  toggleDifficult: (lessonId: string) => void;
  submitQuiz: (lessonId: string, score: number, total: number) => void;
  setChecklistItem: (key: string, value: boolean) => void;
  toggleBookmark: (kind: BookmarkKind, id: string) => void;
  saveNote: (lessonId: string, text: string, tags: string[], noteId?: string) => void;
  deleteNote: (noteId: string) => void;
  solveLab: (labId: string) => void;
  revealLabHint: (labId: string) => void;
  revealCtfHint: (challengeId: string) => void;
  submitFlag: (challengeId: string, inputFlag: string, expectedFlag: string, points: number) => boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  updateCustom: (patch: Partial<CustomContent>) => void;
  importData: (incoming: AppData) => void;
  resetProgress: () => void;
  resetAll: () => void;
  // toasts
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

function touchDay(prev: AppData): AppData {
  const today = localDate();
  if (prev.progress.activityDays.includes(today)) return prev;
  return {
    ...prev,
    progress: {
      ...prev.progress,
      activityDays: [...prev.progress.activityDays, today],
      xp: prev.progress.xp + XP_RULES.streakDay
    }
  };
}

function computeStreak(days: string[]): number {
  if (days.length === 0) return 0;
  const set = new Set(days);
  const d = new Date();
  const today = localDate(d);
  const yesterday = localDate(new Date(d.getTime() - 86400000));
  if (!set.has(today) && !set.has(yesterday)) return 0;
  let streak = 0;
  const cursor = new Date(set.has(today) ? d.getTime() : d.getTime() - 86400000);
  while (set.has(localDate(cursor))) {
    streak += 1;
    cursor.setTime(cursor.getTime() - 86400000);
  }
  return streak;
}

function evalBadges(
  badges: BadgeDef[],
  data: AppData,
  ctx: { completedLessons: number; totalLessons: number; completeModuleIds: Set<string>; lessonsByModule: Map<string, number> }
): string[] {
  const earned: string[] = [];
  for (const badge of badges) {
    if (data.progress.badges.includes(badge.id)) continue;
    const c = badge.criterion;
    let ok = false;
    switch (c.kind) {
      case 'lessonsCompleted':
        ok = ctx.completedLessons >= c.count;
        break;
      case 'modulesComplete':
        ok = c.moduleIds.every((m) => ctx.completeModuleIds.has(m));
        break;
      case 'anyLessonInModules':
        ok = c.moduleIds.some((m) => (ctx.lessonsByModule.get(m) ?? 0) > 0);
        break;
      case 'labsSolved':
        ok = Object.values(data.progress.labs).filter((l) => l.solved).length >= c.count;
        break;
      case 'ctfSolved':
        ok = Object.values(data.progress.ctf).filter((c2) => c2.solved).length >= c.count;
        break;
      case 'lessonsCompletedPct':
        ok = ctx.totalLessons > 0 && (ctx.completedLessons / ctx.totalLessons) * 100 >= c.pct;
        break;
    }
    if (ok) earned.push(badge.id);
  }
  return earned;
}

export function AcademyProvider({ academy, children }: { academy: AcademyDefinition; children: React.ReactNode }) {
  const storageKey = academy.storageKey;
  const [data, setData] = useState<AppData>(() => loadData(storageKey));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastLevel = useRef(0);

  useEffect(() => {
    saveData(storageKey, data);
  }, [storageKey, data]);

  useEffect(() => {
    const lvl = Math.floor(data.progress.xp / XP_PER_LEVEL) + 1;
    if (lastLevel.current && lvl > lastLevel.current) {
      pushToast({
        title: `Level up — ${LEVEL_NAMES[Math.min(lvl - 1, LEVEL_NAMES.length - 1)]}`,
        body: `You reached level ${lvl}.`,
        icon: 'xp'
      });
    }
    lastLevel.current = lvl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.progress.xp]);

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid('toast');
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // ------------------------------------------------------------------
  // Derived content — built-in academy content merged with user custom content
  // ------------------------------------------------------------------
  const modules = useMemo(
    () => mergeModules(academy.content.modules, data.custom.modules, data.custom.lessons),
    [academy, data.custom.modules, data.custom.lessons]
  );

  const labs = useMemo(() => [...academy.content.labs, ...data.custom.labs], [academy, data.custom.labs]);
  const ctfChallenges = useMemo(() => [...academy.content.ctf, ...data.custom.ctf], [academy, data.custom.ctf]);
  const tools = useMemo(() => [...academy.content.tools, ...data.custom.tools], [academy, data.custom.tools]);
  const cheatsheets = useMemo(() => [...academy.content.cheatsheets, ...data.custom.cheatsheets], [academy, data.custom.cheatsheets]);
  const glossary = useMemo(() => [...academy.content.glossary, ...data.custom.glossary], [academy, data.custom.glossary]);
  const sources = useMemo(() => [...academy.content.sources, ...data.custom.sources], [academy, data.custom.sources]);

  const entries = useMemo<CurriculumEntry[]>(() => {
    const list: CurriculumEntry[] = [];
    for (const m of modules) {
      for (const l of m.lessons) {
        list.push({ lesson: l, module: m, index: list.length });
      }
    }
    return list;
  }, [modules]);

  const lessonMap = useMemo(() => {
    const map = new Map<string, CurriculumEntry>();
    for (const e of entries) map.set(e.lesson.id, e);
    return map;
  }, [entries]);

  // ------------------------------------------------------------------
  // Derived stats
  // ------------------------------------------------------------------
  const stats = useMemo<AcademyStats>(() => {
    const completed = entries.filter((e) => data.progress.lessons[e.lesson.id]?.completed).length;
    const completedModuleIds = new Set(
      modules.filter((m) => m.lessons.length > 0 && m.lessons.every((l) => data.progress.lessons[l.id]?.completed)).map((m) => m.id)
    );
    const lessonsByModule = new Map<string, number>();
    for (const m of modules) {
      lessonsByModule.set(
        m.id,
        m.lessons.filter((l) => data.progress.lessons[l.id]?.completed).length
      );
    }
    const labsSolved = Object.values(data.progress.labs).filter((l) => l.solved).length;
    const ctfSolvedList = Object.values(data.progress.ctf).filter((c) => c.solved);
    const allChallenges = ctfChallenges;
    const ctfPoints = allChallenges
      .filter((c) => data.progress.ctf[c.id]?.solved)
      .reduce((a, c) => a + c.points, 0);
    const studyTotal = Object.values(data.progress.studyByDay).reduce((a, b) => a + b, 0);
    const today = localDate();
    const quizScores = entries
      .map((e) => data.progress.lessons[e.lesson.id]?.quiz)
      .filter((q): q is NonNullable<typeof q> => !!q && q.total > 0);
    const quizAvg = quizScores.length
      ? Math.round((quizScores.reduce((a, q) => a + q.score / q.total, 0) / quizScores.length) * 100)
      : null;
    const level = Math.floor(data.progress.xp / XP_PER_LEVEL) + 1;
    return {
      totalLessons: entries.length,
      completedLessons: completed,
      totalModules: modules.length,
      completedModules: completedModuleIds.size,
      xp: data.progress.xp,
      level,
      levelName: LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)],
      xpIntoLevel: data.progress.xp % XP_PER_LEVEL,
      xpToNext: XP_PER_LEVEL - (data.progress.xp % XP_PER_LEVEL),
      streak: computeStreak(data.progress.activityDays),
      labsSolved,
      totalLabs: labs.length,
      ctfSolved: ctfSolvedList.length,
      ctfPoints,
      studyToday: data.progress.studyByDay[today] ?? 0,
      studyTotal,
      quizAvg
    };
  }, [data, entries, modules, ctfChallenges, labs]);

  // Badge evaluation effect: whenever completions change, award new badges.
  const academyBadges = academy.meta.badges;
  useEffect(() => {
    const completed = entries.filter((e) => data.progress.lessons[e.lesson.id]?.completed).length;
    const completeModuleIds = new Set(
      modules.filter((m) => m.lessons.length > 0 && m.lessons.every((l) => data.progress.lessons[l.id]?.completed)).map((m) => m.id)
    );
    const lessonsByModule = new Map<string, number>();
    for (const m of modules) {
      lessonsByModule.set(
        m.id,
        m.lessons.filter((l) => data.progress.lessons[l.id]?.completed).length
      );
    }
    const earned = evalBadges(academyBadges, data, {
      completedLessons: completed,
      totalLessons: entries.length,
      completeModuleIds,
      lessonsByModule
    });
    if (earned.length > 0) {
      setData((prev) => ({
        ...prev,
        progress: { ...prev.progress, badges: [...prev.progress.badges, ...earned] }
      }));
      for (const id of earned) {
        const badge = academyBadges.find((b) => b.id === id);
        if (badge) pushToast({ title: `Badge earned — ${badge.name}`, body: badge.description, icon: 'badge' });
      }
    }
  }, [data, entries, modules, pushToast, academyBadges]);

  const nextUp = useMemo<CurriculumEntry | null>(() => {
    return entries.find((e) => !data.progress.lessons[e.lesson.id]?.completed) ?? null;
  }, [entries, data]);

  const continueEntry = useMemo<CurriculumEntry | null>(() => {
    if (data.progress.lastLesson) {
      const entry = lessonMap.get(data.progress.lastLesson);
      if (entry && !data.progress.lessons[entry.lesson.id]?.completed) return entry;
    }
    return nextUp;
  }, [data, lessonMap, nextUp]);

  const moduleCompletion = useCallback(
    (moduleId: string): number => {
      const m = modules.find((x) => x.id === moduleId);
      if (!m || m.lessons.length === 0) return 0;
      const done = m.lessons.filter((l) => data.progress.lessons[l.id]?.completed).length;
      return Math.round((done / m.lessons.length) * 100);
    },
    [modules, data]
  );

  const isLessonComplete = useCallback(
    (lessonId: string) => !!data.progress.lessons[lessonId]?.completed,
    [data]
  );

  const isBookmarked = useCallback(
    (kind: BookmarkKind, id: string) => data.bookmarks[kind].includes(id),
    [data]
  );

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  const visitLesson = useCallback((lessonId: string) => {
    setData((prev) => {
      const next = touchDay(prev);
      const lp = next.progress.lessons[lessonId] ?? {};
      return {
        ...next,
        progress: {
          ...next.progress,
          lastLesson: lessonId,
          lessons: { ...next.progress.lessons, [lessonId]: { ...lp, visited: true, lastVisit: Date.now() } }
        }
      };
    });
  }, []);

  const addLessonSeconds = useCallback((lessonId: string, seconds: number) => {
    if (seconds <= 0) return;
    setData((prev) => {
      const lp = prev.progress.lessons[lessonId] ?? {};
      const today = localDate();
      return {
        ...prev,
        progress: {
          ...prev.progress,
          lessons: { ...prev.progress.lessons, [lessonId]: { ...lp, seconds: (lp.seconds ?? 0) + seconds } },
          studyByDay: { ...prev.progress.studyByDay, [today]: (prev.progress.studyByDay[today] ?? 0) + seconds }
        }
      };
    });
  }, []);

  const completeLesson = useCallback(
    (lessonId: string) => {
      setData((prev) => {
        const next = touchDay(prev);
        const lp = next.progress.lessons[lessonId] ?? {};
        if (lp.completed) return prev;
        const xp = next.progress.xp + XP_RULES.lessonComplete;
        return {
          ...next,
          progress: {
            ...next.progress,
            xp,
            lessons: {
              ...next.progress.lessons,
              [lessonId]: { ...lp, completed: true, completedAt: Date.now() }
            }
          }
        };
      });
      const entry = lessonMap.get(lessonId);
      pushToast({
        title: 'Lesson complete',
        body: `${entry ? entry.lesson.title : lessonId} · +${XP_RULES.lessonComplete} XP`,
        icon: 'xp'
      });
    },
    [lessonMap, pushToast]
  );

  const toggleDifficult = useCallback((lessonId: string) => {
    setData((prev) => {
      const lp = prev.progress.lessons[lessonId] ?? {};
      return {
        ...prev,
        progress: {
          ...prev.progress,
          lessons: { ...prev.progress.lessons, [lessonId]: { ...lp, difficult: !lp.difficult } }
        }
      };
    });
  }, []);

  const submitQuiz = useCallback(
    (lessonId: string, score: number, total: number) => {
      setData((prev) => {
        const next = touchDay(prev);
        const lp = next.progress.lessons[lessonId] ?? {};
        const prevBest = lp.quiz?.score ?? -1;
        const bestScore = Math.max(prevBest, score);
        const delta = Math.max(0, score - Math.max(0, prevBest));
        return {
          ...next,
          progress: {
            ...next.progress,
            xp: next.progress.xp + delta * XP_RULES.quizCorrect,
            lessons: {
              ...next.progress.lessons,
              [lessonId]: { ...lp, quiz: { score: bestScore, total, at: Date.now() } }
            }
          }
        };
      });
      pushToast({ title: 'Knowledge check submitted', body: `Score ${score}/${total}`, icon: 'info' });
    },
    [pushToast]
  );

  const setChecklistItem = useCallback((key: string, value: boolean) => {
    setData((prev) => {
      const had = !!prev.progress.checklist[key];
      const xpDelta = value && !had ? XP_RULES.checklistItem : 0;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          xp: prev.progress.xp + xpDelta,
          checklist: { ...prev.progress.checklist, [key]: value }
        }
      };
    });
  }, []);

  const toggleBookmark = useCallback((kind: BookmarkKind, id: string) => {
    setData((prev) => {
      const list = prev.bookmarks[kind];
      const has = list.includes(id);
      return {
        ...prev,
        bookmarks: { ...prev.bookmarks, [kind]: has ? list.filter((x) => x !== id) : [...list, id] }
      };
    });
  }, []);

  const saveNote = useCallback((lessonId: string, text: string, tags: string[], noteId?: string) => {
    setData((prev) => {
      if (noteId) {
        return {
          ...prev,
          notes: prev.notes.map((n) =>
            n.id === noteId ? { ...n, text, tags, updatedAt: Date.now() } : n
          )
        };
      }
      const note: Note = {
        id: uid('note'),
        lessonId,
        text,
        tags,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      return { ...prev, notes: [...prev.notes, note] };
    });
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== noteId) }));
  }, []);

  const solveLab = useCallback(
    (labId: string) => {
      setData((prev) => {
        const next = touchDay(prev);
        const lp = next.progress.labs[labId] ?? { hints: 0 };
        if (lp.solved) return prev;
        return {
          ...next,
          progress: {
            ...next.progress,
            xp: next.progress.xp + XP_RULES.labSolved,
            labs: { ...next.progress.labs, [labId]: { ...lp, solved: true, solvedAt: Date.now() } }
          }
        };
      });
      pushToast({ title: 'Lab solved', body: `+${XP_RULES.labSolved} XP`, icon: 'xp' });
    },
    [pushToast]
  );

  const revealLabHint = useCallback((labId: string) => {
    setData((prev) => {
      const lp = prev.progress.labs[labId] ?? { hints: 0 };
      return {
        ...prev,
        progress: { ...prev.progress, labs: { ...prev.progress.labs, [labId]: { ...lp, hints: Math.min(lp.hints + 1, 3) } } }
      };
    });
  }, []);

  const revealCtfHint = useCallback((challengeId: string) => {
    setData((prev) => {
      const cp = prev.progress.ctf[challengeId] ?? { hints: 0, attempts: 0 };
      return {
        ...prev,
        progress: {
          ...prev.progress,
          ctf: { ...prev.progress.ctf, [challengeId]: { ...cp, hints: Math.min(cp.hints + 1, 3) } }
        }
      };
    });
  }, []);

  const submitFlag = useCallback(
    (challengeId: string, inputFlag: string, expectedFlag: string, points: number) => {
      let ok = false;
      setData((prev) => {
        const next = touchDay(prev);
        const cp = next.progress.ctf[challengeId] ?? { hints: 0, attempts: 0 };
        if (cp.solved) return prev;
        if (inputFlag.trim() === expectedFlag.trim()) {
          ok = true;
          return {
            ...next,
            progress: {
              ...next.progress,
              xp: next.progress.xp + points,
              ctf: { ...next.progress.ctf, [challengeId]: { ...cp, solved: true, solvedAt: Date.now(), attempts: cp.attempts + 1 } }
            }
          };
        }
        return {
          ...next,
          progress: {
            ...next.progress,
            ctf: { ...next.progress.ctf, [challengeId]: { ...cp, attempts: cp.attempts + 1 } }
          }
        };
      });
      return ok;
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const updateCustom = useCallback((patch: Partial<CustomContent>) => {
    setData((prev) => ({ ...prev, custom: { ...prev.custom, ...patch } }));
  }, []);

  const importData = useCallback((incoming: AppData) => {
    const base = defaultData();
    setData({
      version: 1,
      progress: { ...base.progress, ...incoming.progress },
      notes: incoming.notes ?? [],
      bookmarks: { ...base.bookmarks, ...(incoming.bookmarks ?? {}) },
      settings: { ...base.settings, ...(incoming.settings ?? {}) },
      custom: { ...base.custom, ...(incoming.custom ?? {}) }
    });
  }, []);

  const resetProgress = useCallback(() => {
    setData((prev) => ({ ...prev, progress: defaultData().progress }));
  }, []);

  const resetAll = useCallback(() => {
    setData(defaultData());
  }, []);

  const value: AcademyContextValue = {
    academy,
    base: academy.base,
    data,
    modules,
    entries,
    lessonMap,
    stats,
    nextUp,
    continueEntry,
    recentBadges: data.progress.badges,
    labs,
    ctfChallenges,
    tools,
    cheatsheets,
    glossary,
    sources,
    badges: academy.meta.badges,
    skillTree: academy.meta.skillTree,
    levelMeta: academy.meta.levelMeta,
    roadmapStages: academy.meta.roadmapStages,
    moduleCompletion,
    isLessonComplete,
    isBookmarked,
    visitLesson,
    addLessonSeconds,
    completeLesson,
    toggleDifficult,
    submitQuiz,
    setChecklistItem,
    toggleBookmark,
    saveNote,
    deleteNote,
    solveLab,
    revealLabHint,
    revealCtfHint,
    submitFlag,
    updateSettings,
    updateCustom,
    importData,
    resetProgress,
    resetAll,
    toasts,
    pushToast,
    dismissToast
  };

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error('useAcademy must be used within AcademyProvider');
  return ctx;
}
