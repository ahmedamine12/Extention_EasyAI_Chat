// Prevent multiple injections
if (!window.__miniGptAgentInjected) {
  window.__miniGptAgentInjected = true;

  // Create floating button
  const bubble = document.createElement('div');
  bubble.id = 'mini-gpt-bubble';
  bubble.innerHTML = `<img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="EasyAI Chat" style="width:42px; height:42px; border-radius:7px;">`;
  bubble.style.position = 'fixed';
  bubble.style.right = '32px';
  bubble.style.bottom = '32px';
  bubble.style.left = '';
  bubble.style.top = '';
  bubble.style.zIndex = '999999';
  // Ensure bubble is always on top when chat is closed
  bubble.style.pointerEvents = 'auto';
  
  // Store original position for restoration
  const originalBubblePosition = { bottom: '32px', right: '32px' };
  bubble.style.width = '90px';
  bubble.style.height = '90px';
  bubble.style.background = 'linear-gradient(135deg, #2563eb 0%, #10a37f 100%)';
  bubble.style.borderRadius = '50%';
  bubble.style.boxShadow = '0 6px 24px rgba(37,99,235,0.25), 0 2px 8px rgba(0,0,0,0.15)';
  bubble.style.display = 'flex';
  bubble.style.alignItems = 'center';
  bubble.style.justifyContent = 'center';
  bubble.style.cursor = 'pointer';
  bubble.style.userSelect = 'none';
  bubble.style.transition = 'box-shadow 0.2s, transform 0.3s ease-out, opacity 0.2s';
  bubble.style.opacity = '0';
  bubble.style.transform = 'scale(0.8) translateY(20px)';
  bubble.style.display = 'none'; // Hide by default until API key check
  // Don't animate initially - let updateBubbleVisibility handle it
  
  // Don't show bubble initially - let updateBubbleVisibility handle it based on API key

  // Chat UI
  const chatContainer = document.createElement('div');
  chatContainer.id = 'mini-gpt-chat-container';
  chatContainer.style.display = 'none'; // Always hidden on page load
  chatContainer.style.position = 'fixed';
  chatContainer.style.right = '32px';
  chatContainer.style.bottom = '92px'; // 32px (bubble) + 60px (bubble height)
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
  // Force hide the chat container to override any CSS
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
  
  // Bubble visibility management - Optimized for instant appearance
  function showBubble() {
    // Check if API key is available before showing bubble
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
      const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
      if (!hasKey) return; // Don't show bubble if no API key
      
      // Remove any existing transitions temporarily for instant visibility
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
    // Check if API key is available before showing bubble
    chrome.storage.local.get(['apiKey_openai', 'apiKey_gemini'], (data) => {
      const hasKey = (data.apiKey_openai && data.apiKey_openai.trim()) || (data.apiKey_gemini && data.apiKey_gemini.trim());
      if (!hasKey) return; // Don't show bubble if no API key
      
      // For immediate visibility without any transitions
      bubble.style.transition = 'none';
      bubble.style.display = 'flex';
      bubble.style.visibility = 'visible';
      bubble.style.opacity = '1';
      bubble.style.transform = 'scale(1) translateY(0)';
      
      // Alternative approach: use CSS class for instant visibility
      bubble.classList.add('instant-show');
      
      // Remove the class after a brief moment to allow future transitions
      setTimeout(() => {
        bubble.classList.remove('instant-show');
      }, 100);
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
          <img src="${chrome.runtime.getURL('icons/easyChat.png')}" alt="EasyAI Chat" style="width:28px; height:28px; margin-right:8px; border-radius:4px; vertical-align:middle;">
          EasyAI <span class="brand-accent">Chat</span>
        </span>
        <span class="mini-gpt-drag-indicator" title="Drag to move" style="margin-left:8px; opacity:0.6; font-size:12px;">⋮⋮</span>
      </div>
      <div class="mini-gpt-actions-bar">
        <button class="mini-gpt-action-btn" id="mini-gpt-history-btn" title="Show chat history" aria-label="Show chat history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 9 9"/><polyline points="3 12 3 16 7 16"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-newchat-btn" title="New Chat" aria-label="Start new chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
        <button class="mini-gpt-action-btn" id="mini-gpt-close" title="Close chat" aria-label="Close chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div id="mini-gpt-provider-row" class="mini-gpt-provider-row-enhanced"></div>
    <div id="mini-gpt-messages" class="mini-gpt-messages-enhanced"></div>
    <form id="mini-gpt-form" class="mini-gpt-form-enhanced" style="position:relative;display:flex;align-items:flex-end;">
      <textarea id="mini-gpt-input" class="mini-gpt-input-enhanced" placeholder="Ask anything..." autocomplete="off" rows="1" style="flex:1;"></textarea>
      <button type="submit" class="mini-gpt-send-btn" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
      <button id="mini-gpt-quick-actions-btn" type="button" title="Quick Actions" aria-label="Quick Actions" style="background:none;border:none;padding:4px 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;color:#2563eb;position:relative;margin-left:4px;">
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
    providerBtn.setAttribute('aria-label', `Current provider: ${providerLabel.textContent}`);
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
      openaiOption.title = openaiKey ? '' : 'Set your API key in Settings to enable this provider.';
      geminiOption.title = geminiKey ? '' : 'Set your API key in Settings to enable this provider.';
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
      placeholder.textContent = '👋 Welcome! This is EasyAI Chat. Ask anything, anytime.';
      messagesDiv.appendChild(placeholder);
    }
  }
  function hideEmptyPlaceholder() {
    const placeholder = messagesDiv.querySelector('.mini-gpt-empty-placeholder');
    if (placeholder) placeholder.remove();
  }
  // Show placeholder initially
  showEmptyPlaceholder();

  // --- Session-based chat history ---
  let currentSession = { messages: [], date: '', preview: '' };
  function resetSession() {
    currentSession = { messages: [], date: '', preview: '' };
  }
  // --- Patch: Only save session after full bot response ---
  function trySaveCurrentSession() {
    // Only save if not streaming
    if (!requestInProgress && currentSession.messages.length > 1) {
      currentSession.date = new Date().toLocaleString();
      currentSession.preview = currentSession.messages.find(m => m.role === 'user')?.text?.slice(0, 60) || '';
      saveChatToHistory(currentSession);
    resetSession();
  }
  }

  // Patch appendMessage to hide placeholder when a message is added
  const origAppendMessage = appendMessage;
  appendMessage = function(text, from) {
    hideEmptyPlaceholder();
    origAppendMessage(text, from);
    if (from === 'user' || from === 'bot') {
      currentSession.messages.push({ role: from, text });
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
  bubble.onclick = () => {
    if ((chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible')) {
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
    
    // Update position
    chatContainer.style.left = currentX + 'px';
    chatContainer.style.top = currentY + 'px';
    chatContainer.style.right = 'auto';
    chatContainer.style.bottom = 'auto';
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
  
  // Handle window resize to keep chat in bounds
  window.addEventListener('resize', () => {
    if (chatContainer.style.display === 'flex' || chatContainer.style.visibility === 'visible') {
      const rect = chatContainer.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // If chat is outside viewport, reposition it
      if (rect.right > viewportWidth || rect.bottom > viewportHeight || rect.left < 0 || rect.top < 0) {
        chatContainer.style.left = '50px';
        chatContainer.style.top = '50px';
        chatContainer.style.right = 'auto';
        chatContainer.style.bottom = 'auto';
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
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
          streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
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
      }
      if (msg.answerPart) {
        streamingBotText += msg.answerPart;
        streamingBotMsg.innerHTML = convertMarkdownToHTML(streamingBotText);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    }
  });

  // Patch loader logic in form.onsubmit
  form.onsubmit = (e) => {
    e.preventDefault();
    const question = input.value.trim();
    // If a request is in progress, stop it
    if (requestInProgress) {
      chrome.runtime.sendMessage({ type: 'MINI_GPT_STOP' }, () => {
        removeLoader();
        if (streamingBotMsg) streamingBotMsg = null;
        requestInProgress = false;
        input.disabled = false;
        updateSendStopBtn();
      });
      return;
    }
    if (!question) return;
    sendPrompt();
  };

  function sendPrompt() {
    const question = input.value.trim();
    const provider = currentProvider;
    const model = DEFAULT_MODELS[provider];
    chrome.storage.local.get([`apiKey_${provider}`], (settings) => {
      const apiKey = settings[`apiKey_${provider}`] || '';
      if (!apiKey) {
        appendMessage('Please set your API key in the extension popup.', 'bot');
        return;
      }
      appendMessage(question, 'user');
      input.value = '';
      input.style.height = 'auto';
      // Add animated loader as bot message
      const loader = document.createElement('div');
      loader.className = 'mini-gpt-msg-bot';
      loader.setAttribute('aria-label', 'Mini-GPT is thinking');
      loader.innerHTML = `<span class='mini-gpt-loader'><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span><span class='mini-gpt-loader-dot'></span></span>`;
      messagesDiv.appendChild(loader);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      requestInProgress = true;
      input.disabled = true;
      updateSendStopBtn();
      streamingBotMsg = null;
      streamingBotText = '';
      window.postMessage({ type: 'MINI_GPT_ASK', question, provider, model, apiKey }, '*');
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
        apiKey: event.data.apiKey
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
    // Consider dark if all channels are below 60
    return rgb.slice(0,3).every(v => parseInt(v, 10) < 60);
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

  // Handle window resize to ensure proper positioning
  window.addEventListener('resize', () => {
    if (chatContainer.style.display === 'flex') {
      ensureBubbleVisibleAfterChatMove();
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

  // History button
  const historyBtn = document.createElement('button');
  historyBtn.id = 'mini-gpt-history-btn';
  historyBtn.title = 'Show chat history (Ctrl+H)';
  historyBtn.setAttribute('aria-label', 'Show chat history');
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
  newChatBtn.title = 'New Chat';
  newChatBtn.setAttribute('aria-label', 'Start new chat');
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
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.title = 'Close chat';
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
    if (currentSession.messages.length > 0 && !requestInProgress) {
      trySaveCurrentSession();
    } else {
      resetSession();
    }
    messagesDiv.innerHTML = '';
    // Ensure chat stays visible when starting new chat
    if (chatContainer.style.display === 'none') {
      chatContainer.style.display = 'flex';
      chatContainer.style.visibility = 'visible';
      chatContainer.style.opacity = '1';
    }
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
      quickActionsBtn.title = "Quick actions aren’t available on this page. Select and copy text, then paste it into EasyAI Chat.";
    } else {
      quickActionsBtn.disabled = false;
      quickActionsBtn.style.opacity = '1';
      quickActionsBtn.style.cursor = 'pointer';
      quickActionsBtn.title = 'Quick Actions';
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
      appendMessage('No readable text found on this page.', 'bot');
      return;
    }
    if (type === 'summarize') {
      userMsg = 'Summarize this page';
      prompt = `Summarize the following page content:\n\n${pageText}`;
    } else if (type === 'explain') {
      userMsg = 'Explain this page';
      prompt = `Explain the following page content in simple terms:\n\n${pageText}`;
    }
    // Show only the short user message in chat, but send the full prompt
    appendMessage(userMsg, 'user');
    // Add animated loader as bot message
    const loader = document.createElement('div');
    loader.className = 'mini-gpt-msg-bot';
    loader.setAttribute('aria-label', 'Mini-GPT is thinking');
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
        appendMessage('Please set your API key in the extension popup.', 'bot');
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
        <span class="action-text">Summarize Page</span>
      </button>
      <button class="mini-gpt-quick-action-item" data-action="explain">
        <span class="action-text">Explain Page</span>
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
      <span id="mini-gpt-history-panel-header-title">Chat History</span>
      <button id="mini-gpt-history-panel-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
    <div id="mini-gpt-history-panel-divider"></div>
    <div id="mini-gpt-history-panel-search">
      <input type="text" id="mini-gpt-history-search-input" placeholder="Search conversations..." />
    </div>
    <div id="mini-gpt-history-panel-list"></div>
    <button id="mini-gpt-history-panel-clear" style="display:none;">Clear All</button>
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
        <div>${isEmpty ? 'No history yet.' : isSearching ? 'No conversations found.' : 'No history yet.'}</div>
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
            <span class='mini-gpt-history-count'>${messageCount} messages</span>
            ${isCurrentSession ? '<span class="mini-gpt-history-current">Current</span>' : ''}
          </div>
        </div>
        <button class='mini-gpt-history-delete' title='Delete this conversation' aria-label='Delete conversation'>
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

  // --- Custom Clear Confirmation Modal ---
  let clearModal = null;
  function showClearModal() {
    if (clearModal) return;
    clearModal = document.createElement('div');
    clearModal.id = 'mini-gpt-clear-modal';
    clearModal.innerHTML = `
      <div class="mini-gpt-clear-modal-content">
        <div class="mini-gpt-clear-modal-title">⚠️ Clear all chat history?</div>
        <div class="mini-gpt-clear-modal-desc">This action cannot be undone.</div>
        <div class="mini-gpt-clear-modal-actions">
          <button id="mini-gpt-clear-cancel">Cancel</button>
          <button id="mini-gpt-clear-confirm">Clear History</button>
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
} 