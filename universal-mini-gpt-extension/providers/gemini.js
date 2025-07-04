export async function askGemini({ apiKey, model, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return { ok: true, answer: data.candidates[0].content.parts[0].text };
    } else {
      return { ok: false, error: data.error?.message || 'No answer from Gemini.' };
    }
  } catch (e) {
    return { ok: false, error: e.message || 'Network error.' };
  }
} 