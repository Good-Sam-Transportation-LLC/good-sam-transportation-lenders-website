import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional/falsy values", () => {
    const falsy = false as boolean;
    expect(cn("foo", falsy && "bar", null, undefined, "baz")).toBe("foo baz");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("mt-2", "mt-4")).toBe("mt-4");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles arrays (clsx syntax)", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles objects (clsx syntax)", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("handles mixed inputs", () => {
    expect(cn("base", { conditional: true }, ["arr-class"])).toBe(
      "base conditional arr-class"
    );
  });
});
