---
name: gsd-extract-learnings
description: Extract decisions, lessons, patterns, and surprises from completed phase artifacts
argument-hint: <phase-number>
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Agent
type: prompt
requires: [phase]
---
<objective>
Extract structured learnings from completed phase artifacts (PLAN.md, SUMMARY.md, VERIFICATION.md, UAT.md, STATE.md) into a LEARNINGS.md file that captures decisions, lessons learned, patterns discovered, and surprises encountered.
</objective>

<execution_context>
@C:/Users/d4nd3r/Desktop/Kavento_Mexico/.claude/gsd-core/workflows/extract-learnings.md
</execution_context>

Execute the extract-learnings workflow from @C:/Users/d4nd3r/Desktop/Kavento_Mexico/.claude/gsd-core/workflows/extract-learnings.md end-to-end.
