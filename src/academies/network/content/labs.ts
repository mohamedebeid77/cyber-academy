import type { Lab } from '../../../types';

// Network Security & Pentesting Academy — hands-on labs.
// Every lab runs against VMs the learner creates themselves on host-only /
// lab-only networks (Metasploitable-style deliberately vulnerable targets).
// Nothing here points at third-party infrastructure. Authorized-testing-only.

export const labsData: Lab[] = [
  {
    id: 'net-lab-01',
    title: 'Map Your Own Lab Network',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'You just finished building the training lab: two Linux VMs (your attacker VM and a deliberately vulnerable target) attached to a host-only virtual switch. The fictional client, LabCorp Training Ltd., asks for a network inventory before anything else is touched. Rule one of the course: you never scan or test anything outside your own lab.',
    target:
      'Two VMs you created on a host-only network (VirtualBox example: 192.168.56.0/24): one Kali/Parrot attacker VM and one Metasploitable-style vulnerable Linux VM. You control both machines; no traffic leaves your host.',
    objective:
      'Discover every live host on the lab subnet without a port scan, confirm at the ARP layer why each host was found alive, and record an inventory of IP, MAC and hostname evidence.',
    tools: ['nmap', 'arp-scan', 'netdiscover', 'Wireshark (optional)'],
    learningObjectives: [
      'Run and interpret a discovery-only pass (nmap -sn) against a local subnet',
      'Explain why privileged and unprivileged host discovery behave differently (ARP vs ICMP/TCP probes)',
      'Cross-check results between nmap, arp-scan, netdiscover and the kernel ARP cache',
      'Record reproducible evidence for a simple network inventory'
    ],
    hints: [
      'Start with a discovery-only pass: nmap -sn 192.168.56.0/24. The -sn flag skips the port scan and only asks who is alive.',
      'Privileges change the probes: run the same scan as root and compare. As root, Nmap ARPs directly connected targets — and ARP answers never lie about a host on your own segment.',
      'Cross-check with dedicated layer-2 tools: arp-scan --localnet and netdiscover -r 192.168.56.0/24, then look at ip neigh on your attacker VM. If a host appears in one result but not another, explain why before moving on.'
    ],
    questions: [
      {
        q: 'Which hosts were alive on your lab subnet, and how did each one prove it was alive?',
        a: 'Both lab VMs, plus the host-only gateway of your hypervisor if one exists. On a local segment, root-level Nmap proves liveness with an ARP request; the target replies with an ARP response containing its MAC address. Unprivileged runs fall back to ICMP echo and TCP probes.'
      },
      {
        q: 'Why does a host that blocks ICMP still show up in ARP-based discovery?',
        a: 'ARP is not optional on a LAN: to send any IP packet a host must resolve addresses at layer 2, and it must answer ARP requests for its own IP. Blocking ping does not stop a host from answering who-has requests, which is why local-link discovery is so reliable.'
      },
      {
        q: 'Your scan found three live hosts but the inventory lists only two machines. What are your next three moves?',
        a: 'Re-verify with a second method (arp-scan or netdiscover), check whether the third host is the hypervisor gateway or a leftover DHCP lease, and capture traffic from that IP to identify it. Only then update the inventory — with evidence. Never assume the inventory is right, and never assume the extra host is in scope.'
      }
    ],
    expectedFindings: [
      'nmap -sn finds both lab VMs (and the host-only gateway if present) without any port scan',
      'The ARP cache (ip neigh) shows entries matching the discovered IPs and MAC addresses',
      'Vendor OUIs from arp-scan/netdiscover reveal virtual NIC vendors (for example PCS Systemtechnik on VirtualBox) — evidence the hosts are virtual machines',
      'A short inventory table listing IP, MAC, vendor, detection method and timestamp'
    ],
    solution: [
      'Confirm your own position first: ip -br addr and ip route show — note the attacker interface and the host-only subnet (example: 192.168.56.0/24).',
      'Run the discovery-only scan: nmap -sn 192.168.56.0/24 and record which hosts answer.',
      'Repeat as root (sudo nmap -sn 192.168.56.0/24) and compare. As root, Nmap sends ARP requests for directly connected hosts instead of ICMP.',
      'Cross-check with arp-scan --localnet and netdiscover -r 192.168.56.0/24 -f. Note MAC addresses and vendor OUIs.',
      'Inspect your own ARP cache: ip neigh show, and correlate each IP with the MAC you observed.',
      'Optional: open a second terminal with tcpdump -i eth1 arp, rescan, and watch the who-has / is-at pairs that prove liveness.',
      'Probe one deliberately absent address (for example 192.168.56.77) and observe the unanswered ARP request — that is what a dead host looks like.',
      'Write the inventory: for each host list IP, MAC, vendor, how liveness was proven and the command used. Save raw output with nmap -oN or tee.'
    ],
    remediation: [
      'Segment lab and production environments (separate switches or VLANs) so discovering one segment never yields the next',
      'On real switches, use dynamic ARP inspection and port security to limit ARP spoofing and MAC flooding',
      'Monitor for discovery behavior — ARP sweeps and ping sweeps are visible to IDS signatures and switch logs',
      'Keep asset inventories accurate: discovery exercises are only as good as the baseline they are compared against'
    ],
    relatedLessons: ['n05-l01', 'n05-l02', 'n01-l04']
  },
  {
    id: 'net-lab-02',
    title: 'Full Port Scan and Service Inventory',
    difficulty: 'Beginner',
    points: 100,
    scenario:
      'The fictional client\u2019s asset sheet claims the training server runs "just a web server". The server is your deliberately vulnerable lab VM, and your job is to prove or disprove the claim with a full TCP port scan and a defensible service inventory.',
    target:
      'Your Metasploitable-style vulnerable Linux VM on the host-only lab network (example: 192.168.56.101). It intentionally runs a dozen or more legacy services; you mapped live hosts in net-lab-01.',
    objective:
      'Scan all 65535 TCP ports, fingerprint each open service (product, version, banner), compare the result against the fictional asset sheet, and save evidence in all three Nmap output formats.',
    tools: ['nmap', 'netcat', 'Wireshark (optional)'],
    learningObjectives: [
      'Distinguish host discovery, port scanning and version detection phases',
      'Run a full 65535-port TCP scan efficiently and reason about timing',
      'Validate automated version fingerprints by hand with netcat',
      'Produce a service inventory that survives review (ports, versions, banners, evidence files)'
    ],
    hints: [
      'A default top-1000 scan misses services on odd ports. Use nmap -p- for all ports and add --min-rate to keep it fast.',
      'Chain the phases: -sn to find hosts, then -Pn --open against the known-alive VM so a flaky ping never hides an open port.',
      'Add -sV and -sC for versions and default scripts, and -oA netlab02 to save normal, grepable and XML output at once. Then verify one banner yourself: nc -nv 192.168.56.101 <port>.'
    ],
    questions: [
      {
        q: 'How many more services did the full scan find than the top-1000 scan? Why does that matter?',
        a: 'Metasploitable-style targets typically expose services above port 10000 (for example a high-port FTP or backdoor service). Any inventory built from a top-1000 scan is incomplete, and risk assessments built on incomplete inventories miss real exposure.'
      },
      {
        q: 'What is the difference between the port state open and the service name Nmap prints next to it?',
        a: 'Open means the TCP handshake completed — something accepted the connection. The service name and version are Nmap\u2019s guess from banner and probe matching and can be wrong, spoofed or generic. That is why manual banner validation matters.'
      },
      {
        q: 'Why save -oA output instead of copying the terminal text?',
        a: '-oA writes normal (.nmap), grepable (.gnmap) and XML (.xml) files at once. The XML feeds tools like Searchsploit or parsers, the grepable format supports quick filtering, and the files are reproducible evidence with a scan timestamp.'
      }
    ],
    expectedFindings: [
      'A full -p- scan reveals significantly more open TCP ports than a top-1000 scan on the vulnerable VM',
      'Version detection identifies services such as vsftpd, Samba, OpenSSH, Apache and MySQL with specific version strings',
      'At least one Nmap version guess is confirmed or corrected by a manual netcat banner grab',
      'Three evidence files: netlab02.nmap, netlab02.gnmap and netlab02.xml'
    ],
    solution: [
      'Verify the target is alive: nmap -sn 192.168.56.101.',
      'Run the full port scan: nmap -p- --min-rate 2000 -Pn -oA netlab02_ports 192.168.56.101. Note the elapsed time and every open port.',
      'Rerun with service detection against only the open ports: nmap -sV -sC -Pn -p <open-port-list> -oA netlab02_sv 192.168.56.101.',
      'Read the output: for each open port record the guessed service, product and version. Flag anything the asset sheet does not mention.',
      'Manually validate three banners: nc -nv 192.168.56.101 21, then 22 and 80 (Ctrl-C to exit). Compare what the service itself announces with the Nmap guess.',
      'Optional: capture your own scan with tcpdump -i eth1 -n host 192.168.56.101 and watch the SYN packets Nmap emits.',
      'Build the inventory table: port, protocol, service, version, banner quote, evidence file name.',
      'Write a two-line comparison against the fictional asset sheet ("just a web server") and list the discrepancies a real client would need to fix.'
    ],
    remediation: [
      'Run only the services the business needs; uninstall or disable legacy daemons that exist by accident',
      'Keep listening services patched — most of the inventory on a Metasploitable-style box is end-of-life software',
      'Restrict exposure with firewall rules or host-based allow-lists so management services are not reachable from untrusted segments',
      'Reconcile scan inventories against the CMDB regularly; drift between the two is itself a finding'
    ],
    relatedLessons: ['n05-l03', 'n05-l04', 'n07-l01']
  },
  {
    id: 'net-lab-03',
    title: 'Read a PCAP Like a Pentester',
    difficulty: 'Beginner',
    points: 150,
    scenario:
      'This time you plant the evidence yourself. A second lab VM serves a tiny cleartext HTTP login form and answers for a hostname you invented. You will capture your own DNS and HTTP traffic, then read the resulting PCAP like an investigator who has never seen the environment.',
    target:
      'Your host-only lab: the attacker VM running Wireshark or tcpdump, plus a second VM (example: 192.168.56.102) serving a cleartext HTTP form with python3 -m http.server 8000 or a tiny Flask stub. The capture file you produce is the artifact under analysis.',
    objective:
      'Produce a PCAP containing DNS lookups and a cleartext HTTP login, then extract from it: every DNS query made, the full HTTP request/response pair, and the username and password submitted in cleartext.',
    tools: ['Wireshark', 'tcpdump', 'curl', 'python3 (simple HTTP server)'],
    learningObjectives: [
      'Capture clean evidence: start the capture before the traffic exists',
      'Use display filters (dns, http, http.request.method == "POST") to navigate a PCAP',
      'Follow a TCP stream and reassemble an application-level conversation',
      'Explain exactly which metadata survives encryption and which does not'
    ],
    hints: [
      'Start the capture before generating traffic: tcpdump -i eth1 -n -w lab03.pcap. A capture started late is a capture that missed the login.',
      'In Wireshark, filter DNS with dns and HTTP with http. For the credential, find the POST packet and use Follow > TCP Stream — the whole conversation reassembles into readable text.',
      'Useful filters: http.request.method == "POST" for the login, dns.flags.response == 0 for queries only, and http.request.full_uri to list everything fetched.'
    ],
    questions: [
      {
        q: 'What HTTP method carried the credential, and why was it readable?',
        a: 'POST (or GET if the form was built that way) over plain HTTP. Without TLS every byte of the request line, headers and body is visible on the wire, and Follow TCP Stream reproduces it verbatim.'
      },
      {
        q: 'Which DNS names were queried during the session, and which one was your invention?',
        a: 'The capture shows the lookup for your lab server plus system-generated queries (mirrors, time sync, reverse lookups). The invented name stands out because nothing else in the environment references it — exactly how analysts spot C2 or exfiltration domains.'
      },
      {
        q: 'A developer argues "HTTPS would not have stopped you, you still saw the DNS". What is the right answer?',
        a: 'DNS reveals which names were contacted, but with TLS the HTTP request, headers and password are ciphertext. Encryption does not make metadata disappear — it removes the credential exposure demonstrated here. Encrypted DNS reduces even the name leakage.'
      }
    ],
    expectedFindings: [
      'A non-empty lab03.pcap containing DNS queries and at least one complete HTTP request/response pair',
      'The planted username and password visible in cleartext in the HTTP POST body',
      'Follow TCP Stream reconstructs the full session including the server response',
      'The DNS query list contains the invented hostname resolved against your lab setup'
    ],
    solution: [
      'Set up the server: on the second VM create a minimal HTML login form (two fields) and serve it with python3 -m http.server 8000 (or a tiny Flask stub). Note its IP, example 192.168.56.102.',
      'Map an invented name on the attacker VM: add a line like 192.168.56.102 intranet.lab.local to /etc/hosts, or point it at your lab DNS server if you run one.',
      'Start the capture on the attacker VM: sudo tcpdump -i eth1 -n -w lab03.pcap (or Wireshark on the host-only interface). Leave it running.',
      'Generate traffic: curl -v http://intranet.lab.local:8000/ to fetch the form, then submit it once — curl -X POST -d "user=labuser&pass=S3cret-Lab-Pass" http://intranet.lab.local:8000/login (adjust to your form).',
      'Stop the capture with Ctrl-C and confirm the artifact: ls -lh lab03.pcap.',
      'Open it: wireshark -r lab03.pcap. Apply dns.flags.response == 0 and list every queried name from the Info column.',
      'Apply http.request.method == "POST", select the packet, then Follow > TCP Stream (or add the filter tcp.stream eq <n>). Record the username and password from the request body and screenshot as evidence.',
      'Write a three-line note: what was exposed, how it was captured, and the single control that prevents it (TLS everywhere, HSTS, no credentials in URLs).'
    ],
    remediation: [
      'Serve everything over TLS 1.2+ and redirect or reject cleartext HTTP; deploy HSTS',
      'Keep credentials out of URLs and query strings; POST bodies under TLS are still far better than anything in a URL',
      'Consider encrypted DNS (DoT/DoH) where policy allows, accepting that enterprise visibility needs a deliberate design',
      'Monitor for cleartext protocols on the network — a passive sensor would have caught this login instantly'
    ],
    relatedLessons: ['n06-l01', 'n06-l03', 'n06-l04']
  },
  {
    id: 'net-lab-04',
    title: 'Anonymous FTP and Weak Service Banners',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'Rumor says the vulnerable VM accepts anonymous FTP, and half a dozen of its services happily announce their exact versions to anyone who connects. The fictional client wants to know how much an unauthenticated stranger learns in ten minutes — with zero exploitation.',
    target:
      'Your Metasploitable-style VM (192.168.56.101) running vsftpd (or similar) with anonymous access enabled, plus legacy services (SSH, SMTP, Telnet, FTP) that expose versioned banners.',
    objective:
      'Confirm anonymous FTP access, download a file from the anonymous share, banner-grab at least three services by hand, and map each service to its software version as input for vulnerability research.',
    tools: ['nmap', 'netcat', 'ftp', 'curl (optional)'],
    learningObjectives: [
      'Use anonymous/guest logins where policy allows them and document exactly what they expose',
      'Banner-grab raw protocols with netcat and interpret greeting lines',
      'Relate version strings to software products (and later to CVEs)',
      'Separate "the banner says X" from "the service is X" — banners are configuration, not proof'
    ],
    hints: [
      'nmap -sV grabs many banners automatically, but do it raw at least once: nc -nv 192.168.56.101 21 (also try 22 and 25) and read the greeting line.',
      'Anonymous FTP: ftp 192.168.56.101, user anonymous, any password (traditionally your email). Then pwd, ls, get <file>. If no ftp client is installed, curl ftp://192.168.56.101/ lists and fetches files too.',
      'On the target (you own it), look at where the leak comes from: /etc/issue.net, and the banner-related lines in vsftpd.conf.'
    ],
    questions: [
      {
        q: 'What could you list and download through anonymous FTP, and what would a real attacker do with it?',
        a: 'Metasploitable-style targets typically expose user home directories or world-readable files over anonymous FTP — configuration files, notes, sometimes credentials. An attacker mines them for usernames, software versions and reuse-able passwords before any exploitation.'
      },
      {
        q: 'Why do versions in banners matter even without an exploit?',
        a: 'Versions let an attacker shortlist known vulnerabilities without touching the service (searchsploit vsftpd 2.3.4). The banner does the attacker\u2019s reconnaissance for them; removing it does not fix the bug but removes free intelligence.'
      },
      {
        q: 'The vsftpd banner claims 2.3.4. How would you confirm or refute that without exploiting anything?',
        a: 'Cross-check the package database on the target (dpkg -l | grep vsftpd — it is your lab box), compare multiple banner/probe sources (nmap -sV, the FTP FEAT response), and treat persistent mismatch as a deliberate deception that itself deserves documentation.'
      }
    ],
    expectedFindings: [
      'Anonymous login to the FTP service succeeds and at least one file is downloaded',
      'Raw banner grabs capture greeting lines from FTP/SSH/SMTP including version strings',
      'nmap -sV results agree (or interestingly disagree) with the manual banners',
      'A version table ready for vulnerability research: service, product, version, source of the string'
    ],
    solution: [
      'Confirm the port inventory from net-lab-02: nmap -sV -Pn -p 21,22,25,80,2121 192.168.56.101 (adjust ports to your scan).',
      'Banner-grab FTP by hand: nc -nv 192.168.56.101 21 — record the greeting line, then quit.',
      'Banner-grab SSH: nc -nv 192.168.56.101 22 (SSH announces its version immediately; Ctrl-C to exit).',
      'Banner-grab SMTP: nc -nv 192.168.56.101 25 and send EHLO lab.local to see what the server advertises.',
      'Log in anonymously: ftp 192.168.56.101 with user anonymous and any password. Run pwd, ls, cd into anything readable and get one file (or use curl ftp://192.168.56.101/).',
      'Note FTP server responses: try quote HELP or feat in the ftp session for extra information disclosure.',
      'On the target VM, show the source of one banner: grep -i banner /etc/vsftpd.conf and cat /etc/issue.net — evidence that banners are configured strings.',
      'Produce the version table (service, product, version, evidence) and mark which entries you would carry into vulnerability research in net-lab-09.'
    ],
    remediation: [
      'Disable anonymous FTP unless there is a documented business need; serve public files over read-only HTTPS instead',
      'Restrict FTP to explicit IP allow-lists (or replace it entirely — FTP, especially without TLS, is obsolete)',
      'Minimize banners and protocol greetings to versions where feasible; do not leak OS details or internal hostnames',
      'Patch or decommission end-of-life services — banner removal is hygiene, patching is the fix'
    ],
    relatedLessons: ['n07-l01', 'n07-l02', 'n08-l03']
  },
  {
    id: 'net-lab-05',
    title: 'SMB Shares and Null Sessions',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'The fictional client, LabCorp Training Ltd., runs a "file server" on the lab VM. Nobody remembers which shares exist or who can read them. Your job: enumerate the Samba service without any credentials, and show exactly what a null session learns.',
    target:
      'Samba on your vulnerable VM (192.168.56.101), configured with an anonymous-readable share and null session binds permitted — Metasploitable-style targets behave this way by default. This is your own lab VM; SMB enumeration of systems you do not own is out of bounds.',
    objective:
      'Enumerate shares, users and OS information through an unauthenticated (null) session, connect to an anonymous-readable share, and retrieve a document as evidence without ever authenticating.',
    tools: ['smbclient', 'enum4linux', 'nmap (NSE)', 'rpcclient'],
    learningObjectives: [
      'Understand what a null session is at the SMB/RPC layer',
      'Enumerate shares, users and password policy with smbclient, rpcclient and enum4linux',
      'Use NSE scripts to corroborate manual findings',
      'Assess the impact of anonymous-readable shares in terms of data exposure'
    ],
    hints: [
      'List shares anonymously: smbclient -L //192.168.56.101 -N. The -N suppresses the password prompt and attempts a null session.',
      'enum4linux -a 192.168.56.101 collects shares, users, groups, password policy and OS info in one pass — it is a wrapper around the Samba tools, so every number it prints is verifiable with smbclient and rpcclient.',
      'Connect to a readable share: smbclient //192.168.56.101/<share> -N, then ls and get <file>. Raw RPC: rpcclient -U "" -N 192.168.56.101, then enumdomusers inside the prompt.'
    ],
    questions: [
      {
        q: 'What is a null session, technically?',
        a: 'An SMB session established with empty credentials (anonymous). Legacy Windows and old Samba configurations allow such sessions to bind to RPC services and read share lists, user lists and policy — historically the classic enumeration vector for Windows networks.'
      },
      {
        q: 'Which share could you read anonymously and what did it contain?',
        a: 'Metasploitable-style targets expose shares such as tmp or public with world-readable contents. The specific files vary, but the point is universal: an unauthenticated stranger can list and download business data.'
      },
      {
        q: 'The share list mentions a share named after a person. Why is that a finding even if you cannot read it?',
        a: 'Share names leak structure: usernames, projects, department names. Enumerated names feed password guessing, phishing and targeted attacks. Metadata disclosure is a finding even when the data itself is locked down.'
      }
    ],
    expectedFindings: [
      'smbclient -L with -N lists shares without credentials (for example tmp, public, plus printer shares)',
      'enum4linux returns OS information, a user list and a password policy from the null session',
      'A file is downloaded from an anonymous-readable share and preserved as evidence',
      'NSE output (smb-enum-shares, smb-os-discovery) corroborates the manual results'
    ],
    solution: [
      'Confirm SMB is listening: nmap -Pn -p 139,445 192.168.56.101.',
      'List shares anonymously: smbclient -L //192.168.56.101 -N and record every share name and its comment.',
      'Enumerate everything at once: enum4linux -a 192.168.56.101 — note OS, users, groups and password policy sections.',
      'Cross-check with NSE: nmap --script smb-enum-shares,smb-os-discovery -p445 192.168.56.101.',
      'Bind raw RPC: rpcclient -U "" -N 192.168.56.101, then run srvinfo and enumdomusers inside the prompt; exit.',
      'Connect to a readable share: smbclient //192.168.56.101/tmp -N, run ls, and get one file (get <name>). Quit.',
      'Inspect the downloaded file locally and note any usernames, paths or versions it leaks.',
      'Write the finding: null sessions expose X shares, Y users and the password policy; include the exact commands as reproduction steps.'
    ],
    remediation: [
      'Disable null/anonymous session access (Samba: restrict anonymous bindings; map to guest only where genuinely needed)',
      'Apply least privilege to shares: explicit allow-lists per share, no world-readable business data',
      'Use non-revealing share names and remove legacy printer/admin shares nobody uses',
      'On Windows servers, enforce SMB signing and restrict anonymous enumeration via group policy'
    ],
    relatedLessons: ['n07-l04', 'n10-l03', 'n08-l03']
  },
  {
    id: 'net-lab-06',
    title: 'SNMP Community Strings and Information Leakage',
    difficulty: 'Intermediate',
    points: 150,
    scenario:
      'LabCorp Training Ltd. monitors its training server with SNMP, but nobody remembers which community strings are configured. You get to find out what the management protocol is willing to tell a stranger — on your own lab VM only.',
    target:
      'snmpd on your vulnerable VM (192.168.56.101), configured with a default read-only community (public) or one you set yourself in snmpd.conf. Lab-only: never point SNMP tooling at devices you do not own.',
    objective:
      'Identify the SNMP version and community string in use, walk the system and interface MIBs, and document the operational information an unauthenticated reader can collect.',
    tools: ['nmap (NSE)', 'snmpwalk', 'onesixtyone (optional)', 'Wireshark'],
    learningObjectives: [
      'Remember that SNMP lives on UDP and why TCP-only scans never see it',
      'Brute-force community strings with NSE and interpret the results',
      'Walk MIB trees with snmpwalk and extract meaningful subsets',
      'Quantify what leaked: system description, interfaces, users, processes, listening ports'
    ],
    hints: [
      'SNMP runs on UDP 161 — a TCP-only scan will never find it. Brute-force communities with nmap -sU -p161 --script snmp-brute 192.168.56.101 (try public and private by hand first).',
      'Once you have a community: snmpwalk -v2c -c public 192.168.56.101 walks the whole tree; snmpwalk -v2c -c public 192.168.56.101 sysDescr.0 gets just the description.',
      'Interesting OIDs: sysDescr and sysName (identity), ifTable (interfaces and addresses), hrSWRunName and hrSWUser (processes and owners) where HOST-RESOURCES-MIB is implemented.'
    ],
    questions: [
      {
        q: 'Why did your TCP scans never report SNMP?',
        a: 'SNMP uses UDP 161. UDP has no handshake, so port scanners get silence instead of refusals; tools must send protocol-correct requests and wait for a response. Nmap needs -sU and SNMP-aware scripts or a longer timeout to make that judgment.'
      },
      {
        q: 'What did the community string public actually expose on your VM?',
        a: 'At minimum the system description, uptime, contact and location; on full HOST-RESOURCES implementations also running processes with owners, installed software, interfaces and addresses. In effect, a guided tour of the host handed to anyone who guesses one word.'
      },
      {
        q: 'What is the difference between a read-only and a read-write community, and why does the latter scare engineers?',
        a: 'Read-only (ro) allows queries; read-write (rw) allows SET operations — changing device configuration, restarting services, altering routing. A guessable rw community is remote administrative access by another name.'
      }
    ],
    expectedFindings: [
      'A community string is discovered (public on default configurations) via NSE or manual attempt',
      'snmpwalk returns system description, name, uptime and location values',
      'Interface and address information (ifTable) reveals the VM\u2019s networking, sometimes including addresses not seen in scans',
      'Process/user listings leak software inventory and account names (where HOST-RESOURCES-MIB is available)'
    ],
    solution: [
      'Check the service exists: sudo nmap -sU -Pn -p161 192.168.56.101 — note that open vs open|filtered is nuanced on UDP.',
      'Try the classics by hand: snmpwalk -v2c -c public 192.168.56.101 sysDescr.0, and repeat with -c private.',
      'Brute-force properly: sudo nmap -sU -Pn -p161 --script snmp-brute 192.168.56.101 and read the discovered community from the output.',
      'Walk the tree: snmpwalk -v2c -c <community> 192.168.56.101 > snmp_full.txt — skim it in less; it can be thousands of lines.',
      'Extract identity: snmpwalk -v2c -c <community> 192.168.56.101 system — record sysDescr, sysName, sysLocation, sysContact.',
      'Extract networking: snmpwalk -v2c -c <community> 192.168.56.101 ifTable (or interfaces) — note interface names and addresses.',
      'Extract host detail where available: snmpwalk -v2c -c <community> 192.168.56.101 hrSWRunName and hrSWUser.',
      'Optional: capture your own queries with tcpdump -i eth1 -n udp port 161 and observe that the community string itself travels in cleartext.',
      'Write the finding: leaked data categories, the community string, and remediation (strong communities, SNMPv3, ACLs).'
    ],
    remediation: [
      'Replace default communities (public/private) with long random strings — or better, move to SNMPv3 with authentication and encryption',
      'Restrict SNMP with agent ACLs so only the monitoring host may query, and firewall UDP 161 accordingly',
      'Disable or trim MIB branches that leak process and user data where the device does not need them',
      'Remember the community string rides in cleartext in SNMPv1/v2c — treat those versions as legacy'
    ],
    relatedLessons: ['n07-l05', 'n05-l05', 'n08-l03']
  },
  {
    id: 'net-lab-07',
    title: 'SSH Local Port Forwarding Through a Dual-Homed VM',
    difficulty: 'Intermediate',
    points: 200,
    scenario:
      'New topology, three VMs: your attacker VM on 192.168.56.0/24; a dual-homed Ubuntu "pivot" VM with one NIC on 192.168.56.0/24 (192.168.56.105) and one on 10.10.10.0/24 (10.10.10.1); and an internal-only VM at 10.10.10.20 running a small web service. The attacker VM has no route to 10.10.10.0/24 — by design.',
    target:
      'Three VMs you build on two host-only networks as described. You hold SSH credentials for the pivot VM (a user and key or password you created — it is your lab). The internal service on 10.10.10.20:80 is reachable only from the pivot.',
    objective:
      'Establish an SSH local port forward from the attacker VM through the pivot so a local port exposes the internal web service, browse it end to end, and explain why the internal host stays invisible to direct scans.',
    tools: ['ssh', 'curl', 'netcat'],
    learningObjectives: [
      'Reason about routing boundaries: why no direct path means no direct scan',
      'Build an SSH local forward (-L) and read its three-part meaning (bind:target:targetport)',
      'Verify a tunnel is doing what you think with curl, ss and ssh -v',
      'Recognize when a single local forward is enough — and when it is not (see net-lab-08)'
    ],
    hints: [
      'First prove the wall: ping and nmap to 10.10.10.20 from the attacker VM must fail. Then open the tunnel: ssh -N -L 8080:10.10.10.20:80 labuser@192.168.56.105.',
      'Keep -N (no shell on the pivot), add -v once for a verbose log of each forwarded connection, and leave the SSH session running while you test.',
      'Test from the attacker VM: curl -I http://127.0.0.1:8080/. The first leg (attacker to pivot) is encrypted SSH; the second leg (pivot to internal VM) is whatever protocol you forwarded — cleartext HTTP here.'
    ],
    questions: [
      {
        q: 'Why could you not just nmap 10.10.10.20 from the attacker VM?',
        a: 'The attacker VM has no interface or route on 10.10.10.0/24; packets have no path to the internal VM and die at the routing decision. The pivot is the only host on both segments — which is exactly why it is the tunnel endpoint.'
      },
      {
        q: 'What exactly does ssh -N -L 8080:10.10.10.20:80 labuser@192.168.56.105 do?',
        a: 'It opens an SSH session to the pivot that runs no command (-N), and asks the SSH server to listen on your local port 8080. Connections to 127.0.0.1:8080 are carried over the encrypted channel and then reopened by the pivot toward 10.10.10.20:80 — the pivot makes the connection from its own network position.'
      },
      {
        q: 'When is a local forward (-L) the wrong tool?',
        a: 'When you need many ports or many hosts. One -L covers exactly one bind port to one target; scanning a subnet or reaching arbitrary services means dozens of forwards. That is the job of a dynamic SOCKS tunnel (-D) or ligolo-style tunneling — net-lab-08.'
      }
    ],
    expectedFindings: [
      'Direct connectivity from the attacker VM to 10.10.10.20 fails (no route / unreachable)',
      'The forward ssh -N -L 8080:10.10.10.20:80 labuser@192.168.56.105 establishes and holds',
      'curl http://127.0.0.1:8080/ returns the internal web service through the tunnel',
      'On the pivot, ss -tn shows the SSH session plus an outgoing connection to 10.10.10.20:80 while you browse'
    ],
    solution: [
      'Build the topology: dual-homed Ubuntu pivot VM (enable IP forwarding later only if you choose; not needed for -L) and the internal VM with a simple web service (python3 -m http.server 80). Verify both interfaces on the pivot with ip -br addr.',
      'Prove the boundary from the attacker VM: ping -c 2 10.10.10.20 and nmap -Pn -p80 10.10.10.20 — both must fail.',
      'Open the tunnel: ssh -N -v -L 8080:10.10.10.20:80 labuser@192.168.56.105 (use your lab credentials). Read the verbose output until you see the local forward listening.',
      'Keep that terminal open. From the attacker VM: curl -I http://127.0.0.1:8080/ — you should see the internal server\u2019s response headers.',
      'Browse further: curl http://127.0.0.1:8080/ and fetch the page content end to end.',
      'Observe the legs: on the pivot run ss -tn — an established SSH session from your attacker IP and a fresh connection to 10.10.10.20:80 while the request is in flight.',
      'Break things on purpose: stop the SSH session and repeat the curl — connection refused. Restart and it works. That is the whole dependency chain made visible.',
      'Write it up: the command, the three parts of the -L argument, what was reachable before and after, and one sentence on why encrypted first leg does not protect the second.'
    ],
    remediation: [
      'Restrict SSH on bastion/pivot hosts: key-based auth only, AllowTcpForwarding no for accounts that do not need it, and PermitOpen to pin allowed destinations',
      'Do not leave idle tunnels open — pair forwarding rights with session logging and short idle timeouts',
      'Treat dual-homed hosts as high-value: they are the boundary; harden, monitor and keep their management off shared segments',
      'Detect long-lived forwarded sessions with SSH audit logs (sshd -E or journald) and alert on unusual -L/-R usage'
    ],
    relatedLessons: ['n13-l01', 'n13-l02', 'n04-l02']
  },
  {
    id: 'net-lab-08',
    title: 'SOCKS Pivot and Internal Subnet Discovery',
    difficulty: 'Advanced',
    points: 250,
    scenario:
      'The net-lab-07 topology grows: the internal subnet now holds two machines — 10.10.10.20 (web) and 10.10.10.30 (a file server with SMB or FTP). You still hold SSH on the dual-homed pivot. One forward per port will not cut it anymore; you need a dynamic tunnel and a disciplined internal sweep.',
    target:
      'Four VMs on two host-only networks: attacker VM (192.168.56.0/24), dual-homed pivot (192.168.56.105 / 10.10.10.1), internal web VM (10.10.10.20) and internal file VM (10.10.10.30, Samba or FTP hosting a lab evidence file). SSH credentials for the pivot from net-lab-07.',
    objective:
      'Build a dynamic SOCKS tunnel through the pivot, sweep the internal 10.10.10.0/24 subnet through it, identify both internal services, and retrieve the evidence file from the internal file VM — with every internal packet traveling through the tunnel.',
    tools: ['ssh', 'proxychains', 'nmap', 'smbclient', 'chisel (optional)'],
    learningObjectives: [
      'Build a dynamic (SOCKS) SSH tunnel with -D and wire tools through proxychains',
      'Understand the SOCKS constraint: TCP connect scans only, no SYN scans, no UDP through plain SOCKS',
      'Sweep and enumerate an internal subnet with adapted tooling and adjusted expectations (latency, reliability)',
      'Recognize the same pattern in modern tooling (chisel, ligolo-ng) instead of memorizing one tool'
    ],
    hints: [
      'One local forward per port does not scale. A dynamic tunnel covers everything: ssh -N -D 1080 labuser@192.168.56.105 opens a SOCKS5 proxy on local port 1080.',
      'Teach proxychains about the tunnel: add socks5 127.0.0.1 1080 to /etc/proxychains4.conf, then prefix commands: proxychains4 nmap -sT -Pn --top-ports 100 10.10.10.0/24. Note the -sT — raw SYN scans do not work through SOCKS.',
      'SMB through SOCKS: proxychains4 smbclient -L //10.10.10.30/ -N. Be patient — every packet makes a detour; latency is the price of pivoting, and timeouts deserve a bump before you declare a host dead.'
    ],
    questions: [
      {
        q: 'Why must you use nmap -sT (connect scan) through the SOCKS tunnel instead of -sS?',
        a: 'A SYN scan needs raw socket access to craft packets; through a SOCKS proxy your tool only opens ordinary TCP connections that the proxy relays. The connect scan is the only Nmap TCP mode that works entirely with normal sockets, so it is the only one compatible with proxychains.'
      },
      {
        q: 'How did your internal sweep results differ from the same scan on a directly attached subnet?',
        a: 'Slower, noisier and less certain: connect scans complete full handshakes, some probes time out behind the detour, and UDP is absent. Careful pentesters bump timeouts, rerun borderline checks, and treat ambiguous results as unverified rather than closed.'
      },
      {
        q: 'Chisel and ligolo-ng were not needed here. When would they earn their place?',
        a: 'When SSH is unavailable or its forwarding is restricted: chisel rides a plain TCP (or HTTP) channel and needs only a small binary on the pivot; ligolo-ng uses a TUN interface so raw-style scanning works without proxychains. Same concept — a relay on a dual-homed host — different transport.'
      }
    ],
    expectedFindings: [
      'The dynamic tunnel ssh -N -D 1080 ... is up and proxychains routes through it (verified with a test command)',
      'The internal sweep through the tunnel discovers 10.10.10.20 and 10.10.10.30 with their services',
      'The evidence file is retrieved from the internal file VM (SMB anonymous share or FTP) via the tunnel',
      'Nothing ever connected directly from the attacker VM to 10.10.10.0/24 — provable from the topology and the pivot\u2019s ss -tn output'
    ],
    solution: [
      'Extend net-lab-07: add the internal file VM at 10.10.10.30 running Samba with an anonymous-readable share (guest ok = yes) or plain FTP, containing a lab evidence file (example: evidence.txt).',
      'Open the dynamic tunnel from the attacker VM: ssh -N -D 1080 labuser@192.168.56.105 and leave it running.',
      'Configure proxychains: append socks5 127.0.0.1 1080 to /etc/proxychains4.conf (quiet_mode on is optional), then sanity-check with proxychains4 curl -I http://10.10.10.20/.',
      'Sweep the subnet through the tunnel: proxychains4 nmap -sT -Pn --top-ports 100 -T4 10.10.10.0/24 — expect it to be slower than a local scan; rerun hosts with open ports for detail with -sV.',
      'Enumerate the web VM: proxychains4 curl http://10.10.10.20/ and note the service banner/headers.',
      'Enumerate the file VM: proxychains4 smbclient -L //10.10.10.30/ -N (or proxychains4 curl ftp://10.10.10.30/), identify the readable share.',
      'Retrieve the evidence file: proxychains4 smbclient //10.10.10.30/<share> -N -c "get evidence.txt" (or the FTP equivalent) and read it locally.',
      'Confirm the path: on the pivot, ss -tn while transfers run — you should see attacker-to-pivot SSH plus pivot-to-internal connections, and never attacker-to-internal.',
      'Write the flow as a reusable recipe: tunnel, proxychains config, sweep with -sT -Pn, enumerate per service, retrieve evidence — and note the tooling alternatives (chisel, ligolo-ng) for cases without SSH.'
    ],
    remediation: [
      'A compromised dual-homed host is a segmentation failure point: restrict lateral routes with host firewalls and allow-lists per segment',
      'Disable or tightly control SSH dynamic forwarding (AllowTcpForwarding, PermitOpen, PermitTunnel) on bastions',
      'Detect tunneling: SSH control sessions with long idle times and unusual forwarded-connection patterns are visible in sshd logs and flow data',
      'Design internal monitoring to notice cross-segment connections originating from bastions — the pivot makes every internal connection look like it came from one host'
    ],
    relatedLessons: ['n13-l03', 'n13-l01', 'n12-l05']
  },
  {
    id: 'net-lab-09',
    title: 'Vulnerability Assessment and Mock Report',
    difficulty: 'Advanced',
    points: 250,
    scenario:
      'Capstone: run a structured vulnerability assessment of your vulnerable VM, validate one finding by hand, and write it up as a mock professional report entry with CVSS vector, evidence and remediation. The deliverable matters as much as the scan — findings that are not communicated do not exist.',
    target:
      'Your Metasploitable-style VM (192.168.56.101). Assessment subjects are the services you inventoried in net-lab-02/04 (vsftpd, Samba, OpenSSH and friends). Scope is one host you own; authorization is the fact that it is your lab.',
    objective:
      'Use NSE and Searchsploit to shortlist candidate vulnerabilities, manually validate at least one with non-destructive checks, and produce a mock report finding: asset, description, evidence, CVSS v3.1 vector, impact and remediation with retest criteria.',
    tools: ['nmap (NSE)', 'searchsploit', 'netcat', 'text editor'],
    learningObjectives: [
      'Run a non-destructive NSE vulnerability pass and interpret script output including CVE references',
      'Cross-reference service versions with public exploit databases using searchsploit',
      'Validate findings manually — evidence over scanner say-so',
      'Write a report-grade finding: reproducible evidence, justified CVSS v3.1 metrics, actionable remediation'
    ],
    hints: [
      'Script the low-hanging fruit: nmap -sV --script vuln 192.168.56.101 (or targeted scripts such as --script ftp-vsftpd-backdoor). NSE output includes CVE references you can chase.',
      'Searchsploit mirrors Exploit-DB locally: searchsploit vsftpd 2.3.4, then searchsploit -m <id> to copy an entry into your working directory. Read every exploit before running anything — most need adjustments, and some are deliberately unsafe.',
      'Validation means evidence, not exploitation: a captured banner, a safe NSE check or a protocol-level probe is enough. Score with the FIRST CVSS v3.1 calculator and justify each metric in one sentence.'
    ],
    questions: [
      {
        q: 'What is the difference between a vulnerability, an exploit and a validated finding?',
        a: 'A vulnerability is a weakness (often identified by CVE); an exploit is code that abuses it; a validated finding is evidence you personally collected that the weakness exists on this asset at this version. Reports carry validated findings — scanner say-so without validation is where false positives come from.'
      },
      {
        q: 'Your NSE script flags a vulnerability. Name two reasons it could be wrong, and how you check.',
        a: 'Version detection can be mistaken (a banner lies, a backported patch fixes the CVE without a version bump), and script checks can match patterns loosely (a string match is not a behavior test). Verify the version from two independent sources and, where safe, run the script\u2019s specific non-destructive check rather than relying on a generic category.'
      },
      {
        q: 'What makes a CVSS vector defensible under review?',
        a: 'Each metric is justified by observable facts: Attack Vector:Network because the service is remote; Privileges Required:None because anonymous access worked; User Interaction and Scope grounded in the actual protocol behavior. Guessing metrics is how reports lose credibility — cite the evidence per metric.'
      }
    ],
    expectedFindings: [
      'The NSE vulnerability pass flags at least one known-vulnerable legacy service with CVE references (for example vsftpd 2.3.4, CVE-2011-2523, on Metasploitable-style targets)',
      'searchsploit returns matching public entries for the versions you found',
      'Manual validation evidence exists: a captured banner, a targeted safe script check or a version cross-check from the package database',
      'A complete mock finding: asset, description, evidence block, CVSS v3.1 vector with justified metrics, impact, remediation and retest criteria'
    ],
    solution: [
      'Write a one-paragraph scope note: host (192.168.56.101), services in scope, authorization basis (your lab), timeframe. A report without scope is fiction.',
      'Baseline the inventory: nmap -sV -sC -Pn -oA report_scan 192.168.56.101.',
      'Run the non-destructive vulnerability pass: nmap -sV -Pn --script vuln -oA report_vuln 192.168.56.101 (allow several minutes) and collect the CVE references it prints.',
      'Cross-reference versions: searchsploit vsftpd 2.3.4, searchsploit samba 3.0.20, and searchsploit --nmap report_scan.xml to let the XML drive the search.',
      'Pick one finding and validate it without exploitation — for example the vsftpd 2.3.4 backdoor: confirm the banner with nc -nv 192.168.56.101 21 and optionally run the targeted check nmap --script ftp-vsftpd-backdoor -p21 192.168.56.101.',
      'Optionally cross-check the package version on the target itself (dpkg -l | grep vsftpd) as a second, independent source.',
      'Score it: open the FIRST CVSS v3.1 calculator, derive the vector from your evidence, and write one justification sentence per metric.',
      'Write the finding: title, asset, description (what and why it matters), evidence (commands and trimmed output), CVSS vector and score, impact, remediation (upgrade/replace/disable), retest criteria.',
      'Peer-review pass: reproduce your own evidence from the commands alone, re-check each CVSS metric, and confirm remediation is specific enough to action.'
    ],
    remediation: [
      'Establish patch management for exposed services; most findings on legacy lab targets are simply end-of-life software still running',
      'Disable services without a business owner — the cheapest vulnerability is the one you stopped running',
      'Adopt banner hygiene and information-disclosure reviews as part of hardening baselines',
      'Institutionalize the workflow: scan, validate, score, report, remediate, retest — the loop matters more than any single tool'
    ],
    relatedLessons: ['n08-l02', 'n08-l04', 'n15-l03', 'n15-l04']
  }
];
