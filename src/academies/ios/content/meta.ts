// iOS Application Pentesting Academy — gamification meta:
// level names for the curriculum ladder, badges, skill tree and roadmap stages.
// Module ids: i01 … i24.

import type { AcademyLevelMeta, RoadmapStage } from '../../types';
import type { BadgeDef, SkillNode } from '../../../data/meta';

export const IOS_LEVEL_META: Record<number, AcademyLevelMeta> = {
  0: { name: 'Platform Foundations', blurb: 'What iOS is, how it defends itself, why it differs from Android.' },
  1: { name: 'App Internals', blurb: 'Reading Swift/ObjC, inside the IPA and the app bundle.' },
  2: { name: 'The Security Model', blurb: 'Sandbox, signing, entitlements — the walls you test against.' },
  3: { name: 'Test Environment', blurb: 'Simulator vs device vs jailbreak: build the workbench.' },
  4: { name: 'Static Analysis & RE', blurb: 'IPAs, Mach-O, strings, symbols, decompilation.' },
  5: { name: 'Dynamic Analysis', blurb: 'Observing, hooking and debugging running apps.' },
  6: { name: 'Data & Network', blurb: 'Keychain, containers, TLS, ATS, interception.' },
  7: { name: 'Auth & Attack Surface', blurb: 'Sessions, biometrics, deep links, WebViews.' },
  8: { name: 'Crypto & Resilience', blurb: 'Crypto auditing, advanced RE, jailbreak, anti-analysis, re-signing.' },
  9: { name: 'Standards & Pro Practice', blurb: 'OWASP MAS mapping and the full engagement methodology.' }
};

export const IOS_BADGES: BadgeDef[] = [
  {
    id: 'ios-rookie',
    name: 'iOS Rookie',
    description: 'Complete your first lesson.',
    icon: 'Apple',
    criterion: { kind: 'lessonsCompleted', count: 1 }
  },
  {
    id: 'ios-foundation',
    name: 'Platform Literate',
    description: 'Complete the iOS & App Security Fundamentals module.',
    icon: 'BookOpen',
    criterion: { kind: 'modulesComplete', moduleIds: ['i01'] }
  },
  {
    id: 'ipa-explorer',
    name: 'IPA Explorer',
    description: 'Complete the iOS App Structure & IPA module.',
    icon: 'PackageSearch',
    criterion: { kind: 'modulesComplete', moduleIds: ['i04'] }
  },
  {
    id: 'signing-literate',
    name: 'Signing Literate',
    description: 'Complete the Code Signing & Entitlements module.',
    icon: 'FileSignature',
    criterion: { kind: 'modulesComplete', moduleIds: ['i06'] }
  },
  {
    id: 'ios-static-analyst',
    name: 'Static Analyst',
    description: 'Complete the Static Analysis module.',
    icon: 'SearchCode',
    criterion: { kind: 'modulesComplete', moduleIds: ['i08'] }
  },
  {
    id: 'macho-novice',
    name: 'Mach-O Novice',
    description: 'Complete the Mach-O & Reverse Engineering module.',
    icon: 'Cpu',
    criterion: { kind: 'modulesComplete', moduleIds: ['i09'] }
  },
  {
    id: 'frida-apprentice-ios',
    name: 'Frida Apprentice',
    description: 'Complete a lesson in the Frida & Runtime Instrumentation module.',
    icon: 'FlaskConical',
    criterion: { kind: 'anyLessonInModules', moduleIds: ['i11'] }
  },
  {
    id: 'storage-hunter',
    name: 'Storage Hunter',
    description: 'Complete the Data Storage & Privacy module.',
    icon: 'Database',
    criterion: { kind: 'modulesComplete', moduleIds: ['i13'] }
  },
  {
    id: 'traffic-sleuth',
    name: 'Traffic Sleuth',
    description: 'Complete the iOS Network Security module.',
    icon: 'Globe',
    criterion: { kind: 'modulesComplete', moduleIds: ['i14'] }
  },
  {
    id: 'surface-mapper',
    name: 'Surface Mapper',
    description: 'Complete the iOS-Specific Attack Surface module.',
    icon: 'Radar',
    criterion: { kind: 'modulesComplete', moduleIds: ['i16'] }
  },
  {
    id: 'crypto-auditor',
    name: 'Crypto Auditor',
    description: 'Complete the Cryptography in iOS Apps module.',
    icon: 'Lock',
    criterion: { kind: 'modulesComplete', moduleIds: ['i18'] }
  },
  {
    id: 'jailbreak-scholar',
    name: 'Jailbreak Scholar',
    description: 'Complete the Jailbreaking & Testing Boundaries module.',
    icon: 'Unlock',
    criterion: { kind: 'modulesComplete', moduleIds: ['i20'] }
  },
  {
    id: 'lab-rat',
    name: 'Lab Rat',
    description: 'Solve your first lab.',
    icon: 'FlaskConical',
    criterion: { kind: 'labsSolved', count: 1 }
  },
  {
    id: 'flag-hunter',
    name: 'Flag Hunter',
    description: 'Capture your first CTF flag.',
    icon: 'Trophy',
    criterion: { kind: 'ctfSolved', count: 1 }
  },
  {
    id: 'ios-mas-literate',
    name: 'MAS Literate',
    description: 'Complete the MASTG / MASVS / MASWE Mapping module.',
    icon: 'ShieldCheck',
    criterion: { kind: 'modulesComplete', moduleIds: ['i23'] }
  },
  {
    id: 'ios-methodologist',
    name: 'iOS Methodologist',
    description: 'Complete the Professional iOS Pentest Methodology module.',
    icon: 'Map',
    criterion: { kind: 'modulesComplete', moduleIds: ['i24'] }
  },
  {
    id: 'ios-researcher',
    name: 'iOS Security Researcher',
    description: 'Complete half of all lessons in the academy.',
    icon: 'Award',
    criterion: { kind: 'lessonsCompletedPct', pct: 50 }
  }
];

