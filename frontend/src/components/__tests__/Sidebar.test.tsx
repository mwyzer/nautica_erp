import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from '../Sidebar';
import { ERPModule } from '../../types';

describe('Sidebar Component', () => {
  it('renders all key maritime operational sections and menu items', () => {
    const handleSelect = vi.fn();
    render(
      <Sidebar
        activeModule="ais"
        onSelectModule={handleSelect}
        pendingClearanceCount={3}
        anomalyCount={2}
        criticalDefectsCount={1}
      />
    );

    // Verify group headings
    expect(screen.getByText('OPERASIONAL UTAMA')).toBeInTheDocument();
    expect(screen.getByText('KOMERSIAL & KEUANGAN')).toBeInTheDocument();
    expect(screen.getByText('TEKNIK & PERAWATAN')).toBeInTheDocument();
    expect(screen.getByText('HSEQ & LINGKUNGAN')).toBeInTheDocument();

    // Verify key module buttons
    expect(screen.getByText('Vessel Management')).toBeInTheDocument();
    expect(screen.getByText('AIS Live Fleet Map')).toBeInTheDocument();
    expect(screen.getByText('AI Weather Routing')).toBeInTheDocument();
    expect(screen.getByText('Digital SPB & IMO FAL')).toBeInTheDocument();
    expect(screen.getByText('Cargo Bay Plan & IMDG')).toBeInTheDocument();
    expect(screen.getByText('Chartering & Demurrage')).toBeInTheDocument();
    expect(screen.getByText('Crew Payroll (MLC 2006)')).toBeInTheDocument();
    expect(screen.getByText('IMO CII Decarbonization')).toBeInTheDocument();
    expect(screen.getByText('Ballast & Ship Stability')).toBeInTheDocument();
    expect(screen.getByText('Emergency Alarms')).toBeInTheDocument();
  });

  it('triggers onSelectModule callback when clicking a navigation item', () => {
    const handleSelect = vi.fn();
    render(
      <Sidebar
        activeModule="vessel"
        onSelectModule={handleSelect}
      />
    );

    const charteringBtn = screen.getByText('Chartering & Demurrage');
    fireEvent.click(charteringBtn);

    expect(handleSelect).toHaveBeenCalledWith('chartering' as ERPModule);
  });

  it('displays notification badges correctly for alerts', () => {
    const handleSelect = vi.fn();
    render(
      <Sidebar
        activeModule="ais"
        onSelectModule={handleSelect}
        anomalyCount={5}
        pendingClearanceCount={2}
      />
    );

    expect(screen.getByText('5 Anomali')).toBeInTheDocument();
  });
});
