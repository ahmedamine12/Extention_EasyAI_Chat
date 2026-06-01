const browserLanguage = navigator.language || navigator.userLanguage || 'en';

function resolveFrenchFromLocalePref(pref) {
  if (pref === 'fr') return true;
  if (pref === 'en') return false;
  return browserLanguage.startsWith('fr');
}

function normalizeUiLocale(v) {
  return v === 'en' || v === 'fr' ? v : '';
}

const messagesEn = {
  supportLink: 'Support BrowseMate',
  homeKicker: 'Get started',
  homeTitle: 'Chat with your own API keys',
  homeDesc:
    'Chat on any page with your own API keys. Use quick actions and right‑click tools. Keys stay on your device.',
  homeBullet1: 'Keys never leave your device',
  homeBullet2: 'Use right‑click actions on selected text',
  homeBullet3: 'Switch providers anytime',
  apiKeys: 'API Keys',
  behavior: 'Behavior',
  activeProvider: 'Active provider',
  openApiKeys: 'API Keys',
  openBehavior: 'Behavior',
  promptSettings: 'Prompt settings',
  promptSettingsDesc:
    'Saved locally. System instruction applies to right-click BrowseMate actions only. Messages you type in chat are sent as written (no extra prefix).',
  modelTier: 'Model quality',
  modelTierHelp: 'BrowseMate will automatically fall back if a model is unavailable for your key.',
  modelTierBalanced: 'Balanced (recommended)',
  modelTierFast: 'Fast',
  modelTierBest: 'Best',
  testModels: 'Test models',
  testModelsRunning: 'Testing…',
  testModelsOk: 'OK — using',
  testModelsFail: 'Could not find a working model for this key.',
  willUseTitle: 'Selected models',
  systemInstruction: 'System instruction (role)',
  promptPrefix: 'Reply style (right-click actions only)',
  promptPrefixHelp:
    'Only used when you run BrowseMate from the page right‑click menu on selected text. Describe tone or length (e.g. “Keep it short”). Avoid ambiguous words like “resume,” which models often read as a CV.',
  darkMode: 'Dark Mode',
  keysLocal: 'Keys stored locally',
  using: 'Using',
  save: 'Save',
  saving: 'Validating...',
  saved: 'Saved!',
  validating: 'Checking…',
  valid: 'Valid key ✓',
  invalid: 'Invalid key ✗',
  noKeysToSave: 'Enter at least one key',
  voiceInput: 'Voice input (mic)',
  extensionLang: 'Language',
  extensionLangBrowser: 'Browser default',
  extensionLangEnglish: 'English',
  extensionLangFrench: 'Français',
  voiceHint:
    'Controls BrowseMate’s language (chat, popup, and voice). Mic and read-aloud use the same language. Pick Browser default to follow your browser.',
  floatingAssistant: 'Show floating button',
  bubbleSize: 'Bubble size',
  privacyFooter: 'Keys local · on-device',
  dashboardProHint: 'Pick a provider, then open API Keys to connect it.',
  advancedPickProvider: 'Connect your first provider in API Keys to start chatting.',
  noProviderConnected: 'Not connected yet',
  toastKeysAllInvalid: 'Keys saved — check errors above',
  toastKeysSomeInvalid: 'Saved — some keys invalid'
};

