const browserLanguage = navigator.language || navigator.userLanguage || 'en';
const isFrench = browserLanguage.startsWith('fr');

const t = {
  apiKeys: isFrench ? 'Clés API' : 'API Keys',
  darkMode: isFrench ? 'Mode sombre' : 'Dark Mode',
  keysLocal: isFrench ? 'Clés stockées localement' : 'Keys stored locally',
  using: isFrench ? 'Utilise' : 'Using',
  save: isFrench ? 'Enregistrer' : 'Save',
  saving: isFrench ? 'Vérification...' : 'Validating...',
  saved: isFrench ? 'Enregistré !' : 'Saved!',
  validating: isFrench ? 'Vérification…' : 'Checking…',
  valid: isFrench ? 'Clé valide ✓' : 'Valid key ✓',
  invalid: isFrench ? 'Clé invalide ✗' : 'Invalid key ✗',
  noKeysToSave: isFrench ? 'Entrez au moins une clé' : 'Enter at least one key',
  voiceInput: isFrench ? 'Saisie vocale (micro)' : 'Voice input (mic)',
  speechLang: isFrench ? 'Langue vocale' : 'Speech language',
  speechLangBrowser: isFrench ? 'Langue du navigateur' : 'Browser default',
  voiceHint: isFrench
    ? 'Le micro passe par le navigateur. La lecture à voix haute reste sur l’appareil.'
    : 'Mic uses your browser. Read-aloud stays on your device.',
  floatingAssistant: isFrench ? 'Bouton flottant sur les pages' : 'Show floating button'
};

const providerConfig = globalThis.EASYAI_PROVIDER_CONFIG || {};
const providerNames = { openai: 'OpenAI', gemini: 'Gemini', huggingface: 'Hugging Face' };

