import React, { useState } from 'react';
import type { DiagramId } from '../../types';
import { Frame, Box, Arrow, Defs, Footnote, Node, Link, MONO, type DProps } from './shared';

// Network Security & Pentesting Academy — diagram library, part A.
// Addressing, subnetting, core protocols (ARP/TCP/UDP/DNS/DHCP) and the
// defensive placement diagrams (NAT, routing, segmentation, DMZ, IDS/IPS,
// zero trust, VPN). Same visual language as network.tsx.

// ---------------------------------------------------------------------------
// IPv4 addressing: network vs host portion + RFC1918 (interactive)
// ---------------------------------------------------------------------------

const IP_RANGES = [
  { label: '10.0.0.0/8', sub: '16,777,216 addresses', color: '#38bdf8', detail: 'RFC 1918 private block — 16.7M addresses. Big enterprise internals; never routed on the public internet.' },
  { label: '172.16.0.0/12', sub: '1,048,576 addresses', color: '#a78bfa', detail: 'RFC 1918 private block — about 1M addresses. The default inside cloud VPCs, Docker bridges and Kubernetes clusters.' },
  { label: '192.168.0.0/16', sub: '65,536 addresses', color: '#22e58c', detail: 'RFC 1918 private block — 65K addresses. Home routers and SOHO LANs; the class C you will scan first.' },
  { label: '127.0.0.1', sub: 'never leaves the host', color: '#fbbf24', detail: 'Loopback. Packets to 127.0.0.1 never touch the wire — test local services with no network involved.' }
];

const IP_OCTETS = [
  { v: '192', bin: '11000000', mask: '11111111' },
  { v: '168', bin: '10101000', mask: '11111111' },
  { v: '1', bin: '00000001', mask: '11111111' },
  { v: '10', bin: '00001010', mask: '00000000' }
];

