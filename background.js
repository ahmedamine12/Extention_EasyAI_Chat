// IMPORTANT: Add your Gemini API key below before using the extension.
// Get your key at https://aistudio.google.com/app/apikey

importScripts('utils/provider-config.js', 'utils/provider-helpers.js');

const providerConfig = globalThis.EASYAI_PROVIDER_CONFIG || {};
const providerHelpers = globalThis.EASYAI_PROVIDER_HELPERS || {};
const getDefaultModelForProvider = providerHelpers.getDefaultModelForProvider || ((provider) => {
  const defaults = providerConfig.defaultModels || {};
  return defaults[provider] || defaults.openai || 'gpt-3.5-turbo';
});
const resolveProviderFromSettings = providerHelpers.resolveProviderFromSettings || ((settings) => {
  let provider = settings.provider;
  if (!provider || !settings[`apiKey_${provider}`]) {
    if (settings.apiKey_openai) provider = 'openai';
    else if (settings.apiKey_gemini) provider = 'gemini';
    else if (settings.apiKey_huggingface) provider = 'huggingface';
    else provider = 'openai';
  }
  return provider;
});
const getDefaultVisionModelForProvider = providerHelpers.getDefaultVisionModelForProvider || ((provider) => {
  const v = providerConfig.visionDefaultModels || {};
  return v[provider] || getDefaultModelForProvider(provider);
});
const getHfVisionModels = providerHelpers.getHfVisionModels || (() => providerConfig.hfVisionModels || []);
const DEFAULT_PROMPT_PREFIX = providerConfig.defaultPromptPrefix || 'Give a short, direct answer. Be concise. ';

// Map to store AbortController per tab
const abortControllers = {};

function deliverEasyAiReminder(title, note) {
  const safeTitle = (title || 'BrowseMate').slice(0, 200);
  const safeMsg = (note || '').trim().slice(0, 240) || 'Reminder';
  const iconUrl = chrome.runtime.getURL('icons/easyChat.png');

  function showOsFallback() {
    if (!isExtensionContextValid()) return;
    chrome.notifications.create(
      `easyai-n-${Date.now()}`,
      {
        type: 'basic',
        iconUrl,
        title: safeTitle,
        message: safeMsg
      },
      () => {
        if (chrome.runtime.lastError) {
          /* User may have blocked notifications; nothing else we can do from SW */
        }
      }
    );
  }

  chrome.tabs.query({}, (tabs) => {
    const list = tabs || [];
    const tryable = list.filter((t) => {
      if (!t.id) return false;
      const u = t.url || '';
      if (
        /^(chrome|chrome-extension|about|devtools|chrome-devtools|brave|edge|vivaldi|opera):/i.test(
          u
        )
      ) {
        return false;
      }
      return true;
    });

    tryable.sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (b.lastAccessed || 0) - (a.lastAccessed || 0);
    });

    let i = 0;
    function tryNext() {
      if (i >= tryable.length) {
        showOsFallback();
        return;
      }
      const tab = tryable[i++];
      chrome.tabs.sendMessage(tab.id, { type: 'EASYAI_REMINDER_SHOW', title: safeTitle, note: note || '' }, () => {
        if (chrome.runtime.lastError) tryNext();
      });
    }
    tryNext();
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name || !alarm.name.startsWith('easyaiR_')) return;
  chrome.storage.local.get(alarm.name, (data) => {
    const payload = data[alarm.name];
    chrome.storage.local.remove(alarm.name);
    if (!payload || !isExtensionContextValid()) {
      return;
    }
    const title = payload.title || 'Reminder';
    const note = typeof payload.note === 'string' ? payload.note : '';
    deliverEasyAiReminder(title, note);
  });
});

/** Chrome clears alarms on extension reload; storage keeps payload. Recreate missing alarms. */
function reconcileEasyAiReminderAlarms() {
  chrome.storage.local.get(null, (all) => {
    if (chrome.runtime.lastError) return;
    chrome.alarms.getAll((alarms) => {
      const names = new Set((alarms || []).map((a) => a.name));
      const now = Date.now();
      for (const [key, val] of Object.entries(all || {})) {
        if (!key.startsWith('easyaiR_') || !val || typeof val !== 'object') continue;
        const fireAt = typeof val.fireAt === 'number' ? val.fireAt : null;
        if (fireAt == null) {
          if (!names.has(key)) {
            chrome.storage.local.remove(key);
          }
          continue;
        }
        if (now - fireAt > 60000) {
          chrome.storage.local.remove(key);
          continue;
        }
        if (!names.has(key)) {
          try {
            const whenMs = fireAt < now ? now + 500 : fireAt;
            chrome.alarms.create(key, { when: Math.floor(whenMs) });
          } catch (_) {
            chrome.storage.local.remove(key);
          }
        }
      }
    });
  });
}
reconcileEasyAiReminderAlarms();

