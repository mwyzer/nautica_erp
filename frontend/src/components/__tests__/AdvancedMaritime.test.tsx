import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IoTEngineSection from '../IoTEngineSection';
import PortCallJITSection from '../PortCallJITSection';
import PiracySecuritySection from '../PiracySecuritySection';
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

const mockTelemetry = {
  vessel_id: 1,
  vessel_name: 'MV Nusantara Pioneer',
  engine_model: 'MAN B&W 6S50ME-C9.5',
  timestamp: '2026-11-10 16:50:00',
  is_engine_running: true,
  engine_rpm: 94.2,
  shaft_power_kw: 8650.0,
  shaft_torque_knm: 876.5,
  sfoc_g_kwh: 171.8,
  sfoc_deviation_percent: 0.2,
  mean_indicated_pressure_bar: 18.4,
  cylinders: [
    { cylinder_num: 1, exhaust_temp_c: 382.5, exhaust_deviation_c: -1.5, p_max_bar: 143.2, p_comp_bar: 119.1, piston_ring_wear_percent: 12.0, status: 'NORMAL' },
    { cylinder_num: 2, exhaust_temp_c: 385.0, exhaust_deviation_c: 1.0, p_max_bar: 142.8, p_comp_bar: 118.9, piston_ring_wear_percent: 14.5, status: 'NORMAL' },
    { cylinder_num: 3, exhaust_temp_c: 384.2, exhaust_deviation_c: 0.2, p_max_bar: 143.0, p_comp_bar: 119.0, piston_ring_wear_percent: 17.0, status: 'NORMAL' },
    { cylinder_num: 4, exhaust_temp_c: 386.1, exhaust_deviation_c: 2.1, p_max_bar: 143.5, p_comp_bar: 119.2, piston_ring_wear_percent: 19.5, status: 'NORMAL' },
    { cylinder_num: 5, exhaust_temp_c: 381.8, exhaust_deviation_c: -2.2, p_max_bar: 142.6, p_comp_bar: 118.8, piston_ring_wear_percent: 22.0, status: 'NORMAL' },
    { cylinder_num: 6, exhaust_temp_c: 387.4, exhaust_deviation_c: 3.4, p_max_bar: 143.8, p_comp_bar: 119.4, piston_ring_wear_percent: 24.5, status: 'NORMAL' },
  ],
  turbocharger: {
    turbo_id: 'T/C-1',
    rpm: 14250,
    scavenge_air_pressure_bar: 2.45,
    air_cooler_dp_bar: 0.08,
    turbine_inlet_temp_c: 412.0,
    turbine_outlet_temp_c: 286.0,
    vibration_rms_mm_s: 1.8,
    status: 'HEALTHY',
  },
  lube_oil: {
    main_bearing_pressure_bar: 4.35,
    oil_temp_c: 47.2,
    viscosity_cst: 126.0,
    water_in_oil_percent: 0.03,
    filter_dp_bar: 0.22,
    status: 'NORMAL',
  },
  vibration: {
    crankshaft_vibration_rms: 2.45,
    bearing_vibration_rms: 2.08,
    iso_10816_class_threshold: 4.5,
    dominant_frequency_hz: 9.4,
    bearing_health_score: 94.0,
    status: 'NORMAL',
  },
  cbm_health_grade: 'A (OPTIMAL)',
  alerts: [],
  maintenance_recommendations: ['Kondisi pembakaran semua silinder seimbang.'],
};

const mockPortCalls = [
  {
    id: 1,
    vessel_id: 1,
    vessel_name: 'MV Nusantara Pioneer',
    voyage_number: 'VOY-2026-NP01',
    destination_port: 'Port of Singapore (PSA Jurong)',
    terminal_berth: 'Berth J04',
    original_eta: '2026-11-11 06:00',
    berth_readiness_time: '2026-11-11 20:30',
    jit_adjusted_eta: '2026-11-11 20:00',
    distance_remaining_nm: 310.0,
    full_ahead_speed_knots: 14.5,
    jit_recommended_speed_knots: 11.2,
    anchorage_waiting_hours_saved: 14.0,
    fuel_saved_mt: 12.8,
    cost_saved_usd: 8256.0,
    co2_reduction_mt: 39.8,
    vts_slot_status: 'CONFIRMED_JIT',
    pilot_booked: true,
    tugs_allocated: 2,
  },
];

