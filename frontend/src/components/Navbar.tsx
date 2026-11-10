import React from 'react';
import { Compass } from 'lucide-react';

export default function Navbar(): React.JSX.Element {
  return (
    <header>
      <div className="brand">
        <Compass size={28} color="var(--accent-cyan)" />
        <div>
          <h1>Nautical ERP</h1>
          <span className="tagline">Maritime Operations & AI Superintendent</span>
        </div>
      </div>
      <div className="status-pill online">
        Core Automation Engine Active • Port 8000
      </div>
    </header>
  );
}
