import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Compass,
  Gauge,
  Fuel,
  Droplet,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Wind
} from 'lucide-react';
import { NoonReportSubmission, Vessel } from '../types';

interface NoonReportSectionProps {
  vessels: Vessel[];
}

export default function NoonReportSection({ vessels }: NoonReportSectionProps): React.JSX.Element {
  const [reports, setReports] = useState<NoonReportSubmission[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'MV Nusantara Pioneer');
  const [latitude, setLatitude] = useState('-1.85');
  const [longitude, setLongitude] = useState('105.45');
  const [distance24h, setDistance24h] = useState('355');
  const [speed, setSpeed] = useState('14.8');
  const [rpm, setRpm] = useState('92');
  const [slip, setSlip] = useState('4.2');
  const [fuelBurn, setFuelBurn] = useState('23.8');
  const [fuelRob, setFuelRob] = useState('145');
  const [freshWater, setFreshWater] = useState('180');
  const [beaufort, setBeaufort] = useState('4');
  const [seaState, setSeaState] = useState('Slight to Moderate');

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/v1/noon-reports');
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed fetching noon reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/noon-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vessel_name: vesselName,
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
          distance_last_24h_nm: parseFloat(distance24h) || 0,
          avg_speed_knots: parseFloat(speed) || 0,
          engine_rpm: parseFloat(rpm) || 0,
          propeller_slip_pct: parseFloat(slip) || 0,
          fuel_burn_24h_mt: parseFloat(fuelBurn) || 0,
          fuel_rob_vlsfo_mt: parseFloat(fuelRob) || 0,
          fresh_water_rob_mt: parseFloat(freshWater) || 0,
          weather_beaufort: parseInt(beaufort) || 4,
          sea_state: seaState,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchReports();
      }
    } catch (err) {
      console.error('Submit noon report failed:', err);
    }
  };

  const getFoulingBadge = (status: string) => {
    switch (status) {
      case 'CLEAN':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', label: 'Lambung Bersih (Clean)' };
      case 'SLIGHT_GROWTH':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-teal)', label: 'Pertumbuhan Ringan' };
      case 'MODERATE_FOULING':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'Perlu Monitoring Slip' };
      case 'CRITICAL_CLEANING_REQUIRED':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', label: 'Wajib Pembersihan Dok Segera' };
      default:
        return { bg: '#64748b22', color: '#fff', label: status };
    }
  };

  return (
    <section>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-main)',
            }}
          >
            <Clock size={24} color="var(--accent-cyan)" /> Daily Noon Report &amp; Vessel Telemetry
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Laporan harian tengah hari (12:00 UTC/LMT) dari Chief Engineer: jarak tempuh 24 jam, slip baling-baling, konsumsi bunker harian, dan indeks biofouling lambung.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '38px', fontSize: '0.82rem' }}
        >
          <Plus size={16} /> Input Noon Report Baru
        </button>
      </div>

      {/* Reports Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>KAPAL &amp; TANGGAL</th>
              <th>KOORDINAT LAT/LONG</th>
              <th>JARAK 24 JAM</th>
              <th>SPEED &amp; RPM</th>
              <th>SLIP BALING-BALING</th>
              <th>KONSUMSI BBM (24H)</th>
              <th>SISA BBM ROB</th>
              <th>INDEKS BIOFOULING LAMBUNG</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => {
              const fouling = getFoulingBadge(r.hull_fouling_index);
              return (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{r.vessel_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {r.report_date} • {r.report_time_utc}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {r.latitude}° / {r.longitude}°
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.distance_last_24h_nm} NM</td>
                  <td>
                    <div>{r.avg_speed_knots} kts</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.engine_rpm} RPM</div>
                  </td>
                  <td style={{ fontWeight: 700, color: r.propeller_slip_pct > 8 ? 'var(--danger)' : 'var(--text-main)' }}>
                    {r.propeller_slip_pct}%
                  </td>
                  <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{r.fuel_burn_24h_mt} MT</td>
                  <td style={{ fontWeight: 600 }}>{r.fuel_rob_vlsfo_mt} MT</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: fouling.bg,
                        color: fouling.color,
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        display: 'inline-block',
                      }}
                    >
                      {fouling.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Input Noon Report */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Clock size={20} color="var(--accent-cyan)" /> Form Input Daily Noon Report
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Kapal Armada
                </label>
                <select
                  className="form-control"
                  value={vesselName}
                  onChange={e => setVesselName(e.target.value)}
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-control"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-control"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Jarak 24 Jam (NM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={distance24h}
                    onChange={e => setDistance24h(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Speed (kts)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={speed}
                    onChange={e => setSpeed(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Engine RPM
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    className="form-control"
                    value={rpm}
                    onChange={e => setRpm(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Slip Propeller (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={slip}
                    onChange={e => setSlip(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Bakar 24H (MT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={fuelBurn}
                    onChange={e => setFuelBurn(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Sisa ROB (MT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={fuelRob}
                    onChange={e => setFuelRob(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Laporan Noon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
