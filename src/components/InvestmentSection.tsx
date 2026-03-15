import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CheckCircle } from "lucide-react";

const allocations = [
  { label: "Fleet Expansion (4–5 vehicles)", pct: 70, amount: "$350K" },
  { label: "Technology & Platform", pct: 20, amount: "$100K" },
  { label: "Marketing & Client Acquisition", pct: 10, amount: "$50K" },
];

const highlights = [
  "14-month average vehicle payback period",
  "All vehicles serve as loan collateral (asset-backed)",
  "Revenue scales linearly with each vehicle added",
  "Existing operational playbook reduces execution risk",
  "85% client retention provides predictable cash flow",
  "No technology or R&D risk — proven business model",
];

const InvestmentSection = () => (
  <section id="investment" className="border-b border-border py-24">
    <div className="container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-5xl"
      >
        <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Investment Opportunity
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
          $500K Capital Deployment
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-16 max-w-2xl text-muted-foreground">
          Seeking debt or equity financing to triple fleet capacity. Every dollar deployed maps
          directly to revenue-generating assets with a clear, measurable ROI.
        </motion.p>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Allocation */}
          <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-xl text-foreground">Capital Allocation</h3>
            <div className="space-y-5">
              {allocations.map((a) => (
                <div key={a.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{a.label}</span>
                    <span className="font-mono-data font-medium text-foreground">{a.amount}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-muted-foreground">{a.pct}%</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Risk mitigation */}
          <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-6 text-xl text-foreground">Risk Mitigation</h3>
            <ul className="space-y-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-primary" />
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ROI summary */}
        <motion.div variants={fadeUp} className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Target ROI", value: "3–4×" },
            { label: "Payback Period", value: "14 mo" },
            { label: "Projected Y2 ARR", value: "$800K" },
            { label: "Collateral Coverage", value: "100%" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="font-mono-data text-2xl font-semibold text-primary">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default InvestmentSection;
