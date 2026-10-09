---
name: review-mobile-change
description: Use for mobile and backend pull request reviews, lifecycle and concurrency checks, AI-generated code review, and implementation verification.
---

# Review changes for correctness and operational risks

Read the diff and relevant callers, tests, and contracts.
1. Check state ownership, cancellation, lifecycle recreation, threading, duplicate actions, and retry invariants.
2. Check API validation, authentication boundaries, contract compatibility, and storage failure paths.
3. Check that tests assert user-visible behavior and observable invariants rather than merely reproducing implementation.
4. Run the smallest relevant verification commands when available; record failures without editing evidence.
5. Prioritize findings by impact. Cite file and behavior, reproduction, consequence, and a concrete fix.
Return actionable findings first, then verified commands and remaining uncertainty. If no issues are found, say what was reviewed and what remains unverified. Do not approve or merge solely because AI or CI reports success.
