// AyurMind — API Service
// When VITE_API_BASE_URL is set, calls the Python NLP backend.
// Otherwise falls back to direct Groq API calls from the browser.

export { retrieveContext, buildRAGContext } from '../data/knowledgeBase.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || '';

// ── Backend Client ─────────────────────────────────────────────────────────

export async function callBackend(endpoint, body) {
  const res = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Backend error: HTTP ${res.status}`);
  }
  return res.json();
}

export async function checkBackend() {
  if (!BACKEND_URL) return false;
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Direct Groq Client (fallback) ─────────────────────────────────────────

export async function groq(messages, { maxTokens = 900, temperature = 0.7, apiKey } = {}) {
  if (!apiKey) throw new Error('API key required. Add your Groq API key in Settings.');
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()).choices[0].message.content;
}

export async function groqJSON(messages, opts = {}) {
  let raw = await groq(messages, opts);
  raw = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response format — please try again.');
  return JSON.parse(match[0]);
}

// ── Unified API (backend or direct Groq) ──────────────────────────────────

export async function apiChat({ query, history, apiKey, ragEnabled }) {
  if (BACKEND_URL) return callBackend('/api/nlp/chat', { query, history, api_key: apiKey, rag_enabled: ragEnabled });
  const { retrieveContext, buildRAGContext } = await import('../data/knowledgeBase.js');
  const { chatPrompt } = await import('./prompts.js');
  const chunks = ragEnabled ? retrieveContext(query, 3) : [];
  const ragCtx = buildRAGContext(chunks);
  const messages = [{ role: 'system', content: chatPrompt(ragCtx) }, ...history.filter(m => m.role !== 'system'), { role: 'user', content: query }];
  const response = await groq(messages, { apiKey, maxTokens: 700, temperature: 0.6 });
  return { response, rag_chunks: chunks.map(c => ({ source: c.source, relevance: c.score || 0 })), rag_enabled: ragEnabled };
}

export async function apiPrakriti({ answers, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/prakriti', { answers, api_key: apiKey });
  const { prakritiPrompt } = await import('./prompts.js');
  const combined = answers.map((a, i) => `Q${i + 1}: ${a || '(skipped)'}`).join('\n');
  const result = await groqJSON([{ role: 'system', content: prakritiPrompt }, { role: 'user', content: 'Analyze my Prakriti:\n' + combined }], { apiKey, maxTokens: 900 });
  result.nlp_pre_scores = { method: 'llm_only' };
  return result;
}

export async function apiSymptoms({ selectedSymptoms, freeText, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/symptoms', { selected_symptoms: selectedSymptoms, free_text: freeText, api_key: apiKey });
  const { symptomsPrompt } = await import('./prompts.js');
  const prompt = `Symptoms: ${selectedSymptoms.join(', ')}\n${freeText ? 'Description: ' + freeText : ''}`;
  const result = await groqJSON([{ role: 'system', content: symptomsPrompt }, { role: 'user', content: prompt }], { apiKey, maxTokens: 1000 });
  result.nlp_classification = { method: 'llm_only' };
  return result;
}

export async function apiNER({ text, apiKey, useLlm = true }) {
  if (BACKEND_URL) return callBackend('/api/nlp/ner', { text, api_key: apiKey, use_llm: useLlm });
  const { nerPrompt } = await import('./prompts.js');
  return groqJSON([{ role: 'system', content: nerPrompt }, { role: 'user', content: `Extract entities from: "${text}"` }], { apiKey, maxTokens: 900 });
}

export async function apiHerbs({ query, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/herbs', { query, api_key: apiKey });
  const { herbsPrompt } = await import('./prompts.js');
  return groqJSON([{ role: 'system', content: herbsPrompt() }, { role: 'user', content: `Find Ayurvedic herbs for: "${query}"` }], { apiKey, maxTokens: 1100 });
}

export async function apiSentiment({ text, mode, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/sentiment', { text, mode, api_key: apiKey });
  const { sentimentPrompt, claimVerifierPrompt } = await import('./prompts.js');
  const sysPrompt = mode === 'claim' ? claimVerifierPrompt : sentimentPrompt;
  return groqJSON([{ role: 'system', content: sysPrompt }, { role: 'user', content: `Analyze: "${text}"` }], { apiKey, maxTokens: 800 });
}

export async function apiFormula({ goals, imbalance, constitution, notes, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/formula', { goals, imbalance, constitution, notes, api_key: apiKey });
  const { formulaBuilderPrompt } = await import('./prompts.js');
  const prompt = `Goals: ${goals.join(', ')}\nImbalance: ${imbalance || 'not specified'}\nConstitution: ${constitution || 'not specified'}\nNotes: ${notes || 'none'}`;
  return groqJSON([{ role: 'system', content: formulaBuilderPrompt }, { role: 'user', content: prompt }], { apiKey, maxTokens: 1000 });
}

export async function apiSummarize({ text, apiKey }) {
  if (BACKEND_URL) return callBackend('/api/nlp/summarize', { text, api_key: apiKey });
  const { textSummarizerPrompt } = await import('./prompts.js');
  return groqJSON([{ role: 'system', content: textSummarizerPrompt }, { role: 'user', content: `Analyze and summarize:\n\n${text}` }], { apiKey, maxTokens: 900 });
}

export async function apiRAG({ query, topK = 4 }) {
  if (!BACKEND_URL) return null;
  const res = await fetch(`${BACKEND_URL}/api/nlp/rag`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, top_k: topK }) });
  if (!res.ok) return null;
  return res.json();
}

// ── Storage & Utilities ────────────────────────────────────────────────────

export const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(`ayurmind_${key}`)); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(`ayurmind_${key}`, JSON.stringify(val)); } catch {} },
  remove: (key) => { try { localStorage.removeItem(`ayurmind_${key}`); } catch {} },
};

export function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, `<code style="font-family:'DM Mono',monospace;background:rgba(201,160,90,0.1);padding:1px 5px;border-radius:3px;font-size:12px">$1</code>`)
    .split('\n').join('<br/>');
}
