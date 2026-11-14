import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout() {
  const { pathname, hash } = useLocation();
  // Scroll to #section links, otherwise to top on route change
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 50);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="ambient" aria-hidden="true" />
      <Navbar />
      {/* Home's hero sits under the transparent navbar; internal pages clear it */}
      <main className={`relative z-10 flex-1 ${pathname === '/' ? '' : 'pt-16'}`}><Outlet /></main>
      <div className="relative z-10"><Footer /></div>
    </div>
  );
}
