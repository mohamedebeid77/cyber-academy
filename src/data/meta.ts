// Gamification rules, level names, badge definitions and the skill tree.

export const LEVEL_NAMES = [
  'Script Kiddie',
  'Apprentice',
  'Practitioner',
  'Operator',
  'Analyst',
  'Senior Analyst',
  'Researcher',
  'Senior Researcher',
  'Specialist',
  'Expert',
  'Elite Tester'
];

export const XP_PER_LEVEL = 500;

export const XP_RULES = {
  lessonComplete: 50,
  quizCorrect: 10,
  labSolved: 150,
  streakDay: 20,
  checklistItem: 5
} as const;

export const LEVEL_META: Record<number, { name: string; blurb: string }> = {
  0: { name: 'Foundation', blurb: 'How Android works from the kernel up.' },
  1: { name: 'Environment Setup', blurb: 'Build your pentesting workbench.' },
  2: { name: 'APK Fundamentals', blurb: 'Inside the package format.' },
  3: { name: 'Static Analysis', blurb: 'Reading apps without running them.' },
  4: { name: 'Dynamic Analysis', blurb: 'Observing apps while they run.' },
  5: { name: 'Network Security', blurb: 'Traffic, TLS and trust.' },
  6: { name: 'Vulnerability Research', blurb: 'Systematic exploitation of app weaknesses.' },
  7: { name: 'Standards & Frameworks', blurb: 'OWASP MAS as your compass.' },
  8: { name: 'Specializations', blurb: 'API security, RE, Frida and resilience.' },
  9: { name: 'Professional Practice', blurb: 'Methodology, evidence and reporting.' }
};

export type BadgeCriterion =
  | { kind: 'lessonsCompleted'; count: number }
  | { kind: 'modulesComplete'; moduleIds: string[] }
  | { kind: 'anyLessonInModules'; moduleIds: string[] }
  | { kind: 'labsSolved'; count: number }
  | { kind: 'ctfSolved'; count: number }
  | { kind: 'lessonsCompletedPct'; pct: number };

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  /** lucide-react icon name rendered by the UI. */
  icon: string;
  criterion: BadgeCriterion;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'android-rookie',
    name: 'Android Rookie',
    description: 'Complete your first lesson.',
    icon: 'Smartphone',
    criterion: { kind: 'lessonsCompleted', count: 1 }
  },
  {
    id: 'apk-explorer',
    name: 'APK Explorer',
    description: 'Complete the APK Fundamentals module.',
    icon: 'PackageSearch',
    criterion: { kind: 'modulesComplete', moduleIds: ['m03'] }
  },
  {
    id: 'static-analyst',
    name: 'Static Analyst',
    description: 'Complete the Static Analysis module.',
    icon: 'SearchCode',
    criterion: { kind: 'modulesComplete', moduleIds: ['m04'] }
  },
  {
    id: 'dynamic-analyst',
    name: 'Dynamic Analyst',
    description: 'Complete the Dynamic Analysis module.',
    icon: 'Activity',
    criterion: { kind: 'modulesComplete', moduleIds: ['m05'] }
  },
  {
    id: 'frida-apprentice',
    name: 'Frida Apprentice',
    description: 'Complete a lesson in the Frida & Instrumentation module.',
    icon: 'FlaskConical',
    criterion: { kind: 'anyLessonInModules', moduleIds: ['m12'] }
  },
  {
    id: 'api-hunter',
    name: 'API Hunter',
    description: 'Complete the Mobile API Security module.',
    icon: 'Globe',
    criterion: { kind: 'modulesComplete', moduleIds: ['m10'] }
  },
  {
    id: 'lab-rat',
    name: 'Lab Rat',
    description: 'Solve your first lab.',
    icon: 'FlaskConical',
    criterion: { kind: 'labsSolved', count: 1 }
  },
  {
    id: 'ctf-player',
    name: 'Flag Hunter',
    description: 'Capture your first CTF flag.',
    icon: 'Trophy',
    criterion: { kind: 'ctfSolved', count: 1 }
  },
  {
    id: 'mas-literate',
    name: 'MAS Literate',
    description: 'Complete the OWASP Mobile Application Security module.',
    icon: 'ShieldCheck',
    criterion: { kind: 'modulesComplete', moduleIds: ['m09'] }
  },
  {
    id: 'binary-novice',
    name: 'Binary Novice',
    description: 'Complete the Reverse Engineering module.',
    icon: 'Cpu',
    criterion: { kind: 'modulesComplete', moduleIds: ['m11'] }
  },
  {
    id: 'methodologist',
    name: 'Methodologist',
    description: 'Complete the Methodology & Reporting module.',
    icon: 'Map',
    criterion: { kind: 'modulesComplete', moduleIds: ['m14'] }
  },
  {
    id: 'researcher',
    name: 'Mobile Security Researcher',
    description: 'Complete half of all lessons in the academy.',
    icon: 'Award',
    criterion: { kind: 'lessonsCompletedPct', pct: 50 }
  }
];

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  /** Skill ids that must be unlocked first. */
  requires: string[];
  /** Modules that must be fully completed to unlock this skill. */
  moduleIds: string[];
}

