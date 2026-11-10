import React, { useState, useEffect } from 'react';
import {
  Clock,
  Anchor,
  TrendingDown,
  Fuel,
  CheckCircle2,
  AlertCircle,
  Compass,
  DollarSign,
  Leaf,
  Calendar,
} from 'lucide-react';
import { PortCallSchedule, OptimizeJITResponse } from '../types';

export default function PortCallJITSection(): React.JSX.Element {
  const [portCalls, setPortCalls] = useState<PortCallSchedule[]>([]);
  const [calcDistance, setCalcDistance] = useState<number>(310);
  const [calcBerthHours, setCalcBerthHours] = useState<number>(34);
  const [optResult, setOptResult] = useState<OptimizeJITResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/v1/port-call-jit/calls');
      if (res.ok) {
        const data = await res.json();
        setPortCalls(data);
      }
    } catch (err) {
      console.error('Failed to load port calls:', err);
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/v1/port-call-jit/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vessel_id: 1,
          distance_nm: calcDistance,
          target_berth_hours: calcBerthHours,
          nominal_fuel_burn_mt_day: 24.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOptResult(data);
      }
    } catch (err) {
      console.error('Failed to optimize JIT speed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleConfirmSlot = async (callId: number) => {
    try {
      const res = await fetch(`/api/v1/port-call-jit/confirm-slot/${callId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActionMessage(data.message);
        fetchCalls();
      }
    } catch (err) {
      console.error('Failed confirming slot:', err);
    }
  };

  useEffect(() => {
    fetchCalls();
    handleOptimize();
  }, []);

  const totalFuelSaved = portCalls.reduce((acc, c) => acc + c.fuel_saved_mt, 0);
  const totalCostSaved = portCalls.reduce((acc, c) => acc + c.cost_saved_usd, 0);
  const totalHoursWaitingEliminated = portCalls.reduce((acc, c) => acc + c.anchorage_waiting_hours_saved, 0);

  return (
    <div className="erp-section">
      {/* 1. Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock style={{ color: '#38bdf8' }} size={24} />
            Port Call Optimization & Just-In-Time (JIT) Arrival Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Inisiatif IMO Virtual Arrival: Sinkronisasi kecepatan jelajah dengan slot kesiapan dermaga & eliminasi waktu lego jangkar
          </p>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionMessage}
        </div>
      )}

      {/* 2. Key Port Call JIT Savings KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Total Biaya BBM Dihemat (JIT)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#059669' }}>
            +${totalCostSaved.toLocaleString()} USD
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Setara {totalFuelSaved.toFixed(1)} MT VLSFO
          </div>
        </div>

        <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Waktu Lego Jangkar Dieliminasi
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#0284c7' }}>
            {totalHoursWaitingEliminated.toFixed(1)} Jam
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Menghindari antrean berlabuh di luar pelabuhan
          </div>
        </div>

        <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Reduksi Emisi CO2
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#0891b2' }}>
            {(totalFuelSaved * 3.114).toFixed(1)} MT CO2
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Kepatuhan IMO 2030 Decarbonization
          </div>
        </div>

        <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
            Risiko Demurrage Slot
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#059669' }}>
            0% (NIL)
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Slot sandar VTS & pemanduan terjadwal presisi
          </div>
        </div>
      </div>

      {/* 3. Port Call Schedules & Slot Coordination Table */}
      <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
          <Anchor size={18} style={{ color: '#0284c7' }} /> Jadwal Kedatangan Armada & Koordinasi Slot Sandar JIT
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Kapal & Voyase</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Pelabuhan & Terminal</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Dermaga Siap</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Kecepatan Penuh vs JIT</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Penghematan BBM</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Waktu Tunggu Hemat</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status Slot VTS</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Aksi Slot</th>
              </tr>
            </thead>
            <tbody>
              {portCalls.map((call) => (
                <tr key={call.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{call.vessel_name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{call.voyage_number}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ color: '#0284c7', fontWeight: 600 }}>{call.destination_port}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{call.terminal_berth}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{call.berth_readiness_time}</div>
                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>JIT ETA: {call.jit_adjusted_eta}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{ color: '#64748b', textDecoration: 'line-through' }}>{call.full_ahead_speed_knots} kts</span>{' '}
                    <span style={{ color: '#0284c7', fontWeight: 700 }}>&rarr; {call.jit_recommended_speed_knots} kts</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#059669' }}>+{call.fuel_saved_mt} MT</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>+${call.cost_saved_usd.toLocaleString()} USD</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>{call.anchorage_waiting_hours_saved} Jam</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: call.vts_slot_status === 'CONFIRMED_JIT' ? '#dcfce7' : '#fef3c7',
                        color: call.vts_slot_status === 'CONFIRMED_JIT' ? '#166534' : '#92400e',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {call.vts_slot_status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {call.vts_slot_status !== 'CONFIRMED_JIT' ? (
                      <button
                        onClick={() => handleConfirmSlot(call.id)}
                        style={{
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        Konfirmasi Slot
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Terjadwal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Virtual Arrival Speed Calculator */}
      <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          <TrendingDown size={18} style={{ color: '#0284c7' }} /> Kalkulator Virtual Arrival (JIT Eco-Speed Optimizer)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: '1.25rem' }}>
          <div>
            <div style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Sisa Jarak ke Fairway Pelabuhan: <strong>{calcDistance} NM</strong>
              </label>
              <input
                type="range"
                min={50}
                max={600}
                step={10}
                value={calcDistance}
                aria-label="Sisa Jarak ke Pelabuhan"
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Waktu Kesiapan Dermaga Tujuan: <strong>{calcBerthHours} Jam ke depan</strong>
              </label>
              <input
                type="range"
                min={10}
                max={72}
                step={1}
                value={calcBerthHours}
                aria-label="Waktu Kesiapan Dermaga"
                onChange={(e) => setCalcBerthHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={isOptimizing}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Hitung Optimasi Kecepatan JIT
            </button>
          </div>

          {optResult && (
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>
                Hasil Rekomendasi JIT Virtual Arrival:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Kecepatan Optimal:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0284c7' }}>{optResult.jit_speed_knots} knots</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hemat Bahan Bakar:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669' }}>+{optResult.fuel_saved_mt} MT</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: '1.4' }}>
                {optResult.recommendation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
