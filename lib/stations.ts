const NREL_API_KEY = "bv0uQsycOr0ou2ID7tsdz8P4zh0Gz1Nc4v2bRBVp";
const NREL_BASE_URL = "https://developer.nrel.gov/api/alt-fuel-stations/v1.json";

export type Station = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  distanceMiles: number;
  latitude: number;
  longitude: number;
  e85BlenderPump: boolean;
  evLevel1Count: number | null;
};

type NRELStation = {
  id: number;
  station_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  distance: number;
  latitude: number;
  longitude: number;
  e85_blender_pump: boolean;
  ev_level1_evse_num: number | null;
};

type NRELResponse = {
  fuel_stations: NRELStation[];
  total_results: number;
};

export async function fetchNearbyE85Stations(
  latitude: number,
  longitude: number,
  radiusMiles = 25,
  limit = 50,
): Promise<Station[]> {
  const params = new URLSearchParams({
    api_key: NREL_API_KEY,
    fuel_type: "E85",
    latitude: String(latitude),
    longitude: String(longitude),
    radius: String(radiusMiles),
    limit: String(limit),
    status: "E",
    access: "public",
  });

  const response = await fetch(`${NREL_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`NREL API error: ${response.status}`);
  }

  const data: NRELResponse = await response.json() as NRELResponse;

  return data.fuel_stations.map((s) => ({
    id: s.id,
    name: s.station_name,
    address: s.street_address,
    city: s.city,
    state: s.state,
    zip: s.zip,
    phone: s.phone,
    distanceMiles: s.distance,
    latitude: s.latitude,
    longitude: s.longitude,
    e85BlenderPump: s.e85_blender_pump,
    evLevel1Count: s.ev_level1_evse_num,
  }));
}

export function getDistanceBadgeColor(distanceMiles: number): string {
  if (distanceMiles <= 5) return "#22c55e";   // green - close
  if (distanceMiles <= 15) return "#f59e0b";  // yellow - moderate
  return "#a1a1a1";                           // grey - far
}

export function buildMapsUrl(station: Station, app: "apple" | "google" | "waze"): string {
  const { latitude, longitude, name, address, city, state } = station;
  const encodedName = encodeURIComponent(name);
  const encodedAddress = encodeURIComponent(`${address}, ${city}, ${state}`);

  switch (app) {
    case "apple":
      return `maps://?q=${encodedName}&ll=${latitude},${longitude}`;
    case "google":
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}&query_place_id=${station.id}`;
    case "waze":
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  }
}
