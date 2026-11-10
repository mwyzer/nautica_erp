import React from 'react';

export default function FleetSection({ vessels }) {
  return (
    <section>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Armada Niaga Nautical ERP</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Spesifikasi teknis, bobot mati DWT, dan konsumsi harian kapal.
        </p>
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
                  <div className="spec-row"><span>Pelabuhan Saat Ini</span><span>{v.current_port}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
