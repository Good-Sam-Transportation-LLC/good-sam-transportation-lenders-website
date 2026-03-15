import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";

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
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}));

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(() => ({
    functions: { invoke: vi.fn() },
  })),
}));

import Index from "@/pages/Index";

describe("Index page", () => {
  it("renders without crashing", () => {
    const { container } = renderWithProviders(<Index />);
    expect(container).toBeTruthy();
  });

  it('contains section id "market"', () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector("#market")).toBeInTheDocument();
  });

  it('contains section id "financials"', () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector("#financials")).toBeInTheDocument();
  });

  it('contains section id "fleet"', () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector("#fleet")).toBeInTheDocument();
  });

  it('contains section id "investment"', () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector("#investment")).toBeInTheDocument();
  });

  it('contains section id "contact"', () => {
    const { container } = renderWithProviders(<Index />);
    expect(container.querySelector("#contact")).toBeInTheDocument();
  });

  it('renders the header with "GOOD SAM"', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText(/GOOD SAM/)).toBeInTheDocument();
  });

  it("renders the footer with copyright text", () => {
    renderWithProviders(<Index />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${year} Good Sam Transportation`))
    ).toBeInTheDocument();
  });
});
