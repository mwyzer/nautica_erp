import React, { useState } from 'react';
import { Zap, RefreshCw, Plus, Trash2, Calendar } from 'lucide-react';
import VoyageModal from './VoyageModal';

export default function VoyagesSection({ voyages, vessels, onAuditClick, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (voyage) => {
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
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--accent-cyan)" /> Rencana Pelayaran & AI Port Clearance
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Jadwalkan rute baru atau jalankan audit kelaiklautan instan berbasis SOLAS, STCW, dan cadangan BBM.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={onRefresh}>
            <RefreshCw size={14} /> Segarkan
          </button>
          <button className="btn btn-ai" onClick={() => setIsModalOpen(true)}>
            <Plus size={15} /> Jadwalkan Pelayaran Baru
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
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Belum ada pelayaran aktif. Silakan jadwalkan pelayaran baru.</td></tr>
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
