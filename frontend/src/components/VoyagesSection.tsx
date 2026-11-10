import React, { useState } from 'react';
import { Zap, RefreshCw, Plus, Trash2, Calendar } from 'lucide-react';
import { Voyage, Vessel } from '../types';
import VoyageModal from './VoyageModal';

interface VoyagesSectionProps {
  voyages: Voyage[];
  vessels: Vessel[];
  onAuditClick: (voyageId: number) => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
}

export default function VoyagesSection({
  voyages,
  vessels,
  onAuditClick,
  onRefresh
}: VoyagesSectionProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (voyage: Voyage) => {
    if (!window.confirm(`Yakin ingin membatalkan/menghapus pelayaran ${voyage.voyage_number}?`)) {
      return;
    }
    setDeletingId(voyage.id);
    try {
      const res = await fetch(`/api/v1/voyages/${voyage.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Gagal menghapus pelayaran.');
      }
      await onRefresh();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      {/* Header with prominent Action Button */}
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
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)' }}>
            <Calendar size={24} color="var(--accent-cyan)" /> Rencana Pelayaran & AI Port Clearance
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Jadwalkan rute baru atau jalankan audit kelaiklautan instan berbasis SOLAS, STCW, dan cadangan BBM.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onRefresh}>
            <RefreshCw size={14} /> Segarkan
          </button>
          <button
            className="btn btn-ai"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.95rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> + Jadwalkan Pelayaran Baru
          </button>
        </div>
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
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Belum ada pelayaran aktif.</p>
                  <button className="btn btn-ai" onClick={() => setIsModalOpen(true)}>
                    <Plus size={15} /> + Buat Rencana Pelayaran Pertama
                  </button>
                </td>
              </tr>
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
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button className="btn btn-ai btn-sm" onClick={() => onAuditClick(voy.id)}>
                          <Zap size={13} /> AI Audit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(voy)}
                          disabled={deletingId === voy.id}
                          title="Hapus / Batalkan Pelayaran"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <VoyageModal
        isOpen={isModalOpen}
        vessels={vessels}
        onClose={() => setIsModalOpen(false)}
        onSaved={onRefresh}
      />
    </section>
  );
}
