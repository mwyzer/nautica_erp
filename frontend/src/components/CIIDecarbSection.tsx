import React, { useState, useEffect } from 'react';
import {
  Leaf,
  Wind,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info,
  ShieldAlert,
  BarChart3,
  Download,
  Flame
} from 'lucide-react';
import { CIIRatingData } from '../types';

export default function CIIDecarbSection(): React.JSX.Element {
  const [ciiData, setCiiData] = useState<CIIRatingData[]>([]);
  const [filterRating, setFilterRating] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/v1/cii/ratings')
      .then(res => res.json())
      .then(data => setCiiData(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching CII data:', err));
  }, []);

  const getRatingBadge = (band: string) => {
    switch (band) {
      case 'A':
        return { bg: '#10b981', color: '#fff', label: 'Band A (Major Superior)' };
      case 'B':
        return { bg: '#34d399', color: '#0f172a', label: 'Band B (Minor Superior)' };
      case 'C':
        return { bg: '#38bdf8', color: '#0f172a', label: 'Band C (Moderate / Required)' };
      case 'D':
        return { bg: '#f59e0b', color: '#fff', label: 'Band D (Inferior - Warning)' };
      case 'E':
        return { bg: '#ef4444', color: '#fff', label: 'Band E (Non-Compliant)' };
      default:
        return { bg: '#64748b', color: '#fff', label: band };
    }
  };

  const filtered = ciiData.filter(d => filterRating === 'ALL' || d.rating_band === filterRating);
  const totalFleetCo2 = ciiData.reduce((acc, curr) => acc + curr.total_co2_emissions_mt, 0);
  const nonCompliantCount = ciiData.filter(d => d.rating_band === 'D' || d.rating_band === 'E').length;
  const totalEuEts = ciiData.reduce((acc, curr) => acc + curr.eu_ets_allowance_eur, 0);

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
            <Leaf size={24} color="#10b981" /> IMO Decarbonization &amp; CII Rating Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Pengawasan emisi karbon IMO 2030 (MARPOL Annex VI), Carbon Intensity Indicator (Rating A–E), SEEMP Part III, dan EU ETS Carbon Allowances.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '38px', fontSize: '0.82rem' }}
          >
            <Download size={15} /> Export Laporan Emisi IMO
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Emisi CO₂ Armada (YTD)
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
            {totalFleetCo2.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span style={{ fontSize: '0.9rem' }}>MT CO₂</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>Emisi bahan bakar VLSFO &amp; MGO</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Kapal Kategori Berisiko (Band D / E)
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: nonCompliantCount > 0 ? '#f59e0b' : '#10b981', marginTop: '0.25rem' }}>
            {nonCompliantCount} Kapal
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Wajib menyusun rencana korektif SEEMP III</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Estimasi Liabilitas EU ETS
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            €{totalEuEts.toLocaleString('en-US')}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kewajiban kuota karbon pelabuhan Eropa</span>
        </div>
      </div>

      {/* Filter and Visual Rating Scale */}
      <div
        style={{
          background: 'var(--bg-card)',
          padding: '1rem 1.3rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '6px' }}>Filter Rating Band:</span>
          {['ALL', 'A', 'B', 'C', 'D', 'E'].map(band => (
            <button
              key={band}
              onClick={() => setFilterRating(band)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: filterRating === band ? '1px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.1)',
                background: filterRating === band ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                color: filterRating === band ? 'var(--accent-cyan)' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {band === 'ALL' ? 'Semua Band' : `Band ${band}`}
            </button>
          ))}
        </div>

        {/* IMO 2026 Band Reference */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {['A', 'B', 'C', 'D', 'E'].map(b => {
            const badge = getRatingBadge(b);
            return (
              <span
                key={b}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: badge.bg,
                  color: badge.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                {b}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>NAMA KAPAL</th>
              <th>TIPE &amp; DWT</th>
              <th>JARAK (NM)</th>
              <th>EMISI CO₂ (MT)</th>
              <th>ATTAINED CII</th>
              <th>REQUIRED CII</th>
              <th>IMO RATING</th>
              <th>SEEMP PART III</th>
              <th>EU ETS (€)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const badge = getRatingBadge(row.rating_band);
              return (
                <tr key={row.vessel_id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{row.vessel_name}</td>
                  <td>
                    <div>{row.vessel_type}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.dwt.toLocaleString()} DWT</div>
                  </td>
                  <td>{row.total_distance_nm.toLocaleString()} NM</td>
                  <td style={{ fontWeight: 600, color: 'var(--warning)' }}>
                    {row.total_co2_emissions_mt.toFixed(1)} MT
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {row.attained_cii.toFixed(2)}
                  </td>
                  <td style={{ color: '#94a3b8' }}>{row.required_cii.toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: badge.bg,
                        color: badge.color,
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'inline-block',
                      }}
                    >
                      {row.rating_band}
                    </span>
                  </td>
                  <td>
                    {row.seemp_plan_required ? (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> WAJIB RENCANA KOREKTIF
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> COMPLIANT
                      </span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>€{row.eu_ets_allowance_eur.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
