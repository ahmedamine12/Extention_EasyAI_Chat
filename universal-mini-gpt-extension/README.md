# Universal Mini-GPT Agent Chrome Extension

A floating, always-available GPT-powered chatbot for any webpage. Ask questions, get suggestions, or correct phrases anywhere in your browser.

## Features
- Floating, draggable chat bubble on every page
- Modern, clean chat UI
- Powered by OpenAI GPT (cloud API)
- Context menu: right-click selected text to ask the agent
- Popup for quick access

## Setup
1. **Clone or download this repository.**
2. **Get your OpenAI API key:**
   - Go to https://platform.openai.com/account/api-keys
   - Click "Create new secret key" and copy it
3. **Add your API key:**
   - Open `background.js`
   - Replace `YOUR_OPENAI_API_KEY` with your actual key
4. **Add icons:**
   - Replace the placeholder PNGs in `icons/` with your own 16x16, 32x32, 48x48, and 128x128 icons (optional)

## Load the Extension
1. Go to `chrome://extensions` in your browser.
2. Enable "Developer mode" (top right).
3. Click "Load unpacked" and select the `universal-mini-gpt-extension` folder.

## Usage
- The 💬 chat bubble appears on every page. Click to open the chat UI.
- Type your question and press Enter. The agent will reply using GPT.
- Right-click any selected text and choose "Ask Mini-GPT Agent" to send it to the agent.
- Use the extension popup to open the chat bubble if it's hidden.

## Configuration
- **API Model:** The default is `gpt-3.5-turbo`. You can change this in `background.js`.
- **API Endpoint:** The extension uses OpenAI's API by default. You can adapt it for other LLM APIs if needed.

## Security
- Your API key is stored only in the extension's background script and is never sent to any third party except the LLM API endpoint you configure.

---

**Enjoy your universal, always-available AI assistant!** 