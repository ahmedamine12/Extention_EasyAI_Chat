// IMPORTANT: Add your Gemini API key below before using the extension.
// Get your key at https://aistudio.google.com/app/apikey

// Using local Ollama API - 100% FREE!
// Make sure Ollama is running: ollama serve
// And you have a model: ollama pull llama2:7b

// Map to store AbortController per tab
const abortControllers = {};

// Helper function to safely access chrome APIs
function isExtensionContextValid() {
  try {
    return chrome && chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

// Provider API functions (inlined)
async function askOpenAI({ apiKey, model, prompt, tabId, conversationContext = [] }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  
  // Build messages array with conversation context
  const messages = [];
  
  // Add conversation context (previous messages)
  if (conversationContext && conversationContext.length > 0) {
    messages.push(...conversationContext);
  }
  
  // Add current user message
  messages.push({ role: 'user', content: prompt });
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: messages, // Use full conversation context
        max_tokens: 2048, // Increased for better context handling
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
              if (isExtensionContextValid() && tabId) {
                try {
              chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
                } catch (e) {
                  // console.log('Tab message failed:', e); // Replaced with silent handling
                }
              }
              if (tabId) delete abortControllers[tabId];
              return { ok: true, answer };
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                answer += delta;
                if (isExtensionContextValid() && tabId) {
                  try {
                chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: delta, done: false });
                  } catch (e) {
                    // console.log('Tab message failed:', e); // Replaced with silent handling
                  }
                }
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
    }
    if (tabId) delete abortControllers[tabId];
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      if (isExtensionContextValid() && tabId) {
        try {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
        } catch (e) {
          // console.log('Tab message failed:', e); // Replaced with silent handling
        }
      }
      return { ok: false, answer: 'Request stopped by user.' };
    }
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Error: ' + (e.message || 'Network error.') + ']', done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: false, answer: e.message || 'Network error.' };
  }
}

async function askGemini({ apiKey, model, prompt, tabId, conversationContext = [] }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  
  // Build conversation history for Gemini
  let fullPrompt = prompt;
  
  // Add conversation context if available
  if (conversationContext && conversationContext.length > 0) {
    const contextText = conversationContext.map(msg => {
      return msg.content;
    }).join('\n\n');
    fullPrompt = `Previous conversation:\n${contextText}\n\nUser: ${prompt}`;
  }
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }), // Include conversation context
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
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      if (isExtensionContextValid() && tabId) {
        try {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
        } catch (e) {
          // console.log('Tab message failed:', e); // Replaced with silent handling
        }
      }
      return { ok: false, answer: 'Request stopped by user.' };
    }
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Error: ' + (e.message || 'Network error.') + ']', done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: false, answer: e.message || 'Network error.' };
  }
}

// Language detection for context menus
const browserLanguage = navigator.language || navigator.userLanguage || 'en';
const isFrench = browserLanguage.startsWith('fr');

const MINI_GPT_ACTIONS = [
  { 
    id: 'explain', 
    label: isFrench ? 'Expliquer' : 'Explain', 
    prefix: isFrench ? 
      'Veuillez expliquer le texte suivant de manière claire et concise. Fournissez uniquement l\'explication, sans détails supplémentaires, listes ou commentaires : ' :
      'Please explain the following text in a clear and concise way. Provide only the explanation, without extra details, lists, or commentary: ' 
  },
  { 
    id: 'correct', 
    label: isFrench ? 'Corriger' : 'Correct', 
    prefix: isFrench ? 
      'Veuillez corriger et formater ce texte. Fournissez uniquement la version corrigée sans explications ou analyses : ' :
      'Please correct and format this text. Provide only the corrected version without explanations or analysis: ' 
  },
  { 
    id: 'summarize', 
    label: isFrench ? 'Résumer' : 'Summarize', 
    prefix: isFrench ? 
      'Veuillez résumer le texte suivant de manière brève et directe. Fournissez uniquement le résumé, sans détails supplémentaires, listes ou commentaires : ' :
      'Please summarize the following text in a brief and direct way. Provide only the summary, without extra details, lists, or commentary: ' 
  }
];

