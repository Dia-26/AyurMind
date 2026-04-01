import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiSentiment, apiFormula, apiSummarize } from '../utils/api';
import { Btn, Spinner, PageHeader, Card, Alert, Badge, Disclaimer } from '../components/UI';

const FORMULA_GOALS = [
  'Stress & anxiety relief', 'Deep sleep & relaxation', 'Digestive support & Agni',
  'Immunity & Ojas building', 'Anti-inflammatory', 'Liver cleanse & detox',
  'Female hormonal balance', 'Male vitality & vigor', 'Cognitive enhancement',
  'Weight management', 'Skin health & glow', 'Joint & bone support',
  'Respiratory health', 'Heart & circulation', 'Blood sugar support',
];

const DOSHA_OPTIONS = ['Vata excess', 'Pitta excess', 'Kapha excess', 'Tridoshic', 'Unknown'];
const CONSTITUTION_OPTIONS = ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic'];

const INGREDIENT_ROLE_COLORS = {
  chief: { bg: 'rgba(201,160,90,0.15)', text: 'var(--gold2)', label: 'Pradhana' },
  adjuvant: { bg: 'rgba(74,122,90,0.15)', text: 'var(--sage2)', label: 'Sahayaka' },
  vehicle: { bg: 'rgba(123,143,187,0.15)', text: 'var(--vata)', label: 'Anupana' },
  corrective: { bg: 'rgba(160,82,45,0.15)', text: '#D4885A', label: 'Prakshepa' },
};

