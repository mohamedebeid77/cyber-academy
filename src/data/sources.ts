import type { SourceRef } from '../types';

// Every source below is real and official. Content in this academy is an
// original synthesis informed by these references — never verbatim copies.

export const sources: SourceRef[] = [
  {
    id: 'owasp-mas',
    name: 'OWASP Mobile Application Security',
    url: 'https://mas.owasp.org/',
    category: 'Standards & Guides',
    whatFor: 'The umbrella project linking MASVS, MASTG and MASWE — the backbone standard this curriculum is mapped to.',
    usedBy: ['m09', 'm14']
  },
  {
    id: 'owasp-mastg',
    name: 'OWASP MASTG (Mobile Application Security Testing Guide)',
    url: 'https://mas.owasp.org/MASTG/',
    category: 'Standards & Guides',
    whatFor: 'Concrete test techniques for Android/iOS: platform APIs, data storage, cryptography, network, resilience. The primary how-to reference for the practical modules.',
    usedBy: ['m04', 'm05', 'm07', 'm08', 'm09', 'm12']
  },
  {
    id: 'owasp-masvs',
    name: 'OWASP MASVS (Mobile Application Security Verification Standard)',
    url: 'https://mas.owasp.org/MASVS/',
    category: 'Standards & Guides',
    whatFor: 'The requirement catalog (8 categories, L1/L2 levels) used to structure assessments and map findings.',
    usedBy: ['m09', 'm14']
  },
  {
    id: 'owasp-maswe',
    name: 'OWASP MASWE (Mobile Application Security Weakness Enumeration)',
    url: 'https://mas.owasp.org/MASWE/',
    category: 'Standards & Guides',
    whatFor: 'Named weakness entries for writing consistent, referenceable findings.',
    usedBy: ['m09', 'm14']
  },
  {
    id: 'owasp-cheatsheets',
    name: 'OWASP Cheat Sheet Series',
    url: 'https://cheatsheetseries.owasp.org/',
    category: 'Standards & Guides',
    whatFor: 'Defensive checklists (crypto, authentication, session management) used for remediation guidance.',
    usedBy: ['m08', 'm14']
  },
  {
    id: 'android-dev',
    name: 'Android Developers documentation',
    url: 'https://developer.android.com/',
    category: 'Official Documentation',
    whatFor: 'Official guides for components, permissions, storage, security tips, tooling — the factual basis of the fundamentals modules.',
    usedBy: ['m01', 'm02', 'm03', 'm06', 'm08']
  },
  {
    id: 'android-security',
    name: 'Android Developers — Security & Privacy',
    url: 'https://developer.android.com/privacy-and-security',
    category: 'Official Documentation',
    whatFor: 'Official security documentation: platform security model, certificate handling, network security configuration.',
    usedBy: ['m01', 'm06', 'm08']
  },
  {
    id: 'aosp',
    name: 'Android Open Source Project (source.android.com)',
    url: 'https://source.android.com/',
    category: 'Official Documentation',
    whatFor: 'Platform internals: architecture, Binder, ART, SELinux, security model — the deep-dive source for module m01.',
    usedBy: ['m01']
  },
  {
    id: 'frida-docs',
    name: 'Frida documentation',
    url: 'https://frida.re/docs/home/',
    category: 'Tools',
    whatFor: 'Official Frida docs: installation, JavaScript API, gadgets — the source for the Frida path (m05/m12).',
    usedBy: ['m05', 'm12']
  },
  {
    id: 'jadx',
    name: 'JADX (skylot/jadx)',
    url: 'https://github.com/skylot/jadx',
    category: 'Tools',
    whatFor: 'Official repository and releases of the DEX decompiler used throughout static analysis.',
    usedBy: ['m04']
  },
  {
    id: 'apktool',
    name: 'apktool (iBotPeaches/Apktool)',
    url: 'https://github.com/iBotPeaches/Apktool',
    category: 'Tools',
    whatFor: 'Official repository for decode/rebuild of APK resources and Smali.',
    usedBy: ['m03', 'm04']
  },
  {
    id: 'objection',
    name: 'Objection (sensepost/objection)',
    url: 'https://github.com/sensepost/objection',
    category: 'Tools',
    whatFor: 'Official repository of the runtime exploration toolkit built on Frida.',
    usedBy: ['m05', 'm12']
  },
  {
    id: 'mobsf',
    name: 'MobSF (MobSF/Mobile-Security-Framework-MobSF)',
    url: 'https://github.com/MobSF/Mobile-Security-Framework-MobSF',
    category: 'Tools',
    whatFor: 'Official repository of the automated static/dynamic analysis framework used for triage.',
    usedBy: ['m04']
  },
  {
    id: 'ghidra',
    name: 'Ghidra',
    url: 'https://ghidra-sre.org/',
    category: 'Tools',
    whatFor: 'Official site of NSA\u2019s reverse engineering suite used for native library analysis.',
    usedBy: ['m11']
  },
  {
    id: 'burp-docs',
    name: 'Burp Suite documentation (PortSwigger)',
    url: 'https://portswigger.net/burp/documentation',
    category: 'Tools',
    whatFor: 'Official docs for proxy setup and usage; PortSwigger\u2019s web-security materials also inform the API security module.',
    usedBy: ['m02', 'm06', 'm10']
  },
  {
    id: 'mitmproxy',
    name: 'mitmproxy',
    url: 'https://mitmproxy.org/',
    category: 'Tools',
    whatFor: 'Official site and docs of the scriptable interception proxy.',
    usedBy: ['m06', 'm10']
  },
  {
    id: 'drozer',
    name: 'Drozer (WithSecureLabs/drozer)',
    url: 'https://github.com/WithSecureLabs/drozer',
    category: 'Tools',
    whatFor: 'Official repository of the classic IPC testing console; maintenance status is documented in the repo.',
    usedBy: ['m07']
  },
  {
    id: 'radare2',
    name: 'radare2 (radareorg/radare2)',
    url: 'https://github.com/radareorg/radare2',
    category: 'Tools',
    whatFor: 'Official repository of the CLI reverse engineering framework.',
    usedBy: ['m11']
  },
  {
    id: 'mastg-crackmes',
    name: 'OWASP MASTG crackmes (UnCrackable Apps)',
    url: 'https://github.com/OWASP/owasp-mastg',
    category: 'Training Targets',
    whatFor: 'Legally usable intentionally vulnerable apps published by OWASP for practice — the recommended local target for labs and CTF challenges.',
    usedBy: ['m05', 'm11', 'm12']
  },
  {
    id: 'diva',
    name: 'DIVA (Damn Insecure and Vulnerable App)',
    url: 'https://github.com/payatu/diva',
    category: 'Training Targets',
    whatFor: 'A widely used deliberately vulnerable Android app for practicing findings from modules m07/m08.',
    usedBy: ['m07', 'm08']
  }
];
