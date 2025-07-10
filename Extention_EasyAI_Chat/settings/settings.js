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
    status.textContent = 'Settings saved!';
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
      model.placeholder = 'e.g. gpt-3.5-turbo';
    } else if (provider.value === 'gemini') {
      model.placeholder = 'e.g. gemini-2.0-flash';
    } else {
      model.placeholder = '';
    }
  });
}); 