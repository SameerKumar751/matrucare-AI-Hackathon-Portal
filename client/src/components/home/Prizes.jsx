import { useId } from 'react';
import { eventConfig as ev } from '../../config/eventConfig.js';
import Reveal from '../Reveal.jsx';
import SectionLabel from '../SectionLabel.jsx';

// 3D-inspired metallic trophy (SVG gradients). tone: [light, mid, dark]
function Trophy({ tone, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={tone[0]} /><stop offset=".5" stopColor={tone[1]} /><stop offset="1" stopColor={tone[2]} /></linearGradient>
      </defs>
      <g fill={`url(#t${id})`}>
        <path d="M30 10H90V50C90 78 75 92 60 92C45 92 30 78 30 50Z" />
        <rect x="52" y="90" width="16" height="22" />
        <path d="M36 110H84L90 130H30Z" />
      </g>
      <g fill="none" stroke={`url(#t${id})`} strokeWidth="6" strokeLinecap="round">
        <path d="M30 22C8 22 8 58 36 66" /><path d="M90 22C112 22 112 58 84 66" />
      </g>
      <path d="M38 14H52V60C44 54 38 40 38 30Z" fill="#fff" opacity=".28" />
    </svg>
  );
}

const tiers = [
  { rank: '1ST', tone: ['#FFF3D6', '#F5C879', '#7A4B14'], order: 'md:order-2', pad: 'md:min-h-[26rem]', size: 'h-40 md:h-48', glow: true },
  { rank: '2ND', tone: ['#F4F1EA', '#B9B4A8', '#4A4658'], order: 'md:order-1', pad: 'md:min-h-[21rem]', size: 'h-28 md:h-36' },
  { rank: '3RD', tone: ['#F2C9A0', '#B8743F', '#46230E'], order: 'md:order-3', pad: 'md:min-h-[18rem]', size: 'h-24 md:h-32' },
];

export default function Prizes() {
  return (
    <section id="prizes" className="relative overflow-hidden border-y border-white/10 bg-night/70">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal>
          <SectionLabel n="04">Prizes</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight">Prizes &amp; <span className="split">rewards</span></h2>
        </Reveal>
        <div className="mt-14 grid items-end gap-5 md:grid-cols-3">
          {ev.prizes.slice(0, 3).map((p, i) => {
            const t = tiers[i];
            return (
              <Reveal key={p.title} delay={i * 120} className={`relative flex flex-col items-center justify-end border bg-void/60 p-8 text-center ${t.order} ${t.pad} ${t.glow ? 'border-gold/50 shadow-[0_0_60px_-24px_#F5C879]' : 'border-white/10'}`}>
                <Trophy tone={t.tone} className={`${t.size} drop-shadow-[0_12px_24px_rgba(245,200,121,.25)]`} />
                <p className="mt-6 font-display text-5xl font-bold leading-none outline-gold">{t.rank}</p>
                <h3 className="mt-3 text-lg font-bold uppercase">{p.title}</h3>
                <p className="mono-label mt-2" style={{ color: '#F5C879' }}>{p.value}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
