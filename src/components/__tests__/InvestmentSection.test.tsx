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
          const { variants: _variants, initial: _initial, animate: _animate, whileInView: _whileInView, viewport: _viewport, transition: _transition, ...rest } = props;
          return React.createElement(String(prop), { ...rest, ref });
        }),
    }
  ),
}));

import InvestmentSection from "@/components/InvestmentSection";

describe("InvestmentSection", () => {
  it("renders section with id='investment'", () => {
    const { container } = render(<InvestmentSection />);
    expect(container.querySelector("#investment")).toBeInTheDocument();
  });

  it("renders capital allocation percentages and amounts", () => {
    render(<InvestmentSection />);
    expect(screen.getByText(/Fleet Expansion/)).toBeInTheDocument();
    expect(screen.getByText("$350K")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();

    expect(screen.getByText("Technology & Platform")).toBeInTheDocument();
    expect(screen.getByText("$100K")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();

    expect(screen.getByText("Marketing & Client Acquisition")).toBeInTheDocument();
    expect(screen.getByText("$50K")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("renders risk mitigation items", () => {
    render(<InvestmentSection />);
    expect(screen.getByText("14-month average vehicle payback period")).toBeInTheDocument();
    expect(screen.getByText("All vehicles serve as loan collateral (asset-backed)")).toBeInTheDocument();
    expect(screen.getByText("Revenue scales linearly with each vehicle added")).toBeInTheDocument();
    expect(screen.getByText("Existing operational playbook reduces execution risk")).toBeInTheDocument();
    expect(screen.getByText("85% client retention provides predictable cash flow")).toBeInTheDocument();
    expect(screen.getByText(/No technology or R&D risk/)).toBeInTheDocument();
  });

  it("renders ROI summary metrics", () => {
    render(<InvestmentSection />);
    expect(screen.getByText(/3–4×/)).toBeInTheDocument();
    expect(screen.getByText("Target ROI")).toBeInTheDocument();
    expect(screen.getByText("14 mo")).toBeInTheDocument();
    expect(screen.getByText("Payback Period")).toBeInTheDocument();
    expect(screen.getByText("$800K")).toBeInTheDocument();
    expect(screen.getByText("Projected Y2 ARR")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Collateral Coverage")).toBeInTheDocument();
  });
});
