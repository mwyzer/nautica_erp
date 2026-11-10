import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';

export default function VoyagesSection({ voyages, onAuditClick, onRefresh }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Rencana Pelayaran & Otorisasi Bertolak</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Klik "AI Clearance Audit" untuk memeriksa kelayakan pelayaran secara instan.
          </p>
        </div>
        <button className="btn" onClick={onRefresh}>
          <RefreshCw size={14} /> Segarkan Data
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nomor Pelayaran</th>
              <th>Nama Kapal</th>
              <th>Rute (UN/LOCODE)</th>
              <th>Jarak</th>
              <th>Kargo Muatan</th>
              <th>Status Clearance</th>
              <th>Aksi Otomasi</th>
            </tr>
          </thead>
          <tbody>
            {voyages.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Memuat jadwal pelayaran...</td></tr>
            ) : (
              voyages.map(voy => {
                const badgeClass =
                  voy.clearance_status === 'APPROVED'
                    ? 'badge-approved'
                    : voy.clearance_status === 'REJECTED'
                    ? 'badge-rejected'
                    : voy.clearance_status === 'CONDITIONAL'
                    ? 'badge-conditional'
                    : 'badge-pending';

                return (
                  <tr key={voy.id}>
                    <td><strong>{voy.voyage_number}</strong></td>
                    <td>{voy.vessel ? voy.vessel.name : `Vessel #${voy.vessel_id}`}</td>
                    <td>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{voy.origin_port}</span>
                      {' → '}
                      <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{voy.destination_port}</span>
                    </td>
                    <td>{voy.distance_nm} NM</td>
                    <td>{voy.cargo_weight_mt?.toLocaleString()} MT ({voy.cargo_type})</td>
                    <td><span className={`badge ${badgeClass}`}>{voy.clearance_status}</span></td>
                    <td>
                      <button className="btn btn-ai" onClick={() => onAuditClick(voy.id)}>
                        <Zap size={14} /> AI Clearance Audit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
