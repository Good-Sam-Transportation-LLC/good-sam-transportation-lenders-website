/**
 * Copilot Recursive Loop Workflow Tests
 *
 * Validates the structure and configuration of
 * .github/workflows/copilot-recursive-loop.yml — the polling-based
 * "Request Review ➔ Wait ➔ Evaluate ➔ Fix" architecture.
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

  it("does not rely on pull_request_review trigger (uses polling instead)", () => {
    expect(workflow.on).not.toHaveProperty("pull_request_review");
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
  it("defines a single review-and-fix job", () => {
    const jobIds = Object.keys(workflow.jobs);
    expect(jobIds).toContain("review-and-fix");
    expect(jobIds).toHaveLength(1);
  });

  it("job runs on ubuntu-latest", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((workflow.jobs["review-and-fix"] as any)["runs-on"]).toBe("ubuntu-latest");
  });
});

// ---------------------------------------------------------------------------
// Group 5: review-and-fix job — review request steps
// ---------------------------------------------------------------------------
describe("review-and-fix job — review request", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  it("runs on pull_request, workflow_dispatch, and workflow_run events", () => {
    const condition = String(getJob().if);
    expect(condition).toContain("pull_request");
    expect(condition).toContain("workflow_dispatch");
    expect(condition).toContain("workflow_run");
  });

  it("skips fork PRs on pull_request events", () => {
    expect(String(getJob().if)).toContain("head.repo.full_name");
  });

  it("has a resolve-pr step that handles all event types", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Resolve PR"));
    expect(step).toBeDefined();
    expect(step.run).toContain("pull_request");
    expect(step.run).toContain("workflow_dispatch");
    expect(step.run).toContain("workflow_run");
  });

  it("resolve-pr step looks up PR by branch for workflow_run events", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Resolve PR"));
    expect(step.run).toContain("gh pr list");
    expect(step.run).toContain("head_branch");
  });

  it("marks draft PRs as ready for review before requesting", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Mark draft PR as ready"),
    );
    expect(step).toBeDefined();
    expect(step.run).toContain("draft");
    expect(step.run).toContain("gh pr ready");
  });

  it("mark-ready step runs before dismiss and request steps", () => {
    const steps = getJob().steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const readyIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Mark draft PR as ready"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dismissIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Dismiss previous Copilot review"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestIdx = steps.findIndex((s: any) =>
      s.name === "Request Copilot Code Review",
    );
    expect(readyIdx).toBeGreaterThan(-1);
    expect(dismissIdx).toBeGreaterThan(readyIdx);
    expect(requestIdx).toBeGreaterThan(dismissIdx);
  });

  it("dismisses previous Copilot review before re-requesting", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Dismiss previous Copilot review"),
    );
    expect(step).toBeDefined();
    expect(step.run).toContain("dismissals");
    expect(step.run).toContain("copilot-pull-request-reviewer[bot]");
  });

  it("dismiss step skips COMMENTED reviews (HTTP 422 not dismissable)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Dismiss previous Copilot review"),
    );
    expect(step.run).toContain("COMMENTED");
    expect(step.run).toContain("cannot be dismissed");
  });

  it("request step removes reviewer before re-requesting (handles non-dismissable reviews)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step.run).toContain("DELETE");
    expect(step.run).toContain("copilot-pull-request-reviewer[bot]");
  });

  it("dismiss step runs before request step", () => {
    const steps = getJob().steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dismissIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Dismiss previous Copilot review"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestIdx = steps.findIndex((s: any) =>
      s.name === "Request Copilot Code Review",
    );
    expect(dismissIdx).toBeGreaterThan(-1);
    expect(requestIdx).toBeGreaterThan(dismissIdx);
  });

  it("requests Copilot as reviewer via the review-request API", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step).toBeDefined();
    expect(step.run).toContain("requested_reviewers");
    expect(step.run).toContain("copilot");
  });

  it("request step records a timestamp for filtering old reviews", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step.run).toContain("request_time=");
    expect(step.run).toContain("REQUEST_TIME");
    expect(step.id).toBe("request-review");
  });

  it("review step uses resolved PR number from previous step", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(String(step.env.PR_NUMBER)).toContain("resolve-pr");
  });

  it("request step outputs request_accepted flag", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step.run).toContain("request_accepted=true");
    expect(step.run).toContain("request_accepted=false");
  });

  it("request step retries with full bot login when standard name fails", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    // Should try "copilot" first, then fall back to full bot login
    expect(step.run).toContain('reviewers[]=copilot"');
    expect(step.run).toContain('reviewers[]=copilot-pull-request-reviewer[bot]"');
    expect(step.run).toContain("retrying with full bot login");
  });

  it("request step emits diagnostic warnings when not accepted", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => s.name === "Request Copilot Code Review");
    expect(step.run).toContain("::warning::");
    expect(step.run).toContain("not accepted");
  });
});

// Group 5b was removed: check-files pre-filtering was incorrect (Copilot CAN review all file types)

// ---------------------------------------------------------------------------
// Group 5c: review-and-fix job — can't-review detection in analyze step
// ---------------------------------------------------------------------------
describe("review-and-fix job — can't-review detection", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  it("analyze step detects Copilot can't-review response", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review Comments"),
    );
    expect(step.run).toContain("wasn.t able to review");
    expect(step.run).toContain("unable to review");
  });

  it("analyze step posts accurate message for can't-review case", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review Comments"),
    );
    expect(step.run).toContain("Copilot review skipped");
    expect(step.run).toContain("unsupported file types");
  });

  it("analyze step exits early with has_issues=false for can't-review", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review Comments"),
    );
    // The can't-review check must come before the actionable body analysis
    const cantReviewIdx = step.run.indexOf("wasn.t able to review");
    const actionableIdx = step.run.indexOf("HAS_ACTIONABLE_BODY");
    expect(cantReviewIdx).toBeGreaterThan(-1);
    expect(cantReviewIdx).toBeLessThan(actionableIdx);
  });
});

// ---------------------------------------------------------------------------
// Group 6: review-and-fix job — polling for review (timestamp-based)
// ---------------------------------------------------------------------------
describe("review-and-fix job — review polling", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  it("captures current HEAD SHA to detect concurrent pushes", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("HEAD SHA"));
    expect(step).toBeDefined();
    expect(step.run).toContain("head.sha");
  });

  it("polls for the Copilot review with a timeout", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(step).toBeDefined();
    expect(step.run).toContain("MAX_WAIT");
    expect(step.run).toContain("INTERVAL");
    expect(step.run).toContain("copilot-pull-request-reviewer[bot]");
  });

  it("uses timestamp-based filtering instead of count-based to avoid stale reviews", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(step.run).toContain("submitted_at");
    expect(step.run).toContain("REQUEST_TIME");
    expect(step.run).toContain("$after");
    // Must NOT use the old count-based approach
    expect(step.run).not.toContain("PRE_COUNT");
    expect(step.run).not.toContain("CURRENT_COUNT");
  });

  it("filters out DISMISSED reviews when polling", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(step.run).toContain("DISMISSED");
  });

  it("receives REQUEST_TIME from the request step output", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(String(step.env.REQUEST_TIME)).toContain("request-review");
  });

  it("exits polling early if PR HEAD changes (concurrent push)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(step.run).toContain("CURRENT_SHA");
    expect(step.run).toContain("HEAD_SHA");
    expect(step.run).toContain("new workflow run will handle this");
  });

  it("outputs review_id and review_state when review is found", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(step.run).toContain("review_id=");
    expect(step.run).toContain("review_state=");
    expect(step.run).toContain("found=true");
  });

  it("wait step uses dynamic timeout based on request_accepted", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) => String(s.name).includes("Wait for Copilot review"));
    expect(String(step.env.REQUEST_ACCEPTED)).toContain("request-review");
    expect(step.run).toContain("REQUEST_ACCEPTED");
    // Short timeout when request not accepted
    expect(step.run).toContain("MAX_WAIT=60");
    // Normal timeout when request accepted
    expect(step.run).toContain("MAX_WAIT=300");
  });
});

// ---------------------------------------------------------------------------
// Group 6b: review-and-fix job — fallback for failed review requests
// ---------------------------------------------------------------------------
describe("review-and-fix job — fallback for failed review requests", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  it("has a fallback step that runs when no review is found", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Fallback"),
    );
    expect(step).toBeDefined();
    const cond = String(step.if);
    expect(cond).toContain("wait-review.outputs.found == 'false'");
    expect(cond).toContain("resolve-pr.outputs.pr_number");
  });

  it("fallback step uses actions/github-script@v7 with COPILOT_PAT", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Fallback"),
    );
    expect(step.uses).toContain("actions/github-script");
    expect(String(step.env.GH_TOKEN)).toContain("COPILOT_PAT");
  });

  it("fallback step queries unresolved review threads via GraphQL", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Fallback"),
    );
    expect(step.with.script).toContain("reviewThreads");
    expect(step.with.script).toContain("isResolved");
  });

  it("fallback step outputs has_existing_comments flag", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Fallback"),
    );
    expect(step.with.script).toContain("has_existing_comments");
  });

  it("fallback step is positioned between wait and circuit breaker steps", () => {
    const steps = getJob().steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Wait for Copilot review"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallbackIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Fallback"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cbIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(fallbackIdx).toBeGreaterThan(waitIdx);
    expect(fallbackIdx).toBeLessThan(cbIdx);
  });

  it("auto-resolve step accepts fallback path", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Auto-resolve threads"),
    );
    expect(String(step.if)).toContain("fallback-check.outputs.has_existing_comments");
  });

  it("collect step accepts fallback path", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(String(step.if)).toContain("fallback-check.outputs.has_existing_comments");
  });
});

// ---------------------------------------------------------------------------
// Group 7: review-and-fix job — evaluate and fix
// ---------------------------------------------------------------------------
describe("review-and-fix job — evaluate and fix", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  it("has a circuit breaker step with MAX_LOOPS set to 100", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step).toBeDefined();
    expect(step.env.MAX_LOOPS).toBe(100);
  });

  it("circuit breaker counts invocations via magic phrase in PR comments", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step.run).toContain("The Copilot Code Reviewer found issues");
    expect(step.run).toContain("INVOCATIONS");
  });

  it("circuit breaker stops and notifies when limit is reached", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(step.run).toContain("Auto-fix loop stopped");
    expect(step.run).toContain("Human intervention");
  });

  it("circuit breaker is gated on review being found", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    expect(String(step.if)).toContain("wait-review");
    expect(String(step.if)).toContain("true");
  });

  it("has an analyze step that checks review comment count", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    expect(step).toBeDefined();
    expect(step.run).toContain("COMMENT_COUNT");
    expect(step.run).toContain("reviews/$REVIEW_ID/comments");
    expect(step.run).toContain("--paginate");
    expect(step.run).toContain("changes_requested");
    // Must also detect top-level actionable review bodies (commented state)
    expect(step.run).toContain("REVIEW_BODY");
    expect(step.run).toContain("jq -r");
    expect(step.run).toContain('"commented"');
    expect(step.run).toContain("HAS_ACTIONABLE_BODY");
    expect(step.run).toContain("great");
  });

  it("analyze step is gated on both review found and circuit breaker", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    expect(String(step.if)).toContain("wait-review");
    expect(String(step.if)).toContain("loop-limit");
  });

  it("has a step that collects unresolved comments and creates a temp issue for Copilot", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step).toBeDefined();
    expect(step.uses).toContain("actions/github-script");
  });

  it("fix step uses COPILOT_PAT secret (not GITHUB_TOKEN)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(String(step.env.GH_TOKEN)).toContain("COPILOT_PAT");
    expect(String(step.with["github-token"])).toContain("COPILOT_PAT");
  });

  it("fix step creates temp issue with copilot-autofix label and assigns copilot-swe-agent via GraphQL", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("issues.create");
    expect(step.with.script).toContain("copilot-autofix");
    expect(step.with.script).toContain("addAssignees");
    expect(step.with.script).toContain("copilot-swe-agent");
    expect(step.with.script).toContain("suggestion");
  });

  it("fix step paginates review threads using GraphQL cursor", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("hasNextPage");
    expect(step.with.script).toContain("endCursor");
    expect(step.with.script).toContain("pageInfo");
  });

  it("fix step processes ALL comments in each thread, not just the first", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("for (const comment of thread.comments.nodes)");
  });

  it("fix step fetches standalone review comments via REST API as fallback", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("listReviewComments");
    expect(step.with.script).toContain("paginate");
  });

  it("fix step deduplicates comments across GraphQL and REST sources", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("processedIds");
    expect(step.with.script).toContain("threadCommentIds");
  });

  it("fix step includes outdated threads (may have valid unresolved suggestions)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("isOutdated");
    expect(step.with.script).toContain("!t.isResolved");
    // Should NOT filter out outdated threads
    expect(step.with.script).not.toContain("!t.isOutdated");
  });

  it("fix step processes orphaned comments not in any thread", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("orphanedComments");
  });

  it("fix step is gated on review found, circuit breaker, and analyze outputs", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    const condition = String(step.if);
    expect(condition).toContain("wait-review");
    expect(condition).toContain("loop-limit");
    expect(condition).toContain("analyze");
    expect(condition).toContain("has_issues");
  });

  it("fix step closes previous temp issues before creating new ones", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("listForRepo");
    expect(step.with.script).toContain("Superseded by new iteration");
  });

  it("fix step preserves circuit breaker magic phrase in PR tracking comment", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("The Copilot Code Reviewer found issues");
    expect(step.with.script).toContain("Created tracking issue");
  });

  it("fix step fetches branch name from PR API", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(step.with.script).toContain("pulls.get");
    expect(step.with.script).toContain("head.ref");
  });

  it("fix step assigns copilot-swe-agent via REST API", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    const script = step.with.script;
    // Uses REST API to assign the coding agent
    expect(script).toContain("addAssignees");
    expect(script).toContain("copilot-swe-agent");
  });

  it("fix step closes existing temp issues before early return when all comments are resolved", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    const script = step.with.script;
    // Close logic runs before the fixItems.length === 0 early return
    expect(script).toContain("All review comments have been resolved.");
    expect(script).toContain("'completed'");
    // The listForRepo call with copilot-autofix label appears before the early return
    const closeIdx = script.indexOf("copilot-autofix");
    const earlyReturnIdx = script.indexOf("all resolved, no new issue needed");
    expect(closeIdx).toBeLessThan(earlyReturnIdx);
  });
});

// ---------------------------------------------------------------------------
// Group 8: Loop cycling — ensures the workflow can cycle up to 100 iterations
// ---------------------------------------------------------------------------
describe("review-and-fix loop — cycling up to 100 iterations", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;
  const rawText = () => readText(WORKFLOW_PATH);

  it("circuit breaker allows up to 100 iterations before stopping", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    const maxLoops = step.env.MAX_LOOPS;
    expect(maxLoops).toBe(100);
    // The script compares INVOCATIONS -ge MAX_LOOPS, so iterations 0..99 proceed
    expect(step.run).toContain("-ge");
  });

  it("circuit breaker only stops when invocations reach the limit, not before", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const step = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    // Uses -ge (>=) comparison, meaning iterations 0 through 99 set stop=false
    expect(step.run).toContain('stop=false');
    expect(step.run).toContain('stop=true');
    // Invocation count is compared to MAX_LOOPS
    expect(step.run).toContain('$INVOCATIONS');
    expect(step.run).toContain('$MAX_LOOPS');
  });

  it("each iteration is driven by a new commit triggering the synchronize event", () => {
    // The workflow triggers on pull_request synchronize, so each SWE agent
    // push creates a new workflow run = next loop iteration
    const triggers = workflow.on.pull_request.types;
    expect(triggers).toContain("synchronize");
  });

  it("loop continues when circuit breaker output is stop=false and issues are found", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    const cond = String(fixStep.if);
    // Fix step runs when: review found AND stop=false AND has_issues=true
    expect(cond).toContain("loop-limit.outputs.stop == 'false'");
    expect(cond).toContain("analyze.outputs.has_issues == 'true'");
  });

  it("loop terminates when circuit breaker output is stop=true", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzeStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    // Analyze step is gated on loop-limit stop=false, so it won't run at limit
    expect(String(analyzeStep.if)).toContain("loop-limit.outputs.stop == 'false'");
  });

  it("loop terminates naturally when no actionable issues remain", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzeStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    // The analyze step posts a completion message when no issues found
    expect(analyzeStep.run).toContain("Auto-fix loop complete!");
    expect(analyzeStep.run).toContain("has_issues=false");
  });

  it("dismiss + re-request pattern enables review on every iteration", () => {
    const text = rawText();
    // The dismiss step must appear before the request step so that
    // each iteration can get a fresh review from Copilot
    expect(text).toContain("Dismiss previous Copilot review");
    expect(text).toContain("Request Copilot Code Review");
    expect(text).toContain("dismissals");
    expect(text).toContain("requested_reviewers");
  });

  it("draft PRs are marked ready so Copilot reviewer engages on every iteration", () => {
    const text = rawText();
    expect(text).toContain("Mark draft PR as ready for review");
    expect(text).toContain("gh pr ready");
  });

  it("magic phrase in fix comment increments the circuit breaker counter", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cbStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Circuit Breaker"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    const magicPhrase = "The Copilot Code Reviewer found issues";
    // The circuit breaker counts comments containing the magic phrase
    expect(cbStep.run).toContain(magicPhrase);
    // The fix step posts a comment containing the same magic phrase
    expect(fixStep.with.script).toContain(magicPhrase);
  });

  it("workflow re-triggers on each SWE agent push (synchronize event)", () => {
    // Each iteration: SWE agent pushes fix → synchronize fires → new run
    // This is the recursion mechanism that allows up to 100 cycles
    expect(workflow.on.pull_request.types).toContain("synchronize");
    // The fix step creates a temp issue and assigns copilot-swe-agent via REST API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(fixStep.with.script).toContain("addAssignees");
    expect(fixStep.with.script).toContain("copilot-swe-agent");
  });

  it("timestamp-based polling prevents processing stale reviews across iterations", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestStep = getJob().steps.find((s: any) =>
      s.name === "Request Copilot Code Review",
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Wait for Copilot review"),
    );
    // Request step captures a timestamp
    expect(requestStep.run).toContain("request_time=");
    // Wait step filters by submitted_at > request timestamp
    expect(waitStep.run).toContain("submitted_at");
    expect(waitStep.run).toContain("$after");
    // Wait step also ignores dismissed reviews
    expect(waitStep.run).toContain("DISMISSED");
    // This means on iteration N, old reviews from iterations 1..N-1 are ignored
  });

  it("concurrent push detection prevents duplicate iterations", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitStep = getJob().steps.find((s: any) =>
      String(s.name).includes("Wait for Copilot review"),
    );
    // If HEAD changes during polling, the run exits and defers to the new run
    expect(waitStep.run).toContain("CURRENT_SHA");
    expect(waitStep.run).toContain("HEAD_SHA");
    expect(waitStep.run).toContain("found=false");
  });
});

// ---------------------------------------------------------------------------
// Group 9: Auto-resolve threads with applied suggestions
// ---------------------------------------------------------------------------
describe("review-and-fix job — auto-resolve applied suggestions", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getJob = () => workflow.jobs["review-and-fix"] as Record<string, any>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getResolveStep = () => getJob().steps.find((s: any) =>
    String(s.name).includes("Auto-resolve threads"),
  );

  it("has an auto-resolve step between analyze and collect steps", () => {
    const steps = getJob().steps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolveIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Auto-resolve threads"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzeIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Analyze Review"),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collectIdx = steps.findIndex((s: any) =>
      String(s.name).includes("Collect unresolved comments and create temp issue"),
    );
    expect(resolveIdx).toBeGreaterThan(analyzeIdx);
    expect(resolveIdx).toBeLessThan(collectIdx);
  });

  it("uses actions/github-script@v7", () => {
    expect(getResolveStep().uses).toContain("actions/github-script");
  });

  it("uses COPILOT_PAT for authentication", () => {
    const step = getResolveStep();
    expect(String(step.env.GH_TOKEN)).toContain("COPILOT_PAT");
    expect(String(step.with["github-token"])).toContain("COPILOT_PAT");
  });

  it("is gated on review found, circuit breaker, and issues detected", () => {
    const cond = String(getResolveStep().if);
    expect(cond).toContain("wait-review");
    expect(cond).toContain("loop-limit");
    expect(cond).toContain("analyze");
  });

  it("receives HEAD_SHA from head-sha step", () => {
    expect(String(getResolveStep().env.HEAD_SHA)).toContain("head-sha");
  });

  it("parses suggestion blocks from comment bodies via regex", () => {
    const script = getResolveStep().with.script;
    expect(script).toContain("suggestion");
    expect(script).toContain("suggestionRegex");
  });

  it("fetches file content via GitHub Contents API with caching", () => {
    const script = getResolveStep().with.script;
    expect(script).toContain("getContent");
    expect(script).toContain("fileCache");
  });

  it("uses resolveReviewThread GraphQL mutation", () => {
    expect(getResolveStep().with.script).toContain("resolveReviewThread");
  });

  it("skips threads without suggestion blocks (free-text only)", () => {
    const script = getResolveStep().with.script;
    expect(script).toContain("!suggestions");
    expect(script).toContain("continue");
  });

  it("paginates review threads using GraphQL cursor", () => {
    const script = getResolveStep().with.script;
    expect(script).toContain("hasNextPage");
    expect(script).toContain("endCursor");
  });

  it("searches entire file for suggestion text (not line-based)", () => {
    const script = getResolveStep().with.script;
    // Must search via includes() on normalized file, not getLines()
    expect(script).toContain("normalizedFile.includes");
    // Should NOT rely on line numbers for matching
    expect(script).not.toContain("getLines(");
  });

  it("handles outdated comments where line numbers are null", () => {
    const script = getResolveStep().with.script;
    // Comments added to explain the outdated line number issue
    expect(script).toContain("outdated");
    // Should not skip threads just because startLine is null
    expect(script).not.toContain("if (!startLine) continue");
  });

  it("logs detailed diagnostics for unmatched threads", () => {
    const script = getResolveStep().with.script;
    expect(script).toContain("NOT matched");
    expect(script).toContain("skippedNoSuggestion");
    expect(script).toContain("skippedNoFile");
  });
});