function IpAddressing({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 350" h="340px">
        <Defs />
        <text x={258} y={52} textAnchor="middle" fill="#8b98a9" fontSize={11} fontFamily={MONO}>
          192.168.1.10/24 · mask 255.255.255.0
        </text>
        {IP_OCTETS.map((o, i) => {
          const x = 60 + i * 102;
          const net = i < 3;
          const c = net ? '#fbbf24' : '#22e58c';
          return (
            <g key={i}>
              <rect x={x} y={70} width={90} height={48} rx={7} fill={net ? 'rgba(251,191,36,0.07)' : 'rgba(34,229,140,0.07)'} stroke={c} />
              <text x={x + 45} y={100} textAnchor="middle" fill="#e6edf3" fontSize={14} fontFamily={MONO} fontWeight={700}>
                {o.v}
              </text>
              <text x={x + 45} y={140} textAnchor="middle" fill={c} fontSize={10} fontFamily={MONO}>
                {o.mask}
              </text>
              <text x={x + 45} y={158} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
                {o.bin}
              </text>
              {i < 3 && (
                <text x={x + 96} y={100} textAnchor="middle" fill="#8b98a9" fontSize={14} fontFamily={MONO}>
                  .
                </text>
              )}
            </g>
          );
        })}
        <text x={258} y={182} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
          mask bits on top · binary below — /24 = first 24 bits are network
        </text>
        <line x1={60} y1={202} x2={354} y2={202} stroke="#fbbf24" />
        <line x1={60} y1={202} x2={60} y2={210} stroke="#fbbf24" />
        <line x1={354} y1={202} x2={354} y2={210} stroke="#fbbf24" />
        <text x={207} y={226} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
          NETWORK · 192.168.1.0
        </text>
        <line x1={366} y1={202} x2={456} y2={202} stroke="#22e58c" />
        <line x1={366} y1={202} x2={366} y2={210} stroke="#22e58c" />
        <line x1={456} y1={202} x2={456} y2={210} stroke="#22e58c" />
        <text x={411} y={226} textAnchor="middle" fill="#22e58c" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
          HOST · .10
        </text>
        <text x={730} y={52} textAnchor="middle" fill="#8b98a9" fontSize={11} fontFamily={MONO}>
          SPECIAL RANGES
        </text>
        {IP_RANGES.map((r, i) => {
          const y = 70 + i * 52;
          return (
            <g key={r.label} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={580} y={y} width={300} height={44} rx={7} fill={r.color + '10'} stroke={sel === i ? '#22e58c' : r.color} strokeWidth={sel === i ? 2.2 : 1} />
              <text x={594} y={y + 18} fill="#e6edf3" fontSize={11.5} fontFamily={MONO} fontWeight={700}>
                {r.label}
              </text>
              <text x={594} y={y + 33} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
                {r.sub}
              </text>
            </g>
          );
        })}
        <Footnote y={335}>every address = network part (where) + host part (who) — the prefix length decides the split</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">{IP_RANGES[sel].label}</span>
          <p className="mt-1">{IP_RANGES[sel].detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Subnetting: /24 → /25 → /26
// ---------------------------------------------------------------------------

function Subnetting({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 350" h="340px">
      <Defs />
      <Box x={200} y={48} w={520} h={46} label="192.168.1.0/24" sub="256 addresses · 254 usable" />
      <Arrow x1={350} y1={94} x2={270} y2={132} label="borrow 1 bit" />
      <Arrow x1={570} y1={94} x2={650} y2={132} />
      <Box x={110} y={132} w={300} h={52} label="192.168.1.0/25" sub="hosts .1-.126 · bcast .127" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Box x={470} y={132} w={300} h={52} label="192.168.1.128/25" sub="hosts .129-.254 · bcast .255" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Arrow x1={240} y1={184} x2={150} y2={232} />
      <Arrow x1={300} y1={184} x2={360} y2={232} label="borrow 2 bits" />
      <Arrow x1={590} y1={184} x2={580} y2={232} />
      <Arrow x1={660} y1={184} x2={800} y2={232} />
      <Box x={50} y={232} w={190} h={52} label="192.168.1.0/26" sub="hosts .1-.62 · bcast .63" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={270} y={232} w={190} h={52} label="192.168.1.64/26" sub="hosts .65-.126 · bcast .127" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={490} y={232} w={190} h={52} label="192.168.1.128/26" sub="hosts .129-.190 · bcast .191" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={710} y={232} w={190} h={52} label="192.168.1.192/26" sub="hosts .193-.254 · bcast .255" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <text x={460} y={312} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        /24 → 254 hosts · /25 → 126 · /26 → 62 · usable = 2^(32 - prefix) - 2
      </text>
      <Footnote y={338}>the first address is the network, the last is broadcast — neither is assignable to a host</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// ARP request / reply flow across a switch
// ---------------------------------------------------------------------------

function ArpFlow({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 350" h="340px">
      <Defs />
      <Box x={60} y={40} w={190} h={52} label="HOST A" sub="192.168.1.10" />
      <Box x={365} y={40} w={190} h={52} label="SWITCH" sub="floods broadcasts" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Box x={670} y={40} w={190} h={52} label="HOST B" sub="192.168.1.20" />
      <line x1={155} y1={92} x2={155} y2={300} stroke="#1b2740" />
      <line x1={460} y1={92} x2={460} y2={300} stroke="#1b2740" />
      <line x1={765} y1={92} x2={765} y2={300} stroke="#1b2740" />
      <Arrow x1={155} y1={125} x2={460} y2={125} label="ARP REQUEST · who has 192.168.1.20?" />
      <Arrow x1={460} y1={155} x2={765} y2={155} label="flooded out every port" />
      <Arrow x1={765} y1={205} x2={460} y2={205} label="ARP REPLY · .20 is at aa:bb:cc:00:11:22" color="#22e58c" />
      <Arrow x1={460} y1={235} x2={155} y2={235} label="forwarded to Host A — unicast now" color="#22e58c" />
      <text x={60} y={278} fill="#22e58c" fontSize={10} fontFamily={MONO}>
        A cache: 192.168.1.20 = aa:bb:cc:00:11:22
      </text>
      <text x={860} y={278} textAnchor="end" fill="#22e58c" fontSize={10} fontFamily={MONO}>
        B cache: 192.168.1.10 = host A MAC
      </text>
      <Footnote y={322}>ARP maps IP to MAC on the local segment only — requests broadcast, replies unicast · spoofed replies = MITM</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// TCP vs UDP behaviour side by side
// ---------------------------------------------------------------------------

function TcpVsUdp({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 400" h="390px">
      <Defs />
      <rect x={40} y={60} width={400} height={290} rx={10} fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeDasharray="5 4" />
      <text x={240} y={52} textAnchor="middle" fill="#38bdf8" fontSize={11} fontFamily={MONO} fontWeight={700}>
        TCP · CONNECTION-ORIENTED
      </text>
      <rect x={480} y={60} width={400} height={290} rx={10} fill="rgba(167,139,250,0.04)" stroke="#a78bfa" strokeDasharray="5 4" />
      <text x={680} y={52} textAnchor="middle" fill="#a78bfa" fontSize={11} fontFamily={MONO} fontWeight={700}>
        UDP · CONNECTIONLESS
      </text>
      <text x={120} y={95} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>CLIENT</text>
      <text x={360} y={95} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>SERVER</text>
      <line x1={120} y1={100} x2={120} y2={330} stroke="#1b2740" />
      <line x1={360} y1={100} x2={360} y2={330} stroke="#1b2740" />
      <Arrow x1={120} y1={120} x2={360} y2={120} label="SYN" color="#22e58c" />
      <Arrow x1={360} y1={145} x2={120} y2={145} label="SYN-ACK" color="#22e58c" />
      <Arrow x1={120} y1={170} x2={360} y2={170} label="ACK · established" color="#22e58c" />
      <Arrow x1={120} y1={205} x2={360} y2={205} label="segment · seq=100" />
      <Arrow x1={360} y1={230} x2={120} y2={230} label="ACK 200 · ordered + guaranteed" />
      <Arrow x1={120} y1={265} x2={360} y2={265} label="FIN" color="#fbbf24" />
      <Arrow x1={360} y1={290} x2={120} y2={290} label="FIN-ACK" color="#fbbf24" />
      <Arrow x1={120} y1={315} x2={360} y2={315} label="ACK · closed" color="#fbbf24" />
      <text x={560} y={95} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>SENDER</text>
      <text x={800} y={95} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>RECEIVER</text>
      <line x1={560} y1={100} x2={560} y2={330} stroke="#1b2740" />
      <line x1={800} y1={100} x2={800} y2={330} stroke="#1b2740" />
      <Arrow x1={560} y1={130} x2={800} y2={130} label="datagram 1 · arrives" color="#a78bfa" />
      <Arrow x1={560} y1={165} x2={800} y2={165} label="datagram 2 · arrives" color="#a78bfa" />
      <Arrow x1={560} y1={200} x2={800} y2={200} label="datagram 3 · duplicated" color="#a78bfa" />
      <Arrow x1={560} y1={235} x2={700} y2={235} label="datagram 4 · LOST — no retransmit" color="#f87171" dashed />
      <Arrow x1={560} y1={270} x2={800} y2={270} label="datagram 5 · arrives" color="#a78bfa" />
      <text x={680} y={310} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        no handshake · no ordering · no delivery guarantee
      </text>
      <text x={680} y={330} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        DNS · DHCP · SNMP · QUIC · streaming
      </text>
      <Footnote y={388}>scan view: -sS closed=RST filtered=silence · -sU open ports often stay silent → open|filtered</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// DNS resolution walk: stub → resolver → root → TLD → authoritative
// ---------------------------------------------------------------------------

function DnsResolution({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 415" h="405px">
      <Defs />
      <Box x={20} y={40} w={120} h={50} label="CLIENT" sub="stub resolver" />
      <Box x={230} y={40} w={160} h={50} label="RESOLVER" sub="recursive · caches" />
      <Box x={455} y={40} w={150} h={50} label="ROOT SERVERS" sub="13 root systems" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Box x={630} y={40} w={140} h={50} label="TLD SERVERS" sub=".com registry" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={784} y={40} w={132} h={50} label="AUTH NS" sub="ns1.example.com" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <line x1={80} y1={90} x2={80} y2={362} stroke="#1b2740" />
      <line x1={310} y1={90} x2={310} y2={362} stroke="#1b2740" />
      <line x1={530} y1={90} x2={530} y2={362} stroke="#1b2740" />
      <line x1={700} y1={90} x2={700} y2={362} stroke="#1b2740" />
      <line x1={850} y1={90} x2={850} y2={362} stroke="#1b2740" />
      <Arrow x1={80} y1={130} x2={310} y2={130} label="1 · A? www.example.com" />
      <Arrow x1={310} y1={165} x2={530} y2={165} label="2 · who runs .com?" />
      <Arrow x1={530} y1={195} x2={310} y2={195} label="3 · TLD server list" />
      <Arrow x1={310} y1={230} x2={700} y2={230} label="4 · NS? example.com" />
      <Arrow x1={700} y1={260} x2={310} y2={260} label="5 · ns1.example.com" />
      <Arrow x1={310} y1={295} x2={850} y2={295} label="6 · A? www.example.com" />
      <Arrow x1={850} y1={325} x2={310} y2={325} label="7 · A 198.51.100.7" color="#22e58c" />
      <Arrow x1={310} y1={352} x2={80} y2={352} label="8 · 198.51.100.7 · cached" color="#22e58c" />
      <Footnote y={405}>every query leaks intent — DNS names the hosts you are probing · dig +trace replays the whole walk</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// DHCP DORA lease process
// ---------------------------------------------------------------------------

function DhcpProcess({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 335" h="325px">
      <Defs />
      <Box x={80} y={40} w={220} h={52} label="CLIENT" sub="0.0.0.0 · no lease yet" />
      <Box x={620} y={40} w={220} h={52} label="DHCP SERVER" sub="udp :67" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <line x1={190} y1={92} x2={190} y2={280} stroke="#1b2740" />
      <line x1={730} y1={92} x2={730} y2={280} stroke="#1b2740" />
      <Arrow x1={190} y1={125} x2={730} y2={125} label="DISCOVER · broadcast 255.255.255.255" />
      <Arrow x1={730} y1={160} x2={190} y2={160} label="OFFER · 192.168.1.50 · mask · gw · dns" color="#22e58c" />
      <Arrow x1={190} y1={195} x2={730} y2={195} label="REQUEST · broadcast — I accept that offer" color="#a78bfa" />
      <Arrow x1={730} y1={230} x2={190} y2={230} label="ACK · lease bound for 24h" color="#fbbf24" />
      <text x={460} y={264} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        client renews at 50% of the lease (T1) · all four messages ride on udp :67/:68
      </text>
      <Footnote y={312}>a rogue DHCP server on the same broadcast domain can hand out itself as gateway + dns — silent MITM</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Protocol / default port map (interactive)
// ---------------------------------------------------------------------------

const PROTOCOLS = [
  { p: 'FTP', port: '21', c: '#fbbf24', d: 'Cleartext file transfer. Sniff credentials, try anonymous login, look for writable upload dirs.' },
  { p: 'SSH', port: '22', c: '#38bdf8', d: 'Encrypted shell. Grab the banner, check algorithms and weak user names, credential spraying target.' },
  { p: 'SMTP', port: '25', c: '#22e58c', d: 'Mail transfer. Enumerate users with VRFY/EXPN, test open relay, spoofed internal phishing origin.' },
  { p: 'DNS', port: '53', c: '#22e58c', d: 'Name resolution. Try zone transfers (AXFR), cache snooping, version disclosure on Chaos/TXT.' },
  { p: 'DHCP', port: '67/68', c: '#22e58c', d: 'Address leasing. A rogue DHCP server hands victims a malicious gateway and DNS in one broadcast.' },
  { p: 'HTTP', port: '80', c: '#38bdf8', d: 'Plaintext web. Everything is visible: paths, cookies, headers. Put it behind your intercepting proxy.' },
  { p: 'POP3', port: '110', c: '#22e58c', d: 'Cleartext mail retrieval. Credentials cross the wire unless STARTTLS is enforced.' },
  { p: 'SNMP', port: '161', c: '#a78bfa', d: 'Device management. Default community strings public/private dump interfaces, routes and users.' },
  { p: 'LDAP', port: '389', c: '#a78bfa', d: 'Directory access. Anonymous binds, user enumeration, elevation paths through AD misconfigurations.' },
  { p: 'HTTPS', port: '443', c: '#38bdf8', d: 'TLS web. Intercept with a trusted proxy cert; review ciphers, cert hygiene and HSTS.' },
  { p: 'SMB', port: '445', c: '#fbbf24', d: 'Windows file sharing. Null sessions, share enumeration, NTLM relay, EternalBlue history.' },
  { p: 'RDP', port: '3389', c: '#fbbf24', d: 'Remote desktop. BlueKeep-class bugs, NLA bypasses, credential spraying on exposed gateways.' },
  { p: 'MySQL', port: '3306', c: '#fbbf24', d: 'Database. Default or empty passwords, unauthenticated access, UDF code execution paths.' },
  { p: 'WinRM', port: '5985/6', c: '#fbbf24', d: 'Remote management over HTTP(S). With valid creds it is the fastest lateral movement there is.' }
];

function ProtocolMap({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 285" h="275px">
        <Defs />
        <text x={460} y={44} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          COMMON SERVICES · DEFAULT PORTS
        </text>
        {PROTOCOLS.map((pr, i) => {
          const x = 30 + (i % 5) * 175;
          const y = 70 + Math.floor(i / 5) * 60;
          return (
            <g key={pr.p} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={x} y={y} width={160} height={46} rx={7} fill={pr.c + '12'} stroke={sel === i ? '#22e58c' : pr.c} strokeWidth={sel === i ? 2.2 : 1} />
              <text x={x + 12} y={y + 28} fill="#e6edf3" fontSize={12} fontFamily={MONO} fontWeight={700}>
                {pr.p}
              </text>
              <text x={x + 148} y={y + 28} textAnchor="end" fill={pr.c} fontSize={12} fontFamily={MONO} fontWeight={700}>
                {pr.port}
              </text>
            </g>
          );
        })}
        <Footnote y={270}>memorize these — 22/80/443 are the front door · 445, 3389, 5985 are where Windows usually falls</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
            {PROTOCOLS[sel].p} :{PROTOCOLS[sel].port}
          </span>
          <p className="mt-1">{PROTOCOLS[sel].d}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// NAT translation
// ---------------------------------------------------------------------------

function Nat({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 320" h="310px">
      <Defs />
      <Box x={60} y={70} w={200} h={56} label="INTERNAL HOST" sub="192.168.1.10 · :51000" />
      <Box x={370} y={70} w={180} h={66} label="NAT GATEWAY" sub="public 203.0.113.5" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={690} y={70} w={190} h={56} label="SERVER" sub="203.0.113.9 :443" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Arrow x1={260} y1={98} x2={370} y2={98} label="dst 203.0.113.9:443" />
      <Arrow x1={550} y1={98} x2={690} y2={98} label="src 203.0.113.5:40001" color="#22e58c" />
      <Arrow x1={690} y1={150} x2={550} y2={150} label="reply → 203.0.113.5:40001" color="#22e58c" />
      <Arrow x1={370} y1={150} x2={260} y2={150} label="rewritten → 192.168.1.10:51000" />
      <line x1={460} y1={136} x2={460} y2={200} stroke="#a78bfa" strokeDasharray="5 4" opacity={0.6} />
      <rect x={280} y={200} width={360} height={88} rx={8} fill="rgba(167,139,250,0.05)" stroke="#a78bfa" />
      <text x={460} y={222} textAnchor="middle" fill="#a78bfa" fontSize={11} fontFamily={MONO} fontWeight={700}>
        TRANSLATION TABLE
      </text>
      <text x={460} y={246} textAnchor="middle" fill="#e6edf3" fontSize={10.5} fontFamily={MONO}>
        192.168.1.10:51000 → 203.0.113.5:40001
      </text>
      <text x={460} y={268} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        192.168.1.11:52000 → 203.0.113.5:40002
      </text>
      <Footnote y={308}>unsolicited inbound packets to 203.0.113.5:40001 have no mapping → dropped — NAT hides internal hosts</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Routing: TTL decrement hop by hop
// ---------------------------------------------------------------------------

const ROUTE_HOPS = [
  { x: 110, label: 'HOST', sub: '192.168.1.10', color: '#38bdf8', chip: 'sent 64' },
  { x: 340, label: 'GW', sub: 'default gateway', color: '#fbbf24', chip: '→ 63' },
  { x: 560, label: 'ISP RTR', sub: 'carrier edge', color: '#a78bfa', chip: '→ 62' },
  { x: 800, label: 'DEST', sub: '198.51.100.0/24', color: '#22e58c', chip: '→ 61' }
];

function Routing({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 350" h="340px">
      <Defs />
      {ROUTE_HOPS.map((h, i) => (
        <g key={h.label}>
          <Node x={h.x} y={120} r={26} label={h.label} sub={h.sub} color={h.color} />
          {i < ROUTE_HOPS.length - 1 && <Link x1={h.x + 26} y1={120} x2={ROUTE_HOPS[i + 1].x - 26} y2={120} />}
          <rect x={h.x - 38} y={170} width={76} height={26} rx={13} fill={h.color + '10'} stroke={h.color} />
          <text x={h.x} y={187} textAnchor="middle" fill={h.color} fontSize={10} fontFamily={MONO}>
            {h.chip}
          </text>
        </g>
      ))}
      <Arrow x1={150} y1={98} x2={300} y2={98} label="hop 1" color="#38bdf8" />
      <Arrow x1={380} y1={98} x2={520} y2={98} label="hop 2" color="#38bdf8" />
      <Arrow x1={600} y1={98} x2={760} y2={98} label="hop 3" color="#38bdf8" />
      <text x={460} y={225} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        every router decrements TTL by 1 — at 0 the packet dies
      </text>
      <rect x={110} y={250} width={700} height={64} rx={8} fill="rgba(11,18,32,0.6)" stroke="#1b2740" />
      <text x={130} y={272} fill="#22e58c" fontSize={10.5} fontFamily={MONO}>
        $ traceroute 198.51.100.9
      </text>
      <text x={130} y={296} fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        1  192.168.1.1  0.4 ms    2  10.20.0.1  8.1 ms    3  198.51.100.9  12.6 ms
      </text>
      <Footnote y={340}>traceroute works because routers return ICMP time-exceeded when TTL hits 0 — each probe reveals one hop</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Flat network vs segmented network
// ---------------------------------------------------------------------------

function Segmentation({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 345" h="335px">
      <Defs />
      <rect x={40} y={70} width={380} height={240} rx={10} fill="rgba(248,113,113,0.04)" stroke="#f87171" strokeDasharray="6 4" />
      <text x={230} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        FLAT NETWORK
      </text>
      <text x={230} y={90} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        ONE broadcast domain — every host hears every ARP
      </text>
      <Node x={230} y={180} r={22} label="SW" sub="switch" color="#22e58c" />
      <Node x={120} y={115} r={18} label="WS-1" color="#38bdf8" />
      <Node x={120} y={245} r={18} label="WS-2" color="#38bdf8" />
      <Node x={340} y={115} r={18} label="SRV" color="#38bdf8" />
      <Node x={340} y={245} r={18} label="DB" color="#38bdf8" />
      <Link x1={135} y1={122} x2={212} y2={168} />
      <Link x1={135} y1={238} x2={212} y2={192} />
      <Link x1={325} y1={122} x2={248} y2={168} />
      <Link x1={325} y1={238} x2={248} y2={192} />
      <text x={230} y={296} textAnchor="middle" fill="#f87171" fontSize={10.5} fontFamily={MONO}>
        one compromised host = everything reachable
      </text>
      <rect x={500} y={70} width={380} height={240} rx={10} fill="rgba(34,229,140,0.04)" stroke="#22e58c" strokeDasharray="6 4" />
      <text x={690} y={58} textAnchor="middle" fill="#22e58c" fontSize={11} fontFamily={MONO} fontWeight={700}>
        SEGMENTED
      </text>
      <rect x={520} y={90} width={150} height={70} rx={8} fill="rgba(56,189,248,0.05)" stroke="#38bdf8" strokeDasharray="4 3" />
      <text x={595} y={112} textAnchor="middle" fill="#38bdf8" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        VLAN 10 · USERS
      </text>
      <circle cx={560} cy={138} r={8} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" />
      <circle cx={632} cy={138} r={8} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" />
      <rect x={520} y={200} width={150} height={70} rx={8} fill="rgba(34,229,140,0.05)" stroke="#22e58c" strokeDasharray="4 3" />
      <text x={595} y={222} textAnchor="middle" fill="#22e58c" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        VLAN 20 · SERVERS
      </text>
      <circle cx={560} cy={248} r={8} fill="rgba(34,229,140,0.2)" stroke="#22e58c" />
      <circle cx={632} cy={248} r={8} fill="rgba(34,229,140,0.2)" stroke="#22e58c" />
      <Node x={770} y={180} r={26} label="FW" sub="L3 · rules" color="#fbbf24" filled />
      <Link x1={670} y1={125} x2={748} y2={168} color="#38bdf8" />
      <Link x1={670} y1={235} x2={748} y2={192} color="#22e58c" />
      <Arrow x1={796} y1={180} x2={858} y2={180} label="policy" color="#fbbf24" />
      <text x={690} y={296} textAnchor="middle" fill="#22e58c" fontSize={10.5} fontFamily={MONO}>
        traffic between segments passes the firewall
      </text>
      <Footnote y={335}>flat: one phish = lateral movement is free · segmentation caps the blast radius at one segment</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// DMZ architecture with flow rules
// ---------------------------------------------------------------------------

function Dmz({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 315" h="305px">
      <Defs />
      <Node x={90} y={170} r={28} label="INTERNET" sub="untrusted" color="#f87171" />
      <Node x={205} y={170} r={26} label="FW1" sub="edge" color="#fbbf24" filled />
      <rect x={275} y={85} width={190} height={170} rx={10} fill="rgba(251,191,36,0.04)" stroke="#fbbf24" strokeDasharray="6 4" />
      <text x={370} y={105} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO} fontWeight={700}>
        DMZ
      </text>
      <Node x={370} y={145} r={22} label="WEB" sub="80/443" color="#fbbf24" />
      <Node x={370} y={215} r={22} label="MAIL" sub="25" color="#fbbf24" />
      <Node x={545} y={170} r={26} label="FW2" sub="internal" color="#fbbf24" filled />
      <rect x={615} y={85} width={265} height={170} rx={10} fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeDasharray="6 4" />
      <text x={747} y={105} textAnchor="middle" fill="#38bdf8" fontSize={11} fontFamily={MONO} fontWeight={700}>
        INTERNAL LAN
      </text>
      <Node x={710} y={150} r={22} label="WS" sub="clients" color="#38bdf8" />
      <Node x={795} y={215} r={22} label="DB" sub="data" color="#38bdf8" />
      <Link x1={118} y1={170} x2={179} y2={170} color="#f87171" />
      <Link x1={231} y1={170} x2={275} y2={170} color="#fbbf24" />
      <Link x1={465} y1={170} x2={519} y2={170} color="#fbbf24" />
      <Link x1={571} y1={170} x2={615} y2={170} color="#38bdf8" />
      <Arrow x1={120} y1={112} x2={340} y2={130} label="ALLOW 80/443" color="#22e58c" />
      <Arrow x1={120} y1={235} x2={344} y2={218} label="ALLOW 25" color="#22e58c" />
      <Arrow x1={390} y1={64} x2={740} y2={64} label="DMZ → INTERNAL: BLOCKED" color="#f87171" dashed />
      <Arrow x1={760} y1={272} x2={150} y2={272} label="INTERNAL → INTERNET: ALLOWED (stateful)" color="#22e58c" />
      <Footnote y={305}>tiers: outside touches only the DMZ · the DMZ cannot start connections inside · inside browses out freely</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Where each control sits: WAF, firewall, IDS (mirrored), IPS (inline)
// ---------------------------------------------------------------------------

function FirewallPlacement({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 375" h="365px">
      <Defs />
      <text x={40} y={70} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        a) perimeter path
      </text>
      <Node x={80} y={110} r={24} label="CLIENT" sub="browser" color="#38bdf8" />
      <Box x={160} y={85} w={110} h={50} label="WAF" sub="app layer" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Box x={330} y={85} w={130} h={50} label="FIREWALL" sub="L3/L4 rules" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Box x={560} y={85} w={130} h={50} label="WEB APP" sub=":443" />
      <Arrow x1={104} y1={110} x2={160} y2={110} />
      <Arrow x1={270} y1={110} x2={330} y2={110} />
      <Arrow x1={460} y1={110} x2={560} y2={110} />
      <Link x1={500} y1={113} x2={500} y2={215} color="#a78bfa" dashed />
      <text x={512} y={180} fill="#a78bfa" fontSize={9.5} fontFamily={MONO}>
        SPAN / mirror port — a copy only
      </text>
      <Box x={400} y={215} w={150} h={50} label="NIDS" sub="passive sensor" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={660} y={215} w={130} h={50} label="SIEM" sub="correlation" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Arrow x1={550} y1={240} x2={660} y2={240} label="alerts" color="#a78bfa" />
      <text x={40} y={285} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        b) inline prevention path
      </text>
      <Node x={80} y={320} r={20} label="CLIENT" color="#38bdf8" />
      <Box x={170} y={295} w={130} h={50} label="NIPS" sub="inline · active" stroke="#f87171" fill="rgba(248,113,113,0.06)" />
      <Box x={560} y={295} w={130} h={50} label="WEB APP" sub=":443" />
      <Arrow x1={100} y1={320} x2={170} y2={320} />
      <Arrow x1={300} y1={320} x2={560} y2={320} label="forwards clean · drops flagged" color="#f87171" />
      <Footnote y={362}>four jobs: WAF inspects payloads · firewall gates subnets · IDS watches copies · IPS enforces in-path</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// NIDS (passive) vs NIPS (inline)
// ---------------------------------------------------------------------------

function IdsIps({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      <rect x={40} y={70} width={400} height={230} rx={10} fill="rgba(167,139,250,0.04)" stroke="#a78bfa" strokeDasharray="6 4" />
      <text x={240} y={58} textAnchor="middle" fill="#a78bfa" fontSize={11} fontFamily={MONO} fontWeight={700}>
        NIDS · DETECTION
      </text>
      <Arrow x1={70} y1={115} x2={410} y2={115} label="production traffic — untouched" />
      <Link x1={240} y1={118} x2={240} y2={175} color="#a78bfa" dashed />
      <Box x={120} y={175} w={140} h={50} label="NIDS" sub="tap / SPAN copy" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Box x={310} y={175} w={100} h={50} label="SIEM" sub="alerts" stroke="#38bdf8" fill="rgba(56,189,248,0.06)" />
      <Arrow x1={260} y1={200} x2={310} y2={200} label="alert" color="#a78bfa" />
      <text x={240} y={266} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        attacker still reaches the target — detection happens on a copy
      </text>
      <rect x={480} y={70} width={400} height={230} rx={10} fill="rgba(248,113,113,0.04)" stroke="#f87171" strokeDasharray="6 4" />
      <text x={680} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        NIPS · PREVENTION
      </text>
      <Box x={600} y={95} w={120} h={50} label="NIPS" sub="in the path" stroke="#f87171" fill="rgba(248,113,113,0.06)" />
      <Arrow x1={510} y1={120} x2={600} y2={120} label="traffic" />
      <Arrow x1={720} y1={120} x2={860} y2={120} label="forwarded" color="#22e58c" />
      <Arrow x1={510} y1={205} x2={600} y2={205} label="flagged packet" color="#f87171" dashed />
      <line x1={680} y1={195} x2={700} y2={215} stroke="#f87171" strokeWidth={2.5} />
      <line x1={680} y1={215} x2={700} y2={195} stroke="#f87171" strokeWidth={2.5} />
      <text x={762} y={209} textAnchor="middle" fill="#f87171" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        dropped
      </text>
      <text x={680} y={266} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        one false positive = you block legitimate users — tune first
      </text>
      <Footnote y={325}>NIDS = safe visibility · NIPS = enforcement with self-inflicted outage risk · mature shops run both</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Traditional perimeter vs zero trust
// ---------------------------------------------------------------------------

function ZeroTrust({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 345" h="335px">
      <Defs />
      <rect x={40} y={70} width={380} height={230} rx={10} fill="rgba(248,113,113,0.03)" stroke="#f87171" strokeWidth={2} />
      <text x={230} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        TRADITIONAL PERIMETER
      </text>
      <Node x={120} y={170} r={20} label="USER" color="#38bdf8" />
      <Node x={250} y={120} r={20} label="APP" color="#a78bfa" />
      <Node x={250} y={220} r={20} label="DB" color="#a78bfa" />
      <Node x={350} y={170} r={20} label="FILES" color="#a78bfa" />
      <Link x1={137} y1={161} x2={234} y2={128} />
      <Link x1={137} y1={179} x2={234} y2={212} />
      <Link x1={267} y1={128} x2={333} y2={162} />
      <Link x1={267} y1={212} x2={333} y2={178} />
      <Link x1={250} y1={140} x2={250} y2={200} />
      <text x={230} y={280} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        hard shell, soft interior — past the wall = total access
      </text>
      <rect x={500} y={70} width={380} height={230} rx={10} fill="rgba(34,229,140,0.03)" stroke="#22e58c" strokeDasharray="6 4" />
      <text x={690} y={58} textAnchor="middle" fill="#22e58c" fontSize={11} fontFamily={MONO} fontWeight={700}>
        ZERO TRUST
      </text>
      <Node x={560} y={185} r={20} label="USER" color="#38bdf8" />
      <Box x={620} y={160} w={150} h={50} label="POLICY ENGINE" sub="verify each request" stroke="#22e58c" fill="rgba(34,229,140,0.08)" />
      <rect x={804} y={86} width={52} height={48} rx={6} fill="none" stroke="#a78bfa" strokeDasharray="3 3" />
      <rect x={804} y={161} width={52} height={48} rx={6} fill="none" stroke="#a78bfa" strokeDasharray="3 3" />
      <rect x={804} y={236} width={52} height={48} rx={6} fill="none" stroke="#a78bfa" strokeDasharray="3 3" />
      <Node x={830} y={110} r={18} label="APP" color="#a78bfa" />
      <Node x={830} y={185} r={18} label="DB" color="#a78bfa" />
      <Node x={830} y={260} r={18} label="FILES" color="#a78bfa" />
      <Arrow x1={580} y1={185} x2={620} y2={185} label="who?" color="#38bdf8" />
      <Arrow x1={770} y1={172} x2={806} y2={115} label="grant" color="#22e58c" />
      <Arrow x1={770} y1={185} x2={806} y2={185} label="least privilege" color="#22e58c" />
      <Arrow x1={770} y1={198} x2={806} y2={255} label="grant" color="#22e58c" />
      <text x={690} y={294} textAnchor="middle" fill="#22e58c" fontSize={9.5} fontFamily={MONO}>
        identity checks on every hop · micro-segments around each asset
      </text>
      <Footnote y={335}>the perimeter asks WHERE you are · zero trust asks WHO you are — never trust, always verify</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// VPN tunnels through the internet
// ---------------------------------------------------------------------------

function Vpn({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 330" h="320px">
      <Defs />
      <ellipse cx={460} cy={165} rx={110} ry={62} fill="rgba(56,189,248,0.03)" stroke="#1b2740" />
      <text x={460} y={160} textAnchor="middle" fill="#5b6b7f" fontSize={13} fontFamily={MONO} fontWeight={700}>
        INTERNET
      </text>
      <text x={460} y={180} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        untrusted
      </text>
      <Node x={120} y={85} r={26} label="REMOTE" sub="home worker" color="#38bdf8" />
      <Node x={120} y={245} r={26} label="BRANCH" sub="office LAN" color="#38bdf8" />
      <Node x={720} y={165} r={28} label="VPN GW" sub="203.0.113.5" color="#22e58c" filled />
      <rect x={790} y={95} width={110} height={140} rx={10} fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeDasharray="5 4" />
      <text x={845} y={115} textAnchor="middle" fill="#38bdf8" fontSize={10} fontFamily={MONO} fontWeight={700}>
        CORP
      </text>
      <Node x={845} y={155} r={16} label="FS" color="#38bdf8" />
      <Node x={845} y={205} r={16} label="DB" color="#38bdf8" />
      <Link x1={148} y1={78} x2={696} y2={148} color="#22e58c" dashed width={2} />
      <text x={420} y={92} textAnchor="middle" fill="#22e58c" fontSize={10} fontFamily={MONO}>
        encrypted tunnel (WireGuard / IPsec)
      </text>
      <Link x1={148} y1={252} x2={696} y2={182} color="#22e58c" dashed width={2} />
      <text x={420} y={238} textAnchor="middle" fill="#22e58c" fontSize={10} fontFamily={MONO}>
        encrypted tunnel
      </text>
      <Arrow x1={748} y1={165} x2={788} y2={165} label="decrypted" color="#22e58c" />
      <text x={300} y={305} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        the tunnel encapsulates + encrypts packets between the endpoints only
      </text>
      <Footnote y={325}>a VPN extends the trusted network across the internet — it is not a sandbox: the far end is the LAN</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const NETWORK_DIAGRAMS_A: Partial<Record<DiagramId, React.FC<DProps>>> = {
  'net-ip-addressing': IpAddressing,
  'net-subnetting': Subnetting,
  'net-arp-flow': ArpFlow,
  'net-tcp-vs-udp': TcpVsUdp,
  'net-dns-resolution': DnsResolution,
  'net-dhcp-process': DhcpProcess,
  'net-protocol-map': ProtocolMap,
  'net-nat': Nat,
  'net-routing': Routing,
  'net-segmentation': Segmentation,
  'net-dmz': Dmz,
  'net-firewall-placement': FirewallPlacement,
  'net-ids-ips': IdsIps,
  'net-zero-trust': ZeroTrust,
  'net-vpn': Vpn
};
