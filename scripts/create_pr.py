#!/usr/bin/env python3
"""
GitHub PR を安全に作成・編集するユーティリティ。
マルチラインの body を一時ファイル経由で gh CLI に渡すことでエスケープ問題を回避する。

--body-file で指定されたファイルは PR 作成/編集後に自動削除される。
残留ファイル（pr_body.md 等）を防ぐための設計。
"""
import sys
import argparse
import subprocess
import tempfile
import os


def create_pr(base, head, title, body, body_file=None, edit_id=None):
    """
    GitHub PR を安全に作成または編集する。

    body_file が指定された場合はそのファイルを使用し、処理後に自動削除する。
    body（文字列）が指定された場合は一時ファイルを作成して使用する。
    """
    tmp_path = None
    cleanup_paths = []

    if body_file:
        # 外部ファイルが指定された場合、そのファイルを使用し、処理後に削除する
        if not os.path.exists(body_file):
            print(f"Error: body file not found: {body_file}", file=sys.stderr)
            sys.exit(1)
        tmp_path = body_file
        cleanup_paths.append(body_file)
    elif body:
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".md") as tmp:
            tmp.write(body)
            tmp_path = tmp.name
        cleanup_paths.append(tmp_path)

    try:
        if edit_id:
            cmd = ["gh", "pr", "edit", str(edit_id)]
            if tmp_path:
                cmd.extend(["--body-file", tmp_path])
            if title:
                cmd.extend(["--title", title])
        else:
            # 作成時は title と body が必須（前段のバリデーションで保証）
            cmd = ["gh", "pr", "create", "--base", base, "--head", head, "--title", title, "--body-file", tmp_path]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(result.stdout.strip())
        else:
            print(f"Error: {result.stderr.strip()}", file=sys.stderr)
            sys.exit(result.returncode)
    finally:
        for path in cleanup_paths:
            if path and os.path.exists(path):
                os.remove(path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GitHub PR を安全に作成・編集します。")
    parser.add_argument("--base", default="develop", help="ベースブランチ（デフォルト: develop）")
    parser.add_argument("--head", help="ヘッドブランチ（省略時は現在のブランチ）")
    parser.add_argument("--title", help="PR タイトル")
    parser.add_argument("--body", help="PR 本文（マルチライン可）")
    parser.add_argument("--body-file", dest="body_file", help="PR 本文を含むファイルパス（処理後に自動削除される）")
    parser.add_argument("--edit", help="編集する場合の PR 番号または URL")

    args = parser.parse_args()

    # 作成（editなし）の場合は title が必須。head は省略時に現在のブランチを使用
    if not args.edit:
        if not args.head:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True, text=True
            )
            args.head = result.stdout.strip()
            if not args.head:
                print("Error: --head is required (current branch could not be detected)", file=sys.stderr)
                sys.exit(1)
        if not args.title:
            print("Error: --title is required for PR creation", file=sys.stderr)
            sys.exit(1)

    # body の取得: --body-file > --body > stdin の優先順位
    body_file = args.body_file
    body = args.body

    if body_file and body:
        print("Error: --body and --body-file are mutually exclusive", file=sys.stderr)
        sys.exit(1)

    if not body_file and not body and not sys.stdin.isatty():
        body = sys.stdin.read()

    # 作成時は body が必須
    if not args.edit and not body and not body_file:
        print("Error: body is required for PR creation (via --body, --body-file, or stdin)", file=sys.stderr)
        sys.exit(1)

    create_pr(args.base, args.head, args.title, body, body_file=body_file, edit_id=args.edit)
