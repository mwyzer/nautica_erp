import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Flame,
  Zap,
  Waves,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { Vessel, EngineRoomLiveSnapshot } from '../types';

interface IoTEngineSectionProps {
  vessels: Vessel[];
}

export default function IoTEngineSection({ vessels }: IoTEngineSectionProps): React.JSX.Element {
  const [selectedVesselId, setSelectedVesselId] = useState<number>(vessels[0]?.id || 1);
  const [telemetry, setTelemetry] = useState<EngineRoomLiveSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [activeFault, setActiveFault] = useState<string>('NONE');

  const fetchTelemetry = async (vesselId: number) => {
    try {
      const res = await fetch(`/api/v1/iot-engine/telemetry/live/${vesselId}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to fetch IoT telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(selectedVesselId);
    // Poll every 3 seconds to show live simulated telemetry
    const interval = setInterval(() => {
      fetchTelemetry(selectedVesselId);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedVesselId]);

  const handleInjectFault = async (fault: string) => {
    setIsInjecting(true);
    try {
      const res = await fetch(`/api/v1/iot-engine/fault-injection?vessel_id=${selectedVesselId}&fault_type=${fault}`, {
        method: 'POST',
      });
      if (res.ok) {
        setActiveFault(fault);
        fetchTelemetry(selectedVesselId);
      }
    } catch (err) {
      console.error('Fault injection error:', err);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="erp-section">
      {/* 1. Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Cpu style={{ color: '#22d3ee' }} size={24} />
            IoT Engine Room Telemetry & Condition-Based Monitoring (CBM)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Pemantauan telemetri kamar mesin (ECR) 1Hz via satelit, analisis getaran ISO 10816 & deteksi anomali termodinamika
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedVesselId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedVesselId(id);
              fetchTelemetry(id);
            }}
            aria-label="Pilih Kapal Armada"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
            }}
          >
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.vessel_type} - {v.dwt.toLocaleString()} DWT)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Key Engine Health KPI Cards */}
      {telemetry && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Shaft Power & RPM */}
          <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Shaft Power & RPM
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#0284c7' }}>
              {telemetry.shaft_power_kw.toLocaleString()} kW
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Engine Speed:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{telemetry.engine_rpm} RPM</span>
            </div>
          </div>

          {/* Specific Fuel Oil Consumption (SFOC) */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: `1px solid ${telemetry.sfoc_deviation_percent > 3 ? '#fca5a5' : 'var(--border-color)'}`,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Specific Fuel Burn (SFOC)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: telemetry.sfoc_deviation_percent > 3 ? '#b91c1c' : '#059669' }}>
              {telemetry.sfoc_g_kwh} <span style={{ fontSize: '0.85rem' }}>g/kWh</span>
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Baseline Dev:</span>
              <span style={{ fontWeight: 600, color: telemetry.sfoc_deviation_percent > 3 ? '#b91c1c' : '#059669' }}>
                {telemetry.sfoc_deviation_percent > 0 ? `+${telemetry.sfoc_deviation_percent}%` : `${telemetry.sfoc_deviation_percent}%`}
              </span>
            </div>
          </div>

          {/* Turbocharger & Scavenge Pressure */}
          <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Scavenge Air Pressure
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: '#0891b2' }}>
              {telemetry.turbocharger.scavenge_air_pressure_bar} bar
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>T/C Speed:</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{telemetry.turbocharger.rpm.toLocaleString()} RPM</span>
            </div>
          </div>

          {/* Vibration RMS & ISO 10816 Status */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: `1px solid ${telemetry.vibration.status === 'NORMAL' ? 'var(--border-color)' : '#fca5a5'}`,
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              Vibration RMS (ISO 10816)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0.35rem 0', color: telemetry.vibration.status === 'NORMAL' ? '#059669' : '#b91c1c' }}>
              {telemetry.vibration.crankshaft_vibration_rms} mm/s
            </div>
            <div style={{ fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Limit: &lt; 4.5 mm/s</span>
              <span style={{ fontWeight: 600, color: telemetry.vibration.status === 'NORMAL' ? '#059669' : '#b91c1c' }}>
                Health: {telemetry.vibration.bearing_health_score}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Engine 6-Cylinder Visual Schematic */}
      {telemetry && (
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Flame size={18} style={{ color: '#d97706' }} />
              Skematik Termal & Tekanan Silinder Mesin Induk (Cylinder 1–6)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Model: {telemetry.engine_model}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {telemetry.cylinders.map((cyl) => {
              const isWarning = cyl.status !== 'NORMAL';
              return (
                <div
                  key={cyl.cylinder_num}
                  style={{
                    padding: '1rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: isWarning ? '#fef2f2' : '#f8fafc',
                    border: `1px solid ${isWarning ? '#fca5a5' : 'var(--border-color)'}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isWarning ? '#b91c1c' : '#0369a1', marginBottom: '0.5rem' }}>
                    CYLINDER #{cyl.cylinder_num}
                  </div>

                  {/* Temperature Graphic Bar */}
                  <div style={{ height: '70px', width: '24px', margin: '0 auto 0.75rem', backgroundColor: '#e2e8f0', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${Math.min(100, Math.max(10, ((cyl.exhaust_temp_c - 300) / 150) * 100))}%`,
                        backgroundColor: isWarning ? '#dc2626' : '#10b981',
                        transition: 'height 0.4s ease',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isWarning ? '#b91c1c' : 'var(--text-main)' }}>
                    {cyl.exhaust_temp_c}°C
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isWarning ? '#b91c1c' : 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Dev: {cyl.exhaust_deviation_c > 0 ? `+${cyl.exhaust_deviation_c}` : cyl.exhaust_deviation_c}°C
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#475569', borderTop: '1px solid var(--border-color)', paddingTop: '0.35rem' }}>
                    Pmax: <strong style={{ color: 'var(--text-main)' }}>{cyl.p_max_bar} bar</strong>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                    Pcomp: {cyl.p_comp_bar} bar
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Fault Injection & Diagnostic Simulator Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '1.25rem' }}>
        {/* Simulator Fault Injections */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            <Sliders size={18} style={{ color: '#0284c7' }} /> Simulator Uji Anomali Telemetri IoT
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Simulasikan kondisi anomali kamar mesin untuk menguji sistem peringatan dini CBM & respons otomatis AI Superintendent:
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleInjectFault('NONE')}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: activeFault === 'NONE' ? '#0284c7' : '#f1f5f9',
                color: activeFault === 'NONE' ? '#ffffff' : '#334155',
                border: `1px solid ${activeFault === 'NONE' ? '#0284c7' : '#cbd5e1'}`,
                cursor: 'pointer',
              }}
            >
              Kondisi Normal (Optimal)
            </button>
            <button
              onClick={() => handleInjectFault('INJECTOR_FOULING_CYL4')}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: activeFault === 'INJECTOR_FOULING_CYL4' ? '#dc2626' : '#fee2e2',
                color: activeFault === 'INJECTOR_FOULING_CYL4' ? '#ffffff' : '#991b1b',
                border: '1px solid #f87171',
                cursor: 'pointer',
              }}
            >
              Anomali Suhu Silinder #4 (+36°C)
            </button>
            <button
              onClick={() => handleInjectFault('COOLER_FOULING')}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: activeFault === 'COOLER_FOULING' ? '#d97706' : '#fef3c7',
                color: activeFault === 'COOLER_FOULING' ? '#ffffff' : '#92400e',
                border: '1px solid #fcd34d',
                cursor: 'pointer',
              }}
            >
              Penyumbatan Air Cooler Turbocharger
            </button>
            <button
              onClick={() => handleInjectFault('HIGH_VIBRATION')}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                backgroundColor: activeFault === 'HIGH_VIBRATION' ? '#dc2626' : '#fee2e2',
                color: activeFault === 'HIGH_VIBRATION' ? '#ffffff' : '#991b1b',
                border: '1px solid #f87171',
                cursor: 'pointer',
              }}
            >
              Getaran Abnormal Metal Duduk (5.2 mm/s)
            </button>
          </div>
        </div>

        {/* AI Diagnostic & CBM Recommendations */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            <ShieldCheck size={18} style={{ color: '#0284c7' }} />
            Rekomendasi Predictive CBM & Peringatan Dini
          </h3>

          {telemetry?.alerts && telemetry.alerts.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              {telemetry.alerts.map((al, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    fontSize: '0.8rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 500,
                  }}
                >
                  <AlertTriangle size={14} /> {al}
                </div>
              ))}
            </div>
          )}

          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: '#334155', lineHeight: '1.5' }}>
            {telemetry?.maintenance_recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.35rem' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
