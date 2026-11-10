import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Ship, Navigation } from 'lucide-react';
import VesselModal from './VesselModal';

export default function FleetSection({ vessels, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleOpenAdd = () => {
    setSelectedVessel(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vessel) => {
    setSelectedVessel(vessel);
    setIsModalOpen(true);
  };

  const handleDelete = async (vessel) => {
    if (!window.confirm(`Yakin ingin menghapus kapal ${vessel.name} (${vessel.imo_number}) dari Master Fleet?`)) {
      return;
    }
    setDeletingId(vessel.id);
    try {
      const res = await fetch(`/api/v1/vessels/${vessel.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Gagal menghapus kapal.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ship size={20} color="var(--accent-cyan)" /> Master Data Armada Kapal (Fleet)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Daftar kapal niaga terdaftar, spesifikasi bobot mati DWT, konsumsi BBM, dan pelabuhan pangkalan.
          </p>
        </div>
        <button className="btn btn-ai" onClick={handleOpenAdd}>
          <Plus size={16} /> Tambah Kapal Baru
        </button>
      </div>

      <div className="grid-cards">
        {vessels.map(v => {
          const isMaint = v.status === 'IN_MAINTENANCE';
          return (
            <div key={v.id} className="vessel-card">
              <div>
                <div className="card-header">
                  <div>
                    <h4>{v.name}</h4>
                    <span className="imo">{v.imo_number} • {v.flag_state}</span>
                  </div>
                  <span className={`badge ${isMaint ? 'badge-maintenance' : 'badge-active'}`}>
                    {v.status}
                  </span>
                </div>
                <div>
                  <div className="spec-row"><span>Tipe Kapal</span><span>{v.vessel_type}</span></div>
                  <div className="spec-row"><span>Deadweight (DWT)</span><span>{v.dwt?.toLocaleString()} MT</span></div>
                  <div className="spec-row"><span>Kecepatan Jelajah</span><span>{v.avg_speed_knots} Knots</span></div>
                  <div className="spec-row"><span>Konsumsi BBM Nominal</span><span>{v.fuel_burn_rate_mt_per_day} MT / Hari</span></div>
                  <div className="spec-row"><span>Pelabuhan Terkini</span><span>{v.current_port}</span></div>
                </div>

                <div className="card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(v)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(v)}
                    disabled={deletingId === v.id}
                  >
                    <Trash2 size={13} /> {deletingId === v.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <VesselModal
        isOpen={isModalOpen}
        vesselToEdit={selectedVessel}
        onClose={() => setIsModalOpen(false)}
        onSaved={onRefresh}
      />
    </section>
  );
}
