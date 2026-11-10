import React from 'react';
import { Anchor, Compass, Fuel, ShieldCheck } from 'lucide-react';

export default function KpiGrid({ vessels, voyages, bunkerLogs }) {
  const anomalies = bunkerLogs.filter(b => b.anomaly_flag);

  return (
    <section className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-info">
          <h3>Armada Aktif</h3>
          <div className="kpi-val">{vessels.length}</div>
        </div>
        <Anchor size={36} color="#00e5ff" opacity={0.8} />
      </div>

      <div className="kpi-card">
        <div className="kpi-info">
          <h3>Rute Pelayaran</h3>
          <div className="kpi-val">{voyages.length}</div>
        </div>
        <Compass size={36} color="#00b4d8" opacity={0.8} />
      </div>

      <div className="kpi-card">
        <div className="kpi-info">
          <h3>Radar Anomali Bunker</h3>
          <div className="kpi-val" style={{ color: anomalies.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {anomalies.length > 0 ? `${anomalies.length} Alert` : 'Normal'}
          </div>
        </div>
        <Fuel size={36} color={anomalies.length > 0 ? 'var(--danger)' : '#00e5ff'} opacity={0.8} />
      </div>

      <div className="kpi-card">
        <div className="kpi-info">
          <h3>Kepatuhan STCW</h3>
          <div className="kpi-val" style={{ color: 'var(--warning)' }}>Audit Wajib</div>
        </div>
        <ShieldCheck size={36} color="#f59e0b" opacity={0.8} />
      </div>
    </section>
  );
}
