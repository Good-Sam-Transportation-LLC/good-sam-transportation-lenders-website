import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

const metrics = [
  { label: "Revenue Per Vehicle", value: "$66,700", note: "Annual avg across fleet" },
  { label: "Monthly Net Yield", value: "$4,600", note: "Per vehicle after all costs" },
  { label: "Vehicle Payback Period", value: "14 mo", note: "Full capital recovery" },
  { label: "Gross Margin", value: "52%", note: "Before SG&A" },
  { label: "Net Margin", value: "28%", note: "After all operating costs" },
  { label: "EBITDA", value: "$56K", note: "Annualized, current run-rate" },
];

const FinancialsSection = () => (
  <section id="financials" className="border-b border-border py-24">
    <div className="container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-5xl"
      >
        <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Unit Economics
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
          Proven, Profitable Operations
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-16 max-w-2xl text-muted-foreground">
          Every vehicle in our fleet is a cash-generating asset. Our lean operational model delivers
          strong margins with clear visibility into per-unit returns.
        </motion.p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <motion.div
              key={m.label}
              variants={fadeUp}
              className="rounded-lg border border-border bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="font-mono-data mt-2 text-3xl font-semibold text-foreground">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{m.note}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinancialsSection;
