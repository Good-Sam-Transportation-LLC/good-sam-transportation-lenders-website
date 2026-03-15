import { render, screen } from "@testing-library/react";
import SiteFooter from "@/components/SiteFooter";

describe("SiteFooter", () => {
  it("renders 'Good Sam' and 'Transportation'", () => {
    render(<SiteFooter />);
    // "Good Sam" appears in both the brand line and copyright; use getAllByText
    const goodSamMatches = screen.getAllByText(/Good Sam/);
    expect(goodSamMatches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Transportation")).toBeInTheDocument();
  });

  it("renders copyright with the current year", () => {
    render(<SiteFooter />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
  });

  it("renders 3 footer links: Privacy, Terms, SEC Disclosures", () => {
    render(<SiteFooter />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
    expect(screen.getByText("Terms")).toBeInTheDocument();
    expect(screen.getByText("SEC Disclosures")).toBeInTheDocument();
  });
});
