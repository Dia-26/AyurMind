import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiSentiment, apiFormula, apiSummarize } from '../utils/api';
import { Btn, Spinner, PageHeader, Card, Alert, Badge, TabBar, ConfidenceMeter, Disclaimer } from '../components/UI';

const TABS = [
  { id: 'review', label: 'Review Analysis' },
  { id: 'claim', label: 'Claim Verifier' },
  { id: 'text', label: 'General NLP' },
];

const SAMPLES = {
  review: `I've been using Triphala churna for two months for my digestive issues. The bloating after meals has significantly reduced and my bowel movements are more regular. The taste is very bitter but effective. I pair it with warm water at night as advised by my practitioner. Very satisfied overall.`,
  claim: `Boiling neem leaves and drinking the water every morning on an empty stomach will completely cure Type 2 diabetes within 30 days. This ancient Ayurvedic secret that doctors don't want you to know has been suppressed by the pharmaceutical industry for decades.`,
  text: `The concept of Agni or digestive fire is central to Ayurvedic medicine. According to Charaka Samhita, impaired Agni is the root cause of most diseases. Herbs like Trikatu — ginger, black pepper, and long pepper — are traditionally used to kindle Agni and improve metabolism.`,
};

const HINTS = {
  review: 'Paste a product review or patient testimonial about an Ayurvedic product or treatment.',
  claim: 'Paste a health claim to verify if it has authentic Ayurvedic classical backing or is pseudoscientific.',
  text: 'Paste any Ayurvedic-related text for comprehensive NLP analysis: intent, themes, sentiment, and authenticity.',
};

const SENTIMENT_COLORS = { positive: 'var(--sage2)', negative: '#D4885A', neutral: 'var(--text3)', mixed: 'var(--gold)', informative: 'var(--vata)' };
const VERDICT_COLORS = { authentic: 'var(--sage2)', partially_authentic: 'var(--gold)', pseudoscientific: '#D4885A', unverifiable: 'var(--text3)' };
const RISK_COLORS = { low: 'var(--sage2)', medium: 'var(--gold)', high: '#D4885A' };
const EVIDENCE_COLORS = { A: 'var(--sage2)', B: 'var(--gold2)', C: 'var(--gold)', D: '#D4885A' };

