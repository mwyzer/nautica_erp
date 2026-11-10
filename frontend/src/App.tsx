import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KpiGrid from './components/KpiGrid';
import FleetSection from './components/FleetSection';
import VoyagesSection from './components/VoyagesSection';
import CrewSection from './components/CrewSection';
import MaintenanceSection from './components/MaintenanceSection';
import InventorySection from './components/InventorySection';
import ProcurementSection from './components/ProcurementSection';
import FinanceSection from './components/FinanceSection';
import DocumentSection from './components/DocumentSection';
import AISMapSection from './components/AISMapSection';
import CIIDecarbSection from './components/CIIDecarbSection';
import CharteringSection from './components/CharteringSection';
import NoonReportSection from './components/NoonReportSection';
import HSEQSection from './components/HSEQSection';
import DrydockSection from './components/DrydockSection';
import WeatherRoutingSection from './components/WeatherRoutingSection';
import DigitalSPBSection from './components/DigitalSPBSection';
import CargoStowageSection from './components/CargoStowageSection';
import CrewPayrollSection from './components/CrewPayrollSection';
import EmergencyAlarmSection from './components/EmergencyAlarmSection';
import BallastStabilitySection from './components/BallastStabilitySection';
import IoTEngineSection from './components/IoTEngineSection';
import PortCallJITSection from './components/PortCallJITSection';
import PiracySecuritySection from './components/PiracySecuritySection';
import AICopilotSection from './components/AICopilotSection';
import ClearanceAuditModal from './components/ClearanceAuditModal';
import {
  Vessel,
  Voyage,
  BunkerLog,
  CrewMember,
  MaintenanceTicket,
  ERPModule,
  ClearanceAuditResult,
} from './types';
import { RefreshCw, Bell, ShieldCheck } from 'lucide-react';

