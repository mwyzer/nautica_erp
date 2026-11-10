import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Navigation,
  Wind,
  Waves,
  Gauge,
  Thermometer,
  ShieldCheck,
  Play,
  Pause,
  Layers,
  Search,
  Maximize2,
  Anchor,
  Ship,
  Eye,
  Crosshair
} from 'lucide-react';
import { AISVesselData, SeaLane } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

const FALLBACK_VESSELS: AISVesselData[] = [
  {
    vessel_id: 1,
    imo_number: 'IMO9812345',
    mmsi: '525019842',
    call_sign: 'YBD22',
    name: 'MV Nusantara Pioneer',
    vessel_type: 'CONTAINER',
    flag: 'ID',
    lat: -1.85,
    lng: 105.45,
    heading: 335,
    sog_knots: 14.8,
    cog_degrees: 332.0,
    nav_status: 'Under way using engine',
    destination_port: 'SGSIN (Singapore)',
    eta: '2026-11-12T08:00:00Z',
    departure_port: 'IDJKT (Tanjung Priok)',
    cargo: '18,500 MT / 1,420 TEU',
    draft_meters: 11.2,
    main_engine_rpm: 92,
    fuel_burn_mt_day: 23.8,
    weather: {
      sea_state: 'Slight to Moderate',
      wave_height_m: 1.2,
      wind_knots: 14,
      wind_dir: 'SE (135°)',
      air_temp_c: 29.5,
      barometer_hpa: 1011.2,
    },
  },
  {
    vessel_id: 2,
    imo_number: 'IMO9754321',
    mmsi: '525008914',
    call_sign: 'YBC44',
    name: 'MV Barito Leader',
    vessel_type: 'BULK_CARRIER',
    flag: 'ID',
    lat: -5.35,
    lng: 113.8,
    heading: 195,
    sog_knots: 12.1,
    cog_degrees: 198.5,
    nav_status: 'Under way using engine',
    destination_port: 'IDSUB (Tanjung Perak)',
    eta: '2026-11-11T14:30:00Z',
    departure_port: 'IDBDJ (Banjarmasin)',
    cargo: '40,000 MT (Coal in Bulk)',
    draft_meters: 12.8,
    main_engine_rpm: 84,
    fuel_burn_mt_day: 27.5,
    weather: {
      sea_state: 'Smooth to Slight',
      wave_height_m: 0.8,
      wind_knots: 9,
      wind_dir: 'E (090°)',
      air_temp_c: 31.0,
      barometer_hpa: 1012.0,
    },
  },
  {
    vessel_id: 3,
    imo_number: 'IMO9654987',
    mmsi: '525091726',
    call_sign: 'YBE88',
    name: 'MT Samudra Jaya',
    vessel_type: 'TANKER',
    flag: 'ID',
    lat: -1.26,
    lng: 116.83,
    heading: 85,
    sog_knots: 0.1,
    cog_degrees: 88.0,
    nav_status: 'At anchor',
    destination_port: 'IDJKT (Tanjung Priok)',
    eta: '2026-11-15T18:00:00Z',
    departure_port: 'IDBPN (Balikpapan)',
    cargo: '35,000 MT (Clean Petroleum Products)',
    draft_meters: 9.5,
    main_engine_rpm: 0,
    fuel_burn_mt_day: 3.2,
    weather: {
      sea_state: 'Calm (Roadstead)',
      wave_height_m: 0.3,
      wind_knots: 5,
      wind_dir: 'NE (045°)',
      air_temp_c: 30.2,
      barometer_hpa: 1010.8,
    },
  },
];