export default function FormulaPage() {
  const { apiKey } = useApp();
  const [goals, setGoals] = useState([]);
  const [imbalance, setImbalance] = useState('');
  const [constitution, setConstitution] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const toggleGoal = (g) => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g].slice(0, 4));

  const handleBuild = async () => {
    if (!goals.length) { setError('Please select at least one therapeutic goal.'); return; }
    if (!apiKey) { setError('Please add your Groq API key in Settings.'); return; }
    setError('');
    setLoading(true);
    setResult(null);

    const prompt = `Design an Ayurvedic herbal formula for:\nGoals: ${goals.join(', ')}\n${imbalance ? `Dosha imbalance: ${imbalance}` : ''}\n${constitution ? `Constitution: ${constitution}` : ''}\n${additionalNotes ? `Additional notes: ${additionalNotes}` : ''}`;

    try {
      const data = await groqJSON([
        { role: 'system', content: SYSTEM_PROMPTS.formulaBuilder },
        { role: 'user', content: prompt },
      ], { apiKey, maxTokens: 1000 });
      setResult(data);
    } catch (e) {
      setError('Formula generation failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: '56px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader
          label="Bhaisajya Kalpana"
          title="Herbal Formula Builder"
          subtitle="AI-designed classical Ayurvedic formulations based on Pradhana-Sahayaka-Prakshepa principles"
        />
        <Disclaimer text="⚕️ Herbal formulas are for educational reference only. Always consult a qualified Vaidya before preparing or consuming any Ayurvedic formula." />

        {!apiKey && <Alert type="warning">Add your Groq API key in Settings to enable formula generation.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          {/* Therapeutic goals */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: '8px' }}>
              Therapeutic Goals (select up to 4) — {goals.length}/4
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {FORMULA_GOALS.map(g => (
                <span key={g} onClick={() => toggleGoal(g)} style={{
                  display: 'inline-block', padding: '5px 12px', borderRadius: '99px',
                  border: goals.includes(g) ? '1px solid var(--gold)' : '1px solid var(--border)',
                  color: goals.includes(g) ? '#09080A' : 'var(--text3)',
                  background: goals.includes(g) ? 'var(--gold)' : 'none',
                  fontSize: '12px', cursor: 'pointer', margin: '2px',
                  transition: 'all 0.15s', fontWeight: goals.includes(g) ? 500 : 400,
                  opacity: !goals.includes(g) && goals.length >= 4 ? 0.4 : 1,
                }}>{g}</span>
              ))}
            </div>
          </div>

          {/* Dosha & Constitution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Current Imbalance</label>
              <select value={imbalance} onChange={e => setImbalance(e.target.value)} style={{ width: '100%' }}>
                <option value="">Select (optional)</option>
                {DOSHA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Constitution (Prakriti)</label>
              <select value={constitution} onChange={e => setConstitution(e.target.value)} style={{ width: '100%' }}>
                <option value="">Select (optional)</option>
                {CONSTITUTION_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Additional notes */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>Additional Notes (optional)</label>
            <textarea rows={2} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="e.g. Prefer easily available herbs, avoid dairy-based preparations, need powder form..." />
          </div>

          <Btn onClick={handleBuild} disabled={loading || !apiKey || !goals.length} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {loading ? <><Spinner color="#09080A" /> Building formula...</> : '⊞ Design Formula'}
          </Btn>
        </Card>

        {/* Result */}
        {result && (
          <div style={{ animation: 'fadeUp 0.5s ease both' }}>
            {/* Formula header */}
            <Card accent="var(--gold)">
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.7rem', fontWeight: 500, color: 'var(--gold)', marginBottom: '4px' }}>
                {result.formula_name}
              </div>
              {result.classical_basis && (
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '1rem', fontFamily: "'DM Mono',monospace" }}>
                  📚 {result.classical_basis}
                </div>
              )}
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7 }}>{result.expected_effects}</p>
            </Card>

            {/* Ingredients */}
            <Card>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1rem' }}>
                Formula Ingredients
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(result.ingredients || []).map((ing, i) => {
                  const roleStyle = INGREDIENT_ROLE_COLORS[ing.role] || INGREDIENT_ROLE_COLORS.adjuvant;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                      {/* Ratio indicator */}
                      <div style={{ textAlign: 'center', minWidth: '36px', flexShrink: 0 }}>
                        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '14px', fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>{ing.ratio}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text4)', marginTop: '1px' }}>parts</div>
                      </div>
                      {/* Divider */}
                      <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch', flexShrink: 0 }} />
                      {/* Herb info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{ing.herb}</span>
                          {ing.sanskrit && <span style={{ fontSize: '11px', color: 'var(--text3)', fontStyle: 'italic' }}>{ing.sanskrit}</span>}
                          <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '3px', background: roleStyle.bg, color: roleStyle.text, fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>
                            {roleStyle.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{ing.reason}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                {Object.entries(INGREDIENT_ROLE_COLORS).map(([role, style]) => (
                  <span key={role} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: style.bg, color: style.text, fontWeight: 500 }}>
                    {style.label} ({role})
                  </span>
                ))}
              </div>
            </Card>

            {/* Preparation & Dosage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>Preparation Method</div>
                <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{result.preparation}</p>
                {result.dosage && (
                  <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', display: 'block', marginBottom: '2px' }}>DOSAGE</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Mono',monospace" }}>{result.dosage}</span>
                  </div>
                )}
                {result.anupana && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                    Anupana (vehicle): <strong style={{ color: 'var(--text2)' }}>{result.anupana}</strong>
                  </div>
                )}
              </Card>

              <Card style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--sage2)', marginBottom: '10px' }}>Indications</div>
                {(result.indications || []).map((ind, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '5px' }}>✓ {ind}</div>
                ))}
                {(result.contraindications || []).length > 0 && (
                  <>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#D4885A', marginTop: '1rem', marginBottom: '8px' }}>Contraindications</div>
                    {result.contraindications.map((c, i) => (
                      <div key={i} style={{ fontSize: '13px', color: '#D4885A', marginBottom: '4px', opacity: 0.85 }}>✗ {c}</div>
                    ))}
                  </>
                )}
              </Card>
            </div>

            {result.safety_note && (
              <div style={{ padding: '10px 14px', background: 'rgba(201,160,90,0.06)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '12px', color: 'var(--text3)', lineHeight: 1.6 }}>
                ⚕️ {result.safety_note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
