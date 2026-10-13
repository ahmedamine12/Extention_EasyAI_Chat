(function initProviderConfig(globalScope) {
  if (globalScope.EASYAI_PROVIDER_CONFIG) return;

  const hfModels = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'openai/gpt-oss-20b',
    'google/gemma-3-27b-it',
    'Qwen/Qwen2.5-72B-Instruct'
  ];

  const openaiModels = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4.1-mini',
    'gpt-4.1'
  ];

  const geminiModels = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];

  /** Text-only providers that speak the OpenAI chat-completions format (streamed, tried in order). */
  const nvidiaModels = [
    'nvidia/nemotron-3-super-120b-a12b',
    'meta/llama-3.2-11b-vision-instruct',
    'nvidia/nemotron-3.5-lightning-30b-a3b',
    'openai/gpt-oss-20b',
    'nvidia/nemotron-3-ultra-550b-a55b'
  ];
  const groqModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-20b'
  ];

  /**
   * Vision (VLM) models for https://router.huggingface.co/v1/chat/completions
   * Must be available on Inference Providers for your token (see HF token permissions).
   * Model ids must be listed at https://router.huggingface.co/v1/models (checked Oct 2026).
   */
  const hfVisionModels = [
    'Qwen/Qwen3-VL-30B-A3B-Instruct',
    'Qwen/Qwen2.5-VL-72B-Instruct',
    'google/gemma-3-27b-it'
  ];

  globalScope.EASYAI_PROVIDER_CONFIG = {
    apiKeyFields: ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface', 'apiKey_nvidia', 'apiKey_groq'],
    defaultModels: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.0-flash',
      huggingface: hfModels[0],
      nvidia: nvidiaModels[0],
      groq: groqModels[0]
    },
    /** Vision-capable defaults (separate from text-only HF router list). */
    visionDefaultModels: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.0-flash',
      huggingface: hfVisionModels[0]
    },
    hfVisionModels,
    models: {
      openai: openaiModels,
      gemini: geminiModels,
      huggingface: hfModels,
      nvidia: nvidiaModels,
      groq: groqModels
    },
    hfModels,
    compatProviders: {
      nvidia: {
        label: 'NVIDIA NIM',
        endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
        models: nvidiaModels,
        keysUrl: 'https://build.nvidia.com/settings/api-keys',
        keyHint: 'Make sure it starts with "nvapi-".'
      },
      groq: {
        label: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        models: groqModels,
        keysUrl: 'https://console.groq.com/keys',
        keyHint: 'Make sure it starts with "gsk_".'
      }
    },
    /** Shown as placeholder in popup; stored prefix is user-controlled. Wording avoids “resume” (CV vs brief). */
    defaultPromptPrefix: 'Keep answers brief and direct.',
    /** Max longest side (px) after client resize; JPEG quality applied in content script. */
    visionMaxImageSide: 1280,
    /** BYOK-only build: no hosted trial relay. */
  };
})(globalThis);
