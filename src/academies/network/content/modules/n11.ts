import type { Module } from '../../../../types';

// LEVEL 6 — ATTACKS & REMOTE SERVICES · Module 11: Windows and Linux Network Services
// Original curriculum content synthesized from public official documentation:
// OpenSSH manuals, Samba documentation, Linux man-pages, IETF RFCs, Microsoft
// Learn and MITRE ATT&CK. All prose is original; reference links point to the
// official sources used for study. All techniques are taught for AUTHORIZED
// testing on lab or in-scope targets.

export const n11: Module = {
  id: 'n11',
  title: 'Windows and Linux Network Services',
  level: 6,
  description:
    'A guided tour of the service landscape you will meet on real Linux servers and inside Windows domain environments: the daemons and their config files, the native enumeration tools of both ecosystems, the misconfigurations enterprises actually ship, and the domain concepts — LDAP, DNS SRV records, SYSVOL — that an internal test quietly depends on.',
  outcomes: [
    'Map the typical service landscape of Linux servers and Windows domain environments',
    'Enumerate platform services with the native tooling of each ecosystem',
    'Recognize the common misconfigurations of Linux and Windows services in enterprises',
    'Read Windows domain structures: domains, domain controllers, LDAP, SRV records and SYSVOL',
    'Prepare the enumeration groundwork an internal network test depends on'
  ],
  lessons: [
    {
      id: 'n11-l01',
      moduleId: 'n11',
      title: 'Linux Network Services: SSH, NFS, Samba, FTP and DNS',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n10-l01'],
      objectives: [
        'List the standard network daemons found on Linux servers and where each is configured',
        'Read the key security directives of sshd_config, /etc/exports, smb.conf and vsftpd.conf',
        'Enumerate each daemon with native commands on hosts you control',
        'Recognize the classic Linux service misconfigurations and their fixes'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'A Linux server is a small pile of daemons, each with one text file that defines its behavior. That file is the whole security model in miniature: sshd reads /etc/ssh/sshd_config, the NFS kernel server reads /etc/exports, Samba reads /etc/samba/smb.conf, vsftpd reads vsftpd.conf, BIND reads /etc/bind/named.conf and its includes. Once you know these five files you can walk onto any Linux estate and turn enumeration into hypothesis testing: not "what might be wrong" but "what does line 12 of this file allow".'
          },
          {
            type: 'p',
            text:
              'This lesson treats the five files as one subject. The pattern repeats: a path or a share, a host or network to which it is exposed, and an option that widens or narrows the grant. Nearly every Linux service misconfiguration in the wild is one directive set to a convenience value.'
          }
        ],
        technical: [
          {
            type: 'p',
            text:
              'First, know what is listening. systemd starts daemons as units; ss -tlnp (or netstat on old boxes) shows which processes hold which TCP ports, and ss -ulnp the UDP side. Service roles usually announce themselves here: sshd on 22, nfsd on 2049, smbd on 445, named on 53, vsftpd on 21. On an authorized host this one command is the table of contents for everything that follows.'
          },
          {
            type: 'h',
            text: 'The five files'
          },
          {
            type: 'table',
            headers: ['Daemon', 'Config', 'Directives that matter', 'Native checks'],
            rows: [
              ['sshd', '/etc/ssh/sshd_config', 'PermitRootLogin, PasswordAuthentication, AllowUsers, AllowTcpForwarding', 'sshd -T, ssh -v'],
              ['NFS server', '/etc/exports', 'host scope, rw/ro, root_squash/no_root_squash, insecure', 'exportfs -v, showmount -e'],
              ['Samba', '/etc/samba/smb.conf', 'guest ok, writable, valid users, browseable, hosts allow', 'testparm -s, smbclient -L'],
              ['vsftpd', '/etc/vsftpd.conf', 'anonymous_enable, local_enable, chroot_local_user', 'grep the conf, test login'],
              ['BIND', '/etc/bind/named.conf*', 'allow-query, allow-recursion, allow-transfer', 'dig @host axfr, dig +short']
            ]
          },
          {
            type: 'p',
            text:
              'NFS exports syntax is compact: each line is a path, whitespace, then a client specification with parenthesized options — /srv/share 10.10.40.0/24(rw,sync). The client spec is the trust boundary; "everyone" (or a bare wildcard) is the classic mistake, and no_root_squash is the classic amplifier covered in module 10. Samba shares live in bracketed sections: a [backup] section with guest ok = yes and writable = yes is a world-writable network directory the moment a firewall does not stop it. valid users is the line that should be there and often is not.'
          },
          {
            type: 'p',
            text:
              'BIND deserves one precise security note: recursion. A resolver that answers recursive queries for the whole network is an open resolver — a DNS amplification liability and an information leak about internal zones. allow-recursion should name your own subnets, and allow-transfer (zone transfers, AXFR) should name only secondary servers, because a successful AXFR hands out the entire zone file: every host name and address in the domain.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Internal tests are usually time-boxed, and Linux hosts are where enumeration pays for itself fastest because config reading is cheap and conclusive. A grep of /etc/exports or a testparm dump converts "possible misconfiguration" into a proven finding with a one-line fix. The same files give you the defensive view: hardening is editing five text files, and your report can quote the exact directive to change.'
          },
          {
            type: 'list',
            items: [
              'Exports with broad host lists or no_root_squash — high-impact, instantly verifiable',
              'Samba shares with guest ok = yes or missing valid users on business subnets',
              'Open recursion and unconstrained zone transfers on internal resolvers',
              'sshd permit lists that include service accounts with valid shells',
              'FTP daemons on management hosts where SFTP over the existing sshd would do'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              '/etc/exports lines targeting "everyone", large supernets, or carrying no_root_squash and insecure',
              'smb.conf share sections with guest ok = yes, writable = yes and no valid users',
              'named.conf options without allow-recursion, or allow-transfer {"any";}',
              'vsftpd.conf with anonymous_enable YES on anything other than a mirror',
              'sshd_config PermitRootLogin yes plus PasswordAuthentication yes (module 10 recap)',
              'Daemons running as root that could run as dedicated users or in containers'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Own the box first',
            text:
              'The commands below read configuration and listeners on hosts you administer or are explicitly authorized to assess. Remote variants (showmount, dig AXFR, smbclient) are read-only but still active probing — keep them inside your scope.'
          },
          {
            type: 'terminal',
            title: 'A five-minute service audit on an authorized Linux host',
            lines: [
              '$ ss -tlnp',
              'State  Local Address:Port  Process',
              'LISTEN 0.0.0.0:22              sshd: /usr/sbin/sshd',
              'LISTEN 0.0.0.0:445             smbd',
              'LISTEN 0.0.0.0:2049            -  (nfsd)',
              '$ cat /etc/exports',
              '/srv/share  10.10.40.0/24(rw,sync,no_root_squash)',
              '$ exportfs -v',
              '/srv/share  10.10.40.0/24(sync,wdelay,hide,no_subtree_check,sec=sys,rw,no_root_squash)',
              '$ testparm -s 2>/dev/null | tail -n 8',
              '[backup]',
              '    browseable = yes',
              '    guest ok = yes',
              '    writable = yes',
              '    path = /srv/backup'
            ]
          },
          {
            type: 'terminal',
            title: 'Remote read-only checks against an authorized target',
            lines: [
              '$ showmount -e 10.10.40.12',
              'Export list for 10.10.40.12:',
              '/srv/share 10.10.40.0/24',
              '$ smbclient -L //10.10.40.12 -U labuser%LabPass123!',
              '        Sharename       Type      Comment',
              '        ---------       ----      -------',
              '        backup          Disk',
              '        IPC$            IPC       IPC Service',
              '$ dig @10.10.40.12 lab.lab AXFR +short',
              '; transfer failed: connection refused   # good: transfer restricted'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The lab host FILE-LIN (10.10.40.12) listens on 445 and 2049. Its exports file grants /srv/share read-write to the whole server VLAN with no_root_squash, and its only Samba share accepts guests with write access. Two findings, one root cause: convenience options standing in for a trust model. The report names the directives (no_root_squash, guest ok), the exposure (VLAN-wide), and the fix (named hosts plus root_squash; valid users plus guest ok = no).'
          },
          {
            type: 'compare',
            title: 'The same server, hardened in five lines',
            beforeTitle: 'Convenience posture',
            beforeCode:
              '/srv/share  10.10.40.0/24(rw,sync,no_root_squash)\n[backup]\n    guest ok = yes\n    writable = yes\n# no valid users, no hosts allow',
            afterTitle: 'Hardened posture',
            afterCode:
              '/srv/share  10.10.40.10(rw,sync,root_squash)\n/srv/share  10.10.40.11(ro,sync,root_squash)\n[backup]\n    guest ok = no\n    valid users = @backupops\n    hosts allow = 10.10.40.'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ss -tlnp / systemctl', 'Listener and unit inventory — the table of contents'],
              ['exportfs -v / showmount', 'Effective exports locally and remotely'],
              ['testparm / smbclient', 'Samba configuration truth and share access testing'],
              ['dig', 'Recursion, zone transfer and record checks'],
              ['sshd -T', 'Effective SSH policy after includes and Match blocks']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Auditing only the running listeners and forgetting socket-activated services that appear on demand',
              'Reading /etc/exports and assuming it is live — exportfs -v shows what the kernel actually enforces',
              'Confusing Samba guest ok with anonymous Unix permissions; Samba maps guests to its own guest account',
              'Testing DNS zone transfer against a resolver instead of the authoritative server for the zone',
              'Reporting config files without checking includes and drop-in directories that override them'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab build: on one VM enable NFS, Samba and BIND. Create an export with no_root_squash, a guest-writable Samba share, and a zone with allow-transfer set to any. From a second VM verify each with showmount, smbclient and dig AXFR. Then harden all three and re-run the checks to see every command fail. Keep the before/after outputs — they are a miniature pentest report.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Linux service security lives in five text files: sshd_config, exports, smb.conf, vsftpd.conf, named.conf',
              'ss -tlnp first, config files second — inventory before hypotheses',
              'Exports and shares define trust by host lists and user lists; broad defaults are the standard finding',
              'Open recursion and open zone transfers are resolver misconfigurations with attacker value',
              'Effective configuration (exportfs -v, sshd -T, testparm) beats reading files by eye'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n11-l01-q1',
          type: 'mcq',
          prompt: 'Which /etc/exports option removes the default protection that maps client root to an unprivileged user?',
          options: ['no_root_squash', 'insecure', 'async', 'subtree_check'],
          answerIndex: 0,
          hint: 'Squashing is the protection; which option unsquashes it?',
          explanation:
            'root_squash (the default) remaps UID 0 clients to nobody. no_root_squash removes that mapping, giving remote root full local root power over the export — a high-severity finding when combined with broad host lists.'
        },
        {
          id: 'n11-l01-q2',
          type: 'truefalse',
          prompt: 'A BIND resolver should allow recursive queries from any source on the internet.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Think about what an open resolver can be used for by third parties.',
          explanation:
            'Recursion should be restricted to the networks the server serves (allow-recursion). Open resolvers are abused for DNS amplification attacks and leak internal zone knowledge; allow-transfer should similarly be limited to secondaries.'
        },
        {
          id: 'n11-l01-q3',
          type: 'short',
          prompt: 'What does testparm do, and why prefer it over reading smb.conf directly?',
          modelAnswer:
            'testparm parses /etc/samba/smb.conf, reports syntax errors and prints the effective configuration after defaults and includes are applied. It shows what Samba will actually do (including default values not written in the file), which is exactly what an auditor or tester needs.',
          hint: 'It validates — and then reveals — something.',
          explanation:
            'Effective configuration beats intention: testparm exposes defaults and includes that raw reading misses, the same way sshd -T does for SSH and exportfs -v does for NFS.'
        },
        {
          id: 'n11-l01-q4',
          type: 'scenario',
          prompt:
            'You are authorized to assess a Linux file server. ss shows 445 and 2049 open. Describe your enumeration order and the two most valuable misconfigurations to check for on each service.',
          modelAnswer:
            'Order: listeners and process identities first (ss -tlnp, systemctl), then configuration truth, then remote read-only verification. NFS: check exportfs -v or showmount -e for broad host lists and no_root_squash/insecure options; confirm remotely with showmount. Samba: run testparm -s and look for guest ok = yes, writable shares without valid users, and missing hosts allow; verify share access with smbclient -L and, if authorized, a guest login attempt. Each finding is quoted with the offending directive and a one-line fix.',
          hint: 'Inventory, then effective config, then remote verification.',
          explanation:
            'The lesson\u2019s method is a funnel: cheap local facts narrow the space, effective-configuration commands prove behavior, and remote read-only checks demonstrate impact without noise. The two headline misconfigs per service are the classic convenience options.'
        }
      ],
      references: [
        {
          title: 'Samba — smb.conf manual page',
          url: 'https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html',
          note: 'Official reference for every smb.conf directive including guest ok and valid users.'
        },
        {
          title: 'Linux man-pages — exports(5)',
          url: 'https://man7.org/linux/man-pages/man5/exports.5.html',
          note: 'Official /etc/exports syntax and option reference.'
        },
        {
          title: 'OpenSSH — sshd_config manual page',
          url: 'https://man.openbsd.org/sshd_config',
          note: 'Server directive reference used in the SSH row of this lesson.'
        }
      ]
    },
    {
      id: 'n11-l02',
      moduleId: 'n11',
      title: 'Linux Web and Database Stacks: Apache, Nginx and Databases',
      difficulty: 'Intermediate',
      minutes: 17,
      prerequisites: ['n11-l01'],
      objectives: [
        'Describe the web serving model of Apache and Nginx: hosts, modules and status endpoints',
        'Compare the network posture and configuration knobs of MySQL, PostgreSQL, MSSQL and Redis',
        'Enumerate web and database services for exposure and weak authentication',
        'Recognize the binding and credential mistakes that make stacks reachable when they should not be'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'The web and database stack is the exposed face of most Linux servers, and its two security axes are exposure and identity. Exposure: which interface and port does each service bind, and which firewall rules allow it. Identity: which credentials does each service accept, and how strong are the defaults. The recurring real-world failure is the same on both axes — a developer needed remote access once, so the service binds 0.0.0.0 and the password is short or absent.'
          },
          {
            type: 'p',
            text:
              'For a pentester this lesson is a checklist of the four questions to ask of every stack component: what is it, what does it bind, who can authenticate, and what does it leak about itself (status pages, banners, error output).'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'Apache and Nginx'
          },
          {
            type: 'p',
            text:
              'Apache serves through VirtualHost blocks (one per name or port) configured in conf-enabled or vhost files; its module system (mod_status, mod_proxy, mod_rewrite among hundreds) defines both features and attack surface. Nginx organizes the same idea as server blocks, with include files under conf.d and sites-enabled. Both leak by default in small ways: Apache\u2019s ServerTokens and Nginx\u2019s server_tokens announce version numbers in headers and error pages. Both offer status endpoints — Apache\u2019s /server-status (mod_status) and Nginx\u2019s stub_status — which are gold for defenders and, when exposed without access control, a gift to attackers: request rates, client IPs, worker states.'
          },
          {
            type: 'h',
            text: 'The databases'
          },
          {
            type: 'table',
            headers: ['Database', 'Default port', 'Binding knob', 'Auth knobs', 'Typical mistake'],
            rows: [
              ['MySQL/MariaDB', '3306', 'bind-address, skip-networking', 'root accounts, host-scoped users', 'bind 0.0.0.0 with root@% and a weak password'],
              ['PostgreSQL', '5432', 'listen_addresses', 'pg_hba.conf methods', 'listen_addresses = "*" with a trust or md5 all-hosts line'],
              ['MSSQL (on Linux)', '1433', 'network settings', 'sa account, mixed mode', 'sa enabled with a weak password'],
              ['Redis', '6379', 'bind, protected-mode', 'requirepass, ACLs', 'no requirepass, protected-mode no, bind 0.0.0.0']
            ]
          },
          {
            type: 'p',
            text:
              'PostgreSQL\u2019s pg_hba.conf is the clearest auth model of the four: one line per client range, database, user and method — trust (no password), md5/scram (password), or external methods. A trust line for a wide range is the Postgres equivalent of an unlocked door. Redis is the sharpest edge: designed for trusted networks, an unauthenticated Redis reachable from a hostile network is both a data leak (keys, sessions, caches) and, historically, a code-execution vector when operators allowed the server to write files — which is why protected-mode and requirepass exist and why their absence is a headline finding.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Database exposure findings write themselves: a listener on 0.0.0.0:6379 reachable from your test segment, plus redis-cli ping returning PONG without credentials, is a complete evidence chain in three commands. Web-side, status pages and verbose banners turn passive observation into an inventory of the application infrastructure — worker counts, upstream names, versions — that sets up both web application testing and infrastructure findings.'
          },
          {
            type: 'list',
            items: [
              'redis-cli ping answering PONG from a remote host: unauthenticated data store, check keys with care (read-only)',
              'mysql with an empty-password root or a root@% account: immediate data exposure on authorized tests',
              'pg_hba trust lines for broad ranges: password-free database access across segments',
              '/server-status or stub_status reachable without restriction: infrastructure disclosure',
              'Version banners (Server, X-Powered-By) that anchor the vulnerability assessment in module 08'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'Listeners bound to 0.0.0.0 or :: on ports 3306, 5432, 1433, 6379 without a matching business need',
              'Redis without requirepass or with protected-mode no',
              'pg_hba.conf entries with method trust or host all all wide-range lines',
              'MySQL accounts created with @% host wildcards, especially root@%',
              'mod_status and stub_status enabled without Allow/Deny or listen restrictions',
              'ServerTokens Full / server_tokens on, plus directory listings (Options Indexes, autoindex on)'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Data you may see',
            text:
              'Database exposure testing can reveal real user data. On authorized tests, enumerate authentication and server metadata only; do not browse or extract records unless the rules of engagement explicitly allow it, and never write to the database during validation.'
          },
          {
            type: 'terminal',
            title: 'Stack exposure checks on authorized targets',
            lines: [
              '$ ss -tlnp | grep -E ":3306|:5432|:6379|:1433"',
              'LISTEN 0.0.0.0:6379   redis-server *:6379',
              '$ redis-cli -h 10.10.40.25 ping',
              'PONG',
              '$ nmap -p 3306 --script mysql-empty-password 10.10.40.25',
              '| mysql-empty-password:',
              '|   root account has empty password',
              '$ curl -s http://10.10.40.25/server-status | head -n 6',
              '<title>Apache Status</title>',
              '<dt>Server uptime: 6 days 4 hours</dt>'
            ]
          },
          {
            type: 'terminal',
            title: 'Confirming database identity settings (hosts you control)',
            lines: [
              '$ grep -E "^bind" /etc/redis/redis.conf',
              'bind 0.0.0.0',
              '$ grep -E "^(requirepass|protected-mode)" /etc/redis/redis.conf',
              '# requirepass foobared     <- commented out: no password',
              'protected-mode no',
              '$ grep -vE "^#|^$" /etc/postgresql/15/main/pg_hba.conf',
              'host  all  all  0.0.0.0/0  trust'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'Lab host APP-LIN runs the company demo stack. Redis answers PONG remotely with no requirepass and protected-mode off; MySQL accepts root with an empty password from any host; Apache publishes /server-status to everyone. A report would grade the pair of unauthenticated database exposures as critical (direct data access plus a historical code-execution pattern on Redis), and the status page as medium (infrastructure disclosure). Every fix is one line: requirepass plus protected-mode yes, a scoped root account, and an access-controlled status location.'
          },
          {
            type: 'compare',
            title: 'Redis exposure: weak vs hardened',
            beforeTitle: 'Developer convenience',
            beforeCode:
              'bind 0.0.0.0\nprotected-mode no\n# requirepass commented out',
            afterTitle: 'Hardened',
            afterCode:
              'bind 127.0.0.1 10.10.40.25\nprotected-mode yes\nrequirepass <strong-generated>\n# or bind to app subnet + firewall 6379 to APP01 only\n# ACLs for named users (Redis 6+)'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['ss / netstat', 'Binding truth: what listens on which interface'],
              ['redis-cli, mysql, psql', 'Client-side auth and metadata checks (read-only discipline)'],
              ['nmap NSE (mysql-empty-password, mysql-info, redis-info)', 'Automated exposure and version checks'],
              ['curl', 'Status pages, headers, directory listing confirmation'],
              ['grep over config files', 'Effective settings on hosts you administer']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Testing database exposure by dumping data on production — authentication status and version metadata prove the finding without touching records',
              'Assuming a service is bound safely because the port is firewalled; binding and firewalling are independent controls, both of which belong in the report',
              'Confusing MariaDB and MySQL version behavior; account host wildcards differ by version',
              'Ignoring the web tier while hunting databases — status pages and headers often disclose the database host names directly',
              'Treating protected-mode as sufficient; it blocks only unauthenticated external clients on some bind configurations, and requirepass or ACLs are still required'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: install Redis and PostgreSQL on one VM. First configure Redis for localhost-only with protected-mode yes and confirm redis-cli works locally but not remotely. Then deliberately set bind 0.0.0.0 with no password and repeat the remote check from another VM. For PostgreSQL, write three pg_hba.conf lines (trust for localhost, scram for the app subnet, reject for everything else) and test each with psql. Record which configuration state each command output proves.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Exposure (binding + firewall) and identity (accounts + auth method) are the two axes of every stack finding',
              'Redis is designed for trusted networks — never expose it without requirepass and protected-mode',
              'pg_hba.conf is PostgreSQL\u2019s per-range auth table; trust lines are open doors',
              'Status pages and banners are free infrastructure reconnaissance when left open',
              'Prove exposure with auth checks and metadata; do not browse production data'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n11-l02-q1',
          type: 'mcq',
          prompt: 'In pg_hba.conf, what does the trust authentication method do?',
          options: [
            'Allows the listed clients to connect without any password',
            'Encrypts the connection with TLS',
            'Requires Kerberos authentication',
            'Maps all users to the postgres superuser'
          ],
          answerIndex: 0,
          hint: 'The name is ironic — it simply believes the client.',
          explanation:
            'trust accepts matching connections with no password at all. It is reasonable for local Unix-socket access on a secured host; a trust line for a broad network range is an open database door.'
        },
        {
          id: 'n11-l02-q2',
          type: 'truefalse',
          prompt: 'A Redis server with protected-mode yes still accepts unauthenticated remote commands if it is bound to 0.0.0.0 and requirepass is unset.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Protected-mode exists precisely for the no-password remote case.',
          explanation:
            'Protected-mode blocks external unauthenticated clients when no password is configured. The dangerous combination is protected-mode no (or a bind that defeats the guard) plus missing requirepass — which is why both settings appear in audits.'
        },
        {
          id: 'n11-l02-q3',
          type: 'short',
          prompt: 'Name two things an unauthenticated Apache /server-status page leaks, and why that matters to a pentester.',
          modelAnswer:
            'It leaks runtime infrastructure detail: current request URLs (including query strings and sometimes session identifiers), client IP addresses, virtual host names, worker/thread states and uptime. This maps the application\u2019s endpoints and its users\u2019 activity for an attacker and supports the reconnaissance phase of web testing.',
          hint: 'Think live request and worker data.',
          explanation:
            'Status endpoints are designed for operators. Without access control they hand out an inventory of hosts, endpoints and traffic patterns — an information disclosure finding that feeds later web and infrastructure attacks.'
        },
        {
          id: 'n11-l02-q4',
          type: 'scenario',
          prompt:
            'During an authorized internal test you find 0.0.0.0:6379 on an application server and redis-cli -h <host> ping returns PONG. Lay out the finding, the safe evidence you collect, and the remediation.',
          modelAnswer:
            'Finding: an unauthenticated Redis data store reachable from the test segment — exposure (bound to all interfaces, reachable cross-segment) plus missing authentication (no requirepass). Safe evidence: ping/INFO server metadata, listener output (ss), and connectivity proof; avoid reading or writing keys that may contain user data, and never use write-based techniques. Remediation: set requirepass (or ACLs), protected-mode yes, bind to the application subnet or localhost, restrict 6379 with firewall rules to the application tier, and monitor for exposure regressions.',
          hint: 'Prove the door is open without walking through the house.',
          explanation:
            'The exposure is fully provable with unauthenticated metadata commands; touching data adds legal and ethical risk without strengthening the finding. The fix set pairs binding, authentication and firewall scope.'
        }
      ],
      references: [
        {
          title: 'Apache HTTP Server 2.4 Documentation',
          url: 'https://httpd.apache.org/docs/2.4/',
          note: 'Official docs for VirtualHosts, modules and mod_status.'
        },
        {
          title: 'nginx Documentation',
          url: 'https://nginx.org/en/docs/',
          note: 'Official docs for server blocks, server_tokens and stub_status.'
        },
        {
          title: 'MySQL 8.0 Reference Manual',
          url: 'https://dev.mysql.com/doc/refman/8.0/en/',
          note: 'Official account management and binding references.'
        },
        {
          title: 'PostgreSQL — The pg_hba.conf File',
          url: 'https://www.postgresql.org/docs/current/auth-pg-hba-conf.html',
          note: 'Official client authentication table: methods and range matching.'
        }
      ]
    },
    {
      id: 'n11-l03',
      moduleId: 'n11',
      title: 'Windows Services in the Enterprise: SMB, RPC, RDP and WinRM',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n10-l03'],
      objectives: [
        'Explain how domain membership changes the behavior of Windows network services',
        'Describe admin shares, RPC endpoint mapping and per-profile firewalls from a workstation perspective',
        'Enumerate an enterprise Windows estate with domain and local credentials',
        'Recognize the enterprise-scale misconfigurations that single-host testing misses'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'Module 10 taught SMB and WinRM as services on a host. In an enterprise those same services behave differently, because the host is a domain member: identity comes from Active Directory, configuration comes from Group Policy, and a firewall profile follows the network it thinks it is on. The single most important consequence for a pentester: with any valid domain account — not a local admin, just a user — you can enumerate far more of the estate than an outsider could, and the estate will happily tell you about itself.'
          },
          {
            type: 'p',
            text:
              'The second enterprise truth is scale. A misconfiguration on one host is an incident; the same misconfiguration deployed by GPO to 400 hosts is a design flaw. Local administrator password reuse is the canonical example — invisible per host, catastrophic in aggregate, and detectable in minutes with the right tooling.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'What domain membership changes'
          },
          {
            type: 'p',
            text:
              'Every domain-joined machine has a computer account (HOSTNAME$) and authenticates to the domain on boot. SMB connections authenticate with Kerberos against the domain when possible, falling back to NTLM. Group Policy pushes service configuration fleet-wide: WinRM listeners, RDP enablement, firewall rules, share permissions. Windows Firewall runs per network profile — domain, private, public — and the domain profile is usually the permissive one, because the domain is assumed trusted.'
          },
          {
            type: 'h',
            text: 'Admin shares and RPC on member machines'
          },
          {
            type: 'p',
            text:
              'The default shares exist on every Windows machine: C$ (drive root), ADMIN$ (the Windows directory), IPC$ (named pipes). Access requires local administrator or equivalent — which is precisely why local admin is the currency of Windows lateral movement (T1021.002): with it, tools stage binaries in ADMIN$ and start services through the svcctl pipe over IPC$. RPC generalizes this: the endpoint mapper on TCP 135 hands out dynamic ports (49152-65535 on modern Windows) for services like the service control manager and the registry, all reachable with admin credentials.'
          },
          {
            type: 'h',
            text: 'Enumeration from a workstation seat'
          },
          {
            type: 'table',
            headers: ['Access level', 'What you can enumerate', 'Typical tooling'],
            rows: [
              ['Any domain user', 'Shares on servers, AD objects, session and domain info via RPC, DNS, SYSVOL contents', 'smbclient, rpcclient, nxc, ldap tools'],
              ['Local admin on a host', 'Everything above plus that host: admin shares, scheduled tasks, services, SAM, registry', 'nxc with --local-auth, PowerShell'],
              ['Domain credentials + local admin fleet-wide', 'Lateral movement surface: WinRM/RDP/SMB on every reachable host', 'nxc smb/winrm/rdp sweeps']
            ]
          },
          {
            type: 'p',
            text:
              'netexec is the current workhorse for the sweep pattern: give it a subnet and credentials and it returns host names, domains, signing status and whether the credentials grant admin (Pwn3d!) — a complete map of where your identity has power.'
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Enterprise Windows testing is identity-first: validate a domain account, sweep the estate to see where it works, and let the results draw the map. The findings that matter are aggregates — reused local admin passwords, WinRM allowed from everywhere, RDP reachable across VLANs — and each one is both an ATT&CK technique (T1021 family) and a reportable design flaw with a GPO-level fix.'
          },
          {
            type: 'list',
            items: [
              'Local admin reuse: one credential, many hosts — validate with --local-auth sweeps on a sample',
              'WinRM on workstations: convenient for admins, a fleet-wide execution channel when combined with reuse',
              'RDP reachable from user VLANs to server VLANs: segmentation finding as well as a remote-access one',
              'Domain-profile firewall permissiveness: the quiet reason internal movement is easy once inside'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'The same local administrator account and password validating on many machines (--local-auth sweeps)',
              'WinRM 5985 enabled on workstations by GPO with no source restriction',
              'RDP with NLA enabled but permitted from broad internal ranges',
              'Shares with Authenticated Users write access on file servers used by many departments',
              'Firewall domain profile allowing SMB/WinRM/RPC from any internal subnet',
              'Service accounts running as members of local Administrators on many machines'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Sweeps hit every host they touch',
            text:
              'A subnet sweep authenticates against every machine that answers. Confirm scope, lockout policy and monitoring expectations with the client before sweeping, keep attempts to one account and one credential, and log every command for the report.'
          },
          {
            type: 'terminal',
            title: 'Enterprise enumeration with a domain account (authorized lab)',
            lines: [
              '$ nxc smb 10.10.30.0/24 -u jdoe -p "Winter2024!"',
              'SMB  10.10.30.12  445  FIN-WKS01  [*] Windows 10 (name:FIN-WKS01) (domain:corp.lab) (signing:False)',
              'SMB  10.10.30.12  445  FIN-WKS01  [+] CORP\\jdoe:Winter2024!',
              'SMB  10.10.30.15  445  FIN-WKS02  [+] CORP\\jdoe:Winter2024!',
              '$ nxc smb 10.10.30.0/24 -u local_admin -p "Chang3Me!" --local-auth',
              'SMB  10.10.30.12  445  FIN-WKS01  [+] FIN-WKS01\\local_admin:Chang3Me! (Pwn3d!)',
              'SMB  10.10.30.15  445  FIN-WKS02  [+] FIN-WKS02\\local_admin:Chang3Me! (Pwn3d!)',
              'SMB  10.10.30.21  445  FIN-WKS03  [+] FIN-WKS03\\local_admin:Chang3Me! (Pwn3d!)'
            ]
          },
          {
            type: 'terminal',
            title: 'Native checks on an authorized Windows host',
            lines: [
              '$ net share',
              'Share name   Resource                   Remark',
              '------------------------------------------------',
              'C$           C:\\                        Default share',
              'ADMIN$       C:\\Windows                 Remote Admin',
              'IPC$                                      Remote IPC',
              '$ Get-SmbShare | Select Name, Description',
              '$ nxc winrm 10.10.30.15 -u local_admin -p "Chang3Me!" --local-auth',
              'WINRM  10.10.30.15  5985  FIN-WKS02  [+] FIN-WKS02\\local_admin:Chang3Me! (Pwn3d!)'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The lab domain CORP has 40 workstations. A --local-auth sweep validates the same local_admin password on 37 of them, and WinRM answers on all 40 because a GPO enables it for helpdesk convenience. Combined finding: any compromise of one workstation\u2019s local admin becomes interactive execution on nearly the whole fleet. Remediation is design-level: Windows LAPS for unique local admin passwords, GPO scoping of WinRM to the helpdesk subnet, and monitoring for remote management logons.'
          },
          {
            type: 'compare',
            title: 'Fleet configuration: reuse vs managed',
            beforeTitle: 'One password everywhere',
            beforeCode:
              'local_admin: same password on 40 hosts\nWinRM 5985 allowed from any internal source\nFirewall domain profile: SMB/WinRM any-to-any',
            afterTitle: 'Managed fleet',
            afterCode:
              'Windows LAPS: unique rotating local admin per host\nWinRM restricted to helpdesk subnet, HTTPS listener\nFirewall: SMB/WinRM only where a documented service needs it'
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['netexec (nxc smb/winrm/rdp)', 'Fleet sweeps: identity, signing, Pwn3d! status per host'],
              ['net share / Get-SmbShare', 'Native share inventory on authorized hosts'],
              ['rpcclient', 'RPC-level queries for sessions, users and domain info'],
              ['Windows Event Logs (4624/4625)', 'Defender view of the sweeps you run and the attacks you simulate'],
              ['Windows LAPS', 'The remediation platform for local admin reuse']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Sweeping with a domain account when the question is about local accounts — --local-auth changes the authentication target per host',
              'Treating a Pwn3d! result as an exploit; it is a credential validation, and the report should say so precisely',
              'Sweeping the whole estate on day one; sample a subnet first, understand lockout policy, then scale with client awareness',
              'Ignoring the workstation tier because "servers matter" — fleet-wide reuse lives on workstations',
              'Forgetting that firewalls differ per profile: a host may answer SMB on VPN and refuse it on the guest network'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: build two Windows VMs, join or simulate a workgroup, set the same local administrator password on both, enable WinRM on both. From a third machine run nxc smb against both IPs with --local-auth and confirm Pwn3d! on each. Then change one host\u2019s password (your LAPS stand-in) and re-run to see the finding disappear. Note exactly which outputs constitute your evidence.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'Domain membership moves identity and configuration into AD and GPO — test the design, not just the host',
              'Admin shares (C$/ADMIN$) plus the svcctl pipe are the mechanics of Windows lateral movement',
              'Any valid domain account unlocks broad read-only enumeration of the estate',
              'Local admin password reuse is the highest-value aggregate finding on workstation fleets',
              'nxc sweeps convert credentials into a power map — run them scoped and logged'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n11-l03-q1',
          type: 'mcq',
          prompt: 'Which default share maps to the Windows directory and is used to stage binaries for remote execution?',
          options: ['C$', 'ADMIN$', 'IPC$', 'NETLOGON'],
          answerIndex: 1,
          hint: 'One share is the drive root; the other is the Windows folder.',
          explanation:
            'ADMIN$ maps to C:\\Windows. Tools with local admin rights copy payloads there and start services via the svcctl named pipe — the pattern ATT&CK tracks as T1021.002. C$ is the drive root; IPC$ hosts the pipes; NETLOGON is a domain share on DCs.'
        },
        {
          id: 'n11-l03-q2',
          type: 'truefalse',
          prompt: 'A standard domain user account can normally read the contents of C$ on an arbitrary domain workstation.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Admin shares are gated by which group membership?',
          explanation:
            'C$ and ADMIN$ require local administrator (or equivalent) membership. Standard users can reach IPC$ and enumerable information, but the admin shares are the admin-tier boundary — which is why local admin status is so valuable.'
        },
        {
          id: 'n11-l03-q3',
          type: 'short',
          prompt: 'Why is local administrator password reuse across many machines an enterprise-critical finding rather than a host-level one?',
          modelAnswer:
            'Because the same credential grants administrative access to every machine that shares it, turning one compromised or cracked password into a fleet-wide lateral movement path. The weakness is in the deployment design (GPO/scripts/install images), so the fix is platform-level — unique per-host passwords via Windows LAPS — not per-host cleanup.',
          hint: 'What does one credential buy across 40 identical hosts?',
          explanation:
            'Per-host testing sees one machine; the aggregate sees a network design flaw. ATT&CK\u2019s lateral movement techniques (T1021) assume exactly this kind of shared local privilege, which is why LAPS-style uniqueness is the standard remediation.'
        },
        {
          id: 'n11-l03-q4',
          type: 'scenario',
          prompt:
            'You hold one domain user account on an authorized internal test. Describe what you enumerate first and why, and how you would safely determine whether local admin credentials are reused across workstations.',
          modelAnswer:
            'First: quiet, read-only enumeration with the domain account — share listings on file servers, SYSVOL contents, RPC/DNS-based host discovery, host name and signing info via nxc smb on a small subnet — because domain-user access reveals the estate\u2019s layout without authentication noise. For reuse: agree a scope with the client, then a single --local-auth sweep with one local admin candidate password across a sampled subnet, reading Pwn3d! results as validation evidence; stop at the first tier if lockout or monitoring concerns arise, and log everything for the report.',
          hint: 'Identity-first: what does the account already see before you authenticate anywhere else?',
          explanation:
            'Domain-user enumeration is cheap and quiet and shapes everything after. Local-auth validation is the only part that authenticates per host, so it is scoped, sampled and agreed — the difference between a controlled test and a lockout storm.'
        }
      ],
      references: [
        {
          title: 'Microsoft Learn — Overview of file sharing using the SMB 3 protocol',
          url: 'https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-smb-overview',
          note: 'Official SMB overview in the Windows Server documentation.'
        },
        {
          title: 'Microsoft Learn — Windows LAPS overview',
          url: 'https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview',
          note: 'The official platform answer to local administrator password reuse.'
        },
        {
          title: 'MITRE ATT&CK T1021.002 — SMB/Windows Admin Shares',
          url: 'https://attack.mitre.org/techniques/T1021/002/',
          note: 'The lateral movement pattern this lesson\u2019s findings enable.'
        }
      ]
    },
    {
      id: 'n11-l04',
      moduleId: 'n11',
      title: 'Windows Domain Networking: LDAP, DNS, File Shares and Authentication',
      difficulty: 'Intermediate',
      minutes: 18,
      prerequisites: ['n11-l03'],
      objectives: [
        'Explain Active Directory structure: forests, domains, domain controllers and OUs',
        'Describe LDAP naming and how read-only queries reveal domain structure',
        'Use DNS SRV records to locate domain services without scanning',
        'Distinguish NTLM and Kerberos at a conceptual level and explain why SYSVOL matters'
      ],
      sections: {
        idea: [
          {
            type: 'p',
            text:
              'An internal Windows test is mostly a conversation with Active Directory, so you need to read its language. AD is a directory (LDAP) of every identity and resource in the organization, published by domain controllers; DNS tells clients — and testers — where those controllers are; SYSVOL is the replicated share that carries policies and logon scripts to every machine. Almost all of this is readable with ordinary domain-user rights, which is why the reconnaissance half of an internal test rarely requires any privilege at all.'
          },
          {
            type: 'p',
            text:
              'This lesson builds the read-only toolkit: find the DC with DNS, query the directory with LDAP, browse SYSVOL, and understand the two authentication protocols — Kerberos and NTLM — whose differences shape everything from pass-the-hash to ticket abuse later in the curriculum.'
          }
        ],
        technical: [
          {
            type: 'h',
            text: 'AD in five minutes'
          },
          {
            type: 'p',
            text:
              'A forest is the security boundary containing one or more domains; a domain is the replication and authentication unit; organizational units (OUs) structure objects for delegation and Group Policy. Domain controllers (DCs) run AD DS: each holds the directory database (NTDS) and the Kerberos key distribution center (KDC). Users, groups, computers and service accounts are objects with attributes — sAMAccountName, memberOf, servicePrincipalName — and those attributes are what LDAP queries retrieve.'
          },
          {
            type: 'h',
            text: 'LDAP and the directory tree'
          },
          {
            type: 'p',
            text:
              'LDAP (protocol spec RFC 4511) exposes the directory as a tree of distinguished names: DC=corp,DC=lab is the domain naming context, with containers like CN=Users and OUs beneath it. Port 389 serves LDAP and 636 serves LDAPS. With any domain account, ldapsearch enumerates groups, users, computers and their attributes; anonymous binds may even work on misconfigured or older installations, leaking the same data with no credentials.'
          },
          {
            type: 'h',
            text: 'DNS: the service locator'
          },
          {
            type: 'p',
            text:
              'AD publishes service locations as DNS SRV records (RFC 2782). The two you will use constantly: _ldap._tcp.dc._msdcs.<domain> lists domain controllers for LDAP, and _kerberos._tcp.<domain> lists the KDCs. One DNS query replaces a port scan: the authoritative answer to "where are the DCs", obtained quietly from the same resolver every workstation uses.'
          },
          {
            type: 'h',
            text: 'SYSVOL and the two auth protocols'
          },
          {
            type: 'p',
            text:
              'SYSVOL (and NETLOGON) is a share replicated to every DC containing Group Policy objects and logon scripts; every authenticated user can read it. Historically it leaked credentials — scripts and encrypted passwords in old Group Policy Preferences — and it remains a first stop for finding names, paths and passwords in automation. Authentication: Kerberos (RFC 4120) has the client ask the KDC for a ticket-granting ticket, then service tickets per resource — no password crosses the network after logon. NTLM is the older challenge-response scheme proving knowledge of a password hash; because the hash itself can produce the proof, a captured hash can authenticate without the password (pass-the-hash, T1550.002). Modern domains still run NTLM for legacy clients and tools, so both matter.'
          },
          {
            type: 'table',
            headers: ['Domain artifact', 'Where', 'What it tells a tester'],
            rows: [
              ['_ldap._tcp.dc._msdcs SRV', 'DNS', 'Domain controllers, without scanning'],
              ['_kerberos._tcp SRV', 'DNS', 'KDC location (TCP/UDP 88 hosts Kerberos)'],
              ['LDAP tree', '389/636', 'Users, groups, OUs, computers, SPNs'],
              ['SYSVOL share', 'DC, 445', 'Policies, scripts, sometimes credentials'],
              ['Ports 88 + 389 + 445 together', 'Any host', 'A DC fingerprint in a port scan']
            ]
          }
        ],
        pentestRelevance: [
          {
            type: 'p',
            text:
              'Every internal test begins here: identify DCs via SRV records, pull the LDAP map with a domain account, walk SYSVOL for automation secrets, and only then plan authenticated sweeps. The DC is the highest-value target in the domain — it authenticates everyone — so knowing where it is (and that you should behave carefully around it) frames the whole engagement.'
          },
          {
            type: 'list',
            items: [
              'SRV lookup is the quietest DC discovery method — no packets to the DC, just the DNS server',
              'LDAP group membership maps privilege: who is in Domain Admins, who manages which OU',
              'Anonymous LDAP on a production DC is a reportable finding on its own',
              'SYSVOL scripts often contain service account names and paths — recon gold, sometimes passwords',
              'The 88/389/445 port pattern identifies DCs when DNS is unavailable or restricted'
            ]
          }
        ],
        lookFor: [
          {
            type: 'list',
            items: [
              'SRV records for _ldap._tcp.dc._msdcs and _kerberos._tcp — enumerate before you scan',
              'LDAP accepting anonymous binds, or LDAPS absent (cleartext directory access)',
              'Group membership sprawl: Domain Admins used for daily work, service accounts in admin groups',
              'SYSVOL and NETLOGON scripts containing embedded credentials or paths to them',
              'NTLM-only dependencies: legacy apps that prevent Kerberos-only hardening',
              'Hosts exposing 88, 389/636 and 445 together — the DC pattern worth flagging to defenders'
            ]
          }
        ],
        howToTest: [
          {
            type: 'callout',
            variant: 'legal',
            title: 'Read-only reconnaissance',
            text:
              'LDAP queries, SRV lookups and SYSVOL reads are standard authenticated-user activity and are quiet — but on an engagement they still count as enumeration. Keep them in scope, and never attempt password changes, DCSync-style replication or writes: those are privileged, noisy and off-limits at this stage of the curriculum.'
          },
          {
            type: 'terminal',
            title: 'Finding and reading the domain, read-only',
            lines: [
              '$ dig @10.10.40.5 _ldap._tcp.dc._msdcs.corp.lab SRV +short',
              '0 100 389 dc01.corp.lab.',
              '$ nslookup -type=SRV _kerberos._tcp.corp.lab 10.10.40.5',
              '_kerberos._tcp.corp.lab  SRV service location:',
              '          priority       = 0',
              '          port           = 88',
              '          svr hostname   = dc01.corp.lab',
              '$ ldapsearch -x -H ldap://10.10.40.5 -b "DC=corp,DC=lab" -D "CORP\\svc_enum" -w "EnumPass1!" "(objectClass=group)" cn',
              'dn: CN=Domain Admins,CN=Users,DC=corp,DC=lab',
              'cn: Domain Admins',
              'dn: CN=FIN-ADMINS,OU=Groups,DC=corp,DC=lab',
              'cn: FIN-ADMINS',
              '$ rpcclient -U "CORP\\svc_enum%EnumPass1!" 10.10.40.5 -c "enumdomusers"',
              'user:[Administrator] rid:[0x1f4]',
              'user:[jdoe] rid:[0x452]',
              'user:[svc_backup] rid:[0x45f]'
            ]
          }
        ],
        example: [
          {
            type: 'p',
            text:
              'The LABCORP exercise: you hold one standard account. Step one, an SRV query names DC01 without a single scan packet. Step two, ldapsearch returns the group map and reveals FIN-ADMINS with several members — a target list for later, not for exploitation now. Step three, a SYSVOL walk finds a drive-mapping script referencing a backup share and the svc_backup account name. Three read-only steps later, the engagement has its structure: one DC, one privileged group, one service account, and no alarms raised.'
          },
          {
            type: 'table',
            headers: ['Step', 'Command family', 'Evidence produced'],
            rows: [
              ['Locate DC', 'dig SRV, nslookup SRV', 'DC01 name and addresses from DNS'],
              ['Map directory', 'ldapsearch (389/636)', 'Groups, members, computers, OUs'],
              ['Walk shares', 'smbclient on SYSVOL/NETLOGON', 'Scripts and policy file inventory'],
              ['Fingerprint DC', 'nmap -p 88,389,445 (fallback)', 'Port pattern confirming DC role']
            ]
          }
        ],
        tools: [
          {
            type: 'table',
            headers: ['Tool', 'Role here'],
            rows: [
              ['dig / nslookup', 'SRV record discovery — the quiet DC locator'],
              ['ldapsearch', 'Read-only LDAP queries against 389/636'],
              ['rpcclient / smbclient', 'User and share enumeration over RPC and SMB'],
              ['netexec (nxc ldap/smb)', 'Scriptable domain enumeration with credentials'],
              ['nmap', 'DC port-pattern fingerprinting when DNS is restricted']
            ]
          }
        ],
        mistakes: [
          {
            type: 'list',
            items: [
              'Scanning for DCs before asking DNS — the SRV records answer the question with one packet',
              'Assuming Kerberos means no hash-based attacks: NTLM still runs for legacy paths, and ticket material has its own abuse patterns (T1550)',
              'Reading SYSVOL only for passwords and missing the structural gold: names, share paths, deployment scripts',
              'Writing to the directory or attempting replication during enumeration; read-only is both the rule and the stealth',
              'Treating LDAP anonymous access as harmless — it discloses the same map attackers pay real creds for'
            ]
          }
        ],
        tryIt: [
          {
            type: 'p',
            text:
              'Lab: build a small Samba AD DC (or use any Windows Server evaluation VM), create two OUs, three users and two groups, and enable SYSVOL with a sample logon script. From a client VM, run the SRV lookups, an ldapsearch for groups, and an smbclient listing of SYSVOL — all as a standard user. Then sketch on paper what a full internal test would target first, given only that output.'
          }
        ],
        takeaways: [
          {
            type: 'list',
            items: [
              'AD = directory (LDAP) + authentication (Kerberos/NTLM) + locator (DNS SRV) + policy (SYSVOL)',
              'SRV records find DCs quietly; ports 88/389/445 fingerprint them in a scan',
              'A standard domain account reads the map: groups, members, computers, scripts',
              'NTLM\u2019s hash-based proof enables pass-the-hash; Kerberos replaces passwords with tickets',
              'Enumeration is read-only and quiet — structure first, credentials later'
            ]
          }
        ]
      },
      quiz: [
        {
          id: 'n11-l04-q1',
          type: 'mcq',
          prompt: 'Which port hosts the Kerberos key distribution center on a domain controller?',
          options: ['389', '445', '88', '135'],
          answerIndex: 2,
          hint: 'It is the lowest-numbered of the DC service ports.',
          explanation:
            'TCP/UDP 88 carries Kerberos (the KDC) on DCs. Together with 389/636 (LDAP/LDAPS) and 445 (SMB), it forms the recognizable DC port pattern; DNS SRV records for _kerberos._tcp point at the same servers.'
        },
        {
          id: 'n11-l04-q2',
          type: 'truefalse',
          prompt: 'Reading the SYSVOL share requires domain administrator privileges.',
          options: ['True', 'False'],
          answerIndex: 1,
          hint: 'Group Policy must reach every machine — who reads it?',
          explanation:
            'SYSVOL and NETLOGON are readable by every authenticated domain user by design, since machines and users pull policies and scripts from them. That is exactly why they are a standard stop for credential and configuration recon.'
        },
        {
          id: 'n11-l04-q3',
          type: 'short',
          prompt: 'Write or describe the DNS SRV record that locates LDAP domain controllers for the domain corp.lab.',
          modelAnswer:
            'The record is _ldap._tcp.dc._msdcs.corp.lab of type SRV; a dig +short lookup returns answers like "0 100 389 dc01.corp.lab." — priority, weight, port 389 and the DC hostname. Its _kerberos._tcp.corp.lab sibling locates the KDCs on port 88.',
          hint: 'It starts with _ldap._tcp and ends with the domain.',
          explanation:
            'RFC 2782 defines the SRV format; AD uses the _msdcs subtree for DC-specific services. Querying these records is the quiet, authoritative way to find domain infrastructure.'
        },
        {
          id: 'n11-l04-q4',
          type: 'scenario',
          prompt:
            'Your rules of engagement forbid any scanning of the server VLAN, but you hold one standard domain account and DNS access. How do you map the domain\u2019s core infrastructure and structure, and why is this approach both compliant and stealthy?',
          modelAnswer:
            'Query DNS for _ldap._tcp.dc._msdcs.corp.lab and _kerberos._tcp.corp.lab SRV records to name the DCs (DNS queries are normal client behavior, not VLAN scanning). Authenticate LDAP with the domain account and pull groups, members, computers and OUs; list SYSVOL and NETLOGON and read the scripts. This is compliant because every action is a standard authenticated-user operation on permitted services — no probe touches the restricted VLAN beyond normal logon traffic — and stealthy because it generates ordinary-looking queries instead of scan patterns.',
          hint: 'Everything you need is published on purpose; where?',
          explanation:
            'AD is designed to be discoverable by its members. Using the published locator records and read-only directory access achieves full structural reconnaissance within both the letter and the spirit of the ROE.'
        }
      ],
      references: [
        {
          title: 'Microsoft Learn — Active Directory Domain Services Overview',
          url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview',
          note: 'Official AD DS concepts: forests, domains, DCs, OUs.'
        },
        {
          title: 'Microsoft Learn — Kerberos Authentication Overview',
          url: 'https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview',
          note: 'Official description of Kerberos in Windows: KDC, tickets, delegation.'
        },
        {
          title: 'RFC 2782 — A DNS RR for specifying the location of services (DNS SRV)',
          url: 'https://datatracker.ietf.org/doc/html/rfc2782',
          note: 'The SRV record format AD uses to publish service locations.'
        },
        {
          title: 'RFC 4511 — Lightweight Directory Access Protocol (LDAP): The Protocol',
          url: 'https://datatracker.ietf.org/doc/html/rfc4511',
          note: 'The LDAP v3 specification underlying directory queries.'
        }
      ]
    }
  ]
};
