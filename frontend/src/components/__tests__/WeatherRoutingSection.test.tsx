import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeatherRoutingSection from '../WeatherRoutingSection';

describe('WeatherRoutingSection Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/weather-routing/simulate')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            speed_knots: 11.5,
            duration_hours: 45.7,
            fuel_burn_total_mt: 22.8,
            bunker_cost_usd: 14706.0,
            fuel_saved_mt: 12.6,
            cost_saved_usd: 8127.0,
            co2_avoided_mt: 39.2,
            extra_hours_at_sea: 10.2,
            is_within_laycan: true,
            baseline_fuel_mt: 35.4,
            baseline_cost_usd: 22833.0,
            waypoints: [
              { name: 'WP1 (Tanjung Priok Fairway)', lat: -5.98, lng: 106.88, wind_beaufort: 3 },
            ],
          }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    }));
  });

  it('renders simulation metrics and fuel savings from cubic law', async () => {
    render(<WeatherRoutingSection />);

    expect(screen.getByText(/Weather-Routing/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('POTENSI PENGHEMATAN EFISIENSI AI')).toBeInTheDocument();
      expect(screen.getByText('+$8,127 USD')).toBeInTheDocument();
      expect(screen.getByText(/Hemat 12.6 MT Bahan Bakar/i)).toBeInTheDocument();
    });
  });
});
