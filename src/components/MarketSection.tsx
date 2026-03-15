import { motion } from "framer-motion";
import { Target, Users, TrendingUp, Zap } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const advantages = [
  { icon: Target, title: "The Luxury Gap", desc: "Corporate and VIP clients consistently report dissatisfaction with existing ground transportation. Good Sam fills this premium service void." },
  { icon: Users, title: "94% Client Retention", desc: "Our white-glove approach generates repeat corporate contracts — the highest retention rate in our regional market." },
  { icon: TrendingUp, title: "$28B Market by 2028", desc: "The U.S. luxury ground transportation market is projected to grow at 6.2% CAGR, driven by corporate travel recovery." },
  { icon: Zap, title: "Low CAC, High LTV", desc: "Referral-driven acquisition keeps CAC under $120 while average client lifetime value exceeds $14,000." },
];

const MarketSection = () => (
  <section id="market" className="border-t border-border py-24">
    <div className="section-container">
      <motion.p {...fadeUp()} className="data-mono text-xs uppercase tracking-[0.2em] text-gold">Market Opportunity</motion.p>
      <motion.h2 {...fadeUp(0.05)} className="mt-3 max-w-xl text-3xl font-semibold text-foreground md:text-4xl">Positioned in a Growing, Underserved Market</motion.h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {advantages.map((item, i) => (
          <motion.div key={item.title} {...fadeUp(0.1 + i * 0.05)} className="glass-card flex gap-5 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10">
              <item.icon className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default MarketSection;