const messagesFr = {
  supportLink: 'Soutenir BrowseMate',
  homeKicker: 'Bien démarrer',
  homeTitle: 'Discutez avec vos propres clés API',
  homeDesc:
    'Discutez sur n’importe quelle page avec vos propres clés API. Utilisez les actions rapides et le menu contextuel. Vos clés restent sur votre appareil.',
  homeBullet1: 'Les clés ne quittent jamais votre appareil',
  homeBullet2: 'Utilisez les actions du clic droit sur le texte sélectionné',
  homeBullet3: 'Changez de fournisseur à tout moment',
  apiKeys: 'Clés API',
  behavior: 'Préférences',
  activeProvider: 'Fournisseur actif',
  openApiKeys: 'Clés API',
  openBehavior: 'Préférences',
  promptSettings: 'Paramètres d’instructions',
  promptSettingsDesc:
    'Enregistré localement. L’instruction système s’applique uniquement aux actions BrowseMate du menu contextuel. Les messages saisis dans le chat sont envoyés tels quels (sans préfixe ajouté).',
  modelTier: 'Qualité du modèle',
  modelTierHelp: 'BrowseMate bascule automatiquement si un modèle n’est pas disponible pour votre clé.',
  modelTierBalanced: 'Équilibré (recommandé)',
  modelTierFast: 'Rapide',
  modelTierBest: 'Qualité maximale',
  testModels: 'Tester les modèles',
  testModelsRunning: 'Test…',
  testModelsOk: 'OK — modèle utilisé :',
  testModelsFail: 'Aucun modèle compatible trouvé pour cette clé.',
  willUseTitle: 'Modèles sélectionnés',
  systemInstruction: 'Instruction système (rôle)',
  promptPrefix: 'Style de réponse (menu contextuel seulement)',
  promptPrefixHelp:
    'Utilisé uniquement via le menu contextuel BrowseMate sur une sélection. Décrivez le ton ou la longueur souhaitée. Évitez des mots ambigus comme « resume » (souvent interprété comme un CV).',
  darkMode: 'Mode sombre',
  keysLocal: 'Clés stockées localement',
  using: 'Via',
  save: 'Enregistrer',
  saving: 'Vérification...',
  saved: 'Enregistré !',
  validating: 'Vérification…',
  valid: 'Clé valide ✓',
  invalid: 'Clé invalide ✗',
  noKeysToSave: 'Entrez au moins une clé',
  voiceInput: 'Saisie vocale (micro)',
  extensionLang: 'Langue',
  extensionLangBrowser: 'Langue du navigateur',
  extensionLangEnglish: 'Anglais',
  extensionLangFrench: 'Français',
  voiceHint:
    'Définit la langue de BrowseMate (chat, popup et voix). Le micro et la lecture vocale suivent le même choix. « Langue du navigateur » utilise la langue de votre navigateur.',
  floatingAssistant: 'Afficher le bouton flottant',
  bubbleSize: 'Taille du bouton',
  privacyFooter: 'Clés locales · sur l’appareil',
  dashboardProHint: 'Choisissez un service, puis ouvrez « Clés API » pour l’activer.',
  advancedPickProvider:
    'Connectez votre premier service dans « Clés API » pour commencer à discuter.',
  noProviderConnected: 'Aucun service connecté',
  toastKeysAllInvalid: 'Clés enregistrées — vérifiez les erreurs',
  toastKeysSomeInvalid: 'Enregistré — certaines clés invalides'
};

let t = messagesEn;

const providerConfig = globalThis.EASYAI_PROVIDER_CONFIG || {};
const providerHelpers = globalThis.EASYAI_PROVIDER_HELPERS || {};
const providerNames = { openai: 'OpenAI', gemini: 'Gemini', huggingface: 'Hugging Face' };

