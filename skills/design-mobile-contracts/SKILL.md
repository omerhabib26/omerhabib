---
name: design-mobile-contracts
description: Use for mobile architecture, repository interfaces, state ownership, caching, synchronization, and API contract design.
---

# Define mobile state and API contracts before coding

Inspect UI, state holder, repository, storage, and network boundaries. Locate existing conventions.
1. Define typed inputs, outputs, errors, cancellation behavior, and the source of truth.
2. Specify cache freshness, pending writes, restored state, and retry rules.
3. Define endpoint methods, payloads, status codes, and correlation IDs.
4. For writes, persist the operation key before network I/O; reuse it on retry. Define payload-conflict behavior and server retention.
5. Identify the atomic invariant and whether protection is process-local or durable across instances.
6. Draw a focused Mermaid architecture or sequence diagram; distinguish implemented components from planned extensions.
Return repository contracts, a state-transition table, an API example, the diagram, and trade-offs. Do not add infrastructure without a requirement. Prefer integer minor units for money and explicit currency support.
