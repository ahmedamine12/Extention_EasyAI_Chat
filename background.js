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
    else if (settings.apiKey_nvidia) provider = 'nvidia';
    else if (settings.apiKey_groq) provider = 'groq';
    else provider = 'openai';
  }
  return provider;
});
const getDefaultVisionModelForProvider = providerHelpers.getDefaultVisionModelForProvider || ((provider) => {
  const v = providerConfig.visionDefaultModels || {};
  return v[provider] || getDefaultModelForProvider(provider);
});
const getHfVisionModels = providerHelpers.getHfVisionModels || (() => providerConfig.hfVisionModels || []);

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
    // Mark as done in history
    chrome.storage.local.get('easyaiReminderHistory', (hData) => {
      const history = Array.isArray(hData.easyaiReminderHistory) ? hData.easyaiReminderHistory : [];
      const entry = history.find(h => h.alarmName === alarm.name);
      if (entry) {
        entry.status = 'done';
        chrome.storage.local.set({ easyaiReminderHistory: history });
      }
    });
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
        if (fireAt <= now) {
          // Past-due: deliver once immediately, then remove the key so it won't re-fire.
          chrome.storage.local.remove(key);
          const title = val.title || 'Reminder';
          const note = typeof val.note === 'string' ? val.note : '';
          // Mark done in history
          chrome.storage.local.get('easyaiReminderHistory', (hData) => {
            const history = Array.isArray(hData.easyaiReminderHistory) ? hData.easyaiReminderHistory : [];
            const entry = history.find(h => h.alarmName === key);
            if (entry && entry.status !== 'done') {
              entry.status = 'done';
              chrome.storage.local.set({ easyaiReminderHistory: history });
              deliverEasyAiReminder(title, note);
            }
            // If already done, skip delivery (already shown)
          });
          continue;
        }
        if (!names.has(key)) {
          try {
            chrome.alarms.create(key, { when: Math.floor(fireAt) });
          } catch (_) {
            chrome.storage.local.remove(key);
          }
        }
      }
    });
  });
}
reconcileEasyAiReminderAlarms();

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
    huggingface: 'Hugging Face',
    nvidia: 'NVIDIA NIM',
    groq: 'Groq'
  };
  const providerLinks = {
    openai: 'https://platform.openai.com/account/billing',
    gemini: 'https://ai.google.dev/pricing',
    huggingface: 'https://huggingface.co/pricing',
    nvidia: 'https://build.nvidia.com/',
    groq: 'https://console.groq.com/settings/billing'
  };
  const apiKeyHints = {
    openai: 'Make sure it starts with "sk-".',
    gemini: 'Create a key in Google AI Studio and paste it in BrowseMate API Keys.',
    huggingface: 'Make sure it starts with "hf_" and has Inference Providers enabled.',
    nvidia: 'Make sure it starts with "nvapi-" (create one at build.nvidia.com).',
    groq: 'Make sure it starts with "gsk_" (create one at console.groq.com/keys).'
  };

  const providerName = providerNames[provider] || provider;
  const providerLink = providerLinks[provider] || '';
  const apiKeyHint = apiKeyHints[provider] || 'Check your API key in BrowseMate API Keys.';
  const raw = String(errorMsg || '');

  if (isLikelyNetworkError(raw)) {
    return appendSettingsHint(
      '⚠️ Connection problem\n\n' +
        'BrowseMate could not reach the AI service. Check your internet connection, VPN, or firewall, then try again.');
  }

  let userFriendlyError = '';

  // Invalid API key
  if (
    raw.includes('Invalid API key') ||
    raw.includes('Incorrect API key') ||
    (raw.includes('API key') && raw.includes('invalid')) ||
    /\b401\b/.test(raw) ||
    raw.includes('Unauthorized')
  ) {
    userFriendlyError = appendSettingsHint(
      `❌ Invalid API key\n\nPlease check your ${providerName} key in BrowseMate. ${apiKeyHint}`);
  } else if (
    raw.includes('quota') ||
    raw.includes('Quota exceeded') ||
    raw.includes('rate limit') ||
    raw.includes('rate-limits') ||
    /\b429\b/.test(raw) ||
    raw.includes('Rate limit') ||
    raw.includes('too many requests')
  ) {
    userFriendlyError = appendSettingsHint(
      `⚠️ Quota or rate limit\n\n` +
        `Your ${providerName} quota or rate limit was hit.\n\n` +
        `• Wait a few minutes and retry\n` +
        `• Switch provider in the chat header if you have another key\n` +
        `• Billing / limits: ${providerLink}`);
  } else if (
    raw.includes('billing') ||
    raw.includes('payment') ||
    /\b402\b/.test(raw) ||
    raw.includes('insufficient_quota')
  ) {
    userFriendlyError = appendSettingsHint(
      `❌ Billing or account limit\n\n${raw}\n\nCheck your ${providerName} account: ${providerLink}`);
  } else if (/\b403\b/.test(raw) && !/\b429\b/.test(raw)) {
    userFriendlyError = appendSettingsHint(
      `❌ Access denied (403)\n\n${providerName} rejected the request. This is often a billing or permissions issue.\n\nAccount: ${providerLink}`);
  } else {
    userFriendlyError = appendSettingsHint(`❌ Something went wrong\n\n${raw}`);
  }

  return userFriendlyError;
}

