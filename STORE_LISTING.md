# BrowseMate — Chrome Web Store listing copy (V2)

For the **full Chrome Web Store long description** (EasyAI-style narrative), see **`BROWSEMATE_V2_MARKETING.md`**.

For a **private** reminder (comparison vs old version, optional social drafts), create **`BROWSEMATE_V2_LOCAL_NOTES.md`** — it is **gitignored**; see **`BROWSEMATE_V2_LOCAL_NOTES.example.md`**.

Use the sections below for quick store snippets and tables.

## Short description (≤132 characters)

**Option A (129 chars)**  
BrowseMate V2: floating AI chat — OpenAI, Gemini, Hugging Face, voice, screenshots, reminders. Keys stay local.

**Option B**  
AI chat on every page: OpenAI, Gemini & HF, voice input, vision, reminders. Private — keys only on your device.

---

## Detailed description (store “full description”)

**BrowseMate** turns any webpage into your workspace: a floating AI assistant you can drag, resize, and use without leaving the tab.

**Providers**

- **OpenAI** — GPT-4o, GPT-4o mini, o1, and more (your API key).
- **Google Gemini** — Latest Gemini Flash / Pro models (your API key).
- **Hugging Face** — Chat through the Inference Router with open models; optional vision when your token supports Inference Providers.

**Privacy**

- API keys and chats stay **on your device**.
- No BrowseMate server between you and OpenAI, Google, or Hugging Face.

**V2 highlights**

- **Hugging Face** — More models and a free-tier friendly path via HF tokens.
- **Voice input** — Dictate prompts when enabled (uses your browser’s speech recognition).
- **Screenshots & vision** — Send what’s on the page to vision-capable models (provider-dependent).
- **Reminders** — Quick reminders from the chat UI.
- **Dark mode & shortcuts** — Match your workflow; toggle visibility with a keyboard shortcut.

**Perfect for** research, writing, code questions, email drafts, and quick explanations — without opening another tab.

Support & privacy links are on our GitHub Pages site (see extension homepage in the listing).

---

## What’s new in 2.0 (release notes / social)

Shipped **BrowseMate V2**:

| Area | What changed |
|------|----------------|
| **Providers** | Hugging Face router chat + vision path for compatible tokens |
| **Input** | Voice input (optional), screenshot / vision where supported |
| **Productivity** | In-chat reminders with notifications |
| **UX** | BrowseMate blue/teal branding, clearer errors (network, quota, bad key) |
| **First run** | One-time prompt to open API Keys if none are saved |

Compared to **1.x**, V2 is the same privacy model (local keys, direct APIs) with more providers, voice, reminders, and polish — not a new account system and no cloud vault.

---

## Comparison vs earlier README / 1.x positioning

| Before (typical 1.x messaging) | V2 reality |
|-------------------------------|------------|
| “OpenAI & Gemini” only | Also **Hugging Face** router models |
| Keys local | Unchanged — still local |
| Floating UI | Unchanged + **voice**, **reminders**, **shortcut** documented |
| History | Still supported |

---

## Developer

- Package for upload: `npm run package` → `browsemate-v2.0.0.zip`
- Version lives in `manifest.json` and is shown in the popup footer from the manifest at runtime.
