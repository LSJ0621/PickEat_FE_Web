import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let initialized = false;
let loadPromise: Promise<{
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
}> | null = null;

function ensureInitialized(): void {
  if (!initialized) {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
      v: 'weekly',
    });
    initialized = true;
  }
}

export function loadGoogleMaps(): Promise<{
  maps: google.maps.MapsLibrary;
  marker: google.maps.MarkerLibrary;
}> {
  if (loadPromise) {
    return loadPromise;
  }

  ensureInitialized();

  loadPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('marker'),
  ]).then(([maps, marker]) => ({ maps, marker }));

  return loadPromise;
}

export function getGoogleMapId(): string {
  return import.meta.env.VITE_GOOGLE_MAP_ID ?? '';
}
