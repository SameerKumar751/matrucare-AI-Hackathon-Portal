import { useEffect, useState } from 'react';

/**
 * Event countdown. Only runs when `target` is a valid date; otherwise it is disabled and
 * shows "EVENT DATE — TO BE ANNOUNCED" (no fake numbers).
 */
export default function Countdown({ target }) {
  const ts = target ? Date.parse(target) : NaN;
  const enabled = Number.isFinite(ts);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  const diff = enabled ? Math.max(0, ts - now) : 0;
  const pad = (n) => String(n).padStart(2, '0');
  const units = [
    ['DAYS', Math.floor(diff / 864e5)], ['HOURS', Math.floor(diff / 36e5) % 24],
    ['MINUTES', Math.floor(diff / 6e4) % 60], ['SECONDS', Math.floor(diff / 1e3) % 60],
  ];

  return (
    <div className="inline-block max-w-full" role="timer" aria-label={enabled ? 'Time until the event' : 'Event date to be announced'}>
      <div className={`flex items-start gap-3 border bg-void/60 px-4 py-4 backdrop-blur sm:gap-5 sm:px-6 ${enabled ? 'border-neon/30 shadow-[0_0_40px_-18px_#FF2DAA]' : 'border-white/10'}`}>
        {units.map(([label, value], i) => (
          <div key={label} className="flex items-start gap-3 sm:gap-5">
            <div className={`text-center ${enabled ? '' : 'opacity-35'}`}>
              <div className={`font-display text-3xl font-bold tabular-nums sm:text-5xl ${i % 2 ? 'text-neon' : 'text-magenta'}`}>{enabled ? pad(value) : '--'}</div>
              <div className="mt-1 font-mono text-[9px] tracking-[0.25em] text-muted sm:text-[10px]">{label}</div>
            </div>
            {i < 3 && <span className="pt-1 font-display text-2xl text-muted/60 sm:text-3xl" aria-hidden="true">:</span>}
          </div>
        ))}
      </div>
      {!enabled && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-neon">Event date — to be announced</p>}
    </div>
  );
}
