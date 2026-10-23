import type { SourceRef } from '../../../types';

// Network Security & Pentesting Academy — source registry.
// Every URL is a real, official documentation endpoint. usedBy references
// module ids from the network curriculum (n01..n15).

export const sources: SourceRef[] = [
  {
    id: 'src-net-01',
    name: 'Nmap Reference Guide',
    url: 'https://nmap.org/book/',
    category: 'Tool Documentation',
    whatFor:
      'The authoritative explanation of every Nmap scan type, timing template, output format and NSE script. When a lab result surprises you — a port shows filtered, a version looks wrong — the book explains the mechanics behind the verdict.',
    usedBy: ['n05', 'n08', 'n14']
  },
  {
    id: 'src-net-02',
    name: 'Wireshark User Guide',
    url: 'https://www.wireshark.org/docs/',
    category: 'Tool Documentation',
    whatFor:
      'Official documentation for capture setup, the display-filter language, stream reassembly and protocol dissection. Use it to build correct filters instead of copying half-remembered ones, and to understand what the Expert Information categories actually mean.',
    usedBy: ['n06']
  },
  {
    id: 'src-net-03',
    name: 'tcpdump Man Page',
    url: 'https://www.tcpdump.org/manpages/tcpdump.1.html',
    category: 'Tool Documentation',
    whatFor:
      'The complete reference for tcpdump flags and BPF filter expressions. This is where the difference between -n and -nn, or a correct host/port filter grammar, comes from — useful on headless lab VMs where Wireshark is not available.',
    usedBy: ['n03', 'n06']
  },
  {
    id: 'src-net-04',
    name: 'MITRE ATT&CK',
    url: 'https://attack.mitre.org/',
    category: 'Standards & Frameworks',
    whatFor:
      'The standard knowledge base of adversary tactics and techniques. Map what your lab exercises demonstrate (lateral movement, credential access, network service discovery) onto real technique IDs so findings speak the language defenders and reports already use.',
    usedBy: ['n04', 'n12', 'n15']
  },
  {
    id: 'src-net-05',
    name: 'IETF RFC Repository',
    url: 'https://www.rfc-editor.org/',
    category: 'Protocols & RFCs',
    whatFor:
      'The canonical home of Internet protocol specifications. When you want ground truth about how a protocol is defined — before trusting a tutorial — search the RFC index. It also hosts the errata that show where implementations diverge.',
    usedBy: ['n01', 'n02']
  },
  {
    id: 'src-net-06',
    name: 'RFC 793 — Transmission Control Protocol',
    url: 'https://www.rfc-editor.org/rfc/rfc793',
    category: 'Protocols & RFCs',
    whatFor:
      'The original TCP specification: the three-way handshake, state machine, flags and connection teardown. Reading the state transitions makes Nmap scan behavior and Wireshark flag analysis click instead of staying memorized trivia.',
    usedBy: ['n02', 'n06']
  },
  {
    id: 'src-net-07',
    name: 'RFC 1035 — Domain Names (DNS)',
    url: 'https://www.rfc-editor.org/rfc/rfc1035',
    category: 'Protocols & RFCs',
    whatFor:
      'The DNS specification covering record types, message format, labels and zone concepts. It explains why TXT records exist, what a zone transfer is, and why query-label behavior matters for detection of the exfiltration pattern in the CTF exercises.',
    usedBy: ['n02', 'n05']
  },
  {
    id: 'src-net-08',
    name: 'OWASP',
    url: 'https://owasp.org',
    category: 'Standards & Frameworks',
    whatFor:
      'The Open Worldwide Application Security Project\u2019s guides and top-ten lists. While network-focused, its documentation of TLS posture, misconfiguration categories and testing guides connect network findings to application-layer risk in reports.',
    usedBy: ['n04', 'n08', 'n15']
  },
  {
    id: 'src-net-09',
    name: 'Microsoft Learn — Windows Security',
    url: 'https://learn.microsoft.com/en-us/windows/security/',
    category: 'Official Documentation',
    whatFor:
      'Vendor documentation for Windows authentication, SMB, remote management and hardening policies. Use it to understand what the Windows-side services you enumerate actually enforce, and to cite vendor guidance in remediation sections.',
    usedBy: ['n10', 'n11']
  },
  {
    id: 'src-net-10',
    name: 'Samba Documentation',
    url: 'https://www.samba.org/samba/docs/',
    category: 'Official Documentation',
    whatFor:
      'Official manuals for Samba and its tools, including smbclient and configuration hardening. Needed when building lab Samba targets (shares, guest access, null-session behavior) and when writing precise remediation for SMB findings.',
    usedBy: ['n07', 'n10']
  },
  {
    id: 'src-net-11',
    name: 'OpenSSH Manual',
    url: 'https://man.openbsd.org/ssh',
    category: 'Official Documentation',
    whatFor:
      'The canonical reference for ssh and sshd: forwarding options (-L, -R, -D, -J) and the server-side restrictions (AllowTcpForwarding, PermitOpen). Essential for the tunneling labs and for remediation advice on bastion hosts.',
    usedBy: ['n10', 'n13']
  },
  {
    id: 'src-net-12',
    name: 'FIRST CVSS Resources',
    url: 'https://www.first.org/cvss/',
    category: 'Standards & Frameworks',
    whatFor:
      'The official CVSS specification and calculator. Use it to derive and justify severity vectors for every finding in the mock-report lab — the spec explains exactly what each metric means so your scoring survives review.',
    usedBy: ['n08', 'n15']
  },
  {
    id: 'src-net-13',
    name: 'Exploit-DB',
    url: 'https://www.exploit-db.com/',
    category: 'Tool Documentation',
    whatFor:
      'The public exploit archive behind Searchsploit. Use the web interface when you need context around an entry — version applicability, notes, papers — and remember the lab rule: read and understand public code before ever running it.',
    usedBy: ['n08', 'n14']
  },
  {
    id: 'src-net-14',
    name: 'Linux Man Pages (man7.org)',
    url: 'https://man7.org/linux/man-pages/',
    category: 'Official Documentation',
    whatFor:
      'The reference for the Linux command-line toolbox: ip, ss, ping, dig, traceroute and friends. When a lab exercise asks what a flag really does, the man page is the ground truth — and reading them is a habit worth building.',
    usedBy: ['n03']
  }
];
