import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';
import { MaritimeDocument, Vessel } from '../types';

interface DocumentSectionProps {
  vessels: Vessel[];
}

const INITIAL_DOCS: MaritimeDocument[] = [
  {
    id: 1,
    doc_number: 'CERT-SOLAS-SAFCON-2024-09',
    title: 'Cargo Ship Safety Construction Certificate (SOLAS II-1)',
    doc_type: 'STATUTORY_VESSEL',
    issuing_authority: 'Biro Klasifikasi Indonesia (BKI) / Ditjen Hubla',
    vessel_or_seafarer: 'MT Samudra Jaya',
    issue_date: '2024-05-10',
    expiry_date: '2029-05-09',
    status: 'VALID',
  },
  {
    id: 2,
    doc_number: 'SPB-IDJKT-2026-00318',
    title: 'Surat Persetujuan Berlayar (SPB / Port Clearance)',
    doc_type: 'PORT_CLEARANCE',
    issuing_authority: 'Kantor Kesyahbandaran Utama Tanjung Priok',
    vessel_or_seafarer: 'MV Nusantara Pioneer',
    issue_date: '2026-11-09',
    expiry_date: '2026-11-10',
    status: 'VALID',
  },
  {
    id: 3,
    doc_number: 'MARPOL-IOPP-2023-112',
    title: 'International Oil Pollution Prevention Certificate (IOPP Annex I)',
    doc_type: 'STATUTORY_VESSEL',
    issuing_authority: 'Lloyds Register of Shipping (LR)',
    vessel_or_seafarer: 'MT Samudra Jaya',
    issue_date: '2023-12-01',
    expiry_date: '2026-12-01',
    status: 'EXPIRING_SOON',
  },
  {
    id: 4,
    doc_number: 'STCW-COC-ANT1-2021-998',
    title: 'Certificate of Competency (CoC) Master Mariner Class I',
    doc_type: 'CREW_STCW',
    issuing_authority: 'Kementerian Perhubungan RI (Ditkapel)',
    vessel_or_seafarer: 'Capt. Hendra Gunawan (SID: ID-SEA-99214)',
    issue_date: '2021-08-15',
    expiry_date: '2026-08-14',
    status: 'VALID',
  },
  {
    id: 5,
    doc_number: 'LOADLINE-LLC-2024-044',
    title: 'International Load Line Certificate (1966 Convention)',
    doc_type: 'STATUTORY_VESSEL',
    issuing_authority: 'Biro Klasifikasi Indonesia (BKI)',
    vessel_or_seafarer: 'MV Barito Leader',
    issue_date: '2024-02-18',
    expiry_date: '2029-02-17',
    status: 'VALID',
  },
  {
    id: 6,
    doc_number: 'SURVEY-DRYDOCK-2021-88',
    title: 'Intermediate Hull & Boiler Survey Endorsement',
    doc_type: 'CLASS_SURVEY',
    issuing_authority: 'DNV Maritime Classification',
    vessel_or_seafarer: 'MT Samudra Jaya',
    issue_date: '2021-10-10',
    expiry_date: '2026-10-10',
    status: 'EXPIRED',
  },
  {
    id: 7,
    doc_number: 'ISM-SMC-2025-019',
    title: 'Safety Management Certificate (ISM Code Regulation 13)',
    doc_type: 'STATUTORY_VESSEL',
    issuing_authority: 'Ditjen Perhubungan Laut',
    vessel_or_seafarer: 'MV Nusantara Pioneer',
    issue_date: '2025-01-20',
    expiry_date: '2030-01-19',
    status: 'VALID',
  },
];

