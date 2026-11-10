import React, { useState } from 'react';
import { Boxes, Fuel, AlertTriangle, CheckCircle2, PackageCheck, Layers } from 'lucide-react';
import { BunkerLog, Vessel } from '../types';

interface InventorySectionProps {
  bunkerLogs: BunkerLog[];
  vessels: Vessel[];
}

export default function InventorySection({ bunkerLogs, vessels }: InventorySectionProps): React.JSX.Element {
  const [tab, setTab] = useState<'bunker' | 'spares'>('bunker');

  const mockSpareParts = [
    {
      code: 'SP-ENG-001',
      name: 'Main Engine Cylinder Liner (MAN B&W 6S50ME)',
      category: 'Machinery Spares',
      qty: 2,
      min: 2,
      unit: 'Pcs',
      location: 'Engine Room Store - Rack A2',
      status: 'OPTIMAL',
    },
    {
      code: 'SP-ENG-002',
      name: 'Fuel Injector Nozzle Assembly (VLSFO Spec)',
      category: 'Machinery Spares',
      qty: 6,
      min: 12,
      unit: 'Sets',
      location: 'Engine Room Store - Bin 14',
      status: 'REORDER_NOW',
    },
    {
      code: 'SP-LUB-003',
      name: 'Marine System Oil SAE 30 (Castrol CDX)',
      category: 'Lubricants',
      qty: 4800,
      min: 3000,
      unit: 'Liters',
      location: 'Lube Oil Storage Tank #1',
      status: 'OPTIMAL',
    },
    {
      code: 'SP-SAF-004',
      name: 'Hydrostatic Release Unit (HRU for Life Raft)',
      category: 'Safety Equipment',
      qty: 4,
      min: 4,
      unit: 'Units',
      location: 'Safety Locker Bridge Deck',
      status: 'OPTIMAL',
    },
    {
      code: 'SP-FLT-005',
      name: 'Auxiliary Engine Lube Oil Filter Cartridge',
      category: 'Machinery Spares',
      qty: 3,
      min: 8,
      unit: 'Pcs',
      location: 'Engine Room Store - Rack C1',
      status: 'CRITICAL_LOW',
    },
  ];

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
            <Boxes size={24} color="var(--accent-cyan)" /> Inventory Management — Spare Parts & Bahan Bakar
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Pemantauan stok cadangan BBM (*Remaining On Board*), pelumas mesin, suku cadang kritis, dan persediaan kapal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${tab === 'bunker' ? 'btn-ai' : 'btn-secondary'}`}
            onClick={() => setTab('bunker')}
          >
            <Fuel size={14} /> Stok Bunker BBM
          </button>
          <button
            className={`btn ${tab === 'spares' ? 'btn-ai' : 'btn-secondary'}`}
            onClick={() => setTab('spares')}
          >
            <PackageCheck size={14} /> Suku Cadang Mesin
          </button>
        </div>
      </div>

      {tab === 'bunker' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID Kapal</th>
                <th>Jenis Bahan Bakar</th>
                <th>Sisa Stok (ROB)</th>
                <th>Konsumsi Harian</th>
                <th>Status Anomali Radar</th>
                <th>Level Stok Tangki</th>
              </tr>
            </thead>
            <tbody>
              {bunkerLogs.map(b => (
                <tr key={b.id}>
                  <td><strong>Kapal #{b.vessel_id}</strong></td>
                  <td><span className="badge badge-active">{b.fuel_type}</span></td>
                  <td><strong>{b.current_rob_mt} MT</strong></td>
                  <td>{b.daily_consumption_mt} MT / hari</td>
                  <td>
                    {b.anomaly_flag ? (
                      <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={12} /> Boros ({b.anomaly_reason?.slice(0, 30)}...)
                      </span>
                    ) : (
                      <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} /> Optimal
                      </span>
                    )}
                  </td>
                  <td style={{ width: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, Math.round((b.current_rob_mt / 200) * 100))}%`,
                          height: '100%',
                          background: b.current_rob_mt < 30 ? 'var(--danger)' : 'var(--accent-cyan)',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {Math.min(100, Math.round((b.current_rob_mt / 200) * 100))}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Kode Barang</th>
                <th>Deskripsi Spare Part / Material</th>
                <th>Kategori</th>
                <th>Jumlah Tersedia</th>
                <th>Batas Minimum</th>
                <th>Lokasi Penyimpanan</th>
                <th>Status Persediaan</th>
              </tr>
            </thead>
            <tbody>
              {mockSpareParts.map((sp, idx) => (
                <tr key={idx}>
                  <td><code>{sp.code}</code></td>
                  <td><strong>{sp.name}</strong></td>
                  <td><span className="badge badge-active">{sp.category}</span></td>
                  <td><strong>{sp.qty} {sp.unit}</strong></td>
                  <td>{sp.min} {sp.unit}</td>
                  <td>{sp.location}</td>
                  <td>
                    {sp.status === 'OPTIMAL' ? (
                      <span className="badge badge-approved">Cukup (Optimal)</span>
                    ) : sp.status === 'REORDER_NOW' ? (
                      <span className="badge badge-conditional">Perlu Pesan Ulang</span>
                    ) : (
                      <span className="badge badge-rejected">Kritis (Segera Beli)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
