(function initProviderConfig(globalScope) {
  if (globalScope.EASYAI_PROVIDER_CONFIG) return;

  const hfModels = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/gemma-7b-it',
    'microsoft/Phi-3-mini-4k-instruct',
    'Qwen/Qwen2.5-7B-Instruct'
  ];

  const openaiModels = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'o1-mini',
    'o1-preview'
  ];

  const geminiModels = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  /**
   * Vision (VLM) models for https://router.huggingface.co/v1/chat/completions
   * Must be available on Inference Providers for your token (see HF token permissions).
   * Suffix :fastest lets the router pick a working provider (HF docs).
   */
  const hfVisionModels = [
    'Qwen/Qwen2.5-VL-7B-Instruct:fastest',
    'Qwen/Qwen2.5-VL-7B-Instruct',
    'Qwen/Qwen2-VL-7B-Instruct'
  ];

  globalScope.EASYAI_PROVIDER_CONFIG = {
    apiKeyFields: ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'],
    defaultModels: {
      openai: 'gpt-4o-mini',
      gemini: 'gemini-2.0-flash',
      huggingface: hfModels[0]
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
      huggingface: hfModels
    },
    hfModels,
    defaultPromptPrefix: 'Give a short, direct answer. Be concise. ',
    /** Max longest side (px) after client resize; JPEG quality applied in content script. */
    visionMaxImageSide: 1280
  };
})(globalThis);