export default function DocumentSection({ vessels }: DocumentSectionProps): React.JSX.Element {
  const [documents, setDocuments] = useState<MaritimeDocument[]>(INITIAL_DOCS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State for Upload
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState<MaritimeDocument['doc_type']>('STATUTORY_VESSEL');
  const [authority, setAuthority] = useState('');
  const [entity, setEntity] = useState(vessels[0]?.name || 'MT Samudra Jaya');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !docNumber) return;

    const newDoc: MaritimeDocument = {
      id: Date.now(),
      doc_number: docNumber,
      title,
      doc_type: docType,
      issuing_authority: authority || 'Syahbandar / BKI',
      vessel_or_seafarer: entity,
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: expiryDate,
      status: 'VALID',
    };

    setDocuments([newDoc, ...documents]);
    setIsModalOpen(false);
    setTitle('');
    setDocNumber('');
    setAuthority('');
  };

  const filteredDocs = documents.filter(d => {
    const matchType = filterType === 'ALL' || d.doc_type === filterType;
    const matchStat = filterStatus === 'ALL' || d.status === filterStatus;
    const matchSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.doc_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vessel_or_seafarer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.issuing_authority.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStat && matchSearch;
  });

  const validCount = documents.filter(d => d.status === 'VALID').length;
  const expiringSoonCount = documents.filter(d => d.status === 'EXPIRING_SOON').length;
  const expiredCount = documents.filter(d => d.status === 'EXPIRED').length;

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
            <FileText size={24} color="var(--accent-cyan)" /> Document Management — Sertifikat & Izin Operasional
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Vault digital kepatuhan maritim: Sertifikat Kapal Statutory, Dokumen Kru STCW, dan Surat Izin Berlayar (SIB).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Upload size={16} /> Unggah Dokumen Baru
          </button>
        </div>
      </div>

      {/* Summary Cards */}
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
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sertifikat Aktif & Valid</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
            {validCount} Dokumen
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Memenuhi syarat laik laut SOLAS & STCW</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Akan Kedaluwarsa (&lt; 30 Hari)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.25rem' }}>
            {expiringSoonCount} Dokumen
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Perlu renewal survey segera</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kedaluwarsa (Expired)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>
            {expiredCount} Dokumen
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Berpotensi menahan clearance kapal</span>
        </div>
      </div>

      {/* Search and Filters */}
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
            placeholder="Cari sertifikat, nomor, kapal, atau otoritas..."
            className="form-control"
            style={{ paddingLeft: '2.2rem', height: '38px', fontSize: '0.85rem' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tipe:</label>
          <select
            className="form-control"
            style={{ height: '38px', fontSize: '0.85rem', width: 'auto' }}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="ALL">Semua Tipe Dokumen</option>
            <option value="STATUTORY_VESSEL">Sertifikat Statutory Kapal</option>
            <option value="PORT_CLEARANCE">Surat Izin Berlayar (SIB/SPB)</option>
            <option value="CREW_STCW">Sertifikat Awak Kapal (STCW)</option>
            <option value="CLASS_SURVEY">Survey Dok & Kelas</option>
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
            <option value="VALID">Valid / Berlaku</option>
            <option value="EXPIRING_SOON">Akan Habis (&lt; 30 Hari)</option>
            <option value="EXPIRED">Kedaluwarsa (Expired)</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>NOMOR DOKUMEN</th>
              <th>JUDUL SERTIFIKAT</th>
              <th>TIPE DOKUMEN</th>
              <th>KAPAL / PELAUT TERKAIT</th>
              <th>OTORITAS PENERBIT</th>
              <th>MASA BERLAKU</th>
              <th>STATUS</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Tidak ada dokumen kepatuhan maritim yang sesuai filter.
                </td>
              </tr>
            ) : (
              filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{doc.doc_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Diterbitkan: {doc.issue_date}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(0, 180, 216, 0.12)',
                        color: 'var(--accent-teal)',
                      }}
                    >
                      {doc.doc_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{doc.vessel_or_seafarer}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{doc.issuing_authority}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>s/d {doc.expiry_date}</div>
                  </td>
                  <td>
                    {doc.status === 'VALID' && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> VALID
                      </span>
                    )}
                    {doc.status === 'EXPIRING_SOON' && (
                      <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> &lt; 30 HARI
                      </span>
                    )}
                    {doc.status === 'EXPIRED' && (
                      <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> EXPIRED
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-outline" title="Pratinjau Dokumen">
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-sm btn-outline" title="Unduh File PDF">
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

      {/* Modal Upload Dokumen */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Upload size={20} color="var(--accent-cyan)" /> Unggah Sertifikat / Dokumen Maritim
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Judul Sertifikat / Nama Dokumen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOLAS Cargo Ship Safety Equipment Certificate"
                  className="form-control"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Nomor Dokumen / Sertifikat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CERT-BKI-2026-99"
                    className="form-control"
                    value={docNumber}
                    onChange={e => setDocNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Tipe Dokumen
                  </label>
                  <select
                    className="form-control"
                    value={docType}
                    onChange={e => setDocType(e.target.value as any)}
                  >
                    <option value="STATUTORY_VESSEL">Sertifikat Statutory Kapal</option>
                    <option value="PORT_CLEARANCE">Surat Izin Berlayar (SIB/SPB)</option>
                    <option value="CREW_STCW">Sertifikat Awak Kapal (STCW)</option>
                    <option value="CLASS_SURVEY">Survey Dok & Kelas</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Kapal / Pelaut Terkait
                  </label>
                  <select
                    className="form-control"
                    value={entity}
                    onChange={e => setEntity(e.target.value)}
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                    <option value="All Seafarers">Seluruh Awak Kapal</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Otoritas Penerbit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BKI / Ditjen Hubla"
                    className="form-control"
                    value={authority}
                    onChange={e => setAuthority(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  Tanggal Kedaluwarsa (Expiry Date) *
                </label>
                <input
                  type="date"
                  required
                  className="form-control"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
