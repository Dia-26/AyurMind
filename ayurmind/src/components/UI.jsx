import { useState } from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '7px',
    borderRadius: '99px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const sizes = {
    sm: { padding: '5px 13px', fontSize: '12px' },
    md: { padding: '9px 20px', fontSize: '13px' },
    lg: { padding: '12px 28px', fontSize: '14px' },
  };
  const variants = {
    primary: { background: 'var(--gold)', color: '#09080A' },
    secondary: { background: 'var(--gold-dim)', color: 'var(--gold2)', border: '1px solid var(--border)' },
    ghost: { background: 'none', color: 'var(--text3)', border: '1px solid var(--border2)' },
    danger: { background: 'rgba(160,80,80,0.15)', color: '#D4885A', border: '1px solid rgba(160,80,80,0.25)' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') { e.target.style.background = 'var(--gold2)'; e.target.style.boxShadow = '0 4px 16px rgba(201,160,90,0.3)'; }
        else if (variant === 'secondary') { e.target.style.background = 'rgba(201,160,90,0.2)'; }
        else if (variant === 'ghost') { e.target.style.background = 'var(--gold-dim)'; e.target.style.color = 'var(--gold)'; e.target.style.borderColor = 'var(--gold)'; }
      }}
      onMouseLeave={e => {
        if (disabled) return;
        Object.assign(e.target.style, variants[variant]);
        if (variant === 'primary') e.target.style.boxShadow = 'none';
      }}
    >
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 14, color = 'currentColor' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid rgba(0,0,0,0.1)`, borderTopColor: color,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, className = '', accent = null, onClick }) {
  const accentStyle = accent ? { borderLeft: `2px solid ${accent}` } : {};
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r)', padding: '1.5rem', marginBottom: '1.25rem',
        cursor: onClick ? 'pointer' : undefined,
        ...accentStyle, ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gold', style = {} }) {
  const colors = {
    gold: { bg: 'rgba(201,160,90,0.12)', text: 'var(--gold2)', border: 'rgba(201,160,90,0.2)' },
    sage: { bg: 'rgba(74,122,90,0.12)', text: 'var(--sage2)', border: 'rgba(74,122,90,0.2)' },
    rose: { bg: 'rgba(160,80,80,0.12)', text: '#D4885A', border: 'rgba(160,80,80,0.2)' },
    vata: { bg: 'var(--vata-dim)', text: 'var(--vata)', border: 'rgba(123,143,187,0.2)' },
    pitta: { bg: 'var(--pitta-dim)', text: 'var(--pitta)', border: 'rgba(196,120,72,0.2)' },
    kapha: { bg: 'var(--kapha-dim)', text: 'var(--kapha)', border: 'rgba(74,122,90,0.2)' },
    muted: { bg: 'var(--bg3)', text: 'var(--text3)', border: 'var(--border)' },
  };
  const c = colors[color] || colors.gold;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 500, background: c.bg, color: c.text,
      border: `1px solid ${c.border}`, margin: '2px', ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function PageHeader({ label, title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
      {label && <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>{label}</div>}
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 400, color: 'var(--text)', marginBottom: '3px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: 300, lineHeight: 1.6 }}>{subtitle}</p>}
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────
export function Disclaimer({ text }) {
  return (
    <div style={{
      background: 'rgba(201,160,90,0.05)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: '11px',
      color: 'var(--text3)', marginBottom: '1.5rem', lineHeight: 1.6,
    }}>
      {text}
    </div>
  );
}

// ─── Dosha Bar ────────────────────────────────────────────────────────────────
export function DoshaBar({ label, value, type, delay = 0 }) {
  const colors = { vata: '#7B8FBB', pitta: '#C47848', kapha: '#4A7A5A' };
  const color = colors[type] || 'var(--gold)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <div style={{ fontSize: '12px', fontWeight: 500, width: '48px', letterSpacing: '0.5px', color: 'var(--text2)', textTransform: 'capitalize' }}>{label}</div>
      <div style={{ flex: 1, height: '8px', background: 'var(--bg3)', borderRadius: '99px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          background: `linear-gradient(90deg, ${color}, ${color}BB)`,
          width: `${value}%`,
          transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        }} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text3)', width: '30px', textAlign: 'right' }}>{value}%</div>
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────
export function Chip({ label, selected, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-block', padding: '5px 12px', borderRadius: '99px',
        border: selected ? '1px solid var(--gold)' : '1px solid var(--border)',
        color: selected ? '#09080A' : 'var(--text3)',
        background: selected ? 'var(--gold)' : 'none',
        fontSize: '12px', cursor: 'pointer', margin: '3px',
        transition: 'all 0.15s', fontWeight: selected ? 500 : 400,
      }}
    >
      {label}
    </span>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: '3px', background: 'var(--bg3)',
      borderRadius: '99px', padding: '4px', border: '1px solid var(--border)',
      marginBottom: '1.25rem',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1, textAlign: 'center', padding: '7px 10px',
            borderRadius: '99px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500,
            color: active === tab.id ? '#09080A' : 'var(--text3)',
            background: active === tab.id ? 'var(--gold)' : 'none',
            border: 'none', transition: 'all 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── RAG Source pill ──────────────────────────────────────────────────────────
export function RAGSource({ source }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
      background: 'rgba(201,160,90,0.1)', color: 'var(--gold2)',
      border: '1px solid rgba(201,160,90,0.2)', margin: '2px',
      fontFamily: "'DM Mono', monospace",
    }}>
      📚 {source}
    </span>
  );
}

// ─── Alert box ────────────────────────────────────────────────────────────────
export function Alert({ type = 'warning', children }) {
  const config = {
    warning: { bg: 'rgba(201,160,90,0.08)', border: 'rgba(201,160,90,0.25)', color: 'var(--gold2)', icon: '⚠️' },
    error: { bg: 'rgba(160,80,80,0.08)', border: 'rgba(160,80,80,0.25)', color: '#D4885A', icon: '❌' },
    info: { bg: 'rgba(123,143,187,0.08)', border: 'rgba(123,143,187,0.25)', color: 'var(--vata)', icon: 'ℹ️' },
    success: { bg: 'rgba(74,122,90,0.08)', border: 'rgba(74,122,90,0.25)', color: 'var(--sage2)', icon: '✓' },
  };
  const c = config[type];
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--r-sm)',
      padding: '10px 14px', fontSize: '13px', color: c.color, lineHeight: 1.6,
      display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '1rem',
    }}>
      <span>{c.icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text3)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text2)', marginBottom: '4px' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{subtitle}</div>}
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '6px 0' }}>
      {[0, 0.2, 0.4].map((delay, i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)',
          animation: `bounce 1.2s infinite ${delay}s`,
          display: 'inline-block',
        }} />
      ))}
    </div>
  );
}

// ─── Confidence meter ─────────────────────────────────────────────────────────
export function ConfidenceMeter({ value, label }) {
  const color = value >= 70 ? 'var(--sage2)' : value >= 40 ? 'var(--gold)' : '#D4885A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 22 * value / 100} ${2 * Math.PI * 22}`}
            strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color }}>
          {value}%
        </div>
      </div>
      {label && <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{label}</div>}
    </div>
  );
}
