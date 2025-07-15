// Language detection and localization
const browserLanguage = navigator.language || navigator.userLanguage || 'en';
const isFrench = browserLanguage.startsWith('fr');

// Localization strings
const translations = {
  en: {
    settingsTitle: 'EasyAI Chat Settings',
    effortlessChat: 'Effortless AI chat, anywhere.',
    provider: 'Provider:',
    apiKey: 'API Key:',
    enterApiKey: 'Enter your API key',
    model: 'Model:',
    modelPlaceholder: 'e.g. gpt-3.5-turbo or gemini-2.0-flash',
    openaiPlaceholder: 'e.g. gpt-3.5-turbo',
    geminiPlaceholder: 'e.g. gemini-2.0-flash',
    darkMode: 'Dark Mode',
    enableChatHistory: 'Enable Chat History',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved!',
    privacyNote: 'Your API keys are stored only on your device and never leave your computer.'
  },
  fr: {
    settingsTitle: 'Paramètres EasyAI Chat',
    effortlessChat: 'Chat IA sans effort, partout.',
    provider: 'Fournisseur :',
    apiKey: 'Clé API :',
    enterApiKey: 'Entrez votre clé API',
    model: 'Modèle :',
    modelPlaceholder: 'ex. gpt-3.5-turbo ou gemini-2.0-flash',
    openaiPlaceholder: 'ex. gpt-3.5-turbo',
    geminiPlaceholder: 'ex. gemini-2.0-flash',
    darkMode: 'Mode sombre',
    enableChatHistory: 'Activer l\'historique des chats',
    saveSettings: 'Enregistrer les paramètres',
    settingsSaved: 'Paramètres enregistrés !',
    privacyNote: 'Vos clés API sont stockées uniquement sur votre appareil et ne quittent jamais votre ordinateur.'
  }
};

// Get current language strings
const t = translations[isFrench ? 'fr' : 'en'];

// Helper function to translate text
function translate(key) {
  return t[key] || translations.en[key] || key;
}

// Utility: get and set settings in chrome.storage (or localStorage fallback)
const storage = {
  get: (keys) => {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, resolve);
      } else {
        // fallback for testing
        const result = {};
        keys.forEach(k => result[k] = localStorage.getItem(k));
        resolve(result);
      }
    });
  },
  set: (items) => {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(items, resolve);
      } else {
        // fallback for testing
        Object.entries(items).forEach(([k, v]) => localStorage.setItem(k, v));
        resolve();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Apply translations to HTML elements
  document.title = translate('settingsTitle');
  document.querySelector('h2').innerHTML = `EasyAI <span style='color:#10a37f;'>Chat</span> ${translate('settings')}`;
  document.querySelector('p').textContent = translate('effortlessChat');
  
  // Add privacy note
  const privacyNote = document.createElement('div');
  privacyNote.style.fontSize = '0.9em';
  privacyNote.style.color = '#888';
  privacyNote.style.margin = '10px 0 20px 0';
  privacyNote.style.textAlign = 'center';
  privacyNote.textContent = translate('privacyNote');
  document.querySelector('.settings-container').insertBefore(privacyNote, document.getElementById('settings-form'));
  
  // Form labels and placeholders
  document.querySelector('label[for="provider"]').textContent = translate('provider');
  document.querySelector('label[for="apiKey"]').textContent = translate('apiKey');
  document.getElementById('apiKey').placeholder = translate('enterApiKey');
  document.querySelector('label[for="model"]').textContent = translate('model');
  document.getElementById('model').placeholder = translate('modelPlaceholder');
  document.querySelector('label[for="darkMode"]').textContent = translate('darkMode');
  document.querySelector('label[for="chatHistory"]').textContent = translate('enableChatHistory');
  document.querySelector('button[type="submit"]').textContent = translate('saveSettings');
  
  const form = document.getElementById('settings-form');
  const status = document.getElementById('status');
  const provider = document.getElementById('provider');
  const apiKey = document.getElementById('apiKey');
  const model = document.getElementById('model');
  const darkMode = document.getElementById('darkMode');
  const chatHistory = document.getElementById('chatHistory');

  // Load settings
  const settings = await storage.get(['provider', 'apiKey', 'model', 'darkMode', 'chatHistory']);
  if (settings.provider) provider.value = settings.provider;
  if (settings.apiKey) apiKey.value = settings.apiKey;
  if (settings.model) model.value = settings.model;
  darkMode.checked = settings.darkMode === 'true' || settings.darkMode === true;
  chatHistory.checked = settings.chatHistory === 'true' || settings.chatHistory === true;

  // Save settings
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await storage.set({
      provider: provider.value,
      apiKey: apiKey.value,
      model: model.value,
      darkMode: darkMode.checked,
      chatHistory: chatHistory.checked
    });
    status.textContent = translate('settingsSaved');
    setTimeout(() => status.textContent = '', 1800);
    // Notify all tabs to update the chat bubble dynamically
    if (chrome && chrome.tabs && chrome.tabs.query && chrome.tabs.sendMessage) {
      chrome.tabs.query({}, function(tabs) {
        for (let tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { type: 'EASYAI_APIKEY_UPDATED' });
        }
      });
    }
  });

  // Optionally, update model placeholder based on provider
  provider.addEventListener('change', () => {
    if (provider.value === 'openai') {
      model.placeholder = translate('openaiPlaceholder');
    } else if (provider.value === 'gemini') {
      model.placeholder = translate('geminiPlaceholder');
    } else {
      model.placeholder = '';
    }
  });
}); 