export const IOS_SKILL_TREE: SkillNode[] = [
  {
    id: 'ios-fundamentals',
    name: 'iOS Fundamentals',
    description: 'Platform, security philosophy, distribution, boot chain.',
    requires: [],
    moduleIds: ['i01']
  },
  {
    id: 'ios-architecture',
    name: 'Architecture',
    description: 'XNU, processes, IPC, frameworks, app lifecycle.',
    requires: ['ios-fundamentals'],
    moduleIds: ['i02']
  },
  {
    id: 'ios-app-structure',
    name: 'App Structure',
    description: 'Swift/ObjC reading skills, IPA and bundle anatomy.',
    requires: ['ios-fundamentals'],
    moduleIds: ['i03', 'i04']
  },
  {
    id: 'ios-security-model',
    name: 'Security Model',
    description: 'Sandbox, signing, entitlements, data protection.',
    requires: ['ios-architecture'],
    moduleIds: ['i05', 'i06']
  },
  {
    id: 'ios-environment',
    name: 'Test Environment',
    description: 'Simulator, devices, signing setups, proxies.',
    requires: ['ios-security-model'],
    moduleIds: ['i07']
  },
  {
    id: 'ios-static',
    name: 'Static Analysis',
    description: 'IPA triage, Info.plist, entitlements, secrets hunting.',
    requires: ['ios-app-structure'],
    moduleIds: ['i08']
  },
  {
    id: 'ios-dynamic',
    name: 'Dynamic Analysis',
    description: 'Runtime observation, logs, files, network traffic.',
    requires: ['ios-static'],
    moduleIds: ['i10']
  },
  {
    id: 'ios-storage',
    name: 'Storage',
    description: 'Containers, keychain, plists, caches, backups.',
    requires: ['ios-dynamic'],
    moduleIds: ['i13']
  },
  {
    id: 'ios-network',
    name: 'Network',
    description: 'URLSession, ATS, pinning evaluation, API testing.',
    requires: ['ios-dynamic'],
    moduleIds: ['i14']
  },
  {
    id: 'ios-frida',
    name: 'Runtime Instrumentation',
    description: 'Frida from first hook to advanced scripting.',
    requires: ['ios-dynamic'],
    moduleIds: ['i11', 'i12']
  },
  {
    id: 'ios-re',
    name: 'Reverse Engineering',
    description: 'Mach-O, ObjC/Swift metadata, Ghidra, ARM64.',
    requires: ['ios-static'],
    moduleIds: ['i09', 'i19']
  },
  {
    id: 'ios-resilience',
    name: 'Resilience',
    description: 'Jailbreak landscape, anti-analysis, patching, re-signing.',
    requires: ['ios-frida', 'ios-re'],
    moduleIds: ['i20', 'i21', 'i22']
  },
  {
    id: 'ios-mas',
    name: 'OWASP MAS',
    description: 'MASVS / MASTG / MASWE as a working framework.',
    requires: ['ios-fundamentals'],
    moduleIds: ['i23']
  },
  {
    id: 'ios-professional',
    name: 'Professional Pentesting',
    description: 'Full methodology, evidence, findings, reporting.',
    requires: ['ios-resilience', 'ios-mas'],
    moduleIds: ['i24']
  }
];

export const IOS_ROADMAP_STAGES: RoadmapStage[] = [
  { name: 'PLATFORM FOUNDATIONS', moduleIds: ['i01', 'i02'], blurb: 'iOS security philosophy, secure boot, sandbox, XNU, app lifecycle.' },
  { name: 'APP INTERNALS', moduleIds: ['i03', 'i04'], blurb: 'Reading Swift/ObjC as a tester, IPA and bundle anatomy.' },
  { name: 'THE SECURITY MODEL', moduleIds: ['i05', 'i06'], blurb: 'Sandbox, code signing, entitlements, provisioning.' },
  { name: 'TEST ENVIRONMENT', moduleIds: ['i07'], blurb: 'macOS, Xcode, devices, jailbreak vs no-jailbreak decisions.' },
  { name: 'STATIC ANALYSIS', moduleIds: ['i08', 'i09'], blurb: 'IPA triage, secrets, Mach-O, symbols, decompilation workflows.' },
  { name: 'DYNAMIC ANALYSIS', moduleIds: ['i10', 'i11', 'i12'], blurb: 'Monitoring, Frida instrumentation, LLDB debugging.' },
  { name: 'DATA & NETWORK', moduleIds: ['i13', 'i14'], blurb: 'Keychain, containers, backups, TLS, ATS, interception.' },
  { name: 'AUTH & ATTACK SURFACE', moduleIds: ['i15', 'i16', 'i17'], blurb: 'Sessions, biometrics, deep links, universal links, WebViews.' },
  { name: 'CRYPTO & RESILIENCE', moduleIds: ['i18', 'i19', 'i20', 'i21', 'i22'], blurb: 'Crypto auditing, advanced RE, jailbreak concepts, anti-analysis, re-signing.' },
  { name: 'STANDARDS & PRO PRACTICE', moduleIds: ['i23', 'i24'], blurb: 'MASVS/MASTG/MASWE mapping and the full capstone methodology.' }
];
