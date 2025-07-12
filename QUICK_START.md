# 🚀 Quick Start Guide

## Step 1: Make sure Ollama is running
```bash
# Check if Ollama is running
ps aux | grep ollama

# If not running, start it:
ollama serve
```

## Step 2: Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `universal-mini-gpt-extension` folder
5. The extension should appear in your extensions list

## Step 3: Test the Extension
1. **Option A: Use the test server**
   ```bash
   cd universal-mini-gpt-extension
   python3 -m http.server 8000
   ```
   Then open: http://localhost:8000/test.html

2. **Option B: Test on any website**
   - Go to any website (like google.com, github.com, etc.)
   - You should see a 💬 bubble in the bottom-right corner
   - Click it to open the chat!

## Step 4: Try the Features
- **Chat Bubble**: Click the 💬 to open chat
- **Context Menu**: Select any text, right-click, choose "Ask Mini-GPT Agent"
- **Extension Popup**: Click the extension icon in Chrome toolbar

## Troubleshooting

### "Cannot access chrome:// URL"
- This is normal! The extension can't work on Chrome's internal pages
- Try it on a regular website instead

### "Error contacting API"
- Make sure Ollama is running: `ollama serve`
- Check if the model is downloaded: `ollama list`

### Chat bubble doesn't appear
- Refresh the page
- Check if the extension is enabled in `chrome://extensions/`
- Try the "Open Chat Bubble" button in the extension popup

### Slow responses
- The local model takes time to think
- Try a smaller model: `ollama pull mistral:7b`

## Success! 🎉
You now have a 100% free, private AI assistant that works on any webpage! 