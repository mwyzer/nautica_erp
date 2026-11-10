import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Lock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  FileCheck,
} from 'lucide-react';
import { Vessel, HighRiskZone, PiracyIncident, VesselSecurityReadiness } from '../types';

interface PiracySecuritySectionProps {
  vessels: Vessel[];
}

export default function PiracySecuritySection({ vessels }: PiracySecuritySectionProps): React.JSX.Element {
  const [selectedVesselId, setSelectedVesselId] = useState<number>(vessels[0]?.id || 1);
  const [hraZones, setHraZones] = useState<HighRiskZone[]>([]);
  const [incidents, setIncidents] = useState<PiracyIncident[]>([]);
  const [readiness, setReadiness] = useState<VesselSecurityReadiness | null>(null);
  const [drillMessage, setDrillMessage] = useState<string | null>(null);
  const [isDrilling, setIsDrilling] = useState<boolean>(false);

  const fetchData = async (vesselId: number) => {
    try {
      const [threatRes, readinessRes] = await Promise.all([
        fetch('/api/v1/piracy-security/threat-map').then((r) => r.json()),
        fetch(`/api/v1/piracy-security/readiness/${vesselId}`).then((r) => r.json()),
      ]);
      setHraZones(threatRes.hra_zones || []);
      setIncidents(threatRes.recent_incidents || []);
      setReadiness(readinessRes);
    } catch (err) {
      console.error('Failed to load piracy threat intelligence:', err);
    }
  };

  useEffect(() => {
    fetchData(selectedVesselId);
  }, [selectedVesselId]);

  const handleDrillCitadel = async () => {
    setIsDrilling(true);
    try {
      const res = await fetch(`/api/v1/piracy-security/drill-citadel/${selectedVesselId}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDrillMessage(data.message);
        fetchData(selectedVesselId);
      }
    } catch (err) {
      console.error('Drill error:', err);
    } finally {
      setIsDrilling(false);
    }
  };

  return (
    <div className="erp-section">
      {/* 1. Header Banner */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert style={{ color: '#ef4444' }} size={24} />
            Piracy & High-Risk Area (HRA) Security Intelligence (BMP5 / IMB)
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Pemantauan ancaman perompakan global IMB, koridor keamanan IRTC, kesiapan Citadel & pengerasan fisik BMP5
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={selectedVesselId}
            onChange={(e) => setSelectedVesselId(Number(e.target.value))}
            aria-label="Pilih Kapal untuk Audit BMP5"
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
                {v.name} ({v.vessel_type})
              </option>
            ))}
          </select>

          <button
            onClick={handleDrillCitadel}
            disabled={isDrilling}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Lock size={15} /> Latihan Darurat Citadel (Drill)
          </button>
        </div>
      </div>

      {drillMessage && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> {drillMessage}
        </div>
      )}

      {/* 2. Vessel BMP5 Hardening Status Card */}
      {readiness && (
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} />
              Status Kesiapan Pertahanan Fisik BMP5: {readiness.vessel_name}
            </h3>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid #bbf7d0',
              }}
            >
              BMP5 Compliance: {readiness.bmp5_compliance_percent}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kawat Berduri (Razor Wire):</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: readiness.razor_wire_installed ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <CheckCircle2 size={15} /> Terpasang di Lambung
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Water Cannons:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: readiness.water_cannons_pressurized ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <CheckCircle2 size={15} /> Bertekanan Siap Pakai
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Citadel (Ruang Aman):</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <Lock size={15} /> Terkunci ({readiness.citadel_days_provisions} Hari Logistik)
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Regu Bersenjata (PCASP):</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: readiness.armed_security_onboard ? '#059669' : '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <Users size={15} /> {readiness.armed_security_onboard ? `${readiness.pcasp_guard_count} Personel PCASP` : 'Tanpa Pengawal'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Latihan Terakhir:</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {readiness.security_drill_last_date}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Global High Risk Areas (HRA) Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(320px, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            <Compass size={18} style={{ color: '#dc2626' }} /> Zona Risiko Tinggi Maritim Global (HRA Zones)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {hraZones.map((zone) => (
              <div
                key={zone.zone_id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${zone.risk_level === 'CRITICAL' ? '#dc2626' : zone.risk_level === 'HIGH' ? '#d97706' : '#0284c7'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>{zone.zone_name}</span>
                  <span
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: zone.risk_level === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                      color: zone.risk_level === 'CRITICAL' ? '#991b1b' : '#92400e',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {zone.risk_level}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                  {zone.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  <span>Min Transit Speed: <strong>{zone.recommended_min_speed_knots} kts</strong></span>
                  <span>Hotline: <strong>{zone.ukmto_contact}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Piracy Incidents Feed */}
        <div style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            <Radio size={18} style={{ color: '#d97706' }} /> Feed Insiden Terkini IMB Piracy Reporting Centre
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  padding: '0.85rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{inc.location_name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{inc.incident_date}</span>
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {inc.attack_type} ({inc.vessel_type})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.35rem' }}>
                  Respon: {inc.countermeasure_applied}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>
                  Status: {inc.outcome}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
