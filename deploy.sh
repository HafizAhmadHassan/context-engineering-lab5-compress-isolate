#!/bin/bash
set -euo pipefail

# Deploy the static export (./out) to the gh-pages branch of the repo origin.
# Reads repo URL from `git remote get-url origin`.

REPO_URL=$(git remote get-url origin)
REPO_URL="${REPO_URL#https://github.com/}"
REPO_URL="${REPO_URL%.git}"
echo "Deploying to repo: $REPO_URL"

npm run build

COMMIT_SHA=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B | head -1)

cd out
touch .nojekyll

if [ ! -d .git ]; then
  git init -b gh-pages -q
fi
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$REPO_URL.git" 2>/dev/null || true
git config user.name "Hafiz Ahmad Hassan"
git config user.email "ahmadhassan061@gmail.com"
git add -A
git commit -q -m "Deploy ${COMMIT_SHA}: ${COMMIT_MSG}" || echo "no changes to deploy"
git push -f origin gh-pages

echo ""
echo "Deployed to https://$REPO_URL/"
