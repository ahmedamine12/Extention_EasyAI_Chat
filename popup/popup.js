// Language detection and localization
const browserLanguage = navigator.language || navigator.userLanguage || 'en';
const isFrench = browserLanguage.startsWith('fr');

// Localization strings
const translations = {
  en: {
    // Popup main content
    effortlessChat: 'Effortless AI chat, anywhere.',
    setUpApiKey: 'Set Up API Key & Settings',
    configureApiKeys: 'Configure your API keys to unlock chat features.',
    noApiKeyMsg: 'To start chatting, please set up your API key in Settings below.',
    instructions: '💡 The chat bubble will appear automatically on most pages if you have set up an API key. Use the button below to configure your API keys and settings.',
    
    // Settings modal
    settings: 'Settings',
    close: 'Close',
    privacyNote: 'Your API keys are stored only on your device and never leave your computer.',
    openaiApiKey: 'OpenAI API Key',
    enterOpenaiKey: 'Enter your OpenAI API key',
    getApiKey: 'Get your API key',
    geminiApiKey: 'Gemini API Key',
    enterGeminiKey: 'Enter your Gemini API key',
    save: 'Save',
    return: 'Return',
    settingsSaved: 'Settings saved!',
    
    // Settings page
    settingsTitle: 'EasyAI Chat Settings',
    provider: 'Provider:',
    apiKey: 'API Key:',
    enterApiKey: 'Enter your API key',
    model: 'Model:',
    modelPlaceholder: 'e.g. gpt-3.5-turbo or gemini-2.0-flash',
    darkMode: 'Dark Mode',
    enableChatHistory: 'Enable Chat History',
    saveSettings: 'Save Settings'
  },
  fr: {
    // Popup main content
    effortlessChat: 'Chat IA sans effort, partout.',
    setUpApiKey: 'Configurer la clé API et les paramètres',
    configureApiKeys: 'Configurez vos clés API pour débloquer les fonctionnalités de chat.',
    noApiKeyMsg: 'Pour commencer à discuter, veuillez configurer votre clé API dans les paramètres ci-dessous.',
    instructions: '💡 La bulle de chat apparaîtra automatiquement sur la plupart des pages si vous avez configuré une clé API. Utilisez le bouton ci-dessous pour configurer vos clés API et paramètres.',
    
    // Settings modal
    settings: 'Paramètres',
    close: 'Fermer',
    privacyNote: 'Vos clés API sont stockées uniquement sur votre appareil et ne quittent jamais votre ordinateur.',
    openaiApiKey: 'Clé API OpenAI',
    enterOpenaiKey: 'Entrez votre clé API OpenAI',
    getApiKey: 'Obtenir votre clé API',
    geminiApiKey: 'Clé API Gemini',
    enterGeminiKey: 'Entrez votre clé API Gemini',
    save: 'Enregistrer',
    return: 'Retour',
    settingsSaved: 'Paramètres enregistrés !',
    
    // Settings page
    settingsTitle: 'Paramètres EasyAI Chat',
    provider: 'Fournisseur :',
    apiKey: 'Clé API :',
    enterApiKey: 'Entrez votre clé API',
    model: 'Modèle :',
    modelPlaceholder: 'ex. gpt-3.5-turbo ou gemini-2.0-flash',
    darkMode: 'Mode sombre',
    enableChatHistory: 'Activer l\'historique des chats',
    saveSettings: 'Enregistrer les paramètres'
  }
};

// Get current language strings
const t = translations[isFrench ? 'fr' : 'en'];

// Helper function to translate text
function translate(key) {
  return t[key] || translations.en[key] || key;
}

