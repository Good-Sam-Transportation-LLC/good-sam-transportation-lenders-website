import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const data = [
  { quarter: "Q1 '25", actual: 38, projected: null },
  { quarter: "Q2 '25", actual: 48, projected: null },
  { quarter: "Q3 '25", actual: 54, projected: null },
  { quarter: "Q4 '25", actual: 60, projected: 60 },
  { quarter: "Q1 '26", actual: null, projected: 95 },
  { quarter: "Q2 '26", actual: null, projected: 140 },
  { quarter: "Q3 '26", actual: null, projected: 175 },
  { quarter: "Q4 '26", actual: null, projected: 200 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.dataKey === "actual" ? "Actual" : "Projected"}:{" "}
          <span className="font-mono-data font-semibold text-foreground">${p.value}K</span>
        </p>
      ))}
    </div>
  );
};

const RevenueChartSection = () => (
  <section className="border-b border-border py-24">
    <div className="container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-5xl"
      >
        <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Revenue Trajectory
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
          From $200K to $800K ARR
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-12 max-w-2xl text-muted-foreground">
          Historical quarterly revenue and projected growth post-funding. Fleet expansion from 3 to 7–8
          vehicles drives a 3–4× revenue multiple within 12 months.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card p-4 md:p-8">
          <div className="flex items-center gap-6 mb-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-primary" />
              Actual Revenue
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-6 rounded-full bg-primary/40" style={{ background: "linear-gradient(90deg, hsl(43 52% 54% / 0.6), hsl(43 52% 54% / 0.2))" }} />
              Projected (Post-Funding)
            </span>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(43 52% 54%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(43 52% 54%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(43 52% 54%)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="hsl(43 52% 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(220 20% 18%)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="quarter"
                tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(220 20% 18%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x="Q4 '25"
                stroke="hsl(43 52% 54%)"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: "Funding",
                  position: "top",
                  fill: "hsl(43 52% 54%)",
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(43 52% 54%)"
                strokeWidth={2}
                fill="url(#gradActual)"
                connectNulls={false}
                dot={{ fill: "hsl(43 52% 54%)", r: 3 }}
              />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="hsl(43 52% 54%)"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="url(#gradProjected)"
                connectNulls={false}
                dot={{ fill: "hsl(43 52% 54%)", r: 3, strokeDasharray: "0" }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              { label: "Current ARR", value: "$200K" },
              { label: "Projected Y1 ARR", value: "$610K" },
              { label: "Projected Y2 ARR", value: "$800K" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="font-mono-data text-xl font-semibold text-foreground md:text-2xl">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default RevenueChartSection;
