import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const React = require("react");
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.forwardRef((props: Record<string, any>, ref: any) => {
          const { variants, initial, animate, whileInView, viewport, transition, ...rest } = props;
          return React.createElement(String(prop), { ...rest, ref });
        }),
    }
  ),
}));

vi.mock("recharts", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResponsiveContainer: ({ children }: any) => children,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

import RevenueChartSection from "@/components/RevenueChartSection";

describe("RevenueChartSection", () => {
  it("renders heading", () => {
    render(<RevenueChartSection />);
    expect(screen.getByText(/From \$200K to \$800K ARR/)).toBeInTheDocument();
  });

  it("renders 3 summary metrics: '$200K', '$610K', '$800K'", () => {
    render(<RevenueChartSection />);
    expect(screen.getByText("$200K")).toBeInTheDocument();
    expect(screen.getByText("$610K")).toBeInTheDocument();
    expect(screen.getByText("$800K")).toBeInTheDocument();

    expect(screen.getByText("Current ARR")).toBeInTheDocument();
    expect(screen.getByText("Projected Y1 ARR")).toBeInTheDocument();
    expect(screen.getByText("Projected Y2 ARR")).toBeInTheDocument();
  });

  it("renders legend text", () => {
    render(<RevenueChartSection />);
    expect(screen.getByText("Actual Revenue")).toBeInTheDocument();
    expect(screen.getByText("Projected (Post-Funding)")).toBeInTheDocument();
  });
});
