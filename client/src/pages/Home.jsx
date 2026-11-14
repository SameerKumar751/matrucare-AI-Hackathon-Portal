import Hero from '../components/home/Hero.jsx';
import Highlights from '../components/home/Highlights.jsx';
import Domains from '../components/home/Domains.jsx';
import Timeline from '../components/home/Timeline.jsx';
import Prizes from '../components/home/Prizes.jsx';
import About from '../components/home/About.jsx';
import FinalCta from '../components/home/FinalCta.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Highlights />
      <Domains />
      <Timeline />
      <Prizes />
      <About />
      <FinalCta />
    </>
  );
}
