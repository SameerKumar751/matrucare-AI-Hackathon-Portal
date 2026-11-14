import { Link } from 'react-router-dom';
export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-fg" aria-label="MatruCare AI home">
      <svg viewBox="0 0 32 32" className="h-7 w-7 transition-transform duration-500 group-hover:rotate-90" aria-hidden="true">
        <path d="M16 3 28 16 16 29 4 16Z" fill="none" stroke="#00E5FF" strokeWidth="1.5" />
        <path d="M16 9 22 16 16 23 10 16Z" fill="#F5C879" />
      </svg>
      MATRUCARE<span className="text-magenta">.</span>AI
    </Link>
  );
}
