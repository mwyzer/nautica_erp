import React from 'react';
import { Ship, Navigation, Fuel, AlertTriangle } from 'lucide-react';
import { Vessel, Voyage, BunkerLog } from '../types';

interface KpiGridProps {
  vessels: Vessel[];
  voyages: Voyage[];
  bunkerLogs: BunkerLog[];
}

export default function KpiGrid({ vessels, voyages, bunkerLogs }: KpiGridProps): React.JSX.Element {
  const activeVessels = vessels.filter(v => v.status === 'ACTIVE').length;
  const activeVoyages = voyages.filter(v => v.status === 'PLANNED' || v.status === 'IN_PROGRESS').length;
  const pendingClearances = voyages.filter(v => v.clearance_status === 'PENDING').length;
  const bunkerAnomalies = bunkerLogs.filter(b => b.anomaly_flag).length;

  return (
    <section className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Armada Aktif</span>
          <Ship size={20} color="var(--accent-cyan)" />
        </div>
        <div className="kpi-value">{activeVessels} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {vessels.length} Kapal</span></div>
        <div className="kpi-sub">Unit terpantau beroperasi</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Pelayaran Terjadwal</span>
          <Navigation size={20} color="var(--accent-teal)" />
        </div>
        <div className="kpi-value">{activeVoyages}</div>
        <div className="kpi-sub">{pendingClearances} menunggu otorisasi clearance</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Bunker Fuel Monitored</span>
          <Fuel size={20} color="var(--success)" />
        </div>
        <div className="kpi-value">{bunkerLogs.length}</div>
        <div className="kpi-sub">Total log konsumsi harian</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Anomali Konsumsi BBM</span>
          <AlertTriangle size={20} color={bunkerAnomalies > 0 ? "var(--warning)" : "var(--success)"} />
        </div>
        <div className="kpi-value" style={{ color: bunkerAnomalies > 0 ? "var(--warning)" : "var(--success)" }}>
          {bunkerAnomalies}
        </div>
        <div className="kpi-sub">Deviasi konsumsi &gt; 35% terdeteksi</div>
      </div>
    </section>
  );
}
