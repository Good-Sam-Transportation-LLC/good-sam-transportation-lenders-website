import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Ticker from "@/components/Ticker";

describe("Ticker", () => {
  it("renders all ticker items (duplicated for scrolling)", () => {
    render(<Ticker />);
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

    for (const item of items) {
      const matches = screen.getAllByText(item);
      expect(matches).toHaveLength(2);
    }
  });

  it("second set of items has aria-hidden='true'", () => {
    render(<Ticker />);
    const allSpans = screen.getAllByText("Fleet Utilization: 87%");
    expect(allSpans).toHaveLength(2);
    // First instance should not be aria-hidden (React renders false as "false")
    expect(allSpans[0]).toHaveAttribute("aria-hidden", "false");
    // Second instance (duplicate) should be aria-hidden
    expect(allSpans[1]).toHaveAttribute("aria-hidden", "true");
  });
});
