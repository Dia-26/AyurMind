import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiSymptoms } from '../utils/api';
import { Btn, Spinner, PageHeader, DoshaBar, Card, Disclaimer, Alert, Chip } from '../components/UI';
import { SYMPTOM_CHIPS } from '../data/constants';

const AMA_C = { low: 'var(--sage2)', moderate: 'var(--gold)', high: '#D4885A' };
const DC = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)', tridoshic: 'var(--gold)' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

export default function SymptomsPage() {
  const { apiKey, backendOnline } = useApp();
  const [selected, setSelected] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animated, setAnimated] = useState(false);

  const toggle = s => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const handleAnalyze = async () => {
    if (!selected.length && !freeText) { setError('Please select symptoms or describe them.'); return; }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await apiSymptoms({ selectedSymptoms: selected, freeText, apiKey });
      setResult(data); setAnimated(false); setTimeout(() => setAnimated(true), 80);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const r = result;
  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader label="Nidana Panchaka" title="Symptom Analyzer" subtitle="AI maps symptoms to dosha imbalances using classical Ayurvedic diagnostic methodology" />
        <Disclaimer text="⚕️ Not a diagnostic tool. For serious or persistent symptoms, consult a healthcare professional." />
        {backendOnline && <Alert type="info">🐍 Weighted keyword NLP classifier running before LLM analysis.</Alert>}
        {!apiKey && <Alert type="warning">Add your Groq API key in Settings.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 10, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>Quick-select symptoms ({selected.length} selected)</div>
          <div style={{ marginBottom: '1rem' }}>{SYMPTOM_CHIPS.map(s => <Chip key={s} label={s} selected={selected.includes(s)} onClick={() => toggle(s)} />)}</div>
          {selected.length > 0 && (
            <div style={{ marginBottom: '1rem', padding: '8px 12px', background: 'var(--gold-dim)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
              Selected: {selected.join(' · ')} <span onClick={() => setSelected([])} style={{ marginLeft: 8, color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}>Clear all</span>
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>Or describe in your own words</div>
          <textarea rows={3} value={freeText} onChange={e => setFreeText(e.target.value)} placeholder="e.g. Very tired lately, skin is dry, waking at 3am, feeling anxious about work..." />
          <Btn onClick={handleAnalyze} disabled={loading || !apiKey} style={{ marginTop: 12, width: '100%', justifyContent: 'center', padding: 12 }}>
            {loading ? <><Spinner color="#09080A" /> Analyzing...</> : '⊕ Analyze Symptoms'}
          </Btn>
        </Card>

        {r && (
          <div style={{ animation: 'fadeUp .5s ease both' }}>
            <Card accent={DC[r.primary_imbalance]}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Primary Imbalance</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 500, color: DC[r.primary_imbalance], textTransform: 'capitalize' }}>
                    {r.primary_imbalance}{r.secondary_imbalance && r.secondary_imbalance !== 'none' ? ` + ${r.secondary_imbalance}` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 2 }}>Ama Level</div>
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: `${AMA_C[r.ama_level]}22`, color: AMA_C[r.ama_level], border: `1px solid ${AMA_C[r.ama_level]}44`, textTransform: 'capitalize' }}>{r.ama_level}</span>
                </div>
              </div>
              <DoshaBar label="Vata"  value={animated ? r.vata_score  : 0} type="vata"  delay={0}   />
              <DoshaBar label="Pitta" value={animated ? r.pitta_score : 0} type="pitta" delay={0.1} />
              <DoshaBar label="Kapha" value={animated ? r.kapha_score : 0} type="kapha" delay={0.2} />
              {r.chief_concern && <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Chief Concern</div><p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{r.chief_concern}</p></div>}
              {r.root_cause && <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Classical Root Cause</div><p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{r.root_cause}</p></div>}
              {r.nlp_classification?.method && r.nlp_classification.method !== 'llm_only' && <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text4)', fontFamily: "'DM Mono',monospace" }}>NLP: [{r.nlp_classification.method}] V={r.nlp_classification.vata_score}% P={r.nlp_classification.pitta_score}% K={r.nlp_classification.kapha_score}%</div>}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: 10 }}>Immediate Remedies</div>
                {(r.immediate_remedies || []).map((rem, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'flex', gap: 7 }}><span style={{ color: 'var(--sage2)', flexShrink: 0 }}>✓</span>{rem}</div>)}
              </Card>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Diet Changes</div>
                {(r.diet_changes || []).map((d, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'flex', gap: 7 }}><span style={{ color: 'var(--gold)', flexShrink: 0 }}>◆</span>{d}</div>)}
              </Card>
            </div>

            {(r.herbal_support || []).length > 0 && (
              <Card>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: 10 }}>Herbal Support</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.herbal_support.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 16 }}>🌿</span>
                      <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{h.herb}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{h.purpose}</div>{h.dose && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, fontFamily: "'DM Mono',monospace" }}>Dose: {h.dose}</div>}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--vata)', marginBottom: 10 }}>Lifestyle Changes</div>
                {(r.lifestyle_changes || []).map((l, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, display: 'flex', gap: 7 }}><span style={{ color: 'var(--vata)', flexShrink: 0 }}>◆</span>{l}</div>)}
              </Card>
              {(r.warning_signs || []).length > 0 && (
                <Card style={{ marginBottom: 0, background: 'rgba(160,80,80,.04)', borderColor: 'rgba(160,80,80,.15)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4885A', marginBottom: 10 }}>⚠ Seek Medical Care If</div>
                  {r.warning_signs.map((w, i) => <div key={i} style={{ fontSize: 13, color: '#D4885A', marginBottom: 6, opacity: .85 }}>• {w}</div>)}
                </Card>
              )}
            </div>
            {r.rag_sources?.length > 0 && <div style={{ marginTop: '1rem', fontSize: 10, color: 'var(--text4)' }}>RAG Sources: {r.rag_sources.map(s => <span key={s} style={{ fontFamily: "'DM Mono',monospace", marginLeft: 6 }}>📚{s}</span>)}</div>}
            {r.disclaimer && <div style={{ marginTop: '1rem', padding: '10px 14px', background: 'rgba(201,160,90,.05)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>ℹ️ {r.disclaimer}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
