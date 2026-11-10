import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KpiGrid from '../KpiGrid';
import { Vessel, Voyage, BunkerLog } from '../../types';

describe('KpiGrid Component', () => {
  const mockVessels: Vessel[] = [
    { id: 1, imo_number: 'IMO9123456', name: 'MV Vessel A', vessel_type: 'CONTAINER', dwt: 15000, flag_state: 'ID', current_port: 'IDJKT', status: 'ACTIVE', avg_speed_knots: 14, fuel_burn_rate_mt_per_day: 20 },
    { id: 2, imo_number: 'IMO9123457', name: 'MV Vessel B', vessel_type: 'TANKER', dwt: 25000, flag_state: 'ID', current_port: 'IDSUB', status: 'INACTIVE', avg_speed_knots: 12, fuel_burn_rate_mt_per_day: 25 },
  ];

  const mockVoyages: Voyage[] = [
    { id: 1, voyage_number: 'VOY-001', vessel_id: 1, origin_port: 'IDJKT', destination_port: 'SGSIN', distance_nm: 500, departure_time: '2026-11-10T08:00:00Z', estimated_arrival: '2026-11-12T08:00:00Z', cargo_type: 'Containers', cargo_weight_mt: 5000, status: 'IN_PROGRESS', clearance_status: 'PENDING' },
  ];

  const mockBunkerLogs: BunkerLog[] = [
    { id: 1, vessel_id: 1, fuel_type: 'VLSFO', current_rob_mt: 120, daily_consumption_mt: 38, speed_knots: 13, anomaly_flag: true, anomaly_reason: 'High consumption', recorded_at: '2026-11-10T05:00:00Z' },
    { id: 2, vessel_id: 2, fuel_type: 'MGO', current_rob_mt: 80, daily_consumption_mt: 18, speed_knots: 12, anomaly_flag: false, anomaly_reason: '', recorded_at: '2026-11-10T05:00:00Z' },
  ];

  it('renders operational KPIs accurately', () => {
    render(<KpiGrid vessels={mockVessels} voyages={mockVoyages} bunkerLogs={mockBunkerLogs} />);

    // Total vessels metric text and count
    expect(screen.getByText('Armada Aktif')).toBeInTheDocument();
    expect(screen.getByText('/ 2 Kapal')).toBeInTheDocument();

    // Scheduled voyages and pending clearances
    expect(screen.getByText('Pelayaran Terjadwal')).toBeInTheDocument();
    expect(screen.getByText(/pelayaran menunggu otorisasi clearance/i)).toBeInTheDocument();

    // Bunker fuel monitored & anomaly count
    expect(screen.getByText('Bunker Fuel Monitored')).toBeInTheDocument();
    expect(screen.getByText('Anomali Konsumsi BBM')).toBeInTheDocument();
    expect(screen.getByText(/Deviasi konsumsi > 35% terdeteksi radar/i)).toBeInTheDocument();
  });
});
