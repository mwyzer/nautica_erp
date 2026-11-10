import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Calculator,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';
import { CharterpartyContract, LaytimeCalculation } from '../types';

export default function CharteringSection(): React.JSX.Element {
  const [contracts, setContracts] = useState<CharterpartyContract[]>([]);

  // Laytime Calculator State
  const [allowedHours, setAllowedHours] = useState('72');
  const [usedHours, setUsedHours] = useState('86.5');
  const [demurrageRate, setDemurrageRate] = useState('18000');
  const [despatchRate, setDespatchRate] = useState('9000');
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/chartering/contracts')
      .then(res => res.json())
      .then(data => setContracts(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching chartering contracts:', err));
  }, []);

  const handleCalculateLaytime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/chartering/calculate-laytime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allowed_hours: parseFloat(allowedHours) || 0,
          used_hours: parseFloat(usedHours) || 0,
          demurrage_rate_per_day: parseFloat(demurrageRate) || 0,
          despatch_rate_per_day: parseFloat(despatchRate) || 0,
        }),
      });
      const data = await res.json();
      setCalcResult(data);
    } catch (err) {
      console.error('Laytime calculation error:', err);
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
            <FileSpreadsheet size={24} color="var(--accent-cyan)" /> Commercial Chartering &amp; Laytime Calculator
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manajemen kontrak sewa kapal (Time &amp; Voyage Charter), perhitungan denda keterlambatan bongkar muat (Demurrage), dan klaim Despatch.
          </p>
        </div>
      </div>

      {/* Main Grid: Contracts List (Left) + Laytime Calculator (Right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: '1.25rem',
        }}
      >
        {/* Left: Active Charterparty Contracts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--accent-teal)" /> Kontrak Charterparty Aktif
            </h3>

            <div className="table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>KONTRAK &amp; CHARTERER</th>
                    <th>TIPE KONTRAK</th>
                    <th>KAPAL &amp; KARGO</th>
                    <th>TARIF SEWA</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{c.contract_number}</div>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{c.charterer_name}</div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'rgba(0, 180, 216, 0.12)',
                            color: 'var(--accent-teal)',
                          }}
                        >
                          {c.contract_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.vessel_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.cargo_description}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                          ${c.rate_amount_usd.toLocaleString()}
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {c.contract_type === 'TIME_CHARTER' ? '/hari' : '/MT'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            c.status === 'FIXED_ACTIVE' ? 'badge-success' : 'badge-warning'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Interactive Demurrage / Despatch Laytime Calculator */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={18} color="var(--accent-cyan)" /> Kalkulator Laytime Pelabuhan
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Hitung klaim finansial Demurrage (kelebihan jam pelabuhan) atau Despatch (penghematan jam).
          </p>

          <form onSubmit={handleCalculateLaytime} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Batas Laytime Diizinkan (Jam)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="form-control"
                  value={allowedHours}
                  onChange={e => setAllowedHours(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Total Waktu Terpakai (Jam)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="form-control"
                  value={usedHours}
                  onChange={e => setUsedHours(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Tarif Demurrage ($/Hari)
                </label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={demurrageRate}
                  onChange={e => setDemurrageRate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Tarif Despatch ($/Hari)
                </label>
                <input
                  type="number"
                  required
                  className="form-control"
                  value={despatchRate}
                  onChange={e => setDespatchRate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Hitung Neraca Laytime (Demurrage / Despatch)
            </button>
          </form>

          {/* Calculation Result Display */}
          {calcResult && (
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                border:
                  calcResult.result_type === 'DEMURRAGE'
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid rgba(16, 185, 129, 0.4)',
                background:
                  calcResult.result_type === 'DEMURRAGE'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: calcResult.result_type === 'DEMURRAGE' ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  HASIL KLAIM: {calcResult.result_type}
                </span>
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: calcResult.result_type === 'DEMURRAGE' ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  ${calcResult.settlement_amount_usd.toLocaleString('en-US')} USD
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.4rem', lineHeight: 1.4 }}>
                {calcResult.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