/** First-time setup: open the extension popup UI once if no API keys (toolbar UI is where keys are configured). */
const BM_API_KEY_FIELDS = ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'];
const BM_ONBOARDING_SETUP_KEY = 'browseMate_v2_setupUiOpenedOnce';

function bmHasAnyApiKey(data) {
  return BM_API_KEY_FIELDS.some((k) => data[k] && String(data[k]).trim());
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([...BM_API_KEY_FIELDS, BM_ONBOARDING_SETUP_KEY], (data) => {
    if (chrome.runtime.lastError) return;
    if (bmHasAnyApiKey(data)) return;
    if (data[BM_ONBOARDING_SETUP_KEY]) return;
    const url = chrome.runtime.getURL('popup/popup.html');
    chrome.tabs.create({ url }, () => {
      if (chrome.runtime.lastError) return;
      chrome.storage.local.set({ [BM_ONBOARDING_SETUP_KEY]: true });
    });
  });
});

// Helper function to safely access chrome APIs
function isExtensionContextValid() {
  try {
    return chrome && chrome.runtime && chrome.runtime.id;
  } catch (e) {
    return false;
  }
}

const SETTINGS_HINT =
  '\n\n—\nToolbar → BrowseMate icon → API Keys: confirm provider and paste a valid key. Retry your message after fixing.';

function appendSettingsHint(text) {
  return text + SETTINGS_HINT;
}

function isLikelyNetworkError(errorMsg) {
  const m = String(errorMsg || '').toLowerCase();
  if (!m.trim()) return false;
  return (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    (m.includes('fetch') && m.includes('fail')) ||
    m.includes('load failed') ||
    m.includes('could not connect') ||
    m.includes('connection refused') ||
    m.includes('network request failed') ||
    m.includes('err_connection') ||
    m.includes('err_name_not_resolved') ||
    m.includes('internet disconnected') ||
    m.includes('you are offline') ||
    m.includes('offline') ||
    m.includes('timed out') ||
    (m.includes('timeout') && !m.includes('quota')) ||
    m.includes('econnreset') ||
    m.includes('socket hang') ||
    (m.includes('dns') && m.includes('error'))
  );
}

