import React, { useState, useEffect } from 'react';
import {
  Anchor,
  Wrench,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DrydockProject } from '../types';

export default function DrydockSection(): React.JSX.Element {
  const [projects, setProjects] = useState<DrydockProject[]>([]);

  useEffect(() => {
    fetch('/api/v1/drydock/projects')
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching drydock projects:', err));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNING_SPECS':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-teal)', label: 'Penyusunan Spesifikasi Dok' };
      case 'TENDERING':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', label: 'Tender Galangan Kapal' };
      case 'IN_DOCK':
        return { bg: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)', label: 'Sedang Naik Dok (In Dock)' };
      case 'COMPLETED_DELIVERED':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', label: 'Selesai & Laik Laut (Delivered)' };
      default:
        return { bg: '#64748b22', color: '#fff', label: status };
    }
  };

  const totalBudget = projects.reduce((acc, curr) => acc + curr.budget_estimate_usd, 0);

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
            <Anchor size={24} color="var(--accent-cyan)" /> Drydocking &amp; Shipyard Project Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Perencanaan survei dok berkala 5 tahunan (Special Survey Class BKI/DNV/LR), penyusunan spesifikasi teknis dok, dan tender galangan kapal.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Estimasi Anggaran Dok
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            ${totalBudget.toLocaleString('en-US')} USD
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>3 Proyek Dok Khusus Terdaftar</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Proyek Aktif Terdekat
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>
            MT Samudra Jaya
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Desember 2026 @ PT PAL Surabaya</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1.1rem 1.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Kepatuhan Badan Klasifikasi
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
            100% On-Schedule
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Memenuhi timeline ISM &amp; SOLAS</span>
        </div>
      </div>

      {/* Projects Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {projects.map(p => {
          const status = getStatusBadge(p.status);
          return (
            <div
              key={p.id}
              className="card"
              style={{
                padding: '1.4rem',
                borderLeft: '4px solid var(--accent-cyan)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {p.project_code}
                    </span>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: status.bg,
                        color: status.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {p.vessel_name} — {p.survey_type.replace('_', ' ')}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Badan Klasifikasi: <strong style={{ color: '#cbd5e1' }}>{p.classification_society}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimasi Anggaran Dok</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                    ${p.budget_estimate_usd.toLocaleString()} USD
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Target Durasi: {p.planned_duration_days} Hari
                  </span>
                </div>
              </div>

              {/* Details Info Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <span style={{ color: '#94a3b8' }}>Galangan Terpilih / Tender:</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.selected_shipyard}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Rencana Mulai Dok:</span>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.planned_start}</div>
                </div>
                <div>
                  <span style={{ color: '#94a3b8' }}>Realisasi Pengeluaran:</span>
                  <div style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>
                    ${p.actual_spent_usd.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Key Scope of Work Items */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  DAFTAR PEKERJAAN UTAMA REPARASI DOK (SCOPE OF WORK):
                </span>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0.5rem 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  {p.key_jobs.map((job, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '0.82rem',
                        color: '#cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={13} color="var(--accent-cyan)" /> {job}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
