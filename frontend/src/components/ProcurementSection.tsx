import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  FileCheck,
  AlertCircle,
  Download,
  DollarSign
} from 'lucide-react';
import { ProcurementOrder, Vessel } from '../types';

interface ProcurementSectionProps {
  vessels: Vessel[];
}

const INITIAL_POS: ProcurementOrder[] = [
  {
    id: 1,
    po_number: 'PO-2026-BKR-881',
    vendor_name: 'PT Pertamina Marine Fuel Hub',
    category: 'BUNKER_SUPPLY',
    total_amount_usd: 142500,
    order_date: '2026-11-05',
    expected_delivery: '2026-11-12',
    status: 'IN_TRANSIT',
    target_vessel: 'MT Samudra Jaya',
  },
  {
    id: 2,
    po_number: 'PO-2026-ENG-412',
    vendor_name: 'Wärtsilä Spares Global Singapore',
    category: 'ENGINE_SPARES',
    total_amount_usd: 38200,
    order_date: '2026-11-07',
    expected_delivery: '2026-11-15',
    status: 'APPROVED',
    target_vessel: 'MV Nusantara Pioneer',
  },
  {
    id: 3,
    po_number: 'PO-2026-SFT-094',
    vendor_name: 'Survitec Marine Safety Jakarta',
    category: 'SAFETY_GEAR',
    total_amount_usd: 8650,
    order_date: '2026-11-08',
    expected_delivery: '2026-11-14',
    status: 'PENDING_APPROVAL',
    target_vessel: 'MV Barito Leader',
  },
  {
    id: 4,
    po_number: 'PO-2026-PRV-305',
    vendor_name: 'Samudera Ship Chandlers Surabaya',
    category: 'PROVISIONS',
    total_amount_usd: 5400,
    order_date: '2026-11-09',
    expected_delivery: '2026-11-11',
    status: 'DELIVERED',
    target_vessel: 'MT Samudra Jaya',
  },
  {
    id: 5,
    po_number: 'PO-2026-LUB-119',
    vendor_name: 'Shell Marine Lubricants Indonesia',
    category: 'BUNKER_SUPPLY',
    total_amount_usd: 21900,
    order_date: '2026-11-09',
    expected_delivery: '2026-11-18',
    status: 'PENDING_APPROVAL',
    target_vessel: 'MV Nusantara Pioneer',
  },
];

