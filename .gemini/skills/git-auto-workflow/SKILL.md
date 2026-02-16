---
name: git-auto-workflow
description: Automates the Git workflow of pulling from main, pushing to develop, and merging into main. Use when the user wants to sync and push changes across develop and main branches non-interactively.
---

# Git Auto Workflow

This skill automates a standard Git flow used in this project to ensure main and develop branches are synchronized and updated.

## Workflow Details

The following steps are executed sequentially in non-interactive mode:
1. `git checkout main` and `git pull origin main --no-edit`
2. `git checkout develop`, `git merge main --no-edit`, and `git push origin develop`
3. `git checkout main`, `git merge develop --no-edit`, and `git push origin main`
4. `git checkout develop`

## How to execute

Run the bundled script:

```bash
bash .gemini/skills/git-auto-workflow/scripts/run_workflow.sh
```

## Safety rules

- Ensure you have no uncommitted changes before running.
- If a merge conflict occurs, the script will stop (due to `set -e`). You must resolve it manually.
