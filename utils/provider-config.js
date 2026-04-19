(function initProviderConfig(globalScope) {
  if (globalScope.EASYAI_PROVIDER_CONFIG) return;

  const hfModels = [
    'meta-llama/Llama-3.1-8B-Instruct',
    'mistralai/Mistral-7B-Instruct-v0.2',
    'google/gemma-7b-it',
    'microsoft/Phi-3-mini-4k-instruct',
    'Qwen/Qwen2.5-7B-Instruct'
  ];

  globalScope.EASYAI_PROVIDER_CONFIG = {
    apiKeyFields: ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'],
    defaultModels: {
      openai: 'gpt-3.5-turbo',
      gemini: 'gemini-2.0-flash',
      huggingface: hfModels[0]
    },
    hfModels,
    defaultPromptPrefix: 'Give a simple, direct, resume answer. '
  };
})(globalThis);
