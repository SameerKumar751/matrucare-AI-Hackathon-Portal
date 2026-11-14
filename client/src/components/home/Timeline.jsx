import { eventConfig as ev } from '../../config/eventConfig.js';
import Reveal from '../Reveal.jsx';
import SectionLabel from '../SectionLabel.jsx';

export default function Timeline() {
  return (
    <section id="timeline" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel n="03">Timeline</SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(2rem,6vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight">Four <span className="split">stages</span></h2>
      </Reveal>

      <Reveal className="relative mt-14">
        {/* connecting line + animated progress */}
        <span className="absolute bottom-0 left-[11px] top-0 w-px bg-white/15 md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto" aria-hidden="true" />
        <span className="tl-progress absolute bottom-0 left-[11px] top-0 w-px bg-gradient-to-b from-magenta to-neon md:bottom-auto md:left-0 md:right-0 md:top-[11px] md:h-px md:w-auto md:bg-gradient-to-r" aria-hidden="true" />
        <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
          {ev.timeline.map((t, i) => (
            <li key={t.title} className="relative pl-10 md:pl-0 md:pt-12">
              <span className={`absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full border bg-void md:left-0 ${i === 0 ? 'border-magenta shadow-[0_0_18px_#FF2DAA]' : 'border-neon/60 shadow-[0_0_14px_-2px_#00E5FF]'}`} aria-hidden="true">
                <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-magenta' : 'bg-neon'}`} />
              </span>
              <p className="font-display text-5xl font-bold leading-none outline-text">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 text-lg font-bold uppercase leading-tight">{t.title}</h3>
              <p className="mono-label mt-2" style={{ color: '#F5C879' }}>{t.date}</p>
              <p className="mt-2 text-sm text-muted">{t.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
