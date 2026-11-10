import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BallastStabilitySection from '../BallastStabilitySection';
import { Vessel } from '../../types';

const mockVessels: Vessel[] = [
  {
    id: 1,
    imo_number: 'IMO9876543',
    name: 'MV Nusantara Pioneer',
    vessel_type: 'Bulk Carrier',
    dwt: 32000,
    flag_state: 'IDN',
    status: 'ACTIVE',
    current_port: 'Tanjung Priok',
    avg_speed_knots: 13.5,
    fuel_burn_rate_mt_per_day: 22.5,
  },
];

const mockTanks = [
  { tank_id: 'FPT', tank_name: 'Forepeak Tank (Haluan)', capacity_mt: 350.0, current_mt: 120.0, lcg_m: 55.0, tcg_m: 0.0, vcg_m: 4.5 },
  { tank_id: 'APT', tank_name: 'Aftpeak Tank (Buritan)', capacity_mt: 280.0, current_mt: 180.0, lcg_m: -52.0, tcg_m: 0.0, vcg_m: 5.2 },
  { tank_id: 'WBT_1P', tank_name: 'Wing Ballast 1 Port (Kiri)', capacity_mt: 420.0, current_mt: 240.0, lcg_m: 22.0, tcg_m: -8.5, vcg_m: 3.2 },
  { tank_id: 'WBT_1S', tank_name: 'Wing Ballast 1 Stbd (Kanan)', capacity_mt: 420.0, current_mt: 240.0, lcg_m: 22.0, tcg_m: 8.5, vcg_m: 3.2 },
];

const mockLogs = [
  {
    id: 1,
    vessel_name: 'MV Nusantara Pioneer',
    log_date: '2026-11-08 14:30',
    exchange_method: 'Flow-Through (300% Vol)',
    tank_operated: 'WBT 1P, 1S',
    volume_pumped_m3: 1850.0,
    start_lat: -3.85,
    start_lng: 118.42,
    distance_offshore_nm: 245.0,
    water_depth_m: 1250.0,
    bwms_active: true,
    tro_residual_ppm: 0.08,
    uv_reactor_power_kw: 45.0,
    compliance_standard: 'IMO Reg D-2 (Treated Discharge)',
    port_inspector_status: 'VERIFIED_COMPLIANT',
  },
];

const mockStabilityResult = {
  vessel_id: 1,
  total_displacement_mt: 21740.0,
  gm_solid_m: 2.15,
  gm_fluid_m: 1.84,
  is_gm_compliant: true,
  gm_status: 'OPTIMAL',
  trim_m: 0.65,
  trim_direction: 'BY_STERN',
  is_trim_safe: true,
  list_deg: 0.0,
  list_direction: 'UPRIGHT',
  is_list_safe: true,
  bending_moment_percent: 64.2,
  shear_force_percent: 51.8,
  stress_status: 'SAFE',
  imo_compliance: true,
  recommendations: ['Status stabilitas lambung optimal sesuai standar IMO 2008 Intact Stability Code.'],
};

describe('BallastStabilitySection Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/ballast-stability/tanks/default')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTanks) });
      }
      if (url.includes('/api/v1/ballast-stability/exchange-logs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockLogs) });
      }
      if (url.includes('/api/v1/ballast-stability/calculate')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStabilityResult) });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    }));
  });

  it('renders stability simulator title, GM, trim, list, and BWRB table', async () => {
    render(<BallastStabilitySection vessels={mockVessels} />);

    expect(screen.getByText(/Ballast Water Management/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1.84 m')).toBeInTheDocument();
      expect(screen.getByText('+0.65 m')).toBeInTheDocument();
      expect(screen.getByText('UPRIGHT')).toBeInTheDocument();
      expect(screen.getAllByText(/64\.2%/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Ballast Water Record Book/i)).toBeInTheDocument();
      expect(screen.getByText(/245 NM offshore/i)).toBeInTheDocument();
    });
  });

  it('allows clicking preset buttons to simulate ballast voyage', async () => {
    render(<BallastStabilitySection vessels={mockVessels} />);

    await waitFor(() => {
      expect(screen.getByText('Preset: Ballast Voyage')).toBeInTheDocument();
    });

    const ballastBtn = screen.getByText('Preset: Ballast Voyage');
    fireEvent.click(ballastBtn);

    // Verify fetch was called with calculation
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/ballast-stability/calculate',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
