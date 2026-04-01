import { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { apiChat, formatMarkdown } from '../utils/api';
import { Btn, Spinner, Alert, TypingDots } from '../components/UI';
import { CHAT_SUGGESTIONS } from '../data/constants';

export default function ChatPage() {
  const { apiKey, chatHistory, setChatHistory, ragEnabled, backendOnline } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chatHistory, loading]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !apiKey) return;
    setInput(''); setError('');
    const userMsg = { role: 'user', content: msg };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const result = await apiChat({
        query: msg,
        history: chatHistory.slice(-10),
        apiKey,
        ragEnabled,
      });
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        ragChunks: result.rag_chunks || [],
        nlpMethod: result.nlp_method,
      }]);
    } catch (e) {
      setError(e.message);
      setChatHistory(prev => [...prev, { role: 'assistant', content: '⚠️ ' + e.message, error: true }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop: 56, minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>RAG-Powered</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 400, marginBottom: 3 }}>AyurMind Consultant</h1>
            <p style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 300 }}>Grounded in Charaka Samhita, Sushruta Samhita & Ashtanga Hridayam</p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {backendOnline && <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(74,122,90,.15)', color: 'var(--sage2)', border: '1px solid rgba(74,122,90,.3)', fontFamily: "'DM Mono',monospace" }}>🐍 Python NLP</span>}
            <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: ragEnabled ? 'rgba(74,122,90,.15)' : 'var(--bg3)', color: ragEnabled ? 'var(--sage2)' : 'var(--text3)', border: '1px solid var(--border)', fontFamily: "'DM Mono',monospace" }}>
              {ragEnabled ? '📚 RAG ON' : 'RAG OFF'}
            </span>
            {chatHistory.length > 0 && <Btn variant="ghost" size="sm" onClick={() => setChatHistory([])}>Clear</Btn>}
          </div>
        </div>

        {!apiKey && <Alert type="warning">No API key — go to <span onClick={() => {}} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Settings</span> to add your free Groq key.</Alert>}

        {/* Chat window */}
        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: '1rem' }}>
          <div ref={messagesRef} style={{ height: 460, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chatHistory.length === 0 && (
              <div style={{ margin: 'auto', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>◎</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', color: 'var(--gold)', marginBottom: 6 }}>Namaste</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7 }}>I am AyurMind — your Ayurvedic AI consultant.<br />Ask me anything about classical Ayurveda, herbs, doshas, or wellness.</div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp .3s ease both' }}>
                {msg.role === 'assistant' && <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 4 }}>◎ AyurMind AI</div>}
                <div style={{
                  maxWidth: '82%', padding: '10px 14px', fontSize: 13, lineHeight: 1.65,
                  borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                  background: msg.role === 'user' ? 'var(--gold)' : msg.error ? 'rgba(160,80,80,.1)' : 'var(--card2)',
                  color: msg.role === 'user' ? '#09080A' : msg.error ? '#D4885A' : 'var(--text)',
                  border: msg.role === 'user' ? 'none' : `1px solid ${msg.error ? 'rgba(160,80,80,.3)' : 'var(--border)'}`,
                  fontWeight: msg.role === 'user' ? 500 : 400,
                }}>
                  {msg.role === 'assistant' ? <span dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} /> : msg.content}
                </div>
                {msg.role === 'assistant' && msg.ragChunks?.length > 0 && (
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 4 }}>
                    <span style={{ fontSize: 9, color: 'var(--text4)', marginRight: 2 }}>Sources:</span>
                    {msg.ragChunks.map((c, ci) => (
                      <span key={ci} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 4, background: 'rgba(201,160,90,.1)', color: 'var(--gold2)', border: '1px solid rgba(201,160,90,.2)', fontFamily: "'DM Mono',monospace" }}>
                        📚 {c.source}
                      </span>
                    ))}
                    {msg.nlpMethod && <span style={{ fontSize: 9, color: 'var(--text4)', alignSelf: 'center', marginLeft: 4 }}>[{msg.nlpMethod}]</span>}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4, paddingLeft: 4 }}>◎ AyurMind AI</div>
                <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: '10px 10px 10px 3px', padding: '10px 14px' }}><TypingDots /></div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {chatHistory.length === 0 && (
            <div style={{ padding: '.65rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {CHAT_SUGGESTIONS.slice(0, 4).map(s => (
                <button key={s} onClick={() => send(s)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text3)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: '4px 10px', cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '.85rem', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg4)' }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about Ayurveda... (Enter to send, Shift+Enter for new line)"
              disabled={!apiKey || loading}
              style={{ height: 44, resize: 'none', borderRadius: 99, paddingTop: 10, paddingBottom: 10 }} />
            <Btn onClick={() => send()} disabled={!apiKey || loading || !input.trim()} style={{ flexShrink: 0 }}>
              {loading ? <Spinner color="#09080A" /> : 'Send'}
            </Btn>
          </div>
        </div>

        {/* All suggestions */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 8, fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase' }}>Suggested Questions</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {CHAT_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--text3)', fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: '5px 12px', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)'; e.target.style.background = 'var(--gold-dim)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text3)'; e.target.style.background = 'none'; }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
