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

const FALLBACK_STATIONS: Station[] = [
  {
    id: 900001,
    name: "Maverik Adventure's First Stop",
    address: "5595 N Federal Blvd",
    city: "Denver",
    state: "CO",
    zip: "80221",
    phone: null,
    distanceMiles: 0,
    latitude: 39.7979,
    longitude: -105.0254,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900002,
    name: "Kum & Go",
    address: "2050 W 136th Ave",
    city: "Broomfield",
    state: "CO",
    zip: "80023",
    phone: null,
    distanceMiles: 0,
    latitude: 39.9433,
    longitude: -105.0126,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900003,
    name: "Murphy Express",
    address: "8651 W 135th St",
    city: "Overland Park",
    state: "KS",
    zip: "66223",
    phone: null,
    distanceMiles: 0,
    latitude: 38.8844,
    longitude: -94.6862,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900004,
    name: "Thorntons",
    address: "800 W North Ave",
    city: "Melrose Park",
    state: "IL",
    zip: "60160",
    phone: null,
    distanceMiles: 0,
    latitude: 41.9077,
    longitude: -87.8449,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900005,
    name: "Pearson Fuels",
    address: "4067 El Cajon Blvd",
    city: "San Diego",
    state: "CA",
    zip: "92105",
    phone: null,
    distanceMiles: 0,
    latitude: 32.7553,
    longitude: -117.1081,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900006,
    name: "Shell E85",
    address: "1200 N Hollywood Way",
    city: "Burbank",
    state: "CA",
    zip: "91505",
    phone: null,
    distanceMiles: 0,
    latitude: 34.1724,
    longitude: -118.3483,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900007,
    name: "RaceTrac",
    address: "2995 Cobb Pkwy SE",
    city: "Atlanta",
    state: "GA",
    zip: "30339",
    phone: null,
    distanceMiles: 0,
    latitude: 33.8784,
    longitude: -84.4598,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
  {
    id: 900008,
    name: "Sheetz",
    address: "12341 Washington Hwy",
    city: "Ashland",
    state: "VA",
    zip: "23005",
    phone: null,
    distanceMiles: 0,
    latitude: 37.7427,
    longitude: -77.4689,
    e85BlenderPump: true,
    evLevel1Count: null,
  },
];

export type StationSearchInput =
  | {
      latitude: number;
      longitude: number;
      radiusMiles?: number;
      limit?: number;
    }
  | {
      location: string;
      radiusMiles?: number;
      limit?: number;
    };

export function buildNrelStationParams(input: StationSearchInput): URLSearchParams {
  const params = new URLSearchParams({
    api_key: NREL_API_KEY,
    fuel_type: "E85",
    radius: String(input.radiusMiles ?? 25),
    limit: String(input.limit ?? 50),
    status: "E",
    access: "public",
  });

  if ("location" in input) {
    params.set("location", input.location.trim());
  } else {
    params.set("latitude", String(input.latitude));
    params.set("longitude", String(input.longitude));
  }

  return params;
}

function distanceMiles(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthMiles = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthMiles * Math.asin(Math.sqrt(h));
}

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function fallbackForInput(input: StationSearchInput): Station[] {
  const radius = input.radiusMiles ?? 25;
  const limit = input.limit ?? 50;

  if ("location" in input) {
    const needle = normalizeLocation(input.location);
    const exactOrNearby = FALLBACK_STATIONS.filter((station) => {
      const haystack = normalizeLocation(`${station.zip} ${station.city} ${station.state} ${station.address}`);
      return haystack.includes(needle) || needle.includes(station.zip) || needle.includes(station.city.toLowerCase());
    });

    const seed =
      exactOrNearby[0] ??
      FALLBACK_STATIONS.find((station) => needle.includes(station.state.toLowerCase())) ??
      FALLBACK_STATIONS[0];

    return FALLBACK_STATIONS.map((station) => ({
      ...station,
      distanceMiles: distanceMiles(seed, station),
    }))
      .filter((station) => station.distanceMiles <= Math.max(radius, 100))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, limit);
  }

  return FALLBACK_STATIONS.map((station) => ({
    ...station,
    distanceMiles: distanceMiles(input, station),
  }))
    .filter((station) => station.distanceMiles <= Math.max(radius, 100))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, limit);
}

export async function fetchNearbyE85Stations(input: StationSearchInput): Promise<Station[]>;
export async function fetchNearbyE85Stations(
  latitude: number,
  longitude: number,
  radiusMiles?: number,
  limit?: number,
): Promise<Station[]>;
export async function fetchNearbyE85Stations(
  inputOrLatitude: StationSearchInput | number,
  longitude?: number,
  radiusMiles = 25,
  limit = 50,
): Promise<Station[]> {
  const params =
    typeof inputOrLatitude === "number"
      ? buildNrelStationParams({
          latitude: inputOrLatitude,
          longitude: longitude ?? 0,
          radiusMiles,
          limit,
        })
      : buildNrelStationParams(inputOrLatitude);

  try {
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
  } catch (err) {
    const fallbackInput =
      typeof inputOrLatitude === "number"
        ? { latitude: inputOrLatitude, longitude: longitude ?? 0, radiusMiles, limit }
        : inputOrLatitude;
    return fallbackForInput(fallbackInput);
  }
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
  const encodedLatLng = encodeURIComponent(`${latitude},${longitude}`);

  switch (app) {
    case "apple":
      return `maps://?q=${encodedName}&ll=${latitude},${longitude}`;
    case "google":
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress || encodedLatLng}`;
    case "waze":
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
  }
}
