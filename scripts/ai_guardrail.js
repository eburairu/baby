/**
 * scripts/ai_guardrail.js
 *
 * AI エージェント（Gemini CLI）がワークツリー以外のディレクトリでファイルを編集しようとした際、
 * それを阻止するためのガードレールスクリプトです。
 */
const { execSync } = require("child_process");
const path = require("path");

try {
  const currentPath = process.cwd();
  
  // プロジェクトのルートディレクトリを取得
  let projectRoot;
  try {
    const gitCommonDir = execSync("git rev-parse --git-common-dir", { encoding: "utf8" }).trim();
    projectRoot = path.resolve(gitCommonDir, "..");
  } catch (e) {
    // Git 管理下でない場合は現在のパスをルートとみなす
    projectRoot = currentPath;
  }

  // ワークツリーディレクトリのパス
  const worktreesDir = path.join(projectRoot, "worktrees");
  
  // 現在のディレクトリがワークツリー配下か判定
  const isInsideWorktree = currentPath.startsWith(worktreesDir + path.sep) || currentPath === worktreesDir;
  
  // 許可されたディレクトリ（scripts/ 等）の判定
  const allowedPaths = [
    path.join(projectRoot, "scripts"),
    path.join(projectRoot, ".gemini"),
    path.join(projectRoot, ".specify")
  ];
  
  const isAllowedPath = allowedPaths.some(allowedPath => 
    currentPath === allowedPath || currentPath.startsWith(allowedPath + path.sep)
  );

  // デバッグ用（通常は表示しないが、エラー時に役立つ）
  if (process.env.DEBUG_GUARDRAIL) {
    console.log(`Current: ${currentPath}`);
    console.log(`Project Root: ${projectRoot}`);
    console.log(`isInsideWorktree: ${isInsideWorktree}`);
    console.log(`isAllowedPath: ${isAllowedPath}`);
  }

  if (!isInsideWorktree && !isAllowedPath) {
    console.error("\x1b[31m%s\x1b[0m", "ERROR: AI エージェントによるルートディレクトリでの直接編集は禁止されています。");
    console.error("必ず `sh scripts/setup_worktree.sh` を使用してワークツリー内で作業してください。");
    console.error(`Current directory: ${currentPath}`);
    console.error("例外として scripts/, .gemini/, .specify/ 配下での作業は許可されています。");
    process.exit(1);
  }

  if (process.env.DEBUG_GUARDRAIL) {
    console.log("Guardrail check passed.");
  }
} catch (error) {
  // エラーが発生した場合は安全のためブロック
  console.error("Guardrail check failed:", error.message);
  process.exit(1);
}
