import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Waves,
  Sliders,
  RotateCcw,
  PlusCircle,
  FileText,
  Activity,
  CheckCircle2,
  Compass,
  Zap,
} from 'lucide-react';
import { BallastTank, StabilityCalculationResult, BallastExchangeLog, Vessel } from '../types';

interface BallastStabilitySectionProps {
  vessels: Vessel[];
}

export default function BallastStabilitySection({ vessels }: BallastStabilitySectionProps): React.JSX.Element {
  const [selectedVesselId, setSelectedVesselId] = useState<number>(vessels[0]?.id || 1);
  const [cargoPayload, setCargoPayload] = useState<number>(8500);
  const [tanks, setTanks] = useState<BallastTank[]>([]);
  const [stabilityResult, setStabilityResult] = useState<StabilityCalculationResult | null>(null);
  const [exchangeLogs, setExchangeLogs] = useState<BallastExchangeLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // New Log Form State
  const [newLogMethod, setNewLogMethod] = useState<string>('Flow-Through (300% Vol)');
  const [newLogTank, setNewLogTank] = useState<string>('WBT 1P, 1S');
  const [newLogVolume, setNewLogVolume] = useState<number>(1200);
  const [newLogDistance, setNewLogDistance] = useState<number>(235);
  const [newLogDepth, setNewLogDepth] = useState<number>(950);

  // Fetch initial tanks schema & exchange logs
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [tanksRes, logsRes] = await Promise.all([
          fetch('/api/v1/ballast-stability/tanks/default').then((r) => r.json()),
          fetch('/api/v1/ballast-stability/exchange-logs').then((r) => r.json()),
        ]);
        setTanks(tanksRes);
        setExchangeLogs(logsRes);
        // Initial stability run
        calculateStability(tanksRes, cargoPayload, selectedVesselId);
      } catch (err) {
        console.error('Failed to load ballast stability baseline:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [selectedVesselId]);

  const calculateStability = async (
    currentTanks: BallastTank[],
    cargo: number,
    vesselId: number
  ) => {
    setIsCalculating(true);
    try {
      const selectedVessel = vessels.find((v) => v.id === vesselId);
      const lightship = selectedVessel ? selectedVessel.dwt * 0.35 : 12000.0;

      const payload = {
        vessel_id: vesselId,
        displacement_mt: lightship,
        cargo_payload_mt: cargo,
        tanks: currentTanks,
      };

      const res = await fetch('/api/v1/ballast-stability/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setStabilityResult(data);
      }
    } catch (err) {
      console.error('Stability calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleTankChange = (tankId: string, valueMt: number) => {
    const updated = tanks.map((t) =>
      t.tank_id === tankId ? { ...t, current_mt: Math.min(t.capacity_mt, Math.max(0, valueMt)) } : t
    );
    setTanks(updated);
    calculateStability(updated, cargoPayload, selectedVesselId);
  };

  const applyPreset = (presetType: 'ballast_voyage' | 'laden_voyage' | 'eco_trim' | 'heavy_list') => {
    let updatedTanks = [...tanks];
    let newCargo = cargoPayload;

    if (presetType === 'ballast_voyage') {
      newCargo = 500;
      updatedTanks = updatedTanks.map((t) => ({ ...t, current_mt: Math.round(t.capacity_mt * 0.85) }));
    } else if (presetType === 'laden_voyage') {
      newCargo = 14500;
      updatedTanks = updatedTanks.map((t) => {
        if (t.tank_id === 'APT') return { ...t, current_mt: 160 };
        return { ...t, current_mt: Math.round(t.capacity_mt * 0.15) };
      });
    } else if (presetType === 'eco_trim') {
      newCargo = 9200;
      updatedTanks = updatedTanks.map((t) => {
        if (t.tank_id === 'APT') return { ...t, current_mt: Math.round(t.capacity_mt * 0.8) };
        if (t.tank_id === 'FPT') return { ...t, current_mt: Math.round(t.capacity_mt * 0.25) };
        if (t.tank_id.startsWith('WBT_1')) return { ...t, current_mt: Math.round(t.capacity_mt * 0.5) };
        if (t.tank_id.startsWith('WBT_2')) return { ...t, current_mt: Math.round(t.capacity_mt * 0.5) };
        return { ...t, current_mt: Math.round(t.capacity_mt * 0.4) };
      });
    } else if (presetType === 'heavy_list') {
      // Simulates port side unbalance
      updatedTanks = updatedTanks.map((t) => {
        if (t.tank_id.includes('P')) return { ...t, current_mt: Math.round(t.capacity_mt * 0.95) };
        if (t.tank_id.includes('S')) return { ...t, current_mt: Math.round(t.capacity_mt * 0.05) };
        return t;
      });
    }

    setCargoPayload(newCargo);
    setTanks(updatedTanks);
    calculateStability(updatedTanks, newCargo, selectedVesselId);
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentVessel = vessels.find((v) => v.id === selectedVesselId);
    const newEntry = {
      vessel_name: currentVessel ? currentVessel.name : 'MV Nusantara Pioneer',
      log_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      exchange_method: newLogMethod,
      tank_operated: newLogTank,
      volume_pumped_m3: newLogVolume,
      start_lat: -4.35,
      start_lng: 118.65,
      distance_offshore_nm: newLogDistance,
      water_depth_m: newLogDepth,
      bwms_active: true,
      tro_residual_ppm: 0.06,
      uv_reactor_power_kw: 42.0,
      compliance_standard: 'IMO Reg D-2 (Treated Discharge)',
    };

    try {
      const res = await fetch('/api/v1/ballast-stability/exchange-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (res.ok) {
        const saved = await res.json();
        setExchangeLogs([saved, ...exchangeLogs]);
        setShowLogModal(false);
      }
    } catch (err) {
      console.error('Failed to submit ballast log:', err);
    }
  };

  const currentVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  return (
    <div className="erp-section">
      {/* 1. Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Scale style={{ color: '#06b6d4' }} size={24} />
            Ballast Water Management (BWM) & Ship Stability Simulator
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Kepatuhan Konvensi IMO BWM 2004 (Reg D-1/D-2) & IMO 2008 Intact Stability Code (IS Code)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedVesselId}
            onChange={(e) => setSelectedVesselId(Number(e.target.value))}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              fontSize: '0.875rem',
            }}
          >
            {vessels.map((v) => (
              <option key={v.id} value={v.id} style={{ background: '#1e293b' }}>
                {v.name} ({v.vessel_type || 'Vessel'} - {v.dwt.toLocaleString()} DWT)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLogModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              backgroundColor: '#06b6d4',
              color: '#0f172a',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <PlusCircle size={16} /> Catat Log BWE (D-2)
          </button>
        </div>
      </div>

      {/* 2. Key Stability KPI Summary Cards */}
      {stabilityResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* GM Metric */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${stabilityResult.is_gm_compliant ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Metacentric Height (GM Fluid)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: stabilityResult.is_gm_compliant ? '#10b981' : '#ef4444' }}>
              {stabilityResult.gm_fluid_m.toFixed(2)} m
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>IMO Min: ≥ 0.15 m</span>
              <span style={{ fontWeight: 600, color: stabilityResult.is_gm_compliant ? '#34d399' : '#f87171' }}>
                {stabilityResult.gm_status}
              </span>
            </div>
          </div>

          {/* Trim Metric */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${stabilityResult.is_trim_safe ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dynamic Vessel Trim
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#38bdf8' }}>
              {stabilityResult.trim_m > 0 ? `+${stabilityResult.trim_m}` : stabilityResult.trim_m} m
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Direction:</span>
              <span style={{ fontWeight: 600, color: '#bae6fd' }}>{stabilityResult.trim_direction}</span>
            </div>
          </div>

          {/* List Metric */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${stabilityResult.is_list_safe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Transverse List (Kemiringan)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: stabilityResult.is_list_safe ? '#10b981' : '#ef4444' }}>
              {stabilityResult.list_deg}°
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Heel:</span>
              <span style={{ fontWeight: 600, color: stabilityResult.is_list_safe ? '#34d399' : '#f87171' }}>
                {stabilityResult.list_direction}
              </span>
            </div>
          </div>

          {/* Longitudinal Stress (Bending Moment & Shear Force) */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${stabilityResult.stress_status === 'SAFE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hull Girder Stress (BM / SF)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: stabilityResult.stress_status === 'SAFE' ? '#10b981' : '#f59e0b' }}>
              {stabilityResult.bending_moment_percent}% <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>M_allow</span>
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Shear Force: {stabilityResult.shear_force_percent}%</span>
              <span style={{ fontWeight: 600, color: stabilityResult.stress_status === 'SAFE' ? '#34d399' : '#fbbf24' }}>
                {stabilityResult.stress_status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace: Tank Sliders on Left + Visual Ship Attitude Simulator on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(320px, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Left: Ballast Tanks Sliders & Presets */}
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} style={{ color: '#06b6d4' }} /> Konfigurasi Tangki Balas & Beban
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Displacement: {stabilityResult?.total_displacement_mt.toLocaleString()} MT
            </span>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              onClick={() => applyPreset('ballast_voyage')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38bdf8',
                cursor: 'pointer',
              }}
            >
              Preset: Ballast Voyage
            </button>
            <button
              onClick={() => applyPreset('laden_voyage')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                cursor: 'pointer',
              }}
            >
              Preset: Laden (Full Cargo)
            </button>
            <button
              onClick={() => applyPreset('eco_trim')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818cf8',
                cursor: 'pointer',
              }}
            >
              Preset: Optimum Eco-Trim
            </button>
            <button
              onClick={() => applyPreset('heavy_list')}
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                cursor: 'pointer',
              }}
            >
              Simulasi Miring (List Hazard)
            </button>
          </div>

          {/* Cargo Payload Input */}
          <div style={{ marginBottom: '1.1rem', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Muatan Kargo di Palka (Cargo Payload)</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{cargoPayload.toLocaleString()} MT</span>
            </div>
            <input
              type="range"
              min={0}
              max={currentVessel ? currentVessel.dwt * 0.95 : 18000}
              step={250}
              value={cargoPayload}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCargoPayload(val);
                calculateStability(tanks, val, selectedVesselId);
              }}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>

          {/* Individual Ballast Tank Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {tanks.map((tank) => {
              const fillPercent = Math.round((tank.current_mt / tank.capacity_mt) * 100);
              return (
                <div
                  key={tank.tank_id}
                  style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{tank.tank_name}</span>
                    <span style={{ color: '#06b6d4' }}>{tank.current_mt} / {tank.capacity_mt} MT</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={tank.capacity_mt}
                    step={10}
                    value={tank.current_mt}
                    onChange={(e) => handleTankChange(tank.tank_id, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    <span>{fillPercent}% Terisi</span>
                    <span>LCG: {tank.lcg_m > 0 ? `+${tank.lcg_m}` : tank.lcg_m}m</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Visual Ship Simulator & AI Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Visual Hull Attitude Simulator */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Activity size={18} style={{ color: '#38bdf8' }} /> Visualisasi Sikap Lambung (Attitude)
            </h3>

            {/* Pitch & Roll Hull Simulator Diagram */}
            <div
              style={{
                height: '160px',
                backgroundColor: 'rgba(10, 15, 30, 0.7)',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              {/* Water Surface Line */}
              <div
                style={{
                  position: 'absolute',
                  top: '65%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: 'rgba(56, 189, 248, 0.6)',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '66%',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                }}
              />

              {/* Dynamic Vessel Profile (Rotates according to Trim in meters & List in deg) */}
              <div
                style={{
                  width: '240px',
                  height: '48px',
                  backgroundColor: '#1e293b',
                  borderRadius: '6px 24px 8px 6px',
                  border: '2px solid #38bdf8',
                  position: 'relative',
                  transform: `rotate(${(stabilityResult?.trim_m || 0) * -1.8}deg)`,
                  transition: 'transform 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                }}
              >
                <span>{currentVessel?.name || 'Vessel Hull'}</span>
                {/* Bridge superstructure */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '30px',
                    width: '32px',
                    height: '18px',
                    backgroundColor: '#334155',
                    borderRadius: '4px 4px 0 0',
                    border: '1px solid #38bdf8',
                  }}
                />
              </div>

              {/* Real-time Indicator Labels */}
              <div style={{ position: 'absolute', bottom: '8px', left: '12px', fontSize: '0.7rem', color: '#94a3b8' }}>
                Trim: {stabilityResult?.trim_m}m ({stabilityResult?.trim_direction})
              </div>
              <div style={{ position: 'absolute', bottom: '8px', right: '12px', fontSize: '0.7rem', color: '#94a3b8' }}>
                Heel: {stabilityResult?.list_deg}° ({stabilityResult?.list_direction})
              </div>
            </div>

            {/* Bending Moment / Shear Stress Bar */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                <span>Bending Moment Limit (M_allow)</span>
                <span style={{ fontWeight: 600, color: stabilityResult?.stress_status === 'SAFE' ? '#10b981' : '#f59e0b' }}>
                  {stabilityResult?.bending_moment_percent}%
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, stabilityResult?.bending_moment_percent || 50)}%`,
                    backgroundColor: (stabilityResult?.bending_moment_percent || 0) > 85 ? '#ef4444' : '#10b981',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* AI Stability Guidance & Recommendations */}
          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} style={{ color: stabilityResult?.imo_compliance ? '#10b981' : '#ef4444' }} />
              Rekomendasi AI Stability Superintendent
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              {stabilityResult?.recommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Ballast Water Record Book (BWRB - IMO Reg D-1 & D-2) Table */}
      <div style={{ padding: '1.25rem', backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: '#06b6d4' }} /> Ballast Water Record Book (BWRB - IMO BWM Convention)
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Logbook resmi pertukaran & pengolahan air balas di perairan internasional (&gt;200 NM dari pantai, kedalaman &gt;200m)
            </p>
          </div>
          <span
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            IMO D-2 BWMS DISINFECTED
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Waktu & Tanggal</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Kapal</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Metode Pertukaran</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tangki Dioperasikan</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Volume (m³)</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Koordinat & Offshore</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Kedalaman</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status BWMS D-2</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Audit Syahbandar</th>
              </tr>
            </thead>
            <tbody>
              {exchangeLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{log.log_date}</td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#38bdf8' }}>{log.vessel_name}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{log.exchange_method}</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{log.tank_operated}</td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{log.volume_pumped_m3.toLocaleString()} m³</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {log.start_lat.toFixed(2)}°, {log.start_lng.toFixed(2)}°
                    <span style={{ display: 'block', fontSize: '0.7rem', color: '#10b981' }}>
                      {log.distance_offshore_nm} NM offshore (OK &gt;200)
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>{log.water_depth_m} m</td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        color: '#22d3ee',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      UV {log.uv_reactor_power_kw}kW | TRO {log.tro_residual_ppm}ppm
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: '#34d399',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      <CheckCircle2 size={14} /> {log.port_inspector_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Modal: Catat Pertukaran Air Balas (BWE) Baru */}
      {showLogModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={20} style={{ color: '#06b6d4' }} /> Pencatatan Operasi Ballast Water (BWE)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Memenuhi standar pencatatan resmi Ballast Water Record Book IMO Regulation D-1/D-2
            </p>

            <form onSubmit={handleCreateLog}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Metode Pertukaran (Exchange Method)
                </label>
                <select
                  value={newLogMethod}
                  onChange={(e) => setNewLogMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                  }}
                >
                  <option value="Flow-Through (300% Vol)" style={{ background: '#1e293b' }}>Flow-Through (300% Volume Pumping)</option>
                  <option value="Sequential Empty/Refill" style={{ background: '#1e293b' }}>Sequential Empty & Refill Method</option>
                  <option value="Dilution Method" style={{ background: '#1e293b' }}>Dilution Top-to-Bottom Method</option>
                </select>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Tangki yang Dioperasikan
                </label>
                <input
                  type="text"
                  value={newLogTank}
                  onChange={(e) => setNewLogTank(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Volume Dipompa (m³)
                  </label>
                  <input
                    type="number"
                    value={newLogVolume}
                    onChange={(e) => setNewLogVolume(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Jarak dari Daratan (NM)
                  </label>
                  <input
                    type="number"
                    value={newLogDistance}
                    onChange={(e) => setNewLogDistance(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Kedalaman Laut (m) - Standar IMO &gt;200m
                </label>
                <input
                  type="number"
                  value={newLogDepth}
                  onChange={(e) => setNewLogDepth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#06b6d4',
                    border: 'none',
                    color: '#0f172a',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Simpan & Verifikasi D-2
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
