import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { load } from "js-yaml";

const WORKFLOW_PATH = resolve(__dirname, "../../.github/workflows/trigger-copilot-agent.yml");

function loadWorkflow(filePath: string) {
  const content = readFileSync(filePath, "utf-8");
  return load(content) as Record<string, unknown>;
}

describe("trigger-copilot-agent workflow", () => {
  it("workflow file exists at .github/workflows/trigger-copilot-agent.yml", () => {
    expect(existsSync(WORKFLOW_PATH)).toBe(true);
  });

  describe("triggers", () => {
    let workflow: Record<string, unknown>;
    beforeEach(() => {
      workflow = loadWorkflow(WORKFLOW_PATH);
    });

    it("triggers on pull_request_review submitted event", () => {
      const on = workflow.on as Record<string, unknown>;
      const prReview = on["pull_request_review"] as Record<string, unknown>;
      expect(prReview).toBeDefined();
      expect(prReview.types).toContain("submitted");
    });

    it("triggers on issue_comment created event for manual @copilot mentions", () => {
      const on = workflow.on as Record<string, unknown>;
      const issueComment = on["issue_comment"] as Record<string, unknown>;
      expect(issueComment).toBeDefined();
      expect(issueComment.types).toContain("created");
    });

    it("does NOT trigger on push or other CI events", () => {
      const on = workflow.on as Record<string, unknown>;
      expect(on["push"]).toBeUndefined();
      expect(on["workflow_run"]).toBeUndefined();
    });
  });

  describe("permissions", () => {
    let workflow: Record<string, unknown>;
    beforeEach(() => {
      workflow = loadWorkflow(WORKFLOW_PATH);
    });

    it("has issues: write permission", () => {
      const permissions = workflow.permissions as Record<string, unknown>;
      expect(permissions).toBeDefined();
      expect(permissions["issues"]).toBe("write");
    });

    it("has pull-requests: write permission", () => {
      const permissions = workflow.permissions as Record<string, unknown>;
      expect(permissions["pull-requests"]).toBe("write");
    });
  });

  describe("job structure", () => {
    let workflow: Record<string, unknown>;
    beforeEach(() => {
      workflow = loadWorkflow(WORKFLOW_PATH);
    });

    it("has a trigger-copilot-agent job", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      expect(jobs["trigger-copilot-agent"]).toBeDefined();
    });

    it("job only runs for copilot[bot] reviews", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      expect(String(job.if)).toContain("copilot[bot]");
    });

    it("job does NOT run for human (User type) reviews", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      expect(String(job.if)).not.toContain("user.type");
      expect(String(job.if)).not.toContain("== 'User'");
    });

    it("job also runs for chatgpt-codex-connector[bot] reviews", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      expect(String(job.if)).toContain("chatgpt-codex-connector[bot]");
    });

    it("job runs on issue_comment when comment contains @copilot", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      expect(String(job.if)).toContain("issue_comment");
      expect(String(job.if)).toContain("@copilot");
      expect(String(job.if)).toContain("pull_request");
    });

    it("job does NOT run on issue_comment from copilot[bot] itself (prevent loops)", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const condition = String(job.if);
      // Must exclude copilot[bot] and github-actions[bot] from the comment trigger
      expect(condition).toContain("github-actions[bot]");
    });

    it("collect-threads step triggers on any line comment from chatgpt-codex-connector[bot]", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("chatgpt-codex-connector[bot]");
      expect(script).toContain("reviewLineComments.length === 0");
    });

    it("collect-threads step calls Anthropic LLM to analyze Copilot free-text comments", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("api.anthropic.com/v1/messages");
      expect(script).toContain("ANTHROPIC_API_KEY");
      expect(script).toContain("claude-haiku");
    });

    it("collect-threads LLM prompt checks suggestion_count for summary comments", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("suggestion_count");
      expect(script).toContain("unresolved conversations");
    });

    it("collect-threads step treats LLM failures as actionable to avoid missing fixes", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("treating as actionable to be safe");
      expect(script).toContain("treating review as actionable to avoid missing fixes");
    });

    it("collect-threads step exposes ANTHROPIC_API_KEY env to the script", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const env = collectStep!.env as Record<string, unknown>;
      expect(env).toBeDefined();
      expect(String(env["ANTHROPIC_API_KEY"])).toContain("ANTHROPIC_API_KEY");
    });

    it("collect-threads step falls back to REST review comments when GraphQL returns no unresolved threads", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("reviewLineComments.length > 0");
      expect(script).toContain("c.user.login");
      expect(script).toContain("summaryCount");
    });

    it("runs on ubuntu-latest", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      expect(job["runs-on"]).toBe("ubuntu-latest");
    });

    it("has an assign step using actions/github-script@v7", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      expect(assignStep).toBeDefined();
      expect(assignStep!.uses).toBe("actions/github-script@v7");
    });

    it("assign step calls addAssignees with copilot", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).toContain("addAssignees");
      expect(script).toContain("'copilot'");
    });

    it("assign step does NOT call requestReviewers", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).not.toContain("requestReviewers");
    });

    it("assign step uses issue_number (PR number) for the GitHub issues API", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).toContain("issue_number");
      expect(script).toContain("prNumber");
    });

    it("assign step resolves PR number from correct payload field for each event type", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).toContain("isCommentEvent");
      expect(script).toContain("context.payload.issue.number");
      expect(script).toContain("context.payload.pull_request.number");
    });

    it("assign step handles errors gracefully without failing the workflow", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).toContain("catch");
      expect(script).toContain("error.message");
    });

    it("has a step that collects unresolved threads and posts task summary", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      expect(collectStep).toBeDefined();
      expect(collectStep!.uses).toBe("actions/github-script@v7");
    });

    it("collect-threads step uses GraphQL to query unresolved review threads", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("github.graphql");
      expect(script).toContain("reviewThreads");
    });

    it("collect-threads step filters for unresolved threads only", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("isResolved");
      expect(script).toContain("unresolvedThreads");
    });

    it("collect-threads step updates the PR body with the task summary (not a comment)", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      // Must use pulls.update (not issues.createComment) so the agent reads it from the PR body
      expect(script).toContain("pulls.update");
      expect(script).toContain("body: newBody");
    });

    it("collect-threads step demarcates task section with HTML comment markers for idempotent updates", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("copilot-tasks-start");
      expect(script).toContain("copilot-tasks-end");
    });

    it("collect-threads step replaces existing task section instead of appending duplicate", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("TASK_START");
      expect(script).toContain("TASK_END");
      expect(script).toContain("startIdx");
    });

    it("collect-threads step handles issue_comment event by reading PR number from issue", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("isCommentEvent");
      expect(script).toContain("issue_comment");
      expect(script).toContain("context.payload.issue.number");
    });

    it("collect-threads step skips review comment fetch for issue_comment events", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("!isCommentEvent");
    });

    it("collect-threads step includes diffHunk in thread summaries for GraphQL path", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("firstComment.diffHunk");
      expect(script).toContain("Diff context");
    });

    it("collect-threads step includes diff_hunk in thread summaries for REST fallback path", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("c.diff_hunk");
    });

    it("collect-threads task section includes explicit instructions to apply suggestion blocks", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("apply the suggested code replacement");
      expect(script).toContain("push commits to this branch");
    });

    it("collect-threads step runs before the assign step", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectIdx = steps.findIndex(s => s.name === "Collect unresolved threads and post task summary");
      const assignIdx = steps.findIndex(s => s.name === "Assign PR to Copilot coding agent");
      expect(collectIdx).toBeGreaterThanOrEqual(0);
      expect(assignIdx).toBeGreaterThan(collectIdx);
    });

    it("collect-threads step fetches review line comments to detect suggestion blocks", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("listCommentsForReview");
      expect(script).toContain("review_id");
    });

    it("collect-threads step skips SWE trigger when review has no suggestion blocks", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("reviewHasCodeSuggestions");
      expect(script).toContain("summary-only");
    });

    it("collect-threads step sets has_suggestions output when suggestions are found", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const collectStep = steps.find(s => s.name === "Collect unresolved threads and post task summary");
      const script = String((collectStep!.with as Record<string, unknown>).script);
      expect(script).toContain("core.setOutput('has_suggestions', 'true')");
    });

    it("assign step removes copilot assignment before re-adding to force a fresh trigger", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      const script = String((assignStep!.with as Record<string, unknown>).script);
      expect(script).toContain("removeAssignees");
      expect(script).toContain("addAssignees");
    });

    it("assign step is gated on check-and-collect has_suggestions output", () => {
      const jobs = workflow.jobs as Record<string, unknown>;
      const job = jobs["trigger-copilot-agent"] as Record<string, unknown>;
      const steps = job.steps as Array<Record<string, unknown>>;
      const assignStep = steps.find(s => s.name === "Assign PR to Copilot coding agent");
      expect(String(assignStep!.if)).toContain("has_suggestions");
      expect(String(assignStep!.if)).toContain("check-and-collect");
    });
  });
});
