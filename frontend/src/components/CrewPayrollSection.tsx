import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Users,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Building
} from 'lucide-react';
import { CrewPayrollRecord } from '../types';

export default function CrewPayrollSection(): React.JSX.Element {
  const [payrollList, setPayrollList] = useState<CrewPayrollRecord[]>([]);

  useEffect(() => {
    fetch('/api/v1/payroll/slips')
      .then(res => res.json())
      .then(data => setPayrollList(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed fetching payroll data:', err));
  }, []);

  const totalPayroll = payrollList.reduce((acc, curr) => acc + curr.basic_salary_usd + curr.overtime_pay_usd + curr.leave_pay_usd, 0);
  const totalAllotments = payrollList.reduce((acc, curr) => acc + curr.family_allotment_usd, 0);

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
            <CreditCard size={24} color="var(--accent-cyan)" /> Maritime Crew Payroll &amp; Family Allotment (MLC 2006)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Penggajian awak kapal internasional berbasis konvensi ILO Maritime Labour Convention (MLC 2006), lembur terverifikasi, dan remitan keluarga di darat (*Home Allotments*).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> MLC 2006 Title 2.2 Compliant
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            TOTAL BIAYA PAYROLL AWAK KAPAL
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
            ${totalPayroll.toLocaleString('en-US')} USD
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Periode: November 2026</span>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            REMITAN KELUARGA DI DARAT (ALLOTMENTS)
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '2px' }}>
            ${totalAllotments.toLocaleString('en-US')} USD
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>
            70% ditransfer langsung ke rekening keluarga
          </span>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.3rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            STATUS REMITAN PERBANKAN
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
            100% On-Time
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Transfer via BCA, Mandiri, BRI, BNI</span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="table-responsive">
        <table className="erp-table">
          <thead>
            <tr>
              <th>AWAK KAPAL &amp; PANGKAT</th>
              <th>KAPAL TUGAS</th>
              <th>GAJI POKOK ($)</th>
              <th>LEMBUR (JAM/$)</th>
              <th>UANG CUTI ($)</th>
              <th>REMITAN KELUARGA (ALLOTMENT)</th>
              <th>SISA GAJI BERSIH</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {payrollList.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.seafarer_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                    {p.rank} • SID: {p.crew_id}
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{p.assigned_vessel}</td>
                <td style={{ fontWeight: 600 }}>${p.basic_salary_usd.toLocaleString()}</td>
                <td>
                  <div>{p.overtime_hours} Jam</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>+${p.overtime_pay_usd}</div>
                </td>
                <td>${p.leave_pay_usd}</td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    ${p.family_allotment_usd.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {p.family_recipient_name}
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                  ${p.net_payable_usd.toLocaleString()}
                </td>
                <td>
                  <span
                    className={`badge ${
                      p.payment_status === 'PAID'
                        ? 'badge-success'
                        : p.payment_status === 'PROCESSING'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}
                  >
                    {p.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
