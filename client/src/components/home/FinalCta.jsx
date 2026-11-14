import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Reveal from '../Reveal.jsx';

export default function FinalCta() {
  const { user } = useAuth();
  return (
    <section className="relative isolate overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute -left-20 top-0 -z-10 h-96 w-96 rounded-full bg-neon/20 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-magenta/25 blur-[120px]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 py-28 text-center sm:px-6">
        <Reveal>
          <h2 className="font-display text-[clamp(2.5rem,9vw,7rem)] font-bold uppercase leading-[0.92] tracking-[-0.03em]">
            Have an idea?<br /><span className="split">Make it real.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">Bring your vision. Build with your team. Create something extraordinary.</p>
          <Link to={user ? '/register' : '/signup'} className="btn-primary mt-10">Register now</Link>
          <div className="mx-auto mt-14 h-px w-40 bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}
