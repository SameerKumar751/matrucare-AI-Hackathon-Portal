import { Brain, Globe, Cpu, ShieldCheck, Link2, Smartphone, HeartPulse, Sparkles } from 'lucide-react';
import { domains } from '../../config/options.js';
import Reveal from '../Reveal.jsx';
import SectionLabel from '../SectionLabel.jsx';

// Icons are decorative; the domain names themselves come from the shared options config.
const icons = { 'AI/ML': Brain, 'Web Development': Globe, IoT: Cpu, 'Cyber Security': ShieldCheck, Blockchain: Link2, 'Mobile App Development': Smartphone, 'Healthcare Tech': HeartPulse };

export default function Domains() {
  return (
    <section id="domains" className="relative border-y border-white/10 bg-night/70">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal>
          <SectionLabel n="02">Domains</SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight">Choose your <span className="split">track</span></h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domains.map((d, i) => {
            const Icon = icons[d] || Sparkles;
            const cyan = i % 2 === 0;
            return (
              <Reveal key={d} delay={(i % 4) * 80} className={`tile ${cyan ? 'tile-c' : 'tile-m'} p-6`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] tracking-[0.25em] ${cyan ? 'text-neon' : 'text-magenta'}`}>D-{String(i + 1).padStart(2, '0')}</span>
                  <Icon className={`h-6 w-6 ${cyan ? 'text-neon' : 'text-magenta'}`} />
                </div>
                <h3 className="mt-10 font-display text-xl font-bold uppercase leading-tight">{d}</h3>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
