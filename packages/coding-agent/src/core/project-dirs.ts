import { basename, join } from "node:path";
import { resolvePath } from "../utils/paths.ts";

export function getProjectDirs(cwd: string, agentDir: string): string[] {
	const dirs: string[] = [];
	const resolvedCwd = resolvePath(cwd);
	const resolvedAgentDir = resolvePath(agentDir);

	const repoSlug = getGitRepoSlug(resolvedCwd);
	if (repoSlug) {
		dirs.push(join(resolvedAgentDir, "projects", ...repoSlug.split("/")));
	}

	dirs.push(join(resolvedAgentDir, "projects", basename(resolvedCwd)));

	return [...new Set(dirs)];
}

function getGitRepoSlug(cwd: string): string | undefined {
	try {
		const { execSync } = require("node:child_process");
		const url = execSync("git remote get-url origin", {
			cwd,
			encoding: "utf-8",
			timeout: 3000,
			stdio: ["pipe", "pipe", "ignore"],
		}).trim();

		const m = url.match(/[:/]([^/:@]+)\/([^/:@]+?)(?:\.git)?$/);
		if (m) return `${m[1]}/${m[2]}`;
	} catch {
		// not a git repo or no origin remote
	}
	return undefined;
}
