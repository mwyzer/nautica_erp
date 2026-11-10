import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock, ShieldAlert, Plus } from 'lucide-react';
import { MaintenanceTicket, Vessel } from '../types';

interface MaintenanceSectionProps {
  tickets: MaintenanceTicket[];
  vessels: Vessel[];
  onRefresh: () => void | Promise<void>;
}

export default function MaintenanceSection({ tickets, vessels, onRefresh }: MaintenanceSectionProps): React.JSX.Element {
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const handleResolve = async (ticketId: number) => {
    setResolvingId(ticketId);
    try {
      const res = await fetch(`/api/v1/maintenance/${ticketId}/resolve`, { method: 'POST' });
      if (!res.ok) throw new Error('Gagal memperbarui status perbaikan.');
      await onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  const getVesselName = (vesselId: number) => {
    const v = vessels.find(x => x.id === vesselId);
    return v ? v.name : `Vessel #${vesselId}`;
  };

  return (
    <section>
      <div style={{
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
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)' }}>
            <Wrench size={24} color="var(--accent-cyan)" /> Maintenance Management (PMS & Defect Log)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Jadwal perawatan terencana (PMS), log cacat mesin, dan pelacakan kelayakan kelaiklautan SOLAS Chapter II-1.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Kapal</th>
              <th>Peralatan / Komponen</th>
              <th>Tingkat Keparahan</th>
              <th>Status Kerja</th>
              <th>Deskripsi Cacat Teknis</th>
              <th>Pengaruh Clearance</th>
              <th>Aksi Teknis</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Tidak ada tiket perbaikan aktif. Semua mesin beroperasi normal.</td></tr>
            ) : (
              tickets.map(t => {
                const isCritical = t.severity === 'CRITICAL' || t.severity === 'HIGH';
                const isResolved = t.status === 'RESOLVED';

                return (
                  <tr key={t.id} style={{ background: isCritical && !isResolved ? 'rgba(239, 68, 68, 0.05)' : undefined }}>
                    <td><strong>{getVesselName(t.vessel_id)}</strong></td>
                    <td><code>{t.equipment_name}</code></td>
                    <td>
                      <span className={`badge ${
                        t.severity === 'CRITICAL' ? 'badge-rejected' :
                        t.severity === 'HIGH' ? 'badge-conditional' : 'badge-active'
                      }`}>
                        {t.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${isResolved ? 'badge-approved' : 'badge-pending'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '320px' }}>
                      {t.description}
                    </td>
                    <td>
                      {t.prevents_clearance && !isResolved ? (
                        <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <ShieldAlert size={12} /> BLOKIR IZIN BERLAYAR
                        </span>
                      ) : (
                        <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={12} /> Seaworthy
                        </span>
                      )}
                    </td>
                    <td>
                      {!isResolved ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleResolve(t.id)}
                          disabled={resolvingId === t.id}
                        >
                          <CheckCircle size={12} /> {resolvingId === t.id ? 'Memproses...' : 'Tandai Selesai'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>Tuntas diperbaiki</span>
                      )}
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
