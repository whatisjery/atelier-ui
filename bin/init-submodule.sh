#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a valid Git working tree."
  exit 1
fi

if git config --file .gitmodules --get-regexp "^submodule\.src/pro\." > /dev/null 2>&1; then
  echo "Removing existing submodule config..."
  git submodule deinit -f src/pro || true
  git rm -f src/pro || true
  rm -rf .git/modules/src/pro
fi

rm -rf src/pro

echo "Adding submodule..."
git submodule add -f "https://whatisjery:${GITHUB_REPO_CLONE_TOKEN}@github.com/whatisjery/atelier-ui-pro.git" src/pro

git submodule sync
git submodule update --init --recursive
