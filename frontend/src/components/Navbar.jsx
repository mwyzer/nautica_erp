import React from 'react';
import { Ship, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header>
      <div className="brand">
        <Ship className="logo-icon" color="#00e5ff" size={28} />
        <div>
          <h1>NAUTICAL ERP</h1>
          <span className="tagline">Autonomous Maritime Operations & Clearance Engine (React)</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span className="status-pill online">
          <Activity size={14} /> Sistem Operasional
        </span>
        <span className="status-pill">AI: Gemini 3.8 Flash</span>
        <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="btn" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
          Swagger Docs
        </a>
      </div>
    </header>
  );
}
