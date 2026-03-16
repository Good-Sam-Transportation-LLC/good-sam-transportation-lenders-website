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

import MarketSection from "@/components/MarketSection";

describe("MarketSection", () => {
  it("renders section with id='market'", () => {
    const { container } = render(<MarketSection />);
    expect(container.querySelector("#market")).toBeInTheDocument();
  });

  it("renders 3 stat values", () => {
    render(<MarketSection />);
    expect(screen.getByText("$28.4B")).toBeInTheDocument();
    expect(screen.getByText("3.2M+")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("renders competitive moat with '85%' retention", () => {
    render(<MarketSection />);
    expect(screen.getByText(/85% client retention rate/)).toBeInTheDocument();
  });
});
