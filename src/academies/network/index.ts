import type { AcademyDefinition } from '../types';
import {
  NETWORK_MODULES,
  NET_LEVEL_META,
  NET_BADGES,
  NET_SKILL_TREE,
  NET_ROADMAP_STAGES,
  labsData,
  ctfChallenges,
  tools,
  cheatsheets,
  glossaryTerms,
  sources
} from './content';

// Network Security & Pentesting Academy — a completely separate academy that
// shares the platform engine with the Android academy. All content lives in
// ./content and nothing is shared with Android content.

export const networkAcademy: AcademyDefinition = {
  id: 'network',
  name: 'Network Security & Pentesting Academy',
  brandLines: ['NETWORK SECURITY', 'PENTESTING'],
  tagline: 'Understand networks. Probe them. Own the methodology.',
  description:
    'From networking fundamentals to advanced internal network penetration testing: protocols, recon, packet analysis, service enumeration, vulnerability assessment, pivoting and a full professional engagement methodology — with labs and CTF challenges running on local, authorized lab targets only.',
  base: '/network',
  storageKey: 'network-pentesting-academy.v1',
  themeClass: 'theme-network',
  accentRgb: '56 189 248',
  status: 'live',
  content: {
    modules: NETWORK_MODULES,
    labs: labsData,
    ctf: ctfChallenges,
    tools,
    cheatsheets,
    glossary: glossaryTerms,
    sources
  },
  meta: {
    badges: NET_BADGES,
    skillTree: NET_SKILL_TREE,
    levelMeta: NET_LEVEL_META,
    roadmapStages: NET_ROADMAP_STAGES
  },
  strings: {
    pathTitle: 'NETWORK SECURITY & PENTESTING',
    toolkitTitle: 'Network Pentesting Toolkit',
    toolkitSub:
      'Every tool in the network arsenal: purpose, installation, common commands and when to reach for it. Aligned with current official documentation — Nmap, Wireshark and friends.',
    glossaryTitle: 'Network Security Glossary',
    checklistTitle: 'Network Lab Setup Checklist',
    ctfCodePrefix: 'NETSEC',
    backupPrefix: 'npa',
    aboutText:
      'Network Security & Pentesting Academy — a local-first learning platform. Content is original and synthesized from public official sources (Nmap and Wireshark official documentation, IETF RFCs, MITRE ATT&CK, OWASP, Microsoft and Linux documentation). The app runs entirely in your browser; the only network requests it makes are external reference links you click yourself.'
  }
};
