import Header from "@/components/landing/sections/Header";
import HeroSection from "@/components/landing/sections/HeroSection";
import MarqueeSection from "@/components/landing/sections/MarqueeSection";
import FeaturesSection from "@/components/landing/sections/FeaturesSection";
import HowItWorksSection from "@/components/landing/sections/HowItWorksSection";
import FAQSection from "@/components/landing/sections/FAQSection";
import Footer from "@/components/landing/sections/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen selection:bg-accent selection:text-white">
      <Header />
      <HeroSection />
      <MarqueeSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
