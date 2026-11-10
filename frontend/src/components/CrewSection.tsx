import React, { useState } from 'react';
import { Users, Award, ShieldAlert, CheckCircle2, AlertCircle, Plus, Search } from 'lucide-react';
import { CrewMember, Vessel } from '../types';

interface CrewSectionProps {
  crew: CrewMember[];
  vessels: Vessel[];
  onRefresh: () => void | Promise<void>;
}

export default function CrewSection({ crew, vessels, onRefresh }: CrewSectionProps): React.JSX.Element {
  const [filterRank, setFilterRank] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCrew = crew.filter(c => {
    const matchesRank = filterRank === 'ALL' || c.rank === filterRank;
    const matchesQuery = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.seafarer_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRank && matchesQuery;
  });

  const getVesselName = (vesselId: number | null) => {
    if (!vesselId) return 'On Shore (Standby)';
    const v = vessels.find(x => x.id === vesselId);
    return v ? v.name : `Kapal #${vesselId}`;
  };

  return (
    <section>
      {/* Header */}
      <div style={{
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
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-main)' }}>
            <Users size={24} color="var(--accent-cyan)" /> Crew Management — Awak Kapal & Sertifikasi STCW
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Data kru terdaftar, jadwal tugas *on-board*, pengawasan masa berlaku STCW 2010 Manila Amendments.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Cari nama / SID..."
              className="form-control"
              style={{ paddingLeft: '2rem', height: '38px', fontSize: '0.85rem' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <select
            className="form-control"
            style={{ height: '38px', fontSize: '0.85rem' }}
            value={filterRank}
            onChange={e => setFilterRank(e.target.value)}
          >
            <option value="ALL">Semua Jabatan</option>
            <option value="MASTER">Master (Nakhoda)</option>
            <option value="CHIEF_ENGINEER">Chief Engineer (KKM)</option>
            <option value="CHIEF_OFFICER">Chief Officer</option>
            <option value="2ND_ENGINEER">2nd Engineer</option>
          </select>
        </div>
      </div>

      {/* Crew Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Buku Pelaut (SID)</th>
              <th>Nama Lengkap</th>
              <th>Jabatan Maritim</th>
              <th>Penempatan Kapal</th>
              <th>Status Dinas</th>
              <th>Sertifikat STCW</th>
              <th>Masa Berlaku</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrew.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>Tidak ada data kru yang sesuai filter.</td></tr>
            ) : (
              filteredCrew.map(m => {
                const cert = m.certifications && m.certifications[0];
                const isExpired = cert ? new Date(cert.expiry_date) < new Date() : false;

                return (
                  <tr key={m.id}>
                    <td><code>{m.seafarer_id}</code></td>
                    <td><strong>{m.full_name}</strong></td>
                    <td>
                      <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                        {m.rank.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{getVesselName(m.assigned_vessel_id)}</td>
                    <td>
                      <span className={`badge ${m.status === 'ON_BOARD' ? 'badge-approved' : 'badge-conditional'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      {cert ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Award size={14} color="var(--accent-cyan)" />
                          <span>{cert.cert_type} ({cert.cert_number})</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Belum dilampirkan</span>
                      )}
                    </td>
                    <td>
                      {cert ? (
                        isExpired ? (
                          <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ShieldAlert size={12} /> Expired ({cert.expiry_date})
                          </span>
                        ) : (
                          <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={12} /> Valid ({cert.expiry_date})
                          </span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
