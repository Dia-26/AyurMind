import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiPrakriti } from '../utils/api';
import { Btn, Spinner, PageHeader, DoshaBar, Badge, Card, Disclaimer, Alert } from '../components/UI';

const QUESTIONS = [
  { id: 'pq1', num: 1, label: 'Body frame & weight', hint: 'Your natural build — without lifestyle changes.', placeholder: 'e.g. I have a lean, thin frame. Hard to gain weight despite eating well. Prominent joints...' },
  { id: 'pq2', num: 2, label: 'Digestion & appetite', hint: 'Natural digestive patterns and hunger.', placeholder: 'e.g. Strong intense digestion. Very hungry at regular intervals, irritable if I skip meals...' },
  { id: 'pq3', num: 3, label: 'Mind, emotions & sleep', hint: 'Natural temperament, thought patterns, sleep quality.', placeholder: 'e.g. Quick thinking but quick to worry. Mind races at night. Light sleep, wake easily...' },
  { id: 'pq4', num: 4, label: 'Speech & activity level', hint: 'Natural pace of speech, movement and work style.', placeholder: 'e.g. Speak quickly, move fast. Start many projects, struggle to finish. Prefer variety...' },
  { id: 'pq5', num: 5, label: 'Skin, hair & energy', hint: 'Natural tendencies — not after routines.', placeholder: 'e.g. Naturally dry skin in winter. Fine frizzy hair. Energy in bursts then sudden tiredness...' },
];

const DC = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)' };
const DE = { vata: '🌬', pitta: '🔥', kapha: '🌿' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

export default function PrakritiPage() {
  const { apiKey, setPrakritiResult, backendOnline } = useApp();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [animated, setAnimated] = useState(false);

  const handleSubmit = async () => {
    const filled = QUESTIONS.filter(q => (answers[q.id] || '').length > 8);
    if (filled.length < 2) { setError('Please answer at least 2–3 questions with some detail.'); return; }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await apiPrakriti({ answers: QUESTIONS.map(q => answers[q.id] || ''), apiKey });
      setResult(data); setPrakritiResult(data);
      setAnimated(false); setTimeout(() => setAnimated(true), 80);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const r = result;
  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader label="Ashta-vidha Pariksha" title="Prakriti Constitution Analysis"
          subtitle="Discover your unique psycho-physical constitution through AI-powered Ayurvedic assessment" />
        <Disclaimer text="⚕️ Educational insights based on classical Ayurvedic principles. Not a substitute for a qualified Vaidya." />
        {backendOnline && <Alert type="info">🐍 Python NLP backend active — keyword scoring runs before LLM analysis.</Alert>}
        {!apiKey && <Alert type="warning">Add your Groq API key in Settings.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.25rem' }}>Answer 2–5 questions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {QUESTIONS.map(q => (
              <div key={q.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold-glow)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gold)', fontWeight: 600, flexShrink: 0 }}>{q.num}</span>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>{q.label}</label>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 7, paddingLeft: 32, fontWeight: 300 }}>{q.hint}</p>
                <textarea rows={2} placeholder={q.placeholder} value={answers[q.id] || ''} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} style={{ paddingLeft: 32 }} />
              </div>
            ))}
          </div>
          <Btn onClick={handleSubmit} disabled={loading || !apiKey} style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: '1rem' }}>
            {loading ? <><Spinner color="#09080A" /> Analyzing constitution...</> : '◈ Analyze My Prakriti'}
          </Btn>
        </Card>

        {r && (
          <div style={{ animation: 'fadeUp .5s ease both' }}>
            <Card accent={DC[r.primary]}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Your Constitution</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 500, color: DC[r.primary], lineHeight: 1.1 }}>
                    {cap(r.primary)}{r.secondary && r.secondary !== 'none' ? `–${cap(r.secondary)}` : ''} Prakriti
                  </div>
                </div>
                <div style={{ fontSize: '2.5rem' }}>{DE[r.primary] || '◈'}</div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1.25rem' }}>{r.summary}</p>
              <DoshaBar label="Vata"  value={animated ? r.vata  : 0} type="vata"  delay={0}   />
              <DoshaBar label="Pitta" value={animated ? r.pitta : 0} type="pitta" delay={0.1} />
              <DoshaBar label="Kapha" value={animated ? r.kapha : 0} type="kapha" delay={0.2} />
              {r.vikruti_hint && <div style={{ marginTop: '1rem', padding: '8px 12px', background: 'rgba(201,160,90,.06)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}><span style={{ color: 'var(--gold)', fontWeight: 600 }}>Vikruti hint:</span> {r.vikruti_hint}</div>}
              {r.nlp_pre_scores && r.nlp_pre_scores.method !== 'llm_only' && (
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text4)', fontFamily: "'DM Mono',monospace" }}>NLP pre-score: V={r.nlp_pre_scores.vata}% P={r.nlp_pre_scores.pitta}% K={r.nlp_pre_scores.kapha}% [{r.nlp_pre_scores.method}]</div>
              )}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Key Characteristics</div>
                {(r.characteristics || []).map((c, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: DC[r.primary], flexShrink: 0 }}>•</span>{c}</div>)}
              </Card>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: 10 }}>Diet Guidelines</div>
                {(r.diet_tips || []).map((d, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: 'var(--sage2)', flexShrink: 0 }}>✓</span>{d}</div>)}
              </Card>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--vata)', marginBottom: 10 }}>Lifestyle Guidance</div>
                {(r.lifestyle_tips || []).map((l, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: 'var(--vata)', flexShrink: 0 }}>◆</span>{l}</div>)}
              </Card>
              <Card style={{ marginBottom: 0, background: 'rgba(160,80,80,.04)', borderColor: 'rgba(160,80,80,.15)' }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4885A', marginBottom: 10 }}>Foods & Habits to Avoid</div>
                {(r.avoid || []).map((a, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 5, display: 'flex', gap: 7 }}><span style={{ color: '#D4885A', flexShrink: 0 }}>✗</span>{a}</div>)}
              </Card>
            </div>
            <Card style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Recommended Herbs</div><div>{(r.herbs || []).map(h => <Badge key={h} color="sage">{h}</Badge>)}</div></div>
                {r.season_guidance && <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>Seasonal Advice</div><p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{r.season_guidance}</p></div>}
                {r.rag_sources?.length > 0 && <div><div style={{ fontSize: 10, color: 'var(--text4)', marginBottom: 6 }}>RAG Sources</div>{r.rag_sources.map(s => <div key={s} style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>📚 {s}</div>)}</div>}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