// Unified error message formatter for all providers
function formatErrorMessage(errorMsg, provider = 'openai') {
  const providerNames = {
    openai: 'OpenAI',
    gemini: 'Gemini',
    huggingface: 'Hugging Face'
  };
  const providerLinks = {
    openai: 'https://platform.openai.com/account/billing',
    gemini: 'https://ai.google.dev/pricing',
    huggingface: 'https://huggingface.co/pricing'
  };
  const apiKeyHints = {
    openai: 'Make sure it starts with "sk-".',
    gemini: 'Create a key in Google AI Studio and paste it in BrowseMate API Keys.',
    huggingface: 'Make sure it starts with "hf_" and has Inference Providers enabled.'
  };

  const providerName = providerNames[provider] || provider;
  const providerLink = providerLinks[provider] || '';
  const apiKeyHint = apiKeyHints[provider] || 'Check your API key in BrowseMate API Keys.';
  const raw = String(errorMsg || '');

  if (isLikelyNetworkError(raw)) {
    return appendSettingsHint(
      '⚠️ Connection problem\n\n' +
        'BrowseMate could not reach the AI service. Check your internet connection, VPN, or firewall, then try again.'
    );
  }

  let userFriendlyError = '';

  // Invalid API key
  if (
    raw.includes('Invalid API key') ||
    raw.includes('Incorrect API key') ||
    (raw.includes('API key') && raw.includes('invalid')) ||
    raw.includes('401') ||
    raw.includes('Unauthorized')
  ) {
    userFriendlyError = appendSettingsHint(
      `❌ Invalid API key\n\nPlease check your ${providerName} key in BrowseMate. ${apiKeyHint}`
    );
  } else if (
    raw.includes('quota') ||
    raw.includes('Quota exceeded') ||
    raw.includes('rate limit') ||
    raw.includes('rate-limits') ||
    raw.includes('429') ||
    raw.includes('Rate limit') ||
    raw.includes('too many requests')
  ) {
    userFriendlyError = appendSettingsHint(
      `⚠️ Quota or rate limit\n\n` +
        `Your ${providerName} quota or rate limit was hit.\n\n` +
        `• Wait a few minutes and retry\n` +
        `• Switch provider in the chat header if you have another key\n` +
        `• Billing / limits: ${providerLink}`
    );
  } else if (
    raw.includes('billing') ||
    raw.includes('payment') ||
    raw.includes('402') ||
    raw.includes('insufficient_quota')
  ) {
    userFriendlyError = appendSettingsHint(
      `❌ Billing or account limit\n\n${raw}\n\nCheck your ${providerName} account: ${providerLink}`
    );
  } else if (raw.includes('403') && !raw.includes('429')) {
    userFriendlyError = appendSettingsHint(
      `❌ Access denied (403)\n\n${providerName} rejected the request. This is often a billing or permissions issue.\n\nAccount: ${providerLink}`
    );
  } else {
    userFriendlyError = appendSettingsHint(`❌ Something went wrong\n\n${raw}`);
  }

  return userFriendlyError;
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
        max_tokens: 4096,
        stream: true
      }),
      signal: controller.signal
    });
    
    // Check for HTTP errors
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}: ${res.statusText}` } }));
      const errorMsg = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const userFriendlyError = formatErrorMessage(errorMsg, 'openai');
      
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
        } catch (e) {
          // console.log('Tab message failed:', e);
        }
      }
      if (tabId) delete abortControllers[tabId];
      return { ok: false, answer: userFriendlyError };
    }
    
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
              
              // Check for errors in streaming response
              if (parsed.error) {
                const errorMsg = parsed.error.message || 'Unknown error';
                const userFriendlyError = formatErrorMessage(errorMsg, 'openai');
                
                if (isExtensionContextValid() && tabId) {
                  try {
                    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
                  } catch (e) {
                    // console.log('Tab message failed:', e);
                  }
                }
                if (tabId) delete abortControllers[tabId];
                return { ok: false, answer: userFriendlyError };
              }
              
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
              // ignore parse errors for empty lines
              if (data && data.trim() && data !== '[DONE]') {
                // If it's not empty and not [DONE], might be an error
                // console.log('Parse error:', e, 'Data:', data);
              }
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
    
    // Format error message using unified formatter
    const errorMessage = formatErrorMessage(e.message || 'Network error.', 'openai');
    
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: errorMessage, done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: false, answer: errorMessage };
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
    
    // Check for errors in response
    if (data.error) {
      const errorMsg = data.error.message || '';
      const userFriendlyError = formatErrorMessage(errorMsg, 'gemini');
      
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
        } catch (e) {
          // console.log('Tab message failed:', e);
        }
      }
      return { ok: false, answer: userFriendlyError };
    }
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else {
      answer = 'No answer from Gemini.';
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
    // Format error message using unified formatter
    const errorMessage = formatErrorMessage(e.message || 'Network error.', 'gemini');
    
    if (isExtensionContextValid() && tabId) {
      try {
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: errorMessage, done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
    return { ok: false, answer: errorMessage };
  }
}

/** OpenAI chat with one image (streaming). */
async function askOpenAIVision({ apiKey, model, prompt, imageBase64, imageMime, tabId, conversationContext = [] }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  const mime = imageMime || 'image/jpeg';
  const imageUrl = `data:${mime};base64,${imageBase64}`;

  const messages = [];
  if (conversationContext && conversationContext.length > 0) {
    messages.push(...conversationContext.map((msg) => ({ role: msg.role, content: msg.content })));
  }
  messages.push({
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: imageUrl } }
    ]
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4096,
        stream: true
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}: ${res.statusText}` } }));
      const errorMsg = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const userFriendlyError = formatErrorMessage(errorMsg, 'openai');
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
        } catch (e) {}
      }
      if (tabId) delete abortControllers[tabId];
      return { ok: false, answer: userFriendlyError };
    }

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
        buffer = lines.pop();
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const data = line.replace('data:', '').trim();
            if (data === '[DONE]') {
              if (isExtensionContextValid() && tabId) {
                try {
                  chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
                } catch (e) {}
              }
              if (tabId) delete abortControllers[tabId];
              return { ok: true, answer };
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                const userFriendlyError = formatErrorMessage(parsed.error.message || 'Unknown error', 'openai');
                if (isExtensionContextValid() && tabId) {
                  try {
                    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
                  } catch (e) {}
                }
                if (tabId) delete abortControllers[tabId];
                return { ok: false, answer: userFriendlyError };
              }
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                answer += delta;
                if (isExtensionContextValid() && tabId) {
                  try {
                    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: delta, done: false });
                  } catch (e) {}
                }
              }
            } catch (e) {
              /* skip */
            }
          }
        }
      }
    }
    if (tabId) delete abortControllers[tabId];
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true });
      } catch (e) {}
    }
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
        } catch (err) {}
      }
      return { ok: false, answer: 'Request stopped by user.' };
    }
    const errorMessage = formatErrorMessage(e.message || 'Network error.', 'openai');
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: errorMessage, done: true });
      } catch (err) {}
    }
    return { ok: false, answer: errorMessage };
  }
}

