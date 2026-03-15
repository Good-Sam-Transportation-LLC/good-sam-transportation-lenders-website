import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactSection from "@/components/ContactSection";
import { Toaster } from "@/components/ui/toaster";

const mockInvoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(() => ({
    functions: {
      invoke: mockInvoke,
    },
  })),
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

  it("invokes send-investor-inquiry Edge Function on submit success", async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: null });

    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "send-investor-inquiry",
        expect.objectContaining({
          body: expect.objectContaining({
            full_name: "Jane Smith",
            email: "jane@example.com",
            investment_interest: "Equity",
          }),
        })
      );
    });
  });

  it("shows a destructive toast when the Supabase Edge Function fails", async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: "Edge Function error", code: "42501", details: "", hint: "" },
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
    mockInvoke.mockResolvedValueOnce({ data: null, error: null });
    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "send-investor-inquiry",
        expect.any(Object)
      );
    });
  });
});
