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
        max_tokens: 256,
        stream: true
      }),
      signal: controller.signal
    });
    if (!res.body) throw new Error('No response body');
    const reader = res.body.getReader();
    let buffer = '';
    let done = false;
    let answer = '';
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop(); // last line may be incomplete
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (data === '[DONE]') {
              chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
              if (tabId) delete abortControllers[tabId];
              return { ok: true, answer };
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                answer += delta;
                chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: delta, done: false });
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
    }
    if (tabId) delete abortControllers[tabId];
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
      return { ok: false, answer: 'Request stopped by user.' };
    }
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Error: ' + (e.message || 'Network error.') + ']', done: true });
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
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }), // No stream param
      signal: controller.signal
    });
    if (tabId) delete abortControllers[tabId];
    const data = await res.json();
    let answer = '';
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else {
      answer = data.error?.message || 'No answer from Gemini.';
    }
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
      return { ok: false, answer: 'Request stopped by user.' };
    }
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Error: ' + (e.message || 'Network error.') + ']', done: true });
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
    // Add a non-clickable header at the top
    chrome.contextMenus.create({
      id: 'mini-gpt-header',
      title: 'EasyAI Chat (short answers)',
      contexts: ['selection'],
      enabled: false
    });
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
        func: (q, provider, model, apiKey, actionId, selectionText) => {
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
              // Show a clean label for the action, or just the selection text
              let displayText = selectionText;
              if (actionId === 'summarize') displayText = 'Summarize: ' + selectionText;
              else if (actionId === 'correct') displayText = 'Correct: ' + selectionText;
              else if (actionId === 'explain') displayText = 'Explain: ' + selectionText;
              userMsg.textContent = displayText;
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
        args: [question, provider, model, apiKey, action.id, info.selectionText]
      });
    });
  }
});

// Listen for messages from content script
// In the message handler, call the streaming functions and do not send a final MINI_GPT_ANSWER (handled by streaming)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'MINI_GPT_ASK') {
    const provider = msg.provider || 'openai';
    const model = msg.model || (provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-2.0-flash');
    const apiKey = msg.apiKey || '';
    const tabId = sender.tab && sender.tab.id;
    (async () => {
      try {
        if (provider === 'openai') {
          await askOpenAI({ apiKey, model, prompt: msg.question, tabId });
        } else if (provider === 'gemini') {
          await askGemini({ apiKey, model, prompt: msg.question, tabId });
        } else {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '[Unknown provider]', done: true });
        }
      } catch (e) {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '[Error: ' + (e.message || 'Unknown error.') + ']', done: true });
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