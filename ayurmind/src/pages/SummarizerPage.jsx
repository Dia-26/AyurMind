import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiSummarize } from '../utils/api';
import { Btn, Spinner, PageHeader, Card, Alert, Badge, Disclaimer } from '../components/UI';

const SAMPLE_TEXTS = [
  {
    label: 'Charaka on Agni',
    text: `According to Charaka Samhita, the digestive fire (Agni) is considered the most important factor for health and disease. When Agni is functioning properly (Sama Agni), the digestion of food occurs naturally, leading to proper formation of all seven dhatus (tissues). The four types of Agni described are: Sama (balanced), Vishama (irregular, Vata-type), Tikshna (sharp, Pitta-type), and Manda (slow, Kapha-type). Impairment of Agni leads to the formation of Ama (undigested metabolic waste), which is considered the root cause of most diseases. Herbs that kindle Agni (Deepaniya) and those that digest Ama (Pachaniya) form the foundation of most Ayurvedic treatment protocols.`,
  },
  {
    label: 'Modern Ashwagandha Research',
    text: `Recent clinical trials have investigated the adaptogenic properties of Withania somnifera (Ashwagandha) in stress reduction. A 2019 double-blind placebo-controlled study found that ashwagandha root extract significantly reduced cortisol levels and improved stress resilience in adults. The active constituents, withanolides, appear to modulate the HPA axis. In Ayurvedic tradition, Ashwagandha is classified as a Balya (strength-promoting) and Rasayana (rejuvenating) herb. It is used to address conditions associated with Vata imbalance including anxiety, poor sleep, muscle wasting, and sexual debility. The standard classical preparation involves boiling the root in milk (Ksheerapaka) to enhance absorption of fat-soluble withanolides.`,
  },
  {
    label: 'Pseudoscientific Claim',
    text: `Miracle Ayurveda Detox Tea: Our special blend of exotic herbs from the Himalayas activates your body's natural ability to flush out 20 years of accumulated toxins in just 7 days! Ancient Ayurvedic masters discovered this secret formula thousands of years ago but it was suppressed by Western medicine. Customers report losing up to 30 pounds in one week, reversing diabetes, and curing cancer naturally. Our proprietary nano-herb technology makes this 100 times more potent than regular herbs. No diet or exercise needed - just drink 3 cups daily!`,
  },
];

const TEXT_TYPE_COLORS = {
  classical_commentary: 'var(--gold)',
  modern_synthesis: 'var(--vata)',
  research: 'var(--sage2)',
  popular: 'var(--text3)',
  prescriptive: 'var(--pitta)',
};

export default function SummarizerPage() {
  const { apiKey } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 50) {
      setError('Please enter at least 50 characters of text to summarize.');
      return;
    }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await apiSummarize({ text, apiKey });
      const normalized = {
        ...data,
        summary: data.summary || data.extractive_summary || 'No summary was generated.',
        authenticity_score: typeof data.authenticity_score === 'number'
          ? data.authenticity_score
          : (typeof data.nlp_authenticity === 'number' ? data.nlp_authenticity : 0),
      };
      setResult(normalized);
    } catch (e) {
      setError('Summarization failed: ' + e.message);
    }
    setLoading(false);
  };

  const authScore = result?.authenticity_score || 0;
  const authColor = authScore >= 70 ? 'var(--sage2)' : authScore >= 40 ? 'var(--gold)' : '#D4885A';

  return (
    <div style={{ paddingTop: '56px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader
          label="NLP — Text Analysis & Summarization"
          title="Ayurvedic Text Summarizer"
          subtitle="Extract key insights, classical references, concepts, and actionable guidance from any Ayurvedic text"
        />

        {!apiKey && <Alert type="warning">Add your Groq API key in Settings to enable summarization.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--text3)', alignSelf: 'center', marginRight: '4px' }}>Load sample:</span>
            {SAMPLE_TEXTS.map(s => (
              <button key={s.label} onClick={() => setText(s.text)} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '99px',
                color: 'var(--text3)', fontFamily: "'DM Sans',sans-serif", fontSize: '11px',
                padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)'; }}
              >{s.label}</button>
            ))}
          </div>
          <textarea
            rows={8}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste any Ayurvedic text here — classical commentary, modern article, research abstract, product description, or patient education material..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text4)' }}>{text.length} characters</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {text && <Btn variant="ghost" size="sm" onClick={() => { setText(''); setResult(null); }}>Clear</Btn>}
              <Btn onClick={handleAnalyze} disabled={loading || !apiKey || text.length < 50}>
                {loading ? <><Spinner color="#09080A" /> Analyzing...</> : '⊟ Summarize & Analyze'}
              </Btn>
            </div>
          </div>
        </Card>

        {result && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            {/* Overview */}
            <Card accent="var(--gold)">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {result.title && (
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 500, color: 'var(--gold)', marginBottom: '4px' }}>
                      {result.title}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {result.text_type && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg3)', color: TEXT_TYPE_COLORS[result.text_type] || 'var(--text3)', border: '1px solid var(--border)', fontFamily: "'DM Mono',monospace" }}>
                        {result.text_type.replace(/_/g, ' ')}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Authenticity:</span>
                      <div style={{ width: '80px', height: '6px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <div style={{ width: `${authScore}%`, height: '100%', background: authColor, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: authColor, fontFamily: "'DM Mono',monospace" }}>{authScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.75 }}>{result.summary}</p>
            </Card>

            {/* Concepts & Dosha */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>Main Concepts</div>
                <div>{(result.main_concepts || []).map(c => <Badge key={c} color="gold">{c}</Badge>)}</div>

                {result.key_herbs?.length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sage2)', marginTop: '12px', marginBottom: '8px' }}>Herbs Mentioned</div>
                    <div>{result.key_herbs.map(h => <Badge key={h} color="sage">{h}</Badge>)}</div>
                  </>
                )}
                {result.key_treatments?.length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--vata)', marginTop: '12px', marginBottom: '8px' }}>Treatments</div>
                    <div>{result.key_treatments.map(t => <Badge key={t} color="vata">{t}</Badge>)}</div>
                  </>
                )}
              </Card>

              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Dosha Context</div>
                {result.dosha_context && Object.entries(result.dosha_context).map(([dosha, relevance]) => {
                  const colors = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)' };
                  return (
                    <div key={dosha} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: colors[dosha], width: '40px', flexShrink: 0, textTransform: 'capitalize' }}>{dosha}</span>
                      <span style={{ fontSize: '12px', color: relevance !== 'not mentioned' ? 'var(--text2)' : 'var(--text4)', lineHeight: 1.5, flex: 1 }}>{relevance}</span>
                    </div>
                  );
                })}

                {result.classical_refs?.length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginTop: '12px', marginBottom: '8px' }}>Classical References</div>
                    {result.classical_refs.map(r => (
                      <div key={r} style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px', fontFamily: "'DM Mono',monospace" }}>📚 {r}</div>
                    ))}
                  </>
                )}
              </Card>
            </div>

            {/* Actionable insights */}
            {(result.actionable_insights || []).length > 0 && (
              <Card style={{ background: 'rgba(201,160,90,0.04)', borderColor: 'var(--border2)' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>
                  💡 Actionable Insights
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.actionable_insights.map((ins, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--gold)', fontSize: '12px', flexShrink: 0, fontWeight: 600 }}>{i + 1}.</span>
                      <span style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.6 }}>{ins}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Related topics */}
            {(result.related_topics || []).length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--text3)', marginRight: '8px' }}>Related topics:</span>
                {result.related_topics.map(t => <Badge key={t} color="muted">{t}</Badge>)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
