import { Hero } from '@/components/landing/hero';
import { WhyChooseUs } from '@/components/landing/why-choose-us';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { PricingCards } from '@/components/landing/pricing-cards';
import { Testimonials } from '@/components/landing/testimonials';
import { CtaSection } from '@/components/landing/cta-section';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <FeaturesGrid />
      <PricingCards />
      <Testimonials />
      <CtaSection />
    </>
  );
}
