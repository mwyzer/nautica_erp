import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DigitalSPBSection from '../DigitalSPBSection';

describe('DigitalSPBSection Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/v1/spb/records')) {
        return Promise.resolve({
          json: () => Promise.resolve([
            {
              id: 1,
              spb_number: 'SPB-IDJKT-2026-009182',
              vessel_name: 'MV Nusantara Pioneer',
              call_sign: 'YBD22',
              imo_number: 'IMO9812456',
              flag: 'Indonesia',
              master_name: 'Capt. Hendra Gunawan',
              origin_port_name: 'Pelabuhan Tanjung Priok (IDJKT)',
              destination_port_name: 'Port of Singapore (SGSIN)',
              issued_at: '2026-11-10 08:30 WIB',
              valid_until: '2026-11-11 08:30 WIB (24 Jam)',
              syahbandar_authority: 'Kantor Kesyahbandaran Utama Tanjung Priok',
              qr_code_hash: 'HUB-LA-SPB-2026-VERIFIED-9812345-JKT-SIN',
              seaworthiness_status: 'LAIK_LAUT_APPROVED',
              fal_form_1_summary: 'IMO FAL Form 1 General Declaration: Kapal kontainer 28.500 DWT.',
              fal_form_2_cargo: 'IMO FAL Form 2 Cargo: 1.420 TEU / 18.500 MT.',
              fal_form_3_stores: 'IMO FAL Form 3 Ship Stores: VLSFO 145 MT.',
              fal_form_5_crew_count: 22,
            },
          ]),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    }));
  });

  it('renders official Syahbandar certificate and QR code verification badge', async () => {
    render(<DigitalSPBSection />);

    expect(screen.getByText(/Digital SPB/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('SPB-IDJKT-2026-009182')).toBeInTheDocument();
      expect(screen.getByText('SURAT PERSETUJUAN BERLAYAR (SPB)')).toBeInTheDocument();
      expect(screen.getByText('VERIFIKASI KRIPTOGRAFIS')).toBeInTheDocument();
    });
  });

  it('allows switching between IMO FAL forms 1, 2, 3, and 5', async () => {
    render(<DigitalSPBSection />);

    await waitFor(() => {
      expect(screen.getByText('SPB-IDJKT-2026-009182')).toBeInTheDocument();
    });

    // Click Cargo Declaration FAL Form 2
    const fal2Tab = screen.getByRole('button', { name: /FAL 2 \(Cargo\)/i });
    fireEvent.click(fal2Tab);

    expect(screen.getByText(/1.420 TEU/i)).toBeInTheDocument();
  });
});
