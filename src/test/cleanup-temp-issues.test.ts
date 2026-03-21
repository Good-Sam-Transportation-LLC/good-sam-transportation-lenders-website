/**
 * Cleanup Temporary Auto-Fix Issues Workflow Tests
 *
 * Validates the structure of the cleanup-temp-issues.yml workflow
 * that closes stale or orphaned copilot-autofix issues.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const WORKFLOW_PATH = ".github/workflows/cleanup-temp-issues.yml";
const readText = (rel: string) =>
  fs.readFileSync(path.join(ROOT, rel), "utf-8");

describe("cleanup-temp-issues workflow", () => {
  it("workflow file exists", () => {
    expect(fs.existsSync(path.join(ROOT, WORKFLOW_PATH))).toBe(true);
  });

  it("is valid YAML", () => {
    const content = readText(WORKFLOW_PATH);
    const parsed = parse(content);
    expect(parsed).toBeDefined();
    expect(parsed.name).toBeDefined();
  });

  it("triggers on schedule and pull_request closed", () => {
    const content = readText(WORKFLOW_PATH);
    const parsed = parse(content);
    expect(parsed.on.schedule).toBeDefined();
    expect(parsed.on.pull_request.types).toContain("closed");
  });

  it("triggers on workflow_dispatch for manual runs", () => {
    const content = readText(WORKFLOW_PATH);
    const parsed = parse(content);
    expect(parsed.on.workflow_dispatch).toBeDefined();
  });

  it("has issues write permission", () => {
    const content = readText(WORKFLOW_PATH);
    const parsed = parse(content);
    expect(parsed.permissions.issues).toBe("write");
  });

  it("has pull-requests read permission", () => {
    const content = readText(WORKFLOW_PATH);
    const parsed = parse(content);
    expect(parsed.permissions["pull-requests"]).toBe("read");
  });

  it("references copilot-autofix label", () => {
    const content = readText(WORKFLOW_PATH);
    expect(content).toContain("copilot-autofix");
  });

  it("parses PR number from issue title", () => {
    const content = readText(WORKFLOW_PATH);
    expect(content).toContain("Auto-Fix PR #");
  });

  it("closes issues when associated PR is closed", () => {
    const content = readText(WORKFLOW_PATH);
    expect(content).toContain("pulls.get");
    expect(content).toContain("state");
    expect(content).toContain("closed");
  });

  it("closes stale issues based on age", () => {
    const content = readText(WORKFLOW_PATH);
    expect(content).toContain("STALE_HOURS");
    expect(content).toContain("created_at");
  });
});
