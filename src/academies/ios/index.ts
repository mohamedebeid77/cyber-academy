import type { AcademyDefinition } from '../types';
import {
  IOS_MODULES,
  IOS_LEVEL_META,
  IOS_BADGES,
  IOS_SKILL_TREE,
  IOS_ROADMAP_STAGES,
  labsData,
  ctfChallenges,
  tools,
  cheatsheets,
  glossaryTerms,
  sources
} from './content';

// iOS Application Pentesting Academy — a completely separate academy that
// shares the platform engine with the Android and Network academies. All
// content lives in ./content and nothing is shared with their datasets.

export const iosAcademy: AcademyDefinition = {
  id: 'ios',
  name: 'iOS Application Pentesting Academy',
  brandLines: ['iOS APPLICATION', 'PENTESTING'],
  tagline: 'Understand iOS. Open the sealed parts. Own the methodology.',
  description:
    'From iOS fundamentals to a full professional assessment methodology: platform security model, IPA and Mach-O analysis, static and dynamic testing, Frida and LLDB instrumentation, storage and network testing, deep links and WebViews, cryptography, resilience evaluation and the OWASP MAS mapping — with labs and CTF challenges running on local, authorized training targets only.',
  base: '/ios',
  storageKey: 'ios-pentesting-academy.v1',
  themeClass: 'theme-ios',
  accentRgb: '214 226 240',
  status: 'live',
  content: {
    modules: IOS_MODULES,
    labs: labsData,
    ctf: ctfChallenges,
    tools,
    cheatsheets,
    glossary: glossaryTerms,
    sources
  },
  meta: {
    badges: IOS_BADGES,
    skillTree: IOS_SKILL_TREE,
    levelMeta: IOS_LEVEL_META,
    roadmapStages: IOS_ROADMAP_STAGES
  },
  strings: {
    pathTitle: 'iOS APPLICATION PENTESTING',
    toolkitTitle: 'iOS Pentesting Toolkit',
    toolkitSub:
      'Every tool in the iOS arsenal: purpose, installation, common commands and when to reach for it — aligned with current official documentation (Xcode, Frida, Ghidra and friends).',
    glossaryTitle: 'iOS Security Glossary',
    checklistTitle: 'iOS Lab Setup Checklist',
    ctfCodePrefix: 'IOS',
    backupPrefix: 'ipa',
    aboutText:
      'iOS Application Pentesting Academy — a local-first learning platform. Content is original and synthesized from public official sources (Apple Platform Security and Developer documentation, OWASP MASVS/MASTG/MASWE, Frida and tool documentation). The app runs entirely in your browser; the only network requests it makes are external reference links you click yourself.'
  }
};
