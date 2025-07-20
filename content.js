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
      title: 'EasyAI Chat',
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
      welcome: '👋 Welcome! This is EasyAI Chat. Ask anything, anytime.',
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
      showHistoryTooltip: 'Show chat history (Ctrl+H)',
      showHistoryAria: 'Show chat history',
      newChatTooltip: 'New Chat',
      newChatAria: 'Start new chat',
      closeChatTooltip: 'Close chat',
      closeChatAria: 'Close chat',
      quickActionsTooltip: 'Quick Actions',
      quickActionsDisabledTooltip: "Quick actions aren't available on this page. Select and copy text, then paste it into EasyAI Chat.",
      
      // Provider
      currentProvider: 'Current provider: ',
      setApiKeyTooltip: 'Set your API key in Settings to enable this provider.'
    },
    fr: {
      // Header
      title: 'EasyAI Chat',
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
      welcome: '👋 Bienvenue ! C\'est EasyAI Chat. Posez vos questions à tout moment.',
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
      showHistoryTooltip: 'Afficher l\'historique (Ctrl+H)',
      showHistoryAria: 'Afficher l\'historique',
      newChatTooltip: 'Nouveau chat',
      newChatAria: 'Commencer un nouveau chat',
      closeChatTooltip: 'Fermer le chat',
      closeChatAria: 'Fermer le chat',
      quickActionsTooltip: 'Actions rapides',
      quickActionsDisabledTooltip: 'Les actions rapides ne sont pas disponibles sur cette page. Sélectionnez et copiez du texte, puis collez-le dans EasyAI Chat.',
      
      // Provider
      currentProvider: 'Fournisseur actuel : ',
      setApiKeyTooltip: 'Configurez votre clé API dans les paramètres pour activer ce fournisseur.'
    }
  };
  
  // Get current language strings
  const t = translations[isFrench ? 'fr' : 'en'];
  
  // Helper function to translate text
  function translate(key) {
    return t[key] || translations.en[key] || key;
  }

  const bubble = document.createElement('div');
  bubble.id = 'mini-gpt-bubble';
  bubble.innerHTML = `
    <img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="EasyAI Chat" style="width:52px; height:52px; border-radius:8px;">
    <div class="tooltip">EasyAI Chat</div>
  `;
  bubble.style.position = 'fixed';
  bubble.style.right = '32px';
  bubble.style.bottom = '32px';
  bubble.style.left = '';
  bubble.style.top = '';
  bubble.style.zIndex = '999999';
  bubble.style.pointerEvents = 'auto';
  
  const originalBubblePosition = { bottom: '32px', right: '32px' };
  bubble.style.width = '110px';
  bubble.style.height = '110px';
  bubble.style.background = 'rgba(255,255,255,0.95)';
  bubble.style.borderRadius = '50%';
  bubble.style.border = '2px solid rgba(0,0,0,0.1)';
  bubble.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)';
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
  chatContainer.style.bottom = '92px';
  chatContainer.style.left = '';
  chatContainer.style.top = '';
  chatContainer.style.width = '400px';
  chatContainer.style.maxWidth = '98vw';
  chatContainer.style.minWidth = '320px';
  chatContainer.style.maxHeight = '60vh';
  chatContainer.style.background = '#fff';
  chatContainer.style.borderRadius = '16px';
  chatContainer.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  chatContainer.style.zIndex = '999999';
  chatContainer.style.overflow = 'hidden';
  chatContainer.style.flexDirection = 'column';
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
  
  function showBubble() {
    // Don't show bubble on login/authorization pages
    if (isLoginOrAuthPage()) {
      return;
    }
    
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
      const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
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
    // Don't show bubble on login/authorization pages
    if (isLoginOrAuthPage()) {
      return;
    }
    
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
      const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
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
    const isChatVisible = chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible';
    if (isChatVisible) {
      hideBubble();
    } else {
      // Only show bubble if API key is available
      chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
        const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
        if (hasKey) {
          showBubble();
        }
      });
    }
  }

  chatContainer.innerHTML = `
    <div class="mini-gpt-header mini-gpt-header-modern">
      <div class="mini-gpt-header-title">
        <span>
          <img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="${translate('title')}" style="width:28px; height:28px; margin-right:8px; border-radius:4px; vertical-align:middle;">
          EasyAI <span class="brand-accent">Chat</span>
        </span>
        <span class="mini-gpt-drag-indicator" title="${translate('dragToMove')}" style="margin-left:8px; opacity:0.6; font-size:12px;">⋮⋮</span>
      </div>
      <div class="mini-gpt-actions-bar">
        <button class="mini-gpt-action-btn" id="mini-gpt-history-btn" title="${translate('showHistory')}" aria-label="${translate('showHistory')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 12 3 16 7 16"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-newchat-btn" title="${translate('newChat')}" aria-label="${translate('newChat')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-close" title="${translate('closeChat')}" aria-label="${translate('closeChat')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div id="mini-gpt-provider-row" class="mini-gpt-provider-row-enhanced"></div>
    <div id="mini-gpt-messages" class="mini-gpt-messages-enhanced"></div>
    <form id="mini-gpt-form" class="mini-gpt-form-enhanced" style="position:relative;display:flex;align-items:flex-end;">
      <textarea id="mini-gpt-input" class="mini-gpt-input-enhanced" placeholder="${translate('placeholder')}" autocomplete="off" rows="1" style="flex:1;"></textarea>
      <button type="submit" class="mini-gpt-send-btn" aria-label="${translate('send')}" style="background: #2563eb; border: none; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; margin-left: 8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
      <button id="mini-gpt-quick-actions-btn" type="button" title="${translate('quickActions')}" aria-label="${translate('quickActions')}" style="background:none;border:none;padding:4px 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;color:#2563eb;position:relative;margin-left:4px;">
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
    providerLabel.textContent = provider === 'openai' ? 'OpenAI' : 'Gemini';
    providerIcon.className = 'mini-gpt-provider-icon ' + provider;
    providerBtn.setAttribute('aria-label', translate('currentProvider') + providerLabel.textContent);
    // Highlight selected in list
    providerList.querySelectorAll('.mini-gpt-provider-option').forEach(opt => {
      opt.setAttribute('aria-selected', opt.dataset.provider === provider ? 'true' : 'false');
    });
  }

  // API key check and enable/disable
  function updateProviderDropdown() {
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini', 'provider'], (data) => {
      const openaiKey = data.apiKey_openai;
      const geminiKey = data.apiKey_gemini;
      // Disable options without API key
      const openaiOption = providerList.querySelector('.mini-gpt-provider-option[data-provider="openai"]');
      const geminiOption = providerList.querySelector('.mini-gpt-provider-option[data-provider="gemini"]');
      openaiOption.classList.toggle('disabled', !openaiKey);
      geminiOption.classList.toggle('disabled', !geminiKey);
      openaiOption.title = openaiKey ? '' : translate('setApiKeyTooltip');
      geminiOption.title = geminiKey ? '' : translate('setApiKeyTooltip');
      // Set current provider
      let provider = data.provider || (openaiKey ? 'openai' : geminiKey ? 'gemini' : 'openai');
      if (!data[`apiKey_${provider}`]) provider = openaiKey ? 'openai' : geminiKey ? 'gemini' : 'openai';
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
    if (area === 'local' && (changes.apiKey_openai || changes.apiKey_gemini || changes.provider)) {
      updateProviderDropdown();
    }
  });

  // Handle chat
  const messagesDiv = chatContainer.querySelector('#mini-gpt-messages');
  const form = chatContainer.querySelector('#mini-gpt-form');
  const input = chatContainer.querySelector('#mini-gpt-input');

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
    console.log('Session reset: conversation context cleared');
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
  // --- Patch: Only save session after full bot response ---
  function trySaveCurrentSession() {
    // Only save if not streaming
    if (!requestInProgress && currentSession.messages.length > 1) {
      currentSession.date = new Date().toLocaleString();
      currentSession.preview = currentSession.messages.find(m => m.role === 'user')?.text?.slice(0, 60) || '';
      saveChatToHistory(currentSession);
      // Don't reset session here - it should only be reset when starting a new chat
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
        chatContainer.style.bottom = '92px';
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
  const dragHeader = chatContainer.querySelector('.mini-gpt-header');
  
  // Make header draggable
  dragHeader.style.cursor = 'grab';
  dragHeader.style.userSelect = 'none';
  
  function startDrag(e) {
    // Only allow dragging from the header area, not buttons
    if (e.target.closest('button') || e.target.closest('.mini-gpt-actions-bar')) {
      return;
    }
    
    isDragging = true;
    dragHeader.style.cursor = 'grabbing';
    
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
    dragHeader.style.cursor = 'grab';
    
    // Remove event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mouseleave', stopDrag);
  }
  
  // Add drag event listeners to header
  dragHeader.addEventListener('mousedown', startDrag);
  
  // Add touch support for mobile devices
  dragHeader.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrag(mouseEvent);
  });
  
  // Prevent drag when clicking on interactive elements
  dragHeader.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.mini-gpt-actions-bar')) {
      e.stopPropagation();
    }
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
      chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
        const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
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
    msg.className = from === 'user' ? 'mini-gpt-msg-user' : 'mini-gpt-msg-bot';
    if (from === 'bot') {
      // Convert markdown to HTML for bot messages
      const formattedText = convertMarkdownToHTML(text);
      msg.innerHTML = formattedText;
    } else {
      msg.textContent = text;
    }
    msg.style.margin = '8px 0';
    msg.style.maxWidth = '80%';
    msg.style.padding = '8px 12px';
    msg.style.borderRadius = '12px';
    msg.style.display = 'inline-block';
    msg.style.wordBreak = 'break-word';
    msg.style.fontSize = '15px';
    if (from === 'user') {
      msg.style.background = '#e8f0fe';
      msg.style.color = '#2563eb';
      msg.style.alignSelf = 'flex-end';
      msg.style.textAlign = 'right';
    } else {
      msg.style.background = '#f5f5f7';
      msg.style.color = '#222';
      msg.style.alignSelf = 'flex-start';
      msg.style.textAlign = 'left';
    }
    messagesDiv.appendChild(msg);
    
    // Scroll to the top of the new message instead of bottom
    if (from === 'bot') {
      // For bot messages, scroll to the top so user can read from beginning
      setTimeout(() => {
        msg.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // For user messages, scroll to show the message
      setTimeout(() => {
        msg.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }

  function getSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get(['provider', 'apiKey_openai', 'apiKey_gemini'], resolve);
    });
  }
  function setSettings(settings) {
    return new Promise(resolve => {
      chrome.storage.local.set(settings, resolve);
    });
  }

  const DEFAULT_MODELS = { openai: 'gpt-3.5-turbo', gemini: 'gemini-2.0-flash' };

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
    sendButton.style.background = '#2563eb';
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
        // --- PATCH: Always append Gemini (non-streaming) answer as a bot message ---
        if (!streamingBotMsg && msg.answerPart) {
          // For Gemini (non-streaming), ensure appendMessage is called so history is correct
          appendMessage(msg.answerPart, 'bot');
          streamingBotMsg = null;
          streamingBotText = '';
        } else if (streamingBotMsg) {
          // Check if response seems incomplete
          const isIncomplete = checkIfResponseIncomplete(streamingBotText);
          if (isIncomplete) {
            const incompleteIndicator = document.createElement('div');
            incompleteIndicator.className = 'mini-gpt-incomplete-indicator';
            incompleteIndicator.innerHTML = `
              <div style="margin-top: 8px; padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; border-left: 3px solid #f59e0b;">
                <span style="color: #f59e0b; font-size: 0.8em; font-style: italic; display: block; margin-bottom: 4px;">
                  [Response may be incomplete]
                </span>
                <button class="mini-gpt-continue-btn" style="background: #f59e0b; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; cursor: pointer; margin-right: 8px;">
                  Continue
                </button>
                <button class="mini-gpt-regenerate-btn" style="background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75em; cursor: pointer;">
                  Regenerate
                </button>
              </div>
            `;
            
            // Add event listeners for the buttons
            const continueBtn = incompleteIndicator.querySelector('.mini-gpt-continue-btn');
            const regenerateBtn = incompleteIndicator.querySelector('.mini-gpt-regenerate-btn');
            
            continueBtn.onclick = () => {
              // Send a continuation prompt
              const continuationPrompt = "Please continue your previous response.";
              input.value = continuationPrompt;
              sendPrompt();
            };
            
            regenerateBtn.onclick = () => {
              // Remove the incomplete message and regenerate
              streamingBotMsg.remove();
              streamingBotMsg = null;
              streamingBotText = '';
              // Get the last user message and regenerate
              const lastUserMsg = currentSession.messages.filter(m => m.role === 'user').pop();
              if (lastUserMsg) {
                input.value = lastUserMsg.text;
                sendPrompt();
              }
            };
            
            streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText) + incompleteIndicator.outerHTML;
          } else {
            streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
          }
          streamingBotMsg = null;
          streamingBotText = '';
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
        streamingBotMsg = document.createElement('div');
        streamingBotMsg.className = 'mini-gpt-msg-bot';
        streamingBotMsg.innerHTML = '';
        messagesDiv.appendChild(streamingBotMsg);
        // Scroll to the top of the new response when it starts
        setTimeout(() => {
          streamingBotMsg.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      if (msg.answerPart) {
        streamingBotText += msg.answerPart;
        streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
        // Don't scroll to bottom during streaming - let user read from top
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
        streamingBotMsg.appendChild(incompleteIndicator);
        
        // Finalize the streaming message
        streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText) + incompleteIndicator.outerHTML;
        streamingBotMsg = null;
        streamingBotText = '';
      }
      
      requestInProgress = false;
      input.disabled = false;
      updateSendStopBtn();
    });
  }
  
  // Function to detect incomplete responses
  function checkIfResponseIncomplete(text) {
    if (!text || text.length < 10) return false;
    
    const trimmedText = text.trim();
    const lastChar = trimmedText.slice(-1);
    const lastSentence = trimmedText.split('.').pop().trim();
    
    // Check for common incomplete patterns
    const incompletePatterns = [
      /just a moment/i,
      /one moment/i,
      /wait/i,
      /loading/i,
      /checking/i,
      /searching/i,
      /looking up/i,
      /finding/i,
      /getting/i,
      /retrieving/i,
      /processing/i,
      /analyzing/i,
      /calculating/i,
      /please wait/i,
      /stand by/i,
      /hold on/i
    ];
    
    // Check if ends with incomplete phrases
    for (const pattern of incompletePatterns) {
      if (pattern.test(lastSentence)) {
        return true;
      }
    }
    
    // Check if ends with ellipsis or incomplete punctuation
    if (lastChar === '...' || lastChar === '…' || lastChar === ',') {
      return true;
    }
    
    // Check if the last sentence seems incomplete (no period, question mark, or exclamation)
    if (!/[.!?]/.test(lastChar) && lastSentence.length > 5) {
      return true;
    }
    
    return false;
  }

  function sendPrompt() {
    const question = input.value.trim();
    const provider = currentProvider;
    const model = DEFAULT_MODELS[provider];
    chrome.storage.local.get([`apiKey_${provider}`], (settings) => {
      const apiKey = settings[`apiKey_${provider}`] || '';
      if (!apiKey) {
        appendMessage(translate('pleaseSetApiKey'), 'bot');
        return;
      }
      appendMessage(question, 'user');
      input.value = '';
      input.style.height = 'auto';
      // Add animated loader as bot message
      const loader = document.createElement('div');
      loader.className = 'mini-gpt-msg-bot';
      loader.setAttribute('aria-label', translate('thinking'));
      loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
      messagesDiv.appendChild(loader);
      // Scroll to the top of the loader so user can see it
      setTimeout(() => {
        loader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      requestInProgress = true;
      input.disabled = true;
      updateSendStopBtn();
      streamingBotMsg = null;
      streamingBotText = '';
      // Send conversation context along with the question
      window.postMessage({ 
        type: 'MINI_GPT_ASK', 
        question, 
        provider, 
        model, 
        apiKey,
        conversationContext: conversationContext // Include full conversation history
      }, '*');
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

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+H or Cmd+H to open history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault();
      if (chatContainer.style.display === 'flex') {
        showHistoryPanel();
      }
    }
  });

  // Relay MINI_GPT_ASK from window to background
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'MINI_GPT_ASK') {
      chrome.runtime.sendMessage({
        type: 'MINI_GPT_ASK',
        question: event.data.question,
        provider: event.data.provider,
        model: event.data.model,
        apiKey: event.data.apiKey,
        conversationContext: event.data.conversationContext || [] // Pass conversation context
      });
    }
  });

  // Relay MINI_GPT_ANSWER from background to chat UI
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'MINI_GPT_ANSWER') {
      window.postMessage({ type: 'MINI_GPT_ANSWER', answer: msg.answer }, '*');
    }
  });

  // Improved dark mode detection: system or page background
  function isPageDark() {
    // Check the computed background color of the page
    let el = document.body;
    // Try to find the most relevant background (body or html)
    while (el && getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)') {
      el = el.parentElement;
    }
    const bg = el ? getComputedStyle(el).backgroundColor : 'rgb(255,255,255)';
    const rgb = bg.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    
    // Calculate brightness (higher values = lighter)
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
    
    // Consider dark if brightness is below 128 (more accurate than checking individual channels)
    return brightness < 128;
  }
  function applyDarkMode() {
    if (isPageDark()) {
      chatContainer.classList.add('mini-gpt-dark');
      bubble.classList.add('mini-gpt-dark');
    } else {
      chatContainer.classList.remove('mini-gpt-dark');
      bubble.classList.remove('mini-gpt-dark');
    }
  }
  applyDarkMode();
  // Re-check every 2 seconds in case the page theme changes dynamically
  setInterval(applyDarkMode, 2000);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyDarkMode);
  // Also re-check on page background changes
  setInterval(applyDarkMode, 2000);

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

  // History button
  const historyBtn = document.createElement('button');
  historyBtn.id = 'mini-gpt-history-btn';
  historyBtn.title = translate('showHistoryTooltip');
  historyBtn.setAttribute('aria-label', translate('showHistoryAria'));
  historyBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 12 3 16 7 16"/></svg>`;
  historyBtn.style.background = 'none';
  historyBtn.style.border = 'none';
  historyBtn.style.padding = '6px';
  historyBtn.style.borderRadius = '8px';
  historyBtn.style.cursor = 'pointer';
  historyBtn.style.transition = 'background 0.18s';
  historyBtn.onmouseenter = () => historyBtn.style.background = '#e8f0fe';
  historyBtn.onmouseleave = () => historyBtn.style.background = 'none';
  actionsBar.appendChild(historyBtn);

  // New Chat button
  const newChatBtn = document.createElement('button');
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

  // Close button
  const closeBtn = document.createElement('button');
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

  // Keyboard accessibility
  [historyBtn, newChatBtn, closeBtn].forEach(btn => {
    btn.tabIndex = 0;
    btn.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    };
  });

  // Update action bar button styles for compact, title-matching icons
  [historyBtn, newChatBtn, closeBtn].forEach(btn => {
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
        btn.style.background = '#2563eb22';
      } else {
        btn.style.background = '#e8f0fe';
      }
      // Make SVG icon color high-contrast on hover
      const svg = btn.querySelector('svg');
      if (svg) svg.style.stroke = chatContainer.classList.contains('mini-gpt-dark') ? '#fff' : '#2563eb';
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

  // Attach event listeners
  historyBtn.onclick = showHistoryPanel;
  newChatBtn.onclick = () => {
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
    
    console.log('New chat started: context cleared');
  };
  closeBtn.onclick = () => {
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
      prompt = `Summarize the following page content:\n\n${pageText}`;
    } else if (type === 'explain') {
      userMsg = translate('explain');
      prompt = `Explain the following page content in simple terms:\n\n${pageText}`;
    }
    // Show only the short user message in chat, but send the full prompt
    appendMessage(userMsg, 'user');
    // Add animated loader as bot message
    const loader = document.createElement('div');
    loader.className = 'mini-gpt-msg-bot';
    loader.setAttribute('aria-label', translate('thinking'));
    loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
    messagesDiv.appendChild(loader);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    requestInProgress = true;
    input.disabled = true;
    updateSendStopBtn();
    streamingBotMsg = null;
    streamingBotText = '';
    // Send to backend directly
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
    // Find the actual index in allHistory
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
    currentSession = { ...filteredHistory[idx] }; // Copy the session
    
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
          console.log(`History refreshed: ${allHistory.length} conversations loaded (was ${previousHistoryLength})`);
        } else {
          console.log(`History refreshed: ${allHistory.length} conversations loaded (no changes)`);
        }
        
      } catch (error) {
        console.error('Error refreshing history:', error);
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
    } else {
      // Use instant show when exiting fullscreen for better UX, but only if API key is available
      chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
        const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
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
    
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
      const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
      const bubble = document.getElementById('mini-gpt-bubble');
      const chat = document.getElementById('mini-gpt-chat-container');
      if (hasKey) {
        if (bubble) {
          // Use instant show for better UX when API key is available
          showBubbleInstant();
        }
        if (chat) {
          chat.style.display = 'none'; // Hide chat by default
          chat.style.visibility = 'hidden';
          chat.style.opacity = '0';
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
  // Initial check
  updateBubbleVisibility();
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.apiKey_openai || changes.apiKey_gemini)) {
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

  function stopDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    dragHeader.style.cursor = 'grab';
    
    // Remove event listeners
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mouseleave', stopDrag);
  }
  
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
  
  // Add drag event listeners to header
  dragHeader.addEventListener('mousedown', startDrag);
  
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

  // Helper function to check if current page is a login/authorization page
  function isLoginOrAuthPage() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    // Common login/authorization domains and paths
    const loginDomains = [
      'login.microsoftonline.com',
      'auth0.com',
      'okta.com',
      'onelogin.com',
      'sso.company.com',
      'login.company.com',
      'auth.company.com',
      'oauth.com',
      'oauth2.com'
    ];
    
    // Google accounts - only specific login/authorization paths
    if (hostname.includes('accounts.google.com')) {
      const googleLoginPaths = [
        '/signin',
        '/signin/',
        '/login',
        '/login/',
        '/oauth',
        '/oauth/',
        '/oauth2',
        '/oauth2/',
        '/authorize',
        '/authorize/',
        '/connect',
        '/connect/',
        '/authenticate',
        '/authenticate/',
        '/signup',
        '/signup/',
        '/register',
        '/register/',
        '/password',
        '/password/',
        '/reset',
        '/reset/',
        '/forgot',
        '/forgot/',
        '/chooser',
        '/chooser/',
        '/accountchooser',
        '/accountchooser/'
      ];
      
      // Only hide on actual login/authorization paths, not on regular Google services
      if (googleLoginPaths.some(path => pathname.includes(path))) {
        return true;
      }
      
      // Check for OAuth authorization flows
      if (url.includes('oauth') || url.includes('authorize') || url.includes('signin')) {
        return true;
      }
      
      // Allow Gmail and other Google services
      return false;
    }
    
    const loginPaths = [
      '/signin',
      '/signin/',
      '/login',
      '/login/',
      '/auth',
      '/auth/',
      '/oauth',
      '/oauth/',
      '/oauth2',
      '/oauth2/',
      '/authorize',
      '/authorize/',
      '/connect',
      '/connect/',
      '/authenticate',
      '/authenticate/',
      '/signup',
      '/signup/',
      '/register',
      '/register/',
      '/password',
      '/password/',
      '/reset',
      '/reset/',
      '/forgot',
      '/forgot/'
    ];
    
    const loginKeywords = [
      'signin',
      'login',
      'auth',
      'oauth',
      'authorize',
      'connect',
      'authenticate',
      'signup',
      'register',
      'password',
      'reset',
      'forgot',
      'connexion',
      'se connecter',
      's\'identifier',
      'authentification'
    ];
    
    // Check if current domain is a login domain
    if (loginDomains.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check if current path contains login keywords
    if (loginPaths.some(path => pathname.includes(path))) {
      return true;
    }
    
    // Check if URL contains login keywords (but be more careful with Google services)
    if (loginKeywords.some(keyword => url.includes(keyword))) {
      // Additional check for Google services - don't hide on Gmail, Drive, etc.
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }
    
    // Check page title for login indicators
    const title = document.title.toLowerCase();
    if (loginKeywords.some(keyword => title.includes(keyword))) {
      // Additional check for Google services
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }
    
    // Check for common login form elements
    const loginFormSelectors = [
      'input[type="password"]',
      'form[action*="login"]',
      'form[action*="signin"]',
      'form[action*="auth"]',
      '.login-form',
      '.signin-form',
      '.auth-form',
      '#login',
      '#signin',
      '#auth'
    ];
    
        if (loginFormSelectors.some(selector => document.querySelector(selector))) {
      // Additional check for Google services - don't hide on Gmail, Drive, etc.
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }
    
    return false;
  }
} 