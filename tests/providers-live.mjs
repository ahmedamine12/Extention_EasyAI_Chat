// Live smoke test: calls Groq / NVIDIA NIM exactly like background.js (streamed chat completions, 30s timeout).
// Usage: GROQ_API_KEY=... NVIDIA_API_KEY=... node tests/providers-live.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = { globalThis: {} };
ctx.globalThis = ctx;
vm.runInNewContext(readFileSync(new URL('../utils/provider-config.js', import.meta.url), 'utf8'), ctx);
const compat = ctx.EASYAI_PROVIDER_CONFIG.compatProviders;
const keys = { groq: process.env.GROQ_API_KEY, nvidia: process.env.NVIDIA_API_KEY };
const TIMEOUT_MS = 30000;

async function testModel(provider, model) {
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(compat[provider].endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keys[provider]}` },
      body: JSON.stringify({
        model, stream: true, max_tokens: 1024, temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Give simple, direct, concise answers.' },
          { role: 'user', content: 'Reply with just: pong' }
        ]
      }),
      signal: ac.signal
    });
    const headersMs = Date.now() - t0;
    if (!res.ok) {
      const body = (await res.text().catch(() => '')).slice(0, 200).replace(/\s+/g, ' ');
      return { ok: false, detail: `HTTP ${res.status} after ${headersMs}ms: ${body}` };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '', text = '', firstMs = null, thinking = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() || '';
      for (const l of lines) {
        const t = l.trim();
        if (!t.startsWith('data: ') || t === 'data: [DONE]') continue;
        try {
          const d = JSON.parse(t.slice(6)).choices?.[0]?.delta;
          if (d?.reasoning_content || d?.reasoning) thinking = true;
          if (d?.content) { firstMs ??= Date.now() - t0; text += d.content; }
        } catch {}
      }
    }
    clearTimeout(timer);
    const total = Date.now() - t0;
    return text
      ? { ok: true, detail: `headers ${headersMs}ms, first token ${firstMs}ms, total ${total}ms${thinking ? ' (reasoning)' : ''}, reply: ${JSON.stringify(text.trim().slice(0, 40))}` }
      : { ok: false, detail: `stream ended with no content after ${total}ms${thinking ? ' (only reasoning tokens)' : ''}` };
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, detail: e.name === 'AbortError' ? `TIMEOUT after ${TIMEOUT_MS}ms (this is the "always loading" case)` : `${e.name}: ${e.message}` };
  }
}

let failed = 0;
for (const provider of Object.keys(compat)) {
  console.log(`\n== ${compat[provider].label} ==`);
  if (!keys[provider]) { console.log('  skipped (no key in env)'); continue; }
  for (const model of compat[provider].models) {
    const r = await testModel(provider, model);
    if (!r.ok) failed++;
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${model}\n        ${r.detail}`);
  }
}
process.exit(failed ? 1 : 0);