export default function App(): React.JSX.Element {
  const [activeModule, setActiveModule] = useState<ERPModule>('vessel');
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [bunkerLogs, setBunkerLogs] = useState<BunkerLog[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [auditData, setAuditData] = useState<ClearanceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [vesselsRes, voyagesRes, bunkerRes, crewRes, maintRes] = await Promise.all([
        fetch('/api/v1/vessels').then(r => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/v1/voyages').then(r => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/v1/bunker').then(r => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/v1/crew').then(r => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/v1/maintenance').then(r => (r.ok ? r.json() : [])).catch(() => []),
      ]);

      setVessels(Array.isArray(vesselsRes) ? vesselsRes : []);
      setVoyages(Array.isArray(voyagesRes) ? voyagesRes : []);
      setBunkerLogs(Array.isArray(bunkerRes) ? bunkerRes : []);
      setCrew(Array.isArray(crewRes) ? crewRes : []);
      setMaintenanceTickets(Array.isArray(maintRes) ? maintRes : []);
    } catch (err) {
      console.error('Failed fetching ERP data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuditClick = async (voyageId: number) => {
    setIsAuditing(true);
    setAuditData(null);
    try {
      const res = await fetch(`/api/v1/agent/audit-voyage/${voyageId}`, { method: 'POST' });
      const data: ClearanceAuditResult = await res.json();
      setAuditData(data);
      // Refresh voyages to show updated clearance badge
      const updatedVoyages = await fetch('/api/v1/voyages').then(r => r.json());
      setVoyages(Array.isArray(updatedVoyages) ? updatedVoyages : []);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const pendingClearances = voyages.filter(v => v.clearance_status === 'PENDING').length;
  const bunkerAnomalies = bunkerLogs.filter(b => b.anomaly_flag).length;
  const criticalDefects = maintenanceTickets.filter(
    m => m.status !== 'RESOLVED' && (m.severity === 'CRITICAL' || m.severity === 'HIGH')
  ).length;

  const getModuleTitle = (mod: ERPModule) => {
    switch (mod) {
      case 'vessel':
        return {
          title: 'Vessel Management',
          desc: 'Data kapal, spesifikasi teknis, DWT, dan status operasional armada',
        };
      case 'crew':
        return {
          title: 'Crew Management',
          desc: 'Data kru kapal, jadwal penugasan kerja, dan kepatuhan sertifikasi STCW',
        };
      case 'maintenance':
        return {
          title: 'Maintenance Management',
          desc: 'Jadwal Planned Maintenance System (PMS) dan perbaikan kerusakan kapal',
        };
      case 'inventory':
        return {
          title: 'Inventory Management',
          desc: 'Suku cadang permesinan, persediaan minyak lumas, dan stok bunker BBM',
        };
      case 'procurement':
        return {
          title: 'Procurement',
          desc: 'Manajemen pembelian kebutuhan kapal & purchase order supplier logistik',
        };
      case 'finance':
        return {
          title: 'Finance & Accounting',
          desc: 'Biaya operasional (OPEX), Port Disbursement Accounts (PDA), dan Laba/Rugi pelayaran',
        };
      case 'voyage':
        return {
          title: 'Voyage Management',
          desc: 'Rute pelayaran, estimasi biaya voyage, jadwal keberangkatan & AI Port Clearance',
        };
      case 'documents':
        return {
          title: 'Document Management',
          desc: 'Sertifikat statutory kapal, dokumen STCW awak kapal, dan izin operasional (SIB/SPB)',
        };
      case 'ais':
        return {
          title: 'AIS Live Fleet Map & Maritime GIS',
          desc: 'Radar pemantauan armada kapal, koridor ALKI, dan telemetri satelit AIS real-time',
        };
      case 'cii':
        return {
          title: 'IMO Decarbonization & CII Rating',
          desc: 'Pengawasan emisi MARPOL Annex VI, Carbon Intensity Indicator Rating A-E & EU ETS',
        };
      case 'chartering':
        return {
          title: 'Commercial Chartering & Demurrage',
          desc: 'Manajemen kontrak sewa kapal (CP) & kalkulator perhitungan laytime demurrage/despatch',
        };
      case 'noon_report':
        return {
          title: 'Daily Noon Report & Telemetry',
          desc: 'Laporan tengah hari 24 jam Chief Engineer & pemantauan degradasi biofouling lambung',
        };
      case 'hseq':
        return {
          title: 'HSEQ Safety & Port State Control (PSC)',
          desc: 'Manajemen keselamatan ISM Code, investigasi insiden near-miss & kesiapan inspeksi PSC',
        };
      case 'drydock':
        return {
          title: 'Drydocking & Shipyard Projects',
          desc: 'Perencanaan dok 5 tahunan (Special Survey), spesifikasi teknis & perbandingan tender galangan',
        };
      case 'weather_routing':
        return {
          title: 'AI Weather Routing & Eco Speed',
          desc: 'Optimasi kecepatan jelajah baling-baling, penghematan BBM ribuan dolar & penghindaran gelombang badai',
        };
      case 'spb_generator':
        return {
          title: 'Digital SPB & IMO FAL Forms',
          desc: 'Surat Persetujuan Berlayar resmi Syahbandar dengan stempel digital kelaiklautan & QR Code',
        };
      case 'cargo_stowage':
        return {
          title: 'Cargo Stowage & Container Bay Plan',
          desc: 'Grid penataan kontainer 2D, pemantauan alarm temperatur reefer & segregasi IMDG Code',
        };
      case 'crew_payroll':
        return {
          title: 'Maritime Crew Payroll & Remittance',
          desc: 'Penggajian awak kapal internasional berbasis MLC 2006 & transfer remitan keluarga di darat',
        };
      case 'emergency_alarms':
        return {
          title: 'Maritime Emergency Alarm Center',
          desc: 'Pusat peringatan darurat maritim: krisis kekurangan BBM, kebocoran kemudi SOLAS & badai',
        };
      case 'ballast_stability':
        return {
          title: 'Ballast Water Management & Ship Stability Simulator (IMO D-2)',
          desc: 'Kalkulator stabilitas utuh (GM, Trim, List, Bending Moment) & logbook pertukaran air balas internasional',
        };
      case 'iot_engine':
        return {
          title: 'IoT Engine Room Telemetry & Condition-Based Monitoring (CBM)',
          desc: 'Telemetri 1Hz termal silinder 1-6, turbocharger, getaran ISO 10816 & SFOC baling-baling',
        };
      case 'port_call_jit':
        return {
          title: 'Port Call Optimization & Just-In-Time (JIT) Arrival Engine',
          desc: 'Sinkronisasi kecepatan Virtual Arrival dengan slot dermaga VTS & eliminasi waktu lego jangkar',
        };
      case 'piracy_security':
        return {
          title: 'Piracy & High-Risk Area (HRA) Security Intelligence (BMP5 / IMB)',
          desc: 'Radar ancaman perompakan IMB, koridor IRTC, pengerasan fisik BMP5 & prosedur Citadel',
        };
      case 'copilot':
        return {
          title: 'Maritime Regulatory Superintendent',
          desc: 'Audit kepatuhan regulasi IMO SOLAS, STCW, MARPOL & ISM Code',
        };
      default:
        return { title: 'Maritime ERP', desc: 'Sistem Operasional Kapal Terpadu' };
    }
  };

  const activeModuleMeta = getModuleTitle(activeModule);

  return (
    <div className="erp-layout">
      {/* 1. Left Enterprise Navigation Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        pendingClearanceCount={pendingClearances}
        anomalyCount={bunkerAnomalies}
        criticalDefectsCount={criticalDefects}
      />

      {/* 2. Main Content Area */}
      <div className="erp-main-content">
        {/* Top Header Bar */}
        <header className="erp-topbar">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Nautical Enterprise Suite &gt;
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                {activeModuleMeta.title}
              </span>
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {activeModuleMeta.title}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px', fontSize: '0.82rem' }}
              title="Sinkronisasi data sistem"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Sinkronisasi...' : 'Segarkan Data'}
            </button>

            <div className="status-pill online" style={{ height: '38px' }}>
              <ShieldCheck size={14} color="var(--success)" />
              <span>Core Engine Port 8000</span>
            </div>

            {/* Emergency Alarm Quick Bell */}
            <button
              onClick={() => setActiveModule('emergency_alarms')}
              className="btn btn-outline"
              style={{
                position: 'relative',
                padding: '8px',
                height: '38px',
                width: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: criticalDefects > 0 || bunkerAnomalies > 0 ? '1px solid var(--danger)' : '1px solid var(--border-color)',
                color: criticalDefects > 0 || bunkerAnomalies > 0 ? 'var(--danger)' : 'var(--text-muted)',
              }}
              title="Pusat Peringatan Darurat Maritim"
            >
              <Bell size={18} />
              {(criticalDefects > 0 || bunkerAnomalies > 0) && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {criticalDefects + bunkerAnomalies}
                </span>
              )}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                paddingLeft: '0.75rem',
                borderLeft: '1px solid var(--border-color)',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0077b6, #00e5ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#ffffff',
                }}
              >
                SP
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  Superintendent
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Fleet Command</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Inner Body */}
        <main className="erp-page-body">
          {/* Dynamic Top Overview KPI Cards */}
          <KpiGrid vessels={vessels} voyages={voyages} bunkerLogs={bunkerLogs} />

          {/* Active Module Renderer */}
          {activeModule === 'vessel' && (
            <FleetSection vessels={vessels} onRefresh={fetchData} />
          )}

          {activeModule === 'crew' && (
            <CrewSection crew={crew} vessels={vessels} onRefresh={fetchData} />
          )}

          {activeModule === 'maintenance' && (
            <MaintenanceSection
              tickets={maintenanceTickets}
              vessels={vessels}
              onRefresh={fetchData}
            />
          )}

          {activeModule === 'inventory' && (
            <InventorySection bunkerLogs={bunkerLogs} vessels={vessels} />
          )}

          {activeModule === 'procurement' && (
            <ProcurementSection vessels={vessels} />
          )}

          {activeModule === 'finance' && (
            <FinanceSection voyages={voyages} vessels={vessels} />
          )}

          {activeModule === 'voyage' && (
            <VoyagesSection
              voyages={voyages}
              vessels={vessels}
              onAuditClick={handleAuditClick}
              onRefresh={fetchData}
            />
          )}

          {activeModule === 'documents' && (
            <DocumentSection vessels={vessels} />
          )}

          {activeModule === 'ais' && (
            <AISMapSection />
          )}

          {activeModule === 'cii' && (
            <CIIDecarbSection />
          )}

          {activeModule === 'chartering' && (
            <CharteringSection />
          )}

          {activeModule === 'noon_report' && (
            <NoonReportSection vessels={vessels} />
          )}

          {activeModule === 'hseq' && (
            <HSEQSection />
          )}

          {activeModule === 'drydock' && (
            <DrydockSection />
          )}

          {activeModule === 'weather_routing' && (
            <WeatherRoutingSection />
          )}

          {activeModule === 'spb_generator' && (
            <DigitalSPBSection />
          )}

          {activeModule === 'cargo_stowage' && (
            <CargoStowageSection />
          )}

          {activeModule === 'crew_payroll' && (
            <CrewPayrollSection />
          )}

          {activeModule === 'emergency_alarms' && (
            <EmergencyAlarmSection />
          )}

          {activeModule === 'ballast_stability' && (
            <BallastStabilitySection vessels={vessels} />
          )}

          {activeModule === 'iot_engine' && (
            <IoTEngineSection vessels={vessels} />
          )}

          {activeModule === 'port_call_jit' && (
            <PortCallJITSection />
          )}

          {activeModule === 'piracy_security' && (
            <PiracySecuritySection vessels={vessels} />
          )}

          {activeModule === 'copilot' && (
            <AICopilotSection />
          )}
        </main>
      </div>

      {/* Port Clearance AI Audit Modal */}
      {(auditData || isAuditing) && (
        <ClearanceAuditModal
          auditData={auditData}
          isLoading={isAuditing}
          onClose={() => setAuditData(null)}
        />
      )}
    </div>
  );
}
