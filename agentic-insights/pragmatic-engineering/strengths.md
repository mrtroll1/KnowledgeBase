# Pragmatic Engineering — Strengths

**Source:** Republic/Agent
**Tags:** pragmatism, tooling, google-workspace, automation

Makes highly pragmatic technology choices, consistently picking the simplest tool that actually fits the use case:

- **Google Sheets as database** — no need for a real DB when the data is small and editors need access
- **Google Docs as a template engine** for PDF generation — copy template, replace placeholders, export PDF
- **Gemini for parsing** free-form contractor data into structured fields
- **Telegram as the primary UI**

Each choice serves the actual use case without over-engineering. The bank statement parser uses hardcoded `SERVICE_MAP` and `_KNOWN_PEOPLE` mappings — perfectly appropriate for a deterministic system processing a finite set of recurring vendors and staff.
