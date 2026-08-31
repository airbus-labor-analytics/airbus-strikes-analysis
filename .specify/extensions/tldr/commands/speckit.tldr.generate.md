---
description: "Generate a review-oriented TLDR of a feature's spec.md / plan.md — a self-contained HTML dashboard plus PR-native Markdown — that floats ambiguities, open questions, and spec↔plan mismatches to the top so a reviewer gets oriented fast. An entry point into the document, not a replacement for reading it."
---

# Spec Kit TLDR — generate

Produce a fast, review-oriented overview of a feature's Spec Kit `spec.md` / `plan.md`.
The goal is to cut the time a PR **reviewer** spends getting oriented, while
deliberately surfacing the spots that deserve close reading rather than hiding
them. A TLDR here is an *entry point* into the document, not a substitute for it.

This command writes two local review artifacts and never modifies `spec.md` /
`plan.md` or any other source file. Remove the artifacts before opening the PR
with `__SPECKIT_COMMAND_TLDR_CLEAN__`.

## User Input

```text
$ARGUMENTS
```

The argument selects scope: `spec`, `plan`, `both` (default), or a path to a
specific `.md` file. Natural language in the user's message also counts ("just
the plan", "tldr the auth feature spec"). Consider it before proceeding.

## Where this extension's files live

This extension is installed under `.specify/extensions/tldr/` (see the
`<!-- Config: ... -->` comment at the top of this file). Its output templates are:

- `.specify/extensions/tldr/assets/tldr.template.html` — the HTML dashboard template
- `.specify/extensions/tldr/assets/tldr.template.md` — the Markdown template

Read these from that location at render time (Step 4).

## Core principles (read first)

1. **Regenerate from the canonical source.** Always extract from the actual files
   in the repo / PR. Never trust a pre-existing summary an author may have written;
   a summary's omissions become the reviewer's blind spots.
2. **Surface risk, don't smooth it over.** Ambiguities, missing acceptance
   criteria, and unanswered questions go to the *top*, not buried. The summary's
   job is to point at what to scrutinize.
3. **Point back into the document.** Every extracted item records its source file
   and (when available) heading/line, so the reviewer can jump to the full text.
4. **Be diff-aware.** Reviewers review the *change*, not the whole document. Mark
   what this PR added/changed and let the reviewer filter to just that.

## Step 1 — Resolve scope and target files

Parse the invocation argument and also honor natural language. Resolution order:

- A path argument (e.g. `specs/042-foo/plan.md`) → operate on exactly that file;
  detect spec vs plan from the filename.
- `spec` / `plan` → restrict to that artifact type. `both` (or no argument) →
  process both `spec.md` and `plan.md` for the target feature.
- Natural language overrides/refines the argument.

To find the feature directory when no path is given:

- If the user names a feature, find the matching `specs/*<feature>*/` directory.
- Otherwise infer from the current PR/branch: the changed `specs/<feature>/*.md`
  files (see Step 2). If still ambiguous, list the candidates under `specs/` and
  ask which feature.

Spec Kit convention: each feature lives in `specs/<NNN-feature-name>/` with
`spec.md`, `plan.md`, and often `research.md`, `data-model.md`, `contracts/`,
`tasks.md`. Only `spec.md` and `plan.md` are in scope for this command.

## Step 2 — Determine the diff (PR-review mode)

This command defaults to reviewer mode. Establish what changed so items can be
marked `changedInPR`:

```bash
# Base for comparison: the merge-base with the default branch (adjust if needed).
git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main
# Per-file changed line ranges:
git diff --unified=0 <base>...HEAD -- specs/<feature>/spec.md
git diff --unified=0 <base>...HEAD -- specs/<feature>/plan.md
```

Map changed line ranges back to the headings/items you extract so each item gets
`changedInPR: true|false`. If this is not a PR (no meaningful diff, or the user
asked for a plain overview), set every item's `changedInPR` to `false` and skip
the change-filter affordance — the rest of the flow is unchanged.

## Step 3 — Extract

Read the file(s), then extract into the **DATA schema** (described under Step 4).
The *what to extract* and the *flag taxonomy* differ by artifact type. Do not
invent content that is not in the source; if a required section is absent, that
absence is itself a flag (e.g. a requirement with no acceptance criteria).

### Shared flag taxonomy

Each extracted item may carry zero or more flags. Keep the meanings consistent;
the HTML template colors them and counts them in the summary bar.

