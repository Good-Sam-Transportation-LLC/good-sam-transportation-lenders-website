const metrics = [
  "28% Net Margin",
  "85% Client Retention",
  "92% Fleet Utilization",
  "$185K Asset Value",
  "$200K ARR",
  "3 Luxury Vehicles",
  "Los Angeles Market",
  "20-35% Profit Margin",
];

const Ticker = () => (
  <section className="overflow-hidden border-y border-border bg-secondary/30 py-3">
    <div className="animate-ticker flex w-max gap-12">
      {[...metrics, ...metrics].map((m, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-primary" />
          <span className="font-mono-data">{m}</span>
        </span>
      ))}
    </div>
  </section>
);

export default Ticker;
