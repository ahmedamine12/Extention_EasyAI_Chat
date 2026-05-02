// Prevent multiple injections
if (!window.__miniGptAgentInjected) {
  window.__miniGptAgentInjected = true;

  // Language detection and localization
  const browserLanguage = navigator.language || navigator.userLanguage || 'en';
  const isFrench = browserLanguage.startsWith('fr');
  
  // Localization strings
  const translations = {
    en: {
      // Header
      title: 'BrowseMate',
      dragToMove: 'Drag to move',
      showHistory: 'Show chat history',
      newChat: 'New Chat',
      closeChat: 'Close chat',
      
      // Input
      placeholder: 'Ask anything...',
      send: 'Send',
      quickActions: 'Quick Actions',
      
      // Quick Actions
      summarizePage: 'Summarize Page',
      explainPage: 'Explain Page',
      
      // Messages
      welcome: '👋 Welcome! This is BrowseMate. Ask anything, anytime.',
      noTextFound: 'No readable text found on this page.',
      pleaseSetApiKey: 'Please set your API key in the extension popup.',
      thinking: 'Mini-GPT is thinking',
      
      // History
      chatHistory: 'Chat History',
      searchConversations: 'Search conversations...',
      noHistoryYet: 'No history yet.',
      noConversationsFound: 'No conversations found.',
      messages: 'messages',
      current: 'Current',
      deleteConversation: 'Delete this conversation',
      clearAll: 'Clear All',
      
      // Errors
      errorOccurred: 'An error occurred. Please try again.',
      cannotBeUndone: 'This action cannot be undone.',
      cancel: 'Cancel',
      
      // Actions
      summarize: 'Summarize this page',
      explain: 'Explain this page',
      
      // Tooltips and Labels
      showHistoryTooltip: 'Show chat history (Ctrl+Shift+H)',
      showHistoryAria: 'Show chat history',
      newChatTooltip: 'New Chat',
      newChatAria: 'Start new chat',
      closeChatTooltip: 'Close chat',
      closeChatAria: 'Close chat',
      moreMenuTooltip: 'More actions',
      moreMenuAria: 'More: history, reminder, settings, copy conversation, theme',
      menuSettings: 'API & settings',
      menuSettingsAria: 'Open extension settings and API keys',
      menuCopyConversation: 'Copy conversation',
      menuCopyConversationAria: 'Copy entire conversation to clipboard',
      chatCopied: 'Conversation copied.',
      nothingToCopyChat: 'Nothing to copy yet.',
      copyConvYou: 'You',
      copyConvAssistant: 'Assistant',
      quickActionsTooltip: 'Quick Actions',
      quickActionsDisabledTooltip: "Quick actions aren't available on this page. Select and copy text, then paste it into BrowseMate.",
      
      // Provider
      currentProvider: 'Current provider: ',
      setApiKeyTooltip: 'Set your API key in Settings to enable this provider.',
      
      // Copy
      copyMessage: 'Copy message',
      
      // Selection toolbar
      toolbarExplain: 'Explain',
      toolbarSummarize: 'Summarize',
      toolbarCorrect: 'Correct',
      toolbarTranslate: 'Translate',
      replaceInField: 'Replace in field',
      replaceInFieldAria: 'Replace the selected text in the field with this answer',
      replaceDone: 'Replaced!',
      
      // Voice
      voiceInput: 'Voice input',
      voiceListening: 'Listening…',
      voiceNotSupported: 'Voice input is not supported in this browser.',
      voiceMicDenied: 'Microphone access was denied.',
      voiceNoSpeech: 'No speech detected. Try again.',
      voiceAborted: 'Voice input stopped.',
      voiceNetwork: 'Voice typing didn’t work. Try again.',
      readAloud: 'Read aloud',
      readAloudAria: 'Read this message aloud',
      readAloudPlaying: 'Reading aloud…',
      readAloudPlayingAria: 'Reading aloud',
      voicePrivacyHint: 'Dictation may use your browser’s speech service (e.g. Google in Chrome).',
      voiceDismiss: 'Dismiss',

      // Screenshot / vision
      screenshotPage: 'Screenshot tab',
      screenshotAria: 'Attach a screenshot of the visible tab',
      visionCapturing: 'Capturing…',
      visionCaptureFailed: 'Could not capture the tab.',
      visionPendingLabel: 'Screenshot attached',
      visionRemove: 'Remove screenshot',
      visionDefaultAsk: 'What do you see? Answer briefly.',
      visionProviderOnly: 'Screenshots are available with OpenAI or Gemini. Switch provider or use text only.',

      // Reminders
      reminderBtnTitle: 'Set a reminder',
      reminderBtnAria: 'Set a reminder',
      reminderModalTitle: 'Reminder',
      reminderTitleLabel: 'Title',
      reminderTitlePlaceholder: 'What to remember',
      reminderNoteLabel: 'Note (optional)',
      reminderNotePlaceholder: 'Details…',
      reminderWhenLabel: 'When',
      reminderPreset15m: 'In 15 min',
      reminderPreset1h: 'In 1 hour',
      reminderPreset3h: 'In 3 hours',
      reminderPresetTomorrow: 'Tomorrow 9:00',
      reminderSchedule: 'Schedule',
      reminderScheduled: 'Reminder scheduled.',
      reminderInvalidTime: 'Check the title and date/time.',
      reminderDismiss: 'Got it'
    },
    fr: {
      // Header
      title: 'BrowseMate',
      dragToMove: 'Glisser pour déplacer',
      showHistory: 'Afficher l\'historique',
      newChat: 'Nouveau chat',
      closeChat: 'Fermer le chat',
      
      // Input
      placeholder: 'Posez votre question...',
      send: 'Envoyer',
      quickActions: 'Actions rapides',
      
      // Quick Actions
      summarizePage: 'Résumer la page',
      explainPage: 'Expliquer la page',
      
      // Messages
      welcome: '👋 Bienvenue ! Voici BrowseMate. Posez vos questions à tout moment.',
      noTextFound: 'Aucun texte lisible trouvé sur cette page.',
      pleaseSetApiKey: 'Veuillez configurer votre clé API dans le popup de l\'extension.',
      thinking: 'Mini-GPT réfléchit',
      
      // History
      chatHistory: 'Historique des chats',
      searchConversations: 'Rechercher des conversations...',
      noHistoryYet: 'Aucun historique pour le moment.',
      noConversationsFound: 'Aucune conversation trouvée.',
      messages: 'messages',
      current: 'Actuel',
      deleteConversation: 'Supprimer cette conversation',
      clearAll: 'Tout effacer',
      
      // Errors
      errorOccurred: 'Une erreur s\'est produite. Veuillez réessayer.',
      cannotBeUndone: 'Cette action ne peut pas être annulée.',
      cancel: 'Annuler',
      
      // Actions
      summarize: 'Résumer cette page',
      explain: 'Expliquer cette page',
      
      // Tooltips and Labels
      showHistoryTooltip: 'Afficher l\'historique (Ctrl+Shift+H)',
      showHistoryAria: 'Afficher l\'historique',
      newChatTooltip: 'Nouveau chat',
      newChatAria: 'Commencer un nouveau chat',
      closeChatTooltip: 'Fermer le chat',
      closeChatAria: 'Fermer le chat',
      moreMenuTooltip: 'Plus d’actions',
      moreMenuAria: 'Plus : historique, rappel, réglages, copier la conversation, thème',
      menuSettings: 'API et réglages',
      menuSettingsAria: 'Ouvrir les réglages et les clés API',
      menuCopyConversation: 'Copier la conversation',
      menuCopyConversationAria: 'Copier toute la conversation dans le presse-papiers',
      chatCopied: 'Conversation copiée.',
      nothingToCopyChat: 'Rien à copier pour l’instant.',
      copyConvYou: 'Vous',
      copyConvAssistant: 'Assistant',
      quickActionsTooltip: 'Actions rapides',
      quickActionsDisabledTooltip: 'Les actions rapides ne sont pas disponibles sur cette page. Sélectionnez et copiez du texte, puis collez-le dans BrowseMate.',
      
      // Provider
      currentProvider: 'Fournisseur actuel : ',
      setApiKeyTooltip: 'Configurez votre clé API dans les paramètres pour activer ce fournisseur.',
      
      // Copy
      copyMessage: 'Copier le message',
      
      // Selection toolbar
      toolbarExplain: 'Expliquer',
      toolbarSummarize: 'Résumer',
      toolbarCorrect: 'Corriger',
      toolbarTranslate: 'Traduire',
      replaceInField: 'Remplacer dans le champ',
      replaceInFieldAria: 'Remplacer le texte sélectionné dans le champ par cette réponse',
      replaceDone: 'Remplacé !',
      
      // Voice
      voiceInput: 'Saisie vocale',
      voiceListening: 'Écoute…',
      voiceNotSupported: 'La saisie vocale n’est pas prise en charge dans ce navigateur.',
      voiceMicDenied: 'Accès au microphone refusé.',
      voiceNoSpeech: 'Aucune parole détectée. Réessayez.',
      voiceAborted: 'Saisie vocale arrêtée.',
      voiceNetwork: 'La dictée n’a pas fonctionné. Réessayez.',
      readAloud: 'Lire à voix haute',
      readAloudAria: 'Lire ce message à voix haute',
      readAloudPlaying: 'Lecture en cours…',
      readAloudPlayingAria: 'Lecture en cours',
      voicePrivacyHint: 'La dictée peut utiliser le service vocal du navigateur (p. ex. Google dans Chrome).',
      voiceDismiss: 'Fermer',

      screenshotPage: 'Capture d’écran',
      screenshotAria: 'Joindre une capture de l’onglet visible',
      visionCapturing: 'Capture…',
      visionCaptureFailed: 'Impossible de capturer l’onglet.',
      visionPendingLabel: 'Capture jointe',
      visionRemove: 'Retirer la capture',
      visionDefaultAsk: 'Que voyez-vous ? Répondez brièvement.',
      visionProviderOnly: 'La capture d’écran est disponible avec OpenAI ou Gemini. Changez de fournisseur ou utilisez le texte seul.',

      reminderBtnTitle: 'Rappel',
      reminderBtnAria: 'Programmer un rappel',
      reminderModalTitle: 'Rappel',
      reminderTitleLabel: 'Titre',
      reminderTitlePlaceholder: 'À retenir',
      reminderNoteLabel: 'Note (optionnel)',
      reminderNotePlaceholder: 'Détails…',
      reminderWhenLabel: 'Quand',
      reminderPreset15m: 'Dans 15 min',
      reminderPreset1h: 'Dans 1 h',
      reminderPreset3h: 'Dans 3 h',
      reminderPresetTomorrow: 'Demain 9:00',
      reminderSchedule: 'Programmer',
      reminderScheduled: 'Rappel programmé.',
      reminderInvalidTime: 'Vérifiez le titre et la date/heure.',
      reminderDismiss: 'Compris'
    }
  };
  
  // Get current language strings
  const t = translations[isFrench ? 'fr' : 'en'];
  
  // Helper function to translate text
  function translate(key) {
    return t[key] || translations.en[key] || key;
  }

  const providerConfig = globalThis.EASYAI_PROVIDER_CONFIG || {};
  const providerHelpers = globalThis.EASYAI_PROVIDER_HELPERS || {};
  const pageHelpers = globalThis.EASYAI_PAGE_HELPERS || {};
  const API_KEY_FIELDS = providerHelpers.getApiKeyFields
    ? providerHelpers.getApiKeyFields()
    : (providerConfig.apiKeyFields || ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface']);
  const DEFAULT_PROMPT_PREFIX = providerConfig.defaultPromptPrefix || 'Give a short, direct answer. Be concise. ';

  function isLoginOrAuthPage() {
    if (pageHelpers.isLoginOrAuthPage) {
      return pageHelpers.isLoginOrAuthPage();
    }
    return false;
  }

  function hasAnyApiKey(settings) {
    if (providerHelpers.hasAnyApiKey) {
      return providerHelpers.hasAnyApiKey(settings);
    }
    return API_KEY_FIELDS.some((field) => settings[field] && settings[field].trim());
  }

  function getProviderKeys(callback) {
    chrome.storage.local.get(API_KEY_FIELDS, callback);
  }

  const bubble = document.createElement('div');
  bubble.id = 'mini-gpt-bubble';
  bubble.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="BrowseMate" style="width:58px; height:58px; border-radius:0; pointer-events:none; object-fit:contain;">
    <div class="tooltip">BrowseMate</div>
  `;
  bubble.style.position = 'fixed';
  bubble.style.right = '32px';
  bubble.style.bottom = '32px';
  bubble.style.left = '';
  bubble.style.top = '';
  bubble.style.zIndex = '999999';
  bubble.style.pointerEvents = 'auto';
  
  const originalBubblePosition = { bottom: '32px', right: '32px' };
  bubble.style.width = '64px';
  bubble.style.height = '64px';
  bubble.style.background = 'none';
  bubble.style.borderRadius = '0';
  bubble.style.border = 'none';
  bubble.style.boxShadow = 'none';
  bubble.style.overflow = 'visible';
  bubble.style.display = 'flex';
  bubble.style.alignItems = 'center';
  bubble.style.justifyContent = 'center';
  bubble.style.cursor = 'pointer';
  bubble.style.userSelect = 'none';
  bubble.style.transition = 'box-shadow 0.2s, transform 0.3s ease-out, opacity 0.2s';
  bubble.style.opacity = '0';
  bubble.style.transform = 'scale(0.8) translateY(20px)';
  bubble.style.display = 'none';
  

  // Chat UI
  const chatContainer = document.createElement('div');
  chatContainer.id = 'mini-gpt-chat-container';
  chatContainer.style.display = 'none';
  chatContainer.style.position = 'fixed';
  chatContainer.style.right = '32px';
  chatContainer.style.bottom = '108px';
  chatContainer.style.left = '';
  chatContainer.style.top = '';
  chatContainer.style.zIndex = '999999';
  chatContainer.style.visibility = 'hidden';
  chatContainer.style.opacity = '0';
  
  // Draggable functionality variables
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialX = 0;
  let initialY = 0;
  let currentX = 0;
  let currentY = 0;
  
  // Bubble drag variables
  let isBubbleDragging = false;
  let bubbleDragStartX = 0;
  let bubbleDragStartY = 0;
  let bubbleInitialX = 0;
  let bubbleInitialY = 0;
  let bubbleCurrentX = 0;
  let bubbleCurrentY = 0;
  let bubbleDragDistance = 0;
  let bubbleWasDragged = false;
  /** When true, user hid the assistant; do not auto-show bubble until they use the shortcut or popup. */
  let easyaiUiSuppressed = false;

  function showBubble() {
    if (easyaiUiSuppressed) return;
    // Don't show bubble on login/authorization pages
    if (isLoginOrAuthPage()) {
      return;
    }
    
    getProviderKeys((data) => {
      const hasKey = hasAnyApiKey(data);
      if (!hasKey) return; // Don't show bubble if no API key
      
      bubble.style.transition = 'none';
      bubble.style.display = 'flex';
      bubble.style.visibility = 'visible';
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1) translateY(0)';
      
      // Re-enable transitions after a brief moment for future interactions
      requestAnimationFrame(() => {
        bubble.style.transition = 'box-shadow 0.2s, background 0.3s, color 0.3s, transform 0.3s ease-out, opacity 0.2s';
      });
    });
  }
  
  function showBubbleInstant() {
    if (easyaiUiSuppressed) return;
    // Don't show bubble on login/authorization pages
    if (isLoginOrAuthPage()) {
      return;
    }
    
    getProviderKeys((data) => {
      const hasKey = hasAnyApiKey(data);
      if (!hasKey) return; // Don't show bubble if no API key
      
      // For immediate visibility without any transitions
      bubble.style.transition = 'none';
      bubble.style.display = 'flex';
      bubble.style.visibility = 'visible';
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1) translateY(0)';
    });
  }
  
  function hideBubble() {
    bubble.style.display = 'none';
    bubble.style.visibility = 'hidden';
  }
  
  function syncBubbleVisibility() {
    if (easyaiUiSuppressed) {
      hideBubble();
      return;
    }
    const isChatVisible = chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible';
    if (isChatVisible) {
      hideBubble();
    } else {
      // Only show bubble if API key is available
      getProviderKeys((data) => {
        const hasKey = hasAnyApiKey(data);
        if (hasKey) {
          showBubble();
        }
      });
    }
  }

  chatContainer.innerHTML = `
    <div class="mini-gpt-header mini-gpt-header-modern">
      <div class="mini-gpt-header-title">
        <img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="${translate('title')}" class="mini-gpt-header-logo">
        <span class="mini-gpt-header-text"><span class="brand-browse">Browse</span><span class="brand-accent">Mate</span></span>
        <span class="mini-gpt-drag-indicator" title="${translate('dragToMove')}">⋮⋮</span>
      </div>
      <div class="mini-gpt-actions-bar">
        <button class="mini-gpt-action-btn" id="mini-gpt-history-btn" title="${translate('showHistory')}" aria-label="${translate('showHistory')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 12 3 16 7 16"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-newchat-btn" title="${translate('newChat')}" aria-label="${translate('newChat')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-darkmode-btn" title="Toggle dark mode" aria-label="Toggle dark mode">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-close" title="${translate('closeChat')}" aria-label="${translate('closeChat')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div id="mini-gpt-provider-row" class="mini-gpt-provider-row-enhanced"></div>
    <div id="mini-gpt-messages" class="mini-gpt-messages-enhanced"></div>
    <form id="mini-gpt-form" class="mini-gpt-form-enhanced" style="position:relative;display:flex;flex-wrap:wrap;align-items:flex-end;gap:8px;">
      <div id="mini-gpt-vision-pending" class="mini-gpt-vision-pending" style="display:none;width:100%;"></div>
      <div id="mini-gpt-voice-status" class="mini-gpt-voice-status" role="status" aria-live="polite" style="display:none;"></div>
      <div class="mini-gpt-input-wrap" style="flex:1;display:flex;align-items:flex-end;gap:6px;min-width:0;">
      <textarea id="mini-gpt-input" class="mini-gpt-input-enhanced" placeholder="${translate('placeholder')}" autocomplete="off" rows="1" style="flex:1;min-width:0;"></textarea>
      <button type="button" id="mini-gpt-screenshot-btn" class="mini-gpt-screenshot-btn" title="${translate('screenshotPage')}" aria-label="${translate('screenshotAria')}" style="display:flex;flex-shrink:0;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;width:40px;height:40px;align-items:center;justify-content:center;cursor:pointer;padding:0;color:var(--browsemate-browse);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
      </button>
      <button type="button" id="mini-gpt-voice-btn" class="mini-gpt-voice-btn" title="${translate('voiceInput')}" aria-label="${translate('voiceInput')}" style="display:none;flex-shrink:0;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;width:40px;height:40px;align-items:center;justify-content:center;cursor:pointer;padding:0;color:var(--browsemate-browse);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </button>
      </div>
      <button type="submit" class="mini-gpt-send-btn" aria-label="${translate('send')}" style="background: var(--browsemate-browse); border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; flex-shrink:0;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
      <button id="mini-gpt-quick-actions-btn" type="button" title="${translate('quickActions')}" aria-label="${translate('quickActions')}" style="background:none;border:none;padding:4px 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--browsemate-browse);position:relative;flex-shrink:0;">
        <span style="font-size:20px;">⚡</span>
      </button>
    </form>
  `;

  // Provider selector row with logos
  const providerRow = chatContainer.querySelector('#mini-gpt-provider-row');
  providerRow.innerHTML = `
    <div class="mini-gpt-provider-dropdown" tabindex="0" aria-haspopup="listbox" aria-expanded="false">
      <button class="mini-gpt-provider-selected" id="miniGptProviderBtn" aria-label="Select provider">
        <span class="mini-gpt-provider-icon" id="miniGptProviderIcon"></span>
        <span id="miniGptProviderLabel"></span>
        <svg class="mini-gpt-provider-arrow" width="18" height="18" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      </button>
      <ul class="mini-gpt-provider-options" id="miniGptProviderList" tabindex="-1" role="listbox" hidden>
        <li class="mini-gpt-provider-option" data-provider="openai" role="option">
          <span class="mini-gpt-provider-icon openai"></span>
          <span>OpenAI</span>
        </li>
        <li class="mini-gpt-provider-option" data-provider="gemini" role="option">
          <span class="mini-gpt-provider-icon gemini"></span>
          <span>Gemini</span>
        </li>
        <li class="mini-gpt-provider-option" data-provider="huggingface" role="option">
          <span class="mini-gpt-provider-icon huggingface"></span>
          <span>Hugging Face</span>
        </li>
      </ul>
    </div>
  `;

  // Custom dropdown logic
  const providerDropdown = providerRow.querySelector('.mini-gpt-provider-dropdown');
  const providerBtn = providerRow.querySelector('#miniGptProviderBtn');
  const providerList = providerRow.querySelector('#miniGptProviderList');
  const providerLabel = providerRow.querySelector('#miniGptProviderLabel');
  const providerIcon = providerRow.querySelector('#miniGptProviderIcon');
  let currentProvider = 'openai';

  function setProviderUI(provider) {
    currentProvider = provider;
    const providerNames = {
      'openai': 'OpenAI',
      'gemini': 'Gemini',
      'huggingface': 'Hugging Face'
    };
    providerLabel.textContent = providerNames[provider] || provider;
    providerIcon.className = 'mini-gpt-provider-icon ' + provider;
    providerBtn.setAttribute('aria-label', translate('currentProvider') + providerLabel.textContent);
    // Highlight selected in list
    providerList.querySelectorAll('.mini-gpt-provider-option').forEach(opt => {
      opt.setAttribute('aria-selected', opt.dataset.provider === provider ? 'true' : 'false');
    });
    queueMicrotask(() => {
      if (typeof syncVisionScreenshotAvailability === 'function') syncVisionScreenshotAvailability();
    });
  }

  // API key check and enable/disable
  function updateProviderDropdown() {
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface', 'provider'], (data) => {
      const openaiKey = data.apiKey_openai;
      const geminiKey = data.apiKey_gemini;
      const huggingfaceKey = data.apiKey_huggingface;
      // Disable options without API key
      const openaiOption = providerList.querySelector('.mini-gpt-provider-option[data-provider="openai"]');
      const geminiOption = providerList.querySelector('.mini-gpt-provider-option[data-provider="gemini"]');
      const huggingfaceOption = providerList.querySelector('.mini-gpt-provider-option[data-provider="huggingface"]');
      openaiOption.classList.toggle('disabled', !openaiKey);
      geminiOption.classList.toggle('disabled', !geminiKey);
      huggingfaceOption.classList.toggle('disabled', !huggingfaceKey);
      openaiOption.title = openaiKey ? '' : translate('setApiKeyTooltip');
      // Add warning for Gemini free tier limits
      geminiOption.title = geminiKey ? 
        'Gemini free tier has strict rate limits. Consider OpenAI for better reliability.' : 
        translate('setApiKeyTooltip');
      huggingfaceOption.title = huggingfaceKey ? '' : translate('setApiKeyTooltip');
      // Set current provider
      let provider = data.provider || (openaiKey ? 'openai' : geminiKey ? 'gemini' : huggingfaceKey ? 'huggingface' : 'openai');
      if (!data[`apiKey_${provider}`]) provider = openaiKey ? 'openai' : geminiKey ? 'gemini' : huggingfaceKey ? 'huggingface' : 'openai';
      setProviderUI(provider);
      // Disable button if no key
      providerBtn.disabled = !data[`apiKey_${provider}`];
    });
  }

  // Dropdown open/close
  function openDropdown() {
    providerList.hidden = false;
    providerDropdown.setAttribute('aria-expanded', 'true');
    providerList.focus();
  }
  function closeDropdown() {
    providerList.hidden = true;
    providerDropdown.setAttribute('aria-expanded', 'false');
  }
  providerBtn.onclick = (e) => {
    e.stopPropagation();
    if (providerList.hidden) openDropdown(); else closeDropdown();
  };
  providerDropdown.onblur = closeDropdown;
  document.addEventListener('click', (e) => {
    if (!providerDropdown.contains(e.target)) closeDropdown();
  });
  providerList.onkeydown = (e) => {
    if (e.key === 'Escape') closeDropdown();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const opts = Array.from(providerList.querySelectorAll('.mini-gpt-provider-option:not(.disabled)'));
      let idx = opts.findIndex(opt => opt.getAttribute('aria-selected') === 'true');
      if (e.key === 'ArrowDown') idx = (idx + 1) % opts.length;
      if (e.key === 'ArrowUp') idx = (idx - 1 + opts.length) % opts.length;
      opts[idx].focus();
    }
    if (e.key === 'Enter') {
      const focused = document.activeElement;
      if (focused.classList.contains('mini-gpt-provider-option') && !focused.classList.contains('disabled')) {
        focused.click();
      }
    }
  };
  providerList.querySelectorAll('.mini-gpt-provider-option').forEach(opt => {
    opt.tabIndex = 0;
    opt.onclick = () => {
      if (opt.classList.contains('disabled')) return;
      const provider = opt.dataset.provider;
      chrome.storage.local.set({ provider }, () => {
        setProviderUI(provider);
        closeDropdown();
        updateProviderUI();
      });
    };
    opt.onkeydown = (e) => {
      if (e.key === 'Enter' && !opt.classList.contains('disabled')) opt.click();
    };
  });
  updateProviderDropdown();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.apiKey_openai || changes.apiKey_gemini || changes.apiKey_huggingface || changes.provider)) {
      updateProviderDropdown();
    }
  });

  function safeScrollIntoView(el, options) {
    try {
      if (!el || typeof el.scrollIntoView !== 'function') return;
      if (!el.isConnected) return;
      el.scrollIntoView(options);
    } catch (_) { /* detached node, extension reload, etc. */ }
  }

  // Handle chat
  const messagesDiv = chatContainer.querySelector('#mini-gpt-messages');
  const form = chatContainer.querySelector('#mini-gpt-form');
  const input = chatContainer.querySelector('#mini-gpt-input');
  const voiceBtn = chatContainer.querySelector('#mini-gpt-voice-btn');
  const voiceStatusEl = chatContainer.querySelector('#mini-gpt-voice-status');
  const visionPendingEl = chatContainer.querySelector('#mini-gpt-vision-pending');
  const screenshotBtn = chatContainer.querySelector('#mini-gpt-screenshot-btn');
  let pendingVision = null;
  const VISION_MAX_SIDE = providerConfig.visionMaxImageSide || 1280;
  let voiceStatusTimer = null;

  function downscaleDataUrl(dataUrl, maxSide, quality) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const scale = Math.min(1, maxSide / Math.max(w, h, 1));
          const tw = Math.max(1, Math.round(w * scale));
          const th = Math.max(1, Math.round(h * scale));
          const c = document.createElement('canvas');
          c.width = tw;
          c.height = th;
          c.getContext('2d').drawImage(img, 0, 0, tw, th);
          const out = c.toDataURL('image/jpeg', quality);
          const comma = out.indexOf(',');
          resolve({ base64: comma >= 0 ? out.slice(comma + 1) : '', mime: 'image/jpeg' });
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('image'));
      img.src = dataUrl;
    });
  }

  function renderVisionPending() {
    if (!visionPendingEl) return;
    if (!pendingVision || !pendingVision.base64) {
      visionPendingEl.style.display = 'none';
      visionPendingEl.replaceChildren();
      return;
    }
    visionPendingEl.style.display = 'flex';
    visionPendingEl.replaceChildren();
    const thumb = document.createElement('img');
    thumb.className = 'mini-gpt-vision-thumb';
    thumb.src = 'data:' + pendingVision.mime + ';base64,' + pendingVision.base64;
    thumb.alt = translate('visionPendingLabel');
    const label = document.createElement('span');
    label.className = 'mini-gpt-vision-label';
    label.textContent = translate('visionPendingLabel');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'mini-gpt-vision-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = translate('visionRemove');
    removeBtn.setAttribute('aria-label', translate('visionRemove'));
    removeBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      pendingVision = null;
      renderVisionPending();
    });
    visionPendingEl.appendChild(thumb);
    visionPendingEl.appendChild(label);
    visionPendingEl.appendChild(removeBtn);
  }

  function clearPendingVision() {
    pendingVision = null;
    renderVisionPending();
  }

  function syncVisionScreenshotAvailability() {
    if (!screenshotBtn) return;
    const allowed = currentProvider === 'openai' || currentProvider === 'gemini';
    screenshotBtn.style.display = allowed ? 'flex' : 'none';
    if (!allowed && pendingVision) clearPendingVision();
  }

  if (screenshotBtn) {
    screenshotBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (requestInProgress) return;
      screenshotBtn.disabled = true;
      const prevTitle = screenshotBtn.title;
      screenshotBtn.title = translate('visionCapturing');
      chrome.runtime.sendMessage({ type: 'EASYAI_CAPTURE_TAB' }, async (cap) => {
        screenshotBtn.disabled = false;
        screenshotBtn.title = prevTitle;
        if (chrome.runtime.lastError) {
          showVoiceNotice(chrome.runtime.lastError.message || translate('visionCaptureFailed'), 'error');
          return;
        }
        if (!cap || !cap.ok || !cap.dataUrl) {
          showVoiceNotice((cap && cap.error) || translate('visionCaptureFailed'), 'error');
          return;
        }
        try {
          const scaled = await downscaleDataUrl(cap.dataUrl, VISION_MAX_SIDE, 0.82);
          if (!scaled.base64 || scaled.base64.length < 100) {
            showVoiceNotice(translate('visionCaptureFailed'), 'error');
            return;
          }
          pendingVision = { base64: scaled.base64, mime: scaled.mime };
          renderVisionPending();
        } catch (_) {
          showVoiceNotice(translate('visionCaptureFailed'), 'error');
        }
      });
    });
  }

  syncVisionScreenshotAvailability();

  function clearVoiceNotice() {
    if (voiceStatusTimer) {
      clearTimeout(voiceStatusTimer);
      voiceStatusTimer = null;
    }
    if (voiceStatusEl) {
      voiceStatusEl.style.display = 'none';
      voiceStatusEl.replaceChildren();
      voiceStatusEl.className = 'mini-gpt-voice-status';
    }
  }

  function showVoiceNotice(text, variant) {
    if (!voiceStatusEl || !text) return;
    clearVoiceNotice();
    voiceStatusEl.className = 'mini-gpt-voice-status mini-gpt-voice-status--' + (variant === 'error' ? 'error' : 'info');
    const textSpan = document.createElement('span');
    textSpan.className = 'mini-gpt-voice-status-text';
    textSpan.textContent = text;
    const dismissBtn = document.createElement('button');
    dismissBtn.type = 'button';
    dismissBtn.className = 'mini-gpt-voice-status-dismiss';
    dismissBtn.title = translate('voiceDismiss');
    dismissBtn.setAttribute('aria-label', translate('voiceDismiss'));
    dismissBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    dismissBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearVoiceNotice();
    });
    voiceStatusEl.appendChild(textSpan);
    voiceStatusEl.appendChild(dismissBtn);
    voiceStatusEl.style.display = 'flex';
    voiceStatusTimer = setTimeout(clearVoiceNotice, 14000);
  }

  const voicePrefs = {
    voiceInputEnabled: false,
    speechLang: ''
  };
  let speechRecognitionInstance = null;
  let voiceListening = false;

  function getSpeechRecognitionCtor() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  function stripMarkdownForSpeech(s) {
    if (!s) return '';
    return String(s)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/`+/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function stopSpeechRecognition() {
    if (speechRecognitionInstance) {
      try {
        speechRecognitionInstance.onresult = null;
        speechRecognitionInstance.onerror = null;
        speechRecognitionInstance.onend = null;
        speechRecognitionInstance.stop();
      } catch (_) { /* ignore */ }
      speechRecognitionInstance = null;
    }
    voiceListening = false;
    if (voiceBtn) {
      voiceBtn.classList.remove('mini-gpt-voice-listening');
      voiceBtn.title = translate('voiceInput');
      voiceBtn.setAttribute('aria-label', translate('voiceInput'));
    }
  }

  const READ_ALOUD_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  const READ_ALOUD_CHECK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  let activeReadAloudBtn = null;
  const readAloudUiTimers = { swap: null, doneFlash: null };

  function clearReadAloudUiTimers() {
    if (readAloudUiTimers.swap) {
      clearTimeout(readAloudUiTimers.swap);
      readAloudUiTimers.swap = null;
    }
    if (readAloudUiTimers.doneFlash) {
      clearTimeout(readAloudUiTimers.doneFlash);
      readAloudUiTimers.doneFlash = null;
    }
  }

  function resetReadAloudButton(btn) {
    if (!btn || !btn.parentNode) return;
    btn.innerHTML = READ_ALOUD_ICON_SVG;
    btn.style.background = 'rgba(255, 255, 255, 0.9)';
    btn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
    btn.style.color = '';
    btn.title = translate('readAloud');
    btn.setAttribute('aria-label', translate('readAloudAria'));
    btn.removeAttribute('aria-busy');
  }

  function stopAllVoiceOutput() {
    clearReadAloudUiTimers();
    if (activeReadAloudBtn) {
      resetReadAloudButton(activeReadAloudBtn);
      activeReadAloudBtn = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (_) { /* ignore */ }
  }

  function stopAllVoiceActivity() {
    stopSpeechRecognition();
    stopAllVoiceOutput();
    clearVoiceNotice();
  }

  function speakAssistantText(text, readBtn) {
    stopAllVoiceOutput();
    const plain = stripMarkdownForSpeech(text);
    if (!plain) {
      if (readBtn) resetReadAloudButton(readBtn);
      return;
    }
    const lang = (voicePrefs.speechLang && voicePrefs.speechLang.trim()) || navigator.language || 'en-US';
    const u = new SpeechSynthesisUtterance(plain);
    u.lang = lang;
    u.rate = 1;

    const finishReadAloud = () => {
      clearReadAloudUiTimers();
      if (!readBtn || activeReadAloudBtn !== readBtn) return;
      readBtn.innerHTML = READ_ALOUD_CHECK_SVG;
      readBtn.style.background = '#10b981';
      readBtn.style.borderColor = '#10b981';
      readBtn.style.color = '#fff';
      readBtn.title = translate('readAloud');
      readBtn.setAttribute('aria-label', translate('readAloudAria'));
      readBtn.removeAttribute('aria-busy');
      readAloudUiTimers.doneFlash = setTimeout(() => {
        readAloudUiTimers.doneFlash = null;
        resetReadAloudButton(readBtn);
        if (activeReadAloudBtn === readBtn) activeReadAloudBtn = null;
      }, 1200);
    };

    const failReadAloud = () => {
      clearReadAloudUiTimers();
      if (readBtn && activeReadAloudBtn === readBtn) {
        resetReadAloudButton(readBtn);
        activeReadAloudBtn = null;
      }
    };

    if (readBtn) {
      activeReadAloudBtn = readBtn;
      readBtn.innerHTML = READ_ALOUD_CHECK_SVG;
      readBtn.style.background = '#10b981';
      readBtn.style.borderColor = '#10b981';
      readBtn.style.color = '#fff';
      readBtn.style.opacity = '1';
      readBtn.title = translate('readAloudPlaying');
      readBtn.setAttribute('aria-label', translate('readAloudPlayingAria'));
      readBtn.setAttribute('aria-busy', 'true');

      readAloudUiTimers.swap = setTimeout(() => {
        readAloudUiTimers.swap = null;
        if (activeReadAloudBtn !== readBtn || !readBtn.parentNode) return;
        try {
          if (window.speechSynthesis.speaking) {
            readBtn.innerHTML = READ_ALOUD_ICON_SVG;
            readBtn.style.color = '#fff';
            readBtn.style.background = '#10b981';
            readBtn.style.borderColor = '#10b981';
          }
        } catch (_) { /* ignore */ }
      }, 650);
    }

    u.onend = finishReadAloud;
    u.onerror = failReadAloud;

    try {
      window.speechSynthesis.speak(u);
    } catch (_) {
      failReadAloud();
    }
  }

  function applyVoiceMicVisibility() {
    if (!voiceBtn) return;
    const supported = !!getSpeechRecognitionCtor();
    const show = supported && voicePrefs.voiceInputEnabled;
    voiceBtn.style.display = show ? 'flex' : 'none';
    if (!show) stopSpeechRecognition();
  }

  function refreshVoicePrefsFromStorage() {
    chrome.storage.local.get(['voiceInputEnabled', 'speechLang'], (data) => {
      voicePrefs.voiceInputEnabled = data.voiceInputEnabled === true;
      voicePrefs.speechLang = typeof data.speechLang === 'string' ? data.speechLang : '';
      applyVoiceMicVisibility();
    });
  }

  refreshVoicePrefsFromStorage();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.voiceInputEnabled || changes.speechLang)) {
      refreshVoicePrefsFromStorage();
    }
  });

  function mapSpeechError(ev) {
    const code = ev && ev.error;
    if (code === 'not-allowed' || code === 'service-not-allowed') return translate('voiceMicDenied');
    if (code === 'audio-capture') return translate('voiceMicDenied');
    if (code === 'no-speech') return translate('voiceNoSpeech');
    if (code === 'aborted') return translate('voiceAborted');
    if (code === 'network') return translate('voiceNetwork');
    if (code === 'language-not-supported') return translate('voiceNotSupported');
    return translate('errorOccurred');
  }

  function attachReadAloudButton(bubbleRoot, actionsEl, plainText) {
    const readBtn = document.createElement('button');
    readBtn.type = 'button';
    readBtn.className = 'mini-gpt-read-aloud-btn';
    readBtn.title = translate('readAloud');
    readBtn.setAttribute('aria-label', translate('readAloudAria'));
    readBtn.innerHTML = READ_ALOUD_ICON_SVG;
    readBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakAssistantText(plainText, readBtn);
    });
    const showRead = () => { readBtn.style.opacity = '1'; };
    const hideRead = () => {
      if (activeReadAloudBtn === readBtn) {
        readBtn.style.opacity = '1';
        return;
      }
      readBtn.style.opacity = '0';
    };
    bubbleRoot.addEventListener('mouseenter', showRead);
    bubbleRoot.addEventListener('mouseleave', hideRead);
    readBtn.addEventListener('mouseenter', showRead);
    readBtn.addEventListener('mouseleave', hideRead);
    actionsEl.appendChild(readBtn);
  }

  function stripMarkdownForReplace(s) {
    if (!s) return '';
    return String(s)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .trim();
  }

  function buildContentEditableFragment(text) {
    const frag = document.createDocumentFragment();
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      frag.appendChild(document.createTextNode(line));
      if (i < lines.length - 1) frag.appendChild(document.createElement('br'));
    });
    return frag;
  }

  function replaceInEditableField(rawText) {
    const target = window.__easyaiEditableTarget;
    if (!target || !target.el) return false;
    const cleanText = stripMarkdownForReplace(rawText);
    try {
      if (target.type === 'input') {
        const el = target.el;
        if (typeof el.setRangeText === 'function') {
          el.setRangeText(cleanText, target.start, target.end, 'select');
        } else {
          const val = el.value;
          el.value = val.slice(0, target.start) + cleanText + val.slice(target.end);
          el.selectionStart = target.start;
          el.selectionEnd = target.start + cleanText.length;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.focus();
      } else if (target.type === 'contenteditable' && target.range) {
        const range = target.range;
        range.deleteContents();
        range.insertNode(buildContentEditableFragment(cleanText));
        target.el.dispatchEvent(new Event('input', { bubbles: true }));
        target.el.focus();
      }
      window.__easyaiEditableTarget = null;
      return true;
    } catch (_) {
      return false;
    }
  }

  function attachReplaceButton(msgEl, plainText) {
    if (!window.__easyaiEditableTarget || !window.__easyaiEditableTarget.el) return;
    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.className = 'mini-gpt-replace-btn';
    replaceBtn.title = translate('replaceInField');
    replaceBtn.setAttribute('aria-label', translate('replaceInFieldAria'));
    replaceBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span style="margin-left:4px;">${translate('replaceInField')}</span>`;
    replaceBtn.style.cssText = `
      position: absolute; bottom: 6px; right: 6px;
      background: rgba(var(--browsemate-browse-rgb),0.08); border: 1px solid rgba(var(--browsemate-browse-rgb),0.22);
      border-radius: 7px; height: 24px; padding: 0 8px;
      font-size: 11px; font-weight: 600; color: var(--browsemate-browse);
      display: flex; align-items: center; cursor: pointer;
      opacity: 0; transition: opacity 0.2s, background 0.2s;
      z-index: 11; white-space: nowrap;
    `;
    msgEl.addEventListener('mouseenter', () => { replaceBtn.style.opacity = '1'; });
    msgEl.addEventListener('mouseleave', () => { replaceBtn.style.opacity = '0'; });
    replaceBtn.addEventListener('mouseenter', () => { replaceBtn.style.opacity = '1'; });
    replaceBtn.addEventListener('mouseleave', () => { replaceBtn.style.opacity = '0'; });
    replaceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ok = replaceInEditableField(plainText);
      if (ok) {
        replaceBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span style="margin-left:4px;">${translate('replaceDone')}</span>`;
        replaceBtn.style.background = 'rgba(16,185,129,0.1)';
        replaceBtn.style.borderColor = '#10b981';
        replaceBtn.style.color = '#059669';
        setTimeout(() => {
          if (replaceBtn.parentNode) replaceBtn.remove();
          msgEl.classList.remove('mini-gpt-msg-has-replace');
        }, 2000);
      } else {
        replaceBtn.style.color = '#ef4444';
        replaceBtn.innerHTML = `<span style="margin-left:0">Field no longer available</span>`;
        setTimeout(() => {
          if (replaceBtn.parentNode) replaceBtn.remove();
          msgEl.classList.remove('mini-gpt-msg-has-replace');
        }, 2500);
      }
    });
    msgEl.classList.add('mini-gpt-msg-has-replace');
    msgEl.appendChild(replaceBtn);
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor || !voicePrefs.voiceInputEnabled) return;
      if (voiceListening) {
        stopSpeechRecognition();
        return;
      }
      stopAllVoiceOutput();
      const rec = new Ctor();
      speechRecognitionInstance = rec;
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = (voicePrefs.speechLang && voicePrefs.speechLang.trim()) || navigator.language || 'en-US';
      const prefix = input.value.trim();
      let accumulatedFinal = '';
      voiceListening = true;
      voiceBtn.classList.add('mini-gpt-voice-listening');
      voiceBtn.title = translate('voiceListening');
      voiceBtn.setAttribute('aria-label', translate('voiceListening'));
      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const piece = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) accumulatedFinal += piece;
          else interim += piece;
        }
        const parts = [prefix, accumulatedFinal.trim(), interim].filter(Boolean);
        input.value = parts.join(' ').trim();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      };
      rec.onerror = (ev) => {
        stopSpeechRecognition();
        showVoiceNotice(mapSpeechError(ev), 'error');
      };
      rec.onend = () => {
        if (speechRecognitionInstance === rec) speechRecognitionInstance = null;
        voiceListening = false;
        if (voiceBtn) {
          voiceBtn.classList.remove('mini-gpt-voice-listening');
          voiceBtn.title = translate('voiceInput');
          voiceBtn.setAttribute('aria-label', translate('voiceInput'));
        }
      };
      try {
        clearVoiceNotice();
        rec.start();
      } catch (_) {
        stopSpeechRecognition();
        showVoiceNotice(translate('voiceNotSupported'), 'error');
      }
    });
  }

  // Add empty chat placeholder
  function showEmptyPlaceholder() {
    if (!messagesDiv.querySelector('.mini-gpt-empty-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'mini-gpt-empty-placeholder';
      placeholder.textContent = translate('welcome');
      messagesDiv.appendChild(placeholder);
    }
  }
  function hideEmptyPlaceholder() {
    const placeholder = messagesDiv.querySelector('.mini-gpt-empty-placeholder');
    if (placeholder) placeholder.remove();
  }
  // Show placeholder initially
  showEmptyPlaceholder();

  // --- Session-based chat history with conversation context ---
  let currentSession = { messages: [], date: '', preview: '' };
  let conversationContext = []; // Store conversation messages for context
  
  function resetSession() {
    currentSession = { messages: [], date: '', preview: '' };
    conversationContext = []; // Reset conversation context
    currentHistoryIndex = -1;
    clearPendingVision();
  }
  
  // Function to manage conversation context length (prevent it from getting too long)
  function manageConversationContext() {
    const maxContextLength = 20; // Maximum number of messages to keep in context
    if (conversationContext.length > maxContextLength) {
      // Keep the most recent messages, but always keep at least the first user message
      const firstUserMessage = conversationContext.find(msg => msg.role === 'user');
      const recentMessages = conversationContext.slice(-maxContextLength + 1);
      
      if (firstUserMessage && !recentMessages.find(msg => msg.role === 'user' && msg.content === firstUserMessage.content)) {
        conversationContext = [firstUserMessage, ...recentMessages];
      } else {
        conversationContext = recentMessages;
      }
    }
  }
  let currentHistoryIndex = -1;
  
  function trySaveCurrentSession() {
    // Only save if not streaming
    if (!requestInProgress && currentSession.messages.length > 1) {
      currentSession.date = new Date().toLocaleString();
      currentSession.preview = currentSession.messages.find(m => m.role === 'user')?.text?.slice(0, 60) || '';
      
      if (currentHistoryIndex >= 0 && currentHistoryIndex < allHistory.length) {
        allHistory[currentHistoryIndex] = { ...currentSession };
        chrome.storage.local.set({ miniGptHistory: allHistory }, () => {
          const filteredIndex = filteredHistory.findIndex(item => 
            item === allHistory[currentHistoryIndex] || 
            JSON.stringify(item.messages) === JSON.stringify(allHistory[currentHistoryIndex].messages)
          );
          if (filteredIndex !== -1) {
            filteredHistory[filteredIndex] = { ...currentSession };
          }
        });
      } else {
        saveChatToHistory(currentSession);
      }
    }
  }

  // Patch appendMessage to hide placeholder when a message is added and maintain conversation context
  const origAppendMessage = appendMessage;
  appendMessage = function(text, from) {
    hideEmptyPlaceholder();
    origAppendMessage(text, from);
    if (from === 'user' || from === 'bot') {
      currentSession.messages.push({ role: from, text });
      
      // Add to conversation context for AI providers
      if (from === 'user') {
        conversationContext.push({ role: 'user', content: text });
      } else if (from === 'bot') {
        conversationContext.push({ role: 'assistant', content: text });
      }
      
      // Manage context length to prevent it from getting too long
      manageConversationContext();
    }
  };
  // Also show placeholder if chat is cleared
  function clearChatMessages() {
    messagesDiv.innerHTML = '';
    currentHistoryIndex = -1;
    showEmptyPlaceholder();
  }
  // Replace all saveCurrentSession() calls with trySaveCurrentSession()
  // Save session when chat is closed or a new session is started
  const origBubbleOnClick = bubble.onclick;
  bubble.onclick = (e) => {
    // Prevent click if we were dragging or if we dragged significantly
    if (isBubbleDragging || bubbleWasDragged || bubbleDragDistance > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Check if chat is currently visible
    const isChatVisible = chatContainer.style.display === 'flex' && 
                         chatContainer.style.visibility === 'visible' && 
                         chatContainer.style.opacity !== '0';
    
    if (isChatVisible) {
      // Chat is open, so close it and show bubble
      // Show bubble instantly for better UX (no API key check needed since chat was open)
      requestAnimationFrame(() => {
        bubble.style.transition = 'none';
        bubble.style.animation = 'none';
        bubble.style.animationPlayState = 'paused';
        bubble.style.display = 'flex';
        bubble.style.visibility = 'visible';
        bubble.style.opacity = '1';
        bubble.style.transform = 'scale(1) translateY(0)';
        bubble.classList.add('instant-show');
        
        // Force immediate repaint
        bubble.offsetHeight;
      });
      
      // Hide chat container
      chatContainer.style.display = 'none';
      chatContainer.style.visibility = 'hidden';
      chatContainer.style.opacity = '0';
      stopAllVoiceActivity();
      
      // Save session in background without blocking UI
      setTimeout(() => {
        trySaveCurrentSession();
      }, 0);
      
      // Remove the instant-show class after a brief moment
      setTimeout(() => {
        bubble.classList.remove('instant-show');
      }, 100);
    } else {
      // Chat is closed, so open it
      resetSession();
      chatContainer.style.display = 'flex';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.opacity = '1';
      chatContainer.style.animation = 'mini-gpt-fadein 0.22s';
      
      // Hide bubble when chat is opened
      hideBubble();
      
      // Reset to default position if not previously positioned
      if (!chatContainer.style.left && !chatContainer.style.top) {
        chatContainer.style.right = '32px';
        chatContainer.style.bottom = '108px';
        chatContainer.style.left = '';
        chatContainer.style.top = '';
      }
      
      setTimeout(() => { chatContainer.style.animation = ''; }, 250);
    }
    if (origBubbleOnClick) origBubbleOnClick();
  };
  const origCloseOnClick = chatContainer.querySelector('#mini-gpt-close').onclick;
  chatContainer.querySelector('#mini-gpt-close').onclick = () => {
    // Show bubble instantly for better UX (no API key check needed since chat was open)
    requestAnimationFrame(() => {
      bubble.style.transition = 'none';
      bubble.style.animation = 'none';
      bubble.style.animationPlayState = 'paused';
      bubble.style.display = 'flex';
      bubble.style.visibility = 'visible';
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1) translateY(0)';
      bubble.classList.add('instant-show');
      
      // Force immediate repaint
      bubble.offsetHeight;
    });
    
    // Hide chat container
    chatContainer.style.display = 'none';
    chatContainer.style.visibility = 'hidden';
    chatContainer.style.opacity = '0';
    stopAllVoiceActivity();
    
    // Save session in background without blocking UI
    setTimeout(() => {
      trySaveCurrentSession();
    }, 0);
    
    // Remove the instant-show class after a brief moment
    setTimeout(() => {
      bubble.classList.remove('instant-show');
    }, 100);
    
    if (origCloseOnClick) origCloseOnClick();
  };

  // Draggable functionality for chat container
  const dragIndicator = chatContainer.querySelector('.mini-gpt-drag-indicator');
  
  // Make drag indicator draggable
  dragIndicator.style.cursor = 'grab';
  dragIndicator.style.userSelect = 'none';
  
  function startDrag(e) {
    // Only allow dragging from the drag indicator
    if (!e.target.closest('.mini-gpt-drag-indicator')) {
      return;
    }
    
    isDragging = true;
    dragIndicator.style.cursor = 'grabbing';
    
    // Get current position
    const rect = chatContainer.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    // Get mouse position
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    // Calculate current position relative to viewport
    currentX = initialX;
    currentY = initialY;
    
    // Prevent text selection during drag
    e.preventDefault();
    
    // Add event listeners for drag and end
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseleave', stopDrag);
  }
  
  function onDrag(e) {
    if (!isDragging) return;
    
    // Calculate new position
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    
    currentX = initialX + deltaX;
    currentY = initialY + deltaY;
    
    // Constrain to viewport bounds
    const containerRect = chatContainer.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Keep at least 50px from edges
    const minX = 50;
    const maxX = viewportWidth - containerRect.width - 50;
    const minY = 50;
    const maxY = viewportHeight - containerRect.height - 50;
    
    currentX = Math.max(minX, Math.min(maxX, currentX));
    currentY = Math.max(minY, Math.min(maxY, currentY));
    
    // Update chat position
    chatContainer.style.left = currentX + 'px';
    chatContainer.style.top = currentY + 'px';
    chatContainer.style.right = 'auto';
    chatContainer.style.bottom = 'auto';
    
    // Move bubble to follow chat (positioned below the chat)
    if (bubble.style.display !== 'none') {
      const bubbleWidth = 90; // Bubble width
      const bubbleHeight = 90; // Bubble height
      
      // Position bubble below the chat
      let bubbleX = currentX + (containerRect.width - bubbleWidth) / 2;
      let bubbleY = currentY + containerRect.height + 20; // 20px gap between chat and bubble
      
      // Constrain bubble to viewport bounds
      const bubbleMinX = 20;
      const bubbleMaxX = viewportWidth - bubbleWidth - 20;
      const bubbleMinY = 20;
      const bubbleMaxY = viewportHeight - bubbleHeight - 20;
      
      bubbleX = Math.max(bubbleMinX, Math.min(bubbleMaxX, bubbleX));
      bubbleY = Math.max(bubbleMinY, Math.min(bubbleMaxY, bubbleY));
      
      bubble.style.left = bubbleX + 'px';
      bubble.style.top = bubbleY + 'px';
      bubble.style.right = 'auto';
      bubble.style.bottom = 'auto';
    }
  }
  
  function stopDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    dragIndicator.style.cursor = 'grab';
    
    // Remove event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mouseleave', stopDrag);
  }
  
  // Add drag event listeners to drag indicator
  dragIndicator.addEventListener('mousedown', startDrag);
  
  // Add touch support for mobile devices
  dragIndicator.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrag(mouseEvent);
  });
  
  // Handle window resize to keep chat and bubble synchronized and in bounds
  window.addEventListener('resize', () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible') {
      const rect = chatContainer.getBoundingClientRect();
      
      // If chat is outside viewport, reposition both chat and bubble
      if (rect.right > viewportWidth || rect.bottom > viewportHeight || rect.left < 0 || rect.top < 0) {
        const newChatX = 50;
        const newChatY = 50;
        
        chatContainer.style.left = newChatX + 'px';
        chatContainer.style.top = newChatY + 'px';
        chatContainer.style.right = 'auto';
        chatContainer.style.bottom = 'auto';
        
        // Position bubble below the chat
        if (bubble.style.display !== 'none') {
          const bubbleWidth = 90;
          const bubbleHeight = 90;
          const chatWidth = 400;
          const chatHeight = 60;
          
          let bubbleX = newChatX + (chatWidth - bubbleWidth) / 2;
          let bubbleY = newChatY + chatHeight + 20;
          
          // Constrain bubble to viewport
          bubbleX = Math.max(20, Math.min(viewportWidth - bubbleWidth - 20, bubbleX));
          bubbleY = Math.max(20, Math.min(viewportHeight - bubbleHeight - 20, bubbleY));
          
          bubble.style.left = bubbleX + 'px';
          bubble.style.top = bubbleY + 'px';
          bubble.style.right = 'auto';
          bubble.style.bottom = 'auto';
        }
      }
    } else if (bubble.style.display !== 'none') {
      // If only bubble is visible, keep it in bounds
      const bubbleRect = bubble.getBoundingClientRect();
      
      if (bubbleRect.right > viewportWidth || bubbleRect.bottom > viewportHeight || bubbleRect.left < 0 || bubbleRect.top < 0) {
        bubble.style.left = '32px';
        bubble.style.top = '32px';
        bubble.style.right = 'auto';
        bubble.style.bottom = 'auto';
      }
    }
  });
  
  // Periodic sync check to ensure bubble visibility stays correct
  setInterval(syncBubbleVisibility, 2000);
  
  // Enhanced bubble visibility check that also handles edge cases
  function ensureBubbleVisible() {
    const isChatVisible = chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible';
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || 
                        document.mozFullScreenElement || document.msFullscreenElement;
    
    if (!isChatVisible && !isFullscreen) {
      // Only show bubble if API key is available
      getProviderKeys((data) => {
        const hasKey = hasAnyApiKey(data);
        if (hasKey) {
          showBubbleInstant();
        }
      });
    }
  }

  // Enhanced markdown to HTML converter with paragraph and spacing support
  function convertMarkdownToHTML(text) {
    if (!text) return '';

    // Convert double newlines to paragraphs (but not inside lists)
    let html = text
      // Convert **bold** to <strong>bold</strong> (non-greedy)
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>italic</em> (but not bullet points or bold)
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
      // Convert bullet points (* item) to <li>item</li>
      .replace(/^\s*\*\s+(.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li>.*?<\/li>)/gs, function(match) {
      // Only wrap if not already in a <ul>
      if (!/^<ul>/.test(match)) {
        return '<ul>' + match + '</ul>';
      }
      return match;
    });

    // Convert double newlines to paragraphs, but avoid wrapping <ul> blocks
    html = html
      .split(/\n{2,}/)
      .map(block => {
        // If block is a list, don't wrap in <p>
        if (/^\s*<ul>/.test(block)) return block;
        // If block is empty, skip
        if (!block.trim()) return '';
        return `<p>${block.trim()}</p>`;
      })
      .join('');

    // Convert single newlines to <br> (but not inside <ul> or <li>)
    html = html.replace(/([^>])\n([^<])/g, '$1<br>$2');

    // Clean up any remaining markdown artifacts
    html = html.replace(/\*\*/g, '').replace(/\*/g, '');

    return html;
  }

  function appendMessage(text, from) {
    const msg = document.createElement('div');
    msg.className = from === 'user' ? 'mini-gpt-msg-user mini-gpt-msg-with-copy' : 'mini-gpt-msg-bot';
    msg.style.position = 'relative';

    const built = from === 'user' ? buildUserMessageRow() : buildBotMessageRow();
    const { row, body, actions } = built;
    if (from === 'bot') {
      body.innerHTML = convertMarkdownToHTML(text);
    } else {
      body.textContent = text;
      body.style.textAlign = 'right';
    }
    msg.appendChild(row);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'mini-gpt-copy-btn';
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.title = translate('copyMessage') || 'Copy message';
    copyBtn.setAttribute('aria-label', translate('copyMessage') || 'Copy message');

    msg.addEventListener('mouseenter', () => {
      copyBtn.style.opacity = '1';
    });
    msg.addEventListener('mouseleave', () => {
      copyBtn.style.opacity = '0';
    });

    if (from === 'bot') {
      attachReadAloudButton(msg, actions, text);
      actions.appendChild(copyBtn);
      attachReplaceButton(msg, text);
    } else {
      actions.appendChild(copyBtn);
    }

    copyBtn.onclick = async (e) => {
      e.stopPropagation();
      const textToCopy = from === 'bot' ? text : text; // Get plain text
      try {
        await navigator.clipboard.writeText(textToCopy);
        // Show feedback
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        copyBtn.style.background = '#10b981';
        copyBtn.style.borderColor = '#10b981';
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          copyBtn.style.background = 'rgba(255, 255, 255, 0.9)';
          copyBtn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }, 1500);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        copyBtn.style.background = '#10b981';
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          copyBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        }, 1500);
      }
    };

    messagesDiv.appendChild(msg);
    
    // Scroll to the top of the new message instead of bottom
    const scrollTarget = msg;
    if (from === 'bot') {
      setTimeout(() => {
        safeScrollIntoView(scrollTarget, { behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setTimeout(() => {
        safeScrollIntoView(scrollTarget, { behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }

  function getSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(['provider', 'apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'], resolve);
    });
  }
  function setSettings(settings) {
    return new Promise(resolve => {
      chrome.storage.local.set(settings, resolve);
    });
  }

  const DEFAULT_MODELS = providerConfig.defaultModels || {
    openai: 'gpt-3.5-turbo',
    gemini: 'gemini-2.0-flash',
    huggingface: 'meta-llama/Llama-3.1-8B-Instruct'
  };

  const HF_MODELS = providerConfig.hfModels || [
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/gemma-7b-it',
    'microsoft/Phi-3-mini-4k-instruct',
    'Qwen/Qwen2.5-7B-Instruct'
  ];

  const HF_VISION_MODELS = providerConfig.hfVisionModels || [
    'Qwen/Qwen2.5-VL-7B-Instruct:fastest',
    'Qwen/Qwen2.5-VL-7B-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct'
  ];

  async function updateProviderUI() {
    const settings = await getSettings();
    const provider = currentProvider;
    form.querySelector('button[type="submit"]').disabled = !settings[`apiKey_${provider}`];
    input.disabled = !settings[`apiKey_${provider}`];
    if (!settings[`apiKey_${provider}`]) {
      input.placeholder = 'Set your API key in the extension popup.';
    } else {
      input.placeholder = 'Ask anything...';
    }
  }

  // Auto-resize textarea
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
  
  // Add hover effects to send button
  const sendButton = form.querySelector('.mini-gpt-send-btn');
  sendButton.addEventListener('mouseenter', () => {
    sendButton.style.background = '#1d4ed8';
  });
  sendButton.addEventListener('mouseleave', () => {
    sendButton.style.background = 'var(--browsemate-browse)';
  });
  // Support Shift+Enter for new line, Enter to send
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // Remove Stop button in header (if present)
  // --- Remove previous Stop button code block ---
  // Instead, use the form's submit button for both send and stop

  let requestInProgress = false;

  // Reference to the send/stop button
  const sendBtn = form.querySelector('button[type="submit"]');
  // SVGs for send and stop
  const sendSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const stopSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  function updateSendStopBtn() {
    if (requestInProgress) {
      sendBtn.innerHTML = stopSVG;
      sendBtn.title = 'Stop generation';
    } else {
      sendBtn.innerHTML = sendSVG;
      sendBtn.title = 'Send';
    }
  }

  // Helper to remove loader
  function removeLoader() {
    const last = messagesDiv.lastChild;
    if (last && last.querySelector && last.querySelector('.mini-gpt-loader')) messagesDiv.removeChild(last);
  }

  // --- Streaming support ---
  let streamingBotMsg = null;
  let streamingBotText = '';
  let streamingBotBodyEl = null;

  function buildBotMessageRow() {
    const row = document.createElement('div');
    row.className = 'mini-gpt-msg-row';
    const body = document.createElement('div');
    body.className = 'mini-gpt-msg-body';
    const actions = document.createElement('div');
    actions.className = 'mini-gpt-msg-actions';
    row.appendChild(body);
    row.appendChild(actions);
    return { row, body, actions };
  }

  function buildUserMessageRow() {
    const row = document.createElement('div');
    row.className = 'mini-gpt-msg-row mini-gpt-msg-row--user';
    const body = document.createElement('div');
    body.className = 'mini-gpt-msg-body';
    const actions = document.createElement('div');
    actions.className = 'mini-gpt-msg-actions';
    row.appendChild(actions);
    row.appendChild(body);
    return { row, body, actions };
  }

  /** Bot bubble without row wrapper → wrap existing HTML in body + actions column */
  function ensureBotMessageShell(msgEl) {
    let actions = msgEl.querySelector('.mini-gpt-msg-actions');
    if (actions) {
      return {
        body: msgEl.querySelector('.mini-gpt-msg-body'),
        actions
      };
    }
    const html = msgEl.innerHTML;
    msgEl.replaceChildren();
    const { row, body, actions: act } = buildBotMessageRow();
    body.innerHTML = html || '';
    msgEl.appendChild(row);
    return { body, actions: act };
  }

  // Helper: add a copy button to a bot message element
  function addCopyBtnToMsg(msgEl, plainText) {
    msgEl.style.position = 'relative';
    if (msgEl.classList.contains('mini-gpt-msg-user')) msgEl.classList.add('mini-gpt-msg-with-copy');
    const { actions } = ensureBotMessageShell(msgEl);
    const copyBtn = document.createElement('button');
    copyBtn.className = 'mini-gpt-copy-btn';
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyBtn.title = translate('copyMessage') || 'Copy message';
    copyBtn.setAttribute('aria-label', translate('copyMessage') || 'Copy message');
    msgEl.addEventListener('mouseenter', () => { copyBtn.style.opacity = '1'; });
    msgEl.addEventListener('mouseleave', () => { copyBtn.style.opacity = '0'; });
    attachReadAloudButton(msgEl, actions, plainText);
    actions.appendChild(copyBtn);
    copyBtn.onclick = async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(plainText);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = plainText;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      copyBtn.style.background = '#10b981';
      copyBtn.style.borderColor = '#10b981';
      setTimeout(() => {
        copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        copyBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        copyBtn.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      }, 1500);
    };
    attachReplaceButton(msgEl, plainText);
  }

  // Listen for streaming answer parts from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'MINI_GPT_ANSWER_PART') {
      // Ensure chat is visible when receiving messages
      if (chatContainer.style.display === 'none' || chatContainer.style.visibility === 'hidden') {
        chatContainer.style.display = 'flex';
        chatContainer.style.visibility = 'visible';
        chatContainer.style.opacity = '1';
        // Hide bubble when chat becomes visible
        hideBubble();
      }
      
      // Remove loader if present
      removeLoader();
      if (msg.done) {
        if (!streamingBotMsg && msg.answerPart) {
          appendMessage(msg.answerPart, 'bot');
          streamingBotMsg = null;
          streamingBotText = '';
          streamingBotBodyEl = null;
        } else if (streamingBotMsg) {
          currentSession.messages.push({ role: 'bot', text: streamingBotText });
          conversationContext.push({ role: 'assistant', content: streamingBotText });
          
          // Check if response seems incomplete
          const isIncomplete = checkIfResponseIncomplete(streamingBotText);
          const streamBody = streamingBotMsg.querySelector('.mini-gpt-msg-body');
          if (streamBody) streamBody.innerHTML = convertMarkdownToHTML(streamingBotText);
          else streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
          if (isIncomplete) {
            const incompleteIndicator = document.createElement('div');
            incompleteIndicator.className = 'mini-gpt-incomplete-indicator';
            incompleteIndicator.style.cssText = 'margin-top: 8px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; border-left: 3px solid #f59e0b;';
            
            const label = document.createElement('span');
            label.style.cssText = 'color: #f59e0b; font-size: 0.8em; font-style: italic; display: block; margin-bottom: 4px;';
            label.textContent = '[Response may be incomplete]';
            
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Continue';
            continueBtn.style.cssText = 'background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; cursor: pointer; margin-right: 8px;';
            continueBtn.addEventListener('click', () => {
              incompleteIndicator.remove();
              input.value = 'Please continue your previous response from where you left off.';
              sendPrompt();
            });
            
            const regenerateBtn = document.createElement('button');
            regenerateBtn.textContent = 'Regenerate';
            regenerateBtn.style.cssText = 'background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; cursor: pointer;';
            regenerateBtn.addEventListener('click', () => {
              const botMsg = incompleteIndicator.closest('.mini-gpt-msg-bot');
              if (botMsg) botMsg.remove();
              // Remove last bot entry from session and context
              const lastBotIdx = currentSession.messages.map(m => m.role).lastIndexOf('bot');
              if (lastBotIdx !== -1) currentSession.messages.splice(lastBotIdx, 1);
              const lastCtxIdx = conversationContext.map(m => m.role).lastIndexOf('assistant');
              if (lastCtxIdx !== -1) conversationContext.splice(lastCtxIdx, 1);
              const lastUserMsg = currentSession.messages.filter(m => m.role === 'user').pop();
              if (lastUserMsg) {
                input.value = lastUserMsg.text;
                sendPrompt();
              }
            });
            
            incompleteIndicator.appendChild(label);
            incompleteIndicator.appendChild(continueBtn);
            incompleteIndicator.appendChild(regenerateBtn);
            const ibody = streamingBotMsg.querySelector('.mini-gpt-msg-body');
            if (ibody) ibody.appendChild(incompleteIndicator);
            else streamingBotMsg.appendChild(incompleteIndicator);
          }
          // Add copy button to streamed message
          addCopyBtnToMsg(streamingBotMsg, streamingBotText);
          streamingBotMsg = null;
          streamingBotText = '';
          streamingBotBodyEl = null;
        }
        requestInProgress = false;
        input.disabled = false;
        updateSendStopBtn();
        if (chatContainer.style.display === 'none' || chatContainer.style.visibility === 'hidden') {
          trySaveCurrentSession();
        }
        return;
      }
      if (!streamingBotMsg) {
        const streamEl = document.createElement('div');
        streamEl.className = 'mini-gpt-msg-bot';
        const { row, body, actions } = buildBotMessageRow();
        streamEl.appendChild(row);
        streamingBotMsg = streamEl;
        streamingBotBodyEl = body;
        messagesDiv.appendChild(streamEl);
        setTimeout(() => {
          safeScrollIntoView(streamEl, { behavior: 'smooth', block: 'start' });
        }, 100);
      }
      if (msg.answerPart) {
        streamingBotText += msg.answerPart;
        const el = streamingBotBodyEl || streamingBotMsg.querySelector('.mini-gpt-msg-body');
        if (el) el.innerHTML = convertMarkdownToHTML(streamingBotText);
        else streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
      }
    }
  });

  // Patch loader logic in form.onsubmit
  form.onsubmit = (e) => {
    e.preventDefault();
    const question = input.value.trim();
    // If a request is in progress, stop it
    if (requestInProgress) {
      stopResponse();
      return;
    }
    if (!question) return;
    sendPrompt();
  };
  
  // Enhanced stop response function
  function stopResponse() {
    stopSpeechRecognition();
    stopAllVoiceOutput();
    chrome.runtime.sendMessage({ type: 'MINI_GPT_STOP' }, () => {
      removeLoader();
      
      // Handle incomplete streaming response
      if (streamingBotMsg && streamingBotText) {
        // Add visual indicator for incomplete response
        const incompleteIndicator = document.createElement('div');
        incompleteIndicator.className = 'mini-gpt-incomplete-indicator';
        incompleteIndicator.innerHTML = `
          <span style="color: #ef4444; font-size: 0.8em; font-style: italic;">
            [Response stopped by user]
          </span>
        `;
        const stBody = streamingBotMsg.querySelector('.mini-gpt-msg-body');
        if (stBody) {
          stBody.innerHTML = convertMarkdownToHTML(streamingBotText);
          stBody.appendChild(incompleteIndicator);
        } else {
          streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
          streamingBotMsg.appendChild(incompleteIndicator);
        }
        streamingBotMsg = null;
        streamingBotText = '';
        streamingBotBodyEl = null;
      }
      
      requestInProgress = false;
      input.disabled = false;
      updateSendStopBtn();
    });
  }
  
  // Function to detect incomplete responses
  function checkIfResponseIncomplete(text) {
    if (!text || text.length < 50) return false;
    
    const trimmedText = text.trim();
    const lastLine = trimmedText.split('\n').pop().trim();

    // Trailing comma is a valid ending in many contexts (email sign-offs, lists, etc.)
    // Only flag as incomplete if the comma is in the MIDDLE of a sentence (not as last token of last line)
    if (/\.{3}$|…$/.test(trimmedText)) return true;
    
    // Flag if it ends with a colon followed by nothing and last line is long (was about to list something)
    if (/:$/.test(trimmedText) && lastLine.length > 10) return true;
    
    // Flag if it clearly got cut off mid-word (ends with a letter after a very long response)
    // Only for long responses where max_tokens was likely hit
    if (trimmedText.length > 1500 && /[a-zA-Z]$/.test(trimmedText) && !/[.!?:;)\]"',]$/.test(trimmedText)) {
      // Check the last line isn't a list item or heading (those can end without punctuation)
      if (lastLine.length > 40 && !/^[-*•\d#]/.test(lastLine)) {
        return true;
      }
    }
    
    return false;
  }

  function sendPrompt() {
    stopAllVoiceActivity();
    const question = input.value.trim();
    const hasVision = !!(pendingVision && pendingVision.base64 && pendingVision.base64.length > 80);
    if (!question && !hasVision) return;

    const provider = currentProvider;
    if (hasVision && provider === 'huggingface') {
      appendMessage(translate('visionProviderOnly'), 'bot');
      return;
    }
    const visionModelDefault = providerHelpers.getDefaultVisionModelForProvider
      ? providerHelpers.getDefaultVisionModelForProvider(provider)
      : ((providerConfig.visionDefaultModels || {})[provider] || DEFAULT_MODELS[provider]);
    const model = hasVision
      ? visionModelDefault
      : (provider === 'huggingface' ? HF_MODELS[0] : DEFAULT_MODELS[provider]);

    chrome.storage.local.get([`apiKey_${provider}`, 'promptPrefix'], (settings) => {
      const apiKey = settings[`apiKey_${provider}`] || '';
      if (!apiKey) {
        appendMessage(translate('pleaseSetApiKey'), 'bot');
        return;
      }
      
      // Get prompt prefix from settings (default: simple, direct, resume answer)
      const promptPrefix = settings.promptPrefix || DEFAULT_PROMPT_PREFIX;
      const textPart = question || translate('visionDefaultAsk');
      const enhancedQuestion = promptPrefix + textPart;
      const displayUser = textPart + (hasVision ? ' · 📷' : '');
      
      appendMessage(displayUser, 'user');
      input.value = '';
      input.style.height = 'auto';
      // Add animated loader as bot message
      const loader = document.createElement('div');
      loader.className = 'mini-gpt-msg-bot mini-gpt-msg-loader-bubble';
      loader.setAttribute('aria-label', translate('thinking'));
      loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
      messagesDiv.appendChild(loader);
      const loaderEl = loader;
      setTimeout(() => {
        safeScrollIntoView(loaderEl, { behavior: 'smooth', block: 'start' });
      }, 100);
      requestInProgress = true;
      input.disabled = true;
      updateSendStopBtn();
      streamingBotMsg = null;
      streamingBotText = '';
      streamingBotBodyEl = null;
      const hfModels = !hasVision && provider === 'huggingface' ? HF_MODELS : undefined;
      const hfVisionModels = hasVision && provider === 'huggingface' ? HF_VISION_MODELS : undefined;
      const payload = {
        type: 'MINI_GPT_ASK',
        question: enhancedQuestion,
        provider,
        model,
        apiKey,
        conversationContext: conversationContext,
        hfModels
      };
      if (hasVision) {
        payload.imageBase64 = pendingVision.base64;
        payload.imageMime = pendingVision.mime || 'image/jpeg';
        if (hfVisionModels) payload.hfVisionModels = hfVisionModels;
      }
      clearPendingVision();
      window.postMessage(payload, '*');
    });
  }

  // Listen for answers from window and update UI
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MINI_GPT_ANSWER') {
      removeLoader();
      appendMessage(event.data.answer, 'bot');
      requestInProgress = false;
      input.disabled = false;
      updateSendStopBtn();
    }
  });

  // Keyboard shortcuts (Ctrl+Shift+H avoids browser "History" on Ctrl+H)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      if (chatContainer.style.display === 'flex') {
        showHistoryPanel();
      }
    }
  });

  // Relay MINI_GPT_ASK from window to background
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MINI_GPT_ASK') {
      const relay = {
        type: 'MINI_GPT_ASK',
        question: event.data.question,
        provider: event.data.provider,
        model: event.data.model,
        apiKey: event.data.apiKey,
        conversationContext: event.data.conversationContext || [],
        hfModels: event.data.hfModels
      };
      if (event.data.imageBase64) {
        relay.imageBase64 = event.data.imageBase64;
        relay.imageMime = event.data.imageMime || 'image/jpeg';
      }
      if (event.data.hfVisionModels) relay.hfVisionModels = event.data.hfVisionModels;
      chrome.runtime.sendMessage(relay);
    }
  });

  function formatDatetimeLocal(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** Match popup dark mode (storage) with in-chat toggle (mini-gpt-dark). */
  function getReminderThemeDark(callback) {
    chrome.storage.local.get(['darkMode'], (data) => {
      if (chrome.runtime.lastError) {
        callback(chatContainer.classList.contains('mini-gpt-dark'));
        return;
      }
      const fromStorage = data.darkMode === true || data.darkMode === 'true';
      const fromChat = chatContainer.classList.contains('mini-gpt-dark');
      callback(Boolean(fromStorage || fromChat));
    });
  }

  function showEasyAiReminderCard(title, note) {
    document.querySelectorAll('.easyai-reminder-layer').forEach((el) => el.remove());
    bubble.classList.remove('easyai-reminder-bubble-pulse');

    const wasSuppressed = easyaiUiSuppressed;
    bubble.style.transition = 'none';
    bubble.style.display = 'flex';
    bubble.style.visibility = 'visible';
    bubble.style.opacity = '1';
    bubble.style.transform = 'scale(1) translateY(0)';
    bubble.classList.add('easyai-reminder-bubble-pulse');

    getReminderThemeDark((useDark) => {
      const layer = document.createElement('div');
      layer.className = 'easyai-reminder-layer';
      if (useDark) layer.classList.add('easyai-reminder-layer--dark');
      layer.setAttribute('role', 'dialog');
      layer.setAttribute('aria-label', translate('reminderModalTitle'));

      const h = document.createElement('div');
      h.className = 'easyai-reminder-layer__title';
      h.textContent = title || translate('reminderModalTitle');

      const body = document.createElement('div');
      body.className = 'easyai-reminder-layer__note';
      body.textContent = (note || '').trim();

      const actions = document.createElement('div');
      actions.className = 'easyai-reminder-layer__actions';

      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.className = 'easyai-reminder-layer__btn easyai-reminder-layer__btn--primary';
      dismissBtn.textContent = translate('reminderDismiss');

      actions.appendChild(dismissBtn);

      layer.appendChild(h);
      if ((note || '').trim()) layer.appendChild(body);
      layer.appendChild(actions);
      document.body.appendChild(layer);

      function reposition() {
        const r = bubble.getBoundingClientRect();
        const cardW = 300;
        const hgt = layer.offsetHeight || 120;
        const left = Math.min(window.innerWidth - cardW - 8, Math.max(8, r.left + r.width / 2 - cardW / 2));
        const top = Math.max(8, r.top - hgt - 12);
        layer.style.left = left + 'px';
        layer.style.top = top + 'px';
      }

      const resizeHandler = () => reposition();
      requestAnimationFrame(() => {
        reposition();
        window.addEventListener('resize', resizeHandler);
      });

      function dismiss() {
        bubble.classList.remove('easyai-reminder-bubble-pulse');
        window.removeEventListener('resize', resizeHandler);
        layer.remove();
        if (wasSuppressed) {
          bubble.style.display = 'none';
          bubble.style.visibility = 'hidden';
          bubble.style.opacity = '0';
        } else {
          syncBubbleVisibility();
        }
      }

      dismissBtn.onclick = (e) => {
        e.preventDefault();
        dismiss();
      };
    });
  }

  function showReminderModal() {
    const existing = document.getElementById('easyai-reminder-modal-root');
    if (existing) existing.remove();

    getReminderThemeDark((useDark) => {
      const root = document.createElement('div');
      root.id = 'easyai-reminder-modal-root';
      root.className = 'easyai-reminder-modal-root';
      if (useDark) root.classList.add('easyai-reminder-modal-root--dark');
      const backdrop = document.createElement('div');
      backdrop.className = 'easyai-reminder-modal-backdrop';
      const panel = document.createElement('div');
      panel.className = 'easyai-reminder-modal-panel';
      if (useDark) panel.classList.add('easyai-reminder-modal-panel--dark');

      const head = document.createElement('div');
      head.className = 'easyai-reminder-modal-head';
      head.textContent = translate('reminderModalTitle');

      const titleIn = document.createElement('input');
    titleIn.type = 'text';
    titleIn.className = 'easyai-reminder-modal-input';
    titleIn.placeholder = translate('reminderTitlePlaceholder');
    titleIn.setAttribute('aria-label', translate('reminderTitleLabel'));

    const noteTa = document.createElement('textarea');
    noteTa.className = 'easyai-reminder-modal-textarea';
    noteTa.rows = 3;
    noteTa.placeholder = translate('reminderNotePlaceholder');
    noteTa.setAttribute('aria-label', translate('reminderNoteLabel'));

    const whenLbl = document.createElement('label');
    whenLbl.className = 'easyai-reminder-modal-label';
    whenLbl.textContent = translate('reminderWhenLabel');
    const whenIn = document.createElement('input');
    whenIn.type = 'datetime-local';
    whenIn.className = 'easyai-reminder-modal-input';
    const d0 = new Date(Date.now() + 60 * 60 * 1000);
    d0.setSeconds(0, 0);
    whenIn.value = formatDatetimeLocal(d0);

    const presets = document.createElement('div');
    presets.className = 'easyai-reminder-modal-presets';
    function addPreset(label, ms) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'easyai-reminder-modal-preset';
      b.textContent = label;
      b.onclick = () => {
        const t = new Date(Date.now() + ms);
        t.setSeconds(0, 0);
        whenIn.value = formatDatetimeLocal(t);
      };
      presets.appendChild(b);
    }
    addPreset(translate('reminderPreset15m'), 15 * 60 * 1000);
    addPreset(translate('reminderPreset1h'), 60 * 60 * 1000);
    addPreset(translate('reminderPreset3h'), 3 * 60 * 60 * 1000);
    const tomorrowBtn = document.createElement('button');
    tomorrowBtn.type = 'button';
    tomorrowBtn.className = 'easyai-reminder-modal-preset';
    tomorrowBtn.textContent = translate('reminderPresetTomorrow');
    tomorrowBtn.onclick = () => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(9, 0, 0, 0);
      whenIn.value = formatDatetimeLocal(t);
    };
    presets.appendChild(tomorrowBtn);

    const actions = document.createElement('div');
    actions.className = 'easyai-reminder-modal-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'easyai-reminder-modal-btn';
    cancelBtn.textContent = translate('cancel');
    const goBtn = document.createElement('button');
    goBtn.type = 'button';
    goBtn.className = 'easyai-reminder-modal-btn easyai-reminder-modal-btn--primary';
    goBtn.textContent = translate('reminderSchedule');
    actions.appendChild(cancelBtn);
    actions.appendChild(goBtn);

    panel.appendChild(head);
    panel.appendChild(titleIn);
    panel.appendChild(noteTa);
    panel.appendChild(whenLbl);
    panel.appendChild(whenIn);
    panel.appendChild(presets);
    panel.appendChild(actions);
    root.appendChild(backdrop);
    root.appendChild(panel);
    document.body.appendChild(root);

    function close() {
      root.remove();
    }
    backdrop.onclick = close;
    cancelBtn.onclick = close;
    goBtn.onclick = () => {
      const title = titleIn.value.trim();
      const note = noteTa.value.trim();
      const whenMs = new Date(whenIn.value).getTime();
      if (!title || !Number.isFinite(whenMs)) {
        showVoiceNotice(translate('reminderInvalidTime'), 'error');
        return;
      }
      chrome.runtime.sendMessage(
        { type: 'EASYAI_REMINDER_SCHEDULE', title, note, when: whenMs },
        (res) => {
          if (chrome.runtime.lastError || !res || !res.ok) {
            showVoiceNotice(translate('reminderInvalidTime'), 'error');
            return;
          }
          showVoiceNotice(translate('reminderScheduled'), 'info');
          close();
        }
      );
    };
    titleIn.focus();
    });
  }

  // Relay MINI_GPT_ANSWER from background to chat UI
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'MINI_GPT_ANSWER') {
      window.postMessage({ type: 'MINI_GPT_ANSWER', answer: msg.answer }, '*');
    }
    if (msg.type === 'EASYAI_REMINDER_SHOW') {
      showEasyAiReminderCard(msg.title || '', msg.note || '');
    }
    // Sync dark mode from popup toggle
    if (msg.type === 'EASYAI_DARKMODE_UPDATED') {
      applyDarkMode(msg.darkMode === true);
    }
    // Toggle via keyboard shortcut: hide bubble + chat until user shows again (shortcut or popup)
    if (msg.type === 'EASYAI_TOGGLE_CHAT') {
      const isChatVisible = chatContainer.style.display === 'flex' && chatContainer.style.visibility === 'visible';
      const isBubbleVisible = bubble.style.display === 'flex' && bubble.style.visibility === 'visible';

      if (isChatVisible || isBubbleVisible) {
        easyaiUiSuppressed = true;
        chrome.storage.local.set({ easyaiUiSuppressed: true });
        stopAllVoiceActivity();
        chatContainer.style.display = 'none';
        chatContainer.style.visibility = 'hidden';
        chatContainer.style.opacity = '0';
        bubble.style.display = 'none';
        bubble.style.visibility = 'hidden';
        bubble.style.opacity = '0';
        if (isChatVisible) trySaveCurrentSession();
      } else {
        easyaiUiSuppressed = false;
        chrome.storage.local.set({ easyaiUiSuppressed: false });
        showBubbleInstant();
      }
    }
    if (msg.type === 'EASYAI_SET_UI_SUPPRESSED') {
      const suppressed = msg.suppressed === true;
      easyaiUiSuppressed = suppressed;
      if (suppressed) {
        stopAllVoiceActivity();
        const chatWasOpen = chatContainer.style.display === 'flex' && chatContainer.style.visibility === 'visible';
        chatContainer.style.display = 'none';
        chatContainer.style.visibility = 'hidden';
        chatContainer.style.opacity = '0';
        bubble.style.display = 'none';
        bubble.style.visibility = 'hidden';
        bubble.style.opacity = '0';
        if (chatWasOpen) trySaveCurrentSession();
      } else {
        updateBubbleVisibility();
      }
    }
  });

  // --- Chat Resize Handle (top-left corner) ---
  const resizeHandle = document.createElement('div');
  resizeHandle.id = 'easyai-resize-handle';
  resizeHandle.title = 'Drag to resize';
  resizeHandle.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="11" y1="1" x2="1" y2="11"/><line x1="11" y1="5" x2="5" y2="11"/><line x1="11" y1="9" x2="9" y2="11"/></svg>`;
  chatContainer.appendChild(resizeHandle);

  let isResizing = false;
  let resizeStartX, resizeStartY, resizeStartW, resizeStartH, resizeStartLeft, resizeStartTop;

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    const rect = chatContainer.getBoundingClientRect();
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartW = rect.width;
    resizeStartH = rect.height;
    resizeStartLeft = rect.left;
    resizeStartTop = rect.top;
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    // Dragging top-left corner: moving left/up = bigger, right/down = smaller
    const dx = resizeStartX - e.clientX;
    const dy = resizeStartY - e.clientY;
    const newW = Math.max(320, Math.min(resizeStartW + dx, window.innerWidth - 20));
    const newH = Math.max(300, Math.min(resizeStartH + dy, window.innerHeight - 20));

    chatContainer.style.setProperty('width', newW + 'px', 'important');
    chatContainer.style.setProperty('height', newH + 'px', 'important');
    chatContainer.style.setProperty('max-height', newH + 'px', 'important');
    chatContainer.style.setProperty('min-height', newH + 'px', 'important');
    // Adjust position so bottom-right stays anchored
    chatContainer.style.setProperty('left', (resizeStartLeft - dx) + 'px', 'important');
    chatContainer.style.setProperty('top', (resizeStartTop - dy) + 'px', 'important');
    chatContainer.style.setProperty('right', 'auto', 'important');
    chatContainer.style.setProperty('bottom', 'auto', 'important');
    // Also allow messages area to fill
    const msgArea = chatContainer.querySelector('#mini-gpt-messages');
    if (msgArea) msgArea.style.setProperty('max-height', 'none', 'important');
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // --- Modernized Chat Header Bar ---
  const header = chatContainer.querySelector('.mini-gpt-header');
  header.style.background = 'rgba(245, 247, 250, 0.98)';
  header.style.borderBottom = '1.5px solid #e5e7eb';
  header.style.borderTopLeftRadius = '16px';
  header.style.borderTopRightRadius = '16px';
  header.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '0 10px 0 18px';
  header.style.height = '54px';

  // Remove all existing header buttons
  Array.from(header.querySelectorAll('button')).forEach(btn => btn.remove());

  // Modern action bar
  const actionsBar = document.createElement('div');
  actionsBar.style.display = 'flex';
  actionsBar.style.alignItems = 'center';
  actionsBar.style.gap = '8px';
  actionsBar.style.height = '100%';

  // New chat (always visible)
  const newChatBtn = document.createElement('button');
  newChatBtn.className = 'mini-gpt-action-btn';
  newChatBtn.id = 'mini-gpt-newchat-btn';
  newChatBtn.title = translate('newChatTooltip');
  newChatBtn.setAttribute('aria-label', translate('newChatAria'));
  newChatBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
  newChatBtn.style.background = 'none';
  newChatBtn.style.border = 'none';
  newChatBtn.style.padding = '6px';
  newChatBtn.style.borderRadius = '8px';
  newChatBtn.style.cursor = 'pointer';
  newChatBtn.style.transition = 'background 0.18s';
  newChatBtn.onmouseenter = () => newChatBtn.style.background = '#e8f0fe';
  newChatBtn.onmouseleave = () => newChatBtn.style.background = 'none';
  actionsBar.appendChild(newChatBtn);

  // Overflow ⋯ : history, reminder, theme
  const overflowWrap = document.createElement('div');
  overflowWrap.className = 'mini-gpt-overflow-wrap';

  const overflowBtn = document.createElement('button');
  overflowBtn.type = 'button';
  overflowBtn.className = 'mini-gpt-action-btn';
  overflowBtn.id = 'mini-gpt-overflow-btn';
  overflowBtn.title = translate('moreMenuTooltip');
  overflowBtn.setAttribute('aria-label', translate('moreMenuAria'));
  overflowBtn.setAttribute('aria-haspopup', 'true');
  overflowBtn.setAttribute('aria-expanded', 'false');
  overflowBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`;
  overflowBtn.style.background = 'none';
  overflowBtn.style.border = 'none';
  overflowBtn.style.padding = '6px';
  overflowBtn.style.borderRadius = '8px';
  overflowBtn.style.cursor = 'pointer';
  overflowBtn.style.transition = 'background 0.18s';

  const overflowMenu = document.createElement('div');
  overflowMenu.className = 'mini-gpt-overflow-menu';
  overflowMenu.setAttribute('role', 'menu');
  overflowMenu.style.display = 'none';

  const historyBtn = document.createElement('button');
  historyBtn.className = 'mini-gpt-action-btn';
  historyBtn.id = 'mini-gpt-history-btn';
  historyBtn.type = 'button';
  historyBtn.title = translate('showHistoryTooltip');
  historyBtn.setAttribute('aria-label', translate('showHistoryAria'));
  historyBtn.setAttribute('role', 'menuitem');
  historyBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 12 3 16 7 16"/></svg>`;
  historyBtn.style.background = 'none';
  historyBtn.style.border = 'none';
  historyBtn.style.padding = '6px';
  historyBtn.style.borderRadius = '8px';
  historyBtn.style.cursor = 'pointer';
  historyBtn.style.transition = 'background 0.18s';
  historyBtn.onmouseenter = () => historyBtn.style.background = '#e8f0fe';
  historyBtn.onmouseleave = () => historyBtn.style.background = 'none';
  overflowMenu.appendChild(historyBtn);

  const reminderBtn = document.createElement('button');
  reminderBtn.className = 'mini-gpt-action-btn';
  reminderBtn.id = 'mini-gpt-reminder-btn';
  reminderBtn.type = 'button';
  reminderBtn.title = translate('reminderBtnTitle');
  reminderBtn.setAttribute('aria-label', translate('reminderBtnAria'));
  reminderBtn.setAttribute('role', 'menuitem');
  reminderBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
  reminderBtn.style.background = 'none';
  reminderBtn.style.border = 'none';
  reminderBtn.style.padding = '6px';
  reminderBtn.style.borderRadius = '8px';
  reminderBtn.style.cursor = 'pointer';
  reminderBtn.style.transition = 'background 0.18s';
  reminderBtn.onmouseenter = () => reminderBtn.style.background = '#e8f0fe';
  reminderBtn.onmouseleave = () => reminderBtn.style.background = 'none';
  overflowMenu.appendChild(reminderBtn);

  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'mini-gpt-action-btn';
  settingsBtn.id = 'mini-gpt-settings-btn';
  settingsBtn.type = 'button';
  settingsBtn.title = translate('menuSettings');
  settingsBtn.setAttribute('aria-label', translate('menuSettingsAria'));
  settingsBtn.setAttribute('role', 'menuitem');
  settingsBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`;
  settingsBtn.style.background = 'none';
  settingsBtn.style.border = 'none';
  settingsBtn.style.padding = '6px';
  settingsBtn.style.borderRadius = '8px';
  settingsBtn.style.cursor = 'pointer';
  settingsBtn.style.transition = 'background 0.18s';
  settingsBtn.onmouseenter = () => settingsBtn.style.background = '#e8f0fe';
  settingsBtn.onmouseleave = () => settingsBtn.style.background = 'none';
  overflowMenu.appendChild(settingsBtn);

  const copyConversationBtn = document.createElement('button');
  copyConversationBtn.className = 'mini-gpt-action-btn';
  copyConversationBtn.id = 'mini-gpt-copy-conversation-btn';
  copyConversationBtn.type = 'button';
  copyConversationBtn.title = translate('menuCopyConversation');
  copyConversationBtn.setAttribute('aria-label', translate('menuCopyConversationAria'));
  copyConversationBtn.setAttribute('role', 'menuitem');
  copyConversationBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01"/></svg>`;
  copyConversationBtn.style.background = 'none';
  copyConversationBtn.style.border = 'none';
  copyConversationBtn.style.padding = '6px';
  copyConversationBtn.style.borderRadius = '8px';
  copyConversationBtn.style.cursor = 'pointer';
  copyConversationBtn.style.transition = 'background 0.18s';
  copyConversationBtn.onmouseenter = () => copyConversationBtn.style.background = '#e8f0fe';
  copyConversationBtn.onmouseleave = () => copyConversationBtn.style.background = 'none';
  overflowMenu.appendChild(copyConversationBtn);

  const darkModeBtn = document.createElement('button');
  darkModeBtn.className = 'mini-gpt-action-btn';
  darkModeBtn.id = 'mini-gpt-darkmode-btn';
  darkModeBtn.type = 'button';
  darkModeBtn.title = 'Toggle dark mode';
  darkModeBtn.setAttribute('aria-label', 'Toggle dark mode');
  darkModeBtn.setAttribute('role', 'menuitem');
  const sunIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  darkModeBtn.innerHTML = moonIcon;
  darkModeBtn.style.background = 'none';
  darkModeBtn.style.border = 'none';
  darkModeBtn.style.padding = '6px';
  darkModeBtn.style.borderRadius = '8px';
  darkModeBtn.style.cursor = 'pointer';
  darkModeBtn.style.transition = 'background 0.18s';
  overflowMenu.appendChild(darkModeBtn);

  function closeOverflowMenu() {
    overflowMenu.style.display = 'none';
    overflowBtn.setAttribute('aria-expanded', 'false');
  }

  overflowWrap.appendChild(overflowBtn);
  overflowWrap.appendChild(overflowMenu);
  actionsBar.appendChild(overflowWrap);

  overflowBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = overflowMenu.style.display !== 'flex';
    overflowMenu.style.display = open ? 'flex' : 'none';
    overflowMenu.style.flexDirection = 'column';
    overflowBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('mousedown', (ev) => {
    if (!overflowWrap.contains(ev.target)) closeOverflowMenu();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeOverflowMenu();
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mini-gpt-action-btn';
  closeBtn.id = 'mini-gpt-close';
  closeBtn.setAttribute('aria-label', translate('closeChatAria'));
  closeBtn.title = translate('closeChatTooltip');
  closeBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.padding = '6px';
  closeBtn.style.borderRadius = '8px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.transition = 'background 0.18s';
  closeBtn.onmouseenter = () => closeBtn.style.background = '#e8f0fe';
  closeBtn.onmouseleave = () => closeBtn.style.background = 'none';
  actionsBar.appendChild(closeBtn);

  function copyCurrentConversationToClipboard() {
    const msgs = currentSession.messages || [];
    if (!msgs.length) {
      showVoiceNotice(translate('nothingToCopyChat'), 'info');
      return;
    }
    const lines = msgs.map((m) => {
      const label = m.role === 'user' ? translate('copyConvYou') : translate('copyConvAssistant');
      return `${label}: ${m.text}`;
    });
    const text = lines.join('\n\n');
    const done = () => showVoiceNotice(translate('chatCopied'), 'info');
    const fallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (_) {
        showVoiceNotice(translate('errorOccurred'), 'error');
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  // Keyboard accessibility
  [historyBtn, newChatBtn, reminderBtn, settingsBtn, copyConversationBtn, darkModeBtn, closeBtn, overflowBtn].forEach(btn => {
    btn.tabIndex = 0;
    btn.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    };
  });

  // Update action bar button styles for compact, title-matching icons
  [historyBtn, newChatBtn, reminderBtn, settingsBtn, copyConversationBtn, darkModeBtn, closeBtn, overflowBtn].forEach(btn => {
    btn.style.width = '28px';
    btn.style.height = '28px';
    btn.style.padding = '2px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.fontSize = '0';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background 0.18s';
    btn.onmouseenter = () => {
      if (chatContainer.classList.contains('mini-gpt-dark')) {
        btn.style.background = 'rgba(var(--browsemate-browse-rgb), 0.13)';
      } else {
        btn.style.background = '#e8f0fe';
      }
      // Make SVG icon color high-contrast on hover
      const svg = btn.querySelector('svg');
      if (svg) svg.style.stroke = chatContainer.classList.contains('mini-gpt-dark') ? '#fff' : 'var(--browsemate-browse)';
    };
    btn.onmouseleave = () => {
      btn.style.background = 'none';
      // Restore SVG icon color
      const svg = btn.querySelector('svg');
      if (svg) svg.style.stroke = chatContainer.classList.contains('mini-gpt-dark') ? '#e8f0fe' : '#23272f';
    };
    // Set initial SVG color and size
    const svg = btn.querySelector('svg');
    if (svg) svg.style.stroke = chatContainer.classList.contains('mini-gpt-dark') ? '#e8f0fe' : '#23272f';
    svg.style.width = '22px';
    svg.style.height = '22px';
  });

  // Insert the modern action bar into the header
  header.appendChild(actionsBar);

  // Manual dark mode toggle (must be after button creation)
  let isDarkMode = false;

  function syncReminderUiTheme(dark) {
    const root = document.getElementById('easyai-reminder-modal-root');
    if (root) {
      const panel = root.querySelector('.easyai-reminder-modal-panel');
      root.classList.toggle('easyai-reminder-modal-root--dark', dark);
      if (panel) panel.classList.toggle('easyai-reminder-modal-panel--dark', dark);
    }
    document.querySelectorAll('.easyai-reminder-layer').forEach((el) => {
      el.classList.toggle('easyai-reminder-layer--dark', dark);
    });
  }
  
  function applyDarkMode(dark) {
    isDarkMode = dark;
    if (dark) {
      chatContainer.classList.add('mini-gpt-dark');
      bubble.classList.add('mini-gpt-dark');
      if (typeof selToolbar !== 'undefined' && selToolbar) selToolbar.classList.add('mini-gpt-dark');
      darkModeBtn.innerHTML = sunIcon;
    } else {
      chatContainer.classList.remove('mini-gpt-dark');
      bubble.classList.remove('mini-gpt-dark');
      if (typeof selToolbar !== 'undefined' && selToolbar) selToolbar.classList.remove('mini-gpt-dark');
      darkModeBtn.innerHTML = moonIcon;
    }
    // Update button icon colors after mode change
    [historyBtn, newChatBtn, reminderBtn, settingsBtn, copyConversationBtn, darkModeBtn, closeBtn, overflowBtn].forEach(btn => {
      const svg = btn.querySelector('svg');
      if (svg) svg.style.stroke = dark ? '#e8f0fe' : '#23272f';
    });
    // Save preference
    chrome.storage.local.set({ darkMode: dark });
    syncReminderUiTheme(dark);
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || changes.darkMode === undefined) return;
    const v = changes.darkMode.newValue;
    const dark = v === true || v === 'true';
    syncReminderUiTheme(dark);
  });
  
  // Load saved preference, default to light
  chrome.storage.local.get(['darkMode'], (data) => {
    applyDarkMode(data.darkMode === true);
  });
  
  darkModeBtn.onclick = () => {
    applyDarkMode(!isDarkMode);
    closeOverflowMenu();
  };

  // Attach event listeners
  historyBtn.onclick = () => {
    closeOverflowMenu();
    showHistoryPanel();
  };
  reminderBtn.onclick = () => {
    closeOverflowMenu();
    showReminderModal();
  };
  settingsBtn.onclick = () => {
    closeOverflowMenu();
    chrome.runtime.openOptionsPage(() => {
      if (chrome.runtime.lastError) {
        showVoiceNotice(chrome.runtime.lastError.message, 'error');
      }
    });
  };
  copyConversationBtn.onclick = () => {
    closeOverflowMenu();
    copyCurrentConversationToClipboard();
  };
  newChatBtn.onclick = () => {
    stopAllVoiceActivity();
    // Save current session if it has messages and no request is in progress
    if (currentSession.messages.length > 0 && !requestInProgress) {
      trySaveCurrentSession();
    }
    
    // Always reset session for new chat
    resetSession();
    messagesDiv.innerHTML = '';
    showEmptyPlaceholder();
    
    // Force clear any lingering conversation context
    conversationContext = [];
    
    // Ensure chat stays visible when starting new chat
    if (chatContainer.style.display === 'none') {
      chatContainer.style.display = 'flex';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.opacity = '1';
    }
    
    // New chat started: context cleared
  };
  closeBtn.onclick = () => {
    stopAllVoiceActivity();
    trySaveCurrentSession();
    chatContainer.style.display = 'none';
    chatContainer.style.visibility = 'hidden';
    chatContainer.style.opacity = '0';
  };

  // After chatContainer.innerHTML is set up
  // --- Quick Actions Dropdown ---
  const quickActionsBtn = chatContainer.querySelector('#mini-gpt-quick-actions-btn');
  let quickActionsDropdown = null;

  // Helper to check if page is suitable for quick actions
  function isPageContentValid() {
    const text = getMainPageText();
    if (!text || text.length < 120) return false;
    const lower = text.toLowerCase();
    // Add more error keywords as needed
    if (lower.includes('error') || lower.includes('problem loading') || lower.includes('javascript') || lower.includes('cache') || lower.includes('cookie')) return false;
    return true;
  }

  function updateQuickActionsBtnState() {
    if (!isPageContentValid()) {
      quickActionsBtn.disabled = true;
      quickActionsBtn.style.opacity = '0.45';
      quickActionsBtn.style.cursor = 'not-allowed';
      quickActionsBtn.title = translate('quickActionsDisabledTooltip');
    } else {
      quickActionsBtn.disabled = false;
      quickActionsBtn.style.opacity = '1';
      quickActionsBtn.style.cursor = 'pointer';
      quickActionsBtn.title = translate('quickActionsTooltip');
    }
  }
  updateQuickActionsBtnState();
  // Also update on navigation or DOM changes
  window.addEventListener('DOMContentLoaded', updateQuickActionsBtnState);
  window.addEventListener('load', updateQuickActionsBtnState);
  setTimeout(updateQuickActionsBtnState, 1200);

  function getMainPageText() {
    // Clone the body so we don't affect the real DOM
    const bodyClone = document.body.cloneNode(true);
    
    // Remove extension UI elements and other unwanted content
    const selectorsToRemove = [
      '.mini-gpt-chat-container', '#mini-gpt-bubble', '#mini-gpt-history-panel', 
      '#mini-gpt-quick-actions-dropdown', '#mini-gpt-clear-modal', '#mini-gpt-history-overlay',
      'script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'img[alt=""]',
      '[style*="display: none"]', '[style*="visibility: hidden"]', '[hidden]',
      '.ad', '.advertisement', '.ads', '.banner', '.sidebar', '.footer', '.header',
      'nav', 'aside', '.navigation', '.menu', '.toolbar', '.controls'
    ];
    
    selectorsToRemove.forEach(selector => {
      bodyClone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Try to find the main content area
    let contentElement = bodyClone.querySelector('main') || 
                        bodyClone.querySelector('[role="main"]') ||
                        bodyClone.querySelector('.main') ||
                        bodyClone.querySelector('#main') ||
                        bodyClone.querySelector('.content') ||
                        bodyClone.querySelector('#content') ||
                        bodyClone.querySelector('article') ||
                        bodyClone.querySelector('.article');
    
    let text = '';
    
    if (contentElement) {
      // Extract text from main content area
      text = contentElement.innerText || contentElement.textContent || '';
    } else {
      // Fallback: extract from body but filter out CSS and JS
      const allText = bodyClone.innerText || bodyClone.textContent || '';
      
      // Split by lines and filter out CSS-like content
      const lines = allText.split('\n').filter(line => {
        const trimmed = line.trim();
        // Skip empty lines
        if (!trimmed) return false;
        
        // Skip CSS-like lines (containing {, }, :, ;)
        if (trimmed.includes('{') && trimmed.includes('}')) return false;
        if (trimmed.includes(':') && trimmed.includes(';')) return false;
        
        // Skip lines that are mostly special characters or numbers
        const specialCharRatio = (trimmed.match(/[{}();:]/g) || []).length / trimmed.length;
        if (specialCharRatio > 0.3) return false;
        
        // Skip very short lines that are likely CSS selectors
        if (trimmed.length < 3 && trimmed.includes('.')) return false;
        
        // Skip lines that look like CSS properties
        const cssProperties = ['display:', 'position:', 'width:', 'height:', 'background:', 'color:', 'margin:', 'padding:', 'border:', 'font-', 'text-', 'flex', 'grid'];
        if (cssProperties.some(prop => trimmed.includes(prop))) return false;
        
        return true;
      });
      
      text = lines.join('\n').trim();
    }
    
    // Clean up the text
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit length and add ellipsis if needed
    return text.length > 3000 ? text.slice(0, 3000) + '…' : text;
  }
  function sendSpeedPrompt(type) {
    let prompt = '';
    let userMsg = '';
    const pageText = getMainPageText();
    if (!pageText) {
      appendMessage(translate('noTextFound'), 'bot');
      return;
    }
    if (type === 'summarize') {
      userMsg = translate('summarize');
      prompt = `Summarize the following page in 3 to 5 short sentences. Be brief:\n\n${pageText}`;
    } else if (type === 'explain') {
      userMsg = translate('explain');
      prompt = `Explain the key idea of the following page in 3 to 5 short sentences. Be brief:\n\n${pageText}`;
    }
    // Show only the short user message in chat, but send the full prompt
    appendMessage(userMsg, 'user');
    // Add animated loader as bot message
    const loader = document.createElement('div');
    loader.className = 'mini-gpt-msg-bot mini-gpt-msg-loader-bubble';
    loader.setAttribute('aria-label', translate('thinking'));
    loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
    messagesDiv.appendChild(loader);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    requestInProgress = true;
    input.disabled = true;
    updateSendStopBtn();
    streamingBotMsg = null;
    streamingBotText = '';
    streamingBotBodyEl = null;
    // Send to backend directly — quick actions have their own length instruction, no prefix needed
    const provider = currentProvider;
    const model = DEFAULT_MODELS[provider];
    chrome.storage.local.get([`apiKey_${provider}`], (settings) => {
      const apiKey = settings[`apiKey_${provider}`] || '';
      if (!apiKey) {
        appendMessage(translate('pleaseSetApiKey'), 'bot');
        return;
      }
      window.postMessage({ type: 'MINI_GPT_ASK', question: prompt, provider, model, apiKey }, '*');
    });
  }
  function showQuickActionsDropdown() {
    if (quickActionsDropdown) { 
      quickActionsDropdown.remove(); 
      quickActionsDropdown = null; 
      return; 
    }
    
    quickActionsDropdown = document.createElement('div');
    quickActionsDropdown.id = 'mini-gpt-quick-actions-dropdown';
    quickActionsDropdown.className = 'mini-gpt-quick-actions-dropdown';
    
    // Create the dropdown content without icons for cleaner look
    quickActionsDropdown.innerHTML = `
      <button class="mini-gpt-quick-action-item" data-action="summarize">
        <span class="action-text">${translate('summarizePage')}</span>
      </button>
      <button class="mini-gpt-quick-action-item" data-action="explain">
        <span class="action-text">${translate('explainPage')}</span>
      </button>
    `;
    
    // Add event listeners with enhanced interactions
    Array.from(quickActionsDropdown.querySelectorAll('.mini-gpt-quick-action-item')).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Add click animation
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
        
        sendSpeedPrompt(btn.dataset.action);
        quickActionsDropdown.remove();
        quickActionsDropdown = null;
      });
    });
    
    document.body.appendChild(quickActionsDropdown);
    
    // Position the dropdown properly within chat container bounds
    const rect = quickActionsBtn.getBoundingClientRect();
    const chatContainer = document.getElementById('mini-gpt-chat-container');
    const chatRect = chatContainer.getBoundingClientRect();
    const dropdownWidth = 120; // Match CSS width
    const dropdownHeight = 80; // Approximate height
    
    // Calculate available space
    const spaceToRight = window.innerWidth - rect.right;
    const spaceToLeft = rect.left;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    // Position logic: prefer right side, fallback to left, then above/below
    let left, top;
    
    if (spaceToRight >= dropdownWidth + 8) {
      // Position to the right of the button
      left = rect.right + 8;
      top = rect.top - dropdownHeight/2;
    } else if (spaceToLeft >= dropdownWidth + 8) {
      // Position to the left of the button
      left = rect.left - dropdownWidth - 8;
      top = rect.top - dropdownHeight/2;
    } else {
      // Position above or below the button
      if (spaceAbove >= dropdownHeight + 8) {
        left = rect.left - dropdownWidth/2 + rect.width/2;
        top = rect.top - dropdownHeight - 8;
      } else {
        left = rect.left - dropdownWidth/2 + rect.width/2;
        top = rect.bottom + 8;
      }
    }
    
    // Ensure dropdown stays within viewport bounds
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - dropdownHeight - 8));
    
    quickActionsDropdown.style.left = left + 'px';
    quickActionsDropdown.style.top = top + 'px';
    quickActionsDropdown.style.right = 'auto';
    quickActionsDropdown.style.bottom = 'auto';
    
    // Add entrance animation class
    quickActionsDropdown.classList.add('mini-gpt-dropdown-visible');
    
    // Add arrow based on position relative to button
    const arrowElement = document.createElement('div');
    arrowElement.className = 'mini-gpt-dropdown-arrow';
    arrowElement.style.position = 'absolute';
    arrowElement.style.width = '0';
    arrowElement.style.height = '0';
    arrowElement.style.border = '6px solid transparent';
    
    // Position arrow based on dropdown position relative to button
    if (left > rect.right) {
      // Dropdown is to the right of button
      arrowElement.style.left = '-12px';
      arrowElement.style.top = '50%';
      arrowElement.style.transform = 'translateY(-50%)';
      arrowElement.style.borderRightColor = 'rgba(37,99,235,0.08)';
    } else if (left < rect.left) {
      // Dropdown is to the left of button
      arrowElement.style.right = '-12px';
      arrowElement.style.top = '50%';
      arrowElement.style.transform = 'translateY(-50%)';
      arrowElement.style.borderLeftColor = 'rgba(37,99,235,0.08)';
    } else if (top < rect.top) {
      // Dropdown is above button
      arrowElement.style.bottom = '-12px';
      arrowElement.style.left = '50%';
      arrowElement.style.transform = 'translateX(-50%)';
      arrowElement.style.borderTopColor = 'rgba(37,99,235,0.08)';
    } else {
      // Dropdown is below button
      arrowElement.style.top = '-12px';
      arrowElement.style.left = '50%';
      arrowElement.style.transform = 'translateX(-50%)';
      arrowElement.style.borderBottomColor = 'rgba(37,99,235,0.08)';
    }
    
    quickActionsDropdown.appendChild(arrowElement);
    
    // Close on outside click
    setTimeout(() => {
      document.addEventListener('mousedown', quickActionsOutsideClick, { once: true });
    }, 0);
  }
  function quickActionsOutsideClick(e) {
    if (quickActionsDropdown && !quickActionsDropdown.contains(e.target) && e.target !== quickActionsBtn) {
      quickActionsDropdown.remove();
      quickActionsDropdown = null;
    }
  }
  quickActionsBtn.onclick = showQuickActionsDropdown;

  // 2. Add history side panel HTML and overlay
  const historyPanel = document.createElement('div');
  historyPanel.id = 'mini-gpt-history-panel';
  historyPanel.innerHTML = `
    <div id="mini-gpt-history-panel-header">
      <span id="mini-gpt-history-panel-header-title">${translate('chatHistory')}</span>
      <div class="mini-gpt-history-header-buttons">
        <button id="mini-gpt-history-panel-refresh" aria-label="Refresh history" title="Refresh history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
        <button id="mini-gpt-history-panel-close" aria-label="${translate('closeChat')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="mini-gpt-history-panel-divider"></div>
    <div id="mini-gpt-history-panel-search">
      <input type="text" id="mini-gpt-history-search-input" placeholder="${translate('searchConversations')}" />
    </div>
    <div id="mini-gpt-history-panel-list"></div>
    <button id="mini-gpt-history-panel-clear" style="display:none;">${translate('clearAll')}</button>
  `;
  const historyOverlay = document.createElement('div');
  historyOverlay.id = 'mini-gpt-history-overlay';
  document.body.appendChild(historyOverlay);
  document.body.appendChild(historyPanel);

  // 3. History logic (update selectors)
  let allHistory = [];
  let filteredHistory = [];
  
  function saveChatToHistory(session) {
    chrome.storage.local.get(['miniGptHistory'], (data) => {
      const history = Array.isArray(data.miniGptHistory) ? data.miniGptHistory : [];
      history.unshift(session); // newest first
      chrome.storage.local.set({ miniGptHistory: history.slice(0, 50) }); // keep max 50
    });
  }
  function loadHistory(callback) {
    chrome.storage.local.get(['miniGptHistory'], (data) => {
      allHistory = Array.isArray(data.miniGptHistory) ? data.miniGptHistory : [];
      filteredHistory = [...allHistory];
      callback(allHistory);
    });
  }
  function clearHistory() {
    chrome.storage.local.set({ miniGptHistory: [] }, () => {
      allHistory = [];
      filteredHistory = [];
      renderHistoryList();
    });
  }
  function deleteHistoryItem(index) {
    const actualIndex = allHistory.findIndex(item => item === filteredHistory[index]);
    if (actualIndex !== -1) {
      allHistory.splice(actualIndex, 1);
      chrome.storage.local.set({ miniGptHistory: allHistory }, () => {
        filteredHistory = [...allHistory];
        renderHistoryList();
      });
    }
  }
  function filterHistory(searchTerm) {
    if (!searchTerm.trim()) {
      filteredHistory = [...allHistory];
    } else {
      const term = searchTerm.toLowerCase();
      filteredHistory = allHistory.filter(session => {
        return session.messages.some(msg => 
          msg.text.toLowerCase().includes(term)
        );
      });
    }
    renderHistoryList();
  }
  function renderHistoryList() {
      const list = historyPanel.querySelector('#mini-gpt-history-panel-list');
      const clearBtn = historyPanel.querySelector('#mini-gpt-history-panel-clear');
      list.innerHTML = '';
    
    if (!filteredHistory.length) {
        clearBtn.style.display = 'none';
      const searchInput = historyPanel.querySelector('#mini-gpt-history-search-input');
      const isEmpty = !allHistory.length;
      const isSearching = searchInput && searchInput.value.trim();
      
        list.innerHTML = `<div id='mini-gpt-history-panel-empty'>
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>
          ${isEmpty ? '<circle cx="12" cy="12" r="10" /><path d="M12 8v4l2.5 2.5"/>' : '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>'}
        </svg>
        <div>${isEmpty ? translate('noHistoryYet') : isSearching ? translate('noConversationsFound') : translate('noHistoryYet')}</div>
        </div>`;
        return;
      }
    
      clearBtn.style.display = 'block';
    filteredHistory.forEach((session, idx) => {
        const item = document.createElement('div');
        item.className = 'mini-gpt-history-item';
        item.tabIndex = 0;
      
      // Check if this is the current active session
      const isCurrentSession = currentSession.messages.length > 0 && 
        JSON.stringify(currentSession.messages) === JSON.stringify(session.messages);
      
      if (isCurrentSession) {
        item.classList.add('mini-gpt-history-item-active');
      }
      
      // Get conversation preview
      const userMessages = session.messages.filter(m => m.role === 'user');
      const botMessages = session.messages.filter(m => m.role === 'bot');
      const firstUserMsg = userMessages[0]?.text || '';
      const firstBotMsg = botMessages[0]?.text || '';
      const messageCount = session.messages.length;
      
      // Create better preview with message count
      const previewText = firstUserMsg.length > 80 ? firstUserMsg.slice(0, 80) + '…' : firstUserMsg;
      const botPreview = firstBotMsg.length > 60 ? firstBotMsg.slice(0, 60) + '…' : firstBotMsg;
      
      item.innerHTML = `
        <div class='mini-gpt-history-item-content'>
          <div class='mini-gpt-history-preview'>${previewText}</div>
          ${botPreview ? `<div class='mini-gpt-history-bot-preview'>${botPreview}</div>` : ''}
          <div class='mini-gpt-history-meta'>
            <span class='mini-gpt-history-date'>${session.date}</span>
            <span class='mini-gpt-history-count'>${messageCount} ${translate('messages')}</span>
            ${isCurrentSession ? `<span class="mini-gpt-history-current">${translate('current')}</span>` : ''}
          </div>
        </div>
        <button class='mini-gpt-history-delete' title='${translate('deleteConversation')}' aria-label='${translate('deleteConversation')}'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
            <path d='M3 6h18'/><path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'/><path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'/>
          </svg>
        </button>
      `;
      
      // Main click to restore
      const content = item.querySelector('.mini-gpt-history-item-content');
      content.onclick = () => restoreHistorySession(idx);
      content.onkeydown = (e) => { if (e.key === 'Enter') restoreHistorySession(idx); };
      
      // Delete button
      const deleteBtn = item.querySelector('.mini-gpt-history-delete');
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteHistoryItem(idx);
      };
      
        list.appendChild(item);
    });
  }
  function restoreHistorySession(idx) {
    if (!filteredHistory[idx]) return;
    
    // Save current session if it has messages
    if (currentSession.messages.length > 0) {
      trySaveCurrentSession();
    }
    
    // Clear current chat and restore the selected session
    messagesDiv.innerHTML = '';
    currentSession = { ...filteredHistory[idx] };
    
    const actualIndex = allHistory.findIndex(item => item === filteredHistory[idx]);
    currentHistoryIndex = actualIndex;
    
    // Restore all messages from the session
    filteredHistory[idx].messages.forEach(msg => {
      appendMessage(msg.text, msg.role);
    });
    
    // Show the chat if it's hidden
    if (chatContainer.style.display === 'none') {
      chatContainer.style.display = 'flex';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.opacity = '1';
    }
    
    // Hide history panel
    hideHistoryPanel();
  }
  // 4. Show/hide panel and overlay
  function showHistoryPanel() {
    loadHistory(() => {
    renderHistoryList();
      
      // Set up search functionality
      const searchInput = historyPanel.querySelector('#mini-gpt-history-search-input');
      if (searchInput) {
        searchInput.value = '';
        searchInput.addEventListener('input', (e) => {
          filterHistory(e.target.value);
        });
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            searchInput.value = '';
            filterHistory('');
            searchInput.blur();
          }
          // Add Ctrl+R or Cmd+R to refresh history
          if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshHistory();
          }
        });
        // Focus on search input when panel opens
        setTimeout(() => searchInput.focus(), 100);
      }
    });
    
    historyPanel.style.display = 'flex';
    historyOverlay.style.display = 'block';
    if (chatContainer.classList.contains('mini-gpt-dark')) historyPanel.classList.add('mini-gpt-dark');
    else historyPanel.classList.remove('mini-gpt-dark');
  }
  function hideHistoryPanel() {
    historyPanel.style.display = 'none';
    historyOverlay.style.display = 'none';
  }
  historyPanel.querySelector('#mini-gpt-history-panel-close').onclick = hideHistoryPanel;
  
  // Refresh button functionality
  historyPanel.querySelector('#mini-gpt-history-panel-refresh').onclick = () => {
    refreshHistory();
  };
  
  // Enhanced refresh function with visual feedback and error handling
  function refreshHistory() {
    const refreshBtn = historyPanel.querySelector('#mini-gpt-history-panel-refresh');
    const refreshIcon = refreshBtn.querySelector('svg');
    
    // Add loading state
    refreshBtn.disabled = true;
    refreshIcon.style.animation = 'spin 1s linear infinite';
    
    // Store current search term to restore after refresh
    const searchInput = historyPanel.querySelector('#mini-gpt-history-search-input');
    const currentSearchTerm = searchInput ? searchInput.value : '';
    
    // Store current history length to detect changes
    const previousHistoryLength = allHistory.length;
    
    // Force reload from storage with error handling
    chrome.storage.local.get(['miniGptHistory'], (data) => {
      try {
        // Update local arrays
        const newHistory = Array.isArray(data.miniGptHistory) ? data.miniGptHistory : [];
        allHistory = newHistory;
        filteredHistory = [...allHistory];
        
        // Re-render the list
        renderHistoryList();
        
        // Restore search if there was one
        if (searchInput && currentSearchTerm) {
          searchInput.value = currentSearchTerm;
          filterHistory(currentSearchTerm);
        } else if (searchInput) {
          searchInput.value = '';
          filterHistory('');
        }
        
        // Check if history actually changed
        const historyChanged = newHistory.length !== previousHistoryLength;
        if (historyChanged) {
                // History refreshed: conversations loaded
    } else {
      // History refreshed: no changes
        }
        
      } catch (error) {

        // Could add user notification here if needed
      } finally {
        // Remove loading state
        refreshBtn.disabled = false;
        refreshIcon.style.animation = '';
      }
    });
  }

  // --- Custom Clear Confirmation Modal ---
  let clearModal = null;
  function showClearModal() {
    if (clearModal) return;
    clearModal = document.createElement('div');
    clearModal.id = 'mini-gpt-clear-modal';
    clearModal.innerHTML = `
      <div class="mini-gpt-clear-modal-content">
        <div class="mini-gpt-clear-modal-title">⚠️ ${translate('clearAll')} ${translate('chatHistory').toLowerCase()}?</div>
        <div class="mini-gpt-clear-modal-desc">${translate('cannotBeUndone')}</div>
        <div class="mini-gpt-clear-modal-actions">
          <button id="mini-gpt-clear-cancel">${translate('cancel')}</button>
          <button id="mini-gpt-clear-confirm">${translate('clearAll')}</button>
        </div>
      </div>
    `;
    clearModal.className = 'mini-gpt-clear-modal-overlay';
    document.body.appendChild(clearModal);
    // Trap focus
    const cancelBtn = clearModal.querySelector('#mini-gpt-clear-cancel');
    const confirmBtn = clearModal.querySelector('#mini-gpt-clear-confirm');
    cancelBtn.focus();
    cancelBtn.onclick = () => { clearModal.remove(); clearModal = null; };
    confirmBtn.onclick = () => { clearHistory(); clearModal.remove(); clearModal = null; };
    clearModal.onclick = (e) => { if (e.target === clearModal) { clearModal.remove(); clearModal = null; } };
    // Keyboard: Esc closes, Enter on confirm
    clearModal.onkeydown = (e) => {
      if (e.key === 'Escape') { clearModal.remove(); clearModal = null; }
      if (e.key === 'Enter') { confirmBtn.click(); }
    };
    clearModal.tabIndex = 0;
    clearModal.focus();
    // Dark mode
    if (chatContainer.classList.contains('mini-gpt-dark')) clearModal.classList.add('mini-gpt-dark');
  }
  historyPanel.querySelector('#mini-gpt-history-panel-clear').onclick = showClearModal;
  historyOverlay.onclick = hideHistoryPanel;

  document.body.appendChild(bubble);
  document.body.appendChild(chatContainer);

  // Selection toolbar removed by user request.

  // Hide bubble and chat in fullscreen mode
  function handleFullscreenChange() {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      bubble.style.display = 'none';
      chatContainer.style.display = 'none'; // Optionally hide chat too
    } else if (!easyaiUiSuppressed) {
      // Use instant show when exiting fullscreen for better UX, but only if API key is available
      getProviderKeys((data) => {
        const hasKey = hasAnyApiKey(data);
        if (hasKey) {
          showBubbleInstant();
        }
      });
    }
  }
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Always inject bubble and chat, but control their visibility based on API key presence
  function updateBubbleVisibility() {
    // Don't show bubble on login/authorization pages
    if (isLoginOrAuthPage()) {
      const bubble = document.getElementById('mini-gpt-bubble');
      const chat = document.getElementById('mini-gpt-chat-container');
      if (bubble) bubble.style.display = 'none';
      if (chat) {
        chat.style.display = 'none';
        chat.style.visibility = 'hidden';
        chat.style.opacity = '0';
      }
      return;
    }
    
    getProviderKeys((data) => {
      const hasKey = hasAnyApiKey(data);
      const bubble = document.getElementById('mini-gpt-bubble');
      const chat = document.getElementById('mini-gpt-chat-container');
      if (hasKey) {
        if (easyaiUiSuppressed) {
          if (bubble) {
            bubble.style.display = 'none';
            bubble.style.visibility = 'hidden';
            bubble.style.opacity = '0';
          }
          if (chat) {
            chat.style.display = 'none';
            chat.style.visibility = 'hidden';
            chat.style.opacity = '0';
          }
        } else if (bubble) {
          showBubbleInstant();
          if (chat) {
            chat.style.display = 'none';
            chat.style.visibility = 'hidden';
            chat.style.opacity = '0';
          }
        }
      } else {
        if (bubble) bubble.style.display = 'none';
        if (chat) {
          chat.style.display = 'none';
          chat.style.visibility = 'hidden';
          chat.style.opacity = '0';
        }
      }
    });
  }
  // Initial check: read suppression flag first so we do not flash the bubble
  chrome.storage.local.get(['easyaiUiSuppressed'], (s) => {
    easyaiUiSuppressed = s.easyaiUiSuppressed === true;
    updateBubbleVisibility();
  });
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.easyaiUiSuppressed) {
      easyaiUiSuppressed = changes.easyaiUiSuppressed.newValue === true;
      if (easyaiUiSuppressed) {
        stopAllVoiceActivity();
        const chatWasOpen = chatContainer.style.display === 'flex' && chatContainer.style.visibility === 'visible';
        chatContainer.style.display = 'none';
        chatContainer.style.visibility = 'hidden';
        chatContainer.style.opacity = '0';
        hideBubble();
        bubble.style.opacity = '0';
        if (chatWasOpen) trySaveCurrentSession();
      } else {
        updateBubbleVisibility();
      }
    }
    if (changes.apiKey_openai || changes.apiKey_gemini || changes.apiKey_huggingface) {
      updateBubbleVisibility();
    }
  });
  
  // Listen for URL changes to detect navigation to/from login pages
  let currentUrl = window.location.href;
  const urlChangeObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // Small delay to ensure page has loaded
      setTimeout(() => {
        updateBubbleVisibility();
      }, 100);
    }
  });
  
  // Observe URL changes
  urlChangeObserver.observe(document, { subtree: true, childList: true });
  
  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      updateBubbleVisibility();
    }, 100);
  });
  
  // Listen for pushstate/replacestate events (programmatic navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => {
      updateBubbleVisibility();
    }, 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => {
      updateBubbleVisibility();
    }, 100);
  };

  // Bubble drag functions
  function startBubbleDrag(e) {
    isBubbleDragging = true;
    bubbleWasDragged = false;
    bubbleDragDistance = 0;
    bubble.style.cursor = 'grabbing';
    
    // Get current position
    const rect = bubble.getBoundingClientRect();
    bubbleInitialX = rect.left;
    bubbleInitialY = rect.top;
    
    // Get mouse position
    bubbleDragStartX = e.clientX;
    bubbleDragStartY = e.clientY;
    
    // Calculate current position relative to viewport
    bubbleCurrentX = bubbleInitialX;
    bubbleCurrentY = bubbleInitialY;
    
    // Prevent text selection during drag
    e.preventDefault();
    
    // Add event listeners for drag and end
    document.addEventListener('mousemove', onBubbleDrag);
    document.addEventListener('mouseup', stopBubbleDrag);
    document.addEventListener('mouseleave', stopBubbleDrag);
  }
  
  function onBubbleDrag(e) {
    if (!isBubbleDragging) return;
    
    // Calculate new position
    const deltaX = e.clientX - bubbleDragStartX;
    const deltaY = e.clientY - bubbleDragStartY;
    
    // Calculate total drag distance
    bubbleDragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Add drag threshold to prevent small movements from being considered as drags
    const dragThreshold = 5;
    if (bubbleDragDistance < dragThreshold) {
      return;
    }
    
    // Mark that we've actually dragged
    bubbleWasDragged = true;
    
    bubbleCurrentX = bubbleInitialX + deltaX;
    bubbleCurrentY = bubbleInitialY + deltaY;
    
    // Constrain to viewport bounds
    const bubbleRect = bubble.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Keep at least 20px from edges
    const minX = 20;
    const maxX = viewportWidth - bubbleRect.width - 20;
    const minY = 20;
    const maxY = viewportHeight - bubbleRect.height - 20;
    
    bubbleCurrentX = Math.max(minX, Math.min(maxX, bubbleCurrentX));
    bubbleCurrentY = Math.max(minY, Math.min(maxY, bubbleCurrentY));
    
    // Update bubble position
    bubble.style.left = bubbleCurrentX + 'px';
    bubble.style.top = bubbleCurrentY + 'px';
    bubble.style.right = 'auto';
    bubble.style.bottom = 'auto';
    
    // Move chat container to follow bubble (positioned above the bubble)
    if (chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible') {
      const chatWidth = 400; // Default chat width
      const chatHeight = 60; // Approximate chat height
      
      // Position chat above the bubble
      let chatX = bubbleCurrentX - (chatWidth - bubbleRect.width) / 2;
      let chatY = bubbleCurrentY - chatHeight - 20; // 20px gap between bubble and chat
      
      // Constrain chat to viewport bounds
      const chatMinX = 20;
      const chatMaxX = viewportWidth - chatWidth - 20;
      const chatMinY = 20;
      const chatMaxY = viewportHeight - chatHeight - 20;
      
      chatX = Math.max(chatMinX, Math.min(chatMaxX, chatX));
      chatY = Math.max(chatMinY, Math.min(chatMaxY, chatY));
      
      chatContainer.style.left = chatX + 'px';
      chatContainer.style.top = chatY + 'px';
      chatContainer.style.right = 'auto';
      chatContainer.style.bottom = 'auto';
    }
  }
  
  function stopBubbleDrag() {
    if (!isBubbleDragging) return;
    
    isBubbleDragging = false;
    bubble.style.cursor = 'pointer';
    
    // Remove event listeners
    document.removeEventListener('mousemove', onBubbleDrag);
    document.removeEventListener('mouseup', stopBubbleDrag);
    document.removeEventListener('mouseleave', stopBubbleDrag);
    
    // Reset drag distance after a short delay to allow click event to check it
    setTimeout(() => {
      bubbleDragDistance = 0;
      bubbleWasDragged = false;
    }, 100);
  }
  
  // Add drag event listeners to drag indicator
  dragIndicator.addEventListener('mousedown', startDrag);
  
  // Add bubble drag event listeners
  bubble.addEventListener('mousedown', startBubbleDrag);
  
  // Add touch support for bubble drag
  bubble.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startBubbleDrag(mouseEvent);
  });
  
  // Add touch move and end handlers
  bubble.addEventListener('touchmove', (e) => {
    if (isBubbleDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      onBubbleDrag(mouseEvent);
    }
  });
  
  bubble.addEventListener('touchend', (e) => {
    if (isBubbleDragging) {
      e.preventDefault();
      stopBubbleDrag();
    }
  });

} 