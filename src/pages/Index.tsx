import SiteHeader from "@/components/SiteHeader";
import Ticker from "@/components/Ticker";
import HeroSection from "@/components/HeroSection";
import FinancialsSection from "@/components/FinancialsSection";
import MarketSection from "@/components/MarketSection";
import FleetSection from "@/components/FleetSection";
import InvestmentSection from "@/components/InvestmentSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Ticker />
      <HeroSection />
      <FinancialsSection />
      <MarketSection />
      <FleetSection />
      <InvestmentSection />
      <ContactSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
