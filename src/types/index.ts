// ============================================================================
// Android Pentesting Academy — core content & state types.
// These types are the single contract between app code and content data files.
// ============================================================================

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** IDs of diagrams implemented in src/components/diagrams — do not invent new ids here. */
export type AndroidDiagramId =
  | 'android-architecture'
  | 'apk-anatomy'
  | 'activity-lifecycle'
  | 'app-api-flow'
  | 'frida-flow'
  | 'static-workflow'
  | 'dynamic-workflow'
  | 'cert-pinning-flow'
  | 'component-interaction'
  | 'binder-ipc'
  | 'masvs-map'
  | 'methodology-pipeline';

/** Diagrams of the Network Security & Pentesting Academy. */
export type NetworkDiagramId =
  | 'net-lan-topology'
  | 'net-ip-addressing'
  | 'net-subnetting'
  | 'net-arp-flow'
  | 'net-tcp-vs-udp'
  | 'net-osi-tcpip'
  | 'net-encapsulation'
  | 'net-tcp-handshake'
  | 'net-dns-resolution'
  | 'net-dhcp-process'
  | 'net-protocol-map'
  | 'net-nat'
  | 'net-routing'
  | 'net-segmentation'
  | 'net-dmz'
  | 'net-firewall-placement'
  | 'net-ids-ips'
  | 'net-zero-trust'
  | 'net-vpn'
  | 'net-recon-workflow'
  | 'net-nmap-workflow'
  | 'net-tcp-scan-flags'
  | 'net-packet-anatomy'
  | 'net-capture-pipeline'
  | 'net-enumeration-workflow'
  | 'net-vuln-workflow'
  | 'net-arp-spoofing'
  | 'net-dns-spoofing'
  | 'net-l2-attacks'
  | 'net-cred-attacks'
  | 'net-ssh-tunneling'
  | 'net-socks-proxy'
  | 'net-pivot-topology'
  | 'net-internal-topology'
  | 'net-attack-path'
  | 'net-pentest-pipeline';

/** Diagrams of the iOS Application Pentesting Academy. */
export type IOSDiagramId =
  | 'ios-platform-stack'
  | 'ios-secure-boot'
  | 'ios-vs-android'
  | 'ios-app-lifecycle'
  | 'ios-ipc-sandbox'
  | 'ios-ipa-anatomy'
  | 'ios-bundle-container'
  | 'ios-security-boundaries'
  | 'ios-codesign-chain'
  | 'ios-entitlement-flow'
  | 'ios-test-environments'
  | 'ios-static-workflow'
  | 'ios-macho-anatomy'
  | 'ios-re-workflow'
  | 'ios-dynamic-workflow'
  | 'ios-frida-arch'
  | 'ios-frida-hook-flow'
  | 'ios-lldb-debugserver'
  | 'ios-data-container'
  | 'ios-keychain-dp'
  | 'ios-privacy-tcc'
  | 'ios-network-intercept'
  | 'ios-ats-decision'
  | 'ios-auth-flow'
  | 'ios-deeplink-flow'
  | 'ios-universal-links'
  | 'ios-webview-bridge'
  | 'ios-crypto-map'
  | 'ios-arm64-pipeline'
  | 'ios-jailbreak-types'
  | 'ios-anti-analysis-map'
  | 'ios-resign-flow'
  | 'ios-masvs-map'
  | 'ios-methodology-pipeline';

export type DiagramId = AndroidDiagramId | NetworkDiagramId | IOSDiagramId;

export type CalloutVariant = 'info' | 'tip' | 'warn' | 'danger' | 'note' | 'legal';

/** Rich content block used inside lesson sections. */
export type ContentBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'code'; lang: string; code: string; title?: string }
  | { type: 'terminal'; title?: string; lines: string[] }
  | { type: 'callout'; variant: CalloutVariant; title?: string; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'diagram'; id: DiagramId; caption?: string }
  | { type: 'compare'; title?: string; beforeTitle: string; beforeCode: string; afterTitle: string; afterCode: string };

export type SectionKey =
  | 'idea'
  | 'technical'
  | 'pentestRelevance'
  | 'lookFor'
  | 'howToTest'
  | 'example'
  | 'tools'
  | 'mistakes'
  | 'tryIt'
  | 'takeaways';

export const SECTION_META: Record<SectionKey, { label: string; anchor: string }> = {
  idea: { label: 'The Idea', anchor: 'sec-idea' },
  technical: { label: 'How It Works Technically', anchor: 'sec-technical' },
  pentestRelevance: { label: 'Why Pentesters Care', anchor: 'sec-pentestRelevance' },
  lookFor: { label: 'What to Look For', anchor: 'sec-lookFor' },
  howToTest: { label: 'How to Test', anchor: 'sec-howToTest' },
  example: { label: 'Example', anchor: 'sec-example' },
  tools: { label: 'Tools', anchor: 'sec-tools' },
  mistakes: { label: 'Common Mistakes', anchor: 'sec-mistakes' },
  tryIt: { label: 'Try It Yourself', anchor: 'sec-tryIt' },
  takeaways: { label: 'Takeaways', anchor: 'sec-takeaways' }
};

