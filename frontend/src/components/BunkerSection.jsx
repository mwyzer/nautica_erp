import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function BunkerSection({ bunkerLogs }) {
  return (
    <section>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Log Bunker & Deteksi Anomali BBM</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Algoritma mendeteksi jika konsumsi harian melebihi +35% dari konsumsi normal kapal.
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kapal</th>
              <th>Jenis Bahan Bakar</th>
              <th>Stok Tersedia (ROB)</th>
              <th>Konsumsi Terakhir</th>
              <th>Kecepatan</th>
              <th>Tanggal Catat</th>
              <th>Status Radar</th>
            </tr>
          </thead>
          <tbody>
            {bunkerLogs.map(l => (
              <tr key={l.id}>
                <td>Vessel #{l.vessel_id}</td>
                <td>{l.fuel_type}</td>
                <td><strong>{l.current_rob_mt} MT</strong></td>
                <td>{l.daily_consumption_mt} MT/hari</td>
                <td>{l.speed_knots} knots</td>
                <td>{new Date(l.recorded_at).toLocaleDateString()}</td>
                <td>
                  {l.anomaly_flag ? (
                    <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertTriangle size={12} /> {l.anomaly_reason || 'ANOMALY'}
                    </span>
                  ) : (
                    <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={12} /> Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