const mockThreatMap = {
  hra_zones: [
    {
      zone_id: 'HRA-GULF-ADEN',
      zone_name: 'Gulf of Aden & Southern Red Sea',
      ocean_basin: 'Western Indian Ocean',
      risk_level: 'CRITICAL',
      description: 'Ancaman misil dan perompakan berkecepatan tinggi.',
      recommended_min_speed_knots: 14.5,
      irtc_corridor_active: true,
      ukmto_contact: '+44 2392 222060',
    },
  ],
  recent_incidents: [
    {
      id: 1,
      incident_date: '2026-11-09 03:20',
      location_name: 'Gulf of Aden',
      latitude: 12.45,
      longitude: 46.85,
      vessel_type: 'Product Tanker',
      attack_type: 'Suspicious Skiff Approach',
      countermeasure_applied: 'Water cannon activated',
      outcome: 'ATTACK_REPELLED',
    },
  ],
};

const mockReadiness = {
  vessel_id: 1,
  vessel_name: 'MV Nusantara Pioneer',
  current_threat_zone: 'Selat Malaka & Selat Singapura',
  bmp5_compliance_percent: 95.0,
  razor_wire_installed: true,
  water_cannons_pressurized: true,
  citadel_locked_and_provisioned: true,
  citadel_days_provisions: 7,
  armed_security_onboard: false,
  pcasp_guard_count: 0,
  ais_silent_mode_authorized: true,
  ukmto_transit_registered: true,
  security_drill_last_date: '2026-10-28',
  overall_security_status: 'SECURE',
};

describe('Advanced Maritime Modules', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/iot-engine/telemetry/live')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTelemetry) });
      }
      if (url.includes('/api/v1/port-call-jit/calls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPortCalls) });
      }
      if (url.includes('/api/v1/port-call-jit/optimize')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              jit_speed_knots: 11.2,
              fuel_saved_mt: 12.8,
              cost_saved_usd: 8256.0,
              recommendation: 'Eco-speed optimal',
            }),
        });
      }
      if (url.includes('/api/v1/piracy-security/threat-map')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockThreatMap) });
      }
      if (url.includes('/api/v1/piracy-security/readiness')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockReadiness) });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    }));
  });

  it('renders IoT Engine telemetry, RPM, SFOC, and cylinder schematic', async () => {
    render(<IoTEngineSection vessels={mockVessels} />);

    expect(screen.getByText(/IoT Engine Room Telemetry/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('8,650 kW')).toBeInTheDocument();
      expect(screen.getByText('94.2 RPM')).toBeInTheDocument();
      expect(screen.getByText(/CYLINDER #1/i)).toBeInTheDocument();
      expect(screen.getByText(/CYLINDER #6/i)).toBeInTheDocument();
    });
  });

  it('renders Port Call JIT Arrival and fuel savings', async () => {
    render(<PortCallJITSection />);

    expect(screen.getByText(/Port Call Optimization & Just-In-Time/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/\+\$8,256 USD/).length).toBeGreaterThan(0);
      expect(screen.getByText('14.0 Jam')).toBeInTheDocument();
      expect(screen.getByText('Port of Singapore (PSA Jurong)')).toBeInTheDocument();
    });
  });

  it('renders Piracy Threat Intelligence & BMP5 Hardening checklist', async () => {
    render(<PiracySecuritySection vessels={mockVessels} />);

    expect(screen.getByText(/Piracy & High-Risk Area/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/BMP5 Compliance: 95%/i)).toBeInTheDocument();
      expect(screen.getByText('Gulf of Aden & Southern Red Sea')).toBeInTheDocument();
      expect(screen.getByText(/Suspicious Skiff Approach/i)).toBeInTheDocument();
    });
  });
});
