// ============================================================================
// Cyber Academy — multi-academy platform types.
// An "academy" is a self-contained learning product (own content, own meta,
// own progress storage, own route base) that shares the platform engine.
// ============================================================================

import type {
  Module,
  Lab,
  CTFChallenge,
  Tool,
  CheatSheet,
  GlossaryTerm,
  SourceRef
} from '../types';
import type { BadgeDef, SkillNode } from '../data/meta';

export interface AcademyLevelMeta {
  name: string;
  blurb: string;
}

/** One stage on the academy Roadmap page. */
export interface RoadmapStage {
  name: string;
  moduleIds: string[];
  blurb: string;
}

export interface AcademyContent {
  modules: Module[];
  labs: Lab[];
  ctf: CTFChallenge[];
  tools: Tool[];
  cheatsheets: CheatSheet[];
  glossary: GlossaryTerm[];
  sources: SourceRef[];
}

export interface AcademyMeta {
  badges: BadgeDef[];
  skillTree: SkillNode[];
  levelMeta: Record<number, AcademyLevelMeta>;
  roadmapStages: RoadmapStage[];
}

/** Academy-specific copy used across the shared pages. */
export interface AcademyStrings {
  /** Dashboard headline, e.g. "NETWORK SECURITY & PENTESTING". */
  pathTitle: string;
  toolkitTitle: string;
  toolkitSub: string;
  glossaryTitle: string;
  /** Module setup checklist heading on module pages. */
  checklistTitle: string;
  /** Prefix for CTF challenge codes, e.g. ANDROID-001 / NETSEC-001. */
  ctfCodePrefix: string;
  /** Filename prefix for backups, e.g. apa-backup-….json. */
  backupPrefix: string;
  /** "About" paragraph on the settings page. */
  aboutText: string;
}

export interface AcademyDefinition {
  id: string;
  name: string;
  /** Sidebar brand: two lines, e.g. ['ANDROID', 'PENTESTING ACADEMY']. */
  brandLines: [string, string];
  tagline: string;
  description: string;
  /** Route prefix for every page of this academy, e.g. '/app'. */
  base: string;
  /** Local-storage key for this academy's AppData (progress is fully isolated). */
  storageKey: string;
  /** Tailwind class applied on the app shell to switch the accent theme. */
  themeClass: string;
  /** Accent color as "R G B" triplet string for CSS variables. */
  accentRgb: string;
  content: AcademyContent;
  meta: AcademyMeta;
  strings: AcademyStrings;
  /** 'live' academies are selectable; 'soon' are display-only placeholders. */
  status: 'live' | 'soon';
}