/** Gemini generateContent with inline image (non-streaming). */
async function askGeminiVision({ apiKey, model, prompt, imageBase64, imageMime, tabId, conversationContext = [] }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;

  let fullPrompt = prompt;
  if (conversationContext && conversationContext.length > 0) {
    const contextText = conversationContext.map((msg) => msg.content).join('\n\n');
    fullPrompt = `Previous conversation:\n${contextText}\n\nUser: ${prompt}`;
  }

  const mime = imageMime || 'image/jpeg';

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: fullPrompt },
              { inline_data: { mime_type: mime, data: imageBase64 } }
            ]
          }
        ]
      }),
      signal: controller.signal
    });
    if (tabId) delete abortControllers[tabId];
    const data = await res.json();

    if (data.error) {
      const userFriendlyError = formatErrorMessage(data.error.message || '', 'gemini');
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
        } catch (e) {}
      }
      return { ok: false, answer: userFriendlyError };
    }

    let answer = '';
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      answer = data.candidates[0].content.parts[0].text;
    } else {
      answer = 'No answer from Gemini.';
    }
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
      } catch (e) {}
    }
    return { ok: true, answer };
  } catch (e) {
    if (tabId) delete abortControllers[tabId];
    if (e.name === 'AbortError') {
      if (isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Stopped by user]', done: true });
        } catch (err) {}
      }
      return { ok: false, answer: 'Request stopped by user.' };
    }
    const errorMessage = formatErrorMessage(e.message || 'Network error.', 'gemini');
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: errorMessage, done: true });
      } catch (err) {}
    }
    return { ok: false, answer: errorMessage };
  }
}

