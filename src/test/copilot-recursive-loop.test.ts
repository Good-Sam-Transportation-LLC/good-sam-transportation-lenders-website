/**
 * Copilot Recursive Loop Workflow Tests
 *
 * Validates the structure and configuration of
 * .github/workflows/copilot-recursive-loop.yml — the event-driven
 * "Review ➔ Fix ➔ Re-Review" ping-pong architecture.
 */
import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WORKFLOW_PATH = path.join(
  ROOT,
  ".github/workflows/copilot-recursive-loop.yml",
);
const readText = (p: string) => fs.readFileSync(p, "utf-8");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let workflow: Record<string, any> = {};

beforeAll(() => {
  // Guard: only parse if the file exists so failures produce clear assertion
  // messages rather than crashing at module load time.
  if (fs.existsSync(WORKFLOW_PATH)) {
    workflow = parse(readText(WORKFLOW_PATH)) as Record<string, any>;
  }
});

// ---------------------------------------------------------------------------
// Group 1: File existence and metadata
// ---------------------------------------------------------------------------
describe("Copilot recursive loop workflow file structure", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it('is named "Autonomous AI Loop: Review ➔ Fix"', () => {
    expect(workflow.name).toBe("Autonomous AI Loop: Review ➔ Fix");
  });
});

// ---------------------------------------------------------------------------
// Group 2: Triggers
// ---------------------------------------------------------------------------
describe("Copilot recursive loop triggers", () => {
  it("triggers on pull_request opened, synchronize, and reopened", () => {
    expect(workflow.on).toHaveProperty("pull_request");
    const types = workflow.on.pull_request.types;
    expect(types).toContain("opened");
    expect(types).toContain("synchronize");
    expect(types).toContain("reopened");
  });

  it("triggers on pull_request_review submitted", () => {
    expect(workflow.on).toHaveProperty("pull_request_review");
    expect(workflow.on.pull_request_review.types).toContain("submitted");
  });

  it("triggers on workflow_dispatch with pr_number input", () => {
    expect(workflow.on).toHaveProperty("workflow_dispatch");
    expect(workflow.on.workflow_dispatch.inputs.pr_number).toBeDefined();
    expect(workflow.on.workflow_dispatch.inputs.pr_number.required).toBe(true);
  });

  it("triggers on workflow_run from CI workflow", () => {
    expect(workflow.on).toHaveProperty("workflow_run");
    expect(workflow.on.workflow_run.workflows).toContain("CI");
    expect(workflow.on.workflow_run.types).toContain("completed");
  });
});

// ---------------------------------------------------------------------------
// Group 3: Permissions
// ---------------------------------------------------------------------------
describe("Copilot recursive loop permissions", () => {
  it("has pull-requests: write permission", () => {
    expect(workflow.permissions["pull-requests"]).toBe("write");
  });

  it("has issues: write permission", () => {
    expect(workflow.permissions.issues).toBe("write");
  });
});

// ---------------------------------------------------------------------------
// Group 4: Job structure
// ---------------------------------------------------------------------------
describe("Copilot recursive loop jobs", () => {
  it("defines exactly two jobs: call-reviewer and evaluate-and-fix", () => {
    const jobIds = new Set(Object.keys(workflow.jobs));
    expect(jobIds).toEqual(new Set(["call-reviewer", "evaluate-and-fix"]));
  });

  it("all jobs run on ubuntu-latest", () => {
    for (const [name, job] of Object.entries(workflow.jobs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((job as any)["runs-on"], `job "${name}"`).toBe("ubuntu-latest");
    }
  });
});

// ---------------------------------------------------------------------------
// Group 5: call-reviewer job
// ---------------------------------------------------------------------------
describe("call-reviewer job", () => {
  it("runs on pull_request, workflow_dispatch, and workflow_run events", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    const condition = String(job.if);
    expect(condition).toContain("pull_request");
    expect(condition).toContain("workflow_dispatch");
    expect(condition).toContain("workflow_run");
  });

  it("skips fork PRs on pull_request events", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    expect(String(job.if)).toContain("head.repo.full_name");
  });

  it("has a resolve-pr step that handles all event types", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) => String(s.name).includes("Resolve PR"));
    expect(step).toBeDefined();
    expect(step.run).toContain("pull_request");
    expect(step.run).toContain("workflow_dispatch");
    expect(step.run).toContain("workflow_run");
  });

  it("resolve-pr step looks up PR by branch for workflow_run events", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) => String(s.name).includes("Resolve PR"));
    expect(step.run).toContain("gh pr list");
    expect(step.run).toContain("head_branch");
  });

  it("requests Copilot as reviewer via the review-request API", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step).toBeDefined();
    expect(step.run).toContain("requested_reviewers");
    expect(step.run).toContain("copilot");
  });

  it("review step uses resolved PR number from previous step", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = workflow.jobs["call-reviewer"] as Record<string, any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(String(step.env.PR_NUMBER)).toContain("resolve-pr");
  });
});