const SEA_LANES_DATA: SeaLane[] = [
  {
    id: 'ALKI-1',
    name: 'ALKI I (Sunda Strait — Karimata — Natuna)',
    coordinates: [
      [-5.92, 105.85],
      [-3.1, 106.8],
      [-0.5, 107.5],
      [2.5, 108.5],
    ],
    type: 'ARCHIPELAGIC_SEA_LANE',
    color: '#00e5ff',
  },
  {
    id: 'ALKI-2',
    name: 'ALKI II (Lombok — Makassar Strait — Celebes)',
    coordinates: [
      [-8.75, 115.75],
      [-4.5, 117.5],
      [-1.25, 117.2],
      [1.0, 119.5],
      [3.5, 122.0],
    ],
    type: 'ARCHIPELAGIC_SEA_LANE',
    color: '#00b4d8',
  },
  {
    id: 'MALACCA-TSS',
    name: 'Malacca Strait Traffic Separation Scheme',
    coordinates: [
      [5.5, 95.5],
      [3.0, 100.5],
      [1.25, 103.8],
      [1.05, 104.25],
    ],
    type: 'TSS_CORRIDOR',
    color: '#10b981',
  },
  {
    id: 'JAVA-SEA-TRUNK',
    name: 'Jalur Utama Laut Jawa (Jakarta — Surabaya)',
    coordinates: [
      [-6.1, 106.88],
      [-5.8, 109.5],
      [-6.7, 112.5],
      [-7.2, 112.74],
    ],
    type: 'DOMESTIC_TRUNK',
    color: '#f59e0b',
  },
];

