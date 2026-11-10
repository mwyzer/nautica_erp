import React from 'react';
import { X, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ClearanceAuditModal({ auditData, isLoading, onClose }) {
  if (!auditData && !isLoading) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Hasil Audit Kelaiklautan AI Superintendent</h3>
          <button className="modal-close" onClick={onClose} aria-label="Tutup Dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '1.1rem' }}>
                ⚙️ Captain Gemini AI sedang memeriksa parameter maritim...
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Menghitung cadangan aman bunker +15%, memvalidasi STCW Manila 2010, dan memindai kerusakan kritis PMS...
              </p>
            </div>
          ) : auditData ? (
            <div>
              {/* Verdict Banner */}
              <div
                className="verdict-banner"
                style={{
                  background:
                    auditData.decision === 'APPROVED'
                      ? 'var(--success-bg)'
                      : auditData.decision === 'CONDITIONAL'
                      ? 'var(--warning-bg)'
                      : 'var(--danger-bg)',
                  border: `1px solid ${
                    auditData.decision === 'APPROVED'
                      ? 'var(--success)'
                      : auditData.decision === 'CONDITIONAL'
                      ? 'var(--warning)'
                      : 'var(--danger)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {auditData.decision === 'APPROVED' && <CheckCircle color="var(--success)" size={28} />}
                  {auditData.decision === 'CONDITIONAL' && <AlertTriangle color="var(--warning)" size={28} />}
                  {auditData.decision === 'REJECTED' && <ShieldAlert color="var(--danger)" size={28} />}
                  <div>
                    <h4
                      style={{
                        color:
                          auditData.decision === 'APPROVED'
                            ? 'var(--success)'
                            : auditData.decision === 'CONDITIONAL'
                            ? 'var(--warning)'
                            : 'var(--danger)',
                        fontSize: '1.25rem',
                      }}
                    >
                      KEPUTUSAN: {auditData.decision}
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      Voyage: {auditData.voyage_number} ({auditData.vessel_name})
                    </span>
                  </div>
                </div>
                <span className={`badge badge-${auditData.decision.toLowerCase()}`}>
                  {auditData.decision}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="audit-metrics-grid">
                <div className="metric-box">
                  <h5>BBM / Bunker (ROB vs Safe)</h5>
                  <div
                    className="metric-val"
                    style={{ color: auditData.fuel_check.is_sufficient ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {auditData.fuel_check.current_rob_mt} MT / {auditData.fuel_check.safe_fuel_required_mt} MT
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Kebutuhan: {auditData.fuel_check.base_fuel_required_mt} MT + 15% Buffer
                  </span>
                </div>

                <div className="metric-box">
                  <h5>Kepatuhan STCW Kru</h5>
                  <div
                    className="metric-val"
                    style={{ color: auditData.crew_compliance.is_compliant ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {auditData.crew_compliance.is_compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {auditData.crew_compliance.expired_or_expiring_certificates.length} sertifikat kedaluwarsa
                  </span>
                </div>

                <div className="metric-box">
                  <h5>Kelaiklautan PMS (SOLAS)</h5>
                  <div
                    className="metric-val"
                    style={{ color: auditData.maintenance_status.is_seaworthy ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {auditData.maintenance_status.is_seaworthy ? 'SEAWORTHY' : 'DEFECT DETECTED'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {auditData.maintenance_status.blocking_defects.length} kerusakan kritis
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h5 style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Analisis AI Superintendent (Captain Gemini):
                </h5>
                <p
                  style={{
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1rem',
                    borderRadius: '8px',
                  }}
                >
                  {auditData.ai_summary}
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="actions-list">
                <h5 style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Tindakan Wajib Sebelum Berlayar:
                </h5>
                <ul>
                  {auditData.recommended_actions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
