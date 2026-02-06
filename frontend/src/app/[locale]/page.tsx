import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { DualPositioningSection } from '@/components/sections/dual-positioning-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <ServicesSection />
        <ExperienceSection />
        <DualPositioningSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
