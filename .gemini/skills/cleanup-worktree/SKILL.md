---
name: cleanup-worktree
description: Cleans up git worktrees by running the project's cleanup script. Use when the user asks to clean up worktrees or run the cleanup script.
---

# Cleanup Worktree

This skill cleans up the project's git worktrees.

When the user requests to clean up worktrees, execute the `scripts/cleanup_worktrees.sh` script in the project root.

```bash
sh scripts/cleanup_worktrees.sh
```

Ensure you are in the project root directory when running this command.