export default function SentimentPage() {
  const { apiKey } = useApp();
  const [activeTab, setActiveTab] = useState('review');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const SYSTEM_MAP = {
    review: SYSTEM_PROMPTS.sentiment,
    claim: SYSTEM_PROMPTS.claimVerifier,
    text: SYSTEM_PROMPTS.sentiment,
  };

  const handleAnalyze = async () => {
    if (!text.trim()) { setError('Please enter text.'); return; }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await groqJSON([
        { role: 'system', content: SYSTEM_MAP[activeTab] },
        { role: 'user', content: `Analyze: "${text}"` },
      ], { apiKey, maxTokens: 800 });
      setResult({ ...data, mode: activeTab });
    } catch (e) {
      setError('Analysis failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: '56px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader
          label="NLP — Multi-dimensional Analysis"
          title="Sentiment & Intent Analysis"
          subtitle="Analyze tone, verify Ayurvedic claims, detect pseudoscience vs. authentic classical wisdom"
        />
        <Disclaimer text="◎ This tool analyzes text patterns and Ayurvedic alignment. It does not replace expert review for medical decisions." />

        {!apiKey && <Alert type="warning">Add your Groq API key in Settings.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          <TabBar tabs={TABS} active={activeTab} onChange={id => { setActiveTab(id); setResult(null); setText(''); }} />
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px', lineHeight: 1.5 }}>{HINTS[activeTab]}</p>
          <textarea rows={5} value={text} onChange={e => setText(e.target.value)} placeholder="Paste text here..." />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <Btn onClick={handleAnalyze} disabled={loading || !apiKey}>
              {loading ? <><Spinner color="#09080A" /> Analyzing...</> : '◉ Analyze'}
            </Btn>
            <Btn variant="secondary" onClick={() => setText(SAMPLES[activeTab])}>Load Sample</Btn>
            {text && <Btn variant="ghost" onClick={() => { setText(''); setResult(null); }}>Clear</Btn>}
          </div>
        </Card>

        {/* Claim verifier result */}
        {result?.mode === 'claim' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card accent={VERDICT_COLORS[result.verdict]}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '4px' }}>Verdict</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 500, color: VERDICT_COLORS[result.verdict], textTransform: 'capitalize', lineHeight: 1.1 }}>
                    {(result.verdict || '').replace(/_/g, ' ')}
                  </div>
                </div>
                <ConfidenceMeter value={result.confidence || 50} label="Confidence" />
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1rem' }}>{result.summary}</p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Ayurvedic basis: <strong>{result.ayurvedic_basis}</strong>
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Risk: <strong style={{ color: RISK_COLORS[result.risk] }}>{result.risk}</strong>
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Evidence grade: <strong style={{ color: EVIDENCE_COLORS[result.evidence_grade] }}>{result.evidence_grade}</strong>
                </span>
                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                  Scientific support: <strong>{result.scientific_support}</strong>
                </span>
              </div>

              {result.classical_ref && (
                <div style={{ padding: '8px 12px', background: 'rgba(201,160,90,0.06)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text3)', fontFamily: "'DM Mono',monospace" }}>
                  📚 {result.classical_ref}
                </div>
              )}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {(result.red_flags || []).length > 0 && (
                <Card style={{ marginBottom: 0, background: 'rgba(160,80,80,0.04)', borderColor: 'rgba(160,80,80,0.15)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#D4885A', marginBottom: '8px' }}>🚩 Red Flags</div>
                  {result.red_flags.map((f, i) => <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>• {f}</div>)}
                </Card>
              )}
              {(result.valid_aspects || []).length > 0 && (
                <Card style={{ marginBottom: 0, background: 'rgba(74,122,90,0.04)', borderColor: 'rgba(74,122,90,0.15)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: '8px' }}>✓ Valid Aspects</div>
                  {result.valid_aspects.map((a, i) => <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>• {a}</div>)}
                </Card>
              )}
            </div>

            {result.recommendation && (
              <Card style={{ background: 'rgba(201,160,90,0.04)' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px' }}>💡 Recommendation</div>
                <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>{result.recommendation}</p>
              </Card>
            )}
          </div>
        )}

        {/* Review / General NLP result */}
        {result && result.mode !== 'claim' && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <Card accent={SENTIMENT_COLORS[result.sentiment]}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '4px' }}>Sentiment</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.8rem', fontWeight: 500, color: SENTIMENT_COLORS[result.sentiment], textTransform: 'capitalize' }}>
                    {(result.sentiment || '').replace('_', ' ')}
                  </div>
                </div>
                <ConfidenceMeter value={result.score || 50} label="Score" />
              </div>

              {/* Bar */}
              <div style={{ height: '8px', borderRadius: '99px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border)', marginBottom: '6px' }}>
                <div style={{ width: `${result.pos || 0}%`, background: 'var(--sage2)', transition: 'width 0.8s ease' }} />
                <div style={{ width: `${result.neu || 0}%`, background: 'var(--gold)', transition: 'width 0.8s ease 0.1s' }} />
                <div style={{ width: `${result.neg || 0}%`, background: '#D4885A', transition: 'width 0.8s ease 0.2s' }} />
              </div>
              <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: 'var(--text3)', marginBottom: '1rem' }}>
                <span>🟢 Positive {result.pos || 0}%</span>
                <span>🟡 Neutral {result.neu || 0}%</span>
                <span>🔴 Negative {result.neg || 0}%</span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {result.intent && <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Intent: <strong style={{ textTransform: 'capitalize' }}>{result.intent}</strong></span>}
                {result.credibility && <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Credibility: <strong>{result.credibility}</strong></span>}
                {result.quality && <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Quality: <strong>{result.quality}</strong></span>}
                {result.authenticity && <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' }}>Authenticity: <strong>{result.authenticity}</strong></span>}
              </div>

              {result.summary && <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>{result.summary}</p>}
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {/* Positives (review mode) */}
              {result.mode === 'review' && (result.positives || []).length > 0 && (
                <Card style={{ marginBottom: 0, background: 'rgba(74,122,90,0.04)', borderColor: 'rgba(74,122,90,0.15)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: '8px' }}>✓ Positives</div>
                  {result.positives.map((p, i) => <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>• {p}</div>)}
                </Card>
              )}
              {result.mode === 'review' && (result.negatives || []).length > 0 && (
                <Card style={{ marginBottom: 0, background: 'rgba(160,80,80,0.04)', borderColor: 'rgba(160,80,80,0.15)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#D4885A', marginBottom: '8px' }}>✗ Negatives</div>
                  {result.negatives.map((n, i) => <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>• {n}</div>)}
                </Card>
              )}

              {/* Themes (general mode) */}
              {result.themes?.length > 0 && (
                <Card style={{ marginBottom: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Key Themes</div>
                  <div>{result.themes.map(t => <Badge key={t} color="gold">{t}</Badge>)}</div>
                  {result.dosha_focus?.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                      Dosha focus: {result.dosha_focus.map(d => <Badge key={d} color={d}>{d}</Badge>)}
                    </div>
                  )}
                </Card>
              )}
              {(result.tone || []).length > 0 && (
                <Card style={{ marginBottom: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Tone</div>
                  <div>{result.tone.map(t => <Badge key={t} color="muted" style={{ textTransform: 'capitalize' }}>{t}</Badge>)}</div>
                </Card>
              )}
            </div>

            {result.credibility_reason && (
              <Card>
                <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
                  Credibility assessment: <strong style={{ color: 'var(--text2)' }}>{result.credibility}</strong> — {result.credibility_reason}
                </p>
                {result.recommendation && <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px' }}>💡 {result.recommendation}</p>}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
