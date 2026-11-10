import React from 'react';
import {
  Ship,
  Users,
  Wrench,
  Boxes,
  ShoppingCart,
  DollarSign,
  Compass,
  FileText,
  Bot,
  Layers,
  ChevronRight,
  Leaf,
  Clock,
  Anchor,
  FileSpreadsheet,
  ShieldAlert,
  Waves,
  FileCheck,
  CreditCard,
  Bell,
  Scale,
  Cpu
} from 'lucide-react';
import { ERPModule } from '../types';

interface SidebarProps {
  activeModule: ERPModule;
  onSelectModule: (module: ERPModule) => void;
  pendingClearanceCount?: number;
  anomalyCount?: number;
  criticalDefectsCount?: number;
}

export default function Sidebar({
  activeModule,
  onSelectModule,
  pendingClearanceCount = 0,
  anomalyCount = 0,
  criticalDefectsCount = 0,
}: SidebarProps): React.JSX.Element {
  const menuSections = [
    {
      group: 'OPERASIONAL UTAMA',
      items: [
        {
          id: 'vessel' as ERPModule,
          label: 'Vessel Management',
          desc: 'Data kapal & spesifikasi',
          icon: <Ship size={18} />,
        },
        {
          id: 'ais' as ERPModule,
          label: 'AIS Live Fleet Map',
          desc: 'Radar maritim GIS & ALKI',
          icon: <Compass size={18} />,
        },
        {
          id: 'voyage' as ERPModule,
          label: 'Voyage Management',
          desc: 'Rute, estimasi biaya & clearance',
          icon: <Layers size={18} />,
          badge: pendingClearanceCount > 0 ? `${pendingClearanceCount} Audit` : undefined,
          badgeColor: 'var(--warning)',
        },
        {
          id: 'weather_routing' as ERPModule,
          label: 'AI Weather Routing',
          desc: 'Eco-speed & rute cuaca',
          icon: <Waves size={18} />,
        },
        {
          id: 'spb_generator' as ERPModule,
          label: 'Digital SPB & IMO FAL',
          desc: 'Izin berlayar & sertifikat QR',
          icon: <FileCheck size={18} />,
        },
        {
          id: 'port_call_jit' as ERPModule,
          label: 'Port Call JIT Arrival',
          desc: 'Optimasi kecepatan sandar dermaga',
          icon: <Clock size={18} />,
        },
        {
          id: 'cargo_stowage' as ERPModule,
          label: 'Cargo Bay Plan & IMDG',
          desc: 'Slot kontainer & reefer',
          icon: <Boxes size={18} />,
        },
        {
          id: 'crew' as ERPModule,
          label: 'Crew Management',
          desc: 'Data kru, jadwal & STCW',
          icon: <Users size={18} />,
        },
      ],
    },
    {
      group: 'KOMERSIAL & KEUANGAN',
      items: [
        {
          id: 'chartering' as ERPModule,
          label: 'Chartering & Demurrage',
          desc: 'Kontrak sewa kapal & laytime',
          icon: <FileSpreadsheet size={18} />,
        },
        {
          id: 'crew_payroll' as ERPModule,
          label: 'Crew Payroll (MLC 2006)',
          desc: 'Gaji pelaut & remitan darat',
          icon: <CreditCard size={18} />,
        },
        {
          id: 'finance' as ERPModule,
          label: 'Finance & Accounting',
          desc: 'Biaya operasional (OPEX) & P&L',
          icon: <DollarSign size={18} />,
        },
        {
          id: 'procurement' as ERPModule,
          label: 'Procurement',
          desc: 'Pembelian & PO logistik kapal',
          icon: <ShoppingCart size={18} />,
        },
      ],
    },
    {
      group: 'TEKNIK & PERAWATAN',
      items: [
        {
          id: 'maintenance' as ERPModule,
          label: 'Maintenance (PMS)',
          desc: 'Jadwal PMS & perbaikan kapal',
          icon: <Wrench size={18} />,
          badge: criticalDefectsCount > 0 ? `${criticalDefectsCount} Cacat` : undefined,
          badgeColor: 'var(--danger)',
        },
        {
          id: 'iot_engine' as ERPModule,
          label: 'IoT Engine Telemetry & CBM',
          desc: 'Telemetri 1Hz silinder & getaran',
          icon: <Cpu size={18} />,
        },
        {
          id: 'noon_report' as ERPModule,
          label: 'Daily Noon Report',
          desc: 'Telemetri 24h & biofouling',
          icon: <Clock size={18} />,
        },
        {
          id: 'drydock' as ERPModule,
          label: 'Drydocking & Shipyard',
          desc: 'Survei dok 5 tahunan & tender',
          icon: <Anchor size={18} />,
        },
        {
          id: 'inventory' as ERPModule,
          label: 'Inventory Management',
          desc: 'Spare parts, BBM & persediaan',
          icon: <Boxes size={18} />,
          badge: anomalyCount > 0 ? `${anomalyCount} Anomali` : undefined,
          badgeColor: 'var(--warning)',
        },
      ],
    },
    {
      group: 'HSEQ & LINGKUNGAN',
      items: [
        {
          id: 'cii' as ERPModule,
          label: 'IMO CII Decarbonization',
          desc: 'Rating emisi A-E & EU ETS',
          icon: <Leaf size={18} />,
        },
        {
          id: 'ballast_stability' as ERPModule,
          label: 'Ballast & Ship Stability',
          desc: 'Stabilitas lambung & IMO D-2',
          icon: <Scale size={18} />,
        },
        {
          id: 'hseq' as ERPModule,
          label: 'HSEQ Safety & PSC',
          desc: 'Investigasi insiden & vetting',
          icon: <ShieldAlert size={18} />,
        },
        {
          id: 'piracy_security' as ERPModule,
          label: 'Piracy & HRA Security (BMP5)',
          desc: 'Intelijen perompakan & Citadel',
          icon: <ShieldAlert size={18} />,
        },
        {
          id: 'documents' as ERPModule,
          label: 'Document Management',
          desc: 'Sertifikat kapal & izin SIB',
          icon: <FileText size={18} />,
        },
        {
          id: 'emergency_alarms' as ERPModule,
          label: 'Emergency Alarms',
          desc: 'Pusat darurat maritim & SOS',
          icon: <Bell size={18} />,
          badge: criticalDefectsCount > 0 ? `${criticalDefectsCount} Cacat` : undefined,
          badgeColor: 'var(--danger)',
        },
        {
          id: 'copilot' as ERPModule,
          label: 'Maritime Regulatory Superintendent',
          desc: 'Audit kepatuhan SOLAS, STCW & MARPOL',
          icon: <Bot size={18} />,
          highlight: true,
        },
      ],
    },
  ];

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      background: 'linear-gradient(180deg, #0d1835 0%, #0a1128 100%)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.4rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'rgba(0, 229, 255, 0.12)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-cyan)',
          flexShrink: 0,
        }}>
          <Layers size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.04em', lineHeight: 1.2 }}>
            NAUTICAL ERP
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Enterprise Shipping Suite
          </span>
        </div>
      </div>

      {/* Menu Navigation Items */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {menuSections.map((sec, secIdx) => (
          <div key={secIdx}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#94a3b8',
              padding: '0 0.75rem 0.4rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {sec.group}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {sec.items.map(item => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: isActive
                        ? '1px solid rgba(0, 229, 255, 0.4)'
                        : '1px solid transparent',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(0, 119, 182, 0.35), rgba(0, 229, 255, 0.15))'
                        : item.highlight
                        ? 'rgba(0, 229, 255, 0.05)'
                        : 'transparent',
                      color: isActive
                        ? '#ffffff'
                        : item.highlight
                        ? 'var(--accent-cyan)'
                        : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = item.highlight ? 'rgba(0, 229, 255, 0.05)' : 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{
                        color: isActive ? 'var(--accent-cyan)' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.86rem',
                          fontWeight: isActive ? 700 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          color: '#94a3b8',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.badge ? (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '9999px',
                        background: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255,255,255,0.1)',
                        color: item.badgeColor || '#fff',
                        border: `1px solid ${item.badgeColor || '#fff'}44`,
                      }}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight size={14} color="var(--accent-cyan)" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(0, 0, 0, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
            }} />
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
              System Operational
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>v1.0-mvp</span>
        </div>
      </div>
    </aside>
  );
}
