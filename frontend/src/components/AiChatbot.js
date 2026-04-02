import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, mediateDispute } from '../api';

const WELCOME = "👋 Hi! I'm your AI complaint assistant. Describe your civic issue and I'll help you file it correctly!";

export default function AiChatbot({ onStartComplaint }) {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [history, setHistory] = useState([]);   // {role:'user'|'model', text:'...'}
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: WELCOME }
  ]);
  const [isMediation, setIsMediation] = useState(false);
  const [neighborB, setNeighborB] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (isMediation) {
        const res = await mediateDispute({ userA: 'Citizen A', userB: neighborB || 'Neighbor', issue: text });
        reply = res.data.mediation;
      } else {
        const res = await sendChatMessage(text, history);
        reply = res.data.reply;
      }
      
      const responseText = reply || "Sorry, I couldn't generate a response.";
      const modelMsg = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMsg]);
      setHistory(prev => [...prev, { role: 'user', text }, { role: 'model', text: responseText }]);
    } catch (err) {
      let errorText = '⚠️ Could not reach the AI assistant. Is the backend running?';
      if (err.response?.status === 404) {
        errorText = '⚠️ AI Endpoint not found. Ensure the backend is on port 8081.';
      } else if (err.response?.status === 500) {
        errorText = '🚨 AI Configuration Error: Please ensure your API Key/Token is correctly set in backend/src/main/resources/application.properties';
      } else if (err.response?.data?.message) {
        errorText = err.response.data.message;
      }
      setMessages(prev => [...prev, {
        role: 'model',
        text: errorText
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'model', text: WELCOME }]);
    setHistory([]);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        id="ai-chatbot-toggle"
        className="chatbot-bubble"
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
      >
        {open ? '✕' : '🤖'}
        {!open && <span className="chatbot-pulse" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window animate-slide-up" id="ai-chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Complaint Assistant</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>Powered by Smart AI</div>
              </div>
            </div>
            <button className="chatbot-clear-btn" onClick={clearChat} title="Clear chat">🗑️</button>
          </div>

          <div style={{ 
            display: 'flex', gap: '10px', padding: '10px 15px', 
            background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' 
          }}>
            <button 
              className={`btn btn-sm ${!isMediation ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsMediation(false)}
              style={{ fontSize: '0.65rem', flex: 1 }}
            >
              🤖 Assist
            </button>
            <button 
              className={`btn btn-sm ${isMediation ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsMediation(true)}
              style={{ fontSize: '0.65rem', flex: 1 }}
            >
              ⚖️ Mediate
            </button>
          </div>

          {isMediation && (
            <div style={{ padding: '8px 15px', background: 'rgba(99, 102, 241, 0.1)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>Neighbor's Name:</span>
              <input 
                className="form-control" 
                style={{ fontSize: '0.7rem', padding: '2px 8px', height: '24px' }}
                value={neighborB}
                onChange={e => setNeighborB(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg chatbot-msg-${msg.role}`}
              >
                {msg.role === 'model' && <span className="chatbot-bot-icon">🤖</span>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '78%' }}>
                  <div className="chatbot-bubble-text" style={{ maxWidth: '100%' }}>{msg.text}</div>
                  
                  {/* Option to file complaint using the current text (only for user messages) */}
                  {msg.role === 'user' && i === messages.length - 2 && (
                    <button 
                      className="btn btn-sm"
                      style={{ 
                        fontSize: '0.65rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        alignSelf: 'flex-end',
                        padding: '4px 8px'
                      }}
                      onClick={() => { onStartComplaint(msg.text); setOpen(false); }}
                    >
                      ✨ File Complaint
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg chatbot-msg-model">
                <span className="chatbot-bot-icon">🤖</span>
                <div className="chatbot-bubble-text chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <textarea
              id="ai-chatbot-input"
              className="chatbot-textarea"
               rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isMediation ? "Describe the dispute issue..." : "Describe your issue… (Enter to send)"}
              disabled={loading}
            />
            <button
              id="ai-chatbot-send"
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : '➤'}
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '6px 0 8px' }}>
            AI may make mistakes. Always verify important info.
          </div>
        </div>
      )}
    </>
  );
}
