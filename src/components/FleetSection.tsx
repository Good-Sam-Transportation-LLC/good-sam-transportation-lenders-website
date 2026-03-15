import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fleet = [
  {
    vehicle: "Cadillac Escalade ESV",
    year: 2023,
    type: "Full-Size Luxury SUV",
    value: "$72,000",
    utilization: "94%",
    revenueMonth: "$6,200",
  },
  {
    vehicle: "Mercedes-Benz S 580",
    year: 2024,
    type: "Executive Sedan",
    value: "$68,000",
    utilization: "91%",
    revenueMonth: "$5,800",
  },
  {
    vehicle: "Lincoln Navigator",
    year: 2023,
    type: "Premium SUV",
    value: "$45,000",
    utilization: "88%",
    revenueMonth: "$4,700",
  },
];

const FleetSection = () => (
  <section id="fleet" className="border-b border-border py-24">
    <div className="container">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-5xl"
      >
        <motion.p variants={fadeUp} className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
          Fleet & Assets
        </motion.p>
        <motion.h2 variants={fadeUp} className="mb-4 text-3xl md:text-5xl">
          Asset-Backed Cash Flow
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-12 max-w-2xl text-muted-foreground">
          Every dollar of revenue is backed by depreciating but high-value physical assets,
          providing downside protection for lenders and tangible collateral.
        </motion.p>

        <motion.div variants={fadeUp} className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary">Vehicle</TableHead>
                <TableHead className="text-primary">Year</TableHead>
                <TableHead className="text-primary hidden md:table-cell">Class</TableHead>
                <TableHead className="text-primary text-right">Value</TableHead>
                <TableHead className="text-primary text-right hidden sm:table-cell">Utilization</TableHead>
                <TableHead className="text-primary text-right">Rev/mo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fleet.map((v) => (
                <TableRow key={v.vehicle} className="border-border">
                  <TableCell className="font-medium text-foreground">{v.vehicle}</TableCell>
                  <TableCell className="font-mono-data text-muted-foreground">{v.year}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{v.type}</TableCell>
                  <TableCell className="font-mono-data text-right text-foreground">{v.value}</TableCell>
                  <TableCell className="font-mono-data text-right text-foreground hidden sm:table-cell">{v.utilization}</TableCell>
                  <TableCell className="font-mono-data text-right text-primary">{v.revenueMonth}</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-border bg-secondary/30">
                <TableCell className="font-semibold text-foreground" colSpan={3}>Total Fleet Valuation</TableCell>
                <TableCell className="font-mono-data text-right font-semibold text-primary">$185,000</TableCell>
                <TableCell className="font-mono-data text-right font-semibold text-foreground hidden sm:table-cell">92%</TableCell>
                <TableCell className="font-mono-data text-right font-semibold text-primary">$16,700</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

export default FleetSection;
