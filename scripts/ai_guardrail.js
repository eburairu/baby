/**
 * scripts/ai_guardrail.js
 *
 * AI エージェント（Gemini CLI）がワークツリー以外のディレクトリでファイルを編集しようとした際、
 * それを阻止するためのガードレールスクリプトです。
 */
const { execSync } = require("child_process");

try {
  const currentPath = process.cwd();
  
  // パスに "/worktrees/" が含まれているか、または scripts などの許可されたディレクトリか判定
  const isWorktree = currentPath.includes("/worktrees/");
  
  if (!isWorktree) {
    console.error("\x1b[31m%s\x1b[0m", "ERROR: AI エージェントによるルートディレクトリでの直接編集は禁止されています。");
    console.error("必ず `sh scripts/setup_worktree.sh` を使用してワークツリー内で作業してください。");
    console.error(`Current directory: ${currentPath}`);
    process.exit(1);
  }
} catch (error) {
  // エラーが発生した場合は安全のためブロック
  console.error("Guardrail check failed:", error.message);
  process.exit(1);
}
