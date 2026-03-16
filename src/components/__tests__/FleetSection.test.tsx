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

import FleetSection from "@/components/FleetSection";

describe("FleetSection", () => {
  it("renders section with id='fleet'", () => {
    const { container } = render(<FleetSection />);
    expect(container.querySelector("#fleet")).toBeInTheDocument();
  });

  it("renders 3 vehicle names in table", () => {
    render(<FleetSection />);
    expect(screen.getByText("Cadillac Escalade ESV")).toBeInTheDocument();
    expect(screen.getByText("Mercedes-Benz S-Class")).toBeInTheDocument();
    expect(screen.getByText("Lincoln Navigator L")).toBeInTheDocument();
  });

  it("renders utilization percentages", () => {
    render(<FleetSection />);
    expect(screen.getByText("91%")).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
    expect(screen.getByText("83%")).toBeInTheDocument();
  });

  it("renders 'Active' statuses", () => {
    render(<FleetSection />);
    const activeStatuses = screen.getAllByText("Active");
    expect(activeStatuses).toHaveLength(3);
  });

  it("renders 4 operational protocols", () => {
    render(<FleetSection />);
    expect(screen.getByText("Preventive maintenance every 5,000 mi")).toBeInTheDocument();
    expect(screen.getByText("Full commercial insurance coverage")).toBeInTheDocument();
    expect(screen.getByText("24/7 roadside assistance")).toBeInTheDocument();
    expect(screen.getByText("Interior detail after every trip")).toBeInTheDocument();
  });
});
