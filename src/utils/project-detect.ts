/**
 * 현재 프로젝트의 기술 스택과 AI 도구 사용 여부를 자동 감지
 */

import { readFile, access } from "fs/promises";
import { join } from "path";

export interface ProjectInfo {
  techStack: string[];
  aiTools: string[];
  buildDuration: string | null;
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | null;
}

const AI_TOOL_INDICATORS: Record<string, string[]> = {
  Cursor: [".cursor", ".cursorignore", ".cursorrules"],
  "Claude Code": [".claude", "CLAUDE.md"],
  Bolt: [".bolt"],
  Windsurf: [".windsurfrules"],
  Codeium: [".codeium"],
};

const TECH_STACK_FROM_DEPS: Record<string, string> = {
  next: "Next.js",
  react: "React",
  vue: "Vue.js",
  nuxt: "Nuxt.js",
  svelte: "Svelte",
  "@sveltejs/kit": "SvelteKit",
  angular: "Angular",
  express: "Express.js",
  fastify: "Fastify",
  hono: "Hono",
  "@supabase/supabase-js": "Supabase",
  firebase: "Firebase",
  prisma: "Prisma",
  drizzle: "Drizzle",
  mongoose: "MongoDB (Mongoose)",
  stripe: "Stripe",
  tailwindcss: "Tailwind CSS",
  "shadcn-ui": "shadcn/ui",
  "@radix-ui/react-icons": "Radix UI",
  "three": "Three.js",
  electron: "Electron",
  "react-native": "React Native",
  expo: "Expo",
};

export async function detectProject(
  projectDir: string
): Promise<ProjectInfo> {
  const techStack: string[] = [];
  const aiTools: string[] = [];

  // 1. package.json에서 기술 스택 추출
  try {
    const pkgPath = join(projectDir, "package.json");
    const pkgContent = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    for (const [dep, name] of Object.entries(TECH_STACK_FROM_DEPS)) {
      if (allDeps[dep]) {
        techStack.push(name);
      }
    }

    // TypeScript 감지
    if (allDeps["typescript"]) {
      techStack.push("TypeScript");
    }
  } catch {
    // package.json 없으면 스킵
  }

  // 2. AI 도구 감지
  for (const [tool, indicators] of Object.entries(AI_TOOL_INDICATORS)) {
    for (const indicator of indicators) {
      try {
        await access(join(projectDir, indicator));
        aiTools.push(tool);
        break;
      } catch {
        // 파일 없으면 다음
      }
    }
  }

  // 3. 패키지 매니저 감지
  let packageManager: ProjectInfo["packageManager"] = null;
  const pmFiles: Array<[string, ProjectInfo["packageManager"]]> = [
    ["bun.lockb", "bun"],
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ];

  for (const [file, pm] of pmFiles) {
    try {
      await access(join(projectDir, file));
      packageManager = pm;
      break;
    } catch {
      // 다음
    }
  }

  return {
    techStack,
    aiTools,
    buildDuration: null, // Git 히스토리 기반 계산은 별도 유틸
    packageManager,
  };
}
