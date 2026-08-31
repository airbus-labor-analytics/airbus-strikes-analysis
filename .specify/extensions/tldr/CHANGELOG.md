# Changelog

All notable changes to the **Spec Kit TLDR extension** are documented here. The
format is based on [Keep a Changelog](https://keepachangelog.com/), and the
project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.0] - 2026-06-14

### Added

- **Spec Kit extension** form of speckit-tldr, so the TLDR works with every
  Spec Kit-supported AI agent (GitHub Copilot, Cursor, Gemini CLI, Windsurf,
  Qwen, opencode, and more) — not only Claude Code.
  - `/speckit.tldr.generate` — generate the review-oriented TLDR (self-contained
    HTML dashboard + PR-native Markdown) for a feature's `spec.md` / `plan.md`.
  - `/speckit.tldr.clean` — remove the generated `*.tldr.html` / `*.tldr.md`
    artifacts before opening a PR.
- `extension.yml` manifest, bundled output templates under `assets/`, and an
  `.extensionignore` so the installed copy excludes the Claude Code plugin files.

Installable with `specify extension add tldr --from <release-archive-url>` (or by
name once it is listed in the Spec Kit community catalog).

The existing Claude Code plugin (`/speckit-tldr:tldr`) continues to work
unchanged and ships from the same repository.