| flag | meaning |
| --- | --- |
| `ambiguous` | wording allows multiple readings; not precise enough to implement |
| `untestable` | no measurable / verifiable acceptance criterion |
| `missing-criteria` | a requirement with no acceptance criteria at all |
| `unanswered` | an open question / `[NEEDS CLARIFICATION]` marker |
| `mismatch` | spec↔plan disagreement (plan does something the spec doesn't ask for, or vice versa) |
| `uncovered` | (when `tasks.md` is present) a requirement with no covering task |
| `constitution` | conflicts with a rule in `constitution.md` / Constitution Check |
| `dependency-gap` | depends on something undefined / not yet decided |
| `changed-in-pr` | added or modified by the PR under review |

`unanswered`, `missing-criteria`, `mismatch`, and `constitution` are high-severity
and must appear at the top of the output regardless of where they occur in the
source.

### Extracting from `spec.md` (the What / Why)

`spec.md` is the technology-agnostic **What / Why**. Errors here propagate to plan,
tasks, and code, so this is the highest-leverage thing to review. Populate the
`spec` object:

- `tldr` — 2–3 lines: what is being built and why. From the intent / user-scenario
  / overview section. No implementation detail.
- `requirements[]` — one entry per functional/non-functional requirement:
  - `id` — the spec's own ID if present (e.g. `FR-001`), else assign `R1, R2, …`.
  - `text` — the requirement, lightly condensed (do not lose conditions/quantifiers).
  - `acceptance` — its acceptance criteria, or `null` if none stated.
  - `source` — `{ file, heading, lines }` so the reviewer can jump to it.
  - `changedInPR` — from the diff (Step 2).
  - `flags[]` — see taxonomy.
- `decisions[]` — explicit product/scope decisions and constraints
  (`{ text, source, changedInPR }`). Include out-of-scope statements.
- `openQuestions[]` — every `[NEEDS CLARIFICATION]`, TODO, "TBD", or open question
  (`{ text, severity: "high"|"med", source, changedInPR }`). These render first.
- `actors[]` (optional) — user roles / personas the spec names.

Flags to raise on `spec.md`: `ambiguous` (vague quantifiers like "fast", "many",
"appropriate", "etc."; undefined terms; requirements that admit multiple
implementations), `untestable` (satisfaction can't be objectively checked),
`missing-criteria` (`acceptance == null`), `unanswered` (any open question /
`[NEEDS CLARIFICATION]`), `dependency-gap` (references a concept the spec never
defines), `changed-in-pr`.

Heuristics: a requirement that mixes *what* with *how* (names a library, schema,
endpoint) is a smell — note it; it usually belongs in `plan.md`. Numbers without
units, thresholds without comparison operators, and lists ending in "etc." are
classic ambiguity sources. Every actor introduced should have at least one
requirement; orphan actors and orphan requirements are both worth flagging.

### Extracting from `plan.md` (the How)

`plan.md` is the **How**: the technical decisions the spec deliberately omits
(architecture, stack, data model, contracts, testing). For a reviewer this is
where maintainability and security risk gets baked in, so review it on its own
axis — not just "does it match the spec", but "are these good decisions".
Populate the `plan` object:

- `tldr` — 2–3 lines: the chosen approach at a glance.
- `stack[]` — concrete technology choices (`{ name, role, changedInPR }`):
  language, framework, datastore, key libraries, infra.
- `decisions[]` — the load-bearing design decisions **paired with rationale**
  (`{ decision, rationale, source, changedInPR, flags[] }`). If a decision has no
  stated rationale, set `rationale: null` and flag it `ambiguous`.
- `constitutionCheck[]` — each item from the plan's "Constitution Check" section
  (`{ rule, status: "pass"|"fail"|"unknown", note, source }`). If the plan has no
  Constitution Check section, emit a single synthetic item with `status: "unknown"`
  and flag `constitution`.
- `structure[]` — the proposed module / directory / contract layout (short).
- `risks[]` — stated risks, trade-offs, and "alternatives considered"
  (`{ text, source, changedInPR }`).
- `phases[]` (optional) — if the plan defines implementation phases.

Flags to raise on `plan.md`: `mismatch` (the plan implements something the spec
does not require, or omits something the spec requires — requires the spec in
context; when scope is `both`, cross-check; when plan-only, note that the
cross-check was not performed), `constitution` (a decision that conflicts with a
`constitution.md` rule, or a failed/absent Constitution Check), `dependency-gap`,
`ambiguous` (including any decision with `rationale == null`), `changed-in-pr`.

Heuristics: prefer to show *decision + rationale + alternative-rejected* together;
a reviewer approves fast when the "why" is visible and is slowed most by silent
choices. New external dependencies, new data stores, and new network boundaries
are high-attention items — surface them even if the prose is brief. If the plan
introduces tech the constitution forbids (e.g. an ORM when the constitution says
raw SQL), that is a high-severity `constitution` flag.

## Step 4 — Render outputs

Produce **both** formats (unless the user asked for only one).

### The DATA schema

The single JSON object the HTML template renders has this shape (this is the
sample that ships inside the template — mirror its keys and nesting exactly):

```json
{
  "feature": "<NNN — short title>",
  "scope": "both | spec | plan",
  "generatedAt": "<YYYY-MM-DD>",
  "sourceFiles": ["specs/<feature>/spec.md", "specs/<feature>/plan.md"],
  "spec": {
    "tldr": "…",
    "openQuestions": [{ "text": "…", "severity": "high|med", "source": { "file": "spec.md", "heading": "…", "lines": "40-41" }, "changedInPR": false }],
    "requirements": [{ "id": "FR-001", "text": "…", "acceptance": "… or null", "flags": ["ambiguous"], "changedInPR": false, "source": { "file": "spec.md", "heading": "…", "lines": "22-25" } }],
    "decisions": [{ "text": "…", "changedInPR": false, "source": { "file": "spec.md", "heading": "Scope", "lines": "12-13" } }],
    "actors": ["…"]
  },
  "plan": {
    "tldr": "…",
    "stack": [{ "name": "…", "role": "…", "changedInPR": false }],
    "decisions": [{ "decision": "…", "rationale": "… or null", "flags": ["constitution"], "changedInPR": false, "source": { "file": "plan.md", "heading": "…", "lines": "30-36" } }],
    "constitutionCheck": [{ "rule": "…", "status": "pass|fail|unknown", "note": "…", "source": { "file": "plan.md", "lines": "60" } }],
    "structure": ["…"],
    "risks": [{ "text": "…", "changedInPR": false, "source": { "file": "plan.md", "heading": "Risks", "lines": "70-72" } }]
  }
}
```

Include only the section(s) in scope (`spec`, `plan`, or both). The template
renders whichever of `spec` / `plan` is present.

### HTML

1. Read `.specify/extensions/tldr/assets/tldr.template.html`.
2. Replace **only** the block between `/* === DATA PLACEHOLDER START === */` and
   `/* === DATA PLACEHOLDER END === */` with your populated `DATA` object. Leave
   the rest of the file (styles + render script) byte-for-byte unchanged.
3. Write the result to the output path (below). The template is self-contained
   (no network/build needed) and handles all rendering, the flag-summary bar, and
   the "show only changed in this PR" filter.

### Markdown

Follow `.specify/extensions/tldr/assets/tldr.template.md`. This version renders
inline in a GitHub PR comment or file view (GitHub strips styled HTML, so Markdown
is the PR-native surface). Keep it scannable; lead with open questions / flags.

### Output location and naming

Write to a `tldr/` directory next to the source (create it if missing), or to the
path the user specifies:

```
specs/<feature>/tldr/spec.tldr.html
specs/<feature>/tldr/spec.tldr.md
specs/<feature>/tldr/plan.tldr.html
specs/<feature>/tldr/plan.tldr.md
```

When scope is `both`, you may also emit a combined `feature.tldr.html` that
includes both a `spec` and a `plan` section. After writing, tell the user the file
paths and give a one-line summary of the most important flags found, then remind
them they can remove the artifacts before pushing with
`__SPECKIT_COMMAND_TLDR_CLEAN__`.

## What NOT to do

- Do not paraphrase so heavily that the reviewer could pass review on the TLDR
  alone. Extract structure and flags; link back to the source for the prose.
- Do not drop edge cases, constraints, or caveats just because they are verbose —
  those are exactly where review risk lives.
- Do not summarize files other than `spec.md` / `plan.md`.
- Do not modify `spec.md`, `plan.md`, or any source file; this command only writes
  under `specs/<feature>/tldr/`.
