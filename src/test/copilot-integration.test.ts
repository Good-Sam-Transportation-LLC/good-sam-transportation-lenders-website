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

  it("Copilot instructions require always attempting to fix issues", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content.toLowerCase()).toContain("always attempt to fix");
  });

  it("Copilot instructions mention suggestion blocks", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content).toContain("suggestion");
  });

  it("Copilot instructions enforce autonomous operation", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content.toLowerCase()).toContain("autonomous");
  });

  it("Copilot instructions prohibit advisory-only comments", () => {
    const content = readText(".github/copilot-instructions.md");
    expect(content.toLowerCase()).toContain("no advisory-only comments");
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

  it("setup guide documents autofix behavior", () => {
    const content = readText(".github/COPILOT_SETUP.md");
    expect(content.toLowerCase()).toContain("autofix");
  });
});

// ---------------------------------------------------------------------------
// Group 4: Copilot Autofix Workflow
// ---------------------------------------------------------------------------
describe("Copilot autofix workflow", () => {
  it("copilot-autofix.yml workflow exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/workflows/copilot-autofix.yml"))).toBe(true);
  });

  it("autofix workflow triggers on pull_request_review_comment", () => {
    const content = readText(".github/workflows/copilot-autofix.yml");
    const parsed = parse(content);
    expect(parsed.on).toHaveProperty("pull_request_review_comment");
  });

  it("autofix workflow only runs for copilot bot comments", () => {
    const content = readText(".github/workflows/copilot-autofix.yml");
    expect(content).toContain("copilot[bot]");
  });

  it("autofix workflow has write permissions for contents and pull-requests", () => {
    const content = readText(".github/workflows/copilot-autofix.yml");
    const parsed = parse(content);
    expect(parsed.permissions.contents).toBe("write");
    expect(parsed.permissions["pull-requests"]).toBe("write");
  });

  it("autofix workflow applies suggestions automatically", () => {
    const content = readText(".github/workflows/copilot-autofix.yml");
    expect(content).toContain("applySuggestion");
  });
});

// ---------------------------------------------------------------------------
// Group 5: Auto Test Generation
// ---------------------------------------------------------------------------
describe("Auto test generation", () => {
  it("auto-test-generation.yml workflow exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/workflows/auto-test-generation.yml"))).toBe(true);
  });

  it("auto-test-generation workflow triggers on push", () => {
    const content = readText(".github/workflows/auto-test-generation.yml");
    const parsed = parse(content);
    expect(parsed.on).toHaveProperty("push");
  });

  it("auto-test-generation workflow detects bot commits", () => {
    const content = readText(".github/workflows/auto-test-generation.yml");
    expect(content).toContain("copilot");
    expect(content).toContain("codex");
  });

  it("auto-test-generation workflow has write permissions", () => {
    const content = readText(".github/workflows/auto-test-generation.yml");
    const parsed = parse(content);
    expect(parsed.permissions.contents).toBe("write");
  });

  it("auto-test-generation workflow uses Codex for test generation", () => {
    const content = readText(".github/workflows/auto-test-generation.yml");
    expect(content).toContain("@openai/codex");
  });

  it("auto-test-generation workflow commits generated tests", () => {
    const content = readText(".github/workflows/auto-test-generation.yml");
    expect(content).toContain("git commit");
    expect(content).toContain("Auto-generate test suite");
  });

  it("generate-test-stubs.sh script exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/scripts/generate-test-stubs.sh"))).toBe(true);
  });

  it("generate-test-stubs script is a bash script", () => {
    const content = readText(".github/scripts/generate-test-stubs.sh");
    expect(content.startsWith("#!/usr/bin/env bash")).toBe(true);
  });

  it("generate-test-stubs script uses __tests__ convention", () => {
    const content = readText(".github/scripts/generate-test-stubs.sh");
    expect(content).toContain("__tests__");
  });

  it("generate-test-stubs script skips shadcn/ui components", () => {
    const content = readText(".github/scripts/generate-test-stubs.sh");
    expect(content).toContain("src/components/ui/*");
  });

  it("generate-test-stubs script generates TSX tests for components", () => {
    const content = readText(".github/scripts/generate-test-stubs.sh");
    expect(content).toContain("@testing-library/react");
  });

  it("generate-test-stubs script uses @/ import alias", () => {
    const content = readText(".github/scripts/generate-test-stubs.sh");
    expect(content).toContain('@/');
  });
});

// ---------------------------------------------------------------------------
// Group 6: Workflow Self-Healing
// ---------------------------------------------------------------------------
describe("Workflow self-healing", () => {
  it("workflow-autofix.yml exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/workflows/workflow-autofix.yml"))).toBe(true);
  });

  it("workflow-autofix triggers on workflow_run completion", () => {
    const content = readText(".github/workflows/workflow-autofix.yml");
    const parsed = parse(content);
    expect(parsed.on).toHaveProperty("workflow_run");
  });

  it("workflow-autofix only runs on failure", () => {
    const content = readText(".github/workflows/workflow-autofix.yml");
    expect(content).toContain("failure");
  });

  it("workflow-autofix uses Codex to diagnose and fix", () => {
    const content = readText(".github/workflows/workflow-autofix.yml");
    expect(content).toContain("@openai/codex");
  });

  it("workflow-autofix commits fixes automatically", () => {
    const content = readText(".github/workflows/workflow-autofix.yml");
    expect(content).toContain("git commit");
    expect(content).toContain("Auto-fix");
  });

  it("workflow-test-runner.yml exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/workflows/workflow-test-runner.yml"))).toBe(true);
  });

  it("workflow-test-runner triggers on workflow file changes", () => {
    const content = readText(".github/workflows/workflow-test-runner.yml");
    expect(content).toContain(".github/workflows/*.yml");
  });

  it("workflow-test-runner runs generate-workflow-tests.sh", () => {
    const content = readText(".github/workflows/workflow-test-runner.yml");
    expect(content).toContain("generate-workflow-tests.sh");
  });

  it("workflow-test-runner commits generated tests", () => {
    const content = readText(".github/workflows/workflow-test-runner.yml");
    expect(content).toContain("git commit");
  });

  it("generate-workflow-tests.sh script exists", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/scripts/generate-workflow-tests.sh"))).toBe(true);
  });

  it("generate-workflow-tests script is a bash script", () => {
    const content = readText(".github/scripts/generate-workflow-tests.sh");
    expect(content.startsWith("#!/usr/bin/env bash")).toBe(true);
  });

  it("generate-workflow-tests script creates test files", () => {
    const content = readText(".github/scripts/generate-workflow-tests.sh");
    expect(content).toContain("GENERATED");
    expect(content).toContain(".test.ts");
  });
});
