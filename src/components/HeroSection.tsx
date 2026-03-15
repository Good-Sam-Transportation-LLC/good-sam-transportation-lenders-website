import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { TrendingUp, MapPin } from "lucide-react";

const HeroSection = () => (
  <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />

    <div className="container relative z-10">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl text-center"
      >
        <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs text-muted-foreground">
          <MapPin size={12} className="text-primary" />
          Los Angeles, California
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mb-6 text-4xl leading-tight tracking-tight md:text-6xl lg:text-7xl"
        >
          Luxury Ground Transportation.{" "}
          <span className="text-gold-gradient">Institutional-Grade Returns.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Good Sam Transportation delivers premium chauffeur services in the Los Angeles market—
          generating <span className="font-mono-data font-semibold text-primary">$200,000</span> in
          annual recurring revenue with a lean, asset-backed model ready to scale.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#investment"
            className="rounded-sm bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View Investment Thesis
          </a>
          <a
            href="#financials"
            className="flex items-center gap-2 rounded-sm border border-border px-8 py-3 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            <TrendingUp size={14} className="text-primary" />
            Financial Overview
          </a>
        </motion.div>

        {/* Key metric cards */}
        <motion.div
          variants={fadeUp}
          className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { label: "Annual Revenue", value: "$200K", sub: "ARR" },
            { label: "Net Margin", value: "28%", sub: "After ops" },
            { label: "Fleet Value", value: "$185K", sub: "Asset-backed" },
            { label: "Capital Sought", value: "$500K", sub: "Fleet expansion" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-card/50 p-4 text-center backdrop-blur-sm">
              <p className="font-mono-data text-2xl font-semibold text-primary md:text-3xl">{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
              <p className="text-[10px] text-muted-foreground/60">{m.sub}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
