import type { Module } from '../../../../types';

// LEVEL 6 — ATTACKS & REMOTE SERVICES · Module 10: Remote Services
// Original curriculum content synthesized from public official documentation:
// OpenSSH manuals, IETF RFCs, Microsoft Learn and MITRE ATT&CK. All prose is
// original; reference links point to the official sources used for study.
// All techniques are taught for AUTHORIZED testing on lab or in-scope targets.

export const n10: Module = {
  id: 'n10',
  title: 'Remote Services',
  level: 6,
  description:
    'The services that let users and admins reach machines from afar: SSH, RDP, VNC, SMB, WinRM, and the legacy trio Telnet, FTP, NFS and RPC. For each one you will learn the protocol and authentication model, how to enumerate it safely, the misconfigurations it collects in the wild, what it looks like when abused, and how to harden it.',
  outcomes: [
    'Explain the protocol and authentication model of SSH, RDP, VNC, SMB, WinRM, Telnet, FTP, NFS and RPC',
    'Enumerate each service safely: banners, algorithms, shares, auth methods and effective configuration',
    'Recognize the misconfigurations these services commonly ship with and what they enable an attacker to do',
    'Recommend detection and hardening measures a defender should apply to each service',
    'Fold remote-service findings into the wider pentest workflow: foothold, validation, documentation'
  ],
  lessons: [
    {
      id: 'n10-l01',
      moduleId: 'n10',
      title: 'SSH: Protocol, Authentication and Testing',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n07-l02'],
      objectives: [
        'Describe the SSH-2 protocol layers and where authentication fits',
        'Explain host keys, known_hosts and the trust model of the first connection',
        'Compare password, key and agent-based authentication and their risks',
        'Enumerate an SSH server and audit its effective configuration'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'SSH is the encrypted remote shell that replaced Telnet and rlogin, and it is almost always the first service you meet on a Linux box. As a pentester you care about SSH from two directions. It is a target: weak passwords, leaked private keys and permissive root login turn SSH into the front door of a network. And it is a tool: once you have credentials, SSH is how you move between hosts and, later in the curriculum, how you tunnel traffic through them.'
          },
          {
            type: 'p',
            text:
              'The lesson develops a habit that applies to every remote service in this module: before touching authentication, learn what the service tells you without any credentials at all. SSH, politely, announces its version, its supported algorithms and the authentication methods it is willing to discuss — all before you prove who you are. Good testers read that announcement before they type a single password.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'SSH-2 (the only version you should ever see; SSH-1 is long dead) is layered. The transport layer first agrees on a version string, such as SSH-2.0-OpenSSH_9.6, then negotiates key exchange and ciphers and establishes the encrypted channel with the server host key as its anchor. Only then does the authentication layer run, exchanging user auth requests over the already-encrypted channel. The connection layer multiplexes that single TCP connection into channels: shell sessions, port forwards, X11, SFTP.'
          },
          {
            type: 'h',
            text: 'Host keys and the trust anchor'
          },
          {
            type: 'p',
            text:
              'Every SSH server holds a long-term host key per algorithm (Ed25519, ECDSA, RSA). The client records each host key in known_hosts the first time it connects — trust on first use. From then on, a changed host key triggers a loud warning, which means either the server was rebuilt or something is impersonating it. That warning is not noise; as a tester, a mismatch during a test is an event worth reporting, and in your own lab you should understand why you are overriding it.'
          },
          {
            type: 'h',
            text: 'User authentication methods'
          },
          {
            type: 'list',
            items: [
              'password — a plain password check, evaluated server-side over the encrypted channel',
              'publickey — the client proves possession of a private key whose public half sits in the account\u2019s authorized_keys file; keys may carry passphrases',
              'keyboard-interactive — a prompt loop (often one or more questions), the usual vehicle for MFA',
              'none — a probe that asks the server which methods it actually allows',
              'GSSAPI — Kerberos-backed auth common in enterprise Linux estates'
            ]
          },
          {
            type: 'p',
            text:
              'Agent forwarding deserves special attention. With ssh -A or ForwardAgent yes, the local agent socket is exposed on the remote host, so keys held in your workstation agent can be used from there to hop further. Anyone with root on that intermediate host can reach the same socket and borrow your keys while they are loaded — no passphrase required. On multi-hop management paths this is convenient and dangerous at the same time.'
          },
          {
            type: 'table',
            headers: ['sshd_config directive', 'What it controls', 'Typical weakness'],
            rows: [
              ['PermitRootLogin', 'Whether root may log in directly', 'yes on internet-facing hosts'],
              ['PasswordAuthentication', 'Password logins accepted at all', 'yes combined with weak accounts'],
              ['PubkeyAuthentication', 'Key-based logins accepted', 'no forces passwords everywhere'],
              ['AuthenticationMethods', 'Which method combinations pass', 'missing MFA requirement'],
              ['MaxAuthTries', 'Attempts per connection', 'high values feed brute force'],
              ['AllowUsers / AllowGroups', 'Who may log in', 'unset, so every account counts'],
              ['AllowTcpForwarding / PermitTunnel', 'Channel features', 'left on when only shell is needed'],
              ['Ciphers / KexAlgorithms / MACs', 'Crypto policy', 'legacy entries like ssh-rsa or CBC']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'SSH maps to MITRE ATT&CK T1021.004 (Remote Services: SSH) as a lateral movement vehicle, and its password path feeds T1110 brute force. Enumeration runs before any of that: the banner and algorithm list tell you the software family and rough age, and the unauthenticated method probe tells you whether a password attack is even worth planning.'
          },
          {
            type: 'list',
            items: [
              'A password-enabled SSH on the perimeter is a classic initial-access candidate — but spraying it is loud and lockout-prone, so validate the plan with the client first',
              'Private keys found on a compromised host (T1552.004) often open three more hosts without any password attack',
              'Agent forwarding on bastion hosts is a pivoting risk your report should call out even when nothing was exploited',
              'ssh-rsa (SHA-1) signatures and CBC ciphers are crypto-hygiene findings that automated audits surface in seconds'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'PermitRootLogin yes on internet-facing or bastion hosts',
              'PasswordAuthentication yes on hosts that should be key-only',
              'Legacy algorithm configuration: ssh-rsa signatures, CBC ciphers, weak key exchange groups',
              'ForwardAgent yes baked into system-wide client config on jump hosts',
              'authorized_keys entries for shared or service accounts without from= or command= restrictions',
              'Very old OpenSSH version banners that no longer receive security patches'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Authorized targets only',
            text:
              'SSH enumeration is unauthenticated and quiet, but authentication attempts are not: they hit accounts, logs and possibly lockout policies. Run the commands below only against lab machines or hosts covered by your rules of engagement.'
          },
          {
            type: 'terminal',
            title: 'Unauthenticated SSH enumeration',
            lines: [
              '$ nmap -sV -p 22 --script ssh2-enum-algos,ssh-auth-methods 10.10.20.5',
              'PORT   STATE SERVICE VERSION',
              '22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u3 (protocol 2.0)',
              '| ssh2-enum-algos:',
              '|   kex_algorithms: curve25519-sha256, ecdh-sha2-nistp256',
              '|   server_host_key_algorithms: rsa-sha2-512, ssh-rsa, ssh-ed25519',
              '|   encryption_algorithms: chacha20-poly1305@openssh.com, aes256-gcm@openssh.com',
              '| ssh-auth-methods:',
              '|_  Supported authentication methods: publickey; password',
              '$ ssh-keyscan 10.10.20.5',
              '# 10.10.20.5 SSH-2.0-OpenSSH_8.4p1 Debian-5+deb11u3',
              '10.10.20.5 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...',
              '$ ssh -v labadmin@10.10.20.5 true 2>&1 | grep -i "authentications"',
              'debug1: Authentications that can continue: publickey,password'
            ]
          },
          {
            type: 'p',
            text:
              'On a host you own, sshd -T prints the effective configuration after all include files and conditionals — the single most reliable way to audit a server, because it shows what sshd will actually do rather than what the file appears to say.'
          },
          {
            type: 'terminal',
            title: 'Auditing the effective server configuration',
            lines: [
              '$ sudo sshd -T | grep -Ei "permitrootlogin|passwordauthentication|pubkeyauthentication|maxauthtries"',
              'permitrootlogin no',
              'passwordauthentication no',
              'pubkeyauthentication yes',
              'maxauthtries 3'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab bastion runs OpenSSH 8.4 with PermitRootLogin yes and PasswordAuthentication yes. Enumeration takes thirty seconds and already yields three reportable observations: root can log in directly, password auth is enabled on the one host an attacker must not guess at, and the version banner is published verbatim. The compare below shows the minimal hardening diff a good report would propose.'
          },
          {
            type: 'compare',
            title: 'Bastion sshd_config: weak vs hardened',
            beforeTitle: 'Weak (lab default)',
            beforeCode:
              'Port 22\nPermitRootLogin yes\nPasswordAuthentication yes\nMaxAuthTries 6\nAllowTcpForwarding yes\nX11Forwarding yes',
            afterTitle: 'Hardened',
            afterCode:
              'Port 22\nPermitRootLogin no\nPasswordAuthentication no\nAuthenticationMethods publickey\nMaxAuthTries 3\nAllowUsers labadmin deploy\nAllowTcpForwarding no\nKexAlgorithms curve25519-sha256\nCiphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role in SSH testing'],
            rows: [
              ['nmap NSE (ssh2-enum-algos, ssh-auth-methods)', 'Unauthenticated banner, algorithm and auth-method discovery'],
              ['ssh -v / ssh-keyscan', 'Live negotiation detail and host key capture'],
              ['sshd -T', 'Effective server configuration audit on hosts you control'],
              ['ssh-audit', 'Automated policy scan against modern crypto recommendations'],
              ['auth.log / journalctl', 'Server-side view: which accounts were tried, from where']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Brute-forcing SSH before checking whether accounts even allow passwords — the method probe saves you from pointless noise',
              'Treating a host key mismatch as an inconvenience to click through instead of evidence of a rebuilt or spoofed host',
              'Reading sshd_config by eye and missing included files or Match blocks; sshd -T exists precisely for this',
              'Forgetting that keys are credentials too: a world-readable authorized_keys or an unencrypted id_rsa on a share is a finding',
              'Testing agent forwarding by enabling it everywhere in your own config and then wondering why keys went missing'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab VM: install and start OpenSSH server, run sshd -T and read the output end to end. Flip PermitRootLogin to yes, restart sshd, confirm with ssh -v that root login is offered, then set it back. Finally run ssh-audit against localhost and fix every warning it raises until the report is clean.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SSH-2 layers transport, authentication and connection; enumeration reads the transport before auth ever starts',
              'Host keys anchor trust: known_hosts mismatches are events, not errors',
              'Password auth on root is the worst combination; key-only with restricted authorized_keys is the goal',
              'Agent forwarding lends your keys to every intermediate host — use it deliberately',
              'sshd -T shows the truth of a configuration, not its intentions'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n10-l01-q1',
          type: 'mcq',
          prompt: 'What does a known_hosts entry primarily protect the client against?',
          options: [
            'A server impersonating the real host with a different key',
            'Password brute force over the network',
            'Port scans against the SSH service',
            'Weak ciphers negotiated during key exchange'
          ],
          answerIndex: 0,
          hint: 'What changed when the warning about a changed key appears?',
          explanation:
            'known_hosts pins the server host key after first use. On later connections a different key means the host was rebuilt or something else is answering — the warning is the anti-impersonation control.'
        },
        {
          id: 'n10-l01-q2',
          type: 'truefalse',
          prompt: 'In SSH-2, user authentication happens before the encryption channel is established.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Remember the layer order: transport, then authentication.',
          explanation:
            'The transport layer first performs key exchange and secures the channel. User authentication then runs inside that encrypted channel, which is why passwords are safe from passive sniffing even though they are checked against a server-side database.'
        },
        {
          id: 'n10-l01-q3',
          type: 'short',
          prompt: 'Explain in one or two sentences why ForwardAgent yes on a shared bastion is risky.',
          modelAnswer:
            'Agent forwarding exposes the local agent socket on the bastion, so anyone with sufficient privileges on that host (root, or the same account) can use the forwarded socket to authenticate onward with keys held in your agent — without ever needing the passphrase or the key files themselves.',
          hint: 'Who else can reach the agent socket while you are logged in?',
          explanation:
            'The agent holds decrypted keys in memory and answers signing requests. Forwarding the socket to a multi-user host means the host\u2019s privileged users can borrow those keys for further hops — a lateral movement shortcut.'
        },
        {
          id: 'n10-l01-q4',
          type: 'scenario',
          prompt:
            'During an authorized internal test you find an internet-facing bastion with PermitRootLogin yes and PasswordAuthentication yes. Describe how you would validate the finding safely and what hardening you would recommend.',
          modelAnswer:
            'Validate without a password attack: confirm via ssh -v or an ssh-auth-methods scan that password authentication is offered and that root is a permitted target, and note the exposure path. Avoid credential guessing unless the rules of engagement allow it and lockouts are understood. Recommend: PermitRootLogin no (or prohibit-password at most), PasswordAuthentication no with key-only AuthenticationMethods, restricted AllowUsers/AllowGroups, lowered MaxAuthTries, disabling unneeded forwarding, and modern Kex/Cipher policy. Report the combination as high risk: direct root plus passwords makes the bastion a single-guess away from full compromise.',
          hint: 'What can you prove without typing a single password?',
          explanation:
            'The dangerous part is the configuration combination, which is provable unauthenticated. Fixing the combination removes both the brute-force surface and the direct-root path; the report should present evidence of the configuration, not a successful login.'
        }
      ],
      references: [
        {
          title: 'OpenSSH — sshd_config manual page',
          url: 'https://man.openbsd.org/sshd_config',
          note: 'Authoritative reference for every directive discussed in this lesson.'
        },
        {
          title: 'RFC 4252 — The Secure Shell (SSH) Authentication Protocol',
          url: 'https://datatracker.ietf.org/doc/html/rfc4252',
          note: 'The protocol spec defining user auth methods over the SSH transport.'
        },
        {
          title: 'MITRE ATT&CK T1021.004 — Remote Services: SSH',
          url: 'https://attack.mitre.org/techniques/T1021/004/',
          note: 'How SSH abuse is classified in the adversary behavior model.'
        }
      ]
    },
    {
      id: 'n10-l02',
      moduleId: 'n10',
      title: 'RDP and VNC: Remote Desktop Services',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n07-l04'],
      objectives: [
        'Describe the RDP connection sequence and the role of NLA/CredSSP',
        'Explain how classic VNC authentication works and why it is weak',
        'Enumerate RDP and VNC services before authentication',
        'Recognize the desktop-service misconfigurations that dominate real-world findings'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Remote desktop services hand over the entire screen, keyboard and clipboard of a machine across the network. That makes them the most coveted remote services in any environment: whoever controls a desktop session controls a workstation user\u2019s day. RDP is the Windows-native protocol on port 3389; VNC is the simple, cross-platform framebuffer protocol usually on 5900 and above. Both are perennial targets because a single successful login is a full interactive foothold, not a shell or a file share.'
          },
          {
            type: 'p',
            text:
              'For a pentester the interesting question is not only can I authenticate, but what does the service reveal and accept before authentication, and what happens to accounts and defenders when authentication is attempted. Both questions shape whether a desktop service is a viable path in an engagement or an alarm you should not pull.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'RDP (documented publicly in Microsoft\u2019s MS-RDPBCGR family of specifications) negotiates over TCP 3389 — modern servers also use UDP 3389 for loss-tolerant graphics. The X.224 connection sequence starts with a negotiation request in which the client lists the security protocols it supports: legacy standard RDP security, TLS, and CredSSP. Network Level Authentication (NLA) is CredSSP in action: the client proves the user\u2019s credentials before a graphical session is allocated at all. With NLA enabled, unauthenticated attackers get far less surface; with it disabled, the server builds sessions for anyone and exposes pre-authentication code paths.'
          },
          {
            type: 'p',
            text:
              'Once connected, RDP carries virtual channels: clipboard sync, drive and printer redirection, audio. These channels are convenient for users and valuable for testers — an RDP session with drive redirection, for instance, can stage files in both directions, and clipboard sharing leaks whatever the user copies.'
          },
          {
            type: 'h',
            text: 'VNC and the RFB protocol'
          },
          {
            type: 'p',
            text:
              'VNC speaks RFB, standardized as RFC 6143. The handshake is simple: protocol version exchange, security type selection, authentication, then pixel data. Classic VNC authentication is a challenge-response over a password that is truncated to eight characters, with a DES-derived key — brute-forceable at absurd speed by modern hardware and, worse, the challenge-response exchange itself leaks material that offline crackers can work with. Classic RFB also does not encrypt the framebuffer: every keystroke-rich screen update crosses the wire in a recoverable form unless a TLS wrapper (or a derivative that adds TLS) is in front of it.'
          },
          {
            type: 'table',
            headers: ['Property', 'RDP', 'VNC (classic RFB)'],
            rows: [
              ['Default ports', 'TCP/UDP 3389', '5900+display (5900, 5901, ...)'],
              ['Authentication', 'NLA via CredSSP, TLS, or legacy RDP security', '8-character password challenge-response'],
              ['Session encryption', 'TLS / CredSSP-protected', 'none by default; depends on wrapper or vendor extension'],
              ['Typical exposure', 'Windows servers and workstations', 'kiosks, hypervisor consoles, build rooms, legacy systems'],
              ['Main abuses', 'Brute force, exposed to internet, session takeover', 'Weak passwords, unauthenticated consoles, cleartext screen data']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'MITRE ATT&CK tracks RDP as T1021.001: remote desktop is one of the most common lateral movement and initial access tools in real intrusions. Internet-exposed RDP shows up in breach reports year after year, usually reached through password guessing (T1110) against NLA-less or weakly protected endpoints. VNC appears less often in reports but yields total control when found with weak credentials — hypervisor and appliance consoles are the classic prizes.'
          },
          {
            type: 'list',
            items: [
              'Pre-auth RDP enumeration returns NTLM challenge details — hostname, domain and OS build — which quietly maps a network for you',
              'NLA disabled means pre-auth session allocation: historically a hunting ground for severe remote code execution bugs, so treat it as high severity on exposed hosts',
              'VNC displays above 5900 are the ones people forget to firewall; scan a range, not a port',
              'Every authentication attempt against RDP hits Windows account lockout policy — plan attempts with the client'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'RDP reachable from the internet or from the DMZ with no VPN or gateway in front of it',
              'NLA (CredSSP) negotiation missing from the server\u2019s offered security protocols',
              'VNC listeners on high display numbers (5901+) with classic weak authentication',
              'VNC without any TLS wrapper on networks you do not control end to end',
              'Shared or generic accounts used for RDP, making attribution and lockouts impossible',
              'Desktop services bound to management VLANs but reachable from user VLANs'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Lockouts and production impact',
            text:
              'RDP authentication testing interacts with Windows account lockout and alerting. Enumeration below is unauthenticated and safe on authorized targets; credential attacks require explicit permission and a plan agreed with the client.'
          },
          {
            type: 'terminal',
            title: 'Enumerating RDP and VNC pre-authentication',
            lines: [
              '$ nmap -sV -p 3389 --script rdp-ntlm-info,rdp-enum-encryption 10.10.20.20',
              'PORT     STATE SERVICE       VERSION',
              '3389/tcp open  ssl/ms-wbt-server?',
              '| rdp-ntlm-info:',
              '|   Target_Name: CORP',
              '|   NetBIOS_Computer_Name: LAB-RDS01',
              '|   DNS_Domain_Name: corp.lab',
              '|   DNS_Computer_Name: LAB-RDS01.corp.lab',
              '|_  Product_Version: 10.0.20348',
              '| rdp-enum-encryption:',
              '|   Security layer: SSL + CredSSP (NLA supported)',
              '$ nmap -sV -p 5900-5910 --script vnc-info 10.10.20.50',
              'PORT     STATE SERVICE VERSION',
              '5901/tcp open  vnc     VNC (protocol 3.8)',
              '| vnc-info:',
              '|   Protocol version: 3.8',
              '|   Security types:',
              '|_    VNC Authentication (2)'
            ]
          },
          {
            type: 'p',
            text:
              'The rdp-ntlm-info output is the quiet win: domain name, machine name and OS build without a single login. The VNC result shows classic VNC authentication selected — with no TLS security type offered, the session is unencrypted. netexec wraps both checks for Windows estates: nxc rdp prints whether NLA is enforced and validates credentials when you have them.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'In the lab, a build-server VM answers on 5901 with classic VNC authentication and its console password set to a four-character policy exception "for the imaging technician". A controlled password test (authorized, lab-only) yields the console of the hypervisor in under a minute — total control of the virtualization layer through one weak desktop service. The finding chain is: exposed VNC, weak auth scheme, no TLS, and no network restriction between user VLANs and the console.'
          },
          {
            type: 'compare',
            title: 'RDP hardening: before and after',
            beforeTitle: 'Exposed and NLA-less',
            beforeCode:
              'Port 3389 published directly to internet\nNLA disabled for a legacy kiosk app\nGeneric account "rdsuser" shared by a team\nNo source-IP restriction',
            afterTitle: 'Hardened',
            afterCode:
              'RDP reachable only via VPN or RD Gateway\nNLA (CredSSP) enforced, TLS 1.2+\nNamed accounts with MFA and just-in-time membership\nFirewall allow-lists per management subnet\nLockout thresholds tuned and monitored'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['nmap NSE (rdp-ntlm-info, rdp-enum-encryption, vnc-info)', 'Pre-auth discovery of identity, security layers and VNC modes'],
              ['netexec (nxc rdp)', 'Estate-wide RDP checks: NLA status, credential validation, screenshot capture'],
              ['mstsc / FreeRDP (xfreerdp)', 'Client-side connection tests, NLA behavior, redirection checks'],
              ['Windows Event IDs 4624/4625', 'Defender view: successful and failed RDP logons (logon type 10)']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Scanning only 5900 and missing VNC displays on 5901, 5902 and beyond',
              'Assuming NLA alone makes brute force pointless — it raises the bar but guessing still works against weak passwords until lockouts bite',
              'Running credential attacks against production RDP without agreed lockout limits, causing fleet-wide account lockouts',
              'Marking RDP "closed" because one firewall path blocks it while a port-forward or jump host still reaches it',
              'Ignoring the encryption question for VNC: authentication strength and transport confidentiality are separate findings'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab: enable RDP on a Windows VM and toggle NLA off and on, running nmap --script rdp-enum-encryption each time to see the advertised security layers change. Then start a VNC server on display 1, scan 5900-5910 from another VM, and confirm vnc-info shows the classic auth type. Write one sentence per observation as if for a report.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'RDP negotiates security before graphics: NLA/CredSSP is the setting that matters most',
              'Pre-auth RDP leaks identity data (NTLM info) — free mapping for the attacker',
              'Classic VNC auth is an eight-character password scheme with no session encryption',
              'Internet-exposed desktop services are a recurring real-world breach pattern',
              'Plan credential testing around lockout policy, not around curiosity'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n10-l02-q1',
          type: 'mcq',
          prompt: 'What does Network Level Authentication (NLA) change about an RDP connection?',
          options: [
            'The user must prove credentials before a graphical session is allocated',
            'The session framebuffer is encrypted with DES',
            'RDP switches from TCP to UDP only',
            'The server disables clipboard redirection'
          ],
          answerIndex: 0,
          hint: 'The word "level" refers to where in the connection sequence it happens.',
          explanation:
            'NLA uses CredSSP to authenticate the user before the RDP session stack builds a session. This shrinks the unauthenticated attack surface dramatically and reduces resource-exhaustion risks.'
        },
        {
          id: 'n10-l02-q2',
          type: 'truefalse',
          prompt: 'Classic VNC authentication encrypts the entire screen session after the password check.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Authentication strength and transport encryption are separate properties.',
          explanation:
            'Classic RFB authenticates with an 8-character password challenge-response but does not encrypt the framebuffer or input. Confidentiality requires a TLS wrapper or a vendor extension; many forgotten VNC deployments have neither.'
        },
        {
          id: 'n10-l02-q3',
          type: 'short',
          prompt: 'Why is the rdp-ntlm-info NSE script valuable before any login attempt?',
          modelAnswer:
            'It harvests NTLM challenge information that RDP exposes pre-authentication: the target\u2019s NetBIOS and DNS names, the domain it belongs to and the OS build. This maps and fingerprints hosts without triggering any authentication event.',
          hint: 'What fields does NTLM authentication material carry with it?',
          explanation:
            'NTLM messages embed hostname and domain identifiers. Exposing them before auth turns RDP into a quiet inventory source for attackers and a hardening target (limiting pre-auth disclosure) for defenders.'
        },
        {
          id: 'n10-l02-q4',
          type: 'scenario',
          prompt:
            'You discover RDP open on an office firewall from the internet, and the server negotiates only standard RDP security without NLA. Lay out the risks, the safe validation steps and the hardening you would recommend.',
          modelAnswer:
            'Risks: pre-auth session allocation exposes a larger code path to unauthenticated attackers; password guessing (T1110) is cheap against internet RDP; a successful login is a full interactive foothold; the exposed endpoint may also leak NTLM identity info. Safe validation: enumerate with rdp-ntlm-info and rdp-enum-encryption to prove NLA absence and capture exposure evidence; do not brute force without ROE approval and lockout analysis. Hardening: remove the direct internet publication and require VPN or an RD Gateway, enforce NLA and TLS 1.2+, replace shared accounts with named MFA-protected ones, restrict source networks, and monitor 4625 failures for guessing campaigns.',
          hint: 'Separate what you can prove unauthenticated from what needs a plan.',
          explanation:
            'The configuration facts are provable quietly; the exploitation risk is documented by the pattern, not by you doing it. The remediation pairing (remove exposure + enforce NLA + identity hygiene) is the standard fix set for this recurring finding.'
        }
      ],
      references: [
        {
          title: 'Microsoft Learn — Understanding Remote Desktop Protocol',
          url: 'https://learn.microsoft.com/en-us/troubleshoot/windows-server/remote/understanding-remote-desktop-protocol',
          note: 'Official overview of the RDP connection and security negotiation sequence.'
        },
        {
          title: 'RFC 6143 — The Remote Framebuffer Protocol (RFB / VNC)',
          url: 'https://datatracker.ietf.org/doc/html/rfc6143',
          note: 'The VNC protocol spec, including its security handshaking and classic auth.'
        },
        {
          title: 'MITRE ATT&CK T1021.001 — Remote Services: Remote Desktop Protocol',
          url: 'https://attack.mitre.org/techniques/T1021/001/',
          note: 'How RDP abuse appears in the adversary behavior model.'
        }
      ]
    },
    {
      id: 'n10-l03',
      moduleId: 'n10',
      title: 'SMB and WinRM: Windows Remote Access',
      difficulty: 'Intermediate',
      minutes: 20,
      prerequisites: ['n07-l04'],
      objectives: [
        'Describe SMB dialects, signing and the role of shares and named pipes',
        'Explain the NTLM and Kerberos authentication split at a working level',
        'Describe WinRM listeners, ports and how PowerShell remoting rides on it',
        'Enumerate SMB and WinRM safely and recognize their common misconfigurations'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'If SSH is the front door of Linux, SMB is the front door, the hallway and the internal mail system of Windows. The Server Message Block protocol carries file shares, printers, named pipes and remote administration across Windows networks on TCP 445. WinRM is the younger sibling: an HTTP-based management protocol (ports 5985/5986) that PowerShell remoting rides on. Together they are the two services a pentester must understand cold, because nearly every lateral movement technique on Windows ends in one of them.'
          },
          {
            type: 'p',
            text:
              'Both services are identity-driven: what you can do depends entirely on who you are to the domain. That is why Windows testing is so credential-centric, and why this lesson keeps returning to one question — what does this service let an identity do, and which identities exist here?'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'SMB negotiates a dialect at session start: SMB1 (the ancient CIFS-descended dialect) through SMB 3.1.1. Each generation added security: SMB2 brought mandatory-capable signing, SMB3 added end-to-end encryption and better signing. Two ports matter: 445 for direct SMB over TCP and 139 for the legacy NetBIOS transport. Authentication is either NTLM challenge-response or Kerberos in a domain; after authentication, the client mounts shares and opens named pipes. IPC$ is the special pipe-sharing share that remote administration rides on: the svcctl pipe exposes service control, which is how classic remote-execution tools drop a binary into ADMIN$ and register a service.'
          },
          {
            type: 'p',
            text:
              'Signing deserves precision. Signing attaches an HMAC to each message so tampering fails — and because it binds messages to the authenticated session, requiring it also defuses relay-style abuse where an attacker forwards authentication material. Servers can support signing without requiring it; the requirement is what defends. SMBv1 is the other headline: it predates modern hardening entirely, it is the dialect behind the worm-era bugs of 2017, and it should simply be absent from any current network.'
          },
          {
            type: 'h',
            text: 'WinRM: management over HTTP'
          },
          {
            type: 'p',
            text:
              'WinRM implements WS-Management, a SOAP protocol. Listeners answer on 5985 (HTTP, message encryption supplied by the auth layer) and 5986 (HTTPS with TLS). Authentication is Negotiate — usually Kerberos in a domain, NTLM elsewhere. PowerShell remoting (Enter-PSSession, Invoke-Command) layers PSRP on top, giving interactive remote PowerShell. By default, WinRM access maps to local administrator membership, which is exactly why an open WinRM plus a weak local admin is a domain-wide problem, not a host problem.'
          },
          {
            type: 'table',
            headers: ['Aspect', 'SMB', 'WinRM'],
            rows: [
              ['Ports', '445 (direct), 139 (legacy NetBIOS)', '5985 HTTP, 5986 HTTPS'],
              ['Carries', 'Files, named pipes, printers, RPC administration', 'WS-Management / PowerShell remoting'],
              ['Auth', 'NTLM or Kerberos', 'Negotiate (Kerberos or NTLM)'],
              ['Access means', 'Share and pipe access per identity', 'Local administrator by default'],
              ['Key hardening', 'Require signing, remove SMBv1, encrypt sensitive shares', 'HTTPS listener, restrict who may connect, GPO scope']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'ATT&CK classifies admin-share abuse as T1021.002 and WinRM abuse as T1021.006 — the two workhorses of Windows lateral movement. At the credential layer, NTLM\u2019s design is what makes pass-the-hash (T1550.002) possible at a conceptual level: the server never needs the plaintext password, only the proof derived from the hash, so a captured hash can authenticate without the password. Understanding that shape (no exploitation detail needed at this stage) explains why Windows testers obsess over where credentials rest.'
          },
          {
            type: 'list',
            items: [
              'Share enumeration lists what data sits where and which shares leak (guest access, mis-scoped permissions)',
              'Signing status per host tells you where relay-style abuse is plausible — a finding even when you never relaid anything',
              'WinRM open from broad workstation ranges turns any single weak local admin into a fleet problem',
              'Null sessions are mostly dead on modern systems, but old member servers and appliances still answer them, leaking users and shares'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SMBv1 still enabled anywhere (legacy shares, old appliances, image defaults)',
              'Signing supported but not required on member servers and workstations',
              'Shares with Everyone or Authenticated Users write access; guest-accessible shares',
              'Admin shares reachable with reused local admin credentials across many hosts',
              'WinRM 5985 allowed from user VLANs or from the whole internal range',
              'No HTTPS WinRM listener in environments where confidentiality of management traffic matters'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'SMB authentication is noisy',
            text:
              'Every SMB login writes Windows events and can trigger lockouts. Enumeration without credentials is safe on authorized targets; authenticated checks must respect lockout thresholds and be agreed in the rules of engagement.'
          },
          {
            type: 'terminal',
            title: 'Enumerating SMB without credentials',
            lines: [
              '$ smbclient -L //10.10.40.10 -N',
              '',
              '        Sharename       Type      Comment',
              '        ---------       ----      -------',
              '        ADMIN$          Disk      Remote Admin',
              '        backup          Disk      Backup staging',
              '        C$              Disk      Default share',
              '        IPC$            IPC       Remote IPC',
              'SMB1 disabled -- no workgroup available',
              '$ rpcclient -U "" 10.10.40.10',
              'rpcclient $> srvinfo',
              'NT_STATUS_ACCESS_DENIED',
              '$ nxc smb 10.10.40.10',
              'SMB  10.10.40.10  445  FILE01  [*] Windows Server 2019 (name:FILE01) (domain:corp.lab) (signing:False)'
            ]
          },
          {
            type: 'terminal',
            title: 'Checking WinRM on an authorized host',
            lines: [
              '$ nxc winrm 10.10.40.20 -u labadmin -p "LabPass123!"',
              'WINRM  10.10.40.20  5985  APP01  [*] Windows Server 2019 (name:APP01) (domain:corp.lab)',
              'WINRM  10.10.40.20  5985  APP01  [+] CORP\\labadmin:LabPass123! (Pwn3d!)',
              'PS> Get-SmbShare | Select-Object Name, Description',
              'PS> winrm enumerate winrm/config/listener',
              'Listener [Source: GPO]',
              '    Transport = HTTP',
              '    Enabled   = true'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The lab file server FILE01 advertises a "backup" share with authenticated-users write access and responds to nxc with signing:False. Two findings follow: any domain account can plant files in the backup staging path (a path for tampering with what gets restored), and unsigned SMB leaves the host eligible for relay-style abuse from any endpoint that can reach it. The hardened posture requires signing, deletes guest access, and scopes the share to the backup service account.'
          },
          {
            type: 'compare',
            title: 'Windows remote access: weak vs hardened',
            beforeTitle: 'Typical weak posture',
            beforeCode:
              'SMBv1 enabled for an old scanner\nSigning supported, not required\nShare "backup": Authenticated Users = Change\nWinRM 5985 allowed from any internal host\nLocal admin password identical fleet-wide',
            afterTitle: 'Hardened posture',
            afterCode:
              'SMBv1 removed (feature disabled)\nSigning required (server and client policy)\nShare scoped to svc_backup with Change only\nWinRM HTTPS, allowed from management subnet only\nUnique local admin passwords via Windows LAPS'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['smbclient / rpcclient', 'Interactive share listing, pipe and RPC queries, null-session checks'],
              ['netexec (nxc smb / nxc winrm)', 'Fleet-wide sweeps: signing status, share access, credential validation, command execution'],
              ['PowerShell (Get-SmbShare, Get-SmbConnection)', 'Native view of shares and sessions on hosts you control'],
              ['winrm / winrs / Enter-PSSession', 'WinRM client-side verification and remoting tests'],
              ['Wireshark filters smb2 or tcp.port == 445', 'Watch dialect negotiation and signing flags on the wire']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Assuming port 139 closed means SMB is closed — modern Windows speaks 445 directly',
              'Conflating "signing supported" with "signing required"; only the requirement defends against tampering and relay-style abuse',
              'Spraying SMB logins across a domain and locking out hundreds of accounts; one host and one account at a time unless the ROE says otherwise',
              'Testing WinRM with a non-admin account and concluding it is unusable — WinRM legitimately requires privileged membership by default',
              'Forgetting IPC$: pipe-level administration, not share files, is where remote execution techniques live'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'In your lab: create a Samba or Windows share, connect with smbclient -L as a null session and as a real user, and compare results. Run nxc smb against the host and read the signing flag; then enable signing requirement in the server configuration and confirm the flag flips. Finally start the WinRM service on a Windows VM and enumerate the listener with winrm enumerate winrm/config/listener.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'SMB on 445 carries files and administration; IPC$ and named pipes are the execution path',
              'Require signing, remove SMBv1 — the two headline SMB hardenings',
              'WinRM = WS-Management on 5985/5986; access defaults to local admin',
              'NTLM\u2019s hash-based proof is what makes pass-the-hash conceptually possible',
              'Windows auth testing is lockout-sensitive: enumerate broadly, authenticate narrowly'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n10-l03-q1',
          type: 'mcq',
          prompt: 'Which port carries direct SMB traffic on modern Windows systems?',
          options: ['139', '445', '5985', '3389'],
          answerIndex: 1,
          hint: 'NetBIOS transport is the legacy path; direct TCP is the modern one.',
          explanation:
            'Port 445 is direct SMB over TCP. Port 139 is the legacy NetBIOS session transport, 5985 is WinRM HTTP and 3389 is RDP.'
        },
        {
          id: 'n10-l03-q2',
          type: 'truefalse',
          prompt: 'Requiring SMB signing on both endpoints reduces tampering and relay-style abuse risks.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'What does an HMAC per message bind together?',
          explanation:
            'Signing authenticates every message against the session key, so modified or forwarded messages fail validation. Support without requirement leaves the defense unused — the policy that requires it is the actual control.'
        },
        {
          id: 'n10-l03-q3',
          type: 'short',
          prompt: 'What are the C$ and ADMIN$ shares, and who can normally access them?',
          modelAnswer:
            'They are the default administrative shares: C$ maps to the root of the C: drive and ADMIN$ maps to the Windows directory. Access requires local administrator (or equivalent) membership, and they are commonly used by remote-execution tooling to stage binaries and control services.',
          hint: 'One maps to a drive root, the other to the Windows folder.',
          explanation:
            'Admin shares exist by default on Windows hosts and are the storage half of T1021.002 (SMB/Windows Admin Shares): with local admin rights, tools write payloads into ADMIN$ and start services via the svcctl pipe.'
        },
        {
          id: 'n10-l03-q4',
          type: 'scenario',
          prompt:
            'An internal scan shows TCP 5985 open on every workstation, and you have validated that one workstation\u2019s local administrator uses a password reused on 40 machines. Explain what this combination enables and how you would report and fix it.',
          modelAnswer:
            'WinRM maps to local administrator, so the reused local admin password plus open WinRM means one credential compromises 40 hosts interactively via PowerShell remoting — a fleet-wide lateral movement path (T1021.006). Report it as critical path risk with the validated evidence (nxc winrm results on a sample of hosts). Fixes: deploy Windows LAPS for unique per-host local admin passwords, restrict which accounts may use WinRM and from which source ranges, prefer the HTTPS listener (5986) with certificate validation, and monitor remote management logons.',
          hint: 'Think about what "local admin" means across many machines with the same password.',
          explanation:
            'The reuse converts a single-host weakness into a horizontal movement primitive, and WinRM is the cleanest execution channel for it. LAPS-style unique passwords break the reuse; listener scope and TLS reduce the channel.'
        }
      ],
      references: [
        {
          title: 'Microsoft Learn — SMB Protocol and CIFS Protocol Overview',
          url: 'https://learn.microsoft.com/en-us/windows/win32/fileio/microsoft-smb-protocol-and-cifs-protocol-overview',
          note: 'Official description of SMB dialects, signing and authentication flow.'
        },
        {
          title: 'Microsoft Learn — Windows Remote Management (WinRM) portal',
          url: 'https://learn.microsoft.com/en-us/windows/win32/winrm/portal',
          note: 'Official WinRM documentation hub: listeners, ports, authentication.'
        },
        {
          title: 'MITRE ATT&CK T1021.002 — SMB/Windows Admin Shares',
          url: 'https://attack.mitre.org/techniques/T1021/002/',
          note: 'Admin-share lateral movement in the ATT&CK model.'
        },
        {
          title: 'MITRE ATT&CK T1550.002 — Pass the Hash',
          url: 'https://attack.mitre.org/techniques/T1550/002/',
          note: 'Conceptual background on why NTLM hashes can replace passwords.'
        }
      ]
    },
    {
      id: 'n10-l04',
      moduleId: 'n10',
      title: 'Telnet, FTP, NFS and RPC: The Legacy and Infrastructure Roundup',
      difficulty: 'Beginner',
      minutes: 16,
      prerequisites: ['n07-l05'],
      objectives: [
        'Explain why cleartext and trust-based protocols survive on modern networks',
        'Describe the authentication and transport properties of Telnet, FTP, NFS and RPC',
        'Enumerate each service with the classic tooling still used today',
        'Recommend modern replacements and containment for each'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Some protocols refuse to die, and others were never meant to face the internet in the first place. Telnet and FTP are cleartext relics that persist on embedded devices, industrial gear and old business applications. NFS and RPC are not relics at all — they are the load-bearing plumbing of Unix infrastructure, built in an era when networks were assumed friendly and trust flowed from addresses rather than credentials. A pentester needs all four on speed-dial, because internal tests find them constantly and because their risks are structural, not patchable.'
          },
          {
            type: 'p',
            text:
              'The unifying lens for this lesson: who does the protocol authenticate, and what does it leak on the wire or by design? Telnet and FTP authenticate users and then send everything in the clear. NFS authenticates hosts and UID numbers. RPC authenticates, in many deployments, nothing at all — it just advertises where everything else lives.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Telnet (TCP 23)'
          },
          {
            type: 'p',
            text:
              'Defined by RFC 854, Telnet provides a bidirectional byte stream for interactive terminals — with no encryption and no integrity. Usernames, passwords and every command cross the network as readable bytes, so a single passive capture on the path is full account compromise. It survives in routers, switches, printers, PBXes and lab appliances where "it has always worked".'
          },
          {
            type: 'h',
            text: 'FTP (TCP 21 control, 20 data)'
          },
          {
            type: 'p',
            text:
              'RFC 959 splits control (commands like USER and PASS, port 21) from data transfers, using either active mode (server connects back from port 20) or passive mode (client connects to a negotiated high port). Credentials and file contents are cleartext. The anonymous account — user "anonymous", any password — is a classic finding: convenient for software mirrors, disastrous on an HR file drop. FTPS (TLS) and SFTP (SSH) are the modern answers; the plain protocol itself is not fixable.'
          },
          {
            type: 'h',
            text: 'NFS (TCP/UDP 2049) and its RPC plumbing'
          },
          {
            type: 'p',
            text:
              'NFS is networked filesystem access over RPC. In NFSv3 (RFC 1813) the client first asks rpcbind (port 111) where the mountd and nfs services live — which is why rpcinfo -p and showmount -e against port 111 can reveal the entire service map of a host. NFSv4 (RFC 7530) collapses everything to 2049 and adds stronger authentication options. Authorization in classic deployments is host-based: the exports file lists which networks may mount which paths with which options. The critical option is root_squash — by default the server maps a claiming-to-be-root client to the anonymous nobody user; no_root_squash removes that mapping and gives remote root a local root\u2019s power.'
          },
          {
            type: 'h',
            text: 'RPC (portmapper, port 111)'
          },
          {
            type: 'p',
            text:
              'ONC RPC (RFC 5531) is the calling convention beneath NFS and other Unix services: programs register with rpcbind under a program number, clients ask rpcbind for the port. Exposure of port 111 to untrusted networks hands out an inventory of Unix services — information leak first, and in old configurations a route to vulnerable registered services second.'
          },
          {
            type: 'table',
            headers: ['Service', 'Ports', 'Auth model', 'Core risk'],
            rows: [
              ['Telnet', '23', 'Username and password, cleartext', 'Full credential and session disclosure'],
              ['FTP', '21 control, 20/passive data', 'USER/PASS cleartext; anonymous', 'Credential disclosure, anonymous data access'],
              ['NFS', '2049 (+111, mountd in v3)', 'Host-based exports, numeric UIDs', 'Over-broad exports, no_root_squash'],
              ['RPC/rpcbind', '111 (+dynamic)', 'Often none for queries', 'Service inventory disclosure']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'These services are reliable finding generators on internal tests. Cleartext protocols feed the credential-collection story of a report; anonymous FTP yields data exposure findings in minutes; NFS misconfiguration is one of the fastest root-level escalations on Unix estates — mount a no_root_squash export, write a setuid binary or an SSH key into a trusted location, and the host does the rest. The enumeration is entirely read-only, which makes it ideal early-stage activity while you plan louder tests.'
          },
          {
            type: 'list',
            items: [
              'Any Telnet banner is a finding; capture the version line and the context (appliance, printer, switch)',
              'FTP anonymous access turns a scan result into a data exposure finding with one login',
              'showmount -e output is report-ready evidence of over-broad exports',
              'rpcinfo maps the Unix service landscape that nmap version detection may only partially reveal'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Telnet on any management interface, especially on network gear and embedded devices',
              'FTP servers permitting anonymous login on business subnets',
              'NFS exports listing whole networks or "everyone" instead of named hosts',
              'no_root_squash (or insecure plus rw) options on exports, particularly backup and staging paths',
              'rpcbind reachable from user VLANs or across segment boundaries',
              'Active-mode FTP assumptions complicating firewall policy and scans'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Read-only first',
            text:
              'Everything below is unauthenticated or read-only enumeration. Mounting exports, writing files or logging into services crosses into active testing: do it only on lab machines or hosts where the rules of engagement explicitly allow it.'
          },
          {
            type: 'terminal',
            title: 'Enumerating the legacy four',
            lines: [
              '$ nmap -sV -p 21,23,111,2049 10.10.20.30',
              'PORT    STATE SERVICE VERSION',
              '21/tcp  open  ftp     vsftpd 3.0.3',
              '23/tcp  open  telnet?',
              '111/tcp open  rpcbind 2-4 (RPC #100000)',
              '2049/tcp open  nfs_acl 3 (RPC #100227)',
              '$ nmap --script ftp-anon -p 21 10.10.20.30',
              '| ftp-anon: Anonymous FTP login allowed (FTP code 230)',
              '| -rw-r--r--   1 ftp      ftp         4123 Mar 02  2024 staff_list.pdf',
              '$ showmount -e 10.10.20.30',
              'Export list for 10.10.20.30:',
              '/srv/backup (everyone)',
              '$ rpcinfo -p 10.10.20.30',
              '   program vers proto   port',
              '   100000   4   tcp    111  rpcbind',
              '   100005   3   tcp   2049  mountd'
            ]
          },
          {
            type: 'p',
            text:
              'Interpretation: the FTP server allows anonymous login and the listing already shows a sensitive filename; the NFS server exports /srv/backup to everyone (the default host list), and a follow-up mount on an authorized lab client would reveal the export options, where no_root_squash would appear if present.'
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'A lab backup server exports /srv/backup with (rw,no_root_squash) to a /16 that includes every workstation. Impact: any user with local root on any workstation (their own laptop VM, a compromised box) mounts the export as root and reads or replaces backup contents at will. The report pairs the showmount evidence with the fix: scope exports to the backup network only, drop no_root_squash, and migrate clients to NFSv4 with proper authentication.'
          },
          {
            type: 'compare',
            title: 'Replacement and containment recommendations',
            beforeTitle: 'Legacy exposure',
            beforeCode:
              'Telnet enabled on core switch\nvsftpd anonymous allowed on HR host\n/srv/backup (everyone,rw,no_root_squash)\nrpcbind reachable from all VLANs',
            afterTitle: 'Modern posture',
            afterCode:
              'SSH only on the switch (Telnet removed)\nSFTP over SSH, anonymous disabled\n/srv/backup 10.10.99.0/24(ro,root_squash)\nrpcbind firewalled to the storage subnet\nNFSv4.2 with Kerberos where feasible'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['nmap NSE (ftp-anon, nfs-ls, nfs-showmount, nfs-statfs)', 'Automated anonymous-FTP and NFS export discovery'],
              ['showmount / rpcinfo', 'The classic NFS and RPC inventory tools'],
              ['smbclient-equivalents: ftp, telnet, nc', 'Manual banner grabbing and interactive checks'],
              ['mount (nfs)', 'Controlled export verification on authorized lab clients']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Skipping "legacy" ports because the environment looks modern; the oldest services hide on the oldest devices',
              'Assuming internal placement makes cleartext protocols acceptable — one compromised host on the path reads everything',
              'Mounting production NFS exports as root during a test and altering files accidentally; always mount read-only unless explicitly authorized',
              'Reporting every FTP server as anonymous-accessible without actually testing the anonymous login',
              'Forgetting that NFS UID matching means user ID collisions across systems can grant unintended access'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab exercise: on a Linux VM configure an NFS export twice — once with root_squash and once with no_root_squash — and, from a second VM as root, mount each and try to create a file owned by root. Observe the ownership difference. Then set up vsftpd, enable anonymous access, and confirm with nmap --script ftp-anon. Document both findings as if for a client.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Telnet and FTP leak credentials by design; their fix is replacement, not tuning',
              'NFS trust is host- and UID-based; root_squash is the default guard, no_root_squash its removal',
              'rpcbind on 111 advertises the Unix service map — treat its exposure as an information leak',
              'These four services persist through habit and hardware lifecycles; expect them on every internal test',
              'Enumeration is quiet and read-only; exploitation must follow the rules of engagement'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n10-l04-q1',
          type: 'mcq',
          prompt: 'Which of these services transmits authentication credentials in cleartext by design?',
          options: ['Telnet and FTP', 'NFSv4 with Kerberos', 'SSH', 'WinRM over HTTPS'],
          answerIndex: 0,
          hint: 'Two of these predate transport encryption entirely.',
          explanation:
            'Telnet (RFC 854) and FTP (RFC 959) carry usernames and passwords as readable bytes. SSH, Kerberized NFS and HTTPS-transported WinRM encrypt the exchange.'
        },
        {
          id: 'n10-l04-q2',
          type: 'truefalse',
          prompt: 'By default, NFS root_squash maps a remote client claiming UID 0 to an unprivileged local user.',
          options: ['True', 'False'],
          answerIndex: 0,
          hint: 'Squashing is the protective mapping — what does it squash to?',
          explanation:
            'root_squash is the classic default: requests from UID 0 on the client are remapped to the anonymous user (nobody), preventing remote root from acting as local root. The no_root_squash export option removes this protection.'
        },
        {
          id: 'n10-l04-q3',
          type: 'short',
          prompt: 'What does showmount -e reveal about an NFS server, and why is it useful to a tester?',
          modelAnswer:
            'It queries the server\u2019s export list: which directory paths are exported and to which hosts or networks. This shows the server\u2019s intended trust boundaries in one line, immediately highlighting over-broad exports such as "everyone" or whole subnets, and it is gathered unauthenticated.',
          hint: 'The -e stands for exports.',
          explanation:
            'The export list is the server\u2019s own statement of who may mount what. Over-broad entries are direct evidence for segmentation and access-control findings.'
        },
        {
          id: 'n10-l04-q4',
          type: 'scenario',
          prompt:
            'On an authorized internal test you find /srv/backup exported with (rw,no_root_squash) to a supernet that includes workstations. Explain the impact, how you would validate it safely, and the remediation.',
          modelAnswer:
            'Impact: any principal with root on any machine inside the exported range (compromised workstations included) can mount the backup path as UID 0 and read or modify backup contents — effectively root-level data access to the backup estate and a tampering path against restore data. Safe validation: read-only mount on an authorized lab client to confirm options and access, keeping writes off; capture showmount -e output as evidence. Remediation: scope the export to the dedicated backup network only, remove no_root_squash (keep root_squash), make it read-only where possible, firewall rpcbind/2049 to the storage segment, and consider NFSv4 with Kerberos authentication.',
          hint: 'Who realistically has UID 0 inside the exported range?',
          explanation:
            'The combination of broad host scoping, read-write mode and no_root_squash collapses the trust model: host-level compromise anywhere in range becomes root-level access to the export. Narrow scoping plus squash restores defense in depth.'
        }
      ],
      references: [
        {
          title: 'RFC 959 — File Transfer Protocol (FTP)',
          url: 'https://datatracker.ietf.org/doc/html/rfc959',
          note: 'The FTP specification: control/data split, USER/PASS, active and passive modes.'
        },
        {
          title: 'RFC 1813 — NFS Version 3 Protocol Specification',
          url: 'https://datatracker.ietf.org/doc/html/rfc1813',
          note: 'NFSv3 over RPC: mounts, exports behavior and the UID model.'
        },
        {
          title: 'Linux man-pages — exports(5)',
          url: 'https://man7.org/linux/man-pages/man5/exports.5.html',
          note: 'Official reference for /etc/exports options including root_squash.'
        },
        {
          title: 'RFC 5531 — RPC: Remote Procedure Call Protocol Specification Version 2',
          url: 'https://datatracker.ietf.org/doc/html/rfc5531',
          note: 'The ONC RPC model that rpcbind and NFS are built on.'
        }
      ]
    }
  ]
};
