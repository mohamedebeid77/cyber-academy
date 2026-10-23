// Network Security & Pentesting Academy — gamification meta:
// level names for the curriculum ladder, badges, skill tree and roadmap stages.
// Module ids: n01 … n15.

import type { AcademyLevelMeta, RoadmapStage } from '../../types';
import type { BadgeDef, SkillNode } from '../../../data/meta';

export const NET_LEVEL_META: Record<number, AcademyLevelMeta> = {
  0: { name: 'Network Foundations', blurb: 'Hosts, addressing, subnetting, ARP, ports.' },
  1: { name: 'Protocols & Models', blurb: 'OSI/TCP-IP, encapsulation, core protocols.' },
  2: { name: 'Networking in Practice', blurb: 'Linux networking CLI as a working toolset.' },
  3: { name: 'Security Architecture', blurb: 'Firewalls, segmentation, VPNs, zero trust.' },
  4: { name: 'Discovery & Traffic Analysis', blurb: 'Nmap scanning and Wireshark packet analysis.' },
  5: { name: 'Enumeration & Assessment', blurb: 'Service enumeration and vulnerability assessment.' },
  6: { name: 'Attacks & Remote Services', blurb: 'Attack concepts, SSH/SMB/RDP, Windows & Linux services.' },
  7: { name: 'Internal Network Testing', blurb: 'Internal pentesting, pivoting and tunneling.' },
  8: { name: 'Advanced Testing', blurb: 'Attack paths, chaining, automation, advanced Nmap.' },
  9: { name: 'Professional Practice', blurb: 'Full engagement methodology, evidence and reporting.' }
};

export const NET_BADGES: BadgeDef[] = [
  {
    id: 'net-rookie',
    name: 'Packet Rookie',
    description: 'Complete your first lesson.',
    icon: 'Network',
    criterion: { kind: 'lessonsCompleted', count: 1 }
  },
  {
    id: 'subnet-survivor',
    name: 'Subnet Survivor',
    description: 'Complete the Networking Fundamentals module.',
    icon: 'Calculator',
    criterion: { kind: 'modulesComplete', moduleIds: ['n01'] }
  },
  {
    id: 'protocol-literate',
    name: 'Protocol Literate',
    description: 'Complete the OSI, TCP/IP & Protocols module.',
    icon: 'Layers',
    criterion: { kind: 'modulesComplete', moduleIds: ['n02'] }
  },
  {
    id: 'cli-operator',
    name: 'CLI Operator',
    description: 'Complete the Networking in Practice module.',
    icon: 'TerminalSquare',
    criterion: { kind: 'modulesComplete', moduleIds: ['n03'] }
  },
  {
    id: 'scanner-apprentice',
    name: 'Scanner Apprentice',
    description: 'Complete a lesson in the Network Discovery & Recon module.',
    icon: 'Radar',
    criterion: { kind: 'anyLessonInModules', moduleIds: ['n05'] }
  },
  {
    id: 'packet-analyst',
    name: 'Packet Analyst',
    description: 'Complete the Packet Analysis with Wireshark module.',
    icon: 'Activity',
    criterion: { kind: 'modulesComplete', moduleIds: ['n06'] }
  },
  {
    id: 'enumerator',
    name: 'Enumerator',
    description: 'Complete the Network Service Enumeration module.',
    icon: 'ListTree',
    criterion: { kind: 'modulesComplete', moduleIds: ['n07'] }
  },
  {
    id: 'assessor',
    name: 'Vulnerability Assessor',
    description: 'Complete the Network Vulnerability Assessment module.',
    icon: 'ShieldAlert',
    criterion: { kind: 'modulesComplete', moduleIds: ['n08'] }
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
    id: 'pivoteer',
    name: 'Pivoteer',
    description: 'Complete the Pivoting, Tunneling & Segmentation module.',
    icon: 'GitBranch',
    criterion: { kind: 'modulesComplete', moduleIds: ['n13'] }
  },
  {
    id: 'internal-operator',
    name: 'Internal Operator',
    description: 'Complete the Internal Network Pentesting module.',
    icon: 'Building2',
    criterion: { kind: 'modulesComplete', moduleIds: ['n12'] }
  },
  {
    id: 'net-methodologist',
    name: 'Network Methodologist',
    description: 'Complete the Professional Methodology module.',
    icon: 'Map',
    criterion: { kind: 'modulesComplete', moduleIds: ['n15'] }
  },
  {
    id: 'net-researcher',
    name: 'Network Security Researcher',
    description: 'Complete half of all lessons in the academy.',
    icon: 'Award',
    criterion: { kind: 'lessonsCompletedPct', pct: 50 }
  }
];

