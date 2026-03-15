import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFound from "@/pages/NotFound";

describe("NotFound page", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const renderNotFound = (route = "/nonexistent") =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <NotFound />
      </MemoryRouter>
    );

  it('renders "404" heading', () => {
    renderNotFound();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it('renders "Page not found" text', () => {
    renderNotFound();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });

  it('renders "Return to Home" link with href="/"', () => {
    renderNotFound();
    const link = screen.getByText("Return to Home");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/");
  });

  it("calls console.error on mount with the pathname", () => {
    renderNotFound("/some-bad-path");
    expect(consoleSpy).toHaveBeenCalledWith(
      "404 Error: User attempted to access non-existent route:",
      "/some-bad-path"
    );
  });
});
