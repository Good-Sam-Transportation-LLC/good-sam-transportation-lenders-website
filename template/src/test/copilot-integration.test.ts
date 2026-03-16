/**
 * Copilot Integration Tests
 *
 * These tests verify that GitHub Copilot configuration files
 * (code review instructions and SWE agent setup) are correctly configured.
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
  it("Copilot instructions file exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/copilot-instructions.md"))).toBe(true);
  });

  it("instructions cover security review", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("### Security");
  });

  it("instructions cover accessibility review", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("### Accessibility");
  });

  it("instructions require tests for new code", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("### Testing");
  });
});

// ---------------------------------------------------------------------------
// Group 2: Copilot SWE Agent Setup
// ---------------------------------------------------------------------------
describe("Copilot SWE agent setup", () => {
  it("setup steps file exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/copilot-setup-steps.yml"))).toBe(true);
  });

  it("defines a copilot-setup-steps job", () => {
    const parsed = parse(readText(".github/copilot-setup-steps.yml"));
    expect(parsed.jobs["copilot-setup-steps"]).toBeDefined();
  });

  it("setup job runs on ubuntu-latest", () => {
    const parsed = parse(readText(".github/copilot-setup-steps.yml"));
    expect(parsed.jobs["copilot-setup-steps"]["runs-on"]).toBe("ubuntu-latest");
  });

  it("setup steps use Node 20", () => {
    const parsed = parse(readText(".github/copilot-setup-steps.yml"));
    const steps = parsed.jobs["copilot-setup-steps"].steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setupNode = steps.find((s: any) => s.uses?.startsWith("actions/setup-node"));
    expect(setupNode).toBeDefined();
    expect(setupNode.with["node-version"]).toBe(20);
  });

  it("setup steps install dependencies", () => {
    const parsed = parse(readText(".github/copilot-setup-steps.yml"));
    const steps = parsed.jobs["copilot-setup-steps"].steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const npmCi = steps.find((s: any) => typeof s.run === "string" && s.run.includes("npm ci"));
    expect(npmCi).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Group 3: Copilot Documentation
// ---------------------------------------------------------------------------
describe("Copilot documentation", () => {
  it("setup guide exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/COPILOT_SETUP.md"))).toBe(true);
  });

  it("guide documents code review", () => {
    const content = readText(".github/COPILOT_SETUP.md");
    expect(content.toLowerCase()).toContain("code review");
  });

  it("guide documents coding agent", () => {
    const content = readText(".github/COPILOT_SETUP.md");
    expect(content.toLowerCase()).toContain("coding agent");
  });
});
