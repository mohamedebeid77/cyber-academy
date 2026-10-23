import type { Module } from '../../../../types';

// LEVEL 5 — SERVICE ENUMERATION · Module n07: Network Service Enumeration
// Original curriculum content for the Network Security & Pentesting Academy.
// All prose is original; command syntax follows the official tool documentation
// (nmap.org/book, samba.org man pages, net-snmp.org, man.openbsd.org) and the
// protocol RFCs listed per lesson. Enumeration must only ever be performed
// against systems you own or are explicitly authorized to assess.

export const n07: Module = {
  id: 'n07',
  title: 'Network Service Enumeration',
  level: 5,
  description:
    'From open ports to identified services: fingerprinting software with version detection and manual banner grabbing, then a protocol-by-protocol enumeration workflow covering FTP, SSH, Telnet, HTTP, SMTP, SMB, RPC, LDAP, RDP, SNMP, NFS, databases and exposed management interfaces. The goal is a verified inventory of what is running, what version it is, and how it is configured.',
  outcomes: [
    'Turn open ports into identified, verified services instead of port-number guesses',
    'Fingerprint service versions from banners and nmap service probes, and explain why the version matters',
    'Build and run a per-service enumeration workflow for the common network protocols',
    'Recognize exposed management interfaces and outdated software as high-value findings',
    'Record enumeration results so they feed directly into vulnerability assessment'
  ],
  lessons: [
    {
      id: 'n07-l01',
      moduleId: 'n07',
      title: 'From Ports to Services: Fingerprinting and Banner Grabbing',
      difficulty: 'Beginner',
      minutes: 15,
      prerequisites: ['n05-l04'],
      objectives: [
        'Explain why a port number alone never proves which service is listening',
        'Grab banners manually with nc and openssl s_client',
        'Describe how nmap -sV probes and matches service versions',
        'Build a repeatable enumeration workflow from scan result to verified service'
      ],
      diagram: 'net-enumeration-workflow',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A port scan tells you a door is open, not what is behind it. The mapping in /etc/services and the IANA registry is advisory: any process may bind any port, and real networks routinely run SSH on 2222, web on 8443 or a database on 9090. Enumeration is the discipline of asking what is actually listening, what software and version it runs, and how it is configured — because a list of open doors has little value until you know which doors lead to which rooms.'
          },
          {
            type: 'p',
            text:
              'Fingerprinting happens at two levels. Passive fingerprinting is banner grabbing: many services announce themselves the moment a TCP connection opens — an FTP server speaks first with a 220 line, SSH sends its SSH-2.0 string, SMTP greets you with its own 220 — so a single netcat connection is often enough. Active fingerprinting is nmap -sV: the scanner connects, sends hundreds of carefully crafted probes from its signature database, and matches the responses against known patterns to conclude not just the service but the product and version.'
          },
          {
            type: 'p',
            text:
              'Why does the version matter so much? Because everything downstream keys on it: vulnerability databases are indexed by product and version, default credentials are a per-product fact, and configuration questions (does this FTP server allow anonymous login?) are asked with protocol-specific tools. Version fingerprinting is the bridge between the scanning module and the vulnerability assessment module — this lesson builds that bridge and turns it into a repeatable workflow.'
          }
        ],
        technical: [
          {
            type: 'diagram',
            id: 'net-enumeration-workflow',
            caption: 'The enumeration workflow: discovery, service detection, per-service questions, then logging and verification.'
          },
          { type: 'h', text: 'What version detection actually does' },
          {
            type: 'p',
            text:
              'When nmap runs with -sV, it does not stop at open/closed. It connects to each open port, sends a sequence of probes drawn from its nmap-service-probes database — protocol-specific requests, TLS handshakes, even an empty probe that just waits for a greeting — and compares every response against thousands of regular-expression match lines. A strong match yields service, product and version (for example: 22/tcp open ssh OpenSSH 8.9p1). A weak one yields a softmatch that names the service without committing to a version. The --version-intensity option (0-9, with --version-light and --version-all as shortcuts) controls how many probes are tried, trading speed against coverage. Version detection also transparently handles wrapped services: if a port answers TLS, nmap performs the handshake inside its own probe so it can still fingerprint the application behind the encryption.'
          },
          { type: 'h', text: 'Manual banner grabbing' },
          {
            type: 'p',
            text:
              'Understanding what the scanner automates is easiest by hand. Protocols are either server-speaks-first or client-speaks-first. FTP, SSH, SMTP, POP3 and IMAP greet the client immediately, so netcat produces a banner with zero effort. HTTP is client-speaks-first: you must send a request before the server reveals its headers. A quick sweep of a lab server looks like this:'
          },
          {
            type: 'terminal',
            title: 'Banner grabbing by hand on a lab host',
            lines: [
              '$ nc -v 10.0.0.20 21',
              'Connection to 10.0.0.20 21 port [tcp/ftp] succeeded!',
              '220 labftp FTP server (vsftpd 3.0.3) ready.',
              '$ nc -v 10.0.0.20 22',
              'Connection to 10.0.0.20 22 port [tcp/ssh] succeeded!',
              'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4',
              '$ nc -v 10.0.0.20 25',
              'Connection to 10.0.0.20 25 port [tcp/smtp] succeeded!',
              '220 mail.lab.local ESMTP Postfix (Ubuntu)',
              '$ openssl s_client -connect 10.0.0.20:443 -brief',
              'CONNECTION ESTABLISHED',
              'Protocol version: TLSv1.3',
              'Ciphersuite: TLS_AES_256_GCM_SHA384',
              'Server certificate: CN=lab.local, issuer=CN=Lab CA'
            ]
          },
          {
            type: 'p',
            text:
              'Each line is a fact you can record: product names, versions, hostnames, TLS protocol and ciphersuite, and certificate details. The openssl s_client -brief output is a reminder that HTTPS enumeration has two layers — the TLS layer (protocol version, ciphers, certificate) and the HTTP layer above it, which the next lesson covers.'
          },
          { type: 'h', text: 'Why the version string matters — and when it lies' },
          {
            type: 'p',
            text:
              'A version string is the query key for vulnerability databases: versusftpd 2.3.4 a search instantly returns the notorious backdoor issue, while versusftpd 3.0.3 returns nothing exciting. But banners are not ground truth. Linux distributions backport security fixes into older package versions and deliberately keep the old version string, so a banner saying Apache 2.4.41 on a fully patched Ubuntu box does not prove the CVE is present — and a banner alone never proves a vulnerability exists. Treat the version as a hypothesis to verify, which is exactly what the vulnerability assessment module teaches.'
          },
          {
            type: 'p',
            text:
              'The workflow that holds the whole module together: confirm the service (never trust the port number), record the banner or version, compare it against the current release, ask the protocol-specific questions (the next four lessons are those questions), and log everything with evidence — the command you ran and the output you saw. Enumeration done this way produces a report input, not a pile of raw output.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Services are the attack surface; ports are merely how you reach them. Every serious finding in a network assessment starts life as an enumerated service: the outdated OpenSSH build, the FTP server with anonymous login, the management console hiding on 9090. The quality of your vulnerability assessment is capped by the quality of your service identification, because scanner plugins and exploit databases are both keyed on product and version.'
          },
          {
            type: 'list',
            items: [
              'Wrong service assumptions waste hours: spending your time testing a web app that turns out to be a print server is a real and embarrassing failure mode',
              'Version data drives CVE lookup, exploit shortlisting and severity reasoning — garbage versions mean garbage findings',
              'Nonstandard ports hide services from casual readers of a scan; fingerprinting normalizes them into your inventory',
              'Banners and certificates leak hostnames and internal naming, which feeds later reconnaissance steps'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Banners containing explicit product and version strings (OpenSSH, vsftpd, Postfix, Apache, nginx, Microsoft FTP Service)',
              'Services on ports that contradict /etc/services — fingerprint, do not assume',
              'Versions far behind the current release, especially software with known critical CVEs in the gap',
              'TLS servers offering old protocol versions or revealing internal hostnames in certificate subjects',
              'Generic or missing banners — a silent port deserves a closer look, not a shrug'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'Service enumeration is probing other people\u2019s systems. Do it only against machines you own, lab VMs, or hosts covered by written authorization such as a signed rules-of-engagement document. Unauthorized scanning and probing is illegal in most jurisdictions even without malicious intent.'
          },
          {
            type: 'p',
            text:
              'On a lab VM with a few services installed, reproduce the full workflow — first the scanner view, then the manual cross-check:'
          },
          {
            type: 'terminal',
            title: 'Version detection with nmap, then manual confirmation',
            lines: [
              '$ nmap -sV 10.0.0.20',
              'Starting Nmap 7.94 ( https://nmap.org )',
              'Nmap scan report for 10.0.0.20',
              'Host is up (0.00042s latency).',
              'Not shown: 996 closed tcp ports (reset)',
              'PORT    STATE SERVICE VERSION',
              '21/tcp  open  ftp     vsftpd 3.0.3',
              '22/tcp  open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (protocol 2.0)',
              '25/tcp  open  smtp    Postfix smtpd 3.6.4',
              '443/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))',
              'Service Info: Host: lab.local; OS: Linux; CPE: cpe:/o:linux:linux_kernel',
              '# Cross-check one banner by hand:',
              '$ nc -v 10.0.0.20 21',
              'Connection to 10.0.0.20 21 port [tcp/ftp] succeeded!',
              '220 labftp FTP server (vsftpd 3.0.3) ready.'
            ]
          },
          {
            type: 'p',
            text:
              'Note how the two methods agree and what each contributes: nmap gives you breadth (all four services at once, plus OS hints via CPE), while the manual grab gives you the raw, quotable evidence line for your notes. Professional habit: capture both.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'During an authorized lab exercise, an nmap -sV sweep of the target 10.0.0.20 returns 22/tcp open ssh OpenSSH 7.4. The current OpenSSH release is years ahead, so the version gap goes into the notes as a potential finding — not as a vulnerability, because a banner is not proof. The tester then asks the SSH-specific questions (which authentication methods does the server accept? is root login possible?), records the answers, and moves on. Later, the report cites the banner line itself as evidence and recommends confirming the package version on the host, since the banner might be a backported build.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Evidence beats memory',
            text:
              'A finding without the raw banner or tool output behind it is an opinion. Paste the actual line into your notes at the moment you see it — terminal history is a terrible storage system.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in enumeration'],
            rows: [
              ['nmap -sV', 'Automated service and version fingerprinting across many ports at once'],
              ['nc / ncat', 'Manual banner grabbing on any TCP port; zero assumptions'],
              ['openssl s_client', 'TLS-layer fingerprinting: protocol version, ciphersuite, certificate details'],
              ['curl', 'Client-speaks-first protocols (HTTP): fetch headers and certificates reveal surfaces'],
              ['searchsploit', 'Maps a confirmed version to published exploit database entries (later module)']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Mapping port numbers to services without verification — 8443 is not always HTTPS and 22 is not always SSH',
              'Treating a banner version as proof of a vulnerability; distributions backport fixes without changing version strings',
              'Cranking --version-intensity to maximum against fragile production services; aggressive probing can crash old daemons',
              'Ignoring services that do not banner (HTTP, RDP) because a plain nc connection returned nothing — they need protocol-aware probes',
              'Enumerating without notes; unrecorded banners have to be re-captured later, which doubles the noise you make'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'On your own lab VM, run nmap -sV against localhost, then pick three of the services it found and reproduce their banners by hand with nc or openssl s_client. For each service, write one sentence answering: what product, what version, is it current? You have just executed the core enumeration loop end to end on a target you are allowed to touch.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'A port is a door; only fingerprinting tells you what is behind it — the port-to-service table is advisory',
              'Server-speaks-first protocols (FTP, SSH, SMTP) banner on connect; client-speaks-first ones (HTTP) need a request',
              'nmap -sV automates probing and matching against a signature database; intensity trades speed for coverage',
              'Version strings drive CVE lookup and default-credential checks, but backporting means banners can mislead',
              'The workflow: confirm, record with evidence, compare versions, ask protocol-specific questions, log'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n07-l01-q1',
          type: 'mcq',
          prompt: 'A port scan reports 8443/tcp open. What do you actually know?',
          options: [
            'An HTTPS server is listening on 8443',
            'Some TCP process accepted a connection on port 8443, but not which one',
            'The machine runs the 8443 service defined in /etc/services',
            'The firewall allows only TLS traffic on that port'
          ],
          answerIndex: 1,
          hint: 'What did the scan observe, literally?',
          explanation:
            'An open TCP port proves only that some process completed a handshake on that number. The conventional name for the port is advisory; identification requires a banner or a service probe — the first step of the enumeration workflow.'
        },
        {
          id: 'n07-l01-q2',
          type: 'truefalse',
          prompt: 'If a banner says the server runs Apache 2.4.41, then any CVE affecting Apache 2.4.41 is present on that host.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What do Linux distributions do with security patches?',
          explanation:
            'Distributions backport security fixes into the packaged version and keep the version string unchanged, so banner versions overstate or understate real exposure. A version claim is a hypothesis for verification, never proof of a vulnerability.'
        },
        {
          id: 'n07-l01-q3',
          type: 'short',
          prompt: 'Why does a bare netcat connection to port 21 return a banner immediately, while the same connection to port 80 returns nothing?',
          modelAnswer:
            'FTP is a server-speaks-first protocol: the server sends its greeting (a 220 line) as soon as the TCP connection opens. HTTP is client-speaks-first: the server waits for a request line, so it stays silent until the client sends one. Knowing which side speaks first per protocol tells you whether a plain connection is enough or whether you need a protocol-aware probe.',
          hint: 'Which side of the conversation talks first in each protocol?',
          explanation:
            'The greeting order is a property of the protocol design. It explains why some banners fall out of a netcat connection for free and why HTTP requires tools that actually speak the protocol — the distinction nmap probes encode for every service.'
        },
        {
          id: 'n07-l01-q4',
          type: 'scenario',
          prompt:
            'On an authorized lab host, nmap -sV reports 22/tcp open ssh OpenSSH 6.6.1p1. State your next two steps and justify each in one sentence.',
          modelAnswer:
            'First, record the evidence verbatim (the banner or nmap version line) and compare the version with current OpenSSH releases to size the gap — version data drives CVE lookup and is worth capturing immediately. Second, ask the SSH-specific configuration questions rather than jumping to exploit claims: enumerate which authentication methods the server advertises (for example with the ssh client verbose output or the ssh-auth-methods NSE script) and note that the banner is a hypothesis to verify, since the packaged build could be backported.',
          hint: 'The workflow is: record, compare, then protocol-specific questions. Which questions does SSH have?',
          explanation:
            'Version fingerprinting feeds vulnerability assessment only if recorded and only if treated as unverified. The SSH-specific follow-up (advertised auth methods, protocol version, algorithms) is what turns a one-line banner into an enumerated service.'
        }
      ],
      references: [
        {
          title: 'Nmap Reference Guide — Service and Version Detection',
          url: 'https://nmap.org/book/man-version-detection.html',
          note: 'The official -sV documentation: probes, match lines and intensity options.'
        },
        {
          title: 'Nmap Network Scanning — Chapter 7: Service and Application Version Detection',
          url: 'https://nmap.org/book/vscan.html',
          note: 'The long-form book chapter explaining how version detection works under the hood.'
        },
        {
          title: 'RFC 4253 — The Secure Shell (SSH) Transport Layer Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc4253.html',
          note: 'Defines the SSH identification string format (SSH-2.0-...) that banners follow.'
        }
      ]
    },
    {
      id: 'n07-l02',
      moduleId: 'n07',
      title: 'FTP, SSH and Telnet Enumeration',
      difficulty: 'Beginner',
      minutes: 18,
      prerequisites: ['n07-l01'],
      objectives: [
        'Enumerate FTP servers including anonymous access and writable directories',
        'Read an SSH banner and list the authentication methods a server advertises',
        'Explain why Telnet exposure is a finding in itself',
        'Rank findings across the three services by risk rather than by nostalgia for old software'
      ],
      diagram: 'net-protocol-map',
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'FTP, SSH and Telnet are the three oldest remote-access services still encountered on real networks, and they form a perfect teaching set: one usually unauthenticated to start (FTP), one strongly authenticated and encrypted (SSH), and one that ships everything in the clear (Telnet). Enumerating each is a matter of asking its version of the same questions — who can log in, how, and what becomes visible once they do.'
          },
          {
            type: 'p',
            text:
              'The enumeration mindset matters more than the commands: you are probing configuration, not just version. An FTP server on a current release is still a data-exposure finding if anonymous login is enabled and the drop directory is writable. A modern OpenSSH is still worth enumerating because the set of authentication methods it accepts tells you whether password guessing is even possible. And Telnet is a finding before you type a single character, because the protocol itself has no encryption.'
          },
          {
            type: 'p',
            text:
              'Keep the lab framing in mind throughout: everything in this lesson is practiced against machines you own or are authorized to test. Credential guessing against real systems without explicit written permission is not enumeration — it is an attack, and it is out of scope for this module.'
          }
        ],
        technical: [
          { type: 'h', text: 'FTP — TCP 21 (control), 20 or passive ports (data)' },
          {
            type: 'p',
            text:
              'FTP (RFC 959) uses a control connection on port 21 where commands and status codes travel, and a separate data connection for file transfers — active mode has the server connect back to the client from port 20, passive mode has the client connect to a server-chosen high port. That split matters in labs behind firewalls, where passive mode is usually the one that works. Enumeration questions: does the server allow anonymous login (username anonymous, any password, conventionally an email address)? Which directories are visible and which are writable? What banner and features (AUTH TLS for FTPS) appear on connect? The ftp-anon NSE script automates the anonymous check by actually logging in and listing the root directory:'
          },
          {
            type: 'terminal',
            title: 'Enumerating an FTP server on a lab host',
            lines: [
              '$ nmap -p 21 --script ftp-anon 10.0.0.20',
              'Starting Nmap 7.94 ( https://nmap.org )',
              'Nmap scan report for 10.0.0.20',
              'PORT   STATE SERVICE',
              '21/tcp open  ftp',
              '| ftp-anon: Anonymous FTP login allowed (FTP code 230)',
              '| -rw-r--r--   1 ftp      ftp          1024 Jan 12  2022 notes.txt',
              '| drwxrwxrwx   2 ftp      ftp          4096 Jun 03  2023 upload [writeable]',
              '|_Can\u2019t get directory listing: timeout',
              '$ ftp 10.0.0.20',
              'Name (10.0.0.20:student): anonymous',
              '331 Please specify the password.',
              'Password:',
              '230 Login successful.',
              'ftp> ls',
              '200 PORT command successful.',
              '226 Directory send OK.'
            ]
          },
          {
            type: 'p',
            text:
              'An anonymous login that works is a finding on its own; a writable directory makes it worse, because anyone can leave files there — which is both a data-exposure issue and a classic staging point for further attacks. Note the famous historical case for motivation: versusftpd 2.3.4 shipped with a backdoor (CVE-2011-2523) triggered on a specific login, which is why a 2.3.4 banner is treated as near-critical in the vulnerability module.'
          },
          { type: 'h', text: 'SSH — TCP 22' },
          {
            type: 'p',
            text:
              'SSH (RFC 4253 and companions) sends its identification string immediately: SSH-2.0-OpenSSH_8.9p1 tells you protocol version and implementation in one line. Beyond the banner, the richest enumeration target is the set of authentication methods the server is willing to negotiate — publickey, password, keyboard-interactive, gssapi-with-mic and friends. The ssh client reveals them with verbose output: attempt a connection and watch the Authentications that can continue line, which lists every method the server will accept. The ssh-auth-methods NSE script collects the same information non-interactively.'
          },
          {
            type: 'terminal',
            title: 'Reading SSH configuration from the outside',
            lines: [
              '$ ssh -v labuser@10.0.0.20 exit 2>&1 | grep -i authenticat',
              'debug1: SSH2_MSG_KEXINIT sent',
              'debug1: Authentications that can continue: publickey,password',
              'debug1: Next authentication method: publickey',
              'debug1: Authentications that can continue: publickey,password',
              'debug1: Next authentication method: password',
              'labuser@10.0.0.20: Permission denied (publickey,password).',
              '# The server accepts publickey and password auth.',
              '# Password auth enabled means password guessing is possible in principle —',
              '# a configuration fact for the report, not an invitation to guess.'
            ]
          },
          {
            type: 'p',
            text:
              'Two more SSH facts belong in every enumeration note: whether the server permits root login directly (visible in sshd_config on hosts you control; PasswordAuthentication and PermitRootLogin are the classic weak settings), and which key-exchange and cipher algorithms it negotiates — very old servers may still offer deprecated algorithms, which is a hardening finding. All of these are documented in the sshd_config man page.'
          },
          { type: 'h', text: 'Telnet — TCP 23' },
          {
            type: 'p',
            text:
              'Telnet (RFC 854) predates the concept of protocol security: every byte, including passwords, crosses the network in the clear, and any observer on the path can read the session. That single property makes an open Telnet service a finding regardless of version. Enumeration is deliberately simple: grab the banner with nc, note the device that answers (Telnet today is most common on old network gear, printers, IoT appliances and embedded controllers), and record the login prompt. If the administrator asks why Telnet matters when the network is internal, the answer is the sniffing lesson later in this course: one compromised host on the segment turns every Telnet login into a broadcast of credentials.'
          },
          {
            type: 'table',
            headers: ['Service', 'Port', 'Enumeration questions', 'Red flags'],
            rows: [
              ['FTP', '21 (data: 20 / passive)', 'Anonymous login? Writable directories? Banner and features (FTPS)?', 'Anonymous allowed, writable drop directories, vsftpd 2.3.4, no FTPS on public-facing servers'],
              ['SSH', '22', 'Identification string, offered auth methods, protocol and algorithm versions', 'Password auth exposed to untrusted networks, ancient versions, deprecated algorithms, direct root login'],
              ['Telnet', '23', 'Banner, device identity, login prompt', 'The service being reachable at all — cleartext credentials on the wire']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These three services are where network exposure and credential policy intersect. Anonymous FTP is one of the most common accidental data exposures on the internet; password-enabled SSH is the front door for the credential attacks of a later module; Telnet is a standing invitation to every sniffer on the segment. Enumerating them well produces exactly the findings that defenders most need pointed out.'
          },
          {
            type: 'list',
            items: [
              'Anonymous FTP with writable directories is a self-contained, easy-to-remediate finding — always check it',
              'Auth method negotiation tells you whether password guessing is even possible, which shapes both attack and defense recommendations',
              'Telnet on a modern network usually means forgotten management access on appliances — a good thread to pull',
              'All three services feed the credential-attack and sniffing lessons later: enumeration decides which accounts and protocols are worth watching'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'FTP: anonymous login allowed, writable directories, banners of very old servers (vsftpd 2.3.4 in particular), AUTH TLS absent on exposed servers',
              'SSH: password authentication on internet-facing hosts, very old OpenSSH versions, deprecated key-exchange or cipher algorithms, root login enabled',
              'Telnet: any reachable instance; pay attention to appliance default credentials hinted by the banner',
              'Multiple remote-access services on one host — a sign of ad-hoc administration worth reporting as a process finding'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lab services only',
            text:
              'Practice every command in this lesson against FTP, SSH and Telnet services you installed yourself in your own VMs. Guessing or attempting passwords against systems you are not explicitly authorized to test is illegal and can cause account lockouts for real users. Enumeration means reading configuration, not attempting access.'
          },
          {
            type: 'p',
            text:
              'A compact lab session against one of your own VMs (here 10.0.0.20) covering all three services:'
          },
          {
            type: 'terminal',
            title: 'Three services, one lab host',
            lines: [
              '# FTP: version + anonymous check',
              '$ nmap -p 21 -sV --script ftp-anon 10.0.0.20',
              '# SSH: banner + offered auth methods',
              '$ nc -v 10.0.0.20 22',
              'Connection to 10.0.0.20 22 port [tcp/ssh] succeeded!',
              'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4',
              '$ nmap -p 22 --script ssh-auth-methods --script-args ssh.user=labuser 10.0.0.20',
              'PORT   STATE SERVICE',
              '22/tcp open  ssh',
              '| ssh-auth-methods:',
              '|   Supported authentication methods:',
              '|     publickey',
              '|_    password',
              '# Telnet: banner grab on an old lab appliance',
              '$ nc -v 10.0.0.30 23',
              'Connection to 10.0.0.30 23 port [tcp/telnet] succeeded!',
              'Welcome to LabSwitch Console. Login:'
            ]
          },
          {
            type: 'p',
            text:
              'Every command above reads configuration that the server volunteers; none of them attempts a login with a password you were not given. That is the line between enumeration and attack, and you should be able to defend it line by line in a report.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab scenario ties the three together. Your authorized target 10.0.0.20 runs vsftpd 2.3.4 (banner captured), OpenSSH 7.2 with publickey,password advertised, and the neighboring appliance 10.0.0.30 answers on Telnet with a management console prompt. The enumeration notes now contain three findings of different classes: a version-specific critical concern (the vsftpd backdoor release), a configuration exposure (password SSH reachable from the lab segment), and a cleartext management path (Telnet). Each one is written with its evidence line, its risk in context, and a concrete fix — replace the FTP server, restrict SSH to key auth and a management network, retire Telnet for SSH.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'vsftpd 2.3.4 is special',
            text:
              'If you see a 2.3.4 banner, stop enumerating and escalate: that release contained an intentional backdoor (CVE-2011-2523). In a real assessment it is reported immediately; in your lab it is a safe, famous example to study — the backdoor behavior itself is reproduced only on deliberately vulnerable lab VMs.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['nmap --script ftp-anon', 'Logs in as anonymous and lists the FTP root, revealing exposure without manual steps'],
              ['nmap --script ssh-auth-methods', 'Non-interactively lists the authentication methods the SSH server accepts'],
              ['ssh -v', 'Shows the negotiated banner, algorithms and auth methods from the client side'],
              ['ftp / lftp', 'Interactive verification of anonymous access and directory permissions'],
              ['nc', 'Banner grabs for all three services; the universal first touch']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trying passwords during enumeration — without explicit written authorization, credential guessing is an attack, not a test',
              'Using the wrong username for anonymous FTP (it is anonymous, with a conventional email as password, not guest)',
              'Reporting an old SSH banner as a critical vulnerability without noting that distributions backport fixes',
              'Assuming Telnet is only historical — it survives on printers, switches and IoT devices',
              'Forgetting passive mode in firewalled labs and concluding the FTP server is broken when only the data channel is blocked'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Install an FTP server and an SSH server on two lab VMs. On the first, enable anonymous login; on the second, leave password authentication on. From a third VM, run the full enumeration workflow — nmap -sV, ftp-anon, the SSH banner and auth-method check — and write the three findings you would put in a report, each with its evidence line and a recommended fix.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'FTP enumeration is about configuration: anonymous access, writable directories and FTPS presence',
              'The SSH banner gives product and protocol version; verbose client output or ssh-auth-methods reveals accepted auth methods',
              'Telnet is a finding by design — cleartext credentials make any open instance a real risk',
              'Version facts are hypotheses (backporting), configuration facts (anonymous allowed, password auth on) are directly actionable',
              'Enumeration never includes guessing passwords against hosts outside your written authorization'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n07-l02-q1',
          type: 'mcq',
          prompt: 'Which credentials does the ftp-anon check use when it reports Anonymous FTP login allowed?',
          options: [
            'Username anonymous with a conventional email-style password',
            'Username guest with password guest',
            'Username admin with a blank password',
            'No credentials — the script only reads the banner'
          ],
          answerIndex: 0,
          hint: 'What does a human tester type at the login prompt for anonymous FTP?',
          explanation:
            'Anonymous FTP conventionally uses the username anonymous with any password (traditionally an email address). The script performs a real login and directory listing — that is what makes its output stronger evidence than a banner alone.'
        },
        {
          id: 'n07-l02-q2',
          type: 'truefalse',
          prompt: 'A Telnet service on a fully internal network is safe to leave enabled because only trusted employees can reach it.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Who else can see traffic on an internal segment?',
          explanation:
            'Telnet transmits credentials and session data unencrypted, so any observer on the path — including a single compromised host on the same segment — captures every login. Internal placement reduces reachability, not the fundamental cleartext problem; the remediation is replacing Telnet with SSH.'
        },
        {
          id: 'n07-l02-q3',
          type: 'short',
          prompt: 'Name two different facts you learn about an SSH server from its identification string and from the Authentications that can continue line, respectively.',
          modelAnswer:
            'The identification string (banner) reveals the protocol version and the software implementation with version, for example SSH-2.0-OpenSSH_8.9p1. The Authentications that can continue line reveals the authentication methods the server is configured to accept, for example publickey and password — which tells you whether password guessing is possible in principle. The first is a software fact, the second a configuration fact.',
          hint: 'One line comes before any authentication talk; the other appears during it.',
          explanation:
            'Keeping software facts and configuration facts separate keeps reports honest: banners feed CVE lookups (with backporting caveats), auth-method lists feed access-policy recommendations. The ssh -v output and the ssh-auth-methods NSE script both expose the second fact.'
        },
        {
          id: 'n07-l02-q4',
          type: 'scenario',
          prompt:
            'Your authorized enumeration of a lab server finds: (1) vsftpd 2.3.4 with anonymous login allowed and a writable upload directory, (2) OpenSSH 8.2 advertising publickey,password, (3) an appliance on the same segment answering on Telnet. Rank these by urgency and justify each ranking.',
          modelAnswer:
            'First: vsftpd 2.3.4 — that exact release contains an intentional backdoor (CVE-2011-2523), and anonymous access plus a writable directory means unauthenticated exposure and a staging point on top. Second: Telnet appliance — cleartext management credentials are captured by any observer on the segment, and management consoles usually hold privileged accounts. Third: SSH with password auth — password authentication is a policy weakness that enables credential attacks in principle, but with a current OpenSSH version there is no known vulnerability implied by the banner; the recommendation is key-only auth and network restriction. Ranking weighs exploitability and impact in context, not just age of software.',
          hint: 'Which one is an active backdoor, which one broadcasts credentials, and which one is a policy weakness with no proven exploit?',
          explanation:
            'Version-specific backdoors outrank generic cleartext concerns, which outrank hardening gaps. The reasoning — backdoor and exposure first, cleartext second, policy third — is the kind of prioritization that makes a report useful to its reader.'
        }
      ],
      references: [
        {
          title: 'RFC 959 — File Transfer Protocol (FTP)',
          url: 'https://www.rfc-editor.org/rfc/rfc959.html',
          note: 'The FTP specification: greetings, status codes and the two-connection model.'
        },
        {
          title: 'RFC 854 — Telnet Protocol Specification',
          url: 'https://www.rfc-editor.org/rfc/rfc854.html',
          note: 'The original Telnet spec — note the complete absence of any confidentiality mechanism.'
        },
        {
          title: 'OpenBSD — ssh(1) manual page',
          url: 'https://man.openbsd.org/ssh',
          note: 'Official OpenSSH client documentation, including the -v verbose diagnostics used to read auth negotiation.'
        },
        {
          title: 'Nmap NSE — ftp-anon script',
          url: 'https://nmap.org/nsedoc/scripts/ftp-anon.html',
          note: 'Official documentation and sample output for the anonymous-FTP check.'
        },
        {
          title: 'Nmap NSE — ssh-auth-methods script',
          url: 'https://nmap.org/nsedoc/scripts/ssh-auth-methods.html',
          note: 'Official documentation for listing a server\u2019s supported SSH authentication methods.'
        }
      ]
    },
    {
      id: 'n07-l03',
      moduleId: 'n07',
      title: 'HTTP/HTTPS and SMTP Enumeration',
      difficulty: 'Beginner',
      minutes: 17,
      prerequisites: ['n07-l01'],
      objectives: [
        'Read HTTP response headers as service fingerprints and request methods to reveal allowed behavior',
        'Enumerate TLS certificate details that leak hostnames and organizational structure',
        'Interrogate an SMTP server\u2019s capabilities and recognize user-enumeration and relay configuration questions',
        'Separate safe configuration reads from actions that can disrupt a mail or web service'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'HTTP and SMTP are the two protocols almost every organization exposes to the world, which makes them the two largest categories of network attack surface. Web servers answer for websites and APIs; mail servers accept messages from strangers by design. Both are talkative: a single well-formed request returns headers, capabilities and sometimes identities that the operator never intended to advertise.'
          },
          {
            type: 'p',
            text:
              'Enumeration here follows the same discipline as every other service: confirm what is running, record version and configuration facts, and log evidence. For HTTP the questions are about headers, methods, hidden paths and the TLS layer underneath. For SMTP they are about capabilities, whether the server confirms user existence, and whether it will forward mail from anyone to anywhere (the open relay problem). Each answer is a small, verifiable fact that feeds the vulnerability assessment module.'
          }
        ],
        technical: [
          { type: 'h', text: 'HTTP: headers, methods and hidden paths' },
          {
            type: 'p',
            text:
              'HTTP (RFC 9110) is client-speaks-first, so enumeration starts with requests. A HEAD or GET response returns headers, and headers are fingerprints: Server names the product and often the version, X-Powered-By adds the framework layer, and custom headers sometimes leak internal naming. The Server header is advisory in both directions — proxies and hardening guides rewrite or strip it — so treat it as a hint to verify, exactly like a banner. The OPTIONS method asks the server which methods it supports; the Allow header answers, and finding PUT or DELETE enabled on a server that should be read-only is a real finding.'
          },
          {
            type: 'p',
            text:
              'The Robots Exclusion Protocol (RFC 9309) gives enumeration a free map: robots.txt is a publicly readable file in which site operators list paths they ask crawlers to avoid — which, ironically, are often the interesting ones (admin panels, backup directories, staging apps). Directory listings, verbose error pages and default pages (It works!, Tomcat\u2019s default index) are other volunteered facts worth capturing.'
          },
          { type: 'h', text: 'HTTPS: the TLS layer underneath' },
          {
            type: 'p',
            text:
              'HTTPS is the same HTTP conversation wrapped in TLS, so enumeration has two layers. The TLS layer is interrogated with openssl s_client: the protocol version and ciphersuite negotiated, and the certificate itself — subject common name, subject alternative names, issuer, and validity dates. Certificates are reconnaissance gold: SANs enumerate other hostnames on the same infrastructure, internal naming conventions appear in subjects, and self-signed or expired certificates are hardening findings in their own right.'
          },
          {
            type: 'terminal',
            title: 'Enumerating a web server in three commands (lab host)',
            lines: [
              '$ curl -sI http://10.0.0.20/ | head -6',
              'HTTP/1.1 200 OK',
              'Server: Apache/2.4.52 (Ubuntu)',
              'X-Powered-By: PHP/8.1.2',
              'Content-Type: text/html; charset=UTF-8',
              '$ curl -s -X OPTIONS -i http://10.0.0.20/ | grep -i allow',
              'Allow: GET,POST,OPTIONS,HEAD',
              '$ openssl s_client -connect 10.0.0.20:443 -brief',
              'CONNECTION ESTABLISHED',
              'Protocol version: TLSv1.3',
              'Ciphersuite: TLS_AES_256_GCM_SHA384',
              'Server certificate: CN=lab.local, SAN=dns:mail.lab.local, issuer=CN=Lab CA'
            ]
          },
          {
            type: 'p',
            text:
              'Three facts recorded in ten seconds: product and framework versions (Apache 2.4.52, PHP 8.1.2), the supported method list (no dangerous methods here), and TLS 1.3 with a certificate that leaks a second hostname (mail.lab.local) for the next round of enumeration.'
          },
          { type: 'h', text: 'SMTP: capabilities, user confirmation and relaying' },
          {
            type: 'p',
            text:
              'SMTP (RFC 5321) servers greet clients on TCP 25 (server-to-server and legacy submission), with 587 the modern submission port and 465 implicit-TLS submission. After connecting, the client sends EHLO and the server lists its capabilities: AUTH (which authentication mechanisms it offers), STARTTLS, SIZE limits and more. Two enumeration questions have security weight. First, user enumeration: the VRFY and EXPN commands ask the server to confirm a recipient or expand a list — servers that answer honestly hand attackers a list of valid addresses, so modern servers disable or deliberately blur them; the smtp-commands NSE script automates the capability read. Second, the open relay question: will this server forward mail from an unauthenticated outsider to arbitrary external domains? Historically catastrophic (relays become spam cannons), it is tested conservatively in labs and never tested against third-party mail servers without explicit authorization.'
          },
          {
            type: 'terminal',
            title: 'An SMTP conversation on a lab mail server',
            lines: [
              '$ nc -v 10.0.0.20 25',
              'Connection to 10.0.0.20 25 port [tcp/smtp] succeeded!',
              '220 mail.lab.local ESMTP Postfix (Ubuntu)',
              'EHLO lab.local',
              '250-mail.lab.local',
              '250-PIPELINING',
              '250-SIZE 10240000',
              '250-STARTTLS',
              '250 AUTH PLAIN LOGIN',
              'VRFY admin',
              '252 2.0.0 admin',
              'QUIT',
              '221 2.0.0 Bye',
              '# 252 is a deliberate maybe — the server refuses to confirm or deny,',
              '# which is the modern, enumeration-resistant answer.'
            ]
          },
          {
            type: 'table',
            headers: ['Question', 'How to ask', 'What a revealing answer looks like'],
            rows: [
              ['What software runs here?', 'curl -sI (Server header)', 'Server: Apache/2.4.52 (Ubuntu) — a verifiable version claim'],
              ['Which methods are allowed?', 'OPTIONS request (Allow header)', 'Allow: GET,POST,OPTIONS,HEAD — or PUT/DELETE where they should not be'],
              ['What paths exist?', 'Read robots.txt', 'Disallow: /admin/ and /backup/ — a free map of hidden areas'],
              ['What TLS is offered?', 'openssl s_client -brief', 'Protocol version, ciphersuite, certificate CN and SAN hostnames'],
              ['What can the mail server do?', 'EHLO conversation', 'AUTH PLAIN LOGIN, STARTTLS, SIZE — capability inventory'],
              ['Does it confirm users?', 'VRFY / EXPN commands', '252 maybe (good) versus 250 with details (user enumeration enabled)']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Web and mail servers are the services most exposed to the internet and therefore the ones where small configuration facts matter most. A version in a Server header shortlists CVEs before any scanning; enabled dangerous methods or writable endpoints change the risk of every upload feature; a certificate\u2019s SANs map infrastructure nobody documented; VRFY-enabled mail servers hand out user lists that feed credential attacks. Enumeration converts all of these from vague worries into quotable findings.'
          },
          {
            type: 'list',
            items: [
              'Header versions drive the vulnerability shortlist — and backport caveats from the fingerprinting lesson still apply',
              'TLS certificates leak hostnames and naming conventions; expired or self-signed certs are findings on production systems',
              'SMTP user enumeration directly enables the credential-attack module later: a user list is half of a password-spray input',
              'robots.txt and directory listings reveal administrative surfaces that should never have been linkable'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Verbose Server and X-Powered-By headers on internet-facing servers — accurate or not, they advertise the stack',
              'OPTIONS responses allowing PUT, DELETE, TRACE or other methods the application never needs',
              'robots.txt entries pointing at admin paths, backups, staging systems and API documentation',
              'TLS facts: legacy protocol versions, self-signed or expired certificates, SANs exposing internal hostnames',
              'SMTP: VRFY/EXPN answering with confirmations, AUTH advertised on port 25, and any indication the server relays for strangers'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Configuration reads, not traffic',
            text:
              'Header reads, OPTIONS requests and EHLO conversations are the safe core of web and mail enumeration. Never send bulk automated requests (directory brute-forcing, login attempts) against third-party sites, and never test open-relay behavior on mail servers you do not own — both are disruptive and, without authorization, illegal. All exercises here run against your own lab services.'
          },
          {
            type: 'p',
            text:
              'Install a small web server and Postfix in a lab VM, then run the session above against them. Add one nmap pass to confirm the picture:'
          },
          {
            type: 'terminal',
            title: 'Confirming the web and mail picture with nmap',
            lines: [
              '$ nmap -sV -p 80,443,25 --script smtp-commands 10.0.0.20',
              'Starting Nmap 7.94 ( https://nmap.org )',
              'Nmap scan report for 10.0.0.20',
              'PORT    STATE SERVICE VERSION',
              '25/tcp  open  smtp    Postfix smtpd 3.6.4',
              '| smtp-commands: mail.lab.local',
              '|_  PIPELINING SIZE 10240000 STARTTLS AUTH PLAIN LOGIN',
              '80/tcp  open  http    Apache httpd 2.4.52 ((Ubuntu))',
              '443/tcp open  ssl/http Apache httpd 2.4.52 ((Ubuntu))',
              'Service Info: Host: mail.lab.local; OS: Linux'
            ]
          },
          {
            type: 'p',
            text:
              'The nmap output and your manual curls should agree. Where they differ — a rewritten Server header, a stripped capability — you have found a proxy or a hardening control, which is itself a fact worth recording.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab example shows why a header is never just a header. During an authorized exercise, a Server header reads Apache/2.4.49. The tester recognizes the version as the one associated with the 2021 path traversal flaw CVE-2021-41773, verifies the claim against the official CVE record, notes it with the raw header as evidence — and then, in the lab (never against the third-party system), reproduces the misconfiguration on a deliberately vulnerable VM to understand the impact before writing the finding. The report entry contains the header line, the CVE reference, the impact explanation and the remediation (upgrade and strip version headers). One curl -sI, correctly read, became a complete finding.'
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'Two layers, two findings',
            text:
              'HTTPS enumeration regularly yields two independent findings: a TLS-layer issue (legacy protocol version, self-signed certificate) and an HTTP-layer issue (verbose version header, dangerous methods). Record them separately — they have different owners and different fixes.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['curl', 'Header reads, method probing with OPTIONS, robots.txt fetches — the web enumerator\u2019s scalpel'],
              ['openssl s_client', 'TLS protocol, ciphersuite and certificate enumeration underneath HTTPS'],
              ['nmap --script smtp-commands', 'Automates the EHLO capability listing and SMTP version facts'],
              ['nc', 'Raw SMTP conversations: EHLO, VRFY, EXPN typed by hand on lab servers'],
              ['searchsploit (later module)', 'Turns confirmed header versions into a vulnerability shortlist']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Trusting the Server header as ground truth — proxies rewrite it, hardening strips it, and backported builds keep old versions',
              'Aggressively brute-forcing directories or logins against third-party sites; enumeration is configuration reading, not load generation',
              'Testing open-relay behavior against mail servers you do not own — relay tests deliver actual mail and are a third-party impact',
              'Conflating the ports: 25, 465 and 587 serve different roles, and AUTH on 587 is normal while AUTH on 25 deserves a question',
              'Forgetting the SAN list in certificates — the cheapest infrastructure map in the whole discipline'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Point curl at your own lab web server (or any local test server you stand up) and answer three questions from its responses: what stack does it claim, which methods does OPTIONS reveal, and what does robots.txt list? Then connect openssl s_client to the TLS port and record every hostname the certificate mentions. Write one sentence for each fact explaining what a defender should change.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'HTTP headers, method lists and robots.txt are volunteered configuration facts — capture and verify them',
              'HTTPS enumeration has two layers: TLS facts (protocol, ciphers, certificate, SANs) and HTTP facts above them',
              'SMTP EHLO lists capabilities; VRFY/EXPN behavior decides whether user enumeration is possible; open relay is the classic catastrophic mail misconfiguration',
              'Version claims remain hypotheses with backporting caveats — record evidence, verify against official CVE records',
              'Safe enumeration reads configuration; bulk requests, login attempts and relay tests are actions that need authorization'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n07-l03-q1',
          type: 'mcq',
          prompt: 'Which HTTP method asks a server to list the request methods it supports?',
          options: ['HEAD', 'TRACE', 'OPTIONS', 'CONNECT'],
          answerIndex: 2,
          hint: 'Its name literally means telling you what is possible.',
          explanation:
            'OPTIONS asks the server to describe its capabilities, and the Allow header carries the answer. Enabled PUT or DELETE on a server that should be read-only is a genuine misconfiguration finding; TRACE, when enabled, is itself usually flagged.'
        },
        {
          id: 'n07-l03-q2',
          type: 'truefalse',
          prompt: 'A modern SMTP server that answers VRFY admin with code 252 is leaking its user list.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'What does 252 mean compared with an explicit 250 confirmation?',
          explanation:
            '252 means the server cannot or will not verify the address — a deliberate, enumeration-resistant answer. A 250 with confirmation details would enable user enumeration; distinguishing the two codes is the difference between a finding and normal behavior.'
        },
        {
          id: 'n07-l03-q3',
          type: 'short',
          prompt: 'Why is the certificate subject-alternative-name list valuable during network enumeration?',
          modelAnswer:
            'The SAN list enumerates every hostname the certificate was issued for, which often includes internal or auxiliary systems (mail, staging, API hosts) that never appeared in the target list. It is a free, authoritative map of related infrastructure and naming conventions, obtained with a single TLS handshake — and it suggests the next enumeration targets.',
          hint: 'Read one certificate and you learn about more than one host.',
          explanation:
            'Certificates bind names, so one handshake reveals the operator\u2019s whole naming scheme. This is why certificate transparency data is standard recon, and why unexplained hostnames in a client\u2019s certificates deserve follow-up during an authorized assessment.'
        },
        {
          id: 'n07-l03-q4',
          type: 'scenario',
          prompt:
            'An authorized scan shows an internal lab web server whose OPTIONS response is Allow: GET,POST,OPTIONS,HEAD and whose Server header reads nginx/1.18.0, while the certificate on 443 is self-signed with CN=internal.lab.local. Draft the two findings you would report, each with evidence, impact and remediation.',
          modelAnswer:
            'Finding 1 — self-signed TLS certificate on an internal service. Evidence: the s_client certificate output showing issuer equal to subject (CN=internal.lab.local). Impact: clients cannot authenticate the server, so interception is undetectable, and warning fatigue trains users to click through certificate errors. Remediation: issue a certificate from the organization\u2019s internal CA and automate renewal. Finding 2 — version disclosure header. Evidence: Server: nginx/1.18.0 on every response. Impact: advertises an exact software version, which is the lookup key for vulnerability databases; combined with an old release it feeds attacker reconnaissance. Remediation: upgrade to a supported nginx release and configure server_tokens off so the header stops disclosing the version. Neither finding claims a proven exploit — both are configuration facts with evidence lines, which is what makes them defensible.',
          hint: 'One finding lives in the TLS layer, one in the HTTP layer. Evidence first, then impact, then fix.',
          explanation:
            'Splitting TLS-layer and HTTP-layer findings matches how they get fixed (certificate operations versus web server configuration) and shows the discipline the vulnerability module will formalize: every finding carries verbatim evidence, business-relevant impact and a concrete remediation.'
        }
      ],
      references: [
        {
          title: 'RFC 9110 — HTTP Semantics',
          url: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          note: 'The current HTTP specification: methods, headers and status code meanings used throughout enumeration.'
        },
        {
          title: 'RFC 9309 — Robots Exclusion Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc9309.html',
          note: 'The formal robots.txt specification — the file you read for free path reconnaissance.'
        },
        {
          title: 'RFC 5321 — Simple Mail Transfer Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc5321.html',
          note: 'The SMTP specification: EHLO capabilities, VRFY/EXPN and relay semantics.'
        },
        {
          title: 'Nmap NSE — smtp-commands script',
          url: 'https://nmap.org/nsedoc/scripts/smtp-commands.html',
          note: 'Official documentation for the EHLO capability enumeration script.'
        },
        {
          title: 'OWASP — Web Security Testing Guide',
          url: 'https://owasp.org/www-project-web-security-testing-guide/',
          note: 'The industry-standard methodology for testing web services, including information-gathering checks.'
        }
      ]
    },
    {
      id: 'n07-l04',
      moduleId: 'n07',
      title: 'SMB, RPC, LDAP and RDP Enumeration',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n07-l01'],
      objectives: [
        'Enumerate SMB shares and recognize what a null session does and does not reveal',
        'Describe the RPC endpoint mapper\u2019s role and how tools query it',
        'Recognize LDAP configurations that allow anonymous directory reads',
        'Assess RDP exposure, network-level authentication and encryption settings',
        'Map enumeration activity to MITRE ATT&CK discovery techniques for defensive context'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The protocols in this lesson are the plumbing of Windows and directory-centric networks: SMB shares files and printers, RPC wires services together, LDAP answers directory queries, RDP puts a desktop on the wire. On an authorized internal assessment these four are where most of the working time goes, because each one answers questions about identity — who exists, who can access what, and what the domain looks like.'
          },
          {
            type: 'p',
            text:
              'They are also the protocols with the richest history of configuration weaknesses: SMB allowed unauthenticated null sessions for years, LDAP accepted anonymous binds by default in older directories, RDP shipped without network-level authentication on legacy systems, and SMBv1 survives in far too many environments. Enumeration means learning which of those historical defaults each target still has.'
          },
          {
            type: 'p',
            text:
              'One framing note before the commands: these services sit at the center of Windows networks, so probing them aggressively can lock accounts, trigger security tooling or crash legacy boxes. Enumeration on a live engagement is a conversation with the client\u2019s monitoring team as much as with the protocols — and in this course it is a conversation with your own lab domain controller.'
          }
        ],
        technical: [
          { type: 'h', text: 'SMB — TCP 445 (direct) and 139 (NetBIOS legacy)' },
          {
            type: 'p',
            text:
              'SMB (Microsoft\u2019s file-sharing protocol, documented in the Microsoft SMB overview) negotiates a dialect on connect, then serves shares, named pipes and printers. The first enumeration question is which shares exist and who can read them: smbclient lists shares from the Samba suite, and the -N flag attempts the connection without a password — the classic null session. Old systems answered anonymous null sessions with generous information (share lists, user lists, domain policy); modern Windows restricts them heavily, so a null session that still yields data is itself a finding.'
          },
          {
            type: 'terminal',
            title: 'SMB enumeration on a lab server',
            lines: [
              '$ smbclient -L //10.0.0.20 -N',
              'Anonymous login successful',
              'Sharename       Type      Comment',
              '---------       ----      -------',
              'print$          Disk      Printer Drivers',
              'public          Disk      Public files',
              'IPC$            IPC       IPC Service',
              'SMB1 disabled -- no workgroup available',
              '$ nmap -p 445 --script smb-os-discovery 10.0.0.20',
              'PORT    STATE SERVICE',
              '445/tcp open  microsoft-ds',
              '| smb-os-discovery:',
              '|   OS: Windows 10 (build 19045)',
              '|   Computer name: LABPC',
              '|   Domain name: lab.local',
              '|_  System time: 2026-09-28T10:14:03+00:00'
            ]
          },
          {
            type: 'p',
            text:
              'enum4linux (and its maintained rewrite enum4linux-ng) wraps smbclient and rpcclient into one sweep of share lists, OS data, password policy and user enumeration via RID cycling — the technique of guessing user SIDs to resolve names on systems that leak them. On a lab domain controller, enum4linux -a is the fastest way to see everything a null session can reach.'
          },
          { type: 'h', text: 'RPC — TCP 135 plus dynamic high ports' },
          {
            type: 'p',
            text:
              'Windows remote procedure call services listen on dynamic high ports, and clients find them by asking the endpoint mapper on TCP 135 which port serves which interface. Enumeration leverages exactly that directory: rpcclient (from Samba) connects, negotiates a session (often as an anonymous user on misconfigured servers), and issues queries such as querydominfo or enumdomusers. What comes back on permissive systems mirrors the SMB picture — domain name, user inventory, password policy — which is why both protocols appear together in discovery workflows.'
          },
          { type: 'h', text: 'LDAP — TCP 389, 636 (LDAPS), 3268 (global catalog)' },
          {
            type: 'p',
            text:
              'LDAP (RFC 4511) is the directory protocol behind Active Directory. Enumeration asks one central question: does the server accept an anonymous or unauthenticated bind, and if so, what does it let you read? The ldapsearch tool with -x (simple auth) and no bind DN attempts exactly that. A permissive directory returns naming contexts, organizational units, and object attributes; a locked-down one returns an error, which is the good answer. Port 3268 speaks to global catalog servers and returns the same kind of data forest-wide.'
          },
          {
            type: 'terminal',
            title: 'LDAP anonymous read attempt on a lab directory',
            lines: [
              '$ ldapsearch -x -H ldap://10.0.0.20 -b "dc=lab,dc=local" -s base namingContexts',
              '# extended LDIF',
              'dn:',
              'namingContexts: dc=lab,dc=local',
              '# search result',
              'search: 2',
              'result: 0 Success',
              '# Anonymous bind accepted; naming context revealed.'
            ]
          },
          { type: 'h', text: 'RDP — TCP 3389' },
          {
            type: 'p',
            text:
              'RDP gives remote desktops over TCP 3389 (Microsoft documents the protocol in its RDP overview). Enumeration focuses on configuration: does the server require network-level authentication (NLA, which forces authentication before a session is fully established) or accept connections from unauthenticated clients? What security layer and encryption level is negotiated? A pre-authentication RDP surface is historically valuable to attackers and correspondingly important to defenders, so the presence of RDP without NLA is a standard finding. nmap\u2019s service detection reports the RDP banner information on the port.'
          },
          {
            type: 'table',
            headers: ['Protocol', 'Ports', 'Key enumeration questions', 'Red flags'],
            rows: [
              ['SMB', '445, 139', 'Which shares exist? Do null sessions yield data? Is SMBv1 negotiated? Is signing required?', 'Anonymous share access, writable shares, SMBv1 enabled, signing not required'],
              ['RPC', '135 + dynamic', 'What does the endpoint mapper expose? What do rpcclient queries return anonymously?', 'Anonymous access to domain and user enumeration queries'],
              ['LDAP', '389, 636, 3268', 'Does anonymous bind work? Which naming contexts and attributes are readable?', 'Anonymous binds returning user or attribute data'],
              ['RDP', '3389', 'Is NLA required? What security layer is negotiated? Is it exposed beyond management networks?', 'RDP reachable from user or external networks without NLA']
            ]
          },
          {
            type: 'callout',
            variant: 'note',
            title: 'The defender\u2019s mirror',
            text:
              'MITRE ATT&CK formalizes this activity: Network Share Discovery (T1135) and Remote System Discovery (T1018) are exactly the share listings, RPC queries and network sweeps of this lesson. Reading the ATT&CK pages is dual-purpose — attackers learn what defenders expect, defenders learn which telemetry their monitoring must cover.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'On internal assessments, this quartet is the daily bread. Share lists reveal where sensitive data lives; null sessions and anonymous LDAP reveal whether the directory leaks its own user inventory; RDP exposure decides whether a stolen password is a foothold. The enumeration results here feed directly into later curriculum stages — credential attacks, pivoting — which is why they must be accurate and evidenced.'
          },
          {
            type: 'list',
            items: [
              'Writable SMB shares are data-integrity findings even when reads are properly restricted',
              'Anonymous directory access turns an attacker\u2019s user-list problem into a solved one — always test for it',
              'RDP reachable from user segments without NLA is a standing invitation once any password leaks',
              'Everything you enumerate maps to ATT&CK discovery techniques, which is how defenders will read your report'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Null sessions that return share or user lists on modern Windows systems — hardening has regressed somewhere',
              'SMBv1 still negotiated (the SMB1 disabled line is the healthy alternative in smbclient output)',
              'Anonymous LDAP binds exposing naming contexts or user objects on port 389 or 3268',
              'RDP without network-level authentication, or RDP exposed outside dedicated management networks',
              'Writable shares with broad access (Everyone, Authenticated Users) — enumerated by connecting and testing, with client permission'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lab domain, written scope',
            text:
              'Windows enumeration is noisy: RID cycling and repeated queries can lock accounts or trip security tooling on production networks. Practice against a lab domain controller you built (deliberately vulnerable lab VMs are ideal), and on real engagements perform only what the written scope and the client\u2019s monitoring team have agreed to.'
          },
          {
            type: 'p',
            text:
              'A lab session against your own domain controller (10.0.0.20) demonstrating each protocol once:'
          },
          {
            type: 'terminal',
            title: 'Four protocols, one lab DC',
            lines: [
              '# SMB: shares via null session',
              '$ smbclient -L //10.0.0.20 -N',
              '# RPC: domain info via rpcclient',
              '$ rpcclient -U "" -N 10.0.0.20 -c "querydominfo"',
              'Domain:         LAB',
              'Server:         LABDC',
              'Comment:',
              'Total Users:    14',
              '# LDAP: anonymous naming context read',
              '$ ldapsearch -x -H ldap://10.0.0.20 -b "" -s base namingContexts',
              '# RDP: service detection on 3389',
              '$ nmap -sV -p 3389 10.0.0.20',
              'PORT     STATE SERVICE       VERSION',
              '3389/tcp open  ms-wbt-server Microsoft Terminal Services'
            ]
          },
          {
            type: 'p',
            text:
              'Each command is a single, bounded question — not a sweep. That restraint is what keeps enumeration inside authorization boundaries on real networks.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'In a deliberately vulnerable lab domain, enum4linux -a against the DC returns the domain name LAB, fourteen usernames resolved via RID cycling, and a password policy showing lockout threshold zero. The enumeration notes now contain a chain: the directory leaks its users, and the policy permits unlimited guessing — together they make the password-spraying lesson of the attacks module trivially applicable, which is precisely why the lab exists. The matching report entries reference T1135 and T1018 so the client\u2019s detection engineers can verify their monitoring covers share and system discovery.'
          },
          {
            type: 'callout',
            variant: 'warn',
            title: 'RID cycling is loud',
            text:
              'Cycling thousands of SIDs generates thousands of queries. On production domain controllers it is a traffic event the blue team will see — schedule it, scope it, and agree on it with the client first.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['smbclient', 'Samba\u2019s FTP-like SMB client; -L lists shares, -N attempts anonymous access'],
              ['rpcclient', 'Samba\u2019s RPC query tool; speaks to the endpoint mapper\u2019s clients on 135'],
              ['enum4linux / enum4linux-ng', 'Umbrella sweep of SMB and RPC enumeration; -a runs everything simple'],
              ['ldapsearch', 'OpenLDAP\u2019s query tool; the -x anonymous bind is the LDAP exposure test'],
              ['nmap smb-os-discovery', 'One-query OS, hostname and domain disclosure via SMB']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming null sessions work everywhere — modern Windows restricts them, so an empty result is often correct behavior, not a failed command',
              'Confusing LDAP port roles: 389 (cleartext), 636 (LDAPS) and 3268 (global catalog) answer differently',
              'Running RID cycling or rapid-fire queries against production DCs without agreeing scope with the client',
              'Reporting every writable share as critical without checking what the write access actually permits',
              'Forgetting that RDP exposure questions are network-design questions (who can reach 3389), not only protocol settings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Build or reuse a lab domain controller VM. Run the four-protocol session above, then answer: which of the four responded with more information than a hardened system should volunteer? For each, write the finding, its ATT&CK technique mapping (T1135 or T1018 where it fits), and the specific hardening change (for example: require SMB signing, disable anonymous LDAP binds, enforce NLA for RDP).'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SMB enumeration asks about shares, dialects (SMBv1) and null sessions; smbclient -L -N is the first probe',
              'RPC\u2019s endpoint mapper on 135 is the directory of Windows services; rpcclient asks it questions directly',
              'LDAP anonymous binds are the directory-leak test: ldapsearch -x with no bind DN, judged by what it returns',
              'RDP enumeration is about NLA and reachability, not just a banner on 3389',
              'Enumeration maps to ATT&CK discovery techniques (T1135, T1018) — the same activity read from the defender\u2019s side'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n07-l04-q1',
          type: 'mcq',
          prompt: 'What does smbclient -L //10.0.0.20 -N attempt?',
          options: [
            'Listing the server\u2019s shares using an anonymous (null) session with no password',
            'Downloading every share\u2019s contents read-only',
            'Enumerating users by cycling RIDs on the domain controller',
            'Negotiating SMBv1 explicitly'
          ],
          answerIndex: 0,
          hint: 'The -N flag means no password.',
          explanation:
            '-L asks for the share list and -N supplies no password, which triggers the classic null-session attempt. What comes back reveals how much the server leaks to unauthenticated clients; user enumeration via RID cycling is a separate, much noisier technique.'
        },
        {
          id: 'n07-l04-q2',
          type: 'truefalse',
          prompt: 'An LDAP server on port 389 that accepts anonymous binds and returns naming contexts has misconfigured directory access.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Should an unauthenticated stranger be able to read the directory\u2019s shape?',
          explanation:
            'Allowing anonymous binds to read naming contexts and objects hands attackers the directory inventory — users, structure, attributes — without a single credential. Modern directories restrict anonymous reads; the exposure is a standard finding worth reporting with the ldapsearch output as evidence.'
        },
        {
          id: 'n07-l04-q3',
          type: 'short',
          prompt: 'Why does RDP without network-level authentication matter more than a plain RDP banner?',
          modelAnswer:
            'NLA forces the client to authenticate before a full session is established, so unauthenticated clients reach little. Without NLA, the pre-authentication surface of the RDP service is exposed to anyone who can reach port 3389 — historically a productive target for attackers, and it means exposure plus any later credential leak converts directly into an interactive login. The banner alone is harmless; the missing pre-authentication requirement is the risk.',
          hint: 'Think about what an unauthenticated attacker can touch before any password is involved.',
          explanation:
            'RDP enumeration is really a reachability and pre-auth question. Enforcing NLA and restricting 3389 to management networks are the standard remediations, and both are configuration facts you can verify and evidence during enumeration.'
        },
        {
          id: 'n07-l04-q4',
          type: 'scenario',
          prompt:
            'Your lab DC returns the domain name and fourteen usernames to enum4linux, and its password policy shows lockout threshold zero. Explain why you would report these as a linked pair, and map each to a MITRE ATT&CK technique.',
          modelAnswer:
            'They compound. The user enumeration means an attacker has a complete target list without needing a single credential (Remote System Discovery / directory discovery territory — T1018 covers remote system discovery, and the share and directory access aspects map to T1135 Network Share Discovery), and the zero lockout threshold means unlimited password guessing against those users without locking anything (the precondition for brute-force techniques like T1110). Reported separately the findings look modest; reported as a chain — leaked user inventory plus no lockouts — they describe a complete, low-noise credential attack path. The remediation pair is: restrict anonymous enumeration (SMB signing, disable null sessions and anonymous LDAP) and set a sane lockout or throttling policy.',
          hint: 'One finding supplies the who, the other removes the guardrail. What does that combination enable?',
          explanation:
            'Enumeration findings gain severity from what they enable downstream. Mapping to ATT&CK techniques (T1135, T1018, T1110) communicates the same chain in the language defenders use for detection planning — the core habit this lesson wants to install.'
        },
        {
          id: 'n07-l04-q5',
          type: 'mcq',
          prompt: 'Which port combination is correct for SMB and the RPC endpoint mapper on a modern Windows host?',
          options: [
            'SMB on 139 only; endpoint mapper on 445',
            'SMB on 445 (139 legacy); endpoint mapper on 135 with services on dynamic high ports',
            'SMB on 135; endpoint mapper on 389',
            'SMB on 445; endpoint mapper on 3389'
          ],
          answerIndex: 1,
          hint: 'The endpoint mapper is the directory that hands out the dynamic ports.',
          explanation:
            'Direct-hosted SMB uses 445 (139 is the NetBIOS legacy transport), and clients find RPC services by asking the endpoint mapper on 135, which points them to dynamic high ports. Getting these roles right matters because firewall rules and scan interpretations both depend on them.'
        }
      ],
      references: [
        {
          title: 'Microsoft — SMB Protocol and CIFS Protocol Overview',
          url: 'https://learn.microsoft.com/en-us/windows/win32/fileio/microsoft-smb-protocol-and-cifs-protocol-overview',
          note: 'Official Microsoft overview of SMB dialects, shares and authentication model.'
        },
        {
          title: 'Samba — smbclient(1) manual page',
          url: 'https://www.samba.org/samba/docs/current/man-html/smbclient.1.html',
          note: 'Official documentation for -L share listing and -N anonymous access.'
        },
        {
          title: 'Samba — rpcclient(1) manual page',
          url: 'https://www.samba.org/samba/docs/current/man-html/rpcclient.1.html',
          note: 'Official documentation for RPC queries such as querydominfo and enumdomusers.'
        },
        {
          title: 'RFC 4511 — Lightweight Directory Access Protocol (LDAP): The Protocol',
          url: 'https://www.rfc-editor.org/rfc/rfc4511.html',
          note: 'The LDAP protocol specification — binds, searches and naming contexts.'
        },
        {
          title: 'MITRE ATT&CK — T1135 Network Share Discovery',
          url: 'https://attack.mitre.org/techniques/T1135/',
          note: 'The defender\u2019s view of SMB share enumeration, with detection data sources.'
        },
        {
          title: 'MITRE ATT&CK — T1018 Remote System Discovery',
          url: 'https://attack.mitre.org/techniques/T1018/',
          note: 'How defenders classify the remote-system mapping this lesson\u2019s sweeps produce.'
        }
      ]
    },
    {
      id: 'n07-l05',
      moduleId: 'n07',
      title: 'SNMP, NFS, Databases and Management Interfaces',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n07-l01'],
      objectives: [
        'Enumerate SNMP with community strings and explain why sysDescr is reconnaissance gold',
        'Use showmount to read NFS export policy and recognize exports open to everyone',
        'Assess database service exposure and version banners on the standard ports',
        'Recognize exposed management planes — appliance consoles, out-of-band cards, hypervisor UIs — as high-value findings'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Every network has a second layer of services that nobody puts on the architecture diagram: the monitoring protocol that knows every device\u2019s identity, the file-share protocol that trusts whole subnets, the databases that hold the actual data, and the management consoles that administer everything else. These are the forgotten services — rarely in scope documents, rarely patched with the same discipline, and frequently configured with the defaults they shipped with.'
          },
          {
            type: 'p',
            text:
              'Enumeration here pays unusually well. An SNMP agent with the default community string answers questions about every interface, route and service on a device. An NFS server with a wildcard export hands out its file systems to anyone who asks. A database port reachable from a user network is a policy failure before any credential is tried. And a management interface is the keys to the kingdom by definition — it exists to change the behavior of other systems.'
          }
        ],
        technical: [
          { type: 'h', text: 'SNMP — UDP 161 (agents), 162 (traps)' },
          {
            type: 'p',
            text:
              'SNMP (RFC 1157 and successors) manages devices through a tree of objects (the MIB) addressed by numeric OIDs. Version 1 and version 2c protect it with nothing but a community string — a shared cleartext password — and the overwhelming majority of devices ship with public for reads and private for writes. If an agent accepts public, snmpwalk walks the whole tree: system description (sysDescr, which names OS and version), interfaces, routing tables, listening services, installed software. One UDP query family, and the device introduces itself completely. SNMPv3 exists precisely to fix this, adding authentication and encryption — its absence on enumerated devices is a finding in itself.'
          },
          {
            type: 'terminal',
            title: 'SNMP enumeration on a lab router (read-only)',
            lines: [
              '$ snmpwalk -v 2c -c public 10.0.0.1',
              'iso.3.6.1.2.1.1.1.0 = STRING: "Linux labrouter 5.15.0 #1 SMP x86_64"',
              'iso.3.6.1.2.1.1.3.0 = Timeticks: (352142) 0:58:41.42',
              'iso.3.6.1.2.1.1.4.0 = STRING: "lab-admin"',
              'iso.3.6.1.2.1.1.5.0 = STRING: "labrouter"',
              'iso.3.6.1.2.1.1.6.0 = STRING: "Building B, rack 3"',
              '^C',
              '# sysDescr names the OS and kernel; sysContact and sysLocation',
              '# leak organizational details. All from the default community.',
              '$ nmap -sU -p161 -sV --script snmp-sysdescr 10.0.0.1',
              'PORT    STATE SERVICE VERSION',
              '161/udp open  snmp    SNMPv1 server (public); sysName: labrouter'
            ]
          },
          {
            type: 'callout',
            variant: 'danger',
            title: 'Read-only, always',
            text:
              'Enumeration is read-only by definition. SNMP write access (snmpset) changes device configuration — interfaces, routes, even passwords. Never send write operations, not even in a hurry and not even in a lab without deciding to, because they are indistinguishable from an attack taking control of the device.'
          },
          { type: 'h', text: 'NFS — TCP 2049' },
          {
            type: 'p',
            text:
              'NFS (RFC 1094 for the classic version) exports directories from a server, and the MOUNT protocol keeps a list of what is exported for whom. showmount -e asks for that list directly — an enumerator\u2019s dream, because the server states its own access policy. The classic finding is an export to (everyone): any host that can route to the server can mount the file system, subject only to UID matching, which is trivially spoofable on Linux clients. The exports(5) man page documents the server-side configuration that produces these lines.'
          },
          {
            type: 'terminal',
            title: 'Reading NFS export policy on a lab file server',
            lines: [
              '$ showmount -e 10.0.0.20',
              'Export list for 10.0.0.20:',
              '/exports/share   (everyone)',
              '/exports/backup  10.0.0.0/24',
              '# (everyone) plus an unauthenticated mount on Linux clients',
              '# equals a full data exposure — record and report it.'
            ]
          },
          { type: 'h', text: 'Databases — TCP 3306, 1433, 5432 and friends' },
          {
            type: 'p',
            text:
              'MySQL and derivatives listen on 3306, Microsoft SQL Server on 1433 (with a UDP 1434 browser service that reveals instances), PostgreSQL on 5432. Enumeration here is mostly exposure assessment: is the port reachable from networks that have no business talking to a database? What does the version banner say — MySQL servers answer a plain connection with a version string? Are default or well-known credentials in play (a question answered with explicit client permission, never by blind guessing)? A database listening on 0.0.0.0 in a flat network is a finding even when its credentials are strong, because it moves the security boundary from the network to a single password.'
          },
          {
            type: 'terminal',
            title: 'Database service enumeration on a lab host',
            lines: [
              '$ nmap -sV -p 3306,5432 10.0.0.20',
              'PORT     STATE SERVICE VERSION',
              '3306/tcp open  mysql   MySQL 8.0.36-0ubuntu',
              '5432/tcp open  pgsql   PostgreSQL DB 15.6',
              '$ nc -v 10.0.0.20 3306',
              'Connection to 10.0.0.20 3306 port [tcp/mysql] succeeded!',
              'J',
              '8.0.36-0ubuntu0.22.04.1',
              '# The MySQL greeting carries the version in the first bytes.'
            ]
          },
          { type: 'h', text: 'Management interfaces — the second control plane' },
          {
            type: 'p',
            text:
              'Printers, switches, UPS units, out-of-band management cards (iLO, iDRAC, IPMI), hypervisor consoles and container UIs all listen on web or protocol ports of their own — 8080, 8443, 9090, 623 and many others. They share a profile: rarely scanned, rarely patched, frequently on default credentials, and authoritative over the devices they manage. Enumeration is the same workflow — fingerprint the banner, check TLS, note the product — plus the exposure question: which network can reach this console? A hypervisor management UI reachable from a user VLAN is one of the highest-severity findings a network assessment can produce.'
          },
          {
            type: 'table',
            headers: ['Service', 'Ports', 'What to check', 'Typical red flag'],
            rows: [
              ['SNMP', '161/udp, 162/udp', 'Default communities (public), sysDescr contents, SNMPv1/v2c versus v3', 'public community answers; write communities exist; device inventory leaked'],
              ['NFS', '2049/tcp', 'showmount -e output, export targets', 'Exports to (everyone) or to overly broad subnets'],
              ['MySQL / MSSQL / Postgres', '3306, 1433 (+1434/udp), 5432', 'Reachability, version banners, listener binding', 'DB ports reachable from user segments; ancient versions'],
              ['Management planes', '8080, 8443, 9090, 623 and others', 'Product fingerprint, TLS config, reachability from user networks', 'Default credentials, no TLS, consoles on flat networks']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These services concentrate the highest ratio of finding-to-effort in network assessments. SNMP with a default community hands over a complete device inventory in one command; showmount turns a server into its own informant; database ports and management consoles mark the exact spots where network segmentation is failing. They also share a defender-blindness property — many monitoring stacks watch TCP web and mail ports far better than UDP 161 — which makes documenting them doubly valuable.'
          },
          {
            type: 'list',
            items: [
              'SNMP sysDescr/sysName/sysLocation leak OS versions, hostnames and even rack locations — full inventory for free',
              'NFS (everyone) exports are immediate high-severity data exposure findings',
              'Database reachability is a segmentation finding independent of credential strength',
              'Management interfaces are the escalation path of choice once any foothold exists — their exposure belongs in every report'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'UDP 161 answering with the public community — and sysDescr strings revealing old OS builds',
              'SNMPv1/v2c only, with no SNMPv3 configured on infrastructure devices',
              'showmount -e lines containing (everyone) or export targets wider than the documented client subnets',
              'Database ports (3306, 1433, 5432) listening on 0.0.0.0 and reachable from user VLANs',
              'Web consoles on nonstandard ports with default credential banners, expired certificates or plain HTTP'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Your lab, read-only queries',
            text:
              'Practice against lab VMs and devices you own, and keep every query read-only: snmpwalk and showmount read state, snmpset changes it. Probing SNMP or management consoles on networks you are not authorized to touch is illegal and can disrupt operations — UDP services in particular are easy to disturb and hard to attribute.'
          },
          {
            type: 'p',
            text:
              'A compact lab sweep touching all four categories (targets are your own VMs):'
          },
          {
            type: 'terminal',
            title: 'The forgotten-services sweep',
            lines: [
              '# SNMP on the lab router (UDP — note the -sU)',
              '$ nmap -sU -p161 --script snmp-sysdescr 10.0.0.1',
              '$ snmpwalk -v 2c -c public 10.0.0.1 sysDescr.0',
              '# NFS export policy on the lab file server',
              '$ showmount -e 10.0.0.20',
              '# Database exposure on the lab app server',
              '$ nmap -sV -p 3306,1433,5432 10.0.0.20',
              '# Management planes: fingerprint what answers on the console ports',
              '$ nmap -sV -p 8080,8443,9090 10.0.0.0/24',
              'Nmap scan report for 10.0.0.20',
              'PORT     STATE SERVICE VERSION',
              '8080/tcp open  http    Apache Tomcat 9.0.71',
              '# A Tomcat manager on 8080 reachable from the user segment:',
              '# that goes straight into the findings list.'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab vignette. The scan of the lab subnet surfaces three quiet facts: the router answers SNMP public and its sysDescr names a kernel from 2019; the file server exports /exports/share to (everyone); and the hypervisor\u2019s web console on 10.0.0.2:8443 is reachable from the student VLAN with a self-signed certificate and a login page that has never been updated. None of these required a single credential to discover, and each one is a complete report finding: SNMP hardening (new communities, v3, ACLs), NFS export restriction, and management-plane segmentation. This is the forgotten-services lesson doing exactly what it promises.'
          },
          {
            type: 'callout',
            variant: 'tip',
            title: 'Scan UDP deliberately',
            text:
              'TCP-only sweeps never see SNMP, TFTP or syslog. Schedule a targeted UDP pass (-sU with a short top-ports list) in every lab exercise so the habit survives into real work.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Why it matters here'],
            rows: [
              ['snmpwalk (net-snmp)', 'Walks the SNMP MIB tree with a community string; the fastest device inventory available'],
              ['nmap --script snmp-sysdescr', 'One-query SNMP fingerprinting with sysName and sysDescr'],
              ['showmount (nfs-utils)', 'Asks an NFS server to state its own export policy'],
              ['nmap -sV', 'Version banners for databases and management consoles across many ports'],
              ['nc', 'Raw banner grabs, including the MySQL greeting that carries its version']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Scanning SNMP with TCP only — it is a UDP service and TCP-only sweeps are blind to it',
              'Sending SNMP write operations (snmpset) while exploring; enumeration must remain read-only',
              'Treating (everyone) NFS exports as low severity because they are internal — UID spoofing makes them effectively global',
              'Assuming strong database credentials compensate for flat-network reachability; the finding is the exposure, not the password',
              'Skipping nonstandard web ports during management-interface checks — 8080, 8443 and 9090 are where consoles live'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab, deliberately create the classic trio: an SNMP agent accepting public, an NFS export to (everyone), and a database bound to 0.0.0.0. Then run the forgotten-services sweep against your own VMs, capture the evidence for each, and write the three findings with concrete remediations (v3 SNMP or strong communities with ACLs, export restriction, listener binding plus network policy).'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SNMP v1/v2c authenticate with a cleartext community string; public is the default that answers everything',
              'snmpwalk is read-only and yields full device inventory — sysDescr alone often names OS, version and hostname',
              'showmount -e makes the NFS server confess its export policy; (everyone) is the headline finding',
              'Database enumeration is exposure assessment: ports, banners and listener binding, before any credential question',
              'Management interfaces concentrate administrative power — their reachability is a top-tier network finding'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n07-l05-q1',
          type: 'mcq',
          prompt: 'What does an SNMP agent accepting the community string public typically give an enumerator?',
          options: [
            'Only the device hostname, for compatibility reasons',
            'A read-only walk of the MIB tree: system description, interfaces, routes and more',
            'Full read-write access to device configuration',
            'Nothing — public is a trap string that alerts administrators'
          ],
          answerIndex: 1,
          hint: 'Think about what snmpwalk returned in the lesson.',
          explanation:
            'The public community is the near-universal default for read access, and a walk returns the system group (sysDescr, sysName, sysLocation), interface tables and routing data — a complete inventory. Write access is governed by a separate community (traditionally private), and enumeration must never attempt writes.'
        },
        {
          id: 'n07-l05-q2',
          type: 'truefalse',
          prompt: 'showmount -e reveals an export line /exports/share (everyone). This is a low-severity finding as long as the server is internal.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'How does NFS decide who a client is?',
          explanation:
            'NFS access control is based on client IP and, for file ownership, on numeric UIDs — which any Linux client can trivially present as arbitrary values. An (everyone) export is therefore a near-global data exposure whenever the network is reachable, internal or not; severity comes from the export policy, not the subnet label.'
        },
        {
          id: 'n07-l05-q3',
          type: 'short',
          prompt: 'Why is a database port reachable from user networks a finding even when the database uses strong passwords?',
          modelAnswer:
            'Reachability moves the security boundary. With the port on a flat user network, the only thing between any workstation and the database is one credential — so phishing, spraying or a reused password becomes a direct data breach path, and the database\u2019s full attack surface (protocol quirks, version vulnerabilities) is exposed to every host. With proper segmentation (database tier reachable only from application servers), an attacker must first compromise an application host, adding a layer. The finding is about network design, not password strength.',
          hint: 'What does the network still have to contribute when the password is the only control left?',
          explanation:
            'Layered defense means the network should fail before the data does. Database exposure findings are remediated with listener binding and network policy (firewalling, VLANs, security groups) — no password change required, which is why they must not be dismissed as "we use strong passwords".'
        },
        {
          id: 'n07-l05-q4',
          type: 'scenario',
          prompt:
            'Your authorized lab sweep finds: a router whose snmpwalk via public returns sysDescr naming a 2019 kernel, and a hypervisor management console on 8443 reachable from the student VLAN with a self-signed certificate. Draft both findings with impact and remediation, and state one reason why each was invisible to a TCP-only scan policy.',
          modelAnswer:
            'Finding 1 — legacy SNMP with default community. Evidence: snmpwalk -v 2c -c public output with sysDescr naming the 2019 kernel and device details. Impact: unauthenticated full device inventory (OS version, interfaces, routes) usable for vulnerability matching and further recon; v1/v2c also transmit the community string in cleartext. Remediation: replace default communities with strong, randomized ones behind ACLs, and migrate to SNMPv3 with authentication and encryption; patch the underlying device. Finding 2 — management plane exposure. Evidence: service fingerprint on 10.0.0.2:8443 plus the self-signed certificate details. Impact: the console that controls the hypervisor is reachable from an untrusted user network, so any foothold on the segment can attempt administrative access; the self-signed certificate also trains users to bypass certificate warnings. Remediation: restrict 8443 to the dedicated management network, enroll the console in the internal PKI, and enable MFA on the console. Visibility: the SNMP service lives on UDP 161, which TCP-only scans never probe; the console sits on a nonstandard port (8443) that default web checks often skip — both are coverage gaps, which is the second half of the answer.',
          hint: 'One finding is about UDP blindness, the other about where consoles actually listen.',
          explanation:
            'Both findings are classic forgotten-service results: unscanned transport (UDP) and unscanned ports (management consoles). The remediations differ — protocol hardening versus network segmentation — but both start with the enumeration evidence recorded in this lesson.'
        }
      ],
      references: [
        {
          title: 'RFC 1157 — A Simple Network Management Protocol (SNMP)',
          url: 'https://www.rfc-editor.org/rfc/rfc1157.html',
          note: 'The SNMP specification, including the community-string model this lesson exploits.'
        },
        {
          title: 'Net-SNMP — snmpwalk manual page',
          url: 'https://www.net-snmp.org/docs/man/snmpwalk.html',
          note: 'Official documentation for the MIB walk command used throughout the lesson.'
        },
        {
          title: 'RFC 1094 — NFS: Network File System Protocol Specification',
          url: 'https://www.rfc-editor.org/rfc/rfc1094.html',
          note: 'The classic NFS and MOUNT protocol specification behind showmount.'
        },
        {
          title: 'Linux man-pages — exports(5), the NFS server export table',
          url: 'https://man7.org/linux/man-pages/man5/exports.5.html',
          note: 'Server-side configuration syntax that produces the export lines showmount reports.'
        },
        {
          title: 'PostgreSQL — Official Documentation',
          url: 'https://www.postgresql.org/docs/',
          note: 'Official PostgreSQL documentation for connection and listener configuration on port 5432.'
        }
      ]
    }
  ]
};
