import React, { useState } from 'react';
import type { DiagramId } from '../../types';
import { Frame, Box, Arrow, Defs, Footnote, Node, Link, MONO, type DProps } from './shared';

// Network Security & Pentesting Academy — original SVG diagram library.
// All visuals are drawn from scratch for this academy. Accent palette is the
// network theme: sky blue (#38bdf8) primary, green (#22e58c), violet, amber.

// ---------------------------------------------------------------------------
// LAN topology (interactive) — basic LAN: switch, router, hosts
// ---------------------------------------------------------------------------

const LAN_HOSTS = [
  { x: 120, y: 90, label: 'PC-1', sub: '192.168.1.10', detail: 'An end host. Gets its address from DHCP, reaches everything else through the switch, and sends all off-subnet traffic to the default gateway.' },
  { x: 120, y: 230, label: 'PC-2', sub: '192.168.1.11', detail: 'Same subnet as PC-1: they talk directly at layer 2 using ARP-resolved MAC addresses, no router involved.' },
  { x: 120, y: 160, label: 'SRV', sub: '192.168.1.20', detail: 'A server on the same LAN. In a pentest this is often the highest-value box: file shares, databases, directory services.' }
];

function LanTopology({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 330" h="320px">
        <Defs />
        <rect x={60} y={50} width={200} height={230} rx={10} fill="rgba(56,189,248,0.04)" stroke="#1b2740" strokeDasharray="5 4" />
        <text x={160} y={40} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          LAN 192.168.1.0/24
        </text>
        {LAN_HOSTS.map((h, i) => (
          <g key={h.label} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
            <Node x={h.x} y={h.y} label={h.label} sub={h.sub} color={sel === i ? '#22e58c' : '#38bdf8'} />
            <Link x1={h.x + 24} y1={h.y} x2={300} y2={160} />
          </g>
        ))}
        <Node x={310} y={160} r={28} label="SW" sub="switch" color="#22e58c" />
        <Link x1={338} y1={160} x2={440} y2={160} />
        <Node x={465} y={160} r={28} label="GW" sub=".1 · router" color="#a78bfa" filled />
        <Link x1={493} y1={160} x2={580} y2={160} />
        <Node x={620} y={160} r={26} label="FW" sub="firewall" color="#fbbf24" />
        <Link x1={646} y1={160} x2={720} y2={160} />
        <text x={770} y={140} textAnchor="middle" fill="#8b98a9" fontSize={12} fontFamily={MONO} fontWeight={700}>
          INTERNET
        </text>
        <text x={770} y={158} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
          untrusted
        </text>
        <text x={770} y={176} textAnchor="middle" fill="#5b6b7f" fontSize={9.5} fontFamily={MONO}>
          networks
        </text>
        <Footnote y={315}>switch = one broadcast domain · router = boundary between subnets · firewall = policy enforcement point</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">{LAN_HOSTS[sel].label}</span>
          <p className="mt-1">{LAN_HOSTS[sel].detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// OSI & TCP/IP model mapping (interactive)
// ---------------------------------------------------------------------------

const OSI_LAYERS = [
  { n: 7, name: 'Application', tcpip: 'Application', examples: 'HTTP · DNS · SMTP · SMB', detail: 'Where protocols you enumerate live. Banners, versions and misconfigurations here are classic findings.' },
  { n: 6, name: 'Presentation', tcpip: 'Application', examples: 'TLS · encoding · JPEG', detail: 'TLS negotiation happens at this boundary — your proxy fights it here during traffic interception.' },
  { n: 5, name: 'Session', tcpip: 'Application', examples: 'session mgmt · RPC', detail: 'Session establishment and teardown. Session tokens and RPC endpoint mappers matter to pentesters.' },
  { n: 4, name: 'Transport', tcpip: 'Transport', examples: 'TCP · UDP · ports', detail: 'Port numbers — the core coordinate system of your scans. SYN scans manipulate this layer.' },
  { n: 3, name: 'Network', tcpip: 'Internet', examples: 'IP · ICMP · routing', detail: 'Addressing and routing: subnets, gateways, traceroute hops, ping sweeps. Reachability lives here.' },
  { n: 2, name: 'Data Link', tcpip: 'Network Access', examples: 'Ethernet · ARP · MAC', detail: 'ARP spoofing, MAC tables, switch behavior — the layer 2 attacks of module 9.' },
  { n: 1, name: 'Physical', tcpip: 'Network Access', examples: 'cables · radio · NICs', detail: 'Copper, fiber, radio. Mostly out of scope for remote testing, but physical access changes everything.' }
];

function OsiTcpip({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 400" h="380px">
        <Defs />
        <text x={140} y={28} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          OSI (7 layers)
        </text>
        <text x={560} y={28} textAnchor="middle" fill="#5b6b7f" fontSize={11} fontFamily={MONO}>
          TCP/IP model (4 layers)
        </text>
        {OSI_LAYERS.map((l, i) => {
          const y = 42 + i * 44;
          return (
            <g key={l.n} onClick={interactive ? () => setSel(sel === i ? null : i) : undefined} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              <rect x={60} y={y} width={160} height={38} rx={6} fill="rgba(56,189,248,0.07)" stroke={sel === i ? '#22e58c' : '#38bdf8'} strokeWidth={sel === i ? 2.2 : 1} />
              <text x={74} y={y + 24} fill="#e6edf3" fontSize={12} fontFamily={MONO} fontWeight={700}>
                {l.n} · {l.name}
              </text>
              <text x={240} y={y + 24} fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
                {l.examples}
              </text>
              <line x1={410} y1={y + 19} x2={470} y2={y + 19} stroke="#38bdf8" strokeOpacity={0.35} />
            </g>
          );
        })}
        {[
          { name: 'Application', rows: [0, 1, 2], color: '#22e58c' },
          { name: 'Transport', rows: [3], color: '#fbbf24' },
          { name: 'Internet', rows: [4], color: '#a78bfa' },
          { name: 'Network Access', rows: [5, 6], color: '#f87171' }
        ].map((g) => {
          const y0 = 42 + g.rows[0] * 44;
          const y1 = 42 + g.rows[g.rows.length - 1] * 44 + 38;
          return (
            <g key={g.name}>
              <rect x={480} y={y0} width={160} height={y1 - y0} rx={6} fill={g.color + '12'} stroke={g.color} />
              <text x={560} y={(y0 + y1) / 2 + 4} textAnchor="middle" fill={g.color} fontSize={12} fontFamily={MONO} fontWeight={700}>
                {g.name}
              </text>
            </g>
          );
        })}
        <text x={700} y={90} fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
          pentest coordinates:
        </text>
        <text x={700} y={110} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
          L2 → ARP/MAC attacks
        </text>
        <text x={700} y={128} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
          L3 → sweeps, traceroute
        </text>
        <text x={700} y={146} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
          L4 → port scans
        </text>
        <text x={700} y={164} fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
          L5-7 → service enum
        </text>
        <Footnote y={388}>every tool you use lives at a layer — knowing which layer explains what its output means</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
            Layer {OSI_LAYERS[sel].n} — {OSI_LAYERS[sel].name}
          </span>
          <p className="mt-1">{OSI_LAYERS[sel].detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Encapsulation: segment → packet → frame
// ---------------------------------------------------------------------------

function Encapsulation() {
  const layers = [
    { title: 'Application data', w: 300, color: '#22e58c', label: '[ HTTP request / DNS query / … ]' },
    { title: '+ TCP/UDP header → segment', w: 420, color: '#38bdf8', label: '[ src port | dst port | flags | seq# ][ data ]' },
    { title: '+ IP header → packet', w: 540, color: '#a78bfa', label: '[ src IP | dst IP | TTL | proto ][ segment ]' },
    { title: '+ Ethernet header/trailer → frame', w: 680, color: '#fbbf24', label: '[ dst MAC | src MAC | type ][ packet ][ FCS ]' }
  ];
  return (
    <Frame vb="0 0 920 300" h="290px">
      <Defs />
      <Arrow x1={80} y1={250} x2={80} y2={60} label="send: encapsulate ↓" />
      {layers.map((l, i) => {
        const x = (920 - l.w) / 2;
        const y = 40 + i * 52;
        return (
          <g key={l.title}>
            <rect x={x} y={y} width={l.w} height={40} rx={7} fill={l.color + '10'} stroke={l.color} />
            <text x={x + 14} y={y + 17} fill={l.color} fontSize={10.5} fontFamily={MONO} fontWeight={700}>
              {l.title}
            </text>
            <text x={x + 14} y={y + 31} fill="#8b98a9" fontSize={9.5} fontFamily={MONO}>
              {l.label}
            </text>
          </g>
        );
      })}
      <Arrow x1={840} y1={60} x2={840} y2={250} label="receive: decapsulate ↑" />
      <Footnote y={292}>each layer wraps the one above — Wireshark shows you all four wrappers at once</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// TCP 3-way handshake & termination
// ---------------------------------------------------------------------------

function TcpHandshake() {
  return (
    <Frame vb="0 0 920 340" h="330px">
      <Defs />
      <Box x={80} y={40} w={200} h={50} label="Client" sub="ephemeral port 51000" />
      <Box x={640} y={40} w={200} h={50} label="Server" sub="listening :443" />
      <line x1={280} y1={90} x2={280} y2={310} stroke="#1b2740" />
      <line x1={640} y1={90} x2={640} y2={310} stroke="#1b2740" />
      <Arrow x1={280} y1={120} x2={640} y2={120} label="SYN  seq=x" color="#22e58c" />
      <Arrow x1={640} y1={160} x2={280} y2={160} label="SYN-ACK  seq=y ack=x+1" color="#22e58c" />
      <Arrow x1={280} y1={200} x2={640} y2={200} label="ACK  ack=y+1  — connection ESTABLISHED" color="#22e58c" />
      <text x={460} y={236} textAnchor="middle" fill="#8b98a9" fontSize={10.5} fontFamily={MONO}>
        data transfer …
      </text>
      <Arrow x1={280} y1={262} x2={640} y2={262} label="FIN  (client done)" color="#fbbf24" />
      <Arrow x1={640} y1={284} x2={280} y2={284} label="FIN-ACK / FIN" color="#fbbf24" />
      <Arrow x1={280} y1={304} x2={640} y2={304} label="ACK — connection CLOSED" color="#fbbf24" />
      <Footnote y={332}>SYN to a closed port → RST · SYN to a filtered port → silence · that difference is what your scan reads</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Pivoting topology (interactive)
// ---------------------------------------------------------------------------

const PIVOT_STEPS = [
  { id: 'step1', detail: 'You only reach the DMZ host directly. It has two interfaces — one foot in the DMZ, one in the internal network. That makes it a pivot point.' },
  { id: 'step2', detail: 'Set up a tunnel (SSH -L/-D, chisel, ligolo) through the compromised host. Your scan traffic now originates from the pivot host.' },
  { id: 'step3', detail: 'Enumerate the internal subnet through the tunnel: the file server and workstation were never reachable from outside.' }
];

function PivotTopology({ interactive }: DProps) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <Frame vb="0 0 920 340" h="330px">
        <Defs />
        <Node x={110} y={100} r={26} label="ATTACKER" sub="you" color="#22e58c" />
        <rect x={340} y={30} width={200} height={140} rx={10} fill="rgba(251,191,36,0.05)" stroke="#fbbf24" strokeDasharray="6 4" />
        <text x={440} y={50} textAnchor="middle" fill="#fbbf24" fontSize={10.5} fontFamily={MONO}>
          DMZ 10.10.10.0/24
        </text>
        <Node x={440} y={100} r={28} label="PIVOT" sub=".5 · 2 NICs" color="#fbbf24" filled />
        <rect x={340} y={200} width={200} height={110} rx={10} fill="rgba(56,189,248,0.05)" stroke="#38bdf8" strokeDasharray="6 4" />
        <text x={440} y={220} textAnchor="middle" fill="#38bdf8" fontSize={10.5} fontFamily={MONO}>
          INTERNAL 10.10.20.0/24
        </text>
        <Node x={440} y={255} r={24} label="FS" sub=".21 file srv" color="#38bdf8" />
        <Node x={700} y={255} r={24} label="WS" sub=".33 workstation" color="#38bdf8" />
        <Link x1={136} y1={100} x2={412} y2={100} color="#22e58c" width={2} />
        <text x={275} y={88} textAnchor="middle" fill="#22e58c" fontSize={10} fontFamily={MONO}>
          reachable
        </text>
        <Link x1={440} y1={128} x2={440} y2={231} color="#fbbf24" dashed />
        <text x={490} y={185} fill="#fbbf24" fontSize={10} fontFamily={MONO}>
          second NIC
        </text>
        <Link x1={464} y1={255} x2={676} y2={255} color="#38bdf8" />
        <Arrow x1={150} y1={140} x2={420} y2={240} label="tunnel through pivot" color="#22e58c" dashed />
        <Footnote y={330}>the firewall blocks you — but the pivot host is already inside; its route becomes your route</Footnote>
      </Frame>
      {interactive && sel !== null && (
        <div className="mx-2 mb-2 rounded-lg border border-cyan/30 bg-cyan/5 p-3 text-sm text-muted animate-fade-in">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">STEP {sel + 1}</span>
          <p className="mt-1">{PIVOT_STEPS[sel].detail}</p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Nmap scanning workflow
// ---------------------------------------------------------------------------

function NmapWorkflow() {
  const steps = [
    'Scope &\nauthorize',
    'Host\ndiscovery',
    'Port\nscan',
    'Service &\nversion',
    'OS &\nscripts',
    'Interpret &\nvalidate'
  ];
  const w = 130;
  const gap = 26;
  return (
    <Frame vb="0 0 920 200" h="190px">
      <Defs />
      {steps.map((s, i) => {
        const x = 40 + i * (w + gap);
        const lines = s.split('\n');
        return (
          <g key={i}>
            <Box x={x} y={60} w={w} h={60} label={lines[0]} sub={lines[1]} stroke={i < 5 ? '#38bdf8' : '#22e58c'} fill={(i < 5 ? '#38bdf8' : '#22e58c') + '10'} />
            {i < steps.length - 1 && <Arrow x1={x + w} y1={90} x2={x + w + gap} y2={90} />}
            <text x={x + w / 2} y={150} textAnchor="middle" fill="#5b6b7f" fontSize={10} fontFamily={MONO}>
              {['-sn', '-p- / -p', '-sV', '-O -sC', 'read it'][i] ?? ''}
            </text>
          </g>
        );
      })}
      <Footnote y={185}>each phase narrows the target set — never skip interpretation: scanners guess, you verify</Footnote>
    </Frame>
  );
}

// ---------------------------------------------------------------------------

export const NETWORK_DIAGRAMS_CORE: Partial<Record<DiagramId, React.FC<DProps>>> = {
  'net-lan-topology': LanTopology,
  'net-osi-tcpip': OsiTcpip,
  'net-encapsulation': Encapsulation,
  'net-tcp-handshake': TcpHandshake,
  'net-pivot-topology': PivotTopology,
  'net-nmap-workflow': NmapWorkflow
};
