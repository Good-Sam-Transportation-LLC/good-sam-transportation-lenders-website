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

import HeroSection from "@/components/HeroSection";

describe("HeroSection", () => {
  it("renders headline containing 'Luxury Ground Transportation'", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Luxury Ground Transportation/)).toBeInTheDocument();
  });

  it("renders location badge 'Los Angeles, California'", () => {
    render(<HeroSection />);
    expect(screen.getByText("Los Angeles, California")).toBeInTheDocument();
  });

  it("renders 4 metric values and labels", () => {
    render(<HeroSection />);
    expect(screen.getByText("$200K")).toBeInTheDocument();
    expect(screen.getByText("28%")).toBeInTheDocument();
    expect(screen.getByText("$185K")).toBeInTheDocument();
    expect(screen.getByText("$500K")).toBeInTheDocument();

    expect(screen.getByText("Annual Revenue")).toBeInTheDocument();
    expect(screen.getByText("Net Margin")).toBeInTheDocument();
    expect(screen.getByText("Fleet Value")).toBeInTheDocument();
    expect(screen.getByText("Capital Sought")).toBeInTheDocument();
  });

  it("renders CTA buttons with correct hrefs", () => {
    render(<HeroSection />);
    const investmentLink = screen.getByText("View Investment Thesis");
    expect(investmentLink.closest("a")).toHaveAttribute("href", "#investment");

    const financialsLink = screen.getByText("Financial Overview");
    expect(financialsLink.closest("a")).toHaveAttribute("href", "#financials");
  });
});
