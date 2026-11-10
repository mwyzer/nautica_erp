import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CharteringSection from '../CharteringSection';

describe('CharteringSection Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/chartering/contracts')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              id: 1,
              contract_number: 'CP-2026-088',
              vessel_name: 'MV Nusantara Pioneer',
              charterer_name: 'Trafigura Maritime Pte Ltd',
              contract_type: 'TIME_CHARTER',
              cargo_description: 'Clean Petroleum Products',
              rate_amount_usd: 24500,
              status: 'FIXED_ACTIVE',
            },
          ]),
        });
      }
      if (url.includes('/api/v1/chartering/calculate-laytime')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            result_type: 'DEMURRAGE',
            hours_exceeded: 14.5,
            settlement_amount_usd: 10875.0,
            description: 'Kapal terlambat 14.5 jam. Denda demurrage: $10,875.00 USD.',
          }),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    }));
  });

  it('renders contracts and interactive laytime calculator', async () => {
    render(<CharteringSection />);

    expect(screen.getByText(/Chartering/i)).toBeInTheDocument();
    expect(screen.getByText(/Kalkulator Laytime Pelabuhan/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('CP-2026-088')).toBeInTheDocument();
      expect(screen.getByText('Trafigura Maritime Pte Ltd')).toBeInTheDocument();
    });
  });

  it('calculates demurrage penalty on form submission', async () => {
    render(<CharteringSection />);

    const submitBtn = screen.getByRole('button', { name: /Hitung Neraca Laytime/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/HASIL KLAIM: DEMURRAGE/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$10,875/i).length).toBeGreaterThan(0);
    });
  });
});
