import { useEffect, useState } from 'react';
import { LINKS } from '../config/links';

/**
 * DTU car parks from the public Sensade API (the source of dtu.sensade.com, linked by the DTU campus app).
 * The API allows any origin (CORS *), so the app reads it directly, also in the static demo build.
 * Live occupancy exists only for the lots with sensors (Koppels Allé A-E); the others have capacity and rules.
 */
export type Campus = 'lyngby' | 'ballerup' | 'riso';
export const CAMPUSES: { key: Campus; label: string }[] = [
  { key: 'lyngby', label: 'Lyngby' },
  { key: 'ballerup', label: 'Ballerup' },
  { key: 'riso', label: 'Risø' },
];

export type CarPark = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  spaces: number;
  /** Free spaces now (sensor lots only), else null. */
  free: number | null;
  freeParking: boolean;
  evSpaces: number;
  handicapSpaces: number;
};

type ApiLot = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  spaceCount: number;
  freeParking: boolean;
  hasLiveData: boolean;
  spaceTypes?: Record<string, number>;
};

/** The three campuses are far apart: latitude is enough (Lyngby ~55.79, Ballerup ~55.73, Risø ~55.69). */
const campusOf = (lat: number): Campus => (lat > 55.75 ? 'lyngby' : lat > 55.715 ? 'ballerup' : 'riso');

const REFRESH_MS = 60_000;

export function useCarParks() {
  const [parks, setParks] = useState<CarPark[] | null>(null);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [lots, status] = await Promise.all([
          fetch(`${LINKS.sensadeApi}/parkinglots`).then((r) => r.json() as Promise<ApiLot[]>),
          fetch(`${LINKS.sensadeApi}/parkinglots/status`).then((r) => r.json() as Promise<{ id: string; status: number }[]>),
        ]);
        const occupancy = Object.fromEntries(status.map((s) => [s.id, s.status]));
        const list = lots.map((l) => {
          const types = Object.fromEntries(Object.entries(l.spaceTypes ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
          const occ = occupancy[l.id];
          return {
            id: l.id,
            name: l.name,
            address: l.address,
            lat: l.latitude,
            lng: l.longitude,
            spaces: l.spaceCount,
            // status = share of occupied spaces (0.96 = 96 % full)
            free: l.hasLiveData && typeof occ === 'number' ? Math.max(0, Math.round(l.spaceCount * (1 - occ))) : null,
            freeParking: l.freeParking,
            evSpaces: types['el car'] ?? 0,
            handicapSpaces: types.handicap ?? 0,
          };
        });
        if (!cancelled) {
          setParks(list);
          setError(false);
          setUpdatedAt(new Date());
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { parks, error, updatedAt, campusOf };
}

/** Directions to a place in the phone's maps app (Google Maps link works on Android, iPhone and desktop). */
export const directionsUrl = (lat: number, lng: number) => `${LINKS.directions}${lat},${lng}`;
