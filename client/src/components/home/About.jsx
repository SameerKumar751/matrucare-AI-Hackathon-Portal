import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { eventConfig as ev } from '../../config/eventConfig.js';
import Reveal from '../Reveal.jsx';
import SectionLabel from '../SectionLabel.jsx';

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl overflow-hidden px-4 py-24 sm:px-6">
      <Reveal>
        <SectionLabel n="05">About</SectionLabel>
        <p className="mt-6 break-words font-display text-[clamp(2.75rem,13vw,10.5rem)] font-bold uppercase leading-[0.85] tracking-[-0.04em] outline-text" aria-hidden="true">MatruCare</p>
        <h2 className="-mt-2 font-display text-[clamp(2.75rem,13vw,10.5rem)] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-fg sm:-mt-4"><span className="split">AI.</span></h2>
      </Reveal>
      <Reveal delay={150} className="mt-12 grid gap-8 md:grid-cols-12">
        <p className="text-lg leading-relaxed text-fg/90 md:col-span-7">
          MatruCare AI runs this hackathon to give students a place to apply AI and software engineering to real problems. Participants choose a domain, submit a project proposal with a prototype, and collaborate in teams of up to five.
        </p>
        <div className="border-l border-white/15 pl-6 md:col-span-5">
          <p className="mono-label">Contact</p>
          <a href={`mailto:${ev.contactEmail}`} className="mt-3 inline-flex items-center gap-2 break-all text-fg underline decoration-magenta underline-offset-4"><Mail className="h-4 w-4 text-neon" />{ev.contactEmail}</a>
          <p className="mt-3 text-sm text-muted">Logged-in participants can also use the <Link to="/contact" className="text-neon underline">contact form</Link>.</p>
        </div>
      </Reveal>
    </section>
  );
}
