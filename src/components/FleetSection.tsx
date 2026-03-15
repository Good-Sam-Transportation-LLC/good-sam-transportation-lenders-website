import { motion } from "framer-motion";
import { Shield, Wrench, Clock, Star } from "lucide-react";
import { fadeUpProps } from "@/lib/motion";

const vehicles = [
  { name: "Cadillac Escalade ESV", year: "2023", value: "$95,000", status: "Active", utilization: "91%" },
  { name: "Mercedes-Benz S-Class", year: "2024", value: "$115,000", status: "Active", utilization: "87%" },
  { name: "Lincoln Navigator L", year: "2023", value: "$85,000", status: "Active", utilization: "83%" },
];

const protocols = [
  { icon: Wrench, label: "Preventive maintenance every 5,000 mi" },
  { icon: Shield, label: "Full commercial insurance coverage" },
  { icon: Clock, label: "24/7 roadside assistance" },
  { icon: Star, label: "Interior detail after every trip" },
];

const FleetSection = () => (
  <section id="fleet" className="border-t border-border py-24">
    <div className="section-container">
      <motion.p {...fadeUpProps()} className="data-mono text-xs uppercase tracking-[0.2em] text-gold">Fleet & Operations</motion.p>
      <motion.h2 {...fadeUpProps(0.05)} className="mt-3 max-w-xl text-3xl font-semibold text-foreground md:text-4xl">Premium Assets, Institutional Standards</motion.h2>
      <motion.p {...fadeUpProps(0.1)} className="mt-4 max-w-2xl text-muted-foreground">
        Every vehicle is a depreciating asset managed like an appreciating one — through rigorous maintenance, high utilization, and premium positioning.
      </motion.p>

      <motion.div {...fadeUpProps(0.15)} className="glass-card mt-12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Vehicle", "Year", "Asset Value", "Utilization", "Status"].map((h) => (
                  <th key={h} className="data-mono px-6 py-4 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.name} className="border-b border-border/50 last:border-0">
                  <td className="px-6 py-4 font-medium text-foreground">{v.name}</td>
                  <td className="data-mono px-6 py-4 text-muted-foreground">{v.year}</td>
                  <td className="data-mono px-6 py-4 text-foreground">{v.value}</td>
                  <td className="data-mono px-6 py-4 text-gold">{v.utilization}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {protocols.map((p, i) => (
          <motion.div key={p.label} {...fadeUpProps(0.2 + i * 0.05)} className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <p.icon className="h-4 w-4 shrink-0 text-gold" />
            <span className="text-xs text-muted-foreground">{p.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FleetSection;
