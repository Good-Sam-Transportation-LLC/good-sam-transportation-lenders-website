/**
 * Copilot Integration Validation Tests
 *
 * These tests verify that the GitHub Copilot configuration files are
 * correctly set up with proper code review instructions, SWE agent
 * setup steps, and documentation.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const readText = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

// ---------------------------------------------------------------------------
// Group 1: Copilot Code Review Instructions
// ---------------------------------------------------------------------------
describe("Copilot code review instructions", () => {
  it("Copilot instructions file exists at .github/copilot-instructions.md", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/copilot-instructions.md"))).toBe(true);
  });

  it("Copilot instructions cover security review", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("Security");
  });

  it("Copilot instructions cover accessibility review", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("Accessibility");
  });

  it("Copilot instructions require tests for new code", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toMatch(/test/i);
  });
});

// ---------------------------------------------------------------------------
// Group 2: Copilot SWE Agent Setup
// ---------------------------------------------------------------------------
describe("Copilot SWE agent setup", () => {
  it("Copilot setup steps file exists at .github/copilot-setup-steps.yml", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/copilot-setup-steps.yml"))).toBe(true);
  });

  it("setup steps define a copilot-setup-steps job", () => {
    const content = readText(".github/copilot-setup-steps.yml");
    const parsed = parse(content);
    expect(parsed.jobs["copilot-setup-steps"]).toBeDefined();
  });

  it("setup steps job runs on ubuntu-latest", () => {
    const content = readText(".github/copilot-setup-steps.yml");
    const parsed = parse(content);
    expect(parsed.jobs["copilot-setup-steps"]["runs-on"]).toBe("ubuntu-latest");
  });

  it("setup steps use Node 20", () => {
    const content = readText(".github/copilot-setup-steps.yml");
    const parsed = parse(content);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps = parsed.jobs["copilot-setup-steps"].steps as any[];
    const setupNodeStep = steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.uses === "string" && s.uses.startsWith("actions/setup-node"),
    );
    expect(setupNodeStep).toBeDefined();
    expect(setupNodeStep.with["node-version"]).toBe(20);
  });

  it("setup steps install dependencies with npm ci", () => {
    const content = readText(".github/copilot-setup-steps.yml");
    const parsed = parse(content);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps = parsed.jobs["copilot-setup-steps"].steps as any[];
    const npmCiStep = steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.run === "string" && s.run.includes("npm ci"),
    );
    expect(npmCiStep).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Group 3: Copilot Documentation
// ---------------------------------------------------------------------------
describe("Copilot documentation", () => {
  it("Copilot setup guide exists at .github/COPILOT_SETUP.md", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/COPILOT_SETUP.md"))).toBe(true);
  });

  it("setup guide documents code review configuration", () => {
    const content = readText(".github/COPILOT_SETUP.md");
    expect(content).toMatch(/code review/i);
  });

  it("setup guide documents SWE agent configuration", () => {
    const content = readText(".github/COPILOT_SETUP.md");
    expect(content).toMatch(/coding agent|SWE agent/i);
  });
});
