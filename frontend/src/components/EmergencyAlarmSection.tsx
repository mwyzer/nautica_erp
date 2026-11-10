import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Radio,
  Fuel,
  ShieldAlert,
  Wind,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight
} from 'lucide-react';
import { MaritimeAlarmItem } from '../types';

export default function EmergencyAlarmSection(): React.JSX.Element {
  const [alarms, setAlarms] = useState<MaritimeAlarmItem[]>([]);

  const fetchAlarms = async () => {
    try {
      const res = await fetch('/api/v1/alarms/live');
      if (res.ok) {
        const data = await res.json();
        setAlarms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed fetching alarms:', err);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await fetch(`/api/v1/alarms/${id}/ack`, { method: 'POST' });
      setAlarms(prev =>
        prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Ack failed:', err);
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: 'var(--danger)',
          badgeBg: 'rgba(239, 68, 68, 0.25)',
        };
      case 'WARNING':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: 'var(--warning)',
          badgeBg: 'rgba(245, 158, 11, 0.25)',
        };
      default:
        return {
          bg: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          color: 'var(--accent-teal)',
          badgeBg: 'rgba(56, 189, 248, 0.25)',
        };
    }
  };

  const criticalCount = alarms.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <section>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-main)',
            }}
          >
            <Bell size={24} color={criticalCount > 0 ? 'var(--danger)' : 'var(--accent-cyan)'} /> Maritime Crisis &amp; Emergency Alarm Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Pusat peringatan dini insiden darurat armada: krisis kekurangan BBM (bunker shortage), cacat kemudi kritis SOLAS, badai siklon ALKI, dan pemblokir izin berlayar.
          </p>
        </div>

        <div>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: criticalCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
              border: criticalCount > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              color: criticalCount > 0 ? 'var(--danger)' : 'var(--success)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Radio size={14} className={criticalCount > 0 ? 'animate-pulse' : ''} />
            {criticalCount > 0 ? `${criticalCount} Krisis Darurat Memerlukan Tindakan` : 'Seluruh Armada Aman'}
          </span>
        </div>
      </div>

      {/* Alarms Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alarms.map(alarm => {
          const style = getSeverityStyle(alarm.severity);
          return (
            <div
              key={alarm.id}
              style={{
                background: style.bg,
                border: style.border,
                borderRadius: '12px',
                padding: '1.25rem 1.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: style.badgeBg,
                      color: style.color,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  >
                    {alarm.severity}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                    {alarm.vessel_name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {alarm.timestamp}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                  {alarm.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '4px' }}>
                  {alarm.description}
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginTop: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ArrowRight size={14} /> <strong>Rekomendasi Tindakan:</strong> {alarm.recommended_action}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ textAlign: 'right' }}>
                {alarm.acknowledged ? (
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--success)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={14} /> Terverifikasi Superintendent
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(alarm.id)}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Konfirmasi Tindakan (Acknowledge)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
