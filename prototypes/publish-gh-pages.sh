#!/usr/bin/env bash
# Publish the prototypes to the gh-pages branch (GitHub Pages):
#   /           B737 Takeoff Guide   (prototypes/b737-takeoff-guide)
#   /sim-prep/  B737 Sim Prep        (prototypes/b737-sim-prep), only with PUBLISH_SIM_PREP=yes
# Run from the repository root on the branch that holds the prototypes.
set -euo pipefail
root=$(git rev-parse --show-toplevel)
out=$(mktemp -d)
trap 'git -C "$root" worktree remove --force "$out" 2>/dev/null || true' EXIT

git -C "$root" fetch -q origin gh-pages || true
if git -C "$root" rev-parse -q --verify origin/gh-pages >/dev/null; then
  git -C "$root" worktree add -q -B gh-pages "$out" origin/gh-pages
else
  git -C "$root" worktree add -q --orphan -b gh-pages "$out"
fi

find "$out" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$root/prototypes/b737-takeoff-guide/." "$out/"
# B737 Sim Prep follows the airline's AOM closely: publish it only when the owner decides to.
if [ "${PUBLISH_SIM_PREP:-no}" = "yes" ] && [ -d "$root/prototypes/b737-sim-prep" ]; then
  mkdir -p "$out/sim-prep"
  cp -R "$root/prototypes/b737-sim-prep/." "$out/sim-prep/"
fi
rm -rf "$out/tests" "$out/sim-prep/tests"
touch "$out/.nojekyll"

git -C "$out" add -A
if git -C "$out" diff --cached --quiet; then echo "gh-pages already up to date"; exit 0; fi
git -C "$out" commit -q -m "Publish prototypes from $(git -C "$root" rev-parse --short HEAD)"
git -C "$out" push -q origin gh-pages
echo "Published to gh-pages"
