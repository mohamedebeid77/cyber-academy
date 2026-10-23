import type { CheatSheet } from '../../../types';

// Network Security & Pentesting Academy — cheat sheets.
// Every entry is real, copy-friendly single-line syntax. Display filters and
// protocol arguments that need double quotes use them inside single-quoted
// TypeScript strings on purpose.

export const cheatsheets: CheatSheet[] = [
  {
    id: 'net-cs-01',
    title: 'Networking Fundamentals',
    description: 'The everyday commands that answer where am I, what is connected and how do packets flow on a Linux lab machine.',
    category: 'Fundamentals',
    entries: [
      { cmd: 'ip -br addr', desc: 'interfaces and addresses at a glance' },
      { cmd: 'ip route show', desc: 'the routing table — where the next packet goes' },
      { cmd: 'ip neigh', desc: 'ARP/neighbor cache — the layer-2 to layer-3 mapping' },
      { cmd: 'ss -tuln', desc: 'listening TCP and UDP sockets' },
      { cmd: 'hostname -I', desc: 'this host\u2019s IP addresses' },
      { cmd: 'cat /etc/resolv.conf', desc: 'configured DNS resolvers' },
      { cmd: 'ping -c 4 192.168.56.1', desc: 'reachability and latency to the gateway' },
      { cmd: 'traceroute -n 8.8.8.8', desc: 'path to a destination without DNS noise' },
      { cmd: 'dig example.com +short', desc: 'name resolution check' },
      { cmd: 'nc -zv 192.168.56.10 22', desc: 'TCP port reachability beyond ping' },
      { cmd: 'tcpdump -i any -c 20 -n', desc: 'peek at 20 live packets' },
      { cmd: 'curl -I https://example.com', desc: 'response headers of an HTTP service' },
      { cmd: 'sysctl net.ipv4.ip_forward', desc: 'is this host a router? (1 = forwarding on)' },
      { cmd: 'nmcli device status', desc: 'NetworkManager view of interfaces' }
    ]
  },
  {
    id: 'net-cs-02',
    title: 'CIDR and Subnetting Quick Reference',
    description: 'Prefix-to-mask table with real host counts. Usable hosts = 2^(32 - prefix) - 2 — subtract the network and broadcast addresses.',
    category: 'Fundamentals',
    entries: [
      { cmd: 'usable = 2^(32 - prefix) - 2', desc: 'the formula behind every row below' },
      { cmd: '/8', desc: '255.0.0.0 — 16,777,216 total, 16,777,214 usable' },
      { cmd: '/16', desc: '255.255.0.0 — 65,536 total, 65,534 usable' },
      { cmd: '/20', desc: '255.255.240.0 — 4,096 total, 4,094 usable; block size 16 in the third octet' },
      { cmd: '/22', desc: '255.255.252.0 — 1,024 total, 1,022 usable; block size 4 in the third octet' },
      { cmd: '/23', desc: '255.255.254.0 — 512 total, 510 usable; block size 2 in the third octet' },
      { cmd: '/24', desc: '255.255.255.0 — 256 total, 254 usable; the classic LAN size' },
      { cmd: '/25', desc: '255.255.255.128 — 128 total, 126 usable; block size 128' },
      { cmd: '/26', desc: '255.255.255.192 — 64 total, 62 usable; block size 64' },
      { cmd: '/27', desc: '255.255.255.224 — 32 total, 30 usable; block size 32' },
      { cmd: '/28', desc: '255.255.255.240 — 16 total, 14 usable; block size 16' },
      { cmd: '/29', desc: '255.255.255.248 — 8 total, 6 usable; block size 8' },
      { cmd: '/30', desc: '255.255.255.252 — 4 total, 2 usable; point-to-point links' },
      { cmd: '/31', desc: '255.255.255.254 — RFC 3021 point-to-point exception, no usable-host subtraction' },
      { cmd: '/32', desc: '255.255.255.255 — a single host route' },
      { cmd: 'ipcalc 192.168.1.0/26', desc: 'print mask, network, broadcast and host range for any prefix' },
      { cmd: 'python3 -c "import ipaddress,sys; print(ipaddress.ip_network(sys.argv[1]).num_addresses - 2)" 192.168.1.0/26', desc: 'usable-host count without installing anything' }
    ]
  },
  {
    id: 'net-cs-03',
    title: 'Linux Network Commands',
    description: 'Interface, route, socket and troubleshooting commands used throughout the labs on the Linux lab VMs.',
    category: 'Fundamentals',
    entries: [
      { cmd: 'ip addr show dev eth1', desc: 'full detail for one interface' },
      { cmd: 'sudo ip addr add 192.168.56.50/24 dev eth1', desc: 'temporary address (lost on reboot)' },
      { cmd: 'sudo ip link set eth1 up', desc: 'bring an interface up' },
      { cmd: 'sudo ip route add 10.10.10.0/24 via 192.168.56.105', desc: 'static route toward a pivot' },
      { cmd: 'ss -tulpn', desc: 'who listens and which process (needs root for -p)' },
      { cmd: 'ss -tn state established', desc: 'current TCP conversations' },
      { cmd: 'sudo dhclient -v eth1', desc: 'request a DHCP lease manually' },
      { cmd: 'resolvectl status', desc: 'systemd-resolved DNS configuration' },
      { cmd: 'nmcli device show eth1', desc: 'per-device detail from NetworkManager' },
      { cmd: 'mtr -rw -c 20 8.8.8.8', desc: 'report-mode traceroute plus ping hybrid, 20 cycles' },
      { cmd: 'sudo tcpdump -i eth1 -nn arp', desc: 'watch ARP live' },
      { cmd: 'lsof -i -P -n', desc: 'open network sockets per process' },
      { cmd: 'sudo sysctl -w net.ipv4.ip_forward=1', desc: 'enable forwarding temporarily (lab routing/pivots)' },
      { cmd: 'nc -lvnp 9001', desc: 'quick TCP listener for lab tests' }
    ]
  },
  {
    id: 'net-cs-04',
    title: 'Nmap Scans',
    description: 'The flags that matter, in the order you normally use them: discovery, ports, versions, scripts, output.',
    category: 'Scanning',
    entries: [
      { cmd: 'nmap -sn 192.168.56.0/24', desc: 'host discovery only, no port scan' },
      { cmd: 'nmap -sT 192.168.56.10', desc: 'TCP connect scan — works unprivileged, works through SOCKS' },
      { cmd: 'sudo nmap -sS 192.168.56.10', desc: 'SYN half-open scan (root; default when root)' },
      { cmd: 'nmap -p- --min-rate 2000 192.168.56.10', desc: 'all 65535 TCP ports, fast' },
      { cmd: 'nmap -p 22,80,443,3389 192.168.56.10', desc: 'specific port list' },
      { cmd: 'nmap -sV --version-all 192.168.56.10', desc: 'version detection at max intensity' },
      { cmd: 'nmap -sC 192.168.56.10', desc: 'default NSE script set' },
      { cmd: 'sudo nmap -O --osscan-guess 192.168.56.10', desc: 'OS fingerprint (needs one open + one closed port)' },
      { cmd: 'sudo nmap -sU --top-ports 100 192.168.56.10', desc: 'UDP scan — slow, budget for it' },
      { cmd: 'nmap -Pn 192.168.56.10', desc: 'skip host discovery — scan even if ping fails' },
      { cmd: 'nmap -T4 -F 192.168.56.0/24', desc: 'faster timing, top-100 ports, whole subnet' },
      { cmd: 'nmap --script smb-enum-shares -p445 192.168.56.10', desc: 'run one NSE script' },
      { cmd: 'nmap --script vuln 192.168.56.10', desc: 'non-destructive vulnerability script category' },
      { cmd: 'nmap -oA lab_scan 192.168.56.10', desc: 'save normal, grepable and XML evidence at once' },
      { cmd: 'nmap -v --reason 192.168.56.10', desc: 'verbose with per-port verdict reasons' },
      { cmd: 'nmap -6 2001:db8::10', desc: 'IPv6 scan' }
    ]
  },
  {
    id: 'net-cs-05',
    title: 'Wireshark Display Filters',
    description: 'Display-filter syntax for the traffic you actually chase. Filters are lower-case protocol.field; strings use double quotes; and/or/not connect.',
    category: 'Packet Analysis',
    entries: [
      { cmd: 'http.request.method == "POST"', desc: 'form submissions — logins live here' },
      { cmd: 'http.request.uri contains "login"', desc: 'URIs mentioning login' },
      { cmd: 'http contains "password"', desc: 'any HTTP frame carrying the string' },
      { cmd: 'dns.flags.response == 0', desc: 'DNS queries only (not answers)' },
      { cmd: 'dns.qry.type == 16', desc: 'TXT record lookups' },
      { cmd: 'dns.qry.name contains "lab"', desc: 'queries for one domain' },
      { cmd: 'tcp.stream eq 3', desc: 'every packet of TCP stream 3' },
      { cmd: 'tcp.flags.syn == 1 and tcp.flags.ack == 0', desc: 'SYN packets — handshakes and scan noise' },
      { cmd: 'tcp.analysis.retransmission', desc: 'retransmissions — loss or injected traffic' },
      { cmd: 'arp.opcode == 2', desc: 'ARP replies (is-at announcements)' },
      { cmd: 'arp.duplicate-address-detected', desc: 'duplicate IP warning — possible spoofing' },
      { cmd: 'ip.addr == 192.168.56.10', desc: 'all traffic to/from one host' },
      { cmd: 'tls.handshake.type == 1', desc: 'ClientHello — SNI shows the visited hostname' },
      { cmd: 'icmp.type == 8', desc: 'echo requests' },
      { cmd: 'ftp.request.command == "PASS"', desc: 'cleartext FTP credentials' },
      { cmd: '!(arp or dns or icmp)', desc: 'traffic other than background noise' }
    ]
  },
  {
    id: 'net-cs-06',
    title: 'Netcat',
    description: 'Raw TCP/UDP connections in one line: banner grabs, listeners, file transfer. Prefer Ncat (Nmap project) when you need TLS.',
    category: 'Fundamentals',
    entries: [
      { cmd: 'nc -nv 192.168.56.10 21', desc: 'connect and read the greeting banner' },
      { cmd: 'printf "HEAD / HTTP/1.0\r\n\r\n" | nc -w 3 192.168.56.10 80', desc: 'send a raw HTTP request' },
      { cmd: 'nc -lvp 4444', desc: 'listen on TCP 4444' },
      { cmd: 'nc -zv 192.168.56.10 20-100', desc: 'TCP range probe (zero-I/O)' },
      { cmd: 'nc -u -zv 192.168.56.10 161', desc: 'UDP probe — silence is ambiguous' },
      { cmd: 'nc -lvp 4444 > received.bin', desc: 'receive a file (sender: nc 192.168.56.20 4444 < file.bin)' },
      { cmd: 'nc -w 5 -nv 192.168.56.10 80', desc: 'quit after 5 idle seconds' },
      { cmd: 'nc -6 -lvp 4444', desc: 'IPv6 listener' },
      { cmd: 'ncat --ssl -v 192.168.56.10 4444', desc: 'Ncat: TLS-encrypted session' },
      { cmd: 'ncat -l 4444 --exec "/bin/bash"', desc: 'serve a shell to one client — your own lab VM only' },
      { cmd: 'nc -lvnp 9001', desc: 'listen verbosely, numeric ports — the lab default' }
    ]
  },
  {
    id: 'net-cs-07',
    title: 'DNS Enumeration',
    description: 'dig-first DNS recon: record types, specific resolvers, reverse lookups and the zone-transfer attempt that should fail.',
    category: 'Enumeration',
    entries: [
      { cmd: 'dig example.com +short', desc: 'A records, answers only' },
      { cmd: 'dig @192.168.56.101 lab.local +short', desc: 'query a specific (lab) resolver' },
      { cmd: 'dig lab.local MX +short', desc: 'mail exchangers' },
      { cmd: 'dig lab.local NS +short', desc: 'name servers' },
      { cmd: 'dig lab.local TXT +short', desc: 'TXT records — SPF, verification strings' },
      { cmd: 'dig lab.local SOA +noall +answer', desc: 'SOA record with clean output' },
      { cmd: 'dig -x 192.168.56.10 +short', desc: 'reverse lookup (PTR)' },
      { cmd: 'dig lab.local AXFR @192.168.56.101', desc: 'zone transfer attempt — should be refused' },
      { cmd: 'dig +trace www.example.com', desc: 'walk delegation from the root servers' },
      { cmd: 'host -t mx example.com', desc: 'host(1) equivalent for quick checks' },
      { cmd: 'host -l lab.local 192.168.56.101', desc: 'host-based zone transfer attempt' },
      { cmd: 'nslookup -type=TXT example.com', desc: 'nslookup variant for Windows boxes' },
      { cmd: 'nmap --script dns-zone-transfer --script-args dns-zone-transfer.domain=lab.local -p 53 192.168.56.101', desc: 'NSE zone transfer check' }
    ]
  },
  {
    id: 'net-cs-08',
    title: 'SMB Enumeration',
    description: 'From share lists to user dumps: the smbclient/enum4linux/rpcclient trio plus NSE corroboration against lab Samba and Windows hosts.',
    category: 'Enumeration',
    entries: [
      { cmd: 'nmap -Pn -p 139,445 192.168.56.101', desc: 'confirm SMB is listening' },
      { cmd: 'smbclient -L //192.168.56.101 -N', desc: 'share list via null session' },
      { cmd: 'smbclient //192.168.56.101/public -N', desc: 'connect to a share (then ls, get, put)' },
      { cmd: 'smbclient //192.168.56.101/public -N -c "ls"', desc: 'one-shot command' },
      { cmd: 'smbclient //192.168.56.101/public -N -c "get flag.txt"', desc: 'download a file' },
      { cmd: 'smbclient -L //192.168.56.101 -U labuser', desc: 'authenticated listing (prompts for password)' },
      { cmd: 'enum4linux -a 192.168.56.101', desc: 'shares, users, groups, policy in one pass' },
      { cmd: 'rpcclient -U "" -N 192.168.56.101 -c "enumdomusers"', desc: 'raw RPC user dump via null session' },
      { cmd: 'nmap --script smb-enum-shares,smb-os-discovery -p445 192.168.56.101', desc: 'NSE corroboration' },
      { cmd: 'nmap --script smb-security-mode -p445 192.168.56.101', desc: 'check SMB signing requirements' },
      { cmd: 'nbtscan 192.168.56.0/24', desc: 'NetBIOS name sweep of the subnet' },
      { cmd: 'testparm -s /etc/samba/smb.conf', desc: 'server side: validate your lab Samba config' }
    ]
  },
  {
    id: 'net-cs-09',
    title: 'LDAP Enumeration',
    description: 'ldapsearch patterns for reading directories: root DSE first, then scoped, filtered and authenticated searches.',
    category: 'Enumeration',
    entries: [
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -b "dc=lab,dc=local" "(objectClass=*)"', desc: 'anonymous search of the whole tree' },
      { cmd: 'ldapsearch -x -s base -H ldap://192.168.56.101 -b "" namingContexts', desc: 'root DSE — discover the naming contexts' },
      { cmd: 'ldapsearch -x -LLL -H ldap://192.168.56.101 -b "dc=lab,dc=local" dn', desc: 'only DNs, clean LDIF' },
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -D "cn=admin,dc=lab,dc=local" -w Secret123 -b "dc=lab,dc=local"', desc: 'authenticated bind (lab credentials)' },
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -b "dc=lab,dc=local" "(objectClass=person)" cn mail uid', desc: 'filter for people, pick attributes' },
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -b "dc=lab,dc=local" "(objectClass=group)" cn member', desc: 'groups and members' },
      { cmd: 'ldapsearch -x -s one -H ldap://192.168.56.101 -b "dc=lab,dc=local"', desc: 'one-level scope' },
      { cmd: 'ldapsearch -x -H ldaps://192.168.56.101 -b "dc=lab,dc=local" -LLL', desc: 'LDAPS on 636' },
      { cmd: 'ldapsearch -x -ZZ -H ldap://192.168.56.101 -b "dc=lab,dc=local"', desc: 'require StartTLS' },
      { cmd: 'ldapwhoami -x -H ldap://192.168.56.101 -D "cn=admin,dc=lab,dc=local" -w Secret123', desc: 'verify a bind works' },
      { cmd: 'nmap -p389,636 --script ldap-rootdse 192.168.56.101', desc: 'NSE root-DSE disclosure check' }
    ]
  },
  {
    id: 'net-cs-10',
    title: 'Network Pentest Checklist',
    description: 'The engagement phases as commands, in order. Every step saves evidence (-oA, tee, redirection) — unrecorded steps did not happen.',
    category: 'Methodology',
    entries: [
      { cmd: 'echo "scope, ROE, contacts, windows" > engagement.md', desc: '0. Written scope and authorization before anything else' },
      { cmd: 'nmap -sn -oA 01_hosts 10.10.10.0/24', desc: '1. Host discovery with evidence' },
      { cmd: 'nmap -sV -sC -p- --min-rate 2000 -oA 02_ports <ip>', desc: '2. Full port and service scan per alive host' },
      { cmd: 'sudo nmap -sU --top-ports 50 -oA 03_udp <ip>', desc: '3. UDP pass — slow, budget it' },
      { cmd: 'searchsploit --nmap 02_ports.xml', desc: '4. Cross-reference versions with Exploit-DB' },
      { cmd: 'smbclient -L //<ip> -N', desc: '5. Null-session share check' },
      { cmd: 'enum4linux -a <ip>', desc: '6. SMB/RPC enumeration' },
      { cmd: 'dig @<dns> <domain> AXFR', desc: '7. Zone transfer attempt' },
      { cmd: 'nc -nv <ip> <port>', desc: '8. Manual banner confirmation of key services' },
      { cmd: 'snmpwalk -v2c -c public <ip>', desc: '9. SNMP default-community check' },
      { cmd: 'openssl s_client -connect <ip>:443', desc: '10. TLS certificate and handshake review' },
      { cmd: 'nmap --script vuln -oA 04_vuln <ip>', desc: '11. Non-destructive NSE vulnerability pass' },
      { cmd: 'grep -i CVE 04_vuln.nmap', desc: '12. Collect CVE references for triage' },
      { cmd: 'rpcclient -U "" -N <ip> -c enumdomusers', desc: '13. RPC null-session user list' },
      { cmd: 'pandoc report.md -o report.pdf', desc: '14. Render the deliverable: findings, CVSS, evidence, remediation, retest criteria' }
    ]
  },
  {
    id: 'net-cs-11',
    title: 'Internal Network Pentest Flow',
    description: 'Once you have a foothold: tunnel in, sweep adapted, enumerate SMB/LDAP, and handle credentials with lab-only discipline.',
    category: 'Methodology',
    entries: [
      { cmd: 'ssh -N -D 1080 user@pivot', desc: '1. Dynamic SOCKS tunnel via the foothold' },
      { cmd: 'proxychains4 nmap -sT -Pn --top-ports 100 -oA int_scan 10.10.10.0/24', desc: '2. Internal sweep — TCP connect only through SOCKS' },
      { cmd: 'proxychains4 enum4linux -a 10.10.10.20', desc: '3. Windows/Samba enumeration via proxy' },
      { cmd: 'proxychains4 smbclient -L //10.10.10.20 -N', desc: '4. Share hunting on internal servers' },
      { cmd: 'proxychains4 ldapsearch -x -H ldap://10.10.10.20 -b "dc=corp,dc=local"', desc: '5. Directory services when present' },
      { cmd: 'sudo responder -I eth1 -A', desc: '6. Poisoning analysis — analyze mode unless ROE explicitly allows more (lab)' },
      { cmd: 'hashcat -m 5600 hash.txt wordlist.txt', desc: '7. Crack captured NTLMv2 material (lab accounts only)' },
      { cmd: 'nxc smb 10.10.10.0/24 -u users.txt -p passwords.txt --continue-on-success', desc: '8. Password spraying (authorized engagements/labs only)' },
      { cmd: 'nmap -sT -Pn -p 3389 --open 10.10.10.0/24', desc: '9. RDP exposure map' },
      { cmd: 'ssh -N -L 445:10.10.10.20:445 user@pivot', desc: '10. Local forward for tools that cannot use SOCKS' },
      { cmd: 'chisel client <pivot>:8000 R:socks', desc: '11. SOCKS without SSH when only TCP egress exists' },
      { cmd: 'ip route', desc: '12. Document routes taken and segmentation boundaries observed' }
    ]
  },
  {
    id: 'net-cs-12',
    title: 'Pivoting and Tunneling',
    description: 'SSH forwards, SOCKS, chisel and ligolo-ng side by side — pick the smallest tunnel that does the job, then prove it works and tear it down.',
    category: 'Tunneling',
    entries: [
      { cmd: 'ssh -N -L 8080:10.10.10.20:80 user@pivot', desc: 'local forward: local 8080 to internal web via pivot' },
      { cmd: 'ssh -N -L 127.0.0.1:5432:10.10.10.30:5432 user@pivot', desc: 'bind to loopback only — the safer default' },
      { cmd: 'ssh -N -D 1080 user@pivot', desc: 'dynamic SOCKS5 proxy on local 1080' },
      { cmd: 'ssh -N -R 9000:127.0.0.1:8000 user@attacker', desc: 'reverse forward: expose an internal port on a remote host' },
      { cmd: 'ssh -J jump@192.168.56.105 user@10.10.10.20', desc: 'ProxyJump one-liner through a bastion' },
      { cmd: 'socks5 127.0.0.1 1080', desc: 'the proxychains4.conf line for the -D tunnel' },
      { cmd: 'proxychains4 nmap -sT -Pn 10.10.10.0/24', desc: 'sweep through SOCKS (connect scans only)' },
      { cmd: 'chisel server -p 8000 --reverse', desc: 'chisel server on the wide-access host' },
      { cmd: 'chisel client 192.168.56.105:8000 R:socks', desc: 'client opens a SOCKS port back on the server' },
      { cmd: './proxy -selfcert', desc: 'ligolo-ng: start the proxy/TUN side' },
      { cmd: './agent -connect 192.168.56.1:11601 -ignore-cert', desc: 'ligolo-ng: run the agent on the pivot' },
      { cmd: 'sudo ip route add 10.10.10.0/24 dev ligolo', desc: 'ligolo-ng: route the internal subnet into the TUN' },
      { cmd: 'socat TCP-LISTEN:2222,fork,reuseaddr TCP:10.10.10.20:22', desc: 'plain TCP forward on the pivot itself' },
      { cmd: 'ss -tnp | grep ssh', desc: 'verify which forwards are actually up' },
      { cmd: 'pkill -f "ssh -N -D"', desc: 'tear the tunnel down — leave no listeners behind' }
    ]
  }
];
