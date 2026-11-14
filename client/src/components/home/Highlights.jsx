import { Users, Layers, MailCheck, Check } from 'lucide-react';
import { eventConfig as ev } from '../../config/eventConfig.js';
import { domains } from '../../config/options.js';
import Reveal from '../Reveal.jsx';
import SectionLabel from '../SectionLabel.jsx';

// Editorial layout: four panels, each with a different composition (not identical cards).
export default function Highlights() {
  const [team, domain, submit, mail] = ev.highlights;
  const submissionItems = ['PPT link (Drive / OneDrive)', 'Prototype link (GitHub / Figma / live demo)', 'Demo video link (optional)'];
  return (
    <section id="highlights" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel n="01">Highlights</SectionLabel>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight">
          What to <span className="split">expect</span>
        </h2>
        <p className="mt-4 max-w-xl text-muted">{ev.eventName} is open to student participants who want to turn an idea into a working prototype.</p>
      </Reveal>

      <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-12">
        <Reveal className="panel p-8 md:col-span-7 md:p-10">
          <div className="flex items-start justify-between">
            <span className="font-display text-[clamp(5rem,14vw,10rem)] font-bold leading-none outline-text">05</span>
            <Users className="h-7 w-7 text-neon" />
          </div>
          <p className="mono-label mt-2">Team size / 1 — 5</p>
          <h3 className="mt-3 text-2xl font-bold uppercase">{team.title}</h3>
          <p className="mt-2 max-w-md text-muted">{team.text}</p>
        </Reveal>

        <Reveal delay={100} className="panel p-8 md:col-span-5 md:p-10">
          <span className="font-display text-[clamp(5rem,12vw,8rem)] font-bold leading-none outline-neon">{String(domains.length).padStart(2, '0')}</span>
          <p className="mono-label mt-2" style={{ color: '#FF2DAA' }}>Domains / tracks</p>
          <h3 className="mt-3 text-2xl font-bold uppercase">{domain.title}</h3>
          <p className="mt-2 text-muted">{domain.text}</p>
        </Reveal>

        <Reveal delay={100} className="panel p-8 md:col-span-5 md:p-10">
          <Layers className="h-7 w-7 text-magenta" />
          <h3 className="mt-5 text-2xl font-bold uppercase">{submit.title}</h3>
          <p className="mt-2 text-muted">{submit.text}</p>
          <ul className="mt-5 space-y-2 font-mono text-xs text-fg/90">
            {submissionItems.map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />{t}</li>)}
          </ul>
        </Reveal>

        <Reveal delay={200} className="panel flex flex-col justify-between gap-8 p-8 md:col-span-7 md:p-10">
          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
            <span className="text-fg">Register</span><span className="h-px flex-1 bg-gradient-to-r from-magenta to-neon" />
            <span className="text-fg">Saved</span><span className="h-px flex-1 bg-gradient-to-r from-neon to-gold" />
            <span className="text-gold">Confirmed</span>
          </div>
          <div className="flex items-start gap-4">
            <MailCheck className="h-8 w-8 shrink-0 text-gold" />
            <div>
              <h3 className="text-2xl font-bold uppercase">{mail.title}</h3>
              <p className="mt-2 max-w-lg text-muted">{mail.text}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
