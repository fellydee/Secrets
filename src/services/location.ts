/**
 * User Geolocation Service
 * Requests browser location permission and provides place/coordinates.
 */

export interface LocationResult {
  success: boolean;
  name?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
  error?: string;
}

export async function getCurrentUserLocation(): Promise<LocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return { success: false, error: 'Geolocation is not supported by your device' };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try reverse geocoding via OpenStreetMap Nominatim for clean city/neighborhood name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.suburb || address.county;
            const state = address.state || address.country;
            const placeName = [city, state].filter(Boolean).join(', ');

            if (placeName) {
              resolve({
                success: true,
                name: placeName,
                coords: { latitude, longitude },
              });
              return;
            }
          }
        } catch {
          // Fallback to formatted coordinates
        }

        // Clean coordinate fallback
        const latStr = latitude.toFixed(2);
        const lonStr = longitude.toFixed(2);
        resolve({
          success: true,
          name: `${latStr}°, ${lonStr}°`,
          coords: { latitude, longitude },
        });
      },
      (err) => {
        let msg = 'Could not retrieve location';
        if (err.code === 1) msg = 'Location permission was denied';
        else if (err.code === 2) msg = 'Position unavailable';
        else if (err.code === 3) msg = 'Location request timed out';
        resolve({ success: false, error: msg });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
