/**
 * Claude PR Auto-Fix Workflow Tests
 *
 * Validates the structure and configuration of .github/workflows/claude-pr-autofix.yml
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WORKFLOW_PATH = path.join(ROOT, ".github/workflows/claude-pr-autofix.yml");
const readText = (p: string) => fs.readFileSync(p, "utf-8");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const workflow = parse(readText(WORKFLOW_PATH)) as Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const autoFixJob = workflow.jobs?.["auto-fix"] as Record<string, any>;

describe("Claude PR Auto-Fix workflow file structure", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('is named "Claude PR Auto-Fix"', () => {
    expect(workflow.name).toBe("Claude PR Auto-Fix");
  });

  it("triggers on pull_request_review submissions", () => {
    expect(workflow.on).toHaveProperty("pull_request_review");
    expect(workflow.on.pull_request_review.types).toContain("submitted");
  });

  it("triggers on pull_request_review_comment creation", () => {
    expect(workflow.on).toHaveProperty("pull_request_review_comment");
    expect(workflow.on.pull_request_review_comment.types).toContain("created");
  });

  it("has contents:write permission", () => {
    expect(workflow.permissions?.contents).toBe("write");
  });

  it("has pull-requests:write permission", () => {
    expect(workflow.permissions?.["pull-requests"]).toBe("write");
  });

  it("defines an auto-fix job", () => {
    expect(workflow.jobs).toHaveProperty("auto-fix");
  });
});

describe("Claude PR Auto-Fix job configuration", () => {
  it("runs on ubuntu-latest", () => {
    expect(autoFixJob["runs-on"]).toBe("ubuntu-latest");
  });

  it("checks for ANTHROPIC_API_KEY before running", () => {
    const checkStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.id === "check-key"
    );
    expect(checkStep).toBeDefined();
    expect(checkStep.run).toContain("ANTHROPIC_API_KEY");
  });

  it("includes actions/checkout@v4 step", () => {
    const checkoutStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.uses === "string" && s.uses.startsWith("actions/checkout@v4")
    );
    expect(checkoutStep).toBeDefined();
  });

  it("includes actions/setup-node@v4 with npm cache", () => {
    const setupNode = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.uses === "string" && s.uses.startsWith("actions/setup-node@v4")
    );
    expect(setupNode).toBeDefined();
    expect(setupNode.with?.cache).toBe("npm");
  });

  it("applies fixes via github-script step", () => {
    const applyStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.id === "apply-fixes"
    );
    expect(applyStep).toBeDefined();
    expect(applyStep.uses).toContain("actions/github-script");
  });

  it("apply-fixes step uses ANTHROPIC_API_KEY from secrets", () => {
    const applyStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => s.id === "apply-fixes"
    );
    expect(String(applyStep?.env?.ANTHROPIC_API_KEY)).toContain("secrets.ANTHROPIC_API_KEY");
  });

  it("commits and pushes applied fixes", () => {
    const commitStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.run === "string" && s.run.includes("git commit") && s.run.includes("git push")
    );
    expect(commitStep).toBeDefined();
  });

  it("commit step only runs when changes were applied", () => {
    const commitStep = autoFixJob.steps.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => typeof s.run === "string" && s.run.includes("git commit") && s.run.includes("git push")
    );
    expect(String(commitStep?.if)).toContain("apply-fixes.outputs.changed");
  });
});
