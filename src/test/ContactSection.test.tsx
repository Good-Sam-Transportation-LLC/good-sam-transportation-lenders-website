import { render, screen } from "@testing-library/react";
import ContactSection from "@/components/ContactSection";

describe("ContactSection", () => {
  it("limits investment_interest input to 200 characters to match server/db contract", () => {
    render(<ContactSection />);
    const input = screen.getByRole("textbox", { name: /investment interest/i });
    expect(input).toHaveAttribute("maxlength", "200");
  });
});
