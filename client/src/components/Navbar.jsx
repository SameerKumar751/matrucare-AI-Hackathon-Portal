import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Subtle blur + border once the page scrolls
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const handleLogout = async () => { setOpen(false); await logout(); navigate('/'); };
  const close = () => setOpen(false);
  const linkCls = ({ isActive }) => `nav-link ${isActive ? '!text-neon' : ''}`;

  const links = (
    <>
      <NavLink to="/" end className={linkCls} onClick={close}>Home</NavLink>
      <Link to="/#about" className="nav-link" onClick={close}>About</Link>
      <NavLink to="/contact" className={linkCls} onClick={close}>Contact</NavLink>
      {user ? (
        <>
          <NavLink to="/dashboard" className={linkCls} onClick={close}>Dashboard</NavLink>
          <button onClick={handleLogout} className="nav-link">Logout</button>
          <Link to="/register" className="btn-primary !px-4 !py-2" onClick={close}>Register now</Link>
        </>
      ) : (
        <>
          <NavLink to="/login" className={linkCls} onClick={close}>Login</NavLink>
          <Link to="/signup" className="btn-primary !px-4 !py-2" onClick={close}>Register now</Link>
        </>
      )}
    </>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled || open ? 'border-white/10 bg-void/75 backdrop-blur-md' : 'border-transparent bg-transparent'}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">{links}</div>
        <button className="rounded p-2 text-fg md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && <div className="flex flex-col items-start gap-6 border-t border-white/10 bg-void/95 px-6 py-8 backdrop-blur-md md:hidden">{links}</div>}
    </header>
  );
}
