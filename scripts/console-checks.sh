#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[check] top-level throw guard"
if grep -n "throw new Error" kepler-lab.js dynamics-lab.js app.js; then
  echo "[fail] throw new Error detected in runtime modules"
  exit 1
fi

echo "[check] key DOM ids"
required_ids=(
  kepler-view kepler-canvas kepler-a kepler-e kepler-force kepler-feedback
  dynamics-view dyn-thrust-canvas dyn-orbit-canvas dyn-force dyn-mass dyn-feedback
)
for id in "${required_ids[@]}"; do
  if ! grep -q "id=\"$id\"" index.html; then
    echo "[fail] missing id in index.html: $id"
    exit 1
  fi
done

echo "[ok] console checks passed"