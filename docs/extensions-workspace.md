# The `extensions/` workspace

`extensions/` at the repo root is the intended home for this project's own functionality —
hosted terminal, live preview, orchestration — built as ordinary VS Code extensions rather than
forked into `vscode/` itself. The premise (see the design spec) is that later pieces should
mostly be "add an extension," not "patch VS Code core."

## What exists today

`extensions/vibe-ide-placeholder/` is a minimal extension package that proves the install
mechanism works end to end:

1. `npm install && npm run compile` builds it.
2. `npm run package` (`vsce package --no-dependencies`) produces a `.vsix`.
3. That `.vsix` can be installed into a running build of the app via its CLI, e.g.
   `bin/vibeide --install-extension extensions/vibe-ide-placeholder/vibe-ide-placeholder.vsix`.

This confirms the packaging and install-time mechanism works. It does not confirm anything about
distribution.

## What does NOT exist yet

There is **no automatic bundling** of `extensions/` into the packaged installer or app bundle.
Verified by grepping the build pipeline:

```
$ grep -rn "extensions" build.sh prepare_vscode.sh prepare_src.sh get_repo.sh
prepare_vscode.sh:39:setpath_json "product" "extensionsGallery" '{...open-vsx.org...}'
build.sh:22:    rm -f .build/extensions/ms-vscode.js-debug/src/win32-app-container-tokens.*.node
build.sh:57:    rm -f .build/extensions/ms-vscode.js-debug/src/win32-app-container-tokens.*.node
```

None of these reference the root `extensions/` directory — the two `build.sh` hits are cleanup
of a `vscode/.build/extensions/` path inside the *upstream VS Code source tree* (a different
`extensions/`, nothing to do with this one), and the `prepare_vscode.sh` hit is the marketplace
gallery URL, unrelated to bundling local packages. `build.sh`, `prepare_vscode.sh`,
`prepare_src.sh`, and `get_repo.sh` have no awareness that a root `extensions/` directory exists.

## Why this matters

This is a real, tracked gap for whoever builds piece 1 (or any later piece that ships as an
extension). The "make every later piece an add-an-extension problem" premise assumed in the
design spec is not yet true in terms of *shipping* — today it is only true in terms of
*developing and manually installing*. Piece 1's first job, before writing its own extension
logic, is inventing the actual bundling mechanism: deciding whether extensions get pre-installed
into the packaged app (VSCodium's `.build/builtInExtensions.json`-style mechanism is the natural
precedent to look at), pulled in as a build step, or something else — and wiring that into
`build.sh` / `prepare_vscode.sh` so a fresh install already has them, instead of requiring a
manual `--install-extension` step after the fact.
