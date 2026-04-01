import { useState } from 'react';
import { useApp } from '../hooks/useApp';

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',       icon: '✦' },
  { id: 'chat',       label: 'Chat',        icon: '◎' },
  { id: 'prakriti',   label: 'Prakriti',    icon: '◈' },
  { id: 'symptoms',   label: 'Symptoms',    icon: '⊕' },
  { id: 'ner',        label: 'NER',         icon: '⟐' },
  { id: 'herbs',      label: 'Herbs',       icon: '⊛' },
  { id: 'sentiment',  label: 'Sentiment',   icon: '◉' },
  { id: 'formula',    label: 'Formula',     icon: '⊞' },
  { id: 'summarizer', label: 'Summarizer',  icon: '⊟' },
];

export default function Nav() {
  const { currentPage, setCurrentPage, apiKey, backendOnline } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const backendColor  = backendOnline === null  ? 'var(--text3)'
                      : backendOnline           ? 'var(--sage2)'
                      :                           'var(--gold)';
  const backendBg     = backendOnline === null  ? 'rgba(120,100,80,0.15)'
                      : backendOnline           ? 'rgba(74,122,90,0.15)'
                      :                           'rgba(201,160,90,0.15)';
  const backendBorder = backendOnline === null  ? 'rgba(120,100,80,0.3)'
                      : backendOnline           ? 'rgba(74,122,90,0.3)'
                      :                           'rgba(201,160,90,0.3)';
  const backendLabel  = backendOnline === null  ? 'Checking…'
                      : backendOnline           ? 'Backend ✓'
                      :                           'Direct';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: '56px', display: 'flex', alignItems: 'center',
      padding: '0 1.25rem', justifyContent: 'space-between',
      background: 'rgba(9,8,10,0.92)', backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Logo */}
      <div onClick={() => setCurrentPage('home')} style={{
        fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: 600,
        color: 'var(--gold)', cursor: 'pointer', display: 'flex', alignItems: 'center',
        gap: '8px', letterSpacing: '.5px', userSelect: 'none',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)', display: 'inline-block' }} />
        AyurMind
        <span style={{ fontSize: '9px', background: 'rgba(201,160,90,0.15)', color: 'var(--gold2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 5px', fontFamily: "'DM Mono',monospace", fontWeight: 400, verticalAlign: 'middle' }}>v2.0</span>
      </div>

      {/* Desktop nav */}
      <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }} className="desktop-nav">
        {NAV_ITEMS.map(item => (
          <NavBtn key={item.id} item={item} active={currentPage === item.id} onClick={() => setCurrentPage(item.id)} />
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Backend status */}
        <div title={backendOnline ? 'Python NLP backend connected' : 'Using direct Groq API'} style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px',
          borderRadius: '99px', fontSize: '10px', background: backendBg,
          color: backendColor, border: `1px solid ${backendBorder}`,
          fontFamily: "'DM Mono',monospace", fontWeight: 500,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {backendLabel}
        </div>

        {/* API key status */}
        <div onClick={() => setCurrentPage('settings')} style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px',
          borderRadius: '99px', fontSize: '10px', cursor: 'pointer', fontWeight: 500,
          background: apiKey ? 'rgba(74,122,90,0.15)' : 'rgba(160,80,80,0.15)',
          color: apiKey ? 'var(--sage2)' : '#D4885A',
          border: `1px solid ${apiKey ? 'rgba(74,122,90,0.3)' : 'rgba(160,80,80,0.3)'}`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {apiKey ? 'API ✓' : 'No Key'}
        </div>

        {/* Settings */}
        <button onClick={() => setCurrentPage('settings')} style={{
          background: currentPage === 'settings' ? 'var(--gold-glow)' : 'none',
          border: `1px solid ${currentPage === 'settings' ? 'var(--border)' : 'transparent'}`,
          color: currentPage === 'settings' ? 'var(--gold)' : 'var(--text3)',
          borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s',
        }}>⚙</button>

        {/* Mobile menu */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: 'none', background: 'none', border: '1px solid var(--border)',
          color: 'var(--text2)', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', fontSize: '14px',
        }} className="mobile-menu-btn">☰</button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '56px', left: 0, right: 0,
          background: 'rgba(9,8,10,0.97)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)', padding: '0.75rem',
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px', zIndex: 199,
        }}>
          {[...NAV_ITEMS, { id: 'settings', label: 'Settings', icon: '⚙' }].map(item => (
            <button key={item.id} onClick={() => { setCurrentPage(item.id); setMenuOpen(false); }} style={{
              background: currentPage === item.id ? 'var(--gold-glow)' : 'none',
              border: `1px solid ${currentPage === item.id ? 'var(--border2)' : 'transparent'}`,
              color: currentPage === item.id ? 'var(--gold)' : 'var(--text3)',
              borderRadius: '8px', padding: '8px 6px', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '11px' }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: block !important; } }
      `}</style>
    </nav>
  );
}

function NavBtn({ item, active, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: active ? 'var(--gold-glow)' : hover ? 'var(--gold-dim)' : 'none',
      border: active ? '1px solid var(--border)' : '1px solid transparent',
      color: active || hover ? 'var(--gold)' : 'var(--text3)',
      borderRadius: '7px', padding: '5px 10px', cursor: 'pointer',
      fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 500,
      letterSpacing: '.3px', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: '5px',
    }}>
      <span style={{ fontSize: '10px', opacity: 0.7 }}>{item.icon}</span>{item.label}
    </button>
  );
}
