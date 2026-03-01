/**
 * scripts/ai_guardrail.js
 *
 * AI エージェント（Gemini CLI）がワークツリー以外のディレクトリでファイルを編集しようとした際、
 * それを阻止するためのガードレールスクリプトです。
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

function outputResult(result) {
  console.log(JSON.stringify(result));
  process.exit(0);
}

try {
  // Read stdin to get the tool input JSON
  let input = "";
  try {
    input = fs.readFileSync(0, "utf8");
  } catch (e) {
    // If there's no stdin, we might not be run as a hook.
  }

  let toolCall = {};
  if (input) {
    try {
      toolCall = JSON.parse(input);
    } catch (e) {
      console.error("フックの標準入力（stdin）のパースに失敗しました:", e.message);
    }
  }

  const currentPath = process.cwd();
  
  // プロジェクトのルートディレクトリを取得
  let projectRoot;
  try {
    const gitCommonDir = execSync("git rev-parse --git-common-dir", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    projectRoot = path.resolve(gitCommonDir, "..");
  } catch (e) {
    // Git 管理下でない場合は現在のパスをルートとみなす
    projectRoot = currentPath;
  }

  // ワークツリーディレクトリのパス
  const worktreesDir = path.join(projectRoot, "worktrees");
  
  // 許可されたディレクトリ（scripts/ 等）の判定
  const allowedDirs = [
    path.join(projectRoot, "scripts"),
    path.join(projectRoot, ".gemini"),
    path.join(projectRoot, ".specify"),
    path.join(projectRoot, ".planning"),
    path.join(os.homedir(), ".gemini"), // ユーザーレベルの .gemini
    worktreesDir
  ];

  let targetFilePath = null;

  // ツール引数からファイルパスを抽出（利用可能な場合）
  if (toolCall && toolCall.tool_input) {
    const { tool_name, tool_input } = toolCall;
    
    if (tool_input.file_path) {
      targetFilePath = path.resolve(currentPath, tool_input.file_path);
    }
    
    // "edit" エージェント、または明示的な file_path のないツールの場合、
    // 内部ツール呼び出し（これもフックをトリガーする）に依存する可能性がある
    if (!targetFilePath && tool_name === 'edit') {
       // 'edit' サブエージェントの起動を許可する。内部のファイル変更はフックされる。
       outputResult({ decision: "allow" });
    }
  }

  if (targetFilePath) {
    const isAllowed = allowedDirs.some(dir => 
      targetFilePath === dir || targetFilePath.startsWith(dir + path.sep)
    );

    if (process.env.DEBUG_GUARDRAIL) {
      console.error(`対象ファイル: ${targetFilePath}`);
      console.error(`許可されていますか: ${isAllowed}`);
    }

    if (!isAllowed) {
      const reason = "エラー: AI エージェントによるルートディレクトリでの直接編集は禁止されています。\n必ず `sh scripts/setup_worktree.sh` を使用して作成した worktrees/ 配下のファイルを編集してください。\n例外として scripts/, .gemini/, .specify/, .planning/, ~/.gemini/ 配下での作業は許可されています。";
      console.error("\x1b[31m%s\x1b[0m", reason);
      outputResult({ decision: "deny", reason: reason });
    }
  } else {
    // 対象ファイルが特定できない場合（かつ edit ツールではない場合）、
    // process.cwd() を基準に評価する（通常はプロジェクトルートになる）
    const isInsideWorktree = currentPath.startsWith(worktreesDir + path.sep) || currentPath === worktreesDir;
    
    const isAllowedPath = allowedDirs.some(allowedPath => 
      currentPath === allowedPath || currentPath.startsWith(allowedPath + path.sep)
    );

    if (!isInsideWorktree && !isAllowedPath) {
      const reason = "エラー: 対象のファイルパスが特定できず、現在のディレクトリがワークツリー内ではありません。";
      console.error("\x1b[31m%s\x1b[0m", reason);
    }
  }

  outputResult({ decision: "allow" });

} catch (error) {
  console.error("ガードレールチェックに失敗しました:", error.message);
  // process.exit(2) は予期しないエラー時にツール実行を安全にブロックする
  process.exit(2);
}
