import { useEffect, useRef, useState } from 'react';

/** Fades/slides children in when scrolled into view (CSS .reveal; instant under reduced motion). */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShown(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${shown ? 'in' : ''} ${className}`} {...rest}>{children}</Tag>;
}
