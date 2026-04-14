import Navbar from "@/components/landing-page/Navbar";
import HeroSection from "@/components/landing-page/HeroSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HowItWorks from "@/components/landing-page/HowItWorks";
import FooterCTA from "@/components/landing-page/FooterCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground">
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#84934A]/15 via-white/20 to-transparent" />
          <div className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 lg:px-8">
            <HeroSection />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FeaturesSection />
          <HowItWorks />
          <FooterCTA />
        </div>
      </main>
    </>
  );
}
