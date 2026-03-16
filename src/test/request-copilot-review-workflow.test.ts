/**
 * Workflow validation tests for request-copilot-review.yml
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const readText = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");

const WORKFLOW_FILE = ".github/workflows/request-copilot-review.yml";

describe("request-copilot-review workflow", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(path.join(ROOT, WORKFLOW_FILE))).toBe(true);
  });

  it("workflow has correct name", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    expect(workflow.name).toBe("Request Copilot Code Review");
  });

  it("triggers on pull_request opened, reopened, and synchronize", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types = (workflow.on as any).pull_request.types;
    expect(types).toContain("opened");
    expect(types).toContain("reopened");
    expect(types).toContain("synchronize");
  });

  it("fires on all branches (no branch filter) so every PR gets a review", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const branches = (workflow.on as any).pull_request.branches;
    expect(branches).toBeUndefined();
  });

  it("has pull-requests write permission", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((workflow.permissions as any)["pull-requests"]).toBe("write");
  });

  it("defines a request-review job", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((workflow.jobs as any)["request-review"]).toBeDefined();
  });

  it("request-review job runs on ubuntu-latest", () => {
    const workflow = parse(readText(WORKFLOW_FILE));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((workflow.jobs as any)["request-review"]["runs-on"]).toBe("ubuntu-latest");
  });

  it("uses actions/github-script@v7 to request reviewers", () => {
    const content = readText(WORKFLOW_FILE);
    expect(content).toContain("actions/github-script@v7");
    expect(content).toContain("requestReviewers");
  });

  it("requests 'copilot' (not 'copilot[bot]') as reviewer so the API call succeeds", () => {
    const content = readText(WORKFLOW_FILE);
    // The [bot] suffix is a webhook display artifact — the API reviewer slug is bare 'copilot'
    expect(content).toContain("reviewers: ['copilot']");
    expect(content).not.toContain("reviewers: ['copilot[bot]']");
  });

  it("does not require CODEX_API_KEY or OPENAI_API_KEY", () => {
    const content = readText(WORKFLOW_FILE);
    expect(content).not.toContain("CODEX_API_KEY");
    expect(content).not.toContain("OPENAI_API_KEY");
  });
});
