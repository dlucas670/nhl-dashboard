#!/usr/bin/env bash
set -e

echo ""
echo "=== Stat Grinder Deploy ==="
echo ""

# Show what will be committed
git status --short

echo ""
read -p "Commit message: " msg

if [ -z "$msg" ]; then
  echo "Aborting — commit message cannot be empty."
  exit 1
fi

git add -A
git commit -m "$msg"
git push origin main

echo ""
echo "✓ Pushed to origin/main — Vercel deploy triggered."
echo "  https://vercel.com/dashboard"
echo ""