// ---------------------------------------------------------------------------
// Group 6: evaluate-and-fix job
// ---------------------------------------------------------------------------
describe("evaluate-and-fix job", () => {
  // Use a lazy getter so the `workflow` variable is accessed after `beforeAll`
  // has populated it, preventing crashes if the file is missing/renamed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["evaluate-and-fix"] as Record<string, any>;

  it("runs for any Copilot review (analyze step filters actionable issues)", () => {
    const job = getJob();
    const condition = String(job.if);
    expect(condition).toContain("pull_request_review");
    expect(condition).toContain("copilot");
    // No longer filters by review state at the job level — the analyze
    // step determines whether there are actionable comments
    expect(condition).not.toContain("approved");
  });

  it("has a circuit breaker step with MAX_LOOPS", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step).toBeDefined();
    expect(step.env.MAX_LOOPS).toBeDefined();
  });

  it("circuit breaker counts invocations via magic phrase in PR comments", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step.run).toContain("The Copilot Code Reviewer found issues");
    expect(step.run).toContain("INVOCATIONS");
  });

  it("circuit breaker stops and notifies when limit is reached", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step.run).toContain("Auto-fix loop stopped");
    expect(step.run).toContain("Human intervention");
  });

  it("has an analyze step that checks review comment count", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    expect(step).toBeDefined();
    expect(step.run).toContain("COMMENT_COUNT");
    expect(step.run).toContain("changes_requested");
    // Must also detect top-level review body suggestions (commented state with body)
    expect(step.run).toContain("BODY_LENGTH");
    expect(step.run).toContain('"commented"');
    expect(step.run).toContain("HAS_BODY");
  });

  it("analyze step is gated on circuit breaker", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    expect(String(step.if)).toContain("loop-limit");
    expect(String(step.if)).toContain("false");
  });

  it("has a step that asks Copilot to fix issues via PR comment", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Ask Copilot to Fix"),
    );
    expect(step).toBeDefined();
  });

  it("fix step uses COPILOT_PAT secret (not GITHUB_TOKEN)", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Ask Copilot to Fix"),
    );
    expect(String(step.env.GH_TOKEN)).toContain("COPILOT_PAT");
    expect(String(step.env.GH_TOKEN)).not.toContain("GITHUB_TOKEN");
  });

  it("fix step comments on PR with @copilot mention instead of creating an issue", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Ask Copilot to Fix"),
    );
    expect(step.run).toContain("gh pr comment");
    expect(step.run).toContain("@copilot");
    // Must NOT create issues (that causes new branches/PRs)
    expect(step.run).not.toContain("gh issue create");
  });

  it("fix step mentions suggestion blocks in the comment", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Ask Copilot to Fix"),
    );
    expect(step.run).toContain("suggestion");
  });

  it("fix step is gated on both circuit breaker and analyze outputs", () => {
    const job = getJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = job.steps.find((s: any) =>
      String(s.name).includes("Ask Copilot to Fix"),
    );
    const condition = String(step.if);
    expect(condition).toContain("loop-limit");
    expect(condition).toContain("analyze");
    expect(condition).toContain("has_issues");
  });
});
