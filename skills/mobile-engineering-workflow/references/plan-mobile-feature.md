---
name: plan-mobile-feature
description: Use for mobile feature briefs, acceptance criteria, offline behavior, scope definition, and implementation planning.
---

# Turn mobile requirements into verifiable delivery plans

Collect the feature brief, current behavior, target platforms, and constraints. Inspect the relevant code before proposing tasks.
1. Define the user outcome and explicit exclusions.
2. Specify loading, empty, success, error, offline, retry, and restored-state behavior.
3. Identify lifecycle recreation, concurrent actions, and duplicate-write risks.
4. Map each acceptance criterion to a unit, UI, or API test; mark untested criteria.
5. Break work into small tasks with dependencies and verification commands.
Return a plan containing assumptions, acceptance criteria, state transitions, API dependencies, test mapping, and release risks. Ask only for unresolved information that changes implementation. Never invent business rules or productivity metrics.
