#!/usr/bin/env bash
# Push Airbus Strike Analysis repository to personal GitHub
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Checking SSH authentication with GitHub..."
ssh -T git@github.com || true

echo "Pushing main branch to origin (git@github.com:sergiomh499/airbus-strikes-analysis.git)..."
git push -u origin main

echo "✓ Successfully pushed to https://github.com/sergiomh499/airbus-strikes-analysis"
