---
name: qa-engineer
description: Conducts comprehensive quality assurance checks (build, test, lint) for frontend and backend. Use when users ask to "check code quality", "run tests", "fix build errors", or "verify changes".
---

# QA Engineer

This skill provides a comprehensive quality assurance workflow to ensure code stability and correctness. It automatically detects the project structure (Frontend/Backend) and runs appropriate verification commands.

## When to Use

- After making significant code changes to verify nothing is broken.
- When the user reports a build error or bug and wants to investigate.
- Before committing changes or creating a PR (if requested).
- To detect duplicate identifiers, type errors, or linting issues.

## Workflow

1.  **Run Automated Checks**: Execute the bundled `run_checks.sh` script to perform a full suite of checks.
    -   **Frontend**: Runs `pnpm build` (Next.js build + TypeCheck), `pnpm lint`, and `pnpm test`.
    -   **Backend**: Checks Python syntax and runs `pytest` if available.

2.  **Analyze Failures**:
    -   If the script fails, analyze the output log.
    -   Identify the specific file and line number causing the error.
    -   **Crucial**: If the error is "Duplicate identifier" or "Type error", check imports and type definitions in the affected files.

3.  **Fix and Verify**:
    -   Apply fixes to the code.
    -   **Re-run the checks** to ensure the fix works and didn't introduce regressions.

## Tools

### `run_checks.sh`

A bash script that runs the project's standard build and test commands.

```bash
# Execute from the project root
./.gemini/tmp/skills/qa-engineer/scripts/run_checks.sh
```

*(Note: The actual path will be determined by where the skill is installed. Use the relative path provided by the skill loader.)*

## Troubleshooting Guide

### Common Build Errors

-   **Duplicate identifier**: Often caused by merging branches that both added the same import. Check `git log` or `git blame` to see recent changes.
-   **Module not found**: Check `package.json` dependencies and ensure `pnpm install` has been run.
-   **Type mismatch**: Check if an API response type matches the frontend interface definition.
