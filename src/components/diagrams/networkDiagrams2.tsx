import React from 'react';
import type { DiagramId } from '../../types';
import { Frame, Box, Arrow, Defs, Footnote, Node, Link, MONO, type DProps } from './shared';

// Network Security & Pentesting Academy — diagram library, part B.
// Methodology flows (recon, enumeration, vuln assessment, full pipeline),
// traffic analysis (packet anatomy, capture), attack concepts (ARP/DNS
// spoofing, L2, credential attacks) and internal movement (tunneling,
// SOCKS, topology, attack paths). Same visual language as network.tsx.

// ---------------------------------------------------------------------------
// Recon workflow: passive → scope → active discovery → service scan → notes
// ---------------------------------------------------------------------------

function ReconWorkflow({ interactive }: DProps) {
  const steps = [
    { label: 'PASSIVE RECON', sub: 'OSINT · DNS · certs', tool: 'whois · dig · crt.sh' },
    { label: 'SCOPING', sub: 'what is in bounds', tool: 'scope + ROE' },
    { label: 'HOST DISCOVERY', sub: 'live host sweeps', tool: 'nmap -sn 10.0.0.0/24' },
    { label: 'SERVICE SCAN', sub: 'ports · versions', tool: 'nmap -sV -sC' },
    { label: 'DOCUMENT', sub: 'notes · evidence', tool: 'write it down now' }
  ];
  const w = 156;
  const gap = 24;
  return (
    <Frame vb="0 0 920 235" h="225px">
      <Defs />
      <text x={196} y={36} textAnchor="middle" fill="#22e58c" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        PASSIVE · NO TARGET CONTACT
      </text>
      <text x={646} y={36} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        ACTIVE · PACKETS HIT THE TARGET
      </text>
      {steps.map((s, i) => {
        const x = 28 + i * (w + gap);
        return (
          <g key={s.label}>
            <Box
              x={x}
              y={52}
              w={w}
              h={64}
              label={s.label}
              sub={s.sub}
              stroke={i < 2 ? '#22e58c' : '#38bdf8'}
              fill={(i < 2 ? '#22e58c' : '#38bdf8') + '10'}
            />
            {i < steps.length - 1 && <Arrow x1={x + w} y1={84} x2={x + w + gap} y2={84} />}
            <text x={x + w / 2} y={142} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
              {s.tool}
            </text>
          </g>
        );
      })}
      <line x1={380} y1={48} x2={380} y2={150} stroke="#fbbf24" strokeDasharray="4 4" opacity={0.7} />
      <Footnote y={222}>passive recon leaves no trace — the moment you sweep, the clock starts and the SOC can see you</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// TCP scan flags: what each probe's reply tells you
// ---------------------------------------------------------------------------

function TcpScanFlags({ interactive }: DProps) {
  const rows = [
    {
      name: 'SYN SCAN',
      cmd: 'nmap -sS · half-open',
      probe: 'SYN',
      color: '#38bdf8',
      outcomes: [
        { flag: 'SYN/ACK', fc: '#22e58c', text: 'open — we reply RST, no full handshake' },
        { flag: 'RST', fc: '#f87171', text: 'closed — host answers, nothing listening' },
        { flag: 'silence', fc: '#fbbf24', text: 'filtered — a firewall dropped it' }
      ]
    },
    {
      name: 'ACK SCAN',
      cmd: 'nmap -sA · map the rules',
      probe: 'ACK',
      color: '#a78bfa',
      outcomes: [
        { flag: 'RST', fc: '#22e58c', text: 'unfiltered — reachable, state unknown' },
        { flag: 'silence', fc: '#fbbf24', text: 'filtered — a stateful device ate it' }
      ]
    },
    {
      name: 'FIN / NULL / XMAS',
      cmd: 'nmap -sF -sN -sX',
      probe: 'FIN',
      color: '#22e58c',
      outcomes: [
        { flag: 'RST', fc: '#f87171', text: 'closed — or Windows (always RSTs these)' },
        { flag: 'silence', fc: '#fbbf24', text: 'open|filtered on RFC-compliant stacks' }
      ]
    }
  ];
  return (
    <Frame vb="0 0 920 430" h="420px">
      <Defs />
      <text x={262} y={20} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        PROBE
      </text>
      <text x={383} y={20} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        REPLY
      </text>
      <text x={434} y={20} fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        WHAT IT TELLS YOU
      </text>
      {rows.map((r, ri) => {
        const ty = 34 + ri * 128;
        return (
          <g key={r.name}>
            <Box x={30} y={ty} w={170} h={58} label={r.name} sub={r.cmd} stroke={r.color} fill={r.color + '10'} small />
            <rect x={230} y={ty + 15} width={64} height={28} rx={6} fill="rgba(230,237,243,0.06)" stroke="#8b98a9" />
            <text x={262} y={ty + 33} textAnchor="middle" fill="#e6edf3" fontSize={11} fontFamily={MONO} fontWeight={700}>
              {r.probe}
            </text>
            {r.outcomes.map((o, oi) => {
              const oy = r.outcomes.length === 3 ? ty + oi * 28 : ty + 8 + oi * 36;
              return (
                <g key={o.flag + oi}>
                  <Arrow x1={294} y1={ty + 29} x2={340} y2={oy + 12} color={o.fc} />
                  <rect x={344} y={oy} width={78} height={24} rx={6} fill={o.fc + '12'} stroke={o.fc} />
                  <text x={383} y={oy + 16} textAnchor="middle" fill={o.fc} fontSize={9.5} fontFamily={MONO} fontWeight={700}>
                    {o.flag}
                  </text>
                  <text x={434} y={oy + 16} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
                    {o.text}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <Footnote y={415}>
        pick by situation: -sS is the default · -sA maps firewall rules · -sF/-sN/-sX only dodge naive logging
      </Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Packet anatomy: nested Ethernet / IP / TCP / payload with real fields
// ---------------------------------------------------------------------------

function PacketAnatomy({ interactive }: DProps) {
  const layers = [
    { x: 180, y: 40, w: 560, h: 230, title: 'ETHERNET II · FRAME', fields: 'dst MAC | src MAC | EtherType 0x0800 | payload | FCS', color: '#fbbf24' },
    { x: 200, y: 88, w: 520, h: 170, title: 'IPv4 HEADER · PACKET', fields: 'TTL 64 | proto 6 (TCP) | src 192.168.1.10 | dst 198.51.100.7', color: '#a78bfa' },
    { x: 220, y: 136, w: 480, h: 110, title: 'TCP HEADER · SEGMENT', fields: 'sport 51000 | dport 443 | flags [SYN] | seq 0', color: '#38bdf8' }
  ];
  const left = [
    { t: 'FRAME', y: 66, x: 180, c: '#fbbf24' },
    { t: 'PACKET', y: 114, x: 200, c: '#a78bfa' },
    { t: 'SEGMENT', y: 162, x: 220, c: '#38bdf8' },
    { t: 'DATA', y: 210, x: 240, c: '#22e58c' }
  ];
  return (
    <Frame vb="0 0 920 330" h="320px">
      <Defs />
      {layers.map((l) => (
        <g key={l.title}>
          <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={7} fill={l.color + '0a'} stroke={l.color} />
          <text x={l.x + 14} y={l.y + 20} fill={l.color} fontSize={10.5} fontFamily={MONO} fontWeight={700}>
            {l.title}
          </text>
          <text x={l.x + 14} y={l.y + 35} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
            {l.fields}
          </text>
        </g>
      ))}
      <rect x={240} y={184} width={440} height={50} rx={7} fill="rgba(34,229,140,0.08)" stroke="#22e58c" />
      <text x={254} y={202} fill="#22e58c" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        PAYLOAD
      </text>
      <text x={254} y={218} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        HTTP request bytes · TLS ciphertext · DNS query
      </text>
      {left.map((l) => (
        <g key={l.t}>
          <text x={95} y={l.y + 4} textAnchor="middle" fill={l.c} fontSize={10} fontFamily={MONO} fontWeight={700}>
            {l.t}
          </text>
          <line x1={128} y1={l.y} x2={l.x} y2={l.y} stroke={l.c} opacity={0.6} />
        </g>
      ))}
      <Arrow x1={800} y1={250} x2={800} y2={60} label="decapsulate ↑" />
      <text x={460} y={294} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        captured: Frame 1 · 66 bytes · eth:ip:tcp · 192.168.1.10:51000 → 198.51.100.7:443 [SYN]
      </text>
      <Footnote y={316}>display filters reach every field (tcp.flags.syn==1) — capture filters only keep what the kernel decides</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Capture pipeline: NIC → BPF → ring buffer → dump → display filter → analysis
// ---------------------------------------------------------------------------

function CapturePipeline({ interactive }: DProps) {
  const steps = [
    { label: 'NIC', sub: 'wire → driver', hint: 'promiscuous mode' },
    { label: 'CAPTURE FILTER', sub: 'BPF · in kernel', hint: 'tcpdump host 10.0.0.5' },
    { label: 'RING BUFFER', sub: 'libpcap · memory', hint: 'small buffer = drops' },
    { label: 'DUMP FILE', sub: 'written to disk', hint: '.pcap / .pcapng' },
    { label: 'DISPLAY FILTER', sub: 'after capture', hint: 'http.request' },
    { label: 'ANALYSIS', sub: 'read the traffic', hint: 'follow TCP stream' }
  ];
  const w = 120;
  const gap = 30;
  return (
    <Frame vb="0 0 920 252" h="242px">
      <Defs />
      {steps.map((s, i) => {
        const x = 25 + i * (w + gap);
        return (
          <g key={s.label}>
            <Box x={x} y={44} w={w} h={64} label={s.label} sub={s.sub} stroke={i < 4 ? '#38bdf8' : '#22e58c'} fill={(i < 4 ? '#38bdf8' : '#22e58c') + '10'} small />
            {i < steps.length - 1 && <Arrow x1={x + w} y1={76} x2={x + w + gap} y2={76} />}
            <text x={x + w / 2} y={132} textAnchor="middle" fill="#5b6b7f" fontSize={9} fontFamily={MONO}>
              {s.hint}
            </text>
          </g>
        );
      })}
      <rect x={110} y={156} width={700} height={54} rx={8} fill="rgba(11,18,32,0.6)" stroke="#1b2740" />
      <text x={460} y={178} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        capture filter = BPF in the kernel — rejected packets never touch the disk
      </text>
      <text x={460} y={198} textAnchor="middle" fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
        .pcap = classic · pcapng = comments, multiple interfaces, per-packet timestamps
      </text>
      <Footnote y={238}>capture filter decides what exists · display filter only reshuffles what you kept — check drops before trusting</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Enumeration workflow branching from an open SMB port
// ---------------------------------------------------------------------------

function EnumerationWorkflow({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 380" h="370px">
      <Defs />
      <Box x={30} y={40} w={170} h={54} label="PORT 445 OPEN" sub="SMB · reachable" />
      <Arrow x1={200} y1={67} x2={260} y2={67} />
      <Box x={260} y={40} w={180} h={54} label="FINGERPRINT SMB" sub="dialects · signing?" />
      <Box x={500} y={18} w={200} h={50} label="NULL SESSION" sub="anonymous · no creds" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Box x={500} y={98} w={200} h={50} label="SHARE LIST" sub="enum4linux · cme" />
      <Arrow x1={440} y1={60} x2={500} y2={40} />
      <Arrow x1={440} y1={74} x2={500} y2={120} />
      <Box x={740} y={56} w={170} h={54} label="SHARE CHECKS" sub="readable? writable?" />
      <Arrow x1={700} y1={43} x2={740} y2={72} color="#22e58c" />
      <Arrow x1={700} y1={123} x2={740} y2={98} />
      <Box x={730} y={148} w={190} h={50} label="CREDS FOUND?" sub="spray · sniff · crack" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Arrow x1={825} y1={110} x2={825} y2={148} />
      <Box x={725} y={226} w={200} h={50} label="VALIDATE ACCESS" sub="log in · check privileges" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <Arrow x1={825} y1={198} x2={825} y2={226} />
      <Box x={725} y={304} w={200} h={46} label="DOCUMENT" sub="shots · notes" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Arrow x1={825} y1={276} x2={825} y2={304} />
      <Arrow x1={560} y1={148} x2={360} y2={180} dashed color="#fbbf24" />
      <rect x={50} y={180} width={580} height={150} rx={8} fill="rgba(11,18,32,0.6)" stroke="#1b2740" />
      <text x={70} y={206} fill="#fbbf24" fontSize={11} fontFamily={MONO} fontWeight={700}>
        PER-SHARE CHECKLIST
      </text>
      <text x={70} y={230} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        readable? pull a real file — prove the data matters
      </text>
      <text x={70} y={250} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        writable? drop a test file — instant impact proof
      </text>
      <text x={70} y={270} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        names leak teams and projects → phishing intel
      </text>
      <text x={70} y={290} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        SYSVOL on DCs: GPP cpassword · login scripts
      </text>
      <Footnote y={368}>a readable share is a finding · a writable share is usually a foothold — both belong in the report</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Vulnerability assessment workflow with false-positive filter
// ---------------------------------------------------------------------------

function VulnWorkflow({ interactive }: DProps) {
  const steps = [
    { label: 'ENUMERATE', sub: 'versions · banners', tool: 'nmap -sV · whatweb' },
    { label: 'MATCH CVEs', sub: 'known weaknesses', tool: 'searchsploit · NVD' },
    { label: 'RANK', sub: 'CVSS + context', tool: 'impact × reach' },
    { label: 'VALIDATE', sub: 'prove it manually', tool: 'safe PoC' },
    { label: 'REPORT', sub: 'evidence + fix', tool: 'repro steps' }
  ];
  const w = 156;
  const gap = 24;
  return (
    <Frame vb="0 0 920 275" h="265px">
      <Defs />
      {steps.map((s, i) => {
        const x = 28 + i * (w + gap);
        return (
          <g key={s.label}>
            <Box
              x={x}
              y={52}
              w={w}
              h={64}
              label={s.label}
              sub={s.sub}
              stroke={i < 4 ? '#38bdf8' : '#22e58c'}
              fill={(i < 4 ? '#38bdf8' : '#22e58c') + '10'}
            />
            {i < steps.length - 1 && <Arrow x1={x + w} y1={84} x2={x + w + gap} y2={84} />}
            <text x={x + w / 2} y={138} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
              {s.tool}
            </text>
          </g>
        );
      })}
      <Arrow x1={690} y1={164} x2={646} y2={116} dashed color="#f87171" />
      <rect x={580} y={164} width={316} height={72} rx={8} fill="rgba(248,113,113,0.05)" stroke="#f87171" />
      <text x={738} y={186} textAnchor="middle" fill="#f87171" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        FALSE-POSITIVE FILTER
      </text>
      <text x={738} y={204} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        banner version ≠ what actually runs
      </text>
      <text x={738} y={220} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        EOL finding? confirm reachability first
      </text>
      <rect x={28} y={170} width={520} height={66} rx={8} fill="rgba(11,18,32,0.6)" stroke="#1b2740" />
      <text x={48} y={194} fill="#22e58c" fontSize={10} fontFamily={MONO}>
        $ searchsploit apache 2.4.49
      </text>
      <text x={48} y={216} fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        → CVE-2021-41773 path traversal — CONFIRMED on target
      </text>
      <Footnote y={262}>CVSS is a number — exploitability on THIS network is the real score: report only what you proved</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// ARP spoofing: normal vs poisoned (lab-only concept)
// ---------------------------------------------------------------------------

function ArpSpoofing({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 350" h="340px">
      <Defs />
      <text x={460} y={30} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        LAB-ONLY CONCEPT — RUN THIS ON YOUR OWN LAB ONLY
      </text>
      <rect x={40} y={70} width={400} height={235} rx={10} fill="rgba(34,229,140,0.03)" stroke="#22e58c" strokeDasharray="6 4" />
      <text x={240} y={58} textAnchor="middle" fill="#22e58c" fontSize={11} fontFamily={MONO} fontWeight={700}>
        NORMAL ARP
      </text>
      <Node x={110} y={150} r={20} label="A" sub="192.168.1.10" />
      <Node x={240} y={200} r={22} label="SW" sub="switch" color="#22e58c" />
      <Node x={370} y={150} r={20} label="B" sub="192.168.1.20" />
      <Link x1={126} y1={158} x2={226} y2={188} />
      <Link x1={254} y1={188} x2={354} y2={158} />
      <Arrow x1={138} y1={118} x2={342} y2={118} label="frames flow directly A → B" color="#22e58c" />
      <text x={240} y={290} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        CAM tables clean — switch forwards unicast
      </text>
      <rect x={480} y={70} width={400} height={235} rx={10} fill="rgba(248,113,113,0.03)" stroke="#f87171" strokeDasharray="6 4" />
      <text x={680} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        ARP SPOOFED
      </text>
      <Node x={550} y={150} r={20} label="A" sub="192.168.1.10" />
      <Node x={810} y={150} r={20} label="B" sub="192.168.1.20" />
      <Node x={680} y={215} r={24} label="M" sub="attacker" color="#f87171" filled />
      <Link x1={565} y1={161} x2={662} y2={203} color="#f87171" width={2} />
      <Link x1={698} y1={203} x2={795} y2={161} color="#f87171" width={2} />
      <Arrow x1={566} y1={138} x2={664} y2={196} label="traffic" color="#f87171" />
      <Arrow x1={696} y1={196} x2={794} y2={138} color="#f87171" />
      <text x={680} y={258} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        M → A: "B is-at M-MAC" · M → B: "A is-at M-MAC"
      </text>
      <text x={680} y={276} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        both caches poisoned by gratuitous replies
      </text>
      <text x={680} y={294} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        attacker M is now on-path (MITM)
      </text>
      <Footnote y={336}>defenses: Dynamic ARP Inspection + static ARP · detection: ARP cache churn and MAC flaps in switch logs</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// DNS spoofing: the spoofed reply wins the race (lab-only concept)
// ---------------------------------------------------------------------------

function DnsSpoofing({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 365" h="355px">
      <Defs />
      <Box x={40} y={40} w={180} h={52} label="CLIENT" sub="stub resolver" />
      <Box x={370} y={40} w={190} h={52} label="RESOLVER" sub="recursive · caches" />
      <Box x={710} y={40} w={180} h={52} label="ATTACKER" sub="sniffs + forges" stroke="#f87171" fill="rgba(248,113,113,0.06)" />
      <line x1={130} y1={92} x2={130} y2={310} stroke="#1b2740" />
      <line x1={465} y1={92} x2={465} y2={310} stroke="#1b2740" />
      <line x1={800} y1={92} x2={800} y2={310} stroke="#1b2740" />
      <Arrow x1={130} y1={130} x2={465} y2={130} label="1 · A? bank.example" />
      <Arrow x1={300} y1={160} x2={800} y2={160} label="2 · query overheard — attacker races a reply" color="#fbbf24" dashed />
      <Arrow x1={800} y1={205} x2={130} y2={205} label="3 · forged: bank.example = 198.51.100.66" color="#f87171" />
      <text x={465} y={225} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        arrives FIRST — the poisoned answer wins the race
      </text>
      <Arrow x1={465} y1={260} x2={130} y2={260} label="4 · real answer 203.0.113.20 — too late" color="#8b98a9" dashed />
      <text x={297} y={282} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        the forged record is already cached
      </text>
      <text x={460} y={330} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        victim lands on 198.51.100.66 — a lookalike phishing host
      </text>
      <Footnote y={352}>fixes: DNSSEC signs answers · DoT/DoH encrypt the query so there is nothing to race · lab-only</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Layer-2 attacks: MAC flooding + VLAN hopping
// ---------------------------------------------------------------------------

function L2Attacks({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 350" h="340px">
      <Defs />
      <rect x={40} y={70} width={400} height={240} rx={10} fill="rgba(248,113,113,0.03)" stroke="#f87171" strokeDasharray="6 4" />
      <text x={240} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        MAC FLOODING
      </text>
      <Node x={120} y={150} r={26} label="SW" sub="switch" color="#22e58c" />
      <Node x={310} y={100} r={17} label="WS" />
      <Node x={310} y={170} r={17} label="SRV" />
      <Node x={310} y={245} r={17} label="M" color="#f87171" filled />
      <Link x1={143} y1={140} x2={293} y2={105} />
      <Link x1={146} y1={155} x2={293} y2={168} />
      <Link x1={143} y1={160} x2={293} y2={240} color="#f87171" dashed width={2} />
      <text x={425} y={232} textAnchor="end" fill="#f87171" fontSize={9} fontFamily={MONO}>
        1000s of fake src MACs/s
      </text>
      <Link x1={120} y1={176} x2={145} y2={215} color="#fbbf24" dashed />
      <rect x={60} y={215} width={170} height={55} rx={7} fill="rgba(11,18,32,0.7)" stroke="#fbbf24" />
      <text x={145} y={237} textAnchor="middle" fill="#fbbf24" fontSize={10} fontFamily={MONO} fontWeight={700}>
        CAM TABLE
      </text>
      <text x={145} y={255} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        overflow: 50k fakes
      </text>
      <text x={240} y={296} textAnchor="middle" fill="#fbbf24" fontSize={9.5} fontFamily={MONO}>
        table full → switch floods unknown frames to ALL ports
      </text>
      <rect x={480} y={70} width={400} height={240} rx={10} fill="rgba(251,191,36,0.03)" stroke="#fbbf24" strokeDasharray="6 4" />
      <text x={680} y={58} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO} fontWeight={700}>
        VLAN HOPPING
      </text>
      <Node x={530} y={110} r={17} label="M" color="#f87171" filled />
      <Node x={615} y={165} r={24} label="SW1" color="#a78bfa" />
      <Node x={800} y={165} r={24} label="SW2" color="#a78bfa" />
      <Node x={860} y={105} r={15} label="WS" />
      <Link x1={545} y1={118} x2={598} y2={153} color="#f87171" width={2} />
      <Link x1={639} y1={165} x2={776} y2={165} color="#a78bfa" width={2.5} />
      <Link x1={820} y1={152} x2={849} y2={113} color="#a78bfa" width={2.5} />
      <text x={707} y={152} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily={MONO}>
        trunk · tagged
      </text>
      <rect x={510} y={220} width={110} height={26} rx={6} fill="rgba(251,191,36,0.1)" stroke="#fbbf24" />
      <text x={565} y={237} textAnchor="middle" fill="#fbbf24" fontSize={9.5} fontFamily={MONO}>
        tag 10 (native)
      </text>
      <Arrow x1={624} y1={233} x2={640} y2={233} color="#8b98a9" />
      <rect x={640} y={220} width={110} height={26} rx={6} fill="rgba(167,139,250,0.1)" stroke="#a78bfa" />
      <text x={695} y={237} textAnchor="middle" fill="#a78bfa" fontSize={9.5} fontFamily={MONO}>
        inner · VLAN 20
      </text>
      <Arrow x1={754} y1={233} x2={770} y2={233} color="#8b98a9" />
      <rect x={770} y={220} width={90} height={26} rx={6} fill="rgba(139,152,169,0.08)" stroke="#8b98a9" />
      <text x={815} y={237} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        payload
      </text>
      <text x={680} y={272} textAnchor="middle" fill="#a78bfa" fontSize={9.5} fontFamily={MONO}>
        SW1 strips the outer (native) tag → frame lands inside VLAN 20
      </text>
      <text x={680} y={290} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        attacker M needs only an access port on VLAN 10
      </text>
      <Footnote y={336}>defenses: port security, DAI, disable auto-trunking — tag the native VLAN or set it to an unused ID</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Credential attacks: sniffing vs spraying vs brute force
// ---------------------------------------------------------------------------

function CredAttacks({ interactive }: DProps) {
  const users = ['a.adams', 'b.brown', 'c.clarke'];
  const passes = ['Passw0rd!', 'Summer24!', 'Qazxsw21'];
  return (
    <Frame vb="0 0 920 332" h="322px">
      <Defs />
      <rect x={30} y={70} width={280} height={220} rx={10} fill="rgba(251,191,36,0.03)" stroke="#fbbf24" strokeDasharray="6 4" />
      <text x={170} y={58} textAnchor="middle" fill="#fbbf24" fontSize={11} fontFamily={MONO} fontWeight={700}>
        SNIFFING
      </text>
      <Box x={55} y={85} w={230} h={44} label="CLEARTEXT LOGIN" sub="telnet · ftp · http" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Arrow x1={170} y1={129} x2={170} y2={152} color="#fbbf24" />
      <rect x={55} y={152} width={230} height={58} rx={7} fill="rgba(11,18,32,0.7)" stroke="#1b2740" />
      <text x={70} y={176} fill="#fbbf24" fontSize={10} fontFamily={MONO}>
        &gt; USER admin
      </text>
      <text x={70} y={196} fill="#fbbf24" fontSize={10} fontFamily={MONO}>
        &gt; PASS secret123
      </text>
      <text x={170} y={238} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        anyone on-path reads every byte
      </text>
      <text x={170} y={256} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        kill it: TLS / SSH everywhere
      </text>
      <rect x={330} y={70} width={280} height={220} rx={10} fill="rgba(167,139,250,0.03)" stroke="#a78bfa" strokeDasharray="6 4" />
      <text x={470} y={58} textAnchor="middle" fill="#a78bfa" fontSize={11} fontFamily={MONO} fontWeight={700}>
        PASSWORD SPRAYING
      </text>
      <rect x={345} y={150} width={90} height={30} rx={6} fill="rgba(167,139,250,0.1)" stroke="#a78bfa" />
      <text x={390} y={169} textAnchor="middle" fill="#e6edf3" fontSize={9.5} fontFamily={MONO} fontWeight={700}>
        Password1!
      </text>
      {users.map((u, i) => (
        <g key={u}>
          <rect x={480} y={95 + i * 55} width={115} height={30} rx={6} fill="rgba(56,189,248,0.06)" stroke="#38bdf8" />
          <text x={537} y={114 + i * 55} textAnchor="middle" fill="#e6edf3" fontSize={9.5} fontFamily={MONO}>
            {u}
          </text>
          <Arrow x1={435} y1={165} x2={478} y2={110 + i * 55} color="#a78bfa" />
        </g>
      ))}
      <text x={470} y={262} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        one common password × many users
      </text>
      <text x={470} y={280} textAnchor="middle" fill="#fbbf24" fontSize={9.5} fontFamily={MONO}>
        pace it — lockouts alert the blue team
      </text>
      <rect x={630} y={70} width={280} height={220} rx={10} fill="rgba(248,113,113,0.03)" stroke="#f87171" strokeDasharray="6 4" />
      <text x={770} y={58} textAnchor="middle" fill="#f87171" fontSize={11} fontFamily={MONO} fontWeight={700}>
        BRUTE FORCE
      </text>
      {passes.map((p, i) => (
        <g key={p}>
          <rect x={645} y={95 + i * 55} width={110} height={30} rx={6} fill="rgba(248,113,113,0.08)" stroke="#f87171" />
          <text x={700} y={114 + i * 55} textAnchor="middle" fill="#e6edf3" fontSize={9.5} fontFamily={MONO}>
            {p}
          </text>
          <Arrow x1={755} y1={110 + i * 55} x2={788} y2={160} color="#f87171" />
        </g>
      ))}
      <rect x={790} y={148} width={105} height={34} rx={6} fill="rgba(248,113,113,0.1)" stroke="#f87171" />
      <text x={842} y={169} textAnchor="middle" fill="#e6edf3" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        admin
      </text>
      <circle cx={862} cy={105} r={11} fill="rgba(248,113,113,0.15)" stroke="#f87171" />
      <text x={862} y={109} textAnchor="middle" fill="#f87171" fontSize={12} fontFamily={MONO} fontWeight={700}>
        !
      </text>
      <text x={770} y={262} textAnchor="middle" fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        many passwords × one account
      </text>
      <text x={770} y={280} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        fast and loud — floods the logs
      </text>
      <Footnote y={318}>blue team view: spray = few passwords × many users · brute = many × one — failed-auth events (4625) catch both</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// SSH tunneling: -L local forward and -D SOCKS through a jump host
// ---------------------------------------------------------------------------

function SshTunneling({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 358" h="348px">
      <Defs />
      <text x={40} y={50} fill="#38bdf8" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        a) ssh -L — fixed local forward
      </text>
      <Box x={40} y={62} w={190} h={56} label="YOUR MACHINE" sub="listen 127.0.0.1:8080" />
      <Arrow x1={230} y1={90} x2={390} y2={90} label="ssh -L 8080:10.0.0.5:80" color="#22e58c" dashed />
      <Box x={390} y={62} w={200} h={56} label="JUMP HOST" sub="DMZ pivot · sshd :22" stroke="#fbbf24" fill="rgba(251,191,36,0.06)" />
      <Arrow x1={590} y1={90} x2={700} y2={90} label="decrypt + forward" color="#22e58c" />
      <Box x={700} y={62} w={190} h={56} label="INTERNAL APP" sub="10.0.0.5 :80" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <text x={460} y={146} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        -L: one local port → one fixed destination · -D: a SOCKS proxy — any tool, any target the jump reaches
      </text>
      <text x={40} y={190} fill="#22e58c" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        b) ssh -D — dynamic SOCKS
      </text>
      <Box x={40} y={202} w={190} h={56} label="SOCKS PROXY" sub="127.0.0.1:9050" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Arrow x1={230} y1={230} x2={438} y2={230} color="#22e58c" dashed />
      <Node x={460} y={230} r={22} label="SSH" sub="tunnel" color="#22e58c" filled />
      <Box x={700} y={178} w={190} h={38} label="DC 10.0.0.10 :445" />
      <Box x={700} y={228} w={190} h={38} label="FS 10.0.0.21 :445" />
      <Box x={700} y={278} w={190} h={38} label="WS 10.0.0.33 :80" />
      <Arrow x1={482} y1={230} x2={700} y2={197} color="#22e58c" dashed />
      <Arrow x1={482} y1={230} x2={700} y2={247} color="#22e58c" dashed />
      <Arrow x1={482} y1={230} x2={700} y2={297} color="#22e58c" dashed />
      <text x={135} y={280} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        point any tool at :9050
      </text>
      <text x={160} y={296} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
        proxychains · -x socks5h://
      </text>
      <Footnote y={344}>past the jump host the traffic leaves on the internal LAN as normal — the tunnel encrypts only leg one</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// SOCKS proxy on a pivot: tool traffic → proxychains → pivot → internal
// ---------------------------------------------------------------------------

function SocksProxy({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 370" h="360px">
      <Defs />
      <Box x={60} y={80} w={140} h={48} label="NMAP" sub="port scans" small />
      <Box x={60} y={140} w={140} h={48} label="CURL" sub="quick fetches" small />
      <Box x={60} y={200} w={140} h={48} label="BROWSER" sub="web apps" small />
      <Arrow x1={200} y1={104} x2={300} y2={140} />
      <Arrow x1={200} y1={164} x2={300} y2={156} />
      <Arrow x1={200} y1={224} x2={300} y2={172} />
      <Box x={300} y={124} w={170} h={64} label="PROXYCHAINS" sub="socks5 127.0.0.1 9050" stroke="#22e58c" fill="rgba(34,229,140,0.06)" />
      <Arrow x1={470} y1={156} x2={540} y2={156} color="#22e58c" />
      <text x={625} y={112} textAnchor="middle" fill="#22e58c" fontSize={9.5} fontFamily={MONO}>
        tunnel leg — encrypted
      </text>
      <Box x={540} y={124} w={170} h={64} label="PIVOT HOST" sub="SOCKS5 :9050" stroke="#fbbf24" fill="rgba(251,191,36,0.07)" />
      <Arrow x1={710} y1={140} x2={770} y2={90} />
      <Arrow x1={710} y1={156} x2={770} y2={155} />
      <Arrow x1={710} y1={172} x2={770} y2={220} />
      <Box x={770} y={70} w={130} h={40} label="DC 10.0.0.10" />
      <Box x={770} y={135} w={130} h={40} label="FS 10.0.0.21" />
      <Box x={770} y={200} w={130} h={40} label="APP 10.0.0.30" />
      <Arrow x1={385} y1={188} x2={768} y2={288} label="proxy_dns — resolve names inside too" color="#a78bfa" dashed />
      <Box x={770} y={268} w={130} h={40} label="DNS 10.0.0.53" stroke="#a78bfa" fill="rgba(167,139,250,0.06)" />
      <text x={460} y={336} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        from the inside, every packet arrives with the pivot host as its source — not you
      </text>
      <Footnote y={356}>quiet scan through socks: nmap --proxies socks5://127.0.0.1:9050 -sT · raw SYN scans do not proxy</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Fictional corporate topology with pentest target annotations
// ---------------------------------------------------------------------------

function InternalTopology({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 358" h="348px">
      <Defs />
      <Node x={70} y={180} r={28} label="INTERNET" sub="untrusted" color="#f87171" />
      <Node x={165} y={180} r={26} label="FW" sub="edge" color="#fbbf24" filled />
      <rect x={225} y={80} width={170} height={200} rx={10} fill="rgba(251,191,36,0.04)" stroke="#fbbf24" strokeDasharray="6 4" />
      <text x={310} y={102} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        DMZ 10.10.10.0/24
      </text>
      <Node x={310} y={145} r={20} label="MAIL" sub=":25" color="#fbbf24" />
      <Node x={310} y={215} r={20} label="WEB" sub="80/443" color="#fbbf24" />
      <Node x={435} y={180} r={24} label="FW2" sub="internal" color="#fbbf24" filled />
      <rect x={495} y={60} width={400} height={215} rx={10} fill="rgba(56,189,248,0.04)" stroke="#38bdf8" strokeDasharray="6 4" />
      <text x={695} y={82} textAnchor="middle" fill="#38bdf8" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        CORP LAN 10.10.20.0/24
      </text>
      <rect x={515} y={100} width={130} height={95} rx={8} fill="rgba(56,189,248,0.05)" stroke="#38bdf8" strokeDasharray="4 3" />
      <text x={580} y={122} textAnchor="middle" fill="#38bdf8" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        WORKSTATIONS
      </text>
      <circle cx={545} cy={152} r={10} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" />
      <circle cx={580} cy={152} r={10} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" />
      <circle cx={615} cy={152} r={10} fill="rgba(56,189,248,0.2)" stroke="#38bdf8" />
      <text x={580} y={182} textAnchor="middle" fill="#5b6b7f" fontSize={9} fontFamily={MONO}>
        phish bait
      </text>
      <rect x={665} y={96} width={215} height={170} rx={8} fill="rgba(167,139,250,0.04)" stroke="#a78bfa" strokeDasharray="4 3" />
      <text x={772} y={116} textAnchor="middle" fill="#a78bfa" fontSize={10.5} fontFamily={MONO} fontWeight={700}>
        SERVERS VLAN
      </text>
      <Node x={705} y={150} r={17} label="FS" color="#38bdf8" />
      <Node x={770} y={150} r={17} label="APP" color="#38bdf8" />
      <Node x={705} y={210} r={17} label="DB" color="#38bdf8" />
      <Node x={770} y={210} r={19} label="DC" color="#a78bfa" filled />
      <line x1={705} y1={227} x2={705} y2={236} stroke="#f87171" />
      <line x1={770} y1={229} x2={770} y2={236} stroke="#f87171" />
      <rect x={682} y={236} width={46} height={16} rx={4} fill="rgba(248,113,113,0.15)" stroke="#f87171" />
      <text x={705} y={248} textAnchor="middle" fill="#f87171" fontSize={9} fontFamily={MONO} fontWeight={700}>
        HVT
      </text>
      <rect x={747} y={236} width={46} height={16} rx={4} fill="rgba(248,113,113,0.15)" stroke="#f87171" />
      <text x={770} y={248} textAnchor="middle" fill="#f87171" fontSize={9} fontFamily={MONO} fontWeight={700}>
        HVT
      </text>
      <Link x1={98} y1={180} x2={139} y2={180} color="#f87171" />
      <Link x1={191} y1={180} x2={225} y2={180} color="#fbbf24" />
      <Link x1={395} y1={180} x2={411} y2={180} color="#fbbf24" />
      <Link x1={459} y1={180} x2={495} y2={180} color="#38bdf8" />
      <Arrow x1={108} y1={138} x2={222} y2={127} label="ALLOW 80/443/25" color="#22e58c" />
      <text x={435} y={250} textAnchor="middle" fill="#fbbf24" fontSize={9.5} fontFamily={MONO}>
        only way in: a DMZ pivot
      </text>
      <text x={460} y={322} textAnchor="middle" fill="#8b98a9" fontSize={10} fontFamily={MONO}>
        typical enterprise: DMZ for what must be reachable · VLANs for the rest
      </text>
      <Footnote y={344}>HVT = high-value target — the DC holds every credential, the DB holds the data · plan your path to both</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Attack path graph: foothold → domain controller, edges need evidence
// ---------------------------------------------------------------------------

function AttackPath({ interactive }: DProps) {
  return (
    <Frame vb="0 0 920 366" h="356px">
      <Defs />
      <Node x={85} y={130} r={20} label="WS" sub="workstation" />
      <Node x={248} y={130} r={21} label="CREDS" sub="in share" color="#a78bfa" />
      <Node x={411} y={130} r={21} label="FS" sub="file server" />
      <Node x={574} y={130} r={21} label="SVC" sub="svc_backup" color="#fbbf24" />
      <Node x={737} y={130} r={21} label="APP" sub="app server" />
      <Node x={875} y={130} r={22} label="DC" sub="domain ctrl" color="#a78bfa" filled />
      <Arrow x1={107} y1={130} x2={225} y2={130} label="readable share" />
      <Arrow x1={271} y1={130} x2={388} y2={130} label="cred reuse" />
      <Arrow x1={434} y1={130} x2={551} y2={130} label="local admin (SMB)" color="#fbbf24" />
      <Arrow x1={597} y1={130} x2={714} y2={130} label="same service acct" color="#22e58c" />
      <Arrow x1={760} y1={130} x2={851} y2={130} label="lateral move" color="#22e58c" />
      <Arrow x1={411} y1={153} x2={411} y2={208} label="tried: printer server" color="#f87171" dashed />
      <Node x={411} y={232} r={19} label="PRN" color="#f87171" />
      <text x={760} y={190} textAnchor="middle" fill="#22e58c" fontSize={9.5} fontFamily={MONO}>
        green = confirmed attack path
      </text>
      <text x={760} y={208} textAnchor="middle" fill="#f87171" fontSize={9.5} fontFamily={MONO}>
        dashed = dead end — still log it
      </text>
      <rect x={40} y={268} width={840} height={66} rx={8} fill="rgba(11,18,32,0.6)" stroke="#1b2740" />
      <text x={60} y={290} fill="#22e58c" fontSize={10} fontFamily={MONO} fontWeight={700}>
        EVIDENCE FOR EVERY EDGE
      </text>
      <text x={60} y={308} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        edge 1: smbclient -N -L //10.10.20.21 — screenshot of the share list
      </text>
      <text x={60} y={324} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
        edge 3: crackmapexec smb 10.10.20.0/24 -u svc_backup -p … → Pwn3d!
      </text>
      <Footnote y={354}>every edge in an attack path needs evidence — command, output, screenshot; no edge, no claim</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// 16-phase network pentest methodology (boustrophedon snake)
// ---------------------------------------------------------------------------

const PENTEST_PHASES = [
  'Scope', 'ROE', 'Recon', 'Discovery',
  'Enumeration', 'Vuln assessment', 'Validation', 'Exploitation',
  'Post-exploitation', 'Internal enum', 'Lateral concepts', 'Evidence',
  'Risk', 'Remediation', 'Reporting', 'Retesting'
];

function PentestPipeline({ interactive }: DProps) {
  const cols = 4;
  const bw = 170;
  const bh = 46;
  const gapX = 60;
  const gapY = 74;
  const color = (i: number) => (i < 8 ? '#22e58c' : i < 12 ? '#38bdf8' : '#a78bfa');
  return (
    <Frame vb="0 0 920 348" h="338px">
      <Defs />
      {PENTEST_PHASES.map((s, i) => {
        const row = Math.floor(i / cols);
        const idxInRow = i % cols;
        const reverse = row % 2 === 1;
        const col = reverse ? cols - 1 - idxInRow : idxInRow;
        const x = 55 + col * (bw + gapX);
        const y = 40 + row * gapY;
        const isRowEnd = idxInRow === cols - 1;
        return (
          <g key={s}>
            <Box x={x} y={y} w={bw} h={bh} label={s} sub={'phase ' + (i + 1)} stroke={color(i)} fill={color(i) + '0f'} small />
            {!isRowEnd && i < PENTEST_PHASES.length - 1 && (
              <Arrow x1={reverse ? x : x + bw} y1={y + bh / 2} x2={reverse ? x - gapX : x + bw + gapX} y2={y + bh / 2} />
            )}
            {isRowEnd && i < PENTEST_PHASES.length - 1 && (
              <line
                x1={reverse ? x + bw / 2 : x + bw / 2}
                y1={y + bh + 4}
                x2={reverse ? x + bw / 2 : x + bw / 2}
                y2={y + gapY - 12}
                stroke="#38bdf8"
                strokeWidth={1.5}
                markerEnd="url(#arrowHead)"
              />
            )}
          </g>
        );
      })}
      <Footnote y={336}>the loop closes at retesting — green: planning · blue: hands-on · violet: wrap-up — verify the fix, not the patch note</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const NETWORK_DIAGRAMS_B: Partial<Record<DiagramId, React.FC<DProps>>> = {
  'net-recon-workflow': ReconWorkflow,
  'net-tcp-scan-flags': TcpScanFlags,
  'net-packet-anatomy': PacketAnatomy,
  'net-capture-pipeline': CapturePipeline,
  'net-enumeration-workflow': EnumerationWorkflow,
  'net-vuln-workflow': VulnWorkflow,
  'net-arp-spoofing': ArpSpoofing,
  'net-dns-spoofing': DnsSpoofing,
  'net-l2-attacks': L2Attacks,
  'net-cred-attacks': CredAttacks,
  'net-ssh-tunneling': SshTunneling,
  'net-socks-proxy': SocksProxy,
  'net-internal-topology': InternalTopology,
  'net-attack-path': AttackPath,
  'net-pentest-pipeline': PentestPipeline
};