/**
 * content.js appends the current user line to conversationContext before sending,
 * then passes the same turn again as `question` (with prompt prefix). Small models
 * mis-handle two user messages in a row; drop the duplicate trailing user entry.
 */
function dropDuplicateTrailingUserContext(conversationContext, prompt) {
  if (!Array.isArray(conversationContext) || conversationContext.length === 0) {
    return conversationContext || [];
  }
  const q = String(prompt || '').trim();
  if (!q) return conversationContext;
  const last = conversationContext[conversationContext.length - 1];
  if (!last || last.role !== 'user') return conversationContext;
  const lastContent = String(last.content || '').trim();
  if (!lastContent) return conversationContext;
  if (q === lastContent || (lastContent.length >= 2 && q.endsWith(lastContent))) {
    return conversationContext.slice(0, -1);
  }
  return conversationContext;
}


// Provider API functions (inlined)
function isOpenAiModelAccessError(errorData, status) {
  const msg =
    (errorData && errorData.error && typeof errorData.error.message === 'string' && errorData.error.message) ||
    (typeof errorData === 'string' ? errorData : '');
  const code = errorData && errorData.error && errorData.error.code;
  const raw = String(msg || '').toLowerCase();
  if (code === 'model_not_found') return true;
  if (status === 404) return true;
  return (
    raw.includes('model') &&
    (raw.includes('not found') ||
      raw.includes('does not exist') ||
      raw.includes('does not exist') ||
      raw.includes('not available') ||
      raw.includes('not supported') ||
      raw.includes('not permitted') ||
      raw.includes('does not have access') ||
      raw.includes('you must be a member') ||
      raw.includes('permission') ||
      raw.includes('restricted'))
  );
}

function isGeminiModelAccessError(errorData, status) {
  const msg =
    (errorData && errorData.error && typeof errorData.error.message === 'string' && errorData.error.message) ||
    (typeof errorData === 'string' ? errorData : '');
  const raw = String(msg || '').toLowerCase();
  if (status === 404) return true;
  return (
    raw.includes('model') &&
    (raw.includes('not found') ||
      raw.includes('not supported') ||
      raw.includes('not available') ||
      raw.includes('permission') ||
      raw.includes('does not have access'))
  );
}

function safeUniqueModels(arr) {
  const out = [];
  (Array.isArray(arr) ? arr : []).forEach((m) => {
    const mm = String(m || '').trim();
    if (!mm) return;
    if (out.includes(mm)) return;
    out.push(mm);
  });
  return out;
}

