import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

export default function AICopilotSection(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Halo! Saya Captain Gemini, AI Superintendent untuk Nautical ERP. Saya terhubung langsung ke basis data armada, sertifikasi kru STCW, dan radar bunker BBM Anda. Ada yang bisa saya bantu periksa hari ini?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
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
      // Format structured ERP entities if returned (fleet, voyages, bunker)
      if (data.data && Array.isArray(data.data) && data.data.length > 0 && data.tool_executed !== 'maritime_regulation_rag') {
        const formattedItems = data.data.map((item: any) => {
          if (item.name && item.imo) {
            return `🚢 **${item.name}** (${item.imo}) — Status: \`${item.status}\` | Pelabuhan: ${item.port} | Burn: ${item.burn_rate_mt} MT/hari`;
          }
          if (item.voyage_number) {
            return `🗺️ **${item.voyage_number}** (${item.route || item.vessel}) — Status: \`${item.status}\` | Clearance: \`${item.clearance || 'PENDING'}\``;
          }
          if (item.fuel_type) {
            const flag = item.anomaly_flag ? `⚠️ [ANOMALI: ${item.reason}]` : '✅ Normal';
            return `⛽ Vessel #${item.vessel_id} (${item.fuel_type}) — ROB: ${item.current_rob_mt} MT | Konsumsi: ${item.daily_consumption_mt} MT/hari | ${flag}`;
          }
          return null;
        }).filter(Boolean);

        if (formattedItems.length > 0) {
          reply += '\n\n' + formattedItems.join('\n');
        }
      }

      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: reply, toolExecuted: data.tool_executed },
      ]);
    } catch (err: any) {
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
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem' }}>Captain Gemini — Nautical Operations Co-Pilot</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
          <button className="chip-btn" onClick={() => handleSend('Berapa batas sulfur bahan bakar menurut MARPOL Annex VI di kawasan SECA?')}>
            📜 Batas Sulfur MARPOL Annex VI (RAG)
          </button>
          <button className="chip-btn" onClick={() => handleSend('Berapa jam istirahat minimum perwira jaga menurut konvensi STCW?')}>
            ⚖️ Jam Istirahat STCW (RAG)
          </button>
          <button className="chip-btn" onClick={() => handleSend('Apa syarat kelaiklautan kemudi darurat menurut SOLAS Ch II-1?')}>
            🛡️ Kelaiklautan SOLAS (RAG)
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
