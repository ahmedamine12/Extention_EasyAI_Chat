// IMPORTANT: Add your Gemini API key below before using the extension.
// Get your key at https://aistudio.google.com/app/apikey

// Using local Ollama API - 100% FREE!
// Make sure Ollama is running: ollama serve
// And you have a model: ollama pull llama2:7b

// Map to store AbortController per tab
const abortControllers = {};

// Provider API functions (inlined)
async function askOpenAI({ apiKey, model, prompt, tabId }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256
      }),
      signal: controller.signal
    });
    if (tabId) delete abortControllers[tabId];
    const data = await res.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return { ok: true, answer: data.choices[0].message.content };
    } else {
      return { ok: false, answer: data.error?.message || 'No answer from OpenAI.' };
    }
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      return { ok: false, answer: 'Request stopped by user.' };
    }
    return { ok: false, answer: e.message || 'Network error.' };
  }
}

async function askGemini({ apiKey, model, prompt, tabId }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });
    if (tabId) delete abortControllers[tabId];
    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return { ok: true, answer: data.candidates[0].content.parts[0].text };
    } else {
      return { ok: false, answer: data.error?.message || 'No answer from Gemini.' };
    }
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      return { ok: false, answer: 'Request stopped by user.' };
    }
    return { ok: false, answer: e.message || 'Network error.' };
  }
}

const MINI_GPT_ACTIONS = [
  { id: 'explain', label: 'Explain', prefix: 'Please explain the following text in a clear and concise way. Provide only the explanation, without extra details, lists, or commentary: ' },
  { id: 'correct', label: 'Correct', prefix: 'Please correct and format this text. Provide only the corrected version without explanations or analysis: ' },
  { id: 'summarize', label: 'Summarize', prefix: 'Please summarize the following text in a brief and direct way. Provide only the summary, without extra details, lists, or commentary: ' }
];

chrome.runtime.onInstalled.addListener(() => {
  // Remove old context menus first
  chrome.contextMenus.removeAll(() => {
    // Add new context menu items for each action
    MINI_GPT_ACTIONS.forEach(action => {
      chrome.contextMenus.create({
        id: `mini-gpt-${action.id}`,
        title: action.label,
        contexts: ['selection']
      });
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = MINI_GPT_ACTIONS.find(a => info.menuItemId === `mini-gpt-${a.id}`);
  if (action && info.selectionText) {
    const question = action.prefix + info.selectionText;
    // Fetch provider and API keys from storage
    chrome.storage.local.get(['provider', 'apiKey_openai', 'apiKey_gemini'], (data) => {
      // Determine provider: use last-used, or fallback to one with a key
      let provider = data.provider;
      if (!provider || !data[`apiKey_${provider}`]) {
        if (data.apiKey_openai) provider = 'openai';
        else if (data.apiKey_gemini) provider = 'gemini';
        else provider = 'openai'; // fallback
      }
      const apiKey = data[`apiKey_${provider}`] || '';
      const model = provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-2.0-flash';
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (q, provider, model, apiKey) => {
          // Open chat bubble and add user message + Thinking...
          const bubble = document.getElementById('mini-gpt-bubble');
          const chat = document.getElementById('mini-gpt-chat-container');
          if (bubble && chat) {
            chat.style.display = 'flex';
            // Set provider selector if present
            const providerSelect = chat.querySelector('#mini-gpt-provider');
            if (providerSelect) providerSelect.value = provider;
            // Add user message
            const messagesDiv = chat.querySelector('#mini-gpt-messages');
            if (messagesDiv) {
              const userMsg = document.createElement('div');
              userMsg.className = 'mini-gpt-msg-user';
              userMsg.textContent = q;
              userMsg.style.margin = '8px 0';
              userMsg.style.maxWidth = '80%';
              userMsg.style.padding = '8px 12px';
              userMsg.style.borderRadius = '12px';
              userMsg.style.display = 'inline-block';
              userMsg.style.wordBreak = 'break-word';
              userMsg.style.fontSize = '15px';
              userMsg.style.background = '#e8f0fe';
              userMsg.style.color = '#2563eb';
              userMsg.style.alignSelf = 'flex-end';
              userMsg.style.textAlign = 'right';
              messagesDiv.appendChild(userMsg);
              // Add loader if not already present
              const last = messagesDiv.lastChild;
              if (!last || !last.querySelector || !last.querySelector('.mini-gpt-loader')) {
                const loader = document.createElement('div');
                loader.className = 'mini-gpt-msg-bot';
                loader.setAttribute('aria-label', 'Mini-GPT is thinking');
                loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
                loader.style.margin = '8px 0';
                loader.style.maxWidth = '80%';
                loader.style.padding = '8px 12px';
                loader.style.borderRadius = '12px';
                loader.style.display = 'inline-block';
                loader.style.wordBreak = 'break-word';
                loader.style.fontSize = '15px';
                loader.style.background = '#f5f5f7';
                loader.style.color = '#222';
                loader.style.alignSelf = 'flex-start';
                loader.style.textAlign = 'left';
                messagesDiv.appendChild(loader);
              }
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
          }
          // Send provider/model/apiKey with the message
          window.postMessage({ type: 'MINI_GPT_ASK', question: q, provider, model, apiKey }, '*');
        },
        args: [question, provider, model, apiKey]
      });
    });
  }
});

// Listen for messages from content script
console.log('Mini-GPT Agent background service worker loaded');

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received message:', msg);
  if (msg.type === 'MINI_GPT_ASK') {
    const provider = msg.provider || 'openai';
    const model = msg.model || (provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-2.0-flash');
    const apiKey = msg.apiKey || '';
    let result = { ok: false, answer: 'No provider selected.' };
    const tabId = sender.tab && sender.tab.id;
    (async () => {
      try {
        if (provider === 'openai') {
          result = await askOpenAI({ apiKey, model, prompt: msg.question, tabId });
        } else if (provider === 'gemini') {
          result = await askGemini({ apiKey, model, prompt: msg.question, tabId });
        } else {
          result = { ok: false, answer: 'Unknown provider.' };
        }
      } catch (e) {
        result = { ok: false, answer: e.message || 'Unknown error.' };
      }
      const answer = result.ok ? result.answer.replace(/\n/g, '<br>') : `Error: ${result.answer}`;
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'MINI_GPT_ANSWER', answer });
      }
      sendResponse({ ok: true });
    })();
    return true; // async
  }
  if (msg.type === 'MINI_GPT_STOP') {
    const tabId = sender.tab && sender.tab.id;
    if (tabId && abortControllers[tabId]) {
      abortControllers[tabId].abort();
      delete abortControllers[tabId];
    }
    sendResponse({ ok: true });
    return true;
  }
  sendResponse({ok: true});
});