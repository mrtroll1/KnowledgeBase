# Architecture — Weaknesses

**Source:** Republic Agent
**Tags:** telegram-bot, python, design-patterns

Tendency to add features prematurely before the core loop is proven. The /signed and /upload commands were essentially stubs — /signed just printed a message with no actual state tracking, and /upload required a reply-to-PDF workflow that was awkward in Telegram. The mock PDF mode was a testing crutch (hand-crafted PDF bytes!) that should have been a proper test fixture or just skipped entirely. Pattern: build the happy path end-to-end first, then add admin tooling once the flow is actually being used.

Also, the backend/__init__.py facade has a code smell — `generate_invoice()` was doing lazy imports and checking `USE_MOCK_PDF` inline, mixing configuration with wiring. The facade should be a thin pass-through, not a place for conditional logic.
