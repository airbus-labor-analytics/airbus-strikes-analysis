# TLDR — `<feature>` <!-- e.g. 042-export-history -->

> _Entry point for review, not a substitute for reading the source. Items link back to `spec.md` / `plan.md`._
> **Scope:** <both|spec|plan> · **Generated:** <date> · **Sources:** `specs/<feature>/spec.md`, `plan.md`

## ⚠️ Read these first
<!-- High-severity flags only: open questions, missing acceptance criteria, spec↔plan mismatch, failed/absent constitution checks. One bullet each, with source location. Omit the section if empty. -->
- **[unanswered]** <question> — `spec.md › Requirements:40`
- **[constitution: fail]** Data at rest encrypted — plan stores files unencrypted — `plan.md:44`

## Flags
<!-- Inline counts; mark PR-changed items with 🔵 elsewhere. -->
`unanswered ×2` · `ambiguous ×1` · `missing-criteria ×1` · `constitution ×1` · `changed-in-pr ×4`

---

## spec.md — what / why
<!-- 2–3 line TLDR of intent, no implementation detail. -->
<one-paragraph intent>

**Requirements**

| ID | Requirement | Acceptance | Flags | Δ |
|----|-------------|------------|-------|---|
| FR-001 | <text> | <criteria or "—"> | | 🔵 |
| FR-002 | <text> | — | `ambiguous` `untestable` `missing-criteria` | |
<!-- Δ = 🔵 when changed in this PR. Put a source ref in a footnote or trailing code span if useful. -->

**Decisions & scope**
- <decision / out-of-scope statement> — `spec.md › Scope:12`

---

## plan.md — how
<!-- 2–3 line TLDR of the approach. -->
<one-paragraph approach>

**Stack:** `PostgreSQL` (records) · `Object storage` 🔵

**Decisions & rationale**
- **<decision>** 🔵
  ↳ _<rationale, or "no rationale stated" if absent → flag>_ — `plan.md › Architecture:30`

**Constitution check**
- ✅ All user inputs validated
- ❌ Data at rest encrypted — files stored unencrypted — `plan.md:44`

**Risks & trade-offs**
- <risk / trade-off> 🔵 — `plan.md › Risks:70`

<!--
Authoring notes (delete before posting):
- Lead with the "Read these first" block; that is the time-saver for a reviewer.
- Mark every PR-changed item with 🔵 so the reviewer can scan the delta.
- Keep prose minimal; the reviewer reads the full text in the diff. This maps it.
-->
