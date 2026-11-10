import React from 'react';
import { Ship, Navigation, Fuel, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(145deg, rgba(20, 40, 80, 0.85), rgba(16, 31, 66, 0.95))',
    border: '1px solid rgba(39, 73, 109, 0.8)',
    borderRadius: '14px',
    padding: '1.25rem 1.4rem',
    minHeight: '145px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(8px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const badgeBaseStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.1,
    marginBottom: '0.35rem',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'baseline',
  };

  const subStyle: React.CSSProperties = {
    fontSize: '0.82rem',
    color: '#94a3b8',
    lineHeight: 1.4,
  };

  return (
    <section className="kpi-grid">
      {/* 1. Armada Aktif */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Armada Aktif</span>
          <div style={{
            ...badgeBaseStyle,
            background: 'rgba(0, 229, 255, 0.12)',
            color: 'var(--accent-cyan)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
          }}>
            <Ship size={20} />
          </div>
        </div>
        <div>
          <div style={valueStyle}>
            {activeVessels}
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#94a3b8', marginLeft: '0.45rem' }}>
              / {vessels.length} Kapal
            </span>
          </div>
          <div style={subStyle}>Unit kapal armada siap beroperasi</div>
        </div>
      </div>

      {/* 2. Pelayaran Terjadwal */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Pelayaran Terjadwal</span>
          <div style={{
            ...badgeBaseStyle,
            background: 'rgba(0, 180, 216, 0.12)',
            color: 'var(--accent-teal)',
            border: '1px solid rgba(0, 180, 216, 0.3)',
          }}>
            <Navigation size={20} />
          </div>
        </div>
        <div>
          <div style={valueStyle}>{activeVoyages}</div>
          <div style={subStyle}>
            <strong style={{ color: pendingClearances > 0 ? '#f59e0b' : '#94a3b8' }}>
              {pendingClearances}
            </strong> pelayaran menunggu otorisasi clearance
          </div>
        </div>
      </div>

      {/* 3. Bunker Fuel Monitored */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Bunker Fuel Monitored</span>
          <div style={{
            ...badgeBaseStyle,
            background: 'rgba(16, 185, 129, 0.12)',
            color: 'var(--success)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <Fuel size={20} />
          </div>
        </div>
        <div>
          <div style={valueStyle}>{bunkerLogs.length}</div>
          <div style={subStyle}>Total log konsumsi harian (noon reports)</div>
        </div>
      </div>

      {/* 4. Anomali Konsumsi BBM */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <span style={titleStyle}>Anomali Konsumsi BBM</span>
          <div style={{
            ...badgeBaseStyle,
            background: bunkerAnomalies > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.12)',
            color: bunkerAnomalies > 0 ? '#f59e0b' : 'var(--success)',
            border: bunkerAnomalies > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            {bunkerAnomalies > 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          </div>
        </div>
        <div>
          <div style={{ ...valueStyle, color: bunkerAnomalies > 0 ? '#f59e0b' : 'var(--success)' }}>
            {bunkerAnomalies}
          </div>
          <div style={subStyle}>
            {bunkerAnomalies > 0 ? 'Deviasi konsumsi > 35% terdeteksi radar' : 'Seluruh armada dalam konsumsi normal'}
          </div>
        </div>
      </div>
    </section>
  );
}
