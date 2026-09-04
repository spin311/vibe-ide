#!/usr/bin/env bash
# Sourced (not executed) before running dev/build.sh or build.sh.
export APP_NAME="Vibe IDE"
# NOTE: APP_NAME_LC is NOT actually controllable here. utils.sh unconditionally
# recomputes it as `echo "${APP_NAME}" | awk '{print tolower($0)}'` (no
# `${APP_NAME_LC:-...}` fallback), so any value exported above is silently
# overwritten once utils.sh is sourced. Because APP_NAME has a space ("Vibe
# IDE"), that recomputed value is the literal string "vibe ide" (with a
# space), which is wrong for anything that becomes a path, URL, or tarball
# name. GLOBAL_DIRNAME must therefore be set explicitly and directly instead
# of relying on APP_NAME_LC.
export APP_NAME_LC="vibe-ide"
export BINARY_NAME="vibeide"
export ASSETS_REPOSITORY="spin311/vibe-ide"
export GH_REPO_PATH="spin311/vibe-ide"
export ORG_NAME="Vibe IDE"
export TUNNEL_APP_NAME="vibeide"
export GLOBAL_DIRNAME="vibe-ide"
export DISABLE_UPDATE="yes"
