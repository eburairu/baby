#!/bin/bash
cd frontend
files=$(find components -type f -name "*.tsx")
for f in $files; do
    # Find button-like elements without aria-pressed when acting as toggle
    grep -E "onClick=.*selected" $f | grep -v aria-pressed
done
