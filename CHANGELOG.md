# Changelog

## 2.0.0 — 2026-05-01

BrowseMate **V2** — branding, providers, and polishing.

### Added

- **Hugging Face** — Text chat via the Inference Router (multiple models); vision/screenshots supported with router VL models when your token has Inference Providers.
- **Voice input** — Optional microphone dictation with configurable speech language (browser-dependent).
- **Reminders** — Schedule reminders from the chat panel; delivered via notifications with optional in-page card when a tab is available.
- **Keyboard shortcut** — Toggle floating UI (`Ctrl+Shift+Y` / `Command+Shift+Y`, configurable in `chrome://extensions/shortcuts`).
- **First-run onboarding** — If no API keys are saved, the extension opens the toolbar UI once so new users can add keys (floating chat stays hidden until at least one key exists).

### Improved

- **BrowseMate branding** — Logo-aligned blue + teal accents; toolbar popup title matches **Browse** + **Mate**.
- **Error messages** — Clearer guidance for network failures, invalid keys, quotas/rate limits, and HF auth; each reminds users where to fix keys (toolbar → BrowseMate → API Keys).
- **Publishing metadata** — Version aligned across manifest, package script, and popup; see `STORE_LISTING.md` for Chrome Web Store copy.

### Notes

- Documentation URLs on GitHub Pages may still use the legacy folder name `Extention_EasyAI_Chat`; the product name is **BrowseMate**. Redirect those URLs on Pages when convenient.

---

## 1.0.0

Initial public release (floating chat, OpenAI & Gemini, history, context menu actions, dark mode).