async function askOpenAI({ apiKey, model, modelCandidates, prompt, tabId, conversationContext = [] }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  
  // Build messages array with conversation context
  const messages = [];
  
  // Add conversation context (previous messages)
  const ctxOpen = dropDuplicateTrailingUserContext(conversationContext, prompt);
  if (ctxOpen && ctxOpen.length > 0) {
    messages.push(...ctxOpen);
  }
  
  // Add current user message
  messages.push({ role: 'user', content: prompt });
  
  try {
    const candidates = safeUniqueModels(modelCandidates && modelCandidates.length ? modelCandidates : [model]);
    for (let i = 0; i < candidates.length; i++) {
      const currentModel = candidates[i];
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          messages: messages, // Use full conversation context
          max_tokens: 4096,
          stream: true
        }),
        signal: controller.signal
      });

      // Check for HTTP errors (before streaming)
      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: { message: `HTTP ${res.status}: ${res.statusText}` } }));
        const errorMsg = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;

        // If it's a model access error, try next candidate (without spamming the user)
        if (i < candidates.length - 1 && isOpenAiModelAccessError(errorData, res.status)) {
          continue;
        }

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

      // Inform about fallback once, right before streaming begins.
      if (i > 0 && isExtensionContextValid() && tabId) {
        try {
          chrome.tabs.sendMessage(tabId, {
            type: 'MINI_GPT_ANSWER_PART',
            answerPart: `\n[Model unavailable — using ${currentModel}]\n\n`,
            done: false
          });
        } catch (e) {}
      }

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
              chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
                } catch (e) {
                  // console.log('Tab message failed:', e); // Replaced with silent handling
                }
              }
              if (tabId) delete abortControllers[tabId];
                return { ok: true, answer, modelUsed: currentModel };
            }
            try {
              const parsed = JSON.parse(data);
              
              // Check for errors in streaming response
              if (parsed.error) {
                const errorMsg = parsed.error.message || 'Unknown error';
                  // If we haven't finished streaming and this is a model access error, retry next model.
                  if (i < candidates.length - 1 && isOpenAiModelAccessError(parsed, 400)) {
                    try {
                      reader.cancel();
                    } catch (_) {}
                    done = true;
                    break;
                  }
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
    chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
      } catch (e) {
        // console.log('Tab message failed:', e); // Replaced with silent handling
      }
    }
      return { ok: true, answer, modelUsed: currentModel };
    }
    const err = formatErrorMessage('No compatible model found for this API key.', 'openai');
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: err, done: true });
      } catch (e) {}
    }
    return { ok: false, answer: err };
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

async function askGemini({ apiKey, model, modelCandidates, prompt, tabId, conversationContext = [] }) {
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
    const candidates = safeUniqueModels(modelCandidates && modelCandidates.length ? modelCandidates : [model]);
    for (let i = 0; i < candidates.length; i++) {
      const currentModel = candidates[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }), // Include conversation context
        signal: controller.signal
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        const errorMsg =
          (data && data.error && data.error.message) ||
          (!res.ok ? `HTTP ${res.status}: ${res.statusText}` : 'Unknown error');

        if (i < candidates.length - 1 && isGeminiModelAccessError(data, res.status)) {
          continue;
        }

        if (tabId) delete abortControllers[tabId];
        const userFriendlyError = formatErrorMessage(errorMsg, 'gemini');
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

      if (tabId) delete abortControllers[tabId];
      if (isExtensionContextValid() && tabId) {
        try {
          if (i > 0) {
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: `\n[Model unavailable — using ${currentModel}]\n\n`,
              done: false
            });
          }
          chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
        } catch (e) {}
      }
      return { ok: true, answer, modelUsed: currentModel };
    }
    if (tabId) delete abortControllers[tabId];
    const err = formatErrorMessage('No compatible model found for this API key.', 'gemini');
    if (isExtensionContextValid() && tabId) {
      try {
        chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: err, done: true });
      } catch (e) {}
    }
    return { ok: false, answer: err };
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
                  chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: answer, done: true });
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
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
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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
        lastError = `${currentModel} → ${hfErrorText(errorText, res.status)}`;
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
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: fullAnswer,
              done: true,
              modelUsed: currentModel
            });
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
  'meta-llama/Llama-3.3-70B-Instruct',
  'openai/gpt-oss-20b'
];

function normalizeTier(v) {
  const t = String(v || '').toLowerCase();
  return t === 'fast' || t === 'best' ? t : 'balanced';
}

function getHfTierModels(tier, fallbackList) {
  const base = Array.isArray(fallbackList) && fallbackList.length ? fallbackList : HF_MODELS;
  const t = normalizeTier(tier);
  // Prefer an order that roughly matches speed/quality tradeoffs.
  const fast = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'openai/gpt-oss-20b',
    'google/gemma-3-27b-it'
  ];
  const best = [
    'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'openai/gpt-oss-20b'
  ];
  const desired = t === 'fast' ? fast : t === 'best' ? best : base;
  const ordered = [];
  desired.forEach((m) => {
    const mm = String(m || '').trim();
    if (!mm) return;
    if (!base.includes(mm)) return;
    if (ordered.includes(mm)) return;
    ordered.push(mm);
  });
  // Ensure every base model is still attempted eventually.
  base.forEach((m) => {
    const mm = String(m || '').trim();
    if (!mm) return;
    if (ordered.includes(mm)) return;
    ordered.push(mm);
  });
  return ordered;
}

