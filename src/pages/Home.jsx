import { useEffect } from 'react';
import PromoBar from '../components/site/PromoBar.jsx';
import Header from '../components/site/Header.jsx';
import Hero from '../components/site/Hero.jsx';
import Nidification from '../components/site/Nidification.jsx';
import Zone from '../components/site/Zone.jsx';
import HowItWorks from '../components/site/HowItWorks.jsx';
import PublicStats from '../components/site/PublicStats.jsx';
import Consignes from '../components/site/Consignes.jsx';
import ReportModal from '../components/site/ReportModal.jsx';
import AboutModal from '../components/site/AboutModal.jsx';
import PrivacyModal from '../components/site/PrivacyModal.jsx';
import Footer from '../components/site/Footer.jsx';
import { initHome } from '../legacy/home.js';

/* Page d'accueil publique : mêmes sections, même CSS que le site statique. */
export default function Home(){
  useEffect(() => { initHome(); }, []);
  return (
    <>
      <canvas className="swarm-canvas" id="swarm-canvas" aria-hidden="true" />
      <PromoBar />
      <Header />
      <Hero />
      <Nidification />
      <Zone />
      <HowItWorks />
      <PublicStats />
      <Consignes />
      <ReportModal />
      <AboutModal />
      <PrivacyModal />
      <Footer />
    </>
  );
}