/** HF router: vision models only, multimodal user message, streaming. */
async function askHuggingFaceVision({ apiKey, model, prompt, imageBase64, imageMime, tabId, conversationContext = [], hfVisionModels }) {
  const mime = imageMime || 'image/jpeg';
  const imageUrl = `data:${mime};base64,${imageBase64}`;

  const messages = [{ role: 'system', content: 'You are a helpful assistant. Describe what you see and answer briefly.' }];

  if (conversationContext && conversationContext.length > 0) {
    for (const msg of conversationContext) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
  }

  messages.push({
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: imageUrl } }
    ]
  });

  const modelsToTry = (hfVisionModels && hfVisionModels.length ? hfVisionModels : getHfVisionModels()).filter(Boolean);
  if (!modelsToTry.length) {
    const err = formatErrorMessage('No vision models configured for Hugging Face.', 'huggingface');
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: err, done: true });
      } catch (e) {}
    }
    if (tabId) delete abortControllers[tabId];
    return { ok: false, answer: err };
  }

  let lastError = null;
  const tryModels = model && modelsToTry.includes(model) ? [model, ...modelsToTry.filter((m) => m !== model)] : modelsToTry;

  for (let i = 0; i < tryModels.length; i++) {
    const currentModel = tryModels[i];
    const url = 'https://router.huggingface.co/v1/chat/completions';
    const controller = new AbortController();
    if (tabId) abortControllers[tabId] = controller;

    try {
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          max_tokens: 4096,
          temperature: 0.7,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        const authError = appendSettingsHint(
          '⚠️ Hugging Face authentication\n\n' +
            'Your token may be invalid or missing "Inference Providers" for router models.\n\n' +
            'Tokens: https://huggingface.co/settings/tokens'
        );
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: authError, done: true });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: authError };
      }

      if (res.status === 503 || res.status === 429) {
        lastError = `HTTP ${res.status} on ${currentModel}`;
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {};
        }
        lastError = errorData.error?.message || errorText.slice(0, 300) || `HTTP ${res.status}`;
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullAnswer += delta;
              if (isExtensionContextValid() && tabId) {
                try {
                  chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: delta, done: false, modelUsed: currentModel });
                } catch (e) {}
              }
            }
          } catch (e) {
            /* skip */
          }
        }
      }

      if (fullAnswer) {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '', done: true, modelUsed: currentModel });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: true, answer: fullAnswer, modelUsed: currentModel };
      }

      lastError = 'Empty response from vision model';
    } catch (e) {
      if (e.name === 'AbortError') {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Request timeout or stopped]', done: true });
          } catch (err) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: 'Request timeout or stopped by user.' };
      }
      lastError = e.message || 'Network error';
    }
  }

  if (tabId) delete abortControllers[tabId];
  const finalError = formatErrorMessage(
    `Vision request failed for all configured models. Last: ${lastError || 'Unknown'}. Try OpenAI/Gemini or another HF vision model id in provider-config.`,
    'huggingface'
  );
  if (isExtensionContextValid() && tabId) {
    try {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: finalError, done: true });
    } catch (e) {}
  }
  return { ok: false, answer: finalError };
}

// Predefined Hugging Face models for auto-switching
const HF_MODELS = providerConfig.hfModels || [
  'meta-llama/Llama-3.1-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.3',
  'Qwen/Qwen2.5-7B-Instruct',
  'google/gemma-2-9b-it',
  'microsoft/Phi-3-mini-4k-instruct'
];

async function askHuggingFace({ apiKey, model, prompt, tabId, conversationContext = [], hfModels = HF_MODELS }) {
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;

  // Build messages array (OpenAI-compatible chat format)
  const messages = [
    { role: 'system', content: 'You are a helpful assistant. Give simple, direct, concise answers.' }
  ];

  if (conversationContext && conversationContext.length > 0) {
    for (const msg of conversationContext) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
  }

  messages.push({ role: 'user', content: prompt });

  // Try models in order until one works
  const modelsToTry = hfModels || HF_MODELS;
  let lastError = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    // Use OpenAI-compatible chat completions endpoint with streaming
    const url = `https://router.huggingface.co/v1/chat/completions`;

    try {
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messages,
          max_tokens: 4096,
          temperature: 0.7,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check for auth errors before trying to read stream
      if (res.status === 401 || res.status === 403) {
        const authError = appendSettingsHint(
          `⚠️ Hugging Face authentication\n\n` +
            `Your token is not valid or lacks permissions.\n\n` +
            `1. https://huggingface.co/settings/tokens — create a Fine-grained token\n` +
            `2. Enable "Make calls to Inference Providers"\n` +
            `3. Copy the hf_ token into BrowseMate → API Keys`
        );

        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: authError, done: true });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: authError };
      }

      // Model loading (503) — try next model
      if (res.status === 503) {
        lastError = `Model ${currentModel} is loading`;
        if (isExtensionContextValid() && tabId && i < modelsToTry.length - 1) {
          try {
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: `⏳ Model loading, trying next model...\n`,
              done: false
            });
          } catch (e) {}
        }
        continue;
      }

      // Rate limit (429) — try next model
      if (res.status === 429) {
        lastError = `Rate limited on ${currentModel}`;
        continue;
      }

      // Other non-OK status — try to read error
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        let errorData;
        try { errorData = JSON.parse(errorText); } catch { errorData = {}; }
        lastError = errorData.error || `HTTP ${res.status}: ${errorText.slice(0, 200)}`;
        continue;
      }

      // Stream the response (SSE format, same as OpenAI)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAnswer = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullAnswer += delta;
              if (isExtensionContextValid() && tabId) {
                try {
                  chrome.tabs.sendMessage(tabId, {
                    type: 'MINI_GPT_ANSWER_PART',
                    answerPart: delta,
                    done: false,
                    modelUsed: currentModel
                  });
                } catch (e) {}
              }
            }
          } catch (e) {
            // Skip malformed JSON chunks
          }
        }
      }

      if (fullAnswer) {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: '',
              done: true,
              modelUsed: currentModel
            });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: true, answer: fullAnswer, modelUsed: currentModel };
      }

      // No content in stream — try next model
      lastError = 'Empty response from model';
      continue;

    } catch (e) {
      if (e.name === 'AbortError') {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Request timeout or stopped]', done: true });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: 'Request timeout or stopped by user.' };
      }

      lastError = e.message || 'Network error';

      if (isExtensionContextValid() && tabId && i < modelsToTry.length - 1) {
        try {
          chrome.tabs.sendMessage(tabId, {
            type: 'MINI_GPT_ANSWER_PART',
            answerPart: `⏳ Model ${i + 1} failed, trying next model...\n`,
            done: false
          });
        } catch (e) {}
      }
      continue;
    }
  }

  // All models failed
  if (tabId) delete abortControllers[tabId];
  const finalError = formatErrorMessage(
    `All models failed. Last error: ${lastError || 'Unknown error'}. Please try again later.`,
    'huggingface'
  );

  if (isExtensionContextValid() && tabId) {
    try {
      chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: finalError, done: true });
    } catch (e) {
      // console.log('Tab message failed:', e);
    }
  }
  return { ok: false, answer: finalError };
}

