import React, { useState, useEffect } from 'react';
import { X, Ship, Save } from 'lucide-react';

export default function VesselModal({ isOpen, onClose, vesselToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    imo_number: '',
    vessel_type: 'CONTAINER',
    dwt: 25000,
    flag_state: 'Indonesia',
    status: 'ACTIVE',
    current_port: 'IDJKT',
    avg_speed_knots: 14.5,
    fuel_burn_rate_mt_per_day: 22.0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vesselToEdit) {
      setFormData({
        name: vesselToEdit.name || '',
        imo_number: vesselToEdit.imo_number || '',
        vessel_type: vesselToEdit.vessel_type || 'CONTAINER',
        dwt: vesselToEdit.dwt || 25000,
        flag_state: vesselToEdit.flag_state || 'Indonesia',
        status: vesselToEdit.status || 'ACTIVE',
        current_port: vesselToEdit.current_port || 'IDJKT',
        avg_speed_knots: vesselToEdit.avg_speed_knots || 14.5,
        fuel_burn_rate_mt_per_day: vesselToEdit.fuel_burn_rate_mt_per_day || 22.0,
      });
    } else {
      setFormData({
        name: '',
        imo_number: '',
        vessel_type: 'CONTAINER',
        dwt: 25000,
        flag_state: 'Indonesia',
        status: 'ACTIVE',
        current_port: 'IDJKT',
        avg_speed_knots: 14.5,
        fuel_burn_rate_mt_per_day: 22.0,
      });
    }
    setError(null);
  }, [vesselToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const isEdit = Boolean(vesselToEdit?.id);
      const url = isEdit ? `/api/v1/vessels/${vesselToEdit.id}` : '/api/v1/vessels';
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        dwt: parseFloat(formData.dwt),
        avg_speed_knots: parseFloat(formData.avg_speed_knots),
        fuel_burn_rate_mt_per_day: parseFloat(formData.fuel_burn_rate_mt_per_day),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Gagal menyimpan data kapal (${res.status})`);
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
            <Ship size={20} color="var(--accent-cyan)" />
            <h3>{vesselToEdit ? 'Edit Data Master Kapal' : 'Pendaftaran Kapal Baru (Master Fleet)'}</h3>
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
                <label className="form-label">Nama Kapal (Vessel Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MV Samudra Perkasa"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nomor IMO (International Maritime Org)</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(vesselToEdit)}
                  placeholder="e.g. IMO9991234"
                  className="form-control"
                  value={formData.imo_number}
                  onChange={e => setFormData({ ...formData, imo_number: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipe Kapal</label>
                <select
                  className="form-control"
                  value={formData.vessel_type}
                  onChange={e => setFormData({ ...formData, vessel_type: e.target.value })}
                >
                  <option value="CONTAINER">CONTAINER</option>
                  <option value="BULK_CARRIER">BULK_CARRIER</option>
                  <option value="TANKER">TANKER</option>
                  <option value="TUG_BOAT">TUG_BOAT</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status Operasional</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="MOORED">MOORED</option>
                  <option value="IN_MAINTENANCE">IN_MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Deadweight Tonnage (DWT) MT</label>
                <input
                  type="number"
                  step="100"
                  required
                  className="form-control"
                  value={formData.dwt}
                  onChange={e => setFormData({ ...formData, dwt: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pelabuhan Saat Ini (UN/LOCODE)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IDJKT, SGSIN, IDSUB"
                  className="form-control"
                  value={formData.current_port}
                  onChange={e => setFormData({ ...formData, current_port: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Kecepatan Jelajah Rata-rata (Knots)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="form-control"
                  value={formData.avg_speed_knots}
                  onChange={e => setFormData({ ...formData, avg_speed_knots: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Konsumsi BBM Nominal (MT / Hari)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="form-control"
                  value={formData.fuel_burn_rate_mt_per_day}
                  onChange={e => setFormData({ ...formData, fuel_burn_rate_mt_per_day: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Batal
            </button>
            <button type="submit" className="btn btn-ai" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Data Kapal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
