document.addEventListener('DOMContentLoaded', function() {
  const popupApiKeyOpenAI = document.getElementById('popupApiKeyOpenAI');
  const popupApiKeyGemini = document.getElementById('popupApiKeyGemini');
  const popupSettingsForm = document.getElementById('popupSettingsForm');
  const popupSettingsStatus = document.getElementById('popupSettingsStatus');
  const toggleOpenAIEye = document.getElementById('toggleOpenAIEye');
  const toggleGeminiEye = document.getElementById('toggleGeminiEye');
  const popupSaveSuccess = document.getElementById('popupSaveSuccess');
  const openaiEyeShow = document.getElementById('openai-eye-show');
  const openaiEyeHide = document.getElementById('openai-eye-hide');
  const geminiEyeShow = document.getElementById('gemini-eye-show');
  const geminiEyeHide = document.getElementById('gemini-eye-hide');

  // Load saved API keys on popup open
  chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
    popupApiKeyOpenAI.value = data.apiKey_openai || '';
    popupApiKeyGemini.value = data.apiKey_gemini || '';
    // Auto-focus on first empty field
    if (!popupApiKeyOpenAI.value) {
      popupApiKeyOpenAI.focus();
    } else if (!popupApiKeyGemini.value) {
      popupApiKeyGemini.focus();
    }
  });

  // Show/hide API key logic with SVG toggle
  toggleOpenAIEye.onclick = function() {
    const show = popupApiKeyOpenAI.type === 'password';
    popupApiKeyOpenAI.type = show ? 'text' : 'password';
    openaiEyeShow.style.display = show ? 'none' : '';
    openaiEyeHide.style.display = show ? '' : 'none';
  };
  toggleGeminiEye.onclick = function() {
    const show = popupApiKeyGemini.type === 'password';
    popupApiKeyGemini.type = show ? 'text' : 'password';
    geminiEyeShow.style.display = show ? 'none' : '';
    geminiEyeHide.style.display = show ? '' : 'none';
  };

  popupSettingsForm.onsubmit = (e) => {
    e.preventDefault();
    const apiKeyOpenAI = popupApiKeyOpenAI.value;
    const apiKeyGemini = popupApiKeyGemini.value;
    console.log('Saving keys:', apiKeyOpenAI, apiKeyGemini);
    chrome.storage.local.set({
      apiKey_openai: apiKeyOpenAI,
      apiKey_gemini: apiKeyGemini
    }, () => {
      console.log('chrome.storage.local.set called');
      popupSettingsStatus.textContent = 'Settings saved!';
      popupSaveSuccess.style.display = 'inline-block';
      setTimeout(() => {
        popupSaveSuccess.style.display = 'none';
      }, 1200);
    });
  };
});

document.getElementById('open-bubble').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // Check if we can access this tab (chrome:// URLs are restricted)
    if (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('chrome-extension://')) {
      // Show error message for restricted URLs
      document.getElementById('open-bubble').textContent = 'Not available on this page';
      document.getElementById('open-bubble').style.background = '#ff4444';
      setTimeout(() => {
        document.getElementById('open-bubble').textContent = 'Open Chat Bubble';
        document.getElementById('open-bubble').style.background = '#4f8cff';
      }, 2000);
      return;
    }
    
    chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        const bubble = document.getElementById('mini-gpt-bubble');
        const chat = document.getElementById('mini-gpt-chat-container');
        if (bubble && chat) {
          chat.style.display = 'flex';
          // Also show a success message
          const successMsg = document.createElement('div');
          successMsg.textContent = 'Chat bubble opened!';
          successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4f8cff;color:#fff;padding:10px;border-radius:8px;z-index:999999;';
          document.body.appendChild(successMsg);
          setTimeout(() => successMsg.remove(), 2000);
        }
      }
    }).catch((error) => {
      console.error('Error opening chat bubble:', error);
      document.getElementById('open-bubble').textContent = 'Error opening chat';
      document.getElementById('open-bubble').style.background = '#ff4444';
      setTimeout(() => {
        document.getElementById('open-bubble').textContent = 'Open Chat Bubble';
        document.getElementById('open-bubble').style.background = '#4f8cff';
      }, 2000);
    });
  });
};

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const providerSelect = document.getElementById('providerSelect');
const modelSelect = document.getElementById('modelSelect');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyLink = document.getElementById('apiKeyLink');
const settingsStatus = document.getElementById('settingsStatus');
const chatSettingsForm = document.getElementById('chatSettingsForm');

const PROVIDER_MODELS = {
  openai: ['gpt-3.5-turbo'],
  gemini: ['gemini-2.0-flash']
};
const PROVIDER_API_LINKS = {
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey'
};

function showSettingsModal() {
  settingsModal.style.display = 'flex';
  settingsStatus.textContent = '';
}
function hideSettingsModal() {
  settingsModal.style.display = 'none';
}
function populateModelDropdown(provider) {
  modelSelect.innerHTML = '';
  PROVIDER_MODELS[provider].forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    opt.textContent = model;
    modelSelect.appendChild(opt);
  });
}
function updateApiKeyLink(provider) {
  apiKeyLink.href = PROVIDER_API_LINKS[provider];
  apiKeyLink.textContent = 'Get your API key';
}
// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['provider', 'model', 'apiKey'], (data) => {
    const provider = data.provider || 'openai';
    providerSelect.value = provider;
    populateModelDropdown(provider);
    modelSelect.value = data.model || PROVIDER_MODELS[provider][0];
    apiKeyInput.value = data.apiKey || '';
    updateApiKeyLink(provider);
  });
}
settingsBtn.onclick = () => {
  loadSettings();
  showSettingsModal();
};
cancelSettingsBtn.onclick = hideSettingsModal;
providerSelect.onchange = () => {
  populateModelDropdown(providerSelect.value);
  updateApiKeyLink(providerSelect.value);
};
chatSettingsForm.onsubmit = (e) => {
  e.preventDefault();
  const provider = providerSelect.value;
  const model = modelSelect.value;
  const apiKey = apiKeyInput.value;
  chrome.storage.local.set({ provider, model, apiKey }, () => {
    settingsStatus.textContent = 'Settings saved!';
    setTimeout(() => {
      settingsStatus.textContent = '';
      hideSettingsModal();
      // Optionally, update chat logic here to use new settings immediately
      // e.g., updateProvider(provider, model, apiKey);
    }, 1000);
  });
}; 