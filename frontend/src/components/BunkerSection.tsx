import React from 'react';
import { Fuel, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BunkerLog } from '../types';

interface BunkerSectionProps {
  bunkerLogs: BunkerLog[];
}

export default function BunkerSection({ bunkerLogs }: BunkerSectionProps): React.JSX.Element {
  return (
    <section>
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Fuel size={24} color="var(--success)" /> Pemantauan Bahan Bakar (Bunker & Noon Reports)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Radar deteksi otomatis kejanggalan konsumsi BBM (&gt;35% di atas standar nominal) untuk pencegahan kerugian operasional.
        </p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Kapal</th>
              <th>Tipe Bahan Bakar</th>
              <th>Sisa di Kapal (ROB)</th>
              <th>Konsumsi 24 Jam</th>
              <th>Kecepatan</th>
              <th>Status Anomali</th>
              <th>Analisis Sistem</th>
            </tr>
          </thead>
          <tbody>
            {bunkerLogs.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Memuat data bunker...</td></tr>
            ) : (
              bunkerLogs.map(log => (
                <tr key={log.id} style={{ background: log.anomaly_flag ? 'rgba(245, 158, 11, 0.05)' : undefined }}>
                  <td><strong>Kapal #{log.vessel_id}</strong></td>
                  <td><span className="badge badge-active">{log.fuel_type}</span></td>
                  <td><strong>{log.current_rob_mt} MT</strong></td>
                  <td>{log.daily_consumption_mt} MT/hari</td>
                  <td>{log.speed_knots} Knots</td>
                  <td>
                    {log.anomaly_flag ? (
                      <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> ANOMALI
                      </span>
                    ) : (
                      <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Normal
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: log.anomaly_flag ? '#fbbf24' : 'var(--text-muted)' }}>
                    {log.anomaly_reason || 'Pola konsumsi BBM efisien dan sesuai kurva hambatan lambung.'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
