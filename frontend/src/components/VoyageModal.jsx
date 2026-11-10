import React, { useState } from 'react';
import { X, Navigation, Save } from 'lucide-react';

export default function VoyageModal({ isOpen, onClose, vessels, onSaved }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + 3);

  const [formData, setFormData] = useState({
    voyage_number: `VOY-${new Date().getFullYear()}-JKT-SIN-${Math.floor(100 + Math.random() * 900)}`,
    vessel_id: vessels[0]?.id || 1,
    origin_port: 'IDJKT',
    destination_port: 'SGSIN',
    distance_nm: 525,
    departure_time: tomorrow.toISOString().slice(0, 16),
    estimated_arrival: arrival.toISOString().slice(0, 16),
    cargo_type: 'TEU Containers (General Cargo)',
    cargo_weight_mt: 15000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        vessel_id: parseInt(formData.vessel_id, 10),
        distance_nm: parseFloat(formData.distance_nm),
        cargo_weight_mt: parseFloat(formData.cargo_weight_mt),
        departure_time: new Date(formData.departure_time).toISOString(),
        estimated_arrival: new Date(formData.estimated_arrival).toISOString(),
        status: 'PLANNED',
        clearance_status: 'PENDING',
      };

      const res = await fetch('/api/v1/voyages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Gagal menjadwalkan pelayaran (${res.status})`);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={20} color="var(--accent-cyan)" />
            <h3>Jadwalkan Rencana Pelayaran Baru (New Voyage)</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: '#fca5a5', border: '1px solid var(--danger)', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nomor Pelayaran (Voyage Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VOY-2026-JKT-SIN-009"
                  className="form-control"
                  value={formData.voyage_number}
                  onChange={e => setFormData({ ...formData, voyage_number: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Kapal Armada (Assigned Vessel)</label>
                <select
                  className="form-control"
                  value={formData.vessel_id}
                  onChange={e => setFormData({ ...formData, vessel_id: e.target.value })}
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.imo_number} - {v.vessel_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pelabuhan Asal (Origin Port)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IDJKT"
                  className="form-control"
                  value={formData.origin_port}
                  onChange={e => setFormData({ ...formData, origin_port: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pelabuhan Tujuan (Destination Port)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SGSIN"
                  className="form-control"
                  value={formData.destination_port}
                  onChange={e => setFormData({ ...formData, destination_port: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jarak Tempuh Rute (Nautical Miles - NM)</label>
                <input
                  type="number"
                  step="10"
                  required
                  className="form-control"
                  value={formData.distance_nm}
                  onChange={e => setFormData({ ...formData, distance_nm: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Muatan / Kargo</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TEU Containers, CPO, Coal"
                  className="form-control"
                  value={formData.cargo_type}
                  onChange={e => setFormData({ ...formData, cargo_type: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Jadwal Keberangkatan (ETD)</label>
                <input
                  type="datetime-local"
                  required
                  className="form-control"
                  value={formData.departure_time}
                  onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimasi Tiba (ETA)</label>
                <input
                  type="datetime-local"
                  required
                  className="form-control"
                  value={formData.estimated_arrival}
                  onChange={e => setFormData({ ...formData, estimated_arrival: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Batal
            </button>
            <button type="submit" className="btn btn-ai" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Menjadwalkan...' : 'Jadwalkan Pelayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
