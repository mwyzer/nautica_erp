import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Thermometer,
  ShieldAlert,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Anchor,
  Info
} from 'lucide-react';
import { ContainerBaySlot } from '../types';

export default function CargoStowageSection(): React.JSX.Element {
  const [bayData, setBayData] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<ContainerBaySlot | null>(null);

  useEffect(() => {
    fetch('/api/v1/stowage/bays')
      .then(res => res.json())
      .then(data => {
        setBayData(data);
        if (data.slots && data.slots.length > 0) {
          setSelectedSlot(data.slots[1]); // Default to reefer container
        }
      })
      .catch(err => console.error('Failed fetching stowage data:', err));
  }, []);

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
            <Boxes size={24} color="var(--accent-cyan)" /> Cargo Stowage &amp; Container Bay Plan 2D Grid
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Visualisasi penataan slot kontainer kapal (Bay Plan), sensor suhu Reefer Container, aturan segregasi kargo berbahaya (IMDG Code), dan stabilitas GM.
          </p>
        </div>
      </div>

      {bayData && (
        <>
          {/* Stability & Reefer Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                STABILITAS KAPAL (GM METACENTRIC HEIGHT)
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                {bayData.stability_metacentric_height_gm_meters} <span style={{ fontSize: '0.9rem' }}>Meter</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Aman di atas kriteria minimum IMO (&gt; 0.15m)
              </span>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                ALARM SUHU REEFER CONTAINER
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: bayData.reefer_alarm_count > 0 ? 'var(--warning)' : 'var(--success)', marginTop: '2px' }}>
                {bayData.reefer_alarm_count} Deviasi
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {bayData.reefer_alarm_count > 0 ? 'Periksa kompresor reefer bay 04' : 'Seluruh suhu beku stabil'}
              </span>
            </div>

            <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                KARGO BERBAHAYA (IMDG CODE)
              </span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '2px' }}>
                {bayData.imdg_dangerous_goods_count} Kontainer
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Pemisahan kelas 3 &amp; 9 terverifikasi aman
              </span>
            </div>
          </div>

          {/* Bay Plan Grid (Left) & Container Inspector (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
            {/* Bay Grid */}
            <div className="card" style={{ padding: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={18} color="var(--accent-cyan)" /> {bayData.current_bay} — Tampak Melintang Geladak
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{bayData.vessel_name}</span>
              </div>

              {/* On-Deck Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '0.06em' }}>
                  ▲ GELADAK ATAS (ON-DECK SLOTS • TIER 82)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {bayData.slots
                    .filter((s: ContainerBaySlot) => s.slot_position === 'ON_DECK')
                    .map((s: ContainerBaySlot) => {
                      const isSelected = selectedSlot?.container_number === s.container_number;
                      return (
                        <div
                          key={s.container_number}
                          onClick={() => setSelectedSlot(s)}
                          style={{
                            border: isSelected
                              ? '2px solid var(--accent-cyan)'
                              : s.temp_status === 'WARNING_HIGH'
                              ? '1px solid var(--warning)'
                              : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            background: isSelected
                              ? 'rgba(0, 229, 255, 0.15)'
                              : s.is_reefer
                              ? 'rgba(56, 189, 248, 0.08)'
                              : 'rgba(255, 255, 255, 0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>
                            ROW {s.row} • {s.size_teu}ft
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.container_number}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: s.imdg_class ? 'var(--warning)' : '#64748b' }}>
                            {s.is_reefer ? `❄ ${s.temperature_celsius}°C` : s.imdg_class ? '⚠️ IMDG Class' : `${s.weight_mt} MT`}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Waterline / Hatch Cover Divider */}
              <div
                style={{
                  borderTop: '2px dashed rgba(0, 229, 255, 0.3)',
                  paddingTop: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: 'var(--accent-teal)',
                }}
              >
                <span>HATCH COVER / GELADAK UTAMA</span>
                <span>GARIS AIR (LOAD WATERLINE)</span>
              </div>

              {/* Under-Deck Section */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.06em' }}>
                  ▼ RUANG PALKA BAWAH (UNDER-DECK / HOLD • TIER 02)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                  {bayData.slots
                    .filter((s: ContainerBaySlot) => s.slot_position === 'UNDER_DECK')
                    .map((s: ContainerBaySlot) => {
                      const isSelected = selectedSlot?.container_number === s.container_number;
                      return (
                        <div
                          key={s.container_number}
                          onClick={() => setSelectedSlot(s)}
                          style={{
                            border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            background: isSelected ? 'rgba(0, 229, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>
                            ROW {s.row} • {s.size_teu}ft
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.container_number}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: s.imdg_class ? 'var(--warning)' : '#64748b' }}>
                            {s.imdg_class ? '⚠️ IMDG Class 9' : `${s.weight_mt} MT`}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Container Details Inspector */}
            {selectedSlot && (
              <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    INSPEKTOR KONTAINER
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {selectedSlot.container_number}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {selectedSlot.bay_id} • Row {selectedSlot.row} • Tier {selectedSlot.tier} ({selectedSlot.slot_position})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Ukuran / Berat:</span>
                    <span style={{ fontWeight: 600 }}>{selectedSlot.size_teu}ft / {selectedSlot.weight_mt} MT</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Deskripsi Muatan:</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc', textAlign: 'right', maxWidth: '180px' }}>
                      {selectedSlot.cargo_name}
                    </span>
                  </div>

                  {selectedSlot.is_reefer && (
                    <div
                      style={{
                        background: selectedSlot.temp_status === 'WARNING_HIGH' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                        border: selectedSlot.temp_status === 'WARNING_HIGH' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: selectedSlot.temp_status === 'WARNING_HIGH' ? 'var(--warning)' : 'var(--accent-teal)' }}>
                        <Thermometer size={16} /> Sensor Reefer: {selectedSlot.temperature_celsius}°C
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px' }}>
                        Setpoint Target: {selectedSlot.temp_setpoint_celsius}°C
                        {selectedSlot.temp_status === 'WARNING_HIGH' && ' (Suhu naik +1.8°C di atas batas toleransi)'}
                      </div>
                    </div>
                  )}

                  {selectedSlot.imdg_class && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--danger)' }}>
                        <ShieldAlert size={16} /> Regulasi Kargo Berbahaya IMDG
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>
                        {selectedSlot.imdg_class} • Mematuhi aturan pemisahan palka SOLAS VII.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