export const NET_SKILL_TREE: SkillNode[] = [
  {
    id: 'net-fundamentals',
    name: 'Networking Fundamentals',
    description: 'Addressing, subnetting, ARP, ports, TCP vs UDP.',
    requires: [],
    moduleIds: ['n01']
  },
  {
    id: 'net-protocols',
    name: 'Protocols & Models',
    description: 'OSI/TCP-IP layer thinking and the core protocol suite.',
    requires: ['net-fundamentals'],
    moduleIds: ['n02']
  },
  {
    id: 'net-cli',
    name: 'Hands-on Networking',
    description: 'Linux networking CLI: ip, dig, curl, ss, tcpdump.',
    requires: ['net-fundamentals'],
    moduleIds: ['n03']
  },
  {
    id: 'net-security-arch',
    name: 'Security Architecture',
    description: 'Firewalls, segmentation, DMZ, VPN, zero trust.',
    requires: ['net-fundamentals'],
    moduleIds: ['n04']
  },
  {
    id: 'net-recon',
    name: 'Network Recon',
    description: 'Host discovery and Nmap scanning done properly.',
    requires: ['net-protocols', 'net-cli'],
    moduleIds: ['n05']
  },
  {
    id: 'net-packet-analysis',
    name: 'Packet Analysis',
    description: 'Wireshark: filters, streams, statistics, suspicious traffic.',
    requires: ['net-protocols', 'net-cli'],
    moduleIds: ['n06']
  },
  {
    id: 'net-enumeration',
    name: 'Service Enumeration',
    description: 'Fingerprinting and enumerating every major service.',
    requires: ['net-recon'],
    moduleIds: ['n07']
  },
  {
    id: 'net-vuln-assessment',
    name: 'Vulnerability Assessment',
    description: 'CVEs, CVSS, scanners, validation, no false-positive theater.',
    requires: ['net-enumeration'],
    moduleIds: ['n08']
  },
  {
    id: 'net-attacks',
    name: 'Network Attacks',
    description: 'ARP/DNS/DHCP/L2 attack concepts — lab-only practice.',
    requires: ['net-packet-analysis'],
    moduleIds: ['n09']
  },
  {
    id: 'net-remote-services',
    name: 'Remote Services',
    description: 'SSH, RDP, SMB, WinRM, VNC, FTP, NFS deep dives.',
    requires: ['net-enumeration'],
    moduleIds: ['n10']
  },
  {
    id: 'net-win-linux',
    name: 'Windows & Linux Services',
    description: 'The service landscape of both platforms, ready for internals.',
    requires: ['net-remote-services'],
    moduleIds: ['n11']
  },
  {
    id: 'net-internal',
    name: 'Internal Pentesting',
    description: 'Mapping, enumeration, trust abuse, attack paths.',
    requires: ['net-vuln-assessment', 'net-win-linux'],
    moduleIds: ['n12']
  },
  {
    id: 'net-pivoting',
    name: 'Pivoting & Tunneling',
    description: 'SSH tunnels, SOCKS, Chisel, Ligolo, double pivots.',
    requires: ['net-internal'],
    moduleIds: ['n13']
  },
  {
    id: 'net-advanced',
    name: 'Advanced Pentesting',
    description: 'Service chaining, credential reuse, automation, NSE.',
    requires: ['net-pivoting', 'net-attacks'],
    moduleIds: ['n14']
  },
  {
    id: 'net-professional',
    name: 'Professional Methodology',
    description: 'Scope to report: running a real engagement properly.',
    requires: ['net-advanced'],
    moduleIds: ['n15']
  }
];

export const NET_ROADMAP_STAGES: RoadmapStage[] = [
  { name: 'NETWORK FOUNDATIONS', moduleIds: ['n01'], blurb: 'Hosts, IP addressing, subnetting, ARP, ports, TCP/UDP.' },
  { name: 'PROTOCOLS & MODELS', moduleIds: ['n02'], blurb: 'OSI/TCP-IP, encapsulation and the protocols you will meet everywhere.' },
  { name: 'NETWORKING IN PRACTICE', moduleIds: ['n03'], blurb: 'ip, ping, traceroute, dig, curl, ss, nc, tcpdump on Linux.' },
  { name: 'SECURITY ARCHITECTURE', moduleIds: ['n04'], blurb: 'Firewalls, segmentation, DMZ, VPN, IDS/IPS, zero trust.' },
  { name: 'DISCOVERY & TRAFFIC ANALYSIS', moduleIds: ['n05', 'n06'], blurb: 'Nmap scanning methodology and Wireshark packet analysis.' },
  { name: 'ENUMERATION & ASSESSMENT', moduleIds: ['n07', 'n08'], blurb: 'Service fingerprinting, enumeration workflows, vulnerability assessment.' },
  { name: 'ATTACKS & REMOTE SERVICES', moduleIds: ['n09', 'n10', 'n11'], blurb: 'Attack concepts (lab-only), SSH/SMB/RDP/WinRM, Windows & Linux services.' },
  { name: 'INTERNAL NETWORK TESTING', moduleIds: ['n12', 'n13'], blurb: 'Internal engagement flow, pivoting, tunneling, segmentation testing.' },
  { name: 'ADVANCED TESTING', moduleIds: ['n14'], blurb: 'Attack paths, chaining, advanced Nmap/NSE, automation.' },
  { name: 'PROFESSIONAL REPORTING', moduleIds: ['n15'], blurb: 'Scope, ROE, evidence, risk, reporting, retesting.' }
];
