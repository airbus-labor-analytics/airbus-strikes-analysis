# speckit-tldr

Turn [GitHub Spec Kit](https://github.com/github/spec-kit) `spec.md` and `plan.md`
files into review-oriented **TLDRs** — a self-contained HTML dashboard plus a
PR-native Markdown version — so a reviewer can get oriented and spot the risky
parts before reading the full document.

It is built for the **PR reviewer**: it regenerates from the canonical files,
surfaces ambiguities / open questions / spec↔plan mismatches at the top, and
marks what changed in the PR. The TLDR is an *entry point* into the document, not
a replacement for reading it — every item links back to its source location.

## Two ways to use it

| | Works with | Install with |
| --- | --- | --- |
| **Spec Kit extension** | **any** Spec Kit-supported agent (GitHub Copilot, Cursor, Gemini CLI, Windsurf, Qwen, opencode, Claude Code, …) | `specify extension add` |
| **Claude Code plugin** | Claude Code | `/plugin install` |

The two forms share one repository and the same review logic; pick whichever fits
your setup. The extension exists so people who don't use Claude Code can benefit
too.

## What it does

- **`spec.md`** → intent, requirements (with acceptance criteria), decisions,
  and open questions, flagged for ambiguity / untestability / missing criteria.
- **`plan.md`** → stack, design decisions *paired with rationale*, Constitution
  Check results, structure, and risks, flagged for mismatch / constitution
  violations / unexplained decisions.
- **Diff-aware**: items touched by the current PR are marked, with a "show only
  changed" filter in the HTML.
- **Cleanup**: a companion command/skill removes the generated TLDRs again so
  these local review artifacts never get committed into the PR.

---

## Use as a Spec Kit extension (any agent)

Requires the [Spec Kit](https://github.com/github/spec-kit) `specify` CLI and a
project containing a feature under `specs/<feature>/`.

### Install

```shell
# Direct from a release archive (works today)
specify extension add tldr --from https://github.com/qurore/speckit-tldr/archive/refs/tags/v0.3.0.zip

# Or, once it is listed in the Spec Kit community catalog:
specify extension search tldr
specify extension add tldr
```

`specify extension add` registers the commands for whichever AI agent(s) your
project is set up with, so the TLDR commands appear natively in each one.

### Commands

```shell
/speckit.tldr.generate            # both spec.md and plan.md for the current feature
/speckit.tldr.generate plan       # plan only
/speckit.tldr.generate spec       # spec only
/speckit.tldr.generate specs/042-export/plan.md   # a specific file

/speckit.tldr.clean               # remove the generated TLDRs before a PR
/speckit.tldr.clean all           # every *.tldr.* under specs/ in the repo
```

Output is written to `specs/<feature>/tldr/` as `*.tldr.html` and `*.tldr.md`.

> The `--from` URL points at a tagged release archive — publish the `v0.3.0`
> release (or adjust the tag) for it to resolve.

---

## Use as a Claude Code plugin

Run these in Claude Code.

### From the Claude community marketplace

```shell
/plugin marketplace add anthropics/claude-plugins-community
/plugin install speckit-tldr@claude-community
```

> The community-marketplace entry becomes installable once the submission is
> approved and synced; until then, use the direct method below.

### Directly from this repo

```shell
/plugin marketplace add qurore/speckit-tldr
/plugin install speckit-tldr@speckit-tldr
```

### Commands

```shell
/speckit-tldr:tldr            # both spec.md and plan.md for the current feature
/speckit-tldr:tldr plan       # plan only
/speckit-tldr:tldr spec       # spec only
/speckit-tldr:tldr specs/042-export/plan.md   # a specific file

/speckit-tldr:tldr-delete         # remove the current feature's TLDRs
/speckit-tldr:tldr-delete all     # every *.tldr.* under specs/ in the repo
```

It also triggers from natural language ("tldr the auth feature spec",
"summarize this plan.md for review").

---

## Clean up before a PR

The TLDRs are a local reviewing aid, not something the PR should carry. The clean
command (`/speckit.tldr.clean`) / delete skill (`/speckit-tldr:tldr-delete`)
lists exactly what it will remove and asks before deleting, removes already
committed files with `git rm` (so the deletion lands in the PR), can offer to add
the patterns to `.gitignore`, and only ever touches `*.tldr.html` / `*.tldr.md` —
never `spec.md` / `plan.md`.

## Repo layout

```
speckit-tldr/
├── extension.yml                          # Spec Kit extension manifest
├── commands/                              # agent-agnostic Spec Kit commands
│   ├── speckit.tldr.generate.md           #   generate the TLDR
│   └── speckit.tldr.clean.md              #   remove generated TLDRs
├── assets/                                # output templates (bundled with the extension)
│   ├── tldr.template.html
│   └── tldr.template.md
├── .extensionignore                       # keeps plugin/dev files out of the installed extension
├── CHANGELOG.md
│
├── .claude-plugin/marketplace.json        # Claude Code marketplace catalog
├── plugins/speckit-tldr/                   # Claude Code plugin
│   ├── .claude-plugin/plugin.json
│   └── skills/
│       ├── tldr/                          # generate the TLDR
│       │   ├── SKILL.md
│       │   ├── references/                # spec/plan extraction profiles + flag taxonomy
│       │   └── assets/                    # output templates
│       └── tldr-delete/                   # remove generated TLDRs before a PR
│
├── LICENSE
└── README.md
```

The extension inlines its extraction profiles and flag taxonomy into
`commands/speckit.tldr.generate.md` (so the command is self-contained across
agents); the Claude Code plugin keeps them as separate `references/` files loaded
on demand. Both render through the same `tldr.template.html` / `tldr.template.md`.

## Development

### Spec Kit extension

```shell
# From a local clone, into a test project that has run `specify init`:
specify extension add --dev /path/to/speckit-tldr
specify extension list                 # should show: Spec Kit TLDR (v0.3.0)
ls .specify/extensions/tldr/           # installed copy (assets/, commands/, …)
# then, in your agent:
/speckit.tldr.generate
```

### Claude Code plugin

```shell
claude plugin validate .                      # validate marketplace.json
claude plugin validate ./plugins/speckit-tldr # validate plugin.json + skill frontmatter
/plugin marketplace add .
/plugin install speckit-tldr@speckit-tldr
```

> Versions: `extension.yml` and `plugins/speckit-tldr/.claude-plugin/plugin.json`
> are kept in lockstep (`0.3.0`). Bump both on each release and tag the repo
> `vX.Y.Z` so the extension's `--from` archive URL resolves.

## License

MIT — see [LICENSE](./LICENSE).
