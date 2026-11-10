import '@testing-library/jest-dom';

// Mock Leaflet global window.L for test environment
if (typeof window !== 'undefined') {
  (window as any).L = {
    map: () => ({
      setView: () => ({}),
      remove: () => ({}),
    }),
    tileLayer: () => ({
      addTo: () => ({}),
    }),
    marker: () => ({
      addTo: () => ({
        bindPopup: () => ({}),
        on: () => ({}),
      }),
    }),
    divIcon: () => ({}),
    polyline: () => ({
      addTo: () => ({
        bindPopup: () => ({}),
      }),
    }),
  };
}
