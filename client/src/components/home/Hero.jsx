import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { eventConfig as ev } from '../../config/eventConfig.js';
import HeroArt from './HeroArt.jsx';
import Countdown from '../Countdown.jsx';

// Heading lines revealed one after another (delay in seconds)
const lines = [['BUILD THE', ''], ['FUTURE.', 'split'], ['MAKE IT', 'text-fg/90'], ['MATTER.', 'split']];

export default function Hero() {
  const { user } = useAuth();
  const ref = useRef(null);

  // Pointer parallax for the 3D layers (disabled for reduced motion)
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    el.addEventListener('pointermove', move);
    return () => el.removeEventListener('pointermove', move);
  }, []);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      {/* artwork: faded backdrop on mobile, full presence from lg */}
      <div className="pointer-events-none absolute -right-[25%] top-16 -z-10 h-[75%] w-[95%] opacity-40 sm:-right-[10%] sm:w-[70%] lg:right-0 lg:top-12 lg:h-[88%] lg:w-[52%] lg:opacity-100">
        <HeroArt />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-void via-void/70 to-transparent lg:via-void/30" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-10 pt-28 sm:px-6 lg:pt-24">
        <p className="mono-label" style={{ animation: 'fadeUp .8s .1s both' }}>
          /// MatruCare AI presents<br />
          <span className="text-muted">AI + Technology Hackathon</span>
        </p>

        <h1 className="mt-5 font-display font-bold uppercase leading-[0.9] tracking-[-0.03em] text-[clamp(2.75rem,9vw,7.25rem)]" aria-label="Build the future. Make it matter.">
          {lines.map(([text, cls], i) => (
            <span key={text} className="line-mask" aria-hidden="true">
              <span className={`line ${cls}`} style={{ animationDelay: `${0.25 + i * 0.14}s` }}>{text}</span>
            </span>
          ))}
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted sm:text-lg" style={{ animation: 'fadeUp .9s 1s both' }}>
          Bring your ideas to life. Collaborate with innovators, explore emerging technologies and build solutions that make a difference.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={user ? '/register' : '/signup'} className="btn-primary">Register now</Link>
          <Link to="/#highlights" className="btn-outline">Explore event</Link>
        </div>

        <div className="mt-10"><Countdown target={ev.eventDate} /></div>
      </div>

      {/* metadata strip */}
      <div className="border-t border-white/10 bg-void/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:grid-cols-3 sm:px-6 sm:text-[11px]">
          <span>{ev.dateLabel}</span>
          <span className="text-neon sm:text-center">{ev.venueLabel}</span>
          <span className="sm:text-right">Solo or teams up to 5</span>
        </div>
      </div>
    </section>
  );
}