// Language detection for context menus
const browserLanguage = navigator.language || navigator.userLanguage || 'en';
const isFrench = browserLanguage.startsWith('fr');

const MINI_GPT_ACTIONS = [
  { 
    id: 'explain', 
    label: isFrench ? 'Expliquer' : 'Explain', 
    prefix: isFrench ? 
      'Explique ce texte en 2 ou 3 phrases courtes. Sois bref. Ne donne aucune information supplémentaire, seulement l\'explication : ' :
      'Explain this text in 2 to 3 short sentences. Be brief. Do not add extra information, only the explanation: '
  },
  { 
    id: 'correct', 
    label: isFrench ? 'Corriger' : 'Correct', 
    prefix: isFrench ? 
      'Tu es un correcteur de texte. Corrige UNIQUEMENT les fautes d\'orthographe, de grammaire et de ponctuation dans le texte ci-dessous. Règles strictes : (1) même nombre de lignes que l\'original, (2) mêmes caractères de mise en forme (tirets, puces, majuscules, etc.), (3) n\'ajoute rien, ne supprime rien, n\'explique rien, (4) arrête-toi exactement à la fin du texte fourni. Retourne UNIQUEMENT le texte corrigé :\n\n' :
      'You are a proofreader. Fix ONLY spelling, grammar and punctuation in the text below. Strict rules: (1) same number of lines as the original, (2) same formatting characters (dashes, bullets, capitalisation, etc.), (3) add nothing, remove nothing, explain nothing, (4) stop exactly at the end of the provided text. Return ONLY the corrected text:\n\n'
  },
  {
    id: 'summarize',
    label: isFrench ? 'Résumer' : 'Summarize',
    prefix: isFrench ?
      'Résume ce texte en 2 ou 3 phrases courtes. Sois bref. Ne donne aucune information supplémentaire, seulement le résumé : ' :
      'Summarize this text in 2 to 3 short sentences. Be brief. Do not add extra information, only the summary: '
  },
  {
    id: 'rephrase',
    label: isFrench ? 'Reformuler' : 'Rephrase',
    prefix: isFrench ?
      'Reformule le texte ci-dessous avec d\'autres mots, en gardant exactement le même sens et le même niveau de langue. Ne change pas la longueur de manière significative. Retourne UNIQUEMENT le texte reformulé, rien d\'autre :\n\n' :
      'Rephrase the text below using different words while keeping the exact same meaning and tone. Do not change the length significantly. Return ONLY the rephrased text, nothing else:\n\n'
  },
  {
    id: 'translate',
    label: isFrench ? 'Traduire' : 'Translate',
    prefix: isFrench ?
      'Détecte la langue du texte ci-dessous et traduis-le : s\'il est en français, traduis en anglais ; s\'il est en anglais, traduis en français ; sinon traduis en anglais. Retourne UNIQUEMENT le texte traduit, sans explication :\n\n' :
      'Detect the language of the text below and translate it: if French translate to English, if English translate to French, otherwise translate to English. Return ONLY the translated text, no explanation:\n\n'
  },
  {
    id: 'formal',
    label: isFrench ? 'Rendre formel' : 'Make formal',
    prefix: isFrench ?
      'Réécris le texte ci-dessous dans un style professionnel et formel, en conservant le sens et la langue d\'origine. Retourne UNIQUEMENT le texte réécrit, rien d\'autre :\n\n' :
      'Rewrite the text below in a professional and formal tone, keeping the original meaning and language. Return ONLY the rewritten text, nothing else:\n\n'
  },
  {
    id: 'shorten',
    label: isFrench ? 'Raccourcir' : 'Shorten',
    prefix: isFrench ?
      'Raccourcis le texte ci-dessous en gardant uniquement l\'essentiel. Vise environ la moitié de la longueur originale. Même langue, même ton. Retourne UNIQUEMENT le texte raccourci :\n\n' :
      'Shorten the text below, keeping only the essential information. Aim for roughly half the original length. Same language, same tone. Return ONLY the shortened text:\n\n'
  },
  {
    id: 'reply',
    label: isFrench ? 'Suggérer une réponse' : 'Suggest reply',
    prefix: isFrench ?
      'Rédige une réponse courte et professionnelle au message ci-dessous. 2 à 4 phrases maximum. Même langue que le message. Retourne UNIQUEMENT la réponse rédigée, sans explication :\n\n' :
      'Write a short professional reply to the message below. 2 to 4 sentences maximum. Same language as the message. Return ONLY the reply, no explanation:\n\n'
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
        title: isFrench ? 'BrowseMate (réponses courtes)' : 'BrowseMate (short answers)',
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
    // Fetch provider and API keys from storage
    safeStorageGet(['provider', 'apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'], (data) => {
      // Right-click actions have their own concise instructions — no extra prefix needed
      const question = action.prefix + info.selectionText;
      // Determine provider: use last-used, or fallback to one with a key
      const provider = resolveProviderFromSettings(data);
      const apiKey = data[`apiKey_${provider}`] || '';
      const model = getDefaultModelForProvider(provider);
      
      try {
      chrome.storage.local.set({ easyaiUiSuppressed: false }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
          func: (q, provider, model, apiKey, actionId, selectionText, isFrench, hfModels) => {
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
              userMsg.style.color = 'var(--browsemate-browse)';
              userMsg.style.alignSelf = 'flex-end';
              userMsg.style.textAlign = 'right';
              messagesDiv.appendChild(userMsg);
                
              // Add loader if not already present
              const last = messagesDiv.lastChild;
              if (!last || !last.querySelector || !last.querySelector('.mini-gpt-loader')) {
                const loader = document.createElement('div');
                loader.className = 'mini-gpt-msg-bot mini-gpt-msg-loader-bubble';
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
          // Detect if the selection came from an editable field (input, textarea, contenteditable)
          // so content.js can offer a Replace button on the response
          try {
            const activeEl = document.activeElement;
            const tag = activeEl ? activeEl.tagName : '';
            if (activeEl && (tag === 'INPUT' || tag === 'TEXTAREA')) {
              window.__easyaiEditableTarget = {
                el: activeEl,
                start: activeEl.selectionStart,
                end: activeEl.selectionEnd,
                type: 'input'
              };
            } else if (activeEl && activeEl.isContentEditable) {
              const sel = window.getSelection();
              window.__easyaiEditableTarget = {
                el: activeEl,
                range: (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null,
                type: 'contenteditable'
              };
            } else {
              window.__easyaiEditableTarget = null;
            }
          } catch (_) {
            window.__easyaiEditableTarget = null;
          }

          // Send provider/model/apiKey with the message
          // For Hugging Face, include models list for auto-switching
          window.postMessage({ type: 'MINI_GPT_ASK', question: q, provider, model, apiKey, hfModels: hfModels || undefined }, '*');
        },
          args: [question, provider, model, apiKey, action.id, info.selectionText, isFrench, provider === 'huggingface' ? HF_MODELS : null]
      });
      });
      } catch (e) {
        // console.log('Script execution failed:', e); // Replaced with silent handling
      }
    });
  }
});

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-chat') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EASYAI_TOGGLE_CHAT' });
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
  
  if (msg.type === 'EASYAI_CAPTURE_TAB') {
    const winId = sender.tab && sender.tab.windowId;
    try {
      chrome.tabs.captureVisibleTab(winId == null ? null : winId, { format: 'jpeg', quality: 86 }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, error: chrome.runtime.lastError.message || 'Capture failed' });
          return;
        }
        sendResponse({ ok: true, dataUrl: dataUrl || '' });
      });
    } catch (e) {
      sendResponse({ ok: false, error: e.message || 'Capture failed' });
    }
    return true;
  }

  if (msg.type === 'MINI_GPT_ASK') {
    const provider = msg.provider || 'openai';
    const apiKey = msg.apiKey || '';
    const tabId = sender.tab && sender.tab.id;
    const conversationContext = msg.conversationContext || [];
    const hfModels = msg.hfModels || HF_MODELS;
    const hasImage =
      typeof msg.imageBase64 === 'string' &&
      msg.imageBase64.length > 80 &&
      (!msg.imageMime || String(msg.imageMime).startsWith('image/'));

    const visionModel = msg.model || getDefaultVisionModelForProvider(provider);
    const hfVisionList = msg.hfVisionModels && msg.hfVisionModels.length ? msg.hfVisionModels : getHfVisionModels();

    const providerHandlers = hasImage
      ? {
          openai: () =>
            askOpenAIVision({
              apiKey,
              model: visionModel,
              prompt: msg.question,
              imageBase64: msg.imageBase64,
              imageMime: msg.imageMime || 'image/jpeg',
              tabId,
              conversationContext
            }),
          gemini: () =>
            askGeminiVision({
              apiKey,
              model: visionModel,
              prompt: msg.question,
              imageBase64: msg.imageBase64,
              imageMime: msg.imageMime || 'image/jpeg',
              tabId,
              conversationContext
            }),
          huggingface: () =>
            askHuggingFaceVision({
              apiKey,
              model: visionModel,
              prompt: msg.question,
              imageBase64: msg.imageBase64,
              imageMime: msg.imageMime || 'image/jpeg',
              tabId,
              conversationContext,
              hfVisionModels: hfVisionList
            })
        }
      : {
          openai: () =>
            askOpenAI({
              apiKey,
              model: msg.model || getDefaultModelForProvider(provider),
              prompt: msg.question,
              tabId,
              conversationContext
            }),
          gemini: () =>
            askGemini({
              apiKey,
              model: msg.model || getDefaultModelForProvider(provider),
              prompt: msg.question,
              tabId,
              conversationContext
            }),
          huggingface: () =>
            askHuggingFace({
              apiKey,
              model: msg.model || getDefaultModelForProvider(provider),
              prompt: msg.question,
              tabId,
              conversationContext,
              hfModels
            })
        };

    (async () => {
      try {
        const handler = providerHandlers[provider];
        if (handler) {
          await handler();
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
            const provider = msg.provider || 'openai';
            const errorMessage = formatErrorMessage(e.message || 'Unknown error.', provider);
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: errorMessage, done: true });
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

  if (msg.type === 'EASYAI_REMINDER_SCHEDULE') {
    const title = String(msg.title || '').trim().slice(0, 120);
    const note = String(msg.note || '').trim().slice(0, 2000);
    const when = Number(msg.when);
    const now = Date.now();
    const maxWhen = now + 30 * 24 * 60 * 60 * 1000;
    if (!title || !Number.isFinite(when) || when < now + 500 || when > maxWhen) {
      sendResponse({ ok: false, error: 'invalid' });
      return true;
    }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    const alarmName = `easyaiR_${id}`;
    const fireAt = Math.floor(when);
    chrome.storage.local.set({ [alarmName]: { title, note, created: now, fireAt } }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      try {
        chrome.alarms.create(alarmName, { when: fireAt });
      } catch (e) {
        chrome.storage.local.remove(alarmName);
        sendResponse({ ok: false, error: e.message || 'alarm' });
        return;
      }
      sendResponse({ ok: true, alarmName });
    });
    return true;
  }

  sendResponse({ok: true});
});