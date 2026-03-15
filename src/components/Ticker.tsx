const items = [
  "Fleet Utilization: 87%",
  "YoY Revenue Growth: +34%",
  "Client Retention: 94%",
  "Avg. Trip Value: $485",
  "Operating Margin: 42%",
  "Asset Portfolio: $1.2M",
  "Corporate Accounts: 28+",
  "Monthly Bookings: 140+",
];

const Ticker = () => {
  return (
    <div className="w-full overflow-hidden border-b border-border bg-surface py-2.5">
      <div className="ticker-scroll flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => {
          const isDuplicate = i >= items.length;
          return (
            <span
              key={i}
              aria-hidden={isDuplicate}
              className="data-mono mx-8 text-xs tracking-wide text-muted-foreground"
            >
              <span
                className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold"
                aria-hidden="true"
                role="presentation"
              />
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Ticker;
