import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactSection from "@/components/ContactSection";
import { Toaster } from "@/components/ui/toaster";

const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(() => ({ from: mockFrom })),
}));

const renderWithToaster = () =>
  render(
    <>
      <Toaster />
      <ContactSection />
    </>
  );

describe("ContactSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("limits investment_interest input to 200 characters to match server/db contract", () => {
    renderWithToaster();
    const input = screen.getByRole("textbox", { name: /investment interest/i });
    expect(input).toHaveAttribute("maxlength", "200");
  });

  it("inserts form data into investor_inquiries on submit success", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });

    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("investor_inquiries");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: "Jane Smith",
          email: "jane@example.com",
          investment_interest: "Equity",
        })
      );
    });
  });

  it("shows a destructive toast when the Supabase insert fails", async () => {
    mockInsert.mockResolvedValueOnce({
      error: { message: "DB error", code: "42501", details: "", hint: "" },
    });

    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });

  it("uses getSupabaseClient (not a raw supabase export)", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith("investor_inquiries");
    });
  });
});
