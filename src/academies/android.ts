import type { AcademyDefinition, RoadmapStage } from './types';
// Android content is imported from the original data layer, completely unchanged.
import { BUILT_IN_MODULES } from '../data/curriculum';
import { BADGES, LEVEL_META, SKILL_TREE } from '../data/meta';
import { labsData } from '../data/labs';
import { ctfChallenges } from '../data/ctf';
import { tools } from '../data/tools';
import { cheatsheets } from '../data/cheatsheets';
import { glossaryTerms } from '../data/glossary';
import { sources } from '../data/sources';

const roadmapStages: RoadmapStage[] = [
  { name: 'FOUNDATIONS', moduleIds: ['m01'], blurb: 'How Android works: stack, components, sandbox, ADB.' },
  { name: 'TEST ENVIRONMENT', moduleIds: ['m02'], blurb: 'Emulator, rooted testing, proxy and certificates.' },
  { name: 'APK ANALYSIS', moduleIds: ['m03'], blurb: 'Inside the package: manifest, DEX, native libs, signing.' },
  { name: 'STATIC ANALYSIS', moduleIds: ['m04'], blurb: 'JADX, apktool, secrets, component audits.' },
  { name: 'DYNAMIC ANALYSIS', moduleIds: ['m05'], blurb: 'Runtime observation, data inspection, instrumentation.' },
  { name: 'NETWORK TESTING', moduleIds: ['m06'], blurb: 'TLS, NSC, interception, pinning.' },
  { name: 'VULNERABILITY RESEARCH', moduleIds: ['m07', 'm08'], blurb: 'Platform, component, storage, crypto and auth weaknesses.' },
  { name: 'API SECURITY', moduleIds: ['m10'], blurb: 'Where mobile meets the backend: tokens, BOLA, logic.' },
  { name: 'FRIDA & REVERSE ENGINEERING', moduleIds: ['m12', 'm11'], blurb: 'Runtime instrumentation and native analysis.' },
  { name: 'ADVANCED TESTING', moduleIds: ['m09', 'm13'], blurb: 'OWASP MAS mastery and resilience evaluation.' },
  { name: 'PROFESSIONAL REPORTING', moduleIds: ['m14'], blurb: 'Methodology, evidence, reports, retesting.' }
];

export const androidAcademy: AcademyDefinition = {
  id: 'android',
  name: 'Android Pentesting Academy',
  brandLines: ['ANDROID', 'PENTESTING ACADEMY'],
  tagline: 'Understand Android. Break it. Secure it.',
  description:
    'Master Android application security from fundamentals to advanced penetration testing. A structured, hands-on curriculum with labs, CTF challenges and a complete reference toolkit — running entirely on your machine.',
  base: '/app',
  storageKey: 'android-pentesting-academy.v1',
  themeClass: '',
  accentRgb: '34 229 140',
  status: 'live',
  content: {
    modules: BUILT_IN_MODULES,
    labs: labsData,
    ctf: ctfChallenges,
    tools,
    cheatsheets,
    glossary: glossaryTerms,
    sources
  },
  meta: {
    badges: BADGES,
    skillTree: SKILL_TREE,
    levelMeta: LEVEL_META,
    roadmapStages
  },
  strings: {
    pathTitle: 'ANDROID APPLICATION PENTESTING',
    toolkitTitle: 'Android Pentesting Toolkit',
    toolkitSub:
      'Every tool in the arsenal: purpose, installation, common commands and when to reach for it. Status notes are honest — some tools are situational, and maintenance activity should be verified.',
    glossaryTitle: 'Android Security Glossary',
    checklistTitle: 'Android Pentesting Setup Checklist',
    ctfCodePrefix: 'ANDROID',
    backupPrefix: 'apa',
    aboutText:
      'Android Pentesting Academy v1.0 — a local-first learning platform. Content is original and synthesized from public official sources (OWASP MASTG/MASVS/MASWE, Android AOSP & developer documentation, Frida, JADX, apktool, Ghidra documentation). The app runs entirely in your browser; the only network requests it makes are external reference links you click yourself.'
  }
};
