import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo.jsx';
import { eventConfig } from '../config/eventConfig.js';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-night">
      <div className="h-px bg-gradient-to-r from-transparent via-magenta/60 to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">{eventConfig.tagline} {eventConfig.intro}</p>
        </div>
        <div className="md:col-span-3">
          <h3 className="mono-label">Navigate</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-fg" to="/">Home</Link></li>
            <li><Link className="hover:text-fg" to="/#about">About</Link></li>
            <li><Link className="hover:text-fg" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-fg" to="/login">Login</Link></li>
            <li><Link className="hover:text-fg" to="/signup">Signup</Link></li>
          </ul>
        </div>
        <div className="md:col-span-4">
          <h3 className="mono-label">Contact</h3>
          <a href={`mailto:${eventConfig.contactEmail}`} className="mt-4 inline-flex items-center gap-2 break-all text-sm text-fg hover:text-neon"><Mail className="h-4 w-4" />{eventConfig.contactEmail}</a>
          <div className="mt-5 flex flex-wrap gap-5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {eventConfig.social.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-magenta">{s.label}</a>)}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">&copy; {new Date().getFullYear()} MatruCare AI. All rights reserved.</div>
    </footer>
  );
}
