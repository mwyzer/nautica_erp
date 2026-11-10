import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import KpiGrid from './components/KpiGrid';
import FleetSection from './components/FleetSection';
import VoyagesSection from './components/VoyagesSection';
import ClearanceAuditModal from './components/ClearanceAuditModal';
import BunkerSection from './components/BunkerSection';
import AICopilotSection from './components/AICopilotSection';

export default function App() {
  const [activeTab, setActiveTab] = useState('voyages');
  const [vessels, setVessels] = useState([]);
  const [voyages, setVoyages] = useState([]);
  const [bunkerLogs, setBunkerLogs] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const fetchData = async () => {
    try {
      const [vesselsRes, voyagesRes, bunkerRes] = await Promise.all([
        fetch('/api/v1/vessels').then(r => r.json()),
        fetch('/api/v1/voyages').then(r => r.json()),
        fetch('/api/v1/bunker').then(r => r.json()),
      ]);
      setVessels(vesselsRes);
      setVoyages(voyagesRes);
      setBunkerLogs(bunkerRes);
    } catch (err) {
      console.error('Failed fetching ERP data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuditClick = async (voyageId) => {
    setIsAuditing(true);
    setAuditData(null);
    try {
      const res = await fetch(`/api/v1/agent/audit-voyage/${voyageId}`, { method: 'POST' });
      const data = await res.json();
      setAuditData(data);
      // Refresh voyages to show updated clearance badge
      const updatedVoyages = await fetch('/api/v1/voyages').then(r => r.json());
      setVoyages(updatedVoyages);
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
            onAuditClick={handleAuditClick}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'fleet' && <FleetSection vessels={vessels} />}

        {activeTab === 'bunker' && <BunkerSection bunkerLogs={bunkerLogs} />}

        {activeTab === 'copilot' && <AICopilotSection />}

        <ClearanceAuditModal
          auditData={auditData}
          isLoading={isAuditing}
          onClose={() => setAuditData(null)}
        />
      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '3rem' }}>
        <p>Nautical ERP Automation &copy; 2026 • React + Vite Frontend • Skala MVP Portfolio</p>
      </footer>
    </div>
  );
}
