import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUpAnimate } from "@/lib/motion";

const metrics = [
  { label: "Annual Revenue", value: "$200K+", sub: "Proven Cash Flow" },
  { label: "Operating Margin", value: "42%", sub: "High Efficiency" },
  { label: "Asset Valuation", value: "$1.2M", sub: "Collateral-Backed" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />
      <div className="section-container relative z-10">
        <motion.p {...fadeUpAnimate(0)} className="data-mono mb-6 text-xs uppercase tracking-[0.2em] text-gold">
          Investor Relations — Good Sam Transportation
        </motion.p>
        <motion.h1 {...fadeUpAnimate(0.1)} className="max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Scaling a Proven <span className="text-gold-gradient">$200K</span> Luxury Transportation Model
        </motion.h1>
        <motion.p {...fadeUpAnimate(0.2)} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Asset-backed growth, high-utilization unit economics, and a clear path to market leadership in premium ground transportation.
        </motion.p>
        <motion.div {...fadeUpAnimate(0.3)} className="mt-10 flex flex-wrap gap-4">
          <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110">
            Request Pitch Deck <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#financials" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-surface-elevated">
            View Financials
          </a>
        </motion.div>
        <motion.div {...fadeUpAnimate(0.45)} className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card px-6 py-6">
              <p className="data-mono text-xs uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-3xl font-semibold text-gold">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
