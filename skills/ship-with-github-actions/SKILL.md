---
name: ship-with-github-actions
description: Use for Conventional Commits, feature branches, pull request creation, GitHub Actions, CI/CD checks, artifacts, and release preparation.
---

# Deliver reviewed changes through GitHub CI workflows

Inspect git status, branch, remote, repository instructions, and existing workflows. Preserve unrelated changes.
1. Create an isolated feature branch; write scoped Conventional Commits such as feat(claims): preserve pending submissions.
2. Validate commit subjects and run lint, unit/API tests, and UI tests appropriate to the change.
3. Draft a PR using the repository template. Explain the problem, final behavior, decisions, AI contribution, and verification evidence; include screenshots for visible UI changes.
4. Inspect GitHub Actions results, logs, and artifacts. Distinguish configured checks from executed checks.
5. Fix actionable failures and rerun only affected checks.
6. Prepare a versioned source artifact and documented recovery steps. Publish or merge only within the user's authorized scope; never invent successful deployment.
Return the PR link, commit references, check results, artifacts, and release limitations. Avoid production credentials in examples; use minimal workflow permissions. Read references/delivery.md for commands and demo limitations.
