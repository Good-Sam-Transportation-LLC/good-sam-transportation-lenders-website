import { renderHook } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  it("returns false when innerWidth >= 768 (default mock has 1024)", () => {
    // jsdom default innerWidth is 1024
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true when innerWidth < 768", () => {
    const original = window.innerWidth;
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Restore
    Object.defineProperty(window, "innerWidth", {
      value: original,
      writable: true,
      configurable: true,
    });
  });
});
