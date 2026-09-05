# Vibe IDE (working title)

This repository is a fork-in-progress of [VSCodium](https://github.com/VSCodium/vscodium),
which is itself a build pipeline that packages [Microsoft's `vscode`](https://github.com/microsoft/vscode)
source into freely-licensed binaries.

**Vibe IDE** (working title) will become a branded cross-platform code editor built on top of
VSCodium's build pipeline, with a hosted terminal, live preview, and orchestration features
bundled as extensions on top.

## Status

- [x] Fork VSCodium's build pipeline and verify the baseline build
- [x] Branding pass (name, bundle id, product.json)
- [x] `extensions/` workspace scaffolded with a branded app and hosted terminal extension
- [x] Hosted terminal extension
- [ ] Live preview extension
- [ ] Orchestration features

Branding is applied: the app is **"Vibe IDE"** (working title), bundle id `com.vibeide.app`,
binary name `vibeide`. Some VSCodium identity strings are not yet re-branded — see
[Known gaps](#known-gaps) below.

For the full design and rollout plan, see the design spec in the `spin311/claude-helper` repo
(cross-repo link, informational only — not a build dependency; that repo is private, so the
link only resolves for people with access):
`docs/superpowers/specs/2026-09-04-vscodium-fork-scaffold-design.md`

## Building

Branding is applied via environment variables, not by editing checked-in build scripts. To
build with Vibe IDE branding:

```bash
source scripts/set-branding-env.sh
./dev/build.sh -p
```

Use `./dev/build.sh`, not a bare `./build.sh` — `build.sh`'s entire body is gated behind
`SHOULD_BUILD=yes`, which is otherwise only set by CI, so calling it directly without also
setting `SHOULD_BUILD`/`OS_NAME`/`VSCODE_ARCH` and first sourcing `get_repo.sh` to check out
`vscode/` will silently no-op or fail with `'vscode' dir not found`. `dev/build.sh` handles
all of that for you and calls `build.sh` internally — it now correctly picks up the branding
vars exported by `scripts/set-branding-env.sh` (its five `APP_NAME`/`BINARY_NAME`/etc. lines
use `${VAR:-default}` fallback syntax, so anything already exported wins instead of being
clobbered). See `docs/patches.md` and `docs/howto-build.md` for the underlying VSCodium
pipeline mechanics if you need them.

### Windows

Windows builds are configured but unverified. See `docs/windows-build-status.md`.

## Known gaps

- **Windows branding.** `docs/windows-build-status.md` tracks what a Windows build has not
  yet had verified, plus a set of VSCodium identity strings (`win32ShellNameShort`,
  `win32AppUserModelId`, the `win32*AppId` installer GUIDs, etc.) that are still VSCodium's own
  and would need to change before a Windows installer built from this tree could safely coexist
  with a real VSCodium install.
- **Extensions bundling.** `extensions/` is the workspace for this project's own functionality
  (hosted terminal, live preview, orchestration), built as VS Code extensions rather than forked
  into `vscode/` itself. `extensions/vibe-claude-terminal/` is the real hosted-terminal extension
  and proves the install mechanism works end to end (build a `.vsix`, install it into the running
  app via the CLI) — but nothing in the build pipeline (`build.sh`, `prepare_vscode.sh`,
  `prepare_src.sh`, `get_repo.sh`) automatically bundles `extensions/` into the packaged app yet.
  See `docs/extensions-workspace.md`.
