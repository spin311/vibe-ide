# Windows build status

**Configuration:** the branding changes (Task 2) and extensions workspace (Task 5)
are platform-agnostic — nothing in this repo's changes so far is conditioned on
`OS_NAME`. In principle, `source scripts/set-branding-env.sh && ./build.sh` with
`OS_NAME=windows` on a Windows machine or CI runner should produce a Windows build
using the same `scripts/set-branding-env.sh` and `prepare_vscode.sh` changes already
committed.

**Residual VSCodium identity, not yet branded:** the branding pass (Task 2) covers
`nameShort`/`nameLong`/`applicationName`/`darwinBundleIdentifier`/binary name, but
several Windows-specific identity fields in `prepare_vscode.sh`'s non-insider branch
are still byte-identical to real VSCodium: `win32DirName`, `win32NameVersion`,
`win32RegValueName`, and `win32ShellNameShort` are all still the literal string
`"VSCodium"`; `win32AppUserModelId` is still `"VSCodium.VSCodium"`; and all six
`win32AppId` / `win32x64AppId` / `win32arm64AppId` / `win32UserAppId` /
`win32x64UserAppId` / `win32arm64UserAppId` installer GUIDs are unchanged from
VSCodium's own values. Practically, this means a Windows installer built from this
tree as-is would present itself as, and could collide with or install over, a real
VSCodium install on the same machine. This is a known, tracked prerequisite for a
real Windows build — not a blocker for this piece, which never claimed to produce a
verified Windows build, only a configured one.

**Verified:** nothing. This plan's execution environment is macOS; Windows builds
were not run or tested. This is a tracked gap, not a silent one — do not treat
Windows as working until someone actually runs and checks a build on Windows, and
do not treat it as correctly branded until the identity fields above are updated too.

**Next step:** run `./build.sh` on a Windows machine or a Windows GitHub Actions
runner, using the same branding env vars, and update this doc with the real
result (pass/fail, and what broke if it failed).
