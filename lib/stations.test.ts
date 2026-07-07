import { describe, expect, it, vi } from "vitest";
import {
  buildMapsUrl,
  buildNrelStationParams,
  fetchNearbyE85Stations,
  type Station,
} from "./stations";

const station: Station = {
  id: 42,
  name: "Test E85",
  address: "123 Main St",
  city: "Denver",
  state: "CO",
  zip: "80202",
  phone: null,
  distanceMiles: 3.2,
  latitude: 39.7392,
  longitude: -104.9903,
  e85BlenderPump: true,
  evLevel1Count: null,
};

describe("buildNrelStationParams", () => {
  it("uses coordinates for nearby station search", () => {
    const params = buildNrelStationParams({
      latitude: 39.7,
      longitude: -104.9,
      radiusMiles: 25,
      limit: 12,
    });

    expect(params.get("fuel_type")).toBe("E85");
    expect(params.get("latitude")).toBe("39.7");
    expect(params.get("longitude")).toBe("-104.9");
    expect(params.get("radius")).toBe("25");
    expect(params.get("limit")).toBe("12");
  });

  it("uses a city or zip location for manual station search", () => {
    const params = buildNrelStationParams({
      location: "Denver, CO",
      radiusMiles: 10,
    });

    expect(params.get("location")).toBe("Denver, CO");
    expect(params.has("latitude")).toBe(false);
    expect(params.has("longitude")).toBe(false);
  });
});

describe("buildMapsUrl", () => {
  it("does not use NREL ids as Google place ids", () => {
    const url = buildMapsUrl(station, "google");
    expect(url).toContain("query=");
    expect(url).not.toContain("query_place_id");
  });
});

describe("fetchNearbyE85Stations", () => {
  it("returns manual location search results sorted by NREL distance", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        fuel_stations: [
          {
            id: 42,
            station_name: "Test E85",
            street_address: "123 Main St",
            city: "Denver",
            state: "CO",
            zip: "80202",
            phone: null,
            distance: 3.2,
            latitude: 39.7392,
            longitude: -104.9903,
            e85_blender_pump: true,
            ev_level1_evse_num: null,
          },
        ],
        total_results: 1,
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const results = await fetchNearbyE85Stations({ location: "80202", radiusMiles: 25 });

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Test E85");
    const firstCall = fetchMock.mock.calls[0] as unknown as [string];
    expect(String(firstCall[0])).toContain("location=80202");

    vi.unstubAllGlobals();
  });

  it("falls back to curated E85 stations when NREL cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("DNS failed");
    }));

    const results = await fetchNearbyE85Stations({ location: "80202", radiusMiles: 25 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain("Maverik");
    expect(results[0].state).toBe("CO");

    vi.unstubAllGlobals();
  });
});
