export function formatError(provider, error) {
  if (!error) return 'Unknown error.';
  if (provider === 'gemini') {
    if (error.includes('API key')) return 'Gemini API key is missing or invalid.';
    if (error.includes('quota')) return 'Gemini API quota exceeded.';
    if (error.includes('not found')) return 'Gemini model not found or not available for your account.';
    return `Gemini error: ${error}`;
  }
  if (provider === 'openai') {
    if (error.includes('API key')) return 'OpenAI API key is missing or invalid.';
    if (error.includes('quota')) return 'OpenAI API quota exceeded.';
    if (error.includes('model')) return 'OpenAI model not found or not available for your account.';
    return `OpenAI error: ${error}`;
  }
  return error;
} 