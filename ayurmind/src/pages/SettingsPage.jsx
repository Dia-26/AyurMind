import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { Btn, PageHeader, Card, Alert } from '../components/UI';
import { storage, checkBackend } from '../utils/api';

export default function SettingsPage() {
  const { apiKey, setApiKey, ragEnabled, setRagEnabled, setCurrentPage, backendOnline } = useApp();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [backendURL, setBackendURL] = useState(import.meta.env.VITE_API_BASE_URL || '');

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSaved(true); setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!inputKey.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${inputKey.trim()}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'Say: AyurMind connected' }], max_tokens: 20 }),
      });
      if (r.ok) {
        const d = await r.json();
        setTestResult({ ok: true, msg: 'Connected — ' + d.choices[0].message.content });
      } else {
        const e = await r.json();
        setTestResult({ ok: false, msg: e.error?.message || 'Connection failed' });
      }
    } catch (e) { setTestResult({ ok: false, msg: e.message }); }
    setTesting(false);
  };

  const FEATURES = [
    { id: 'chat', icon: '◎', label: 'RAG Chat', desc: 'Conversational AI with classical text retrieval' },
    { id: 'prakriti', icon: '◈', label: 'Prakriti Analysis', desc: 'Constitution assessment via NLP' },
    { id: 'symptoms', icon: '⊕', label: 'Symptom Analyzer', desc: 'Dosha imbalance detection' },
    { id: 'ner', icon: '⟐', label: 'NER Visualizer', desc: 'Named entity recognition' },
    { id: 'herbs', icon: '⊛', label: 'Herb Search', desc: 'Semantic search with RAG' },
    { id: 'sentiment', icon: '◉', label: 'Sentiment NLP', desc: 'Multi-dimensional text analysis' },
    { id: 'formula', icon: '⊞', label: 'Formula Builder', desc: 'Classical formula generation' },
    { id: 'summarizer', icon: '⊟', label: 'Text Summarizer', desc: 'NLP text analysis & insights' },
  ];

  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader label="Configuration" title="Settings" subtitle="Configure your API key, backend, and platform preferences" />

        {/* Backend status */}
        <Card style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Python NLP Backend</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{backendURL || 'Not configured — set VITE_API_BASE_URL in .env'}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: backendOnline ? 'var(--sage2)' : '#D4885A', boxShadow: `0 0 6px ${backendOnline ? 'var(--sage2)' : '#D4885A'}` }} />
              <span style={{ fontSize: 12, color: backendOnline ? 'var(--sage2)' : '#D4885A' }}>{backendOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          {!backendOnline && <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontFamily: "'DM Mono',monospace" }}>
            cd ayurmind-backend && uvicorn app.main:app --reload --port 8000<br />
            Then add to frontend .env: VITE_API_BASE_URL=http://localhost:8000
          </div>}
        </Card>

        {/* API Key */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Groq API Key</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Required for all AI features. Free at <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>console.groq.com</a></div>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: apiKey ? 'var(--sage2)' : '#D4885A', boxShadow: `0 0 6px ${apiKey ? 'var(--sage2)' : '#D4885A'}` }} />
          </div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input type="password" value={inputKey} onChange={e => setInputKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="gsk_..." style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, paddingRight: 36 }} />
            {inputKey && <button onClick={() => setInputKey('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>×</button>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn onClick={handleSave} disabled={!inputKey.trim()}>{saved ? '✓ Saved!' : 'Save Key'}</Btn>
            <Btn variant="secondary" onClick={handleTest} disabled={testing || !inputKey.trim()}>{testing ? 'Testing...' : '⚡ Test Connection'}</Btn>
            {apiKey && <Btn variant="danger" onClick={() => { setInputKey(''); setApiKey(''); }}>Remove Key</Btn>}
          </div>
          {testResult && <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 'var(--r-sm)', fontSize: 13, background: testResult.ok ? 'rgba(74,122,90,.1)' : 'rgba(160,80,80,.1)', color: testResult.ok ? 'var(--sage2)' : '#D4885A', border: `1px solid ${testResult.ok ? 'rgba(74,122,90,.3)' : 'rgba(160,80,80,.3)'}` }}>{testResult.ok ? '✓ ' : '✗ '}{testResult.msg}</div>}
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>🔐 API key stored only in your browser localStorage. Never sent anywhere except directly to Groq.</div>
        </Card>

        {/* RAG toggle */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>RAG Knowledge Retrieval</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>Retrieves relevant chunks from Charaka Samhita, Sushruta Samhita & Ashtanga Hridayam before each AI call.</div>
            </div>
            <div onClick={() => setRagEnabled(!ragEnabled)} style={{ width: 44, height: 24, borderRadius: 99, cursor: 'pointer', position: 'relative', flexShrink: 0, marginLeft: 16, background: ragEnabled ? 'var(--gold)' : 'var(--bg3)', border: `1px solid ${ragEnabled ? 'var(--gold)' : 'var(--border)'}`, transition: 'all .2s' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: ragEnabled ? '#09080A' : 'var(--text4)', position: 'absolute', top: 2, left: ragEnabled ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
            </div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Charaka Samhita', 'Sushruta Samhita', 'Ashtanga Hridayam', 'Dravyaguna Shastra'].map(src => (
              <span key={src} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: ragEnabled ? 'rgba(201,160,90,.1)' : 'var(--bg3)', color: ragEnabled ? 'var(--gold2)' : 'var(--text4)', border: `1px solid ${ragEnabled ? 'rgba(201,160,90,.2)' : 'var(--border)'}`, fontFamily: "'DM Mono',monospace", transition: 'all .2s' }}>📚 {src}</span>
            ))}
          </div>
        </Card>

        {/* Model */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>AI Model</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold-glow)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚡</div>
            <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 1 }}>Llama 3.3 70B</div><div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>via Groq · 128k context · ~330 tokens/sec</div></div>
            <div style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(74,122,90,.12)', color: 'var(--sage2)', border: '1px solid rgba(74,122,90,.2)', flexShrink: 0 }}>Free Tier</div>
          </div>
        </Card>

        {/* Quick nav */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Platform Modules</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {FEATURES.map(f => (
              <div key={f.id} onClick={() => setCurrentPage(f.id)} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}>
                <span style={{ fontSize: 13, color: 'var(--gold)' }}>{f.icon}</span>
                <div><div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{f.label}</div><div style={{ fontSize: 10, color: 'var(--text3)' }}>{f.desc}</div></div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 500, color: 'var(--gold)', marginBottom: 4 }}>AyurMind v2.0</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>React + Vite frontend · FastAPI + Pure Python NLP backend · Groq (Llama 3.3 70B)</div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text4)' }}>⚕️ For educational purposes only. Not a substitute for medical advice.</div>
        </Card>
      </div>
    </div>
  );
}
