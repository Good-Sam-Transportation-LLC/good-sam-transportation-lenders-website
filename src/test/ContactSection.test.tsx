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

  it("renders all form field labels", () => {
    renderWithToaster();
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText(/firm/i)).toBeInTheDocument();
    expect(screen.getByText("Investment Interest")).toBeInTheDocument();
    expect(screen.getByText("Message")).toBeInTheDocument();
  });

  it("renders all 4 checkbox labels", () => {
    renderWithToaster();
    expect(screen.getByText("Pitch Deck (PDF)")).toBeInTheDocument();
    expect(screen.getByText("P&L Statements")).toBeInTheDocument();
    expect(screen.getByText("Fleet Valuation Report")).toBeInTheDocument();
    expect(screen.getByText("Schedule a Call")).toBeInTheDocument();
  });

  it("name, email, investment_interest inputs have 'required' attribute", () => {
    renderWithToaster();
    expect(screen.getByLabelText(/full name/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/investment interest/i)).toBeRequired();
  });

  it("firm and message do not have 'required' attribute", () => {
    renderWithToaster();
    expect(screen.getByLabelText(/firm/i)).not.toBeRequired();
    expect(screen.getByLabelText(/message/i)).not.toBeRequired();
  });

  it("submit button shows 'Sending...' during loading state", async () => {
    // Make the invoke hang so loading state persists
    let resolveInvoke: (value: unknown) => void;
    mockInvoke.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveInvoke = resolve;
      })
    );

    renderWithToaster();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Jane Smith" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByLabelText(/investment interest/i), { target: { value: "Equity" } });

    fireEvent.submit(screen.getByRole("button", { name: /submit inquiry/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Sending...")).toBeInTheDocument();
    });

    // Clean up: resolve the promise to avoid act() warnings
    resolveInvoke!({ data: null, error: null });
    await waitFor(() => {
      expect(screen.queryByText("Sending...")).not.toBeInTheDocument();
    });
  });

  it("renders confidentiality notice text", () => {
    renderWithToaster();
    expect(
      screen.getByText(/your information is kept strictly confidential/i)
    ).toBeInTheDocument();
  });
});
