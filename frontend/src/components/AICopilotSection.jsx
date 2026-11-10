import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

export default function AICopilotSection() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Halo! Saya Captain Gemini, AI Superintendent untuk Nautical ERP. Saya terhubung langsung ke basis data armada, sertifikasi kru STCW, dan radar bunker BBM Anda. Ada yang bisa saya bantu periksa hari ini?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText) => {
    const query = messageText || input;
    if (!query.trim() || isLoading) return;

    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server error (${res.status})`);
      }
      const data = await res.json();

      let reply = data.reply;
      if (data.data && Array.isArray(data.data)) {
        reply += '\n\n' + data.data.map(item => `• ${item.name || item.route || item.fuel_type}: ${JSON.stringify(item)}`).join('\n');
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: reply, toolExecuted: data.tool_executed },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: `Maaf, terjadi gangguan koneksi ke server: ${err.message}. Pastikan backend di port 8000 aktif.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Captain Gemini — Nautical Operations Co-Pilot</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tanyakan status kesiapan armada, verifikasi bunker, atau evaluasi kelaiklautan secara interaktif.
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-bubble bubble-${m.sender}`}>
              <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
              {m.toolExecuted && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>
                  🔧 Tool dieksekusi: <code>{m.toolExecuted}</code>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={16} /> Captain Gemini sedang memproses data maritim...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chips-row">
          <button className="chip-btn" onClick={() => handleSend('Tampilkan status armada kapal saya')}>
            🚢 Status Armada
          </button>
          <button className="chip-btn" onClick={() => handleSend('Apakah ada anomali konsumsi bunker pada armada?')}>
            ⛽ Cek Anomali BBM
          </button>
          <button className="chip-btn" onClick={() => handleSend('Tampilkan rencana pelayaran aktif')}>
            🗺️ Rencana Pelayaran
          </button>
          <button className="chip-btn" onClick={() => handleSend('Kapal mana yang siap berlayar ke Singapura?')}>
            🧭 Kapal Siap ke Singapura?
          </button>
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pertanyaan maritim operasional di sini..."
            disabled={isLoading}
          />
          <button className="btn btn-ai" onClick={() => handleSend()} disabled={isLoading}>
            <Send size={14} /> Kirim ⚡
          </button>
        </div>
      </div>
    </section>
  );
}
