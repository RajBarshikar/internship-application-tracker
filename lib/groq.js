const fs = require('fs');
const path = require('path');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function readGroqKey() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim();
  }
  try {
    const src = fs.readFileSync(path.join(__dirname, '..', 'config.js'), 'utf8');
    const match = src.match(/groqApiKey\s*:\s*["']([^"']*)["']/);
    const key = match && match[1].trim();
    if (key && !key.includes('YOUR_GROQ_API_KEY')) return key;
  } catch (e) {
    // config.js is local-only and is not deployed
  }
  return '';
}

function sanitizeChatBody(body) {
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return null; }
  }
  if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) return null;

  const messages = body.messages.slice(0, 6)
    .filter((m) => m && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({
      role: m.role === 'system' || m.role === 'assistant' ? m.role : 'user',
      content: m.content.slice(0, 24000)
    }));
  if (messages.length === 0) return null;

  const model = typeof body.model === 'string' && body.model.length > 0 && body.model.length < 80
    ? body.model
    : 'openai/gpt-oss-120b';

  return {
    model,
    messages,
    temperature: 0.6,
    response_format: { type: 'json_object' }
  };
}

async function proxyGroqChat(body, apiKey) {
  if (!apiKey) {
    return {
      status: 503,
      body: JSON.stringify({ error: 'Set GROQ_API_KEY on Vercel, or groqApiKey in local config.js' })
    };
  }
  const payload = sanitizeChatBody(body);
  if (!payload) {
    return { status: 400, body: JSON.stringify({ error: 'Invalid chat request' }) };
  }

  const upstream = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const text = await upstream.text();
  return { status: upstream.status, body: text || '{}' };
}

module.exports = { readGroqKey, proxyGroqChat };
