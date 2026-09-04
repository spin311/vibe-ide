# Vibe IDE (working title)

This repository is a fork-in-progress of [VSCodium](https://github.com/VSCodium/vscodium),
which is itself a build pipeline that packages [Microsoft's `vscode`](https://github.com/microsoft/vscode)
source into freely-licensed binaries.

**Vibe IDE** (working title) will become a branded cross-platform code editor built on top of
VSCodium's build pipeline, with a hosted terminal, live preview, and orchestration features
bundled as extensions on top.

Right now this repo is an unmodified fork — no branding, patches, or product changes have been
applied yet. It exists to prove the build pipeline works end to end (`./dev/build.sh -p` producing
a launchable, VSCodium-branded app) before any customization begins.

## Status

- [x] Fork VSCodium's build pipeline and verify the baseline build (this step)
- [ ] Branding pass (name, icons, product.json)
- [ ] Hosted terminal extension
- [ ] Live preview extension
- [ ] Orchestration features

For the full design and rollout plan, see the design spec in the `spin311/claude-helper` repo
(cross-repo link, informational only — not a build dependency; that repo is private, so the
link only resolves for people with access):
`docs/superpowers/specs/2026-09-04-vscodium-fork-scaffold-design.md`

Until this repo grows its own documentation, that spec is the source of truth for scope and
sequencing.

## Building

This repo's build pipeline is currently VSCodium's own, unmodified. See VSCodium's
[build documentation](https://github.com/VSCodium/vscodium/blob/master/docs/howto-build.md)
for toolchain requirements and build instructions.