export default function AISMapSection(): React.JSX.Element {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});
  const polylinesRef = useRef<any[]>([]);

  const [vessels, setVessels] = useState<AISVesselData[]>(FALLBACK_VESSELS);
  const [selectedVessel, setSelectedVessel] = useState<AISVesselData | null>(FALLBACK_VESSELS[0]);
  const [showSeaLanes, setShowSeaLanes] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch real AIS data from API if available
  const fetchAISData = async () => {
    try {
      const res = await fetch('/api/v1/ais/live');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setVessels(data);
          if (!selectedVessel) setSelectedVessel(data[0]);
        }
      }
    } catch (err) {
      console.warn('API AIS fetch fallback to built-in telemetry:', err);
    }
  };

  useEffect(() => {
    fetchAISData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if (typeof window !== 'undefined' && window.L) {
      const L = window.L;

      // Center around Java Sea / Indonesia maritime crossroads
      const map = L.map(mapContainerRef.current, {
        center: [-3.0, 114.0],
        zoom: 5.5,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark Matter CartoDB Basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }
  }, []);

  // Draw or update Sea Lanes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear old polylines
    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    if (showSeaLanes) {
      SEA_LANES_DATA.forEach(lane => {
        const polyline = L.polyline(lane.coordinates, {
          color: lane.color,
          weight: 2.5,
          opacity: 0.65,
          dashArray: '8, 8',
        }).addTo(map);

        polyline.bindTooltip(
          `<div style="font-size:0.75rem; font-weight:700; color:${lane.color};">${lane.name}</div>`,
          { sticky: true, className: 'nautical-map-tooltip' }
        );

        polylinesRef.current.push(polyline);
      });
    }
  }, [showSeaLanes, mapLoaded]);

  // Update Vessel Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    vessels.forEach(v => {
      const isSelected = selectedVessel?.vessel_id === v.vessel_id;
      const vesselColor =
        v.vessel_type === 'CONTAINER'
          ? '#00e5ff'
          : v.vessel_type === 'TANKER'
          ? '#f43f5e'
          : '#f59e0b';

      const iconHtml = `
        <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
          ${
            v.nav_status.includes('Under way')
              ? `<div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${vesselColor}; opacity:0.25; animation:pulse-ring 2s infinite ease-out;"></div>`
              : ''
          }
          <div style="transform: rotate(${v.heading}deg); transition: transform 0.5s ease; filter: drop-shadow(0 0 6px ${vesselColor});">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${vesselColor}">
              <path d="M12 2L4 21L12 17L20 21L12 2Z" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          ${
            isSelected
              ? `<div style="position:absolute; width:40px; height:40px; border:2px dashed #ffffff; border-radius:50%;"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'ais-vessel-marker',
        html: iconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (markersRef.current[v.vessel_id]) {
        markersRef.current[v.vessel_id].setLatLng([v.lat, v.lng]);
        markersRef.current[v.vessel_id].setIcon(customIcon);
      } else {
        const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedVessel(v);
        });

        marker.bindTooltip(
          `
          <div style="font-family:inherit; padding:4px 6px;">
            <div style="font-weight:700; color:#fff;">${v.name}</div>
            <div style="font-size:0.75rem; color:#94a3b8;">${v.sog_knots} kts • HDG ${v.heading}°</div>
          </div>
        `,
          { direction: 'top', offset: [0, -14], className: 'nautical-map-tooltip' }
        );

        markersRef.current[v.vessel_id] = marker;
      }
    });
  }, [vessels, selectedVessel, mapLoaded]);

  // Center map on selected vessel
  const handleCenterVessel = (v: AISVesselData) => {
    setSelectedVessel(v);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([v.lat, v.lng], 8, { duration: 1.2 });
    }
  };

  // Live simulation tick interval
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/v1/ais/simulate-tick', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            if (data.vessels) {
              setVessels(data.vessels);
              if (selectedVessel) {
                const updated = data.vessels.find((x: any) => x.vessel_id === selectedVessel.vessel_id);
                if (updated) setSelectedVessel(updated);
              }
            }
          } else {
            // Frontend fallback tick simulation
            setVessels(prev =>
              prev.map(v => {
                if (v.nav_status.includes('Under way')) {
                  return {
                    ...v,
                    lat: Number((v.lat + (v.vessel_id === 1 ? 0.04 : -0.03)).toFixed(4)),
                    lng: Number((v.lng + (v.vessel_id === 1 ? -0.02 : -0.015)).toFixed(4)),
                  };
                }
                return v;
              })
            );
          }
        } catch (e) {
          // Fallback simulation
          setVessels(prev =>
            prev.map(v => {
              if (v.nav_status.includes('Under way')) {
                return {
                  ...v,
                  lat: Number((v.lat + 0.02).toFixed(4)),
                  lng: Number((v.lng - 0.015).toFixed(4)),
                };
              }
              return v;
            })
          );
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating, selectedVessel]);

  const underWayCount = vessels.filter(v => v.nav_status.includes('Under way')).length;
  const atAnchorCount = vessels.filter(v => v.nav_status.includes('anchor')).length;
  const avgFleetSpeed = (
    vessels.reduce((acc, curr) => acc + curr.sog_knots, 0) / (vessels.length || 1)
  ).toFixed(1);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Control Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-card)',
          padding: '1.25rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-main)',
            }}
          >
            <Compass size={24} color="var(--accent-cyan)" /> AIS Live Fleet Tracking & Interactive Maritime GIS
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Pemantauan posisi satelit AIS real-time, telemetri SOG/COG, Alur Laut Kepulauan Indonesia (ALKI), dan cuaca maritim.
          </p>
        </div>

        {/* Map Control Buttons */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowSeaLanes(!showSeaLanes)}
            className={`btn ${showSeaLanes ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '36px' }}
          >
            <Layers size={14} /> {showSeaLanes ? 'Sembunyikan ALKI' : 'Tampilkan ALKI'}
          </button>

          <button
            onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
            className={`btn ${showWeatherOverlay ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '36px' }}
          >
            <Waves size={14} /> Cuaca & Ombak
          </button>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
            style={{
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              height: '36px',
              fontWeight: 700,
            }}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            {isSimulating ? 'Jeda Radar AIS' : 'Simulasi Gerak Kapal'}
          </button>
        </div>
      </div>

      {/* Quick Telemetry KPI Badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kapal Terpantau AIS</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            {vessels.length} Kapal
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>100% Sinyal Transponder Terbaca</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Berlayar di Laut Bebas (Under Way)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.2rem' }}>
            {underWayCount} Kapal
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Rata-rata kecepatan {avgFleetSpeed} kts</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Labuh Jangkar (At Anchor)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--warning)', marginTop: '0.2rem' }}>
            {atAnchorCount} Kapal
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Menunggu antrean dermaga / bunker</span>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Koridor Maritim Aktif</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: '0.2rem' }}>
            ALKI I &amp; II + TSS
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Kondisi alur navigasi normal</span>
        </div>
      </div>

      {/* Main Map View & Vessel Inspector Split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '1.25rem',
          minHeight: '620px',
        }}
      >
        {/* Map Container */}
        <div
          style={{
            background: '#0a1128',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '620px',
              background: '#0a1128',
            }}
          />

          {/* Map Compass Rose / Legend Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              zIndex: 400,
              background: 'rgba(13, 24, 53, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: '#f8fafc',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '2px' }}>
              LEGENDA ARMADA AIS
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00e5ff' }} />
              <span>Kapal Peti Kemas (Container)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
              <span>Kapal Curah Kering (Bulk Carrier)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f43f5e' }} />
              <span>Kapal Tanker Minyak (Tanker)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px' }}>
              <span style={{ width: '16px', height: '2px', background: '#00e5ff', display: 'inline-block' }} />
              <span>Jalur ALKI &amp; TSS Malaka</span>
            </div>
          </div>
        </div>

        {/* Selected Vessel Live Inspector Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header Panel */}
          <div
            style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'linear-gradient(180deg, rgba(20, 40, 80, 0.95), rgba(16, 31, 66, 0.8))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  TELEMETRI KAPAL AIS
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {selectedVessel?.name || 'Pilih Kapal'}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {selectedVessel?.imo_number} • MMSI: {selectedVessel?.mmsi} • Call Sign: {selectedVessel?.call_sign}
                </span>
              </div>

              {selectedVessel && (
                <button
                  onClick={() => handleCenterVessel(selectedVessel)}
                  className="btn btn-outline"
                  title="Pusatkan posisi peta ke kapal ini"
                  style={{ padding: '6px', height: 'auto', borderRadius: '8px' }}
                >
                  <Crosshair size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Ship List Selector */}
          <div
            style={{
              display: 'flex',
              padding: '0.65rem 0.85rem',
              gap: '0.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.15)',
              overflowX: 'auto',
            }}
          >
            {vessels.map(v => (
              <button
                key={v.vessel_id}
                onClick={() => handleCenterVessel(v)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border:
                    selectedVessel?.vessel_id === v.vessel_id
                      ? '1px solid var(--accent-cyan)'
                      : '1px solid transparent',
                  background:
                    selectedVessel?.vessel_id === v.vessel_id
                      ? 'rgba(0, 229, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: selectedVessel?.vessel_id === v.vessel_id ? '#ffffff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.name.replace('MV ', '').replace('MT ', '')}
              </button>
            ))}
          </div>

          {/* Detailed Telemetry Body */}
          {selectedVessel ? (
            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Dynamic Status Pill */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: selectedVessel.nav_status.includes('Under way')
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                  border: selectedVessel.nav_status.includes('Under way')
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedVessel.nav_status.includes('Under way') ? (
                    <Navigation size={16} color="var(--success)" />
                  ) : (
                    <Anchor size={16} color="var(--warning)" />
                  )}
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                    {selectedVessel.nav_status}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {selectedVessel.vessel_type}
                </span>
              </div>

              {/* Navigation Data Grid */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  NAVIGASI &amp; GERAK KAPAL
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginTop: '0.4rem',
                  }}
                >
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Speed (SOG)</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {selectedVessel.sog_knots} <span style={{ fontSize: '0.8rem' }}>kts</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Course (COG)</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedVessel.cog_degrees}°
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Heading</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {selectedVessel.heading}°
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.65rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Main Engine RPM</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>
                      {selectedVessel.main_engine_rpm} RPM
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates & Route */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  KOORDINAT GPS &amp; RUTE
                </span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.4rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Latitude / Longitude:</span>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {selectedVessel.lat.toFixed(4)}° / {selectedVessel.lng.toFixed(4)}°
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Asal / Tujuan:</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {selectedVessel.departure_port.split(' ')[0]} → {selectedVessel.destination_port.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Muatan Cargo:</span>
                    <span style={{ fontWeight: 600 }}>{selectedVessel.cargo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Sarat Kapal (Draft):</span>
                    <span style={{ fontWeight: 600 }}>{selectedVessel.draft_meters} meter</span>
                  </div>
                </div>
              </div>

              {/* Real-time Marine Weather at Vessel Coordinates */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  KONDISI CUACA MARITIM DI LOKASI
                </span>
                <div
                  style={{
                    background: 'linear-gradient(145deg, rgba(0, 119, 182, 0.15), rgba(16, 31, 66, 0.4))',
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    marginTop: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <Waves size={15} color="var(--accent-cyan)" /> Tinggi Ombak
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      {selectedVessel.weather.wave_height_m} m ({selectedVessel.weather.sea_state})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <Wind size={15} color="var(--accent-teal)" /> Angin &amp; Arah
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      {selectedVessel.weather.wind_knots} kts • {selectedVessel.weather.wind_dir}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                      <Gauge size={15} color="#94a3b8" /> Barometer Udara
                    </span>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      {selectedVessel.weather.barometer_hpa} hPa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              Pilih salah satu kapal di peta untuk melihat telemetri navigasi dan radar cuaca.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
