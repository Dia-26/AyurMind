import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiNER } from '../utils/api';
import { Btn, Spinner, PageHeader, Card, Alert, Badge } from '../components/UI';
import { NER_ENTITY_STYLES, NER_SAMPLE_TEXT } from '../data/constants';

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function buildHighlighted(text, entities) {
  if (!entities?.length) return [{ type: 'text', content: text }];
  const sorted = [...entities].sort((a, b) => b.text.length - a.text.length);
  const used = new Set(), spans = [];
  for (const e of sorted) {
    if (used.has((e.text||e.canonical||'').toLowerCase())) continue;
    const searchStr = e.text || e.canonical || '';
    let s = text.indexOf(searchStr);
    if (s === -1) s = text.toLowerCase().indexOf(searchStr.toLowerCase());
    if (s !== -1 && !spans.some(x => s < x.end && s + searchStr.length > x.start)) {
      spans.push({ start: s, end: s + searchStr.length, entity: e });
      used.add(searchStr.toLowerCase());
    }
  }
  spans.sort((a, b) => a.start - b.start);
  const parts = []; let cur = 0;
  for (const sp of spans) {
    if (sp.start < cur) continue;
    if (sp.start > cur) parts.push({ type: 'text', content: text.slice(cur, sp.start) });
    parts.push({ type: 'entity', content: text.slice(sp.start, sp.end), entity: sp.entity });
    cur = sp.end;
  }
  if (cur < text.length) parts.push({ type: 'text', content: text.slice(cur) });
  return parts;
}

export default function NERPage() {
  const { apiKey, backendOnline } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [confFilter, setConfFilter] = useState('all');

  const handleExtract = async () => {
    if (!text.trim()) { setError('Please enter text.'); return; }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await apiNER({ text, apiKey, useLlm: true });
      setResult({ ...data, inputText: text });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const entities = result?.entities || [];
  const filtered = confFilter === 'all' ? entities : entities.filter(e => e.confidence === confFilter);
  const grouped = filtered.reduce((acc, e) => { const t = e.type || 'UNKNOWN'; if (!acc[t]) acc[t] = []; acc[t].push(e); return acc; }, {});

  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader label="NLP — Named Entity Recognition" title="Ayurvedic NER Visualizer" subtitle="Extract and highlight entities with type classification and confidence scoring" />
        {backendOnline && <Alert type="info">🐍 Rule-based dictionary NER (271-phrase gazetteer) runs server-side.</Alert>}
        {!apiKey && <Alert type="warning">Add your Groq API key in Settings.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.25rem' }}>
          {Object.entries(NER_ENTITY_STYLES).map(([type, style]) => (
            <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 5, fontSize: 11, fontWeight: 500, background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
              {style.icon} {style.label}
            </span>
          ))}
        </div>

        <Card>
          <textarea rows={6} value={text} onChange={e => setText(e.target.value)} placeholder={`Paste Ayurvedic text here...\n\ne.g. Ashwagandha balances Vata dosha and is used in Panchakarma for anxiety and fatigue...`} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <Btn onClick={handleExtract} disabled={loading || !apiKey}>{loading ? <><Spinner color="#09080A" /> Extracting...</> : '⟐ Extract Entities'}</Btn>
            <Btn variant="secondary" onClick={() => setText(NER_SAMPLE_TEXT)}>Load Sample</Btn>
            {text && <Btn variant="ghost" onClick={() => { setText(''); setResult(null); }}>Clear</Btn>}
          </div>
        </Card>

        {result && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Entities', value: entities.length },
                { label: 'Entity Types', value: Object.keys(grouped).length },
                { label: 'Text Category', value: result.text_category || '—' },
                { label: 'Authenticity', value: `${result.authenticity_score ?? '—'}%` },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '8px 14px', flex: '1 1 100px', minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gold)', fontFamily: "'DM Mono',monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Highlighted text */}
            <Card>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Highlighted Text</div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1rem', fontSize: 13, lineHeight: 2.2, minHeight: 80 }}>
                {buildHighlighted(result.inputText, entities).map((part, i) => {
                  if (part.type === 'text') return <span key={i}>{part.content}</span>;
                  const t = (part.entity.type || 'UNKNOWN').toLowerCase();
                  const style = NER_ENTITY_STYLES[t] || NER_ENTITY_STYLES.concept || { bg: 'var(--bg4)', text: 'var(--text3)', border: 'var(--border)' };
                  return <span key={i} title={`${part.entity.type} — ${part.entity.confidence} confidence`} style={{ display: 'inline', padding: '2px 7px', borderRadius: 4, fontSize: 12, margin: 1, fontWeight: 500, lineHeight: 1.8, background: style.bg, color: style.text, border: `1px solid ${style.border}`, cursor: 'help' }}>{part.content}</span>;
                })}
              </div>
            </Card>

            {/* Filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Filter:</span>
              {['all', 'high', 'medium', 'low'].map(f => (
                <button key={f} onClick={() => setConfFilter(f)} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, cursor: 'pointer', border: '1px solid', background: confFilter === f ? 'var(--gold)' : 'none', color: confFilter === f ? '#09080A' : 'var(--text3)', borderColor: confFilter === f ? 'var(--gold)' : 'var(--border)', fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Grouped entities */}
            {Object.keys(grouped).length > 0 && (
              <Card>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Extracted Entities</div>
                {Object.entries(grouped).map(([type, ents]) => {
                  const styleKey = type.toLowerCase();
                  const style = NER_ENTITY_STYLES[styleKey] || { bg: 'var(--bg4)', text: 'var(--text3)', border: 'var(--border)', icon: '◈', label: type };
                  return (
                    <div key={type} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>{style.icon} {style.label} ({ents.length})</div>
                      <div>{ents.map((e, i) => (
                        <span key={i} title={e.explanation || ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 5, fontSize: 12, fontWeight: 500, margin: 2, background: style.bg, color: style.text, border: `1px solid ${style.border}`, cursor: 'help' }}>
                          {e.text || e.canonical}<span style={{ fontSize: 9, opacity: .7 }}>{e.confidence === 'high' ? '●' : e.confidence === 'medium' ? '◐' : '○'}</span>
                        </span>
                      ))}</div>
                    </div>
                  );
                })}
              </Card>
            )}

            {result.summary && (
              <Card>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>NLP Analysis Summary</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{result.summary}</p>
                {result.key_concepts?.length > 0 && <div style={{ marginTop: 10 }}>{result.key_concepts.map(c => <Badge key={c} color="gold">{c}</Badge>)}</div>}
                {result.nlp_method && <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text4)', fontFamily: "'DM Mono',monospace" }}>[{result.nlp_method}]</div>}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
