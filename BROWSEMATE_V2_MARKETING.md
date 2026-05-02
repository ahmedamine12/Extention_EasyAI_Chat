# BrowseMate V2 — Chrome Web Store copy

Public, **repository-safe** text for the store listing. Short snippets also live in `STORE_LISTING.md`.

For **private reminders** (V2 vs old version, comparison table, optional social drafts), use **`BROWSEMATE_V2_LOCAL_NOTES.md`** — that filename is **gitignored** (create it locally; see `BROWSEMATE_V2_LOCAL_NOTES.example.md`).

---

## Chrome Web Store — full long description (paste-ready)

*Tone matches the old EasyAI Chat listing, updated for **BrowseMate** and **V2** features. Trim sections if you hit a character limit.*

**BrowseMate** brings leading AI models — **OpenAI GPT**, **Google Gemini**, and **Hugging Face** — directly into your browser. With a clean, floating interface and BrowseMate **blue & teal** branding, you get AI help without interrupting your workflow. Your API keys stay on your device; requests go straight to the providers you choose.

### ✨ Key features

**🎯 Smart floating interface**

- Elegant chat bubble on any normal webpage (appears after you add at least one API key).
- Drag and resize the panel; move the bubble where you want it.
- Stays out of the way of browsing when you need focus.
- Smooth hover motion on the launcher.

**🤖 Multiple AI providers**

- **OpenAI** — GPT-4o family, GPT‑4o mini, o1, and more (your API key).
- **Google Gemini** — Flash / Pro models via Google AI (your API key).
- **Hugging Face** — Chat through the **Inference Router** with popular open models; vision/screenshot flows when your token supports **Inference Providers**.
- Switch provider and model from the chat header.

**🎙️ Voice & vision (V2)**

- **Voice input** — Optional microphone dictation and speech language preference (depends on your browser).
- **Screenshots & vision** — Capture the page and send it to vision-capable models when the provider supports it.

**⏰ Reminders (V2)**

- Schedule reminders from the chat UI.
- Notifications when they fire (and in-page notice when a suitable tab is open).

**🎨 Beautiful design**

- Modern layout that works alongside real websites.
- **Light and dark mode** from the toolbar popup.
- Responsive toolbar popup (wider **API Keys** panel aligned with the chat width).

**🔒 Privacy & security first**

- API keys **only on your device** — no BrowseMate cloud holding your secrets.
- No BrowseMate server between you and OpenAI, Google, or Hugging Face for chat.
- Conversations stored **locally** in the extension.
- **Direct** HTTPS calls to the AI providers you configure.

**💬 Smart context**

- **Right-click** selected text for quick actions (explain, summarize, translate, and more).
- Conversation context for follow-up questions.
- Chat history for your session.

**⚙️ Customization**

- Toolbar popup: **API Keys**, floating toggle, dark mode, optional voice settings.
- Keyboard shortcut to **show/hide** the floating UI (default: **Ctrl+Shift+Y** / **⌘⇧Y**, customizable under `chrome://extensions/shortcuts`).

**🚀 First-run help (V2)**

- If you haven’t saved any keys yet, BrowseMate opens the toolbar UI **once** so you know where to paste keys — then the bubble appears as usual.

**✅ Clear errors (V2)**

- Helpful messages for **network issues**, **invalid keys**, **quotas/rate limits**, and Hugging Face auth — each reminds you to check **toolbar → BrowseMate → API Keys**.

### 🚀 How it works

1. **Install & setup** — Click the BrowseMate icon → **API Keys**. Add **OpenAI**, **Gemini**, and/or **Hugging Face** (`hf_…`) keys as needed. For HF router + vision, enable **Inference Providers** on your token where required.
2. **Start chatting** — Open the floating bubble on any supported page.
3. **Ask anything** — Writing, research, code, drafts, and quick explanations without leaving the tab.
4. **Stay productive** — Voice, screenshots, reminders, and shortcuts when you want them.

### 🛡️ Privacy promise

- **Zero** BrowseMate data collection for chat content.
- **No** analytics or tracking from BrowseMate for your prompts.
- Keys and chats stay **local** unless **you** export or sync elsewhere (not provided by BrowseMate).
- **Direct** communication with your chosen AI providers.

### 💡 Perfect for

- **Students** — Research and study help.
- **Writers** — Drafting and editing support.
- **Developers** — Code questions and reviews.
- **Professionals** — Email and document workflows.
- **Anyone** who wants AI beside the page they’re on.

### 🔧 Requirements

- **Chrome 88+** (or another Chromium-based browser: Edge, Brave, Vivaldi, …).
- At least **one** valid API key (**OpenAI** `sk-…`, **Gemini**, and/or **Hugging Face** `hf_…` as you prefer).
- **Internet** connection for AI requests.

**Install BrowseMate** and make AI a natural part of your browsing.

---

*Regenerate `browsemate-v2.0.0.zip` with `npm run package` before each store upload so the live extension matches this messaging.*
