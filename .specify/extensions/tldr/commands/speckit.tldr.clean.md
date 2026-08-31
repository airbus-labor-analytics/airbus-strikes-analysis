---
description: "Remove the generated TLDR review artifacts (*.tldr.html / *.tldr.md and their specs/<feature>/tldr/ directories) so they are not committed into a pull request. Only ever deletes generated TLDR output — never spec.md, plan.md, or any source file."
---

# Spec Kit TLDR — clean

The companion to `__SPECKIT_COMMAND_TLDR_GENERATE__`. It cleans up the review
artifacts that the generate command writes (`*.tldr.html` / `*.tldr.md`, under
`specs/<feature>/tldr/`) so they do not get committed in a pull request. The
TLDRs are a *local reviewing aid*, not something the PR itself should carry.

## User Input

```text
$ARGUMENTS
```

The argument selects scope: `spec`, `plan`, `both` (default), `all`, or a path.
Natural language in the user's message also counts ("clean up the tldrs",
"remove the plan tldr"). Consider it before proceeding.

## Core safety rules (read first)

1. **Only ever delete generated TLDR artifacts.** In scope: files matching
   `*.tldr.html` and `*.tldr.md`, plus a `tldr/` directory once it is empty.
   NEVER delete `spec.md`, `plan.md`, `research.md`, `tasks.md`, `contracts/`, or
   anything else — those are the source, not the output.
2. **Discover → list → confirm → delete.** Always show the exact list of paths you
   are about to remove and get the user's confirmation first, unless the user
   already gave an explicit go-ahead ("yes, delete them", "force", "no prompt").
3. **Never delete with a wildcard.** Expand the glob to explicit paths first, show
   those paths, then remove exactly those. Do not pass `*` to `rm`, and never
   `rm -rf` a feature directory.
4. **Respect git.** A file that is already committed must be removed with `git rm`
   (so the deletion is staged and actually leaves the PR); a file that is
   untracked is simply removed from disk.

## Step 1 — Resolve scope

Parse the argument and also honor natural language:

- `spec` → only `spec.tldr.html` / `spec.tldr.md`.
- `plan` → only `plan.tldr.html` / `plan.tldr.md`.
- `both` or no argument → both the spec and plan TLDRs for the target feature.
- `all` → every `*.tldr.html` / `*.tldr.md` under `specs/` across the repo.
- A path (a file, or a `specs/<feature>/` dir) → operate on exactly that.

Find the target feature directory the same way the generate command does: if the
user names a feature, find the matching `specs/*<feature>*/` directory; otherwise
infer from the current PR/branch (the changed `specs/<feature>/` files); if still
ambiguous, list the candidates under `specs/` and ask. For `all`, skip feature
resolution and search the whole repo.

## Step 2 — Discover the artifacts

Glob for the in-scope outputs, for example:

```
specs/<feature>/tldr/*.tldr.html
specs/<feature>/tldr/*.tldr.md
# for `all`:
specs/**/*.tldr.html
specs/**/*.tldr.md
```

Also catch a combined `feature.tldr.html` if present. Then classify each found
path as **tracked** or **untracked**:

```bash
git ls-files --error-unmatch <path>   # tracked if this succeeds
git status --short <path>
```

If nothing is found, say so and stop — there is nothing to clean up.

## Step 3 — Show the plan and confirm

Present a clear list before deleting anything, e.g.:

| path | state | action |
| --- | --- | --- |
| specs/042-export/tldr/plan.tldr.html | untracked | delete from disk |
| specs/042-export/tldr/plan.tldr.md   | committed | `git rm` (stages deletion) |

State explicitly that source files are left untouched. Ask for confirmation
unless the user already authorized the deletion.

## Step 4 — Delete

Operate only on the explicit, confirmed paths:

- **Untracked** files: `rm -f <path> [<path> ...]`.
- **Tracked** files: `git rm <path> [<path> ...]` (removes the working copy and
  stages the deletion so it becomes part of the PR diff).
- After the files are gone, remove the containing `tldr/` directory **only if it
  is now empty**: `rmdir specs/<feature>/tldr`. `rmdir` refuses a non-empty
  directory — rely on that safety; never force it.

## Step 5 — Offer to prevent recurrence (optional)

Offer to add the artifact patterns to the repo's `.gitignore` so future TLDRs are
never staged in the first place — only if the user wants it and the lines are not
already present:

```
*.tldr.html
*.tldr.md
```

Read the existing `.gitignore` first and append only what is missing; do not
duplicate lines or reorder the file.

## Step 6 — Report

Tell the user exactly what was deleted and what was `git rm`-ed. If you staged any
tracked deletions, remind them the removal still needs to be committed (e.g.
`git commit`) for it to leave the PR. If you edited `.gitignore`, mention that.

## What NOT to do

- Do not delete `spec.md`, `plan.md`, or any non-`*.tldr.*` file.
- Do not `rm -rf` a feature directory, and do not pass wildcards to `rm`.
- Do not remove a `tldr/` directory that still contains non-artifact files.
- Do not skip the confirmation step unless the user clearly opted out of it.
