import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/HeroSection";
import Ticker from "@/components/Ticker";
import MarketSection from "@/components/MarketSection";
import FinancialsSection from "@/components/FinancialsSection";
import FleetSection from "@/components/FleetSection";
import InvestmentSection from "@/components/InvestmentSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SiteHeader />
    <HeroSection />
    <Ticker />
    <MarketSection />
    <FinancialsSection />
    <FleetSection />
    <InvestmentSection />
    <ContactSection />
    <SiteFooter />
  </div>
);

export default Index;
