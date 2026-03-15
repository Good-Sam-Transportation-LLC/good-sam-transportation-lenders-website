/**
 * CI Pipeline Validation Tests
 *
 * These tests verify that the GitHub Actions CI workflow is correctly
 * configured with proper job definitions, dependency graph, script
 * references, environment settings, and artifact configuration.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parse } from "yaml";

const ROOT = path.resolve(import.meta.dirname, "../..");
const readText = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf-8");
const readJson = (rel: string) => JSON.parse(readText(rel));

const ciYaml = readText(".github/workflows/ci.yml");
const ci = parse(ciYaml);
const pkg = readJson("package.json");

// ---------------------------------------------------------------------------
// Group 1: Workflow File Structure
// ---------------------------------------------------------------------------
describe("Workflow file structure", () => {
  it("CI workflow file exists at .github/workflows/ci.yml", () => {
    expect(fs.existsSync(path.join(ROOT, ".github/workflows/ci.yml"))).toBe(true);
  });

  it("workflow name is CI", () => {
    expect(ci.name).toBe("CI");
  });

  it("triggers on push to all branches", () => {
    expect(ci.on.push.branches).toContain("**");
  });

  it("triggers on pull_request to main branch", () => {
    expect(ci.on.pull_request.branches).toContain("main");
  });

  it("defines exactly four jobs", () => {
    expect(Object.keys(ci.jobs).length).toBe(4);
  });

  it("defines the expected job IDs: lint-and-typecheck, test, security, build", () => {
    const jobIds = new Set(Object.keys(ci.jobs));
    const expected = new Set(["lint-and-typecheck", "test", "security", "build"]);
    expect(jobIds).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// Group 2: Job Dependency Graph and Execution Order
// ---------------------------------------------------------------------------
describe("Job dependency graph and execution order", () => {
  it("lint-and-typecheck job has no dependencies", () => {
    expect(ci.jobs["lint-and-typecheck"].needs).toBeUndefined();
  });

  it("test job has no dependencies", () => {
    expect(ci.jobs["test"].needs).toBeUndefined();
  });

  it("security job has no dependencies", () => {
    expect(ci.jobs["security"].needs).toBeUndefined();
  });

  it("build job depends on lint-and-typecheck, test, and security", () => {
    const needs = ci.jobs["build"].needs;
    expect(needs).toHaveLength(3);
    expect(needs).toContain("lint-and-typecheck");
    expect(needs).toContain("test");
    expect(needs).toContain("security");
  });

  it("all jobs run on ubuntu-latest", () => {
    for (const [name, job] of Object.entries(ci.jobs)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((job as any)["runs-on"], `job "${name}" should run on ubuntu-latest`).toBe("ubuntu-latest");
    }
  });

  it("every job runs checkout before setup-node", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const job of Object.values(ci.jobs) as any[]) {
      const steps = job.steps;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const checkoutIndex = steps.findIndex((s: any) => s.uses?.startsWith("actions/checkout"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setupNodeIndex = steps.findIndex((s: any) => s.uses?.startsWith("actions/setup-node"));
      expect(checkoutIndex).toBeGreaterThanOrEqual(0);
      expect(setupNodeIndex).toBeGreaterThanOrEqual(0);
      expect(checkoutIndex).toBeLessThan(setupNodeIndex);
    }
  });

  it("every job runs npm ci before any npm run command", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const job of Object.values(ci.jobs) as any[]) {
      const steps = job.steps;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const npmCiIndex = steps.findIndex((s: any) => s.run === "npm ci");
      const npmRunIndices = steps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any, i: number) => (s.run && s.run.startsWith("npm run") ? i : -1))
        .filter((i: number) => i !== -1);

      expect(npmCiIndex).toBeGreaterThanOrEqual(0);
      for (const runIndex of npmRunIndices) {
        expect(npmCiIndex).toBeLessThan(runIndex);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Group 3: Script References and Environment Consistency
// ---------------------------------------------------------------------------
describe("Script references and environment consistency", () => {
  it("all npm run scripts in CI exist in package.json", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSteps = Object.values(ci.jobs).flatMap((job: any) => job.steps);
    const npmRunScripts: string[] = [];

    for (const step of allSteps) {
      if (typeof step.run === "string") {
        const match = step.run.match(/^npm run (\S+)$/);
        if (match) {
          npmRunScripts.push(match[1]);
        }
        if (step.run === "npm test") {
          npmRunScripts.push("test");
        }
      }
    }

    expect(npmRunScripts.length).toBeGreaterThan(0);
    for (const script of npmRunScripts) {
      expect(pkg.scripts, `missing script: ${script}`).toHaveProperty(script);
    }
  });

  it("npm test command in CI maps to an existing package.json script", () => {
    expect(pkg.scripts.test).toBeDefined();

    const testJob = ci.jobs.test;
    const hasNpmTest = testJob.steps.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (step: any) => typeof step.run === "string" && step.run === "npm test",
    );
    expect(hasNpmTest).toBe(true);
  });

  it("all jobs use Node version 20", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const [jobName, job] of Object.entries(ci.jobs) as [string, any][]) {
      const setupNode = job.steps.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (step: any) =>
          typeof step.uses === "string" &&
          step.uses.startsWith("actions/setup-node@"),
      );
      expect(
        setupNode,
        `job "${jobName}" is missing setup-node step`,
      ).toBeDefined();
      expect(setupNode.with["node-version"]).toBe(20);
    }
  });

  it("Node version in CI matches package.json engines requirement", () => {
    const enginesNode = pkg.engines.node;
    expect(enginesNode).toBe(">=20");

    const ciNodeVersion = 20;
    const minVersion = parseInt(enginesNode.replace(">=", ""), 10);
    expect(ciNodeVersion).toBeGreaterThanOrEqual(minVersion);
  });

  it("all jobs enable npm caching", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const [jobName, job] of Object.entries(ci.jobs) as [string, any][]) {
      const setupNode = job.steps.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (step: any) =>
          typeof step.uses === "string" &&
          step.uses.startsWith("actions/setup-node@"),
      );
      expect(
        setupNode,
        `job "${jobName}" is missing setup-node step`,
      ).toBeDefined();
      expect(setupNode.with.cache).toBe("npm");
    }
  });

  it("CI uses actions/checkout@v4 in all jobs", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const [jobName, job] of Object.entries(ci.jobs) as [string, any][]) {
      const checkoutStep = job.steps.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (step: any) =>
          typeof step.uses === "string" &&
          step.uses.startsWith("actions/checkout@v4"),
      );
      expect(
        checkoutStep,
        `job "${jobName}" is missing actions/checkout@v4`,
      ).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Group 4: Artifact Configuration and CI Stage Coverage
// ---------------------------------------------------------------------------
describe("Artifact configuration and CI stage coverage", () => {
  const buildJob = ci.jobs.build;
  const uploadStep = buildJob.steps.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (s: any) => s.uses && s.uses.startsWith("actions/upload-artifact@v4"),
  );

  it("build job uploads artifact with name dist", () => {
    expect(uploadStep).toBeDefined();
    expect(uploadStep.with.name).toBe("dist");
  });

  it("build artifact path is dist/", () => {
    expect(uploadStep.with.path).toBe("dist/");
  });

  it("build artifact retention is set to 7 days", () => {
    expect(uploadStep.with["retention-days"]).toBe(7);
  });

  it("build-verification.test.ts is excluded from default vitest config", () => {
    const vitestCfg = readText("vitest.config.ts");
    expect(vitestCfg).toContain("build-verification.test.ts");
  });

  it("build-verification.test.ts is included in vitest.build.config.ts", () => {
    const buildCfg = readText("vitest.build.config.ts");
    expect(buildCfg).toContain("build-verification");
  });

  it("CI pipeline covers all required stages: lint, typecheck, test, build, build-verify", () => {
    const allRuns: string[] = [];
    for (const jobKey of Object.keys(ci.jobs)) {
      const job = ci.jobs[jobKey];
      for (const step of job.steps) {
        if (step.run) {
          allRuns.push(step.run);
        }
      }
    }
    const combined = allRuns.join("\n");
    expect(combined).toContain("npm run lint");
    expect(combined).toContain("npm run typecheck");
    expect(combined).toContain("npm test");
    expect(combined).toContain("npm run build");
    expect(combined).toContain("npm run test:build");
  });

  it("CI pipeline includes security audit step", () => {
    const allRuns: string[] = [];
    for (const jobKey of Object.keys(ci.jobs)) {
      const job = ci.jobs[jobKey];
      for (const step of job.steps) {
        if (step.run) {
          allRuns.push(step.run);
        }
      }
    }
    const combined = allRuns.join("\n");
    expect(combined).toContain("npm audit");
  });
});