export const SKILL_TREE: SkillNode[] = [
  {
    id: 'android-fundamentals',
    name: 'Android Fundamentals',
    description: 'Platform, components, permissions, sandbox, ADB.',
    requires: [],
    moduleIds: ['m01']
  },
  {
    id: 'environment',
    name: 'Test Environment',
    description: 'Emulator, rooted testing, proxying, tooling.',
    requires: ['android-fundamentals'],
    moduleIds: ['m02']
  },
  {
    id: 'apk-analysis',
    name: 'APK Analysis',
    description: 'Anatomy, manifest, DEX, signing.',
    requires: ['android-fundamentals'],
    moduleIds: ['m03']
  },
  {
    id: 'static-analysis',
    name: 'Static Analysis',
    description: 'JADX/apktool workflows, secrets, component audits.',
    requires: ['apk-analysis'],
    moduleIds: ['m04']
  },
  {
    id: 'dynamic-analysis',
    name: 'Dynamic Analysis',
    description: 'Runtime observation, data, instrumentation basics.',
    requires: ['static-analysis'],
    moduleIds: ['m05']
  },
  {
    id: 'network-security',
    name: 'Network Security',
    description: 'TLS, NSC, interception, pinning evaluation.',
    requires: ['dynamic-analysis'],
    moduleIds: ['m06']
  },
  {
    id: 'vulnerability-testing',
    name: 'Vulnerability Testing',
    description: 'Platform, storage, crypto and auth weaknesses.',
    requires: ['network-security'],
    moduleIds: ['m07', 'm08']
  },
  {
    id: 'api-security',
    name: 'API Security',
    description: 'Mobile-to-backend testing: tokens, BOLA, logic.',
    requires: ['network-security'],
    moduleIds: ['m10']
  },
  {
    id: 'frida',
    name: 'Frida Mastery',
    description: 'Runtime instrumentation from hooks to native.',
    requires: ['dynamic-analysis'],
    moduleIds: ['m12']
  },
  {
    id: 'reverse-engineering',
    name: 'Reverse Engineering',
    description: 'Native libraries, JNI, Ghidra.',
    requires: ['apk-analysis'],
    moduleIds: ['m11']
  },
  {
    id: 'resilience',
    name: 'Resilience Testing',
    description: 'Obfuscation and anti-analysis evaluation.',
    requires: ['frida', 'reverse-engineering'],
    moduleIds: ['m13']
  },
  {
    id: 'professional',
    name: 'Professional Reporting',
    description: 'Full methodology, evidence, reports, retesting.',
    requires: ['vulnerability-testing', 'mas'],
    moduleIds: ['m14']
  },
  {
    id: 'mas',
    name: 'OWASP MAS',
    description: 'MASVS/MASTG/MASWE as a working framework.',
    requires: ['android-fundamentals'],
    moduleIds: ['m09']
  }
];
