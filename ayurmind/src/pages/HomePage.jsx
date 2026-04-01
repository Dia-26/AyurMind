import { useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';

const FEATURES = [
  { id: 'chat', icon: '◎', title: 'RAG-Powered Chat', desc: 'Conversational AI with retrieval from classical Ayurvedic texts — Charaka, Sushruta & Ashtanga Hridayam', tag: 'RAG + LLM' },
  { id: 'prakriti', icon: '◈', title: 'Prakriti Analysis', desc: 'NLP-based constitution assessment using Ashta-vidha Pariksha methodology — Vata, Pitta, Kapha profiling', tag: 'NLP' },
  { id: 'symptoms', icon: '⊕', title: 'Symptom Analyzer', desc: 'Multi-label dosha imbalance detection with Nidana Panchaka diagnostic framework and herbal recommendations', tag: 'ML Classification' },
  { id: 'ner', icon: '⟐', title: 'NER Visualizer', desc: 'Named Entity Recognition for Ayurvedic texts — extract herbs, doshas, treatments, symptoms, and foods with confidence scoring', tag: 'NLP / NER' },
  { id: 'herbs', icon: '⊛', title: 'Herb Semantic Search', desc: 'Semantic search over Dravyaguna knowledge base with RAG-powered Rasa-Virya-Vipaka property lookup', tag: 'RAG / Search' },
  { id: 'sentiment', icon: '◉', title: 'Sentiment & Intent NLP', desc: 'Multi-dimensional analysis: sentiment, intent detection, claim verification, and pseudoscience detection', tag: 'NLP / Classification' },
  { id: 'formula', icon: '⊞', title: 'Formula Builder', desc: 'AI-designed herbal formulations based on classical Bhaisajya Kalpana principles with Anupana selection', tag: 'Generative AI' },
  { id: 'summarizer', icon: '⊟', title: 'Text Summarizer', desc: 'Extract key insights, classical references, and actionable guidance from Ayurvedic texts using NLP', tag: 'NLP / Summarization' },
];

const STATS = [
  { n: '5,000+', label: 'Herb Profiles' },
  { n: '3', label: 'Classical Texts' },
  { n: '8', label: 'NLP Modules' },
  { n: 'RAG', label: 'Knowledge Retrieval' },
];

const DOSHAS = [
  { name: 'Vata', elem: 'Air · Ether', emoji: '🌬', color: 'var(--vata)', traits: ['Movement', 'Creativity', 'Speed', 'Dryness'], desc: 'Governs all movement in body and mind — nerve impulses, circulation, respiration, and elimination.' },
  { name: 'Pitta', elem: 'Fire · Water', emoji: '🔥', color: 'var(--pitta)', traits: ['Transformation', 'Intelligence', 'Heat', 'Intensity'], desc: 'Controls digestion, metabolism, body temperature, and the capacity for discrimination and understanding.' },
  { name: 'Kapha', elem: 'Earth · Water', emoji: '🌿', color: 'var(--kapha)', traits: ['Structure', 'Stability', 'Nourishment', 'Lubrication'], desc: 'Provides the body\'s mass, strength, immune resistance, and the emotional qualities of love and patience.' },
];

export default function HomePage() {
  const { setCurrentPage } = useApp();
  const particlesRef = useRef(null);

  useEffect(() => {
    if (!particlesRef.current) return;
    const container = particlesRef.current;
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      const s = Math.random() * 3 + 1;
      p.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${s}px; height:${s}px; left:${Math.random() * 100}%;
        background:rgba(201,160,90,${Math.random() * 0.2 + 0.04});
        animation: pfloat ${Math.random() * 18 + 12}s linear ${Math.random() * 12}s infinite;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', position: 'relative' }}>
      <style>{`
        @keyframes pfloat {
          0% { transform: translateY(100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        @keyframes hglow { 0%,100% { opacity:.6; transform:translate(-50%,-50%) scale(1); } 50% { opacity:.9; transform:translate(-50%,-50%) scale(1.1); } }
        @keyframes rspin { to { transform:translate(-50%,-50%) rotate(360deg); } }
        @keyframes gspin { to { transform:rotate(360deg); } }
      `}</style>

      {/* Particles */}
      <div ref={particlesRef} style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', overflow: 'hidden', zIndex: 1 }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(201,160,90,0.07) 0%, transparent 65%)', pointerEvents: 'none', animation: 'hglow 5s ease-in-out infinite' }} />
        {/* Rings */}
        {[300, 480, 620].map((size, i) => (
          <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: `${size}px`, height: `${size}px`, border: `1px solid rgba(201,160,90,${0.06 - i * 0.015})`, borderRadius: '50%', animation: `rspin ${35 + i * 15}s linear infinite`, animationDirection: i % 2 ? 'reverse' : 'normal' }} />
        ))}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,160,90,0.12)', border: '1px solid var(--border2)', borderRadius: '99px', padding: '5px 16px', fontSize: '10px', fontWeight: 600, color: 'var(--gold2)', letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            ✦ Ayurvedic Intelligence Platform v2.0
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 300, lineHeight: 1.05, marginBottom: '0.75rem' }}>
            Ancient <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Wisdom</em>
            <br />Modern <em style={{ color: 'var(--gold2)', fontStyle: 'italic' }}>Intelligence</em>
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text3)', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.8, fontWeight: 300 }}>
            A RAG-powered NLP platform for Ayurvedic medicine — combining classical texts from Charaka Samhita, Sushruta Samhita and Ashtanga Hridayam with modern AI
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage('chat')} style={{ background: 'var(--gold)', color: '#09080A', border: 'none', padding: '12px 32px', borderRadius: '99px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px' }}
              onMouseEnter={e => { e.target.style.background = 'var(--gold2)'; e.target.style.boxShadow = '0 8px 24px rgba(201,160,90,0.3)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background = 'var(--gold)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'none'; }}
            >
              ◎ Start Consultation
            </button>
            <button onClick={() => setCurrentPage('prakriti')} style={{ background: 'none', color: 'var(--text2)', border: '1px solid var(--border2)', padding: '12px 28px', borderRadius: '99px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--gold-dim)'; e.target.style.color = 'var(--gold)'; e.target.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'var(--border2)'; }}
            >
              ◈ Know Your Prakriti
            </button>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', color: 'var(--text4)', letterSpacing: '2px', textTransform: 'uppercase' }}>Explore</span>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, var(--gold), transparent)', animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem 3rem', position: 'relative', zIndex: 1 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>{s.n}</div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px', fontWeight: 300 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Doshas */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem 4rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>The Three Doshas</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, marginBottom: '0.25rem' }}>Tridosha Theory</h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '1.5rem', fontWeight: 300 }}>The fundamental biological humors governing all physiology and psychology</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
          {DOSHAS.map(d => (
            <div key={d.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.75rem', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
              onClick={() => setCurrentPage('chat')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: `${d.color}22`, border: `1px solid ${d.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '1rem' }}>{d.emoji}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 500, color: d.color, marginBottom: '2px' }}>{d.name}</div>
              <div style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, color: d.color, opacity: 0.7, marginBottom: '0.75rem' }}>{d.elem}</div>
              <p style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.7, fontWeight: 300, marginBottom: '0.75rem' }}>{d.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {d.traits.map(t => (
                  <span key={t} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: `${d.color}18`, color: d.color, fontWeight: 500, border: `1px solid ${d.color}33` }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 1.5rem 5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>NLP & AI Modules</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, marginBottom: '0.25rem' }}>Platform Capabilities</h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '1.75rem', fontWeight: 300 }}>Eight specialized AI modules built on RAG architecture and Ayurvedic knowledge</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.05}s` }}
              className="fade-up"
              onClick={() => setCurrentPage(f.id)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'var(--bg-card2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0, transition: 'opacity 0.3s' }} className="feat-line" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '9px', background: 'var(--gold-glow)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'var(--gold)' }}>{f.icon}</div>
                <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(201,160,90,0.1)', color: 'var(--gold2)', border: '1px solid var(--border)', fontFamily: "'DM Mono', monospace" }}>{f.tag}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '5px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text4)', fontSize: '14px', transition: 'all 0.2s' }}>↗</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem 6rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border2)', borderRadius: 'var(--r-lg)', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(201,160,90,0.05), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 300, marginBottom: '0.75rem', position: 'relative' }}>
            Ready to Begin Your <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Journey?</em>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '1.75rem', lineHeight: 1.7 }}>
            Add your Groq API key in Settings to unlock all AI features. Free to use.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentPage('settings')} style={{ background: 'var(--gold)', color: '#09080A', border: 'none', padding: '11px 28px', borderRadius: '99px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = 'var(--gold2)'; }}
              onMouseLeave={e => { e.target.style.background = 'var(--gold)'; }}
            >⚙ Add API Key</button>
            <button onClick={() => setCurrentPage('prakriti')} style={{ background: 'none', color: 'var(--text2)', border: '1px solid var(--border2)', padding: '11px 26px', borderRadius: '99px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text2)'; }}
            >Explore Features</button>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .home-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
