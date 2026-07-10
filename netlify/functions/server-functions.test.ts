import { afterEach, describe, expect, it, vi } from "vitest";

const stations = require("./stations");
const receiptScan = require("./receipt-scan");
const deleteAccount = require("./delete-account");

const previousEnv = { ...process.env };

function parseBody(response: { body: string }) {
  return JSON.parse(response.body);
}

describe("stations function", () => {
  afterEach(() => {
    process.env = { ...previousEnv };
    vi.unstubAllGlobals();
  });

  it("returns a setup error when the NREL key is missing", async () => {
    delete process.env.NREL_API_KEY;

    const response = await stations.handler({
      httpMethod: "GET",
      queryStringParameters: { location: "Denver, CO" },
    });

    expect(response.statusCode).toBe(500);
    expect(parseBody(response).error).toBe("Station lookup is not configured.");
  });

  it("requires either coordinates or a location", async () => {
    process.env.NREL_API_KEY = "nrel-test-key";

    const response = await stations.handler({
      httpMethod: "GET",
      queryStringParameters: {},
    });

    expect(response.statusCode).toBe(400);
    expect(parseBody(response).error).toBe("Provide latitude/longitude or location.");
  });

  it("proxies bounded station search parameters to NREL", async () => {
    process.env.NREL_API_KEY = "nrel-test-key";
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ fuel_stations: [] }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await stations.handler({
      httpMethod: "GET",
      queryStringParameters: { location: "Denver, CO", radius: "250", limit: "250" },
    });

    expect(response.statusCode).toBe(200);
    const requestedUrl = new URL(fetchMock.mock.calls.at(0)?.at(0) as unknown as string);
    expect(requestedUrl.searchParams.get("api_key")).toBe("nrel-test-key");
    expect(requestedUrl.searchParams.get("fuel_type")).toBe("E85");
    expect(requestedUrl.searchParams.get("location")).toBe("Denver, CO");
    expect(requestedUrl.searchParams.get("radius")).toBe("100");
    expect(requestedUrl.searchParams.get("limit")).toBe("100");
  });
});

describe("receipt-scan function", () => {
  afterEach(() => {
    process.env = { ...previousEnv };
    vi.unstubAllGlobals();
  });

  it("returns a setup error when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    const response = await receiptScan.handler({
      httpMethod: "POST",
      body: JSON.stringify({ imageBase64: "x".repeat(24), mimeType: "image/jpeg" }),
    });

    expect(response.statusCode).toBe(500);
    expect(parseBody(response).error).toBe("Receipt AI is not configured.");
  });

  it("rejects unsupported image types before calling OpenAI", async () => {
    process.env.OPENAI_API_KEY = "openai-test-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await receiptScan.handler({
      httpMethod: "POST",
      body: JSON.stringify({ imageBase64: "x".repeat(24), mimeType: "image/gif" }),
    });

    expect(response.statusCode).toBe(400);
    expect(parseBody(response).error).toBe("Unsupported receipt image type.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("delete-account function", () => {
  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it("returns a setup error when Supabase admin config is missing", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await deleteAccount.handler({
      httpMethod: "POST",
      headers: { authorization: "Bearer session-token" },
      body: JSON.stringify({ confirm: true }),
    });

    expect(response.statusCode).toBe(500);
    expect(parseBody(response).error).toBe("Account deletion is not configured.");
  });

  it("requires a bearer token before deleting anything", async () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const response = await deleteAccount.handler({
      httpMethod: "POST",
      headers: {},
      body: JSON.stringify({ confirm: true }),
    });

    expect(response.statusCode).toBe(401);
    expect(parseBody(response).error).toBe("Missing authorization token.");
  });
});
