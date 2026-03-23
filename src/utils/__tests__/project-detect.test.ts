import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectProject } from "../project-detect.js";
import { writeFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

describe("detectProject", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `shortscut-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it("package.json에서 기술 스택을 감지한다", async () => {
    await writeFile(
      join(testDir, "package.json"),
      JSON.stringify({
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
          "@supabase/supabase-js": "^2.0.0",
        },
        devDependencies: {
          typescript: "^5.0.0",
          tailwindcss: "^3.0.0",
        },
      })
    );

    const result = await detectProject(testDir);
    expect(result.techStack).toContain("Next.js");
    expect(result.techStack).toContain("React");
    expect(result.techStack).toContain("Supabase");
    expect(result.techStack).toContain("TypeScript");
    expect(result.techStack).toContain("Tailwind CSS");
  });

  it("package.json이 없으면 빈 스택을 반환한다", async () => {
    const result = await detectProject(testDir);
    expect(result.techStack).toEqual([]);
  });

  it("AI 도구를 감지한다 — Cursor", async () => {
    await mkdir(join(testDir, ".cursor"), { recursive: true });
    const result = await detectProject(testDir);
    expect(result.aiTools).toContain("Cursor");
  });

  it("AI 도구를 감지한다 — Claude Code", async () => {
    await mkdir(join(testDir, ".claude"), { recursive: true });
    const result = await detectProject(testDir);
    expect(result.aiTools).toContain("Claude Code");
  });

  it("패키지 매니저를 감지한다 — npm", async () => {
    await writeFile(join(testDir, "package-lock.json"), "{}");
    const result = await detectProject(testDir);
    expect(result.packageManager).toBe("npm");
  });

  it("패키지 매니저를 감지한다 — pnpm", async () => {
    await writeFile(join(testDir, "pnpm-lock.yaml"), "");
    const result = await detectProject(testDir);
    expect(result.packageManager).toBe("pnpm");
  });

  it("패키지 매니저를 감지한다 — yarn", async () => {
    await writeFile(join(testDir, "yarn.lock"), "");
    const result = await detectProject(testDir);
    expect(result.packageManager).toBe("yarn");
  });

  it("패키지 매니저를 감지한다 — bun", async () => {
    await writeFile(join(testDir, "bun.lockb"), "");
    const result = await detectProject(testDir);
    expect(result.packageManager).toBe("bun");
  });

  it("lock 파일이 없으면 패키지 매니저가 null이다", async () => {
    const result = await detectProject(testDir);
    expect(result.packageManager).toBeNull();
  });

  it("AI 도구가 없으면 빈 배열을 반환한다", async () => {
    const result = await detectProject(testDir);
    expect(result.aiTools).toEqual([]);
  });
});
