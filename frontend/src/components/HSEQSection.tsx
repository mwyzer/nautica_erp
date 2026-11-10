import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  LifeBuoy,
  Eye,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { HSEQIncident, PSCInspectionChecklist } from '../types';

export default function HSEQSection(): React.JSX.Element {
  const [incidents, setIncidents] = useState<HSEQIncident[]>([]);
  const [pscList, setPscList] = useState<PSCInspectionChecklist[]>([]);
  const [tab, setTab] = useState<'incidents' | 'psc'>('incidents');

  useEffect(() => {
    fetch('/api/v1/hseq/incidents')
      .then(res => res.json())
      .then(data => setIncidents(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching incidents:', err));

    fetch('/api/v1/hseq/psc-checklists')
      .then(res => res.json())
      .then(data => setPscList(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching PSC checklists:', err));
  }, []);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'NEAR_MISS':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-teal)', label: 'Near-Miss (Hampir Celaka)' };
      case 'MINOR':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'Minor (Ringan)' };
      case 'SERIOUS':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'Serious (Serius)' };
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.3)', color: '#ff4d4f', label: 'Critical (Kritis)' };
      default:
        return { bg: '#64748b22', color: '#fff', label: severity };
    }
  };

  const getPscRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW_RISK':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', label: 'Risiko Penahanan Rendah (Low Risk)' };
      case 'HIGH_RISK':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'Risiko Tinggi Ditahan (High Detention Risk)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: level };
    }
  };

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
            <ShieldAlert size={24} color="#f59e0b" /> HSEQ Safety &amp; Port State Control (PSC)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manajemen Keselamatan Maritim (ISM Code), Investigasi Near-Miss &amp; Insiden, serta Audit Kesiapan Inspeksi PSC (Tokyo MOU &amp; Syahbandar).
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setTab('incidents')}
            className={`btn ${tab === 'incidents' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', height: '36px' }}
          >
            Register Insiden &amp; Near-Miss
          </button>
          <button
            onClick={() => setTab('psc')}
            className={`btn ${tab === 'psc' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.82rem', height: '36px' }}
          >
            Audit Kesiapan PSC MOU
          </button>
        </div>
      </div>

      {tab === 'incidents' ? (
        /* Incidents View */
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>NOMOR &amp; KAPAL</th>
                <th>TINGKAT KEPARAHAN</th>
                <th>KATEGORI</th>
                <th>DESKRIPSI INSIDEN MARITIM</th>
                <th>TINDAKAN KOREKTIF (ISM CODE)</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => {
                const sev = getSeverityBadge(inc.severity);
                return (
                  <tr key={inc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{inc.incident_number}</div>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{inc.vessel_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inc.date_occurred}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: sev.bg,
                          color: sev.color,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'inline-block',
                        }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {inc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '320px', lineHeight: 1.4 }}>
                      {inc.description}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--accent-teal)', maxWidth: '280px', lineHeight: 1.4 }}>
                      {inc.corrective_action}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          inc.status === 'CLOSED'
                            ? 'badge-success'
                            : inc.status === 'ACTION_TAKEN'
                            ? 'badge-info'
                            : 'badge-warning'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* PSC Checklist View */
        <div className="table-responsive">
          <table className="erp-table">
            <thead>
              <tr>
                <th>KAPAL &amp; PELABUHAN TARGET</th>
                <th>REGIME MOU INSPEKSI</th>
                <th>TANGGAL AUDIT</th>
                <th>DEFISIENSI DITEMUKAN</th>
                <th>KESIAPAN KONVENSI</th>
                <th>TINGKAT RISIKO DITAHAN (DETENTION)</th>
              </tr>
            </thead>
            <tbody>
              {pscList.map(psc => {
                const risk = getPscRiskBadge(psc.detention_risk_level);
                return (
                  <tr key={psc.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{psc.vessel_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>{psc.target_port}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{psc.mou_regime.replace('_', ' ')}</td>
                    <td>{psc.inspection_date}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: psc.deficiencies_found > 0 ? 'var(--danger)' : 'var(--success)',
                        }}
                      >
                        {psc.deficiencies_found} Temuan Cacat
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: psc.solas_ready ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: psc.solas_ready ? 'var(--success)' : 'var(--danger)' }}>
                          SOLAS: {psc.solas_ready ? 'OK' : 'FAIL'}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: psc.stcw_ready ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: psc.stcw_ready ? 'var(--success)' : 'var(--danger)' }}>
                          STCW: {psc.stcw_ready ? 'OK' : 'FAIL'}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: psc.marpol_ready ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: psc.marpol_ready ? 'var(--success)' : 'var(--danger)' }}>
                          MARPOL: {psc.marpol_ready ? 'OK' : 'FAIL'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: risk.bg,
                          color: risk.color,
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          display: 'inline-block',
                        }}
                      >
                        {risk.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
