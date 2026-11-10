import React, { useState, useEffect } from 'react';
import {
  Waves,
  Wind,
  Compass,
  TrendingDown,
  DollarSign,
  Fuel,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { WeatherRoutingScenario } from '../types';

export default function WeatherRoutingSection(): React.JSX.Element {
  const [speedKnots, setSpeedKnots] = useState<number>(11.5);
  const [scenario, setScenario] = useState<WeatherRoutingScenario | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchScenario = async (spd: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/weather-routing/simulate?speed_knots=${spd}&distance_nm=525&nominal_fuel_burn_mt_day=24`);
      if (res.ok) {
        const data = await res.json();
        setScenario(data);
      }
    } catch (err) {
      console.error('Failed fetching weather routing scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenario(speedKnots);
  }, [speedKnots]);

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
            <Waves size={24} color="var(--accent-cyan)" /> AI Weather-Routing &amp; Eco-Speed Voyage Optimizer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Simulasi kurva hukum kubik baling-baling (*Cubic Propeller Law*), penghematan ribuan dolar bahan bakar, reduksi $CO_2$, dan penghindaran gelombang badai.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} /> AI Weather Engine Active
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Speed Slider (Left) & Simulation Dashboard (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Left: Speed Controller Card */}
        <div className="card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} color="var(--accent-teal)" /> Pengaturan Kecepatan Jelajah (Knots)
          </h3>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Target Speed:</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {speedKnots.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>knot</span>
              </span>
            </div>

            <input
              type="range"
              min="9.0"
              max="16.5"
              step="0.5"
              value={speedKnots}
              onChange={e => setSpeedKnots(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              <span>9.0 kts (Super Eco)</span>
              <span>11.5 kts (Optimal)</span>
              <span>16.5 kts (Full Ahead)</span>
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: '#cbd5e1',
            }}
          >
            <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Rute: IDJKT → SGSIN (525 NM)</div>
            <div>Kapal: <strong>MV Nusantara Pioneer</strong> (28.500 DWT)</div>
            <div>Harga Bunker: \$645 / MT VLSFO</div>
            <div>Batas Laycan Kedatangan: Maks. 72 Jam</div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setSpeedKnots(11.5)}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem' }}
            >
              Set ke Rekomendasi AI Eco-Speed (11.5 kts)
            </button>
            <button
              onClick={() => setSpeedKnots(14.8)}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.8rem' }}
            >
              Reset ke Full Speed Baseline (14.8 kts)
            </button>
          </div>
        </div>

        {/* Right: Comparative Financial & Emission Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {scenario && (
            <>
              {/* Savings Highlight Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0, 229, 255, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                    POTENSI PENGHEMATAN EFISIENSI AI
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    +${scenario.cost_saved_usd.toLocaleString('en-US')} USD
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                    Hemat {scenario.fuel_saved_mt} MT Bahan Bakar • Hindari {scenario.co2_avoided_mt} Ton Emisi CO₂
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Waktu Tambahan di Laut:</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                    +{scenario.extra_hours_at_sea} Jam
                  </div>
                  <span
                    className={`badge ${scenario.is_within_laycan ? 'badge-success' : 'badge-danger'}`}
                    style={{ marginTop: '4px' }}
                  >
                    {scenario.is_within_laycan ? '✓ Memenuhi Batas Laycan' : '⚠️ Melebihi Batas Laycan'}
                  </span>
                </div>
              </div>

              {/* Detail Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMASI LAMA PELAYARAN</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                    {scenario.duration_hours} <span style={{ fontSize: '0.85rem' }}>Jam</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    vs 35.5 Jam di Kecepatan Penuh
                  </span>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL KONSUMSI BBM</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--warning)', marginTop: '2px' }}>
                    {scenario.fuel_burn_total_mt} <span style={{ fontSize: '0.85rem' }}>MT</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Total Biaya: ${scenario.bunker_cost_usd.toLocaleString()}
                  </span>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TINGGI OMBAK MAKS</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    {scenario.max_wave_height_m} <span style={{ fontSize: '0.85rem' }}>Meter</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>
                    Aman dari gelombang bahaya
                  </span>
                </div>
              </div>

              {/* Waypoint Weather Advisory */}
              <div className="card" style={{ padding: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wind size={16} color="var(--accent-cyan)" /> Koridor Waypoint &amp; Rekomendasi Navigasi Cuaca
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {scenario.route_description}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {scenario.waypoints.map((wp, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{wp.name}</div>
                      <div style={{ color: '#94a3b8' }}>
                        {wp.lat}°, {wp.lng}° • Beaufort {wp.wind_beaufort}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