document.addEventListener('DOMContentLoaded', () => {
  try {
    const ver = chrome.runtime.getManifest().version;
    const ev = document.getElementById('extVersion');
    if (ev) ev.textContent = 'v' + ver;
  } catch (_) {}

  const dashboardProHintEl = document.getElementById('dashboardProHint');
  const viewDashboard = document.getElementById('viewDashboard');
  const viewSettings = document.getElementById('viewSettings');
  const dashboardProSection = document.getElementById('dashboardProSection');
  const voiceAdvancedBlock = document.getElementById('voiceAdvancedBlock');
  const cards = document.querySelectorAll('.provider-card'); // may be empty (simplified dashboard)
  const activeInfo = document.getElementById('activeInfo');
  const activeProviderLabel = document.getElementById('activeProviderLabel');
  const activeProviderName = document.getElementById('activeProviderName');
  const activeProviderIcon = document.getElementById('activeProviderIcon');
  const activeProviderDot = document.getElementById('activeProviderDot');
  const openApiKeysBtn = document.getElementById('openApiKeysBtn');
  const openBehaviorBtn = document.getElementById('openBehaviorBtn');
  const darkModeBtn = document.getElementById('darkModeBtn');
  const voiceInputToggle = document.getElementById('voiceInputToggle');
  const uiLocaleSelect = document.getElementById('uiLocaleSelect');
  const floatingAssistantToggle = document.getElementById('floatingAssistantToggle');
  const bubbleSizeRange = document.getElementById('bubbleSizeRange');
  const bubbleSizeValue = document.getElementById('bubbleSizeValue');
  const toast = document.getElementById('toast');
  const modelTierEl = document.getElementById('modelTier');
  const testModelsStatus = document.getElementById('testModelsStatus');
  const metaStatusEls = {
    openai: document.getElementById('meta-status-openai'),
    gemini: document.getElementById('meta-status-gemini'),
    huggingface: document.getElementById('meta-status-huggingface')
  };
  const metaModelEls = {
    openai: document.getElementById('meta-model-openai'),
    gemini: document.getElementById('meta-model-gemini'),
    huggingface: document.getElementById('meta-model-huggingface')
  };

  function clampBubbleSize(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return 64;
    return Math.max(48, Math.min(96, Math.round(n)));
  }

  function bubbleSizeToPercent(size) {
    const normalized = clampBubbleSize(size);
    const maxSize = 96;
    return Math.round((normalized / maxSize) * 100);
  }

  function renderBubbleSize(v) {
    const size = clampBubbleSize(v);
    if (bubbleSizeRange) bubbleSizeRange.value = String(size);
    if (bubbleSizeValue) bubbleSizeValue.textContent = `${bubbleSizeToPercent(size)}%`;
    return size;
  }

  function applyPopupTexts(localePref) {
    const pref = normalizeUiLocale(typeof localePref === 'string' ? localePref : '');
    t = resolveFrenchFromLocalePref(pref) ? messagesFr : messagesEn;
    document.getElementById('settingsTitle').textContent = t.apiKeys;
    document.getElementById('saveBtn').textContent = t.save;
    if (activeProviderLabel) activeProviderLabel.textContent = t.activeProvider;
    if (openApiKeysBtn) openApiKeysBtn.textContent = t.openApiKeys;
    if (openBehaviorBtn) openBehaviorBtn.textContent = t.openBehavior;
    document.getElementById('promptSettingsTitle').textContent = t.promptSettings;
    const promptSettingsDescEl = document.getElementById('promptSettingsDesc');
    if (promptSettingsDescEl) promptSettingsDescEl.textContent = t.promptSettingsDesc;
    const modelTierLabel = document.getElementById('modelTierLabel');
    const modelTierHelp = document.getElementById('modelTierHelp');
    const modelTierBalanced = document.getElementById('modelTierBalanced');
    const modelTierFast = document.getElementById('modelTierFast');
    const modelTierBest = document.getElementById('modelTierBest');
    if (modelTierLabel) modelTierLabel.textContent = t.modelTier;
    if (modelTierHelp) modelTierHelp.textContent = t.modelTierHelp;
    if (modelTierBalanced) modelTierBalanced.textContent = t.modelTierBalanced;
    if (modelTierFast) modelTierFast.textContent = t.modelTierFast;
    if (modelTierBest) modelTierBest.textContent = t.modelTierBest;
    document.getElementById('systemInstructionLabel').textContent = t.systemInstruction;
    document.getElementById('promptPrefixLabel').textContent = t.promptPrefix;
    const promptPrefixHelpEl = document.getElementById('promptPrefixHelp');
    if (promptPrefixHelpEl) promptPrefixHelpEl.textContent = t.promptPrefixHelp;
    document.getElementById('floatingAssistantLabel').textContent = t.floatingAssistant;
    const bubbleSizeLabel = document.getElementById('bubbleSizeLabel');
    if (bubbleSizeLabel) bubbleSizeLabel.textContent = t.bubbleSize;
    document.getElementById('privacyLabel').textContent = t.privacyFooter;
    if (dashboardProHintEl) dashboardProHintEl.textContent = t.dashboardProHint;
    document.getElementById('voiceInputLabel').textContent = t.voiceInput;
    document.getElementById('uiLocaleLabel').textContent = t.extensionLang;
    document.getElementById('uiLocaleBrowser').textContent = t.extensionLangBrowser;
    document.getElementById('uiLocaleEn').textContent = t.extensionLangEnglish;
    document.getElementById('uiLocaleFr').textContent = t.extensionLangFrench;
    document.getElementById('voiceHint').textContent = t.voiceHint;
    if (uiLocaleSelect) uiLocaleSelect.value = pref;

    const homeKicker = document.getElementById('homeKicker');
    const homeTitle = document.getElementById('homeTitle');
    const homeDesc = document.getElementById('homeDesc');
    const homeBullet1 = document.getElementById('homeBullet1');
    const homeBullet2 = document.getElementById('homeBullet2');
    const homeBullet3 = document.getElementById('homeBullet3');
    if (homeKicker) homeKicker.textContent = t.homeKicker;
    if (homeTitle) homeTitle.textContent = t.homeTitle;
    if (homeDesc) homeDesc.textContent = t.homeDesc;
    if (homeBullet1) homeBullet1.textContent = t.homeBullet1;
    if (homeBullet2) homeBullet2.textContent = t.homeBullet2;
    if (homeBullet3) homeBullet3.textContent = t.homeBullet3;

    const supportLink = document.getElementById('supportLink');
    const supportLinkText = document.getElementById('supportLinkText');
    if (supportLinkText) supportLinkText.textContent = t.supportLink;
    if (supportLink) {
      supportLink.title = t.supportLink;
      supportLink.setAttribute('aria-label', t.supportLink);
    }
  }

  applyPopupTexts('');
  chrome.storage.local.get(['browseMateUiLocale'], (data) => {
    const pref = normalizeUiLocale(typeof data.browseMateUiLocale === 'string' ? data.browseMateUiLocale : '');
    applyPopupTexts(pref);
  });

  // View switching (API Keys screen opened from provider cards or elsewhere)
  document.getElementById('backBtn').addEventListener('click', () => {
    viewSettings.classList.add('hidden');
    viewDashboard.classList.remove('hidden');
    loadDashboard(); // refresh dots after saving keys
  });

  function openSettings(whichTab) {
    viewDashboard.classList.add('hidden');
    viewSettings.classList.remove('hidden');
    loadSettings();
    setSettingsTab(whichTab === 'behavior' ? 'behavior' : 'keys');
  }

  if (openApiKeysBtn) openApiKeysBtn.addEventListener('click', () => openSettings('keys'));
  if (openBehaviorBtn) openBehaviorBtn.addEventListener('click', () => openSettings('behavior'));

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
        'browseMateUiLocale',
        'easyaiUiSuppressed',
        'bubbleSize',
        'browseMateDevMode'
      ],
      (data) => {
        const lpref = normalizeUiLocale(typeof data.browseMateUiLocale === 'string' ? data.browseMateUiLocale : '');
        applyPopupTexts(lpref);

        const active = data.provider || 'openai';
        const hasAnyKey = !!(
          (data.apiKey_openai && data.apiKey_openai.trim()) ||
          (data.apiKey_gemini && data.apiKey_gemini.trim()) ||
          (data.apiKey_huggingface && data.apiKey_huggingface.trim())
        );
        const activeConnected = hasAnyKey
          ? ((active && data[`apiKey_${active}`])
              ? active
              : (data.apiKey_openai ? 'openai' : data.apiKey_gemini ? 'gemini' : data.apiKey_huggingface ? 'huggingface' : active))
          : '';

        if (voiceAdvancedBlock) {
          voiceAdvancedBlock.classList.toggle('hidden', false);
        }

        // Simplified dashboard: show only the active provider when connected.
        if (activeProviderName) {
          activeProviderName.textContent = activeConnected ? (providerNames[activeConnected] || activeConnected) : t.noProviderConnected;
        }
        if (activeProviderIcon) {
          activeProviderIcon.textContent = activeConnected === 'huggingface' ? 'HF' : activeConnected === 'gemini' ? 'G' : activeConnected === 'openai' ? 'O' : '•';
          if (activeConnected) activeProviderIcon.setAttribute('data-provider', activeConnected);
          else activeProviderIcon.removeAttribute('data-provider');
        }
        if (activeProviderDot) {
          const key = activeConnected ? data[`apiKey_${activeConnected}`] : '';
          activeProviderDot.classList.toggle('has-key', !!(key && String(key).trim()));
        }

        if (dashboardProSection) dashboardProSection.classList.toggle('onboarding-empty', !hasAnyKey);
        if (openApiKeysBtn) openApiKeysBtn.classList.toggle('onboarding-cta', !hasAnyKey);

        if (!hasAnyKey) {
          activeInfo.textContent = t.advancedPickProvider;
        } else {
          const connectedProvider = activeConnected || active;
          const defaults = providerConfig.defaultModels || {};
          const model = (defaults[connectedProvider] || '').split('/').pop();
          activeInfo.textContent = `${t.using}: ${providerNames[connectedProvider] || connectedProvider}${model ? ' · ' + model : ''}`;
        }

        const isDark = data.darkMode === true || data.darkMode === 'true';
        applyPopupTheme(isDark);

        voiceInputToggle.checked = data.voiceInputEnabled === true;
        floatingAssistantToggle.checked = data.easyaiUiSuppressed !== true;
        renderBubbleSize(data.bubbleSize);
      }
    );
  }

  // Load settings view
  function loadSettings() {
    chrome.storage.local.get(
      [
        'provider',
        'apiKey_openai',
        'apiKey_gemini',
        'apiKey_huggingface',
        'modelTier',
        'lastWorkingModel_openai',
        'lastWorkingModel_gemini',
        'lastWorkingModel_huggingface',
        'systemInstruction',
        'promptPrefix',
        'bubbleSize',
        'browseMateDevMode'
      ],
      (data) => {
        document.getElementById('key-openai').value = data.apiKey_openai || '';
        document.getElementById('key-gemini').value = data.apiKey_gemini || '';
        document.getElementById('key-huggingface').value = data.apiKey_huggingface || '';
        const systemInstructionEl = document.getElementById('systemInstruction');
        const promptPrefixEl = document.getElementById('promptPrefix');
        if (systemInstructionEl) systemInstructionEl.value = data.systemInstruction || '';
        if (promptPrefixEl) promptPrefixEl.value = data.promptPrefix || '';
        if (modelTierEl) modelTierEl.value = data.modelTier || 'balanced';
        if (testModelsStatus) testModelsStatus.textContent = '';
        renderBubbleSize(data.bubbleSize);
        updateProviderMetaFromData(data);
      }
    );
  }

  function setMeta(provider, { state, statusText, modelText }) {
    const s = metaStatusEls[provider];
    const m = metaModelEls[provider];
    if (s) {
      s.className = 'key-meta-status';
      if (state === 'valid') s.classList.add('is-valid');
      else if (state === 'invalid') s.classList.add('is-invalid');
      else s.classList.add('is-missing');
      s.textContent = statusText || '';
    }
    if (m) {
      m.textContent = modelText || '';
      if (modelText) m.title = modelText;
    }
  }

  function updateProviderMetaFromData(data, validationResults) {
    const tier = getSelectedTier();
    const providers = ['openai', 'gemini', 'huggingface'];
    providers.forEach((p) => {
      const key = safeTrim(data && data[`apiKey_${p}`]);
      if (!key) {
        setMeta(p, { state: 'missing', statusText: 'Not set', modelText: '' });
        return;
      }
      const v =
        validationResults && Object.prototype.hasOwnProperty.call(validationResults, p)
          ? validationResults[p]
          : null;
      const state = v === false ? 'invalid' : v === true ? 'valid' : 'valid';
      const statusText = v === false ? 'Invalid' : v === true ? 'Valid' : 'Saved';
      const planned = choosePlannedModel(p, tier, data);
      const modelText = planned ? `Will use: ${planned}` : '';
      setMeta(p, { state, statusText, modelText });
    });
  }

  // Settings sections (opened from the main dashboard buttons)
  const sectionKeys = document.getElementById('settingsSectionKeys');
  const sectionBehavior = document.getElementById('settingsSectionBehavior');

  function setSettingsTab(which) {
    const isBehavior = which === 'behavior';
    if (sectionKeys) sectionKeys.classList.toggle('hidden', isBehavior);
    if (sectionBehavior) sectionBehavior.classList.toggle('hidden', !isBehavior);
    const st = document.getElementById('settingsTitle');
    if (st) st.textContent = isBehavior ? t.behavior : t.apiKeys;
  }

  // Click card to switch provider
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const provider = card.dataset.provider;
      chrome.storage.local.get(
        [
          'apiKey_openai',
          'apiKey_gemini',
          'apiKey_huggingface'
        ],
        (data) => {
          const key = data[`apiKey_${provider}`];
          if (!key || !key.trim()) {
            openSettings('keys');
            document.getElementById(`key-${provider}`).focus();
            return;
          }
          chrome.storage.local.set({ provider }, () => {
            loadDashboard();
            notifyTabs();
          });
        }
      );
    });
  });

  // Dark mode — apply to popup + sync to chat bubble
  function applyPopupTheme(dark) {
    document.body.classList.toggle('dark', dark);
    if (darkModeBtn) darkModeBtn.classList.toggle('is-dark', dark);
  }

  if (darkModeBtn) darkModeBtn.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
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

  uiLocaleSelect.addEventListener('change', () => {
    const v = normalizeUiLocale(uiLocaleSelect.value);
    applyPopupTexts(v);
    chrome.storage.local.set({ browseMateUiLocale: v });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.browseMateUiLocale) return;
    const pref = normalizeUiLocale(changes.browseMateUiLocale.newValue);
    applyPopupTexts(pref);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.bubbleSize) return;
    renderBubbleSize(changes.bubbleSize.newValue);
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

  if (bubbleSizeRange) {
    bubbleSizeRange.addEventListener('input', () => {
      const size = renderBubbleSize(bubbleSizeRange.value);
      chrome.storage.local.set({ bubbleSize: size });
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id == null) return;
          chrome.tabs
            .sendMessage(tab.id, { type: 'EASYAI_SET_BUBBLE_SIZE', size })
            .catch(() => {});
        });
      });
    });
  }

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

  const keyStatusClearTimers = { openai: null, gemini: null, huggingface: null };
  function scheduleClearKeyStatus(provider, ms) {
    if (!provider) return;
    try {
      if (keyStatusClearTimers[provider]) clearTimeout(keyStatusClearTimers[provider]);
    } catch (_) {}
    keyStatusClearTimers[provider] = setTimeout(() => {
      setKeyStatus(provider, '', '');
      keyStatusClearTimers[provider] = null;
    }, Math.max(800, Number(ms) || 0));
  }

  // Save keys with validation
  document.getElementById('keysForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');

    const keys = {
      openai: document.getElementById('key-openai').value.trim(),
      gemini: document.getElementById('key-gemini').value.trim(),
      huggingface: document.getElementById('key-huggingface').value.trim()
    };
    const modelTier = String(modelTierEl ? modelTierEl.value : 'balanced') || 'balanced';
    const systemInstruction = (document.getElementById('systemInstruction')?.value || '').trim();
    const promptPrefix = (document.getElementById('promptPrefix')?.value || '').trim();

    // Clear previous statuses
    ['openai', 'gemini', 'huggingface'].forEach(p => setKeyStatus(p, '', ''));

    const hasAnyKey = !!(keys.openai || keys.gemini || keys.huggingface);

    if (!hasAnyKey) {
      toast.textContent = t.noKeysToSave;
      toast.className = 'toast toast-error show';
      setTimeout(() => { toast.className = 'toast'; }, 2500);
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
            scheduleClearKeyStatus(provider, 3500);
          })
          .catch((err) => {
            results[provider] = false;
            const shortErr = err.message.length > 60 ? err.message.slice(0, 60) + '…' : err.message;
            setKeyStatus(provider, 'invalid', `${t.invalid} — ${shortErr}`);
            scheduleClearKeyStatus(provider, 9000);
          })
      );
    }

    await Promise.all(promises);

    // Save all keys (even invalid ones — user might fix later)
    chrome.storage.local.set({
      apiKey_openai: keys.openai,
      apiKey_gemini: keys.gemini,
      apiKey_huggingface: keys.huggingface,
      modelTier,
      systemInstruction,
      promptPrefix,
      browseMateDevMode: true,
      chatHistory: true
    }, () => {
      const anyValid = Object.values(results).some(v => v === true);
      const anyInvalid = Object.values(results).some(v => v === false);

      if (anyInvalid && !anyValid) {
        toast.textContent = t.toastKeysAllInvalid;
        toast.className = 'toast toast-error show';
      } else if (anyInvalid) {
        toast.textContent = t.toastKeysSomeInvalid;
        toast.className = 'toast toast-error show';
      } else {
        toast.textContent = t.saved;
        toast.className = 'toast show';
      }

      setTimeout(() => toast.className = 'toast', 3000);
      saveBtn.disabled = false;
      saveBtn.textContent = t.save;
      notifyTabs();

      // Update "Valid/Invalid" + planned model line per provider
      const dataForMeta = {
        apiKey_openai: keys.openai,
        apiKey_gemini: keys.gemini,
        apiKey_huggingface: keys.huggingface,
        modelTier,
        lastWorkingModel_openai: undefined,
        lastWorkingModel_gemini: undefined,
        lastWorkingModel_huggingface: undefined
      };
      updateProviderMetaFromData(dataForMeta, results);
    });
  });

  // Clear status immediately when the user edits a key.
  ['openai', 'gemini', 'huggingface'].forEach((p) => {
    const el = document.getElementById(`key-${p}`);
    if (!el) return;
    el.addEventListener('input', () => {
      try {
        if (keyStatusClearTimers[p]) clearTimeout(keyStatusClearTimers[p]);
      } catch (_) {}
      setKeyStatus(p, '', '');
    });
  });

  function notifyTabs() {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'EASYAI_APIKEY_UPDATED' }).catch(() => {});
      });
    });
  }

  function listCandidatesForProvider(provider, tier, config) {
    const t = tier === 'fast' || tier === 'best' ? tier : 'balanced';
    const models = (config && config.models && config.models[provider]) ? config.models[provider] : [];
    const pick = (ids) => ids.filter((x) => models.includes(x));
    if (provider === 'openai') {
      if (t === 'fast') return pick(['gpt-4o-mini', 'gpt-3.5-turbo']);
      if (t === 'best') return pick(['gpt-4o', 'o1-mini', 'gpt-4-turbo', 'gpt-4o-mini']);
      return pick(['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']);
    }
    if (provider === 'gemini') {
      if (t === 'fast') return pick(['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash']);
      if (t === 'best') return pick(['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash']);
      return pick(['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash', 'gemini-1.5-pro']);
    }
    return models.slice(0, 3);
  }

  async function testModelsForProvider(provider, apiKey, tier) {
    const candidates = listCandidatesForProvider(provider, tier, providerConfig);
    if (!candidates.length) return null;
    if (provider === 'openai') {
      // Use /v1/models listing to avoid token spend.
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      const ids = Array.isArray(data.data) ? data.data.map((m) => m && m.id).filter(Boolean) : [];
      return candidates.find((c) => ids.includes(c)) || null;
    }
    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      const ids = Array.isArray(data.models)
        ? data.models.map((m) => (m && m.name ? String(m.name).split('/').pop() : '')).filter(Boolean)
        : [];
      return candidates.find((c) => ids.includes(c)) || null;
    }
    return null;
  }

  function safeTrim(v) {
    return String(v || '').trim();
  }

  function getKeyFromInputs(provider) {
    const el = document.getElementById(`key-${provider}`);
    return el ? safeTrim(el.value) : '';
  }

  function getSelectedTier() {
    const tier = safeTrim(modelTierEl ? modelTierEl.value : 'balanced').toLowerCase();
    return tier === 'fast' || tier === 'best' ? tier : 'balanced';
  }

  function choosePlannedModel(provider, tier, data) {
    const last = safeTrim(data && data[`lastWorkingModel_${provider}`]);
    if (last) return last;
    if (provider === 'huggingface') {
      const base = (providerConfig.models && providerConfig.models.huggingface) ? providerConfig.models.huggingface : [];
      const t = tier === 'fast' || tier === 'best' ? tier : 'balanced';
      const fast = [
        'microsoft/Phi-3-mini-4k-instruct',
        'google/gemma-7b-it',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'Qwen/Qwen2.5-7B-Instruct',
        'meta-llama/Llama-3.1-8B-Instruct'
      ];
      const best = [
        'meta-llama/Llama-3.1-8B-Instruct',
        'Qwen/Qwen2.5-7B-Instruct',
        'mistralai/Mistral-7B-Instruct-v0.2',
        'google/gemma-7b-it',
        'microsoft/Phi-3-mini-4k-instruct'
      ];
      const desired = t === 'fast' ? fast : t === 'best' ? best : base;
      const first = desired.find((m) => base.includes(m));
      const d = (providerConfig.defaultModels || {}).huggingface;
      return safeTrim(first || d) || 'Hugging Face router';
    }
    const cands = listCandidatesForProvider(provider, tier, providerConfig);
    if (cands && cands.length) return cands[0];
    const d = (providerConfig.defaultModels || {})[provider];
    return safeTrim(d) || '';
  }

  // Keep planned model line up to date when tier changes (no network).
  if (modelTierEl) {
    modelTierEl.addEventListener('change', () => {
      chrome.storage.local.get(
        [
          'apiKey_openai',
          'apiKey_gemini',
          'apiKey_huggingface',
          'lastWorkingModel_openai',
          'lastWorkingModel_gemini',
          'lastWorkingModel_huggingface'
        ],
        (data) => updateProviderMetaFromData(data)
      );
    });
  }

  // Init
  loadDashboard();
  loadSettings();
  setSettingsTab('keys');
});