document.addEventListener('DOMContentLoaded', () => {
  try {
    const ver = chrome.runtime.getManifest().version;
    const ev = document.getElementById('extVersion');
    if (ev) ev.textContent = 'v' + ver;
  } catch (_) {}

  // Translate
  document.getElementById('settingsBtnLabel').textContent = t.apiKeys;
  document.getElementById('darkModeLabel').textContent = t.darkMode;
  document.getElementById('privacyLabel').textContent = t.keysLocal;
  document.getElementById('settingsTitle').textContent = t.apiKeys;
  document.getElementById('saveBtn').textContent = t.save;
  document.getElementById('voiceInputLabel').textContent = t.voiceInput;
  document.getElementById('speechLangLabel').textContent = t.speechLang;
  document.getElementById('speechLangBrowser').textContent = t.speechLangBrowser;
  document.getElementById('voiceHint').textContent = t.voiceHint;
  document.getElementById('floatingAssistantLabel').textContent = t.floatingAssistant;

  // DOM
  const viewDashboard = document.getElementById('viewDashboard');
  const viewSettings = document.getElementById('viewSettings');
  const cards = document.querySelectorAll('.provider-card');
  const activeInfo = document.getElementById('activeInfo');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const voiceInputToggle = document.getElementById('voiceInputToggle');
  const speechLangSelect = document.getElementById('speechLangSelect');
  const floatingAssistantToggle = document.getElementById('floatingAssistantToggle');
  const toast = document.getElementById('toast');

  // View switching
  document.getElementById('showSettings').addEventListener('click', () => {
    viewDashboard.classList.add('hidden');
    viewSettings.classList.remove('hidden');
  });
  document.getElementById('backBtn').addEventListener('click', () => {
    viewSettings.classList.add('hidden');
    viewDashboard.classList.remove('hidden');
    loadDashboard(); // refresh dots after saving keys
  });

  // Eye toggles
  document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.querySelector('.eye-open').style.display = show ? 'none' : '';
      btn.querySelector('.eye-closed').style.display = show ? '' : 'none';
    });
  });

  // Load dashboard state
  function loadDashboard() {
    chrome.storage.local.get(
      [
        'provider',
        'apiKey_openai',
        'apiKey_gemini',
        'apiKey_huggingface',
        'darkMode',
        'voiceInputEnabled',
        'speechLang',
        'easyaiUiSuppressed'
      ],
      (data) => {
        const active = data.provider || 'openai';

        // Dots
        ['openai', 'gemini', 'huggingface'].forEach(p => {
          const dot = document.getElementById(`dot-${p}`);
          const key = data[`apiKey_${p}`];
          dot.classList.toggle('has-key', !!(key && key.trim()));
        });

        // Cards
        cards.forEach(c => c.classList.toggle('active', c.dataset.provider === active));

        // Active info
        const defaults = providerConfig.defaultModels || {};
        const model = (defaults[active] || '').split('/').pop();
        activeInfo.textContent = `${t.using}: ${providerNames[active]}${model ? ' · ' + model : ''}`;

        // Dark mode
        const isDark = data.darkMode === true || data.darkMode === 'true';
        applyPopupTheme(isDark);

        voiceInputToggle.checked = data.voiceInputEnabled === true;
        speechLangSelect.value = typeof data.speechLang === 'string' ? data.speechLang : '';
        floatingAssistantToggle.checked = data.easyaiUiSuppressed !== true;
      }
    );
  }

  // Load settings view
  function loadSettings() {
    chrome.storage.local.get(
      ['provider', 'apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'],
      (data) => {
        document.getElementById('key-openai').value = data.apiKey_openai || '';
        document.getElementById('key-gemini').value = data.apiKey_gemini || '';
        document.getElementById('key-huggingface').value = data.apiKey_huggingface || '';

        const active = data.provider || 'openai';
        const radio = document.querySelector(`input[name="activeProvider"][value="${active}"]`);
        if (radio) radio.checked = true;
      }
    );
  }

  // Click card to switch provider
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const provider = card.dataset.provider;
      chrome.storage.local.get([`apiKey_${provider}`], (data) => {
        const key = data[`apiKey_${provider}`];
        if (!key || !key.trim()) {
          // No key — go to settings
          viewDashboard.classList.add('hidden');
          viewSettings.classList.remove('hidden');
          loadSettings();
          document.getElementById(`key-${provider}`).focus();
          return;
        }
        chrome.storage.local.set({ provider }, () => {
          loadDashboard();
          notifyTabs();
        });
      });
    });
  });

  // Dark mode — apply to popup + sync to chat bubble
  function applyPopupTheme(dark) {
    document.body.classList.toggle('dark', dark);
    darkModeToggle.checked = dark;
  }

  darkModeToggle.addEventListener('change', () => {
    const dark = darkModeToggle.checked;
    applyPopupTheme(dark);
    chrome.storage.local.set({ darkMode: dark });
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'EASYAI_DARKMODE_UPDATED', darkMode: dark }).catch(() => {});
      });
    });
  });

  voiceInputToggle.addEventListener('change', () => {
    chrome.storage.local.set({ voiceInputEnabled: voiceInputToggle.checked });
  });

  speechLangSelect.addEventListener('change', () => {
    chrome.storage.local.set({ speechLang: speechLangSelect.value || '' });
  });

  floatingAssistantToggle.addEventListener('change', () => {
    const suppressed = !floatingAssistantToggle.checked;
    chrome.storage.local.set({ easyaiUiSuppressed: suppressed }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id == null) return;
          chrome.tabs
            .sendMessage(tab.id, { type: 'EASYAI_SET_UI_SUPPRESSED', suppressed })
            .catch(() => {});
        });
      });
    });
  });

  // --- API key validation functions ---
  async function validateOpenAI(apiKey) {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }
    return true;
  }

  async function validateGemini(apiKey) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }
    return true;
  }

  async function validateHuggingFace(apiKey) {
    const res = await fetch('https://huggingface.co/api/whoami-v2', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return true;
  }

  function setKeyStatus(provider, state, message) {
    const el = document.getElementById(`status-${provider}`);
    if (!el) return;
    el.className = 'key-status';
    if (state) el.classList.add(state);
    el.textContent = message || '';
  }

  // Save keys with validation
  document.getElementById('keysForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    const activeProvider = document.querySelector('input[name="activeProvider"]:checked')?.value || 'openai';
    const defaults = providerConfig.defaultModels || {};

    const keys = {
      openai: document.getElementById('key-openai').value.trim(),
      gemini: document.getElementById('key-gemini').value.trim(),
      huggingface: document.getElementById('key-huggingface').value.trim()
    };

    // Clear previous statuses
    ['openai', 'gemini', 'huggingface'].forEach(p => setKeyStatus(p, '', ''));

    // Check at least one key exists
    if (!keys.openai && !keys.gemini && !keys.huggingface) {
      toast.textContent = t.noKeysToSave;
      toast.className = 'toast toast-error show';
      setTimeout(() => toast.className = 'toast', 2500);
      return;
    }

    // Disable button during validation
    saveBtn.disabled = true;
    saveBtn.textContent = t.saving;

    // Validate all keys that have values
    const validators = {
      openai: validateOpenAI,
      gemini: validateGemini,
      huggingface: validateHuggingFace
    };

    const results = {};
    const promises = [];

    for (const [provider, key] of Object.entries(keys)) {
      if (!key) continue;
      setKeyStatus(provider, 'validating', t.validating);
      promises.push(
        validators[provider](key)
          .then(() => {
            results[provider] = true;
            setKeyStatus(provider, 'valid', t.valid);
          })
          .catch((err) => {
            results[provider] = false;
            const shortErr = err.message.length > 60 ? err.message.slice(0, 60) + '…' : err.message;
            setKeyStatus(provider, 'invalid', `${t.invalid} — ${shortErr}`);
          })
      );
    }

    await Promise.all(promises);

    // Save all keys (even invalid ones — user might fix later)
    chrome.storage.local.set({
      provider: activeProvider,
      apiKey_openai: keys.openai,
      apiKey_gemini: keys.gemini,
      apiKey_huggingface: keys.huggingface,
      model: defaults[activeProvider] || '',
      chatHistory: true
    }, () => {
      const anyValid = Object.values(results).some(v => v === true);
      const anyInvalid = Object.values(results).some(v => v === false);

      if (anyInvalid && !anyValid) {
        toast.textContent = isFrench ? 'Clés enregistrées — vérifiez les erreurs' : 'Keys saved — check errors above';
        toast.className = 'toast toast-error show';
      } else if (anyInvalid) {
        toast.textContent = isFrench ? 'Enregistré — certaines clés invalides' : 'Saved — some keys invalid';
        toast.className = 'toast toast-error show';
      } else {
        toast.textContent = t.saved;
        toast.className = 'toast show';
      }

      setTimeout(() => toast.className = 'toast', 3000);
      saveBtn.disabled = false;
      saveBtn.textContent = t.save;
      notifyTabs();
    });
  });

  function notifyTabs() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'EASYAI_APIKEY_UPDATED' }).catch(() => {});
      });
    });
  }

  // Init
  loadDashboard();
  loadSettings();
});