export default function ProcurementSection({ vessels }: ProcurementSectionProps): React.JSX.Element {
  const [orders, setOrders] = useState<ProcurementOrder[]>(INITIAL_POS);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState<ProcurementOrder['category']>('BUNKER_SUPPLY');
  const [targetVessel, setTargetVessel] = useState(vessels[0]?.name || 'MT Samudra Jaya');
  const [amount, setAmount] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('2026-11-20');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !amount) return;

    const newOrder: ProcurementOrder = {
      id: Date.now(),
      po_number: `PO-2026-${category.slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`,
      vendor_name: vendorName,
      category,
      total_amount_usd: parseFloat(amount) || 0,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: deliveryDate,
      status: 'PENDING_APPROVAL',
      target_vessel: targetVessel,
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    setVendorName('');
    setAmount('');
  };

  const handleApprove = (id: number) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'APPROVED' } : o))
    );
  };

  const filteredOrders = orders.filter(o => {
    const matchCat = filterCategory === 'ALL' || o.category === filterCategory;
    const matchStat = filterStatus === 'ALL' || o.status === filterStatus;
    const matchSearch =
      o.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.target_vessel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStat && matchSearch;
  });

  const totalOpexOrders = orders.reduce((acc, curr) => acc + curr.total_amount_usd, 0);
  const pendingApprovals = orders.filter(o => o.status === 'PENDING_APPROVAL').length;
  const inTransitCount = orders.filter(o => o.status === 'IN_TRANSIT').length;

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
            <ShoppingCart size={24} color="var(--accent-cyan)" /> Procurement & Supply Chain Kapal
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manajemen pengadaan kebutuhan kapal: bahan bakar (bunker), spare parts mesin, provisi, dan safety gear.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Buat PO Baru
          </button>
        </div>
      </div>

      {/* Procurement Metrics Summary */}
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
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Nilai Pembelian (MTD)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            ${totalOpexOrders.toLocaleString('en-US')}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>5 Purchase Orders Terdaftar</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Menunggu Approval Superintendent</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>
            {pendingApprovals} PO
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Memerlukan verifikasi anggaran</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dalam Pengiriman ke Pelabuhan</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: '0.25rem' }}>
            {inTransitCount} Kiriman
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimasi tiba on-time 100%</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          background: 'var(--bg-card)',
          padding: '0.9rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Cari nomor PO, vendor, atau kapal..."
            className="form-control"
            style={{ paddingLeft: '2.2rem', height: '38px', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Kategori:</label>
          <select
            className="form-control"
            style={{ height: '38px', fontSize: '0.85rem', width: 'auto' }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="ALL">Semua Kategori</option>
            <option value="BUNKER_SUPPLY">Bunker BBM & Pelumas</option>
            <option value="ENGINE_SPARES">Spare Parts Mesin</option>
            <option value="SAFETY_GEAR">Safety & LSA/FFA</option>
            <option value="PROVISIONS">Perbekalan / Provisi</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</label>
          <select
            className="form-control"
            style={{ height: '38px', fontSize: '0.85rem', width: 'auto' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="IN_TRANSIT">Dalam Pengiriman</option>
            <option value="DELIVERED">Diterima (Delivered)</option>
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>NOMOR PO</th>
              <th>VENDOR / SUPPLIER</th>
              <th>KATEGORI</th>
              <th>TARGET KAPAL</th>
              <th>TOTAL BIAYA (USD)</th>
              <th>ESTIMASI TIBA</th>
              <th>STATUS PO</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada data Purchase Order yang cocok.
                </td>
              </tr>
            ) : (
              filteredOrders.map(po => (
                <tr key={po.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{po.po_number}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{po.vendor_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order: {po.order_date}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: 'var(--accent-teal)',
                      }}
                    >
                      {po.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{po.target_vessel}</td>
                  <td style={{ fontWeight: 700, color: '#f8fafc' }}>
                    ${po.total_amount_usd.toLocaleString('en-US')}
                  </td>
                  <td>{po.expected_delivery}</td>
                  <td>
                    {po.status === 'PENDING_APPROVAL' && (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> PENDING
                      </span>
                    )}
                    {po.status === 'APPROVED' && (
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FileCheck size={12} /> APPROVED
                      </span>
                    )}
                    {po.status === 'IN_TRANSIT' && (
                      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent-cyan)' }}>
                        <Truck size={12} /> IN TRANSIT
                      </span>
                    )}
                    {po.status === 'DELIVERED' && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> DELIVERED
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {po.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={() => handleApprove(po.id)}
                          className="btn btn-sm btn-primary"
                          title="Setujui Purchase Order"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline"
                        title="Download Invoice/PO PDF"
                        style={{ padding: '4px 8px' }}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Buat PO Baru */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <ShoppingCart size={20} color="var(--accent-cyan)" /> Buat Purchase Order (PO) Baru
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Nama Vendor / Supplier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PT Pertamina Marine Supply"
                  className="form-control"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Kategori Pengadaan
                  </label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                  >
                    <option value="BUNKER_SUPPLY">Bunker BBM & Pelumas</option>
                    <option value="ENGINE_SPARES">Spare Parts Mesin</option>
                    <option value="SAFETY_GEAR">Safety & LSA/FFA</option>
                    <option value="PROVISIONS">Perbekalan / Provisi</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Target Kapal
                  </label>
                  <select
                    className="form-control"
                    value={targetVessel}
                    onChange={e => setTargetVessel(e.target.value)}
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Total Nilai (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    className="form-control"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Estimasi Pengiriman
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Terbitkan Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
