import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Printer,
  QrCode,
  ShieldCheck,
  Ship,
  Users,
  Boxes,
  Fuel,
  Download,
  CheckCircle2,
  Calendar,
  Building
} from 'lucide-react';
import { DigitalSPBRecord } from '../types';

export default function DigitalSPBSection(): React.JSX.Element {
  const [spbList, setSpbList] = useState<DigitalSPBRecord[]>([]);
  const [selectedSpb, setSelectedSpb] = useState<DigitalSPBRecord | null>(null);
  const [activeFalTab, setActiveFalTab] = useState<'fal1' | 'fal2' | 'fal3' | 'fal5'>('fal1');

  useEffect(() => {
    fetch('/api/v1/spb/records')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSpbList(data);
          setSelectedSpb(data[0]);
        }
      })
      .catch(err => console.error('Failed fetching SPB records:', err));
  }, []);

  const handlePrint = () => {
    window.print();
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
            <FileCheck size={24} color="var(--accent-cyan)" /> Digital SPB (Surat Persetujuan Berlayar) &amp; IMO FAL Forms
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Dokumen resmi otoritas pelabuhan (Syahbandar Inaportnet &amp; IMO Convention on Facilitation of International Maritime Traffic).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', height: '38px', fontSize: '0.82rem' }}
          >
            <Printer size={15} /> Cetak Sertifikat SPB Resmi
          </button>
        </div>
      </div>

      {/* Main Container: Certificate Preview & IMO FAL Form Tabs */}
      {selectedSpb && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem' }}>
          {/* Left: Printable Official SPB Certificate */}
          <div
            className="card printable-certificate"
            style={{
              background: '#0a1428',
              border: '2px solid rgba(0, 229, 255, 0.4)',
              borderRadius: '12px',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Republic of Indonesia Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.78rem', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                REPUBLIK INDONESIA • KEMENTERIAN PERHUBUNGAN
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                DIREKTORAT JENDERAL PERHUBUNGAN LAUT
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)', letterSpacing: '0.04em', marginTop: '6px' }}>
                SURAT PERSETUJUAN BERLAYAR (SPB)
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                PORT CLEARANCE CERTIFICATE • NO: <span style={{ fontWeight: 700, color: '#fff' }}>{selectedSpb.spb_number}</span>
              </div>
            </div>

            {/* Certificate Core Statement */}
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '1.5rem' }}>
              Sesuai dengan Undang-Undang Republik Indonesia Nomor 17 Tahun 2008 tentang Pelayaran dan konvensi internasional SOLAS 1974 / STCW 1978 amandemen Manila 2010, dengan ini diterangkan bahwa:
            </p>

            {/* Vessel Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem 1.5rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ color: '#94a3b8' }}>Nama Kapal:</span>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1rem' }}>{selectedSpb.vessel_name}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Bendera / Call Sign:</span>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{selectedSpb.flag} • {selectedSpb.call_sign}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Nomor IMO:</span>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedSpb.imo_number}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Nama Nakhoda (Master):</span>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedSpb.master_name}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Pelabuhan Tolak:</span>
                <div style={{ fontWeight: 600 }}>{selectedSpb.origin_port_name}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Pelabuhan Tujuan:</span>
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{selectedSpb.destination_port_name}</div>
              </div>
            </div>

            {/* Seaworthiness declaration */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <CheckCircle2 size={24} color="var(--success)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>
                  KAPAL TELAH MEMENUHI KELAIKLAUTAN (SEAWORTHINESS COMPLIANT)
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Pemeriksaan dokumen keselamatan, kru STCW, bahan bakar, dan stabilitas muatan dinyatakan SAH untuk berlayar.
                </div>
              </div>
            </div>

            {/* Footer Authority & QR Code */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1.25rem',
              }}
            >
              {/* QR Verification */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    background: '#ffffff',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode size={48} color="#000000" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    VERIFIKASI KRIPTOGRAFIS
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', maxWidth: '170px' }}>
                    Pindai untuk validasi kelaiklautan pada sistem Ditjen Hubla.
                  </div>
                </div>
              </div>

              {/* Authority Stamp */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Diterbitkan di Jakarta, {selectedSpb.issued_at}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  {selectedSpb.syahbandar_authority}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--warning)', marginTop: '2px' }}>
                  Masa Berlaku: {selectedSpb.valid_until}
                </div>
              </div>
            </div>
          </div>

          {/* Right: IMO FAL Forms Breakdown Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="var(--accent-cyan)" /> Lampiran Dokumen IMO FAL Forms
              </h3>

              {/* Tab Selector */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                <button
                  onClick={() => setActiveFalTab('fal1')}
                  className={`btn btn-sm ${activeFalTab === 'fal1' ? 'btn-primary' : 'btn-outline'}`}
                >
                  FAL 1 (General)
                </button>
                <button
                  onClick={() => setActiveFalTab('fal2')}
                  className={`btn btn-sm ${activeFalTab === 'fal2' ? 'btn-primary' : 'btn-outline'}`}
                >
                  FAL 2 (Cargo)
                </button>
                <button
                  onClick={() => setActiveFalTab('fal3')}
                  className={`btn btn-sm ${activeFalTab === 'fal3' ? 'btn-primary' : 'btn-outline'}`}
                >
                  FAL 3 (Stores)
                </button>
                <button
                  onClick={() => setActiveFalTab('fal5')}
                  className={`btn btn-sm ${activeFalTab === 'fal5' ? 'btn-primary' : 'btn-outline'}`}
                >
                  FAL 5 (Crew)
                </button>
              </div>

              {/* Tab Contents */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                {activeFalTab === 'fal1' && (
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                      IMO FAL Form 1 — General Declaration
                    </h4>
                    <p style={{ color: '#cbd5e1' }}>{selectedSpb.fal_form_1_summary}</p>
                  </div>
                )}

                {activeFalTab === 'fal2' && (
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--accent-teal)', marginBottom: '4px' }}>
                      IMO FAL Form 2 — Cargo Declaration
                    </h4>
                    <p style={{ color: '#cbd5e1' }}>{selectedSpb.fal_form_2_cargo}</p>
                  </div>
                )}

                {activeFalTab === 'fal3' && (
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '4px' }}>
                      IMO FAL Form 3 — Ship&apos;s Stores Declaration
                    </h4>
                    <p style={{ color: '#cbd5e1' }}>{selectedSpb.fal_form_3_stores}</p>
                  </div>
                )}

                {activeFalTab === 'fal5' && (
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>
                      IMO FAL Form 5 — Crew List Declaration
                    </h4>
                    <p style={{ color: '#cbd5e1' }}>
                      Total Awak Kapal Terdaftar: <strong>{selectedSpb.fal_form_5_crew_count} Orang</strong>.
                      Seluruh kru memiliki paspor pelaut (Seafarer Identity Document / SID) dan buku pelaut yang sah.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