// Hugging Face returns `error` as a string OR an object ({message, type, code}); never print it raw.
function hfErrorText(errorText, status) {
  let data = {};
  try { data = JSON.parse(errorText); } catch (_) {}
  const e = data && data.error;
  const msg = (typeof e === 'string' ? e : e && (e.message || JSON.stringify(e))) || String(errorText || '').slice(0, 200);
  return `HTTP ${status}: ${msg || 'no details'}`;
}

const COMPAT = providerConfig.compatProviders || {};
const PROVIDER_LABELS = { huggingface: 'Hugging Face', nvidia: 'NVIDIA NIM', groq: 'Groq' };
const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

// Also serves NVIDIA NIM and Groq: any OpenAI-compatible streaming chat endpoint, with per-model fallback.
async function askHuggingFace({ apiKey, model, prompt, tabId, conversationContext = [], hfModels = HF_MODELS, endpoint = HF_ENDPOINT, providerId = 'huggingface' }) {
  let controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  let timedOut = false;

  // Build messages array (OpenAI-compatible chat format)
  const messages = [
    { role: 'system', content: 'You are a helpful assistant. Give simple, direct, concise answers.' }
  ];

  const ctx = dropDuplicateTrailingUserContext(conversationContext, prompt);
  if (ctx && ctx.length > 0) {
    for (const msg of ctx) {
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
    const url = endpoint;

    try {
      timedOut = false;
      const timeoutId = setTimeout(() => {
        timedOut = true;
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
        const authError = providerId === 'huggingface'
          ? appendSettingsHint(
              `⚠️ Hugging Face authentication\n\n` +
                `Your token is not valid or lacks permissions.\n\n` +
                `1. https://huggingface.co/settings/tokens — create a Fine-grained token\n` +
                `2. Enable "Make calls to Inference Providers"\n` +
                `3. Copy the hf_ token into BrowseMate → API Keys`)
          : formatErrorMessage('401 Unauthorized', providerId);

        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: authError, done: true });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: authError };
      }

      // Out of credits (402) affects every model: stop here instead of cycling through the list.
      if (res.status === 402) {
        const msg = formatErrorMessage(
          `${PROVIDER_LABELS[providerId] || providerId}: no remaining credits (HTTP 402). Add credits or switch provider in BrowseMate.`,
          providerId
        );
        if (isExtensionContextValid() && tabId) {
          try { chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: msg, done: true }); } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: msg };
      }

      // Model loading (503) — try next model
      if (res.status === 503) {
        lastError = `Model ${currentModel} is loading`;
        if (isExtensionContextValid() && tabId && i < modelsToTry.length - 1) {
          try {
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: 'Model is loading, trying the next one…',
              status: true,
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
        lastError = `${currentModel} → ${hfErrorText(errorText, res.status)}`;
        continue;
      }

      // Stream the response (SSE format, same as OpenAI)
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sentThinking = false;
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
            const d0 = parsed.choices?.[0]?.delta;
            // Reasoning models stream "thinking" tokens first: tell the UI instead of looking frozen.
            if (!fullAnswer && !sentThinking && d0 && (d0.reasoning_content || d0.reasoning)) {
              sentThinking = true;
              if (isExtensionContextValid() && tabId) {
                try { chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: 'Thinking…', status: true, done: false }); } catch (e) {}
              }
            }
            const delta = d0?.content;
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
            // Include full text on done so the tab always gets the reply even if stream deltas were dropped.
            chrome.tabs.sendMessage(tabId, {
              type: 'MINI_GPT_ANSWER_PART',
              answerPart: fullAnswer,
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
      if (e.name === 'AbortError' && timedOut && i < modelsToTry.length - 1) {
        // This model was too slow (not a user stop): move on with a fresh controller.
        lastError = `${currentModel} timed out after 30s`;
        controller = new AbortController();
        if (tabId) abortControllers[tabId] = controller;
        continue;
      }
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
            answerPart: 'That model failed, trying the next one…',
            status: true,
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
    providerId
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

/**
 * Right-click actions only. Keeps the user’s “style” prefix separate from the real task
 * so words like “resume” (meaning brief) are not read as “CV/résumé”.
 */
function buildBrowseMateContextMenuPrompt(promptPrefix, actionPrefix, selectionText, french) {
  const task = actionPrefix + selectionText;
  const p = String(promptPrefix || '').trim();
  if (!p) return task;
  if (french) {
    return (
      'Consignes de style pour ta réponse (ton et longueur — ce n’est pas le sujet de la tâche) :\n' +
      p +
      '\n\n---\n\nTâche :\n' +
      task
    );
  }
  return (
    'Reply style only (tone and length — not the topic). Apply to the task below:\n' +
    p +
    '\n\n---\n\nTask:\n' +
    task
  );
}

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
    safeStorageGet(
      [
        'provider',
        'apiKey_openai',
        'apiKey_gemini',
        'apiKey_huggingface',
        'apiKey_nvidia',
        'apiKey_groq',
        'systemInstruction',
        'promptPrefix',
        'modelTier',
        'lastWorkingModel_openai',
        'lastWorkingModel_gemini',
        'lastWorkingModel_huggingface',
        'browseMateDevMode'
      ],
      (data) => {
      const systemInstruction = String(data.systemInstruction || '').trim();
      const promptPrefix = String(data.promptPrefix || '').trim();

      const question = buildBrowseMateContextMenuPrompt(
        promptPrefix,
        action.prefix,
        info.selectionText,
        isFrench
      );
      // Determine provider: use last-used, or fallback to one with a key
      const provider = resolveProviderFromSettings(data);
      const apiKey = data[`apiKey_${provider}`] || '';
      const model = getDefaultModelForProvider(provider);
      const tier = String(data.modelTier || 'balanced').toLowerCase();
      const lastWorking = data[`lastWorkingModel_${provider}`];

      const tierCandidates = (() => {
        const t = tier === 'fast' || tier === 'best' ? tier : 'balanced';
        if (provider === 'openai') {
          if (t === 'fast') return ['gpt-4o-mini', 'gpt-4.1-mini'];
          if (t === 'best') return ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'];
          return ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4.1'];
        }
        if (provider === 'gemini') {
          if (t === 'fast') return ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
          if (t === 'best') return ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];
          return ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-pro'];
        }
        return [];
      })();
      const modelCandidates =
        provider === 'huggingface'
          ? null
          : safeUniqueModels([lastWorking, ...tierCandidates, model]);
      const hfModels =
        provider === 'huggingface' ? getHfTierModels(tier, HF_MODELS) : (provider === 'huggingface' ? HF_MODELS : null);

      try {
      chrome.storage.local.set({ easyaiUiSuppressed: false }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
          func: (q, provider, model, modelCandidates, apiKey, actionId, selectionText, isFrench, hfModels, systemInstruction) => {
          let displayText = selectionText;
          if (actionId === 'summarize') displayText = (isFrench ? 'Résumer : ' : 'Summarize: ') + selectionText;
          else if (actionId === 'correct') displayText = (isFrench ? 'Corriger : ' : 'Correct: ') + selectionText;
          else if (actionId === 'explain') displayText = (isFrench ? 'Expliquer : ' : 'Explain: ') + selectionText;
          else if (actionId === 'rephrase') displayText = (isFrench ? 'Reformuler : ' : 'Rephrase: ') + selectionText;
          else if (actionId === 'translate') displayText = (isFrench ? 'Traduire : ' : 'Translate: ') + selectionText;
          else if (actionId === 'formal') displayText = (isFrench ? 'Rendre formel : ' : 'Make formal: ') + selectionText;
          else if (actionId === 'shorten') displayText = (isFrench ? 'Raccourcir : ' : 'Shorten: ') + selectionText;
          else if (actionId === 'reply') displayText = (isFrench ? 'Suggérer une réponse : ' : 'Suggest reply: ') + selectionText;

          const bubble = document.getElementById('mini-gpt-bubble');
          const chat = document.getElementById('mini-gpt-chat-container');
          if (bubble && chat) {
              // Must clear [hidden]: styles.css uses #mini-gpt-chat-container[hidden] { display:none !important }
              chat.hidden = false;
              chat.style.display = 'flex';
              chat.style.visibility = 'visible';
              chat.style.opacity = '1';
              chat.style.pointerEvents = 'auto';
              
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
            try {
              window.dispatchEvent(new CustomEvent('browse-mate-panel-shown'));
            } catch (_) {}
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
          const ctx = (typeof systemInstruction === 'string' && systemInstruction.trim())
            ? [{ role: 'system', content: systemInstruction.trim() }]
            : [];
          const mc = Array.isArray(modelCandidates) && modelCandidates.length ? modelCandidates : null;
          const payload = {
              type: 'MINI_GPT_ASK',
              question: q,
              provider,
              model,
              modelCandidates: mc || undefined,
              apiKey,
              conversationContext: ctx,
              hfModels: hfModels || undefined,
              __browseMateContextMenu: true,
              __browseMateUserDisplay: displayText
            };
          if (typeof window.__browsemateAsk === 'function') window.__browsemateAsk(payload);
        },
          args: [
            question,
            provider,
            model,
            modelCandidates,
            apiKey,
            action.id,
            info.selectionText,
            isFrench,
            provider === 'huggingface' ? hfModels : null,
            systemInstruction
          ]
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

function syncBubbleSizeToTab(tabId) {
  if (tabId == null) return;
  chrome.storage.local.get(['bubbleSize'], (data) => {
    const size = Number(data && data.bubbleSize);
    if (!Number.isFinite(size)) return;
    chrome.tabs.sendMessage(tabId, { type: 'EASYAI_SET_BUBBLE_SIZE', size }, () => {
      // Ignore tabs without a receiver (restricted pages or not yet injected).
      void chrome.runtime.lastError;
    });
  });
}

function syncUiZoomToTab(tabId) {
  if (tabId == null) return;
  chrome.tabs.getZoom(tabId, (zoom) => {
    if (chrome.runtime.lastError) return;
    const zoomValue = Number(zoom);
    if (!Number.isFinite(zoomValue) || zoomValue <= 0) return;
    chrome.tabs.sendMessage(tabId, { type: 'EASYAI_SET_TAB_ZOOM', zoom: zoomValue }, () => {
      // Ignore tabs without a receiver (restricted pages or not yet injected).
      void chrome.runtime.lastError;
    });
  });
}

function syncUiStateToTab(tabId) {
  if (tabId == null) return;
  syncBubbleSizeToTab(tabId);
  syncUiZoomToTab(tabId);
}

// Keep bubble size consistent when users switch tabs/pages.
chrome.tabs.onActivated.addListener((activeInfo) => {
  syncUiStateToTab(activeInfo && activeInfo.tabId);
});

// Re-apply saved bubble size when a tab finishes loading.
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo || changeInfo.status !== 'complete') return;
  syncUiStateToTab(tabId);
});

// Keep injected UI scale stable when browser page zoom changes.
chrome.tabs.onZoomChange.addListener((zoomChangeInfo) => {
  const tabId = zoomChangeInfo && zoomChangeInfo.tabId;
  const zoom = zoomChangeInfo && zoomChangeInfo.newZoomFactor;
  const zoomValue = Number(zoom);
  if (tabId == null || !Number.isFinite(zoomValue) || zoomValue <= 0) return;
  chrome.tabs.sendMessage(tabId, { type: 'EASYAI_SET_TAB_ZOOM', zoom: zoomValue }, () => {
    void chrome.runtime.lastError;
  });
});

// Listen for messages from content script
// In the message handler, call the streaming functions and do not send a final MINI_GPT_ANSWER (handled by streaming)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!isExtensionContextValid()) {
    sendResponse({ ok: false, error: 'Extension context invalid' });
    return true;
  }
  
  /** Opens the extension toolbar popup (Chrome 127+). Content scripts cannot call chrome.action.openPopup. */
  if (msg.type === 'EASYAI_OPEN_EXTENSION_POPUP') {
    const windowId = sender.tab && sender.tab.windowId;
    if (!chrome.action || typeof chrome.action.openPopup !== 'function') {
      sendResponse({ ok: false, error: 'UNSUPPORTED' });
      return true;
    }
    const opts = windowId != null ? { windowId } : {};
    chrome.action
      .openPopup(opts)
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false, error: 'OPEN_POPUP_FAILED' }));
    return true;
  }

  if (msg.type === 'EASYAI_OPEN_EXTERNAL_URL') {
    const url = typeof msg.url === 'string' ? msg.url.trim() : '';
    if (!/^https:\/\//i.test(url)) {
      sendResponse({ ok: false, error: 'INVALID_URL' });
      return true;
    }
    chrome.tabs.create({ url }, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        sendResponse({ ok: false, error: chrome.runtime.lastError?.message || 'OPEN_TAB_FAILED' });
        return;
      }
      sendResponse({ ok: true });
    });
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

  if (msg.type === 'EASYAI_GET_TAB_ZOOM') {
    const tabId = sender.tab && sender.tab.id;
    if (tabId == null) {
      sendResponse({ ok: false, error: 'NO_TAB' });
      return true;
    }
    chrome.tabs.getZoom(tabId, (zoom) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message || 'GET_ZOOM_FAILED' });
        return;
      }
      sendResponse({ ok: true, zoom: Number(zoom) || 1 });
    });
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
    const modelCandidates = Array.isArray(msg.modelCandidates) ? msg.modelCandidates : null;
    const visionModelCandidates = Array.isArray(msg.visionModelCandidates) ? msg.visionModelCandidates : null;

    const compatHandlers = Object.fromEntries(
      Object.entries(COMPAT).map(([id, c]) => [id, () =>
        askHuggingFace({
          apiKey,
          prompt: msg.question,
          tabId,
          conversationContext,
          hfModels: c.models,
          endpoint: c.endpoint,
          providerId: id
        })
      ])
    );

    const providerHandlers = hasImage
      ? {
          openai: () =>
            askOpenAIVision({
              apiKey,
              model: (visionModelCandidates && visionModelCandidates[0]) || visionModel,
              modelCandidates: visionModelCandidates || [visionModel],
              prompt: msg.question,
              imageBase64: msg.imageBase64,
              imageMime: msg.imageMime || 'image/jpeg',
              tabId,
              conversationContext
            }),
          gemini: () =>
            askGeminiVision({
              apiKey,
              model: (visionModelCandidates && visionModelCandidates[0]) || visionModel,
              modelCandidates: visionModelCandidates || [visionModel],
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
            }),
          ...Object.fromEntries(
            Object.keys(COMPAT).map((id) => [id, async () => {
              const m = formatErrorMessage(
                `${COMPAT[id].label} does not support images in BrowseMate. Switch to Gemini, OpenAI or Hugging Face for screenshots.`,
                id
              );
              if (isExtensionContextValid() && tabId) {
                try { chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: m, done: true }); } catch (e) {}
              }
            }])
          )
        }
      : {
          openai: () =>
            askOpenAI({
              apiKey,
              model: msg.model || getDefaultModelForProvider(provider),
              modelCandidates: modelCandidates || undefined,
              prompt: msg.question,
              tabId,
              conversationContext
            }),
          gemini: () =>
            askGemini({
              apiKey,
              model: msg.model || getDefaultModelForProvider(provider),
              modelCandidates: modelCandidates || undefined,
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
            }),
          ...compatHandlers
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
      // Append to reminder history (max 5, FIFO)
      chrome.storage.local.get('easyaiReminderHistory', (hData) => {
        const history = Array.isArray(hData.easyaiReminderHistory) ? hData.easyaiReminderHistory : [];
        history.push({ alarmName, title, note, created: now, fireAt, status: 'pending' });
        // If over limit, remove oldest and clear its alarm
        while (history.length > 5) {
          const oldest = history.shift();
          if (oldest && oldest.status === 'pending') {
            chrome.alarms.clear(oldest.alarmName);
            chrome.storage.local.remove(oldest.alarmName);
          }
        }
        chrome.storage.local.set({ easyaiReminderHistory: history });
      });
      sendResponse({ ok: true, alarmName });
    });
    return true;
  }

  if (msg.type === 'EASYAI_REMINDER_LIST') {
    chrome.storage.local.get('easyaiReminderHistory', (hData) => {
      const history = Array.isArray(hData.easyaiReminderHistory) ? hData.easyaiReminderHistory : [];
      sendResponse({ ok: true, history });
    });
    return true;
  }

  if (msg.type === 'EASYAI_REMINDER_DELETE') {
    const target = String(msg.alarmName || '');
    if (!target) { sendResponse({ ok: false }); return true; }
    chrome.storage.local.get('easyaiReminderHistory', (hData) => {
      let history = Array.isArray(hData.easyaiReminderHistory) ? hData.easyaiReminderHistory : [];
      const entry = history.find(h => h.alarmName === target);
      if (entry && entry.status === 'pending') {
        chrome.alarms.clear(target);
        chrome.storage.local.remove(target);
      }
      history = history.filter(h => h.alarmName !== target);
      chrome.storage.local.set({ easyaiReminderHistory: history }, () => {
        sendResponse({ ok: true });
      });
    });
    return true;
  }

  sendResponse({ok: true});
});