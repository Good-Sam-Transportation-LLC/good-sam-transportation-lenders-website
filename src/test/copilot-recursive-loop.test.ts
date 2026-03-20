/**
 * Workflow validation tests for copilot-recursive-loop.yml
 *
 * The workflow file is loaded in a beforeAll block (not at module load time)
 * so that a missing/renamed file produces a clear assertion failure rather
 * than crashing the entire test module during import.
 */
import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WORKFLOW_PATH = path.join(ROOT, ".github/workflows/copilot-recursive-loop.yml");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let workflow: Record<string, any> = {};

describe("copilot-recursive-loop workflow", () => {
  beforeAll(() => {
    // Verify the file exists before attempting to parse it. If it is missing,
    // subsequent tests will fail with clear assertion messages rather than a
    // module-level parse error.
    if (fs.existsSync(WORKFLOW_PATH)) {
      workflow = parse(fs.readFileSync(WORKFLOW_PATH, "utf-8"));
    }
  });

  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("workflow has correct name", () => {
    expect(workflow.name).toBe("Copilot Recursive Review Loop");
  });

  describe("triggers", () => {
    it("triggers on pull_request events", () => {
      expect(workflow.on).toHaveProperty("pull_request");
    });

    it("pull_request trigger includes 'opened'", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((workflow.on as any).pull_request.types).toContain("opened");
    });

    it("pull_request trigger includes 'synchronize'", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((workflow.on as any).pull_request.types).toContain("synchronize");
    });

    it("pull_request trigger includes 'reopened' so the loop restarts on PR reopen", () => {
      // Regression guard: reopened must be present so that the review/fix loop
      // also fires when a previously-closed PR is reopened.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((workflow.on as any).pull_request.types).toContain("reopened");
    });

    it("triggers on pull_request_review submitted events", () => {
      expect(workflow.on).toHaveProperty("pull_request_review");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((workflow.on as any).pull_request_review.types).toContain("submitted");
    });
  });

  describe("concurrency", () => {
    it("has concurrency control to prevent parallel loop iterations", () => {
      expect(workflow.concurrency).toBeDefined();
    });

    it("concurrency cancel-in-progress is false (don't cancel in-flight iterations)", () => {
      expect(workflow.concurrency?.["cancel-in-progress"]).toBe(false);
    });
  });

  describe("call-reviewer job", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let job: Record<string, any>;

    beforeAll(() => {
      job = workflow.jobs?.["call-reviewer"] ?? {};
    });

    it("defines a call-reviewer job", () => {
      expect(workflow.jobs).toHaveProperty("call-reviewer");
    });

    it("runs on ubuntu-latest", () => {
      expect(job["runs-on"]).toBe("ubuntu-latest");
    });

    it("has a fork guard so it only runs for PRs from this repository", () => {
      const condition = String(job.if ?? "");
      expect(condition).toContain("pull_request.head.repo.full_name");
      expect(condition).toContain("github.repository");
    });

    it("only runs on pull_request events (not pull_request_review)", () => {
      const condition = String(job.if ?? "");
      expect(condition).toContain("pull_request");
    });

    it("sets GH_REPO env var so gh commands work without a checkout", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      const callReviewerSection = content.slice(
        content.indexOf("call-reviewer:"),
        content.indexOf("evaluate-and-fix:")
      );
      expect(callReviewerSection).toContain("GH_REPO");
    });

    it("uses gh pr edit to add Copilot as reviewer", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      const callReviewerSection = content.slice(
        content.indexOf("call-reviewer:"),
        content.indexOf("evaluate-and-fix:")
      );
      expect(callReviewerSection).toContain("gh pr edit");
      expect(callReviewerSection).toContain("copilot");
    });
  });

  describe("evaluate-and-fix job", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let job: Record<string, any>;

    beforeAll(() => {
      job = workflow.jobs?.["evaluate-and-fix"] ?? {};
    });

    it("defines an evaluate-and-fix job", () => {
      expect(workflow.jobs).toHaveProperty("evaluate-and-fix");
    });

    it("runs on ubuntu-latest", () => {
      expect(job["runs-on"]).toBe("ubuntu-latest");
    });

    it("has a fork guard so it only runs for PRs from this repository", () => {
      const condition = String(job.if ?? "");
      expect(condition).toContain("pull_request.head.repo.full_name");
      expect(condition).toContain("github.repository");
    });

    it("only triggers when Copilot submits the review", () => {
      const condition = String(job.if ?? "");
      expect(condition).toContain("copilot");
      expect(condition).toContain("pull_request_review");
    });

    it("has a circuit-breaker step", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circuitStep = (job.steps as any[])?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s: any) => s.id === "circuit-breaker"
      );
      expect(circuitStep).toBeDefined();
    });

    it("circuit-breaker uses gh api --paginate to count invocations accurately", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      expect(content).toContain("gh api --paginate");
    });

    it("sets GH_REPO env var so gh pr comment works without a checkout", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      const evaluateSection = content.slice(content.indexOf("evaluate-and-fix:"));
      expect(evaluateSection).toContain("GH_REPO");
    });

    it("uses gh pr comment to trigger the Copilot SWE agent", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      const evaluateSection = content.slice(content.indexOf("evaluate-and-fix:"));
      expect(evaluateSection).toContain("gh pr comment");
      expect(evaluateSection).toContain("@copilot");
    });

    it("embeds a magic phrase in comments for circuit-breaker counting", () => {
      const content = fs.readFileSync(WORKFLOW_PATH, "utf-8");
      expect(content).toContain("copilot-swe-invocation");
    });
  });
});
