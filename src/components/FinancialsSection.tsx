import { motion } from "framer-motion";
import { TrendingUp, DollarSign, BarChart3, Shield } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const unitEconomics = [
  { label: "Avg. Revenue / Vehicle / Month", value: "$8,300", icon: DollarSign },
  { label: "Operating Cost / Vehicle / Month", value: "$4,800", icon: BarChart3 },
  { label: "Net Margin / Vehicle", value: "$3,500", icon: TrendingUp },
  { label: "Payback Period per Asset", value: "14 mo", icon: Shield },
];

const revenueData = [
  { year: "2022", value: 85 },
  { year: "2023", value: 140 },
  { year: "2024", value: 200 },
  { year: "2025 (P)", value: 340 },
  { year: "2026 (P)", value: 520 },
];

const FinancialsSection = () => {
  const maxVal = Math.max(...revenueData.map((d) => d.value));

  return (
    <section id="financials" className="py-24">
      <div className="section-container">
        <motion.p {...fadeUp()} className="data-mono text-xs uppercase tracking-[0.2em] text-gold">Financial Performance</motion.p>
        <motion.h2 {...fadeUp(0.05)} className="mt-3 max-w-xl text-3xl font-semibold text-foreground md:text-4xl">Unit Economics That Scale</motion.h2>
        <motion.p {...fadeUp(0.1)} className="mt-4 max-w-2xl text-muted-foreground">
          Each vehicle operates as an independent profit center. Our model multiplies — not merely adds — with every fleet expansion.
        </motion.p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {unitEconomics.map((item, i) => (
            <motion.div key={item.label} {...fadeUp(0.1 + i * 0.05)} className="glass-card px-5 py-6">
              <item.icon className="h-5 w-5 text-gold" />
              <p className="data-mono mt-4 text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp(0.2)} className="glass-card mt-12 p-6 md:p-8">
          <p className="data-mono text-xs uppercase tracking-wider text-muted-foreground">Revenue Trajectory ($K)</p>
          <div className="mt-6 flex items-end gap-3 md:gap-6" style={{ height: 220 }}>
            {revenueData.map((d) => {
              const height = (d.value / maxVal) * 100;
              const isProjected = d.year.includes("P");
              return (
                <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
                  <span className="data-mono text-xs text-foreground">${d.value}K</span>
                  <div
                    className={`w-full rounded-t-md transition-all ${isProjected ? "border border-dashed border-gold/40 bg-gold/10" : "bg-gold"}`}
                    style={{ height: `${height}%`, minHeight: 8 }}
                  />
                  <span className="data-mono text-[10px] text-muted-foreground">{d.year}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Dashed bars represent projected revenue post-funding.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FinancialsSection;
