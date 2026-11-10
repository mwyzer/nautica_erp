import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiGrid from './components/KpiGrid';
import FleetSection from './components/FleetSection';
import VoyagesSection from './components/VoyagesSection';
import ClearanceAuditModal from './components/ClearanceAuditModal';
import BunkerSection from './components/BunkerSection';
import AICopilotSection from './components/AICopilotSection';
import { Vessel, Voyage, BunkerLog, ClearanceAuditResult } from './types';

export default function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'voyages' | 'fleet' | 'bunker' | 'copilot'>('voyages');
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [bunkerLogs, setBunkerLogs] = useState<BunkerLog[]>([]);
  const [auditData, setAuditData] = useState<ClearanceAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const fetchData = async () => {
    try {
      const [vesselsRes, voyagesRes, bunkerRes] = await Promise.all([
        fetch('/api/v1/vessels').then(r => r.json()),
        fetch('/api/v1/voyages').then(r => r.json()),
        fetch('/api/v1/bunker').then(r => r.json()),
      ]);
      setVessels(Array.isArray(vesselsRes) ? vesselsRes : []);
      setVoyages(Array.isArray(voyagesRes) ? voyagesRes : []);
      setBunkerLogs(Array.isArray(bunkerRes) ? bunkerRes : []);
    } catch (err) {
      console.error('Failed fetching ERP data:', err);
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

  return (
    <div>
      <Navbar />
      <main>
        <KpiGrid vessels={vessels} voyages={voyages} bunkerLogs={bunkerLogs} />

        <nav className="nav-tabs" aria-label="Main Navigation">
          <button
            className={`tab-btn ${activeTab === 'voyages' ? 'active' : ''}`}
            onClick={() => setActiveTab('voyages')}
          >
            📋 Pelayaran & AI Clearance
          </button>
          <button
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            🚢 Armada Kapal (Fleet)
          </button>
          <button
            className={`tab-btn ${activeTab === 'bunker' ? 'active' : ''}`}
            onClick={() => setActiveTab('bunker')}
          >
            ⛽ Pemantauan Bunker BBM
          </button>
          <button
            className={`tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            🤖 AI Maritime Co-Pilot
          </button>
        </nav>

        {activeTab === 'voyages' && (
          <VoyagesSection
            voyages={voyages}
            vessels={vessels}
            onAuditClick={handleAuditClick}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetSection
            vessels={vessels}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'bunker' && <BunkerSection bunkerLogs={bunkerLogs} />}

        {activeTab === 'copilot' && <AICopilotSection />}

        <ClearanceAuditModal
          auditData={auditData}
          isLoading={isAuditing}
          onClose={() => setAuditData(null)}
        />
      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '3rem' }}>
        <p>Nautical ERP Automation &copy; 2026 • React + TypeScript + Vite • Skala Enterprise MVP Portfolio</p>
      </footer>
    </div>
  );
}
