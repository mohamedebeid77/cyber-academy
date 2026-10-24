import type { Tool } from '../../../types';

// Network Security & Pentesting Academy — tool reference.
// Install lines use Debian/Ubuntu package managers (the lab VMs); every
// command is real documented syntax. Tools that can attack live networks
// (Responder in particular) are taught in labs only.

export const tools: Tool[] = [
  {
    id: 'nmap',
    image: 'nmap.png',
    imageCredit: 'Screenshot: Mrshaxas via Wikimedia Commons (CC0)',
    visual: 'scan',
    name: 'Nmap',
    category: 'Scanning',
    purpose:
      'The reference network scanner: host discovery, port scanning, service and version detection, OS fingerprinting and scriptable checks through the NSE. Nearly every network engagement starts and ends with it.',
    status: 'current',
    install: 'sudo apt install nmap (preinstalled on Kali; installers for Windows/macOS at nmap.org/download)',
    usage:
      'Scan in phases: discovery (-sn), ports (-p- or top ports), then detail (-sV -sC) against what answered. Unprivileged scans fall back to TCP connect mode; raw SYN and OS scans need root. Always save evidence with -oA so the scan can be parsed and reproduced.',
    commands: [
      { cmd: 'nmap -sn 192.168.56.0/24', desc: 'host discovery only, no port scan' },
      { cmd: 'nmap -sT 192.168.56.10', desc: 'TCP connect scan (works without root)' },
      { cmd: 'sudo nmap -sS 192.168.56.10', desc: 'SYN half-open scan — default TCP scan when root' },
      { cmd: 'nmap -p- --min-rate 2000 192.168.56.10', desc: 'all 65535 TCP ports, rate-limited for speed' },
      { cmd: 'nmap -sV --version-all 192.168.56.10', desc: 'service/version detection at maximum intensity' },
      { cmd: 'nmap -sC -sV 192.168.56.10', desc: 'default script set plus version detection' },
      { cmd: 'sudo nmap -sU --top-ports 50 192.168.56.10', desc: 'UDP scan of the 50 most common ports (slow; root)' },
      { cmd: 'sudo nmap -O --osscan-guess 192.168.56.10', desc: 'OS fingerprinting with aggressive guessing' },
      { cmd: 'nmap -Pn -p 22,80,443 192.168.56.10', desc: 'skip host discovery, scan a specific port list' },
      { cmd: 'nmap --script smb-enum-shares -p445 192.168.56.10', desc: 'run one NSE script against a service' }
    ],
    whenToUse: [
      'First contact with any lab subnet: map live hosts before touching ports',
      'Inventory open TCP/UDP services with versions as the base of a report',
      'Quick non-destructive vulnerability triage via NSE script categories',
      'Re-scan after remediation to verify the attack surface shrank'
    ],
    docsUrl: 'https://nmap.org/book/man.html',
    relatedLessons: ['n05-l03', 'n05-l04', 'n08-l02']
  },
  {
    id: 'wireshark',
    image: 'wireshark.png',
    imageCredit: 'Screenshot: SF007 via Wikimedia Commons (GPL)',
    visual: 'packets',
    name: 'Wireshark',
    category: 'Packet Analysis',
    purpose:
      'The standard graphical packet analyzer: capture live traffic or open PCAP files, dissect every protocol layer, filter with a rich display-filter language and follow TCP/UDP streams as readable conversations.',
    status: 'current',
    install: 'sudo apt install wireshark (answer yes to non-root capture, then add your user to the wireshark group)',
    usage:
      'Pick the right interface (on VMs the host-only adapter), capture, then work with display filters — the syntax is lower-case protocol.field with ==, contains and and/or/not. Follow > TCP Stream reassembles a session into readable text, and Expert Information surfaces retransmissions and anomalies.',
    commands: [
      { cmd: 'http.request.method == "POST"', desc: 'display filter: HTTP POST requests (form logins live here)' },
      { cmd: 'http.request.uri contains "login"', desc: 'URIs mentioning login' },
      { cmd: 'dns.qry.type == 16', desc: 'TXT record lookups' },
      { cmd: 'tcp.stream eq 3', desc: 'all packets of TCP stream 3' },
      { cmd: 'tcp.flags.syn == 1 and tcp.flags.ack == 0', desc: 'SYN packets — handshake starts and scan noise' },
      { cmd: 'arp.duplicate-address-detected', desc: 'duplicate IP alerts — possible ARP spoofing' },
      { cmd: 'tls.handshake.type == 1', desc: 'TLS ClientHello — hostname via SNI is visible here' },
      { cmd: 'ftp.request.command == "PASS"', desc: 'cleartext FTP credential submission' },
      { cmd: 'tshark -r lab.pcap -Y "http.request" -T fields -e http.request.full_uri', desc: 'CLI sibling: list every requested URL from a PCAP' }
    ],
    whenToUse: [
      'Analyzing a saved PCAP from a lab exercise (net-lab-03, net-ctf-03)',
      'Understanding a protocol you only know from textbooks — watch a real handshake',
      'Validating what an attack or tool actually put on the wire',
      'Teaching moment: nothing proves cleartext danger like reading a password from a stream'
    ],
    docsUrl: 'https://www.wireshark.org/docs/',
    relatedLessons: ['n06-l01', 'n06-l03', 'n06-l04']
  },
  {
    id: 'tcpdump',
    image: 'tcpdump.png',
    imageCredit: 'Screenshot via Wikimedia Commons (BSD license)',
    visual: 'terminal',
    name: 'tcpdump',
    category: 'Packet Analysis',
    purpose:
      'The command-line packet capture tool. Lighter than Wireshark and always present on servers, it captures to PCAP for later analysis and applies BPF filters efficiently — the tool of choice on boxes without a GUI.',
    status: 'current',
    install: 'sudo apt install tcpdump',
    usage:
      'Give it an interface (-i), a BPF filter expression, and either read packets live or write them with -w for Wireshark later. Use -n to skip DNS lookups (faster and quieter) and -nn to keep ports numeric too. Reading back with -A shows payload as ASCII.',
    commands: [
      { cmd: 'sudo tcpdump -i eth1 -n', desc: 'live capture on eth1, numeric addresses' },
      { cmd: 'sudo tcpdump -i eth1 -n -w lab.pcap', desc: 'write a PCAP for Wireshark analysis' },
      { cmd: 'tcpdump -r lab.pcap -nn', desc: 'read a capture back from the file' },
      { cmd: 'tcpdump -r lab.pcap -A | less', desc: 'dump ASCII payloads — banners and passwords visible' },
      { cmd: 'sudo tcpdump -i eth1 -n port 53', desc: 'watch DNS traffic only' },
      { cmd: 'sudo tcpdump -i eth1 -n host 192.168.56.10', desc: 'all traffic to/from one host' },
      { cmd: 'sudo tcpdump -i eth1 -nn -vvv udp port 161', desc: 'verbose SNMP capture (community strings visible in v1/v2c)' },
      { cmd: 'sudo tcpdump -i eth1 -c 100 -n', desc: 'capture exactly 100 packets and stop' }
    ],
    whenToUse: [
      'Capturing lab traffic for the PCAP exercises without leaving the terminal',
      'Quick live checks on headless VMs: is the traffic really there?',
      'Watching one protocol (ARP, DNS, SNMP) while a tool runs',
      'Producing evidence files for later Wireshark deep-dives'
    ],
    docsUrl: 'https://www.tcpdump.org/manpages/tcpdump.1.html',
    relatedLessons: ['n06-l01', 'n06-l02', 'n03-l04']
  },
  {
    id: 'netcat',
    image: 'netcat.png',
    imageCredit: 'Screenshot: Interiot via Wikimedia Commons (GPL)',
    visual: 'terminal',
    name: 'Netcat (nc)',
    category: 'Networking',
    purpose:
      'The TCP/UDP swiss army knife: raw connections, banner grabbing, quick listeners, file transfer and lab-only shell handling. The Nmap project maintains a hardened variant called Ncat (adds TLS and access control) which is the modern replacement to prefer.',
    status: 'current',
    install: 'sudo apt install ncat (Nmap project, recommended) or netcat-openbsd (traditional nc)',
    usage:
      'In client mode nc connects to a host and port and pipes stdin/stdout; in listen mode (-l -p) it waits for connections. Anything it reads or sends can be redirected to files, which makes one-line file transfer possible. For anything requiring TLS or stricter control, use ncat instead.',
    commands: [
      { cmd: 'nc -nv 192.168.56.10 21', desc: 'connect and read the greeting banner (v verbose, n no DNS)' },
      { cmd: 'nc -lvp 4444', desc: 'listen on TCP 4444 (server role)' },
      { cmd: 'nc -nv 192.168.56.10 80', desc: 'connect to a web port, then type GET / HTTP/1.0 and Enter twice' },
      { cmd: 'nc -zv 192.168.56.10 20-100', desc: 'quick TCP range probe (-z zero-I/O mode)' },
      { cmd: 'nc -lvp 4444 > received.bin', desc: 'receive a file (pair with: nc 192.168.56.20 4444 < file.bin)' },
      { cmd: 'nc -u -zv 192.168.56.10 161', desc: 'UDP probe — an empty result is ambiguous, by design' },
      { cmd: 'nc -w 5 -nv 192.168.56.10 80', desc: 'disconnect after 5 idle seconds' },
      { cmd: 'ncat --ssl -v 192.168.56.10 4444', desc: 'Ncat variant: TLS-encrypted session' },
      { cmd: 'ncat -l 4444 --exec "/bin/bash"', desc: 'serve a shell to one connecting client — lab-only, never on shared networks' }
    ],
    whenToUse: [
      'Banner grabbing any TCP service during enumeration',
      'Quick connectivity checks that go beyond ping (does the port talk?)',
      'Moving a file between lab VMs without setting up servers',
      'Simple lab listeners for tunnel and reverse-connection exercises'
    ],
    docsUrl: 'https://nmap.org/ncat/',
    relatedLessons: ['n03-l04', 'n07-l01', 'n07-l02']
  },
  {
    id: 'socat',
    visual: 'terminal',
    name: 'Socat',
    category: 'Networking',
    purpose:
      'A relay tool that connects two addresses — TCP to TCP, TCP to a process, TCP to TLS — with forking listeners. Where netcat is a pipe, socat is a pipe with fittings: port forwarding, protocol conversion and quick pivots.',
    status: 'current',
    install: 'sudo apt install socat',
    usage:
      'Every socat invocation is address1,address2: it reads from the first and writes to the second. TCP-LISTEN with fork serves multiple clients. EXEC runs a program per connection. OPENSSL wraps a leg in TLS. Lab use: it is the quickest way to demonstrate what a port forward really is.',
    commands: [
      { cmd: 'socat TCP-LISTEN:8080,fork,reuseaddr TCP:10.10.10.20:80', desc: 'port forward: local 8080 to an internal web server' },
      { cmd: 'socat TCP-LISTEN:2222,fork TCP:10.10.10.20:22', desc: 'expose an internal SSH port on the relay host' },
      { cmd: 'socat - TCP-LISTEN:9999', desc: 'plain interactive client to a remote listener' },
      { cmd: 'socat TCP-LISTEN:4444,fork OPENSSL:10.10.10.20:443,verify=0', desc: 'cleartext front-end to a TLS service (labs only)' },
      { cmd: 'socat UDP-LISTEN:5353,fork UDP:10.10.10.20:5353', desc: 'UDP forward example' },
      { cmd: 'socat TCP-LISTEN:9001,fork EXEC:"/bin/sh",stderr', desc: 'bind a shell to a port — lab-only, on your own VM' }
    ],
    whenToUse: [
      'Demonstrating port forwarding without SSH on the relay',
      'Bridging protocols (cleartext to TLS, TCP to a local program) in lab exercises',
      'Quick relays on a pivot VM during tunneling modules',
      'Temporary listeners while testing firewall behavior'
    ],
    docsUrl: 'http://www.dest-unreach.org/socat/',
    relatedLessons: ['n13-l01', 'n13-l03', 'n03-l04']
  },
  {
    id: 'dig',
    visual: 'terminal',
    name: 'dig',
    category: 'Networking',
    purpose:
      'The standard DNS lookup utility from BIND. dig gives full, readable answers with question, answer, authority and additional sections — the tool for querying records, resolvers and zone transfers.',
    status: 'current',
    install: 'sudo apt install dnsutils (bind9-dnsutils on newer Debian/Ubuntu)',
    usage:
      'dig [server] name [type]: name it queries, type the record (A, AAAA, MX, NS, TXT, SOA, PTR), and an @server to bypass your system resolver. Plus-flags shape the output: +short for scripts, +noall +answer for clean sections, +trace to walk delegation from the roots.',
    commands: [
      { cmd: 'dig example.com +short', desc: 'A records, just the answers' },
      { cmd: 'dig @192.168.56.101 lab.local', desc: 'query a specific (lab) resolver directly' },
      { cmd: 'dig example.com MX +short', desc: 'mail exchangers' },
      { cmd: 'dig example.com NS +short', desc: 'authoritative name servers' },
      { cmd: 'dig example.com TXT +short', desc: 'TXT records — SPF, verification, metadata' },
      { cmd: 'dig -x 192.168.56.10 +short', desc: 'reverse lookup (PTR)' },
      { cmd: 'dig lab.local AXFR @192.168.56.101', desc: 'zone transfer attempt (a misconfigured server leaks the whole zone)' },
      { cmd: 'dig +trace www.example.com', desc: 'walk the delegation chain from the root servers' },
      { cmd: 'dig example.com SOA +noall +answer', desc: 'SOA with a clean answer-only section' }
    ],
    whenToUse: [
      'DNS enumeration during recon: records, servers, zones',
      'Verifying lab DNS setups (dnsmasq zones, split-horizon experiments)',
      'Testing whether zone transfers are locked down',
      'Debugging name resolution before blaming the network'
    ],
    docsUrl: 'https://man7.org/linux/man-pages/man1/dig.1.html',
    relatedLessons: ['n03-l03', 'n02-l04', 'n05-l05']
  },
  {
    id: 'nslookup',
    visual: 'terminal',
    name: 'nslookup',
    category: 'Networking',
    purpose:
      'An interactive DNS query tool, still shipped with BIND and present on Windows. Less verbose control than dig but universal — the tool you will find on every platform, including Windows targets and admin workstations.',
    status: 'current',
    install: 'sudo apt install dnsutils (bind9-dnsutils on newer Debian/Ubuntu)',
    usage:
      'Two modes: one-shot (nslookup name [server]) and interactive (type nslookup, then use server and set type= commands). Fine for quick record checks and for demonstrating DNS behavior on Windows where dig is absent.',
    commands: [
      { cmd: 'nslookup example.com', desc: 'A record via your system resolver' },
      { cmd: 'nslookup example.com 192.168.56.101', desc: 'query a specific server' },
      { cmd: 'nslookup -type=MX example.com', desc: 'mail exchangers' },
      { cmd: 'nslookup -type=TXT example.com', desc: 'TXT records' },
      { cmd: 'nslookup -type=NS example.com', desc: 'name servers' },
      { cmd: 'nslookup 192.168.56.10', desc: 'reverse (PTR) lookup' },
      { cmd: 'nslookup -debug example.com', desc: 'verbose output showing the query/response details' }
    ],
    whenToUse: [
      'Quick record checks when dig is not installed (notably on Windows)',
      'Interactive sessions when testing several names against one server',
      'Cross-checking dig results with a second resolver client'
    ],
    docsUrl: 'https://man7.org/linux/man-pages/man1/nslookup.1.html',
    relatedLessons: ['n03-l03', 'n02-l04']
  },
  {
    id: 'traceroute',
    image: 'traceroute.png',
    imageCredit: 'Screenshot via Wikimedia Commons (GPL)',
    visual: 'terminal',
    name: 'traceroute',
    category: 'Networking',
    purpose:
      'Maps the path packets take to a destination by manipulating TTL values and listening for ICMP time-exceeded replies from each hop. The standard tool for reasoning about where traffic actually goes.',
    status: 'current',
    install: 'sudo apt install traceroute',
    usage:
      'UDP probes are the default; -I switches to ICMP and -T to TCP (useful when firewalls drop the first two). -n skips DNS per hop, which is faster and cleaner. Firewalls and MPLS make paths incomplete — treat missing hops as filtered, not absent.',
    commands: [
      { cmd: 'traceroute example.com', desc: 'default UDP-based path discovery' },
      { cmd: 'traceroute -n 192.168.56.10', desc: 'no DNS resolution per hop (faster, cleaner)' },
      { cmd: 'traceroute -I example.com', desc: 'ICMP echo probes instead of UDP' },
      { cmd: 'traceroute -T -p 443 example.com', desc: 'TCP probes to port 443 — through HTTP-allowing firewalls' },
      { cmd: 'traceroute -m 20 example.com', desc: 'raise the max hop count to 20' },
      { cmd: 'traceroute -w 2 -q 1 example.com', desc: '2s timeout, single probe per hop (fast scan)' }
    ],
    whenToUse: [
      'Understanding path and hop count between lab segments',
      'Diagnosing where connectivity stops (which hop goes dark)',
      'Comparing paths under different firewall rules'
    ],
    docsUrl: 'https://man7.org/linux/man-pages/man8/traceroute.8.html',
    relatedLessons: ['n03-l02', 'n01-l03']
  },
  {
    id: 'ping',
    image: 'ping.png',
    imageCredit: 'Screenshot: Tschaefer via Wikimedia Commons (CC0)',
    visual: 'terminal',
    name: 'ping',
    category: 'Networking',
    purpose:
      'Sends ICMP echo requests and measures whether a host answers and how fast. The first connectivity test everyone learns — and the first thing every analyst must remember can be blocked.',
    status: 'current',
    install: 'iputils-ping — preinstalled on virtually every distribution (sudo apt install iputils-ping)',
    usage:
      'ping host, ideally bounded with -c count. Watch the TTL in replies (64/128/255 minus hops hints at the OS family), and use -i to pace requests or -s to change payload size. No reply does not mean no host — it means no echo.',
    commands: [
      { cmd: 'ping -c 4 192.168.56.10', desc: 'four echo requests, then a summary' },
      { cmd: 'ping -c 4 example.com', desc: 'reachability plus name resolution in one shot' },
      { cmd: 'ping -i 0.2 -c 10 192.168.56.10', desc: 'faster interval (0.2s) — needs root below 0.2s' },
      { cmd: 'ping -s 1400 192.168.56.10', desc: '1400-byte payload — probe MTU/fragmentation behavior' },
      { cmd: 'ping -6 example.com', desc: 'IPv6 echo (ICMPv6)' },
      { cmd: 'ping -c 1 -W 2 192.168.56.77', desc: 'single probe, 2s timeout — quick sweep building block' }
    ],
    whenToUse: [
      'Basic reachability checks between lab VMs',
      'Host discovery sweeps (scripted -c 1 loops) before scanning',
      'Latency and loss baselining across a tunnel'
    ],
    docsUrl: 'https://man7.org/linux/man-pages/man8/ping.8.html',
    relatedLessons: ['n03-l02', 'n05-l02']
  },
  {
    id: 'curl',
    image: 'curl.png',
    imageCredit: 'Screenshot: Attys via Wikimedia Commons (CC BY-SA 3.0)',
    visual: 'terminal',
    name: 'curl',
    category: 'Web',
    purpose:
      'The universal URL-transfer tool: HTTP(S), FTP, and more, with full control over method, headers, body and TLS behavior. For a pentester it is the manual HTTP client — every request exactly as crafted, no browser magic.',
    status: 'current',
    install: 'sudo apt install curl',
    usage:
      'curl [options] URL. -I fetches only headers, -v shows the whole conversation including TLS, -X and -d build requests, -k skips certificate validation in labs. It also speaks FTP (curl ftp://host/ lists directories), which makes it a handy FTP client in a pinch.',
    commands: [
      { cmd: 'curl -I http://192.168.56.10/', desc: 'response headers only (HEAD)' },
      { cmd: 'curl -v http://192.168.56.10/', desc: 'verbose: request, response and TLS details' },
      { cmd: 'curl -X POST -d "user=labuser&pass=test" http://192.168.56.10/login', desc: 'form POST — the manual login request' },
      { cmd: 'curl -o page.html http://192.168.56.10/', desc: 'save the body to a file' },
      { cmd: 'curl -k https://192.168.56.10/', desc: 'skip TLS certificate validation (lab self-signed certs)' },
      { cmd: 'curl -u admin:password http://192.168.56.10/protected/', desc: 'HTTP Basic authentication' },
      { cmd: 'curl --http1.1 -I http://192.168.56.10/', desc: 'force HTTP/1.1 to see classic behavior' },
      { cmd: 'curl -H "X-Test: 1" http://192.168.56.10/', desc: 'add a custom header' },
      { cmd: 'curl ftp://192.168.56.10/', desc: 'list an FTP directory (and fetch files with a path)' }
    ],
    whenToUse: [
      'Manually testing HTTP services found by scanning',
      'Replaying and modifying requests during web-layer checks',
      'Fetching files over HTTP/FTP inside lab exercises',
      'Verifying a tunnel works end to end (curl through the forward)'
    ],
    docsUrl: 'https://curl.se/docs/',
    relatedLessons: ['n03-l03', 'n07-l03', 'n06-l04']
  },
  {
    id: 'wget',
    visual: 'terminal',
    name: 'wget',
    category: 'Web',
    purpose:
      'A non-interactive downloader built for fetching files and recursively mirroring sites. Where curl manipulates requests, wget retrieves content — ideal for pulling data from lab servers and crawlable directories.',
    status: 'current',
    install: 'sudo apt install wget',
    usage:
      'wget URL downloads a file. -O names the output, -i reads URLs from a list, and -r -np -l N crawls a directory tree staying under the given path. For lab self-signed certificates use --no-check-certificate.',
    commands: [
      { cmd: 'wget http://192.168.56.10/file.bin', desc: 'download a file' },
      { cmd: 'wget -O out.txt http://192.168.56.10/data.txt', desc: 'download and rename the output' },
      { cmd: 'wget -r -np -l 2 http://192.168.56.10/docs/', desc: 'crawl a directory tree, two levels, staying below /docs/' },
      { cmd: 'wget -q --show-progress http://192.168.56.10/big.iso', desc: 'quiet mode with a progress bar' },
      { cmd: 'wget --no-check-certificate https://192.168.56.10/', desc: 'ignore TLS certificate problems (labs only)' },
      { cmd: 'wget -i urls.txt', desc: 'download every URL listed in a file' },
      { cmd: 'wget --user-agent "Mozilla/5.0" http://192.168.56.10/', desc: 'send a custom User-Agent' }
    ],
    whenToUse: [
      'Pulling flag/evidence files from lab HTTP servers',
      'Mirroring a lab web root for offline analysis',
      'Scripted downloads from a URL list'
    ],
    docsUrl: 'https://www.gnu.org/software/wget/manual/',
    relatedLessons: ['n03-l03', 'n07-l03']
  },
  {
    id: 'netdiscover',
    visual: 'scan',
    name: 'netdiscover',
    category: 'Scanning',
    purpose:
      'Active and passive ARP-based host discovery on a local segment. It sends ARP requests across a range (or just listens) and maps IP/MAC/vendor — the quick layer-2 alternative to ping sweeps.',
    status: 'current',
    install: 'sudo apt install netdiscover',
    usage:
      'Give it a range (-r) and it ARP-scans the subnet, printing IP, MAC and vendor OUI — vendors immediately separate real hosts from printers and VMs. Passive mode (-p) emits nothing and merely records who announces itself; fast mode (-f) speeds the sweep. Needs root.',
    commands: [
      { cmd: 'sudo netdiscover -r 192.168.56.0/24', desc: 'active ARP sweep of the lab subnet' },
      { cmd: 'sudo netdiscover -i eth1 -r 192.168.56.0/24', desc: 'pin the interface (multi-homed hosts)' },
      { cmd: 'sudo netdiscover -p', desc: 'passive mode: listen only, transmit nothing' },
      { cmd: 'sudo netdiscover -r 192.168.56.0/24 -f', desc: 'fast scan mode' },
      { cmd: 'sudo netdiscover -l targets.txt', desc: 'scan a host list from a file' },
      { cmd: 'sudo netdiscover -s 1 -r 192.168.56.0/24', desc: '1s sleep between ARP requests — gentler on the segment' }
    ],
    whenToUse: [
      'Fast layer-2 inventory of a host-only lab subnet',
      'Silent reconnaissance with passive mode while baseline traffic flows',
      'Vendor identification (spotting hypervisor gateways and VM NICs)'
    ],
    docsUrl: 'https://github.com/netdiscover-scanner/netdiscover',
    relatedLessons: ['n05-l02', 'n01-l04']
  },
  {
    id: 'arp-scan',
    visual: 'scan',
    name: 'arp-scan',
    category: 'Scanning',
    purpose:
      'A focused ARP request tool: sends ARP packets to every address in a range and reports who answers, with MAC vendor lookup. Precise and noisy — the definitive way to prove which layer-2 neighbors exist.',
    status: 'current',
    install: 'sudo apt install arp-scan',
    usage:
      'Run as root against a range or --localnet and read the IP/MAC/vendor table. It works even when hosts block ICMP, because ARP must be answered for IP to function on a LAN. --retry tunes reliability on lossy virtual switches.',
    commands: [
      { cmd: 'sudo arp-scan --localnet', desc: 'ARP-scan the local subnet (shorthand: -l)' },
      { cmd: 'sudo arp-scan -I eth1 192.168.56.0/24', desc: 'scan a specific interface and range' },
      { cmd: 'sudo arp-scan 192.168.56.10', desc: 'single-host ARP probe' },
      { cmd: 'sudo arp-scan --localnet --retry=5', desc: 'five attempts per host for reliability' },
      { cmd: 'sudo arp-scan --localnet --ignoredups', desc: 'hide duplicate responses (IP conflict evidence)' },
      { cmd: 'sudo arp-scan --localnet --random', desc: 'scan targets in random order' }
    ],
    whenToUse: [
      'Authoritative host discovery on your own segment (net-lab-01)',
      'Cross-checking nmap -sn results at layer 2',
      'Detecting IP conflicts and unexpected neighbors in lab networks'
    ],
    docsUrl: 'https://github.com/royhills/arp-scan',
    relatedLessons: ['n05-l02', 'n01-l04']
  },
  {
    id: 'enum4linux',
    visual: 'terminal',
    name: 'enum4linux',
    category: 'Enumeration',
    purpose:
      'A Perl wrapper that drives Samba tools (smbclient, rpcclient, nmblookup) to enumerate Windows/Samba hosts: shares, users, groups, password policy, OS info. Its maintained successor is enum4linux-ng — same idea, rewritten in Python.',
    status: 'niche',
    install: 'sudo apt install enum4linux (requires the samba package for its underlying tools; enum4linux-ng is the modern rewrite)',
    usage:
      'enum4linux -a target does everything in one pass; individual flags (-U users, -S shares, -P policy) run single checks. Results depend on what the server allows: null sessions and guest access make it shine, hardening keeps it quiet.',
    commands: [
      { cmd: 'enum4linux -a 192.168.56.101', desc: 'full enumeration sweep' },
      { cmd: 'enum4linux -U 192.168.56.101', desc: 'user list via RPC' },
      { cmd: 'enum4linux -S 192.168.56.101', desc: 'share listing' },
      { cmd: 'enum4linux -G 192.168.56.101', desc: 'group/member enumeration' },
      { cmd: 'enum4linux -P 192.168.56.101', desc: 'password policy dump' },
      { cmd: 'enum4linux -o 192.168.56.101', desc: 'OS information' },
      { cmd: 'enum4linux -r 192.168.56.101', desc: 'RID cycling to find users' },
      { cmd: 'enum4linux -n 192.168.56.101', desc: 'NetBIOS name lookup' }
    ],
    whenToUse: [
      'One-command SMB/RPC enumeration of a lab Samba or Windows host (net-lab-05)',
      'Corroborating smbclient results with an independent tool',
      'Baseline checks of what null sessions expose'
    ],
    docsUrl: 'https://github.com/CiscoCXSecurity/enum4linux',
    relatedLessons: ['n07-l04', 'n10-l03', 'n12-l02']
  },
  {
    id: 'smbclient',
    visual: 'terminal',
    name: 'smbclient',
    category: 'Enumeration',
    purpose:
      'Samba\u2019s FTP-like client for SMB/CIFS: list shares, browse them, upload and download files. The manual, scriptable way to interact with SMB — everything enum-style tools do underneath.',
    status: 'current',
    install: 'sudo apt install smbclient',
    usage:
      'smbclient -L //host -N lists shares anonymously; smbclient //host/share -N opens an interactive session with FTP-style commands (ls, get, put, mkdir). The -c flag runs one command non-interactively — the scriptable form you will use through tunnels.',
    commands: [
      { cmd: 'smbclient -L //192.168.56.101 -N', desc: 'list shares with a null session (no password prompt)' },
      { cmd: 'smbclient //192.168.56.101/public -N', desc: 'connect to a share, then ls / get / put' },
      { cmd: 'smbclient //192.168.56.101/public -N -c "ls"', desc: 'one-shot command from the shell' },
      { cmd: 'smbclient //192.168.56.101/public -N -c "get flag.txt"', desc: 'download a file non-interactively' },
      { cmd: 'smbclient -L //192.168.56.101 -U labuser', desc: 'authenticated share listing (prompts for password)' },
      { cmd: 'smbclient //192.168.56.101/public -N -m SMB3', desc: 'force SMB3 protocol negotiation' },
      { cmd: 'rpcclient -U "" -N 192.168.56.101 -c "enumdomusers"', desc: 'sibling tool: raw RPC enumeration via null session' }
    ],
    whenToUse: [
      'Share hunting on Samba/Windows lab targets (net-lab-05, net-ctf-08)',
      'Anonymous/guest share access testing',
      'File transfer to and from SMB shares inside pivots'
    ],
    docsUrl: 'https://www.samba.org/samba/docs/current/man-html/smbclient.1.html',
    relatedLessons: ['n07-l04', 'n10-l03', 'n12-l02']
  },
  {
    id: 'ldapsearch',
    visual: 'terminal',
    name: 'ldapsearch',
    category: 'Enumeration',
    purpose:
      'The OpenLDAP command-line search client: queries directory services (OpenLDAP, Active Directory) with LDAP filters and returns LDIF. The tool for reading directories — naming contexts, users, groups, attributes.',
    status: 'current',
    install: 'sudo apt install ldap-utils',
    usage:
      'Key flags: -x simple auth, -H the LDAP URL, -b the base DN, -s the scope (base/one/sub), -D and -w for authenticated binds, -LLL for clean LDIF. Start with an anonymous search of the root DSE to discover naming contexts, then drill down with objectClass filters.',
    commands: [
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -b "dc=lab,dc=local" "(objectClass=*)"', desc: 'anonymous search of the whole tree' },
      { cmd: 'ldapsearch -x -s base -H ldap://192.168.56.101 -b "" namingContexts', desc: 'read the root DSE — discover naming contexts' },
      { cmd: 'ldapsearch -x -LLL -H ldap://192.168.56.101 -b "dc=lab,dc=local" dn', desc: 'only DNs, clean LDIF output' },
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -D "cn=admin,dc=lab,dc=local" -w Secret123 -b "dc=lab,dc=local" "(uid=*)"', desc: 'authenticated bind (lab credentials only)' },
      { cmd: 'ldapsearch -x -H ldap://192.168.56.101 -b "dc=lab,dc=local" "(objectClass=person)" cn mail uid', desc: 'filter for people, return chosen attributes' },
      { cmd: 'ldapsearch -x -H ldaps://192.168.56.101 -b "dc=lab,dc=local" -LLL', desc: 'same search over LDAPS (port 636)' },
      { cmd: 'ldapsearch -x -ZZ -H ldap://192.168.56.101 -b "dc=lab,dc=local"', desc: 'require StartTLS before binding' },
      { cmd: 'ldapwhoami -x -H ldap://192.168.56.101 -D "cn=admin,dc=lab,dc=local" -w Secret123', desc: 'verify the bind identity works' }
    ],
    whenToUse: [
      'Enumerating LDAP directories found on lab targets (port 389/636)',
      'Checking anonymous bind exposure — what does the directory tell strangers?',
      'Extracting user/group structures to understand a network\u2019s identity model'
    ],
    docsUrl: 'https://linux.die.net/man/1/ldapsearch',
    relatedLessons: ['n07-l04', 'n10-l04', 'n12-l02']
  },
  {
    id: 'responder',
    visual: 'terminal',
    name: 'Responder',
    category: 'Exploitation Support',
    purpose:
      'An LLMNR/NBT-NS/mDNS poisoner that answers name-resolution queries on a LAN and captures authentication material (NTLMv2 challenge-responses) from clients. Powerful and invasive: the concepts are taught lab-only in this academy, never against networks you do not own.',
    status: 'niche',
    install: 'sudo apt install responder (Kali) or git clone https://github.com/lgandx/Responder — lab environments only',
    usage:
      'Point it at a lab interface (responder -I eth1) and watch the log directory for captured hashes; -A runs analyze mode, which only listens and never poisons — the safe way to learn what the protocol chatter looks like. Captured NTLMv2 material is cracked offline (hashcat mode 5600) in the lab.',
    commands: [
      { cmd: 'sudo responder -I eth1 -A', desc: 'analyze mode: listen and log, no poisoning (start here)' },
      { cmd: 'sudo responder -I eth1', desc: 'full poisoning against your lab segment only' },
      { cmd: 'sudo responder -I eth1 -v', desc: 'verbose run for learning the protocol exchange' },
      { cmd: 'grep -ri NTLMv2 /usr/share/responder/logs/', desc: 'find captured hashes in the log directory (Kali path)' },
      { cmd: 'hashcat -m 5600 hash.txt wordlist.txt', desc: 'crack a captured NTLMv2 response (lab wordlist exercise)' },
      { cmd: 'ls /usr/share/responder/logs/', desc: 'captured challenge-responses accumulate here (Kali install path)' }
    ],
    whenToUse: [
      'Understanding Windows name-resolution abuse in a lab (module n09)',
      'Demonstrating why LLMNR/NBT-NS should be disabled on real networks',
      'Capture-and-crack exercises with your own lab accounts only'
    ],
    docsUrl: 'https://github.com/lgandx/Responder',
    relatedLessons: ['n09-l01', 'n09-l03', 'n09-l02']
  },
  {
    id: 'chisel',
    visual: 'tunnel',
    name: 'Chisel',
    category: 'Tunneling',
    purpose:
      'A fast TCP/UDP tunnel over HTTP, secured with TLS/SSH crypto. A single small binary acts as server or client and can open reverse SOCKS or port forwards — the go-to when SSH forwarding is unavailable on a pivot.',
    status: 'current',
    install: 'Download a release binary from github.com/jpillora/chisel/releases or go install github.com/jpillora/chisel@latest',
    usage:
      'Run a chisel server on the host with wider access (--reverse lets clients open ports back), then connect a client from the restricted side. R:socks asks the server to open a SOCKS5 listener; plain forwards map one port; reverse variants flip the direction. Pair the SOCKS listener with proxychains.',
    commands: [
      { cmd: 'chisel server -p 8000 --reverse', desc: 'server on the wide-access host, clients may open ports back' },
      { cmd: 'chisel client 192.168.56.105:8000 R:socks', desc: 'client on the pivot: SOCKS5 appears on the server side (port 1080)' },
      { cmd: 'chisel client 192.168.56.105:8000 8080:10.10.10.20:80', desc: 'client-side forward: local 8080 to internal web' },
      { cmd: 'chisel client 192.168.56.105:8000 R:3389:10.10.10.20:3389', desc: 'reverse forward: expose an internal RDP port on the server' },
      { cmd: 'proxychains4 nmap -sT -Pn 10.10.10.0/24', desc: 'use the chisel SOCKS port from the previous step' },
      { cmd: 'chisel client --tls-skip-verify https://192.168.56.105:8000 R:socks', desc: 'same tunnel over TLS with a self-signed cert (labs)' }
    ],
    whenToUse: [
      'Pivoting when the compromised host has no SSH server or forwarding is disabled',
      'Reverse tunnels: the restricted side dials out, ports appear on your box',
      'SOCKS access to an internal subnet through one small static binary'
    ],
    docsUrl: 'https://github.com/jpillora/chisel',
    relatedLessons: ['n13-l03', 'n13-l01', 'n12-l05']
  },
  {
    id: 'ligolo-ng',
    image: 'ligolo-ng.png',
    imageCredit: 'ligolo-ng project — github.com/nicocha30/ligolo-ng',
    visual: 'tunnel',
    name: 'Ligolo-ng',
    category: 'Tunneling',
    purpose:
      'A modern tunneling tool that uses a TUN interface instead of SOCKS: the agent on the target relays traffic and your host gets a virtual interface you can route into — meaning raw SYN scans and ordinary tools work without proxychains.',
    status: 'current',
    install: 'Download proxy and agent binaries from github.com/nicocha30/ligolo-ng/releases',
    usage:
      'Start the proxy on your machine (-selfcert for a self-signed cert), run the agent binary on the target pointing back at you, then in the proxy REPL select the session (session), inspect its networks (ifconfig) and start the relay (start). Add an ip route for the internal subnet via the ligolo interface and the subnet behaves like it is local.',
    commands: [
      { cmd: './proxy -selfcert', desc: 'start the proxy/TUN side on your machine' },
      { cmd: './agent -connect 192.168.56.1:11601 -ignore-cert', desc: 'run the agent on the pivot, dialing back to the proxy' },
      { cmd: 'session', desc: 'proxy REPL: list and select the connected agent' },
      { cmd: 'ifconfig', desc: 'proxy REPL: show the agent\u2019s network interfaces' },
      { cmd: 'start', desc: 'proxy REPL: begin relaying the selected session' },
      { cmd: 'sudo ip route add 10.10.10.0/24 dev ligolo', desc: 'route the internal subnet into the TUN interface' },
      { cmd: 'sudo nmap -sS -Pn 10.10.10.0/24', desc: 'raw scans work — no proxychains needed through ligolo' }
    ],
    whenToUse: [
      'Pivots where you want real raw-socket scanning on the internal subnet',
      'Multiple nested subnets: route entries instead of proxy chains',
      'Teaching the difference between SOCKS relays and TUN-based tunneling'
    ],
    docsUrl: 'https://github.com/nicocha30/ligolo-ng',
    relatedLessons: ['n13-l03', 'n13-l04', 'n12-l05']
  },
  {
    id: 'proxychains',
    visual: 'tunnel',
    name: 'Proxychains',
    category: 'Tunneling',
    purpose:
      'A preload shim that forces TCP traffic of any program through a SOCKS4/5 or HTTP proxy list. The glue between a SOCKS tunnel (ssh -D, chisel) and tools that cannot speak proxies themselves.',
    status: 'current',
    install: 'sudo apt install proxychains4',
    usage:
      'Configure the proxy in /etc/proxychains4.conf (a socks5 127.0.0.1 1080 line for a local dynamic SSH tunnel), then prefix commands: proxychains4 nmap ... Only TCP connect operations survive the proxy — SYN scans and UDP do not. -q silences the banner; -f points at an alternative config.',
    commands: [
      { cmd: 'socks5 127.0.0.1 1080', desc: 'the config line to add to /etc/proxychains4.conf' },
      { cmd: 'proxychains4 nmap -sT -Pn 10.10.10.0/24', desc: 'sweep an internal subnet through the SOCKS tunnel' },
      { cmd: 'proxychains4 smbclient -L //10.10.10.30/ -N', desc: 'SMB enumeration through the pivot' },
      { cmd: 'proxychains4 curl http://10.10.10.20/', desc: 'quick connectivity check through the proxy' },
      { cmd: 'proxychains4 -q ssh labuser@10.10.10.20', desc: 'quiet mode for interactive sessions' },
      { cmd: 'proxychains4 -f /tmp/alt.conf nmap -sT -Pn 10.10.10.0/24', desc: 'use an alternative proxy config file' }
    ],
    whenToUse: [
      'Routing enumeration tools through an ssh -D or chisel SOCKS port',
      'Internal-network sweeps during pivot labs (net-lab-08)',
      'Any tool lacking native proxy support that only needs TCP'
    ],
    docsUrl: 'https://github.com/haad/proxychains',
    relatedLessons: ['n13-l03', 'n13-l01', 'n14-l02']
  },
  {
    id: 'searchsploit',
    visual: 'terminal',
    name: 'Searchsploit',
    category: 'Exploitation Support',
    purpose:
      'The command-line client for the Exploit-DB archive: search public exploits and papers by product and version, copy entries locally, and even feed it Nmap XML to cross-reference what your scans found.',
    status: 'current',
    install: 'sudo apt install exploitdb (provides searchsploit; Kali preinstalls and updates it with exploitdb-git)',
    usage:
      'searchsploit <terms> searches titles and paths; results show an ID you can examine (-x), copy to the current directory (-m), or open on the web (-w). --nmap scan.xml turns version detection output into candidate exploit lists. Read every exploit before running it — verification is your job.',
    commands: [
      { cmd: 'searchsploit vsftpd 2.3.4', desc: 'search by product and version' },
      { cmd: 'searchsploit -t "smb"', desc: 'title-only search' },
      { cmd: 'searchsploit -x 34965', desc: 'examine an entry before touching it' },
      { cmd: 'searchsploit -m 34965', desc: 'mirror (copy) an exploit into the current directory' },
      { cmd: 'searchsploit --nmap report_scan.xml', desc: 'cross-reference Nmap XML output with the archive' },
      { cmd: 'searchsploit -w openssh 7', desc: 'show Exploit-DB web URLs for results' },
      { cmd: 'searchsploit -p 34965', desc: 'print the local file path of an entry' }
    ],
    whenToUse: [
      'Turning version fingerprints from scans into candidate vulnerability lists',
      'Validating that a suspected CVE has public code before reporting it',
      'Offline research during lab exercises (net-lab-09)'
    ],
    docsUrl: 'https://www.exploit-db.com/searchsploit',
    relatedLessons: ['n08-l01', 'n08-l04', 'n08-l02']
  }
];
