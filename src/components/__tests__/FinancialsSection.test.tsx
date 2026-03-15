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

import FinancialsSection from "@/components/FinancialsSection";

describe("FinancialsSection", () => {
  it("renders section with id='financials'", () => {
    const { container } = render(<FinancialsSection />);
    expect(container.querySelector("#financials")).toBeInTheDocument();
  });

  it("renders all 6 metric values and labels", () => {
    render(<FinancialsSection />);

    // Values
    expect(screen.getByText("$66,700")).toBeInTheDocument();
    expect(screen.getByText("$4,600")).toBeInTheDocument();
    expect(screen.getByText("14 mo")).toBeInTheDocument();
    expect(screen.getByText("52%")).toBeInTheDocument();
    expect(screen.getByText("28%")).toBeInTheDocument();
    expect(screen.getByText("$56K")).toBeInTheDocument();

    // Labels
    expect(screen.getByText("Revenue Per Vehicle")).toBeInTheDocument();
    expect(screen.getByText("Monthly Net Yield")).toBeInTheDocument();
    expect(screen.getByText("Vehicle Payback Period")).toBeInTheDocument();
    expect(screen.getByText("Gross Margin")).toBeInTheDocument();
    expect(screen.getByText("Net Margin")).toBeInTheDocument();
    expect(screen.getByText("EBITDA")).toBeInTheDocument();
  });
});
