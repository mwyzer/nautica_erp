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
      {/* 1. Armada Aktif */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Armada Aktif</span>
          <div className="kpi-icon-badge kpi-icon-cyan">
            <Ship size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <div className="kpi-value">
            {activeVessels}
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
              / {vessels.length} Kapal
            </span>
          </div>
          <div className="kpi-sub">Unit kapal terpantau aktif beroperasi</div>
        </div>
      </div>

      {/* 2. Pelayaran Terjadwal */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Pelayaran Terjadwal</span>
          <div className="kpi-icon-badge kpi-icon-teal">
            <Navigation size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <div className="kpi-value">{activeVoyages}</div>
          <div className="kpi-sub">
            <strong style={{ color: pendingClearances > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>
              {pendingClearances}
            </strong> pelayaran menunggu otorisasi clearance
          </div>
        </div>
      </div>

      {/* 3. Bunker Fuel Monitored */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Bunker Fuel Monitored</span>
          <div className="kpi-icon-badge kpi-icon-green">
            <Fuel size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <div className="kpi-value">{bunkerLogs.length}</div>
          <div className="kpi-sub">Total laporan harian (noon reports) tercatat</div>
        </div>
      </div>

      {/* 4. Anomali Konsumsi BBM */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">Anomali Konsumsi BBM</span>
          <div className={`kpi-icon-badge ${bunkerAnomalies > 0 ? 'kpi-icon-warning' : 'kpi-icon-green'}`}>
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="kpi-body">
          <div className="kpi-value" style={{ color: bunkerAnomalies > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {bunkerAnomalies}
          </div>
          <div className="kpi-sub">
            {bunkerAnomalies > 0 ? 'Deviasi konsumsi > 35% terdeteksi radar' : 'Seluruh armada dalam konsumsi normal'}
          </div>
        </div>
      </div>
    </section>
  );
}
