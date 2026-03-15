import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

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

import App from "@/App";

describe("App", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders without crashing on the root route", () => {
    window.history.pushState({}, "", "/");
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it("renders the 404 page for an unknown route", () => {
    window.history.pushState({}, "", "/nonexistent-route");
    render(<App />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
