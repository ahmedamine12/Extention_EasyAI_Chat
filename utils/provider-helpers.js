(function initProviderHelpers(globalScope) {
  if (globalScope.EASYAI_PROVIDER_HELPERS) return;

  const config = globalScope.EASYAI_PROVIDER_CONFIG || {};

  function getApiKeyFields() {
    return config.apiKeyFields || ['apiKey_openai', 'apiKey_gemini', 'apiKey_huggingface'];
  }

  function hasAnyApiKey(settings) {
    const fields = getApiKeyFields();
    return fields.some((field) => settings[field] && settings[field].trim());
  }

  function getDefaultModelForProvider(provider) {
    const defaultModels = config.defaultModels || {};
    return defaultModels[provider] || defaultModels.openai || 'gpt-3.5-turbo';
  }

  function getDefaultVisionModelForProvider(provider) {
    const vision = config.visionDefaultModels || {};
    return vision[provider] || getDefaultModelForProvider(provider);
  }

  function getHfVisionModels() {
    return config.hfVisionModels && config.hfVisionModels.length
      ? config.hfVisionModels
      : ['Qwen/Qwen2.5-VL-7B-Instruct:fastest', 'Qwen/Qwen2-VL-7B-Instruct'];
  }

  function resolveProviderFromSettings(settings) {
    let provider = settings.provider;
    if (!provider || !settings[`apiKey_${provider}`]) {
      if (settings.apiKey_openai) provider = 'openai';
      else if (settings.apiKey_gemini) provider = 'gemini';
      else if (settings.apiKey_huggingface) provider = 'huggingface';
      else provider = 'openai';
    }
    return provider;
  }

  globalScope.EASYAI_PROVIDER_HELPERS = {
    getApiKeyFields,
    hasAnyApiKey,
    getDefaultModelForProvider,
    getDefaultVisionModelForProvider,
    getHfVisionModels,
    resolveProviderFromSettings
  };
})(globalThis);