// Safe storage access function
function safeStorageGet(keys, callback) {
  if (!isExtensionContextValid()) {
    // console.log('Extension context invalid, cannot access storage'); // Replaced with silent handling
    callback({});
    return;
  }
  
  try {
    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError) {
        // console.log('Storage error:', chrome.runtime.lastError); // Replaced with silent handling
        callback({});
        return;
      }
      callback(data);
    });
  } catch (e) {
    // console.log('Storage access failed:', e); // Replaced with silent handling
    callback({});
  }
}

chrome.runtime.onInstalled.addListener(() => {
  if (!isExtensionContextValid()) return;
  
  // Remove old context menus first
  try {
  chrome.contextMenus.removeAll(() => {
    // Add a non-clickable header at the top
    chrome.contextMenus.create({
      id: 'mini-gpt-header',
        title: isFrench ? 'EasyAI Chat (réponses courtes)' : 'EasyAI Chat (short answers)',
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
  } catch (e) {
    // console.log('Context menu creation failed:', e); // Replaced with silent handling
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!isExtensionContextValid()) return;
  
  const action = MINI_GPT_ACTIONS.find(a => info.menuItemId === `mini-gpt-${a.id}`);
  if (action && info.selectionText) {
    const question = action.prefix + info.selectionText;
    // Fetch provider and API keys from storage
    safeStorageGet(['provider', 'apiKey_openai', 'apiKey_gemini'], (data) => {
      // Determine provider: use last-used, or fallback to one with a key
      let provider = data.provider;
      if (!provider || !data[`apiKey_${provider}`]) {
        if (data.apiKey_openai) provider = 'openai';
        else if (data.apiKey_gemini) provider = 'gemini';
        else provider = 'openai'; // fallback
      }
      const apiKey = data[`apiKey_${provider}`] || '';
      const model = provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-2.0-flash';
      
      try {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
          func: (q, provider, model, apiKey, actionId, selectionText, isFrench) => {
          // Open chat bubble and add user message + Thinking...
          const bubble = document.getElementById('mini-gpt-bubble');
          const chat = document.getElementById('mini-gpt-chat-container');
          if (bubble && chat) {
              // Ensure chat is visible
            chat.style.display = 'flex';
              chat.style.visibility = 'visible';
              chat.style.opacity = '1';
              
              // Hide bubble when chat opens
              if (bubble.style.display !== 'none') {
                bubble.style.display = 'none';
                bubble.style.visibility = 'hidden';
              }
              
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
                if (actionId === 'summarize') displayText = (isFrench ? 'Résumer : ' : 'Summarize: ') + selectionText;
                else if (actionId === 'correct') displayText = (isFrench ? 'Corriger : ' : 'Correct: ') + selectionText;
                else if (actionId === 'explain') displayText = (isFrench ? 'Expliquer : ' : 'Explain: ') + selectionText;
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
                  loader.setAttribute('aria-label', isFrench ? 'Mini-GPT réfléchit' : 'Mini-GPT is thinking');
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
          args: [question, provider, model, apiKey, action.id, info.selectionText, isFrench]
      });
      } catch (e) {
        // console.log('Script execution failed:', e); // Replaced with silent handling
      }
    });
  }
});

// Listen for messages from content script
// In the message handler, call the streaming functions and do not send a final MINI_GPT_ANSWER (handled by streaming)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!isExtensionContextValid()) {
    sendResponse({ ok: false, error: 'Extension context invalid' });
    return true;
  }
  
  if (msg.type === 'MINI_GPT_ASK') {
    const provider = msg.provider || 'openai';
    const model = msg.model || (provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-2.0-flash');
    const apiKey = msg.apiKey || '';
    const tabId = sender.tab && sender.tab.id;
    const conversationContext = msg.conversationContext || []; // Get conversation context
    (async () => {
      try {
        if (provider === 'openai') {
          await askOpenAI({ apiKey, model, prompt: msg.question, tabId, conversationContext });
        } else if (provider === 'gemini') {
          await askGemini({ apiKey, model, prompt: msg.question, tabId, conversationContext });
        } else {
          if (isExtensionContextValid() && tabId) {
            try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '[Unknown provider]', done: true });
            } catch (e) {
              // console.log('Tab message failed:', e); // Replaced with silent handling
            }
          }
        }
      } catch (e) {
        if (isExtensionContextValid() && tabId) {
          try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '[Error: ' + (e.message || 'Unknown error.') + ']', done: true });
          } catch (e) {
            // console.log('Tab message failed:', e); // Replaced with silent handling
          }
        }
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