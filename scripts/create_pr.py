#!/usr/bin/env python3
import sys
import argparse
import subprocess
import tempfile
import os

def create_pr(base, head, title, body, edit_id=None):
    """
    GitHub PR を安全に作成または編集する。
    マルチラインの body を一時ファイル経由で gh CLI に渡すことでエスケープ問題を回避する。
    """
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as tmp:
        tmp.write(body)
        tmp_path = tmp.name

    try:
        if edit_id:
            cmd = ["gh", "pr", "edit", str(edit_id), "--body-file", tmp_path]
            if title:
                cmd.extend(["--title", title])
        else:
            cmd = ["gh", "pr", "create", "--base", base, "--head", head, "--title", title, "--body-file", tmp_path]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout.strip())
        else:
            print(f"Error: {result.stderr.strip()}", file=sys.stderr)
            sys.exit(result.returncode)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GitHub PR を安全に作成・編集します。")
    parser.add_argument("--base", default="develop", help="ベースブランチ（デフォルト: develop）")
    parser.add_argument("--head", help="ヘッドブランチ")
    parser.add_argument("--title", help="PR タイトル")
    parser.add_argument("--body", help="PR 本文（マルチライン可）")
    parser.add_argument("--edit", help="編集する場合の PR 番号または URL")

    args = parser.parse_args()

    # 作成（editなし）の場合は head と title が必須
    if not args.edit:
        if not args.head:
            print("Error: --head is required for PR creation", file=sys.stderr)
            sys.exit(1)
        if not args.title:
            print("Error: --title is required for PR creation", file=sys.stderr)
            sys.exit(1)
    
    body = args.body
    if not body:
        if not sys.stdin.isatty():
            body = sys.stdin.read()
        else:
            print("Error: body is required (via --body or stdin)", file=sys.stderr)
            sys.exit(1)

    create_pr(args.base, args.head, args.title, body, edit_id=args.edit)
