import {
  ease,
  fadeUpProps,
  fadeUpAnimateProps,
  stagger,
  fadeIn,
  staggerContainer,
  fadeUp,
  fadeUpAnimate,
} from "@/lib/motion";

describe("ease", () => {
  it("equals [0.16, 1, 0.3, 1]", () => {
    expect(ease).toEqual([0.16, 1, 0.3, 1]);
  });
});

describe("fadeUpProps", () => {
  it("returns correct shape with default delay 0", () => {
    const result = fadeUpProps();
    expect(result).toEqual({
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-60px" },
      transition: { duration: 0.7, delay: 0, ease },
    });
  });

  it("sets custom delay", () => {
    const result = fadeUpProps(0.5);
    expect(result.transition.delay).toBe(0.5);
  });

  it("has viewport with once: true and margin -60px", () => {
    const result = fadeUpProps();
    expect(result.viewport).toEqual({ once: true, margin: "-60px" });
  });
});

describe("fadeUpAnimateProps", () => {
  it("uses animate key instead of whileInView", () => {
    const result = fadeUpAnimateProps();
    expect(result).toHaveProperty("animate");
    expect(result).not.toHaveProperty("whileInView");
    expect(result.animate).toEqual({ opacity: 1, y: 0 });
  });

  it("does not include viewport", () => {
    const result = fadeUpAnimateProps();
    expect(result).not.toHaveProperty("viewport");
  });

  it("sets custom delay", () => {
    const result = fadeUpAnimateProps(0.3);
    expect(result.transition.delay).toBe(0.3);
  });
});

describe("stagger", () => {
  it("returns correct viewport margin -40px", () => {
    const result = stagger();
    expect(result.viewport).toEqual({ once: true, margin: "-40px" });
  });

  it("uses y: 20 (not 30)", () => {
    const result = stagger();
    expect(result.initial).toEqual({ opacity: 0, y: 20 });
  });

  it("has duration 0.5", () => {
    const result = stagger();
    expect(result.transition.duration).toBe(0.5);
  });

  it("sets custom delay", () => {
    const result = stagger(0.2);
    expect(result.transition.delay).toBe(0.2);
  });
});

describe("fadeIn variant", () => {
  it("has hidden and show keys", () => {
    expect(fadeIn).toHaveProperty("hidden");
    expect(fadeIn).toHaveProperty("show");
  });

  it("hidden starts at opacity 0, y 20", () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0, y: 20 });
  });
});

describe("staggerContainer", () => {
  it("has staggerChildren 0.1 in show transition", () => {
    const show = staggerContainer.show as { transition: { staggerChildren: number } };
    expect(show.transition.staggerChildren).toBe(0.1);
  });

  it("hidden is an empty object", () => {
    expect(staggerContainer.hidden).toEqual({});
  });
});

describe("fadeUp variant", () => {
  it("has hidden and show keys", () => {
    expect(fadeUp).toHaveProperty("hidden");
    expect(fadeUp).toHaveProperty("show");
  });

  it("hidden starts at opacity 0, y 30", () => {
    expect(fadeUp.hidden).toEqual({ opacity: 0, y: 30 });
  });
});

describe("fadeUpAnimate", () => {
  it("is reference-equal to fadeUp", () => {
    expect(fadeUpAnimate).toBe(fadeUp);
  });
});