export interface Reference {
  title: string;
  url: string;
  note?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'truefalse' | 'short' | 'scenario';
  prompt: string;
  /** Required for mcq / truefalse. For truefalse use ['True', 'False']. */
  options?: string[];
  /** Correct option index for mcq / truefalse. */
  answerIndex?: number;
  /** Model answer for short / scenario questions. */
  modelAnswer?: string;
  hint: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  difficulty: Difficulty;
  minutes: number;
  /** Ids of lessons that should be completed first. */
  prerequisites: string[];
  objectives: string[];
  diagram?: DiagramId;
  sections: Record<SectionKey, ContentBlock[]>;
  quiz: QuizQuestion[];
  references: Reference[];
}

export interface ChecklistItem {
  item: string;
  why: string;
}

export interface Module {
  id: string;
  title: string;
  /** Curriculum level (0–9), used to group modules on the learning path. */
  level: number;
  description: string;
  outcomes: string[];
  lessons: Lesson[];
  /** Optional interactive setup checklist rendered on the module page. */
  checklist?: ChecklistItem[];
}

// ---------------------------------------------------------------------------
// Labs & CTF
// ---------------------------------------------------------------------------

export interface LabQuestion {
  q: string;
  a: string;
}

export interface Lab {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  scenario: string;
  /** The (local / intentionally vulnerable) target the learner works against. */
  target: string;
  objective: string;
  tools: string[];
  learningObjectives: string[];
  hints: string[];
  questions: LabQuestion[];
  expectedFindings: string[];
  /** Step-by-step solution, kept behind a spoiler reveal. */
  solution: string[];
  remediation: string[];
  relatedLessons: string[];
}

export interface CTFChallenge {
  id: string;
  /** Short code shown on the card, e.g. ANDROID-001. */
  code: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  objective: string;
  target: string;
  hints: string[];
  flag: string;
  /** Write-up revealed only after solving. */
  writeup: string[];
  relatedLessons: string[];
}

// ---------------------------------------------------------------------------
// Reference content
// ---------------------------------------------------------------------------

export interface ToolCommand {
  cmd: string;
  desc: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  purpose: string;
  /** current = actively maintained / first choice, niche = situational, legacy = historical interest. */
  status: 'current' | 'niche' | 'legacy';
  install: string;
  usage: string;
  commands: ToolCommand[];
  whenToUse: string[];
  docsUrl: string;
  relatedLessons: string[];
}

export interface CheatSheet {
  id: string;
  title: string;
  description: string;
  category: string;
  entries: ToolCommand[];
}

export interface GlossaryTerm {
  term: string;
  category: string;
  simple: string;
  technical: string;
  related: string[];
}

export interface SourceRef {
  id: string;
  name: string;
  url: string;
  category: string;
  whatFor: string;
  /** Lesson or module ids that cite this source. */
  usedBy: string[];
}

// ---------------------------------------------------------------------------
// Persisted learner state
// ---------------------------------------------------------------------------

export interface QuizResult {
  score: number;
  total: number;
  at: number;
}

export interface LessonProgress {
  visited?: boolean;
  seconds?: number;
  quiz?: QuizResult;
  completed?: boolean;
  completedAt?: number;
  difficult?: boolean;
  lastVisit?: number;
}

export interface LabProgress {
  hints: number;
  solved?: boolean;
  solvedAt?: number;
}

export interface CtfProgress {
  hints: number;
  attempts: number;
  solved?: boolean;
  solvedAt?: number;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  labs: Record<string, LabProgress>;
  ctf: Record<string, CtfProgress>;
  xp: number;
  badges: string[];
  /** ISO yyyy-mm-dd strings of days with any activity. */
  activityDays: string[];
  studyByDay: Record<string, number>;
  checklist: Record<string, boolean>;
  lastLesson?: string;
}

export interface Note {
  id: string;
  lessonId: string;
  text: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  userName: string;
  reduceMotion: boolean;
}

export interface CustomContent {
  lessons: Lesson[];
  modules: Module[];
  labs: Lab[];
  ctf: CTFChallenge[];
  tools: Tool[];
  cheatsheets: CheatSheet[];
  glossary: GlossaryTerm[];
  sources: SourceRef[];
}

export interface Bookmarks {
  lessons: string[];
  labs: string[];
  tools: string[];
  cheatsheets: string[];
  sources: string[];
}

export interface AppData {
  version: 1;
  progress: ProgressState;
  notes: Note[];
  bookmarks: Bookmarks;
  settings: Settings;
  custom: CustomContent;
}
