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
const DEFAULT_PROMPT_PREFIX = providerConfig.defaultPromptPrefix || 'Give a simple, direct, resume answer. ';

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

// Unified error message formatter for all providers
function formatErrorMessage(errorMsg, provider = 'openai') {
  const providerNames = {
    'openai': 'OpenAI',
    'gemini': 'Gemini',
    'huggingface': 'Hugging Face'
  };
  const providerLinks = {
    'openai': 'https://platform.openai.com/account/billing',
    'gemini': 'https://ai.google.dev/pricing',
    'huggingface': 'https://huggingface.co/pricing'
  };
  const apiKeyHints = {
    'openai': 'Make sure it starts with "sk-".',
    'gemini': 'Check your API key in Settings.',
    'huggingface': 'Make sure it starts with "hf_".'
  };
  
  const providerName = providerNames[provider] || provider;
  const providerLink = providerLinks[provider] || '';
  const apiKeyHint = apiKeyHints[provider] || 'Check your API key in Settings.';
  
  let userFriendlyError = '';
  
  // Invalid API key
  if (errorMsg.includes('Invalid API key') || errorMsg.includes('Incorrect API key') || 
      errorMsg.includes('API key') && errorMsg.includes('invalid') || 
      errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
    userFriendlyError = `❌ Invalid API Key\n\nPlease check your ${providerName} API key in Settings. ${apiKeyHint}`;
  }
  // Quota/Rate limit errors
  else if (errorMsg.includes('quota') || errorMsg.includes('Quota exceeded') || 
           errorMsg.includes('rate limit') || errorMsg.includes('rate-limits') ||
           errorMsg.includes('429') || errorMsg.includes('Rate limit')) {
    userFriendlyError = `⚠️ Quota/Rate Limit Exceeded\n\n` +
      `Your ${providerName} quota or rate limit has been reached.\n\n` +
      `Options:\n` +
      `• Wait a few minutes and try again\n` +
      `• Switch to ${provider === 'openai' ? 'Gemini' : 'OpenAI'} provider\n` +
      `• Upgrade your plan at: ${providerLink}`;
  }
  // Billing/Payment errors
  else if (errorMsg.includes('billing') || errorMsg.includes('payment') || 
           errorMsg.includes('402') || errorMsg.includes('403') ||
           errorMsg.includes('insufficient_quota')) {
    userFriendlyError = `❌ Billing/Quota Issue\n\n` +
      `${errorMsg}\n\n` +
      `Check your ${providerName} account at: ${providerLink}`;
  }
  // Generic errors
  else {
    userFriendlyError = `❌ Error: ${errorMsg}`;
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
        max_tokens: 2048, // Increased for better context handling
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

// Predefined Hugging Face models for auto-switching
const HF_MODELS = providerConfig.hfModels || [
  'meta-llama/Llama-3.1-8B-Instruct',
  'mistralai/Mistral-7B-Instruct-v0.2',
  'google/gemma-7b-it',
  'microsoft/Phi-3-mini-4k-instruct',
  'Qwen/Qwen2.5-7B-Instruct'
];

async function askHuggingFace({ apiKey, model, prompt, tabId, conversationContext = [], hfModels = HF_MODELS }) {
  const controller = new AbortController();
  if (tabId) abortControllers[tabId] = controller;
  
  // Build conversation history for Hugging Face
  let fullPrompt = prompt;
  
  // Add conversation context if available
  if (conversationContext && conversationContext.length > 0) {
    const contextText = conversationContext.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
    fullPrompt = `Previous conversation:\n${contextText}\n\nUser: ${prompt}`;
  }
  
  // Try models in order until one works
  const modelsToTry = hfModels || HF_MODELS;
  let lastError = null;
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    // Use router endpoint with Responses API format: router.huggingface.co/v1/responses
    const url = `https://router.huggingface.co/v1/responses`;
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30 second timeout
      
      // Build input text from conversation context and current prompt
      let inputText = prompt;
      if (conversationContext && conversationContext.length > 0) {
        const contextText = conversationContext.map(msg => {
          const role = msg.role === 'user' ? 'User' : 'Assistant';
          return `${role}: ${msg.content}`;
        }).join('\n\n');
        inputText = `Previous conversation:\n${contextText}\n\nUser: ${prompt}`;
      }
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: currentModel,
          instructions: "You are a helpful assistant. Give simple, direct, resume answers.",
          input: inputText
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if model is loading (503 status)
      if (res.status === 503) {
        // Model is loading, wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Add timeout for retry too
        const retryTimeoutId = setTimeout(() => {
          controller.abort();
        }, 30000);
        
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.7,
              return_full_text: false
            }
          }),
          signal: controller.signal
        });
        
        clearTimeout(retryTimeoutId);
        
        if (retryRes.ok) {
          const data = await retryRes.json();
          let answer = '';
          
          if (Array.isArray(data) && data[0]?.generated_text) {
            answer = data[0].generated_text.trim();
          } else if (data.generated_text) {
            answer = data.generated_text.trim();
          } else if (data.error) {
            // If this model has an error, try next one
            lastError = data.error;
            continue;
          }
          
          if (answer && isExtensionContextValid() && tabId) {
            try {
              chrome.tabs.sendMessage(tabId, { 
                type: 'MINI_GPT_ANSWER_PART', 
                answerPart: answer, 
                done: true,
                modelUsed: currentModel 
              });
            } catch (e) {
              // console.log('Tab message failed:', e);
            }
          }
          if (tabId) delete abortControllers[tabId];
          return { ok: true, answer, modelUsed: currentModel };
        }
      }
      
      // Parse response (read body only once)
      const responseText = await res.text().catch(() => '');
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { error: responseText || `HTTP ${res.status}` };
      }
      
      // Extract answer from response (Responses API format)
      let answer = '';
      if (responseData.output) {
        // Responses API format - primary format
        answer = responseData.output.trim();
      } else if (responseData.choices && responseData.choices[0]?.message?.content) {
        // Chat completion format (fallback)
        answer = responseData.choices[0].message.content.trim();
      } else if (Array.isArray(responseData) && responseData[0]?.generated_text) {
        // Raw inference format (fallback)
        answer = responseData[0].generated_text.trim();
      } else if (responseData.generated_text) {
        // Raw inference format (fallback)
        answer = responseData.generated_text.trim();
      }
      
      // If we got valid data, use it (even if status is not ok or there's a deprecation warning)
      if (answer) {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { 
              type: 'MINI_GPT_ANSWER_PART', 
              answerPart: answer, 
              done: true,
              modelUsed: currentModel 
            });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: true, answer, modelUsed: currentModel };
      }
      
      // No valid data - handle errors
      if (!res.ok) {
        // Check for authentication errors
        if (res.status === 401 || res.status === 403 || 
            responseText.includes('Invalid username or password') ||
            responseText.includes('authentication') ||
            responseText.includes('Unauthorized') ||
            responseText.includes('Forbidden')) {
          // Authentication error - token might be invalid or missing permissions
          const authError = `⚠️ Hugging Face Authentication Error\n\n` +
            `Your API token is not valid or doesn't have the required permissions.\n\n` +
            `To fix this:\n` +
            `1. Go to https://huggingface.co/settings/tokens\n` +
            `2. Create a new "Fine-grained" token\n` +
            `3. Make sure to check:\n` +
            `   ✓ "Make calls to Inference Providers"\n` +
            `   ✓ "Make calls to your Inference Endpoints"\n` +
            `4. Copy the token (starts with "hf_")\n` +
            `5. Paste it in the extension settings\n\n` +
            `Note: The token must have "Inference Providers" permission enabled.`;
          
          if (isExtensionContextValid() && tabId) {
            try {
              chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: authError, done: true });
            } catch (e) {}
          }
          if (tabId) delete abortControllers[tabId];
          return { ok: false, answer: authError };
        }
        
        // Check for deprecation message
        if (responseText.includes('router.huggingface.co') || responseText.includes('no longer supported')) {
          // Deprecation error - the endpoint is truly deprecated
          // Since all models use the same endpoint, they'll all fail
          // Show helpful error and stop trying
          const deprecationError = `⚠️ Hugging Face API Endpoint Deprecated\n\n` +
            `The Inference API endpoint has been updated. The router endpoint format is not yet documented.\n\n` +
            `Current status: All models are failing because the endpoint is deprecated.\n\n` +
            `Options:\n` +
            `• Wait for Hugging Face to document the router endpoint\n` +
            `• Use OpenAI or Gemini providers for now\n` +
            `• Check Hugging Face documentation for updates\n\n` +
            `We'll update the extension once the router endpoint format is available.`;
          
          if (isExtensionContextValid() && tabId) {
            try {
              chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: deprecationError, done: true });
            } catch (e) {}
          }
          if (tabId) delete abortControllers[tabId];
          return { ok: false, answer: deprecationError };
        }
        
        // If quota/rate limit error, try next model
        if (res.status === 429 || res.status === 403 || responseData.error?.includes('quota')) {
          lastError = responseData.error || `HTTP ${res.status}`;
          continue;
        }
        
        // Other errors - show to user
        const errorMsg = responseData.error || `HTTP ${res.status}: ${res.statusText}`;
        const userFriendlyError = formatErrorMessage(errorMsg, 'huggingface');
        
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: userFriendlyError, done: true });
          } catch (e) {}
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: userFriendlyError };
      }
      
      // Response is ok but no generated_text - might be an error in the data
      if (responseData.error) {
        lastError = responseData.error;
        continue; // Try next model
      }
      
      // No answer and no error - unexpected response format
      lastError = 'Unexpected response format';
      continue;
      
    } catch (e) {
      if (e.name === 'AbortError') {
        if (isExtensionContextValid() && tabId) {
          try {
            chrome.tabs.sendMessage(tabId, { type: 'MINI_GPT_ANSWER_PART', answerPart: '\n[Request timeout or stopped]', done: true });
          } catch (e) {
            // console.log('Tab message failed:', e);
          }
        }
        if (tabId) delete abortControllers[tabId];
        return { ok: false, answer: 'Request timeout or stopped by user.' };
      }
      
      // Network, timeout, or other error - try next model
      const errorMsg = e.message || 'Network error';
      lastError = errorMsg;
      
      // If timeout or network error, show progress and try next model
      if (errorMsg.includes('timeout') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
        if (isExtensionContextValid() && tabId && i < modelsToTry.length - 1) {
          try {
            chrome.tabs.sendMessage(tabId, { 
              type: 'MINI_GPT_ANSWER_PART', 
              answerPart: `⏳ Model ${i + 1} timed out, trying next model...\n`, 
              done: false 
            });
          } catch (e) {}
        }
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
    // Fetch provider and API keys from storage
    safeStorageGet(['provider', 'apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface', 'promptPrefix'], (data) => {
      // Apply prompt prefix to context menu actions too
      const promptPrefix = data.promptPrefix || DEFAULT_PROMPT_PREFIX;
      const question = promptPrefix + action.prefix + info.selectionText;
      // Determine provider: use last-used, or fallback to one with a key
      const provider = resolveProviderFromSettings(data);
      const apiKey = data[`apiKey_${provider}`] || '';
      const model = getDefaultModelForProvider(provider);
      
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
          // For Hugging Face, include models list for auto-switching
          const hfModels = provider === 'huggingface' ? HF_MODELS : undefined;
          window.postMessage({ type: 'MINI_GPT_ASK', question: q, provider, model, apiKey, hfModels }, '*');
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
    const model = msg.model || getDefaultModelForProvider(provider);
    const apiKey = msg.apiKey || '';
    const tabId = sender.tab && sender.tab.id;
    const conversationContext = msg.conversationContext || []; // Get conversation context
    const hfModels = msg.hfModels || HF_MODELS; // Get Hugging Face models list
    const providerHandlers = {
      openai: () => askOpenAI({ apiKey, model, prompt: msg.question, tabId, conversationContext }),
      gemini: () => askGemini({ apiKey, model, prompt: msg.question, tabId, conversationContext }),
      huggingface: () => askHuggingFace({ apiKey, model, prompt: msg.question, tabId, conversationContext, hfModels })
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
  sendResponse({ok: true});
});