document.addEventListener('DOMContentLoaded', function() {
  const popupApiKeyOpenAI = document.getElementById('popupApiKeyOpenAI');
  const popupApiKeyGemini = document.getElementById('popupApiKeyGemini');
  const popupSettingsForm = document.getElementById('popupSettingsForm');
  const popupSettingsStatus = document.getElementById('popupSettingsStatus');
  const toggleOpenAIEye = document.getElementById('toggleOpenAIEye');
  const toggleGeminiEye = document.getElementById('toggleGeminiEye');
  const openaiEyeShow = document.getElementById('openai-eye-show');
  const openaiEyeHide = document.getElementById('openai-eye-hide');
  const geminiEyeShow = document.getElementById('gemini-eye-show');
  const geminiEyeHide = document.getElementById('gemini-eye-hide');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const popupSaveBtn = document.getElementById('popupSaveBtn');
  const popupToast = document.getElementById('popupToast');

  // Enable Save button only if at least one API key is entered
  function updateSaveBtnState() {
    const hasKey = popupApiKeyOpenAI.value.trim() || popupApiKeyGemini.value.trim();
    popupSaveBtn.disabled = !hasKey;
  }
  popupApiKeyOpenAI.addEventListener('input', updateSaveBtnState);
  popupApiKeyGemini.addEventListener('input', updateSaveBtnState);
  updateSaveBtnState();

  // Load saved API keys on popup open
  chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
    popupApiKeyOpenAI.value = data.apiKey_openai || '';
    popupApiKeyGemini.value = data.apiKey_gemini || '';
    updateSaveBtnState();
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

  // Apply translations to HTML elements
  document.querySelector('p').textContent = translate('effortlessChat');
  document.getElementById('settingsBtn').textContent = translate('setUpApiKey');
  document.getElementById('settingsBtn').title = translate('configureApiKeys');
  document.getElementById('no-api-key-msg').innerHTML = `<b>${translate('noApiKeyMsg')}</b>`;
  document.querySelector('.instructions small').textContent = translate('instructions');
  
  // Settings modal translations
  document.querySelector('.settings-card h3').textContent = translate('settings');
  document.querySelector('.settings-modal-close').setAttribute('aria-label', translate('close'));
  document.querySelector('label[for="popupApiKeyOpenAI"]').textContent = translate('openaiApiKey');
  document.getElementById('popupApiKeyOpenAI').placeholder = translate('enterOpenaiKey');
  document.getElementById('popupApiKeyOpenAI').setAttribute('aria-label', translate('openaiApiKey'));
  document.getElementById('popupApiKeyLinkOpenAI').textContent = translate('getApiKey');
  document.querySelector('label[for="popupApiKeyGemini"]').textContent = translate('geminiApiKey');
  document.getElementById('popupApiKeyGemini').placeholder = translate('enterGeminiKey');
  document.getElementById('popupApiKeyGemini').setAttribute('aria-label', translate('geminiApiKey'));
  document.getElementById('popupApiKeyLinkGemini').textContent = translate('getApiKey');
  document.getElementById('popupSaveBtn').textContent = translate('save');
  document.querySelector('.settings-modal-close.secondary-btn').textContent = translate('return');

  // Add privacy note to settings UI
  const privacyNote = document.createElement('div');
  privacyNote.style.fontSize = '0.98em';
  privacyNote.style.color = '#888';
  privacyNote.style.margin = '10px 0 18px 0';
  privacyNote.style.textAlign = 'center';
  privacyNote.textContent = translate('privacyNote');
  const form = document.getElementById('popupSettingsForm');
  if (form) form.insertBefore(privacyNote, form.firstChild);

  popupSettingsForm.onsubmit = (e) => {
    e.preventDefault();
    const apiKeyOpenAI = popupApiKeyOpenAI.value;
    const apiKeyGemini = popupApiKeyGemini.value;
    chrome.storage.local.set({
      apiKey_openai: apiKeyOpenAI,
      apiKey_gemini: apiKeyGemini
    }, () => {
      popupSettingsStatus.textContent = '';
      // Show modern toast
      popupToast.innerHTML = `<span class="toast-icon">✔️</span>${translate('settingsSaved')}`;
      popupToast.style.display = 'block';
      popupToast.style.animation = 'none';
      // Restart animation
      void popupToast.offsetWidth;
      popupToast.style.animation = '';
      setTimeout(() => {
        popupToast.style.display = 'none';
      }, 2600);
    });
  };

  // Modal logic for settings
  if (settingsBtn && settingsModal) {
    settingsBtn.onclick = () => {
      settingsModal.style.display = 'block';
      setTimeout(() => {
        if (!popupApiKeyOpenAI.value) {
          popupApiKeyOpenAI.focus();
        } else {
          popupApiKeyGemini.focus();
        }
      }, 200);
    };
    // Close modal when clicking outside or pressing Escape
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (settingsModal.style.display === 'block' && e.key === 'Escape') {
        settingsModal.style.display = 'none';
      }
    });
    // All close/return buttons close the modal
    Array.from(settingsModal.querySelectorAll('.settings-modal-close')).forEach(btn => {
      btn.onclick = () => {
        settingsModal.style.display = 'none';
      };
    });
  }
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