#!/bin/bash
set -e

echo "Starting automated git workflow..."

# 1. Pull latest main
echo "Pulling latest main..."
git checkout main
git pull origin main --no-edit

# 2. Update develop
echo "Updating develop branch..."
git checkout develop
git merge main --no-edit
git push origin develop

# 3. Merge develop into main
echo "Merging develop into main..."
git checkout main
git merge develop --no-edit
git push origin main

# 4. Return to develop
echo "Returning to develop branch..."
git checkout develop

echo "Workflow completed successfully!"
