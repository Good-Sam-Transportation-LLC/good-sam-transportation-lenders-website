import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { TrendingUp, Users, Globe } from "lucide-react";

const stats = [
  {
    icon: Globe,
    title: "$28.4B",
    desc: "Global luxury ground transportation market size by 2030, growing at 6.2% CAGR.",
  },
  {
    icon: Users,
    title: "3.2M+",
    desc: "LA metro corporate travelers annually, with premium segment growing 2x market rate.",
  },
  {
    icon: TrendingUp,
    title: "12%",
    desc: "Annual growth in LA-based VIP/corporate chauffeur demand, outpacing national average.",
  },
];

const MarketSection = () => (
  <section id="market" className="border-b border-border py-24">
    <div className="container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-4xl"
      >
        <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Market Opportunity
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
          The LA Luxury Transport Market Is Expanding
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-16 max-w-2xl text-muted-foreground">
          Corporate travel, entertainment industry logistics, and high-net-worth personal transport
          create a resilient, high-margin revenue base in the Los Angeles market.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((s) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              className="rounded-lg border border-border bg-card p-6"
            >
              <s.icon size={20} className="mb-4 text-primary" />
              <p className="font-mono-data text-3xl font-semibold text-foreground">{s.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Competitive Moat:</span> Good Sam Transportation's
            premium positioning, exclusive corporate contracts, and 85% client retention rate create
            significant barriers to entry in the LA luxury segment.
          </p>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default MarketSection;
