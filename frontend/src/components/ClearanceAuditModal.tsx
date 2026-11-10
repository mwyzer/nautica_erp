import React from 'react';
import { X, CheckCircle, AlertOctagon, AlertTriangle, ShieldCheck, FileText, CheckSquare, Sparkles } from 'lucide-react';
import { ClearanceAuditResult } from '../types';

interface ClearanceAuditModalProps {
  auditData: ClearanceAuditResult | null;
  isLoading: boolean;
  onClose: () => void;
}

export default function ClearanceAuditModal({
  auditData,
  isLoading,
  onClose
}: ClearanceAuditModalProps): React.JSX.Element | null {
  if (!isOpen(auditData, isLoading)) return null;

  function isOpen(data: ClearanceAuditResult | null, loading: boolean) {
    return loading || data !== null;
  }

  const isApproved = auditData?.decision === 'APPROVED';
  const isRejected = auditData?.decision === 'REJECTED';
  const isConditional = auditData?.decision === 'CONDITIONAL';

  const bannerClass = isApproved
    ? 'badge-approved'
    : isRejected
    ? 'badge-rejected'
    : 'badge-conditional';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--accent-cyan)" />
            <h3>Hasil Audit Multi-Faktor AI Voyage Clearance</h3>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                ⚡ Menghubungi Captain Gemini & Mesin Audit SOLAS...
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Memvalidasi bunker safety reserve 15%, masa berlaku STCW awak, dan status kelaiklautan mesin.
              </p>
            </div>
          )}

          {!isLoading && auditData && (
            <div>
              {/* Verdict Banner */}
              <div
                className="verdict-banner"
                style={{
                  background: isApproved
                    ? 'var(--success-bg)'
                    : isRejected
                    ? 'var(--danger-bg)'
                    : 'var(--warning-bg)',
                  border: `1px solid ${isApproved ? 'var(--success)' : isRejected ? 'var(--danger)' : 'var(--warning)'}`,
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                    Keputusan Otorisasi Pelayaran: <strong>{auditData.decision}</strong>
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {auditData.voyage_number} • {auditData.vessel_name}
                  </span>
                </div>
                {isApproved && <CheckCircle size={32} color="var(--success)" />}
                {isRejected && <AlertOctagon size={32} color="var(--danger)" />}
                {isConditional && <AlertTriangle size={32} color="var(--warning)" />}
              </div>

              {/* Metrics Grid */}
              <div className="audit-metrics-grid">
                <div className="metric-box">
                  <h5>Cadangan BBM (+15%)</h5>
                  <div className="metric-val" style={{ color: auditData.fuel_check.is_sufficient ? 'var(--success)' : 'var(--danger)' }}>
                    {auditData.fuel_check.fuel_sufficiency_score}x
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    ROB: {auditData.fuel_check.current_rob_mt} MT / Butuh: {auditData.fuel_check.safe_fuel_required_mt} MT
                  </div>
                </div>

                <div className="metric-box">
                  <h5>Kepatuhan Kru STCW</h5>
                  <div className="metric-val" style={{ color: auditData.crew_compliance.is_compliant ? 'var(--success)' : 'var(--danger)' }}>
                    {auditData.crew_compliance.is_compliant ? 'KOMPLIAN' : 'NON-KOMPLIAN'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {auditData.crew_compliance.expired_or_expiring_certificates.length} sertifikat kedaluwarsa
                  </div>
                </div>

                <div className="metric-box">
                  <h5>Kelaiklautan Mesin (PMS)</h5>
                  <div className="metric-val" style={{ color: auditData.maintenance_status.is_seaworthy ? 'var(--success)' : 'var(--danger)' }}>
                    {auditData.maintenance_status.is_seaworthy ? 'SEAWORTHY' : 'DEFECT BLOCK'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {auditData.maintenance_status.blocking_defects.length} cacat kritis terdeteksi
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                  <FileText size={16} /> Analisis Eksekutif AI Superintendent
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 6, border: '1px solid var(--border-color)', whiteSpace: 'pre-line' }}>
                  {auditData.ai_summary}
                </div>
              </div>

              {/* Recommended Actions */}
              {auditData.recommended_actions && auditData.recommended_actions.length > 0 && (
                <div className="actions-list">
                  <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                    <CheckSquare size={16} /> Tindakan Wajib Superintendent Sebelum Berlayar:
                  </h4>
                  <ul>
                    {auditData.recommended_actions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
