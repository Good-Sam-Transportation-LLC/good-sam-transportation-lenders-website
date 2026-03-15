import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const fundBreakdown = [
  { label: "Fleet Expansion", pct: 70, detail: "2-3 new premium vehicles" },
  { label: "Operations & Technology", pct: 20, detail: "Dispatch systems, hiring" },
  { label: "Marketing & BD", pct: 10, detail: "Corporate client acquisition" },
];

const riskMitigators = [
  "Hard asset collateral — vehicles retain 60-70% residual value",
  "Proven revenue model with 3+ years operating history",
  "Diversified client base across corporate and VIP segments",
  "Low fixed overhead with variable cost structure",
  "Experienced operator with deep industry relationships",
];

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const InvestmentSection = () => (
  <section id="investment" className="border-t border-border py-24">
    <div className="section-container">
      <motion.p {...fadeUp()} className="data-mono text-xs uppercase tracking-[0.2em] text-gold">The Investment Opportunity</motion.p>
      <motion.h2 {...fadeUp(0.05)} className="mt-3 max-w-xl text-3xl font-semibold text-foreground md:text-4xl">Capital Deployed, Returns Multiplied</motion.h2>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <motion.div {...fadeUp(0.1)} className="glass-card-gold p-6 md:p-8">
          <h3 className="text-sm font-semibold text-foreground">Proposed Use of Funds</h3>
          <div className="mt-6 space-y-5">
            {fundBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="data-mono text-sm font-semibold text-gold">{item.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gold"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease, delay: 0.3 }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.15)} className="glass-card p-6 md:p-8">
          <h3 className="text-sm font-semibold text-foreground">Risk Mitigation for Lenders</h3>
          <ul className="mt-6 space-y-4">
            {riskMitigators.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-sm leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default InvestmentSection;
