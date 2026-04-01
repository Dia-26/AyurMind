import { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { apiHerbs } from '../utils/api';
import { groqJSON } from '../utils/api';
import { Btn, Spinner, PageHeader, Card, Alert, Badge } from '../components/UI';
import { HERB_QUICK_SEARCHES } from '../data/constants';
import { herbDetailPrompt } from '../utils/prompts';

const DC = { vata: 'var(--vata)', pitta: 'var(--pitta)', kapha: 'var(--kapha)' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

export default function HerbsPage() {
  const { apiKey, backendOnline } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [herbDetail, setHerbDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const doSearch = async (q) => {
    const sq = q || query;
    if (!sq.trim() || !apiKey) return;
    setError(''); setLoading(true); setResult(null); setSelectedHerb(null);
    try { const data = await apiHerbs({ query: sq, apiKey }); setResult(data); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  const loadDetail = async (herb) => {
    if (!apiKey) return;
    setSelectedHerb(herb); setHerbDetail(null); setLoadingDetail(true);
    try {
      const data = await groqJSON([
        { role: 'system', content: herbDetailPrompt },
        { role: 'user', content: `Detailed Ayurvedic info about ${herb.name} (${herb.latin || herb.sanskrit || ''})` },
      ], { apiKey, maxTokens: 700 });
      setHerbDetail(data);
    } catch (e) { setHerbDetail({ error: e.message }); }
    setLoadingDetail(false);
  };

  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <PageHeader label="Dravyaguna Shastra — RAG Search" title="Herb Semantic Search" subtitle="Ask naturally — retrieves authentic Ayurvedic botanicals with Rasa-Virya-Vipaka properties" />
        {backendOnline && <Alert type="info">🐍 TF-IDF retrieval + NER entity extraction running on Python backend.</Alert>}
        {!apiKey && <Alert type="warning">Add your Groq API key in Settings.</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <Card>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder="e.g. herb for anxiety and insomnia, cooling herb for Pitta, Rasayana for immunity..." />
            <Btn onClick={() => doSearch()} disabled={loading || !apiKey} style={{ flexShrink: 0 }}>{loading ? <Spinner color="#09080A" /> : '⊛ Search'}</Btn>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {HERB_QUICK_SEARCHES.map(s => (
              <button key={s.label} onClick={() => { setQuery(s.q); doSearch(s.q); }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text3)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: '4px 10px', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; e.target.style.background = 'var(--gold-dim)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)'; e.target.style.background = 'none'; }}>
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}><Spinner size={24} color="var(--gold)" /><div style={{ marginTop: 10, fontSize: 13 }}>Searching Dravyaguna knowledge base...</div></div>}

        {result && (
          <div style={{ animation: 'fadeUp .4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
              <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6, flex: 1 }}>{result.search_summary}</p>
              {result.rag_sources?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {result.rag_sources.map((s, i) => <span key={i} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: 'rgba(201,160,90,.1)', color: 'var(--gold2)', border: '1px solid rgba(201,160,90,.2)', fontFamily: "'DM Mono',monospace" }}>📚 {s}</span>)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedHerb ? '1fr 1fr' : '1fr', gap: '1rem' }}>
              {/* Herb list */}
              <div>
                {(result.herbs || []).map((herb, i) => (
                  <div key={i} onClick={() => loadDetail(herb)}
                    style={{ background: selectedHerb?.name === herb.name ? 'var(--card2)' : 'var(--card)', border: `1px solid ${selectedHerb?.name === herb.name ? 'var(--border2)' : 'var(--border)'}`, borderLeft: selectedHerb?.name === herb.name ? '2px solid var(--gold)' : undefined, borderRadius: 'var(--r-sm)', padding: '1.25rem', cursor: 'pointer', transition: 'all .2s', marginBottom: '.75rem' }}
                    onMouseEnter={e => { if (selectedHerb?.name !== herb.name) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { if (selectedHerb?.name !== herb.name) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 1 }}>{herb.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginBottom: 6 }}>{herb.latin || herb.sanskrit || ''}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 8 }}>{herb.primary_use}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                          {(herb.balances || []).map(d => <span key={d} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${DC[d]}22`, color: DC[d], fontWeight: 500 }}>↓{cap(d)}</span>)}
                          {(herb.aggravates || []).map(d => <span key={d} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(160,80,80,.12)', color: '#D4885A', fontWeight: 500 }}>↑{cap(d)}</span>)}
                        </div>
                        {herb.rasa?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>{herb.rasa.map(r => <span key={r} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)', fontFamily: "'DM Mono',monospace" }}>{r}</span>)}</div>}
                      </div>
                      {herb.availability && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--text3)', border: '1px solid var(--border)', fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{herb.availability}</span>}
                    </div>
                    {herb.cautions && <div style={{ marginTop: 8, fontSize: 11, color: '#D4885A', padding: '4px 8px', background: 'rgba(212,136,90,.1)', borderRadius: 5 }}>⚠ {herb.cautions}</div>}
                  </div>
                ))}
              </div>

              {/* Detail panel */}
              {selectedHerb && (
                <div>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 500, color: 'var(--gold)' }}>{selectedHerb.name}</div>
                      <button onClick={() => { setSelectedHerb(null); setHerbDetail(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 18, cursor: 'pointer' }}>×</button>
                    </div>
                    {loadingDetail ? <div style={{ textAlign: 'center', padding: '2rem' }}><Spinner size={20} color="var(--gold)" /></div>
                    : herbDetail?.error ? <Alert type="error">{herbDetail.error}</Alert>
                    : herbDetail ? (
                      <div>
                        {herbDetail.classical_reference && <><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 5 }}>Classical Reference</div><div style={{ fontSize: 12, color: 'var(--text2)', padding: '8px 10px', background: 'var(--bg3)', borderRadius: 6, marginBottom: '1rem', lineHeight: 1.6 }}>{herbDetail.classical_reference}</div></>}
                        {herbDetail.shloka && <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', padding: '6px 10px', borderLeft: '2px solid var(--gold)', marginBottom: '1rem', lineHeight: 1.6 }}>{herbDetail.shloka}</div>}
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Key Uses</div>
                        {(herbDetail.detailed_uses || []).map((u, i) => <div key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>• {u}</div>)}
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', margin: '1rem 0 6px' }}>Preparation</div>
                        <div>{(herbDetail.preparation || []).map(p => <Badge key={p} color="gold">{p}</Badge>)}</div>
                        {herbDetail.best_time && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Best time: <strong style={{ color: 'var(--text2)' }}>{herbDetail.best_time}</strong></div>}
                        {herbDetail.anupana && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Anupana: <strong style={{ color: 'var(--text2)' }}>{herbDetail.anupana}</strong></div>}
                        {herbDetail.pairs_with?.length > 0 && <><div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gold)', margin: '1rem 0 6px' }}>Pairs Well With</div><div>{herbDetail.pairs_with.map(h => <Badge key={h} color="sage">{h}</Badge>)}</div></>}
                        {herbDetail.contraindications?.length > 0 && <div style={{ marginTop: '1rem', padding: 10, background: 'rgba(212,136,90,.08)', borderRadius: 6, border: '1px solid rgba(212,136,90,.2)' }}><div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#D4885A', marginBottom: 6 }}>Contraindications</div>{herbDetail.contraindications.map(c => <div key={c} style={{ fontSize: 12, color: '#D4885A' }}>• {c}</div>)}</div>}
                        {herbDetail.modern_research && <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', lineHeight: 1.6 }}>🔬 {herbDetail.modern_research}</div>}
                      </div>
                    ) : null}
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
