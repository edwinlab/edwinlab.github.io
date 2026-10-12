# Event measurement specification (provider not configured)

Status **draft only**. No analytics property ID or provider has been confirmed, so this document does not add or send analytics code. Do not copy a Measurement ID from an old blog tag into the homepage.

## Allowed events

| Event | Trigger | Allowed fields |
|---|---|---|
| `page_view` | One page view after page load and the provider's required consent state | `page_path` from the canonical pathname only, with no query or fragment |
| `tool_success` | Once after a valid operation returns a result | `tool_slug`, optional allowlisted `format` or `direction` |
| `tool_copy` | Once after a successful clipboard write | `tool_slug`, optional allowlisted `format` |
| `tool_download` | Once after a generated file download is initiated successfully | `tool_slug`, `file_type` from an enum such as `png` or `txt` |
| `related_tool_click` | A click on a related-tool link | `from_slug`, `to_slug` from the public route allowlist |
| `contact_click` | A click on a contact link | `channel` enum such as `linkedin` or `email`; no address or full URL |

An optional error field must be a fixed application error code, never the visible error message. Emit only the event matching a successful action; do not derive success from button clicks alone.

## Never include in event data

User text, JSON, JWT, SQL, regex, CSV, phone numbers, WhatsApp message, clipboard contents, file names, file bytes, generated output, email address, arbitrary error text, full URLs, query strings, fragments, or referrer URLs. Do not enable automatic form, file, or outbound-link capture without proving that these values cannot be collected. Do not forward the browser's unfiltered `location.href` or `document.referrer`.

## Future insertion points

- Homepage page views and contact clicks: a small optional static analytics module loaded by `index.html` only after a real provider/property and consent behavior are selected.
- Developer tools: shared initialization imported by the 12 tool pages; success/copy/download events emitted from the successful result handlers.
- Everyday tools: shared initialization for the 11 tool pages; event calls emitted from confirmed result/copy/download callbacks. Keep input/output handling local and do not send content.
- Blog: update only after its actual source and analytics destination are found. The live blog reports a Universal Analytics ID; do not remove it until any connected GA4 destination and owner property are checked.

If a provider is configured, test with synthetic text containing an email, phone, JSON/JWT, and filename while inspecting network payloads. Verify those values are absent and that blocked/unavailable analytics does not interrupt tool use. Update the public privacy notice to distinguish local tool processing from the specific aggregate usage statistics actually transmitted. Account verification and real-time event receipt remain owner/live checks.
