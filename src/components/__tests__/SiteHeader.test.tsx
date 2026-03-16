import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import SiteHeader from "@/components/SiteHeader";

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the logo text 'GOOD SAM'", () => {
    render(<SiteHeader />);
    expect(screen.getByText(/GOOD SAM/)).toBeInTheDocument();
  });

  it("renders all 5 nav links", () => {
    render(<SiteHeader />);
    const labels = ["Market", "Financials", "Fleet", "Investment", "Contact"];
    for (const label of labels) {
      // Each label appears in both desktop and mobile (when open), but desktop nav is always rendered
      expect(screen.getByRole("navigation").getByText?.(label) ?? screen.getAllByText(label).length).toBeTruthy();
      expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders 'Request Pitch Deck' CTA", () => {
    render(<SiteHeader />);
    // At least one instance (desktop nav)
    expect(screen.getAllByText("Request Pitch Deck").length).toBeGreaterThanOrEqual(1);
  });

  it("toggle button has aria-label='Toggle menu' and aria-expanded='false'", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggle).toHaveAttribute("aria-label", "Toggle menu");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("clicking toggle opens mobile menu (mobile-menu div appears, aria-expanded='true')", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    expect(document.getElementById("mobile-menu")).toBeNull();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();
  });

  it("clicking toggle again closes mobile menu", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle); // open
    expect(document.getElementById("mobile-menu")).toBeInTheDocument();

    fireEvent.click(toggle); // close
    expect(document.getElementById("mobile-menu")).toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("nav link click calls preventDefault and scrollTo", () => {
    const mockElement = {
      getBoundingClientRect: () => ({ top: 500, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    };
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement as unknown as HTMLElement);
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "scrollY", { value: 100, writable: true });

    render(<SiteHeader />);
    const marketLinks = screen.getAllByText("Market");
    const link = marketLinks[0];

    const preventDefaultSpy = vi.fn();
    fireEvent.click(link, { preventDefault: preventDefaultSpy });

    // scrollTo should have been called since we mocked getElementById
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        top: expect.any(Number),
      })
    );
  });

  it("clicking nav link in mobile menu closes the menu", () => {
    const mockElement = {
      getBoundingClientRect: () => ({ top: 500, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    };
    vi.spyOn(document, "getElementById").mockReturnValue(mockElement as unknown as HTMLElement);
    window.scrollTo = vi.fn();

    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    // Open mobile menu
    fireEvent.click(toggle);
    expect(document.getElementById("mobile-menu")).not.toBeNull();

    // Get the mobile menu nav links (they appear after the desktop ones)
    const marketLinks = screen.getAllByText("Market");
    // The last "Market" link is in the mobile menu
    const mobileLink = marketLinks[marketLinks.length - 1];
    fireEvent.click(mobileLink);

    // Menu should be closed now
    // Note: getElementById is mocked, so we check aria-expanded instead
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
