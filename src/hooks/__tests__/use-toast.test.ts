import { renderHook, act } from "@testing-library/react";
import { useToast, toast } from "@/hooks/use-toast";

describe("useToast", () => {
  it("returns toasts array and toast function", () => {
    const { result } = renderHook(() => useToast());
    expect(Array.isArray(result.current.toasts)).toBe(true);
    expect(typeof result.current.toast).toBe("function");
  });

  it("calling toast() adds a toast with an id", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: "Test" });
    });

    expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
    const added = result.current.toasts.find((t) => t.title === "Test");
    expect(added).toBeDefined();
    expect(added!.id).toBeDefined();
  });

  it("toast() returns an object with id, dismiss, and update", () => {
    let returned: ReturnType<typeof toast>;

    act(() => {
      returned = toast({ title: "Return check" });
    });

    expect(returned!.id).toBeDefined();
    expect(typeof returned!.dismiss).toBe("function");
    expect(typeof returned!.update).toBe("function");
  });

  it("dismiss sets open to false on the toast", () => {
    const { result } = renderHook(() => useToast());
    let returned: ReturnType<typeof toast>;

    act(() => {
      returned = toast({ title: "Dismiss me" });
    });

    act(() => {
      returned!.dismiss();
    });

    const dismissed = result.current.toasts.find((t) => t.id === returned!.id);
    // After dismiss, the toast should have open: false
    if (dismissed) {
      expect(dismissed.open).toBe(false);
    }
  });
});
