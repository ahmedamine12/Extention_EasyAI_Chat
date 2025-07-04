export async function askOpenAI({ apiKey, model, prompt }) {
  const url = 'https://api.openai.com/v1/chat/completions';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256
      })
    });
    const data = await res.json();
    if (data.choices && data.choices[0]?.message?.content) {
      return { ok: true, answer: data.choices[0].message.content };
    } else {
      return { ok: false, error: data.error?.message || 'No answer from OpenAI.' };
    }
  } catch (e) {
    return { ok: false, error: e.message || 'Network error.' };
  }
} 